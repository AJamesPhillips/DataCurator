


alter table public.knowledge_views enable row level security;
alter table public.wcomponents enable row level security;


CREATE policy "Users can read their own bases knowledge views" on public.knowledge_views for select using ( auth.uid() in (select get_owned_base_ids_for_authorised_user()) );
CREATE policy "Users can insert their own bases knowledge views" on public.knowledge_views for insert with check ( auth.uid() in (select get_owned_base_ids_for_authorised_user()) );
CREATE policy "Users can update their own bases knowledge views" on public.knowledge_views for update using ( auth.uid() in (select get_owned_base_ids_for_authorised_user()) ) with check ( auth.uid() in (select get_owned_base_ids_for_authorised_user()) );

CREATE policy "Other users can read knowledge views they are viewers or editors of" on public.knowledge_views for select using ( knowledge_views.base_id in ( select get_bases_editable_or_viewable_for_authorised_user(true)));
CREATE policy "Other users can insert knowledge views they are editors of" on public.knowledge_views for insert with check ( knowledge_views.base_id in ( select get_bases_editable_or_viewable_for_authorised_user(false)));
CREATE policy "Other users can update knowledge views they are editors of" on public.knowledge_views for update using ( knowledge_views.base_id in ( select get_bases_editable_or_viewable_for_authorised_user(false))) with check ( knowledge_views.base_id in ( select get_bases_editable_or_viewable_for_authorised_user(false)));
