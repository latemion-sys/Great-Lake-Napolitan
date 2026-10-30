/* 모든 것을 뚫는 푸른 고래 · v3 시네마틱 (청새치 형상)
   - 창백한 고래 v3와 같은 틀: 안개 낀 밤 호수, 등불을 단 검은 쪽배, 인라인 SVG + 시간 기준 requestAnimationFrame.
   - 고래는 거대한 청새치의 모습: 몸길이의 1/4에 달하는 창 같은 주둥이, 돛처럼 솟은 등지느러미,
     초승달 꼬리, 등에서 옆구리로 흐르는 푸른 세로 줄무늬.
   - 5단계: ① 수면의 절단 ② 초고속 관통 ③ 푸른 항로 추적 ④ 관통 회피 ⑤ 최후의 교차(한 번 재생 후 멈춤).
   - 화면이 다시 그려져도(동전 판정 등) 900ms 안이면 이어서 재생, 단계가 바뀌거나 replayToken이 바뀌면 처음부터.
   - data-seek="초"가 있으면 그 시각에 고정(미리보기·검수용). */
(function(){
'use strict';
const W=960,H=540,SEA=336;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const outC=x=>1-Math.pow(1-clamp(x),3);
const inC=x=>Math.pow(clamp(x),3);
const inOut=x=>{x=clamp(x);return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;};
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const bell=(t,a,b,c,d)=>seg(t,a,b)*(1-seg(t,c,d));
const lerp=(a,b,k)=>a+(b-a)*k;
const n1=v=>(Math.round(v*10)/10).toString();
const n3=v=>(Math.round(v*1000)/1000).toString();
const TAU=Math.PI*2,RAD=Math.PI/180;
function seeded(n){let s=n;return ()=>((s=(s*16807)%2147483647)/2147483647);}
function esc(t){return String(t).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));}
// 느린 화면(슬로모션): 실제 시간 t를 장면 시간으로 바꾼다. [s0,s1] 구간은 d초만 흐른다.
function warp(t,s0,s1,d){return t<s0?t:t<s1?s0+(t-s0)*d/(s1-s0):s0+d+(t-s1);}
// (ox,oy) 지점을 (x,y)에 놓고 deg만큼 돌리고 sx,sy로 키운다
function mt(x,y,deg,sx,sy,ox,oy){return 'translate('+n1(x)+' '+n1(y)+') rotate('+n1(deg)+') scale('+n3(sx)+' '+n3(sy)+') translate('+n1(-ox)+' '+n1(-oy)+')';}
function apply(x,y,deg,sx,sy,ox,oy,px,py){
 const lx=(px-ox)*sx,ly=(py-oy)*sy,c=Math.cos(deg*RAD),s=Math.sin(deg*RAD);
 return [x+lx*c-ly*s,y+lx*s+ly*c];
}

/* ---------- 날렵한 청새치 고래 (왼쪽을 바라봄 · 주둥이 끝 -60,-4 · 몸 중심 500,0 · 꼬리 끝 1015,±200) ---------- */
// 몸통(윗턱·주둥이 제외): 아래턱 끝 → 머리 → 등 → 꼬리자루 → 초승달 꼬리 → 배 → 목
const BODY='M232,-17 C262,-28 288,-44 322,-56 C368,-70 418,-75 480,-73 C580,-69 680,-52 770,-31 '+
 'C818,-20 852,-13 884,-10 L902,-9 C926,-34 962,-112 1015,-202 C992,-140 968,-64 948,-6 Q944,0 948,6 '+
 'C968,64 992,140 1015,202 C962,112 926,34 902,9 L884,10 C852,13 818,20 770,30 '+
 'C680,49 580,63 482,64 C410,64 350,52 306,34 C272,22 246,14 214,9 L202,6 C214,2 224,-6 232,-17 Z';
const TAIL='M890,-9.5 L902,-9 C926,-34 962,-112 1015,-202 C992,-140 968,-64 948,-6 Q944,0 948,6 C968,64 992,140 1015,202 C962,112 926,34 902,9 L890,9.5 Z';
const BACK='M232,-17 C262,-28 288,-44 322,-56 C368,-70 418,-75 480,-73 C580,-69 680,-52 770,-31 C818,-20 852,-13 884,-10';
// 앞으로 길게 뻗은 윗턱(주둥이): 아래턱보다 훨씬 길고, 뿌리는 굵고 끝은 바늘처럼
const BILL='M-60,-4 C10,-7 110,-11 190,-15 C212,-16 226,-18 238,-21 L246,-6 C232,-1 216,2 196,3 C110,4 10,1 -60,-2 Z';
const BILL_TOP='M-60,-4 C10,-7 110,-11 190,-15 C212,-16 226,-18 238,-21';
const BILL_LOW='M-60,-2 C10,1 110,4 196,3 C216,2 232,-1 246,-6';
// 짧은 아래턱
const JAW='M202,6 C222,3 246,1 272,4 C290,6 302,10 310,16 C290,20 262,20 236,16 C222,13 210,10 202,6 Z';
const SAIL='M314,-52 C322,-106 342,-176 380,-234 C386,-190 402,-142 442,-102 C500,-94 560,-90 620,-80 '+
 'C660,-74 700,-62 742,-44 C660,-60 520,-82 314,-52 Z';
const SAIL_EDGE='M314,-52 C322,-106 342,-176 380,-234 C386,-190 402,-142 442,-102 C500,-94 560,-90 620,-80 C660,-74 700,-62 742,-44';
const PEC='M298,22 C346,34 414,64 510,112 C450,86 392,62 342,46 C324,40 308,32 298,22 Z';
const EYE=[262,-15];

function marlinDefs(p){
 const r=seeded(29);let bars='',fine='',scars='';
 for(let x=352,i=0;x<=860;i++){
  const top=-80,len=(62+r()*34)*(1-i*.025),w=Math.max(2,7.5-i*.33)*(0.75+r()*.5);
  const d='M'+n1(x)+','+top+' C'+n1(x+4)+','+n1(top+len*.4)+' '+n1(x+8)+','+n1(top+len*.75)+' '+n1(x+11+r()*3)+','+n1(top+len);
  const dash=Math.round(20+r()*26)+' '+Math.round(3+r()*6)+' '+Math.round(26+r()*40)+' '+Math.round(4+r()*8);
  bars+='<path d="'+d+'" stroke-width="'+n1(w)+'" stroke-dasharray="'+dash+'"/>';
  fine+='<path d="'+d+'" stroke-dasharray="'+dash+'"/>';
  x+=26+r()*12;
 }
 [[400,-22,520,-36,610,-30],[450,18,540,10,640,20],[590,-48,670,-50,730,-36]].forEach(a=>{scars+='<path d="M'+a[0]+','+a[1]+' Q'+a[2]+','+a[3]+' '+a[4]+','+a[5]+'"/>';});
 let rays='';
 [[326,-58,338,-150],[338,-62,356,-196],[352,-66,378,-230],[370,-70,388,-188],[392,-72,404,-146],[418,-74,432,-112],[452,-74,470,-100],[494,-74,516,-94],[540,-72,562,-90],[590,-68,610,-82],[640,-62,662,-72],[690,-54,708,-58]].forEach(a=>{rays+='M'+a[0]+','+a[1]+' L'+a[2]+','+a[3]+' ';});
 // 주둥이 표면의 거친 돌기(가는 점선)
 let rough='';
 for(let i=0;i<3;i++)rough+='<path d="M'+(-40+i*6)+','+n1(-4.6+i*.9)+' C40,'+n1(-7+i*.9)+' 120,'+n1(-10.5+i*1.3)+' 200,'+n1(-14+i*1.6)+'" stroke-dasharray="'+(2+i)+' '+(5+i*2)+'"/>';
 return ''+
 '<linearGradient id="'+p+'Skin" gradientUnits="userSpaceOnUse" x1="0" y1="-76" x2="0" y2="64">'+
  '<stop stop-color="#04101f"/><stop offset=".22" stop-color="#0b2748"/><stop offset=".42" stop-color="#16467a"/>'+
  '<stop offset=".55" stop-color="#2d6fa6"/><stop offset=".64" stop-color="#52819f"/><stop offset=".8" stop-color="#71899b"/><stop offset="1" stop-color="#3a4b59"/></linearGradient>'+
 '<linearGradient id="'+p+'Band" gradientUnits="userSpaceOnUse" x1="0" y1="-30" x2="0" y2="20"><stop stop-color="#5fd0ff" stop-opacity="0"/><stop offset=".5" stop-color="#5fd0ff" stop-opacity=".22"/><stop offset="1" stop-color="#5fd0ff" stop-opacity="0"/></linearGradient>'+
 '<linearGradient id="'+p+'Bill" gradientUnits="userSpaceOnUse" x1="0" y1="-20" x2="0" y2="4">'+
  '<stop stop-color="#a9d8f2"/><stop offset=".25" stop-color="#4c87b8"/><stop offset=".6" stop-color="#173e68"/><stop offset="1" stop-color="#06142a"/></linearGradient>'+
 '<linearGradient id="'+p+'BillFade" gradientUnits="userSpaceOnUse" x1="-60" y1="0" x2="250" y2="0"><stop stop-color="#000" stop-opacity=".35"/><stop offset=".5" stop-color="#000" stop-opacity="0"/></linearGradient>'+
 '<linearGradient id="'+p+'Jaw" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="20"><stop stop-color="#2f557a"/><stop offset="1" stop-color="#74889a"/></linearGradient>'+
 '<linearGradient id="'+p+'Sail" gradientUnits="userSpaceOnUse" x1="0" y1="-234" x2="0" y2="-52">'+
  '<stop stop-color="#1c4d80" stop-opacity=".7"/><stop offset=".5" stop-color="#11335c" stop-opacity=".86"/><stop offset="1" stop-color="#071a33"/></linearGradient>'+
 '<linearGradient id="'+p+'Fin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1d4b7c"/><stop offset="1" stop-color="#081830"/></linearGradient>'+
 '<linearGradient id="'+p+'Tail" gradientUnits="userSpaceOnUse" x1="0" y1="-200" x2="0" y2="200"><stop stop-color="#1a4776"/><stop offset=".5" stop-color="#0a1f3b"/><stop offset="1" stop-color="#132f50"/></linearGradient>'+
 '<linearGradient id="'+p+'Shade" gradientUnits="userSpaceOnUse" x1="200" y1="0" x2="910" y2="0">'+
  '<stop stop-color="#000" stop-opacity=".25"/><stop offset=".12" stop-color="#000" stop-opacity="0"/><stop offset=".75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>'+
 '<linearGradient id="'+p+'Belly" gradientUnits="userSpaceOnUse" x1="0" y1="24" x2="0" y2="66"><stop stop-color="#020812" stop-opacity="0"/><stop offset="1" stop-color="#020812" stop-opacity=".6"/></linearGradient>'+
 '<radialGradient id="'+p+'Sheen" cx=".5" cy=".5" r=".5"><stop stop-color="#d8eefa" stop-opacity=".3"/><stop offset="1" stop-color="#d8eefa" stop-opacity="0"/></radialGradient>'+
 '<filter id="'+p+'Tex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .45" numOctaves="2" seed="11"/><feColorMatrix values="0 0 0 0 .02  0 0 0 0 .06  0 0 0 0 .12  0 0 0 -1.6 1.12"/></filter>'+
 '<filter id="'+p+'Glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>'+
 '<filter id="'+p+'Rim" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="1.2"/></filter>'+
 '<clipPath id="'+p+'Clip"><path d="'+BODY+'"/></clipPath>'+
 '<clipPath id="'+p+'BillClip"><path d="'+BILL+'"/></clipPath>'+
 '<g id="'+p+'M">'+
  // 등지느러미(돛): 앞쪽이 높게 솟고 등을 따라 낮게 이어짐
  '<path d="'+SAIL+'" fill="url(#'+p+'Sail)"/>'+
  '<path d="'+rays+'" fill="none" stroke="#86ccf2" stroke-opacity=".32" stroke-width="1.1" stroke-linecap="round"/>'+
  '<path d="'+SAIL_EDGE+'" fill="none" stroke="#c6e9ff" stroke-opacity=".4" stroke-width="1.3" filter="url(#'+p+'Rim)"/>'+
  // 뒤쪽 작은 지느러미들
  '<path d="M800,-24 L814,-44 L830,-20 Z M630,58 C648,80 662,98 676,104 C680,88 684,74 688,58 Z M786,26 L800,46 L814,22 Z" fill="#0a2040"/>'+
  // 몸통
  '<path d="'+BODY+'" fill="url(#'+p+'Skin)"/>'+
  '<path d="'+TAIL+'" fill="url(#'+p+'Tail)"/>'+
  '<path d="M904,-9 C928,-34 964,-112 1015,-202" fill="none" stroke="#bfe4fa" stroke-opacity=".35" stroke-width="1.3" filter="url(#'+p+'Rim)"/>'+
  '<g clip-path="url(#'+p+'Clip)">'+
   '<rect x="180" y="-210" width="850" height="420" filter="url(#'+p+'Tex)" opacity=".42"/>'+
   '<rect x="180" y="-30" width="720" height="50" fill="url(#'+p+'Band)" style="opacity:var(--bwglow,1)"/>'+
   '<g fill="none" stroke="#6fcaf5" stroke-linecap="round" filter="url(#'+p+'Glow)" style="opacity:var(--bwglow,1)"><g opacity=".45">'+bars+'</g></g>'+
   '<g fill="none" stroke="#d6f1fd" stroke-width="1" stroke-linecap="round" style="opacity:var(--bwglow,1)"><g opacity=".32">'+fine+'</g></g>'+
   '<g fill="none" stroke="#dfeef5" stroke-opacity=".12" stroke-width="1.4" stroke-linecap="round">'+scars+'</g>'+
   '<ellipse cx="520" cy="-62" rx="300" ry="18" fill="url(#'+p+'Sheen)"/>'+
   '<rect x="180" y="20" width="710" height="60" fill="url(#'+p+'Belly)"/>'+
   '<path d="'+BODY+'" fill="url(#'+p+'Shade)"/>'+
   // 아가미 덮개
   '<path d="M318,-50 C338,-20 342,12 324,40" fill="none" stroke="#030a15" stroke-opacity=".8" stroke-width="3"/>'+
   '<path d="M326,-46 C344,-18 348,12 333,36" fill="none" stroke="#a6dbf5" stroke-opacity=".18" stroke-width="1.2"/>'+
   '<path d="M300,-40 C316,-18 318,8 306,30" fill="none" stroke="#030a15" stroke-opacity=".35" stroke-width="1.6"/>'+
   // 옆줄
   '<path d="M340,-12 C450,-28 560,-20 680,-12 S830,-3 900,0" fill="none" stroke="#c9edff" stroke-opacity=".22" stroke-width="1.2" stroke-dasharray="16 5 38 6"/>'+
   // 꼬리자루의 두 줄 용골
   '<path d="M846,-4 L900,-3 M846,5 L900,4" stroke="#020a18" stroke-width="2.6" stroke-linecap="round"/>'+
  '</g>'+
  // 아래턱(짧음) → 입선
  '<path d="'+JAW+'" fill="url(#'+p+'Jaw)"/>'+
  '<path d="M202,6 C230,4 262,5 296,12" fill="none" stroke="#02060d" stroke-opacity=".85" stroke-width="2.2" stroke-linecap="round"/>'+
  // 앞으로 길게 뻗은 윗턱(주둥이)
  '<path d="'+BILL+'" fill="url(#'+p+'Bill)"/>'+
  '<g clip-path="url(#'+p+'BillClip)">'+
   '<path d="'+BILL+'" fill="url(#'+p+'BillFade)"/>'+
   '<g fill="none" stroke="#06142a" stroke-opacity=".45" stroke-width=".9">'+rough+'</g>'+
  '</g>'+
  '<path d="'+BILL_TOP+'" fill="none" stroke="#f0fbff" stroke-opacity=".9" stroke-width="1.4"/>'+
  '<path d="'+BILL_TOP+'" fill="none" stroke="#62d4ff" stroke-opacity=".7" stroke-width="5" filter="url(#'+p+'Glow)" style="opacity:var(--bwglow,1)"/>'+
  '<path d="'+BILL_LOW+'" fill="none" stroke="#01060d" stroke-opacity=".8" stroke-width="1"/>'+
  // 윗턱 뿌리: 머리로 이어지는 굵은 마디와 콧구멍
  '<path d="M238,-21 C252,-26 266,-32 282,-40" fill="none" stroke="#bfe6fb" stroke-opacity=".4" stroke-width="1.6" filter="url(#'+p+'Rim)"/>'+
  '<path d="M226,-10 C240,-12 252,-12 266,-10" fill="none" stroke="#03101f" stroke-opacity=".55" stroke-width="1.4"/>'+
  '<ellipse cx="240" cy="-15" rx="2.4" ry="1.4" fill="#02060d" opacity=".8"/>'+
  // 가슴지느러미(낫 모양) · 배지느러미(가늘고 긴 끈)
  '<path d="'+PEC+'" fill="url(#'+p+'Fin)" stroke="#86ccf2" stroke-opacity=".3" stroke-width="1"/>'+
  '<path d="M332,44 C356,62 384,86 420,108" fill="none" stroke="#0a2040" stroke-width="3.2" stroke-linecap="round"/>'+
  '<path d="M306,34 C350,52 410,64 482,64 C580,63 680,49 770,30 C818,20 852,13 884,10" fill="none" stroke="#8fc9e6" stroke-opacity=".16" stroke-width="1.4" filter="url(#'+p+'Rim)"/>'+
  // 달빛을 받는 등선
  '<path d="'+BACK+'" fill="none" stroke="#d6effc" stroke-opacity=".5" stroke-width="2" filter="url(#'+p+'Rim)"/>'+
  // 눈: 크고 어두운 눈, 푸른 테
  '<g><circle cx="'+EYE[0]+'" cy="'+EYE[1]+'" r="12.5" fill="#06111f" stroke="#2c5d86" stroke-width="1.8"/>'+
   '<circle cx="'+EYE[0]+'" cy="'+EYE[1]+'" r="8.6" fill="#01040a"/>'+
   '<circle cx="'+EYE[0]+'" cy="'+EYE[1]+'" r="11" fill="none" stroke="#6fd6ff" stroke-opacity=".5" stroke-width="1.1" filter="url(#'+p+'Rim)" style="opacity:var(--bwglow,1)"/>'+
   '<circle cx="'+(EYE[0]-3)+'" cy="'+(EYE[1]-3)+'" r="1.7" fill="#e8f6ff" opacity=".85"/></g>'+
 '</g>'+
 '<g id="'+p+'G"><path d="'+SAIL+'"/><path d="'+BODY+'"/><path d="'+BILL+'"/></g>';
}

/* ---------- 검은 쪽배 (창백한 고래 장면과 같은 실루엣, 오른쪽을 바라봄) ---------- */
const BOAT=
 '<circle cx="51" cy="-18.5" r="30" class="bw-lampglow" fill="url(#bwLamp)"/>'+
 '<path d="M-50,-11 L-44,-8 L38,-8 Q47,-9 55,-17 L52,-9 Q47,3 33,6 L-34,6 Q-46,4 -50,-11 Z" fill="#030405"/>'+
 '<path d="M-44,-8 L38,-8" stroke="#8fa3ae" stroke-opacity=".35" stroke-width=".8"/>'+
 '<rect x="-14" y="-17" width="22" height="9" rx="1.5" fill="#030405"/>'+
 '<path d="M-3,-17 L-3,-52 M-3,-47 L-17,-47" stroke="#030405" stroke-width="2.4" stroke-linecap="round"/>'+
 '<path d="M-3,-50 L46,-12 M-3,-50 L-46,-10" stroke="#030405" stroke-width=".7"/>'+
 '<path d="M45,-8 L45,-25 L51,-25 L51,-22" stroke="#030405" stroke-width="1.6" fill="none"/>'+
 '<rect x="48.4" y="-21.5" width="5.2" height="6.2" rx="1.2" fill="#ffe39a" stroke="#ffbf47" stroke-width=".8"/>'+
 '<g><path d="M22,-8 L23,-21 Q23,-26 27,-27 Q31,-26 31,-21 L32,-8 Z" fill="#030405"/>'+
 '<circle cx="27" cy="-30.5" r="3.4" fill="#030405"/>'+
 '<path class="bw-arm" d="M29,-23 L37,-30" stroke="#030405" stroke-width="2.2" stroke-linecap="round"/></g>';
const BOAT_S=1.9;
const HARPOON=
 '<path d="M-104,0 L-10,0" stroke="#15191b" stroke-width="4" stroke-linecap="round"/>'+
 '<path d="M-104,-1.2 L-12,-1.2" stroke="#d3dcda" stroke-opacity=".55" stroke-width="1.1"/>'+
 '<g class="bw-tip"><path d="M3,0 L-16,-6.5 L-11,0 L-16,6.5 Z" fill="#dfe6e3" stroke="#aebbb9" stroke-width="1" stroke-linejoin="round"/>'+
 '<path d="M-12,-3 L-22,-9 M-12,3 L-22,9" stroke="#c5cfcc" stroke-width="1.6" stroke-linecap="round"/></g>';

/* ---------- 공통 배경 ---------- */
function commonDefs(){
 return ''+
 '<linearGradient id="bwSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#02050a"/><stop offset=".6" stop-color="#0b1520"/><stop offset="1" stop-color="#14222c"/></linearGradient>'+
 '<linearGradient id="bwSea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0f1d27" stop-opacity=".9"/><stop offset=".25" stop-color="#08121a" stop-opacity=".95"/><stop offset="1" stop-color="#010306"/></linearGradient>'+
 '<radialGradient id="bwMoon"><stop stop-color="#e2edf1" stop-opacity=".5"/><stop offset=".18" stop-color="#bfd2da" stop-opacity=".18"/><stop offset="1" stop-color="#9fb4c0" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bwLamp"><stop stop-color="#ffbf47" stop-opacity=".95"/><stop offset=".22" stop-color="#ffbf47" stop-opacity=".42"/><stop offset=".6" stop-color="#ffbf47" stop-opacity=".08"/><stop offset="1" stop-color="#ffbf47" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bwFlash"><stop stop-color="#f4fdff" stop-opacity=".95"/><stop offset=".3" stop-color="#9fe6ff" stop-opacity=".45"/><stop offset="1" stop-color="#5fc8ff" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bwUnder"><stop stop-color="#59cfff" stop-opacity=".55"/><stop offset=".5" stop-color="#2a8fd0" stop-opacity=".18"/><stop offset="1" stop-color="#2a8fd0" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="bwCol" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#dfeef4" stop-opacity=".7"/><stop offset=".25" stop-color="#c9e2ec" stop-opacity=".34"/><stop offset=".6" stop-color="#bcd9e6" stop-opacity=".1"/><stop offset="1" stop-color="#bcd9e6" stop-opacity="0"/></linearGradient>'+
 '<filter id="bwMist" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="14 6"/></filter>'+
 '<filter id="bwSoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>'+
 '<filter id="bwSoftS" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="3 1.6"/></filter>'+
 '<filter id="bwHaze" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>'+
 '<filter id="bwRimF" x="-5%" y="-40%" width="110%" height="180%"><feGaussianBlur stdDeviation="1.6"/></filter>'+
 '<filter id="bwStreak" x="-40%" y="-10%" width="180%" height="120%"><feGaussianBlur stdDeviation="16 2"/></filter>'+
 '<clipPath id="bwAbove"><rect width="'+W+'" height="'+(SEA+1)+'"/></clipPath>'+
 '<clipPath id="bwBelow"><rect y="'+(SEA+1)+'" width="'+W+'" height="'+(H-SEA)+'"/></clipPath>';
}
function sky(){
 return '<rect width="'+W+'" height="'+H+'" fill="url(#bwSky)"/>'+
  '<circle cx="812" cy="98" r="190" fill="url(#bwMoon)"/>'+
  '<circle cx="812" cy="98" r="26" fill="#dde8ec" opacity=".42" filter="url(#bwRimF)"/>'+
  '<g class="bw-mist" filter="url(#bwMist)"><rect x="-200" y="252" width="700" height="34" rx="17" fill="#c3d3dc" opacity=".08"/><rect x="560" y="228" width="760" height="40" rx="20" fill="#c3d3dc" opacity=".07"/></g>'+
  '<path d="M0,'+SEA+' H'+W+'" stroke="#9fb7c2" stroke-opacity=".18" stroke-width="1.2"/>';
}
function sea(){
 return '<rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" fill="url(#bwSea)"/>'+
  '<g fill="#dbe7ec">'+[0,1,2,3,4,5,6].map(i=>'<rect class="bw-glint" data-i="'+i+'" x="'+(794-i*4)+'" y="'+(SEA+8+i*i*3.2+i*6)+'" width="'+(26+i*9)+'" height="'+n1(1.6+i*.35)+'" rx="1" opacity="0"/>').join('')+'</g>'+
  '<g fill="none" stroke="#b3c7d0" stroke-linecap="round">'+[0,1,2,3,4,5,6,7].map(i=>{const y=SEA+7+i*i*2.6+i*7;return '<path class="bw-wave" data-i="'+i+'" d="M-60,'+n1(y)+' H'+(W+60)+'" stroke-opacity="'+n3(.15-i*.012)+'" stroke-width="'+n1(1+i*.3)+'" stroke-dasharray="'+(30+i*14)+' '+(40+i*22)+'"/>';}).join('')+'</g>';
}
function nearMist(){
 return '<g class="bw-mist" filter="url(#bwMist)"><rect x="-300" y="'+(SEA-16)+'" width="900" height="30" rx="15" fill="#cfdde3" opacity=".07"/><rect x="420" y="'+(SEA-34)+'" width="900" height="26" rx="13" fill="#cfdde3" opacity=".055"/></g>';
}
function boatMarkup(cls){
 return '<ellipse class="bw-lampglint" cy="'+(SEA+9)+'" rx="22" ry="3" fill="#ffbf47" filter="url(#bwRimF)" opacity="0"/>'+
  '<g clip-path="url(#bwAbove)"><g class="bw-boat'+(cls?' '+cls:'')+'">'+BOAT+'</g></g>';
}
// 물보라 장막: 아래는 진하고 위로 갈수록 흩어지는 물의 벽. 위쪽 가장자리는 들쭉날쭉하게.
function curtain(cls,extra){
 return '<g class="'+cls+'"'+(extra||'')+'><path class="cu-haze" fill="url(#bwCol)" filter="url(#bwHaze)" opacity="0"/>'+
  '<path class="cu-body" fill="url(#bwCol)" filter="url(#bwSoftS)" opacity="0"/>'+
  '<path class="cu-crest" fill="none" stroke="#eef7fa" stroke-width="1.1" filter="url(#bwRimF)" opacity="0"/></g>';
}
function paintCurtain(g,x0,x1,hf,seed,t,op){
 const [hz,bd,cr]=g._cu||(g._cu=[g.querySelector('.cu-haze'),g.querySelector('.cu-body'),g.querySelector('.cu-crest')]);
 let top='',haze='',mx=0;const step=Math.max(5,(x1-x0)/90);
 for(let x=x0;x<=x1+.1;x+=step){
  const h=Math.max(0,hf(x));mx=Math.max(mx,h);
  const sp=Math.sin(x*1.37+seed*7.7)*Math.sin(x*.53+seed);
  const n=.6+.16*Math.sin(x*.071+seed)+.1*Math.sin(x*.23+seed*2.3+t*2.6)+.06*Math.sin(x*.61+seed*5.1-t*6.5)+.16*Math.max(0,sp)*sp;
  top+=' L'+n1(x)+','+n1(SEA-h*n);haze+=' L'+n1(x)+','+n1(SEA-h*n*1.18-2);
 }
 if(mx<1||op<=0){hz.setAttribute('opacity','0');bd.setAttribute('opacity','0');cr.setAttribute('opacity','0');return;}
 bd.setAttribute('d','M'+n1(x0)+','+(SEA+4)+top+' L'+n1(x1)+','+(SEA+4)+' Z');
 hz.setAttribute('d','M'+n1(x0-10)+','+(SEA+4)+haze+' L'+n1(x1+10)+','+(SEA+4)+' Z');
 cr.setAttribute('d','M'+top.slice(2));
 bd.setAttribute('opacity',n3(.6*op));hz.setAttribute('opacity',n3(.45*op));cr.setAttribute('opacity',n3(.14*op));
}
function columns(cls,n){
 let s='<g class="'+cls+'">';
 for(let i=0;i<n;i++)s+=curtain('bw-col',' data-i="'+i+'"');
 return s+'</g>';
}
// 물방울 · 파편
function drops(cls,n,seed,fill){
 let s='<g class="'+cls+'">';
 const r=seeded(seed);
 for(let i=0;i<n;i++)s+='<circle data-i="'+i+'" r="'+n1(1.2+r()*2.2)+'" fill="'+(fill||'#dcebf1')+'" opacity="0"/>';
 return s+'</g>';
}
function dropParams(n,seed,a0,a1,v0,v1){
 const r=seeded(seed);
 return Array.from({length:n},()=>{const a=(a0+(a1-a0)*r())*RAD,v=v0+(v1-v0)*r();return {vx:Math.cos(a)*v,vy:Math.sin(a)*v,d:r()*0.12,ox:(r()-.5)*2,life:.8+r()*.8};});
}
function paintDrops(nodes,P,x,y,s,spreadX,g){
 nodes.forEach(d=>{
  const p=P[+d.dataset.i],k=s-p.d;
  if(k<=0||k>p.life){d.setAttribute('opacity','0');return;}
  const px=x+p.ox*(spreadX||0)+p.vx*k,py=y+p.vy*k+(g||420)*k*k;
  d.setAttribute('cx',n1(px));d.setAttribute('cy',n1(py));
  d.setAttribute('opacity',py>SEA+4?'0':n3(.85*(1-k/p.life)));
 });
}

/* ---------- 공통 움직임 ---------- */
function cacheQ(el){
 const c=el._bw||(el._bw={});
 return {
  q:s=>c[s]||(c[s]=el.querySelector(s)),
  qa:s=>c['*'+s]||(c['*'+s]=Array.from(el.querySelectorAll(s)))
 };
}
function ambient(el,t,flow){
 const {qa}=cacheQ(el);
 const f=flow||0;
 qa('.bw-wave').forEach(w=>{const i=+w.dataset.i;w.style.strokeDashoffset=n1(t*(8+i*6)*(i%2?1:-1)+t*f*(0.5+i*0.22));});
 qa('.bw-glint').forEach(g=>{const i=+g.dataset.i;g.setAttribute('opacity',n3(0.1+0.14*(0.5+0.5*Math.sin(t*2.3+i*1.7))));});
 qa('.bw-mist').forEach((m,i)=>{
  const x=f?(((-t*f*(i?0.9:0.35))%1400)+1400)%1400-700:Math.sin(t*0.13+i*2)*50;
  m.setAttribute('transform','translate('+n1(x)+' 0)');
 });
}
// 배 자세 → 세계 좌표 변환기
function boatPose(el,x,y,deg,armEnd){
 const {q}=cacheQ(el);
 q('.bw-boat').setAttribute('transform','translate('+n1(x)+' '+n1(y)+') rotate('+n1(deg)+') scale('+BOAT_S+')');
 if(armEnd)q('.bw-arm').setAttribute('d','M29,-23 L'+n1(armEnd[0])+','+n1(armEnd[1]));
 const br=deg*RAD,toWorld=p=>[x+BOAT_S*(p[0]*Math.cos(br)-p[1]*Math.sin(br)),y+BOAT_S*(p[0]*Math.sin(br)+p[1]*Math.cos(br))];
 return toWorld;
}
function lamp(el,t,toWorld,boost){
 const {q}=cacheQ(el);
 const k=0.86+Math.sin(t*7.3)*.05+Math.sin(t*12.9+1.7)*.04+(boost||0);
 q('.bw-lampglow').style.opacity=n3(k);
 const lw=toWorld([51,-18.5]),lg=q('.bw-lampglint');
 lg.setAttribute('cx',n1(lw[0]));lg.style.opacity=n3(0.4*k);
}
function veil(el,v){cacheQ(el).q('.bw-veil').style.opacity=n3(clamp(v)*0.92);}
function caption(el,caps,t){
 const {q}=cacheQ(el);let txt=caps[0][1];
 for(const c of caps)if(t>=c[0])txt=c[1];
 const b=q('.cine-bottom');if(b&&b.textContent!==txt)b.textContent=txt;
}
function setUse(node,tr,op){node.setAttribute('transform',tr);node.style.opacity=n3(op);}

window.BlueWhaleV3Kit={W,H,SEA,clamp,outC,inC,inOut,seg,bell,lerp,n1,n3,TAU,RAD,seeded,esc,warp,mt,apply,
 marlinDefs,commonDefs,sky,sea,nearMist,boatMarkup,columns,curtain,paintCurtain,drops,dropParams,paintDrops,cacheQ,ambient,boatPose,lamp,veil,caption,setUse,
 BOAT,BOAT_S,HARPOON,EYE};
})();
