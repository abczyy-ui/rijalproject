const $=id=>document.getElementById(id);
const sb=supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY);
document.body.insertAdjacentHTML("afterbegin",'<video id="bg" src="/bg.mp4" autoplay muted loop playsinline></video><div class="veil"></div><nav class="nav" id="nav"></nav>');
document.body.insertAdjacentHTML("beforeend",'<footer class="foot">Powered by <a href="https://rijalsatoru-xd.biz.id" target="_blank" rel="noopener">rijalsatoru-xd.biz.id</a> · <a href="https://whatsapp.com/channel/0029VbDlRM35PO139514Bb1f" target="_blank" rel="noopener">Channel WhatsApp</a></footer>');
sb.auth.getSession().then(({data:{session}})=>{
  $("nav").innerHTML='<a class="logo" href="/">CreateWeb</a><a class="b" href="/docs.html">Docs</a>'+(session?'<a class="b" href="/dashboard.html">Dashboard</a><a class="b" href="/deploy.html">Deploy</a>':'<a class="b" href="/login.html">Masuk</a>');
});
