


alter table public.bases enable row level security;


CREATE policy "Users can read their own bases" on public.bases for select using ( auth.uid() = owner_user_id );
CREATE policy "Users can insert their own bases" on public.bases for insert with check ( auth.uid() = owner_user_id );
CREATE policy "Users can update their own bases" on public.bases for update using ( auth.uid() = owner_user_id ) with check ( auth.uid() = owner_user_id );
CREATE policy "Everyone can read public bases" on public.bases for select using ( bases.public_read );
