#!/usr/bin/env python3
"""
Vanguard Web Studio — Hardened ICM Model Context Protocol (MCP) Server
======================================================================
Protocol: Model Context Protocol (MCP) JSON-RPC 2.0 over stdio
Root confinement: Bounded to Vanguard workspace directory

Capabilities:
1. get_icm_context: Structured startup & stage routing with automated sync briefing
2. list_workspace_files: Recursive filtered file tree with SHA256 hashes
3. read_workspace_file: Confined read with content hash & size metadata
4. write_workspace_file: Atomic write with SHA256 concurrency check & protected-file gate
5. update_handoff: Standardized 5-field handoff with timestamp & actor tracking (local file write only, no git commit)
6. get_workspace_status: Bounded Git & working tree status reflection (no arbitrary shell)
7. get_sync_status: Safe remote tracking and partner commit detection with live fetch
8. safe_sync_workspace: Automated safe remote fetch and fast-forward pull (no manual sync required)
9. export_zip_packet: Safe, denylist-filtered offline bundle export
"""

from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Workspace root resolved dynamically from this file's physical location
WORKSPACE_ROOT = Path(__file__).resolve().parent

# Hard excluded directories for traversal and zip export
EXCLUDED_DIRS = {
    ".git",
    "dist",
    "node_modules",
    ".vscode",
    ".idea",
    "__pycache__",
    ".continuity",
}

# Hard excluded files
EXCLUDED_FILES = {
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
}

# Protected high-impact files that require explicit allow_protected=True
PROTECTED_PREFIXES = [
    "AGENTS.md",
    "contracts/",
    "contracts\\",
    "vercel.json",
    "netlify.toml",
    "build.ps1",
    ".gitignore",
]


def log_diag(msg: str) -> None:
    """All diagnostics must go to stderr to preserve stdout protocol purity."""
    sys.stderr.write(f"[VANGUARD-MCP] {msg}\n")
    sys.stderr.flush()


def compute_sha256(data: bytes) -> str:
    """Compute hex SHA256 digest of bytes."""
    return hashlib.sha256(data).hexdigest()


def compute_file_sha256(path: Path) -> str:
    """Compute hex SHA256 digest of a file."""
    if not path.exists() or not path.is_file():
        return ""
    h = hashlib.sha256()
    with path.open("rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def is_safe_rel_path(rel_path_str: str) -> Tuple[bool, str, Optional[Path]]:
    """
    Validate that relative path does not escape the workspace root.
    Returns (is_valid, error_message, resolved_path).
    """
    if not rel_path_str or not isinstance(rel_path_str, str):
        return False, "Path must be a non-empty string.", None

    clean_str = rel_path_str.strip().replace("\\", "/")
    
    # Reject obvious traversal indicators
    if clean_str.startswith("/") or clean_str.startswith("../") or "/../" in clean_str or clean_str == "..":
        return False, f"Path traversal attempt rejected: '{rel_path_str}'", None

    # Check for drive letters or UNC paths
    if ":" in clean_str or clean_str.startswith("//"):
        return False, f"Absolute/UNC path rejected: '{rel_path_str}'", None

    target = (WORKSPACE_ROOT / clean_str).resolve()
    root_resolved = WORKSPACE_ROOT.resolve()

    try:
        # Must be equal to or a child of workspace root
        target.relative_to(root_resolved)
    except ValueError:
        return False, f"Resolved target '{target}' escapes workspace root '{root_resolved}'.", None

    return True, "", target


def is_protected_file(rel_path_str: str) -> bool:
    """Check if relative path touches protected control or legal assets."""
    clean = rel_path_str.replace("\\", "/").lstrip("./")
    for prot in PROTECTED_PREFIXES:
        p_clean = prot.replace("\\", "/").rstrip("/")
        if clean == p_clean or clean.startswith(p_clean + "/"):
            return True
    return False


def get_filtered_tree(base_dir: Path) -> List[Dict[str, Any]]:
    """Return filtered list of files in workspace with SHA256 and size."""
    items = []
    root_resolved = base_dir.resolve()
    for root, dirs, files in os.walk(base_dir):
        # Mutate dirs in-place to skip excluded trees
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS and not d.startswith(".")]
        
        for file in files:
            if file in EXCLUDED_FILES or file.endswith(".tmp") or file.endswith(".temp"):
                continue
            # Also exclude secret patterns
            if file.startswith(".env") or file.endswith(".local.json"):
                continue
                
            file_path = Path(root) / file
            try:
                rel_path = file_path.resolve().relative_to(root_resolved)
                stat = file_path.stat()
                items.append({
                    "path": str(rel_path).replace("\\", "/"),
                    "size_bytes": stat.st_size,
                    "sha256": compute_file_sha256(file_path),
                    "modified": datetime.datetime.fromtimestamp(stat.st_mtime).isoformat(),
                })
            except Exception as e:
                log_diag(f"Error inspecting {file_path}: {e}")
                continue

    return sorted(items, key=lambda x: x["path"])


# =====================================================================
# MCP TOOL IMPLEMENTATIONS
# =====================================================================

def tool_safe_sync_workspace(auto_pull: bool = True) -> str:
    """
    Safely synchronizes workspace with remote tracking branch:
    1. Fetches origin.
    2. Inspects ahead/behind and working tree cleanliness.
    3. If clean and behind (and auto_pull is True), fast-forwards automatically via 'git pull --ff-only'.
    4. Returns complete status payload and user-readable briefing.
    """
    git_dir = WORKSPACE_ROOT / ".git"
    if not git_dir.exists():
        return json.dumps({
            "success": False,
            "git_initialized": False,
            "briefing": "Git is not initialized in this workspace yet."
        })

    status_data: Dict[str, Any] = {
        "success": True,
        "git_initialized": True,
        "branch": "unknown",
        "has_remote": False,
        "ahead": 0,
        "behind": 0,
        "diverged": False,
        "pulled": False,
        "dirty_files": [],
        "partner_commits": [],
        "partner_changed_files": [],
        "briefing": ""
    }

    try:
        p_b = subprocess.run(["git", "branch", "--show-current"], cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=3)
        current_branch = p_b.stdout.strip() or "main"
        status_data["branch"] = current_branch

        p_rem = subprocess.run(["git", "remote"], cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=3)
        remotes = [r.strip() for r in p_rem.stdout.splitlines() if r.strip()]
        if not remotes:
            status_data["briefing"] = f"No remote configured yet. Local branch is '{current_branch}'."
            return json.dumps(status_data, indent=2)

        status_data["has_remote"] = True

        p_stat = subprocess.run(["git", "status", "--porcelain"], cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=3)
        dirty = [l.strip() for l in p_stat.stdout.splitlines() if l.strip()]
        status_data["dirty_files"] = dirty

        # Fetch latest origin
        fetch_ok = False
        try:
            p_fetch = subprocess.run(["git", "fetch", "origin"], cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=5)
            fetch_ok = (p_fetch.returncode == 0)
        except Exception:
            fetch_ok = False

        remote_ref = f"origin/{current_branch}"
        p_rev = subprocess.run(
            ["git", "rev-list", "--left-right", "--count", f"{current_branch}...{remote_ref}"],
            cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=3
        )
        if p_rev.returncode == 0:
            parts = p_rev.stdout.strip().split()
            if len(parts) >= 2:
                ahead = int(parts[0])
                behind = int(parts[1])
                status_data["ahead"] = ahead
                status_data["behind"] = behind
                status_data["diverged"] = (ahead > 0 and behind > 0)

        if status_data["behind"] > 0:
            p_log = subprocess.run(
                ["git", "log", f"{current_branch}..{remote_ref}", "--oneline", "-n", "10"],
                cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=3
            )
            if p_log.returncode == 0:
                status_data["partner_commits"] = [c.strip() for c in p_log.stdout.splitlines() if c.strip()]

            p_diff = subprocess.run(
                ["git", "diff", "--name-only", f"{current_branch}..{remote_ref}"],
                cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=3
            )
            if p_diff.returncode == 0:
                status_data["partner_changed_files"] = [f.strip() for f in p_diff.stdout.splitlines() if f.strip()]

        if status_data["diverged"]:
            status_data["briefing"] = f"DIVERGENCE: You are {status_data['ahead']} ahead and {status_data['behind']} behind origin/{current_branch}. Manual merge or review required."
        elif status_data["behind"] > 0:
            if len(dirty) > 0:
                status_data["briefing"] = f"PARTNER COMMITS DETECTED: Partner pushed {status_data['behind']} commit(s), but you have {len(dirty)} uncommitted change(s). Commit or stash your changes before syncing."
            elif auto_pull:
                p_pull = subprocess.run(["git", "pull", "--ff-only", "origin", current_branch], cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=5)
                if p_pull.returncode == 0:
                    status_data["pulled"] = True
                    status_data["behind"] = 0
                    status_data["briefing"] = f"AUTO-SYNCED: Successfully fast-forwarded {len(status_data['partner_commits'])} commit(s) from partner."
                else:
                    status_data["briefing"] = f"FAST-FORWARD FAILED: {p_pull.stderr.strip()}"
            else:
                status_data["briefing"] = f"Partner has {status_data['behind']} new commit(s). Ready to fast-forward."
        elif status_data["ahead"] > 0:
            status_data["briefing"] = f"Ready to push: You have {status_data['ahead']} unpushed commit(s)."
        else:
            status_data["briefing"] = f"Workspace is completely up to date with origin/{current_branch}."

        if not fetch_ok and remotes:
            status_data["briefing"] += " (Origin fetch timed out or offline; inspected local tracking refs)."

    except Exception as exc:
        status_data["error"] = str(exc)
        status_data["success"] = False

    return json.dumps(status_data, indent=2)


def tool_get_icm_context(scope: str = "startup") -> str:
    """
    Reads the appropriate ICM entry documents based on requested scope.
    Scopes: 'startup' (default), 'design', 'contracts', 'roadmap', 'all'.
    Automatically performs a safe sync check and briefs the agent on startup.
    """
    sections = []

    # Automated Sync & Repo Briefing on startup
    if scope in ("startup", "all"):
        try:
            sync_raw = tool_safe_sync_workspace(auto_pull=True)
            sync_json = json.loads(sync_raw)
            briefing = sync_json.get("briefing", "")
            branch = sync_json.get("branch", "unknown")
            pulled = sync_json.get("pulled", False)
            partner_commits = sync_json.get("partner_commits", [])
            
            sync_lines = ["=== AUTOMATED WORKSPACE & SYNC BRIEFING ===", f"Branch: {branch} | {briefing}"]
            if pulled:
                sync_lines.append("Action Taken: Automatically fast-forwarded latest partner changes.")
            if partner_commits:
                sync_lines.append("Recent Partner Commits:\n" + "\n".join(f"  + {c}" for c in partner_commits[:5]))
            sections.append("\n".join(sync_lines))
        except Exception as e:
            log_diag(f"Automated sync check notice: {e}")
    
    # Startup core is always included
    core_files = ["AGENTS.md", "CONTEXT.md", "HANDOFF.md", "COLLABORATION.md"]
    for fname in core_files:
        p = WORKSPACE_ROOT / fname
        if p.exists() and p.is_file():
            sections.append(f"=== {fname} ===\n{p.read_text(encoding='utf-8', errors='replace')}")
        else:
            sections.append(f"=== {fname} ===\n(Not Found)")

    if scope in ("design", "all"):
        p = WORKSPACE_ROOT / "DESIGN.md"
        if p.exists():
            sections.append(f"=== DESIGN.md ===\n{p.read_text(encoding='utf-8', errors='replace')}")

    if scope in ("contracts", "all"):
        for cname in ["web_design_agreement.md", "client_proposal_and_scope_template.md"]:
            p = WORKSPACE_ROOT / "contracts" / cname
            if p.exists():
                sections.append(f"=== contracts/{cname} ===\n{p.read_text(encoding='utf-8', errors='replace')}")

    if scope in ("roadmap", "all"):
        p = WORKSPACE_ROOT / "COMPLETE_ROADMAP_GUIDE.md"
        if p.exists():
            sections.append(f"=== COMPLETE_ROADMAP_GUIDE.md ===\n{p.read_text(encoding='utf-8', errors='replace')}")

    return "\n\n".join(sections)


def tool_list_workspace_files() -> str:
    """Lists all accessible files in the workspace with metadata."""
    tree = get_filtered_tree(WORKSPACE_ROOT)
    return json.dumps({
        "workspace_root": str(WORKSPACE_ROOT),
        "total_files": len(tree),
        "files": tree
    }, indent=2)


def tool_read_workspace_file(relative_path: str) -> str:
    """Safely read a file from the workspace with content hash."""
    is_valid, err_msg, target = is_safe_rel_path(relative_path)
    if not is_valid or target is None:
        return json.dumps({"error": "ACCESS_DENIED", "detail": err_msg})

    if not target.exists():
        return json.dumps({"error": "FILE_NOT_FOUND", "path": relative_path})

    if not target.is_file():
        return json.dumps({"error": "NOT_A_FILE", "path": relative_path})

    try:
        content = target.read_text(encoding="utf-8", errors="replace")
        sha256 = compute_sha256(content.encode("utf-8"))
        return json.dumps({
            "path": relative_path.replace("\\", "/"),
            "size_bytes": len(content.encode("utf-8")),
            "sha256": sha256,
            "content": content
        })
    except Exception as exc:
        return json.dumps({"error": "READ_ERROR", "detail": str(exc)})


def tool_write_workspace_file(
    relative_path: str,
    content: str,
    expected_sha256: Optional[str] = None,
    allow_protected: bool = False
) -> str:
    """
    Atomic write with path validation, protected file gating, and
    optimistic local concurrency checking (expected_sha256).
    """
    is_valid, err_msg, target = is_safe_rel_path(relative_path)
    if not is_valid or target is None:
        return json.dumps({"error": "ACCESS_DENIED", "detail": err_msg})

    # Protected file check
    if is_protected_file(relative_path) and not allow_protected:
        return json.dumps({
            "error": "PROTECTED_FILE_LOCKED",
            "path": relative_path,
            "detail": (
                f"'{relative_path}' is a protected control or legal file. "
                "Writing requires explicit 'allow_protected=True' argument."
            )
        })

    # Concurrency check
    before_sha256 = None
    if target.exists():
        if target.is_dir():
            return json.dumps({"error": "IS_DIRECTORY", "path": relative_path})
        before_sha256 = compute_file_sha256(target)
        if expected_sha256 and before_sha256.lower() != expected_sha256.lower():
            return json.dumps({
                "error": "STALE_VERSION_CONFLICT",
                "path": relative_path,
                "current_sha256": before_sha256,
                "expected_sha256": expected_sha256,
                "detail": (
                    "File has been modified since it was last read. "
                    "Re-read the file before attempting to write."
                )
            })

    # Atomic write pattern: write to temp file in target's directory, then replace
    try:
        target.parent.mkdir(parents=True, exist_ok=True)
        temp_fd, temp_path_str = tempfile.mkstemp(
            prefix=".vanguard_tmp_",
            dir=str(target.parent)
        )
        temp_path = Path(temp_path_str)
        try:
            with os.fdopen(temp_fd, "w", encoding="utf-8", newline="\n") as f:
                f.write(content)
                f.flush()
                os.fsync(f.fileno())

            # Atomic replace
            os.replace(temp_path, target)
        except Exception:
            if temp_path.exists():
                temp_path.unlink()
            raise

        after_sha256 = compute_file_sha256(target)
        return json.dumps({
            "success": True,
            "path": relative_path.replace("\\", "/"),
            "bytes_written": len(content.encode("utf-8")),
            "before_sha256": before_sha256,
            "after_sha256": after_sha256,
            "timestamp": datetime.datetime.now().isoformat()
        })
    except Exception as exc:
        return json.dumps({"error": "WRITE_FAILED", "detail": str(exc)})


def tool_update_handoff(
    status: str,
    changed: List[str],
    checks: str,
    risks: str,
    next_action: str,
    author: Optional[str] = None
) -> str:
    """Standardized 5-field atomic write to HANDOFF.md locally (does not execute Git commands)."""
    handoff_path = WORKSPACE_ROOT / "HANDOFF.md"
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    actor_line = f"**Author / Agent**: `{author}`  \n" if author else ""

    # Fetch current git branch if possible
    git_status = get_git_info()
    branch_line = f"**Branch**: `{git_status.get('branch', 'unknown')}`  \n"

    changed_list = "\n".join(f"- `{c}`" for c in changed) if changed else "- None recorded"

    content = f"""# Vanguard Web Studio: Handoff
Last updated: {timestamp}  
{actor_line}{branch_line}
## Status
`{status}`

## Changed
{changed_list}

## Checks
{checks}

## Risks / Assumptions
{risks}

## Next Action
{next_action}
"""
    return tool_write_workspace_file(
        relative_path="HANDOFF.md",
        content=content,
        allow_protected=True
    )


def get_git_info() -> Dict[str, Any]:
    """Inspect Git state safely without arbitrary shell commands."""
    git_dir = WORKSPACE_ROOT / ".git"
    if not git_dir.exists():
        return {
            "initialized": False,
            "branch": "none",
            "head": "uninitialized",
            "clean": True,
            "modified_files": []
        }

    info: Dict[str, Any] = {
        "initialized": True,
        "branch": "unknown",
        "head": "unknown",
        "clean": True,
        "modified_files": []
    }

    try:
        # 1. Branch name
        p_branch = subprocess.run(
            ["git", "branch", "--show-current"],
            cwd=str(WORKSPACE_ROOT),
            capture_output=True,
            text=True,
            timeout=3
        )
        if p_branch.returncode == 0 and p_branch.stdout.strip():
            info["branch"] = p_branch.stdout.strip()

        # 2. HEAD commit
        p_head = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=str(WORKSPACE_ROOT),
            capture_output=True,
            text=True,
            timeout=3
        )
        if p_head.returncode == 0 and p_head.stdout.strip():
            info["head"] = p_head.stdout.strip()

        # 3. Status porcelain
        p_status = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=str(WORKSPACE_ROOT),
            capture_output=True,
            text=True,
            timeout=3
        )
        if p_status.returncode == 0:
            lines = [l.strip() for l in p_status.stdout.splitlines() if l.strip()]
            info["modified_files"] = lines
            info["clean"] = (len(lines) == 0)

    except Exception as exc:
        info["error"] = str(exc)

    return info


def tool_get_workspace_status() -> str:
    """Returns working tree state and Git metadata."""
    git_info = get_git_info()
    handoff_path = WORKSPACE_ROOT / "HANDOFF.md"
    handoff_summary = "Missing"
    if handoff_path.exists():
        for line in handoff_path.read_text(encoding="utf-8", errors="replace").splitlines():
            if line.startswith("`") and line.endswith("`"):
                handoff_summary = line.strip("`")
                break

    return json.dumps({
        "workspace_root": str(WORKSPACE_ROOT),
        "timestamp": datetime.datetime.now().isoformat(),
        "current_handoff_status": handoff_summary,
        "git": git_info
    }, indent=2)


def tool_get_sync_status(fetch_remote: bool = True) -> str:
    """
    Checks local working tree and remote tracking branch to summarize
    ahead/behind status, uncommitted local edits, and partner commits since last sync.
    Optionally fetches origin first for live accuracy.
    """
    git_dir = WORKSPACE_ROOT / ".git"
    if not git_dir.exists():
        return json.dumps({
            "git_initialized": False,
            "briefing": "Git is not initialized in this workspace yet."
        })

    status_data: Dict[str, Any] = {
        "git_initialized": True,
        "branch": "unknown",
        "has_remote": False,
        "ahead": 0,
        "behind": 0,
        "diverged": False,
        "dirty_files": [],
        "partner_commits": [],
        "partner_changed_files": [],
        "safe_to_sync": True,
        "briefing": ""
    }

    try:
        p_b = subprocess.run(["git", "branch", "--show-current"], cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=3)
        current_branch = p_b.stdout.strip() or "main"
        status_data["branch"] = current_branch

        p_rem = subprocess.run(["git", "remote"], cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=3)
        remotes = [r.strip() for r in p_rem.stdout.splitlines() if r.strip()]
        if not remotes:
            status_data["briefing"] = f"No remote configured yet. Local branch is '{current_branch}'."
            return json.dumps(status_data, indent=2)

        status_data["has_remote"] = True

        p_stat = subprocess.run(["git", "status", "--porcelain"], cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=3)
        dirty = [l.strip() for l in p_stat.stdout.splitlines() if l.strip()]
        status_data["dirty_files"] = dirty

        if fetch_remote:
            try:
                subprocess.run(["git", "fetch", "origin"], cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=4)
            except Exception:
                pass

        remote_ref = f"origin/{current_branch}"
        p_rev = subprocess.run(
            ["git", "rev-list", "--left-right", "--count", f"{current_branch}...{remote_ref}"],
            cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=3
        )
        if p_rev.returncode == 0:
            parts = p_rev.stdout.strip().split()
            if len(parts) >= 2:
                ahead = int(parts[0])
                behind = int(parts[1])
                status_data["ahead"] = ahead
                status_data["behind"] = behind
                status_data["diverged"] = (ahead > 0 and behind > 0)

        if status_data["behind"] > 0:
            p_log = subprocess.run(
                ["git", "log", f"{current_branch}..{remote_ref}", "--oneline", "-n", "10"],
                cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=3
            )
            if p_log.returncode == 0:
                status_data["partner_commits"] = [c.strip() for c in p_log.stdout.splitlines() if c.strip()]

            p_diff = subprocess.run(
                ["git", "diff", "--name-only", f"{current_branch}..{remote_ref}"],
                cwd=str(WORKSPACE_ROOT), capture_output=True, text=True, timeout=3
            )
            if p_diff.returncode == 0:
                status_data["partner_changed_files"] = [f.strip() for f in p_diff.stdout.splitlines() if f.strip()]

        if status_data["diverged"]:
            status_data["safe_to_sync"] = False
            status_data["briefing"] = f"WARNING: Branch has diverged (Ahead: {status_data['ahead']}, Behind: {status_data['behind']}). Run sync_session.py or resolve manually."
        elif status_data["behind"] > 0:
            status_data["safe_to_sync"] = (len(dirty) == 0)
            status_data["briefing"] = f"Partner has {status_data['behind']} new commit(s). Safe to fast-forward."
        elif status_data["ahead"] > 0:
            status_data["briefing"] = f"You are ahead by {status_data['ahead']} commit(s). Ready to push."
        else:
            status_data["briefing"] = "Workspace is in sync with origin."

    except Exception as exc:
        status_data["error"] = str(exc)

    return json.dumps(status_data, indent=2)


def tool_export_zip_packet(output_filename: Optional[str] = None) -> str:
    """
    Package workspace into a clean, denylist-filtered ZIP packet.
    Saved to backups/ directory or parent folder.
    """
    if not output_filename:
        datestr = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"vanguard-packet-{datestr}.zip"

    # Sanitize output filename
    output_filename = Path(output_filename).name
    if not output_filename.endswith(".zip"):
        output_filename += ".zip"

    # Save to backups directory within workspace
    backup_dir = WORKSPACE_ROOT / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    out_path = backup_dir / output_filename

    archived_files = []
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(WORKSPACE_ROOT):
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS and d != "backups" and not d.startswith(".")]
            
            for file in files:
                if file in EXCLUDED_FILES or file.endswith(".tmp") or file.endswith(".zip"):
                    continue
                if file.startswith(".env") or file.endswith(".local.json"):
                    continue

                full_path = Path(root) / file
                arcname = full_path.resolve().relative_to(WORKSPACE_ROOT.resolve())
                zf.write(full_path, arcname=str(arcname).replace("\\", "/"))
                archived_files.append(str(arcname))

    stat = out_path.stat()
    return json.dumps({
        "success": True,
        "archive_path": str(out_path).replace("\\", "/"),
        "total_files": len(archived_files),
        "size_bytes": stat.st_size,
        "sha256": compute_file_sha256(out_path)
    }, indent=2)


# =====================================================================
# MCP PROTOCOL SPECIFICATION & DISPATCH
# =====================================================================

TOOLS_MANIFEST = [
    {
        "name": "get_icm_context",
        "description": "Loads Vanguard ICM documentation (AGENTS.md, CONTEXT.md, HANDOFF.md, COLLABORATION.md) with automated sync check. Call this first at session start.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "scope": {
                    "type": "string",
                    "enum": ["startup", "design", "contracts", "roadmap", "all"],
                    "description": "Context scope to load (default: 'startup')"
                }
            },
            "required": []
        }
    },
    {
        "name": "list_workspace_files",
        "description": "Lists all accessible workspace files with path, size, and SHA256 hashes (excludes .git, dist, and private caches).",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "read_workspace_file",
        "description": "Safely reads any workspace file. Returns content, byte size, and SHA256 checksum.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "relative_path": {
                    "type": "string",
                    "description": "Path relative to workspace root (e.g. 'DESIGN.md', 'demos/dental/index.html')"
                }
            },
            "required": ["relative_path"]
        }
    },
    {
        "name": "write_workspace_file",
        "description": "Atomic write with path containment, protected file locks, and optimistic local concurrency check (expected_sha256).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "relative_path": {
                    "type": "string",
                    "description": "Path relative to workspace root"
                },
                "content": {
                    "type": "string",
                    "description": "File text content"
                },
                "expected_sha256": {
                    "type": "string",
                    "description": "Optional current file SHA256 to prevent overwriting newer concurrent work"
                },
                "allow_protected": {
                    "type": "boolean",
                    "description": "Set true only when deliberately editing protected files (contracts, AGENTS, build scripts)"
                }
            },
            "required": ["relative_path", "content"]
        }
    },
    {
        "name": "update_handoff",
        "description": "Writes canonical HANDOFF.md with standard 5 fields (Status, Changed, Checks, Risks, Next Action). Does NOT execute git commits.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "status": {"type": "string", "description": "Current status tag"},
                "changed": {"type": "array", "items": {"type": "string"}, "description": "List of changed files"},
                "checks": {"type": "string", "description": "Verification checks performed"},
                "risks": {"type": "string", "description": "Risks, assumptions, or blockers"},
                "next_action": {"type": "string", "description": "Exactly one concrete next action"},
                "author": {"type": "string", "description": "Partner or agent name"}
            },
            "required": ["status", "changed", "checks", "risks", "next_action"]
        }
    },
    {
        "name": "get_workspace_status",
        "description": "Returns current Git branch, HEAD commit, modified/untracked files, and current handoff status.",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "get_sync_status",
        "description": "Checks local Git branch vs remote tracking branch to summarize ahead/behind status, uncommitted local edits, and partner commits since last sync.",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "safe_sync_workspace",
        "description": "Automatically fetches origin and fast-forwards local branch if clean and behind. Returns detailed status of partner changes.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "auto_pull": {
                    "type": "boolean",
                    "description": "Whether to automatically fast-forward if safe (default: true)"
                }
            },
            "required": []
        }
    },
    {
        "name": "export_zip_packet",
        "description": "Packages clean workspace into an offline ZIP packet (excludes .git, dist, and secrets).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "output_filename": {
                    "type": "string",
                    "description": "Optional custom filename for exported archive"
                }
            },
            "required": []
        }
    }
]


class StdioMcpServer:
    """Protocol-compliant MCP JSON-RPC 2.0 stdio server."""

    def __init__(self):
        self.running = True

    def run(self):
        log_diag(f"Server started. Confined to {WORKSPACE_ROOT}")
        while self.running:
            try:
                line = sys.stdin.readline()
                if not line:
                    break
                line = line.strip()
                if not line:
                    continue

                request = json.loads(line)
                response = self.handle_request(request)
                if response is not None:
                    out = json.dumps(response)
                    sys.stdout.write(out + "\n")
                    sys.stdout.flush()
            except json.JSONDecodeError as jde:
                log_diag(f"Malformed JSON received: {jde}")
            except Exception as exc:
                log_diag(f"Runtime error: {exc}")

    def handle_request(self, req: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        req_id = req.get("id")
        method = req.get("method")
        params = req.get("params", {})

        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {
                        "tools": {},
                        "resources": {}
                    },
                    "serverInfo": {
                        "name": "vanguard-icm",
                        "version": "2.1.0"
                    }
                }
            }

        if method in ("notifications/initialized", "initialized"):
            return None

        if method == "ping":
            return {"jsonrpc": "2.0", "id": req_id, "result": {}}

        if method == "tools/list":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {"tools": TOOLS_MANIFEST}
            }

        if method == "tools/call":
            tool_name = params.get("name")
            arguments = params.get("arguments", {})
            result_str = self.dispatch_tool(tool_name, arguments)
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": result_str
                        }
                    ]
                }
            }

        if method == "resources/list":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "resources": [
                        {"uri": "icm://startup", "name": "Startup Context", "mimeType": "text/markdown"},
                        {"uri": "icm://design", "name": "Design Token Spec", "mimeType": "text/markdown"},
                        {"uri": "icm://handoff", "name": "Current Handoff State", "mimeType": "text/markdown"}
                    ]
                }
            }

        if method == "resources/read":
            uri = params.get("uri", "")
            if uri == "icm://startup":
                text = tool_get_icm_context("startup")
            elif uri == "icm://design":
                text = tool_get_icm_context("design")
            elif uri == "icm://handoff":
                text = (WORKSPACE_ROOT / "HANDOFF.md").read_text(encoding="utf-8", errors="replace")
            else:
                text = f"Unknown resource: {uri}"

            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "contents": [{"uri": uri, "mimeType": "text/markdown", "text": text}]
                }
            }

        if req_id is not None:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32601, "message": f"Method not found: {method}"}
            }
        return None

    def dispatch_tool(self, name: str, args: Dict[str, Any]) -> str:
        if name == "get_icm_context":
            return tool_get_icm_context(args.get("scope", "startup"))
        elif name == "list_workspace_files":
            return tool_list_workspace_files()
        elif name == "read_workspace_file":
            return tool_read_workspace_file(args.get("relative_path", ""))
        elif name == "write_workspace_file":
            return tool_write_workspace_file(
                relative_path=args.get("relative_path", ""),
                content=args.get("content", ""),
                expected_sha256=args.get("expected_sha256"),
                allow_protected=bool(args.get("allow_protected", False))
            )
        elif name == "update_handoff":
            return tool_update_handoff(
                status=args.get("status", "IN_PROGRESS"),
                changed=args.get("changed", []),
                checks=args.get("checks", ""),
                risks=args.get("risks", ""),
                next_action=args.get("next_action", ""),
                author=args.get("author")
            )
        elif name == "get_workspace_status":
            return tool_get_workspace_status()
        elif name == "get_sync_status":
            return tool_get_sync_status()
        elif name == "safe_sync_workspace":
            return tool_safe_sync_workspace(
                auto_pull=bool(args.get("auto_pull", True))
            )
        elif name == "export_zip_packet":
            return tool_export_zip_packet(args.get("output_filename"))
        else:
            return json.dumps({"error": f"Unknown tool: '{name}'"})


# =====================================================================
# IN-PROCESS SELF TEST
# =====================================================================

def run_self_test() -> bool:
    """Execute complete internal test suite."""
    log_diag("Executing internal MCP self-test...")
    all_passed = True

    # 1. Test context extraction
    ctx = tool_get_icm_context("startup")
    if "=== AGENTS.md ===" in ctx and "=== HANDOFF.md ===" in ctx:
        log_diag("[PASS] Context extraction contains startup trio.")
    else:
        log_diag("[FAIL] Context extraction missing expected headers.")
        all_passed = False

    # 2. Test file listing
    files_json = json.loads(tool_list_workspace_files())
    if files_json.get("total_files", 0) > 0:
        log_diag(f"[PASS] File tree discovered {files_json['total_files']} files.")
    else:
        log_diag("[FAIL] File tree returned 0 files.")
        all_passed = False

    # 3. Test path traversal rejection
    traversal_res = json.loads(tool_read_workspace_file("../../escaped.txt"))
    if traversal_res.get("error") == "ACCESS_DENIED":
        log_diag("[PASS] Traversal attempt correctly rejected.")
    else:
        log_diag("[FAIL] Traversal attempt was not rejected!")
        all_passed = False

    # 4. Test protected file gate
    prot_res = json.loads(tool_write_workspace_file("contracts/test_prot.md", "bad", allow_protected=False))
    if prot_res.get("error") == "PROTECTED_FILE_LOCKED":
        log_diag("[PASS] Protected file write locked without explicit override.")
    else:
        log_diag("[FAIL] Protected file write was not locked!")
        all_passed = False

    # 5. Test atomic write & expected_sha256 check
    test_rel = "temp_self_test.txt"
    test_content_1 = "vanguard-test-1"
    w1 = json.loads(tool_write_workspace_file(test_rel, test_content_1))
    if w1.get("success"):
        log_diag("[PASS] Atomic write created test file.")
    else:
        log_diag(f"[FAIL] Atomic write failed: {w1}")
        all_passed = False

    # Concurrency collision check
    w2_bad = json.loads(tool_write_workspace_file(test_rel, "vanguard-test-2", expected_sha256="wrong_hash"))
    if w2_bad.get("error") == "STALE_VERSION_CONFLICT":
        log_diag("[PASS] Stale version conflict correctly triggered.")
    else:
        log_diag("[FAIL] Stale version conflict failed to trigger!")
        all_passed = False

    # Clean up test file
    test_target = WORKSPACE_ROOT / test_rel
    if test_target.exists():
        test_target.unlink()

    # 6. Test Git info
    g_info = get_git_info()
    log_diag(f"[PASS] Git status check executed (initialized: {g_info.get('initialized')}).")

    # 7. Test Sync status
    s_info = json.loads(tool_get_sync_status())
    log_diag(f"[PASS] Sync status check executed (git_initialized: {s_info.get('git_initialized')}).")

    # 8. Test Safe Sync workspace
    s_sync = json.loads(tool_safe_sync_workspace(auto_pull=False))
    if "git_initialized" in s_sync:
        log_diag(f"[PASS] Safe sync workspace check executed (branch: {s_sync.get('branch')}).")
    else:
        log_diag(f"[FAIL] Safe sync workspace check failed: {s_sync}")
        all_passed = False

    return all_passed


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Vanguard ICM MCP Server")
    parser.add_argument("--test", action="store_true", help="Run automated self-tests and exit")
    args = parser.parse_args()

    if args.test:
        success = run_self_test()
        sys.exit(0 if success else 1)

    server = StdioMcpServer()
    server.run()
