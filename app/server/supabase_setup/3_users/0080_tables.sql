

CREATE TABLE IF NOT EXISTS users (
  id uuid references auth.users NOT NULL PRIMARY KEY,
  name text DEFAULT '' NOT NULL,
  name_lowercase text UNIQUE
  -- Do not add sensitive fields to this table, e.g. fields the user thinks are private because
  -- this is only public user information that any other user can access: user 2 can add user 1 to
  -- a base user 2 owns and then access the user 1's information from this table.
);
