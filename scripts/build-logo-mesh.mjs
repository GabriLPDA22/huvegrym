/**
 * Genera la malla del logotipo para la escena WebGL del hero.
 *
 *   npm run mesh
 *
 * Lee el trazado SVG de src/assets/brand-wordmark.json, aplana las curvas, une
 * los trazos superpuestos, resta los huecos de las letras (B, O, R, A, D…) y
 * triangula la cara frontal con earcut. El resultado (src/assets/logo-mesh.json) se versiona: el cliente
 * solo tiene que levantar las paredes de la extrusión, sin triangular nada.
 *
 * Formato (coordenadas enteras, 1 unidad = 1/SCALE del viewBox, origen arriba-izda):
 *   w, h   tamaño del logotipo
 *   s      factor de escala de las coordenadas
 *   v      [x0, y0, x1, y1, …]  vértices
 *   i      índices de los triángulos de la cara frontal
 *   c      [inicio, n, inicio, n, …]  contornos cerrados (rangos de vértices);
 *          exteriores en un sentido y huecos en el contrario
 */
import { readFileSync, writeFileSync } from 'node:fs';
import earcut from 'earcut';
import polygonClipping from 'polygon-clipping';

const SRC = new URL('../src/assets/brand-wordmark.json', import.meta.url);
const OUT = new URL('../src/assets/logo-mesh.json', import.meta.url);
const SCALE = 10; // décimas de unidad
const TOLERANCE = 0.12; // desviación máxima al aplanar curvas (unidades del viewBox)

const { viewBox, d } = JSON.parse(readFileSync(SRC, 'utf8'));
const [ox, oy, width, height] = viewBox.split(' ').map(Number);

// ---------- 1. Trazado SVG → contornos poligonales ----------
const ARITY = { M: 2, L: 2, H: 1, V: 1, C: 6, Z: 0 };
const tokens = d.match(/[MLHVCZ]|-?\d*\.?\d+(?:e-?\d+)?/g);

function flattenCubic(p0, p1, p2, p3, out, depth = 0) {
  // Distancia de los puntos de control a la cuerda: criterio de planitud
  const dx = p3[0] - p0[0];
  const dy = p3[1] - p0[1];
  const len = Math.hypot(dx, dy) || 1;
  const d1 = Math.abs((p1[0] - p0[0]) * dy - (p1[1] - p0[1]) * dx) / len;
  const d2 = Math.abs((p2[0] - p0[0]) * dy - (p2[1] - p0[1]) * dx) / len;
  if (depth > 10 || Math.max(d1, d2) <= TOLERANCE) {
    out.push(p3);
    return;
  }
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const p01 = mid(p0, p1);
  const p12 = mid(p1, p2);
  const p23 = mid(p2, p3);
  const p012 = mid(p01, p12);
  const p123 = mid(p12, p23);
  const m = mid(p012, p123);
  flattenCubic(p0, p01, p012, m, out, depth + 1);
  flattenCubic(m, p123, p23, p3, out, depth + 1);
}

const contours = [];
let current = null;
let pos = [0, 0];
let cmd = null;
for (let t = 0; t < tokens.length; ) {
  if (/[A-Z]/.test(tokens[t])) cmd = tokens[t++];
  const n = ARITY[cmd];
  const a = tokens.slice(t, t + n).map(Number);
  t += n;
  switch (cmd) {
    case 'M':
      current = [[a[0], a[1]]];
      contours.push(current);
      pos = [a[0], a[1]];
      cmd = 'L'; // pares implícitos tras M son líneas
      break;
    case 'L':
      pos = [a[0], a[1]];
      current.push(pos);
      break;
    case 'H':
      pos = [a[0], pos[1]];
      current.push(pos);
      break;
    case 'V':
      pos = [pos[0], a[0]];
      current.push(pos);
      break;
    case 'C':
      flattenCubic(pos, [a[0], a[1]], [a[2], a[3]], [a[4], a[5]], current);
      pos = [a[4], a[5]];
      break;
    case 'Z':
      pos = current[0];
      break;
  }
}

// Cuantiza, pasa a origen (0,0) y elimina puntos repetidos o colineales
const q = (v) => Math.round(v * SCALE);
const loops = contours
  .map((c) => {
    const pts = c.map(([x, y]) => [q(x - ox), q(y - oy)]);
    const out = [];
    for (const p of pts) {
      const last = out[out.length - 1];
      if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
    }
    if (out.length > 1 && out[0][0] === out[out.length - 1][0] && out[0][1] === out[out.length - 1][1]) out.pop();
    return out.filter((p, k) => {
      const a = out[(k - 1 + out.length) % out.length];
      const b = out[(k + 1) % out.length];
      return (p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0]) !== 0;
    });
  })
  .filter((c) => c.length >= 3);

// ---------- 2. Unión de trazos (regla nonzero) ----------
// Algunas letras están dibujadas con trazos superpuestos (la barra de la A, la
// pata de la R). Un contorno con el mismo sentido que los exteriores suma; uno
// con sentido contrario es un hueco. Resultado = unión(sólidos) − unión(huecos).
const area = (c) => c.reduce((s, p, k) => s + p[0] * c[(k + 1) % c.length][1] - c[(k + 1) % c.length][0] * p[1], 0) / 2;
const biggest = loops.reduce((a, b) => (Math.abs(area(a)) > Math.abs(area(b)) ? a : b));
const solidSign = Math.sign(area(biggest));
const close = (c) => [[...c, c[0]]];
const solids = loops.filter((c) => Math.sign(area(c)) === solidSign).map(close);
const voids = loops.filter((c) => Math.sign(area(c)) !== solidSign).map(close);
const merged = polygonClipping.union(...solids);
const shapes = voids.length ? polygonClipping.difference(merged, ...voids) : merged;

// ---------- 3. Triangulación ----------
const v = [];
const idx = [];
const ranges = [];
const pushLoop = (ring, wantPositive) => {
  const c = ring.slice(0, -1).map(([x, y]) => [Math.round(x), Math.round(y)]);
  const oriented = area(c) > 0 === wantPositive ? c : [...c].reverse();
  const start = v.length / 2;
  for (const p of oriented) v.push(p[0], p[1]);
  ranges.push(start, oriented.length);
  return start;
};

let holes = 0;
for (const [outer, ...inner] of shapes) {
  const base = v.length / 2;
  pushLoop(outer, true);
  const holeStarts = inner.map((h) => pushLoop(h, false) - base);
  holes += inner.length;
  const flat = v.slice(base * 2);
  for (const t of earcut(flat, holeStarts)) idx.push(t + base);
}

const mesh = { w: q(width), h: q(height), s: SCALE, v, i: idx, c: ranges };
writeFileSync(OUT, JSON.stringify(mesh));

console.log(
  `logo-mesh.json · ${v.length / 2} vértices · ${idx.length / 3} triángulos · ${ranges.length / 2} contornos (${holes} huecos) · ${(
    JSON.stringify(mesh).length / 1024
  ).toFixed(1)} KB`,
);
