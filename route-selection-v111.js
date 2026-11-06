/* v.1.6.0 · 모든 일반 출항의 호수는 자동 배정.
   첫 출항은 21-01 → 21-02 → 나머지 48곳 중 서로 다른 무작위 2곳.
   기존 호수 법, 선택지, 체류 턴, 업적 등은 수정하지 않습니다. */
(function(){
 'use strict';
 if(typeof state==='undefined'||typeof prepareVoyage!=='function'||typeof autoLake0131!=='function')return;
 const data=window.GREAT_LAKE_SCRIPT_DATA_024;
 if(!Array.isArray(data)||data.length!==50)throw Error('21-01~21-50 호수 자료가 없습니다.');
 const byId=new Map(data.map(x=>[x.id,x]));
 const IDs=data.map(x=>x.id).sort((a,b)=>a-b);
 const FIXED=[1,2];
 const idName=id=>'21-'+String(id).padStart(2,'0');
 const show=s=>esc(String(s??''));
 const first=()=>state.voyage===0;
 const cap=()=>Math.min(50,LAKE_CAP[state.grade]||4);
 function init(){
  if(!Array.isArray(state.loreSeen111))state.loreSeen111=[];
  if(!state.loreArchive111||typeof state.loreArchive111!=='object')state.loreArchive111={};
  if(!state.loreImported111){
   for(const r of state.rumors||[]){
    if(!byId.has(r.lake))continue;
    if(!state.loreSeen111.includes(r.lake))state.loreSeen111.push(r.lake);
    if(!state.loreArchive111[r.lake])
     state.loreArchive111[r.lake]={id:r.lake,kind:r.kind||'전언',text:r.text||'',confirmed:!!r.confirmed};
   }
   state.loreImported111=true;
  }
  if(first()){
   for(const id of FIXED){
    if(!state.loreSeen111.includes(id))state.loreSeen111.push(id);
    state.loreArchive111[id]={id,kind:'첫 출항부터 알고 있는 법',text:byId.get(id).law,confirmed:true};
   }
  }
  // 구형 수동 선택 데이터는 다음 출항 경로에 반영하지 않습니다.
  state.routeSelection111={version:2,ids:[]};
 }
 function archiveCard(id){
  const d=state.loreArchive111?.[id];
  if(!d)return '';
  return '<div class="route-intel-card111"><b>'+idName(id)+'</b><span>'+
   (d.confirmed?'확인된 진짜 법':'전언 · 진위 미확인')+'</span><p>'+show(d.text)+'</p></div>';
 }
 function knownPanel(ids){
  init();
  const known=[...new Set(ids)].filter(id=>state.loreArchive111[id]);
  if(!known.length)return '';
  return '<details class="inset route-intel111"'+(first()?' open':'')+'>'+
   '<summary>이미 알고 있는 호수의 법과 전언 · '+known.length+'곳</summary>'+
   '<p class="muted">진짜 법으로 확인된 항목과 진위 미확인 전언을 구분해서 표시합니다.</p>'+
   known.map(archiveCard).join('')+'</details>';
 }
 function distribute(tutorial){
  const pool=tutorial?IDs.filter(id=>!FIXED.includes(id)):IDs.slice();
  const count=tutorial?2:cap();
  const picks=shuffle(pool).slice(0,count);
  if(picks.length!==count||new Set(picks).size!==count)throw Error('중복 없는 무작위 호수 배정 실패');
  const route=tutorial?[...FIXED,...picks]:picks;
  state.offered=route.slice();
  state.preparedRoute160={version:1,tutorial,route:route.slice(),drawnAt:state.voyage+1};
  // 기존 기능의 저장 정보는 보존하되 구형 수동 선택 결과는 무시합니다.
  state.preparedRoute111=null;
  state.routeSelection111={version:2,ids:[]};
 }
 const previousPrepare=prepareVoyage;
 prepareVoyage=function(){
  const fromPort=state.scene==='port'&&!state.sea,firstVoyage=first();
  const result=previousPrepare.apply(this,arguments);
  if(fromPort&&state.scene==='prep'&&!state.sea){
   init();
   if(!state.crossing039)distribute(firstVoyage);
   save();render();
  }
  return result;
 };
 // 구버전에서 출항 준비까지 마친 저장을 불러와도 첫 항해 순서를 바로잡습니다.
 const previousLaunch=launch;
 launch=function(){
  if(state.scene==='prep'&&!state.sea&&first()&&!state.crossing039){
   const p=state.preparedRoute160;
   if(!p?.tutorial||p.route?.length!==4||p.route[0]!==1||p.route[1]!==2){
    init();distribute(true);save();
   }
  }
  return previousLaunch.apply(this,arguments);
 };
 const previousAuto=autoLake0131;
 autoLake0131=function(){
  const p=state.preparedRoute160;
  if(!(state.sea&&state.scene==='route'&&p?.tutorial&&p.drawnAt===state.voyage&&!state.crossing039))
   return previousAuto.apply(this,arguments);
  const seen=new Set(state.visited||[]);
  // 고정된 21-01과 21-02를 무조건 먼저 통과합니다.
  const target=!seen.has(1)?1:!seen.has(2)?2:
   shuffle(p.route.slice(2).filter(id=>!seen.has(id)))[0];
  if(target===undefined)return;
  return enterNextLake0131(target);
 };
 const previousPlay=renderPlay;
 renderPlay=function(){
  init();
  let html=previousPlay.apply(this,arguments);
  if(state.scene==='port'&&!state.sea){
   html=html.replace('선장 등급별로 항해할 호수를 직접 정하고 마지막 1곳만 무작위로 배정합니다.',
    '호수는 자동으로 정해집니다. 출항 전에 직접 선택할 필요가 없습니다.');
   return html+(first()?knownPanel(FIXED):'');
  }
  if(state.scene==='prep'){
   const p=state.preparedRoute160;
   if(p?.tutorial){
    return '<section class="inset route-prep111"><div class="small">v.1.6.0 · 첫 출항 항로</div>'+
     '<h3>첫 두 호수는 정해져 있습니다</h3>'+
     '<p>21-01 → 21-02를 차례로 건넌 다음, 나머지 48곳 중 무작위로 배정된 두 호수를 지나게 됩니다.</p>'+
     '<p class="muted">뒤의 두 호수는 통과할 때 나타납니다. 직접 선택할 수 없습니다.</p></section>'+
     knownPanel(FIXED)+html;
   }
   return '<div class="inset"><div class="small">v.1.6.0 · 자동 항로</div>'+
    '<p>이번 항해의 호수 '+(state.offered||[]).length+'곳이 중복 없이 무작위로 배정되었습니다. 항로는 직접 선택할 수 없습니다.</p></div>'+
    html;
  }
  if(state.scene==='route'){
   const p=state.preparedRoute160;
   if(p?.tutorial&&p.drawnAt===state.voyage&&(state.visited||[]).length<2){
    return html.replace(/<div class="lakegrid">[\s\S]*?<\/div>(?=<\/div>|$)/,'')+
     '<p class="muted">21-01과 21-02를 지나면 다음 두 호수가 나타납니다.</p>';
   }
   return html;
  }
  if(state.scene==='event'&&state.current!=null&&state.loreArchive111[state.current])
   return knownPanel([state.current])+html;
  return html;
 };
 const previousHelp=renderHelp;
 renderHelp=function(){
  return previousHelp.apply(this,arguments)+
   '<div class="inset"><h3>v.1.6.0 · 호수 자동 배정</h3>'+
   '<p>호수를 선택하는 화면을 제거했습니다. 첫 항해는 21-01과 21-02의 법을 알고 시작하며, '+
   '반드시 21-01 → 21-02를 통과한 다음 다른 48곳에서 중복 없이 무작위 배정된 두 호수를 건넙니다. '+
   '두 호수의 정체는 항해 중에 나타납니다. 두 번째 출항부터는 선장 등급에 따라 '+
   '4 / 8 / 12 / 16 / 20곳을 중복 없이 자동 배정합니다. 법과 체류 턴은 변경하지 않았습니다.</p></div>';
 };
 window.GREAT_LAKE_ROUTE_111={fixed:FIXED,plan:()=>({locked:first()?FIXED:[],picks:[],need:0,ready:true,limit:first()?4:cap(),randomCount:first()?2:cap()}),archive:()=>state.loreArchive111};
 window.GREAT_LAKE_ROUTE_160={version:'1.6.0',distribute,auto:true};
 init();save();render();
})();