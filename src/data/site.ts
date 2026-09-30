import type { Localized } from '@/i18n/config';

export const site = {
  name: 'Huvegrym',
  alternateNames: ['Huvegrym Borboleta Danza', 'Fragmentos de Eternidad'],
  url: 'https://huvegrym.com',
  email: 'huvegrym@gmail.com',
  instagram: {
    url: 'https://www.instagram.com/huvegrym/',
    handle: '@huvegrym',
  },
  developer: { name: 'Gabriel Saiz', url: 'https://gabrielcodes.dev/' },
  /** Ciudades donde trabaja la compañía (SEO local). */
  areaServed: ['Zaragoza', 'Madrid', 'España'],
  genre: { es: 'Danza contemporánea', en: 'Contemporary dance' } satisfies Localized,
} as const;

export const seo = {
  home: {
    title: {
      es: 'Huvegrym | Danza contemporánea de Vega y Hugo Grimalt',
      en: 'Huvegrym | Contemporary dance by Vega & Hugo Grimalt',
    },
    description: {
      es: 'Compañía de danza contemporánea de los hermanos Vega y Hugo Grimalt Arnal (Zaragoza · Madrid). Danza-teatro, humor y emoción: Cibanal y Pas de Trois.',
      en: 'Contemporary dance company of siblings Vega and Hugo Grimalt Arnal (Zaragoza · Madrid). Dance-theatre, humour and emotion: Cibanal and Pas de Trois.',
    },
    ogImage: '/og/huvegrym.jpg',
  },
  legalNotice: {
    title: { es: 'Aviso legal | Huvegrym', en: 'Legal notice | Huvegrym' },
    description: {
      es: 'Aviso legal de la web de Huvegrym: datos del titular, condiciones de uso y propiedad intelectual.',
      en: 'Legal notice for the Huvegrym website: owner details, terms of use and intellectual property.',
    },
  },
  privacy: {
    title: { es: 'Política de privacidad | Huvegrym', en: 'Privacy policy | Huvegrym' },
    description: {
      es: 'Cómo trata Huvegrym tus datos personales cuando nos escribes o visitas la web, y cómo ejercer tus derechos.',
      en: 'How Huvegrym processes your personal data when you contact us or visit the website, and how to exercise your rights.',
    },
  },
  cookies: {
    title: { es: 'Política de cookies | Huvegrym', en: 'Cookie policy | Huvegrym' },
    description: {
      es: 'Información sobre las cookies que utiliza la web de Huvegrym y cómo gestionarlas.',
      en: 'Information about the cookies used on the Huvegrym website and how to manage them.',
    },
  },
} as const;

export const about = {
  lead: {
    es: 'Somos Vega y Hugo. Más que bailarines, somos narradores de historias sin palabras. Nuestra danza nace de la conexión, del pulso compartido que transforma el escenario en un lienzo de emociones. Exploramos la fuerza en la vulnerabilidad y la belleza en lo efímero, invitándote a un viaje más allá de lo visible, donde cada gesto es un fragmento de eternidad.',
    en: 'We are Vega and Hugo. More than dancers, we are storytellers without words. Our dance is born from connection, from the shared pulse that transforms the stage into a canvas of emotions. We explore the strength in vulnerability and the beauty in the ephemeral, inviting you on a journey beyond the visible, where every gesture is a fragment of eternity.',
  },
  body: {
    es: 'Desde que éramos niños, jugar juntos siempre fue algo natural. Con el tiempo, ese juego se convirtió en movimiento, y el movimiento en danza. Hoy, como hermanos, usamos esa conexión especial que siempre nos ha unido para contar historias y compartirlas con quienes nos ven.',
    en: 'Ever since we were children, playing together always came naturally. Over time, that play became movement, and movement became dance. Today, as siblings, we use the special connection that has always united us to tell stories and share them with those who watch us.',
  },
} satisfies Record<string, Localized>;

export const collective = {
  intro: {
    es: 'Somos una compañía que fusiona danza, música y palabra para crear un lenguaje escénico propio. Cada disciplina se entrelaza con la siguiente, formando una experiencia artística orgánica, viva y en constante transformación.',
    en: 'We are a company that fuses dance, music and words to create our own scenic language. Each discipline intertwines with the next, forming an organic, living artistic experience in constant transformation.',
  },
  philosophy: {
    es: 'Nuestras obras transitan desde lo cómico hasta lo trágico o incluso lo grotesco, siempre con el propósito de conectar con el público y provocar preguntas más que entregar respuestas. Creemos en el arte como un espacio de encuentro, reflexión y juego.',
    en: 'Our works move from the comic to the tragic or even the grotesque, always with the purpose of connecting with the audience and provoking questions rather than delivering answers. We believe in art as a space for encounter, reflection and play.',
  },
  pillars: {
    es: ['Danza', 'Música', 'Palabra'],
    en: ['Dance', 'Music', 'Word'],
  },
} as const;

export const quote = {
  text: {
    es: 'Todo comienza con el cuerpo. Antes de que una palabra sea dicha, el cuerpo ya ha hablado.',
    en: 'Everything begins with the body. Before a word is spoken, the body has already spoken.',
  },
  author: 'Peter Brook',
} as const;
