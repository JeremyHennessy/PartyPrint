# PartyPrint

A cheerful free party-game studio for baby showers, bridal showers, birthdays, office parties, holidays and game nights.

**Production:** https://partyprint-5xv.pages.dev/ — Git-integrated Cloudflare Pages. See `docs/LAUNCH_PLAN.md` for verified releases and outstanding browser/business work. Revenue services are not enabled.

## Features

- Live studio: pick an occasion, choose a printable design and a 4×4 or 5×5 bingo board, and generate 1–48 independently shuffled cards.
- Curated bingo, 12-question trivia with a separate answer key, and 12-item scavenger hunts.
- Baby shower gift-opening or party-moment bingo. Edit the full curated list, replace it entirely, or add up to 80 of your own bingo prompts, preview any game, and shuffle again.
- Browser-native **Print / Save as PDF** button. Choose “Save as PDF” as the destination in your browser print menu. It is not a direct PDF download.
- Share generic game settings via URL. No party title, personal name or custom prompts are embedded.
- Four original guides plus accessible mobile UI, legal pages and SEO-friendly HTML.

## Architecture

**No backend, database, API keys, login or behavioral tracking.** The generator has no third-party runtime dependencies. Cookie-free Cloudflare Web Analytics is enabled only on the production hostname. Source is static HTML, CSS and ES modules. The generator logic lives in `src/core.js`, content in `src/content.js` and UI/print layouts in `src/app.js`. Print output stays in the browser. The production build exports a static `dist/` folder.

## Local development

Requires Node.js 22+.

~~~bash
npm ci
npm test
npm run check
npm run build
python3 -m http.server 4173 --directory dist
~~~

Open http://localhost:4173/. For a complete non-browser validation run, use `npm run validate`. Do not open the ES-module files directly as `file://` URLs.

## Cloudflare Pages setup

GitHub stores the source; Cloudflare Pages can host the public commercial site.

1. Cloudflare dashboard → **Workers & Pages → Create application → Pages → Connect to Git**.
2. Choose `JeremyHennessy/PartyPrint`.
3. Production branch: `main`; build command: `npm run build`; output directory: `dist`.
4. After a real site URL is assigned, set `PUBLIC_SITE_URL` to its verified HTTPS origin **including a trailing slash** (e.g., `https://actual-name.pages.dev/`, not the literal example) and redeploy. This enables canonical URLs and sitemap generation.
5. Later, attach a verified custom domain and set `PUBLIC_SITE_URL` to your chosen canonical domain.
6. Verify actual deployment, print behavior, performance and search indexing. A repository commit alone does NOT establish a live app.

The build does not fabricate a production hostname. Without `PUBLIC_SITE_URL`, neither sitemap nor canonical domain tags are added.

## Test and release checklist

GitHub Actions runs unit tests, checks local links and syntax, builds the artifact, and exports real Letter/A4 PDFs with page count, nonblank page, text-completeness and safe-margin checks. Playwright is a development dependency only.

For local browser/PDF QA: set `CHROME_PATH` to Chrome or Edge, run `node scripts/print-qa.mjs`, then `python3 scripts/verify-print.py qa` (requires `pdfplumber==0.11.9`). Screenshots, PDFs and the manifest are written under ignored `qa/`; CI retains them as an artifact.

Manual QA remains required: Chromium, Firefox, Safari and iPhone; 4×4 and 5×5 cards; high card counts; trivia with answer key; scavenger pages; Letter and A4 printers; blank-page/clipping checks; keyboard navigation; screenshots and real-deployment smoke tests. **Automated unit-test success isn't equivalent to visually verified PDF output or deployment.**

## Monetization (NOT enabled)

1. Launch useful free tools and original hosting guides; connect Google Search Console once a real domain is confirmed.
2. Measure actual traffic, indexing and utility. Add approved analytics only with updated privacy notice and applicable consent mechanisms.
3. Apply for an ad network when content and traffic justify it. Place minimal ads away from controls and printable sheets; do not add placeholder ads to low-value pages. Follow the network's policies and certified CMP/consent rules for applicable geographies.
4. Explore transparent optional premium seasonal collections or relevant affiliate recommendations **if actual demand supports them**. Core print functionality stays free.

Page RPM scenarios are not revenue forecasts; **there are no proven visits, earnings or ad approvals yet**.

## Privacy

The generator uses local browser state. It does not upload titles or custom prompts. Share links contain only generic configuration fields. Production uses cookie-free Cloudflare Web Analytics for aggregate visits and performance. No custom interaction events, tracking cookies or ads are present. Update `privacy.html`, consent mechanisms and security headers before adding any such providers.

## Brand and contribution

PartyPrint is a working name; conduct a proper domain and trademark check before spending on the brand. No open-source license grant is provided by this repository. The website terms allow free personal, classroom and internal workplace printing of generated sheets; commercial resale of templates is not allowed.

Feedback: https://github.com/JeremyHennessy/PartyPrint/issues
