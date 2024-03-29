DROP TABLE IF EXISTS access_controls_list;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS usrs;

CREATE TABLE usrs (
  id int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name text NOT NULL
);

INSERT INTO usrs (name) VALUES ('Allie');
INSERT INTO usrs (name) VALUES ('Bay');
INSERT INTO usrs (name) VALUES ('Charlie');

CREATE TABLE groups (
  id int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  owner_user_id int NOT NULL,
  title text NOT NULL,
  CONSTRAINT fk_groups_usrs
    FOREIGN KEY(owner_user_id)
	  REFERENCES usrs(id)
);

INSERT INTO groups (owner_user_id, title) VALUES (1, 'Solo'); -- Allie owns the Solo group (id 1)
INSERT INTO groups (owner_user_id, title) VALUES (1, 'Private'); -- Allie owns the Private group (id 2)
INSERT INTO groups (owner_user_id, title) VALUES (2, 'Everybody'); -- Bay owns the Everybody group (id 3)


DROP TYPE IF EXISTS AccessControlLevel2;
CREATE TYPE AccessControlLevel2 AS ENUM ('editor', 'viewer', 'none');

CREATE TABLE access_controls_list (
  user_id int NOT NULL,
  group_id int NOT NULL,
  access_level AccessControlLevel2 NOT NULL,
  PRIMARY KEY(group_id, user_id),
  CONSTRAINT fk_acls_usrs
    FOREIGN KEY(user_id)
	  REFERENCES usrs(id),
  CONSTRAINT fk_acls_groups
    FOREIGN KEY(group_id)
	  REFERENCES groups(id)
);

INSERT INTO access_controls_list (group_id, user_id, access_level) VALUES (1, 3, 'none'); -- Charlie is explicitly marked as having no access 'Solo' group (by Allie)
INSERT INTO access_controls_list (group_id, user_id, access_level) VALUES (2, 2, 'editor'); -- Bay has editor access to 'Private' group (by Allie)
INSERT INTO access_controls_list (group_id, user_id, access_level) VALUES (3, 1, 'viewer'); -- Allie has viewer access to 'Everybody' group (by Bay)
INSERT INTO access_controls_list (group_id, user_id, access_level) VALUES (3, 3, 'viewer'); -- Charlie has viewer access to 'Everybody' group (by Bay)


alter table usrs enable row level security;
alter table groups enable row level security;
alter table access_controls_list enable row level security;


-- Mock superbase auth.uid() function to return as if user is Allie (1), Bay (2) or Charlie (3)
-- Become Allie
CREATE OR REPLACE FUNCTION auth_uid() RETURNS int AS $$ BEGIN RETURN 1; END; $$ LANGUAGE plpgsql;

-- Running `supabase.from('groups').select('*').then(console.log)` will show data: []
CREATE policy "Users can read their own groups" on groups for select using ( auth_uid() = owner_user_id );
-- Running `supabase.from('groups').select('*').then(console.log)` will now show data: [
--    {id: 1, owner_user_id: 1, title: 'Solo'},
--    {id: 2, owner_user_id: 1, title: 'Private'}]

-- Become Bay
CREATE OR REPLACE FUNCTION auth_uid() RETURNS int AS $$ BEGIN RETURN 2; END; $$ LANGUAGE plpgsql;
-- Running `supabase.from('groups').select('*').then(console.log)` will now show data: [{id: 3, owner_user_id: 2, title: 'Everybody'}]


-- Become Charlie
CREATE OR REPLACE FUNCTION auth_uid() RETURNS int AS $$ BEGIN RETURN 3; END; $$ LANGUAGE plpgsql;
-- Running `supabase.from('groups').select('*').then(console.log)` will show data: []



-- Become Bay
CREATE OR REPLACE FUNCTION auth_uid() RETURNS int AS $$ BEGIN RETURN 2; END; $$ LANGUAGE plpgsql;
-- Running `supabase.from('access_controls_list').select('*').then(console.log)` will show data: []
CREATE policy "Users can read their own access_controls_list" on access_controls_list for select using ( auth_uid() = access_controls_list.group_id OR auth_uid() in (SELECT owner_user_id from groups WHERE groups.id = access_controls_list.group_id) );
-- Running `supabase.from('access_controls_list').select('*').then(console.log)` will show data: [
-- {user_id: 1, group_id: 3, access_level: 'viewer'},
-- {user_id: 3, group_id: 3, access_level: 'viewer'}]

-- Become Allie
CREATE OR REPLACE FUNCTION auth_uid() RETURNS int AS $$ BEGIN RETURN 1; END; $$ LANGUAGE plpgsql;
-- Running `supabase.from('access_controls_list').select('*').then(console.log)` will show data: [
-- {user_id: 3, group_id: 1, access_level: 'none'},
-- {user_id: 2, group_id: 2, access_level: 'editor'}]


-- Now we return to groups and we want to let:
--   * Allie also see Group 3 (as they are a viewer)
--   * Bay also see Group 2 (as they an editor)
--   * Charlie see Group 3 (as they are a viewer) but not show themm anything about group 1

-- This does not work as it results in recursion
CREATE policy "Users can read groups they are viewers of" on groups for select using ( auth_uid() in (SELECT user_id from access_controls_list WHERE groups.id = access_controls_list.group_id AND (access_level = 'editor' OR access_level = 'viewer') ) );
-- Running `supabase.from('groups').select('*').then(console.log)` will show error: `infinite recursion detected in policy for relation "groups"`
DROP policy "Users can read groups they are viewers of" on groups;


CREATE OR REPLACE FUNCTION users_groups(groups_id int) RETURNS bool AS $$ BEGIN
RETURN EXISTS (SELECT * from access_controls_list WHERE groups_id = access_controls_list.group_id AND auth_uid() = access_controls_list.user_id AND (access_level = 'editor' OR access_level = 'viewer'));
END; $$ LANGUAGE plpgsql;


-- This looks horrendous and it also does not work
CREATE policy "Users can read groups they are viewers of v2" on groups for select using ( users_groups(groups.id) );
-- Running `supabase.from('groups').select('*').then(console.log)` will show error: {hint: `Increase the configuration parameter "max_stack_de…ing the platform's stack depth limit is adequate.`, message: 'stack depth limit exceeded' ...}
DROP policy "Users can read groups they are viewers of v2" on groups;
DROP FUNCTION users_groups(groups_id int);


CREATE OR REPLACE VIEW groups_viewable_join AS
SELECT access_controls_list.group_id, access_controls_list.user_id, access_controls_list.access_level
FROM groups
LEFT OUTER JOIN access_controls_list
ON groups.id = access_controls_list.group_id
WHERE access_controls_list.access_level = 'editor' OR access_controls_list.access_level = 'viewer';


CREATE policy "Users can read groups they are viewers of v3" on groups for select using ( groups.id in (select group_id from groups_viewable_join where user_id = auth_uid()) );

-- Become Allie
CREATE OR REPLACE FUNCTION auth_uid() RETURNS int AS $$ BEGIN RETURN 1; END; $$ LANGUAGE plpgsql;
-- Running `supabase.from('groups').select('*').then(console.log)` will show all 3 groups

-- Become Bay
CREATE OR REPLACE FUNCTION auth_uid() RETURNS int AS $$ BEGIN RETURN 2; END; $$ LANGUAGE plpgsql;
-- Running `supabase.from('groups').select('*').then(console.log)` will show groups id 2 & 3

-- Become Charlie
CREATE OR REPLACE FUNCTION auth_uid() RETURNS int AS $$ BEGIN RETURN 3; END; $$ LANGUAGE plpgsql;
-- Running `supabase.from('groups').select('*').then(console.log)` will only show group of id 3


-- BUT groups_viewable_join is now public which is not what we want at all.
-- CREATE policy "Users can only read their own groups_viewable_join" on groups_viewable_join for select using ( auth_uid() = user_id );
CREATE policy "Users can read groups they are viewers of v3"
DROP VIEW groups_viewable_join;
