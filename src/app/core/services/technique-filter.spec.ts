import { filterTechniques } from './technique-filter';
import { Technique } from '../models/technique.model';

const base: Technique = {
  id: 'x', nomeGiapponese: '', nomeItaliano: '', categoria: 'nage-waza',
  cintura: 'gialla', descrizione: '', passaggi: [], media: [], tags: []
};
const list: Technique[] = [
  { ...base, id: 'osoto-gari', nomeGiapponese: 'Osoto-gari', nomeItaliano: 'Grande falciata esterna', categoria: 'nage-waza', cintura: 'gialla' },
  { ...base, id: 'kesa', nomeGiapponese: 'Kesa-gatame', nomeItaliano: 'Controllo a sciarpa', categoria: 'katame-waza', cintura: 'gialla' },
  { ...base, id: 'seoi', nomeGiapponese: 'Seoi-nage', nomeItaliano: 'Proiezione di spalla', categoria: 'nage-waza', cintura: 'arancione' }
];

describe('filterTechniques', () => {
  it('senza filtri ritorna tutto', () => {
    expect(filterTechniques(list, {}).length).toBe(3);
  });
  it('filtra per categoria', () => {
    expect(filterTechniques(list, { categoria: 'nage-waza' }).map(t => t.id)).toEqual(['osoto-gari', 'seoi']);
  });
  it('filtra per cintura', () => {
    expect(filterTechniques(list, { cintura: 'arancione' }).map(t => t.id)).toEqual(['seoi']);
  });
  it('cerca sul nome giapponese, case-insensitive', () => {
    expect(filterTechniques(list, { query: 'osoto' }).map(t => t.id)).toEqual(['osoto-gari']);
  });
  it('cerca sul nome italiano', () => {
    expect(filterTechniques(list, { query: 'sciarpa' }).map(t => t.id)).toEqual(['kesa']);
  });
  it('combina i filtri', () => {
    expect(filterTechniques(list, { categoria: 'nage-waza', cintura: 'gialla' }).map(t => t.id)).toEqual(['osoto-gari']);
  });
});
