# Cinture Kyu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correggere l'assegnazione cintura↔tecnica in `techniques.json` secondo il Gokyo ufficiale FIJLKAM e aggiungere una 4ª tab "Cinture" che mostra i 6 gradi Kyu (bianca→marrone), il programma tecnico di ciascuno, e permette all'utente di dichiarare la propria cintura attuale e marcare le tecniche studiate.

**Architecture:** Stesso pattern del resto dell'app: contenuti statici in `assets/data/*.json` caricati via `ContentService` (HttpClient + shareReplay), stato utente persistito via `StorageService` (Capacitor Preferences) dietro un service dedicato con Angular signals (stesso pattern di `FavoritesService`), pagine standalone Ionic con template inline. Nessuna nuova dipendenza.

**Tech Stack:** Angular 20 standalone + signals, Ionic 8 (`@ionic/angular/standalone`), Capacitor Preferences, Jasmine/Karma (ChromeHeadless), TypeScript 5.9.

**Riferimento:** `docs/superpowers/specs/2026-07-14-cinture-kyu-design.md`

## Global Constraints

- Tutte le label UI e i contenuti in italiano.
- Componenti standalone, import espliciti da `@ionic/angular/standalone` (mai il modulo `IonicModule`).
- Stato utente sempre dietro un service con Angular `signal`, persistito tramite `StorageService` (mai accesso diretto a `Preferences` da un componente).
- Nessun id di tecnica esistente viene rinominato o rimosso — i preferiti già salvati dagli utenti non devono rompersi.
- Ogni nuovo record tecnica segue esattamente lo schema di `Technique` (`src/app/core/models/technique.model.ts`): `id, nomeGiapponese, nomeItaliano, categoria, cintura, descrizione, passaggi, media, tags`. `media` è sempre `[{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }]` finché non arrivano contenuti reali.
- Comandi di verifica: `npx ng test -- --watch=false --browsers=ChromeHeadless` (test), `npx ng lint` (lint), `npx ng build` (build). Vanno tutti e tre a zero errori prima di ogni commit che chiude un task.
- Ogni commit segue lo stile del repo (`git log --oneline`): prefisso `feat:`/`fix:`/`test:`/`docs:` in italiano, niente footer aggiuntivi.

---

## Task 1: Correggere le cinture delle 15 tecniche esistenti

Audit completo delle 24 tecniche attuali contro il Gokyo ufficiale (spec §7): 15 record hanno la `cintura` sbagliata.

**Files:**
- Modify: `src/assets/data/techniques.json`
- Modify: `src/app/core/models/data-integrity.spec.ts`

**Interfaces:**
- Consumes: `Technique` da `src/app/core/models/technique.model.ts` (nessun cambio al modello).
- Produces: `techniques.json` con cinture corrette, che Task 2–6 estendono e Task 7 referenzia da `belt-grades.json`.

- [ ] **Step 1: Scrivere il test che blocca le cinture corrette**

Aggiungere in fondo a `src/app/core/models/data-integrity.spec.ts` (dentro il blocco `describe` esistente, prima della chiusura `});`):

```ts
  it('le tecniche del 1° gruppo Gokyo e le loro varianti sono in cintura gialla', () => {
    const list = techniques as Technique[];
    const gialla = ['osoto-gari', 'o-goshi', 'seoi-nage', 'de-ashi-barai', 'ouchi-gari',
      'uki-goshi', 'sasae-tsurikomi-ashi', 'ippon-seoi-nage',
      'kesa-gatame', 'yoko-shiho-gatame', 'kami-shiho-gatame', 'tate-shiho-gatame'];
    gialla.forEach(id => {
      const t = list.find(x => x.id === id);
      expect(t?.cintura).withContext(id).toBe('gialla');
    });
  });

  it('le tecniche del 2° gruppo Gokyo sono in cintura arancione', () => {
    const list = techniques as Technique[];
    const arancione = ['kouchi-gari', 'tai-otoshi', 'tsuri-komi-goshi', 'harai-goshi', 'uchi-mata', 'kata-gatame'];
    arancione.forEach(id => {
      const t = list.find(x => x.id === id);
      expect(t?.cintura).withContext(id).toBe('arancione');
    });
  });

  it('le tecniche del 3° gruppo Gokyo sono in cintura verde', () => {
    const list = techniques as Technique[];
    const verde = ['hane-goshi', 'tomoe-nage', 'juji-gatame', 'ude-garami'];
    verde.forEach(id => {
      const t = list.find(x => x.id === id);
      expect(t?.cintura).withContext(id).toBe('verde');
    });
  });

  it('le tecniche del 4° gruppo Gokyo sono in cintura blu', () => {
    const list = techniques as Technique[];
    const blu = ['hadaka-jime', 'okuri-eri-jime'];
    blu.forEach(id => {
      const t = list.find(x => x.id === id);
      expect(t?.cintura).withContext(id).toBe('blu');
    });
  });
```

- [ ] **Step 2: Eseguire i test e verificare che falliscano**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL sui 4 nuovi `it` — `seoi-nage`/`uki-goshi`/`sasae-tsurikomi-ashi`/`ippon-seoi-nage`/`kami-shiho-gatame`/`tate-shiho-gatame` non sono `gialla`, `tsuri-komi-goshi`/`harai-goshi`/`uchi-mata`/`kata-gatame` non sono `arancione`, `hane-goshi`/`tomoe-nage`/`juji-gatame`/`ude-garami` non sono `verde`, `okuri-eri-jime` non è `blu`.

- [ ] **Step 3: Correggere `cintura` sui 15 record in `techniques.json`**

Per ciascuno dei seguenti `id`, cambiare il valore del campo `"cintura"` (lasciare invariato tutto il resto del record):

| id | cintura oggi | cintura corretta |
|---|---|---|
| seoi-nage | arancione | gialla |
| uki-goshi | arancione | gialla |
| sasae-tsurikomi-ashi | verde | gialla |
| ippon-seoi-nage | verde | gialla |
| kami-shiho-gatame | arancione | gialla |
| tate-shiho-gatame | arancione | gialla |
| tsuri-komi-goshi | verde | arancione |
| harai-goshi | verde | arancione |
| uchi-mata | blu | arancione |
| kata-gatame | verde | arancione |
| hane-goshi | blu | verde |
| tomoe-nage | blu | verde |
| juji-gatame | blu | verde |
| ude-garami | marrone | verde |
| okuri-eri-jime | verde | blu |

Esempio concreto per `seoi-nage` (usare `Edit` con `old_string`/`new_string` su questo blocco esatto):

```json
  {
    "id": "seoi-nage",
    "nomeGiapponese": "Seoi-nage",
    "nomeItaliano": "Proiezione di spalla",
    "categoria": "nage-waza",
    "cintura": "arancione",
```
→
```json
  {
    "id": "seoi-nage",
    "nomeGiapponese": "Seoi-nage",
    "nomeItaliano": "Proiezione di spalla",
    "categoria": "nage-waza",
    "cintura": "gialla",
```

Ripetere lo stesso tipo di modifica (solo la riga `"cintura": "..."` dentro il blocco dell'id giusto) per gli altri 14 id della tabella.

- [ ] **Step 4: Eseguire i test e verificare che passino**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS su tutti i test, incluso `Integrità dati contenuti` con i 4 nuovi `it`.

- [ ] **Step 5: Commit**

```bash
git add src/assets/data/techniques.json src/app/core/models/data-integrity.spec.ts
git commit -m "fix: allinea cintura delle 15 tecniche esistenti al Gokyo ufficiale FIJLKAM"
```

---

## Task 2: Aggiungere le 3 tecniche mancanti del 1° gruppo Gokyo (gialla)

**Files:**
- Modify: `src/assets/data/techniques.json`
- Modify: `src/app/core/models/data-integrity.spec.ts`

**Interfaces:**
- Consumes: schema `Technique`.
- Produces: id `hiza-guruma`, `morote-seoi-nage`, `eri-seoi-nage`, referenziati da `belt-grades.json` in Task 7 (sezione "Varianti di Seoi Nage" e "Gokyo — 1° gruppo" del grado `kyu-5`).

- [ ] **Step 1: Scrivere il test che conta le tecniche gialla**

Aggiungere in `data-integrity.spec.ts`:

```ts
  it('la cintura gialla ha tutte le 15 tecniche del programma consigliato', () => {
    const count = (techniques as Technique[]).filter(t => t.cintura === 'gialla').length;
    expect(count).toBe(15);
  });
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — il conteggio attuale per `gialla` è 12 (dopo Task 1), non 15.

- [ ] **Step 3: Aggiungere i 3 record in `techniques.json`**

Aggiungere questi 3 oggetti alla fine dell'array (prima della `]` finale, con virgola dopo l'ultimo elemento esistente):

```json
  {
    "id": "hiza-guruma",
    "nomeGiapponese": "Hiza-guruma",
    "nomeItaliano": "Ruota al ginocchio",
    "categoria": "nage-waza",
    "cintura": "gialla",
    "descrizione": "Proiezione di tempismo: si blocca il ginocchio di uke con la pianta del piede mentre lo si fa ruotare attorno a quel punto fisso.",
    "passaggi": [
      "Squilibrio laterale-avanti di uke.",
      "Blocco del ginocchio d'appoggio di uke con la pianta del proprio piede.",
      "Trazione delle braccia in cerchio attorno al punto bloccato.",
      "Proiezione accompagnando la rotazione di uke a terra."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "gamba", "tempismo"]
  },
  {
    "id": "morote-seoi-nage",
    "nomeGiapponese": "Morote-seoi-nage",
    "nomeItaliano": "Proiezione di spalla a due mani",
    "categoria": "nage-waza",
    "cintura": "gialla",
    "descrizione": "Variante di seoi-nage con presa a due mani su manica e bavero di uke, caricato sulla schiena con entrambe le braccia.",
    "passaggi": [
      "Squilibrio in avanti di uke con trazione a due mani.",
      "Rotazione entrando sotto il baricentro di uke, schiena a contatto col petto.",
      "Abbassamento del baricentro e caricamento con entrambe le braccia.",
      "Proiezione estendendo le gambe e tirando in avanti-basso."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "spalla"]
  },
  {
    "id": "eri-seoi-nage",
    "nomeGiapponese": "Eri-seoi-nage",
    "nomeItaliano": "Proiezione di spalla al bavero",
    "categoria": "nage-waza",
    "cintura": "gialla",
    "descrizione": "Variante di seoi-nage con presa al bavero anziché alla manica, utile contro chi controlla le maniche.",
    "passaggi": [
      "Presa al bavero opposto e squilibrio in avanti di uke.",
      "Rotazione entrando sotto il braccio di uke, mantenendo la presa al bavero.",
      "Caricamento sulla schiena con il braccio libero a controllo del bavero vicino.",
      "Proiezione estendendo le gambe."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "spalla"]
  }
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS su tutti, incluso il conteggio `gialla === 15`.

- [ ] **Step 5: Commit**

```bash
git add src/assets/data/techniques.json src/app/core/models/data-integrity.spec.ts
git commit -m "feat: aggiungi Hiza Guruma, Morote e Eri Seoi Nage (1° gruppo Gokyo, gialla)"
```

---

## Task 3: Aggiungere le 5 tecniche mancanti del 2° gruppo Gokyo (arancione)

**Files:**
- Modify: `src/assets/data/techniques.json`
- Modify: `src/app/core/models/data-integrity.spec.ts`

**Interfaces:**
- Consumes: schema `Technique`.
- Produces: id `kosoto-gari`, `koshi-guruma`, `okuri-ashi-barai`, `ushiro-kesa-gatame`, `makura-kesa-gatame`, referenziati da `belt-grades.json` in Task 7 (grado `kyu-4`).

- [ ] **Step 1: Scrivere il test che conta le tecniche arancione**

Aggiungere in `data-integrity.spec.ts`:

```ts
  it('la cintura arancione ha tutte le 11 tecniche del programma consigliato', () => {
    const count = (techniques as Technique[]).filter(t => t.cintura === 'arancione').length;
    expect(count).toBe(11);
  });
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — il conteggio attuale per `arancione` è 6 (dopo Task 1), non 11.

- [ ] **Step 3: Aggiungere i 5 record in `techniques.json`**

```json
  {
    "id": "kosoto-gari",
    "nomeGiapponese": "Kosoto-gari",
    "nomeItaliano": "Piccola falciata esterna",
    "categoria": "nage-waza",
    "cintura": "arancione",
    "descrizione": "Proiezione di gamba: si falcia da fuori il tallone della gamba d'appoggio di uke con un movimento breve e secco.",
    "passaggi": [
      "Squilibrio di uke all'indietro su una gamba.",
      "Falciata del tallone d'appoggio dall'esterno con la pianta del piede.",
      "Spinta in avanti-basso del busto per completare la caduta.",
      "Controllo del bavero fino a terra."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "gamba"]
  },
  {
    "id": "koshi-guruma",
    "nomeGiapponese": "Koshi-guruma",
    "nomeItaliano": "Ruota d'anca",
    "categoria": "nage-waza",
    "cintura": "arancione",
    "descrizione": "Proiezione d'anca in cui il braccio controlla il collo di uke anziché il bavero, facendolo ruotare sopra il bacino.",
    "passaggi": [
      "Presa al collo di uke passando il braccio dietro la nuca.",
      "Rotazione e inserimento del bacino sotto il baricentro di uke.",
      "Sollevamento e proiezione ruotando busto e braccio di controllo."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "anca"]
  },
  {
    "id": "okuri-ashi-barai",
    "nomeGiapponese": "Okuri-ashi-barai",
    "nomeItaliano": "Spazzata di accompagnamento ai piedi",
    "categoria": "nage-waza",
    "cintura": "arancione",
    "descrizione": "Proiezione di tempismo laterale: si spazzano entrambi i piedi di uke in sequenza mentre ci si sposta lateralmente.",
    "passaggi": [
      "Spostamento laterale che costringe uke a seguire con i piedi.",
      "Sincronizzazione con l'istante in cui il piede di uke è leggero durante lo spostamento.",
      "Spazzata del piede nella direzione dello spostamento.",
      "Accompagnamento della caduta laterale con le braccia."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "gamba", "tempismo"]
  },
  {
    "id": "ushiro-kesa-gatame",
    "nomeGiapponese": "Ushiro-kesa-gatame",
    "nomeItaliano": "Controllo a sciarpa rovesciato",
    "categoria": "katame-waza",
    "cintura": "arancione",
    "descrizione": "Variante di kesa-gatame con tori rivolto verso i piedi di uke anziché verso la testa, controllo del braccio invertito.",
    "passaggi": [
      "Posizione laterale rivolta verso i piedi di uke supino.",
      "Controllo del braccio di uke sotto l'ascella con presa rovesciata.",
      "Peso sul petto, gambe aperte per stabilità verso i piedi di uke."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["controllo", "immobilizzazione"]
  },
  {
    "id": "makura-kesa-gatame",
    "nomeGiapponese": "Makura-kesa-gatame",
    "nomeItaliano": "Controllo a sciarpa a cuscino",
    "categoria": "katame-waza",
    "cintura": "arancione",
    "descrizione": "Variante di kesa-gatame in cui la testa di uke resta imprigionata sotto l'ascella di tori come un cuscino, limitando ulteriormente i movimenti.",
    "passaggi": [
      "Posizione laterale rispetto a uke supino con la testa di uke sotto l'ascella.",
      "Controllo del braccio vicino di uke stretto al fianco.",
      "Peso sul petto mantenendo il capo di uke bloccato."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["controllo", "immobilizzazione"]
  }
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS su tutti, incluso il conteggio `arancione === 11`.

- [ ] **Step 5: Commit**

```bash
git add src/assets/data/techniques.json src/app/core/models/data-integrity.spec.ts
git commit -m "feat: aggiungi 5 tecniche mancanti del 2° gruppo Gokyo (arancione)"
```

---

## Task 4: Aggiungere le 9 tecniche mancanti del 3° gruppo Gokyo (verde)

**Files:**
- Modify: `src/assets/data/techniques.json`
- Modify: `src/app/core/models/data-integrity.spec.ts`

**Interfaces:**
- Consumes: schema `Technique`.
- Produces: id `kosoto-gake`, `tsuri-goshi`, `yoko-otoshi`, `ashi-guruma`, `harai-tsurikomi-ashi`, `kata-guruma`, `nami-juji-jime`, `gyaku-juji-jime`, `kata-juji-jime`, referenziati da `belt-grades.json` in Task 7 (grado `kyu-3`).

- [ ] **Step 1: Scrivere il test che conta le tecniche verde**

Aggiungere in `data-integrity.spec.ts`:

```ts
  it('la cintura verde ha tutte le 13 tecniche del programma consigliato', () => {
    const count = (techniques as Technique[]).filter(t => t.cintura === 'verde').length;
    expect(count).toBe(13);
  });
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — il conteggio attuale per `verde` è 4 (dopo Task 1), non 13.

- [ ] **Step 3: Aggiungere i 9 record in `techniques.json`**

```json
  {
    "id": "kosoto-gake",
    "nomeGiapponese": "Kosoto-gake",
    "nomeItaliano": "Piccolo aggancio esterno",
    "categoria": "nage-waza",
    "cintura": "verde",
    "descrizione": "Proiezione di gamba: si aggancia dall'esterno la gamba d'appoggio di uke restando a contatto più a lungo di kosoto-gari.",
    "passaggi": [
      "Squilibrio di uke all'indietro su una gamba.",
      "Aggancio della gamba d'appoggio dall'esterno con la propria gamba, mantenendo il contatto.",
      "Spinta del busto in avanti mentre si trattiene l'aggancio.",
      "Accompagnamento della caduta fino a terra."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "gamba"]
  },
  {
    "id": "tsuri-goshi",
    "nomeGiapponese": "Tsuri-goshi",
    "nomeItaliano": "Anca con sollevamento",
    "categoria": "nage-waza",
    "cintura": "verde",
    "descrizione": "Proiezione d'anca eseguita con presa alta senza la trazione tipica del tsurikomi, sollevando uke direttamente sopra il bacino.",
    "passaggi": [
      "Presa alta al bavero e alla cintura o al fianco di uke.",
      "Rotazione con inserimento del bacino sotto il baricentro di uke.",
      "Sollevamento diretto e proiezione ruotando le spalle."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "anca"]
  },
  {
    "id": "yoko-otoshi",
    "nomeGiapponese": "Yoko-otoshi",
    "nomeItaliano": "Caduta laterale",
    "categoria": "nage-waza",
    "cintura": "verde",
    "descrizione": "Tecnica di sacrificio laterale: tori si lascia cadere di lato portando con sé uke squilibrato lateralmente.",
    "passaggi": [
      "Squilibrio laterale di uke bloccando la gamba d'appoggio.",
      "Caduta controllata di tori sul fianco, mantenendo la presa.",
      "Trazione delle braccia per completare la proiezione laterale di uke."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "sacrificio"]
  },
  {
    "id": "ashi-guruma",
    "nomeGiapponese": "Ashi-guruma",
    "nomeItaliano": "Ruota di gamba",
    "categoria": "nage-waza",
    "cintura": "verde",
    "descrizione": "Proiezione simile a o-goshi ma con la gamba tesa, anziché l'anca, a fare da perno per la rotazione di uke.",
    "passaggi": [
      "Squilibrio in avanti di uke.",
      "Rotazione con inserimento della gamba tesa davanti alle gambe di uke come perno.",
      "Proiezione facendo ruotare uke sopra la gamba tesa."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "gamba"]
  },
  {
    "id": "harai-tsurikomi-ashi",
    "nomeGiapponese": "Harai-tsurikomi-ashi",
    "nomeItaliano": "Spazzata al piede con sollevamento e trazione",
    "categoria": "nage-waza",
    "cintura": "verde",
    "descrizione": "Proiezione di gamba: si spazza la gamba avanzante di uke mentre lo si solleva e tira in torsione, senza bloccare il piede come in sasae.",
    "passaggi": [
      "Squilibrio in avanti-laterale di uke con trazione delle braccia.",
      "Spazzata della gamba avanzante di uke con la pianta del proprio piede.",
      "Sollevamento e rotazione tramite trazione delle braccia.",
      "Accompagnamento della caduta."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "gamba"]
  },
  {
    "id": "kata-guruma",
    "nomeGiapponese": "Kata-guruma",
    "nomeItaliano": "Ruota di spalla",
    "categoria": "nage-waza",
    "cintura": "verde",
    "descrizione": "Proiezione in cui tori solleva uke sulle spalle, a cavalcioni, per poi farlo ruotare a terra davanti a sé.",
    "passaggi": [
      "Abbassamento del baricentro entrando tra le gambe di uke.",
      "Presa alla coscia di uke e sollevamento sulle spalle.",
      "Rotazione del busto per far scivolare uke a terra davanti a tori."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "sollevamento"]
  },
  {
    "id": "nami-juji-jime",
    "nomeGiapponese": "Nami-juji-jime",
    "nomeItaliano": "Strangolamento a croce normale",
    "categoria": "katame-waza",
    "cintura": "verde",
    "descrizione": "Strangolamento con le mani incrociate sui baveri di uke, palmi verso il basso, applicato frontalmente.",
    "passaggi": [
      "Posizionamento sopra o di fronte a uke controllandone il busto.",
      "Presa incrociata dei baveri con i palmi rivolti verso il basso.",
      "Trazione delle mani verso l'esterno per chiudere lo strangolamento."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["strangolamento", "controllo"]
  },
  {
    "id": "gyaku-juji-jime",
    "nomeGiapponese": "Gyaku-juji-jime",
    "nomeItaliano": "Strangolamento a croce inversa",
    "categoria": "katame-waza",
    "cintura": "verde",
    "descrizione": "Strangolamento con le mani incrociate sui baveri di uke, palmi verso l'alto, variante inversa del nami-juji-jime.",
    "passaggi": [
      "Posizionamento sopra o di fronte a uke controllandone il busto.",
      "Presa incrociata dei baveri con i palmi rivolti verso l'alto.",
      "Trazione delle mani verso l'esterno per chiudere lo strangolamento."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["strangolamento", "controllo"]
  },
  {
    "id": "kata-juji-jime",
    "nomeGiapponese": "Kata-juji-jime",
    "nomeItaliano": "Strangolamento a croce singola",
    "categoria": "katame-waza",
    "cintura": "verde",
    "descrizione": "Strangolamento a croce con una mano a palmo in giù e una a palmo in su, forma mista tra nami e gyaku juji jime.",
    "passaggi": [
      "Posizionamento sopra o di fronte a uke controllandone il busto.",
      "Presa incrociata dei baveri con una mano a palmo in giù e una a palmo in su.",
      "Trazione delle mani verso l'esterno per chiudere lo strangolamento."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["strangolamento", "controllo"]
  }
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS su tutti, incluso il conteggio `verde === 13`.

- [ ] **Step 5: Commit**

```bash
git add src/assets/data/techniques.json src/app/core/models/data-integrity.spec.ts
git commit -m "feat: aggiungi 9 tecniche mancanti del 3° gruppo Gokyo (verde)"
```

---

## Task 5: Aggiungere le 12 tecniche mancanti del 4° gruppo Gokyo (blu)

**Files:**
- Modify: `src/assets/data/techniques.json`
- Modify: `src/app/core/models/data-integrity.spec.ts`

**Interfaces:**
- Consumes: schema `Technique`.
- Produces: id `sumi-gaeshi`, `tani-otoshi`, `hane-makikomi`, `sukui-nage`, `utsuri-goshi`, `o-guruma`, `soto-makikomi`, `uki-otoshi`, `kataha-jime`, `ryote-jime`, `ude-gatame`, `waki-gatame`, referenziati da `belt-grades.json` in Task 7 (grado `kyu-2`).

- [ ] **Step 1: Scrivere il test che conta le tecniche blu**

Aggiungere in `data-integrity.spec.ts`:

```ts
  it('la cintura blu ha tutte le 14 tecniche del programma consigliato', () => {
    const count = (techniques as Technique[]).filter(t => t.cintura === 'blu').length;
    expect(count).toBe(14);
  });
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — il conteggio attuale per `blu` è 2 (dopo Task 1), non 14.

- [ ] **Step 3: Aggiungere i 12 record in `techniques.json`**

```json
  {
    "id": "sumi-gaeshi",
    "nomeGiapponese": "Sumi-gaeshi",
    "nomeItaliano": "Ribaltamento d'angolo",
    "categoria": "nage-waza",
    "cintura": "blu",
    "descrizione": "Tecnica di sacrificio: tori si lascia cadere all'indietro trascinando uke con una presa alla cintura o alla schiena, facendolo ruotare oltre la testa.",
    "passaggi": [
      "Presa profonda alla schiena o alla cintura di uke, corpo a corpo.",
      "Squilibrio all'indietro e caduta controllata sul dorso.",
      "Sollevamento con le gambe per far ruotare uke oltre la testa di tori."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "sacrificio"]
  },
  {
    "id": "tani-otoshi",
    "nomeGiapponese": "Tani-otoshi",
    "nomeItaliano": "Caduta nella valle",
    "categoria": "nage-waza",
    "cintura": "blu",
    "descrizione": "Tecnica di sacrificio laterale-posteriore: tori blocca una gamba di uke dietro di sé e si lascia cadere per proiettarlo oltre l'ostacolo.",
    "passaggi": [
      "Squilibrio all'indietro di uke controllando il busto.",
      "Posizionamento della propria gamba tesa dietro una gamba di uke.",
      "Caduta controllata di lato mentre si trattiene la presa.",
      "Proiezione di uke oltre l'ostacolo della gamba."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "sacrificio"]
  },
  {
    "id": "hane-makikomi",
    "nomeGiapponese": "Hane-makikomi",
    "nomeItaliano": "Avvolgimento a molla",
    "categoria": "nage-waza",
    "cintura": "blu",
    "descrizione": "Variante makikomi di hane-goshi: tori avvolge il braccio di uke e si lascia cadere in avanti per completare la proiezione.",
    "passaggi": [
      "Squilibrio in avanti di uke con inserimento della gamba a molla come in hane-goshi.",
      "Avvolgimento del braccio di uke con il proprio braccio.",
      "Caduta controllata in avanti trascinando uke nella rotazione."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "sacrificio", "makikomi"]
  },
  {
    "id": "sukui-nage",
    "nomeGiapponese": "Sukui-nage",
    "nomeItaliano": "Proiezione a cucchiaio",
    "categoria": "nage-waza",
    "cintura": "blu",
    "descrizione": "Proiezione senza presa al judogi: tori solleva uke abbracciandone le cosce o il bacino e lo fa ruotare a terra.",
    "passaggi": [
      "Abbassamento del baricentro entrando sotto uke.",
      "Presa a cucchiaio delle cosce o del bacino di uke.",
      "Sollevamento e rotazione del busto per proiettare uke."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "sollevamento"]
  },
  {
    "id": "utsuri-goshi",
    "nomeGiapponese": "Utsuri-goshi",
    "nomeItaliano": "Cambio d'anca",
    "categoria": "nage-waza",
    "cintura": "blu",
    "descrizione": "Contro-proiezione d'anca: tori intercetta uke che tenta una proiezione d'anca sollevandolo e ribaltando la rotazione a proprio favore.",
    "passaggi": [
      "Intercettazione di uke durante un tentativo di proiezione d'anca.",
      "Sollevamento di uke sul proprio bacino contrastando la rotazione originale.",
      "Ribaltamento della rotazione e proiezione a favore di tori."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "anca", "contrattacco"]
  },
  {
    "id": "o-guruma",
    "nomeGiapponese": "O-guruma",
    "nomeItaliano": "Grande ruota",
    "categoria": "nage-waza",
    "cintura": "blu",
    "descrizione": "Proiezione simile a uchi-mata ma con la gamba tesa e alta come perno esterno, facendo ruotare uke sopra di essa.",
    "passaggi": [
      "Squilibrio in avanti di uke.",
      "Rotazione entrando con la gamba tesa alta davanti al corpo di uke.",
      "Proiezione facendo ruotare uke sopra la gamba tesa."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "gamba"]
  },
  {
    "id": "soto-makikomi",
    "nomeGiapponese": "Soto-makikomi",
    "nomeItaliano": "Avvolgimento esterno",
    "categoria": "nage-waza",
    "cintura": "blu",
    "descrizione": "Proiezione in cui tori avvolge il braccio di uke dall'esterno e si lascia cadere per trascinarlo nella rotazione.",
    "passaggi": [
      "Squilibrio in avanti-laterale di uke.",
      "Avvolgimento del braccio di uke dall'esterno con il proprio braccio e fianco.",
      "Caduta controllata di lato trascinando uke nella rotazione."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "sacrificio", "makikomi"]
  },
  {
    "id": "uki-otoshi",
    "nomeGiapponese": "Uki-otoshi",
    "nomeItaliano": "Caduta fluttuante",
    "categoria": "nage-waza",
    "cintura": "blu",
    "descrizione": "Proiezione senza appoggio di gamba o anca: si squilibra uke completamente in avanti fino a farlo cadere solo con la trazione delle braccia.",
    "passaggi": [
      "Trazione circolare che squilibra completamente uke in avanti.",
      "Abbassamento del baricentro senza contatto di gamba o anca.",
      "Accompagnamento della caduta di uke con le braccia fino a terra."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "squilibrio"]
  },
  {
    "id": "kataha-jime",
    "nomeGiapponese": "Kataha-jime",
    "nomeItaliano": "Strangolamento a mezza spalla",
    "categoria": "katame-waza",
    "cintura": "blu",
    "descrizione": "Strangolamento da dietro che combina una presa al bavero con un braccio di uke bloccato dietro la schiena.",
    "passaggi": [
      "Posizionamento dietro la schiena di uke, controllando il busto con le gambe.",
      "Una mano afferra il bavero passando intorno al collo.",
      "L'altro braccio di uke viene bloccato dietro la schiena.",
      "Trazione del bavero per chiudere lo strangolamento."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["strangolamento", "controllo"]
  },
  {
    "id": "ryote-jime",
    "nomeGiapponese": "Ryote-jime",
    "nomeItaliano": "Strangolamento a due mani",
    "categoria": "katame-waza",
    "cintura": "blu",
    "descrizione": "Strangolamento frontale con entrambe le mani sui baveri di uke senza incrociare le braccia.",
    "passaggi": [
      "Posizionamento frontale o superiore rispetto a uke.",
      "Presa di entrambi i baveri senza incrociare le braccia.",
      "Trazione verso il basso e verso l'esterno per chiudere lo strangolamento."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["strangolamento", "controllo"]
  },
  {
    "id": "ude-gatame",
    "nomeGiapponese": "Ude-gatame",
    "nomeItaliano": "Leva al braccio dritta",
    "categoria": "katame-waza",
    "cintura": "blu",
    "descrizione": "Leva articolare al gomito eseguita bloccando il braccio teso di uke contro il proprio corpo, senza passare la gamba.",
    "passaggi": [
      "Controllo del polso di uke con il braccio teso.",
      "Blocco del gomito di uke contro il proprio petto o ascella.",
      "Estensione applicando pressione sull'articolazione del gomito."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["leva", "controllo"]
  },
  {
    "id": "waki-gatame",
    "nomeGiapponese": "Waki-gatame",
    "nomeItaliano": "Leva al braccio sotto ascella",
    "categoria": "katame-waza",
    "cintura": "blu",
    "descrizione": "Leva articolare al gomito eseguita bloccando il braccio di uke sotto la propria ascella, applicabile anche in piedi.",
    "passaggi": [
      "Controllo del polso di uke con entrambe le mani.",
      "Blocco del braccio di uke sotto la propria ascella con il gomito rivolto verso l'alto.",
      "Pressione del busto verso il basso per applicare la leva."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["leva", "controllo"]
  }
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS su tutti, incluso il conteggio `blu === 14`.

- [ ] **Step 5: Commit**

```bash
git add src/assets/data/techniques.json src/app/core/models/data-integrity.spec.ts
git commit -m "feat: aggiungi 12 tecniche mancanti del 4° gruppo Gokyo (blu)"
```

---

## Task 6: Aggiungere le 8 tecniche mancanti del 5° gruppo Gokyo (marrone)

Chiude il problema segnalato dall'utente: la cintura marrone passa da 1 a 8 tecniche dirette.

**Files:**
- Modify: `src/assets/data/techniques.json`
- Modify: `src/app/core/models/data-integrity.spec.ts`

**Interfaces:**
- Consumes: schema `Technique`.
- Produces: id `osoto-guruma`, `uki-waza`, `yoko-wakare`, `yoko-guruma`, `ushiro-goshi`, `ura-nage`, `sumi-otoshi`, `yoko-gake`, referenziati da `belt-grades.json` in Task 7 (grado `kyu-1`).

- [ ] **Step 1: Scrivere il test che conta le tecniche marrone e il totale**

Aggiungere in `data-integrity.spec.ts`:

```ts
  it('la cintura marrone ha tutte le 8 tecniche del programma consigliato', () => {
    const count = (techniques as Technique[]).filter(t => t.cintura === 'marrone').length;
    expect(count).toBe(8);
  });

  it('il totale delle tecniche corrisponde a tutti i 40 lanci Gokyo + varianti + katame-waza', () => {
    expect((techniques as Technique[]).length).toBe(61);
  });
```

- [ ] **Step 2: Eseguire i test e verificare che falliscano**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — `marrone` è 0 (dopo Task 1 `ude-garami` è stato spostato a verde), il totale è 53 (24 + 3 + 5 + 9 + 12 = 53), non 61.

- [ ] **Step 3: Aggiungere gli 8 record in `techniques.json`**

```json
  {
    "id": "osoto-guruma",
    "nomeGiapponese": "Osoto-guruma",
    "nomeItaliano": "Grande ruota esterna",
    "categoria": "nage-waza",
    "cintura": "marrone",
    "descrizione": "Variante di osoto-gari in cui entrambe le gambe di uke vengono bloccate insieme, facendolo ruotare come un unico blocco.",
    "passaggi": [
      "Squilibrio di uke all'indietro, sul tallone, come in osoto-gari.",
      "Avanzamento bloccando entrambe le gambe di uke con la propria gamba tesa.",
      "Rotazione del busto per proiettare uke mantenendo le gambe bloccate insieme."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "gamba"]
  },
  {
    "id": "uki-waza",
    "nomeGiapponese": "Uki-waza",
    "nomeItaliano": "Tecnica fluttuante",
    "categoria": "nage-waza",
    "cintura": "marrone",
    "descrizione": "Tecnica di sacrificio laterale leggero: tori si abbassa di lato senza cadere completamente, squilibrando uke con un movimento fluttuante.",
    "passaggi": [
      "Squilibrio laterale-avanti di uke con trazione delle braccia.",
      "Abbassamento laterale del corpo di tori senza toccare terra con il busto.",
      "Proiezione di uke tramite la torsione e la trazione delle braccia."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "sacrificio"]
  },
  {
    "id": "yoko-wakare",
    "nomeGiapponese": "Yoko-wakare",
    "nomeItaliano": "Separazione laterale",
    "categoria": "nage-waza",
    "cintura": "marrone",
    "descrizione": "Tecnica di sacrificio laterale in cui tori cade di lato separando le gambe, proiettando uke lungo lo stesso asse di caduta.",
    "passaggi": [
      "Squilibrio laterale di uke con trazione decisa delle braccia.",
      "Caduta controllata di lato con le gambe divaricate.",
      "Proiezione di uke lungo la direzione della caduta."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "sacrificio"]
  },
  {
    "id": "yoko-guruma",
    "nomeGiapponese": "Yoko-guruma",
    "nomeItaliano": "Ruota laterale",
    "categoria": "nage-waza",
    "cintura": "marrone",
    "descrizione": "Tecnica di sacrificio applicata come contrattacco a una proiezione frontale, ribaltando uke lateralmente sopra il proprio corpo.",
    "passaggi": [
      "Intercettazione di uke durante un attacco frontale (ad esempio seoi-nage).",
      "Caduta controllata di lato passando una gamba sopra il corpo di uke.",
      "Rotazione che ribalta uke oltre il fianco di tori."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "sacrificio", "contrattacco"]
  },
  {
    "id": "ushiro-goshi",
    "nomeGiapponese": "Ushiro-goshi",
    "nomeItaliano": "Anca posteriore",
    "categoria": "nage-waza",
    "cintura": "marrone",
    "descrizione": "Contro-proiezione d'anca applicata da dietro: tori solleva uke che attacca da vicino e lo fa ricadere all'indietro sul proprio bacino.",
    "passaggi": [
      "Intercettazione di uke che si avvicina per una proiezione d'anca.",
      "Presa alla cintura o ai fianchi di uke da dietro.",
      "Sollevamento di uke sul proprio bacino e proiezione all'indietro."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "anca", "contrattacco"]
  },
  {
    "id": "ura-nage",
    "nomeGiapponese": "Ura-nage",
    "nomeItaliano": "Proiezione rovesciata",
    "categoria": "nage-waza",
    "cintura": "marrone",
    "descrizione": "Tecnica di sacrificio posteriore: tori intercetta l'attacco di uke da vicino, lo solleva e cade all'indietro proiettandolo oltre la testa.",
    "passaggi": [
      "Intercettazione di uke durante un attacco ravvicinato d'anca o gamba.",
      "Presa profonda in vita e sollevamento di uke da terra.",
      "Caduta controllata all'indietro proiettando uke oltre la testa di tori."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "sacrificio", "contrattacco"]
  },
  {
    "id": "sumi-otoshi",
    "nomeGiapponese": "Sumi-otoshi",
    "nomeItaliano": "Caduta d'angolo",
    "categoria": "nage-waza",
    "cintura": "marrone",
    "descrizione": "Proiezione di squilibrio puro verso l'angolo posteriore di uke, senza appoggio di gamba o anca, simile a uki-otoshi ma all'indietro.",
    "passaggi": [
      "Squilibrio di uke verso l'angolo posteriore, oltre il tallone.",
      "Trazione e spinta combinate senza contatto di gamba o anca.",
      "Accompagnamento della caduta di uke verso l'angolo squilibrato."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "squilibrio"]
  },
  {
    "id": "yoko-gake",
    "nomeGiapponese": "Yoko-gake",
    "nomeItaliano": "Aggancio laterale",
    "categoria": "nage-waza",
    "cintura": "marrone",
    "descrizione": "Tecnica di sacrificio laterale: tori aggancia la gamba di uke durante uno spostamento laterale e cade di lato trascinandolo a terra.",
    "passaggi": [
      "Squilibrio laterale di uke durante uno spostamento.",
      "Aggancio della gamba di uke con la propria gamba durante il movimento.",
      "Caduta controllata di lato trascinando uke nella proiezione."
    ],
    "media": [{ "tipo": "placeholder", "src": "assets/media/placeholder.svg", "didascalia": "Video in arrivo" }],
    "tags": ["proiezione", "sacrificio", "gamba"]
  }
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS su tutti, incluso `marrone === 8` e il totale `=== 61`.

- [ ] **Step 5: Commit**

```bash
git add src/assets/data/techniques.json src/app/core/models/data-integrity.spec.ts
git commit -m "feat: aggiungi 8 tecniche mancanti del 5° gruppo Gokyo (marrone)"
```

---

## Task 7: Modello `BeltGrade`, contenuto `belt-grades.json` e `ContentService`

**Files:**
- Create: `src/app/core/models/belt-grade.model.ts`
- Create: `src/assets/data/belt-grades.json`
- Modify: `src/app/core/services/content.service.ts`
- Modify: `src/app/core/services/content.service.spec.ts`
- Modify: `src/app/core/models/data-integrity.spec.ts`

**Interfaces:**
- Consumes: `Cintura` da `technique.model.ts`; tutti i 61 id di `techniques.json` (Task 1–6).
- Produces:
  ```ts
  export interface BeltGradeSection {
    id: string;
    title: string;
    techniqueIds?: string[];
    items?: string[];
  }
  export interface BeltGrade {
    id: string;
    order: number;
    gradeLabel: string;
    beltColor: Cintura;
    disclaimer: string;
    sections: BeltGradeSection[];
    sources: { title: string; url: string }[];
  }
  ```
  `ContentService.getBeltGrades(): Observable<BeltGrade[]>` e `ContentService.getBeltGrade(id: string): Observable<BeltGrade | undefined>`, usati da Task 8, 9, 10.

- [ ] **Step 1: Creare il modello**

`src/app/core/models/belt-grade.model.ts`:

```ts
import { Cintura } from './technique.model';

export interface BeltGradeSection {
  id: string;
  title: string;
  techniqueIds?: string[];
  items?: string[];
}

export interface BeltGrade {
  id: string;
  order: number;
  gradeLabel: string;
  beltColor: Cintura;
  disclaimer: string;
  sections: BeltGradeSection[];
  sources: { title: string; url: string }[];
}
```

- [ ] **Step 2: Scrivere il test di integrità per `belt-grades.json` (fallirà finché il file non esiste)**

Aggiungere in cima a `data-integrity.spec.ts`:

```ts
import beltGrades from '../../../assets/data/belt-grades.json';
import { BeltGrade } from './belt-grade.model';
```

E in fondo al `describe`:

```ts
  it('ci sono esattamente 6 gradi Kyu ordinati da 1 (bianca) a 6 (marrone)', () => {
    const grades = beltGrades as BeltGrade[];
    expect(grades.length).toBe(6);
    const orders = grades.map(g => g.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('ogni techniqueId referenziato nei gradi Kyu esiste in techniques.json', () => {
    const techniqueIds = new Set((techniques as Technique[]).map(t => t.id));
    (beltGrades as BeltGrade[]).forEach(grade => {
      grade.sections.forEach(section => {
        (section.techniqueIds ?? []).forEach(id => {
          expect(techniqueIds.has(id)).withContext(`${grade.id} → ${section.id} → ${id}`).toBeTrue();
        });
      });
    });
  });

  it('ogni grado ha un disclaimer e almeno una fonte', () => {
    (beltGrades as BeltGrade[]).forEach(g => {
      expect(g.disclaimer).toBeTruthy();
      expect(g.sources.length).toBeGreaterThan(0);
    });
  });
```

- [ ] **Step 3: Eseguire i test e verificare che falliscano**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL (o errore di compilazione) — `belt-grades.json` non esiste ancora.

- [ ] **Step 4: Creare `src/assets/data/belt-grades.json`**

```json
[
  {
    "id": "kyu-6",
    "order": 1,
    "gradeLabel": "6° Kyu",
    "beltColor": "bianca",
    "disclaimer": "Il programma delle cinture colorate è una proposta didattica basata sulla progressione tecnica tradizionale del Gokyo. La FIJLKAM affida la graduazione dei Kyu all'Insegnante Tecnico Sociale; il programma effettivo può quindi variare da una società all'altra.",
    "sections": [
      {
        "id": "fondamentali",
        "title": "Fondamentali",
        "items": [
          "Significato generale del Judo",
          "Comportamento e sicurezza nel dojo",
          "Tori e Uke",
          "Ritsu-rei (saluto in piedi)",
          "Za-rei (saluto in ginocchio)",
          "Corretta vestizione del judogi",
          "Corretta legatura della cintura",
          "Shizen-tai (postura naturale)",
          "Jigo-tai (postura difensiva)",
          "Kumi-kata (presa)",
          "Shintai (spostamenti)",
          "Tai-sabaki (rotazione del corpo)",
          "Introduzione a Kuzushi, Tsukuri e Kake"
        ]
      },
      {
        "id": "ukemi",
        "title": "Ukemi",
        "items": [
          "Ushiro Ukemi (caduta all'indietro)",
          "Yoko Ukemi (caduta laterale)",
          "Mae Ukemi (caduta in avanti)",
          "Zempo Kaiten Ukemi (caduta rotolata in avanti)",
          "Esercizi di caduta a destra e a sinistra"
        ]
      },
      {
        "id": "pratica",
        "title": "Pratica",
        "items": [
          "Esercizi di equilibrio",
          "Spostamenti con il compagno",
          "Controllo del corpo e della distanza",
          "Forme propedeutiche di Randori",
          "Rispetto del compagno e interruzione immediata su segnale"
        ]
      }
    ],
    "sources": [
      { "title": "Regolamento Organico Federale FIJLKAM (art. 92-96)", "url": "https://www.fijlkam.it/puglia/images/puglia/2025_-_Testo_ROF_approvato_GN_CONI_14-04-2025.pdf" }
    ]
  },
  {
    "id": "kyu-5",
    "order": 2,
    "gradeLabel": "5° Kyu",
    "beltColor": "gialla",
    "disclaimer": "Il programma delle cinture colorate è una proposta didattica basata sulla progressione tecnica tradizionale del Gokyo. La FIJLKAM affida la graduazione dei Kyu all'Insegnante Tecnico Sociale; il programma effettivo può quindi variare da una società all'altra.",
    "sections": [
      {
        "id": "gokyo-1",
        "title": "Gokyo — 1° gruppo",
        "techniqueIds": ["de-ashi-barai", "hiza-guruma", "sasae-tsurikomi-ashi", "uki-goshi", "osoto-gari", "o-goshi", "ouchi-gari", "seoi-nage"]
      },
      {
        "id": "varianti-seoi",
        "title": "Varianti di Seoi Nage",
        "techniqueIds": ["ippon-seoi-nage", "morote-seoi-nage", "eri-seoi-nage"]
      },
      {
        "id": "osaekomi",
        "title": "Osaekomi-waza",
        "techniqueIds": ["kesa-gatame", "yoko-shiho-gatame", "kami-shiho-gatame", "tate-shiho-gatame"]
      },
      {
        "id": "competenze",
        "title": "Competenze",
        "items": [
          "Entrata nelle immobilizzazioni fondamentali",
          "Mantenimento controllato dell'immobilizzazione",
          "Riconoscimento di Osaekomi e Toketa",
          "Uscite elementari dalle immobilizzazioni",
          "Collegamento elementare tra proiezione e immobilizzazione"
        ]
      }
    ],
    "sources": [
      { "title": "Regolamento Organico Federale FIJLKAM (art. 92-96)", "url": "https://www.fijlkam.it/puglia/images/puglia/2025_-_Testo_ROF_approvato_GN_CONI_14-04-2025.pdf" }
    ]
  },
  {
    "id": "kyu-4",
    "order": 3,
    "gradeLabel": "4° Kyu",
    "beltColor": "arancione",
    "disclaimer": "Il programma delle cinture colorate è una proposta didattica basata sulla progressione tecnica tradizionale del Gokyo. La FIJLKAM affida la graduazione dei Kyu all'Insegnante Tecnico Sociale; il programma effettivo può quindi variare da una società all'altra.",
    "sections": [
      {
        "id": "gokyo-2",
        "title": "Gokyo — 2° gruppo",
        "techniqueIds": ["kosoto-gari", "kouchi-gari", "koshi-guruma", "tsuri-komi-goshi", "okuri-ashi-barai", "tai-otoshi", "harai-goshi", "uchi-mata"]
      },
      {
        "id": "osaekomi-aggiuntive",
        "title": "Osaekomi-waza aggiuntive",
        "techniqueIds": ["ushiro-kesa-gatame", "kata-gatame", "makura-kesa-gatame"]
      },
      {
        "id": "hairi-kata",
        "title": "Hairi-kata elementari",
        "items": [
          "Entrata su Uke in posizione prona",
          "Entrata su Uke in quadrupedia",
          "Ribaltamento dalla posizione laterale",
          "Superamento elementare delle gambe",
          "Controllo dalla posizione superiore"
        ]
      },
      {
        "id": "collegamenti",
        "title": "Collegamenti suggeriti",
        "items": [
          "O Soto Gari → Kesa Gatame",
          "O Goshi → Kesa Gatame",
          "Seoi Nage → Yoko Shiho Gatame",
          "O Uchi Gari → immobilizzazione",
          "Ko Uchi Gari → immobilizzazione"
        ]
      }
    ],
    "sources": [
      { "title": "Regolamento Organico Federale FIJLKAM (art. 92-96)", "url": "https://www.fijlkam.it/puglia/images/puglia/2025_-_Testo_ROF_approvato_GN_CONI_14-04-2025.pdf" }
    ]
  },
  {
    "id": "kyu-3",
    "order": 4,
    "gradeLabel": "3° Kyu",
    "beltColor": "verde",
    "disclaimer": "Il programma delle cinture colorate è una proposta didattica basata sulla progressione tecnica tradizionale del Gokyo. La FIJLKAM affida la graduazione dei Kyu all'Insegnante Tecnico Sociale; il programma effettivo può quindi variare da una società all'altra.",
    "sections": [
      {
        "id": "gokyo-3",
        "title": "Gokyo — 3° gruppo",
        "techniqueIds": ["kosoto-gake", "tsuri-goshi", "yoko-otoshi", "ashi-guruma", "hane-goshi", "harai-tsurikomi-ashi", "tomoe-nage", "kata-guruma"]
      },
      {
        "id": "shime-waza",
        "title": "Shime-waza",
        "techniqueIds": ["nami-juji-jime", "gyaku-juji-jime", "kata-juji-jime"]
      },
      {
        "id": "kansetsu-waza",
        "title": "Kansetsu-waza",
        "techniqueIds": ["ude-garami", "juji-gatame"]
      },
      {
        "id": "competenze-dinamiche",
        "title": "Competenze dinamiche",
        "items": [
          "Individuazione del Tokui-waza",
          "Esecuzione a destra e sinistra",
          "Attacco durante lo spostamento",
          "Introduzione ai Renraku-waza",
          "Difese tramite postura, movimento e Tai-sabaki",
          "Continuità tra Tachi-waza e Ne-waza"
        ]
      },
      {
        "id": "renraku-waza",
        "title": "Renraku-waza suggeriti",
        "items": [
          "O Uchi Gari → Uchi Mata",
          "Ko Uchi Gari → Seoi Nage",
          "O Soto Gari → O Uchi Gari",
          "De Ashi Barai → O Soto Gari",
          "Uchi Mata → O Uchi Gari"
        ]
      }
    ],
    "sources": [
      { "title": "Regolamento Organico Federale FIJLKAM (art. 92-96)", "url": "https://www.fijlkam.it/puglia/images/puglia/2025_-_Testo_ROF_approvato_GN_CONI_14-04-2025.pdf" }
    ]
  },
  {
    "id": "kyu-2",
    "order": 5,
    "gradeLabel": "2° Kyu",
    "beltColor": "blu",
    "disclaimer": "Il programma delle cinture colorate è una proposta didattica basata sulla progressione tecnica tradizionale del Gokyo. La FIJLKAM affida la graduazione dei Kyu all'Insegnante Tecnico Sociale; il programma effettivo può quindi variare da una società all'altra.",
    "sections": [
      {
        "id": "gokyo-4",
        "title": "Gokyo — 4° gruppo",
        "techniqueIds": ["sumi-gaeshi", "tani-otoshi", "hane-makikomi", "sukui-nage", "utsuri-goshi", "o-guruma", "soto-makikomi", "uki-otoshi"]
      },
      {
        "id": "shime-waza",
        "title": "Shime-waza",
        "techniqueIds": ["hadaka-jime", "okuri-eri-jime", "kataha-jime", "ryote-jime"]
      },
      {
        "id": "kansetsu-waza",
        "title": "Kansetsu-waza",
        "techniqueIds": ["ude-gatame", "waki-gatame"]
      },
      {
        "id": "competenze-dinamiche",
        "title": "Competenze dinamiche",
        "items": [
          "Renraku-waza avanti/indietro",
          "Renraku-waza destra/sinistra",
          "Difese contro le tecniche fondamentali",
          "Introduzione ai Gaeshi-waza",
          "Hairi-kata da posizioni differenti",
          "Randori in piedi",
          "Randori a terra",
          "Passaggio continuo Tachi-waza → Ne-waza"
        ]
      },
      {
        "id": "gaeshi-waza",
        "title": "Gaeshi-waza suggeriti",
        "items": [
          "O Uchi Gari → O Uchi Gaeshi",
          "Ko Uchi Gari → Ko Uchi Gaeshi",
          "O Soto Gari → O Soto Gaeshi",
          "Uchi Mata → Uchi Mata Sukashi",
          "Uchi Mata → Uchi Mata Gaeshi"
        ]
      }
    ],
    "sources": [
      { "title": "Regolamento Organico Federale FIJLKAM (art. 92-96)", "url": "https://www.fijlkam.it/puglia/images/puglia/2025_-_Testo_ROF_approvato_GN_CONI_14-04-2025.pdf" }
    ]
  },
  {
    "id": "kyu-1",
    "order": 6,
    "gradeLabel": "1° Kyu",
    "beltColor": "marrone",
    "disclaimer": "Il programma delle cinture colorate è una proposta didattica basata sulla progressione tecnica tradizionale del Gokyo. La FIJLKAM affida la graduazione dei Kyu all'Insegnante Tecnico Sociale; il programma effettivo può quindi variare da una società all'altra.",
    "sections": [
      {
        "id": "gokyo-5",
        "title": "Gokyo — 5° gruppo",
        "techniqueIds": ["osoto-guruma", "uki-waza", "yoko-wakare", "yoko-guruma", "ushiro-goshi", "ura-nage", "sumi-otoshi", "yoko-gake"]
      },
      {
        "id": "competenze-cumulative",
        "title": "Competenze cumulative",
        "items": [
          "Conoscenza dei 40 lanci del Gokyo",
          "Varianti principali di Seoi Nage",
          "Osaekomi-waza e uscite",
          "Principali Shime-waza",
          "Principali Kansetsu-waza",
          "Hairi-kata",
          "Renraku-waza",
          "Gaeshi-waza",
          "Difese",
          "Continuità Tachi-waza/Ne-waza",
          "Tokui-waza",
          "Randori in piedi e a terra",
          "Nozioni arbitrali fondamentali"
        ]
      },
      {
        "id": "preparazione-dan",
        "title": "Preparazione consigliata al 1° Dan",
        "items": [
          "1°, 2° e 3° gruppo del Nage no Kata",
          "1° gruppo del Katame no Kata oppure 1° gruppo del Ju no Kata",
          "Cerimoniale di apertura e chiusura",
          "Ruoli di Tori e Uke",
          "Esecuzione a destra e sinistra dove prevista"
        ]
      }
    ],
    "sources": [
      { "title": "Regolamento Organico Federale FIJLKAM (art. 92-96)", "url": "https://www.fijlkam.it/puglia/images/puglia/2025_-_Testo_ROF_approvato_GN_CONI_14-04-2025.pdf" }
    ]
  }
]
```

- [ ] **Step 5: Aggiungere `getBeltGrades`/`getBeltGrade` a `ContentService`**

Sostituire il contenuto di `src/app/core/services/content.service.ts` con:

```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { Technique } from '../models/technique.model';
import { Kata } from '../models/kata.model';
import { BeltGrade } from '../models/belt-grade.model';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private http = inject(HttpClient);
  private techniques$?: Observable<Technique[]>;
  private kata$?: Observable<Kata[]>;
  private beltGrades$?: Observable<BeltGrade[]>;

  getTechniques(): Observable<Technique[]> {
    if (!this.techniques$) {
      this.techniques$ = this.http.get<Technique[]>('assets/data/techniques.json').pipe(shareReplay(1));
    }
    return this.techniques$;
  }

  getKata(): Observable<Kata[]> {
    if (!this.kata$) {
      this.kata$ = this.http.get<Kata[]>('assets/data/kata.json').pipe(shareReplay(1));
    }
    return this.kata$;
  }

  getBeltGrades(): Observable<BeltGrade[]> {
    if (!this.beltGrades$) {
      this.beltGrades$ = this.http.get<BeltGrade[]>('assets/data/belt-grades.json').pipe(shareReplay(1));
    }
    return this.beltGrades$;
  }

  getTechnique(id: string): Observable<Technique | undefined> {
    return this.getTechniques().pipe(map(list => list.find(t => t.id === id)));
  }

  getKataById(id: string): Observable<Kata | undefined> {
    return this.getKata().pipe(map(list => list.find(k => k.id === id)));
  }

  getBeltGrade(id: string): Observable<BeltGrade | undefined> {
    return this.getBeltGrades().pipe(map(list => list.find(g => g.id === id)));
  }
}
```

- [ ] **Step 6: Aggiungere i test di `ContentService` per i gradi Kyu**

Aggiungere in `src/app/core/services/content.service.spec.ts`, dentro il `describe` esistente:

```ts
  it('carica i gradi Kyu dal JSON', () => {
    service.getBeltGrades().subscribe(list => expect(list.length).toBe(1));
    httpMock.expectOne('assets/data/belt-grades.json')
      .flush([{ id: 'kyu-6' }]);
  });

  it('getBeltGrade ritorna quello con id corrispondente', () => {
    service.getBeltGrade('kyu-5').subscribe(g => expect(g?.id).toBe('kyu-5'));
    httpMock.expectOne('assets/data/belt-grades.json')
      .flush([{ id: 'kyu-6' }, { id: 'kyu-5' }]);
  });
```

- [ ] **Step 7: Eseguire i test e verificare che passino**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS su tutti i test, incluso `ContentService` e `Integrità dati contenuti`.

- [ ] **Step 8: Eseguire build e lint**

Run: `npx ng build && npx ng lint`
Expected: entrambi 0 errori.

- [ ] **Step 9: Commit**

```bash
git add src/app/core/models/belt-grade.model.ts src/assets/data/belt-grades.json \
  src/app/core/services/content.service.ts src/app/core/services/content.service.spec.ts \
  src/app/core/models/data-integrity.spec.ts
git commit -m "feat: modello BeltGrade, contenuto dei 6 gradi Kyu, ContentService.getBeltGrades"
```

---

## Task 8: `BeltProgressService`

**Files:**
- Create: `src/app/core/services/belt-progress.service.ts`
- Create: `src/app/core/services/belt-progress.service.spec.ts`

**Interfaces:**
- Consumes: `StorageService` (`get(key): Promise<string|null>`, `set(key, value): Promise<void>`); `BeltGrade` da Task 7.
- Produces:
  ```ts
  currentGradeId: Signal<string | null>
  studiedTechniqueIds: Signal<string[]>
  load(): Promise<void>
  setCurrentGrade(id: string): Promise<void>
  toggleStudied(techniqueId: string): Promise<void>
  isStudied(techniqueId: string): boolean
  statusFor(grade: BeltGrade): 'earned' | 'current' | 'upcoming'
  completionFor(grade: BeltGrade): number  // 0-100
  ```
  Usato da Task 9 (list page), Task 10 (detail page) e Task 12 (toggle nella scheda tecnica).

- [ ] **Step 1: Scrivere i test falliti**

`src/app/core/services/belt-progress.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { BeltProgressService } from './belt-progress.service';
import { StorageService } from './storage.service';
import { BeltGrade } from '../models/belt-grade.model';

class FakeStorage {
  store = new Map<string, string>();
  async get(key: string) { return this.store.get(key) ?? null; }
  async set(key: string, value: string) { this.store.set(key, value); }
}

const kyu4: BeltGrade = {
  id: 'kyu-4', order: 3, gradeLabel: '4° Kyu', beltColor: 'arancione',
  disclaimer: '', sources: [],
  sections: [{ id: 's1', title: 'Gokyo', techniqueIds: ['a', 'b', 'c', 'd'] }]
};

describe('BeltProgressService', () => {
  let service: BeltProgressService;
  let storage: FakeStorage;

  beforeEach(() => {
    storage = new FakeStorage();
    TestBed.configureTestingModule({
      providers: [BeltProgressService, { provide: StorageService, useValue: storage }]
    });
    service = TestBed.inject(BeltProgressService);
  });

  it('parte senza cintura attuale e nessuna tecnica studiata', () => {
    expect(service.currentGradeId()).toBeNull();
    expect(service.studiedTechniqueIds()).toEqual([]);
  });

  it('setCurrentGrade imposta e persiste la cintura attuale', async () => {
    await service.setCurrentGrade('kyu-4');
    expect(service.currentGradeId()).toBe('kyu-4');
    expect(await storage.get('belt-current-grade')).toBe('kyu-4');
  });

  it('toggleStudied aggiunge e rimuove, persistendo', async () => {
    await service.toggleStudied('osoto-gari');
    expect(service.isStudied('osoto-gari')).toBeTrue();
    expect(await storage.get('belt-studied-techniques')).toBe(JSON.stringify(['osoto-gari']));
    await service.toggleStudied('osoto-gari');
    expect(service.isStudied('osoto-gari')).toBeFalse();
  });

  it('load ripristina cintura attuale e tecniche studiate dallo storage', async () => {
    await storage.set('belt-current-grade', 'kyu-3');
    await storage.set('belt-studied-techniques', JSON.stringify(['seoi-nage']));
    await service.load();
    expect(service.currentGradeId()).toBe('kyu-3');
    expect(service.isStudied('seoi-nage')).toBeTrue();
  });

  it('statusFor: earned per order minore, current per order uguale, upcoming per order maggiore', async () => {
    await service.setCurrentGrade('kyu-4'); // order 3
    const earned: BeltGrade = { ...kyu4, id: 'kyu-5', order: 2 };
    const current: BeltGrade = { ...kyu4, id: 'kyu-4', order: 3 };
    const upcoming: BeltGrade = { ...kyu4, id: 'kyu-3', order: 4 };
    expect(service.statusFor(earned)).toBe('earned');
    expect(service.statusFor(current)).toBe('current');
    expect(service.statusFor(upcoming)).toBe('upcoming');
  });

  it('statusFor: tutti upcoming se nessuna cintura attuale è impostata', () => {
    expect(service.statusFor(kyu4)).toBe('upcoming');
  });

  it('completionFor: 0% senza tecniche studiate, 50% con metà, 100% con tutte', async () => {
    expect(service.completionFor(kyu4)).toBe(0);
    await service.toggleStudied('a');
    await service.toggleStudied('b');
    expect(service.completionFor(kyu4)).toBe(50);
    await service.toggleStudied('c');
    await service.toggleStudied('d');
    expect(service.completionFor(kyu4)).toBe(100);
  });
});
```

- [ ] **Step 2: Eseguire i test e verificare che falliscano**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL (o errore di compilazione) — `belt-progress.service.ts` non esiste ancora.

- [ ] **Step 3: Implementare `BeltProgressService`**

`statusFor` prende in input anche `allGrades` (l'elenco completo dei 6 gradi): serve per risalire all'`order` della cintura attuale a partire dal solo `currentGradeId` salvato, e confrontarlo con l'`order` del grado passato.

`src/app/core/services/belt-progress.service.ts`:

```ts
import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { BeltGrade } from '../models/belt-grade.model';

const CURRENT_GRADE_KEY = 'belt-current-grade';
const STUDIED_KEY = 'belt-studied-techniques';

@Injectable({ providedIn: 'root' })
export class BeltProgressService {
  private storage = inject(StorageService);
  private grade = signal<string | null>(null);
  private studied = signal<string[]>([]);

  readonly currentGradeId = this.grade.asReadonly();
  readonly studiedTechniqueIds = this.studied.asReadonly();

  async load(): Promise<void> {
    const grade = await this.storage.get(CURRENT_GRADE_KEY);
    this.grade.set(grade);
    const studiedRaw = await this.storage.get(STUDIED_KEY);
    this.studied.set(studiedRaw ? JSON.parse(studiedRaw) : []);
  }

  async setCurrentGrade(id: string): Promise<void> {
    this.grade.set(id);
    await this.storage.set(CURRENT_GRADE_KEY, id);
  }

  async toggleStudied(techniqueId: string): Promise<void> {
    const cur = this.studied();
    const next = cur.includes(techniqueId) ? cur.filter(x => x !== techniqueId) : [...cur, techniqueId];
    this.studied.set(next);
    await this.storage.set(STUDIED_KEY, JSON.stringify(next));
  }

  isStudied(techniqueId: string): boolean {
    return this.studied().includes(techniqueId);
  }

  statusFor(grade: BeltGrade, allGrades: BeltGrade[]): 'earned' | 'current' | 'upcoming' {
    const currentId = this.grade();
    if (!currentId) return 'upcoming';
    if (grade.id === currentId) return 'current';
    const currentGrade = allGrades.find(g => g.id === currentId);
    if (!currentGrade) return 'upcoming';
    return grade.order < currentGrade.order ? 'earned' : 'upcoming';
  }

  completionFor(grade: BeltGrade): number {
    const ids = grade.sections.flatMap(s => s.techniqueIds ?? []);
    if (ids.length === 0) return 0;
    const done = ids.filter(id => this.isStudied(id)).length;
    return Math.round((done / ids.length) * 100);
  }
}
```

Aggiornare di conseguenza il test dello Step 1: le chiamate `service.statusFor(earned)` diventano `service.statusFor(earned, [earned, current, upcoming])` (e così per `current`/`upcoming`), e `service.statusFor(kyu4)` diventa `service.statusFor(kyu4, [kyu4])`.

- [ ] **Step 4: Eseguire i test e verificare che passino**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS su tutti i test di `BeltProgressService`.

- [ ] **Step 5: Commit**

```bash
git add src/app/core/services/belt-progress.service.ts src/app/core/services/belt-progress.service.spec.ts
git commit -m "feat: BeltProgressService (cintura attuale, tecniche studiate, stato derivato)"
```

---

## Task 9: `belt-grade-list.page.ts`

**Files:**
- Create: `src/app/features/cinture/belt-grade-list.page.ts`
- Create: `src/app/features/cinture/belt-grade-list.page.spec.ts`

**Interfaces:**
- Consumes: `ContentService.getBeltGrades()`, `BeltProgressService.{currentGradeId, statusFor, completionFor, setCurrentGrade}`, `ActionSheetController` da `@ionic/angular/standalone`.
- Produces: componente standalone `BeltGradeListPage`, instradato su `tabs/cinture` in Task 11.

- [ ] **Step 1: Scrivere il test fallito**

`src/app/features/cinture/belt-grade-list.page.spec.ts`:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BeltGradeListPage } from './belt-grade-list.page';
import { BeltProgressService } from '../../core/services/belt-progress.service';
import { StorageService } from '../../core/services/storage.service';

class FakeStorage {
  store = new Map<string, string>();
  async get(key: string) { return this.store.get(key) ?? null; }
  async set(key: string, value: string) { this.store.set(key, value); }
}

const SIX_GRADES = [
  { id: 'kyu-6', order: 1, gradeLabel: '6° Kyu', beltColor: 'bianca', disclaimer: 'd', sections: [], sources: [] },
  { id: 'kyu-5', order: 2, gradeLabel: '5° Kyu', beltColor: 'gialla', disclaimer: 'd', sections: [], sources: [] },
  { id: 'kyu-4', order: 3, gradeLabel: '4° Kyu', beltColor: 'arancione', disclaimer: 'd', sections: [], sources: [] },
  { id: 'kyu-3', order: 4, gradeLabel: '3° Kyu', beltColor: 'verde', disclaimer: 'd', sections: [], sources: [] },
  { id: 'kyu-2', order: 5, gradeLabel: '2° Kyu', beltColor: 'blu', disclaimer: 'd', sources: [], sections: [] },
  { id: 'kyu-1', order: 6, gradeLabel: '1° Kyu', beltColor: 'marrone', disclaimer: 'd', sections: [], sources: [] }
];

describe('BeltGradeListPage', () => {
  let fixture: ComponentFixture<BeltGradeListPage>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BeltGradeListPage],
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        { provide: StorageService, useValue: new FakeStorage() }
      ]
    });
    fixture = TestBed.createComponent(BeltGradeListPage);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());

  it('mostra le 6 righe dei gradi Kyu', () => {
    fixture.detectChanges();
    httpMock.expectOne('assets/data/belt-grades.json').flush(SIX_GRADES);
    fixture.detectChanges();
    expect(fixture.componentInstance.grades().length).toBe(6);
  });

  it('mostra lo stato "current" per la cintura impostata come attuale', async () => {
    const progress = TestBed.inject(BeltProgressService);
    await progress.setCurrentGrade('kyu-4');
    fixture.detectChanges();
    httpMock.expectOne('assets/data/belt-grades.json').flush(SIX_GRADES);
    fixture.detectChanges();
    const kyu4 = fixture.componentInstance.grades().find(g => g.id === 'kyu-4')!;
    expect(fixture.componentInstance.statusFor(kyu4)).toBe('current');
  });
});
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL (o errore di compilazione) — `belt-grade-list.page.ts` non esiste ancora.

- [ ] **Step 3: Implementare la pagina**

`src/app/features/cinture/belt-grade-list.page.ts`:

```ts
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
  IonButtons, IonButton, ActionSheetController
} from '@ionic/angular/standalone';
import { ContentService } from '../../core/services/content.service';
import { BeltProgressService } from '../../core/services/belt-progress.service';
import { BeltGrade } from '../../core/models/belt-grade.model';

@Component({
  selector: 'app-belt-grade-list',
  standalone: true,
  imports: [
    RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
    IonButtons, IonButton
  ],
  template: `
    <ion-header><ion-toolbar>
      <ion-title>Cinture</ion-title>
      <ion-buttons slot="end">
        <ion-button (click)="apriSelezioneCintura()">Imposta la mia cintura</ion-button>
      </ion-buttons>
    </ion-toolbar></ion-header>
    <ion-content>
      <ion-list>
        @for (g of grades(); track g.id) {
          <ion-item [routerLink]="['/tabs/cinture', g.id]" detail>
            <ion-label>
              <h2>{{ g.gradeLabel }}</h2>
              <p class="judo-muted">Cintura {{ g.beltColor }} — {{ statusLabel(statusFor(g)) }}</p>
              @if (statusFor(g) === 'upcoming' && isNextAfterCurrent(g)) {
                <p class="judo-muted">Completamento: {{ progress.completionFor(g) }}%</p>
              }
            </ion-label>
          </ion-item>
        }
      </ion-list>
    </ion-content>
  `
})
export class BeltGradeListPage {
  private content = inject(ContentService);
  protected progress = inject(BeltProgressService);
  private actionSheetCtrl = inject(ActionSheetController);

  grades = toSignal(this.content.getBeltGrades(), { initialValue: [] as BeltGrade[] });

  statusFor(grade: BeltGrade): 'earned' | 'current' | 'upcoming' {
    return this.progress.statusFor(grade, this.grades());
  }

  statusLabel(status: 'earned' | 'current' | 'upcoming'): string {
    return status === 'earned' ? 'Conquistata' : status === 'current' ? 'Attuale' : 'Da fare';
  }

  isNextAfterCurrent(grade: BeltGrade): boolean {
    const currentId = this.progress.currentGradeId();
    if (!currentId) return false;
    const current = this.grades().find(g => g.id === currentId);
    return !!current && grade.order === current.order + 1;
  }

  async apriSelezioneCintura(): Promise<void> {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Imposta la mia cintura attuale',
      buttons: [
        ...this.grades().map(g => ({
          text: `${g.gradeLabel} — ${g.beltColor}`,
          handler: () => this.progress.setCurrentGrade(g.id)
        })),
        { text: 'Annulla', role: 'cancel' }
      ]
    });
    await sheet.present();
  }
}
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS su entrambi i test di `BeltGradeListPage`.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/cinture/belt-grade-list.page.ts src/app/features/cinture/belt-grade-list.page.spec.ts
git commit -m "feat: pagina lista Cinture con stato e selezione cintura attuale"
```

---

## Task 10: `belt-grade-detail.page.ts`

**Files:**
- Create: `src/app/features/cinture/belt-grade-detail.page.ts`
- Create: `src/app/features/cinture/belt-grade-detail.page.spec.ts`

**Interfaces:**
- Consumes: `ContentService.{getBeltGrade, getTechniques}`, `BeltProgressService.{isStudied, toggleStudied}`, `ActivatedRoute`.
- Produces: componente standalone `BeltGradeDetailPage`, instradato su `tabs/cinture/:id` in Task 11.

- [ ] **Step 1: Scrivere il test fallito**

`src/app/features/cinture/belt-grade-detail.page.spec.ts`:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BeltGradeDetailPage } from './belt-grade-detail.page';
import { StorageService } from '../../core/services/storage.service';

class FakeStorage {
  store = new Map<string, string>();
  async get(key: string) { return this.store.get(key) ?? null; }
  async set(key: string, value: string) { this.store.set(key, value); }
}

const GRADE = {
  id: 'kyu-3', order: 4, gradeLabel: '3° Kyu', beltColor: 'verde',
  disclaimer: 'Programma consigliato, non ufficiale.',
  sections: [
    { id: 'gokyo-3', title: 'Gokyo — 3° gruppo', techniqueIds: ['tomoe-nage'] },
    { id: 'shime-waza', title: 'Shime-waza', techniqueIds: ['nami-juji-jime'] },
    { id: 'competenze-dinamiche', title: 'Competenze dinamiche', items: ['Individuazione del Tokui-waza'] }
  ],
  sources: [{ title: 'Regolamento Organico Federale', url: 'https://example.com' }]
};

const TECHNIQUES = [
  { id: 'tomoe-nage', nomeGiapponese: 'Tomoe-nage', nomeItaliano: 'Proiezione circolare', categoria: 'nage-waza', cintura: 'verde', descrizione: '', passaggi: [], media: [], tags: [] },
  { id: 'nami-juji-jime', nomeGiapponese: 'Nami-juji-jime', nomeItaliano: 'Strangolamento a croce normale', categoria: 'katame-waza', cintura: 'verde', descrizione: '', passaggi: [], media: [], tags: [] }
];

describe('BeltGradeDetailPage', () => {
  let fixture: ComponentFixture<BeltGradeDetailPage>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BeltGradeDetailPage],
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        { provide: StorageService, useValue: new FakeStorage() },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'kyu-3' }) } } }
      ]
    });
    fixture = TestBed.createComponent(BeltGradeDetailPage);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());

  it('risolve le tecniche vere delle sezioni con techniqueIds', () => {
    fixture.detectChanges();
    httpMock.expectOne('assets/data/belt-grades.json').flush([GRADE]);
    httpMock.expectOne('assets/data/techniques.json').flush(TECHNIQUES);
    fixture.detectChanges();
    const gokyoSection = fixture.componentInstance.resolvedSections().find(s => s.id === 'gokyo-3')!;
    expect(gokyoSection.techniques[0].nomeGiapponese).toBe('Tomoe-nage');
  });

  it('mostra il banner di sicurezza per Shime-waza', () => {
    fixture.detectChanges();
    httpMock.expectOne('assets/data/belt-grades.json').flush([GRADE]);
    httpMock.expectOne('assets/data/techniques.json').flush(TECHNIQUES);
    fixture.detectChanges();
    const shimeSection = fixture.componentInstance.resolvedSections().find(s => s.id === 'shime-waza')!;
    expect(fixture.componentInstance.isSicurezzaSection(shimeSection.title)).toBeTrue();
  });

  it('le sezioni con items mostrano il testo semplice', () => {
    fixture.detectChanges();
    httpMock.expectOne('assets/data/belt-grades.json').flush([GRADE]);
    httpMock.expectOne('assets/data/techniques.json').flush(TECHNIQUES);
    fixture.detectChanges();
    const competenze = fixture.componentInstance.resolvedSections().find(s => s.id === 'competenze-dinamiche')!;
    expect(competenze.items).toEqual(['Individuazione del Tokui-waza']);
  });
});
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL (o errore di compilazione) — `belt-grade-detail.page.ts` non esiste ancora.

- [ ] **Step 3: Implementare la pagina**

`src/app/features/cinture/belt-grade-detail.page.ts`:

```ts
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonIcon
} from '@ionic/angular/standalone';
import { ContentService } from '../../core/services/content.service';
import { BeltProgressService } from '../../core/services/belt-progress.service';
import { Technique } from '../../core/models/technique.model';
import { signal } from '@angular/core';

const SEZIONI_SICUREZZA = ['Shime-waza', 'Kansetsu-waza'];

interface ResolvedSection {
  id: string;
  title: string;
  techniques: Technique[];
  items?: string[];
}

@Component({
  selector: 'app-belt-grade-detail',
  standalone: true,
  imports: [
    RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonIcon
  ],
  template: `
    <ion-header><ion-toolbar>
      <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/cinture"></ion-back-button></ion-buttons>
      <ion-title>{{ grade()?.gradeLabel }}</ion-title>
    </ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      @if (grade(); as g) {
        <ion-segment [value]="tab()" (ionChange)="setTab($any($event).detail.value)">
          <ion-segment-button value="panoramica"><ion-label>Panoramica</ion-label></ion-segment-button>
          <ion-segment-button value="tecniche"><ion-label>Tecniche</ion-label></ion-segment-button>
          <ion-segment-button value="fonti"><ion-label>Fonti</ion-label></ion-segment-button>
        </ion-segment>

        @if (tab() === 'panoramica') {
          <h1>{{ g.gradeLabel }} — Cintura {{ g.beltColor }}</h1>
          <p class="disclaimer">{{ g.disclaimer }}</p>
        }

        @if (tab() === 'tecniche') {
          @for (s of resolvedSections(); track s.id) {
            <h3>{{ s.title }}</h3>
            @if (isSicurezzaSection(s.title)) {
              <p class="sicurezza">⚠️ Da insegnare ed eseguire solo sotto la supervisione di un tecnico qualificato.</p>
            }
            @if (s.techniques.length > 0) {
              <ion-list>
                @for (t of s.techniques; track t.id) {
                  <ion-item [routerLink]="['/tabs/tecniche', t.id]" detail>
                    <ion-label>{{ t.nomeGiapponese }}</ion-label>
                    <ion-icon slot="end" [name]="progress.isStudied(t.id) ? 'checkmark-circle' : 'checkmark-circle-outline'"
                      (click)="toggleStudiata($event, t.id)"></ion-icon>
                  </ion-item>
                }
              </ion-list>
            }
            @if (s.items) {
              <ul>@for (i of s.items; track i) { <li>{{ i }}</li> }</ul>
            }
          }
        }

        @if (tab() === 'fonti') {
          <ul>@for (src of g.sources; track src.url) { <li><a [href]="src.url" target="_blank">{{ src.title }}</a></li> }</ul>
        }
      } @else {
        <p class="judo-muted">Grado non trovato.</p>
      }
    </ion-content>
  `,
  styles: [`
    h1{ margin:16px 0 2px; }
    h3{ margin-top:20px; color: var(--judo-purple); }
    .disclaimer{ color: var(--judo-muted); font-style: italic; }
    .sicurezza{ color: var(--judo-red); font-weight: 600; }
    ul{ line-height:1.6; }
  `]
})
export class BeltGradeDetailPage {
  private route = inject(ActivatedRoute);
  private content = inject(ContentService);
  protected progress = inject(BeltProgressService);
  private id = this.route.snapshot.paramMap.get('id') ?? '';

  private allTechniques = toSignal(this.content.getTechniques(), { initialValue: [] as Technique[] });
  grade = toSignal(this.content.getBeltGrade(this.id), { initialValue: undefined });

  tab = signal<'panoramica' | 'tecniche' | 'fonti'>('panoramica');
  setTab(t: 'panoramica' | 'tecniche' | 'fonti') { this.tab.set(t); }

  resolvedSections = computed<ResolvedSection[]>(() => {
    const g = this.grade();
    if (!g) return [];
    const techniquesById = new Map(this.allTechniques().map(t => [t.id, t]));
    return g.sections.map(s => ({
      id: s.id,
      title: s.title,
      techniques: (s.techniqueIds ?? []).map(id => techniquesById.get(id)).filter((t): t is Technique => !!t),
      items: s.items
    }));
  });

  isSicurezzaSection(title: string): boolean {
    return SEZIONI_SICUREZZA.includes(title);
  }

  toggleStudiata(event: Event, techniqueId: string): void {
    event.stopPropagation();
    event.preventDefault();
    this.progress.toggleStudied(techniqueId);
  }
}
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS su tutti e 3 i test di `BeltGradeDetailPage`.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/cinture/belt-grade-detail.page.ts src/app/features/cinture/belt-grade-detail.page.spec.ts
git commit -m "feat: pagina dettaglio Cintura con tab Panoramica/Tecniche/Fonti e avviso sicurezza"
```

---

## Task 11: Instradare la tab "Cinture"

**Files:**
- Modify: `src/app/tabs/tabs.routes.ts`
- Modify: `src/app/tabs/tabs.page.html`
- Modify: `src/app/tabs/tabs.page.spec.ts`

**Interfaces:**
- Consumes: `BeltGradeListPage` (Task 9), `BeltGradeDetailPage` (Task 10).
- Produces: route `/tabs/cinture` e `/tabs/cinture/:id` navigabili, 4° pulsante nella tab bar.

- [ ] **Step 1: Leggere il test esistente della tab bar**

`src/app/tabs/tabs.page.spec.ts` verifica probabilmente il numero di `ion-tab-button`. Aprire il file e, se presente un'asserzione sul conteggio dei pulsanti (es. `querySelectorAll('ion-tab-button').length`), aggiornarla da 3 a 4 prima di procedere. Se il file non fa asserzioni sul conteggio, non serve modificarlo.

- [ ] **Step 2: Aggiungere le route**

In `src/app/tabs/tabs.routes.ts`, aggiungere due voci nell'array `children`, prima della voce `{ path: '', redirectTo: ... }`:

```ts
      {
        path: 'cinture',
        loadComponent: () =>
          import('../features/cinture/belt-grade-list.page').then((m) => m.BeltGradeListPage),
      },
      {
        path: 'cinture/:id',
        loadComponent: () =>
          import('../features/cinture/belt-grade-detail.page').then((m) => m.BeltGradeDetailPage),
      },
```

- [ ] **Step 3: Aggiungere il 4° pulsante nella tab bar**

In `src/app/tabs/tabs.page.html`, aggiungere prima della chiusura `</ion-tab-bar>`:

```html
    <ion-tab-button tab="cinture" href="/tabs/cinture">
      <ion-icon aria-hidden="true" name="ribbon-outline"></ion-icon>
      <ion-label>Cinture</ion-label>
    </ion-tab-button>
```

- [ ] **Step 4: Eseguire i test**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS su tutti i test.

- [ ] **Step 5: Build e verifica manuale nel browser**

Run: `npx ng build && npx ng serve`

Aprire `http://localhost:4200/tabs/cinture`, verificare che compaiano 6 righe (bianca→marrone), che "Imposta la mia cintura" apra l'action sheet, che selezionando una cintura lo stato delle righe cambi, e che tappando una riga si apra il dettaglio con le 3 tab. Fermare il server (`Ctrl+C`) al termine.

- [ ] **Step 6: Commit**

```bash
git add src/app/tabs/tabs.routes.ts src/app/tabs/tabs.page.html src/app/tabs/tabs.page.spec.ts
git commit -m "feat: aggiungi 4ª tab Cinture con route lista e dettaglio"
```

---

## Task 12: Toggle "tecnica studiata" nella scheda tecnica

**Files:**
- Modify: `src/app/features/tecniche/tecnica-detail.page.ts`
- Modify: `src/app/features/tecniche/tecnica-detail.page.spec.ts`

**Interfaces:**
- Consumes: `BeltProgressService.{isStudied, toggleStudied}` (Task 8).
- Produces: nessuna nuova interfaccia esposta — chiude il ciclo permettendo di marcare una tecnica come studiata anche dalla sua scheda di dettaglio, non solo dalla pagina del grado.

- [ ] **Step 1: Leggere il test esistente**

Aprire `src/app/features/tecniche/tecnica-detail.page.spec.ts` per capire come viene istanziato il componente (provider di `ActivatedRoute`, `ContentService`/`HttpTestingController`, `FavoritesService`/`StorageService`) e riusare lo stesso setup.

- [ ] **Step 2: Scrivere il test fallito per il toggle "studiata"**

Aggiungere al file di test (adattando i provider già presenti per includere `StorageService`, necessario anche da `BeltProgressService`):

```ts
  it('toggleStudiata inverte lo stato studiata della tecnica', () => {
    expect(fixture.componentInstance.isStudiata()).toBeFalse();
    fixture.componentInstance.toggleStudiata();
    expect(fixture.componentInstance.isStudiata()).toBeTrue();
  });
```

- [ ] **Step 3: Eseguire i test e verificare che il nuovo test fallisca**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — `toggleStudiata`/`isStudiata` non esistono ancora su `TecnicaDetailPage`.

- [ ] **Step 4: Aggiungere il secondo pulsante e la logica**

Modificare `src/app/features/tecniche/tecnica-detail.page.ts`:

```ts
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon
} from '@ionic/angular/standalone';
import { ContentService } from '../../core/services/content.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { BeltProgressService } from '../../core/services/belt-progress.service';
import { MediaComponent } from '../../shared/media/media.component';
import { CategoryChipComponent } from '../../shared/category-chip/category-chip.component';
import { BeltBadgeComponent } from '../../shared/belt-badge/belt-badge.component';

@Component({
  selector: 'app-tecnica-detail',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonButton, IonIcon, MediaComponent, CategoryChipComponent, BeltBadgeComponent
  ],
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
        <app-media [item]="t.media[0]"></app-media>
        <h1>{{ t.nomeGiapponese }}</h1>
        <p class="judo-muted">{{ t.nomeItaliano }}</p>
        <div class="badges">
          <app-category-chip [categoria]="t.categoria"></app-category-chip>
          <app-belt-badge [cintura]="t.cintura"></app-belt-badge>
        </div>
        <p>{{ t.descrizione }}</p>
        <ol>@for (p of t.passaggi; track p) { <li>{{ p }}</li> }</ol>
      } @else {
        <p class="judo-muted">Tecnica non trovata.</p>
      }
    </ion-content>
  `,
  styles: [`
    h1{ margin:16px 0 2px; }
    .badges{ display:flex; gap:8px; margin:12px 0; }
    ol{ padding-left:20px; line-height:1.6; }
  `]
})
export class TecnicaDetailPage {
  private route = inject(ActivatedRoute);
  private content = inject(ContentService);
  private favorites = inject(FavoritesService);
  private progress = inject(BeltProgressService);
  private id = this.route.snapshot.paramMap.get('id') ?? '';

  tecnica = toSignal(this.content.getTechnique(this.id), { initialValue: undefined });
  isFav = signal(this.favorites.isFavorite(this.id));
  isStudiata = signal(this.progress.isStudied(this.id));

  toggleFav() {
    this.favorites.toggle(this.id);
    this.isFav.set(this.favorites.isFavorite(this.id));
  }

  toggleStudiata() {
    this.progress.toggleStudied(this.id);
    this.isStudiata.set(this.progress.isStudied(this.id));
  }
}
```

- [ ] **Step 5: Eseguire i test e verificare che passino**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS su tutti i test di `TecnicaDetailPage`, incluso quello nuovo.

- [ ] **Step 6: Commit**

```bash
git add src/app/features/tecniche/tecnica-detail.page.ts src/app/features/tecniche/tecnica-detail.page.spec.ts
git commit -m "feat: toggle tecnica studiata nella scheda di dettaglio"
```

---

## Task 13: Verifica finale e aggiornamento documentazione di stato

**Files:**
- Modify: `docs/superpowers/STATO-E-RIPRESA.md`

**Interfaces:**
- Consumes: nessuna (task di chiusura).
- Produces: nessuna (documentazione).

- [ ] **Step 1: Eseguire l'intera suite di verifica**

Run: `npx ng test -- --watch=false --browsers=ChromeHeadless && npx ng lint && npx ng build`
Expected: tutti e 3 i comandi terminano con 0 errori. Il conteggio totale dei test deve essere quello precedente (32) più tutti quelli aggiunti nei Task 1–12.

- [ ] **Step 2: Verifica manuale end-to-end nel browser**

Run: `npx ng serve`

Percorso da verificare:
1. Aprire `/tabs/cinture` → 6 righe, tutte "Da fare".
2. "Imposta la mia cintura" → scegliere "4° Kyu — arancione" → verificare che 6°/5° Kyu diventino "Conquistata", 4° Kyu "Attuale", 3° Kyu mostri "Completamento: 0%".
3. Aprire il dettaglio di "3° Kyu" → tab Tecniche → verificare sezione "Shime-waza" con banner di sicurezza e tecniche reali cliccabili verso `/tabs/tecniche/:id`.
4. Toccare l'icona di spunta su una tecnica dentro la pagina del grado → tornare alla lista Cinture → verificare che la percentuale sia salita.
5. Aprire `/tabs/tecniche/tomoe-nage` (dettaglio tecnica) → verificare che la cintura mostrata sia ora "verde" (non più "blu") e che il pulsante "tecnica studiata" rifletta lo stato impostato al punto 4 se applicabile.

Fermare il server al termine.

- [ ] **Step 3: Aggiornare `docs/superpowers/STATO-E-RIPRESA.md`**

Aggiungere una nuova riga alla tabella "Fatto" e aggiornare la riga "Contenuti seed":

```markdown
| 12 | Correzione cinture (15 tecniche) + 37 nuove tecniche (Gokyo completo) + tab Cinture Kyu (lista, dettaglio, BeltProgressService, toggle studiata) | vedi `2026-07-14-cinture-kyu-design.md` |
```

Sostituire la riga:

```
**Contenuti seed:** 24 tecniche (nage-waza + katame-waza, cinture gialla→marrone), 5 kata
```

con:

```
**Contenuti seed:** 61 tecniche (nage-waza + katame-waza, cinture gialla→marrone, Gokyo completo), 5 kata,
6 gradi Kyu (bianca→marrone) con programma consigliato in `belt-grades.json`.
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/STATO-E-RIPRESA.md
git commit -m "docs: aggiorna stato progetto con tab Cinture Kyu e Gokyo completo"
```

---

## Self-review

**Copertura spec:** ogni sezione del design doc (§1 modello, §2 contenuto 6 gradi, §3 correzioni + 37 nuove tecniche, §4 tracking progresso, §5 UI lista/dettaglio/toggle) ha un task dedicato (Task 7, 7, 1–6, 8, 9–10 e 12). §6 file coinvolti coincide con i file creati/modificati nei task. §7 test è coperto da `data-integrity.spec.ts` esteso, `belt-progress.service.spec.ts`, `belt-grade-list.page.spec.ts`, `belt-grade-detail.page.spec.ts`. §8 criteri di accettazione: tutti verificabili a fine Task 13 (verifica manuale end-to-end).

**Placeholder:** nessuno rimasto.

**Coerenza tipi:** `BeltGrade`/`BeltGradeSection` (Task 7) → usati identici in `BeltProgressService` (Task 8), `BeltGradeListPage` (Task 9) e `BeltGradeDetailPage` (Task 10). `statusFor(grade, allGrades)` e `completionFor(grade)` hanno la stessa firma ovunque vengano chiamati. Tutti i 37 nuovi `techniqueId` usati in `belt-grades.json` (Task 7) corrispondono esattamente agli `id` creati nei Task 2–6 (verificato manualmente riga per riga durante la stesura).
