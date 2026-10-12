# Launch and revenue guardrails

## Free baby-shower collection sample — 2026-10-12

Publish a useful free six-page Letter/A4 keepsake sample with a substantive collection page, real printable preview, instructions and direct gift-bingo preset. Includes host plan, two-up predictions/encouragement, gift record and alphabet game. No paid edition, demand claims, prices, checkout, accounts or extra tracking. PDFs were independently checked for six nonblank pages and safe text bounds; all twelve rendered pages visually inspected. Generation source retained at scripts/create-sample-kit.py; Python tools are optional authoring dependencies, not deployment requirements. Real Safari and physical-print acceptance remain outstanding. Exact release evidence is recorded in the release PR.

## Current continuation record — 2026-10-12

This section supersedes historical blockers and next-task lists below. Starting main: `f978a8c7f3be624e029685e35140b4971e683737`; verified Pages deployment `76c1ecf4-7a23-443c-b412-fba6b4ee6fa0`; production https://partyprint-5xv.pages.dev/. Main Actions 38305393363 passed. Search Console ownership is complete; homepage indexed. Four guides are unknown to Google; baby and office guides passed actual live tests. Indexing request hit Google daily quota. Sitemap report still could not fetch; six public URLs return 200 with matching canonicals and no HTML noindex. Performance data is processing, not measured zero traffic.

This release restores the owner-supplied printer artwork in navigation and displays its complete logo and tagline in the footer. Existing guide/social assets, games, PDF export and hosting are preserved. Exact release SHA/checks/deployment evidence will be recorded in the release PR. Original artwork stays intact.

Outstanding: actual Safari and physical printer acceptance, sitemap processing and guide indexing, authenticated aggregate traffic baseline. No ads, affiliate links, payments or measured revenue. Next three tasks: (1) retry indexing after quota reset and diagnose sitemap using real fetch evidence; (2) real Safari/Letter/A4 printer checks and establish analytics baseline; (3) prepare one coordinated baby-shower premium sample without enabling payments.

Older sections below are historical evidence, not current setup instructions.

## Google Search Console — verified ownership, sitemap read outstanding — 2026-10-12

Completed: owner signed in to the controlled browser; URL-prefix property https://partyprint-5xv.pages.dev/ created; Google's public HTML tag deployed; Google displayed **Ownership verified** using **HTML tag**. Keep the homepage tag permanently. No DNS change, additional tracking or security-setting change was made.

Release [PR #11](https://github.com/JeremyHennessy/PartyPrint/pull/11): exact tested head `e4cee6b3c6fde73f8bf433237d43edecca7b9880`, merged main `f640836f305840d0ee98ce811ff6b4fa54c27ca6`, successful Pages production deployment `028511e6-c25c-46cf-975d-75b948499509`; [main Actions 38304251276](https://github.com/JeremyHennessy/PartyPrint/actions/runs/38304251276) green. The exact verification tag was independently confirmed inside the public homepage head with HTTP 200 before clicking Verify. Newer brand work at `38dd2aaa81163486afe4c7e48cad5680bd5fc761` and mobile-hero fix at `4f3a6590914396df0a71df8e5ab968d9eeebe03b` were reconciled and preserved.

Submitted https://partyprint-5xv.pages.dev/sitemap.xml. Google confirmed **Sitemap submitted successfully**, but the report shows **Couldn't fetch / Sitemap could not be read**, zero discovered pages. One resubmission after checking the public endpoint produced the same report. Public sitemap is valid six-URL XML, HTTP 200, application/xml; robots.txt is HTTP 200 and allows crawling. This remains an unresolved Google sitemap-read result; submission is not successful processing, and the report's zero discovery is not a site-traffic measurement. Do not repeatedly resubmit or alter security controls without evidence.

Confirmed separately in Google URL Inspection: the homepage shows **URL is on Google / Page is indexed**. Google's live test shows **URL is available to Google / Page can be indexed**. Other pages' indexing has not been checked; search performance and aggregate indexing reports are still processing. No traffic, rankings or revenue figures are available. Sitemap-fetch cause is not established by the successful homepage test.

Next three tasks: (1) revisit the sitemap read report and investigate Google's detailed error if it persists; (2) inspect indexing of the four useful guides and actual search queries when reports are ready; (3) use measured discovery to choose substantive content and a low-maintenance premium-pack experiment. No ads, payments or affiliates enabled. Search Console no longer requires owner authentication in the current session.

## Brand and visual assets refresh — 2026-10-12

Initial visual audit started from `main` `aaea6e6b56737ea2454727a459ad35c79dc18640` (merged PR #9). The square owner-supplied artwork was intact, but the navigation cropped its middle band with CSS, the favicon displayed the entire 1,254px JPG, the footer placed a white JPG block on a dark surface, and the guide thumbnails relied on large font glyphs. That made the identity inconsistent and fragile at small sizes. The original JPG is preserved unchanged for rollback/reference; no claim that the replacement design is owner-approved.

This focused work replaces those display references with a small original vector card-and-confetti mark and real HTML wordmark, adds an Apple touch icon, three purpose-built guide thumbnails plus birthday-guide artwork, and supplies PNG social previews for the home page and guide posts. The original baby-shower gift-opening sample remains available. All print logic, Cloudflare configuration, games, PDF export, scoring, data, and approved behaviors remain untouched. The SVGs are committed editable source; PNG derivatives can be regenerated with `python scripts/render-brand-assets.py` using CairoSVG and Pillow. The one-off write-enabled rendering workflow is removed before release.

**QA expected before promotion:** static asset signature/dimension and reference checks, existing complete PDF matrix, 320/390/1440px header/footer and guide screenshot review, Pages preview release check, main Actions, and exact production deployment. Do not conflate source or CI success with verified production appearance. The ChatGPT web fetcher could not directly access the Cloudflare site, so this pass uses repository source and GitHub-hosted QA evidence; direct real-device appearance remains independent testing.


## Owner-supplied logo — 2026-10-12

Starting main `c0d5d8fca811604f923fc16ad4c881f22df60ce4`, production deployment `338d51b1-61df-4f5d-b726-528d9dd87db0`, is the verified PR #8 release ([main Actions](https://github.com/JeremyHennessy/PartyPrint/actions/runs/38298901636)). The supplied PartyPrint / Print Happy Moments JPG is preserved unchanged in assets/partyprint-logo.jpg. Header wordmarks use a CSS viewport of that artwork; footer displays the full printer illustration, brand and tagline. All eight navigable pages use it, with the matching favicon on all nine HTML pages and homepage social image. Gameplay and printed sheets remain intact. Mobile/desktop and guide navigation/logo loading are checked before publishing; exact release checks and deployment are recorded in the logo PR.

## Printable preview and guest answer sheets — 2026-10-12

Owner acceptance: after PR #7, the owner reported “That worked” for the real PDF flow on the previously identified iPhone Chrome / Google environment. This verifies their reported delivery problem was resolved; exact app identity, all iOS browsers and physical printer output are not inferred. Starting main `2b7af5982ff023a182fdcdcb2d0aff2a69ec725e` and successful Pages deployment `1acc9e3e-88e1-48b4-83d3-66aba79e2545` were checked against the account. No newer commits or open PRs at the start.

Implemented card-by-card bingo navigation, upright full-content previews for all three games, keyboard-close/focus return, and a scrollable enlarged sheet on narrow phones to avoid squeezing words into unreadable fragments. Navigating previews preserves the ready PDF and never changes the card mix or customizations. Full trivia/scavenger previews expose all 12 entries.

Optional guest trivia answer sheets accept 0–48 copies (default 0 preserves existing packs), with name/team and 12 numbered writing lines. Questions and host key remain separate, with one host key regardless of guest copies. Answer-sheet quantity is counted in summaries, native printing and real PDF export, and restored by generic setup links without private content. Turning trivia off excludes answer sheets.

Validation: 20 core tests plus static checks/build. The expanded native/direct Letter/A4 matrix contains 72 PDF documents / 936 physical pages, including 12-copy combined packs and 48-copy trivia packs with long titles. Checks cover exact counts, nonblank sheets, complete text and safe page margins; guest-sheet count/12 lines/no host-answer list, preview navigation, file retention, modal close/focus, readable cell widths/fonts, and 320/390/768/1440px layouts. Representative mobile/desktop previews and rendered A4 direct / Letter native answer sheets were visually inspected. QA evidence retained under `qa/preview-answer-final/`; CI uploads artifacts. Exact release head/main SHA, Actions and deployment IDs are recorded in the release PR after publishing.

Search Console access check still reaches Google’s sign-in screen. Owner sign-in is required before checking existing properties or issuing a verification token; sitemap remains https://partyprint-5xv.pages.dev/sitemap.xml. Cookie-free production analytics remains installed without duplicate tracking; aggregate reports, indexing and organic traffic are unknown. No ads, payments or affiliate links activated. Product improvements should reduce preparation friction; impact on return visits/revenue remains a hypothesis.

Next three objectives: (1) finish Search Console property verification and sitemap submission after owner sign-in; (2) inspect real acquisition/landing-page analytics and indexing before selecting the next substantive guide; (3) test a coordinated premium sample pack and pricing only after evidence of generator demand, preserving the free tool. Real Safari and physical printer checks remain outstanding.

## Direct PDF export — 2026-10-12 (release verification in PR)

This section supersedes the native-print workaround below. The owner reported that the iPhone Chrome / Google fallback still did not solve file delivery. Reviewed production main was `9ffda3fa8e75b72794bf6431fa66127cbf5118cd`, Cloudflare deployment `8310a766-be4d-4981-8b61-9d275b8b8b24`, at https://partyprint-5xv.pages.dev/. Git integration and hosting settings are preserved.

Implemented real local vector PDF generation from `createPack()` data, with Letter/A4, an explicit Save PDF link, Open PDF and file sharing when supported. Browser printing remains separate. Ready files live only in memory and are invalidated when settings change; canceled sharing preserves the file. Errors show a retry path, resource loading has a timeout, and unsupported glyphs are reported instead of dropped. No upload, backend, account, storage, new tracking or payment service added. On-device PDF sharing intentionally shares the full selected document; generic setup links still omit names/custom words.

The export renderer uses pinned jsPDF 4.2.1, copied at build time to a local 420,165-byte UMD asset, and a bundled SIL-OFL Noto Sans Regular font (569,208 bytes). Both load only on export; no HTML-to-image pipeline is used. Font provenance/hash/license are recorded in assets/fonts/. npm audit reported zero vulnerabilities at installation. Measured sample files: one classic card approximately 40 KB; 48 classic cards approximately 145 KB. These are QA examples, not universal file-size promises.

Also improved primary-action contrast and touch areas, aligned bingo win rules, corrected singular page wording, and updated homepage FAQ, affected guides, README and privacy copy. The cheerful visual identity and generator content remain intact.

Verification: 18 core tests plus static/build checks passed. Browser runner covers actual file download, supported-sharing branch with a mocked file API, canceled sharing, edited-setting invalidation, Unicode title, blocked engine resource then successful retry, and unsupported emoji failure. iPhone user-agent tests run in Chromium and are not real iOS evidence. The expanded matrix contains 64 PDFs / 672 physical pages: native print and direct downloads, six occasions, all themes, gift/moment bingo, 4x4/5x5, 1/12/48 cards, trivia, separate key, scavenger and long/unbroken prompts on Letter/A4. Page counts, nonblank sheets, complete text including Unicode letters, and safe margins are inspected with pdfplumber. Visual samples include mobile ready-file controls, long-text output, Unicode title and the final card of a 48-page download; artifacts are in qa/direct-release/ and CI uploads.

Release PR will contain exact tested head, final main SHA, Actions results, preview and production deployment IDs, and independently verified live downloads. Actual iPhone Chrome, Safari and Google-app saving remains an acceptance check with the owner; it must not be inferred from desktop file downloads or mocked sharing.

Next three tasks: (1) confirm saving/opening the customized file on a real iPhone; (2) add readable full-card preview and optional guest trivia answer sheets once delivery is accepted; (3) authorize Search Console and assess real discovery/aggregate analytics before publishing more content or activating monetization. Traffic, indexing, revenue and ad approval remain unverified; no ads, affiliates or payments enabled.


## iPhone printing report — 2026-10-12 (fix pending release verification)

The account owner reported that Print / save did not work on iPhone. The user identified Chrome / Google on iPhone; exact symptom remains unknown. Previous Chromium PDF results were not iPhone evidence. The original button synchronously rendered a hidden print root then relied exclusively on `window.print()`.

Implemented a visible printable view with all generated sheets, a return-to-editor control preserving customizations, accessible focus and an explicit print action. On iPhone/iPad the main button opens the prepared pack rather than depending on a scripted dialog; instructions provide the browser-native Share → Print → Share / Save to Files path. In-app browser users are directed to create the pack in Safari. Desktop automatic print stays available, with the same visible fallback if a dialog is blocked. Prepared sheets are reused for the same pack, avoiding another DOM replacement when beforeprint fires. No PDF library, backend, storage or private URL data added.

Local checks: 18 core tests and static/build checks passed. The updated browser regression runner verifies the iPhone user-agent path with a no-op print API, visible four-sheet pack, explicit print action, private title excluded from URL, return/forward history preserving the pack, and desktop automatic printing. This is Chromium handler coverage, not real iOS testing. All 32 PDF fixtures / 336 physical pages passed exact counts, nonblank pages, complete text and page bounds, including the visible view on Letter/A4. Visually inspected the 390px printable view and rendered A4 bingo page; QA artifacts are in qa/iphone-fix/ and CI artifacts. Release PR and deployment evidence will be recorded in the linked PR after publishing.

Source: [Apple printing instructions](https://support.apple.com/en-ie/guide/iphone/iph92628b8f/ios). This is a fallback for the reported failure, not a claim that its exact underlying iOS cause has been reproduced. Real iPhone confirmation remains required after deployment.


## Quality, product and growth pass — 2026-10-12 (verified release)

This section supersedes older next-step lists. Starting main was `0fd3e214f36bc49e706db06af55248d4c727222f`; fetched main and open PRs were reconciled before editing. Pages production was independently confirmed at deployment `d60ffd5d-289b-488b-ad6e-403347ffd6da`, serving that commit at https://partyprint-5xv.pages.dev/. Git integration, main, `npm run build`, `dist`, canonical origin and absence of custom domains remain correct. Obsolete Workers triggers were left disabled.

### Verified release record

- Application main verified at `0c6111f202216776041db01d5e397559ce36fbdc`, merged from [PR #4](https://github.com/JeremyHennessy/PartyPrint/pull/4), exact tested head `f38653927609e41c29bf9be6132b468baf4fe880`. [Main Actions run 38290840059](https://github.com/JeremyHennessy/PartyPrint/actions/runs/38290840059) passed all tests, including Linux Chrome PDF inspection; QA artifact `partyprint-browser-qa` ID `11766325780` was uploaded (expires 2026-10-19). Both branch and PR checks also passed before exact-head merge.
- Production deployment `c8b4ec5c-8e9d-4b4a-a353-6ffd5164b582` completed successfully from main at that application SHA via `github:push`; public https://partyprint-5xv.pages.dev/ independently tested. Deployed JS and print CSS exactly matched tested source. Actual live controls, gift mode, editable replacement list, retained shuffle, trivia/scavenger previews and 390px mobile layout passed. Live PDFs: 4 Letter + 4 A4 pages, expected complete contents and safe margins. Production screenshots/manifests/PDFs retained under `qa/production/`.
- Homepage canonical, six-URL sitemap, robots sitemap reference, guide OG image (HTTP 200) and actual 404 status verified. No custom domain, backend or obsolete Workers trigger changes.
- Production beacon script loaded with HTTP 200 and collection requests returned HTTP 204. Captured request payloads excluded the explicit private title/custom-word test sentinels; there were no browser JS errors. Preview deployment `dd1aea0b-02f0-4610-b394-e90509f82552` also passed controls/SEO/eight-page PDF checks, and loaded no analytics. Analytics report totals remain unknown; these QA visits are not organic visitors.
- Follow-up [PR #5](https://github.com/JeremyHennessy/PartyPrint/pull/5) aligns the new replacement selector with existing form styling after inspection of the expanded mobile control, and records this verification. Documentation/follow-up commits may advance main beyond the application SHA above; use the GitHub main ref and Cloudflare canonical deployment when resuming.

### Implemented in this pass

- Fixed proven print defects: normal trivia produced 4 Letter / 3 A4 pages instead of 2; combined packs inherited extra pages; long titles produced 7 instead of 4 pages; unbroken strings crossed safe margins. Reduced print heading/spacing and added wrapping. Native printing is retained without a PDF runtime library.
- Clear baby-shower choice between 40 curated baby gifts and the existing party-moment pool, with mode-specific preview and printed instructions. Legacy setups still default to moments.
- Edit the complete curated pool, remove unwanted items, add words, or choose replacement rather than supplementation. Up to 80 unique prompts, 56 characters each; minimum 16/24 for replacement grids. Shuffle retains edits. Invalid configurations clear stale printable output.
- Expanded the existing baby-shower guide rather than adding duplicate landing pages: original gift-opening rules, registry customization, repeated-gift/bundle guidance, no-winner fallback, print settings, a real generated example and direct presets. Added absolute Open Graph image metadata and a tall printable example suitable for sharing. No social posting was performed.
- Registered exactly one Cloudflare Web Analytics site, tag `7b36d9515b694ca4a8d6e58bb1a6a151`, for the production hostname; auto-injection disabled. The public beacon identifier is not an account credential. Source loads the beacon only on production; local/preview QA is excluded. Updated privacy disclosure and limited CSP additions to official script/collection origins. Production activation verified: script HTTP 200 and collection HTTP 204, without private input payloads.

### QA evidence and limits

- 18 generator tests pass; source link/syntax checks and canonical build pass.
- Development-only Playwright runner exports 30 PDF fixtures / 328 physical pages: all six occasions; 1, 12 and 48 bingo cards; both grid sizes; all four themes; gifts; trivia and separate answer keys; scavenger and combined packs; long titles, long custom prompts and unbroken strings; Letter and A4.
- Actual PDFs checked with pdfplumber for independent expected counts, nonblank pages, all expected words and character counts, and safe page margins. These are document checks, not merely file-signature checks. CI now repeats them and retains artifacts for seven days.
- Local artifacts retained in `qa/baseline/`, `qa/release/`, `qa/final/`: PDFs, manifests, desktop/mobile screenshots and rendered sample pages. Visually inspected color gift bingo, answer key, long text, unbroken strings, and grayscale scavenger output. Print layouts use mostly white backgrounds and colored text/borders; grayscale remains readable. Physical ink consumption is not measured.
- Actual desktop studio and 320px mobile studio inspected; 320/390/768px screenshots and DOM width checks pass. Browser checks exercise replacement, curated-list loading, escaped content, regeneration, invalid-state clearing, keyboard preview arrows and privacy-safe sharing.
- Tested engine: Microsoft Edge Chromium on Windows; Linux Chrome PDF checks also passed in GitHub Actions. **Real iPhone Safari, Firefox, Safari print dialogs, physical printers and actual save-menu interactions remain unverified.** No iPhone test device is available here. Chromium PDFs are not iOS proof.

### Discovery and measurement baseline

- Research checked real search results for baby-shower gifts, custom bingo, office games and holiday trivia. [Bingo Card Creator](https://www.bingocardcreator.com/bingo-cards/baby-shower/) explicitly offers gift-opening and editable cards; [MakeYourBingo](https://makeyourbingo.com/) advertises list editing/PDFs. These demonstrate competing functionality, not keyword volume or PartyPrint demand. Focused opportunity: explain gift versus moment rules and give a free, privacy-safe coordinated pack immediately. Other content priorities need actual query evidence.
- Canonical origin remains https://partyprint-5xv.pages.dev/; six useful sitemap URLs retained. Existing title/descriptions, article schema, internal presets and image sharing improved without scaled content. [Google people-first guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) informed this choice.
- Search Console access is unavailable in this session; existing ownership/indexing, impressions, clicks, rankings and queries are **unknown**. Account holder's precise remaining step: add URL-prefix property `https://partyprint-5xv.pages.dev/` in Search Console and obtain its HTML-file verification challenge (or HTML meta tag). Supply the exact generated challenge for a verified commit/deploy; then complete Verify and submit `https://partyprint-5xv.pages.dev/sitemap.xml`. Do not use DNS verification for the shared pages.dev domain. [Official verification methods](https://support.google.com/webmasters/answer/9008080?hl=en).
- [Cloudflare metrics](https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/) can cover pages, approximate visits, referring hosts, device/browser categories and [Core Web Vitals](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/). It does not supply the requested custom generator/print/share funnel out of the box; no custom event infrastructure was added. Most-used occasion is not measured when selection only changes form state. Print-dialog events cannot prove a successful printable.
- Measured business baseline: no authenticated traffic or payout report available; visitor volume, acquisition mix, conversion, retention, field Core Web Vitals and revenue are **unknown**. Initial analytics QA requests are synthetic verification traffic, not customers. Hypothesis: better gift intent matching and reliable output improve usefulness, sharing and organic discovery. Impact has not been measured.

### Commercial assessment (no ads, payments or affiliate links enabled)

- [AdSense eligibility](https://support.google.com/adsense/answer/9724?hl=en) requires original useful policy-compliant content and an eligible account holder; no fabricated minimum traffic/page threshold. PartyPrint now has useful tools and policies, but has no verified publisher approval/ID, audience baseline or advertising consent setup. Keep ads out of controls/print output. Application is a later account-holder step.
- Optional coordinated premium kits are the preferred next commercial experiment after observing real queries/use; they add value beyond free cards and allow automated delivery. An illustrative USD $9 test price is a hypothesis, not proven willingness to pay. A competing seller [lists packs at $9.99 and $29.99](https://getbabyshowergames.com/shop/); listed prices are observed offers, not evidence of sales or equivalent scope. [Gumroad direct pricing](https://gumroad.com/pricing): 10% + $0.50 gives $7.60 per $9 sale before refunds/income tax; marketplace fees differ. [Payhip](https://payhip.com/pricing): free plan 5% plus payment processing; assuming processing 2.9% + $0.30 gives about $7.99, but actual fees depend on processor/location. Merchant-of-record and local tax obligations must be assessed when selecting a provider. No merchant account created.
- Illustrative monthly economics, **not forecasts**: 10,000 pageviews at an assumed $3 net page RPM = $30 advertising; 10,000 visits at an assumed 0.1% $9 kit purchase rate = 10 sales / $76 after Gumroad direct fees; 10,000 visits × assumed 2% affiliate clicks × 5% purchase × $30 basket × 3% commission = $9. None of these rates are measured or promised.
- Ads have low content maintenance but approval/consent/performance costs. Premium packs require upfront original design, refunds and occasional support, with greater possible revenue per transaction. Affiliates have low engineering cost but program eligibility, disclosure and link upkeep; use only relevant printing/supply recommendations if real participation is obtained. No fabricated links or commissions.

### Next three priorities

1. Real iPhone Safari and additional desktop-browser printing; address demonstrated failures before considering direct PDF export. Evaluate two-up printing only after reliable single-page layouts.
2. Verify Search Console ownership, submit the real sitemap, and inspect actual queries/indexing alongside the new analytics baseline. Use evidence to choose the next useful page or game improvement.
3. Validate one coordinated premium baby-shower kit at an explicit test price, preserving the free tool. Obtain merchant authorization only when the concrete product/delivery/refund setup is reviewable; consider ads later with real approval and consent handling.


## Verified handoff — 2026-10-12

### Live deployment update

- **Verified production URL:** https://partyprint-5xv.pages.dev/ (HTTP 200; generator exercised in the live browser).
- Authenticated account access verified through official `cf` CLI 1.0.0-beta.14 after owner-approved OAuth. Cloudflare MCP OAuth also completed; MCP tools remain unavailable in this conversation, so the CLI is the operational connection.
- No Pages projects existed before setup. Created Git-integrated Pages project `partyprint`, ID `14807d06-fc84-407b-8621-2835fa143391`, connected to `JeremyHennessy/PartyPrint`, production `main`, framework None, root repository, build `npm run build`, output `dist`. Automatic production and preview deployments are enabled.
- Production deployment `74e86a9a-cdbc-4624-961b-f50292599aef` succeeded on application commit `26d4c64022a606c064ed8acf1be9d90cd8f438cc`. Both production and preview build settings use `PUBLIC_SITE_URL=https://partyprint-5xv.pages.dev/`. No custom domain is configured.
- Served homepage canonical, six-URL sitemap, robots sitemap declaration, and custom 404 response were verified. Live browser checks exercised birthday selection, custom title, two-card 4×4 generation, trivia and scavenger previews, and sharing. The copied URL contained generic settings and excluded the custom party title.
- Root cause of the old Workers failure: deploy command `npx wrangler deploy` auto-detected assets as repository root (`.`), including a 129 MiB dependency binary instead of `dist`. The app build itself succeeded. Disabled that obsolete Worker's preview builds and excluded all paths from production build triggers; the Worker remains intact. Pages is the active deployment target.
- Handoff updates are in [PR #3](https://github.com/JeremyHennessy/PartyPrint/pull/3). Full print/PDF pagination, Letter/A4, iPhone Safari, full mobile QA, Search Console/indexing, custom domain, and monetization remain outstanding. Earlier blocked-state notes below are retained as historical evidence and are superseded by this update.

### Next priorities after deployment

1. Complete visual print QA, especially long titles, 48-card packs, trivia answer keys, Letter/A4, and iPhone Safari.
2. Verify mobile usability across sizes and browsers.
3. Connect an intended custom domain and Search Console if authorized; inspect actual indexing before claiming search traffic.
4. Grow useful content based on observed demand before adding advertising or paid products.

### Earlier verification evidence

- Latest fetched application main: `26d4c64022a606c064ed8acf1be9d90cd8f438cc`. Repository history and PR search show the two supplied releases; no subsequent application commits were found.
- GitHub Actions [run 38284511030](https://github.com/JeremyHennessy/PartyPrint/actions/runs/38284511030) completed successfully on that exact main commit.
- GitHub's check-runs API separately reports **Workers Builds: partyprint — failure** on that main commit, linking Cloudflare build `615e3d4f-f441-423b-a6a6-fb1f20fc3fdc`. This confirms a Workers build integration signal, not a successful Pages deployment. The build logs and account configuration require authenticated inspection; the failure cause is unknown.
- Fresh checkout: `npm run validate` passed with Node 24.19.0: 16 tests, 9 HTML pages, 120 local links, script syntax, and static build. The installed system Node 18 fails the test wildcard; use the documented Node 22+ prerequisite.
- Local browser verification: homepage rendered; office occasion selection, escaped HTML-like party title, 48-card setting, 4×4 preview (16 cells), all four theme summaries, trivia and scavenger previews, custom-prompt entry, and shuffle changing the preview were exercised. Deselecting all games displayed the expected error and disabled printing.
- Desktop appearance was inspected. A 390×844 viewport was inspected and a DOM width check found no horizontal overflow in that sample. This is partial mobile evidence, not complete mobile QA or iPhone Safari verification.
- Cloudflare's current official setup prompt was fetched. Its 18 skills installed at `C:\Users\Jerem\.agents\skills`; the CLI now lists the global `cloudflare` MCP at the official endpoint. The existing repository declaration was preserved. Newly installed tooling is not exposed in the already-running conversation.
- Account owner completed OAuth; the CLI reported `Successfully logged in`, and `codex mcp list` reports Cloudflare enabled with OAuth. The redundant subsequent login was stopped. Cloudflare tools are absent from this already-running conversation, so a reload is required before usable account access can be verified. The in-app dashboard presented a sign-in screen. Account identity, existing Pages project, Git integration, build settings, deployments, production hostname, deployed commit, custom domain, and environment variables remain **unverified**. No Pages project was created.
- No production URL is known. `PUBLIC_SITE_URL` remains unset; production canonical tags, sitemap, robots, navigation, and 404 behavior remain unverified. Do not substitute an assumed hostname.
- PDF pagination, clipping, blank pages, Letter/A4, high-card-count printing, desktop cross-browser printing, and iPhone Safari remain unverified. Prior CI PDF generation is only smoke evidence.
- Advertising, affiliate links, payments, Search Console, traffic, and revenue remain unconnected/unverified.

### Earlier blocked-state next actions (superseded above)

1. Reload the agent to expose the registered, OAuth-authorized MCP. Confirm authenticated access to the intended account. OAuth itself has completed; do not repeat login unless the connection requires it.
2. Inspect both the existing Workers build integration and Pages resources before creating anything. Resolve the hosting-target mismatch while preserving existing resources; verify Pages Git integration with `JeremyHennessy/PartyPrint`, `main`, `npm run build`, and `dist`.
3. Verify the public production URL and deployed commit, then configure the canonical origin and test the served release.
4. Complete browser and visual PDF QA before feature expansion, indexing submission, or monetization work.

## Product hypothesis
An event organizer finds a free printable game in search, personalizes it without signup, and shares or prints a matching kit. This is a business hypothesis, not proven demand.

## Verify before claiming live
1. GitHub Actions green on exact commit.
2. Actual Cloudflare Pages deployment connected; hostname and production branch verified.
3. Browser and print QA: iPhone Safari, Chromium, Firefox, Letter and A4.
4. Search Console indexing checked on a verified hostname.
5. PartyPrint naming and domain conflicts reviewed.

## First month after deployment
- Week 1: test all game modes and links, submit verified sitemap.
- Weeks 2–4: look at indexed pages and the actual queries bringing traffic, then improve the most useful generator or a relevant original guide.
- Do not create dozens of shallow, automatically varied search pages.

## Revenue
- Ads: after network approval, responsible ad placement and compliant consent, never inside print output.
- Affiliate: only genuinely helpful, disclosed suggestions, not a wall of links.
- Digital downloads: only if evidence of paying demand; require real delivery, payments, refunds and support.
- Measure actual payouts; page RPM examples are illustrations, not estimates.
- Don't invent traffic counters, reviews or testimonials.

## Next product improvements
1. Native direct PDF export only if browser print is painful on iOS.
2. More control over trivia and guest answer pages.
3. Calling cards and multi-round bingo.
4. Better sharing/OG graphics and a verified custom domain.
5. Additional substantial guides selected from actual demand.
