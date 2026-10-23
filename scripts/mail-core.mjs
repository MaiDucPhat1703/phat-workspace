import {createHash} from 'node:crypto';
import {stateSchema,daysUntil} from '../src/lib/model.ts';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function vietnamTime(now){return {day:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(now),time:new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now)}}
export function buildDigest(state,now,siteUrl=''){
 const {day}=vietnamTime(now);
 const tasks=state.tasks.filter(t=>t.status!=='done'&&t.due&&daysUntil(t.due,day)<=t.remind).sort((a,b)=>a.due.localeCompare(b.due));
 const lines=tasks.map(t=>{const n=daysUntil(t.due,day);return {title:t.title,project:state.projects.find(p=>p.id===t.project)?.name||'',due:t.due,label:n<0?`Quá hạn ${-n} ngày`:n===0?'Đến hạn hôm nay':`Còn ${n} ngày`}});
 const subject=`[Phát Workspace] ${tasks.length} việc cần chú ý · ${day}`;
 const text=['Chào Phát,',...lines.map((t,i)=>`${i+1}. ${t.title}\n${t.project} · Hạn ${t.due} · ${t.label}`),siteUrl?'Mở công việc: '+siteUrl:'','Đổi địa chỉ nhận, giờ gửi hoặc tắt nhắc trong Cài đặt của web.'].filter(Boolean).join('\n\n');
 const html=`<div style="font-family:Arial,sans-serif;color:#253e32;max-width:640px;margin:auto;padding:24px"><h2 style="color:#287c68">Phát Workspace</h2><p>Chào Phát, đây là các việc cần chú ý:</p>${lines.map(t=>`<div style="border:1px solid #dae5d9;padding:14px;border-radius:10px;margin:10px 0"><strong>${escape(t.title)}</strong><p>${escape(t.project)} · Hạn ${t.due} · ${t.label}</p></div>`).join('')}${siteUrl?`<p><a href="${escape(siteUrl)}">Mở công việc</a></p>`:''}<small>Đổi email hoặc tắt nhắc trong Cài đặt của web.</small></div>`;
 return {tasks,day,subject,text,html};
}
export function digestKey(user,day,recipient){return 'digest:'+day+':'+createHash('sha256').update(user+'|'+recipient.toLowerCase()).digest('hex')}
export function safeFailure(error){const code=String(error?.code||'');if(code==='EAUTH')return {status:'failed',message:'Gmail từ chối đăng nhập. Kiểm tra SMTP_USER, mật khẩu ứng dụng và xác minh hai bước.'};if(code==='EENVELOPE')return {status:'failed',message:'Gmail từ chối địa chỉ gửi hoặc nhận. Kiểm tra email đã lưu.'};return {status:'unknown',message:'Không xác định chắc email đã được gửi hay chưa. Kiểm tra Inbox/Spam và GitHub Actions. Không tự gửi lại để tránh thư trùng.'};}
export async function runReminders({store,send,now=new Date(),siteUrl='',configured=true}){
 const rows=await store.ownerWorkspace();
 if(!rows.length)return {checked:0,sent:0,skipped:'no-workspace'};
 const row=rows[0],user=row.user_id;
 await store.heartbeat(user,configured,configured?'Bộ kiểm tra đã chạy. Cấu hình gửi đã có; cần email thử để xác minh thực nhận.':'Thiếu SMTP_USER hoặc SMTP_APP_PASSWORD trong GitHub Secrets.',now);
 if(!configured)throw new Error('Chưa đủ cấu hình SMTP. Xem phần GitHub Secrets trong hướng dẫn.');
 const state=stateSchema.parse(row.payload),settings=state.settings,{day,time}=vietnamTime(now);
 const digest=buildDigest(state,now,siteUrl);
 await store.expireStale(user,now);
 if(settings.emailEnabled&&settings.email&&time>=settings.digestTime&&digest.tasks.length){await store.enqueue({user_id:user,kind:'digest',dedupe_key:digestKey(user,day,settings.email),recipient:settings.email.toLowerCase()});}
 const jobs=await store.pending(user);let sent=0,uncertain=0;
 for(const job of jobs){
  if(job.kind==='digest'&&(!settings.emailEnabled||!settings.email||job.recipient!==settings.email.toLowerCase()||job.dedupe_key!==digestKey(user,day,settings.email)||time<settings.digestTime||!digest.tasks.length)){
   await store.finish(job.id,'cancelled','Đã đổi lịch/cài đặt hoặc không còn công việc cần nhắc.',now);continue;
  }
  if(!await store.claim(job.id,now))continue;
  const message=job.kind==='test'?{subject:'[Phát Workspace] Kiểm tra email nhắc deadline',text:'Chào Phát, đây là email thử từ hệ thống tự quản lý của bạn.\n\nEmail nhắc deadline sẽ gửi theo ngày hạn và cài đặt đã lưu.\n'+(siteUrl?'Mở công việc: '+siteUrl:'')}:digest;
  try{await send({to:job.recipient,subject:message.subject,text:message.text,html:message.html});}
  catch(e){const failure=safeFailure(e);await store.finish(job.id,failure.status,failure.message,now);uncertain++;continue;}
  // Deliberately outside the SMTP catch: if this write fails, leave 'sending'. A later run marks it unknown, never blindly resends.
  await store.finish(job.id,'accepted',job.kind==='test'?'Gmail đã tiếp nhận email thử. Kiểm tra Inbox/Spam.':`Gmail đã tiếp nhận bản nhắc ${digest.tasks.length} việc.`,now);sent++;
 }
 await store.cleanup(user,now);
 return {checked:1,sent,problems:uncertain};
}
