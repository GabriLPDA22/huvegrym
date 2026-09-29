import type { Lang } from '@/i18n/config';
import { routes } from '@/i18n/routes';
import { site } from '@/data/site';
import { artists, type Artist } from '@/data/artists';
import { getPiece, type Piece } from '@/data/pieces';
import type { ShowDate } from '@/data/events';

type JsonLd = Record<string, unknown>;

const abs = (path: string) => new URL(path, site.url).href;

export const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;
const personId = (a: Artist) => `${abs(routes.artist(a.slug).es)}#person`;

export function organizationSchema(lang: Lang, description: string): JsonLd {
  return {
    '@type': 'DanceGroup',
    '@id': ORG_ID,
    name: site.name,
    alternateName: site.alternateNames,
    url: abs(routes.home[lang]),
    logo: abs('/icons/icon-512.png'),
    image: abs('/og/huvegrym.jpg'),
    description,
    email: site.email,
    genre: site.genre[lang],
    areaServed: site.areaServed,
    sameAs: [site.instagram.url],
    member: artists.map((a) => ({ '@id': personId(a) })),
  };
}

export function websiteSchema(): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: abs('/'),
    name: site.name,
    inLanguage: ['es-ES', 'en'],
    publisher: { '@id': ORG_ID },
  };
}

export function personSchema(a: Artist, lang: Lang): JsonLd {
  const birthYear = a.facts.find((f) => f.label === 'origin')?.value.match(/\d{4}/)?.[0];
  return {
    '@type': 'Person',
    '@id': personId(a),
    name: a.fullName,
    givenName: a.shortName,
    familyName: a.fullName.replace(`${a.shortName} `, ''),
    jobTitle: a.jobTitle[lang],
    description: a.seo.description[lang],
    url: abs(routes.artist(a.slug)[lang]),
    image: abs(a.ogImage),
    birthPlace: { '@type': 'Place', name: 'Zaragoza' },
    ...(birthYear ? { birthDate: birthYear } : {}),
    homeLocation: { '@type': 'Place', name: 'Madrid' },
    memberOf: { '@id': ORG_ID },
    alumniOf: a.schools
      .filter((s) => /Conservatorio/.test(s.name.es))
      .map((s) => ({ '@type': 'EducationalOrganization', name: s.name.es })),
    knowsAbout: lang === 'es' ? ['Danza contemporánea', 'Coreografía', 'Danza-teatro'] : ['Contemporary dance', 'Choreography', 'Dance theatre'],
  };
}

export function pieceSchema(p: Piece, lang: Lang): JsonLd {
  return {
    '@type': 'CreativeWork',
    '@id': `${abs(routes.piece(p.slug).es)}#work`,
    name: p.title,
    genre: p.genre[lang],
    description: p.seoDescription[lang],
    url: abs(routes.piece(p.slug)[lang]),
    image: abs(p.ogImage),
    ...(p.durationMin ? { timeRequired: `PT${p.durationMin}M` } : {}),
    creator: { '@id': ORG_ID },
    keywords: p.tags.map((t) => t[lang]).join(', '),
    inLanguage: lang === 'es' ? 'es-ES' : 'en',
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.url),
    })),
  };
}

export function eventSchema(e: ShowDate, lang: Lang): JsonLd {
  const piece = e.pieceSlug ? getPiece(e.pieceSlug) : undefined;
  const name = piece ? `${piece.title} — ${site.name}` : `${e.title?.[lang] ?? site.name}`;
  return {
    '@type': 'DanceEvent',
    name,
    startDate: e.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: e.venue,
      address: e.address ?? e.city,
    },
    image: abs(piece?.ogImage ?? '/og/huvegrym.jpg'),
    description: piece?.seoDescription[lang],
    performer: { '@id': ORG_ID },
    organizer: { '@id': ORG_ID },
    ...(piece ? { workPerformed: { '@id': `${abs(routes.piece(piece.slug).es)}#work` } } : {}),
    ...(e.ticketsUrl ? { offers: { '@type': 'Offer', url: e.ticketsUrl, availability: 'https://schema.org/InStock' } } : {}),
  };
}

/** Envuelve varios nodos en un único @graph. */
export const graph = (...nodes: JsonLd[]) => ({ '@context': 'https://schema.org', '@graph': nodes });
