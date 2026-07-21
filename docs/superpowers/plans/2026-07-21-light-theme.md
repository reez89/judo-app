# Tema Chiaro (Carta) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere un tema chiaro ("Carta") che segue automaticamente `prefers-color-scheme`, sostituendo la palette scura forzata di oggi con un default chiaro + variante scura sotto media query, come da `docs/superpowers/specs/2026-07-21-light-theme-design.md`.

**Architecture:** CSS puro (`@media (prefers-color-scheme: dark)`) per i colori; un nuovo `ThemeService` (stesso pattern di `FavoritesService`/`BeltProgressService`) per sincronizzare la status bar nativa iOS una tantum all'avvio. Nessun toggle, nessuno stato persistito, nessuna nuova dipendenza (`@capacitor/status-bar` è già installato).

**Tech Stack:** Angular 20 standalone, Ionic 8, SCSS custom properties, `@capacitor/status-bar`, Karma + Jasmine (`npx ng test --watch=false --browsers=ChromeHeadless`).

## Global Constraints

- Branch: `feat/light-theme`, creato in Task 0 off `master`.
- I valori scuri attuali ("Ink") non devono cambiare aspetto: si spostano sotto `@media (prefers-color-scheme: dark)` senza modificare nessun valore esadecimale esistente.
- Nessun colore hardcoded scollegato dalle CSS custom properties: ogni colore nei componenti applicativi deve derivare da un token `--judo-*` o `--ion-*`.
- `ThemeService.init()` non va mai atteso (`await`) nel costruttore di `AppComponent` — stesso stile fire-and-forget di `favorites.load()`/`progress.load()`.
- Ogni task termina con `npx ng test --watch=false --browsers=ChromeHeadless` verde prima del commit.

---

### Task 0: Crea il branch di lavoro

- [ ] **Step 1:**
```bash
git checkout -b feat/light-theme
```
- [ ] **Step 2: Verifica**
```bash
git branch --show-current
```
Expected: `feat/light-theme`

---

### Task 1: `variables.scss` — palette chiara di default + scura sotto media query

**Files:**
- Modify: `src/theme/variables.scss`

**Interfaces:**
- Produces: token `--judo-green-tint`, `--judo-red-tint`, `--judo-purple-tint` (stringhe rgba), consumati da Task 2.

- [ ] **Step 1: Sostituisci l'intero contenuto del file**

Sostituisci tutto `src/theme/variables.scss` con:

```scss
// For information on how to create your own theme, please refer to:
// https://ionicframework.com/docs/theming/

:root {
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

  /* Token app */
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
}

@media (prefers-color-scheme: dark) {
  :root {
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

    /* Token app */
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
  }
}
```

- [ ] **Step 2: Verifica con grep**

```bash
grep -c "prefers-color-scheme: dark" src/theme/variables.scss
grep -c "judo-green-tint" src/theme/variables.scss
grep -c "judo-purple-tint" src/theme/variables.scss
```
Expected: `1`, `2`, `2` (il token appare una volta in `:root` e una sotto la media query).

- [ ] **Step 3: Commit**

```bash
git add src/theme/variables.scss
git commit -m "feat(theme): palette chiara Carta di default, scura sotto prefers-color-scheme"
```

---

### Task 2: Token di tint al posto dei colori hardcoded

**Files:**
- Modify: `src/app/shared/category-chip/category-chip.component.ts`
- Modify: `src/app/shared/category-chip/category-chip.component.spec.ts`
- Modify: `src/app/shared/belt-badge/belt-badge.component.ts`
- Create: `src/app/shared/belt-badge/belt-badge.component.spec.ts`

**Interfaces:**
- Consumes: `--judo-green-tint`, `--judo-red-tint`, `--judo-purple-tint` (Task 1).

- [ ] **Step 1: Scrivi il test fallito per `category-chip`**

Aggiungi in `src/app/shared/category-chip/category-chip.component.spec.ts`, dopo l'ultimo `it` esistente:

```ts
  it('usa il token di tint invece di un colore hardcoded per lo sfondo', () => {
    const c = new CategoryChipComponent();
    c.categoria = 'nage-waza';
    expect(c.bg).toBe('var(--judo-green-tint)');
    c.categoria = 'katame-waza';
    expect(c.bg).toBe('var(--judo-red-tint)');
  });
```

- [ ] **Step 2: Scrivi il test fallito per `belt-badge` (nuovo file)**

Crea `src/app/shared/belt-badge/belt-badge.component.spec.ts`:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeltBadgeComponent } from './belt-badge.component';

describe('BeltBadgeComponent', () => {
  let fixture: ComponentFixture<BeltBadgeComponent>;

  afterEach(() => {
    document.documentElement.style.removeProperty('--judo-purple-tint');
  });

  it('legge lo sfondo dal token --judo-purple-tint invece di un colore hardcoded', () => {
    document.documentElement.style.setProperty('--judo-purple-tint', 'rgb(1, 2, 3)');
    fixture = TestBed.createComponent(BeltBadgeComponent);
    fixture.componentInstance.cintura = 'gialla';
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge') as HTMLElement;
    expect(getComputedStyle(badge).backgroundColor).toBe('rgb(1, 2, 3)');
  });
});
```

- [ ] **Step 3: Esegui i test e verifica che falliscano**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: FAIL sui 2 nuovi test (`c.bg` ritorna ancora i literal rgba; il background computato non è `rgb(1, 2, 3)` perché il CSS del componente ha ancora il literal hardcoded).

- [ ] **Step 4: Implementa in `category-chip.component.ts`**

Cambia:
```ts
  get bg(): string {
    return this.categoria === 'nage-waza' ? 'rgba(75,216,138,.14)' : 'rgba(255,107,100,.14)';
  }
```
in:
```ts
  get bg(): string {
    return this.categoria === 'nage-waza' ? 'var(--judo-green-tint)' : 'var(--judo-red-tint)';
  }
```

- [ ] **Step 5: Implementa in `belt-badge.component.ts`**

Cambia:
```ts
  styles: [`.badge{ font-size:.6875rem; font-weight:700; padding:4px 9px; border-radius:999px;
    color: var(--judo-purple); background: rgba(138,92,214,.2); text-transform: capitalize; }`]
```
in:
```ts
  styles: [`.badge{ font-size:.6875rem; font-weight:700; padding:4px 9px; border-radius:999px;
    color: var(--judo-purple); background: var(--judo-purple-tint); text-transform: capitalize; }`]
```

- [ ] **Step 6: Esegui i test e verifica che passino**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: `TOTAL: 80 SUCCESS` (78 + 2 nuovi).

- [ ] **Step 7: Commit**

```bash
git add src/app/shared/category-chip/category-chip.component.ts src/app/shared/category-chip/category-chip.component.spec.ts src/app/shared/belt-badge/belt-badge.component.ts src/app/shared/belt-badge/belt-badge.component.spec.ts
git commit -m "fix(theme): sostituisci colori hardcoded con i token di tint --judo-*-tint"
```

---

### Task 3: `theme-color` meta per la chrome browser/PWA

**Files:**
- Modify: `src/index.html`

- [ ] **Step 1: Aggiungi le due righe**

In `src/index.html`, dopo la riga del meta `viewport`, aggiungi:

```html
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#faf9fc">
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#141319">
```

- [ ] **Step 2: Verifica con grep**

```bash
grep -n 'name="theme-color"' src/index.html
```
Expected: 2 righe, una per `light` e una per `dark`, con i content esatti sopra.

- [ ] **Step 3: Commit**

```bash
git add src/index.html
git commit -m "feat(theme): meta theme-color per chrome browser/PWA"
```

---

### Task 4: `ThemeService` — sincronizza la status bar nativa

**Files:**
- Create: `src/app/core/services/theme.service.ts`
- Create: `src/app/core/services/theme.service.spec.ts`

**Interfaces:**
- Produces: `ThemeService.init(): Promise<void>` — consumato da Task 5.

- [ ] **Step 1: Scrivi il test fallito**

Crea `src/app/core/services/theme.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('imposta lo stile della status bar su Default all\'avvio', async () => {
    const setStyleSpy = spyOn(StatusBar, 'setStyle').and.resolveTo();
    await service.init();
    expect(setStyleSpy).toHaveBeenCalledWith({ style: Style.Default });
  });
});
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: FAIL — `theme.service.ts` non esiste ancora (errore di modulo non trovato).

- [ ] **Step 3: Implementa**

Crea `src/app/core/services/theme.service.ts`:

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

- [ ] **Step 4: Esegui il test e verifica che passi**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: `TOTAL: 81 SUCCESS` (80 + 1 nuovo).

- [ ] **Step 5: Commit**

```bash
git add src/app/core/services/theme.service.ts src/app/core/services/theme.service.spec.ts
git commit -m "feat(theme): ThemeService imposta lo stile status bar nativa su Default"
```

---

### Task 5: `AppComponent` — inizializza il tema all'avvio

**Files:**
- Modify: `src/app/app.component.ts`
- Modify: `src/app/app.component.spec.ts`

**Interfaces:**
- Consumes: `ThemeService.init(): Promise<void>` (Task 4).

- [ ] **Step 1: Scrivi il test fallito**

In `src/app/app.component.spec.ts`, aggiungi l'import mancante in cima (accanto agli altri):

```ts
import { ThemeService } from './core/services/theme.service';
```

Poi aggiungi questo test dentro il `describe('AppComponent', ...)` esistente, dopo l'ultimo `it`:

```ts
  it('inizializza il tema (status bar) all\'avvio', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), { provide: StorageService, useClass: FakeStorage }]
    }).compileComponents();

    const theme = TestBed.inject(ThemeService);
    const themeInitSpy = spyOn(theme, 'init');

    TestBed.createComponent(AppComponent);

    expect(themeInitSpy).toHaveBeenCalled();
  });
```

Nota: qui non usare `.and.callThrough()` — chiamerebbe la vera `StatusBar.setStyle` (comportamento web-fallback di Capacitor, rumoroso nei log di test). Il comportamento reale di `init()` è già coperto da `theme.service.spec.ts` (Task 4).

- [ ] **Step 2: Esegui il test e verifica che fallisca**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: FAIL — `themeInitSpy` non è mai chiamato (il componente non invoca ancora `ThemeService`).

- [ ] **Step 3: Implementa**

In `src/app/app.component.ts`, cambia:

```ts
import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { FavoritesService } from './core/services/favorites.service';
import { BeltProgressService } from './core/services/belt-progress.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private favorites = inject(FavoritesService);
  private progress = inject(BeltProgressService);

  constructor() {
    this.favorites.load();
    this.progress.load();
  }
}
```

in:

```ts
import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { FavoritesService } from './core/services/favorites.service';
import { BeltProgressService } from './core/services/belt-progress.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private favorites = inject(FavoritesService);
  private progress = inject(BeltProgressService);
  private theme = inject(ThemeService);

  constructor() {
    this.favorites.load();
    this.progress.load();
    this.theme.init();
  }
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: `TOTAL: 82 SUCCESS` (81 + 1 nuovo).

- [ ] **Step 5: Commit**

```bash
git add src/app/app.component.ts src/app/app.component.spec.ts
git commit -m "feat(theme): AppComponent inizializza ThemeService all'avvio"
```

---

### Task 6: Verifica finale

**Files:** nessuno (solo verifica).

- [ ] **Step 1: Suite completa**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: `TOTAL: 82 SUCCESS`, 0 FAILED.

- [ ] **Step 2: Build di produzione**

```bash
npx ng build
```
Expected: build completata senza errori.

- [ ] **Step 3: Verifica grep finale — nessun colore hardcoded residuo**

```bash
grep -rn "rgba(75,216,138\|rgba(255,107,100\|rgba(138,92,214" src/app
```
Expected: nessun output (tutti i literal sono stati sostituiti dai token nei file di Task 2; se compaiono altrove, è un gap da correggere prima di procedere).

- [ ] **Step 4: Verifica manuale (checklist da spec, sezione "Test di accettazione")**

Con `npx ionic serve` o simulatore iOS:
1. Sistema in chiaro → app chiara (palette Carta), testo leggibile, contrasto adeguato.
2. Sistema in scuro → app scura, identica visivamente a prima di questo lavoro.
3. Cambio tema di sistema con app in foreground → WebView e status bar nativa (su dispositivo/simulatore reale) si aggiornano entrambi.

Questo step non è automatizzabile e va eseguito da chi implementa prima di aprire la PR.

- [ ] **Step 5: Riepilogo commit del branch**

```bash
git log master..feat/light-theme --oneline
```
Expected: 5 commit (Task 1-5), nessuna modifica non committata (`git status` pulito).
