import { Component, Input, inject, signal } from '@angular/core';
import { IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { playCircle } from 'ionicons/icons';
import { MediaItem } from '../../core/models/media.model';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [IonIcon],
  template: `
    <div class="media-wrap">
      <div class="media">
        @if (showingVideo(); as v) {
          <video [src]="v.src" controls playsinline autoplay></video>
        } @else if (primary; as p) {
          <img [src]="p.src" [alt]="p.didascalia || 'media'" />
        }
      </div>
      @if (!showingVideo() && primary) {
        <button class="play-btn" type="button" (click)="onPlayClick()">
          <ion-icon name="play-circle"></ion-icon>
          <span>Video</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .media-wrap{ display:flex; flex-direction:column; }
    .media{ border-radius:16px; overflow:hidden; background: var(--judo-surface); }
    img, video{ width:100%; display:block; }
    .play-btn{ align-self:flex-start; margin-top:8px; display:flex; align-items:center; gap:6px;
      background: var(--judo-surface); border:1px solid var(--judo-border); border-radius:999px;
      padding:6px 12px; color: var(--judo-purple); font-size:13px; font-weight:700; }
    .play-btn ion-icon{ font-size:18px; }
  `]
})
export class MediaComponent {
  private toastCtrl = inject(ToastController);
  @Input() items: MediaItem[] = [];

  showingVideo = signal<MediaItem | null>(null);

  constructor() {
    addIcons({ 'play-circle': playCircle });
  }

  get primary(): MediaItem | undefined {
    return this.items.find(i => i.tipo !== 'video') ?? this.items[0];
  }

  get videoItem(): MediaItem | undefined {
    return this.items.find(i => i.tipo === 'video');
  }

  async onPlayClick(): Promise<void> {
    const video = this.videoItem;
    if (video) {
      this.showingVideo.set(video);
      return;
    }
    const toast = await this.toastCtrl.create({
      message: 'Video in arrivo',
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
