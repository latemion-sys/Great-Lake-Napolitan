/* v.1.6.1 · 항구 가독성 개선 및 선택 기능의 반응형 보조 영역 이동.
   기존 상환/추적/암시장/도감/승급 버튼과 처리 함수는 그대로 사용합니다. */
(function(){
 'use strict';
 if(typeof state==='undefined'||typeof render!=='function')return;
 const NAV=[
  {key:'debt',title:'빚 상환',selector:'.debt-panel-v100'},
  {key:'trace',title:'재앙의 고래 추적',heading:'재앙의 고래 추적'},
  {key:'rank',title:'승급 현황',heading:'승급 현황'},
  {key:'market',title:'암시장 거래',heading:'항구 암시장'},
  {key:'fish',title:'어류 도감',heading:'어류 도감'}
 ];
 const expanded=Object.create(null);
 const expandedFrom=state.optionalPanels161;
 if(expandedFrom&&typeof expandedFrom==='object'){
  for(const key of NAV.map(x=>x.key))expanded[key]=expandedFrom[key]===true;
 }
 const WIDTH=1100;
 let relocating=false;
 const label=s=>String(s??'').trim();
 function container(){
  return document.querySelector('.shell>.layout')||document.querySelector('.layout');
 }
 function sidebar(){return document.querySelector('.layout>.side');}
 function port(){return state.scene==='port'&&!state.sea&&typeof tab==='string'&&tab==='play';}
 function wide(){return typeof window.matchMedia==='function'&&window.matchMedia('(min-width: '+WIDTH+'px)').matches;}
 function makeRail(){
  let el=document.getElementById('portUtilityRail161');
  if(el)return el;
  el=document.createElement('aside');
  el.id='portUtilityRail161';el.className='panel port-utility-rail161';
  el.setAttribute('aria-label','항구 보조 기능');
  el.hidden=true;
  return el;
 }
 function locate(title,content){
  const headings=content.querySelectorAll('h3,h2');
  for(const h of headings){
   if(label(h.textContent)!==title)continue;
   const card=h.closest('.inset');
   if(card&&content.contains(card))return card;
  }
  return null;
 }
 function moveRail(){
  const layout=container(),side=sidebar();
  if(!layout||!side)return null;
  const rail=makeRail(),isWide=wide();
  const home=isWide?layout:side;
  if(rail.parentNode!==home)home.appendChild(rail);
  layout.classList.toggle('port-rail-open161',isWide&&port());
  rail.hidden=!port();
  return rail;
 }
 function purposeToLeft(content){
  const purposeCard=content.querySelector('.captain-purpose-record025');
  if(purposeCard)purposeCard.remove();
  const stats=document.getElementById('stats');
  if(!stats)return;
  const all=Array.from(stats.querySelectorAll('.stat'));
  const previous=all.find(el=>{
   const name=el.querySelector('small');
   return name&&label(name.textContent)==='이번 출항';
  });
  if(!previous)return;
  const purpose=label(state.captainPurpose)||'살아서 항구로 돌아온다.';
  // 항구의 '이번 출항: 항구' 상태값을 개인 목표로 교체합니다.
  previous.classList.add('goal-stat161');
  previous.innerHTML='<small>개인 목표</small>'+
   '<strong title="'+esc(purpose).replace(/"/g,'&quot;')+'">'+esc(purpose)+'</strong>';
 }
 function hideDuplicatedFacility(content){
  const facility=locate('항구 시설',content);
  if(facility)facility.remove();
 }
 function addGroup(rail,key,title,card){
  const outer=document.createElement('details');
  outer.className='port-utility-group161';
  outer.dataset.utilityKey161=key;
  outer.open=!!expanded[key];
  const summary=document.createElement('summary');
  summary.textContent=title;
  const inside=document.createElement('div');
  inside.className='port-utility-body161';
  inside.appendChild(card);
  outer.append(summary,inside);
  outer.addEventListener('toggle',()=>{
   if(relocating)return;
   expanded[key]=outer.open;
   if(!state.optionalPanels161||typeof state.optionalPanels161!=='object')state.optionalPanels161={};
   state.optionalPanels161[key]=outer.open;
   save();
  });
  rail.appendChild(outer);
 }
 function organize(){
  const layout=container(),content=document.getElementById('content');
  if(!layout||!content)return;
  relocating=true;
  try{
   const rail=moveRail();
   if(!rail)return;
   rail.replaceChildren();
   if(!port())return;
   purposeToLeft(content);
   hideDuplicatedFacility(content);
   const title=document.createElement('div');
   title.className='port-utility-heading161';
   title.innerHTML='<h3>항구 보조 기능</h3><p>필요한 항목을 펼쳐 확인하거나 거래할 수 있습니다.</p>';
   rail.appendChild(title);
   for(const item of NAV){
    const card=item.selector?content.querySelector(item.selector):locate(item.heading,content);
    if(!card)continue;
    addGroup(rail,item.key,item.title,card);
   }
   const present=rail.querySelectorAll('.port-utility-group161').length;
   if(!present){
    rail.hidden=true;
    layout.classList.remove('port-rail-open161');
   }
  }finally{
   relocating=false;
  }
 }
 // 너비 변경 때는 기존 입력값과 펼친 영역을 보존하면서 보조 영역 자체만 이동합니다.
 function reposition(){
  const rail=document.getElementById('portUtilityRail161'),layout=container(),side=sidebar();
  if(!rail||!layout||!side)return;
  const isWide=wide(),home=isWide?layout:side;
  if(rail.parentNode!==home)home.appendChild(rail);
  layout.classList.toggle('port-rail-open161',isWide&&port()&&!rail.hidden);
 }
 const previousRender=render;
 render=function(){
  const result=previousRender.apply(this,arguments);
  organize();
  return result;
 };
 if(typeof window.addEventListener==='function')window.addEventListener('resize',reposition);
 window.GREAT_LAKE_PORT_UI_161={organize,reposition,version:'1.6.1'};
 render();
})();