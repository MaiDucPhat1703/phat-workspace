-- Phát Workspace. Run as project owner in Supabase SQL Editor.
-- Re-running this file keeps existing data.
begin;
create schema if not exists pw_private;
revoke all on schema pw_private from public, anon, authenticated;
create table if not exists pw_private.owner_config (
 singleton boolean primary key default true check(singleton),
 owner_id uuid not null references auth.users(id)
);
revoke all on pw_private.owner_config from public, anon, authenticated;
create or replace function pw_private.assert_owner() returns uuid
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
 if uid is null or not exists(select 1 from pw_private.owner_config where owner_id=uid) then
  raise exception 'Tài khoản chưa được cấp quyền chủ sở hữu. Kiểm tra bước 02_owner.sql.' using errcode='42501';
 end if;
 return uid;
end; $$;
revoke all on function pw_private.assert_owner() from public, anon, authenticated;

create table if not exists public.workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=2000000),
 revision integer not null default 1 check(revision>0),
 updated_at timestamptz not null default now()
);
create table if not exists public.mail_jobs (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('test','digest')),
 dedupe_key text not null,
 recipient text not null check(length(recipient)<=254 and recipient !~ '[\r\n]'),
 status text not null default 'pending' check(status in ('pending','sending','accepted','failed','cancelled','unknown')),
 created_at timestamptz not null default now(),
 claimed_at timestamptz,
 finished_at timestamptz,
 message text not null default '',
 unique(user_id,dedupe_key)
);
create index if not exists mail_jobs_pending on public.mail_jobs(status,created_at);
create index if not exists mail_jobs_user_history on public.mail_jobs(user_id,created_at desc);
create table if not exists public.mail_runtime (
 user_id uuid primary key references auth.users(id) on delete cascade,
 last_run timestamptz not null default now(),
 configured boolean not null default false,
 detail text not null default ''
);
alter table public.workspaces enable row level security;
alter table public.mail_jobs enable row level security;
alter table public.mail_runtime enable row level security;
-- No direct table policies/grants for browser users: only the owner-checked RPCs below.
revoke all on public.workspaces,public.mail_jobs,public.mail_runtime from public,anon,authenticated;
grant all on public.workspaces,public.mail_jobs,public.mail_runtime to service_role;

create or replace function pw_private.validate_state(p jsonb) returns void
language plpgsql set search_path = '' as $$
begin
 if p is null or jsonb_typeof(p) is distinct from 'object'
  or jsonb_typeof(p->'tasks') is distinct from 'array'
  or jsonb_typeof(p->'projects') is distinct from 'array'
  or jsonb_typeof(p->'settings') is distinct from 'object'
  or jsonb_typeof(p->'notes') is distinct from 'string'
  or octet_length(p::text)>2000000 then raise exception 'Dữ liệu không đúng cấu trúc hoặc quá lớn.'; end if;
 if jsonb_array_length(p->'tasks')>2000 or jsonb_array_length(p->'projects')>100
  or length(p->>'notes')>50000
  or jsonb_typeof(p->'settings'->'emailEnabled') is distinct from 'boolean'
  or (p->'settings'->>'digestTime') is null
  or (p->'settings'->>'digestTime') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
  or (p->'settings'->>'email') is null
  or length(p->'settings'->>'email')>254
  or ((p->'settings'->>'email')<>'' and (p->'settings'->>'email') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
 then raise exception 'Kiểm tra email, giờ nhắc, số lượng công việc và ghi chú.'; end if;
end; $$;
revoke all on function pw_private.validate_state(jsonb) from public,anon,authenticated;

create or replace function public.pw_open_workspace(p_seed jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid:=pw_private.assert_owner(); w public.workspaces;
begin
 if not exists(select 1 from public.workspaces where user_id=uid) then
  perform pw_private.validate_state(p_seed);
  insert into public.workspaces(user_id,payload) values(uid,p_seed) on conflict(user_id) do nothing;
 end if;
 select * into w from public.workspaces where user_id=uid;
 return jsonb_build_object('state',w.payload,'revision',w.revision,'updatedAt',w.updated_at,'userEmail',coalesce(auth.jwt()->>'email',''));
end; $$;
create or replace function public.pw_save_workspace(p_state jsonb,p_revision integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid:=pw_private.assert_owner(); rev integer;
begin
 perform pw_private.validate_state(p_state);
 select revision into rev from public.workspaces where user_id=uid for update;
 if rev is null then raise exception 'Chưa khởi tạo dữ liệu. Tải lại trang.'; end if;
 if p_revision is null or rev<>p_revision then
  return jsonb_build_object('ok',false,'status',409,'body',jsonb_build_object('error','Một tab khác vừa lưu. Bấm Tải dữ liệu mới nhất trước khi sửa tiếp.'));
 end if;
 update public.workspaces set payload=p_state,revision=rev+1,updated_at=now() where user_id=uid;
 return jsonb_build_object('revision',rev+1);
end; $$;
create or replace function public.pw_request_test() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid:=pw_private.assert_owner(); w public.workspaces; recipient text;
begin
 select * into w from public.workspaces where user_id=uid for update;
 recipient:=lower(trim(w.payload->'settings'->>'email'));
 if recipient is null or recipient='' then raise exception 'Điền email nhận rồi lưu trước.'; end if;
 if exists(select 1 from public.mail_jobs where user_id=uid and kind='test' and created_at>now()-interval '1 minute') then
  return jsonb_build_object('ok',false,'status',429,'body',jsonb_build_object('error','Chờ một phút trước khi yêu cầu gửi thử tiếp.'));
 end if;
 if (select count(*) from public.mail_jobs where user_id=uid and kind='test' and created_at>now()-interval '24 hours')>=10 then
  return jsonb_build_object('ok',false,'status',429,'body',jsonb_build_object('error','Đã đủ 10 email thử trong 24 giờ.'));
 end if;
 insert into public.mail_jobs(user_id,kind,dedupe_key,recipient) values(uid,'test','test:'||gen_random_uuid()::text,recipient);
 return jsonb_build_object('message','Đã xếp email thử vào hàng đợi. Chạy workflow Deadline reminders trên GitHub để gửi ngay; lịch tự động khoảng 15 phút có thể trễ.');
end; $$;
create or replace function public.pw_mail_status() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid:=pw_private.assert_owner(); runtime public.mail_runtime; history jsonb;
begin
 select * into runtime from public.mail_runtime where user_id=uid;
 select coalesce(jsonb_agg(x order by x->>'created_at' desc),'[]'::jsonb) into history from (
  select jsonb_build_object('id',id,'created_at',created_at,'kind',kind,'status',status,'message',message,'recipient',recipient) x
  from public.mail_jobs where user_id=uid order by created_at desc limit 30
 ) a;
 return jsonb_build_object('configured',coalesce(runtime.configured,false),'provider','gmail','schedulerEnabled',coalesce(runtime.last_run>now()-interval '90 minutes',false),'lastRun',runtime.last_run,'detail',coalesce(runtime.detail,''),'logs',history);
end; $$;
revoke all on function public.pw_open_workspace(jsonb),public.pw_save_workspace(jsonb,integer),public.pw_request_test(),public.pw_mail_status() from public,anon,authenticated;
grant execute on function public.pw_open_workspace(jsonb),public.pw_save_workspace(jsonb,integer),public.pw_request_test(),public.pw_mail_status() to authenticated;
commit;

-- Worker reads only the currently configured owner's workspace, even after ownership changes.
create or replace function public.pw_worker_workspace() returns setof public.workspaces
language sql security definer set search_path = '' as $$
 select w.* from public.workspaces w join pw_private.owner_config c on c.owner_id=w.user_id;
$$;
revoke all on function public.pw_worker_workspace() from public,anon,authenticated;
grant execute on function public.pw_worker_workspace() to service_role;
