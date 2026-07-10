import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';

const KEY = 'favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private storage = inject(StorageService);
  private ids = signal<string[]>([]);
  readonly favorites = this.ids.asReadonly();

  async load(): Promise<void> {
    const raw = await this.storage.get(KEY);
    this.ids.set(raw ? JSON.parse(raw) : []);
  }

  isFavorite(id: string): boolean {
    return this.ids().includes(id);
  }

  async toggle(id: string): Promise<void> {
    const cur = this.ids();
    const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    this.ids.set(next);
    await this.storage.set(KEY, JSON.stringify(next));
  }
}
