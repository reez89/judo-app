import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton
} from '@ionic/angular/standalone';
import { ContentService } from '../../core/services/content.service';
import { MediaComponent } from '../../shared/media/media.component';

@Component({
  selector: 'app-kata-detail',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, MediaComponent],
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/kata"></ion-back-button></ion-buttons>
      <ion-title>Kata</ion-title>
    </ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      @if (kata(); as k) {
        <app-media [items]="k.media"></app-media>
        <h1>{{ k.nomeGiapponese }}</h1>
        <p class="judo-muted">{{ k.nomeItaliano }}</p>
        <p>{{ k.descrizione }}</p>
        @for (s of k.serie; track s.titolo) {
          <h3>{{ s.titolo }}</h3>
          <ul>@for (t of s.tecniche; track t) { <li>{{ t }}</li> }</ul>
        }
      } @else {
        <p class="judo-muted">Kata non trovato.</p>
      }
    </ion-content>
  `,
  styles: [`h1{ margin:16px 0 2px; } h3{ margin-top:20px; color: var(--judo-purple); } ul{ line-height:1.6; }`]
})
export class KataDetailPage {
  private route = inject(ActivatedRoute);
  private content = inject(ContentService);
  private id = this.route.snapshot.paramMap.get('id') ?? '';
  kata = toSignal(this.content.getKataById(this.id), { initialValue: undefined });
}
