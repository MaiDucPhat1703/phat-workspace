-- Read-only diagnosis. Do not post results publicly: they contain personal addresses/data.
select owner_id from pw_private.owner_config;
select user_id,revision,updated_at,jsonb_array_length(payload->'tasks') as task_count from public.workspaces;
select user_id,last_run,configured,detail from public.mail_runtime;
select created_at,kind,status,message from public.mail_jobs order by created_at desc limit 20;
