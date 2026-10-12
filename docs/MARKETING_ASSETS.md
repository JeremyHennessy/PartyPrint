# Authentic PartyPrint marketing and discovery assets

## Provenance

All screenshots of game sheets are derived from the actual application generator and vector PDF renderer in src/core.js and src/pdf.js. They are NOT hand-drawn or invented game grids.

1. Run npm ci && node scripts/make-marketing-pdfs.mjs.
2. Generate promotional JPGs by running python scripts/render-marketing-assets.py.
3. Review assets/marketing/provenance.json for the source PDF, source page, SHA-256 and excerpt of printed text.

The source game seed is fixed, although PDF creation metadata may change the binary hash. Only the game content and layout are promised to be deterministic. The original full PDF is printable in the live app.

## Files and uses

| Files | Resolution | Use |
| --- | --- | --- |
| preview-baby, preview-bridal, preview-birthday, preview-office, preview-scavenger JPG | 720x420 | Accurate marketing previews on guides/home |
| og-home and four matching og-event JPG | 1200x630 | Social link previews; home includes three actual sheets |
| pin-baby, pin-bridal, pin-birthday JPG | 1000x1500 | Optional vertical Pinterest-style assets |

Six authored SVG symbols in assets/occasion-*.svg replace inconsistent Unicode glyphs. The current owner-supplied printer logo, footer art, favicon and iOS icon are unchanged.

## Rebuilding (development only)

Requirements: Node 22+, local npm dev dependencies, Python 3.12, system DejaVu fonts, PyMuPDF 1.26.7 and Pillow 12.3.0.

    npm ci
    node scripts/make-marketing-pdfs.mjs
    python -m pip install pymupdf==1.26.7 pillow==12.3.0
    python scripts/render-marketing-assets.py
    npm run check
    npm run build

The Python render tools are not dependencies of the Cloudflare static build. All output assets are committed.

## Visual and business guardrails

- These images show real generated sheets, partially cropped for promotional composition. They are not complete downloadable game sheets.
- No customer quotes, reviews, fake success rates, prizes or unearned rankings are shown.
- The brand palette, generator functionality, PDF flow and restored owner logo remain intact.
- JPGs are compressed, guide thumbnails are lazy-loaded and file sizes are limited.
- Inspect 320/390/768/1440px screenshots, actual social OG metadata, core tests and the complete Letter/A4 PDF suite.
- Do not post Pins automatically. Users may download an idea graphic; a live public Pinterest account or referral traffic has not been established.
- Gauge first organic shares from verified Search Console queries/analytics before scaling marketing production.

## Google Search Console investigation

Search Console ownership and an indexed homepage are recorded in docs/LAUNCH_PLAN.md. The sitemap report still reads "Couldn't fetch" even though the public XML and robots URLs were previously verified as HTTP 200. This does not establish a server or XML defect. Review the exact sitemap error details, URL Inspection live fetch, manual actions, crawl logs and any temporary crawling limits before proposing changes.

Official guidance:
- https://support.google.com/webmasters/answer/7451001
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

Do not repeatedly resubmit an unchanged sitemap or disable Cloudflare bot protections based on an unverified hypothesis.
