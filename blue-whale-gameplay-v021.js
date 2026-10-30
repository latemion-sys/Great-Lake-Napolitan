/* 모든 것을 뚫는 푸른 고래 · 5단계 사냥 흐름과 미니게임
   ① 수면의 절단   : 조우 화면 (사냥 / 회피)
   ② 초고속 관통   : 동전 전투 1승
   └ 꿰뚫는 것에 꿰뚫린 것들 : 조우 글 → 인어 무리와 동전 전투 2승
   ③ 푸른 항로 추적 : ← → 중 무작위 방향을 0.9초 안에 연타해 게이지를 채움. 2번 놓치면 추적 실패
   ④ 관통 회피     : 0.5~2초 중 무작위 순간에 물살에서 주둥이가 솟을 때 회피(스페이스·화면 누르기) × 3.
                     너무 이르거나 늦으면 꿰뚫리며 사망
   ⑤ 최후의 교차   : 단 한 번의 작살. 좁혀 오는 고리가 교차점에 겹칠 때 던짐. 빗나가면 꿰뚫리며 사망
   특수 조건「궤적이 겹치는 허공」: 고래의 몸은 끝까지 보이지 않는다. 보이는 것은 이미 지나간 곧은 궤적뿐.
     궤적 ① 사냥을 시작하면(수면을 가른 선) ② 초고속 관통을 첫 동전에 맞히면 ③ 추적을 다시 하지 않고 넘기면 ④ 회피를 다시 하지 않고 넘기면
     해도에 한 줄씩 그어진다. 3줄 이상이면 5단계에서 선들이 겹치는 허공(교차점)이 보이고, 2줄 이하면 겨눌 곳이 없어
     작살이 잔상을 지나가고 고래는 사라진다(사냥 실패 · 사망 아님).
   미니게임마다 실패는 한 번까지: 첫 실패는 피해 후 다시, 두 번째 실패는 사망 (minigame-strikes.js).
   고래 전투는 기존 'whale' 전투(유효 타격 4)를 그대로 쓰므로 전리품·업적·처치 기록은 기존대로 지급된다. */
(function(){
'use strict';
const BLUE=1;
const labels=['수면의 절단','초고속 관통','푸른 항로 추적','관통 회피','최후의 교차'];
const CHASE_NEED=12,CHASE_WIN=0.9,CHASE_MISS=2;
const EVADE_NEED=3,EVADE_APPROACH=0.9,EVADE_WIN=0.6;
const FINAL_CLOSE=0.6,FINAL_WIN=0.2,FINAL_FLIGHT=0.4;
const G=window.BlueHuntGame=window.BlueHuntGame||{mode:null};
const TRAIL_TEXT={1:'수면을 가르고 지나간 첫 선',2:'배 앞을 가로지른 잔상의 선',3:'호수를 갈라 놓은 물길의 방향',4:'솟구친 주둥이의 각도'};
function trailsOf(h){return h&&Array.isArray(h.trails)?h.trails:null;}
function trailCount(){const t=trailsOf(hunt());return t?t.length:4;}   // 예전 저장 · 테스트는 모두 읽은 것으로
function drawer(){return state.crew&&state.crew.some(c=>c.role==='navigator')?'1등 항해사가':'선장이';}
function addTrail(n){const h=hunt();if(!h)return;if(!Array.isArray(h.trails))h.trails=[];if(h.trails.includes(n))return;h.trails.push(n);
 log(drawer()+' '+TRAIL_TEXT[n]+'을 해도에 긋습니다. (궤적 '+h.trails.length+' / 4)');}
function loseTrail(n){log(TRAIL_TEXT[n]+'이 흐트러져 해도에 남지 않았습니다.');}

function isBlueBattle(){const b=state.battle;return state.scene==='battle'&&b&&b.type==='whale'&&b.index===BLUE;}
function hunt(){return state.blueHunt||null;}
function huntPhase(){
 if(!isBlueBattle())return null;
 const h=hunt();if(!h)return 'pierce';
 return h.phase||'pierce';
}
function phaseNow(){
 if(state.scene==='dead'||!state.sea||state.current==null)return null;
 if(state.blueWhaleFinalStage===true&&state.scene!=='battle')return 4;
 if(state.scene==='encounter'&&state.encounter===BLUE)return 0;
 const p=huntPhase();
 if(p==='pierce')return 1;
 if(p==='chase')return 2;
 if(p==='evade')return 3;
 if(p==='final')return 4;
 return null;
}
function now(){return G.t0?(performance.now()-G.t0)/1000:0;}
function noDeath(){return !!window.__BLUE_NODEATH;}

/* ---------- 상태 초기화 ---------- */
function syncGame(){
 const p=huntPhase(),mode=p==='chase'||p==='evade'||p==='final'?p:null;
 if(mode&&(G.mode!==mode||G.ref!==state.battle)){
  for(const k of Object.keys(G))if(k!=='resume')delete G[k];
  G.mode=mode;G.ref=state.battle;G.t0=performance.now();G.done=null;G.text='';
  if(mode==='chase')Object.assign(G,{need:CHASE_NEED,win:CHASE_WIN,hits:0,misses:0,dir:null,pauseUntil:1.2,promptAt:null,lastHitAt:null,lastMissAt:null});
  if(mode==='evade')Object.assign(G,{need:EVADE_NEED,ok:0,round:-1,phase:'ready',nextAt:1.0});
  if(mode==='final')Object.assign(G,{phase:'wait',breachAt:1.2+Math.random()*1.4,thrownAt:null,hit:null});
  if(mode==='final'){G.win=FINAL_WIN;G.ti=G.breachAt+FINAL_CLOSE;G.th=G.ti+FINAL_FLIGHT;}
  if(mode==='final'){G.trails=trailCount();G.blind=G.trails<3;}else G.trails=null;
 }
 if(!mode&&G.mode&&!G.timer){G.mode=null;G.ref=null;}
}

/* ---------- ③ 추적 ---------- */
function chasePrompt(t){G.dir=Math.random()<.5?'L':'R';G.promptAt=t;}
function chaseMiss(t,why){
 G.misses++;G.lastMissAt=t;G.dir=null;G.missWhy=why;
 if(G.misses>=CHASE_MISS){finish('fail',t);setText('놓쳤습니다 · 푸른 등이 물길 끝으로 사라집니다.');}
 else{G.pauseUntil=t+.9;setText((why==='late'?'늦었습니다':'방향이 틀렸습니다')+' · 고래와의 거리가 벌어집니다. (놓침 '+G.misses+' / '+CHASE_MISS+')');}
 updatePanel();
}
function chasePress(d){
 if(G.mode!=='chase'||G.done)return;
 const t=now();
 if(!G.dir)return;
 if(d!==G.dir){chaseMiss(t,'wrong');return;}
 G.hits++;G.lastHitAt=t;
 if(G.hits>=G.need){G.dir=null;finish('ok',t);setText('따라잡았습니다 · 푸른 고래가 몸을 돌려 배를 겨눕니다.');}
 else chasePrompt(t);
 updatePanel();
}
/* ---------- ④ 회피 ---------- */
function evadeRound(t){G.round++;G.phase='approach';G.roundAt=t;G.upAt=t+EVADE_APPROACH+0.5+Math.random()*1.5;G.pressAt=null;G.failAt=null;}
function evadeFail(t,why){
 G.phase='pierced';G.failAt=t;G.failWhy=why;
 setText(why==='early'?'너무 빨랐습니다 · 고래가 방향을 바꿔 선체를 꿰뚫습니다.':'늦었습니다 · 주둥이가 선체를 꿰뚫고 솟구칩니다.');
 finish('fail',t);updatePanel();
}
function evadePress(){
 if(G.mode!=='evade'||G.done)return;
 const t=now();
 if(G.phase==='approach'||G.phase==='wait'){evadeFail(t,'early');return;}
 if(G.phase!=='up')return;
 G.phase='dodge';G.pressAt=t;G.ok++;
 if(G.ok>=G.need){finish('ok',t,1.9);setText('세 번 모두 피했습니다 · 고래가 마지막 돌진을 준비합니다.');}
 else setText('회피 · 주둥이가 배가 있던 자리를 꿰뚫었습니다. ('+G.ok+' / '+G.need+')');
 updatePanel();
}
/* ---------- ⑤ 최후의 교차 ---------- */
function finalPress(){
 if(G.mode!=='final'||G.done||G.thrownAt!=null)return;
 const t=now();
 if(G.blind){G.thrownAt=t;G.hit=false;G.arriveAt=t+FINAL_FLIGHT;setText('작살이 허공을 가릅니다 · 지나간 것은 잔상뿐이었습니다.');finish('fail',Math.max(G.th,t),0.3);G.fatal=false;updatePanel();return;}
 G.thrownAt=t;G.hit=Math.abs(t-G.ti)<=FINAL_WIN;
 G.arriveAt=t+FINAL_FLIGHT;
 if(G.hit){
  // 명중: 작살이 교차점에 닿는 순간부터 사냥 성공 장면이 이어서 재생되도록 시작 시각을 넘겨 줌
  G.resume={stage:4,start:G.t0+G.th*1000-1750};
  if(window.BlueWhaleV3)window.BlueWhaleV3.resume=G.resume;
  setText('작살이 먼저 날아갑니다 · 솟구친 고래가 정확히 그 지점을 지나갑니다.');
  finish('ok',G.th,1.35);
 }else{
  setText(t<G.ti?'너무 빨랐습니다 · 작살이 빈 허공을 가릅니다.':'늦었습니다 · 고래가 교차점을 먼저 지나갑니다.');
  finish('fail',Math.max(G.th,t),0.3);
 }
 updatePanel();
}
function finalAutoMiss(t){
 G.hit=false;G.thrownAt=null;G.autoMiss=true;
 if(G.blind){setText('겨눌 곳을 찾지 못했습니다 · 푸른 잔상이 배 곁을 스쳐 사라집니다.');finish('fail',G.th,0.3);G.fatal=false;updatePanel();return;}
 setText('작살을 던지지 못했습니다 · 고래가 교차점을 지나 배를 향합니다.');
 finish('fail',G.th,0.3);updatePanel();
}

/* ---------- 결과 처리 ---------- */
function finish(kind,t,delay){
 G.done=kind;G.doneAt=t;busy=true;
 if(kind==='fail')G.fatal=(G.fails||0)+1>=2&&!(window.MinigameStrikes&&MinigameStrikes.noDeath());
 const wait={chase:{ok:1.1,fail:1.5},evade:{ok:1.9,fail:2.0},final:{ok:1.35,fail:2.3}}[G.mode][kind];
 const ms=Math.max(0,((delay!=null&&kind==='ok'?t+delay:t+wait)-now())*1000);
 const mode=G.mode;
 G.timer=setTimeout(()=>{G.timer=null;busy=false;resolveMinigame(mode,kind);},ms);
}
function resolveMinigame(mode,kind){
 if(!isBlueBattle()){G.mode=null;return;}
 const h=hunt()||(state.blueHunt={phase:mode});
 if(mode==='final'&&G.blind){
  // 궤적이 모자라 겨눌 곳이 없었다: 고래는 사라지고 사냥은 끝난다(사망 아님)
  log('작살은 허공의 잔상을 그대로 지나갔습니다. 푸른 고래는 지나간 자리로만 남았습니다. 해도의 선이 모자랐습니다.');
  G.mode=null;state.blueHunt=null;state.battle=null;
  afterWhale(BLUE);
  return;
 }
 if(kind==='ok'&&(mode==='chase'||mode==='evade')){const n=mode==='chase'?3:4;if(G.fails)loseTrail(n);else addTrail(n);}
 if(kind==='ok'){
  h.phase=mode==='chase'?'evade':mode==='evade'?'final':'done';
  G.mode=null;
  if(mode==='final')state.blueHunt=null;
  resolveCoin(true);         // 유효 타격 +1 (마지막이면 사냥 성공 → 5단계 장면)
  return;
 }
 // 실패: 첫 번째는 피해 후 다시, 두 번째는 사망
 const verdict=window.MinigameStrikes?MinigameStrikes.strike(G):'dead';
 if(verdict==='dead'){
  log(mode==='chase'?'물길 끝에서 방향을 튼 푸른 고래가 배를 정면으로 꿰뚫었습니다.':'푸른 고래의 주둥이가 선체와 선원들을 한꺼번에 꿰뚫었습니다.');
  G.mode=null;state.blueHunt=null;
  die();
  return;
 }
 const dmg={chase:[8,6],evade:[14,6],final:[14,6]}[mode];
 takeDamage(dmg[0],dmg[1]);
 log(mode==='chase'?'푸른 고래를 놓칠 뻔했습니다. 물길을 다시 쫓습니다.':mode==='evade'?'주둥이가 선체를 스치고 지나갔습니다. 아직 버팁니다.':'작살이 빗나가고 고래가 선체를 들이받았습니다. 아직 버팁니다.');
 if(!safeCheck())return;
 retryMode(mode);
 render();
}
function retryMode(mode){
 const t=now();
 G.done=null;G.fatal=false;G.timer=null;
 if(mode==='chase'){Object.assign(G,{hits:0,misses:0,dir:null,pauseUntil:t+1.2,promptAt:null,lastHitAt:null,lastMissAt:null,_off:null});setText('다시 쫓습니다 · 남은 기회 1번.');}
 if(mode==='evade'){Object.assign(G,{phase:'ready',nextAt:t+1.2,pressAt:null,failAt:null,failWhy:null});setText('배를 다시 바로잡았습니다 · 남은 기회 1번.');}
 if(mode==='final'){const b=t+1.2+Math.random()*1.4;Object.assign(G,{phase:'wait',breachAt:b,ti:b+FINAL_CLOSE,th:b+FINAL_CLOSE+FINAL_FLIGHT,thrownAt:null,hit:null,autoMiss:false,arriveAt:null});setText('고래가 다시 물속으로 사라졌습니다 · 남은 기회 1번.');}
 if(window.MinigameStrikes)MinigameStrikes.refresh(G);
}
function setText(t){G.text=t;const el=document.getElementById('bwgText');if(el)el.textContent=t;}

/* ---------- 매 프레임 판정 ---------- */
function tick(){
 if(G.mode&&!G.done&&G.t0&&isBlueBattle()){
  const t=now();
  if(G.mode==='chase'){
   if(G.dir&&t>G.promptAt+G.win)chaseMiss(t,'late');
   else if(!G.dir&&t>=G.pauseUntil)chasePrompt(t);
  }else if(G.mode==='evade'){
   if(G.phase==='ready'&&t>=G.nextAt)evadeRound(t);
   else if(G.phase==='approach'&&t>=G.roundAt+EVADE_APPROACH)G.phase='wait';
   if((G.phase==='approach'||G.phase==='wait')&&t>=G.upAt)G.phase='up';
   else if(G.phase==='up'&&t>G.upAt+EVADE_WIN)evadeFail(t,'late');
   else if(G.phase==='dodge'&&t>G.pressAt+1.9)evadeRound(t);
  }else if(G.mode==='final'){
   if(G.phase==='wait'&&t>=G.breachAt)G.phase='breach';
   if(G.thrownAt==null&&t>G.ti+(G.blind?4:FINAL_WIN+.05))finalAutoMiss(t);
  }
 }
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------- 화면 ---------- */
function statusTags(){const t=trailsOf(hunt());return tag('선체 '+state.hull+' / 100')+' '+tag('정신력 '+state.mind+' / 100')+(t?' '+tag('해도의 궤적 '+t.length+' / 4'):'');}
function chasePanel(){
 return '<div class="inset warning bwg-panel"><div class="small">재앙의 고래 · 모든 것을 뚫는 푸른 고래 · 3단계</div><h2>푸른 항로 추적</h2>'+
  '<p>고래가 남긴 빛나는 물길을 따라 전속력으로 쫓습니다. 고래가 꺾는 쪽으로 키를 돌리십시오.</p><p>'+statusTags()+'</p>'+
  '<div class="coinpanel bwg-chase"><div class="small">화면에 뜬 방향(← / →)을 0.9초 안에 누르십시오 · 게이지를 채우면 통과 · 2번 놓치면 추적 실패</div>'+
  '<div class="bwg-meter"><i id="bwgGauge"></i></div>'+
  '<p>추적 <b id="bwgCount">'+(G.hits||0)+' / '+CHASE_NEED+'</b> <span class="muted">놓침 <b id="bwgMiss">'+(G.misses||0)+' / '+CHASE_MISS+'</b></span></p>'+
  '<div class="bwg-pad"><button type="button" class="primary bwg-dir" data-bwdir="L">←</button><button type="button" class="primary bwg-dir" data-bwdir="R">→</button></div>'+
  (window.MinigameStrikes?MinigameStrikes.livesHtml(G):'')+
  '<p id="bwgText">'+esc(G.text||'키보드 ← → 또는 위 버튼, 이펙트 화면 왼쪽·오른쪽을 눌러도 됩니다.')+'</p></div></div>';
}
function evadePanel(){
 return '<div class="inset warning bwg-panel"><div class="small">재앙의 고래 · 모든 것을 뚫는 푸른 고래 · 4단계</div><h2>관통 회피</h2>'+
  '<p>물속의 푸른 선이 뱃머리를 겨눕니다. 주둥이가 물살을 뚫고 솟는 순간에만 배를 틀 수 있습니다. 너무 이르거나 늦으면 그대로 꿰뚫립니다.</p><p>'+statusTags()+'</p>'+
  '<div class="coinpanel bwg-evade"><div class="small">물살에서 주둥이가 솟는 순간 · 스페이스 / 화면 누르기 / 아래 버튼 · 3번 피하면 통과</div>'+
  '<p>회피 <b id="bwgCount">'+(G.ok||0)+' / '+EVADE_NEED+'</b></p>'+
  '<button type="button" class="danger" id="bwgAct">배를 튼다</button>'+
  (window.MinigameStrikes?MinigameStrikes.livesHtml(G):'')+
  '<p id="bwgText">'+esc(G.text||'아직 누르지 마십시오. 주둥이가 솟을 때까지 기다리십시오.')+'</p></div></div>';
}
function finalPanel(){
 const n=trailCount(),blind=n<3;
 return '<div class="inset warning bwg-panel"><div class="small">재앙의 고래 · 모든 것을 뚫는 푸른 고래 · 5단계</div><h2>최후의 교차</h2>'+
  (blind
   ?'<p>그것은 보이지 않습니다. 해도에 그어진 궤적은 '+n+'줄뿐이라 선들이 겹치는 곳이 없습니다. 어디에 던져도 잔상만 지나갈 것입니다.</p>'
   :'<p>그것은 끝내 보이지 않습니다. 그것은 휘지 않습니다. 해도의 선 '+n+'줄이 겹치는 허공, 아무것도 없는 그 한 점에 작살을 먼저 던져야 합니다.</p>')+
  '<p>'+statusTags()+'</p>'+
  '<div class="coinpanel bwg-final"><div class="small">'+(blind?'겨눌 곳 없이 던질 수는 있습니다 · 작살은 잔상을 지나가고 고래는 사라집니다':'선들이 겹치는 교차점 원에 좁혀 오는 고리가 겹치는 순간 · 스페이스 / 화면 누르기 / 아래 버튼 · 명중하면 사냥 성공')+'</div>'+
  '<button type="button" class="danger" id="bwgAct">작살을 던진다</button>'+
  (window.MinigameStrikes?MinigameStrikes.livesHtml(G):'')+
  '<p id="bwgText">'+esc(G.text||'고래가 솟구칠 때까지 숨을 고르십시오.')+'</p></div></div>';
}
function updatePanel(){
 const c=document.getElementById('bwgCount'),m=document.getElementById('bwgMiss'),g=document.getElementById('bwgGauge'),a=document.getElementById('bwgAct');
 if(G.mode==='chase'){if(c)c.textContent=G.hits+' / '+CHASE_NEED;if(m)m.textContent=G.misses+' / '+CHASE_MISS;if(g)g.style.width=(100*G.hits/CHASE_NEED).toFixed(1)+'%';}
 if(G.mode==='evade'&&c)c.textContent=G.ok+' / '+EVADE_NEED;
 if(a)a.disabled=!!G.done||(G.mode==='final'&&G.thrownAt!=null);
 document.querySelectorAll('.bwg-dir').forEach(b=>b.disabled=!!G.done);
}

const oldPlay=renderPlay;
renderPlay=function(){
 syncGame();
 // 사냥 도중 상태가 어긋나면(도망·사망 등) 정리
 if(state.blueHunt&&!(state.scene==='blueHunt'||isBlueBattle()||(state.battle&&state.battle.type==='blueMermaid'))){state.blueHunt=null;}
 if(state.scene==='blueHunt'&&state.blueHunt)return mermaidIntro();
 const stage=phaseNow();
 if(stage===null)return oldPlay();
 if(stage===4&&!isBlueBattle()){
  return blueMarkup(4)+
   '<div class="inset"><h2>'+esc(WHALES[BLUE].name)+' · 사냥 성공</h2>'+
   '<p>먼저 던진 작살이 아무것도 없던 허공에서 멈췄습니다. 그 자리에서 푸른 빛과 피가 쏟아집니다. 물기둥이 걷힌 뒤 떠오른 것은 부러진 주둥이 끝과 지느러미 조각뿐입니다. 그 몸이 어떻게 생겼는지는 끝내 아무도 보지 못했습니다.</p>'+
   '<p class="muted">고래 사냥 전리품과 업적은 기존 사냥 결과대로 지급되었습니다.</p>'+
   button('사냥을 마치고 항해 계속하기','blueWhaleContinue021','','primary')+
   '</div>';
 }
 const p=huntPhase();
 if(p==='chase')return blueMarkup(2,true)+chasePanel();
 if(p==='evade')return blueMarkup(3,true)+evadePanel();
 if(p==='final')return blueMarkup(4,true)+finalPanel();
 return blueMarkup(stage)+oldPlay();
};
function blueMarkup(stage,game){return window.BlueWhaleV3?window.BlueWhaleV3.html(stage,game?{game:true}:null):'';}

/* ---------- 꿰뚫는 것에 꿰뚫린 것들 ---------- */
function mermaidIntro(){
 return '<div class="inset warning"><div class="small">특이한 인어 조우 · 모든 것을 뚫는 푸른 고래</div><h2>꿰뚫는 것에 꿰뚫린 것들</h2>'+
  '<p>푸른 고래의 궤적 뒤로 물고기와 인어, 사람들이 일어섭니다. 그것들의 몸에는 온통 푸른 궤적이 나 있으며, 가장 눈에 띄는 것은 몸을 곧게 관통한 한 줄기의 흔적입니다.</p>'+
  '<p>그것들이 꿰뚫린 자신의 것 대신 뾰족한 형태의 가시를 드러냅니다. 또 다른 동료를 만들기 위해서.</p>'+
  '<p>'+statusTags()+'</p>'+
  '<div class="stack" style="margin-top:14px">'+button('꿰뚫린 것들을 상대한다','blueMermaidFight','','primary')+'</div></div>';
}

// 고래 사냥 시작: 푸른 고래는 유효 타격 4 (동전 1 · 추적 · 회피 · 최후의 교차)
const oldHunt=huntWhale;
huntWhale=function(){
 const blue=state.scene==='encounter'&&state.encounter===BLUE;
 const r=oldHunt.apply(this,arguments);
 if(blue&&isBlueBattle()){state.battle.need=4;state.blueHunt={phase:'pierce',trails:[]};addTrail(1);sync();}
 return r;
};
const oldResolve=resolveCoin;
resolveCoin=function(win){
 const b=state.battle;
 // 꿰뚫린 것들과의 전투
 if(b&&b.type==='blueMermaid'){
  if(win&&b.won+1>=b.need&&state.blueHunt&&state.blueHunt.whale){
   b.won++;b.history.push('앞면 · 유효 타격');
   if(state.prog)state.prog.mermaidKills=(state.prog.mermaidKills||0)+1;
   log('꿰뚫린 것들을 물리쳤습니다. 푸른 고래의 물길이 아직 빛나고 있습니다.');
   const whale=state.blueHunt.whale;delete state.blueHunt.whale;
   state.blueHunt.phase='chase';state.battle=whale;state.scene='battle';state.lastCoin=null;
   sync();return;
  }
  return oldResolve(win);
 }
 const blue=!!(b&&b.type==='whale'&&b.index===BLUE);
 const final=blue&&win&&b.won+1>=b.need;
 if(final)state.blueWhaleFinalStage=true;
 // 2단계(초고속 관통) 첫 타격 성공 → 꿰뚫린 것들과 조우
 const toMermaid=blue&&win&&b.won===0&&(!state.blueHunt||state.blueHunt.phase==='pierce');
 const firstTry=blue&&b.won===0&&(!state.blueHunt||state.blueHunt.phase==='pierce')&&!(b.history&&b.history.length);
 const carry=trailsOf(state.blueHunt);
 if(blue&&b.won===0&&state.blueHunt&&state.blueHunt.phase==='pierce'&&!win&&!state.blueHunt.lost2){state.blueHunt.lost2=true;loseTrail(2);}
 if(firstTry&&win)addTrail(2);
 const result=oldResolve(win);
 if(final&&state.scene==='dead')state.blueWhaleFinalStage=false;
 if(toMermaid&&isBlueBattle()&&state.battle.won===1){
  state.blueHunt={phase:'mermaid',whale:state.battle,trails:carry||trailsOf(state.blueHunt)||undefined};
  state.battle=null;state.scene='blueHunt';
  sync();
 }
 return result;
};
// 인어 전투에서 도망치면 고래 사냥도 끝남
const oldFlee=fleeBattle;
fleeBattle=function(){
 const b=state.battle,wasMermaid=b&&b.type==='blueMermaid';
 const r=oldFlee.apply(this,arguments);
 if(wasMermaid&&!state.battle){state.blueHunt=null;}
 return r;
};

/* ---------- 입력 ---------- */
document.addEventListener('click',function(ev){
 const d=ev.target.closest&&ev.target.closest('[data-bwdir]');
 if(d){chasePress(d.dataset.bwdir);return;}
 if(ev.target.closest&&ev.target.closest('#bwgAct')){if(G.mode==='evade')evadePress();else if(G.mode==='final')finalPress();return;}
 const scene=ev.target.closest&&ev.target.closest('.bw3-scene[data-game]');
 if(scene&&G.mode){
  if(G.mode==='chase'){const r=scene.getBoundingClientRect();chasePress(ev.clientX<r.left+r.width/2?'L':'R');}
  else if(G.mode==='evade')evadePress();
  else if(G.mode==='final')finalPress();
  return;
 }
 const b=ev.target.closest&&ev.target.closest('button[data-act]');
 if(!b||b.disabled||busy)return;
 if(b.dataset.act==='blueMermaidFight'&&state.scene==='blueHunt'&&state.blueHunt){
  beginBattle({type:'blueMermaid',index:BLUE,name:'꿰뚫는 것에 꿰뚫린 것들',power:190,need:2,won:0,history:[],after:'event'});
 }
 if(b.dataset.act==='blueWhaleContinue021'&&state.blueWhaleFinalStage&&state.scene!=='dead'){
  state.blueWhaleFinalStage=false;
  sync();
 }
});
document.addEventListener('keydown',function(e){
 if(!G.mode||e.repeat)return;
 if(e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]'))return;
 if(G.mode==='chase'&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();chasePress(e.key==='ArrowLeft'?'L':'R');}
 else if((G.mode==='evade'||G.mode==='final')&&e.code==='Space'){e.preventDefault();if(G.mode==='evade')evadePress();else finalPress();}
});

// 저장된 상태 정리
if(state.blueWhaleFinalStage&&(!state.sea||state.scene==='dead'||state.current==null)){state.blueWhaleFinalStage=false;save();}
if(state.scene==='blueHunt'&&!(state.blueHunt&&state.blueHunt.whale)){state.scene='event';state.blueHunt=null;save();}
render();
window.BLUE_WHALE_HUNT_021={phaseNow,labels,game:G,chasePress,evadePress,finalPress};
})();
