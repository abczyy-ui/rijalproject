import {sb} from "./_lib.js";
// Membuat akun admin otomatis (aman dipanggil berkali-kali)
export default async function handler(req,res){
  const s=sb(),email="rijal@admin.id";
  const {data:{users}}=await s.auth.admin.listUsers({perPage:1000});
  let u=users.find(x=>x.email===email);
  if(!u){
    const r=await s.auth.admin.createUser({email,password:process.env.ADMIN_PASSWORD||"admin123",email_confirm:true,user_metadata:{username:"admin"}});
    if(r.error)return res.status(500).json({error:r.error.message});
    u=r.data.user;
  }
  await s.from("profiles").upsert({id:u.id,username:"admin",role:"admin"});
  res.json({ok:true});
}
