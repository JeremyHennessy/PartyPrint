#!/usr/bin/env bash
set -euo pipefail

mkdir -p qa
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist >qa/server.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:4173/ -o /dev/null; then break; fi
  sleep 0.5
done
curl -fsS http://127.0.0.1:4173/ -o /dev/null

CHROME="$(command -v google-chrome || command -v google-chrome-stable || command -v chromium || true)"
if [[ -z "$CHROME" ]]; then
  echo "Chrome/Chromium is required for this QA job." >&2
  exit 1
fi
"$CHROME" --version
URL="http://127.0.0.1:4173/?occasion=office&count=1&games=bingo&size=4#studio"
OPTIONS=(--headless --no-sandbox --disable-gpu --disable-dev-shm-usage --no-first-run --disable-background-networking --virtual-time-budget=5000)

timeout 45s "$CHROME" "${OPTIONS[@]}" --dump-dom "$URL" >qa/rendered.html 2>qa/chrome.log
grep -q 'class="bingo-board"' qa/rendered.html || { echo "Bingo preview was not rendered." >&2; exit 1; }
grep -q 'Office party games' qa/rendered.html || { echo "Occasion query preset was not applied." >&2; exit 1; }
grep -q 'Card 1 of 1' qa/rendered.html || { echo "Bingo card count was not rendered." >&2; exit 1; }

timeout 45s "$CHROME" "${OPTIONS[@]}" --window-size=1440,1000 --screenshot="$PWD/qa/desktop.png" "$URL" >/dev/null 2>>qa/chrome.log
timeout 45s "$CHROME" "${OPTIONS[@]}" --window-size=390,844 --screenshot="$PWD/qa/mobile.png" "$URL" >/dev/null 2>>qa/chrome.log
timeout 45s "$CHROME" "${OPTIONS[@]}" --no-pdf-header-footer --print-to-pdf="$PWD/qa/sample-bingo.pdf" "$URL" >/dev/null 2>>qa/chrome.log

node scripts/brand-browser-qa.mjs

python3 - <<'PY'
from pathlib import Path
pdf = Path("qa/sample-bingo.pdf")
assert pdf.exists() and pdf.stat().st_size > 1000, "Missing/nonempty PDF export"
data = pdf.read_bytes()
assert data.startswith(b"%PDF-"), "Chrome produced a non-PDF file"
for name in ["desktop.png", "mobile.png"]:
    data = (Path("qa") / name).read_bytes()
    assert data.startswith(b"\x89PNG\r\n\x1a\n"), "Missing screenshot: " + name
print("Browser DOM, desktop/mobile screenshots and Chrome print-to-PDF smoke passed.")
PY
if command -v pdfinfo > /dev/null; then
  pdfinfo qa/sample-bingo.pdf | grep '^Pages:'
fi
