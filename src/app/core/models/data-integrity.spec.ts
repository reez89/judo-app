import techniques from '../../../assets/data/techniques.json';
import kata from '../../../assets/data/kata.json';
import beltGrades from '../../../assets/data/belt-grades.json';
import { Technique } from './technique.model';
import { Kata } from './kata.model';
import { BeltGrade } from './belt-grade.model';

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

  it('le tecniche del 1° gruppo Gokyo e le loro varianti sono in cintura gialla', () => {
    const list = techniques as Technique[];
    const gialla = ['osoto-gari', 'o-goshi', 'seoi-nage', 'de-ashi-barai', 'ouchi-gari',
      'uki-goshi', 'sasae-tsurikomi-ashi', 'ippon-seoi-nage',
      'kesa-gatame', 'yoko-shiho-gatame', 'kami-shiho-gatame', 'tate-shiho-gatame'];
    gialla.forEach(id => {
      const t = list.find(x => x.id === id);
      expect(t?.cintura).withContext(id).toBe('gialla');
    });
  });

  it('le tecniche del 2° gruppo Gokyo sono in cintura arancione', () => {
    const list = techniques as Technique[];
    const arancione = ['kouchi-gari', 'tai-otoshi', 'tsuri-komi-goshi', 'harai-goshi', 'uchi-mata', 'kata-gatame'];
    arancione.forEach(id => {
      const t = list.find(x => x.id === id);
      expect(t?.cintura).withContext(id).toBe('arancione');
    });
  });

  it('le tecniche del 3° gruppo Gokyo sono in cintura verde', () => {
    const list = techniques as Technique[];
    const verde = ['hane-goshi', 'tomoe-nage', 'juji-gatame', 'ude-garami'];
    verde.forEach(id => {
      const t = list.find(x => x.id === id);
      expect(t?.cintura).withContext(id).toBe('verde');
    });
  });

  it('le tecniche del 4° gruppo Gokyo sono in cintura blu', () => {
    const list = techniques as Technique[];
    const blu = ['hadaka-jime', 'okuri-eri-jime'];
    blu.forEach(id => {
      const t = list.find(x => x.id === id);
      expect(t?.cintura).withContext(id).toBe('blu');
    });
  });

  it('la cintura gialla ha tutte le 15 tecniche del programma consigliato', () => {
    const count = (techniques as Technique[]).filter(t => t.cintura === 'gialla').length;
    expect(count).toBe(15);
  });

  it('la cintura arancione ha tutte le 11 tecniche del programma consigliato', () => {
    const count = (techniques as Technique[]).filter(t => t.cintura === 'arancione').length;
    expect(count).toBe(11);
  });

  it('la cintura verde ha tutte le 13 tecniche del programma consigliato', () => {
    const count = (techniques as Technique[]).filter(t => t.cintura === 'verde').length;
    expect(count).toBe(13);
  });

  it('la cintura blu ha tutte le 14 tecniche del programma consigliato', () => {
    const count = (techniques as Technique[]).filter(t => t.cintura === 'blu').length;
    expect(count).toBe(14);
  });

  it('la cintura marrone ha tutte le 8 tecniche del programma consigliato', () => {
    const count = (techniques as Technique[]).filter(t => t.cintura === 'marrone').length;
    expect(count).toBe(8);
  });

  it('il totale delle tecniche corrisponde a tutti i 40 lanci Gokyo + varianti + katame-waza', () => {
    expect((techniques as Technique[]).length).toBe(61);
  });

  it('ci sono esattamente 6 gradi Kyu ordinati da 1 (bianca) a 6 (marrone)', () => {
    const grades = beltGrades as BeltGrade[];
    expect(grades.length).toBe(6);
    const orders = grades.map(g => g.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('ogni techniqueId referenziato nei gradi Kyu esiste in techniques.json', () => {
    const techniqueIds = new Set((techniques as Technique[]).map(t => t.id));
    (beltGrades as BeltGrade[]).forEach(grade => {
      grade.sections.forEach(section => {
        (section.techniqueIds ?? []).forEach(id => {
          expect(techniqueIds.has(id)).withContext(`${grade.id} → ${section.id} → ${id}`).toBeTrue();
        });
      });
    });
  });

  it('ogni grado ha un disclaimer e almeno una fonte', () => {
    (beltGrades as BeltGrade[]).forEach(g => {
      expect(g.disclaimer).toBeTruthy();
      expect(g.sources.length).toBeGreaterThan(0);
    });
  });
});
