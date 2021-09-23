-- This older version used an older version of the function that leaked information
-- ... select get_bases_editable_or_viewable_for_authorised_user(auth.uid(), true) ...
CREATE policy "Other users can read bases they are viewers or editors of" on public.bases for select using ( bases.id in (
  select get_bases_editable_or_viewable_for_authorised_user(true)
));
