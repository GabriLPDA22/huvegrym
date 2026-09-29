type Choice = 'granted' | 'denied';

const KEY = 'hvg-consent-v1';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const read = (): Choice | null => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
};

const write = (v: Choice) => {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* modo privado: la elección dura la sesión */
  }
};

function bootstrapGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
}

let loaded = false;
function loadAnalytics(id: string) {
  if (loaded) return;
  loaded = true;
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  window.gtag('js', new Date());
  window.gtag('config', id);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.append(s);
}

function clearGaCookies() {
  const host = location.hostname.replace(/^www\./, '');
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0]?.trim();
    if (name && name.startsWith('_ga')) {
      for (const domain of ['', `; domain=.${host}`, `; domain=${host}`]) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
      }
    }
  });
}

export function initConsent() {
  const banner = document.querySelector<HTMLElement>('[data-consent]');
  const id = banner?.dataset.gaId;
  if (!banner || !id) return;

  bootstrapGtag();

  const apply = (choice: Choice) => {
    if (choice === 'granted') {
      loadAnalytics(id);
    } else {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
      clearGaCookies();
    }
  };

  const current = read();
  if (current) {
    // Diferido para no competir con el LCP.
    const run = () => apply(current);
    'requestIdleCallback' in window ? requestIdleCallback(run, { timeout: 3000 }) : setTimeout(run, 1500);
  } else {
    banner.hidden = false;
  }

  banner.querySelectorAll<HTMLButtonElement>('[data-consent-choice]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const choice = btn.dataset.consentChoice as Choice;
      const wasGranted = read() === 'granted';
      write(choice);
      banner.hidden = true;
      apply(choice);
      // Revocar requiere recargar para descargar gtag.js de la página.
      if (wasGranted && choice === 'denied') location.reload();
    }),
  );

  document.querySelectorAll('[data-consent-open]').forEach((el) =>
    el.addEventListener('click', () => {
      banner.hidden = false;
      banner.querySelector<HTMLButtonElement>('[data-consent-choice]')?.focus();
    }),
  );
}
