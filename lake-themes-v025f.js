/* Great Lake v0.2.5 · 호수별 진입 장면 테마 (21-21 ~ 21-25)
   진입 묘사에서 구체적인 것만 그린다(소리처럼 보이지 않는 것은 그리지 않음).
   배가 도착한 뒤에야 있어야 할 것은 도착한 뒤에 나타낸다. */
(function(){
 'use strict';
 const FX=window.GREAT_LAKE_FX;if(!FX||!FX.themes||!FX.layers)return;
 const THEMES=FX.themes,LAYERS=FX.layers,N=()=>window.FxNoise;
 const f1=n=>n.toFixed(1),f2=n=>n.toFixed(2),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sm=k=>{k=cl(k,0,1);return k*k*(3-2*k);};
 const R=(n)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 const boatTf=c=>'translate('+f2(c.x)+' '+f2(c.y)+') rotate('+f2(c.roll)+') scale('+c.s+')';
 const arrived=c=>{const A=FX.ENTER_SECONDS||8;return c.t<A?-1:c.t-A;};
 const HULL='M-50,-11 L-44,-8 L38,-8 Q47,-9 55,-17 L52,-9 Q47,3 33,6 L-34,6 Q-46,4 -50,-11 Z';

 /* ───────── 21-21 · 그림자 호수 ─────────
    「물 위에 배 그림자가 또렷하다. 그림자 속에 사람 그림자들이 나란히 앉아 있다.」
    · 높이 뜬 흐린 달빛에 배 그림자가 물 위에 또렷하게 눕는다(일렁이는 물 그림이 아니라 테두리가 선명한 그림자).
    · 그림자 속에는 배 위에 없는 사람 그림자들이 나란히 앉아 있다. 배 위의 선원은 서 있지만, 그림자 속 사람들은 앉아 있다.
    · 그림자는 배를 그대로 따라 움직인다. */
 THEMES[21]={
  skyTop:'#06090b',skyMid:'#141d21',skyHorizon:'#33454c',moon:'#e6eef0',
  seaTop:'#6a7e86',seaMid:'#3e5056',seaBottom:'#141c20',
  crest:'#dbe8ec',swell:'#7a9098',hatch:'#e4f0f2',boat:'#050708',rim:'#a8bcc2',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.85,drift:.7
 };
 function seated(x){   // 앉은 사람 그림자(배 기준, 원점은 엉덩이): 굽은 등 · 어깨 · 목 · 머리 · 접은 무릎
  return 'M'+f1(x-2.8)+',0 C'+f1(x-3.4)+',-3 '+f1(x-3.2)+',-6.6 '+f1(x-2.2)+',-8.4 Q'+f1(x-1.2)+',-9.6 '+f1(x+.4)+',-9.4 L'+f1(x+.6)+',-10.2 '+
   'C'+f1(x-1.6)+',-10.6 '+f1(x-1.8)+',-13.8 '+f1(x+.4)+',-14 C'+f1(x+2.6)+',-14 '+f1(x+2.8)+',-10.8 '+f1(x+1.2)+',-10.2 L'+f1(x+1.4)+',-9.4 '+
   'Q'+f1(x+2.8)+',-9 '+f1(x+3)+',-7 L'+f1(x+3.2)+',-3.4 L'+f1(x+5.6)+',-4.2 L'+f1(x+6.2)+',-.4 L'+f1(x+5.2)+',0 Z';
 }
 const SEAT=[-36,-26,-16,10,20];
 LAYERS[21]={
  sky(th){return '<defs><radialGradient id="sdMoon"><stop stop-color="#f4f8f8" stop-opacity=".95"/><stop offset=".25" stop-color="#e6eef0" stop-opacity=".25"/><stop offset="1" stop-color="#e6eef0" stop-opacity="0"/></radialGradient></defs>'+
   '<circle cx="470" cy="18" r="70" fill="url(#sdMoon)"/><circle cx="470" cy="18" r="7.5" fill="#f6fafa"/>';},
  under(th){
   let fig='';SEAT.forEach(x=>fig+='<path d="'+seated(x)+'" transform="translate(0 -8) scale(1.12)"/>');
   return '<defs><linearGradient id="sdShadow" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0b1215" stop-opacity=".92"/><stop offset="1" stop-color="#0b1215" stop-opacity=".7"/></linearGradient></defs>'+
    '<g class="sd-g"><g class="sd-shadow" fill="url(#sdShadow)">'+
     '<path d="'+HULL+'"/><path d="M-3,-17 L-3,-53 L-1.4,-53 L-1.4,-17 Z"/><rect x="-14" y="-17" width="22" height="9"/>'+
     '<path d="M45,-8 L45,-25 L52,-25 L52,-21 L50.4,-21 L50.4,-23.4 L46.6,-23.4 L46.6,-8 Z"/>'+fig+'</g>'+
     '<path class="sd-rim" d="'+HULL+'"/></g>'+
    '<g class="sd-lap"><path/><path/><path/></g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   // 그림자: 배 바로 앞(보는 쪽) 수면에 눕혀 비친 모양. 물결 따라 아주 살짝만 일그러짐(또렷함 유지)
   const sy=surf(c.x,t,a)+3,sk=Math.sin(t*.7)*2;
   el.querySelector('.sd-g').setAttribute('transform','translate('+f2(c.x+4)+' '+f2(sy+1)+') rotate('+f2(-c.roll*.6)+') skewX('+f2(-9+sk*.5)+') scale('+f2(c.s*1.04)+' '+f2(-c.s*.86)+')');
   el.querySelectorAll('.sd-lap path').forEach((p,i)=>{let d='';const y0=sy+2+i*5;for(let x=c.x-60;x<=c.x+70;x+=6)d+=(d?' L':'M')+f1(x)+','+f1(y0+Math.sin(x*.12+t*1.4+i)*.5);p.setAttribute('d',d);p.style.opacity=(.22-i*.05).toFixed(2);});
  }
 };

 /* ───────── 21-22 · 세 갈래 호수 ─────────
    「물이 한 빛이 아니다. 세 가지 물이 기름처럼 섞이지 않고 나란히 흐른다. 배가 지나간 자리만 잠깐 다른 빛이 된다.」
    · 물: 빛이 다른 세 줄기의 물(먼 줄기 · 가운데 · 가까운 줄기)이 나란히 흐른다. 경계는 기름처럼 번들거리며 서로 밀어낼 뿐 섞이지 않는다.
    · 배가 지나간 자리(뱃자국)만 잠깐 다른 빛으로 물들었다가 원래 빛으로 돌아간다. */
 THEMES[22]={
  skyTop:'#08060a',skyMid:'#1c1622',skyHorizon:'#4a3c52',moon:'#f0e4f4',
  seaTop:'#9a7ea0',seaMid:'#5a4462',seaBottom:'#1c1220',
  crest:'#f4e8f6',swell:'#b294b8',hatch:'#fff0ff',boat:'#070508',rim:'#c8b0cc',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.9,drift:.8
 };
 const TRI=[{c:['#c87a8a','#8a3a50'],y0:0,y1:.3},{c:['#7aa8c8','#2e5a7e'],y0:.3,y1:.62},{c:['#c8b46a','#7a6a24'],y0:.62,y1:1.05}];
 LAYERS[22]={
  under(th){
   const n=N();let g='';
   TRI.forEach((b,i)=>{g+='<linearGradient id="tr'+i+'" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+b.c[0]+'"/><stop offset="1" stop-color="'+b.c[1]+'"/></linearGradient>';});
   let bands='';TRI.forEach((b,i)=>bands+='<path class="tr-b" data-i="'+i+'" fill="url(#tr'+i+')"/>');
   let edges='';for(let i=0;i<2;i++)edges+='<path class="tr-e" data-i="'+i+'"/><path class="tr-e2" data-i="'+i+'"/>';
   let sw='';for(let i=0;i<12;i++)sw+='<path/>';
   return '<defs>'+g+'<linearGradient id="trWake" x1="1" y1="0" x2="0" y2="0"><stop stop-color="#e8f4c8" stop-opacity=".85"/><stop offset=".5" stop-color="#a8e0a0" stop-opacity=".45"/><stop offset="1" stop-color="#a8e0a0" stop-opacity="0"/></linearGradient>'+
     (n?n.pattern('trOil','tr-oil',{size:256,cell:30,oct:3,rgb:[255,255,255],lo:.6,hi:.95,stretch:[3,1],seed:71},240,60):'')+'</defs>'+
    '<g class="tr-bands" clip-path="url(#lfxBelow)">'+bands+(n?'<g class="tr-o"><rect x="0" y="126" width="1200" height="80" fill="url(#trOil)" opacity=".18"/></g>':'')+'</g>'+
    '<g class="tr-edges">'+edges+'</g><g class="tr-swirl">'+sw+'</g>'+
    '<path class="tr-wake" fill="url(#trWake)"/>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   // 세 줄기: 수면부터 아래로 나란히. 경계선은 천천히 물결치며 서로 밀어냄
   const edgeY=(k,x)=>{const s=surf(x,t,a),H=200-s;return s+H*TRI[k].y1+Math.sin(x*.016+t*.5+k*2)*3+Math.sin(x*.05-t*.9+k)*1.2;};
   el.querySelectorAll('.tr-b').forEach(p=>{const i=+p.dataset.i;let top='',bot='';
    for(let x=-20;x<=820;x+=20){const yt=i===0?surf(x,t,a):edgeY(i-1,x),yb=i===2?205:edgeY(i,x);top+=(top?' L':'M')+x+','+f1(yt);bot=' L'+x+','+f1(yb+1)+bot;}
    p.setAttribute('d',top+bot+'Z');});
   el.querySelectorAll('.tr-e,.tr-e2').forEach(p=>{const i=+p.dataset.i,off=p.classList.contains('tr-e2')?1.6:0;let d='';for(let x=-20;x<=820;x+=10)d+=(d?' L':'M')+x+','+f1(edgeY(i,x)+off);p.setAttribute('d',d);});
   const o=el.querySelector('.tr-o');if(o)o.setAttribute('transform','translate('+f1(-((t*10)%240))+' 0)');
   // 기름 같은 경계의 소용돌이: 경계에서 말렸다 풀림(섞이지 않음)
   el.querySelectorAll('.tr-swirl path').forEach((p,i)=>{const k=i%2,per=4+(i%3),ph=((t+i*.9)/per)%1,cyc=Math.floor((t+i*.9)/per),x=120+((cyc*167+i*131)%560),y=edgeY(k,x),r=3+ph*6;
    p.setAttribute('d','M'+f1(x-r)+','+f1(y)+' a'+f1(r)+','+f1(r*.35)+' 0 1,1 '+f1(r*1.6)+',0 a'+f1(r*.6)+','+f1(r*.22)+' 0 1,1 '+f1(-r*.9)+',0');p.style.opacity=(Math.sin(Math.PI*ph)*.5).toFixed(3);});
   // 뱃자국: 배가 지나간 자리만 잠깐 다른 빛(움직임이 클수록 길고 진하게, 멈추면 옅게 사라짐)
   const sp=FX._speed!=null?FX._speed:cl(1-c.enter,0,1),L=40+180*Math.min(1,sp*1.6),sx=c.x-44*c.s;
   let top='',bot='';for(let k=0;k<=10;k++){const u=k/10,x=sx-u*L,s=surf(x,t,a);top+=(k?' L':'M')+f1(x)+','+f1(s+1);bot=' L'+f1(x)+','+f1(s+3+u*10)+bot;}
   const w=el.querySelector('.tr-wake');w.setAttribute('d',top+bot+'Z');w.style.opacity=(.25+.75*Math.min(1,(1-c.enter)*2.5)).toFixed(3);
  }
 };

 /* ───────── 21-23 · 은빛 호수 ─────────
    「물이 은빛으로 얇게 떨린다. 수면에 크기가 다른 은빛 종 셋이 떠 있다. 물 밑에서 … 종이 먼저 울고 …」
    · 물: 은빛. 수면 전체가 아주 잘게 떨려 금속처럼 반짝인다.
    · 은빛 종 셋: 크기가 다른 종 셋이 배 앞 수면에 떠서 까딱인다(입을 위로 하지 않고 고리를 위로 한 채, 몸통 절반쯤 잠김).
    · 물 밑에서 우는 종소리는 보이지 않는 것이라 그리지 않는다. */
 THEMES[23]={
  skyTop:'#06080a',skyMid:'#151b22',skyHorizon:'#3c4858',moon:'#f0f6fc',
  seaTop:'#b8c6d2',seaMid:'#6e7c8a',seaBottom:'#1e2630',
  crest:'#ffffff',swell:'#a8b8c8',hatch:'#ffffff',boat:'#05070a',rim:'#c0ccd8',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.8,drift:.75
 };
 const BELLS=[[470,16,1.25],[528,8,.85],[580,21,1.05]];   // [x, 수면 아래 깊이(앞쪽일수록 큼), 크기]
 function bell(){
  return '<path d="M-9,0 C-9,-4 -7.6,-6 -7,-10 C-6.4,-15 -4,-18 0,-18 C4,-18 6.4,-15 7,-10 C7.6,-6 9,-4 9,0 Q0,2.2 -9,0 Z" fill="url(#blBody)"/>'+
   '<path d="M-9,0 Q0,2.2 9,0 L9.6,1.4 Q0,4 -9.6,1.4 Z" fill="url(#blLip)"/>'+
   '<path d="M-5.4,-14 C-6.2,-10 -6.8,-6 -7.4,-1" stroke="#ffffff" stroke-width="1.2" fill="none" opacity=".7" stroke-linecap="round"/>'+
   '<path d="M-7.6,-9 Q0,-7.4 7.6,-9" stroke="#5a6676" stroke-width=".5" fill="none" opacity=".7"/><path d="M-8.4,-4 Q0,-2.4 8.4,-4" stroke="#5a6676" stroke-width=".5" fill="none" opacity=".7"/>'+
   '<path d="M-2.2,-18 Q-2.6,-22.6 0,-22.6 Q2.6,-22.6 2.2,-18" stroke="url(#blBody)" stroke-width="1.6" fill="none"/>';
 }
 LAYERS[23]={
  under(th){
   const n=N();let b='',fl='';BELLS.forEach((B,i)=>{b+='<g class="bl" data-i="'+i+'"><ellipse class="bl-rip"/><ellipse class="bl-rip b"/><g class="bl-ref" opacity=".35"><g transform="scale(1 -.6)">'+bell()+'</g></g><g class="bl-up">'+bell()+'</g><ellipse class="bl-ring"/></g>';});
   for(let i=0;i<26;i++)fl+='<path/>';
   return '<defs><linearGradient id="blBody" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#6c7886"/><stop offset=".3" stop-color="#e8f0f8"/><stop offset=".55" stop-color="#b8c4d0"/><stop offset="1" stop-color="#55606c"/></linearGradient>'+
     '<linearGradient id="blLip" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#4a5460"/><stop offset=".4" stop-color="#d8e2ec"/><stop offset="1" stop-color="#46505c"/></linearGradient>'+
     (n?n.pattern('slTrem','sl-trem',{size:128,cell:3,oct:2,rgb:[255,255,255],lo:.62,hi:.9,stretch:[3,1],seed:19},40,16):'')+'</defs>'+
    (n?'<g class="sl-t"><rect x="0" y="126" width="840" height="80" fill="url(#slTrem)" opacity=".3" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g class="sl-flick">'+fl+'</g><g class="bls">'+b+'</g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   // 얇은 떨림: 결 무늬를 아주 잘게 흔들고, 짧은 은빛 반짝임이 빠르게 깜빡임
   const tr=el.querySelector('.sl-t');if(tr)tr.setAttribute('transform','translate('+f1(-((t*40)%40)+Math.sin(t*37)*.6)+' '+f1(Math.sin(t*29)*.4)+')');
   el.querySelectorAll('.sl-flick path').forEach((p,i)=>{const ph=((t*3+i*.37)%1),x=110+((Math.floor(t*3+i*.37)*97+i*173)%580),y=surf(x,t,a)+2+(i%6)*6,w=3+(i%4)*2;
    p.setAttribute('d','M'+f1(x-w)+','+f1(y)+' L'+f1(x+w)+','+f1(y));p.style.opacity=(Math.sin(Math.PI*ph)*.8).toFixed(3);});
   el.querySelectorAll('.bl').forEach(g=>{const i=+g.dataset.i,[x,dep,s]=BELLS[i],y=surf(x,t,a)+dep,bob=Math.sin(t*1.3+i*2)*.9,rk=Math.sin(t*.9+i)*7;
    g.querySelector('.bl-up').setAttribute('transform','translate('+x+' '+f1(y+4*s+bob)+') rotate('+f1(rk)+') scale('+s+')');
    g.querySelector('.bl-ref').setAttribute('transform','translate('+x+' '+f1(y+5*s)+') rotate('+f1(-rk)+') scale('+s+')');
    const ring=g.querySelector('.bl-ring');ring.setAttribute('cx',x);ring.setAttribute('cy',f1(y+4.4*s+bob));ring.setAttribute('rx',f1(10.5*s));ring.setAttribute('ry',f1(1.8*s));
    g.querySelectorAll('.bl-rip').forEach((r,k)=>{const ph=((t*.45+k*.5+i*.2)%1);r.setAttribute('cx',x);r.setAttribute('cy',f1(y+4.4*s));r.setAttribute('rx',f1((12+ph*30)*s));r.setAttribute('ry',f1((2+ph*4)*s));r.style.opacity=((1-ph)*.45).toFixed(3);});
   });
  }
 };

 /* ───────── 21-24 · 남빛 호수 ─────────
    「물이 밤처럼 짙은 남빛이다. 하늘과 물이 같은 빛이라 어디가 끝인지 모른다. 멀리서 노 젓는 소리가 난다. 우리 배 소리가 아니다.」
    · 하늘과 물이 같은 짙은 남빛이고 수평선이 없다(물마루 · 먼 물결도 거의 보이지 않음).
    · 별이 하늘에도, 물에도 똑같이 떠 있어 배가 남빛 허공에 뜬 것처럼 보인다(별빛은 물에서만 아주 살짝 일렁임).
    · 노 젓는 소리는 보이지 않는 것이라 그리지 않는다. */
 THEMES[24]={
  skyTop:'#0a1230',skyMid:'#111c44',skyHorizon:'#162452',moon:'#000000',
  seaTop:'#162452',seaMid:'#111c44',seaBottom:'#0a1230',
  crest:'#5a70b0',swell:'#22326a',hatch:'#22326a',boat:'#03050c',rim:'#4a5a8a',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.7,drift:.7
 };
 LAYERS[24]={
  sky(th){let s='';for(let i=0;i<70;i++){const x=R(i)*800,y=R(i+300)*132,r=.35+R(i+600)*1.1;s+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f2(r)+'" data-i="'+i+'"/>';}return '<g class="nv-stars">'+s+'</g>';},
  under(th){let s='';for(let i=0;i<70;i++){const x=R(i)*800,y=264-R(i+300)*132,r=.35+R(i+600)*1.1;if(y<134||y>205)continue;s+='<ellipse cx="'+f1(x)+'" cy="'+f1(y)+'" rx="'+f2(r*1.4)+'" ry="'+f2(r*.8)+'" data-i="'+i+'"/>';}return '<g class="nv-wstars">'+s+'</g>';},
  paint(el,c){
   const {t}=c;
   el.querySelectorAll('.nv-stars circle').forEach((e,k)=>{const i=+e.dataset.i;e.style.opacity=(.45+.55*Math.abs(Math.sin(t*(.4+R(i+9)*.8)+i))).toFixed(2);});
   el.querySelectorAll('.nv-wstars ellipse').forEach((e,k)=>{const i=+e.dataset.i;e.style.opacity=(.35+.45*Math.abs(Math.sin(t*(.4+R(i+9)*.8)+i))).toFixed(2);e.setAttribute('transform','translate('+f1(Math.sin(t*1.1+i)*1.2)+' 0)');});
  }
 };

 /* ───────── 21-25 · 금빛 호수 ─────────
    「물이 금빛으로 반짝인다. 바닥이 보이지 않는다. 발치에 동전들이 쌓여 있다.」
    · 물: 금빛 반짝임이 수면을 가득 덮지만, 그 아래는 금세 어두워져 바닥이 보이지 않는다.
    · 동전: 배가 멈춘 뒤 선원의 발치(갑판)에 동전 더미가 어느새 쌓여 있다(가장자리가 반짝임). */
 THEMES[25]={
  skyTop:'#0a0804',skyMid:'#211a0c',skyHorizon:'#5a4618',moon:'#fff2c8',
  seaTop:'#c8a648',seaMid:'#5a4614',seaBottom:'#0a0702',
  crest:'#fff4c8',swell:'#d8b850',hatch:'#fff0c0',boat:'#080603',rim:'#e0c880',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.9,drift:.8
 };
 function coins(){
  // 갑판 위 동전 더미(배 기준): 두 무더기와 흩어진 몇 닢
  let s='';const piles=[[11,6,4.4],[17.5,4,3.4]];
  piles.forEach(([x,n,w],pi)=>{for(let k=0;k<n;k++){const y=-8.6-k*1.05,dx=(R(pi*10+k)-.5)*1.2;s+='<ellipse cx="'+f1(x+dx)+'" cy="'+f1(y+.5)+'" rx="'+f1(w*.5)+'" ry=".55" fill="#7a5a14"/><ellipse cx="'+f1(x+dx)+'" cy="'+f1(y)+'" rx="'+f1(w*.5)+'" ry=".55" fill="url(#gdCoin)"/>';}});
  [[7,-8.4],[14.6,-8.3],[20.4,-8.4],[23.6,-8.3]].forEach(([x,y],i)=>s+='<ellipse cx="'+x+'" cy="'+y+'" rx="1.5" ry=".5" fill="url(#gdCoin)" transform="rotate('+(i%2?8:-6)+' '+x+' '+y+')"/>');
  return s;
 }
 LAYERS[25]={
  under(th){
   const n=N();let sp='';for(let i=0;i<46;i++)sp+='<ellipse/>';
   return '<defs><linearGradient id="gdDeep" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#000" stop-opacity="0"/><stop offset=".35" stop-color="#0a0702" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity=".95"/></linearGradient>'+
     '<radialGradient id="gdSpk"><stop stop-color="#fffbe8"/><stop offset=".35" stop-color="#ffe08a" stop-opacity=".6"/><stop offset="1" stop-color="#ffc840" stop-opacity="0"/></radialGradient>'+
     (n?n.pattern('gdGlit','gd-glit',{size:128,cell:4,oct:2,rgb:[255,240,170],lo:.7,hi:.95,stretch:[2,1],seed:91},40,20):'')+'</defs>'+
    (n?'<g class="gd-g"><rect x="0" y="126" width="840" height="24" fill="url(#gdGlit)" opacity=".55" clip-path="url(#lfxBelow)"/></g>':'')+
    '<path class="gd-deep" fill="url(#gdDeep)"/><g class="gd-spark" fill="url(#gdSpk)">'+sp+'</g>';
  },
  surface(th){
   return '<defs><linearGradient id="gdCoin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff2b0"/><stop offset=".5" stop-color="#e0b040"/><stop offset="1" stop-color="#9a7418"/></linearGradient></defs>'+
    '<g class="gd-coins">'+coins()+'<g class="gd-tw"><path d="M11,-15.4 l0,-2.4 M9.8,-16.6 l2.4,0" stroke="#fffbe8" stroke-width=".35"/><path d="M18,-13 l0,-2 M17,-14 l2,0" stroke="#fffbe8" stroke-width=".3"/></g></g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const g=el.querySelector('.gd-g');if(g)g.setAttribute('transform','translate('+f1(-((t*8)%40))+' '+f1(Math.sin(t*2)*.3)+')');
   let d='';for(let x=-20;x<=820;x+=20)d+=(d?' L':'M')+x+','+f1(surf(x,t,a)+6);el.querySelector('.gd-deep').setAttribute('d',d+' L820,200 L-20,200 Z');
   el.querySelectorAll('.gd-spark ellipse').forEach((p,i)=>{const per=.6+(i%5)*.18,ph=((t+i*.29)/per)%1,cyc=Math.floor((t+i*.29)/per),x=100+((cyc*131+i*191)%600),y=surf(x,t,a)+1+(i%5)*2.6,k=Math.sin(Math.PI*ph);
    p.setAttribute('cx',f1(x));p.setAttribute('cy',f1(y));p.setAttribute('rx',f1(1.5+k*4.5));p.setAttribute('ry',f1(.6+k*1.1));p.style.opacity=(k*.95).toFixed(3);});
   const cg=el.querySelector('.gd-coins'),ta=arrived(c);cg.setAttribute('transform',boatTf(c));cg.style.opacity=(ta<0?0:sm((ta-.3)/1.4)).toFixed(2);   // 배가 멈춘 뒤 어느새 발치에
   el.querySelector('.gd-tw').style.opacity=(Math.pow(Math.max(0,Math.sin(t*1.7)),8)).toFixed(2);
  }
 };

 const css=
  '.lakefx[data-lake="21"]{background:#070a0c;border-color:#4a5c62}.lakefx[data-lake="21"] .lfx-top{color:#dce8ec}'+
  '.lakefx[data-lake="21"] .lfx-reflection{display:none}'+
  '.lakefx .sd-rim{fill:none;stroke:#0b1215;stroke-width:1;opacity:.6}'+
  '.lakefx .sd-lap path{fill:none;stroke:#dbe8ec;stroke-width:.7}'+
  '.lakefx[data-lake="22"]{background:#0a080c;border-color:#7a6280}.lakefx[data-lake="22"] .lfx-top{color:#f4e8f6}'+
  '.lakefx .tr-e{fill:none;stroke:#fff8ff;stroke-width:1.1;stroke-opacity:.55}.lakefx .tr-e2{fill:none;stroke:#2a1a30;stroke-width:1.4;stroke-opacity:.35}'+
  '.lakefx .tr-swirl path{fill:none;stroke:#fff6ff;stroke-width:.7}'+
  '.lakefx[data-lake="23"]{background:#07090c;border-color:#7a8898}.lakefx[data-lake="23"] .lfx-top{color:#eef4fa}'+
  '.lakefx .sl-flick path{stroke:#ffffff;stroke-width:.8;stroke-linecap:round}'+
  '.lakefx .bl-ring{fill:none;stroke:#ffffff;stroke-width:.6;stroke-opacity:.6}.lakefx .bl-rip{fill:none;stroke:#e8f0f8;stroke-width:.6}'+
  '.lakefx[data-lake="24"]{background:#0a1230;border-color:#2a3a70;box-shadow:none}.lakefx[data-lake="24"] .lfx-top{color:#b8c8f0}'+
  '.lakefx[data-lake="24"] .lfx-horizon,.lakefx[data-lake="24"] .lfx-fars,.lakefx[data-lake="24"] .lfx-mist{display:none}'+
  '.lakefx[data-lake="24"] .lfx-crest{stroke-opacity:.1}.lakefx[data-lake="24"] .lfx-corner{background:linear-gradient(90deg,#060b20a0,transparent 22%,transparent 78%,#060b20a0)}'+
  '.lakefx[data-lake="24"] .lfx-vignette{box-shadow:inset 0 0 60px 10px #050a1c}'+
  '.lakefx .nv-stars circle{fill:#e8eeff}.lakefx .nv-wstars ellipse{fill:#d8e2ff}'+
  '.lakefx[data-lake="25"]{background:#0a0804;border-color:#8a7434}.lakefx[data-lake="25"] .lfx-top{color:#fff0c8}'+
  '.lakefx .gd-spark ellipse{mix-blend-mode:screen}';
 const st=document.createElement('style');st.id='lake-themes-v025f';st.textContent=css;document.head.appendChild(st);
 if(typeof state!=='undefined'&&state.scene==='event'&&typeof render==='function')render();
})();
