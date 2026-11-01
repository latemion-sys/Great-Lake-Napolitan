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
const lerp=(a,b,k)=>a+(b-a)*k;
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
function bakeSrc(key,svg){if(!BAKED[key])BAKED[key]={src:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),url:null,busy:false};return BAKED[key];}
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
 im.onload=function(){try{const iw=+img.getAttribute('width')||W,ih=+img.getAttribute('height')||H,k=Math.min(2,Math.max(1,window.devicePixelRatio||1)),c=document.createElement('canvas');c.width=iw*k;c.height=ih*k;c.getContext('2d').drawImage(im,0,0,iw*k,ih*k);
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

/* ====================== 구멍 손바닥 고래 ======================
   구멍 고래의 일종. 물 위로는 손가락 네 개(엄지 + 세 손가락)의 거대한 손 모양 기관만 드러난다.
   손이 배를 움켜쥐면 손바닥의 구멍에서 인어들이 기어 나온다. 물속에는 고래만 한 넙치 그림자와, 그 몸에 달린 거대한 손 두 개의 그림자.
   장면(11초 반복): 손이 손바닥을 이쪽으로 펼친 채 솟음 → 배 위로 덮쳐 손가락이 접히며 움켜쥠(접힌 마디는 배 앞으로) → 구멍이 벌어지고 인어들이 기어 나와 뱃전을 넘음 */
const HS=1.12;                                     // 손 크기
const PALM='M-104,-100 C-118,-70 -124,-30 -128,8 C-136,40 -132,78 -108,104 C-80,130 -30,138 12,136 C64,134 104,116 118,78 C128,40 124,-20 116,-70 C110,-98 96,-114 70,-118 C30,-124 -40,-124 -70,-118 C-86,-114 -98,-108 -104,-100 Z';
const FINGERS=[ // 손바닥 좌표의 뿌리, 펼친 방향(도), 마디 길이, 굵기
 {b:[-80,-104],a:-100,L:[112,92,74],w:[54,48,42]},
 {b:[-4,-112],a:-90,L:[124,100,80],w:[56,50,44]},
 {b:[74,-104],a:-78,L:[112,92,74],w:[54,48,42]},
 {b:[-116,10],a:-158,L:[96,80],w:[58,50],thumb:true}
];
const GRIP=[[46,128,24],[44,132,26],[46,126,24],[34,120]];   // 움켜쥘 때 마디별로 이쪽(보는 사람 쪽)으로 접히는 각도
const PHOLES=[[-62,-34,13],[-8,-56,11],[50,-30,14],[-88,34,11],[-30,20,15],[34,36,13],[88,-74,9],[-90,-78,8],[0,90,10],[76,90,9],[-58,82,8],[96,10,9],[10,-12,8],[-110,-20,7]];
const MERM=[0,2,4,5,1,3];                            // 인어가 기어 나오는 구멍
function segPath(p,q,w0,w1){
 const dx=q[0]-p[0],dy=q[1]-p[1],l=Math.hypot(dx,dy);
 if(l<1)return 'M'+n1(p[0]-w0/2)+','+n1(p[1])+' a'+n1(w0/2)+','+n1(w0/2)+' 0 1 0 '+n1(w0)+',0 a'+n1(w0/2)+','+n1(w0/2)+' 0 1 0 '+n1(-w0)+',0 Z';
 const ux=dx/l,uy=dy/l,nx=-uy,ny=ux,a=w0/2,b=w1/2;
 // 둥근 마디: 뿌리 쪽 반원 → 끝 쪽 반원, 가운데가 살짝 부푼 손가락
 return 'M'+n1(p[0]+nx*a)+','+n1(p[1]+ny*a)+
  ' C'+n1(p[0]+nx*a*1.06+ux*l*.33)+','+n1(p[1]+ny*a*1.06+uy*l*.33)+' '+n1(q[0]+nx*b*1.06-ux*l*.3)+','+n1(q[1]+ny*b*1.06-uy*l*.3)+' '+n1(q[0]+nx*b)+','+n1(q[1]+ny*b)+
  ' A'+n1(b)+','+n1(b)+' 0 0 1 '+n1(q[0]-nx*b)+','+n1(q[1]-ny*b)+
  ' C'+n1(q[0]-nx*b*1.06-ux*l*.3)+','+n1(q[1]-ny*b*1.06-uy*l*.3)+' '+n1(p[0]-nx*a*1.06+ux*l*.33)+','+n1(p[1]-ny*a*1.06+uy*l*.33)+' '+n1(p[0]-nx*a)+','+n1(p[1]-ny*a)+
  ' A'+n1(a)+','+n1(a)+' 0 0 1 '+n1(p[0]+nx*a)+','+n1(p[1]+ny*a)+' Z';
}
// 손가락 마디 위치: 손바닥 평면 위 방향 u로 뻗다가, 이쪽으로 접힌 만큼(누적 각) 화면에서 짧아지고 뒤집힘
function fingerJoints(F,curl){
 const pts=[F.b.slice()],z=[0];let ang=0;const u=[Math.cos(F.a*RAD0),Math.sin(F.a*RAD0)];
 const G=GRIP[FINGERS.indexOf(F)];
 for(let i=0;i<F.L.length;i++){ang+=G[i]*curl;const c=Math.cos(ang*RAD0),p=pts[i];
  // 엄지는 옆으로 접혀 손바닥을 가로지름
  const v=F.thumb?[u[0]*c+(1-c)*.55,u[1]*c-(1-c)*.25]:[u[0]*c,u[1]*c];
  pts.push([p[0]+v[0]*F.L[i],p[1]+v[1]*F.L[i]]);z.push(Math.sin(ang*RAD0));}
 return {pts,z,ang};
}
const RAD0=Math.PI/180;
function texSvg(){
 // 피부: 짙은 청록 살 조각 사이로 밝은 청록 틈이 그물처럼 흐름(번개 · 숨에 따라 밝기만 바뀜)
 const r=seeded(707),G=20,N=12,V=[];let cells='';
 for(let j=0;j<=N;j++){V.push([]);for(let i=0;i<=N;i++){const edge=i===0||j===0||i===N||j===N;V[j].push([i*G+(edge?0:(r()-.5)*G*.8),j*G+(edge?0:(r()-.5)*G*.8)]);}}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const q=[V[j][i],V[j][i+1],V[j+1][i+1],V[j+1][i]],m=[(q[0][0]+q[1][0]+q[2][0]+q[3][0])/4,(q[0][1]+q[1][1]+q[2][1]+q[3][1])/4],k=.74+r()*.14;
  cells+='<path d="'+smooth(q.map(v=>[m[0]+(v[0]-m[0])*k,m[1]+(v[1]-m[1])*k]),true)+'" fill="url(#tc'+(r()<.25?1:0)+')"/>';}
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(G*N)+' '+(G*N)+'" width="'+(G*N)+'" height="'+(G*N)+'"><defs>'+
  '<radialGradient id="tc0" cx=".42" cy=".38" r=".72"><stop stop-color="#183a3c"/><stop offset=".6" stop-color="#0c2022"/><stop offset="1" stop-color="#071214"/></radialGradient>'+
  '<radialGradient id="tc1" cx=".42" cy=".38" r=".72"><stop stop-color="#24504e"/><stop offset=".6" stop-color="#11302f"/><stop offset="1" stop-color="#091a1a"/></radialGradient>'+
  '<filter id="tg"><feGaussianBlur stdDeviation="1.6"/></filter></defs>'+
  '<rect width="'+(G*N)+'" height="'+(G*N)+'" fill="#1d7f78"/><rect width="'+(G*N)+'" height="'+(G*N)+'" fill="#6fe0d4" opacity=".18" filter="url(#tg)"/>'+cells+'</svg>';
}
function mermaidMarkup(i){
 // 손바닥 구멍에서 기어 나오는 인어: 이쪽을 보며 기어 옴. 젖어서 달라붙은 긴 머리칼, 핏기 없는 마른 몸, 긴 팔
 const r=seeded(300+i);let hair='';
 for(let k=0;k<8;k++){const sd=k<4?-1:1,x0=sd*(3+(k%4)*2.2),L=30+r()*22;hair+='<path class="rm-hair" data-k="'+k+'" data-x="'+n1(x0)+'" data-l="'+n1(L)+'" fill="#050d0f"/>';}
 return '<g class="rm" data-i="'+i+'" opacity="0">'+
  '<g class="rm-hairs">'+hair+'</g>'+
  '<path class="rm-armL" fill="url(#rhMSkin)"/><path class="rm-armR" fill="url(#rhMSkin)"/>'+
  '<path class="rm-body" d="M-12,-4 C-14,4 -12,14 -9,24 C-8,32 -7,38 -6,44 L6,44 C7,38 8,32 9,24 C12,14 14,4 12,-4 C8,-8 -8,-8 -12,-4 Z" fill="url(#rhMBody)"/>'+
  '<path d="M-12,-4 C-14,4 -12,14 -9,24 C-8,32 -7,38 -6,44 L-1,44 C-3,30 -6,12 -6,-6 Z" fill="#0c1a19" opacity=".35"/>'+
  '<path d="M-3,-9 L-3.4,-3 L3.4,-3 L3,-9 Z" fill="url(#rhMSkin)"/>'+
  '<ellipse class="rm-head" cy="-17" rx="8.4" ry="10.6" fill="url(#rhMSkin)"/>'+
  '<path d="M-8.6,-18 C-9.4,-29 9.4,-29 8.6,-18 C7,-23 3,-25 0,-25 C-3,-25 -7,-23 -8.6,-18 Z" fill="#050d0f"/>'+
  '<ellipse cx="-3.2" cy="-16.4" rx="1.7" ry="2.4" fill="#010303"/><ellipse cx="3.2" cy="-16.4" rx="1.7" ry="2.4" fill="#010303"/>'+
  '<path d="M-2.4,-9.8 Q0,-8.4 2.4,-9.8 Q0,-9.1 -2.4,-9.8 Z" fill="#132220"/>'+
  '<path class="rm-lock" d="M-8.6,-20 C-12,-12 -10,-2 -14,6 C-16,12 -13,18 -15,24 C-12,20 -10,14 -9,8 C-7,0 -7,-10 -5,-19 Z M8.6,-20 C12,-12 10,-2 14,6 C16,12 13,18 15,24 C12,20 10,14 9,8 C7,0 7,-10 5,-19 Z" fill="#050d0f"/>'+
  '<path class="rm-handL" fill="url(#rhMSkin)"/><path class="rm-handR" fill="url(#rhMSkin)"/></g>';
}
function holeSvg(){
 const r=seeded(4243);
 const defs='<defs>'+(K?K.commonDefs():'')+
  '<linearGradient id="rhSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#02070a"/><stop offset=".5" stop-color="#071a1f"/><stop offset="1" stop-color="#0d2b2f"/></linearGradient>'+
  '<linearGradient id="rhSea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0d272c" stop-opacity=".88"/><stop offset=".35" stop-color="#061a1f" stop-opacity=".9"/><stop offset="1" stop-color="#010507" stop-opacity=".96"/></linearGradient>'+
  '<pattern id="rhTex" patternUnits="userSpaceOnUse" width="240" height="240"><image class="rx-baked" data-key="handtex" width="240" height="240" preserveAspectRatio="none" href="'+(bakeSrc('handtex',texSvg()).url||BAKED.handtex.src)+'"/></pattern>'+
  '<radialGradient id="rhPalmShade" cx=".5" cy=".42" r=".62"><stop stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity=".12"/><stop offset=".86" stop-color="#010405" stop-opacity=".62"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>'+
  '<radialGradient id="rhPalmRim" cx=".46" cy=".44" r=".6"><stop offset=".82" stop-color="#7de6dc" stop-opacity="0"/><stop offset=".95" stop-color="#7de6dc" stop-opacity=".22"/><stop offset="1" stop-color="#7de6dc" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="rhDorShade" cx=".45" cy=".35" r=".7"><stop stop-color="#000" stop-opacity=".05"/><stop offset=".6" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>'+
  '<linearGradient id="rhFing" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#000" stop-opacity=".75"/><stop offset=".3" stop-color="#000" stop-opacity=".15"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></linearGradient>'+
  '<radialGradient id="rhSeg" cx=".5" cy=".5" r=".55"><stop stop-color="#000" stop-opacity="0"/><stop offset=".6" stop-color="#000" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>'+
  '<radialGradient id="rhBack" cx=".4" cy=".35" r=".7"><stop stop-color="#1b3a3c" stop-opacity=".2"/><stop offset=".7" stop-color="#020809" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>'+
  '<radialGradient id="rhNail" cx=".4" cy=".3"><stop stop-color="#b9d4ce"/><stop offset=".6" stop-color="#5f827c"/><stop offset="1" stop-color="#1e3432"/></radialGradient>'+
  '<radialGradient id="rhGlowIn" cx=".5" cy=".45" r=".55"><stop stop-color="#7ff2e4" stop-opacity=".55"/><stop offset="1" stop-color="#5fe8d8" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="rhPit"><stop stop-color="#000"/><stop offset=".55" stop-color="#010405"/><stop offset=".82" stop-color="#06181a"/><stop offset="1" stop-color="#0d2a2c"/></radialGradient>'+
  '<linearGradient id="rhLip" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#b8f2e8"/><stop offset=".25" stop-color="#3d8a84"/><stop offset=".6" stop-color="#0f2a2c"/><stop offset="1" stop-color="#020809"/></linearGradient>'+
  '<linearGradient id="rhWrinkle" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#000" stop-opacity=".65"/><stop offset="1" stop-color="#7fe0d4" stop-opacity=".25"/></linearGradient>'+
  '<linearGradient id="rhArm" x1="0" x2="1"><stop stop-color="#020809"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#010405" stop-opacity=".85"/></linearGradient>'+
  '<radialGradient id="rhMSkin" cx=".4" cy=".35"><stop stop-color="#c3d6d0"/><stop offset=".55" stop-color="#7b9892"/><stop offset="1" stop-color="#2a4440"/></radialGradient>'+
  '<linearGradient id="rhMBody" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a8bfb9"/><stop offset=".5" stop-color="#5a7a74"/><stop offset="1" stop-color="#132624" stop-opacity="0"/></linearGradient>'+
  '<linearGradient id="rhRain" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#bfe8ee" stop-opacity="0"/><stop offset="1" stop-color="#bfe8ee" stop-opacity=".7"/></linearGradient>'+
  '<radialGradient id="rhCloudLit" cx=".5" cy="1" r=".8"><stop stop-color="#5aaab0" stop-opacity=".5"/><stop offset="1" stop-color="#0d2a30" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="rhFoam"><stop stop-color="#bfeee6" stop-opacity=".5"/><stop offset="1" stop-color="#bfeee6" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="rhDeep" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2a6a70"/><stop offset=".45" stop-color="#17484e"/><stop offset="1" stop-color="#0a2428"/></linearGradient>'+
  '<radialGradient id="rhShadow"><stop stop-color="#000" stop-opacity=".85"/><stop offset=".75" stop-color="#010607" stop-opacity=".6"/><stop offset="1" stop-color="#021012" stop-opacity="0"/></radialGradient>'+
  '<filter id="rhGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'+
  '<filter id="rhBlur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>'+
  '<filter id="rhBlur14" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>'+
  '<filter id="rhRipple" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".008 .12" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="2"/></filter>'+
  '<clipPath id="rhAbove"><rect width="'+W+'" height="'+(SEA+6)+'"/></clipPath>'+
  '<clipPath id="rhPalmClip"><path d="'+PALM+'"/></clipPath>'+
  MERM.map((h,i)=>'<clipPath id="rhMC'+i+'" clipPathUnits="userSpaceOnUse"><ellipse class="rm-clip" data-i="'+i+'" cx="'+PHOLES[h][0]+'" cy="'+PHOLES[h][1]+'" rx="'+PHOLES[h][2]+'" ry="'+PHOLES[h][2]+'"/></clipPath>').join('')+
  '</defs>';
 // ----- 굳혀 둘 배경: 하늘 · 구름 · 물 · 물속 그림자(넙치 몸 + 손 두 개) · 거품
 let s='<rect width="'+W+'" height="'+H+'" fill="url(#rhSky)"/>';
 for(let i=0;i<14;i++){const x=r()*W,y=10+r()*150,rx=110+r()*220,ry=26+r()*44;s+='<ellipse cx="'+n1(x)+'" cy="'+n1(y)+'" rx="'+n1(rx)+'" ry="'+n1(ry)+'" fill="#081c22" opacity="'+n3(.5+r()*.4)+'" filter="url(#rhBlur6)"/>';}
 // 물속: 넙치 그림자(넓적한 몸, 둘레의 지느러미 술, 한쪽으로 몰린 두 눈 자리) + 거대한 손 두 개
 const fl=[];for(let i=0;i<=40;i++){const a=i/40*TAU,rr=1+.04*Math.sin(a*9);fl.push([520+Math.cos(a)*400*rr,SEA+120+Math.sin(a)*70*rr]);}
 let fringe='';for(let i=0;i<46;i++){const a=i/46*TAU,x=520+Math.cos(a)*410,y=SEA+120+Math.sin(a)*76;fringe+='<ellipse cx="'+n1(x)+'" cy="'+n1(y)+'" rx="'+n1(14+r()*10)+'" ry="5" transform="rotate('+n1(a/RAD0+90)+' '+n1(x)+' '+n1(y)+')" fill="#010708" opacity=".7"/>';}
 const ghostHand=(x,y,rot,sc)=>{let g='<g transform="translate('+x+' '+y+') rotate('+rot+') scale('+sc+')"><path d="'+PALM+'" fill="#010607"/>';FINGERS.forEach(F=>{const J=fingerJoints(F,.25);for(let k=0;k<F.L.length;k++)g+='<path d="'+segPath(J.pts[k],J.pts[k+1],F.w[k],F.w[k+1]||F.w[k]*.85)+'" fill="#010607"/>';});return g+'</g>';};
 s+='<rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" fill="url(#rhDeep)"/>';
 s+='<g opacity=".95" filter="url(#rhBlur14)"><path d="'+smooth(fl,true)+'" fill="url(#rhShadow)"/>'+fringe+
  '<path d="M900,'+(SEA+120)+' C950,'+(SEA+90)+' 990,'+(SEA+80)+' 1000,'+(SEA+100)+' C990,'+(SEA+140)+' 950,'+(SEA+150)+' 900,'+(SEA+120)+' Z" fill="#010607"/>'+
  ghostHand(150,SEA+150,-120,1.05)+ghostHand(700,SEA+96,-30,1.2)+'</g>'+
  '<path d="'+smooth(fl,true)+'" fill="none" stroke="#4fc8c0" stroke-opacity=".22" stroke-width="5" filter="url(#rhBlur6)"/>';
 s+='<ellipse cx="330" cy="'+(SEA+112)+'" rx="9" ry="6" fill="#0a3a3a" opacity=".55" filter="url(#rhBlur6)"/><ellipse cx="370" cy="'+(SEA+104)+'" rx="9" ry="6" fill="#0a3a3a" opacity=".55" filter="url(#rhBlur6)"/>';
 s+='<rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" fill="url(#rhSea)" opacity=".22"/>';
 for(let i=0;i<10;i++)s+='<ellipse cx="'+n1(r()*W)+'" cy="'+n1(SEA+30+r()*170)+'" rx="'+n1(80+r()*160)+'" ry="'+n1(2+r()*2)+'" fill="#6fd8d0" opacity="'+n3(.05+r()*.08)+'"/>';
 // ----- 움직이는 층
 let live='<g class="rh-cls"></g><g class="rh-bolts"></g><g class="rh-rain0"></g>';
 // 손: 팔뚝(물 밖으로 솟은 부분) → 손바닥(구멍 · 인어) → 뒤쪽 손가락 마디 → 배 → 이쪽으로 접힌 마디
 let holes='';
 PHOLES.forEach((h,i)=>{const [x,y,R]=h;holes+='<g class="rh-ph" data-i="'+i+'" transform="translate('+x+' '+y+')">'+
  '<ellipse cx="'+n1(R*.12)+'" cy="'+n1(R*.14)+'" rx="'+n1(R*1.45)+'" ry="'+n1(R*1.38)+'" fill="#000" opacity=".5"/>'+
  '<ellipse class="rh-lipE" rx="'+n1(R*1.38)+'" ry="'+n1(R*1.3)+'" fill="url(#rhLip)"/>'+
  '<ellipse class="rh-pitE" cx="'+n1(R*.05)+'" cy="'+n1(R*.06)+'" rx="'+n1(R)+'" ry="'+n1(R*.94)+'" fill="url(#rhPit)"/>'+
  '<ellipse class="rh-pglow" rx="'+n1(R*.55)+'" ry="'+n1(R*.5)+'" fill="url(#rhGlowIn)" opacity=".3"/></g>';});
 let crease='';[[-90,-20,90,-6],[-96,30,40,58],[-30,96,70,60]].forEach(([x1,y1,x2,y2])=>{crease+='<path d="M'+x1+','+y1+' Q'+((x1+x2)/2)+','+((y1+y2)/2-14)+' '+x2+','+y2+' Q'+((x1+x2)/2)+','+((y1+y2)/2-8)+' '+x1+','+y1+' Z" fill="url(#rhWrinkle)" opacity=".7"/>';});
 let segsB='',segsF='';
 FINGERS.forEach((F,fi)=>{for(let k=0;k<F.L.length;k++){
  const seg='<g class="rh-seg" data-f="'+fi+'" data-k="'+k+'"><path class="rh-sp" fill="url(#rhTex)"/><path class="rh-ss" fill="url(#rhSeg)"/><path class="rh-sh" fill="url(#rhLip)" opacity=".0"/>'+
   (k===F.L.length-1?'<ellipse class="rh-nail" rx="1" ry="1" fill="url(#rhNail)" opacity="0"/><ellipse class="rh-tiphole" rx="1" ry="1" fill="url(#rhPit)"/>':'')+
   '<path class="rh-knk" fill="url(#rhWrinkle)" opacity=".8"/></g>';
  segsB+=seg.replace('class="rh-seg"','class="rh-seg rh-b"');segsF+=seg.replace('class="rh-seg"','class="rh-seg rh-f"');}});
 let merms='';MERM.forEach((h,i)=>{merms+='<g class="rm-wrap" data-i="'+i+'" clip-path="url(#rhMC'+i+')">'+mermaidMarkup(i)+'</g>';});
 live+='<g clip-path="url(#rhAbove)"><g class="rh-hand">'+
  '<path class="rh-fore" fill="url(#rhTex)"/><path class="rh-fores" fill="url(#rhArm)"/>'+
  '<g class="rh-palm"><path d="'+PALM+'" fill="url(#rhTex)"/><path d="'+PALM+'" fill="url(#rhPalmShade)"/>'+crease+holes+merms+
   '<path d="'+PALM+'" fill="url(#rhPalmRim)"/></g>'+
  '<g class="rh-segsB">'+segsB+'</g></g></g>';
 live+='<g class="rh-drips"></g>';
 for(let i=0;i<5;i++)live+='<ellipse class="rh-ring" data-i="'+i+'" cy="'+(SEA+14)+'" rx="10" ry="3" fill="none" stroke="#5fd0c8" stroke-width="2.5" opacity="0"/>';
 live+='<g class="rh-foam"></g>';
 live+=boat();
 live+='<g class="rh-segsF">'+segsF+'</g>';
 // 움켜쥔 손(손등 쪽에서 본 모습): 손등은 배 너머, 손가락은 배를 넘어와 뱃전 앞까지 감쌈
 let gm='';for(let i=0;i<6;i++)gm+=mermaidMarkup(10+i).replace('class="rm"','class="rm rm-g" data-g="'+i+'"');
 let dh='';for(let i=0;i<7;i++)dh+='<g class="rd-h" data-i="'+i+'"><ellipse class="rd-hl" fill="url(#rhLip)"/><ellipse class="rd-hp" fill="url(#rhPit)"/></g>';
 let fg='';for(let i=0;i<4;i++)fg+='<g class="rd-f" data-i="'+i+'"><path class="rd-fp" fill="url(#rhTex)"/><path class="rd-fs" fill="url(#rhFing)"/><path class="rd-c" fill="url(#rhWrinkle)" opacity=".85"/><path class="rd-c2" fill="url(#rhWrinkle)" opacity=".85"/><path class="rd-hi" fill="#bff4ea" opacity=".16"/><ellipse class="rd-nail" fill="url(#rhNail)"/><ellipse class="rd-nailhi" fill="#fff" opacity=".5"/></g>';
 live=live.replace('<g class="rh-drips"></g>','<g class="rh-dor" opacity="0"><path class="rd-arm" fill="url(#rhTex)"/><path class="rd-arms" fill="url(#rhArm)"/><path class="rd-back" fill="url(#rhTex)"/><path class="rd-backs" fill="url(#rhDorShade)"/><g class="rd-knks"></g>'+dh+'</g><g class="rh-drips"></g>');
 live+='<g class="rh-dorF" opacity="0">'+fg+'</g><g class="rh-gm">'+gm+'</g>';
 live+='<g class="rh-rain1"></g><g class="rh-rain2" filter="url(#rhBlur6)" opacity=".6"></g>';
 live+='<rect class="rh-flash" width="'+W+'" height="'+H+'" fill="#c8f8ff" opacity="0" style="mix-blend-mode:screen"/>';
 return svgOpen+defs+baked(defs,s,'hole')+live+'</svg>';
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
const sg=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
const oc=x=>1-Math.pow(1-Math.max(0,Math.min(1,x)),3),io=x=>{x=Math.max(0,Math.min(1,x));return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;};
// 손의 자세(11초 반복)
function handPose(T){
 const START=[640,SEA+260,14],HIGH=[610,SEA-96,-8],GRIPP=[372,SEA+14,-3];
 const rise=oc(sg(T,.2,2.4)),flip=io(sg(T,2.5,3.4)),grabIn=io(sg(T,2.7,3.5)),grabOut=io(sg(T,9.2,10.4));
 let x=START[0]+(HIGH[0]-START[0])*rise,y=START[1]+(HIGH[1]-START[1])*rise,a=START[2]+(HIGH[2]-START[2])*rise;
 x-=120*flip;y-=60*flip;a-=30*flip;                      // 손바닥을 뒤집으며 배 위로 치켜듦
 y+=Math.sin(T*2.1)*3;
 const hold=sg(T,3.5,9.2)*(1-grabOut);
 const curl=.08+.32*flip;
 return {x,y,a,curl,hold,rise,flip,grabIn,grabOut,front:(1-flip)*rise,sink:grabOut,lunge:0};
}
function toWorld(P,p){const c=Math.cos(P.a*RAD0),s=Math.sin(P.a*RAD0);return [P.x+HS*(p[0]*c-p[1]*s),P.y+HS*(p[0]*s+p[1]*c)];}
function toLocal(P,w){const c=Math.cos(P.a*RAD0),s=Math.sin(P.a*RAD0),dx=(w[0]-P.x)/HS,dy=(w[1]-P.y)/HS;return [dx*c+dy*s,-dx*s+dy*c];}
function crescent(p,ux,uy,w){const nx=-uy,ny=ux,a=w*.42;
 return 'M'+n1(p[0]+nx*a)+','+n1(p[1]+ny*a)+' Q'+n1(p[0]+ux*7)+','+n1(p[1]+uy*7)+' '+n1(p[0]-nx*a)+','+n1(p[1]-ny*a)+' Q'+n1(p[0]+ux*3)+','+n1(p[1]+uy*3)+' '+n1(p[0]+nx*a)+','+n1(p[1]+ny*a)+' Z';}
function holePaint(el,t){
 const c=el._rx||(el._rx=(()=>{const q=s=>el.querySelector(s),qa=s=>[...el.querySelectorAll(s)];
  const o={hand:q('.rh-hand'),palm:q('.rh-palm'),fore:q('.rh-fore'),fores:q('.rh-fores'),segB:q('.rh-segsB'),segF:q('.rh-segsF'),
   flash:q('.rh-flash'),bolts:q('.rh-bolts'),rings:qa('.rh-ring'),boltSeed:-1,
   seg:{},ph:qa('.rh-ph').map(g=>({g,pit:g.querySelector('.rh-pitE'),gl:g.querySelector('.rh-pglow'),R:PHOLES[+g.dataset.i][2]})),
   rm:qa('.rm:not(.rm-g)').map(g=>({g,i:+g.dataset.i,clip:el.querySelector('.rm-clip[data-i="'+g.dataset.i+'"]'),aL:g.querySelector('.rm-armL'),aR:g.querySelector('.rm-armR'),hL:g.querySelector('.rm-handL'),hR:g.querySelector('.rm-handR'),hair:[...g.querySelectorAll('.rm-hair')].map(h=>({h,x:+h.dataset.x,l:+h.dataset.l,k:+h.dataset.k}))}))};
  qa('.rh-seg').forEach(g=>{const key=g.dataset.f+'_'+g.dataset.k+(g.classList.contains('rh-f')?'F':'B');o.seg[key]={g,sp:g.querySelector('.rh-sp'),ss:g.querySelector('.rh-ss'),knk:g.querySelector('.rh-knk'),nail:g.querySelector('.rh-nail'),tip:g.querySelector('.rh-tiphole')};});
  o.r0=rainLayer(q('.rh-rain0'),60,11,12,1.1,520);o.r1=rainLayer(q('.rh-rain1'),50,13,26,1.8,900);o.r2=rainLayer(q('.rh-rain2'),12,17,60,4,1300);
  const dr=q('.rh-drips');let h='';for(let i=0;i<26;i++)h+='<ellipse rx="2.2" ry="4" fill="#7fe0d8" opacity="0"/>';dr.innerHTML=h;o.drips=[...dr.children].map((e,i)=>({e,p:(i*.379)%1,u:(i*.613)%1}));
  const fo=q('.rh-foam');h='';for(let i=0;i<14;i++)h+='<ellipse fill="url(#rhFoam)" opacity="0"/>';fo.innerHTML=h;o.foam=[...fo.children];
  return o;})());
 const T=t%11;
 // 번개
 const cyc=t%5.2,ix=Math.floor(t/5.2),f=cyc<.07?1:cyc<.14?.15:cyc<.22?.85:Math.max(0,1-(cyc-.22)/.55)*.45;
 if(cyc<.8){if(c.boltSeed!==ix){c.boltSeed=ix;c.bolts.innerHTML=bolt(ix*31+7);}c.bolts.setAttribute('opacity',n3(f));}else c.bolts.setAttribute('opacity','0');
 c.flash.setAttribute('opacity',n3(f*.22));
 // 손
 const P=handPose(T),tf='translate('+n1(P.x)+' '+n1(P.y)+') rotate('+n1(P.a)+') scale('+HS+')';
 c.palm.setAttribute('transform',tf);c.segB.setAttribute('transform',tf);c.segF.setAttribute('transform',tf);
 c.hand.setAttribute('opacity',n3(P.front>0?Math.min(1,P.front*3):0));c.segB.setAttribute('opacity',n3(Math.min(1,P.front*3)));c.segF.setAttribute('opacity',n3(Math.min(1,P.front*3)));
 // 팔뚝: 손목에서 물속으로(넙치 몸 쪽으로 비스듬히)
 const w1=toWorld(P,[-70,118]),w2=toWorld(P,[70,118]),wm=toWorld(P,[0,124]);
 const d1=[w1[0]+60,SEA+60],d2=[w2[0]+110,SEA+60];
 const fp='M'+n1(w1[0])+','+n1(w1[1])+' C'+n1(w1[0]+10)+','+n1(w1[1]+60)+' '+n1(d1[0]-20)+','+n1(SEA)+' '+n1(d1[0])+','+n1(d1[1])+' L'+n1(d2[0])+','+n1(d2[1])+' C'+n1(d2[0]-10)+','+n1(SEA)+' '+n1(w2[0]+30)+','+n1(w2[1]+50)+' '+n1(w2[0])+','+n1(w2[1])+' Q'+n1(wm[0])+','+n1(wm[1]+10)+' '+n1(w1[0])+','+n1(w1[1])+' Z';
 c.fore.setAttribute('d',fp);c.fores.setAttribute('d',fp);
 // 손가락: 마디마다 앞(이쪽으로 접힘)/뒤 판정
 FINGERS.forEach((F,fi)=>{const J=fingerJoints(F,P.curl);let ang=0;
  for(let k=0;k<F.L.length;k++){
   ang+=GRIP[fi][k]*P.curl;const front=Math.cos((ang-GRIP[fi][k]*P.curl*.5)*RAD0)<0;
   const p=J.pts[k],q=J.pts[k+1],w0=F.w[k],w1=F.w[k+1]||F.w[k]*.86,d=segPath(p,q,w0,w1);
   const A=c.seg[fi+'_'+k+(front?'F':'B')],Bx=c.seg[fi+'_'+k+(front?'B':'F')];
   Bx.g.style.display='none';A.g.style.display='';
   A.sp.setAttribute('d',d);A.ss.setAttribute('d',d);A.ss.setAttribute('fill',front?'url(#rhBack)':'url(#rhSeg)');
   const dx=q[0]-p[0],dy=q[1]-p[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l;
   A.knk.setAttribute('d',crescent([p[0]+ux*Math.min(10,l*.3),p[1]+uy*Math.min(10,l*.3)],ux,uy,w0));
   if(A.nail){
    const tp=[q[0]-ux*w1*.18,q[1]-uy*w1*.18],ang2=Math.atan2(uy,ux)/RAD0;
    A.nail.setAttribute('cx',n1(tp[0]));A.nail.setAttribute('cy',n1(tp[1]));A.nail.setAttribute('rx',n1(w1*.3));A.nail.setAttribute('ry',n1(w1*.36));A.nail.setAttribute('transform','rotate('+n1(ang2)+' '+n1(tp[0])+' '+n1(tp[1])+')');A.nail.setAttribute('opacity',front?'.85':'0');
    A.tip.setAttribute('cx',n1(q[0]-ux*w1*.2));A.tip.setAttribute('cy',n1(q[1]-uy*w1*.2));A.tip.setAttribute('rx',n1(w1*.22));A.tip.setAttribute('ry',n1(w1*.2));A.tip.setAttribute('opacity',front?'0':'.9');
   }
  }});
 // 구멍: 움켜쥐면 벌어지고 안쪽이 빛남
 const open=.55+.45*sg(T,3.6,4.3)*(1-sg(T,9.4,10.4));
 c.ph.forEach((H,i)=>{const pul=1+.06*Math.sin(t*4+i);H.pit.setAttribute('transform','scale('+n3(open*pul)+')');H.gl.setAttribute('opacity',n3(.15+.5*sg(T,3.6,4.4)*(.6+.4*Math.sin(t*3+i))));});
 // 인어: 구멍에서 기어 나와 배 쪽으로
 const boatW=[[300,SEA-16],[350,SEA-22],[400,SEA-18],[330,SEA-20],[380,SEA-16],[420,SEA-20]];
 c.rm.forEach(M=>{if(M.g.classList.contains('rm-g'))return;const h=PHOLES[MERM[M.i]],s0=1.1+M.i*.22,e=0*sg(T,s0,s0+1.4),R=h[2];
  if(e<=0){M.g.setAttribute('opacity','0');M.clip.setAttribute('rx',n1(R));M.clip.setAttribute('ry',n1(R));return;}
  const boatL=toLocal(P,boatW[M.i]);
  const crawl=io(sg(e,.42,1)),x=h[0]+(boatL[0]-h[0])*crawl,y=h[1]+(boatL[1]-h[1])*crawl-6*Math.sin(crawl*Math.PI),sc=.35+.65*oc(sg(e,0,.4));
  const tilt=Math.atan2(boatL[1]-h[1],boatL[0]-h[0])/RAD0-90;
  M.g.setAttribute('opacity',n3(1-sg(e,.86,1)));
  M.g.setAttribute('transform','translate('+n1(x)+' '+n1(y)+') rotate('+n1(tilt*crawl*.4)+') scale('+n3(sc*1.45/HS)+')');
  const cr=R*(1+8*oc(sg(e,.12,.5)));M.clip.setAttribute('rx',n1(cr));M.clip.setAttribute('ry',n1(cr));
  // 팔: 처음엔 구멍 가장자리를 짚고, 나와서는 배 쪽으로 뻗어 기어감
  const reach=sg(e,.3,.6),sw=Math.sin(t*5+M.i)*4;
  [[-1,M.aL,M.hL],[1,M.aR,M.hR]].forEach(([sd,A,Hh])=>{
   const sh=[sd*12,-2],grip=[sd*(R*.9/(sc*1.45/HS)),8],far=[sd*20+sw*sd,40+12*Math.sin(t*4+M.i+sd)];
   const hp=[grip[0]+(far[0]-grip[0])*reach,grip[1]+(far[1]-grip[1])*reach],el=[(sh[0]+hp[0])/2+sd*8,(sh[1]+hp[1])/2-6];
   A.setAttribute('d',ribbon([sh,el,hp],u=>6.4-2.6*u));
   const a=Math.atan2(hp[1]-el[1],hp[0]-el[0]);let hd='';
   for(let k=0;k<4;k++){const fa=a+(k-1.5)*.32,L=7+(k===1||k===2?2:0);hd+=ribbon([hp,[hp[0]+Math.cos(fa)*L*.5,hp[1]+Math.sin(fa)*L*.5],[hp[0]+Math.cos(fa)*L,hp[1]+Math.sin(fa)*L]],u=>2.6*(1-u*.6));}
   Hh.setAttribute('d',hd+' M'+n1(hp[0]-3.6)+','+n1(hp[1])+' a3.6,3.6 0 1 0 7.2,0 a3.6,3.6 0 1 0 -7.2,0 Z');});
  M.hair.forEach(H=>{const pts=[];for(let k=0;k<=5;k++){const u=k/5;pts.push([H.x*(1+u*.5)+Math.sin(t*2+H.k+u*2+M.i)*3*u,-26+u*H.l]);}H.h.setAttribute('d',ribbon(pts,u=>3.6*(1-u*.75)));});
 });
 // ----- 움켜쥔 손(손등 쪽)
 if(!c.dor){const q=s=>el.querySelector(s),qa=s=>[...el.querySelectorAll(s)];
  c.dor={g:q('.rh-dor'),F:q('.rh-dorF'),arm:q('.rd-arm'),arms:q('.rd-arms'),back:q('.rd-back'),backs:q('.rd-backs'),knk:q('.rd-knks'),
   holes:qa('.rd-h').map(g=>({g,l:g.querySelector('.rd-hl'),p:g.querySelector('.rd-hp'),i:+g.dataset.i})),
   fing:qa('.rd-f').map(g=>({g,i:+g.dataset.i,fp:g.querySelector('.rd-fp'),fs:g.querySelector('.rd-fs'),c1:g.querySelector('.rd-c'),c2:g.querySelector('.rd-c2'),hi:g.querySelector('.rd-hi'),nail:g.querySelector('.rd-nail'),nh:g.querySelector('.rd-nailhi')})),
   gm:qa('.rm-g').map(g=>({g,i:+g.dataset.g,aL:g.querySelector('.rm-armL'),aR:g.querySelector('.rm-armR'),hL:g.querySelector('.rm-handL'),hR:g.querySelector('.rm-handR'),hair:[...g.querySelectorAll('.rm-hair')].map(h=>({h,x:+h.dataset.x,l:+h.dataset.l,k:+h.dataset.k}))}))};
  let kn='';for(let i=0;i<4;i++)kn+='<ellipse class="rd-k" fill="url(#rhLip)" opacity=".55"/>';c.dor.knk.innerHTML=kn;c.dor.kn=[...c.dor.knk.children];}
 const D=c.dor,gi=P.grabIn,go=P.grabOut,vis=gi*(1-go);
 D.g.setAttribute('opacity',n3(Math.min(1,vis*1.6)));D.F.setAttribute('opacity',n3(Math.min(1,vis*1.6)));
 const sq=P.hold*(Math.sin(t*2.4)*.5+.5);                                 // 움켜쥐는 힘이 맥박처럼
 const cxh=400+Math.sin(t*1.3)*3,cyh=SEA-196-230*(1-gi)-260*go+sq*4;
 // 손등: 마디뼈 언덕이 앞쪽 가장자리에 솟은 넓적한 덩이
 const bk=[[cxh-176,cyh+40],[cxh-180,cyh-10],[cxh-140,cyh-62],[cxh-40,cyh-86],[cxh+70,cyh-80],[cxh+150,cyh-44],[cxh+176,cyh+14],[cxh+150,cyh+56],[cxh+80,cyh+70],[cxh+30,cyh+76],[cxh-30,cyh+78],[cxh-90,cyh+74],[cxh-140,cyh+64]];
 const bd=smooth(bk,true);D.back.setAttribute('d',bd);D.backs.setAttribute('d',bd);
 const a1=[cxh+120,cyh-60],a2=[cxh+178,cyh+20];
 const ad='M'+n1(a1[0])+','+n1(a1[1])+' C'+n1(a1[0]+90)+','+n1(a1[1]+20)+' '+n1(640)+','+n1(SEA-60)+' '+n1(660)+','+n1(SEA+30)+' L'+n1(760)+','+n1(SEA+30)+' C'+n1(740)+','+n1(SEA-40)+' '+n1(a2[0]+80)+','+n1(a2[1]-10)+' '+n1(a2[0])+','+n1(a2[1])+' Z';
 D.arm.setAttribute('d',ad);D.arms.setAttribute('d',ad);
 const KN=[[-118,58],[-48,70],[22,72],[92,62]];
 D.kn.forEach((e,i)=>{e.setAttribute('cx',n1(cxh+KN[i][0]));e.setAttribute('cy',n1(cyh+KN[i][1]-10));e.setAttribute('rx','26');e.setAttribute('ry','15');});
 const DH=[[-100,-20,10],[-30,-46,12],[50,-40,9],[110,-6,11],[-60,20,8],[20,10,13],[130,40,7]];
 D.holes.forEach(H=>{const [x,y,R]=DH[H.i],op=.55+.45*sg(T,3.5,4.2);H.l.setAttribute('cx',n1(cxh+x));H.l.setAttribute('cy',n1(cyh+y));H.l.setAttribute('rx',n1(R*1.35));H.l.setAttribute('ry',n1(R*1.1));
  H.p.setAttribute('cx',n1(cxh+x+1));H.p.setAttribute('cy',n1(cyh+y+1));H.p.setAttribute('rx',n1(R*op));H.p.setAttribute('ry',n1(R*.82*op));});
 // 손가락: 마디뼈에서 배를 넘어 뱃전 앞까지 휘어 감쌈(엄지는 고물 쪽을 감쌈)
 const TIPS=[[246,SEA+4],[316,SEA+12],[388,SEA+12],[458,SEA+6]],WID=[[40,26],[38,24],[38,24],[36,23]];
 const curlG=io(sg(T,2.9,3.7))*(1-go)+sq*.04;
 D.fing.forEach(Fd=>{const i=Fd.i,b=[cxh+KN[i][0],cyh+KN[i][1]-14],tipG=TIPS[i],tipO=[tipG[0]-70,tipG[1]-120];
  const tip=[lerp(tipO[0],tipG[0],curlG)+Math.sin(t*3+i)*1.5*P.hold,lerp(tipO[1],tipG[1],curlG)+sq*3];
  const c1=[b[0]-26-14*curlG,b[1]+30],c2=[tip[0]-34*curlG-10,tip[1]-74];
  const pts=[];for(let k=0;k<=14;k++){const u=k/14,v=1-u;pts.push([v*v*v*b[0]+3*v*v*u*c1[0]+3*v*u*u*c2[0]+u*u*u*tip[0],v*v*v*b[1]+3*v*v*u*c1[1]+3*v*u*u*c2[1]+u*u*u*tip[1]]);}
  const w=u=>lerp(WID[i][0],WID[i][1],u)*(1+.08*Math.sin(u*Math.PI*3));
  const d=ribbon(pts,w);Fd.fp.setAttribute('d',d);Fd.fs.setAttribute('d',d);
  const {L}=edges(pts,u=>w(u)*.5);Fd.hi.setAttribute('d',ribbon(L.slice(2,12),u=>4*(1-Math.abs(u-.5)*1.6)));
  [[Fd.c1,5],[Fd.c2,10]].forEach(([e,k])=>{const p=pts[k],q=pts[k+1],dx=q[0]-p[0],dy=q[1]-p[1],l=Math.hypot(dx,dy)||1;e.setAttribute('d',crescent(p,dx/l,dy/l,w(k/14)));});
  const p=pts[13],q=pts[14],ang=Math.atan2(q[1]-p[1],q[0]-p[0])/RAD0,np=[pts[13][0]*.4+pts[14][0]*.6,pts[13][1]*.4+pts[14][1]*.6];
  Fd.nail.setAttribute('cx',n1(np[0]));Fd.nail.setAttribute('cy',n1(np[1]));Fd.nail.setAttribute('rx',n1(WID[i][1]*.3));Fd.nail.setAttribute('ry',n1(WID[i][1]*.24));Fd.nail.setAttribute('transform','rotate('+n1(ang)+' '+n1(np[0])+' '+n1(np[1])+')');
  Fd.nh.setAttribute('cx',n1(np[0]-3));Fd.nh.setAttribute('cy',n1(np[1]-3));Fd.nh.setAttribute('rx','4');Fd.nh.setAttribute('ry','2.4');Fd.nh.setAttribute('transform','rotate('+n1(ang)+' '+n1(np[0])+' '+n1(np[1])+')');});
 // 손바닥 구멍에서 기어 나온 인어들: 손 밑(손가락 사이)에서 나와 갑판으로, 뱃전을 넘어 이쪽으로
 const GS=[[284,cyh+82],[352,cyh+90],[420,cyh+86],[318,cyh+84],[386,cyh+90],[452,cyh+80]],GT=[[284,SEA-16],[352,SEA-22],[422,SEA-16],[318,SEA+4],[388,SEA+6],[300,SEA-30]];
 D.gm.forEach(M=>{const s0=3.9+M.i*.82,e=sg(T,s0,s0+2.6)*(1-go),sc=.25+.75*oc(sg(e,0,.35));
  if(e<=0||vis<.3){M.g.setAttribute('opacity','0');return;}
  const k=io(sg(e,.2,1)),x=lerp(GS[M.i][0],GT[M.i][0],k),y=lerp(GS[M.i][1],GT[M.i][1],k)-8*Math.sin(k*Math.PI);
  M.g.setAttribute('opacity',n3(Math.min(1,e*5)*(1-sg(e,.92,1))));
  M.g.setAttribute('transform','translate('+n1(x)+' '+n1(y)+') scale('+n3(sc*1.0)+')');
  [[-1,M.aL,M.hL],[1,M.aR,M.hR]].forEach(([sd,A,Hh])=>{const sh=[sd*12,-2],reach=sg(e,.15,.5),hp=[sd*(18+6*Math.sin(t*4+M.i))+sd*8*reach,10+30*reach+6*Math.sin(t*5+M.i+sd)],elb=[(sh[0]+hp[0])/2+sd*9,(sh[1]+hp[1])/2-5];
   A.setAttribute('d',ribbon([sh,elb,hp],u=>6.4-2.6*u));const a=Math.atan2(hp[1]-elb[1],hp[0]-elb[0]);let hd='';
   for(let kk=0;kk<4;kk++){const fa=a+(kk-1.5)*.32,L=7+(kk===1||kk===2?2:0);hd+=ribbon([hp,[hp[0]+Math.cos(fa)*L*.5,hp[1]+Math.sin(fa)*L*.5],[hp[0]+Math.cos(fa)*L,hp[1]+Math.sin(fa)*L]],u=>2.6*(1-u*.6));}
   Hh.setAttribute('d',hd+' M'+n1(hp[0]-3.6)+','+n1(hp[1])+' a3.6,3.6 0 1 0 7.2,0 a3.6,3.6 0 1 0 -7.2,0 Z');});
  M.hair.forEach(H=>{const pts=[];for(let kk=0;kk<=5;kk++){const u=kk/5;pts.push([H.x*(1+u*.35)+Math.sin(t*2+H.k+u*2+M.i)*2.5*u,-24+u*H.l]);}H.h.setAttribute('d',ribbon(pts,u=>4.2*(1-u*.7)));});});
 // 손에서 떨어지는 물방울 · 손목이 물에 닿는 자리의 물결 · 거품
 const wet=Math.max(P.front,vis);
 c.drips.forEach(Dr=>{const k=(t*.8+Dr.p)%1,src=P.front>.3?toWorld(P,[-100+Dr.u*200,60+Dr.u*60]):[cxh-170+Dr.u*340,cyh+70];const y=src[1]+k*k*260;
  Dr.e.setAttribute('cx',n1(src[0]+(Dr.u-.5)*20));Dr.e.setAttribute('cy',n1(y));Dr.e.setAttribute('opacity',n3(y<SEA?.6*wet*(1-k):0));});
 const ex=P.front>.3?(d1[0]+d2[0])/2:700;
 c.rings.forEach(e=>{const i=+e.dataset.i,k=((t*.35+i/5)%1);e.setAttribute('cx',n1(ex));e.setAttribute('rx',n1(60+k*360));e.setAttribute('ry',n1(5+k*26));e.setAttribute('opacity',n3(.4*(1-k)));e.setAttribute('stroke-width',n1(3-2*k));});
 c.foam.forEach((e,i)=>{const k=((t*.5+i*.17)%1),x=(i<7?ex-120+i*40:300+(i-7)*30);e.setAttribute('cx',n1(x+k*10));e.setAttribute('cy',n1(SEA+4+k*6));e.setAttribute('rx',n1(20+k*30));e.setAttribute('ry',n1(3+k*3));e.setAttribute('opacity',n3((i<7?.8:.8*P.hold)*(1-k)));});
 const rain=(arr,slant)=>arr.forEach(R=>{const y=(R.y+t*R.v)%(H+80)-40,x=R.x-(y-R.y)*slant;R.e.setAttribute('d','M'+n1(x)+','+n1(y)+' L'+n1(x+R.w)+','+n1(y)+' L'+n1(x+R.w-R.l*slant)+','+n1(y+R.l)+' L'+n1(x-R.l*slant)+','+n1(y+R.l)+' Z');});
 rain(c.r0,.16);rain(c.r1,.2);rain(c.r2,.22);
 // 배: 움켜쥐이면 들려 올라가 흔들림
 if(K){const B=Math.sin(t*1.9)*3*(1-P.hold),lift=-14*P.hold+Math.sin(t*7)*2*P.hold,R=Math.sin(t*1.5)*3.2+P.hold*(4+Math.sin(t*5)*2);
  const tw=K.boatPose(el,350,SEA+B+lift,R,[37,-30]);K.lamp(el,t,tw,f*.3+P.hold*.2*Math.sin(t*20));}
}

const KIND={stem:{svg:stemSvg,paint:stemPaint,label:'희귀 고래 · 천가닥 줄기 고래'},hole:{svg:holeSvg,paint:holePaint,label:'희귀 고래 · 구멍 손바닥 고래'}};
const cache={};
function html(id){const k=KIND[id];if(!k)return '';return shell(id,cache[id]||(cache[id]=k.svg()),k.label);}
const t0=performance.now();
function frame(now){
 document.querySelectorAll('.rx-baked:not([data-done])').forEach(bake);
 document.querySelectorAll('.rare-fx-024').forEach(el=>{const k=KIND[el.dataset.rare];if(!k)return;try{k.paint(el,el.dataset.seek!=null?+el.dataset.seek:(now-t0)/1000);}catch(e){if(!el._err){el._err=1;console.warn('희귀 고래 장면',e);}}});
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.RareWhaleFx024={html};
})();
