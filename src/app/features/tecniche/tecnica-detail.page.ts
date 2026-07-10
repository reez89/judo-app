import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon
} from '@ionic/angular/standalone';
import { ContentService } from '../../core/services/content.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { MediaComponent } from '../../shared/media/media.component';
import { CategoryChipComponent } from '../../shared/category-chip/category-chip.component';
import { BeltBadgeComponent } from '../../shared/belt-badge/belt-badge.component';

@Component({
  selector: 'app-tecnica-detail',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonButton, IonIcon, MediaComponent, CategoryChipComponent, BeltBadgeComponent
  ],
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/tecniche"></ion-back-button></ion-buttons>
      <ion-title>Tecnica</ion-title>
      <ion-buttons slot="end">
        <ion-button (click)="toggleFav()">
          <ion-icon [name]="isFav() ? 'heart' : 'heart-outline'" [style.color]="'var(--judo-red)'"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      @if (tecnica(); as t) {
        <app-media [item]="t.media[0]"></app-media>
        <h1>{{ t.nomeGiapponese }}</h1>
        <p class="judo-muted">{{ t.nomeItaliano }}</p>
        <div class="badges">
          <app-category-chip [categoria]="t.categoria"></app-category-chip>
          <app-belt-badge [cintura]="t.cintura"></app-belt-badge>
        </div>
        <p>{{ t.descrizione }}</p>
        <ol>@for (p of t.passaggi; track p) { <li>{{ p }}</li> }</ol>
      } @else {
        <p class="judo-muted">Tecnica non trovata.</p>
      }
    </ion-content>
  `,
  styles: [`
    h1{ margin:16px 0 2px; }
    .badges{ display:flex; gap:8px; margin:12px 0; }
    ol{ padding-left:20px; line-height:1.6; }
  `]
})
export class TecnicaDetailPage {
  private route = inject(ActivatedRoute);
  private content = inject(ContentService);
  private favorites = inject(FavoritesService);
  private id = this.route.snapshot.paramMap.get('id') ?? '';

  tecnica = toSignal(this.content.getTechnique(this.id), { initialValue: undefined });
  isFav = signal(this.favorites.isFavorite(this.id));

  toggleFav() {
    this.favorites.toggle(this.id);
    this.isFav.set(this.favorites.isFavorite(this.id));
  }
}
