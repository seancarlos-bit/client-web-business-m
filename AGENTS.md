# Client Web Business & Vibe Coding Studio

This project is the operational agency hub for designing, vibecoding, legally protecting, and selling client websites and micro-SaaS web assets.

## Day-one execution

Start in the declared working directory, read `AGENTS.md -> CONTEXT.md -> HANDOFF.md`. Design specifications, contract templates, and client demos are safe to inspect and edit locally; purchases, external domain deployment, financial transactions, and credential access require separate confirmation.

<!-- ICM_EXECUTION_START -->
```json
{
  "schema_version": 1,
  "project_id": "client-web-business",
  "cwd": "C:\\Projects\\client-web-business",
  "persistence": "local",
  "privacy": "standard",
  "permission_class": "read-test",
  "write_policy": "A direct task authorizes ordinary reversible website design, copywriting, template customization, and contract preparation. Live client deployment and financial transactions require separate confirmation."
}
```
<!-- ICM_EXECUTION_END -->

## Shared quality loop

For every task: define the target, intended result, non-goals, authority, and success check; inspect only the startup chain and current stage inputs; make the smallest reversible change in the authoritative home; run the declared checks and inspect the diff and outputs; then hand off changed files, check results, assumptions, risks, unresolved items, and the exact next action.

Before calling a task complete, report `Status`, `Changed`, `Checks`, `Risks/assumptions`, and `Next action`.

## Automated Sync & Session Startup

All agents connecting via MCP automatically fetch and sync partner changes on startup via `get_icm_context` and `safe_sync_workspace`. Manual syncing via `python .\scripts\sync_session.py` is available as a standalone fallback, but agents handle sync checks automatically without requiring user manual intervention.

## Mandatory Git Commit & PR Guidance

Whenever an agent creates, modifies, or deletes files in this repository, the agent MUST conclude its response with the exact, copy-paste PowerShell commands so the user never has to guess:
```powershell
# 1. Switch to or create a feature branch
git switch -c feature/<short-topic>
# 2. Stage the modified files
git add <file-1> <file-2>
# 3. Commit with a clear conventional commit message
git commit -m "<type>(<scope>): <clear description>"
# 4. Push to remote
git push -u origin feature/<short-topic>
```
Followed by the direct URL to open the Pull Request:
`https://github.com/Hanzam14/client-web-business/pull/new/feature/<short-topic>`
Agents must NEVER say "now commit your changes" without providing the exact executable commands.

## Start here

1. Read `CONTEXT.md` to understand the current agency assets, demo roster, and client pipeline.
2. Read `HANDOFF.md` to resume current work.
3. Read `DESIGN.md` for the machine-readable design token specification before generating new UI code.
4. Use `contracts/web_design_agreement.md` for client onboarding and legal protection.

## JVC route entry

- Project ID: `client-web-business`
- Aliases: `client-web-business`, `web agency`, `vibe coding`, `client sites`, `web studio`, `vanguard web`
- Absolute route: `C:\Projects\client-web-business`
- Central registry: `C:\Projects\JVC\references\PROJECT_ROUTES.md`

## Routing

| Task | Stage | Read |
|---|---|---|
| Review agency contracts & proposal sheets | `contracts/` | `contracts/web_design_agreement.md`, `contracts/client_proposal_and_scope_template.md` |
| Vibecode new niche demo or customize theme | `demos/` | `DESIGN.md`, target demo `index.html` |
| Execute cold outreach & sales pipeline | `operations` | `COMPLETE_ROADMAP_GUIDE.md`, `README.md` |
| Prepare micro-SaaS asset sale or exit | `valuation` | `VIBECODED_SAAS_EXIT_PLAYBOOK.md` |

## Project boundary

This project contains frontend templates, legal agreements, operations playbooks, and design token contracts. It does not store live client payment credentials, unauthorized copyrighted assets, or unverified customer data.
