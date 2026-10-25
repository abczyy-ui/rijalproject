import {auth,dayStart} from "./_lib.js";
export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).send("Method not allowed");
  const a=await auth(req);if(!a)return res.status(401).send("❌ Sesi habis, login ulang.");
  if(a.role!=="admin"){
    const {count}=await a.s.from("deploys").select("*",{count:"exact",head:true}).eq("user_id",a.user.id).gte("created_at",dayStart());
    if(count>=5)return res.status(429).send("❌ Batas 5x deploy per hari tercapai. Coba lagi besok.");
  }
  const {files=[],name}=req.body||{};
  if(!files.length)return res.status(400).send("❌ Tidak ada file.");
  res.setHeader("Content-Type","text/plain; charset=utf-8");
  res.setHeader("Cache-Control","no-cache, no-transform");
  const log=t=>res.write(t+"\n");
  const H={Authorization:`Bearer ${process.env.VERCEL_TOKEN}`,"Content-Type":"application/json"};
  const slug=((name||"site").toLowerCase().replace(/[^a-z0-9-]/g,"-").slice(0,40)||"site")+"-"+Math.random().toString(36).slice(2,6);
  try{
    log("$ membuat deployment "+slug);
    const r=await fetch("https://api.vercel.com/v13/deployments",{method:"POST",headers:H,body:JSON.stringify({
      name:slug,files:files.map(f=>({file:f.file,data:f.data,encoding:"base64"})),projectSettings:{framework:null},target:"production"})});
    const dep=await r.json();
    if(!dep.id)throw new Error(dep.error?.message||JSON.stringify(dep));
    const {data:row}=await a.s.from("deploys").insert({user_id:a.user.id,name:slug,url:"https://"+dep.url,state:dep.readyState}).select("id").single();
    log("> id: "+dep.id);
    let st=dep.readyState,last="",n=0;
    while(!["READY","ERROR","CANCELED"].includes(st)&&n++<25){
      await new Promise(s=>setTimeout(s,2000));
      st=(await (await fetch("https://api.vercel.com/v13/deployments/"+dep.id,{headers:H})).json()).readyState;
      if(st!==last){log("> status: "+st);last=st;}
    }
    if(row)await a.s.from("deploys").update({state:st}).eq("id",row.id);
    log(st==="READY"?`\n✅ SELESAI: https://${dep.url}`:`\n❌ ${st}`);
  }catch(e){log("❌ ERROR: "+e.message)}
  res.end();
}
