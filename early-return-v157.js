/* 대호수 v.1.5.7 · 중도 회항 비용 및 항해 화면 가독성.
   법·체류 시간·사냥 조건과 정상 귀항 보상은 변경하지 않습니다. */
(function(){
'use strict';
if(typeof state==='undefined'||typeof returnPort!=='function'||typeof renderPlay!=='function')return;
const VERSION='1.5.7',RECRUIT_EXTRA=5,REPAIR_SURCHARGE=1.25;
const SAFE_SCENES=new Set(['route','event','wave151']);
const fmt=n=>typeof unitMoney==='function'?unitMoney(n):n+'만 안';
const money=n=>Math.max(0,Math.ceil(Number(n)||0));
function initialize(){
if(!state.returnPenalty157||typeof state.returnPenalty157!=='object')
  state.returnPenalty157={active:false,voyage:-1};
}
function penalty(){
 initialize();
 return !!(state.returnPenalty157.active&&!state.sea&&state.scene==='port'&&
   state.returnPenalty157.voyage===state.voyage);
}
function canTurn(){
 return !!(state.sea&&SAFE_SCENES.has(state.scene)&&!busy&&!state.battle&&
  (state.encounter===null||state.encounter===undefined)&&
  (state.offered||[]).length>(state.visited||[]).length);
}
function repairCost(item){return money(item.cost*(penalty()?REPAIR_SURCHARGE:1));}
function activeRepairs(){return typeof SHOP_REPAIRS_132!=='undefined'&&Array.isArray(SHOP_REPAIRS_132)?SHOP_REPAIRS_132:[];}
function doRepair(id){
 if(!inShop132()||state.scene!=='port')return false;
 const item=activeRepairs().find(x=>x.id===id),wear=Math.max(0,Number(state.exposure)||0);
 if(!item||!wear||!Number.isFinite(item.amount)||item.amount<=0)return false;
 const cost=repairCost(item);
 if(state.gold<cost)return false;
 const restored=Math.min(wear,item.amount);
 state.gold-=cost;
 state.exposure=Math.max(0,wear-restored);
 if(typeof dispatchAchievement142==='function')dispatchAchievement142('repair',{id});
 log('선박 수리: 침식도 '+restored+' 감소. '+fmt(cost)+' 지불.'+
  (penalty()?' 회항으로 수리비 25%가 가산되었습니다.':''));
 sync();
 return true;
}
const previousReturn=returnPort;
returnPort=function(){
 initialize();
 const ref=state,wasAtSea=!!ref.sea,remaining=(ref.offered||[]).length-(ref.visited||[]).length;
 const exposure=Math.max(0,Number(ref.exposure)||0);
 const result=previousReturn.apply(this,arguments);
 if(state!==ref||!wasAtSea||ref.sea||ref.scene!=='port')return result;
 // 중도 회항 이전의 침식도를 그대로 보존하여 선박 손상으로 사용합니다.
 ref.exposure=exposure;
 if(remaining>0){
  ref.returnPenalty157={active:true,voyage:ref.voyage};
  log('중도 회항: 이번 정박의 모든 선박 수리비 +25%, 모든 선원 고용비 +5만 안.'+
   (exposure?' 현재 선박 손상(침식도) '+exposure+'.':''));
 }else ref.returnPenalty157={active:false,voyage:-1};
 sync();
 return result;
};
// 출항 준비 과정의 구형 침식도 초기화 코드를 덮어쓰고, 실제 수리 상태를 보존합니다.
const previousPrepare=prepareVoyage;
prepareVoyage=function(){
 initialize();
 const ref=state,wear=Math.max(0,Number(ref.exposure)||0);
 const result=previousPrepare.apply(this,arguments);
 if(state===ref&&ref.scene==='prep'&&!ref.sea){
  ref.exposure=wear;
  save();
  render();
 }
 return result;
};
const previousLaunch=launch;
launch=function(){
 initialize();
 const ref=state;
 const result=previousLaunch.apply(this,arguments);
 if(state===ref&&ref.sea){
  ref.returnPenalty157={active:false,voyage:-1};
  sync();
 }
 return result;
};
// 완주 정산에서 침식도가 초기화되더라도 마지막 호수에서 받은 피해까지 보존합니다.
const previousCompleteDamage=takeDamage;
let completionRef=null,completionExposure=0;
takeDamage=function(){
 const result=previousCompleteDamage.apply(this,arguments);
 if(completionRef===state)completionExposure=Math.max(completionExposure,Number(state.exposure)||0);
 return result;
};
const previousComplete=completeLake;
completeLake=function(){
 const ref=state,wasAtSea=ref.sea,all=(ref.offered||[]).length;
 completionRef=ref;
 completionExposure=Math.max(0,Number(ref.exposure)||0);
 let result,finalExposure;
 try{
  result=previousComplete.apply(this,arguments);
  finalExposure=completionExposure;
 }finally{
  completionRef=null;
  completionExposure=0;
 }
 if(state===ref&&wasAtSea&&!ref.sea&&ref.scene==='port'&&all>0){
  ref.exposure=finalExposure;
  ref.returnPenalty157={active:false,voyage:-1};
  sync();
 }
 return result;
};
// 선원 고용의 추가 5만 안은 이번 회항 정박에서 고용할 때마다 적용됩니다.
// 기존 모집 조건과 업적 처리를 그대로 사용하기 위해 해당 호출 동안만 기준 비용을 높입니다.
function modifiedRoles(fn){
 if(!penalty())return fn();
 const prior=[];
 for(const r of Object.values(ROLE)){
  if(!r||!Number.isFinite(r.cost))continue;
  prior.push([r,r.cost]);r.cost+=RECRUIT_EXTRA;
 }
 try{return fn();}finally{for(const [r,cost] of prior)r.cost=cost;}
}
const previousRecruit=recruit;
recruit=function(role){
 const before=state.crew?.length||0;
 const out=modifiedRoles(()=>previousRecruit.apply(this,arguments));
 if(state.crew?.length>before&&penalty()){
  log('회항 후 고용비 가산: '+RECRUIT_EXTRA+'만 안을 포함한 금액을 지불했습니다.');
  save();
 }
 return out;
};
const previousCrew=renderCrew;
renderCrew=function(){
 return modifiedRoles(()=>{
  const html=previousCrew.apply(this,arguments);
  if(!penalty())return html;
  return '<div class="inset return-fee157"><h3>중도 회항 · 선원 고용 비용 변경</h3>'+
   '<p>이번 정박에서는 선원을 모집할 때마다 기존 금액에 <strong>5만 안</strong>이 추가됩니다. '+
   '다음 항해를 정상적으로 마치면 일반 요금으로 돌아옵니다.</p></div>'+html;
 });
};
const previousShop=renderShop132;
renderShop132=function(){
 initialize();
 const html=previousShop.apply(this,arguments);
 const wear=Math.max(0,Number(state.exposure)||0),extra=penalty(),ready=inShop132();
 const list=activeRepairs().map(item=>{
  const cost=repairCost(item),can=ready&&wear>0&&state.gold>=cost;
  return button(item.name+' · 손상 '+Math.min(wear,item.amount)+' 회복 · '+fmt(cost)+
   (extra?' (회항 가산 25%)':''),'shipRepair157',item.id,'',!can);
 }).join('');
 const panel='<section class="inset ship-repair157"><h3>선박 수리</h3>'+
  '<p>현재 선박 손상도(침식도) <strong>'+wear+'</strong> / 100. '+
  '수리하지 않고 출항하면 이 침식도를 그대로 안고 항해합니다.</p>'+
  (extra?'<p class="return-fee157">중도 회항으로 이번 정박의 선박 수리비가 <strong>25% 증가</strong>합니다. '+
   '수리 횟수 제한은 없습니다.</p>':
   '<p class="muted">정상 귀항에는 회항 가산 요금이 붙지 않습니다.</p>')+
  '<div class="stack">'+list+'</div></section>';
 return panel+html;
};
const previousPlay=renderPlay;
renderPlay=function(){
 initialize();
 const html=previousPlay.apply(this,arguments);
 if(state.scene==='start')return html+
  '<section class="inset log-update"><h3>업데이트 내역 · v.'+VERSION+'</h3>'+
  '<ul><li>항해 중 호수 화면 상단에 붉은색 「회항한다」 버튼을 추가했습니다.</li>'+
  '<li>중도 회항한 정박에서 선박 수리비가 25%, 선원 고용비가 인원마다 5만 안 증가합니다.</li>'+
  '<li>침식도를 선박 손상도로 사용하며 귀항 후 수리할 수 있습니다. 회항 가산은 그때마다 적용됩니다.</li>'+
  '<li>정상적으로 항해를 마치면 수리와 고용에 추가 비용이 붙지 않습니다.</li>'+
  '<li>항해 화면, 버튼, 사건 설명과 정비소의 글자 크기와 간격을 정돈했습니다.</li></ul></section>';
 if(state.scene==='port'&&penalty()){
  return '<div class="inset return-notice157"><h3>중도 회항 · 항구 정비 비용</h3>'+
   '<p>이번 정박은 <b>수리비 25% 증가</b>, <b>고용비 5만 안 추가</b>가 적용됩니다. '+
   '항구에서 여러 번 수리하거나 여러 명을 고용해도 모두 적용됩니다.</p></div>'+html;
 }
 if(!canTurn())return html;
 const header='<div class="return-bar157"><div class="return-bar-copy157">'+
  '<b>항해 중단</b><span>남은 호수를 포기하고 항구로 돌아갑니다.</span></div>'+
  button('회항한다','retreat157','','return-button157')+'</div>';
 // 구형 항로 하단의 귀환 버튼과 동일한 기능이므로 중복 표시하지 않습니다.
 const cleaned=state.scene==='route'?html.replace(/<button\b[^>]*data-act="return"[^>]*>항구로 귀환<\/button>/g,''):html;
 return header+cleaned;
};
const previousHelp=renderHelp;
renderHelp=function(){
 return previousHelp.apply(this,arguments)+
  '<section class="inset"><h3>v.'+VERSION+' · 중도 회항과 정비 요금</h3>'+
  '<p>항해 중 호수 위의 붉은색 「회항한다」 버튼으로 남은 호수를 포기하고 항구로 돌아갈 수 있습니다. '+
  '회항은 항해 완주로 인정되지 않습니다. 재앙 전투, 전투 판정 또는 고래 조우 중에는 이용할 수 없습니다.</p>'+
  '<p>침식도는 선박 손상도입니다. 회항하거나 정상 귀항하더라도 침식도는 남으며 항구에서 수리하면 감소합니다. '+
  '중도 회항한 경우에만 이번 정박에서 수리할 때마다 비용이 25% 올라가고, 선원을 고용할 때마다 5만 안이 추가됩니다. '+
  '다음 출항부터 가산 요금이 해제되며 재차 중도 회항하면 다시 적용됩니다. 정상 귀항에는 가산되지 않습니다.</p></section>';
};
document.addEventListener('click',function(e){
 const b=e.target?.closest?.('button[data-act]');
 if(!b||b.disabled||busy)return;
 const act=b.dataset.act;
 if(act==='retreat157'){
  if(!canTurn())return;
  const question='남은 호수를 포기하고 항구로 돌아가시겠습니까?\n이번 정박에서는 수리비가 25%, 선원 고용비가 5만 안 증가합니다.';
  if(typeof window.confirm==='function'&&!window.confirm(question))return;
  returnPort();
 }else if(act==='shipRepair157')doRepair(b.dataset.value);
});
initialize();save();render();
window.GREAT_LAKE_RETURN_157={version:VERSION,penalty,canTurn,repairCost,doRepair};
})();