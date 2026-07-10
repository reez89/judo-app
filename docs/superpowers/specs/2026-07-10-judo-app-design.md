# Judo App — Documento di design

**Data:** 2026-07-10
**Autore:** Nicola Rizzi
**Stato:** approvato (design), spec in revisione

---

## 1. Obiettivo

App mobile semplice per la palestra di judo. Aiuta chi si avvicina al judo, chi prepara
un esame di cintura o di kata, o chi vuole ripassare, a **ricordare i nomi delle tecniche**
e studiarne l'esecuzione tramite scheda dedicata (descrizione + media).

Non è un social, non ha account, non ha backend. È un'enciclopedia offline curata,
con la possibilità di segnare i preferiti.

## 2. Ambito (scope)

**Incluso (v1):**
- Sezione **Tecniche**: catalogo sfogliabile con ricerca e filtri.
- Sezione **Kata**: catalogo dei kata con struttura analoga.
- Sezione **Preferiti**: tecniche/kata segnati dall'utente.
- **Scheda dettaglio**: nome giapponese + italiano, media (placeholder), descrizione,
  passaggi, badge categoria e cintura, pulsante preferito.
- Filtri: **ricerca per nome** (giapponese o italiano), **per categoria**, **per cintura**.
- Tutto **offline**, contenuti impacchettati nell'app.

**Escluso da v1 (ma predisposto):**
- **Quiz / flashcard** — non implementati ora, ma il modello dati è progettato per
  alimentarli in futuro senza ristrutturare.
- Gif/video reali — ora **placeholder**; verranno girati in palestra e sostituiti dopo.
- Account, sincronizzazione cloud, contenuti generati dagli utenti.

## 3. Scelte tecniche

| Area | Scelta | Motivo |
|------|--------|--------|
| Framework | **Ionic 8 + Angular** (standalone components) | Riuso competenze Angular esistenti |
| Runtime nativo | **Capacitor** | Build reali per App Store / Play Store, installabili per test |
| Backend | **Nessuno** | Contenuti statici, app semplice |
| Dati contenuti | **File JSON** in `src/assets/data/` | Nessun DB, versionabili con l'app |
| Media | File in `src/assets/media/` | Placeholder ora, sostituibili |
| Preferiti | **Capacitor Preferences** (storage locale) | Persistenza semplice sul dispositivo |
| Stato app | Angular services + signals | Leggero, nessuna libreria di stato extra |

**Distribuzione per test:**
- **Android:** build APK, installazione diretta sul dispositivo (proprio e del maestro).
- **iOS:** via Xcode con Apple ID free (re-firma ogni 7 giorni) oppure TestFlight
  (richiede account sviluppatore Apple, ~99$/anno).

## 4. Modello dati

### Tecnica
```jsonc
{
  "id": "osoto-gari",
  "nomeGiapponese": "Osoto-gari",
  "nomeItaliano": "Grande falciata esterna",
  "categoria": "nage-waza",          // enum: nage-waza | katame-waza | ...
  "cintura": "gialla",               // enum: bianca | gialla | arancione | verde | blu | marrone
  "descrizione": "Testo esteso…",
  "passaggi": ["Squilibrio…", "Falciata…", "Proiezione…"],
  "media": [
    { "tipo": "placeholder", "src": "media/placeholder.svg", "didascalia": "Video in arrivo" }
  ],
  "tags": ["proiezione", "gamba"]
}
```

### Kata
```jsonc
{
  "id": "nage-no-kata",
  "nomeGiapponese": "Nage-no-kata",
  "nomeItaliano": "Forme di proiezione",
  "descrizione": "Testo introduttivo…",
  "serie": [
    { "titolo": "Te-waza", "tecniche": ["uki-otoshi", "seoi-nage", "kata-guruma"] }
  ],
  "media": [ { "tipo": "placeholder", "src": "media/placeholder.svg" } ]
}
```

### `media[]` — layer intercambiabile (punto chiave)
Ogni elemento media è **tipizzato**: `tipo` ∈ `placeholder | gif | video | foto`.
Un unico componente `<app-media>` decide come renderizzarlo. Sostituire i placeholder
con le gif/video reali domani significa solo cambiare il JSON — **zero modifiche al codice**.

### Predisposizione quiz (futuro)
I campi `categoria`, `cintura` e la coppia nome-giapponese/nome-italiano bastano per
generare in futuro modalità come "indovina il nome dalla gif" filtrando per cintura.
Nessun lavoro extra ora: serve solo tenere il modello pulito e ben tipizzato.

## 5. Architettura & componenti

```
src/app/
  core/
    models/            technique.model.ts, kata.model.ts, media.model.ts
    services/
      content.service.ts     carica e cachea i JSON, espone liste/dettaglio
      favorites.service.ts   legge/scrive preferiti (Capacitor Preferences)
  shared/
    media/                   <app-media> rende placeholder/gif/video/foto
    chip/ belt-badge/ search-bar/ filter-bar/   componenti UI riusabili
  features/
    tecniche/    lista + dettaglio tecniche
    kata/        lista + dettaglio kata
    preferiti/   vista preferiti
```

**Principi:** ogni componente ha uno scopo unico; i servizi sono l'unica fonte dati;
la UI non conosce la provenienza dei dati (JSON oggi, altro domani).

## 6. Navigazione & schermate

Tab bar in basso, 3 sezioni:

1. **Tecniche** — lista con barra ricerca + filtri (categoria, cintura) → tap → dettaglio.
2. **Kata** — lista kata + ricerca → tap → dettaglio.
3. **Preferiti** — elenco degli elementi stellati.

**Scheda dettaglio:** media in alto (placeholder), titolo giapponese + italiano,
badge categoria + cintura, descrizione, elenco passaggi, pulsante preferito.

## 7. Design UI — direzione "Ink"

Interfaccia **scura e d'impatto**, sportiva/premium.

**Palette (token):**
| Ruolo | Colore |
|-------|--------|
| Sfondo | `#141319` |
| Superfici (card/campi) | `#20202a` / bordo `#2c2b38` |
| Testo | `#f0eef6` / secondario `#8886a0` |
| Guida app / kata (viola) | `#b98bff` (accento) · `#8a5cd6` |
| Proiezioni — nage-waza (verde) | `#4bd88a` |
| Controlli/leve — katame-waza (rosso) | `#ff6b64` |

**Codifica colore semantica (coerente ovunque):** verde = nage-waza, rosso = katame-waza,
viola = kata e colore guida dell'app. Bianco/chiaro per il testo.

**Elementi:** titoli con kanji 柔道 in viola sfumato; liste con "rail" colorato a sinistra
per categoria; chip categoria/cintura; media placeholder con riquadro scuro e icona.
Font di sistema (serif di sistema per i titoli display, sans di sistema per il corpo);
niente webfont esterni per compatibilità.

Riferimento visivo: mockup approvato (direzione 3 · Ink) delle proposte UI.

## 8. Contenuti iniziali

Testi scritti dall'autore del progetto. Set base di partenza, espanso a mano nel tempo:
- **Tecniche:** un nucleo di proiezioni e controlli delle cinture basse
  (es. Osoto-gari, O-goshi, Seoi-nage, Uchi-mata, Kesa-gatame, Juji-gatame…).
- **Kata:** almeno il Nage-no-kata come primo kata di riferimento.
- Tutti i media partono come **placeholder**.

## 9. Rischi & questioni aperte

- **Gif/video reali:** metodo di creazione da definire col maestro (girare in palestra,
  disponibilità, montaggio). Non blocca la v1 grazie ai placeholder.
- **Copyright media:** i contenuti visivi vanno prodotti internamente, non copiati.
- **iOS test:** installazione per il maestro richiede TestFlight (account dev a pagamento);
  su Android nessun costo.
- **Completezza contenuti:** la ricchezza dell'app cresce col tempo, non è tutta in v1.

## 10. Criteri di successo (v1)

- L'app si installa e gira offline su Android (e iOS via Xcode) del proprietario e del maestro.
- Si possono sfogliare tecniche e kata, cercare per nome, filtrare per categoria e cintura.
- La scheda dettaglio mostra nome, descrizione, passaggi, badge e media placeholder.
- I preferiti si salvano e restano dopo la chiusura dell'app.
- Sostituire un placeholder con una gif reale non richiede modifiche al codice.
