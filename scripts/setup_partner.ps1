# Vanguard Web Studio - Windows Partner Bootstrap Script
# Usage: .\scripts\setup_partner.ps1

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$WorkspaceRoot = (Resolve-Path "$ScriptDir\..").Path
$BootstrapPy = Join-Path $ScriptDir "setup_partner.py"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   VANGUARD WEB STUDIO - WINDOWS PARTNER BOOTSTRAP" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Workspace Root: $WorkspaceRoot" -ForegroundColor DarkCyan

# 1. Locate Python executable
$PythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $PythonCmd) {
    $PythonCmd = Get-Command py -ErrorAction SilentlyContinue
}

if (-not $PythonCmd) {
    Write-Host "[ERROR] Python 3 was not found in PATH." -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/ or Windows Store." -ForegroundColor Yellow
    exit 1
}

$PythonExe = $PythonCmd.Source
Write-Host "Python Executable: $PythonExe" -ForegroundColor DarkCyan

# 2. Run the cross-platform setup script
try {
    & $PythonExe $BootstrapPy
} catch {
    Write-Host "[ERROR] Bootstrap execution failed: $_" -ForegroundColor Red
    exit 1
}
