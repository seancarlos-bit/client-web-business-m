# Vanguard ICM: Model Context Protocol (MCP) Architecture & Setup
**Version**: 2.0.0 (Hardened)  
**Server Script**: `mcp_server.py` (Dynamically resolves workspace root)

This MCP server provides a standardized, model-agnostic JSON-RPC 2.0 interface connecting AI assistants (Claude Desktop, Cursor, Antigravity, Claude Code, Hermes) directly to Vanguard Web Studio's Interpretable Context Methodology (ICM) workspace.

---

## 1. Quickest Setup (Automated)

Instead of editing config files manually, run the automated bootstrap script:

```powershell
.\scripts\setup_partner.ps1
```
*(On macOS/Linux: `python3 ./scripts/setup_partner.py`)*

This script automatically:
- Resolves your current repository location dynamically (no hardcoded paths).
- Safely backs up existing client configurations before touching them.
- Merges the `vanguard-icm` entry into your Claude Desktop configuration without disturbing other MCP servers.
- Generates `.cursor/mcp.json`.
- Executes automated self-tests to ensure everything passes.

---

## 2. Manual Configuration (If Preferred)

### For Claude Desktop
Open your Claude configuration file:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add or merge this entry (replace `<PATH_TO_WORKSPACE>` with the absolute path to your cloned folder):
```json
{
  "mcpServers": {
    "vanguard-icm": {
      "command": "python",
      "args": [
        "<PATH_TO_WORKSPACE>/mcp_server.py"
      ]
    }
  }
}
```

### For Cursor
Cursor reads from `.cursor/mcp.json` at the root of the project:
```json
{
  "mcpServers": {
    "vanguard-icm": {
      "command": "python",
      "args": [
        "${workspaceFolder}/mcp_server.py"
      ]
    }
  }
}
```

---

## 3. Tool Manifest Reference

The server exposes 7 core tools:

1. **`get_icm_context`**:
   - *Arguments*: `scope` ("startup", "design", "contracts", "roadmap", "all").
   - *Description*: Loads the foundational markdown packets.
2. **`list_workspace_files`**:
   - *Description*: Returns all files in workspace with SHA256 hashes (excludes `.git`, `dist/`, `.env*`).
3. **`read_workspace_file`**:
   - *Arguments*: `relative_path`.
   - *Description*: Safely reads a file with content SHA256 checksum and size.
4. **`write_workspace_file`**:
   - *Arguments*: `relative_path`, `content`, `expected_sha256` (optional), `allow_protected` (optional).
   - *Description*: Atomic write using temp file replacement. Rejects path traversal and locks protected files (`contracts/**`, `AGENTS.md`, `vercel.json`) unless `allow_protected=true`.
5. **`update_handoff`**:
   - *Arguments*: `status`, `changed`, `checks`, `risks`, `next_action`, `author`.
   - *Description*: Standardized 5-field update of `HANDOFF.md`.
6. **`get_workspace_status`**:
   - *Description*: Reflects current Git branch, HEAD commit, and modified files without shell access.
7. **`export_zip_packet`**:
   - *Arguments*: `output_filename` (optional).
   - *Description*: Packages a clean, denylist-filtered ZIP packet into `backups/`.

---

## 4. Verification

Run the automated verification suite at any time:

```powershell
python .\scripts\verify_mcp.py
```
All 9 automated checks must pass before declaring an environment operational.
