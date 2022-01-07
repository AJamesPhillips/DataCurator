-- only to be used for clearing up accounts made for debugging purposes

DELETE FROM knowledge_views WHERE base_id in (SELECT id from bases WHERE owner_user_id='1234');
DELETE FROM wcomponents WHERE base_id in (SELECT id from bases WHERE owner_user_id='1234');
DELETE FROM access_controls WHERE base_id in (SELECT id from bases WHERE owner_user_id='1234');
DELETE FROM access_controls WHERE user_id='1234';
DELETE FROM bases WHERE owner_user_id='1234';
DELETE FROM users WHERE id='1234';
DELETE FROM auth.users WHERE id='1234';
