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

/* ---------- 청새치 고래 (왼쪽을 바라봄 · 주둥이 끝 -60,-6 · 몸 중심 500,0 · 꼬리 끝 1004,±184) ---------- */
const BODY='M-60,-6 C40,-9 140,-12 214,-16 C246,-24 274,-46 318,-62 C385,-84 460,-93 545,-89 '+
 'C655,-82 765,-50 848,-20 L878,-14 C902,-40 944,-112 1004,-184 C972,-124 950,-62 934,-6 Q931,0 934,6 '+
 'C950,62 972,124 1004,184 C944,112 902,40 878,14 L848,20 C765,52 655,80 545,85 '+
 'C445,89 362,76 312,54 C282,40 258,24 240,12 L226,6 C150,4 60,2 -60,-6 Z';
const BACK='M214,-16 C246,-24 274,-46 318,-62 C385,-84 460,-93 545,-89 C655,-82 765,-50 848,-20';
const SAIL='M316,-60 C332,-120 356,-196 396,-250 C404,-206 426,-154 476,-116 C534,-108 596,-102 660,-80 C566,-96 446,-100 316,-60 Z';
const SAIL_EDGE='M316,-60 C332,-120 356,-196 396,-250 C404,-206 426,-154 476,-116 C534,-108 596,-102 660,-80';
const RAYS=[[330,-66,350,-168],[346,-72,368,-212],[364,-77,390,-244],[386,-81,402,-200],[410,-84,422,-160],[440,-87,452,-128],[480,-89,500,-114],[530,-90,552,-106],[585,-89,608,-98]];
const PEC='M322,30 C372,52 432,94 534,150 C472,102 422,70 380,46 C362,37 342,31 322,30 Z';
const EYE=[268,-20];
function marlinDefs(p){
 const r=seeded(23);let stripes='',fine='',scars='';
 for(let x=380,i=0;x<=846;i++){
  const w=Math.max(2.2,9-i*0.5)*(0.7+r()*0.6),len=60+r()*70,top=-104;
  const d='M'+n1(x)+','+top+' C'+n1(x+5)+','+n1(top+len*.4)+' '+n1(x+10)+','+n1(top+len*.75)+' '+n1(x+13+r()*4)+','+n1(top+len);
  const dash=Math.round(18+r()*30)+' '+Math.round(3+r()*7)+' '+Math.round(30+r()*40)+' '+Math.round(4+r()*10);
  stripes+='<path d="'+d+'" stroke-width="'+n1(w)+'" stroke-dasharray="'+dash+'"/>';
  fine+='<path d="'+d+'" stroke-dasharray="'+dash+'"/>';
  x+=24+r()*16;
 }
 // 오래된 상처: 옆구리를 길게 긁고 간 흰 자국
 [[420,-30,560,-46,640,-38],[470,20,560,10,660,22],[600,-58,690,-60,760,-44],[360,4,400,-6,450,-4]].forEach(a=>{
  scars+='<path d="M'+a[0]+','+a[1]+' Q'+a[2]+','+a[3]+' '+a[4]+','+a[5]+'"/>';
 });
 const rays=RAYS.map(r=>'M'+r[0]+','+r[1]+' L'+r[2]+','+r[3]).join(' ');
 return ''+
 '<linearGradient id="'+p+'Skin" gradientUnits="userSpaceOnUse" x1="0" y1="-96" x2="0" y2="90">'+
  '<stop stop-color="#071428"/><stop offset=".28" stop-color="#0f2f58"/><stop offset=".48" stop-color="#1c5288"/>'+
  '<stop offset=".62" stop-color="#3a6790"/><stop offset=".78" stop-color="#71889c"/><stop offset="1" stop-color="#8d9ba7"/></linearGradient>'+
 '<linearGradient id="'+p+'Belly" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="92"><stop stop-color="#020812" stop-opacity="0"/><stop offset="1" stop-color="#020812" stop-opacity=".7"/></linearGradient>'+
 '<linearGradient id="'+p+'Sail" gradientUnits="userSpaceOnUse" x1="0" y1="-250" x2="0" y2="-60">'+
  '<stop stop-color="#14365e" stop-opacity=".78"/><stop offset=".55" stop-color="#0d2645" stop-opacity=".92"/><stop offset="1" stop-color="#081a33"/></linearGradient>'+
 '<linearGradient id="'+p+'Fin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#163d69"/><stop offset="1" stop-color="#091a31"/></linearGradient>'+
 '<linearGradient id="'+p+'Head" gradientUnits="userSpaceOnUse" x1="200" y1="0" x2="900" y2="0">'+
  '<stop stop-color="#000" stop-opacity=".45"/><stop offset=".18" stop-color="#000" stop-opacity=".05"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>'+
 '<radialGradient id="'+p+'Sheen" cx=".5" cy=".5" r=".5"><stop stop-color="#cfe9f7" stop-opacity=".28"/><stop offset="1" stop-color="#cfe9f7" stop-opacity="0"/></radialGradient>'+
 '<filter id="'+p+'Tex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75 .5" numOctaves="2" seed="11"/><feColorMatrix values="0 0 0 0 .02  0 0 0 0 .06  0 0 0 0 .12  0 0 0 -1.5 1.1"/></filter>'+
 '<filter id="'+p+'Glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4"/></filter>'+
 '<filter id="'+p+'Rim" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="1.4"/></filter>'+
 '<clipPath id="'+p+'Clip"><path d="'+BODY+'"/></clipPath>'+
 // 실제 고래
 '<g id="'+p+'M">'+
  '<path d="'+SAIL+'" fill="url(#'+p+'Sail)"/>'+
  '<path d="'+rays+'" fill="none" stroke="#7fc9f2" stroke-opacity=".3" stroke-width="1.3" stroke-linecap="round"/>'+
  '<path d="'+SAIL_EDGE+'" fill="none" stroke="#bfe7ff" stroke-opacity=".38" stroke-width="1.6" filter="url(#'+p+'Rim)"/>'+
  '<path d="M792,-38 L808,-64 L826,-30 Z M640,72 C662,98 678,116 694,122 C696,102 700,86 704,68 Z M770,44 L790,76 L808,38 Z" fill="#0b2140"/>'+
  '<path d="'+BODY+'" fill="url(#'+p+'Skin)"/>'+
  '<g clip-path="url(#'+p+'Clip)">'+
   '<rect x="-70" y="-200" width="1090" height="400" filter="url(#'+p+'Tex)" opacity=".4"/>'+
   '<g fill="none" stroke="#6fcaf5" stroke-linecap="round" filter="url(#'+p+'Glow)" style="opacity:var(--bwglow,1)"><g opacity=".42">'+stripes+'</g></g>'+
   '<g fill="none" stroke="#cfeefd" stroke-width="1.1" stroke-linecap="round" style="opacity:var(--bwglow,1)"><g opacity=".3">'+fine+'</g></g>'+
   '<g fill="none" stroke="#dfeef5" stroke-opacity=".13" stroke-width="1.6" stroke-linecap="round">'+scars+'</g>'+
   '<rect x="-70" y="20" width="1090" height="80" fill="url(#'+p+'Belly)"/>'+
   '<ellipse cx="540" cy="-78" rx="320" ry="24" fill="url(#'+p+'Sheen)"/>'+
   '<path d="'+BODY+'" fill="url(#'+p+'Head)"/>'+
   '<path d="M326,-56 C346,-24 350,14 332,48" fill="none" stroke="#040b16" stroke-opacity=".75" stroke-width="3.2"/>'+
   '<path d="M334,-52 C352,-22 356,14 340,44" fill="none" stroke="#9bd4f2" stroke-opacity=".16" stroke-width="1.4"/>'+
   '<path d="M344,-16 C450,-34 566,-24 684,-16 S824,-4 880,0" fill="none" stroke="#c4ebff" stroke-opacity=".22" stroke-width="1.4" stroke-dasharray="18 5 40 6"/>'+
   '<path d="M228,6 C256,9 282,10 306,4" fill="none" stroke="#030912" stroke-opacity=".8" stroke-width="2.4"/>'+
   '<path d="M852,-4 L884,-2 M852,6 L884,4" stroke="#061224" stroke-width="2.4"/>'+
  '</g>'+
  '<path d="'+PEC+'" fill="url(#'+p+'Fin)" stroke="#7cc6ee" stroke-opacity=".28" stroke-width="1.2"/>'+
  '<path d="M382,72 L402,124 L412,76 Z" fill="#0b2140"/>'+
  // 창 같은 주둥이의 날과 등의 달빛
  '<path d="M-60,-6 C40,-9 140,-12 214,-16" fill="none" stroke="#e6f8ff" stroke-opacity=".8" stroke-width="1.6"/>'+
  '<path d="M-60,-6 C40,-9 140,-12 214,-16" fill="none" stroke="#5fd3ff" stroke-opacity=".6" stroke-width="5" filter="url(#'+p+'Glow)" style="opacity:var(--bwglow,1)"/>'+
  '<path d="'+BACK+'" fill="none" stroke="#d3eefc" stroke-opacity=".45" stroke-width="2.2" filter="url(#'+p+'Rim)"/>'+
  // 큰 눈
  '<g><circle cx="'+EYE[0]+'" cy="'+EYE[1]+'" r="15" fill="#06111f" stroke="#2c5d86" stroke-width="2"/>'+
   '<circle cx="'+EYE[0]+'" cy="'+EYE[1]+'" r="10.5" fill="#01040a"/>'+
   '<circle cx="'+EYE[0]+'" cy="'+EYE[1]+'" r="13" fill="none" stroke="#6fd6ff" stroke-opacity=".5" stroke-width="1.2" filter="url(#'+p+'Rim)" style="opacity:var(--bwglow,1)"/>'+
   '<circle cx="'+(EYE[0]-3.5)+'" cy="'+(EYE[1]-3.5)+'" r="2" fill="#e8f6ff" opacity=".85"/></g>'+
 '</g>'+
 // 잔상용 단순 실루엣
 '<g id="'+p+'G"><path d="'+SAIL+'"/><path d="'+BODY+'"/></g>';
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
