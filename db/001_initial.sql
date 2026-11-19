-- Application data is private. Only the server connects to this schema.
BEGIN;
CREATE SCHEMA IF NOT EXISTS app;
CREATE TABLE IF NOT EXISTS app.members (
  email text PRIMARY KEY CHECK(email=lower(email)),
  role text NOT NULL DEFAULT 'staff' CHECK(role IN ('admin','staff')),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS app.patients (
  id uuid PRIMARY KEY,
  data jsonb NOT NULL CHECK(jsonb_typeof(data)='object'),
  version integer NOT NULL DEFAULT 1 CHECK(version>0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS app.audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id uuid NOT NULL,
  actor_id text NOT NULL,
  actor_email text NOT NULL,
  action text NOT NULL CHECK(action IN ('create','update','delete','import')),
  fields jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_patient_date ON app.audit(patient_id,created_at DESC);
ALTER TABLE app.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON SCHEMA app FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA app FROM PUBLIC;
COMMIT;
