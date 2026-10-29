/* Great Lake v0.1.9.0 · 호수 진입 이펙트: 수면 위에 떠 있는 작은 검은 배.
   화면은 render() 때마다 innerHTML로 다시 그려지므로, 애니메이션은 CSS 키프레임 대신
   performance.now() 기준의 requestAnimationFrame으로 계산해 재렌더 후에도 끊기지 않게 한다.
   호수 색·이름별 변형은 GREAT_LAKE_FX.theme(lake, def)에서 확장한다. */
(function(){
 'use strict';
 if(typeof renderScriptedLake015!=='function')return;

 const W=800,H=160,WATER=96; // viewBox 크기와 수면 높이
 const reduceMotion=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

 // 기본 테마. 다음 단계에서 호수 색(def.hex)·이름(def.name)에 따라 값을 바꾼다.
 const DEFAULT_THEME={
  skyTop:'#2b3640',skyBottom:'#4a5862',   // 안개 낀 하늘
  waterTop:'#33424d',waterBottom:'#121a21', // 수면
  wave:'#c9d6de',                        // 물결선
  boat:'#050607',rim:'#8fa3ae',          // 배 실루엣 · 윤곽광
  bob:1,drift:1                          // 흔들림 · 표류 세기
 };
 const FX=window.GREAT_LAKE_FX=window.GREAT_LAKE_FX||{};
 FX.theme=FX.theme||function(lake,def){return {};};

 // 진입 연출은 같은 호수 안에서 장면이 바뀌어도 다시 재생하지 않는다.
 let entryKey=null,entryAt=0;
 function entryFor(lake){
  const key=(state.voyage||0)+':'+lake.id+':'+(state.visited||[]).length;
  if(key!==entryKey){entryKey=key;entryAt=performance.now();}
  return entryAt;
 }

 // 강철 쪽배: 오른쪽이 뱃머리. 원점은 수면에 닿는 선체 중앙.
 const HULL='M-50,-11 L-44,-8 L38,-8 Q47,-9 55,-17 L52,-9 Q47,3 33,6 L-34,6 Q-46,4 -50,-11 Z';
 const BOAT=
  '<path d="'+HULL+'" class="lfx-hull"/>'+
  '<path d="M-44,-8 L38,-8" class="lfx-rimline"/>'+
  '<rect x="-14" y="-17" width="22" height="9" rx="1.5" class="lfx-hull"/>'+
  '<path d="M-3,-17 L-3,-52" class="lfx-mast"/>'+
  '<path d="M-3,-47 L-17,-47" class="lfx-mast thin"/>'+
  '<path d="M-3,-50 L46,-12 M-3,-50 L-46,-10" class="lfx-stay"/>';

 function waveLines(t){
  let s='';
  for(let i=0;i<7;i++){
   const y=WATER+6+i*i*1.25+i*4,op=(0.16-i*0.016).toFixed(3);
   s+='<path class="lfx-wave" data-i="'+i+'" d="M-40,'+y.toFixed(1)+' L'+(W+40)+','+y.toFixed(1)+'" style="stroke-opacity:'+op+';stroke-width:'+(0.8+i*0.22).toFixed(2)+';stroke-dasharray:'+(18+i*9)+' '+(26+i*13)+'"/>';
  }
  return s;
 }

 function panel(lake,def){
  const th=Object.assign({},DEFAULT_THEME,FX.theme(lake,def)||{});
  entryFor(lake);
  const v='--lfx-boat:'+th.boat+';--lfx-rim:'+th.rim+';--lfx-wave:'+th.wave;
  return '<div class="lakefx" aria-hidden="true" data-lake="'+lake.id+'" data-bob="'+th.bob+'" data-drift="'+th.drift+'" style="'+v+'">'+
   '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid slice">'+
   '<defs>'+
    '<linearGradient id="lfxSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+th.skyTop+'"/><stop offset="1" stop-color="'+th.skyBottom+'"/></linearGradient>'+
    '<linearGradient id="lfxWater" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+th.waterTop+'"/><stop offset="1" stop-color="'+th.waterBottom+'"/></linearGradient>'+
    '<radialGradient id="lfxGlow" cx=".5" cy=".5" r=".5"><stop stop-color="#fff" stop-opacity=".14"/><stop offset=".45" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
    '<linearGradient id="lfxFade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>'+
    '<clipPath id="lfxAbove"><rect x="0" y="0" width="'+W+'" height="'+(WATER+1.5)+'"/></clipPath>'+
    '<clipPath id="lfxBelow"><rect x="0" y="'+(WATER+1.5)+'" width="'+W+'" height="'+(H-WATER)+'"/></clipPath>'+
    '<filter id="lfxBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4"/></filter>'+
   '</defs>'+
   '<rect width="'+W+'" height="'+WATER+'" fill="url(#lfxSky)"/>'+
   '<rect y="'+WATER+'" width="'+W+'" height="'+(H-WATER)+'" fill="url(#lfxWater)"/>'+
   '<ellipse cx="'+W/2+'" cy="'+WATER+'" rx="'+W*0.55+'" ry="40" fill="url(#lfxGlow)"/>'+
   '<path d="M0,'+WATER+' L'+W+','+WATER+'" class="lfx-horizon"/>'+
   '<g class="lfx-mist"><rect x="-200" y="'+(WATER-26)+'" width="'+(W+400)+'" height="24" rx="12"/></g>'+
   '<g class="lfx-waves">'+waveLines()+'</g>'+
   '<g class="lfx-ripples"><ellipse class="lfx-ripple" rx="60" ry="4"/><ellipse class="lfx-ripple" rx="60" ry="4"/></g>'+
   '<g clip-path="url(#lfxBelow)"><g class="lfx-reflection" filter="url(#lfxBlur)">'+BOAT+'</g></g>'+
   '<g clip-path="url(#lfxAbove)"><g class="lfx-boat">'+BOAT+'</g></g>'+
   '<rect width="'+W+'" height="'+H+'" fill="url(#lfxFade)" pointer-events="none"/>'+
   '</svg></div>';
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
  if(el&&el.isConnected)paint(el,reduceMotion?entryAt+60000:now);
  requestAnimationFrame(frame);
 }
 function ease(x){x=Math.min(1,Math.max(0,x));return 1-Math.pow(1-x,3);}
 function paint(el,now){
  const t=(now-entryAt)/1000,bob=+el.dataset.bob||1,drift=+el.dataset.drift||1;
  const enter=ease(t/2.6);
  // 왼쪽 안개에서 미끄러져 들어와 중앙 부근에 멈춰 떠 있는다.
  const x=W/2-40+(1-enter)*-300+Math.sin(t*0.11)*26*drift*enter;
  const y=WATER+Math.sin(t*1.35)*1.6*bob+Math.sin(t*0.53+1)*0.9*bob;
  const roll=Math.sin(t*1.05+0.6)*2.2*bob+Math.sin(t*0.37)*0.8*bob;
  const s=0.92;
  const boat=el.querySelector('.lfx-boat'),ref=el.querySelector('.lfx-reflection');
  if(boat)boat.setAttribute('transform','translate('+x.toFixed(2)+' '+y.toFixed(2)+') rotate('+roll.toFixed(2)+') scale('+s+')');
  if(ref){
   ref.setAttribute('transform','translate('+x.toFixed(2)+' '+(2*WATER-y+1).toFixed(2)+') rotate('+(-roll).toFixed(2)+') scale('+s+' '+(-s*0.85)+')');
   ref.style.opacity=(0.32*enter).toFixed(3);
  }
  el.style.setProperty('--lfx-in',enter.toFixed(3));
  // 배 아래로 퍼지는 동심 물결
  const rings=el.querySelectorAll('.lfx-ripple');
  rings.forEach((r,i)=>{
   const p=((t/3.2)+i*0.5)%1;
   r.setAttribute('cx',(x+4).toFixed(1));r.setAttribute('cy',(WATER+3).toFixed(1));
   r.setAttribute('rx',(52+p*70).toFixed(1));r.setAttribute('ry',(3+p*4).toFixed(1));
   r.style.strokeOpacity=((1-p)*0.28*enter).toFixed(3);
  });
  // 물결선은 가까울수록 빠르게 흐른다.
  el.querySelectorAll('.lfx-wave').forEach(w=>{
   const i=+w.dataset.i;
   w.style.strokeDashoffset=(t*(6+i*5)*(i%2?1:-1)).toFixed(1);
  });
  const mist=el.querySelector('.lfx-mist');
  if(mist)mist.setAttribute('transform','translate('+(Math.sin(t*0.07)*60).toFixed(1)+' 0)');
 }
 requestAnimationFrame(frame);

 if(state.scene==='event')render();
 window.GREAT_LAKE_PATCH_019={boat:true};
})();
