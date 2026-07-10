import { MediaItem } from './media.model';
export interface KataSerie {
  titolo: string;
  tecniche: string[];
}
export interface Kata {
  id: string;
  nomeGiapponese: string;
  nomeItaliano: string;
  descrizione: string;
  serie: KataSerie[];
  media: MediaItem[];
}
