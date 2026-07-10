export type MediaType = 'placeholder' | 'gif' | 'video' | 'foto';
export interface MediaItem {
  tipo: MediaType;
  src: string;
  didascalia?: string;
}
