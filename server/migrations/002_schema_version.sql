CREATE TABLE IF NOT EXISTS ndc_schema_versions (
  version text PRIMARY KEY,
  description text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ndc_signed_audit_manifests (
  id text PRIMARY KEY,
  manifest_digest text NOT NULL,
  signing_key_ref text NOT NULL,
  signature text NOT NULL,
  signature_algorithm text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
