/* Great Lake v0.2.5 · 호수별 진입 장면 테마
   lake-boat-fx-v019.js 의 GREAT_LAKE_FX 에 호수마다 색(theme)과 추가 층(layers)을 붙인다.
   layers[id] = { sky(th), under(th), surface(th) → SVG 문자열, paint(el, ctx) → 매 프레임 갱신 }
   · sky: 하늘(달무리 위, 수평선 아래)  · under: 수면 아래(물 채움 위, 배 그림자 아래)  · surface: 물마루 위
   움직이는 요소에는 필터를 걸지 않는다(프레임 유지). */
(function(){
 'use strict';
 const FX=window.GREAT_LAKE_FX=window.GREAT_LAKE_FX||{};
 const THEMES=FX.themes=FX.themes||{};
 const LAYERS=FX.layers=FX.layers||{};
 const prevTheme=FX.theme||function(){return {};};
 FX.theme=function(lake,def){return Object.assign({},prevTheme(lake,def)||{},THEMES[lake&&lake.id]||{});};
 const f1=n=>n.toFixed(1);

 /* ───────── 21-01 · 붉은 호수 ─────────
    「물이 붉게 일렁인다. 배 밑으로 붉은 것이 지나간다. 한참을 보아도 끝이 없다.」
    · 물: 검붉은 바다. 물마루를 따라 붉은 빛이 일렁이고, 물속엔 붉은 빛줄기가 흔들린다.
    · 배 밑: 비늘 덮인 거대한 몸통이 화면 끝에서 끝까지 가로질러 끝없이 흘러간다(머리도 꼬리도 보이지 않는다).
      몸통은 물결치듯 굽이치고, 등지느러미 마디가 스쳐 지나가며, 비늘에 빛이 걸려 반짝인다.
    · 몸통이 지나가며 물을 밀어 올려 수면에 넓은 너울 자국과 작은 거품이 오른다. */
 THEMES[1]={
  skyTop:'#08040a',skyMid:'#1a0910',skyHorizon:'#4a121b',
  moon:'#d39088',
  seaTop:'#6e1823',seaMid:'#3c0a14',seaBottom:'#150309',
  crest:'#f3b7ad',swell:'#c95a62',hatch:'#ffd4c9',
  boat:'#070305',rim:'#d7aaa3',
  lamp:'#ffb04a',lampCore:'#ffe0a0',
  bob:1.15,drift:.9
 };
 const R={
  speed:46,          // 몸통이 흘러가는 속도(왼쪽으로, 단위/초)
  depth:34,          // 수면 아래 몸통 중심 깊이
  half:15.5,         // 몸통 두께의 절반
  x0:90,x1:710,      // 계산 범위(데스크톱·모바일 보이는 폭보다 넉넉히)
  step:10
 };
 // 몸통 중심선: 오른쪽에서 왼쪽으로 진행하는 굽이 + 아주 느린 오르내림
 function spine(x,t){
  const u=x+t*R.speed;
  return R.depth+Math.sin(u*0.0105)*6.5+Math.sin(u*0.0041+1.2)*4+Math.sin(t*0.27)*3;
 }
 function halfAt(x,t){
  const u=x+t*R.speed;
  return R.half*(1+Math.sin(u*0.0062+.7)*.09+Math.sin(t*0.31)*.07);
 }
 LAYERS[1]={
  sky(th){
   // 수평선 근처에 붉은 노을 같은 기운, 하늘 높은 곳에 흐린 붉은 구름 띠
   return '<defs>'+
     '<linearGradient id="rlHaze" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7a1c26" stop-opacity="0"/><stop offset=".7" stop-color="#8a2430" stop-opacity=".28"/><stop offset="1" stop-color="#b6404a" stop-opacity=".42"/></linearGradient>'+
     '<radialGradient id="rlSun" cx=".5" cy="1" r=".6"><stop stop-color="#c8505a" stop-opacity=".35"/><stop offset=".5" stop-color="#7a1c26" stop-opacity=".12"/><stop offset="1" stop-color="#3a0a12" stop-opacity="0"/></radialGradient>'+
    '</defs>'+
    '<rect x="0" y="62" width="800" height="72" fill="url(#rlHaze)"/>'+
    '<ellipse cx="400" cy="132" rx="420" ry="70" fill="url(#rlSun)"/>'+
    '<radialGradient id="rlCloud"><stop stop-color="#b04a54" stop-opacity=".16"/><stop offset=".6" stop-color="#8a2a36" stop-opacity=".06"/><stop offset="1" stop-color="#5a1420" stop-opacity="0"/></radialGradient>'+
    '<g class="rl-cloud">'+
     '<ellipse cx="250" cy="52" rx="150" ry="9" fill="url(#rlCloud)"/>'+
     '<ellipse cx="470" cy="40" rx="110" ry="6" fill="url(#rlCloud)"/>'+
     '<ellipse cx="560" cy="84" rx="170" ry="8" fill="url(#rlCloud)"/>'+
     '<ellipse cx="330" cy="98" rx="120" ry="5" fill="url(#rlCloud)"/>'+
    '</g>';
  },
  under(th){
   const scaleRows=5;let rows='';
   for(let i=0;i<scaleRows;i++)rows+='<path class="rl-scales" data-r="'+i+'"/>';
   return '<defs>'+
     '<linearGradient id="rlBody" x1="0" y1="0" x2="0" y2="1">'+
      '<stop stop-color="#5a0d18"/><stop offset=".28" stop-color="#9a2230"/><stop offset=".5" stop-color="#c23a46"/><stop offset=".72" stop-color="#8e1e2b"/><stop offset="1" stop-color="#3e0710"/></linearGradient>'+
     '<linearGradient id="rlVeil" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5c121d" stop-opacity=".62"/><stop offset=".45" stop-color="#3a0a14" stop-opacity=".34"/><stop offset="1" stop-color="#14030a" stop-opacity=".72"/></linearGradient>'+
     '<linearGradient id="rlRay" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ff8a80" stop-opacity=".9"/><stop offset=".5" stop-color="#e05a60" stop-opacity=".3"/><stop offset="1" stop-color="#a02a34" stop-opacity="0"/></linearGradient>'+
     '<linearGradient id="rlFin" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#5e0e1a" stop-opacity=".95"/><stop offset="1" stop-color="#c0404c" stop-opacity=".35"/></linearGradient>'+
     '<linearGradient id="rlSide" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#14030a" stop-opacity=".95"/><stop offset=".22" stop-color="#14030a" stop-opacity="0"/><stop offset=".78" stop-color="#14030a" stop-opacity="0"/><stop offset="1" stop-color="#14030a" stop-opacity=".95"/></linearGradient>'+
    '</defs>'+
    '<g class="rl-beast">'+
     '<path class="rl-shadow"/>'+                // 몸통 둘레 흐린 그늘(물이 어두워지는 범위)
     '<path class="rl-body" fill="url(#rlBody)"/>'+
     '<g class="rl-scale-g">'+rows+'</g>'+
     '<path class="rl-belly"/>'+                 // 배 쪽 옅은 선
     '<path class="rl-ridge"/>'+                 // 등줄기
     '<path class="rl-fins" fill="url(#rlFin)"/><path class="rl-fin-rays"/>'+ // 등지느러미(막과 살)
     '<g class="rl-glints"><ellipse/><ellipse/><ellipse/><ellipse/><ellipse/><ellipse/></g>'+
    '</g>'+
    '<path class="rl-veil" fill="url(#rlVeil)"/>'+     // 몸통을 덮는 물빛(물속에 있는 느낌)
    '<g class="rl-caustic" fill="url(#rlRay)"><path/><path/><path/><path/></g>'+ // 물속에 흔들리는 붉은 빛줄기
    '<rect x="0" y="120" width="800" height="80" fill="url(#rlSide)"/>';
  },
  surface(th){
   let gl='';for(let i=0;i<16;i++)gl+='<ellipse/>';
   return '<defs><radialGradient id="rlGlim"><stop stop-color="#ffe2d6" stop-opacity=".95"/><stop offset=".35" stop-color="#ff9a8c" stop-opacity=".45"/><stop offset="1" stop-color="#ff6a66" stop-opacity="0"/></radialGradient></defs>'+
    '<g class="rl-glim">'+gl+'</g><path class="rl-swell"/><path class="rl-swell b"/>'+
    '<g class="rl-bubbles"><circle/><circle/><circle/><circle/><circle/><circle/><circle/></g>'+
    '<g class="rl-pops"><ellipse/><ellipse/><ellipse/></g>';
  },
  paint(el,c){
   const {t,a,surf,SEA}=c;
   const appear=Math.min(1,Math.max(0,(t-.6)/3.2));           // 진입 직후 물속에서 서서히 떠오름
   const near=.5+.5*Math.sin(t*0.27);                            // 몸통이 수면 가까이 오를수록 진하게
   const top=[],bot=[];
   for(let x=R.x0;x<=R.x1;x+=R.step){
    const sy=SEA+spine(x,t),h=halfAt(x,t);
    top.push(f1(x)+','+f1(sy-h));bot.push(f1(x)+','+f1(sy+h));
   }
   const body='M'+top.join(' L')+' L'+bot.reverse().join(' L')+' Z';
   const q=el.querySelector.bind(el);
   q('.rl-body').setAttribute('d',body);
   q('.rl-beast').style.opacity=(appear*(.72+.28*near)).toFixed(3);
   // 그늘: 몸통보다 넓은 띠
   const shTop=[],shBot=[];
   for(let x=R.x0;x<=R.x1;x+=R.step*2){const sy=SEA+spine(x,t),h=halfAt(x,t)*1.75;shTop.push(f1(x)+','+f1(sy-h));shBot.push(f1(x)+','+f1(sy+h+3));}
   q('.rl-shadow').setAttribute('d','M'+shTop.join(' L')+' L'+shBot.reverse().join(' L')+' Z');
   // 등줄기 · 배 쪽 선
   let ridge='',belly='';
   for(let x=R.x0;x<=R.x1;x+=R.step){const sy=SEA+spine(x,t),h=halfAt(x,t);ridge+=(ridge?' L':'M')+f1(x)+','+f1(sy-h*.18);belly+=(belly?' L':'M')+f1(x)+','+f1(sy+h*.72);}
   q('.rl-ridge').setAttribute('d',ridge);q('.rl-belly').setAttribute('d',belly);
   // 비늘: 몸통 굽이를 따라 줄지어, 몸통과 같은 속도로 흘러간다. 각 비늘은 꼬리쪽(오른쪽)으로 열린 반달.
   const SP=11,shift=(t*R.speed)%SP;
   el.querySelectorAll('.rl-scales').forEach(p=>{
    const r=+p.dataset.r,off=(r-2)*.36,stag=(r%2)*SP/2;let d='';
    for(let x=R.x0-SP+((-shift+stag)%SP+SP)%SP;x<=R.x1;x+=SP){
     const sy=SEA+spine(x,t),h=halfAt(x,t),y=sy+off*h*1.05,w=SP*.62,k=h*.24*(1-Math.abs(off)*.5);
     d+='M'+f1(x)+','+f1(y-k)+' Q'+f1(x+w)+','+f1(y)+' '+f1(x)+','+f1(y+k);
    }
    p.setAttribute('d',d);
   });
   // 등지느러미 마디: 일정 간격으로 등에 솟은 가시가 스쳐 지나감
   const FS=88,fsh=(t*R.speed)%FS;let fins='',rays='';
   for(let x=R.x0-FS+(FS-fsh);x<=R.x1;x+=FS){
    const L=30,wob=Math.sin(t*2.2+x*.05)*1.6,P=u=>{const xx=x+u*L,sy=SEA+spine(xx,t),h=halfAt(xx,t);return [xx,sy-h*.5,h];};
    const b0=P(0),b1=P(1),hm=P(.3)[2];
    const tip=[x+L*.55+wob,P(.4)[1]-hm*1.05],tail=[x+L*1.05+wob*.6,P(.9)[1]-hm*.32];
    fins+='M'+f1(b0[0])+','+f1(b0[1])+' Q'+f1(x+L*.12)+','+f1(tip[1]+2)+' '+f1(tip[0])+','+f1(tip[1])+' Q'+f1(x+L*.8)+','+f1(tip[1]+hm*.35)+' '+f1(tail[0])+','+f1(tail[1])+' L'+f1(b1[0])+','+f1(b1[1])+' Z';
    for(let j=1;j<=4;j++){const u=j/5,bp=P(u*.92),tp=[b0[0]+(tip[0]-b0[0])*(.4+u*.9),tip[1]+(tail[1]-tip[1])*Math.max(0,u*1.3-.25)];rays+='M'+f1(bp[0])+','+f1(bp[1])+' L'+f1(tp[0])+','+f1(tp[1]+1);}
   }
   q('.rl-fin-rays').setAttribute('d',rays);
   q('.rl-fins').setAttribute('d',fins);
   // 비늘에 걸린 빛: 정해진 자리에서 몸통과 함께 흐르며 잠깐씩 반짝
   el.querySelectorAll('.rl-glints ellipse').forEach((g,i)=>{
    const span=R.x1-R.x0,x=R.x0+((i*span/6+137*i-t*R.speed)%span+span)%span;
    const sy=SEA+spine(x,t),h=halfAt(x,t),y=sy+((i*37)%5-2)*h*.3;
    const tw=Math.max(0,Math.sin(t*(1.7+i*.31)+i*2.1));
    g.setAttribute('cx',f1(x));g.setAttribute('cy',f1(y));g.setAttribute('rx',f1(2.5+tw*6));g.setAttribute('ry',f1(.9+tw*1.4));g.setAttribute('fill','url(#rlGlim)');
    g.style.opacity=(Math.pow(tw,3)*.85).toFixed(3);
   });
   // 물빛 덮개: 수면 아래 전체(수면 곡선 따라)
   let veil='';for(let x=-20;x<=820;x+=20)veil+=(veil?' L':'M')+x+','+f1(surf(x,t,a)+1.5);
   q('.rl-veil').setAttribute('d',veil+' L820,200 L-20,200 Z');
   q('.rl-veil').style.opacity=(1-.35*near).toFixed(3);
   // 물속 붉은 빛줄기: 비스듬한 띠가 천천히 흔들리며 몸통 위를 훑는다
   el.querySelectorAll('.rl-caustic path').forEach((p,i)=>{
    const cx=((i*230+t*(14+i*5))%980)-90,sw=Math.sin(t*.9+i*1.7)*16;
    const y0=surf(cx,t,a)+2;
    p.setAttribute('d','M'+f1(cx)+','+f1(y0)+' L'+f1(cx+22)+','+f1(y0)+' L'+f1(cx+44+sw)+',200 L'+f1(cx+8+sw)+',200 Z');
    p.style.opacity=((.5+.5*Math.sin(t*1.3+i*2.3))*.13).toFixed(3);
   });
   // 수면 일렁임: 물마루를 따라 붉은 빛 조각이 흐른다
   el.querySelectorAll('.rl-glim ellipse').forEach((g,i)=>{
    const per=1.6+(i*.53)%1.4,ph=((t+i*.71)/per)%1,cyc=Math.floor((t+i*.71)/per);
    const gx=120+((cyc*131+i*197)%560)+ph*14,gy=surf(gx,t,a)+.4;
    const k=Math.sin(Math.PI*ph);
    g.setAttribute('cx',f1(gx));g.setAttribute('cy',f1(gy));g.setAttribute('rx',f1(3+k*9));g.setAttribute('ry',f1(.6+k*1.1));
    g.setAttribute('fill','url(#rlGlim)');g.style.opacity=(k*k*.85).toFixed(3);
   });
   // 몸통이 밀어 올린 너울 자국: 몸통 등 위 수면에 길게 번지는 두 줄
   el.querySelectorAll('.rl-swell').forEach((p,i)=>{
    let d='';for(let x=R.x0;x<=R.x1;x+=R.step){
     const s=surf(x,t,a),bump=Math.max(0,Math.sin((x+t*R.speed)*0.0105+i*.6));
     d+=(d?' L':'M')+f1(x)+','+f1(s+3.5+i*4-bump*1.6);
    }
    p.setAttribute('d',d);p.style.strokeOpacity=((.16-i*.05)*appear*(.6+.4*near)).toFixed(3);
   });
   // 거품: 몸통 등에서 올라와 수면에서 터진다
   const bub=el.querySelectorAll('.rl-bubbles circle'),pops=el.querySelectorAll('.rl-pops ellipse');
   bub.forEach((b,i)=>{
    const per=2.6+i*.37,ph=((t+i*1.13)/per)%1,seed=Math.floor((t+i*1.13)/per)+i*7;
    const bx=R.x0+80+(seed*173)%(R.x1-R.x0-160)-ph*per*R.speed*.35;
    const from=SEA+spine(bx,t)-halfAt(bx,t)*.5,to=surf(bx,t,a)+1.5,y=from+(to-from)*ph;
    b.setAttribute('cx',f1(bx+Math.sin(t*3+i)*1.2));b.setAttribute('cy',f1(y));b.setAttribute('r',f1(.45+ph*.75));
    b.style.opacity=(appear*(ph<.12?ph/.12:ph>.92?(1-ph)/.08:1)*.55).toFixed(3);
    if(i<pops.length){const pp=pops[i],pk=((t+i*1.13)/per)%1;const age=pk>.92?(pk-.92)/.08:0;
     pp.setAttribute('cx',f1(bx));pp.setAttribute('cy',f1(to));pp.setAttribute('rx',f1(1.5+age*7));pp.setAttribute('ry',f1(.5+age*1.4));pp.style.opacity=(age?(1-age)*.45*appear:0).toFixed(3);}
   });
  }
 };

 /* ───────── 21-02 · 불꽃 호수 ─────────
    「물이 다홍빛으로 일렁인다. 물 위로 불꽃이 솟는다. 불꽃이 가까운데 뜨겁지 않게 느껴진다.」
    · 물: 다홍빛 바다. 물마루를 따라 주황 빛이 번지고, 불꽃마다 물에 길게 비친다.
    · 불꽃: 수면에서 곧장 솟는 혀 모양 불길이 먼 곳·배 곁·앞쪽 세 겹으로 늘어서 있고, 사이사이 배가 지나갈 틈이 있다.
      가끔 불꽃들이 한꺼번에 수면 위로 낮게 눕혔다가 다시 일어선다.
    · 뜨겁지 않음: 연기·아지랑이·솟구치는 불티가 없다. 속은 희고 투명하며, 불티는 꽃잎처럼 천천히 내려앉는다. */
 THEMES[2]={
  skyTop:'#0a0507',skyMid:'#24110c',skyHorizon:'#6a2c15',
  moon:'#f2b48e',
  seaTop:'#b0401f',seaMid:'#621a0c',seaBottom:'#220704',
  crest:'#ffd8b0',swell:'#f38a52',hatch:'#ffe2c4',
  boat:'#080404',rim:'#f0b48c',
  lamp:'#ffc45a',lampCore:'#fff0c0',
  bob:1.05,drift:.85
 };
 // 불꽃 자리: [x, 수면에서의 깊이(앞쪽일수록 큼), 키, 너비, 혀 수]
 const FL={
  far:[[120,0,16,5,2],[175,0,22,6,3],[262,0,14,4,2],[318,0,19,5,2],[486,0,24,6,3],[545,0,15,4,2],[612,0,21,6,3],[688,0,17,5,2]],
  mid:[[205,3,48,11,3],[262,5,36,9,2],[478,4,54,12,3],[548,6,40,10,3],[628,3,46,11,3],[150,4,40,10,2],[700,5,44,11,3]],
  near:[[176,48,40,13,3],[318,56,30,11,2],[452,52,36,12,3],[600,46,42,13,3]]
 };
 // 잠깐씩 다 함께 낮게 눕는 주기(약 12초): 높이 1 → 0.22, 너비 1 → 1.5
 function lie(t){
  const c=((t+4)%12)/12;
  const k=c<.62?0:c<.72?(c-.62)/.1:c<.88?1:1-(c-.88)/.12;
  return k*k*(3-2*k);
 }
 function tongue(x,y,h,w,sway){
  const tx=x+sway,ty=y-h;
  return 'M'+f1(x-w)+','+f1(y)+
   ' C'+f1(x-w*1.15)+','+f1(y-h*.32)+' '+f1(x-w*.35+sway*.45)+','+f1(y-h*.62)+' '+f1(tx)+','+f1(ty)+
   ' C'+f1(x+w*.4+sway*.5)+','+f1(y-h*.58)+' '+f1(x+w*1.1)+','+f1(y-h*.3)+' '+f1(x+w)+','+f1(y)+
   ' Q'+f1(x)+','+f1(y+w*.3)+' '+f1(x-w)+','+f1(y)+'Z';
 }
 function flameGroup(cls,n){let s='';for(let i=0;i<n;i++)s+='<g class="fl-one '+cls+'" data-i="'+i+'"><path class="fl-o"/><path class="fl-m"/><path class="fl-c"/><path class="fl-w"/><ellipse class="fl-base"/></g>';return s;}
 const FDEFS=
  '<linearGradient id="flO" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#ff5a24" stop-opacity=".95"/><stop offset=".55" stop-color="#ff3c1e" stop-opacity=".55"/><stop offset="1" stop-color="#e02814" stop-opacity="0"/></linearGradient>'+
  '<linearGradient id="flM" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#ffb860"/><stop offset=".6" stop-color="#ff8a3a" stop-opacity=".7"/><stop offset="1" stop-color="#ff6a2a" stop-opacity="0"/></linearGradient>'+
  '<linearGradient id="flC" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#e8f6ff"/><stop offset=".18" stop-color="#fffaf0"/><stop offset=".55" stop-color="#ffe8c8" stop-opacity=".75"/><stop offset="1" stop-color="#ffd0a0" stop-opacity="0"/></linearGradient>'+
  '<radialGradient id="flGlow"><stop stop-color="#ff9a50" stop-opacity=".55"/><stop offset=".45" stop-color="#ff6a2a" stop-opacity=".18"/><stop offset="1" stop-color="#ff4a1a" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="flRef" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffc888" stop-opacity=".75"/><stop offset=".5" stop-color="#ff7a3a" stop-opacity=".3"/><stop offset="1" stop-color="#ff5a24" stop-opacity="0"/></linearGradient>';
 LAYERS[2]={
  sky(th){
   return '<defs>'+FDEFS+
     '<linearGradient id="fbHaze" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a0401c" stop-opacity="0"/><stop offset=".65" stop-color="#d0602a" stop-opacity=".2"/><stop offset="1" stop-color="#ff8a40" stop-opacity=".38"/></linearGradient>'+
    '</defs>'+
    '<rect x="0" y="70" width="800" height="66" fill="url(#fbHaze)"/>'+
    '<g class="fl-far">'+flameGroup('far',FL.far.length)+'</g>';
  },
  under(th){
   let refl='',glow='';
   for(let i=0;i<FL.mid.length+FL.far.length;i++)refl+='<path class="fl-refl"/>';
   for(let i=0;i<FL.mid.length;i++)glow+='<ellipse class="fl-glow" fill="url(#flGlow)"/>';
   return '<g class="fl-refls" fill="url(#flRef)">'+refl+'</g><g class="fl-glows">'+glow+'</g>'+
    '<g class="fl-mid">'+flameGroup('mid',FL.mid.length)+'</g>';
  },
  surface(th){
   let refl='',glow='',pet='';
   for(let i=0;i<FL.near.length;i++){refl+='<path class="fl-refl n"/>';glow+='<ellipse class="fl-glow n" fill="url(#flGlow)"/>';}
   for(let i=0;i<14;i++)pet+='<ellipse/>';
   return '<g class="fl-refls n" fill="url(#flRef)">'+refl+'</g><g class="fl-glows n">'+glow+'</g>'+
    '<g class="fl-near">'+flameGroup('near',FL.near.length)+'</g>'+
    '<g class="fl-petals">'+pet+'</g>'+
    '<path class="fl-crest"/>';
  },
  paint(el,c){
   const {t,a,surf,SEA}=c;
   const L=lie(t),appear=Math.min(1,Math.max(0,(t-.3)/2.4));
   const draw=(sel,list,tier)=>{
    el.querySelectorAll(sel).forEach(g=>{
     const i=+g.dataset.i,F=list[i];if(!F)return;
     const [x,dep,H,Wd,n]=F,seed=i*1.73+tier*5.1;
     const by=tier===0?SEA-15.5+Math.sin(x*.0062+.8)*2:surf(x,t,a)+dep+(tier===2?Math.sin(t*.9+i)*1.2:0);
     const rise=appear*(1-.78*L),wide=1+.5*L;
     const ps=g.children;let o='',m='',cc='';
     for(let k=0;k<n;k++){
      const off=(k-(n-1)/2)*Wd*.9,sd=seed+k*2.37;
      const fl=.82+.1*Math.sin(t*8.3+sd)+.07*Math.sin(t*13.1+sd*1.7)+.05*Math.sin(t*21+sd*.6);
      const h=H*(k===Math.floor(n/2)?1:.68+.12*Math.sin(sd))*fl*rise,w=Wd*(k===Math.floor(n/2)?1:.72)*wide;
      const sw=(Math.sin(t*2.1+sd)*.55+Math.sin(t*5.3+sd*1.3)*.2)*w+L*w*1.8;   // 누울 때는 한쪽으로 기울어 늘어짐
      const bx=x+off*wide;
      o+=tongue(bx,by,h,w,sw);m+=tongue(bx,by,h*.72,w*.68,sw*.8);cc+=tongue(bx,by+.5,h*.42,w*.36,sw*.55);
     }
     // 떨어져 나간 불꽃 조각: 가운데 혀 끝에서 떨어져 위로 조금 떠오르다 사라짐
     let wd='';const hm=H*rise;
     for(let k=0;k<2;k++){const per=.9+k*.37,ph=((t+seed*.31+k*.45)/per)%1,wx=x+Math.sin(t*2.1+seed)*Wd*.5+L*Wd*1.6+(k?Wd*.4:-Wd*.3),wy=by-hm*(1.02+ph*.35),ws=Wd*.28*(1-ph)*(1-.7*L);
      if(ws>.2)wd+='M'+f1(wx)+','+f1(wy-ws*2.6)+' Q'+f1(wx+ws)+','+f1(wy)+' '+f1(wx)+','+f1(wy+ws*.8)+' Q'+f1(wx-ws)+','+f1(wy)+' '+f1(wx)+','+f1(wy-ws*2.6)+'Z';}
     ps[0].setAttribute('d',o);ps[1].setAttribute('d',m);ps[2].setAttribute('d',cc);ps[3].setAttribute('d',wd);
     ps[4].setAttribute('cx',f1(x));ps[4].setAttribute('cy',f1(by+.5));ps[4].setAttribute('rx',f1(Wd*(n*.4+.3)*wide));ps[4].setAttribute('ry',f1(Wd*.22+.4));
     g.style.opacity=(appear*(tier===0?.8:1)).toFixed(3);
    });
   };
   draw('.fl-one.far',FL.far,0);draw('.fl-one.mid',FL.mid,1);draw('.fl-one.near',FL.near,2);
   // 물에 비친 불꽃: 끊어졌다 이어지는 세로 띠
   const refl=(nodes,list,tier,startIdx)=>{
    list.forEach((F,j)=>{
     const p=nodes[startIdx+j];if(!p)return;
     const [x,dep,H,Wd]=F,by=tier===0?SEA-15.5+Math.sin(x*.0062+.8)*2:surf(x,t,a)+dep;
     const len=Math.min(tier===0?10:tier===1?36:26,H*.9)*(1-.6*L)*appear,w=Wd*(tier===0?.7:1)*(1+.4*L);
     // 물결에 끊긴 비침: 위는 넓고 밝게, 아래로 갈수록 가늘게 흩어짐. 조각마다 길이·폭·흔들림이 다르다.
     let d='';const seg=8;let y=by+1.5;
     for(let s=0;s<seg;s++){
      const u=s/seg,hh=len/seg*(.45+.35*Math.sin(t*2.7+s*2.1+j*1.3)+.2),ww=w*(1.05-u*.75)*(.75+.25*Math.sin(t*3.9+s*1.37+j)),sx=Math.sin(t*2.2+s*1.1+j)*w*.4*(.3+u);
      d+='M'+f1(x-ww+sx)+','+f1(y)+' Q'+f1(x+sx)+','+f1(y-hh*.25)+' '+f1(x+ww+sx)+','+f1(y)+' Q'+f1(x+sx+ww*.2)+','+f1(y+hh*.9)+' '+f1(x-ww+sx)+','+f1(y)+'Z';
      y+=len/seg*(.9+.25*Math.sin(s*1.9+t));
     }
     p.setAttribute('d',d);p.style.opacity=((.6+.25*Math.sin(t*4+j*2))*(tier===0?.5:1)).toFixed(3);
    });
   };
   const R1=el.querySelectorAll('.fl-refls:not(.n) .fl-refl');refl(R1,FL.mid,1,0);refl(R1,FL.far,0,FL.mid.length);
   refl(el.querySelectorAll('.fl-refls.n .fl-refl'),FL.near,2,0);
   // 불꽃 밑동 둘레 빛무리(뜨겁지 않은, 고요한 빛)
   const glow=(nodes,list,tier)=>nodes.forEach((e,j)=>{const F=list[j];if(!F)return;const [x,dep,H,Wd]=F,by=surf(x,t,a)+dep;
    e.setAttribute('cx',f1(x));e.setAttribute('cy',f1(by));e.setAttribute('rx',f1(Wd*4.2*(1+.3*L)));e.setAttribute('ry',f1(Wd*1.1));
    e.style.opacity=(appear*(.7+.15*Math.sin(t*6+j))*(1-.35*L)).toFixed(3);});
   glow(el.querySelectorAll('.fl-glows:not(.n) .fl-glow'),FL.mid,1);glow(el.querySelectorAll('.fl-glows.n .fl-glow'),FL.near,2);
   // 불티: 위로 솟지 않고, 꽃잎처럼 흔들리며 천천히 내려앉는다
   el.querySelectorAll('.fl-petals ellipse').forEach((e,i)=>{
    const per=7+(i%5)*1.3,ph=((t+i*1.9)/per)%1,cyc=Math.floor((t+i*1.9)/per);
    const x0=150+((cyc*157+i*263)%500),x=x0+Math.sin(ph*7+i)*12+ph*18,y=40+ph*(SEA-30)+Math.sin(ph*11+i)*3;
    const tw=.5+.5*Math.sin(t*5+i*2.3);
    e.setAttribute('cx',f1(x));e.setAttribute('cy',f1(y));e.setAttribute('rx',f1(1.1+tw*.6));e.setAttribute('ry',f1(.55));
    e.setAttribute('transform','rotate('+f1(Math.sin(t*2+i)*50)+' '+f1(x)+' '+f1(y)+')');
    e.style.opacity=(appear*(ph<.1?ph/.1:ph>.85?(1-ph)/.15:1)*(.35+.5*tw)).toFixed(3);
   });
   // 물마루를 따라 번지는 주황 빛
   let cr='';for(let x=-20;x<=820;x+=10)cr+=(cr?' L':'M')+x+','+f1(surf(x,t,a));
   const crest=el.querySelector('.fl-crest');crest.setAttribute('d',cr);crest.style.strokeDashoffset=f1(-t*18);
  }
 };

 // 붉은 호수 전용 색(위 공통 CSS가 푸른 톤으로 고정한 부분만 덮는다)
 const css=
  '.lakefx[data-lake="1"]{background:#0c0407;border-color:#6b3a40;box-shadow:inset 0 0 65px #0a0204,0 8px 30px #0008}'+
  '.lakefx[data-lake="1"] .lfx-horizon{stroke:#e0858a;stroke-opacity:.22}'+
  '.lakefx[data-lake="1"] .lfx-mist rect{fill:#e3a0a0;opacity:.07}'+
  '.lakefx[data-lake="1"] .lfx-corner{background:linear-gradient(90deg,#120408b8,transparent 22%,transparent 78%,#120408b8),linear-gradient(0deg,#0c0306dd,transparent 26%,transparent 76%,#10050aaa)}'+
  '.lakefx[data-lake="1"] .lfx-vignette{box-shadow:inset 0 0 70px 16px #0d0306}'+
  '.lakefx[data-lake="1"] .lfx-grain{background:repeating-linear-gradient(0deg,transparent 0 2px,#ffd8d00b 3px 4px)}'+
  '.lakefx[data-lake="1"] .lfx-top{color:#efc8c4}'+
  '.lakefx .rl-shadow{fill:#12030a;opacity:.55}'+
  '.lakefx .rl-scales{fill:none;stroke:#ff9c96;stroke-width:.8;stroke-opacity:.46;stroke-linecap:round}'+
  '.lakefx .rl-scales[data-r="0"],.lakefx .rl-scales[data-r="4"]{stroke-opacity:.2}'+
  '.lakefx .rl-ridge{fill:none;stroke:#2c040b;stroke-width:3.2;stroke-opacity:.7;stroke-linejoin:round}'+
  '.lakefx .rl-belly{fill:none;stroke:#ffb0a4;stroke-width:.9;stroke-opacity:.22}'+
  '.lakefx .rl-fins{stroke:#f07a7c;stroke-width:.7;stroke-opacity:.45;stroke-linejoin:round}'+
  '.lakefx .rl-fin-rays{fill:none;stroke:#ff9c94;stroke-width:.5;stroke-opacity:.35;stroke-linecap:round}'+
  '.lakefx .rl-glints ellipse{mix-blend-mode:screen}'+
  '.lakefx .rl-caustic path{fill:#ff7a78;mix-blend-mode:screen}'+
  '.lakefx .rl-glim ellipse{mix-blend-mode:screen}'+
  '.lakefx .rl-swell{fill:none;stroke:#f1a39c;stroke-width:1.1;stroke-linecap:round}'+
  '.lakefx .rl-bubbles circle{fill:#ffd8cc;fill-opacity:.25;stroke:#ffd0c4;stroke-width:.4}'+
  '.lakefx .rl-pops ellipse{fill:none;stroke:#ffc4b8;stroke-width:.7}'+
  '.lakefx[data-lake="2"]{background:#0e0605;border-color:#7a4a34;box-shadow:inset 0 0 65px #0c0402,0 8px 30px #0008}'+
  '.lakefx[data-lake="2"] .lfx-horizon{stroke:#ffb080;stroke-opacity:.24}'+
  '.lakefx[data-lake="2"] .lfx-mist rect{fill:#ffc8a0;opacity:.05}'+
  '.lakefx[data-lake="2"] .lfx-corner{background:linear-gradient(90deg,#140806b8,transparent 22%,transparent 78%,#140806b8),linear-gradient(0deg,#100503dd,transparent 26%,transparent 76%,#120806aa)}'+
  '.lakefx[data-lake="2"] .lfx-vignette{box-shadow:inset 0 0 70px 16px #100503}'+
  '.lakefx[data-lake="2"] .lfx-grain{background:repeating-linear-gradient(0deg,transparent 0 2px,#ffe0c80b 3px 4px)}'+
  '.lakefx[data-lake="2"] .lfx-top{color:#ffd8bc}'+
  '.lakefx .fl-o{fill:url(#flO)}.lakefx .fl-m{fill:url(#flM)}.lakefx .fl-c{fill:url(#flC)}.lakefx .fl-w{fill:#ffa860;opacity:.7}.lakefx .fl-base{fill:none;stroke:#dff2ff;stroke-width:.6;stroke-opacity:.22}'+
  
  
  '.lakefx .fl-petals ellipse{fill:#ffe6c8}'+
  '.lakefx .fl-crest{fill:none;stroke:#ffb070;stroke-width:1.6;stroke-opacity:.45;stroke-dasharray:3 26 9 44;stroke-linecap:round;mix-blend-mode:screen}';
 const st=document.createElement('style');st.id='lake-themes-v025';st.textContent=css;document.head.appendChild(st);

 if(typeof state!=='undefined'&&state.scene==='event'&&typeof render==='function')render();
})();
