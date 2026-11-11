/**
 * Hero "GTA VI".
 *
 * JS mínimo: calcula el progreso de scroll (--p) y, en la fase B, la
 * transformación del logotipo-máscara. El resto (parallax, opacidades) lo
 * resuelve CSS a partir de --p, así que el hilo principal apenas trabaja.
 *
 * La máscara se transforma como geometría SVG (atributo transform) y no con
 * CSS scale(): evita rasterizar una capa gigantesca, que es lo que hacía
 * inviable la v1 en móvil.
 */

// Geometría del logotipo en unidades del <symbol> normalizado (ver Wordmark)
const LOGO_W = 1366.21;
const LOGO_H = 443.7;
// Punto focal: centro del asta de la segunda "B" de BORBOLETA (zona sólida)
const FOCUS_X = 684.77;
const FOCUS_Y = 221.25;
const FOCUS_HALF_W = 13.8;
const FOCUS_HALF_H = 65.4;
// Caja final del logotipo: ancho, Y y corrección óptica salen de las variables CSS
// --logo-w, --final-y y --logo-shift de .hero (misma caja que .hero__logo)
const FINAL_MAX_WIDTH = 1180;
// Tramos de la animación
const PHASE_B_START = 0.28;
const PHASE_B_END = 0.8;

import type { HeroGL } from './hero3d';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const sticky = hero?.querySelector<HTMLElement>('[data-hero-sticky]');
  const veil = hero?.querySelector<SVGSVGElement>('[data-hero-veil]');
  const hole = hero?.querySelector<SVGUseElement>('[data-hero-hole]');
  const reel = hero?.querySelector<HTMLVideoElement>('[data-hero-reel]');
  const canvas = hero?.querySelector<HTMLCanvasElement>('[data-hero-gl]');
  if (!hero || !sticky || !veil || !hole) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  let vw = 0;
  let vh = 0;
  let scrollRange = 1;
  let heroTop = 0;
  let target = 0;
  let current = 0;
  let raf = 0;
  let visible = true;
  let veilShown = false;
  let finalCenterY = 0.46;
  let widthRatio = 0.9;
  let opticalShift = 0;

  const measure = () => {
    vw = sticky.clientWidth;
    vh = sticky.clientHeight;
    const cs = getComputedStyle(hero);
    finalCenterY = (parseFloat(cs.getPropertyValue('--final-y')) || 46) / 100;
    widthRatio = (parseFloat(cs.getPropertyValue('--logo-w')) || 90) / 100;
    opticalShift = parseFloat(cs.getPropertyValue('--logo-shift')) || 0;
    heroTop = hero.getBoundingClientRect().top + window.scrollY;
    scrollRange = Math.max(1, hero.offsetHeight - vh);
    target = clamp01((window.scrollY - heroTop) / scrollRange);
    current = target;
    render();
  };

  const renderVeil = (p: number) => {
    const t = clamp01((p - PHASE_B_START) / (PHASE_B_END - PHASE_B_START));
    const show = p > PHASE_B_START;
    if (show !== veilShown) {
      veil.style.visibility = show ? 'visible' : 'hidden';
      veilShown = show;
    }
    if (!show) return;

    const finalW = Math.min(vw * widthRatio, FINAL_MAX_WIDTH);
    const fs = finalW / LOGO_W;
    const finalX = (vw - finalW) / 2 + finalW * opticalShift;
    const finalY = vh * finalCenterY - (LOGO_H * fs) / 2;

    // Escala inicial: el asta de la B cubre todo el viewport (+10 %)
    const k = 1.1 * Math.max(vw / 2 / (FOCUS_HALF_W * fs), vh / 2 / (FOCUS_HALF_H * fs));
    const e = easeInOutCubic(t);
    // Interpolación exponencial: zoom perceptualmente lineal
    const s = fs * Math.pow(k, 1 - e);

    const fx = vw / 2 + (finalX + FOCUS_X * fs - vw / 2) * e;
    const fy = vh / 2 + (finalY + FOCUS_Y * fs - vh / 2) * e;
    const tx = fx - FOCUS_X * s;
    const ty = fy - FOCUS_Y * s;

    hole.setAttribute('transform', `matrix(${s} 0 0 ${s} ${tx} ${ty})`);
  };

  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

  // Vídeo dentro de las letras: se descarga solo al acercarse a la fase final
  const loadReel = () => {
    if (!reel || saveData || reel.src) return;
    const webm = reel.dataset.srcWebm;
    reel.src = webm && reel.canPlayType('video/webm; codecs="vp9"') ? webm : (reel.dataset.src ?? '');
    reel.addEventListener('playing', () => reel.classList.add('is-playing'), { once: true });
    void reel.play().catch(() => undefined);
  };

  // ---------- Escena 3D (WebGL), en diferido ----------
  // Diagnóstico: ?gl=0 la desactiva, ?gl=1 la fuerza aunque el equipo vaya justo y
  // ?gl=still la deja con la cámara quieta (para compararla con la versión DOM).
  const glParam = new URLSearchParams(location.search).get('gl');
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  let gl: HeroGL | null = null;
  let loaded = false;
  let glRequested = glParam === '0' || !canvas || (!glParam && (saveData || memory < 2));

  const leaveGL = () => {
    gl = null;
    hero.classList.remove('is-gl', 'is-gl-ready');
  };

  const requestGL = async () => {
    if (glRequested || !visible || !canvas) return;
    glRequested = true;
    try {
      const { createHeroGL } = await import('./hero3d');
      gl = await createHeroGL({
        hero,
        sticky,
        canvas,
        force: glParam === '1',
        still: glParam === 'still',
        onFallback: leaveGL,
      });
    } catch {
      gl = null;
    }
    if (!gl) return;
    gl.update(current, false);
    gl.setVisible(visible);
    hero.classList.add('is-gl');
    // El DOM se oculta cuando el fundido del canvas ha terminado
    window.setTimeout(() => gl && hero.classList.add('is-gl-ready'), 750);
  };

  let late = false;
  const render = () => {
    hero.style.setProperty('--p', current.toFixed(4));
    gl?.update(current, current > 0.83 && !!reel?.classList.contains('is-playing'));
    if (!late && current > 0.45) {
      late = true;
      hero.classList.add('is-late');
      loadReel();
    }
    renderVeil(current);
  };

  // Suavizado ligero (inercia) para rueda de ratón con saltos discretos
  const tick = () => {
    const diff = target - current;
    current = Math.abs(diff) < 0.0005 ? target : current + diff * 0.2;
    render();
    raf = current !== target ? requestAnimationFrame(tick) : 0;
  };

  const onScroll = () => {
    if (!visible) return;
    target = clamp01((window.scrollY - heroTop) / scrollRange);
    if (!raf) raf = requestAnimationFrame(tick);
  };

  new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    gl?.setVisible(visible);
    if (visible && loaded) void requestGL();
    if (visible) onScroll();
    if (reel?.src) {
      if (visible) void reel.play().catch(() => undefined);
      else reel.pause();
    }
  }).observe(hero);

  new ResizeObserver(() => {
    measure();
    gl?.resize();
  }).observe(sticky);

  // La escena arranca cuando la página ya ha cargado y el navegador está libre
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
  const whenLoaded = () =>
    idle(
      () => {
        loaded = true;
        void requestGL();
      },
      { timeout: 2500 },
    );
  if (document.readyState === 'complete') whenLoaded();
  else window.addEventListener('load', whenLoaded, { once: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  reduced.addEventListener('change', () => location.reload());
  measure();
}
