import type { ImageMetadata } from 'astro';

import auditorioZaragoza from '@/assets/images/venues/auditorio-zaragoza.jpg';
import teatroPavon from '@/assets/images/venues/teatro-pavon.jpg';
import resad from '@/assets/images/venues/resad.jpg';
import ifema from '@/assets/images/venues/ifema.jpg';
import museoGargallo from '@/assets/images/venues/museo-gargallo.jpg';
import museoSerrano from '@/assets/images/venues/museo-serrano.jpg';
import auditorioXior from '@/assets/images/venues/auditorio-xior.jpg';
import villafranca from '@/assets/images/venues/villafranca.jpg';
import villanueva from '@/assets/images/venues/villanueva.jpg';

export type VenueCategory = 'teatro' | 'no-convencional' | 'urbano';

export interface Venue {
  id: string;
  name: string;
  city?: string;
  category: VenueCategory;
  image: ImageMetadata;
}

export const VENUE_CATEGORIES: VenueCategory[] = ['teatro', 'no-convencional', 'urbano'];

export const venues: Venue[] = [
  { id: 'auditorio-zaragoza', name: 'Auditorio de Zaragoza', city: 'Zaragoza', category: 'teatro', image: auditorioZaragoza },
  { id: 'teatro-pavon', name: 'Teatro Pavón', city: 'Madrid', category: 'teatro', image: teatroPavon },
  { id: 'resad', name: 'RESAD', city: 'Madrid', category: 'teatro', image: resad },
  { id: 'ifema', name: 'IFEMA (Aula)', city: 'Madrid', category: 'no-convencional', image: ifema },
  { id: 'museo-gargallo', name: 'Museo Pablo Gargallo', city: 'Zaragoza', category: 'no-convencional', image: museoGargallo },
  { id: 'museo-serrano', name: 'Museo Pablo Serrano', city: 'Zaragoza', category: 'no-convencional', image: museoSerrano },
  { id: 'auditorio-xior', name: 'Auditorio Xior', category: 'no-convencional', image: auditorioXior },
  { id: 'villafranca', name: 'Villafranca de Ebro', city: 'Zaragoza', category: 'urbano', image: villafranca },
  { id: 'villanueva', name: 'Villanueva de Gállego', city: 'Zaragoza', category: 'urbano', image: villanueva },
];
