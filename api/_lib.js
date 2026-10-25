import {createClient} from "@supabase/supabase-js";
export const sb=()=>createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_KEY,{auth:{persistSession:false}});
// awal hari WIB (reset limit jam 00:00 WIB)
export const dayStart=()=>{const d=new Date(Date.now()+7*36e5);d.setUTCHours(0,0,0,0);return new Date(d-7*36e5).toISOString()};
export async function auth(req){
  const t=(req.headers.authorization||"").replace("Bearer ","");
  const s=sb();const {data:{user}}=await s.auth.getUser(t);
  if(!user)return null;
  const {data:p}=await s.from("profiles").select("role,username,avatar_url").eq("id",user.id).single();
  return {s,user,role:p?.role||"user",username:p?.username,avatar_url:p?.avatar_url};
}
