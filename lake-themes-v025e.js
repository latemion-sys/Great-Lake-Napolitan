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

 /* ───────── 21-16 · 에메랄드빛 호수 ─────────
    「물이 불투명한 에메랄드빛이다. 긴 머리카락이 물에서 올라와 있다. 발치에 빗이 놓여 있다.」
    · 물: 속이 비치지 않는 짙은 에메랄드빛. 보석처럼 탁한 광택.
    · 머리카락: 뱃머리 곁의 물에서 긴 머리카락 한 타래가 올라와 늘어지고, 끝은 수면 위로 흩어져 떠 있다.
      (머리카락만 보이고 그 아래는 보이지 않는다) 젖은 윤이 흐르고, 물살에 천천히 흔들린다.
    · 빗: 배 위, 선원의 발치(갑판)에 빗 하나가 놓여 있다. */
 THEMES[16]={
  skyTop:'#040806',skyMid:'#0c1a14',skyHorizon:'#24402f',moon:'#d0f0dc',
  seaTop:'#2f8a64',seaMid:'#155a3e',seaBottom:'#06241a',
  crest:'#bff0d4',swell:'#3a9a72',hatch:'#d8ffe8',boat:'#030605',rim:'#9cc8b0',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.9,drift:.6
 };
 const HAIR=72;
 LAYERS[16]={
  under(th){
   const n=N();let fl='';for(let i=0;i<HAIR;i++)fl+='<path data-i="'+i+'"/>';
   return '<defs>'+(n?n.pattern('emStone','em-stone',{size:256,cell:34,oct:4,rgb:[200,255,226],lo:.55,hi:.92,stretch:[2.2,1],seed:61},260,70):'')+'</defs>'+
    (n?'<g class="em-v"><rect x="0" y="126" width="1600" height="80" fill="url(#emStone)" opacity=".28" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g class="em-float">'+fl+'</g>';   // 수면에 흩어져 뜬 머리카락 끝
  },
  surface(th){
   let s='';for(let i=0;i<HAIR;i++)s+='<path data-i="'+i+'"/>';
   return '<g class="em-hair">'+s+'</g><ellipse class="em-ring"/><ellipse class="em-ring b"/>'+
    '<g class="em-comb"><path d="M-4.6,-1.4 L4.6,-1.4 Q5.2,-1.4 5.2,-.8 L5.2,0 L-5.2,0 L-5.2,-.8 Q-5.2,-1.4 -4.6,-1.4 Z" fill="#e8dcc0"/>'+
     '<path d="M-4.4,0 L-4.4,1.6 M-3.4,0 L-3.4,1.6 M-2.4,0 L-2.4,1.6 M-1.4,0 L-1.4,1.6 M-.4,0 L-.4,1.6 M.6,0 L.6,1.6 M1.6,0 L1.6,1.6 M2.6,0 L2.6,1.6 M3.6,0 L3.6,1.6 M4.5,0 L4.5,1.6" stroke="#d8caa8" stroke-width=".42"/>'+
     '<path d="M-4.2,-1 L4,-1" stroke="#fffaf0" stroke-width=".35" opacity=".8"/><circle class="em-glint" cx="2.6" cy="-1.1" r="1.2" fill="#fffbe8"/></g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const v=el.querySelector('.em-v');if(v)v.setAttribute('transform','translate('+f1(-((t*3)%260))+' 0)');
   // 머리카락이 올라온 자리: 뱃머리 앞 가까운 물
   const bx=c.x+104*c.s,by=surf(bx,t,a)+5,app=sm((t-.3)/2.5);
   el.querySelectorAll('.em-hair path').forEach(p=>{
    const i=+p.dataset.i,u=i/HAIR,seed=R(i);
    // 한 타래로 물에서 솟아 둥글게 넘어가 늘어지고, 끝은 수면을 따라 흘러간다(부드러운 곡선)
    const x0=bx+(u-.5)*6+Math.sin(i*1.7)*1.5,y0=by+1,H=(26+seed*14+Math.sin(u*Math.PI)*6)*app,reach=(26+seed*26)*app;
    const sw=Math.sin(t*.5+i*.13)*3+Math.sin(t*1.3+i*.7)*1.2,dir=u<.18?1:-1;      // 몇 가닥은 반대쪽으로
    const p1=[x0+dir*1.5,y0-H*.7],p2=[x0-dir*reach*.25+sw,y0-H*1.05],p3=[x0-dir*reach*.75+sw*1.4,y0-H*.35];
    const e=[x0-dir*reach+sw*1.6,surf(x0-dir*reach,t,a)+1.2],tail=[e[0]-dir*(10+seed*24),surf(e[0]-dir*(10+seed*24),t,a)+1.6+Math.sin(t*.8+i)*.8];
    let d='M'+f1(x0)+','+f1(y0)+' C'+f1(p1[0])+','+f1(p1[1])+' '+f1(p2[0])+','+f1(p2[1])+' '+f1(p3[0])+','+f1(p3[1])+
     ' S'+f1(e[0]+dir*2)+','+f1(e[1]-6)+' '+f1(e[0])+','+f1(e[1])+' Q'+f1((e[0]+tail[0])/2)+','+f1(e[1]+2+Math.sin(t+i)*1.2)+' '+f1(tail[0])+','+f1(tail[1]);
    p.setAttribute('d',d);p.style.opacity=(app*(.65+.35*seed)).toFixed(3);
    p.style.strokeWidth=(.22+seed*.38).toFixed(2);p.style.stroke=i%6===0?'#5a6a5c':i%4===0?'#2e2622':'#120e0c';
   });
   // 물 위로 흩어진 머리카락 끝
   el.querySelectorAll('.em-float path').forEach(p=>{
    const i=+p.dataset.i,seed=R(i+90),ang=Math.PI*(.82+seed*.3)*(i%3?1:-1),L=(40+seed*70)*app;let d='';
    for(let s=0;s<=10;s++){const k=s/10,xx=bx+Math.cos(ang)*L*k+Math.sin(t*.7+i+k*6)*2*k,yy=by+2+Math.abs(Math.sin(ang))*L*k*.18+Math.sin(t*.8+i*2+k*7)*.6;d+=(s?' L':'M')+f1(xx)+','+f1(Math.max(yy,surf(xx,t,a)+1));}
    p.setAttribute('d',d);p.style.opacity=(app*.55).toFixed(3);p.style.strokeWidth=(.3+seed*.4).toFixed(2);
   });
   el.querySelectorAll('.em-ring').forEach((e,k)=>{const ph=((t*.35+k*.5)%1);e.setAttribute('cx',f1(bx));e.setAttribute('cy',f1(by+1));e.setAttribute('rx',f1(8+ph*40));e.setAttribute('ry',f1(1.6+ph*4));e.style.opacity=(app*(1-ph)*.45).toFixed(3);});
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
   if(el._rpk==null)el._rpk=Math.floor(Math.random()*3);
   const push=sm((c.enter-.97)/.03)*sm(((t-6.2)/1.2));
   el.querySelectorAll('.rp-i').forEach(it=>{const k=+it.dataset.k,x=34+k*5.4-(k===el._rpk?push*3:0),y=x<38?-8.1:-8.1-Math.pow((x-38)/17,2)*9,wob=k===el._rpk&&push>0&&push<1?Math.sin(t*30)*.15:0;
    it.setAttribute('transform','translate('+f1(x)+' '+f1(y+wob)+') scale(1.5)');});
  }
 };

 /* ───────── 21-20 · 덮는 호수 ─────────
    「배 앞쪽이 뿌옇다. 수면에서 어떤 것이 올라와 뱃전을 덮는다. 숨을 내쉬기가 힘들어진다.」
    · 배 앞쪽: 뿌연 흰 기운이 뱃머리 앞을 가린다.
    · 어떤 것: 수면에서 희뿌연 막 같은 것이 올라와 뱃전을 넘어 배를 덮어 간다(정체는 드러내지 않음).
      가장자리는 물결치듯 기어오르고, 배가 멈춘 뒤 점점 높이 덮인다.
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
   const k=sm((t-1.2)/6);
   const env=x=>Math.pow(Math.max(0,Math.sin(Math.PI*(x+64)/132)),.7);   // 가운데는 높이, 양끝은 물에 붙음
   const top=(x,ph)=>{const wv=Math.sin(x*.16+t*1.4+ph)*1.8+Math.sin(x*.063-t*.8+ph*2)*2.4+Math.sin(x*.41+t*2.3+ph)*.6;return 6-(env(x)*(12+k*12))+wv*env(x)*(.5+.5*k);};
   const shape=ph=>{let up='';for(let x=-64;x<=68;x+=3){up+=(up?' L':'M')+x+','+f1(top(x,ph));}return up;};
   const up=shape(0),up2=shape(2.1);
   const sheet=up+' L68,9 Q2,15 -64,9 Z';
   el.querySelector('.cv-sheet').setAttribute('d',sheet);const tx=el.querySelector('.cv-tex');if(tx)tx.setAttribute('d',up2+' L68,9 Q2,15 -64,9 Z');
   el.querySelector('.cv-rim').setAttribute('d',up);
   el.querySelectorAll('.cv-drip path').forEach((p,i)=>{const x=-40+i*20+Math.sin(t*.5+i)*3,y=top(x,0),L=2+3*(.5+.5*Math.sin(t*1.2+i*1.7));p.setAttribute('d','M'+f1(x-1.2)+','+f1(y)+' Q'+f1(x)+','+f1(y+L*1.6)+' '+f1(x+1.2)+','+f1(y));});
   g.style.opacity=(.25+.75*sm((t-.6)/1.5)).toFixed(3);
   el.querySelectorAll('.cv-ring').forEach((e,i)=>{const ph=((t*.3+i*.5)%1),p=toWorld(c,[2,8]);e.setAttribute('cx',f1(p[0]));e.setAttribute('cy',f1(surf(p[0],t,a)+3));e.setAttribute('rx',f1(60+ph*60));e.setAttribute('ry',f1(4+ph*5));e.style.opacity=((1-ph)*.4*k).toFixed(3);});
  }
 };

 const css=
  '.lakefx[data-lake="16"]{background:#040806;border-color:#3a6a52}.lakefx[data-lake="16"] .lfx-top{color:#d8f4e4}'+
  '.lakefx .em-hair path,.lakefx .em-float path{fill:none;stroke:#120e0c;stroke-linecap:round;stroke-linejoin:round}'+
  '.lakefx .em-float path{stroke:#1a1410}'+
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
