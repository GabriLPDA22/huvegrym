import type { Localized } from '@/i18n/config';

/**
 * Agenda de actuaciones.
 *
 * Para publicar una fecha basta con añadir un objeto al array. La home
 * mostrará la lista y generará datos estructurados `Event` (Google puede
 * mostrarlos como resultado enriquecido). Las fechas pasadas se ocultan solas
 * en cada build.
 *
 * Ejemplo:
 * {
 *   date: '2026-11-14T20:00:00+01:00',
 *   pieceSlug: 'cibanal',
 *   venue: 'Teatro del Mercado',
 *   city: 'Zaragoza',
 *   address: 'Plaza de Santo Domingo, s/n, 50003 Zaragoza',
 *   ticketsUrl: 'https://...',
 * }
 */
export interface ShowDate {
  /** ISO 8601 con zona horaria. */
  date: string;
  pieceSlug?: string;
  /** Título si no es una obra del repertorio. */
  title?: Localized;
  venue: string;
  city: string;
  address?: string;
  ticketsUrl?: string;
}

export const events: ShowDate[] = [];

export const upcomingEvents = (now = new Date()) =>
  events
    .filter((e) => new Date(e.date).getTime() >= now.getTime() - 1000 * 60 * 60 * 6)
    .sort((a, b) => a.date.localeCompare(b.date));
