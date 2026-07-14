import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
  IonButtons, IonButton, IonIcon, ActionSheetController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { settingsOutline } from 'ionicons/icons';
import { ContentService } from '../../core/services/content.service';
import { BeltProgressService } from '../../core/services/belt-progress.service';
import { BeltGrade } from '../../core/models/belt-grade.model';

@Component({
  selector: 'app-belt-grade-list',
  standalone: true,
  imports: [
    RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
    IonButtons, IonButton, IonIcon
  ],
  template: `
    <ion-header><ion-toolbar>
      <ion-title>Cinture</ion-title>
      <ion-buttons slot="end">
        <ion-button (click)="apriSelezioneCintura()" aria-label="Imposta la mia cintura attuale">
          <ion-icon slot="icon-only" name="settings-outline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar></ion-header>
    <ion-content>
      <ion-list>
        @for (g of grades(); track g.id) {
          <ion-item [routerLink]="['/tabs/cinture', g.id]" detail>
            <ion-label>
              <h2>{{ g.gradeLabel }}</h2>
              <p class="judo-muted">Cintura {{ g.beltColor }} — {{ statusLabel(statusFor(g)) }}</p>
              @if (statusFor(g) === 'upcoming' && isNextAfterCurrent(g)) {
                <p class="judo-muted">Completamento: {{ progress.completionFor(g) }}%</p>
              }
            </ion-label>
          </ion-item>
        }
      </ion-list>
    </ion-content>
  `
})
export class BeltGradeListPage {
  private content = inject(ContentService);
  protected progress = inject(BeltProgressService);
  private actionSheetCtrl = inject(ActionSheetController);

  constructor() {
    addIcons({ 'settings-outline': settingsOutline });
  }

  grades = toSignal(this.content.getBeltGrades(), { initialValue: [] as BeltGrade[] });

  statusFor(grade: BeltGrade): 'earned' | 'current' | 'upcoming' {
    return this.progress.statusFor(grade, this.grades());
  }

  statusLabel(status: 'earned' | 'current' | 'upcoming'): string {
    return status === 'earned' ? 'Conquistata' : status === 'current' ? 'Attuale' : 'Da fare';
  }

  isNextAfterCurrent(grade: BeltGrade): boolean {
    const currentId = this.progress.currentGradeId();
    if (!currentId) return false;
    const current = this.grades().find(g => g.id === currentId);
    return !!current && grade.order === current.order + 1;
  }

  async apriSelezioneCintura(): Promise<void> {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Imposta la mia cintura attuale',
      buttons: [
        ...this.grades().map(g => ({
          text: `${g.gradeLabel} — ${g.beltColor}`,
          handler: () => this.progress.setCurrentGrade(g.id)
        })),
        { text: 'Annulla', role: 'cancel' }
      ]
    });
    await sheet.present();
  }
}
