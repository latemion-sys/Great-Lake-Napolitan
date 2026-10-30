/* 대호수 · 선장의 정신력 · E.G.O · 신과 망 · 재앙의 고래 사냥 조건
   [선장 정신력] 0~100. 선원의 '정신 상태'와는 따로 선장 한 사람의 정신.
     - 인어를 조우하면 -5 (특이한 인어 · 고래 속 인어 -10), 선원이 인어가 되면 한 명당 -10.
     - 망을 두르거나 신과 망을 수련할 때도 선장 자신의 정신력을 쓴다.
     - 항구 상점 'M사 특제 월광석': 한 개 15만 안, 정신력 +15, 항구에 들를 때마다 최대 5개(최대 75만 안).
   [정신력 0 판정] 동전 판정. 뒤틀리면 그대로 엔딩, E.G.O를 개화하면 이름을 새긴다(비우면 '개화 E.G.O').
     - 이미 개화한 선장이 다시 0이 되면, E.G.O가 붙잡아 주면 버티고 아니면 뒤틀린다.
     - 재앙 사냥 도중에 0이 되면 사냥 단계가 끝난 뒤 판정한다.
   [신과 망] E.G.O를 개화한 뒤에만 항구 상점에서 수련을 시도할 수 있다. 신을 먼저 열고 망을 하나씩 연다.
     신 5 · 60% / 망1 10 · 50% / 망2 20 · 40% / 망3 40 · 30% / 망4 60 · 30% / 망5 80 · 30% (선장 정신력 소모, 실패해도 소모)
   [망 두르기] 선장 정신력 망1 5 · 망2 10 · 망3 25 · 망4 40 · 망5 50
     - 동전 앞면 확률 +3 · 6 · 9 · 12 · 15%p (인어 전투는 1개부터 두를 수 있음, 재앙 사냥의 동전 판정에도 적용)
     - 받는 피해: 4망 -15% · 5망 -30%
     - 재앙의 고래(창백한 · 푸른 · 붉은): 특수 작살 + 망 3개 이상이어야 사냥 선택 가능. 미니게임 판정 자체는 바꾸지 않는다.
   [특수 작살] 선장 5등급부터 300. 사냥 한 번에 손상, 정비 150. */
(function(){
'use strict';
if(typeof renderPlay!=='function'||typeof huntWhale!=='function'||typeof renderShop132!=='function'||typeof beginBattle!=='function')return;
const WHALES_OK=new Set([0,1,2]);
const HARPOON={name:'재앙 사냥용 특수 작살',cost:300,grade:5};
const RING_COST=[0,5,10,25,40,50];   // 두른 망 개수별 선장 정신력
const SHIN_TRY={cost:5,p:.6};
const MANG_TRY=[{cost:10,p:.5},{cost:20,p:.4},{cost:40,p:.3},{cost:60,p:.3},{cost:80,p:.3}];
const MIN_RINGS=3,MAX_RINGS=5;
const MERMAID_HIT={normal:5,special:10,blueMermaid:10,pallidMermaid161:10};
const MERMAID_BONUS=[0,.03,.06,.09,.12,.15];
const CREW_MERMAID_HIT=10;
const REST={gain:15,max:5,cost:15,name:'M사 특제 월광석'};
const BLOOM_P=.5,HOLD_P=.75,AFTER_MIND=30;
const EGO_DEFAULT='개화 E.G.O';
const ringCost=n=>RING_COST[Math.max(0,Math.min(5,n|0))];

/* ---------- 상태 ---------- */
function cm(){const v=state.captainMind;return v==null||isNaN(v)?100:Math.max(0,Math.min(100,Math.round(v)));}
function shin(){return state.shinOpen?Math.max(0,Math.min(MAX_RINGS,state.shinLevel|0)):0;}
function harp(){return state.calamityHarpoon||null;}
function rings(){return Math.max(0,state.mangActive|0);}
function judging(){return !!state.mindJudge;}
function migrate(){
 if(typeof state!=='object'||!state)return;
 if(state.captainMind==null)state.captainMind=100;
 if(!state.shinOpen)state.shinLevel=0;          // 예전 방식(돈 · 통과 횟수) 수련 기록은 E.G.O 없이 인정하지 않음
 if(state.shinOpen&&!state.egoBloomed){state.shinOpen=false;state.shinLevel=0;}
}
migrate();

/* ---------- 지금 재앙 사냥 중인가 ---------- */
const HUNT_BATTLES=new Set(['blueMermaid','pallidShell161','pallidLure161','pallidMermaid161','pallidCore161']);
function inCalamity(){
 const b=state.battle;
 if(state.scene==='battle'&&b&&((b.type==='whale'&&WHALES_OK.has(b.index))||HUNT_BATTLES.has(b.type)))return true;
 if(state.scene==='blueHunt'||(typeof PALLID_SCENE_161!=='undefined'&&state.scene===PALLID_SCENE_161))return true;
 if(state.blueWhaleFinalStage||state.redWhaleFinal023)return true;
 return false;
}
function mermaidBattle(){const b=state.battle;return state.scene==='battle'&&b&&MERMAID_HIT[b.type]!=null;}
function plainMermaid(){const b=state.battle;return state.scene==='battle'&&b&&(b.type==='normal'||b.type==='special');}

/* ---------- 선장 정신력 ---------- */
function hurt(n,why){
 if(!(n>0)||state.scene==='dead')return;
 migrate();
 const before=cm();if(before<=0&&judging())return;
 state.captainMind=Math.max(0,before-n);
 log((why?why+' ':'')+'선장의 정신력 -'+(before-state.captainMind)+' ('+state.captainMind+' / 100)');
 if(state.captainMind<=0&&!judging()){
  state.mindJudge={stage:'pending',draft:''};
  log('선장의 정신력이 바닥났습니다. 마음속에서 무언가가 형체를 얻으려 합니다.');
  if(!inCalamity())tab='play';
 }
}
function heal(n){state.captainMind=Math.min(100,cm()+n);}

/* 인어 조우 */
const prevBegin=beginBattle;
beginBattle=function(b){
 if(window.GREAT_LAKE_FX)window.GREAT_LAKE_FX.shotAt=null;   // 새 전투: 아직 쏘지 않음
 const out=prevBegin.apply(this,arguments);
 if(b&&MERMAID_HIT[b.type]!=null){hurt(MERMAID_HIT[b.type],'인어와 마주쳤습니다.');sync();}
 return out;
};
/* 선원이 인어가 됨 */
let ruleWatch=false;
const prevLog=log;
log=function(msg){
 const out=prevLog.apply(this,arguments);
 if(!ruleWatch&&typeof msg==='string'){
  const n=(msg.match(/인어로 변(?:이해|했)/g)||[]).length;
  if(n)hurt(n*CREW_MERMAID_HIT,'선원이 인어가 되는 것을 지켜보았습니다.');
 }
 return out;
};
if(typeof chooseRule==='function'){
 const prevRule=chooseRule;
 chooseRule=function(){
  const before=(String(state.ruleResult||'').match(/인어로 변했습니다/g)||[]).length;
  ruleWatch=true;
  let out;try{out=prevRule.apply(this,arguments);}finally{ruleWatch=false;}
  const after=(String(state.ruleResult||'').match(/인어로 변했습니다/g)||[]).length;
  if(after>before){hurt((after-before)*CREW_MERMAID_HIT,'선원이 인어가 되는 것을 지켜보았습니다.');sync();}
  return out;
 };
}

/* ---------- 다른 스크립트가 읽는 이점 ---------- */
const API=window.CalamityMang={
 rings,
 ease(){return 1;},        // 미니게임 판정은 망과 무관
 extraLife(){return 0;},
 guard(){const r=rings();return r>=5?.3:r>=4?.15:0;},
 captainMind:cm,hurt,ringCost,MAX_RINGS,MIN_RINGS
};

/* ---------- 정신력 0 판정 ---------- */
function judgePanel(){
 const j=state.mindJudge,bloomed=!!state.egoBloomed;
 const head='<div class="inset warning"><div class="small">선장의 정신력 0 · 판정</div>';
 if(j.stage==='twist')return head+'<h2>뒤틀림</h2><p>버티던 것이 끊어졌습니다. 가장 오래 붙들고 있던 감정이 살갗을 찢고 형체를 얻습니다. 선원들이 선장이었던 것을 올려다봅니다.</p>'+
  '<div class="stack">'+button('뒤틀림을 받아들인다','mindTwistEnd','','danger')+'</div></div>';
 if(j.stage==='bloom')return head+'<h2>E.G.O 개화</h2><p>무너지는 대신, 바닥에 닿은 마음이 그대로 몸 밖으로 피어났습니다. 그것은 무기이자 옷이며, 지금까지의 자신을 증명하는 형태입니다. 선장의 정신력이 '+AFTER_MIND+'까지 돌아옵니다.</p>'+
  '<p>피어난 E.G.O에 이름을 새기십시오. 비워 두면 \''+EGO_DEFAULT+'\'로 남습니다.</p>'+
  '<p><input id="egoNameInput" maxlength="24" placeholder="'+EGO_DEFAULT+'" value="'+esc(j.draft||'')+'" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:10px;border:1px solid #4f6378;background:#0f161e;color:#e8edf3;font:inherit"></p>'+
  '<div class="stack">'+button('이 이름을 새긴다','egoNameSet','','primary')+'</div>'+
  '<p class="small muted">이제부터 항구 상점에서 신과 망 수련을 시도할 수 있습니다.</p></div>';
 if(j.stage==='hold')return head+'<h2>'+esc(state.egoName||EGO_DEFAULT)+'</h2><p>무너지기 직전, 한 번 피어났던 E.G.O가 다시 선장을 붙잡았습니다. 숨이 돌아옵니다. 선장의 정신력이 '+AFTER_MIND+'까지 돌아옵니다.</p>'+
  '<div class="stack">'+button('다시 일어선다','mindHoldGo','','primary')+'</div></div>';
 const p=bloomed?HOLD_P:BLOOM_P;
 return head+'<h2>'+(bloomed?'E.G.O가 붙잡을 것인가':'뒤틀릴 것인가, 개화할 것인가')+'</h2>'+
  '<p>'+(bloomed?'정신력이 다시 바닥났습니다. 피어난 E.G.O가 선장을 붙잡아 줄지, 이번에는 뒤틀릴지 판정합니다.'
   :'정신력이 바닥났습니다. 마음속에 가장 무겁게 남은 것이 지금 형체를 얻으려 합니다. 그것이 선장을 집어삼키면 뒤틀리고, 선장이 그것을 끌어안으면 E.G.O가 피어납니다.')+'</p>'+
  '<div class="coinpanel"><div class="small">앞면: '+(bloomed?'E.G.O가 붙잡는다':'E.G.O 개화')+' · 뒷면: 뒤틀림 (앞면 '+Math.round(p*100)+'%)</div>'+
  '<div class="coinstage"><div class="coin" id="mindCoin"><div class="face">앞면</div><div class="face back">뒷면</div></div></div>'+
  '<p id="mindCoinText">동전을 던져 판정하십시오. 뒤틀리면 항해는 그대로 끝납니다.</p>'+
  button('동전 던지기','mindJudgeFlip','','primary')+'</div></div>';
}
let twistDeath=false;
document.addEventListener('input',function(e){
 if(e.target&&e.target.id==='egoNameInput'&&state.mindJudge)state.mindJudge.draft=e.target.value;
});
document.addEventListener('click',function(e){
 const b=e.target&&e.target.closest&&e.target.closest('button[data-act="mindJudgeFlip"],button[data-act="mindTwistEnd"],button[data-act="egoNameSet"],button[data-act="mindHoldGo"]');
 if(!b||b.disabled||busy||!state.mindJudge)return;
 const act=b.dataset.act,j=state.mindJudge;
 if(act==='mindJudgeFlip'&&j.stage==='pending'){
  const bloomed=!!state.egoBloomed,win=Math.random()<(bloomed?HOLD_P:BLOOM_P);
  const coin=document.getElementById('mindCoin'),txt=document.getElementById('mindCoinText');
  busy=true;b.disabled=true;
  if(coin){coin.style.setProperty('--landing',win?'1080deg':'1260deg');coin.classList.remove('flipping');void coin.offsetWidth;coin.classList.add('flipping');}
  if(txt)txt.textContent='동전이 떠오릅니다…';
  setTimeout(function(){
   busy=false;if(state.mindJudge!==j)return;
   j.stage=win?(bloomed?'hold':'bloom'):'twist';
   log(win?(bloomed?'E.G.O가 무너지던 선장을 붙잡았습니다.':'선장의 E.G.O가 개화했습니다.'):'선장이 뒤틀렸습니다.');
   sync();
  },2000);
 }else if(act==='mindTwistEnd'&&j.stage==='twist'){
  twistDeath=true;state.mindJudge=null;die();
 }else if(act==='egoNameSet'&&j.stage==='bloom'){
  const inp=document.getElementById('egoNameInput');
  const name=String((inp?inp.value:j.draft)||'').replace(/\s+/g,' ').trim().slice(0,24)||EGO_DEFAULT;
  state.egoBloomed=true;state.egoName=name;state.captainMind=AFTER_MIND;state.mindJudge=null;
  log('E.G.O \''+name+'\'. 선장의 정신력이 '+AFTER_MIND+'까지 돌아왔습니다. 이제 신과 망을 수련할 수 있습니다.');
  sync();
 }else if(act==='mindHoldGo'&&j.stage==='hold'){
  state.captainMind=AFTER_MIND;state.mindJudge=null;
  log('E.G.O \''+(state.egoName||EGO_DEFAULT)+'\'가 선장을 붙잡았습니다. 선장의 정신력이 '+AFTER_MIND+'까지 돌아왔습니다.');
  sync();
 }
},true);

/* 뒤틀림 엔딩 */
const prevDie=die;
die=function(){
 const tw=twistDeath;twistDeath=false;
 const captain=String(state.captainName||state.playerName||'선장').trim()||'선장';
 const lake=Number.isInteger(state.current)?'21-'+String(state.current).padStart(2,'0'):'대호수';
 if(tw)state.deathCause155={kind:'distortion'};
 const out=prevDie.apply(this,arguments);
 if(tw){
  const who=typeof captainGroup155==='function'?captainGroup155(captain):captain+'와(과) 그 선원들은';
  state.deathType155='distortion';
  state.storyDeath=lake+'-뒤틀림. 선장의 정신이 바닥난 자리에서 가장 무거웠던 감정이 형체를 얻었다. '+who+
   ' 그날 이후 뱃사람이 아니라, 대호수를 떠도는 또 하나의 괴담이 되었다.';
  save();render();
 }
 return out;
};

/* ---------- 재앙 사냥 조건 ---------- */
function missing(){
 const m=[];
 if(state.grade<HARPOON.grade)m.push('선장 '+HARPOON.grade+'등급');
 const h=harp();
 if(!h)m.push(HARPOON.name);else if(h.damaged)m.push('특수 작살 정비');
 if(!state.egoBloomed)m.push('E.G.O 개화(선장 정신력 0 판정)');
 else if(!state.shinOpen)m.push('신 개방');
 else if(shin()<MIN_RINGS)m.push('망 '+MIN_RINGS+'개 개방(현재 '+shin()+'개)');
 else if(cm()<=ringCost(MIN_RINGS))m.push('망 '+MIN_RINGS+'개를 두를 선장 정신력('+(ringCost(MIN_RINGS)+1)+' 이상)');
 return m;
}
function ringButtons(act,from,perkOf){
 let h='';const top=shin(),mind=cm();
 for(let n=from;n<=MAX_RINGS;n++){
  const c=ringCost(n),can=n<=top&&mind>c;
  h+=button('망 '+n+'개를 두른다 · 선장 정신력 -'+c+perkOf(n)+(n>top?' (미개방)':mind<=c?' (정신력 부족)':''),act,String(n),n===from&&act==='mangHunt'?'danger':'',!can);
 }
 return h;
}
function huntBlock(){
 const m=missing();
 let h='<div class="inset" style="margin-top:12px"><div class="small">재앙 사냥 조건 · 특수 작살과 신과 망</div>';
 if(m.length){
  h+='<p style="color:#ffb3a8">사냥할 수 없습니다. 부족한 것: '+m.map(esc).join(' · ')+'</p>'+
   '<p class="muted">재앙의 고래는 특수 작살에 신을 실어, 망을 '+MIN_RINGS+'개 이상 두른 손으로만 꿰뚫을 수 있습니다. 신과 망은 E.G.O를 개화한 선장만이 수련할 수 있습니다.</p>'+
   button('재앙의 고래를 사냥한다 (조건 부족)','mangHunt','0','danger',true);
 }else{
  h+='<p>신을 끌어올려 특수 작살에 망을 몇 개 두를지 고르십시오. 고리가 하나 늘 때마다 정신적 부담이 거의 두 배가 됩니다. 4개부터는 받는 피해가 줄어듭니다.</p><p>'+
   tag('선장 정신력 '+cm()+' / 100')+' '+tag('개방한 망 '+shin()+' / '+MAX_RINGS)+'</p><div class="stack">'+
   ringButtons('mangHunt',MIN_RINGS,n=>' · 동전 +'+Math.round(MERMAID_BONUS[n]*100)+'%p'+(n===4?' · 피해 -15%':n===5?' · 피해 -30%':''))+'</div>';
 }
 return h+'</div>';
}
function mermaidBlock(){
 const b=state.battle;
 if(b.mang)return '<p>'+tag('망 '+b.mang+'개를 두름 · 앞면 확률 +'+Math.round(MERMAID_BONUS[b.mang]*100)+'%p'+(b.mang>=4?' · 받는 피해 -'+(b.mang>=5?30:15)+'%':''))+'</p>';
 if(!shin()||b.history.length)return '';
 return '<div class="inset" style="margin:10px 0"><div class="small">신과 망 · '+esc(state.egoName||EGO_DEFAULT)+'</div>'+
  '<p class="small muted">동전을 던지기 전에 망을 두를 수 있습니다. 두르지 않으려면 그대로 동전을 던지십시오. (선장 정신력 '+cm()+' / 100)</p><div class="stack">'+
  ringButtons('mangMermaid',1,n=>' · 앞면 +'+Math.round(MERMAID_BONUS[n]*100)+'%p'+(n>=4?' · 피해 -'+(n>=5?30:15)+'%':''))+'</div></div>';
}

/* ---------- 화면 ---------- */
const prevPlay=renderPlay;
renderPlay=function(){
 migrate();
 if(rings()&&!inCalamity()&&!(state.scene==='encounter'&&WHALES_OK.has(state.encounter))&&!(state.scene==='battle'&&state.battle&&state.battle.mang))state.mangActive=0;
 if(state.scene==='dead'&&state.deathType155==='distortion'){
  return '<div class="inset warning"><div class="small">항해 종료</div><h2>뒤틀린 선장</h2><p>'+esc(state.storyDeath||'')+'</p>'+
   '<p class="muted">선장 등급과 선원, 자금과 항해 진행은 초기화되었습니다. 이미 달성한 업적은 유지됩니다.</p>'+
   button('다시 항구로','restart','','primary')+'</div>';
 }
 if(judging()&&state.scene!=='dead'&&!inCalamity())return judgePanel();
 const html=prevPlay();
 if(state.scene==='encounter'&&WHALES_OK.has(state.encounter)&&/data-act="huntWhale"/.test(html)){
  return html.replace(/<button[^>]*data-act="huntWhale"[^>]*>[^<]*<\/button>/,'')+huntBlock();
 }
 if(plainMermaid()&&!inCalamity()){
  const blk=mermaidBlock(),FX=window.GREAT_LAKE_FX,sea=FX&&typeof FX.battlePanel==='function'?FX.battlePanel():'';
  let out=html;
  if(sea&&out.indexOf('</h2>')>=0)out=out.replace('</h2>','</h2>'+sea);
  if(blk&&out.indexOf('<div class="coinpanel"')>=0)return out.replace('<div class="coinpanel"',blk+'<div class="coinpanel"');
  return out+blk;
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
 const b=e.target&&e.target.closest&&e.target.closest('button[data-act="mangHunt"],button[data-act="mangMermaid"]');
 if(!b||b.disabled||busy||judging())return;
 const n=Number(b.dataset.value)|0,c=ringCost(n);
 if(b.dataset.act==='mangHunt'){
  if(!(state.scene==='encounter'&&WHALES_OK.has(state.encounter)))return;
  if(missing().length||n<MIN_RINGS||n>shin()||cm()<=c)return;
  const k=state.encounter;
  state.captainMind=cm()-c;
  state.mangActive=n;
  state.calamityHarpoon.damaged=true;
  log('신을 끌어올립니다. 특수 작살에 망 '+n+'개가 감깁니다. 선장 정신력 -'+c+' ('+state.captainMind+' / 100).'+(n>=4?' 고리가 겹칠수록 작살 끝이 고래의 살을 먼저 알아봅니다.':''));
  go=true;try{huntWhale();}finally{go=false;}
  if(state.scene==='encounter'&&state.encounter===k)sync();
 }else{
  const bt=state.battle;
  if(!plainMermaid()||inCalamity()||bt.mang||bt.history.length||n<1||n>shin()||cm()<=c)return;
  state.captainMind=cm()-c;bt.mang=n;state.mangActive=n;
  log('신을 끌어올려 공격에 망 '+n+'개를 두릅니다. 선장 정신력 -'+c+' ('+state.captainMind+' / 100).');
  sync();
 }
},true);

/* 망을 두른 동안: 동전 앞면 확률 증가 (인어 전투 · 재앙 사냥의 동전 판정) */
if(typeof combatChance==='function'){
 const prevChance=combatChance;
 combatChance=function(){
  const base=prevChance.apply(this,arguments),r=rings();
  if(r&&state.scene==='battle'&&state.battle)return Math.max(.025,Math.min(.975,base+MERMAID_BONUS[Math.min(5,r)]));
  return base;
 };
}
/* 4망부터: 받는 피해 감소 */
const prevDamage=takeDamage;
takeDamage=function(h,m){
 const g=(inCalamity()||(state.scene==='battle'&&state.battle&&state.battle.mang))?API.guard():0;
 if(g>0){h=h>0?Math.max(1,Math.round(h*(1-g))):h;m=m>0?Math.max(1,Math.round(m*(1-g))):m;}
 return prevDamage(h,m);
};

/* 창백한 고래 사냥 화면에도 두른 망 표시 */
if(typeof pallidStatus161==='function'){
 const prevPS=pallidStatus161;
 pallidStatus161=function(){
  const r=rings();
  return prevPS.apply(this,arguments)+(r?' '+tag('망 '+r+'개'+' · 동전 +'+Math.round(MERMAID_BONUS[Math.min(5,r)]*100)+'%p'+(r>=5?' · 피해 -30%':r>=4?' · 피해 -15%':'')):'');
 };
}

/* ---------- 옆 패널: 선장 정신력 ---------- */
const prevSide=renderSide;
renderSide=function(){
 prevSide.apply(this,arguments);
 const el=document.getElementById('meters');if(!el)return;
 const v=cm(),bits=[];
 bits.push(state.egoBloomed?'E.G.O · '+(state.egoName||EGO_DEFAULT):'E.G.O 미개화');
 if(state.egoBloomed)bits.push(state.shinOpen?'신 개방 · 망 '+shin()+' / '+MAX_RINGS:'신 미개방');
 if(rings())bits.push('지금 두른 망 '+rings()+'개');
 if(judging())bits.push('판정 대기');
 el.insertAdjacentHTML('beforeend','<div class="barline"><span>선장 정신력</span><span>'+v+' / 100</span></div><div class="meter '+(v<=30?'alert':'')+'"><span style="width:'+v+'%"></span></div>'+
  '<div class="small muted" style="margin:2px 0 8px">'+bits.map(esc).join(' · ')+'</div>');
};

/* ---------- 항구: M사 특제 월광석 · 특수 작살 · 신과 망 수련 ---------- */
function rests(){const r=state.captainRest;return r&&r.v===state.voyage?r.n|0:0;}
function nextStep(){
 if(!state.shinOpen)return {label:'신 개방',cost:SHIN_TRY.cost,p:SHIN_TRY.p};
 const lv=shin();if(lv>=MAX_RINGS)return null;
 return {label:'망 '+(lv+1)+'개 개방',cost:MANG_TRY[lv].cost,p:MANG_TRY[lv].p};
}
const prevShop=renderShop132;
renderShop132=function(){
 migrate();
 const out=prevShop(),avail=inShop132()&&!judging(),h=harp(),v=cm(),rn=rests();
 let s='<div class="inset"><h3>'+REST.name+'</h3>'+
  '<p>13구의 날개 <b>M사</b>가 파는 특이점 제품. 매끈하게 빛나는 이 돌을 몸에 지니면 정신이 한 가지에 모여 잡생각이 걷히고, 바깥에서 파고드는 정신 공격을 버텨 낼 수 있다. 공격을 받아 낼수록 빛이 탁해지다가 끝내 아무 힘도 없는 돌이 된다.</p>'+
  '<p class="muted">항구에 들어오는 것은 집중을 돕는 정도의 하급품이라, 한 개로는 정신력 +'+REST.gain+'만큼만 버팁니다. 들어오는 물량이 적어 정박할 때마다 '+REST.max+'개까지만 팝니다. 포장은 반드시 귀마개를 쓰고 열 것. 맨 귀로 열면 물속으로 돌아가고 싶다는 충동에 사로잡힌다는 소문이 있습니다.</p>'+
  '<p class="small muted">인어를 마주치거나 선원이 인어가 되는 것을 보면 선장의 정신력이 깎입니다. 0이 되면 뒤틀릴지, E.G.O가 피어날지 판정합니다.</p>'+
  tag('선장 정신력 '+v+' / 100')+' '+tag('이번 정박 구매 '+rn+' / '+REST.max)+'<div class="stack" style="margin-top:8px">'+
  button(REST.name+' 구매 · 선장 정신력 +'+REST.gain+' · '+unitMoney(REST.cost)+(rn>=REST.max?' (이번 정박에서는 더 살 수 없음)':v>=100?' (정신력 가득)':''),'capRest','','',!avail||rn>=REST.max||v>=100||state.gold<REST.cost)+
  '</div></div>';
 s+='<div class="inset"><h3>재앙 사냥 준비 · 특수 작살</h3>'+
  '<p>고래잡이들 사이에서 먼 옛날 전설로 불리는 \'쪽빛 노인\'이라 불리는 특색 해결사이자 고래잡이의 무기를 본떠 항구 대장간이 어떻게든 따라해 만든 전용 발사대. 리벳으로 박은 금속판 수십 장을 겹쳐 만든 석궁 모양의 틀에, 사람 키보다 긴 미늘 작살을 걸어 쏜다. 노인은 홀로 쪽배를 몰며 모든 것을 꿰뚫는 청새치를 잡았고, 던질 때마다 작살에 망이라 불리우는 고리 세 개를 감았다고 한다.</p>'+
  '<p class="muted">그래서 이 작살도 망을 '+MIN_RINGS+'개 이상 두른 손에서만 재앙의 고래(창백한 · 푸른 · 붉은)에게 박힙니다. 한 번 고래의 살을 물고 나면 미늘이 휘고 리벳이 헐거워져, 다음 사냥 전에 판을 다시 박아야 합니다(정비).</p>'+
  tag(HARPOON.name+' '+(h?(h.damaged?'손상됨':'정비됨'):'없음'))+'<div class="stack" style="margin-top:8px">';
 if(!h)s+=button(HARPOON.name+' 구매 · '+unitMoney(HARPOON.cost)+' · 선장 '+HARPOON.grade+'등급 이상','calHarpoonBuy','','primary',!avail||state.grade<HARPOON.grade||state.gold<HARPOON.cost);
 else s+=button('특수 작살 정비 · '+unitMoney(HARPOON.cost/2)+(h.damaged?'':' (정비 완료)'),'calHarpoonFix','','',!avail||!h.damaged||state.gold<HARPOON.cost/2);
 s+='</div></div><div class="inset"><h3>신과 망 수련</h3>';
 if(!state.egoBloomed){
  s+='<p>신과 망은 아무나 얻을 수 있는 힘이 아닙니다. 정신력이 바닥난 순간 뒤틀리지 않고 <b>E.G.O를 개화한 선장</b>만이 그 감정을 다시 끌어올려 신으로 삼을 수 있습니다.</p>'+
   '<p class="small muted">아직 E.G.O가 개화하지 않았습니다. 수련을 시도할 수 없습니다.</p>';
 }else{
  const st=nextStep();
  s+='<p class="muted">스스로의 정신력을 깎아 가며 감정을 끌어올리는 수련입니다. 실패해도 정신력은 돌아오지 않고, 0이 되면 다시 판정합니다. 신을 먼저 연 뒤 망을 하나씩 엽니다.</p>'+
   tag('E.G.O · '+(state.egoName||EGO_DEFAULT))+' '+tag(state.shinOpen?'신 개방':'신 미개방')+' '+tag('망 '+shin()+' / '+MAX_RINGS)+
   '<p class="small">신 5 · 60% → 망1 10 · 50% → 망2 20 · 40% → 망3 40 · 30% → 망4 60 · 30% → 망5 80 · 30% (선장 정신력 · 성공 확률)</p>';
  if(st)s+='<div class="stack">'+button(st.label+' 시도 · 선장 정신력 -'+st.cost+' · 성공 '+Math.round(st.p*100)+'%'+(v<st.cost?' (정신력 부족)':''),'shinTry','','primary',!avail||v<st.cost)+'</div>';
  else s+='<p class="small">망을 다섯 개까지 두를 수 있습니다.</p>';
  if(state.shinLastTry)s+='<p class="small">'+esc(state.shinLastTry)+'</p>';
 }
 return out+s+'</div>';
};
document.addEventListener('click',function(e){
 const b=e.target&&e.target.closest&&e.target.closest('button[data-act="calHarpoonBuy"],button[data-act="calHarpoonFix"],button[data-act="shinTry"],button[data-act="capRest"]');
 if(!b||b.disabled||busy||!inShop132()||judging())return;
 const act=b.dataset.act;
 if(act==='calHarpoonBuy'&&!harp()&&state.grade>=HARPOON.grade&&state.gold>=HARPOON.cost){
  state.gold-=HARPOON.cost;state.calamityHarpoon={damaged:false};log(HARPOON.name+'를 샀습니다. 겹겹이 박힌 리벳 판이 무겁게 손에 걸립니다. '+unitMoney(HARPOON.cost)+' 사용.');
 }else if(act==='calHarpoonFix'&&harp()&&harp().damaged&&state.gold>=HARPOON.cost/2){
  state.gold-=HARPOON.cost/2;state.calamityHarpoon.damaged=false;log('휘어진 미늘을 펴고 헐거워진 리벳 판을 다시 박아 특수 작살을 정비했습니다. '+unitMoney(HARPOON.cost/2)+' 사용.');
 }else if(act==='capRest'){
  if(rests()>=REST.max||cm()>=100||state.gold<REST.cost)return;
  state.gold-=REST.cost;state.captainRest={v:state.voyage,n:rests()+1};heal(REST.gain);
  log(REST.name+'을 샀습니다. 푸르스름한 빛을 들여다보는 동안 머릿속이 가라앉습니다. 선장 정신력 +'+REST.gain+' ('+cm()+' / 100). '+unitMoney(REST.cost)+' 사용.');
 }else if(act==='shinTry'){
  const st=nextStep();
  if(!state.egoBloomed||!st||cm()<st.cost)return;
  const ok=Math.random()<st.p;
  state.captainMind=cm()-st.cost;
  if(ok){if(!state.shinOpen){state.shinOpen=true;state.shinLevel=0;}else state.shinLevel=shin()+1;}
  state.shinLastTry=(ok?'성공: ':'실패: ')+st.label+' (선장 정신력 -'+st.cost+', 남은 '+state.captainMind+')';
  log(ok?(st.label==='신 개방'?'기억 속 감정을 끌어올려 머리를 채웠습니다. 신이 열렸습니다.':'신의 끝에 빛의 고리가 하나 더 맺혔습니다. '+st.label+'.')
   :'감정을 끌어올리다 놓쳤습니다. '+st.label+' 실패.');
  if(state.captainMind<=0){state.captainMind=1;hurt(1,'');}   // 0이 되는 순간 판정
 }else return;
 sync();
});
})();
