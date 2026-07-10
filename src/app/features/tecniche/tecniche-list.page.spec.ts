import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TecnicheListPage } from './tecniche-list.page';
import { ContentService } from '../../core/services/content.service';
import { Technique } from '../../core/models/technique.model';

const t = (id: string, cat: 'nage-waza' | 'katame-waza'): Technique => ({
  id, nomeGiapponese: id, nomeItaliano: id, categoria: cat, cintura: 'gialla',
  descrizione: '', passaggi: [], media: [], tags: []
});

describe('TecnicheListPage', () => {
  let page: TecnicheListPage;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ContentService, useValue: { getTechniques: () => of([t('a', 'nage-waza'), t('b', 'katame-waza')]) } }]
    });
    page = TestBed.runInInjectionContext(() => new TecnicheListPage());
  });

  it('mostra tutte le tecniche di default', () => {
    expect(page.risultati().length).toBe(2);
  });
  it('applica il filtro categoria', () => {
    page.setCategoria('katame-waza');
    expect(page.risultati().map(x => x.id)).toEqual(['b']);
  });
});
