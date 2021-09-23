


CREATE OR REPLACE FUNCTION update_knowledge_view (kv knowledge_views)
returns knowledge_views
language plpgsql
security definer -- can use "security definer" as we check
-- in the function if they have the privileges to edit these rows
SET search_path = public
as $$
DECLARE
  -- allowed_base_ids bigint;
  num_of_rows int;
  existing knowledge_views%ROWTYPE;
BEGIN
  -- allowed_base_ids := (select get_owned_base_ids_for_authorised_user() UNION select get_bases_editable_or_viewable_for_authorised_user(false));

  -- IF kv.base_id not in allowed_base_ids THEN
  IF kv.base_id not in (select get_owned_base_ids_for_authorised_user() UNION select get_bases_editable_or_viewable_for_authorised_user(false)) THEN
    RAISE sqlstate 'PT403' using
      message = 'Forbidden',
      detail = 'Invalid base',
      hint = 'You do not own or are an editor of this base and its knowledge_views';
  END IF;


  UPDATE knowledge_views
  SET
    modified_at = timezone('utc'::text, now()),
    -- base_id = kv.base_id,
    title = kv.title,
    json = kv.json
  WHERE id = kv.id AND modified_at = kv.modified_at;

  GET DIAGNOSTICS num_of_rows = ROW_COUNT;


  -- Get the latest value
  SELECT * INTO existing FROM knowledge_views WHERE id = kv.id;


  IF num_of_rows = 0 THEN
    IF NOT FOUND THEN
      RAISE sqlstate 'PT404' using
        message = 'Not Found',
        detail = 'Unknown knowledge_view',
        hint = 'Can not find knowledge_view by that id';
    ELSE
      RAISE sqlstate 'PT409' using
        message = 'Conflict',
        detail = row_to_json(existing),
        hint = 'You must update with a matching modified_at';
    END IF;
  END IF;


  return existing;
END;
$$;






CREATE OR REPLACE FUNCTION update_wcomponent (kv wcomponents)
returns wcomponents
language plpgsql
security definer -- can use "security definer" as we check
-- in the function if they have the privileges to edit these rows
SET search_path = public
as $$
DECLARE
  -- allowed_base_ids bigint;
  num_of_rows int;
  existing wcomponents%ROWTYPE;
BEGIN
  -- allowed_base_ids := (select get_owned_base_ids_for_authorised_user() UNION select get_bases_editable_or_viewable_for_authorised_user(false));

  -- IF kv.base_id not in allowed_base_ids THEN
  IF kv.base_id not in (select get_owned_base_ids_for_authorised_user() UNION select get_bases_editable_or_viewable_for_authorised_user(false)) THEN
    RAISE sqlstate 'PT403' using
      message = 'Forbidden',
      detail = 'Invalid base',
      hint = 'You do not own or are an editor of this base and its wcomponents';
  END IF;


  UPDATE wcomponents
  SET
    modified_at = timezone('utc'::text, now()),
    -- base_id = kv.base_id,
    title = kv.title,
    json = kv.json
  WHERE id = kv.id AND modified_at = kv.modified_at;

  GET DIAGNOSTICS num_of_rows = ROW_COUNT;


  -- Get the latest value
  SELECT * INTO existing FROM wcomponents WHERE id = kv.id;


  IF num_of_rows = 0 THEN
    IF NOT FOUND THEN
      RAISE sqlstate 'PT404' using
        message = 'Not Found',
        detail = 'Unknown wcomponent',
        hint = 'Can not find wcomponent by that id';
    ELSE
      RAISE sqlstate 'PT409' using
        message = 'Conflict',
        detail = row_to_json(existing),
        hint = 'You must update with a matching modified_at';
    END IF;
  END IF;


  return existing;
END;
$$;
