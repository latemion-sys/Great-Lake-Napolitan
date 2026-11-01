/* 희귀 고래 두 종 · 조우 장면 (원작 그림을 옮기지 않고, 받은 인상만으로 새로 그림)
   천가닥 줄기 고래: 밤 호수 위로 수천 가닥의 줄기가 꼬이며 솟은 덩어리. 늘어진 가닥이 흔들리고, 수면엔 작은 불빛들이 떠 있음
   구멍 손바닥 고래: 폭풍 속 검푸른 살덩이. 둥근 구멍이 셀 수 없이 뚫렸고 갈라진 틈마다 청록빛이 그물처럼 흐름. 번개가 칠 때 드러남
   window.RareWhaleFx024 = {html(id, battle)} */
(function(){
'use strict';
const W=960,H=540,SEA=332,TAU=Math.PI*2;
const n1=v=>(Math.round(v*10)/10).toString(),n3=v=>(Math.round(v*1000)/1000).toString();
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
function seeded(n){let s=n;return ()=>((s=(s*16807)%2147483647)/2147483647);}
// 점들을 부드러운 닫힌 곡선으로
function smooth(pts,closed){
 let d='M'+n1(pts[0][0])+','+n1(pts[0][1]);const N=pts.length;
 for(let i=0;i<(closed?N:N-1);i++){
  const p0=pts[(i-1+N)%N],p1=pts[i],p2=pts[(i+1)%N],p3=pts[(i+2)%N];
  const a=closed||i>0?p0:p1,b=closed||i<N-2?p3:p2;
  d+=' C'+n1(p1[0]+(p2[0]-a[0])/6)+','+n1(p1[1]+(p2[1]-a[1])/6)+' '+n1(p2[0]-(b[0]-p1[0])/6)+','+n1(p2[1]-(b[1]-p1[1])/6)+' '+n1(p2[0])+','+n1(p2[1]);
 }
 return d+(closed?' Z':'');
}
// 중심선을 따라 굵기가 변하는 면(선 대신 채워진 띠)
function ribbon(c,w){
 const L=[],R=[];
 for(let i=0;i<c.length;i++){
  const p=c[i],q=c[Math.min(c.length-1,i+1)],o=c[Math.max(0,i-1)];
  let dx=q[0]-o[0],dy=q[1]-o[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
  const ww=w(i/(c.length-1))/2;L.push([p[0]-dy*ww,p[1]+dx*ww]);R.push([p[0]+dy*ww,p[1]-dx*ww]);
 }
 return smooth(L.concat(R.reverse()),true);
}
function shell(id,svg,label){
 return '<div class="pallid-cine-v2 rare-fx-024" data-rare="'+id+'" role="img" aria-label="'+label+'">'+svg+
  '<span class="cine-top" aria-hidden="true">'+label+'</span><span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}
function boat(){
 return '<g class="rx-boat"><path d="M-62,0 L58,0 L46,16 L-50,16 Z" fill="#05070b"/><path d="M-32,0 L-32,-58 L-28,-58 L-28,0 Z M-30,-52 L22,-9 L20,-6 L-30,-48 Z" fill="#05070b"/>'+
  '<path d="M-26,-54 L-26,-6 L18,-6 Z" fill="#0b0f16"/><circle cx="40" cy="-14" r="5" fill="#ffd38a"/><circle cx="40" cy="-14" r="22" fill="url(#rxLamp)"/>'+
  '<path d="M24,0 L24,-22 L34,-22 L34,0 Z M28,-22 a5,5 0 1 1 0.1,0" fill="#05070b"/></g>';
}

/* ====================== 천가닥 줄기 고래 ====================== */
function stemSvg(){
 const r=seeded(911);
 let defs='<defs>'+
  '<linearGradient id="rxSkyS" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0b1426"/><stop offset=".62" stop-color="#16213a"/><stop offset=".86" stop-color="#3a2b2a"/><stop offset="1" stop-color="#6b3f22"/></linearGradient>'+
  '<linearGradient id="rxSeaS" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#10172a"/><stop offset="1" stop-color="#05070e"/></linearGradient>'+
  '<linearGradient id="rxStrand" x1="0" x2="1"><stop stop-color="#2a2420"/><stop offset=".35" stop-color="#6d6152"/><stop offset=".55" stop-color="#8a7c68"/><stop offset=".8" stop-color="#3b322a"/><stop offset="1" stop-color="#1a1512"/></linearGradient>'+
  '<linearGradient id="rxStrandD" x1="0" x2="1"><stop stop-color="#15110f"/><stop offset=".5" stop-color="#3d342b"/><stop offset="1" stop-color="#110d0b"/></linearGradient>'+
  '<radialGradient id="rxLamp"><stop stop-color="#ffd38a" stop-opacity=".7"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="rxFloat"><stop stop-color="#fff0b8"/><stop offset=".3" stop-color="#ffc24a" stop-opacity=".8"/><stop offset="1" stop-color="#ff9a2a" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="rxFloatR" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffcf5a" stop-opacity=".7"/><stop offset="1" stop-color="#ff9a2a" stop-opacity="0"/></linearGradient>'+
  '<radialGradient id="rxMist"><stop stop-color="#7a6a5e" stop-opacity=".35"/><stop offset="1" stop-color="#7a6a5e" stop-opacity="0"/></radialGradient>'+
  '<filter id="rxBlur3"><feGaussianBlur stdDeviation="3"/></filter><filter id="rxBlur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>'+
  '<clipPath id="rxAbove"><rect width="'+W+'" height="'+SEA+'"/></clipPath></defs>';
 let s=defs+'<rect width="'+W+'" height="'+SEA+'" fill="url(#rxSkyS)"/>';
 // 지평선의 주황 띠(흐릿한 면)
 s+='<ellipse cx="480" cy="'+SEA+'" rx="700" ry="26" fill="#c46a2c" opacity=".35" filter="url(#rxBlur8)"/>';
 // 줄기 덩어리: 뒤쪽(어두운) → 앞쪽(밝은) 가닥들, 위로 갈수록 화면 밖으로
 let back='',front='',hang='';
 for(let i=0;i<34;i++){
  const x0=520+(r()-.5)*260,ph=r()*TAU,amp=10+r()*26,tw=1.6+r()*1.8,w0=10+r()*16,lean=(r()-.5)*120,dark=i<14;
  const pts=[];for(let k=0;k<=14;k++){const u=k/14;pts.push([x0+lean*u*u+Math.sin(u*tw*TAU+ph)*amp*(0.4+u),SEA+20-u*(SEA+120)]);}
  const d=ribbon(pts,u=>w0*(1.25-.55*u));
  const g='<path class="rx-strand" data-i="'+i+'" data-ph="'+n3(ph)+'" d="'+d+'" fill="url(#'+(dark?'rxStrandD':'rxStrand')+')" stroke="#0c0907" stroke-width=".8"/>';
  if(dark)back+=g;else front+=g;
  // 가닥 위 무늬(꼬임 마디): 작은 타원 면
  if(!dark)for(let k=2;k<13;k+=2+Math.floor(r()*2)){const p=pts[k];front+='<ellipse cx="'+n1(p[0])+'" cy="'+n1(p[1])+'" rx="'+n1(w0*.42)+'" ry="'+n1(3+r()*3)+'" fill="#a99780" opacity="'+n3(.25+r()*.25)+'" transform="rotate('+n1((r()-.5)*40)+' '+n1(p[0])+' '+n1(p[1])+')"/>';}
 }
 for(let i=0;i<16;i++){
  const x=380+r()*320,y=40+r()*200,L=60+r()*160,w=1.6+r()*1.8;
  hang+='<path class="rx-hang" data-i="'+i+'" data-x="'+n1(x)+'" data-y="'+n1(y)+'" data-l="'+n1(L)+'" data-w="'+n3(w)+'" fill="#2a221c" opacity=".9"/>';
 }
 s+='<g clip-path="url(#rxAbove)"><g class="rx-mass">'+back+front+'</g><g class="rx-hangs">'+hang+'</g></g>';
 s+='<rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" fill="url(#rxSeaS)"/>';
 // 덩어리의 물그림자(흐릿한 면)
 s+='<ellipse cx="520" cy="'+(SEA+40)+'" rx="190" ry="40" fill="#2e2620" opacity=".55" filter="url(#rxBlur8)"/>';
 // 물 위에 떠 있는 작은 불빛들(원근: 멀수록 작고 촘촘)
 let fl='';
 for(let i=0;i<46;i++){
  const z=Math.pow(r(),1.6),y=SEA+6+z*(H-SEA-20),x=r()*W,sc=.35+z*1.6;
  if(Math.abs(x-520)<140*sc&&y<SEA+60)continue;
  fl+='<g class="rx-float" data-i="'+i+'" data-p="'+n3(r()*TAU)+'" transform="translate('+n1(x)+' '+n1(y)+') scale('+n3(sc)+')">'+
   '<rect x="-3" y="-14" width="6" height="14" rx="2" fill="#ffcf5a"/><ellipse cy="-8" rx="16" ry="18" fill="url(#rxFloat)"/>'+
   '<rect x="-3" y="1" width="6" height="'+n1(16+z*20)+'" fill="url(#rxFloatR)" opacity=".7"/></g>';
 }
 s+='<g class="rx-floats">'+fl+'</g>';
 s+='<ellipse class="rx-mist" cx="520" cy="'+(SEA+4)+'" rx="260" ry="34" fill="url(#rxMist)"/>';
 s+='<g transform="translate(190 '+(SEA+22)+') scale(1.25)">'+boat()+'</g>';
 return '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+s+'</svg>';
}
function stemPaint(el,t){
 const c=el._rx||(el._rx={m:el.querySelector('.rx-mass'),h:[...el.querySelectorAll('.rx-hang')],f:[...el.querySelectorAll('.rx-float')],mist:el.querySelector('.rx-mist'),b:el.querySelector('.rx-boat')});
 c.m.setAttribute('transform','translate(520 '+SEA+') skewX('+n3(Math.sin(t*.35)*1.6)+') translate(-520 -'+SEA+')');
 c.h.forEach(e=>{const x=+e.dataset.x,y=+e.dataset.y,L=+e.dataset.l,w=+e.dataset.w,i=+e.dataset.i,pts=[];
  for(let k=0;k<=8;k++){const u=k/8;pts.push([x+Math.sin(t*.9+i+u*3)*14*u+Math.sin(t*2.1+i*2)*3*u,y+u*L]);}
  e.setAttribute('d',ribbon(pts,u=>w*2*(1-u*.8)));});
 c.f.forEach(e=>{const p=+e.dataset.p;e.style.opacity=n3(.75+.25*Math.sin(t*2+p));});
 c.mist.setAttribute('rx',n1(260+20*Math.sin(t*.6)));
 c.b.setAttribute('transform','translate(0 '+n1(Math.sin(t*1.4)*2)+') rotate('+n3(Math.sin(t*1.1)*1.5)+')');
}

/* ====================== 구멍 손바닥 고래 ====================== */
function holeSvg(){
 const r=seeded(4243);
 const cx=520,base=SEA+30;
 // 울퉁불퉁한 덩어리 외곽
 const outline=[];for(let i=0;i<=18;i++){const a=Math.PI*(1-i/18),bump=1+.09*Math.sin(a*7+.6)+.05*Math.sin(a*13+2);outline.push([cx+Math.cos(a)*390*bump,base-Math.sin(a)*240*bump*(.82+.18*Math.sin(a*2))]);}   // 큼직한 혹 몇 개로 이루어진 덩어리
 outline.push([cx+380,base+30],[cx-380,base+30]);
 const body=smooth(outline,true);
 let defs='<defs>'+
  '<linearGradient id="rxSkyH" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#040c10"/><stop offset=".55" stop-color="#0a1c22"/><stop offset="1" stop-color="#0f2a2e"/></linearGradient>'+
  '<linearGradient id="rxSeaH" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0c2226"/><stop offset="1" stop-color="#02080a"/></linearGradient>'+
  '<radialGradient id="rxBody" cx=".5" cy=".3" r=".8"><stop stop-color="#163a3a"/><stop offset=".55" stop-color="#0b2023"/><stop offset="1" stop-color="#030a0c"/></radialGradient>'+
  '<radialGradient id="rxHole"><stop stop-color="#000"/><stop offset=".62" stop-color="#03090b"/><stop offset=".82" stop-color="#2d6f6c"/><stop offset=".92" stop-color="#9fe9df"/><stop offset="1" stop-color="#1a3a3a" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="rxLamp"><stop stop-color="#ffd38a" stop-opacity=".7"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="rxShade" cx=".64" cy=".38" r=".75"><stop stop-color="#000" stop-opacity="0"/><stop offset=".45" stop-color="#000" stop-opacity=".2"/><stop offset=".85" stop-color="#010405" stop-opacity=".82"/><stop offset="1" stop-color="#000" stop-opacity=".95"/></radialGradient>'+
  '<radialGradient id="rxFlash"><stop stop-color="#dffcff" stop-opacity=".9"/><stop offset="1" stop-color="#5fe0e0" stop-opacity="0"/></radialGradient>'+
  '<filter id="rxGlow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'+
  '<filter id="rxBlur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>'+
  '<clipPath id="rxBodyClip"><path d="'+body+'"/></clipPath><clipPath id="rxAboveH"><rect width="'+W+'" height="'+(SEA+12)+'"/></clipPath></defs>';
 let s=defs+'<rect width="'+W+'" height="'+H+'" fill="url(#rxSkyH)"/>';
 // 구름 덩어리
 for(let i=0;i<9;i++)s+='<ellipse cx="'+n1(r()*W)+'" cy="'+n1(20+r()*110)+'" rx="'+n1(120+r()*180)+'" ry="'+n1(30+r()*40)+'" fill="#0d2a30" opacity="'+n3(.4+r()*.4)+'" filter="url(#rxBlur6)"/>';
 s+='<path class="rx-bolt" fill="#d9fbff" opacity="0" filter="url(#rxGlow)"/>';
 // 몸통 + 청록 그물(셀 사이 틈) + 구멍
 let cells='';
 const G=26,cols=Math.ceil(800/G)+2,rows=Math.ceil(300/G)+2,V=[];
 for(let j=0;j<rows;j++){V.push([]);for(let i=0;i<cols;i++)V[j].push([cx-400+i*G+(r()-.5)*G*.8,base-290+j*G+(r()-.5)*G*.8]);}
 for(let j=0;j<rows-1;j++)for(let i=0;i<cols-1;i++){
  const q=[V[j][i],V[j][i+1],V[j+1][i+1],V[j+1][i]],m=[(q[0][0]+q[1][0]+q[2][0]+q[3][0])/4,(q[0][1]+q[1][1]+q[2][1]+q[3][1])/4];
  const k=.8+r()*.1,p=q.map(v=>[m[0]+(v[0]-m[0])*k,m[1]+(v[1]-m[1])*k]);
  const shade=['#0a1d20','#0d2629','#071416','#113034'][Math.floor(r()*4)];
  cells+='<path d="'+smooth(p,true)+'" fill="'+shade+'"/>';
 }
 let holes='';
 for(let i=0;i<26;i++){
  const a=Math.PI*(.08+r()*.84),rr=r()*.85,x=cx+Math.cos(a)*360*rr,y=base-Math.sin(a)*230*rr-10;
  const R=10+r()*24,eye=r()<.45;
  holes+='<g class="rx-hole" data-i="'+i+'" transform="translate('+n1(x)+' '+n1(y)+')"><ellipse rx="'+n1(R*1.15)+'" ry="'+n1(R)+'" fill="url(#rxHole)"/>'+
   (eye?'<ellipse class="rx-eye" rx="'+n1(R*.3)+'" ry="'+n1(R*.3)+'" fill="#0a1214" stroke="#cfeee8" stroke-opacity=".7" stroke-width="'+n1(R*.08)+'"/><circle cx="'+n1(-R*.12)+'" cy="'+n1(-R*.12)+'" r="'+n1(R*.08)+'" fill="#fff"/>':'')+'</g>';
 }
 // 이빨 달린 틈(입)
 const mouth='<g transform="translate('+(cx+190)+' '+(base-150)+') rotate(-6) scale(.8 1)"><path d="M-26,-40 C-30,0 -20,40 0,52 C20,40 30,0 26,-40 C14,-50 -14,-50 -26,-40 Z" fill="#020607" stroke="#7fd8cf" stroke-width="2"/>'+
  (()=>{let t='';for(let k=0;k<7;k++){const y=-34+k*11;t+='<path d="M-24,'+y+' l10,4 l-10,4 Z M24,'+y+' l-10,4 l10,4 Z" fill="#d9eee8"/>';}return t;})()+'</g>';
 // 꽂힌 작살 자루(누군가 먼저 덤볐던 흔적)
 const poles='<path d="M'+(cx-240)+','+(base-200)+' l-40,-120 l8,-3 l40,120 Z M'+(cx+150)+','+(base-230)+' l120,-90 l5,6 l-120,90 Z" fill="#141c1f"/>';
 s+='<g clip-path="url(#rxAboveH)"><g class="rx-bodyg"><path d="'+body+'" fill="url(#rxBody)"/>'+
  '<g clip-path="url(#rxBodyClip)"><path class="rx-veins" d="'+body+'" fill="#3fbdb4"/>'+cells+'<path class="rx-shade" d="'+body+'" fill="url(#rxShade)"/>'+holes+mouth+'</g>'+poles+
  '<path d="'+body+'" fill="none" stroke="#7de6dc" stroke-opacity=".5" stroke-width="2"/></g></g>';
 // 흘러내리는 살 · 물
 let drip='';for(let i=0;i<22;i++){const x=cx-340+r()*680;drip+='<path class="rx-drip" data-x="'+n1(x)+'" data-l="'+n1(30+r()*90)+'" data-p="'+n3(r()*TAU)+'" fill="#0b2326" opacity=".9"/>';}
 s+='<g class="rx-drips">'+drip+'</g>';
 s+='<rect y="'+(SEA+12)+'" width="'+W+'" height="'+(H-SEA-12)+'" fill="url(#rxSeaH)"/>';
 // 물에 비친 청록 그물(흐릿함)
 s+='<ellipse cx="'+cx+'" cy="'+(SEA+60)+'" rx="380" ry="46" fill="#1f6a68" opacity=".35" filter="url(#rxBlur6)"/>';
 // 물결 고리(면)
 for(let i=0;i<5;i++)s+='<ellipse class="rx-ring" data-i="'+i+'" cx="'+cx+'" cy="'+(SEA+40)+'" rx="10" ry="3" fill="none" stroke="#5fd0c8" stroke-opacity=".35" stroke-width="3"/>';
 // 빗줄기(가늘고 긴 평행사변형 면)
 let rain='';for(let i=0;i<120;i++)rain+='<path class="rx-rain" data-x="'+n1(r()*(W+200)-100)+'" data-y="'+n1(r()*H)+'" data-v="'+n1(700+r()*500)+'" data-l="'+n1(14+r()*22)+'" fill="#9fd8e0" opacity="'+n3(.12+r()*.25)+'"/>';
 s+='<g class="rx-rains">'+rain+'</g>';
 s+='<g transform="translate(170 '+(SEA+34)+') scale(1.3)">'+boat()+'</g>';
 s+='<rect class="rx-flash" width="'+W+'" height="'+H+'" fill="#bff6ff" opacity="0"/>';
 return '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+s+'</svg>';
}
function holePaint(el,t){
 const c=el._rx||(el._rx={body:el.querySelector('.rx-bodyg'),veins:el.querySelector('.rx-veins'),bolt:el.querySelector('.rx-bolt'),flash:el.querySelector('.rx-flash'),
  holes:[...el.querySelectorAll('.rx-hole')],drip:[...el.querySelectorAll('.rx-drip')],rain:[...el.querySelectorAll('.rx-rain')],rings:[...el.querySelectorAll('.rx-ring')],boat:el.querySelector('.rx-boat')});
 // 번개: 약 4.6초마다 두 번 번쩍임
 const cyc=t%4.6,f=cyc<.08?1:cyc<.16?.2:cyc<.24?.8:Math.max(0,1-(cyc-.24)/.5)*.5;
 c.flash.setAttribute('opacity',n3(f*.28));
 if(cyc<.6){const r=seeded(1+Math.floor(t/4.6)),pts=[];let x=120+r()*720,y=0;while(y<SEA-40){pts.push([x,y]);x+=(r()-.5)*70;y+=26+r()*30;}
  let d='M'+pts.map(p=>n1(p[0]-3)+','+n1(p[1])).join(' L');d+=' L'+pts.slice().reverse().map(p=>n1(p[0]+3)+','+n1(p[1]+4)).join(' L')+' Z';
  c.bolt.setAttribute('d',d);c.bolt.setAttribute('opacity',n3(f));}
 else c.bolt.setAttribute('opacity','0');
 // 그물 빛: 숨 쉬듯 + 번개에 밝아짐
 c.veins.setAttribute('fill-opacity',n3(.55+.2*Math.sin(t*1.3)+.25*f));
 c.body.setAttribute('transform','translate(0 '+n1(Math.sin(t*.5)*4)+')');
 c.holes.forEach(h=>{const i=+h.dataset.i,e=h.querySelector('.rx-eye');if(e){const blink=(t*.7+i*.37)%3<.12?.1:1;e.setAttribute('ry',n1(+e.getAttribute('rx')*blink));}});
 c.drip.forEach(d=>{const x=+d.dataset.x,L=+d.dataset.l,p=+d.dataset.p,k=(t*.4+p)%1,len=L*(.4+.6*k);
  d.setAttribute('d','M'+n1(x-5)+','+(SEA-4)+' C'+n1(x-4)+','+n1(SEA+len*.5)+' '+n1(x-1.5)+','+n1(SEA+len)+' '+n1(x)+','+n1(SEA+len+3)+' C'+n1(x+1.5)+','+n1(SEA+len)+' '+n1(x+4)+','+n1(SEA+len*.5)+' '+n1(x+5)+','+(SEA-4)+' Z');
  d.setAttribute('opacity',n3(.8*(1-k*.6)));});
 c.rain.forEach(d=>{const x0=+d.dataset.x,y0=+d.dataset.y,v=+d.dataset.v,L=+d.dataset.l,y=(y0+t*v)%(H+40)-20,x=x0-(y-y0)*.18;
  d.setAttribute('d','M'+n1(x)+','+n1(y)+' l'+n1(-L*.18)+','+n1(L)+' l1.4,0 l'+n1(L*.18)+','+n1(-L)+' Z');});
 c.rings.forEach(e=>{const i=+e.dataset.i,k=((t*.35+i/5)%1);e.setAttribute('rx',n1(60+k*420));e.setAttribute('ry',n1(6+k*30));e.setAttribute('stroke-opacity',n3(.35*(1-k)));});
 c.boat.setAttribute('transform','translate(0 '+n1(Math.sin(t*1.9)*3)+') rotate('+n3(Math.sin(t*1.5)*3)+')');
}

const KIND={stem:{svg:stemSvg,paint:stemPaint,label:'희귀 고래 · 천가닥 줄기 고래'},hole:{svg:holeSvg,paint:holePaint,label:'희귀 고래 · 구멍 손바닥 고래'}};
const cache={};
function html(id){const k=KIND[id];if(!k)return '';return shell(id,cache[id]||(cache[id]=k.svg()),k.label);}
let t0=performance.now();
function frame(now){
 document.querySelectorAll('.rare-fx-024').forEach(el=>{const k=KIND[el.dataset.rare];if(!k)return;try{k.paint(el,(now-t0)/1000);}catch(e){if(!el._err){el._err=1;console.warn('희귀 고래 장면',e);}}});
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.RareWhaleFx024={html};
})();
