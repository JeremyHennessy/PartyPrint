# Launch and revenue guardrails

## Verified handoff — 2026-10-12

- Latest fetched application main: `26d4c64022a606c064ed8acf1be9d90cd8f438cc`. Repository history and PR search show the two supplied releases; no subsequent application commits were found.
- GitHub Actions [run 38284511030](https://github.com/JeremyHennessy/PartyPrint/actions/runs/38284511030) completed successfully on that exact main commit.
- GitHub's check-runs API separately reports **Workers Builds: partyprint — failure** on that main commit, linking Cloudflare build `615e3d4f-f441-423b-a6a6-fb1f20fc3fdc`. This confirms a Workers build integration signal, not a successful Pages deployment. The build logs and account configuration require authenticated inspection; the failure cause is unknown.
- Fresh checkout: `npm run validate` passed with Node 24.19.0: 16 tests, 9 HTML pages, 120 local links, script syntax, and static build. The installed system Node 18 fails the test wildcard; use the documented Node 22+ prerequisite.
- Local browser verification: homepage rendered; office occasion selection, escaped HTML-like party title, 48-card setting, 4×4 preview (16 cells), all four theme summaries, trivia and scavenger previews, custom-prompt entry, and shuffle changing the preview were exercised. Deselecting all games displayed the expected error and disabled printing.
- Desktop appearance was inspected. A 390×844 viewport was inspected and a DOM width check found no horizontal overflow in that sample. This is partial mobile evidence, not complete mobile QA or iPhone Safari verification.
- Cloudflare's current official setup prompt was fetched. Its 18 skills installed at `C:\Users\Jerem\.agents\skills`; the CLI now lists the global `cloudflare` MCP at the official endpoint. The existing repository declaration was preserved. Newly installed tooling is not exposed in the already-running conversation.
- OAuth was initiated, but no successful authorization or account access has been observed. The dashboard presented a sign-in screen. Account identity, existing Pages project, Git integration, build settings, deployments, production hostname, deployed commit, custom domain, and environment variables remain **unverified**. No Pages project was created.
- No production URL is known. `PUBLIC_SITE_URL` remains unset; production canonical tags, sitemap, robots, navigation, and 404 behavior remain unverified. Do not substitute an assumed hostname.
- PDF pagination, clipping, blank pages, Letter/A4, high-card-count printing, desktop cross-browser printing, and iPhone Safari remain unverified. Prior CI PDF generation is only smoke evidence.
- Advertising, affiliate links, payments, Search Console, traffic, and revenue remain unconnected/unverified.

### Immediate next actions

1. Account owner completes Cloudflare OAuth; reload the agent to expose the registered MCP. Confirm authenticated access to the intended account.
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
