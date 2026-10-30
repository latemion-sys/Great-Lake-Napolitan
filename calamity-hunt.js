/* 대호수 · 재앙의 고래 사냥 기본 조건 (창백한 · 푸른 · 붉은 고래)
   - 특수 작살: 선장 5등급부터 항구에서 구매. 한 번 사냥에 쓰면 손상되어, 다음 사냥 전에 정비해야 한다(구매가의 절반).
   - 신과 망(心·望): 감정과 의지를 끌어올려(신) 공격에 빛의 고리(망)를 두른다. 항구의 '신 수련'으로 최대 5개까지 두를 수 있게 된다.
     고리를 하나 더할 때마다 정신적 부담이 거의 두 배: 정신력 3 · 6 · 12 · 24 · 48 (3망 21 · 4망 45 · 5망 93).
   - 망 3개 이상을 두르지 못하면 재앙의 고래를 사냥할 수 없다(조우 화면에서 사냥 선택 불가).
   - 4망부터 재앙 사냥에 이점: 4망 = 사냥 중 받는 피해 30% 감소 · 미니게임 판정 여유 20%
                               5망 = 피해 50% 감소 · 판정 여유 35% · 미니게임마다 실패 한 번 더 허용 */
(function(){
'use strict';
if(typeof renderPlay!=='function'||typeof huntWhale!=='function'||typeof renderShop132!=='function')return;
const WHALES_OK=new Set([0,1,2]);
const HARPOON={name:'재앙 사냥용 특수 작살',cost:300,grade:5};
const RING_COST=[3,6,12,24,48];
const TRAIN=[ // 신 수련: n번째 망을 두를 수 있게 됨
 {cost:120,xp:36},{cost:160,xp:40},{cost:220,xp:46},{cost:320,xp:54},{cost:460,xp:64}];
const MIN_RINGS=3,MAX_RINGS=5;
const ringCost=n=>RING_COST.slice(0,n).reduce((a,b)=>a+b,0);
function shin(){return Math.max(0,Math.min(MAX_RINGS,state.shinLevel|0));}
function harp(){return state.calamityHarpoon||null;}
function rings(){return Math.max(0,state.mangActive|0);}

/* ---------- 다른 스크립트가 읽는 이점 ---------- */
const API=window.CalamityMang={
 rings,
 ease(){const r=rings();return r>=5?1.35:r>=4?1.2:1;},
 extraLife(){return rings()>=5?1:0;},
 guard(){const r=rings();return r>=5?.5:r>=4?.3:0;},
 ringCost,MAX_RINGS,MIN_RINGS
};

/* ---------- 지금 재앙 사냥 중인가 ---------- */
const HUNT_BATTLES=new Set(['blueMermaid','pallidShell161','pallidLure161','pallidMermaid161','pallidCore161']);
function inCalamity(){
 const b=state.battle;
 if(state.scene==='battle'&&b&&((b.type==='whale'&&WHALES_OK.has(b.index))||HUNT_BATTLES.has(b.type)))return true;
 if(state.scene==='blueHunt'||(typeof PALLID_SCENE_161!=='undefined'&&state.scene===PALLID_SCENE_161))return true;
 if(state.blueWhaleFinalStage||state.redWhaleFinal023)return true;
 return false;
}

/* ---------- 조건 ---------- */
function missing(){
 const m=[];
 if(state.grade<HARPOON.grade)m.push('선장 '+HARPOON.grade+'등급');
 const h=harp();
 if(!h)m.push(HARPOON.name);else if(h.damaged)m.push('특수 작살 정비');
 if(shin()<MIN_RINGS)m.push('신 수련 '+MIN_RINGS+'단계(망 '+MIN_RINGS+'개)');
 else if(state.mind<=ringCost(MIN_RINGS))m.push('망 '+MIN_RINGS+'개를 두를 정신력(정신 '+(ringCost(MIN_RINGS)+1)+' 이상)');
 return m;
}
function huntBlock(){
 const m=missing();
 let h='<div class="inset" style="margin-top:12px"><div class="small">재앙 사냥 조건 · 특수 작살과 신과 망</div>';
 if(m.length){
  h+='<p style="color:#ffb3a8">사냥할 수 없습니다. 부족한 것: '+m.map(esc).join(' · ')+'</p>'+
   '<p class="muted">재앙의 고래는 특수 작살에 신을 실어, 망을 '+MIN_RINGS+'개 이상 두른 손으로만 꿰뚫을 수 있습니다. 항구 상점에서 준비하십시오.</p>'+
   button('재앙의 고래를 사냥한다 (조건 부족)','mangHunt','0','danger',true);
 }else{
  const top=shin();
  h+='<p>신을 끌어올려 망을 몇 개 두를지 고르십시오. 고리가 하나 늘 때마다 정신적 부담이 거의 두 배가 됩니다. 4개부터는 사냥에 이점이 생깁니다.</p><p>'+tag('정신 '+state.mind+' / 100')+' '+tag('신 수련 '+top+'단계')+'</p><div class="stack">';
  for(let n=MIN_RINGS;n<=MAX_RINGS;n++){
   const c=ringCost(n),can=n<=top&&state.mind>c;
   const perk=n===4?' · 피해 -30% · 판정 여유 +20%':n===5?' · 피해 -50% · 판정 여유 +35% · 실패 한 번 더':'';
   h+=button('망 '+n+'개를 두르고 사냥한다 · 정신력 -'+c+perk+(n>top?' (수련 부족)':state.mind<=c?' (정신력 부족)':''),'mangHunt',String(n),n===MIN_RINGS?'danger':'',!can);
  }
  h+='</div>';
 }
 return h+'</div>';
}

/* ---------- 조우 화면: 기존 사냥 버튼을 망 선택으로 바꿈 ---------- */
const prevPlay=renderPlay;
renderPlay=function(){
 if(rings()&&!inCalamity()&&!(state.scene==='encounter'&&WHALES_OK.has(state.encounter)))state.mangActive=0;
 const html=prevPlay();
 if(state.scene==='encounter'&&WHALES_OK.has(state.encounter)&&/data-act="huntWhale"/.test(html)){
  return html.replace(/<button[^>]*data-act="huntWhale"[^>]*>[^<]*<\/button>/,'')+huntBlock();
 }
 return html;
};
let go=false;
const prevHunt=huntWhale;
huntWhale=function(){
 if(state.scene==='encounter'&&WHALES_OK.has(state.encounter)&&!go)return;   // 망 없이는 사냥 불가
 return prevHunt.apply(this,arguments);
};
document.addEventListener('click',function(e){
 const b=e.target&&e.target.closest&&e.target.closest('button[data-act="mangHunt"]');
 if(!b||b.disabled||busy)return;
 if(!(state.scene==='encounter'&&WHALES_OK.has(state.encounter)))return;
 const n=Number(b.dataset.value)|0;
 if(missing().length||n<MIN_RINGS||n>shin()||state.mind<=ringCost(n))return;
 const c=ringCost(n),k=state.encounter;
 state.mind=Math.max(1,state.mind-c);
 state.mangActive=n;
 state.calamityHarpoon.damaged=true;
 log('신을 끌어올립니다. 특수 작살에 망 '+n+'개가 감깁니다. 정신력 -'+c+'.'+(n>=4?' 고리가 겹칠수록 작살 끝이 고래의 살을 먼저 알아봅니다.':''));
 go=true;try{huntWhale();}finally{go=false;}
 if(state.scene==='encounter'&&state.encounter===k)sync();
},true);

/* ---------- 4망부터: 사냥 중 받는 피해 감소 ---------- */
const prevDamage=takeDamage;
takeDamage=function(h,m){
 const g=inCalamity()?API.guard():0;
 if(g>0){h=h>0?Math.max(1,Math.round(h*(1-g))):h;m=m>0?Math.max(1,Math.round(m*(1-g))):m;}
 return prevDamage(h,m);
};

/* ---------- 항구: 특수 작살 · 신 수련 ---------- */
const prevShop=renderShop132;
renderShop132=function(){
 const out=prevShop(),avail=inShop132(),h=harp(),lv=shin();
 let s='<div class="inset"><h3>재앙 사냥 준비 · 특수 작살과 신과 망</h3>'+
  '<p class="muted">창백한 · 푸른 · 붉은 고래는 특수 작살에 망을 '+MIN_RINGS+'개 이상 두른 손으로만 사냥할 수 있습니다. 4개부터는 사냥에 이점이 생기고, 최대 5개까지 두를 수 있습니다.</p>'+
  tag(HARPOON.name+' '+(h?(h.damaged?'손상됨':'정비됨'):'없음'))+' '+tag('신 수련 '+lv+' / '+MAX_RINGS+'단계')+'<div class="stack" style="margin-top:8px">';
 if(!h)s+=button(HARPOON.name+' 구매 · '+unitMoney(HARPOON.cost)+' · 선장 '+HARPOON.grade+'등급 이상','calHarpoonBuy','','primary',!avail||state.grade<HARPOON.grade||state.gold<HARPOON.cost);
 else s+=button('특수 작살 정비 · '+unitMoney(HARPOON.cost/2)+(h.damaged?'':' (정비 완료)'),'calHarpoonFix','','',!avail||!h.damaged||state.gold<HARPOON.cost/2);
 if(lv<MAX_RINGS){const T=TRAIN[lv];
  s+=button('신 수련 '+(lv+1)+'단계 · 망 '+(lv+1)+'개 · '+unitMoney(T.cost)+' · 통과 '+T.xp+'회 이상 · 선장 '+HARPOON.grade+'등급',
   'calShinTrain','','',!avail||state.grade<HARPOON.grade||state.gold<T.cost||state.xp<T.xp);
  s+='<p class="small muted">기억을 끌어올려 그 감정으로 머리를 채우는 법을 익힙니다. 망을 하나 더 두를 때마다 정신의 부담은 거의 두 배가 됩니다. (현재 통과 '+state.xp+'회)</p>';
 }else s+='<p class="small">망을 다섯 개까지 두를 수 있습니다.</p>';
 return out+s+'</div></div>';
};
document.addEventListener('click',function(e){
 const b=e.target&&e.target.closest&&e.target.closest('button[data-act="calHarpoonBuy"],button[data-act="calHarpoonFix"],button[data-act="calShinTrain"]');
 if(!b||b.disabled||busy||!inShop132())return;
 const act=b.dataset.act;
 if(act==='calHarpoonBuy'&&!harp()&&state.grade>=HARPOON.grade&&state.gold>=HARPOON.cost){
  state.gold-=HARPOON.cost;state.calamityHarpoon={damaged:false};log(HARPOON.name+'를 샀습니다. '+unitMoney(HARPOON.cost)+' 사용.');
 }else if(act==='calHarpoonFix'&&harp()&&harp().damaged&&state.gold>=HARPOON.cost/2){
  state.gold-=HARPOON.cost/2;state.calamityHarpoon.damaged=false;log('휘고 이가 빠진 특수 작살을 정비했습니다. '+unitMoney(HARPOON.cost/2)+' 사용.');
 }else if(act==='calShinTrain'){
  const lv=shin(),T=TRAIN[lv];
  if(!T||state.grade<HARPOON.grade||state.gold<T.cost||state.xp<T.xp)return;
  state.gold-=T.cost;state.shinLevel=lv+1;log('신 수련 '+(lv+1)+'단계: 이제 망을 '+(lv+1)+'개까지 두를 수 있습니다. '+unitMoney(T.cost)+' 사용.');
 }else return;
 sync();
});
})();
