/** Fotógrafos acreditados (Instagram). */
export const photographers = {
  sandrinecosny: { handle: '@sandrinecosny', url: 'https://instagram.com/sandrinecosny' },
  oscarbarea: { handle: '@oscarbarea_foto', url: 'https://instagram.com/oscarbarea_foto' },
  kyesoluan: { handle: '@kyesoluan', url: 'https://www.instagram.com/kyesoluan/' },
  adoras: { handle: '@ado_ra_s', url: 'https://instagram.com/ado_ra_s' },
} as const;

export type Credit = (typeof photographers)[keyof typeof photographers];
