-- Core tables for izSend

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  s3_key TEXT NOT NULL UNIQUE,
  passcode_hash TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS files_expires_at_idx ON files (expires_at);
CREATE INDEX IF NOT EXISTS files_deleted_at_idx ON files (deleted_at);