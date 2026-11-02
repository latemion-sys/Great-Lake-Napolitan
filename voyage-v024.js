/* 대호수 v0.2.4 · 항해 규칙 조정
   - 평시 인어 조우 10%. 재앙의 고래는 출항마다 50개 호수 중 한 곳만 정해 그 호수에서 1% 확률로 등장(희귀 고래는 기존 조우 기회의 일부로 등장). 파도성 재해는 위험도별 6/12/20/30%이며, 발생 시 대개 고래나 인어가 동반됨.
   - 출항 전 이야기: 뱃노래 노랫말(싸고 애매함) / 구전으로 전해지는 법(비싸지만 자세함)
   - [대호수 주파]: 3등급 이상 선장이 항구에 돌아올 때 15% 확률로 제안. 랜덤 호수 15개, 장면마다 30초 안에 고르지 못하면 사망.
     끝까지 건너면 자금 + 선체 보강(최대 내구도 +10, 영구) + 기적 업적 [대호수를 주파한 선장]
   - 업적 달성 횟수: 같은 생애에서는 한 번, 사망 후 다시 달성하면 +1 (대호수 주파는 건널 때마다 +1) */
(function(){
'use strict';
const MERMAID_P=.10,WHALE_P=.05,RARE_SHARE=.3,CALAMITY_P=.01,CROSS_P=.15,CROSS_LAKES=15,CROSS_SEC=30,HULL_STEP=10,HULL_CAP=50;
// 위험도는 호수 입장 시 단 한 번 파도성 재해가 발생하는 확률을 뜻합니다.
const WAVE_RISK_028=[0,.06,.12,.20,.30],WAVE_WHALE_SHARE_028=.30,WAVE_MERMAID_SHARE_028=.50;
const waveProbability028=risk=>WAVE_RISK_028[Math.max(1,Math.min(4,Math.round(Number(risk)||1)))];
const COUNT_KEY='daehosu_ach_counts_v024',BONUS_KEY='daehosu_hull_bonus_v024';
const store={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};

/* ---------- 선체 보강(영구) ---------- */
function hullBonus(){return Math.max(0,Math.min(HULL_CAP,+store.get(BONUS_KEY,0)||0));}
const baseDamage=takeDamage;
takeDamage=function(h,m){
 const b=hullBonus();
 return baseDamage.call(this,h>0&&b?h*100/(100+b):h,m);   // 최대 내구도가 늘어난 만큼 같은 공격의 침식 비율이 줄어듦
};

/* ---------- 업적 달성 횟수 ---------- */
const counts=store.get(COUNT_KEY,{})||{};
function lifeSet(){if(!Array.isArray(state.achLife024))state.achLife024=[];return state.achLife024;}
if(!Array.isArray(state.achLife024)){
 // 처음 적용될 때: 이미 달성한 업적은 1회, 지금의 생애에서 이미 센 것으로 둠
 state.achLife024=[...(state.achievements||[])];
 for(const id of state.achievements||[])if(!counts[id])counts[id]=1;
 store.set(COUNT_KEY,counts);
}
const baseAward=award;
award=function(id){
 const r=baseAward.apply(this,arguments);
 const life=lifeSet();
 if((state.achievements||[]).includes(id)&&!life.includes(id)){life.push(id);counts[id]=(counts[id]||0)+1;store.set(COUNT_KEY,counts);}
 return r;
};
window.AchCount024={get:id=>counts[id]||0,bump(id){counts[id]=(counts[id]||0)+1;store.set(COUNT_KEY,counts);}};

/* ---------- 고래 · 인어 조우 ---------- */
const RARE={
 stem:{name:'천가닥 줄기 고래',power:190,need:2,loot:'꼬인 줄기 한 가닥',money:70,
  desc:'굵기가 제각각인 촉수 수천 가닥이 서로 뒤얽힌 채 수면 위로 치솟아 있습니다. 멀리서 보면 호수 한가운데 뿌리를 내린 거대한 나무 같습니다. 그것은 움직이지 않습니다. 언제나 같은 자리에 서 있고, 다가오는 것을 기다릴 뿐입니다. 가까이 가면 가는 가닥들이 바람도 없이 흔들리며 뱃전을 더듬습니다.'},
 hole:{name:'구멍 손바닥 고래',power:210,need:2,loot:'구멍 난 손바닥 가죽',money:80,
  desc:'구멍 고래의 일종입니다. 물 위로 드러나는 것은 손가락이 네 개뿐인 거대한 손 모양의 기관 하나입니다. 그 손이 배를 움켜쥐면 손바닥에 뚫린 구멍마다 무언가가 꿈틀거리고, 이내 인어들이 기어 나옵니다. 본체는 끝내 물 위로 나오지 않습니다. 다만 물속의 그림자는 고래만 한 넙치에 거대한 손 두 개가 달린 모습입니다.'}
};
window.RareWhales024=RARE;
function pickWhale(){
 const seen=state.whaleSeen||[],pool=WHALES.map((_,i)=>i).filter(i=>!huntedWhaleIndices143().includes(i)&&!seen.includes(i));
 const hint=state.whaleHint024;
 if(pool.length&&hint!=null&&pool.includes(hint)&&Math.random()<.5)return {k:hint};
 if(!pool.length||Math.random()<RARE_SHARE){const keys=Object.keys(RARE);return {rare:keys[rng(keys.length)]};}
 return {k:pool[rng(pool.length)]};
}
function pickCalamity025(){
 const pool=WHALES.map((_,i)=>i).filter(i=>!huntedWhaleIndices143().includes(i));if(!pool.length)return null;
 const hint=state.whaleHint024;
 const k=hint!=null&&pool.includes(hint)&&Math.random()<.5?hint:pool[rng(pool.length)];
 return {lake:LAKES[rng(LAKES.length)].id,k};
}
const basePrepare025=prepareVoyage;
prepareVoyage=function(){
 const r=basePrepare025.apply(this,arguments);
 if(state.scene==='prep'&&!state.sea){
  state.calamityLake025=pickCalamity025();
  state.whalePlaces={};if(state.calamityLake025)state.whalePlaces[state.calamityLake025.lake]=state.calamityLake025.k;   // 술집 목격담이 가리키는 호수와 같게
  save();
 }
 return r;
};
const baseEnter=enterNextLake0131;
enterNextLake0131=function(id){
 if(state.scene!=='route'||!state.offered.includes(id)||state.visited.includes(id))return baseEnter.apply(this,arguments);
 const lake=LAKE_BY_ID157.get(id);
 const risk=Math.max(1,Math.min(4,Math.round(Number(lake?.risk)||1)));
 const wave=Math.random()<waveProbability028(risk);
 const waveTypeRoll=wave?Math.random():1;
 const waveKind=wave?(waveTypeRoll<WAVE_WHALE_SHARE_028?'whale':
   waveTypeRoll<WAVE_WHALE_SHARE_028+WAVE_MERMAID_SHARE_028?'mermaid':'wave'):null;
 // 평시 조우 5%·파도 동반 조우는 이제 희귀 고래에만 쓰인다(재앙의 고래는 아래 1곳·1% 규칙). 인어 10%는 그대로.
 const whaleEncounter=waveKind==='whale'||Math.random()<WHALE_P;
 const mermaidEncounter=waveKind==='mermaid'||Math.random()<MERMAID_P;
 state.whalePlaces={};
 state.waveHazard028=null;
 let rare=null;
 // 재앙의 고래(창백한·푸른·붉은·까만·노란): 출항 준비 때 50개 호수 중 한 곳만 정해 두고,
 // 그 호수에 들어갔을 때에만 1% 확률로 나타난다(정해진 호수가 이번 항로에 없으면 이번 출항엔 나타나지 않음).
 const C=state.calamityLake025;
 if(C&&C.lake===id&&Math.random()<CALAMITY_P&&!huntedWhaleIndices143().includes(C.k))state.whalePlaces[id]=C.k;
 // 희귀 고래는 기존 조우 기회 그대로(평시 조우·파도 동반 조우 중 일부)
 if(whaleEncounter&&Math.random()<RARE_SHARE){const keys=Object.keys(RARE);rare=keys[rng(keys.length)];}
 const result=baseEnter.apply(this,arguments);
 if(state.scene==='dead'||state.current!==id)return result;
 state.normalMermaidDraw=mermaidEncounter;
 if(wave){
  const oldHull=state.hull,oldMind=state.mind;
  takeDamage(2+2*risk,1+risk);
  state.waveHazard028={
   lake:id,risk,kind:waveKind,
   hullLoss:Math.max(0,Math.round((oldHull-state.hull)*10)/10),
   mindLoss:Math.max(0,Math.round((oldMind-state.mind)*10)/10)
  };
  log('21-'+String(id).padStart(2,'0')+'에 파도성 재해가 발생했습니다. 선체가 흔들리고 선원들이 동요합니다.');
  if(!safeCheck())return result;
 }
 if(rare&&state.scene!=='dead'&&state.current===id){
  state.rareWhale024={id:rare,lake:id};state.scene='rareWhale';sync();
 }else if(wave)sync();
 else save();
 return result;
};
function rareScene(){
 const R=state.rareWhale024,d=R&&RARE[R.id];if(!d)return null;
 return ''+   // 희귀 고래는 이펙트 없이 글로만 등장
  '<div class="inset warning"><div class="small">희귀 고래 · 이 호수에 사는 것</div><h2>'+esc(d.name)+'</h2><p>'+esc(d.desc)+'</p>'+
  '<p class="muted">재앙은 아니지만, 이 호수의 고래입니다. 사냥에 성공하면 '+esc(d.loot)+'을(를) 얻을 수 있습니다.</p>'+
  tag('호수 침식도 '+state.exposure+' / 100')+' '+tag('아군 전투력 '+crewPower())+
  '<div class="stack" style="margin-top:14px">'+button('조용히 지나간다','rareAvoid','','primary')+button('희귀 고래를 사냥한다','rareHunt','','danger')+'</div></div>';
}
function rareAvoid(){
 const R=state.rareWhale024;if(state.scene!=='rareWhale'||!R)return;
 state.rareWhale024=null;
 if(R.id!=='stem'&&Math.random()<.18){takeDamage(10,6);   // 천가닥 줄기 고래는 붙박이라 쫓아오지 않음
 log(RARE[R.id].name+'의 곁을 지나다 뱃전이 긁혔습니다.');if(!safeCheck())return;}
 else log(RARE[R.id].name+'의 곁을 조용히 지나갔습니다.');
 state.scene='event';sync();
}
function rareHunt(){
 const R=state.rareWhale024;if(state.scene!=='rareWhale'||!R)return;
 const d=RARE[R.id];
 beginBattle({type:'rare',rare:R.id,name:d.name,power:d.power+state.grade*10,need:d.need,won:0,history:[],after:'event'});
}
const baseCoin=resolveCoin;
resolveCoin=function(win){
 const b=state.battle;
 if(b&&b.type==='rare'){
  if(win&&b.won+1>=b.need){
   b.won++;b.history.push('앞면 · 유효 타격');const d=RARE[b.rare];
   gainMoney148(d.money+state.grade*8);
   if(!Array.isArray(state.rareLoot024))state.rareLoot024=[];state.rareLoot024.push(d.loot);
   if(!state.prog)state.prog={};state.prog.rareWhales024=(state.prog.rareWhales024||0)+1;
   log(d.name+' 사냥 성공! '+d.loot+'을(를) 건졌습니다.');
   state.battle=null;state.rareWhale024=null;state.lastCoin='앞면 · 승리';state.scene='event';sync();return;
  }
  if(!win){const r=baseCoin.apply(this,arguments);takeDamage(8,4);if(state.scene!=='dead')safeCheck();return r;}
 }
 return baseCoin.apply(this,arguments);
};
const baseFlee=fleeBattle;
fleeBattle=function(){
 const b=state.battle;
 if(b&&b.type==='rare'&&!busy&&state.scene==='battle'){
  if(Math.random()<.3){takeDamage(14,6);log(b.name+'에게서 벗어나지 못했습니다.');if(!safeCheck())return;sync();return;}
  state.battle=null;state.rareWhale024=null;log(b.name+'에게서 벗어났습니다.');state.scene='event';sync();return;
 }
 return baseFlee.apply(this,arguments);
};

/* ---------- 출항 전 이야기: 노랫말 / 구전되는 법 ---------- */
function scriptOf(id){const d=window.GREAT_LAKE_SCRIPT_DATA_023;return Array.isArray(d)?d.find(x=>x.id===id):null;}
function lyricOf(l){const d=scriptOf(l.id);if(d&&d.hints&&d.hints.length)return d.hints[rng(d.hints.length)];try{return lakeLaw(l).truth(lakeZone(l));}catch(e){return '물빛이 바뀌면 손을 멈추라는 노랫말이 있습니다.';}}
function lawOf(l){const d=scriptOf(l.id);return d&&d.law?d.law:null;}
const baseRumor=buyRumor;
buyRumor=function(cost){
 if(state.scene!=='prep'||state.rumorBought||cost===0)return baseRumor.apply(this,arguments);
 if(![20,50].includes(cost)||state.gold<cost)return;
 const before=state.count.rumors;
 baseRumor.apply(this,arguments);                  // 비용 · 횟수 · 업적은 기존 흐름 그대로
 if(state.count.rumors===before)return;
 const chance=cost===20?.6+state.grade*.04:.82+state.grade*.03;
 const lakes=shuffle(state.offered.slice()).slice(0,cost===20?3:2);
 const others=shuffle(LAKES.map(l=>l.id).filter(id=>!lakes.includes(id)));
 const out=lakes.map((id,i)=>{
  const l=LAKE_BY_ID157.get(id),truth=Math.random()<chance||i===0;
  if(cost===20){
   const txt=truth?lyricOf(l):lyricOf(LAKE_BY_ID157.get(others[i])||l);
   return {lake:id,kind:'노랫말',text:'〈뱃노래 한 소절〉 '+txt};
  }
  const law=lawOf(truth?l:LAKE_BY_ID157.get(others[i])||l);
  return {lake:id,kind:'구전되는 법',text:'〈구전되는 법〉 '+(law?law:lyricOf(truth?l:LAKE_BY_ID157.get(others[i])||l))};
 });
 if(cost===50&&Math.random()<.25){
  const pool=WHALES.map((_,i)=>i).filter(i=>!huntedWhaleIndices143().includes(i));
  if(pool.length){const k=pool[rng(pool.length)],tr=Math.random()<chance;state.whaleHint024=tr?k:null;
   out.push({lake:null,kind:'먼바다의 목격담',text:'이번 물길 어딘가에서 '+WHALES[tr?k:pool[rng(pool.length)]].name+'를 봤다는 이야기가 있습니다.'});}
 }
 state.rumors=out;sync();
};

/* ---------- [대호수 주파] ---------- */
function crossing(){return state.crossing024||null;}
const baseReturnPortCheck=completeLake;
completeLake=function(success,msg){
 const c=crossing(),wasSea=state.sea;
 const r=baseReturnPortCheck.apply(this,arguments);
 if(c&&wasSea&&!state.sea&&state.scene==='port'&&!c.done){
  // 15개를 모두 건너 항구로 돌아옴
  c.done=true;state.crossing024=null;
  const money=150+state.grade*30;gainMoney148(money);
  const nb=Math.min(HULL_CAP,hullBonus()+HULL_STEP);store.set(BONUS_KEY,nb);
  if(!state.prog)state.prog={};state.prog.crossings024=(state.prog.crossings024||0)+1;
  const inLife=lifeSet().includes('great_crossing');
  award('great_crossing');if(inLife)window.AchCount024.bump('great_crossing');   // 같은 생애에서 다시 건너도 +1
  state.crossResult024={money,bonus:nb,capped:nb>=HULL_CAP&&hullBonus()===nb};
  log('[대호수 주파] 15개의 호수를 모두 건넜습니다. '+money+'만 안(眼)과 선체 보강(최대 내구도 '+(100+nb)+')을 얻었습니다.');
  sync();
 }
 return r;
};
const baseDie=die;
die=function(){
 const c=crossing();
 if(c)state.crossing024=null;
 state.crossOffer024=false;
 return baseDie.apply(this,arguments);
};
const baseReturn=returnPort;
returnPort=function(){
 const c=crossing();
 const r=baseReturn.apply(this,arguments);
 if(c&&!state.sea){state.crossing024=null;log('[대호수 주파]를 중간에 그만두었습니다. 보상은 없습니다.');sync();}
 return r;
};
// 항구에 돌아올 때마다 3등급 이상이면 15% 확률로 제안
let lastPortSerial=null;
function rollOffer(){
 if(state.scene!=='port'||state.sea||state.grade<3)return;
 const serial=(state.count&&state.count.return||0)+':'+(state.voyage||0);
 if(state.crossSerial024===serial)return;
 state.crossSerial024=serial;
 state.crossOffer024=Math.random()<CROSS_P;
}
function startCrossing(){
 if(state.scene!=='port'||state.sea||!state.crossOffer024||state.grade<3)return;
 state.crossOffer024=false;
 prepareVoyage();
 if(state.scene!=='prep')return;
 const ids=shuffle(LAKES.map(l=>l.id)).slice(0,CROSS_LAKES);
 state.offered=ids;state.whalePlaces={};
 state.crossing024={total:CROSS_LAKES,startedAt:Date.now()};
 log('[대호수 주파]를 준비합니다. 랜덤한 호수 '+CROSS_LAKES+'개를 연달아 건너야 하며, 장면마다 '+CROSS_SEC+'초 안에 선택하지 못하면 죽습니다.');
 sync();
}
function crossPanel(){
 return '<div class="inset cross-offer-024"><div class="small">드물게 들려오는 제안 · 3등급 이상</div><h2>[대호수 주파]</h2>'+
  '<p>선술집 구석의 늙은 뱃사람이 해도 한 장을 내밉니다. 대호수를 쉬지 않고 가로지르는 물길입니다. 호수 '+CROSS_LAKES+'개가 연달아 이어지며, 어느 호수에서도 오래 망설일 수 없습니다.</p>'+
  '<p class="muted">랜덤한 호수 '+CROSS_LAKES+'개 · 장면마다 '+CROSS_SEC+'초 안에 선택하지 못하면 사망 · 끝까지 건너면 자금과 선체 보강(최대 내구도 +'+HULL_STEP+', 영구) · 중간에 귀항하면 보상 없음</p>'+
  '<div class="stack">'+button('[대호수 주파]에 나선다','crossStart','','danger')+button('이번에는 넘긴다','crossSkip')+'</div></div>';
}

/* ---------- 장면 제한 시간 ---------- */
let timer={key:null,until:0};
function sceneKey(){
 const st=state.lakeStory||{};
 return [state.scene,state.current,st.turns,st.step,st.sceneText||'',state.nav&&state.nav.stage,state.ruleResolved].join('|');
}
function timerOn(){return !!crossing()&&state.sea&&state.scene==='event'&&tab==='play';}
function timerHtml(){
 const left=Math.max(0,timer.until-Date.now())/1000;
 return '<div class="cross-timer-024" aria-live="polite"><div class="between"><b>[대호수 주파] '+((state.visited||[]).length+1)+' / '+CROSS_LAKES+'</b><span class="cross-left-024">'+left.toFixed(0)+'초</span></div>'+
  '<div class="meter cross-meter-024"><span style="width:'+(100*left/CROSS_SEC).toFixed(1)+'%"></span></div></div>';
}
setInterval(function(){
 if(!crossing()||!state.sea){timer.key=null;return;}
 if(!(state.scene==='event'))return;              // 전투 · 고래 조우 중에는 멈춤
 const k=sceneKey();
 if(k!==timer.key){timer.key=k;timer.until=Date.now()+CROSS_SEC*1000;}
 const left=timer.until-Date.now();
 const box=document.querySelector('.cross-timer-024');
 if(box){const s=box.querySelector('.cross-left-024'),m=box.querySelector('.cross-meter-024 span');if(s)s.textContent=Math.max(0,Math.ceil(left/1000))+'초';if(m)m.style.width=Math.max(0,100*left/(CROSS_SEC*1000)).toFixed(1)+'%';box.classList.toggle('urgent',left<8000);}
 if(left<=0&&!busy&&state.scene==='event'&&state.current!=null){
  timer.key=null;
  log('[대호수 주파] 제한 시간 안에 선택하지 못했습니다.');
  if(typeof mermaidDeath015==='function')mermaidDeath015(state.current);else{die();render();}
 }
},250);

/* ---------- 화면 ---------- */
function waveAlert028(wave){
 if(!wave||state.current!==wave.lake)return '';
 return '<div class="inset warning">'+
  '<div class="small">파도성 재해 · 위험도 '+wave.risk+'단계</div>'+
  '<h3>거센 파도가 뱃전을 덮쳤습니다.</h3>'+
  '<p class="muted">선체가 흔들리고 선원들의 정신이 동요합니다. 물결 아래 무엇이 뒤따를지는 알 수 없습니다.</p>'+
  tag('선체 피해 '+wave.hullLoss)+' '+tag('정신 피해 '+wave.mindLoss)+
  '</div>';
}
const basePlay=renderPlay;
renderPlay=function(){
 if(state.scene==='rareWhale'){
  const h=rareScene();
  if(h)return waveAlert028(state.waveHazard028)+h;
  state.scene='event';
 }
 rollOffer();
 let page=basePlay.apply(this,arguments);
 if(state.scene==='route'){
  page=page.replace(/위험도 ([1-4])(?=<\/span>)/g,(_,grade)=>
   '파도 위험 '+grade+'단계 · '+Math.round(waveProbability028(Number(grade))*100)+'%');
  page=page.replace('<h2>이번 출항의 호수</h2>',
   '<h2>이번 출항의 호수</h2><p class="muted">위험도는 호수 진입 시 파도성 재해가 발생할 확률입니다. 파도에 고래와 인어가 동반될 수 있습니다. 호수의 법을 어겼을 때의 판정과는 별개입니다.</p>');
 }
 if(state.waveHazard028&&['event','encounter','special','battle'].includes(state.scene)){
  page=waveAlert028(state.waveHazard028)+page;
 }
 if(state.scene==='port'&&!state.sea){
  if(state.crossResult024){const R=state.crossResult024;state.crossResult024=null;
   page='<div class="inset cross-offer-024"><h2>대호수를 주파했습니다</h2><p>'+R.money+'만 안(眼)을 받았습니다. 선체가 보강되어 최대 내구도가 <b>'+(100+R.bonus)+'</b>이 되었습니다'+(R.bonus>=HULL_CAP?' (보강 한도)':'')+'.</p></div>'+page;}
  if(state.crossOffer024&&state.grade>=3)page=crossPanel()+page;
 }
 if(state.scene==='prep'&&!state.rumorBought){
  page=page.replace('술값 20 만 안(眼) 지불','뱃노래 노랫말 · 20 만 안(眼) — 싸지만 애매함').replace('고급 술집 · 정보료 50 만 안(眼)','구전으로 전해지는 법 · 50 만 안(眼) — 비싸지만 자세함')
   .replace('항구에서 뱃사람들의 전언을','<b>뱃노래 노랫말</b>은 값이 싸지만 은유뿐이라 애매하고, <b>구전으로 전해지는 법</b>은 비싸지만 호수의 규칙을 조금 더 자세하게 들려줍니다(호수 2곳). 항구에서 뱃사람들의 전언을');
 }
 if(crossing()&&state.scene==='prep')page='<div class="inset cross-offer-024"><b>[대호수 주파]</b> · 랜덤 호수 '+CROSS_LAKES+'개 · 장면마다 '+CROSS_SEC+'초</div>'+page;
 if(timerOn()){
  const k=sceneKey();if(k!==timer.key){timer.key=k;timer.until=Date.now()+CROSS_SEC*1000;}
  page=timerHtml()+page;
 }
 return page;
};
const beforeHelpRisk028=renderHelp;
renderHelp=function(){
 const page=beforeHelpRisk028.apply(this,arguments);
 const levels=WAVE_RISK_028.slice(1).map((p,i)=>
  '<div class="stat"><small>위험도 '+(i+1)+'단계</small><strong>파도 '+Math.round(p*100)+'%</strong></div>').join('');
 return page+'<div class="inset"><h3>호수 위험도와 파도</h3>'+
  '<p>위험도는 해당 호수에 진입할 때 <b>파도성 재해</b>가 일어날 가능성을 뜻합니다. 입장할 때 한 번만 판정하며, 선택지를 누를 때마다 재추첨하지 않습니다.</p>'+
  '<div class="stats">'+levels+'</div>'+
  '<p class="muted">파도가 발생하면 선체와 정신에 피해를 입습니다. 대부분 고래나 인어가 동반되지만 파도만 일어날 수도 있습니다. 파도와 무관한 평시 고래·인어 조우 가능성은 별도로 유지됩니다. 위험도는 호수의 법을 어겼을 때의 즉사 확률이 아닙니다.</p></div>';
};
const baseSide=renderSide;
renderSide=function(){
 const r=baseSide.apply(this,arguments);
 const b=hullBonus(),el=document.getElementById('stats');
 if(el&&b&&!el.querySelector('.hull-bonus-024'))el.insertAdjacentHTML('beforeend','<div class="stat hull-bonus-024"><small>선체 최대 내구도</small><strong>'+(100+b)+' (보강 +'+b+')</strong></div>');
 // 휴대폰: 항해 화면 위에 붙는 작은 현황 줄(사이드 패널은 아래로 내려감)
 let ms=document.getElementById('mstat024');
 const main=document.querySelector('main.panel');
 if(!ms&&main){ms=document.createElement('div');ms.id='mstat024';ms.className='mstat-024';main.insertBefore(ms,main.firstChild);}
 if(ms)ms.innerHTML='<span>'+state.grade+'등급</span><span>자금 <b>'+state.gold+'</b></span><span class="'+(state.exposure>=70?'bad':'')+'">침식 <b>'+(state.exposure||0)+'</b></span><span class="'+(state.mind<=30?'bad':'')+'">정신 <b>'+state.mind+'</b></span>'+
  (state.sea?'<span>항해 <b>'+(state.visited||[]).length+'/'+(state.offered||[]).length+'</b></span>':'')+(crossing()?'<span class="cross">주파 중</span>':'');
 if(el&&crossing()&&!el.querySelector('.cross-stat-024'))el.insertAdjacentHTML('beforeend','<div class="stat cross-stat-024"><small>대호수 주파</small><strong>'+(state.visited||[]).length+' / '+CROSS_LAKES+'</strong></div>');
 return r;
};
document.addEventListener('click',function(e){
 const b=e.target&&e.target.closest&&e.target.closest('button[data-act]');
 if(!b||b.disabled||busy)return;
 const a=b.dataset.act;
 if(a==='rareAvoid')rareAvoid();
 else if(a==='rareHunt')rareHunt();
 else if(a==='crossStart')startCrossing();
 else if(a==='crossSkip'){state.crossOffer024=false;sync();}
});
// 재시작 · 저장 복구 정리
if(state.scene==='rareWhale'&&!state.rareWhale024){state.scene='event';}
if(state.crossing024&&!state.sea)state.crossing024=null;
window.Voyage024={hullBonus,crossing,startCrossing,pickWhale,pickCalamity025,CALAMITY_P,RARE,MERMAID_P,WHALE_P,CROSS_P,
 waveProbability:waveProbability028,waveRiskRates:WAVE_RISK_028.slice(1),
 waveCompanions:{whale:WAVE_WHALE_SHARE_028,mermaid:WAVE_MERMAID_SHARE_028,waveOnly:1-WAVE_WHALE_SHARE_028-WAVE_MERMAID_SHARE_028},
 timer:()=>({...timer})};
render();
})();
