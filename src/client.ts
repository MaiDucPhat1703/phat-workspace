import {createClient} from '@supabase/supabase-js';
import {isPublishableKey} from './lib/public-config';
const url=import.meta.env.VITE_SUPABASE_URL||'';
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'';
export const configError=!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)||!isPublishableKey(key)?'Chưa cấu hình Supabase: thêm VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY vào GitHub Variables, sau đó chạy lại Deploy website. Tuyệt đối không dùng secret key cho giao diện.':'';
export const supabase=configError?null:createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
