import { CategoryChipComponent } from './category-chip.component';

describe('CategoryChipComponent', () => {
  it('mappa nage-waza su etichetta e colore verde', () => {
    const c = new CategoryChipComponent();
    c.categoria = 'nage-waza';
    expect(c.label).toBe('Nage-waza');
    expect(c.color).toBe('var(--judo-green)');
  });
  it('mappa katame-waza su rosso', () => {
    const c = new CategoryChipComponent();
    c.categoria = 'katame-waza';
    expect(c.color).toBe('var(--judo-red)');
  });
});
