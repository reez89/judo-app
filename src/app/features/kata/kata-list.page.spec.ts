import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { KataListPage } from './kata-list.page';
import { ContentService } from '../../core/services/content.service';
import { Kata } from '../../core/models/kata.model';

const k = (id: string, jp: string): Kata => ({
  id, nomeGiapponese: jp, nomeItaliano: '', descrizione: '', serie: [{ titolo: 's', tecniche: [] }], media: []
});

describe('KataListPage', () => {
  let page: KataListPage;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ContentService, useValue: { getKata: () => of([k('nage-no-kata', 'Nage-no-kata'), k('katame-no-kata', 'Katame-no-kata')]) } }
      ]
    });
    page = TestBed.runInInjectionContext(() => new KataListPage());
  });

  it('mostra tutti i kata di default', () => {
    expect(page.risultati().length).toBe(2);
  });
  it('cerca per nome', () => {
    page.setQuery('katame');
    expect(page.risultati().map(x => x.id)).toEqual(['katame-no-kata']);
  });

  it('il kanji nel titolo è nascosto allo screen reader', () => {
    const fixture: ComponentFixture<KataListPage> = TestBed.createComponent(KataListPage);
    fixture.detectChanges();
    const kanji = fixture.nativeElement.querySelector('.judo-kanji') as HTMLElement;
    expect(kanji.getAttribute('aria-hidden')).toBe('true');
  });
});
