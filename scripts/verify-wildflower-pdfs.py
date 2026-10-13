"""Check actual free/full PDFs, game answers, paper geometry and public boundaries.

CI checks the shipped samples. Owner QA can add --full-dir output/pdf/wildflower
to inspect all four private editions without publishing their files or source.
"""
from pathlib import Path
from collections import Counter
import argparse
import hashlib
import json
import re
import pdfplumber
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'assets/kits/wildflower'
ANIMALS = {'Dog': 'Puppy', 'Cat': 'Kitten', 'Sheep': 'Lamb', 'Goat': 'Kid',
           'Horse': 'Foal', 'Pig': 'Piglet', 'Duck': 'Duckling', 'Goose': 'Gosling',
           'Swan': 'Cygnet', 'Deer': 'Fawn', 'Butterfly': 'Caterpillar', 'Frog': 'Tadpole'}
WORDS = ['DIAPERS', 'BOTTLE', 'BLANKET', 'PACIFIER', 'STROLLER', 'RATTLE',
         'SWADDLE', 'ONESIE', 'TEETHER', 'SLEEPER']
URL = 'https://partyprint.live/?occasion=baby&mode=gifts&games=bingo#studio'

def bingo(page, number):
    text = page.extract_text()
    assert 'GUEST CARD ' + str(number).zfill(2) in text
    assert 'Mark the gifts as they are opened.' in text
    boxes = sorted(page.rects, key=lambda r: (round(r['top'], 1), r['x0']))
    assert len(boxes) == 25, 'Expected exactly 25 complete bingo squares'
    words = []
    for i, box in enumerate(boxes):
        value = page.crop((box['x0']+1, box['top']+1, box['x1']-1, box['bottom']-1)).extract_text()
        value = ' '.join(value.split())
        assert value, 'Empty bingo square'
        if i == 12:
            assert value == 'FREE', 'Missing free center'
        else:
            assert value != 'FREE'
            words.append(value)
        chars = page.crop((box['x0']+1, box['top']+1, box['x1']-1, box['bottom']-1)).chars
        assert all(c['size'] >= 9 and c['x0'] > box['x0']+5 and c['x1'] < box['x1']-5 for c in chars)
    assert len(set(words)) == 24, 'Duplicate gift within a card'
    assert [link['uri'] for link in page.hyperlinks] == [URL]
    return tuple(words)

def animal_answers(activity, key):
    text = activity.extract_text()
    options = dict(re.findall(r'\b([A-L])\. (\w+)', text))
    assert len(options) == 12 and set(options.values()) == set(ANIMALS.values())
    answers = re.findall(r'\b(\d+)\. (\w+) - ([A-L]): (\w+)', key.extract_text())
    assert len(answers) == 12
    for number, animal, letter, baby in answers:
        assert ANIMALS[animal] == baby == options[letter], 'Wrong animal answer'
        assert f'{number}. {animal}' in text
    assert 'Answer key - keep separate' in key.extract_text()

def verify(file, dims, full=False):
    with pdfplumber.open(file) as pdf:
        assert len(pdf.pages) == (37 if full else 3), f'{file}: page count'
        for number, page in enumerate(pdf.pages, 1):
            text = page.extract_text() or ''
            assert len(text) > 75 and 'partyprint.live' in text, f'{file}: blank/retired origin page {number}'
            assert 'pages.dev' not in text
            assert abs(page.width-dims[0]) < .1 and abs(page.height-dims[1]) < .1
            assert all(c['x0'] >= 30 and c['x1'] <= page.width-30 and c['top'] >= 28
                       and c['bottom'] <= page.height-20 for c in page.chars), f'{file}: clipped text page {number}'
            assert all(c['size'] >= 8 for c in page.chars), 'Unreadably small text'
            footer = page.crop((30, page.height-40, page.width-30, page.height-20)).extract_text()
            assert footer.endswith(str(number)), f'{file}: wrong physical page number'
        cards = [bingo(p, i) for i, p in enumerate(pdf.pages[3:27] if full else [pdf.pages[0]], 1)]
        assert len(set(cards)) == len(cards), 'Duplicate guest cards'
        animal_answers(pdf.pages[27 if full else 1], pdf.pages[29 if full else 2])
        if full:
            for i, page in [(0, 'A little wildflower.'), (1, 'A happy host plan'),
                            (2, 'Welcome, little wildflower'), (30, 'Little predictions'),
                            (31, 'A little encouragement'), (32, 'Thank you for the love'),
                            (33, 'A little note. A lot of love.'), (34, 'Baby A to Z'),
                            (35, 'Little bag treasure hunt'), (36, 'This or that')]:
                assert page in pdf.pages[i].extract_text()
            assert 'Pages 4-27' in pdf.pages[1].extract_text()
            assert 'Pages 35-37' in pdf.pages[1].extract_text()
            alphabet = pdf.pages[34].extract_text()
            assert all(re.search(r'\b'+letter+r'\b',alphabet) for letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
            bag = pdf.pages[35].extract_text()
            assert len(pdf.pages[35].rects)==12 and 'No proof needed' in bag and 'No phones, IDs' in bag
            assert pdf.pages[36].extract_text().count('?')==12
            puzzles = dict(re.findall(r'\b(\d+)\. ([A-Z]+)\b', pdf.pages[28].extract_text()))
            answers = dict(re.findall(r'\b(\d+)\. ([A-Z]+)\b', pdf.pages[29].extract_text()))
            assert len(puzzles) == len(answers) == 10
            assert [answers[str(n)] for n in range(1, 11)] == WORDS
            for number, word in puzzles.items():
                assert Counter(word) == Counter(answers[number]) and word != answers[number], 'Invalid scramble'
        else:
            assert all('FREE SAMPLE' in p.extract_text() for p in pdf.pages)
    print(file.name, ': page counts, nonblank pages, bounds, bingo uniqueness and game answers passed')
    return cards

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--full-dir', type=Path)
    args = parser.parse_args()
    samples = {}
    for name, dims in [('Letter', (612, 792)), ('A4', (595.28, 841.89))]:
        samples[name] = verify(ASSETS/f'wildflower-free-sample-{name}.pdf', dims)
        if args.full_dir:
            for edition in ['color', 'ink-friendly']:
                cards = verify(args.full_dir/f'PartyPrint-Wildflower-{name}-{edition}.pdf', dims, True)
                assert cards[0] == samples[name][0], 'Sample differs from real full edition'
    assert samples['Letter'] == samples['A4']
    manifest = json.loads((ASSETS/'provenance.json').read_text())
    for file, sha in {**manifest['sample_sha256'], **manifest['asset_sha256']}.items():
        assert hashlib.sha256((ASSETS/file).read_bytes()).hexdigest() == sha, 'Stale preview provenance'
    for file, dims in [('wildflower-pin.jpg', (1000, 1500)), ('wildflower-social.jpg', (1200, 630)),
                       ('wildflower-spread.jpg', (1200, 900))]:
        with Image.open(ASSETS/file) as im:
            assert im.size == dims
    public_pdfs = sorted(p.name for p in ASSETS.glob('*.pdf'))
    assert public_pdfs == ['wildflower-free-sample-A4.pdf', 'wildflower-free-sample-Letter.pdf']
    dist = ROOT/'dist'
    if dist.exists():
        assert not (dist/'output').exists(), 'Private source/editions leaked into deploy'
        assert not any(p.name.startswith('PartyPrint-Wildflower-') for p in dist.rglob('*')), 'Paid edition shipped publicly'
    print('Real-preview hashes/dimensions and public/private file boundary verified.')

if __name__ == '__main__':
    main()
