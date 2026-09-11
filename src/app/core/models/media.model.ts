export type MediaType = 'placeholder' | 'gif' | 'video' | 'foto' | 'youtube';
export interface MediaItem {
  tipo: MediaType;
  src: string;
  didascalia?: string;
  sourceUrl?: string;
  provider?: string;
}
