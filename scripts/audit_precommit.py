#!/usr/bin/env python3
"""
Vanguard Web Studio — Pre-Commit & Pre-Publish Security Audit
============================================================
Runs before baseline commit or git push to guarantee repository hygiene:
1. Secret & Token Detection (OpenAI, Anthropic, Stripe, AWS, GitHub)
2. Machine-Specific Path Detection (e.g. C:\\Users\\<username>\\...)
3. Exclusion Audit (Ensures .gitignore covers dist/, backups/, *.zip, .env*)
4. Build & Cache Artifact Detection (no .tmp, .log, .zip, .pyc tracked)
"""

import os
import re
import sys
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent

# Regex patterns for credential and secret detection
SECRET_PATTERNS = [
    (r"sk-[a-zA-Z0-9]{32,}", "Generic/OpenAI API Key"),
    (r"sk-ant-[a-zA-Z0-9]{32,}", "Anthropic API Key"),
    (r"ghp_[a-zA-Z0-9]{36,}", "GitHub Personal Access Token"),
    (r"AKIA[0-9A-Z]{16}", "AWS Access Key ID"),
    (r"sk_live_[0-9a-zA-Z]{24,}", "Stripe Live Secret Key"),
    (r"pk_live_[0-9a-zA-Z]{24,}", "Stripe Live Publishable Key"),
    (r"-----BEGIN (?:RSA |EC )?PRIVATE KEY-----", "Private Key Header"),
]

# Pattern for personal Windows user profiles
USER_PATH_PATTERN = re.compile(r"[a-zA-Z]:[/\\]Users[/\\]([a-zA-Z0-9_\-]+)", re.IGNORECASE)

EXCLUDED_SCAN_DIRS = {
    ".git",
    "dist",
    "node_modules",
    "__pycache__",
    ".vscode",
    ".idea"
}

DISALLOWED_FILE_EXTENSIONS = {
    ".tmp",
    ".temp",
    ".log",
    ".pyc",
    ".suo",
    ".user"
}


def redact(val: str) -> str:
    """Redact sensitive string showing only first 4 chars."""
    if len(val) <= 6:
        return "***"
    return val[:4] + "***" + val[-2:]


def audit():
    print("=================================================================")
    print("  VANGUARD PRE-COMMIT & REPOSITORY HYGIENE AUDIT")
    print("=================================================================")
    print(f"Target: {WORKSPACE_ROOT}\n")

    findings = []
    files_scanned = 0

    # 1. Verify .gitignore existence and rules
    gitignore_path = WORKSPACE_ROOT / ".gitignore"
    if not gitignore_path.exists():
        findings.append(("CRITICAL", ".gitignore missing", "Create .gitignore before committing"))
    else:
        gi_content = gitignore_path.read_text(encoding="utf-8", errors="replace")
        for req_rule in ["dist/", "backups/", "*.zip", ".env"]:
            if req_rule not in gi_content:
                findings.append(("WARNING", f".gitignore missing rule '{req_rule}'", "Add rule to .gitignore"))

    # 2. Check for .env files
    for env_file in [".env", ".env.local", ".env.production"]:
        if (WORKSPACE_ROOT / env_file).exists():
            findings.append(("CRITICAL", f"Active secret file found: {env_file}", "Remove from workspace before commit"))

    # 3. Scan all project files
    for root, dirs, files in os.walk(WORKSPACE_ROOT):
        dirs[:] = [d for d in dirs if d not in EXCLUDED_SCAN_DIRS and not d.startswith(".")]

        for file in files:
            file_path = Path(root) / file
            rel_path = file_path.relative_to(WORKSPACE_ROOT)
            rel_str = str(rel_path).replace("\\", "/")

            # Extension check
            if file_path.suffix.lower() in DISALLOWED_FILE_EXTENSIONS:
                findings.append(("ERROR", f"Disallowed temporary/build file: {rel_str}", "Delete before commit"))

            # Zip dump check (unless in approved directory)
            if file_path.suffix.lower() == ".zip":
                findings.append(("ERROR", f"ZIP archive in repository: {rel_str}", "Move to backups/ or delete"))

            # Skip binary files from text scanning
            if file_path.suffix.lower() in [".exe", ".jpg", ".png", ".webp", ".ico", ".pdf"]:
                continue

            files_scanned += 1
            try:
                content = file_path.read_text(encoding="utf-8", errors="replace")
                
                # Check for secrets
                for pat, desc in SECRET_PATTERNS:
                    matches = re.findall(pat, content)
                    for m in matches:
                        findings.append(("CRITICAL", f"{desc} in {rel_str}", f"Redacted: {redact(m)}"))

                # Check for machine user paths in non-doc, non-script files
                # Allow references in documentation explaining machine paths
                if not rel_str.endswith(".md") and not rel_str.endswith(".ps1") and not rel_str.endswith(".py"):
                    user_matches = USER_PATH_PATTERN.findall(content)
                    for u in user_matches:
                        findings.append(("WARNING", f"Hardcoded Windows user path in {rel_str}", f"User: {u}"))

            except Exception as e:
                findings.append(("WARNING", f"Could not read {rel_str}: {e}", "Inspect manually"))

    # 4. Report results
    print(f"Scanned {files_scanned} files.")
    print("-----------------------------------------------------------------")

    criticals = [f for f in findings if f[0] == "CRITICAL" or f[0] == "ERROR"]
    warnings = [f for f in findings if f[0] == "WARNING"]

    if criticals:
        print("[AUDIT FAILED] Critical security/hygiene blockers found:")
        for sev, msg, act in criticals:
            print(f"  [{sev}] {msg} -> {act}")
        print("\nFix blockers before executing baseline commit.")
        sys.exit(1)

    if warnings:
        print("[AUDIT PASSED WITH WARNINGS]")
        for sev, msg, act in warnings:
            print(f"  [{sev}] {msg} -> {act}")
    else:
        print("[AUDIT PASSED] 0 secrets, 0 disallowed files, clean .gitignore.")

    print("=================================================================")
    sys.exit(0)


if __name__ == "__main__":
    audit()
