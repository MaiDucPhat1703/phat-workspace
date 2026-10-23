-- Replace ONLY the UUID below with your user UID from Authentication -> Users.
-- This selects the only account allowed to access the app. Re-running keeps app data.
insert into pw_private.owner_config(singleton,owner_id)
values(true,'REPLACE_WITH_YOUR_USER_UUID'::uuid)
on conflict(singleton) do update set owner_id=excluded.owner_id;
