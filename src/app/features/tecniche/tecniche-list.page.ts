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
    <ion-header><ion-toolbar><ion-title><span class="judo-kanji" aria-hidden="true">柔道</span> Tecniche</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <ion-searchbar placeholder="Cerca tecnica…" (ionInput)="setQuery($any($event).target.value)"></ion-searchbar>
      <div class="filters" role="group" aria-label="Filtra per categoria">
        <button type="button" class="chip" [class.on]="!categoria()" [attr.aria-pressed]="!categoria() ? 'true' : 'false'" (click)="setCategoria(null)">Tutte</button>
        <button type="button" class="chip" [class.on]="categoria()==='nage-waza'" [attr.aria-pressed]="categoria()==='nage-waza' ? 'true' : 'false'" (click)="setCategoria('nage-waza')">Nage-waza</button>
        <button type="button" class="chip" [class.on]="categoria()==='katame-waza'" [attr.aria-pressed]="categoria()==='katame-waza' ? 'true' : 'false'" (click)="setCategoria('katame-waza')">Katame-waza</button>
      </div>
      <div class="filters" role="group" aria-label="Filtra per cintura">
        <button type="button" class="chip" [class.on]="!cintura()" [attr.aria-pressed]="!cintura() ? 'true' : 'false'" (click)="setCintura(null)">Ogni cintura</button>
        @for (c of cinture; track c) {
          <button type="button" class="chip" [class.on]="cintura()===c" [attr.aria-pressed]="cintura()===c ? 'true' : 'false'" (click)="setCintura(c)">{{ c }}</button>
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
    .chip{ font-size:.75rem; font-weight:700; padding:6px 12px; border-radius:999px; text-transform:capitalize;
      background: var(--judo-surface); color: var(--judo-muted); border:1px solid var(--judo-border);
      appearance:none; -webkit-appearance:none; font-family:inherit; cursor:pointer; }
    .chip.on{ background: var(--judo-purple-base); color:#fff; border-color: var(--judo-purple-base); }
    .chip:focus-visible{ outline:2px solid var(--judo-purple); outline-offset:2px; }
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
