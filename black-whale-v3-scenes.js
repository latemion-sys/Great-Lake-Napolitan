/* 모든 것을 감싸안는 검은 고래 · v3 다섯 장면 + 미니게임 화면
   window.BlackWhaleV3 = {html(stage,opts), stages, replayToken, resume, geo}
   그것은 만타가오리의 모양을 한 '없음'이다. 몸은 한 번도 그려지지 않는다.
   보이는 것은 그것이 지나가며 지운 별과 달과 물빛, 그리고 가장 많이 드러나 봐야 물 위로 휘어 오른 날개 끝뿐이다.
   - 원근: 가까운 것은 크고 수평선 아래쪽에, 먼 것은 작고 수평선 가까이에 놓으며 물안개에 흐려진다.
   - 표현: 선이나 맨 도형 대신 그라데이션 면 · 피부 결(노이즈) · 젖은 윤기 · 흘러내리는 물 · 물보라 · 물결 · 떠다니는 빛 먼지를 겹친다.
   ① 별이 꺼지는 수평선 ② 닫히는 날개 ③ 꺼지는 별 ④ 감싸인 배 ⑤ 날개 끝(한 번 재생 후 멈춤)
   미니게임 화면: lamp(등불 덮기) · 1 gap(날개 사이의 틈) · 2 stars(별이 꺼지는 자리) · 3 pulse(어둠의 고동) · 4 final(날개 끝) */
(function(){
'use strict';
const K=window.BlueWhaleV3Kit;
if(!K)return;
const {W,H,SEA,clamp,outC,inC,inOut,seg,lerp,n1,n3,TAU,RAD,seeded,esc,commonDefs,sea,boatMarkup,cacheQ,ambient,boatPose,lamp,veil,caption,HARPOON,drops,dropParams,paintDrops,plumeMarkup,paintPlume}=K;
const NAME='모든 것을 감싸안는 검은 고래';
const MOON=[812,98];
const HL=()=>window.HarpoonLauncher;
const hump=x=>Math.sin(Math.PI*clamp(x));          // 0→1→0

/* ---------- 몸의 모양(그려지지 않고, 별을 지우는 구멍으로만 쓰임) ----------
   원점 = 몸 한가운데, 머리(두 머리지느러미)가 -y. 날개 끝 (±1020,110), 꼬리 +y */
const MANTA='M-70,-250 C-90,-330 -150,-322 -142,-252 C-420,-232 -820,-82 -1020,110 C-760,92 -420,172 -170,322 C-80,382 -20,520 0,900 C20,520 80,382 170,322 C420,172 760,92 1020,110 C820,-82 420,-232 142,-252 C150,-322 90,-330 70,-250 C40,-232 -40,-232 -70,-250 Z';
const TIP_L=[-1020,110];
/* 물 위로 휘어 오르는 날개 끝(옆모습, y=0이 수면). 앞전은 두툼하고 둥글게, 뒷전은 얇게 물결치며 끝이 안쪽으로 말림 */
const WING='M-230,20 C-226,-80 -186,-210 -104,-318 C-52,-386 26,-436 104,-448 C134,-452 150,-440 140,-428 C92,-410 46,-372 18,-318 C-4,-276 -14,-226 -10,-176 C-6,-136 -18,-104 -10,-70 C-2,-36 26,-6 60,20 Z';
const RIDGE='M-214,18 C-208,-80 -170,-204 -92,-306 C-44,-370 26,-418 96,-436 C30,-400 -40,-330 -86,-250 C-130,-170 -150,-80 -150,18 Z';   // 앞전을 따라 젖은 윤기(넓은 면)
const HEM='M60,20 C26,-6 -2,-36 -10,-70 C-18,-104 -6,-136 -10,-176 C-14,-226 -4,-276 18,-318 C2,-250 -22,-160 -14,-62 C-8,-20 18,6 34,20 Z';   // 말린 뒷전의 그늘(두께)
const WTIP=[136,-440],WHIT=[-70,-240];   // 날개 맨 끝 · 작살이 꽂히는 말린 자리

function bkDefs(){
 return ''+
 '<linearGradient id="bkSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#03050c"/><stop offset=".55" stop-color="#08101c"/><stop offset=".86" stop-color="#122030"/><stop offset="1" stop-color="#18293a"/></linearGradient>'+
 '<radialGradient id="bkMoonG"><stop stop-color="#eef4f6" stop-opacity=".6"/><stop offset=".16" stop-color="#cfdde4" stop-opacity=".2"/><stop offset="1" stop-color="#9fb4c0" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bkStar"><stop stop-color="#ffffff"/><stop offset=".35" stop-color="#e7f0ff" stop-opacity=".55"/><stop offset="1" stop-color="#dfe9ff" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="bkHazeH" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a8c2d2" stop-opacity="0"/><stop offset=".55" stop-color="#a8c2d2" stop-opacity=".2"/><stop offset="1" stop-color="#a8c2d2" stop-opacity="0"/></linearGradient>'+
 '<filter id="bkEdge" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>'+
 '<filter id="bkB3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>'+
 '<filter id="bkB8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>'+
 // 젖은 피부 결: 성긴 얼룩 + 가로로 흐르는 결
 '<filter id="bkSkin" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".018 .045" numOctaves="3" seed="13"/><feColorMatrix values="0 0 0 0 .62  0 0 0 0 .72  0 0 0 0 .84  0 0 0 1.5 -.62"/></filter>'+
 '<filter id="bkSkinD" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035 .028" numOctaves="2" seed="29"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.8 -.7"/></filter>'+
 '<clipPath id="bkWingClip"><path d="'+WING+'"/></clipPath>'+
 // 별과 달과 물빛을 지우는 구멍
 '<mask id="bkHole" maskUnits="userSpaceOnUse" x="-50" y="-50" width="'+(W+100)+'" height="'+(H+100)+'"><rect x="-50" y="-50" width="'+(W+100)+'" height="'+(H+100)+'" fill="#fff"/>'+
  '<path class="bk-holeP" d="'+MANTA+'" fill="#000" filter="url(#bkEdge)" transform="translate(-9999 0)"/></mask>'+
 '<mask id="bkHoleR" maskUnits="userSpaceOnUse" x="-50" y="'+(SEA-4)+'" width="'+(W+100)+'" height="'+(H-SEA+60)+'"><rect x="-50" y="'+(SEA-4)+'" width="'+(W+100)+'" height="'+(H-SEA+60)+'" fill="#fff"/>'+
  '<path class="bk-holeR" d="'+MANTA+'" fill="#000" filter="url(#bkEdge)" transform="translate(-9999 0)"/></mask>'+
 // 앞자락의 빛: 달빛 · 등불이 닿는 곳만 젖은 듯 빛남
 '<radialGradient id="bkRimG" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="300"><stop stop-color="#e6f0f8" stop-opacity=".95"/><stop offset=".4" stop-color="#9fb8cc" stop-opacity=".35"/><stop offset="1" stop-color="#9fb8cc" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bkRimG2" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="300"><stop stop-color="#ffe0a0" stop-opacity=".9"/><stop offset=".45" stop-color="#c89a5a" stop-opacity=".32"/><stop offset="1" stop-color="#c89a5a" stop-opacity="0"/></radialGradient>'+
 // 날개: 몸빛 · 앞전 윤기 · 등불빛 · 원근 물안개
 '<linearGradient id="bkWingG" x1="0" y1="0" x2="1" y2=".4"><stop stop-color="#16222f"/><stop offset=".3" stop-color="#0b111b"/><stop offset=".7" stop-color="#05080e"/><stop offset="1" stop-color="#010203"/></linearGradient>'+
 '<linearGradient id="bkWingV" x1="0" y1="0" x2="0" y2="1"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></linearGradient>'+
 '<clipPath id="bkWingCut"><rect x="-400" y="-640" width="800" height="644"/></clipPath>'+
 '<linearGradient id="bkRidgeG" x1="0" y1="1" x2=".6" y2="0"><stop stop-color="#9fb8d0" stop-opacity="0"/><stop offset=".4" stop-color="#b8cde0" stop-opacity=".22"/><stop offset=".8" stop-color="#dbe7f2" stop-opacity=".42"/><stop offset="1" stop-color="#dbe7f2" stop-opacity=".1"/></linearGradient>'+
 '<radialGradient id="bkWingL" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="260"><stop stop-color="#ffd890" stop-opacity=".62"/><stop offset=".45" stop-color="#b07a3a" stop-opacity=".2"/><stop offset="1" stop-color="#b07a3a" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="bkFogW" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2a3c50" stop-opacity=".2"/><stop offset=".7" stop-color="#3a5064" stop-opacity=".6"/><stop offset="1" stop-color="#4a6074" stop-opacity=".9"/></linearGradient>'+
 '<linearGradient id="bkSheet" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#cfe0ee" stop-opacity="0"/><stop offset=".45" stop-color="#cfe0ee" stop-opacity=".22"/><stop offset="1" stop-color="#cfe0ee" stop-opacity="0"/></linearGradient>'+
 '<radialGradient id="bkFoam"><stop stop-color="#e2eef6" stop-opacity=".5"/><stop offset=".5" stop-color="#b8cede" stop-opacity=".18"/><stop offset="1" stop-color="#b8cede" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bkRipple"><stop offset=".7" stop-color="#bcd2e2" stop-opacity="0"/><stop offset=".88" stop-color="#d6e6f2" stop-opacity=".35"/><stop offset="1" stop-color="#bcd2e2" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bkSwell"><stop stop-color="#000" stop-opacity=".55"/><stop offset=".7" stop-color="#02050a" stop-opacity=".25"/><stop offset="1" stop-color="#02050a" stop-opacity="0"/></radialGradient>'+
 // 감싸인 어둠: 등불 둘레만 남기고 덮음
 '<radialGradient id="bkDark" gradientUnits="userSpaceOnUse" cx="480" cy="300" r="200"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#01030a" stop-opacity=".18"/><stop offset=".82" stop-color="#01030a" stop-opacity=".72"/><stop offset="1" stop-color="#000" stop-opacity=".9"/></radialGradient>'+
 '<radialGradient id="bkPool" gradientUnits="userSpaceOnUse" cx="480" cy="340" r="160"><stop stop-color="#ffcf7a" stop-opacity=".34"/><stop offset=".5" stop-color="#c88a3a" stop-opacity=".1"/><stop offset="1" stop-color="#c88a3a" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bkPulse"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset=".86" stop-color="#03060c" stop-opacity=".85"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bkRing"><stop offset=".62" stop-color="#ffd98a" stop-opacity="0"/><stop offset=".84" stop-color="#ffeac0" stop-opacity=".7"/><stop offset=".92" stop-color="#fff7e2" stop-opacity=".95"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bkBeamG" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="420"><stop stop-color="#ffe2a0" stop-opacity=".45"/><stop offset=".6" stop-color="#ffcf7a" stop-opacity=".12"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bkGlow"><stop stop-color="#fff6dc"/><stop offset=".3" stop-color="#ffe2a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bkMote"><stop stop-color="#fff2d0" stop-opacity=".9"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="bkMembFade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
 '<mask id="bkMembMask" maskUnits="userSpaceOnUse" x="-60" y="-100" width="'+(W+120)+'" height="'+(SEA+60)+'"><rect x="-60" y="-100" width="'+(W+120)+'" height="'+(SEA+20)+'" fill="url(#bkMembFade)"/></mask>'+
 '<radialGradient id="bkMembrane"><stop stop-color="#3a5068" stop-opacity=".9"/><stop offset=".5" stop-color="#1e2c3c" stop-opacity=".55"/><stop offset="1" stop-color="#0a121c" stop-opacity="0"/></radialGradient>';
}

/* ---------- 밤: 별 · 달 · 물빛 (모두 '구멍'에 지워질 수 있음) ---------- */
let STARS=null;
function starData(){
 if(STARS)return STARS;
 const r=seeded(41),s=[];
 for(let i=0;i<280;i++){const y=Math.pow(r(),1.25)*(SEA-16),x=r()*W,b=r();s.push({x,y,r:.35+Math.pow(b,3)*1.5,o:.35+.65*r(),big:b>.93,tw:r()<.2,ph:r()*TAU});}
 return STARS=s;
}
function starsMarkup(){
 let a='',b='';
 starData().forEach((s,i)=>{
  if(s.big)b+='<circle cx="'+n1(s.x)+'" cy="'+n1(s.y)+'" r="'+n1(3.2+s.r*2)+'" fill="url(#bkStar)" opacity="'+n3(.5*s.o)+'"/>';
  a+='<circle'+(s.tw?' class="bk-tw" data-i="'+i+'"':'')+' cx="'+n1(s.x)+'" cy="'+n1(s.y)+'" r="'+n1(s.r)+'" fill="#eef4ff" opacity="'+n3(s.o)+'"/>';
 });
 return '<g class="bk-stars">'+b+a+'</g>';
}
function starRefMarkup(){
 let a='';
 starData().forEach(s=>{if(s.y<SEA-190)return;const dy=SEA-s.y,y=SEA+dy*.55;a+='<ellipse cx="'+n1(s.x)+'" cy="'+n1(y)+'" rx="'+n1(1.2+s.r)+'" ry="'+n1(.4+s.r*.3)+'" fill="#dfe9ff" opacity="'+n3(s.o*.28)+'"/>';});
 return '<g class="bk-sref">'+a+'</g>';
}
// 수평선 물안개: 구멍보다 앞에 있어(가까이) 언제나 보임 → 깊이감, 그리고 배 윤곽이 묻히지 않음
function horizonMist(){
 return '<rect x="0" y="'+(SEA-64)+'" width="'+W+'" height="104" fill="url(#bkHazeH)"/>'+
  '<g class="bk-mist" filter="url(#bwMist)"><rect x="-220" y="'+(SEA-30)+'" width="760" height="26" rx="13" fill="#b9ccd8" opacity=".09"/><rect x="460" y="'+(SEA-44)+'" width="820" height="30" rx="15" fill="#b9ccd8" opacity=".07"/></g>';
}
function night(){
 return '<rect width="'+W+'" height="'+H+'" fill="#02040a"/>'+
  '<g mask="url(#bkHole)"><rect width="'+W+'" height="'+(SEA+2)+'" fill="url(#bkSky)"/>'+
   '<circle cx="'+MOON[0]+'" cy="'+MOON[1]+'" r="190" fill="url(#bkMoonG)"/>'+
   '<circle cx="'+MOON[0]+'" cy="'+MOON[1]+'" r="25" fill="#e6eef2" opacity=".62" filter="url(#bkB3)"/>'+
   starsMarkup()+'</g>'+
  '<g mask="url(#bkHoleR)">'+sea()+starRefMarkup()+'</g>'+
  horizonMist();
}
// 앞자락 빛: 은은한 테두리(언제나) + 빛이 닿는 자리의 젖은 윤기
function rimMarkup(){
 return '<path class="bk-rim" d="'+MANTA+'" fill="none" stroke="url(#bkRimG)" stroke-width="9" filter="url(#bkB8)" opacity="0" transform="translate(-9999 0)"/>';
}
/* 날개 끝: 몸빛 → 피부 결 → 앞전 윤기 → 흘러내리는 물 → 등불빛 → 물안개(먼 날개) */
function wingMarkup(cls){
 let sheets='';for(let i=0;i<8;i++)sheets+='<ellipse class="bk-sh" data-i="'+i+'" cx="0" cy="0" rx="5" ry="18" fill="url(#bkSheet)"/>';
 return '<g class="'+cls+'" transform="translate(-9999 0)"><g clip-path="url(#bkWingCut)">'+
  '<path d="'+WING+'" fill="url(#bkWingG)"/>'+
  '<g clip-path="url(#bkWingClip)"><rect x="-240" y="-470" width="410" height="500" filter="url(#bkSkinD)" opacity=".38"/><rect x="-240" y="-470" width="410" height="500" filter="url(#bkSkin)" opacity=".14"/>'+
   '<g class="bk-sheets">'+sheets+'</g></g>'+
  '<path d="'+RIDGE+'" fill="url(#bkRidgeG)"/><path d="'+HEM+'" fill="#000" opacity=".55"/>'+
  '<path class="bk-wl" d="'+WING+'" fill="url(#bkWingL)" opacity="0"/>'+
  '<path d="'+WING+'" fill="url(#bkWingV)"/>'+
  '<path class="bk-fog" d="'+WING+'" fill="url(#bkFogW)" opacity="0"/></g></g>';
}
function wingRef(cls){return '<g class="'+cls+'" opacity=".34" mask="url(#bwRipple)" transform="translate(-9999 0)"><path d="'+WING+'" fill="#000"/><path d="'+RIDGE+'" fill="#2a3a4c" opacity=".5"/></g>';}
// 날개가 물을 가르는 자리: 부풀어 오른 물 · 거품 · 퍼지는 물결 · 물보라
function wakeMarkup(cls){
 let rp='';for(let i=0;i<3;i++)rp+='<ellipse class="bk-rp" data-i="'+i+'" rx="1" ry="1" fill="url(#bkRipple)" opacity="0"/>';
 return '<g class="'+cls+'"><ellipse class="bk-swell" rx="1" ry="1" fill="url(#bkSwell)" opacity="0"/>'+rp+
  '<ellipse class="bk-foam" rx="1" ry="1" fill="url(#bkFoam)" opacity="0"/><g class="bk-plume">'+plumeMarkup(14)+'</g></g>';
}
function darkMarkup(){return '<rect class="bk-dark" x="-60" y="-60" width="'+(W+120)+'" height="'+(H+120)+'" fill="url(#bkDark)" opacity="0"/>';}
function poolMarkup(){return '<ellipse class="bk-pool" rx="1" ry="1" fill="url(#bkPool)" opacity="0"/>';}
// 감싸인 어둠 속, 등불이 닿는 머리 위에 비치는 날개 밑면: 결이 있는 넓은 막 + 갈비뼈처럼 늘어선 굵은 결
function membrane(){
 const r=seeded(77);let ribs='';
 for(let i=0;i<11;i++){const cx=60+i*86+(r()-.5)*24,cy=40+Math.sin(i*.6)*20,rx=36+r()*18,ry=140+r()*40;
  ribs+='<ellipse cx="'+n1(cx)+'" cy="'+n1(cy)+'" rx="'+n1(rx)+'" ry="'+n1(ry)+'" fill="url(#bkMembrane)" transform="rotate('+n1(-14+r()*28)+' '+n1(cx)+' '+n1(cy)+')"/>';}
 return '<g class="bk-memb" opacity="0" mask="url(#bkMembMask)"><rect x="-40" y="-80" width="'+(W+80)+'" height="'+(SEA+40)+'" fill="#0c1520" opacity=".45" filter="url(#bkSkin)"/>'+ribs+'</g>';
}
function motesMarkup(n){let s='';for(let i=0;i<n;i++)s+='<circle class="bk-mo" data-i="'+i+'" r="1" fill="url(#bkMote)" opacity="0"/>';return '<g class="bk-motes">'+s+'</g>';}
function beamMarkup(){return '<path class="bk-beam" fill="url(#bkBeamG)" opacity="0"/><circle class="bk-glint" r="1" fill="url(#bkGlow)" opacity="0"/>';}
function hudMarkup(){return '<div class="bkg-hud" aria-hidden="true"><span class="bkg-hint"></span><span class="bkg-verdict"></span><span class="bkg-pips"></span><span class="bkg-count"></span><span class="bkg-bar"><i></i></span><span class="bkg-time"><i></i></span></div>';}

/* ---------- 배치 도우미 ---------- */
function mtx(x,y,rot,s){return 'translate('+n1(x)+' '+n1(y)+') rotate('+n1(rot)+') scale('+n3(s)+')';}
function placeHole(el,P){
 const {q}=cacheQ(el),a=q('.bk-holeP'),b=q('.bk-holeR');
 if(!P){a.setAttribute('transform','translate(-9999 0)');b.setAttribute('transform','translate(-9999 0)');return;}
 a.setAttribute('transform',mtx(P.x,P.y,P.rot,P.s));
 b.setAttribute('transform','translate(0 '+n1(2*SEA)+') scale(1 -.8) '+mtx(P.x,P.y,P.rot,P.s));
}
function toLocal(p,P){const dx=p[0]-P.x,dy=p[1]-P.y,c=Math.cos(-P.rot*RAD),s=Math.sin(-P.rot*RAD);return [(dx*c-dy*s)/P.s,(dx*s+dy*c)/P.s];}
function placeRim(el,P,at,k,warm,base){
 const {q}=cacheQ(el),rim=q('.bk-rim'),r0=q('.bk-rim0');if(!rim)return;
 if(!P){rim.setAttribute('opacity','0');if(r0)r0.setAttribute('opacity','0');return;}
 const tf=mtx(P.x,P.y,P.rot,P.s);
 if(r0){r0.setAttribute('transform',tf);r0.setAttribute('stroke-width',n1(14/P.s));r0.setAttribute('opacity',n3(base==null?.45:base));}
 if(k<=0||!at){rim.setAttribute('opacity','0');return;}
 rim.setAttribute('transform',tf);rim.setAttribute('stroke',warm?'url(#bkRimG2)':'url(#bkRimG)');
 const g=el.querySelector(warm?'#bkRimG2':'#bkRimG'),l=toLocal(at,P);
 g.setAttribute('cx',n1(l[0]));g.setAttribute('cy',n1(l[1]));g.setAttribute('r',n1(260/P.s));
 rim.setAttribute('stroke-width',n1(26/P.s));rim.setAttribute('opacity',n3(clamp(k)*.75));   // 젖은 가장자리가 번지는 빛의 띠로
}
function holeFromTip(tip,dirDeg,s){
 const rot=dirDeg-(180-Math.atan2(TIP_L[1],-TIP_L[0])/RAD);
 const c=Math.cos(rot*RAD),sn=Math.sin(rot*RAD),lx=TIP_L[0]*s,ly=TIP_L[1]*s;
 return {x:tip[0]-(lx*c-ly*sn),y:tip[1]-(lx*sn+ly*c),rot,s};
}
function twinkle(el,t){
 const {qa}=cacheQ(el),S=starData();
 qa('.bk-tw').forEach(c=>{const s=S[+c.dataset.i];c.setAttribute('opacity',n3(s.o*(.55+.45*Math.sin(t*2.3+s.ph))));});
 const m=cacheQ(el).q('.bk-mist');if(m)m.setAttribute('transform','translate('+n1(Math.sin(t*.11)*60)+' 0)');
}
/* 날개 배치: x,y = 수면 위 밑동 자리, s = 원근 크기, fog = 먼 날개의 물안개, lit = 등불빛 */
function placeWing(el,cls,x,y,rot,s,flip,o){
 const opt=o||{},{q}=cacheQ(el),w=q('.'+cls);if(!w)return;
 const sx=(flip?-1:1)*s;
 w.setAttribute('transform','translate('+n1(x)+' '+n1(y)+') rotate('+n1(rot)+') scale('+n3(sx)+' '+n3(s)+')');
 const r=q('.'+cls+'R');if(r)r.setAttribute('transform','translate('+n1(x)+' '+n1(2*SEA-y+8)+') rotate('+n1(-rot)+') scale('+n3(sx)+' '+n3(-s*.62)+')');
 const fog=w.querySelector('.bk-fog');if(fog)fog.setAttribute('opacity',n3(opt.fog||0));
 // 흘러내리는 물: 앞전 아래로 미끄러지는 젖은 막
 const t=opt.t||0;
 w.querySelectorAll('.bk-sh').forEach(e=>{const i=+e.dataset.i,k=((t*.42+i*.27)%1);
  const px=-170+i*30+Math.sin(i*2.1)*14,py=-340+((i*.37)%1)*-60+k*360;e.setAttribute('cx',n1(px+k*24*(i%2?1:-1)));e.setAttribute('cy',n1(py));e.setAttribute('ry',n1(10+16*Math.sin(k*Math.PI)));e.setAttribute('rx',n1(3+2*Math.sin(k*Math.PI)));e.setAttribute('opacity',n3(.8*Math.sin(k*Math.PI)*(opt.wet==null?1:opt.wet)));});
 const wl=w.querySelector('.bk-wl');
 if(wl){if(opt.lit&&opt.lit.k>0){const g=el.querySelector('#bkWingL'),c=Math.cos(-rot*RAD),sn=Math.sin(-rot*RAD),dx=opt.lit.at[0]-x,dy=opt.lit.at[1]-y;
   g.setAttribute('cx',n1((dx*c-dy*sn)/sx));g.setAttribute('cy',n1((dx*sn+dy*c)/s));g.setAttribute('r',n1(320/s));wl.setAttribute('opacity',n3(opt.lit.k));}
  else wl.setAttribute('opacity','0');}
}
function wingPoint(x,y,rot,s,flip,pt){const P=pt||WTIP,c=Math.cos(rot*RAD),sn=Math.sin(rot*RAD),lx=P[0]*s*(flip?-1:1),ly=P[1]*s;return [x+lx*c-ly*sn,y+lx*sn+ly*c];}
/* 물을 가르는 자리: k = 솟는 힘(0~1), t = 시각, s = 원근 크기 */
function paintWake(el,cls,x,y,k,t,s,seed){
 const {q}=cacheQ(el),g=q('.'+cls);if(!g)return;
 const sw=g.querySelector('.bk-swell'),fo=g.querySelector('.bk-foam');
 sw.setAttribute('cx',n1(x));sw.setAttribute('cy',n1(y+4*s));sw.setAttribute('rx',n1(260*s));sw.setAttribute('ry',n1(26*s));sw.setAttribute('opacity',n3(clamp(k)));
 fo.setAttribute('cx',n1(x-40*s));fo.setAttribute('cy',n1(y));fo.setAttribute('rx',n1(200*s*(1+.1*Math.sin(t*3))));fo.setAttribute('ry',n1(16*s));fo.setAttribute('opacity',n3(.9*clamp(k)));
 g.querySelectorAll('.bk-rp').forEach(e=>{const i=+e.dataset.i,a=((t*.5+i/3)%1);e.setAttribute('cx',n1(x-40*s));e.setAttribute('cy',n1(y+2));
  e.setAttribute('rx',n1((200+a*280)*s));e.setAttribute('ry',n1((14+a*20)*s));e.setAttribute('opacity',n3(clamp(k)*(1-a)*.9));});
 paintPlume(g.querySelector('.bk-plume'),x-40*s,y,220*s,(70+40*Math.sin(t*1.7))*s*clamp(k),.6*clamp(k),seed||5,t);
}
function paintDark(el,c,r,k){
 const {q}=cacheQ(el),d=q('.bk-dark');if(!d)return;
 d.setAttribute('opacity',n3(clamp(k)));
 const g=el.querySelector('#bkDark');g.setAttribute('cx',n1(c[0]));g.setAttribute('cy',n1(c[1]));g.setAttribute('r',n1(Math.max(20,r)));
}
function paintPool(el,c,r,k){
 const {q}=cacheQ(el),p=q('.bk-pool');if(!p)return;
 p.setAttribute('cx',n1(c[0]));p.setAttribute('cy',n1(c[1]));p.setAttribute('rx',n1(r));p.setAttribute('ry',n1(r*.22));p.setAttribute('opacity',n3(clamp(k)));
 const g=el.querySelector('#bkPool');g.setAttribute('cx',n1(c[0]));g.setAttribute('cy',n1(c[1]));g.setAttribute('r',n1(r));
}
// 등불빛 속을 떠다니는 빛 먼지
function paintMotes(el,c,R,t,k){
 const {qa}=cacheQ(el);
 qa('.bk-mo').forEach(e=>{const i=+e.dataset.i,ph=i*1.618,a=((t*.12+ph)%1);
  const ang=ph*2.3+Math.sin(t*.4+i)*.6,rr=R*(.25+.7*((i*.37)%1));
  e.setAttribute('cx',n1(c[0]+Math.cos(ang)*rr));e.setAttribute('cy',n1(c[1]+Math.sin(ang)*rr*.6-a*60));
  e.setAttribute('r',n1(1.2+((i*.53)%1)*2.2));e.setAttribute('opacity',n3(clamp(k)*Math.sin(a*Math.PI)*.8));});
}
function bob(t){return {y:Math.sin(t*1.5)*2+Math.sin(t*.7)*1.2,r:Math.sin(t*1.2+.6)*2.4};}
function lampLevel(){const g=window.BlackHuntGame;return g&&g.lampLevel!=null&&g.mode?g.lampLevel:4;}
function boatAt(el,t,x,extra){
 const e=extra||{},B=bob(t),tw=boatPose(el,x+(e.dx||0),SEA+B.y+(e.dy||0),B.r+(e.dr||0),e.arm||[37,-30]);
 lamp(el,t,tw,(e.lamp||0)-(4-lampLevel())*.16);
 return tw;
}
function beam(el,from,to,k,w){
 const {q}=cacheQ(el),b=q('.bk-beam'),gl=q('.bk-glint');if(!b)return;
 if(k<=0){b.setAttribute('opacity','0');if(gl)gl.setAttribute('opacity','0');return;}
 const dx=to[0]-from[0],dy=to[1]-from[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,R=w||60;
 const a=[to[0]+nx*R,to[1]+ny*R],c=[to[0]-nx*R,to[1]-ny*R];
 b.setAttribute('d','M'+n1(from[0]+nx*4)+','+n1(from[1]+ny*4)+' L'+n1(a[0])+','+n1(a[1])+' A'+n1(R)+','+n1(R)+' 0 0 1 '+n1(c[0])+','+n1(c[1])+' L'+n1(from[0]-nx*4)+','+n1(from[1]-ny*4)+' Z');
 const g=el.querySelector('#bkBeamG');g.setAttribute('cx',n1(from[0]));g.setAttribute('cy',n1(from[1]));g.setAttribute('r',n1(L+R));
 b.setAttribute('opacity',n3(clamp(k)));
 if(gl){gl.setAttribute('cx',n1(to[0]));gl.setAttribute('cy',n1(to[1]));gl.setAttribute('r',n1(R*.7));gl.setAttribute('opacity',n3(clamp(k)*.5));}
}

/* =================== 장면 =================== */
// ① 별이 꺼지는 수평선 — 먼 수평선(작게)에서 솟아 다가오며(크게) 하늘을 지워 감
const S0={title:'별이 꺼지는 수평선',loop:10,
 caps:[[0,'별이 하나씩 꺼집니다.'],[2.4,'수평선이 위로 차오릅니다. 차오르는 것은 물이 아닙니다.'],[4.8,'달이 지워졌습니다. 그것의 날개 끝이 달빛에 한 번 젖었습니다.'],[7.6,'별이 다시 하나씩 켜집니다. 지나간 것은 소리가 없었습니다.']],
 build(){return night()+rimMarkup()+boatMarkup()+K.nearMist();},
 paint(el,t,tr){
  ambient(el,t,0);twinkle(el,t);
  const u=seg(t,1.0,8.8),near=inOut(clamp(u*1.6));
  const P={x:lerp(-760,2100,u),y:SEA+90+180*(1-near)-300*Math.sin(Math.PI*u),rot:-24+40*u,s:lerp(.45,1.0,near)};
  const on=u>0&&u<1;
  placeHole(el,on?P:null);
  placeRim(el,on?P:null,MOON,.9*hump(seg(t,3.4,6.4)),false,.5*hump(u));
  boatAt(el,t,470,{lamp:-.3*hump(u)});
  caption(el,S0.caps,t);
  veil(el,tr<.6?1-tr/.6:.3*(t<.6?1-t/.6:seg(t,9.4,10)));
 }};
// ② 닫히는 날개 — 가까운 왼쪽 날개는 크고 낮게, 먼 오른쪽 날개는 작고 수평선 가까이 물안개 속에
const NEAR={x:170,y:SEA+48,s:1.04},FAR={x:780,y:SEA+10,s:.66,fog:.42};
const S1={title:'닫히는 날개',loop:9,
 caps:[[0,'양옆의 물이 검게 부풀어 오릅니다.'],[1.6,'날개 끝입니다. 그것이 드러내는 가장 큰 부분입니다.'],[4,'두 날개가 배 위로 휘어 듭니다. 별이 보이는 틈이 좁아집니다.'],[7,'틈이 닫히기 직전, 날개가 물러납니다.']],
 build(){return night()+wingRef('bk-wFarR')+wingRef('bk-wNearR')+wakeMarkup('bk-wkFar')+wingMarkup('bk-wFar')+boatMarkup()+wakeMarkup('bk-wkNear')+wingMarkup('bk-wNear')+drops('bk-drN',36,61,'#dbe8f2')+drops('bk-drF',24,67,'#dbe8f2')+K.nearMist();},
 paint(el,t,tr){
  ambient(el,t,0);twinkle(el,t);placeHole(el,null);
  const rise=outC(seg(t,.6,3.0))*(1-inC(seg(t,7.2,8.8))),curl=inOut(seg(t,2.4,6.4))*(1-seg(t,7,8.6));
  const yN=NEAR.y+470*NEAR.s*(1-rise),yF=FAR.y+470*FAR.s*(1-rise);
  placeWing(el,'bk-wNear',NEAR.x+70*curl,yN,6+18*curl,NEAR.s,false,{t,wet:rise});
  placeWing(el,'bk-wFar',FAR.x-40*curl,yF,-6-16*curl,FAR.s,true,{t:t+.4,fog:FAR.fog,wet:rise*.7});
  const wake=hump(seg(t,.5,1.8))+.35*rise;
  paintWake(el,'bk-wkNear',NEAR.x+20,NEAR.y,wake,t,NEAR.s,5);paintWake(el,'bk-wkFar',FAR.x-10,FAR.y,wake*.8,t+.5,FAR.s,9);
  if(!S1._dn){S1._dn=dropParams(36,61,-150,-30,160,420);S1._df=dropParams(24,67,-150,-30,120,300);}
  const {qa}=cacheQ(el);
  paintDrops(qa('.bk-drN circle'),S1._dn,NEAR.x+40,NEAR.y-300*rise,(t-.9)%2.2,120,420);
  paintDrops(qa('.bk-drF circle'),S1._df,FAR.x-20,FAR.y-200*rise,(t-1.1)%2.4,80,300);
  boatAt(el,t,480,{lamp:-.2*curl});
  caption(el,S1.caps,t);
  veil(el,tr<.6?1-tr/.6:.3*(t<.6?1-t/.6:seg(t,8.5,9)));
 }};
// ③ 꺼지는 별 — 머리 위를 지나는 날개 끝, 등불빛에 한 번 젖은 가장자리
const S2={title:'꺼지는 별',loop:9,
 caps:[[0,'머리 위의 별이 한 줄로 꺼져 갑니다.'],[2.4,'꺼지는 자리의 맨 앞, 그곳이 날개 끝입니다.'],[4.4,'등불을 들어 비추자 젖은 가장자리가 한 번 빛났습니다.'],[6.6,'다시 아무것도 보이지 않습니다.']],
 build(){return night()+rimMarkup()+beamMarkup()+motesMarkup(18)+boatMarkup()+K.nearMist();},
 paint(el,t,tr){
  ambient(el,t,0);twinkle(el,t);
  const u=seg(t,.8,7.6),tip=[lerp(1060,-120,u),190-90*Math.sin(Math.PI*u)],dir=Math.atan2(-90*Math.PI*Math.cos(Math.PI*u),-1180)/RAD;
  const P=holeFromTip(tip,dir,1.25),on=u>0&&u<1;
  placeHole(el,on?P:null);
  const tw=boatAt(el,t,430,{lamp:.1}),lampW=tw([51,-18.5]),lit=hump(seg(t,3.9,5.6));
  beam(el,lampW,tip,lit,64);
  placeRim(el,on?P:null,tip,lit,true,.35);
  paintMotes(el,[(lampW[0]+tip[0])/2,(lampW[1]+tip[1])/2],120,t,lit);
  caption(el,S2.caps,t);
  veil(el,tr<.6?1-tr/.6:.3*(t<.6?1-t/.6:seg(t,8.5,9)));
 }};
// ④ 감싸인 배 — 등불의 둘레만 남은 어둠, 머리 위로 비치는 날개 밑면의 결
const S3={title:'감싸인 배',loop:9,
 caps:[[0,'하늘도 물도 지워졌습니다. 등불이 비추는 곳만 남았습니다.'],[2.6,'어둠이 느리게 고동칩니다. 고동칠 때마다 빛의 둘레가 좁아집니다.'],[5.4,'빛이 닿는 머리 위에 무언가의 밑면이 비칩니다. 결이 있습니다.'],[7.4,'등불을 흔들어 어둠을 밀어냅니다.']],
 build(){return night()+membrane()+poolMarkup()+boatMarkup()+motesMarkup(22)+darkMarkup();},
 paint(el,t,tr){
  ambient(el,t,0);
  placeHole(el,{x:480,y:150,rot:180,s:1.7});
  const tw=boatAt(el,t,480,{lamp:.1}),lw=tw([51,-18.5]);
  const beat=Math.pow(Math.max(0,Math.sin(t*TAU/1.5)),6),push=t>7.4?80*hump(seg(t,7.4,8.6)):0,R=(280-40*beat+push)*(lampLevel()/4*.4+.6);
  paintDark(el,[lw[0],lw[1]-50],R,1);
  paintPool(el,[lw[0],SEA+6],R*.9,.9);
  paintMotes(el,[lw[0],lw[1]-40],R*.8,t,1);
  cacheQ(el).q('.bk-memb').setAttribute('opacity',n3(.25+.7*seg(t,4.4,5.8)*(1-seg(t,8.2,9))));
  caption(el,S3.caps,t);
  veil(el,tr<.6?1-tr/.6:.3*(t<.6?1-t/.6:seg(t,8.5,9)));
 }};
// ⑤ 날개 끝 — 사냥 성공(한 번 재생). g가 있으면 미니게임 진행(던진 시각 · 명중 여부)을 따름
const T4={rise:1.0,throwAt:2.6,fly:.45};
const WP=[610,SEA+30],WS=.82;   // 등불이 닿는 가장자리에서 솟는 날개(배보다 조금 앞쪽 = 조금 크게)
function finalPose(t,up){return {x:WP[0],y:WP[1]+470*WS*(1-up),rot:-8+Math.sin(t*1.3)*2};}
function spotAt(t,up){const p=finalPose(t,up);return wingPoint(p.x,p.y,p.rot,WS,true,WHIT);}
const S4={title:'날개 끝',dur:12,
 caps:[[0,'등불이 닿는 가장자리에서 물이 검게 솟습니다.'],[1.6,'날개 끝이 휘어 오릅니다. 등불에 밑면이 젖어 빛납니다.'],[3.2,'작살이 날개 끝을 꿰뚫었습니다.'],[4.6,'감싸던 것이 풀립니다. 어둠이 걷혀 갑니다.'],[7,'별이 돌아옵니다. 그것의 온몸은 끝내 아무도 보지 못했습니다.']],
 build(){
  return night()+membrane()+poolMarkup()+wingRef('bk-wFR')+wakeMarkup('bk-wkF')+
   '<path class="bw-rope" fill="none" stroke="#8a9697" stroke-opacity=".75" stroke-width="1.5" opacity="0"/>'+
   boatMarkup()+wingMarkup('bk-wF')+
   '<g class="bw-harpoon" opacity="0">'+HARPOON+'</g>'+
   drops('bk-splash',44,51,'#dbe8f2')+motesMarkup(20)+
   darkMarkup()+
   '<circle class="bk-ring" r="1" fill="url(#bkRing)" opacity="0"/>'+
   (HL()?HL().hitMarkup():'');
 },
 paint(el,t,tr,g){
  const {q,qa}=cacheQ(el);
  ambient(el,t,0);twinkle(el,t);
  const game=!!g,blind=game&&g.blind;
  const T0=game?(g.thrownAt!=null?g.thrownAt:null):T4.throwAt;
  const thrown=T0!=null&&t>=T0,arrive=T0!=null?T0+T4.fly:1e9,hit=game?!!g.hit:true;
  const HIT=hit?arrive:1e9,since=t-HIT;
  let up=game?(g.wingUp?g.wingUp(t):0):outC(seg(t,T4.rise,T4.rise+1.1));
  if(t>=HIT)up=Math.max(up,1)*(1-inC(seg(t,HIT+1.8,HIT+3.6)));
  if(blind)up=0;
  const fp=finalPose(t,up),wr=fp.rot+(t>=HIT?-8*seg(t,HIT,HIT+.25):0);
  const tw=boatAt(el,t,300,{arm:[37,-30]}),lampW=tw([51,-18.5]);
  placeWing(el,'bk-wF',fp.x,fp.y,wr,WS,true,{t,lit:{at:lampW,k:.9*up},wet:up});
  paintWake(el,'bk-wkF',fp.x-30,WP[1],up>.02?.4+.6*hump(clamp(up*1.4)):0,t,WS,7);
  const tip=wingPoint(fp.x,fp.y,wr,WS,true),spot=wingPoint(fp.x,fp.y,wr,WS,true,WHIT);
  // 어둠: 명중 뒤 풀려 걷힘
  const open=t>=HIT?inOut(seg(t,HIT+1.2,HIT+3.8)):0;
  const lv=(lampLevel()/4*.45+.55)*(blind?.65:1);
  const C=[(lampW[0]+fp.x)/2,lampW[1]-60],R=(290+30*Math.sin(t*1.7))*lv+open*1000;
  paintDark(el,C,R,1-open*.95);
  paintPool(el,[lampW[0]+60,SEA+8],220*lv,.85*(1-open*.6));
  paintMotes(el,[C[0],C[1]+20],200*lv,t,1-open);
  q('.bk-memb').setAttribute('opacity',n3(.55*(1-open)));
  placeHole(el,open<1?{x:480+open*1700,y:140-open*140,rot:180-open*24,s:1.7}:null);
  // 좁혀 오는 고리(미니게임)
  const ring=q('.bk-ring');
  if(game&&!thrown&&!blind&&g.ringAt){const k=g.ringAt(t);
   if(k!=null){const r=16+160*Math.max(0,k);ring.setAttribute('cx',n1(spot[0]));ring.setAttribute('cy',n1(spot[1]));ring.setAttribute('r',n1(r));ring.setAttribute('opacity',n3(.95*clamp(1.2-Math.abs(k)*.4)));}
   else ring.setAttribute('opacity','0');}
  else ring.setAttribute('opacity','0');
  // 작살: 특수 작살이면 발사대에서, 없으면 손으로
  const L=HL(),own=!!(L&&L.owned()),PC=L?L.pierce():{deep:0,pass:false,n:0};
  const hp=q('.bw-harpoon'),rope=q('.bw-rope');
  const hand=own?L.handFor(L.launch(el,tw,{loaded:!thrown}),30,-14):tw(thrown?[38,-24]:[33,-31]);
  const p0=[hand[0]+30,hand[1]-14],LIFT=46;
  const target=game&&g.target?g.target:spot;
  let pos=null,ang=0,show=0;
  if(!thrown){if(!own){pos=[hand[0]+20,hand[1]-14];ang=-30;show=1;}}
  else if(t<arrive){const u=(t-T0)/T4.fly,e=u*(.85+.15*u);pos=[p0[0]+(target[0]-p0[0])*e,p0[1]+(target[1]-p0[1])*e-4*LIFT*e*(1-e)];ang=Math.atan2((target[1]-p0[1])-4*LIFT*(1-2*e),target[0]-p0[0])/RAD;show=1;}
  else if(hit){
   const ea=Math.atan2((target[1]-p0[1])+4*LIFT,target[0]-p0[0])/RAD;
   if(PC.pass){const pa=L.passAngle(ea),dd=10+since*L.PASS_SPEED;ang=pa;pos=[target[0]+Math.cos(pa*RAD)*dd,target[1]+Math.sin(pa*RAD)*dd];show=pos[0]<W+260?1:0;}
   else{ang=ea;const dd=-8+PC.deep;pos=[spot[0]+Math.cos(ea*RAD)*dd,spot[1]+Math.sin(ea*RAD)*dd];show=up>.05?1:0;}
  }else{const s=t-arrive,ea=Math.atan2((target[1]-p0[1])+4*LIFT,target[0]-p0[0]);pos=[target[0]+Math.cos(ea)*s*500,target[1]+Math.sin(ea)*s*500+300*s*s];ang=ea/RAD+s*40;show=pos[1]<SEA+6?1:0;}
  hp.setAttribute('opacity',String(show));
  if(pos)hp.setAttribute('transform','translate('+n1(pos[0])+' '+n1(pos[1])+') rotate('+n1(ang)+')');
  if(L){L.bury(hp,hit&&t>=HIT&&!PC.pass?8-PC.deep:null);
   L.paintHit(el,{s:t>=HIT?since:-1,p:target,ang:PC.pass?L.passAngle(ang):ang,tier:PC.n,through:110});}
  const tipEl=hp.querySelector('.bw-tip');if(tipEl)tipEl.style.opacity=hit&&t>=HIT&&!PC.pass?'0':'1';
  if(thrown&&pos&&show){const ar=ang*RAD,tail=[pos[0]-104*Math.cos(ar),pos[1]-104*Math.sin(ar)],an=tw(own&&L?L.anchorLocal():[40,-9]);
   const slack=t<arrive?36:hit?Math.max(4,26*Math.exp(-since*2))+Math.sin(t*2.4)*2:40;
   rope.setAttribute('d','M'+n1(an[0])+','+n1(an[1])+' Q'+n1((an[0]+tail[0])/2)+','+n1((an[1]+tail[1])/2+slack)+' '+n1(tail[0])+','+n1(tail[1]));
   rope.setAttribute('opacity','.85');}
  else rope.setAttribute('opacity','0');
  // 솟을 때와 가라앉을 때 쏟아지는 물
  if(!S4._sp)S4._sp=dropParams(44,51,-160,-20,110,300);
  const riseAt=game?(g.cycles&&g.cycles.length?g.cycles.filter(c=>c.start<=t).slice(-1)[0]:null):null;
  const ds=game?(riseAt?t-riseAt.start:-1):t-T4.rise;
  paintDrops(qa('.bk-splash circle'),S4._sp,fp.x-20,WP[1]-6,t>=HIT+1.8?t-HIT-1.8:ds,90,420);
  if(!game)caption(el,S4.caps,t);
  veil(el,tr<.6?1-tr/.6:0);
 }};

/* =================== 미니게임 화면 =================== */
const LAMPCAP=['어둠이 수평선에서 밀려옵니다. 그것이 등불에 닿는 순간 덮개를 덮으십시오.','어둠이 다시 밀려옵니다. 닿는 순간 덮으십시오.','별이 꺼지며 다가옵니다. 등불을 지키십시오.','마지막 어둠입니다. 등불을 지키십시오.'];
const GAMECAP=['','두 날개 사이의 별빛 아래에 배를 두십시오.','별이 꺼지는 맨 앞자리를 누르십시오.','어둠이 고동칠 때 등불을 흔들어 밀어내십시오.','날개 끝이 등불에 젖어 오르는 순간 작살을 던지십시오.'];
// 등불 덮기: 어둠의 앞자락이 수평선 왼쪽에서 밀려와 배를 지나감
function lampGame(el,t,tr,g){
 ambient(el,t,0);twinkle(el,t);
 const v=420,S=1.75,front=250*S,X=480-front+v*(t-g.edgeAt);
 const P={x:X,y:SEA-60,rot:90,s:S};
 placeHole(el,P);
 const dist=(480-(X+front))/v;
 placeRim(el,P,[X+front,SEA-120],dist<1.4&&dist>-.2?.7:0,false,.5);
 const shut=g.result==='kept'||g.result==='early';
 const flick=dist>0&&dist<.9?(1-dist/.9):0;
 boatAt(el,t,480,{lamp:shut?-.8:(-.3*flick+Math.sin(t*37)*.12*flick)});
 hudLamp(el,t,g,dist);
 caption(el,[[0,LAMPCAP[g.wave||0]]],0);
 veil(el,t<.5?1-t/.5:0);
}
function hudLamp(el,t,g,dist){
 const u=hud(el),r=g.result;
 setVerdict(u.verdict,r==='kept'?'등불을 지켰다':r==='early'?'너무 일찍 덮었다':r==='late'?'등불이 감싸였다':'',r==='kept'?'good':'bad');
 setTxt(u.hint,r?'':dist>1.2?'어둠의 앞자락이 다가옵니다 · 별이 꺼지는 것을 보십시오':dist>-.3?'닿는 순간 누르십시오 (등불을 덮는다)':'');
 u.hint.classList.toggle('now',!r&&Math.abs(dist)<(g.win||.3));
 pips(u.pips,g.record||[]);
}
// 날개 사이의 틈
function gapGame(el,t,tr,g){
 ambient(el,t,0);twinkle(el,t);placeHole(el,null);
 const gx=g.gx!=null?g.gx:480,half=g.half||150;
 const rise=outC(seg(t-(g.roundAt||0),0,.9));
 const close=g.slamAt!=null?seg(t,g.slamAt,g.slamAt+.4)*(1-seg(t,g.slamAt+1,g.slamAt+1.6)):0;
 const yN=NEAR.y+470*NEAR.s*(1-rise),yF=FAR.y+470*FAR.s*(1-rise);
 placeWing(el,'bk-wNear',gx-half-150+close*half,yN,8+12*close,NEAR.s,false,{t,wet:rise});
 placeWing(el,'bk-wFar',gx+half+110-close*half,yF,-8-12*close,FAR.s,true,{t:t+.4,fog:FAR.fog,wet:rise*.7});
 paintWake(el,'bk-wkNear',gx-half-130+close*half,NEAR.y,.5*rise,t,NEAR.s,5);paintWake(el,'bk-wkFar',gx+half+100-close*half,FAR.y,.4*rise,t+.5,FAR.s,9);
 boatAt(el,t,g.bx!=null?g.bx:480,{dr:(g.dir||0)*4});
 const u=hud(el),inGap=Math.abs((g.bx||480)-gx)<half;
 setVerdict(u.verdict,g.flash&&t-g.flash.at<1?g.flash.text:'',g.flash&&g.flash.good?'good':'bad');
 setTxt(u.hint,g.phase==='go'?(inGap?'별빛 아래 · 그대로 따라가십시오':'틈에서 벗어났습니다 · ← → 로 배를 옮기십시오'):'');
 u.hint.classList.toggle('now',g.phase==='go'&&inGap);
 bar(u,g.fill||0,g.phase==='go'?1-(t-g.goAt)/g.limit:0,inGap);
 count(u,(g.round||0)+' / '+(g.need||2));
 caption(el,[[0,GAMECAP[1]]],0);
 veil(el,t<.5?1-t/.5:0);
}
// 별이 꺼지는 자리
function starsGame(el,t,tr,g){
 ambient(el,t,0);twinkle(el,t);
 const p=g.pass,tw=boatAt(el,t,430,{lamp:.08}),lampW=tw([51,-18.5]);
 const live=p&&t>=p.start&&t<=p.end,P=live?holeFromTip(p.tipAt(t),p.dirAt(t),1.15):null;
 placeHole(el,P);g.tip=live?p.tipAt(t):null;
 const c=g.lastClick,ck=c?1-seg(t,c.at,c.at+.7):0;
 beam(el,lampW,c?c.p:lampW,ck,58);
 placeRim(el,P,c?c.p:null,c&&c.hit?ck:0,true,.35);
 paintMotes(el,c?[(lampW[0]+c.p[0])/2,(lampW[1]+c.p[1])/2]:lampW,110,t,ck);
 const u=hud(el);
 setVerdict(u.verdict,c&&t-c.at<.9?(c.hit?'날개 끝':'허공'):'',c&&c.hit?'good':'bad');
 setTxt(u.hint,p&&t>=p.start-.4&&t<=p.end?'별이 꺼지는 맨 앞을 누르십시오':'다음 별이 꺼지기를 기다리십시오');
 u.hint.classList.toggle('now',!!live);
 count(u,(g.caught||0)+' / '+(g.need||3));
 caption(el,[[0,GAMECAP[2]]],0);
 veil(el,t<.5?1-t/.5:0);
}
// 어둠의 고동
function pulseGame(el,t,tr,g){
 const {q}=cacheQ(el);
 ambient(el,t,0);
 placeHole(el,{x:480,y:150,rot:180,s:1.7});
 const tw=boatAt(el,t,480,{lamp:g.flareAt!=null?.6*(1-seg(t,g.flareAt,g.flareAt+.5)):0}),lw=tw([51,-18.5]);
 const base=(g.radius||260)*(lampLevel()/4*.4+.6);
 const flare=g.flareAt!=null?80*hump(seg(t,g.flareAt,g.flareAt+.6)):0;
 const nb=g.nextBeat!=null?g.nextBeat:null;
 const squeeze=nb!=null?Math.pow(clamp(1-(nb-t)/.6),3)*34:0;
 const R=base+flare-squeeze;
 paintDark(el,[lw[0],lw[1]-50],R,1);
 paintPool(el,[lw[0],SEA+6],R*.9,.9);
 paintMotes(el,[lw[0],lw[1]-40],R*.8,t,1);
 q('.bk-memb').setAttribute('opacity',n3(.4+.4*(flare/80)));
 const pr=q('.bk-pulse');
 if(nb!=null&&nb-t<1.1&&nb-t>-.1){const k=clamp((nb-t)/1.1),r=R+30+k*520;pr.setAttribute('cx',n1(lw[0]));pr.setAttribute('cy',n1(lw[1]-50));pr.setAttribute('r',n1(r));pr.setAttribute('opacity',n3(.9*(1-k*.3)));}
 else pr.setAttribute('opacity','0');
 const u=hud(el);
 setVerdict(u.verdict,g.flash&&t-g.flash.at<.6?g.flash.text:'',g.flash&&g.flash.good?'good':'bad');
 setTxt(u.hint,nb!=null?'어둠이 빛의 둘레에 닿는 순간 누르십시오 (등불을 흔든다)':'');
 u.hint.classList.toggle('now',nb!=null&&Math.abs(nb-t)<(g.win||.2));
 count(u,(g.beatsOk||0)+' / '+(g.need||8));
 caption(el,[[0,GAMECAP[3]]],0);
 veil(el,t<.5?1-t/.5:0);
}
function finalGame(el,t,tr,g){
 S4.paint(el,t,t,g);
 const u=hud(el);
 setVerdict(u.verdict,g.flight&&t>=g.flight.arrive&&t<g.flight.arrive+1.2?(g.flight.hit?'명중':g.flight.blind?'어둠 속으로':'빗나감'):'',g.flight&&g.flight.hit?'good':'bad');
 setTxt(u.hint,g.hit||g.done||(g.thrownAt!=null&&g.flight&&t<g.flight.arrive+1)?'':g.blind?'등불이 꺼져 갑니다 · 날개 끝이 어디 있는지 보이지 않습니다':'좁혀 오는 고리가 날개 끝에 닿는 순간 누르십시오');
 u.hint.classList.toggle('now',!!(g.ringAt&&g.ringAt(t)!=null&&Math.abs(g.ringAt(t))<.12));
 caption(el,[[0,GAMECAP[4]]],0);
}
/* ---------- HUD 도우미 ---------- */
function hud(el){const {q}=cacheQ(el);return {hint:q('.bkg-hint'),verdict:q('.bkg-verdict'),pips:q('.bkg-pips'),count:q('.bkg-count'),bar:q('.bkg-bar'),time:q('.bkg-time')};}
function setTxt(n,t){if(n&&n.textContent!==t)n.textContent=t;}
function setVerdict(n,t,cls){if(!n)return;setTxt(n,t);const c='bkg-verdict'+(t?' on '+(cls||''):'');if(n.className!==c)n.className=c;}
function pips(n,rec){if(!n)return;const key=rec.join(',');if(n.dataset.k===key)return;n.dataset.k=key;let h='';for(let i=0;i<4;i++)h+='<i class="'+(rec[i]==='kept'?'good':rec[i]?'bad':'')+'"></i>';n.innerHTML=h;}
function count(u,txt){setTxt(u.count,txt);}
function bar(u,fill,time,hot){if(u.bar){u.bar.firstChild.style.width=n1(clamp(fill)*100)+'%';u.bar.classList.toggle('hot',!!hot);}if(u.time)u.time.firstChild.style.width=n1(clamp(time)*100)+'%';}

const GBUILD={
 lamp:()=>night()+rimMarkup()+boatMarkup()+K.nearMist(),
 1:()=>S1.build(),
 2:()=>S2.build(),
 3:()=>night()+membrane()+poolMarkup()+boatMarkup()+motesMarkup(22)+darkMarkup()+'<circle class="bk-pulse" r="1" fill="url(#bkPulse)" opacity="0"/>',
 4:()=>S4.build()
};
const GAMEPAINT={1:gapGame,2:starsGame,3:pulseGame,4:finalGame};
const GAMEMODE={1:'gap',2:'stars',3:'pulse',4:'final'};
const SCENES=[S0,S1,S2,S3,S4];
function html(stage,opts){
 const i=Math.max(0,Math.min(4,Math.floor(+stage||0))),S=SCENES[i],lampW=!!(opts&&opts.lamp),game=lampW||!!(opts&&opts.game&&GAMECAP[i]);
 const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'+
  '<defs>'+commonDefs()+bkDefs()+'</defs>'+(lampW?GBUILD.lamp():game?GBUILD[i]():S.build())+
  '<rect class="bw-veil" width="'+W+'" height="'+H+'" fill="#000" opacity="1"/></svg>';
 return '<div class="pallid-cine-v2 bk3-scene'+(game?' bkg-on':'')+'" data-stage="'+i+'"'+(game?' data-game="1"':'')+(lampW?' data-lamp="1"':'')+' role="img" aria-label="'+esc(NAME+' · '+(i+1)+'단계 '+S.title)+'">'+svg+
  '<span class="cine-top" aria-hidden="true">'+esc(NAME+' · '+(lampW?'등불':S.title))+'</span>'+
  '<span class="cine-bottom" aria-hidden="true">'+esc(lampW?LAMPCAP[Math.min(3,i)]:game?GAMECAP[i]:S.caps[0][1])+'</span>'+
  (game?hudMarkup():'')+
  '<span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}
const API=window.BlackWhaleV3={html,stages:SCENES.map(s=>s.title),replayToken:0,resume:null};
let start=0,lastSeen=0,seenTok=-1,seenStage=-1,seenGame=false;
function frame(now){
 const el=document.querySelector('.bk3-scene');
 if(el&&el.isConnected){
  const st=+el.dataset.stage,S=SCENES[st],g=window.BlackHuntGame;
  const isLamp=!!(el.dataset.lamp&&g&&g.t0&&g.mode==='lamp');
  const isGame=!isLamp&&!!(el.dataset.game&&g&&g.t0&&g.mode===GAMEMODE[st]);
  if(S&&(isLamp||isGame)){
   const t=(now-g.t0)/1000;lastSeen=now;seenGame=true;seenStage=st;
   try{(isLamp?lampGame:GAMEPAINT[st])(el,t,t,g);}catch(e){if(!el._bkErr){el._bkErr=1;console.warn('검은 고래 미니게임',e);}}
  }else if(S){
   if(now-lastSeen>900||API.replayToken!==seenTok||st!==seenStage||seenGame){start=now;seenTok=API.replayToken;seenStage=st;seenGame=false;}
   if(API.resume&&API.resume.stage===st&&!el.dataset.game){start=API.resume.start;API.resume=null;}
   if(el.closest('.is-paused'))start+=now-lastSeen;
   lastSeen=now;
   let tr=(now-start)/1000;
   if(el.dataset.seek!=null)tr=+el.dataset.seek;
   const t=S.loop?tr%S.loop:Math.min(tr,S.dur||tr);
   try{S.paint(el,t,tr);}catch(e){if(!el._bkErr){el._bkErr=1;console.warn('검은 고래 이펙트',e);}}
  }
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// 미니게임이 쓰는 기하
API.geo={spotAt,cineHit:T4.throwAt+T4.fly};
})();
