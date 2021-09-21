Enable all actions for users based on their id and base_id
(uid() = base_id)




```sql


-- -- Allow non-owners to see their access levels
-- Should use:
-- supabase.from('bases').select('*, access_controls(access_level)').then(console.log)
--
-- -- with (security_barrier) did not seem to work
-- CREATE OR REPLACE VIEW bases_with_access
-- WITH (security_barrier) AS
-- SELECT bases.id, bases.inserted_at, bases.updated_at, bases.title, bases.owner_user_id, access_controls.access_level
-- FROM bases
-- LEFT OUTER JOIN access_controls
-- ON bases.id = access_controls.base_id;




```







```sql
CREATE OR REPLACE FUNCTION show_create_table(table_name text, join_char text = E'\n' )
  RETURNS text AS
$BODY$
SELECT 'CREATE TABLE ' || $1 || ' (' || $2 || '' ||
    string_agg(column_list.column_expr, ', ' || $2 || '') ||
    '' || $2 || ');'
FROM (
  SELECT '    ' || column_name || ' ' || data_type ||
       coalesce('(' || character_maximum_length || ')', '') ||
       case when is_nullable = 'YES' then '' else ' NOT NULL' end as column_expr
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = $1
  ORDER BY ordinal_position) column_list;
$BODY$
  LANGUAGE SQL STABLE;



select show_create_table('knowledge_views');
```
