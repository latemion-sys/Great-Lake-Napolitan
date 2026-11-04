/* v.1.1.1 · 첫 출항 고정 2곳/무작위 2곳, 이후 항해는 직접 선택 + 마지막 무작위 1곳. */
(function(){
 'use strict';
 if(typeof state==='undefined'||typeof prepareVoyage!=='function'||typeof renderPlay!=='function')return;
 const SOURCES=window.GREAT_LAKE_SCRIPT_DATA_024;
 if(!Array.isArray(SOURCES)||SOURCES.length!==50)throw Error('v.1.1.1 항로에 사용할 호수 50곳을 찾지 못했습니다.');
 const BY_ID=new Map(SOURCES.map(l=>[l.id,l]));
 const IDS=SOURCES.map(l=>l.id).sort((a,b)=>a-b);
 const FIRST=[1,2]; // 21-01, 21-02: 첫 출항에서 고정하며 법을 알고 시작.
 const label=id=>'21-'+String(id).padStart(2,'0');
 const safe=s=>esc(String(s||''));
 const cap=()=>Math.min(IDS.length,LAKE_CAP[state.grade]||4);
 const fixed=()=>state.voyage===0?FIRST:[];
 const randomCount=()=>state.voyage===0?2:1; // 첫 출항은 고정 2곳 + 무작위 2곳.
 function init(){
  if(!Array.isArray(state.loreSeen111))state.loreSeen111=[];
  if(!state.loreArchive111||typeof state.loreArchive111!=='object')state.loreArchive111={};
  // 이미 진행 중인 저장 데이터의 전언도 다시 판매하지 않습니다.
  if(!state.loreImported111){
   for(const r of state.rumors||[]){
    if(!BY_ID.has(r.lake))continue;
    if(!state.loreSeen111.includes(r.lake))state.loreSeen111.push(r.lake);
    if(!state.loreArchive111[r.lake])
     state.loreArchive111[r.lake]={id:r.lake,kind:r.kind||'전언',text:r.text||'',confirmed:!!r.confirmed};
   }
   state.loreImported111=true;
  }
  if(state.voyage===0){
   for(const id of FIRST){
    if(!state.loreSeen111.includes(id))state.loreSeen111.push(id);
    state.loreArchive111[id]={id,kind:'첫 출항 전부터 알고 있는 법',text:BY_ID.get(id).law,confirmed:true};
   }
  }
  if(!state.routeSelection111||state.routeSelection111.version!==1||!Array.isArray(state.routeSelection111.ids))
   state.routeSelection111={version:1,ids:[]};
  const locked=new Set(fixed());
  const max=Math.max(0,cap()-randomCount()-locked.size);
  state.routeSelection111.ids=[...new Set(state.routeSelection111.ids)]
   .filter(id=>BY_ID.has(id)&&!locked.has(id)).slice(0,max);
 }
 function pickState(){
  init();
  const locked=fixed(),picks=state.routeSelection111.ids;
  const need=Math.max(0,cap()-randomCount()-locked.length);
  return {locked,picks,need,ready:picks.length===need,limit:cap(),randomCount:randomCount()};
 }
 function chosen(p){return [...p.locked,...p.picks];}
 function toggle(id){
  if(state.scene!=='port'||state.sea||!BY_ID.has(id))return;
  const p=pickState();
  if(p.locked.includes(id))return;
  const at=state.routeSelection111.ids.indexOf(id);
  if(at>=0)state.routeSelection111.ids.splice(at,1);
  else if(state.routeSelection111.ids.length<p.need)state.routeSelection111.ids.push(id);
  save();render();
 }
 function fill(){
  if(state.scene!=='port'||state.sea)return;
  const p=pickState(),exclude=new Set(chosen(p));
  const missing=p.need-p.picks.length;
  const unseen=shuffle(IDS.filter(id=>!exclude.has(id)&&!state.loreSeen111.includes(id)));
  const others=shuffle(IDS.filter(id=>!exclude.has(id)&&state.loreSeen111.includes(id)));
  state.routeSelection111.ids.push(...unseen.concat(others).slice(0,missing));
  save();render();
 }
 function clear(){
  if(state.scene!=='port'||state.sea)return;
  state.routeSelection111.ids=[];
  save();render();
 }
 function archiveCard(id){
  const r=state.loreArchive111[id];if(!r)return '';
  const truth=r.confirmed?'확인된 진짜 법':'전언 · 진위 미확인';
  return '<div class="route-intel-card111"><b>'+label(id)+'</b><span>'+safe(truth)+'</span>'+
   '<p>'+safe(r.text)+'</p></div>';
 }
 function knownPanel(ids){
  init();
  const unique=[...new Set(ids)].filter(id=>state.loreArchive111[id]);
  if(!unique.length)return '';
  return '<details class="inset route-intel111"'+(state.voyage===0?' open':'')+'>'+
   '<summary>이미 들었던 호수의 정보 · '+unique.length+'곳</summary>'+
   '<p class="muted">법은 확인된 사실만 표기하며, 다른 전언의 진위는 따로 보증하지 않습니다.</p>'+
   unique.map(archiveCard).join('')+'</details>';
 }
 function portPanel(){
  const p=pickState(),selected=chosen(p),need=p.need-p.picks.length;
  const locked=p.locked.map(id=>'<div class="route-fixed-law111"><b>'+label(id)+' · 고정 호수 · 법 확인</b>'+
   '<p>'+safe(BY_ID.get(id).law)+'</p></div>').join('');
  if(p.locked.length){
   // 첫 항해는 별도의 수동 선택 없이 21-01, 21-02를 고정하고 두 곳을 무작위 배정합니다.
   return '<section class="inset route-plan111" aria-label="첫 항해의 호수 배정">'+
    '<div class="small">v.1.1.1 · 첫 출항 항로</div><h2>첫 항해의 호수 4곳</h2>'+
    '<p class="muted">21-01과 21-02는 반드시 등장합니다. 나머지 2곳은 출항 준비를 누르면 다른 48곳에서 중복 없이 무작위로 배정됩니다. 고정된 두 호수의 진짜 법은 처음부터 알고 있습니다.</p>'+
    locked+
    '<p class="muted">첫 항해에서는 호수를 직접 선택하지 않습니다. 이후 출항에서는 기존처럼 항로를 직접 정할 수 있습니다.</p>'+
    '</section>';
  }
  const buttons=IDS.map(id=>{
   const isLocked=p.locked.includes(id),isChosen=p.picks.includes(id),known=state.loreSeen111.includes(id);
   const suffix=isLocked?' · 고정':isChosen?' · 선택됨':known?' · 정보 보유':'';
   return '<button type="button" class="route-choice111'+(isChosen?' chosen':'')+(isLocked?' locked':'')+
    '" data-act="routeToggle111" data-value="'+id+'" aria-pressed="'+(isChosen||isLocked)+
    '" '+(isLocked||!isChosen&&p.picks.length>=p.need?'disabled':'')+'>'+label(id)+suffix+'</button>';
  }).join('');
  return '<section class="inset route-plan111" aria-label="항해할 호수 미리 선택">'+
   '<div class="small">v.1.1.1 · 출항 전 항로 계획</div><h2>이번 항해의 호수를 정합니다</h2>'+
   '<p class="muted">총 '+p.limit+'곳 가운데 '+(p.limit-1)+'곳을 미리 정하고, 마지막 1곳만 무작위로 배정합니다.'+
   (p.locked.length?' 처음 출항하는 선장은 '+p.locked.map(label).join(', ')+'의 법을 이미 알고 있습니다.':'')+'</p>'+
   locked+
   '<div class="between"><strong>직접 선택 '+p.picks.length+' / '+p.need+'</strong>'+
    '<span>'+(p.ready?'항로 선택 완료':'아직 '+need+'곳 선택 필요')+'</span></div>'+
   '<div class="route-plan-actions111">'+
    button('남은 곳 자동 선택','routeFill111')+
    button('직접 선택 초기화','routeClear111')+'</div>'+
   '<details class="route-list111"><summary>호수 50곳 중 선택하기</summary>'+
    '<div class="route-choice-grid111">'+buttons+'</div></details>'+
   '<p class="muted">'+(p.ready?'준비되었습니다. 마지막 무작위 호수는 출항 준비를 누를 때 결정됩니다.':
    '원하는 호수 '+need+'곳을 더 선택해야 출항 준비를 시작할 수 있습니다.')+'</p>'+
   '</section>';
 }
 const beforePrepare=prepareVoyage;
 prepareVoyage=function(){
  const wasPort=state.scene==='port'&&!state.sea;
  const p=wasPort?pickState():null;
  if(wasPort&&!p.ready)return;
  const lockedChoice=p?.ready?chosen(p):null;
  const result=beforePrepare.apply(this,arguments);
  if(wasPort&&lockedChoice&&state.scene==='prep'){
   const eligible=IDS.filter(id=>!lockedChoice.includes(id));
   const unseen=eligible.filter(id=>!state.loreSeen111.includes(id));
   // 첫 출항: 고정된 두 호수 이외의 48곳 중에서 서로 다른 두 곳.
   // 이후 출항: 기존처럼 아직 전언을 듣지 않은 호수부터 마지막 한 곳.
   const pool=p.locked.length?shuffle(eligible):
    shuffle(unseen).concat(shuffle(eligible.filter(id=>state.loreSeen111.includes(id))));
   const randomIds=pool.slice(0,p.randomCount);
   if(randomIds.length!==p.randomCount)throw Error('무작위 호수를 모두 배정할 수 없습니다.');
   state.offered=lockedChoice.concat(randomIds);
   state.preparedRoute111={version:1,chosen:lockedChoice,fixed:p.locked,
    randomId:randomIds[0],randomIds,ids:[...state.offered]};
   state.routeSelection111.ids=[];
   save();render();
  }
  return result;
 };
 const beforePlay=renderPlay;
 renderPlay=function(){
  const html=beforePlay.apply(this,arguments);
  init();
  if(state.scene==='port'&&!state.sea){
   const p=pickState();
   let page=html.replace('선장 등급에 따라 이번 항해에서 접근할 수 있는 구역이 무작위로 정해집니다.',
     '선장 등급별로 항해할 호수를 직접 정하고 마지막 1곳만 무작위로 배정합니다.');
   if(!p.ready){
    page=page.replace(/(<button\b[^>]*data-act="prepare"[^>]*)(>)/,function(full,attrs,closing){
     return attrs.includes('disabled')?full:attrs+' disabled'+closing;
    });
   }
   return portPanel()+page+knownPanel(IDS.filter(id=>state.loreArchive111[id]&&!p.locked.includes(id)));
  }
  if(state.scene==='prep'){
   const pr=state.preparedRoute111;
   const randomN=Array.isArray(pr?.randomIds)?pr.randomIds.length:(pr?.randomId!==undefined?1:0);
   const valid=pr?.version===1&&pr.ids?.length===state.offered.length&&
    Array.isArray(pr.chosen)&&pr.chosen.length+randomN===state.offered.length&&
    pr.ids.every(id=>state.offered.includes(id));
   const summary=valid?'<p class="muted">고정·직접 선택 '+pr.chosen.length+'곳 · 무작위 배정 '+randomN+'곳. 해당 호수의 전언을 듣고 출항할 수 있습니다.</p>':
    '<p class="muted">별도로 준비한 항로입니다. 기존 항해 규칙이 적용됩니다.</p>';
   return '<div class="inset route-prep111"><h3>이번 출항의 항로</h3>'+summary+
    '<p>'+state.offered.map(label).join(' · ')+'</p></div>'+
    knownPanel(state.offered)+html;
  }
  if(state.scene==='route'){
   const firstRoute=state.preparedRoute111?.randomIds?.length===2;
   return knownPanel(state.offered)+html.replace(
    /50개 중 무작위로 배정했습니다\. 모든 호수가 연속 항해로 이어질 수 있습니다\./,
    firstRoute?'첫 출항은 2곳 고정, 나머지 2곳 무작위 배정입니다. 모든 호수는 연속 항해로 이어질 수 있습니다.':
    '마지막 1곳만 무작위로 배정했습니다. 모든 호수는 연속 항해로 이어질 수 있습니다.');
  }
  if(state.scene==='event'){
   if(!state.current||!state.loreArchive111[state.current])return html;
   return knownPanel([state.current])+html;
  }
  return html;
 };
 const beforeHelp=renderHelp;
 renderHelp=function(){
  return beforeHelp.apply(this,arguments).replace('항해 안내 · v.1.0.0','항해 안내 · v.1.1.1')+
   '<div class="inset"><h3>v.1.1.1 · 출항 전 항로 선택과 U사 대호수의 법</h3>'+
   '<p>첫 출항의 4곳은 21-01과 21-02가 고정되고 나머지 2곳이 중복 없이 무작위로 정해집니다. 고정된 두 호수의 진짜 법을 처음부터 알고 있습니다. 이후 일반 항해는 4 / 8 / 12 / 16 / 20곳 중 마지막 1곳만 무작위로 정합니다. 술집에서 한 번 정보를 들었던 호수는 이후 중복되지 않습니다. 고급 술집의 비용은 30만 안이며 현재 배정된 호수 두 곳의 진짜 법을 알려줍니다. 별도 대호수 주파는 기존 방식입니다.</p></div>';
 };
 document.addEventListener('click',function(e){
  const b=e.target?.closest?.('button[data-act="prepare"]');
  if(b&&state.scene==='port'&&!pickState().ready){
   e.preventDefault();e.stopImmediatePropagation();
  }
 },true);
 document.addEventListener('click',function(e){
  const b=e.target?.closest?.('button[data-act]');
  if(!b||b.disabled)return;
  const a=b.dataset.act;
  if(a==='routeToggle111')toggle(Number(b.dataset.value));
  else if(a==='routeFill111')fill();
  else if(a==='routeClear111')clear();
 });
 window.GREAT_LAKE_ROUTE_111={fixed:FIRST,plan:pickState,fill,clear,toggle,archive:()=>state.loreArchive111};
 init();save();render();
})();