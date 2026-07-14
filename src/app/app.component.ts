import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { FavoritesService } from './core/services/favorites.service';
import { BeltProgressService } from './core/services/belt-progress.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private favorites = inject(FavoritesService);
  private progress = inject(BeltProgressService);

  constructor() {
    this.favorites.load();
    this.progress.load();
  }
}
