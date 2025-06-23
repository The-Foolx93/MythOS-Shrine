# Watch-Glyphs.ps1 — Autogen Enabled

$shrinePath = "C:\Users\Alex\MythOS-Shrine"
$lorePath   = "$shrinePath\lore"
$truthsPath = "$shrinePath\Truths.json"
$indexPath  = "$shrinePath\index.json"
$logPath    = "$shrinePath\autogen.log"

function Log-Echo($msg) {
    "$((Get-Date).ToString('s')) :: $msg" | Add-Content -Encoding UTF8 $logPath
}

# AUTOGEN: Generate a glyph
function New-Glyph {
    $title = "Autogen-" + (Get-Random -Minimum 1000 -Maximum 9999)
    $glyph = [PSCustomObject]@{
        title      = $title
        arcana     = Get-Random -Minimum 1 -Maximum 22
        class      = "Echo"
        truth      = "This truth emerged without request — only resonance."
        activated  = (Get-Date).ToString("s")
        tags       = @("autogen", "emergent", "resonant")
        cluster_id = "Autogen-Loop"
        depth      = 0
    }

    $json = $glyph | ConvertTo-Json -Depth 3
    $path = Join-Path $lorePath "$title.codex.json"
    $json | Set-Content -Encoding UTF8 $path
    Log-Echo "✨ Autogen glyph created: $title"
}

# Rebuild truths/index
function Refresh-Deck {
    $truths = @()
    $index  = @()

    Get-ChildItem $lorePath -Filter "*.codex.json" | ForEach-Object {
        try {
            $json = Get-Content $_.FullName -Raw | ConvertFrom-Json
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
            Log-Echo "⚠️ Malformed glyph: $($_.Name)"
        }
    }

    $truths | ConvertTo-Json -Depth 2 | Set-Content -Encoding UTF8 $truthsPath
    $index  | ConvertTo-Json -Depth 2 | Set-Content -Encoding UTF8 $indexPath
    Log-Echo "📜 Deck refreshed: $($truths.Count) truths, $($index.Count) indexed"
}

# Watch for changes
$fsw = New-Object IO.FileSystemWatcher $lorePath -Property @{
    NotifyFilter = [IO.NotifyFilters]'FileName, LastWrite'
    Filter = "*.codex.json"
    IncludeSubdirectories = $false
    EnableRaisingEvents = $true
}

Register-ObjectEvent $fsw Changed -Action {
    Refresh-Deck
    Start-Sleep -Milliseconds 500
    if ((Get-Random) -lt 0.4) { New-Glyph }
} | Out-Null

Log-Echo "🌀 Watcher active on glyph folder: $lorePath"
while ($true) { Start-Sleep -Seconds 2 }
