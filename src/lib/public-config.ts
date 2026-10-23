// The publishable key is intentionally public; secret/service_role keys must never enter a frontend build.
export function isPublishableKey(key:string):boolean{
 if(key.startsWith('sb_publishable_'))return !key.includes('REPLACE');
 try{const part=key.split('.')[1];if(!part)return false;const json=JSON.parse(atob(part.replace(/-/g,'+').replace(/_/g,'/')));return json.role==='anon';}catch{return false;}
}
