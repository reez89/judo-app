# Judo App — Stato lavori & come riprendere

**Ultimo aggiornamento:** 2026-07-11
**Branch di lavoro:** `feat/app-v1` (base: `master`) → mergiato su `master`
**Stato:** MVP completo (Task 1–11). App funzionante web + progetto iOS pronto.

---

## Documenti di riferimento

- Spec design: `docs/superpowers/specs/2026-07-10-judo-app-design.md`
- Piano implementazione (11 task, TDD): `docs/superpowers/plans/2026-07-10-judo-app.md`
- Mockup UI scelto: direzione **Ink** (tema scuro, viola `#b98bff`)

## Metodo di esecuzione

Task 1–7: Subagent-Driven Development (implementer + reviewer, modello sonnet).
Task 8–11: codice applicato direttamente dai brief del piano (già completi), verificato con
`npm test -- --watch=false --browsers=ChromeHeadless` + `npm run build`.

## Fatto (Task 1–11 — MVP completo)

| Task | Cosa | Test |
|------|------|------|
| 1 | Scaffold Ionic standalone + Capacitor, 3 tab IT (Tecniche/Kata/Preferiti), tema Ink | 6/6 |
| 2 | Modelli dati + JSON seed + placeholder.svg | 9/9 |
| 3 | Funzione pura `filterTechniques` (ricerca/categoria/cintura) | 15/15 |
| 4 | `ContentService` (carica JSON, cache shareReplay) | 17/17 |
| 5 | `StorageService` + `FavoritesService` (Capacitor Preferences) | 21/21 |
| 6 | Componenti condivisi: belt-badge, category-chip, media | 25/25 |
| 7 | Pagina lista Tecniche (search + filtri categoria/cintura + nav) | 27/27 |
| 8 | Pagina dettaglio Tecnica (`tecniche/:id`): media, badge, passaggi, toggle preferito | 29/29 |
| 9 | Pagine Kata: lista con ricerca (`kata`) + dettaglio (`kata/:id`) | 31/31 |
| 10 | Pagina Preferiti (`preferiti`): tecniche stellate, persistenti | 32/32 |
| 11 | Piattaforma iOS Capacitor (`ios/`, appId `com.nicolarizzi.judoapp`) | — |

**Contenuti seed:** 24 tecniche (nage-waza + katame-waza, cinture gialla→marrone), 5 kata
(Nage-no-kata, Katame-no-kata, Ju-no-kata, Kime-no-kata, Kodokan-goshin-jutsu).

## Da fare (polish, opzionale)

- (Task 1) `global.scss` `dark.system.css` media-gated → step colori in light mode. Polish.
- (Task 3) `filterTechniques` matcha attraverso il confine spazio "jp it" (latente, innocuo).
- (Task 5) `FavoritesService.load()` fa `JSON.parse` senza try/catch (rischio basso).
- (Task 7) chip filtro sono `<span>` senza ruolo/tastiera a11y; etichette cinture solo capitalize CSS.
- (Task 8) `isFav` non reagisce a modifiche esterne dei preferiti (ricalcolo solo su toggle locale).

## Build iOS — come installare su iPhone

Prerequisiti (verificati): Xcode 16.2, CocoaPods 1.17, `xcode-select` → Xcode.app.

Da progetto sincronizzato (`npm run build && npx cap sync ios`):

1. `npx cap open ios` — apre il workspace in Xcode.
2. Target **App** → **Signing & Capabilities** → spunta *Automatically manage signing* →
   **Add Account** (Apple ID) → seleziona team *(Personal)*. Bundle id: `com.nicolarizzi.judoapp`.
3. Collega l'iPhone 12 Pro via USB, sblocca e **Autorizza**.
4. Su iPhone: **Impostazioni → Privacy e sicurezza → Modalità sviluppatore → ON** → riavvia.
5. In Xcode scegli l'iPhone come destinazione → **▶ Run**.
6. Prima apertura: **Impostazioni → Generali → VPN e gestione dispositivo** → autorizza il profilo.

### ⚠️ Blocco noto build iOS nativa (Capacitor 8 + SPM + Xcode 16.2)

Al primo build in Xcode i plugin Capacitor danno errori Swift "fantasma":
`CAPPluginCall has no member 'reject'`, `missing argument for parameter #2` su `getString`,
e (a core 8.4.1) `CAPBridgeProtocol has no member 'webView/viewController'` in status-bar.

Diagnosi: i metodi ESISTONO davvero nell'XCFramework Capacitor (verificato nello
`.swiftinterface` sia 8.0.0 sia 8.4.1: `getString(_:)`, `reject(...)`), ma i metodi definiti
in `extension` su `CAPPluginCall` non sono visibili al modulo del plugin compilato via SPM.
È un problema del toolchain (integrazione Swift Package Manager di Capacitor 8 con Xcode 16.2),
NON risolvibile cambiando versione dei pacchetti.

Stato: core/cli/ios allineati a **8.0.0** (la riga a cui puntano i plugin, `^8.0.0`); questo
risolve status-bar ma non preferences. Il web e tutta la logica app sono completi e verdi.

Prossimi tentativi (in ordine di probabilità), da valutare con più budget:
1. Passare i plugin all'integrazione **CocoaPods** invece di SPM (Capacitor supporta entrambe):
   rigenerare `ios/` con `--packagemanager Cocoapods` o downgrade CLI, poi `pod install`.
2. Aggiornare l'intera toolchain a Capacitor **9** (core/cli/ios + plugin) quando i plugin
   stabili 9.x escono (ora solo nightly), che riallinea l'API.
3. In alternativa provare un Xcode diverso (15.x) dove l'export dei moduli SPM si comporta bene.

Versione app: `MARKETING_VERSION 1.0`, build `CURRENT_PROJECT_VERSION 1`.
Nota: con Apple ID gratuito l'app scade dopo 7 giorni (ripremi ▶ per reinstallare).
Per pubblicare su App Store serve Apple Developer Program (99 $/anno) + archive/upload da Xcode.

## Comandi utili

```bash
npm start                                                  # dev server web (localhost:4200)
npm test -- --watch=false --browsers=ChromeHeadless        # test headless
npm run build                                              # build web in www/
npx cap sync ios                                           # copia www + plugin nel progetto iOS
npx cap open ios                                           # apre Xcode
```
