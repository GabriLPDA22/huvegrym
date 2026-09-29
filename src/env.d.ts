/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** ID de medición de Google Analytics 4 (G-XXXXXXXXXX). Vacío = sin analítica. */
  readonly PUBLIC_GA_ID?: string;
  /** Token de verificación de Google Search Console (meta google-site-verification). */
  readonly PUBLIC_GSC_VERIFICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
