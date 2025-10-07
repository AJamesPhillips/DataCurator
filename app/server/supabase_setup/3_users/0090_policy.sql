


alter table public.users enable row level security;


CREATE policy "User can insert their own user entry" on public.users for insert with check ( users.id = (select auth.uid()) );
CREATE policy "User can update their own user entry" on public.users for update using ( users.id = (select auth.uid()) ) with check ( users.id = (select auth.uid()) );

--- The user table currently only contains their user name so we can allow all
--- users to read all user names
--- SECURITY
CREATE policy "User can read all users" on public.users for select using ( true );
