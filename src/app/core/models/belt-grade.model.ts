import { Cintura } from './technique.model';

export interface BeltGradeSection {
  id: string;
  title: string;
  techniqueIds?: string[];
  items?: string[];
}

export interface BeltGrade {
  id: string;
  order: number;
  gradeLabel: string;
  beltColor: Cintura;
  disclaimer: string;
  sections: BeltGradeSection[];
  sources: { title: string; url: string }[];
}
