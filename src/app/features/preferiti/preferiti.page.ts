import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { ContentService } from '../../core/services/content.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { CategoryChipComponent } from '../../shared/category-chip/category-chip.component';

@Component({
  selector: 'app-preferiti',
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, CategoryChipComponent],
  template: `
    <ion-header><ion-toolbar><ion-title>Preferiti</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <ion-list>
        @for (t of preferite(); track t.id) {
          <ion-item [routerLink]="['/tabs/tecniche', t.id]" detail>
            <ion-label>
              <h2>{{ t.nomeGiapponese }}</h2>
              <p class="judo-muted">{{ t.nomeItaliano }}</p>
            </ion-label>
            <app-category-chip slot="end" [categoria]="t.categoria"></app-category-chip>
          </ion-item>
        }
        @empty { <ion-item lines="none"><ion-label class="judo-muted">Nessun preferito. Tocca il cuore su una tecnica per aggiungerla.</ion-label></ion-item> }
      </ion-list>
    </ion-content>
  `
})
export class PreferitiPage {
  private content = inject(ContentService);
  private favorites = inject(FavoritesService);
  private all = toSignal(this.content.getTechniques(), { initialValue: [] });

  preferite = computed(() => {
    const ids = this.favorites.favorites();
    return this.all().filter(t => ids.includes(t.id));
  });
}
