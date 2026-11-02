/* Great Lake v0.2.5 · 21-07 핏빛 호수 진입 장면
   「물이 핏빛으로 끈적이고 비릿한 냄새가 난다. 물속에 붉은 나무들이 서 있다. 가지에는 열매가 꼬리를 위로 한 채 매달려 있다.」
   · 그리는 것: 끈적한 핏빛 물, 물속(수면 아래)에 서 있는 붉은 나무들.
   · 그리지 않는 것: 냄새, 열매(무엇이 매달려 있는지는 장면 글로만 상상하게 둔다).
   · 물: 무겁고 느린 너울, 두꺼운 광택. 수면 가까이는 조금 비쳐 나무 우듬지가 보이고, 깊을수록 검붉게 가려진다.
   · 나무: 화면 아래(물 밑바닥)에서 솟아 수면 바로 밑까지 뻗은 붉은 나무 여러 그루. 깊은 것일수록 흐리다.
     물속이라 가지가 아주 느리게 흔들리고, 우듬지 끝이 수면 바로 밑에서 어른거린다. */
(function(){
 'use strict';
 const FX=window.GREAT_LAKE_FX;if(!FX||!FX.themes||!FX.layers)return;
 const f1=n=>n.toFixed(1),N=()=>window.FxNoise;
 const R=(n)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 FX.themes[7]={
  skyTop:'#090205',skyMid:'#22060c',skyHorizon:'#4c0f1a',moon:'#e08a8a',
  seaTop:'#9a2232',seaMid:'#5c0c1a',seaBottom:'#1c0206',
  crest:'#ff9a9a',swell:'#a02a3a',hatch:'#ffb0b0',boat:'#080203',rim:'#c88088',
  lamp:'#ffb050',lampCore:'#ffe2a8',bob:.62,drift:.7
 };
 // 가지를 갈래로 뻗는 나무(가늘어지는 면으로 그린다). 원점 = 밑동
 function tree(seed,H,W){
  let segs='';let n=0;const rr=()=>R(seed*31+(n++)*7.13);
  function br(x,y,ang,len,w,d){
   const x2=x+Math.cos(ang)*len,y2=y+Math.sin(ang)*len,bend=(rr()-.5)*len*.4,mx=(x+x2)/2+Math.cos(ang+Math.PI/2)*bend,my=(y+y2)/2+Math.sin(ang+Math.PI/2)*bend;
   const w2=w*.6,px=Math.cos(ang+Math.PI/2),py=Math.sin(ang+Math.PI/2);
   segs+='M'+f1(x+px*w)+','+f1(y+py*w)+' Q'+f1(mx+px*(w+w2)/2)+','+f1(my+py*(w+w2)/2)+' '+f1(x2+px*w2)+','+f1(y2+py*w2)+' L'+f1(x2-px*w2)+','+f1(y2-py*w2)+' Q'+f1(mx-px*(w+w2)/2)+','+f1(my-py*(w+w2)/2)+' '+f1(x-px*w)+','+f1(y-py*w)+' Z ';
   if(d>=5||len<4)return;
   const k=d===0?3:2+(rr()<.45?1:0);
   for(let j=0;j<k;j++){const spread=d===0?.85:.7,na=ang+(j-(k-1)/2)*spread+(rr()-.5)*.4;br(x2,y2,na,len*(.6+rr()*.2),w2,d+1);}
  }
  br(0,0,-Math.PI/2+(R(seed)-.5)*.16,H*.4,W,0);
  return segs;
 }
 // [x, 밑동 y(화면 아래 물 밑), 키, 굵기, 깊이 0 가까움 ~ 1 깊음, 씨앗]
 const TREES=[[352,250,104,4.6,.15,5],[548,252,110,5,.1,9],[214,246,92,4,.35,3],[456,244,80,3.4,.55,7],[650,246,88,3.8,.4,11],[150,240,66,2.8,.75,13],[300,238,62,2.6,.8,17],[600,238,64,2.8,.85,19]];
 const TG=TREES.map(T=>tree(T[5],T[2],T[3]));
 FX.layers[7]={
  sky(th){
   return '<defs><radialGradient id="btHaze" cx=".5" cy="1" r=".7"><stop stop-color="#8a1a28" stop-opacity=".45"/><stop offset="1" stop-color="#3a0610" stop-opacity="0"/></radialGradient></defs>'+
    '<ellipse cx="420" cy="134" rx="460" ry="60" fill="url(#btHaze)"/>';
  },
  under(th){
   const n=N();
   // 깊은 나무부터 그려 가까운 나무가 앞에 오도록
   const order=TREES.map((T,i)=>i).sort((a,b)=>TREES[b][4]-TREES[a][4]);
   let tr='';order.forEach(i=>{const T=TREES[i];tr+='<g class="bt" data-i="'+i+'"><path d="'+TG[i]+'" fill="url(#btBark)"/>'+(n?'<path d="'+TG[i]+'" fill="url(#btGrain)" opacity=".45"/>':'')+'<path d="'+TG[i]+'" fill="url(#btDeep)" opacity="'+(.25+T[4]*.6).toFixed(2)+'"/></g>';});
   return '<defs>'+
     '<linearGradient id="btBark" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#6a0c1a"/><stop offset=".35" stop-color="#d0343f"/><stop offset=".6" stop-color="#a01c2c"/><stop offset="1" stop-color="#4a0610"/></linearGradient>'+
     '<linearGradient id="btDeep" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5c0c1a" stop-opacity=".2"/><stop offset="1" stop-color="#1c0206"/></linearGradient>'+
     (n?n.pattern('btGrain','bt-grain',{size:128,cell:10,oct:3,rgb:[30,0,6],lo:.5,hi:.9,stretch:[.25,1.6],seed:17},40,60):'')+
     '<linearGradient id="btVeil" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#9a2232" stop-opacity=".18"/><stop offset=".25" stop-color="#6a1020" stop-opacity=".42"/><stop offset=".7" stop-color="#2a040c" stop-opacity=".8"/><stop offset="1" stop-color="#120104" stop-opacity=".95"/></linearGradient>'+
     '<linearGradient id="btShaft" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ff8a8a" stop-opacity=".22"/><stop offset="1" stop-color="#ff6070" stop-opacity="0"/></linearGradient>'+
    '</defs>'+
    '<g class="bt-trees" clip-path="url(#lfxBelow)">'+tr+'</g>'+
    '<path class="bt-veil" fill="url(#btVeil)"/>'+
    '<g class="bt-shaft" fill="url(#btShaft)"><path/><path/><path/></g>'+
    '<g class="bt-tips"><path/><path/><path/><path/><path/></g>'+
    '<g class="bt-gloss"><path/><path/><path/></g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   // 물속 나무: 아주 느린 물살에 흔들림
   el.querySelectorAll('.bt').forEach(g=>{const i=+g.dataset.i,T=TREES[i],sw=Math.sin(t*.35+i*1.3)*1.1+Math.sin(t*.9+i)*.35;
    g.setAttribute('transform','translate('+T[0]+' '+T[1]+') rotate('+f1(sw)+')');});
   // 물빛 덮개: 수면부터 아래로 갈수록 짙어져 나무 밑동을 가림
   let v='';for(let x=-20;x<=820;x+=20)v+=(v?' L':'M')+x+','+f1(surf(x,t,a)+1);
   el.querySelector('.bt-veil').setAttribute('d',v+' L820,200 L-20,200 Z');
   // 수면 아래로 비스듬히 스며드는 흐린 빛
   el.querySelectorAll('.bt-shaft path').forEach((p,i)=>{const x=200+i*190+Math.sin(t*.2+i)*30,top=surf(x,t,a)+2,sw=Math.sin(t*.3+i*2)*14;
    p.setAttribute('d','M'+f1(x-14)+','+f1(top)+' L'+f1(x+14)+','+f1(top)+' L'+f1(x+40+sw)+',200 L'+f1(x+6+sw)+',200 Z');p.style.opacity=(.6+.4*Math.sin(t*.6+i)).toFixed(3);});
   // 우듬지 끝이 수면 바로 밑에서 어른거림: 가까운 나무 위 수면이 살짝 어둡게 일렁임
   el.querySelectorAll('.bt-tips path').forEach((p,i)=>{const T=TREES[i%2?1:0],x=T[0]+(i-2)*22+Math.sin(t*.5+i)*6,y=surf(x,t,a)+4+(i%3)*2,w=14+(i%3)*6;
    p.setAttribute('d','M'+f1(x-w)+','+f1(y)+' Q'+f1(x)+','+f1(y+2.4+Math.sin(t*1.1+i))+' '+f1(x+w)+','+f1(y)+' Q'+f1(x)+','+f1(y-1)+' '+f1(x-w)+','+f1(y)+' Z');p.style.opacity=(.35+.2*Math.sin(t*.8+i*1.7)).toFixed(3);});
   // 두꺼운 광택: 무거운 물 위에 번들거리는 넓은 반사
   el.querySelectorAll('.bt-gloss path').forEach((p,i)=>{
    let d='',e='';for(let x=-20;x<=820;x+=20){const y=surf(x,t,a)+3+i*9+Math.sin(x*.01+t*.2+i*2)*2;d+=(d?' L':'M')+x+','+f1(y);e=' L'+x+','+f1(y+1.4+i*.6)+e;}
    p.setAttribute('d',d+e+'Z');p.style.opacity=((.22-i*.06)*(.7+.3*Math.sin(t*.5+i))).toFixed(3);
   });
  }
 };
 const css=
  '.lakefx[data-lake="7"]{background:#0e0306;border-color:#6a2a34}'+
  '.lakefx[data-lake="7"] .lfx-corner{background:linear-gradient(90deg,#120306c0,transparent 22%,transparent 78%,#120306c0),linear-gradient(0deg,#0c0204e0,transparent 26%,transparent 76%,#10030799)}'+
  '.lakefx[data-lake="7"] .lfx-top{color:#f0c4c8}'+
  '.lakefx[data-lake="7"] .lfx-horizon{stroke:#c06070;stroke-opacity:.18}'+
  '.lakefx .bt-tips path{fill:#2a040c}'+
  '.lakefx .bt-gloss path{fill:#ffc0c4}';
 const st=document.createElement('style');st.id='lake-themes-v025c';st.textContent=css;document.head.appendChild(st);
 if(typeof state!=='undefined'&&state.scene==='event'&&typeof render==='function')render();
})();
