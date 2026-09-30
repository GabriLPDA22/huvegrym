import type { Alternates, Lang } from './config';

/**
 * Única fuente de verdad de las URLs públicas. Los slugs traducidos
 * (artistas/artists, obras/works) mejoran el SEO en cada idioma.
 */
export const routes = {
  home: { es: '/', en: '/en/' },
  cookies: { es: '/cookies/', en: '/en/cookies/' },
  legalNotice: { es: '/aviso-legal/', en: '/en/legal-notice/' },
  privacy: { es: '/privacidad/', en: '/en/privacy/' },
  artist: (slug: string): Alternates => ({
    es: `/artistas/${slug}/`,
    en: `/en/artists/${slug}/`,
  }),
  piece: (slug: string): Alternates => ({
    es: `/obras/${slug}/`,
    en: `/en/works/${slug}/`,
  }),
} as const;

/** IDs de las secciones de la home (ancla estable en ambos idiomas). */
export const SECTION = {
  about: 'nosotros',
  collective: 'colectivo',
  artists: 'artistas',
  pieces: 'obras',
  videos: 'videos',
  venues: 'lugares',
  dates: 'fechas',
  contact: 'contacto',
} as const;

export type SectionId = (typeof SECTION)[keyof typeof SECTION];

export const sectionHref = (lang: Lang, id: SectionId) => `${routes.home[lang]}#${id}`;
