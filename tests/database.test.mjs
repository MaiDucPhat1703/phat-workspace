import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';import {initialState} from '../src/lib/seed.ts';
const OWNER='11111111-1111-4111-8111-111111111111',OTHER='22222222-2222-4222-8222-222222222222';
test('Postgres: owner-only RPCs, anonymous/stranger denial, CAS save, test rate limit, worker privilege',async()=>{const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create function auth.jwt() returns jsonb language sql stable as $$select jsonb_build_object('email','phat@example.com')$$;grant usage on schema auth to anon,authenticated,service_role;grant execute on function auth.uid(),auth.jwt() to anon,authenticated,service_role;insert into auth.users values('${OWNER}','phat@example.com'),('${OTHER}','other@example.com');`);
 await db.exec(await readFile('supabase/01_schema.sql','utf8'));
 await db.exec(await readFile('supabase/01_schema.sql','utf8'));
 await db.query('insert into pw_private.owner_config values(true,$1)',[OWNER]);
 async function as(role,uid=''){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.exec('set role '+role)}
 await as('anon');await assert.rejects(()=>db.query('select public.pw_open_workspace($1::jsonb)',[JSON.stringify(initialState())]),/permission denied/);
 await as('authenticated',OTHER);await assert.rejects(()=>db.query('select public.pw_open_workspace($1::jsonb)',[JSON.stringify(initialState())]),/chủ sở hữu/);
 await as('authenticated',OWNER);await assert.rejects(()=>db.query('select * from public.workspaces'),/permission denied/);await assert.rejects(()=>db.query('select public.pw_worker_workspace()'),/permission denied/);
 const state=initialState('phat@example.com');const opened=(await db.query('select public.pw_open_workspace($1::jsonb) as v',[JSON.stringify(state)])).rows[0].v;assert.equal(opened.revision,1);
 state.notes='Dữ liệu Việt ✓';const saved=(await db.query('select public.pw_save_workspace($1::jsonb,1) as v',[JSON.stringify(state)])).rows[0].v;assert.equal(saved.revision,2);
 const conflict=(await db.query('select public.pw_save_workspace($1::jsonb,1) as v',[JSON.stringify(state)])).rows[0].v;assert.equal(conflict.status,409);
 await assert.rejects(()=>db.query('select public.pw_save_workspace($1::jsonb,2)',[JSON.stringify({...state,settings:{...state.settings,email:'bad\nmail'}})]),/Kiểm tra/);
 let queued=(await db.query('select public.pw_request_test() as v')).rows[0].v;assert.match(queued.message,/hàng đợi/);
 queued=(await db.query('select public.pw_request_test() as v')).rows[0].v;assert.equal(queued.status,429);
 const mail=(await db.query('select public.pw_mail_status() as v')).rows[0].v;assert.equal(mail.logs.length,1);assert.equal(mail.configured,false);assert.equal(mail.schedulerEnabled,false);
 await as('service_role');const rows=(await db.query('select * from public.pw_worker_workspace()')).rows;assert.equal(rows.length,1);assert.equal(rows[0].payload.notes,state.notes);
 await as('authenticated',OTHER);await assert.rejects(()=>db.query('select public.pw_mail_status()'),/chủ sở hữu/);await assert.rejects(()=>db.query('select public.pw_request_test()'),/chủ sở hữu/);
}finally{await db.close();}});
