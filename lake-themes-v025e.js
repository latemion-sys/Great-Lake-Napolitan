/* Great Lake v0.2.5 · 호수별 진입 장면 테마 (21-16 ~ 21-20)
   진입 묘사에서 구체적인 것만 그린다(소리·숨 막힘처럼 보이지 않는 것은 그리지 않음). */
(function(){
 'use strict';
 const FX=window.GREAT_LAKE_FX;if(!FX||!FX.themes||!FX.layers)return;
 const THEMES=FX.themes,LAYERS=FX.layers,N=()=>window.FxNoise;
 const f1=n=>n.toFixed(1),f2=n=>n.toFixed(2),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sm=k=>{k=cl(k,0,1);return k*k*(3-2*k);};
 const R=(n)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 const boatTf=c=>'translate('+f2(c.x)+' '+f2(c.y)+') rotate('+f2(c.roll)+') scale('+c.s+')';
 const toWorld=(c,p)=>{const r=c.roll*Math.PI/180;return [c.x+c.s*(p[0]*Math.cos(r)-p[1]*Math.sin(r)),c.y+c.s*(p[0]*Math.sin(r)+p[1]*Math.cos(r))];};

 // 배가 중앙에 도착한 시각(초). 도착 뒤에 일어나야 하는 일은 이 시각부터 센다.
 // (화면이 다시 그려져도 진입 시각은 이어지므로, 진입 연출 길이로 계산한다)
 function arrived(el,c){const A=FX.ENTER_SECONDS||8;return c.t<A?-1:c.t-A;}

 /* ───────── 21-16 · 에메랄드빛 호수 ─────────
    「물이 불투명한 에메랄드빛이다. 긴 머리카락이 물에서 올라와 있다. 발치에 빗이 놓여 있다.」
    · 물: 속이 비치지 않는 짙은 에메랄드빛. 보석처럼 탁한 광택.
    · 머리카락: 배가 중앙에 멈춘 뒤, 배 바로 앞(보는 쪽) 물 밑에 검은 그늘이 번지고 젖은 머리카락 몇 타래가
      물을 뚫고 올라와 뱃전을 타고 넘어 갑판 위에 걸쳐진다. 젖어서 타래로 뭉치고, 물이 뚝뚝 떨어진다.
      물 밑의 것은 보이지 않는다(머리카락만).
    · 빗: 배 위, 선원의 발치(갑판)에 빗 하나가 놓여 있다. */
 THEMES[16]={
  skyTop:'#040806',skyMid:'#0c1a14',skyHorizon:'#24402f',moon:'#d0f0dc',
  seaTop:'#2f8a64',seaMid:'#155a3e',seaBottom:'#06241a',
  crest:'#bff0d4',swell:'#3a9a72',hatch:'#d8ffe8',boat:'#030605',rim:'#9cc8b0',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.9,drift:.6
 };
 // 젖은 머리카락 타래: [물에서 나오는 x(배 기준), 갑판 위 끝 x, 가닥 수, 늦음(초), 굵기]
 // [뱃전에 걸치는 x(배 기준), 타래 너비, 가닥 수, 늦음(초), 갑판 위로 넘어가는 거리]
 const LOCKS=[[-36,10,18,.9,9],[-23,12,22,.2,12],[-10,13,24,0,14],[3,11,22,.45,10],[15,9,16,.7,7],[27,7,12,1.1,5]];
 let HS=[];LOCKS.forEach((L,li)=>{for(let j=0;j<L[2];j++)HS.push({li,j,n:L[2]});});
 LAYERS[16]={
  under(th){
   const n=N();let fl='';for(let i=0;i<44;i++)fl+='<path data-i="'+i+'"/>';
   return '<defs>'+(n?n.pattern('emStone','em-stone',{size:256,cell:34,oct:4,rgb:[200,255,226],lo:.55,hi:.92,stretch:[2.2,1],seed:61},260,70):'')+
    '<radialGradient id="emShade"><stop stop-color="#020806" stop-opacity=".85"/><stop offset=".6" stop-color="#03120c" stop-opacity=".45"/><stop offset="1" stop-color="#062a1c" stop-opacity="0"/></radialGradient></defs>'+
    (n?'<g class="em-v"><rect x="0" y="126" width="1600" height="80" fill="url(#emStone)" opacity=".28" clip-path="url(#lfxBelow)"/></g>':'')+
    '<ellipse class="em-shade" fill="url(#emShade)"/>'+
    '<g class="em-float">'+fl+'</g>';
  },
  surface(th){
   let h='';HS.forEach((S,i)=>h+='<path data-i="'+i+'" pathLength="100"/>');
   let hl='';LOCKS.forEach((L,i)=>hl+='<path class="em-wet" data-l="'+i+'" pathLength="100"/>');
   let dr='';for(let i=0;i<10;i++)dr+='<ellipse/>';
   return '<g class="em-ring-g"><ellipse class="em-ring"/><ellipse class="em-ring b"/><ellipse class="em-ring c"/></g>'+
    '<g clip-path="url(#lfxAbove)"><g class="em-hair-g"><g class="em-hair">'+h+'</g><g class="em-wets">'+hl+'</g></g></g>'+   // 물빛이 불투명해 물속 부분은 보이지 않음
    '<g class="em-drips">'+dr+'</g>'+
    '<g class="em-comb"><path d="M-4.6,-1.4 L4.6,-1.4 Q5.2,-1.4 5.2,-.8 L5.2,0 L-5.2,0 L-5.2,-.8 Q-5.2,-1.4 -4.6,-1.4 Z" fill="#e8dcc0"/>'+
     '<path d="M-4.4,0 L-4.4,1.6 M-3.4,0 L-3.4,1.6 M-2.4,0 L-2.4,1.6 M-1.4,0 L-1.4,1.6 M-.4,0 L-.4,1.6 M.6,0 L.6,1.6 M1.6,0 L1.6,1.6 M2.6,0 L2.6,1.6 M3.6,0 L3.6,1.6 M4.5,0 L4.5,1.6" stroke="#d8caa8" stroke-width=".42"/>'+
     '<path d="M-4.2,-1 L4,-1" stroke="#fffaf0" stroke-width=".35" opacity=".8"/><circle class="em-glint" cx="2.6" cy="-1.1" r="1.2" fill="#fffbe8"/></g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const v=el.querySelector('.em-v');if(v)v.setAttribute('transform','translate('+f1(-((t*3)%260))+' 0)');
   const ta=arrived(el,c);                       // 도착 뒤 지난 시간(도착 전엔 -1)
   const rise=ta<0?0:sm((ta-.8)/1.6);           // 물 밑 그늘 · 물결
   // 물 밑 그늘과 수면 고리: 배 바로 앞(보는 쪽) 물
   const w0=toWorld(c,[-4,10]);
   const sh=el.querySelector('.em-shade');sh.setAttribute('cx',f1(w0[0]));sh.setAttribute('cy',f1(surf(w0[0],t,a)+9));sh.setAttribute('rx',f1(70*rise));sh.setAttribute('ry',f1(9*rise));sh.style.opacity=f2(rise);
   el.querySelectorAll('.em-ring').forEach((e,k)=>{const ph=((Math.max(0,ta)*.4+k/3)%1);e.setAttribute('cx',f1(w0[0]+(k-1)*18));e.setAttribute('cy',f1(surf(w0[0],t,a)+7));e.setAttribute('rx',f1(10+ph*46));e.setAttribute('ry',f1(1.6+ph*4));e.style.opacity=(rise*(1-ph)*.22).toFixed(3);});
   // 머리카락: 배 좌표계(배와 함께 흔들림)
   const hg=el.querySelector('.em-hair-g');hg.setAttribute('transform',boatTf(c));
   const ends=[];
   el.querySelectorAll('.em-hair path').forEach(p=>{
    const S=HS[+p.dataset.i],L=LOCKS[S.li],u=S.n>1?S.j/(S.n-1)-.5:0,seed=R(S.li*31+S.j),seed2=R(S.li*17+S.j*3+5);
    const g=ta<0?0:sm((ta-1.2-L[3]-seed*.3)/2.6);      // 물에서 나와 뱃전을 타고 올라 갑판 위로 넘어가며 자라남
    if(g<=0){p.style.opacity='0';return;}
    // 뱃전 위는 한 타래로 모이고, 아래(물 쪽)로 갈수록 갈라져 퍼진다. 갑판 위로 넘어간 끝은 조금씩 흩어진다
    const top=L[0]+u*L[1]*.55,ph=seed*6.28,wav=.5+seed2*.7,pts=[];
    const N2=16;
    for(let k=0;k<=N2;k++){const q=k/N2;let x,y;
     if(q<.25){const r=q/.25;y=17-r*10;x=top+u*L[1]*(1.5-r*.6)+Math.sin(t*.8+ph+r*3)*1.2*(1-r);}                 // 물속에서 올라옴(아래쪽은 퍼짐)
     else if(q<.72){const r=(q-.25)/.47;y=7-r*15.6;x=top+u*L[1]*(.9-r*.9)+Math.sin(y*.55+ph)*wav*(1-r*.6);}         // 뱃전을 타고 오름(물결치는 젖은 머리)
     else{const r=(q-.72)/.28;y=-8.8-Math.sin(Math.min(1,r*1.6)*Math.PI*.5)*(2.2+L[1]*.14)*(1-r*r)-(1-r)*.4+r*.5;x=top-r*L[4]*(.6+seed*.7)+u*r*4+Math.sin(r*5+ph)*.6;}          // 뱃전을 넘어 갑판 위에 걸쳐짐
     pts.push(f1(x)+','+f1(y));}
    p.setAttribute('d','M'+pts.join(' L'));
    p.style.strokeDasharray=f1(g*100)+' 200';
    const hl=(S.j%4===0)||(seed2>.8);
    p.style.stroke=hl?(seed>.5?'#728a78':'#56685a'):(S.j%3===0?'#2c362e':'#151b17');p.style.opacity=(hl?.9:.95).toFixed(2);
    p.style.strokeWidth=(hl?.32:.34+seed*.3).toFixed(2);
    if(S.j===Math.floor(S.n/2))ends[S.li]={cx:top,cy:-9.6,g};
   });
   // 젖은 윤: 타래마다 한 줄의 밝은 결
   el.querySelectorAll('.em-wet').forEach(p=>{const li=+p.dataset.l,L=LOCKS[li],E=ends[li];if(!E){p.style.opacity='0';return;}
    p.setAttribute('d','M'+f1(E.cx+.8)+',7 C'+f1(E.cx+1.6)+',2 '+f1(E.cx-.4)+',-3 '+f1(E.cx+.4)+','+f1(E.cy+.6)+' Q'+f1(E.cx-1)+','+f1(E.cy-.6)+' '+f1(E.cx-L[4]*.6)+',-8.8');
    p.style.strokeDasharray=f1(E.g*100)+' 200';p.style.opacity=(.55*E.g).toFixed(2);});
   // 물에 떠서 흩어진 가닥(물 밑의 타래에서 이어짐)
   el.querySelectorAll('.em-float path').forEach(p=>{
    // 뱃전 아래 물에서 수면을 따라 펼쳐진 가닥: 배 쪽에서 보는 쪽(화면 아래)으로, 좌우로 퍼짐
    const i=+p.dataset.i,seed=R(i+90),L=LOCKS[i%LOCKS.length],g0=ta<0?0:sm((ta-1.4-L[3])/2.4);if(g0<=0){p.style.opacity='0';return;}
    const o=toWorld(c,[L[0]+(seed-.5)*L[1]*1.4,6]),side=(seed-.5)*2,Ln=(6+seed*14)*g0;let d='';
    for(let s2=0;s2<=9;s2++){const k=s2/9,xx=o[0]+side*Ln*k*1.3+Math.sin(t*.7+i+k*5)*(1+2*k),yy=surf(o[0],t,a)+2+k*Ln*.45+Math.sin(k*3+i)*1.2*k+Math.sin(t*.8+i*2+k*7)*.4;d+=(s2?' L':'M')+f1(xx)+','+f1(yy);}
    p.setAttribute('d',d);p.style.opacity=(g0*.7).toFixed(3);p.style.strokeWidth=(.25+seed*.4).toFixed(2);p.style.stroke=i%5===0?'#3a4a3e':'#0e1310';
   });
   // 머리카락에서 떨어지는 물방울
   el.querySelectorAll('.em-drips ellipse').forEach((e,i)=>{
    const L=LOCKS[i%LOCKS.length],E=ends[i%LOCKS.length];if(!E||E.g<.6){e.style.opacity='0';return;}
    const per=1.1+(i%4)*.35,ph=((t+i*.53)/per)%1,p0=toWorld(c,[L[0]+((i*7)%5-2)*L[1]*.15,3]);
    const y=p0[1]+ph*ph*22,yw=surf(p0[0],t,a)+3;e.setAttribute('cx',f1(p0[0]));e.setAttribute('cy',f1(Math.min(y,yw)));e.setAttribute('rx','.45');e.setAttribute('ry',f1(.6+ph*.5));
    e.style.opacity=(y<yw?.75:0).toFixed(2);
   });
   // 빗: 선원의 발치(갑판 위)
   const cb=el.querySelector('.em-comb');cb.setAttribute('transform',boatTf(c)+' translate(16.5 -9.4) rotate(-6)');
   el.querySelector('.em-glint').style.opacity=(.35+.55*Math.pow(Math.max(0,Math.sin(t*1.3)),6)).toFixed(3);
  }
 };

 /* ───────── 21-17 · 쪽빛 호수 ─────────
    「물이 쪽빛이다. 물 위로 종소리가 울린다. 어디서 울리는지는 알 수 없다.」
    · 그리는 것: 쪽빛 물뿐(종소리는 보이지 않는 것이라 그리지 않는다).
    · 쪽물 들인 천처럼 짙고 옅은 쪽빛이 결을 이루며 천천히 번지고, 수면에 푸른 윤이 흐른다. */
 THEMES[17]={
  skyTop:'#03050c',skyMid:'#0a1228',skyHorizon:'#22345e',moon:'#d8e4ff',
  seaTop:'#3e5ea8',seaMid:'#1a2c66',seaBottom:'#070c26',
  crest:'#d4e2ff',swell:'#4a6ab8',hatch:'#e0eaff',boat:'#03040a',rim:'#a8b8e0',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.95,drift:.8
 };
 LAYERS[17]={
  under(th){
   const n=N();let sh='';for(let i=0;i<8;i++)sh+='<path/>';
   return '<defs>'+
    (n?n.pattern('jkDye','jk-dye',{size:256,cell:64,oct:4,rgb:[150,180,255],lo:.5,hi:.95,stretch:[4,1],seed:83},420,70):'')+
    (n?n.pattern('jkDeep','jk-deep',{size:256,cell:48,oct:3,rgb:[6,10,40],lo:.45,hi:.9,stretch:[3,1],seed:17},360,60):'')+
    '</defs>'+
    (n?'<g class="jk-a"><rect x="0" y="126" width="1600" height="80" fill="url(#jkDye)" opacity=".32" clip-path="url(#lfxBelow)"/></g>'+
       '<g class="jk-b"><rect x="0" y="126" width="1600" height="80" fill="url(#jkDeep)" opacity=".55" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g class="jk-sheen">'+sh+'</g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const A=el.querySelector('.jk-a'),B=el.querySelector('.jk-b');
   if(A)A.setAttribute('transform','translate('+f1(-((t*6)%420))+' 0)');if(B)B.setAttribute('transform','translate('+f1(-360+((t*4)%360))+' 0)');
   el.querySelectorAll('.jk-sheen path').forEach((p,i)=>{
    const per=5+i%3,ph=((t+i*1.3)/per)%1,cyc=Math.floor((t+i*1.3)/per),x=120+((cyc*173+i*211)%560)+ph*20,y=surf(x,t,a)+3+(i%4)*9,w=14+(i%3)*10;
    let d='',e='';for(let s=0;s<=6;s++){const xx=x-w+s*w/3,yy=surf(xx,t,a)+3+(i%4)*9;d+=(s?' L':'M')+f1(xx)+','+f1(yy);e=' L'+f1(xx)+','+f1(yy+1.2)+e;}
    p.setAttribute('d',d+e+'Z');p.style.opacity=(Math.sin(Math.PI*ph)*.5).toFixed(3);
   });
  }
 };

 /* ───────── 21-18 · 푸른 호수 ─────────
    「물이 푸르게 바뀌었다. 배 밑으로 푸른 것이 지나간다. 한참을 보아도 끝이 없다. 전에 본 것과 닮았다.」
    · 21-01 붉은 호수의 '배 밑을 끝없이 지나가는 것'과 같은 모습을 푸른빛으로(전에 본 것과 닮음).
      이번에는 반대 방향(왼쪽 → 오른쪽)으로 흘러간다. */
 THEMES[18]={
  skyTop:'#04060c',skyMid:'#091428',skyHorizon:'#14325a',moon:'#8fb0d8',
  seaTop:'#1c4a86',seaMid:'#0a2448',seaBottom:'#030a18',
  crest:'#aed0f3',swell:'#5a8ad0',hatch:'#c9e4ff',boat:'#030508',rim:'#a3b8d7',
  lamp:'#ffb04a',lampCore:'#ffe0a0',bob:1.15,drift:.9
 };
 function toBlue(str){   // 붉은 계열 색을 푸른 계열로(밝기·채도는 그대로)
  return str.replace(/#([0-9a-fA-F]{6})\b/g,(m,h)=>{
   let r=parseInt(h.slice(0,2),16)/255,g=parseInt(h.slice(2,4),16)/255,b=parseInt(h.slice(4,6),16)/255;
   const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let hh=0,s=0;
   if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);hh=mx===r?((g-b)/d+(g<b?6:0)):mx===g?((b-r)/d+2):((r-g)/d+4);hh*=60;}
   if(!(hh>=320||hh<=30)||s<.12)return m;
   const H=214/360,q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
   return '#'+[f(H+1/3),f(H),f(H-1/3)].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('');
  });
 }
 const L1=LAYERS[1];
 if(L1)LAYERS[18]={
  sky:th=>toBlue(L1.sky(th)),
  under:th=>toBlue(L1.under(th)).replace('<g class="rl-beast">','<g class="rl-beast" transform="translate(800 0) scale(-1 1)">'),
  surface:th=>toBlue(L1.surface(th)),
  paint:(el,c)=>L1.paint(el,c)
 };

 /* ───────── 21-19 · 귤빛 호수 ─────────
    「물이 귤빛이다. 어느새 눈앞에 돌멩이 하나와 접힌 종이 한 장, 녹슨 가위가 나란히 놓여 있다.
      아무도 올려놓지 않았다. 그중 하나가 우리 쪽으로 조금 밀려난다.」
    · 물: 귤빛. 따뜻한 주황 물에 껍질 같은 잔 광택.
    · 뱃전(선원 앞, 뱃머리 쪽 갑판)에 돌멩이·접힌 종이·녹슨 가위가 나란히 놓여 있고, 배가 멈춘 뒤 그중 하나(매번 무작위)가
      선원 쪽으로 조금 밀려난다. */
 THEMES[19]={
  skyTop:'#0c0604',skyMid:'#2a140a',skyHorizon:'#6a3618',moon:'#ffe0b8',
  seaTop:'#e8944a',seaMid:'#b0581e',seaBottom:'#3a1606',
  crest:'#ffe2b8',swell:'#d87a34',hatch:'#fff0d8',boat:'#0a0503',rim:'#e0b080',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.95,drift:.8
 };
 const RPS='<g class="rp-items">'+
  '<g class="rp-i" data-k="0"><ellipse cx="0" cy="-1.5" rx="2.5" ry="1.7" fill="url(#rpStone)"/><ellipse cx="-.7" cy="-2.2" rx=".9" ry=".4" fill="#e8e4dc" opacity=".55"/></g>'+
  '<g class="rp-i" data-k="1"><path d="M-2.6,0 L-2.2,-2.6 L2.4,-2.9 L2.7,0 Z" fill="#f4f0e4"/><path d="M-2.2,-2.6 L.2,-1.5 L2.4,-2.9" fill="none" stroke="#c8c0a8" stroke-width=".3"/><path d="M-2.6,0 L.2,-1.5 L2.7,0" fill="#e0dac8"/></g>'+
  '<g class="rp-i" data-k="2"><path d="M-3.4,-.6 L2.8,-1.4 L3.2,-.9 Z M-3.4,-1.6 L2.8,-.4 L3,-.9 Z" fill="#8a4a24"/><path d="M-1,-1.1 L2.8,-1.3" stroke="#c88a5a" stroke-width=".25"/>'+
   '<circle cx="-4.4" cy="-.3" r="1.1" fill="none" stroke="#6a3418" stroke-width=".55"/><circle cx="-4.4" cy="-1.9" r="1.1" fill="none" stroke="#6a3418" stroke-width=".55"/><circle cx="-.4" cy="-1.05" r=".35" fill="#3a1a08"/></g>'+
 '</g>';
 LAYERS[19]={
  under(th){
   const n=N();let sh='';for(let i=0;i<10;i++)sh+='<ellipse/>';
   return '<defs>'+(n?n.pattern('gjPeel','gj-peel',{size:128,cell:6,oct:2,rgb:[255,226,180],lo:.62,hi:.95,seed:29},40,40):'')+
    '<radialGradient id="rpStone" cx=".4" cy=".35" r=".7"><stop stop-color="#a8a49c"/><stop offset=".6" stop-color="#6a665e"/><stop offset="1" stop-color="#3a3832"/></radialGradient></defs>'+
    (n?'<g class="gj-v"><rect x="0" y="126" width="1000" height="80" fill="url(#gjPeel)" opacity=".18" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g class="gj-sheen">'+sh+'</g>';
  },
  surface(th){return '<g class="rp-g">'+RPS+'</g>';},
  paint(el,c){
   const {t,a,surf}=c;
   const v=el.querySelector('.gj-v');if(v)v.setAttribute('transform','translate('+f1(-((t*4)%200))+' 0)');
   el.querySelectorAll('.gj-sheen ellipse').forEach((e,i)=>{const per=2.4+(i%3)*.7,ph=((t+i*.6)/per)%1,cyc=Math.floor((t+i*.6)/per),x=130+((cyc*157+i*199)%560);
    e.setAttribute('cx',f1(x));e.setAttribute('cy',f1(surf(x,t,a)+2+(i%4)*8));e.setAttribute('rx',f1(4+Math.sin(Math.PI*ph)*10));e.setAttribute('ry','1');e.style.opacity=(Math.sin(Math.PI*ph)*.55).toFixed(3);});
   // 뱃전의 세 물건: 배가 멈춘 뒤 하나가 선원 쪽으로 조금 밀려남
   const g=el.querySelector('.rp-g');g.setAttribute('transform',boatTf(c));
   const rk=(typeof state!=='undefined'?state.voyage+':'+state.current+':'+(state.visited||[]).length:'');if(FX._rpKey!==rk){FX._rpKey=rk;FX._rpk=Math.floor(Math.random()*3);}el._rpk=FX._rpk;
   const push=sm((c.enter-.97)/.03)*sm(((t-6.2)/1.2));
   el.querySelectorAll('.rp-i').forEach(it=>{const k=+it.dataset.k,x=34+k*5.4-(k===el._rpk?push*3:0),y=x<38?-8.1:-8.1-Math.pow((x-38)/17,2)*9,wob=k===el._rpk&&push>0&&push<1?Math.sin(t*30)*.15:0;
    it.setAttribute('transform','translate('+f1(x)+' '+f1(y+wob)+') scale(1.5)');});
  }
 };

 /* ───────── 21-20 · 덮는 호수 ─────────
    「배 앞쪽이 뿌옇다. 수면에서 어떤 것이 올라와 뱃전을 덮는다. 숨을 내쉬기가 힘들어진다.」
    · 배 앞쪽: 뿌연 흰 기운이 뱃머리 앞을 가린다.
    · 어떤 것: 배가 멈춘 뒤, 수면에서 희뿌연 막 같은 것이 올라와 뱃전을 넘어 배를 덮어 간다(정체는 드러내지 않음).
      가장자리는 물결치듯 기어오르며 점점 높이 덮인다.
    · (숨이 막히는 느낌은 그리지 않음) */
 THEMES[20]={
  skyTop:'#08090a',skyMid:'#1e2221',skyHorizon:'#4a514e',moon:'#e8ece8',
  seaTop:'#8c9692',seaMid:'#4a5250',seaBottom:'#141816',
  crest:'#e8eeea',swell:'#7a8480',hatch:'#e8eeea',boat:'#050606',rim:'#a8b0ac',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.75,drift:.5
 };
 LAYERS[20]={
  under(th){
   const n=N();
   return '<defs>'+(n?n.pattern('cvFog','cv-fog',{size:256,cell:90,oct:4,rgb:[236,240,238],lo:.3,hi:.9,stretch:[3,1],seed:43},600,140):'')+
    '<linearGradient id="cvFade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".45" stop-color="#000"/><stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#fff"/></linearGradient>'+
    '<mask id="cvMask" maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="200"><rect width="800" height="200" fill="url(#cvFade)"/></mask></defs>'+
    (n?'<g mask="url(#cvMask)"><g class="cv-fog"><rect x="0" y="30" width="1200" height="170" fill="url(#cvFog)" opacity=".85"/></g></g>':'')+
    '<rect x="0" y="0" width="800" height="200" fill="#e8ece8" opacity=".18" mask="url(#cvMask)"/>';
  },
  surface(th){
   const n=N();
   return '<defs><linearGradient id="cvSheet" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f2f4f2" stop-opacity=".82"/><stop offset=".5" stop-color="#cdd3ce" stop-opacity=".62"/><stop offset="1" stop-color="#8a928e" stop-opacity=".2"/></linearGradient>'+
    (n?n.pattern('cvTex','cv-tex',{size:128,cell:9,oct:3,rgb:[120,128,124],lo:.5,hi:.9,seed:12},40,40):'')+'</defs>'+
    '<g class="cv-g"><path class="cv-sheet" fill="url(#cvSheet)"/>'+(n?'<path class="cv-tex" fill="url(#cvTex)" opacity=".3"/>':'')+'<path class="cv-rim"/><g class="cv-drip"><path/><path/><path/><path/><path/></g></g>'+
    '<ellipse class="cv-ring"/><ellipse class="cv-ring b"/>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const fg=el.querySelector('.cv-fog');if(fg)fg.setAttribute('transform','translate('+f1(-((t*5)%600))+' '+f1(Math.sin(t*.2)*3)+')');
   // 덮어 오는 것: 배 좌표계에서 물(아래)부터 뱃전 위로 기어오름
   const g=el.querySelector('.cv-g');g.setAttribute('transform',boatTf(c));
   const ta=arrived(el,c),k=ta<0?0:sm((ta-.6)/6);   // 배가 멈춘 뒤에야 물에서 올라와 덮기 시작
   const env=x=>Math.pow(Math.max(0,Math.sin(Math.PI*(x+64)/132)),.7);   // 가운데는 높이, 양끝은 물에 붙음
   const top=(x,ph)=>{const wv=Math.sin(x*.16+t*1.4+ph)*1.8+Math.sin(x*.063-t*.8+ph*2)*2.4+Math.sin(x*.41+t*2.3+ph)*.6;return 9-(env(x)*(2+k*22))+wv*env(x)*(.3+.7*k);};
   const shape=ph=>{let up='';for(let x=-64;x<=68;x+=3){up+=(up?' L':'M')+x+','+f1(top(x,ph));}return up;};
   const up=shape(0),up2=shape(2.1);
   const sheet=up+' L68,9 Q2,15 -64,9 Z';
   el.querySelector('.cv-sheet').setAttribute('d',sheet);const tx=el.querySelector('.cv-tex');if(tx)tx.setAttribute('d',up2+' L68,9 Q2,15 -64,9 Z');
   el.querySelector('.cv-rim').setAttribute('d',up);
   el.querySelectorAll('.cv-drip path').forEach((p,i)=>{const x=-40+i*20+Math.sin(t*.5+i)*3,y=top(x,0),L=2+3*(.5+.5*Math.sin(t*1.2+i*1.7));p.setAttribute('d','M'+f1(x-1.2)+','+f1(y)+' Q'+f1(x)+','+f1(y+L*1.6)+' '+f1(x+1.2)+','+f1(y));});
   g.style.opacity=(ta<0?0:sm((ta-.2)/1.4)).toFixed(3);
   el.querySelectorAll('.cv-ring').forEach((e,i)=>{const ph=((t*.3+i*.5)%1),p=toWorld(c,[2,8]);e.setAttribute('cx',f1(p[0]));e.setAttribute('cy',f1(surf(p[0],t,a)+3));e.setAttribute('rx',f1(60+ph*60));e.setAttribute('ry',f1(4+ph*5));e.style.opacity=((1-ph)*.4*k).toFixed(3);});
  }
 };

 const css=
  '.lakefx[data-lake="16"]{background:#040806;border-color:#3a6a52}.lakefx[data-lake="16"] .lfx-top{color:#d8f4e4}'+
  '.lakefx .em-hair path,.lakefx .em-float path{fill:none;stroke:#120e0c;stroke-linecap:round;stroke-linejoin:round}'+
  '.lakefx .em-float path{stroke:#1a1410}'+
  '.lakefx .em-wet{fill:none;stroke:#bfe8d0;stroke-width:.35;stroke-linecap:round}'+
  '.lakefx .em-drips ellipse{fill:#d8fbe8}'+
  '.lakefx .em-ring{fill:none;stroke:#c8f4dc;stroke-width:.7}'+
  '.lakefx[data-lake="17"]{background:#04060e;border-color:#3e5288}.lakefx[data-lake="17"] .lfx-top{color:#dce6ff}'+
  '.lakefx .jk-sheen path{fill:#cfdcff}'+
  '.lakefx[data-lake="18"]{background:#04070c;border-color:#3a5a80;box-shadow:inset 0 0 65px #02050a,0 8px 30px #0008}'+
  '.lakefx[data-lake="18"] .lfx-horizon{stroke:#85b0e0;stroke-opacity:.22}'+
  '.lakefx[data-lake="18"] .lfx-mist rect{fill:#a0c0e3;opacity:.07}'+
  '.lakefx[data-lake="18"] .lfx-corner{background:linear-gradient(90deg,#040812b8,transparent 22%,transparent 78%,#040812b8),linear-gradient(0deg,#03060cdd,transparent 26%,transparent 76%,#050a10aa)}'+
  '.lakefx[data-lake="18"] .lfx-vignette{box-shadow:inset 0 0 70px 16px #03060d}'+
  '.lakefx[data-lake="18"] .lfx-top{color:#c8dcf0}'+
  '.lakefx[data-lake="18"] .rl-shadow{fill:#030a14}'+
  '.lakefx[data-lake="18"] .rl-scales{stroke:#96c0ff}'+
  '.lakefx[data-lake="18"] .rl-ridge{stroke:#04112c}'+
  '.lakefx[data-lake="18"] .rl-belly{stroke:#a4ccff}'+
  '.lakefx[data-lake="18"] .rl-fins{stroke:#70a6f0}'+
  '.lakefx[data-lake="18"] .rl-fin-rays{stroke:#94c0ff}'+
  '.lakefx[data-lake="18"] .rl-swell{stroke:#9cc4f1}'+
  '.lakefx[data-lake="18"] .rl-bubbles circle{fill:#cce0ff;stroke:#c4dcff}'+
  '.lakefx[data-lake="18"] .rl-pops ellipse{stroke:#c4dcff}'+
  '.lakefx[data-lake="19"]{background:#0e0704;border-color:#8a5a34}.lakefx[data-lake="19"] .lfx-top{color:#ffe8d0}'+
  '.lakefx .gj-sheen ellipse{fill:#fff2d8}'+
  '.lakefx[data-lake="20"]{background:#0a0b0b;border-color:#5a625e}.lakefx[data-lake="20"] .lfx-top{color:#e8ece8}'+
  '.lakefx .cv-rim{fill:none;stroke:#ffffff;stroke-width:.9;stroke-opacity:.7;stroke-linejoin:round}'+
  '.lakefx .cv-drip path{fill:#e8ece8;opacity:.75}'+
  '.lakefx .cv-ring{fill:none;stroke:#e8ece8;stroke-width:.8}';
 const st=document.createElement('style');st.id='lake-themes-v025e';st.textContent=css;document.head.appendChild(st);
 if(typeof state!=='undefined'&&state.scene==='event'&&typeof render==='function')render();
})();
