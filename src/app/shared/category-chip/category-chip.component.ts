import { Component, Input } from '@angular/core';
import { Categoria } from '../../core/models/technique.model';

@Component({
  selector: 'app-category-chip',
  standalone: true,
  template: `<span class="chip" [style.color]="color" [style.background]="bg">{{ label }}</span>`,
  styles: [`.chip{ font-size:11px; font-weight:700; padding:4px 9px; border-radius:999px; }`]
})
export class CategoryChipComponent {
  @Input() categoria!: Categoria;
  get label(): string {
    return this.categoria === 'nage-waza' ? 'Nage-waza' : 'Katame-waza';
  }
  get color(): string {
    return this.categoria === 'nage-waza' ? 'var(--judo-green)' : 'var(--judo-red)';
  }
  get bg(): string {
    return this.categoria === 'nage-waza' ? 'rgba(75,216,138,.14)' : 'rgba(255,107,100,.14)';
  }
}
