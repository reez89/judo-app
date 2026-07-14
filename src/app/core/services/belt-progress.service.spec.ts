import { TestBed } from '@angular/core/testing';
import { BeltProgressService } from './belt-progress.service';
import { StorageService } from './storage.service';
import { BeltGrade } from '../models/belt-grade.model';

class FakeStorage {
  store = new Map<string, string>();
  async get(key: string) { return this.store.get(key) ?? null; }
  async set(key: string, value: string) { this.store.set(key, value); }
}

const kyu4: BeltGrade = {
  id: 'kyu-4', order: 3, gradeLabel: '4° Kyu', beltColor: 'arancione',
  disclaimer: '', sources: [],
  sections: [{ id: 's1', title: 'Gokyo', techniqueIds: ['a', 'b', 'c', 'd'] }]
};

describe('BeltProgressService', () => {
  let service: BeltProgressService;
  let storage: FakeStorage;

  beforeEach(() => {
    storage = new FakeStorage();
    TestBed.configureTestingModule({
      providers: [BeltProgressService, { provide: StorageService, useValue: storage }]
    });
    service = TestBed.inject(BeltProgressService);
  });

  it('parte senza cintura attuale e nessuna tecnica studiata', () => {
    expect(service.currentGradeId()).toBeNull();
    expect(service.studiedTechniqueIds()).toEqual([]);
  });

  it('setCurrentGrade imposta e persiste la cintura attuale', async () => {
    await service.setCurrentGrade('kyu-4');
    expect(service.currentGradeId()).toBe('kyu-4');
    expect(await storage.get('belt-current-grade')).toBe('kyu-4');
  });

  it('toggleStudied aggiunge e rimuove, persistendo', async () => {
    await service.toggleStudied('osoto-gari');
    expect(service.isStudied('osoto-gari')).toBeTrue();
    expect(await storage.get('belt-studied-techniques')).toBe(JSON.stringify(['osoto-gari']));
    await service.toggleStudied('osoto-gari');
    expect(service.isStudied('osoto-gari')).toBeFalse();
  });

  it('load ripristina cintura attuale e tecniche studiate dallo storage', async () => {
    await storage.set('belt-current-grade', 'kyu-3');
    await storage.set('belt-studied-techniques', JSON.stringify(['seoi-nage']));
    await service.load();
    expect(service.currentGradeId()).toBe('kyu-3');
    expect(service.isStudied('seoi-nage')).toBeTrue();
  });

  it('statusFor: earned per order minore, current per order uguale, upcoming per order maggiore', async () => {
    await service.setCurrentGrade('kyu-4'); // order 3
    const earned: BeltGrade = { ...kyu4, id: 'kyu-5', order: 2 };
    const current: BeltGrade = { ...kyu4, id: 'kyu-4', order: 3 };
    const upcoming: BeltGrade = { ...kyu4, id: 'kyu-3', order: 4 };
    const allGrades = [earned, current, upcoming];
    expect(service.statusFor(earned, allGrades)).toBe('earned');
    expect(service.statusFor(current, allGrades)).toBe('current');
    expect(service.statusFor(upcoming, allGrades)).toBe('upcoming');
  });

  it('statusFor: tutti upcoming se nessuna cintura attuale è impostata', () => {
    expect(service.statusFor(kyu4, [kyu4])).toBe('upcoming');
  });

  it('completionFor: 0% senza tecniche studiate, 50% con metà, 100% con tutte', async () => {
    expect(service.completionFor(kyu4)).toBe(0);
    await service.toggleStudied('a');
    await service.toggleStudied('b');
    expect(service.completionFor(kyu4)).toBe(50);
    await service.toggleStudied('c');
    await service.toggleStudied('d');
    expect(service.completionFor(kyu4)).toBe(100);
  });
});
