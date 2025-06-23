$root = Resolve-Path .
$loreDir = Join-Path $root 'myth-engine\lore'
$oasisPath = Join-Path $root 'OASIS.md'

$loreFiles = Get-ChildItem $loreDir -Filter '*.codex.json' -File -ErrorAction SilentlyContinue
$entries = @()
$protocolMap = @{}
$timeline = @()

foreach ($file in $loreFiles) {
  try {
    $json = Get-Content $file.FullName -Raw | ConvertFrom-Json
    if ($json.title -and $json.arcana -ne $null) {
      $entries += [PSCustomObject]@{
        Title     = $json.title
        Arcana    = $json.arcana
        Version   = $json.version
        Elements  = $json.elements
        Protocols = ($json.protocols -join ', ')
        Activated = $json.activated
      }

      foreach ($p in $json.protocols) {
        if (-not $protocolMap.ContainsKey($p)) {
          $protocolMap[$p] = @()
        }
        $protocolMap[$p] += $json.title
      }

      $timeline += [PSCustomObject]@{
        Card      = $json.title
        Activated = $json.activated
      }
    }
  } catch {
    Write-Warning "⚠️ Could not parse $($file.Name)"
  }
}

$now = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$total = $entries.Count
$percent = [math]::Round(($total / 22) * 100, 1)

$content = @"
# 🧭 OASIS System Report

_Generated: $now_  
**🃏 $total of 22 Arcana bound ($percent`%)**

## Bound Arcana Codices

| Card        | Arcana | Elements | Version  | Protocols                     | Activated              |
|-------------|--------|----------|----------|-------------------------------|------------------------|
"@

foreach ($e in $entries | Sort-Object Arcana) {
  $row = "| $($e.Title) | $($e.Arcana) | $($e.Elements) | $($e.Version) | $($e.Protocols) | $($e.Activated) |"
  $content += $row
}

$content += "`n## Protocol Matrix`n"
$content += "| Protocol        | Cards Using It |"
$content += "|-----------------|----------------|"
foreach ($key in $protocolMap.Keys | Sort-Object) {
  $cardList = ($protocolMap[$key] | Sort-Object | Get-Unique) -join ', '
  $content += "| $key | $cardList |"
}

$content += "`n## Activation Timeline`n"
foreach ($t in $timeline | Sort-Object Activated) {
  $content += "- $($t.Activated) → $($t.Card)"
}

$content -join "`n" | Set-Content $oasisPath -Encoding utf8

Write-Host ("`n📘 OASIS.md updated with {0} codices." -f $entries.Count) -ForegroundColor Cyan
