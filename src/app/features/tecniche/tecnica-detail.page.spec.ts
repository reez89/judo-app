import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TecnicaDetailPage } from './tecnica-detail.page';
import { ContentService } from '../../core/services/content.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { Technique } from '../../core/models/technique.model';

const tech: Technique = {
  id: 'osoto-gari', nomeGiapponese: 'Osoto-gari', nomeItaliano: 'Grande falciata esterna',
  categoria: 'nage-waza', cintura: 'gialla', descrizione: 'desc', passaggi: ['p1'],
  media: [{ tipo: 'placeholder', src: 'assets/media/placeholder.svg' }], tags: []
};

describe('TecnicaDetailPage', () => {
  let page: TecnicaDetailPage;
  const fav = { isFavorite: () => false, toggle: jasmine.createSpy('toggle') };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ContentService, useValue: { getTechnique: () => of(tech) } },
        { provide: FavoritesService, useValue: fav },
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
});
