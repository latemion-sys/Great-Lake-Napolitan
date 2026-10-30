/* 모든 것을 말리는 붉은 고래 · 5단계 사냥 흐름과 미니게임
   ① 말라붙는 호수 : 조우 화면 (사냥 / 회피)
   ② 붉은 팔의 포위 : 스페이스·화면 누르기 연타로 조여 오는 팔을 떨쳐 냄 × 2
   ③ 여덟 팔 격퇴   : 솟아오르는 팔의 손을 눌러 쳐냄. 1개×8 → 2개×4 → 4개×2 → 8개×1
   ④ 붉은 눈의 머리 : 동전 전투 1승 (기존 방식)
   ⑤ 작살과 물의 귀환 : 리듬에 맞춰 열리고 닫히는 꼬리. 작살이 닿는 순간 열려 있어야 꽂힘
   미니게임마다 실패는 한 번까지: 첫 실패는 피해를 입고 다시, 두 번째 실패는 사망.
   고래 전투는 기존 'whale' 전투(유효 타격 4)를 그대로 쓰므로 전리품·업적·처치 기록은 기존대로 지급된다. */
(function(){
'use strict';
const RED=2;
const labels=['말라붙는 호수','붉은 팔의 포위','여덟 팔 격퇴','붉은 눈의 머리','작살과 물의 귀환'];
const MASH={need:2,limit:4.5,start:25,add:7.5,decay:20};
const WAVES=[].concat(Array(8).fill(1),Array(4).fill(2),Array(2).fill(4),[8]);
const WAVE_TIME={1:1.5,2:1.9,4:2.6,8:4.2};
const TAIL={flight:.45,openHold:.9,rise:.15,close:.15,telegraph:.5};
const G=window.RedHuntGame=window.RedHuntGame||{mode:null};

function isRedBattle(){const b=state.battle;return state.scene==='battle'&&b&&b.type==='whale'&&b.index===RED;}
function gameMode(){
 if(!isRedBattle()||state.battle.need!==4)return null;
 const w=Number(state.battle.won)||0;
 return w===0?'mash':w===1?'parry':w===3?'tail':null;
}
function stage(){
 if(state.scene==='dead'||!state.sea||state.current==null)return null;
 if(state.redWhaleFinal023===true&&state.scene!=='battle')return 4;
 if(state.scene==='encounter'&&state.encounter===RED)return 0;
 if(isRedBattle())return Math.max(1,Math.min(4,(Number(state.battle.won)||0)+1));
 return null;
}
function now(){return G.t0?(performance.now()-G.t0)/1000:0;}

/* ---------- 상태 ---------- */
function syncGame(){
 const mode=gameMode();
 if(mode&&(G.mode!==mode||G.ref!==state.battle)){
  for(const k of Object.keys(G))delete G[k];
  G.mode=mode;G.ref=state.battle;G.t0=performance.now();G.done=null;G.text='';
  if(mode==='mash')Object.assign(G,{need:MASH.need,round:0,phase:'ready',gauge:MASH.start,limit:MASH.limit,startAt:1.2,pressTotal:0,okAt:null,failAt:null,lastPress:null});
  if(mode==='parry')Object.assign(G,{waveIdx:0,total:WAVES.length,cleared:0,parried:0,wave:null,nextAt:1.0});
  if(mode==='tail'){Object.assign(G,{flight:null,hitAt:null,opens:[2.0+Math.random()*.8]});G.openness=openness;G.tremble=tremble;}
 }
 if(!mode&&G.mode&&!G.timer){G.mode=null;G.ref=null;}
}
function setText(t){G.text=t;const el=document.getElementById('rwgText');if(el)el.textContent=t;}
function hurt(h,m,msg){takeDamage(h,m);if(msg)log(msg);if(!safeCheck())return false;updateStatus();return true;}
// 실패 처리: 첫 실패는 피해 후 다시, 두 번째 실패는 사망(테스트 페이지 '피해 무시'면 사망 대신 처음부터)
function fail(h,m,logMsg,retryText,deathText){
 G.fails=(G.fails||0)+1;updateLives();
 if(G.fails>=2){
  if(window.__BLUE_NODEATH){G.fails=0;updateLives();log('[테스트] 사망 대신 기회를 되돌립니다.');setText(retryText);return true;}
  G.done='dead';busy=true;setText(deathText);
  G.timer=setTimeout(()=>{G.timer=null;busy=false;G.mode=null;log(logMsg+' 배와 선원들이 붉은 고래에게 시들어 버렸습니다.');die();},1900);
  return false;
 }
 setText(retryText+' · 남은 기회 1번');
 return hurt(h,m,logMsg);
}
function updateLives(){const e=document.getElementById('rwgLives');if(e)e.textContent=String(Math.max(0,2-(G.fails||0)));}
function updateStatus(){const s=document.getElementById('rwgStatus');if(s)s.innerHTML=statusTags();}
function statusTags(){return tag('선체 '+state.hull+' / 100')+' '+tag('정신력 '+state.mind+' / 100');}
function finish(after){
 G.done='ok';busy=true;
 G.timer=setTimeout(()=>{G.timer=null;busy=false;if(!isRedBattle()){G.mode=null;return;}G.mode=null;resolveCoin(true);},after*1000);
}

/* ---------- ② 연타 ---------- */
function mashPress(){
 if(G.mode!=='mash'||G.done||G.phase!=='go')return;
 G.gauge=Math.min(100,G.gauge+MASH.add);G.lastPress=now();G.pressTotal++;
 if(G.gauge>=100)mashComplete(G.lastPress);
}
function mashComplete(t){
 G.round++;G.okAt=t;G.failAt=null;
 if(G.round>=G.need){G.phase='done';setText('떨쳐 냈습니다 · 팔들이 물러나며 여덟 개의 팔이 한꺼번에 솟아오릅니다.');finish(1.4);}
 else{G.phase='ready';G.startAt=t+1.4;G.gauge=MASH.start;setText('한 번 떨쳐 냈습니다 · 팔들이 다시 배를 움켜쥡니다. ('+G.round+' / '+G.need+')');}
}
function mashTick(t,dt){
 if(G.phase==='ready'&&t>=G.startAt){G.phase='go';G.deadline=t+MASH.limit;G.gauge=MASH.start;}
 if(G.phase!=='go')return;
 G.gauge=Math.max(0,G.gauge-MASH.decay*dt);
 if(t>G.deadline){
  G.phase='ready';G.failAt=t;G.okAt=null;G.startAt=t+1.5;G.gauge=MASH.start;
  if(!fail(9,4,'붉은 팔이 선체를 조였습니다. 빨판이 닿은 자리가 시들어 갑니다.','조여듭니다 · 선체가 비명을 지르며 휩니다. 다시 떨쳐 내십시오.','조여듭니다 · 선체가 부서지며 팔들이 배를 통째로 끌어내립니다.'))G.phase='dead';
 }
}
/* ---------- ③ 팔 쳐내기 ---------- */
function newWave(t){
 const n=WAVES[G.waveIdx],slots=[0,1,2,3,4,5,6,7].sort(()=>Math.random()-.5).slice(0,n);
 G.wave={n,start:t,W:WAVE_TIME[n],arms:slots.map(s=>({slot:s,parriedAt:null})),clearAt:null,struckAt:null};
}
function parryPress(x,y){
 if(G.mode!=='parry'||G.done||!G.wave||G.wave.clearAt!=null||G.wave.struckAt!=null)return;
 const t=now(),pos=G.armPos||{};
 let best=null,bd=1e9;
 G.wave.arms.forEach(a=>{if(a.parriedAt!=null)return;const p=pos[a.slot];if(!p)return;const d=Math.hypot(p[0]-x,p[1]-y);if(d<bd){bd=d;best=a;}});
 if(best&&bd<=78){best.parriedAt=t;G.parried++;}
}
function parryTick(t){
 if(!G.wave){if(t>=G.nextAt)newWave(t);return;}
 const W=G.wave;
 if(W.clearAt==null&&W.struckAt==null){
  if(W.arms.every(a=>a.parriedAt!=null)){W.clearAt=t;G.cleared++;
   if(G.cleared>=WAVES.length){setText('여덟 개의 팔을 모두 쳐냈습니다 · 팔 뒤에서 거대한 머리가 떠오릅니다.');finish(1.4);}
   else setText(W.n===8?'':'쳐냈습니다 · '+(WAVES.length-G.cleared)+'번 남았습니다.');}
  else if(t>W.start+W.W){W.struckAt=t;const miss=W.arms.filter(a=>a.parriedAt==null).length;
   fail(Math.min(18,4*miss),Math.min(8,2*miss),'붉은 팔이 선체를 내리쳤습니다.','놓쳤습니다 · 팔 '+miss+'개가 선체를 내리쳤습니다. 같은 공격이 다시 옵니다.','놓쳤습니다 · 팔들이 선체를 박살 내며 선원들을 움켜쥡니다.');}
 }else if(W.clearAt!=null&&t>W.clearAt+.75&&!G.done){G.waveIdx++;G.wave=null;G.nextAt=t+.2;}
 else if(W.struckAt!=null&&t>W.struckAt+1.3){G.wave=null;G.nextAt=t+.1;}
 updateParryPanel();
}
function updateParryPanel(){const c=document.getElementById('rwgCount');if(c)c.textContent=(G.cleared||0)+' / '+WAVES.length;}
/* ---------- ⑤ 꼬리 ---------- */
function openness(t){
 let v=0;for(const o of G.opens||[]){const a=t-o;if(a<-.01||a>TAIL.rise+TAIL.openHold+TAIL.close)continue;
  v=Math.max(v,a<TAIL.rise?a/TAIL.rise:a<TAIL.rise+TAIL.openHold?1:1-(a-TAIL.rise-TAIL.openHold)/TAIL.close);}
 return Math.max(0,Math.min(1,v));
}
function tremble(t){let v=0;for(const o of G.opens||[]){const a=o-t;if(a>0&&a<TAIL.telegraph)v=Math.max(v,1-a/TAIL.telegraph);}return v;}
function tailPress(){
 if(G.mode!=='tail'||G.done||G.hitAt!=null)return;
 const t=now();if(t<1.2)return;
 if(G.locked||(G.flight&&t<G.flight.arrive+.9))return;
 const arrive=t+TAIL.flight,hit=openness(arrive)>=.7;
 G.flight={at:t,arrive,hit,target:G.core?G.core.slice():null};
 if(hit){
  G.hitAt=arrive;
  const resume={stage:4,start:G.t0+arrive*1000-4450};
  if(window.RedWhaleV3)window.RedWhaleV3.resume=resume;
  setText('열린 꼬리 한가운데로 작살이 꽂힙니다!');
  G.done='ok';busy=true;
  G.timer=setTimeout(()=>{G.timer=null;busy=false;if(!isRedBattle()){G.mode=null;return;}G.mode=null;resolveCoin(true);},(arrive-t+1.4)*1000);
 }else{
  G.locked=true;
  setTimeout(()=>{G.locked=false;if(G.mode==='tail'&&!G.done)fail(3,5,'작살이 닫힌 꼬리에 튕겨 나갔습니다.','닫힌 꽃잎에 튕겨 나갔습니다 · 꼬리가 열리는 순간을 노리십시오.','닫힌 꽃잎에 튕겨 나갔습니다 · 팔들이 배를 덮칩니다.');},TAIL.flight*1000);
 }
}
function tailTick(t){
 const last=G.opens[G.opens.length-1];
 if(t>last-3)G.opens.push(last+1.7+Math.random()*.9);
}

let lastTick=0;
function tick(nowMs){
 const dt=lastTick?Math.min(.1,(nowMs-lastTick)/1000):0;lastTick=nowMs;
 if(G.mode&&!G.done&&G.t0&&isRedBattle()){
  const t=now();
  if(G.mode==='mash')mashTick(t,dt);
  else if(G.mode==='parry')parryTick(t);
  else if(G.mode==='tail')tailTick(t);
 }
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------- 화면 ---------- */
function panel(stageNo,title,desc,small,body){
 return '<div class="inset warning rwg-panel"><div class="small">재앙의 고래 · '+esc(WHALES[RED].name)+' · '+stageNo+'단계</div><h2>'+title+'</h2>'+
  '<p>'+desc+'</p><p id="rwgStatus">'+statusTags()+'</p>'+
  '<p>남은 기회 <b id="rwgLives">'+Math.max(0,2-(G.fails||0))+'</b> <span class="muted">(두 번 실패하면 사망)</span></p>'+
  '<div class="coinpanel"><div class="small">'+small+'</div>'+body+'<p id="rwgText">'+esc(G.text||'')+'</p></div></div>';
}
function gamePanel(mode){
 if(mode==='mash')return panel(2,'붉은 팔의 포위','빨판 달린 팔들이 배를 휘감아 조여 옵니다. 닿은 자리가 하얗게 시들어 갑니다. 힘껏 떨쳐 내십시오.',
  '스페이스 / 이펙트 화면 / 아래 버튼을 연타 · 4.5초 안에 게이지를 끝까지 · 2번 떨쳐 내면 통과 · 첫 실패는 피해 후 다시, 두 번째 실패는 사망',
  '<button type="button" class="danger rwg-big" id="rwgAct">팔을 떨쳐 낸다 (연타)</button>');
 if(mode==='parry')return panel(3,'여덟 팔 격퇴','팔들이 하나, 둘, 넷, 그리고 여덟 개가 한꺼번에 솟아 배를 내리칩니다. 솟아오르는 팔의 손을 눌러 쳐내십시오.',
  '이펙트 화면에서 팔의 손(둥근 표시)을 누르기 · 1개×8 → 2개×4 → 4개×2 → 8개 · 첫 실패는 피해 후 같은 공격 다시, 두 번째 실패는 사망',
  '<p>격퇴 <b id="rwgCount">'+(G.cleared||0)+' / '+WAVES.length+'</b></p>');
 if(mode==='tail')return panel(5,'작살과 물의 귀환','선미 뒤로 솟은 꼬리가 숨 쉬듯 열렸다 닫힙니다. 작살이 날아가는 동안 꼬리가 열리도록, 열리기 직전에 던지십시오.',
  '꼬리가 떨리면 곧 1초 동안 열립니다 · 스페이스 / 이펙트 화면 / 아래 버튼 · 첫 실패는 피해 후 다시, 두 번째 실패는 사망',
  '<button type="button" class="danger rwg-big" id="rwgAct">작살을 던진다</button>');
 return '';
}
function sceneMarkup(n,game){return window.RedWhaleV3?window.RedWhaleV3.html(n,game?{game:true}:null):'';}
const previousPlay=renderPlay;
renderPlay=function(){
 syncGame();
 const n=stage();
 if(n===null)return previousPlay();
 if(n===4&&!isRedBattle()){
  return sceneMarkup(4)+
   '<div class="inset"><h2>'+esc(WHALES[RED].name)+' · 사냥 성공</h2>'+
   '<p>고래의 꼬리가 열린 순간, 선미에서 던진 작살이 그 안의 붉은 핵을 꿰뚫었습니다. 빨판 달린 팔들이 힘없이 무너지고, 시들어 말라붙었던 호수에 물이 다시 차오릅니다.</p>'+
   '<p class="muted">전리품과 사냥 업적은 기존 판정대로 지급되었습니다.</p>'+
   button('사냥을 마치고 항해 계속하기','redWhaleContinue023','','primary')+
   '</div>';
 }
 const mode=gameMode();
 if(mode)return sceneMarkup(n,true)+gamePanel(mode);
 return sceneMarkup(n)+previousPlay();
};
// 사냥 시작: 붉은 고래는 유효 타격 4 (연타 · 팔 쳐내기 · 동전 · 꼬리)
const previousHunt=huntWhale;
huntWhale=function(){
 const red=state.scene==='encounter'&&state.encounter===RED;
 const r=previousHunt.apply(this,arguments);
 if(red&&isRedBattle()){state.battle.need=4;sync();}
 return r;
};
const previousCoin=resolveCoin;
resolveCoin=function(win){
 const b=state.battle;
 const success=!!(win&&b&&b.type==='whale'&&b.index===RED&&b.won+1>=b.need);
 if(success)state.redWhaleFinal023=true;
 const result=previousCoin(win);
 if(success&&state.scene==='dead')state.redWhaleFinal023=false;
 return result;
};

/* ---------- 입력 ---------- */
function svgPoint(scene,ev){
 const svg=scene.querySelector('svg');if(!svg||!svg.getScreenCTM)return null;
 const pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;
 const m=svg.getScreenCTM();if(!m)return null;const p=pt.matrixTransform(m.inverse());return [p.x,p.y];
}
function act(){if(G.mode==='mash')mashPress();else if(G.mode==='tail')tailPress();}
document.addEventListener('pointerdown',function(ev){
 if(!G.mode)return;
 if(ev.target.closest&&ev.target.closest('#rwgAct')){ev.preventDefault();act();return;}
 const scene=ev.target.closest&&ev.target.closest('.rw3-scene[data-game]');
 if(!scene)return;
 ev.preventDefault();
 if(G.mode==='parry'){const p=svgPoint(scene,ev);if(p)parryPress(p[0],p[1]);}
 else act();
});
document.addEventListener('keydown',function(e){
 if(!G.mode||e.repeat||e.code!=='Space')return;
 if(e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]'))return;
 e.preventDefault();act();
});
document.addEventListener('click',function(e){
 const b=e.target?.closest?.('button[data-act]');
 if(!b||b.disabled||busy)return;
 if(b.dataset.act==='redWhaleReplay023'){if(window.RedWhaleV3)window.RedWhaleV3.replayToken++;}
 if(b.dataset.act==='redWhaleContinue023'&&state.redWhaleFinal023&&state.scene!=='dead'){
  state.redWhaleFinal023=false;
  sync();
 }
});
if(state.redWhaleFinal023&&(!state.sea||state.scene==='dead'||state.current==null)){
 state.redWhaleFinal023=false;save();
}
render();
window.RED_WHALE_HUNT_023={stage,labels,game:G,mashPress,parryPress,tailPress};
})();
