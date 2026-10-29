/* 모든 것을 삼키는 창백한 고래 · v3 시네마틱 · 4단계 심장 탐색(옛 '심장 탐색'+'최종 전투')
   혈관이 뒤엉킨 어둠 속, 피 웅덩이 위의 쪽배가 등불로 거대한 심장을 비춘다.
   큰 심장의 박동 사이로 다른 박자로 뛰는 창백한 작은 심장을 찾아내고
   → 등불 빛이 멈추고 → 작살잡이가 던진 작살이 작은 심장에 꽂혀 금이 간다.
   (심장 파괴는 5단계에서 이어진다.) 시간 기준 requestAnimationFrame 방식. */
(function(){
'use strict';
const V3=window.PallidCinematicV3,V2=window.PallidCinematicV2;
if(!V3||!V3.shared||!V2)return;
const {W,H,BOAT,seeded,esc,clamp,outC,inOut}=V3.shared;
const LOOP=9.2;
const LABEL=['심장 탐색','다른 박자로 뛰는 작은 심장을 찾아 작살을 꽂습니다.'];
const POOL=408,BOAT_AT=[196,POOL],BOAT_S=1.4;
const HC=[630,300];            // 심장 도형의 기준점
const PLACE=[648,214],ROT=-26,SCL=0.78;  // 화면 배치: 위로 올리고 심첨이 오른쪽 아래를 향하게 기울임           // 큰 심장 중심
const SMALL=[606,318];        // 작은 심장 중심

// 큰 심장: 심첨이 왼쪽 아래로 기운 해부학적 형태
// 심첨이 오른쪽 아래로 처진 비대칭 심장
const BIG='M540,178 C486,184 452,236 456,298 C460,360 502,408 566,442 C620,470 668,486 708,490 C720,480 730,460 744,428 C772,368 794,306 788,246 C782,194 746,166 702,168 C670,170 650,184 634,192 C608,176 574,172 540,178 Z';
const AORTA='M614,192 C600,146 606,104 642,88 C680,72 724,84 744,124 C754,146 754,168 750,198';
const BRANCH='M632,92 L618,8 M662,80 L664,0 M696,82 L716,4';
const PULM='M654,204 C666,168 688,148 716,142 M694,148 C716,158 748,166 790,152 M700,146 C700,120 690,96 670,78';
const CAVA='M540,182 C532,130 530,70 538,-10';
const GROOVE='M640,196 C624,276 642,388 706,486';
const CORONARY='M640,196 C624,276 642,388 706,486 M632,250 C600,262 576,290 566,330 M646,330 C680,336 712,352 736,380 M560,206 C530,236 508,280 504,330 M720,190 C748,222 764,262 768,300';

function vesselPaths(){
 return [
  'M-40,120 C120,100 240,170 330,150 C420,130 470,170 512,190',
  'M-40,330 C80,290 180,330 280,290 C360,258 420,262 470,280',
  'M1000,90 C900,110 840,60 780,120',
  'M1000,380 C920,360 860,410 790,360',
  'M300,-20 C320,60 290,120 340,180 C380,230 430,220 470,230',
  'M820,560 C800,480 760,460 700,452'
 ];
}

function heartHtml(){
 const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'+
 '<defs>'+
  '<radialGradient id="w6Dark" cx=".62" cy=".5" r=".75"><stop stop-color="#2a0a13"/><stop offset=".5" stop-color="#14050a"/><stop offset="1" stop-color="#040103"/></radialGradient>'+
  '<radialGradient id="w6Heart" cx=".42" cy=".38" r=".7"><stop stop-color="#b24a55"/><stop offset=".35" stop-color="#7c2433"/><stop offset=".75" stop-color="#3d0f1b"/><stop offset="1" stop-color="#1c060c"/></radialGradient>'+
  '<radialGradient id="w6Chamber" cx=".5" cy=".5" r=".5"><stop stop-color="#06020a"/><stop offset=".7" stop-color="#1a050c"/><stop offset="1" stop-color="#5b1a2a"/></radialGradient>'+
  '<radialGradient id="w6Pale" cx=".38" cy=".32" r=".75"><stop stop-color="#eceee2"/><stop offset=".45" stop-color="#b9bfb3"/><stop offset=".85" stop-color="#6f7871"/><stop offset="1" stop-color="#454d49"/></radialGradient>'+
  '<radialGradient id="w6PaleGlow"><stop stop-color="#f3f6e8" stop-opacity=".7"/><stop offset=".35" stop-color="#cfd8cc" stop-opacity=".2"/><stop offset="1" stop-color="#cfd8cc" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="w6Vessel" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7a2535"/><stop offset=".5" stop-color="#4a1220"/><stop offset="1" stop-color="#22070e"/></linearGradient>'+
  '<radialGradient id="w3Lamp"><stop stop-color="#ffbf47" stop-opacity=".95"/><stop offset=".22" stop-color="#ffbf47" stop-opacity=".42"/><stop offset=".6" stop-color="#ffbf47" stop-opacity=".08"/><stop offset="1" stop-color="#ffbf47" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w6Spot"><stop stop-color="#ffd38a" stop-opacity=".55"/><stop offset=".45" stop-color="#f09a6a" stop-opacity=".18"/><stop offset="1" stop-color="#f09a6a" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="w6Beam" class="w6-beamgrad" gradientUnits="userSpaceOnUse"><stop stop-color="#ffcf7a" stop-opacity=".34"/><stop offset="1" stop-color="#ffcf7a" stop-opacity=".03"/></linearGradient>'+
  '<radialGradient id="w6Flash"><stop stop-color="#fffdf0" stop-opacity=".95"/><stop offset=".3" stop-color="#ffd9c4" stop-opacity=".45"/><stop offset="1" stop-color="#ffd9c4" stop-opacity="0"/></radialGradient>'+
  '<filter id="w6Soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.5"/></filter>'+
  '<filter id="w6Blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>'+
  '<filter id="w6Tex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035 .08" numOctaves="3" seed="21"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .15  0 0 0 0 .2  0 0 0 1.4 -.6"/></filter>'+
  '<path id="w6BigShape" d="'+BIG+'"/>'+
  '<clipPath id="w6BigClip"><use href="#w6BigShape"/></clipPath>'+
 '</defs>'+
 '<g class="w6-root">'+
  '<rect width="'+W+'" height="'+H+'" fill="url(#w6Dark)"/>'+
  '<rect width="'+W+'" height="'+H+'" filter="url(#w6Tex)" opacity=".14"/>'+
  // 뒤엉킨 혈관과 그 위를 흐르는 박동
  '<g class="w6-vessels" fill="none" stroke-linecap="round">'+
   vesselPaths().map((d,i)=>'<path d="'+d+'" stroke="#2a0811" stroke-width="'+(34-i*3)+'"/><path class="w6-vessel" data-i="'+i+'" d="'+d+'" stroke="url(#w6Vessel)" stroke-width="'+(28-i*3)+'"/><path d="'+d+'" stroke="#e0848a" stroke-opacity=".14" stroke-width="2" transform="translate(0 -'+(8-i)+')"/>').join('')+
   vesselPaths().map((d,i)=>'<path class="w6-pulse" data-i="'+i+'" d="'+d+'" stroke="#ff7a86" stroke-width="'+(10-i)+'" stroke-dasharray="40 1400" opacity="0" filter="url(#w6Soft)"/>').join('')+
  '</g>'+
  // 큰 심장
  '<g class="w6-big">'+
   '<path d="'+CAVA+'" fill="none" stroke="#2c0912" stroke-width="34" stroke-linecap="round"/>'+
   '<path d="'+BRANCH+'" fill="none" stroke="#4a1220" stroke-width="15" stroke-linecap="round"/>'+
   '<path d="'+AORTA+'" fill="none" stroke="#6a1a2a" stroke-width="36" stroke-linecap="round"/>'+
   '<path d="'+AORTA+'" fill="none" stroke="#d58a8c" stroke-opacity=".22" stroke-width="3" transform="translate(-5 -9)"/>'+
   '<path d="'+PULM+'" fill="none" stroke="#3e0e1a" stroke-width="26" stroke-linecap="round"/>'+
   '<path d="'+PULM+'" fill="none" stroke="#c97a80" stroke-opacity=".16" stroke-width="2.4" transform="translate(-3 -7)"/>'+
   '<use href="#w6BigShape" fill="url(#w6Heart)"/>'+
   '<g clip-path="url(#w6BigClip)">'+
    '<rect x="430" y="140" width="380" height="340" filter="url(#w6Tex)" opacity=".35"/>'+
    '<path d="'+GROOVE+'" fill="none" stroke="#1e050b" stroke-opacity=".55" stroke-width="10" stroke-linecap="round" filter="url(#w6Soft)"/>'+
    '<path d="M600,196 C640,214 700,206 760,226 M590,206 C626,226 692,222 744,246" fill="none" stroke="#e8c7a4" stroke-opacity=".12" stroke-width="12" stroke-linecap="round" filter="url(#w6Soft)"/>'+
    '<path d="'+CORONARY+'" fill="none" stroke="#e8b098" stroke-opacity=".26" stroke-width="2.8" stroke-linecap="round"/>'+
    '<path d="'+CORONARY+'" fill="none" stroke="#2a0710" stroke-opacity=".5" stroke-width="1.4" transform="translate(2 2)"/>'+
    '<ellipse cx="530" cy="250" rx="46" ry="16" fill="#ffe2d4" opacity=".1" filter="url(#w6Soft)" transform="rotate(-50 530 250)"/>'+
    // 심실 안쪽이 보이는 틈(막이 찢어진 듯한 창)
    '<path class="w6-chamber" d="M560,288 C562,258 598,246 634,256 C664,266 670,306 656,340 C642,372 600,382 578,360 C560,342 558,314 560,288 Z" fill="url(#w6Chamber)"/>'+
    '<path d="M560,288 C562,258 598,246 634,256 C664,266 670,306 656,340 C642,372 600,382 578,360 C560,342 558,314 560,288 Z" fill="none" stroke="#d07a7f" stroke-opacity=".3" stroke-width="2.2"/>'+
    '<path d="M566,276 l-10,-8 M640,262 l9,-9 M660,330 l12,4 M590,372 l-4,12" stroke="#a84a55" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>'+
   '</g>'+
   '<path d="'+BIG+'" fill="none" stroke="#e39a96" stroke-opacity=".22" stroke-width="2.4"/>'+
  '</g>'+
  // 작은 심장: 창백하고 다른 박자로 뜀
  '<circle class="w6-paleglow" cx="'+SMALL[0]+'" cy="'+SMALL[1]+'" r="64" fill="url(#w6PaleGlow)" opacity=".3"/>'+
  '<g class="w6-small">'+
   '<path d="M-2,-24 C-4,-32 -8,-36 -14,-38 M8,-22 C14,-30 20,-31 26,-28" fill="none" stroke="#9aa298" stroke-width="3.2" stroke-linecap="round"/>'+
   '<path d="M-22,-20 C-34,-8 -32,12 -18,24 C-8,34 6,38 14,30 C26,18 32,2 28,-12 C24,-26 12,-30 2,-24 C-6,-30 -16,-28 -22,-20 Z" fill="url(#w6Pale)" stroke="#e9ece0" stroke-opacity=".45" stroke-width="1"/>'+
   '<path d="M2,-22 C-2,-4 4,14 12,28 M-16,-6 C-8,0 0,2 6,-2" fill="none" stroke="#596159" stroke-opacity=".55" stroke-width="1.3"/>'+
   '<g class="w6-crack" fill="none" stroke="#3a0811" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+
    '<path class="w6-crk" d="M2,-10 L-6,2 L4,10 L-4,24" stroke-dasharray="60" stroke-dashoffset="60"/>'+
    '<path class="w6-crk" d="M2,-10 L14,-16 L22,-8" stroke-dasharray="30" stroke-dashoffset="30"/>'+
    '<path class="w6-crk" d="M-6,2 L-18,6 L-24,0" stroke-dasharray="30" stroke-dashoffset="30"/>'+
   '</g>'+
  '</g>'+
  '<g class="w6-ping" fill="none" stroke="#eef3e4">'+[0,1].map(i=>'<circle class="w6-ring" data-i="'+i+'" cx="'+SMALL[0]+'" cy="'+SMALL[1]+'" r="40" opacity="0"/>').join('')+'</g>'+
  // 피 웅덩이와 쪽배
  '<path class="w6-pool" fill="#12030a"/>'+
  '<path class="w6-poolline" fill="none" stroke="#c46a72" stroke-opacity=".35" stroke-width="1.6"/>'+
  // 등불 빛줄기와 비춘 자리
  '<path class="w6-beam" fill="url(#w6Beam)" style="mix-blend-mode:screen"/>'+
  '<ellipse class="w6-spot" rx="90" ry="70" fill="url(#w6Spot)" style="mix-blend-mode:screen"/>'+
  '<g class="w6-boat">'+BOAT+'<path d="M-50,-11 L-44,-8 L38,-8 Q47,-9 55,-17 L52,-9 Q47,3 33,6 L-34,6 Q-46,4 -50,-11 Z" fill="none" stroke="#e0a58f" stroke-opacity=".35" stroke-width=".9"/></g>'+
  '<ellipse class="w6-lampref" rx="24" ry="3" fill="#ffc761" filter="url(#w6Soft)" opacity="0"/>'+
  // 작살과 밧줄
  '<path class="w6-trail" fill="none" stroke="#ffe7c4" stroke-width="2" stroke-linecap="round" filter="url(#w6Soft)" opacity="0"/>'+
  '<path class="w6-rope" fill="none" stroke="#b58c86" stroke-opacity=".75" stroke-width="1.5" opacity="0"/>'+
  '<g class="w6-harpoon" opacity="0">'+
   '<path d="M-104,0 L-10,0" stroke="#15191b" stroke-width="4" stroke-linecap="round"/>'+
   '<path d="M-104,-1.2 L-12,-1.2" stroke="#ffd9b0" stroke-opacity=".55" stroke-width="1.1"/>'+
   '<path d="M3,0 L-16,-6.5 L-11,0 L-16,6.5 Z" fill="#efe6dc" stroke="#bfae9e" stroke-width="1" stroke-linejoin="round"/></g>'+
  '<circle class="w6-flash" r="80" fill="url(#w6Flash)" opacity="0"/>'+
  '<g class="w6-spray">'+Array.from({length:18},(_,i)=>'<circle class="w6-drop" data-i="'+i+'" r="'+(i%3?2:3.2)+'" fill="'+(i%3===0?'#f2efe2':'#4a0a17')+'" opacity="0"/>').join('')+'</g>'+
  '<rect class="w6-dim" width="'+W+'" height="'+H+'" fill="#000" opacity="0" style="mix-blend-mode:multiply"/>'+
  '<rect class="w6-veil" width="'+W+'" height="'+H+'" fill="#020103" opacity="0"/>'+
 '</g></svg>';
 return '<div class="pallid-cine-v2 pallid-cine-v3 w6-heart-scene" role="img" aria-label="'+esc(LABEL[0]+' · '+LABEL[1])+'">'+svg+
  '<span class="cine-top" aria-hidden="true">모든 것을 삼키는 창백한 고래 · '+esc(LABEL[0])+'</span>'+
  '<span class="cine-bottom" aria-hidden="true">'+esc(LABEL[1])+'</span>'+
  '<span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}

/* ---------- 애니메이션 ---------- */
const T={search:[0.6,3.9],lock:[3.9,4.9],aim:[4.9,5.5],fly:[5.5,5.92],after:[5.92,8.4],loop:[8.5,9.2]};
const DROPS=Array.from({length:18},(_,i)=>{const r=seeded(1200+i);const a=Math.PI*(0.7+r()*0.9);const v=90+r()*180;return {vx:Math.cos(a)*v,vy:-Math.abs(Math.sin(a))*v,d:r()*0.08};});
const LIFT=26;
// 큰 심장 박동(두 번 뛰는 lub-dub), 작은 심장은 엇박
function lubdub(p){p=((p%1)+1)%1;return Math.exp(-Math.pow((p-0.06)/0.05,2))+0.6*Math.exp(-Math.pow((p-0.24)/0.05,2));}
function poolY(x,t){return POOL+Math.sin(x*0.02+t*1.4)*2.2+Math.sin(x*0.007-t*.8)*2;}

let start=0,lastSeen=0,seenTok=0;
function frame(now){
 const el=document.querySelector('.w6-heart-scene');
 if(el&&el.isConnected){
  const paused=!!el.closest('.is-paused');
  const tok=(window.PallidCinematicV3||{}).replayToken||0;
  if(now-lastSeen>900||tok!==seenTok){start=now;seenTok=tok;}   // 새로 열리거나 '다시 재생'일 때만 처음부터
  if(paused)start+=now-lastSeen;
  lastSeen=now;
  paint(el,el.dataset.seek!=null?+el.dataset.seek:((now-start)/1000)%LOOP);
 }
 requestAnimationFrame(frame);
}
function paint(el,t){
 const q=s=>el.querySelector(s),qa=s=>el.querySelectorAll(s);
 const hit=t-T.fly[1];
 // 큰 심장: 탐색 중 1.05초 주기, 조준 때 느려지고, 명중 후 경련
 // 박자가 바뀌어도 끊기지 않게 위상을 누적
 const a1=T.lock[0],a2=T.fly[1];
 const ph=Math.min(t,a1)/1.05+clamp(t-a1,0,a2-a1)/1.35+Math.max(0,t-a2)/0.62;
 const period=t<a1?1.05:t<a2?1.35:0.62;
 const beat=lubdub(ph);
 let bigS=1+beat*0.035,bigR=0;
 if(hit>0){const k=Math.exp(-hit*1.4);bigS+=Math.sin(hit*23)*0.02*k;bigR=Math.sin(hit*17)*1.6*k;}
 const rr=(ROT+bigR)*Math.PI/180,k=SCL*bigS;
 const toHeart=p=>[PLACE[0]+k*((p[0]-HC[0])*Math.cos(rr)-(p[1]-HC[1])*Math.sin(rr)),PLACE[1]+k*((p[0]-HC[0])*Math.sin(rr)+(p[1]-HC[1])*Math.cos(rr))];
 q('.w6-big').setAttribute('transform','translate('+PLACE[0]+' '+PLACE[1]+') rotate('+(ROT+bigR).toFixed(2)+') scale('+k.toFixed(4)+') translate('+(-HC[0])+' '+(-HC[1])+')');
 // 혈관: 박동마다 굵어지고 빛이 흘러감
 qa('.w6-vessel').forEach(v=>{const i=+v.dataset.i;v.style.strokeWidth=((28-i*3)*(1+0.12*lubdub(ph-0.08-i*0.04))).toFixed(1);});
 qa('.w6-pulse').forEach(p=>{
  const i=+p.dataset.i,pp=((ph-i*0.13)%1+1)%1;
  p.style.strokeDashoffset=(1400-pp*1400).toFixed(0);
  p.style.opacity=((hit>0?0.75:0.45)*(1-pp)).toFixed(3);
 });
 // 작은 심장: 0.68초 엇박, 명중 후 박동이 흐트러짐
 const sph=Math.min(t,a2)/0.68+Math.max(0,t-a2)/0.95;
 const sb=lubdub(sph+0.5)*(hit>0?Math.max(0.25,1-hit*0.3):1);
 const ss=1+sb*0.09;
 const [sx,sy]=toHeart(SMALL);
 q('.w6-small').setAttribute('transform','translate('+sx.toFixed(1)+' '+sy.toFixed(1)+') rotate('+(ROT-8+bigR*2).toFixed(2)+') scale('+(ss*SCL).toFixed(4)+')');
 const pg=q('.w6-paleglow');pg.setAttribute('cx',sx.toFixed(1));pg.setAttribute('cy',sy.toFixed(1));
 qa('.w6-ring').forEach(r=>{r.setAttribute('cx',sx.toFixed(1));r.setAttribute('cy',sy.toFixed(1));});
 const lockK=clamp((t-T.lock[0])/0.6);
 q('.w6-paleglow').style.opacity=(0.12+0.25*sb+0.35*lockK*(hit>0?Math.exp(-hit*.6):1)).toFixed(3);
 qa('.w6-ring').forEach(r=>{
  const i=+r.dataset.i,rp=((sph+0.5+i*0.5)%1);
  r.setAttribute('r',(34+rp*70).toFixed(1));
  r.style.opacity=(lockK*(1-rp)*0.5*(hit>0?0:1)).toFixed(3);
  r.style.strokeWidth=(2-rp*1.4).toFixed(2);
 });
 qa('.w6-crk').forEach((c,i)=>{const L=+c.getAttribute('stroke-dasharray');c.style.strokeDashoffset=hit>0?(L*(1-outC((hit-i*0.12)/0.5))).toFixed(1):String(L);});

 // 피 웅덩이
 let pd='';for(let x=-40;x<=1000;x+=24)pd+=(pd?' L':'M')+x+','+poolY(x,t).toFixed(1);
 q('.w6-pool').setAttribute('d',pd+' L1000,'+(H+10)+' L-40,'+(H+10)+' Z');
 q('.w6-poolline').setAttribute('d',pd);

 // 쪽배
 const throwK=t>T.fly[0]?Math.exp(-(t-T.fly[0])*3)*Math.sin((t-T.fly[0])*9):0;
 const bx=BOAT_AT[0]-throwK*3,by=poolY(BOAT_AT[0],t)-2;
 const broll=Math.sin(t*1.25+.6)*2-throwK*4;
 q('.w6-boat').setAttribute('transform','translate('+bx.toFixed(2)+' '+by.toFixed(2)+') rotate('+broll.toFixed(2)+') scale('+BOAT_S+')');
 const br=broll*Math.PI/180,toWorld=p=>[bx+BOAT_S*(p[0]*Math.cos(br)-p[1]*Math.sin(br)),by+BOAT_S*(p[0]*Math.sin(br)+p[1]*Math.cos(br))];
 const aim=clamp((t-T.aim[0])/(T.aim[1]-T.aim[0])),thrown=t>T.fly[0];
 const armEnd=thrown?[38,-24]:[37-aim*12,-30-aim*3];
 q('.w3-arm').setAttribute('d','M29,-23 L'+armEnd[0].toFixed(1)+','+armEnd[1].toFixed(1));
 const lampK=0.86+Math.sin(t*7.3)*.05+Math.sin(t*12.9+1.7)*.04;
 q('.w3-lampglow').style.opacity=lampK.toFixed(3);
 const lamp=toWorld([51,-18.5]);
 const lr=q('.w6-lampref');lr.setAttribute('cx',lamp[0].toFixed(1));lr.setAttribute('cy',(POOL+6).toFixed(1));lr.style.opacity=(0.5*lampK).toFixed(3);

 // 등불 빛줄기: 혈관과 심장을 훑다가 작은 심장에 멈춤
 const s=clamp((t-T.search[0])/(T.search[1]-T.search[0]));
 const sweepX=[320,880,470,770,sx];   // 훑는 경로(마지막이 작은 심장)
 const sweepY=[160,130,360,230,sy];
 const seg=Math.min(3,Math.floor(s*4)),u=inOut(s*4-seg);
 let tx=sweepX[seg]+(sweepX[seg+1]-sweepX[seg])*u,ty=sweepY[seg]+(sweepY[seg+1]-sweepY[seg])*u;
 if(t<T.search[0]){tx=sweepX[0];ty=sweepY[0];}
 if(t>=T.search[1]){tx=sx;ty=sy;}
 const spotR=(1-lockK)*95+lockK*52;
 const ang=Math.atan2(ty-lamp[1],tx-lamp[0]),nx=-Math.sin(ang),ny=Math.cos(ang);
 const beam=q('.w6-beam');
 beam.setAttribute('d','M'+(lamp[0]+nx*3).toFixed(1)+','+(lamp[1]+ny*3).toFixed(1)+' L'+(tx+nx*spotR*0.8).toFixed(1)+','+(ty+ny*spotR*0.8).toFixed(1)+' L'+(tx-nx*spotR*0.8).toFixed(1)+','+(ty-ny*spotR*0.8).toFixed(1)+' L'+(lamp[0]-nx*3).toFixed(1)+','+(lamp[1]-ny*3).toFixed(1)+' Z');
 const g=q('.w6-beamgrad');g.setAttribute('x1',lamp[0].toFixed(1));g.setAttribute('y1',lamp[1].toFixed(1));g.setAttribute('x2',tx.toFixed(1));g.setAttribute('y2',ty.toFixed(1));
 const beamOn=clamp((t-0.4)/0.5)*(hit>0?Math.max(0.35,1-hit*0.5):1);
 beam.style.opacity=(beamOn*lampK).toFixed(3);
 const spot=q('.w6-spot');spot.setAttribute('cx',tx.toFixed(1));spot.setAttribute('cy',ty.toFixed(1));
 spot.setAttribute('rx',spotR.toFixed(1));spot.setAttribute('ry',(spotR*0.78).toFixed(1));spot.style.opacity=(beamOn*(0.8+lockK*0.4)).toFixed(3);
 // 조준 중 주변이 어두워져 작은 심장만 남음
 q('.w6-dim').style.opacity=(0.35*lockK*(hit>0?Math.max(0,1-hit*0.8):1)).toFixed(3);

 // 작살
 const hp=q('.w6-harpoon'),rope=q('.w6-rope'),tr=q('.w6-trail');
 const hand=toWorld(armEnd),p0=[hand[0]+30,hand[1]-14],target=[sx-4,sy+2];
 const endA=Math.atan2((target[1]-p0[1])+4*LIFT,target[0]-p0[0]);
 let pos,a,show=0;
 if(t<T.fly[0]){const aa=(-24-aim*14)*Math.PI/180;pos=[hand[0]+Math.cos(aa)*40,hand[1]+Math.sin(aa)*40];a=aa;show=clamp((t-T.aim[0]+0.4)/0.4);}
 else if(t<T.fly[1]){const u2=(t-T.fly[0])/(T.fly[1]-T.fly[0]),e=u2*(0.85+0.15*u2);
  pos=[p0[0]+(target[0]-p0[0])*e,p0[1]+(target[1]-p0[1])*e-4*LIFT*e*(1-e)];
  a=Math.atan2((target[1]-p0[1])-4*LIFT*(1-2*e),target[0]-p0[0]);show=1;}
 else{pos=[target[0]+10*Math.cos(endA),target[1]+10*Math.sin(endA)];a=endA;show=1;}
 hp.style.opacity=String(show);
 hp.setAttribute('transform','translate('+pos[0].toFixed(1)+' '+pos[1].toFixed(1)+') rotate('+(a*180/Math.PI).toFixed(2)+')');
 const tail=[pos[0]-104*Math.cos(a),pos[1]-104*Math.sin(a)];
 if(t>=T.fly[0]&&t<T.fly[1]+0.35){
  const back=[pos[0]-170*Math.cos(a),pos[1]-170*Math.sin(a)];
  tr.setAttribute('d','M'+back[0].toFixed(1)+','+back[1].toFixed(1)+' L'+tail[0].toFixed(1)+','+tail[1].toFixed(1));
  tr.style.opacity=(t<T.fly[1]?0.5:0.5*(1-(t-T.fly[1])/0.35)).toFixed(3);
 }else tr.style.opacity='0';
 const anchor=toWorld([40,-9]);
 const slack=t<T.fly[1]?36:Math.max(3,22*Math.exp(-hit*2.5))+Math.sin(t*3)*2;
 rope.setAttribute('d','M'+anchor[0].toFixed(1)+','+anchor[1].toFixed(1)+' Q'+((tail[0]+anchor[0])/2).toFixed(1)+','+((tail[1]+anchor[1])/2+slack).toFixed(1)+' '+tail[0].toFixed(1)+','+tail[1].toFixed(1));
 rope.style.opacity=String(t<T.fly[0]?0:0.9);

 // 명중: 섬광과 피·창백한 파편
 const fl=q('.w6-flash');fl.setAttribute('cx',target[0].toFixed(1));fl.setAttribute('cy',target[1].toFixed(1));
 fl.style.opacity=hit>0?Math.exp(-hit*5).toFixed(3):'0';fl.setAttribute('r',(40+70*clamp(hit*3)).toFixed(1));
 qa('.w6-drop').forEach(d=>{
  const P=DROPS[+d.dataset.i],s2=hit-P.d;
  if(s2<=0||s2>1.3){d.style.opacity='0';return;}
  const x=target[0]+P.vx*s2,y=target[1]+P.vy*s2+300*s2*s2;
  d.setAttribute('cx',x.toFixed(1));d.setAttribute('cy',y.toFixed(1));
  d.style.opacity=(y>POOL?0:(1-s2/1.3)).toFixed(3);
 });
 // 화면 흔들림
 const sh=hit>0?7*Math.exp(-hit*4):0;
 q('.w6-root').setAttribute('transform','translate('+(Math.sin(t*59)*sh).toFixed(2)+' '+(Math.sin(t*41+1)*sh).toFixed(2)+')');
 // 반복 경계
 const v=t<0.6?1-t/0.6:clamp((t-T.loop[0])/(T.loop[1]-T.loop[0]));
 q('.w6-veil').style.opacity=(v*0.95).toFixed(3);
}
requestAnimationFrame(frame);

/* ---------- 연결: 5단계 구성 (작살 · 삼킴 · 위산 · 심장 탐색 · 심장 파괴) ---------- */
// 옛 '최종 전투'(final)는 4단계 심장 탐색과 같은 장면을 쓴다.
const prev=V2.html;
function sceneHtml(name){return name==='search'||name==='final'?heartHtml():prev(name);}
const names=Object.assign({},V2.names,{search:LABEL,final:LABEL});
window.PallidCinematicV2=Object.assign({},V2,{html:sceneHtml,names,stages:['harpoon','ingest','acid','search','victory']});
V3.html=sceneHtml;V3.heart=heartHtml;
V3.heartParts={BIG,AORTA,BRANCH,PULM,CAVA,GROOVE,CORONARY,HC,PLACE,ROT,SCL,SMALL,vesselPaths};V3.stages=['harpoon','ingest','acid','search','victory'];
try{
 if(typeof PALLID_FX_LABELS162==='object'){PALLID_FX_LABELS162.search=LABEL;PALLID_FX_LABELS162.final=LABEL;}
 if(typeof pallidFxMarkup162==='function'){
  pallidFxMarkup162=sceneHtml;
  if(typeof render==='function')render();
 }
}catch(e){console.warn('창백한 고래 심장 장면 연결 지연',e);}
})();
