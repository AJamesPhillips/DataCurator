


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
