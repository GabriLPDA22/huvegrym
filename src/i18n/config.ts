export const LANGS = ['es', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'es';

/** Valor traducido a todos los idiomas soportados. */
export type Localized<T = string> = Record<Lang, T>;

export const HTML_LANG: Record<Lang, string> = { es: 'es-ES', en: 'en' };
export const OG_LOCALE: Record<Lang, string> = { es: 'es_ES', en: 'en_GB' };
export const LANG_LABEL: Record<Lang, { short: string; long: string }> = {
  es: { short: 'ES', long: 'Español' },
  en: { short: 'EN', long: 'English' },
};

/** Enlaces equivalentes de una página en cada idioma (hreflang + selector de idioma). */
export type Alternates = Localized<string>;
