param(
  [string[]]$CredentialReferences = @("nci-lab-readonly", "nkp-lab-readonly", "ndb-lab-readonly", "nus-lab-readonly", "ncm-lab-readonly", "nai-lab-readonly")
)

$ErrorActionPreference = "Stop"

foreach ($reference in $CredentialReferences) {
  if (-not $reference) {
    throw "Credential reference must not be blank."
  }

  if ($reference -notmatch "^[a-z][a-z0-9._:-]{2,63}$") {
    throw "Credential reference has an invalid profile-name shape."
  }

  if ($reference -match "://" -or $reference -match "@" -or $reference -match "=" -or $reference -match "\$") {
    throw "Credential reference must not include inline access material."
  }
}

Write-Output "Provider credential reference validation passed."
Write-Output "References checked: $($CredentialReferences.Count)"
