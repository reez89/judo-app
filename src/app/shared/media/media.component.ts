import { Component, Input } from '@angular/core';
import { MediaItem } from '../../core/models/media.model';

@Component({
  selector: 'app-media',
  standalone: true,
  template: `
    <div class="media">
      @if (isVideo) {
        <video [src]="item.src" controls playsinline></video>
      } @else {
        <img [src]="item.src" [alt]="item.didascalia || 'media'" />
      }
    </div>
  `,
  styles: [`
    .media{ border-radius:16px; overflow:hidden; background: var(--judo-surface); }
    img, video{ width:100%; display:block; }
  `]
})
export class MediaComponent {
  @Input() item!: MediaItem;
  get isVideo(): boolean { return this.item.tipo === 'video'; }
  get isImage(): boolean { return this.item.tipo === 'placeholder' || this.item.tipo === 'gif' || this.item.tipo === 'foto'; }
}
