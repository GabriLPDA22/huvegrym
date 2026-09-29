import type { APIRoute } from 'astro';
import { HTML_LANG, LANGS, type Alternates } from '@/i18n/config';
import { routes } from '@/i18n/routes';
import { artists } from '@/data/artists';
import { pieces } from '@/data/pieces';

/**
 * Sitemap propio con hreflang recíproco. @astrojs/sitemap no sabe emparejar
 * slugs traducidos (/artistas/ ↔ /en/artists/), así que lo generamos aquí.
 */
export const GET: APIRoute = ({ site }) => {
  const origin = site!;
  const lastmod = new Date().toISOString().slice(0, 10);
  const groups: { alt: Alternates; priority: string }[] = [
    { alt: routes.home, priority: '1.0' },
    ...artists.map((a) => ({ alt: routes.artist(a.slug), priority: '0.8' })),
    ...pieces.map((p) => ({ alt: routes.piece(p.slug), priority: '0.8' })),
    { alt: routes.cookies, priority: '0.1' },
  ];

  const abs = (p: string) => new URL(p, origin).href;
  const urls = groups.flatMap(({ alt, priority }) =>
    LANGS.map((lang) => {
      const links = LANGS.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${HTML_LANG[l]}" href="${abs(alt[l])}"/>`,
      ).join('\n');
      return `  <url>
    <loc>${abs(alt[lang])}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>
${links}
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(alt.es)}"/>
  </url>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
