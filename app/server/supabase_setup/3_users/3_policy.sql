


alter table public.users enable row level security;


CREATE policy "User can read their own user entry" on public.users for select using ( users.id = auth.uid() );
CREATE policy "User can insert their own user entry" on public.users for insert with check ( users.id = auth.uid() );
CREATE policy "User can update their own user entry" on public.users for update using ( users.id = auth.uid() ) with check ( users.id = auth.uid() );
-- This allows you to go from knowing someone's user id or email to having access to their user table.
-- This sounds like a bad idea but for the moment we will let it pass as it's own the user name.
-- SECURITY
CREATE policy "User can read other users entries via owned bases" on public.users for select using ( users.id in (select get_owned_access_control_user_ids_for_authorised_user()) );

CREATE policy "Other users can read fellow users entries" on public.users for select using ( users.id in (select get_fellow_access_control_user_ids_for_authorised_user()) );
CREATE policy "Other users can read owner user entry" on public.users for select using ( users.id in (select get_owner_user_ids_for_authorised_user()) );
CREATE policy "Other users can read user entries of public bases" on public.users for select using ( users.id in (select owner_user_ids_of_public_bases()) );
