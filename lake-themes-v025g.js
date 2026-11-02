/* Great Lake v0.2.5 · 호수별 진입 장면 테마 (21-26 ~ 21-30)
   진입 묘사에서 구체적인 것만 그린다(소리처럼 보이지 않는 것은 그리지 않음).
   배가 도착한 뒤에야 있어야 할 것은 도착한 뒤에 나타낸다. */
(function(){
 'use strict';
 const FX=window.GREAT_LAKE_FX;if(!FX||!FX.themes||!FX.layers)return;
 const THEMES=FX.themes,LAYERS=FX.layers,N=()=>window.FxNoise;
 const f1=n=>n.toFixed(1),f2=n=>n.toFixed(2),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sm=k=>{k=cl(k,0,1);return k*k*(3-2*k);};
 const R=(n)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 const boatTf=c=>'translate('+f2(c.x)+' '+f2(c.y)+') rotate('+f2(c.roll)+') scale('+c.s+')';
 const toWorld=(c,p)=>{const r=c.roll*Math.PI/180;return [c.x+c.s*(p[0]*Math.cos(r)-p[1]*Math.sin(r)),c.y+c.s*(p[0]*Math.sin(r)+p[1]*Math.cos(r))];};
 const arrived=c=>{const A=FX.ENTER_SECONDS||8;return c.t<A?-1:c.t-A;};

 /* ───────── 21-26 · 부르는 호수 ─────────
    「물이 시에나빛이다. 배가 들어서자 물 밑에서 어디선가 들었던 목소리가 올라온다. [플레이어]는 {내 자리}에 앉아 있다.」
    · 그리는 것: 시에나빛 물(구운 흙처럼 붉은 갈색). 물속에 고운 흙빛 결이 천천히 감돈다.
    · 그리지 않는 것: 목소리(소리), 앉은 자리(호수마다 달라지는 값). */
 THEMES[26]={
  skyTop:'#0a0605',skyMid:'#22140e',skyHorizon:'#55331f',moon:'#f4dcc4',
  seaTop:'#a8603a',seaMid:'#6a3418',seaBottom:'#1e0c05',
  crest:'#f4d0b0',swell:'#b86e44',hatch:'#ffe0c8',boat:'#080403',rim:'#d8a888',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.85,drift:.75
 };
 LAYERS[26]={
  under(th){
   const n=N();let sh='';for(let i=0;i<9;i++)sh+='<path/>';
   return '<defs>'+(n?n.pattern('snSilt','sn-silt',{size:256,cell:44,oct:4,rgb:[240,170,120],lo:.55,hi:.92,stretch:[3.2,1],seed:37},380,70):'')+
     (n?n.pattern('snDark','sn-dark',{size:256,cell:60,oct:3,rgb:[30,10,4],lo:.45,hi:.9,stretch:[2.4,1],seed:59},320,70):'')+'</defs>'+
    (n?'<g class="sn-a"><rect x="0" y="126" width="1600" height="80" fill="url(#snSilt)" opacity=".26" clip-path="url(#lfxBelow)"/></g><g class="sn-b"><rect x="0" y="126" width="1600" height="80" fill="url(#snDark)" opacity=".45" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g class="sn-sheen">'+sh+'</g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const A=el.querySelector('.sn-a'),B=el.querySelector('.sn-b');if(A)A.setAttribute('transform','translate('+f1(-((t*4)%380))+' '+f1(Math.sin(t*.3)*1.5)+')');if(B)B.setAttribute('transform','translate('+f1(-320+((t*2.6)%320))+' 0)');
   el.querySelectorAll('.sn-sheen path').forEach((p,i)=>{const per=5+i%3,ph=((t+i*1.2)/per)%1,cyc=Math.floor((t+i*1.2)/per),x=120+((cyc*157+i*223)%560),w=12+(i%3)*8;
    let d='',e='';for(let s=0;s<=6;s++){const xx=x-w+s*w/3,yy=surf(xx,t,a)+3+(i%4)*8;d+=(s?' L':'M')+f1(xx)+','+f1(yy);e=' L'+f1(xx)+','+f1(yy+1.2)+e;}
    p.setAttribute('d',d+e+'Z');p.style.opacity=(Math.sin(Math.PI*ph)*.45).toFixed(3);});
  }
 };

 /* ───────── 21-27 · 도는 호수 ─────────
    「물이 청색빛이다. 배가 들어서자 뱃머리가 저절로 한쪽으로 쏠린다. 멀리서 물이 한 방향으로 감기는 소용돌이 소리가 난다. 가운데로 갈수록 물빛이 짙다.」
    · 물: 청색빛. 배 앞쪽 수면에 크게 감기는 물결(원근으로 눌린 나선)이 한 방향으로 돌고, 가운데로 갈수록 물빛이 짙어진다.
    · 배: 들어선 뒤 뱃머리가 저절로 한쪽으로 쏠린다(배가 비스듬히 돌아가 뱃머리가 이쪽으로 틀어지는 모습).
    · 소용돌이 소리는 그리지 않는다. */
 THEMES[27]={
  skyTop:'#040a0a',skyMid:'#0e2224',skyHorizon:'#285254',moon:'#d8f4f2',
  seaTop:'#5aa4a0',seaMid:'#2a6664',seaBottom:'#0a2222',
  crest:'#dcfaf6',swell:'#6ab4b0',hatch:'#e0fffa',boat:'#040808',rim:'#a8d4d0',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.9,drift:.4
 };
 const VX={x:520,y:164,rx:220,ry:30};   // 소용돌이 중심(배 앞 · 보는 쪽) · 원근으로 눌린 크기
 LAYERS[27]={
  under(th){
   let arms='';for(let i=0;i<3;i++)for(let j=0;j<3;j++)arms+='<path class="vx-arm" data-i="'+i+'" data-j="'+j+'"/>';
   let fl='';for(let i=0;i<22;i++)fl+='<ellipse/>';
   return '<defs><radialGradient id="vxDeep" cx=".5" cy=".5" r=".5"><stop stop-color="#031212" stop-opacity=".95"/><stop offset=".35" stop-color="#0a2e2e" stop-opacity=".6"/><stop offset=".75" stop-color="#1a5050" stop-opacity=".22"/><stop offset="1" stop-color="#2a6664" stop-opacity="0"/></radialGradient></defs>'+
    '<g clip-path="url(#lfxBelow)"><ellipse cx="'+VX.x+'" cy="'+VX.y+'" rx="'+VX.rx+'" ry="'+VX.ry*1.4+'" fill="url(#vxDeep)"/>'+
     '<g class="vx-arms">'+arms+'</g><g class="vx-fl">'+fl+'</g></g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const rot=t*.55;   // 한 방향(시계 방향)으로 감김
   // 나선 팔 셋: 바깥에서 안쪽으로 감겨 들며 점점 가늘고 진해짐(구간마다 굵기 · 밝기 다르게)
   el.querySelectorAll('.vx-arm').forEach(p=>{const i=+p.dataset.i,j=+p.dataset.j;let d='';
    for(let k=0;k<=24;k++){const u=(j+k/24)/3,ang=rot+i*Math.PI*2/3+Math.log(1+u*6)*2.1,r=Math.pow(1-u,1.25)*.98+.02;d+=(k?' L':'M')+f1(VX.x+Math.cos(ang)*VX.rx*r)+','+f1(VX.y+Math.sin(ang)*VX.ry*r);}
    p.setAttribute('d',d);p.style.strokeWidth=(2.4-j*.7).toFixed(1);p.style.strokeOpacity=(.22+j*.14).toFixed(2);});
   // 감겨 드는 물보라 조각: 바깥에서 안쪽으로 나선을 따라 끌려 들어감
   el.querySelectorAll('.vx-fl ellipse').forEach((e,i)=>{const per=6+(i%5),ph=((t+i*.9)/per)%1,ang=rot*1.3+i*.8+ph*Math.PI*3,r=1-ph*.92;
    e.setAttribute('cx',f1(VX.x+Math.cos(ang)*VX.rx*r));e.setAttribute('cy',f1(VX.y+Math.sin(ang)*VX.ry*r));e.setAttribute('rx',f1(1.6*r+.4));e.setAttribute('ry',f1(.5*r+.2));e.style.opacity=(Math.sin(Math.PI*ph)*.7).toFixed(3);});
   // 뱃머리가 저절로 한쪽으로 쏠림: 들어선 뒤 배가 비스듬히 돌아감(옆모습이 짧아지며 기울고, 조금씩 끌려감)
   const ta=c.t-1.2,k=sm(ta/5),yaw=k*(.4+.05*Math.sin(t*.7)),boat=el.querySelector('.lfx-boat');
   if(boat&&k>0){const tf=boat.getAttribute('transform')||'';boat.setAttribute('transform',tf+' scale('+f2(1-yaw*.5)+' 1) skewY('+f1(yaw*15)+')');
    const ref=el.querySelector('.lfx-reflection');if(ref){const rt=ref.getAttribute('transform')||'';ref.setAttribute('transform',rt+' scale('+f2(1-yaw*.55)+' 1) skewY('+f1(-yaw*14)+')');}}
  }
 };

 /* ───────── 21-28 · 별빛 호수 ─────────
    「물이 별처럼 반짝인다. 물에 별이 함께 떠 있다. 어느 쪽이 위인지 헷갈린다.」
    · 물: 수면 곳곳이 별처럼 빛났다 꺼진다(반짝이는 물).
    · 별: 하늘의 별과 함께 물에도 별이 떠 있다(비친 별 + 물에만 있는 별, 일부는 하늘에만 있음).
    · 위아래가 헷갈림: 배가 물에 거울처럼 또렷이 거꾸로 비쳐, 위의 배와 아래의 배가 똑같이 보인다. */
 THEMES[28]={
  skyTop:'#050a14',skyMid:'#0c1628',skyHorizon:'#1a2a44',moon:'#000000',
  seaTop:'#1e2e48',seaMid:'#0e1830',seaBottom:'#050a16',
  crest:'#9ab0d8',swell:'#2a3e60',hatch:'#c8d8ff',boat:'#020408',rim:'#8aa0c8',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.7,drift:.7
 };
 const STARS=[];for(let i=0;i<64;i++)STARS.push({x:R(i)*800,y:6+R(i+200)*118,r:.35+R(i+400)*1.15,mode:R(i+600)<.18?'sky':R(i+600)<.82?'both':'water'});
 LAYERS[28]={
  sky(th){let s='';STARS.forEach((S,i)=>{if(S.mode!=='water')s+='<circle cx="'+f1(S.x)+'" cy="'+f1(S.y)+'" r="'+f2(S.r)+'" data-i="'+i+'"/>';});return '<g class="st-sky">'+s+'</g>';},
  under(th){
   let s='';STARS.forEach((S,i)=>{if(S.mode==='sky')return;const y=2*132-S.y;if(y<134||y>205)return;s+='<g data-i="'+i+'"><circle cx="'+f1(S.x)+'" cy="'+f1(y)+'" r="'+f2(S.r*1.1)+'"/><ellipse class="st-glow" cx="'+f1(S.x)+'" cy="'+f1(y)+'" rx="'+f2(S.r*4)+'" ry="'+f2(S.r*1.2)+'"/></g>';});
   let gl='';for(let i=0;i<40;i++)gl+='<ellipse/>';
   return '<defs><radialGradient id="stGlow"><stop stop-color="#e8f0ff" stop-opacity=".55"/><stop offset="1" stop-color="#e8f0ff" stop-opacity="0"/></radialGradient></defs>'+
    '<g class="st-water">'+s+'</g><g class="st-glim">'+gl+'</g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   el.querySelectorAll('.st-sky circle').forEach(e=>{const i=+e.dataset.i;e.style.opacity=(.45+.55*Math.abs(Math.sin(t*(.4+R(i+9)*.8)+i))).toFixed(2);});
   el.querySelectorAll('.st-water g').forEach(g=>{const i=+g.dataset.i;g.style.opacity=(.4+.5*Math.abs(Math.sin(t*(.4+R(i+9)*.8)+i+.6))).toFixed(2);g.setAttribute('transform','translate('+f1(Math.sin(t*.9+i)*1.4)+' '+f1(Math.sin(t*1.3+i)*.5)+')');});
   el.querySelectorAll('.st-glim ellipse').forEach((p,i)=>{const per=1+(i%5)*.3,ph=((t+i*.41)/per)%1,cyc=Math.floor((t+i*.41)/per),x=80+((cyc*137+i*211)%640),y=surf(x,t,a)+2+(i%7)*7,k=Math.sin(Math.PI*ph);
    p.setAttribute('cx',f1(x));p.setAttribute('cy',f1(y));p.setAttribute('rx',f1(1+k*3.4));p.setAttribute('ry',f1(.5+k*.9));p.setAttribute('fill','url(#stGlow)');p.style.opacity=(k*.95).toFixed(3);});
  }
 };

 /* ───────── 21-29 · 하늘빛 호수 ─────────
    「하늘빛 물이 얼음과 섞여 동동 떠다닌다. 입김이 하얗게 나온다. 뱃머리 앞쪽 물이 얼어붙어 있다. 그 아래로 물 흐르는 소리가 난다.」
    · 물: 하늘빛. 크고 작은 얼음 조각이 떠서 동동 흔들린다(물 위로 드러난 윗면 · 물속으로 비치는 옆면).
    · 입김: 선원의 입에서 하얀 입김이 주기적으로 나와 흩어진다.
    · 얼어붙은 물: 배가 멈춘 자리 바로 앞(뱃머리 앞)부터 수면이 하얗게 얼어 있다(금 없는 얼음판, 가장자리에 서리).
    · 얼음 밑 물소리는 그리지 않는다. */
 THEMES[29]={
  skyTop:'#0a121a',skyMid:'#22384a',skyHorizon:'#5c7e96',moon:'#ffffff',
  seaTop:'#9ec4dc',seaMid:'#4c7892',seaBottom:'#122838',
  crest:'#ffffff',swell:'#9cc0d8',hatch:'#ffffff',boat:'#050a0e',rim:'#c0d8e8',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.6,drift:.12
 };
 const FLOES=[];for(let i=0;i<16;i++)FLOES.push({x:30+R(i)*360,d:R(i+50),w:6+R(i+90)*16,seed:i});
 const ICE_X=432;   // 얼음판이 시작되는 자리(배가 멈추는 뱃머리 바로 앞)
 LAYERS[29]={
  under(th){
   const n=N();let fl='';FLOES.forEach((F,i)=>fl+='<g class="ic-f" data-i="'+i+'"><path class="ic-under"/><path class="ic-top"/><path class="ic-edge"/></g>');
   return '<defs><linearGradient id="icTop" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#d8eaf6"/></linearGradient>'+
     '<linearGradient id="icSheet" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f4fbff"/><stop offset=".4" stop-color="#d4e8f4"/><stop offset="1" stop-color="#a8c8dc"/></linearGradient>'+
     '<linearGradient id="icFade" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".06" stop-color="#fff" stop-opacity="1"/></linearGradient>'+
     (n?n.pattern('icFrost','ic-frost',{size:128,cell:5,oct:3,rgb:[255,255,255],lo:.55,hi:.9,seed:23},50,30):'')+'</defs>'+
    '<g class="ic-floes">'+fl+'</g>'+
    '<path class="ic-sheet" fill="url(#icSheet)"/>'+(n?'<path class="ic-frost" fill="url(#icFrost)" opacity=".55"/>':'')+'<path class="ic-sheet-rim"/><path class="ic-sheet-face"/>';
  },
  surface(th){let s='';for(let i=0;i<5;i++)s+='<path/>';return '<defs><radialGradient id="brGrad"><stop stop-color="#ffffff" stop-opacity=".85"/><stop offset=".6" stop-color="#f4faff" stop-opacity=".35"/><stop offset="1" stop-color="#f4faff" stop-opacity="0"/></radialGradient></defs><g class="br-puffs">'+s+'</g>';},
  paint(el,c){
   const {t,a,surf}=c;
   // 떠다니는 얼음 조각
   el.querySelectorAll('.ic-f').forEach(g=>{const F=FLOES[+g.dataset.i],x=F.x+Math.sin(t*.12+F.seed)*8,depth=F.d,y=surf(x,t,a)+2+depth*34,w=F.w*(.6+depth*.7),bob=Math.sin(t*1.6+F.seed*2)*.6,tilt=Math.sin(t*1.1+F.seed)*.06;
    const top='M'+f1(x-w)+','+f1(y+bob-w*.05)+' L'+f1(x-w*.6)+','+f1(y+bob-w*.18-tilt*w)+' L'+f1(x+w*.4)+','+f1(y+bob-w*.2+tilt*w)+' L'+f1(x+w)+','+f1(y+bob-w*.04)+' L'+f1(x+w*.5)+','+f1(y+bob+w*.08)+' L'+f1(x-w*.7)+','+f1(y+bob+w*.07)+' Z';
    g.querySelector('.ic-top').setAttribute('d',top);g.querySelector('.ic-top').setAttribute('fill','url(#icTop)');
    g.querySelector('.ic-under').setAttribute('d','M'+f1(x-w*.9)+','+f1(y+bob)+' L'+f1(x+w*.9)+','+f1(y+bob)+' L'+f1(x+w*.6)+','+f1(y+bob+w*.32)+' L'+f1(x-w*.5)+','+f1(y+bob+w*.3)+' Z');
    g.querySelector('.ic-edge').setAttribute('d','M'+f1(x-w)+','+f1(y+bob-w*.05)+' L'+f1(x-w*.7)+','+f1(y+bob+w*.07)+' L'+f1(x+w*.5)+','+f1(y+bob+w*.08)+' L'+f1(x+w)+','+f1(y+bob-w*.04));
   });
   // 뱃머리 앞 얼음판: 고정된 자리(배가 와서 그 앞에 멈춤)
   // 얼음판은 배가 놓인 물길(수면 가까운 띠) 앞쪽으로 펼쳐지고, 보는 쪽 가장자리는 들쭉날쭉 깨져 있음
   let top='',bot='';for(let x=ICE_X;x<=820;x+=10){const ws=surf(x,t,a),j=x===ICE_X?0:Math.sin(x*.7)*.6;top+=(top?' L':'M')+x+','+f1(ws-1.6+j);
    const near=ws+12+Math.min(1,(x-ICE_X)/60)*12+Math.sin(x*.31)*2.4+Math.sin(x*.83)*1.2;bot=' L'+x+','+f1(near)+bot;}
   const sheet=top+bot+' L'+(ICE_X-3)+','+f1(surf(ICE_X,t,a)+6)+' Z';
   el.querySelector('.ic-sheet').setAttribute('d',sheet);const fr=el.querySelector('.ic-frost');if(fr)fr.setAttribute('d',sheet);
   el.querySelector('.ic-sheet-rim').setAttribute('d',top);
   let face='';for(let x=ICE_X;x<=820;x+=10)face+=(face?' L':'M')+x+','+f1(surf(x,t,a)+1.2);el.querySelector('.ic-sheet-face').setAttribute('d',face);
   // 입김: 선원 입 언저리에서 주기적으로 하얗게 나와 위로 흩어짐
   const mouth=toWorld(c,[30.4,-30.2]);
   el.querySelectorAll('.br-puffs path').forEach((p,i)=>{const per=3.2,ph=((t+i*.42)/per)%1;if(ph>.55){p.style.opacity='0';return;}
    const k=ph/.55,x=mouth[0]+2+k*16+i*.5,y=mouth[1]-k*7+Math.sin(k*5+i)*1.4,r=1.2+k*6;
    p.setAttribute('d','M'+f1(x-r)+','+f1(y)+' a'+f1(r)+','+f1(r*.6)+' 0 1,1 '+f1(r*2)+',0 a'+f1(r)+','+f1(r*.6)+' 0 1,1 '+f1(-r*2)+',0 Z');
    p.setAttribute('fill','url(#brGrad)');p.style.opacity=(Math.sin(Math.PI*k)*.75).toFixed(3);});
  }
 };

 /* ───────── 21-30 · 고동빛 호수 ─────────
    「물이 고동빛이다. 물 위로 신발이 한 짝씩 떠 온다. 크기도 모양도 제각각이다. 짝이 맞는 것은 하나도 없다.」
    · 물: 고동빛(검붉은 갈색 위로 구릿빛 광택).
    · 신발: 배가 멈춘 뒤, 앞쪽에서 신발이 한 짝씩 물살에 실려 떠 와 배 곁을 지나간다.
      장화 · 구두 · 굽 높은 구두 · 짚신 · 아이 신 · 끈 운동화 · 털신 — 크기도 모양도 다르고, 같은 짝은 없다. */
 THEMES[30]={
  skyTop:'#0a0605',skyMid:'#22140e',skyHorizon:'#5a3424',moon:'#f4dcc8',
  seaTop:'#8a4a30',seaMid:'#4e2414',seaBottom:'#160805',
  crest:'#f0c8a8',swell:'#a8603e',hatch:'#ffe0c8',boat:'#080403',rim:'#d8a888',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.85,drift:.7
 };
 const SHOE={
  boot:'<path d="M-6,-1 L-6,-12 L-1,-12 L-1,-5 Q2,-5 6,-3 Q8,-2 8,0 L-6,0 Z" fill="#2a2a22"/><path d="M-6,-12 L-1,-12" stroke="#5a5a48" stroke-width=".8"/><path d="M-6,0 L8,0" stroke="#111" stroke-width="1"/>',
  dress:'<path d="M-6,0 Q-6,-3 -3,-3.6 L2,-3.6 Q6,-3.4 7.6,-1.4 Q8,0 6,0 Z" fill="#3a1c10"/><path d="M-3.4,-3.4 Q-1,-1.8 2,-3.4" stroke="#7a4a30" stroke-width=".5" fill="none"/><path d="M-6,0 L7,0" stroke="#120806" stroke-width=".9"/>',
  heel:'<path d="M-6,-5 Q-6,-6 -5,-6 L-3.6,-6 L-1,-2.4 Q3,-1.6 6.6,-.8 Q7.4,0 6,0 L-3,0 Z" fill="#8a1c2a"/><path d="M-6,-5 L-6.2,0 L-5,0 Z" fill="#4a0a12"/><path d="M-3.6,-6 L-1,-2.4" stroke="#c84a5a" stroke-width=".4"/>',
  straw:'<path d="M-6,0 Q-6.6,-1.8 -5,-2 L5,-2.2 Q7,-2 7,-.8 Q7,0 5.6,0 Z" fill="#c8a868"/><path d="M-4,-2 L4.5,-4.6 M-1,-2.1 L4.5,-4.6 M2,-2.1 L4.5,-4.6" stroke="#8a6a38" stroke-width=".5"/><path d="M-5,-1 L6,-1.2" stroke="#9a7a48" stroke-width=".35" stroke-dasharray=".8 .6"/>',
  child:'<path d="M-3.6,0 Q-3.8,-2.6 -2,-2.8 L1.4,-2.8 Q3.8,-2.4 4,-.8 Q4,0 3,0 Z" fill="#c84a3a"/><path d="M-1.6,-2.8 L-1.4,-1.2 L2,-1.2 L2,-2.8" stroke="#f4e0c8" stroke-width=".5" fill="none"/>',
  sneaker:'<path d="M-6,0 Q-6.2,-3.4 -4,-3.8 L0,-4 Q3,-2.6 6,-2 Q7.6,-1.4 7.4,0 Z" fill="#d8d4c8"/><path d="M-6,0 L7.4,0 L7.4,.8 L-6,.8 Z" fill="#8a8478"/><path d="M-2,-3.6 L1.6,-2.4 M-1,-3.8 L2.4,-2.6 M0,-3.9 L3.2,-2.8" stroke="#3a3a6a" stroke-width=".4"/>',
  fur:'<path d="M-5.4,0 Q-6,-5 -4,-7 L1,-7 Q2,-4 5,-2.6 Q7,-1.6 6.4,0 Z" fill="#6a4a30"/><path d="M-4.4,-7 Q-1.4,-8.2 1.4,-7" stroke="#d8c0a0" stroke-width="1.4" stroke-linecap="round" fill="none"/>'
 };
 const SHOES=[['boot',1.05,0],['heel',.9,1],['straw',1,0],['child',.8,1],['dress',1,0],['sneaker',.95,1],['fur',1.05,0],['heel',.7,0],['boot',.75,1],['straw',.85,1]];   // [모양, 크기, 앞코 방향(0 왼쪽 · 1 오른쪽)] — 같은 짝 없음
 LAYERS[30]={
  under(th){
   const n=N();let sh='';SHOES.forEach((S,i)=>{sh+='<g class="sh" data-i="'+i+'"><ellipse class="sh-rip"/><g class="sh-ref" opacity=".3"><g transform="scale(1 -.5)">'+SHOE[S[0]]+'</g></g><g class="sh-up">'+SHOE[S[0]]+'</g><path class="sh-wl"/></g>';});
   let gl='';for(let i=0;i<10;i++)gl+='<path/>';
   return '<defs>'+(n?n.pattern('gdRust','gd-rust',{size:256,cell:40,oct:4,rgb:[230,150,100],lo:.6,hi:.92,stretch:[3,1],seed:47},320,70):'')+'</defs>'+
    (n?'<g class="gd-r"><rect x="0" y="126" width="1600" height="80" fill="url(#gdRust)" opacity=".22" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g class="gd-gl">'+gl+'</g><g class="shoes">'+sh+'</g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const r=el.querySelector('.gd-r');if(r)r.setAttribute('transform','translate('+f1(-((t*5)%320))+' 0)');
   el.querySelectorAll('.gd-gl path').forEach((p,i)=>{const per=4+i%3,ph=((t+i*1.1)/per)%1,cyc=Math.floor((t+i*1.1)/per),x=120+((cyc*151+i*197)%560),y=surf(x,t,a)+3+(i%4)*9,w=10+(i%3)*8;
    p.setAttribute('d','M'+f1(x-w)+','+f1(y)+' Q'+f1(x)+','+f1(y-1.2)+' '+f1(x+w)+','+f1(y));p.style.opacity=(Math.sin(Math.PI*ph)*.5).toFixed(3);});
   // 신발: 배가 멈춘 뒤 한 짝씩 앞(오른쪽)에서 떠 와 배 곁을 지나 뒤로 흘러감
   const ta=arrived(c);
   el.querySelectorAll('.sh').forEach(g=>{const i=+g.dataset.i,[kind,s,dir]=SHOES[i];
    const start=.4+i*1.5,dur=10,k=ta<0?-1:(ta-start)/dur;
    if(k<0||k>1){g.style.opacity='0';return;}
    const lane=i%3,depth=[8,18,30][lane],x=650-k*640,y=surf(x,t,a)+depth,sc=s*(.75+lane*.22),bob=Math.sin(t*1.7+i)*.6,rk=Math.sin(t*1.2+i)*5;
    g.style.opacity=Math.min(1,k*10,(1-k)*10).toFixed(2);
    const flip=dir?1:-1;
    g.querySelector('.sh-up').setAttribute('transform','translate('+f1(x)+' '+f1(y+1.4*sc+bob)+') rotate('+f1(rk)+') scale('+f2(sc*flip)+' '+f2(sc)+')');
    g.querySelector('.sh-ref').setAttribute('transform','translate('+f1(x)+' '+f1(y+2*sc)+') rotate('+f1(-rk)+') scale('+f2(sc*flip)+' '+f2(sc)+')');
    const rp=g.querySelector('.sh-rip');rp.setAttribute('cx',f1(x));rp.setAttribute('cy',f1(y+1.6*sc));rp.setAttribute('rx',f1(9*sc+Math.sin(t*2+i)*1));rp.setAttribute('ry',f1(1.6*sc));
    g.querySelector('.sh-wl').setAttribute('d','M'+f1(x-8*sc)+','+f1(y+1.5*sc+bob)+' Q'+f1(x)+','+f1(y+2.4*sc+bob)+' '+f1(x+8*sc)+','+f1(y+1.5*sc+bob));
   });
  }
 };

 const css=
  '.lakefx[data-lake="26"]{background:#0c0705;border-color:#7a4a30}.lakefx[data-lake="26"] .lfx-top{color:#f4dcc8}'+
  '.lakefx .sn-sheen path{fill:#ffd8b8}'+
  '.lakefx[data-lake="27"]{background:#050b0b;border-color:#3a6a68}.lakefx[data-lake="27"] .lfx-top{color:#dcf4f2}'+
  '.lakefx .vx-arm{fill:none;stroke:#bff0ea;stroke-linecap:round}.lakefx .vx-fl ellipse{fill:#e0fffa}'+
  '.lakefx[data-lake="28"]{background:#050a14;border-color:#2a3a5a}.lakefx[data-lake="28"] .lfx-top{color:#c8d8f4}'+
  '.lakefx[data-lake="28"] .lfx-reflection{opacity:.85!important;filter:none}.lakefx[data-lake="28"] .lfx-horizon{stroke-opacity:.06}'+
  '.lakefx .st-sky circle,.lakefx .st-water circle{fill:#eef4ff}.lakefx .st-glow{fill:url(#stGlow)}'+
  '.lakefx .st-glim ellipse{mix-blend-mode:screen}'+
  '.lakefx[data-lake="29"]{background:#0a121a;border-color:#6a8aa0}.lakefx[data-lake="29"] .lfx-top{color:#f0f8ff}'+
  '.lakefx .ic-under{fill:#cfe6f4;opacity:.45}.lakefx .ic-edge{fill:none;stroke:#7aa0b8;stroke-width:.5;stroke-opacity:.8}'+
  '.lakefx .ic-sheet-rim{fill:none;stroke:#ffffff;stroke-width:1.2;stroke-opacity:.9}.lakefx .ic-sheet-face{fill:none;stroke:#8ab0c8;stroke-width:.8;stroke-opacity:.6}'+
  '.lakefx[data-lake="30"]{background:#0c0605;border-color:#7a4a30}.lakefx[data-lake="30"] .lfx-top{color:#f4dcc8}'+
  '.lakefx .gd-gl path{fill:none;stroke:#f0c8a0;stroke-width:1;stroke-linecap:round}'+
  '.lakefx .sh-rip{fill:none;stroke:#f0c8a8;stroke-width:.6;stroke-opacity:.5}.lakefx .sh-wl{fill:none;stroke:#f4d4b8;stroke-width:.6;stroke-opacity:.6}';
 const st=document.createElement('style');st.id='lake-themes-v025g';st.textContent=css;document.head.appendChild(st);
 if(typeof state!=='undefined'&&state.scene==='event'&&typeof render==='function')render();
})();
