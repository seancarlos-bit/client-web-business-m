#!/usr/bin/env python3
"""
Vanguard Web Studio — Partner Setup & Bootstrap Tool
====================================================
Automatically configures local AI clients (Claude Desktop, Cursor)
without hardcoded paths or destructive configuration overwrites.

Features:
- Dynamically resolves workspace root on the local machine
- Detects Python 3 runtime
- Backs up existing Claude Desktop / Cursor configuration before edits
- Merges 'vanguard-icm' into mcpServers without disturbing existing servers
- Runs automated verification suite
"""

import datetime
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

# Dynamically resolve workspace root
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
SERVER_SCRIPT = WORKSPACE_ROOT / "mcp_server.py"


def get_claude_desktop_config_path() -> Path:
    """Determine Claude Desktop config path by platform."""
    if sys.platform == "win32":
        appdata = os.getenv("APPDATA")
        if appdata:
            return Path(appdata) / "Claude" / "claude_desktop_config.json"
        return Path.home() / "AppData" / "Roaming" / "Claude" / "claude_desktop_config.json"
    elif sys.platform == "darwin":
        return Path.home() / "Library" / "Application Support" / "Claude" / "claude_desktop_config.json"
    else:
        # Linux fallback
        config_home = os.getenv("XDG_CONFIG_HOME", str(Path.home() / ".config"))
        return Path(config_home) / "Claude" / "claude_desktop_config.json"


def configure_claude_desktop() -> bool:
    """Configure Claude Desktop without clobbering existing servers."""
    cfg_path = get_claude_desktop_config_path()
    print(f"\n[1/3] Configuring Claude Desktop integration...")
    print(f"      Target: {cfg_path}")

    # Ensure directory exists
    cfg_path.parent.mkdir(parents=True, exist_ok=True)

    data = {"mcpServers": {}}
    if cfg_path.exists():
        # Backup before reading/modifying
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = cfg_path.with_suffix(f".json.bak_{timestamp}")
        try:
            shutil.copy2(cfg_path, backup_path)
            print(f"      -> Created backup at: {backup_path.name}")
        except Exception as e:
            print(f"      [WARNING] Could not create backup: {e}")

        try:
            content = cfg_path.read_text(encoding="utf-8")
            if content.strip():
                data = json.loads(content)
        except Exception as e:
            print(f"      [WARNING] Existing config was not valid JSON ({e}). Initializing clean template.")
            data = {"mcpServers": {}}

    if "mcpServers" not in data or not isinstance(data["mcpServers"], dict):
        data["mcpServers"] = {}

    # Merge vanguard-icm with dynamic local path and Python interpreter
    python_exe = sys.executable.replace("\\", "/")
    server_path = str(SERVER_SCRIPT.resolve()).replace("\\", "/")

    data["mcpServers"]["vanguard-icm"] = {
        "command": python_exe,
        "args": [server_path]
    }

    try:
        cfg_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
        print("      [SUCCESS] Claude Desktop config merged successfully.")
        return True
    except Exception as e:
        print(f"      [ERROR] Failed to write Claude Desktop config: {e}")
        return False


def configure_cursor() -> bool:
    """Configure local .cursor/mcp.json."""
    cursor_dir = WORKSPACE_ROOT / ".cursor"
    cursor_cfg = cursor_dir / "mcp.json"
    print(f"\n[2/3] Configuring Cursor workspace integration...")
    print(f"      Target: {cursor_cfg}")

    cursor_dir.mkdir(parents=True, exist_ok=True)

    python_exe = sys.executable.replace("\\", "/")
    server_path = str(SERVER_SCRIPT.resolve()).replace("\\", "/")

    data = {
        "mcpServers": {
            "vanguard-icm": {
                "command": python_exe,
                "args": [server_path]
            }
        }
    }

    try:
        cursor_cfg.write_text(json.dumps(data, indent=2), encoding="utf-8")
        print("      [SUCCESS] Cursor config generated successfully.")
        return True
    except Exception as e:
        print(f"      [ERROR] Failed to write Cursor config: {e}")
        return False


def run_verification() -> bool:
    """Run automated verification script."""
    print(f"\n[3/3] Running automated verification...")
    verify_script = WORKSPACE_ROOT / "scripts" / "verify_mcp.py"
    if not verify_script.exists():
        print(f"      [ERROR] Verification script not found at {verify_script}")
        return False

    res = subprocess.run([sys.executable, str(verify_script)], cwd=str(WORKSPACE_ROOT))
    return res.returncode == 0


def main():
    print("=================================================================")
    print("      VANGUARD WEB STUDIO — PARTNER SETUP BOOTSTRAP")
    print("=================================================================")
    print(f"Detected Workspace: {WORKSPACE_ROOT}")
    print(f"Python Runtime:     {sys.executable} (v{sys.version.split()[0]})")

    if not SERVER_SCRIPT.exists():
        print(f"\n[CRITICAL ERROR] mcp_server.py not found at {SERVER_SCRIPT}")
        sys.exit(1)

    c_ok = configure_claude_desktop()
    cur_ok = configure_cursor()
    v_ok = run_verification()

    print("\n=================================================================")
    if c_ok and cur_ok and v_ok:
        print("  🎉 SETUP COMPLETE & VERIFIED")
        print("=================================================================")
        print("What to do now:")
        print("1. Restart Claude Desktop (or open this folder in Cursor).")
        print("2. Look for the 🔨 tool icon in Claude to confirm 'vanguard-icm' is active.")
        print("3. Tell your AI assistant:")
        print('   "Call get_icm_context and summarize the current next action."')
    else:
        print("  ⚠️ SETUP COMPLETED WITH WARNINGS — Review above logs.")
        print("=================================================================")


if __name__ == "__main__":
    main()
