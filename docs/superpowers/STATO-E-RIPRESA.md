# Judo App — Stato lavori & come riprendere

**Ultimo aggiornamento:** 2026-07-14
**Branch di lavoro:** `feat/app-v1` (base: `master`) → mergiato su `master`; poi `feat/cinture-kyu` (base: `master`) — tab Cinture Kyu, non ancora mergiato
**Stato:** MVP completo (Task 1–11) + tab Cinture Kyu (Task 1–13 del secondo piano). App funzionante web + progetto iOS pronto.

---

## Documenti di riferimento

- Spec design MVP: `docs/superpowers/specs/2026-07-10-judo-app-design.md`
- Piano implementazione MVP (11 task, TDD): `docs/superpowers/plans/2026-07-10-judo-app.md`
- Spec design Cinture Kyu: `docs/superpowers/specs/2026-07-14-cinture-kyu-design.md`
- Piano implementazione Cinture Kyu (13 task, TDD): `docs/superpowers/plans/2026-07-14-cinture-kyu.md`
- Fonte contenuti Cinture Kyu: specifica FIJLKAM 2026 fornita dall'utente (Kyu only, Dan escluso da questa iterazione)
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

**Contenuti seed:** 61 tecniche (nage-waza + katame-waza, cinture gialla→marrone, Gokyo completo), 5 kata
(Nage-no-kata, Katame-no-kata, Ju-no-kata, Kime-no-kata, Kodokan-goshin-jutsu),
6 gradi Kyu (bianca→marrone) con programma consigliato in `belt-grades.json`.

## Da fare (polish, opzionale)

- (Task 1) `global.scss` `dark.system.css` media-gated → step colori in light mode. Polish.
- (Task 3) `filterTechniques` matcha attraverso il confine spazio "jp it" (latente, innocuo).
- (Task 5) `FavoritesService.load()` fa `JSON.parse` senza try/catch (rischio basso).
- (Task 7) chip filtro sono `<span>` senza ruolo/tastiera a11y; etichette cinture solo capitalize CSS.
- (Task 8) `isFav` non reagisce a modifiche esterne dei preferiti (ricalcolo solo su toggle locale).

## Tab Cinture Kyu (feat/cinture-kyu, 2026-07-14)

Corretta l'assegnazione cintura↔tecnica di tutte le 24 tecniche esistenti secondo il Gokyo
ufficiale FIJLKAM (15 correzioni) e aggiunte le 37 tecniche mancanti (gruppi Gokyo 3/4/5 completi,
varianti Seoi Nage, Shime-waza e Kansetsu-waza mancanti) — la cintura marrone, che aveva 1 sola
tecnica, ora ne ha 8 dirette (+ tutte quelle cumulative dei gradi precedenti). Nuova 4ª tab
"Cinture": lista dei 6 gradi Kyu con stato (conquistata/attuale/da fare) e selezione della cintura
attuale via action sheet; dettaglio per grado con tab Panoramica/Tecniche/Fonti, banner di
sicurezza su Shime-waza/Kansetsu-waza, e toggle "tecnica studiata" (anche dalla scheda tecnica).

| Task | Cosa | Test |
|------|------|------|
| 1 | Correzione cintura di 15 tecniche esistenti (audit Gokyo ufficiale) | 36/36 |
| 2 | 3 tecniche mancanti gruppo 1 Gokyo (gialla) | 37/37 |
| 3 | 5 tecniche mancanti gruppo 2 Gokyo (arancione) | 38/38 |
| 4 | 9 tecniche mancanti gruppo 3 Gokyo (verde) | 39/39 |
| 5 | 12 tecniche mancanti gruppo 4 Gokyo (blu) | 40/40 |
| 6 | 8 tecniche mancanti gruppo 5 Gokyo (marrone) — chiude il bug "marrone = 1 tecnica" | 42/42 |
| 7 | Modello `BeltGrade`, `belt-grades.json` (6 gradi), `ContentService.getBeltGrades` | 47/47 |
| 8 | `BeltProgressService` (cintura attuale, tecniche studiate, stato derivato) | 54/54 |
| 9 | Pagina lista Cinture (stato, selezione cintura attuale via action sheet) | 56/56 |
| 10 | Pagina dettaglio Cintura (Panoramica/Tecniche/Fonti, banner sicurezza) | 62/62 |
| 11 | Wiring 4ª tab Cinture (route + tab bar) | 62/62 |
| 12 | Toggle "tecnica studiata" nella scheda tecnica | 63/63 |
| 13 | Verifica finale (test/build/lint) + fix `addIcons` mancante per `ribbon-outline` | 63/63 |

Metodo: Subagent-Driven Development (implementer + reviewer per task, modello sonnet per i task
di integrazione, haiku per i task di solo dato/JSON). Bug reali trovati e corretti durante la
review: 3 icone Ionicons dinamiche mai registrate via `addIcons` (`checkmark-circle`/`-outline` in
`belt-grade-detail.page.ts` e `tecnica-detail.page.ts`, `ribbon-outline` in `tabs.page.ts`) —
causavano warning/errori console runtime, non catturati dai test finché non si è aggiunta copertura
DOM reale.

**Verifica manuale non completata:** nessun tool di automazione browser (`chromium-cli` o
equivalente) disponibile in questo ambiente. Verificato: server dev si avvia pulito, le rotte
`/tabs/cinture` e `/tabs/cinture/:id` rispondono HTTP 200. La copertura DOM reale (banner
sicurezza, routerLink, toggle) è invece verificata dai test automatici (Task 9/10). Prima di
considerare la feature pronta per l'uso reale, fare un giro manuale in `npm start` seguendo il
percorso descritto nel piano (`docs/superpowers/plans/2026-07-14-cinture-kyu.md`, Task 13 Step 2).

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

### Integrazione iOS: CocoaPods (non SPM)

⚠️ IMPORTANTE: `ios/` usa **CocoaPods**, quindi aprire **`ios/App/App.xcworkspace`**
(NON `App.xcodeproj`). `npx cap open ios` apre già il workspace corretto.

Motivo: l'integrazione **Swift Package Manager** di Capacitor 8 con Xcode 16.2 dà errori Swift
"fantasma" nei plugin (`CAPPluginCall has no member 'reject'`, `missing argument #2` su
`getString`, `CAPBridgeProtocol has no member 'webView'`): i metodi esistono nell'XCFramework
ma non sono visibili al modulo del plugin compilato via SPM. Rigenerando con
`npx cap add ios --packagemanager CocoaPods` il problema sparisce.

Stato verificato: `xcodebuild -workspace ios/App/App.xcworkspace -scheme App -sdk iphonesimulator
CODE_SIGNING_ALLOWED=NO build` → **BUILD SUCCEEDED**. Manca solo la firma (Apple ID) in Xcode
per installare su device. core/cli/ios pinnati a **8.0.0** (riga dei plugin, `^8.0.0`).

Se in futuro si rigenera `ios/`, usare SEMPRE `--packagemanager CocoaPods`.

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
