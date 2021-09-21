


alter table public.knowledge_views enable row level security;
alter table public.wcomponents enable row level security;


CREATE policy "Users can read their own bases knowledge views" on public.knowledge_views for select using ( auth.uid() in (SELECT owner_user_id from public.bases WHERE id = base_id) );
CREATE policy "Users can insert their own bases knowledge views" on public.knowledge_views for insert with check ( auth.uid() in (SELECT owner_user_id from public.bases WHERE id = base_id) );
CREATE policy "Users can update their own bases knowledge views" on public.knowledge_views for update using ( auth.uid() in (SELECT owner_user_id from public.bases WHERE id = base_id) ) with check ( auth.uid() in (SELECT owner_user_id from public.bases WHERE id = base_id) );

CREATE policy "Users can read another users bases knowledge views when editor or viewer" on public.knowledge_views for select using ( auth.uid() in  );
