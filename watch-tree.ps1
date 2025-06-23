# ─────────────────────────────────────────────────────────────────────────────
# Watch-Tree.ps1 — auto-regenerates ui\Tree.txt on any FS change (excl. node_modules)
# ─────────────────────────────────────────────────────────────────────────────

# 1) Set up paths
$root    = (Resolve-Path .).Path
$outFile = Join-Path $root "ui\Tree.txt"

# 2) Function to write the tree
function Generate-Tree {
    $t = Get-Date -Format "HH:mm:ss"
    Write-Host "$t ▶ Regenerating Tree.txt"
    # /A = ASCII, /F = include files (remove /F to list folders only)
    tree $root /A /F > $outFile
}

# 3) First dump
Generate-Tree

# 4) Build the watcher
$watcher = New-Object System.IO.FileSystemWatcher (
    $root, '*.*'
)
$watcher.IncludeSubdirectories    = $true
$watcher.NotifyFilter             = [IO.NotifyFilters]'FileName,DirectoryName,LastWrite'
$watcher.EnableRaisingEvents      = $true

# 5) Hook each event and log it
foreach ($evt in 'Created','Changed','Deleted','Renamed') {
    Register-ObjectEvent -InputObject $watcher -EventName $evt -Action {
        $chg  = $Event.SourceEventArgs.ChangeType
        $file = $Event.SourceEventArgs.FullPath
        if ($file -notmatch '\\node_modules\\') {
            Write-Host "$(Get-Date -Format T) ▶ $chg → $file"
            Generate-Tree
        }
    }
}

Write-Host "Watching $root (excluding node_modules). Press Ctrl+C to stop."

# 6) Keep the script alive
while ($true) { Start-Sleep -Seconds 1 }
