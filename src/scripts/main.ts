/**
 * Punto de entrada único (un solo módulo JS por página).
 * Cada init no hace nada si su sección no existe en la página actual.
 */
import { initNavigation } from './nav';
import { initReveal } from './reveal';
import { initHero } from './hero';
import { initAmbientVideos, initPlayers, initPreviews } from './media';
import { initGalleries } from './gallery';

initNavigation();
initHero();
initReveal();
initPlayers();
initAmbientVideos();
initPreviews();
initGalleries();

// Detalles puramente decorativos (grano) solo cuando la página ya ha cargado
declare global {
  interface Window {
    __enableViewTransitions?: () => void;
  }
}

const markLoaded = () => {
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
  idle(() => {
    document.documentElement.classList.add('is-loaded');
    window.__enableViewTransitions?.();
  });
};
if (document.readyState === 'complete') markLoaded();
else window.addEventListener('load', markLoaded, { once: true });
