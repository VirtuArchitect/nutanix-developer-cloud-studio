param(
  [string]$DataFile = ".data\ndc-studio.json",
  [string]$BackupDirectory = ".data\backups",
  [string]$BackupName = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $DataFile)) {
  throw "State file not found: $DataFile"
}

if (-not $BackupName) {
  $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $BackupName = "ndc-studio-$timestamp.json"
}

New-Item -ItemType Directory -Force -Path $BackupDirectory | Out-Null
$backupPath = Join-Path $BackupDirectory $BackupName
Copy-Item -LiteralPath $DataFile -Destination $backupPath -Force

Write-Output "State backup created: $backupPath"
