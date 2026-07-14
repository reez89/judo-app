import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { FavoritesService } from './core/services/favorites.service';
import { BeltProgressService } from './core/services/belt-progress.service';
import { StorageService } from './core/services/storage.service';

class FakeStorage {
  store = new Map<string, string>();
  async get(key: string) { return this.store.get(key) ?? null; }
  async set(key: string, value: string) { this.store.set(key, value); }
}

describe('AppComponent', () => {
  it('should create the app', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), { provide: StorageService, useClass: FakeStorage }]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('carica favorites e belt progress all\'avvio', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), { provide: StorageService, useClass: FakeStorage }]
    }).compileComponents();

    const favorites = TestBed.inject(FavoritesService);
    const progress = TestBed.inject(BeltProgressService);
    const favoritesLoadSpy = spyOn(favorites, 'load').and.callThrough();
    const progressLoadSpy = spyOn(progress, 'load').and.callThrough();

    TestBed.createComponent(AppComponent);

    expect(favoritesLoadSpy).toHaveBeenCalled();
    expect(progressLoadSpy).toHaveBeenCalled();
  });
});
