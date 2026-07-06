param(
  [string]$MigrationDirectory = "server\migrations",
  [string]$Schema = "ndc_studio",
  [string]$Repository = "json",
  [string]$DatabaseUrl = "",
  [switch]$RequireDatabaseUrl
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $MigrationDirectory)) {
  throw "Migration directory not found: $MigrationDirectory"
}

$migrationFiles = Get-ChildItem -Path $MigrationDirectory -Filter "*.sql" -File | Sort-Object Name
if (-not $migrationFiles -or $migrationFiles.Count -lt 1) {
  throw "At least one SQL migration is required."
}

foreach ($migration in $migrationFiles) {
  $content = Get-Content -Raw -LiteralPath $migration.FullName
  if ($content -notmatch "CREATE TABLE IF NOT EXISTS") {
    throw "Migration does not include an idempotent table create statement: $($migration.Name)"
  }
}

if ($Schema -notmatch "^[A-Za-z_][A-Za-z0-9_]*$") {
  throw "NDC_DATABASE_SCHEMA must contain only letters, numbers, and underscores, and must not start with a number."
}

if ($Repository -eq "postgres" -or $RequireDatabaseUrl) {
  if (-not $DatabaseUrl) {
    throw "DATABASE_URL is required when NDC_REPOSITORY=postgres."
  }

  if ($DatabaseUrl -notmatch "^postgres(ql)?://") {
    throw "DATABASE_URL must use a postgres:// or postgresql:// connection string."
  }
}

Write-Output "Postgres repository validation passed."
Write-Output "Migration files: $($migrationFiles.Count)"
Write-Output "Schema: $Schema"
Write-Output "Repository mode checked: $Repository"
