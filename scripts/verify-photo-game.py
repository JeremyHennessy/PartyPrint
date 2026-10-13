"""Inspect downloaded and native conversation PDFs, beyond file signatures."""
from pathlib import Path
import sys
import re
import pdfplumber
folder = Path(sys.argv[1] if len(sys.argv)>1 else 'qa/photo-game')
for paper, dims in [('Letter',(612,792)),('A4',(595.28,841.89))]:
    texts = []
    for name in [f'conversation-photo-{paper}.pdf', f'native-conversation-{paper}.pdf']:
        with pdfplumber.open(folder/name) as pdf:
            assert len(pdf.pages)==1, 'Expected exactly one conversation page'
            page=pdf.pages[0]
            assert abs(page.width-dims[0])<1 and abs(page.height-dims[1])<1
            text=page.extract_text()
            assert 'this or that' in text and 'No right or wrong answers' in text
            assert 'Pass any question' in text or 'PASS ANY QUESTION' in text
            assert len(re.findall(r'\?',text))==12, 'Missing conversation prompts'
            assert all(c['x0']>=25 and c['x1']<=page.width-25 and c['top']>=25 and c['bottom']<=page.height-20 for c in page.chars), 'Clipped text'
            texts.append(text)
        print(name, ': exact page count, paper, twelve questions and safe text bounds passed')
