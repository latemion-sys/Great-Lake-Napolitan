/* Great Lake v0.2.5 · 호수별 진입 장면 테마 (21-46 ~ 21-50)
   진입 묘사에서 구체적인 것만 그린다(소리처럼 보이지 않는 것은 그리지 않음).
   배가 도착한 뒤에야 있어야 할 것은 도착한 뒤에 나타낸다.
   화면에 보이는 가로 범위: PC 약 x 205~595, 휴대폰 약 x 267~533 (viewBox 800). 배는 x≈360 부근(뱃전 약 310~410)에 멈춘다. */
(function(){
 'use strict';
 const FX=window.GREAT_LAKE_FX;if(!FX||!FX.themes||!FX.layers)return;
 const THEMES=FX.themes,LAYERS=FX.layers,N=()=>window.FxNoise;
 const f1=n=>n.toFixed(1),f2=n=>n.toFixed(2),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sm=k=>{k=cl(k,0,1);return k*k*(3-2*k);};
 const R=(n)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 const toWorld=(c,p)=>{const r=c.roll*Math.PI/180;return [c.x+c.s*(p[0]*Math.cos(r)-p[1]*Math.sin(r)),c.y+c.s*(p[0]*Math.sin(r)+p[1]*Math.cos(r))];};
 const arrived=c=>{const A=FX.ENTER_SECONDS||8;return c.t<A?-1:c.t-A;};
 const story=()=>{try{return (typeof state!=='undefined'&&state.lakeStory)||null;}catch(e){return null;}};

 /* ───────── 21-46 · 양식하는 호수 ─────────
    「흰색과 검은색이 섞인 기묘한 물색 사이로 사각형의 양식장이 보인다. 저 멀리 후드를 눌러쓴 그림자가 무언가를 긷고 있다.」
    · 물: 흰 결과 검은 결이 섞이지 않고 마블처럼 뒤엉켜 천천히 흐른다.
    · 양식장: 물 위에 떠 있는 네모난 틀(널판 통로 · 모서리 말뚝 · 부낭 · 물속 그물). 먼 줄과 앞줄에 여럿.
    · 그림자: 먼 양식장 통로 위, 후드를 눌러쓴 검은 형체가 자루 긴 국자로 틀 안을 떠서 들어 올리고 통에 붓기를 되풀이한다. */
 THEMES[46]={
  skyTop:'#050606',skyMid:'#161a18',skyHorizon:'#3e4642',moon:'#e6ece8',
  seaTop:'#8e9894',seaMid:'#4e5652',seaBottom:'#121514',
  crest:'#f6f8f6',swell:'#b4bcb8',hatch:'#ffffff',boat:'#050605',rim:'#d0d8d4',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.45,drift:.35
 };
 // 양식장: [가운데 x, 수면 아래 깊이(앞줄일수록 큼), 앞쪽 너비, 안쪽 깊이(세로), 그림자가 선 곳?]
 const PENS=[[262,2.5,58,4.2,0],[506,3,74,5,1],[612,2,46,3.4,0],[226,26,92,13,0],[528,30,104,15,0],[168,10,60,7,0]];
 function penMarkup(i){
  return '<g class="fm-pen" data-i="'+i+'"><path class="fm-in"/><path class="fm-net"/><path class="fm-beam far"/><path class="fm-beam side"/><path class="fm-beam near"/>'+
   '<path class="fm-plank"/><path class="fm-float"/><path class="fm-post"/><path class="fm-postref"/>'+(PENS[i][4]?'<g class="fm-who"></g>':'')+'</g>';
 }
 // 후드를 눌러쓴 그림자(국자를 쥔 팔은 따로 움직임). 발이 원점, 위가 -y. 키 약 20.
 const WHO='<path class="fm-body" d="M-3.2,0 L-3.6,-4 Q-4.4,-9 -3.4,-12.4 Q-3.6,-17.6 -0.4,-19.4 Q3,-20 4.2,-16.8 Q4.8,-14.4 3.6,-12.6 Q4.4,-8 3.8,-4 L3.4,0 Z"/>'+
  '<path class="fm-hood" d="M-2.4,-13.4 Q-2.8,-18.4 0,-19.4 Q3.4,-19.8 4,-16.4 Q4.4,-14.6 3.4,-13 Q2.6,-15.6 1.4,-15.4 Q.6,-13.6 -2.4,-13.4 Z"/>'+
  '<path class="fm-fold" d="M-1.4,-11 Q-1.8,-6 -1.2,-1 M1.2,-10.6 Q1.6,-5 1.2,-.8"/>'+
  '<g class="fm-arm"><path class="fm-sleeve" d="M0,0 Q3,1.4 6,1.2 L6.2,2.6 Q2.6,3 -.6,1.6 Z"/><g class="fm-ladle"><path class="fm-pole" d="M5,1.8 L26,1.8"/><path class="fm-cup" d="M25,0 Q25,4.4 28.4,4.4 Q31.6,4.4 31.6,0 Z"/><path class="fm-load" d="M25.6,.6 Q28.4,-1.6 31,.6 Z"/></g></g>'+
  '<path class="fm-pail" d="M-9.4,-3.4 L-5.2,-3.4 L-5.8,0 L-8.8,0 Z"/><path class="fm-pailrim" d="M-9.6,-3.4 L-5,-3.4"/>';
 LAYERS[46]={
  under(th){
   const n=N();let veins='',pens='',drips='';for(let i=0;i<10;i++)veins+='<path/>';
   PENS.forEach((p,i)=>{if(p[1]<12)pens+=penMarkup(i);});for(let i=0;i<5;i++)drips+='<circle r=".55"/>';
   return '<defs>'+(n?n.pattern('fmW','fm-w',{size:256,cell:44,oct:4,rgb:[252,252,250],lo:.56,hi:.86,stretch:[4,1],seed:461},360,72):'')+
     (n?n.pattern('fmB','fm-b',{size:256,cell:52,oct:4,rgb:[6,8,7],lo:.5,hi:.84,stretch:[3.4,1],seed:467},380,76):'')+'</defs>'+
    '<g clip-path="url(#lfxBelow)">'+(n?'<g class="fm-a"><rect x="-400" y="120" width="1800" height="84" fill="url(#fmW)" opacity=".62"/></g><g class="fm-c"><rect x="-400" y="120" width="1800" height="84" fill="url(#fmB)" opacity=".82"/></g>':'')+
    '<g class="fm-veins" fill="none" stroke-linecap="round">'+veins+'</g></g>'+
    '<g class="fm-pens">'+pens+'</g><g class="fm-drips">'+drips+'</g><ellipse class="fm-dipring"/>';
  },
  surface(th){let pens='';PENS.forEach((p,i)=>{if(p[1]>=12)pens+=penMarkup(i);});return '<g class="fm-pens">'+pens+'</g>';},
  paint(el,c){
   const {t,a,surf}=c;
   const A=el.querySelector('.fm-a'),B=el.querySelector('.fm-c');
   if(A)A.setAttribute('transform','translate('+f1(-((t*3.2)%360))+' '+f1(Math.sin(t*.21)*1.4)+')');
   if(B)B.setAttribute('transform','translate('+f1(-380+((t*2.4)%380))+' '+f1(Math.sin(t*.17+1)*1.2)+')');
   // 흰 결 · 검은 결: 서로 반대로 흘러가며 꼬이는 마블 줄기
   el.querySelectorAll('.fm-veins path').forEach((p,i)=>{
    const w=i%2,y0=surf(400,t,a)+3+i*6.4+(i*i)*.12,amp=1.2+(i%4)*.9,dir=w?1:-1;let d='';
    for(let x=-20;x<=820;x+=10){const y=y0+Math.sin(x*(.018+i*.0021)+dir*t*.32+i*1.7)*amp+Math.sin(x*.061-dir*t*.5+i)*amp*.45;d+=(d?' L':'M')+x+','+f1(y);}
    p.setAttribute('d',d);p.setAttribute('stroke',w?'#fbfcfb':'#050606');p.setAttribute('stroke-width',f2((.9+(i%3)*.9)*(1+i*.08)));
    p.style.opacity=((w?.5:.7)*(.7+.3*Math.sin(t*.4+i*2.1))).toFixed(3);
   });
   el.querySelectorAll('.fm-pen').forEach(g=>{
    const i=+g.dataset.i,[cx,dep,w,dh,who]=PENS[i],sc=w/80;
    const yN=surf(cx,t,a)+dep+Math.sin(t*1.1+i)*.35*a,yF=yN-dh,wf=w*(.86-dep*.004),sk=(cx-400)*.035*dh/10;   // 먼 변은 조금 좁고 소실점 쪽으로 밀림
    const nl=cx-w/2,nr=cx+w/2,fl=cx-wf/2-sk,fr=cx+wf/2-sk,tilt=(surf(cx+20,t,a)-surf(cx-20,t,a))/40*w*.5;
    const P=(x,y)=>f1(x)+','+f1(y);
    const yNl=yN-tilt,yNr=yN+tilt,yFl=yF-tilt*.8,yFr=yF+tilt*.8,bt=1.1+sc*1.6;   // 널판 두께
    g.querySelector('.fm-in').setAttribute('d','M'+P(fl,yFl)+' L'+P(fr,yFr)+' L'+P(nr,yNr)+' L'+P(nl,yNl)+' Z');
    // 물속 그물: 틀 안에 비치는 성긴 격자
    let net='';for(let k=1;k<6;k++){const u=k/6;net+='M'+P(fl+(nl-fl)*0+(fr-fl)*u+((nr-nl)-(fr-fl))*u*0,yFl+(yFr-yFl)*u)+' L'+P(nl+(nr-nl)*u,yNl+(yNr-yNl)*u+2*sc);}
    for(let k=1;k<4;k++){const u=k/4;net+='M'+P(fl+(nl-fl)*u,yFl+(yNl-yFl)*u+1)+' L'+P(fr+(nr-fr)*u,yFr+(yNr-yFr)*u+1);}
    g.querySelector('.fm-net').setAttribute('d',net);
    g.querySelector('.fm-beam.far').setAttribute('d','M'+P(fl,yFl)+' L'+P(fr,yFr)+' L'+P(fr,yFr-bt*.7)+' L'+P(fl,yFl-bt*.7)+' Z');
    g.querySelector('.fm-beam.side').setAttribute('d','M'+P(fl,yFl)+' L'+P(nl,yNl)+' L'+P(nl,yNl-bt)+' L'+P(fl,yFl-bt*.7)+' Z M'+P(fr,yFr)+' L'+P(nr,yNr)+' L'+P(nr,yNr-bt)+' L'+P(fr,yFr-bt*.7)+' Z');
    g.querySelector('.fm-beam.near').setAttribute('d','M'+P(nl,yNl)+' L'+P(nr,yNr)+' L'+P(nr,yNr-bt)+' L'+P(nl,yNl-bt)+' Z');
    // 널판 이음매 · 부낭 · 말뚝
    let pl='';const np=Math.round(w/5);for(let k=1;k<np;k++){const u=k/np;pl+='M'+P(nl+(nr-nl)*u,yNl+(yNr-yNl)*u-bt)+' L'+P(nl+(nr-nl)*u,yNl+(yNr-yNl)*u);const uf=k/np;if(k%2)pl+='M'+P(fl+(fr-fl)*uf,yFl+(yFr-yFl)*uf-bt*.7)+' L'+P(fl+(fr-fl)*uf,yFl+(yFr-yFl)*uf);}
    g.querySelector('.fm-plank').setAttribute('d',pl);
    let fl8='';const nf=Math.max(3,Math.round(w/16));for(let k=0;k<=nf;k++){const u=k/nf,x=nl+(nr-nl)*u,y=yNl+(yNr-yNl)*u+.5,r=1.4+sc*1.6;fl8+='M'+f1(x-r)+','+f1(y)+' A'+f1(r)+','+f1(r*.45)+' 0 0 0 '+f1(x+r)+','+f1(y)+' Z';}
    g.querySelector('.fm-float').setAttribute('d',fl8);
    let po='',pr='';const ph=5+sc*9;[[nl,yNl,1],[nr,yNr,1],[fl,yFl,.72],[fr,yFr,.72]].forEach(([x,y,k],j)=>{const lean=Math.sin(t*.6+i+j)*.4;po+='M'+P(x,y)+' L'+P(x+lean,y-ph*k);pr+='M'+P(x,y+1)+' L'+P(x-lean,y+1+ph*k*.6);});
    g.querySelector('.fm-post').setAttribute('d',po);g.querySelector('.fm-post').setAttribute('stroke-width',f2(.6+sc*.9));
    g.querySelector('.fm-postref').setAttribute('d',pr);g.querySelector('.fm-postref').setAttribute('stroke-width',f2(.5+sc*.7));
    // 그림자: 먼 양식장 오른쪽 통로 위에서 긷는다(약 5.6초 주기: 굽혀 떠냄 → 들어 올림 → 통에 부음 → 섬)
    const wg=g.querySelector('.fm-who');if(wg){
     if(!wg.firstChild)wg.innerHTML='<g class="fm-whob">'+WHO+'</g>';
     const u=fr-(fr-fl)*.18,v=yFr+(yNr-yFr)*.08-bt*.7,SC=.82;
     const cy=((t+1.2)%5.6)/5.6;
     // 국자 각도(어깨 기준, 도): 위(-) · 아래(+)
     let ang,bend,load;
     if(cy<.26){const k=sm(cy/.26);ang=-30+k*92;bend=k*14;load=0;}                    // 굽히며 국자를 틀 안 물로
     else if(cy<.38){ang=62+Math.sin((cy-.26)/.12*Math.PI*2)*3;bend=14;load=0;}          // 떠냄
     else if(cy<.62){const k=sm((cy-.38)/.24);ang=62-k*112;bend=14-k*14;load=1;}         // 들어 올림
     else if(cy<.8){const k=sm((cy-.62)/.18);ang=-50+k*-26;bend=0;load=1-k;}              // 등 뒤 통 쪽으로 돌려 부음
     else{const k=sm((cy-.8)/.2);ang=-76+k*46;bend=0;load=0;}
     const flip=-1;   // 틀 안쪽(왼쪽)을 향함
     wg.querySelector('.fm-whob').setAttribute('transform','translate('+f1(u)+' '+f1(v)+') scale('+(flip*SC)+' '+SC+') rotate('+f1(bend)+' 0 0)');
     const arm=wg.querySelector('.fm-arm');arm.setAttribute('transform','translate(1.4 -12.2) rotate('+f1(ang)+')');
     wg.querySelector('.fm-load').style.opacity=load.toFixed(2);
     // 떠낸 자리의 둥근 물결 · 들어 올릴 때 떨어지는 물방울(월드 좌표)
     const rr=Math.PI/180*ang,cupL=[1.4+29*Math.cos(rr)-2*Math.sin(rr),-12.2+29*Math.sin(rr)+2*Math.cos(rr)];
     const bR=Math.PI/180*bend,cx2=cupL[0]*Math.cos(bR)-cupL[1]*Math.sin(bR),cy2=cupL[0]*Math.sin(bR)+cupL[1]*Math.cos(bR);
     const wx=u+flip*SC*cx2,wy=v+SC*cy2;
     const ring=el.querySelector('.fm-dipring'),rk=(cy-.28)/.3;
     if(rk>0&&rk<1){ring.setAttribute('cx',f1(u-12));ring.setAttribute('cy',f1(v+1.6));ring.setAttribute('rx',f1(1.5+rk*6));ring.setAttribute('ry',f1(.4+rk*1.2));ring.style.opacity=((1-rk)*.7).toFixed(2);}else ring.style.opacity='0';
     el.querySelectorAll('.fm-drips circle').forEach((d,k)=>{const dk=((cy-.4)*4.2+k*.21)%1;
      if(cy>.4&&cy<.64){d.setAttribute('cx',f1(wx+(k-2)*.4));d.setAttribute('cy',f1(wy+dk*6));d.style.opacity=((1-dk)*.8).toFixed(2);}else d.style.opacity='0';});
    }
   });
  }
 };

 /* ───────── 21-47 · 어둠 호수 ─────────
    「물이 어둠으로 뒤덮여 있다. 물 위에 등불이 점점이 떠 있다. 배가 일정한 빠르기로 나아가자 불빛이 하나씩 꺼지고 있다.」
    · 물: 어둠에 덮여 물빛이 거의 없다. 떠 있는 등불 빛이 닿는 자리만 수면이 드러난다.
    · 등불: 작은 나무 받침 위 종이 등. 안에 불꽃, 둘레에 빛무리, 물에 길게 비친 빛.
    · 배가 지나온 뒤쪽(왼쪽)부터 짙은 어둠이 배를 따라오고, 어둠이 닿은 등불부터 하나씩 꺼진다. 우리 배의 등불은 그대로. */
 THEMES[47]={
  skyTop:'#010103',skyMid:'#03050a',skyHorizon:'#080b14',moon:'#000000',
  seaTop:'#0e1320',seaMid:'#070a12',seaBottom:'#010203',
  crest:'#3a4258',swell:'#151b2a',hatch:'#5a6278',boat:'#020306',rim:'#5a5040',
  lamp:'#ffb048',lampCore:'#fff0c8',bob:.4,drift:.3
 };
 // 등불: [x, 수면 아래 깊이, 크기]  (앞줄일수록 깊고 큼)
 const LAN=[[60,2,.42],[118,9,.6],[176,3,.45],[214,16,.74],[248,4,.48],[286,24,.86],[300,6,.5],[248,34,.95],
            [440,3,.46],[470,15,.7],[508,5,.5],[548,26,.9],[580,8,.56],[624,3,.44],[660,18,.76],[700,6,.5],[452,38,1]];
 const lanG=front=>{let s='';LAN.forEach((l,i)=>{if((l[1]>=12)!==front)return;
  s+='<g class="dk-lan" data-i="'+i+'"><ellipse class="dk-halo" rx="44" ry="24" fill="url(#dkHalo)"/><g class="dk-ref"><ellipse rx="3.4" ry="15" fill="url(#dkRef)"/></g>'+
   '<g class="dk-body"><path class="dk-float" d="M-6.2,0 L6.2,0 L5,2.2 L-5,2.2 Z"/><path class="dk-floatt" d="M-6.2,0 L6.2,0"/>'+
   '<path class="dk-paper" d="M-3.8,-1 Q-4.6,-6 -3.4,-10.6 L3.4,-10.6 Q4.6,-6 3.8,-1 Z"/><path class="dk-rib" d="M-4.2,-4 L4.2,-4 M-4.3,-7.2 L4.3,-7.2"/>'+
   '<path class="dk-cap" d="M-4.2,-10.6 L4.2,-10.6 L3.2,-12.2 L-3.2,-12.2 Z"/><path class="dk-cap" d="M-4,-1 L4,-1 L4.4,0 L-4.4,0 Z"/>'+
   '<path class="dk-flame" d="M0,-2.6 Q-1.5,-4.6 0,-7.8 Q1.5,-4.6 0,-2.6 Z"/></g></g>';});return s;};
 const DK_EDGE=c=>{const ta=arrived(c);return c.x-74+(ta<0?0:sm(ta/9)*20);};   // 어둠의 앞머리: 배를 따라오다 도착 뒤 조금 더 다가옴
 LAYERS[47]={
  under(th){
   const n=N();
   return '<defs><radialGradient id="dkHalo"><stop stop-color="#ffc060" stop-opacity=".75"/><stop offset=".25" stop-color="#ff9a30" stop-opacity=".26"/><stop offset=".7" stop-color="#a05010" stop-opacity=".03"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>'+
     '<radialGradient id="dkRef"><stop stop-color="#ffc060" stop-opacity=".6"/><stop offset=".5" stop-color="#ff9a30" stop-opacity=".18"/><stop offset="1" stop-color="#ff9a30" stop-opacity="0"/></radialGradient>'+
     '<linearGradient id="dkDark" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#000" stop-opacity=".97"/><stop offset=".78" stop-color="#000" stop-opacity=".9"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>'+
     (n?n.pattern('dkSm','dk-sm',{size:256,cell:46,oct:4,rgb:[0,0,0],lo:.35,hi:.85,stretch:[1.6,1],seed:471},200,80):'')+'</defs>'+
    '<g class="dk-lans">'+lanG(false)+'</g>';
  },
  surface(th){
   const n=N();
   return '<g class="dk-lans">'+lanG(true)+'</g>'+
    // 뒤에서 배를 따라오는 짙은 어둠(수면 위로 낮게 깔린 덩어리, 앞머리는 들쭉날쭉)
    '<defs><linearGradient id="dkFX" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#fff"/><stop offset=".35" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
     '<linearGradient id="dkFY" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>'+
     '<mask id="dkMk" maskUnits="userSpaceOnUse" x="-60" y="70" width="920" height="140"><rect class="dk-mk0" x="-60" y="70" height="140" fill="#fff"/><rect class="dk-mk1" y="70" width="150" height="140" fill="url(#dkFX)"/><rect x="-60" y="70" width="920" height="44" fill="url(#dkFY)"/></mask></defs>'+
    '<g class="dk-dark" mask="url(#dkMk)"><rect x="-60" y="70" width="920" height="140" fill="#000" opacity=".95"/>'+(n?'<rect class="dk-edge" y="70" width="160" height="140" fill="url(#dkSm)"/>':'')+'</g>';
  },
  paint(el,c){
   const {t,a,surf}=c,ex=DK_EDGE(c);
   const m0=el.querySelector('.dk-mk0'),m1=el.querySelector('.dk-mk1'),fx0=ex-118+Math.sin(t*.6)*3;
   m0.setAttribute('width',f1(Math.max(0,fx0+60)));m1.setAttribute('x',f1(fx0));
   const e1=el.querySelector('.dk-edge');if(e1){e1.setAttribute('x',f1(ex-150));e1.setAttribute('transform','translate('+f1(-((t*4)%200))+' '+f1(Math.sin(t*.5)*2)+')');e1.setAttribute('width',f1(360));}
   el.querySelectorAll('.dk-lan').forEach(g=>{
    const i=+g.dataset.i,[x0,dep,sc]=LAN[i],x=x0+Math.sin(t*.3+i)*1.2,y=surf(x,t,a)+dep+Math.sin(t*1.4+i*1.7)*.5*a;
    const tilt=Math.atan((surf(x+6,t,a)-surf(x-6,t,a))/12)*57+Math.sin(t*1.1+i)*3;
    // 어둠이 닿은 정도(앞머리를 지나면 1). 꺼질 때 잠깐 흔들리다 꺼짐
    const k=sm((ex-x+2)/14),out=k>=1?1:k,fl=out<=0?1:out>=1?0:(1-out)*(.6+.4*Math.sin(t*40+i*7));
    const flick=.88+.12*Math.sin(t*9+i*3)+.05*Math.sin(t*23+i);
    const on=fl*flick;
    g.setAttribute('transform','translate('+f1(x)+' '+f1(y)+')');
    g.querySelector('.dk-body').setAttribute('transform','scale('+sc+') rotate('+f2(tilt)+')');
    g.querySelector('.dk-halo').setAttribute('transform','translate(0 '+f1(-6*sc)+') scale('+f2(sc)+')');g.querySelector('.dk-halo').style.opacity=on.toFixed(3);
    g.querySelector('.dk-ref').setAttribute('transform','translate(0 '+f1(14*sc+1)+') scale('+f2(sc*(1+.08*Math.sin(t*2+i)))+')');g.querySelector('.dk-ref').style.opacity=(on*.9).toFixed(3);
    g.querySelector('.dk-flame').style.opacity=on.toFixed(3);
    g.querySelector('.dk-paper').style.fill=out>=1?'#1a1610':'';g.querySelector('.dk-paper').style.opacity=(.25+.75*Math.max(on,.08)).toFixed(3);
    g.style.opacity=(1-.7*sm((ex-x-30)/40)).toFixed(3);   // 꺼진 등은 어둠 속으로 묻힘
   });
  }
 };

 /* ───────── 21-48 · 무지개빛 호수 ─────────
    「물이 무지개빛으로 반짝인다. 수면이 흐트러짐 없이 고르다. 앞쪽에서 물길이 갈라지고 있다.」
    · 물: 기름막처럼 얇은 무지개빛 결이 고른 수면 위로 천천히 흐르고, 작은 무지개빛 반짝임이 여기저기서 돋았다 사라진다.
    · 고른 수면: 너울·잔물결 없이 판판하다.
    · 물길: 배가 도착한 뒤, 뱃머리 앞쪽 물길이 두 갈래(먼 쪽 · 가까운 쪽)로 갈라지기 시작해 점점 벌어진다. */
 THEMES[48]={
  skyTop:'#06050a',skyMid:'#18142a',skyHorizon:'#4a4064',moon:'#f0e8ff',
  seaTop:'#a898c0',seaMid:'#5a4c78',seaBottom:'#16121f',
  crest:'#fbf6ff',swell:'#c8b8e0',hatch:'#ffffff',boat:'#060509',rim:'#e0d4f0',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.04,drift:.12
 };
 const RAIN=['#ff9ab8','#ffc890','#fff0a0','#a8f0b8','#90d8ff','#b8a8ff','#ff9ab8'];
 const rainStops=o=>RAIN.map((c,i)=>'<stop offset="'+f2(i/(RAIN.length-1))+'" stop-color="'+c+'" stop-opacity="'+o+'"/>').join('');
 LAYERS[48]={
  under(th){
   let sp='';for(let i=0;i<16;i++)sp+='<path/>';
   return '<defs><linearGradient id="rbH" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="260" y2="18" spreadMethod="repeat">'+rainStops(1)+'</linearGradient>'+
     '<linearGradient id="rbV" gradientUnits="userSpaceOnUse" x1="0" y1="128" x2="0" y2="150" spreadMethod="reflect">'+rainStops(1)+'</linearGradient>'+
     '<linearGradient id="rbLane" gradientUnits="userSpaceOnUse" x1="420" y1="0" x2="640" y2="0" spreadMethod="reflect">'+rainStops(1)+'</linearGradient>'+
     '<linearGradient id="rbFade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>'+
     '<mask id="rbM" maskUnits="userSpaceOnUse" x="-20" y="100" width="840" height="110"><rect x="-20" y="100" width="840" height="110" fill="url(#rbFade)"/></mask></defs>'+
    '<g clip-path="url(#lfxBelow)" mask="url(#rbM)"><rect class="rb-h" x="-300" y="110" width="1400" height="100" fill="url(#rbH)" opacity=".32"/>'+
    '<rect class="rb-v" x="-20" y="110" width="840" height="100" fill="url(#rbV)" opacity=".17"/>'+
    '<g class="rb-lane"><path class="rb-wedge"/><path class="rb-way a" fill="url(#rbLane)"/><path class="rb-way b" fill="url(#rbLane)"/><path class="rb-edge"/></g></g>'+
    '<g class="rb-sp">'+sp+'</g>';
  },
  paint(el,c){
   const {t,a,surf}=c,ta=arrived(c);
   el.querySelector('.rb-h').setAttribute('transform','translate('+f1(-((t*6)%260))+' 0)');
   el.querySelector('#rbV')&&el.querySelector('#rbV').setAttribute('gradientTransform','translate(0 '+f2(Math.sin(t*.25)*4)+')');
   // 무지개빛 반짝임: 네 갈래 작은 빛
   el.querySelectorAll('.rb-sp path').forEach((p,i)=>{
    const per=1.6+(i%5)*.35,ph=((t+i*.61)/per)%1,cyc=Math.floor((t+i*.61)/per),x=200+((cyc*157+i*263)%400),y=surf(x,t,a)+2+((cyc*31+i*17)%40)*.9;
    const r=(1.2+(i%3)*.7)*Math.sin(Math.PI*ph)*(1+y/400);
    p.setAttribute('d','M'+f1(x-r*2.4)+','+f1(y)+' L'+f1(x)+','+f1(y-r*.35)+' L'+f1(x+r*2.4)+','+f1(y)+' L'+f1(x)+','+f1(y+r*.35)+' Z M'+f1(x)+','+f1(y-r*1.2)+' L'+f1(x+r*.25)+','+f1(y)+' L'+f1(x)+','+f1(y+r*1.2)+' L'+f1(x-r*.25)+','+f1(y)+' Z');
    p.setAttribute('fill',RAIN[(cyc+i)%6]);p.style.opacity=(Math.sin(Math.PI*ph)*.95).toFixed(3);
   });
   // 갈라지는 물길: 도착 뒤 뱃머리 앞에서 한 줄기가 먼 쪽 · 가까운 쪽 두 갈래로 벌어진다
   const lane=el.querySelector('.rb-lane'),k=ta<0?0:sm((ta-.4)/4.2);
   if(k<=0){lane.style.opacity='0';return;}
   lane.style.opacity=f2(Math.min(1,k*3));
   const bow=toWorld(c,[52,4]),x0=bow[0]+4,y0=surf(x0,t,a)+5,fx=x0+70-k*20,fy=surf(fx,t,a)+9;   // 갈림목
   const sp=k;   // 벌어진 정도
   const upEnd=[640,surf(640,t,a)+3.2-sp*0],dnEnd=[650,surf(650,t,a)+22+sp*44];
   const half=(x)=>2.4+(x-x0)*.03;
   const Y=(x)=>surf(x,t,a);
   // 한 줄기(배 앞 ~ 갈림목) + 위 갈래 + 아래 갈래: 각각 가운데 선 둘레로 폭을 준 띠
   const band=(pts,w0,w1)=>{let up='',dn='';pts.forEach((p,j)=>{const u=j/(pts.length-1),w=w0+(w1-w0)*u;up+=(j?' L':'M')+f1(p[0])+','+f1(p[1]-w*.32);dn=' L'+f1(p[0])+','+f1(p[1]+w*.32)+dn;});return up+dn+' Z';};
   const path=(ax,ay,bx,by,cx2,cy2,n)=>{const r=[];for(let j=0;j<=n;j++){const u=j/n,x=(1-u)*(1-u)*ax+2*u*(1-u)*cx2+u*u*bx,y=(1-u)*(1-u)*ay+2*u*(1-u)*cy2+u*u*by;r.push([x,y]);}return r;};
   const trunk=path(x0,y0,fx,fy,(x0+fx)/2,(y0+fy)/2+.5,6);
   const up=path(fx,fy,upEnd[0],upEnd[1],fx+40,fy-2-sp*3,12),dn=path(fx,fy,dnEnd[0],dnEnd[1],fx+46,fy+6+sp*10,12);
   const wa=el.querySelector('.rb-way.a'),wb=el.querySelector('.rb-way.b');
   wa.setAttribute('d',band(trunk.concat(up.slice(1)),6,4));wb.setAttribute('d',band(trunk.concat(dn.slice(1)),6,16));
   wa.style.opacity=wb.style.opacity=(.55).toFixed(2);
   // 두 갈래 사이 쐐기: 무지개빛이 없는 평평한 물
   let w='M'+f1(fx+4)+','+f1(fy);up.slice(1).forEach(p=>w+=' L'+f1(p[0])+','+f1(p[1]+1.6));for(let j=dn.length-1;j>0;j--)w+=' L'+f1(dn[j][0])+','+f1(dn[j][1]-2);
   el.querySelector('.rb-wedge').setAttribute('d',w+' Z');el.querySelector('.rb-wedge').style.opacity=f2(.7*sp);
   let ed='';[up,dn].forEach((P,q)=>{P.forEach((p,j)=>{if(j>1)ed+=(j===2?'M':' L')+f1(p[0])+','+f1(p[1]+(q?-2.4-j*.25:1.4));});});
   el.querySelector('.rb-edge').setAttribute('d',ed);el.querySelector('.rb-edge').style.opacity=f2(.75*sp);
  }
 };

 /* ───────── 21-49 · 종이배 호수 ─────────
    「물이 청회빛이다. 우리 배 곁에 종이배 셋이 나란히 떠 있다. {아는 모양 셋} 종이배다. 누가 띄웠는지는 보이지 않는다.」
    · 물: 청회빛.
    · 종이배 셋: 이번 항해에서 정해진 세 모양(돛이 접힌 · 납작한 · 양끝이 뾰족한 · 뒤집힌 · 끝이 말려 올라간 중 셋)을 그대로 그린다.
      배가 멈춘 자리 바로 앞에 나란히 떠서 물결을 탄다. 접힌 자국 · 그늘진 면 · 물에 젖은 아랫단 · 물에 비친 모습. */
 THEMES[49]={
  skyTop:'#05080a',skyMid:'#151d24',skyHorizon:'#46566a',moon:'#e8f0f6',
  seaTop:'#8a9cac',seaMid:'#4a5a6a',seaBottom:'#121820',
  crest:'#eef4f8',swell:'#a8b8c6',hatch:'#ffffff',boat:'#05070a',rim:'#c8d4de',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.6,drift:.25
 };
 // 종이배 모양(물에 닿는 선이 y=0, 위가 -y, 너비 약 26). 면: 앞 판(밝음) · 옆 날개(그늘) · 돛
 const PAPER={
  '돛이 접힌':'<path class="pp-wing" d="M-13,-6 L-8,0 L8,0 L13,-6 L6,-3.2 L-6,-3.2 Z"/><path class="pp-face" d="M-13,-6 L-6,-3.2 L6,-3.2 L13,-6 L8,0 L-8,0 Z"/>'+
   '<path class="pp-sail" d="M-6,-3.2 L8.6,-7.4 L6,-3.2 Z"/><path class="pp-sailf" d="M-6,-3.2 L8.6,-7.4"/><path class="pp-crease" d="M-6,-3.2 L-8,0 M6,-3.2 L8,0 M-9.4,-4.6 L-4,-1.4 M9.4,-4.6 L4,-1.4"/>',
  '납작한':'<path class="pp-face" d="M-14,-2.4 L14,-2.4 L11,0 L-11,0 Z"/><path class="pp-wing" d="M-14,-2.4 L-6,-3.2 L6,-3.2 L14,-2.4 Z"/><path class="pp-crease" d="M-6,-3.2 L-4.6,0 M6,-3.2 L4.6,0 M0,-3.2 L0,0"/>',
  '양끝이 뾰족한':'<path class="pp-wing" d="M-15,-9 L-8,0 L8,0 L15,-9 L7,-4 L-7,-4 Z"/><path class="pp-face" d="M-15,-9 L-7,-4 L7,-4 L15,-9 L9,0 L-9,0 Z"/>'+
   '<path class="pp-sail" d="M-6,-4 L0,-14 L6,-4 Z"/><path class="pp-saild" d="M0,-14 L6,-4 L1.6,-4 Z"/><path class="pp-crease" d="M-7,-4 L-9,0 M7,-4 L9,0 M0,-14 L0,-4 M-15,-9 L-5,-1.2 M15,-9 L5,-1.2"/>',
  '뒤집힌':'<path class="pp-face" d="M-7.4,-4.6 L7.4,-4.6 L12.6,0 L-12.6,0 Z"/><path class="pp-wing" d="M-7.4,-4.6 L-4,-5.4 L4,-5.4 L7.4,-4.6 Z"/><path class="pp-crease" d="M-7.4,-4.6 L-10,0 M7.4,-4.6 L10,0 M-3,-4.6 L-5,0 M3,-4.6 L5,0"/>'+
   '<path class="pp-sunk" d="M-5,1 L0,9 L5,1 Z"/>',
  '끝이 말려 올라간':'<path class="pp-wing" d="M-11,-6 L-8,0 L8,0 L11,-6 L6,-3.6 L-6,-3.6 Z"/><path class="pp-face" d="M-11,-6 L-6,-3.6 L6,-3.6 L11,-6 L8,0 L-8,0 Z"/>'+
   '<path class="pp-curl" d="M-11,-6 C-15.6,-6.4 -16.4,-11.8 -13,-12.6 C-10.6,-13.2 -9.6,-10.6 -11.4,-9.8 C-12.6,-9.4 -13,-10.8 -12.2,-11.2 M11,-6 C15.6,-6.4 16.4,-11.8 13,-12.6 C10.6,-13.2 9.6,-10.6 11.4,-9.8 C12.6,-9.4 13,-10.8 12.2,-11.2"/>'+
   '<path class="pp-sail" d="M-6,-3.6 L0,-13 L6,-3.6 Z"/><path class="pp-saild" d="M0,-13 L6,-3.6 L1.6,-3.6 Z"/><path class="pp-crease" d="M-6,-3.6 L-8,0 M6,-3.6 L8,0 M0,-13 L0,-3.6"/>'
 };
 const PAPER_ALL=Object.keys(PAPER),PSLOT=[[312,15,1.2],[362,18,1.28],[412,15,1.2]];
 function paperShapes(){
  const st=story();let k=st&&Array.isArray(st.known)?st.known.slice(0,3):null;
  if(!k&&st&&st.vars&&st.vars['아는 모양 셋'])k=String(st.vars['아는 모양 셋']).split(', ');
  if(!k||k.length<3||k.some(x=>!PAPER[x]))k=['돛이 접힌','양끝이 뾰족한','끝이 말려 올라간'];
  if(st&&st.vars&&st.vars['아는 모양 셋']){const order=String(st.vars['아는 모양 셋']).split(', ').filter(x=>k.includes(x));if(order.length===3)k=order;}   // 묘사에 적힌 순서대로 나란히
  return k;
 }
 const paperG=(shape,i)=>'<g class="pp" data-i="'+i+'"><g clip-path="url(#lfxBelow)"><g class="pp-ref"><g transform="scale(1 -1)">'+PAPER[shape]+'</g></g></g>'+
  '<g class="pp-up">'+PAPER[shape]+'<path class="pp-wet" d="M-9,0 L9,0"/></g><ellipse class="pp-wl"/></g>';
 LAYERS[49]={
  under(th){
   const n=N();let gl='';for(let i=0;i<10;i++)gl+='<path/>';
   return '<defs>'+(n?n.pattern('ppA','pp-a',{size:256,cell:38,oct:4,rgb:[210,226,238],lo:.6,hi:.9,stretch:[3.2,1],seed:491},300,70):'')+'</defs>'+
    (n?'<g class="pp-a"><rect x="-300" y="126" width="1700" height="80" fill="url(#ppA)" opacity=".2" clip-path="url(#lfxBelow)"/></g>':'')+'<g class="pp-gl">'+gl+'</g>';
  },
  surface(th){return '<g class="pp-boats">'+paperShapes().map(paperG).join('')+'</g>';},
  paint(el,c){
   const {t,a,surf}=c;
   const A=el.querySelector('.pp-a');if(A)A.setAttribute('transform','translate('+f1(-((t*2.6)%300))+' 0)');
   el.querySelectorAll('.pp-gl path').forEach((p,i)=>{const per=4+i%3,ph=((t+i*1.31)/per)%1,cyc=Math.floor((t+i*1.31)/per),x=180+((cyc*151+i*223)%440),y=surf(x,t,a)+4+(i%5)*8,w=8+(i%3)*7;
    p.setAttribute('d','M'+f1(x-w)+','+f1(y)+' Q'+f1(x)+','+f1(y-1)+' '+f1(x+w)+','+f1(y));p.style.opacity=(Math.sin(Math.PI*ph)*.4).toFixed(3);});
   el.querySelectorAll('.pp').forEach(g=>{const i=+g.dataset.i,[x0,dep,sc]=PSLOT[i];
    const x=x0+Math.sin(t*.32+i*1.9)*1.2,y=surf(x,t,a)+dep+Math.sin(t*1.5+i*2.1)*.5*a,tilt=Math.atan((surf(x+10,t,a)-surf(x-10,t,a))/20)*57*1.2+Math.sin(t*1.2+i*1.4)*3;
    g.querySelector('.pp-up').setAttribute('transform','translate('+f1(x)+' '+f1(y)+') rotate('+f2(tilt)+') scale('+sc+')');
    g.querySelector('.pp-ref').setAttribute('transform','translate('+f1(x)+' '+f1(y+.6)+') rotate('+f2(-tilt)+') scale('+sc+' '+f2(sc*.75)+')');
    const wl=g.querySelector('.pp-wl');wl.setAttribute('cx',f1(x));wl.setAttribute('cy',f1(y+.4));wl.setAttribute('rx',f1((13+Math.sin(t*1.7+i))*sc));wl.setAttribute('ry',f1(1.4*sc));
   });
  }
 };

 /* ───────── 21-50 · 숨 쉬는 호수 ─────────
    「물이 짙은 군청빛이다. 아주 큰 것이 숨 쉬는 소리가 난다. 물이 그 박자에 맞춰 부풀었다 가라앉는다.」
    · 물: 짙은 군청빛. 소리는 그리지 않는다.
    · 부풂과 가라앉음: 수면 전체가 일정한 박자(들숨 · 멈춤 · 날숨 · 쉼)로 크게 부풀었다 가라앉고, 배도 그대로 들렸다 내려앉는다.
      부풀 때는 둥글게 솟은 물등에 빛이 길게 맺히고, 가라앉을 때는 물이 바깥으로 밀려나며 가는 물결 줄이 퍼진다. */
 THEMES[50]={
  skyTop:'#020309',skyMid:'#080d24',skyHorizon:'#1c2a5a',moon:'#d8e0ff',
  seaTop:'#2c3f86',seaMid:'#17245a',seaBottom:'#03061a',
  crest:'#c8d4ff',swell:'#4a5ea8',hatch:'#d8e0ff',boat:'#020309',rim:'#9aa8e0',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.55,drift:.2
 };
 const BR_PER=7.6;
 function breath(t){   // 0(가라앉음) ~ 1(부풂). 들숨 3.0 · 멈춤 .7 · 날숨 3.0 · 쉼 .9
  const u=((t+5)%BR_PER);
  if(u<3)return sm(u/3);if(u<3.7)return 1;if(u<6.7)return 1-sm((u-3.7)/3);return 0;
 }
 const BR_X=470;
 const swellAt=(x,t)=>breath(t)*(.55+.45*Math.exp(-Math.pow((x-BR_X)/250,2)));
 LAYERS[50]={
  surfMod(x,t){return -7.5*swellAt(x,t);},
  under(th){
   const n=N();let sheen='',rip='';for(let i=0;i<5;i++)sheen+='<path/>';for(let i=0;i<8;i++)rip+='<path/>';
   return '<defs>'+(n?n.pattern('brA','br-a',{size:256,cell:44,oct:4,rgb:[150,170,255],lo:.58,hi:.9,stretch:[3,1],seed:503},320,72):'')+
     '<radialGradient id="brDome" cx=".5" cy="0" r="1"><stop stop-color="#8aa0ff" stop-opacity=".22"/><stop offset=".5" stop-color="#4a60c0" stop-opacity=".07"/><stop offset="1" stop-color="#4a60c0" stop-opacity="0"/></radialGradient></defs>'+
    '<g clip-path="url(#lfxBelow)">'+(n?'<g class="br-a"><rect x="-300" y="110" width="1700" height="96" fill="url(#brA)" opacity=".2"/></g>':'')+
    '<ellipse class="br-dome" cx="'+BR_X+'" rx="300" ry="60" fill="url(#brDome)"/>'+
    '<g class="br-sheen" fill="none" stroke="#c8d4ff" stroke-linecap="round">'+sheen+'</g><g class="br-rip" fill="none" stroke="#b8c6ff" stroke-linecap="round">'+rip+'</g></g>';
  },
  paint(el,c){
   const {t,a,surf}=c,b=breath(t),db=(breath(t+.05)-breath(t-.05))/.1;   // 부푸는 중(+) · 가라앉는 중(-)
   const A=el.querySelector('.br-a');if(A)A.setAttribute('transform','translate('+f1(-((t*2.2)%320))+' '+f1(-7*b)+') scale(1 '+f2(1+.12*b)+')');
   const D=el.querySelector('.br-dome');D.setAttribute('cy',f1(surf(BR_X,t,a)+2));D.style.opacity=f2(.4+.6*b);
   // 부풀 때: 솟은 물등을 따라 길게 맺히는 빛
   const rise=cl(db*1.6,0,1),fall=cl(-db*1.6,0,1);
   el.querySelectorAll('.br-sheen path').forEach((p,i)=>{const w=60+i*34,dy=2+i*3.4;let d='';
    for(let x=BR_X-w;x<=BR_X+w;x+=8)d+=(d?' L':'M')+x+','+f1(surf(x,t,a)+dy+Math.sin(x*.05+t*.6+i)*.4);
    p.setAttribute('d',d);p.setAttribute('stroke-width',f2(1.1-i*.15));p.style.opacity=((.15+.35*b)*(.5+.5*rise)*(1-i*.15)).toFixed(3);});
   // 가라앉을 때: 물이 바깥으로 밀려나며 퍼지는 가는 물결 줄(양옆으로)
   const u=((t+5)%BR_PER),since=u>=3.7?u-3.7:u+BR_PER-3.7;
   el.querySelectorAll('.br-rip path').forEach((p,i)=>{const side=i%2?1:-1,k=(since-(i>>1)*.55)/3.2;
    if(k<=0||k>=1){p.style.opacity='0';return;}
    const cx=BR_X+side*(40+k*300),half=16+k*24,dy=3+(i>>1)*4+k*6;let d='';
    for(let j=-4;j<=4;j++){const x=cx+j*half/4;d+=(d?' L':'M')+f1(x)+','+f1(surf(x,t,a)+dy+(1-Math.pow(j/4,2))*-1.2);}
    p.setAttribute('d',d);p.setAttribute('stroke-width',f2(.9-k*.5));p.style.opacity=(Math.sin(Math.PI*k)*.5).toFixed(3);});
  }
 };

 const css=
  '.lakefx[data-lake="46"]{background:#070808;border-color:#7a8480}.lakefx[data-lake="46"] .lfx-top{color:#f2f4f2}'+
  '.lakefx .fm-in{fill:#2a302d;fill-opacity:.45}.lakefx .fm-net{fill:none;stroke:#c8d0cc;stroke-width:.3;stroke-opacity:.35}'+
  '.lakefx .fm-beam{fill:#5a4a36;stroke:#2a2016;stroke-width:.25}.lakefx .fm-beam.far{fill:#4a3c2c}.lakefx .fm-beam.near{fill:#7a6248}'+
  '.lakefx .fm-plank{fill:none;stroke:#2a2016;stroke-width:.3}.lakefx .fm-float{fill:#1a1d1c;stroke:#d8dedb;stroke-width:.25;stroke-opacity:.5}'+
  '.lakefx .fm-post{fill:none;stroke:#3a2e20;stroke-linecap:round}.lakefx .fm-postref{fill:none;stroke:#3a2e20;stroke-opacity:.35;stroke-linecap:round}'+
  '.lakefx .fm-body,.lakefx .fm-sleeve{fill:#030404}.lakefx .fm-hood{fill:#000}.lakefx .fm-fold{fill:none;stroke:#2a302d;stroke-width:.35}'+
  '.lakefx .fm-pole{stroke:#151210;stroke-width:.7;stroke-linecap:round}.lakefx .fm-cup{fill:#0e0c0a}.lakefx .fm-load{fill:#050505;stroke:#e8ece9;stroke-width:.25}'+
  '.lakefx .fm-pail{fill:#1c1a17}.lakefx .fm-pailrim{stroke:#6a6458;stroke-width:.4}.lakefx .fm-drips circle{fill:#e8ece9}.lakefx .fm-dipring{fill:none;stroke:#eef2ef;stroke-width:.35}'+
  '.lakefx[data-lake="47"]{background:#000;border-color:#2a3246}.lakefx[data-lake="47"] .lfx-top{color:#c8cede}.lakefx[data-lake="47"] .lfx-horizon,.lakefx[data-lake="47"] .lfx-mist{opacity:.15}'+
  '.lakefx .dk-float{fill:#1a120a}.lakefx .dk-floatt{stroke:#5a4024;stroke-width:.5}.lakefx .dk-paper{fill:#f0b860}.lakefx .dk-rib{fill:none;stroke:#8a5a20;stroke-width:.35;stroke-opacity:.6}'+
  '.lakefx .dk-cap{fill:#2a1c0e}.lakefx .dk-flame{fill:#fff4d0}'+
  '.lakefx[data-lake="48"]{background:#08060c;border-color:#9a88b8}.lakefx[data-lake="48"] .lfx-top{color:#f6f0ff}'+
  '.lakefx .rb-wedge{fill:#3a3050;fill-opacity:.7}.lakefx .rb-edge{fill:none;stroke:#fbf6ff;stroke-width:.45;stroke-linecap:round}.lakefx .rb-way{fill-opacity:.55}'+
  '.lakefx[data-lake="49"]{background:#06090c;border-color:#6a7e90}.lakefx[data-lake="49"] .lfx-top{color:#eef4f8}'+
  '.lakefx .pp-face{fill:#efeee8;stroke:#8a9298;stroke-width:.3;stroke-linejoin:round}.lakefx .pp-wing{fill:#c4c8c6;stroke:#8a9298;stroke-width:.3;stroke-linejoin:round}'+
  '.lakefx .pp-sail{fill:#f6f5f0;stroke:#8a9298;stroke-width:.3;stroke-linejoin:round}.lakefx .pp-saild{fill:#d4d6d2}.lakefx .pp-sailf{fill:none;stroke:#8a9298;stroke-width:.35}'+
  '.lakefx .pp-crease{fill:none;stroke:#9aa2a8;stroke-width:.28}.lakefx .pp-curl{fill:none;stroke:#efeee8;stroke-width:1.1;stroke-linecap:round}'+
  '.lakefx .pp-wet{stroke:#7a8c9a;stroke-width:1.1;stroke-opacity:.55}.lakefx .pp-sunk{fill:#dfe4e6;opacity:.28}.lakefx .pp-ref{opacity:.32}'+
  '.lakefx .pp-wl{fill:none;stroke:#eef4f8;stroke-width:.4;stroke-opacity:.45}.lakefx .pp-gl path{fill:none;stroke:#eef4f8;stroke-width:.8;stroke-linecap:round}'+
  '.lakefx[data-lake="50"]{background:#01020a;border-color:#3a4a8a}.lakefx[data-lake="50"] .lfx-top{color:#e0e6ff}';
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
})();
