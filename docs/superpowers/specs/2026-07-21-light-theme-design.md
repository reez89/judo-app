# Tema chiaro (Carta)

Data: 2026-07-21
Branch: `feat/light-theme`

## Contesto

L'app oggi forza sempre il tema scuro ("Ink"): `src/theme/variables.scss` definisce i colori scuri incondizionatamente in `:root`, ignorando la preferenza di sistema. `src/global.scss` importa già `@ionic/angular/css/palettes/dark.system.css` (i toni `ion-color-*` di sistema per il dark), ma è reso inutile dal fatto che `:root` è sempre scuro.

## Obiettivo

Aggiungere un tema chiaro che segue automaticamente la preferenza di sistema (`prefers-color-scheme`), senza toggle manuale né nuovo stato persistito. Tre alternative di palette sono state mostrate all'utente in mockup visivo; scelta: **"Carta"** (bianco-lavanda neutro, specchio del tema scuro attuale).

## Meccanismo

CSS puro via `@media (prefers-color-scheme: dark)`. `:root` diventa la palette chiara di default; i valori scuri attuali si spostano dentro la media query. Nessun servizio di stato, nessuna UI di scelta tema.

## Palette

**Chiaro (default, in `:root`):**
```scss
--ion-background-color: #faf9fc;
--ion-background-color-rgb: 250, 249, 252;
--ion-text-color: #201f29;
--ion-text-color-rgb: 32, 31, 41;

--ion-toolbar-background: #ffffff;
--ion-tab-bar-background: #ffffff;
--ion-item-background: #ffffff;
--ion-card-background: #ffffff;

--ion-color-primary: #6a3fb8;
--ion-color-primary-rgb: 106, 63, 184;
--ion-color-primary-contrast: #ffffff;
--ion-color-primary-contrast-rgb: 255, 255, 255;
--ion-color-primary-shade: #5d379f;
--ion-color-primary-tint: #7952c2;

--judo-purple: #6a3fb8;
--judo-purple-base: #6a3fb8;
--judo-green: #1f8f52;
--judo-red: #d93a35;
--judo-surface: #f1eef8;
--judo-border: #e4e1ec;
--judo-muted: #6b6980;

--judo-green-tint: rgba(31, 143, 82, .14);
--judo-red-tint: rgba(217, 58, 53, .14);
--judo-purple-tint: rgba(106, 63, 184, .2);
```

**Scuro (sotto `@media (prefers-color-scheme: dark)`, valori identici a oggi):**
```scss
--ion-background-color: #141319;
--ion-background-color-rgb: 20, 19, 25;
--ion-text-color: #f0eef6;
--ion-text-color-rgb: 240, 238, 246;

--ion-toolbar-background: #141319;
--ion-tab-bar-background: #1b1a20;
--ion-item-background: #20202a;
--ion-card-background: #20202a;

--ion-color-primary: #8a5cd6;
--ion-color-primary-rgb: 138, 92, 214;
--ion-color-primary-contrast: #ffffff;
--ion-color-primary-contrast-rgb: 255, 255, 255;
--ion-color-primary-shade: #794fbc;
--ion-color-primary-tint: #966bda;

--judo-purple: #b98bff;
--judo-purple-base: #8a5cd6;
--judo-green: #4bd88a;
--judo-red: #ff6b64;
--judo-surface: #20202a;
--judo-border: #2c2b38;
--judo-muted: #8886a0;

--judo-green-tint: rgba(75, 216, 138, .14);
--judo-red-tint: rgba(255, 107, 100, .14);
--judo-purple-tint: rgba(138, 92, 214, .2);
```

Contrasto testo verificato ≥4.5:1 (normale) / ≥3:1 (componenti) su sfondo chiaro, con lo stesso metodo (luminanza relativa WCAG) usato nel fix di accessibilità precedente.

## Refactor necessario: token di tint

`category-chip.component.ts` e `belt-badge.component.ts` oggi hanno colori di sfondo **hardcoded** come `rgba(...)` letterali nel template, scollegati dalle CSS custom properties — in tema chiaro renderebbero un verde/rosso/viola sbagliato (i toni scuri su sfondo chiaro). Introdotti i 3 token `--judo-*-tint` sopra; i due componenti passano da literal a `var(--judo-*-tint)`.

- `category-chip.component.ts`: `get bg()` ritorna `'var(--judo-green-tint)'` / `'var(--judo-red-tint)'` invece dei literal rgba.
- `belt-badge.component.ts`: `background: var(--judo-purple-tint)` invece del literal rgba nello style embedded.

Nessun'altra parte dell'app ha colori hardcoded scollegati dalle variabili (verificato: `tecniche-list.page.ts`, `media.component.ts`, `belt-grade-detail.page.ts` usano già `var(--judo-*)`).

## `theme-color` meta (chrome browser/PWA)

In `src/index.html`, due righe accanto al meta `viewport` esistente:
```html
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#faf9fc">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#141319">
```

## Status bar nativa (iOS)

`@capacitor/status-bar` è già una dipendenza del progetto ma non è mai importato in `src/`. Verificato il sorgente Swift del plugin (`node_modules/@capacitor/status-bar/ios/Sources/StatusBarPlugin/StatusBar.swift`): `Style.Default` imposta `UIStatusBarStyle.default`, che iOS ricalcola automaticamente ad ogni cambio di `userInterfaceStyle` — **nessun listener JS necessario**, basta impostarlo una volta all'avvio.

Nuovo `src/app/core/services/theme.service.ts`, stesso pattern di `FavoritesService`/`BeltProgressService`:
```ts
import { Injectable } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  async init(): Promise<void> {
    await StatusBar.setStyle({ style: Style.Default });
  }
}
```

`AppComponent` lo invoca nel costruttore accanto a `favorites.load()` e `progress.load()`:
```ts
constructor() {
  this.favorites.load();
  this.progress.load();
  this.theme.init();
}
```

## Fuori scope

- Toggle manuale chiaro/scuro/sistema in UI: non richiesto, il meccanismo è puro system-follow.
- Sincronizzazione Android: il progetto non ha target Android (solo iOS via Capacitor).
- `UIUserInterfaceStyle` in `Info.plist`: già assente (non forza nulla), quindi l'app segue già il sistema a livello nativo per gli elementi di sistema (tastiera, alert) — nessuna modifica necessaria lì.

## Test di accettazione

1. `npx ng test --watch=false --browsers=ChromeHeadless` verde, incluso il nuovo test di `ThemeService` (spy su `StatusBar.setStyle`, verifica chiamata con `{ style: Style.Default }`).
2. `npx ng build` pulito.
3. Manuale: iOS Simulator/dispositivo con sistema in chiaro → app chiara, contrasto leggibile; sistema in scuro → app scura invariata rispetto a oggi (nessuna regressione visiva).
4. Manuale: cambio tema di sistema mentre l'app è in foreground → contenuto WebView e status bar nativa si aggiornano entrambi.
5. Verifica grep: nessun `rgba(` letterale rimasto in `category-chip.component.ts` / `belt-badge.component.ts`.

## Rischi di regressione

- Se in futuro si aggiungono nuovi colori hardcoded in componenti, andranno derivati da token `--judo-*`, non da valori letterali — altrimenti si rompe il tema chiaro silenziosamente.
- `ThemeService.init()` su web (browser dev, `ng serve`) userà l'implementazione web di fallback di Capacitor (no-op/warning), comportamento atteso e non bloccante.
