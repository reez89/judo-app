import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
      providers: [
        provideRouter([]),
        { provide: ContentService, useValue: { getTechniques: () => of([t('a', 'nage-waza'), t('b', 'katame-waza')]) } }
      ]
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

  it('il kanji nel titolo è nascosto allo screen reader', () => {
    const fixture: ComponentFixture<TecnicheListPage> = TestBed.createComponent(TecnicheListPage);
    fixture.detectChanges();
    const kanji = fixture.nativeElement.querySelector('.judo-kanji') as HTMLElement;
    expect(kanji.getAttribute('aria-hidden')).toBe('true');
  });

  it('i chip di filtro sono bottoni con aria-pressed coerente allo stato', () => {
    const fixture: ComponentFixture<TecnicheListPage> = TestBed.createComponent(TecnicheListPage);
    fixture.detectChanges();
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('.filters button.chip')) as HTMLElement[];
    expect(buttons.length).toBeGreaterThan(0);
    const tutteBtn = buttons.find(b => b.textContent?.trim() === 'Tutte')!;
    expect(tutteBtn.tagName).toBe('BUTTON');
    expect(tutteBtn.getAttribute('aria-pressed')).toBe('true');

    const nageBtn = buttons.find(b => b.textContent?.trim() === 'Nage-waza')!;
    nageBtn.click();
    fixture.detectChanges();
    expect(nageBtn.getAttribute('aria-pressed')).toBe('true');
    expect(tutteBtn.getAttribute('aria-pressed')).toBe('false');
  });
});
