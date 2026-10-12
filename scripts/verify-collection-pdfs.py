"""Verify the public collection downloads, including their live-generator links."""
from pathlib import Path
import pdfplumber

expected_url = "https://partyprint.live/?occasion=baby&mode=gifts#studio"
for name, dimensions in [("Letter", (612, 792)), ("A4", (595.28, 841.89))]:
    file = Path("assets/kits") / f"a-little-love-{name}.pdf"
    with pdfplumber.open(file) as pdf:
        assert len(pdf.pages) == 6, f"{name}: incomplete collection"
        links = []
        for page in pdf.pages:
            text = page.extract_text() or ""
            assert len(text) > 100, f"{name}: blank page"
            assert "Free generator: partyprint.live" in text, f"{name}: footer origin"
            assert "pages.dev" not in text, f"{name}: retired hostname"
            assert abs(page.width - dimensions[0]) < 0.1
            assert abs(page.height - dimensions[1]) < 0.1
            assert all(c["x0"] >= 25 and c["x1"] <= page.width - 25
                       and c["top"] >= 25 and c["bottom"] <= page.height - 20
                       for c in page.chars), f"{name}: clipped text"
            links.extend(link["uri"] for link in page.hyperlinks)
        assert links == [expected_url], f"{name}: generator hyperlink {links}"
    print(f"{name}: six readable pages, correct dimensions and live gift-bingo link")
