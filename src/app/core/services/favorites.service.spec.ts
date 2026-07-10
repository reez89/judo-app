import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';
import { StorageService } from './storage.service';

class FakeStorage {
  store = new Map<string, string>();
  async get(key: string) { return this.store.get(key) ?? null; }
  async set(key: string, value: string) { this.store.set(key, value); }
}

describe('FavoritesService', () => {
  let service: FavoritesService;
  let storage: FakeStorage;

  beforeEach(() => {
    storage = new FakeStorage();
    TestBed.configureTestingModule({
      providers: [FavoritesService, { provide: StorageService, useValue: storage }]
    });
    service = TestBed.inject(FavoritesService);
  });

  it('parte vuoto', () => {
    expect(service.favorites()).toEqual([]);
    expect(service.isFavorite('osoto-gari')).toBeFalse();
  });

  it('toggle aggiunge e persiste', async () => {
    await service.toggle('osoto-gari');
    expect(service.isFavorite('osoto-gari')).toBeTrue();
    expect(await storage.get('favorites')).toBe(JSON.stringify(['osoto-gari']));
  });

  it('toggle due volte rimuove', async () => {
    await service.toggle('osoto-gari');
    await service.toggle('osoto-gari');
    expect(service.isFavorite('osoto-gari')).toBeFalse();
  });

  it('load ripristina dallo storage', async () => {
    await storage.set('favorites', JSON.stringify(['seoi']));
    await service.load();
    expect(service.isFavorite('seoi')).toBeTrue();
  });
});
