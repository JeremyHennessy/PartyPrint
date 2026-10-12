# Launch and revenue guardrails

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
