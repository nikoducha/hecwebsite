/* HECprep course navigation, loaded into every course by course.html.
   1. The chapter bar expands with the current chapter's sections (click to jump, highlights where you are).
   2. Header + chapter bar stay pinned while scrolling, slide away after a short pause,
      come back when you scroll up, and are always shown at the top of the page. */
(function(){
 if(window.__hecNav)return;window.__hecNav=1;
 var D=document,R=D.documentElement,top=D.querySelector('.top');
 var HIDE_AFTER_DOWN=1200,HIDE_AFTER_UP=2500,TOP_ZONE=90;
 var st=D.createElement('style');
 st.textContent=
  ':root{--hec-toph:58px}'+
  '.top{transition:transform .28s ease}'+
  '.hec-navwrap,.navwrap{position:sticky!important;top:var(--hec-toph)!important;z-index:15;margin:0 0 18px;background:var(--bg2);border:1px solid var(--line);border-radius:14px;transition:transform .28s ease}'+
  '.hec-navwrap{padding:0}.hec-navwrap>.pagebar{position:static;border:0;background:transparent;margin:0;border-radius:14px}'+
  'html.hec-hide .top{transform:translateY(-110%)}'+
  'html.hec-hide .hec-navwrap,html.hec-hide .navwrap{transform:translateY(calc(-1*(var(--hec-toph) + 100% + 24px)))}'+
  '.hec-secs{display:flex;gap:6px;overflow-x:auto;padding:7px 10px 9px;border-top:1px dashed var(--line);scrollbar-width:thin}'+
  '.hec-secs[hidden]{display:none}'+
  '.hec-secs a{flex:none;display:flex;align-items:center;gap:7px;max-width:260px;padding:4px 11px 4px 5px;border-radius:999px;text-decoration:none;color:var(--fg2);font-size:13px;font-weight:600;border:1px solid transparent;white-space:nowrap}'+
  '.hec-secs a span{overflow:hidden;text-overflow:ellipsis}'+
  '.hec-secs a b{flex:none;display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 5px;border-radius:999px;background:var(--card);border:1px solid var(--line);font-size:11px;color:var(--fg3,var(--fg2))}'+
  '.hec-secs a:hover{background:var(--card)}'+
  '.hec-secs a.on{background:var(--card);color:var(--acc);border-color:var(--acc)}'+
  '.hec-secs a.on b{background:var(--acc);border-color:var(--acc);color:var(--card)}'+
  '.hec-secs a.done b{background:var(--greenbg,var(--card));border-color:var(--green,var(--line));color:var(--green,var(--fg2))}'+
  '.sec,.glsec{scroll-margin-top:14px}'+
  '@media(prefers-reduced-motion:reduce){.top,.hec-navwrap,.navwrap{transition:none}}';
 D.head.appendChild(st);
 /* sticky needs the window to be the scroller: some pages put overflow on body, which silently breaks it */
 try{if(getComputedStyle(D.body).overflowY!=='visible'||getComputedStyle(D.body).overflowX!=='visible'){
  R.style.setProperty('overflow-x','clip','important');D.body.style.setProperty('overflow','visible','important')}}catch(e){}

 /* real header height (it wraps onto two rows on phones) */
 function measure(){if(top)R.style.setProperty('--hec-toph',Math.round(top.getBoundingClientRect().height)+'px')}
 measure();addEventListener('resize',measure);
 try{new ResizeObserver(measure).observe(top)}catch(e){}

 /* one navigation block per chapter bar */
 var navs=[];
 [].forEach.call(D.querySelectorAll('.pagebar'),function(pb){
  var wrap=pb.closest('.navwrap');
  if(!wrap){wrap=D.createElement('div');wrap.className='hec-navwrap';pb.parentNode.insertBefore(wrap,pb);wrap.appendChild(pb)}
  var secs=D.createElement('nav');secs.className='hec-secs';secs.hidden=true;secs.setAttribute('aria-label','Sections');
  wrap.appendChild(secs);
  var n={pb:pb,wrap:wrap,secs:secs,view:pb.closest('.view')||D.body,topic:null,list:[],cur:-1};
  secs.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;e.preventDefault();n.pick=+a.dataset.i;jump(n.list[n.pick])});
  navs.push(n);
 });
 function title(el){var h=el.querySelector('h3,h2');return h?h.textContent.trim():''}
 function rebuild(n){
  var t=n.view.querySelector('.topic.pg');
  var list=t?[].filter.call(t.querySelectorAll('article.sec,article.glsec'),function(a){return title(a)}):[];
  if(t===n.topic&&list.length===n.list.length)return;
  n.topic=t;n.list=list;n.cur=-1;
  n.secs.innerHTML=list.map(function(a,i){var tt=title(a).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});
   return '<a href="#'+a.id+'" data-i="'+i+'" title="'+tt+'"><b>'+(i+1)+'</b><span>'+tt+'</span></a>'}).join('');
  n.secs.hidden=list.length<2;n.secs.scrollLeft=0;
  spy();
 }
 function spy(){
  navs.forEach(function(n){
   if(n.secs.hidden||!n.list.length)return;
   var line=innerHeight*0.3,k=0;
   for(var i=0;i<n.list.length;i++){if(n.list[i].getBoundingClientRect().top<=line)k=i;else break}
   if(innerHeight+scrollY>=D.documentElement.scrollHeight-4){for(var q=n.list.length-1;q>k;q--){if(n.list[q].getBoundingClientRect().top<innerHeight*0.85){k=q;break}}}
   if(jumping&&n.pick!=null)k=n.pick;
   var as=n.secs.children;
   for(var j=0;j<as.length;j++)as[j].classList.toggle('done',n.list[j].classList.contains('done'));
   if(k!==n.cur){
    if(as[n.cur])as[n.cur].classList.remove('on'),as[n.cur].removeAttribute('aria-current');
    n.cur=k;var a=as[k];
    if(a){a.classList.add('on');a.setAttribute('aria-current','true');
     n.secs.scrollTo({left:a.offsetLeft-n.secs.clientWidth/2+a.offsetWidth/2,behavior:'smooth'})}
   }
  });
 }
 var pending=0;
 function refresh(){if(pending)return;pending=requestAnimationFrame(function(){pending=0;navs.forEach(rebuild)})}
 navs.forEach(rebuild);
 try{new MutationObserver(refresh).observe(D.querySelector('main')||D.body,{subtree:true,attributes:true,attributeFilter:['class','hidden']})}catch(e){}

 /* show / hide */
 var hidden=false,timer=0,lastY=scrollY,hover=false,jumping=0;
 function set(h){if(h===hidden)return;hidden=h;R.classList.toggle('hec-hide',h)}
 function busy(){var p=D.getElementById('cm-pop');return hover||(p&&!p.hidden)||kbFocus()}
 function kbFocus(){var a=D.activeElement;if(!a||a===D.body)return false;var inBar=(top&&top.contains(a))||navs.some(function(n){return n.wrap.contains(a)});try{return inBar&&a.matches(':focus-visible')}catch(e){return false}}
 function arm(ms){clearTimeout(timer);timer=setTimeout(function(){if(scrollY>TOP_ZONE&&!busy())set(true)},ms)}
 function onScroll(){
  var y=scrollY,dy=y-lastY;lastY=y;
  if(y<=TOP_ZONE){clearTimeout(timer);set(false);return}
  if(jumping)return;
  if(dy<-3){set(false);arm(HIDE_AFTER_UP)}
  else if(dy>3&&!hidden)arm(HIDE_AFTER_DOWN);
 }
 addEventListener('scroll',function(){onScroll();spy()},{passive:true});
 function jump(a){
  if(!a)return;
  jumping=1;clearTimeout(timer);
  var y=a.getBoundingClientRect().top+scrollY-14;
  set(y>TOP_ZONE);
  scrollTo({top:y,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
  spy();setTimeout(function(){spy();jumping=0;lastY=scrollY;navs.forEach(function(n){n.pick=null})},800);
 }
 function hov(el){if(!el)return;el.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'){hover=true;clearTimeout(timer)}});
  el.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'){hover=false;if(!hidden&&scrollY>TOP_ZONE)arm(HIDE_AFTER_UP)}})}
 hov(top);navs.forEach(function(n){hov(n.wrap)});
 /* mouse at the very top edge of the window brings the bar back */
 addEventListener('mousemove',function(e){if(hidden&&e.clientY<14){set(false);arm(HIDE_AFTER_UP)}},{passive:true});
 /* keyboard users: tabbing into the bar shows it */
 D.addEventListener('focusin',function(e){if(hidden&&(top&&top.contains(e.target)||navs.some(function(n){return n.wrap.contains(e.target)}))){set(false);arm(HIDE_AFTER_UP)}});
 /* opening another tab or chapter goes to the top: show the bar */
 D.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('[role=tab],.pgb,.pagebar a,.partbar button')){set(false)}},true);
})();
