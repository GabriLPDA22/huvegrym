import type { ImageMetadata } from 'astro';
import type { Localized } from '@/i18n/config';
import { photographers, type Credit } from './credits';

import hugoPortrait from '@/assets/images/artists/hugo.jpg';
import hugoPortrait2 from '@/assets/images/artists/hugo-2.jpg';
import vegaPortrait from '@/assets/images/artists/vega.jpg';
import vegaPortrait2 from '@/assets/images/artists/vega-2.jpg';
import hugoEnsayo from '@/assets/images/gallery/hugo-ensayo.jpg';
import hugoEscena from '@/assets/images/gallery/hugo-cibanal.jpg';
import duoEnsayo from '@/assets/images/gallery/duo-ensayo.jpg';
import vegaCalle from '@/assets/images/gallery/vega-ensayo.jpg';
import vegaSolo from '@/assets/images/gallery/vega-solo.jpg';
import duoEscena from '@/assets/images/gallery/duo-conexion.jpg';

export interface GalleryItem {
  src: ImageMetadata;
  alt: Localized;
  credit?: Credit;
}

export interface Project {
  type: Localized;
  title: string;
  description: Localized;
  award?: Localized;
}

export interface Artist {
  slug: string;
  shortName: string;
  fullName: string;
  /** Género gramatical para textos en castellano. */
  gender: 'm' | 'f';
  role: Localized;
  jobTitle: Localized;
  tagline: Localized;
  headline: Localized<[string, string]>;
  /** Párrafos de biografía. Admiten <em> para nombres de proyectos/creadores. */
  bio: Localized<string[]>;
  facts: { label: 'origin' | 'basedIn' | 'company'; value: string }[];
  quote: Localized;
  projects: Project[];
  schools: { name: Localized; detail: Localized }[];
  companies: string[];
  creatorsTitle: Localized;
  creators: string[];
  portrait: { src: ImageMetadata; alt: Localized; credit?: Credit };
  portraitAlt: { src: ImageMetadata; alt: Localized };
  gallery: GalleryItem[];
  ogImage: string;
  seo: { title: Localized; description: Localized };
}

export const artists: Artist[] = [
  {
    slug: 'hugo-grimalt-arnal',
    shortName: 'Hugo',
    fullName: 'Hugo Grimalt Arnal',
    gender: 'm',
    role: {
      es: 'Bailarín, coreógrafo & artista escénico',
      en: 'Dancer, choreographer & performing artist',
    },
    jobTitle: { es: 'Bailarín y coreógrafo', en: 'Dancer and choreographer' },
    tagline: {
      es: 'Zaragoza · Madrid · Conservatorio Superior de Danza',
      en: 'Zaragoza · Madrid · Superior Conservatory of Dance',
    },
    headline: { es: ['Cuerpo,', 'emoción & escena'], en: ['Body,', 'emotion & stage'] },
    bio: {
      es: [
        'Hugo Grimalt Arnal, nacido en Zaragoza en 2002 y residente en Madrid. Formado en el Conservatorio Municipal de Zaragoza y el Conservatorio Superior de Danza de Madrid.',
        'Ha ampliado su visión del movimiento con creadores como <em>Chevi Muraday</em>, <em>Richard Siegal</em>, <em>Jorge Crecis</em>, <em>La Chula</em> y <em>Fabian Thomé</em>.',
        'También cuenta con experiencia audiovisual en films como <em>La novia</em> de Paula Ortiz y <em>Cariñena, el vino del mar</em> de Javier Calvo, trabajando con compañías como PAI y Teatro Borboleta.',
      ],
      en: [
        'Hugo Grimalt Arnal, born in Zaragoza in 2002 and based in Madrid. Trained at the Municipal Conservatory of Zaragoza and the Superior Conservatory of Dance of Madrid.',
        'He has broadened his vision of movement with creators such as <em>Chevi Muraday</em>, <em>Richard Siegal</em>, <em>Jorge Crecis</em>, <em>La Chula</em> and <em>Fabian Thomé</em>.',
        'He also has audiovisual experience in films such as <em>La novia</em> by Paula Ortiz and <em>Cariñena, el vino del mar</em> by Javier Calvo, working with companies such as PAI and Teatro Borboleta.',
      ],
    },
    facts: [
      { label: 'origin', value: 'Zaragoza, 2002' },
      { label: 'basedIn', value: 'Madrid' },
      { label: 'company', value: 'Huvegrym' },
    ],
    quote: {
      es: 'Mi enfoque artístico se basa en la fusión del cuerpo, la emoción y la interpretación, buscando siempre nuevos lenguajes escénicos que me permitan crecer y conectar con el público.',
      en: 'My artistic approach is based on the fusion of body, emotion and interpretation, always seeking new scenic languages that allow me to grow and connect with the audience.',
    },
    projects: [
      {
        type: { es: 'Danza escénica', en: 'Stage dance' },
        title: 'Los Domingos No',
        description: {
          es: 'Pieza de Cecilia Vincent presentada en escenarios de referencia. Intérprete destacado en una obra que explora el tiempo y el vacío cotidiano.',
          en: 'A piece by Cecilia Vincent presented at leading venues. Featured performer in a work exploring time and everyday emptiness.',
        },
        award: { es: 'Premio Madroño', en: 'Madroño Award' },
      },
      {
        type: { es: 'Danza escénica', en: 'Stage dance' },
        title: 'El Cascanueces',
        description: {
          es: 'Clásico del repertorio internacional. Participación como intérprete en una producción de gran formato que amplió su experiencia en danza de repertorio.',
          en: 'A classic of the international repertoire. Performer in a large-scale production that expanded his experience in repertory dance.',
        },
      },
      {
        type: { es: 'Danza escénica', en: 'Stage dance' },
        title: 'Don Quijote en Nueva York',
        description: {
          es: 'Reinterpretación contemporánea del mito cervantino. Una propuesta escénica que fusiona el imaginario clásico con el lenguaje del movimiento actual.',
          en: 'A contemporary reinterpretation of the Cervantine myth. A stage proposal that merges classical imagery with the language of current movement.',
        },
      },
      {
        type: { es: 'Cine & audiovisual', en: 'Film & audiovisual' },
        title: 'La Novia',
        description: {
          es: 'Largometraje de Paula Ortiz. Una experiencia audiovisual que conecta cuerpo y cámara, explorando el movimiento como lenguaje cinematográfico.',
          en: 'Feature film by Paula Ortiz. An audiovisual experience connecting body and camera, exploring movement as cinematic language.',
        },
      },
      {
        type: { es: 'Cine & audiovisual', en: 'Film & audiovisual' },
        title: 'Cariñena, el Vino del Mar',
        description: {
          es: 'Producción audiovisual de Javier Calvo. Participación que amplió su visión interdisciplinar entre danza, imagen y narración visual.',
          en: 'Audiovisual production by Javier Calvo. A collaboration that broadened his interdisciplinary vision between dance, image and visual storytelling.',
        },
      },
    ],
    schools: [
      {
        name: { es: 'Conservatorio Superior de Danza de Madrid', en: 'Superior Conservatory of Dance of Madrid' },
        detail: { es: 'Grado Superior · Madrid', en: 'Higher Degree · Madrid' },
      },
      {
        name: { es: 'Conservatorio Municipal de Danza de Zaragoza', en: 'Municipal Conservatory of Dance of Zaragoza' },
        detail: { es: 'Formación inicial · Zaragoza', en: 'Initial training · Zaragoza' },
      },
    ],
    companies: ['PAI', 'Teatro Borboleta', 'Huvegrym'],
    creatorsTitle: { es: 'Creadores con los que ha trabajado', en: 'Creators he has worked with' },
    creators: ['Chevi Muraday', 'Richard Siegal', 'Jorge Crecis', 'La Chula', 'Fabian Thomé', 'Cecilia Vincent'],
    portrait: {
      src: hugoPortrait,
      alt: { es: 'Retrato en blanco y negro de Hugo Grimalt Arnal', en: 'Black and white portrait of Hugo Grimalt Arnal' },
      credit: photographers.sandrinecosny,
    },
    portraitAlt: {
      src: hugoPortrait2,
      alt: { es: 'Hugo Grimalt Arnal de perfil', en: 'Hugo Grimalt Arnal in profile' },
    },
    gallery: [
      {
        src: hugoEnsayo,
        alt: { es: 'Hugo Grimalt Arnal bailando al aire libre con una silla en alto', en: 'Hugo Grimalt Arnal dancing outdoors holding a chair aloft' },
        credit: photographers.adoras,
      },
      {
        src: hugoEscena,
        alt: { es: 'Hugo Grimalt Arnal en escena junto a otros intérpretes', en: 'Hugo Grimalt Arnal on stage with other performers' },
      },
      {
        src: duoEnsayo,
        alt: { es: 'Hugo y Vega Grimalt en un ensayo en dúo', en: 'Hugo and Vega Grimalt rehearsing a duet' },
        credit: photographers.sandrinecosny,
      },
    ],
    ogImage: '/og/hugo-grimalt-arnal.jpg',
    seo: {
      title: {
        es: 'Hugo Grimalt Arnal | Bailarín y coreógrafo · Huvegrym',
        en: 'Hugo Grimalt Arnal | Dancer and choreographer · Huvegrym',
      },
      description: {
        es: 'Hugo Grimalt Arnal (Zaragoza, 2002) es bailarín y coreógrafo de danza contemporánea en Madrid e integrante de Huvegrym. Trayectoria, formación y proyectos.',
        en: 'Hugo Grimalt Arnal (Zaragoza, 2002) is a contemporary dancer and choreographer based in Madrid and a member of Huvegrym. Career, training and projects.',
      },
    },
  },
  {
    slug: 'vega-grimalt-arnal',
    shortName: 'Vega',
    fullName: 'Vega Grimalt Arnal',
    gender: 'f',
    role: { es: 'Bailarina & coreógrafa', en: 'Dancer & choreographer' },
    jobTitle: { es: 'Bailarina y coreógrafa', en: 'Dancer and choreographer' },
    tagline: {
      es: 'Zaragoza · Madrid · Conservatorio Superior de Danza',
      en: 'Zaragoza · Madrid · Superior Conservatory of Dance',
    },
    headline: { es: ['Honestidad,', 'movimiento & escucha'], en: ['Honesty,', 'movement & listening'] },
    bio: {
      es: [
        'Vega Grimalt Arnal, bailarina y coreógrafa emergente residente en Madrid. Cuarto año de Coreografía e Interpretación en el Conservatorio Superior de Danza de Madrid.',
        'Su trayectoria comenzó en Zaragoza. Ha tenido la suerte de aprender de artistas como <em>Jorge Crecis</em>, <em>Sharon Fridman</em>, <em>Lucio Baglivo</em>, <em>Mercedes Pedroche</em> y <em>Marko Fonseca</em>.',
        'Ha coreografiado y actuado en <em>Pas de Trois</em> con Borboleta y formó parte de <em>Los Domingos No</em> de Cecilia Vincent, galardonada con el Premio Madroño.',
      ],
      en: [
        'Vega Grimalt Arnal, emerging dancer and choreographer based in Madrid. Fourth year of Choreography and Interpretation at the Superior Conservatory of Dance of Madrid.',
        'Her journey began in Zaragoza. She has been fortunate to learn from artists such as <em>Jorge Crecis</em>, <em>Sharon Fridman</em>, <em>Lucio Baglivo</em>, <em>Mercedes Pedroche</em> and <em>Marko Fonseca</em>.',
        'She has choreographed and performed in <em>Pas de Trois</em> with Borboleta and was part of <em>Los Domingos No</em> by Cecilia Vincent, awarded the Madroño Prize.',
      ],
    },
    facts: [
      { label: 'origin', value: 'Zaragoza' },
      { label: 'basedIn', value: 'Madrid' },
      { label: 'company', value: 'Huvegrym' },
    ],
    quote: {
      es: 'Veo la danza como una forma de conectar, escuchar y cuestionar. Busco constantemente la honestidad en el movimiento y esos momentos frágiles y poderosos donde algo real se abre paso.',
      en: 'I see dance as a way to connect, listen and question. I constantly seek honesty in movement and those fragile, powerful moments where something real breaks through.',
    },
    projects: [
      {
        type: { es: 'Danza & coreografía', en: 'Dance & choreography' },
        title: 'Los Domingos No',
        description: {
          es: 'Pieza de Cecilia Vincent. Intérprete en una propuesta que explora el tiempo detenido y la cotidianeidad como material escénico.',
          en: 'A piece by Cecilia Vincent. Performer in a proposal exploring suspended time and everyday life as stage material.',
        },
        award: { es: 'Premio Madroño', en: 'Madroño Award' },
      },
      {
        type: { es: 'Danza & coreografía', en: 'Dance & choreography' },
        title: 'Pas de Trois',
        description: {
          es: 'Coreografía e interpretación con la compañía Borboleta. Una obra que nace desde la relación entre tres cuerpos en búsqueda de un lenguaje común.',
          en: 'Choreography and performance with the Borboleta company. A work born from the relationship between three bodies searching for a common language.',
        },
      },
      {
        type: { es: 'Performance & directo', en: 'Performance & live' },
        title: 'El Último Conciertazo',
        description: {
          es: 'Actuación en el espacio Las Armas de Zaragoza. Una experiencia escénica que fusiona danza y música en un formato de gran formato y alta energía.',
          en: 'Performance at the Las Armas venue in Zaragoza. A stage experience merging dance and music in a large-scale, high-energy format.',
        },
      },
      {
        type: { es: 'Activismo & comunidad', en: 'Activism & community' },
        title: 'Danza por el Cambio',
        description: {
          es: 'Proyecto de danza con compromiso social. Participación en una iniciativa que usa el movimiento como herramienta de transformación y conciencia colectiva.',
          en: 'A socially committed dance project. Participation in an initiative that uses movement as a tool for transformation and collective awareness.',
        },
      },
    ],
    schools: [
      {
        name: { es: 'Conservatorio Superior de Danza de Madrid', en: 'Superior Conservatory of Dance of Madrid' },
        detail: {
          es: 'Coreografía e Interpretación · 4.º año · Madrid',
          en: 'Choreography and Interpretation · 4th year · Madrid',
        },
      },
      {
        name: { es: 'Formación en Zaragoza', en: 'Training in Zaragoza' },
        detail: { es: 'Inicio de su trayectoria profesional', en: 'Beginning of her professional career' },
      },
    ],
    companies: ['Teatro Borboleta', 'Huvegrym'],
    creatorsTitle: { es: 'Artistas con los que ha trabajado', en: 'Artists she has worked with' },
    creators: ['Jorge Crecis', 'Sharon Fridman', 'Lucio Baglivo', 'Mercedes Pedroche', 'Marko Fonseca', 'Cecilia Vincent'],
    portrait: {
      src: vegaPortrait,
      alt: { es: 'Retrato en blanco y negro de Vega Grimalt Arnal bailando', en: 'Black and white portrait of Vega Grimalt Arnal dancing' },
      credit: photographers.oscarbarea,
    },
    portraitAlt: {
      src: vegaPortrait2,
      alt: { es: 'Vega Grimalt Arnal sentada en el suelo en un invernadero', en: 'Vega Grimalt Arnal sitting on the floor of a glasshouse' },
    },
    gallery: [
      {
        src: vegaCalle,
        alt: { es: 'Vega Grimalt Arnal bailando un dúo en la calle', en: 'Vega Grimalt Arnal dancing a duet in the street' },
        credit: photographers.adoras,
      },
      {
        src: vegaSolo,
        alt: { es: 'Vega Grimalt Arnal en un solo de danza contemporánea', en: 'Vega Grimalt Arnal in a contemporary dance solo' },
        credit: photographers.oscarbarea,
      },
      {
        src: duoEscena,
        alt: { es: 'Vega Grimalt Arnal en escena junto a otros intérpretes', en: 'Vega Grimalt Arnal on stage with other performers' },
      },
    ],
    ogImage: '/og/vega-grimalt-arnal.jpg',
    seo: {
      title: {
        es: 'Vega Grimalt Arnal | Bailarina y coreógrafa · Huvegrym',
        en: 'Vega Grimalt Arnal | Dancer and choreographer · Huvegrym',
      },
      description: {
        es: 'Vega Grimalt Arnal es bailarina y coreógrafa de danza contemporánea en Madrid e integrante de Huvegrym. Trayectoria, formación y proyectos como Pas de Trois.',
        en: 'Vega Grimalt Arnal is a contemporary dancer and choreographer based in Madrid and a member of Huvegrym. Career, training and projects such as Pas de Trois.',
      },
    },
  },
];

export const getArtist = (slug: string) => artists.find((a) => a.slug === slug);
