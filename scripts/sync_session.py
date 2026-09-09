#!/usr/bin/env python3
"""
Vanguard Web Studio — Safe Session Synchronization Tool
========================================================
Replaces blind 'git pull' with a safe, verified start-of-session routine:
1. Inspects local uncommitted working tree
2. Fetches origin without merging
3. Analyzes partner commits and changed files
4. Reports overlap / divergence briefing
5. Executes safe fast-forward pull (git pull --ff-only)
6. Extracts and displays current Next Action from HANDOFF.md
"""

import subprocess
import sys
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent


def run_git(args: list[str], check: bool = False) -> subprocess.CompletedProcess[str]:
    """Run a bounded git command within workspace root."""
    return subprocess.run(
        ["git"] + args,
        cwd=str(WORKSPACE_ROOT),
        capture_output=True,
        text=True,
        check=check
    )


def print_step(msg: str):
    print(f"[*] {msg}")


def print_success(msg: str):
    print(f"[SUCCESS] {msg}")


def print_warning(msg: str):
    print(f"[WARNING] {msg}")


def print_error(msg: str):
    print(f"[ERROR] {msg}")


def sync():
    print("=================================================================")
    print("      VANGUARD WEB STUDIO — SAFE SESSION SYNCHRONIZATION")
    print("=================================================================")
    print(f"Workspace: {WORKSPACE_ROOT}\n")

    # 1. Check if git is initialized
    git_dir = WORKSPACE_ROOT / ".git"
    if not git_dir.exists():
        print_error("Git is not initialized in this workspace yet.")
        print("Run baseline setup first before synchronizing.")
        sys.exit(1)

    # 2. Get current branch
    p_branch = run_git(["branch", "--show-current"])
    current_branch = p_branch.stdout.strip()
    if not current_branch:
        current_branch = "main"
    print_step(f"Current local branch: '{current_branch}'")

    # 3. Check for uncommitted changes
    p_status = run_git(["status", "--porcelain"])
    dirty_lines = [l.strip() for l in p_status.stdout.splitlines() if l.strip()]
    if dirty_lines:
        print_warning(f"You have {len(dirty_lines)} uncommitted file(s) in your working tree:")
        for line in dirty_lines[:5]:
            print(f"      {line}")
        if len(dirty_lines) > 5:
            print(f"      ... and {len(dirty_lines) - 5} more")

    # 4. Check for remote
    p_rem = run_git(["remote"])
    remotes = [r.strip() for r in p_rem.stdout.splitlines() if r.strip()]
    if not remotes:
        print_warning("No Git remote ('origin') configured yet.")
        print("Working in standalone local mode. Zero remote divergence.")
        show_handoff_briefing()
        sys.exit(0)

    # 5. Fetch origin
    print_step("Fetching latest changes from origin...")
    p_fetch = run_git(["fetch", "origin"])
    if p_fetch.returncode != 0:
        print_warning(f"Could not reach remote 'origin': {p_fetch.stderr.strip()}")
        print("Continuing with local state.")
        show_handoff_briefing()
        sys.exit(0)

    remote_ref = f"origin/{current_branch}"

    # 6. Check ahead / behind counts
    p_rev = run_git(["rev-list", "--left-right", "--count", f"{current_branch}...{remote_ref}"])
    if p_rev.returncode != 0:
        print_warning(f"Remote tracking branch '{remote_ref}' not found yet. Push local branch first.")
        show_handoff_briefing()
        sys.exit(0)

    parts = p_rev.stdout.strip().split()
    ahead = int(parts[0]) if len(parts) >= 1 else 0
    behind = int(parts[1]) if len(parts) >= 2 else 0

    print("-----------------------------------------------------------------")
    # Case A: Diverged
    if ahead > 0 and behind > 0:
        print_error(f"DIVERGENCE DETECTED: You are {ahead} commit(s) ahead and {behind} commit(s) behind '{remote_ref}'.")
        print("Do not blind-pull. Review incoming commits and merge carefully.")
        sys.exit(1)

    # Case B: Behind (Partner has new work)
    elif behind > 0:
        print_step(f"Partner pushed {behind} new commit(s):")
        p_log = run_git(["log", "--oneline", f"{current_branch}..{remote_ref}", "-n", "5"])
        for c in p_log.stdout.splitlines():
            print(f"      + {c}")

        p_diff = run_git(["diff", "--name-only", f"{current_branch}..{remote_ref}"])
        changed_files = [f for f in p_diff.stdout.splitlines() if f]
        print(f"      Files modified by partner ({len(changed_files)}):")
        for f in changed_files[:6]:
            print(f"        • {f}")

        # Check for uncommitted conflict hazard
        if dirty_lines:
            print_error("Cannot fast-forward safely: you have uncommitted local changes that might collide.")
            print("Action required: Commit your work to a feature branch or stash it, then re-run sync.")
            sys.exit(1)

        # Safe fast-forward pull
        print_step("Executing safe fast-forward synchronization (git pull --ff-only)...")
        p_pull = run_git(["pull", "--ff-only", "origin", current_branch])
        if p_pull.returncode == 0:
            print_success("Synchronized successfully with origin.")
        else:
            print_error(f"Fast-forward failed: {p_pull.stderr.strip()}")
            sys.exit(1)

    # Case C: Ahead
    elif ahead > 0:
        print_step(f"You have {ahead} local commit(s) ready to push to origin/{current_branch}.")

    # Case D: Up to date
    else:
        print_success(f"Workspace is completely up to date with origin/{current_branch}.")

    print("-----------------------------------------------------------------")
    show_handoff_briefing()


def show_handoff_briefing():
    """Extract and display the 30-second briefing from HANDOFF.md."""
    handoff_file = WORKSPACE_ROOT / "HANDOFF.md"
    if not handoff_file.exists():
        print("[HANDOFF] HANDOFF.md not found.")
        return

    content = handoff_file.read_text(encoding="utf-8", errors="replace")
    status = "Unknown"
    next_action = "Not specified"

    lines = content.splitlines()
    in_next_action = False
    next_lines = []

    for i, line in enumerate(lines):
        if line.strip().startswith("## Status"):
            for sub in lines[i+1:i+4]:
                if sub.strip():
                    status = sub.strip("` ")
                    break
        elif line.strip().startswith("## Next Action"):
            in_next_action = True
            continue
        elif in_next_action:
            if line.strip().startswith("##"):
                break
            if line.strip():
                next_lines.append(line.strip())

    if next_lines:
        next_action = " ".join(next_lines)

    print("\n📋 30-SECOND VANGUARD BRIEFING:")
    print(f"   • Current Status:  {status}")
    print(f"   • Next Action:     {next_action}\n")
    print("Ready to start your work session.")


if __name__ == "__main__":
    sync()
