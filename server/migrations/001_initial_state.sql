CREATE TABLE IF NOT EXISTS ndc_api_state (
  id text PRIMARY KEY,
  state_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ndc_audit_events (
  id text PRIMARY KEY,
  action text NOT NULL,
  actor text NOT NULL,
  target text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS ndc_audit_events_created_at_idx
  ON ndc_audit_events (created_at DESC);

CREATE INDEX IF NOT EXISTS ndc_audit_events_target_idx
  ON ndc_audit_events (target);
