# Vanguard Web Studio - Safe Session Synchronization Script
# Usage: .\scripts\sync_session.ps1

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$SyncPy = Join-Path $ScriptDir "sync_session.py"

# Find python
$PythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $PythonCmd) {
    $PythonCmd = Get-Command py -ErrorAction SilentlyContinue
}

if (-not $PythonCmd) {
    Write-Host "[ERROR] Python 3 was not found in PATH." -ForegroundColor Red
    exit 1
}

$PythonExe = $PythonCmd.Source

& $PythonExe $SyncPy
