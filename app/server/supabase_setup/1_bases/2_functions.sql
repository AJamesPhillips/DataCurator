


CREATE OR REPLACE FUNCTION get_owned_base_ids_for_authorised_user()
returns setof bigint
stable
language sql
security definer
SET search_path = public
as $$
  select id
  from bases
  where bases.owner_user_id = auth.uid();
$$;



CREATE OR REPLACE FUNCTION get_bases_editable_or_viewable_for_authorised_user(allow_edit bool)
returns setof bigint
stable
language sql
security definer
SET search_path = public
as $$
  select base_id
  from access_controls
  where access_controls.user_id = auth.uid() AND ($1 AND access_controls.access_level = 'editor') OR access_controls.access_level = 'viewer';
$$;
