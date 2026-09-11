#!/usr/bin/env python3
"""Download the Kodokan playlist and associate only exact technique names/aliases."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import threading
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
PLAYLIST = 'https://www.youtube.com/playlist?list=PLtz539PTepc16H2iu5F3Q3D7_He1EYlIQ'
ALIASES = {
    'de-ashi-barai': 'De-ashi-harai',
    'okuri-ashi-barai': 'Okuri-ashi-harai',
    'juji-gatame': 'Ude-hishigi-juji-gatame',
    'ude-gatame': 'Ude-hishigi-ude-gatame',
    'waki-gatame': 'Ude-hishigi-waki-gatame',
}


def normalize(name):
    name = unicodedata.normalize('NFKD', name).casefold()
    return ''.join(c for c in name if c.isalnum() and not unicodedata.combining(c))


def match_technique(technique, entries):
    names = {normalize(technique['id']), normalize(technique['nomeGiapponese'])}
    if technique['id'] in ALIASES:
        names.add(normalize(ALIASES[technique['id']]))
    # Compare whole title segments, never substrings: "Escapes" and gaeshi differ.
    return [e for e in entries if names & {normalize(n.strip()) for n in e['title'].split('/')}]


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--links-only', action='store_true', help='Associate YouTube links without downloading')
    parser.add_argument('--cached-only', action='store_true', help='Use verified cached downloads, without network requests (requires --metadata)')
    parser.add_argument('--metadata', type=Path, help='Use an existing yt-dlp flat playlist JSON')
    parser.add_argument('--height', type=int, default=480, choices=[360, 480, 720, 1080])
    parser.add_argument('--workers', type=int, default=1, choices=[1, 2, 3])
    parser.add_argument('--yt-dlp', default='yt-dlp')
    parser.add_argument('--ffmpeg', default='ffmpeg')
    parser.add_argument('--node', default='node')
    args = parser.parse_args()
    if args.cached_only and not args.metadata:
        parser.error('--cached-only requires --metadata')
    cache = ROOT / '.video-cache'
    cache.mkdir(exist_ok=True)
    if args.metadata:
        playlist = json.loads(args.metadata.read_text())
    else:
        result = subprocess.run([args.yt_dlp, '--flat-playlist', '--dump-single-json', PLAYLIST], check=True, capture_output=True, text=True)
        playlist = json.loads(result.stdout)
    entries = []
    seen = set()
    for e in playlist.get('entries', []):
        if e and re.fullmatch(r'[A-Za-z0-9_-]{11}', e.get('id', '')) and e['id'] not in seen:
            entries.append({'id': e['id'], 'title': e.get('title') or '', 'url': 'https://www.youtube.com/watch?v=' + e['id']})
            seen.add(e['id'])
    if not entries:
        raise SystemExit('Playlist empty; no data changed.')
    write_json(ROOT / 'scripts/kodokan-playlist.json', {'playlist': PLAYLIST, 'title': playlist.get('title'), 'entries': entries})
    data_path = ROOT / 'src/assets/data/techniques.json'
    techniques = json.loads(data_path.read_text())
    matches = {t['id']: match_technique(t, entries) for t in techniques}
    downloads = {}
    if not args.links_only:
        ffmpeg = shutil.which(args.ffmpeg)
        if not ffmpeg:
            raise SystemExit('ffmpeg missing. Install it or run --links-only.')
        archive = cache / f'{args.height}p'
        archive.mkdir(exist_ok=True)
        blocked = threading.Event()

        def download(entry):
            video = archive / (entry['id'] + '.mp4')
            marker = video.with_suffix('.ok')
            if video.exists() and marker.exists() and video.stat().st_size == int(marker.read_text()):
                return entry['id'], str(video), None
            if args.cached_only or blocked.is_set():
                return entry['id'], None, 'Not cached; download paused or cached-only mode'
            command = [args.yt_dlp, '--no-playlist', '--no-progress', '--newline',
                       '--js-runtimes', 'node:' + (shutil.which(args.node) or args.node),
                       '--ffmpeg-location', str(Path(ffmpeg).parent),
                       '--retries', '3', '--fragment-retries', '3', '--abort-on-unavailable-fragments',
                       '--socket-timeout', '30', '--merge-output-format', 'mp4',
                       '--sleep-requests', '1', '--sleep-interval', '3', '--max-sleep-interval', '6',
                       '-f', f'bv[vcodec^=avc1][height<={args.height}]+ba[ext=m4a]/b[ext=mp4][height<={args.height}]',
                       '-o', str(archive / '%(id)s.%(ext)s'), entry['url']]
            log = archive / (entry['id'] + '.log')
            with log.open('w') as stream:
                result = subprocess.run(command, stdout=stream, stderr=subprocess.STDOUT)
            log_text = log.read_text(errors='replace')
            if any(message in log_text for message in ['HTTP Error 429', 'Sign in to confirm', 'not a bot']):
                blocked.set()
            error = None
            if result.returncode or not video.exists():
                error = 'Download failed; see ' + str(log.relative_to(ROOT))
            else:
                check = subprocess.run([ffmpeg, '-v', 'error', '-xerror', '-i', str(video), '-t', '1', '-f', 'null', '-'], capture_output=True)
                if check.returncode:
                    error = 'Invalid MP4: ' + check.stderr.decode(errors='replace')[-300:]
                else:
                    marker.write_text(str(video.stat().st_size))
            print(('ERROR ' if error else 'OK ') + entry['title'], flush=True)
            return entry['id'], str(video) if not error else None, error

        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            for video_id, path, error in pool.map(download, entries):
                downloads[video_id] = {'path': path, 'error': error}
    report = {'playlist': PLAYLIST, 'playlistVideos': len(entries), 'techniques': [], 'downloadErrors': []}
    asset_dir = ROOT / 'src/assets/media/kodokan'
    asset_dir.mkdir(parents=True, exist_ok=True)
    for technique in techniques:
        candidates = matches[technique['id']]
        row = {'technique': technique['id'], 'status': 'missing' if not candidates else 'ambiguous'}
        if len(candidates) == 1:
            entry = candidates[0]
            row.update(videoId=entry['id'], title=entry['title'], url=entry['url'])
            local = asset_dir / (entry['id'] + '.mp4')
            downloaded = downloads.get(entry['id'], {}).get('path')
            if downloaded:
                shutil.copy2(downloaded, local)
            # Link-only mode preserves a previously downloaded, working local asset.
            offline = bool(downloaded) or (args.links_only and local.is_file() and local.stat().st_size > 0)
            row['status'] = 'local' if offline else 'youtube'
            media = {'tipo': 'video' if offline else 'youtube',
                     'src': 'assets/media/kodokan/' + local.name if offline else entry['url'],
                     'didascalia': entry['title'], 'sourceUrl': entry['url'], 'provider': 'KODOKAN'}
            technique['media'] = [m for m in technique.get('media', []) if m.get('provider') != 'KODOKAN'] + [media]
            for item in technique['media']:
                if item['tipo'] == 'placeholder' and item.get('didascalia') == 'Video in arrivo':
                    item['didascalia'] = technique['nomeGiapponese']
        if len(candidates) > 1:
            row['candidates'] = candidates
        report['techniques'].append(row)
    report['downloadErrors'] = [{'videoId': key, 'error': value['error']} for key, value in downloads.items() if value['error']]
    report['downloadedVideos'] = sum(bool(v['path']) for v in downloads.values())
    write_json(data_path, techniques)
    write_json(ROOT / 'docs/kodokan-video-report.json', report)
    for status in ['local', 'youtube', 'missing', 'ambiguous']:
        print(f'{status}: {sum(r["status"] == status for r in report["techniques"])}')
    if report['downloadErrors']:
        print(f'{len(report["downloadErrors"])} downloads failed; YouTube links are available. Rerun to retry.', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
