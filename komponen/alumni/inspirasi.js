(function(){
  var supabase = window.smansaSupabase || { getAlumni: async function(){ return []; } };
  var A=[];
  var CATS=["Semua Bidang","Teknologi","Kesehatan","Hukum","Seni & Kreatif","Bisnis"],PAGE=6,$=function(s){return document.querySelector(s)},grid=$("#inGrid"),dlg=$("#inDlg"),state={q:"",cat:"Semua Bidang",shown:PAGE},list=[],cur=-1;
  function normalizeAlumni(rows){
    return (rows||[]).map(function(r){
      return {
        id: r.id || (r.name || 'alumni').toLowerCase().replace(/[^a-z0-9]+/g,'-'),
        nama: r.name || r.nama || 'Alumni',
        foto: r.photo_url || '',
        th: Number(r.graduation_year || r.graduationYear || 2000),
        bidang: r.field || r.bidang || 'Umum',
        jabatan: r.current_occupation || r.currentOccupation || r.position || r.jabatan || 'Profesional',
        ringkas: r.summary || r.ringkas || 'Alumni SMAN 1 Singaraja.',
        cerita: r.story || r.cerita || '',
        ach: Array.isArray(r.achievements) ? r.achievements : (r.ach || []),
        pesan: r.message || r.pesan || '',
        featured: Boolean(r.is_featured || r.featured)
      };
    });
  }
  async function loadData(){
    A = normalizeAlumni(await supabase.getAlumni());
    var chipWrap = $("#inChips");
    if (chipWrap) {
      chipWrap.innerHTML = "";
      CATS.forEach(function(c){
        var b=document.createElement("button");b.type="button";b.textContent=c;b.className="in-chip";b.setAttribute("aria-pressed",c===state.cat);b.onclick=function(){state.cat=c;state.shown=PAGE;[].forEach.call(chipWrap.children,function(x){x.setAttribute("aria-pressed",x===b)});render()};chipWrap.appendChild(b)});
    }
    render();
    var h=decodeURIComponent(location.hash.slice(1));if(h){var k=A.filter(function(a){return a.id===h})[0];if(k){state.shown=Math.max(PAGE,list.indexOf(k)+1);render();open(list.indexOf(k))}}
  }
  loadData();
  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}
  function ini(n){return n.replace(/^(dr\. |Dr\. )/,"").split(" ").slice(0,2).map(function(w){return w[0]}).join("")}
  function photo(a){var image=a.foto?'<img src="'+esc(a.foto)+'" alt="Foto '+esc(a.nama)+'" width="400" height="430" loading="lazy" decoding="async" data-remove-on-error>':'';return '<span class="in-ph" data-i="'+esc(ini(a.nama))+'">'+image+'</span>'}
  var chips=$("#inChips");CATS.forEach(function(c){var b=document.createElement("button");b.type="button";b.textContent=c;b.className="in-chip";b.setAttribute("aria-pressed",c===state.cat);b.onclick=function(){state.cat=c;state.shown=PAGE;[].forEach.call(chips.children,function(x){x.setAttribute("aria-pressed",x===b)});render()};chips.appendChild(b)});
  var t;$("#inQ").addEventListener("input",function(e){clearTimeout(t);t=setTimeout(function(){state.q=e.target.value.trim().toLowerCase();state.shown=PAGE;render()},150)});$("#inMore").onclick=function(){state.shown+=PAGE;render()};
  function filtered(){return A.filter(function(a){return (state.cat==="Semua Bidang"||a.bidang===state.cat)&&(!state.q||(a.nama+a.th+a.jabatan+a.bidang+a.ringkas).toLowerCase().indexOf(state.q)>-1)})}
  function card(a){var el=document.createElement("button");el.type="button";el.className="in-card"+(a.featured?" is-feat":"");el.innerHTML=photo(a)+(a.featured?'<span class="in-star">★ Alumni Inspiratif 2026</span>':'<span class="in-yr">Angkatan '+a.th+'</span>')+'<span class="in-body"><small class="in-field">'+esc(a.bidang)+'</small><strong>'+esc(a.nama)+'</strong><em>'+esc(a.jabatan)+'</em><span class="in-sum">'+esc(a.ringkas)+'</span></span>';el.onclick=function(){open(list.indexOf(a))};return el}
  function render(){list=filtered();grid.innerHTML="";list.slice(0,state.shown).forEach(function(a){grid.appendChild(card(a))});$("#inEmpty").hidden=list.length>0;$("#inMore").parentNode.hidden=state.shown>=list.length;$("#inCount").textContent=list.length?"Menampilkan "+Math.min(state.shown,list.length)+" dari "+list.length+" alumni":""}
  function open(i){if(i<0)return;cur=i;var a=list[i];$("#dPh").innerHTML=photo(a);$("#dMeta").textContent=a.bidang+" · Angkatan "+a.th;$("#dName").textContent=a.nama;$("#dRole").textContent=a.jabatan;$("#dStory").textContent=a.cerita;$("#dAch").innerHTML=a.ach.map(function(x){return "<li>"+esc(x)+"</li>"}).join("");$("#dMsg").textContent="“"+a.pesan+"”";$("#dPrev").disabled=list.length<2;$("#dNext").disabled=list.length<2;history.replaceState(null,"","#"+a.id);if(!dlg.open)dlg.showModal()}
  function step(d){open((cur+d+list.length)%list.length)}$("#dPrev").onclick=function(){step(-1)};$("#dNext").onclick=function(){step(1)};
  $("#dShare").onclick=function(){var b=this,u=location.href;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){b.textContent="Tersalin ✓"},function(){b.textContent="Salin manual dari bilah alamat"});setTimeout(function(){b.textContent="Salin Tautan"},2200)};
  dlg.addEventListener("click",function(e){if(e.target===dlg||e.target.hasAttribute("data-close"))dlg.close()});dlg.addEventListener("close",function(){history.replaceState(null,"",location.pathname+location.search)});dlg.addEventListener("keydown",function(e){if(e.key==="ArrowRight")step(1);if(e.key=== "ArrowLeft")step(-1)});
  var randomButton=$("#inRand");
  if(randomButton)randomButton.onclick=function(){state.q="";$("#inQ").value="";state.cat="Semua Bidang";state.shown=PAGE;[].forEach.call(chips.children,function(x,i){x.setAttribute("aria-pressed",i===0)});render();var a=A[Math.floor(Math.random()*A.length)];state.shown=Math.max(state.shown,list.indexOf(a)+1);render();open(list.indexOf(a))};
  render();var h=decodeURIComponent(location.hash.slice(1));if(h){var k=A.filter(function(a){return a.id===h})[0];if(k){state.shown=Math.max(PAGE,list.indexOf(k)+1);render();open(list.indexOf(k))}}
})();
