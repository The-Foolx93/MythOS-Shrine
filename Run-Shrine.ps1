# Run-Shrine.ps1 — AUTOGEN DEPLOY Edition

$shrinePath = "C:\Users\Alex\MythOS-Shrine"
$lorePath = "$shrinePath\lore"
$truthsPath = "$shrinePath\Truths.json"
$indexPath = "$shrinePath\index.json"
$logPath = "$shrinePath\autogen.log"
$port = 8080

Set-Location $shrinePath

# Log helper
function Log-Echo($msg) {
    "$((Get-Date).ToString('s')) :: $msg" | Add-Content -Encoding UTF8 $logPath
}

# AUTOGEN Extraction
$truths = @()
$index = @()
$glyphFiles = Get-ChildItem $lorePath -Filter "*.codex.json"

foreach ($file in $glyphFiles) {
    try {
        $json = Get-Content $file.FullName -Raw | ConvertFrom-Json
        if ($json.truth) {
            $truths += [PSCustomObject]@{
                truth      = $json.truth
                source     = $json.title
                arcana     = $json.arcana
                depth      = $json.depth
                cluster_id = $json.cluster_id
                origin     = $json.origin
            }
        }

        $index += [PSCustomObject]@{
            title   = $json.title
            arcana  = $json.arcana
            class   = $json.class
            tags    = $json.tags
            cluster = $json.cluster_id
        }

    } catch {
        Log-Echo "⚠️ Invalid JSON in $($file.Name)"
    }
}

$truths | ConvertTo-Json -Depth 2 | Set-Content -Encoding UTF8 $truthsPath
$index  | ConvertTo-Json -Depth 2 | Set-Content -Encoding UTF8 $indexPath
Log-Echo "✅ Truths + Index extracted from $($glyphFiles.Count) glyphs"

# Launch HTTP server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$shrinePath`"; python -m http.server $port"
Log-Echo "🌐 HTTP server launched at http://localhost:$port"

# Launch Watcher
$watcherScript = "$shrinePath\Watch-Glyphs.ps1"
if (Test-Path $watcherScript) {
    Start-Process powershell -ArgumentList "-NoExit", "-File", $watcherScript
    Log-Echo "🔁 Watch-Glyphs.ps1 triggered"
}

# Launch dashboard
Start-Process "http://localhost:$port"
