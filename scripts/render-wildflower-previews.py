"""Preview artwork from rendered, real PDF pages; no synthetic game examples.

Render the Letter color PDF at 65 DPI to qa/wildflower/letter with Poppler
first. Full paid editions and their authoring source remain outside dist/Git.
This script uses development-only Pillow and the existing licensed font.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
QA = ROOT / 'qa/wildflower'
DEST = ROOT / 'assets/kits/wildflower'
DEST.mkdir(parents=True, exist_ok=True)
FONT = ROOT / 'assets/fonts/NotoSans-Regular.ttf'

def f(size):
    return ImageFont.truetype(str(FONT), size)

def sheet(image, path, x, y, w):
    src = Image.open(path).convert('RGB')
    h = round(w*src.height/src.width)
    src = src.resize((w, h), Image.Resampling.LANCZOS)
    d = ImageDraw.Draw(image)
    d.rectangle((x+7, y+9, x+w+7, y+h+9), fill='#ddd9d1')
    image.paste(src, (x, y))
    d.rectangle((x, y, x+w, y+h), outline='#ded9d2', width=1)

def text(d, xy, s, size=28, fill='#283e39'):
    d.text(xy, s, font=f(size), fill=fill)

# Product spread and a Pinterest-sized discovery image contain genuine sheets.
spread = Image.new('RGB', (1200, 900), '#f7f1e9')
d = ImageDraw.Draw(spread)
text(d, (54, 34), 'PartyPrint / Wildflower', 32)
text(d, (54, 86), 'A coordinated baby shower, ready to print.', 22)
for x, page in [(52, 1), (438, 2), (824, 3)]:
    sheet(spread, QA/f'sample-{page}.png', x, 160, 320)
text(d, (54, 633), 'Gift bingo / Baby animal match / Host answers', 25)
text(d, (54, 697), 'Try a free 3-page sample', 37)
text(d, (54, 757), 'Letter and A4. No account or payment.', 24)
text(d, (54, 817), 'partyprint.live/collections/wildflower/', 23)
spread.save(DEST/'wildflower-spread.jpg', quality=90, optimize=True)

pin = Image.new('RGB', (1000, 1500), '#f7f1e9')
d = ImageDraw.Draw(pin)
text(d, (58, 51), 'PartyPrint', 34)
text(d, (58, 128), 'Baby shower', 58)
text(d, (58, 204), 'gift bingo + a little fun', 43)
text(d, (58, 285), 'FREE 3-PAGE WILDFLOWER SAMPLE', 27, '#526e55')
sheet(pin, QA/'sample-1.png', 58, 365, 505)
sheet(pin, QA/'sample-2.png', 582, 659, 355)
text(d, (58, 1126), 'Print. Play. Celebrate.', 44)
text(d, (58, 1204), 'One bingo card, animal match and host answers.', 25)
text(d, (58, 1260), 'Letter + A4 / Instant free download', 28)
text(d, (58, 1374), 'partyprint.live/collections/wildflower/', 24)
pin.save(DEST/'wildflower-pin.jpg', quality=90, optimize=True)

og = Image.new('RGB', (1200, 630), '#f7f1e9')
d = ImageDraw.Draw(og)
text(d, (55, 49), 'PartyPrint / Wildflower', 30)
text(d, (55, 133), 'A little wildflower.', 48)
text(d, (55, 214), 'A lot of happy moments.', 39)
text(d, (55, 319), 'Try the free baby-shower sample:', 26)
text(d, (55, 366), 'gift bingo, animal match + answers.', 25)
text(d, (55, 453), 'Letter + A4 / No signup', 26, '#526e55')
text(d, (55, 544), 'partyprint.live', 26)
sheet(og, QA/'sample-1.png', 775, 50, 375)
og.save(DEST/'wildflower-social.jpg', quality=90, optimize=True)

for source, name in [('sample-1.png', 'wildflower-bingo.png'),
                     ('sample-2.png', 'wildflower-animal-match.png'),
                     ('letter-03.png', 'wildflower-welcome.png')]:
    Image.open(QA/source).save(DEST/name, optimize=True)

# Every page is retained; contact sheets make complete layout review practical.
for prefix in ['letter', 'a4-ink', 'letter-ink', 'a4-color']:
    pages = sorted(p for p in QA.glob(prefix+'-*.png') if p.stem[len(prefix)+1:].isdigit())
    assert len(pages) == 37
    for start in range(0, 37, 12):
        contact = Image.new('RGB', (1800, 1840), '#e5e2dd')
        d = ImageDraw.Draw(contact)
        for index, file in enumerate(pages[start:start+12]):
            col, row = index%4, index//4
            page = Image.open(file).convert('RGB')
            page.thumbnail((420, 550))
            contact.paste(page, (col*450+15, row*610+20))
            text(d, (col*450+18, row*610+575), 'PAGE '+str(start+index+1), 18)
        contact.save(QA/f'contact-{prefix}-{start//12+1}.jpg', quality=90)

manifest = {
    'source': 'Real PartyPrint Wildflower PDFs rendered with Poppler; original vector artwork.',
    'full_editions_public': False,
    'page_numbers': {'sample_bingo': 1, 'sample_animal_match': 2, 'sample_answers': 3, 'full_welcome': 3},
    'sample_sha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                      for p in sorted(DEST.glob('*.pdf'))},
    'asset_sha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                     for p in sorted(DEST.glob('*')) if p.suffix in ['.jpg', '.png']}
}
(DEST/'provenance.json').write_text(json.dumps(manifest, indent=2)+'\n')
print('Created genuine-PDF spread, discovery pin, social image and full-page QA contact sheets.')
