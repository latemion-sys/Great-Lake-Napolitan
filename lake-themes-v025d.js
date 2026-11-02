/* Great Lake v0.2.5 · 호수별 진입 장면 테마 (21-11 ~ 21-15)
   진입 묘사에서 구체적인 것만 그린다(소리·기분처럼 보이지 않는 것은 그리지 않음). */
(function(){
 'use strict';
 const FX=window.GREAT_LAKE_FX;if(!FX||!FX.themes||!FX.layers)return;
 const THEMES=FX.themes,LAYERS=FX.layers,N=()=>window.FxNoise;
 const f1=n=>n.toFixed(1),f2=n=>n.toFixed(2),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sm=k=>{k=cl(k,0,1);return k*k*(3-2*k);};
 const R=(n)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 const boatTf=c=>'translate('+f2(c.x)+' '+f2(c.y)+') rotate('+f2(c.roll)+') scale('+c.s+')';

 /* ───────── 21-11 · 바람 호수 ─────────
    「레몬빛 물 너머로 돛이 저절로 펴진다. 바람이 어느 쪽에서 부는지 알 수 없다.」
    · 물: 레몬빛. 하늘은 분홍빛 저녁.
    · 돛: 우리 배의 접혀 있던 돛이 저절로 풀려 펴진다(돛폭 이음선, 두 칸의 축범줄 띠).
    · 바람의 방향을 알 수 없음: 돛배가 부푸는 쪽이 이따금 뒤바뀌고, 돛대 끝 깃발도 방향을 바꾸며,
      수면을 스치는 잔물결 자국(바람 자국)이 제각기 다른 방향으로 지나간다. */
 THEMES[11]={
  skyTop:'#2a1c30',skyMid:'#7a4a66',skyHorizon:'#eeaec1',moon:'#fff0e0',
  seaTop:'#f4e47e',seaMid:'#d8bf4a',seaBottom:'#8a7420',
  crest:'#fffbe0',swell:'#c8a838',hatch:'#fff6c0',boat:'#140f0a',rim:'#6a5a3a',
  lamp:'#ffb050',lampCore:'#fff0c0',bob:1,drift:.9
 };
 function windAt(t){return Math.sin(t*.31)*.7+Math.sin(t*.83+1.7)*.45+Math.sin(t*1.9)*.12;}   // -1..1, 방향이 수시로 뒤바뀜
 LAYERS[11]={
  under(th){
   const n=N();let g='';for(let i=0;i<6;i++)g+='<ellipse data-i="'+i+'"/>';
   return '<defs>'+(n?n.pattern('wdPaw','wd-paw',{size:128,cell:5,oct:2,rgb:[120,96,20],lo:.5,hi:.85,stretch:[2.5,1],seed:31},60,30):'')+
    '<radialGradient id="wdPawM"><stop stop-color="#fff" stop-opacity=".9"/><stop offset=".7" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
    '<mask id="wdMask" maskContentUnits="objectBoundingBox"><ellipse cx=".5" cy=".5" rx=".5" ry=".5" fill="url(#wdPawM)"/></mask></defs>'+
    '<g class="wd-paws">'+g+'</g>';
  },
  surface(th){
   let seams='';for(let k=1;k<5;k++)seams+='<path class="sl-seam" data-k="'+k+'"/>';
   return '<defs><linearGradient id="slCloth" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#e8dcc0"/><stop offset=".5" stop-color="#fbf4e2"/><stop offset="1" stop-color="#d8caa8"/></linearGradient>'+
    '<linearGradient id="slShade" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#000" stop-opacity=".22"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient></defs>'+
    '<g class="sl-g"><path class="sl-furl"/><path class="sl-sail" fill="url(#slCloth)"/><path class="sl-shade" fill="url(#slShade)"/>'+seams+
    '<path class="sl-reef" data-k="0"/><path class="sl-reef" data-k="1"/><path class="sl-rim"/><path class="sl-sheet"/><path class="sl-pen"/></g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const g=el.querySelector('.sl-g');g.setAttribute('transform',boatTf(c));
   const k=sm((t-.9)/2.2),w=windAt(t),bel=w*7*k;
   // 돛 꼭짓점(배 기준): 돛대 쪽 앞변은 고정, 뒷변이 펴지며 바람 따라 부푼다
   const luffTop=[-3,-51],luffBot=[-3,-19],peak=[-3-24*k,-52+2*(1-k)],clew=[-3-40*k,-19];
   const P=(u,v)=>{ // u 0(돛대)→1(뒷변), v 0(위)→1(아래)
    const xT=luffTop[0]+(peak[0]-luffTop[0])*u,yT=luffTop[1]+(peak[1]-luffTop[1])*u,xB=luffBot[0]+(clew[0]-luffBot[0])*u,yB=luffBot[1]+(clew[1]-luffBot[1])*u;
    const x=xT+(xB-xT)*v,y=yT+(yB-yT)*v,b=Math.sin(Math.PI*u)*Math.sin(Math.PI*(.15+.85*v));
    return [x+bel*b*.55,y-Math.abs(bel)*b*.25];};
   let d='M'+P(0,0).map(f1).join(',');
   for(let s=1;s<=8;s++)d+=' L'+P(s/8,0).map(f1).join(',');
   for(let s=1;s<=8;s++)d+=' L'+P(1,s/8).map(f1).join(',');
   for(let s=7;s>=0;s--)d+=' L'+P(s/8,1).map(f1).join(',');
   d+=' Z';
   const sail=el.querySelector('.sl-sail');sail.setAttribute('d',d);el.querySelector('.sl-shade').setAttribute('d',d);el.querySelector('.sl-rim').setAttribute('d',d);
   [sail,el.querySelector('.sl-shade'),el.querySelector('.sl-rim')].forEach(e=>e.style.opacity=k>.02?'1':'0');
   el.querySelectorAll('.sl-seam').forEach(p=>{const u=+p.dataset.k/5;let s='';for(let v=0;v<=6;v++)s+=(v?' L':'M')+P(u,v/6).map(f1).join(',');p.setAttribute('d',s);p.style.opacity=k.toFixed(2);});
   // 두 칸의 축범줄 띠(접을 수 있는 칸)와 축범끈
   el.querySelectorAll('.sl-reef').forEach(p=>{const v=+p.dataset.k?.62:.36;let s='';for(let u=0;u<=8;u++)s+=(u?' L':'M')+P(u/8,v).map(f1).join(',');
    for(let u=1;u<8;u++){const q=P(u/8,v);s+=' M'+f1(q[0])+','+f1(q[1]-1)+' L'+f1(q[0]+.4)+','+f1(q[1]+1.6);}
    p.setAttribute('d',s);p.style.opacity=k.toFixed(2);});
   // 접혀 있던 돛 뭉치(펴지기 전)
   el.querySelector('.sl-furl').setAttribute('d','M-5,-50 Q-7,-35 -5,-20 L-1,-20 Q1,-35 -1,-50 Z');el.querySelector('.sl-furl').style.opacity=(1-k).toFixed(2);
   const cq=P(1,1);el.querySelector('.sl-sheet').setAttribute('d','M'+f1(cq[0])+','+f1(cq[1])+' Q'+f1((cq[0]-44)/2)+','+f1(-12)+' -44,-10');el.querySelector('.sl-sheet').style.opacity=k.toFixed(2);
   // 돛대 끝 깃발: 바람 방향 따라 뒤집힘
   const pw=w*10,fl=Math.sin(t*9)*1.4;el.querySelector('.sl-pen').setAttribute('d','M-3,-53 L'+f1(-3+pw*1.6)+','+f1(-51.4+fl)+' L-3,-49.6 Z');
   // 바람 자국: 수면을 스치는 잔물결 무리가 제각기 다른 방향으로
   el.querySelectorAll('.wd-paws ellipse').forEach((e,i)=>{
    const per=5+i%3,ph=((t+i*1.3)/per)%1,cyc=Math.floor((t+i*1.3)/per),dir=R(cyc*7+i)<.5?-1:1,x0=150+R(cyc*3+i)*500,x=x0+dir*ph*140,y=surf(x,t,a)+6+R(cyc+i*5)*40;
    e.setAttribute('cx',f1(x));e.setAttribute('cy',f1(y));e.setAttribute('rx',f1(40+R(i)*30));e.setAttribute('ry',f1(4+R(i+3)*4));
    e.setAttribute('fill','url(#wdPaw)');e.setAttribute('mask','url(#wdMask)');e.style.opacity=(Math.sin(Math.PI*ph)*.8).toFixed(3);
   });
  }
 };

 /* ───────── 21-12 · 파도 호수 ─────────
    「사방이 온통 벽청빛 파도로 일렁인다. 앞쪽에 유독 커다란 파도가 하나 솟아 있다. 그것은 무너지지 않는다.」
    · '커다란 파도'는 진짜 물결이 아니라 파도라고 부를 수밖에 없는 무언가다. 모양만 파도를 닮았다.
      - 주위 물은 모두 일렁이는데, 그것만은 완전히 멈춰 있다(흔들림·흐름·거품의 움직임이 없음).
      - 물이 아닌 듯한 무른 광택 없는 겉면에, 지층 같은 결이 겹겹이 모양을 따라 굳어 있다.
      - 물마루의 '거품'은 갈고리처럼 굳은 말림이고, 그 끝에서 떨어지던 물방울들은 공중에 그대로 멈춰 있다.
      - 밑동 둘레만 물결이 잦아들어 잔잔하고, 물에 비친 모습은 흔들리지 않는다.
      - 표면을 미끄러지는 희미한 빛만이 그것이 단단한 무언가라는 걸 드러낸다.
    · 주위 물: 벽청빛 잔파도가 사방에서 쉼 없이 솟았다 꺼지고 배가 크게 흔들린다. */
 THEMES[12]={
  skyTop:'#060c14',skyMid:'#13253a',skyHorizon:'#2e4f6e',moon:'#d8e8f4',
  seaTop:'#4f86a8',seaMid:'#244e6c',seaBottom:'#0a1e2e',
  crest:'#e6f4ff',swell:'#6a9ac0',hatch:'#dff0ff',boat:'#03070b',rim:'#9ab8cc',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:1.7,drift:.8
 };
 const WV={x:530,base:137};
 const WAVE_D='M150,8 C110,2 80,-40 48,-78 C30,-98 6,-108 -18,-104 C-40,-100 -56,-86 -64,-70 C-68,-62 -62,-56 -54,-60 C-48,-64 -46,-72 -38,-74 C-30,-76 -26,-66 -30,-52 C-38,-26 -70,-4 -120,8 Z';
 // 물마루의 굳은 갈고리 말림
 const CLAWS=[[-60,-66,-.4,1],[-50,-84,-.1,1.1],[-36,-96,.2,1.15],[-18,-103,.5,1.2],[2,-104,.75,1.15],[20,-99,1,1.05],[36,-90,1.25,.95]];
 function claw(x,y,r,s){const c=Math.cos(r),sn=Math.sin(r),P=(u,v)=>f1(x+(u*c-v*sn)*s)+','+f1(y+(u*sn+v*c)*s);
  return 'M'+P(-6,2)+' C'+P(-6,-6)+' '+P(2,-9)+' '+P(5,-4)+' C'+P(7,-1)+' '+P(4,2)+' '+P(1,0)+' C'+P(3,-3)+' '+P(0,-5)+' '+P(-2,-2)+' C'+P(-3,0)+' '+P(-1,3)+' '+P(-6,2)+' Z';}
 // 공중에 멈춘 물방울
 const DROPS=[[-66,-58,1.4],[-70,-44,1.1],[-64,-30,.9],[-74,-36,.8],[-58,-48,.7],[-72,-22,.7],[-60,-14,.6],[-78,-52,.6],[-52,-36,.5]];
 LAYERS[12]={
  under(th){
   const n=N();
   // 지층 같은 결: 모양을 따라 안쪽으로 겹겹이 줄어드는 띠
   let bands='';const C=[40,10],cols=['#1c4660','#235472','#1a405a','#2a5e7e','#1e4a66','#2f6886','#214e6c','#3a7898'];
   for(let k=0;k<8;k++){const f=1-k*.105;bands+='<path d="'+WAVE_D+'" fill="'+cols[k]+'" transform="translate('+f1(C[0]*(1-f))+' '+f1(C[1]*(1-f))+') scale('+f2(f)+')"/>';}
   let lines='';for(let k=1;k<9;k++){const f=1-k*.105+.02;lines+='<path d="'+WAVE_D+'" transform="translate('+f1(C[0]*(1-f))+' '+f1(C[1]*(1-f))+') scale('+f2(f)+')"/>';}
   let claws='';CLAWS.forEach(c=>{claws+='<path d="'+claw(c[0],c[1],c[2],c[3])+'"/>';});
   let drops='';DROPS.forEach(d=>{drops+='<g><ellipse cx="'+d[0]+'" cy="'+d[1]+'" rx="'+f2(d[2])+'" ry="'+f2(d[2]*1.35)+'" fill="#bcd8e8" opacity=".85"/><circle cx="'+f1(d[0]-d[2]*.35)+'" cy="'+f1(d[1]-d[2]*.5)+'" r="'+f2(d[2]*.3)+'" fill="#fff"/></g>';});
   return '<defs>'+
     '<clipPath id="wvClip"><path d="'+WAVE_D+'"/></clipPath>'+
     '<linearGradient id="wvShade" x1="1" y1="0" x2="0" y2="1"><stop stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#03101a" stop-opacity=".25"/><stop offset="1" stop-color="#03101a" stop-opacity=".6"/></linearGradient>'+
     '<linearGradient id="wvSheen" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#cfe6f4" stop-opacity="0"/><stop offset=".5" stop-color="#cfe6f4" stop-opacity=".3"/><stop offset="1" stop-color="#cfe6f4" stop-opacity="0"/></linearGradient>'+
     (n?n.pattern('wvMat','wv-mat',{size:128,cell:8,oct:3,rgb:[4,16,26],lo:.45,hi:.9,seed:52},50,50):'')+
     '<linearGradient id="wvRefF" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
     '<mask id="wvRefM" maskUnits="userSpaceOnUse" x="300" y="130" width="500" height="70"><rect x="300" y="'+(WV.base+4)+'" width="500" height="60" fill="url(#wvRefF)"/></mask>'+
     '<radialGradient id="wvCalm"><stop stop-color="#2c5e80" stop-opacity=".95"/><stop offset=".7" stop-color="#2c5e80" stop-opacity=".6"/><stop offset="1" stop-color="#2c5e80" stop-opacity="0"/></radialGradient>'+
    '</defs>'+
    // 밑동 둘레의 잔잔한 물 · 흔들리지 않는 비친 모습
    '<ellipse cx="'+(WV.x+10)+'" cy="'+(WV.base+8)+'" rx="190" ry="20" fill="url(#wvCalm)"/>'+
    '<g mask="url(#wvRefM)"><g transform="translate('+WV.x+' '+(WV.base+16)+') scale(1 -.7)" opacity=".5">'+bands+'</g></g>'+
    '<g class="wv" transform="translate('+WV.x+' '+WV.base+')">'+
     '<g clip-path="url(#wvClip)">'+bands+(n?'<rect x="-140" y="-120" width="300" height="140" fill="url(#wvMat)" opacity=".5"/>':'')+
      '<g class="wv-lines" fill="none">'+lines+'</g>'+
      '<path d="'+WAVE_D+'" fill="url(#wvShade)"/>'+
      '<rect class="wv-sheen" x="-60" y="-120" width="60" height="150" fill="url(#wvSheen)" transform="skewX(-25)"/></g>'+
     '<path class="wv-rim" d="M-64,-70 C-56,-86 -40,-100 -18,-104 C6,-108 30,-98 48,-78" fill="none"/>'+
     '<g class="wv-claws">'+claws+'</g><g class="wv-drops">'+drops+'</g>'+
    '</g>';
  },
  surface(th){let s='';for(let i=0;i<4;i++)s+='<path class="wc-f" data-i="'+i+'"/><path class="wc-l" data-i="'+i+'"/>';return '<defs><linearGradient id="wcFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#9ccbe4" stop-opacity=".55"/><stop offset="1" stop-color="#2a5a7a" stop-opacity="0"/></linearGradient></defs><g class="wv-chop">'+s+'</g>';},
  paint(el,c){
   const {t,a,surf}=c;
   // 그것: 모양은 완전히 멈춰 있고, 희미한 빛만 겉면을 아주 느리게 미끄러짐
   const sh=el.querySelector('.wv-sheen');sh.setAttribute('x',f1(-170+((t*9)%300)));
   // 사방의 잔파도: 솟았다 꺼짐. 그것의 밑동 둘레에서만 잦아든다
   for(let i=0;i<4;i++){
    const y0=8+i*13,h=2.6+i*1.1;let d='',bot='';
    for(let x=-20;x<=820;x+=5){const calm=1-Math.exp(-Math.pow((x-WV.x-10)/(110+i*20),2))*(1-i*.15),ph=x*(.09-i*.012)-t*(1.6+i*.3)+i*2,pk=Math.pow(Math.abs(Math.sin(ph)),2.4)*h*calm,y=surf(x,t,a)+y0-pk;d+=(d?' L':'M')+x+','+f1(y);bot=' L'+x+','+f1(surf(x,t,a)+y0+3+i)+bot;}
    const F=el.querySelector('.wc-f[data-i="'+i+'"]'),L=el.querySelector('.wc-l[data-i="'+i+'"]');
    F.setAttribute('d',d+bot+'Z');F.style.opacity=(.75-i*.12).toFixed(3);L.setAttribute('d',d);L.style.opacity=(.55-i*.1).toFixed(3);
   }
  }
 };

 /* ───────── 21-13 · 떠다니는 호수 ─────────
    「나뭇가지와 나뭇잎이 수면을 온통 덮었다. 끝이 갈라진 가지 하나가 뱃전을 스치며 뒤로 흘러간다.」
    · 수면: 크기·모양·빛이 다른 나뭇잎과 잔가지가 물을 거의 다 덮고, 배 반대쪽(뒤)으로 천천히 떠간다.
    · 끝이 갈라진 가지: 배 앞에서 떠와 뱃전을 스치며 뒤로 흘러가 사라진다. */
 THEMES[13]={
  skyTop:'#0a0d08',skyMid:'#1e261a',skyHorizon:'#4a5a40',moon:'#e0e8c8',
  seaTop:'#5a6a48',seaMid:'#34402a',seaBottom:'#141a10',
  crest:'#c8d4a8',swell:'#6a7a54',hatch:'#d8e4c0',boat:'#070906',rim:'#a8b490',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.8,drift:.6
 };
 const LEAF=[
  'M0,-2.6 C3.6,-3.2 7.6,-1.6 10,0 C7.6,1.6 3.6,3.2 0,2.6 C-1.4,1.2 -1.4,-1.2 0,-2.6 Z',
  'M0,-4 C3.6,-4.4 6.6,-2 6.8,0 C6.6,2 3.6,4.4 0,4 C-2,2.6 -2,-2.6 0,-4 Z',
  'M0,0 L2.4,-4.8 L3.6,-2 L7,-4.2 L6.4,-.8 L9.6,0 L6.4,.8 L7,4.2 L3.6,2 L2.4,4.8 Z',
  'M0,-1.6 C4,-2.6 10,-2 14,0 C10,2 4,2.6 0,1.6 C-.8,.6 -.8,-.6 0,-1.6 Z'];
 const LC=['#7a8a3a','#9aa448','#c8a040','#8a5a28','#5a6a2a','#b07a30','#6a7a40'];
 function leafStrip(seed,count,y0,y1,s0,s1){
  let s='';
  for(let rep=0;rep<2;rep++)for(let i=0;i<count;i++){
   const x=R(seed+i)*800+rep*800,y=y0+R(seed+i+500)*(y1-y0),u=(y-y0)/(y1-y0||1),sc=s0+(s1-s0)*u,k=Math.floor(R(seed+i+900)*LEAF.length),col=LC[Math.floor(R(seed+i+300)*LC.length)],r=R(seed+i+700)*360;
   if(R(seed+i+1100)<.12)s+='<path d="M'+f1(x)+','+f1(y)+' l'+f1(14*sc)+','+f1(-2*sc)+' m'+f1(-6*sc)+','+f1(1*sc)+' l'+f1(4*sc)+','+f1(-3*sc)+'" stroke="#4a3418" stroke-width="'+f2(.9*sc)+'" fill="none" stroke-linecap="round"/>';
   else s+='<g transform="translate('+f1(x)+' '+f1(y)+') scale('+f2(sc*1.25)+' '+f2(sc*.5)+') rotate('+f1(r)+')"><path d="'+LEAF[k]+'" fill="'+col+'"/><path d="M0,0 L'+(k===3?13:k===2?9:k===1?6:9)+',0" stroke="#2a2a10" stroke-width=".35" opacity=".55"/></g>';
  }
  return s;
 }
 const FORK='<g class="fk-br"><path d="M-46,0 C-30,-1.6 -10,-1.2 6,-.4 C14,-.2 20,-1 26,-3.4 L44,-10 M20,-.6 C28,0 36,2 46,6" stroke="#4a3018" stroke-width="2.6" fill="none" stroke-linecap="round"/>'+
  '<path d="M-46,0 C-30,-1.6 -10,-1.2 6,-.4" stroke="#8a6438" stroke-width=".8" fill="none" opacity=".7"/>'+
  '<path d="M-20,-1 L-26,-7 M-6,-.8 L-2,-6" stroke="#4a3018" stroke-width="1.2" stroke-linecap="round"/>'+
  '<g transform="translate(-26 -7) rotate(-120) scale(.8 .45)"><path d="'+LEAF[0]+'" fill="#8a9a40"/></g><g transform="translate(-2 -6) rotate(-60) scale(.8 .45)"><path d="'+LEAF[0]+'" fill="#a0a848"/></g>'+
  '<g transform="translate(40 -8) rotate(-30) scale(.7 .4)"><path d="'+LEAF[1]+'" fill="#c8a040"/></g></g>';
 LAYERS[13]={
  sky(th){
   return '<defs><linearGradient id="lvFar" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3a4630"/><stop offset="1" stop-color="#4c5a3c"/></linearGradient></defs>'+
    '<rect x="0" y="117" width="800" height="22" fill="url(#lvFar)"/>'+
    '<g class="lv-s" data-k="0">'+leafStrip(11,190,118,134,.4,.65)+'</g>';
  },
  under(th){const n=N();return '<defs>'+(n?n.pattern('lvMat','lv-mat',{size:256,cell:9,oct:3,rgb:[70,60,28],lo:.4,hi:.8,stretch:[2,1],seed:91},120,40):'')+'</defs>'+(n?'<g class="lv-m"><rect x="0" y="126" width="1600" height="80" fill="url(#lvMat)" opacity=".75" clip-path="url(#lfxBelow)"/></g>':'')+'<g class="lv-s" data-k="1">'+leafStrip(37,170,134,160,.7,1.1)+'</g>';},
  surface(th){return '<g class="lv-s" data-k="2">'+leafStrip(71,90,160,204,1,1.6)+'</g><g class="lv-fork">'+FORK+'</g>';},
  paint(el,c){
   const {t,a,surf}=c;
   const V=[4,7,11];
   const lm=el.querySelector('.lv-m');if(lm)lm.setAttribute('transform','translate('+f1(-((t*7)%120))+' 0)');
   el.querySelectorAll('.lv-s').forEach(g=>{const k=+g.dataset.k,o=(t*V[k])%800;g.setAttribute('transform','translate('+f1(-o)+' '+f1(Math.sin(t*1.1+k)*(k+.5)*.8+(k===1?Math.sin(t*.6)*1:0))+')');});
   // 끝이 갈라진 가지: 배 앞에서 떠와 뱃전을 스치고 뒤로
   const k=cl((t-.8)/7.5,0,1),x=c.x+170-k*400,y=surf(x,t,a)+5.5,rot=Math.sin(t*.7)*4-6+k*14;
   const f=el.querySelector('.lv-fork');f.setAttribute('transform','translate('+f1(x)+' '+f1(y)+') rotate('+f1(rot)+') scale(.9)');f.style.opacity=(k<=0||k>=1?0:Math.min(1,k*8,(1-k)*6)).toFixed(3);
  }
 };

 /* ───────── 21-14 · 옥빛 호수 ─────────
    「물이 옥빛으로 일렁인다. 물 가운데에 문 하나가 덩그러니 놓여 있다. 안쪽에서 어떤 소리가 들려온다.」
    (소리는 그리지 않는다)
    · 물: 옥빛. 우윳빛이 살짝 도는 청록에 옥돌 같은 결이 비친다.
    · 문: 물 한가운데에 문틀째 덩그러니 서 있는 나무 문 하나. 널판·띠장·쇠 경첩·고리 손잡이·열쇠 구멍,
      문틀의 두께, 물에 잠긴 문턱 둘레로 이는 잔물결, 물에 비친 문. */
 THEMES[14]={
  skyTop:'#05090a',skyMid:'#0f1e1e',skyHorizon:'#2a4a46',moon:'#e0f0e8',
  seaTop:'#8cc8b2',seaMid:'#4c8c7c',seaBottom:'#16352f',
  crest:'#eafff4',swell:'#78b8a0',hatch:'#e0fff0',boat:'#040807',rim:'#a8d0c0',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.9,drift:.7
 };
 const DOOR={x:508,y:140,s:1};
 function doorMarkup(){
  let planks='';for(let i=0;i<5;i++)planks+='<path d="M'+f1(-13+i*5.2)+',-58 L'+f1(-13+i*5.2)+',-1" stroke="#3a2210" stroke-width=".5" opacity=".7"/>';
  let grain='';for(let i=0;i<10;i++){const x=-12+R(i)*24;grain+='<path d="M'+f1(x)+','+f1(-56+R(i+20)*10)+' q'+f1(R(i+40)*2-1)+','+f1(14+R(i+60)*20)+' 0,'+f1(30+R(i+80)*14)+'" stroke="#2a1608" stroke-width=".3" fill="none" opacity=".45"/>';}
  return '<path d="M-17,-62 L19,-62 L21,-60 L21,0 L-17,0 Z" fill="#2a1a0c"/>'+                                   // 문틀 뒤 두께
   '<path d="M-17,-62 L17,-62 L17,0 L-17,0 Z" fill="url(#drFrame)"/>'+
   '<path d="M-14,-59 L14,-59 L14,0 L-14,0 Z" fill="url(#drWood)"/>'+planks+grain+
   '<path d="M-14,-46 L14,-46 M-14,-14 L14,-14 M-14,-14 L14,-46" stroke="#4a2c14" stroke-width="2.6"/>'+                // 띠장·버팀목
   '<path d="M-14,-46 L14,-46 M-14,-14 L14,-14" stroke="#9a6a3a" stroke-width=".6" opacity=".6" transform="translate(0 -1)"/>'+
   '<rect x="-15" y="-50" width="7" height="2.4" rx=".6" fill="#3a3a3a"/><rect x="-15" y="-18" width="7" height="2.4" rx=".6" fill="#3a3a3a"/>'+   // 쇠 경첩
   '<circle cx="-12" cy="-48.8" r=".5" fill="#8a8a8a"/><circle cx="-12" cy="-16.8" r=".5" fill="#8a8a8a"/>'+
   '<circle cx="9" cy="-30" r="2.2" fill="#2a2a2a"/><circle class="dr-ring" cx="9" cy="-26.4" r="3" fill="none" stroke="#b89a5a" stroke-width="1.1"/>'+   // 고리 손잡이
   '<path d="M9,-24 L9,-21.6" stroke="#1a1a1a" stroke-width="1"/><path d="M8.6,-21 a.6,.6 0 1 1 .8,0 L9.5,-19.2 L8.5,-19.2 Z" fill="#0a0a0a"/>'+
   '<path d="M-17,-62 L17,-62 L17,0" fill="none" stroke="#c8a070" stroke-width=".6" opacity=".45"/>';
 }
 LAYERS[14]={
  under(th){
   const n=N();let rp='';for(let i=0;i<4;i++)rp+='<ellipse/>';let lap='';for(let i=0;i<3;i++)lap+='<path/>';
   return '<defs>'+
     '<linearGradient id="drWood" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#6a4020"/><stop offset=".5" stop-color="#8a5a30"/><stop offset="1" stop-color="#5a3418"/></linearGradient>'+
     '<linearGradient id="drFrame" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#4a2c14"/><stop offset=".5" stop-color="#6a4224"/><stop offset="1" stop-color="#3a220e"/></linearGradient>'+
     (n?n.pattern('jdVein','jd-vein',{size:256,cell:60,oct:4,rgb:[230,255,244],lo:.62,hi:.9,stretch:[3,1],seed:77},400,80):'')+
     '<linearGradient id="drFade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
     '<mask id="drRefM" maskUnits="userSpaceOnUse" x="0" y="130" width="800" height="70"><rect x="0" y="'+DOOR.y+'" width="800" height="62" fill="url(#drFade)"/></mask>'+
    '</defs>'+
    (n?'<g class="jd-v"><rect x="0" y="128" width="1600" height="80" fill="url(#jdVein)" opacity=".4" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g class="dr-ref" mask="url(#drRefM)"><g class="dr-refin">'+doorMarkup()+'</g></g>'+
    '<g class="dr" transform="translate('+DOOR.x+' '+DOOR.y+')">'+doorMarkup()+'</g>'+
    '<g class="dr-rp">'+rp+'</g><g class="dr-lap">'+lap+'</g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const v=el.querySelector('.jd-v');if(v)v.setAttribute('transform','translate('+f1(-((t*5)%400))+' 0)');
   const wy=surf(DOOR.x,t,a),dy=wy+8-DOOR.y;      // 문턱이 물에 조금 잠기도록 수면 따라 아주 살짝 들썩
   el.querySelector('.dr').setAttribute('transform','translate('+DOOR.x+' '+f1(DOOR.y+dy*.35)+')');
   el.querySelector('.dr-refin').setAttribute('transform','translate('+f1(DOOR.x+Math.sin(t*1.7)*.8)+' '+f1(DOOR.y+dy*.35+1)+') scale(1 -.8) skewX('+f1(Math.sin(t*1.3)*2)+')');
   el.querySelectorAll('.dr-rp ellipse').forEach((e,i)=>{const ph=((t*.3+i/4)%1),r=20+ph*70;e.setAttribute('cx',DOOR.x);e.setAttribute('cy',f1(DOOR.y+dy*.35+1));e.setAttribute('rx',f1(r));e.setAttribute('ry',f1(r*.14));e.style.opacity=((1-ph)*.5).toFixed(3);});
   el.querySelectorAll('.dr-lap path').forEach((p,i)=>{const y=DOOR.y+dy*.35-.5+i*.8;let d='';for(let s=0;s<=8;s++){const x=DOOR.x-20+s*5;d+=(s?' L':'M')+x+','+f1(y+Math.sin(s*1.3+t*(2+i)+i)*.8);}p.setAttribute('d',d);p.style.opacity=(.7-i*.2).toFixed(2);});
  }
 };

 /* ───────── 21-15 · 물거품 호수 ─────────
    「배 왼쪽의 물은 앞으로, 오른쪽의 물은 뒤로 흐른다. 두 물이 맞닿은 곳에 물거품이 길게 늘어서 있다.」
    · 배는 오른쪽을 보고 있으므로, 배 왼쪽 = 화면 안쪽(먼 물), 배 오른쪽 = 화면 바깥쪽(가까운 물).
    · 먼 물은 앞(오른쪽)으로, 가까운 물은 뒤(왼쪽)로 흐른다. 물결 결과 떠가는 물보라 조각이 서로 반대로 흐른다.
    · 두 물이 맞닿은 선(배 바로 밑을 지나는 선)에 크고 작은 물거품이 길게 늘어서 일렁이고, 작은 거품은 터졌다 다시 생긴다. */
 THEMES[15]={
  skyTop:'#05090b',skyMid:'#0f2024',skyHorizon:'#2c5258',moon:'#e0f4f4',
  seaTop:'#6aa2a8',seaMid:'#356a70',seaBottom:'#0e2a2e',
  crest:'#e8fbfb',swell:'#7ab4b8',hatch:'#e0ffff',boat:'#030708',rim:'#a8d4d4',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.9,drift:.4
 };
 const SEAM=146;
 LAYERS[15]={
  sky(th){return '<defs><linearGradient id="bbFar" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2c5a60"/><stop offset="1" stop-color="#4a8a90"/></linearGradient></defs><rect x="0" y="117" width="800" height="24" fill="url(#bbFar)"/>';},
  under(th){
   let fl='',fx='',b='';for(let i=0;i<10;i++)fl+='<path data-i="'+i+'"/>';for(let i=0;i<40;i++)fx+='<ellipse data-i="'+i+'"/>';
   for(let i=0;i<90;i++)b+='<g class="bb" data-i="'+i+'"><circle class="bb-b"/><path class="bb-h"/></g>';
   return '<defs><radialGradient id="bbFill" cx=".4" cy=".35" r=".7"><stop stop-color="#ffffff" stop-opacity=".55"/><stop offset=".6" stop-color="#d8f4f4" stop-opacity=".22"/><stop offset="1" stop-color="#bfe8ec" stop-opacity=".5"/></radialGradient>'+
    '<linearGradient id="bbSeam" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e8ffff" stop-opacity="0"/><stop offset=".5" stop-color="#e8ffff" stop-opacity=".28"/><stop offset="1" stop-color="#e8ffff" stop-opacity="0"/></linearGradient></defs>'+
    '<g class="bb-flow">'+fl+'</g><g class="bb-fx">'+fx+'</g>'+
    '<path class="bb-seam" fill="url(#bbSeam)"/>'+
    '<g class="bb-foam">'+b+'</g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const seamY=x=>Math.max(surf(x,t,a)+8,SEAM+Math.sin(x*.013+t*.3)*2.2);
   // 흐름 결: 먼 물(위)은 오른쪽으로, 가까운 물(아래)은 왼쪽으로
   el.querySelectorAll('.bb-flow path').forEach(p=>{
    const i=+p.dataset.i,far=i<4,lane=far?i:i-4,dir=far?1:-1,y0=far?122+lane*5:SEAM+8+lane*8,sp=(far?16:22)+lane*3;
    let d='';const off=((t*sp)%60);
    for(let x=-60;x<=860;x+=60){const xs=x+dir*off;d+='M'+f1(xs)+','+f1((far?y0:Math.max(y0,surf(xs,t,a)+4)))+' q'+f1(dir*12)+','+f1(-1.4)+' '+f1(dir*26)+',0 ';}
    p.setAttribute('d',d);p.style.opacity=(far?.3:.38-lane*.04).toFixed(3);
   });
   el.querySelectorAll('.bb-fx ellipse').forEach(e=>{
    const i=+e.dataset.i,far=i<16,dir=far?1:-1,sp=far?18:26,y=far?121+R(i)*16:SEAM+10+R(i)*46,x=((R(i+40)*880+dir*t*sp)%880+880)%880-40;
    e.setAttribute('cx',f1(x));e.setAttribute('cy',f1(far?y:Math.max(y,surf(x,t,a)+5)));e.setAttribute('rx',f1(1.2+R(i+7)*2.6));e.setAttribute('ry',f1(.5+R(i+9)*.6));e.style.opacity=(.35+.3*Math.sin(t*2+i)).toFixed(3);
   });
   // 맞닿은 선의 흰 띠
   let top='',bot='';for(let x=-20;x<=820;x+=20){const y=seamY(x);top+=(top?' L':'M')+x+','+f1(y-5);bot=' L'+x+','+f1(y+5)+bot;}
   el.querySelector('.bb-seam').setAttribute('d',top+bot+'Z');
   // 물거품: 맞닿은 선을 따라 길게, 서로 밀며 일렁이고 작은 것은 터졌다 다시 생김
   el.querySelectorAll('.bb').forEach(g=>{
    const i=+g.dataset.i,per=3+R(i)*5,ph=((t+R(i+3)*per)/per)%1,cyc=Math.floor((t+R(i+3)*per)/per);
    const x=(i/90)*860-30+Math.sin(t*.8+i)*3+(R(cyc*13+i)-.5)*8,y=seamY(x)+(R(i+50)-.5)*5+Math.sin(t*1.7+i*2)*.8;
    const big=R(i+70)<.25,r=(big?2.6:1)+R(i+90)*(big?2.4:1.6),pop=ph>.94?(1-ph)/.06:ph<.06?ph/.06:1;
    const b=g.firstChild,h=g.lastChild;b.setAttribute('cx',f1(x));b.setAttribute('cy',f1(y));b.setAttribute('r',f1(r*(.6+.4*pop)));
    h.setAttribute('d','M'+f1(x-r*.55)+','+f1(y-r*.2)+' A'+f1(r*.6)+','+f1(r*.6)+' 0 0 1 '+f1(x+r*.1)+','+f1(y-r*.62));
    g.style.opacity=pop.toFixed(3);
   });
  }
 };

 const css=
  '.lakefx[data-lake="11"]{background:#2a1c26;border-color:#a8788a}'+
  '.lakefx[data-lake="11"] .lfx-corner{background:linear-gradient(90deg,#2a1a24a0,transparent 22%,transparent 78%,#2a1a24a0),linear-gradient(0deg,#3a2a10aa,transparent 26%,transparent 76%,#2a1a2488)}'+
  '.lakefx[data-lake="11"] .lfx-top{color:#fff0e8}'+
  '.lakefx .sl-seam{fill:none;stroke:#b8a888;stroke-width:.35}'+
  '.lakefx .sl-reef{fill:none;stroke:#8a7858;stroke-width:.45}'+
  '.lakefx .sl-rim{fill:none;stroke:#6a5a3a;stroke-width:.5;stroke-linejoin:round}'+
  '.lakefx .sl-furl{fill:#d8ccb0;stroke:#6a5a3a;stroke-width:.4}'+
  '.lakefx .sl-sheet{fill:none;stroke:#3a3020;stroke-width:.4}'+
  '.lakefx .sl-pen{fill:#c83a3a}'+
  '.lakefx[data-lake="12"]{background:#050b12;border-color:#3e5a74}'+
  '.lakefx[data-lake="12"] .lfx-top{color:#dcecf8}'+
  '.lakefx .wv-rim{stroke:#a8d0e4;stroke-width:1.1;stroke-opacity:.45;stroke-linecap:round}'+
  '.lakefx .wv-lines path{stroke:#6aa0c0;stroke-width:.6;stroke-opacity:.35}'+
  '.lakefx .wv-claws path{fill:#9cc4d8;stroke:#d8ecf6;stroke-width:.5;stroke-opacity:.6}'+
  '.lakefx .wc-f{fill:url(#wcFill)}.lakefx .wc-l{fill:none;stroke:#e4f4ff;stroke-width:.7;stroke-linejoin:round}'+
  '.lakefx[data-lake="13"]{background:#0a0d08;border-color:#5a6a48}'+
  '.lakefx[data-lake="13"] .lfx-top{color:#e8f0d0}'+
  '.lakefx[data-lake="13"] .lfx-crest,.lakefx[data-lake="13"] .lfx-ripples{opacity:.35}'+
  '.lakefx[data-lake="14"]{background:#060c0b;border-color:#4a7a6a}'+
  '.lakefx[data-lake="14"] .lfx-top{color:#e0f4ea}'+
  '.lakefx .dr-rp ellipse{fill:none;stroke:#e0fff0;stroke-width:.8}'+
  '.lakefx .dr-lap path{fill:none;stroke:#f0fff8;stroke-width:.9;stroke-linecap:round}'+
  '.lakefx[data-lake="15"]{background:#050b0c;border-color:#4a7a80}'+
  '.lakefx[data-lake="15"] .lfx-top{color:#e0f8f8}'+
  '.lakefx .bb-flow path{fill:none;stroke:#d8f8f8;stroke-width:1;stroke-linecap:round}'+
  '.lakefx .bb-fx ellipse{fill:#e8ffff}'+
  '.lakefx .bb-b{fill:url(#bbFill);stroke:#f4ffff;stroke-width:.35;stroke-opacity:.8}'+
  '.lakefx .bb-h{fill:none;stroke:#ffffff;stroke-width:.4;stroke-linecap:round}';
 const st=document.createElement('style');st.id='lake-themes-v025d';st.textContent=css;document.head.appendChild(st);
 if(typeof state!=='undefined'&&state.scene==='event'&&typeof render==='function')render();
})();
