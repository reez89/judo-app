# Cinture Kyu — design

**Data:** 2026-07-14
**Fonte:** `specifica_esami_judo_fijlkam_2026_per_claude.md` (fornita dall'utente), sezioni 1–4, 7, 9.
**Scope:** solo i 6 gradi Kyu colorati (bianca → marrone). Dan/cintura nera esplicitamente fuori scope per questa iterazione.

## Obiettivo

1. Nuova tab "Cinture": l'utente dichiara la propria cintura attuale, vede lo stato (conquistata / attuale / da fare) delle 6 cinture Kyu e il programma tecnico consigliato di ciascuna.
2. Correggere `techniques.json`: oggi 24 tecniche, assegnazioni di cintura in parte errate rispetto al Gokyo ufficiale, cintura marrone con una sola tecnica. Riallineare tutto allo spec e completare i gruppi Gokyo mancanti.

## 1. Modello dati

`src/app/core/models/belt-grade.model.ts` (nuovo):

```ts
import { Cintura } from './technique.model';

export interface BeltGradeSection {
  id: string;
  title: string;
  techniqueIds?: string[];
  items?: string[];
}

export interface BeltGrade {
  id: string;           // 'kyu-6' ... 'kyu-1'
  order: number;        // 1 (bianca) → 6 (marrone)
  gradeLabel: string;   // '6° Kyu'
  beltColor: Cintura;
  disclaimer: string;
  sections: BeltGradeSection[];
  sources: { title: string; url: string }[];
}
```

Deliberatamente più snello del `JudoGradeProgram` completo dello spec: niente `programType`/quote/date d'esame, perché per i Kyu non esiste un programma ufficiale FIJLKAM (lo spec stesso lo dichiara — graduazione a discrezione dell'Insegnante Tecnico Sociale). Un unico disclaimer testuale coerente per tutti e 6 i gradi.

`Technique.categoria` non cambia (resta `nage-waza` | `katame-waza`): shime-waza e kansetsu-waza restano `katame-waza` come già oggi: le sezioni raggruppano per `title`, non serve un enum più granulare.

`Cintura` non cambia: `bianca | gialla | arancione | verde | blu | marrone` copre già tutti e 6 i Kyu.

## 2. Contenuto — `src/assets/data/belt-grades.json`

Sei record `kyu-6` → `kyu-1`, costruiti da §4.1–4.6 dello spec.

Disclaimer comune (uguale per tutti i 6 gradi):
> "Il programma delle cinture colorate è una proposta didattica basata sulla progressione tecnica tradizionale del Gokyo. La FIJLKAM affida la graduazione dei Kyu all'Insegnante Tecnico Sociale; il programma effettivo può quindi variare da una società all'altra."

Fonte comune: Regolamento Organico Federale FIJLKAM (art. 92–96), URL da spec §10.

### kyu-6 — Bianca (order 1)
- Sezione "Fondamentali" (`items`): significato generale del Judo, comportamento e sicurezza nel dojo, Tori e Uke, Ritsu-rei, Za-rei, vestizione del judogi, legatura della cintura, Shizen-tai, Jigo-tai, Kumi-kata, Shintai, Tai-sabaki, introduzione a Kuzushi/Tsukuri/Kake.
- Sezione "Ukemi" (`items`): Ushiro Ukemi, Yoko Ukemi, Mae Ukemi, Zempo Kaiten Ukemi, esercizi di caduta a destra e sinistra.
- Sezione "Pratica" (`items`): equilibrio, spostamenti col compagno, controllo distanza, forme propedeutiche di Randori, rispetto del compagno.
- Nessun `techniqueIds` (nessuna tecnica Gokyo a questo grado).

### kyu-5 — Gialla (order 2)
- "Gokyo — 1° gruppo" (`techniqueIds`): de-ashi-barai, hiza-guruma\*, sasae-tsurikomi-ashi, uki-goshi, osoto-gari, o-goshi, ouchi-gari, seoi-nage.
- "Varianti di Seoi Nage" (`techniqueIds`): ippon-seoi-nage, morote-seoi-nage\*, eri-seoi-nage\*.
- "Osaekomi-waza" (`techniqueIds`): kesa-gatame, yoko-shiho-gatame, kami-shiho-gatame, tate-shiho-gatame.
- "Competenze" (`items`): entrata nelle immobilizzazioni fondamentali, mantenimento controllato, riconoscimento Osaekomi/Toketa, uscite elementari, collegamento proiezione→immobilizzazione.

(\* = tecnica nuova da creare, vedi §3)

### kyu-4 — Arancione (order 3)
- "Gokyo — 2° gruppo" (`techniqueIds`): ko-soto-gari\*, kouchi-gari, koshi-guruma\*, tsuri-komi-goshi, okuri-ashi-barai\*, tai-otoshi, harai-goshi, uchi-mata.
- "Osaekomi-waza aggiuntive" (`techniqueIds`): ushiro-kesa-gatame\*, kata-gatame, makura-kesa-gatame\*.
- "Hairi-kata elementari" (`items`): entrata su Uke prono, entrata su Uke in quadrupedia, ribaltamento dalla posizione laterale, superamento elementare delle gambe, controllo dalla posizione superiore.
- "Collegamenti suggeriti" (`items`): "O Soto Gari → Kesa Gatame", "O Goshi → Kesa Gatame", "Seoi Nage → Yoko Shiho Gatame", "O Uchi Gari → immobilizzazione", "Ko Uchi Gari → immobilizzazione".

### kyu-3 — Verde (order 4)
- "Gokyo — 3° gruppo" (`techniqueIds`): ko-soto-gake\*, tsuri-goshi\*, yoko-otoshi\*, ashi-guruma\*, hane-goshi, harai-tsurikomi-ashi\*, tomoe-nage, kata-guruma\*.
- "Shime-waza" (`techniqueIds`): nami-juji-jime\*, gyaku-juji-jime\*, kata-juji-jime\*.
- "Kansetsu-waza" (`techniqueIds`): ude-garami, juji-gatame.
- "Competenze dinamiche" (`items`): individuazione Tokui-waza, esecuzione a destra/sinistra, attacco durante spostamento, introduzione ai Renraku-waza, difese tramite postura/movimento/Tai-sabaki, continuità Tachi-waza/Ne-waza.
- "Renraku-waza suggeriti" (`items`): "O Uchi Gari → Uchi Mata", "Ko Uchi Gari → Seoi Nage", "O Soto Gari → O Uchi Gari", "De Ashi Barai → O Soto Gari", "Uchi Mata → O Uchi Gari".
- Avviso sicurezza (banner fisso in UI, non un `item`): shime-waza e kansetsu-waza vanno insegnate solo sotto supervisione di un tecnico qualificato.

### kyu-2 — Blu (order 5)
- "Gokyo — 4° gruppo" (`techniqueIds`): sumi-gaeshi\*, tani-otoshi\*, hane-makikomi\*, sukui-nage\*, utsuri-goshi\*, o-guruma\*, soto-makikomi\*, uki-otoshi\*.
- "Shime-waza" (`techniqueIds`): hadaka-jime, okuri-eri-jime, kata-ha-jime\*, ryo-te-jime\*.
- "Kansetsu-waza" (`techniqueIds`): ude-gatame\*, waki-gatame\*.
- "Competenze dinamiche" (`items`): Renraku-waza avanti/indietro, destra/sinistra, difese contro tecniche fondamentali, introduzione ai Gaeshi-waza, Hairi-kata da posizioni diverse, Randori in piedi e a terra, passaggio continuo Tachi-waza→Ne-waza.
- "Gaeshi-waza suggeriti" (`items`): "O Uchi Gari → O Uchi Gaeshi", "Ko Uchi Gari → Ko Uchi Gaeshi", "O Soto Gari → O Soto Gaeshi", "Uchi Mata → Uchi Mata Sukashi", "Uchi Mata → Uchi Mata Gaeshi".

### kyu-1 — Marrone (order 6)
- "Gokyo — 5° gruppo" (`techniqueIds`): osoto-guruma\*, uki-waza\*, yoko-wakare\*, yoko-guruma\*, ushiro-goshi\*, ura-nage\*, sumi-otoshi\*, yoko-gake\*.
- "Competenze cumulative" (`items`): conoscenza dei 40 lanci del Gokyo, varianti principali di Seoi Nage, Osaekomi-waza e uscite, Shime-waza e Kansetsu-waza principali, Hairi-kata, Renraku-waza, Gaeshi-waza, difese, continuità Tachi-waza/Ne-waza, Tokui-waza, Randori in piedi e a terra, nozioni arbitrali fondamentali.
- "Preparazione consigliata al 1° Dan" (`items`): 1°/2°/3° gruppo del Nage no Kata, 1° gruppo del Katame no Kata oppure 1° gruppo del Ju no Kata, cerimoniale apertura/chiusura, ruoli Tori/Uke, esecuzione a destra e sinistra dove prevista.

## 3. Correzioni a `techniques.json`

**Cinture da correggere (15 record esistenti — audit completo di tutte e 24 le tecniche contro il Gokyo ufficiale):**

| id | tecnica | cintura oggi | cintura corretta |
|---|---|---|---|
| seoi-nage | Seoi Nage | arancione | gialla |
| uki-goshi | Uki Goshi | arancione | gialla |
| sasae-tsurikomi-ashi | Sasae Tsurikomi Ashi | verde | gialla |
| ippon-seoi-nage | Ippon Seoi Nage | verde | gialla |
| kami-shiho-gatame | Kami Shiho Gatame | arancione | gialla |
| tate-shiho-gatame | Tate Shiho Gatame | arancione | gialla |
| tsuri-komi-goshi | Tsurikomi Goshi | verde | arancione |
| harai-goshi | Harai Goshi | verde | arancione |
| uchi-mata | Uchi Mata | blu | arancione |
| kata-gatame | Kata Gatame | verde | arancione |
| hane-goshi | Hane Goshi | blu | verde |
| tomoe-nage | Tomoe Nage | blu | verde |
| juji-gatame | Ude Hishigi Juji Gatame | blu | verde |
| ude-garami | Ude Garami | marrone | verde |
| okuri-eri-jime | Okuri Eri Jime | verde | blu |

**Tecniche da aggiungere (37 nuovi record)**, stesso formato dei record esistenti (`nomeGiapponese`, `nomeItaliano`, `categoria`, `cintura`, `descrizione`, `passaggi`, `media` placeholder, `tags`):

- Gialla (3): Hiza Guruma, Morote Seoi Nage, Eri Seoi Nage
- Arancione (5): Ko Soto Gari, Koshi Guruma, Okuri Ashi Barai, Ushiro Kesa Gatame, Makura Kesa Gatame
- Verde (9): Ko Soto Gake, Tsuri Goshi, Yoko Otoshi, Ashi Guruma, Harai Tsurikomi Ashi, Kata Guruma, Nami Juji Jime, Gyaku Juji Jime, Kata Juji Jime
- Blu (12): Sumi Gaeshi, Tani Otoshi, Hane Makikomi, Sukui Nage, Utsuri Goshi, O Guruma, Soto Makikomi, Uki Otoshi, Kata Ha Jime, Ryo Te Jime, Ude Gatame, Waki Gatame
- Marrone (8): O Soto Guruma, Uki Waza, Yoko Wakare, Yoko Guruma, Ushiro Goshi, Ura Nage, Sumi Otoshi, Yoko Gake

Risultato finale: 61 tecniche totali (24 esistenti, corrette + 37 nuove), marrone passa da 1 a 8 tecniche dirette (più tutte quelle cumulative dei gradi precedenti mostrate nella pagina di dettaglio).

Nessuna tecnica esistente viene rimossa o duplicata; gli `id` restano stabili (i preferiti utente già salvati non si rompono).

## 4. Tracking progresso utente

`src/app/core/services/belt-progress.service.ts` (nuovo, stesso pattern di `FavoritesService` + `StorageService`/Capacitor Preferences):

```ts
currentGradeId: Signal<string | null>     // cintura attuale dichiarata dall'utente
studiedTechniqueIds: Signal<string[]>     // tecniche marcate "studiata"

setCurrentGrade(id: string): Promise<void>
toggleStudied(techniqueId: string): Promise<void>
statusFor(grade: BeltGrade): 'earned' | 'current' | 'upcoming'   // derivato da order, non salvato
completionFor(grade: BeltGrade): number   // 0–100, tecniche studiate / tecniche richieste in quel grado
```

Stato derivato da `order`, non salvato esplicitamente per grado — evita stati incoerenti (es. marrone conquistata senza verde), coerente con la scelta "cintura attuale singola" già approvata.

## 5. UI

**Tab bar**: aggiunta 4ª `ion-tab-button` "Cinture" (icona `ribbon-outline`), route `/tabs/cinture`.

**`belt-grade-list.page.ts`** (`tabs/cinture`):
- Header con azione "Imposta la mia cintura attuale" → `ionic action-sheet` con le 6 cinture.
- 6 righe: swatch colore cintura (estende `BeltBadgeComponent` o riusa la stessa palette), `gradeLabel`, chip di stato (Conquistata/Attuale/Da fare), riga immediatamente successiva alla attuale mostra una barra di completamento %.
- Tap riga → `tabs/cinture/:id`.

**`belt-grade-detail.page.ts`** (`tabs/cinture/:id`):
- `ion-segment`: Panoramica / Tecniche / Fonti.
- Panoramica: label grado, badge cintura, disclaimer.
- Tecniche: itera `sections`; `techniqueIds` → righe tappabili verso `tecniche/:id` con checkbox "studiata" a fianco; `items` → lista puntata semplice. Banner di sicurezza fisso quando la sezione è Shime-waza/Kansetsu-waza.
- Fonti: link a `sources`.

**`tecnica-detail.page.ts`**: secondo pulsante in `ion-buttons slot="end"` (icona checkmark/checkmark-outline) per "tecnica studiata", stesso pattern del toggle preferiti già presente.

## 6. File coinvolti

Nuovi:
- `src/app/core/models/belt-grade.model.ts`
- `src/app/core/services/belt-progress.service.ts`
- `src/assets/data/belt-grades.json`
- `src/app/features/cinture/belt-grade-list.page.ts`
- `src/app/features/cinture/belt-grade-detail.page.ts`

Modificati:
- `src/assets/data/techniques.json` (correzioni + 37 nuove tecniche)
- `src/app/core/services/content.service.ts` (+ `getBeltGrades()`, `getBeltGrade(id)`)
- `src/app/tabs/tabs.routes.ts` (+ rotte cinture)
- `src/app/tabs/tabs.page.html` (+ 4° tab)
- `src/app/features/tecniche/tecnica-detail.page.ts` (+ toggle "studiata")

## 7. Test

- `belt-progress.service.spec.ts`: stato derivato (earned/current/upcoming) per ogni `order`; `completionFor` con 0, alcune, tutte le tecniche studiate; persistenza via `StorageService` mock.
- `belt-grade-list.page.spec.ts`: rendering 6 righe, chip di stato corretti dato un `currentGradeId`.
- `belt-grade-detail.page.spec.ts`: sezioni con `techniqueIds` risolvono le tecniche vere da `ContentService`; sezioni con `items` renderizzano testo semplice; banner sicurezza presente su Shime/Kansetsu.
- `techniques.json`: test di integrità dati — ogni `techniqueId` referenziato in `belt-grades.json` esiste in `techniques.json` (previene link rotti quando si aggiornerà per il 2027).

## 8. Criteri di accettazione

- [ ] tutti i 6 gradi Kyu (bianca→marrone) presenti e ordinabili;
- [ ] disclaimer "programma consigliato, non ufficiale" visibile su ogni grado;
- [ ] ogni cintura ha almeno le tecniche Gokyo del proprio gruppo ufficiale (marrone: 8, non più 1);
- [ ] nessuna tecnica duplicata, `id` esistenti invariati;
- [ ] utente può impostare la cintura attuale e vedere lo stato derivato delle altre 5;
- [ ] % di completamento sulla cintura successiva basata su tecniche marcate "studiata";
- [ ] ogni `techniqueId` nelle sezioni rimanda alla scheda tecnica reale già presente nell'app;
- [ ] Shime-waza/Kansetsu-waza mostrano un avviso di sicurezza contestuale.
