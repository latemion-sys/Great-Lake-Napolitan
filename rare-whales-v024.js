/* 희귀 고래 두 종 · 조우 장면 (원작 그림을 옮기지 않고, 받은 인상만으로 새로 그림)
   천가닥 줄기 고래: 밤 호수 위로 수천 가닥의 줄기가 꼬이며 솟은 덩어리. 가닥마다 감긴 무늬 · 섬유 결 · 지평선 불빛의 테두리.
     늘어진 가닥 끝의 매듭이 흔들리고, 수면엔 작은 등불이 떠 있고, 덩어리는 물에 일렁이며 비침.
   구멍 손바닥 고래: 폭풍 속 검푸른 살덩이. 부풀어 오른 살 조각마다 청록빛 틈이 그물처럼 흐르고(번개에 밝아짐),
     둥근 구멍은 입술처럼 솟은 테두리와 깊은 구덩이 · 그 안의 눈 · 잔이빨. 세로로 갈라진 입, 박힌 작살과 밧줄, 흘러내리는 살.
   window.RareWhaleFx024 = {html(id)} */
(function(){
'use strict';
const K=window.BlueWhaleV3Kit;
const W=960,H=540,SEA=K?K.SEA:336,TAU=Math.PI*2;
const n1=v=>(Math.round(v*10)/10).toString(),n3=v=>(Math.round(v*1000)/1000).toString();
function seeded(n){let s=n;return ()=>((s=(s*16807)%2147483647)/2147483647);}
function smooth(pts,closed){
 let d='M'+n1(pts[0][0])+','+n1(pts[0][1]);const N=pts.length;
 for(let i=0;i<(closed?N:N-1);i++){
  const p0=pts[(i-1+N)%N],p1=pts[i],p2=pts[(i+1)%N],p3=pts[(i+2)%N];
  const a=closed||i>0?p0:p1,b=closed||i<N-2?p3:p2;
  d+=' C'+n1(p1[0]+(p2[0]-a[0])/6)+','+n1(p1[1]+(p2[1]-a[1])/6)+' '+n1(p2[0]-(b[0]-p1[0])/6)+','+n1(p2[1]-(b[1]-p1[1])/6)+' '+n1(p2[0])+','+n1(p2[1]);
 }
 return d+(closed?' Z':'');
}
function edges(c,w){
 const L=[],R=[];
 for(let i=0;i<c.length;i++){
  const p=c[i],q=c[Math.min(c.length-1,i+1)],o=c[Math.max(0,i-1)];
  let dx=q[0]-o[0],dy=q[1]-o[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
  const ww=w(i/(c.length-1))/2;L.push([p[0]-dy*ww,p[1]+dx*ww]);R.push([p[0]+dy*ww,p[1]-dx*ww]);
 }
 return {L,R};
}
function ribbon(c,w){const {L,R}=edges(c,w);return smooth(L.concat(R.reverse()),true);}
function shell(id,svg,label){
 return '<div class="pallid-cine-v2 rare-fx-024" data-rare="'+id+'" role="img" aria-label="'+label+'">'+svg+
  '<span class="cine-top" aria-hidden="true">'+label+'</span><span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}
const svgOpen='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
const boat=()=>K?K.boatMarkup():'';
// 움직이지 않는 무거운 층은 한 번만 그림으로 굳혀(이미지) 매 프레임 다시 그리지 않음
// (SVG 그림 → 화면 배율에 맞춘 비트맵으로 한 번 변환해 두고 같은 장면에서 다시 씀)
const BAKED={};
function baked(defs,st,key){
 const src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'">'+defs+st+'</svg>');
 if(!BAKED[key]){BAKED[key]={src,url:null,busy:false};}
 return '<image class="rx-baked" data-key="'+key+'" width="'+W+'" height="'+H+'" preserveAspectRatio="none" href="'+(BAKED[key].url||src)+'"/>';
}
function bake(img){
 const B=BAKED[img.dataset.key];if(!B)return;
 if(B.url){img.setAttribute('href',B.url);img.dataset.done='1';return;}
 if(B.busy)return;B.busy=true;
 const im=new Image();
 im.onload=function(){try{const k=Math.min(2,Math.max(1,window.devicePixelRatio||1)),c=document.createElement('canvas');c.width=W*k;c.height=H*k;c.getContext('2d').drawImage(im,0,0,W*k,H*k);
  c.toBlob(b=>{if(!b){B.busy=false;return;}B.url=URL.createObjectURL(b);document.querySelectorAll('.rx-baked[data-key="'+img.dataset.key+'"]').forEach(e=>{e.setAttribute('href',B.url);e.dataset.done='1';});},'image/png');}catch(e){img.dataset.done='1';}};
 im.onerror=function(){img.dataset.done='1';};
 im.src=B.src;
}

/* ====================== 천가닥 줄기 고래 ====================== */
function stemStrand(r,x0,depth){
 const ph=r()*TAU,amp=(12+r()*26)*(.6+depth*.3),tw=1.1+r()*1.8,w0=(7+r()*11)*(.7+depth*.55),lean=(r()-.5)*140,top=-140-r()*60;
 const pts=[];const N=22;
 for(let k=0;k<=N;k++){const u=k/N;pts.push([x0+lean*u*u+Math.sin(u*tw*TAU+ph)*amp*(.35+u)+Math.sin(u*9+ph*2)*3,SEA+24-u*(SEA+24-top)]);}
 return {pts,w:u=>w0*(1.3-.5*u)*(1+.12*Math.sin(u*17+ph)),ph,w0};
}
function stemSvg(){
 const r=seeded(911);
 const defs='<defs>'+(K?K.commonDefs():'')+
  '<linearGradient id="rsSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#050a18"/><stop offset=".45" stop-color="#0d1730"/><stop offset=".78" stop-color="#1e2440"/><stop offset=".93" stop-color="#4a2f30"/><stop offset="1" stop-color="#8a4a22"/></linearGradient>'+
  '<radialGradient id="rsHorizon" cx=".5" cy="1" r=".6"><stop stop-color="#ff9a3a" stop-opacity=".55"/><stop offset=".4" stop-color="#d0602a" stop-opacity=".22"/><stop offset="1" stop-color="#d0602a" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="rsSea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1a1a2a"/><stop offset=".25" stop-color="#0c1020"/><stop offset="1" stop-color="#03050c"/></linearGradient>'+
  '<linearGradient id="rsS0" x1="0" x2="1"><stop stop-color="#16161c"/><stop offset=".45" stop-color="#34323a"/><stop offset=".6" stop-color="#3c3a42"/><stop offset="1" stop-color="#121218"/></linearGradient>'+
  '<linearGradient id="rsS1" x1="0" x2="1"><stop stop-color="#1c1714"/><stop offset=".3" stop-color="#4a4036"/><stop offset=".55" stop-color="#6a5c4c"/><stop offset=".8" stop-color="#3a3029"/><stop offset="1" stop-color="#16110e"/></linearGradient>'+
  '<linearGradient id="rsS2" x1="0" x2="1"><stop stop-color="#1a130f"/><stop offset=".22" stop-color="#5a4c3e"/><stop offset=".48" stop-color="#94826a"/><stop offset=".62" stop-color="#a8957a"/><stop offset=".82" stop-color="#4c3e32"/><stop offset="1" stop-color="#140e0b"/></linearGradient>'+
  '<linearGradient id="rsBand" x1="0" x2="1"><stop stop-color="#5a4a3a" stop-opacity="0"/><stop offset=".3" stop-color="#c9b597" stop-opacity=".85"/><stop offset=".55" stop-color="#e2d0b0"/><stop offset=".8" stop-color="#8c7a62" stop-opacity=".8"/><stop offset="1" stop-color="#3a3028" stop-opacity="0"/></linearGradient>'+
  '<linearGradient id="rsBandD" x1="0" x2="1"><stop stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#0c0806" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>'+
  '<linearGradient id="rsRim" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#ffb46a" stop-opacity=".75"/><stop offset=".5" stop-color="#ff9a52" stop-opacity=".25"/><stop offset="1" stop-color="#ff9a52" stop-opacity="0"/></linearGradient>'+
  '<radialGradient id="rsBurl"><stop stop-color="#b8a284"/><stop offset=".5" stop-color="#6a5a48"/><stop offset="1" stop-color="#2a221c" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="rsTop" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#050a18"/><stop offset=".55" stop-color="#050a18" stop-opacity=".6"/><stop offset="1" stop-color="#050a18" stop-opacity="0"/></linearGradient>'+
  '<linearGradient id="rsGlowUp" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#ffa04a" stop-opacity=".45"/><stop offset=".35" stop-color="#ff8a3a" stop-opacity=".12"/><stop offset="1" stop-color="#ff8a3a" stop-opacity="0"/></linearGradient>'+
  '<radialGradient id="rsGlowUpR" cx=".5" cy="1" r=".9"><stop stop-color="#ffa04a" stop-opacity=".42"/><stop offset=".5" stop-color="#ff8a3a" stop-opacity=".12"/><stop offset="1" stop-color="#ff8a3a" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="rsKnot"><stop stop-color="#d8c4a2"/><stop offset=".6" stop-color="#7a6650"/><stop offset="1" stop-color="#2a201a"/></radialGradient>'+
  '<radialGradient id="rsLantern" cx=".5" cy=".4"><stop stop-color="#fff6d8"/><stop offset=".4" stop-color="#ffd27a"/><stop offset="1" stop-color="#d9822a"/></radialGradient>'+
  '<radialGradient id="rsHalo"><stop stop-color="#ffd98a" stop-opacity=".55"/><stop offset=".35" stop-color="#ffb04a" stop-opacity=".2"/><stop offset="1" stop-color="#ff9a2a" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="rsFlame" cx=".5" cy=".7"><stop stop-color="#fffbe8"/><stop offset=".5" stop-color="#ffd060"/><stop offset="1" stop-color="#ff8a1a" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="rsRef" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffc85a" stop-opacity=".75"/><stop offset=".6" stop-color="#ff9a2a" stop-opacity=".25"/><stop offset="1" stop-color="#ff9a2a" stop-opacity="0"/></linearGradient>'+
  '<radialGradient id="rsFoam"><stop stop-color="#e8dccb" stop-opacity=".55"/><stop offset="1" stop-color="#e8dccb" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="rsMist"><stop stop-color="#8a7a70" stop-opacity=".32"/><stop offset="1" stop-color="#8a7a70" stop-opacity="0"/></radialGradient>'+
  '<filter id="rsFiber" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.16 0.014" numOctaves="2" seed="4" result="n"/>'+
   '<feColorMatrix in="n" type="matrix" values="0 0 0 0 .02  0 0 0 0 .015  0 0 0 0 .01  0 0 0 -1.1 .62" result="m"/><feComposite in="m" in2="SourceAlpha" operator="in" result="s"/>'+
   '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s"/></feMerge></filter>'+
  '<filter id="rsHaze" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>'+
  '<filter id="rsBlur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>'+
  '<filter id="rsRipple" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".006 .09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="22" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="1.5"/></filter>'+
  '<clipPath id="rsAbove"><rect width="'+W+'" height="'+SEA+'"/></clipPath><clipPath id="rsBelow"><rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'"/></clipPath></defs>';
 let s=defs+'<rect width="'+W+'" height="'+SEA+'" fill="url(#rsSky)"/>';
 let st='';for(let i=0;i<70;i++){const x=r()*W,y=Math.pow(r(),1.6)*220;st+='<circle class="rs-star" data-p="'+n3(r()*TAU)+'" cx="'+n1(x)+'" cy="'+n1(y)+'" r="'+n1(.4+r()*1.1)+'" fill="#e8ecff" opacity="'+n3(.3+r()*.6)+'"/>';}
 s+='<g>'+st+'</g>';
 for(let i=0;i<6;i++)s+='<ellipse cx="'+n1(r()*W)+'" cy="'+n1(150+r()*120)+'" rx="'+n1(160+r()*220)+'" ry="'+n1(10+r()*16)+'" fill="#2a2a44" opacity="'+n3(.35+r()*.3)+'" filter="url(#rsBlur8)"/>';
 s+='<rect y="'+(SEA-200)+'" width="'+W+'" height="200" fill="url(#rsHorizon)"/>';
 // 덩어리: 그림자 덩이 → 먼/중간/가까운 가닥 → 감긴 띠 · 매듭 · 테두리 빛
 const sil=[];for(let i=0;i<=20;i++){const u=i/20,y=SEA+20-u*(SEA+200);const half=110+90*u*u+20*Math.sin(u*7);sil.push([510-half+(r()-.5)*20,y]);}
 const silR=[];for(let i=20;i>=0;i--){const u=i/20,y=SEA+20-u*(SEA+200);const half=110+90*u*u+20*Math.sin(u*7+1);silR.push([530+half+(r()-.5)*20,y]);}
 let mass='<path d="'+smooth(sil.concat(silR),true)+'" fill="#0c0908"/>';
 const layers=[[],[],[]],counts=[18,24,24];
 for(let d=0;d<3;d++)for(let i=0;i<counts[d];i++){
  const x0=520+(r()-.5)*(d===0?300:d===1?250:210);
  const S=stemStrand(r,x0,d);
  const {L,R}=edges(S.pts,S.w);
  const shape=smooth(L.concat(R.slice().reverse()),true);
  let g=(d>=1?'<path d="'+shape+'" fill="#050302" opacity=".6" transform="translate(4 3)"/>':'')+'<path d="'+shape+'" fill="url(#rsS'+d+')"/>';   // 뒤 가닥과 떨어져 보이도록 그늘
  if(d>=1){
   const step=d===2?2:3;
   for(let k=1;k<L.length-2;k+=step){
    if(r()<.25)continue;
    const a=L[k],b=R[k+1],c2=R[k+2]||R[k+1],e=L[k+1];
    g+='<path d="M'+n1(a[0])+','+n1(a[1])+' Q'+n1((a[0]+b[0])/2)+','+n1((a[1]+b[1])/2-3)+' '+n1(b[0])+','+n1(b[1])+' L'+n1(c2[0])+','+n1(c2[1])+' Q'+n1((e[0]+c2[0])/2)+','+n1((e[1]+c2[1])/2-3)+' '+n1(e[0])+','+n1(e[1])+' Z" fill="url(#rsBand)" opacity="'+n3((d===2?.55:.3)*(.5+r()*.5))+'"/>';
    if(d===2)g+='<path d="M'+n1(e[0])+','+n1(e[1])+' Q'+n1((e[0]+c2[0])/2)+','+n1((e[1]+c2[1])/2-2)+' '+n1(c2[0])+','+n1(c2[1])+' L'+n1(c2[0])+','+n1(c2[1]+3)+' Q'+n1((e[0]+c2[0])/2)+','+n1((e[1]+c2[1])/2+1)+' '+n1(e[0])+','+n1(e[1]+3)+' Z" fill="url(#rsBandD)"/>';
   }
  }
  if(d===2){
   const rim=[];for(let k=0;k<R.length;k++){const p=R[k],q=L[k];rim.push([p[0]-(p[0]-q[0])*.18,p[1]-(p[1]-q[1])*.18]);}
   g+='<path d="'+smooth(R.concat(rim.reverse()),true)+'" fill="url(#rsRim)" opacity="'+n3(.5+r()*.4)+'"/>';
   if(r()<.6){const k=3+Math.floor(r()*(S.pts.length-6)),p=S.pts[k],rr=S.w0*(.7+r()*.4);g+='<ellipse cx="'+n1(p[0])+'" cy="'+n1(p[1])+'" rx="'+n1(rr)+'" ry="'+n1(rr*1.4)+'" fill="url(#rsBurl)" opacity=".8"/>';}
  }
  layers[d].push(g);
 }
 mass+='<g filter="url(#rsHaze)" opacity=".7">'+layers[0].join('')+'</g>'+

  '<g filter="url(#rsFiber)">'+layers[1].join('')+'</g>'+

  '<g filter="url(#rsFiber)">'+layers[2].join('')+'</g>'+
  '<ellipse cx="520" cy="'+(SEA+10)+'" rx="260" ry="150" fill="url(#rsGlowUpR)" style="mix-blend-mode:screen"/>'+
  '<rect x="0" y="-40" width="'+W+'" height="150" fill="url(#rsTop)"/>';
 let hang='';
 for(let i=0;i<26;i++){
  const x=390+r()*280,y=20+r()*230,L=60+r()*190,w=1.8+r()*2.6,bulb=r()<.6;
  hang+='<g class="rs-hang" data-i="'+i+'" data-x="'+n1(x)+'" data-y="'+n1(y)+'" data-l="'+n1(L)+'" data-w="'+n3(w)+'"><path class="rs-hp" fill="#3a2e24"/><path class="rs-hl" fill="#a08a6c" opacity=".55"/>'+
   (bulb?'<ellipse class="rs-hb" rx="'+n1(w*1.9)+'" ry="'+n1(w*3.1)+'" fill="url(#rsKnot)"/>':'')+'</g>';
 }
 s+='<g clip-path="url(#rsAbove)"><g class="rs-mass">'+mass+'</g></g>';
 let live='<g clip-path="url(#rsAbove)"><g class="rs-hangs">'+hang+'</g></g>';
 s+='<rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" fill="url(#rsSea)"/>';
 s+='<ellipse cx="480" cy="'+SEA+'" rx="640" ry="22" fill="#ff8a3a" opacity=".22" filter="url(#rsBlur8)"/>';
 s+='<g clip-path="url(#rsBelow)"><g opacity=".38" filter="url(#rsRipple)"><g transform="translate(0 '+(2*SEA+40)+') scale(1 -1)">'+mass+'</g></g></g>';
 for(let i=0;i<14;i++)s+='<ellipse cx="'+n1(420+r()*200)+'" cy="'+n1(SEA+4+r()*12)+'" rx="'+n1(18+r()*40)+'" ry="'+n1(3+r()*4)+'" fill="url(#rsFoam)"/>';
 for(let i=0;i<4;i++)live+='<ellipse class="rs-ring" data-i="'+i+'" cx="520" cy="'+(SEA+18)+'" rx="10" ry="3" fill="none" stroke="#d8b890" stroke-width="2" opacity="0"/>';
 let fl='',fr='';
 for(let i=0;i<54;i++){
  const z=Math.pow(r(),1.5),y=SEA+5+z*(H-SEA-14),x=r()*W,sc=.28+z*1.7;
  if(Math.abs(x-520)<(150+60*z)&&y<SEA+50)continue;
  if(Math.abs(x-250)<90&&y<SEA+60&&y>SEA+10)continue;
  const tilt=(r()-.5)*14;
  fl+='<g class="rs-float" data-p="'+n3(r()*TAU)+'" data-x="'+n1(x)+'" data-y="'+n1(y)+'" data-s="'+n3(sc)+'" transform="translate('+n1(x)+' '+n1(y)+') scale('+n3(sc)+')">'+
   '<ellipse cy="-10" rx="22" ry="24" fill="url(#rsHalo)"/>'+
   '<g transform="rotate('+n1(tilt)+')"><path d="M-6,0 C-7,-6 -7,-14 -5,-18 L5,-18 C7,-14 7,-6 6,0 Z" fill="url(#rsLantern)"/>'+
   '<path d="M-5,-18 L5,-18 L4,-20 L-4,-20 Z" fill="#6a3a1a"/><path d="M-6,0 L6,0 L5,2 L-5,2 Z" fill="#5a2e14"/>'+
   '<path class="rs-flame" d="M0,-16 C-2.4,-12 -2,-8 0,-6 C2,-8 2.4,-12 0,-16 Z" fill="url(#rsFlame)"/></g>'+
   '<ellipse cy="1.5" rx="9" ry="2.2" fill="#ffd27a" opacity=".5"/></g>';
  fr+='<path d="M'+n1(x-3*sc)+','+n1(y+3)+' L'+n1(x+3*sc)+','+n1(y+3)+' L'+n1(x+1.5*sc)+','+n1(y+3+(14+z*40)*sc)+' L'+n1(x-1.5*sc)+','+n1(y+3+(14+z*40)*sc)+' Z" fill="url(#rsRef)" opacity=".8"/>';
 }
 s+='<g filter="url(#rsRipple)">'+fr+'</g>';
 live+='<g class="rs-floats">'+fl+'</g>';
 live+='<ellipse class="rs-mist" cx="520" cy="'+(SEA+2)+'" rx="300" ry="36" fill="url(#rsMist)"/>';
 live+='<ellipse class="rs-mist2" cx="200" cy="'+(SEA-6)+'" rx="260" ry="20" fill="url(#rsMist)"/>';
 live+=boat();
 return svgOpen+defs+baked(defs,s.slice(defs.length),'stem')+live+'</svg>';
}
function stemPaint(el,t){
 const c=el._rx||(el._rx={h:[...el.querySelectorAll('.rs-hang')].map(g=>({g,p:g.querySelector('.rs-hp'),l:g.querySelector('.rs-hl'),b:g.querySelector('.rs-hb'),x:+g.dataset.x,y:+g.dataset.y,L:+g.dataset.l,w:+g.dataset.w,i:+g.dataset.i})),
  f:[...el.querySelectorAll('.rs-float')].map(g=>({g,fl:g.querySelector('.rs-flame'),p:+g.dataset.p,x:+g.dataset.x,y:+g.dataset.y,s:+g.dataset.s})),
  st:[...el.querySelectorAll('.rs-star')].map(e=>({e,p:+e.dataset.p,o:+e.getAttribute('opacity')})),
  mist:el.querySelector('.rs-mist'),mist2:el.querySelector('.rs-mist2'),rings:[...el.querySelectorAll('.rs-ring')]});
 c.h.forEach(h=>{const pts=[];for(let k=0;k<=10;k++){const u=k/10;pts.push([h.x+Math.sin(t*.8+h.i+u*2.6)*16*u*u+Math.sin(t*2.3+h.i*2)*3*u,h.y+u*h.L*(1-.04*Math.sin(t*.9+h.i))]);}
  h.p.setAttribute('d',ribbon(pts,u=>h.w*2.2*(1-u*.75)));
  const hl=pts.map(p=>[p[0]-h.w*.25,p[1]]);h.l.setAttribute('d',ribbon(hl,u=>h.w*.6*(1-u)));
  if(h.b){const e=pts[pts.length-1];h.b.setAttribute('cx',n1(e[0]));h.b.setAttribute('cy',n1(e[1]+h.w*2));}});
 c.f.forEach(f=>{const bob=Math.sin(t*1.3+f.p)*1.4*f.s;f.g.setAttribute('transform','translate('+n1(f.x)+' '+n1(f.y+bob)+') scale('+n3(f.s)+') rotate('+n1(Math.sin(t*1.1+f.p)*4)+')');
  f.fl.setAttribute('transform','translate(0 -6) scale('+n3(1+.15*Math.sin(t*9+f.p*3))+' '+n3(1+.22*Math.sin(t*11+f.p))+') translate(0 6)');});
 c.mist.setAttribute('transform','translate('+n1(Math.sin(t*.2)*30)+' 0)');c.mist2.setAttribute('transform','translate('+n1(Math.sin(t*.15+2)*40)+' 0)');
 c.rings.forEach(e=>{const i=+e.dataset.i,k=((t*.25+i/4)%1);e.setAttribute('rx',n1(120+k*300));e.setAttribute('ry',n1(6+k*18));e.setAttribute('opacity',n3(.4*(1-k)));e.setAttribute('stroke-width',n1(3-2*k));});
 if(K){const B=Math.sin(t*1.6)*2.2+Math.sin(t*.7)*1.2,R=Math.sin(t*1.25+.6)*2.6;const tw=K.boatPose(el,230,SEA+B,R,[37,-30]);K.lamp(el,t,tw,0);}
}

/* ====================== 구멍 손바닥 고래 ====================== */
function holeSvg(){
 const r=seeded(4243);
 const cx=520,base=SEA+26;
 const outline=[];
 for(let i=0;i<=26;i++){const a=Math.PI*(1-i/26),bump=1+.1*Math.sin(a*7+.6)+.05*Math.sin(a*13+2)+.03*Math.sin(a*23);outline.push([cx+Math.cos(a)*400*bump,base-Math.sin(a)*250*bump*(.8+.2*Math.sin(a*2))]);}
 outline.push([cx+400,base+40],[cx-400,base+40]);
 const body=smooth(outline,true);
 const defs='<defs>'+(K?K.commonDefs():'')+
  '<linearGradient id="rhSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#02070a"/><stop offset=".5" stop-color="#071a1f"/><stop offset="1" stop-color="#0d2b2f"/></linearGradient>'+
  '<linearGradient id="rhSea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0b2328"/><stop offset=".4" stop-color="#05141a"/><stop offset="1" stop-color="#010507"/></linearGradient>'+
  '<radialGradient id="rhBody" cx=".55" cy=".35" r=".8"><stop stop-color="#14363a"/><stop offset=".5" stop-color="#0a1f22"/><stop offset="1" stop-color="#020809"/></radialGradient>'+
  '<radialGradient id="rhCell" cx=".42" cy=".38" r=".7"><stop stop-color="#163538"/><stop offset=".55" stop-color="#0b1d20"/><stop offset=".9" stop-color="#061113"/><stop offset="1" stop-color="#0a1a1c"/></radialGradient>'+
  '<radialGradient id="rhCellB" cx=".4" cy=".35" r=".7"><stop stop-color="#1f4a4a"/><stop offset=".6" stop-color="#0e2729"/><stop offset="1" stop-color="#081618"/></radialGradient>'+
  '<radialGradient id="rhVein" cx=".62" cy=".42" r=".6"><stop stop-color="#8ff2e4"/><stop offset=".45" stop-color="#3fbdb4"/><stop offset="1" stop-color="#14605c"/></radialGradient>'+
  '<radialGradient id="rhShade" cx=".62" cy=".36" r=".78"><stop stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#000" stop-opacity=".18"/><stop offset=".85" stop-color="#010405" stop-opacity=".78"/><stop offset="1" stop-color="#000" stop-opacity=".95"/></radialGradient>'+
  '<radialGradient id="rhGlowIn" cx=".6" cy=".45" r=".5"><stop stop-color="#5fe8d8" stop-opacity=".28"/><stop offset="1" stop-color="#5fe8d8" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="rhPit"><stop stop-color="#000"/><stop offset=".55" stop-color="#010405"/><stop offset=".8" stop-color="#06181a"/><stop offset="1" stop-color="#0d2a2c"/></radialGradient>'+
  '<linearGradient id="rhLip" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#b8f2e8"/><stop offset=".25" stop-color="#3d8a84"/><stop offset=".6" stop-color="#0f2a2c"/><stop offset="1" stop-color="#020809"/></linearGradient>'+
  '<radialGradient id="rhSclera" cx=".4" cy=".35"><stop stop-color="#f2f6ee"/><stop offset=".7" stop-color="#bcc9c0"/><stop offset="1" stop-color="#5e6f6a"/></radialGradient>'+
  '<radialGradient id="rhIris"><stop stop-color="#05110f"/><stop offset=".45" stop-color="#0f3a36"/><stop offset=".8" stop-color="#2f8a80"/><stop offset="1" stop-color="#0a2422"/></radialGradient>'+
  '<linearGradient id="rhTooth" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f4f2e6"/><stop offset=".7" stop-color="#c9c6b0"/><stop offset="1" stop-color="#6a6a58"/></linearGradient>'+
  '<linearGradient id="rhGum" x1="0" x2="1"><stop stop-color="#1a0a0e"/><stop offset=".5" stop-color="#4a1a22"/><stop offset="1" stop-color="#1a0a0e"/></linearGradient>'+
  '<radialGradient id="rhThroat"><stop stop-color="#000"/><stop offset=".7" stop-color="#090304"/><stop offset="1" stop-color="#2a0e14"/></radialGradient>'+
  '<linearGradient id="rhSpec" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e8fffb" stop-opacity=".85"/><stop offset="1" stop-color="#7fe0d4" stop-opacity="0"/></linearGradient>'+
  '<linearGradient id="rhShaft" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#5a6a6c"/><stop offset=".5" stop-color="#2a3436"/><stop offset="1" stop-color="#0c1314"/></linearGradient>'+
  '<linearGradient id="rhRain" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#bfe8ee" stop-opacity="0"/><stop offset="1" stop-color="#bfe8ee" stop-opacity=".7"/></linearGradient>'+
  '<radialGradient id="rhCloudLit" cx=".5" cy="1" r=".8"><stop stop-color="#5aaab0" stop-opacity=".5"/><stop offset="1" stop-color="#0d2a30" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="rhFoam"><stop stop-color="#bfeee6" stop-opacity=".45"/><stop offset="1" stop-color="#bfeee6" stop-opacity="0"/></radialGradient>'+
  '<filter id="rhGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'+
  '<filter id="rhVeinGlow" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5"/></filter>'+
  '<filter id="rhBlur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>'+
  '<filter id="rhSkin" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="3" seed="12" result="n"/><feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 .05  0 0 0 0 .06  0 0 0 -2 1.25" result="m"/><feComposite in="m" in2="SourceAlpha" operator="in"/></filter>'+
  '<filter id="rhRipple" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".008 .12" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="2"/></filter>'+
  '<clipPath id="rhBodyClip"><path d="'+body+'"/></clipPath><clipPath id="rhAbove"><rect width="'+W+'" height="'+(SEA+10)+'"/></clipPath><clipPath id="rhBelow"><rect y="'+(SEA+10)+'" width="'+W+'" height="'+(H-SEA)+'"/></clipPath></defs>';
 let s=defs+'<rect width="'+W+'" height="'+H+'" fill="url(#rhSky)"/>';
 let cl='',clLit='';for(let i=0;i<14;i++){const x=r()*W,y=10+r()*150,rx=110+r()*220,ry=26+r()*44;cl+='<ellipse cx="'+n1(x)+'" cy="'+n1(y)+'" rx="'+n1(rx)+'" ry="'+n1(ry)+'" fill="#081c22" opacity="'+n3(.5+r()*.4)+'" filter="url(#rhBlur6)"/>';clLit+='<ellipse class="rh-cl" cx="'+n1(x)+'" cy="'+n1(y+ry*.4)+'" rx="'+n1(rx*.8)+'" ry="'+n1(ry*.5)+'" fill="url(#rhCloudLit)" opacity="0"/>';}
 s+='<g>'+cl+'</g>';
 let live='<g>'+clLit+'</g><g class="rh-bolts"></g><g class="rh-rain0"></g>',eyes='';
 // ----- 살덩이 -----
 let cells='';
 const G=22,cols=Math.ceil(860/G)+2,rows=Math.ceil(300/G)+2,V=[];
 for(let j=0;j<rows;j++){V.push([]);for(let i=0;i<cols;i++)V[j].push([cx-430+i*G+(r()-.5)*G*.85,base-300+j*G+(r()-.5)*G*.85]);}
 for(let j=0;j<rows-1;j++)for(let i=0;i<cols-1;i++){
  const q=[V[j][i],V[j][i+1],V[j+1][i+1],V[j+1][i]],m=[(q[0][0]+q[1][0]+q[2][0]+q[3][0])/4,(q[0][1]+q[1][1]+q[2][1]+q[3][1])/4];
  const k=.78+r()*.12,p=q.map(v=>[m[0]+(v[0]-m[0])*k+(r()-.5)*2,m[1]+(v[1]-m[1])*k+(r()-.5)*2]);
  cells+='<path d="'+smooth(p,true)+'" fill="url(#'+(r()<.22?'rhCellB':'rhCell')+')"/>';
 }
 let spec='';for(let i=0;i<16;i++){const a=Math.PI*(.15+r()*.7),rr=.55+r()*.35,x=cx+Math.cos(a)*400*rr,y=base-Math.sin(a)*240*rr-6,L=20+r()*40;
  spec+='<path d="M'+n1(x-L)+','+n1(y)+' Q'+n1(x)+','+n1(y-9-r()*5)+' '+n1(x+L)+','+n1(y+2)+' Q'+n1(x)+','+n1(y-3)+' '+n1(x-L)+','+n1(y)+' Z" fill="url(#rhSpec)"/>';}
 let holes='';
 const placed=[];
 for(let n=0;n<60&&placed.length<30;n++){
  const a=Math.PI*(.06+r()*.88),rr=Math.pow(r(),.7)*.86,x=cx+Math.cos(a)*390*rr,y=base-Math.sin(a)*230*rr-14,R=9+r()*26;
  if(placed.some(p=>Math.hypot(p[0]-x,p[1]-y)<p[2]+R+6))continue;
  if(Math.hypot(x-(cx+170),y-(base-150))<70)continue;
  placed.push([x,y,R]);
  const kind=r(),tilt=(r()-.5)*30,sq=.78+r()*.2;
  const tf='translate('+n1(x)+' '+n1(y)+') rotate('+n1(tilt)+') scale(1 '+n3(sq)+')';
  let h='<g class="rh-hole" transform="'+tf+'">'+
   '<ellipse cx="'+n1(R*.12)+'" cy="'+n1(R*.16)+'" rx="'+n1(R*1.42)+'" ry="'+n1(R*1.36)+'" fill="#000" opacity=".55"/>'+
   '<ellipse rx="'+n1(R*1.36)+'" ry="'+n1(R*1.3)+'" fill="url(#rhLip)"/>'+
   '<ellipse cx="'+n1(R*.05)+'" cy="'+n1(R*.06)+'" rx="'+n1(R)+'" ry="'+n1(R*.94)+'" fill="url(#rhPit)"/>';
  if(kind<.42){
   const er=R*.62;
   eyes+='<g class="rh-eye" data-i="'+placed.length+'" data-r="'+n3(er)+'" transform="'+tf+'"><ellipse rx="'+n1(er)+'" ry="'+n1(er*.86)+'" fill="url(#rhSclera)"/>'+
    '<g class="rh-pupil"><circle r="'+n1(er*.52)+'" fill="url(#rhIris)"/><circle r="'+n1(er*.22)+'" fill="#010303"/><ellipse cx="'+n1(-er*.18)+'" cy="'+n1(-er*.2)+'" rx="'+n1(er*.12)+'" ry="'+n1(er*.08)+'" fill="#fff" opacity=".9"/></g>'+
    '<path class="rh-lid" fill="#0a1d20"/></g>';
  }else if(kind<.7){
   const nT=8+Math.floor(r()*8);
   for(let k=0;k<nT;k++){const aa=k/nT*TAU,tx=Math.cos(aa)*R*.92,ty=Math.sin(aa)*R*.88,ln=R*(.22+r()*.2),ix=-Math.cos(aa),iy=-Math.sin(aa),px=-iy,py=ix,bw=R*.11;
    h+='<path d="M'+n1(tx+px*bw)+','+n1(ty+py*bw)+' L'+n1(tx+ix*ln)+','+n1(ty+iy*ln)+' L'+n1(tx-px*bw)+','+n1(ty-py*bw)+' Z" fill="url(#rhTooth)"/>';}
  }else{
   h+='<ellipse rx="'+n1(R*.45)+'" ry="'+n1(R*.4)+'" fill="#3fbdb4" opacity=".18" filter="url(#rhBlur6)"/>';
  }
  holes+=h+'</g>';
 }
 const mx=cx+170,my=base-150;
 let mouth='<g transform="translate('+mx+' '+my+') rotate(-8)">'+
  '<path d="M0,-74 C-34,-50 -42,10 -20,62 C-10,80 10,80 20,62 C42,10 34,-50 0,-74 Z" fill="#000" opacity=".5" transform="translate(5 6)"/>'+
  '<path d="M0,-72 C-32,-50 -40,8 -19,60 C-9,78 9,78 19,60 C40,8 32,-50 0,-72 Z" fill="url(#rhGum)"/>'+
  '<path d="M0,-60 C-20,-40 -26,6 -12,48 C-6,62 6,62 12,48 C26,6 20,-40 0,-60 Z" fill="url(#rhThroat)"/>';
 for(let k=0;k<11;k++){const u=k/10,y=-58+u*108,half=Math.sin(Math.PI*(.06+u*.88))*24,ln=8+r()*10;
  mouth+='<path d="M'+n1(-half-2)+','+n1(y-4)+' C'+n1(-half+ln*.4)+','+n1(y-2)+' '+n1(-half+ln)+','+n1(y+1)+' '+n1(-half+ln+1)+','+n1(y+2)+' C'+n1(-half+ln*.5)+','+n1(y+4)+' '+n1(-half)+','+n1(y+4)+' '+n1(-half-2)+','+n1(y+3)+' Z" fill="url(#rhTooth)"/>'+
   '<path d="M'+n1(half+2)+','+n1(y-4)+' C'+n1(half-ln*.4)+','+n1(y-2)+' '+n1(half-ln)+','+n1(y+1)+' '+n1(half-ln-1)+','+n1(y+2)+' C'+n1(half-ln*.5)+','+n1(y+4)+' '+n1(half)+','+n1(y+4)+' '+n1(half+2)+','+n1(y+3)+' Z" fill="url(#rhTooth)"/>';}
 for(let k=0;k<3;k++){const y=-20+k*24,x0=-12+k*6;mouth+='<path class="rh-saliva" d="M'+x0+','+y+' C'+(x0+4)+','+(y+10)+' '+(x0+10)+','+(y+12)+' '+(x0+14)+','+(y+2)+' C'+(x0+11)+','+(y+9)+' '+(x0+5)+','+(y+8)+' '+x0+','+y+' Z" fill="#9fd8cf" opacity=".35"/>';}
 mouth+='<path d="M0,-72 C-32,-50 -40,8 -19,60 L-17,60 C-37,8 -29,-49 0,-68 Z" fill="#7fe0d4" opacity=".4"/></g>';
 const harp=(x,y,ang,len)=>{const c=Math.cos(ang),sn=Math.sin(ang),ex=x+c*len,ey=y+sn*len,px=-sn*5.5,py=c*5.5;
  let g='<path d="M'+n1(x+px)+','+n1(y+py)+' L'+n1(ex+px*.8)+','+n1(ey+py*.8)+' L'+n1(ex-px*.8)+','+n1(ey-py*.8)+' L'+n1(x-px)+','+n1(y-py)+' Z" fill="url(#rhShaft)"/>'+
   '<ellipse cx="'+n1(x)+'" cy="'+n1(y)+'" rx="12" ry="8" fill="#020607" opacity=".8"/><ellipse cx="'+n1(x)+'" cy="'+n1(y)+'" rx="15" ry="11" fill="url(#rhGlowIn)"/>';
  const rp=[];for(let k=0;k<=12;k++){const u=k/12;rp.push([ex+u*(c*40-30)+Math.sin(u*3)*10,ey+u*120+u*u*40]);}
  g+='<path class="rh-rope" d="'+ribbon(rp,u=>3.4*(1-u*.4))+'" fill="#28322f"/>';
  return g;};
 const poles=harp(cx-250,base-170,-Math.PI*.62,110)+harp(cx+60,base-226,-Math.PI*.34,120);
 s+='<g clip-path="url(#rhAbove)"><g class="rh-bodyg">'+
  '<path d="'+body+'" fill="url(#rhBody)"/>'+
  '<g clip-path="url(#rhBodyClip)">'+
   '<path class="rh-veins" d="'+body+'" fill="url(#rhVein)"/>'+
   '<path class="rh-veinglow" d="'+body+'" fill="#5fe8d8" opacity=".25" filter="url(#rhVeinGlow)"/>'+
   cells+
   '<path d="'+body+'" fill="#000" filter="url(#rhSkin)" opacity=".45"/>'+
   '<path d="'+body+'" fill="url(#rhShade)"/>'+holes+mouth+
  '</g>'+
  '<path d="'+body+'" fill="none" stroke="#7de6dc" stroke-opacity=".3" stroke-width="2.5" filter="url(#rhGlow)"/>'+
  poles+'</g>'+
  // 움직이는 것은 무거운 살덩이 층과 따로: 그물 빛의 숨 · 젖은 반짝임 · 구멍과 눈
  '</g>';
 live+='<g clip-path="url(#rhBodyClip)"><path class="rh-glowin" d="'+body+'" fill="url(#rhGlowIn)"/><g class="rh-spec" opacity=".35">'+spec+'</g>'+eyes+'</g>';
 let drip='';for(let i=0;i<26;i++){const x=cx-360+r()*720;drip+='<g class="rh-drip" data-x="'+n1(x)+'" data-l="'+n1(24+r()*80)+'" data-p="'+n3(r()*TAU)+'" data-w="'+n3(4+r()*5)+'"><path fill="#0a2124"/><ellipse class="rh-dropb" rx="3" ry="4" fill="#5fd0c8" opacity=".5"/></g>';}
 live+='<g class="rh-drips">'+drip+'</g>';
 s+='<rect y="'+(SEA+10)+'" width="'+W+'" height="'+(H-SEA-10)+'" fill="url(#rhSea)"/>';
 s+='<g clip-path="url(#rhBelow)"><g opacity=".32" filter="url(#rhRipple)"><g transform="translate(0 '+(2*SEA+20)+') scale(1 -1)"><path d="'+body+'" fill="url(#rhVein)"/><path d="'+body+'" fill="url(#rhShade)"/></g></g></g>';
 for(let i=0;i<16;i++)s+='<ellipse cx="'+n1(cx-380+r()*760)+'" cy="'+n1(SEA+12+r()*8)+'" rx="'+n1(20+r()*50)+'" ry="'+n1(3+r()*4)+'" fill="url(#rhFoam)"/>';
 for(let i=0;i<5;i++)live+='<ellipse class="rh-ring" data-i="'+i+'" cx="'+cx+'" cy="'+(SEA+36)+'" rx="10" ry="3" fill="none" stroke="#5fd0c8" stroke-width="2.5" opacity="0"/>';
 live+='<g class="rh-splash"></g>';
 live+=boat();
 live+='<g class="rh-rain1"></g><g class="rh-rain2" filter="url(#rhBlur6)" opacity=".6"></g>';
 live+='<rect class="rh-flash" width="'+W+'" height="'+H+'" fill="#c8f8ff" opacity="0" style="mix-blend-mode:screen"/>';
 return svgOpen+defs+baked(defs,s.slice(defs.length),'hole')+live+'</svg>';
}
function rainLayer(g,n,seed,len,w,v){
 const r=seeded(seed);let h='';
 for(let i=0;i<n;i++)h+='<path data-x="'+n1(r()*(W+240)-120)+'" data-y="'+n1(r()*H)+'" data-v="'+n1(v*(.8+r()*.4))+'" data-l="'+n1(len*(.7+r()*.6))+'" data-w="'+n3(w*(.7+r()*.6))+'" fill="url(#rhRain)"/>';
 g.innerHTML=h;return [...g.children].map(e=>({e,x:+e.dataset.x,y:+e.dataset.y,v:+e.dataset.v,l:+e.dataset.l,w:+e.dataset.w}));
}
function bolt(seed){
 const r=seeded(seed);let x=140+r()*680,y=-10;const main=[[x,y]];
 while(y<SEA-60-r()*80){x+=(r()-.5)*80;y+=22+r()*28;main.push([x,y]);}
 const branches=[];for(let b=0;b<3;b++){const k=1+Math.floor(r()*(main.length-2));let [bx,by]=main[k];const br=[[bx,by]],dir=r()<.5?-1:1;for(let j=0;j<3+Math.floor(r()*3);j++){bx+=dir*(10+r()*30);by+=14+r()*20;br.push([bx,by]);}branches.push(br);}
 const poly=(pts,w)=>ribbon(pts,u=>w*(1-u*.7));
 return '<path d="'+poly(main,5)+'" fill="#e8fdff" filter="url(#rhGlow)"/>'+branches.map(b=>'<path d="'+poly(b,2.6)+'" fill="#c8f6ff" opacity=".85" filter="url(#rhGlow)"/>').join('');
}
function holePaint(el,t){
 const c=el._rx||(el._rx=(()=>{const o={gi:el.querySelector('.rh-glowin'),spec:el.querySelector('.rh-spec'),
  flash:el.querySelector('.rh-flash'),bolts:el.querySelector('.rh-bolts'),cl:[...el.querySelectorAll('.rh-cl')],
  eyes:[...el.querySelectorAll('.rh-eye')].map(e=>({e,r:+e.dataset.r,p:e.querySelector('.rh-pupil'),lid:e.querySelector('.rh-lid'),i:+e.dataset.i})),
  drip:[...el.querySelectorAll('.rh-drip')].map(g=>({p:g.querySelector('path'),b:g.querySelector('.rh-dropb'),x:+g.dataset.x,l:+g.dataset.l,ph:+g.dataset.p,w:+g.dataset.w})),
  rings:[...el.querySelectorAll('.rh-ring')],sal:[...el.querySelectorAll('.rh-saliva')],boltSeed:-1};
  o.r0=rainLayer(el.querySelector('.rh-rain0'),60,11,12,1.1,520);o.r1=rainLayer(el.querySelector('.rh-rain1'),50,13,26,1.8,900);o.r2=rainLayer(el.querySelector('.rh-rain2'),12,17,60,4,1300);
  const sp=el.querySelector('.rh-splash');let h='';for(let i=0;i<24;i++)h+='<ellipse rx="1" ry="1" fill="none" stroke="#9fe0e6" stroke-width="1.2" opacity="0"/>';sp.innerHTML=h;
  o.spl=[...sp.children].map((e,i)=>({e,p:i*.37%1,x:(i*97)%W,y:SEA+16+((i*53)%140)}));return o;})());
 const cyc=t%5.2,ix=Math.floor(t/5.2),f=cyc<.07?1:cyc<.14?.15:cyc<.22?.85:Math.max(0,1-(cyc-.22)/.55)*.45;
 if(cyc<.8){if(c.boltSeed!==ix){c.boltSeed=ix;c.bolts.innerHTML=bolt(ix*31+7);}c.bolts.setAttribute('opacity',n3(f));}else c.bolts.setAttribute('opacity','0');
 c.flash.setAttribute('opacity',n3(f*.22));
 c.cl.forEach(e=>e.setAttribute('opacity',n3(f*.9)));
 const breath=.5+.5*Math.sin(t*1.2);
 c.gi.setAttribute('opacity',n3(.35+.4*breath+.6*f));
 c.spec.setAttribute('opacity',n3(.25+.75*f));
 c.eyes.forEach(E=>{const bp=(t*.6+E.i*.41)%4,bl=bp<.16?Math.sin(bp/.16*Math.PI):0;
  const lx=Math.cos(t*.3+E.i)*.15-.35,ly=.12+Math.sin(t*.5+E.i)*.1;E.p.setAttribute('transform','translate('+n1(lx*E.r)+' '+n1(ly*E.r)+')');
  const top=-E.r*.9+bl*E.r*1.8;E.lid.setAttribute('d','M'+n1(-E.r*1.05)+','+n1(-E.r)+' L'+n1(E.r*1.05)+','+n1(-E.r)+' L'+n1(E.r*1.05)+','+n1(top)+' Q0,'+n1(top+E.r*.5*(1-bl))+' '+n1(-E.r*1.05)+','+n1(top)+' Z');});
 c.drip.forEach(d=>{const k=(t*.35+d.ph)%1,len=d.l*(.35+.65*k),x=d.x,w=d.w,y0=SEA+4;
  d.p.setAttribute('d','M'+n1(x-w)+','+y0+' C'+n1(x-w*.8)+','+n1(y0+len*.5)+' '+n1(x-w*.3)+','+n1(y0+len)+' '+n1(x)+','+n1(y0+len+w*.6)+' C'+n1(x+w*.3)+','+n1(y0+len)+' '+n1(x+w*.8)+','+n1(y0+len*.5)+' '+n1(x+w)+','+y0+' Z');
  const fk=(t*.9+d.ph)%1;d.b.setAttribute('cx',n1(x));d.b.setAttribute('cy',n1(y0+len+w+fk*30));d.b.setAttribute('opacity',n3(.5*(1-fk)));});
 c.rings.forEach(e=>{const i=+e.dataset.i,k=((t*.3+i/5)%1);e.setAttribute('rx',n1(80+k*440));e.setAttribute('ry',n1(5+k*30));e.setAttribute('opacity',n3(.4*(1-k)));e.setAttribute('stroke-width',n1(3-2*k));});
 c.sal.forEach((e,i)=>e.setAttribute('transform','translate(0 '+n1(((t*.4+i*.3)%1)*14)+')'));
 const rain=(arr,slant)=>arr.forEach(R=>{const y=(R.y+t*R.v)%(H+80)-40,x=R.x-(y-R.y)*slant;R.e.setAttribute('d','M'+n1(x)+','+n1(y)+' L'+n1(x+R.w)+','+n1(y)+' L'+n1(x+R.w-R.l*slant)+','+n1(y+R.l)+' L'+n1(x-R.l*slant)+','+n1(y+R.l)+' Z');});
 rain(c.r0,.16);rain(c.r1,.2);rain(c.r2,.22);
 c.spl.forEach(S=>{const k=(t*1.6+S.p)%1;S.e.setAttribute('cx',S.x);S.e.setAttribute('cy',S.y);S.e.setAttribute('rx',n1(1+k*9));S.e.setAttribute('ry',n1(.5+k*2.4));S.e.setAttribute('opacity',n3(.6*(1-k)));});
 if(K){const B=Math.sin(t*1.9)*3,R=Math.sin(t*1.5)*3.2;const tw=K.boatPose(el,190,SEA+B,R,[37,-30]);K.lamp(el,t,tw,f*.3);}
}

const KIND={stem:{svg:stemSvg,paint:stemPaint,label:'희귀 고래 · 천가닥 줄기 고래'},hole:{svg:holeSvg,paint:holePaint,label:'희귀 고래 · 구멍 손바닥 고래'}};
const cache={};
function html(id){const k=KIND[id];if(!k)return '';return shell(id,cache[id]||(cache[id]=k.svg()),k.label);}
const t0=performance.now();
function frame(now){
 document.querySelectorAll('.rx-baked:not([data-done])').forEach(bake);
 document.querySelectorAll('.rare-fx-024').forEach(el=>{const k=KIND[el.dataset.rare];if(!k)return;try{k.paint(el,(now-t0)/1000);}catch(e){if(!el._err){el._err=1;console.warn('희귀 고래 장면',e);}}});
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.RareWhaleFx024={html};
})();
