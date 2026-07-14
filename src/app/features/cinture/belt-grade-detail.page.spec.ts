import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router, RouterLink } from '@angular/router';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BeltGradeDetailPage } from './belt-grade-detail.page';
import { StorageService } from '../../core/services/storage.service';
import { BeltProgressService } from '../../core/services/belt-progress.service';

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
        provideRouter([]),
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

  it('nel tab Tecniche mostra il banner di sicurezza per Shime-waza ma non per Gokyo', () => {
    fixture.detectChanges();
    httpMock.expectOne('assets/data/belt-grades.json').flush([GRADE]);
    httpMock.expectOne('assets/data/techniques.json').flush(TECHNIQUES);
    fixture.detectChanges();
    fixture.componentInstance.setTab('tecniche');
    fixture.detectChanges();

    const html = (fixture.nativeElement as HTMLElement).innerHTML;
    const gokyoIdx = html.indexOf('Gokyo — 3° gruppo');
    const shimeIdx = html.indexOf('Shime-waza');
    const competenzeIdx = html.indexOf('Competenze dinamiche');
    expect(gokyoIdx).toBeGreaterThan(-1);
    expect(shimeIdx).toBeGreaterThan(gokyoIdx);
    expect(competenzeIdx).toBeGreaterThan(shimeIdx);

    const banners = (fixture.nativeElement as HTMLElement).querySelectorAll('p.sicurezza');
    expect(banners.length).toBe(1);
    expect((banners[0] as HTMLElement).textContent).toContain('supervisione di un tecnico qualificato');
    const bannerIdx = html.indexOf('supervisione di un tecnico qualificato');
    // il banner deve stare tra il titolo Shime-waza e quello successivo (Competenze dinamiche),
    // quindi non è associato alla sezione Gokyo (che non è tra le sezioni di sicurezza).
    expect(bannerIdx).toBeGreaterThan(shimeIdx);
    expect(bannerIdx).toBeLessThan(competenzeIdx);
  });

  it('nel tab Tecniche renderizza un ion-item con routerLink verso la tecnica risolta', () => {
    fixture.detectChanges();
    httpMock.expectOne('assets/data/belt-grades.json').flush([GRADE]);
    httpMock.expectOne('assets/data/techniques.json').flush(TECHNIQUES);
    fixture.detectChanges();
    fixture.componentInstance.setTab('tecniche');
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    const linkDirectives = fixture.debugElement.queryAll(By.directive(RouterLink))
      .map(de => de.injector.get(RouterLink));
    const tomoeLink = linkDirectives.find(dir => {
      const tree = dir.urlTree;
      return tree !== null && router.serializeUrl(tree) === '/tabs/tecniche/tomoe-nage';
    });
    expect(tomoeLink).toBeTruthy();
  });

  it('il click sull\'icona di stato invoca toggleStudiata senza navigare e aggiorna lo stato studiato', () => {
    fixture.detectChanges();
    httpMock.expectOne('assets/data/belt-grades.json').flush([GRADE]);
    httpMock.expectOne('assets/data/techniques.json').flush(TECHNIQUES);
    fixture.detectChanges();
    fixture.componentInstance.setTab('tecniche');
    fixture.detectChanges();

    const progress = TestBed.inject(BeltProgressService);
    expect(progress.isStudied('tomoe-nage')).toBeFalse();

    const icon = (fixture.nativeElement as HTMLElement).querySelector('ion-item ion-icon') as HTMLElement;
    expect(icon).withContext('icona toggle non trovata nel DOM').toBeTruthy();

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    icon.dispatchEvent(clickEvent);
    fixture.detectChanges();

    expect(clickEvent.defaultPrevented).toBeTrue();
    expect(progress.isStudied('tomoe-nage')).toBeTrue();
  });
});
