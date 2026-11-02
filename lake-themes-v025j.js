/* Great Lake v0.2.5 · 호수별 진입 장면 테마 (21-41 ~ 21-45)
   진입 묘사에서 구체적인 것만 그린다(소리처럼 보이지 않는 것은 그리지 않음).
   배가 도착한 뒤에야 있어야 할 것은 도착한 뒤에 나타낸다.
   화면에 보이는 가로 범위: PC 약 x 205~595, 휴대폰 약 x 267~533 (viewBox 800). */
(function(){
 'use strict';
 const FX=window.GREAT_LAKE_FX;if(!FX||!FX.themes||!FX.layers)return;
 const THEMES=FX.themes,LAYERS=FX.layers,N=()=>window.FxNoise;
 const f1=n=>n.toFixed(1),f2=n=>n.toFixed(2),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sm=k=>{k=cl(k,0,1);return k*k*(3-2*k);};
 const R=(n)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 const toWorld=(c,p)=>{const r=c.roll*Math.PI/180;return [c.x+c.s*(p[0]*Math.cos(r)-p[1]*Math.sin(r)),c.y+c.s*(p[0]*Math.sin(r)+p[1]*Math.cos(r))];};
 const arrived=c=>{const A=FX.ENTER_SECONDS||8;return c.t<A?-1:c.t-A;};

 /* ───────── 21-41 · 비추는 호수 ─────────
    「물이 거울처럼 배와 선원의 얼굴을 비춘다. 끝이 깨지고 손잡이에 흰 천이 감긴 노가 손에서 미끄러진다.
      노는 물속으로 사라졌는데, 수면에 비친 손은 여전히 노를 쥐고 있다. 이내 물 밑에서 다른 노들이 밀려 올라온다.」
    · 물: 거울처럼 또렷하게 배와 선원을 거꾸로 비춤.
    · 노: 배가 도착한 뒤 선원이 쥔 노(끝이 갈라짐 · 손잡이에 흰 천)가 손에서 미끄러져 물속으로 사라진다.
      물에 비친 모습에서는 노가 여전히 손에 쥐어져 있다.
    · 다른 노들: 그 뒤 배 둘레 물 밑에서 노들이 하나씩 밀려 올라와 비스듬히 떠오른다. */
 THEMES[41]={
  skyTop:'#06080a',skyMid:'#151b20',skyHorizon:'#3a454e',moon:'#e8eef2',
  seaTop:'#8e9aa2',seaMid:'#4a565e',seaBottom:'#121618',
  crest:'#f0f6fa',swell:'#a8b4bc',hatch:'#ffffff',boat:'#050607',rim:'#c8d2d8',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.35,drift:.3
 };
 // 노(배 기준 좌표에서 손잡이가 원점, +x 방향으로 뻗음): 흰 천 감긴 손잡이 · 자루 · 끝이 갈라진 노깃
 const OAR=(cloth,split,dark)=>'<rect x="-1" y="-1.15" width="44" height="2.3" rx="1" fill="'+(dark?'#3e2c1a':'#8a6440')+'"/><rect x="-1" y="-1.15" width="44" height=".7" fill="#9a7448" opacity=".7"/>'+
  (cloth?'<rect x="0" y="-1.7" width="8" height="3.4" rx="1.2" fill="#e8e4da"/><path d="M1.5,-1.7 L3,1.7 M4,-1.7 L5.5,1.7 M6.5,-1.7 L7.8,1.7" stroke="#b8b2a4" stroke-width=".35"/>':'<rect x="0" y="-1.4" width="6" height="2.8" rx="1.1" fill="#3a2614"/>')+
  '<path d="M42,-1.2 L48,-3.6 L60,-3.6 Q63,-2 63,0 Q63,2 60,3.6 L48,3.6 L42,1.2 Z" fill="'+(dark?'#4a3420':'#9a7044')+'"/>'+
  (split?'<path d="M63,0 L55,-.4 L52.5,0 L55,.4 Z" fill="#141414"/><path d="M48,-3.6 L60,-3.6" stroke="#b08860" stroke-width=".4"/>':'<path d="M48,-3.6 L60,-3.6" stroke="#b08860" stroke-width=".4"/>');
 const HAND=[31,-22],HOLD=58;   // 쥔 손 · 노 기울기(도)
 const RISE=[[262,30,-64,1.2],[318,46,-72,1.5],[452,38,-58,1.3],[500,22,-70,1.05],[548,50,-62,1.45],[402,58,-76,1.6]];   // [x, 수면 아래 깊이, 각도, 크기]
 LAYERS[41]={
  under(th){
   let rs='';RISE.forEach((r,i)=>rs+='<g class="rf-rise" data-i="'+i+'"><g class="rf-pos"><g clip-path="url(#rfAbove)"><g class="rf-oar">'+OAR(false,R(i)<.4,true)+'</g></g></g><ellipse class="rf-ring"/></g>');
   return '<defs><clipPath id="rfAbove"><rect x="-120" y="-120" width="240" height="120.5"/></clipPath></defs><g class="rf-rises">'+rs+'</g>';
  },
  surface(th){
   // 물에 비친 노는 배의 비친 모습보다 위에 그려야 보임(물 아래만)
   return '<g clip-path="url(#lfxBelow)"><g class="rf-ref" opacity=".85"><g class="rf-ref-oar">'+OAR(true,true)+'</g></g></g><g clip-path="url(#lfxAbove)"><g class="rf-held">'+OAR(true,true)+'</g></g>'+
    '<g clip-path="url(#lfxBelow)"><g class="rf-sink" opacity=".35">'+OAR(true,true)+'</g></g><ellipse class="rf-slipring"/>';
  },
  paint(el,c){
   const {t,a,surf}=c,ta=arrived(c);
   const held=el.querySelector('.rf-held'),sink=el.querySelector('.rf-sink'),ref=el.querySelector('.rf-ref'),refOar=el.querySelector('.rf-ref-oar');
   // 물에 비친 노: 비친 손에 늘 쥐어져 있음(도착 뒤 나타나 그대로 남음)
   const show=ta<0?0:sm(ta/.5);
   ref.setAttribute('transform','translate('+f2(c.x)+' '+f2(c.y+1.5)+') rotate('+f2(-c.roll)+') scale('+c.s+' '+f2(-c.s*.8)+')');
   refOar.setAttribute('transform','translate('+HAND[0]+' '+HAND[1]+') rotate('+(180-HOLD)+')');refOar.style.opacity=show.toFixed(2);
   // 실제 노: 쥐고 있다가 미끄러져 물속으로
   const slip=ta<0?0:sm((ta-2.6)/1.7);   // 한동안 쥐고 있다가 미끄러짐
   const tf='translate('+f2(c.x)+' '+f2(c.y)+') rotate('+f2(c.roll)+') scale('+c.s+') translate('+HAND[0]+' '+HAND[1]+') rotate('+f1(180-HOLD-slip*10)+') translate('+f1(slip*58)+' 0)';
   held.setAttribute('transform',tf);sink.setAttribute('transform',tf);
   held.style.opacity=(show*(1-sm((ta-3.9)/.4))).toFixed(2);sink.style.opacity=(show*.35*(1-sm((ta-4.1)/.8))).toFixed(2);
   const sr=el.querySelector('.rf-slipring'),hp=toWorld(c,[HAND[0]-22,8]);const rk=(ta-3.3)/1.6;
   if(rk>0&&rk<1){sr.setAttribute('cx',f1(hp[0]));sr.setAttribute('cy',f1(surf(hp[0],t,a)+1));sr.setAttribute('rx',f1(4+rk*20));sr.setAttribute('ry',f1(1+rk*3));sr.style.opacity=((1-rk)*.6).toFixed(2);}else sr.style.opacity='0';
   // 다른 노들이 물 밑에서 밀려 올라옴
   el.querySelectorAll('.rf-rise').forEach(g=>{const i=+g.dataset.i,[x0,dep,ang,sc]=RISE[i],st=5.6+i*.9,k=ta<0?0:sm((ta-st)/2.2);
    if(k<=0){g.style.opacity='0';return;}g.style.opacity='1';
    const x=x0+Math.sin(t*.4+i)*2,y=surf(x,t,a)+dep*.5+Math.sin(t*1.3+i)*.6,len=(1-k)*60;
    g.querySelector('.rf-pos').setAttribute('transform','translate('+f1(x)+' '+f1(y)+')');
    g.querySelector('.rf-oar').setAttribute('transform','rotate('+f1(ang+Math.sin(t*.9+i)*2)+') scale('+f2(sc)+') translate('+f1(-30-len)+' 0)');
    const rg=g.querySelector('.rf-ring');rg.setAttribute('cx',f1(x));rg.setAttribute('cy',f1(y+.5));rg.setAttribute('rx',f1((5+k*6+Math.sin(t*2+i))*sc));rg.setAttribute('ry',f1(1.3*sc));rg.style.opacity=(.5*k).toFixed(2);
   });
  }
 };

 /* ───────── 21-42 · 부표 호수 ─────────
    「물이 버찌빛이다. 물 너머로 부표가 줄지어 떠 있다. 부표는 붉은 것도 있고 흰 것도 있다.」
    · 물: 버찌빛(검붉은 자줏빛).
    · 부표: 물 너머(먼 줄)와 그 앞줄에 일정하게 줄지어 뜬 기둥 부표. 붉은 것과 흰 것이 섞여 있고, 물결에 따라 까딱인다. */
 THEMES[42]={
  skyTop:'#080406',skyMid:'#1e0a14',skyHorizon:'#4a1a2a',moon:'#f4d8e0',
  seaTop:'#7e1c36',seaMid:'#480c1e',seaBottom:'#120206',
  crest:'#f8d0dc',swell:'#9a2c48',hatch:'#ffe0e8',boat:'#070204',rim:'#e0a8b8',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.75,drift:.5
 };
 const BUOY=red=>{const m=red?'#c4243a':'#e6e2da',d=red?'#7a1222':'#9a968e',l=red?'#ff6a78':'#ffffff';
  return '<ellipse class="by-wl" cx="0" cy=".3" rx="6.5" ry="1.1"/>'+
   '<path d="M-3.4,0 L-3,-11 L3,-11 L3.4,0 Z" fill="'+m+'"/><path d="M1,-11 L1.4,0 L3.4,0 L3,-11 Z" fill="'+d+'" opacity=".7"/>'+
   '<path d="M-3.2,-5 L3.2,-5 L3.2,-3.4 L-3.2,-3.4 Z" fill="'+(red?'#e6e2da':'#c4243a')+'"/>'+
   '<path d="M-3,-11 L0,-17 L3,-11 Z" fill="'+m+'"/><path d="M0,-17 L3,-11 L1.2,-11 Z" fill="'+d+'" opacity=".6"/>'+
   '<path d="M-2.4,-10 L-2.2,-1" stroke="'+l+'" stroke-width=".5" opacity=".6"/><path d="M0,-17 L0,-19.5" stroke="#2a2a2a" stroke-width=".5"/>';};
 const BROWS=[{dy:2.4,sc:.42,step:34,off:6,layer:'under'},{dy:13,sc:.78,step:62,off:24,layer:'surface'}];
 const BUOYS=[];BROWS.forEach((r,ri)=>{for(let x=r.off;x<840;x+=r.step)BUOYS.push({x,ri,red:R(x*.7+ri*31)<.5,i:BUOYS.length});});
 const buoyG=L=>BUOYS.filter(b=>BROWS[b.ri].layer===L).map(b=>'<g class="bu" data-i="'+b.i+'"><g class="bu-ref" opacity=".25"><g transform="scale(1 -.6)">'+BUOY(b.red)+'</g></g><g class="bu-up">'+BUOY(b.red)+'</g></g>').join('');
 LAYERS[42]={
  under(th){
   const n=N();let gl='';for(let i=0;i<12;i++)gl+='<path/>';
   return '<defs>'+(n?n.pattern('buA','bu-a',{size:256,cell:40,oct:4,rgb:[255,190,210],lo:.6,hi:.92,stretch:[3,1],seed:223},320,70):'')+'</defs>'+
    (n?'<g class="bu-a"><rect x="-300" y="126" width="1700" height="80" fill="url(#buA)" opacity=".18" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g class="bu-gl">'+gl+'</g><g class="bu-far">'+buoyG('under')+'</g>';
  },
  surface(th){return '<g class="bu-near">'+buoyG('surface')+'</g>';},
  paint(el,c){
   const {t,a,surf}=c;
   const A=el.querySelector('.bu-a');if(A)A.setAttribute('transform','translate('+f1(-((t*3)%320))+' 0)');
   el.querySelectorAll('.bu-gl path').forEach((p,i)=>{const per=4.6+i%3,ph=((t+i*1.13)/per)%1,cyc=Math.floor((t+i*1.13)/per),x=120+((cyc*157+i*211)%560),y=surf(x,t,a)+5+(i%5)*9,w=9+(i%3)*8;
    p.setAttribute('d','M'+f1(x-w)+','+f1(y)+' Q'+f1(x)+','+f1(y-1)+' '+f1(x+w)+','+f1(y));p.style.opacity=(Math.sin(Math.PI*ph)*.45).toFixed(3);});
   el.querySelectorAll('.bu').forEach(g=>{const b=BUOYS[+g.dataset.i],r=BROWS[b.ri],x=b.x+Math.sin(t*.2+b.i)*1.2;
    const y=surf(x,t,a)+r.dy+Math.sin(t*1.6+b.i*1.3)*.5*r.sc,slope=(surf(x+8,t,a)-surf(x-8,t,a))/16,tilt=Math.atan(slope)*57*.9+Math.sin(t*1.2+b.i*2)*5;
    g.querySelector('.bu-up').setAttribute('transform','translate('+f1(x)+' '+f1(y)+') scale('+r.sc+') rotate('+f2(tilt)+')');
    g.querySelector('.bu-ref').setAttribute('transform','translate('+f1(x)+' '+f1(y+1.2*r.sc)+') scale('+r.sc+') rotate('+f2(-tilt)+')');});
  }
 };

 /* ───────── 21-43 · 황갈빛 호수 ─────────
    「물이 황갈빛 흙처럼 탁하다. 배에 묶인 밧줄이 물속으로 늘어져 있다. 끝에 무엇이 달려 있는지 아무도 모른다.」
    · 물: 흙탕처럼 탁한 황갈빛(떠도는 흙 결).
    · 밧줄: 고물 쪽 말뚝에 묶여 뱃전을 넘어 물속으로 늘어진 밧줄. 배가 들어오는 동안은 뒤로 끌리고, 멈추면 아래로 처진다.
      물속으로 들어간 부분은 흙탕에 묻혀 금세 보이지 않는다(끝은 그리지 않음). */
 THEMES[43]={
  skyTop:'#0a0805',skyMid:'#241a0e',skyHorizon:'#5a4426',moon:'#f4e2c4',
  seaTop:'#9a7a46',seaMid:'#5c4220',seaBottom:'#1a1006',
  crest:'#f0dcb4',swell:'#ac8a56',hatch:'#fff0d4',boat:'#070503',rim:'#d8bc94',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.7,drift:.4
 };
 LAYERS[43]={
  under(th){
   const n=N();
   return '<defs>'+(n?n.pattern('rpSilt','rp-silt',{size:256,cell:36,oct:4,rgb:[230,200,150],lo:.55,hi:.92,stretch:[2.6,1],seed:229},300,70):'')+
     (n?n.pattern('rpMud','rp-mud',{size:256,cell:70,oct:3,rgb:[50,32,12],lo:.45,hi:.9,stretch:[2.2,1],seed:233},340,70):'')+
     '<linearGradient id="rpFade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="1"/></linearGradient></defs>'+
    (n?'<g class="rp-a"><rect x="-300" y="126" width="1700" height="80" fill="url(#rpSilt)" opacity=".26" clip-path="url(#lfxBelow)"/></g><g class="rp-b"><rect x="-300" y="126" width="1700" height="80" fill="url(#rpMud)" opacity=".45" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g clip-path="url(#lfxBelow)"><path class="rp-under"/><path class="rp-under hi"/></g>';
  },
  surface(th){return '<path class="rp-rope"/><path class="rp-rope hi"/><path class="rp-knot"/><ellipse class="rp-ring"/>';},
  paint(el,c){
   const {t,a,surf}=c;
   const A=el.querySelector('.rp-a'),B=el.querySelector('.rp-b');if(A)A.setAttribute('transform','translate('+f1(-((t*2.6)%300))+' '+f1(Math.sin(t*.3)*1.2)+')');if(B)B.setAttribute('transform','translate('+f1(-340+((t*1.6)%340))+' 0)');
   // 밧줄: 고물 말뚝 → 뱃전 너머 → 물속(배가 움직이는 동안은 뒤로 끌림)
   const drag=(1-sm(c.enter))*.9+.08*Math.sin(t*.7);
   const p0=toWorld(c,[-44,-12]),p1=toWorld(c,[-50,-9]);
   const ex=p1[0]-8-drag*40,ey=surf(ex,t,a)+.6;
   const cx=(p1[0]+ex)/2-2,cy=Math.max(p1[1],ey)+3-drag*2;
   const d='M'+f1(p0[0])+','+f1(p0[1])+' L'+f1(p1[0])+','+f1(p1[1])+' Q'+f1(cx)+','+f1(cy)+' '+f1(ex)+','+f1(ey);
   el.querySelectorAll('.rp-rope').forEach(p=>p.setAttribute('d',d));
   el.querySelector('.rp-knot').setAttribute('d','M'+f1(p0[0]-1.6)+','+f1(p0[1]-1)+' L'+f1(p0[0]+1.6)+','+f1(p0[1]+1)+' M'+f1(p0[0]-1.6)+','+f1(p0[1]+1)+' L'+f1(p0[0]+1.6)+','+f1(p0[1]-1));
   // 물속 부분: 흙탕에 묻혀 금세 사라짐
   let u='M'+f1(ex)+','+f1(ey);for(let k=1;k<=8;k++){const yy=ey+k*5,xx=ex-drag*k*5+Math.sin(t*.8+k*.7)*1.6*k/8;u+=' L'+f1(xx)+','+f1(yy);}
   el.querySelectorAll('.rp-under').forEach(p=>p.setAttribute('d',u));
   const rg=el.querySelector('.rp-ring');rg.setAttribute('cx',f1(ex));rg.setAttribute('cy',f1(ey+.6));rg.setAttribute('rx',f1(4+Math.sin(t*1.8)*.6+drag*3));rg.setAttribute('ry','1');
  }
 };

 /* ───────── 21-44 · 천둥구름 호수 ─────────
    「회색 구름이 회색 물 위에 낮게 깔려 있다. 구름 속 어딘가에서 마른 소리가 난다.」
    · 하늘 · 물: 잿빛. 무거운 구름이 물 바로 위까지 낮게 깔려 천천히 흐른다(위는 엷고, 아래 밑면은 짙고 들쭉날쭉, 물에 닿을 듯한 조각구름).
    · 마른 소리(천둥)는 그리지 않는다. 번쩍임도 아직 없다(사건에서). */
 THEMES[44]={
  skyTop:'#2a2e30',skyMid:'#3e4244',skyHorizon:'#55595b',moon:'#000000',
  seaTop:'#6a6e70',seaMid:'#3a3e40',seaBottom:'#101214',
  crest:'#c8ccce',swell:'#7a7e80',hatch:'#e4e8ea',boat:'#060708',rim:'#a8acae',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.6,drift:.35
 };
 LAYERS[44]={
  sky(th){
   const n=N();if(!n)return '';
   return '<defs>'+n.pattern('tcA','tc-a',{size:256,cell:64,oct:5,rgb:[176,180,184],lo:.22,hi:.72,stretch:[3.2,1],seed:241},520,120)+
     n.pattern('tcB','tc-b',{size:256,cell:84,oct:5,rgb:[16,18,20],lo:.18,hi:.66,stretch:[3.6,1],seed:251},600,130)+
     n.pattern('tcC','tc-c',{size:256,cell:40,oct:4,rgb:[110,114,118],lo:.5,hi:.9,stretch:[4,1],seed:257},420,90)+
     '<linearGradient id="tcMask1" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff" stop-opacity=".25"/><stop offset=".55" stop-color="#fff" stop-opacity=".9"/><stop offset=".9" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
     '<linearGradient id="tcBase" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#202426" stop-opacity="0"/><stop offset=".6" stop-color="#202426" stop-opacity=".85"/><stop offset="1" stop-color="#2a2e30" stop-opacity=".6"/></linearGradient>'+
     '<mask id="tcM" maskContentUnits="userSpaceOnUse"><rect x="-400" y="10" width="1600" height="112" fill="url(#tcMask1)"/></mask></defs>'+
    '<rect x="0" y="40" width="800" height="90" fill="url(#tcBase)"/>'+
    '<g mask="url(#tcM)"><g class="tc-a"><rect x="-600" y="0" width="2000" height="130" fill="url(#tcA)" opacity=".95"/></g><g class="tc-b"><rect x="-600" y="30" width="2000" height="100" fill="url(#tcB)" opacity="1"/></g></g>'+
    '<g class="tc-c"><rect x="-600" y="106" width="2000" height="22" fill="url(#tcC)" opacity=".45" style="filter:blur(1.5px)"/></g>';
  },
  under(th){
   const n=N();let gl='';for(let i=0;i<10;i++)gl+='<path/>';
   return '<defs>'+(n?n.pattern('tcW','tc-w',{size:256,cell:44,oct:4,rgb:[200,204,208],lo:.6,hi:.92,stretch:[3,1],seed:263},320,70):'')+'</defs>'+
    (n?'<g class="tc-w"><rect x="-300" y="126" width="1700" height="80" fill="url(#tcW)" opacity=".16" clip-path="url(#lfxBelow)"/></g>':'')+'<g class="tc-gl">'+gl+'</g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const mv=(s,sp,w)=>{const e=el.querySelector(s);if(e)e.setAttribute('transform','translate('+f1(-((t*sp)%w))+' 0)');};
   mv('.tc-a',2.2,520);mv('.tc-b',3.4,600);mv('.tc-c',5,420);mv('.tc-w',2.4,320);
   el.querySelectorAll('.tc-gl path').forEach((p,i)=>{const per=5+i%3,ph=((t+i*1.2)/per)%1,cyc=Math.floor((t+i*1.2)/per),x=120+((cyc*157+i*211)%560),y=surf(x,t,a)+5+(i%5)*9,w=9+(i%3)*8;
    p.setAttribute('d','M'+f1(x-w)+','+f1(y)+' Q'+f1(x)+','+f1(y-1)+' '+f1(x+w)+','+f1(y));p.style.opacity=(Math.sin(Math.PI*ph)*.3).toFixed(3);});
  }
 };

 /* ───────── 21-45 · 갈매빛 호수 ─────────
    「물이 갈매빛이다. 수면이 고요하다. 가끔 무언가 이 물 위를 스치고 지나간다. 지나간 자리는 아무 일도 없었던 듯 도로 고요해진다.」
    · 물: 갈매빛(짙은 청록), 고요한 수면(너울 거의 없음).
    · 스치는 것: 배가 도착한 뒤 가끔, 보이지 않는 무언가가 수면을 빠르게 스치고 지나간다. 지나는 자리에 V자 물살과 물보라 한 줄기만 생기고,
      잠시 뒤 물살은 흔적 없이 가라앉는다(스치는 것 자체는 그리지 않음). */
 THEMES[45]={
  skyTop:'#040807',skyMid:'#0e1c18',skyHorizon:'#2a4038',moon:'#e0f0ea',
  seaTop:'#3a6458',seaMid:'#1c362e',seaBottom:'#06100c',
  crest:'#d8f0e6',swell:'#4a7a6c',hatch:'#e8fff6',boat:'#030605',rim:'#a8c8bc',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.22,drift:.2
 };
 const SKIM={every:7.5,speed:300,len:150};
 LAYERS[45]={
  under(th){let w='';for(let i=0;i<4;i++)w+='<path class="sk-w" data-i="'+i+'"/>';let s='';for(let i=0;i<10;i++)s+='<ellipse rx=".9" ry=".5"/>';
   return '<g class="sk-wake">'+w+'</g><g class="sk-spray">'+s+'</g><path class="sk-calm"/>';},
  paint(el,c){
   const {t,a,surf}=c,ta=arrived(c);
   const ws=el.querySelectorAll('.sk-w'),sp=el.querySelectorAll('.sk-spray ellipse'),calm=el.querySelector('.sk-calm');
   if(ta<.8){ws.forEach(p=>p.style.opacity='0');sp.forEach(p=>p.style.opacity='0');calm.style.opacity='0';return;}
   const k=Math.floor((ta-.8)/SKIM.every),dt=(ta-.8)-k*SKIM.every,dir=R(k*3.7)<.5?-1:1,dep=6+R(k*5.1)*30;
   const x0=dir<0?660:140,hx=x0+dir*dt*SKIM.speed,y=surf(hx,t,a)+dep;
   const vis=hx>100&&hx<700;
   // V자 물살: 지나간 쪽으로 벌어지며 빠르게 잦아듦
   ws.forEach((p,i)=>{const side=i%2?1:-1,lag=i<2?0:.35;let d='';
    for(let j=0;j<=12;j++){const u=j/12,back=u*SKIM.len*(1-lag*.4),xx=hx-dir*back,age=back/SKIM.speed+lag,spread=(4+u*16)*(.4+.6*(1-lag)),yy=surf(xx,t,a)+dep+side*spread*.32*(dep/30+.4);
     d+=(j?' L':'M')+f1(xx)+','+f1(yy+Math.sin(u*14-t*9)*.4*u);}
    p.setAttribute('d',d);p.style.opacity=(vis?(i<2?.7:.35)*Math.max(0,1-dt*.0):0).toFixed(2);p.style.strokeWidth=(i<2?1:.7).toFixed(1);});
   // 머리 쪽 물보라 한 줄기(무언가는 보이지 않음)
   sp.forEach((e,i)=>{if(!vis){e.style.opacity='0';return;}const ph=((t*3+i*.13)%1),xx=hx-dir*(ph*26+R(i)*6),yy=y-2-Math.sin(ph*Math.PI)*(3+R(i+4)*4);
    e.setAttribute('cx',f1(xx));e.setAttribute('cy',f1(yy));e.style.opacity=((1-ph)*.75).toFixed(2);});
   // 지나간 뒤: 잔물결 한 줄이 남았다가 1.5초쯤에 도로 고요해짐
   const pass=(dir<0?(x0-200):(600-x0))/SKIM.speed+.2,after=dt-pass;
   if(after>0&&after<1.8){let d='';for(let x=200;x<=600;x+=8){d+=(d?' L':'M')+x+','+f1(surf(x,t,a)+dep+Math.sin(x*.12+t*3)*.8*(1-after/1.8));}calm.setAttribute('d',d);calm.style.opacity=(.4*(1-after/1.8)).toFixed(2);}else calm.style.opacity='0';
  }
 };

 const css=
  '.lakefx[data-lake="41"]{background:#06080a;border-color:#6a767e}.lakefx[data-lake="41"] .lfx-top{color:#eef4f8}'+
  '.lakefx[data-lake="41"] .lfx-reflection{opacity:.85!important;filter:none}.lakefx .rf-ring,.lakefx .rf-slipring{fill:none;stroke:#f0f6fa;stroke-width:.6}'+
  '.lakefx[data-lake="42"]{background:#0a0408;border-color:#8a2a44}.lakefx[data-lake="42"] .lfx-top{color:#ffe0e8}'+
  '.lakefx .bu-gl path{fill:none;stroke:#f8d0dc;stroke-width:.9;stroke-linecap:round}.lakefx .by-wl{fill:none;stroke:#f8d0dc;stroke-width:.5;stroke-opacity:.5}'+
  '.lakefx[data-lake="43"]{background:#0c0906;border-color:#8a6a3a}.lakefx[data-lake="43"] .lfx-top{color:#f8e8cc}'+
  '.lakefx .rp-rope{fill:none;stroke:#2a1c0c;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.lakefx .rp-rope.hi{stroke:#c8a46a;stroke-width:.7;stroke-dasharray:1.4 1.2;stroke-opacity:.8}'+
  '.lakefx .rp-under{fill:none;stroke:#3a2a12;stroke-width:1.8;stroke-linecap:round;opacity:.55}.lakefx .rp-under.hi{stroke:#a88a5a;stroke-width:.6;stroke-dasharray:1.4 1.2;opacity:.35}'+
  '.lakefx .rp-knot{fill:none;stroke:#c8a46a;stroke-width:.9;stroke-linecap:round}.lakefx .rp-ring{fill:none;stroke:#f0dcb4;stroke-width:.5;stroke-opacity:.6}'+
  '.lakefx[data-lake="44"]{background:#141618;border-color:#5a5e60}.lakefx[data-lake="44"] .lfx-top{color:#e4e8ea}.lakefx[data-lake="44"] .lfx-horizon{stroke-opacity:.05}'+
  '.lakefx .tc-gl path{fill:none;stroke:#d8dcde;stroke-width:.8;stroke-linecap:round}'+
  '.lakefx[data-lake="45"]{background:#040807;border-color:#3a6a5a}.lakefx[data-lake="45"] .lfx-top{color:#e0f4ec}'+
  '.lakefx .sk-w{fill:none;stroke:#d8f0e6;stroke-linecap:round}.lakefx .sk-spray ellipse{fill:#e8fff6}.lakefx .sk-calm{fill:none;stroke:#d8f0e6;stroke-width:.6}';
 const st=document.createElement('style');st.id='lake-themes-v025j';st.textContent=css;document.head.appendChild(st);
 if(typeof state!=='undefined'&&state.scene==='event'&&typeof render==='function')render();
})();
