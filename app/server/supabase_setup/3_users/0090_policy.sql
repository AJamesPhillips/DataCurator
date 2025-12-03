-- Copied between DataCurator/app/server/supabase_setup/3_users/0090_policy.sql
-- and wikisim wikisim-supabase/supabase/migrations/2022_03_10_03_user_table_policies.sql repo


alter table public.users enable row level security;


CREATE policy "User can insert their own user entry" on public.users for insert with check ( users.id = (select auth.uid()) );
CREATE policy "User can update their own user entry" on public.users for update using ( users.id = (select auth.uid()) ) with check ( users.id = (select auth.uid()) );

--- The user table currently only contains their user name so we can allow all
--- users to read all user names
--- SECURITY
CREATE POLICY "Anyone can read all users" ON public.users FOR SELECT USING ( true );
