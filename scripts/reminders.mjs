import {createClient} from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import {runReminders} from './mail-core.mjs';
const env=process.env;
function required(name){if(!env[name])throw new Error('Thiếu '+name+' trong GitHub Secrets/Variables.');return env[name];}
const url=required('SUPABASE_URL'),key=required('SUPABASE_SECRET_KEY');
if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url))throw new Error('SUPABASE_URL không đúng định dạng dự án Supabase.');
if(!key.startsWith('sb_secret_')&&!key.startsWith('eyJ'))throw new Error('SUPABASE_SECRET_KEY cần secret key hoặc service_role key, không dùng publishable key.');
let siteUrl=required('PUBLIC_SITE_URL');
const parsed=new URL(siteUrl);if(parsed.protocol!=='https:')throw new Error('PUBLIC_SITE_URL phải dùng https.');
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
async function result(query){const {data,error}=await query;if(error)throw new Error('Thao tác Supabase thất bại. Kiểm tra secret key, schema SQL, kết nối và hạn mức.');return data;}
const store={
 ownerWorkspace:()=>result(db.rpc('pw_worker_workspace')),
 heartbeat:(user,configured,detail,now)=>result(db.from('mail_runtime').upsert({user_id:user,configured,detail,last_run:now.toISOString()})),
 enqueue:job=>result(db.from('mail_jobs').upsert(job,{onConflict:'user_id,dedupe_key',ignoreDuplicates:true})),
 pending:user=>result(db.from('mail_jobs').select('*').eq('user_id',user).eq('status','pending').order('created_at').limit(12)),
 claim:async(id,now)=>(await result(db.from('mail_jobs').update({status:'sending',claimed_at:now.toISOString()}).eq('id',id).eq('status','pending').select('id'))).length===1,
 finish:(id,status,message,now)=>result(db.from('mail_jobs').update({status,message,finished_at:now.toISOString()}).eq('id',id)),
 async expireStale(user,now){await result(db.from('mail_jobs').update({status:'unknown',message:'Lần gửi trước bị gián đoạn. Kiểm tra hộp thư; không tự gửi lại để tránh trùng.',finished_at:now.toISOString()}).eq('user_id',user).eq('status','sending').lt('claimed_at',new Date(now.getTime()-900000).toISOString()));await result(db.from('mail_jobs').update({status:'cancelled',message:'Yêu cầu đã quá 24 giờ.',finished_at:now.toISOString()}).eq('user_id',user).eq('status','pending').lt('created_at',new Date(now.getTime()-86400000).toISOString()));},
 cleanup:(user,now)=>result(db.from('mail_jobs').delete().eq('user_id',user).lt('created_at',new Date(now.getTime()-90*86400000).toISOString()))
};
const configured=!!(env.SMTP_USER&&env.SMTP_APP_PASSWORD);
const transport=nodemailer.createTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user:env.SMTP_USER,pass:env.SMTP_APP_PASSWORD?.replace(/\s/g,'')},connectionTimeout:15000,greetingTimeout:15000,socketTimeout:25000});
try{const summary=await runReminders({store,siteUrl,configured,send:async message=>{const r=await transport.sendMail({from:{name:'Phát Workspace',address:env.SMTP_USER},...message});if(!r.accepted?.length){const err=new Error('Recipient rejected');err.code='EENVELOPE';throw err;}}});console.log('Deadline reminder check:',JSON.stringify(summary));if(summary.problems)process.exitCode=1;}
catch(e){console.error(e.name==='ZodError'?'Dữ liệu công việc chưa đúng cấu trúc. Kiểm tra bản JSON đã nhập.':String(e.message).includes('SMTP')||String(e.message).includes('Supabase')||String(e.message).includes('PUBLIC_SITE_URL')?e.message:'Không hoàn tất kiểm tra. Xem cấu hình và trạng thái Supabase. Không in bí mật ra log.');process.exitCode=1;}
finally{transport.close();}
