import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { FavoritesService } from './core/services/favorites.service';
import { BeltProgressService } from './core/services/belt-progress.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private favorites = inject(FavoritesService);
  private progress = inject(BeltProgressService);
  private theme = inject(ThemeService);

  constructor() {
    this.favorites.load();
    this.progress.load();
    this.theme.init();
  }
}
