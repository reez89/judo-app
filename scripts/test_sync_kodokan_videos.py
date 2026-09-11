import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import sync_kodokan_videos as sync


class MatchingTests(unittest.TestCase):
    def technique(self, name):
        return {'id': name, 'nomeGiapponese': name, 'media': []}

    def test_hyphens_and_macrons(self):
        self.assertEqual(sync.normalize('Ō-soto-gari'), sync.normalize('osoto-gari'))

    def test_aliases_and_japanese(self):
        entries = [{'id': 'one', 'title': '出足払 / De-ashi-harai'}]
        self.assertEqual(len(sync.match_technique(self.technique('de-ashi-barai'), entries)), 1)
        self.assertEqual(len(sync.match_technique(self.technique('出足払'), entries)), 1)

    def test_no_escape_or_counter_match(self):
        entries = [{'title': 'Kesa-gatame Escapes'}, {'title': 'O-soto-gaeshi'}]
        self.assertEqual(sync.match_technique(self.technique('kesa-gatame'), entries), [])
        self.assertEqual(sync.match_technique(self.technique('osoto-gari'), entries), [])

    def test_variants_are_not_assigned_generic_video(self):
        entries = [{'title': '背負投 / Seoi-nage'}, {'title': '袈裟固 / Kesa-gatame'}]
        for name in ['morote-seoi-nage', 'eri-seoi-nage', 'makura-kesa-gatame']:
            self.assertEqual(sync.match_technique(self.technique(name), entries), [])

    def test_duplicates_remain_ambiguous(self):
        self.assertEqual(len(sync.match_technique(self.technique('seoi-nage'), [{'title': 'Seoi-nage'}, {'title': '背負投 / Seoi-nage'}])), 2)

    def test_links_mode_is_idempotent_and_preserves_other_media(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            data = root / 'src/assets/data/techniques.json'
            photo = {'tipo': 'foto', 'src': 'existing.png'}
            technique = self.technique('osoto-gari')
            technique['media'] = [photo]
            sync.write_json(data, [technique, self.technique('makura-kesa-gatame')])
            metadata = root / 'metadata.json'
            sync.write_json(metadata, {'entries': [{'id': 'c-A_nP7mKAc', 'title': '大外刈 / O-soto-gari'}]})
            with patch.object(sync, 'ROOT', root), patch('sys.argv', ['sync', '--links-only', '--metadata', str(metadata)]):
                sync.main()
                first = data.read_text()
                sync.main()
                self.assertEqual(first, data.read_text())
            result = json.loads(first)
            self.assertEqual(result[0]['media'][0], photo)
            self.assertEqual(result[0]['media'][1]['tipo'], 'youtube')
            self.assertEqual(result[1]['media'], [])


if __name__ == '__main__':
    unittest.main()
