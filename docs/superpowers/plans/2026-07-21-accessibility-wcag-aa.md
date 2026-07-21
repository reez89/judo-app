# Accessibilità WCAG 2.2 AA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correggere le barriere di accessibilità concrete trovate nell'audit (`docs/superpowers/specs/2026-07-21-accessibility-wcag-aa-design.md`): zoom bloccato, `lang` errato, controlli icon-only senza nome/stato accessibile, filtri non semantici, alt text generico, font-size in px che non scala con Dynamic Type/zoom.

**Architecture:** App Ionic/Angular standalone esistente, nessuna nuova dipendenza. Ogni task modifica 1-2 file esistenti + il relativo `.spec.ts`. Nessuna nuova astrazione: i fix seguono i pattern già in uso nel codebase (es. `belt-grade-list.page.ts` ha già un `ion-button` con `aria-label` corretto, da replicare).

**Tech Stack:** Angular 20 standalone components, Ionic 8, Karma + Jasmine (`npx ng test --watch=false --browsers=ChromeHeadless`).

## Global Constraints

- Branch: lavorare su `fix/accessibility-wcag-aa` (creato nel Task 0), mai direttamente su `master`.
- Nessuna nuova "modalità accessibile" separata: i fix modificano l'unica esperienza esistente.
- `[attr.aria-pressed]` va sempre legato a un'espressione stringa (`'true'`/`'false'`), mai a un booleano nudo: Angular rimuove l'attributo quando il valore è falsy, il che farebbe sparire `aria-pressed="false"` invece di mostrarlo.
- Non toccare `src/app/tab1`, `src/app/tab2`, `src/app/tab3`, `src/app/explore-container`: boilerplate Ionic non raggiungibile dal routing (`src/app/tabs/tabs.routes.ts`), fuori scope.
- Conversione px→rem riguarda solo `font-size` (la richiesta del documento è specificamente sul testo, sezione 9.1); non toccare padding/border-radius/margin in px, che non sono in scope.
- Ogni task termina con `npx ng test --watch=false --browsers=ChromeHeadless` verde prima del commit.

---

### Task 0: Crea il branch di lavoro

**Files:** nessuno.

- [ ] **Step 1: Crea ed entra nel branch**

```bash
git checkout -b fix/accessibility-wcag-aa
```

- [ ] **Step 2: Verifica**

```bash
git branch --show-current
```
Expected: `fix/accessibility-wcag-aa`

---

### Task 1: `index.html` — lingua e zoom utente

**Files:**
- Modify: `src/index.html`

**Interfaces:** nessuna (file statico, non testato da Karma).

- [ ] **Step 1: Cambia `lang` e rimuovi il blocco zoom**

In `src/index.html`, cambia:
```html
<html lang="en">
```
in:
```html
<html lang="it">
```

E cambia:
```html
<meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```
in:
```html
<meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0" />
```

- [ ] **Step 2: Verifica con grep**

```bash
grep -n 'html lang' src/index.html
grep -n 'name="viewport"' src/index.html
```
Expected:
```
2:<html lang="it">
11:  <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0" />
```

- [ ] **Step 3: Commit**

```bash
git add src/index.html
git commit -m "fix(a11y): lingua it e zoom utente sbloccato"
```

---

### Task 2: `MediaComponent` — alt text significativo + icona decorativa

**Files:**
- Modify: `src/app/shared/media/media.component.ts`
- Test: `src/app/shared/media/media.component.spec.ts`

**Interfaces:**
- Produces: `MediaComponent.altFallback: string` (nuovo `@Input()`, default `''`) — usato dai chiamanti (Task 3, Task 4) per passare un testo di contesto (es. nome tecnica) quando manca `didascalia`.

- [ ] **Step 1: Scrivi i test falliti**

Aggiungi in fondo a `src/app/shared/media/media.component.spec.ts` (dentro il `describe` esistente, prima della chiusura):

```ts
  it('usa altFallback come alt quando manca la didascalia', () => {
    fixture.componentInstance.items = [{ tipo: 'placeholder', src: 'assets/media/placeholder.svg' }];
    fixture.componentInstance.altFallback = 'Osoto-gari';
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img.alt).toBe('Osoto-gari');
  });

  it('usa la didascalia quando presente, ignorando altFallback', () => {
    fixture.componentInstance.items = [
      { tipo: 'placeholder', src: 'assets/media/placeholder.svg', didascalia: 'Presa iniziale' }
    ];
    fixture.componentInstance.altFallback = 'Osoto-gari';
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img.alt).toBe('Presa iniziale');
  });

  it('l\'icona play è decorativa e non annunciata dallo screen reader', () => {
    fixture.componentInstance.items = [{ tipo: 'placeholder', src: 'assets/media/placeholder.svg' }];
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.play-btn ion-icon') as HTMLElement;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });
```

- [ ] **Step 2: Esegui i test e verifica che falliscano**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: FAIL — `TypeScript error: Property 'altFallback' does not exist` (i primi due test), e il terzo fallisce perché `getAttribute('aria-hidden')` è `null`.

- [ ] **Step 3: Implementa**

In `src/app/shared/media/media.component.ts`, cambia il template da:

```ts
  template: `
    <div class="media-wrap">
      <div class="media">
        @if (showingVideo(); as v) {
          <video [src]="v.src" controls playsinline autoplay></video>
        } @else if (primary; as p) {
          <img [src]="p.src" [alt]="p.didascalia || 'media'" />
        }
      </div>
      @if (!showingVideo() && primary) {
        <button class="play-btn" type="button" (click)="onPlayClick()">
          <ion-icon name="play-circle"></ion-icon>
          <span>Video</span>
        </button>
      }
    </div>
  `,
```

in:

```ts
  template: `
    <div class="media-wrap">
      <div class="media">
        @if (showingVideo(); as v) {
          <video [src]="v.src" controls playsinline autoplay></video>
        } @else if (primary; as p) {
          <img [src]="p.src" [alt]="p.didascalia || altFallback" />
        }
      </div>
      @if (!showingVideo() && primary) {
        <button class="play-btn" type="button" (click)="onPlayClick()">
          <ion-icon aria-hidden="true" name="play-circle"></ion-icon>
          <span>Video</span>
        </button>
      }
    </div>
  `,
```

E aggiungi il nuovo `@Input()` accanto a `items`:

```ts
export class MediaComponent {
  private toastCtrl = inject(ToastController);
  @Input() items: MediaItem[] = [];
  @Input() altFallback = '';
```

- [ ] **Step 4: Esegui i test e verifica che passino**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: `TOTAL: 70 SUCCESS` (67 esistenti + 3 nuovi).

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/media/media.component.ts src/app/shared/media/media.component.spec.ts
git commit -m "fix(a11y): alt text significativo e icona play decorativa in MediaComponent"
```

---

### Task 3: `tecnica-detail.page.ts` — nome/stato accessibile sui bottoni icona + altFallback

**Files:**
- Modify: `src/app/features/tecniche/tecnica-detail.page.ts`
- Test: `src/app/features/tecniche/tecnica-detail.page.spec.ts`

**Interfaces:**
- Consumes: `MediaComponent.altFallback: string` (Task 2).

- [ ] **Step 1: Scrivi i test falliti**

Aggiungi in cima a `src/app/features/tecniche/tecnica-detail.page.spec.ts` gli import mancanti (sostituisci la riga d'import esistente):

```ts
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TecnicaDetailPage } from './tecnica-detail.page';
import { ContentService } from '../../core/services/content.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { StorageService } from '../../core/services/storage.service';
import { MediaComponent } from '../../shared/media/media.component';
import { Technique } from '../../core/models/technique.model';
```

Poi aggiungi questi test dentro il `describe('TecnicaDetailPage', ...)` esistente, dopo l'ultimo `it`:

```ts
  it('passa il nome giapponese come altFallback al componente media', () => {
    const fixture = TestBed.createComponent(TecnicaDetailPage);
    fixture.detectChanges();
    const media = fixture.debugElement.query(By.directive(MediaComponent)).componentInstance as MediaComponent;
    expect(media.altFallback).toBe('Osoto-gari');
  });

  it('il bottone preferito espone aria-label e aria-pressed coerenti con lo stato', () => {
    const fixture = TestBed.createComponent(TecnicaDetailPage);
    fixture.detectChanges();
    const favButton = fixture.nativeElement.querySelectorAll('ion-button')[1] as HTMLElement;
    expect(favButton.getAttribute('aria-label')).toBe('Aggiungi ai preferiti');
    expect(favButton.getAttribute('aria-pressed')).toBe('false');

    fixture.componentInstance.isFav.set(true);
    fixture.detectChanges();
    expect(favButton.getAttribute('aria-label')).toBe('Rimuovi dai preferiti');
    expect(favButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('il bottone studiata espone aria-label e aria-pressed coerenti con lo stato', () => {
    const fixture = TestBed.createComponent(TecnicaDetailPage);
    fixture.detectChanges();
    const studiataButton = fixture.nativeElement.querySelectorAll('ion-button')[0] as HTMLElement;
    expect(studiataButton.getAttribute('aria-label')).toBe('Segna come studiata');
    expect(studiataButton.getAttribute('aria-pressed')).toBe('false');

    fixture.componentInstance.isStudiata.set(true);
    fixture.detectChanges();
    expect(studiataButton.getAttribute('aria-label')).toBe('Segna come non studiata');
    expect(studiataButton.getAttribute('aria-pressed')).toBe('true');
  });
```

- [ ] **Step 2: Esegui i test e verifica che falliscano**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: FAIL sui 3 nuovi test (`aria-label`/`aria-pressed`/`altFallback` nulli o assenti).

- [ ] **Step 3: Implementa**

In `src/app/features/tecniche/tecnica-detail.page.ts`, cambia il template da:

```ts
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/tecniche"></ion-back-button></ion-buttons>
      <ion-title>Tecnica</ion-title>
      <ion-buttons slot="end">
        <ion-button (click)="toggleStudiata()">
          <ion-icon [name]="isStudiata() ? 'checkmark-circle' : 'checkmark-circle-outline'" [style.color]="'var(--judo-green)'"></ion-icon>
        </ion-button>
        <ion-button (click)="toggleFav()">
          <ion-icon [name]="isFav() ? 'heart' : 'heart-outline'" [style.color]="'var(--judo-red)'"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      @if (tecnica(); as t) {
        <app-media [items]="t.media"></app-media>
```

in:

```ts
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/tecniche"></ion-back-button></ion-buttons>
      <ion-title>Tecnica</ion-title>
      <ion-buttons slot="end">
        <ion-button
          [attr.aria-label]="isStudiata() ? 'Segna come non studiata' : 'Segna come studiata'"
          [attr.aria-pressed]="isStudiata() ? 'true' : 'false'"
          (click)="toggleStudiata()">
          <ion-icon aria-hidden="true" [name]="isStudiata() ? 'checkmark-circle' : 'checkmark-circle-outline'" [style.color]="'var(--judo-green)'"></ion-icon>
        </ion-button>
        <ion-button
          [attr.aria-label]="isFav() ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'"
          [attr.aria-pressed]="isFav() ? 'true' : 'false'"
          (click)="toggleFav()">
          <ion-icon aria-hidden="true" [name]="isFav() ? 'heart' : 'heart-outline'" [style.color]="'var(--judo-red)'"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      @if (tecnica(); as t) {
        <app-media [items]="t.media" [altFallback]="t.nomeGiapponese"></app-media>
```

- [ ] **Step 4: Esegui i test e verifica che passino**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: `TOTAL: 73 SUCCESS` (70 + 3 nuovi).

- [ ] **Step 5: Commit**

```bash
git add src/app/features/tecniche/tecnica-detail.page.ts src/app/features/tecniche/tecnica-detail.page.spec.ts
git commit -m "fix(a11y): nome e stato accessibili sui bottoni preferito/studiata"
```

---

### Task 4: `kata-detail.page.ts` — altFallback per l'immagine del kata

**Files:**
- Modify: `src/app/features/kata/kata-detail.page.ts`
- Create: `src/app/features/kata/kata-detail.page.spec.ts`

**Interfaces:**
- Consumes: `MediaComponent.altFallback: string` (Task 2).

- [ ] **Step 1: Scrivi il test fallito**

Crea `src/app/features/kata/kata-detail.page.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { KataDetailPage } from './kata-detail.page';
import { ContentService } from '../../core/services/content.service';
import { MediaComponent } from '../../shared/media/media.component';
import { Kata } from '../../core/models/kata.model';

const kata: Kata = {
  id: 'nage-no-kata', nomeGiapponese: 'Nage-no-kata', nomeItaliano: 'Forma delle proiezioni',
  descrizione: 'desc', serie: [{ titolo: 'Te-waza', tecniche: ['Uki-otoshi'] }],
  media: [{ tipo: 'placeholder', src: 'assets/media/placeholder.svg' }]
};

describe('KataDetailPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ContentService, useValue: { getKataById: () => of(kata) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'nage-no-kata' } } } }
      ]
    });
  });

  it('passa il nome giapponese come altFallback al componente media', () => {
    const fixture = TestBed.createComponent(KataDetailPage);
    fixture.detectChanges();
    const media = fixture.debugElement.query(By.directive(MediaComponent)).componentInstance as MediaComponent;
    expect(media.altFallback).toBe('Nage-no-kata');
  });
});
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: FAIL — `media.altFallback` è `''`, non `'Nage-no-kata'`.

- [ ] **Step 3: Implementa**

In `src/app/features/kata/kata-detail.page.ts`, cambia:

```ts
        <app-media [items]="k.media"></app-media>
```

in:

```ts
        <app-media [items]="k.media" [altFallback]="k.nomeGiapponese"></app-media>
```

- [ ] **Step 4: Esegui il test e verifica che passi**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: `TOTAL: 74 SUCCESS`.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/kata/kata-detail.page.ts src/app/features/kata/kata-detail.page.spec.ts
git commit -m "fix(a11y): altFallback per l'immagine del kata"
```

---

### Task 5: `belt-grade-detail.page.ts` — bottone reale per il toggle studiata

**Files:**
- Modify: `src/app/features/cinture/belt-grade-detail.page.ts`
- Test: `src/app/features/cinture/belt-grade-detail.page.spec.ts`

**Interfaces:** nessuna nuova; `toggleStudiata(event: Event, techniqueId: string)` esistente resta invariata.

- [ ] **Step 1: Scrivi il test fallito**

Aggiungi in `src/app/features/cinture/belt-grade-detail.page.spec.ts`, dopo l'ultimo `it(...)` esistente (prima della chiusura del `describe`):

```ts
  it('il bottone toggle studiata espone aria-label e aria-pressed per la tecnica', () => {
    fixture.detectChanges();
    httpMock.expectOne('assets/data/belt-grades.json').flush([GRADE]);
    httpMock.expectOne('assets/data/techniques.json').flush(TECHNIQUES);
    fixture.detectChanges();
    fixture.componentInstance.setTab('tecniche');
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('ion-item button.studiata-toggle') as HTMLElement;
    expect(button).withContext('bottone toggle studiata non trovato').toBeTruthy();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Segna Tomoe-nage come studiata');
  });
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: FAIL — `button.studiata-toggle` non esiste ancora (`button` è `null`).

- [ ] **Step 3: Implementa**

In `src/app/features/cinture/belt-grade-detail.page.ts`, cambia:

```ts
                @for (t of s.techniques; track t.id) {
                  <ion-item [routerLink]="['/tabs/tecniche', t.id]" detail>
                    <ion-label>{{ t.nomeGiapponese }}</ion-label>
                    <ion-icon slot="end" [name]="progress.isStudied(t.id) ? 'checkmark-circle' : 'checkmark-circle-outline'"
                      (click)="toggleStudiata($event, t.id)"></ion-icon>
                  </ion-item>
                }
```

in:

```ts
                @for (t of s.techniques; track t.id) {
                  <ion-item [routerLink]="['/tabs/tecniche', t.id]" detail>
                    <ion-label>{{ t.nomeGiapponese }}</ion-label>
                    <button
                      type="button"
                      class="studiata-toggle"
                      slot="end"
                      [attr.aria-label]="(progress.isStudied(t.id) ? 'Segna ' + t.nomeGiapponese + ' come non studiata' : 'Segna ' + t.nomeGiapponese + ' come studiata')"
                      [attr.aria-pressed]="progress.isStudied(t.id) ? 'true' : 'false'"
                      (click)="toggleStudiata($event, t.id)">
                      <ion-icon aria-hidden="true" [name]="progress.isStudied(t.id) ? 'checkmark-circle' : 'checkmark-circle-outline'"></ion-icon>
                    </button>
                  </ion-item>
                }
```

E aggiungi lo stile del bottone nell'array `styles`, cambiando:

```ts
  styles: [`
    h1{ margin:16px 0 2px; }
    h3{ margin-top:20px; color: var(--judo-purple); }
    .disclaimer{ color: var(--judo-muted); font-style: italic; }
    .sicurezza{ color: var(--judo-red); font-weight: 600; }
    ul{ line-height:1.6; }
  `]
```

in:

```ts
  styles: [`
    h1{ margin:16px 0 2px; }
    h3{ margin-top:20px; color: var(--judo-purple); }
    .disclaimer{ color: var(--judo-muted); font-style: italic; }
    .sicurezza{ color: var(--judo-red); font-weight: 600; }
    ul{ line-height:1.6; }
    .studiata-toggle{
      background:none; border:none; appearance:none; -webkit-appearance:none;
      display:flex; align-items:center; justify-content:center;
      min-width:2.75rem; min-height:2.75rem; padding:0; margin:0;
      color: var(--judo-green); font-size:1.5rem;
    }
    .studiata-toggle:focus-visible{ outline:2px solid var(--judo-purple); outline-offset:2px; }
  `]
```

- [ ] **Step 4: Esegui tutti i test e verifica che passino**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: `TOTAL: 75 SUCCESS`. In particolare verifica che il test preesistente `'il click sull'icona di stato invoca toggleStudiata senza navigare e aggiorna lo stato studiato'` sia ancora verde (il click sull'`ion-icon` bubbla fino al `button` genitore, che gestisce `stopPropagation`/`preventDefault` come prima).

- [ ] **Step 5: Commit**

```bash
git add src/app/features/cinture/belt-grade-detail.page.ts src/app/features/cinture/belt-grade-detail.page.spec.ts
git commit -m "fix(a11y): bottone reale con nome e stato per il toggle studiata in Cinture"
```

---

### Task 6: Liste — filtri come bottoni reali + kanji decorativi nascosti

**Files:**
- Modify: `src/app/features/tecniche/tecniche-list.page.ts`
- Modify: `src/app/features/kata/kata-list.page.ts`
- Test: `src/app/features/tecniche/tecniche-list.page.spec.ts`
- Test: `src/app/features/kata/kata-list.page.spec.ts`

**Interfaces:** nessuna nuova; `setCategoria`, `setCintura`, `setQuery` restano invariate.

- [ ] **Step 1: Scrivi i test falliti**

In `src/app/features/tecniche/tecniche-list.page.spec.ts`, sostituisci l'import in cima:

```ts
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TecnicheListPage } from './tecniche-list.page';
import { ContentService } from '../../core/services/content.service';
import { Technique } from '../../core/models/technique.model';
```

con (aggiungendo `ComponentFixture`):

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TecnicheListPage } from './tecniche-list.page';
import { ContentService } from '../../core/services/content.service';
import { Technique } from '../../core/models/technique.model';
```

Poi aggiungi questi test dentro il `describe('TecnicheListPage', ...)` esistente, dopo l'ultimo `it`:

```ts
  it('il kanji nel titolo è nascosto allo screen reader', () => {
    const fixture: ComponentFixture<TecnicheListPage> = TestBed.createComponent(TecnicheListPage);
    fixture.detectChanges();
    const kanji = fixture.nativeElement.querySelector('.judo-kanji') as HTMLElement;
    expect(kanji.getAttribute('aria-hidden')).toBe('true');
  });

  it('i chip di filtro sono bottoni con aria-pressed coerente allo stato', () => {
    const fixture: ComponentFixture<TecnicheListPage> = TestBed.createComponent(TecnicheListPage);
    fixture.detectChanges();
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('.filters button.chip')) as HTMLElement[];
    expect(buttons.length).toBeGreaterThan(0);
    const tutteBtn = buttons.find(b => b.textContent?.trim() === 'Tutte')!;
    expect(tutteBtn.tagName).toBe('BUTTON');
    expect(tutteBtn.getAttribute('aria-pressed')).toBe('true');

    const nageBtn = buttons.find(b => b.textContent?.trim() === 'Nage-waza')!;
    nageBtn.click();
    fixture.detectChanges();
    expect(nageBtn.getAttribute('aria-pressed')).toBe('true');
    expect(tutteBtn.getAttribute('aria-pressed')).toBe('false');
  });
```

In `src/app/features/kata/kata-list.page.spec.ts`, sostituisci l'import in cima:

```ts
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { KataListPage } from './kata-list.page';
import { ContentService } from '../../core/services/content.service';
import { Kata } from '../../core/models/kata.model';
```

con:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { KataListPage } from './kata-list.page';
import { ContentService } from '../../core/services/content.service';
import { Kata } from '../../core/models/kata.model';
```

E aggiungi, dopo l'ultimo `it` esistente:

```ts
  it('il kanji nel titolo è nascosto allo screen reader', () => {
    const fixture: ComponentFixture<KataListPage> = TestBed.createComponent(KataListPage);
    fixture.detectChanges();
    const kanji = fixture.nativeElement.querySelector('.judo-kanji') as HTMLElement;
    expect(kanji.getAttribute('aria-hidden')).toBe('true');
  });
```

- [ ] **Step 2: Esegui i test e verifica che falliscano**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: FAIL sui 3 nuovi test (kanji senza `aria-hidden`, chip ancora `<span>` non `<button>`).

- [ ] **Step 3: Implementa in `tecniche-list.page.ts`**

Cambia:

```ts
    <ion-header><ion-toolbar><ion-title><span class="judo-kanji">柔道</span> Tecniche</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <ion-searchbar placeholder="Cerca tecnica…" (ionInput)="setQuery($any($event).target.value)"></ion-searchbar>
      <div class="filters">
        <span class="chip" [class.on]="!categoria()" (click)="setCategoria(null)">Tutte</span>
        <span class="chip" [class.on]="categoria()==='nage-waza'" (click)="setCategoria('nage-waza')">Nage-waza</span>
        <span class="chip" [class.on]="categoria()==='katame-waza'" (click)="setCategoria('katame-waza')">Katame-waza</span>
      </div>
      <div class="filters">
        <span class="chip" [class.on]="!cintura()" (click)="setCintura(null)">Ogni cintura</span>
        @for (c of cinture; track c) {
          <span class="chip" [class.on]="cintura()===c" (click)="setCintura(c)">{{ c }}</span>
        }
      </div>
```

in:

```ts
    <ion-header><ion-toolbar><ion-title><span class="judo-kanji" aria-hidden="true">柔道</span> Tecniche</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <ion-searchbar placeholder="Cerca tecnica…" (ionInput)="setQuery($any($event).target.value)"></ion-searchbar>
      <div class="filters" role="group" aria-label="Filtra per categoria">
        <button type="button" class="chip" [class.on]="!categoria()" [attr.aria-pressed]="!categoria() ? 'true' : 'false'" (click)="setCategoria(null)">Tutte</button>
        <button type="button" class="chip" [class.on]="categoria()==='nage-waza'" [attr.aria-pressed]="categoria()==='nage-waza' ? 'true' : 'false'" (click)="setCategoria('nage-waza')">Nage-waza</button>
        <button type="button" class="chip" [class.on]="categoria()==='katame-waza'" [attr.aria-pressed]="categoria()==='katame-waza' ? 'true' : 'false'" (click)="setCategoria('katame-waza')">Katame-waza</button>
      </div>
      <div class="filters" role="group" aria-label="Filtra per cintura">
        <button type="button" class="chip" [class.on]="!cintura()" [attr.aria-pressed]="!cintura() ? 'true' : 'false'" (click)="setCintura(null)">Ogni cintura</button>
        @for (c of cinture; track c) {
          <button type="button" class="chip" [class.on]="cintura()===c" [attr.aria-pressed]="cintura()===c ? 'true' : 'false'" (click)="setCintura(c)">{{ c }}</button>
        }
      </div>
```

E aggiungi il reset/focus-visible allo stile `.chip` esistente, cambiando:

```ts
  styles: [`
    .filters{ display:flex; gap:8px; padding:8px 16px; flex-wrap:wrap; }
    .chip{ font-size:12px; font-weight:700; padding:6px 12px; border-radius:999px; text-transform:capitalize;
      background: var(--judo-surface); color: var(--judo-muted); border:1px solid var(--judo-border); }
    .chip.on{ background: var(--judo-purple-base); color:#fff; border-color: var(--judo-purple-base); }
  `]
```

in:

```ts
  styles: [`
    .filters{ display:flex; gap:8px; padding:8px 16px; flex-wrap:wrap; }
    .chip{ font-size:12px; font-weight:700; padding:6px 12px; border-radius:999px; text-transform:capitalize;
      background: var(--judo-surface); color: var(--judo-muted); border:1px solid var(--judo-border);
      appearance:none; -webkit-appearance:none; font-family:inherit; cursor:pointer; }
    .chip.on{ background: var(--judo-purple-base); color:#fff; border-color: var(--judo-purple-base); }
    .chip:focus-visible{ outline:2px solid var(--judo-purple); outline-offset:2px; }
  `]
```

- [ ] **Step 4: Implementa in `kata-list.page.ts`**

Cambia:

```ts
    <ion-header><ion-toolbar><ion-title><span class="judo-kanji">形</span> Kata</ion-title></ion-toolbar></ion-header>
```

in:

```ts
    <ion-header><ion-toolbar><ion-title><span class="judo-kanji" aria-hidden="true">形</span> Kata</ion-title></ion-toolbar></ion-header>
```

- [ ] **Step 5: Esegui tutti i test e verifica che passino**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: `TOTAL: 78 SUCCESS` (75 + 3 nuovi).

- [ ] **Step 6: Commit**

```bash
git add src/app/features/tecniche/tecniche-list.page.ts src/app/features/tecniche/tecniche-list.page.spec.ts src/app/features/kata/kata-list.page.ts src/app/features/kata/kata-list.page.spec.ts
git commit -m "fix(a11y): filtri come bottoni reali e kanji decorativi nascosti"
```

---

### Task 7: Font-size in `rem` invece di `px`

**Files:**
- Modify: `src/app/shared/category-chip/category-chip.component.ts`
- Modify: `src/app/shared/belt-badge/belt-badge.component.ts`
- Modify: `src/app/shared/media/media.component.ts`
- Modify: `src/app/features/tecniche/tecniche-list.page.ts`

**Interfaces:** nessuna, solo CSS.

- [ ] **Step 1: `category-chip.component.ts`**

Cambia:
```ts
  styles: [`.chip{ font-size:11px; font-weight:700; padding:4px 9px; border-radius:999px; }`]
```
in:
```ts
  styles: [`.chip{ font-size:.6875rem; font-weight:700; padding:4px 9px; border-radius:999px; }`]
```

- [ ] **Step 2: `belt-badge.component.ts`**

Cambia:
```ts
  styles: [`.badge{ font-size:11px; font-weight:700; padding:4px 9px; border-radius:999px;
    color: var(--judo-purple); background: rgba(138,92,214,.2); text-transform: capitalize; }`]
```
in:
```ts
  styles: [`.badge{ font-size:.6875rem; font-weight:700; padding:4px 9px; border-radius:999px;
    color: var(--judo-purple); background: rgba(138,92,214,.2); text-transform: capitalize; }`]
```

- [ ] **Step 3: `media.component.ts`**

Cambia:
```ts
    .play-btn{ align-self:flex-start; margin-top:8px; display:flex; align-items:center; gap:6px;
      background: var(--judo-surface); border:1px solid var(--judo-border); border-radius:999px;
      padding:6px 12px; color: var(--judo-purple); font-size:13px; font-weight:700; }
    .play-btn ion-icon{ font-size:18px; }
```
in:
```ts
    .play-btn{ align-self:flex-start; margin-top:8px; display:flex; align-items:center; gap:6px;
      background: var(--judo-surface); border:1px solid var(--judo-border); border-radius:999px;
      padding:6px 12px; color: var(--judo-purple); font-size:.8125rem; font-weight:700; }
    .play-btn ion-icon{ font-size:1.125rem; }
```

- [ ] **Step 4: `tecniche-list.page.ts`**

Cambia:
```ts
    .chip{ font-size:12px; font-weight:700; padding:6px 12px; border-radius:999px; text-transform:capitalize;
      background: var(--judo-surface); color: var(--judo-muted); border:1px solid var(--judo-border);
      appearance:none; -webkit-appearance:none; font-family:inherit; cursor:pointer; }
```
in:
```ts
    .chip{ font-size:.75rem; font-weight:700; padding:6px 12px; border-radius:999px; text-transform:capitalize;
      background: var(--judo-surface); color: var(--judo-muted); border:1px solid var(--judo-border);
      appearance:none; -webkit-appearance:none; font-family:inherit; cursor:pointer; }
```

- [ ] **Step 5: Verifica che non restino `font-size` in px nei componenti applicativi**

```bash
grep -rn "font-size:.*px" src/app/shared src/app/features
```
Expected: nessun output (solo `src/app/explore-container/explore-container.component.scss`, fuori scope, resterà — non incluso nel path cercato).

- [ ] **Step 6: Esegui tutti i test e verifica che passino ancora**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: `TOTAL: 78 SUCCESS` (nessun nuovo test, solo CSS — invarianza comportamentale).

- [ ] **Step 7: Commit**

```bash
git add src/app/shared/category-chip/category-chip.component.ts src/app/shared/belt-badge/belt-badge.component.ts src/app/shared/media/media.component.ts src/app/features/tecniche/tecniche-list.page.ts
git commit -m "fix(a11y): font-size in rem per scalare con Dynamic Type e zoom"
```

---

### Task 8: Verifica finale

**Files:** nessuno (solo verifica).

- [ ] **Step 1: Suite completa**

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
Expected: `TOTAL: 78 SUCCESS`, 0 FAILED.

- [ ] **Step 2: Build di produzione (verifica che i template compilino)**

```bash
npx ng build
```
Expected: build completata senza errori.

- [ ] **Step 3: Verifica manuale (checklist da spec, sezione "Test di accettazione")**

Usare il comando `run` (skill di lancio app) o `npx ionic serve` per aprire l'app in Safari/simulatore iOS e verificare a mano:
1. VoiceOver: dettaglio tecnica → preferito/studiata annunciano nome + stato.
2. VoiceOver: Cinture → dettaglio grado → tab Tecniche → bottone checkmark annunciato come bottone con nome/stato.
3. Tastiera esterna o VoiceOver: chip filtro Tecniche raggiungibili in sequenza e attivabili.
4. Impostazioni iOS "Testo più grande" al massimo: nessun testo troncato in chip/badge/titoli.
5. Pinch-to-zoom funzionante in Safari (non più bloccato).
6. Ispeziona il DOM: `<html lang="it">`.

Questo step non è automatizzabile e va eseguito da chi implementa prima di aprire la PR.

- [ ] **Step 4: Riepilogo commit del branch**

```bash
git log master..fix/accessibility-wcag-aa --oneline
```
Expected: 7 commit (Task 1-7), nessuna modifica non committata (`git status` pulito).
