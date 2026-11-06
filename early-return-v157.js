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
 if(!Number.isFinite(state.shipWear157))state.shipWear157=0;
 state.shipWear157=Math.max(0,Math.min(90,Math.ceil(state.shipWear157)));
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
 if(!inShop132()||!penalty()&&state.scene!=='port')return false;
 const item=activeRepairs().find(x=>x.id===id),wear=state.shipWear157;
 if(!item||!wear||!Number.isFinite(item.amount)||item.amount<=0)return false;
 const cost=repairCost(item);
 if(state.gold<cost)return false;
 const restored=Math.min(wear,item.amount);
 state.gold-=cost;
 state.shipWear157=Math.max(0,wear-restored);
 if(typeof dispatchAchievement142==='function')dispatchAchievement142('repair',{id});
 log('선박 수리: 회항 손상 '+restored+' 회복. '+fmt(cost)+' 지불.'+
  (penalty()?' 회항으로 수리비 25%가 가산되었습니다.':''));
 sync();
 return true;
}
const previousReturn=returnPort;
returnPort=function(){
 initialize();
 const ref=state,wasAtSea=!!ref.sea,remaining=(ref.offered||[]).length-(ref.visited||[]).length;
 const exposure=Math.max(0,Number(ref.exposure)||0),oldWear=ref.shipWear157;
 const result=previousReturn.apply(this,arguments);
 if(state!==ref||!wasAtSea||ref.sea||ref.scene!=='port'||remaining<=0)return result;
 // 돌아오지 못한 호수를 건너뛰지 않고 해당 항해를 포기합니다.
 // 구형 침식도는 항구에서 가라앉으므로, 그 일부만 별도의 선박 손상으로 이관합니다.
 ref.shipWear157=Math.max(oldWear,Math.min(90,Math.ceil(exposure*.35)));
 ref.returnPenalty157={active:true,voyage:ref.voyage};
 log('중도 회항: 이번 정박의 모든 선박 수리비 +25%, 모든 선원 고용비 +5만 안.'+
  (ref.shipWear157?' 회항 선박 손상 '+ref.shipWear157+'이 남았습니다.':''));
 sync();
 return result;
};
const previousLaunch=launch;
launch=function(){
 initialize();
 const ref=state,wear=ref.shipWear157;
 const result=previousLaunch.apply(this,arguments);
 if(state===ref&&ref.sea){
  ref.returnPenalty157={active:false,voyage:-1};
  if(wear>0){
   ref.exposure=Math.min(99,(Number(ref.exposure)||0)+wear);
   log('수리하지 않은 회항 손상 '+wear+'이 새 항해의 초기 침식도에 반영되었습니다.');
  }
  sync();
 }
 return result;
};
const previousComplete=completeLake;
completeLake=function(){
 const ref=state,wasAtSea=ref.sea,all=(ref.offered||[]).length;
 const result=previousComplete.apply(this,arguments);
 if(state===ref&&wasAtSea&&!ref.sea&&ref.scene==='port'&&all>0){
  initialize();
  ref.returnPenalty157={active:false,voyage:-1};
  save();
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
 const wear=state.shipWear157,extra=penalty(),ready=inShop132();
 const list=activeRepairs().map(item=>{
  const cost=repairCost(item),can=ready&&wear>0&&state.gold>=cost;
  return button(item.name+' · 손상 '+Math.min(wear,item.amount)+' 회복 · '+fmt(cost)+
   (extra?' (회항 가산 25%)':''),'shipRepair157',item.id,'',!can);
 }).join('');
 const panel='<section class="inset ship-repair157"><h3>선박 수리</h3>'+
  '<p>선박에 남은 회항 손상 <strong>'+wear+'</strong> / 90. 수리하지 않고 출항하면 '+
  '남은 손상만큼 초기 침식도가 증가합니다.</p>'+
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
  '<li>중도 회항할 때마다 같은 규칙을 새로 적용하며 정상적인 귀항에는 가산하지 않습니다.</li>'+
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
  '<p>중도 회항 시 침식도의 35%가 선박 손상으로 남을 수 있습니다. 이번 정박에서는 수리할 때마다 '+
  '수리비가 25% 올라가며, 선원을 고용할 때마다 5만 안이 추가됩니다. 다음 출항부터 가산 요금이 해제됩니다. '+
  '이후 다시 중도 회항하면 그때마다 같은 가산 요금이 적용됩니다. 정상 귀항에는 적용되지 않습니다.</p></section>';
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