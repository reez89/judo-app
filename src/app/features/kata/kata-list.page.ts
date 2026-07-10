import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { ContentService } from '../../core/services/content.service';

@Component({
  selector: 'app-kata-list',
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonList, IonItem, IonLabel],
  template: `
    <ion-header><ion-toolbar><ion-title><span class="judo-kanji">形</span> Kata</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <ion-searchbar placeholder="Cerca kata…" (ionInput)="setQuery($any($event).target.value)"></ion-searchbar>
      <ion-list>
        @for (k of risultati(); track k.id) {
          <ion-item [routerLink]="['/tabs/kata', k.id]" detail>
            <ion-label>
              <h2>{{ k.nomeGiapponese }}</h2>
              <p class="judo-muted">{{ k.nomeItaliano }}</p>
            </ion-label>
          </ion-item>
        }
        @empty { <ion-item lines="none"><ion-label class="judo-muted">Nessun kata trovato.</ion-label></ion-item> }
      </ion-list>
    </ion-content>
  `
})
export class KataListPage {
  private content = inject(ContentService);
  private all = toSignal(this.content.getKata(), { initialValue: [] });
  private query = signal('');

  risultati = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.all().filter(k =>
      !q || `${k.nomeGiapponese} ${k.nomeItaliano}`.toLowerCase().includes(q));
  });

  setQuery(v: string) { this.query.set(v ?? ''); }
}
