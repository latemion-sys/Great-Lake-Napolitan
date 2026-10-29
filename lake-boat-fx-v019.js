/* Great Lake v0.1.9.x · 호수 진입 이펙트: 너울 위에 떠 있는 작은 검은 배.
   '창백의 향유고래' 시네마틱(pallid-cinematic-v2)과 같은 화풍을 쓴다:
   짙은 밤하늘, 곡선 너울, 옅은 윤곽선, 비네트·주사선·모서리 그늘, 자막.
   화면은 render() 때마다 innerHTML로 다시 그려지므로, 애니메이션은 CSS 키프레임 대신
   performance.now() 기준의 requestAnimationFrame으로 계산해 재렌더 후에도 끊기지 않게 한다.
   호수 색·이름별 변형은 GREAT_LAKE_FX.theme(lake, def)에서 확장한다. */
(function(){
 'use strict';
 if(typeof renderScriptedLake015!=='function')return;

 const W=800,H=200,SEA=132;          // viewBox 크기와 기준 수면 높이
 const ENTER_SECONDS=7;              // 안개에서 나와 중앙에 닿기까지
 const STEP=20;                      // 수면 곡선 표본 간격
 const reduceMotion=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

 // 기본 테마. 다음 단계에서 호수 색(def.hex)·이름(def.name)에 따라 값을 바꾼다.
 const DEFAULT_THEME={
  skyTop:'#060c16',skyMid:'#0d1c29',skyHorizon:'#1b3846', // 밤하늘
  moon:'#8299a0',                                           // 달무리
  seaTop:'#214958',seaMid:'#092331',seaBottom:'#030c18',    // 너울(창백의 향유고래 바다와 같은 색)
  crest:'#abc8c7',swell:'#71a3ad',hatch:'#d5f4d9',          // 물마루 · 먼 물결 · 물결 결
  boat:'#040608',rim:'#a5b5ae',                             // 배 실루엣 · 옅은 윤곽선
  lamp:'#ffbf47',lampCore:'#ffe39a',                        // 뱃머리 등불
  bob:1,drift:1                                             // 흔들림 · 표류 세기
 };
 const FX=window.GREAT_LAKE_FX=window.GREAT_LAKE_FX||{};
 FX.theme=FX.theme||function(lake,def){return {};};

 // 진입 연출은 같은 호수 안에서 장면이 바뀌어도 다시 재생하지 않는다.
 let entryKey=null,entryAt=performance.now();
 function entryFor(lake){
  const key=(state.voyage||0)+':'+lake.id+':'+(state.visited||[]).length;
  if(key!==entryKey){entryKey=key;entryAt=performance.now();}
 }

 // 강철 쪽배: 오른쪽이 뱃머리. 원점은 수면에 닿는 선체 중앙.
 const LAMP=[51,-18.5];
 const HULL='M-50,-11 L-44,-8 L38,-8 Q47,-9 55,-17 L52,-9 Q47,3 33,6 L-34,6 Q-46,4 -50,-11 Z';
 const BOAT=
  '<circle cx="'+LAMP[0]+'" cy="'+LAMP[1]+'" r="26" class="lfx-lampglow" fill="url(#lfxLampGlow)"/>'+
  '<path d="M-3,-50 L46,-12 M-3,-50 L-46,-10" class="lfx-stay"/>'+
  '<path d="M-3,-17 L-3,-53" class="lfx-mast"/>'+
  '<path d="M-3,-47 L-17,-47" class="lfx-mast thin"/>'+
  '<path d="M45,-8 L45,-25 L'+LAMP[0]+',-25 L'+LAMP[0]+',-22" class="lfx-mast thin"/>'+
  '<rect x="-14" y="-17" width="22" height="9" rx="1.5" class="lfx-hull"/>'+
  '<path d="'+HULL+'" class="lfx-hull"/>'+
  '<path d="M-44,-8 L38,-8" class="lfx-deck"/>'+
  '<rect x="'+(LAMP[0]-2.6)+'" y="'+(LAMP[1]-3)+'" width="5.2" height="6.2" rx="1.2" class="lfx-lamp"/>'+
  '<path d="M'+(LAMP[0]-3.4)+','+(LAMP[1]-3.2)+' L'+(LAMP[0]+3.4)+','+(LAMP[1]-3.2)+' M'+(LAMP[0]-2.6)+','+(LAMP[1]+3.4)+' L'+(LAMP[0]+2.6)+','+(LAMP[1]+3.4)+'" class="lfx-mast thin"/>';

 // 너울: 큰 물결 위에 작은 물결 두 겹을 얹는다. 배는 이 곡선을 그대로 탄다.
 function surf(x,t,a){
  return SEA
   +Math.sin(x*0.0062+0.8)*5            // 화면을 가로지르는 느린 언덕
   +Math.sin(x*0.0115-t*0.85)*3.4*a     // 밀려오는 너울
   +Math.sin(x*0.029+t*1.35+1.3)*1.3*a; // 잔물결
 }
 function surfPath(t,a,dy){
  let d='';
  for(let x=-STEP;x<=W+STEP;x+=STEP)d+=(d?' L':'M')+x+','+(surf(x,t,a)+dy).toFixed(1);
  return d;
 }
 // 먼 바다의 곡선 물결(창백의 향유고래 장면의 Q 곡선 물결을 시간에 따라 움직인 것)
 function farLine(i,t,a){
  const base=SEA+20+i*i*6+i*9,amp=(2.4+i*1.6)*a,k=0.008-i*0.0012,sp=(0.35+i*0.22)*(i%2?-1:1);
  let d='';
  for(let x=-STEP;x<=W+STEP;x+=STEP)d+=(d?' L':'M')+x+','+(base+Math.sin(x*k+t*sp+i*1.9)*amp+Math.sin(x*0.004+i)*4).toFixed(1);
  return d;
 }

 function panel(lake,def){
  const th=Object.assign({},DEFAULT_THEME,FX.theme(lake,def)||{});
  entryFor(lake);
  const v='--lfx-boat:'+th.boat+';--lfx-rim:'+th.rim+';--lfx-crest:'+th.crest+';--lfx-swell:'+th.swell+';--lfx-lamp:'+th.lamp+';--lfx-lamp-core:'+th.lampCore;
  const title='21-'+String(lake.id).padStart(2,'0')+(def&&def.name?' · '+def.name:'');
  let far='';for(let i=0;i<3;i++)far+='<path class="lfx-far" data-i="'+i+'" style="stroke-opacity:'+(0.3-i*0.06).toFixed(2)+';stroke-width:'+(1.4+i*0.5).toFixed(1)+'"/>';
  return '<div class="lakefx" aria-hidden="true" data-lake="'+lake.id+'" data-bob="'+th.bob+'" data-drift="'+th.drift+'" style="'+v+'">'+
   '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid slice" focusable="false">'+
   '<defs>'+
    '<linearGradient id="lfxSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+th.skyTop+'"/><stop offset=".55" stop-color="'+th.skyMid+'"/><stop offset="1" stop-color="'+th.skyHorizon+'"/></linearGradient>'+
    '<linearGradient id="lfxSea" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="'+th.seaTop+'"/><stop offset=".55" stop-color="'+th.seaMid+'"/><stop offset="1" stop-color="'+th.seaBottom+'"/></linearGradient>'+
    '<radialGradient id="lfxLampGlow"><stop stop-color="'+th.lamp+'" stop-opacity=".95"/><stop offset=".22" stop-color="'+th.lamp+'" stop-opacity=".42"/><stop offset=".6" stop-color="'+th.lamp+'" stop-opacity=".08"/><stop offset="1" stop-color="'+th.lamp+'" stop-opacity="0"/></radialGradient>'+
    '<pattern id="lfxHatch" width="15" height="10" patternUnits="userSpaceOnUse"><path d="M0 9 L15 7" stroke="'+th.hatch+'" stroke-opacity=".1" fill="none"/></pattern>'+
    '<radialGradient id="lfxMoon"><stop stop-color="'+th.moon+'" stop-opacity=".26"/><stop offset=".18" stop-color="'+th.moon+'" stop-opacity=".13"/><stop offset=".5" stop-color="'+th.moon+'" stop-opacity=".045"/><stop offset="1" stop-color="'+th.moon+'" stop-opacity="0"/></radialGradient>'+
    '<filter id="lfxSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.5"/></filter>'+
    '<filter id="lfxGlint" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="2.4 1"/></filter>'+
    '<clipPath id="lfxAbove"><path class="lfx-clip-above"/></clipPath>'+
    '<clipPath id="lfxBelow"><path class="lfx-clip-below"/></clipPath>'+
   '</defs>'+
   '<rect width="'+W+'" height="'+H+'" fill="url(#lfxSky)"/>'+
   '<circle cx="640" cy="30" r="190" fill="url(#lfxMoon)"/>'+
   '<path d="M0 '+(SEA-14)+' Q150 '+(SEA-24)+' 300 '+(SEA-15)+' T800 '+(SEA-18)+'" class="lfx-horizon"/>'+
   '<g class="lfx-mist"><rect x="-200" y="'+(SEA-34)+'" width="'+(W+400)+'" height="26" rx="13"/></g>'+
   '<path class="lfx-water" fill="url(#lfxSea)"/>'+
   '<rect y="'+(SEA-10)+'" width="'+W+'" height="'+(H-SEA+10)+'" fill="url(#lfxHatch)" opacity=".4" clip-path="url(#lfxBelow)"/>'+
   '<g class="lfx-fars">'+far+'</g>'+
   '<g clip-path="url(#lfxBelow)"><g class="lfx-reflection" filter="url(#lfxSoft)">'+BOAT+'</g></g>'+
   '<ellipse class="lfx-glint" rx="18" ry="2.8" fill="'+th.lamp+'" filter="url(#lfxGlint)"/>'+
   '<g class="lfx-ripples"><path class="lfx-ripple"/><path class="lfx-ripple"/></g>'+
   '<g clip-path="url(#lfxAbove)"><g class="lfx-boat">'+BOAT+'</g></g>'+
   '<path class="lfx-crest"/>'+
   '</svg>'+
   '<span class="lfx-corner"></span><span class="lfx-grain"></span><span class="lfx-vignette"></span>'+
   '<span class="lfx-top">'+esc(title)+'</span>'+
   '</div>';
 }

 const original=renderScriptedLake015;
 renderScriptedLake015=function(){
  const html=original.apply(this,arguments);
  try{
   const lake=activeLake();
   if(!lake||state.scene!=='event')return html;
   const def=(typeof SCRIPTED_LAKE_MAP_015!=='undefined'&&SCRIPTED_LAKE_MAP_015.get(lake.id))||lake;
   const at=html.indexOf('<p class="muted">');
   if(at<0)return html;
   return html.slice(0,at)+panel(lake,def)+html.slice(at);
  }catch(e){return html;}
 };

 // 매 프레임 현재 화면의 .lakefx 하나를 시간 기준으로 갱신한다.
 function frame(now){
  const el=document.querySelector('.lakefx');
  if(el&&el.isConnected)paint(el,now);
  requestAnimationFrame(frame);
 }
 function ease(x){x=Math.min(1,Math.max(0,x));return 1-Math.pow(1-x,2);}
 const $$=(el,sel)=>el.querySelectorAll(sel);
 function paint(el,now){
  // '애니메이션 줄이기'(Windows 애니메이션 효과 끔 등)에서도 멈추지 않고,
  // 진입 미끄러짐만 생략한 채 조금 더 잔잔하게 떠 있는다.
  const calm=reduceMotion?0.6:1;
  const t=(now-entryAt)/1000,a=(+el.dataset.bob||1)*calm,drift=(+el.dataset.drift||1)*calm;
  const enter=reduceMotion?1:ease(t/ENTER_SECONDS);

  // 수면
  const line=surfPath(t,a,0);
  const water=line+' L'+(W+STEP)+','+H+' L'+(-STEP)+','+H+' Z';
  el.querySelector('.lfx-water').setAttribute('d',water);
  el.querySelector('.lfx-crest').setAttribute('d',line);
  el.querySelector('.lfx-clip-above').setAttribute('d',surfPath(t,a,1.6)+' L'+(W+STEP)+',0 L'+(-STEP)+',0 Z');
  el.querySelector('.lfx-clip-below').setAttribute('d',surfPath(t,a,1.6)+' L'+(W+STEP)+','+H+' L'+(-STEP)+','+H+' Z');
  $$(el,'.lfx-far').forEach(p=>p.setAttribute('d',farLine(+p.dataset.i,t,a)));

  // 배: 왼쪽 안개에서 천천히 나와 중앙 부근에서 너울을 탄다.
  const x=W/2-40+(1-enter)*-320+Math.sin(t*0.21)*42*drift*enter;
  const y=surf(x,t,a)+0.8+Math.sin(t*1.9)*0.7*a;
  const slope=(surf(x+18,t,a)-surf(x-18,t,a))/36;
  const roll=Math.atan(slope)*180/Math.PI*0.9+Math.sin(t*1.25+0.6)*1.6*a;
  const s=0.92;
  const boat=el.querySelector('.lfx-boat'),ref=el.querySelector('.lfx-reflection');
  boat.setAttribute('transform','translate('+x.toFixed(2)+' '+y.toFixed(2)+') rotate('+roll.toFixed(2)+') scale('+s+')');
  ref.setAttribute('transform','translate('+x.toFixed(2)+' '+(y+1.5).toFixed(2)+') rotate('+(-roll).toFixed(2)+') scale('+s+' '+(-s*0.8)+')');
  ref.style.opacity=(0.3*enter).toFixed(3);
  boat.style.opacity=(0.25+0.75*Math.min(1,t/1.6)).toFixed(3); // 안개 속에서 서서히 드러남

  // 배 주위로 퍼지는 물결: 수면 곡선을 따라 그린 짧은 호
  $$(el,'.lfx-ripple').forEach((r,i)=>{
   const p=((t/3.4)+i*0.5)%1,half=48+p*70,lift=2+p*3;
   let d='';
   for(let k=-6;k<=6;k++){const xx=x+4+half*k/6,yy=surf(xx,t,a)+lift*(1-Math.pow(k/6,2))*0.6+1;d+=(d?' L':'M')+xx.toFixed(1)+','+yy.toFixed(1);}
   r.setAttribute('d',d);
   r.style.strokeOpacity=((1-p)*0.34*enter).toFixed(3);
  });

  // 등불: 불꽃처럼 미세하게 일렁이고, 바로 아래 수면에 따스한 빛이 비친다.
  const flick=0.86+Math.sin(t*7.3)*0.05+Math.sin(t*12.9+1.7)*0.04+Math.sin(t*2.1)*0.05;
  $$(el,'.lfx-lampglow').forEach(g=>g.style.opacity=flick.toFixed(3));
  const glint=el.querySelector('.lfx-glint'),r=roll*Math.PI/180;
  const lx=x+s*(LAMP[0]*Math.cos(r)-LAMP[1]*Math.sin(r));
  glint.setAttribute('cx',lx.toFixed(1));glint.setAttribute('cy',(surf(lx,t,a)+6).toFixed(1));
  glint.style.opacity=(0.42*flick*enter).toFixed(3);

  const mist=el.querySelector('.lfx-mist');
  mist.setAttribute('transform','translate('+(Math.sin(t*0.07)*60).toFixed(1)+' 0)');
 }
 requestAnimationFrame(frame);
 // 화면이 다시 그려진 직후(브라우저가 그리기 전)에 바로 한 번 칠해, 빈 수면이 한 프레임 비치지 않게 한다.
 new MutationObserver(()=>{
  const el=document.querySelector('.lakefx');
  if(el&&!el.dataset.painted){el.dataset.painted='1';paint(el,performance.now());}
 }).observe(document.body,{childList:true,subtree:true});

 if(state.scene==='event')render();
 window.GREAT_LAKE_PATCH_019={boat:true};
})();
