import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { PreferitiPage } from './preferiti.page';
import { ContentService } from '../../core/services/content.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { Technique } from '../../core/models/technique.model';

const t = (id: string): Technique => ({
  id, nomeGiapponese: id, nomeItaliano: id, categoria: 'nage-waza', cintura: 'gialla',
  descrizione: '', passaggi: [], media: [], tags: []
});

describe('PreferitiPage', () => {
  it('mostra solo le tecniche nei preferiti', () => {
    const favs = signal<string[]>(['b']);
    TestBed.configureTestingModule({
      providers: [
        { provide: ContentService, useValue: { getTechniques: () => of([t('a'), t('b')]) } },
        { provide: FavoritesService, useValue: { favorites: favs.asReadonly() } }
      ]
    });
    const page = TestBed.runInInjectionContext(() => new PreferitiPage());
    expect(page.preferite().map(x => x.id)).toEqual(['b']);
  });
});
