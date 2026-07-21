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
  it('usa il token di tint invece di un colore hardcoded per lo sfondo', () => {
    const c = new CategoryChipComponent();
    c.categoria = 'nage-waza';
    expect(c.bg).toBe('var(--judo-green-tint)');
    c.categoria = 'katame-waza';
    expect(c.bg).toBe('var(--judo-red-tint)');
  });
});
