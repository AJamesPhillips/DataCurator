


alter table public.bases enable row level security;


CREATE policy "Users can read their own bases" on public.bases for select using ( auth.uid() = owner_user_id );
CREATE policy "Users can insert their own bases" on public.bases for insert with check ( auth.uid() = owner_user_id );
CREATE policy "Users can update their own bases" on public.bases for update using ( auth.uid() = owner_user_id ) with check ( auth.uid() = owner_user_id );
-- This older version used an older version of the function that leaked information
-- ... select get_bases_editable_or_viewable_for_authorised_user(auth.uid(), true) ...
CREATE policy "Users can read bases they are viewers or editors of" on public.bases for select using ( bases.id in (
  select get_bases_editable_or_viewable_for_authorised_user(true)
));
CREATE policy "Everyone can read public bases" on public.bases for select using ( bases.public_read );

