param(
  [string]$WorkingDirectory = ".data\backup-restore-smoke"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

if (Test-Path $WorkingDirectory) {
  Remove-Item -LiteralPath $WorkingDirectory -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $WorkingDirectory | Out-Null
$stateFile = Join-Path $WorkingDirectory "state.json"
$backupDir = Join-Path $WorkingDirectory "backups"
$restoreFile = Join-Path $WorkingDirectory "restored.json"

$sampleState = @{
  templates = @(@{ id = "vm-app"; name = "Linux VM App Sandbox" })
  environments = @(@{ name = "backup-smoke"; status = "Ready" })
  auditEvents = @(@{ id = "audit-smoke"; action = "smoke"; actor = "tester"; target = "state"; createdAt = (Get-Date).ToString("o") })
} | ConvertTo-Json -Depth 8

Set-Content -LiteralPath $stateFile -Value $sampleState -Encoding utf8

& .\scripts\backup-state.ps1 -DataFile $stateFile -BackupDirectory $backupDir -BackupName "smoke-backup.json" | Out-Null
& .\scripts\restore-state.ps1 -BackupFile (Join-Path $backupDir "smoke-backup.json") -DataFile $restoreFile | Out-Null

$restored = Get-Content -Raw -LiteralPath $restoreFile | ConvertFrom-Json
if ($restored.environments[0].name -ne "backup-smoke") {
  throw "Backup/restore smoke failed."
}

Write-Output "Backup/restore smoke passed."
