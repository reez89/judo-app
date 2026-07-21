# Accessibilità WCAG 2.2 AA — fix concreti

Data: 2026-07-21
Branch: `fix/accessibility-wcag-aa`
Riferimento: `mobile_accessibility_best_practices_2026.md` (fornito dall'utente)

## Contesto

App judo-app: Ionic/Angular standalone, Capacitor **iOS-only** (nessun target Android in `package.json`/progetto). 16 componenti/pagine totali, nessun flusso di login, pagamento, form complessi, CAPTCHA o video con parlato. Il documento di best practice copre 38 sezioni pensate per app enterprise di ogni tipo; la maggior parte non è applicabile a questa app. Questo spec copre solo le violazioni reali trovate leggendo il codice.

## Obiettivo

Correggere le barriere di accessibilità concrete individuate nell'audit, mantenendo l'esperienza attuale (nessuna "modalità accessibile" separata, nessun overlay/plugin).

## Fix inclusi

### 1. `src/index.html`
- `<html lang="en">` → `<html lang="it">` (l'intera app è in italiano). WCAG 3.1.1.
- Meta viewport: rimuovere `user-scalable=no` e `maximum-scale=1.0`. Bloccano lo zoom utente, anti-pattern esplicito, viola WCAG 1.4.4/1.4.10. Mantenere `viewport-fit=cover, width=device-width, initial-scale=1.0`.

### 2. `tecnica-detail.page.ts`
- I due `ion-button` icon-only (preferito, studiata) non hanno nome accessibile né stato esposto (solo colore/icona cambiano).
- Aggiungere `[attr.aria-label]` dinamico (es. "Aggiungi ai preferiti" / "Rimuovi dai preferiti", "Segna come studiata" / "Segna come non studiata") e `[attr.aria-pressed]` riflettendo `isFav()`/`isStudiata()`.

### 3. `belt-grade-detail.page.ts`
- L'icona checkmark per riga tecnica è un `ion-icon` cliccabile diretto (`(click)="toggleStudiata(...)"`), senza ruolo bottone, non raggiungibile da tastiera/VoiceOver come controllo, nessun nome accessibile.
- Sostituire con un `<button type="button">` (o `ion-button` fill clear) che contiene l'icona, con `aria-label` dinamico + `aria-pressed`, dimensione minima 44×44.

### 4. `tecniche-list.page.ts`
- I chip filtro categoria/cintura sono `<span (click)>`: non focusabili da tastiera, nessun ruolo, nessuno stato esposto. Anti-pattern esplicito (documento sezione 29).
- Convertire in `<button type="button">` con `[attr.aria-pressed]` sullo stato "on", focus-visible style, dimensione tocco minima adeguata (min-height ~44px logico).
- Lo stesso pattern non esiste altrove (kata-list usa solo searchbar, ok).

### 5. Kanji decorativi
- `tecniche-list.page.ts` (`柔道`) e `kata-list.page.ts` (`形`) dentro `ion-title`: puramente decorativi, il testo italiano accanto già comunica lo scopo. Aggiungere `aria-hidden="true"` per evitare che VoiceOver provi a pronunciarli in mezzo al titolo.

### 6. `media.component.ts`
- `alt="p.didascalia || 'media'"`: fallback generico vietato dalla checklist (anti-pattern "icona/immagine" come label). Il fallback deve essere significativo nel contesto: se manca una didascalia, non renderizzare un `alt` generico ma richiedere che il chiamante fornisca un testo di contesto (nome tecnica/kata) da usare come fallback, tramite un nuovo `@Input() altFallback` passato da `tecnica-detail`/`kata-detail`.
- L'icona `play-circle` dentro al bottone "Video" è ridondante con il testo visibile "Video": aggiungere `aria-hidden="true"` sull'icona (il bottone resta annunciato una sola volta, dal testo).
- Il tag `<video autoplay>` parte solo dopo tap esplicito dell'utente (già cancellato lo stato "immagine" precedente), quindi è conforme (avvio non automatico all'apertura schermata); nessuna modifica funzionale qui, solo verifica.

### 7. Font-size in `px` → `rem`
- Stili inline nei componenti (`category-chip`, `belt-badge`, chip filtro in tecniche-list, `h1`/`h3` nei `styles` dei detail page, `.play-btn` in media) usano `px` per `font-size`. Su WebView iOS/Safari, lo zoom testo (Ajusta dimensione testo / browser zoom) scala in base a `rem`/`em` rispetto al font-size radice: i valori fissi in `px` non scalano, violando "resize text 200%" (1.4.4) e la richiesta esplicita del documento di evitare px assoluti nel testo (sezione 9.1).
- Convertire i `font-size` dei componenti applicativi (non i token Ionic nativi, già rem-based) in `rem`, mantenendo le proporzioni visive attuali (root font-size Ionic è 16px quindi conversione diretta `px/16`).

### 8. Focus visibile per i nuovi bottoni custom
- I nuovi `<button>` (chip filtro, toggle studiata in cinture) devono avere uno stile `:focus-visible` visibile (outline), dato che sono elementi custom fuori dai componenti Ionic nativi (che già gestiscono il focus ring).

## Fuori scope (non applicabile a questa app, non incluso)

- Sottotitoli/audio-description: nessun video con parlato, solo placeholder "in arrivo".
- CAPTCHA, MFA, biometria, pagamenti, form complessi: non esistono in questa app.
- Test TalkBack/Android: il progetto non ha target Android.
- RTL: contenuto solo italiano/termini giapponesi traslitterati.
- Contrasto colori: verificato manualmente (calcolo WCAG relative luminance) sui token tema (`--judo-muted`, `--judo-green`, `--judo-red`, `--judo-purple` su sfondo `#141319`) — tutti superano 4.5:1/3:1, nessuna modifica necessaria.

## Test di accettazione

1. VoiceOver (dispositivo/simulatore iOS): navigare tab Tecniche → dettaglio tecnica → attivare/disattivare preferito e studiata: annunciato nome + stato (selezionato/non selezionato).
2. VoiceOver: schermata Cinture → dettaglio grado → tab Tecniche → attivare checkmark per riga: annunciato come bottone con nome e stato.
3. VoiceOver + tastiera esterna: chip filtro in Tecniche raggiungibili con Tab, attivabili con Invio/Spazio, stato "selezionato" annunciato.
4. Impostazioni iOS "Testo più grande" al massimo, poi Safari/WebView zoom 200%: nessun testo troncato nei chip/badge/titoli.
5. Aprire l'app da Safari/inspector: pinch-to-zoom funzionante (non bloccato).
6. Verificare `<html lang="it">` nel DOM.
7. `npm run test` verde (aggiornare eventuali spec che asseriscono su `alt`/markup cambiato).

## Rischi di regressione

- Layout dei chip filtro (nuova struttura `<button>` invece di `<span>`) potrebbe richiedere piccoli aggiustamenti di stile per mantenere l'aspetto visivo invariato.
- `media.component`: firma `@Input()` cambiata (nuovo `altFallback`) richiede aggiornare i 2 chiamanti (`tecnica-detail`, `kata-detail`) e i relativi spec test.
