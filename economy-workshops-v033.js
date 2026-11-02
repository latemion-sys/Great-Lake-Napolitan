/* 경제·정비소·선장 정신력 통합. 구형 저장 호환을 위해 mind 이름은 비저장 접근자로만 남깁니다. */
(function(){
'use strict';
if(typeof state==='undefined'||typeof renderShop132!=='function'||typeof SHOP_GEAR_132==='undefined'||!window.CalamityMang)return;
const MAX_DEFENSE=20,DEFAULT_MAX_STONES=5;
const PRICE={captainCharm:18,captainHarpoon:40,captainCoat:76,crewHelmet:36,crewHarpoon:84,crewTether:33,crewPouch:16};
const DEFENSE={captainCharm:3,captainCoat:10,crewHelmet:6,crewPouch:2};
for(const item of SHOP_GEAR_132){
 if(PRICE[item.id]!=null)item.cost=PRICE[item.id];
 item.mind=DEFENSE[item.id]||0;
}
const EXTRAS=[
 {id:'captainWard4',name:'선장용 월광 장막 갑옷',cost:145,group:'선장용',atk:8,mind:15,hull:0,rank:4},
 {id:'captainSpear4',name:'선장용 강화 포경 작살',cost:152,group:'선장용',atk:22,mind:0,hull:0,rank:4},
 {id:'crewWard4',name:'선원용 차폐 장구',cost:125,group:'선원용',atk:0,mind:12,hull:0,rank:4},
 {id:'crewHarpoon4',name:'선원용 연동 작살',cost:135,group:'선원용',atk:10,mind:0,hull:0,rank:4,perCrew:true},
 {id:'captainAegis5',name:'선장용 심상 방호 외투',cost:238,group:'선장용',atk:0,mind:20,hull:0,rank:5},
 {id:'captainDread5',name:'선장용 심해 관통 작살',cost:255,group:'선장용',atk:35,mind:0,hull:0,rank:5},
 {id:'crewAegis5',name:'선원용 심상 방호 장비',cost:205,group:'선원용',atk:0,mind:18,hull:0,rank:5},
 {id:'crewHarpoon5',name:'선원용 고강도 관통 작살',cost:225,group:'선원용',atk:15,mind:0,hull:0,rank:5,perCrew:true}
];
for(const item of EXTRAS){if(!SHOP_GEAR_132.some(x=>x.id===item.id))SHOP_GEAR_132.push(item);GRADE_GEAR148[item.id]=item.rank;}
if(typeof SHIP148!=='undefined'){
 const prices=[0,0,85,160,255,370];
 for(let i=2;i<=5;i++)SHIP148[i].price=prices[i];
}
if(typeof KITS148!=='undefined'){
 for(const kit of KITS148){
  if(kit.id==='chart'){kit.base=12;kit.step=6;}
  if(kit.id==='harpoon'){kit.base=17;kit.step=7;}
  if(kit.id==='supplies'){kit.base=13;kit.step=6;kit.description='이번 출항 정신 감소량 3만큼 방어';}
 }
}
if(typeof SHOP_RECOVERY_132!=='undefined'){
 const cr=SHOP_RECOVERY_132.find(x=>x.id==='crew1');
 if(cr)cr.cost=16;
 const cr3=SHOP_RECOVERY_132.find(x=>x.id==='crew3');
 if(cr3)cr3.cost=52;
}
const STONES=[
 {id:'low',name:'하급 월광석',rank:1,heal:5,cost:9},
 {id:'mid',name:'중급 월광석',rank:3,heal:10,cost:22},
 {id:'high',name:'상급 월광석',rank:4,heal:15,cost:36}
];
const LIMITS=[{name:'하급 정비소',ranks:[1,2]},{name:'중급 정비소',ranks:[3]},{name:'고급 정비소',ranks:[4,5]}];
function gradeOf(x){return GRADE_GEAR148[x.id]||x.rank||1;}
function stoneUseCount(){const c=state.captainRest;return c&&c.v===state.voyage?Math.max(0,c.n|0):0;}
function maxMind(){return window.CalamityMang.captainMindMax?window.CalamityMang.captainMindMax():100;}
function actualMind(){return Number.isFinite(state.captainMind)?state.captainMind:maxMind();}
function flatDefense(){
 const ids=Array.isArray(state.equipment)?state.equipment:[];
 let n=ids.reduce((sum,id)=>sum+(SHOP_GEAR_132.find(x=>x.id===id)?.mind||0),0);
 if(state.sea&&state.preparations?.supplies)n+=3;
 return Math.max(0,Math.min(MAX_DEFENSE,n));
}
window.GREAT_LAKE_MIND_DEFENSE_033=flatDefense;
function aliasMind(s){
 if(!s||typeof s!=='object')return s;
 const current=Number(s.captainMind);
 const max=Number(s.captainMindMax030);
 const lim=Number.isFinite(max)?Math.max(10,Math.min(100,max)):100;
 const old=Number(s.mind);
 if(!Number.isFinite(current))s.captainMind=Number.isFinite(old)?old:lim;
 s.captainMind=Math.max(0,Math.min(lim,Math.round(s.captainMind)));
 try{delete s.mind;Object.defineProperty(s,'mind',{
  configurable:true,enumerable:false,
  get(){return this.captainMind;},
  set(value){const v=Number(value);if(Number.isFinite(v))this.captainMind=Math.max(0,Math.min(maxMind(),v));}
 });}catch(e){}
 return s;
}
aliasMind(state);
if(state.scene==='start'&&state.voyage===0&&state.gold===100){
 state.gold=50;
}
const priorFresh=fresh;
fresh=function(){return aliasMind(priorFresh.apply(this,arguments));};
if(typeof save==='function')save();
const beforePower=crewPower;
crewPower=function(){
 const base=beforePower.apply(this,arguments);
 const count=Array.isArray(state.crew)?state.crew.length:0;
 return base+EXTRAS.reduce((n,item)=>item.perCrew&&state.equipment?.includes(item.id)?n+item.atk*Math.max(0,count-1):n,0);
};
const beforeDamage=takeDamage;
takeDamage=function(h,m){
 aliasMind(state);
 const before=state.captainMind;
 // 기존 항해 시스템에는 선체 침식 피해만 위임하여 선장 정신력의 이중 감소를 차단합니다.
 beforeDamage.call(this,h,0);
 if(m>0){
  if(state.sea&&!(h>0))state.lossesThisVoyage=(state.lossesThisVoyage||0)+1;
  const factor=typeof routeLengthFactor149==='function'?routeLengthFactor149():1;
  const mang=(state.scene==='battle'&&state.battle&&(state.battle.type==='whale'||state.battle.mang))||state.scene==='blueHunt'||state.scene==='encounter'?window.CalamityMang.guard?.()||0:0;
  const base=Math.max(1,Math.ceil(m*factor*(1-Math.min(.65,mang))));
  window.CalamityMang.hurt(base,'항해 중 정신 피해.');
 }
 return state.captainMind-before;
};
safeCheck=function(){
 aliasMind(state);
 if((state.exposure||0)>=100){die();return false;}
 if(state.captainMind<=0&&!state.mindJudge)state.mindJudge={stage:'pending',draft:''};
 return true;
};
function effectsOf(item){
 const parts=[];
 if(item.atk)parts.push('전투력 +'+item.atk+(item.perCrew||item.id==='crewHarpoon'?' × 승선 선원':''));
 if(item.mind)parts.push('정신 감소량 '+item.mind+'만큼 방어');
 if(item.hull)parts.push('호수 침식 증가 '+Math.round(item.hull*100)+'% 경감');
 return parts.join(' · ')||'장착 장비';
}
function workshop(block){
 const rank=state.shipGrade||1,ready=inShop132()&&!state.mindJudge;
 let out='<div class="inset"><h3>'+block.name+'</h3>'+
 '<p class="muted">'+block.ranks.join('·')+'등급 장비와 월광석을 취급합니다.</p>';
 for(const group of ['선장용','선원용']){
  const items=SHOP_GEAR_132.filter(x=>x.group===group&&block.ranks.includes(gradeOf(x)));
  if(!items.length)continue;
  out+='<h4>'+group+' 장비</h4><div class="stack">';
  for(const x of items){
   const tier=gradeOf(x),owned=state.equipment.includes(x.id),disabled=!ready||rank<tier||owned||state.gold<x.cost;
   out+=button(x.name+' · '+tier+'등급 · '+unitMoney(x.cost)+' · '+effectsOf(x)+(owned?' [구매 완료]':''),'shopGear',x.id,'',disabled);
  }
  out+='</div>';
 }
 const stones=STONES.filter(x=>block.ranks.includes(x.rank));
 const used=stoneUseCount();out+='<h4>월광석 · 선장 정신력 회복</h4><div class="stack">';
 for(const stone of stones){
  const disabled=!ready||rank<stone.rank||used>=DEFAULT_MAX_STONES||state.gold<stone.cost||actualMind()>=maxMind();
  out+=button(stone.name+' · 정신력 '+stone.heal+' 회복 · '+unitMoney(stone.cost)+(used>=DEFAULT_MAX_STONES?' [이번 정박 구매 한도]':''),'moonBuy033',stone.id,'',disabled);
 }
 out+='</div>';
 if(block.name==='하급 정비소'||block.name==='중급 정비소'){
  const id=block.name==='하급 정비소'?'crew1':'crew3';
  const treatment=SHOP_RECOVERY_132.find(x=>x.id===id);
  if(treatment){
   out+='<h4>선원 치료</h4><div class="stack">'+button(treatment.name+' · 컨디션 '+treatment.amount+'단계 회복 · '+unitMoney(treatment.cost),
   'shopRecover',id,'',!ready||state.gold<treatment.cost||!state.crew.some(c=>c.condition>0))+'</div>';
  }
 }
 return out+'</div>';
}
const priorShop=renderShop132;
renderShop132=function(){
 let html=priorShop.apply(this,arguments);
 const start='<div class="inset"><h3>선장용·선원용 장비</h3>';
 const end='<div class="inset"><h3>특수 전리품 보관함</h3>';
 const a=html.indexOf(start),b=html.indexOf(end,a);
 if(a>=0&&b>a){
  const rebuilt=LIMITS.map(workshop).join('');
  html=html.slice(0,a)+rebuilt+html.slice(b);
 }
 return html.replace('항구선 · 항해 준비 상점','항구 정비소 · 출항 준비');
};
document.addEventListener('click',function(e){
 const b=e.target?.closest?.('button[data-act="moonBuy033"]');
 if(!b||b.disabled||busy||!inShop132()||state.mindJudge)return;
 const stone=STONES.find(x=>x.id===b.dataset.value);
 if(!stone||state.shipGrade<stone.rank||state.gold<stone.cost||stoneUseCount()>=DEFAULT_MAX_STONES||actualMind()>=maxMind())return;
 state.gold-=stone.cost;
 state.captainRest={v:state.voyage,n:stoneUseCount()+1};
 const gain=Math.min(stone.heal,maxMind()-actualMind());
 state.captainMind=actualMind()+gain;
 log(stone.name+' 사용. 선장 정신력 +'+gain+' ('+state.captainMind+' / '+maxMind()+'). '+unitMoney(stone.cost)+' 지불.');
 sync();
});
const priorPlay=renderPlay;
renderPlay=function(){
 const h=priorPlay.apply(this,arguments);
 return state.scene==='port'?h.replaceAll('항해 준비 상점','항구 정비소').replaceAll('항구 상점','항구 정비소'):h;
};
if(typeof render==='function')render();
window.GREAT_LAKE_WORKSHOP_033={flatDefense,STONES,gradeOf,stoneUseCount,aliasMind};
})();