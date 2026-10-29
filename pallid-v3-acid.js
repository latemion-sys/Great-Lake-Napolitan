/* 모든 것을 삼키는 창백한 고래 · v3 시네마틱 · 위산 통과 장면
   위장 속 어둠. 쪽배는 살 주름 턱에서 기다리고 → 위액이 솟구쳤다가
   → 급히 빠지는 틈에 → 얕아진 위액 위를 건너 → 다시 차오르는 위액을 등지고
   반대편 통로(심장 쪽)에 닿는다. 시간 기준 requestAnimationFrame 방식. */
(function(){
'use strict';
const V3=window.PallidCinematicV3,V2=window.PallidCinematicV2;
if(!V3||!V3.shared||!V2)return;
const {W,H,BOAT,seeded,esc,clamp,outC,inOut}=V3.shared;
const LOOP=8.6,NAMES=V2.names;
const HIGH=270,LOW=404,FLOOR=418;   // 위액 수위(높음·낮음)와 바닥 높이
const WAIT_X=190,END_X=752,BOAT_S=1.25;

const BOAT_RIM='<path d="M-50,-11 L-44,-8 L38,-8 Q47,-9 55,-17 L52,-9 Q47,3 33,6 L-34,6 Q-46,4 -50,-11 Z" fill="none" stroke="#e0a58f" stroke-opacity=".38" stroke-width=".9"/>';

// 위벽 주름: 천장에서 늘어진 아치와 좌우 벽의 굵은 주름
function folds(seed,n,x0,x1,y0,amp){
 const r=seeded(seed);let s='';
 for(let i=0;i<n;i++){
  const y=y0+i*amp;let d='M'+x0+','+(y+(r()-.5)*10).toFixed(1);
  for(let x=x0;x<x1;x+=60)d+=' Q'+(x+30)+','+(y+18+(r()-.5)*26).toFixed(1)+' '+(x+60)+','+(y+(r()-.5)*12).toFixed(1);
  s+='<path d="'+d+'" stroke-width="'+(14-i*1.6).toFixed(1)+'"/>';
 }
 return s;
}
function ceiling(){
 const r=seeded(31);let d='M-40,-20 L1000,-20 L1000,'+(90+r()*40).toFixed(0);
 let x=1000;
 while(x>-40){
  const w=50+r()*110,dip=60+r()*120,nx=Math.max(-40,x-w);
  d+=' Q'+((x+nx)/2+(r()-.5)*30).toFixed(0)+','+(dip+70).toFixed(0)+' '+nx.toFixed(0)+','+(70+r()*50).toFixed(0);
  x=nx;
 }
 return d+' Z';
}
function hangingFolds(){
 const r=seeded(77);let s='';
 for(let i=0;i<9;i++){
  const x=60+r()*840,len=50+r()*110,w=1.5+r()*2.2;
  s+='<path d="M'+x.toFixed(0)+','+(40+r()*40).toFixed(0)+' q'+((r()-.5)*30).toFixed(0)+','+(len*.5).toFixed(0)+' '+((r()-.5)*16).toFixed(0)+','+len.toFixed(0)+'" stroke-width="'+w.toFixed(1)+'"/>';
 }
 return s;
}
function sphincter(rx,ry,seed){
 const r=seeded(seed);let d='';
 for(let i=0;i<=24;i++){
  const a=i/24*Math.PI*2,k=1+(r()-.5)*0.16;
  d+=(i?' L':'M')+(842+Math.cos(a)*rx*k).toFixed(1)+','+(292+Math.sin(a)*ry*k).toFixed(1);
 }
 return '<path d="'+d+' Z"/>';
}
function floorRidge(){
 const r=seeded(5);let d='M-40,'+FLOOR;
 for(let x=-40;x<1000;x+=46)d+=' Q'+(x+23)+','+(FLOOR-14-r()*16).toFixed(1)+' '+(x+46)+','+(FLOOR+(r()-.5)*6).toFixed(1);
 return d+' L1000,'+H+' L-40,'+H+' Z';
}

function acidHtml(){
 const title=NAMES.acid;
 const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'+
 '<defs>'+
  '<radialGradient id="w5Cave" cx=".55" cy=".45" r=".75"><stop stop-color="#2a0f16"/><stop offset=".55" stop-color="#14070b"/><stop offset="1" stop-color="#050203"/></radialGradient>'+
  '<linearGradient id="w5Flesh" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5a2230"/><stop offset=".5" stop-color="#3a141e"/><stop offset="1" stop-color="#170609"/></linearGradient>'+
  '<linearGradient id="w5Acid" gradientUnits="userSpaceOnUse" x1="0" y1="'+HIGH+'" x2="0" y2="'+H+'"><stop stop-color="#b9cc6a" stop-opacity=".78"/><stop offset=".12" stop-color="#6f8a37" stop-opacity=".8"/><stop offset=".45" stop-color="#2f4019" stop-opacity=".9"/><stop offset="1" stop-color="#0b1108" stop-opacity=".97"/></linearGradient>'+
  '<linearGradient id="w5AcidTop" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e9f7a6" stop-opacity=".55"/><stop offset="1" stop-color="#e9f7a6" stop-opacity="0"/></linearGradient>'+
  '<radialGradient id="w5AcidGlow" cx=".5" cy=".5" r=".5"><stop stop-color="#cfe57a" stop-opacity=".38"/><stop offset=".5" stop-color="#9cbc4c" stop-opacity=".12"/><stop offset="1" stop-color="#9cbc4c" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w3Lamp"><stop stop-color="#ffbf47" stop-opacity=".95"/><stop offset=".22" stop-color="#ffbf47" stop-opacity=".42"/><stop offset=".6" stop-color="#ffbf47" stop-opacity=".08"/><stop offset="1" stop-color="#ffbf47" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w5Warm"><stop stop-color="#ffb35a" stop-opacity=".34"/><stop offset=".4" stop-color="#d0685a" stop-opacity=".12"/><stop offset="1" stop-color="#d0685a" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w5Hole" cx=".5" cy=".5" r=".5"><stop stop-color="#000"/><stop offset=".55" stop-color="#0a0305"/><stop offset=".8" stop-color="#4a1724"/><stop offset="1" stop-color="#4a1724" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w5Cue"><stop stop-color="#ffd59a" stop-opacity=".55"/><stop offset=".5" stop-color="#ff9a6a" stop-opacity=".18"/><stop offset="1" stop-color="#ff9a6a" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w5Hurt" cx=".5" cy=".5" r=".75"><stop stop-color="#c8e46a" stop-opacity="0"/><stop offset=".6" stop-color="#c8e46a" stop-opacity=".08"/><stop offset="1" stop-color="#d0f070" stop-opacity=".5"/></radialGradient>'+
  '<filter id="w5Blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>'+
  '<filter id="w5Steam" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>'+
  '<filter id="w5Soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4"/></filter>'+
  '<filter id="w5Wet" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".022 .06" numOctaves="3" seed="12"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .2  0 0 0 0 .24  0 0 0 1.4 -.55"/></filter>'+
 '</defs>'+
 '<g class="w5-root">'+
  '<rect width="'+W+'" height="'+H+'" fill="url(#w5Cave)"/>'+
  '<rect width="'+W+'" height="'+H+'" filter="url(#w5Wet)" opacity=".12"/>'+
  // 천장 아치와 뒷벽 주름 (천천히 숨 쉬듯 움직임)
  '<g class="w5-breathe">'+
   '<path d="'+ceiling()+'" fill="url(#w5Flesh)" filter="url(#w5Soft)"/>'+
   '<path d="'+ceiling().replace(/^M-40,-20 L1000,-20 L/,'M').replace(/ Z$/,'')+'" fill="none" stroke="#e3a094" stroke-opacity=".06" stroke-width="2"/>'+
   // 반대편 통로: 주름이 모여드는 어두운 구멍(심장 쪽)
   '<ellipse cx="842" cy="292" rx="92" ry="112" fill="url(#w5Hole)" filter="url(#w5Soft)"/>'+
   '<g fill="none" stroke-linejoin="round" filter="url(#w5Soft)">'+
    '<g stroke="#5a1d29" stroke-width="9" opacity=".75">'+sphincter(58,76,3)+'</g>'+
    '<g stroke="#e0978c" stroke-width="1.6" stroke-opacity=".22">'+sphincter(54,72,3)+sphincter(30,44,8)+'</g>'+
   '</g>'+
  '</g>'+
  // 위액 빛이 벽을 물들임
  '<ellipse class="w5-acidglow" cx="480" cy="'+LOW+'" rx="620" ry="170" fill="url(#w5AcidGlow)"/>'+
  // 위액이 빠졌을 때 드러나는 바닥 주름
  '<path d="'+floorRidge()+'" fill="#2b0d14"/>'+
  '<path d="'+floorRidge().replace(/ L1000.*$/,'')+'" fill="none" stroke="#c77a76" stroke-opacity=".28" stroke-width="2"/>'+
  // 기다리는 자리: 왼쪽 살 주름 턱
  // 쪽배
  '<g class="w5-boat">'+BOAT+BOAT_RIM+'</g>'+
  // 위액
  '<path class="w5-acid" fill="url(#w5Acid)"/>'+
  '<path class="w5-sheen" fill="url(#w5AcidTop)"/>'+
  '<ellipse class="w5-lampref" rx="26" ry="3.4" fill="#ffc761" filter="url(#w5Soft)" opacity="0"/>'+
  '<path class="w5-crest" fill="none" stroke="#f0ffbe" stroke-width="1.8" stroke-linecap="round" stroke-opacity=".7" filter="url(#w5Soft)"/>'+
  '<path class="w5-foam" fill="none" stroke="#f4ffc4" stroke-width="1.3" stroke-dasharray="6 14" stroke-opacity=".5"/>'+
  '<g class="w5-bubbles" fill="none" stroke="#eef9b4">'+Array.from({length:18},(_,i)=>'<circle class="w5-bub" data-i="'+i+'" r="3" opacity="0"/>').join('')+'</g>'+
  '<g class="w5-sizzle" fill="#f4ffc4">'+Array.from({length:8},(_,i)=>'<circle class="w5-siz" data-i="'+i+'" r="1.6" opacity="0"/>').join('')+'</g>'+
  // 김
  '<g class="w5-steam" filter="url(#w5Steam)" fill="#d6e8a8">'+Array.from({length:9},(_,i)=>'<ellipse class="w5-puff" data-i="'+i+'" rx="34" ry="20" opacity="0"/>').join('')+'</g>'+
  // 천장에서 떨어지는 위액 방울
  '<g class="w5-drips" fill="#d7ea8a">'+Array.from({length:6},(_,i)=>'<ellipse class="w5-drip" data-i="'+i+'" rx="2.2" ry="4.2" opacity="0"/>').join('')+'</g>'+
  // 등불의 따스한 빛
  '<circle class="w5-warm" r="210" fill="url(#w5Warm)"/>'+
  // 미니게임: 위액이 빠진 순간 통로가 열리듯 빛남
  '<ellipse class="w5-cue" cx="842" cy="292" rx="70" ry="90" fill="url(#w5Cue)" opacity="0"/>'+
  '<rect class="w5-hurt" width="'+W+'" height="'+H+'" fill="url(#w5Hurt)" opacity="0"/>'+
  // 앞쪽 벽 주름(화면 가장자리)
  '<g class="w5-front">'+
   '<path d="M-40,300 Q30,330 54,400 Q80,470 170,500 Q230,520 250,560 L-40,560 Z" fill="#0f0408"/>'+
   '<path d="M-40,300 Q30,330 54,400 Q80,470 170,500 Q230,520 250,560" fill="none" stroke="#c97c78" stroke-opacity=".2" stroke-width="2.2"/>'+
   '<path d="M1000,-20 L760,-20 Q800,30 870,46 Q950,64 1000,140 Z" fill="#0f0408"/>'+
   '<path d="M760,-20 Q800,30 870,46 Q950,64 1000,140" fill="none" stroke="#c97c78" stroke-opacity=".16" stroke-width="2"/>'+
  '</g>'+
  '<rect class="w5-veil" width="'+W+'" height="'+H+'" fill="#020103" opacity="0"/>'+
 '</g></svg>';
 return '<div class="pallid-cine-v2 pallid-cine-v3 w5-acid-scene" role="img" aria-label="'+esc(title[0]+' · '+title[1])+'">'+svg+
  '<span class="cine-top" aria-hidden="true">모든 것을 삼키는 창백한 고래 · '+esc(title[0])+'</span>'+
  '<span class="cine-bottom" aria-hidden="true">'+esc(title[1])+'</span>'+
  '<span class="w5-hint" aria-hidden="true">위액이 완전히 빠진 순간 노를 저으세요 · 화면 누르기 / 스페이스</span>'+
  '<span class="w5-progress" aria-hidden="true"><i></i><i></i><i></i></span>'+
  '<span class="w5-verdict" aria-hidden="true"></span>'+
  '<span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}

/* ---------- 애니메이션 ---------- */
// 0~2.6 솟구침 · 2.6~3.4 빠짐 · 3.4~6.2 건넘 · 5.6~ 다시 차오름 · 7.9~ 암전
const T={surge:[0.3,2.6],drain:[2.6,3.4],cross:[3.4,6.2],refill:[5.7,7.9],loop:[7.9,8.6]};
const BUBS=Array.from({length:18},(_,i)=>{const r=seeded(900+i);return {x:110+i*40+r()*24,p:r()*2,v:0.6+r()*0.7,s:1.6+r()*3.4};});
const PUFFS=Array.from({length:9},(_,i)=>({x:120+i*82+((i*37)%30),p:(i*0.37)%1,v:0.22+((i*13)%7)*0.03}));
const DRIPS=[[230,150,0.2],[372,176,1.3],[515,140,0.7],[640,168,1.9],[300,160,2.2],[575,150,1.6]].map(([x,y0,p])=>({x,y0,p}));

function level(t){
 const up=outC((t-T.surge[0])/1.1);                 // 확 차오름
 const down=inOut((t-T.drain[0])/(T.drain[1]-T.drain[0]));
 const re=inOut((t-T.refill[0])/(T.refill[1]-T.refill[0]));
 return LOW+(HIGH-LOW)*up*(1-down)+(HIGH+40-LOW)*re*0.85;
}
function surfaceY(x,t,base,rough){
 return base+Math.sin(x*0.012+t*2.2)*6*rough+Math.sin(x*0.031-t*3.1)*3*rough+Math.sin(x*0.004+t*.7)*4;
}

let start=0,lastSeen=0,seenTok=0;
// 미니게임 상태 (pallid-acid-game.js가 켜고 끈다)
const GAME=window.PallidAcidGame=window.PallidAcidGame||{active:false};
const WINDOWS=[0.38,0.32,0.27];                 // 성공할수록 빠진 시간이 짧아짐
function resetGame(){GAME.startAt=0;GAME.steps=0;GAME.stepAt=[];GAME.failAt=-9;GAME.lastPress=-9;GAME.cycles=[];GAME.doneAt=null;}
GAME.reset=resetGame;
function mkCycle(s0){
 const r=Math.random;
 const c={s:s0,rise:0.42+r()*0.2,high:0.4+r()*0.75,drain:0.38+r()*0.14,low:WINDOWS[Math.min(GAME.steps||0,2)]};
 c.end=c.s+c.rise+c.high+c.drain+c.low;c.open=c.s+c.rise+c.high+c.drain;
 return c;
}
function cycleAt(t){
 const cs=GAME.cycles||(GAME.cycles=[]);
 if(!cs.length)cs.push(mkCycle(0));
 while(cs[cs.length-1].end<t+3)cs.push(mkCycle(cs[cs.length-1].end));
 for(const c of cs)if(t<c.end)return c;
 return cs[cs.length-1];
}
function holdLevel(t){
 const c=cycleAt(t),u=t-c.s;
 if(u<c.rise)return LOW+(HIGH-LOW)*outC(u/c.rise);
 if(u<c.rise+c.high)return HIGH;
 if(u<c.rise+c.high+c.drain)return HIGH+(LOW-HIGH)*inOut((u-c.rise-c.high)/c.drain);
 return LOW;
}
function inWindow(t){const c=cycleAt(t);return !c.used&&t>=c.open-0.05&&t<c.end+0.03;}
GAME.press=function(){
 if(!GAME.active||!GAME.startAt||GAME.steps>=3)return null;
 const t=(performance.now()-GAME.startAt)/1000;
 if(t-GAME.lastPress<0.3)return 'busy';
 GAME.lastPress=t;
 if(inWindow(t)){
  cycleAt(t).used=true;GAME.steps++;GAME.stepAt.push(t);
  if(GAME.steps>=3)GAME.doneAt=t;
  return 'ok';
 }
 GAME.failAt=t;return 'fail';
};
resetGame();
function frame(now){
 const el=document.querySelector('.w5-acid-scene');
 if(el&&el.isConnected){
  const paused=!!el.closest('.is-paused');
  const tok=(window.PallidCinematicV3||{}).replayToken||0;
  if(now-lastSeen>900||tok!==seenTok){start=now;seenTok=tok;}   // 새로 열리거나 '다시 재생'일 때만 처음부터
  if(paused)start+=now-lastSeen;
  lastSeen=now;
  if(GAME.active){
   if(!GAME.startAt)GAME.startAt=now;
   paint(el,(now-GAME.startAt)/1000,true);
  }else paint(el,el.dataset.seek!=null?+el.dataset.seek:((now-start)/1000)%LOOP,false);
 }
 requestAnimationFrame(frame);
}
function paint(el,t,hold){
 const q=s=>el.querySelector(s),qa=s=>el.querySelectorAll(s);
 const base=hold?holdLevel(t):level(t);
 const surging=clamp((LOW-base)/(LOW-HIGH));          // 0(낮음)~1(높음)
 const rough=0.45+surging*1.4;
 // 위액 표면
 let d='',crest='';
 for(let x=-40;x<=1000;x+=20){
  const y=surfaceY(x,t,base,rough);
  d+=(d?' L':'M')+x+','+y.toFixed(1);
 }
 crest=d;
 q('.w5-acid').setAttribute('d',d+' L1000,'+(H+20)+' L-40,'+(H+20)+' Z');
 q('.w5-crest').setAttribute('d',crest);
 // 표면 아래 얇은 빛 띠
 let sheen='';for(let x=1000;x>=-40;x-=20)sheen+=' L'+x+','+(surfaceY(x,t,base,rough)+22).toFixed(1);
 q('.w5-sheen').setAttribute('d',crest+sheen+' Z');
 const foam=q('.w5-foam');foam.setAttribute('d',crest);foam.setAttribute('transform','translate(0 5)');
 foam.style.strokeDashoffset=(-t*40).toFixed(1);
 const glow=q('.w5-acidglow');glow.setAttribute('cy',(base-10).toFixed(1));
 glow.style.opacity=(0.7+0.3*surging+Math.sin(t*3)*0.06).toFixed(3);

 // 쪽배: 턱 위에서 기다림 → 건넘(노 젓듯 일정하지 않은 속도) → 통로 앞
 let c=clamp((t-T.cross[0])/(T.cross[1]-T.cross[0]));
 let stroke=c-Math.sin(c*Math.PI*6)/(Math.PI*6)*0.9;  // 노를 저을 때마다 밀려 나가는 느낌
 if(hold){ // 성공할 때마다 1/3씩 노를 저어 나아감
  stroke=0;GAME.stepAt.forEach(s0=>{stroke+=outC((t-s0)/0.8)/3;});
  c=stroke>0&&stroke<1?0.5:stroke>=1?1:0;
 }
 const bx=WAIT_X+(END_X-WAIT_X)*clamp(stroke);
 let by;
 if(c<=0){ // 턱 위: 높은 위액이 턱을 넘으면 함께 들림
  by=surfaceY(bx,t,base,rough)-3;
 }else{
  by=Math.min(surfaceY(bx,t,base,rough)-3,FLOOR-6);
 }
 let rock=Math.sin(t*2.4)*(2+3*surging)+(!hold&&c>0&&c<1?Math.sin(c*Math.PI*6)*2:0);
 const hurt=hold?t-GAME.failAt:9;
 if(hurt>=0&&hurt<1.2)rock+=Math.sin(hurt*26)*9*Math.exp(-hurt*3);
 q('.w5-boat').setAttribute('transform','translate('+bx.toFixed(1)+' '+by.toFixed(1)+') rotate('+rock.toFixed(2)+') scale('+BOAT_S+')');
 const lampK=0.86+Math.sin(t*7.3)*.05+Math.sin(t*12.9+1.7)*.04;
 const lg=q('.w3-lampglow');if(lg)lg.style.opacity=lampK.toFixed(3);
 const lr=q('.w5-lampref');lr.setAttribute('cx',(bx+BOAT_S*51).toFixed(1));lr.setAttribute('cy',(surfaceY(bx+64,t,base,rough)+6).toFixed(1));lr.style.opacity=(0.55*lampK).toFixed(3);
 const warm=q('.w5-warm');warm.setAttribute('cx',(bx+60).toFixed(1));warm.setAttribute('cy',(by-30).toFixed(1));warm.style.opacity=lampK.toFixed(3);
 // 선체에 닿은 위액이 지글거림
 const inAcid=by>=surfaceY(bx,t,base,rough)-4;
 qa('.w5-siz').forEach(s=>{
  const i=+s.dataset.i,ph=(t*2.2+i*0.37)%1;
  s.setAttribute('cx',(bx+(i-3.5)*14*BOAT_S*0.9).toFixed(1));s.setAttribute('cy',(by+6-ph*14).toFixed(1));
  s.style.opacity=(inAcid||(hurt>=0&&hurt<1.2))?(0.8*(1-ph)).toFixed(3):'0';
 });

 // 거품: 바닥에서 올라와 표면에서 터짐
 qa('.w5-bub').forEach(b=>{
  const P=BUBS[+b.dataset.i],ph=((t*P.v+P.p)%1.6)/1.6;
  const top=surfaceY(P.x,t,base,rough),depth=Math.max(20,H-top);
  const y=H-ph*depth;
  b.setAttribute('cx',(P.x+Math.sin(t*3+P.p*4)*4).toFixed(1));b.setAttribute('cy',y.toFixed(1));
  const popping=ph>0.92;
  b.setAttribute('r',(popping?P.s*(1+(ph-0.92)*25):P.s).toFixed(1));
  b.style.opacity=(popping?0.6*(1-(ph-0.92)/0.08):0.28).toFixed(3);
  b.style.strokeWidth=popping?'1':'1.6';
 });
 // 김: 표면에서 피어올라 흩어짐(위액이 높을수록 진함)
 qa('.w5-puff').forEach(p=>{
  const P=PUFFS[+p.dataset.i],ph=((t*P.v+P.p)%1);
  const y=surfaceY(P.x,t,base,rough)-ph*(70+(+p.dataset.i%3)*35);
  p.setAttribute('cx',(P.x+ph*30).toFixed(1));p.setAttribute('cy',y.toFixed(1));
  p.setAttribute('rx',(24+ph*40).toFixed(1));p.setAttribute('ry',(14+ph*22).toFixed(1));
  p.style.opacity=((0.03+0.1*surging)*Math.sin(ph*Math.PI)).toFixed(3);
 });
 // 천장의 방울
 qa('.w5-drip').forEach(dr=>{
  const P=DRIPS[+dr.dataset.i],ph=((t+P.p)%2.4)/2.4;
  const fallStart=0.55;
  let y=P.y0+(ph<fallStart?ph*8:Math.pow((ph-fallStart)/(1-fallStart),2)*(surfaceY(P.x,t,base,rough)-P.y0));
  dr.setAttribute('cx',P.x.toFixed(1));dr.setAttribute('cy',y.toFixed(1));
  dr.style.opacity=(ph<0.98?0.8:0).toFixed(3);
 });
 // 위벽이 천천히 수축
 q('.w5-breathe').setAttribute('transform','translate(480 270) scale('+(1+Math.sin(t*0.9)*0.012).toFixed(4)+') translate(-480 -270)');
 // 위액이 솟구칠 때 화면 흔들림
 let sh=hold?0:3.5*clamp((t-T.surge[0])/0.3)*Math.exp(-Math.max(0,t-T.surge[0]-0.3)*2.2)*(t<T.drain[0]?1:0);
 if(hurt>=0&&hurt<1)sh+=6*Math.exp(-hurt*4);
 q('.w5-root').setAttribute('transform','translate('+(Math.sin(t*55)*sh).toFixed(2)+' '+(Math.sin(t*43+1)*sh).toFixed(2)+')');
 // 반복 경계
 const v=hold?0:(t<0.6?1-t/0.6:clamp((t-T.loop[0])/(T.loop[1]-T.loop[0])));
 q('.w5-veil').style.opacity=(v*0.95).toFixed(3);
 // 미니게임 표시: 빠진 순간 통로가 빛남 · 휩쓸림 · 진행 칸
 const cue=q('.w5-cue');
 if(hold){
  const open=GAME.steps<3&&inWindow(t);
  cue.style.opacity=open?(0.75+0.25*Math.sin(t*20)).toFixed(3):'0';
  q('.w5-hurt').style.opacity=hurt>=0&&hurt<0.8?(0.9*(1-hurt/0.8)).toFixed(3):'0';
  el.classList.toggle('w5-playing',GAME.steps<3);
  el.classList.toggle('w5-open',open);
  el.querySelectorAll('.w5-progress i').forEach((pip,i)=>pip.className=i<GAME.steps?'on':'');
  const vd=el.querySelector('.w5-verdict'),lastOk=GAME.stepAt.length?t-GAME.stepAt[GAME.stepAt.length-1]:9;
  const txt=hurt>=0&&hurt<1.1?'휩쓸림':lastOk<1.1?(GAME.steps>=3?'통과':'전진'):'';
  vd.textContent=txt;vd.className='w5-verdict'+(txt?(txt==='휩쓸림'?' miss':' hit'):'');
 }else{cue.style.opacity='0';q('.w5-hurt').style.opacity='0';el.classList.remove('w5-playing','w5-open');}
}
requestAnimationFrame(frame);

/* ---------- 연결 ---------- */
const prev=V2.html;
function sceneHtml(name){return name==='acid'?acidHtml():prev(name);}
window.PallidCinematicV2=Object.assign({},V2,{html:sceneHtml});
V3.html=sceneHtml;V3.acid=acidHtml;
try{
 // 인어 단계와 인어 전투에는 시네마틱 이펙트를 띄우지 않는다
 if(typeof pallidFxNow162==='function'){
  const beforeNow=pallidFxNow162;
  pallidFxNow162=function(){
   if(state.scene==='battle'&&state.battle&&state.battle.type==='pallidMermaid161')return null;
   if(state.scene===PALLID_SCENE_161&&state.pallidHunt161&&state.pallidHunt161.phase==='mermaids')return null;
   return beforeNow();
  };
 }
 if(typeof pallidFxMarkup162==='function'){
  pallidFxMarkup162=sceneHtml;
  if(typeof render==='function')render();
 }
}catch(e){console.warn('창백한 고래 위산 장면 연결 지연',e);}
})();
