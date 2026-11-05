/* 대호수 v.1.5.1 · 항해 방침, 재해별 대응, 희귀 고래, 재앙 추적, 선원 기질.
   법·선택지·체류 턴과 즉사 조건은 변경하지 않습니다. */
(function(){
'use strict';
if(typeof state==='undefined'||typeof enterNextLake0131!=='function'||!window.Voyage024)return;
const VERSION='1.5.1';
const MODES={
 defensive:{name:'방어적 항해',detail:'파도 선체 피해 1단계 감소 · 파도 선원 피해 1단계 감소 · 특별 어획 및 재앙 흔적 발견 확률 각각 10%포인트 감소'},
 fishing:{name:'어획적 항해',detail:'정상 통과 시 추가 물고기 획득 확률 +25%포인트 · 호수 정상 통과마다 선체 피해 10'},
 seeking:{name:'고래 탐색적 항해',detail:'재앙 흔적과 인어 조우 확률 증가 · 희귀 고래 추가 전리품 확률 +10%포인트 · 파도 선원 피해 1단계 증가'}
};
const TEMPER=[
 ['담대한','고래를 보아도 비교적 침착합니다.'],
 ['신중한','파도의 위험을 먼저 살핍니다.'],
 ['다정한','다른 선원의 상처를 쉽게 지나치지 못합니다.'],
 ['냉정한','인어와 마주쳐도 당황이 적습니다.'],
 ['예민한','거친 파도의 영향을 크게 받습니다.'],
 ['호기심 많은','기이한 고래에 관심을 두지만 쉽게 동요합니다.'],
 ['낙천적인','첫 번째 불길한 경험을 견뎌 냅니다.'],
 ['책임감 강한','동료의 부상을 자기 일처럼 여깁니다.'],
 ['독립적인','동료의 공포에 잘 휘둘리지 않습니다.'],
 ['차분한','불안이 몸에 남기까지 시간이 더 걸립니다.']
];
const GIFTS=[
 ['전투 숙련','전투력 +2'],
 ['어부의 손길','추가 어획 확률 +2%포인트'],
 ['추적 감각','재앙 흔적 발견 확률 +2%포인트'],
 ['노련한 조타','파도 선체 피해 1 추가 감소 확률 12%'],
 ['단단한 몸','파도 선원 피해 1단계 무효화 확률 20%'],
 ['굳은 담력','불안 누적을 막을 확률 20%'],
 ['회복력','호수 통과 후 상태 1단계 회복 확률 5%'],
 ['동료애','선원 피해를 1단계 줄일 확률 15%']
];
const FLAWS=[
 ['전투 미숙','전투력 -2'],
 ['낚시 미숙','추가 어획 확률 -2%포인트'],
 ['길눈 부족','재앙 흔적 발견 확률 -2%포인트'],
 ['조타 미숙','파도 선체 피해 1 증가 확률 12%'],
 ['약한 체질','파도 선원 피해 1단계 증가 확률 15%'],
 ['겁이 많음','불안 누적 1 추가 확률 20%'],
 ['쉽게 지침','호수 통과 후 상태 1단계 악화 확률 5%'],
 ['제 몸만 돌봄','선원 피해가 1단계 늘어날 확률 15%']
];
const WAVES=[
 {name:'살갗을 긁는 물비늘',desc:'잘게 갈라진 수면이 날 선 비늘처럼 선체 옆을 긁습니다.',type:null},
 {name:'손바닥처럼 뒤집히는 회오리',desc:'회오리 한가운데에 네 개의 손가락 같은 그림자가 번갈아 드러납니다.',type:'hole'},
 {name:'수천 가닥이 엉킨 너울',desc:'물 위로 가늘고 긴 것들이 솟구쳐 서로 묶이며 배의 진로를 좁힙니다.',type:'stem'},
 {name:'뱃전 아래의 빈 울림',desc:'파도보다 먼저 배 밑에서 일정한 간격으로 두드리는 소리가 들립니다.',type:null},
 {name:'잿빛 물벽',desc:'먼 수면이 위로 밀려 올라가며 정면의 시야를 가립니다.',type:null},
 {name:'부서지는 푸른 거품',desc:'푸른 물거품이 끊임없이 튀어 올라 갑판의 발 디딜 곳을 지웁니다.',type:null},
 {name:'돛을 비트는 역풍',desc:'바람을 마주 받은 돛이 서로 다른 방향으로 당겨집니다.',type:null},
 {name:'수평선 아래서 밀려오는 압력',desc:'보이지 않는 무게가 뱃머리를 눌러 선체의 이음새를 삐걱거리게 합니다.',type:null},
 {name:'고르지 않게 치솟는 물기둥',desc:'물기둥이 낮게 솟다가 예고 없이 훨씬 높은 자리에서 다시 터집니다.',type:null},
 {name:'검게 접히는 물살',desc:'검은 물살이 접혔다 펴지며 배 주위의 거리를 가늠하기 어렵게 만듭니다.',type:null}
];
const TRACK_FEE=35,TRACK_CHANCE=.18,BASE_CATCH=.10,BASE_TRACE=.12,MAX_CLUE=8;
const LABEL=id=>'21-'+String(id).padStart(2,'0');
const chance=p=>Math.random()<Math.max(0,Math.min(1,p));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const mode=()=>MODES[state.mode151]?state.mode151:'defensive';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hunted=k=>typeof huntedWhaleIndices143==='function'&&huntedWhaleIndices143().includes(k);
function applyCrew(c){
 if(!c||typeof c!=='object')return;
 const p=c.persona151;
 if(!p||!Number.isInteger(p.temper)||p.temper<0||p.temper>=10||
  !Number.isInteger(p.gift)||p.gift<0||p.gift>=8||!Number.isInteger(p.flaw)||p.flaw<0||p.flaw>=8){
  c.persona151={temper:Math.floor(Math.random()*10),gift:Math.floor(Math.random()*8),
   flaw:Math.floor(Math.random()*8),stress:0,seen:{wave:0,mermaid:0,whale:0}};
 }else{
  if(!Number.isFinite(p.stress))p.stress=0;
  if(!p.seen||typeof p.seen!=='object')p.seen={wave:0,mermaid:0,whale:0};
 }
}
function ready(){
 if(!MODES[state.mode151])state.mode151='defensive';
 if(!Array.isArray(state.clues151)||state.clues151.length!==WHALES.length)
  state.clues151=Array(WHALES.length).fill(0);
 state.clues151=state.clues151.map(n=>clamp(Math.floor(Number(n)||0),0,MAX_CLUE));
 if(!Array.isArray(state.crew))state.crew=[];
 state.crew.forEach(applyCrew);
}
function countTrait(type,id){return state.crew.filter(c=>c.persona151?.[type]===id).length;}
function traceRate(extra){
 const base=BASE_TRACE+(mode()==='defensive'?-0.10:mode()==='seeking'?0.18:0);
 return clamp(base+countTrait('gift',2)*.02-countTrait('flaw',2)*.02+
  state.crew.filter(c=>c.persona151?.temper===5).length*.01+(extra||0),0,.75);
}
function fishRate(){
 return clamp(BASE_CATCH+(mode()==='defensive'?-0.10:mode()==='fishing'?.25:0)+
  countTrait('gift',1)*.02-countTrait('flaw',1)*.02,0,.6);
}
function chooseCalamity(){
 const pool=WHALES.map((_,i)=>i).filter(i=>!hunted(i));
 if(!pool.length)return null;
 const wish=state.traceHunt151?.target;
 if(Number.isInteger(wish)&&pool.includes(wish)&&chance(.45))return wish;
 const hint=state.whaleHint024;
 if(Number.isInteger(hint)&&pool.includes(hint)&&chance(.35))return hint;
 return pick(pool);
}
function addClue(k,why){
 if(k===null||k===undefined||hunted(k))return false;
 ready();
 if(state.clues151[k]>=MAX_CLUE)return false;
 state.clues151[k]++;
 log('재앙의 흔적 발견: '+WHALES[k].name+' · 단서 '+state.clues151[k]+'개. '+(why||''));
 return true;
}
function findClue(extra,why){
 if(!chance(traceRate(extra)))return false;
 return addClue(chooseCalamity(),why);
}
function oneWitness(){return state.crew.length?pick(state.crew):null;}
function worsen(c,amount,reason){
 if(!c||amount<=0)return;
 const before=c.condition;
 c.condition=clamp((Number(c.condition)||0)+amount,0,3);
 if(c.condition>before)log((c.name||ROLE[c.role]?.name||'선원')+'의 상태가 '+CONDITIONS[c.condition]+'(으)로 악화했습니다. '+reason);
}
function heal(c,amount,reason){
 if(!c||amount<=0||c.condition<=0)return;
 c.condition=Math.max(0,c.condition-amount);
 if(reason)log((c.name||ROLE[c.role]?.name||'선원')+'이(가) '+reason+' 상태를 추슬렀습니다.');
}
function fear(type){
 ready();
 const c=oneWitness();
 if(!c)return;
 const p=c.persona151,t=p.temper;
 p.seen[type]=(p.seen[type]||0)+1;
 let gain=1;
 if((t===0&&type==='whale'&&chance(.5))||(t===1&&type==='wave'&&chance(.5))||
    (t===3&&type==='mermaid'&&chance(.5))||(t===6&&p.calmVoyage!==state.voyage)){
  gain=0;
  if(t===6)p.calmVoyage=state.voyage;
 }
 if((t===4&&type==='wave')||(t===5&&type==='whale'))gain++;
 if(t===8&&gain&&chance(.25))gain--;
 if(p.gift===5&&gain&&chance(.20))gain--;
 if(p.flaw===5&&chance(.20))gain++;
 p.stress+=gain;
 const threshold=t===9?4:3;
 if(p.stress>=threshold){
  p.stress-=threshold;
  worsen(c,1,'두려운 장면을 반복해 목격했습니다.');
 }
}
function mindFromOthers(c,reason){
 if(!c?.persona151)return;
 const p=c.persona151;
 p.stress++;
 const threshold=p.temper===9?4:3;
 if(p.stress>=threshold){
  p.stress-=threshold;
  worsen(c,1,reason);
 }
}
function waveCrewDamage(choice){
 const c=oneWitness();
 if(!c||!chance(.32))return;
 const p=c.persona151;
 let steps=1+(mode()==='seeking'?1:mode()==='defensive'?-1:0);
 if(choice==='rush')steps--;
 if(choice==='survey')steps++;
 if(p.gift===4&&chance(.20))steps--;
 if(p.gift===7&&chance(.15))steps--;
 if(p.flaw===4&&chance(.15))steps++;
 if(p.flaw===7&&chance(.15))steps++;
 steps=Math.max(0,steps);
 worsen(c,steps,'파도에 휩쓸렸습니다.');
 if(steps&&state.crew.length>1){
  for(const d of state.crew){
   if(d===c||!d.persona151)continue;
   const t=d.persona151.temper;
   if(t===2&&chance(.12))mindFromOthers(d,'동료의 상처를 지켜보았습니다.');
   if(t===7&&chance(.25))mindFromOthers(d,'동료를 지키지 못했다는 부담이 쌓였습니다.');
  }
 }
}
function exposureStep(){return Math.max(1,Math.ceil(2*.72*Math.sqrt(4/(LAKE_CAP[state.grade]||4))));}
function wavePanel(){
 const w=state.wave151,wave=state.waveHazard028;
 if(!w)return '<div class="inset">파도 상황을 확인할 수 없습니다.</div>';
 return '<section class="inset warning" aria-label="파도 대응">'+
  '<div class="small">파도성 재해 · 위험도 '+w.risk+'단계 · '+MODES[mode()].name+'</div>'+
  '<h2>'+esc(w.name)+'</h2><p>'+esc(w.desc)+'</p>'+
  '<p class="muted">진입할 때 파도가 한 번 발생했습니다. 아래 대응은 호수의 법 판정이나 체류 턴을 늘리지 않습니다.</p>'+
  tag('현재 침식도 '+state.exposure+' / 100')+' '+tag('파도 선체 피해 '+(wave?.hullLoss||0))+
  '<div class="stack" style="margin-top:12px">'+
   button('몸을 낮추고 충격을 견딘다 · 선체 피해 추가 감소','waveAnswer151','brace','primary')+
   button('물살을 가르며 빠르게 돌파한다 · 선체 피해 증가, 선원 피해 감소','waveAnswer151','rush')+
   button('앞쪽의 이상 현상을 살핀다 · 단서 기회 증가, 선원 위험 증가','waveAnswer151','survey')+
  '</div></section>';
}
function finishWave(answer){
 if(state.scene!=='wave151'||!state.wave151)return;
 const w=state.wave151;
 if(answer==='brace'){
  const n=exposureStep();
  state.exposure=Math.max(0,state.exposure-n);
  if(state.waveHazard028)state.waveHazard028.hullLoss=Math.max(0,state.waveHazard028.hullLoss-n);
  log(w.name+': 충격을 분산해 선체 손상을 줄였습니다.');
 }else if(answer==='rush'){
  takeDamage(3,0);
  log(w.name+': 물살을 뚫고 전진했습니다. 선체에 추가 피해가 남았습니다.');
 }else if(answer==='survey'){
  const ok=findClue(.10,'파도 너머를 살피다 발견했습니다.');
  log(w.name+': '+(ok?'특이한 흔적을 확인했습니다.':'위험을 살폈지만 확실한 흔적은 찾지 못했습니다.'));
 }else return;
 waveCrewDamage(answer);
 fear('wave');
 state.scene=w.resume;
 state.wave151=null;
 if(!safeCheck())return;
 sync();
}
function trackingAvailable(k){
 return state.scene==='port'&&!state.sea&&!hunted(k)&&state.grade>=5&&state.crew.length>=3&&
  state.calamityHarpoon&&!state.calamityHarpoon.damaged&&state.gold>=TRACK_FEE&&state.clues151[k]>=3;
}
function trackingPanel(){
 const list=WHALES.map((w,k)=>{
  const n=state.clues151[k],done=hunted(k),can=trackingAvailable(k);
  return '<div class="between" style="gap:8px;flex-wrap:wrap;margin:6px 0">'+
   '<span>'+esc(w.name)+' · 흔적 '+n+' / 3'+(done?' · 토벌 완료':'')+'</span>'+
   button(state.traceTarget151===k?'추적 항해 지정됨':'추적 대상으로 지정','traceSelect151',String(k),
    state.traceTarget151===k?'primary':'',!can)+'</div>';
 }).join('');
 return '<div class="inset"><h3>재앙의 고래 추적</h3>'+
  '<p class="muted">같은 재앙의 흔적 3개 이상과 선장 5등급, 선원 3명, 정비된 특수 작살이 필요합니다. 출항 때 추가 보급비 35만 안을 사용합니다. 추적 대상과 마주칠 확률은 올라가지만 확정되지 않습니다. 실패해도 찾아낸 흔적은 남습니다.</p>'+
  list+'</div>';
}
function modePanel(){
 const selected=mode(),atPort=state.scene==='port'&&!state.sea;
 let h='<section class="inset"><h3>v.'+VERSION+' · 항해 방침</h3>'+
  '<p class="muted">항해 방침은 항구에서 정하고 다음 출항에 적용합니다. 호수의 법과 체류 턴은 변경하지 않습니다.</p>';
 for(const key of Object.keys(MODES)){
  const m=MODES[key];
  h+='<div class="inset" style="margin:7px 0"><b>'+m.name+(key===selected?' · 선택 중':'')+'</b>'+
   '<p class="muted">'+m.detail+'</p>'+
   button(key===selected?'현재 선택한 방침':'이 방침을 선택한다','modeSelect151',key,
    key===selected?'primary':'',!atPort||selected===key)+'</div>';
 }
 return h+'</section>';
}
const NOTES=[
 '출항 전에 방어적·어획적·고래 탐색적 항해 중 하나를 선택하도록 추가했습니다.',
 '파도 10종을 추가하고, 손바닥을 닮은 회오리와 얽히는 너울을 기존 희귀 고래 조우와 연결했습니다.',
 '파도 대응은 별도 장면에서 처리합니다. 호수의 법, 기존 체류 턴과 즉사 판정은 유지합니다.',
 '고급 술집 목격담과 항해 중 흔적으로 재앙을 추적할 수 있습니다. 재앙 추적 출항은 희귀하지만 확정 조우는 아닙니다.',
 '선원 성격 10종과 이득 8종·결점 8종을 추가했습니다. 선원마다 1쌍을 무작위 배정하고 저장합니다.',
 '선원이 기이한 장면을 반복해 목격하면 불안이 쌓이고, 한계에 도달하면 상태가 1단계 악화합니다.'
];
const noteHtml=()=>'<section class="inset"><h3>업데이트 내역 · v.'+VERSION+'</h3><ul>'+NOTES.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul></section>';
const oldFresh=fresh;
fresh=function(){
 const s=oldFresh.apply(this,arguments);
 s.mode151='defensive';s.clues151=Array(WHALES.length).fill(0);
 for(const c of s.crew||[])applyCrew(c);
 return s;
};
const oldRecruit=recruit;
recruit=function(){
 const result=oldRecruit.apply(this,arguments);
 ready();
 return result;
};
const oldPower=crewPower;
crewPower=function(){
 ready();
 return oldPower.apply(this,arguments)+countTrait('gift',0)*2-countTrait('flaw',0)*2;
};
const oldPrepare=prepareVoyage;
prepareVoyage=function(){
 ready();
 return oldPrepare.apply(this,arguments);
};
const oldLaunch=launch;
launch=function(){
 ready();
 const wish=state.traceTarget151;
 const allowed=Number.isInteger(wish)&&trackingAvailableBeforeLaunch(wish)&&!state.crossing039;
 const result=oldLaunch.apply(this,arguments);
 if(state.sea){
  state.modeAtDeparture151=mode();
  if(allowed){
   state.gold-=TRACK_FEE;
   state.traceHunt151={target:wish,lake:pick(state.offered),attempted:false,encountered:false};
   state.traceTarget151=null;
   log('재앙 추적 항해를 시작합니다. '+WHALES[wish].name+'의 흔적을 뒤쫓습니다. 추가 보급비 35만 안 지불.');
  }else state.traceHunt151=null;
  sync();
 }
 return result;
};
function trackingAvailableBeforeLaunch(k){
 return state.scene==='prep'&&!state.sea&&!hunted(k)&&state.grade>=5&&state.crew.length>=3&&
 state.calamityHarpoon&&!state.calamityHarpoon.damaged&&state.gold>=TRACK_FEE&&state.clues151[k]>=3;
}
const oldBuyRumor=buyRumor;
buyRumor=function(){
 const prior=state.whaleHint024;
 const before=state.count?.rumors||0;
 const result=oldBuyRumor.apply(this,arguments);
 if((state.count?.rumors||0)>before&&state.whaleHint024!==prior&&Number.isInteger(state.whaleHint024)){
  if(addClue(state.whaleHint024,'항구에서 들은 목격담입니다.'))sync();
 }
 return result;
};
const oldEnter=enterNextLake0131;
enterNextLake0131=function(id){
 ready();
 const ref=state,l=LAKE_BY_ID157.get(id),risk=clamp(Number(l?.risk)||1,1,4);
 const originalDamage=takeDamage;
 // 기존 파도 판정의 피해 수치만 1단계 낮춰 안전 여부를 판정하기 전부터 적용합니다.
 if(mode()==='defensive'){
  takeDamage=function(h,m){
   if(state===ref&&state.sea&&state.current===id&&state.waveHazard028===null&&
      h===2+2*risk&&m===1+risk)return originalDamage.call(this,Math.max(0,h-2),m);
   return originalDamage.apply(this,arguments);
  };
 }
 let out;
 try{out=oldEnter.apply(this,arguments);}finally{takeDamage=originalDamage;}
 if(state!==ref||state.scene==='dead'||state.current!==id)return out;
 if(mode()==='seeking'&&!state.normalMermaidDraw&&chance(1/9))state.normalMermaidDraw=true; // 10% → 20%
 const track=state.traceHunt151;
 if(track&&!track.attempted&&track.lake===id&&!ref.crossing039){
  track.attempted=true;
  if(!ref.encounter&&ref.scene==='event'&&!hunted(track.target)&&chance(TRACK_CHANCE)){
   ref.encounter=track.target;
   ref.scene='encounter';
   if(!Array.isArray(ref.whaleSeen))ref.whaleSeen=[];
   if(!ref.whaleSeen.includes(track.target))ref.whaleSeen.push(track.target);
   applyWhale(track.target);
   track.encountered=true;
   log('추적해 온 물길에서 '+WHALES[track.target].name+'와 마주쳤습니다.');
   if(!safeCheck())return out;
  }else log('재앙의 흔적을 쫓아왔으나 모습을 찾지 못했습니다.');
 }
 const wave=state.waveHazard028;
 if(wave&&wave.lake===id){
  let w=pick(WAVES);
  if(state.rareWhale024?.id==='hole')w=WAVES[1];
  else if(state.rareWhale024?.id==='stem')w=WAVES[2];
  // 기존 희귀 고래를 가리지 않는 범위에서 파도의 특징에 맞게 추가 조우합니다.
  if(w.type&&!state.rareWhale024&&!state.encounter&&state.scene==='event'&&chance(.22)){
   state.rareWhale024={id:w.type,lake:id};
   state.scene='rareWhale';
  }
  // 선원 성격으로 인한 소량의 파도 선체 피해 보정.
  if(countTrait('gift',3)&&chance(1-Math.pow(.88,countTrait('gift',3))))
   ref.exposure=Math.max(0,ref.exposure-1);
  if(countTrait('flaw',3)&&chance(1-Math.pow(.88,countTrait('flaw',3))))
   ref.exposure=clamp(ref.exposure+1,0,100);
  wave.name151=w.name;
  wave.description151=w.desc;
  const resume=state.scene;
  state.wave151={name:w.name,desc:w.desc,risk,waveType:w.type,resume};
  state.scene='wave151';
  sync();
  return out;
 }
 // 파도가 없어도 일반 고래와 인어의 목격은 선원의 불안 누적을 유발할 수 있습니다.
 if(state.scene==='rareWhale')fear('whale');
 return out;
};
const oldWhaleEffect151=applyWhale;
applyWhale=function(k){
 const crewBefore=new Map((state.crew||[]).map(c=>[c.id,Number(c.condition)||0]));
 const result=oldWhaleEffect151.apply(this,arguments);
 if(mode()==='seeking'){
  for(const c of state.crew||[]){
   const previous=crewBefore.get(c.id);
   if(previous!==undefined&&c.condition>previous)worsen(c,1,'고래 탐색적 항해의 위험이 더해졌습니다.');
  }
 }
 return result;
};
const oldBegin=beginBattle;
beginBattle=function(b){
 if(b?.type==='normal'||b?.type==='special')fear('mermaid');
 else if(b?.type==='rare'||b?.type==='whale')fear('whale');
 return oldBegin.apply(this,arguments);
};
const oldComplete=completeLake;
completeLake=function(success,msg){
 ready();
 const ref=state,id=state.current,was=!!(success&&id!=null&&state.sea);
 if(was&&mode()==='fishing'){
  takeDamage(10,0);
  log(LABEL(id)+' 통과 중 어획 장비가 선체에 부담을 주었습니다. 선체 피해 10.');
  if(!safeCheck())return;
 }
 const oldCount=Number(ref.count?.lake)||0;
 const out=oldComplete.apply(this,arguments);
 if(state!==ref||state.scene==='dead'||!was||Number(ref.count?.lake)<=oldCount)return out;
 const fish=window.GREAT_LAKE_FISH_MARKET_034;
 if(fish&&chance(fishRate()))fish.rememberFish(fish.pickFish(),true,'항해 방침 추가 어획');
 findClue(0,LABEL(id)+'을 지나며 확인했습니다.');
 for(const c of state.crew){
  const p=c.persona151;if(!p)continue;
  if(p.gift===6&&chance(.05))heal(c,1,'휴식 없이도');
  if(p.flaw===6&&chance(.05))worsen(c,1,'쉽게 피로해집니다.');
 }
 sync();
 return out;
};
const oldResolve=resolveCoin;
resolveCoin=function(win){
 const ref=state,b=ref.battle,rare=b?.type==='rare'&&win&&b.won+1>=b.need;
 const result=oldResolve.apply(this,arguments);
 if(rare&&ref===state&&state.scene!=='battle'&&state.scene!=='dead'&&mode()==='seeking'&&chance(.10)){
  const loot=window.RareWhales024?.[b.rare]?.loot;
  if(loot){
   if(!Array.isArray(state.rareLoot024))state.rareLoot024=[];
   state.rareLoot024.push(loot);
   log('고래 탐색적 항해 보너스: '+loot+'을(를) 추가로 획득했습니다.');
   sync();
  }
 }
 return result;
};
const oldReturn=returnPort;
returnPort=function(){
 const oldSea=state.sea;
 const result=oldReturn.apply(this,arguments);
 if(oldSea&&!state.sea){state.traceHunt151=null;state.wave151=null;sync();}
 return result;
};
const oldRenderPlay=renderPlay;
renderPlay=function(){
 ready();
 if(state.scene==='wave151')return wavePanel();
 const h=oldRenderPlay.apply(this,arguments);
 if(state.scene==='start')return h+noteHtml();
 if(state.scene==='port'&&!state.sea)return modePanel()+trackingPanel()+h;
 if(state.scene==='prep'||state.sea){
  const t=state.traceHunt151;
  const extra=t&&state.sea?' · 재앙 추적 중: '+esc(WHALES[t.target].name):'';
  return '<div class="inset"><b>항해 방침: '+MODES[mode()].name+'</b>'+extra+
   '<p class="muted">'+MODES[mode()].detail+'</p></div>'+h;
 }
 return h;
};
const oldRenderCrew=renderCrew;
renderCrew=function(){
 ready();
 const h=oldRenderCrew.apply(this,arguments);
 if(!state.crew.length)return h;
 const cards=state.crew.map(c=>{
  const p=c.persona151,t=TEMPER[p.temper],g=GIFTS[p.gift],f=FLAWS[p.flaw];
  return '<div class="inset"><b>'+esc(c.name||ROLE[c.role]?.name||'선원')+' · '+t[0]+'</b>'+
   '<p class="muted">'+t[1]+'</p>'+
   '<p>이득: '+g[0]+' · '+g[1]+'</p>'+
   '<p>결점: '+f[0]+' · '+f[1]+'</p>'+
   '<p class="small muted">상태 '+CONDITIONS[c.condition]+' · 불안 '+p.stress+' / '+(p.temper===9?4:3)+
   ' · 목격: 파도 '+(p.seen.wave||0)+' / 인어 '+(p.seen.mermaid||0)+' / 고래 '+(p.seen.whale||0)+'</p></div>';
 }).join('');
 return h+'<section class="inset"><h3>선원의 성격과 이득·결점</h3>'+
  '<p class="muted">성격 10종 가운데 하나, 이득 8종과 결점 8종에서 각각 하나씩 무작위로 정해집니다. 같은 선원의 성격과 특성은 바뀌지 않습니다. 파도·인어·고래를 목격한 불안이 쌓이면 상태가 악화할 수 있습니다.</p>'+cards+'</section>';
};
const oldHelp=renderHelp;
renderHelp=function(){
 const all=oldHelp.apply(this,arguments);
 return all+noteHtml()+
  '<div class="inset"><h3>v.1.5.1 · 항해 방침과 선원의 불안</h3>'+
  '<p>방어적 항해에서는 파도 선체 피해의 한 단계를 2 피해로 계산하며, 파도에 의한 선원 상태 악화도 1단계 줄입니다. 어획적 항해에서는 호수 정상 통과마다 선체 피해 10을 기존 침식도 공식에 적용합니다. 고래 탐색적 항해는 기존 인어 조우 10%를 20%로 높이고, 재앙 흔적 발견의 기본 확률을 12%에서 30%로 높입니다.</p>'+
  '<p>추가 어획 기본 확률은 10%이며 방어적 0%, 어획적 35%, 탐색적 10%입니다(선원 특성에 따라 소폭 변동). 재앙 흔적 기본 확률은 통과당 12%이며 방어적 2%, 탐색적 30%입니다. 특정 재앙의 흔적 3개를 모으면 5등급부터 추적 항해를 준비할 수 있고, 지정된 호수에서 18% 확률로 해당 재앙을 조우할 기회를 얻습니다. 그 호수가 실제로 어느 곳인지는 미리 알 수 없습니다.</p>'+
  '<p>선원 상태는 좋음·보통·나쁨·최악 4단계입니다. 파도에서 선원 한 명이 직접 피해를 입을 기본 확률은 32%이며 방어적 항해는 피해 1단계를 경감하고 고래 탐색적 항해는 1단계를 추가합니다. 목격 상황은 파도·인어·고래로 구별하며, 불안이 3에 도달하면 상태가 1단계 악화합니다(차분한 성격은 4). 이 판정은 호수의 법과 체류 턴을 변경하지 않습니다.</p>'+
  '<details><summary>성격 10종 · 이득 8종 · 결점 8종</summary>'+
  '<p><b>성격</b>: '+TEMPER.map(x=>x[0]).join(' · ')+'</p>'+
  '<p><b>이득</b>: '+GIFTS.map(x=>x[0]+' ('+x[1]+')').join(' / ')+'</p>'+
  '<p><b>결점</b>: '+FLAWS.map(x=>x[0]+' ('+x[1]+')').join(' / ')+'</p></details></div>';
};
document.addEventListener('click',function(e){
 const b=e.target?.closest?.('button[data-act]');
 if(!b||b.disabled||busy)return;
 const act=b.dataset.act;
 if(act==='modeSelect151'&&state.scene==='port'&&!state.sea&&MODES[b.dataset.value]){
  state.mode151=b.dataset.value;log('다음 항해 방침을 '+MODES[mode()].name+'(으)로 정했습니다.');sync();
 }else if(act==='traceSelect151'&&state.scene==='port'){
  const k=Number(b.dataset.value);
  if(trackingAvailable(k)){state.traceTarget151=k;log(WHALES[k].name+' 추적 출항을 준비합니다.');sync();}
 }else if(act==='waveAnswer151'){
  finishWave(b.dataset.value);
 }
});
ready();save();render();
window.GREAT_LAKE_151={version:VERSION,modes:MODES,temper:TEMPER,gifts:GIFTS,flaws:FLAWS,waves:WAVES,
 traceRate,fishRate,ready,finishWave,trackingAvailable};
})();