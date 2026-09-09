# Vanguard Web Studio — Gemini / Antigravity Instruction Router

This workspace uses the Interpretable Context Methodology (ICM). All authoritative knowledge lives in plain markdown files.

## Startup Protocol
At the beginning of every session:
1. Call MCP tool `get_icm_context` (or read [`AGENTS.md`](file:///AGENTS.md), [`CONTEXT.md`](file:///CONTEXT.md), [`HANDOFF.md`](file:///HANDOFF.md)).
   *Note: `get_icm_context` automatically fetches and synchronizes partner commits if safe.*
2. Resume strictly from the **Next Action** defined in [`HANDOFF.md`](file:///HANDOFF.md).
3. Do not load specialized contracts or demos unless the user's specific prompt requires them.

## Safety & Collaboration Rules
- Work in short-lived feature branches (`feature/<topic>`) for all code, demo, or configuration edits.
- Use MCP tool `write_workspace_file` with `expected_sha256` to prevent race conditions with your partner.
- Conclude sessions by calling `update_handoff` to record your changes and hand off the baton.

## Mandatory Commit Guidance
Whenever you create or modify files, you MUST conclude your response with the exact copy-paste PowerShell commands:
1. `git switch -c feature/<topic>` (if not already on a feature branch)
2. `git add <changed-files>`
3. `git commit -m "<type>(<scope>): <clear description>"`
4. `git push -u origin feature/<topic>`
5. The direct GitHub PR link: `https://github.com/Hanzam14/client-web-business/pull/new/feature/<topic>`
Never leave Git commands to user guesswork.
