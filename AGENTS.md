# PartyPrint project instructions for coding agents

## Verified baseline and change control
- The PartyPrint static website was first released to `main` at commit `e9673833507babc6e631094da6191f3919457766` (2026-10-12). Preserve approved visuals, browser print functionality, generated content, and existing tests unless a requested change actually requires modifying them.
- Before changing code or infrastructure, inspect current `main`, open pull requests, GitHub Actions, and the Cloudflare deployment (if authorized). Use the smallest reversible change; never infer production success from a green build alone.
- Do not add tracking, advertising scripts, payment providers, libraries, redesigns, or access policy changes as part of a Cloudflare connectivity fix.

## Cloudflare: access and deployment
- The project is a **static Cloudflare Pages** app, with source in GitHub. Build command: `npm run build`; output: `dist`; production branch: `main`. No framework, Workers backend, API token, or Wrangler configuration is required for the current deployment architecture.
- `.codex/config.toml` declares Cloudflare's OAuth-based MCP endpoint for trusted Codex project sessions. **A file in Git does not itself install Cloudflare Skills, connect the MCP in this ChatGPT conversation, or authenticate the account.** Follow `docs/CLOUDFLARE_AGENT_SETUP.md` and the official Cloudflare setup guide.
- For authenticated Cloudflare account operations, prefer the official Cloudflare MCP. If the user separately installs the beta `cf` CLI and no Wrangler configuration is present, prefer `cf` for CLI operations; otherwise use the tool actually available. Never request, create, store, or print long-lived account API tokens for basic Git-integrated Pages deployment.
- **Do not create a second Pages project** before discovering whether `PartyPrint` is already connected and deployed. Compare production branch, source repo, build command, output directory, canonical domain, and deployed commit before modifying existing resources.
- Use Git integration for deployments whenever available. Do not silently switch an existing Pages project to Direct Upload or create an independent GitHub Actions deployment workflow.
- Set `PUBLIC_SITE_URL` only after obtaining a **verified live production hostname**. Run a build and confirm canonical URLs and sitemap reflect that exact origin.
- Deployment is only confirmed after observing a real Cloudflare deployment status and checking the served URL. Verify print output on desktop and iOS separately; don't call Chromium smoke tests cross-browser proof.

## Security and credentials
- Never put Cloudflare credentials, cookies, OAuth tokens, API keys or DNS provider secrets in commits, logs, markdown, screenshots, issue bodies or PRs.
- Cloudflare OAuth authorization belongs to the account holder. Respect permissions and report any connection or verification blockers explicitly.
