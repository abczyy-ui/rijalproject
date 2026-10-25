import {auth} from "./_lib.js";
export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  const a=await auth(req);if(!a)return res.status(401).json({error:"Belum login"});
  const url=String((req.body||{}).avatar_url||"").trim();
  if(url){
    let u;try{u=new URL(url)}catch{return res.status(400).json({error:"URL tidak valid"})}
    if(!/^https?:$/.test(u.protocol)||url.length>500)return res.status(400).json({error:"Pakai URL gambar http(s), maksimal 500 karakter"});
  }
  const {error}=await a.s.from("profiles").update({avatar_url:url||null}).eq("id",a.user.id);
  if(error)return res.status(500).json({error:error.message});
  res.json({ok:true,avatar_url:url||null});
}
