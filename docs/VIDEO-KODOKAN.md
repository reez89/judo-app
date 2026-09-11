# Video Kodokan

Fonte: https://www.youtube.com/playlist?list=PLtz539PTepc16H2iu5F3Q3D7_He1EYlIQ

Lo script scarica **tutta la playlist** in `.video-cache/480p/` e copia in
`src/assets/media/kodokan/` solo i video delle tecniche presenti nell'app.
Le immagini esistenti restano disponibili. Il pulsante Video riproduce l'MP4
locale; il collegamento alla fonte apre YouTube. Gli asset locali sono inclusi
nella build Ionic/Capacitor e non richiedono connessione per la riproduzione.

## Preparazione e utilizzo

Servono Python 3, Node.js, yt-dlp e ffmpeg nel PATH. Su macOS, con Homebrew:

```sh
brew install yt-dlp ffmpeg
npm run videos:sync
npm run build
npx cap sync
```

Per aggiornare soltanto i collegamenti, senza scaricare i video:

```sh
npm run videos:links
```

Opzioni dello script:

```sh
python3 scripts/sync_kodokan_videos.py --height 720 --workers 2
python3 scripts/sync_kodokan_videos.py --metadata scripts/kodokan-playlist.json
python3 scripts/sync_kodokan_videos.py --yt-dlp /percorso/yt-dlp --ffmpeg /percorso/ffmpeg --node /percorso/node
npm run videos:test
```

La risoluzione predefinita è 480p, con video H.264 e audio AAC in MP4.
I download interrotti sono riprendibili; quelli completati vengono riutilizzati.
Il codice di uscita è 1 se qualche download fallisce: i video associabili restano
accessibili tramite YouTube e una nuova esecuzione ritenta i download mancanti.
Non vengono usati cookie del browser o credenziali.

## Associazione e verifiche

`scripts/kodokan-playlist.json` conserva ID, titoli originali (kanji e romaji)
e URL. `docs/kodokan-video-report.json` elenca corrispondenze, video mancanti,
ambiguità ed eventuali errori di download.

Si confrontano nomi completi normalizzati, ignorando trattini, spazi e macron.
Le equivalenze barai/harai e le forme abbreviate di Ude-hishigi sono esplicite
in `ALIASES`. I filmati “Escapes”, le controtecniche e le raccolte non vengono
associati mediante somiglianze parziali.

Morote-seoi-nage, Eri-seoi-nage e Makura-kesa-gatame non hanno una voce dedicata
nella playlist verificata: non viene assegnato un filmato generico al loro posto.

I file MP4 e la cache sono esclusi da Git. Su un nuovo checkout eseguire
`npm run videos:sync` prima della build offline; in alternativa `npm run
videos:links` prepara una versione con collegamenti online. Conservare la cache
per evitare di riscaricare la playlist. yt-dlp verificato durante l'integrazione:
2026.08.19.
