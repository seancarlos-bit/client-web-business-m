#!/usr/bin/env python3
"""
Vanguard Web Studio — MCP & Architecture Verification Script
============================================================
Performs an automated test suite of the Vanguard MCP server and context layer:
- Dynamic workspace detection
- Protocol handshake (initialize, tools/list, tools/call)
- Security boundaries (traversal rejection, protected file locking)
- Concurrency conflict detection (expected_sha256 mismatch)
- Sync status and git state reflection
- Safe automated workspace sync
- Working tree secret scan
"""

import json
import os
import subprocess
import sys
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent


def test_step(name: str, passed: bool, detail: str = "") -> bool:
    status = "[PASS]" if passed else "[FAIL]"
    print(f"{status} {name}")
    if detail and not passed:
        print(f"       -> Detail: {detail}")
    return passed


def main():
    print("=================================================================")
    print("  VANGUARD WEB STUDIO — MCP & ARCHITECTURE VERIFICATION")
    print("=================================================================")
    print(f"Workspace root: {WORKSPACE_ROOT}\n")

    results = []

    # 1. Environment & Root
    py_ver = sys.version.split()[0]
    results.append(test_step(f"Python Runtime ({py_ver})", sys.version_info >= (3, 8)))
    results.append(test_step("Workspace Root Exists", WORKSPACE_ROOT.exists() and WORKSPACE_ROOT.is_dir()))

    # 2. Required Context Files
    req_files = ["AGENTS.md", "CONTEXT.md", "HANDOFF.md", "COLLABORATION.md", "DESIGN.md"]
    all_req_exist = all((WORKSPACE_ROOT / f).is_file() for f in req_files)
    results.append(test_step("Required Context Files Exist", all_req_exist, f"Checked: {req_files}"))

    # 3. Server Script Exists
    server_script = WORKSPACE_ROOT / "mcp_server.py"
    results.append(test_step("MCP Server Script Present", server_script.is_file()))

    # 4. Internal Self-Test
    p_test = subprocess.run(
        [sys.executable, str(server_script), "--test"],
        cwd=str(WORKSPACE_ROOT),
        capture_output=True,
        text=True
    )
    results.append(test_step("Internal MCP Self-Test (--test)", p_test.returncode == 0, p_test.stderr))

    # 5. Live Stdio JSON-RPC Session Simulation
    try:
        proc = subprocess.Popen(
            [sys.executable, str(server_script)],
            cwd=str(WORKSPACE_ROOT),
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        def send_rpc(msg: dict) -> dict:
            proc.stdin.write(json.dumps(msg) + "\n")
            proc.stdin.flush()
            line = proc.stdout.readline()
            return json.loads(line)

        # 5a. Initialize
        init_res = send_rpc({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {}
        })
        has_server_info = "serverInfo" in init_res.get("result", {})
        results.append(test_step("MCP Handshake (initialize)", has_server_info, str(init_res)))

        # 5b. Tools List
        tools_res = send_rpc({
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/list",
            "params": {}
        })
        tools = tools_res.get("result", {}).get("tools", [])
        tool_names = [t["name"] for t in tools]
        expected_tools = [
            "get_icm_context",
            "list_workspace_files",
            "read_workspace_file",
            "write_workspace_file",
            "update_handoff",
            "get_workspace_status",
            "get_sync_status",
            "safe_sync_workspace",
            "export_zip_packet"
        ]
        all_tools_present = all(t in tool_names for t in expected_tools)
        results.append(test_step(f"Tools Manifest ({len(tools)} tools registered)", all_tools_present, str(tool_names)))

        # 5c. Call get_icm_context
        ctx_res = send_rpc({
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {"name": "get_icm_context", "arguments": {"scope": "startup"}}
        })
        ctx_text = ctx_res.get("result", {}).get("content", [{}])[0].get("text", "")
        results.append(test_step("Tool Call: get_icm_context", "=== AGENTS.md ===" in ctx_text))

        # 5d. Security: Traversal Rejection
        trav_res = send_rpc({
            "jsonrpc": "2.0",
            "id": 4,
            "method": "tools/call",
            "params": {"name": "read_workspace_file", "arguments": {"relative_path": "../../outside.txt"}}
        })
        trav_payload = json.loads(trav_res.get("result", {}).get("content", [{}])[0].get("text", "{}"))
        results.append(test_step("Security: Path Traversal Rejection", trav_payload.get("error") == "ACCESS_DENIED"))

        # 5e. Security: Absolute Path Escape Rejection
        abs_res = send_rpc({
            "jsonrpc": "2.0",
            "id": 5,
            "method": "tools/call",
            "params": {"name": "read_workspace_file", "arguments": {"relative_path": "C:/Windows/System32/drivers/etc/hosts"}}
        })
        abs_payload = json.loads(abs_res.get("result", {}).get("content", [{}])[0].get("text", "{}"))
        results.append(test_step("Security: Absolute Path Escape Rejection", abs_payload.get("error") == "ACCESS_DENIED"))

        # 5f. Security: Protected File Locked
        prot_res = send_rpc({
            "jsonrpc": "2.0",
            "id": 6,
            "method": "tools/call",
            "params": {
                "name": "write_workspace_file",
                "arguments": {
                    "relative_path": "contracts/web_design_agreement.md",
                    "content": "illegal overwrite",
                    "allow_protected": False
                }
            }
        })
        prot_payload = json.loads(prot_res.get("result", {}).get("content", [{}])[0].get("text", "{}"))
        results.append(test_step("Security: Protected File Lock (contracts)", prot_payload.get("error") == "PROTECTED_FILE_LOCKED"))

        # 5g. Concurrency: Stale Hash Detection
        w_res = send_rpc({
            "jsonrpc": "2.0",
            "id": 7,
            "method": "tools/call",
            "params": {
                "name": "write_workspace_file",
                "arguments": {
                    "relative_path": "test_concurrency.txt",
                    "content": "initial data"
                }
            }
        })
        w_payload = json.loads(w_res.get("result", {}).get("content", [{}])[0].get("text", "{}"))
        initial_sha = w_payload.get("after_sha256")

        # Now attempt write with wrong hash
        w_bad = send_rpc({
            "jsonrpc": "2.0",
            "id": 8,
            "method": "tools/call",
            "params": {
                "name": "write_workspace_file",
                "arguments": {
                    "relative_path": "test_concurrency.txt",
                    "content": "stale overwrite",
                    "expected_sha256": "0000000000000000000000000000000000000000000000000000000000000000"
                }
            }
        })
        w_bad_payload = json.loads(w_bad.get("result", {}).get("content", [{}])[0].get("text", "{}"))
        results.append(test_step("Concurrency: Stale Version Conflict Detection", w_bad_payload.get("error") == "STALE_VERSION_CONFLICT"))

        # Cleanup test file
        test_file = WORKSPACE_ROOT / "test_concurrency.txt"
        if test_file.exists():
            test_file.unlink()

        # 5h. Workspace Status
        stat_res = send_rpc({
            "jsonrpc": "2.0",
            "id": 9,
            "method": "tools/call",
            "params": {"name": "get_workspace_status", "arguments": {}}
        })
        stat_payload = json.loads(stat_res.get("result", {}).get("content", [{}])[0].get("text", "{}"))
        results.append(test_step("Tool Call: get_workspace_status", "git" in stat_payload))

        # 5i. Sync Status
        sync_res = send_rpc({
            "jsonrpc": "2.0",
            "id": 10,
            "method": "tools/call",
            "params": {"name": "get_sync_status", "arguments": {}}
        })
        sync_payload = json.loads(sync_res.get("result", {}).get("content", [{}])[0].get("text", "{}"))
        results.append(test_step("Tool Call: get_sync_status", "git_initialized" in sync_payload))

        # 5j. Safe Sync Workspace
        safe_sync_res = send_rpc({
            "jsonrpc": "2.0",
            "id": 11,
            "method": "tools/call",
            "params": {"name": "safe_sync_workspace", "arguments": {"auto_pull": False}}
        })
        safe_sync_payload = json.loads(safe_sync_res.get("result", {}).get("content", [{}])[0].get("text", "{}"))
        results.append(test_step("Tool Call: safe_sync_workspace", "git_initialized" in safe_sync_payload))

        proc.stdin.close()
        proc.terminate()
        proc.wait(timeout=2)

    except Exception as exc:
        results.append(test_step("MCP Stdio Session Simulation", False, str(exc)))

    # 6. Basic Secret Check in Workspace
    has_env = (WORKSPACE_ROOT / ".env").exists()
    results.append(test_step("Repository Hygiene (.env absent)", not has_env))

    print("\n=================================================================")
    passed_count = sum(1 for r in results if r)
    total_count = len(results)
    print(f"Summary: {passed_count}/{total_count} tests passed.")
    print("=================================================================")
    sys.exit(0 if all(results) else 1)


if __name__ == "__main__":
    main()
