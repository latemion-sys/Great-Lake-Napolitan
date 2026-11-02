/* Great Lake v0.2.5 · 호수별 진입 장면 테마 (21-31 ~ 21-35)
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
 const EDGE=x=>132+Math.sin(x*0.0062+0.8)*5;   // 물 끝(배가 뜬 수면 선)의 고정 높이

 /* ───────── 21-31 · 자줏빛 호수 ─────────
    「물이 자줏빛이다. 수면이 쟁반처럼 한쪽으로 들렸다가 내려앉는다. 물 끝이 자꾸 비스듬하다. 배 한가운데에 나무 궤짝 하나가 실려 있다.」
    · 물: 자줏빛. 수면 전체(물 끝 · 물결 · 배까지)가 쟁반처럼 오른쪽이 들렸다가 출렁이며 내려앉는다.
      내려앉아도 완전히 수평으로 돌아오지 않아 물 끝이 늘 조금 비스듬하다. 기울 때마다 물결 빛이 낮은 쪽으로 쏠린다.
    · 궤짝: 배 한가운데(조타실과 작살잡이 사이) 갑판 위에 실린 나무 궤짝. 배와 함께 들어온다(실려 있는 짐).
      기울 때마다 갑판 위에서 조금 미끄러졌다 돌아온다. */
 THEMES[31]={
  skyTop:'#08050e',skyMid:'#1c1030',skyHorizon:'#4a2a5e',moon:'#ecd8f4',
  seaTop:'#9a52a8',seaMid:'#521f66',seaBottom:'#170822',
  crest:'#f4d4fa',swell:'#a462b4',hatch:'#fae2ff',boat:'#06030a',rim:'#cfa8de',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.75,drift:.45
 };
 function tilt31(t){
  const P=10.5,u=(t%P)/P;let v;
  if(u<.3)v=sm(u/.3);else if(u<.42)v=1;else{const k=(u-.42)/.58;v=Math.exp(-4.5*k)*Math.cos(k*Math.PI*2.2);}
  return {lift:v,ang:-(1.3+3.6*v)-Math.sin(t*1.7)*.12};   // 음수: 오른쪽이 들림
 }
 const CRATE=(function(){
  // 배 기준 좌표: 갑판 y=-8, 조타실 x -14~8, 작살잡이 x 22~32 → 궤짝은 x 9.4~20.6
  const x0=9.4,x1=20.6,y0=-16.6,y1=-8,dx=1.5,dy=-1.3;
  return '<ellipse cx="'+f1((x0+x1)/2+.6)+'" cy="-7.7" rx="7" ry=".7" fill="#000" opacity=".55"/>'+
   '<path d="M'+x0+','+y0+' L'+(x0+dx)+','+(y0+dy)+' L'+(x1+dx)+','+(y0+dy)+' L'+x1+','+y0+' Z" fill="url(#puCrateTop)"/>'+
   '<path d="M'+x1+','+y0+' L'+(x1+dx)+','+(y0+dy)+' L'+(x1+dx)+','+(y1+dy)+' L'+x1+','+y1+' Z" fill="#c08a52"/>'+
   '<rect x="'+x0+'" y="'+y0+'" width="'+(x1-x0)+'" height="'+(y1-y0)+'" fill="url(#puCrateFace)"/>'+
   '<path d="M'+x0+','+(y0+2.9)+' L'+x1+','+(y0+2.9)+' M'+x0+','+(y0+5.75)+' L'+x1+','+(y0+5.75)+'" stroke="#2a1608" stroke-width=".35" stroke-opacity=".8"/>'+
   '<path d="M'+(x0+1.5)+','+(y0+1.1)+' Q'+(x0+4)+','+(y0+1.5)+' '+(x0+7)+','+(y0+1)+' M'+(x0+3)+','+(y0+4.2)+' Q'+(x0+6)+','+(y0+4.6)+' '+(x1-2)+','+(y0+4)+' M'+(x0+2)+','+(y0+7.2)+' Q'+(x0+5)+','+(y0+7.6)+' '+(x1-3)+','+(y0+7)+'" stroke="#3a2210" stroke-width=".22" fill="none" stroke-opacity=".7"/>'+
   '<rect x="'+x0+'" y="'+y0+'" width="1.3" height="'+(y1-y0)+'" fill="#5a3618"/><rect x="'+(x1-1.3)+'" y="'+y0+'" width="1.3" height="'+(y1-y0)+'" fill="#7a4e26"/>'+
   '<path d="M'+(x0+1.3)+','+(y1-.4)+' L'+(x1-1.3)+','+(y0+.4)+'" stroke="#5a3618" stroke-width="1.1"/>'+
   '<path d="M'+x0+','+(y0+.6)+' L'+x0+','+y0+' L'+(x0+.9)+','+y0+' M'+x1+','+(y0+.6)+' L'+x1+','+y0+' L'+(x1-.9)+','+y0+' M'+x0+','+(y1-.6)+' L'+x0+','+y1+' L'+(x0+.9)+','+y1+' M'+x1+','+(y1-.6)+' L'+x1+','+y1+' L'+(x1-.9)+','+y1+'" stroke="#1a1a1e" stroke-width=".6" fill="none"/>'+
   [[x0+.65,y0+1.4],[x0+.65,y1-1.4],[x1-.65,y0+1.4],[x1-.65,y1-1.4]].map(p=>'<circle cx="'+f1(p[0])+'" cy="'+f1(p[1])+'" r=".28" fill="#2a2a2e"/>').join('')+
   '<path d="M'+(x1+dx)+','+(y0+dy)+' L'+(x1+dx)+','+(y1+dy)+'" stroke="#ffd08a" stroke-width=".45" stroke-opacity=".55"/>'+
   '<path d="M'+(x0+dx)+','+(y0+dy)+' L'+(x1+dx)+','+(y0+dy)+'" stroke="#ffe0b0" stroke-width=".3" stroke-opacity=".45"/>';
 })();
 LAYERS[31]={
  sky(th){
   let st='';for(let i=0;i<26;i++)st+='<circle cx="'+f1(R(i+3)*800)+'" cy="'+f1(4+R(i+40)*84)+'" r="'+f2(.3+R(i+80)*.7)+'" data-i="'+i+'"/>';
   // 쟁반이 기울 때 오른쪽 아래 귀퉁이가 비지 않도록 깊은 물빛으로 깔아 둠
   return '<g class="pu-stars">'+st+'</g><rect x="0" y="146" width="800" height="60" fill="'+th.seaBottom+'"/>';
  },
  under(th){
   const n=N();let sh='';for(let i=0;i<10;i++)sh+='<path/>';
   return '<defs>'+(n?n.pattern('puSheen','pu-sheen',{size:256,cell:42,oct:4,rgb:[246,200,255],lo:.58,hi:.93,stretch:[3.4,1],seed:71},360,70):'')+
     '<linearGradient id="puCrateFace" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#5a3a1e"/><stop offset=".6" stop-color="#8a5c32"/><stop offset="1" stop-color="#a87444"/></linearGradient>'+
     '<linearGradient id="puCrateTop" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#8a6036"/><stop offset="1" stop-color="#c89058"/></linearGradient></defs>'+
    '<g class="pu-under">'+(n?'<g class="pu-a"><rect x="-200" y="124" width="1600" height="90" fill="url(#puSheen)" opacity=".24" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g class="pu-run">'+sh+'</g></g>';
  },
  surface(th){return '<g class="pu-surf"><g class="pu-crate">'+CRATE+'</g></g>';},
  paint(el,c){
   const {t,a,surf}=c,T=tilt31(t),rot='rotate('+f2(T.ang)+' 400 '+c.SEA+')';
   // 하늘을 뺀 물 쪽 전부를 같은 축으로 기울임(물 끝 · 안개 · 물 · 물결 · 배 · 물마루 · 물 위아래 경계)
   const set=(sel,keep)=>el.querySelectorAll(sel).forEach(e=>{const base=keep?(e.getAttribute('data-tf')!=null?e.getAttribute('data-tf'):''):'';e.setAttribute('transform',rot+(base?' '+base:''));});
   ['.lfx-horizon','.lfx-water','.lfx-fars','.lfx-glint','.lfx-ripples','.lfx-wake','.lfx-crest','.lfx-clip-above','.lfx-clip-below','.pu-under'].forEach(s=>set(s));
   el.querySelectorAll('rect[fill="url(#lfxHatch)"]').forEach(e=>e.setAttribute('transform',rot));
   el.querySelectorAll('.lfx-mist rect').forEach(e=>e.setAttribute('transform',rot));
   ['.lfx-boat','.lfx-reflection'].forEach(s=>{const e=el.querySelector(s);if(!e)return;const tf=e.getAttribute('transform')||'';e.setAttribute('transform',rot+' '+tf);});
   // 기울 때 물결 빛이 낮은 쪽(왼쪽)으로 쏠림
   const A=el.querySelector('.pu-a');if(A)A.setAttribute('transform','translate('+f1(-((t*3)%360)-T.lift*46)+' '+f1(Math.sin(t*.4)*1.2)+')');
   el.querySelectorAll('.pu-run path').forEach((p,i)=>{const per=4.6+i%3,ph=((t+i*1.13)/per)%1,cyc=Math.floor((t+i*1.13)/per),x=110+((cyc*163+i*211)%580)-T.lift*38*ph,y=surf(x,t,a)+3+(i%4)*8.5,w=10+(i%3)*9;
    let d='';for(let s=0;s<=6;s++){const xx=x-w+s*w/3;d+=(s?' L':'M')+f1(xx)+','+f1(surf(xx,t,a)+3+(i%4)*8.5);}
    p.setAttribute('d',d);p.style.opacity=(Math.sin(Math.PI*ph)*.5).toFixed(3);});
   el.querySelectorAll('.pu-stars circle').forEach(e=>{const i=+e.dataset.i;e.style.opacity=(.3+.5*Math.abs(Math.sin(t*(.3+R(i+9)*.5)+i))).toFixed(2);});
   // 궤짝: 배와 함께 기울고, 갑판 위에서 낮은 쪽으로 조금 미끄러졌다 돌아옴
   const cr=el.querySelector('.pu-crate');if(cr)cr.setAttribute('transform',rot+' '+boatTf(c)+' translate('+f2(-T.lift*2.1)+' 0)');
  }
 };

 /* ───────── 21-32 · 노을빛 호수 ─────────
    「물이 노을빛이다. 해가 뱃머리 앞 물 끝에 반쯤 걸려 있다. 그 아래로 물빛이 갈리는 선이 보인다. 노를 한 번 저었다. 선이 한 번 멀어졌다.」
    · 물: 노을빛. 해 아래로 금빛 물비늘 기둥.
    · 해: 뱃머리 앞(오른쪽) 물 끝에 반쯤 걸린 해. 엷은 구름 띠가 가로지름.
    · 선: 해 아래 물 위로 물빛이 갈리는 선(선 너머는 더 짙은 자줏빛 노을 물). 배가 저어 오는 동안 조금씩 물러난다.
    · 노: 배가 도착한 뒤 작살잡이가 노를 한 번 젓는다(물에 넣고 → 당기고 → 빼냄). 그 한 번에 선이 한 번 멀어진다. */
 THEMES[32]={
  skyTop:'#160c1c',skyMid:'#5a2a38',skyHorizon:'#e8844c',moon:'#ff9a5a',
  seaTop:'#e8925a',seaMid:'#9a4a3a',seaBottom:'#2a1018',
  crest:'#ffdcae',swell:'#e8a070',hatch:'#ffe4c4',boat:'#0a0506',rim:'#f4b48a',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.7,drift:.3
 };
 const SUN={x:494,r:16};   // 화면에 보이는 범위(휴대폰 x 267~533)를 넘지 않는 뱃머리 앞
 function stroke32(ta){   // 노 한 번: 0 준비 → 넣기 → 당기기 → 빼기 → 내려놓기
  if(ta<0)return null;
  const k=(a,b)=>sm((ta-a)/(b-a));
  const show=k(0,.5);
  let bx,by,hx;
  if(ta<1.1){const u=k(.2,1.1);bx=60;by=-4+u*16;hx=36;}            // 노깃을 앞쪽 물에 넣음
  else if(ta<2.5){const u=k(1.1,2.5);bx=60-u*54;by=12;hx=36-u*10;} // 물을 뒤로 당김
  else if(ta<3.0){const u=k(2.5,3.0);bx=6-u*6;by=12-u*16;hx=26;}   // 물에서 빼냄
  else{const u=k(3.0,4.2);bx=0+u*-10;by=-4-u*4.2;hx=26+u*6;}         // 갑판 위로 눕힘
  return {show,bx,by,hx,hy:-21+(ta>3?k(3,4.2)*12.6:0),drive:ta>1.1&&ta<2.5,catchK:ta>.9&&ta<1.5?(ta-.9)/.6:-1,relK:ta>2.5&&ta<3.3?(ta-2.5)/.8:-1};
 }
 LAYERS[32]={
  sky(th){
   let cloud='';for(let i=0;i<3;i++)cloud+='<path class="sg-cl" data-i="'+i+'"/>';
   return '<defs><radialGradient id="sgSun" cx=".5" cy=".55" r=".5"><stop stop-color="#fff6d0"/><stop offset=".55" stop-color="#ffc862"/><stop offset=".85" stop-color="#ff8a40"/><stop offset="1" stop-color="#f06a34"/></radialGradient>'+
     '<radialGradient id="sgHalo"><stop stop-color="#ffb060" stop-opacity=".55"/><stop offset=".25" stop-color="#ff9050" stop-opacity=".22"/><stop offset=".6" stop-color="#e86a40" stop-opacity=".07"/><stop offset="1" stop-color="#e86a40" stop-opacity="0"/></radialGradient>'+
     '</defs>'+
    '<ellipse cx="'+SUN.x+'" cy="'+f1(EDGE(SUN.x))+'" rx="170" ry="64" fill="url(#sgHalo)"/>'+
    '<circle class="sg-sun" cx="'+SUN.x+'" cy="'+f1(EDGE(SUN.x)+1)+'" r="'+SUN.r+'" fill="url(#sgSun)"/>'+
    '<g class="sg-clouds">'+cloud+'</g>';
  },
  under(th){
   let gl='';for(let i=0;i<34;i++)gl+='<path/>';
   return '<defs><linearGradient id="sgFar" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#5a1e44" stop-opacity=".0"/><stop offset=".04" stop-color="#5a1e44" stop-opacity=".62"/><stop offset="1" stop-color="#3a0e30" stop-opacity=".72"/></linearGradient></defs>'+
    '<g clip-path="url(#lfxBelow)"><path class="sg-far" fill="url(#sgFar)"/><path class="sg-seam-glow"/><path class="sg-seam"/></g>'+
    '<g class="sg-col">'+gl+'</g>';
  },
  surface(th){
   let sp='';for(let i=0;i<9;i++)sp+='<circle r=".7"/>';
   return '<g clip-path="url(#lfxAbove)"><g class="sg-oar"><path class="sg-shaft"/><path class="sg-blade"/></g></g>'+
    '<g clip-path="url(#lfxBelow)"><g class="sg-oar-under"><path class="sg-shaft"/><path class="sg-blade"/></g></g>'+
    '<path class="sg-ring"/><g class="sg-spray">'+sp+'</g>';
  },
  paint(el,c){
   const {t,a,surf}=c,ta=arrived(c);
   // 해: 물 끝 바로 위만 보이도록(반쯤 걸림)
   el.querySelectorAll('.sg-cl').forEach(p=>{const i=+p.dataset.i,y=EDGE(SUN.x)-9-i*7-R(i)*3,x0=SUN.x-70-R(i+5)*60+Math.sin(t*.04+i)*5,w=80+R(i+9)*70,th=1.4+R(i+2)*1.6;
    p.setAttribute('d','M'+f1(x0)+','+f1(y)+' C'+f1(x0+w*.2)+','+f1(y-th)+' '+f1(x0+w*.55)+','+f1(y-th*1.5)+' '+f1(x0+w*.75)+','+f1(y-th*.6)+' Q'+f1(x0+w*.9)+','+f1(y-th*.2)+' '+f1(x0+w)+','+f1(y+.2)+' C'+f1(x0+w*.6)+','+f1(y+th*.8)+' '+f1(x0+w*.3)+','+f1(y+th*.7)+' '+f1(x0)+','+f1(y)+' Z');});
   // 물빛이 갈리는 선: 배가 저어 오는 동안 조금씩 물러나고, 노 한 번에 한 번 더 멀어짐
   const st=stroke32(ta),push=ta<0?0:sm((ta-1.25)/1.9)*30;
   const sx=SUN.x-30+30*c.enter+push*.75;
   const top0=surf(sx,t,a),seamAt=y=>sx+(y-top0)*.42+Math.sin(y*.21+t*.8)*.8;   // 물 끝에서 보는 쪽으로 내려올수록 바깥으로 벌어짐(원근)
   let seam='',glow='';for(let y=top0;y<=204;y+=4){const x=seamAt(y);seam+=(seam?' L':'M')+f1(x)+','+f1(y);}
   el.querySelector('.sg-seam').setAttribute('d',seam);el.querySelector('.sg-seam-glow').setAttribute('d',seam);
   el.querySelector('.sg-far').setAttribute('d',seam+' L820,204 L820,'+f1(top0-8)+' Z');
   // 해 아래 물비늘 기둥: 물 끝에서 가늘고 보는 쪽으로 넓어짐, 선 너머에서는 붉게 가라앉음
   el.querySelectorAll('.sg-col path').forEach((p,i)=>{const per=1.3+(i%5)*.35,ph=((t+i*.37)/per)%1,cyc=Math.floor((t+i*.37)/per),top=surf(SUN.x,t,a),dd=R(i+cyc*3),y=top+2.5+dd*dd*68,spread=3+(y-top)*.55,
     x=SUN.x+(R(i*2+cyc*7)-.5)*2*spread,w=1.5+(y-top)*.09+R(i+cyc)*2,k=Math.sin(Math.PI*ph);
    p.setAttribute('d','M'+f1(x-w)+','+f1(y)+' L'+f1(x+w)+','+f1(y)+' L'+f1(x+w*.7)+','+f1(y+.6)+' L'+f1(x-w*.7)+','+f1(y+.6)+' Z');
    p.style.opacity=(k*(x>seamAt(y)?.35:.85)).toFixed(3);p.style.fill=x>seamAt(y)?'#ff9a6a':'#fff0c0';});
   // 노
   const ups=[el.querySelector('.sg-oar'),el.querySelector('.sg-oar-under')];
   if(!st||st.show<=0){ups.forEach(g=>g&&(g.style.opacity='0'));}else{
    const H=toWorld(c,[st.hx,st.hy]),B=toWorld(c,[st.bx,st.by]),ang=Math.atan2(B[1]-H[1],B[0]-H[0]);
    const len=Math.hypot(B[0]-H[0],B[1]-H[1]),ux=Math.cos(ang),uy=Math.sin(ang),nx=-uy,ny=ux,bl=8*c.s,bw=1.7*c.s;
    const sx0=H[0]-ux*2.5,sy0=H[1]-uy*2.5,bx0=B[0]-ux*bl,by0=B[1]-uy*bl;
    const shaft='M'+f1(sx0)+','+f1(sy0)+' L'+f1(bx0)+','+f1(by0);
    const blade='M'+f1(bx0+nx*.5)+','+f1(by0+ny*.5)+' Q'+f1(bx0+ux*bl*.5+nx*bw*1.4)+','+f1(by0+uy*bl*.5+ny*bw*1.4)+' '+f1(B[0])+','+f1(B[1])+' Q'+f1(bx0+ux*bl*.5-nx*bw*1.4)+','+f1(by0+uy*bl*.5-ny*bw*1.4)+' '+f1(bx0-nx*.5)+','+f1(by0-ny*.5)+' Z';
    ups.forEach((g,i)=>{if(!g)return;g.style.opacity=(i?.45*st.show:st.show).toFixed(3);g.querySelector('.sg-shaft').setAttribute('d',shaft);g.querySelector('.sg-blade').setAttribute('d',blade);});
    // 노깃이 물을 가를 때의 물결 · 물보라
    const ring=el.querySelector('.sg-ring'),wl=surf(B[0],t,a);
    if(st.drive||st.catchK>=0){const w=6+(st.drive?4:st.catchK*6);ring.setAttribute('d','M'+f1(B[0]-w)+','+f1(wl+1.2)+' Q'+f1(B[0])+','+f1(wl-1.4)+' '+f1(B[0]+w)+','+f1(wl+1.2));ring.style.opacity=(st.drive?.6:.6*(1-st.catchK)).toFixed(2);}else ring.style.opacity='0';
    el.querySelectorAll('.sg-spray circle').forEach((d,i)=>{const k=st.relK;if(k<0||k>1){d.style.opacity='0';return;}
     const vx=(R(i)-.6)*14,vy=6+R(i+4)*8,x=B[0]+vx*k,y=wl-(vy*k-9*k*k)*1.2;d.setAttribute('cx',f1(x));d.setAttribute('cy',f1(y));d.style.opacity=((1-k)*.85).toFixed(2);});
   }
  }
 };

 /* ───────── 21-33 · 민트빛 호수 ─────────
    「물이 민트빛으로 일렁인다. 바람이 없다. 물 위엔 우리 배뿐이다. 그런데 어디선가 물결이 밀려와 뱃전을 친다.」
    · 물: 민트빛, 물속 빛 무늬가 느리게 일렁인다. 바람이 없어 수면 자체는 잔잔하다(너울 약하게).
    · 물 위엔 배뿐: 다른 것은 그리지 않는다.
    · 물결: 배가 도착한 뒤, 아무것도 없는 앞쪽(오른쪽)에서 물결이 밀려와 뱃전을 친다(배가 들썩이고 뱃전에 물보라). */
 THEMES[33]={
  skyTop:'#040b0a',skyMid:'#0f2e29',skyHorizon:'#3a7a6a',moon:'#e0fff4',
  seaTop:'#7cd8bc',seaMid:'#2c8a76',seaBottom:'#082822',
  crest:'#ecfff8',swell:'#8ae2c8',hatch:'#f0fff8',boat:'#030807',rim:'#a8e0d0',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.32,drift:.25
 };
 const W33={every:6.2,speed:112,from:640,front:13,back:34,h:5.2};
 function waves33(c){
  const ta=arrived(c);if(ta<0)return [];
  const out=[];const n=Math.floor(ta/W33.every);
  for(let k=Math.max(0,n-2);k<=n;k++){const t0=k*W33.every+.6,dt=ta-t0;if(dt<0)continue;const wx=W33.from-dt*W33.speed;if(wx<-140)continue;
   out.push({k,wx,h:W33.h*(.85+R(k+3)*.3)*Math.min(1,dt/1.2),dt});}
  return out;
 }
 const bump33=(x,w)=>{const d=x-w.wx;return w.h*Math.exp(-Math.pow(d/(d<0?W33.front:W33.back),2));};
 LAYERS[33]={
  under(th){
   const n=N();
   return '<defs>'+(n?n.pattern('mnCau','mn-cau',{size:256,cell:22,oct:3,rgb:[230,255,246],lo:.62,hi:.9,stretch:[2.6,1],seed:83},260,60):'')+
     (n?n.pattern('mnCau2','mn-cau2',{size:256,cell:30,oct:3,rgb:[200,255,236],lo:.6,hi:.9,stretch:[2,1],seed:97},300,70):'')+'</defs>'+
    (n?'<g class="mn-a"><rect x="-300" y="126" width="1700" height="80" fill="url(#mnCau)" opacity=".2" clip-path="url(#lfxBelow)"/></g><g class="mn-b"><rect x="-300" y="126" width="1700" height="80" fill="url(#mnCau2)" opacity=".16" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g class="mn-fronts"></g>';
  },
  surface(th){let sp='';for(let i=0;i<14;i++)sp+='<ellipse rx=".8" ry=".6"/>';return '<g class="mn-humps"></g><g class="mn-spray">'+sp+'</g><path class="mn-wash"/>';},
  paint(el,c){
   const {t,a,surf}=c;
   const A=el.querySelector('.mn-a'),B=el.querySelector('.mn-b');
   if(A)A.setAttribute('transform','translate('+f1(-((t*6)%260)+Math.sin(t*.5)*6)+' '+f1(Math.sin(t*.7)*1.6)+')');
   if(B)B.setAttribute('transform','translate('+f1(-300+((t*4.4)%300))+' '+f1(Math.cos(t*.6)*1.4)+')');
   const ws=waves33(c);
   // 물마루(배가 탄 수면 위로 지나가는 물결) + 보는 쪽 물 위로 펼쳐진 물결 줄
   const humps=el.querySelector('.mn-humps'),fronts=el.querySelector('.mn-fronts');
   if(humps.childElementCount!==ws.length*2){humps.innerHTML=ws.map(()=>'<path class="mn-hump"/><path class="mn-hcrest"/>').join('');}
   if(fronts.childElementCount!==ws.length*3){fronts.innerHTML=ws.map(()=>'<path/><path/><path/>').join('');}
   ws.forEach((w,i)=>{
    let top='',bot='';for(let x=w.wx-60;x<=w.wx+110;x+=5){const y=surf(x,t,a);top+=(top?' L':'M')+f1(x)+','+f1(y-bump33(x,w));bot=' L'+f1(x)+','+f1(y+1.4)+bot;}
    const hp=humps.children[i*2],hc=humps.children[i*2+1];hp.setAttribute('d',top+bot+' Z');hc.setAttribute('d',top);
    const vis=Math.min(1,w.dt/1.2)*Math.min(1,(w.wx+140)/120);hp.style.opacity=vis.toFixed(2);hc.style.opacity=(vis*.85).toFixed(2);
    for(let j=0;j<3;j++){const p=fronts.children[i*3+j],off=j*15;let d='';
     for(let y=0;y<=64;y+=4){const yy=surf(w.wx,t,a)+3+y,xx=w.wx+off+y*.55-y*y*.004+Math.sin(y*.22+t*1.6+j)*.8;d+=(d?' L':'M')+f1(xx)+','+f1(yy);}
     p.setAttribute('d',d);p.style.opacity=(vis*(.34-j*.1)).toFixed(2);p.style.strokeWidth=(2.6-j*.6).toFixed(1);}
   });
   // 배: 물결이 지날 때 들썩이며 기울어짐
   const boat=el.querySelector('.lfx-boat');let lift=0,slope=0;
   ws.forEach(w=>{lift+=bump33(c.x,w);slope+=(bump33(c.x+12,w)-bump33(c.x-12,w))/24;});
   if(boat&&(lift>.02)){const tf=boat.getAttribute('transform')||'',r=Math.atan(-slope)*180/Math.PI*.9;
    boat.setAttribute('transform','translate(0 '+f2(-lift*.85)+') rotate('+f2(r)+' '+f2(c.x)+' '+f2(c.y)+') '+tf);
    const ref=el.querySelector('.lfx-reflection');if(ref){const rt=ref.getAttribute('transform')||'';ref.setAttribute('transform','translate(0 '+f2(lift*.5)+') rotate('+f2(-r)+' '+f2(c.x)+' '+f2(c.y)+') '+rt);}}
   // 뱃전을 칠 때: 뱃머리 옆에서 물보라가 튀고, 뱃전을 타고 물이 번짐
   const bowX=c.x+46*c.s;let hit=-1;
   ws.forEach(w=>{const ht=(W33.from-(bowX+4))/W33.speed,dt=w.dt-ht;if(dt>=0&&dt<1.4)hit=dt;});
   const wl=surf(bowX,t,a);
   el.querySelectorAll('.mn-spray ellipse').forEach((d,i)=>{if(hit<0){d.style.opacity='0';return;}const k=hit/1.1;if(k>1){d.style.opacity='0';return;}
    const vx=-4-R(i)*16,vy=10+R(i+7)*14,x=bowX+2+vx*k,y=wl-2-(vy*k-17*k*k)*1.1;d.setAttribute('cx',f1(x));d.setAttribute('cy',f1(y));d.setAttribute('rx',f2(.6+R(i+2)*.8));d.style.opacity=((1-k)*.9).toFixed(2);});
   const wash=el.querySelector('.mn-wash');
   if(hit>=0&&hit<1.4){const k=hit/1.4,x0=bowX-4-k*40,x1=bowX+2;wash.setAttribute('d','M'+f1(x0)+','+f1(surf(x0,t,a)-1-2.4*(1-k))+' Q'+f1((x0+x1)/2)+','+f1(wl-4*(1-k))+' '+f1(x1)+','+f1(wl-1));wash.style.opacity=((1-k)*.8).toFixed(2);}else wash.style.opacity='0';
  }
 };

 /* ───────── 21-34 · 새벽빛 호수 ─────────
    「물이 새벽처럼 반짝인다. 물 위에는 손바닥만 한 나무 표식들이 일정한 간격으로 떠 있다. 표식마다 놋쇠 종이 매달렸다.
      물살이 밀려올 때마다 어떤 종은 울고, 어떤 종은 입을 다문다.」
    · 물: 새벽빛(먼동 트는 분홍 · 금빛), 수면이 잘게 반짝인다.
    · 나무 표식: 작은 나무 판에 짧은 기둥과 걸이, 놋쇠 종. 먼 줄 · 가까운 두 줄로 일정한 간격(원근에 따라 크기 · 간격이 줄어듦).
    · 종: 물살이 지나갈 때 표식이 함께 흔들리고, 어떤 종은 크게 흔들리며 추가 드러나고(우는 종), 어떤 종은 매달린 채 가만히 있다(입을 다문 종).
      소리는 그리지 않는다. */
 THEMES[34]={
  skyTop:'#0a1230',skyMid:'#4a4a7a',skyHorizon:'#f2b49c',moon:'#ffe6d4',
  seaTop:'#eac2b6',seaMid:'#8a7898',seaBottom:'#1c1c36',
  crest:'#fff4ec',swell:'#f0d0c8',hatch:'#fff8f0',boat:'#06060c',rim:'#f0d8d0',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.72,drift:.5
 };
 const MARK='<ellipse class="bm-ring" cx="0" cy=".6" rx="9.5" ry="1.4"/>'+
  '<path d="M-7,.2 L7,.2 L6.2,1.5 L-6.2,1.5 Z" fill="#3a2414"/>'+
  '<path d="M-7,.2 L-5.6,-1 L8.2,-1 L7,.2 Z" fill="#a8744a"/><path d="M-4.6,-.5 Q0,-.2 6,-.7" stroke="#6a4424" stroke-width=".25" fill="none"/>'+
  '<rect x="-.65" y="-12" width="1.3" height="11.2" fill="#5a3a20"/><rect x="-.65" y="-12" width=".45" height="11.2" fill="#8a5e36"/>'+
  '<path d="M-.7,-11.6 L5.4,-11.6" stroke="#4a2e18" stroke-width="1"/><path d="M5,-11.6 L5,-10.6" stroke="#2a2a2a" stroke-width=".5"/>'+
  '<g class="bm-bell" transform="translate(5 -10.4)"><g class="bm-sw">'+
   '<path class="bm-clap" d="M0,0 L0,5.6" stroke="#3a2a14" stroke-width=".35"/><circle class="bm-clap" cx="0" cy="5.9" r=".65" fill="#4a3418"/>'+
   '<path d="M-.5,0 Q-.6,-.5 0,-.6 Q.6,-.5 .5,0 Q1.6,.4 1.8,2.4 Q1.9,4.2 2.6,5 L-2.6,5 Q-1.9,4.2 -1.8,2.4 Q-1.6,.4 -.5,0 Z" fill="url(#bmBrass)"/>'+
   '<path d="M-2.6,5 Q0,5.6 2.6,5" stroke="#6a4a18" stroke-width=".4" fill="none"/><path d="M.9,.8 Q1.3,2.4 1.5,4.2" stroke="#fff4c8" stroke-width=".35" stroke-opacity=".7" fill="none"/>'+
  '</g></g>';
 const MROWS=[{dy:2.6,sc:.5,step:46,off:10,layer:'under'},{dy:15,sc:1.05,step:84,off:40,layer:'surface'},{dy:36,sc:1.5,step:128,off:2,layer:'surface'}];
 const MARKS=[];MROWS.forEach((r,ri)=>{for(let x=r.off;x<840;x+=r.step)MARKS.push({x,ri,i:MARKS.length});});
 const markG=(layer)=>MARKS.filter(m=>MROWS[m.ri].layer===layer).map(m=>'<g class="bm" data-i="'+m.i+'"><g class="bm-ref" opacity=".22"><g transform="scale(1 -.55)">'+MARK+'</g></g><g class="bm-up">'+MARK+'</g></g>').join('');
 LAYERS[34]={
  sky(th){
   let st='';for(let i=0;i<18;i++)st+='<circle cx="'+f1(R(i+11)*800)+'" cy="'+f1(4+R(i+31)*40)+'" r="'+f2(.3+R(i+61)*.6)+'" data-i="'+i+'"/>';
   return '<defs><radialGradient id="bmDawn" cx=".5" cy="1" r=".6"><stop stop-color="#ffd8b0" stop-opacity=".55"/><stop offset=".5" stop-color="#f4a890" stop-opacity=".16"/><stop offset="1" stop-color="#f4a890" stop-opacity="0"/></radialGradient></defs>'+
    '<g class="bm-stars">'+st+'</g><ellipse cx="160" cy="120" rx="420" ry="70" fill="url(#bmDawn)"/>';
  },
  under(th){
   let gl='';for(let i=0;i<46;i++)gl+='<ellipse/>';
   return '<defs><linearGradient id="bmBrass" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#5a3c12"/><stop offset=".35" stop-color="#b88a3a"/><stop offset=".62" stop-color="#f0cc78"/><stop offset="1" stop-color="#8a6420"/></linearGradient>'+
     '<radialGradient id="bmSpark"><stop stop-color="#fffaf0" stop-opacity=".95"/><stop offset=".5" stop-color="#ffe4cc" stop-opacity=".35"/><stop offset="1" stop-color="#ffe4cc" stop-opacity="0"/></radialGradient></defs>'+
    '<g class="bm-glit">'+gl+'</g><g class="bm-far">'+markG('under')+'</g>';
  },
  surface(th){return '<g class="bm-near">'+markG('surface')+'</g>';},
  paint(el,c){
   const {t,a,surf}=c;
   el.querySelectorAll('.bm-stars circle').forEach(e=>{const i=+e.dataset.i;e.style.opacity=(.15+.35*Math.abs(Math.sin(t*(.3+R(i)*.4)+i))).toFixed(2);});
   // 새벽빛 물비늘: 짧게 반짝였다 사라짐(보는 쪽으로 갈수록 크게)
   el.querySelectorAll('.bm-glit ellipse').forEach((p,i)=>{const per=.9+(i%6)*.25,ph=((t+i*.29)/per)%1,cyc=Math.floor((t+i*.29)/per),x=10+((cyc*149+i*233)%790),dep=R(i+cyc*5),y=surf(x,t,a)+1+dep*dep*64,k=Math.sin(Math.PI*ph);
    p.setAttribute('cx',f1(x));p.setAttribute('cy',f1(y));p.setAttribute('rx',f1((1+k*3)*(.5+dep)));p.setAttribute('ry',f1((.4+k*.7)*(.5+dep*.6)));p.setAttribute('fill','url(#bmSpark)');p.style.opacity=(k*.95).toFixed(3);});
   // 표식: 물살이 왼쪽에서 오른쪽으로 지나갈 때마다 흔들림. 종마다 그 물살에 우는지(크게 흔들림) 입을 다무는지(가만히 매달림) 다름
   el.querySelectorAll('.bm').forEach(g=>{const m=MARKS[+g.dataset.i],r=MROWS[m.ri],x=m.x+Math.sin(t*.25+m.i)*1.2;
    const ph=t-x/130,P=4.8,cyc=Math.floor(ph/P),loc=ph-cyc*P,env=Math.exp(-loc*1.15),ring=R(m.i*7+cyc*13)<.5;
    const y=surf(x,t,a)+r.dy+Math.sin(t*1.5+m.i)*.35*r.sc-env*Math.sin(Math.min(loc,1)*Math.PI)*1.6*r.sc;
    const rock=env*Math.sin(loc*4.2)*7+Math.sin(t*1.1+m.i)*1.2;
    g.querySelector('.bm-up').setAttribute('transform','translate('+f1(x)+' '+f1(y)+') scale('+r.sc+') rotate('+f2(rock)+')');
    g.querySelector('.bm-ref').setAttribute('transform','translate('+f1(x)+' '+f1(y+1.6*r.sc)+') scale('+r.sc+') rotate('+f2(-rock)+')');
    const sw=ring?env*Math.sin(loc*7.2)*24:-rock*.85+Math.sin(t*.9+m.i)*.6;   // 입 다문 종: 표식과 함께 기울 뿐 스스로 흔들리지 않음
    g.querySelectorAll('.bm-sw').forEach((s,j)=>s.setAttribute('transform','rotate('+f2(j?-sw:sw)+')'));
    const rel=ring?env*(Math.sin(loc*7.2-1.1)*16-Math.sin(loc*7.2)*10):0;   // 추는 종보다 한 박자 늦게 따라감
    g.querySelectorAll('.bm-clap').forEach(cp=>{cp.setAttribute('transform','rotate('+f2(rel)+')');cp.style.opacity=ring&&env>.12?'1':'0';});
   });
  }
 };

 /* ───────── 21-35 · 두 달 호수 ─────────
    「물이 아카시아빛이다. 하늘에도 물에도 똑같은 달이 떠 있다. 어느 쪽이 먼저 떴는지 본 사람이 없다.」
    · 물: 아카시아빛(희고 연한 노란 꽃빛).
    · 두 달: 하늘의 달과 똑같은 달이 물 위에도 떠 있다. 물의 달은 비친 그림자가 아니라 같은 모양 · 같은 방향 · 같은 밝기의 또렷한 달.
      그래서 하늘의 달 바로 아래 물에는 달빛 기둥이 없다. 물의 달은 물 위를 천천히 떠다니고,
      배가 도착한 뒤에는 하늘의 달 바로 아래 자리로 천천히 옮겨 간다. */
 THEMES[35]={
  skyTop:'#04060c',skyMid:'#111a2a',skyHorizon:'#38403a',moon:'#fff8dc',
  seaTop:'#ece4b6',seaMid:'#a8a27a',seaBottom:'#26261a',
  crest:'#fffef0',swell:'#eee8c4',hatch:'#fffff2',boat:'#060604',rim:'#ece8cc',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.55,drift:.35
 };
 const MOON={x:470,y:34,r:15};   // 휴대폰에서도 보이는 자리
 const MOON_ART='<circle r="15" fill="url(#tmDisk)"/>'+
  '<path d="M-6.5,-7.5 Q-3,-9.6 .5,-7.4 Q2.6,-5.2 .4,-3.2 Q-2.6,-1.6 -5.4,-3 Q-8.4,-4.8 -6.5,-7.5 Z" fill="#b8ad84" opacity=".55"/>'+
  '<path d="M2.4,-1.4 Q6.6,-3 9.4,-.6 Q10.8,2.4 8,4 Q4.6,5 2.6,2.6 Q1.2,.6 2.4,-1.4 Z" fill="#b2a67c" opacity=".5"/>'+
  '<path d="M-8.6,2 Q-5.6,.8 -3.4,3 Q-2.4,6.2 -5.6,7.8 Q-9,8 -10,5.2 Q-10.2,3.2 -8.6,2 Z" fill="#bcb088" opacity=".45"/>'+
  '<path d="M-1,6.6 Q1.4,5.6 3.2,7.4 Q3,10 .2,10.4 Q-1.8,9.6 -1,6.6 Z" fill="#bcb088" opacity=".4"/>'+
  '<circle cx="4.6" cy="9.2" r="1.3" fill="none" stroke="#fffbe8" stroke-width=".4" opacity=".7"/><circle cx="4.6" cy="9.2" r=".9" fill="#c8bc92" opacity=".5"/>'+
  '<circle cx="-9.4" cy="-1.6" r=".8" fill="#c4b88e" opacity=".55"/><circle cx="7.6" cy="-7.8" r=".7" fill="#c4b88e" opacity=".5"/>'+
  '<circle r="15" fill="url(#tmLimb)"/>';
 LAYERS[35]={
  sky(th){
   let st='';for(let i=0;i<40;i++)st+='<circle cx="'+f1(R(i+21)*800)+'" cy="'+f1(4+R(i+51)*96)+'" r="'+f2(.3+R(i+91)*.75)+'" data-i="'+i+'"/>';
   return '<defs><radialGradient id="tmDisk" cx=".42" cy=".4" r=".62"><stop stop-color="#fffef4"/><stop offset=".6" stop-color="#f6eecc"/><stop offset="1" stop-color="#ddd1a4"/></radialGradient>'+
     '<radialGradient id="tmLimb" cx=".5" cy=".5" r=".5"><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#5a5030" stop-opacity=".28"/></radialGradient>'+
     '<radialGradient id="tmHalo"><stop stop-color="#fff8dc" stop-opacity=".32"/><stop offset=".3" stop-color="#fff8dc" stop-opacity=".1"/><stop offset="1" stop-color="#fff8dc" stop-opacity="0"/></radialGradient>'+
     '<radialGradient id="tmPool"><stop stop-color="#fffff4" stop-opacity=".55"/><stop offset=".45" stop-color="#fffbe0" stop-opacity=".2"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></radialGradient></defs>'+
    '<g class="tm-stars">'+st+'</g><circle cx="'+MOON.x+'" cy="'+MOON.y+'" r="70" fill="url(#tmHalo)"/>'+
    '<g transform="translate('+MOON.x+' '+MOON.y+')">'+MOON_ART+'</g>';
  },
  under(th){
   let gl='';for(let i=0;i<16;i++)gl+='<path/>';
   return '<g class="tm-gl">'+gl+'</g>'+
    '<g class="tm-wm"><ellipse class="tm-pool" rx="54" ry="16" fill="url(#tmPool)"/><ellipse class="tm-r1" rx="19" ry="3.4"/><ellipse class="tm-r2" rx="24" ry="4.6"/>'+
    '<g class="tm-disk">'+MOON_ART+'</g></g>';
  },
  paint(el,c){
   const {t,a,surf}=c,ta=arrived(c);
   el.querySelectorAll('.tm-stars circle').forEach(e=>{const i=+e.dataset.i;e.style.opacity=(.35+.55*Math.abs(Math.sin(t*(.35+R(i)*.6)+i))).toFixed(2);});
   el.querySelectorAll('.tm-gl path').forEach((p,i)=>{const per=4+i%4,ph=((t+i*.8)/per)%1,cyc=Math.floor((t+i*.8)/per),x=60+((cyc*157+i*199)%680),y=surf(x,t,a)+3+(i%5)*9,w=8+(i%3)*7;
    p.setAttribute('d','M'+f1(x-w)+','+f1(y)+' Q'+f1(x)+','+f1(y-1)+' '+f1(x+w)+','+f1(y));p.style.opacity=(Math.sin(Math.PI*ph)*.45).toFixed(3);});
   // 물의 달: 떠다니다가, 배가 도착한 뒤 하늘의 달 바로 아래로 천천히 옮겨 감
   const wander=300+Math.sin(t*.06)*16,go=ta<0?0:sm((ta-1)/14),x=wander+(MOON.x-wander)*go;
   const y=surf(x,t,a)+36+Math.sin(t*.9)*.5;
   const wm=el.querySelector('.tm-wm');wm.setAttribute('transform','translate('+f1(x)+' '+f1(y)+')');
   const r1=el.querySelector('.tm-r1'),r2=el.querySelector('.tm-r2'),k=(t*.35)%1;
   r1.setAttribute('rx',f1(17+k*10));r1.setAttribute('ry',f1(4+k*2.4));r1.setAttribute('cy','0');r1.style.opacity=((1-k)*.5).toFixed(2);
   const k2=(k+.5)%1;r2.setAttribute('rx',f1(17+k2*10));r2.setAttribute('ry',f1(4+k2*2.4));r2.setAttribute('cy','0');r2.style.opacity=((1-k2)*.5).toFixed(2);
   
  }
 };

 const css=
  '.lakefx[data-lake="31"]{background:#0a0610;border-color:#6a3a7e}.lakefx[data-lake="31"] .lfx-top{color:#f0d8f8}'+
  '.lakefx .pu-stars circle{fill:#f4e4ff}.lakefx .pu-run path{fill:#fae0ff}'+
  '.lakefx[data-lake="32"]{background:#160c14;border-color:#a85a3a}.lakefx[data-lake="32"] .lfx-top{color:#ffe0c4}'+
  '.lakefx .sg-cl{fill:#4a1e30;opacity:.42;filter:url(#lfxSoft)}.lakefx .sg-seam{fill:none;stroke:#ffe2b8;stroke-width:.8;stroke-opacity:.75}.lakefx .sg-seam-glow{fill:none;stroke:#ffb880;stroke-width:4;stroke-opacity:.14}'+
  '.lakefx .sg-shaft{fill:none;stroke:#8a5a34;stroke-width:1.5;stroke-linecap:round}.lakefx .sg-blade{fill:#9a6a3e;stroke:#ffd0a0;stroke-width:.35;stroke-opacity:.7}'+
  '.lakefx .sg-ring{fill:none;stroke:#ffe4c0;stroke-width:.9;stroke-linecap:round}.lakefx .sg-spray circle{fill:#ffe8c8}'+
  '.lakefx[data-lake="33"]{background:#040b0a;border-color:#3a8a74}.lakefx[data-lake="33"] .lfx-top{color:#e0fff4}'+
  '.lakefx .mn-hump{fill:#6ccaae}.lakefx .mn-hcrest{fill:none;stroke:#f0fff8;stroke-width:1.2;stroke-linecap:round;stroke-opacity:.8}'+
  '.lakefx .mn-fronts path{fill:none;stroke:#dcfff2;stroke-linecap:round;filter:url(#lfxSoft)}.lakefx .mn-spray ellipse{fill:#f0fff8}.lakefx .mn-wash{fill:none;stroke:#f0fff8;stroke-width:1.1;stroke-linecap:round}'+
  '.lakefx[data-lake="34"]{background:#0a1028;border-color:#a88a9a}.lakefx[data-lake="34"] .lfx-top{color:#fff0e8}'+
  '.lakefx .bm-stars circle{fill:#ffffff}.lakefx .bm-glit ellipse{mix-blend-mode:screen}.lakefx .bm-ring{fill:none;stroke:#fff4ec;stroke-width:.35;stroke-opacity:.5}'+
  '.lakefx[data-lake="35"]{background:#04060c;border-color:#8a8660}.lakefx[data-lake="35"] .lfx-top{color:#fffbe0}'+
  '.lakefx .tm-stars circle{fill:#fffdf0}.lakefx .tm-gl path{fill:none;stroke:#fffdf0;stroke-width:.9;stroke-linecap:round}'+
  '.lakefx .tm-r1,.lakefx .tm-r2{fill:none;stroke:#fffef4;stroke-width:.5}';
 const st=document.createElement('style');st.id='lake-themes-v025h';st.textContent=css;document.head.appendChild(st);
 if(typeof state!=='undefined'&&state.scene==='event'&&typeof render==='function')render();
})();
