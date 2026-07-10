import { Categoria, Cintura, Technique } from '../models/technique.model';

export interface TechniqueFilter {
  query?: string;
  categoria?: Categoria | null;
  cintura?: Cintura | null;
}

export function filterTechniques(list: Technique[], f: TechniqueFilter): Technique[] {
  const q = (f.query ?? '').trim().toLowerCase();
  return list.filter(t => {
    if (f.categoria && t.categoria !== f.categoria) return false;
    if (f.cintura && t.cintura !== f.cintura) return false;
    if (q && !`${t.nomeGiapponese} ${t.nomeItaliano}`.toLowerCase().includes(q)) return false;
    return true;
  });
}
