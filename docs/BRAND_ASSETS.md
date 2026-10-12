# PartyPrint visual identity and asset guidance

## Purpose
Make a recognizably playful, trustworthy consumer brand that stays readable as a 32px favicon, a 320px-wide phone header, a dark footer, and a social-share preview. Avoid overcomplicated multi-line JPG logos cropped through CSS.

## Current authored assets
- `assets/partyprint-mark.svg` — master vector mark: a folded printable card with four game squares, coral confetti and sage accents. Used in the navigation and favicon, with visible text wordmark supplied by semantic HTML.
- `assets/apple-touch-icon.png` — 180x180 PNG home-screen icon on warm cream, derived from the mark.
- `assets/partyprint-social.svg` — 1200x630 editable master for the homepage share card.
- `assets/partyprint-social.png` — 1200x630 raster for Open Graph/Twitter.
- `assets/guide-baby.svg`, `assets/guide-bridal.svg`, `assets/guide-office.svg`, `assets/guide-birthday.svg` — 720x420 illustrative game previews matching the site's print palettes.
- Matching `assets/guide-*.png` files for crawlers/social sharing.
- `assets/baby-shower-gift-bingo.png` — existing genuine generated gift-opening example, kept unchanged.
- `assets/partyprint-logo.jpg` — previous supplied artwork preserved unchanged but no longer referenced in public HTML, the build or favicon.

## Design tokens (established site compatibility)
- Charcoal `#352f35`
- Warm coral `#df8068`
- Sage `#a6b89a`
- Cream `#fffdf8`
- Supporting blush `#f9e3dc`

The SVGs are fully local, small, independent of external fonts and match the site's existing HTML/stylesheet aesthetic. The homepage wordmark uses live accessible text so it never needs to be manually cropped or rasterized.

## Rebuilding and verifying

When source artwork changes, install CairoSVG/Pillow in a temporary isolated environment and run:

```bash
python -m pip install cairosvg==2.8.2 pillow==12.0.0
python scripts/render-brand-assets.py
npm run check
npm run build
```

Do not run `render-brand-assets.py` as a Cloudflare deployment prerequisite: all generated assets are committed as static files. Review the output images visually and verify they represent the available games. Preserve working UI dimensions; avoid replacing the printable generator with decorative art.

## Remaining review
The assets are supplied as an intentional proposal, not as user-approved final creative. A human may prefer a different illustration or typography; preserve the previous `assets/partyprint-logo.jpg` as a rollback reference until approval. Verify appearance on real iPhone Safari separately from browser screenshots.
