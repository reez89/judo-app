import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { Technique } from '../models/technique.model';
import { Kata } from '../models/kata.model';
import { BeltGrade } from '../models/belt-grade.model';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private http = inject(HttpClient);
  private techniques$?: Observable<Technique[]>;
  private kata$?: Observable<Kata[]>;
  private beltGrades$?: Observable<BeltGrade[]>;

  getTechniques(): Observable<Technique[]> {
    if (!this.techniques$) {
      this.techniques$ = this.http.get<Technique[]>('assets/data/techniques.json').pipe(shareReplay(1));
    }
    return this.techniques$;
  }

  getKata(): Observable<Kata[]> {
    if (!this.kata$) {
      this.kata$ = this.http.get<Kata[]>('assets/data/kata.json').pipe(shareReplay(1));
    }
    return this.kata$;
  }

  getBeltGrades(): Observable<BeltGrade[]> {
    if (!this.beltGrades$) {
      this.beltGrades$ = this.http.get<BeltGrade[]>('assets/data/belt-grades.json').pipe(shareReplay(1));
    }
    return this.beltGrades$;
  }

  getTechnique(id: string): Observable<Technique | undefined> {
    return this.getTechniques().pipe(map(list => list.find(t => t.id === id)));
  }

  getKataById(id: string): Observable<Kata | undefined> {
    return this.getKata().pipe(map(list => list.find(k => k.id === id)));
  }

  getBeltGrade(id: string): Observable<BeltGrade | undefined> {
    return this.getBeltGrades().pipe(map(list => list.find(g => g.id === id)));
  }
}
