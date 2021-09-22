
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



CREATE OR REPLACE FUNCTION get_owned_access_control_user_ids_for_authorised_user()
returns setof uuid
stable
language sql
security definer
SET search_path = public
as $$
  select user_id
  from access_controls
  left join bases
  on access_controls.base_id = bases.id
  where bases.owner_user_id = auth.uid() and access_controls.access_level <> 'none'::AccessControlLevel;
$$;



CREATE OR REPLACE FUNCTION get_fellow_access_control_user_ids_for_authorised_user()
returns setof uuid
stable
language sql
security definer
SET search_path = public
as $$
  select user_id
  from access_controls
  where user_id <> auth.uid()
    AND access_level <> 'none'::AccessControlLevel -- fellow users are not exclude
    AND access_controls.base_id in (
      SELECT base_id
      from access_controls
      WHERE user_id = auth.uid()
      AND access_level <> 'none'::AccessControlLevel -- authored user is not exclude
  );
$$;
