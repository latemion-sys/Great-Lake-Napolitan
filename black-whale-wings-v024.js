/* 모든 것을 감싸안는 검은 고래 · v0.2.4 다섯 단계
   그것은 온순하다. 작은 것을 보면 날개로 감싸 보호하지만, 감싸인 것들은 인어가 된다.
   몸 전체가 어둠에 덮여 보이지 않는다. 토벌하려면 날개를 접지 못하게 해야 한다.
   ① 별이 꺼지는 수평선 : 조우 (사냥 / 회피)
   ② 유인 : 지워진 별빛으로만 보이는 고래가 지나가는 길목에 작은 등불 뗏목을 던져 날개를 펼치게 한다.
            너무 가까우면 놀라고, 길목을 벗어나거나 지나간 자리면 알아채지 못한다 → 고래가 자리를 옮김(미끼 3개를 다 쓰면 고래가 떠남)
   ③ 관측 : 물밑으로 뻗는 두 날개 끝이 지나가며 부표를 끌어 기울이고, 멈춘 자리의 부표는 잠긴 채 흔들린다.
            양쪽 날개 끝이 멈춘 부표를 짚는다 · 지나가며 흔든 부표를 짚거나 너무 일찍 · 늦게 짚으면 날개 위치 오판
   ④ 고정 : 짚어 둔 두 부표의 공명 굽쇠를, 날개가 다 펼쳐지는 순간(고리가 굽쇠에 닿는 순간) 울린다.
            한쪽만 묶이면 풀린 날개가 배를 감싸 안음(포옹) → 선원 하나가 인어가 됨
   ⑤ 접지 못한 날개 : 양쪽 날개 끝에서 몸 한가운데로 모이는 굽쇠의 울림이 만나는 순간 작살 → 토벌(성공 장면으로 이어짐)
   ③④⑤의 실패는 공통 규칙(MinigameStrikes): 첫 실패는 피해 후 다시, 기회를 다 쓰면 사망.
   고래 전투는 기존 'whale' 전투(유효 타격 4: 유인 · 관측 · 고정 · 토벌)를 그대로 쓰므로 전리품·업적·처치 기록은 기존대로 지급된다. */
(function(){
'use strict';
const BLACK=3,SEA=336;
const labels=['별이 꺼지는 수평선','유인','관측','고정','접지 못한 날개'];
const LURE={tries:5,need:2,v:72,near:30,far:430,tol:58,fly:.7};   // 너그러운 길목 · 두 번 펼치게 해야 통과
const WATCH_NEED=2;
const WATCH={early:.3,late:2.6};
const FIX={win:.2,lead:1.7,gapMin:.35,gapRand:.8};
const STRIKE={win:.24,period:2.8,fly:.55};
const G=window.BlackHuntGame=window.BlackHuntGame||{mode:null};
const EASE=()=>(window.CalamityMang?window.CalamityMang.ease():1);
const V=()=>window.BlackWhaleV3&&window.BlackWhaleV3.v24;
const rnd=(a,b)=>a+Math.random()*(b-a);
const MS=()=>window.MinigameStrikes;
function isBlackBattle(){const b=state.battle;return state.scene==='battle'&&b&&b.type==='whale'&&b.index===BLACK;}
function gameMode(){if(!isBlackBattle()||state.battle.need!==4)return null;return ['lure','watch','fork','strike'][Math.max(0,Math.min(3,Number(state.battle.won)||0))];}
function stage(){
 if(state.scene==='dead'||!state.sea||state.current==null)return null;
 if(state.blackWhaleFinal===true&&state.scene!=='battle')return 4;
 if(state.scene==='encounter'&&state.encounter===BLACK)return 0;
 if(isBlackBattle())return Math.max(1,Math.min(4,(Number(state.battle.won)||0)+1));
 return null;
}
function now(){return G.t0?(performance.now()-G.t0)/1000:0;}

/* ---------- 상태 ---------- */
function syncGame(){
 const mode=gameMode();
 if(mode&&(G.mode!==mode||G.ref!==state.battle)){
  for(const k of Object.keys(G))delete G[k];
  Object.assign(G,{mode,ref:state.battle,t0:performance.now(),done:null,text:'',ease:EASE(),fails:0});
  if(mode==='lure'){Object.assign(G,{tries:LURE.tries,used:0});newWhale(.6);}
  if(mode==='watch'){G.marks={};G.ok={};newRound(.2);G.tether={fireAt:.7,endAt:null};}
  if(mode==='fork'){const w=state.blackWings024||{L:1,R:4};G.sideBuoy={L:w.L,R:w.R};G.win=FIX.win*G.ease;newFix(.2);G.tether={fireAt:.6,endAt:null};}
  if(mode==='strike'){const w=state.blackWings024||{L:1,R:4};G.sideBuoy={L:w.L,R:w.R};G.win=STRIKE.win*G.ease;G.meetAt=2.4;G.shot=null;}
 }
 if(!mode&&G.mode&&!G.timer){G.mode=null;G.ref=null;}
}
function setText(t){G.text=t;const e=document.getElementById('bkgText');if(e)e.textContent=t;}
function flash(text,good){G.flash={at:now(),text,good};}
function statusTags(){return tag('침식 '+(state.exposure||0)+' / 100')+' '+tag('정신력 '+state.mind+' / 100')+' '+tag('선원 '+(state.crew?state.crew.length:0)+'명');}
function updateStatus(){const s=document.getElementById('bkgStatus');if(s)s.innerHTML=statusTags();if(MS())MS().refresh(G);}
function finish(after){
 G.done='ok';busy=true;const ref=state.battle;
 G.timer=setTimeout(()=>{G.timer=null;busy=false;if(!isBlackBattle()||state.battle!==ref){G.mode=null;return;}G.mode=null;resolveCoin(true);},after*1000);
}
// 공통 실패: 피해 → 다시 / 기회를 다 쓰면 사망
function strike(h,m,logMsg,deathText){
 const r=MS()?MS().strike(G):'retry';
 if(r==='dead'){
  G.done='dead';busy=true;setText(deathText);
  G.timer=setTimeout(()=>{G.timer=null;busy=false;G.mode=null;log(logMsg+' 날개가 배를 통째로 감싸 안았습니다. 감싸인 것들은 모두 인어가 되었습니다.');die();},2200);
  return false;
 }
 takeDamage(h,m);if(logMsg)log(logMsg);updateStatus();
 if(!safeCheck())return false;
 return true;
}

/* ---------- ② 유인 ---------- */
function newWhale(delay){
 const t=now()+delay,dir=Math.random()<.5?1:-1,lane=rnd(SEA+30,SEA+122),sc=V()?V().PS(lane):1;
 G.whale={lane,dir,x0:dir>0?-170:1130,t0:t,v:LURE.v*(.55+.45*sc)*rnd(.9,1.12)};
 G.tether={fireAt:t+1.3,endAt:null};   // 떠오른 어둠에 망 감긴 작살을 박아 둠
 G.decoy=null;G.judged=false;G.locked=false;
}
function whaleNow(t){return V()&&G.whale?V().whaleAt(G.whale,t):null;}
function lureThrow(x,y){
 if(G.mode!=='lure'||G.done||G.locked||G.decoy)return;
 const t=now(),wp=whaleNow(t);
 if(!wp||wp.op<.35||!wp.moving){setText('고래가 보이지 않습니다 · 별빛이 지워진 자리가 다시 떠오르기를 기다리십시오.');return;}
 if(G.used>=G.tries)return;
 const to=[Math.max(20,Math.min(940,x)),Math.max(SEA+14,Math.min(SEA+150,y))];
 G.used++;G.aim={at:t,p:to};
 G.decoy={at:t,land:t+LURE.fly,from:G.hand||[V().LURE_BOAT+14,SEA-26],to};
 setText('작은 등불 뗏목을 던졌습니다.');
}
function lureJudge(t){
 const D=G.decoy,W=G.whale,wp=V().whaleAt(W,D.land);G.judged=true;
 const ahead=(D.to[0]-wp.x)*W.dir,laneOK=Math.abs(D.to[1]-W.lane)<=LURE.tol*G.ease*(.7+.3*wp.sc),near=LURE.near*(.6+.4*wp.sc)/G.ease;
 if(laneOK&&ahead>=near&&ahead<=LURE.far){
  const ta=D.land+Math.max(.2,(ahead-34*wp.sc)/W.v);W.stopAt=ta;W.spreadAt=ta;G.locked=true;
  setText('고래가 작은 불빛을 알아챘습니다 · 다가갑니다.');
  setTimeout(()=>{if(G.mode!=='lure'||G.done)return;flash('날개를 펼침',true);if(G.tether)G.tether.endAt=now()+1.5;G.tether&&(G.tether.free=(G.lured||0)+1<LURE.need);setText('그것이 작은 것을 감싸 안으려 날개를 펼쳤습니다 · 이제 날개는 물밑으로 뻗어 있습니다.');
   log('검은 고래가 작은 등불 뗏목을 감싸려 날개를 펼쳤습니다.');
   G.lured=(G.lured||0)+1;
   if(G.lured>=LURE.need){finish(3.8);return;}
   setText('날개를 한 번 펼쳤습니다 ('+G.lured+' / '+LURE.need+') · 그것이 뗏목을 감싼 채 물러납니다. 한 번 더 유인하십시오.');
   setTimeout(()=>{if(G.mode==='lure'&&!G.done){G.used=Math.max(0,G.used-1);newWhale(.6);}},3600);},Math.max(0,ta-now())*1000);
  return;
 }
 if(laneOK&&ahead>=0&&ahead<near){W.diveAt=D.land;lureFail(D.land,'놀람','너무 가까이 던졌습니다 · 고래가 놀라 물밑으로 자리를 옮깁니다');return;}
 W.diveAt=D.land+1.1;lureFail(D.land,'지나침',ahead<0?'이미 지나간 자리입니다 · 고래가 알아채지 못하고 자리를 옮깁니다':'길목을 벗어났습니다 · 고래가 알아채지 못하고 자리를 옮깁니다');
}
function lureFail(t,v,msg){
 G.locked=true;flash(v,false);G.joltAt=t;if(G.tether&&G.tether.endAt==null){G.tether.endAt=now()+.5;G.tether.free=true;}   // 자리를 옮기며 작살이 빠짐
 takeDamage(0,3);log('검은 고래가 미끼를 지나쳐 자리를 옮겼습니다. 어둠 속에서 방향을 다시 찾아야 합니다.');updateStatus();if(!safeCheck())return;
 if(G.used>=G.tries){
  setText(msg+' · 남은 미끼가 없습니다. 고래가 멀어집니다.');
  G.done='escape';busy=true;
  G.timer=setTimeout(()=>{G.timer=null;busy=false;G.mode=null;
   log('미끼를 모두 써 버렸습니다. 별빛이 지워진 자리가 수평선 너머로 멀어지고, 별이 하나씩 돌아옵니다.');
   state.battle=null;afterWhale(BLACK);},2600);
  return;
 }
 setText(msg+' · 남은 미끼 '+(G.tries-G.used)+'개');
 setTimeout(()=>{if(G.mode==='lure'&&!G.done)newWhale(.8);},2600);
}
function lureTick(t){
 if(G.decoy&&!G.judged&&t>=G.decoy.land)lureJudge(t);
 const wp=whaleNow(t);
 if(!G.decoy&&!G.locked&&wp&&wp.moving&&(G.whale.dir>0?wp.x>1160:wp.x<-200)){
  G.used++;G.whale.diveAt=t;lureFail(t,'지나감','미끼를 던지기 전에 고래가 지나가 버렸습니다');
 }
}

/* ---------- ③ 관측 ---------- */
function newRound(delay){
 const v=V(),B=v.BUOYS,t=now()+delay,start={L:[468,SEA+70],R:[492,SEA+70]};
 const tgt={L:Math.floor(Math.random()*3),R:3+Math.floor(Math.random()*3)};
 const paths={},arrive={};
 ['L','R'].forEach(side=>{
  const i=tgt[side],mid=[0,1,2].map(k=>side==='L'?k:k+3).filter(k=>k!==i&&(side==='L'?B[k][0]>B[i][0]:B[k][0]<B[i][0]));
  const pick=mid.sort(()=>Math.random()-.5).slice(0,Math.min(mid.length,1+Math.floor(Math.random()*2))).sort((a,b)=>side==='L'?B[b][0]-B[a][0]:B[a][0]-B[b][0]);
  const pts=[start[side]],ts=[t+(side==='L'?1:1)+rnd(0,.5)+(side==='R'?rnd(.3,1.4):0)];
  pick.concat([i]).forEach((k,j)=>{pts.push([B[k][0]+rnd(-5,5),B[k][1]+rnd(-3,3)]);ts.push(ts[ts.length-1]+rnd(1.05,1.45));});
  pts[pts.length-1]=[B[i][0],B[i][1]];
  paths[side]={pts,ts};arrive[side]=ts[ts.length-1];
 });
 Object.assign(G,{paths,arrive,target:tgt,ok:{},marks:{},reveal:null,locked:false,r0:0});
}
function watchTap(x,y){
 if(G.mode!=='watch'||G.done||G.locked||!G.paths)return;
 const v=V(),t=now();let best=-1,bd=1e9;
 v.BUOYS.forEach((b,i)=>{const sc=v.PS(b[1])*1.5,d=Math.hypot(b[0]-x,(b[1]-24*sc)-y)/sc;if(d<bd){bd=d;best=i;}});
 if(best<0||bd>58*G.ease)return;
 const side=best<3?'L':'R';if(G.ok[side])return;
 if(best===G.target[side]&&t>=G.arrive[side]-WATCH.early){
  G.ok[side]=true;G.marks[best]={};flash('날개 끝',true);
  if(G.ok.L&&G.ok.R){G.locked=true;G.wins=(G.wins||0)+1;
   if(G.wins<WATCH_NEED){setText('양쪽 날개 끝을 짚었습니다 ('+G.wins+' / '+WATCH_NEED+') · 날개가 다시 움직입니다. 한 번 더 읽으십시오.');setTimeout(()=>{if(G.mode==='watch'&&!G.done)newRound(.4);},1700);return;}
   state.blackWings024={L:G.target.L,R:G.target.R};
   setText('양쪽 날개 끝을 모두 짚었습니다 · 그 부표에 공명 굽쇠를 매답니다.');log('검은 고래의 두 날개 끝 자리를 부표로 짚었습니다.');if(G.tether)G.tether.endAt=now()+.3;finish(2.5);}
  else setText((side==='L'?'왼쪽':'오른쪽')+' 날개 끝을 짚었습니다 · 반대쪽을 읽으십시오.');
  return;
 }
 G.marks[best]={bad:true};
 watchFail(t,best===G.target[side]?'너무 일찍 짚었습니다 · 날개 끝이 아직 지나가는 중이었습니다':'지나가며 흔든 부표를 짚었습니다 · 날개 끝은 다른 곳에 있었습니다');
}
function watchFail(t,why){
 G.locked=true;G.reveal={at:t,L:G.target.L,R:G.target.R};flash('오판',false);G.joltAt=t;
 const ok=strike(7,5,'날개 위치를 잘못 짚었습니다. 물밑에서 솟은 날개 끝이 수면을 내려쳐 배가 크게 흔들립니다.','날개 위치를 잘못 짚었습니다 · 날개가 배 위로 휘어 듭니다.');
 if(!ok)return;
 setText(why+' · 남은 기회 '+MS().left(G)+'번');
 setTimeout(()=>{if(G.mode==='watch'&&!G.done)newRound(.4);},2300);
}
function watchTick(t){
 if(G.locked||!G.paths)return;
 for(const side of ['L','R'])if(!G.ok[side]&&t>G.arrive[side]+WATCH.late){watchFail(t,'날개 끝이 멈춘 자리를 놓쳤습니다 · 날개가 다시 움직입니다');return;}
}

/* ---------- ④ 고정 ---------- */
function newFix(delay){
 const t=now()+delay+FIX.lead+rnd(0,.6),first=Math.random()<.5?'L':'R',second=first==='L'?'R':'L';
 G.m={};G.m[first]=t;G.m[second]=t+FIX.gapMin+Math.random()*FIX.gapRand;
 G.st={L:{},R:{}};G.embraceAt=null;G.locked=false;G.resolved=false;
}
function forkPress(side){
 if(G.mode!=='fork'||G.done||G.locked||!G.st)return;
 const t=now(),F=G.st[side];if(!F||F.pinned||F.miss)return;
 const d=t-G.m[side];
 if(d<-1.3)return;                      // 날개가 아직 솟지 않았을 때는 무시
 if(Math.abs(d)<=G.win){F.pinned=true;F.ringAt=t;flash('묶음',true);setText((side==='L'?'왼쪽':'오른쪽')+' 날개를 펼친 채 묶었습니다.');}
 else{F.miss=true;F.ringAt=t;flash('헛울림',false);setText((side==='L'?'왼쪽':'오른쪽')+' 굽쇠가 너무 일찍 울렸습니다 · 울림이 날개 끝에 닿지 않습니다.');}
 fixResolve(t);
}
function fixResolve(t){
 const L=G.st.L,R=G.st.R,doneL=L.pinned||L.miss,doneR=R.pinned||R.miss;
 if(!(doneL&&doneR)||G.resolved)return;
 G.resolved=true;
 if(L.pinned&&R.pinned){G.locked=true;flash('날개를 묶음',true);
  setText('두 굽쇠가 같은 소리로 웁니다 · 그것은 날개를 접지 못합니다.');log('공명 굽쇠로 검은 고래의 두 날개를 펼친 채 묶었습니다.');if(G.tether)G.tether.endAt=now()+.4;finish(2.7);return;}
 G.locked=true;
 const at=Math.max(G.m.L,G.m.R)+G.win+.9;G.embraceAt=at;
 const one=L.pinned||R.pinned;
 setTimeout(()=>{if(G.mode!=='fork'||G.done)return;
  flash('포옹',false);G.joltAt=now();
  let who='';
  if(state.crew&&state.crew.length){const c=state.crew[Math.floor(Math.random()*state.crew.length)];state.crew=state.crew.filter(x=>x.id!==c.id);who=(typeof ROLE!=='undefined'&&ROLE[c.role]?ROLE[c.role].name:'선원')+' 한 명이 날개에 감싸여 인어가 되었습니다.';}
  const ok=strike(6,7,(one?'한쪽 날개만 묶였습니다. 풀린 날개가 배를 감싸 안았습니다. ':'두 날개가 모두 접혀 배를 감싸 안았습니다. ')+who,'날개가 배를 감싸 안습니다 · 아무것도 보이지 않습니다.');
  if(!ok)return;
  setText((one?'한쪽만 묶였습니다':'굽쇠가 날개를 묶지 못했습니다')+' · 포옹 — '+(who||'배가 어둠에 감싸였다 풀려납니다.')+' 남은 기회 '+MS().left(G)+'번');
  setTimeout(()=>{if(G.mode==='fork'&&!G.done)newFix(.3);},3400);
 },Math.max(0,at-now())*1000);
}
function forkTick(t){
 if(G.resolved||!G.st)return;
 ['L','R'].forEach(s=>{const F=G.st[s];if(!F.pinned&&!F.miss&&t>G.m[s]+G.win){F.miss=true;F.late=true;}});
 fixResolve(t);
}

/* ---------- ⑤ 접지 못한 날개 ---------- */
function strikeFire(){
 if(G.mode!=='strike'||G.done||G.locked)return;
 const t=now(),sh=G.shot;if(sh&&t<sh.reelAt+sh.reelDur)return;
 if(t<.8)return;
 const d=t-G.meetAt,hit=Math.abs(d)<=G.win;
 G.shot={at:t,arrive:t+STRIKE.fly,hit,reelAt:t+STRIKE.fly+.7,reelDur:.95};
 if(hit){
  G.locked=true;
  const V=window.BlackWhaleV3,T5=V&&V.v24&&V.v24.T5;
  if(V&&T5)V.resume={stage:4,start:G.t0+(t+STRIKE.fly)*1000-(T5.throwAt+T5.fly)*1000};
  setTimeout(()=>{if(G.mode!=='strike'||G.done)return;flash('토벌',true);
   setText('작살이 날개 사이의 아무것도 없는 곳으로 빨려 들어갑니다 · 어둠이 날개 끝에서부터 풀립니다.');log('펼쳐진 채 묶인 검은 고래의 몸 한가운데로 작살을 던졌습니다.');finish(2.4);},STRIKE.fly*1000);
  return;
 }
 setTimeout(()=>{if(G.mode!=='strike'||G.done)return;flash('빗나감',false);
  const ok=strike(5,5,(d<0?'울림이 모이기 전에 던졌습니다.':'울림이 흩어진 뒤에 던졌습니다.')+' 작살이 어둠을 지나 물에 떨어지고, 날개가 굽쇠를 밀어냅니다.','날개가 굽쇠를 끊고 배 위로 접혀 듭니다.');
  if(!ok)return;
  setText((d<0?'너무 일찍 던졌습니다':'너무 늦게 던졌습니다')+' · 작살을 감아 들입니다. 남은 기회 '+MS().left(G)+'번');
  G.meetAt=Math.max(G.meetAt+STRIKE.period,now()+2.4);},STRIKE.fly*1000);
}
function strikeTick(t){if(!G.locked&&!(G.shot&&t<G.shot.reelAt+G.shot.reelDur)&&t>G.meetAt+G.win+.3)G.meetAt+=STRIKE.period;}

let lastTick=0;
function tick(ms){
 lastTick=ms;
 if(G.mode&&!G.done&&G.t0&&isBlackBattle()){
  const t=now();
  try{if(G.mode==='lure')lureTick(t);else if(G.mode==='watch')watchTick(t);else if(G.mode==='fork')forkTick(t);else if(G.mode==='strike')strikeTick(t);}catch(e){console.warn('검은 고래',e);}
 }
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------- 화면 ---------- */
function panel(no,title,desc,small,body){
 return '<div class="inset warning bkg-panel"><div class="small">재앙의 고래 · '+esc(WHALES[BLACK].name)+' · '+no+'단계</div><h2>'+title+'</h2>'+
  '<p>'+desc+'</p><p id="bkgStatus">'+statusTags()+'</p>'+
  (no>=3&&MS()?MS().livesHtml(G):'')+
  '<div class="coinpanel"><div class="small">'+small+'</div>'+body+'<p id="bkgText">'+esc(G.text||'')+'</p></div></div>';
}
function gamePanel(mode){
 if(mode==='lure')return panel(2,'유인',
  '그것은 온순합니다. 작은 것을 보면 날개로 감싸 보호합니다. 감싸인 것들은 인어가 됩니다. 몸 전체가 어둠에 덮여 보이지 않고, 지나가는 자리의 별빛과 물빛이 지워질 뿐입니다. 고래가 지나가는 길목에 작은 등불 뗏목을 던져 날개를 펼치게 하십시오.',
  '고래 앞에 따스하게 빛나는 길목(점선 고리)을 누르면 등불 뗏목이 떨어짐 · 두 번 날개를 펼치게 하면 통과 · 너무 가깝거나 길목을 벗어나면 고래가 자리를 옮김 · 미끼 '+LURE.tries+'개',
  '');
 if(mode==='watch')return panel(3,'관측',
  '날개가 물밑으로 뻗어 있습니다. 보이지 않는 날개 끝이 지나가면 부표가 그쪽으로 끌려 기울고 잠깁니다. 날개 끝이 멈춘 자리의 부표는 잠긴 채 천천히 흔들립니다. 양쪽 날개 끝이 멈춘 부표를 하나씩 짚으십시오.',
  '이펙트 화면에서 부표 누르기 · 왼쪽 날개는 왼쪽 부표 셋 중 하나, 오른쪽 날개는 오른쪽 부표 셋 중 하나 · 두 번 읽으면 통과 · 지나가며 흔든 부표나 너무 이른 · 늦은 짚기는 날개 위치 오판',
  '');
 if(mode==='fork')return panel(4,'고정',
  '짚어 둔 두 부표에 공명 굽쇠를 매달았습니다. 날개가 물 위로 솟아 다 펼쳐지는 순간 굽쇠를 울리면, 울림이 날개 끝을 묶어 날개를 접지 못하게 합니다. 한쪽만 묶이면 풀린 날개가 배를 감싸 안습니다.',
  '고리가 굽쇠에 닿는 순간 · PC: 왼쪽 ←/A · 오른쪽 →/D · 휴대폰: 이펙트 화면의 왼쪽 · 오른쪽을 누르거나 아래 버튼 · 두 날개는 다 펼쳐지는 순간이 다릅니다',
  '<div class="bkg-steer"><button type="button" class="danger bkg-big" id="bkgForkL">◀ 왼쪽 굽쇠</button><button type="button" class="danger bkg-big" id="bkgForkR">오른쪽 굽쇠 ▶</button></div>');
 if(mode==='strike')return panel(5,'접지 못한 날개',
  '두 굽쇠가 같은 소리로 울며 날개를 펼친 채 묶고 있습니다. 그것은 날개를 접지 못합니다. 굽쇠의 울림이 양쪽 날개 끝에서 몸 한가운데로 모여 만나는 순간, 별이 지워진 그곳의 가장자리가 잠깐 드러납니다. 그 순간 작살을 던지십시오.',
  '두 울림(빛 덩이)이 한가운데에서 만나 고리가 닿는 순간 · 스페이스 / 이펙트 화면 / 아래 버튼 · 이르거나 늦으면 작살이 어둠을 지나 물에 떨어짐(감아 들인 뒤 다시)',
  '<button type="button" class="danger bkg-big" id="bkgStrike">작살을 던진다</button>');
 return '';
}
function sceneMarkup(n,game){return window.BlackWhaleV3?window.BlackWhaleV3.html(n,game?{game:true}:null):'';}
const previousPlay=renderPlay;
renderPlay=function(){
 if(stage()===null&&state.blackWings024&&state.scene!=='battle')state.blackWings024=null;
 syncGame();
 const n=stage();
 if(n===null)return previousPlay();
 if(n===4&&!isBlackBattle()&&state.blackWhaleFinal===true){
  return sceneMarkup(4)+
   '<div class="inset"><h2>'+esc(WHALES[BLACK].name)+' · 사냥 성공</h2>'+
   '<p>두 공명 굽쇠가 같은 소리로 울리는 동안, 그것은 날개를 접지 못했습니다. 아무것도 감싸지 못하게 된 그것의 날개 사이, 별빛이 지워진 곳으로 작살이 들어갔습니다. 어둠이 날개 끝에서부터 풀려 흩어지고, 지워졌던 별이 하나씩 돌아왔습니다. 그것은 펼친 날개 그대로 천천히 가라앉았습니다. 그것의 온몸이 어떤 모양이었는지는 끝내 아무도 보지 못했습니다.</p>'+
   '<p class="muted">전리품과 사냥 업적은 기존 판정대로 지급되었습니다.</p>'+
   button('사냥을 마치고 항해 계속하기','blackWhaleContinue','','primary')+'</div>';
 }
 const mode=gameMode();
 if(mode)return sceneMarkup(n,true)+gamePanel(mode);
 return sceneMarkup(n)+previousPlay();
};
const previousHunt=huntWhale;
huntWhale=function(){
 const black=state.scene==='encounter'&&state.encounter===BLACK;
 const r=previousHunt.apply(this,arguments);
 if(black&&isBlackBattle()){state.battle.need=4;state.blackWings024=null;sync();}
 return r;
};
const previousCoin=resolveCoin;
resolveCoin=function(win){
 const b=state.battle;
 const success=!!(win&&b&&b.type==='whale'&&b.index===BLACK&&b.won+1>=b.need);
 if(success)state.blackWhaleFinal=true;
 const result=previousCoin(win);
 if(success&&state.scene==='dead')state.blackWhaleFinal=false;
 return result;
};
/* 처치 성공: 원래 흐름(afterWhale(3) → 호수 붕괴 · 이탈)은 성공 장면을 본 뒤 '항해 계속하기'를 누를 때 진행 */
const previousAfterWhale=afterWhale;
afterWhale=function(k){
 if(k===BLACK&&state.blackWhaleFinal===true&&!state.blackKill&&state.scene!=='dead'){state.blackDefer=true;state.scene='event';sync();return;}
 return previousAfterWhale.apply(this,arguments);
};
const previousComplete=completeLake;
completeLake=function(success,msg){
 if(state.blackKill&&!success&&/집어삼켜지는 것을 피해/.test(msg||''))msg='날개를 접지 못한 까만 고래가 펼친 날개 그대로 가라앉았습니다. 그것이 감싸 두었던 호수의 어둠도 함께 풀려, 별이 돌아온 물길을 따라 빠져나왔습니다.';
 return previousComplete.call(this,success,msg);
};

/* ---------- 입력 ---------- */
function svgPoint(scene,ev){
 const svg=scene.querySelector('svg');if(!svg||!svg.getScreenCTM)return null;
 const pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;const m=svg.getScreenCTM();if(!m)return null;const p=pt.matrixTransform(m.inverse());return [p.x,p.y];
}
document.addEventListener('pointerdown',function(ev){
 if(!G.mode)return;
 const t=ev.target;
 if(t.closest&&t.closest('#bkgStrike')){ev.preventDefault();strikeFire();return;}
 const fb=t.closest&&t.closest('[data-fork],#bkgForkL,#bkgForkR');
 if(fb){ev.preventDefault();if(G.mode==='fork')forkPress(fb.dataset.fork||(fb.id==='bkgForkL'?'L':'R'));return;}
 const scene=t.closest&&t.closest('.bk3-scene[data-game]');
 if(!scene)return;
 ev.preventDefault();
 const p=svgPoint(scene,ev);if(!p)return;
 if(G.mode==='lure')lureThrow(p[0],p[1]);
 else if(G.mode==='watch')watchTap(p[0],p[1]);
 else if(G.mode==='fork')forkPress(p[0]<480?'L':'R');
 else if(G.mode==='strike')strikeFire();
});
const isField=e=>e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]');
document.addEventListener('keydown',function(e){
 if(!G.mode||isField(e)||e.repeat)return;
 if(G.mode==='strike'&&e.code==='Space'){e.preventDefault();strikeFire();return;}
 if(G.mode==='fork'){if(e.code==='ArrowLeft'||e.code==='KeyA'){e.preventDefault();forkPress('L');}if(e.code==='ArrowRight'||e.code==='KeyD'){e.preventDefault();forkPress('R');}}
});
document.addEventListener('click',function(e){
 const b=e.target?.closest?.('button[data-act]');
 if(!b||b.disabled||busy)return;
 if(b.dataset.act==='blackWhaleContinue'&&state.blackWhaleFinal&&state.scene!=='dead'){state.blackWhaleFinal=false;
  if(state.blackDefer){state.blackDefer=false;state.blackKill=true;afterWhale(BLACK);state.blackKill=false;}else sync();}
});
if(state.blackWhaleFinal&&(!state.sea||state.scene==='dead'||state.current==null)){state.blackWhaleFinal=false;state.blackDefer=false;save();}
render();
window.BLACK_WHALE_HUNT={stage,labels,game:G,strikeFire,lureThrow,watchTap,forkPress,newRound,newFix,newWhale};
})();
