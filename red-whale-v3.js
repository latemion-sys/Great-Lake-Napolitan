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

/* ---------- 머리: 거대한 문어(크라켄)의 머리 — 창백한·푸른 고래처럼 사실적이고 어두운 결 (정면, 원점=두 눈 사이) ----------
   섬처럼 울퉁불퉁한 외투막, 따개비 같은 덩어리와 늘어진 해초, 옆으로 튀어나온 눈두덩 속의 작고 깊은 눈,
   가로로 찢어진 동공 안쪽에 꺼질 듯한 붉은 빛, 아래로는 굵은 팔뿌리가 진흙 속으로 뻗음 */
const MANTLE='M-150,-24 C-206,-80 -238,-168 -214,-244 C-200,-288 -176,-302 -156,-328 C-114,-388 -32,-412 40,-398 C98,-388 134,-362 162,-328 C188,-298 216,-282 224,-226 C238,-140 212,-70 160,-24 Z';
const HEAD='M-186,-4 C-206,-44 -176,-78 -124,-82 C-62,-90 62,-90 124,-82 C176,-78 206,-44 186,-4 C176,42 134,74 72,88 C30,96 -30,96 -72,88 C-134,74 -176,42 -186,-4 Z';
const EYES=[[-134,-8],[134,-8]];
const ROOTS=(()=>{const r=seeded(33);return [-150,-92,-34,34,92,150].map((x,i)=>({x,y:58+Math.abs(x)*.12,len:150+r()*60,w:74-Math.abs(x)*.12,ang:90+x*.26+(r()-.5)*8,ph:r()*TAU}));})();
function headDefs(){
 return ''+
 '<linearGradient id="rwArmSkin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d42638"/><stop offset=".45" stop-color="#8a0c1e"/><stop offset="1" stop-color="#2a020a"/></linearGradient>'+
 '<radialGradient id="rwMantle" cx=".66" cy=".24" r=".85"><stop stop-color="#e0303e"/><stop offset=".3" stop-color="#a0101f"/><stop offset=".66" stop-color="#4a0310"/><stop offset="1" stop-color="#160105"/></radialGradient>'+
 // 머리 피부: 창백한 고래와 같은 위→아래 명암 (달빛 받는 윗면 · 어두운 아랫면)
 '<linearGradient id="rwHSkin" gradientUnits="userSpaceOnUse" x1="60" y1="-400" x2="-40" y2="100"><stop stop-color="#d8505a"/><stop offset=".1" stop-color="#a81c2a"/><stop offset=".28" stop-color="#5e0614"/><stop offset=".5" stop-color="#2a020a"/><stop offset="1" stop-color="#0a0003"/></linearGradient>'+
 '<linearGradient id="rwHFace" gradientUnits="userSpaceOnUse" x1="0" y1="-90" x2="0" y2="100"><stop stop-color="#6a0816"/><stop offset=".45" stop-color="#32030c"/><stop offset="1" stop-color="#0c0103"/></linearGradient>'+
 '<linearGradient id="rwRoot" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5a0612"/><stop offset="1" stop-color="#120104"/></linearGradient>'+
 '<linearGradient id="rwSide" gradientUnits="userSpaceOnUse" x1="-240" y1="0" x2="240" y2="0"><stop stop-color="#000" stop-opacity=".6"/><stop offset=".25" stop-color="#000" stop-opacity=".1"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>'+
 '<radialGradient id="rwSheenH" cx=".5" cy=".5" r=".5"><stop stop-color="#ffd2c4" stop-opacity=".3"/><stop offset="1" stop-color="#ffd2c4" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="rwPupil" cx=".5" cy=".5" r=".5"><stop stop-color="#ffb08a"/><stop offset=".4" stop-color="#ff3a22"/><stop offset="1" stop-color="#8a0610"/></radialGradient>'+
 '<radialGradient id="rwEyeGlow"><stop stop-color="#ff3a2a" stop-opacity=".45"/><stop offset="1" stop-color="#ff3a2a" stop-opacity="0"/></radialGradient>'+
 '<filter id="rwSkinTex" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".055 .07" numOctaves="3" seed="8"/><feColorMatrix values="0 0 0 0 .08  0 0 0 0 0  0 0 0 0 .02  0 0 0 -2.2 1.25"/><feComposite in2="SourceGraphic" operator="in"/></filter>'+
 '<filter id="rwSkinFine" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".9 .55" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .06  0 0 0 0 .0  0 0 0 0 .01  0 0 0 -1.6 1.1"/></filter>'+
 '<filter id="rwSpots" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="turbulence" baseFrequency=".9" numOctaves="1" seed="3"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .01  0 0 0 0 .04  0 0 0 -6 3.2"/><feComposite in2="SourceGraphic" operator="in"/></filter>'+
 '<filter id="rwRim" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter>'+
 '<filter id="rwRun" x="-50%" y="-5%" width="200%" height="110%"><feGaussianBlur stdDeviation="2.4 5"/></filter>'+
 '<filter id="rwGlowF" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>'+
 '<clipPath id="rwMantleClip"><path d="'+MANTLE+'"/></clipPath>'+
 '<clipPath id="rwHeadClip"><path d="'+HEAD+'"/></clipPath>';
}
function eyeMarkup(i,x,y){
 const s=i?1:-1;
 return '<g class="rw-eye" data-i="'+i+'" transform="translate('+x+' '+y+')">'+
  '<circle r="46" fill="url(#rwEyeGlow)" class="re-glow"/>'+
  // 튀어나온 눈두덩과 주름
  '<ellipse rx="52" ry="40" fill="#3e040e"/>'+
  '<ellipse rx="52" ry="40" fill="url(#rwSide)" opacity=".5"/>'+
  '<path d="M-46,-14 C-30,-34 30,-34 46,-14 M-40,20 C-20,32 20,32 40,20 M-50,2 C-40,-26 40,-26 50,2" fill="none" stroke="#24020a" stroke-opacity=".6" stroke-width="2.4"/>'+
  '<path d="M-44,-18 C-28,-36 28,-36 44,-18" fill="none" stroke="#ff9a8a" stroke-opacity=".22" stroke-width="1.4"/>'+
  // 작고 깊은 눈
  '<ellipse rx="22" ry="15" fill="#120206"/>'+
  '<ellipse rx="19" ry="12.5" fill="#060103"/>'+
  '<g class="re-iris"><ellipse rx="15" ry="10" fill="#2a0408"/>'+
   '<rect class="re-pupil" x="-12" y="-2" width="24" height="4" rx="2" fill="url(#rwPupil)"/></g>'+
  '<ellipse cx="'+(-6*s)+'" cy="-5" rx="4" ry="2.4" fill="#ffe6dc" opacity=".55"/>'+
  '<path class="re-lid" fill="#4a0510" stroke="#1c0206" stroke-width="2"/>'+
  '<path d="M-24,4 Q0,22 24,4" fill="none" stroke="#1c0206" stroke-opacity=".75" stroke-width="2.6"/>'+
 '</g>';
}
function headMarkup(){
 const r=seeded(5);
 // 섬처럼 솟은 혹 · 따개비 같은 덩어리
 let warts='',barn='',weed='',folds='';
 for(let i=0;i<34;i++){const a=r()*TAU,rad=Math.sqrt(r()),x=Math.cos(a)*rad*165,y=-190+Math.sin(a)*rad*150,sz=1.5+r()*3.5;
  warts+='<ellipse cx="'+n1(x)+'" cy="'+n1(y)+'" rx="'+n1(sz*1.3)+'" ry="'+n1(sz*.8)+'"/><path d="M'+n1(x-sz)+','+n1(y-sz*.5)+' q'+n1(sz)+','+n1(-sz*.7)+' '+n1(sz*2)+',0" fill="none" stroke="#ff9c8a" stroke-opacity=".18"/>';}
 [[-70,-330,9],[20,-352,7],[96,-300,8],[-120,-250,6],[60,-250,5]].forEach(([x,y,n])=>{for(let k=0;k<n;k++){const xx=x+(r()-.5)*44,yy=y+(r()-.5)*22,rr=2.5+r()*4;barn+='<ellipse cx="'+n1(xx)+'" cy="'+n1(yy)+'" rx="'+n1(rr)+'" ry="'+n1(rr*.8)+'"/><circle cx="'+n1(xx)+'" cy="'+n1(yy-rr*.2)+'" r="'+n1(rr*.35)+'" fill="#3a1612"/>';}});
 for(let i=0;i<7;i++){const x=-150+i*50+(r()-.5)*20,y0=-300+Math.abs(x)*.4;weed+='<path class="rh-weed" data-i="'+i+'" data-x="'+n1(x)+'" data-y="'+n1(y0)+'" data-l="'+n1(60+r()*80)+'" fill="none" stroke="#1a0a06" stroke-opacity=".7" stroke-width="'+n1(2+r()*2.5)+'" stroke-linecap="round"/>';}
 for(let i=0;i<9;i++){const y=-300+i*32,x0=-150+Math.abs(y+170)*.15;let d='M'+n1(-x0-(r()*20))+','+n1(y);for(let x=-x0;x<x0;x+=34)d+=' Q'+n1(x+17)+','+n1(y+(r()-.5)*10)+' '+n1(x+34)+','+n1(y+(r()-.5)*4);folds+='<path d="'+d+'"/>';}
 let runoff='';for(let i=0;i<10;i++){const x=-140+i*30+(r()-.5)*10;runoff+='<path d="M'+n1(x)+','+n1(-320+Math.abs(x)*.35)+' C'+n1(x-4)+',-200 '+n1(x+3)+',-100 '+n1(x-3)+',40" stroke-width="'+n1(2.5+r()*3.5)+'" stroke-dasharray="'+Math.round(40+r()*60)+' '+Math.round(30+r()*40)+'"/>';}
 let roots='';ROOTS.forEach((f,i)=>{roots+='<g class="rh-root" data-i="'+i+'"><path class="rr-b" fill="url(#rwRoot)" stroke="#120105" stroke-width="1.2"/><path class="rr-r" fill="none" stroke="#ff8f7a" stroke-opacity=".2" stroke-width="1.6"/></g>';});
 return '<g class="rw-head">'+
  // 진흙 속으로 뻗은 굵은 팔뿌리
  '<g class="rh-roots">'+roots+'</g>'+
  // 외투막(크라켄의 둥근 머리)
  '<path d="'+MANTLE+'" fill="url(#rwHSkin)"/>'+
  '<g clip-path="url(#rwMantleClip)">'+
   '<rect x="-240" y="-410" width="480" height="400" filter="url(#rwSkinFine)" opacity=".55"/>'+
   '<rect x="-240" y="-410" width="480" height="400" filter="url(#rwSkinTex)" opacity=".55"/>'+
   '<rect x="-240" y="-410" width="480" height="400" filter="url(#rwSpots)" opacity=".18"/>'+
   '<g fill="none" stroke="#2a020a" stroke-opacity=".5" stroke-width="2.2" stroke-linecap="round">'+folds+'</g>'+
   '<g fill="#3e040e" stroke="#120104" stroke-opacity=".4" stroke-width=".7">'+warts+'</g>'+
   '<g fill="#a07a70" opacity=".3" stroke="#2a0e0a" stroke-width=".8">'+barn+'</g>'+
   '<ellipse cx="50" cy="-310" rx="130" ry="40" fill="url(#rwSheenH)"/>'+
   '<path d="'+MANTLE+'" fill="url(#rwSide)"/>'+
   '<g class="rh-runoff" fill="none" stroke="#f0dcd6" stroke-linecap="round" filter="url(#rwRun)" opacity="0">'+runoff+'</g>'+
  '</g>'+
  '<path d="M-156,-328 C-114,-388 -32,-412 40,-398 C98,-388 134,-362 162,-328 C188,-298 216,-282 224,-226 C238,-140 212,-70 160,-24" fill="none" stroke="#ffc4b2" stroke-opacity=".42" stroke-width="2.4" filter="url(#rwRim)"/>'+
  // 머리(눈과 팔뿌리가 모이는 부분)
  '<ellipse cx="0" cy="-24" rx="200" ry="40" fill="#080003" opacity=".6" filter="url(#rwGlowF)"/>'+
  '<path d="'+HEAD+'" fill="url(#rwHFace)"/>'+
  '<g clip-path="url(#rwHeadClip)">'+
   '<rect x="-220" y="-100" width="440" height="200" filter="url(#rwSkinFine)" opacity=".6"/>'+
   '<rect x="-220" y="-100" width="440" height="200" filter="url(#rwSkinTex)" opacity=".6"/>'+
   '<path d="M-60,40 C-30,60 30,60 60,40 M-20,70 C-8,78 8,78 20,70 M-90,-60 C-40,-70 40,-70 90,-60" fill="none" stroke="#1a0206" stroke-opacity=".6" stroke-width="3"/>'+
   '<path d="'+HEAD+'" fill="url(#rwSide)"/>'+
  '</g>'+
  EYES.map((e,i)=>eyeMarkup(i,e[0],e[1])).join('')+
 '</g>';
}
// 팔뿌리 흔들기 · 해초 · 물줄기 · 눈(깜빡임/동공/붉은 빛)
function paintHead(g,t,o){
 o=o||{};
 const limp=o.limp||0;
 const c=g._rh||(g._rh={roots:Array.from(g.querySelectorAll('.rh-root')),eyes:Array.from(g.querySelectorAll('.rw-eye')),weeds:Array.from(g.querySelectorAll('.rh-weed')),run:g.querySelector('.rh-runoff')});
 c.roots.forEach(n=>{
  const f=ROOTS[+n.dataset.i],sp=[],ws=[],N=10;let ang=f.ang,p=[f.x,f.y];sp.push(p);
  for(let j=1;j<=N;j++){const u=j/N;ang+=(Math.sin(t*.9+f.ph+u*2.5)*4*(1-limp)+(f.x<0?1:-1)*u*3+limp*(f.x<0?-2:2));p=pol(p,ang,f.len/N);sp.push(p);}
  for(let j=0;j<=N;j++)ws.push(f.w*(1-j/N*.75));
  const T=tube(sp,ws);
  const b=n._b||(n._b=n.querySelector('.rr-b')),rm=n._r||(n._r=n.querySelector('.rr-r'));
  b.setAttribute('d',T.d);rm.setAttribute('d',catmull((f.x<0?T.R:T.L).slice(1,-2)));
 });
 c.weeds.forEach(w=>{const x=+w.dataset.x,y=+w.dataset.y,l=+w.dataset.l,i=+w.dataset.i,sw=Math.sin(t*1.1+i)*8;
  w.setAttribute('d','M'+n1(x)+','+n1(y)+' q'+n1(sw*.5)+','+n1(l*.5)+' '+n1(sw)+','+n1(l));});
 if(c.run){c.run.setAttribute('opacity',n3(.22*(o.wet||0)));c.run.style.strokeDashoffset=n1(-t*110);}
 const open=o.open==null?1:o.open,dil=o.dilate==null?1:o.dilate,look=o.look||[0,0],glow=o.glow==null?1:o.glow;
 c.eyes.forEach(e=>{
  const lid=e._lid||(e._lid=e.querySelector('.re-lid')),iris=e._ir||(e._ir=e.querySelector('.re-iris')),pu=e._pu||(e._pu=e.querySelector('.re-pupil')),gl=e._gl||(e._gl=e.querySelector('.re-glow'));
  const top=-17+(1-open)*32;
  lid.setAttribute('d','M-26,-20 L26,-20 L26,'+n1(top)+' Q0,'+n1(top+(open<.95?10:6))+' -26,'+n1(top)+' Z');
  iris.setAttribute('transform','translate('+n1(clamp(look[0]*.4,-4,4))+' '+n1(clamp(look[1]*.3,-2,2))+')');
  const h=4*Math.max(.35,dil),wd=24*(0.7+Math.min(1.4,dil)*.3);pu.setAttribute('x',n1(-wd/2));pu.setAttribute('width',n1(wd));pu.setAttribute('y',n1(-h/2));pu.setAttribute('height',n1(h));pu.setAttribute('rx',n1(h/2));
  pu.setAttribute('opacity',n3(.25+.75*glow));gl.setAttribute('opacity',n3(.7*glow*open));
 });
}

/* ---------- 열리는 꼬리: 고래 꼬리가 갈라지며 빨판 꽃잎 사이로 붉은 핵이 드러남 (원점=수면 위 꼬리 뿌리) ---------- */
const PETAL='M-24,0 C-40,-56 -26,-124 0,-166 C26,-124 40,-56 24,0 Z';
const FLUKE_L='M0,0 C-50,-18 -140,-40 -236,-120 C-196,-60 -130,-6 -30,26 Z';
function tailMarkup(){
 let petals='';
 for(let i=0;i<5;i++){
  let sk='';for(let k=0;k<6;k++)sk+='<circle cx="0" cy="'+(-18-k*24)+'" r="'+n1(7-k*.8)+'"/><circle class="in" cx="0" cy="'+(-18-k*24)+'" r="'+n1(3-k*.35)+'"/>';
  petals+='<g class="rt-petal" data-i="'+i+'"><path d="'+PETAL+'" fill="url(#rwArmSkin)" stroke="#2a0208" stroke-width="1.4"/><path class="rt-pdry" d="'+PETAL+'" fill="url(#rwDryP)" opacity="0"/>'+
   '<path d="M0,-6 L0,-158" stroke="#3a0210" stroke-opacity=".5" stroke-width="10" stroke-linecap="round"/>'+
   '<g class="rt-suck" fill="#f08a86" stroke="#5a0614" stroke-width="1">'+sk.replace(/class="in"/g,'class="in" fill="#3a0210" stroke="none"')+'</g></g>';
 }
 return '<g class="rw-tail">'+
  '<path class="rt-stalk" fill="url(#rwArmSkin)" stroke="#2a0208" stroke-width="1.5"/>'+
  '<path class="rt-stalktex" fill="#000" filter="url(#rwSkinTex)" opacity=".6"/><path class="rt-stalkdry" fill="url(#rwDryS)" opacity="0"/>'+
  '<g class="rt-fluke" data-s="-1"><path d="'+FLUKE_L+'" fill="url(#rwMantle)" stroke="#2a0208" stroke-width="1.4"/><path d="M-20,10 C-90,-8 -160,-40 -220,-104" fill="none" stroke="#ff9c8c" stroke-opacity=".3" stroke-width="2"/></g>'+
  '<g class="rt-fluke" data-s="1"><g transform="scale(-1 1)"><path d="'+FLUKE_L+'" fill="url(#rwMantle)" stroke="#2a0208" stroke-width="1.4"/><path d="M-20,10 C-90,-8 -160,-40 -220,-104" fill="none" stroke="#ff9c8c" stroke-opacity=".3" stroke-width="2"/></g></g>'+
  petals+
  '<g class="rt-core"><circle class="rt-cglow" r="90" fill="url(#rwCoreGlow)"/><ellipse class="rt-hole" rx="26" ry="19" fill="url(#rwCore)"/><ellipse class="rt-pulse" rx="16" ry="11" fill="#ffd2a0"/>'+dryMarkup()+'</g>'+
 '</g>';
}
/* 스스로 말라 가는 핵: 하얗게 바래는 막 + 가지 치며 번지는 갈라짐(가늘어지는 면) */
function dryMarkup(){
 const r=seeded(57);let cr='';
 for(let i=0;i<9;i++){const a=i/9*360+r()*24,L=26+r()*24,w=1.2+r()*1.3,b=.45+r()*.3,ba=(r()<.5?-1:1)*(28+r()*24),bl=L*(.35+r()*.3);
  cr+='<g class="rt-crack" data-i="'+i+'" data-k="'+n3((i%3)/3+r()*.2)+'" transform="rotate('+n1(a)+')">'+
   '<path d="M0,'+n1(-w)+' C'+n1(L*.3)+','+n1(-w*.8+2)+' '+n1(L*.6)+','+n1(-w*.4-1)+' '+n1(L)+',0 C'+n1(L*.6)+','+n1(w*.4+1)+' '+n1(L*.3)+','+n1(w*.8-2)+' 0,'+n1(w)+' Z"/>'+
   '<path transform="translate('+n1(L*b)+' 0) rotate('+n1(ba)+')" d="M0,'+n1(-w*.6)+' L'+n1(bl)+',0 L0,'+n1(w*.6)+' Z"/></g>';}
 return '<g class="rt-dry" opacity="0"><ellipse class="rt-drymem" rx="27" ry="20" fill="url(#rwDry)"/><g class="rt-cracks" fill="#fbf4e8" stroke="#8d7b66" stroke-width=".35">'+cr+'</g></g>';
}
function tailDefs(){
 return '<radialGradient id="rwCore"><stop stop-color="#ffe2b0"/><stop offset=".35" stop-color="#ff5a2a"/><stop offset=".75" stop-color="#b0081e"/><stop offset="1" stop-color="#3a0208"/></radialGradient>'+
  '<linearGradient id="rwDryP" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#f6eee2"/><stop offset=".45" stop-color="#e2d2bc" stop-opacity=".85"/><stop offset="1" stop-color="#c9b398" stop-opacity="0"/></linearGradient>'+
  '<linearGradient id="rwDryS" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#efe4d4" stop-opacity=".9"/><stop offset=".6" stop-color="#d6c3aa" stop-opacity=".35"/><stop offset="1" stop-color="#b59c80" stop-opacity="0"/></linearGradient>'+
  '<radialGradient id="rwDry"><stop stop-color="#fffaf0"/><stop offset=".45" stop-color="#efe4d2" stop-opacity=".95"/><stop offset=".8" stop-color="#c8b49a" stop-opacity=".75"/><stop offset="1" stop-color="#8d7258" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="rwCoreGlow"><stop stop-color="#ff4a2a" stop-opacity=".55"/><stop offset=".5" stop-color="#ff2a2a" stop-opacity=".15"/><stop offset="1" stop-color="#ff2a2a" stop-opacity="0"/></radialGradient>';
}
// o: {h 꼬리 높이, open 0~1, pulse, sway, limp 0~1}
function paintTail(g,o){
 const c=g._rt||(g._rt={dry:g.querySelector('.rt-dry'),mem:g.querySelector('.rt-drymem'),cracks:Array.from(g.querySelectorAll('.rt-crack')),cg:g.querySelector('.rt-cglow'),stalk:g.querySelector('.rt-stalk'),tex:g.querySelector('.rt-stalktex'),fl:Array.from(g.querySelectorAll('.rt-fluke')),core:g.querySelector('.rt-core'),pu:g.querySelector('.rt-pulse'),hole:g.querySelector('.rt-hole'),pe:Array.from(g.querySelectorAll('.rt-petal'))});
 const h=o.h||300,op=clamp(o.open||0,0,1),sw=o.sway||0,limp=o.limp||0;
 const top=[sw,-h],mid=[sw*.4,-h*.5];
 const sp=[[0,40],[mid[0],mid[1]],top],ws=[110,74,46];
 // 꼬리 기둥: 아래가 굵고 위로 가늘어짐
 const L=[[-ws[0]/2,40],[mid[0]-ws[1]/2,mid[1]],[top[0]-ws[2]/2,top[1]]],R=[[ws[0]/2,40],[mid[0]+ws[1]/2,mid[1]],[top[0]+ws[2]/2,top[1]]];
 const d=catmull(L.concat(R.slice().reverse()),true);
 c.stalk.setAttribute('d',d);c.tex.setAttribute('d',d);
 const sd=c.sdry||(c.sdry=g.querySelector('.rt-stalkdry'));if(sd){sd.setAttribute('d',d);sd.setAttribute('opacity',n3(.85*clamp((o.dry||0)*1.3-.3,0,1)));}
 c.fl.forEach(f=>{const s=+f.dataset.s;f.setAttribute('transform','translate('+n1(top[0]+s*14)+' '+n1(top[1]+6)+') rotate('+n1(s*(op*38-limp*40)+sw*.05)+')');});
 c.core.setAttribute('transform','translate('+n1(top[0])+' '+n1(top[1]-8)+') scale('+n3(.2+.8*op)+')');
 c.core.setAttribute('opacity',n3(op*(1-limp*.85)));
 const p=o.pulse||0,dr=clamp(o.dry||0,0,1),cru=clamp(o.crumble||0,0,1);c.pu.setAttribute('rx',n1(14+6*p));c.pu.setAttribute('ry',n1(9+4*p));
 // 스스로 말라 감: 맥동이 잦아들고, 하얀 막이 덮이며 갈라짐이 안쪽에서 바깥으로 번짐 → 부스러짐
 c.pu.setAttribute('opacity',n3(1-dr));if(c.cg)c.cg.setAttribute('opacity',n3(1-.8*dr));
 if(c.dry){c.dry.setAttribute('opacity',n3(Math.min(1,dr*1.6)*(1-cru)));c.mem.setAttribute('opacity',n3(.35+.65*dr));
  c.cracks.forEach(k=>{const kk=+k.dataset.k,v=clamp((dr-kk*.6)/.45,0,1),a=k._a||(k._a=k.getAttribute('transform'));k.setAttribute('transform',a+' scale('+n3(v*(1+cru*.6))+' '+n3(.6+.4*v)+')');});}
 if(cru>0)c.core.setAttribute('transform','translate('+n1(top[0])+' '+n1(top[1]-8+cru*10)+') scale('+n3((.2+.8*op)*(1-.7*cru))+')');
 const base=[-62,-30,0,30,62];
 c.pe.forEach((e,i)=>{const pd=e._pd||(e._pd=e.querySelector('.rt-pdry'));if(pd)pd.setAttribute('opacity',n3(.9*clamp((o.dry||0)*1.25-i%2*.12,0,1)));const a=base[i]*(.12+.88*op)*(1-limp*.6)+(limp?(i-2)*8*limp:0)+Math.sin((o.t||0)*3+i)*2*op;
  e.setAttribute('transform','translate('+n1(top[0])+' '+n1(top[1]+4)+') rotate('+n1(a)+') scale('+n3(.7+.3*op)+' '+n3((.75+.25*op)*(1-limp*.35))+')');});
 return [top[0],top[1]-8];
}

window.RedWhaleV3Kit={tailMarkup,tailDefs,paintTail,catmull,tube,arm,armMarkup,paintArm,headDefs,headMarkup,paintHead,MANTLE,HEAD,EYES};
})();
