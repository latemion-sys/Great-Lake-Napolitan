/* 모든 것을 가라앉히는 노란 고래 · v0.2.4 다섯 단계
   버뮤다 삼각지대처럼, 황토빛 등껍질 위 황금빛 따개비 같은 열수공 셋이 이루는 삼각형 안쪽의 모든 것을 빨아들여 가라앉힌다.
   ① 가라앉는 삼각형 : 조우 (사냥 / 회피)
   ②③④ 열수공 : 열수공 하나가 주기적으로 섬처럼 솟는다. 덮개가 떨리다 황금빛 중심부가 열리는 순간 그 열수공에 작살을 꽂는다.
            너무 일찍 쏘면 껍데기에 튕긴다. 남은 열수공이 적을수록 열려 있는 시간이 짧다(1.1초 → 0.8초 → 0.55초).
   ⑤ 따개비 껍데기 : 부서진 열수공의 껍데기가 물길을 따라 가라앉는다. 작살을 꽂아 건져 올리면 토벌(고래는 삼백 년 동안 가라앉는다).
   흡입 위험: 남은 열수공 수만큼 계속 오르고, 튕기거나 놓치면 더 오른다. 열수공을 부수면 내려간다. 100%가 되면 배가 빨려 들어가 사망.
   ⑤의 실패(껍데기가 다 가라앉음)는 공통 규칙(MinigameStrikes).
   고래 전투는 기존 'whale' 전투(유효 타격 4: 열수공 셋 · 껍데기)를 그대로 쓰므로 전리품·업적·처치 기록은 기존대로 지급된다. */
(function(){
'use strict';
const YELLOW=4,SEA=336;
const labels=['가라앉는 삼각형','첫 번째 열수공','두 번째 열수공','세 번째 열수공','따개비 껍데기'];
const OPEN=[0,.55,.8,1.1];                // 남은 열수공 수 → 열려 있는 시간
const SUCK={rate:.95,bounce:12,miss:8,breakDrop:30};
const HOOK={fly:.45,tol:48,dur:9.5};
const G=window.YellowHuntGame=window.YellowHuntGame||{mode:null};
const EASE=()=>(window.CalamityMang?window.CalamityMang.ease():1);
const GEO=()=>window.YellowWhaleV3&&window.YellowWhaleV3.geo;
const MS=()=>window.MinigameStrikes;
const rnd=(a,b)=>a+Math.random()*(b-a);
function isYellowBattle(){const b=state.battle;return state.scene==='battle'&&b&&b.type==='whale'&&b.index===YELLOW;}
function gameMode(){if(!isYellowBattle()||state.battle.need!==4)return null;return (Number(state.battle.won)||0)>=3?'hook':'vent';}
function stage(){
 if(state.scene==='dead'||!state.sea||state.current==null)return null;
 if(state.yellowWhaleFinal024===true&&state.scene!=='battle')return 5;
 if(state.scene==='encounter'&&state.encounter===YELLOW)return 0;
 if(isYellowBattle())return Math.max(1,Math.min(4,(Number(state.battle.won)||0)+1));
 return null;
}
function now(){return G.t0?(performance.now()-G.t0)/1000:0;}
function broken(){const b=state.yellowBroken024;return Array.isArray(b)&&b.length===3?b:(state.yellowBroken024=[false,false,false]);}
function remaining(){return broken().filter(x=>!x).length;}

/* ---------- 상태 ---------- */
function syncGame(){
 const mode=gameMode();
 if(mode&&(G.mode!==mode||G.ref!==state.battle||G.won!==state.battle.won)){
  for(const k of Object.keys(G))delete G[k];
  Object.assign(G,{mode,ref:state.battle,won:state.battle.won,t0:performance.now(),done:null,text:'',ease:EASE(),fails:0,stageNo:(Number(state.battle.won)||0)+1});
  if(mode==='vent'){G.broken=broken().slice();G.brokeAt=G.broken.map(b=>b?-9:null);G.suck=Math.max(0,+state.yellowSuck024||0);G.last=-1;newCycle(.6);}
  if(mode==='hook'){G.broken=[true,true,true];newShell(1);}
 }
 if(!mode&&G.mode&&!G.timer){G.mode=null;G.ref=null;}
}
function setText(t){G.text=t;const e=document.getElementById('ywgText');if(e)e.textContent=t;}
function flash(text,good){G.flash={at:now(),text,good};}
function statusTags(){return tag('침식 '+(state.exposure||0)+' / 100')+' '+tag('정신력 '+state.mind+' / 100')+' '+tag('흡입 위험 '+Math.round(G.suck!=null?G.suck:(+state.yellowSuck024||0))+'%')+' '+tag('남은 열수공 '+remaining()+' / 3');}
function updateStatus(){const s=document.getElementById('ywgStatus');if(s)s.innerHTML=statusTags();if(MS())MS().refresh(G);}
function finish(after){
 G.done='ok';busy=true;const ref=state.battle;
 G.timer=setTimeout(()=>{G.timer=null;busy=false;if(state.battle!==ref)return;if(!isYellowBattle()){G.mode=null;return;}G.mode=null;resolveCoin(true);},after*1000);
}

/* ---------- ②③④ 열수공 ---------- */
function newCycle(delay){
 const left=[0,1,2].filter(i=>!G.broken[i]);if(!left.length)return;
 let pool=left.filter(i=>i!==G.last);if(!pool.length)pool=left;
 const i=pool[Math.floor(Math.random()*pool.length)],start=now()+delay,openAt=start+1.3+.7+rnd(0,.7),len=OPEN[left.length]*G.ease;
 G.cyc={i,start,openAt,openEnd:openAt+len,closeEnd:openAt+len+.35,end:openAt+len+1.7,shotAny:false};G.last=i;if(!(G.shot&&now()<G.shot.reelAt+G.shot.reelDur))G.shot=null;
}
function addSuck(v){G.suck=Math.max(0,Math.min(100,G.suck+v));state.yellowSuck024=Math.round(G.suck);}
function ventFire(i){
 if(G.mode!=='vent'||G.done||G.locked||G.tug)return;
 const t=now(),c=G.cyc;if(!c||G.shot&&t<G.shot.reelAt+G.shot.reelDur)return;
 if(i!=null&&i!==c.i)return;
 if(t<c.start+.8||t>c.closeEnd)return;               // 아직 솟지 않았거나 이미 내려감
 const g=GEO(),to=g.coreAt(c.i,1),open=t>=c.openAt&&t<c.openEnd;
 c.shotAny=true;
 G.shot={at:t,i:c.i,to,arrive:t+.45,hit:open,reelAt:t+(open?1.35:.95),reelDur:open?1.05:.8};   // 문구가 뜬 뒤 감아 들여 다시 장전
 if(open){
  G.locked=true;G.shot.reelAt=null;   // 박힌 채 밧줄로 이어짐 — 뜯어내기 미니게임이 끝날 때까지
  setTimeout(()=>{if(G.mode!=='vent'||G.done)return;
   flash('명중',true);startTug(c.i);},450);
  return;
 }
 setTimeout(()=>{if(G.mode!=='vent'||G.done)return;
  flash('튕김',false);addSuck(SUCK.bounce);takeDamage(0,3);updateStatus();
  setText(t<c.openAt?'너무 일찍 쐈습니다 · 닫힌 껍데기에 작살이 튕겨 나갑니다.':'덮개가 닫히는 중이었습니다 · 작살이 튕겨 나갑니다.');
  log('작살이 노란 고래의 열수공 껍데기에 튕겨 나갔습니다. 배가 삼각형 안쪽으로 끌려갑니다.');
  safeCheck();},450);
}
/* 명중 뒤: 박힌 작살로 열수공을 뜯어냄
   첫 번째 열수공 = 연타로 두 번 잡아당겨 뜯어냄 · 두 번째 = 달빛 막대 안에 작살 표식을 붙잡아 진행도 채우기 · 세 번째 = 방향 8개 두 바퀴 */
const TUG={mash:{add:8,decay:20,limit:6.5,need:2},fish:{bar:.3,prog0:.35,gain:.17,loss:.13,accel:.00026,vmax:.0085,turn:.010,lazy:60},arrows:{n:8,need:2,limit:9}};
const ARR=['up','down','left','right'];
function startTug(i){
 const t=now(),kind=['mash','fish','arrows'][Math.max(0,Math.min(2,(G.stageNo||1)-1))];
 G.hold={i,at:t};G.tug={kind,at:t};G.locked=false;
 if(kind==='mash'){Object.assign(G.tug,{v:10,round:0,deadline:t+TUG.mash.limit*G.ease});setText('작살이 박혔습니다 · 연타해서 열수공을 뜯어내십시오 (두 번 잡아당김)');}
 if(kind==='fish'){Object.assign(G.tug,{bar:.32,vel:0,icon:.46,iv:0,itgt:.46,prog:TUG.fish.prog0,hold:false,acc:0});setText('작살이 박혔습니다 · 누르고 있으면 달빛 막대가 떠오르고, 놓으면 가라앉습니다. 작살 표식을 막대 안에 붙잡아 두십시오.');}
 if(kind==='arrows'){newSeq(t,0);setText('작살이 박혔습니다 · 화살표 여덟 개를 차례로 입력해 밧줄을 비틀어 뜯어내십시오 (두 바퀴)');}
}
function newSeq(t,cyc){G.tug.seq=Array.from({length:TUG.arrows.n},()=>ARR[Math.floor(Math.random()*4)]);G.tug.idx=0;G.tug.cycle=cyc;G.tug.deadline=t+TUG.arrows.limit*G.ease;G.tug.err=null;}
function tugWin(){
 const i=G.hold.i,t=now();G.tug.done=true;
 G.broken[i]=true;G.brokeAt[i]=t;state.yellowBroken024=G.broken.slice();addSuck(-SUCK.breakDrop);updateStatus();
 G.shot.reelAt=t+.9;G.shot.reelDur=1.05;G.locked=true;flash('뜯어냄',true);
 const left=remaining();
 setText(left?'열수공을 통째로 뜯어냈습니다 · 남은 열수공 '+left+'개':'마지막 열수공을 뜯어냈습니다 · 물길이 느려집니다.');
 log('노란 고래의 열수공 하나를 작살로 뜯어냈습니다. (남은 열수공 '+left+')');
 finish(2.9);
}
function tugLose(why){
 const t=now(),i=G.hold.i;
 G.shot.reelAt=t+.15;G.shot.reelDur=.9;G.sinkVent={i,at:t};G.hold=null;G.tug=null;
 flash('빠짐',false);addSuck(SUCK.bounce);takeDamage(0,4);updateStatus();
 setText(why+' · 작살이 빠져나왔습니다. 감아 들여 다시 노리십시오.');
 log('작살이 노란 고래의 열수공에서 빠져나왔습니다. 배가 삼각형 안쪽으로 끌려갑니다.');
 if(!safeCheck())return;
 G.locked=true;setTimeout(()=>{G.locked=false;if(G.mode==='vent'&&!G.done)newCycle(.8);},1300);
}
function tugPress(){
 const T2=G.tug;if(G.mode!=='vent'||G.done||!T2||T2.done)return;
 if(T2.kind==='mash'){T2.v=Math.min(100,T2.v+TUG.mash.add);G.tugKick=now();
  if(T2.v>=100){T2.round++;if(T2.round>=TUG.mash.need){tugWin();return;}
   T2.v=12;T2.deadline=now()+TUG.mash.limit*G.ease;flash('헐거워짐',true);setText('열수공이 헐거워졌습니다 · 한 번 더 잡아당기십시오!');}}
}
function tugHold(on){const T2=G.tug;if(T2&&T2.kind==='fish')T2.hold=!!on;}
function tugArrow(d){
 const T2=G.tug;if(G.mode!=='vent'||G.done||!T2||T2.kind!=='arrows'||T2.done)return;
 if(T2.seq[T2.idx]===d){T2.idx++;G.tugKick=now();
  if(T2.idx>=T2.seq.length){const c=T2.cycle+1;if(c>=TUG.arrows.need){tugWin();return;}flash('한 바퀴',true);setText('한 바퀴 비틀었습니다 · 한 바퀴 더!');newSeq(now(),c);}}
 else{T2.err={at:now(),i:T2.idx};flash('어긋남',false);addSuck(6);T2.idx=0;setText('방향이 어긋났습니다 · 이번 바퀴를 처음부터 다시 입력하십시오.');}
}
function tugTick(t,dt){
 const T2=G.tug;if(!T2||T2.done)return;
 if(T2.kind==='mash'){T2.v=Math.max(0,T2.v-TUG.mash.decay*dt);if(t>T2.deadline)tugLose('잡아당기는 힘이 모자랐습니다');}
 if(T2.kind==='fish'){
  /* 스타듀 밸리 낚시와 같은 방식(초당 60번 고정 단계)
     · 막대: 누르고 있으면 위로 가속, 놓으면 아래로 가속(관성이 있어 천천히 붙고 천천히 멈춤) · 바닥에 닿으면 조금 튀어 오름 · 천장에서는 멈춤
     · 작살 표식(고래): 가끔 새 목표 높이를 정하고 그쪽으로 부드럽게 끌려감
     · 진행도: 표식이 막대 안이면 차오르고, 밖이면 빠짐 */
  const F=TUG.fish;T2.acc=(T2.acc||0)+dt;
  while(T2.acc>=1/60){T2.acc-=1/60;
   T2.vel+=(T2.hold?1:-1)*F.accel;
   if(T2.hold&&T2.vel<0)T2.vel+=F.accel*.5;          // 누르는 순간 떨어지던 힘을 조금 더 빨리 잡아 줌
   if(!T2.hold&&T2.vel>0)T2.vel-=F.accel*.3;
   T2.vel=Math.max(-F.vmax,Math.min(F.vmax,T2.vel));
   T2.bar+=T2.vel;
   if(T2.bar<0){T2.bar=0;T2.vel=-T2.vel*.45;if(Math.abs(T2.vel)<F.accel*2)T2.vel=0;}
   if(T2.bar>1-F.bar){T2.bar=1-F.bar;T2.vel=0;}
   if(Math.random()<F.turn){const span=.15+Math.random()*.45;T2.itgt=Math.max(.04,Math.min(.96,T2.icon+(Math.random()<.5?-1:1)*span));}
   if(Math.abs(T2.itgt-T2.icon)>.004){const ac=(T2.itgt-T2.icon)/(F.lazy+Math.random()*30);T2.iv+=(ac-T2.iv)/5;}else T2.iv*=.9;
   T2.icon=Math.max(.02,Math.min(.98,T2.icon+T2.iv));
   const inBar=T2.icon>=T2.bar-.01&&T2.icon<=T2.bar+F.bar+.01;T2.inBar=inBar;
   T2.prog=Math.min(1,Math.max(0,T2.prog+(inBar?F.gain*G.ease:-F.loss/G.ease)/60));
  }
  if(T2.prog>=1)tugWin();else if(T2.prog<=0)tugLose('작살 표식을 놓쳤습니다');
 }
 if(T2.kind==='arrows'&&t>T2.deadline)tugLose('시간 안에 비틀지 못했습니다');
}
function ventTick(t,dt){
 const left=G.broken.filter(x=>!x).length;
 if(!G.locked)addSuck(SUCK.rate*left*dt*(G.tug?.5:1));
 if(G.tug)tugTick(t,dt);
 if(G.suck>=100){
  if(MS()&&MS().noDeath()){G.suck=40;state.yellowSuck024=40;log('[테스트] 사망 대신 흡입 위험을 되돌립니다.');return;}
  G.done='dead';G.sinkAt=t;busy=true;setText('흡입 위험 100% · 배가 삼각형 한가운데로 빨려 들어갑니다.');
  G.timer=setTimeout(()=>{G.timer=null;busy=false;G.mode=null;state.yellowSuck024=0;log('배가 노란 고래의 삼각형 한가운데로 빨려 들어가 가라앉았습니다.');die();},3000);
  return;
 }
 const c=G.cyc;
 if(c&&!G.locked&&!G.tug&&t>c.end){
  if(!c.shotAny){addSuck(SUCK.miss);flash('놓침',false);setText('중심부가 열린 순간을 놓쳤습니다 · 열수공이 다시 가라앉습니다.');}
  newCycle(.7+rnd(0,.6));
 }
 if(Math.floor(t*4)!==G._st){G._st=Math.floor(t*4);updateStatus();}
}

/* ---------- ⑤ 따개비 껍데기 ---------- */
function newShell(delay){
 G.shell={t0:now()+delay,dur:HOOK.dur*G.ease,a0:rnd(0,6.28),w:rnd(.38,.55)*(Math.random()<.5?-1:1),r0:rnd(110,150)};
 G.throw=null;G.caught=null;G.locked=false;
}
function hookThrow(x,y){
 if(G.mode!=='hook'||G.done||G.locked||G.caught)return;
 const t=now();if(G.throw&&t<G.throw.arrive+.3+.15+.9+.1)return;   // 빗나간 작살을 감아 들여 다시 장전할 때까지
 if(t<G.shell.t0)return;
 const to=[Math.max(20,Math.min(940,x)),Math.max(SEA+8,Math.min(H_MAX(),y))];
 G.throw={at:t,arrive:t+HOOK.fly,to};
 setTimeout(()=>{if(G.mode!=='hook'||G.done||G.caught)return;
  const ta=now(),p=GEO().shellAt(G,G.throw.arrive);
  if(p&&p.d<1&&Math.hypot(p.x-to[0],(p.y-to[1])*1.4)<=HOOK.tol*G.ease){
   G.caught={at:ta,p:[p.x,p.y],d:p.d};G.locked=true;flash('건짐',true);
   setText('작살이 따개비 껍데기에 꽂혔습니다 · 밧줄을 당겨 껍데기째 감아 올립니다.');log('노란 고래의 따개비 껍데기를 작살로 꿰어 건져 올렸습니다.');finish(2.4);
  }else{flash('빗나감',false);setText('작살이 빈 물에 떨어졌습니다 · 감아 들여 다시 장전합니다. 껍데기가 갈 자리를 노리십시오.');}
 },HOOK.fly*1000);
}
function H_MAX(){return SEA+160;}
function hookTick(t){
 if(G.locked||G.caught)return;
 const p=GEO()&&GEO().shellAt(G,t);
 if(p&&p.d>=1){
  G.locked=true;flash('가라앉음',false);
  const r=MS()?MS().strike(G):'retry';
  if(r==='dead'){G.done='dead';busy=true;setText('껍데기가 가라앉았습니다 · 물길이 배를 끌어당깁니다.');
   G.timer=setTimeout(()=>{G.timer=null;busy=false;G.mode=null;log('따개비 껍데기를 건지지 못하는 사이 배가 노란 고래의 물길에 끌려 가라앉았습니다.');die();},2400);return;}
  takeDamage(6,5);log('따개비 껍데기가 물길 깊이 가라앉았습니다. 다른 조각이 떠오릅니다.');updateStatus();if(!safeCheck())return;
  setText('껍데기가 가라앉았습니다 · 다른 조각이 떠오릅니다. 남은 기회 '+MS().left(G)+'번');
  setTimeout(()=>{if(G.mode==='hook'&&!G.done)newShell(.6);},1600);
 }
}

let lastTick=0;
function tick(ms){
 const dt=lastTick?Math.min(.1,(ms-lastTick)/1000):0;lastTick=ms;
 if(G.mode&&!G.done&&G.t0&&isYellowBattle()){
  const t=now();
  try{if(G.mode==='vent')ventTick(t,dt);else if(G.mode==='hook')hookTick(t);}catch(e){console.warn('노란 고래',e);}
 }
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------- 화면 ---------- */
function panel(no,title,desc,small,body){
 return '<div class="inset warning ywg-panel"><div class="small">재앙의 고래 · '+esc(WHALES[YELLOW].name)+' · '+no+'단계</div><h2>'+title+'</h2>'+
  '<p>'+desc+'</p><p id="ywgStatus">'+statusTags()+'</p>'+
  (no===5&&MS()?MS().livesHtml(G):'<p class="muted">흡입 위험이 100%가 되면 배가 삼각형 한가운데로 빨려 들어가 사망합니다.</p>')+
  '<div class="coinpanel"><div class="small">'+small+'</div>'+body+'<p id="ywgText">'+esc(G.text||'')+'</p></div></div>';
}
function gamePanel(mode){
 if(mode==='vent'){const n=G.stageNo||1,left=remaining();
  const TT=["명중하면 박힌 작살을 연타로 잡아당겨 열수공을 통째로 뜯어냅니다. 두 번 잡아당겨야 뜯어집니다.", "명중하면 오른쪽에 창이 뜹니다. 누르고 있으면 달빛 막대가 떠오르고, 놓으면 가라앉습니다. 작살 표식이 달빛 막대 안에 있으면 진행도가 차오릅니다. 가득 차면 뜯어지고, 비면 작살이 빠집니다.", "명중하면 화살표 여덟 개가 뜹니다. 차례대로 입력하면 한 바퀴, 두 바퀴를 비틀면 뜯어집니다. 틀리면 그 바퀴를 처음부터 다시 합니다."],KK=["연타: 스페이스 / 이펙트 화면 / 아래 버튼", "달빛 막대: 스페이스 · 이펙트 화면 · 아래 버튼을 누르고 있기 / 놓기", "방향: PC 방향키(또는 W A S D) · 휴대폰 화면 안의 ▲▼◀▶ 버튼"];
  return panel(n+1,['첫 번째','두 번째','세 번째'][n-1]+' 열수공',
   '황토빛 등껍질 위 열수공 하나가 섬처럼 솟습니다. 좁혀 오는 고리가 황금빛 중심부에 닿는 순간(덮개가 열릴 때) 망 감긴 작살을 꽂으십시오. '+TT[n-1],
   '① 고리가 중심부에 닿을 때 열수공을 누르기 · 스페이스 · 아래 버튼 (너무 일찍 쏘면 튕김) ② '+KK[n-1]+' · 흡입 위험이 100%가 되면 사망',
   '<button type="button" class="danger ywg-big" id="ywgAct">작살 · 잡아당기기</button>');}
 if(mode==='hook')return panel(5,'따개비 껍데기',
  '세 열수공이 모두 부서졌습니다. 마지막으로 부서진 열수공의 따개비 껍데기가 물길을 따라 돌며 가라앉습니다. 껍데기를 건져 올리면 그것은 더는 아무것도 가라앉히지 못합니다.',
  '껍데기가 갈 자리의 물을 눌러 작살 쏘기 · 작살은 '+HOOK.fly+'초 뒤에 닿음 · 빗나가면 감아 들여 다시 장전 · 껍데기가 다 가라앉으면 실패',
  '');
 return '';
}
function sceneMarkup(n,game){return window.YellowWhaleV3?window.YellowWhaleV3.html(n,game?{game:true}:null):'';}
const previousPlay=renderPlay;
renderPlay=function(){
 if(stage()===null&&state.scene!=='battle'&&(state.yellowSuck024||state.yellowBroken024)){state.yellowSuck024=0;state.yellowBroken024=null;}
 syncGame();
 const n=stage();
 if(n===null)return previousPlay();
 if(n===5){
  return sceneMarkup(5)+
   '<div class="inset"><h2>'+esc(WHALES[YELLOW].name)+' · 사냥 성공</h2>'+
   '<p>세 열수공이 부서지고 따개비 껍데기가 뱃전에 올라오자, 삼각형 안쪽으로 감겨 들던 물길이 멈췄습니다. 황토빛 등껍질이 물밑에서 천천히 멀어집니다. 그것은 이제 아무것도 가라앉히지 못한 채, 제 몸만 가라앉습니다. 삼백 년 동안.</p>'+
   '<p class="muted">전리품과 사냥 업적은 기존 판정대로 지급되었습니다.</p>'+
   button('사냥을 마치고 항해 계속하기','yellowWhaleContinue024','','primary')+'</div>';
 }
 const mode=gameMode();
 if(mode)return sceneMarkup(n,true)+gamePanel(mode);
 return sceneMarkup(n)+previousPlay();
};
const previousHunt=huntWhale;
huntWhale=function(){
 const y=state.scene==='encounter'&&state.encounter===YELLOW;
 const r=previousHunt.apply(this,arguments);
 if(y&&isYellowBattle()){state.battle.need=4;state.yellowSuck024=0;state.yellowBroken024=[false,false,false];sync();}
 return r;
};
const previousCoin=resolveCoin;
resolveCoin=function(win){
 const b=state.battle;
 const success=!!(win&&b&&b.type==='whale'&&b.index===YELLOW&&b.won+1>=b.need);
 if(success)state.yellowWhaleFinal024=true;
 const result=previousCoin(win);
 if(success&&state.scene==='dead')state.yellowWhaleFinal024=false;
 if(success){state.yellowSuck024=0;state.yellowBroken024=null;}
 return result;
};

/* ---------- 입력 ---------- */
function svgPoint(scene,ev){
 const svg=scene.querySelector('svg');if(!svg||!svg.getScreenCTM)return null;
 const pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;const m=svg.getScreenCTM();if(!m)return null;const p=pt.matrixTransform(m.inverse());return [p.x,p.y];
}
function ventAtPoint(x,y){
 const g=GEO();if(!g)return null;let best=null,bd=1e9;
 g.VENTS.forEach((v,i)=>{const d=Math.hypot(v.x-x,(v.y-60*v.s)-y)/v.s;if(d<bd){bd=d;best=i;}});
 return bd<=120*(G.ease||1)?best:null;
}
document.addEventListener('pointerdown',function(ev){
 if(!G.mode)return;
 const t=ev.target;
 const db=t.closest&&t.closest('[data-ydir]');if(db){ev.preventDefault();tugArrow(db.dataset.ydir);return;}
 if(t.closest&&t.closest('#ywgAct')){ev.preventDefault();if(G.mode==='vent'){if(G.tug){if(G.tug.kind==='fish')tugHold(true);else tugPress();}else ventFire(null);}return;}
 const scene=t.closest&&t.closest('.yw3-scene[data-game]');
 if(!scene)return;
 ev.preventDefault();
 const p=svgPoint(scene,ev);if(!p)return;
 if(G.mode==='vent'){if(G.tug){if(G.tug.kind==='fish')tugHold(true);else if(G.tug.kind==='mash')tugPress();return;}const i=ventAtPoint(p[0],p[1]);if(i!=null)ventFire(i);}
 else if(G.mode==='hook')hookThrow(p[0],p[1]);
});
const isField=e=>e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]');
['pointerup','pointercancel'].forEach(n=>document.addEventListener(n,()=>{if(G.mode==='vent')tugHold(false);}));
document.addEventListener('keyup',e=>{if(G.mode==='vent'&&e.code==='Space')tugHold(false);});
window.addEventListener('blur',()=>tugHold(false));
document.addEventListener('keydown',function(e){
 if(!G.mode||isField(e)||e.repeat)return;
 if(G.mode==='vent'){const K={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right'}[e.code];
  if(G.tug&&G.tug.kind==='arrows'&&K){e.preventDefault();tugArrow(K);return;}
  if(e.code==='Space'){e.preventDefault();if(G.tug){if(G.tug.kind==='fish')tugHold(true);else tugPress();}else ventFire(null);}}
});
document.addEventListener('click',function(e){
 const b=e.target?.closest?.('button[data-act]');
 if(!b||b.disabled||busy)return;
 if(b.dataset.act==='yellowWhaleContinue024'&&state.yellowWhaleFinal024&&state.scene!=='dead'){state.yellowWhaleFinal024=false;sync();}
});
if(state.yellowWhaleFinal024&&(!state.sea||state.scene==='dead'||state.current==null)){state.yellowWhaleFinal024=false;save();}
render();
window.YELLOW_WHALE_HUNT={stage,labels,game:G,ventFire,hookThrow,newCycle,newShell};
})();
