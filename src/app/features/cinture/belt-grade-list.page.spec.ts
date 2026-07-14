import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BeltGradeListPage } from './belt-grade-list.page';
import { BeltProgressService } from '../../core/services/belt-progress.service';
import { StorageService } from '../../core/services/storage.service';

class FakeStorage {
  store = new Map<string, string>();
  async get(key: string) { return this.store.get(key) ?? null; }
  async set(key: string, value: string) { this.store.set(key, value); }
}

const SIX_GRADES = [
  { id: 'kyu-6', order: 1, gradeLabel: '6° Kyu', beltColor: 'bianca', disclaimer: 'd', sections: [], sources: [] },
  { id: 'kyu-5', order: 2, gradeLabel: '5° Kyu', beltColor: 'gialla', disclaimer: 'd', sections: [], sources: [] },
  { id: 'kyu-4', order: 3, gradeLabel: '4° Kyu', beltColor: 'arancione', disclaimer: 'd', sections: [], sources: [] },
  { id: 'kyu-3', order: 4, gradeLabel: '3° Kyu', beltColor: 'verde', disclaimer: 'd', sections: [], sources: [] },
  { id: 'kyu-2', order: 5, gradeLabel: '2° Kyu', beltColor: 'blu', disclaimer: 'd', sources: [], sections: [] },
  { id: 'kyu-1', order: 6, gradeLabel: '1° Kyu', beltColor: 'marrone', disclaimer: 'd', sections: [], sources: [] }
];

describe('BeltGradeListPage', () => {
  let fixture: ComponentFixture<BeltGradeListPage>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BeltGradeListPage],
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        provideRouter([]),
        { provide: StorageService, useValue: new FakeStorage() }
      ]
    });
    fixture = TestBed.createComponent(BeltGradeListPage);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());

  it('mostra le 6 righe dei gradi Kyu', () => {
    fixture.detectChanges();
    httpMock.expectOne('assets/data/belt-grades.json').flush(SIX_GRADES);
    fixture.detectChanges();
    expect(fixture.componentInstance.grades().length).toBe(6);
  });

  it('mostra lo stato "current" per la cintura impostata come attuale', async () => {
    const progress = TestBed.inject(BeltProgressService);
    await progress.setCurrentGrade('kyu-4');
    fixture.detectChanges();
    httpMock.expectOne('assets/data/belt-grades.json').flush(SIX_GRADES);
    fixture.detectChanges();
    const kyu4 = fixture.componentInstance.grades().find(g => g.id === 'kyu-4')!;
    expect(fixture.componentInstance.statusFor(kyu4)).toBe('current');
  });
});
