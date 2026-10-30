/* 모든 것을 말리는 붉은 고래 · v3 형상 (창백한·푸른 고래와 같은 틀)
   - 머리: 문어의 외투막(둥근 머리) + 크툴루의 얼굴(두꺼운 눈두덩, 얼굴에서 늘어진 촉수 수염)
   - 눈: 흰자 위에 붉은 홍채, 문어처럼 가로로 길쭉한 눈동자
   - 팔: 어깨·팔꿈치·손목·다섯 손가락이 있는 사람의 팔. 안쪽(손바닥 쪽)을 따라 문어 빨판이 줄지어 있음
   blue-whale-v3.js(BlueWhaleV3Kit)의 공통 도구를 함께 씀 */
(function(){
'use strict';
const K=window.BlueWhaleV3Kit;
if(!K)return;
const {n1,n3,seeded,RAD,TAU,clamp,lerp}=K;

/* ---------- 매끈한 곡선 ---------- */
function catmull(pts,closed){
 const n=pts.length;if(n<2)return '';
 const P=i=>closed?pts[(i+n)%n]:pts[Math.max(0,Math.min(n-1,i))];
 let d='M'+n1(pts[0][0])+','+n1(pts[0][1]);
 const last=closed?n:n-1;
 for(let i=0;i<last;i++){
  const p0=P(i-1),p1=P(i),p2=P(i+1),p3=P(i+2);
  d+=' C'+n1(p1[0]+(p2[0]-p0[0])/6)+','+n1(p1[1]+(p2[1]-p0[1])/6)+' '+n1(p2[0]-(p3[0]-p1[0])/6)+','+n1(p2[1]-(p3[1]-p1[1])/6)+' '+n1(p2[0])+','+n1(p2[1]);
 }
 return d+(closed?' Z':'');
}
// 등뼈(점들)와 굵기(점마다) → 양쪽으로 부푼 관 모양
function tube(spine,widths){
 const L=[],R=[],N=[];
 for(let i=0;i<spine.length;i++){
  const a=spine[Math.max(0,i-1)],b=spine[Math.min(spine.length-1,i+1)];
  let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
  const nx=-dy,ny=dx,w=widths[i]/2;N.push([nx,ny]);
  L.push([spine[i][0]+nx*w,spine[i][1]+ny*w]);R.push([spine[i][0]-nx*w,spine[i][1]-ny*w]);
 }
 const tip=spine[spine.length-1],td=[tip[0]-spine[spine.length-2][0],tip[1]-spine[spine.length-2][1]],tl=Math.hypot(td[0],td[1])||1;
 const cap=[tip[0]+td[0]/tl*widths[widths.length-1]*.45,tip[1]+td[1]/tl*widths[widths.length-1]*.45];
 const outline=L.concat([cap],R.slice().reverse());
 return {d:catmull(outline,true),L,R,N};
}
function bez(p0,p1,p2,u){const a=1-u;return [a*a*p0[0]+2*a*u*p1[0]+u*u*p2[0],a*a*p0[1]+2*a*u*p1[1]+u*u*p2[1]];}
const pol=(p,a,l)=>[p[0]+Math.cos(a*RAD)*l,p[1]+Math.sin(a*RAD)*l];

/* ---------- 빨판 달린 사람 팔 ----------
   o: {x,y 어깨(물속 뿌리), a 위팔 방향(도), L1 위팔 길이, e 팔꿈치 굽힘(도, +면 안쪽으로), L2 아래팔 길이,
       wr 손목 꺾임(도), w 굵기, grip 손가락 굽힘 0~1, spread 손가락 벌림, side 1|-1 (손바닥 쪽) } */
function arm(o){
 const side=o.side||1,w=o.w||40;
 const sh=[o.x,o.y],el=pol(sh,o.a,o.L1),fa=o.a+o.e*side,wr=pol(el,fa,o.L2);
 // 위팔과 아래팔을 팔꿈치에서 부드럽게 이음
 const ctl=el;
 const spine=[],widths=[];
 const N=22;
 for(let i=0;i<=N;i++){
  const u=i/N;let p;
  if(u<.5){p=bez(sh,pol(sh,o.a,o.L1*.6),pol(el,o.a+180,o.L1*.12),u*2);}
  else{p=bez(pol(el,o.a+180,o.L1*.12),pol(el,fa,o.L2*.15),wr,(u-.5)*2);}
  spine.push(p);
  // 굵기: 어깨 굵음 → 팔꿈치 살짝 잘록 → 아래팔 근육 → 손목 가늘게
  const k=u<.5?1-.14*u*2:(u<.62?.86+.06*Math.sin((u-.5)/.12*Math.PI/2):.92-(u-.62)/.38*.46);
  widths.push(w*k);
 }
 const T=tube(spine,widths);
 // 손: 손목 방향으로 손바닥, 다섯 손가락
 const ha=fa+(o.wr||0)*side,hw=w*.56,pl=w*1.15;
 const palmC=pol(wr,ha,pl*.5);
 const g=clamp(o.grip||0,0,1),sp=o.spread==null?1:o.spread;
 const fingers=[];
 const base=[[-.4,.95,-12],[-.13,1.08,-4],[.13,1.02,4],[.38,.84,11]];
 base.forEach(([off,len,fan],i)=>{
  const root=pol(pol(wr,ha,pl*.92),ha+90,off*hw*2);
  let ang=ha+fan*sp,p=root;const pts=[p],ws=[];
  const seg=w*.55*len;
  for(let j=0;j<3;j++){ang+=(10+g*40)*side*(j===0?.5:1);p=pol(p,ang,seg*(j===2?.78:1));pts.push(p);}
  const sm=[];for(let j=0;j<pts.length-1;j++){for(let q=0;q<3;q++){const u=q/3;sm.push([lerp(pts[j][0],pts[j+1][0],u),lerp(pts[j][1],pts[j+1][1],u)]);}}
  sm.push(pts[pts.length-1]);
  sm.forEach((_,q)=>ws.push(w*.21*(1-q/sm.length*.5)*(q%3===0&&q>0?.92:1)));
  fingers.push({spine:sm,ws});
 });
 // 엄지: 손바닥 안쪽에서
 {const root=pol(pol(wr,ha,pl*.3),ha-90*side,hw*.7);let ang=ha-50*side*sp,p=root;const pts=[p];
  for(let j=0;j<2;j++){ang+=(16+g*30)*side;p=pol(p,ang,w*.5);pts.push(p);}
  const sm=[];for(let j=0;j<pts.length-1;j++)for(let q=0;q<3;q++){const u=q/3;sm.push([lerp(pts[j][0],pts[j+1][0],u),lerp(pts[j][1],pts[j+1][1],u)]);}
  sm.push(pts[pts.length-1]);fingers.push({spine:sm,ws:sm.map((_,q)=>w*.23*(1-q/sm.length*.5))});}
 const palm=[pol(pol(wr,ha+90,hw*.62),ha,-w*.08),pol(pol(wr,ha,pl*.45),ha+90,hw*.98),pol(pol(wr,ha,pl*.95),ha+90,hw*.92),pol(wr,ha,pl*1.04),pol(pol(wr,ha,pl*.95),ha-90,hw*.9),pol(pol(wr,ha,pl*.4),ha-90,hw*1.0),pol(pol(wr,ha-90,hw*.6),ha,-w*.08)];
 // 빨판: 아래팔 안쪽 두 줄 + 손가락 한 줄
 const suckers=[];
 for(let i=Math.floor(N*.5);i<=N;i++){
  const n=T.N[i],sp2=spine[i],ww=widths[i]/2,u=(i-N*.5)/(N*.5);
  const r=w*(.12-.055*u);
  const off=i%2?.42:.08;
  suckers.push([sp2[0]-n[0]*side*ww*off,sp2[1]-n[1]*side*ww*off,r*(i%2?1:.85)]);
 }
 for(let i=Math.floor(N*.22);i<Math.floor(N*.5);i+=2){
  const n=T.N[i],sp2=spine[i],ww=widths[i]/2;suckers.push([sp2[0]-n[0]*side*ww*.66,sp2[1]-n[1]*side*ww*.66,w*.12]);
 }
 const fingerT=fingers.map(f=>{const t=tube(f.spine,f.ws);
  for(let q=2;q<f.spine.length-1;q+=2){const n=t.N[q],p=f.spine[q];suckers.push([p[0]-n[0]*side*f.ws[q]*.18,p[1]-n[1]*side*f.ws[q]*.18,f.ws[q]*.3]);}
  return t;});
 for(let q=0;q<3;q++){const c=pol(pol(wr,ha,pl*(.35+q*.22)),ha+90,(q-1)*hw*.35);suckers.push([c[0],c[1],w*.1]);}
 const knuck=fingers.slice(0,4).map(f=>f.spine[3]).concat();
 return {arm:T,fingers:fingerT,palm:catmull(palm,true),suckers,elbow:el,wrist:wr,hand:palmC,spine,widths,knuck,fspines:fingers.map(f=>f.spine)};
}
function armMarkup(cls){
 // 피부·빨판 노드(빨판 수는 넉넉히 만들어 두고 남는 것은 숨김)
 let s='<g class="'+cls+' rw-arm">'+
  '<path class="ra-body" fill="url(#rwArmSkin)"/>'+
  '<path class="ra-palm" fill="url(#rwArmSkin)"/>';
 for(let i=0;i<5;i++)s+='<path class="ra-f" data-i="'+i+'" fill="url(#rwArmSkin)"/>';
 s+='<path class="ra-tex" fill="#000" filter="url(#rwSkinTex)" opacity=".5"/>'+
  '<path class="ra-rim" fill="none" stroke="#ff9d86" stroke-opacity=".38" stroke-width="2" filter="url(#rwRim)"/>'+
  '<path class="ra-shade" fill="none" stroke="#1a0206" stroke-opacity=".55" stroke-width="5" filter="url(#rwRim)"/>'+
  '<path class="ra-knuck" fill="none" stroke="#22030a" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/>'+
  '<path class="ra-elbow" fill="none" stroke="#22030a" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>'+
  '<g class="ra-suck">';
 for(let i=0;i<40;i++)s+='<g data-i="'+i+'"><circle fill="#f08a86" stroke="#5a0614" stroke-width="1.1" opacity=".9"/><circle class="in" fill="#3a0210" opacity=".85"/></g>';
 return s+'</g></g>';
}
function paintArm(g,o){
 const A=arm(o);
 const c=g._ra||(g._ra={body:g.querySelector('.ra-body'),palm:g.querySelector('.ra-palm'),f:Array.from(g.querySelectorAll('.ra-f')),tex:g.querySelector('.ra-tex'),rim:g.querySelector('.ra-rim'),shade:g.querySelector('.ra-shade'),kn:g.querySelector('.ra-knuck'),eb:g.querySelector('.ra-elbow'),s:Array.from(g.querySelectorAll('.ra-suck g'))});
 c.body.setAttribute('d',A.arm.d);c.palm.setAttribute('d',A.palm);
 c.f.forEach((f,i)=>f.setAttribute('d',A.fingers[i]?A.fingers[i].d:'M0,0'));
 c.tex.setAttribute('d',A.arm.d);
 const side=o.side||1,outer=side>0?A.arm.L:A.arm.R,inner=side>0?A.arm.R:A.arm.L;
 c.rim.setAttribute('d',catmull(outer.slice(1)));
 // 손가락 마디 주름 · 팔꿈치 주름
 let kd='';A.fspines.slice(0,4).forEach(sp=>{[3,6].forEach(q=>{const a=sp[q-1],b=sp[q+1]||sp[q],p=sp[q];if(!a||!b)return;const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*(o.w||40)*.08,ny=dx/l*(o.w||40)*.08;kd+='M'+n1(p[0]-nx)+','+n1(p[1]-ny)+' L'+n1(p[0]+nx)+','+n1(p[1]+ny)+' ';});});
 c.kn.setAttribute('d',kd||'M0,0');
 {const i=Math.round(A.spine.length*.5),p=A.spine[i],nn=A.arm.N[i],ww=A.widths[i]*.3;c.eb.setAttribute('d','M'+n1(p[0]+nn[0]*ww)+','+n1(p[1]+nn[1]*ww)+' Q'+n1(p[0]+nn[0]*ww*.2+4)+','+n1(p[1]+nn[1]*ww*.2+4)+' '+n1(p[0]-nn[0]*ww*.3)+','+n1(p[1]-nn[1]*ww*.3));}c.shade.setAttribute('d',catmull(inner.slice(Math.floor(inner.length*.45))));
 c.s.forEach((n,i)=>{const p=A.suckers[i];
  if(!p){n.setAttribute('opacity','0');return;}
  n.setAttribute('opacity','1');const [o1,o2]=n._c||(n._c=n.querySelectorAll('circle'));
  o1.setAttribute('cx',n1(p[0]));o1.setAttribute('cy',n1(p[1]));o1.setAttribute('r',n1(Math.max(1.2,p[2])));
  o2.setAttribute('cx',n1(p[0]));o2.setAttribute('cy',n1(p[1]));o2.setAttribute('r',n1(Math.max(.5,p[2]*.42)));});
 return A;
}

/* ---------- 머리: 문어 외투막 + 크툴루 얼굴 (정면, 원점=두 눈 사이) ---------- */
const MANTLE='M-168,24 C-226,-66 -240,-214 -150,-310 C-86,-376 44,-384 126,-326 C220,-258 234,-110 172,24 Z';
const FACE='M-196,-14 C-214,44 -184,104 -128,132 C-64,160 64,160 128,132 C184,104 214,44 196,-14 C156,-50 104,-58 0,-46 C-104,-58 -156,-50 -196,-14 Z';
const EYES=[[-84,6],[84,6]];
const FACE_T=(()=>{const r=seeded(31);return Array.from({length:13},(_,i)=>{const u=i/12;const x=-140+280*u+(r()-.5)*14,y=96+Math.sin(u*Math.PI)*40+(r()-.5)*8;
 return {x,y,len:150+Math.sin(u*Math.PI)*130+r()*40,w:24+Math.sin(u*Math.PI)*12,ph:r()*TAU,curl:(u-.5)*1.4+(r()-.5)*.6,front:Math.abs(u-.5)<.28};});})();
function headDefs(){
 return ''+
 '<linearGradient id="rwArmSkin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d42638"/><stop offset=".45" stop-color="#8a0c1e"/><stop offset="1" stop-color="#2a020a"/></linearGradient>'+
 '<radialGradient id="rwMantle" cx=".66" cy=".24" r=".85"><stop stop-color="#e0303e"/><stop offset=".3" stop-color="#a0101f"/><stop offset=".66" stop-color="#4a0310"/><stop offset="1" stop-color="#160105"/></radialGradient>'+
 '<linearGradient id="rwShadeV" gradientUnits="userSpaceOnUse" x1="0" y1="-380" x2="0" y2="30"><stop stop-color="#000" stop-opacity="0"/><stop offset=".6" stop-color="#000" stop-opacity=".15"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>'+
 ''+
 '<radialGradient id="rwFace" cx=".6" cy=".15" r=".85"><stop stop-color="#b8182c"/><stop offset=".5" stop-color="#620716"/><stop offset="1" stop-color="#180106"/></radialGradient>'+
 '<linearGradient id="rwTent" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a8142a"/><stop offset="1" stop-color="#32020c"/></linearGradient>'+
 '<radialGradient id="rwSclera" cx=".45" cy=".4" r=".65"><stop stop-color="#f6efe2"/><stop offset=".7" stop-color="#e2d4c2"/><stop offset="1" stop-color="#a88f80"/></radialGradient>'+
 '<radialGradient id="rwIris" cx=".5" cy=".5" r=".5"><stop stop-color="#ff5a3c"/><stop offset=".55" stop-color="#d0182a"/><stop offset=".85" stop-color="#7a0816"/><stop offset="1" stop-color="#3a020a"/></radialGradient>'+
 '<radialGradient id="rwEyeGlow"><stop stop-color="#ff3a2a" stop-opacity=".5"/><stop offset="1" stop-color="#ff3a2a" stop-opacity="0"/></radialGradient>'+
 '<filter id="rwSkinTex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".055 .07" numOctaves="3" seed="8"/><feColorMatrix values="0 0 0 0 .08  0 0 0 0 0  0 0 0 0 .02  0 0 0 -2.2 1.25"/><feComposite in2="SourceGraphic" operator="in"/></filter>'+
 '<filter id="rwSpots" x="0" y="0" width="100%" height="100%"><feTurbulence type="turbulence" baseFrequency=".9" numOctaves="1" seed="3"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .01  0 0 0 0 .04  0 0 0 -6 3.2"/><feComposite in2="SourceGraphic" operator="in"/></filter>'+
 '<filter id="rwRim" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter>'+
 '<filter id="rwGlowF" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>'+
 '<clipPath id="rwMantleClip"><path d="'+MANTLE+'"/></clipPath>'+
 '<clipPath id="rwFaceClip"><path d="'+FACE+'"/></clipPath>';
}
function eyeMarkup(i,x,y){
 return '<g class="rw-eye" data-i="'+i+'" transform="translate('+x+' '+y+')">'+
  '<circle r="70" fill="url(#rwEyeGlow)" class="re-glow"/>'+
  '<ellipse rx="44" ry="33" fill="#1e0308"/>'+
  '<ellipse rx="40" ry="30" fill="url(#rwSclera)"/>'+
  '<path d="M-36,-8 Q-20,-2 -12,-6 M30,10 Q20,6 14,10 M-30,14 Q-18,10 -10,14" fill="none" stroke="#b0453f" stroke-opacity=".35" stroke-width=".9"/>'+
  '<g class="re-iris"><circle r="23" fill="url(#rwIris)"/><circle r="23" fill="none" stroke="#2a0207" stroke-width="2.4"/>'+
   '<path d="M-23,0 L23,0" stroke="#ff8a6a" stroke-opacity=".18" stroke-width="16"/>'+
   '<rect class="re-pupil" x="-17" y="-4.5" width="34" height="9" rx="4.5" fill="#100206"/>'+
   '<ellipse cx="-9" cy="-10" rx="5" ry="3.2" fill="#fff6ee" opacity=".75"/></g>'+
  '<path class="re-lid" fill="#5a0e18" stroke="#2a0409" stroke-width="2"/>'+
  '<path class="re-low" d="M-42,10 Q0,40 42,10" fill="none" stroke="#2a0409" stroke-opacity=".7" stroke-width="3"/>'+
 '</g>';
}
function headMarkup(){
 const r=seeded(5);let bumps='',spots='';
 for(let i=0;i<30;i++){const a=r()*TAU,rad=Math.sqrt(r()),x=-10+Math.cos(a)*rad*170,y=-170+Math.sin(a)*rad*150,s=1.5+r()*3.2;bumps+='<circle cx="'+n1(x)+'" cy="'+n1(y)+'" r="'+n1(s)+'"/><circle cx="'+n1(x-s*.3)+'" cy="'+n1(y-s*.35)+'" r="'+n1(s*.35)+'" fill="#e08a80" stroke="none" opacity=".35"/>';}
 let wr='';[[-150,-250,-60,-300,30,-310],[-180,-150,-90,-200,10,-215],[-170,-60,-80,-110,20,-120],[60,-300,130,-270,170,-210],[40,-220,130,-190,190,-120]].forEach(a=>wr+='M'+a[0]+','+a[1]+' Q'+a[2]+','+a[3]+' '+a[4]+','+a[5]+' ');
 let tents='';
 FACE_T.forEach((f,i)=>{tents+='<g class="rw-ft" data-i="'+i+'"'+(f.front?' data-front="1"':'')+'><path class="ft-b" fill="url(#rwTent)" stroke="#1e0307" stroke-width="1"/><path class="ft-r" fill="none" stroke="#ff8f7a" stroke-opacity=".28" stroke-width="1.4"/><g class="ft-s" fill="#e07a78" stroke="#4a0410" stroke-width=".8" opacity=".85">'+'<circle/>'.repeat(7)+'</g></g>';});
 return '<g class="rw-head">'+
  // 뒤쪽 얼굴 촉수
  '<g class="rw-tents-back">'+tents.replace(/rw-ft/g,'rw-ft back')+'</g>'+
  // 외투막(둥근 머리)
  '<path d="'+MANTLE+'" fill="url(#rwMantle)"/>'+
  '<g clip-path="url(#rwMantleClip)">'+
   '<rect x="-250" y="-400" width="500" height="440" filter="url(#rwSkinTex)" opacity=".7"/>'+
   '<rect x="-250" y="-400" width="500" height="440" filter="url(#rwSpots)" opacity=".18"/>'+
   '<path d="'+wr+'" fill="none" stroke="#2a050b" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/>'+
   '<path d="'+wr+'" fill="none" stroke="#e17e74" stroke-opacity=".14" stroke-width="1.6" stroke-linecap="round" transform="translate(0 -4)"/>'+
   '<g fill="#b0182a" stroke="#2a0208" stroke-opacity=".5" stroke-width=".8">'+bumps+'</g>'+
   '<ellipse cx="60" cy="-290" rx="110" ry="44" fill="#ffb4a0" opacity=".07"/>'+
   '<rect x="-250" y="-400" width="500" height="440" fill="url(#rwShadeV)"/>'+
  '</g>'+
  '<path d="M-150,-310 C-86,-376 44,-384 126,-326 C220,-258 234,-110 172,24" fill="none" stroke="#ffb7a2" stroke-opacity=".4" stroke-width="2.6" filter="url(#rwRim)"/>'+
  '<ellipse cx="0" cy="-10" rx="210" ry="60" fill="#0e0105" opacity=".55" filter="url(#rwGlowF)"/>'+
  // 얼굴
  '<path d="'+FACE+'" fill="url(#rwFace)"/>'+
  '<g clip-path="url(#rwFaceClip)">'+
   '<rect x="-230" y="-80" width="460" height="260" filter="url(#rwSkinTex)" opacity=".75"/>'+
   '<path d="M-200,40 C-150,70 -110,80 -70,74 M200,40 C150,70 110,80 70,74 M-60,104 C-20,118 20,118 60,104" fill="none" stroke="#24040a" stroke-opacity=".6" stroke-width="4"/>'+
  '</g>'+
  // 두꺼운 눈두덩
  '<path d="M-160,-16 C-130,-72 -56,-78 -18,-30 C-56,-50 -112,-46 -160,-16 Z M160,-16 C130,-72 56,-78 18,-30 C56,-50 112,-46 160,-16 Z" fill="#2c040c"/>'+
  '<path d="M-148,-24 C-120,-60 -60,-64 -26,-32 M148,-24 C120,-60 60,-64 26,-32" fill="none" stroke="#ff9c86" stroke-opacity=".25" stroke-width="1.6"/>'+
  EYES.map((e,i)=>eyeMarkup(i,e[0],e[1])).join('')+
  // 앞쪽 얼굴 촉수
  '<g class="rw-tents-front">'+tents+'</g>'+
 '</g>';
}
// 촉수 수염 흔들기 · 눈 깜빡임/동공
function paintHead(g,t,o){
 o=o||{};
 const limp=o.limp||0,curlK=1-limp*.7;
 const c=g._rh||(g._rh={ft:Array.from(g.querySelectorAll('.rw-ft')),eyes:Array.from(g.querySelectorAll('.rw-eye'))});
 c.ft.forEach(n=>{
  const i=+n.dataset.i,f=FACE_T[i],back=n.classList.contains('back');
  if(back===!!f.front){n.style.display='none';return;}n.style.display='';
  const sp=[],ws=[],segs=12;let ang=90+f.curl*10,p=[f.x,f.y];sp.push(p);
  for(let j=1;j<=segs;j++){const u=j/segs;
   ang+=(f.curl*7*u+Math.sin(t*(1.2+i*.07)+f.ph+u*3)*(6+u*10))*curlK+(limp?(90-ang)*.15*limp:0);
   p=pol(p,ang,f.len/segs*(1+limp*.25));sp.push(p);}
  for(let j=0;j<=segs;j++)ws.push(f.w*(1-j/segs*.88));
  const T=tube(sp,ws);
  const [b,rm,s]=n._c||(n._c=[n.querySelector('.ft-b'),n.querySelector('.ft-r'),n.querySelector('.ft-s')]);
  b.setAttribute('d',T.d);rm.setAttribute('d',catmull(T.L.slice(1,-1)));
  const cs=s._c||(s._c=Array.from(s.querySelectorAll('circle')));
  cs.forEach((cc,k)=>{const q=2+k*1.4|0,qq=Math.min(segs-1,q),nn=T.N[qq],pp=sp[qq],ww=ws[qq];
   cc.setAttribute('cx',n1(pp[0]-nn[0]*ww*.22));cc.setAttribute('cy',n1(pp[1]-nn[1]*ww*.22));cc.setAttribute('r',n1(Math.max(.8,ww*.13)));});
 });
 // 눈: 깜빡임(open 0~1), 동공 크기, 시선
 const open=o.open==null?1:o.open,dil=o.dilate==null?1:o.dilate,look=o.look||[0,0],glow=o.glow==null?1:o.glow;
 c.eyes.forEach((e,i)=>{
  const lid=e._lid||(e._lid=e.querySelector('.re-lid')),iris=e._ir||(e._ir=e.querySelector('.re-iris')),pu=e._pu||(e._pu=e.querySelector('.re-pupil')),gl=e._gl||(e._gl=e.querySelector('.re-glow'));
  const top=-34+(1-open)*66;
  lid.setAttribute('d','M-46,-36 L46,-36 L46,'+n1(top-2)+' Q0,'+n1(top+(open<.95?14:8))+' -46,'+n1(top-2)+' Z');
  iris.setAttribute('transform','translate('+n1(look[0])+' '+n1(look[1])+')');
  const h=9*dil,wd=34*(0.75+dil*.25);pu.setAttribute('x',n1(-wd/2));pu.setAttribute('width',n1(wd));pu.setAttribute('y',n1(-h/2));pu.setAttribute('height',n1(h));pu.setAttribute('rx',n1(h/2));
  gl.setAttribute('opacity',n3(.8*glow));
  iris.setAttribute('opacity',n3(.35+.65*glow));
 });
}


/* ---------- 열리는 꼬리: 고래 꼬리가 갈라지며 빨판 꽃잎 사이로 붉은 핵이 드러남 (원점=수면 위 꼬리 뿌리) ---------- */
const PETAL='M-24,0 C-40,-56 -26,-124 0,-166 C26,-124 40,-56 24,0 Z';
const FLUKE_L='M0,0 C-50,-18 -140,-40 -236,-120 C-196,-60 -130,-6 -30,26 Z';
function tailMarkup(){
 let petals='';
 for(let i=0;i<5;i++){
  let sk='';for(let k=0;k<6;k++)sk+='<circle cx="0" cy="'+(-18-k*24)+'" r="'+n1(7-k*.8)+'"/><circle class="in" cx="0" cy="'+(-18-k*24)+'" r="'+n1(3-k*.35)+'"/>';
  petals+='<g class="rt-petal" data-i="'+i+'"><path d="'+PETAL+'" fill="url(#rwArmSkin)" stroke="#2a0208" stroke-width="1.4"/>'+
   '<path d="M0,-6 L0,-158" stroke="#3a0210" stroke-opacity=".5" stroke-width="10" stroke-linecap="round"/>'+
   '<g class="rt-suck" fill="#f08a86" stroke="#5a0614" stroke-width="1">'+sk.replace(/class="in"/g,'class="in" fill="#3a0210" stroke="none"')+'</g></g>';
 }
 return '<g class="rw-tail">'+
  '<path class="rt-stalk" fill="url(#rwArmSkin)" stroke="#2a0208" stroke-width="1.5"/>'+
  '<path class="rt-stalktex" fill="#000" filter="url(#rwSkinTex)" opacity=".6"/>'+
  '<g class="rt-fluke" data-s="-1"><path d="'+FLUKE_L+'" fill="url(#rwMantle)" stroke="#2a0208" stroke-width="1.4"/><path d="M-20,10 C-90,-8 -160,-40 -220,-104" fill="none" stroke="#ff9c8c" stroke-opacity=".3" stroke-width="2"/></g>'+
  '<g class="rt-fluke" data-s="1"><g transform="scale(-1 1)"><path d="'+FLUKE_L+'" fill="url(#rwMantle)" stroke="#2a0208" stroke-width="1.4"/><path d="M-20,10 C-90,-8 -160,-40 -220,-104" fill="none" stroke="#ff9c8c" stroke-opacity=".3" stroke-width="2"/></g></g>'+
  petals+
  '<g class="rt-core"><circle r="90" fill="url(#rwCoreGlow)"/><ellipse class="rt-hole" rx="26" ry="19" fill="url(#rwCore)"/><ellipse class="rt-pulse" rx="16" ry="11" fill="#ffd2a0"/></g>'+
 '</g>';
}
function tailDefs(){
 return '<radialGradient id="rwCore"><stop stop-color="#ffe2b0"/><stop offset=".35" stop-color="#ff5a2a"/><stop offset=".75" stop-color="#b0081e"/><stop offset="1" stop-color="#3a0208"/></radialGradient>'+
  '<radialGradient id="rwCoreGlow"><stop stop-color="#ff4a2a" stop-opacity=".55"/><stop offset=".5" stop-color="#ff2a2a" stop-opacity=".15"/><stop offset="1" stop-color="#ff2a2a" stop-opacity="0"/></radialGradient>';
}
// o: {h 꼬리 높이, open 0~1, pulse, sway, limp 0~1}
function paintTail(g,o){
 const c=g._rt||(g._rt={stalk:g.querySelector('.rt-stalk'),tex:g.querySelector('.rt-stalktex'),fl:Array.from(g.querySelectorAll('.rt-fluke')),core:g.querySelector('.rt-core'),pu:g.querySelector('.rt-pulse'),hole:g.querySelector('.rt-hole'),pe:Array.from(g.querySelectorAll('.rt-petal'))});
 const h=o.h||300,op=clamp(o.open||0,0,1),sw=o.sway||0,limp=o.limp||0;
 const top=[sw,-h],mid=[sw*.4,-h*.5];
 const sp=[[0,40],[mid[0],mid[1]],top],ws=[110,74,46];
 // 꼬리 기둥: 아래가 굵고 위로 가늘어짐
 const L=[[-ws[0]/2,40],[mid[0]-ws[1]/2,mid[1]],[top[0]-ws[2]/2,top[1]]],R=[[ws[0]/2,40],[mid[0]+ws[1]/2,mid[1]],[top[0]+ws[2]/2,top[1]]];
 const d=catmull(L.concat(R.slice().reverse()),true);
 c.stalk.setAttribute('d',d);c.tex.setAttribute('d',d);
 c.fl.forEach(f=>{const s=+f.dataset.s;f.setAttribute('transform','translate('+n1(top[0]+s*14)+' '+n1(top[1]+6)+') rotate('+n1(s*(op*38-limp*40)+sw*.05)+')');});
 c.core.setAttribute('transform','translate('+n1(top[0])+' '+n1(top[1]-8)+') scale('+n3(.2+.8*op)+')');
 c.core.setAttribute('opacity',n3(op*(1-limp*.85)));
 const p=o.pulse||0;c.pu.setAttribute('rx',n1(14+6*p));c.pu.setAttribute('ry',n1(9+4*p));
 const base=[-62,-30,0,30,62];
 c.pe.forEach((e,i)=>{const a=base[i]*(.12+.88*op)*(1-limp*.6)+(limp?(i-2)*8*limp:0)+Math.sin((o.t||0)*3+i)*2*op;
  e.setAttribute('transform','translate('+n1(top[0])+' '+n1(top[1]+4)+') rotate('+n1(a)+') scale('+n3(.7+.3*op)+' '+n3((.75+.25*op)*(1-limp*.35))+')');});
 return [top[0],top[1]-8];
}

window.RedWhaleV3Kit={tailMarkup,tailDefs,paintTail,catmull,tube,arm,armMarkup,paintArm,headDefs,headMarkup,paintHead,MANTLE,FACE,EYES};
})();
