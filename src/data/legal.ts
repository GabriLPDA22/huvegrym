import { site } from './site';

/**
 * Datos del titular de la web (LSSI art. 10 y RGPD art. 13).
 *
 * ⚠️ RELLENAR ANTES DE PUBLICAR. Los campos en `null` se muestran en la web como
 * "Pendiente" y el build avisa por consola.
 *
 * - Persona física: nombre y apellidos + NIF (DNI) + domicilio.
 * - Asociación / empresa: denominación + CIF + domicilio social + datos registrales.
 */
export const legal = {
  /** Nombre y apellidos (o denominación de la asociación/empresa). */
  holder: 'Hugo Grimalt Arnal' as string | null,
  /** NIF / DNI / CIF. */
  taxId: '73413076C' as string | null,
  /** Domicilio a efectos de notificaciones. */
  address: 'Calle María Espinosa, bloque 5, 9.º L, Zaragoza' as string | null,
  /** Solo si es asociación o sociedad: registro e inscripción. Opcional. */
  registry: null as string | null,
  email: site.email,
  website: site.url,
  /** Fecha de la última revisión de los textos legales (ISO). */
  updated: '2026-09-30',
} as const;

export const LEGAL_REQUIRED = ['holder', 'taxId', 'address'] as const;

export const missingLegalFields = () => LEGAL_REQUIRED.filter((k) => !legal[k]);

let warned = false;
/** Avisa una sola vez por build si faltan datos obligatorios. */
export function warnMissingLegal() {
  const missing = missingLegalFields();
  if (warned || !missing.length) return;
  warned = true;
  console.warn(`\n⚠️  [legal] Faltan datos del titular en src/data/legal.ts: ${missing.join(', ')}\n`);
}
