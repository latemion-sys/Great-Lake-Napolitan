/* 모든 것을 말리는 붉은 고래 · v0.2.4 여덟 팔 사냥
   문어 빨판이 달린 사람 팔 모양의 촉수는 하나하나가 살아 있는 인어이자 고래의 중요한 몸. 여덟 개를 모두 없애면 고래가 죽는다.
   가열도: 0에서 시작. 페이즈를 넘기지 못하면 그 페이즈를 처음부터 다시 하며 가열도 +50. 100이 되면 배 전체가 녹아 사망.
   ① 1페이즈(작살을 맞춘 뒤) 촉수 1 연타 · 촉수 2 더 많은 연타 (스페이스 / 화면 아무 곳이나 연타)
   ② 2페이즈(작살을 맞춘 뒤 힘겨루기) 촉수 3 힘 게이지가 적정 구간일 때 손을 떼면 찢어짐 · 촉수 4 같은 방식(두 번째 팔)
      (PC: 마우스를 누른 채 아래로 끌어 당김 / 휴대폰: 손가락으로 아래로 끌기)
   ③ 3페이즈(작살을 맞추려는 순간 피함) 촉수 5 움직이는 방향의 반대로 4회 · 촉수 6 잠깐 반대로 움직이는 척하는 속임수
      (PC: 방향키 / 휴대폰: 방향키 모양 버튼)
   ④ 4페이즈(작살을 맞추기 전 배에 달라붙음) 촉수 7 빨판 4개가 붙는 순서 기억(4초) 후 같은 순서로 누르기(16초)
      촉수 8 균열을 따라 찢기 ×2 (PC: 왼쪽 버튼을 누른 채 균열을 따라 / 휴대폰: 한 손가락으로 끌기)
   고래 전투는 기존 'whale' 전투(유효 타격 4: 페이즈마다 1)를 그대로 쓰므로 전리품·업적·처치 기록은 기존대로 지급된다. */
(function(){
'use strict';
const RED=2,RAD=Math.PI/180;
const labels=['내려가는 물','작살과 연타','힘겨루기','피하는 팔','배에 붙은 팔'];
const MASH=[{add:9,decay:16,limit:5},{add:6.5,decay:22,limit:6}];
const PULL={limit:13,zone:[[.55,.2],[.52,.2]]};
const DIR={need:4,win:1.5,gapMin:.7,gapRand:.6,feint:.42};
const SUCKN=4,SHOW=4,RECALL=16,CRACKN=2,CRACK={tol:38,limit:10};
const VEC={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},OPP={up:'down',down:'up',left:'right',right:'left'},KEYDIR={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right'};
const G=window.RedHuntGame=window.RedHuntGame||{mode:null};
const EASE=()=>(window.CalamityMang?window.CalamityMang.ease():1);
const rnd=(a,b)=>a+Math.random()*(b-a);
function isRedBattle(){const b=state.battle;return state.scene==='battle'&&b&&b.type==='whale'&&b.index===RED;}
function gameMode(){if(!isRedBattle()||state.battle.need!==4)return null;return 'p'+Math.max(1,Math.min(4,(Number(state.battle.won)||0)+1));}
function stage(){
 if(state.scene==='dead'||!state.sea||state.current==null)return null;
 if(state.redWhaleFinal023===true&&state.scene!=='battle')return 4;
 if(state.scene==='encounter'&&state.encounter===RED)return 0;
 if(isRedBattle())return Math.max(1,Math.min(4,(Number(state.battle.won)||0)+1));
 return null;
}
function now(){return G.t0?(performance.now()-G.t0)/1000:0;}
function heat(){return Math.max(0,Math.min(100,+state.redHeat024||0));}

/* ---------- 상태 ---------- */
function syncGame(){
 const mode=gameMode();
 if(mode&&(G.mode!==mode||G.ref!==state.battle)){
  for(const k of Object.keys(G))delete G[k];
  Object.assign(G,{mode,ref:state.battle,t0:performance.now(),done:null,text:'',ease:EASE(),arm:0});
  startArm(0,.4);
 }
 G.heat=heat();
 if(!mode&&G.mode&&!G.timer){G.mode=null;G.ref=null;}
}
function startArm(ix,delay){
 const t=now()+delay,ph=+G.mode.slice(1);
 Object.assign(G,{arm:ix,armStart:t,killAt:null,reelAt:null,reelDur:1.05,flash:null,failAt:null,hintNow:false,introAt:null,
  gauge:null,deadline:null,tension:0,zone:null,joltAt:null,pulling:false,dirNow:null,rounds:0,stabAt:null,suck:null,crack:null,phaseState:'intro'});
 if(ph===1||ph===2){G.introAt=t+.9;G.hint='작살이 팔을 꿰뚫습니다';G.cap=ph===1?'작살이 박힌 팔이 밧줄을 끌어당깁니다. 연타해서 끊어 내십시오.':'작살이 박힌 팔과 힘겨루기를 합니다. 알맞은 힘에서 손을 떼면 팔이 찢어집니다.';}
 if(ph===3){G.hint='작살을 겨눕니다 · 팔이 피하려 합니다';G.cap='작살을 맞추려는 순간 팔이 피합니다. 팔이 움직이는 반대쪽으로 겨누십시오.';}
 if(ph===4){G.hint=ix===0?'팔이 배에 달라붙습니다':'팔에 균열이 갑니다';G.cap=ix===0?'작살을 맞추기도 전에 팔이 배에 달라붙습니다. 빨판이 붙는 순서를 기억하십시오.':'팔이 배를 조입니다. 균열을 따라 찢어 내십시오.';}
 G.at=t;
}
function setText(t){G.text=t;const e=document.getElementById('rwgText');if(e)e.textContent=t;}
function flash(text,good){G.flash={at:now(),text,good};}
function updateStatus(){const s=document.getElementById('rwgStatus');if(s)s.innerHTML=statusTags();}
function statusTags(){return tag('침식 '+(state.exposure||0)+' / 100')+' '+tag('정신력 '+state.mind+' / 100')+' '+tag('가열도 '+heat()+' / 100')+' '+tag('남은 팔 '+Math.max(0,8-armsDown())+' / 8');}
function armsDown(){const b=state.battle;return b&&b.type==='whale'&&b.index===RED?(Number(b.won)||0)*2+(G.arm||0):0;}

// 한 팔을 끊음 → 둘째 팔이면 페이즈 통과
function killArm(t,msg){
 if(G.killAt!=null)return;
 G.killAt=t;G.phaseState='kill';flash('끊어냄',true);setText(msg);G.hint='';G.hintNow=false;
 G.reelAt=t+.6;   // 문구가 뜬 뒤 작살을 감아 들여 다시 장전
 if(G.arm===0){G.locked=true;setTimeout(()=>{G.locked=false;if(G.mode&&!G.done)startArm(1,.2);},1900);}
 else{
  G.done='ok';busy=true;
  const ref=state.battle;G.timer=setTimeout(()=>{G.timer=null;busy=false;if(!isRedBattle()||state.battle!==ref){G.mode=null;return;}G.mode=null;resolveCoin(true);},2000);
 }
}
// 페이즈 실패: 가열도 +50, 100이면 배가 녹아 사망. 아니면 이 페이즈를 처음부터
function failPhase(t,why){
 if(G.done||G.failing)return;
 G.failing=true;G.failAt=t;flash('실패',false);G.hint='';G.reelAt=t+.4;
 state.redHeat024=heat()+50;G.heat=heat();updateStatus();
 if(heat()>=100){
  if(window.__BLUE_NODEATH){state.redHeat024=0;log('[테스트] 사망 대신 가열도를 되돌립니다.');}
  else{
   G.done='dead';busy=true;setText(why+' · 가열도 100 — 배가 녹아내립니다.');
   G.timer=setTimeout(()=>{G.timer=null;busy=false;G.mode=null;log(why+' 달아오른 배가 통째로 녹아 붉은 물속으로 가라앉았습니다.');die();},1900);
   return;
  }
 }
 setText(why+' · 가열도 '+heat()+' — 이 페이즈를 처음부터 다시 합니다.');
 takeDamage(6,5);log('붉은 고래의 열기가 배를 달굽니다. (가열도 '+heat()+')');if(!safeCheck())return;
 setTimeout(()=>{G.failing=false;if(G.mode&&!G.done)startArm(0,.3);},1500);
}

/* ---------- ① 연타 ---------- */
function mashPress(){
 const t=now();if(G.mode!=='p1'||G.done||G.phaseState!=='play')return;
 const m=MASH[G.arm];G.gauge=Math.min(100,G.gauge+m.add);G.lastPress=t;
 if(G.gauge>=100)killArm(t,G.arm===0?'밧줄이 팽팽해지더니 박힌 자리에서 팔이 끊어집니다!':'더 굵은 팔이 마침내 끊어집니다 · 1페이즈 통과');
}
/* ---------- ② 힘겨루기 ---------- */
function pullStart(y){if(G.mode!=='p2'||G.done||G.phaseState!=='play'||G.locked)return;G.pulling=true;G.pullY=y;G.tension=0;}
function pullMove(y){if(!G.pulling)return;G.tension=Math.max(0,Math.min(1,(y-G.pullY)/260+(G.joltOff||0)));}
function pullEnd(){
 if(!G.pulling)return;G.pulling=false;
 const t=now(),z=G.zone,v=G.tension;
 if(v>=z[0]&&v<=z[0]+z[1])killArm(t,G.arm===0?'알맞은 힘에서 손을 놓자 팔이 찢어집니다!':'발버둥 치던 팔이 찢어집니다 · 2페이즈 통과');
 else{flash(v<z[0]?'약함':'과함',false);setText(v<z[0]?'힘이 모자랐습니다 · 팔이 다시 당겨 갑니다.':'너무 세게 당겼습니다 · 밧줄이 미끄러집니다.');G.tension=0;}
}
/* ---------- ③ 피하는 팔 ---------- */
function newDir(t){
 const keys=Object.keys(VEC),d=keys[Math.floor(Math.random()*4)];
 const fake=G.arm===1?keys.filter(k=>k!==d)[Math.floor(Math.random()*3)]:null;
 const m=t+rnd(DIR.gapMin,DIR.gapMin+DIR.gapRand)+(fake?DIR.feint:0);
 G.dirPlan={d,fake,m,fakeAt:fake?m-DIR.feint:null,end:m+DIR.win*(G.ease||1)};
}
function dirPress(d){
 const t=now(),P=G.dirPlan;
 if(G.mode!=='p3'||G.done||G.phaseState!=='play'||!P||G.locked)return;
 if(t<P.m){failPhase(t,P.fake&&t>=P.fakeAt?'속임수에 걸렸습니다':'너무 일찍 겨눴습니다');return;}
 if(d!==OPP[P.d]){failPhase(t,'팔이 간 쪽으로 겨눴습니다 · 작살이 빗나갑니다');return;}
 G.rounds++;G.stabAt=t;G.stabTo=G.lastHand||[520,190];flash('적중',true);
 if(G.rounds>=DIR.need){G.dirNow=null;G.dirPlan=null;killArm(t+.25,G.arm===0?'네 번 모두 피할 곳을 막았습니다 · 팔이 꿰뚫려 끊어집니다!':'속임수를 꿰뚫어 봤습니다 · 3페이즈 통과');return;}
 setText('적중 · '+(DIR.need-G.rounds)+'번 남았습니다');newDir(t+.3);
}
/* ---------- ④ 빨판 순서 · 균열 ---------- */
function suckClick(x,y){
 const S=G.suck;if(G.mode!=='p4'||G.arm!==0||!S||S.phase!=='recall'||G.done||G.locked)return;
 const V=window.RedWhaleV3&&RedWhaleV3.SUCK;const P=V||[];
 let best=-1,bd=1e9;P.forEach((p,i)=>{if(S.done.includes(i)||!S.order.includes(i))return;const d=Math.hypot(p[0]-x,p[1]-y);if(d<bd){bd=d;best=i;}});
 if(best<0||bd>40*(G.ease||1))return;
 const want=S.order[S.done.length];
 if(best!==want){failPhase(now(),'다른 빨판을 떼어 냈습니다 · 붙은 빨판들이 배를 달굽니다');return;}
 S.done.push(best);flash('떼어냄',true);
 if(S.done.length>=SUCKN)killArm(now(),'빨판 네 개를 순서대로 모두 떼어 냈습니다 · 팔이 떨어져 나갑니다!');
 else setText('떼어냄 · '+(SUCKN-S.done.length)+'개 남았습니다');
}
function crackDown(x,y){
 const C=G.crack;if(G.mode!=='p4'||G.arm!==1||!C||G.done||G.locked)return;
 const pts=window.RedWhaleV3.CRACKS3[C.idx];
 if(Math.hypot(pts[0][0]-x,pts[0][1]-y)<=CRACK.tol*1.3*(G.ease||1)){C.drag=true;C.prog=0;}
}
function distToSeg(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy||1;let u=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l;u=Math.max(0,Math.min(1,u));return [Math.hypot(p[0]-a[0]-u*dx,p[1]-a[1]-u*dy),u];}
function crackMove(x,y){
 const C=G.crack;if(!C||!C.drag)return;
 const pts=window.RedWhaleV3.CRACKS3[C.idx];let best=1e9,along=0,total=0;const lens=[];
 for(let i=1;i<pts.length;i++){lens.push(Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));total+=lens[i-1];}
 let acc=0;for(let i=1;i<pts.length;i++){const [d,u]=distToSeg([x,y],pts[i-1],pts[i]);if(d<best){best=d;along=(acc+u*lens[i-1])/total;}acc+=lens[i-1];}
 if(best>CRACK.tol*(G.ease||1)){C.drag=false;C.prog=0;flash('벗어남',false);setText('균열에서 벗어났습니다 · 시작점부터 다시 끄십시오.');return;}
 if(along>C.prog&&along-C.prog<.35)C.prog=along;
 if(C.prog>=.97){C.drag=false;C.idx++;C.prog=0;flash('찢음',true);
  if(C.idx>=CRACKN)killArm(now(),'두 갈래 균열을 모두 따라 찢었습니다 · 마지막 팔이 끊어집니다!');
  else{setText('균열 하나를 찢었습니다 · '+(CRACKN-C.idx)+'개 남았습니다');C.deadline=now()+CRACK.limit*(G.ease||1);}}
}
function crackUp(){const C=G.crack;if(C&&C.drag){C.drag=false;if(C.prog<.97){C.prog=0;setText('손을 뗐습니다 · 균열의 시작점부터 다시 끄십시오.');}}}

/* ---------- 매 프레임 ---------- */
function tickGame(t,dt){
 const ph=+G.mode.slice(1);
 if(G.killAt!=null||G.failing)return;
 if(G.phaseState==='intro'&&t>=G.at+(ph<=2?1.45:ph===3?1.0:.9)){
  G.phaseState='play';
  if(ph===1){const m=MASH[G.arm];G.gauge=12;G.limit=m.limit*(G.ease||1);G.deadline=t+G.limit;G.hint='연타! · 스페이스 / 화면 아무 곳이나';G.hintNow=true;}
  if(ph===2){G.zone=PULL.zone[G.arm].slice();G.deadline=t+PULL.limit*(G.ease||1);G.zone[1]*=Math.min(1.4,G.ease||1);G.hint='누른 채 아래로 끌어 당기기 · 노란 구간에서 손을 떼기';G.hintNow=true;G.joltNext=t+rnd(1.2,2);}
  if(ph===3){G.rounds=0;newDir(t);G.hint='팔이 움직이는 반대쪽 방향키(▲▼◀▶)';}
  if(ph===4&&G.arm===0){const order=[0,1,2,3,4,5,6,7].sort(()=>Math.random()-.5).slice(0,SUCKN);G.suck={order,done:[],phase:'show',showAt:t+.3};G.hint='빨판이 붙는 순서를 기억하십시오 (4초)';}
  if(ph===4&&G.arm===1){G.crack={idx:0,prog:0,drag:false,deadline:t+CRACK.limit*(G.ease||1)};G.hint='빛나는 시작점부터 균열을 따라 끌기 (2개)';G.hintNow=true;}
  return;
 }
 if(G.phaseState!=='play')return;
 if(ph===1){G.gauge=Math.max(0,G.gauge-MASH[G.arm].decay*dt);if(t>G.deadline)failPhase(t,'팔을 끊어 내지 못했습니다');}
 if(ph===2){
  if(false){
   if(t>=G.joltNext){G.joltAt=t;G.joltOff=(Math.random()<.5?-1:1)*rnd(.12,.22);G.joltNext=t+rnd(1.3,2.2);flash('발버둥',false);}
   if(G.joltOff){G.joltOff*=Math.pow(.2,dt);if(G.pulling)G.tension=Math.max(0,Math.min(1,G.tension+G.joltOff*dt*3));}}
  if(t>G.deadline){G.pulling=false;failPhase(t,'힘겨루기에서 밀렸습니다');}
 }
 if(ph===3&&G.dirPlan){
  const P=G.dirPlan;
  if(t>=P.end){failPhase(t,'팔이 작살을 피했습니다');return;}
  if(P.fake&&t>=P.fakeAt&&t<P.m)G.dirNow={vec:VEC[P.fake],u:Math.min(1,(t-P.fakeAt)/.25),fake:true};
  else if(t>=P.m)G.dirNow={vec:VEC[P.d],u:Math.min(1,(t-P.m)/.2),fake:false};
  else G.dirNow=null;
  G.hintNow=t>=P.m;
 }
 if(ph===4&&G.arm===0&&G.suck){
  const S=G.suck;
  if(S.phase==='show'&&t>=S.showAt+SHOW){S.phase='recall';S.deadline=t+RECALL*(G.ease||1);G.hint='같은 순서로 빨판을 누르기 (16초)';G.hintNow=true;}
  if(S.phase==='recall'&&t>S.deadline)failPhase(t,'시간 안에 빨판을 떼어 내지 못했습니다');
 }
 if(ph===4&&G.arm===1&&G.crack&&t>G.crack.deadline)failPhase(t,'균열을 다 찢기 전에 팔이 배를 조여 왔습니다');
}
let lastTick=0;
function tick(ms){
 const dt=lastTick?Math.min(.1,(ms-lastTick)/1000):0;lastTick=ms;
 if(G.mode&&!G.done&&G.t0&&isRedBattle()){try{tickGame(now(),dt);}catch(e){console.warn('붉은 고래 팔',e);}}
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------- 화면 ---------- */
function panel(no,title,desc,small,body){
 return '<div class="inset warning rwg-panel"><div class="small">재앙의 고래 · '+esc(WHALES[RED].name)+' · '+no+'단계</div><h2>'+title+'</h2>'+
  '<p>'+desc+'</p><p id="rwgStatus">'+statusTags()+'</p>'+
  '<p class="muted">페이즈를 넘기지 못하면 가열도 +50 · 가열도 100이면 배 전체가 녹아 사망</p>'+
  '<div class="coinpanel"><div class="small">'+small+'</div>'+body+'<p id="rwgText">'+esc(G.text||'')+'</p></div></div>';
}
function gamePanel(mode){
 if(mode==='p1')return panel(2,'1페이즈 · 작살과 연타','작살이 팔을 꿰뚫었습니다. 팔은 살아 있는 인어이자 고래의 몸입니다. 밧줄을 끌어당기는 팔을 연타로 끊어 내십시오. 두 번째 팔은 더 굵습니다.',
  '스페이스 / 이펙트 화면 아무 곳이나 / 아래 버튼 연타 · 시간 안에 게이지를 끝까지 · 팔 2개',
  '<button type="button" class="danger rwg-big" id="rwgAct">밧줄을 당긴다 (연타)</button>');
 if(mode==='p2')return panel(3,'2페이즈 · 힘겨루기','작살이 박힌 팔과 힘을 겨룹니다. 게이지가 알맞은 힘(노란 구간)에 닿았을 때 손을 떼면 팔이 찢어집니다. 두 번째 팔도 같은 방법으로 찢어 내십시오.',
  'PC: 이펙트 화면에서 마우스를 누른 채 아래로 끌어 당기고 노란 구간에서 놓기 · 휴대폰: 손가락으로 아래로 끌었다가 놓기 · 팔 2개',
  '');
 if(mode==='p3')return panel(4,'3페이즈 · 피하는 팔','작살을 맞추려는 순간 팔이 피하려 합니다. 팔이 움직이는 방향의 반대쪽으로 겨눠 4번 맞히면 팔이 부서집니다. 두 번째 팔은 잠깐 반대로 움직이는 척 속입니다. 실제로 움직이는 것을 보고 누르십시오.',
  'PC: 방향키(또는 W A S D) · 휴대폰: 이펙트 화면 안의 ▲▼◀▶ 버튼 · 너무 이르거나 틀리면 실패 · 팔 2개',
  '<div class="rwg-dpad-panel"><button type="button" data-dir="up">▲</button><button type="button" data-dir="left">◀</button><button type="button" data-dir="right">▶</button><button type="button" data-dir="down">▼</button></div>');
 if(mode==='p4')return panel(5,'4페이즈 · 배에 붙은 팔','작살을 맞추기도 전에 팔이 배에 달라붙어 배를 공격합니다. 빨판 네 개가 붙는 순서를 기억했다가 똑같은 순서로 떼어 내고, 마지막 팔은 두 갈래 균열을 따라 찢어 내십시오.',
  '빨판: 4초 동안 순서를 보여 준 뒤 16초 안에 같은 순서로 누르기 · 균열: 빛나는 시작점부터 끝까지 누른 채 따라 끌기 ×2 (PC: 왼쪽 버튼 / 휴대폰: 손가락 하나)',
  '');
 return '';
}
function sceneMarkup(n,game){return window.RedWhaleV3?window.RedWhaleV3.html(n,game?{game:true}:null):'';}
const previousPlay=renderPlay;
renderPlay=function(){
 if(stage()===null&&state.redHeat024&&state.scene!=='battle')state.redHeat024=0;
 syncGame();
 const n=stage();
 if(n===null)return previousPlay();
 if(n===4&&!isRedBattle()){
  return sceneMarkup(4)+
   '<div class="inset"><h2>'+esc(WHALES[RED].name)+' · 사냥 성공</h2>'+
   '<p>여덟 번째 팔이 끊어졌습니다. 팔 하나하나가 살아 있는 인어였고, 고래의 몸이었습니다. 더는 물 위로 아무것도 솟지 않습니다. 붉은 등이 소리 없이 가라앉고, 열기가 물러나며 물이 천천히 다시 차오릅니다. 그것의 온몸이 어떤 모습이었는지는 끝내 아무도 보지 못했습니다.</p>'+
   '<p class="muted">전리품과 사냥 업적은 기존 판정대로 지급되었습니다.</p>'+
   button('사냥을 마치고 항해 계속하기','redWhaleContinue023','','primary')+'</div>';
 }
 const mode=gameMode();
 if(mode)return sceneMarkup(n,true)+gamePanel(mode);
 return sceneMarkup(n)+previousPlay();
};
const previousHunt=huntWhale;
huntWhale=function(){
 const red=state.scene==='encounter'&&state.encounter===RED;
 const r=previousHunt.apply(this,arguments);
 if(red&&isRedBattle()){state.battle.need=4;state.redHeat024=0;sync();}
 return r;
};
const previousCoin=resolveCoin;
resolveCoin=function(win){
 const b=state.battle;
 const success=!!(win&&b&&b.type==='whale'&&b.index===RED&&b.won+1>=b.need);
 if(success)state.redWhaleFinal023=true;
 const result=previousCoin(win);
 if(success&&state.scene==='dead')state.redWhaleFinal023=false;
 if(success)state.redHeat024=0;
 return result;
};

/* ---------- 입력 ---------- */
function svgPoint(scene,ev){
 const svg=scene.querySelector('svg');if(!svg||!svg.getScreenCTM)return null;
 const pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;const m=svg.getScreenCTM();if(!m)return null;const p=pt.matrixTransform(m.inverse());return [p.x,p.y];
}
document.addEventListener('pointerdown',function(ev){
 if(!G.mode)return;
 const t=ev.target;
 const db=t.closest&&t.closest('[data-dir]');
 if(db&&G.mode==='p3'){ev.preventDefault();dirPress(db.dataset.dir);return;}
 if(t.closest&&t.closest('#rwgAct')){ev.preventDefault();if(G.mode==='p1')mashPress();return;}
 const scene=t.closest&&t.closest('.rw3-scene[data-game]');
 if(!scene)return;
 ev.preventDefault();
 const p=svgPoint(scene,ev);
 if(G.mode==='p1')mashPress();
 else if(G.mode==='p2'&&p){pullStart(p[1]);try{scene.setPointerCapture(ev.pointerId);}catch(e){}}
 else if(G.mode==='p4'&&p){if(G.arm===0)suckClick(p[0],p[1]);else{crackDown(p[0],p[1]);try{scene.setPointerCapture(ev.pointerId);}catch(e){}}}
});
document.addEventListener('pointermove',function(ev){
 if(!G.mode)return;
 if(!(G.pulling||(G.crack&&G.crack.drag)))return;
 const scene=document.querySelector('.rw3-scene[data-game]');if(!scene)return;
 const p=svgPoint(scene,ev);if(!p)return;
 if(G.pulling)pullMove(p[1]);
 if(G.crack&&G.crack.drag)crackMove(p[0],p[1]);
});
['pointerup','pointercancel'].forEach(n=>document.addEventListener(n,function(){if(!G.mode)return;if(G.pulling)pullEnd();crackUp();}));
const isField=e=>e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]');
document.addEventListener('keydown',function(e){
 if(!G.mode||isField(e)||e.repeat)return;
 if(G.mode==='p1'&&e.code==='Space'){e.preventDefault();mashPress();return;}
 if(G.mode==='p3'&&KEYDIR[e.code]){e.preventDefault();dirPress(KEYDIR[e.code]);}
});
document.addEventListener('click',function(e){
 const b=e.target?.closest?.('button[data-act]');
 if(!b||b.disabled||busy)return;
 if(b.dataset.act==='redWhaleContinue023'&&state.redWhaleFinal023&&state.scene!=='dead'){state.redWhaleFinal023=false;sync();}
});
if(state.redWhaleFinal023&&(!state.sea||state.scene==='dead'||state.current==null)){state.redWhaleFinal023=false;save();}
render();
window.RED_WHALE_HUNT_024={jumpArm(ix){if(G.mode){startArm(ix,.3);render();}},stage,labels,game:G,mashPress,pullStart,pullMove,pullEnd,dirPress,suckClick,crackDown,crackMove,crackUp,OPP};
})();
