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
 '<radialGradient id="bkByHalo"><stop stop-color="#ffd890" stop-opacity=".5"/><stop offset=".45" stop-color="#ffb860" stop-opacity=".18"/><stop offset="1" stop-color="#ff9a40" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bkByPil" cx=".5" cy=".1" r=".9"><stop stop-color="#ffe2a0" stop-opacity=".6"/><stop offset=".4" stop-color="#ffc870" stop-opacity=".22"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>'+
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
  '<g class="bk-mist"><ellipse cx="160" cy="'+(SEA-17)+'" rx="410" ry="24" fill="url(#bwMistG)" opacity=".11"/><ellipse cx="870" cy="'+(SEA-29)+'" rx="440" ry="27" fill="url(#bwMistG)" opacity=".09"/></g>';
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
/* 날개 끝: 빛을 하나도 돌려주지 않는 완전한 검정. 원근은 크기 · 수면 위치 · 비친 그림자 · 물을 가르는 자국으로만 드러남 */
function wingMarkup(cls){return '<g class="'+cls+'" transform="translate(-9999 0)"><g clip-path="url(#bkWingCut)"><path d="'+WING+'" fill="#000"/></g></g>';}
function wingRef(cls){return '<g class="'+cls+'" opacity=".42" mask="url(#bwRipple)" transform="translate(-9999 0)"><path d="'+WING+'" fill="#000"/></g>';}
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
 // 셰이더 날개: 등불(배 등불의 세계 좌표 → 날개 좌표)
 if(window.LimbGL){const cg=w.firstElementChild;let lampL=null;const lw=el.__lamp;
  if(lw){const c=Math.cos(-rot*RAD),sn=Math.sin(-rot*RAD),dx=lw[0]-x,dy=lw[1]-y;lampL=[(dx*c-dy*sn)/sx,(dx*sn+dy*c)/s,lw[2]];}
  if(opt.lit&&opt.lit.k>0){const c=Math.cos(-rot*RAD),sn=Math.sin(-rot*RAD),dx=opt.lit.at[0]-x,dy=opt.lit.at[1]-y;lampL=[(dx*c-dy*sn)/sx,(dx*sn+dy*c)/s,Math.max(lampL?lampL[2]:0,opt.lit.k)];}
  window.LimbGL.wing(w,cg,{t:opt.t||0,fog:opt.fog||0,wet:opt.wet,lamp:lampL,lampR:320/s,lit:w.__lit});}
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
  const P={x:lerp(-760,2100,u),y:SEA+90+180*(1-near)-300*Math.sin(Math.PI*u),rot:-24+40*u,s:lerp(.55,1.2,near)};
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
 build(){return night()+wingRef('bk-wFarR')+wingRef('bk-wNearR')+wakeMarkup('bk-wkFar')+K.nearMist()+wingMarkup('bk-wFar')+boatMarkup()+wakeMarkup('bk-wkNear')+wingMarkup('bk-wNear')+drops('bk-drN',36,61,'#dbe8f2')+drops('bk-drF',24,67,'#dbe8f2');},
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
/* ⑤ 날개 끝 — 작살 한 방으로는 쓰러지지 않는다.
   ① 등불에 젖어 오른 날개 끝을 망을 감은 작살로 꿰어 붙든다(망 3개 이상. 0개는 튕겨 나가고, 1~2개는 얕게 박혔다 찢겨 나감)
   ② 붙들린 그것이 배를 통째로 감싸 온다. 3단계에서 기억한 별 자리(별 지도)가 하나씩 꺼지며 이음매가 닫힌다
   ③ 마지막 이음매가 닫히는 순간 덮어 두었던 등불을 한꺼번에 연다
   ④ 안쪽에서 빛이 커지자 그것은 그 빛마저 감싸려 들고, 제 안쪽까지 감싸다 뒤집혀 한 점으로 접혀 사라진다 */
const T4={rise:1.0,throwAt:2.6,fly:.45,wrap:4.2,close:7.6,dur:13.4};
const WP=[610,SEA+30],WS=.82;
const SEAMS=[[250,120],[690,96],[520,214]];
function finalPose(t,up){return {x:WP[0],y:WP[1]+470*WS*(1-up),rot:-8+Math.sin(t*1.3)*2};}
function spotAt(t,up){const p=finalPose(t,up);return wingPoint(p.x,p.y,p.rot,WS,true,WHIT);}
function starMap(){const r=typeof state!=='undefined'&&state&&state.blackLamp;return r&&Array.isArray(r.stars)&&r.stars.length?r.stars:SEAMS;}
function wrapWings(){let s='';for(let i=0;i<7;i++)s+='<g class="bk-ww" data-i="'+i+'" opacity="0"><path d="'+WING+'" fill="#000"/></g>';return '<g class="bk-wrap">'+s+'</g>';}
function seamMarkup(){let s='';for(let i=0;i<4;i++)s+='<g class="bk-seam" data-i="'+i+'" opacity="0"><circle r="16" fill="url(#bkStar)"/><circle r="2.2" fill="#fff"/></g>';return s;}
const S4={title:'날개 끝',dur:T4.dur,
 caps:[[0,'등불이 닿는 가장자리에서 물이 검게 솟습니다.'],[1.6,'날개 끝이 휘어 오릅니다.'],[3.2,'망을 감은 작살이 날개 끝을 꿰어 붙듭니다.'],[4.4,'붙들린 그것이 배를 통째로 감싸 옵니다. 기억해 둔 별 자리가 하나씩 닫힙니다.'],[7.6,'마지막 이음매가 닫히는 순간, 덮어 두었던 등불을 엽니다.'],[8.4,'그것이 빛마저 감싸려 듭니다. 제 안쪽까지 감싸다 뒤집혀 접힙니다.'],[10.4,'아무것도 남지 않았습니다. 별이 돌아옵니다.']],
 build(){
  return night()+membrane()+poolMarkup()+wingRef('bk-wFR')+wakeMarkup('bk-wkF')+
   '<path class="bw-rope" fill="none" stroke="#8a9697" stroke-opacity=".75" stroke-width="1.5" opacity="0"/>'+
   boatMarkup()+wingMarkup('bk-wF')+
   '<g class="bw-harpoon" opacity="0">'+HARPOON+'</g>'+
   drops('bk-splash',44,51,'#dbe8f2')+motesMarkup(20)+
   darkMarkup()+seamMarkup()+wrapWings()+
   '<circle class="bk-burst" r="1" fill="url(#bkGlow)" opacity="0"/>'+
   '<circle class="bk-knot" r="1" fill="#000" opacity="0"/>'+
   '<circle class="bk-white" r="1" fill="url(#bkGlow)" opacity="0"/>'+
   '<circle class="bk-ring" r="1" fill="url(#bkRing)" opacity="0"/>'+
   (HL()?HL().hitMarkup():'');
 },
 paint(el,t,tr,g){
  const {q,qa}=cacheQ(el);
  ambient(el,t,0);twinkle(el,t);
  const game=!!g,blind=game&&g.blind;
  const T0=game?(g.thrownAt!=null?g.thrownAt:null):T4.throwAt;
  const thrown=T0!=null&&t>=T0,arrive=T0!=null?T0+T4.fly:1e9;
  const pinOK=game?!!g.hit:true,pinFail=game?g.pinFail||null:null;
  const HIT=pinOK?arrive:1e9,since=t-HIT;
  // 감싸기 · 열기 시각
  const wrapAt=game?(g.wrapStart!=null?g.wrapStart:1e9):T4.wrap,closeAt=game?(g.closeAt!=null?g.closeAt:1e9):T4.close;
  const openAt=game?(g.openAt!=null?g.openAt:1e9):T4.close;
  let wk=t>=wrapAt?clamp((t-wrapAt)/(closeAt-wrapAt)):0;           // 0 → 1: 감싸며 닫힘
  if(game&&g.recoilAt!=null&&t>=g.recoilAt&&t<wrapAt)wk=g.recoilK*(1-outC(seg(t,g.recoilAt,g.recoilAt+.7)));   // 일찍/늦게 열어 물러남
  const wrap0=game?(g.wrap0!=null?g.wrap0:wrapAt):T4.wrap;
  const fo=t>=openAt?t-openAt:-1;                                       // 연 뒤 흐른 시간
  // 날개 끝
  let up=game?(g.wingUp?g.wingUp(t):0):outC(seg(t,T4.rise,T4.rise+1.1));
  if(t>=HIT)up=Math.max(up,1)*(1-inC(seg(t,Math.max(HIT+.6,wrap0-.4),wrap0+.8)));
  if(blind)up=0;
  const fp=finalPose(t,up),wr=fp.rot+(t>=HIT?-8*seg(t,HIT,HIT+.25):0);
  const tw=boatAt(el,t,300,{arm:[37,-30],lamp:fo>=0?1.2*Math.exp(-fo*.8):wk>0?-.3*wk:0}),lampW=tw([51,-18.5]);
  placeWing(el,'bk-wF',fp.x,fp.y,wr,WS,true,{t});
  paintWake(el,'bk-wkF',fp.x-30,WP[1],up>.02?.4+.6*hump(clamp(up*1.4)):0,t,WS,7);
  const tip=wingPoint(fp.x,fp.y,wr,WS,true),spot=wingPoint(fp.x,fp.y,wr,WS,true,WHIT);
  // 어둠: 감싸 오며 좁아짐 → 열면 빛이 밀어냄 → 접혀 사라지면 걷힘
  const lv=(lampLevel()/4*.45+.55)*(blind?.65:1);
  const gone=fo>=0?inOut(seg(fo,2.2,3.4)):0;
  const baseR=(290+30*Math.sin(t*1.7))*lv;
  let R=baseR*(1-wk*.45);const R0w=baseR*.55;
  if(fo>=0)R=lerp(R,520,outC(seg(fo,0,.35)))*(1-.7*inOut(seg(fo,.5,2.0)))+gone*1100;
  const C=[lampW[0]+(fo>=0?0:(fp.x-lampW[0])*.5*(1-wk)),lampW[1]-40-(fo>=0?0:20*(1-wk))];
  paintDark(el,C,R,(1-gone*.97)*(1-.1*wk));
  paintPool(el,[lampW[0]+40,SEA+8],(220*lv)*(1-wk*.25)+(fo>=0?260*hump(seg(fo,0,1.6)):0),.85*(1-gone*.6));
  paintMotes(el,[C[0],C[1]+20],Math.max(60,R*.7),t,1-gone);
  q('.bk-memb').setAttribute('opacity',n3(.55*(1-gone)*(1-wk*.5)));
  placeHole(el,gone<1?{x:480+gone*1700,y:140-gone*140,rot:180-gone*24,s:1.7}:null);
  // 별 지도: 이음매(기억한 별 자리)가 감싸이며 하나씩 닫힘
  const map=starMap();
  const nS=Math.min(4,map.length),showS=(t>=wrapAt||wk>0)&&!(fo>.3);
  qa('.bk-seam').forEach(e=>{const i=+e.dataset.i,p=map[i];if(!p||i>=nS||!showS){e.setAttribute('opacity','0');return;}
   const at=(i+1)/nS,shut=wk>=at,near=clamp(1-(at-wk)*nS),flick=.75+.25*Math.sin(t*9+i*2);   // i번째 이음매는 wk=(i+1)/n에 닫힘 → 마지막은 정확히 closeAt
   e.setAttribute('transform','translate('+n1(p[0])+' '+n1(p[1])+') scale('+n3(shut?.2:.9+.9*near)+')');
   e.setAttribute('opacity',n3(shut?0:flick*(.55+.45*near)*Math.max(seg(t,wrapAt,wrapAt+.4),wk>0?1:0)));});
  // 감싸는 날개들: 배를 둘러 안쪽으로 휘어 듦 → 빛을 감싸려 모여듦 → 뒤집혀 한 점으로 접힘
  qa('.bk-ww').forEach(e=>{const i=+e.dataset.i,a=i/7*360+20*Math.sin(i*1.7),ar=a*RAD;
   if(t<wrapAt&&wk<=0){e.setAttribute('opacity','0');return;}
   // 날개 끝이 안쪽(등불)을 향함: 밑동은 빛의 둘레 밖, 끝은 빛 안으로 파고들어 실루엣으로만 보임
   const sc0=.42;let sc=sc0,rr=lerp(760,R+150,outC(wk)),rot=a-90+14*Math.sin(t*1.1+i),op=t<wrapAt?clamp(wk*3):seg(t,wrapAt,wrapAt+.6);
   if(fo>=0){const f0=outC(seg(fo,0,.3)),f1=inOut(seg(fo,.35,1.8)),f2=inC(seg(fo,1.8,2.3));
    rr=lerp(lerp(R0w+150,R0w+300,f0),50,f1)*(1-f2);sc=lerp(sc0,.26,f1)*(1-f2);rot=a-90+f1*170+f2*240;op=1-seg(fo,2.2,2.5);}
   const x=C[0]+Math.cos(ar)*rr,y=C[1]+Math.sin(ar)*rr*.8;
   e.setAttribute('transform','translate('+n1(x)+' '+n1(y)+') rotate('+n1(rot)+') scale('+n3(sc)+')');e.setAttribute('opacity',n3(op));});
  // 연 빛 · 감싸인 매듭 · 뒤집히는 섬광
  const bu=q('.bk-burst'),kn=q('.bk-knot'),wh=q('.bk-white');
  if(fo>=0){
   const br=lerp(30,380,outC(seg(fo,0,.4)))*(1-.75*inOut(seg(fo,.5,1.9)))+240*inC(seg(fo,2.0,2.6));
   bu.setAttribute('cx',n1(C[0]));bu.setAttribute('cy',n1(C[1]));bu.setAttribute('r',n1(br));bu.setAttribute('opacity',n3(1-seg(fo,2.6,3.4)));
   const kr=lerp(0,70,seg(fo,1.2,1.8))*(1-inC(seg(fo,1.9,2.25)));
   kn.setAttribute('cx',n1(C[0]));kn.setAttribute('cy',n1(C[1]));kn.setAttribute('r',n1(kr));kn.setAttribute('opacity',n3(kr>1?.95:0));
   wh.setAttribute('cx',n1(C[0]));wh.setAttribute('cy',n1(C[1]));wh.setAttribute('r',n1(lerp(30,430,outC(seg(fo,2.05,2.6)))));wh.setAttribute('opacity',n3(.8*hump(seg(fo,2.05,2.9))));
  }else{bu.setAttribute('opacity','0');kn.setAttribute('opacity','0');wh.setAttribute('opacity','0');}
  // 좁혀 오는 고리(꿰어 붙들기 미니게임)
  const ring=q('.bk-ring');
  if(game&&!thrown&&!blind&&g.ringAt){const k=g.ringAt(t);
   if(k!=null){const r=16+160*Math.max(0,k);ring.setAttribute('cx',n1(spot[0]));ring.setAttribute('cy',n1(spot[1]));ring.setAttribute('r',n1(r));ring.setAttribute('opacity',n3(.95*clamp(1.2-Math.abs(k)*.4)));}
   else ring.setAttribute('opacity','0');}
  else ring.setAttribute('opacity','0');
  // 작살: 특수 작살이면 발사대에서, 없으면 손으로 · 망 개수에 따라 박히는 깊이
  const L=HL(),own=!!(L&&L.owned()),PC=L?L.pierce():{deep:0,pass:false,n:0};
  const hp=q('.bw-harpoon'),rope=q('.bw-rope');
  const hand=own?L.handFor(L.launch(el,tw,{loaded:!thrown}),30,-14):tw(thrown?[38,-24]:[33,-31]);
  const p0=[hand[0]+30,hand[1]-14],LIFT=46;
  const target=game&&g.target?g.target:spot;
  let pos=null,ang=0,show=0;
  if(!thrown){if(!own){pos=[hand[0]+20,hand[1]-14];ang=-30;show=1;}}
  else if(t<arrive){const u=(t-T0)/T4.fly,e=u*(.85+.15*u);pos=[p0[0]+(target[0]-p0[0])*e,p0[1]+(target[1]-p0[1])*e-4*LIFT*e*(1-e)];ang=Math.atan2((target[1]-p0[1])-4*LIFT*(1-2*e),target[0]-p0[0])/RAD;show=1;}
  else if(pinOK){
   const ea=Math.atan2((target[1]-p0[1])+4*LIFT,target[0]-p0[0])/RAD;
   if(PC.pass){const pa=L.passAngle(ea),dd=Math.min(10+since*L.PASS_SPEED,90);ang=pa;pos=[spot[0]+Math.cos(pa*RAD)*dd,spot[1]+Math.sin(pa*RAD)*dd];show=up>.05?1:0;} // 5망: 날개를 꿰뚫고 나가 밧줄로 걸림
   else{ang=ea;const dd=-8+PC.deep;pos=[spot[0]+Math.cos(ea*RAD)*dd,spot[1]+Math.sin(ea*RAD)*dd];show=up>.05?1:0;}
  }else{const s=t-arrive,ea=Math.atan2((target[1]-p0[1])+4*LIFT,target[0]-p0[0]);
   if(pinFail==='tear'&&s<.7){ang=ea/RAD;pos=[target[0]+Math.cos(ea)*4,target[1]+Math.sin(ea)*4+40*seg(s,.4,.7)];show=1;}   // 1~2망: 얕게 박혔다가 찢겨 나감
   else{const s2=pinFail==='tear'?s-.7:s,dir=pinFail==='bounce'?ea+Math.PI*.85:ea;pos=[target[0]+Math.cos(dir)*s2*420,target[1]+Math.sin(dir)*s2*420+320*s2*s2];ang=dir/RAD+s2*(pinFail?480:40);show=pos[1]<SEA+6?1:0;}}
  hp.setAttribute('opacity',String(show));
  if(pos)hp.setAttribute('transform','translate('+n1(pos[0])+' '+n1(pos[1])+') rotate('+n1(ang)+')');
  if(L){L.bury(hp,pinOK&&t>=HIT&&!PC.pass?8-PC.deep:null);
   L.paintHit(el,{s:t>=HIT?since:pinFail&&thrown&&t>=arrive?t-arrive:-1,p:target,ang:PC.pass?L.passAngle(ang):ang,tier:PC.n,through:110});}
  const tipEl=hp.querySelector('.bw-tip');if(tipEl)tipEl.style.opacity=pinOK&&t>=HIT&&!PC.pass?'0':'1';
  if(thrown&&pos&&show){const ar=ang*RAD,tail=[pos[0]-104*Math.cos(ar),pos[1]-104*Math.sin(ar)],an=tw(own&&L?L.anchorLocal():[40,-9]);
   const slack=t<arrive?36:pinOK?Math.max(2,26*Math.exp(-since*2))+Math.sin(t*2.4)*2:40;
   rope.setAttribute('d','M'+n1(an[0])+','+n1(an[1])+' Q'+n1((an[0]+tail[0])/2)+','+n1((an[1]+tail[1])/2+slack)+' '+n1(tail[0])+','+n1(tail[1]));
   rope.setAttribute('opacity','.85');}
  else rope.setAttribute('opacity','0');
  if(!S4._sp)S4._sp=dropParams(44,51,-160,-20,110,300);
  const cyc=game&&g.cycles?g.cycles.filter(c=>c.start<=t).slice(-1)[0]:null;
  const ds=game?(cyc?t-cyc.start:-1):t-T4.rise;
  paintDrops(qa('.bk-splash circle'),S4._sp,fp.x-20,WP[1]-6,ds,90,420);
  if(!game)caption(el,S4.caps,t);
  veil(el,tr<.6?1-tr/.6:0);
 }};

/* =================== 미니게임 화면 =================== */
const LAMPCAP=['어둠이 수평선에서 밀려옵니다. 그것이 등불에 닿는 순간 덮개를 덮으십시오.','어둠이 다시 밀려옵니다. 닿는 순간 덮으십시오.','별이 꺼지며 다가옵니다. 등불을 지키십시오.','마지막 어둠입니다. 등불을 지키십시오.'];
const GAMECAP=['','두 날개 사이의 별빛 아래에 배를 두십시오.','별이 꺼지는 맨 앞자리를 누르십시오. 비춘 자리는 별 지도로 남습니다.','어둠이 고동칠 때 등불을 흔들어 밀어내십시오.','날개 끝이 등불에 젖어 오르는 순간 망을 감은 작살로 꿰어 붙드십시오.'];
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
 const u=hud(el),ph=g.phase;
 const verdict=g.flash&&t-g.flash.at<1.1?g.flash:null;
 setVerdict(u.verdict,verdict?verdict.text:'',verdict&&verdict.good?'good':'bad');
 setTxt(u.hint,g.done||g.locked?'':g.blind?'등불이 꺼져 갑니다 · 날개 끝이 어디 있는지 보이지 않습니다':
  ph==='wrap'?(t<g.closeAt-.8?'감싸여 옵니다 · 기억한 별 자리가 하나씩 닫힙니다 · 마지막 이음매가 닫히는 순간 누르십시오':'지금 · 등불을 엽니다'):
  ph==='pin'&&g.thrownAt==null?'좁혀 오는 고리가 날개 끝에 닿는 순간 누르십시오 (작살로 꿰어 붙든다)':'');
 u.hint.classList.toggle('now',ph==='wrap'?Math.abs(t-g.closeAt)<(g.openWin||.25):!!(g.ringAt&&g.ringAt(t)!=null&&Math.abs(g.ringAt(t))<.12));
 caption(el,[[0,ph==='fold'?'그것이 빛마저 감싸려 듭니다. 제 안쪽까지 감싸다 뒤집혀 접힙니다.':ph==='wrap'||ph==='recoil'?'붙들린 그것이 배를 감싸 옵니다. 마지막 이음매가 닫히는 순간 등불을 여십시오.':GAMECAP[4]]],0);
}
/* ---------- HUD 도우미 ---------- */
function hud(el){const {q}=cacheQ(el);return {hint:q('.bkg-hint'),verdict:q('.bkg-verdict'),pips:q('.bkg-pips'),count:q('.bkg-count'),bar:q('.bkg-bar'),time:q('.bkg-time')};}
function setTxt(n,t){if(n&&n.textContent!==t)n.textContent=t;}
function setVerdict(n,t,cls){if(!n)return;setTxt(n,t);const c='bkg-verdict'+(t?' on '+(cls||''):'');if(n.className!==c)n.className=c;}
function pips(n,rec){if(!n)return;const key=rec.join(',');if(n.dataset.k===key)return;n.dataset.k=key;let h='';for(let i=0;i<4;i++)h+='<i class="'+(rec[i]==='kept'?'good':rec[i]?'bad':'')+'"></i>';n.innerHTML=h;}
function count(u,txt){setTxt(u.count,txt);}
function bar(u,fill,time,hot){if(u.bar){u.bar.firstChild.style.width=n1(clamp(fill)*100)+'%';u.bar.classList.toggle('hot',!!hot);}if(u.time)u.time.firstChild.style.width=n1(clamp(time)*100)+'%';}

/* =================== v0.2.4 · 유인 → 관측 → 고정 → 토벌 ===================
   그것은 온순하다. 작은 것을 보면 날개로 감싸 보호하지만, 감싸인 것들은 인어가 된다.
   몸 전체가 어둠에 덮여 보이지 않는다. 토벌하려면 날개를 접지 못하게 해야 한다.
   2단계 유인: 고래가 지나가는 길목에 작은 등불 뗏목(미끼)을 던져 날개를 펼치게 함
   3단계 관측: 물밑으로 뻗는 두 날개 끝이 지나가며 흔드는 부표를 보고, 날개 끝이 멈춘 부표를 짚음
   4단계 고정: 짚어 둔 두 부표의 공명 굽쇠를 날개가 다 펼쳐진 순간 울려 날개를 펼친 채 묶음
   5단계 토벌: 접지 못한 날개 사이, 아무것도 없는 곳으로 작살 */
const PS=y=>clamp(.4+.6*(y-SEA)/170,.3,1.2);
const BODYW=[480,SEA+84];   // 물밑에서 날개를 편 몸의 한가운데(작살이 박히는 자리)
function jolt(g,t){return .5+(g.joltAt!=null?1.2*Math.exp(-Math.max(0,t-g.joltAt)*2.2):0);}           // 수면 위 y → 원근 크기
const BUOYS=[[118,SEA+50],[252,SEA+98],[360,SEA+38],[640,SEA+44],[808,SEA+92]];   // 다섯 개: 왼쪽 셋(0~2) · 오른쪽 둘(3~4)
const BSC=i=>PS(BUOYS[i][1])*1.5;   // 부표 그림 크기
const DECOY_AT=[480,SEA+64],LURE_BOAT=150;
const BUOY_BODY='M-13,6 C-14,-8 -12,-26 -9,-34 C-6,-40 6,-40 9,-34 C12,-26 14,-8 13,6 Z';
const FORK='M-1.4,0 L1.4,0 L1.4,-9 C1.4,-12 3.2,-13 4.2,-13.6 L5.4,-46 C5.4,-47.4 3.4,-47.4 3.3,-46 L2.6,-16.4 C1.6,-15.2 -1.6,-15.2 -2.6,-16.4 L-3.3,-46 C-3.4,-47.4 -5.4,-47.4 -5.4,-46 L-4.2,-13.6 C-3.2,-13 -1.4,-12 -1.4,-9 Z';
function v24Defs(){
 return ''+
 '<linearGradient id="bkWood" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7a5634"/><stop offset=".45" stop-color="#4a3018"/><stop offset="1" stop-color="#1e120a"/></linearGradient>'+
 '<radialGradient id="bkLan" cx=".45" cy=".55" r=".6"><stop stop-color="#fff8e0"/><stop offset=".35" stop-color="#ffd27a"/><stop offset=".75" stop-color="#d0782a"/><stop offset="1" stop-color="#6a300e"/></radialGradient>'+
 '<radialGradient id="bkDcPool"><stop stop-color="#ffcf7a" stop-opacity=".42"/><stop offset=".5" stop-color="#c88a3a" stop-opacity=".12"/><stop offset="1" stop-color="#c88a3a" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="bkBuoyShade" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#000" stop-opacity=".62"/><stop offset=".3" stop-color="#000" stop-opacity=".08"/><stop offset=".42" stop-color="#fff" stop-opacity=".2"/><stop offset=".52" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></linearGradient>'+
 '<linearGradient id="bkBuoyTop" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>'+
 '<clipPath id="bkBuoyClip"><path d="'+BUOY_BODY+'"/></clipPath>'+
 '<linearGradient id="bkFork" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#2e3842"/><stop offset=".35" stop-color="#e4edf2"/><stop offset=".55" stop-color="#9aa8b4"/><stop offset="1" stop-color="#232b33"/></linearGradient>'+
 '<radialGradient id="bkReso"><stop offset=".55" stop-color="#cfe6ff" stop-opacity="0"/><stop offset=".8" stop-color="#d8ecff" stop-opacity=".45"/><stop offset=".9" stop-color="#f4faff" stop-opacity=".8"/><stop offset="1" stop-color="#cfe6ff" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bkResoCore"><stop stop-color="#f4faff" stop-opacity=".9"/><stop offset=".3" stop-color="#cfe6ff" stop-opacity=".4"/><stop offset="1" stop-color="#9fc8ee" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bkMark"><stop offset=".55" stop-color="#ffcf7a" stop-opacity="0"/><stop offset=".82" stop-color="#ffe2a8" stop-opacity=".7"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>'+
 ['LitLw','LitRw'].map(id=>'<radialGradient id="bk'+id+'" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="300"><stop stop-color="#ffe0a0" stop-opacity=".9"/><stop offset=".4" stop-color="#c8904a" stop-opacity=".3"/><stop offset="1" stop-color="#c8904a" stop-opacity="0"/></radialGradient>').join('')+
 ['LitLc','LitRc'].map(id=>'<radialGradient id="bk'+id+'" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="300"><stop stop-color="#eef7ff" stop-opacity=".95"/><stop offset=".4" stop-color="#9fd0ff" stop-opacity=".35"/><stop offset="1" stop-color="#9fd0ff" stop-opacity="0"/></radialGradient>').join('')+
 (window.FxNoise?FxNoise.pattern('bkSkinPat','bkskin',{cell:22,oct:3,rgb:[22,34,48],lo:.52,hi:.86,stretch:[1,2.2],seed:13},200,200):'')+
 '<filter id="bkPatchF" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="80"/></filter>';
}
/* 날개(v0.2.4): 빛을 거의 돌려주지 않는 검정 위에 젖은 앞전 윤기 · 말린 뒷전 그늘 · 흘러내리는 물 막 · 빛이 닿는 가장자리 */
function wing2(cls,lit){
 let sh='';for(let i=0;i<7;i++)sh+='<ellipse class="bk-sh" data-i="'+i+'" rx="3" ry="10" fill="url(#bkSheet)" opacity="0"/>';
 return '<g class="'+cls+'" transform="translate(-9999 0)"><g clip-path="url(#bkWingCut)"><path d="'+WING+'" fill="#000"/>'+
  '<g clip-path="url(#bkWingClip)"><rect x="-240" y="-460" width="400" height="490" fill="url(#bkSkinPat)" opacity=".5"/></g>'+
  '<path d="'+RIDGE+'" fill="url(#bkRidgeG)" opacity=".2"/><path d="'+HEM+'" fill="#000" opacity=".7"/>'+
  '<path class="bk-rl" d="'+WING+'" fill="none" stroke="url(#bk'+lit+')" stroke-width="18" stroke-opacity=".55" stroke-linejoin="round" opacity="0"/><path class="bk-rl3" d="'+WING+'" fill="none" stroke="url(#bk'+lit+')" stroke-width="6" opacity="0"/>'+
  '<path class="bk-rl2" d="'+WING+'" fill="url(#bk'+lit+')" opacity="0"/>'+sh+'</g></g>';
}
function litWing(el,cls,gid,B,at,k){
 const w=cacheQ(el).q('.'+cls);if(!w)return;
 const a=w.querySelector('.bk-rl'),b=w.querySelector('.bk-rl2');if(!a)return;
 w.__lit=null;
 if(at&&k>0){const sx0=(B.flip?-1:1)*B.ws,c0=Math.cos(-B.rot*RAD),s0=Math.sin(-B.rot*RAD),dx0=at[0]-B.x,dy0=at[1]-B.y,cold=/c$/.test(gid);   // 셰이더 날개용 빛(날개 좌표)
  w.__lit={at:[(dx0*c0-dy0*s0)/sx0,(dx0*s0+dy0*c0)/B.ws],k:clamp(k),r:240/B.ws,c:cold?[.85,.93,1]:[1,.84,.58]};}
 if(!at||k<=0){a.setAttribute('opacity','0');b.setAttribute('opacity','0');const c3=w.querySelector('.bk-rl3');if(c3)c3.setAttribute('opacity','0');return;}
 const sx=(B.flip?-1:1)*B.ws,c=Math.cos(-B.rot*RAD),sn=Math.sin(-B.rot*RAD),dx=at[0]-B.x,dy=at[1]-B.y;
 const g=el.querySelector('#'+gid);g.setAttribute('cx',n1((dx*c-dy*sn)/sx));g.setAttribute('cy',n1((dx*sn+dy*c)/B.ws));g.setAttribute('r',n1(240/B.ws));
 a.setAttribute('opacity',n3(clamp(k)));b.setAttribute('opacity',n3(.22*clamp(k)));const c3=w.querySelector('.bk-rl3');if(c3)c3.setAttribute('opacity',n3(.8*clamp(k)));
}
/* 작은 등불 뗏목(미끼): 세 장 판자 · 묶은 줄 · 대나무 막대 끝의 종이 등 */
function decoyBody(){
 return '<path d="M-18,0 L18,0 L15.5,4 L-15.5,4 Z" fill="#120a04"/>'+
  '<rect x="-18" y="-4.4" width="36" height="5" rx="2" fill="url(#bkWood)"/>'+
  '<path d="M-6,-4.2 L-6,0.4 M6,-4.2 L6,0.4" stroke="#140c06" stroke-width=".7"/>'+
  '<path d="M-17,-3.6 Q0,-4.4 17,-3.6" stroke="#b08a5a" stroke-width=".5" fill="none" opacity=".5"/>'+
  '<path d="M-12,-4.8 L-12,1 M12,-4.8 L12,1" stroke="#c8a878" stroke-width="1.3"/>'+
  '<path d="M-12.6,-2 L-11.4,-1 M11.4,-2 L12.6,-1" stroke="#8a6a44" stroke-width=".6"/>'+
  '<path d="M2,-4.2 Q1.6,-10 2.2,-16" stroke="#7a5a32" stroke-width="1.5" fill="none"/>'+
  '<path d="M2,-29 C-4,-28 -4.6,-17.4 2,-16.4 C8.6,-17.4 8,-28 2,-29 Z" fill="url(#bkLan)"/>'+
  '<path d="M-2.2,-26 Q2,-25 6.2,-26 M-3.2,-22.6 Q2,-21.6 7.2,-22.6 M-2.8,-19.4 Q2,-18.6 6.8,-19.4" stroke="#8a4a1a" stroke-width=".55" fill="none" opacity=".55"/>'+
  '<rect x="0" y="-30.4" width="4" height="2.2" rx=".6" fill="#2a1a0c"/><rect x=".5" y="-17" width="3" height="1.4" fill="#2a1a0c"/>'+
  '<path d="M2,-30.4 L2,-33" stroke="#2a1a0c" stroke-width=".8"/>';
}
function decoyMarkup(){
 let rp='';for(let i=0;i<3;i++)rp+='<ellipse class="dc-rp" data-i="'+i+'" rx="1" ry="1" fill="url(#bkRipple)" opacity="0"/>';
 return '<g class="bk-decoy" opacity="0">'+rp+
  '<ellipse class="dc-pool" rx="64" ry="10" fill="url(#bkDcPool)"/>'+
  '<g class="dc-ref" opacity=".32"><g transform="scale(1 -.5)">'+decoyBody()+'</g></g>'+
  '<g class="dc-b">'+decoyBody()+'<circle class="dc-gl" cx="2" cy="-22.5" r="18" fill="url(#bkGlow)" opacity=".75"/></g></g>'+
  drops('bk-dsp',22,83,'#dbe8f2');
}
/* 부표: 녹슨 붉은 몸통 · 흰 띠 · 꼭대기 등(또는 공명 굽쇠) · 물결 · 비친 그림자 */
function buoyBody(){
 return '<path d="'+BUOY_BODY+'" fill="#9c2e26"/>'+
  '<g clip-path="url(#bkBuoyClip)"><rect x="-16" y="-25" width="32" height="8.5" fill="#d6cfbf"/><rect x="-16" y="-8" width="32" height="4.6" fill="#cfc6b4" opacity=".9"/>'+
   '<rect x="-16" y="-42" width="32" height="50" fill="#5a2a1a" opacity=".5" filter="url(#bkSkinD)"/>'+
   '<rect x="-16" y="-42" width="32" height="50" fill="url(#bkBuoyShade)"/><rect x="-16" y="-42" width="32" height="50" fill="url(#bkBuoyTop)"/>'+
   '<path d="M-9,-30 Q-7,-18 -9,-2 M4,-33 Q6,-20 3,-4" stroke="#3a120c" stroke-width=".7" opacity=".5" fill="none"/></g>'+
  '<rect x="-4.5" y="-44" width="9" height="5" rx="1.6" fill="#2a2420"/><rect x="-4.5" y="-44" width="9" height="1.4" fill="#6a625a" opacity=".6"/>'+
  '<path d="M0,-44 L0,-60" stroke="#3a3430" stroke-width="2.2"/>';
}
function forkMarkup(){
 let w='';for(let i=0;i<3;i++)w+='<ellipse class="fk-w" data-i="'+i+'" rx="1" ry="1" fill="url(#bkReso)" opacity="0"/>';
 return '<g class="by-fk" opacity="0">'+w+'<circle class="fk-core" cy="-90" r="1" fill="url(#bkResoCore)" opacity="0"/>'+
  '<g transform="translate(0 -60)"><rect x="-3" y="-2" width="6" height="4" rx="1" fill="#4a525a"/>'+
  '<path class="fk-gl" d="'+FORK+'" fill="none" stroke="#cfe6ff" stroke-width="4" filter="url(#bkB3)" opacity="0"/>'+
  '<path class="fk-a" d="'+FORK+'" fill="url(#bkFork)"/><path class="fk-b" d="'+FORK+'" fill="url(#bkFork)" opacity="0"/></g></g>';
}
function buoyMarkup(i){
 let rp='';for(let k=0;k<2;k++)rp+='<ellipse class="by-rp" data-k="'+k+'" rx="1" ry="1" fill="url(#bkRipple)" opacity="0"/>';
 return '<g class="bk-buoy" data-i="'+i+'">'+rp+
  '<ellipse class="by-pool" cy="4" rx="60" ry="10" fill="url(#bkDcPool)" opacity=".7"/>'+
  '<ellipse class="by-sw" rx="46" ry="8" fill="url(#bkSwell)" opacity="0"/>'+
  '<ellipse class="by-mk" cy="-26" rx="1" ry="1" fill="url(#bkMark)" opacity="0"/>'+
  '<ellipse class="by-pil" rx="1" ry="1" fill="url(#bkByPil)" opacity="0"/>'+
  '<g class="by-ref" opacity=".3"><g transform="scale(1 -.55)">'+buoyBody()+'</g></g>'+
  '<g class="by-b"><ellipse class="by-halo" cy="-34" rx="44" ry="50" fill="url(#bkByHalo)" opacity=".6"/>'+buoyBody()+
   '<path class="by-rim" d="'+BUOY_BODY+'" fill="none" stroke="#ffd98e" stroke-width="1.6" stroke-linejoin="round" opacity=".55"/>'+
   '<path class="by-band" d="M-12,-21 L12,-21" stroke="#fff2c8" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>'+
   '<g class="by-lamp"><path d="M-4,-60 L-3,-69 L3,-69 L4,-60" fill="none" stroke="#4a443e" stroke-width="1.2"/><circle class="by-gl" cy="-64.5" r="46" fill="url(#bkGlow)" opacity=".5"/><circle class="by-lt" cy="-64.5" r="3.2" fill="#fff4d0"/>'+
    '<g class="by-star" transform="translate(0 -64.5)" opacity="0"><path d="M-26,0 L26,0 M0,-18 L0,18" stroke="#fff6dc" stroke-width="1.3" stroke-linecap="round"/><path d="M-9,-9 L9,9 M-9,9 L9,-9" stroke="#ffe8b0" stroke-width=".8" stroke-linecap="round"/><circle r="6" fill="#fffaf0"/></g></g>'+
   forkMarkup()+'</g>'+
  '<ellipse rx="16" ry="3.2" fill="#03070c" opacity=".85"/><ellipse class="by-foam" cy="1" rx="20" ry="3.2" fill="url(#bkFoam)"/></g>';
}
function buoysMarkup(){return '<g class="bk-buoys">'+BUOYS.map((b,i)=>i).sort((a,b)=>BUOYS[a][1]-BUOYS[b][1]).map(buoyMarkup).join('')+'</g>';}
function patchMarkup(){
 return '<g class="bk-patch" opacity="0"><path d="'+MANTA+'" fill="none" stroke="#a8c0d4" stroke-width="120" stroke-opacity=".05"/>'+[1.12,1.04,.96,.88,.8].map((k,i)=>'<path d="'+MANTA+'" fill="#010206" opacity="'+[.22,.3,.4,.6,1][i]+'" transform="scale('+k+')"/>').join('')+'</g>';
}
function threadMarkup(){return '<path class="fk-thg" fill="none" stroke="#9fd0ff" stroke-width="10" stroke-opacity=".3" stroke-linecap="round" opacity="0"/><path class="fk-th" fill="none" stroke="#eef7ff" stroke-width="1.5" stroke-linecap="round" opacity="0"/>';}
function tipShadows(){return '<ellipse class="bk-tip" data-s="L" rx="1" ry="1" fill="url(#bkSwell)" opacity="0"/><ellipse class="bk-tip" data-s="R" rx="1" ry="1" fill="url(#bkSwell)" opacity="0"/>';}

/* ---------- 공유 기하(게임 판정도 같은 함수를 씀) ---------- */
// 고래(보이지 않는 몸): W={lane,dir,x0,t0,v,stopAt,spreadAt,diveAt}
function whaleAt(Wh,t){
 if(!Wh||t<Wh.t0)return null;
 const tm=Wh.stopAt!=null?Math.min(t,Wh.stopAt):t;
 let ease=1;if(Wh.stopAt!=null&&t>Wh.stopAt-.9)ease=1;
 const x=Wh.x0+Wh.dir*Wh.v*(tm-Wh.t0);
 let op=clamp((t-Wh.t0)/1.2);
 if(Wh.diveAt!=null)op*=1-seg(t,Wh.diveAt,Wh.diveAt+1);
 if(Wh.spreadAt!=null)op*=1-.85*seg(t,Wh.spreadAt+.2,Wh.spreadAt+1.4);
 return {x,y:Wh.lane,sc:PS(Wh.lane),dir:Wh.dir,op,moving:Wh.stopAt==null||t<Wh.stopAt,ease};
}
// 물밑 날개 끝 경로: P={pts:[[x,y]..],ts:[..]}
function tipAt(P,t){
 if(!P)return null;const {pts,ts}=P;
 if(t<=ts[0])return {p:pts[0].slice(),v:[0,0],rest:false,before:true};
 for(let i=1;i<pts.length;i++){if(t<=ts[i]){const u=(t-ts[i-1])/(ts[i]-ts[i-1]),e=u*u*(3-2*u),a=pts[i-1],b=pts[i];
   const sp=6*u*(1-u)/(ts[i]-ts[i-1]);return {p:[lerp(a[0],b[0],e),lerp(a[1],b[1],e)],v:[(b[0]-a[0])*sp,(b[1]-a[1])*sp],rest:false};}}
 return {p:pts[pts.length-1].slice(),v:[0,0],rest:true};
}
function decoyPos(D,t){
 if(!D||t<D.at)return null;
 if(t<D.land){const u=(t-D.at)/(D.land-D.at),h=70;return {x:lerp(D.from[0],D.to[0],u),y:lerp(D.from[1],D.to[1],u)-4*h*u*(1-u),s:1.5*lerp(.55,PS(D.to[1]),u),fly:true,spin:u*300};}
 return {x:D.to[0],y:D.to[1],s:1.5*PS(D.to[1]),fly:false,since:t-D.land};
}
/* 날개 자리: 부표 i 위에서 솟는 날개(왼쪽 = 뒤집지 않음, 끝이 안쪽으로 말림) */
function wingBase(i,side,rise,fold){
 const b=BUOYS[i],sc=PS(b[1]),ws=.82*sc,sg=side==='L'?1:-1,f=fold||0;
 const x=b[0]-sg*128*ws+sg*170*sc*inOut(clamp(f*1.2)),y=b[1]+6+470*ws*(1-rise)+90*sc*inC(seg(f,.55,1));
 const rot=sg*(4+58*inOut(clamp(f)));
 return {x,y,rot,ws,flip:side==='R'};
}
function wingTipOf(B){return wingPoint(B.x,B.y,B.rot,B.ws,B.flip);}
function forkTop(i,t,extra){const b=BUOYS[i],sc=BSC(i),e=extra||{};return [b[0]+Math.sin((e.tilt||0)*RAD)*90*sc,b[1]+(e.dy||0)*sc*.5-92*sc];}

/* ---------- 칠하기 도우미 ---------- */
function paintDecoy(el,D,t,opt){
 const {q,qa}=cacheQ(el),g=q('.bk-decoy');if(!g)return;
 const p=decoyPos(D,t),o=opt||{};
 if(!p){g.setAttribute('opacity','0');return;}
 const s=p.s,dim=o.dim||0,bob=p.fly?0:Math.sin(t*2.2)*1.4*s,tilt=p.fly?p.spin*.2:Math.sin(t*1.7+1)*4;
 const body=g.querySelector('.dc-b'),ref=g.querySelector('.dc-ref'),pool=g.querySelector('.dc-pool'),gl=g.querySelector('.dc-gl');
 body.setAttribute('transform','translate('+n1(p.x)+' '+n1(p.y+bob)+') rotate('+n1(tilt)+') scale('+n3(s)+')');
 ref.setAttribute('transform','translate('+n1(p.x)+' '+n1(p.y+2)+') rotate('+n1(-tilt)+') scale('+n3(s)+')');
 ref.setAttribute('opacity',p.fly?'0':n3(.32*(1-dim)));
 pool.setAttribute('cx',n1(p.x));pool.setAttribute('cy',n1(p.y+3));pool.setAttribute('rx',n1(64*s));pool.setAttribute('ry',n1(10*s));pool.setAttribute('opacity',p.fly?'0':n3((.9+.1*Math.sin(t*9))*(1-dim)));
 gl.setAttribute('opacity',n3((.7+.08*Math.sin(t*11)+.06*Math.sin(t*17))*(1-dim*.9)));
 g.setAttribute('opacity','1');
 qa('.dc-rp').forEach(e=>{const i=+e.dataset.i;if(p.fly){e.setAttribute('opacity','0');return;}const a=((p.since*.45+i/3)%1),k=p.since<1.2?1.6:.6;
  e.setAttribute('cx',n1(p.x));e.setAttribute('cy',n1(p.y+2));e.setAttribute('rx',n1((20+a*90)*s));e.setAttribute('ry',n1((3+a*12)*s));e.setAttribute('opacity',n3(Math.min(1,k*(1-a)*.7)));});
 if(!paintDecoy._sp)paintDecoy._sp=dropParams(22,83,-160,-20,60,190);
 paintDrops(qa('.bk-dsp circle'),paintDecoy._sp,p.x,Math.min(p.y,SEA+2),p.fly?-1:p.since,10*s,380);
}
/* 부표: 바람에 흔들림 + 물밑 날개 끝이 지나가면 끌려 기울고 잠김 */
function buoyState(i,t,tips){
 const b=BUOYS[i],ps=PS(b[1]),sc=ps*1.5;
 let k=0,vx=0,rest=0;
 (tips||[]).forEach(T=>{if(!T)return;const dx=(T.p[0]-b[0])/(60*ps),dy=(T.p[1]-b[1])/(34*ps),w=Math.exp(-(dx*dx+dy*dy));
  k+=w;vx+=w*Math.max(-1,Math.min(1,T.v[0]/120));if(T.rest)rest=Math.max(rest,w);});
 k=Math.min(1.2,k);
 const wind=4.5*Math.sin(t*1.25+i*1.7)+2.6*Math.sin(t*2.7+i*.9),bob=1.6*Math.sin(t*1.9+i*2.3)+1*Math.sin(t*3.1+i);
 const dip=k*10+rest*(5+2*Math.sin(t*2.4+i));
 const tilt=wind*(1-.6*Math.min(1,k))+vx*24+rest*(9*Math.sin(t*1.6+i)+(BUOYS[i][0]<480?8:-8));
 return {sc,k,rest,dy:bob+dip,tilt};
}
function paintBuoys(el,t,tips,opt){
 const {qa}=cacheQ(el),o=opt||{};
 qa('.bk-buoy').forEach(g=>{
  const i=+g.dataset.i,b=BUOYS[i],S=buoyState(i,t,tips),sc=S.sc;
  const by=b[1]+S.dy*sc*.35;
  const body=g.querySelector('.by-b'),ref=g.querySelector('.by-ref');
  body.setAttribute('transform','translate('+n1(b[0])+' '+n1(by)+') scale('+n3(sc)+') rotate('+n1(S.tilt)+')');
  ref.setAttribute('transform','translate('+n1(b[0])+' '+n1(b[1]+2)+') scale('+n3(sc)+') rotate('+n1(-S.tilt*.8)+')');
  ref.setAttribute('opacity',n3(.3*(1-.5*Math.min(1,S.k))));
  const sw=g.querySelector('.by-sw');sw.setAttribute('cx',n1(b[0]));sw.setAttribute('cy',n1(b[1]+3));sw.setAttribute('rx',n1(46*sc*(1+.3*S.k)));sw.setAttribute('ry',n1(8*sc));sw.setAttribute('opacity',n3(Math.min(.8,.7*S.k)));
  const fo=g.querySelector('.by-foam');fo.setAttribute('cx',n1(b[0]));fo.setAttribute('cy',n1(b[1]+1));fo.setAttribute('rx',n1(20*sc*(1+.6*S.k)));fo.setAttribute('ry',n1(3.2*sc));fo.setAttribute('opacity',n3(.5+.5*Math.min(1,S.k)));
  g.querySelectorAll('.by-rp').forEach(e=>{const kk=+e.dataset.k,a=((t*(.35+.5*S.k)+kk*.5+i*.13)%1);
   e.setAttribute('cx',n1(b[0]));e.setAttribute('cy',n1(b[1]+2));e.setAttribute('rx',n1((18+a*(50+60*S.k))*sc));e.setAttribute('ry',n1((3+a*(8+8*S.k))*sc));e.setAttribute('opacity',n3((1-a)*(.25+.65*Math.min(1,S.k))));});
  const lt=g.querySelector('.by-lt'),gl=g.querySelector('.by-gl'),blink=.55+.45*Math.max(0,Math.sin(t*2.6+i*1.3)),sub=1-.7*Math.min(1,S.k);
  const LK=o.lit?(o.lit[i]||0):1;                           // 관측 단계: 켜진 부표만 1, 나머지는 등이 꺼짐
  const sub2=Math.max(.55,sub)*LK,flare=o.lit?LK*(.35+.65*Math.pow(Math.max(0,Math.sin(t*5.2+i)),6)):Math.pow(Math.max(0,Math.sin(t*1.6+i*2.1)),14);   // 켜진 등은 빠르게 번쩍임
  lt.setAttribute('opacity',n3(o.lit?.12+.88*LK:.75+.25*blink*sub2));lt.setAttribute('fill',o.lit&&LK<.05?'#3a342c':'#fff4d0');
  gl.setAttribute('opacity',n3(o.lit?LK*(.8+.2*blink):Math.min(1,(.6+.3*blink)*sub2+.15+.4*flare)));gl.setAttribute('r',o.lit&&LK?'58':'46');
  const star=g.querySelector('.by-star');if(star){star.setAttribute('opacity',n3(flare*sub2));star.setAttribute('transform','translate(0 -64.5) scale('+n3(.6+.6*flare)+') rotate('+n1(t*20+i*30)+')');}
  const halo=g.querySelector('.by-halo');if(halo)halo.setAttribute('opacity',n3((.45+.25*blink+.3*flare)*sub2));
  const rim=g.querySelector('.by-rim');if(rim)rim.setAttribute('opacity',n3(o.lit?.16+.6*LK:(.4+.3*blink+.3*flare)*sub2));
  const pil=g.querySelector('.by-pil');if(pil){pil.setAttribute('cx',n1(b[0]+Math.sin(t*2+i)*2*sc));pil.setAttribute('cy',n1(b[1]+22*sc));pil.setAttribute('rx',n1(10*sc*(1+.3*flare)));pil.setAttribute('ry',n1(34*sc));pil.setAttribute('opacity',n3((.5+.3*blink+.2*flare)*sub2));}
  const pl=g.querySelector('.by-pool');if(pl){pl.setAttribute('cx',n1(b[0]));pl.setAttribute('cy',n1(b[1]+3));pl.setAttribute('rx',n1(70*sc));pl.setAttribute('ry',n1(12*sc));pl.setAttribute('opacity',n3((.45+.35*blink)*sub*(o.lit?LK:1)));}
  const fk=o.forks&&o.forks[i];
  g.querySelector('.by-lamp').setAttribute('opacity',fk?'0':'1');
  g.querySelector('.by-fk').setAttribute('opacity',fk?'1':'0');
  const mk=g.querySelector('.by-mk'),m=o.marks&&o.marks[i];
  if(m){const r=(26+4*Math.sin(t*5))*sc;mk.setAttribute('cx',n1(b[0]));mk.setAttribute('cy',n1(by-26*sc));mk.setAttribute('rx',n1(r*1.1));mk.setAttribute('ry',n1(r*1.35));mk.setAttribute('opacity',n3(m.k==null?.85:m.k));mk.setAttribute('fill',m.bad?'url(#bkRipple)':'url(#bkMark)');}
  else mk.setAttribute('opacity','0');
  g._st=S;g._by=by;
 });
}
/* 공명 굽쇠: 좁혀 오는 고리(울릴 때) · 떨리는 갈래 · 퍼지는 울림 · 날개 끝까지 이어지는 공명의 실 */
function paintFork(el,i,t,F){
 const g=el.querySelector('.bk-buoy[data-i="'+i+'"]');if(!g)return null;
 const fk=g.querySelector('.by-fk'),a=fk.querySelector('.fk-a'),b=fk.querySelector('.fk-b'),gl=fk.querySelector('.fk-gl'),core=fk.querySelector('.fk-core');
 const ring=F.ringAt!=null?t-F.ringAt:-1,on=F.pinned||ring>=0&&ring<1.4;
 const amp=F.pinned?.9+.3*Math.sin(t*3):ring>=0?Math.max(0,1.2*(1-ring/1.4)):0;
 const jit=amp>0?(Math.sin(t*95)>0?1:-1)*.7*amp:0;
 a.setAttribute('transform','translate('+n1(jit)+' 0)');b.setAttribute('transform','translate('+n1(-jit)+' 0)');b.setAttribute('opacity',n3(.55*Math.min(1,amp)));
 gl.setAttribute('opacity',n3(Math.min(1,amp)*(.6+.3*Math.sin(t*40))));
 core.setAttribute('r',n1(30*Math.min(1,amp)+8));core.setAttribute('opacity',n3(.8*Math.min(1,amp)));
 fk.querySelectorAll('.fk-w').forEach(e=>{const k=+e.dataset.i,ph=on?((t*(F.pinned?1.1:1.6)+k/3)%1):0;
  e.setAttribute("cy","-90");e.setAttribute('rx',n1(10+ph*110));e.setAttribute('ry',n1(6+ph*60));e.setAttribute('opacity',n3(on?(1-ph)*.8*Math.min(1,amp+.2):0));});
 return amp;
}
function paintApproach(el,cls,c,k,s){
 const r=el.querySelector('.'+cls);if(!r)return;
 if(k==null){r.setAttribute('opacity','0');return;}
 r.setAttribute('cx',n1(c[0]));r.setAttribute('cy',n1(c[1]));r.setAttribute('r',n1((16+170*Math.max(0,k))*s));r.setAttribute('opacity',n3(.95*clamp(1.25-Math.abs(k)*.5)));
}
function paintThread(el,side,from,to,k,t){
 const {q}=cacheQ(el),a=q('.bk-th'+side+' .fk-th'),b=q('.bk-th'+side+' .fk-thg');if(!a)return;
 if(!k||!to){a.setAttribute('opacity','0');b.setAttribute('opacity','0');return;}
 const mx=(from[0]+to[0])/2+Math.sin(t*31)*3*k,my=(from[1]+to[1])/2-30+Math.sin(t*23+1)*4*k;
 const d='M'+n1(from[0])+','+n1(from[1])+' Q'+n1(mx)+','+n1(my)+' '+n1(to[0])+','+n1(to[1]);
 a.setAttribute('d',d);b.setAttribute('d',d);a.setAttribute('opacity',n3(k*(.75+.25*Math.sin(t*47))));b.setAttribute('opacity',n3(.55*k));
}
function hideWing(el,cls){const w=cacheQ(el).q('.'+cls);if(w)w.setAttribute('transform','translate(-9999 0)');const r=cacheQ(el).q('.'+cls+'R');if(r)r.setAttribute('transform','translate(-9999 0)');}
const set=(n,t)=>{if(n&&n.textContent!==t)n.textContent=t;};
const now2=(u,txt,now)=>{if(!u.hint)return;set(u.hint,txt);u.hint.classList.toggle('now',!!now);};
function verdictOf(u,g,t,dur){const f=g.flash&&t-g.flash.at<(dur||1)?g.flash:null;setVerdict(u.verdict,f?f.text:'',f&&f.good?'good':'bad');}

/* ---------- 2단계 · 유인 ---------- */
const CAP24=['','고래가 지나가는 길목에 작은 등불 뗏목을 던지십시오. 작은 것을 보면 날개를 펼칩니다.','부표의 움직임으로 물밑 날개 끝을 읽으십시오. 날개 끝이 멈추면 그 부표의 등이 켜집니다. 등이 켜진 부표를 짚으십시오.','날개가 다 펼쳐지는 순간 양쪽 공명 굽쇠를 울리십시오.','접지 못한 날개 사이, 두 굽쇠의 울림이 몸 한가운데에서 만나는 순간 작살을 던지십시오.'];
function lureBuild(){
 return night()+patchMarkup()+wakeMarkup('bk-wkP')+wingRef('bk-wLR')+wingRef('bk-wRR')+wakeMarkup('bk-wkL')+wakeMarkup('bk-wkR')+
  K.nearMist()+boatMarkup()+decoyMarkup()+wing2('bk-wL','LitLw')+wing2('bk-wR','LitRw')+drops('bk-drL',24,61,'#dbe8f2')+drops('bk-drR',24,67,'#dbe8f2')+
  '<g class="bk-zone" opacity="0"><ellipse class="bz-a" fill="url(#bkDcPool)"/><ellipse class="bz-b" fill="none" stroke="#ffe2a8" stroke-width="2" stroke-dasharray="10 8"/><path class="bz-c" fill="#ffe2a8"/></g>'+
  '<circle class="bk-aim" r="1" fill="url(#bkMark)" opacity="0"/>'+(window.HarpoonTether?HarpoonTether.markup():'');
}
function lureGame(el,t,tr,g){
 const {q,qa}=cacheQ(el);
 ambient(el,t,0);twinkle(el,t);placeHole(el,null);
 const wp=whaleAt(g.whale,t),patch=q('.bk-patch');
 if(wp&&wp.op>0){
  patch.setAttribute('transform','translate('+n1(wp.x)+' '+n1(wp.y)+') scale('+n3(.38*wp.sc)+' '+n3(.13*wp.sc)+') rotate('+(wp.dir>0?90:-90)+')');
  patch.setAttribute('opacity',n3(wp.op));
  const dive=g.whale.diveAt!=null?hump(seg(t,g.whale.diveAt,g.whale.diveAt+1.4)):0;
  paintWake(el,'bk-wkP',wp.x+wp.dir*105*wp.sc,wp.y,(wp.moving?.32:.12)*wp.op+.9*dive,t,wp.sc*.5,3);
 }else{patch.setAttribute('opacity','0');paintWake(el,'bk-wkP',0,SEA,0,t,.5,3);}
 // 날개를 펼침: 미끼 양옆으로 날개 끝이 솟아 안쪽으로 휘어 감쌈
 const Wh=g.whale,D=g.decoy,dp=decoyPos(D,t);
 const sp=Wh&&Wh.spreadAt!=null&&dp?t-Wh.spreadAt:-1;
 if(sp>=0){
  const sc=dp.s/1.5,rise=outC(seg(sp,0,1.3)),curl=inOut(seg(sp,1.3,3));
  const ws=.68*sc,BL={x:dp.x-300*sc+30*curl*sc,y:dp.y+8+470*ws*(1-rise),rot:2+12*curl,ws,flip:false},BR={x:dp.x+300*sc-30*curl*sc,y:BL.y,rot:-2-12*curl,ws,flip:true};
  placeWing(el,'bk-wL',BL.x,BL.y,BL.rot,ws,false,{t,wet:rise});
  placeWing(el,'bk-wR',BR.x,BR.y,BR.rot,ws,true,{t:t+.3,wet:rise});
  const lan=[dp.x,dp.y-22*dp.s];litWing(el,'bk-wL','bkLitLw',BL,lan,rise*.9);litWing(el,'bk-wR','bkLitRw',BR,lan,rise*.9);
  paintWake(el,'bk-wkL',dp.x-180*sc,dp.y,.6*hump(seg(sp,0,1.6))+.25*rise,t,ws,5);paintWake(el,'bk-wkR',dp.x+180*sc,dp.y,.6*hump(seg(sp,0,1.6))+.25*rise,t+.4,ws,9);
  if(!lureGame._dl){lureGame._dl=dropParams(24,61,-150,-30,120,320);lureGame._dr=dropParams(24,67,-150,-30,120,320);}
  paintDrops(qa('.bk-drL circle'),lureGame._dl,dp.x-120*sc,dp.y-200*ws*rise,sp-.3,60,420);
  paintDrops(qa('.bk-drR circle'),lureGame._dr,dp.x+120*sc,dp.y-200*ws*rise,sp-.45,60,420);
 }else{hideWing(el,'bk-wL');hideWing(el,'bk-wR');paintWake(el,'bk-wkL',0,SEA,0,t,.3,5);paintWake(el,'bk-wkR',0,SEA,0,t,.3,9);qa('.bk-drL circle,.bk-drR circle').forEach(c=>c.setAttribute('opacity','0'));}
 const B=bob(t),thr=D&&t>=D.at&&t<D.at+.5;
 const tw=boatPose(el,LURE_BOAT,SEA+B.y,B.r,thr?[44,-40]:[37,-30]);lamp(el,t,tw,0);
 g.hand=tw([42,-36]);
 paintDecoy(el,D,t,{dim:sp>=0?.6*seg(sp,1.6,3.2):0});
 if(window.HarpoonTether&&g.tether){const wa=wp?[wp.x+(wp.dir||1)*10*wp.sc,wp.y-4]:null;HarpoonTether.paint(el,t,g.tether,tw,wa,{color:'#0c141e',water:true,sway:jolt(g,t)});}
 // 던질 자리 안내: 고래가 가는 앞쪽, 같은 깊이에 따스하게 빛나는 길목(여기에 던지면 알아챔)
 const zn=q('.bk-zone');
 if(zn){const show=wp&&wp.moving&&wp.op>.4&&!D&&!(g.done||g.locked);
  if(show){const sc=wp.sc,ahead=(g.zoneNear||30)+((g.zoneFar||430)-(g.zoneNear||30))*.38,cx=wp.x+wp.dir*ahead,cy=wp.y,rx=150*(.6+.4*sc),ry=(g.zoneTol||58)*.75;
   const a=zn.querySelector('.bz-a'),b=zn.querySelector('.bz-b'),c=zn.querySelector('.bz-c');
   a.setAttribute('cx',n1(cx));a.setAttribute('cy',n1(cy));a.setAttribute('rx',n1(rx));a.setAttribute('ry',n1(ry));
   b.setAttribute('cx',n1(cx));b.setAttribute('cy',n1(cy));b.setAttribute('rx',n1(rx*.92));b.setAttribute('ry',n1(ry*.8));b.style.strokeDashoffset=n1(-t*30*wp.dir);
   const ax=cx+wp.dir*(rx+18);c.setAttribute('d','M'+n1(ax)+','+n1(cy-10)+' L'+n1(ax+wp.dir*16)+','+n1(cy)+' L'+n1(ax)+','+n1(cy+10)+' Z');
   zn.setAttribute('opacity',n3(.55+.3*Math.sin(t*4)));}
  else zn.setAttribute('opacity','0');}
 // 누른 자리 표시
 const aim=q('.bk-aim');
 if(g.aim&&t-g.aim.at<.6){const k=1-(t-g.aim.at)/.6;aim.setAttribute('cx',n1(g.aim.p[0]));aim.setAttribute('cy',n1(g.aim.p[1]));aim.setAttribute('r',n1(14+30*(1-k)));aim.setAttribute('opacity',n3(k));}else aim.setAttribute('opacity','0');
 const u=hud(el);verdictOf(u,g,t,1.2);
 now2(u,g.done||g.locked?'':sp>=0?'':D&&t<D.land+.2?'':(wp&&wp.moving&&wp.op>.3)?'고래 앞에 빛나는 길목을 누르십시오 · 등불 뗏목이 떨어집니다':'고래가 다시 떠오르기를 기다리십시오',!!(wp&&wp.moving&&!D&&wp.op>.5));
 count(u,'유인 '+(g.lured||0)+' / 2 · 미끼 '+Math.max(0,(g.tries||5)-(g.used||0))+'개');
 caption(el,[[0,CAP24[1]]],0);
 veil(el,t<.5?1-t/.5:0);
}
/* ---------- 3단계 · 관측 ---------- */
function watchBuild(){
 return night()+tipShadows()+wingRef('bk-wLR')+wingRef('bk-wRR')+wakeMarkup('bk-wkL')+wakeMarkup('bk-wkR')+K.nearMist()+boatMarkup()+
  decoyMarkup()+buoysMarkup()+wing2('bk-wL','LitLw')+wing2('bk-wR','LitRw')+drops('bk-drL',24,61,'#dbe8f2')+drops('bk-drR',24,67,'#dbe8f2')+(window.HarpoonTether?HarpoonTether.markup():'');
}
function watchGame(el,t,tr,g){
 const {qa}=cacheQ(el);
 ambient(el,t,0);twinkle(el,t);placeHole(el,null);
 const twW=boatAt(el,t,480,{lamp:0});
 const D={at:-10,land:-9,from:DECOY_AT,to:DECOY_AT};
 paintDecoy(el,D,t,{dim:.55});
 const tL=g.paths?tipAt(g.paths.L,t-(g.r0||0)):null,tR=g.paths?tipAt(g.paths.R,t-(g.r0||0)):null;
 const hidden=g.reveal!=null;
 // 등불: 평소엔 모두 꺼져 있고, 날개 끝이 멈춰 잠긴 부표(눌러야 하는 부표)에만 등이 켜진다
 const lit={},tt=t-(g.r0||0);
 if(!hidden&&g.target&&g.arrive)['L','R'].forEach(side=>{if(g.ok&&g.ok[side])return;const k=clamp((tt-(g.arrive[side]-.3))/.25);if(k>0)lit[g.target[side]]=k;});
 paintBuoys(el,t,hidden?[]:[tL,tR],{marks:g.marks,lit});
 qa('.bk-tip').forEach(e=>{const T=e.dataset.s==='L'?tL:tR;if(!T||hidden){e.setAttribute('opacity','0');return;}const sc=PS(T.p[1]);
  e.setAttribute('cx',n1(T.p[0]));e.setAttribute('cy',n1(T.p[1]+4));e.setAttribute('rx',n1(70*sc));e.setAttribute('ry',n1(10*sc));e.setAttribute('opacity',n3(T.before?0:.22));});
 // 오판: 날개 끝이 실제 자리에서 솟아 물을 내려침
 if(hidden){const s=t-g.reveal.at;['L','R'].forEach(side=>{const i=g.reveal[side];if(i==null){hideWing(el,'bk-w'+side);return;}
   const up=outC(seg(s,0,.5))*(1-inC(seg(s,.9,1.6))),B=wingBase(i,side,up,0);
   placeWing(el,'bk-w'+side,B.x,B.y,B.rot,B.ws,B.flip,{t,wet:up});
   paintWake(el,'bk-wk'+side,BUOYS[i][0],BUOYS[i][1],.9*hump(seg(s,0,1.7)),t,B.ws,side==='L'?5:9);
   if(!watchGame._d)watchGame._d=dropParams(24,61,-160,-20,120,360);
   paintDrops(qa('.bk-dr'+side+' circle'),watchGame._d,BUOYS[i][0],BUOYS[i][1]-6,s-.15,40,420);});}
 else{hideWing(el,'bk-wL');hideWing(el,'bk-wR');paintWake(el,'bk-wkL',0,SEA,0,t,.3,5);paintWake(el,'bk-wkR',0,SEA,0,t,.3,9);}
 if(window.HarpoonTether&&g.tether)HarpoonTether.paint(el,t,g.tether,twW,BODYW,{color:'#0c141e',water:true,sway:jolt(g,t)});
 const u=hud(el);verdictOf(u,g,t,1.1);
 const left=['L','R'].filter(s=>!(g.ok&&g.ok[s])).length;
 now2(u,g.done||hidden?'':'날개 끝이 멈춰 등이 켜진 부표를 누르십시오 · 지나가며 흔든 부표에 속지 마십시오',!!(tL&&tL.rest&&!(g.ok&&g.ok.L))||!!(tR&&tR.rest&&!(g.ok&&g.ok.R)));
 count(u,'짚은 날개 '+(2-left)+' / 2');
 caption(el,[[0,CAP24[2]]],0);
 veil(el,t<.5?1-t/.5:0);
}
/* ---------- 4단계 · 고정 ---------- */
function forkBuild(){
 return night()+wingRef('bk-wLR')+wingRef('bk-wRR')+wakeMarkup('bk-wkL')+wakeMarkup('bk-wkR')+K.nearMist()+boatMarkup()+
  decoyMarkup()+buoysMarkup()+wing2('bk-wL','LitLc')+wing2('bk-wR','LitRc')+
  '<g class="bk-thL">'+threadMarkup()+'</g><g class="bk-thR">'+threadMarkup()+'</g>'+
  drops('bk-drL',24,61,'#dbe8f2')+drops('bk-drR',24,67,'#dbe8f2')+motesMarkup(18)+darkMarkup()+
  '<circle class="bk-apL" r="1" fill="url(#bkRing)" opacity="0"/><circle class="bk-apR" r="1" fill="url(#bkRing)" opacity="0"/>';
}
function forkScene(el,t,g,opt){
 const {qa}=cacheQ(el),o=opt||{};
 ambient(el,t,0);twinkle(el,t);
 const sb=g.sideBuoy||{L:1,R:4};
 const forks={};forks[sb.L]=1;forks[sb.R]=1;
 const tw=boatAt(el,t,480,{lamp:g.embraceAt!=null?-.4*seg(t,g.embraceAt,g.embraceAt+1):0});
 paintDecoy(el,{at:-10,land:-9,from:DECOY_AT,to:DECOY_AT},t,{dim:.55});
 paintBuoys(el,t,[],{forks});
 const tips={};
 ['L','R'].forEach(side=>{
  const i=sb[side],F=(g.st&&g.st[side])||{},m=g.m?g.m[side]:2,b=BUOYS[i],sc=PS(b[1]);
  let rise=outC(seg(t,m-1.3,m)),fold=0;
  if(F.pinned)rise=1;else if(t>m+(g.win||.2))fold=seg(t,m+(g.win||.2),m+(g.win||.2)+1.3);
  if(o.sink)rise*=1-inOut(seg(t,o.sink,o.sink+3.5));
  const B=wingBase(i,side,rise,fold);
  const tr=F.pinned?Math.sin(t*34+(side==='L'?0:1.3))*1.4:0;
  if(rise>.01)placeWing(el,'bk-w'+side,B.x,B.y,B.rot+tr,B.ws,B.flip,{t:t+(side==='L'?0:.4),wet:rise});else hideWing(el,'bk-w'+side);
  paintWake(el,'bk-wk'+side,B.x+(side==='L'?40:-40)*sc,b[1],rise>.01?.25+.6*hump(seg(t,m-1.3,m+.2))+.5*hump(fold):0,t,B.ws,side==='L'?5:9);
  if(!forkScene._d)forkScene._d=dropParams(24,61,-150,-30,120,320);
  paintDrops(qa('.bk-dr'+side+' circle'),forkScene._d,B.x+(side==='L'?60:-60)*sc,b[1]-120*B.ws*rise,t-(m-1.1),50,420);
  const amp=paintFork(el,i,t,F);
  litWing(el,'bk-w'+side,'bkLit'+side+'c',B,forkTop(i,t,{}),F.pinned?Math.min(1,.5+(amp||0)*.5):.25*rise);
  const S=el.querySelector('.bk-buoy[data-i="'+i+'"]'),st=S&&S._st||{tilt:0,dy:0};
  const top=forkTop(i,t,{tilt:st.tilt,dy:st.dy*.5});
  tips[side]=wingTipOf(B);
  paintThread(el,side,top,tips[side],F.pinned?Math.min(1,.4+(amp||0)*.6)*(o.thread==null?1:o.thread):0,t);
  const k=!F.pinned&&!F.miss&&g.m&&!o.noRing&&t>m-1.1&&t<m+(g.win||.2)+.1?(m-t)/1.1:null;
  paintApproach(el,'bk-ap'+side,top,k,sc*1.05);
 });
 // 포옹: 한쪽만 묶이면 풀린 날개가 배를 감싸 안음
 const ek=g.embraceAt!=null?inOut(seg(t,g.embraceAt,g.embraceAt+1.3))*(1-seg(t,g.embraceAt+2.4,g.embraceAt+3.2)):0;
 const lw=tw([51,-18.5]);
 paintDark(el,[lw[0],lw[1]-30],lerp(900,190,ek),ek*.82);
 paintMotes(el,[lw[0],lw[1]-30],lerp(260,140,ek),t,ek*.8);
 return {tw,tips};
}
function forkGame(el,t,tr,g){
 const FS=forkScene(el,t,g);
 if(window.HarpoonTether&&g.tether)HarpoonTether.paint(el,t,g.tether,FS.tw,BODYW,{color:'#0c141e',water:true,sway:jolt(g,t)});
 const u=hud(el);verdictOf(u,g,t,1.1);
 const st=g.st||{},pend=['L','R'].filter(s=>!(st[s]&&(st[s].pinned||st[s].miss)));
 const hot=pend.some(s=>g.m&&Math.abs(g.m[s]-t)<(g.win||.2));
 now2(u,g.done||g.embraceAt!=null&&t<g.embraceAt+3?'':'고리가 굽쇠에 닿는 순간 울리십시오',hot);
 count(u,'묶은 날개 '+['L','R'].filter(s=>st[s]&&st[s].pinned).length+' / 2');
 caption(el,[[0,CAP24[3]]],0);
 veil(el,t<.5?1-t/.5:0);
}
/* ---------- 데모(게임이 아닐 때의 장면 반복) ---------- */
function demoLure(t){
 const g={whale:{lane:SEA+92,dir:-1,x0:1040,t0:.3,v:96},tries:3,used:1};
 if(t>=2.4)g.decoy={at:2.4,land:3.1,from:[LURE_BOAT+12,SEA-22],to:[560,SEA+92]};
 const wx=1040-96*(t-.3);void wx;
 if(t>=3.1){g.whale.stopAt=3.1+(1040-96*2.8-560-36)/96;g.whale.spreadAt=g.whale.stopAt;}
 return g;
}
function demoPaths(){return {L:{pts:[[470,SEA+70],[352,SEA+36],[236,SEA+98]],ts:[.6,2.2,3.8]},R:{pts:[[490,SEA+70],[608,SEA+40],[724,SEA+96]],ts:[1,2.4,4.2]}};}
const S1v={title:'유인',loop:12,
 caps:[[0,'그것은 온순합니다. 작은 것을 보면 날개로 감싸 보호합니다.'],[2.4,'고래가 지나가는 길목에 작은 등불 뗏목을 띄웁니다.'],[5.6,'날개가 펼쳐집니다. 감싸인 것들은 인어가 됩니다.']],
 build:lureBuild,
 paint(el,t,tr){const g=demoLure(t);lureGame(el,t,tr,g);caption(el,S1v.caps,t);veil(el,tr<.6?1-tr/.6:.3*(t<.6?1-t/.6:seg(t,11.4,12)));}};
const S2v={title:'관측',loop:9,
 caps:[[0,'날개는 물밑으로 뻗어 있습니다. 보이지 않습니다.'],[2.2,'날개 끝이 지나가는 부표가 끌려 기울고 잠깁니다.'],[5.6,'날개 끝이 멈춘 자리, 그곳에 굽쇠를 놓습니다.']],
 build:watchBuild,
 paint(el,t,tr){const g={paths:demoPaths(),marks:t>5.8?{1:{},4:{}}:null,ok:{}};watchGame(el,t,tr,g);caption(el,S2v.caps,t);veil(el,tr<.6?1-tr/.6:.3*(t<.6?1-t/.6:seg(t,8.4,9)));}};
const S3v={title:'고정',loop:9,
 caps:[[0,'날개가 솟습니다. 다 펼쳐지면 곧 접혀 듭니다.'],[2.6,'다 펼쳐지는 순간 공명 굽쇠를 울립니다.'],[4.6,'울림이 날개 끝을 묶습니다. 날개를 접지 못합니다.']],
 build:forkBuild,
 paint(el,t,tr){const g={sideBuoy:{L:1,R:4},m:{L:2.6,R:3.2},st:{L:t>=2.6?{pinned:true,ringAt:2.6}:{},R:t>=3.2?{pinned:true,ringAt:3.2}:{}}};forkScene(el,t,g);caption(el,S3v.caps,t);veil(el,tr<.6?1-tr/.6:.3*(t<.6?1-t/.6:seg(t,8.4,9)));}};
/* ---------- 5단계 · 토벌(한 번 재생) ---------- */
const T5={throwAt:4.4,fly:.55,dur:12.5};
/* 5단계: 두 굽쇠의 울림이 날개 끝에서 몸 한가운데로 모여 만나는 순간(빛이 몸의 가장자리를 비춤) 작살을 던짐
   g(게임)가 있으면 g.meetAt(울림이 만나는 시각) · g.shot={at,arrive,hit,reelAt,reelDur} · g.sideBuoy를 따름 */
const BODY=[480,SEA-130];
function strikeBuild(){
 return forkBuild()+'<path class="bw-rope" fill="none" stroke="#8a9697" stroke-opacity=".75" stroke-width="1.5" opacity="0"/>'+
  '<g class="bw-harpoon" opacity="0">'+HARPOON+'</g>'+rimMarkup()+
  ['L','R'].map(sd=>{let tr='';for(let k=3;k>=1;k--)tr+='<circle class="pt" data-k="'+k+'" r="'+(14-k*3)+'" fill="url(#bkResoCore)" opacity="'+n3(.5-k*.12)+'"/>';return '<g class="bk-pls'+sd+'" opacity="0">'+tr+'<circle class="p0" r="30" fill="url(#bkResoCore)"/><circle class="p0" r="5" fill="#f4faff"/><circle class="p0" r="12" fill="url(#bkReso)"/></g>';}).join('')+
  '<circle class="bk-apC" r="1" fill="url(#bkRing)" opacity="0"/>'+(HL()?HL().hitMarkup():'');
}
function strikePaint(el,t,tr,g){
 const {q}=cacheQ(el),game=!!g;
 const sb=game&&g.sideBuoy?g.sideBuoy:{L:1,R:4};
 const shot=game?g.shot:{at:T5.throwAt,arrive:T5.throwAt+T5.fly,hit:true};
 const hit=shot&&shot.hit?shot.arrive:null,since=hit!=null?t-hit:-1,undo=hit!=null?seg(t,hit+1.25,hit+4.25):0;
 const fg={sideBuoy:sb,m:{L:-1,R:-1},st:{L:{pinned:true,ringAt:-1},R:{pinned:true,ringAt:-1}}};
 const R=forkScene(el,t,fg,{sink:hit!=null?hit+4.2:null,thread:hit!=null?1-seg(t,hit+3.8,hit+5):1,noRing:true});
 // 날개 사이의 '없음': 별을 지우는 몸 — 맞은 뒤 날개 끝에서부터 풀림
 const strain=0;
 const P={x:480+strain,y:SEA-60+60*undo,rot:strain*.3,s:.52*(1-.55*undo)};
 placeHole(el,undo<1?P:null);
 const hp=q('.bk-holeP'),hr=q('.bk-holeR');if(hp){hp.setAttribute('opacity',n3(1-undo));hr.setAttribute('opacity',n3(1-undo));}
 // 울림이 만나는 순간: 양쪽 날개 끝에서 빛 덩이가 몸 한가운데로 모여듦
 let meetK=0;
 const mt=game?g.meetAt:null;
 ['L','R'].forEach(side=>{const e=q('.bk-pls'+side);if(!e)return;
  if(mt==null||hit!=null&&t>hit){e.setAttribute('opacity','0');return;}
  const u=clamp(1-(mt-t)/1.5),tip=R.tips[side]||BODY;
  if(t<mt-1.5||t>mt+.35){e.setAttribute('opacity','0');return;}
  const at=uu=>{const e2=inOut(clamp(uu));return [lerp(tip[0],BODY[0],e2),lerp(tip[1],BODY[1],e2)-50*Math.sin(e2*Math.PI)];},c=at(u);
  e.querySelectorAll('.p0').forEach(n=>{n.setAttribute('cx',n1(c[0]));n.setAttribute('cy',n1(c[1]));});
  e.querySelectorAll('.pt').forEach(n=>{const k=+n.dataset.k,cc=at(u-k*.07);n.setAttribute('cx',n1(cc[0]));n.setAttribute('cy',n1(cc[1]));});
  e.setAttribute('opacity',n3(t>mt?1-(t-mt)/.35:.6+.4*u));});
 if(mt!=null&&hit==null)meetK=hump(seg(t,mt-.3,mt+.3));
 paintApproach(el,'bk-apC',BODY,mt!=null&&hit==null&&!(shot&&t<(shot.reelAt||0)+(shot.reelDur||0))&&t>mt-1.1&&t<mt+.25?(mt-t)/1.1:null,.5);
 placeRim(el,undo<1?P:null,BODY,hit!=null&&t>=hit?.9*hump(seg(since,0,1.6)):meetK*.8,true,.35*(1-undo)+.3*meetK);
 paintMotes(el,[480,SEA-120],260,t,.9*hump(undo)+.5*meetK);
 // 작살: 던짐 → (맞으면) 아무것도 없는 곳으로 빨려 들어감 / (빗나가면) 몸을 지나 물에 떨어짐 → 감아 들여 다시 장전
 const L=HL(),own=!!(L&&L.owned()),tw=R.tw;
 const thrown=!!(shot&&t>=shot.at),reelDone=!!(shot&&shot.reelAt!=null&&t>=shot.reelAt+shot.reelDur),out=thrown&&!reelDone&&!(hit!=null&&t>hit+.4);
 const aim=own&&L?L.smoothAim(el,'bk5',L.aimAt(tw,BODY),t):undefined;   // 몸 한가운데를 겨눔
 const hand=own?L.handFor(L.launch(el,tw,{loaded:!(thrown&&!reelDone),aim}),30,-14):tw(thrown&&!reelDone?[38,-24]:[33,-31]);
 if(shot&&!shot._p0&&thrown)shot._p0=[hand[0]+30,hand[1]-14];
 const p0=shot&&shot._p0?shot._p0:[hand[0]+30,hand[1]-14],target=BODY;
 const FL=e=>L?L.flight(p0,target,e):{pos:target,ang:0};
 const hpn=q('.bw-harpoon'),rope=q('.bw-rope');let pos=null,ang=-30,show=0;
 if(!thrown||reelDone){if(!own){pos=[hand[0]+20,hand[1]-14];show=1;}}
 else if(t<shot.arrive){const F=FL((t-shot.at)/(shot.arrive-shot.at));pos=F.pos;ang=F.ang;show=1;}
 else if(hit!=null){ang=FL(1).ang;pos=[target[0]+Math.cos(ang*RAD)*Math.min(60,since*160),target[1]+Math.sin(ang*RAD)*Math.min(60,since*160)];show=Math.max(0,1-since*2.5);}   // 아무것도 없는 곳으로 빨려 들어감
 else{const s2=Math.min(t-shot.arrive,.6),a0=FL(1).ang*RAD;pos=[target[0]+Math.cos(a0)*s2*420,Math.min(SEA+10,target[1]+Math.sin(a0)*s2*420+240*s2*s2)];ang=a0/RAD+s2*40;show=1;
  const home=own?L.slideHome(tw,aim):{pos:[hand[0]+20,hand[1]-14],ang:-30};
  const RP=L?L.reelPose(el,'bk5',t,shot.reelAt,shot.reelDur,{pos,ang},home):null;if(RP){pos=RP.pos;ang=RP.ang;show=RP.show;}}
 hpn.setAttribute('opacity',n3(show));
 if(pos)hpn.setAttribute('transform','translate('+n1(pos[0])+' '+n1(pos[1])+') rotate('+n1(ang)+')');
 if(L)L.paintHit(el,{s:hit!=null&&t>=hit?since:-1,p:target,ang,tier:L.pierce?L.pierce().n:0,through:90});
 if(thrown&&pos&&show&&(out||hit!=null&&t<hit+4)){const ar=ang*RAD,tail=[pos[0]-104*Math.cos(ar),pos[1]-104*Math.sin(ar)],an=tw(own&&L?L.anchorLocal(aim):[40,-9]);
  rope.setAttribute('d','M'+n1(an[0])+','+n1(an[1])+' Q'+n1((an[0]+tail[0])/2)+','+n1((an[1]+tail[1])/2+(t<shot.arrive?34:8))+' '+n1(tail[0])+','+n1(tail[1]));rope.setAttribute('opacity',n3(.85*(hit!=null?1-seg(t,hit+2.6,hit+3.6):1)));}
 else rope.setAttribute('opacity','0');
 return R;
}
const S4v={title:'접지 못한 날개',dur:T5.dur,
 caps:[[0,'두 굽쇠가 같은 소리로 웁니다. 날개가 펼쳐진 채 멈춰 있습니다.'],[2.2,'접지 못한 날개 사이, 별이 지워진 곳이 그것의 몸입니다.'],[4.4,'작살이 아무것도 없는 곳으로 날아갑니다.'],[6.4,'어둠이 날개 끝에서부터 풀려 흩어집니다. 별이 돌아옵니다.'],[9.4,'그것은 펼친 날개 그대로 가라앉았습니다.']],
 build:strikeBuild,
 paint(el,t,tr){
  const sb=(typeof state!=='undefined'&&state&&state.blackWings024)||null;
  strikePaint(el,t,tr,sb?{sideBuoy:sb,shot:{at:T5.throwAt,arrive:T5.throwAt+T5.fly,hit:true},meetAt:null}:null);
  caption(el,S4v.caps,t);
  veil(el,tr<.6?1-tr/.6:0);
 }};
function strikeGame(el,t,tr,g){
 strikePaint(el,t,tr,g);
 const u=hud(el);verdictOf(u,g,t,1.2);
 const busyShot=g.shot&&t<(g.shot.reelAt||0)+(g.shot.reelDur||0);
 now2(u,g.done||busyShot?'':'두 울림이 몸 한가운데에서 만나는 순간 던지십시오',g.meetAt!=null&&Math.abs(g.meetAt-t)<(g.win||.22));
 count(u,'');
 caption(el,[[0,CAP24[4]]],0);
 veil(el,t<.5?1-t/.5:0);
}
const GBUILD={1:lureBuild,2:watchBuild,3:()=>forkBuild()+(window.HarpoonTether?HarpoonTether.markup():''),4:strikeBuild};
const GAMEPAINT={1:lureGame,2:watchGame,3:forkGame,4:strikeGame};
const GAMEMODE={1:'lure',2:'watch',3:'fork',4:'strike'};
const SCENES=[S0,S1v,S2v,S3v,S4v];
function html(stage,opts){
 const i=Math.max(0,Math.min(4,Math.floor(+stage||0))),S=SCENES[i],game=!!(opts&&opts.game&&GBUILD[i]);
 const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'+
  '<defs>'+commonDefs()+bkDefs()+v24Defs()+'</defs>'+(game?GBUILD[i]():S.build())+
  '<rect class="bw-veil" width="'+W+'" height="'+H+'" fill="#000" opacity="1"/></svg>';
 return '<div class="pallid-cine-v2 bk3-scene'+(game?' bkg-on':'')+'" data-stage="'+i+'"'+(game?' data-game="1"':'')+' role="img" aria-label="'+esc(NAME+' · '+(i+1)+'단계 '+S.title)+'">'+svg+
  '<span class="cine-top" aria-hidden="true">'+esc(NAME+' · '+S.title)+'</span>'+
  '<span class="cine-bottom" aria-hidden="true">'+esc(game?CAP24[i]:S.caps[0][1])+'</span>'+
  (game?hudMarkup()+(i===3?'<span class="bkg-forks"><button type="button" data-fork="L">◀ 왼쪽 굽쇠</button><button type="button" data-fork="R">오른쪽 굽쇠 ▶</button></span>':''):'')+
  '<span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}
const API=window.BlackWhaleV3={html,stages:SCENES.map(s=>s.title),replayToken:0,resume:null};
let start=0,lastSeen=0,seenTok=-1,seenStage=-1,seenGame=false;
function frame(now){
 const el=document.querySelector('.bk3-scene');
 if(el&&el.isConnected){
  const st=+el.dataset.stage,S=SCENES[st],g=window.BlackHuntGame;
  const isLamp=false;
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
   if(window.EncFX)window.EncFX.tick(el,t);   // 조우 장면의 징조 · 드러남
  }
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// 미니게임이 쓰는 기하
API.geo={spotAt,cineHit:T4.throwAt+T4.fly,cineOpen:T4.close};
API.v24={T5,BUOYS,DECOY_AT,LURE_BOAT,PS,whaleAt,tipAt,decoyPos,wingBase,wingTipOf,forkTop};
})();
