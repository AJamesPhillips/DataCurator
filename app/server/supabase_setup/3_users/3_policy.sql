


alter table public.users enable row level security;


CREATE policy "Users can read their own user entry" on public.users for select using ( users.id = auth.uid() );
CREATE policy "Users can insert their own user entry" on public.users for insert with check ( users.id = auth.uid() );
CREATE policy "Users can update their own user entry" on public.users for update using ( users.id = auth.uid() ) with check ( users.id = auth.uid() );


CREATE policy "Users can read user entries in owned bases" on public.users for select using ( users.id in (select get_owned_access_control_user_ids_for_authorised_user()) );
CREATE policy "Users can read fellow user entries" on public.users for select using ( users.id in (select get_fellow_access_control_user_ids_for_authorised_user()) );
