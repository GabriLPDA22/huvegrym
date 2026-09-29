/** Botones anterior/siguiente para los carruseles con scroll-snap. */
export function initGalleries() {
  document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((g) => {
    const track = g.querySelector<HTMLElement>('[data-gallery-track]');
    const prev = g.querySelector<HTMLButtonElement>('[data-gallery-prev]');
    const next = g.querySelector<HTMLButtonElement>('[data-gallery-next]');
    if (!track || !prev || !next) return;
    const step = () => (track.querySelector('li')?.getBoundingClientRect().width ?? 300) + 16;
    const update = () => {
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    update();
  });
}
