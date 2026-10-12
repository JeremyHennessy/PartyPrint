# Cloudflare agent and Pages setup for PartyPrint

**Checked 2026-10-12** against Cloudflare's [official agent setup prompt](https://developers.cloudflare.com/agent-setup/prompt.md), sourced from [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/agent-setup/prompt.md), its [Codex guide](https://developers.cloudflare.com/agent-setup/codex/), and [Pages Git integration guide](https://developers.cloudflare.com/pages/get-started/git-integration/).

## Current verified repository state

- GitHub repository: `JeremyHennessy/PartyPrint`.
- Source production branch: `main`.
- Baseline as setup began: `e9673833507babc6e631094da6191f3919457766`.
- Existing automated GitHub tests passed; that alone does **not** verify Cloudflare hosting or a public website.
- The static app uses no Cloudflare-specific backend or Wrangler project configuration.
- This repo includes a **project-scoped MCP declaration**, `.codex/config.toml`. It is not a logged-in session.

## 1. Connect Cloudflare to Codex (desktop)

**Recommended for Codex desktop:** open Codex's **Plugins** browser and install the official **Cloudflare** plugin, then complete its OAuth authorization when prompted. This supplies Cloudflare Skills and registered MCP tooling in compatible Codex desktop installations.

**Official CLI alternative** (if you are working in a terminal with Codex installed):

~~~bash
npx -y skills add cloudflare/skills --skill '*' --yes --global
codex mcp list
codex mcp login cloudflare
~~~

The repository's `.codex/config.toml` already registers the Cloudflare endpoint for **trusted-project** Codex sessions. If your Codex installation does not load project-local configuration, register the server once at user level using the additional official command:

~~~bash
codex mcp add cloudflare --url https://mcp.cloudflare.com/mcp
codex mcp login cloudflare
~~~

Verify with `codex mcp list`, and restart/reopen Codex so newly installed skills and MCP connections load. OAuth requires the account owner to sign into Cloudflare and approve the requested permissions in a browser; nothing in this repository can do that on their behalf.

**Do not install both the plugin and a duplicate manual MCP configuration without first checking what Codex already loads.** Do not commit OAuth tokens, API keys, browser cookies or private credentials.

## 2. Connect the existing website to Cloudflare Pages

Once Cloudflare MCP access is authorized, inspect the Cloudflare account for an existing PartyPrint Pages project **before creating anything**. If an appropriate Git-integrated project already exists, preserve it and verify its configuration instead of creating a duplicate.

If the project does not exist:

1. In [Cloudflare dashboard](https://dash.cloudflare.com/), open **Workers & Pages** and create a **Pages** project using **Connect to Git** / **Import an existing Git repository**.
2. Authorize GitHub for `JeremyHennessy/PartyPrint` and choose the existing repository.
3. Use these build settings:

| Setting | Value |
| --- | --- |
| Project name | `partyprint`, if available |
| Production branch | `main` |
| Framework preset | None |
| Root directory | repository root |
| Build command | `npm run build` |
| Output directory | `dist` |

4. Deploy and **confirm** the production deployment and the exact assigned `*.pages.dev` URL from Cloudflare. Do not guess the hostname.
5. Add Pages build environment variable `PUBLIC_SITE_URL` set to the verified HTTPS origin **ending in `/`** (for example: `https://actual-assigned-host.pages.dev/`; replace this example). Rebuild; inspect the generated `sitemap.xml` and canonical tags.
6. Test home page, occasion picker, previews, custom prompts, unique bingo cards, trivia answer key, scavenger hunt, links, and printing using the actual deployed URL. Verify browser printing on desktop and iPhone separately.
7. Connect a domain and Google Search Console only once live and verified. Update `PUBLIC_SITE_URL` if the canonical origin changes.

## 3. Optional Cloudflare CLI (beta)

Cloudflare's prompt marks this as **optional**. Do not install or configure it as part of the base Pages/MCP setup without the account holder choosing to do so.

If enabled later, the official commands are:

~~~bash
npm install -g cf
cf auth login
~~~

For agents that use `cf`, Cloudflare recommends this line in the **user-level** Codex `AGENTS.md`:

> When interacting with Cloudflare, use the cf CLI unless the project has a Wrangler configuration file.

A repository-scoped instruction is already provided in `AGENTS.md` for PartyPrint; it does not change user-level settings for unrelated projects.

## Verification checklist (record evidence, not assumptions)

- [ ] Cloudflare Skills active in the user's Codex installation
- [ ] Cloudflare MCP listed, reachable, and OAuth-authorized
- [ ] Correct Cloudflare account selected
- [ ] Existing Pages projects inspected for PartyPrint
- [ ] GitHub repository + production `main` correctly linked
- [ ] Build settings (`npm run build` and `dist`) match GitHub
- [ ] Exact deployed commit and public URL confirmed
- [ ] Site homepage and generators smoke-tested on live domain
- [ ] Desktop and iOS print/PDF visually checked
- [ ] `PUBLIC_SITE_URL` correct, sitemap and canonicals inspected

**Status on writing this file:** project configuration prepared; personal plugin/Skills installation, MCP login, Cloudflare account access, Pages deployment and live-site verification still require their own evidence. Never mark these checked based only on this README.
