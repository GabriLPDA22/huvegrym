/**
 * Inclinación 3D con el puntero para los elementos [data-tilt] (solo ratón).
 * Un único listener delegado; la posición se aplica en requestAnimationFrame.
 */
export function initTilt() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let active: HTMLElement | null = null;
  let x = 0;
  let y = 0;
  let raf = 0;

  const release = () => {
    if (!active) return;
    active.classList.remove('is-tilting');
    active.style.removeProperty('--tx');
    active.style.removeProperty('--ty');
    active = null;
  };

  const apply = () => {
    raf = 0;
    if (!active) return;
    const r = active.getBoundingClientRect();
    const tx = Math.min(1, Math.max(-1, ((x - r.left) / r.width) * 2 - 1));
    const ty = Math.min(1, Math.max(-1, ((y - r.top) / r.height) * 2 - 1));
    active.style.setProperty('--tx', tx.toFixed(3));
    active.style.setProperty('--ty', ty.toFixed(3));
  };

  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-tilt]') ?? null;
      if (el !== active) {
        release();
        active = el;
        active?.classList.add('is-tilting');
      }
      if (!active) return;
      x = e.clientX;
      y = e.clientY;
      raf ||= requestAnimationFrame(apply);
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', release);
  window.addEventListener('scroll', release, { passive: true });
}
