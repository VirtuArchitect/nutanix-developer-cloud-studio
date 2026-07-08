param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,

  [string]$DataFile = ".data\ndc-studio.json",

  [switch]$SkipManifestValidation
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
  throw "Backup file not found: $BackupFile"
}

$manifestPath = "$BackupFile.manifest.json"
if ((Test-Path $manifestPath) -and -not $SkipManifestValidation) {
  $manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
  $hash = Get-FileHash -Algorithm SHA256 -LiteralPath $BackupFile
  $sizeBytes = (Get-Item -LiteralPath $BackupFile).Length

  if ($manifest.schemaVersion -ne 1) {
    throw "Unsupported backup manifest schema version: $($manifest.schemaVersion)"
  }

  if ($manifest.sha256 -ne $hash.Hash.ToLowerInvariant()) {
    throw "Backup manifest checksum does not match backup file."
  }

  if ([int64]$manifest.sizeBytes -ne $sizeBytes) {
    throw "Backup manifest size does not match backup file."
  }
}

$raw = Get-Content -Raw -LiteralPath $BackupFile
$parsed = $raw | ConvertFrom-Json
if (-not $parsed.templates -or -not $parsed.environments -or -not $parsed.auditEvents) {
  throw "Backup file does not look like an NDC Studio state file."
}

$dataDirectory = Split-Path -Parent $DataFile
if ($dataDirectory) {
  New-Item -ItemType Directory -Force -Path $dataDirectory | Out-Null
}

Copy-Item -LiteralPath $BackupFile -Destination $DataFile -Force
Write-Output "State restored to: $DataFile"
if (Test-Path $manifestPath) {
  Write-Output "Backup manifest verified: $manifestPath"
}
