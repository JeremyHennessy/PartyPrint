# PartyPrint

A cheerful free party-game studio for baby showers, bridal showers, birthdays, office parties, holidays and game nights.

**Production:** https://partyprint.live/ — Git-integrated Cloudflare Pages. The previous Pages hostname and www redirect to this primary domain. See `docs/LAUNCH_PLAN.md` for verified releases and outstanding browser/business work. The optional Wildflower kit is published on Payhip for US$5; advertising remains inactive pending approval and consent readiness.

## Features

- Live studio: pick an occasion, choose a printable design and a 4×4 or 5×5 bingo board, and generate 1–48 independently shuffled cards.
- Curated bingo, 12-question trivia with a separate host key and optional 0–48 guest answer sheets, and 12-item scavenger hunts.
- Optional Who knows them? quiz with up to 12 personal questions and a separate host key, themed 12-word scrambles with answers, and 12 cut-out draw-and-guess cards. All six occasions supported. Personal questions/answers remain local and are excluded from setup links; quiz order stays stable when other games are regenerated.
- Optional **Play on phones** guest links and locally generated QR codes. Guests receive the selected games, mark their own bingo/scavenger items, keep quiz answers, choose conversation options and draw on a touch canvas. Creating a guest link explicitly shares the title/custom game text, never personal host answers; existing generic setup links remain unchanged. Guest progress is saved in the browser and can be cleared. No accounts, live room, automatic host submissions or scoreboard. Guest route is noindex and has no analytics beacon. Very long custom lists can exceed QR capacity; sharing the full link still works.
- Baby shower gift-opening or party-moment bingo. Edit the full curated list, replace it entirely, or add up to 80 of your own bingo prompts, preview any game, and shuffle again.
- Real on-device **Download PDF** export with Letter/A4, embedded fonts, Save PDF, Open PDF and supported file sharing. Browser-native **Print games** remains a separate option.
- Browse every guest’s bingo card and all 12 trivia questions, scavenger finds or conversation prompts. Preview separate host answers and requested guest answer sheets. Text sheets fit phones; enlarged bingo grids support sideways scrolling. Preview navigation preserves prepared PDF files.
- Share generic game settings via URL. No party title, personal name or custom prompts are embedded.
- Four original guides plus accessible mobile UI, legal pages and SEO-friendly HTML.
- Free coordinated baby-shower samples, including Wildflower gift bingo and baby animal matching with a host key. The optional full Wildflower kit is available through Payhip for US$5 plus applicable tax. Paid processing and real-device full-kit acceptance remain unverified.

## Architecture

**No backend, database, API keys, login or behavioral tracking.** The generator remains lightweight; direct PDF export lazy-loads a pinned, locally served jsPDF engine and Noto Sans font only when requested. Cookie-free Cloudflare Web Analytics is enabled only on the production hostname. Source is static HTML, CSS and ES modules. The generator logic lives in `src/core.js`, content in `src/content.js` and UI/print layouts in `src/app.js`. Print output stays in the browser. The production build exports a static `dist/` folder.

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

GitHub Actions runs unit tests, checks local links and syntax, builds the artifact, and exports real Letter/A4 PDFs with page count, nonblank page, text-completeness and safe-margin checks. Playwright is a development dependency only. jsPDF 4.2.1 is pinned in development dependencies for deterministic builds; only its 420 KB UMD browser file and license ship in dist. The bundled Noto Sans font is 569 KB, under SIL OFL; both assets are requested only on PDF export. No HTML rasterization libraries or export server are used.

For local browser/PDF QA: set `CHROME_PATH` to Chrome or Edge, run `node scripts/print-qa.mjs`, then `python3 scripts/verify-print.py qa` (requires `pdfplumber==0.11.9`). Screenshots, PDFs and the manifest are written under ignored `qa/`; CI retains them as an artifact.

Manual QA remains required: Chromium, Firefox, Safari and iPhone; 4×4 and 5×5 cards; high card counts; trivia with answer key; scavenger pages; Letter and A4 printers; blank-page/clipping checks; keyboard navigation; screenshots and real-deployment smoke tests. **Automated unit-test success isn't equivalent to visually verified PDF output or deployment.**

Wildflower PDF QA: `python3 scripts/verify-wildflower-pdfs.py` checks public samples and preview provenance. Owners can add `--full-dir output/pdf/wildflower` to inspect the four private editions. Premium PDFs and authoring source are excluded from Git and `dist`; back up the private `output/` files separately before moving machines. Public-site deploys must never include full paid files.

## Monetization status

AdSense ownership verification uses the real publisher meta tag and root ads.txt. Neither loads ad scripts. Site review/approval and consent remain required before restrained manual ad placements; see docs/LAUNCH_PLAN.md.

1. Launch useful free tools and original hosting guides; connect Google Search Console once a real domain is confirmed.
2. Measure actual traffic, indexing and utility. Add approved analytics only with updated privacy notice and applicable consent mechanisms.
3. Apply for an ad network when content and traffic justify it. Place minimal ads away from controls and printable sheets; do not add placeholder ads to low-value pages. Follow the network's policies and certified CMP/consent rules for applicable geographies.
4. Explore transparent optional premium seasonal collections or relevant affiliate recommendations **if actual demand supports them**. Core print functionality stays free.

Page RPM scenarios are not revenue forecasts; **traffic counts include QA, measured Payhip sales remain US$0, and AdSense approval is pending**.

## Privacy

The generator uses local browser state. It does not upload titles or custom prompts. Generic setup links contain only configuration fields. Explicit guest-play links include the party title and custom game questions/words, with a disclosure before generation; host answers and photos are excluded. Production uses cookie-free Cloudflare Web Analytics for aggregate visits and performance. No custom interaction events, tracking cookies or ads are present. Update `privacy.html`, consent mechanisms and security headers before adding any such providers.

## Brand and contribution

PartyPrint is a working name; conduct a proper domain and trademark check before spending on the brand. No open-source license grant is provided by this repository. The website terms allow free personal, classroom and internal workplace printing of generated sheets; commercial resale of templates is not allowed.

Feedback: https://github.com/JeremyHennessy/PartyPrint/issues

### Photo-inspired themes and conversation games
The free generator can extract a coordinated color palette from a visitor-selected JPG, PNG or WebP (up to 10 MB), entirely in browser memory. Images are never uploaded, persisted, printed or shared in configuration links. It suggests colors rather than recreating image artwork. Optional This or that sheets work across all six occasions, alone or in a combined pack. Existing links keep their original three-game defaults. The published US$5 Wildflower premium kit has 37 pages per Letter/A4 color/ink-friendly edition. Its paid files stay outside the public repository and deployment.
