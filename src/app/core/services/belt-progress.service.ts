import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { BeltGrade } from '../models/belt-grade.model';

const CURRENT_GRADE_KEY = 'belt-current-grade';
const STUDIED_KEY = 'belt-studied-techniques';

@Injectable({ providedIn: 'root' })
export class BeltProgressService {
  private storage = inject(StorageService);
  private grade = signal<string | null>(null);
  private studied = signal<string[]>([]);

  readonly currentGradeId = this.grade.asReadonly();
  readonly studiedTechniqueIds = this.studied.asReadonly();

  async load(): Promise<void> {
    const grade = await this.storage.get(CURRENT_GRADE_KEY);
    this.grade.set(grade);
    const studiedRaw = await this.storage.get(STUDIED_KEY);
    this.studied.set(studiedRaw ? JSON.parse(studiedRaw) : []);
  }

  async setCurrentGrade(id: string): Promise<void> {
    this.grade.set(id);
    await this.storage.set(CURRENT_GRADE_KEY, id);
  }

  async toggleStudied(techniqueId: string): Promise<void> {
    const cur = this.studied();
    const next = cur.includes(techniqueId) ? cur.filter(x => x !== techniqueId) : [...cur, techniqueId];
    this.studied.set(next);
    await this.storage.set(STUDIED_KEY, JSON.stringify(next));
  }

  isStudied(techniqueId: string): boolean {
    return this.studied().includes(techniqueId);
  }

  statusFor(grade: BeltGrade, allGrades: BeltGrade[]): 'earned' | 'current' | 'upcoming' {
    const currentId = this.grade();
    if (!currentId) return 'upcoming';
    if (grade.id === currentId) return 'current';
    const currentGrade = allGrades.find(g => g.id === currentId);
    if (!currentGrade) return 'upcoming';
    return grade.order < currentGrade.order ? 'earned' : 'upcoming';
  }

  completionFor(grade: BeltGrade): number {
    const ids: string[] = grade.sections.reduce<string[]>(
      (acc, s) => acc.concat(s.techniqueIds ?? []),
      []
    );
    if (ids.length === 0) return 0;
    const done = ids.filter(id => this.isStudied(id)).length;
    return Math.round((done / ids.length) * 100);
  }
}
