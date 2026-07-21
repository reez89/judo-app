import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, checkmarkCircleOutline } from 'ionicons/icons';
import { ContentService } from '../../core/services/content.service';
import { BeltProgressService } from '../../core/services/belt-progress.service';
import { Technique } from '../../core/models/technique.model';

const SEZIONI_SICUREZZA = ['Shime-waza', 'Kansetsu-waza'];

interface ResolvedSection {
  id: string;
  title: string;
  techniques: Technique[];
  items?: string[];
}

@Component({
  selector: 'app-belt-grade-detail',
  standalone: true,
  imports: [
    RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonIcon
  ],
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/cinture"></ion-back-button></ion-buttons>
      <ion-title>{{ grade()?.gradeLabel }}</ion-title>
    </ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      @if (grade(); as g) {
        <ion-segment [value]="tab()" (ionChange)="setTab($any($event).detail.value)">
          <ion-segment-button value="panoramica"><ion-label>Panoramica</ion-label></ion-segment-button>
          <ion-segment-button value="tecniche"><ion-label>Tecniche</ion-label></ion-segment-button>
          <ion-segment-button value="fonti"><ion-label>Fonti</ion-label></ion-segment-button>
        </ion-segment>

        @if (tab() === 'panoramica') {
          <h1>{{ g.gradeLabel }} — Cintura {{ g.beltColor }}</h1>
          <p class="disclaimer">{{ g.disclaimer }}</p>
        }

        @if (tab() === 'tecniche') {
          @for (s of resolvedSections(); track s.id) {
            <h3>{{ s.title }}</h3>
            @if (isSicurezzaSection(s.title)) {
              <p class="sicurezza">⚠️ Da insegnare ed eseguire solo sotto la supervisione di un tecnico qualificato.</p>
            }
            @if (s.techniques.length > 0) {
              <ion-list>
                @for (t of s.techniques; track t.id) {
                  <ion-item [routerLink]="['/tabs/tecniche', t.id]" detail>
                    <ion-label>{{ t.nomeGiapponese }}</ion-label>
                    <button
                      type="button"
                      class="studiata-toggle"
                      slot="end"
                      [attr.aria-label]="(progress.isStudied(t.id) ? 'Segna ' + t.nomeGiapponese + ' come non studiata' : 'Segna ' + t.nomeGiapponese + ' come studiata')"
                      [attr.aria-pressed]="progress.isStudied(t.id) ? 'true' : 'false'"
                      (click)="toggleStudiata($event, t.id)">
                      <ion-icon aria-hidden="true" [name]="progress.isStudied(t.id) ? 'checkmark-circle' : 'checkmark-circle-outline'"></ion-icon>
                    </button>
                  </ion-item>
                }
              </ion-list>
            }
            @if (s.items) {
              <ul>@for (i of s.items; track i) { <li>{{ i }}</li> }</ul>
            }
          }
        }

        @if (tab() === 'fonti') {
          <ul>@for (src of g.sources; track src.url) { <li><a [href]="src.url" target="_blank">{{ src.title }}</a></li> }</ul>
        }
      } @else {
        <p class="judo-muted">Grado non trovato.</p>
      }
    </ion-content>
  `,
  styles: [`
    h1{ margin:16px 0 2px; }
    h3{ margin-top:20px; color: var(--judo-purple); }
    .disclaimer{ color: var(--judo-muted); font-style: italic; }
    .sicurezza{ color: var(--judo-red); font-weight: 600; }
    ul{ line-height:1.6; }
    .studiata-toggle{
      background:none; border:none; appearance:none; -webkit-appearance:none;
      display:flex; align-items:center; justify-content:center;
      min-width:2.75rem; min-height:2.75rem; padding:0; margin:0;
      color: var(--judo-green); font-size:1.5rem;
    }
    .studiata-toggle:focus-visible{ outline:2px solid var(--judo-purple); outline-offset:2px; }
  `]
})
export class BeltGradeDetailPage {
  private route = inject(ActivatedRoute);
  private content = inject(ContentService);
  protected progress = inject(BeltProgressService);
  private id = this.route.snapshot.paramMap.get('id') ?? '';

  constructor() {
    addIcons({ 'checkmark-circle': checkmarkCircle, 'checkmark-circle-outline': checkmarkCircleOutline });
  }

  private allTechniques = toSignal(this.content.getTechniques(), { initialValue: [] as Technique[] });
  grade = toSignal(this.content.getBeltGrade(this.id), { initialValue: undefined });

  tab = signal<'panoramica' | 'tecniche' | 'fonti'>('panoramica');
  setTab(t: 'panoramica' | 'tecniche' | 'fonti') { this.tab.set(t); }

  resolvedSections = computed<ResolvedSection[]>(() => {
    const g = this.grade();
    if (!g) return [];
    const techniquesById = new Map(this.allTechniques().map(t => [t.id, t]));
    return g.sections.map(s => ({
      id: s.id,
      title: s.title,
      techniques: (s.techniqueIds ?? []).map(id => techniquesById.get(id)).filter((t): t is Technique => !!t),
      items: s.items
    }));
  });

  isSicurezzaSection(title: string): boolean {
    return SEZIONI_SICUREZZA.includes(title);
  }

  toggleStudiata(event: Event, techniqueId: string): void {
    event.stopPropagation();
    event.preventDefault();
    this.progress.toggleStudied(techniqueId);
  }
}
