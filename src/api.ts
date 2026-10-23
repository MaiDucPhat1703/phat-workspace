import {supabase} from './client';
import {initialState} from './lib/seed';
import {stateSchema} from './lib/model';
function reply(body:unknown,status=200){return {ok:status>=200&&status<300,status,json:async()=>body};}
export async function api(path:string,options:RequestInit={}){
 try{
  if(!supabase)throw new Error('Chưa cấu hình Supabase. Xem hướng dẫn setup.');
  if(path==='/api/auth/logout'){const {error}=await supabase.auth.signOut();if(error)throw error;return reply({});}
  const {data:auth,error:authError}=await supabase.auth.getUser();
  if(authError||!auth.user){window.dispatchEvent(new Event('session-expired'));return reply({error:'Phiên đăng nhập hết hạn. Đăng nhập lại.'},401);}
  const payload=typeof options.body==='string'?JSON.parse(options.body):{};
  let name:string,args:Record<string,unknown>={};
  if(path==='/api/workspace'&&options.method==='PUT'){const parsed=stateSchema.safeParse(payload.state);if(!parsed.success)return reply({error:'Kiểm tra dữ liệu, địa chỉ email và ngày hạn.'},400);name='pw_save_workspace';args={p_state:parsed.data,p_revision:payload.revision};}
  else if(path==='/api/workspace'){name='pw_open_workspace';args={p_seed:initialState(auth.user.email||'')};}
  else if(path==='/api/email/status')name='pw_mail_status';
  else if(path==='/api/email/test')name='pw_request_test';
  else return reply({error:'Không có thao tác này.'},404);
  const {data,error}=await supabase.rpc(name,args);
  if(error)throw error;
  if(data?.ok===false)return reply(data.body,data.status);
  return reply(data?.ok===true?data.body:data);
 }catch(e){const message=e instanceof Error?e.message:typeof e==='object'&&e&&'message' in e?String(e.message):'Không kết nối được dữ liệu.';return reply({error:message},500);}
}
