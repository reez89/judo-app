import techniques from '../../../assets/data/techniques.json';
import kata from '../../../assets/data/kata.json';
import { Technique } from './technique.model';
import { Kata } from './kata.model';

const CATEGORIE = ['nage-waza', 'katame-waza'];
const CINTURE = ['bianca', 'gialla', 'arancione', 'verde', 'blu', 'marrone'];

describe('Integrità dati contenuti', () => {
  it('ogni tecnica ha i campi richiesti e valori validi', () => {
    (techniques as Technique[]).forEach(t => {
      expect(t.id).toBeTruthy();
      expect(t.nomeGiapponese).toBeTruthy();
      expect(t.nomeItaliano).toBeTruthy();
      expect(CATEGORIE).toContain(t.categoria);
      expect(CINTURE).toContain(t.cintura);
      expect(Array.isArray(t.passaggi)).toBeTrue();
      expect(t.media.length).toBeGreaterThan(0);
    });
  });

  it('gli id delle tecniche sono unici', () => {
    const ids = (techniques as Technique[]).map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ogni kata ha id, nomi e almeno una serie', () => {
    (kata as Kata[]).forEach(k => {
      expect(k.id).toBeTruthy();
      expect(k.nomeGiapponese).toBeTruthy();
      expect(k.serie.length).toBeGreaterThan(0);
    });
  });
});
