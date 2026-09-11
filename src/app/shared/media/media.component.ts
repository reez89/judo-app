import { Component, Input, OnChanges, inject, signal } from '@angular/core';
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
          <video [src]="v.src" controls playsinline autoplay preload="metadata" (error)="onVideoError()"></video>
        } @else if (primary; as p) {
          <img [src]="p.src" [alt]="p.didascalia || altFallback" />
        }
      </div>
      @if (!showingVideo() && (primary || videoItem) && (!youtubeItem || videoItem)) {
        <button class="play-btn" type="button" (click)="onPlayClick()">
          <ion-icon aria-hidden="true" name="play-circle"></ion-icon>
          <span>Video</span>
        </button>
      }
      @if (videoFailed()) {
        <p role="status">Il video non è disponibile sul dispositivo. Puoi aprirlo su YouTube.</p>
      }
      @if (sourceUrl; as url) {
        <a class="source-link" [href]="url" target="_blank" rel="noopener noreferrer">
          {{ videoItem ? 'Fonte: KODOKAN · YouTube' : 'Guarda su YouTube · KODOKAN' }}
        </a>
      }
    </div>
  `,
  styles: [`
    .media-wrap{ display:flex; flex-direction:column; }
    .media{ border-radius:16px; overflow:hidden; background: var(--judo-surface); }
    img, video{ width:100%; display:block; }
    .play-btn{ align-self:flex-start; margin-top:8px; display:flex; align-items:center; gap:6px;
      background: var(--judo-surface); border:1px solid var(--judo-border); border-radius:999px;
      padding:6px 12px; color: var(--judo-purple); font-size:.8125rem; font-weight:700; }
    .play-btn ion-icon{ font-size:1.125rem; }
    .source-link{ align-self:flex-start; margin-top:8px; font-size:.8125rem; color:var(--judo-purple); }
  `]
})
export class MediaComponent implements OnChanges {
  private toastCtrl = inject(ToastController);
  @Input() items: MediaItem[] = [];
  @Input() altFallback = '';

  showingVideo = signal<MediaItem | null>(null);
  videoFailed = signal(false);

  ngOnChanges(): void {
    this.showingVideo.set(null);
    this.videoFailed.set(false);
  }

  onVideoError(): void {
    this.videoFailed.set(true);
  }

  constructor() {
    addIcons({ 'play-circle': playCircle });
  }

  get primary(): MediaItem | undefined {
    return this.items.find(i => i.tipo !== 'video' && i.tipo !== 'youtube');
  }

  get videoItem(): MediaItem | undefined {
    return this.items.find(i => i.tipo === 'video');
  }

  get youtubeItem(): MediaItem | undefined {
    return this.items.find(i => i.tipo === 'youtube');
  }

  get sourceUrl(): string | undefined {
    return this.videoItem?.sourceUrl ?? this.youtubeItem?.src;
  }

  async onPlayClick(): Promise<void> {
    const video = this.videoItem;
    if (video) {
      this.videoFailed.set(false);
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
