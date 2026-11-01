/* 모든 것을 가라앉히는 노란 고래 · v0.2.4 다섯 장면 + 미니게임 화면
   window.YellowWhaleV3 = {html(stage,opts), stages, replayToken, geo}
   황토빛 등껍질 위로 황금빛 따개비 같은 열수공 셋이 삼각형을 이룬다. 그 안쪽의 물은 모든 것을 빨아들여 가라앉힌다.
   - 표현: 유황빛 하늘 · 기름처럼 무겁게 번들거리는 물 · 삼각형 한가운데로 감겨 드는 물길 · 떠내려가 가라앉는 잔해
   - 열수공: 겹겹이 포개진 껍데기 판 · 성장선 · 둘레에 붙은 작은 따개비 · 꼭대기의 부리 모양 덮개 · 그 아래 황금빛 중심부
   ① 가라앉는 삼각형 ②③④ 열수공(미니게임 vent) ⑤ 따개비 껍데기(미니게임 hook) · 성공 장면 '삼백 년' */
(function(){
'use strict';
const K=window.BlueWhaleV3Kit;
if(!K)return;
const {W,H,SEA,clamp,outC,inC,inOut,seg,lerp,n1,n3,TAU,RAD,seeded,esc,commonDefs,boatMarkup,cacheQ,boatPose,lamp,veil,caption,HARPOON,drops,dropParams,paintDrops}=K;
const NAME='모든 것을 가라앉히는 노란 고래';
const HL=()=>window.HarpoonLauncher;
const hump=x=>Math.sin(Math.PI*clamp(x));
const VENTS=[{x:566,y:SEA+12,s:.9},{x:340,y:SEA+98,s:1.36},{x:792,y:SEA+86,s:1.28}];   // 재앙 고래: 열수공을 크게
const C=[(VENTS[0].x+VENTS[1].x+VENTS[2].x)/3,(VENTS[0].y+VENTS[1].y+VENTS[2].y)/3];   // 삼각형 한가운데
const BOATX=140;

/* ---------- 정의 ---------- */
function yDefs(){
 return ''+
 '<linearGradient id="ySky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#140f06"/><stop offset=".4" stop-color="#33270e"/><stop offset=".78" stop-color="#7a5c22"/><stop offset="1" stop-color="#c49a4a"/></linearGradient>'+
 '<radialGradient id="ySun" cx="0" cy="0" r="1" gradientUnits="objectBoundingBox"><stop stop-color="#ffe7a0" stop-opacity=".55"/><stop offset=".3" stop-color="#e0a840" stop-opacity=".22"/><stop offset="1" stop-color="#a87020" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="ySunG"><stop stop-color="#fff2c0" stop-opacity=".7"/><stop offset=".25" stop-color="#ffd070" stop-opacity=".28"/><stop offset="1" stop-color="#c88a30" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="ySea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5a4618"/><stop offset=".18" stop-color="#3a2c0e"/><stop offset=".6" stop-color="#1e1606"/><stop offset="1" stop-color="#0c0902"/></linearGradient>'+
 '<linearGradient id="yCloud" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2a200c" stop-opacity=".0"/><stop offset=".4" stop-color="#3a2c12" stop-opacity=".85"/><stop offset=".85" stop-color="#6a5020" stop-opacity=".9"/><stop offset="1" stop-color="#d8a850" stop-opacity=".6"/></linearGradient>'+
 '<filter id="yBlur6" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>'+
 '<filter id="yBlur14" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="14"/></filter>'+
 '<filter id="yBlur3" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>'+
 '<filter id="yGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".09 .05" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 .18  0 0 0 0 .1  0 0 0 0 .02  0 0 0 2.2 -.9"/></filter>'+
 '<filter id="yGrainL" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05 .12" numOctaves="2" seed="19"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .9  0 0 0 0 .6  0 0 0 2 -1.1"/></filter>'+
 '<filter id="yCaust" x="0" y="0" width="100%" height="100%"><feTurbulence type="turbulence" baseFrequency=".012 .05" numOctaves="2" seed="31"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .82  0 0 0 0 .4  0 0 0 3 -1.6"/></filter>'+
 '<linearGradient id="yShell" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e2b866"/><stop offset=".35" stop-color="#b8863a"/><stop offset=".75" stop-color="#7a5220"/><stop offset="1" stop-color="#3e280c"/></linearGradient>'+
 '<linearGradient id="yShellSide" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#000" stop-opacity=".55"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#fff2c8" stop-opacity=".16"/><stop offset=".75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>'+
 '<linearGradient id="yPlate" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#4a2c0c"/><stop offset=".3" stop-color="#c8963c"/><stop offset=".48" stop-color="#f4d27a"/><stop offset=".62" stop-color="#b8822c"/><stop offset="1" stop-color="#3a220a"/></linearGradient>'+
 '<linearGradient id="yPlateV" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff0c0" stop-opacity=".35"/><stop offset=".25" stop-color="#fff0c0" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".15"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>'+
 '<linearGradient id="yBeak" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f2d080"/><stop offset=".5" stop-color="#a8762a"/><stop offset="1" stop-color="#4a2c0a"/></linearGradient>'+
 '<radialGradient id="yCore"><stop stop-color="#fffbe6"/><stop offset=".3" stop-color="#ffe680"/><stop offset=".65" stop-color="#f0a628"/><stop offset="1" stop-color="#7a4006"/></radialGradient>'+
 '<radialGradient id="yHalo"><stop stop-color="#ffe7a0" stop-opacity=".75"/><stop offset=".35" stop-color="#ffc850" stop-opacity=".28"/><stop offset="1" stop-color="#c88a20" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="ySteam"><stop stop-color="#fff2c8" stop-opacity=".55"/><stop offset=".5" stop-color="#e8c070" stop-opacity=".2"/><stop offset="1" stop-color="#c89840" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="ySmoke"><stop stop-color="#3a2a14" stop-opacity=".6"/><stop offset=".6" stop-color="#2a1e0c" stop-opacity=".22"/><stop offset="1" stop-color="#2a1e0c" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="yRipple"><stop offset=".68" stop-color="#ffe0a0" stop-opacity="0"/><stop offset=".86" stop-color="#ffe6b0" stop-opacity=".38"/><stop offset="1" stop-color="#ffe0a0" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="yPit"><stop stop-color="#050300" stop-opacity=".95"/><stop offset=".35" stop-color="#140c02" stop-opacity=".7"/><stop offset=".75" stop-color="#2a1c06" stop-opacity=".25"/><stop offset="1" stop-color="#2a1c06" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="yUnder"><stop stop-color="#d8a850" stop-opacity=".42"/><stop offset=".55" stop-color="#a87428" stop-opacity=".2"/><stop offset="1" stop-color="#6a4410" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="yLife"><stop stop-color="#f4fbff"/><stop offset=".4" stop-color="#cfe8ff" stop-opacity=".5"/><stop offset="1" stop-color="#cfe8ff" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="yFlash"><stop stop-color="#fffbe8"/><stop offset=".25" stop-color="#ffe080" stop-opacity=".7"/><stop offset="1" stop-color="#f0a020" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="yRing"><stop offset=".62" stop-color="#ffd98a" stop-opacity="0"/><stop offset=".84" stop-color="#ffeac0" stop-opacity=".7"/><stop offset=".92" stop-color="#fff7e2" stop-opacity=".95"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>'+
 (window.FxNoise?FxNoise.pattern('yGrainPat','ygrain',{cell:10,oct:3,rgb:[46,26,5],lo:.5,hi:.8,stretch:[1.8,1],seed:7},120,120)+FxNoise.pattern('yGrainLPat','ygrainl',{cell:16,oct:2,rgb:[255,230,150],lo:.62,hi:.9,stretch:[1,2.4],seed:19},120,120)+FxNoise.pattern('yCaustPat','ycaust',{cell:60,oct:2,rgb:[255,210,100],lo:.55,hi:.72,stretch:[4,1],seed:31},340,140):'')+
 '<clipPath id="yAbove"><rect x="-260" y="-460" width="520" height="462"/></clipPath>'+
 '<clipPath id="yIsle"><path d="'+ISLE+'"/></clipPath>'+
 '<clipPath id="yConeC"><path d="'+CONE+'"/></clipPath>'+
 '<clipPath id="ySeaClip"><rect x="0" y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'"/></clipPath>';
}
/* ---------- 하늘 · 물 ---------- */
let GL=null;
function glints(){if(GL)return GL;const r=seeded(23),a=[];for(let i=0;i<70;i++){const y=SEA+4+Math.pow(r(),1.6)*(H-SEA-10);a.push({x:r()*W,y,w:6+r()*30*(1+(y-SEA)/120),o:.2+.6*r(),ph:r()*TAU});}return GL=a;}
function skyMarkup(){
 let cl='';const r=seeded(5);
 for(let i=0;i<9;i++){const x=r()*W,y=40+r()*190,w=180+r()*300,h=20+r()*34;cl+='<ellipse class="y-cl" data-i="'+i+'" cx="'+n1(x)+'" cy="'+n1(y)+'" rx="'+n1(w)+'" ry="'+n1(h)+'" fill="url(#yCloud)" opacity="'+n3(.55+.4*r())+'" filter="url(#yBlur6)"/>';}
 return '<rect width="'+W+'" height="'+(SEA+2)+'" fill="url(#ySky)"/>'+
  '<circle cx="300" cy="'+(SEA-70)+'" r="260" fill="url(#ySunG)"/>'+
  '<circle cx="300" cy="'+(SEA-70)+'" r="24" fill="#ffefc0" opacity=".55" filter="url(#yBlur3)"/>'+
  '<g class="y-clouds">'+cl+'</g>'+
  '<rect x="0" y="'+(SEA-46)+'" width="'+W+'" height="60" fill="#d8b060" opacity=".16" filter="url(#yBlur14)"/>'+
  // 수평선 너머에서 반쯤 가라앉은 배(돛대가 기울어 있음)
  '<g class="y-wreck" transform="translate(880 '+(SEA+1)+')" opacity=".55"><path d="M-30,0 L22,0 L28,-6 L-26,-5 Z" fill="#1a1206"/><path d="M-4,-5 L8,-58" stroke="#1a1206" stroke-width="2"/><path d="M8,-58 L-14,-20 L-2,-14 Z" fill="#2a1e0a" opacity=".8"/><path d="M-20,-5 L-28,-32" stroke="#1a1206" stroke-width="1.4"/></g>';
}
function seaMarkup(){
 let g='';glints().forEach((p,i)=>{g+='<ellipse class="y-gl" data-i="'+i+'" cx="'+n1(p.x)+'" cy="'+n1(p.y)+'" rx="'+n1(p.w)+'" ry="'+n1(.6+p.w*.03)+'" fill="#ffe0a0" opacity="0"/>';});
 let sp='';for(let i=0;i<16;i++)sp+='<path class="y-sp" data-i="'+i+'" fill="none" stroke="#ffe2a8" stroke-linecap="round"/>';
 return '<rect x="0" y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" fill="url(#ySea)"/>'+
  '<ellipse cx="300" cy="'+(SEA+40)+'" rx="120" ry="60" fill="url(#ySunG)" opacity=".5"/>'+
  '<g clip-path="url(#ySeaClip)">'+
   // 물밑 등껍질: 삼각형을 품은 넓은 황토빛 그림자 + 물결 무늬 빛
   '<ellipse class="y-under" cx="'+n1(C[0])+'" cy="'+n1(C[1]+10)+'" rx="360" ry="78" fill="url(#yUnder)"/>'+
   '<g class="y-caust" opacity=".22"><ellipse cx="'+n1(C[0])+'" cy="'+n1(C[1]+10)+'" rx="340" ry="70" fill="#000" opacity="0"/><rect x="'+n1(C[0]-340)+'" y="'+n1(C[1]-60)+'" width="680" height="140" fill="url(#yCaustPat)" mask="url(#yUnderM)"/></g>'+
   '<g class="y-glints">'+g+'</g>'+
   '<ellipse class="y-pit" cx="'+n1(C[0])+'" cy="'+n1(C[1])+'" rx="1" ry="1" fill="url(#yPit)" opacity="0"/>'+
   '<g class="y-spiral">'+sp+'</g>'+
  '</g>';
}
function underMask(){return '<mask id="yUnderM" maskUnits="userSpaceOnUse" x="0" y="0" width="'+W+'" height="'+H+'"><ellipse cx="'+n1(C[0])+'" cy="'+n1(C[1]+10)+'" rx="340" ry="70" fill="url(#yUnder)"/></mask>';}
/* 떠내려가 가라앉는 잔해: 판자 · 통 · 부서진 노 */
function debrisMarkup(){
 const shapes=['<rect x="-14" y="-2.4" width="28" height="4.8" rx="1.2" fill="#3a2810"/><path d="M-12,-1 L12,-1" stroke="#6a4c22" stroke-width=".6"/>',
  '<ellipse rx="7" ry="5" fill="#4a3214"/><path d="M-7,-1 L7,-1 M-7,2 L7,2" stroke="#2a1c08" stroke-width=".8"/><ellipse rx="7" ry="5" fill="none" stroke="#7a5a2a" stroke-width=".6"/>',
  '<path d="M-18,0 L10,-1 L16,-4 L20,0 L16,4 L10,1 Z" fill="#3a2810"/>',
  '<path d="M-9,-3 L9,-3 L7,3 L-7,3 Z" fill="#2e200c"/><path d="M0,-3 L1,-14" stroke="#2e200c" stroke-width="1.2"/>'];
 let s='';for(let i=0;i<7;i++)s+='<g class="y-db" data-i="'+i+'" opacity="0">'+shapes[i%shapes.length]+'</g>';
 return '<g class="y-debris">'+s+'</g>';
}
/* ---------- 열수공(따개비) ---------- */
const ISLE='M-160,4 C-130,-12 -84,-24 -46,-28 C-14,-31 30,-30 70,-24 C110,-17 140,-6 160,4 Z';
const CONE='M-50,-22 C-48,-58 -40,-92 -30,-114 C-22,-120 22,-120 30,-114 C40,-92 48,-58 50,-22 Z';
function ventBody(){
 let plates='';
 const P=[[-50,-22,-30,-114,-26,-22,-14,-118],[-26,-22,-14,-118,0,-22,0,-120],[0,-22,0,-120,26,-22,14,-118],[26,-22,14,-118,50,-22,30,-114]];
 P.forEach((p,i)=>{plates+='<path d="M'+p[0]+','+p[1]+' C'+n1(p[0]+(p[2]-p[0])*.3)+','+n1(p[1]-40)+' '+n1(p[2]-2)+','+n1(p[3]+30)+' '+p[2]+','+p[3]+' L'+p[6]+','+p[7]+' C'+n1(p[6]+2)+','+n1(p[7]+30)+' '+n1(p[4]+(p[6]-p[4])*.3)+','+n1(p[5]-40)+' '+p[4]+','+p[5]+' Z" fill="url(#yPlate)" opacity="'+(i%2?'.95':'1')+'"/>'+
  '<path d="M'+n1((p[0]+p[4])/2)+','+p[1]+' C'+n1((p[0]+p[4])/2)+','+n1(p[1]-40)+' '+n1((p[2]+p[6])/2)+','+n1(p[3]+30)+' '+n1((p[2]+p[6])/2)+','+n1(p[3]+2)+'" stroke="#fff0c0" stroke-width="1.2" stroke-opacity=".28" fill="none"/>';});
 let growth='';for(let k=0;k<7;k++){const y=-30-k*12.5,w=48-k*2.6;growth+='<path d="M'+n1(-w)+','+n1(y)+' Q0,'+n1(y+5)+' '+n1(w)+','+n1(y)+'" stroke="#3a220a" stroke-width="'+n1(1.4-k*.1)+'" stroke-opacity=".5" fill="none"/>';}
 let crust='';const r=seeded(91);
 for(let k=0;k<11;k++){const x=-140+r()*280,y=-6-r()*16,s=.5+r()*.8;if(Math.abs(x)<54&&y<-8)continue;
  crust+='<g transform="translate('+n1(x)+' '+n1(y)+') scale('+n3(s)+')"><path d="M-9,4 C-8,-4 -5,-10 -3,-12 L3,-12 C5,-10 8,-4 9,4 Z" fill="url(#yPlate)"/><ellipse cy="-12" rx="3" ry="1.2" fill="#2a1806"/><path d="M-5,2 Q0,4 5,2" stroke="#3a220a" stroke-width=".6" fill="none"/></g>';}
 return ''+
  // 섬처럼 드러나는 등껍질
  '<path d="'+ISLE+'" fill="url(#yShell)"/>'+
  '<g clip-path="url(#yIsle)"><rect x="-170" y="-40" width="340" height="50" fill="url(#yGrainPat)"/><rect x="-170" y="-40" width="340" height="50" fill="url(#yShellSide)"/>'+
   '<path d="M-120,-4 C-90,-14 -60,-18 -40,-20 M60,-20 C90,-16 118,-8 140,0 M-30,-6 L-12,-24 M30,-4 L48,-22 M-80,-2 L-64,-16 M96,0 L84,-14" stroke="#3a220a" stroke-width="1.2" stroke-opacity=".55" fill="none"/>'+
   '<path d="M-150,2 C-110,-12 -60,-22 -10,-25" stroke="#fff0c0" stroke-width="2" stroke-opacity=".25" fill="none"/></g>'+
  crust+
  // 원뿔: 겹친 판 · 성장선 · 결
  '<g class="yv-cone"><path d="'+CONE+'" fill="#5a3a12"/>'+plates+
  '<g clip-path="url(#yConeC)">'+growth+'<rect x="-52" y="-122" width="104" height="102" fill="url(#yGrainPat)" opacity=".7"/><rect x="-52" y="-122" width="104" height="102" fill="url(#yPlateV)"/>'+
   '<rect x="-52" y="-122" width="104" height="102" fill="url(#yGrainLPat)" opacity=".3"/></g>'+
  // 꼭대기: 구멍 · 황금빛 중심부 · 부리 모양 덮개 넷
  '<ellipse cy="-116" rx="27" ry="7.5" fill="#1e1204"/>'+
  '<ellipse class="yv-core" cy="-116" rx="22" ry="6" fill="url(#yCore)" opacity="0"/>'+
  '<g class="yv-bL"><path d="M-27,-116 C-20,-124 -8,-128 0,-127 L0,-115 C-10,-114 -20,-114 -27,-116 Z" fill="url(#yBeak)"/><path d="M-22,-119 Q-10,-124 -1,-123" stroke="#fff0c0" stroke-opacity=".35" stroke-width="1" fill="none"/></g>'+
  '<g class="yv-bR"><path d="M27,-116 C20,-124 8,-128 0,-127 L0,-115 C10,-114 20,-114 27,-116 Z" fill="url(#yBeak)"/><path d="M22,-119 Q10,-124 1,-123" stroke="#3a220a" stroke-opacity=".5" stroke-width="1" fill="none"/></g>'+
  '<path d="M0,-127 L0,-115" stroke="#2a1806" stroke-width="1.1"/></g>'+
  // 부서진 그루터기(깨진 뒤에만)
  '<g class="yv-stump" opacity="0"><path d="M-46,-40 L-36,-58 L-26,-50 L-18,-66 L-6,-54 L4,-70 L14,-56 L24,-64 L32,-50 L44,-56 L48,-38 Z" fill="#2a1a08"/><path d="M-30,-52 L-20,-60 M8,-62 L16,-54" stroke="#ffb040" stroke-width="1.6" class="yv-ember" opacity=".8"/></g>';
}
function ventMarkup(i){
 let rp='';for(let k=0;k<3;k++)rp+='<ellipse class="yv-rp" data-k="'+k+'" rx="1" ry="1" fill="url(#yRipple)" opacity="0"/>';
 let st='';for(let k=0;k<7;k++)st+='<ellipse class="yv-st" data-k="'+k+'" rx="1" ry="1" fill="url(#ySteam)" opacity="0"/>';
 let sm='';for(let k=0;k<5;k++)sm+='<ellipse class="yv-sm" data-k="'+k+'" rx="1" ry="1" fill="url(#ySmoke)" opacity="0"/>';
 let lf='';for(let k=0;k<10;k++)lf+='<circle class="yv-lf" data-k="'+k+'" r="1" fill="url(#yLife)" opacity="0"/>';
 let sh='';for(let k=0;k<12;k++)sh+='<path class="yv-sh" data-k="'+k+'" d="M-6,-3 L5,-5 L7,3 L-4,5 Z" fill="url(#yPlate)" opacity="0"/>';
 return '<g class="yv" data-i="'+i+'">'+
  '<ellipse class="yv-halo" rx="1" ry="1" fill="url(#yHalo)" opacity="0"/>'+rp+
  
  '<g class="yv-pos"><g clip-path="url(#yAbove)"><g class="yv-in"><g class="yv-sh2">'+ventBody()+'</g></g></g>'+
   '<ellipse class="yv-foam" cy="2" rx="150" ry="7" fill="url(#ySteam)" opacity="0"/>'+
   '<circle class="yv-glow" cy="-120" r="70" fill="url(#yHalo)" opacity="0"/>'+st+sm+lf+sh+
   '<circle class="yv-flash" cy="-118" r="1" fill="url(#yFlash)" opacity="0"/></g>'+
  drops('yv-dr'+i,26,40+i*7,'#f4e4c0')+'</g>';
}
function ventsMarkup(){return [0,1,2].map(ventMarkup).join('');}
function rangeOf(i){const v=VENTS[i];return v;}
// 열수공 i의 중심부(세계 좌표)
function coreAt(i,rise){const v=VENTS[i];return [v.x,v.y+(1-rise)*150*v.s-118*v.s];}
/* 칠하기: o={rise, open, shiver, broken, brokeAt, hitAt, bounceAt, active} */
function paintVent(el,i,t,o){
 const g=el.querySelector('.yv[data-i="'+i+'"]');if(!g)return;
 const v=VENTS[i],s=v.s,rise=clamp(o.rise||0),open=clamp(o.open||0),br=!!o.broken;
 const sx=o.shiver?Math.sin(t*61+i)*1.6*o.shiver:0;
 const pos=g.querySelector('.yv-pos');pos.setAttribute('transform','translate('+n1(v.x+sx)+' '+n1(v.y)+') scale('+n3(s)+')');
 const inn=g.querySelector('.yv-in');inn.setAttribute('transform','translate(0 '+n1((1-rise)*150)+')');
 const body=g.querySelector('.yv-sh2');
 const since=o.brokeAt!=null?t-o.brokeAt:-1;
 // 부리 덮개: 열리면 바깥으로 젖혀짐
 const ang=open*68+(o.bounceAt!=null?6*Math.exp(-(t-o.bounceAt)*8)*Math.sin((t-o.bounceAt)*50):0);
 g.querySelector('.yv-bL').setAttribute('transform','rotate('+n1(-ang)+' -27 -116)'+(br?' translate(-9999 0)':''));
 g.querySelector('.yv-bR').setAttribute('transform','rotate('+n1(ang)+' 27 -116)'+(br?' translate(-9999 0)':''));
 const core=g.querySelector('.yv-core');core.setAttribute('opacity',br?'0':n3(Math.max(open,o.shiver?.25*o.shiver:0)*(.85+.15*Math.sin(t*13))));
 // 원뿔 윗부분은 깨지면 사라지고 그루터기만
 g.querySelector('.yv-stump').setAttribute('opacity',br?'1':'0');
 const cn=g.querySelector('.yv-cone');if(cn._br!==br){cn._br=br;cn.style.display=br?'none':'';}
 const em=g.querySelector('.yv-ember');if(em)em.setAttribute('opacity',n3(br?.4+.4*Math.sin(t*5+i)*Math.exp(-Math.max(0,since)*.15):0));
 // 물 위: 빛무리 · 물결 · 거품
 const halo=g.querySelector('.yv-halo');halo.setAttribute('cx',n1(v.x));halo.setAttribute('cy',n1(v.y+2));halo.setAttribute('rx',n1(200*s*(.6+.4*open)));halo.setAttribute('ry',n1(26*s));
 halo.setAttribute('opacity',n3(br?0:(o.active?.25:0)+.6*open+.2*rise*(1-open)));
 g.querySelectorAll('.yv-rp').forEach(e=>{const k=+e.dataset.k,a=((t*.5+k/3)%1),amp=rise>.02?.4+.6*(o.active?1:0):0;
  e.setAttribute('cx',n1(v.x));e.setAttribute('cy',n1(v.y+3));e.setAttribute('rx',n1((150+a*160)*s));e.setAttribute('ry',n1((8+a*14)*s));e.setAttribute('opacity',n3(amp*(1-a)*.8));});
 const foam=g.querySelector('.yv-foam');foam.setAttribute('opacity',n3(rise>.02&&rise<.98&&!br?.35*hump(rise):0));
 const glow=g.querySelector('.yv-glow');glow.setAttribute('cy',n1((1-rise)*150-120));glow.setAttribute('r',n1(50+50*open));glow.setAttribute('opacity',n3(br?0:.9*open+(o.shiver?.3*o.shiver:0)));
 // 열린 중심부에서 피어오르는 황금빛 김
 g.querySelectorAll('.yv-st').forEach(e=>{const k=+e.dataset.k,a=((t*.55+k/7)%1),on=br?0:Math.max(open,(o.shiver||0)*.5)*(rise>.9?1:0);
  e.setAttribute('cx',n1(Math.sin(k*2.3+t*.8)*10*a));e.setAttribute('cy',n1((1-rise)*150-122-a*120));e.setAttribute('rx',n1(12+a*40));e.setAttribute('ry',n1(8+a*26));e.setAttribute('opacity',n3(on*(1-a)*.9));});
 // 깨진 뒤의 연기
 g.querySelectorAll('.yv-sm').forEach(e=>{const k=+e.dataset.k,a=((t*.3+k/5)%1),on=br?.8:0;
  e.setAttribute('cx',n1(Math.sin(k*1.7+t*.4)*16*a+10*a));e.setAttribute('cy',n1((1-rise)*150-60-a*150));e.setAttribute('rx',n1(16+a*50));e.setAttribute('ry',n1(10+a*30));e.setAttribute('opacity',n3(on*(1-a)*.85));});
 // 빨려 드는 생명: 둘레 물에서 희미한 빛 알갱이가 감겨 들어감
 g.querySelectorAll('.yv-lf').forEach(e=>{const k=+e.dataset.k,a=((t*.4+k*.137)%1),on=!br&&o.active&&rise>.6?1:0;
  const ang0=k*2.4+t*.2,rr=(1-a)*170,cy=(1-rise)*150-118,px=Math.cos(ang0+a*4)*rr,py=lerp(4,cy,a*a)+Math.sin(ang0+a*4)*rr*.2*(1-a);
  e.setAttribute('cx',n1(px));e.setAttribute('cy',n1(py));e.setAttribute('r',n1(1.6+2*(1-a)));e.setAttribute('opacity',n3(on*Math.sin(a*Math.PI)*.85));});
 // 깨질 때: 섬광 · 껍데기 조각
 const fl=g.querySelector('.yv-flash');
 if(since>=0&&since<1.4){fl.setAttribute('r',n1(20+260*outC(seg(since,0,.5))));fl.setAttribute('cy',n1((1-rise)*150-118));fl.setAttribute('opacity',n3(1-seg(since,.2,1.4)));}else fl.setAttribute('opacity','0');
 g.querySelectorAll('.yv-sh').forEach(e=>{const k=+e.dataset.k;if(since<0||since>2.2){e.setAttribute('opacity','0');return;}
  const a=k/12*TAU+.3*Math.sin(k*3.1),v0=180+90*((k*.37)%1),x=Math.cos(a)*v0*since,y=(1-rise)*150-110-Math.abs(Math.sin(a))*v0*since*1.2+300*since*since;
  e.setAttribute('transform','translate('+n1(x)+' '+n1(y)+') rotate('+n1(since*600+k*40)+') scale('+n3(1.2+((k*.53)%1)*1.6)+')');e.setAttribute('opacity',n3(y<0?1-since/2.2:0));});
 // 솟을 때 흘러내리는 물
 if(!paintVent._d)paintVent._d=dropParams(26,40,-160,-20,90,260);
 paintDrops(g.querySelectorAll('.yv-dr'+i+' circle'),paintVent._d,v.x,v.y-60*s*rise,o.riseAt!=null?t-o.riseAt-.5:-1,60*s,380);
}
/* 물길: 삼각형 한가운데로 감겨 드는 흐름 · 가라앉는 구덩이 */
function paintSea(el,t,k,opt){
 const {q,qa}=cacheQ(el),o=opt||{};
 qa('.y-gl').forEach(e=>{const p=glints()[+e.dataset.i];e.setAttribute('opacity',n3(p.o*(.25+.75*Math.max(0,Math.sin(t*1.2+p.ph)))*.5));
  const dx=(C[0]-p.x),dy=(C[1]-p.y),d=Math.hypot(dx,dy*3)+1,pull=k*Math.min(1,160/d)*8;e.setAttribute('transform','translate('+n1(dx/d*pull)+' 0)');});
 const pit=q('.y-pit');pit.setAttribute('rx',n1(40+190*k));pit.setAttribute('ry',n1(10+46*k));pit.setAttribute('opacity',n3(.15+.85*k));
 qa('.y-sp').forEach(e=>{const i=+e.dataset.i,ph=i/16*TAU,rot=t*(.25+.9*k)+ph;
  let d='';const R0=60+((i*37)%120),turns=1.1;
  for(let j=0;j<=44;j++){const u=j/44,a=rot+u*turns*TAU,r=R0*(1-u*.85)*(1+.4*k)+20;const x=C[0]+Math.cos(a)*r*1.9,y=C[1]+Math.sin(a)*r*.42;d+=(j?' L':'M')+n1(x)+','+n1(y);}
  e.setAttribute('d',d);e.setAttribute('stroke-width',n1(2.6+((i*13)%5)*1.2));e.setAttribute('opacity',n3((.035+.15*k)*(.5+.5*Math.sin(t*1.7+i))));});
 const under=q('.y-under');if(under)under.setAttribute('opacity',n3(o.under==null?1:o.under));
 const ca=q('.y-caust');if(ca)ca.setAttribute('transform','translate('+n1(Math.sin(t*.3)*14)+' 0)');
 // 잔해: 물길을 따라 돌며 가운데로 끌려가 가라앉음
 qa('.y-db').forEach(e=>{const i=+e.dataset.i,per=14-i*.8,a=((t/per+i*.143)%1),ang=i*1.7+a*(2+k*2)*TAU*.5,rr=(1-a)*(300-i*14),x=C[0]+Math.cos(ang)*rr*1.3,y=C[1]+Math.sin(ang)*rr*.3;
  const sink=seg(a,.75,1);e.setAttribute('transform','translate('+n1(x)+' '+n1(y+sink*6)+') rotate('+n1(ang/RAD*.3+i*40)+') scale('+n3((.6+.5*(y-SEA)/150)*(1-.5*sink))+')');e.setAttribute('opacity',n3(Math.min(1,a*6)*(1-sink)*(o.debris==null?1:o.debris)));});
}
function ambientY(el,t){}

/* ---------- 작살(특수 작살이면 발사대, 없으면 손) ---------- */
function harpoonMarkup(){return '<path class="bw-rope" fill="none" stroke="#8a7a5a" stroke-opacity=".8" stroke-width="1.5" opacity="0"/><g class="bw-harpoon" opacity="0">'+HARPOON+'</g>'+(HL()?HL().hitMarkup():'');}
/* sh={at,to,bounce,hit,arrive} */
function paintHarpoon(el,t,tw,sh,aimTo){
 const {q}=cacheQ(el),L=HL(),own=!!(L&&L.owned());
 const thrown=!!(sh&&t>=sh.at),reelAt=sh?sh.reelAt:null,reelDur=sh&&sh.reelDur||1;
 const reelDone=!!(thrown&&reelAt!=null&&t>=reelAt+reelDur);
 const out=thrown&&!reelDone;
 const aimT=sh&&out?sh.to:aimTo,aim=own&&L&&aimT?L.smoothAim(el,'yw',L.aimAt(tw,aimT),t):own&&L?L.smoothAim(el,'yw',L.ANGLE,t):undefined;
 const hand=own?L.handFor(L.launch(el,tw,{loaded:!out,aim}),30,-14):tw(out?[38,-24]:[33,-31]);
 const hp=q('.bw-harpoon'),rope=q('.bw-rope');
 let pos=null,ang=-30,show=0;
 if(!out){if(!own){pos=[hand[0]+20,hand[1]-14];show=1;}if(L)L.paintHit(el,{s:-1,p:[0,0],ang:0,tier:0,through:70});}
 else{
  if(!sh._p0)sh._p0=[hand[0]+30,hand[1]-14];   // 쏜 순간의 발사구
  const p0=sh._p0,tg=sh.to,arr=sh.arrive;
  if(t<arr){const F=L?L.flight(p0,tg,(t-sh.at)/(arr-sh.at)):{pos:tg,ang:0};pos=F.pos;ang=F.ang;show=1;}
  else{const s=t-arr,ea=(L?L.flight(p0,tg,1).ang:0)*RAD;
   if(sh.hit){ang=ea/RAD;pos=[tg[0]+Math.cos(ea)*6,tg[1]+Math.sin(ea)*6];show=1;}
   else{const dir=ea+Math.PI*.8,s2=Math.min(s,.42);pos=[tg[0]+Math.cos(dir)*s2*300,Math.min(SEA+10,tg[1]+Math.sin(dir)*s2*300+380*s2*s2)];ang=dir/RAD+s2*520;show=1;}}   // 튕겨 나가 물에 떨어짐
  const home=own?L.slideHome(tw,aim):{pos:[hand[0]+20,hand[1]-14],ang:-30};
  const RP=L?L.reelPose(el,'yw',t,reelAt,reelDur,{pos,ang},home):null;
  if(RP){pos=RP.pos;ang=RP.ang;show=RP.show;}
  if(L)L.paintHit(el,{s:sh.hit&&t>=arr?t-arr:-1,p:tg,ang,tier:L.pierce?L.pierce().n:0,through:70});
 }
 hp.setAttribute('opacity',n3(show));if(pos)hp.setAttribute('transform','translate('+n1(pos[0])+' '+n1(pos[1])+') rotate('+n1(ang)+')');
 if(out&&pos&&show){const ar=ang*RAD,tail=[pos[0]-104*Math.cos(ar),pos[1]-104*Math.sin(ar)],an=tw(own&&L?L.anchorLocal(aim):[40,-9]);
  const reeling=reelAt!=null&&t>=reelAt;
  void 0;rope.setAttribute('d','M'+n1(an[0])+','+n1(an[1])+' Q'+n1((an[0]+tail[0])/2)+','+n1((an[1]+tail[1])/2+(reeling?4:t<sh.arrive?30:16))+' '+n1(tail[0])+','+n1(tail[1]));rope.setAttribute('opacity','.85');}
 else rope.setAttribute('opacity','0');
}
/* ---------- 배 ---------- */
function bob(t){return {y:Math.sin(t*1.4)*2+Math.sin(t*.6)*1.4,r:Math.sin(t*1.1+.6)*2.6};}
function boatY(el,t,k,sinkAt){
 const B=bob(t);let x=BOATX+k*90,y=SEA+B.y,r=B.r-k*6;
 if(sinkAt!=null){const s=clamp((t-sinkAt)/2.4),e=inC(s);x=lerp(x,C[0]-30,outC(s));y+=e*60+outC(s)*(C[1]-SEA)*.4;r+=s*40*Math.sin(t*3);}
 const tw=boatPose(el,x,y,r,[37,-30]);lamp(el,t,tw,0);return tw;
}
/* ---------- HUD ---------- */
function hudMarkup(){return '<div class="ywg-hud" aria-hidden="true"><span class="ywg-hint"></span><span class="ywg-verdict"></span><span class="ywg-count"></span><span class="ywg-suck"><i></i><b></b></span>'+
 '<span class="yt-mash"><i></i><b></b><u></u></span>'+
 '<span class="yt-fish"><span class="yf-track"><i class="yf-bar"></i><em class="yf-icon"><svg viewBox=\"-60 -12 70 24\"><path d=\"M-56,0 L-6,0\" stroke=\"#15191b\" stroke-width=\"3.4\" stroke-linecap=\"round\"/><path d=\"M3,0 L-12,-6 L-8,0 L-12,6 Z\" fill=\"#eef2f0\"/><ellipse cx=\"-14\" rx=\"3\" ry=\"7\" fill=\"none\" stroke=\"#ffe2a0\" stroke-width=\"1.6\"/><ellipse cx=\"-22\" rx=\"3\" ry=\"7\" fill=\"none\" stroke=\"#ffe2a0\" stroke-width=\"1.6\"/></svg></em></span><span class="yf-prog"><i></i></span></span>'+
 '<span class="yt-arr"></span></div>'+
 '<span class="ywg-dpad"><button type="button" data-ydir="up">▲</button><button type="button" data-ydir="left">◀</button><button type="button" data-ydir="right">▶</button><button type="button" data-ydir="down">▼</button></span>';}
function hud(el){const {q}=cacheQ(el);return {hint:q('.ywg-hint'),verdict:q('.ywg-verdict'),count:q('.ywg-count'),suck:q('.ywg-suck')};}
function setTxt(n,t){if(n&&n.textContent!==t)n.textContent=t;}
function setVerdict(n,t,cls){if(!n)return;setTxt(n,t);const c='ywg-verdict'+(t?' on '+(cls||''):'');if(n.className!==c)n.className=c;}
function hudSuck(u,k){if(!u.suck)return;u.suck.firstChild.style.width=n1(clamp(k)*100)+'%';setTxt(u.suck.lastChild,'흡입 위험 '+Math.round(clamp(k)*100)+'%');u.suck.classList.toggle('hot',k>.7);}

/* ---------- 열수공 미니게임 화면 ---------- */
const CAP=['','황금빛 중심부가 열리는 순간 그 열수공에 작살을 꽂으십시오. 너무 일찍 쏘면 껍데기에 튕깁니다.','두 번째 열수공입니다. 남은 것이 적을수록 중심부가 열려 있는 시간이 짧아집니다.','마지막 열수공입니다. 중심부는 아주 잠깐만 열립니다.','부서진 열수공의 따개비 껍데기가 물길을 따라 가라앉습니다. 건져 올리십시오.'];
function ventBuild(){return '<g class="y-sky">'+skyMarkup()+'</g>'+seaMarkup()+debrisMarkup()+boatMarkup()+ventsMarkup()+harpoonMarkup()+'<circle class="yw-ring" r="1" fill="url(#yRing)" opacity="0"/>';}
// g: {cyc:{i,start,openAt,openEnd,closeEnd,end}, broken:[], brokeAt:[], suck, shot, sinkAt, bounceAt}
function ventState(g,i,t){
 const br=g.broken&&g.broken[i],o={broken:br,brokeAt:g.brokeAt?g.brokeAt[i]:null,active:false,rise:0,open:0,shiver:0};
 if(br){const s=o.brokeAt!=null?t-o.brokeAt:9;o.rise=lerp(1,.8,outC(seg(s,.6,2.4)))*(g.sinkAll!=null?1-inOut(seg(t,g.sinkAll,g.sinkAll+4)):1);return o;}
 if(g.hold&&g.hold.i===i){o.active=true;o.rise=1;o.open=1;const k=g.tugKick!=null?Math.exp(-(t-g.tugKick)*6):0;o.shiver=.6+1.2*k;return o;}   // 작살이 박힌 채 버팀
 if(g.sinkVent&&g.sinkVent.i===i&&t<g.sinkVent.at+1.4){o.rise=1-inOut(seg(t,g.sinkVent.at,g.sinkVent.at+1.2));o.open=1-seg(t,g.sinkVent.at,g.sinkVent.at+.3);return o;}
 const c=g.cyc;if(!c||c.i!==i){o.rise=0;return o;}
 o.active=true;o.riseAt=c.start;
 o.rise=t<c.start?0:t<c.start+1.3?outC((t-c.start)/1.3):t<c.closeEnd?1:1-inOut(seg(t,c.closeEnd,c.end));
 const hold=g.shot&&g.shot.hit&&g.shot.i===i;
 o.open=hold?1:t<c.openAt?0:t<c.openAt+.14?(t-c.openAt)/.14:t<c.openEnd?1:t<c.closeEnd?1-(t-c.openEnd)/(c.closeEnd-c.openEnd):0;
 o.shiver=t>c.openAt-.7&&t<c.openAt?seg(t,c.openAt-.7,c.openAt):0;
 if(g.shot&&g.shot.i===i&&!g.shot.hit)o.bounceAt=g.shot.arrive;
 return o;
}
function ventScene(el,t,g){
 const k=clamp((g.suck||0)/100);
 paintSea(el,t,.15+.85*k,{debris:1});
 const tw=boatY(el,t,k,g.sinkAt);
 [0,1,2].forEach(i=>paintVent(el,i,t,ventState(g,i,t)));
 paintHarpoon(el,t,tw,g.shot,g.cyc&&!(g.broken&&g.broken[g.cyc.i])?coreAt(g.cyc.i,1):null);
 // 다음에 쏠 순간을 알려 주는 고리: 덮개가 떨릴 때부터 좁혀 와 열리는 순간 닿음
 const ring=cacheQ(el).q('.yw-ring'),c=g.cyc;
 if(ring){if(c&&!(g.shot&&g.shot.at>=c.start)&&t>c.openAt-.9&&t<c.openEnd&&!(g.broken&&g.broken[c.i])){const v=VENTS[c.i],kk=Math.max(0,(c.openAt-t)/.9),p=coreAt(c.i,1);
   ring.setAttribute('cx',n1(p[0]));ring.setAttribute('cy',n1(p[1]));ring.setAttribute('r',n1((22+150*kk)*v.s));ring.setAttribute('opacity',n3(t<c.openAt?.9:.5+.4*Math.sin(t*20)));}
  else ring.setAttribute('opacity','0');}
 return tw;
}
function ventGame(el,t,tr,g){
 ventScene(el,t,g);
 const u=hud(el),f=g.flash&&t-g.flash.at<1.1?g.flash:null;
 setVerdict(u.verdict,f?f.text:'',f&&f.good?'good':'bad');
 const c=g.cyc,open=c&&t>=c.openAt&&t<c.openEnd;
 setTxt(u.hint,g.done?'':g.tug&&!g.tug.done?({mash:'연타! 작살을 잡아당겨 열수공을 뜯어내십시오',fish:'누르고 있기 · 작살 표식을 달빛 막대 안에',arrows:'화살표를 차례대로 입력'})[g.tug.kind]:!c||t<c.start+.6?'열수공이 섬처럼 솟기를 기다리십시오':open?'지금 · 솟은 열수공을 누르십시오':t<c.openAt?'솟은 열수공의 덮개가 떨립니다 · 아직입니다':'덮개가 닫힙니다');
 if(u.hint)u.hint.classList.toggle('now',!!open&&!g.shot);
 setTxt(u.count,'부순 열수공 '+(g.broken?g.broken.filter(Boolean).length:0)+' / 3');
 hudSuck(u,(g.suck||0)/100);
 paintTug(el,t,g);
 caption(el,[[0,CAP[g.stageNo||1]]],0);
 veil(el,t<.5?1-t/.5:0);
}
/* 뜯어내기 표시: 연타 게이지 · 달빛 막대(낚시) · 화살표 여덟 개 */
const ARW={up:'▲',down:'▼',left:'◀',right:'▶'};
function paintTug(el,t,g){
 const {q}=cacheQ(el),T=g.tug,kind=T&&!T.done?T.kind:'';
 if(el.dataset.tug!==kind)el.dataset.tug=kind;
 if(kind==='mash'){const m=q('.yt-mash');m.querySelector('i').style.height=n1(T.v)+'%';m.querySelector('b').textContent='연타! '+(T.round+1)+' / 2';
  m.querySelector('u').style.width=n1(100*clamp((T.deadline-t)/6.5))+'%';}
 if(kind==='fish'){const f=q('.yt-fish');f.querySelector('.yf-bar').style.bottom=n1(T.bar*100)+'%';f.querySelector('.yf-icon').style.bottom=n1(T.icon*100)+'%';
  f.querySelector('.yf-bar').classList.toggle('on',!!T.inBar);f.querySelector('.yf-prog i').style.height=n1(T.prog*100)+'%';f.querySelector('.yf-prog').classList.toggle('low',T.prog<.25);}
 if(kind==='arrows'){const a=q('.yt-arr'),key=T.seq.join(',')+'|'+T.idx+'|'+T.cycle+'|'+(T.err&&t-T.err.at<.5?1:0);
  if(a.dataset.k!==key){a.dataset.k=key;a.innerHTML='<b>'+(T.cycle+1)+' / 2 바퀴</b>'+T.seq.map((d,i)=>'<span class="'+(i<T.idx?'ok':i===T.idx?'now':'')+(T.err&&t-T.err.at<.5&&i===T.err.i?' bad':'')+'">'+ARW[d]+'</span>').join('');}
  a.style.setProperty('--tl',n1(100*clamp((T.deadline-t)/9))+'%');}
}
/* ---------- 5단계 · 따개비 껍데기 건지기 ---------- */
function shellBody(){
 return '<path d="M-26,8 C-28,-6 -20,-22 -6,-28 C4,-30 18,-26 24,-14 C30,-2 28,8 20,12 C8,16 -14,16 -26,8 Z" fill="url(#yPlate)"/>'+
  '<path d="M-20,6 C-20,-6 -12,-18 -2,-22 M-8,10 C-6,-4 2,-16 12,-20 M6,12 C8,0 14,-10 22,-12" stroke="#3a220a" stroke-width="1.2" stroke-opacity=".6" fill="none"/>'+
  '<path d="M-22,-4 Q0,-14 24,-6 M-24,4 Q0,-4 27,2" stroke="#fff0c0" stroke-width=".9" stroke-opacity=".3" fill="none"/>'+
  '<path d="M-26,8 C-14,16 8,16 20,12" stroke="#2a1806" stroke-width="2" fill="none" stroke-opacity=".6"/>';
}
function hookBody(){return '<path d="M0,-14 L0,6" stroke="#2a2a2a" stroke-width="2.2"/><path d="M0,6 Q-10,8 -11,-2 M0,6 Q10,8 11,-2 M0,6 Q0,12 3,13" stroke="#3a3a3a" stroke-width="2" fill="none" stroke-linecap="round"/><circle cy="-14" r="2" fill="none" stroke="#3a3a3a" stroke-width="1.2"/>';}
function hookBuild(){
 return '<g class="y-sky">'+skyMarkup()+'</g>'+seaMarkup()+debrisMarkup()+boatMarkup()+ventsMarkup()+harpoonMarkup()+
  '<g class="y-shell"><ellipse class="ys-rp" rx="1" ry="1" fill="url(#yRipple)" opacity="0"/><g class="ys-b">'+shellBody()+'</g><rect class="ys-wet" x="-40" y="-40" width="80" height="80" fill="#2a2008" opacity="0"/></g>'+
  '<path class="yh-rope" fill="none" stroke="#9a8a6a" stroke-width="1.4" opacity="0"/><g class="yh-hook" opacity="0">'+hookBody()+'</g>'+(window.HarpoonTether?HarpoonTether.markup():'')+
  drops('yh-sp',22,77,'#f4e4c0')+'<circle class="yh-aim" r="1" fill="url(#yRing)" opacity="0"/>';
}
// 껍데기 위치: 물길을 따라 돌며 가라앉음(depth 0→1)
function shellAt(g,t){
 const s=g.shell;if(!s)return null;
 const a=Math.max(0,t-s.t0),d=clamp(a/s.dur),ang=s.a0+a*s.w,rr=s.r0*(1-.55*d);
 return {x:C[0]+Math.cos(ang)*rr*1.7,y:C[1]+Math.sin(ang)*rr*.45+d*8,d,ang};
}
function hookGame(el,t,tr,g){
 const {q}=cacheQ(el);
 paintSea(el,t,.25,{debris:.6,under:.6});
 const tw=boatY(el,t,.1,null);
 [0,1,2].forEach(i=>paintVent(el,i,t,{broken:true,brokeAt:-9,rise:.8-.25*inOut(seg(t,0,10))}));
 let p=shellAt(g,t);
 const caught=g.caught,th=g.throw;
 // 작살: 장전된 망 감긴 작살을 껍데기가 갈 자리로 발사 → 꽂히면 껍데기째 감아 올림 / 빗나가면 물에서 감아 들여 다시 장전
 const HT=window.HarpoonTether;let R=null;
 if(HT){const spec=th?{fireAt:th.at,endAt:caught?caught.at+.15:th.arrive+.3,free:!caught,breakDur:.35,reelDur:caught?1.3:.9}:null;
  R=HT.paint(el,t,spec,tw,caught?caught.p:th?th.to:null,{color:'#e8c070',water:!caught,sway:.4});}
 if(caught){const T=HT?HT.times({fireAt:th.at,endAt:caught.at+.15,breakDur:.35,reelDur:1.3}):null,an=tw([44,-30]);
  if(T&&t>=T.reelEnd)p={x:an[0],y:an[1]+8,d:0,aboard:true};
  else if(R&&R.pos&&T&&t>=T.reelAt){const ar=R.ang*RAD;p={x:R.pos[0]-Math.cos(ar)*8,y:R.pos[1]-Math.sin(ar)*8+6,d:0};}
  else p={x:caught.p[0],y:caught.p[1],d:caught.d};}
 const sh=q('.y-shell'),b=q('.ys-b'),wet=q('.ys-wet'),rp=q('.ys-rp');
 if(p){const sc=p.aboard?.6:.7+.5*(p.y-SEA)/150,sub=clamp(p.d*1.15);
  b.setAttribute('transform','translate('+n1(p.x)+' '+n1(p.y+sub*10)+') rotate('+n1(Math.sin(t*1.3)*10+(caught?20:0))+') scale('+n3(sc*(1-.3*sub))+')');
  b.setAttribute('opacity',n3(1-.75*sub));
  rp.setAttribute('cx',n1(p.x));rp.setAttribute('cy',n1(p.y+4));const a=(t*.6)%1;rp.setAttribute('rx',n1((30+a*50)*sc));rp.setAttribute('ry',n1((5+a*7)*sc));rp.setAttribute('opacity',n3((1-a)*.7*(caught?0:1)));
  wet.setAttribute('opacity','0');sh.setAttribute('opacity','1');}
 else sh.setAttribute('opacity','0');
 q('.yh-hook').setAttribute('opacity','0');q('.yh-rope').setAttribute('opacity','0');
 if(!hookGame._sp)hookGame._sp=dropParams(22,77,-160,-20,60,170);
 paintDrops(el.querySelectorAll('.yh-sp circle'),hookGame._sp,th?th.to[0]:0,th?Math.min(th.to[1],SEA+2):0,th&&!caught?t-th.arrive:-1,10,380);
 const aim=q('.yh-aim');
 if(th&&t<th.arrive){aim.setAttribute('cx',n1(th.to[0]));aim.setAttribute('cy',n1(th.to[1]));aim.setAttribute('r',n1(14+10*Math.sin(t*12)));aim.setAttribute('opacity','.8');}else aim.setAttribute('opacity','0');
 const u=hud(el),f=g.flash&&t-g.flash.at<1.1?g.flash:null;
 setVerdict(u.verdict,f?f.text:'',f&&f.good?'good':'bad');
 setTxt(u.hint,g.done||caught?'':'껍데기가 갈 자리를 눌러 작살을 쏘십시오 · 작살은 조금 늦게 닿습니다');
 if(u.hint)u.hint.classList.toggle('now',!!(p&&!caught&&!th));
 setTxt(u.count,p&&!caught?'가라앉음 '+Math.round(clamp(p.d)*100)+'%':'');
 hudSuck(u,0);
 caption(el,[[0,CAP[4]]],0);
 veil(el,t<.5?1-t/.5:0);
}

/* =================== 장면(게임이 아닐 때 · 반복) =================== */
function demoVent(t,i,stageNo,broken){
 const start=1,openAt=start+2.1,len=[1.1,.8,.55][stageNo-1]||1;
 const g={cyc:{i,start,openAt,openEnd:openAt+len,closeEnd:openAt+len+.35,end:openAt+len+1.6},broken:broken.slice(),brokeAt:broken.map(b=>b?-9:null),suck:22+stageNo*12,stageNo};
 if(t>openAt+.2){g.shot={at:openAt+.15,i,to:coreAt(i,1),arrive:openAt+.6,hit:true,reelAt:openAt+1.5,reelDur:1.05};}
 if(t>openAt+.6){g.broken[i]=true;g.brokeAt[i]=openAt+.6;g.cyc=null;}
 return g;
}
const S0={title:'가라앉는 삼각형',loop:11,
 caps:[[0,'물빛이 누렇게 무겁습니다. 떠다니던 것들이 한쪽으로 끌려갑니다.'],[2.6,'물밑에 황토빛 등껍질이 비칩니다. 황금빛 점 셋이 삼각형을 이룹니다.'],[5.4,'그 하나가 섬처럼 솟습니다. 따개비 같은 열수공입니다.'],[8.2,'삼각형 안쪽으로 들어간 것은 무엇이든 가라앉습니다.']],
 build(){return '<g class="y-sky">'+skyMarkup()+'</g>'+seaMarkup()+debrisMarkup()+boatMarkup()+ventsMarkup()+harpoonMarkup()+'<circle class="yw-ring" r="1" fill="url(#yRing)" opacity="0"/>';},
 paint(el,t,tr){
  const g={cyc:{i:0,start:5,openAt:7,openEnd:8.2,closeEnd:8.6,end:10.2},broken:[false,false,false],suck:15+20*seg(t,0,9)};
  ventScene(el,t,g);
  caption(el,S0.caps,t);veil(el,tr<.6?1-tr/.6:.3*(t<.6?1-t/.6:seg(t,10.4,11)));
 }};
function ventDemoScene(no,title,caps,i,broken){
 return {title,loop:7,caps,build:ventBuild,
  paint(el,t,tr){const g=demoVent(t,i,no,broken);ventScene(el,t,g);caption(el,caps,t);veil(el,tr<.6?1-tr/.6:.3*(t<.6?1-t/.6:seg(t,6.4,7)));}};
}
const S1=ventDemoScene(1,'첫 번째 열수공',[[0,'열수공이 섬처럼 솟습니다. 덮개가 떨립니다.'],[3,'황금빛 중심부가 열리는 순간 작살을 꽂습니다.']],1,[false,false,false]);
const S2=ventDemoScene(2,'두 번째 열수공',[[0,'남은 열수공이 솟습니다.'],[3,'남은 것이 적을수록 중심부는 짧게 열립니다.']],2,[false,true,false]);
const S3=ventDemoScene(3,'세 번째 열수공',[[0,'마지막 열수공이 솟습니다.'],[3,'중심부는 아주 잠깐만 열립니다.']],0,[false,true,true]);
const S4={title:'따개비 껍데기',loop:8,
 caps:[[0,'부서진 열수공의 따개비 껍데기가 물길을 따라 가라앉습니다.'],[3,'작살을 꽂아 껍데기를 건져 올립니다.']],
 build:hookBuild,
 paint(el,t,tr){const g={shell:{t0:0,dur:9,a0:.5,w:.5,r0:120}};if(t>2.6){const p=shellAt(g,3.05);g.throw={at:2.6,arrive:3.05,to:[p.x,p.y]};}
  if(t>3.05){const p=shellAt(g,3.05);g.caught={at:3.05,p:[p.x,p.y],d:p.d};}
  hookGame(el,t,tr,g);caption(el,S4.caps,t);veil(el,tr<.6?1-tr/.6:.3*(t<.6?1-t/.6:seg(t,7.4,8)));}};
// 성공 장면: 삼백 년(한 번 재생)
const S5={title:'삼백 년',dur:12,
 caps:[[0,'건져 올린 따개비 껍데기가 아직 따뜻합니다.'],[2.6,'부서진 열수공 셋이 차례로 물속으로 내려갑니다. 물길이 멈춥니다.'],[6,'황토빛 등껍질이 물밑에서 천천히 멀어집니다.'],[9,'그것은 삼백 년 동안 가라앉습니다.']],
 build(){return '<g class="y-sky">'+skyMarkup()+'</g>'+seaMarkup()+debrisMarkup()+boatMarkup()+ventsMarkup()+harpoonMarkup()+
  '<g class="y-shell"><g class="ys-b">'+shellBody()+'</g></g>';},
 paint(el,t,tr){
  const {q}=cacheQ(el);
  const calm=seg(t,2,8);
  paintSea(el,t,.3*(1-calm),{debris:1-calm,under:1-inOut(seg(t,5,10))});
  const tw=boatY(el,t,0,null);
  [0,1,2].forEach(i=>paintVent(el,i,t,{broken:true,brokeAt:-9,rise:.8*(1-inOut(seg(t,2.4+i*.8,5.4+i*.8)))}));
  paintHarpoon(el,t,tw,null);
  const an=tw([44,-30]),b=q('.ys-b');b.setAttribute('transform','translate('+n1(an[0]+4)+' '+n1(an[1]+10)+') rotate('+n1(20+Math.sin(t*1.4)*6)+') scale(.6)');
  caption(el,S5.caps,t);veil(el,tr<.6?1-tr/.6:0);
 }};
const SCENES=[S0,S1,S2,S3,S4,S5];
const GBUILD={1:ventBuild,2:ventBuild,3:ventBuild,4:hookBuild};
const GAMEPAINT={1:ventGame,2:ventGame,3:ventGame,4:hookGame};
const GAMEMODE={1:'vent',2:'vent',3:'vent',4:'hook'};
function html(stage,opts){
 const i=Math.max(0,Math.min(5,Math.floor(+stage||0))),S=SCENES[i],game=!!(opts&&opts.game&&GBUILD[i]);
 const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'+
  '<defs>'+commonDefs()+yDefs()+underMask()+'</defs>'+(game?GBUILD[i]():S.build())+
  '<rect class="bw-veil" width="'+W+'" height="'+H+'" fill="#000" opacity="1"/></svg>';
 const no=Math.min(5,i+1);
 return '<div class="pallid-cine-v2 yw3-scene'+(game?' ywg-on':'')+'" data-stage="'+i+'"'+(game?' data-game="1"':'')+' role="img" aria-label="'+esc(NAME+' · '+no+'단계 '+S.title)+'">'+svg+
  '<span class="cine-top" aria-hidden="true">'+esc(NAME+' · '+S.title)+'</span>'+
  '<span class="cine-bottom" aria-hidden="true">'+esc(game?CAP[i]:S.caps[0][1])+'</span>'+
  (game?hudMarkup():'')+
  '<span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}
const API=window.YellowWhaleV3={html,stages:SCENES.map(s=>s.title),replayToken:0,geo:{VENTS,C,coreAt,shellAt,BOATX}};
let start=0,lastSeen=0,seenTok=-1,seenStage=-1,seenGame=false;
function frame(now){
 const el=document.querySelector('.yw3-scene');
 if(el&&el.isConnected){
  const st=+el.dataset.stage,S=SCENES[st],g=window.YellowHuntGame;
  const isGame=!!(el.dataset.game&&g&&g.t0&&g.mode===GAMEMODE[st]);
  if(S&&isGame){
   const t=(now-g.t0)/1000;lastSeen=now;seenGame=true;seenStage=st;
   try{GAMEPAINT[st](el,t,t,g);}catch(e){if(!el._ywErr){el._ywErr=1;console.warn('노란 고래 미니게임',e);}}
  }else if(S){
   if(now-lastSeen>900||API.replayToken!==seenTok||st!==seenStage||seenGame){start=now;seenTok=API.replayToken;seenStage=st;seenGame=false;}
   if(el.closest('.is-paused'))start+=now-lastSeen;
   lastSeen=now;
   let tr=(now-start)/1000;
   if(el.dataset.seek!=null)tr=+el.dataset.seek;
   const t=S.loop?tr%S.loop:Math.min(tr,S.dur||tr);
   try{S.paint(el,t,tr);}catch(e){if(!el._ywErr){el._ywErr=1;console.warn('노란 고래 이펙트',e);}}
  }
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
