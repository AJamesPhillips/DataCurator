


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




CREATE OR REPLACE FUNCTION owner_user_ids_of_public_bases()
returns setof uuid
stable
language sql
security definer
SET search_path = public
as $$
  select owner_user_id
  from bases
  where bases.public_read = true;
$$;




-- If a user A is in the access_controls list of a base owned by user B, then return user B's id
CREATE OR REPLACE FUNCTION get_owner_user_ids_for_authorised_user()
returns setof uuid
stable
language sql
security definer
SET search_path = public
as $$
  select owner_user_id
  from bases
  left join access_controls
  on bases.id = access_controls.base_id
  where access_controls.user_id = auth.uid() and access_controls.access_level <> 'none'::AccessControlLevel;
$$;
