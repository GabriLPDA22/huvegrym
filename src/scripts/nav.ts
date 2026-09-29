/**
 * Cabecera: estado sólido/oculto según scroll y menú overlay (<dialog> nativo).
 */
export function initNavigation() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const menu = document.querySelector<HTMLDialogElement>('[data-menu]');
  const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');

  if (menu && openBtn) {
    const close = () => menu.open && menu.close();
    openBtn.addEventListener('click', () => {
      menu.showModal();
      document.documentElement.style.overflow = 'hidden';
    });
    menu.addEventListener('close', () => {
      document.documentElement.style.overflow = '';
      openBtn.focus({ preventScroll: true });
    });
    menu.querySelector('[data-menu-close]')?.addEventListener('click', close);
    menu.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', close));
  }

  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;
  const threshold = () => window.innerHeight * 0.6;

  const update = () => {
    const y = window.scrollY;
    const hero = document.querySelector<HTMLElement>('[data-hero]');
    // En la home el header se mantiene transparente mientras dura el hero fijado.
    const solidFrom = hero ? hero.offsetTop + hero.offsetHeight - window.innerHeight : threshold();
    header.classList.toggle('is-solid', y > Math.max(solidFrom, 40));
    header.classList.toggle('is-hidden', y > lastY && y > Math.max(solidFrom, threshold()) + 200);
    lastY = y;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}
