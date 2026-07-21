import { Component, Input } from '@angular/core';
import { Cintura } from '../../core/models/technique.model';

@Component({
  selector: 'app-belt-badge',
  standalone: true,
  template: `<span class="badge">Cintura {{ cintura }}</span>`,
  styles: [`.badge{ font-size:.6875rem; font-weight:700; padding:4px 9px; border-radius:999px;
    color: var(--judo-purple); background: var(--judo-purple-tint); text-transform: capitalize; }`]
})
export class BeltBadgeComponent {
  @Input() cintura!: Cintura;
}
