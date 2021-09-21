CREATE OR REPLACE FUNCTION uuid_or_null(str text)
RETURNS uuid AS $$
BEGIN
  RETURN str::uuid;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


-- CREATE OR REPLACE FUNCTION get_user_id_from_id_or_email(email_or_uid text)
-- returns uuid AS $$
--   select id from auth.users where auth.users.email = email_or_uid OR auth.users.id = uuid_or_null(email_or_uid) LIMIT 1;
-- $$ language sql;


CREATE OR REPLACE FUNCTION invite_user_to_base (base_id bigint, email_or_uid text, access_level AccessControlLevel)
returns int
language plpgsql
security definer
SET search_path = public
as $$
DECLARE
  valid_base bool := false;
  usr_uid uuid;
BEGIN
  SELECT $1 in (SELECT get_owned_base_ids_for_user()) into valid_base;
  IF NOT valid_base THEN RETURN 2; END IF;

  select id INTO usr_uid from auth.users where auth.users.email = email_or_uid OR auth.users.id = uuid_or_null(email_or_uid) LIMIT 1;
  IF usr_uid IS NULL THEN RETURN 1; END IF;

  INSERT INTO access_controls (base_id, user_id, access_level) VALUES (base_id, usr_uid, access_level);

  RETURN 0;
END;
$$;

-- Call with supabase.rpc("invite_user_to_base", {base_id: 5, email_or_uid: "59a8ceba-a13b-4277-aa71-cd6f3a683172", access_level: "viewer" }).then(console.log)
