

CREATE TABLE IF NOT EXISTS users (
  id uuid references auth.users NOT NULL PRIMARY KEY,
  name text DEFAULT '' NOT NULL
);
