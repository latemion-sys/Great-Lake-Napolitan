/* Great Lake v0.2.5 · 호수별 진입 장면 테마 (21-36 ~ 21-40)
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
 const LAMP=[51,-18.5];

 /* ───────── 21-36 · 메아리 호수 ─────────
    「물이 푸크시아빛이다. 사방이 트여 있는데 물 끝이 보이지 않는다. 배가 나아가지 못하고 물 위에서 천천히 돈다. 뱃전에 손이 닿자 작은 소리가 물 위로 멀리 퍼진다.」
    · 물: 푸크시아빛. 물 끝(수평선)이 없다 — 물빛이 그대로 하늘로 번져 올라가 어디서 끝나는지 보이지 않는다.
    · 배: 도착한 뒤 더 나아가지 못하고 제자리에서 천천히 돈다(뱃머리가 이쪽 → 정면 → 반대쪽으로 돌아감).
    · 소리는 그리지 않는다. */
 THEMES[36]={
  skyTop:'#120414',skyMid:'#4a1240',skyHorizon:'#b23a8a',moon:'#ffd0f0',
  seaTop:'#b8408e',seaMid:'#6a1a56',seaBottom:'#1c0418',
  crest:'#ffd8f2',swell:'#c85aa0',hatch:'#ffe4f6',boat:'#0a0208',rim:'#e8a8d4',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.55,drift:.15
 };
 LAYERS[36]={
  sky(th){return '<defs><linearGradient id="ecFog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b23a8a" stop-opacity="0"/><stop offset=".5" stop-color="#b8408e" stop-opacity=".85"/><stop offset=".7" stop-color="#b8408e" stop-opacity=".6"/><stop offset="1" stop-color="#b8408e" stop-opacity="0"/></linearGradient></defs>';},
  under(th){
   const n=N();let gl='';for(let i=0;i<14;i++)gl+='<path/>';
   return '<defs>'+(n?n.pattern('ecSheen','ec-sheen',{size:256,cell:46,oct:4,rgb:[255,200,240],lo:.6,hi:.93,stretch:[3.4,1],seed:113},360,70):'')+'</defs>'+
    (n?'<g class="ec-a"><rect x="-300" y="126" width="1700" height="80" fill="url(#ecSheen)" opacity=".2" clip-path="url(#lfxBelow)"/></g>':'')+'<g class="ec-gl">'+gl+'</g>'+
    // 물 끝을 지움: 배 뒤쪽(먼 쪽) 수면 선 위아래로 물빛이 하늘과 이어지는 띠
    '<rect class="ec-fog" x="-20" y="96" width="840" height="44" fill="url(#ecFog)"/>';
  },
  paint(el,c){
   const {t,a,surf}=c,ta=arrived(c);
   const A=el.querySelector('.ec-a');if(A)A.setAttribute('transform','translate('+f1(-((t*2.4)%360))+' 0)');
   el.querySelectorAll('.ec-gl path').forEach((p,i)=>{const per=4.4+i%3,ph=((t+i*1.07)/per)%1,cyc=Math.floor((t+i*1.07)/per),x=120+((cyc*151+i*223)%560),y=surf(x,t,a)+6+(i%5)*9,w=9+(i%3)*8;
    p.setAttribute('d','M'+f1(x-w)+','+f1(y)+' Q'+f1(x)+','+f1(y-1)+' '+f1(x+w)+','+f1(y));p.style.opacity=(Math.sin(Math.PI*ph)*.4).toFixed(3);});
   // 안개 띠는 배보다 뒤(먼 쪽)만 덮도록 수면 선 위쪽에 맞춤
   const fog=el.querySelector('.ec-fog');if(fog)fog.setAttribute('y',f1(surf(400,t,a)-30));
   // 제자리 회전: 도착 뒤 천천히 돌기 시작해 한 바퀴에 약 26초
   if(ta<0)return;
   const th=.242*(ta-1.6*(1-Math.exp(-ta/1.6))),cs=Math.cos(th),k=(cs<0?-1:1)*Math.max(.14,Math.abs(cs));
   const boat=el.querySelector('.lfx-boat'),ref=el.querySelector('.lfx-reflection');
   if(boat)boat.setAttribute('transform',(boat.getAttribute('transform')||'')+' scale('+f2(k)+' 1)');
   if(ref)ref.setAttribute('transform',(ref.getAttribute('transform')||'')+' scale('+f2(k)+' 1)');
   const g=el.querySelector('.lfx-glint');if(g){const lx=toWorld(c,[LAMP[0]*k,LAMP[1]])[0];g.setAttribute('cx',f1(lx));g.setAttribute('cy',f1(surf(lx,t,a)+6));}
  }
 };

 /* ───────── 21-37 · 진달래빛 호수 ─────────
    「물이 진달래빛이다. 어디선가 아이 같은 목소리가 웃는다. 목소리 주인은 어디에도 보이지 않는다.」
    · 그리는 것: 진달래빛 물(분홍 자줏빛, 꽃잎처럼 맑은 결)뿐.
    · 그리지 않는 것: 웃음소리(소리), 목소리의 주인(보이지 않음). */
 THEMES[37]={
  skyTop:'#0c0410',skyMid:'#2a0e26',skyHorizon:'#6a2a52',moon:'#ffd8ec',
  seaTop:'#e6649e',seaMid:'#9a2a62',seaBottom:'#24061a',
  crest:'#ffe0ee',swell:'#f088b8',hatch:'#ffe8f2',boat:'#0a0306',rim:'#f0b0d0',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.8,drift:.6
 };
 LAYERS[37]={
  under(th){
   const n=N();let sh='';for(let i=0;i<12;i++)sh+='<path/>';
   return '<defs>'+(n?n.pattern('jdA','jd-a',{size:256,cell:38,oct:4,rgb:[255,206,230],lo:.58,hi:.92,stretch:[3,1],seed:131},340,70):'')+
     (n?n.pattern('jdB','jd-b',{size:256,cell:64,oct:3,rgb:[90,10,50],lo:.45,hi:.9,stretch:[2.2,1],seed:149},320,70):'')+'</defs>'+
    (n?'<g class="jd-a"><rect x="-300" y="126" width="1700" height="80" fill="url(#jdA)" opacity=".24" clip-path="url(#lfxBelow)"/></g><g class="jd-b"><rect x="-300" y="126" width="1700" height="80" fill="url(#jdB)" opacity=".4" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g class="jd-sh">'+sh+'</g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const A=el.querySelector('.jd-a'),B=el.querySelector('.jd-b');
   if(A)A.setAttribute('transform','translate('+f1(-((t*4.2)%340))+' '+f1(Math.sin(t*.35)*1.4)+')');
   if(B)B.setAttribute('transform','translate('+f1(-320+((t*2.2)%320))+' 0)');
   el.querySelectorAll('.jd-sh path').forEach((p,i)=>{const per=5+i%3,ph=((t+i*1.31)/per)%1,cyc=Math.floor((t+i*1.31)/per),x=110+((cyc*157+i*211)%580),w=10+(i%3)*9,dy=3+(i%4)*9;
    let d='',e='';for(let s=0;s<=6;s++){const xx=x-w+s*w/3,yy=surf(xx,t,a)+dy;d+=(s?' L':'M')+f1(xx)+','+f1(yy);e=' L'+f1(xx)+','+f1(yy+1.1)+e;}
    p.setAttribute('d',d+e+'Z');p.style.opacity=(Math.sin(Math.PI*ph)*.5).toFixed(3);});
  }
 };

 /* ───────── 21-38 · 흐린 호수 ─────────
    「물이 온통 흐린빛이다. 앞쪽에 그물 하나가 떨어진다. 던진 배는 보이지 않는다.」
    · 물 · 하늘: 온통 흐린 잿빛(구름 낀 하늘, 탁한 물).
    · 그물: 배가 도착한 뒤 뱃머리 앞쪽 하늘에서 둥근 투망이 펼쳐지며 떨어진다(가장자리에 추).
      물에 닿으면 물보라와 둥근 물살이 퍼지고, 그물은 추부터 천천히 가라앉는다.
    · 던진 배와 던진 줄은 그리지 않는다(보이지 않음). */
 THEMES[38]={
  skyTop:'#1a1c1c',skyMid:'#3a3e3c',skyHorizon:'#6a6e68',moon:'#c8ccc4',
  seaTop:'#8a8e84',seaMid:'#4e524a',seaBottom:'#161814',
  crest:'#d8dcd2',swell:'#9a9e94',hatch:'#e4e8de',boat:'#08090a',rim:'#b4b8ae',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.65,drift:.4
 };
 const NET={x:470,start:.9,land:2.5,r:30};
 function netGeom(c){
  const ta=arrived(c);if(ta<NET.start)return null;
  const {t,a,surf}=c,fly=sm((ta-NET.start)/(NET.land-NET.start)),landed=ta>=NET.land,after=landed?ta-NET.land:0;
  const x0=640,y0=-20,x1=NET.x,y1=surf(NET.x,t,a)+7;
  const x=x0+(x1-x0)*fly,y=y0+(y1-y0)*fly-Math.sin(fly*Math.PI)*26;
  const open=landed?1:.12+.88*sm((ta-NET.start-.15)/1.1);
  const rx=NET.r*open,ry=rx*(landed?.2:.2+.32*(1-fly));
  const crown=landed?Math.max(0,3.2-after*1.1):(4+10*(1-open));   // 가운데(줄 매는 곳)가 위로 솟은 종 모양 → 내려앉으며 평평해짐
  const sink=landed?sm(after/11):0, sag=landed?Math.min(6,after*1.4):0;
  return {x,y,rx,ry,crown,sink,sag,landed,after,open};
 }
 LAYERS[38]={
  sky(th){
   const n=N();
   return '<defs>'+(n?n.pattern('hrCl','hr-cl',{size:256,cell:70,oct:5,rgb:[200,204,196],lo:.42,hi:.9,stretch:[3.6,1],seed:163},520,110):'')+
     (n?n.pattern('hrCl2','hr-cl2',{size:256,cell:90,oct:4,rgb:[40,44,42],lo:.4,hi:.9,stretch:[3,1],seed:173},620,120):'')+'</defs>'+
    (n?'<g class="hr-a"><rect x="-400" y="0" width="1800" height="122" fill="url(#hrCl)" opacity=".34"/></g><g class="hr-b"><rect x="-400" y="0" width="1800" height="122" fill="url(#hrCl2)" opacity=".4"/></g>':'');
  },
  under(th){
   const n=N();let rp='';for(let i=0;i<3;i++)rp+='<ellipse class="hr-rip"/>';
   return '<defs>'+(n?n.pattern('hrSilt','hr-silt',{size:256,cell:34,oct:4,rgb:[200,200,184],lo:.55,hi:.92,stretch:[2.4,1],seed:181},300,70):'')+'</defs>'+
    (n?'<g class="hr-s"><rect x="-300" y="126" width="1700" height="80" fill="url(#hrSilt)" opacity=".22" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g class="hr-rips">'+rp+'</g>';
  },
  surface(th){
   let w='';for(let i=0;i<16;i++)w+='<circle r=".95"/>';let sp='';for(let i=0;i<12;i++)sp+='<ellipse rx=".8" ry=".6"/>';
   return '<g class="hr-net"><path class="hr-mesh"/><path class="hr-rim"/><g class="hr-w">'+w+'</g></g><g class="hr-spray">'+sp+'</g>';
  },
  paint(el,c){
   const {t,a,surf}=c;
   const A=el.querySelector('.hr-a'),B=el.querySelector('.hr-b'),S=el.querySelector('.hr-s');
   if(A)A.setAttribute('transform','translate('+f1(-((t*1.6)%520))+' 0)');if(B)B.setAttribute('transform','translate('+f1(-620+((t*1.1)%620))+' 0)');
   if(S)S.setAttribute('transform','translate('+f1(-((t*2)%300))+' 0)');
   const g=netGeom(c),net=el.querySelector('.hr-net');
   if(!g){net.style.opacity='0';el.querySelectorAll('.hr-rip,.hr-spray ellipse').forEach(e=>e.style.opacity='0');return;}
   net.style.opacity=(Math.min(1,(arrived(c)-NET.start)*4)*(1-g.sink*.85)).toFixed(3);
   // 그물: 가운데(정수리)에서 가장자리로 뻗은 날줄 16 + 둘레 고리 3겹, 추는 가장자리에
   const RAD=16,rim=[],cx=g.x,cyc=g.y-g.crown;
   for(let i=0;i<RAD;i++){const an=i/RAD*Math.PI*2+t*.05*(g.landed?0:1)+(g.landed?0:Math.sin(t*3)*.04);const wob=g.landed?0:Math.sin(t*6+i)*.8;
    rim.push([g.x+Math.cos(an)*g.rx,g.y+Math.sin(an)*g.ry+g.sag*(.5+.5*Math.sin(an))+wob]);}
   let d='';rim.forEach(p=>{d+='M'+f1(cx)+','+f1(cyc)+' L'+f1(p[0])+','+f1(p[1]);});
   [.36,.68].forEach(u=>{rim.forEach((p,i)=>{const x=cx+(p[0]-cx)*u,y=cyc+(p[1]-cyc)*u-(g.crown*.25*Math.sin(u*Math.PI));d+=(i?' L':' M')+f1(x)+','+f1(y);});d+=' Z';});
   el.querySelector('.hr-mesh').setAttribute('d',d);
   let rd='';rim.forEach((p,i)=>rd+=(i?' L':'M')+f1(p[0])+','+f1(p[1]));el.querySelector('.hr-rim').setAttribute('d',rd+' Z');
   el.querySelectorAll('.hr-w circle').forEach((w,i)=>{const p=rim[i];w.setAttribute('cx',f1(p[0]));w.setAttribute('cy',f1(p[1]+.6));w.style.opacity=g.landed?(1-sm(g.after/4)).toFixed(2):'1';});
   // 물에 닿은 자리: 물보라 · 둥글게 퍼지는 물살
   const wl=surf(NET.x,t,a)+7;
   el.querySelectorAll('.hr-spray ellipse').forEach((p,i)=>{const k=g.landed?g.after/1:2;if(k>1){p.style.opacity='0';return;}
    const an=R(i)*Math.PI*2,sp=10+R(i+5)*18,x=NET.x+Math.cos(an)*sp*k*1.4,y=wl-(8+R(i+9)*10)*k+16*k*k+Math.sin(an)*3*k;p.setAttribute('cx',f1(x));p.setAttribute('cy',f1(y));p.style.opacity=((1-k)*.85).toFixed(2);});
   el.querySelectorAll('.hr-rip').forEach((p,i)=>{if(!g.landed){p.style.opacity='0';return;}const k=((g.after-i*.9)/5);if(k<0||k>1){p.style.opacity='0';return;}
    p.setAttribute('cx',f1(NET.x));p.setAttribute('cy',f1(wl+1));p.setAttribute('rx',f1(NET.r+k*70));p.setAttribute('ry',f1(NET.r*.2+k*13));p.style.opacity=((1-k)*.55).toFixed(2);});
  }
 };

 /* ───────── 21-39 · 춘유록빛 호수 ─────────
    「물이 춘유록빛이다. 물 위에 유리병이 하나씩 떠 있다. 어째선지 병은 모두 비어 있고, 물결에 천천히 흔들린다.」
    · 물: 춘유록빛(봄 버들잎 같은 연둣빛).
    · 유리병: 모양이 서로 다른 빈 유리병이 띄엄띄엄 하나씩 떠 있다(마개는 닫힘). 속이 비어 투명하고, 물에 잠긴 아랫부분만 물빛에 흐려진다.
      물결에 천천히 흔들리며 까딱인다. */
 THEMES[39]={
  skyTop:'#080c04',skyMid:'#1e2a10',skyHorizon:'#5a7030',moon:'#f0ffd0',
  seaTop:'#b4cc66',seaMid:'#6a8a2e',seaBottom:'#141e06',
  crest:'#f4ffd8',swell:'#c4dc80',hatch:'#f8ffe4',boat:'#060904',rim:'#d0e4a0',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.75,drift:.55
 };
 const GLASS='fill="url(#byGlass)" stroke="#f8ffe8" stroke-opacity=".9" stroke-width=".45"';
 const BOTTLE={   // 눕거나 기운 채 떠 있는 빈 병(원점 = 물에 닿는 중심)
  wine:'<path d="M-14,-3.2 Q-14,-6 -11,-6 L3,-6 Q6,-6 8,-3.4 L12,-2.4 L16,-2.4 L16,1 L12,1 L8,2 Q6,4.4 3,4.4 L-11,4.4 Q-14,4.4 -14,1.6 Z" '+GLASS+'/><rect x="16" y="-2.6" width="3.2" height="3.8" rx=".6" fill="#a87a4a"/><path d="M-11,-4.6 L4,-4.6" stroke="#ffffff" stroke-opacity=".75" stroke-width=".7" stroke-linecap="round"/><path d="M9,-2.6 L14,-1.8" stroke="#fff" stroke-opacity=".5" stroke-width=".4"/>',
  flask:'<circle cx="0" cy="-2" r="6.2" '+GLASS+'/><path d="M-1.8,-8 L-1.8,-12 L1.8,-12 L1.8,-8" '+GLASS+'/><rect x="-2.2" y="-14.4" width="4.4" height="2.6" rx=".5" fill="#9a6e40"/><path d="M-3.8,-5.6 Q-4.6,-3 -3.4,-.6" stroke="#fff" stroke-opacity=".8" stroke-width=".7" fill="none" stroke-linecap="round"/>',
  vial:'<path d="M-8,-1.8 L5,-1.8 L6.4,-1.2 L8,-1.2 L8,1.4 L6.4,1.4 L5,2 L-8,2 Q-9,2 -9,.1 Q-9,-1.8 -8,-1.8 Z" '+GLASS+'/><rect x="8" y="-1.6" width="2.6" height="3.2" rx=".5" fill="#b08452"/><path d="M-7,-1 L4,-1" stroke="#fff" stroke-opacity=".7" stroke-width=".5"/>',
  square:'<path d="M-9,-5 L5,-5 L7,-3 L10,-3 L10,1.4 L7,1.4 L5,3.4 L-9,3.4 Z" '+GLASS+'/><path d="M-9,-5 L-7,-6.4 L6,-6.4 L5,-5" fill="#e8ffd0" fill-opacity=".25" stroke="#f6ffe4" stroke-opacity=".5" stroke-width=".3"/><rect x="10" y="-3.2" width="3" height="4.8" rx=".5" fill="#8a6038"/><path d="M-7.6,-3.8 L-7.6,2.2" stroke="#fff" stroke-opacity=".6" stroke-width=".6"/>',
  round:'<ellipse cx="-2" cy="-.6" rx="8.4" ry="5.4" '+GLASS+'/><path d="M6,-2.2 L11,-2.2 L11,1 L6,1" '+GLASS+'/><rect x="11" y="-2.6" width="2.6" height="4" rx=".5" fill="#a07448"/><path d="M-7,-3.6 Q-3,-5.6 1,-4.8" stroke="#fff" stroke-opacity=".8" stroke-width=".6" fill="none" stroke-linecap="round"/>'
 };
 const BOTTLES=[ // [모양, x, 깊이(수면 선 아래), 크기, 기울기, 층]
  ['wine',300,17,1.4,-8,'s'],['flask',470,24,1.35,4,'s'],['vial',414,42,1.7,6,'s'],['square',252,46,1.8,-4,'s'],['round',522,13,1.25,-6,'s'],
  ['vial',344,2.4,.7,3,'u'],['flask',446,2.2,.68,-5,'u'],['wine',508,2.6,.72,8,'u'],['round',284,2.4,.66,4,'u']];
 const bottleG=L=>BOTTLES.map((B,i)=>B[5]!==L?'':'<g class="by" data-i="'+i+'"><ellipse class="by-ring"/><g class="by-pos">'+
   '<g clip-path="url(#byUnder)" opacity=".55"><g class="by-rot">'+BOTTLE[B[0]]+'</g></g>'+
   '<rect x="-20" y="0" width="40" height="12" fill="url(#byTint)" clip-path="url(#byUnder)"/>'+
   '<g clip-path="url(#byOver)"><g class="by-rot">'+BOTTLE[B[0]]+'</g></g></g></g>').join('');
 LAYERS[39]={
  under(th){
   const n=N();let gl='';for(let i=0;i<14;i++)gl+='<path/>';
   return '<defs><linearGradient id="byGlass" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f4ffe0" stop-opacity=".42"/><stop offset=".5" stop-color="#d8f0b0" stop-opacity=".16"/><stop offset="1" stop-color="#a8c870" stop-opacity=".3"/></linearGradient>'+
     '<linearGradient id="byTint" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7a9a3a" stop-opacity=".0"/><stop offset=".3" stop-color="#7a9a3a" stop-opacity=".28"/><stop offset="1" stop-color="#5a7a24" stop-opacity=".1"/></linearGradient>'+
     '<clipPath id="byOver"><rect x="-30" y="-30" width="60" height="30.4"/></clipPath><clipPath id="byUnder"><rect x="-30" y=".4" width="60" height="30"/></clipPath>'+
     (n?n.pattern('byA','by-a',{size:256,cell:40,oct:4,rgb:[240,255,200],lo:.6,hi:.92,stretch:[3,1],seed:191},320,70):'')+'</defs>'+
    (n?'<g class="by-a"><rect x="-300" y="126" width="1700" height="80" fill="url(#byA)" opacity=".22" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g class="by-gl">'+gl+'</g><g class="by-far">'+bottleG('u')+'</g>';
  },
  surface(th){return '<g class="by-near">'+bottleG('s')+'</g>';},
  paint(el,c){
   const {t,a,surf}=c;
   const A=el.querySelector('.by-a');if(A)A.setAttribute('transform','translate('+f1(-((t*3.4)%320))+' '+f1(Math.sin(t*.4)*1.2)+')');
   el.querySelectorAll('.by-gl path').forEach((p,i)=>{const per=4.4+i%3,ph=((t+i*1.17)/per)%1,cyc=Math.floor((t+i*1.17)/per),x=120+((cyc*163+i*199)%560),y=surf(x,t,a)+4+(i%5)*9,w=9+(i%3)*8;
    p.setAttribute('d','M'+f1(x-w)+','+f1(y)+' Q'+f1(x)+','+f1(y-1)+' '+f1(x+w)+','+f1(y));p.style.opacity=(Math.sin(Math.PI*ph)*.45).toFixed(3);});
   el.querySelectorAll('.by').forEach(g=>{const B=BOTTLES[+g.dataset.i],[kind,bx,dep,sc,tilt]=B,i=+g.dataset.i;
    const x=bx+Math.sin(t*.16+i*1.7)*4,y=surf(x,t,a)+dep+Math.sin(t*1.3+i)*.5*sc;
    const slope=(surf(x+10,t,a)-surf(x-10,t,a))/20,rock=tilt+Math.atan(slope)*57*.8+Math.sin(t*.9+i*2)*4;
    g.querySelector('.by-pos').setAttribute('transform','translate('+f1(x)+' '+f1(y)+') scale('+f2(sc)+')');
    g.querySelectorAll('.by-rot').forEach(r=>r.setAttribute('transform','rotate('+f2(rock)+')'));
    const ring=g.querySelector('.by-ring');ring.setAttribute('cx',f1(x));ring.setAttribute('cy',f1(y+.6*sc));ring.setAttribute('rx',f1((13+Math.sin(t*1.6+i)*1.4)*sc));ring.setAttribute('ry',f1(1.6*sc));
   });
  }
 };

 /* ───────── 21-40 · 두 배가 떠다니는 호수 ─────────
    「평범한 아이보리색 물에 두 배가 떠 있다. 두 배의 양 끝에는 거대한 U자 형태의 굽쇠가 달려 있다. 저곳을 통과하려 하자 점점 두 배가 가까워진다.」
    · 물: 평범한 아이보리색.
    · 두 배: 사람 없는 커다란 배 두 척이 우리 배가 지나갈 물길 양옆(먼 쪽 · 가까운 쪽)에 떠 있다.
      각 배의 이물과 고물에 배보다 높은 U자 굽쇠가 하나씩 세워져 있다.
    · 가까워짐: 우리 배가 두 배 사이로 들어서려 할 때부터 두 배가 양옆에서 천천히 다가온다(먼 배는 커지며 다가오고, 가까운 배는 물러나듯 좁혀 옴). */
 THEMES[40]={
  skyTop:'#0e0d0b',skyMid:'#2e2b24',skyHorizon:'#7a7260',moon:'#fff8e8',
  seaTop:'#ece2c8',seaMid:'#a89c80',seaBottom:'#2a261c',
  crest:'#fffaf0',swell:'#f0e8d4',hatch:'#fffcf4',boat:'#070604',rim:'#e8dcc4',
  lamp:'#ffc055',lampCore:'#fff0c0',bob:.6,drift:.15
 };
 const FORK=(x)=>'<g transform="translate('+x+' -13)">'+
  '<rect x="-2.6" y="-18" width="5.2" height="18" fill="url(#tsSteel)"/><rect x="-4.4" y="-2" width="8.8" height="3" fill="#2a2822"/>'+
  '<path d="M-12,-74 L-12,-30 Q-12,-17 0,-17 Q12,-17 12,-30 L12,-74 L7.4,-74 L7.4,-30 Q7.4,-21.6 0,-21.6 Q-7.4,-21.6 -7.4,-30 L-7.4,-74 Z" fill="url(#tsSteel)" stroke="#d8d4c8" stroke-opacity=".35" stroke-width=".5"/>'+
  '<path d="M-10.6,-72 L-10.6,-31" stroke="#f4f0e4" stroke-opacity=".45" stroke-width=".8"/><path d="M8.6,-72 L8.6,-31" stroke="#f4f0e4" stroke-opacity=".25" stroke-width=".6"/>'+
  '<rect x="-12.4" y="-76" width="5.4" height="2.4" fill="#4a463c"/><rect x="7" y="-76" width="5.4" height="2.4" fill="#4a463c"/></g>';
 const SHIP='<path d="M-92,-14 L84,-14 Q96,-15 100,-22 L98,-12 Q92,6 72,8 L-74,8 Q-90,6 -94,-6 Z" fill="url(#tsHull)"/>'+
  '<path d="M-92,-14 L84,-14 Q96,-15 100,-22" fill="none" stroke="#e8dcc4" stroke-opacity=".35" stroke-width=".8"/>'+
  '<path d="M-90,-7 L94,-7 M-84,0 L90,0" stroke="#000" stroke-opacity=".35" stroke-width=".6"/>'+
  [-60,-30,0,30,60].map(x=>'<path d="M'+x+',-14 L'+x+',7" stroke="#000" stroke-opacity=".2" stroke-width=".5"/>').join('')+
  '<rect x="-30" y="-26" width="42" height="12" rx="1.5" fill="#17150f"/><rect x="-26" y="-23" width="6" height="4" fill="#2e2b22"/><rect x="-14" y="-23" width="6" height="4" fill="#2e2b22"/><rect x="-2" y="-23" width="6" height="4" fill="#2e2b22"/>'+
  '<path d="M-88,-14 L-88,-20 L80,-20 L80,-14" fill="none" stroke="#3a362c" stroke-width=".9"/>'+FORK(-80)+FORK(84);
 LAYERS[40]={
  under(th){
   const n=N();let gl='';for(let i=0;i<12;i++)gl+='<path/>';
   return '<defs><linearGradient id="tsSteel" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#3a3a36"/><stop offset=".3" stop-color="#8a8a82"/><stop offset=".55" stop-color="#c8c6bc"/><stop offset="1" stop-color="#4a4a44"/></linearGradient>'+
     '<linearGradient id="tsHull" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2a2620"/><stop offset="1" stop-color="#0c0a08"/></linearGradient>'+
     '<linearGradient id="tsHaze" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7a7260" stop-opacity=".0"/><stop offset="1" stop-color="#7a7260" stop-opacity=".0"/></linearGradient>'+
     (n?n.pattern('tsA','ts-a',{size:256,cell:40,oct:4,rgb:[255,250,236],lo:.6,hi:.92,stretch:[3,1],seed:211},320,70):'')+'</defs>'+
    (n?'<g class="ts-a"><rect x="-300" y="126" width="1700" height="80" fill="url(#tsA)" opacity=".2" clip-path="url(#lfxBelow)"/></g>':'')+
    '<g class="ts-gl">'+gl+'</g><g class="ts-far"><g class="ts-ship">'+SHIP+'</g></g>';
  },
  surface(th){return '<g class="ts-near"><g class="ts-ref" opacity=".18"><g transform="scale(1 -.6)">'+SHIP+'</g></g><ellipse class="ts-ring"/><g class="ts-ship">'+SHIP+'</g></g>';},
  paint(el,c){
   const {t,a,surf}=c,ta=arrived(c);
   const A=el.querySelector('.ts-a');if(A)A.setAttribute('transform','translate('+f1(-((t*3)%320))+' 0)');
   el.querySelectorAll('.ts-gl path').forEach((p,i)=>{const per=4.6+i%3,ph=((t+i*1.13)/per)%1,cyc=Math.floor((t+i*1.13)/per),x=120+((cyc*157+i*211)%560),y=surf(x,t,a)+5+(i%5)*9,w=9+(i%3)*8;
    p.setAttribute('d','M'+f1(x-w)+','+f1(y)+' Q'+f1(x)+','+f1(y-1)+' '+f1(x+w)+','+f1(y));p.style.opacity=(Math.sin(Math.PI*ph)*.4).toFixed(3);});
   // 들어서려 할 때(진입 후반)부터 다가오기 시작, 도착 뒤에도 천천히 계속 좁혀 옴
   const k=sm((c.enter-.62)/.38)*.3+(ta>0?sm(ta/14)*.7:0);
   const X=384;
   const far=el.querySelector('.ts-far .ts-ship'),fs=.58+k*.2,fx=X+Math.sin(t*.13)*3,fy=surf(fx,t,a)+1.5+Math.sin(t*.8)*.4;
   far.setAttribute('transform','translate('+f1(fx)+' '+f1(fy)+') rotate('+f2(Math.sin(t*.7)*.6)+') scale('+f2(fs)+')');
   el.querySelector('.ts-far').style.opacity=(.62+k*.3).toFixed(2);
   const ns=1.2-k*.16,nx=X-4+Math.sin(t*.11+1)*3,ny=surf(nx,t,a)+38-k*22+Math.sin(t*.75+1)*.5,nr=Math.sin(t*.6+1)*.5;
   el.querySelector('.ts-near .ts-ship').setAttribute('transform','translate('+f1(nx)+' '+f1(ny)+') rotate('+f2(nr)+') scale('+f2(ns)+')');
   el.querySelector('.ts-ref').setAttribute('transform','translate('+f1(nx)+' '+f1(ny+5*ns)+') rotate('+f2(-nr)+') scale('+f2(ns)+')');
   const ring=el.querySelector('.ts-ring');ring.setAttribute('cx',f1(nx+4));ring.setAttribute('cy',f1(ny+7*ns));ring.setAttribute('rx',f1(104*ns));ring.setAttribute('ry',f1(3*ns));
  }
 };

 const css=
  '.lakefx[data-lake="36"]{background:#12040f;border-color:#a83a80}.lakefx[data-lake="36"] .lfx-top{color:#ffd8f2}'+
  '.lakefx[data-lake="36"] .lfx-horizon,.lakefx[data-lake="36"] .lfx-fars{display:none}.lakefx[data-lake="36"] .lfx-crest{stroke-opacity:.07}.lakefx .ec-gl path{fill:none;stroke:#ffd8f2;stroke-width:.9;stroke-linecap:round}'+
  '.lakefx[data-lake="37"]{background:#0c0410;border-color:#c85a90}.lakefx[data-lake="37"] .lfx-top{color:#ffe0ee}.lakefx .jd-sh path{fill:#ffd8ea}'+
  '.lakefx[data-lake="38"]{background:#141614;border-color:#6a6e66}.lakefx[data-lake="38"] .lfx-top{color:#e4e8de}'+
  '.lakefx .hr-mesh{fill:none;stroke:#e4e0cc;stroke-width:.45;stroke-opacity:.8}.lakefx .hr-rim{fill:#d8d4c0;fill-opacity:.05;stroke:#f0ecdc;stroke-width:.8;stroke-opacity:.85}'+
  '.lakefx .hr-w circle{fill:#2e302c;stroke:#9a9c94;stroke-width:.25}.lakefx .hr-spray ellipse{fill:#e8ece2}.lakefx .hr-rip{fill:none;stroke:#e4e8de;stroke-width:.7}'+
  '.lakefx[data-lake="39"]{background:#0a0e06;border-color:#8aa848}.lakefx[data-lake="39"] .lfx-top{color:#f0ffd8}'+
  '.lakefx .by-gl path{fill:none;stroke:#f4ffd8;stroke-width:.9;stroke-linecap:round}.lakefx .by-ring{fill:none;stroke:#f4ffe0;stroke-width:.4;stroke-opacity:.5}'+
  '.lakefx[data-lake="40"]{background:#0e0d0b;border-color:#a89c80}.lakefx[data-lake="40"] .lfx-top{color:#fff6e4}'+
  '.lakefx .ts-gl path{fill:none;stroke:#fffaf0;stroke-width:.9;stroke-linecap:round}.lakefx .ts-ring{fill:none;stroke:#fffaf0;stroke-width:.6;stroke-opacity:.4}';
 const st=document.createElement('style');st.id='lake-themes-v025i';st.textContent=css;document.head.appendChild(st);
 if(typeof state!=='undefined'&&state.scene==='event'&&typeof render==='function')render();
})();
