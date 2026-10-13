"""Validate actual exported pages, all expected words, and page text bounds."""
import json, re, sys
from pathlib import Path
from collections import Counter
import pdfplumber, logging
logging.getLogger("pdfminer").setLevel(logging.ERROR)

folder = Path(sys.argv[1] if len(sys.argv) > 1 else 'qa')
failures = []
normalize = lambda text: re.sub(r'\s+', '', text).replace('✳','').replace('♡','').replace('□','')
for case in json.loads((folder / 'print-manifest.json').read_text(encoding='utf-8')):
    with pdfplumber.open(folder / case['file']) as pdf:
        if len(pdf.pages) != case['expectedPages']:
            failures.append(f"{case['file']}: {len(pdf.pages)} pages, expected {case['expectedPages']}")
        for private_answer in case.get('privateAnswers', []):
            if private_answer in (pdf.pages[0].extract_text() or ''):
                failures.append(f"{case['file']}: guest sheet exposes a private host answer")
            if len(pdf.pages) < 2 or private_answer not in (pdf.pages[1].extract_text() or ''):
                failures.append(f"{case['file']}: separate host key is missing an answer")
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ''
            if 'my trivia answers' in text.lower():
                if not re.search(r'(?m)^12\.', text): failures.append(f"{case['file']} page {i+1}: missing answer numbers")
                writing_lines = [edge for edge in page.edges if edge.get('orientation') == 'h' and edge['x1'] - edge['x0'] > 200]
                if len(writing_lines) < 12: failures.append(f"{case['file']} page {i+1}: missing writing lines")
            if not text.strip(): failures.append(f"{case['file']} page {i+1}: blank")
            if 'who knows them?' in text.lower() or 'personal host key' in text.lower():
                for edge in page.edges:
                    if edge.get('orientation') != 'h' or edge['x1'] - edge['x0'] < 200: continue
                    if any(char['top'] + 2 < edge['top'] < char['bottom'] - 2 and char['x1'] > edge['x0'] and char['x0'] < edge['x1'] for char in page.chars):
                        failures.append(f"{case['file']} page {i+1}: writing line overlaps text")
                        break
            # Each logical sheet must be complete on its own physical page.
            if i < len(case['expectedText']):
                expected = normalize(case['expectedText'][i]).lower()
                actual = normalize(text).lower()
                # Counts catch lost repeated words or individual clipped letters too.
                expected_chars = Counter(c for c in expected if c.isalnum())
                actual_chars = Counter(c for c in actual if c.isalnum())
                if expected_chars - actual_chars:
                    failures.append(f"{case['file']} page {i+1}: incomplete character content")
                # Grid text extraction order is row-major; PDF extraction may interleave wrapped cells.
                for word in re.findall(r"[A-Za-z0-9]{3,}", case['expectedText'][i]):
                    if word.lower() not in actual:
                        failures.append(f"{case['file']} page {i+1}: missing {word}")
                        break
            for char in page.chars:
                if char['x0'] < 25 or char['x1'] > page.width-25 or char['top'] < 25 or char['bottom'] > page.height-25:
                    failures.append(f"{case['file']} page {i+1}: text outside safe margins")
                    break
        print(f"{case['file']}: {len(pdf.pages)} physical pages")
if failures:
    print('\n'.join(failures))
    raise SystemExit(1)
print('All PDF page counts, nonblank pages, expected words and text bounds passed.')
