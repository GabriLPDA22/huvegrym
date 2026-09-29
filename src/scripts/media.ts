/** Fachadas de vídeo: sustituye el póster por <video> al pulsar. */
export function initPlayers() {
  document.querySelectorAll<HTMLButtonElement>('[data-player-play]:not([data-bound])').forEach((btn) => {
    btn.dataset.bound = '';
    btn.addEventListener('click', () => {
      const frame = btn.parentElement;
      if (!frame || !btn.dataset.src) return;
      const video = document.createElement('video');
      video.src = btn.dataset.src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true; // los tráilers no tienen audio; permite autoplay en iOS
      video.preload = 'auto';
      video.width = Number(btn.dataset.width) || 1280;
      video.height = Number(btn.dataset.height) || 720;
      video.setAttribute('aria-label', btn.getAttribute('aria-label') ?? '');
      frame.replaceChildren(video);
      video.focus();
      void video.play().catch(() => undefined);
    });
  });
}

/**
 * Vídeo ambiental: solo se carga cuando la sección se acerca al viewport,
 * se pausa fuera de pantalla y respeta prefers-reduced-motion / ahorro de datos.
 */
export function initAmbientVideos() {
  const videos = document.querySelectorAll<HTMLVideoElement>('video[data-ambient]');
  if (!videos.length) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

  // El póster también es diferido: no compite con el LCP del hero
  const posterIo = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        const video = target as HTMLVideoElement;
        if (isIntersecting && video.dataset.poster) {
          video.poster = video.dataset.poster;
          posterIo.unobserve(video);
        }
      }
    },
    { rootMargin: '600px 0px' },
  );
  videos.forEach((v) => posterIo.observe(v));

  if (reduce || saveData) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        const video = target as HTMLVideoElement;
        if (isIntersecting) {
          if (!video.src && video.dataset.src) {
            const webm = video.dataset.srcWebm;
            video.src = webm && video.canPlayType('video/webm; codecs="vp9"') ? webm : video.dataset.src;
          }
          void video.play().then(() => video.classList.add('is-playing')).catch(() => undefined);
        } else if (!video.paused) {
          video.pause();
        }
      }
    },
    { rootMargin: '200px 0px' },
  );
  videos.forEach((v) => io.observe(v));
}

/**
 * Vistas previas de las obras: en escritorio se reproducen al pasar el ratón por
 * la tarjeta; en táctil, mientras la tarjeta está visible. Carga diferida.
 */
export function initPreviews() {
  const videos = document.querySelectorAll<HTMLVideoElement>('video[data-preview]');
  if (!videos.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (reduce || saveData) return;

  const start = (v: HTMLVideoElement) => {
    if (!v.src) {
      const webm = v.dataset.srcWebm;
      v.src = webm && v.canPlayType('video/webm; codecs="vp9"') ? webm : (v.dataset.src ?? '');
      v.addEventListener('playing', () => v.classList.add('is-playing'));
      v.addEventListener('pause', () => v.classList.remove('is-playing'));
    }
    void v.play().catch(() => undefined);
  };
  const stop = (v: HTMLVideoElement) => {
    if (!v.paused) v.pause();
  };

  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    videos.forEach((v) => {
      const card = v.closest('li') ?? v.parentElement;
      card?.addEventListener('mouseenter', () => start(v));
      card?.addEventListener('mouseleave', () => stop(v));
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        const v = target as HTMLVideoElement;
        if (isIntersecting) start(v);
        else stop(v);
      }
    },
    { threshold: 0.6 },
  );
  videos.forEach((v) => io.observe(v));
}
