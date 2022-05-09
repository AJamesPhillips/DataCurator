


CREATE OR REPLACE FUNCTION update_knowledge_view (item knowledge_views)
returns knowledge_views
language plpgsql

-- This policy is necessary instead of using "security invoker", because that policy
-- would be too open and allow version unsafe updates (i.e. updates that do not first
-- check that the modified_at is the same in the DB as that given in the item to
-- update with).
-- We can use "security definer" as we check in the function if they have the
-- privileges to edit these rows.
security definer

SET search_path = public
as $$
DECLARE
  existing knowledge_views%ROWTYPE;
  -- allowed_base_ids bigint;
  num_of_rows int;
BEGIN

  SELECT * INTO existing FROM knowledge_views WHERE id = item.id;

  IF NOT FOUND THEN
    RAISE sqlstate 'PT404' using
      message = 'Not Found',
      detail = 'Unknown knowledge_view',
      hint = 'Can not find knowledge_view by that id';
  END IF;


  -- allowed_base_ids := (select get_owned_base_ids_for_authorised_user() UNION select get_bases_editable_for_authorised_user());
  -- IF existing.base_id not in allowed_base_ids THEN
  IF existing.base_id not in (select get_owned_base_ids_for_authorised_user() UNION select get_bases_editable_for_authorised_user()) THEN
    RAISE sqlstate 'PT403' using
      message = 'Forbidden',
      detail = 'Invalid base',
      -- hint = concat('You do not own or are an editor of this base ', item.base_id, ' and its knowledge_views');
      hint = 'You do not own or are an editor of this base and its knowledge_views';
  END IF;


  UPDATE knowledge_views
  SET
    modified_at = now(),
    title = item.json::json->>'title',
    json = item.json
  WHERE id = item.id AND modified_at = item.modified_at;

  GET DIAGNOSTICS num_of_rows = ROW_COUNT;


  -- Get the latest value
  SELECT * INTO existing FROM knowledge_views WHERE id = item.id;


  IF num_of_rows = 0 THEN
    RAISE sqlstate 'PT409' using
      message = 'Conflict',
      detail = row_to_json(existing),
      hint = 'You must update with a matching modified_at';
  END IF;


  return existing;
END;
$$;






CREATE OR REPLACE FUNCTION update_wcomponent (item wcomponents)
returns wcomponents
language plpgsql

-- This policy is necessary instead of using "security invoker", because that policy
-- would be too open and allow version unsafe updates (i.e. updates that do not first
-- check that the modified_at is the same in the DB as that given in the item to
-- update with).
-- We can use "security definer" as we check in the function if they have the
-- privileges to edit these rows.
security definer

SET search_path = public
as $$
DECLARE
  existing wcomponents%ROWTYPE;
  -- allowed_base_ids bigint;
  num_of_rows int;
BEGIN

  SELECT * INTO existing FROM wcomponents WHERE id = item.id;

  IF NOT FOUND THEN
    RAISE sqlstate 'PT404' using
      message = 'Not Found',
      detail = 'Unknown wcomponent',
      hint = 'Can not find wcomponent by that id';
  END IF;


  -- allowed_base_ids := (select get_owned_base_ids_for_authorised_user() UNION select get_bases_editable_for_authorised_user());
  -- IF existing.base_id not in allowed_base_ids THEN
  IF existing.base_id not in (select get_owned_base_ids_for_authorised_user() UNION select get_bases_editable_for_authorised_user()) THEN
    RAISE sqlstate 'PT403' using
      message = 'Forbidden',
      detail = 'Invalid base',
      -- hint = concat('You do not own or are an editor of this base ', item.base_id, ' and its wcomponents');
      hint = 'You do not own or are an editor of this base and its wcomponents';
  END IF;


  UPDATE wcomponents
  SET
    modified_at = now(),
    title = item.json::json->>'title',
    type = item.json::json->>'type',
    attribute_id = (item.json::json->>'attribute_wcomponent_id')::uuid,
    json = item.json
  WHERE id = item.id AND modified_at = item.modified_at;

  GET DIAGNOSTICS num_of_rows = ROW_COUNT;


  -- Get the latest value
  SELECT * INTO existing FROM wcomponents WHERE id = item.id;


  IF num_of_rows = 0 THEN
    RAISE sqlstate 'PT409' using
      message = 'Conflict',
      detail = row_to_json(existing),
      hint = 'You must update with a matching modified_at';
  END IF;


  return existing;
END;
$$;





CREATE OR REPLACE FUNCTION move_ids_to_new_base (ids uuid[], from_base_id bigint, to_base_id bigint)
returns int
language plpgsql
security definer -- can use "security definer" as we check
-- in the function if they have the privileges to edit these rows
SET search_path = public
as $$
DECLARE
  num_of_wcomponent_rows int;
  num_of_knowledge_view_rows int;
BEGIN

  IF from_base_id not in (select get_owned_base_ids_for_authorised_user() UNION select get_bases_editable_for_authorised_user()) THEN
    RAISE sqlstate 'PT403' using
      message = 'Forbidden',
      detail = 'Invalid from_base_id',
      hint = 'You do not own or are an editor of this base and its wcomponents';
  END IF;


  IF to_base_id not in (select get_owned_base_ids_for_authorised_user() UNION select get_bases_editable_for_authorised_user()) THEN
    RAISE sqlstate 'PT403' using
      message = 'Forbidden',
      detail = 'Invalid to_base_id',
      hint = 'You do not own or are an editor of this base and its wcomponents';
  END IF;


  UPDATE wcomponents
  SET
    modified_at = now(),
    base_id = to_base_id
  WHERE id = ANY (ids) AND base_id = from_base_id;

  GET DIAGNOSTICS num_of_wcomponent_rows = ROW_COUNT;


  UPDATE knowledge_views
  SET
    modified_at = now(),
    base_id = to_base_id
  WHERE id = ANY (ids) AND base_id = from_base_id;

  GET DIAGNOSTICS num_of_knowledge_view_rows = ROW_COUNT;

  return (num_of_wcomponent_rows + num_of_knowledge_view_rows);
END;
$$;
