<#
.SYNOPSIS
  Activates a named protocol, burns it into logs, creates a markdown scroll,
  and updates the master PROTOCOLS.md codex.
#>
param (
  [Parameter(Mandatory)]
  [string]$Name
)

$root = Resolve-Path .
$logsDir = Join-Path $root "logs"
$protoDir = Join-Path $root "protocols"

# Ensure folders exist
$null = New-Item $logsDir -ItemType Directory -Force
$null = New-Item $protoDir -ItemType Directory -Force

# Timestamp
$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$slug = $Name.ToUpper() -replace '[^\w\-]', '-' -replace '-+', '-'

# 1. Log to achievements
Add-Content -Path (Join-Path $logsDir "achievements.txt") -Value "[$stamp] Protocol Activated: $Name"

# 2. Create protocol scroll
$scrollPath = Join-Path $protoDir "$slug.md"
if (-not (Test-Path $scrollPath)) {
  @"
# Protocol: $Name

**Activated**: $stamp  
**Overseer**: Alex  
**Purpose**: _Describe the objective, power, or ritual here._

---

## Effects
- [ ] Define what this protocol changes, enables, or watches.
- [ ] Add linkbacks to rituals, achievements, or triggers.

## Logs
This protocol was first invoked at $stamp and sealed by Watch-Tree.

"@ | Set-Content -Path $scrollPath
}

# 3. Update PROTOCOLS.md
$indexPath = Join-Path $protoDir "PROTOCOLS.md"
$entries = Get-ChildItem $protoDir -Filter '*.md' | Where-Object Name -ne 'PROTOCOLS.md' | ForEach-Object {
  $title = ($_ | Get-Content -TotalCount 1) -replace '^# ', ''
  "- [$title]($($_.Name))"
}
$indexContent = @"
# 🧭 Active Protocols

_Last updated: $stamp_  
_Overseer: Alex_

## List
$($entries -join "`n")
"@
$indexContent | Set-Content -Path $indexPath

Write-Host "`n✅ Protocol '$Name' activated and burned into Shrine history." -ForegroundColor Green
