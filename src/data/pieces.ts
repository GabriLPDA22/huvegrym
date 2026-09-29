import type { ImageMetadata } from 'astro';
import type { Localized } from '@/i18n/config';
import { photographers, type Credit } from './credits';

import cibanalImg from '@/assets/images/pieces/cibanal.jpg';
import cibanalPoster from '@/assets/images/pieces/cibanal-poster.jpg';
import pasDeTroisImg from '@/assets/images/pieces/pas-de-trois.jpg';
import pasDeTroisAlt from '@/assets/images/pieces/pas-de-trois-2.jpg';
import pasDeTroisPoster from '@/assets/images/pieces/pas-de-trois-poster.jpg';

export interface PieceVideo {
  src: string;
  poster: ImageMetadata;
  label: Localized;
  width: number;
  height: number;
}

export interface Piece {
  slug: string;
  title: string;
  genre: Localized;
  tags: Localized[];
  /** Duración aproximada en minutos (si se conoce). */
  durationMin?: number;
  preview: Localized;
  story: Localized<string[]>;
  image: ImageMetadata;
  imageAlt: Localized;
  credit?: Credit;
  secondaryImage?: { src: ImageMetadata; alt: Localized };
  video: PieceVideo;
  /** Clip corto sin sonido para la vista previa de la tarjeta (mp4 + webm). */
  clip: { mp4: string; webm: string };
  ogImage: string;
  seoDescription: Localized;
}

export const pieces: Piece[] = [
  {
    slug: 'cibanal',
    title: 'Cibanal',
    genre: { es: 'Danza-teatro', en: 'Dance-theatre' },
    tags: [
      { es: 'Danza-teatro', en: 'Dance-theatre' },
      { es: '15 min', en: '15 min' },
      { es: 'Existencialismo', en: 'Existentialism' },
    ],
    durationMin: 15,
    preview: {
      es: 'Una obra que se inspira en el esperpento de Valle-Inclán y el existencialismo de Dostoyevski, explorando los límites entre lo onírico y lo grotesco.',
      en: "A piece inspired by Valle-Inclán's 'esperpento' and Dostoyevsky's existentialism, exploring the boundaries between the dreamlike and the grotesque.",
    },
    story: {
      es: [
        'Cibanal es una obra de danza-teatro. Tiene una duración aproximada de 15 minutos. Se inspira en el esperpento de Valle-Inclán, así como en el existencialismo presente en las obras de Fiódor Dostoyevski y Andréi Tarkovski.',
        'El objetivo del proyecto tiene una doble naturaleza: formal y sustantiva. Desde el punto de vista formal, busca conectar la palabra con el movimiento para que ambos se integren en las intenciones de los personajes.',
        'En cuanto al contenido, se utilizará un lenguaje que oscile entre lo onírico y lo grotesco, para abordar temas como la desesperación, el vacío, la muerte y la búsqueda, a través de un camino tortuoso que desgarrará la humanidad de sus personajes.',
        'La pieza actúa como un prólogo de una historia más extensa; por ello, se presenta como una escena de negociación entre los personajes, que se resuelve dando inicio al viaje, el cual nunca es mostrado.',
      ],
      en: [
        "Cibanal is a dance-theatre piece. It has an approximate duration of 15 minutes. It is inspired by Valle-Inclán's 'esperpento', as well as the existentialism present in the works of Fyodor Dostoevsky and Andrei Tarkovsky.",
        "The project's objective has a dual nature: formal and substantive. From a formal point of view, it seeks to connect the word with movement so that both are integrated into the characters' intentions.",
        'As for the content, a language that oscillates between the dreamlike and the grotesque is used to address themes such as despair, emptiness, death and the search, through a tortuous path that tears apart the humanity of its characters.',
        'The piece acts as a prologue to a longer story; it is therefore presented as a negotiation scene between the characters, which is resolved by starting the journey, which is never shown.',
      ],
    },
    image: cibanalImg,
    imageAlt: {
      es: 'Dos intérpretes de Huvegrym en escena bajo luz ámbar durante Cibanal',
      en: 'Two Huvegrym performers on stage under amber light during Cibanal',
    },
    credit: photographers.kyesoluan,
    video: {
      src: '/media/video/cibanal-trailer.mp4',
      poster: cibanalPoster,
      label: { es: 'Tráiler oficial', en: 'Official trailer' },
      width: 1280,
      height: 720,
    },
    clip: { mp4: '/media/video/preview-cibanal.mp4', webm: '/media/video/preview-cibanal.webm' },
    ogImage: '/og/cibanal.jpg',
    seoDescription: {
      es: 'Cibanal, obra de danza-teatro de Huvegrym (15 min) inspirada en el esperpento de Valle-Inclán y el existencialismo de Dostoyevski y Tarkovski. Tráiler y dossier.',
      en: "Cibanal, a Huvegrym dance-theatre piece (15 min) inspired by Valle-Inclán's esperpento and the existentialism of Dostoevsky and Tarkovsky. Trailer and details.",
    },
  },
  {
    slug: 'pas-de-trois',
    title: 'Pas de Trois',
    genre: { es: 'Danza contemporánea', en: 'Contemporary dance' },
    tags: [
      { es: 'Contemporáneo', en: 'Contemporary' },
      { es: 'Tango', en: 'Tango' },
      { es: 'Humor', en: 'Humour' },
    ],
    preview: {
      es: 'La combinación de danza contemporánea, danza clown y tango crea un enfoque cómico que ofrece una mirada irónica sobre los conflictos de poder.',
      en: 'The combination of contemporary dance, clown dance and tango creates a comic approach that offers an ironic look at power conflicts.',
    },
    story: {
      es: [
        'En Pas de Trois, la combinación de danza contemporánea, danza clown, tango y, más concretamente, el humor, responde a la búsqueda de un contexto que evite el drama que surge inevitablemente al tratar los conflictos de poder.',
        'En un intento de escapar de ello, se plantea un enfoque cómico que no suaviza el problema, sino que ofrece una mirada irónica, la cual, en ocasiones, puede ser más útil para la reflexión que la propia tragedia.',
        'La obra explora las dinámicas de poder entre tres personajes, utilizando el humor como herramienta de análisis social y como mecanismo de distanciamiento que permite al espectador reflexionar sin caer en el melodrama.',
      ],
      en: [
        'In Pas de Trois, the combination of contemporary dance, clown dance, tango and, more specifically, humour, responds to the search for a context that avoids the drama that inevitably arises when dealing with power conflicts.',
        'In an attempt to escape it, a comic approach is proposed that does not soften the problem, but offers an ironic perspective, which at times can be more useful for reflection than tragedy itself.',
        'The piece explores the power dynamics between three characters, using humour as a tool for social analysis and as a distancing mechanism that allows the audience to reflect without falling into melodrama.',
      ],
    },
    image: pasDeTroisImg,
    imageAlt: {
      es: 'Intérpretes de Pas de Trois sentados ante un fondo rojo',
      en: 'Pas de Trois performers seated against a red backdrop',
    },
    credit: photographers.adoras,
    secondaryImage: {
      src: pasDeTroisAlt,
      alt: {
        es: 'Dos intérpretes de Pas de Trois, uno cargando al otro a la espalda junto a un muro',
        en: 'Two Pas de Trois performers, one carrying the other piggyback beside a wall',
      },
    },
    video: {
      src: '/media/video/pas-de-trois-teaser.mp4',
      poster: pasDeTroisPoster,
      label: { es: 'Extracto', en: 'Excerpt' },
      width: 1280,
      height: 720,
    },
    clip: { mp4: '/media/video/preview-pas-de-trois.mp4', webm: '/media/video/preview-pas-de-trois.webm' },
    ogImage: '/og/pas-de-trois.jpg',
    seoDescription: {
      es: 'Pas de Trois, pieza de Huvegrym que mezcla danza contemporánea, danza clown y tango para mirar con humor e ironía los conflictos de poder. Vídeo y dossier.',
      en: 'Pas de Trois, a Huvegrym piece blending contemporary dance, clown dance and tango to look at power conflicts with humour and irony. Video and details.',
    },
  },
];

export const getPiece = (slug: string) => pieces.find((p) => p.slug === slug);
