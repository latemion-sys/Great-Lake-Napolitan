/* Great Lake v0.2.5 · 호수별 진입 장면 테마 (21-05, 21-06, 21-08 ~ 21-10 · 21-07은 lake-themes-v025c.js)
   lake-themes-v025.js 와 같은 방식: GREAT_LAKE_FX.themes[id] / layers[id] = {sky, under, surface, paint}
   진입 묘사에서 구체적인 것만 그린다. 추상적인 느낌(냄새, 기분 등)은 따로 만들지 않는다. */
(function(){
 'use strict';
 const FX=window.GREAT_LAKE_FX;if(!FX||!FX.themes||!FX.layers)return;
 const THEMES=FX.themes,LAYERS=FX.layers,N=()=>window.FxNoise;
 const f1=n=>n.toFixed(1),f2=n=>n.toFixed(2),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sm=k=>{k=cl(k,0,1);return k*k*(3-2*k);};
 const R=(n)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 const boatTf=c=>'translate('+f2(c.x)+' '+f2(c.y)+') rotate('+f2(c.roll)+') scale('+c.s+')';

 /* ───────── 21-05 · 안개 호수 ─────────
    「물이 하얗게 흐려졌다. 안개 속 멀리 배 그림자가 몇 척 떠 있다. 어느 배가 움직이는지 모르겠다.」
    · 물: 하얗게 흐린 물. 수면 위에 안개가 낮게 깔려 흐른다.
    · 안개: 결이 있는 안개가 여러 겹, 서로 다른 빠르기로 흘러 배 그림자를 가렸다 드러냈다 한다.
    · 배 그림자: 먼 곳에 크기·모양이 다른 배 네 척(큰 배, 돛배, 작은 배, 거룻배). 안개가 흐르는 탓에
      어느 배가 실제로 움직이는지 알 수 없다(실제로는 한두 척만 아주 느리게 움직임). */
 THEMES[5]={
  skyTop:'#4f5653',skyMid:'#848b87',skyHorizon:'#bfc5c1',moon:'#e8ece8',
  seaTop:'#d5dad6',seaMid:'#b2b9b4',seaBottom:'#7e8681',
  crest:'#f4f7f4',swell:'#99a19c',hatch:'#5a625d',boat:'#1b1f1d',rim:'#5d6561',
  lamp:'#ffc865',lampCore:'#fff0c4',bob:.85,drift:.75
 };
 const SHIP={
  big:'M-64,0 L58,0 Q66,-4 70,-12 L-60,-12 Q-64,-6 -64,0 Z M-34,-12 L-34,-21 L-8,-21 L-8,-27 L18,-27 L18,-21 L28,-21 L28,-12 Z M-2,-27 L0,-40 L7,-40 L8,-27 Z M-48,-12 L-48,-50 L-46,-50 L-46,-12 Z M44,-12 L44,-44 L46,-44 L46,-12 Z M-47,-46 L-30,-12 L-31,-12 L-47,-44 Z M-20,-21 L-20,-25 L-12,-25 L-12,-21 Z',
  sail:'M-38,0 L32,0 Q40,-3 42,-9 L-36,-9 Q-39,-4 -38,0 Z M-14,-9 L-14,-62 L-12,-62 L-12,-9 Z M14,-9 L14,-54 L16,-54 L16,-9 Z M-12,-58 Q2,-48 -11,-16 Z M-15,-56 Q-30,-40 -16,-14 Z M16,-50 Q30,-40 17,-15 Z M16,-52 L40,-12 L17,-12 Z',
  small:'M-17,0 L14,0 Q19,-3 20,-7 L-16,-7 Q-18,-3 -17,0 Z M-6,-7 L-6,-13 L5,-13 L5,-7 Z M0,-13 L0,-30 L1.4,-30 L1.4,-13 Z M1.4,-28 L12,-9 L1.4,-9 Z',
  barge:'M-50,0 L46,0 L50,-7 L-50,-7 Z M-30,-7 L-30,-15 L-6,-15 L-6,-7 Z M-34,-15 L-18,-21 L-2,-15 Z M30,-7 L30,-22 L31.5,-22 L31.5,-7 Z'
 };
 // [모양, x, 밑(수면)y, 크기, 짙기, 실제 움직임(단위/초 진폭)]
 const SHIPS=[['big',214,125,.66,.8,0],['sail',516,122,.6,.7,7],['small',578,128,.8,.75,0],['barge',680,126,.6,.6,0],['sail',150,120,.42,.45,0]];
 LAYERS[5]={
  sky(th){
   const n=N();
   let sh='';SHIPS.forEach((s,i)=>{sh+='<g class="fg-ship" data-i="'+i+'"><path d="'+SHIP[s[0]]+'" fill="url(#fgShip)"/></g>';});
   return '<defs>'+
     '<linearGradient id="fgFar" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#bfc5c1"/><stop offset="1" stop-color="#cfd4d0"/></linearGradient>'+
     '<linearGradient id="fgShip" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7d8581"/><stop offset=".6" stop-color="#5f6763"/><stop offset="1" stop-color="#6f7773"/></linearGradient>'+
     '<linearGradient id="fgFade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#000"/><stop offset=".3" stop-color="#fff"/><stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>'+
     '<mask id="fgMask" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#fgFade)"/></mask>'+
     '<linearGradient id="fgBand" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d8ddd9" stop-opacity="0"/><stop offset=".5" stop-color="#e2e6e3" stop-opacity=".85"/><stop offset="1" stop-color="#d8ddd9" stop-opacity="0"/></linearGradient>'+
     (n?n.pattern('fgA','fog-a',{size:256,cell:110,oct:4,rgb:[226,231,228],lo:.3,hi:.88,stretch:[4,1],seed:11},800,150):'')+
     (n?n.pattern('fgB','fog-b',{size:256,cell:70,oct:4,rgb:[236,240,237],lo:.4,hi:.92,stretch:[3,1],seed:29},600,110):'')+
    '</defs>'+
    '<rect x="0" y="108" width="800" height="30" fill="url(#fgFar)"/>'+               // 먼 물(안개 밑)
    '<g class="fg-ships">'+sh+'</g>'+
    (n?'<g class="fg-l" data-k="0"><rect x="0" y="50" width="1600" height="110" fill="url(#fgA)" opacity=".55" mask="url(#fgMask)"/></g>':'')+
    '<rect x="0" y="108" width="800" height="26" fill="url(#fgBand)" opacity=".6"/>';
  },
  under(th){
   const n=N();
   return (n?'<g class="fg-l" data-k="1"><rect x="0" y="112" width="1200" height="90" fill="url(#fgB)" opacity=".6" mask="url(#fgMask)"/></g>':'')+
    '<g class="fg-wisps"><path/><path/><path/><path/></g>';
  },
  surface(th){
   const n=N();
   return (n?'<g class="fg-l" data-k="2"><rect x="0" y="100" width="1600" height="110" fill="url(#fgA)" opacity=".3" mask="url(#fgMask)"/></g>':'');
  },
  paint(el,c){
   const {t,a,surf}=c;
   // 안개 겹: 서로 다른 빠르기와 방향으로 흐름(배가 움직이는지 안개가 움직이는지 헷갈림)
   const SP=[[9,800],[-6,600],[14,800]];
   el.querySelectorAll('.fg-l').forEach(g=>{const k=+g.dataset.k,[v,w]=SP[k];let o=((t*v)%w+w)%w;g.setAttribute('transform','translate('+f1(-o)+' '+f1(Math.sin(t*.2+k)*2)+')');});
   // 배 그림자: 대부분 제자리, 한두 척만 아주 느리게. 안개 짙기에 따라 보였다 사라졌다
   el.querySelectorAll('.fg-ship').forEach(g=>{
    const i=+g.dataset.i,[kind,x,y,s,op,mv]=SHIPS[i];
    const dx=mv?Math.sin(t*.09+i)*mv*6:0,bob=Math.sin(t*.7+i*1.3)*.6;
    g.setAttribute('transform','translate('+f1(x+dx)+' '+f1(y+bob)+') scale('+s+') rotate('+f1(Math.sin(t*.5+i)*.8)+')');
    const fog=.55+.45*Math.sin(t*(.23+i*.05)+i*2.1);
    g.style.opacity=(op*(.45+.55*fog)*Math.min(1,t/2.5)).toFixed(3);
   });
   // 수면에 깔린 안개 자락
   el.querySelectorAll('.fg-wisps path').forEach((p,i)=>{
    const x0=((t*(6+i*2)+i*230)%1000)-200,w=160+i*40;let d='',e='';
    for(let s=0;s<=10;s++){const x=x0+s*w/10,y=surf(x,t,a)-2-Math.sin(Math.PI*s/10)*(6+i*2);d+=(s?' L':'M')+f1(x)+','+f1(y);e=' L'+f1(x)+','+f1(surf(x,t,a)+4)+e;}
    p.setAttribute('d',d+e+'Z');p.style.opacity=(.35+.15*Math.sin(t*.4+i)).toFixed(3);
   });
  }
 };

 /* ───────── 21-06 · 빛나는 호수 ─────────
    「물이 바닥까지 빛난다. 쓰던 노 하나가 없어져 있다. … 사라진 노를 대신하듯 여러 노가 떠오른다.」
    · 물: 바닥에서부터 빛이 차올라 물 전체가 밝다. 바닥의 모래 물결과 돌이 비치고, 빛 그물(물결 무늬)이 일렁이며,
      바닥에서 수면으로 빛줄기가 솟는다.
    · 노: 바닥에서 여러 노가 비스듬히 떠올라 수면에 눕는다. 노마다 날 모양·끝 칠·손잡이 천이 다르다
      (사라진 노의 생김새는 호수마다 무작위이므로 특정한 노를 그리지 않는다). 떠오를 때 작은 기포가 따른다. */
 THEMES[6]={
  skyTop:'#030a0c',skyMid:'#0a1d20',skyHorizon:'#1f5552',moon:'#c8f4ea',
  seaTop:'#6ccdbb',seaMid:'#9be4d4',seaBottom:'#e8fff8',
  crest:'#f2fffb',swell:'#5fb8a6',hatch:'#ffffff',boat:'#061210',rim:'#bff0e4',
  lamp:'#ffd27a',lampCore:'#fff4cf',bob:1,drift:.9
 };
 const BLADE={
  round:'M19,-1.6 C26,-6.4 40,-6.6 46,-1.4 Q47.4,0 46,1.4 C40,6.6 26,6.4 19,1.6 Z',
  square:'M19,-1.6 L24,-5.8 L46,-5.8 Q47,-5.8 47,-4.8 L47,4.8 Q47,5.8 46,5.8 L24,5.8 L19,1.6 Z',
  leaf:'M19,-1.6 C25,-6.6 36,-6.2 49,0 C36,6.2 25,6.6 19,1.6 Z',
  notch:'M19,-1.6 L25,-6 L47,-6 L42,0 L47,6 L25,6 L19,1.6 Z'
 };
 const TIPC=[null,'#c8323a','#1c1c1c','#f4f4ee','#e0a428'];
 const CLOTH=['#c8323a','#2d5fc0','#e8c040','#f4f4ee','#3a8a4a','#8a3ac0'];
 function oarMarkup(i){
  const kind=Object.keys(BLADE)[i%4],tip=TIPC[(i*3)%5],cloth=CLOTH[(i*5+1)%6],b=BLADE[kind];
  let wrap='';for(let k=0;k<5;k++){const x=-41+k*2.4;wrap+='<path d="M'+f1(x)+',-1.9 L'+f1(x+1.6)+',-1.9 L'+f1(x+.6)+',1.9 L'+f1(x-1)+',1.9 Z" fill="'+cloth+'"/>';}
  return '<g class="ov-oar" data-i="'+i+'">'+
   '<rect x="-46" y="-1.5" width="68" height="3" rx="1.5" fill="url(#ovWood)"/>'+
   '<path d="M-44,-.4 L18,-.6 M-30,.7 L10,.6" stroke="#6a4a2a" stroke-width=".3" opacity=".6"/>'+
   '<path d="'+b+'" fill="url(#ovWood)" stroke="#5a3c1e" stroke-width=".4"/>'+
   '<path d="M23,-2.6 C30,-3.2 38,-3 44,-1" stroke="#f0dcb0" stroke-width=".5" fill="none" opacity=".6"/>'+
   (tip?'<g clip-path="url(#ovClip'+(i%4)+')"><rect x="40" y="-8" width="12" height="16" fill="'+tip+'"/></g>':'')+
   '<rect x="-43.2" y="-2" width="12.6" height="4" rx="1" fill="'+cloth+'" opacity=".55"/>'+wrap+
   '<path d="M-42.6,2 Q-41,4.8 -38.6,3.4 M-36,2 Q-35,5.2 -33,4.4" stroke="'+cloth+'" stroke-width=".8" fill="none" stroke-linecap="round"/>'+   // 천 자락
   '<rect x="-48.4" y="-2.6" width="3.4" height="5.2" rx="1.4" fill="#7a5530"/>'+
  '</g>';
 }
 const OARS=8;
 function oarState(i,t,surf,a){
  const x=150+((i*97)%540),start=.3+i*.85,rise=6+(i%3)*1.4;
  const k=cl((t-start)/rise,0,1),e=1-Math.pow(1-k,2.2);
  const by=surf(x,t,a)+1.5,y0=194;
  const ang0=(i%2?-1:1)*(40+(i*13)%25),ang=ang0*(1-sm((k-.55)/.45))+Math.sin(t*.8+i)*(k>=1?3:1.5);
  const y=k<1?y0+(by-y0)*e:by+Math.sin(t*1.6+i)*.6,dx=k<1?Math.sin(t*.6+i)*6*(1-e):Math.sin(t*.25+i)*4+(t-start-rise)*.6;
  return {x:x+dx,y,ang,k,started:t>=start};
 }
 LAYERS[6]={
  under(th){
   let oars='',bub='',sh='',ca='';for(let i=0;i<OARS;i++)oars+=oarMarkup(i);
   for(let i=0;i<24;i++)bub+='<circle/>';for(let i=0;i<6;i++)sh+='<path/>';for(let i=0;i<9;i++)ca+='<path/>';
   let clips='';Object.keys(BLADE).forEach((k,j)=>clips+='<clipPath id="ovClip'+j+'"><path d="'+BLADE[k]+'"/></clipPath>');
   let bed='',stones='';
   for(let x=-20;x<=820;x+=10)bed+=(bed?' L':'M')+x+','+f1(186+Math.sin(x*.02)*2.4+Math.sin(x*.071)*1.2);
   for(let i=0;i<26;i++){const x=R(i)*800,y=188+R(i+40)*10,r=1.2+R(i+80)*3.4;stones+='<ellipse cx="'+f1(x)+'" cy="'+f1(y)+'" rx="'+f1(r*1.5)+'" ry="'+f1(r*.8)+'" fill="'+(R(i+9)<.5?'#4f9c8e':'#6fb8a8')+'"/><ellipse cx="'+f1(x-r*.3)+'" cy="'+f1(y-r*.3)+'" rx="'+f1(r*.6)+'" ry="'+f1(r*.25)+'" fill="#d8fff4" opacity=".55"/>';}
   let rip='';for(let k=0;k<6;k++){let d='';for(let x=-20;x<=820;x+=8)d+=(d?' L':'M')+x+','+f1(191+k*1.8+Math.sin(x*.09+k*1.3)*.9);rip+='<path d="'+d+'"/>';}
   return '<defs>'+clips+
     '<linearGradient id="ovWood" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d8b07a"/><stop offset=".5" stop-color="#b08048"/><stop offset="1" stop-color="#7a5228"/></linearGradient>'+
     '<linearGradient id="ovBed" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#bff4e6"/><stop offset="1" stop-color="#8fd6c4"/></linearGradient>'+
     '<linearGradient id="ovShaft" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#ffffff" stop-opacity=".55"/><stop offset=".6" stop-color="#e6fff8" stop-opacity=".18"/><stop offset="1" stop-color="#e6fff8" stop-opacity="0"/></linearGradient>'+
     '<linearGradient id="ovVeil" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7fd6c4" stop-opacity=".18"/><stop offset=".6" stop-color="#a8ecdd" stop-opacity=".42"/><stop offset="1" stop-color="#d8fff4" stop-opacity=".55"/></linearGradient>'+
    '</defs>'+
    '<path d="'+bed+' L820,200 L-20,200 Z" fill="url(#ovBed)"/><g class="ov-bedrip" fill="none" stroke="#e8fff8" stroke-width=".6" opacity=".55">'+rip+'</g>'+stones+
    '<g class="ov-shafts" fill="url(#ovShaft)">'+sh+'</g>'+
    '<g class="ov-oars">'+oars+'</g>'+
    '<path class="ov-veil" fill="url(#ovVeil)"/>'+
    '<g class="ov-bub">'+bub+'</g>'+
    '<g class="ov-caus">'+ca+'</g>';
  },
  surface(th){let g='';for(let i=0;i<12;i++)g+='<ellipse/>';return '<g class="ov-glint">'+g+'</g>';},
  paint(el,c){
   const {t,a,surf}=c;
   let v='';for(let x=-20;x<=820;x+=20)v+=(v?' L':'M')+x+','+f1(surf(x,t,a)+1.2);
   el.querySelector('.ov-veil').setAttribute('d',v+' L820,200 L-20,200 Z');
   // 바닥에서 솟는 빛줄기
   el.querySelectorAll('.ov-shafts path').forEach((p,i)=>{
    const x=110+i*110+Math.sin(t*.3+i)*20,w=10+(i%3)*8,sw=Math.sin(t*.5+i*1.7)*18,top=surf(x,t,a)+2;
    p.setAttribute('d','M'+f1(x-w)+',196 L'+f1(x+w)+',196 L'+f1(x+w*.5+sw)+','+f1(top)+' L'+f1(x-w*.5+sw)+','+f1(top)+' Z');
    p.style.opacity=(.5+.3*Math.sin(t*.9+i*2)).toFixed(3);
   });
   // 빛 그물: 물결이 바닥에 만드는 일렁이는 빛 무늬
   el.querySelectorAll('.ov-caus path').forEach((p,i)=>{
    let d='';const y0=150+i*5.4;
    for(let x=-20;x<=820;x+=12){const y=y0+Math.sin(x*.045+t*(.9+i*.07)+i*1.9)*3+Math.sin(x*.11-t*.7+i)*1.4;d+=(d?' L':'M')+x+','+f1(y);}
    p.setAttribute('d',d);p.style.opacity=(.14+.1*Math.sin(t*1.2+i)).toFixed(3);
   });
   // 노들: 바닥에서 비스듬히 떠올라 수면에 눕는다
   const bubs=el.querySelectorAll('.ov-bub circle');
   el.querySelectorAll('.ov-oar').forEach(g=>{
    const i=+g.dataset.i,S=oarState(i,t,surf,a);
    g.setAttribute('transform','translate('+f1(S.x)+' '+f1(S.y)+') rotate('+f1(S.ang)+') scale(.72)');
    g.style.opacity=S.started?Math.min(1,(t-(.3+i*.85))/.8).toFixed(3):'0';
    for(let k=0;k<3;k++){const b=bubs[i*3+k];if(!b)continue;
     if(S.k>0&&S.k<1){const ph=((t*1.6+k*.33+i*.17)%1);b.setAttribute('cx',f1(S.x+Math.sin(t*4+k)*2+(k-1)*8));b.setAttribute('cy',f1(S.y-ph*24));b.setAttribute('r',f1(.6+ph*.8));b.style.opacity=((1-ph)*.8).toFixed(3);}
     else b.style.opacity='0';}
   });
   // 수면의 반짝임
   el.querySelectorAll('.ov-glint ellipse').forEach((e,i)=>{
    const per=2+(i%4)*.6,ph=((t+i*.7)/per)%1,cyc=Math.floor((t+i*.7)/per),x=130+((cyc*173+i*211)%560);
    e.setAttribute('cx',f1(x));e.setAttribute('cy',f1(surf(x,t,a)+.6));e.setAttribute('rx',f1(3+Math.sin(Math.PI*ph)*8));e.setAttribute('ry','.9');
    e.style.opacity=(Math.sin(Math.PI*ph)*.9).toFixed(3);
   });
  }
 };

 /* ───────── 21-08 ─────────
    「물빛이 없다. 아무것도 없다. 배에 달아둔 불빛만이 희미하게 일렁인다.」
    · 아무것도 그리지 않는다: 하늘·수평선·물결·물마루·비친 그림자·안개가 모두 없다(호수 번호 표시도 남기지 않음).
    · 배에 달린 등불만 희미하게 일렁이고, 그 빛이 닿는 뱃전 둘레만 겨우 드러난다. */
 THEMES[8]={
  skyTop:'#010102',skyMid:'#020203',skyHorizon:'#030305',moon:'#000000',
  seaTop:'#020203',seaMid:'#010102',seaBottom:'#000000',
  crest:'#000000',swell:'#000000',hatch:'#000000',boat:'#030304',rim:'#2a2620',
  lamp:'#e8a040',lampCore:'#ffd890',bob:.55,drift:.5
 };
 LAYERS[8]={
  surface(th){
   return '<defs><radialGradient id="voLight"><stop stop-color="#ffcf80" stop-opacity=".28"/><stop offset=".3" stop-color="#e8a040" stop-opacity=".1"/><stop offset=".7" stop-color="#a06020" stop-opacity=".03"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>'+
    '<radialGradient id="voMask"><stop stop-color="#fff"/><stop offset=".45" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
    '<mask id="voM" maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="200"><circle class="vo-mc" r="70" fill="url(#voMask)"/></mask></defs>'+
    '<circle class="vo-light" r="90" fill="url(#voLight)"/>'+
    '<g class="vo-rim" mask="url(#voM)"><path class="vo-hull"/></g>';
  },
  paint(el,c){
   const {t,x,y,roll,s}=c,r=roll*Math.PI/180,L=[51,-18.5];
   const lx=x+s*(L[0]*Math.cos(r)-L[1]*Math.sin(r)),ly=y+s*(L[0]*Math.sin(r)+L[1]*Math.cos(r));
   const fl=.72+.12*Math.sin(t*5.3)+.08*Math.sin(t*9.7+1.3)+.06*Math.sin(t*1.7);
   const li=el.querySelector('.vo-light');li.setAttribute('cx',f1(lx));li.setAttribute('cy',f1(ly));li.setAttribute('r',f1(80+fl*14));li.style.opacity=f2(fl);
   const mc=el.querySelector('.vo-mc');mc.setAttribute('cx',f1(lx));mc.setAttribute('cy',f1(ly));mc.setAttribute('r',f1(60+fl*12));
   // 등불이 비추는 뱃전 윤곽만 희미하게
   const hull=el.querySelector('.vo-hull');
   if(!hull.getAttribute('d'))hull.setAttribute('d','M-50,-11 L-44,-8 L38,-8 Q47,-9 55,-17 L52,-9 Q47,3 33,6 L-34,6 Q-46,4 -50,-11 Z M-3,-17 L-3,-53 M45,-8 L45,-25 L51,-25 L51,-22');
   hull.setAttribute('transform','translate('+f2(x)+' '+f2(y)+') rotate('+f2(roll)+') scale('+s+')');
   hull.style.opacity=f2(.55*fl);
   el.querySelectorAll('.lfx-lampglow').forEach(g=>g.style.opacity=f2(.55*fl));
  }
 };

 /* ───────── 21-09 · 풀빛 호수 ─────────
    「물이 풀빛이다. 호수 한가운데에 암초가 솟아 길을 막고 있다. 암초 위에는 아주 커다란 청기와 백기가 서 있다.
      우리 배에도 작은 청기와 백기가 한 자루씩 놓여 있다. 두 깃발 모두 올라가 있다.」
    · 물: 풀빛(누런 기가 도는 풀색). 물마루에 마른 풀 같은 빛.
    · 암초: 배 앞 호수 한가운데에 솟아 길을 막는 바위. 거친 바위 결과 층, 틈, 밑동에서 부서지는 물보라.
    · 깃발: 암초 위 아주 커다란 청기·백기(둘 다 올라가 펄럭임), 우리 배 고물에 작은 청기·백기(둘 다 올라감). */
 THEMES[9]={
  skyTop:'#161a10',skyMid:'#363d22',skyHorizon:'#7a7a48',moon:'#e8e4b0',
  seaTop:'#8c9a46',seaMid:'#5a6a28',seaBottom:'#232c0c',
  crest:'#ece2a8',swell:'#a89a5a',hatch:'#f0e8b0',boat:'#0b0c06',rim:'#b8b48a',
  lamp:'#ffc04a',lampCore:'#fff0b0',bob:.95,drift:.85
 };
 const REEF={x:512,y:139,s:.82};
 const REEF_D='M-112,6 C-104,-2 -98,-10 -88,-14 L-80,-24 L-70,-22 L-62,-38 L-50,-42 L-44,-56 L-30,-60 L-22,-74 L-8,-78 L2,-72 L12,-80 L24,-74 L30,-62 L44,-58 L52,-44 L64,-40 L72,-28 L84,-24 L96,-12 C104,-6 110,0 114,6 Z';
 function flagPath(W,H,t,ph,amp){
  let top='',bot='';
  for(let k=0;k<=10;k++){const u=k/10,x=u*W,wv=Math.sin(u*5.2-t*4.2+ph)*amp*u+Math.sin(u*9-t*6.1+ph)*amp*.3*u;top+=(k?' L':'M')+f1(x)+','+f1(wv-u*u*amp*.4);bot=' L'+f1(x)+','+f1(H+wv*1.1+u*u*amp*.5)+bot;}
  return top+bot+' Z';
 }
 function flagFolds(W,H,t,ph,amp){
  let d='';for(let k=1;k<10;k++){const u=k/10,sl=Math.cos(u*5.2-t*4.2+ph);if(Math.abs(sl)<.35){const x=u*W,wv=Math.sin(u*5.2-t*4.2+ph)*amp*u;d+='M'+f1(x)+','+f1(wv+1)+' L'+f1(x+sl*2)+','+f1(H+wv-1)+' ';}}
  return d;
 }
 LAYERS[9]={
  under(th){
   const n=N();let cr='';for(let i=0;i<7;i++)cr+='<path/>';let sp='';for(let i=0;i<10;i++)sp+='<circle/>';
   return '<defs>'+
     '<linearGradient id="rfRock" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8a8868"/><stop offset=".25" stop-color="#5e5c44"/><stop offset=".7" stop-color="#3a3a28"/><stop offset="1" stop-color="#22220f"/></linearGradient>'+
     '<linearGradient id="rfSide" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#000" stop-opacity=".35"/><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset=".75" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>'+
     (n?n.pattern('rfGrain','rf-grain',{size:128,cell:12,oct:4,rgb:[20,20,8],lo:.45,hi:.9,seed:63},60,60):'')+
     '<linearGradient id="fgBlue" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3a72e8"/><stop offset="1" stop-color="#1c44a8"/></linearGradient>'+
     '<linearGradient id="fgWhite" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#d8d8d0"/></linearGradient>'+
     '<linearGradient id="fgPole" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#5a4a30"/><stop offset=".5" stop-color="#a08860"/><stop offset="1" stop-color="#4a3a22"/></linearGradient>'+
    '</defs>'+
    '<g transform="translate('+REEF.x+' '+REEF.y+') scale('+REEF.s+')">'+
     '<path d="'+REEF_D+'" fill="url(#rfRock)"/>'+(n?'<path d="'+REEF_D+'" fill="url(#rfGrain)" opacity=".6"/>':'')+'<path d="'+REEF_D+'" fill="url(#rfSide)"/>'+
     '<path d="M-80,-24 L-56,-30 M-62,-38 L-36,-44 M-30,-60 L-6,-62 M12,-80 L18,-66 M30,-62 L48,-50 M64,-40 L80,-30 M-96,-6 L-70,-10 L-52,-6 M20,-30 L40,-26 L58,-30 M-40,-20 L-20,-26 L-4,-22" stroke="#20200e" stroke-width="1" fill="none" opacity=".65"/>'+
     '<path d="M-88,-14 L-80,-24 M-62,-38 L-50,-42 L-44,-56 M-30,-60 L-22,-74 L-8,-78 M12,-80 L24,-74 M44,-58 L52,-44 M64,-40 L72,-28" stroke="#c8c49a" stroke-width="1.1" fill="none" opacity=".45" stroke-linecap="round"/>'+
     // 커다란 깃대 둘
     '<rect x="-18" y="-128" width="3.2" height="56" fill="url(#fgPole)"/><circle cx="-16.4" cy="-129" r="2.4" fill="#c8b070"/>'+
     '<rect x="16" y="-126" width="3.2" height="52" fill="url(#fgPole)"/><circle cx="17.6" cy="-127" r="2.4" fill="#c8b070"/>'+
     '<g class="rf-fb" transform="translate(-14.8 -126)"><path class="fl-cloth" fill="url(#fgBlue)"/><path class="fl-fold" stroke="#0e2a70" stroke-width="1.6" fill="none" opacity=".35"/></g>'+
     '<g class="rf-fw" transform="translate(19.2 -124)"><path class="fl-cloth" fill="url(#fgWhite)"/><path class="fl-fold" stroke="#9a9a90" stroke-width="1.6" fill="none" opacity=".4"/></g>'+
    '</g>'+
    '<g class="rf-crash">'+cr+'</g><g class="rf-spray">'+sp+'</g>';
  },
  surface(th){
   // 우리 배의 작은 청기·백기(고물 쪽 깃대, 배와 함께 흔들림)
   return '<g class="bf-flags">'+
    '<rect x="-45" y="-40" width="1.4" height="32" fill="#5a4a30"/><rect x="-37" y="-38" width="1.4" height="30" fill="#5a4a30"/>'+
    '<g class="bf-b" transform="translate(-43.6 -39.6)"><path class="fl-cloth" fill="url(#fgBlue)"/></g>'+
    '<g class="bf-w" transform="translate(-35.6 -37.6)"><path class="fl-cloth" fill="url(#fgWhite)"/></g>'+
   '</g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const big=(sel,ph)=>{const g=el.querySelector(sel);g.querySelector('.fl-cloth').setAttribute('d',flagPath(44,28,t,ph,4.2));g.querySelector('.fl-fold').setAttribute('d',flagFolds(44,28,t,ph,4.2));};
   big('.rf-fb',0);big('.rf-fw',1.7);
   el.querySelector('.bf-b .fl-cloth').setAttribute('d',flagPath(11,7,t*1.2,.4,1.4));
   el.querySelector('.bf-w .fl-cloth').setAttribute('d',flagPath(11,7,t*1.2,2.2,1.4));
   el.querySelector('.bf-flags').setAttribute('transform',boatTf(c));
   // 암초 밑동에 부서지는 물: 거품 띠 · 튀는 물방울
   // 밑동 거품: 불규칙하게 부풀었다 꺼지는 거품 띠(여러 겹)
   const half=114*REEF.s;
   el.querySelectorAll('.rf-crash path').forEach((p,i)=>{
    let top='',bot='';const lay=i%3,sh=Math.floor(i/3);
    for(let x=REEF.x-half-8;x<=REEF.x+half+8;x+=5){
     const base=REEF.y+4*REEF.s+lay*2.2,n=Math.sin(x*.21+t*(1.6+lay*.4)+i*1.7)*1.4+Math.sin(x*.53-t*2.3+i)*.9+Math.sin(x*.09+t*.6+sh)*1.6;
     const hgt=Math.max(.4,1.6+n)*(1-lay*.25);top+=(top?' L':'M')+f1(x)+','+f1(base-hgt);bot=' L'+f1(x)+','+f1(base+hgt*.4)+bot;}
    p.setAttribute('d',top+bot+'Z');p.style.opacity=((.55-lay*.15)*(.75+.25*Math.sin(t*1.3+i))).toFixed(3);
   });
   el.querySelectorAll('.rf-spray circle').forEach((e,i)=>{
    const per=1.6+(i%3)*.4,ph=((t+i*.43)/per)%1,x=REEF.x-84+((Math.floor((t+i*.43)/per)*67+i*41)%168),y0=REEF.y+3;
    e.setAttribute('cx',f1(x+ph*6*(i%2?1:-1)));e.setAttribute('cy',f1(y0-Math.sin(Math.PI*ph)*14));e.setAttribute('r',f1(.8+(i%3)*.4));
    e.style.opacity=(Math.sin(Math.PI*ph)*.75).toFixed(3);
   });
  }
 };

 /* ───────── 21-10 · 둥근 호수 ─────────
    「청동빛 물이 둥글게 일렁인다. 물에 구멍이 하나 생긴다. 구멍 안쪽은 물빛이 없다.
      그보다 배에 가까운 곳에 또 하나가 생긴다. 구멍 사이의 간격이 점점 좁아진다.」
    · 물: 청동빛(녹청 위로 구릿빛 광택). 물결이 여러 중심에서 둥근 고리로 번진다.
    · 구멍: 배 앞쪽 먼 곳에 하나가 열리고, 그보다 배에 가까운 곳에 차례로 더 열린다. 구멍 사이 간격은 갈수록 좁아진다.
      구멍 안은 물빛이 없는 텅 빈 회흑색이고, 가장자리에는 물이 말려 내려가는 벽과 입술이 보인다. */
 THEMES[10]={
  skyTop:'#05090b',skyMid:'#0e1c20',skyHorizon:'#284a4e',moon:'#e8d2a0',
  seaTop:'#6f9c96',seaMid:'#3a5e5c',seaBottom:'#122426',
  crest:'#e6c88a',swell:'#b08a4a',hatch:'#f0d8a0',boat:'#05090a',rim:'#c8a870',
  lamp:'#ffc055',lampCore:'#ffeab0',bob:.9,drift:.6
 };
 // 구멍: [x, 수면 아래 깊이(앞쪽일수록 큼), 반지름, 열리는 시각] — 배에 가까워질수록 가장자리 간격이 좁아짐(40 → 22 → 8)
 const HOLES=[[600,8,20,.8],[518,15,22,2.6],[450,22,24,4.2],[392,29,26,5.6]];   // 열리는 시각은 배가 중앙에 도착한 뒤부터 센다
 LAYERS[10]={
  under(th){
   let rings='';for(let i=0;i<9;i++)rings+='<ellipse/>';
   let holes='';HOLES.forEach((h,i)=>{holes+='<g class="hl" data-i="'+i+'"><ellipse class="hl-ripple" fill="none"/><ellipse class="hl-ripple" fill="none"/>'+
    '<ellipse class="hl-lip" fill="url(#hlLip)"/><ellipse class="hl-void" fill="url(#hlVoid)"/><path class="hl-wall" fill="url(#hlWall)"/><path class="hl-pour"/><path class="hl-edge" fill="none"/></g>';});
   let sheen='';for(let i=0;i<10;i++)sheen+='<path/>';
   return '<defs>'+
     '<radialGradient id="hlVoid" cx=".5" cy=".6" r=".6"><stop stop-color="#0b0b0b"/><stop offset=".7" stop-color="#151515"/><stop offset="1" stop-color="#262626"/></radialGradient>'+
     '<linearGradient id="hlWall" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c4ece4"/><stop offset=".3" stop-color="#6a9e98"/><stop offset=".7" stop-color="#2e4644"/><stop offset="1" stop-color="#2a2a2a" stop-opacity="0"/></linearGradient>'+
     '<radialGradient id="hlLip"><stop offset=".6" stop-color="#e0c080" stop-opacity="0"/><stop offset=".82" stop-color="#e0c080" stop-opacity=".45"/><stop offset="1" stop-color="#7a5a2a" stop-opacity="0"/></radialGradient>'+
     '<radialGradient id="rnRing"><stop offset=".86" stop-color="#e6c88a" stop-opacity="0"/><stop offset=".95" stop-color="#e6c88a" stop-opacity=".55"/><stop offset="1" stop-color="#e6c88a" stop-opacity="0"/></radialGradient>'+
    '</defs>'+
    '<g class="rn-sheen">'+sheen+'</g><g class="rn-rings">'+rings+'</g><g class="rn-holes">'+holes+'</g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   // 둥근 물결: 여러 중심에서 번지는 고리(구리빛 광택)
   el.querySelectorAll('.rn-rings ellipse').forEach((e,i)=>{
    const per=5+(i%3),ph=((t+i*1.9)/per)%1,cyc=Math.floor((t+i*1.9)/per),cx=120+((cyc*137+i*251)%580),cy=surf(cx,t,a)+8+((i*7)%40);
    const rx=6+ph*90*(1+(cy-140)/60);e.setAttribute('cx',f1(cx));e.setAttribute('cy',f1(cy));e.setAttribute('rx',f1(rx));e.setAttribute('ry',f1(rx*.16));
    e.setAttribute('fill','url(#rnRing)');e.style.opacity=(Math.sin(Math.PI*ph)*.9).toFixed(3);
   });
   el.querySelectorAll('.rn-sheen path').forEach((p,i)=>{
    const per=4+i%3,ph=((t+i*1.1)/per)%1,cyc=Math.floor((t+i*1.1)/per),x=110+((cyc*191+i*149)%580),y=surf(x,t,a)+3+(i%4)*9,w=10+(i%3)*8;
    p.setAttribute('d','M'+f1(x-w)+','+f1(y)+' Q'+f1(x)+','+f1(y-1.4)+' '+f1(x+w)+','+f1(y));p.style.opacity=(Math.sin(Math.PI*ph)*.55).toFixed(3);
   });
   // 구멍: 차례로 열림. 안은 물빛이 없는 텅 빈 회흑색, 가장자리에 물이 말려 내려감
   el.querySelectorAll('.hl').forEach(g=>{
    const i=+g.dataset.i,[x,dep,w,at]=HOLES[i],ta=t-(FX.ENTER_SECONDS||8),o=sm((ta-at)/1.1);
    if(o<=0){g.style.opacity='0';return;}g.style.opacity='1';
    const cy=surf(x,t,a)+dep,rx=w*o*(1+.03*Math.sin(t*2+i)),ry=rx*(.22+dep*.004);
    const lip=g.querySelector('.hl-lip');lip.setAttribute('cx',f1(x));lip.setAttribute('cy',f1(cy));lip.setAttribute('rx',f1(rx*1.25));lip.setAttribute('ry',f1(ry*1.35));
    const v=g.querySelector('.hl-void');v.setAttribute('cx',f1(x));v.setAttribute('cy',f1(cy));v.setAttribute('rx',f1(rx));v.setAttribute('ry',f1(ry));
    // 먼 쪽 안벽: 물이 벽을 이루며 아래로 말려 들어감
    const wall=g.querySelector('.hl-wall'),wh=ry*1.1;
    wall.setAttribute('d','M'+f1(x-rx)+','+f1(cy)+' A'+f1(rx)+','+f1(ry)+' 0 0 1 '+f1(x+rx)+','+f1(cy)+' L'+f1(x+rx*.82)+','+f1(cy+wh*.3)+' A'+f1(rx*.82)+','+f1(ry*.7)+' 0 0 0 '+f1(x-rx*.82)+','+f1(cy+wh*.3)+' Z');
    // 쏟아져 내리는 물줄기(안벽을 타고 흐르는 가는 결)
    let pd='';for(let k=0;k<7;k++){const u=-.8+k*.27,px=x+u*rx,py=cy-Math.sqrt(Math.max(0,1-u*u))*ry,ph=((t*1.4+k*.31)%1);pd+='M'+f1(px)+','+f1(py+ph*ry*.3)+' Q'+f1(px*.9+x*.1)+','+f1(py+ry*.4)+' '+f1(px*.8+x*.2)+','+f1(py+ph*ry*.3+ry*.75)+' ';}
    const pour=g.querySelector('.hl-pour');pour.setAttribute('d',pd);pour.style.opacity=(o*.28).toFixed(3);
    const ed=g.querySelector('.hl-edge');ed.setAttribute('d','M'+f1(x-rx)+','+f1(cy)+' A'+f1(rx)+','+f1(ry)+' 0 0 0 '+f1(x+rx)+','+f1(cy));
    g.querySelectorAll('.hl-ripple').forEach((r,k)=>{const ph=((t*.5+k*.5+i*.2)%1),R2=rx*(1.3+ph*1.6);r.setAttribute('cx',f1(x));r.setAttribute('cy',f1(cy));r.setAttribute('rx',f1(R2));r.setAttribute('ry',f1(R2*.22));r.style.opacity=((1-ph)*.5*o).toFixed(3);});
   });
  }
 };

 const css=
  // 21-05 안개
  '.lakefx[data-lake="5"]{background:#9aa19d;border-color:#8a928e;box-shadow:inset 0 0 50px #5a625e55,0 8px 30px #0006}'+
  '.lakefx[data-lake="5"] .lfx-corner{background:linear-gradient(90deg,#6a726e77,transparent 20%,transparent 80%,#6a726e77),linear-gradient(0deg,#5a625e66,transparent 24%,transparent 80%,#4a524e55)}'+
  '.lakefx[data-lake="5"] .lfx-vignette{box-shadow:inset 0 0 60px 12px #3a423e55}'+
  '.lakefx[data-lake="5"] .lfx-top{color:#262c29;text-shadow:0 1px 6px #fff8}'+
  '.lakefx[data-lake="5"] .lfx-mist rect{fill:#ffffff;opacity:.4}'+
  '.lakefx[data-lake="5"] .lfx-horizon{stroke:#6a726e;stroke-opacity:.18}'+
  '.lakefx .fg-wisps path{fill:#eef2ef}'+
  // 21-06 빛나는 물
  '.lakefx[data-lake="6"]{background:#041012;border-color:#4a8a80}'+
  '.lakefx[data-lake="6"] .lfx-corner{background:linear-gradient(90deg,#03100eb0,transparent 22%,transparent 78%,#03100eb0),linear-gradient(0deg,#0a3a3466,transparent 26%,transparent 76%,#03100eaa)}'+
  '.lakefx[data-lake="6"] .lfx-top{color:#d8fff4}'+
  '.lakefx .ov-caus path{fill:none;stroke:#ffffff;stroke-width:1.4;stroke-linecap:round}'+
  '.lakefx .ov-bub circle{fill:#ffffff;fill-opacity:.35;stroke:#ffffff;stroke-width:.35}'+
  '.lakefx .ov-glint ellipse{fill:#ffffff}'+
  // 21-08 없음
  '.lakefx[data-lake="8"]{background:#000;border-color:#141414;box-shadow:none}'+
  '.lakefx[data-lake="8"] .lfx-top,.lakefx[data-lake="8"] .lfx-crest,.lakefx[data-lake="8"] .lfx-fars,.lakefx[data-lake="8"] .lfx-horizon,.lakefx[data-lake="8"] .lfx-mist,'+
  '.lakefx[data-lake="8"] .lfx-ripples,.lakefx[data-lake="8"] .lfx-wake,.lakefx[data-lake="8"] .lfx-reflection,.lakefx[data-lake="8"] .lfx-glint,.lakefx[data-lake="8"] .lfx-grain{display:none}'+
  '.lakefx[data-lake="8"] .lfx-boat{opacity:.5!important}'+
  '.lakefx[data-lake="8"] .lfx-hull,.lakefx[data-lake="8"] .lfx-deck,.lakefx[data-lake="8"] .lfx-stay{stroke-opacity:0}'+
  '.lakefx[data-lake="8"] .lfx-corner{background:none}'+
  '.lakefx .vo-hull{fill:none;stroke:#e0a050;stroke-width:1.1;stroke-linejoin:round}'+
  // 21-09 풀빛
  '.lakefx[data-lake="9"]{background:#141808;border-color:#6a6a3a}'+
  '.lakefx[data-lake="9"] .lfx-corner{background:linear-gradient(90deg,#10140699,transparent 22%,transparent 78%,#10140699),linear-gradient(0deg,#0c1004cc,transparent 26%,transparent 76%,#10140688)}'+
  '.lakefx[data-lake="9"] .lfx-top{color:#f0ecc8}'+
  '.lakefx .rf-crash path{fill:#fffbe6}'+
  '.lakefx .rf-spray circle{fill:#fffbe8}'+
  // 21-10 둥근 호수
  '.lakefx[data-lake="10"]{background:#060c0e;border-color:#4a6a6a}'+
  '.lakefx[data-lake="10"] .lfx-top{color:#f0dcb0}'+
  '.lakefx .rn-sheen path{fill:none;stroke:#f0d090;stroke-width:1;stroke-linecap:round}'+
  '.lakefx .hl-ripple{stroke:#e6c88a;stroke-width:.8}'+
  '.lakefx .hl-pour{stroke:#cfeee8;stroke-width:.5;stroke-linecap:round;fill:none}'+
  '.lakefx .hl-edge{stroke:#f6dca0;stroke-width:1.2;stroke-opacity:.7}';
 const st=document.createElement('style');st.id='lake-themes-v025b';st.textContent=css;document.head.appendChild(st);
 if(typeof state!=='undefined'&&state.scene==='event'&&typeof render==='function')render();
})();
