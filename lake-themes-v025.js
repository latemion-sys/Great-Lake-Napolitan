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
  '.lakefx .rl-pops ellipse{fill:none;stroke:#ffc4b8;stroke-width:.7}';
 const st=document.createElement('style');st.id='lake-themes-v025';st.textContent=css;document.head.appendChild(st);

 if(typeof state!=='undefined'&&state.scene==='event'&&typeof render==='function')render();
})();
