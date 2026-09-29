/** Fotógrafos acreditados (Instagram). */
export const photographers = {
  sandrinecosny: { handle: '@sandrinecosny', url: 'https://instagram.com/sandrinecosny' },
  oscarbarea: { handle: '@oscarbarea_foto', url: 'https://instagram.com/oscarbarea_foto' },
  kyesoluan: { handle: '@kyesoluan', url: 'https://www.instagram.com/kyesoluan/' },
  adoras: { handle: '@ado_ra_s', url: 'https://instagram.com/ado_ra_s' },
  dancingShots: { handle: '@dancing_shots', url: 'https://instagram.com/dancing_shots' },
  danzaVisual: { handle: '@danza_visual', url: 'https://instagram.com/danza_visual' },
} as const;

export type Credit = (typeof photographers)[keyof typeof photographers];
