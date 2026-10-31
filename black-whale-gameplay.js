/* 모든 것을 감싸안는 검은 고래 · 5단계 사냥 흐름과 미니게임
   그것은 만타가오리의 모양을 한 '없음'이다. 지나간 자리의 별과 달과 물빛이 지워질 뿐, 몸은 끝내 보이지 않는다.
   특수 조건「꺼지지 않은 등불」
     그것은 빛을 감싼다. 1~4단계를 시작할 때마다 어둠의 앞자락이 수평선에서 밀려와 배를 지나간다.
     앞자락이 등불에 닿는 바로 그 순간 덮개를 덮어야 등불이 산다. 일찍 덮으면 불꽃이 숨 막혀 줄고, 늦으면 어둠에 감싸여 준다.
     4번 중 2번 이상 등불을 잃으면 5단계에서 날개 끝을 비출 빛이 없다 → 작살은 어둠 속으로 사라지고 그것은 배를 감싼 채 지나간다(사냥 실패 · 사망 아님).
   ① 별이 꺼지는 수평선 : 조우 화면 (사냥 / 회피) · 등불 ①
   ② 닫히는 날개   : ← → 로 배를 옮겨 두 날개 사이 별빛 아래에 머묾 × 2
   ③ 꺼지는 별     : 머리 위로 별이 꺼져 가는 맨 앞(날개 끝)을 눌러 등불로 비춤 × 3
   ④ 감싸인 배     : 어둠이 고동치며 등불 둘레를 조일 때 박자 맞춰 등불을 흔듦 × 8
   ⑤ 날개 끝       : 등불에 젖어 오르는 날개 끝에 좁혀 오는 고리가 닿는 순간 작살
   미니게임마다 실패는 한 번까지: 첫 실패는 피해를 입고 다시, 두 번째 실패는 사망(5망은 한 번 더).
   고래 전투는 기존 'whale' 전투(유효 타격 4)를 그대로 쓰므로 전리품·업적·처치 기록은 기존대로 지급된다. */
(function(){
'use strict';
const BLACK=3,RAD=Math.PI/180,SEA=336;
const labels=['별이 꺼지는 수평선','닫히는 날개','꺼지는 별','감싸인 배','날개 끝'];
const LAMP={edgeMin:2.4,edgeRand:.8,win:.3};
const GAP={need:2,limit:7.5,fill:2.6,speed:330};
const STARS={need:3,dur:2.6,gap:.9,radius:88};
const PULSE={need:8,first:1.8,min:1.05,rand:.3,win:.2,missCap:3};
const FINAL={rise:.55,hold:1.1,fall:.5,toTarget:1.05,win:.2,fly:.45,cineHit:3.05};
const G=window.BlackHuntGame=window.BlackHuntGame||{mode:null};

/* ---------- 등불 기록: state.blackLamp = {done:[4], rec:['kept'|'early'|'late'...]} ---------- */
function bl(){const r=state.blackLamp;return r&&Array.isArray(r.done)?r:null;}
function ensureBl(){if(!bl())state.blackLamp={done:[false,false,false,false],rec:[]};return state.blackLamp;}
function lost(){const r=bl();return r?r.rec.filter(x=>x&&x!=='kept').length:0;}
function lampLevel(){return Math.max(0,4-lost());}
function blind(){return lost()>=2;}

function isBlackBattle(){const b=state.battle;return state.scene==='battle'&&b&&b.type==='whale'&&b.index===BLACK;}
function lampWave(){
 if(state.scene==='encounter'&&state.encounter===BLACK&&state.sea){const r=ensureBl();return r.done[0]?null:0;}
 if(!isBlackBattle()||state.battle.need!==4)return null;
 const r=bl();if(!r)return null;
 const w=Number(state.battle.won)||0;
 return w<=2&&!r.done[w+1]?w+1:null;
}
function gameMode(){
 if(lampWave()!=null)return 'lamp';
 if(!isBlackBattle()||state.battle.need!==4)return null;
 return ['gap','stars','pulse','final'][Math.max(0,Math.min(3,Number(state.battle.won)||0))];
}
function stage(){
 if(state.scene==='dead'||!state.sea||state.current==null)return null;
 if(state.blackWhaleFinal===true&&state.scene!=='battle')return 4;
 if(state.scene==='encounter'&&state.encounter===BLACK)return 0;
 if(isBlackBattle())return Math.max(1,Math.min(4,(Number(state.battle.won)||0)+1));
 return null;
}
function now(){return G.t0?(performance.now()-G.t0)/1000:0;}
const EASE=()=>(window.CalamityMang?window.CalamityMang.ease():1);
function LIM(){return window.MinigameStrikes?MinigameStrikes.limit():2;}
const rnd=(a,b)=>a+Math.random()*(b-a);

/* ---------- 상태 ---------- */
function syncGame(){
 const mode=gameMode(),wave=mode==='lamp'?lampWave():null;
 if(mode&&(G.mode!==mode||G.ref!==state.battle||(mode==='lamp'&&G.wave!==wave))){
  for(const k of Object.keys(G))delete G[k];
  G.mode=mode;G.ref=state.battle;G.t0=performance.now();G.done=null;G.text='';G.ease=EASE();
  if(mode==='lamp')Object.assign(G,{wave,edgeAt:LAMP.edgeMin+Math.random()*LAMP.edgeRand,win:LAMP.win*G.ease,result:null,record:(bl()||{rec:[]}).rec.slice()});
  if(mode==='gap')Object.assign(G,{need:GAP.need,round:0,phase:'ready',startAt:1.3,roundAt:.4,limit:GAP.limit*G.ease,fill:0,bx:480,gx:480,half:150,dir:0,ph:Math.random()*6,keyL:false,keyR:false,ptr:0});
  if(mode==='stars')Object.assign(G,{need:STARS.need,caught:0,pass:null,nextAt:1.2});
  if(mode==='pulse'){const beats=[];let b=PULSE.first;for(let i=0;i<40;i++){beats.push({t:b,judged:false});b+=PULSE.min+Math.random()*PULSE.rand;}
   Object.assign(G,{need:PULSE.need,beats,beatsOk:0,misses:0,radius:200,win:PULSE.win*G.ease,nextBeat:beats[0].t});}
  if(mode==='final'){Object.assign(G,{blind:blind(),cycles:[],thrownAt:null,flight:null,hit:false,win:FINAL.win*G.ease,target:null});addCycle(1.6+Math.random()*.6);
   G.wingUp=wingUp;G.ringAt=ringAt;}
 }
 G.lampLevel=lampLevel();
 if(!mode&&G.mode&&!G.timer){G.mode=null;G.ref=null;}
}
function setText(t){G.text=t;const el=document.getElementById('bkgText');if(el)el.textContent=t;}
function hurt(h,m,msg){takeDamage(h,m);if(msg)log(msg);if(!safeCheck())return false;updateStatus();return true;}
// 실패: 첫 실패는 피해 후 다시, 기회를 다 쓰면 사망(테스트 페이지 '피해 무시'면 사망 대신 되돌림)
function fail(h,m,logMsg,retryText,deathText){
 G.fails=(G.fails||0)+1;updateLives();
 if(G.fails>=LIM()){
  if(window.__BLUE_NODEATH){G.fails=0;updateLives();log('[테스트] 사망 대신 기회를 되돌립니다.');setText(retryText);return true;}
  G.done='dead';busy=true;setText(deathText);
  G.timer=setTimeout(()=>{G.timer=null;busy=false;G.mode=null;log(logMsg+' 어둠이 배와 선원들을 통째로 감싸 버렸습니다.');die();},1900);
  return false;
 }
 setText(retryText+' · 남은 기회 '+(LIM()-G.fails)+'번');
 return hurt(h,m,logMsg);
}
function updateLives(){const e=document.getElementById('bkgLives');if(e)e.textContent=String(Math.max(0,LIM()-(G.fails||0)));}
function lampIcons(){let h='<span class="bkg-lamp">';for(let i=0;i<4;i++)h+='<i class="'+(i<lampLevel()?'on':'')+'"></i>';return h+'</span>';}
function statusTags(){return tag('선체 '+state.hull+' / 100')+' '+tag('정신력 '+state.mind+' / 100')+(bl()?' '+tag('등불 '+lampLevel()+' / 4')+' '+lampIcons():'');}
function updateStatus(){const s=document.getElementById('bkgStatus');if(s)s.innerHTML=statusTags();}
function finish(after){
 G.done='ok';busy=true;
 G.timer=setTimeout(()=>{G.timer=null;busy=false;if(!isBlackBattle()){G.mode=null;return;}G.mode=null;resolveCoin(true);},after*1000);
}

/* ---------- 등불 덮기 ---------- */
function lampEnd(result,t){
 if(G.result)return;
 G.result=result;
 const r=ensureBl();r.done[G.wave]=true;r.rec[G.wave]=result;G.record=r.rec.slice();G.lampLevel=lampLevel();
 if(result==='kept'){log('어둠의 앞자락이 닿는 순간 등불을 덮었습니다. 덮개 너머로 아무것도 지나가지 않은 것처럼 고요합니다.');setText('등불을 지켰습니다 · 어둠이 지나갑니다.');}
 else{
  takeDamage(0,5);
  log((result==='early'?'너무 일찍 덮어 불꽃이 숨이 막혀 줄었습니다.':'어둠이 등불을 감싸고 지나갔습니다. 불꽃이 줄었습니다.')+' (등불 '+lampLevel()+' / 4)'+(blind()?' 이제 날개 끝을 비출 빛이 남지 않았습니다.':''));
  setText((result==='early'?'너무 일찍 덮었습니다':'등불이 감싸였습니다')+' · 불꽃이 줄었습니다. (등불 '+lampLevel()+' / 4)');
  if(!safeCheck())return;
 }
 updateStatus();
 G.done='ok';busy=true;
 G.timer=setTimeout(()=>{G.timer=null;busy=false;G.mode=null;G.done=null;sync();},result==='kept'?1500:1900);
}
function lampPress(){
 if(G.mode!=='lamp'||G.result)return;
 const t=now();if(t<.6)return;
 if(t<G.edgeAt-G.win)lampEnd('early',t);
 else if(t<=G.edgeAt+G.win)lampEnd('kept',t);
}
function lampTick(t){if(!G.result&&t>G.edgeAt+G.win)lampEnd('late',t);}

/* ---------- ② 날개 사이의 틈 ---------- */
function gapTick(t,dt){
 if(G.phase==='ready'&&t>=G.startAt){G.phase='go';G.goAt=t;G.fill=0;G.slamAt=null;}
 if(G.phase!=='go')return;
 const e=t-G.goAt,k=e/G.limit;
 G.half=150-78*Math.min(1,k);
 G.gx=480+200*Math.sin(e*.85+G.ph)+70*Math.sin(e*2.3+G.ph*2);
 G.dir=(G.keyR||G.ptr>0?1:0)-(G.keyL||G.ptr<0?1:0);
 G.bx=Math.max(90,Math.min(870,G.bx+G.dir*GAP.speed*dt));
 if(Math.abs(G.bx-G.gx)<G.half)G.fill=Math.min(1,G.fill+dt/GAP.fill);
 if(G.fill>=1){
  G.round++;G.flash={at:t,text:'별빛 아래',good:true};
  if(G.round>=G.need){G.phase='done';setText('날개가 물러납니다 · 머리 위의 별이 하나씩 꺼지기 시작합니다.');finish(1.4);}
  else{G.phase='ready';G.startAt=t+1.4;G.roundAt=t+.5;setText('한 번 버텼습니다 · 날개가 다시 휘어 듭니다. ('+G.round+' / '+G.need+')');}
  return;
 }
 if(k>=1){
  G.phase='ready';G.slamAt=t;G.flash={at:t,text:'닫혔다',good:false};G.startAt=t+1.8;G.roundAt=t+.9;
  if(!fail(10,5,'두 날개가 배 위로 닫혔습니다. 선체가 짓눌립니다.','날개가 닫혔습니다 · 선체가 짓눌렸습니다. 틈을 다시 따라가십시오.','날개가 닫혔습니다 · 배가 어둠에 통째로 감싸입니다.'))G.phase='dead';
 }
}
/* ---------- ③ 별이 꺼지는 자리 ---------- */
function newPass(t){
 const fromR=Math.random()<.5,x0=fromR?1060:-100,x1=fromR?-120:1080,y0=rnd(50,210),y1=rnd(60,230),cy=rnd(-40,40)+Math.min(y0,y1)-40;
 const start=t+STARS.gap,end=start+STARS.dur;
 const Bz=u=>[(1-u)*(1-u)*x0+2*(1-u)*u*480+u*u*x1,(1-u)*(1-u)*y0+2*(1-u)*u*cy+u*u*y1];
 const pass={start,end,done:false,
  tipAt(tt){return Bz(Math.max(0,Math.min(1,(tt-start)/STARS.dur)));},
  dirAt(tt){const u=Math.max(0,Math.min(1,(tt-start)/STARS.dur));return Math.atan2(2*(1-u)*(cy-y0)+2*u*(y1-cy),2*(1-u)*(480-x0)+2*u*(x1-480))/RAD;}};
 G.pass=pass;
}
function starsClick(x,y){
 if(G.mode!=='stars'||G.done)return;
 const t=now(),p=G.pass;
 if(!p||p.done||t<p.start||t>p.end)return;
 const tip=p.tipAt(t),hit=Math.hypot(tip[0]-x,tip[1]-y)<=STARS.radius*(G.ease||1);
 G.lastClick={at:t,p:[x,y],hit};p.done=true;
 if(hit){G.caught++;
  if(G.caught>=G.need){setText('세 번 비췄습니다 · 꺼진 별이 돌아오지 않습니다. 하늘 전체가 감싸이기 시작합니다.');finish(1.4);}
  else setText('등불이 날개 끝을 비췄습니다 · 젖은 가장자리가 한 번 빛났습니다. ('+G.caught+' / '+G.need+')');
  p.end=t+.25;
 }else{
  p.end=t+.25;
  fail(4,6,'등불이 허공을 비췄습니다. 등 뒤로 차가운 것이 스칩니다.','허공을 비췄습니다 · 꺼져 가는 맨 앞을 노리십시오.','허공을 비췄습니다 · 등 뒤에서 어둠이 배를 덮습니다.');
 }
}
function starsTick(t){
 if(!G.pass){if(t>=G.nextAt-STARS.gap)newPass(t);return;}
 const p=G.pass;
 if(t>p.end){
  if(!p.done){p.done=true;G.lastClick={at:t,p:p.tipAt(p.end),hit:false};
   fail(4,6,'별이 꺼진 자리를 놓쳤습니다.','놓쳤습니다 · 다음 별이 꺼질 때 맨 앞을 누르십시오.','놓쳤습니다 · 하늘이 통째로 감싸이며 배를 덮습니다.');}
  if(!G.done)G.pass=null,G.nextAt=t+.3+STARS.gap;
 }
}
/* ---------- ④ 어둠의 고동 ---------- */
function pulsePress(){
 if(G.mode!=='pulse'||G.done)return;
 const t=now();
 const b=G.beats.find(x=>!x.judged&&Math.abs(x.t-t)<=G.win);
 if(b){b.judged=true;G.beatsOk++;G.flareAt=t;G.flash={at:t,text:'밀어냄',good:true};
  if(G.beatsOk>=G.need){setText('어둠이 한 걸음 물러섭니다 · 등불이 닿는 가장자리에서 무언가 솟아오릅니다.');finish(1.4);}
  else setText('등불을 흔들어 밀어냈습니다 · '+(G.need-G.beatsOk)+'번 남았습니다.');}
 else pulseMiss(t,'박자를 놓쳤습니다');
}
function pulseMiss(t,why){
 G.misses++;G.radius=Math.max(90,200-G.misses*36);G.flash={at:t,text:'조여듦',good:false};
 if(G.misses>=PULSE.missCap){G.misses=0;G.radius=200;
  fail(6,7,'어둠이 등불 바로 앞까지 조여 왔습니다. 숨이 막힙니다.','어둠이 조여 왔습니다 · 다시 박자를 맞추십시오.','어둠이 등불을 감쌌습니다 · 아무것도 보이지 않습니다.');}
 else setText(why+' · 빛의 둘레가 좁아집니다. ('+G.misses+' / '+PULSE.missCap+')');
}
function pulseTick(t){
 for(const b of G.beats){if(!b.judged&&t>b.t+G.win){b.judged=true;pulseMiss(t,'고동을 흘려보냈습니다');if(G.done)return;}}
 const nb=G.beats.find(x=>!x.judged&&x.t>=t-G.win);G.nextBeat=nb?nb.t:null;
}
/* ---------- ⑤ 날개 끝 ---------- */
function addCycle(start){const c={start,ti:start+FINAL.toTarget,end:start+FINAL.rise+FINAL.hold+FINAL.fall};G.cycles.push(c);return c;}
function cycleAt(t){return G.cycles.find(c=>t>=c.start&&t<=c.end)||null;}
function wingUp(t){
 const c=G.cycles.find(c=>t>=c.start-.01&&t<=c.end);if(!c)return 0;
 const a=t-c.start;return a<FINAL.rise?1-Math.pow(1-a/FINAL.rise,3):a<FINAL.rise+FINAL.hold?1:Math.max(0,1-(a-FINAL.rise-FINAL.hold)/FINAL.fall);
}
function ringAt(t){const c=cycleAt(t);if(!c||t>c.ti+.35)return null;return (c.ti-t)/FINAL.toTarget;}
function spotAt(t){const V=window.BlackWhaleV3;return V&&V.geo?V.geo.spotAt(t,wingUp(t)):[620,180];}
function finalPress(){
 if(G.mode!=='final'||G.done||G.locked||G.thrownAt!=null)return;
 const t=now();if(t<1.0)return;
 if(G.blind){
  G.thrownAt=t;G.hit=false;G.target=[720,SEA-140];G.flight={at:t,arrive:t+FINAL.fly,hit:false,blind:true};
  setText('작살이 어둠 속으로 사라집니다 · 날개 끝을 비출 빛이 없었습니다.');
  G.done='escape';busy=true;
  G.timer=setTimeout(()=>{G.timer=null;busy=false;G.mode=null;
   log('등불이 꺼져 가는 채 던진 작살은 아무것에도 닿지 않고 어둠 속으로 사라졌습니다. 감싸던 것이 소리 없이 지나가고, 별이 하나씩 돌아옵니다.');
   state.blackLamp=null;state.battle=null;afterWhale(BLACK);},(FINAL.fly+2.2)*1000);
  return;
 }
 const c=cycleAt(t);if(!c)return;          // 날개 끝이 보이지 않을 때는 던지지 않음
 const arrive=t+FINAL.fly,hit=Math.abs(t-c.ti)<=G.win;
 G.thrownAt=t;G.hit=hit;G.target=spotAt(arrive);G.flight={at:t,arrive,hit};
 if(hit){
  G.hitAt=arrive;
  if(window.BlackWhaleV3)window.BlackWhaleV3.resume={stage:4,start:G.t0+arrive*1000-((window.BlackWhaleV3.geo&&window.BlackWhaleV3.geo.cineHit)||FINAL.cineHit)*1000};
  setText('날개 끝이 등불에 젖은 순간, 작살이 꽂힙니다!');
  G.done='ok';busy=true;
  const extra=window.CalamityMang&&CalamityMang.rings()>=3?(CalamityMang.rings()>=5?1.1:.7):0;
  G.timer=setTimeout(()=>{G.timer=null;busy=false;if(!isBlackBattle()){G.mode=null;return;}G.mode=null;resolveCoin(true);},(FINAL.fly+1.6+extra)*1000);
 }else{
  G.locked=true;
  setTimeout(()=>{if(G.mode!=='final'||G.done){G.locked=false;return;}
   const ok=fail(4,5,'작살이 날개 끝을 비껴 어둠 속으로 떨어졌습니다.','빗나갔습니다 · 고리가 날개 끝에 닿는 순간을 노리십시오.','빗나갔습니다 · 날개가 배 위로 휘어 덮칩니다.');
   setTimeout(()=>{G.locked=false;if(ok&&G.mode==='final'&&!G.done){G.thrownAt=null;G.flight=null;G.hit=false;}},900);
  },FINAL.fly*1000);
 }
}
function finalTick(t){
 const last=G.cycles[G.cycles.length-1];
 if(t>last.end-.5)addCycle(last.end+1.0+Math.random()*.7);
}

let lastTick=0;
function tick(ms){
 const dt=lastTick?Math.min(.1,(ms-lastTick)/1000):0;lastTick=ms;
 if(G.mode&&!G.done&&G.t0&&(isBlackBattle()||(G.mode==='lamp'&&state.scene==='encounter'&&state.encounter===BLACK))){
  const t=now();
  if(G.mode==='lamp')lampTick(t);
  else if(G.mode==='gap')gapTick(t,dt);
  else if(G.mode==='stars')starsTick(t);
  else if(G.mode==='pulse')pulseTick(t);
  else if(G.mode==='final')finalTick(t);
 }
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------- 화면 ---------- */
function panel(stageNo,title,desc,small,body){
 return '<div class="inset warning bkg-panel"><div class="small">재앙의 고래 · '+esc(WHALES[BLACK].name)+' · '+stageNo+'단계</div><h2>'+title+'</h2>'+
  '<p>'+desc+'</p><p id="bkgStatus">'+statusTags()+'</p>'+
  '<p>남은 기회 <b id="bkgLives">'+Math.max(0,LIM()-(G.fails||0))+'</b> <span class="muted">('+LIM()+'번 실패하면 사망)</span></p>'+
  '<div class="coinpanel"><div class="small">'+small+'</div>'+body+'<p id="bkgText">'+esc(G.text||'')+'</p></div></div>';
}
function gamePanel(mode){
 if(mode==='lamp'){const k=G.wave||0;return panel(k+1,'등불 · '+['첫 번째','두 번째','세 번째','네 번째'][k]+' 어둠',
  '별이 수평선에서부터 차례로 꺼지며 어둠의 앞자락이 밀려옵니다. 그것은 빛을 감쌉니다. 앞자락이 등불에 닿는 바로 그 순간 덮개를 덮어야 불꽃이 살아남습니다.',
  '앞자락이 등불에 닿는 순간 한 번 누르기(스페이스 / 이펙트 화면 / 아래 버튼) · 일찍 덮으면 불꽃이 숨 막혀 줄고, 늦으면 어둠에 감싸여 줄어듭니다 · 4번 중 2번 잃으면 5단계에서 날개 끝을 비출 수 없습니다',
  '<button type="button" class="danger bkg-big" id="bkgAct">등불을 덮는다</button>');}
 if(mode==='gap')return panel(2,'닫히는 날개','양옆의 물이 검게 부풀어 오르더니 거대한 날개 끝이 휘어 오릅니다. 두 날개가 배 위로 닫혀 옵니다. 날개 사이로 보이는 별빛 아래에 배를 두십시오.',
  '← → 키 · 이펙트 화면의 왼쪽/오른쪽 누르고 있기 · 아래 버튼 누르고 있기 · 별빛 아래에 머문 시간으로 게이지를 채우면 버팀 · 2번 버티면 통과 · 날개가 닫히면 실패',
  '<div class="bkg-steer"><button type="button" class="bkg-big" id="bkgL">◀ 왼쪽으로</button><button type="button" class="bkg-big" id="bkgR">오른쪽으로 ▶</button></div>');
 if(mode==='stars')return panel(3,'꺼지는 별','머리 위의 별이 한 줄로 꺼져 갑니다. 꺼지는 자리의 맨 앞, 그곳에 날개 끝이 있습니다. 그곳을 눌러 등불로 비추십시오.',
  '이펙트 화면에서 별이 꺼져 가는 맨 앞을 누르기 · 3번 비추면 통과 · 허공을 비추거나 놓치면 실패',
  '<p>비춘 날개 끝 <b>'+(G.caught||0)+' / '+STARS.need+'</b></p>');
 if(mode==='pulse')return panel(4,'감싸인 배','하늘도 물도 지워졌습니다. 등불이 비추는 둘레만 남았습니다. 어둠이 느리게 고동칠 때마다 빛의 둘레를 조여 옵니다.',
  '조여 오는 어둠이 빛의 둘레에 닿는 순간 누르기(스페이스 / 이펙트 화면 / 아래 버튼) · 8번 밀어내면 통과 · 3번 놓치면 실패',
  '<button type="button" class="danger bkg-big" id="bkgAct">등불을 흔든다</button>');
 if(mode==='final')return panel(5,'날개 끝',
  G.blind?'등불이 거의 꺼졌습니다. 빛의 둘레 밖 어딘가에서 물이 갈라지는 소리만 들립니다. 날개 끝이 어디 있는지 보이지 않습니다.'
   :'빛의 가장자리에서 물이 검게 솟더니 날개 끝이 휘어 오릅니다. 등불이 닿는 밑면만 젖어 빛납니다. 좁혀 오는 고리가 날개 끝에 닿는 순간 작살을 던지십시오.',
  '좁혀 오는 고리가 날개 끝에 닿는 순간 누르기(스페이스 / 이펙트 화면 / 아래 버튼) · 날개 끝이 내려가면 다시 오를 때를 기다림 · 빗나가면 실패',
  '<button type="button" class="danger bkg-big" id="bkgAct">작살을 던진다</button>');
 return '';
}
function sceneMarkup(n,game,lampW){return window.BlackWhaleV3?window.BlackWhaleV3.html(n,lampW?{lamp:true}:game?{game:true}:null):'';}
const previousPlay=renderPlay;
renderPlay=function(){
 const n0=stage();
 if(n0===null&&state.blackLamp&&state.scene!=='battle')state.blackLamp=null;
 syncGame();
 const n=stage();
 if(n===null)return previousPlay();
 if(G.mode==='lamp')return sceneMarkup(G.wave,true,true)+gamePanel('lamp');
 if(n===4&&!isBlackBattle()){
  return sceneMarkup(4)+
   '<div class="inset"><h2>'+esc(WHALES[BLACK].name)+' · 사냥 성공</h2>'+
   '<p>등불에 젖어 오른 날개 끝을 작살이 꿰뚫었습니다. 감싸던 것이 소리 없이 풀리고, 어둠이 걷혀 갑니다. 지워졌던 별이 하나씩, 물빛이 한 줄씩 돌아옵니다. 그것의 온몸이 어떤 모양이었는지는 끝내 아무도 보지 못했습니다. 다만 별이 지워졌던 자리가 커다란 날개 같았다고들 말합니다.</p>'+
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
 if(black&&isBlackBattle()){state.battle.need=4;ensureBl();sync();}
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

/* ---------- 입력 ---------- */
function svgPoint(scene,ev){
 const svg=scene.querySelector('svg');if(!svg||!svg.getScreenCTM)return null;
 const pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;
 const m=svg.getScreenCTM();if(!m)return null;const p=pt.matrixTransform(m.inverse());return [p.x,p.y];
}
function act(){if(G.mode==='lamp')lampPress();else if(G.mode==='pulse')pulsePress();else if(G.mode==='final')finalPress();}
document.addEventListener('pointerdown',function(ev){
 if(!G.mode)return;
 const t=ev.target;
 if(t.closest&&t.closest('#bkgAct')){ev.preventDefault();act();return;}
 if(t.closest&&t.closest('#bkgL')){ev.preventDefault();G.ptr=-1;return;}
 if(t.closest&&t.closest('#bkgR')){ev.preventDefault();G.ptr=1;return;}
 const scene=t.closest&&t.closest('.bk3-scene[data-game]');
 if(!scene)return;
 ev.preventDefault();
 if(G.mode==='stars'){const p=svgPoint(scene,ev);if(p)starsClick(p[0],p[1]);}
 else if(G.mode==='gap'){const r=scene.getBoundingClientRect();G.ptr=ev.clientX<r.left+r.width/2?-1:1;}
 else act();
});
['pointerup','pointercancel'].forEach(n=>document.addEventListener(n,function(){if(G.mode)G.ptr=0;}));
window.addEventListener('blur',function(){if(G.mode){G.ptr=0;G.keyL=G.keyR=false;}});
const isField=e=>e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]');
document.addEventListener('keydown',function(e){
 if(!G.mode||isField(e))return;
 if(G.mode==='gap'){if(e.code==='ArrowLeft'||e.code==='KeyA'){G.keyL=true;e.preventDefault();}if(e.code==='ArrowRight'||e.code==='KeyD'){G.keyR=true;e.preventDefault();}return;}
 if(e.repeat||e.code!=='Space')return;
 e.preventDefault();act();
});
document.addEventListener('keyup',function(e){
 if(!G.mode)return;
 if(e.code==='ArrowLeft'||e.code==='KeyA')G.keyL=false;
 if(e.code==='ArrowRight'||e.code==='KeyD')G.keyR=false;
});
document.addEventListener('click',function(e){
 const b=e.target?.closest?.('button[data-act]');
 if(!b||b.disabled||busy)return;
 if(b.dataset.act==='blackWhaleContinue'&&state.blackWhaleFinal&&state.scene!=='dead'){state.blackWhaleFinal=false;sync();}
});
if(state.blackWhaleFinal&&(!state.sea||state.scene==='dead'||state.current==null)){state.blackWhaleFinal=false;save();}
render();
window.BLACK_WHALE_HUNT={stage,labels,game:G,lampPress,starsClick,pulsePress,finalPress};
})();
