import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TecnicaDetailPage } from './tecnica-detail.page';
import { ContentService } from '../../core/services/content.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { StorageService } from '../../core/services/storage.service';
import { Technique } from '../../core/models/technique.model';

const tech: Technique = {
  id: 'osoto-gari', nomeGiapponese: 'Osoto-gari', nomeItaliano: 'Grande falciata esterna',
  categoria: 'nage-waza', cintura: 'gialla', descrizione: 'desc', passaggi: ['p1'],
  media: [{ tipo: 'placeholder', src: 'assets/media/placeholder.svg' }], tags: []
};

class FakeStorage {
  store = new Map<string, string>();
  async get(key: string) { return this.store.get(key) ?? null; }
  async set(key: string, value: string) { this.store.set(key, value); }
}

describe('TecnicaDetailPage', () => {
  let page: TecnicaDetailPage;
  const fav = { isFavorite: () => false, toggle: jasmine.createSpy('toggle') };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ContentService, useValue: { getTechnique: () => of(tech) } },
        { provide: FavoritesService, useValue: fav },
        { provide: StorageService, useValue: new FakeStorage() },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'osoto-gari' } } } }
      ]
    });
    page = TestBed.runInInjectionContext(() => new TecnicaDetailPage());
  });

  it('carica la tecnica dalla route', () => {
    expect(page.tecnica()?.nomeGiapponese).toBe('Osoto-gari');
  });
  it('toggle preferito invoca il servizio', () => {
    page.toggleFav();
    expect(fav.toggle).toHaveBeenCalledWith('osoto-gari');
  });
  it('toggleStudiata inverte lo stato studiata della tecnica', () => {
    expect(page.isStudiata()).toBeFalse();
    page.toggleStudiata();
    expect(page.isStudiata()).toBeTrue();
  });
});
