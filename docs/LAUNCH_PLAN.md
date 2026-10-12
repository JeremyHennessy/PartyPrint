# Launch and revenue guardrails

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
