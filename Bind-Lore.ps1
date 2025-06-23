<#
.SYNOPSIS
  Binds a card’s lore into the Myth Engine:
    • Creates myth-engine/lore/<SLUG>.codex.json
    • Appends a history.log entry
    • Updates myth-engine/manifest.json
#>
param(
  [Parameter(Mandatory)][string]   $CardName,
  [Parameter(Mandatory)][int]      $Arcana,
  [Parameter(Mandatory)][int]      $Elements,
  [Parameter(Mandatory)][string]   $Version,
  [Parameter(Mandatory)][string[]] $Protocols,
  [Parameter(Mandatory)][string]   $Activated
)

# Paths
$root       = (Resolve-Path .).Path
$loreDir    = Join-Path $root 'myth-engine\lore'
$ledgerFile = Join-Path $root 'myth-engine\ledger\history.log'
$manifest   = Join-Path $root 'myth-engine\manifest.json'

# Ensure directories/files
New-Item $loreDir -ItemType Directory -Force | Out-Null
New-Item (Split-Path $ledgerFile) -ItemType Directory -Force | Out-Null
if (-not (Test-Path $ledgerFile)) { New-Item $ledgerFile -ItemType File | Out-Null }
if (-not (Test-Path $manifest)) { '{ "deck": [] }' | Out-File $manifest -Encoding utf8 }

# Build slug
$slug = ($CardName.ToLower() -replace '[^a-z0-9]+','-').Trim('-')
$codexPath = Join-Path $loreDir "$slug.codex.json"

# Codex object
$codex = [pscustomobject]@{
  title     = $CardName
  arcana    = $Arcana
  elements  = $Elements
  version   = $Version
  protocols