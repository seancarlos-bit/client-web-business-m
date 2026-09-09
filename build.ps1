# Vanguard Studio - Standalone Production Build Script
# Requires ZERO Node.js runtime. Builds clean dist/ output with asset fingerprinting.
param(
    [ValidateSet("Preview", "Production")]
    [string]$Mode = "Preview",
    [switch]$Serve
)

$ErrorActionPreference = "Stop"

$ProjectDir = $PSScriptRoot
$BinDir = Join-Path $ProjectDir "bin"
$TailwindExe = Join-Path $BinDir "tailwindcss.exe"
$InputCss = Join-Path $ProjectDir "css\input.css"
$ConfigFile = Join-Path $ProjectDir "tailwind.config.js"
$DistDir = Join-Path $ProjectDir "dist"
$SourceIndex = Join-Path $ProjectDir "index.html"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  VANGUARD STUDIO BUILD PIPELINE - MODE: $Mode" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Verification of standalone compiler
if (-not (Test-Path $TailwindExe)) {
    Write-Error "[BUILD ERROR] Standalone Tailwind CLI binary missing at $TailwindExe"
}

# 2. Production gate: inspect launch-critical placeholders
$IndexContent = Get-Content -Path $SourceIndex -Raw -Encoding UTF8
$CriticalPlaceholders = @(
    "__CANONICAL_URL__",
    "__YOUR_FORM_ID__",
    "__PHONE_NUMBER__",
    "__CITY__",
    "__STATE__"
)
$Unresolved = @()
foreach ($p in $CriticalPlaceholders) {
    if ($IndexContent.Contains($p)) {
        $Unresolved += $p
    }
}

if ($Mode -eq "Production" -and $Unresolved.Count -gt 0) {
    Write-Host "[BUILD ABORTED] Production launch gate blocked: unresolved placeholders remain:" -ForegroundColor Red
    foreach ($u in $Unresolved) {
        Write-Host "  - $u" -ForegroundColor Red
    }
    Write-Error "Cannot build production release with active placeholders. Set real production values first."
}

# 3. Clean and prepare dist directory
if (Test-Path $DistDir) {
    Remove-Item -Recurse -Force $DistDir
}
New-Item -ItemType Directory -Force -Path (Join-Path $DistDir "assets") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $DistDir "js") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $DistDir "demos") | Out-Null

# 4. Compile Tailwind CSS to temp buffer
$TempCss = [System.IO.Path]::GetTempFileName()
Write-Host "[BUILD] Compiling Tailwind CSS..." -ForegroundColor Cyan
& $TailwindExe -i $InputCss -o $TempCss -c $ConfigFile --minify
if ($LASTEXITCODE -ne 0) {
    Write-Error "[BUILD ERROR] Tailwind compilation failed with code $LASTEXITCODE"
}

# 5. Compute SHA-256 fingerprint for CSS
$CssBytes = [System.IO.File]::ReadAllBytes($TempCss)
$Sha256 = [System.Security.Cryptography.SHA256]::Create()
$CssHash = [System.BitConverter]::ToString($Sha256.ComputeHash($CssBytes)).Replace("-", "").Substring(0, 8).ToLower()
$CssFilename = "site.$CssHash.css"
$DistCssPath = Join-Path $DistDir "assets\$CssFilename"
[System.IO.File]::WriteAllBytes($DistCssPath, $CssBytes)
Remove-Item -Force $TempCss
Write-Host "[BUILD] CSS fingerprinted -> assets/$CssFilename ($($CssBytes.Length) bytes)" -ForegroundColor Green

# 6. Fingerprint JS files
$JsFiles = @("motion.js", "navigation.js", "calculator.js", "form.js", "livechat.js", "slider.js")
$JsMap = @{}
foreach ($js in $JsFiles) {
    $srcPath = Join-Path $ProjectDir "js\$js"
    $bytes = [System.IO.File]::ReadAllBytes($srcPath)
    $hash = [System.BitConverter]::ToString($Sha256.ComputeHash($bytes)).Replace("-", "").Substring(0, 8).ToLower()
    $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($js)
    $hashedName = "$nameWithoutExt.$hash.js"
    $destPath = Join-Path $DistDir "js\$hashedName"
    [System.IO.File]::WriteAllBytes($destPath, $bytes)
    $JsMap[$js] = $hashedName
    Write-Host "[BUILD] JS fingerprinted  -> js/$hashedName" -ForegroundColor Green
}

# 7. Generate dist/*.html with hashed asset paths
$RootHtmlFiles = Get-ChildItem -Path $ProjectDir -Filter "*.html" | Where-Object { $_.Name -ne "404.html" }
foreach ($htmlFile in $RootHtmlFiles) {
    $content = Get-Content -Path $htmlFile.FullName -Raw -Encoding UTF8
    $content = $content.Replace("assets/site.min.css", "assets/$CssFilename")
    $content = $content.Replace("js/motion.js", "js/$($JsMap['motion.js'])")
    $content = $content.Replace("js/navigation.js", "js/$($JsMap['navigation.js'])")
    $content = $content.Replace("js/calculator.js", "js/$($JsMap['calculator.js'])")
    $content = $content.Replace("js/form.js", "js/$($JsMap['form.js'])")
    $content = $content.Replace("js/livechat.js", "js/$($JsMap['livechat.js'])")
    $content = $content.Replace("js/slider.js", "js/$($JsMap['slider.js'])")

    if ($Mode -eq "Preview" -and $Unresolved.Count -gt 0) {
        $content = $content.Replace('<meta name="robots" content="index, follow" />', '<meta name="robots" content="noindex, nofollow" />')
    }

    $destPath = Join-Path $DistDir $htmlFile.Name
    [System.IO.File]::WriteAllText($destPath, $content, [System.Text.Encoding]::UTF8)
}

# 8. Generate dist/404.html
$FourOhFourHtml = @"
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>404 — Page Not Found | Vanguard Studio</title>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23141311'/%3E%3Ctext x='16' y='21' font-family='serif' font-size='16' font-style='italic' fill='%23FAF9F6' text-anchor='middle'%3EV%3C/text%3E%3C/svg%3E" />
  <link rel="stylesheet" href="assets/$CssFilename" />
</head>
<body class="font-sans antialiased bg-[#F4F1EA] text-[#141311] min-h-screen flex flex-col justify-between selection:bg-stone-950 selection:text-white">
  <header class="border-b border-stone-200 bg-stone-100/90 py-6 px-6">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <a href="/" class="flex items-center gap-3" aria-label="Vanguard Studio Homepage">
        <span class="w-7 h-7 rounded-full bg-stone-950 flex items-center justify-center text-stone-50 font-serif italic text-sm">V</span>
        <span class="font-serif text-lg font-medium text-stone-950">Vanguard Studio</span>
      </a>
      <a href="/" class="text-xs font-mono uppercase tracking-widest text-stone-600 hover:text-stone-950">Return Home &rarr;</a>
    </div>
  </header>
  <main class="max-w-2xl mx-auto px-6 py-32 text-center">
    <span class="font-mono text-xs uppercase tracking-widest text-stone-400">Error 404</span>
    <h1 class="font-serif text-5xl text-stone-950 mt-4 mb-6 font-normal">Page Not Found</h1>
    <p class="text-stone-600 text-sm leading-relaxed mb-10 max-w-md mx-auto">
      The architecture you are looking for does not exist or has been moved to another location.
    </p>
    <a href="/" class="inline-flex items-center justify-center min-h-[48px] px-8 py-3.5 rounded-xl bg-stone-950 text-stone-50 text-xs font-mono uppercase tracking-wider font-semibold hover:bg-stone-800 transition-colors">
      Return to Studio Homepage &rarr;
    </a>
  </main>
  <footer class="border-t border-stone-200 py-8 bg-stone-100 text-center text-xs font-mono text-stone-500">
    &copy; 2026 VANGUARD STUDIO. ALL RIGHTS RESERVED.
  </footer>
</body>
</html>
"@
[System.IO.File]::WriteAllText((Join-Path $DistDir "404.html"), $FourOhFourHtml, [System.Text.Encoding]::UTF8)
Write-Host "[BUILD] Generated dist/404.html" -ForegroundColor Green

# 9. Copy and prepare robots.txt & sitemap.xml
if ($Mode -eq "Preview" -and $Unresolved.Count -gt 0) {
    $RobotsTxt = "User-agent: *`nDisallow: /`n"
} else {
    $RobotsTxt = Get-Content (Join-Path $ProjectDir "robots.txt") -Raw
}
[System.IO.File]::WriteAllText((Join-Path $DistDir "robots.txt"), $RobotsTxt, [System.Text.Encoding]::UTF8)

Copy-Item (Join-Path $ProjectDir "sitemap.xml") (Join-Path $DistDir "sitemap.xml")

# 10. Copy sanitized demos
Copy-Item -Recurse (Join-Path $ProjectDir "demos\*") (Join-Path $DistDir "demos")
Get-ChildItem -Path (Join-Path $DistDir "demos") -Filter "index.html" -Recurse | ForEach-Object {
  $c = Get-Content $_.FullName -Raw
  $c = $c -replace 'assets/site\.[^"]+\.css', "assets/$CssFilename"
  $c = $c -replace 'assets/site\.min\.css', "assets/$CssFilename"
  Set-Content -Path $_.FullName -Value $c -Encoding UTF8
}

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "  BUILD COMPLETE -> Output: dist/" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

if ($Serve) {
    Write-Host "[SERVER] Launching local preview server rooted in dist/ at http://localhost:3000..." -ForegroundColor Cyan
    Set-Location $DistDir
    python -m http.server 3000
}
