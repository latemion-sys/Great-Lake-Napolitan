/* 모든 것을 삼키는 창백한 고래 · v3 시네마틱 (작살 장면 개편)
   - 안개 낀 밤 호수, 각진 머리의 창백한 향유고래, 등불을 단 검은 쪽배.
   - 동전 판정마다 화면이 다시 그려지므로 CSS 키프레임 대신 시간 기준 requestAnimationFrame으로 움직인다.
   - 나머지 장면(삼킴·위산·심장 탐색·최종 전투·심장 파괴)은 v2를 그대로 쓴다. */
(function(){
'use strict';
const V2=window.PallidCinematicV2;
if(!V2)return;

const W=960,H=540,SEA=336,LOOP=7.2;
const NAMES=V2.names;

/* ---------- 고래 형상 (왼쪽을 바라보는 향유고래 머리) ---------- */
const WHALE='M548,170 C528,200 522,270 532,322 C536,338 548,346 566,348 L1010,362 L1010,196 '+
 'C940,178 884,168 822,160 C724,146 612,140 574,150 C560,154 551,161 548,170 Z';
const WHALE_TOP='M548,170 C551,161 560,154 574,150 C612,140 724,146 822,160 C884,168 940,178 1010,196';
const IMPACT=[540,214]; // 고래 좌표계에서 작살이 꽂히는 지점(앞이마)
const PIVOT=[760,340];
const ZONE_Y=236,SWEEP=[566,880];   // 미니게임: 조준점이 오가는 이마 위 가로선(고래 좌표)

// 오징어 빨판 흉터와 긁힌 자국: 고정 시드로 매번 같은 모양
function seeded(n){let s=n;return ()=>((s=(s*16807)%2147483647)/2147483647);}
function scars(){
 const r=seeded(91);let out='';
 for(let i=0;i<15;i++){
  const x=580+r()*170,y=180+r()*115,rad=1.8+r()*4;
  out+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+rad.toFixed(1)+'" stroke-opacity="'+(0.1+r()*0.22).toFixed(2)+'"/>';
 }
 return out;
}
function wrinkles(){
 const r=seeded(7);let out='';
 for(let i=0;i<11;i++){
  const y=206+i*12.5,x0=790+r()*30;
  let d='M'+x0.toFixed(0)+','+y.toFixed(1);
  for(let x=x0;x<1010;x+=26)d+=' Q'+(x+13).toFixed(0)+','+(y+(r()-.5)*7).toFixed(1)+' '+(x+26).toFixed(0)+','+(y+(r()-.5)*3).toFixed(1);
  out+='<path d="'+d+'"/>';
 }
 return out;
}

/* ---------- 검은 쪽배 (호수 이펙트와 같은 실루엣) ---------- */
const BOAT=
 '<circle cx="51" cy="-18.5" r="30" class="w3-lampglow" fill="url(#w3Lamp)"/>'+
 '<path d="M-50,-11 L-44,-8 L38,-8 Q47,-9 55,-17 L52,-9 Q47,3 33,6 L-34,6 Q-46,4 -50,-11 Z" fill="#030405"/>'+
 '<path d="M-44,-8 L38,-8" stroke="#8fa3ae" stroke-opacity=".35" stroke-width=".8"/>'+
 '<rect x="-14" y="-17" width="22" height="9" rx="1.5" fill="#030405"/>'+
 '<path d="M-3,-17 L-3,-52 M-3,-47 L-17,-47" stroke="#030405" stroke-width="2.4" stroke-linecap="round"/>'+
 '<path d="M-3,-50 L46,-12 M-3,-50 L-46,-10" stroke="#030405" stroke-width=".7"/>'+
 '<path d="M45,-8 L45,-25 L51,-25 L51,-22" stroke="#030405" stroke-width="1.6" fill="none"/>'+
 '<rect x="48.4" y="-21.5" width="5.2" height="6.2" rx="1.2" fill="#ffe39a" stroke="#ffbf47" stroke-width=".8"/>'+
 // 작살잡이: 뱃머리 쪽에 선 사람 실루엣
 (window.HarpoonLauncher?window.HarpoonLauncher.markup():'')+
 '<g class="w3-thrower"><path d="M22,-8 L23,-21 Q23,-26 27,-27 Q31,-26 31,-21 L32,-8 Z" fill="#030405"/>'+
 '<circle cx="27" cy="-30.5" r="3.4" fill="#030405"/>'+
 '<path class="w3-arm" d="M29,-23 L37,-30" stroke="#030405" stroke-width="2.2" stroke-linecap="round"/></g>';
const BOAT_AT=[236,SEA],BOAT_S=1.9;

function harpoonHtml(){
 const title=NAMES.harpoon;
 const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'+
 '<defs>'+
  '<linearGradient id="w3Sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#04070b"/><stop offset=".62" stop-color="#121b21"/><stop offset="1" stop-color="#1f2a2f"/></linearGradient>'+
  '<linearGradient id="w3Sea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#151f24" stop-opacity=".9"/><stop offset=".25" stop-color="#0b1216" stop-opacity=".96"/><stop offset="1" stop-color="#020305"/></linearGradient>'+
  '<linearGradient id="w3Skin" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#e9eadf"/><stop offset=".22" stop-color="#b9c0b6"/><stop offset=".5" stop-color="#6f7a76"/><stop offset=".8" stop-color="#2e383c"/><stop offset="1" stop-color="#172025"/></linearGradient>'+
  '<radialGradient id="w3Sheen" cx=".5" cy=".5" r=".5"><stop stop-color="#fbfbf3" stop-opacity=".32"/><stop offset="1" stop-color="#fbfbf3" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="w3Face" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#000" stop-opacity=".72"/><stop offset=".08" stop-color="#000" stop-opacity=".38"/><stop offset=".2" stop-color="#000" stop-opacity=".1"/><stop offset=".36" stop-color="#000" stop-opacity="0"/></linearGradient>'+
  '<radialGradient id="w3Moon"><stop stop-color="#e9ece2" stop-opacity=".55"/><stop offset=".18" stop-color="#c9d3cf" stop-opacity=".2"/><stop offset="1" stop-color="#9fb0b0" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w3Lamp"><stop stop-color="#ffbf47" stop-opacity=".95"/><stop offset=".22" stop-color="#ffbf47" stop-opacity=".42"/><stop offset=".6" stop-color="#ffbf47" stop-opacity=".08"/><stop offset="1" stop-color="#ffbf47" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w3Zone"><stop stop-color="#ff8f73" stop-opacity=".6"/><stop offset=".6" stop-color="#c84a4f" stop-opacity=".25"/><stop offset="1" stop-color="#c84a4f" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w3Flash"><stop stop-color="#fffdf0" stop-opacity=".95"/><stop offset=".3" stop-color="#e9efe6" stop-opacity=".45"/><stop offset="1" stop-color="#e9efe6" stop-opacity="0"/></radialGradient>'+
  '<filter id="w3Soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>'+
  '<filter id="w3Mist" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="14 6"/></filter>'+
  '<filter id="w3Run" x="-50%" y="-5%" width="200%" height="110%"><feGaussianBlur stdDeviation="2.6 5"/></filter>'+
  '<filter id="w3Rim" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>'+
  '<filter id="w3Skinfx" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .55" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .12  0 0 0 0 .12  0 0 0 -1.6 1.15"/></filter>'+
  '<path id="w3WhaleShape" d="'+WHALE+'"/>'+
  '<clipPath id="w3WhaleClip"><use href="#w3WhaleShape"/></clipPath>'+
  '<clipPath id="w3AboveSea"><rect width="'+W+'" height="'+(SEA+2)+'"/></clipPath>'+
  '<mask id="w3OutsideWhale" maskUnits="userSpaceOnUse" x="0" y="0" width="'+W+'" height="'+H+'"><rect width="'+W+'" height="'+H+'" fill="#fff"/><use href="#w3WhaleShape" class="w3-maskwhale" fill="#000"/></mask>'+
 '</defs>'+
 '<g class="w3-root">'+
  '<rect width="'+W+'" height="'+H+'" fill="url(#w3Sky)"/>'+
  '<circle cx="808" cy="104" r="190" fill="url(#w3Moon)"/>'+
  '<circle cx="808" cy="104" r="27" fill="#dfe3da" opacity=".42" filter="url(#w3Rim)"/>'+
  '<g class="w3-mist far" filter="url(#w3Mist)"><rect x="-200" y="250" width="700" height="34" rx="17" fill="#c7d2d2" opacity=".09"/><rect x="560" y="226" width="760" height="40" rx="20" fill="#c7d2d2" opacity=".08"/></g>'+
  '<path d="M0,'+SEA+' H'+W+'" stroke="#a8b9bb" stroke-opacity=".18" stroke-width="1.2"/>'+
  // 수면에 비친 달빛
  '<g class="w3-moonpath" fill="#dfe6e2">'+[0,1,2,3,4,5,6].map(i=>'<rect class="w3-glint" data-i="'+i+'" x="'+(790-i*4)+'" y="'+(SEA+8+i*i*3.2+i*6)+'" width="'+(26+i*9)+'" height="'+(1.6+i*.35).toFixed(2)+'" rx="1" opacity="0"/>').join('')+'</g>'+

  // 창백한 향유고래
  '<g class="w3-whale">'+
   '<use href="#w3WhaleShape" fill="url(#w3Skin)"/>'+
   '<g clip-path="url(#w3WhaleClip)">'+
    '<rect x="500" y="130" width="520" height="240" filter="url(#w3Skinfx)" opacity=".55"/>'+
    '<ellipse cx="760" cy="170" rx="210" ry="46" fill="url(#w3Sheen)"/>'+
    '<use href="#w3WhaleShape" fill="url(#w3Face)"/>'+
    '<g class="w3-wrinkles" fill="none" stroke="#4c5856" stroke-opacity=".5" stroke-width="2.2" stroke-linecap="round">'+wrinkles()+'</g>'+
    (window.WhaleMarks?window.WhaleMarks.pallidSkin():'')+
    '<g class="w3-suckers" fill="none" stroke="#f1f3ea" stroke-width="1.3">'+scars()+'</g>'+
    '<g fill="none" stroke-linecap="round">'+
     '<path d="M590,186 C636,200 690,208 742,204 M594,196 C640,212 692,220 738,216" stroke="#f3f4ec" stroke-opacity=".2" stroke-width="1.6" stroke-dasharray="46 6 30 9 60 4"/>'+
     '<path d="M574,250 C620,268 676,276 726,270 M580,262 C624,280 672,288 716,282 M586,274 C626,290 666,298 704,294" stroke="#f3f4ec" stroke-opacity=".15" stroke-width="1.4" stroke-dasharray="38 7 52 5"/>'+
     '<path d="M650,166 C668,190 684,210 700,230 M668,160 C686,184 700,204 716,222" stroke="#2e383c" stroke-opacity=".5" stroke-width="2.6"/>'+
     '<path d="M838,220 C870,250 892,288 900,330" stroke="#3a4549" stroke-opacity=".45" stroke-width="4"/>'+
    '</g>'+
    // 턱 주름과 눈
    (window.WhaleMarks?window.WhaleMarks.pallidTeeth():'')+
    '<path d="M560,318 C620,332 690,334 752,322" fill="none" stroke="#1d2529" stroke-opacity=".7" stroke-width="3"/>'+
    '<g class="w3-eye"><ellipse cx="748" cy="298" rx="11" ry="7.5" fill="#2b3538" opacity=".7"/>'+
     (window.WhaleMarks?window.WhaleMarks.pallidEye(748,298):'<ellipse cx="748" cy="298" rx="6.5" ry="4.6" fill="#040607"/>')+
     '<path class="w3-lid" d="M736,298 Q748,288 760,298" fill="none" stroke="#c9cfc6" stroke-opacity=".55" stroke-width="1.8"/></g>'+
    '<path d="M566,160 q9,-7 19,-1" fill="none" stroke="#283236" stroke-width="3" stroke-linecap="round"/>'+
    // 떠오를 때 이마에서 흘러내리는 물줄기
    '<g class="w3-runoff" fill="none" stroke="#eef4f2" stroke-linecap="round" filter="url(#w3Run)">'+
     [0,1,2,3,4,5,6,7,8,9,10,11].map(i=>{const r=seeded(40+i),x=552+i*17+r()*8;return '<path d="M'+x.toFixed(0)+','+(158+Math.abs(i-3)*2)+' C'+(x-3).toFixed(0)+',220 '+(x+2).toFixed(0)+',280 '+(x-4).toFixed(0)+','+SEA+'" stroke-width="'+(2.5+r()*4).toFixed(1)+'" stroke-dasharray="'+(40+r()*60).toFixed(0)+' '+(30+r()*50).toFixed(0)+'" stroke-dashoffset="'+(r()*60).toFixed(0)+'"/>';}).join('')+'</g>'+
    '<g class="w3-wound" opacity="0"><ellipse cx="'+IMPACT[0]+'" cy="'+IMPACT[1]+'" rx="6" ry="4.5" fill="#14070a"/>'+
     [[0,90,2.6],[6,52,1.6],[-5,34,1.3]].map(([o,len,w])=>'<path class="w3-bleed" data-len="'+len+'" d="M'+(IMPACT[0]+o)+','+(IMPACT[1]+3)+' c'+(-1.5)+','+(len*.35).toFixed(0)+' 1.5,'+(len*.7).toFixed(0)+' -0.5,'+len+'" stroke="#2c0b11" stroke-width="'+w+'" stroke-linecap="round" fill="none" stroke-dasharray="'+len+'" stroke-dashoffset="'+len+'"/>').join('')+'</g>'+
   '</g>'+
   '<path d="'+WHALE_TOP+'" fill="none" stroke="#f4f5ec" stroke-opacity=".55" stroke-width="2.6" filter="url(#w3Rim)"/>'+
   // 미니게임: 아물지 않은 상처(명중 구간)와 움직이는 조준점 — 고래와 함께 움직임
   (window.WhaleMarks?window.WhaleMarks.pallidHarpoons():'')+
   '<g class="w3-aimui" opacity="0"><ellipse class="w3-zone" cy="'+ZONE_Y+'" rx="30" ry="20" fill="url(#w3Zone)"/>'+
    '<ellipse class="w3-zonering" cy="'+ZONE_Y+'" rx="30" ry="20" fill="none" stroke="#ffcf9a" stroke-opacity=".75" stroke-width="1.6" stroke-dasharray="5 5"/></g>'+
   '<g class="w3-reticle" opacity="0"><circle r="12" fill="none" stroke="#f4f7ee" stroke-width="1.8"/><path d="M-20,0 H-8 M8,0 H20 M0,-20 V-8 M0,8 V20" stroke="#f4f7ee" stroke-width="1.8"/><circle r="1.8" fill="#f4f7ee"/></g>'+
  '</g>'+

  // 물에 잠긴 부분을 덮는 수면
  '<rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" fill="url(#w3Sea)"/>'+
  '<g class="w3-waves" fill="none" stroke="#b9c9cb" stroke-linecap="round">'+[0,1,2,3,4,5,6,7].map(i=>{const y=SEA+7+i*i*2.6+i*7;return '<path class="w3-wave" data-i="'+i+'" d="M-60,'+y.toFixed(1)+' H'+(W+60)+'" stroke-opacity="'+(.15-i*.012).toFixed(3)+'" stroke-width="'+(1+i*.3).toFixed(2)+'" stroke-dasharray="'+(30+i*14)+' '+(40+i*22)+'"/>';}).join('')+'</g>'+
  '<g class="w3-foam" fill="none" stroke="#e7efed" stroke-linecap="round">'+
   '<ellipse class="w3-ring" cx="640" cy="'+(SEA+4)+'" rx="120" ry="7"/><ellipse class="w3-ring" cx="640" cy="'+(SEA+4)+'" rx="120" ry="7"/>'+
   '<path class="w3-surf" d="M524,'+(SEA+1)+' Q560,'+(SEA-4)+' 600,'+(SEA+1)+' T680,'+(SEA+1)+' T760,'+(SEA)+' T860,'+(SEA+1)+' T960,'+(SEA)+'" stroke-width="2.4"/></g>'+

  '<ellipse class="w3-splash" rx="10" ry="3" fill="none" stroke="#e7efed" stroke-width="2" opacity="0"/>'+
  // 등불 빛이 수면에 비침
  '<ellipse class="w3-lampglint" cx="0" cy="'+(SEA+9)+'" rx="22" ry="3" fill="#ffbf47" filter="url(#w3Rim)" opacity="0"/>'+
  '<g clip-path="url(#w3AboveSea)"><g class="w3-boat">'+BOAT+'</g></g>'+

  // 작살과 밧줄
  '<path class="w3-trail" fill="none" stroke="#e3ecea" stroke-width="2" stroke-linecap="round" filter="url(#w3Rim)" opacity="0"/>'+
  '<path class="w3-rope" fill="none" stroke="#8a9697" stroke-opacity=".75" stroke-width="1.5" opacity="0"/>'+
  '<g mask="url(#w3OutsideWhale)"><g class="w3-harpoon" opacity="0">'+
   '<path d="M-104,0 L-10,0" stroke="#15191b" stroke-width="4" stroke-linecap="round"/>'+
   '<path d="M-104,-1.2 L-12,-1.2" stroke="#d3dcda" stroke-opacity=".55" stroke-width="1.1"/>'+
   '<g class="w3-tip"><path d="M3,0 L-16,-6.5 L-11,0 L-16,6.5 Z" fill="#dfe6e3" stroke="#aebbb9" stroke-width="1" stroke-linejoin="round"/>'+
   '<path d="M-12,-3 L-22,-9 M-12,3 L-22,9" stroke="#c5cfcc" stroke-width="1.6" stroke-linecap="round"/></g>'+(window.HarpoonLauncher?window.HarpoonLauncher.flyMarkup():'')+'</g></g>'+

  // 명중 효과
  '<circle class="w3-flash" r="70" fill="url(#w3Flash)" opacity="0"/>'+(window.HarpoonLauncher?window.HarpoonLauncher.hitMarkup():'')+
  '<g class="w3-spray">'+Array.from({length:22},(_,i)=>'<circle class="w3-drop" data-i="'+i+'" r="'+(i%3?2:3.2)+'" fill="'+(i%2===0?'#e6efec':'#2d0d14')+'" opacity="0"/>').join('')+'</g>'+

  '<g class="w3-mist near" filter="url(#w3Mist)"><rect x="-300" y="'+(SEA-16)+'" width="900" height="30" rx="15" fill="#d3dcdc" opacity=".08"/><rect x="420" y="'+(SEA-34)+'" width="900" height="26" rx="13" fill="#d3dcdc" opacity=".06"/></g>'+
  '<rect class="w3-veil" width="'+W+'" height="'+H+'" fill="#020306" opacity="0"/>'+
 '</g></svg>';
 return '<div class="pallid-cine-v2 pallid-cine-v3 w3-harpoon-scene" role="img" aria-label="'+esc(title[0]+' · '+title[1])+'">'+svg+
  '<span class="cine-top" aria-hidden="true">모든 것을 삼키는 창백한 고래 · '+esc(title[0])+'</span>'+
  '<span class="cine-bottom" aria-hidden="true">'+esc(title[1])+'</span>'+
  '<span class="w3-hint" aria-hidden="true">조준점이 붉은 상처에 겹칠 때 화면을 누르세요 · 스페이스</span>'+
  '<span class="w3-verdict" aria-hidden="true"></span>'+
  '<span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}
function esc(t){return String(t).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));}

/* ---------- 애니메이션 ---------- */
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const outC=x=>1-Math.pow(1-clamp(x),3);
const inOut=x=>{x=clamp(x);return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;};
function apply(m,p){return [m[0]*p[0]+m[2]*p[1]+m[4],m[1]*p[0]+m[3]*p[1]+m[5]];}
function whaleMatrix(dx,dy,deg){
 const r=deg*Math.PI/180,c=Math.cos(r),s=Math.sin(r),[px,py]=PIVOT;
 // translate(dx,dy) · rotate(deg, px, py)
 return [c,s,-s,c,px-c*px+s*py+dx,py-s*px-c*py+dy];
}
const T={rise:[0,1.8],aim:[1.8,2.5],fly:[2.5,3.05],sink:[4.4,7.2],veilOut:[6.6,7.2]};
const THROW_FROM=[0,0]; // 매 프레임 갱신 (작살잡이 손 위치)
const DROPS=Array.from({length:22},(_,i)=>{const r=seeded(300+i);const a=Math.PI*(0.65+r()*0.75);const v=110+r()*190;return {vx:Math.cos(a)*v,vy:-Math.abs(Math.sin(a))*v*(0.7+r()*0.6),d:r()*0.08};});

let start=0,lastSeen=0,seenTok=0;
// 미니게임 상태 (pallid-harpoon-game.js가 켜고 끈다)
const GAME=window.PallidHarpoonGame=window.PallidHarpoonGame||{active:false};
function sweepX(t){const ph=((t/(GAME.period||2.4))%1+1)%1,tri=ph<.5?ph*2:2-ph*2;return SWEEP[0]+(SWEEP[1]-SWEEP[0])*tri;}
GAME.throwNow=function(){
 if(!GAME.active||GAME.throwAt!=null||!GAME.startAt)return null;
 const t=(performance.now()-GAME.startAt)/1000,x=sweepX(t);
 GAME.throwAt=t;GAME.aimLocal=[x,ZONE_Y];GAME.hit=Math.abs(x-GAME.zone)<=GAME.half;
 return GAME.hit;
};
function frame(now){
 const el=document.querySelector('.w3-harpoon-scene');
 if(el&&el.isConnected){
  const paused=!!el.closest('.is-paused');
  const tok=(window.PallidCinematicV3||{}).replayToken||0;
  if(now-lastSeen>900||tok!==seenTok){start=now;seenTok=tok;}   // 새로 열리거나 '다시 재생'일 때만 처음부터               // 새로 열릴 때만 처음부터, 재렌더에는 이어서
  if(paused)start+=now-lastSeen;
  lastSeen=now;
  if(GAME.active){
   if(!GAME.startAt)GAME.startAt=now;
   paint(el,(now-GAME.startAt)/1000,true);
  }else paint(el,((now-start)/1000)%LOOP,false);
 }
 requestAnimationFrame(frame);
}
const LIFT=34;
function endAngle(hand,target){
 const p0=[hand[0]+30,hand[1]-14];
 return Math.atan2((target[1]-p0[1])+4*LIFT,target[0]-p0[0])*180/Math.PI;
}
function paint(el,t,hold){
 const q=s=>el.querySelector(s),qa=s=>el.querySelectorAll(s);
 // 시간표: 기본 반복 장면 / 미니게임(hold)에서는 던진 순간부터 시간을 잰다
 const thrownAt=hold?(GAME.throwAt==null?Infinity:GAME.throwAt):T.fly[0];
 const flyDur=hold?0.42:(T.fly[1]-T.fly[0]);
 const arrive=thrownAt+flyDur,since=t-arrive;
 const isHit=hold?!!GAME.hit:true;
 const hit=isHit?since:-1;
 const targetLocal=hold&&GAME.aimLocal?GAME.aimLocal:IMPACT;
 // 고래: 떠오름 → 숨 고름 → 명중 시 움찔 → 천천히 가라앉음
 const rise=hold?1:outC((t-T.rise[0])/(T.rise[1]-T.rise[0]));
 let dy=78*(1-rise)+Math.sin(t*1.1)*2.2;
 let deg=-2.5*(1-rise)+Math.sin(t*.8+1)*.5;
 let dx=0;
 if(hit>0){
  const k=Math.exp(-hit*4.2);
  dx+=Math.sin(hit*48)*5*k;dy+=Math.sin(hit*37+1)*3*k;deg+=1.8*Math.sin(Math.min(hit,0.6)*Math.PI/0.6)*(hit<0.6?1:0)+ .9*(1-Math.exp(-hit*2));
 }
 if(hold&&!isHit&&since>0){ // 빗나감: 고래가 몸을 비틀어 털어냄
  const k=Math.exp(-since*2.5);dx+=Math.sin(since*22)*4*k;deg-=1.6*Math.sin(Math.min(since,0.9)*Math.PI/0.9)*(since<0.9?1:0);
 }
 const sink=hold?0:inOut((t-T.sink[0])/(T.sink[1]-T.sink[0]));
 dy+=86*sink;deg+=-3*sink;
 const M=whaleMatrix(dx,dy,deg),mat='matrix('+M.map(v=>v.toFixed(4)).join(' ')+')';
 q('.w3-whale').setAttribute('transform',mat);
 q('.w3-maskwhale').setAttribute('transform',mat);
 // 물줄기: 떠오를 때 진하고 점점 사라짐
 const run=q('.w3-runoff');
 run.style.opacity=hold?'0':(0.42*(1-clamp((t-1.0)/2.4))).toFixed(3);
 run.style.strokeDashoffset=(-t*120).toFixed(1);
 // 눈: 명중 직후 감겼다 뜸
 const lid=q('.w3-lid');
 const blink=hit>0&&hit<0.5?Math.sin(hit/0.5*Math.PI):0;
 lid.setAttribute('d','M736,298 Q748,'+(288+blink*11).toFixed(1)+' 760,298');
 // 상처와 피 (미니게임에서는 실제로 맞힌 자리)
 const wound=q('.w3-wound');
 wound.setAttribute('transform',hold?'translate('+(targetLocal[0]-IMPACT[0]).toFixed(1)+' '+(targetLocal[1]-IMPACT[1]).toFixed(1)+')':'');
 wound.style.opacity=hit>0?'1':'0';
 qa('.w3-bleed').forEach((b,i)=>{const L=+b.dataset.len;b.style.strokeDashoffset=hit>0?(L-L*outC((hit-i*.25)/(2.6+i*.4))).toFixed(1):String(L);});

 // 거품: 떠오를 때 퍼지는 고리, 수면 경계의 물보라
 qa('.w3-ring').forEach((r,i)=>{
  const p=clamp((t-i*.55)/2.6);
  r.setAttribute('rx',(110+p*230).toFixed(1));r.setAttribute('ry',(6+p*12).toFixed(1));
  r.style.strokeOpacity=hold?'0':((1-p)*.45*(p>0?1:0)).toFixed(3);r.style.strokeWidth=(2.4-p*1.6).toFixed(2);
 });
 const surf=q('.w3-surf');
 surf.setAttribute('transform','translate('+(dx*0.6).toFixed(1)+' '+(Math.sin(t*1.7)*1.2).toFixed(1)+')');
 surf.style.strokeOpacity=(0.25+0.4*(1-rise)+0.25*sink*(1-sink)*4*0.5).toFixed(3);
 qa('.w3-wave').forEach(w=>{const i=+w.dataset.i;w.style.strokeDashoffset=(t*(8+i*6)*(i%2?1:-1)).toFixed(1);});
 qa('.w3-glint').forEach(g=>{const i=+g.dataset.i;g.style.opacity=(0.1+0.14*(0.5+0.5*Math.sin(t*2.3+i*1.7))).toFixed(3);});
 qa('.w3-mist').forEach((m,i)=>m.setAttribute('transform','translate('+(Math.sin(t*0.13+i*2)*50).toFixed(1)+' 0)'));

 // 배: 출렁임 + 작살을 던진 반동
 const throwK=t>thrownAt?Math.exp(-(t-thrownAt)*3)*Math.sin((t-thrownAt)*9):0;
 const by=BOAT_AT[1]+Math.sin(t*1.6)*2.2+Math.sin(t*.7)*1.2;
 const broll=Math.sin(t*1.25+.6)*2.6-throwK*4;
 const bx=BOAT_AT[0]-throwK*3;
 q('.w3-boat').setAttribute('transform','translate('+bx.toFixed(2)+' '+by.toFixed(2)+') rotate('+broll.toFixed(2)+') scale('+BOAT_S+')');
 // 겨누기: 팔을 뒤로 젖혔다가 던짐 (미니게임에서는 겨눈 채 숨 고르기)
 const thrown=t>thrownAt;
 const aim=hold?clamp(t/0.6)*(0.92+0.08*Math.sin(t*2.2)):clamp((t-T.aim[0])/(T.aim[1]-T.aim[0]));
 const HL=window.HarpoonLauncher,own=!!(HL&&HL.owned());const armEnd=own?HL.ARM:thrown?[38,-24]:[37-aim*12,-30-aim*3];
 q('.w3-arm').setAttribute('d','M29,-23 L'+armEnd[0].toFixed(1)+','+armEnd[1].toFixed(1));
 const lampK=0.86+Math.sin(t*7.3)*.05+Math.sin(t*12.9+1.7)*.04+(!thrown&&(hold||t>T.aim[0])?.12:0);
 q('.w3-lampglow').style.opacity=lampK.toFixed(3);
 const br=broll*Math.PI/180,toWorld=p=>[bx+BOAT_S*(p[0]*Math.cos(br)-p[1]*Math.sin(br)),by+BOAT_S*(p[0]*Math.sin(br)+p[1]*Math.cos(br))];
 const lampW=toWorld([51,-18.5]);
 const lg=q('.w3-lampglint');lg.setAttribute('cx',lampW[0].toFixed(1));lg.style.opacity=(0.4*lampK).toFixed(3);
 const hand=own?HL.handFor(HL.launch(el,toWorld,{loaded:!thrown}),30,-14):toWorld(armEnd);
 const PC=HL?HL.pierce():{deep:0,pass:false,n:0};let hitAng=null;

 // 작살: 손에서 포물선으로 날아가 꽂히거나(명중) 튕겨 물에 빠짐(빗나감)
 const hp=q('.w3-harpoon'),rope=q('.w3-rope');
 hp.parentNode.setAttribute('mask',hold?'none':'url(#w3OutsideWhale)');
 const target=apply(M,targetLocal);
 const embed=hold?3:9;
 let pos,ang,show=0,splashAt=null;
 if(!thrown){
  const a=-24-aim*14;pos=[hand[0]+Math.cos(a*Math.PI/180)*40,hand[1]+Math.sin(a*Math.PI/180)*40];ang=a;show=own?0:hold?1:clamp((t-1.2)/0.4);
 }else if(t<arrive){
  const u=(t-thrownAt)/flyDur,e=u*(0.85+0.15*u);
  const p0=[hand[0]+30,hand[1]-14];
  pos=[p0[0]+(target[0]-p0[0])*e,p0[1]+(target[1]-p0[1])*e-4*LIFT*e*(1-e)];
  const d=[target[0]-p0[0],(target[1]-p0[1])-4*LIFT*(1-2*e)];
  ang=Math.atan2(d[1],d[0])*180/Math.PI;show=1;
 }else if(isHit){
  const e=endAngle(hand,target);
  pos=[target[0]+embed*Math.cos(e*Math.PI/180),target[1]+embed*Math.sin(e*Math.PI/180)];
  ang=e;show=1;hitAng=e;
  if(hold)pos=[target[0]-14*Math.cos(e*Math.PI/180),target[1]-14*Math.sin(e*Math.PI/180)];
  const back=hold?-14:embed;
  if(PC.deep)pos=[pos[0]+PC.deep*Math.cos(e*Math.PI/180),pos[1]+PC.deep*Math.sin(e*Math.PI/180)];   // 4망: 몸통이 반쯤 파고듦
  if(PC.pass){const pa=HL.passAngle(e),dd=back+since*HL.PASS_SPEED;ang=pa;hitAng=pa;pos=[target[0]+dd*Math.cos(pa*Math.PI/180),target[1]+dd*Math.sin(pa*Math.PI/180)];show=pos[0]<W+260&&pos[1]<H+260?1:0;} // 5망: 꿰뚫고 날아감
  if(HL)HL.bury(hp,PC.pass?null:-(back+PC.deep));
 }else{
  // 빗나감: 단단한 외피에 튕겨 뒤로 돌며 떨어짐
  const e=endAngle(hand,target),s2=since;
  pos=[target[0]-70*s2,target[1]-150*s2+460*s2*s2];
  ang=e+s2*520;
  const land=(150+Math.sqrt(150*150+4*460*(SEA-target[1])))/(2*460);
  splashAt={x:target[0]-70*land,s:s2-land};
  show=s2<land?1:0;
 }
 hp.style.opacity=String(show);
 q('.w3-tip').style.opacity=hold&&isHit&&since>0&&!PC.pass?'0':'1';
 if(HL){if(!(isHit&&thrown&&t>=arrive))HL.bury(hp,null);HL.paintHit(el,{s:isHit&&t>=arrive?since:-1,p:target,ang:hitAng==null?0:hitAng,tier:PC.n,through:110});}   // 꽂힌 작살촉은 살 속에 숨김
 hp.setAttribute('transform','translate('+pos[0].toFixed(1)+' '+pos[1].toFixed(1)+') rotate('+ang.toFixed(2)+')');
 // 밧줄: 작살 꼬리 ↔ 배. 날아가는 동안 처지고, 꽂힌 뒤 팽팽해짐
 const ar=ang*Math.PI/180,tail=[pos[0]-104*Math.cos(ar),pos[1]-104*Math.sin(ar)];
 // 비행 궤적: 날아가는 동안 뒤로 남는 흐린 빛줄기
 const tr=q('.w3-trail');
 if(t>=thrownAt&&t<arrive+0.35&&(isHit||t<arrive)){
  const back=[pos[0]-170*Math.cos(ar),pos[1]-170*Math.sin(ar)];
  tr.setAttribute('d','M'+back[0].toFixed(1)+','+back[1].toFixed(1)+' L'+tail[0].toFixed(1)+','+tail[1].toFixed(1));
  tr.style.opacity=(t<arrive?0.45:0.45*(1-(t-arrive)/0.35)).toFixed(3);
 }else tr.style.opacity='0';
 const anchor=toWorld(own?HL.anchorLocal():[40,-9]);
 const slack=!thrown?14:t<arrive?40:isHit?Math.max(3,26*Math.exp(-since*2.5))+Math.sin(t*3)*2:40+since*60;
 const ropeEnd=show?tail:[splashAt?splashAt.x:tail[0],SEA+2];
 const mid=[(ropeEnd[0]+anchor[0])/2,(ropeEnd[1]+anchor[1])/2+slack];
 rope.setAttribute('d','M'+anchor[0].toFixed(1)+','+anchor[1].toFixed(1)+' Q'+mid[0].toFixed(1)+','+mid[1].toFixed(1)+' '+ropeEnd[0].toFixed(1)+','+ropeEnd[1].toFixed(1));
 rope.style.opacity=String(!thrown?0:0.9);
 // 빗나간 작살이 물에 떨어진 자리
 const sp=q('.w3-splash');
 if(splashAt&&splashAt.s>0&&splashAt.s<1.2){
  const k=splashAt.s/1.2;sp.setAttribute('cx',splashAt.x.toFixed(1));sp.setAttribute('cy',(SEA+3).toFixed(1));
  sp.setAttribute('rx',(8+k*60).toFixed(1));sp.setAttribute('ry',(2.5+k*6).toFixed(1));sp.style.opacity=(0.7*(1-k)).toFixed(3);
 }else sp.style.opacity='0';

 // 명중 섬광과 피·물보라
 const fl=q('.w3-flash');
 fl.setAttribute('cx',target[0].toFixed(1));fl.setAttribute('cy',target[1].toFixed(1));
 fl.style.opacity=hit>0?(Math.exp(-hit*6)).toFixed(3):'0';
 fl.setAttribute('r',(40+60*clamp(hit*3)).toFixed(1));
 qa('.w3-drop').forEach(d=>{
  const P=DROPS[+d.dataset.i],s=hit-P.d;
  if(s<=0||s>1.4){d.style.opacity='0';return;}
  const x=target[0]+P.vx*s,y=target[1]+P.vy*s+260*s*s;
  d.setAttribute('cx',x.toFixed(1));d.setAttribute('cy',y.toFixed(1));
  d.style.opacity=(y>SEA?0:(1-s/1.4)).toFixed(3);
 });

 // 미니게임 UI: 명중 구간(상처)과 조준점
 const ui=q('.w3-aimui'),ret=q('.w3-reticle');
 if(hold){
  const half=GAME.half||30,zx=GAME.zone||700;
  qa('.w3-zone,.w3-zonering').forEach(z=>{z.setAttribute('cx',zx.toFixed(1));z.setAttribute('rx',half.toFixed(1));z.setAttribute('ry',(half*0.7+6).toFixed(1));});
  q('.w3-zonering').style.strokeDashoffset=(-t*12).toFixed(1);
  const fade=thrown?clamp(1-(t-thrownAt)/0.6):1;
  ui.style.opacity=(fade*(0.75+0.25*Math.sin(t*5))*clamp(t/0.4)).toFixed(3);
  const rx=thrown?targetLocal[0]:sweepX(t);
  const near=Math.abs(rx-zx)<=half;
  ret.setAttribute('transform','translate('+rx.toFixed(1)+' '+ZONE_Y+')');
  ret.style.opacity=(fade*clamp(t/0.4)).toFixed(3);
  ret.querySelectorAll('circle,path').forEach(n=>{n.style.stroke=near?'#ffcf9a':'';n.style.fill=n.getAttribute('r')==='1.8'?(near?'#ffcf9a':''):'';});
  el.classList.toggle('w3-aiming',!thrown);
  const v=el.querySelector('.w3-verdict');
  if(v){
   const show2=since>0&&since<1.6;
   v.textContent=show2?(isHit?'명중':'빗나감'):'';
   v.className='w3-verdict'+(show2?(isHit?' hit':' miss'):'');
  }
 }else{ui.style.opacity='0';ret.style.opacity='0';el.classList.remove('w3-aiming');}

 // 루프 경계: 어둠으로 덮었다가 다시 걷힘
 const v=hold?0:(t<0.6?1-t/0.6:clamp((t-T.veilOut[0])/(T.veilOut[1]-T.veilOut[0])));
 q('.w3-veil').style.opacity=(v*0.92).toFixed(3);
}
requestAnimationFrame(frame);

/* ---------- 연결: 미리보기 페이지와 게임 모두 v3 작살 장면을 쓰게 한다 ---------- */
const v2html=V2.html;
function sceneHtml(name){return name==='harpoon'?harpoonHtml():v2html(name);}
window.PallidCinematicV2=Object.assign({},V2,{html:sceneHtml});
window.PallidCinematicV3={html:sceneHtml,harpoon:harpoonHtml,
 shared:{W,H,SEA,BOAT,seeded,wrinkles,scars,esc,clamp,outC,inOut,WHALE,WHALE_TOP,IMPACT}};
try{
 if(typeof pallidFxMarkup162==='function'){
  pallidFxMarkup162=sceneHtml;
  if(typeof render==='function')render();
 }
}catch(e){console.warn('창백한 고래 v3 연결 지연',e);}
})();
