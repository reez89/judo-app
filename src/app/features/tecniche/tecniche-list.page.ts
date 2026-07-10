import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { ContentService } from '../../core/services/content.service';
import { filterTechniques } from '../../core/services/technique-filter';
import { Categoria, Cintura } from '../../core/models/technique.model';
import { CategoryChipComponent } from '../../shared/category-chip/category-chip.component';

@Component({
  selector: 'app-tecniche-list',
  standalone: true,
  imports: [
    RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
    IonList, IonItem, IonLabel, CategoryChipComponent
  ],
  template: `
    <ion-header><ion-toolbar><ion-title><span class="judo-kanji">柔道</span> Tecniche</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <ion-searchbar placeholder="Cerca tecnica…" (ionInput)="setQuery($any($event).target.value)"></ion-searchbar>
      <div class="filters">
        <span class="chip" [class.on]="!categoria()" (click)="setCategoria(null)">Tutte</span>
        <span class="chip" [class.on]="categoria()==='nage-waza'" (click)="setCategoria('nage-waza')">Nage-waza</span>
        <span class="chip" [class.on]="categoria()==='katame-waza'" (click)="setCategoria('katame-waza')">Katame-waza</span>
      </div>
      <div class="filters">
        <span class="chip" [class.on]="!cintura()" (click)="setCintura(null)">Ogni cintura</span>
        @for (c of cinture; track c) {
          <span class="chip" [class.on]="cintura()===c" (click)="setCintura(c)">{{ c }}</span>
        }
      </div>
      <ion-list>
        @for (t of risultati(); track t.id) {
          <ion-item [routerLink]="['/tabs/tecniche', t.id]" detail>
            <ion-label>
              <h2>{{ t.nomeGiapponese }}</h2>
              <p class="judo-muted">{{ t.nomeItaliano }}</p>
            </ion-label>
            <app-category-chip slot="end" [categoria]="t.categoria"></app-category-chip>
          </ion-item>
        }
        @empty { <ion-item lines="none"><ion-label class="judo-muted">Nessuna tecnica trovata.</ion-label></ion-item> }
      </ion-list>
    </ion-content>
  `,
  styles: [`
    .filters{ display:flex; gap:8px; padding:8px 16px; flex-wrap:wrap; }
    .chip{ font-size:12px; font-weight:700; padding:6px 12px; border-radius:999px; text-transform:capitalize;
      background: var(--judo-surface); color: var(--judo-muted); border:1px solid var(--judo-border); }
    .chip.on{ background: var(--judo-purple-base); color:#fff; border-color: var(--judo-purple-base); }
  `]
})
export class TecnicheListPage {
  private content = inject(ContentService);
  private all = toSignal(this.content.getTechniques(), { initialValue: [] });

  private query = signal('');
  categoria = signal<Categoria | null>(null);
  cintura = signal<Cintura | null>(null);
  readonly cinture: Cintura[] = ['bianca', 'gialla', 'arancione', 'verde', 'blu', 'marrone'];

  risultati = computed(() => filterTechniques(this.all(), {
    query: this.query(), categoria: this.categoria(), cintura: this.cintura()
  }));

  setQuery(v: string) { this.query.set(v ?? ''); }
  setCategoria(c: Categoria | null) { this.categoria.set(c); }
  setCintura(c: Cintura | null) { this.cintura.set(c); }
}
