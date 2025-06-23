$root = Resolve-Path .
$loreDir = Join-Path $root 'myth-engine\lore'
$output = Join-Path $root 'Matrix-State.json'

$loreFiles = Get-ChildItem $loreDir -Filter '*.codex.json' -File -ErrorAction SilentlyContinue
$grid = @{}
$timeline = @()

foreach ($file in $loreFiles) {
    try {
        $json = Get-Content $file.FullName -Raw | ConvertFrom-Json
        if ($json.title -and $json.arcana -ne $null) {
            $grid["$($json.arcana)"] = @{
                title     = $json.title
                class     = $json.class
                version   = $json.version
                elements  = $json.elements
                protocols = $json.protocols
                activated = $json.activated
            }

            $timeline += @{
                card      = $json.title
                timestamp = $json.activated
            }
        }
    } catch {
        Write-Warning "❌ Failed to parse $($file.Name)"
    }
}

$meta = @{
    boundCount      = $grid.Keys.Count
    percentComplete = [math]::Round(($grid.Keys.Count / 22) * 100, 1)
    lastUpdated     = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
}

$matrix = @{
    grid     = $grid
    timeline = $timeline | Sort-Object timestamp
    meta     = $meta
}

$matrix | ConvertTo-Json -Depth 5 | Set-Content $output -Encoding utf8
Write-Host "`n🧩 Matrix-State.json created with $($meta.boundCount) nodes." -ForegroundColor Green
