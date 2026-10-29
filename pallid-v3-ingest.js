/* 창백의 향유고래 · v3 시네마틱 · 위장 진입(삼킴) 장면
   쪽배 아래로 창백한 그림자가 떠오르고 → 고래가 입을 벌린 채 수직으로 솟구쳐
   → 배가 목구멍으로 미끄러져 들어가고 → 턱이 닫히며 → 고래가 가라앉은 뒤
   → 어둠 속에 등불 하나만 흔들린다(위산 장면으로 이어짐).
   작살 장면과 같은 방식으로 시간 기준 requestAnimationFrame을 쓴다. */
(function(){
'use strict';
const V3=window.PallidCinematicV3,V2=window.PallidCinematicV2;
if(!V3||!V3.shared||!V2)return;
const {W,H,SEA,BOAT,seeded,esc,clamp,outC,inOut}=V3.shared;
const LOOP=8.4,NAMES=V2.names;

/* 고래 좌표계: 턱 경첩이 원점, 머리는 위(-y)를 향하고 오른쪽이 머리, 왼쪽이 아래턱 */
const HEAD='M0,90 L2,-200 C2,-240 -8,-268 -4,-292 C2,-320 40,-336 92,-336 C152,-336 198,-318 216,-284 C236,-248 240,-160 248,-60 C254,0 268,50 292,90 Z';
const HEAD_TOP='M-4,-292 C2,-320 40,-336 92,-336 C152,-336 198,-318 216,-284 C236,-248 240,-160 248,-60';
const JAW='M-30,70 L-26,-232 Q-24,-262 -6,-266 L3,-256 L3,70 Z';
const JAW_PIVOT=[0,12],WS=1.0,HX=528;
const HIDE=SEA+420,UP=SEA+26;
const BOAT_S=1.15,BOAT_X=440;

function teeth(){
 let s='';
 for(let y=-238;y<=-28;y+=19){
  const h=11+((y*7)%5+5)%5;
  s+='<path d="M2,'+(y-5.5)+' L'+(2+h)+','+(y+1)+' L2,'+(y+6)+' Z"/>';
 }
 return s;
}
function sockets(){
 let s='';
 for(let y=-232;y<=-30;y+=19)s+='<ellipse cx="7" cy="'+(y+9)+'" rx="3.2" ry="5"/>';
 return s;
}
function headTexture(){
 const r=seeded(17);let s='';
 for(let i=0;i<12;i++){const x=24+r()*170,y=-290+r()*190,rad=1.8+r()*4;s+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+rad.toFixed(1)+'" stroke-opacity="'+(0.1+r()*0.2).toFixed(2)+'"/>';}
 return s;
}
function wrinkleBands(){
 const r=seeded(23);let s='';
 for(let i=0;i<9;i++){
  const y=-70+i*13;let d='M4,'+y;
  for(let x=4;x<236;x+=24)d+=' Q'+(x+12)+','+(y+(r()-.5)*6).toFixed(1)+' '+(x+24)+','+(y+(r()-.5)*2.5).toFixed(1);
  s+='<path d="'+d+'"/>';
 }
 return s;
}
// 목구멍 안쪽 주름: 위·아래로 갈라진 불규칙한 살 주름
function ribs(){
 let s='';
 for(let i=0;i<6;i++){
  const R=95+i*58,w=(9-i*1.1).toFixed(1),op=(0.9-i*0.12).toFixed(2);
  for(const [a0,a1] of [[200,338],[22,158]]){
   let d='';
   for(let a=a0;a<=a1;a+=6){
    const k=a*Math.PI/180,rr=R*(1+0.07*Math.sin(a*0.11+i*1.7)+0.04*Math.sin(a*0.37+i));
    const x=480+Math.cos(k)*rr,y=300+Math.sin(k)*rr*0.6;
    d+=(d?' L':'M')+x.toFixed(1)+','+y.toFixed(1);
   }
   s+='<path d="'+d+'" stroke-width="'+w+'" stroke-opacity="'+op+'"/>';
  }
 }
 return s;
}
// 달빛에 비친 쪽배 윤곽
const BOAT_RIM='<path d="M-50,-11 L-44,-8 L38,-8 Q47,-9 55,-17 L52,-9 Q47,3 33,6 L-34,6 Q-46,4 -50,-11 Z" fill="none" stroke="#a5b5ae" stroke-opacity=".45" stroke-width=".9"/>'+
 '<path d="M-3,-17 L-3,-52" stroke="#a5b5ae" stroke-opacity=".3" stroke-width=".7" transform="translate(1.3 0)"/>';

function ingestHtml(){
 const title=NAMES.ingest;
 const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'+
 '<defs>'+
  '<linearGradient id="w4Sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#04070b"/><stop offset=".62" stop-color="#121b21"/><stop offset="1" stop-color="#1f2a2f"/></linearGradient>'+
  '<linearGradient id="w4Sea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#151f24" stop-opacity=".93"/><stop offset=".25" stop-color="#0b1216" stop-opacity=".97"/><stop offset="1" stop-color="#020305"/></linearGradient>'+
  '<linearGradient id="w4Skin" x1="0" y1="0" x2=".25" y2="1"><stop stop-color="#eceddf"/><stop offset=".25" stop-color="#bcc3b9"/><stop offset=".55" stop-color="#717c78"/><stop offset=".8" stop-color="#2f393d"/><stop offset="1" stop-color="#172025"/></linearGradient>'+
  '<linearGradient id="w4JawSkin" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#59625f"/><stop offset=".55" stop-color="#b4bbb1"/><stop offset="1" stop-color="#d9dccf"/></linearGradient>'+
  '<linearGradient id="w4Side" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#000" stop-opacity=".1"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>'+
  '<radialGradient id="w4Throat" cx=".8" cy=".85" r=".95"><stop stop-color="#000"/><stop offset=".6" stop-color="#040103"/><stop offset=".86" stop-color="#1d0a10"/><stop offset="1" stop-color="#4a1d27"/></radialGradient>'+
  '<radialGradient id="w4Moon"><stop stop-color="#e9ece2" stop-opacity=".55"/><stop offset=".18" stop-color="#c9d3cf" stop-opacity=".2"/><stop offset="1" stop-color="#9fb0b0" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w3Lamp"><stop stop-color="#ffbf47" stop-opacity=".95"/><stop offset=".22" stop-color="#ffbf47" stop-opacity=".42"/><stop offset=".6" stop-color="#ffbf47" stop-opacity=".08"/><stop offset="1" stop-color="#ffbf47" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w4InLamp"><stop stop-color="#ffd27a" stop-opacity=".9"/><stop offset=".12" stop-color="#ffb24a" stop-opacity=".45"/><stop offset=".45" stop-color="#b8484f" stop-opacity=".16"/><stop offset="1" stop-color="#3a0f1c" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w4Ghost"><stop stop-color="#dfe5dc" stop-opacity=".9"/><stop offset="1" stop-color="#dfe5dc" stop-opacity="0"/></radialGradient>'+
  '<filter id="w4Mist" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="14 6"/></filter>'+
  '<filter id="w4Rim" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter>'+
  '<filter id="w4Blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>'+
  '<filter id="w4Run" x="-50%" y="-5%" width="200%" height="110%"><feGaussianBlur stdDeviation="2.6 5"/></filter>'+
  '<filter id="w4Spray" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.2"/></filter>'+
  '<filter id="w4Skinfx" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .55" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .12  0 0 0 0 .12  0 0 0 -1.6 1.15"/></filter>'+
  '<path id="w4HeadShape" d="'+HEAD+'"/>'+
  '<clipPath id="w4HeadClip"><use href="#w4HeadShape"/></clipPath>'+
  '<clipPath id="w4Above"><rect width="'+W+'" height="'+(SEA+2)+'"/></clipPath>'+
 '</defs>'+
 '<g class="w4-root">'+
  '<rect width="'+W+'" height="'+H+'" fill="url(#w4Sky)"/>'+
  '<circle cx="808" cy="104" r="190" fill="url(#w4Moon)"/>'+
  '<circle cx="808" cy="104" r="27" fill="#dfe3da" opacity=".42" filter="url(#w4Rim)"/>'+
  '<g class="w4-mist" filter="url(#w4Mist)"><rect x="-200" y="250" width="700" height="34" rx="17" fill="#c7d2d2" opacity=".09"/><rect x="560" y="226" width="760" height="40" rx="20" fill="#c7d2d2" opacity=".08"/></g>'+
  '<path d="M0,'+SEA+' H'+W+'" stroke="#a8b9bb" stroke-opacity=".18" stroke-width="1.2"/>'+

  // 고래 (입 안 → 배 → 아래턱 → 머리 순서로 겹친다)
  '<g class="w4-whale">'+
   '<path class="w4-throat" fill="url(#w4Throat)"/>'+
  '</g>'+
  '<g clip-path="url(#w4Above)"><g class="w4-boat">'+BOAT+BOAT_RIM+'</g></g>'+
  '<g class="w4-whale front">'+
   '<g class="w4-jaw">'+
    '<path d="'+JAW+'" fill="url(#w4JawSkin)" stroke="#e9eadf" stroke-opacity=".35" stroke-width="1.5"/>'+
    '<path d="M-22,40 L-19,-220" stroke="#2e383c" stroke-opacity=".45" stroke-width="2" fill="none"/>'+
    '<g fill="#ece6d2" stroke="#a8a08b" stroke-width=".8" stroke-linejoin="round">'+teeth()+'</g>'+
   '</g>'+
   '<g class="w4-head">'+
    '<use href="#w4HeadShape" fill="url(#w4Skin)"/>'+
    '<g clip-path="url(#w4HeadClip)">'+
     '<rect x="-12" y="-340" width="310" height="440" filter="url(#w4Skinfx)" opacity=".55"/>'+
     '<use href="#w4HeadShape" fill="url(#w4Side)"/>'+
     '<ellipse cx="120" cy="-300" rx="120" ry="40" fill="#fbfbf3" opacity=".2" filter="url(#w4Rim)"/>'+
     '<g fill="none" stroke="#f1f3ea" stroke-width="1.3">'+headTexture()+'</g>'+
     '<g fill="none" stroke="#4c5856" stroke-opacity=".5" stroke-width="2.2" stroke-linecap="round">'+wrinkleBands()+'</g>'+
     '<path d="M40,-250 C70,-220 96,-190 110,-150 M58,-262 C88,-230 112,-200 126,-160" fill="none" stroke="#2e383c" stroke-opacity=".45" stroke-width="2.6"/>'+
     // 입천장 가장자리와 이빨 자리
     '<path d="M1,40 L2,-200 C2,-236 -5,-262 -3,-280 L9,-276 C9,-250 13,-224 13,-200 L14,40 Z" fill="#33161d"/>'+
     '<g fill="#1a0a0f" opacity=".8">'+sockets()+'</g>'+
     // 솟구칠 때 머리에서 쏟아지는 물
     '<g class="w4-runoff" fill="none" stroke="#eef4f2" stroke-linecap="round" filter="url(#w4Run)">'+
      Array.from({length:12},(_,i)=>{const r=seeded(60+i),x=8+i*19+r()*8;return '<path d="M'+x.toFixed(0)+','+(-326+Math.abs(i-5)*3)+' C'+(x-2).toFixed(0)+',-220 '+(x+3).toFixed(0)+',-90 '+(x-2).toFixed(0)+',80" stroke-width="'+(3+r()*4).toFixed(1)+'" stroke-dasharray="'+(50+r()*70).toFixed(0)+' '+(30+r()*50).toFixed(0)+'" stroke-dashoffset="'+(r()*80).toFixed(0)+'"/>';}).join('')+'</g>'+
     '<g class="w4-eye"><ellipse cx="58" cy="-14" rx="11" ry="7.5" fill="#2b3538" opacity=".7"/><ellipse cx="58" cy="-14" rx="6.5" ry="4.6" fill="#040607"/><circle cx="56" cy="-15.5" r="1.3" fill="#e8ece6" opacity=".8"/>'+
      '<path class="w4-lid" d="M46,-14 Q58,-24 70,-14" fill="none" stroke="#c9cfc6" stroke-opacity=".55" stroke-width="1.8"/></g>'+
    '</g>'+
    '<path d="'+HEAD_TOP+'" fill="none" stroke="#f4f5ec" stroke-opacity=".55" stroke-width="2.6" filter="url(#w4Rim)"/>'+
   '</g>'+
  '</g>'+

  // 수면 (물에 잠긴 부분을 덮는다)
  '<rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" fill="url(#w4Sea)"/>'+
  '<ellipse class="w4-ghost" cx="'+(BOAT_X+70)+'" cy="'+(SEA+58)+'" rx="170" ry="40" fill="url(#w4Ghost)" filter="url(#w4Blur)" opacity="0"/>'+
  '<g class="w4-waves" fill="none" stroke="#b9c9cb" stroke-linecap="round">'+[0,1,2,3,4,5,6,7].map(i=>{const y=SEA+7+i*i*2.6+i*7;return '<path class="w4-wave" data-i="'+i+'" d="M-60,'+y.toFixed(1)+' H'+(W+60)+'" stroke-opacity="'+(.15-i*.012).toFixed(3)+'" stroke-width="'+(1+i*.3).toFixed(2)+'" stroke-dasharray="'+(30+i*14)+' '+(40+i*22)+'"/>';}).join('')+'</g>'+
  '<g class="w4-foam" fill="none" stroke="#e7efed" stroke-linecap="round">'+
   [0,1,2].map(i=>'<ellipse class="w4-ring" data-i="'+i+'" cx="'+(HX+40)+'" cy="'+(SEA+4)+'" rx="100" ry="7"/>').join('')+
   '<path class="w4-surf" d="M240,'+(SEA+1)+' Q300,'+(SEA-6)+' 360,'+(SEA+1)+' T480,'+(SEA+1)+' T600,'+SEA+' T720,'+(SEA+1)+' T840,'+SEA+'" stroke-width="2.6" opacity="0"/></g>'+
  '<ellipse class="w4-lampglint" cx="0" cy="'+(SEA+9)+'" rx="22" ry="3" fill="#ffbf47" filter="url(#w4Rim)" opacity="0"/>'+
  '<g class="w4-spray" filter="url(#w4Spray)">'+Array.from({length:46},(_,i)=>'<circle class="w4-drop" data-i="'+i+'" r="'+(i%5===0?5:i%2?2.2:3.4)+'" fill="#e3ece9" opacity="0"/>').join('')+'</g>'+
  '<g class="w4-mist near" filter="url(#w4Mist)"><rect x="-300" y="'+(SEA-16)+'" width="900" height="30" rx="15" fill="#d3dcdc" opacity=".08"/><rect x="420" y="'+(SEA-34)+'" width="900" height="26" rx="13" fill="#d3dcdc" opacity=".06"/></g>'+

  // 삼켜진 뒤: 어둠 속 목구멍과 등불 하나
  '<rect class="w4-veil" width="'+W+'" height="'+H+'" fill="#020205" opacity="0"/>'+
  '<g class="w4-inside" opacity="0">'+
   '<g fill="none" stroke="#7a2f3e" stroke-linecap="round" stroke-linejoin="round" class="w4-ribs">'+ribs()+'</g>'+
   '<circle class="w4-inglow" cx="480" cy="300" r="260" fill="url(#w4InLamp)"/>'+
   '<g class="w4-inlamp"><path d="M0,-70 L0,-6" stroke="#0a0607" stroke-width="1.6"/><rect x="-5" y="-6" width="10" height="12" rx="2" fill="#ffe39a" stroke="#ffbf47" stroke-width="1.4"/></g>'+
  '</g>'+
  '<rect class="w4-loopveil" width="'+W+'" height="'+H+'" fill="#020306" opacity="0"/>'+
 '</g></svg>';
 return '<div class="pallid-cine-v2 pallid-cine-v3 w4-ingest-scene" role="img" aria-label="'+esc(title[0]+' · '+title[1])+'">'+svg+
  '<span class="cine-top" aria-hidden="true">창백의 향유고래 · '+esc(title[0])+'</span>'+
  '<span class="cine-bottom" aria-hidden="true">'+esc(title[1])+'</span>'+
  '<span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}

/* ---------- 애니메이션 ---------- */
const T={ghost:[0.2,1.6],rise:[1.4,2.3],slide:[2.5,3.5],snap:[3.45,3.75],sink:[4.3,5.7],dark:[5.3,5.9],inside:[5.6,7.7],loop:[7.7,8.4]};
const DROPS=Array.from({length:46},(_,i)=>{const r=seeded(700+i);return {x:250+r()*600,vx:(r()-.5)*90,vy:-(220+r()*360),d:r()*0.35,life:1.1+r()*0.6};});
const rot=(p,deg,c)=>{const a=deg*Math.PI/180,x=p[0]-c[0],y=p[1]-c[1];return [c[0]+x*Math.cos(a)-y*Math.sin(a),c[1]+x*Math.sin(a)+y*Math.cos(a)];};

let start=0,lastSeen=0;
function frame(now){
 const el=document.querySelector('.w4-ingest-scene');
 if(el&&el.isConnected){
  const paused=!!el.closest('.is-paused');
  if(now-lastSeen>900)start=now;
  if(paused)start+=now-lastSeen;
  lastSeen=now;
  // data-seek가 있으면 그 시각에 고정(미리보기·검수용)
  paint(el,el.dataset.seek!=null?+el.dataset.seek:((now-start)/1000)%LOOP);
 }
 requestAnimationFrame(frame);
}
function paint(el,t){
 const q=s=>el.querySelector(s),qa=s=>el.querySelectorAll(s);
 // 고래 위치: 솟구침 → 유지 → 가라앉음
 const rise=outC((t-T.rise[0])/(T.rise[1]-T.rise[0]));
 const sink=inOut((t-T.sink[0])/(T.sink[1]-T.sink[0]));
 const hy=HIDE+(UP-HIDE)*rise+(HIDE-UP)*sink+Math.sin(t*1.3)*3*rise*(1-sink);
 const tilt=-9*(1-sink)+4*sink+Math.sin(t*.9)*.6;
 // 턱: 벌린 채 올라와 배가 미끄러지면 덥석 닫힘(살짝 튕김)
 const snapU=clamp((t-T.snap[0])/(T.snap[1]-T.snap[0]));
 let jaw=-60*(1-Math.pow(snapU,2.2));
 if(t>T.snap[1]){const k=t-T.snap[1];jaw+= -4*Math.exp(-k*7)*Math.sin(k*30);}
 jaw+=Math.sin(t*2.1)*1.2*(1-snapU);
 const G='translate('+HX+' '+hy.toFixed(1)+') rotate('+tilt.toFixed(2)+') scale('+(WS*1.08).toFixed(3)+' '+(WS*0.86).toFixed(3)+')';
 qa('.w4-whale').forEach(g=>g.setAttribute('transform',G));
 q('.w4-jaw').setAttribute('transform','rotate('+jaw.toFixed(2)+' '+JAW_PIVOT[0]+' '+JAW_PIVOT[1]+')');
 // 목구멍: 경첩 · 아래턱 끝 · 입천장 끝을 잇는 어두운 틈
 const tip=rot([-15,-262],jaw,JAW_PIVOT),mid=rot([-10,-120],jaw,JAW_PIVOT);
 q('.w4-throat').setAttribute('d','M2,30 L'+mid[0].toFixed(1)+','+mid[1].toFixed(1)+' L'+tip[0].toFixed(1)+','+tip[1].toFixed(1)+
  ' L-2,-280 Z');
 const run=q('.w4-runoff');
 run.style.opacity=(0.28*rise*(1-clamp((t-T.rise[1])/2.2))).toFixed(3);
 run.style.strokeDashoffset=(-t*140).toFixed(1);
 // 눈: 턱이 닫힐 때 감김
 const blink=t>T.snap[0]&&t<T.snap[1]+0.45?Math.sin((t-T.snap[0])/0.75*Math.PI):0;
 q('.w4-lid').setAttribute('d','M46,-14 Q58,'+(-24+blink*11).toFixed(1)+' 70,-14');

 // 배: 출렁임 → 솟구친 물에 들렸다가 → 목구멍 쪽으로 기울며 미끄러져 사라짐
 const lift=24*rise;
 const sl=inOut((t-T.slide[0])/(T.slide[1]-T.slide[0]));
 const bx=BOAT_X+60*sl+Math.sin(t*1.1)*3*(1-rise);
 const by=SEA+Math.sin(t*1.6)*2.2*(1-rise)-lift*(1-sl)+110*sl*sl;
 const brot=Math.sin(t*1.25+.6)*2.6*(1-rise)+(rise>0?Math.sin(t*5)*3*rise*(1-sl):0)+34*sl;
 const boat=q('.w4-boat');
 boat.setAttribute('transform','translate('+bx.toFixed(1)+' '+by.toFixed(1)+') rotate('+brot.toFixed(2)+') scale('+(BOAT_S*(1-0.18*sl)).toFixed(3)+')');
 boat.style.opacity=t>T.snap[1]?'0':'1';
 const lampK=0.86+Math.sin(t*7.3)*.05+Math.sin(t*12.9+1.7)*.04;
 const lg=q('.w3-lampglow');if(lg)lg.style.opacity=lampK.toFixed(3);
 const glint=q('.w4-lampglint');
 glint.setAttribute('cx',(bx+BOAT_S*51).toFixed(1));
 glint.style.opacity=(0.4*lampK*(1-rise)).toFixed(3);

 // 물속에서 떠오르는 창백한 그림자
 const gh=clamp((t-T.ghost[0])/(T.ghost[1]-T.ghost[0]));
 const ghost=q('.w4-ghost');
 ghost.style.opacity=(0.3*gh*(1-rise)).toFixed(3);
 ghost.setAttribute('ry',(36+gh*18).toFixed(1));ghost.setAttribute('rx',(150+gh*40).toFixed(1));

 // 물결 · 물보라 · 고리
 qa('.w4-wave').forEach(w=>{const i=+w.dataset.i;w.style.strokeDashoffset=(t*(8+i*6)*(i%2?1:-1)).toFixed(1);});
 const surf=q('.w4-surf');
 surf.style.opacity=(0.55*rise*(1-sink)+0.2).toFixed(3);
 surf.setAttribute('transform','translate(0 '+(Math.sin(t*1.7)*1.5).toFixed(1)+')');
 qa('.w4-ring').forEach(r=>{
  const i=+r.dataset.i,t0=i===0?T.ghost[0]+0.6:T.sink[0]+(i-1)*0.5,p=clamp((t-t0)/2.6);
  r.setAttribute('rx',(100+p*300).toFixed(1));r.setAttribute('ry',(6+p*14).toFixed(1));
  r.style.strokeOpacity=((1-p)*.5*(p>0&&p<1?1:0)).toFixed(3);r.style.strokeWidth=(2.6-p*1.8).toFixed(2);
 });
 qa('.w4-drop').forEach(d=>{
  const P=DROPS[+d.dataset.i],s=t-T.rise[0]-0.15-P.d;
  if(s<=0||s>P.life){d.style.opacity='0';return;}
  const x=P.x+P.vx*s,y=SEA+P.vy*s+430*s*s;
  d.setAttribute('cx',x.toFixed(1));d.setAttribute('cy',y.toFixed(1));
  d.style.opacity=(y>SEA+4?0:0.75*(1-s/P.life)).toFixed(3);
 });
 qa('.w4-mist').forEach((m,i)=>m.setAttribute('transform','translate('+(Math.sin(t*0.13+i*2)*50).toFixed(1)+' 0)'));

 // 화면 흔들림: 솟구칠 때와 턱이 닫힐 때
 let sh=0;
 if(t>T.rise[0]+0.1&&t<T.rise[1]+0.4)sh=5*Math.exp(-(t-T.rise[0]-0.1)*2.5);
 if(t>T.snap[1])sh+=7*Math.exp(-(t-T.snap[1])*6);
 q('.w4-root').setAttribute('transform','translate('+(Math.sin(t*61)*sh).toFixed(2)+' '+(Math.sin(t*47+1)*sh).toFixed(2)+')');

 // 어둠 속 등불: 목구멍 안에서 흔들리는 작은 빛
 const dark=clamp((t-T.dark[0])/(T.dark[1]-T.dark[0]));
 const ins=clamp((t-T.inside[0])/0.6)*(1-clamp((t-T.inside[1]+0.5)/0.5));
 q('.w4-veil').style.opacity=(0.97*dark).toFixed(3);
 const inside=q('.w4-inside');
 inside.style.opacity=ins.toFixed(3);
 const sw=Math.sin((t-T.inside[0])*1.9)*14;
 q('.w4-inlamp').setAttribute('transform','translate(480 300) rotate('+sw.toFixed(2)+' 0 -70)');
 const fl=0.82+Math.sin(t*7.3)*.06+Math.sin(t*12.9+1.7)*.05;
 const lx=480+Math.sin(sw*Math.PI/180)*70;
 const ig=q('.w4-inglow');ig.setAttribute('cx',lx.toFixed(1));ig.style.opacity=fl.toFixed(3);
 const rb=q('.w4-ribs');rb.style.opacity=(0.35*fl).toFixed(3);
 rb.setAttribute('transform','translate('+((lx-480)*0.3).toFixed(1)+' 0) scale(1 '+(1+Math.sin(t*2.4)*0.015).toFixed(4)+')');

 // 반복 경계
 const lv=t<0.5?1-t/0.5:clamp((t-T.loop[0])/(T.loop[1]-T.loop[0]));
 q('.w4-loopveil').style.opacity=(lv*0.95).toFixed(3);
}
requestAnimationFrame(frame);

/* ---------- 연결 ---------- */
const prev=V2.html;
function sceneHtml(name){return name==='ingest'?ingestHtml():prev(name);}
window.PallidCinematicV2=Object.assign({},V2,{html:sceneHtml});
V3.html=sceneHtml;V3.ingest=ingestHtml;
try{
 if(typeof pallidFxMarkup162==='function'){
  pallidFxMarkup162=sceneHtml;
  if(typeof render==='function')render();
 }
}catch(e){console.warn('창백한 고래 삼킴 장면 연결 지연',e);}
})();
