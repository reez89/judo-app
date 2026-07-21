import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  async init(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    await StatusBar.setStyle({ style: Style.Default });
  }
}
