


alter table public.access_controls enable row level security;


CREATE policy "Users can read their own base access_controls" on public.access_controls for select using ( access_controls.base_id in (select get_owned_base_ids_for_authorised_user()) );

-- See invite_user_to_base.sql
-- Call with supabase.rpc("invite_user_to_base", {base_id: 5, user_id: "59a8ceba-a1...72", access_level: "viewer" }).then(console.log)

-- Leave this insert policy still active for now despite having invite_user_to_base
CREATE policy "Users can insert their own base access_controls" on public.access_controls for insert with check ( access_controls.base_id in (select get_owned_base_ids_for_authorised_user()) );
CREATE policy "Users can update their own base access_controls" on public.access_controls for update using ( access_controls.base_id in (select get_owned_base_ids_for_authorised_user()) ) with check ( access_controls.base_id in (select get_owned_base_ids_for_authorised_user()) );


CREATE policy "Other users can read access_controls they are viewers or editors in" on public.access_controls for select using ( access_controls.user_id = auth.uid() AND (access_controls.access_level <> 'none'::AccessControlLevel));
