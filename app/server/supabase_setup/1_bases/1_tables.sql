

CREATE TABLE IF NOT EXISTS bases (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  inserted_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  owner_user_id uuid references auth.users NOT NULL,
  public_read boolean DEFAULT false NOT NULL,
  title text DEFAULT '' NOT NULL
);
CREATE INDEX bases_owner_user_id_index ON bases ( owner_user_id );
