$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$docsSource = Join-Path $repoRoot "docs"
$vaultRoot = "C:\Users\john\OneDrive\09 Profile\Documents\OBSIDIAN VAULT GITS\Nutanix Developer Cloud Studio"

if (-not (Test-Path -Path $docsSource)) {
    throw "Docs source not found: $docsSource"
}

New-Item -ItemType Directory -Force -Path $vaultRoot | Out-Null

$indexPath = Join-Path $vaultRoot "Nutanix Developer Cloud Studio.md"
$index = @"
# Nutanix Developer Cloud Studio

This Obsidian vault mirrors project documentation from:

$repoRoot

## Notes

- [[architecture]]
- [[build-plan]]
- [[project-log]]
- [[project-brief]]
- [[roadmap]]

## Sync

Run from the repo:

````powershell
.\scripts\sync-obsidian.ps1
````

Last synced: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")
"@

Set-Content -Path $indexPath -Value $index -Encoding UTF8

Get-ChildItem -Path $docsSource -Filter "*.md" -File | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $vaultRoot $_.Name) -Force
}

Write-Host "Synced Markdown docs to Obsidian vault:"
Write-Host $vaultRoot
