/**
 * Escena 3D del hero (WebGL puro, sin librerías).
 *
 *   fondo (plano lejano) · logotipo extruido (malla) · intérprete (plano cercano)
 *   · polvo en suspensión con profundidad de campo
 *
 * - Se carga en diferido (import dinámico tras la carga de la página): no pesa
 *   en el primer render ni en el LCP, que sigue siendo la imagen del DOM.
 * - Usa la MISMA cámara que el DOM (.hero__world): 1 unidad = 1 px CSS en el plano
 *   del logotipo, así el relevo DOM → WebGL es un fundido sin saltos.
 * - La cámara se balancea con el ratón, el giroscopio o sola; el scroll es un
 *   travelling real hacia atrás.
 * - Solo arranca con aceleración por hardware (failIfMajorPerformanceCaveat): en
 *   un equipo que emula WebGL por software se queda la versión DOM.
 * - Calidad adaptativa: si el dispositivo no mantiene el ritmo baja resolución y
 *   partículas y, en último caso, devuelve el control a la versión DOM.
 */
import mesh from '@/assets/logo-mesh.json';

export interface HeroGL {
  /** Progreso de scroll del hero (0–1) y si el vídeo final ya tapa la escena. */
  update(p: number, covered: boolean): void;
  setVisible(visible: boolean): void;
  resize(): void;
}

interface Options {
  hero: HTMLElement;
  sticky: HTMLElement;
  canvas: HTMLCanvasElement;
  /** Forzar la escena aunque el rendimiento medido sea bajo (?gl=1). */
  force: boolean;
  /** Cámara quieta y sin animación de entrada (?gl=still), para comparar con el DOM. */
  still: boolean;
  /** Se llama si la escena se desactiva (contexto perdido o equipo sin potencia). */
  onFallback: () => void;
}

// ---------- Cámara ----------
const FOV = (35 * Math.PI) / 180;
const TAN_HALF_FOV = Math.tan(FOV / 2);
const FINAL_MAX_WIDTH = 1180; // igual que .hero__logo
// Balanceo de cámara (fracción de la distancia focal) y giro propio del logotipo
const SWAY_X = 0.05;
const SWAY_Y = 0.022;
const LOGO_YAW = 0.2;
const LOGO_PITCH = 0.11;
const PLATE_BLEED = 1.04; // margen del fondo para que el balanceo no enseñe bordes

const INK = [12 / 255, 11 / 255, 10 / 255] as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const nextTask = () => new Promise<void>((r) => setTimeout(r));

// ---------- Shaders ----------
const QUAD_VS = `
attribute vec2 aPos;
uniform mat4 uVP;
uniform vec4 uRect; // centro (xy) y tamaño (zw) en unidades de mundo
uniform float uZ;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x, 1.0 - aPos.y);
  gl_Position = uVP * vec4(uRect.xy + (aPos - 0.5) * uRect.zw, uZ, 1.0);
}`;

const QUAD_FS = `
precision mediump float;
uniform sampler2D uTex;
uniform float uFade; // fundido del borde superior (0 = sin fundido)
uniform float uCut;  // descarta píxeles casi transparentes (para escribir profundidad)
varying vec2 vUv;
void main() {
  vec4 c = texture2D(uTex, vUv);
  if (c.a < uCut) discard;
  float f = uFade > 0.0 ? clamp(vUv.y / uFade, 0.0, 1.0) : 1.0;
  gl_FragColor = c * f;
}`;

const LOGO_VS = `
attribute vec3 aPos;    // x,y centrados y normalizados al ancho; z = 0 (frente) … -1 (fondo)
attribute vec3 aNormal;
attribute float aSide;  // 0 cara frontal · 1 pared
uniform mat4 uVP;
uniform mat3 uRot;
uniform vec3 uCenter;
uniform float uWidth;
uniform float uDepth;
varying vec3 vN;
varying float vSide;
varying float vBack;
void main() {
  vec3 local = vec3(aPos.xy * uWidth, aPos.z * uDepth);
  vN = uRot * aNormal;
  vSide = aSide;
  vBack = -aPos.z;
  gl_Position = uVP * vec4(uCenter + uRot * local, 1.0);
}`;

const LOGO_FS = `
precision mediump float;
uniform float uOpacity;
varying vec3 vN;
varying float vSide;
varying float vBack;
void main() {
  vec3 n = normalize(vN);
  // Frente: el mismo color hueso que el logotipo del DOM (relevo sin salto)
  vec3 front = vec3(0.937, 0.910, 0.863) * (0.9 + 0.1 * n.z);
  // Paredes: bronce iluminado desde arriba, más oscuro hacia el fondo
  float l = dot(n, normalize(vec3(-0.35, 0.8, 0.45))) * 0.5 + 0.5;
  vec3 side = mix(vec3(0.13, 0.10, 0.06), vec3(0.88, 0.73, 0.47), l * l) * mix(1.0, 0.5, vBack);
  vec3 col = mix(front, side, step(0.5, vSide));
  gl_FragColor = vec4(col * uOpacity, uOpacity);
}`;

const DUST_VS = `
attribute vec4 aSeed;
uniform mat4 uVP;
uniform vec3 uBox;   // semiejes del volumen
uniform float uTime;
uniform float uFocus; // distancia al plano enfocado
uniform float uPx;    // px de dispositivo por px CSS
uniform float uGain;
varying float vAlpha;
void main() {
  vec3 p = (aSeed.xyz * 2.0 - 1.0) * uBox;
  float w = aSeed.w;
  p.y = mod(p.y + uTime * (5.0 + 16.0 * w) + uBox.y, 2.0 * uBox.y) - uBox.y;
  p.x += sin(uTime * (0.18 + 0.3 * w) + w * 43.0) * 26.0;
  p.z += cos(uTime * 0.13 + w * 17.0) * 30.0;
  gl_Position = uVP * vec4(p, 1.0);
  float dist = max(gl_Position.w, 1.0);
  // Círculo de confusión: lejos del plano enfocado, más grande y más tenue
  float coc = abs(dist - uFocus) / uFocus;
  float size = (1.2 + 2.6 * fract(w * 7.31)) * uFocus / dist;
  gl_PointSize = min(size * (1.0 + coc * 9.0), 46.0) * uPx;
  vAlpha = uGain * (0.25 + 0.75 * fract(w * 3.7)) / (1.0 + coc * coc * 42.0);
}`;

const DUST_FS = `
precision mediump float;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.12, d) * vAlpha;
  gl_FragColor = vec4(vec3(0.98, 0.86, 0.66) * a, 0.0);
}`;

// ---------- Utilidades WebGL ----------
type GL = WebGLRenderingContext | WebGL2RenderingContext;

function program(gl: GL, vs: string, fs: string) {
  const p = gl.createProgram()!;
  for (const [type, src] of [
    [gl.VERTEX_SHADER, vs],
    [gl.FRAGMENT_SHADER, fs],
  ] as const) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    gl.attachShader(p, s);
  }
  gl.linkProgram(p);
  return p;
}

function locations<U extends string, A extends string>(gl: GL, p: WebGLProgram, uniforms: readonly U[], attrs: readonly A[]) {
  const u = {} as Record<U, WebGLUniformLocation | null>;
  const a = {} as Record<A, number>;
  for (const name of uniforms) u[name] = gl.getUniformLocation(p, name);
  for (const name of attrs) a[name] = gl.getAttribLocation(p, name);
  return { p, u, a };
}

/** Malla del logotipo: cara frontal triangulada en build + paredes de la extrusión. */
function buildLogoGeometry() {
  const { v, i, c, w, h } = mesh as { v: number[]; i: number[]; c: number[]; w: number; h: number };
  const n = v.length / 2;
  const edges = n; // cada vértice inicia una arista de su contorno
  const STRIDE = 7; // pos(3) normal(3) lado(1)
  const data = new Float32Array((n + edges * 4) * STRIDE);
  const index = new Uint16Array(i.length + edges * 6);
  const px = (k: number) => v[k * 2]! / w - 0.5;
  const py = (k: number) => (h / 2 - v[k * 2 + 1]!) / w; // y hacia arriba

  let o = 0;
  const put = (x: number, y: number, z: number, nx: number, ny: number, nz: number, side: number) => {
    data.set([x, y, z, nx, ny, nz, side], o);
    o += STRIDE;
  };
  for (let k = 0; k < n; k++) put(px(k), py(k), 0, 0, 0, 1, 0);
  index.set(i);

  let vi = n;
  let ii = i.length;
  const SMOOTH = Math.cos((40 * Math.PI) / 180);
  for (let r = 0; r < c.length; r += 2) {
    const start = c[r]!;
    const count = c[r + 1]!;
    const at = (k: number) => start + ((k + count) % count);
    // Normal exterior de cada arista. Los contornos exteriores van en sentido
    // horario (con y hacia arriba) y los huecos al revés: el sólido queda siempre
    // a la derecha, así que la normal exterior es la perpendicular izquierda.
    const en: [number, number][] = [];
    for (let k = 0; k < count; k++) {
      const dx = px(at(k + 1)) - px(at(k));
      const dy = py(at(k + 1)) - py(at(k));
      const len = Math.hypot(dx, dy) || 1;
      en.push([-dy / len, dx / len]);
    }
    for (let k = 0; k < count; k++) {
      const a = at(k);
      const b = at(k + 1);
      const cur = en[k]!;
      const prev = en[(k - 1 + count) % count]!;
      const next = en[(k + 1) % count]!;
      // En curvas se suavizan las normales; en esquinas se mantienen duras
      const blend = (m: [number, number]): [number, number] => {
        if (m[0] * cur[0] + m[1] * cur[1] < SMOOTH) return cur;
        const x = m[0] + cur[0];
        const y = m[1] + cur[1];
        const len = Math.hypot(x, y) || 1;
        return [x / len, y / len];
      };
      const na = blend(prev);
      const nb = blend(next);
      put(px(a), py(a), 0, na[0], na[1], 0, 1);
      put(px(b), py(b), 0, nb[0], nb[1], 0, 1);
      put(px(b), py(b), -1, nb[0], nb[1], 0, 1);
      put(px(a), py(a), -1, na[0], na[1], 0, 1);
      index.set([vi, vi + 1, vi + 2, vi, vi + 2, vi + 3], ii);
      vi += 4;
      ii += 6;
    }
  }
  return { data, index, stride: STRIDE, aspect: h / w };
}

// ---------- Matrices (column-major) ----------
function perspective(out: Float32Array, aspect: number, near: number, far: number) {
  const f = 1 / TAN_HALF_FOV;
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
}

/** Vista × proyección de una cámara en `eye` que mira al origen (y arriba). */
function viewProjection(out: Float32Array, proj: Float32Array, ex: number, ey: number, ez: number) {
  // Base de la cámara
  let zx = ex,
    zy = ey,
    zz = ez;
  const zl = Math.hypot(zx, zy, zz);
  zx /= zl;
  zy /= zl;
  zz /= zl;
  let xx = zz,
    xz = -zx; // x = up(0,1,0) × z
  const xl = Math.hypot(xx, xz);
  xx /= xl;
  xz /= xl;
  const yx = zy * xz,
    yy = zz * xx - zx * xz,
    yz = -zy * xx; // y = z × x
  const tx = -(xx * ex + xz * ez);
  const ty = -(yx * ex + yy * ey + yz * ez);
  const tz = -(zx * ex + zy * ey + zz * ez);
  // view (column-major): columnas = (xx,yx,zx,0) (0,yy,zy,0) (xz,yz,zz,0) (tx,ty,tz,1)
  const v = [xx, yx, zx, 0, 0, yy, zy, 0, xz, yz, zz, 0, tx, ty, tz, 1];
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += proj[k * 4 + row]! * v[col * 4 + k]!;
      out[col * 4 + row] = sum;
    }
  }
}

/** Rotación Ry(yaw) · Rx(pitch) como mat3 column-major. */
function rotation(out: Float32Array, yaw: number, pitch: number) {
  const cy = Math.cos(yaw),
    sy = Math.sin(yaw),
    cx = Math.cos(pitch),
    sx = Math.sin(pitch);
  out.set([cy, 0, -sy, sy * sx, cx, cy * sx, sy * cx, -sx, cy * cx]);
}

// ---------- Escena ----------
export async function createHeroGL({ hero, sticky, canvas, force, still, onFallback }: Options): Promise<HeroGL | null> {
  const attrs: WebGLContextAttributes = {
    alpha: false,
    antialias: true,
    depth: true,
    stencil: false,
    preserveDrawingBuffer: false,
    // Sin GPU real (WebGL emulado por software) el contexto no se crea y se
    // mantiene la versión DOM: emular esta escena bloquearía el hilo principal.
    failIfMajorPerformanceCaveat: !force && !still,
  };
  const gl = (canvas.getContext('webgl2', attrs) ?? canvas.getContext('webgl', attrs)) as GL | null;
  if (!gl) return null;
  // Algunos navegadores emulan WebGL por software sin declararlo como "lento":
  // se detecta por el nombre del renderizador (SwiftShader, llvmpipe, WARP…).
  if (!force && !still) {
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) return null;
  }
  const isGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
  await nextTask();

  // --- Programas ---
  // Consultar LINK_STATUS bloquea hasta que el driver termina de compilar. Con
  // KHR_parallel_shader_compile se espera sin bloquear el hilo principal.
  const quadP = program(gl, QUAD_VS, QUAD_FS);
  const logoP = program(gl, LOGO_VS, LOGO_FS);
  const dustP = program(gl, DUST_VS, DUST_FS);
  const programs = [quadP, logoP, dustP];
  const parallel = gl.getExtension('KHR_parallel_shader_compile') as { COMPLETION_STATUS_KHR: number } | null;
  if (parallel) {
    const deadline = performance.now() + 4000;
    while (
      performance.now() < deadline &&
      !programs.every((p) => gl.getProgramParameter(p, parallel.COMPLETION_STATUS_KHR))
    ) {
      await new Promise((r) => setTimeout(r, 16));
    }
  } else {
    await nextTask();
  }
  if (!programs.every((p) => gl.getProgramParameter(p, gl.LINK_STATUS))) return null;

  const quad = locations(gl, quadP, ['uVP', 'uRect', 'uZ', 'uTex', 'uFade', 'uCut'] as const, ['aPos'] as const);
  const logo = locations(
    gl,
    logoP,
    ['uVP', 'uRot', 'uCenter', 'uWidth', 'uDepth', 'uOpacity'] as const,
    ['aPos', 'aNormal', 'aSide'] as const,
  );
  const dust = locations(gl, dustP, ['uVP', 'uBox', 'uTime', 'uFocus', 'uPx', 'uGain'] as const, ['aSeed'] as const);

  // --- Geometría ---
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);

  const geo = buildLogoGeometry();
  const logoBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, logoBuf);
  gl.bufferData(gl.ARRAY_BUFFER, geo.data, gl.STATIC_DRAW);
  const logoIdx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, logoIdx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.index, gl.STATIC_DRAW);

  const coarse = matchMedia('(pointer: coarse)').matches;
  // Fondo de la extrusión respecto al ancho del logotipo: en pantallas pequeñas
  // el logotipo mide pocos px y necesita más fondo para leerse como volumen.
  const extrude = coarse ? 0.1 : 0.06;
  let dustCount = coarse ? 420 : 900;
  const seeds = new Float32Array(dustCount * 4);
  for (let k = 0; k < seeds.length; k++) seeds[k] = Math.random();
  const dustBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, dustBuf);
  gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
  await nextTask();

  // --- Texturas: las mismas imágenes que ya ha descargado el DOM ---
  const plateImg = hero.querySelector<HTMLImageElement>('[data-hero-plate] img');
  const dancerImg = hero.querySelector<HTMLImageElement>('[data-hero-dancer] img');
  const plateEl = hero.querySelector<HTMLElement>('[data-hero-plate]');
  const dancerEl = hero.querySelector<HTMLElement>('[data-hero-dancer]');
  const bgWorld = hero.querySelector<HTMLElement>('[data-hero-world="bg"]');
  const fgWorld = hero.querySelector<HTMLElement>('[data-hero-world="fg"]');
  if (!plateImg || !dancerImg || !plateEl || !dancerEl || !bgWorld || !fgWorld) return null;

  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);

  const textures = new Map<HTMLImageElement, { tex: WebGLTexture; src: string }>();
  async function upload(img: HTMLImageElement) {
    if (!img.complete || !img.naturalWidth) await img.decode().catch(() => undefined);
    const src = img.currentSrc;
    let source: TexImageSource = img;
    if ('createImageBitmap' in window) {
      // Decodificación fuera del hilo principal
      source = await createImageBitmap(img, { premultiplyAlpha: 'premultiply', colorSpaceConversion: 'none' }).catch(
        () => img,
      );
    }
    const entry = textures.get(img) ?? { tex: gl!.createTexture()!, src: '' };
    gl!.bindTexture(gl!.TEXTURE_2D, entry.tex);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, source);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    if (isGL2) {
      gl!.generateMipmap(gl!.TEXTURE_2D);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR_MIPMAP_LINEAR);
    } else {
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    }
    if ('close' in source) source.close();
    entry.src = src;
    textures.set(img, entry);
  }
  await upload(plateImg);
  await nextTask();
  await upload(dancerImg);
  await nextTask();

  // --- Estado ---
  const proj = new Float32Array(16);
  const vp = new Float32Array(16);
  const rot = new Float32Array(9);
  const cs = getComputedStyle(hero);
  const num = (el: Element, name: string, fallback: number) => parseFloat(getComputedStyle(el).getPropertyValue(name)) || fallback;

  let vw = 1,
    vh = 1,
    d0 = 1,
    dpr = Math.min(window.devicePixelRatio || 1, 2);
  let dolly = 0.08,
    fBg = 1.5,
    fFg = 0.7;
  let logoW = 1,
    logoShift = 0,
    logoY = 0.46,
    finalY = 0.46,
    plateFade = 0;
  // Cajas del DOM en reposo (px CSS, relativas al centro del viewport, y hacia arriba)
  const plateRect = [0, 0, 1, 1];
  const dancerRect = [0, 0, 1, 1];

  let p = 0;
  let covered = false;
  let visible = true;
  let alive = true;
  let raf = 0;
  let last = 0;
  let time = 0;
  let started = 0;
  // Balanceo: objetivo (ratón / giroscopio) y valor suavizado
  let aimX = 0,
    aimY = 0,
    swayX = 0,
    swayY = 0;
  // Sin ratón ni giroscopio la escena se mece sola con más amplitud
  let lastInput = -1e9;
  let idleAmp = 1;

  function measure() {
    vw = sticky.clientWidth;
    vh = sticky.clientHeight;
    d0 = vh / 2 / TAN_HALF_FOV;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    perspective(proj, vw / vh, d0 * 0.05, d0 * 3);

    dolly = parseFloat(cs.getPropertyValue('--dolly')) || 0.08;
    fBg = num(bgWorld!, '--f', 1.5);
    fFg = num(fgWorld!, '--f', 0.7);
    logoW = Math.min((vw * (parseFloat(cs.getPropertyValue('--logo-w')) || 90)) / 100, FINAL_MAX_WIDTH);
    logoShift = parseFloat(cs.getPropertyValue('--logo-shift')) || 0;
    logoY = (parseFloat(cs.getPropertyValue('--logo-y')) || 46) / 100;
    finalY = (parseFloat(cs.getPropertyValue('--final-y')) || 46) / 100;
    plateFade = parseFloat(cs.getPropertyValue('--plate-fade')) || 0;

    // Las capas del DOM están escaladas por el travelling: se deshace para obtener
    // su caja en reposo y colocarlas a su profundidad real.
    const k = dolly * (1 - clamp01(p / 0.28));
    const origin = sticky.getBoundingClientRect();
    const rest = (el: Element, f: number, out: number[]) => {
      const r = el.getBoundingClientRect();
      const s = f / (f - k);
      out[0] = (r.left + r.width / 2 - origin.left - vw / 2) / s;
      out[1] = -(r.top + r.height / 2 - origin.top - vh / 2) / s;
      out[2] = r.width / s;
      out[3] = r.height / s;
    };
    rest(plateEl!, fBg, plateRect);
    rest(dancerEl!, fFg, dancerRect);

    // Si cambia el encuadre (vertical ↔ horizontal) el navegador cambia de imagen
    for (const [img, entry] of textures) if (img.currentSrc !== entry.src) void upload(img);
  }

  function drawQuad(tex: WebGLTexture, rect: number[], f: number, bleed: number, fade: number, cut: number) {
    // A profundidad z = d0·(1−f) un objeto necesita medir f veces su tamaño en pantalla
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.uniform4f(quad.u.uRect, rect[0]! * f, rect[1]! * f, rect[2]! * f * bleed, rect[3]! * f * bleed);
    gl!.uniform1f(quad.u.uZ, d0 * (1 - f));
    gl!.uniform1f(quad.u.uFade, fade);
    gl!.uniform1f(quad.u.uCut, cut);
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
  }

  function draw(now: number) {
    const a = clamp01(p / 0.28);
    const b = clamp01((p - 0.28) / 0.08);
    const c = clamp01((p - 0.8) / 0.15);
    const m = clamp01((p - 0.28) / 0.52);
    const intro = still ? 1 : easeOutCubic(clamp01((now - started) / 1800));

    // Balanceo: vivo al principio, casi quieto cuando el logotipo pasa a ser máscara
    const amp = still ? 0 : intro * (0.3 + 0.7 * (1 - a)) * (1 - b * 0.6);
    const sx = clamp(swayX + Math.sin(time * 0.42) * 0.75 * idleAmp, -1, 1) * amp;
    const sy = clamp(swayY + Math.cos(time * 0.31) * 0.5 * idleAmp, -1, 1) * amp;

    viewProjection(vp, proj, sx * SWAY_X * d0, -sy * SWAY_Y * d0, d0 * (1 - dolly * (1 - a)));

    gl!.depthMask(true); // necesario para que clear() limpie la profundidad
    gl!.clearColor(INK[0], INK[1], INK[2], 1);
    gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);
    gl!.enable(gl!.BLEND);
    gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);

    // 1 · Fondo
    gl!.useProgram(quad.p);
    gl!.uniformMatrix4fv(quad.u.uVP, false, vp);
    gl!.uniform1i(quad.u.uTex, 0);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, quadBuf);
    gl!.enableVertexAttribArray(quad.a.aPos);
    gl!.vertexAttribPointer(quad.a.aPos, 2, gl!.FLOAT, false, 0, 0);
    gl!.disable(gl!.DEPTH_TEST);
    gl!.depthMask(false);
    drawQuad(textures.get(plateImg!)!.tex, plateRect, fBg, PLATE_BLEED, plateFade, 0);
    gl!.disableVertexAttribArray(quad.a.aPos);

    // 2 · Logotipo extruido (misma posición que .hero__logo)
    const opacity = 1 - b + 0.28 * c;
    if (opacity > 0.003) {
      gl!.useProgram(logo.p);
      gl!.enable(gl!.DEPTH_TEST);
      gl!.depthMask(true);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, logoBuf);
      gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, logoIdx);
      const bytes = geo.stride * 4;
      gl!.enableVertexAttribArray(logo.a.aPos);
      gl!.enableVertexAttribArray(logo.a.aNormal);
      gl!.enableVertexAttribArray(logo.a.aSide);
      gl!.vertexAttribPointer(logo.a.aPos, 3, gl!.FLOAT, false, bytes, 0);
      gl!.vertexAttribPointer(logo.a.aNormal, 3, gl!.FLOAT, false, bytes, 12);
      gl!.vertexAttribPointer(logo.a.aSide, 1, gl!.FLOAT, false, bytes, 24);
      // El giro propio entra con una pequeña floritura y se apaga antes del relevo a la máscara
      rotation(rot, sx * LOGO_YAW - (1 - intro) * 0.5, sy * LOGO_PITCH);
      const yDom = vh * (logoY + (finalY - logoY) * m) + 0.05 * vh * (a - m);
      gl!.uniformMatrix4fv(logo.u.uVP, false, vp);
      gl!.uniformMatrix3fv(logo.u.uRot, false, rot);
      gl!.uniform3f(logo.u.uCenter, logoShift * logoW, vh / 2 - yDom, 0);
      gl!.uniform1f(logo.u.uWidth, logoW);
      gl!.uniform1f(logo.u.uDepth, logoW * extrude * intro * (1 - b));
      gl!.uniform1f(logo.u.uOpacity, opacity);
      gl!.drawElements(gl!.TRIANGLES, geo.index.length, gl!.UNSIGNED_SHORT, 0);
      gl!.disableVertexAttribArray(logo.a.aPos);
      gl!.disableVertexAttribArray(logo.a.aNormal);
      gl!.disableVertexAttribArray(logo.a.aSide);
    }

    // 3 · Intérprete, por delante del logotipo
    gl!.useProgram(quad.p);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, quadBuf);
    gl!.enableVertexAttribArray(quad.a.aPos);
    gl!.vertexAttribPointer(quad.a.aPos, 2, gl!.FLOAT, false, 0, 0);
    gl!.enable(gl!.DEPTH_TEST);
    gl!.depthMask(true);
    drawQuad(textures.get(dancerImg!)!.tex, dancerRect, fFg, 1, 0, 0.35);
    gl!.depthMask(false);
    drawQuad(textures.get(dancerImg!)!.tex, dancerRect, fFg, 1, 0, 0); // borde suavizado
    gl!.disableVertexAttribArray(quad.a.aPos);

    // 4 · Polvo en la luz (aditivo; respeta la profundidad de logotipo e intérprete)
    gl!.useProgram(dust.p);
    gl!.blendFunc(gl!.ONE, gl!.ONE);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, dustBuf);
    gl!.enableVertexAttribArray(dust.a.aSeed);
    gl!.vertexAttribPointer(dust.a.aSeed, 4, gl!.FLOAT, false, 0, 0);
    gl!.uniformMatrix4fv(dust.u.uVP, false, vp);
    gl!.uniform3f(dust.u.uBox, vw * 0.85, vh * 0.75, d0 * 0.46);
    gl!.uniform1f(dust.u.uTime, still ? 0 : time);
    gl!.uniform1f(dust.u.uFocus, d0);
    gl!.uniform1f(dust.u.uPx, dpr);
    gl!.uniform1f(dust.u.uGain, 0.55 * intro);
    gl!.drawArrays(gl!.POINTS, 0, dustCount);
    gl!.disableVertexAttribArray(dust.a.aSeed);
  }

  // --- Calidad adaptativa ---
  // Ventanas de ~1 s: si el equipo no llega a ~40 fps se baja resolución y polvo;
  // si aun así no llega (o va claramente ahogado) se vuelve a la versión DOM.
  let frames = 0;
  let acc = 0;
  let level = 0;
  function adapt(dt: number) {
    if (force || still) return;
    acc += dt;
    frames++;
    if (acc < 1 || frames < 8) return;
    const avg = acc / frames;
    frames = 0;
    acc = 0;
    if (avg < 0.025) return;
    level++;
    if (avg > 0.055 || level > 2) {
      stop();
      onFallback();
      return;
    }
    dpr = level === 1 ? Math.min(dpr, 1.25) : 1;
    dustCount = Math.round(dustCount / 2);
    measure();
  }

  function frame(now: number) {
    raf = 0;
    if (!alive) return;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    time += dt;
    const ease = 1 - Math.exp(-dt * 4);
    swayX += (aimX - swayX) * ease;
    swayY += (aimY - swayY) * ease;
    idleAmp += ((now - lastInput < 4000 ? 0.2 : 1) - idleAmp) * (1 - Math.exp(-dt * 1.5));
    draw(now);
    if (now - started > 800) adapt(dt);
    schedule();
  }

  function schedule() {
    if (!raf && alive && visible && !covered && !document.hidden) {
      raf = requestAnimationFrame((now) => {
        if (!last) last = now;
        frame(now);
      });
    }
  }

  function stop() {
    alive = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // --- Entrada: ratón, dedo o giroscopio ---
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    lastInput = e.timeStamp;
    aimX = (e.clientX / window.innerWidth) * 2 - 1;
    aimY = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });
  hero.addEventListener(
    'touchmove',
    (e) => {
      const t = e.touches[0];
      if (!t) return;
      lastInput = e.timeStamp;
      aimX = (t.clientX / window.innerWidth) * 2 - 1;
    },
    { passive: true },
  );
  hero.addEventListener('touchend', () => (aimX = 0), { passive: true });
  // iOS exige un permiso explícito para el giroscopio: allí no se pide (sería
  // intrusivo) y la escena se mueve sola y con el dedo.
  const Orientation = window.DeviceOrientationEvent as (typeof DeviceOrientationEvent & { requestPermission?: unknown }) | undefined;
  if (coarse && Orientation && typeof Orientation.requestPermission !== 'function') {
    let beta0: number | null = null;
    window.addEventListener(
      'deviceorientation',
      (e) => {
        if (e.gamma === null || e.beta === null) return;
        const landscape = Math.abs((screen.orientation?.angle ?? 0) % 180) === 90;
        const lr = landscape ? e.beta : e.gamma;
        const fb = landscape ? e.gamma : e.beta;
        beta0 ??= fb;
        lastInput = e.timeStamp;
        aimX = clamp(lr / 22, -1, 1);
        aimY = clamp((fb - beta0) / 22, -1, 1);
      },
      { passive: true },
    );
  }

  document.addEventListener('visibilitychange', () => {
    last = 0;
    schedule();
  });
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    onFallback();
  });

  // --- Primer fotograma y relevo del DOM ---
  measure();
  started = performance.now();
  last = 0;
  draw(started);
  schedule();

  return {
    update(progress, isCovered) {
      p = progress;
      covered = isCovered;
      schedule();
    },
    setVisible(v) {
      visible = v;
      last = 0;
      schedule();
    },
    resize: measure,
  };
}
