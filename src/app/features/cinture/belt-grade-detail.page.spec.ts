import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BeltGradeDetailPage } from './belt-grade-detail.page';
import { StorageService } from '../../core/services/storage.service';

class FakeStorage {
  store = new Map<string, string>();
  async get(key: string) { return this.store.get(key) ?? null; }
  async set(key: string, value: string) { this.store.set(key, value); }
}

const GRADE = {
  id: 'kyu-3', order: 4, gradeLabel: '3° Kyu', beltColor: 'verde',
  disclaimer: 'Programma consigliato, non ufficiale.',
  sections: [
    { id: 'gokyo-3', title: 'Gokyo — 3° gruppo', techniqueIds: ['tomoe-nage'] },
    { id: 'shime-waza', title: 'Shime-waza', techniqueIds: ['nami-juji-jime'] },
    { id: 'competenze-dinamiche', title: 'Competenze dinamiche', items: ['Individuazione del Tokui-waza'] }
  ],
  sources: [{ title: 'Regolamento Organico Federale', url: 'https://example.com' }]
};

const TECHNIQUES = [
  { id: 'tomoe-nage', nomeGiapponese: 'Tomoe-nage', nomeItaliano: 'Proiezione circolare', categoria: 'nage-waza', cintura: 'verde', descrizione: '', passaggi: [], media: [], tags: [] },
  { id: 'nami-juji-jime', nomeGiapponese: 'Nami-juji-jime', nomeItaliano: 'Strangolamento a croce normale', categoria: 'katame-waza', cintura: 'verde', descrizione: '', passaggi: [], media: [], tags: [] }
];

describe('BeltGradeDetailPage', () => {
  let fixture: ComponentFixture<BeltGradeDetailPage>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BeltGradeDetailPage],
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        { provide: StorageService, useValue: new FakeStorage() },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'kyu-3' }) } } }
      ]
    });
    fixture = TestBed.createComponent(BeltGradeDetailPage);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());

  it('risolve le tecniche vere delle sezioni con techniqueIds', () => {
    fixture.detectChanges();
    httpMock.expectOne('assets/data/belt-grades.json').flush([GRADE]);
    httpMock.expectOne('assets/data/techniques.json').flush(TECHNIQUES);
    fixture.detectChanges();
    const gokyoSection = fixture.componentInstance.resolvedSections().find(s => s.id === 'gokyo-3')!;
    expect(gokyoSection.techniques[0].nomeGiapponese).toBe('Tomoe-nage');
  });

  it('mostra il banner di sicurezza per Shime-waza', () => {
    fixture.detectChanges();
    httpMock.expectOne('assets/data/belt-grades.json').flush([GRADE]);
    httpMock.expectOne('assets/data/techniques.json').flush(TECHNIQUES);
    fixture.detectChanges();
    const shimeSection = fixture.componentInstance.resolvedSections().find(s => s.id === 'shime-waza')!;
    expect(fixture.componentInstance.isSicurezzaSection(shimeSection.title)).toBeTrue();
  });

  it('le sezioni con items mostrano il testo semplice', () => {
    fixture.detectChanges();
    httpMock.expectOne('assets/data/belt-grades.json').flush([GRADE]);
    httpMock.expectOne('assets/data/techniques.json').flush(TECHNIQUES);
    fixture.detectChanges();
    const competenze = fixture.componentInstance.resolvedSections().find(s => s.id === 'competenze-dinamiche')!;
    expect(competenze.items).toEqual(['Individuazione del Tokui-waza']);
  });
});
