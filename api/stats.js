import {auth,dayStart} from "./_lib.js";
export default async function handler(req,res){
  const a=await auth(req);if(!a)return res.status(401).json({error:"Belum login"});
  const admin=a.role==="admin";
  let q=a.s.from("deploys").select("*",{count:"exact",head:true});
  if(!admin)q=q.eq("user_id",a.user.id);
  const total=(await q).count||0;
  const today=(await a.s.from("deploys").select("*",{count:"exact",head:true}).eq("user_id",a.user.id).gte("created_at",dayStart())).count||0;
  res.json({deployed:total,today,limit:admin?null:5,role:a.role,username:a.username,avatar_url:a.avatar_url||null,email:a.user.email});
}
