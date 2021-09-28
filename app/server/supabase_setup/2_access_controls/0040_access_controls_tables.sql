
-- DROP TYPE AccessControlLevel;
CREATE TYPE AccessControlLevel AS ENUM ('editor', 'viewer', 'none');
CREATE TABLE IF NOT EXISTS access_controls (
  base_id bigint NOT NULL,
  user_id uuid references auth.users NOT NULL,
  inserted_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,
  access_level AccessControlLevel NOT NULL,
  -- invited_email_or_uid text NULL,
  -- accepted bool DEFAULT false NOT NULL,
  PRIMARY KEY(base_id, user_id),
  CONSTRAINT fk_access_controls_base
    FOREIGN KEY(base_id)
	  REFERENCES bases(id)
);
