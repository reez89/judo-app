import { MediaItem } from './media.model';
export type Categoria = 'nage-waza' | 'katame-waza';
export type Cintura = 'bianca' | 'gialla' | 'arancione' | 'verde' | 'blu' | 'marrone';
export interface Technique {
  id: string;
  nomeGiapponese: string;
  nomeItaliano: string;
  categoria: Categoria;
  cintura: Cintura;
  descrizione: string;
  passaggi: string[];
  media: MediaItem[];
  tags: string[];
}
