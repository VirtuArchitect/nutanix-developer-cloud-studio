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

$hash = Get-FileHash -Algorithm SHA256 -LiteralPath $backupPath
$manifestPath = "$backupPath.manifest.json"
$manifest = [ordered]@{
  schemaVersion = 1
  backupFile = (Split-Path -Leaf $backupPath)
  sourceFile = $DataFile
  createdAt = (Get-Date).ToString("o")
  sizeBytes = (Get-Item -LiteralPath $backupPath).Length
  sha256 = $hash.Hash.ToLowerInvariant()
  provisioningEnabled = $false
  notes = "Prototype JSON state backup manifest. Secret values must not be stored in NDC Studio state."
}
$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestPath -Encoding utf8

Write-Output "State backup created: $backupPath"
Write-Output "Backup manifest created: $manifestPath"
