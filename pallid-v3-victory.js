/* 모든 것을 삼키는 창백한 고래 · v3 시네마틱 · 5단계 심장 파괴
   한 번만 재생하고 마지막 장면에 머문다.
   작은 심장의 금 사이로 창백한 빛이 새고 → 산산이 부서지고 → 큰 심장이 경련 끝에 멎으며
   붉은빛이 빠져 창백해지고 → 하얗게 번진 뒤 → 바깥의 밤 호수, 숨이 끊긴 고래 곁에 등불 단 쪽배.
   시간 기준 requestAnimationFrame 방식(재렌더에도 이어짐). */
(function(){
'use strict';
const V3=window.PallidCinematicV3,V2=window.PallidCinematicV2;
if(!V3||!V3.shared||!V3.heartParts||!V2)return;
const {W,H,SEA,BOAT,seeded,esc,clamp,outC,inOut,WHALE,WHALE_TOP,IMPACT}=V3.shared;
const P=V3.heartParts;
const LABEL=V2.names.victory||['심장 파괴','작은 박동이 멎자 거대한 몸이 흔들립니다.'];
const END=7.2;              // 이후로는 바깥 장면에 머물며 잔잔히 움직임

const SMALL_SHAPE='M-22,-20 C-34,-8 -32,12 -18,24 C-8,34 6,38 14,30 C26,18 32,2 28,-12 C24,-26 12,-30 2,-24 C-6,-30 -16,-28 -22,-20 Z';
function toHeart(p,k,rot){
 const r=rot*Math.PI/180;
 return [P.PLACE[0]+k*((p[0]-P.HC[0])*Math.cos(r)-(p[1]-P.HC[1])*Math.sin(r)),P.PLACE[1]+k*((p[0]-P.HC[0])*Math.sin(r)+(p[1]-P.HC[1])*Math.cos(r))];
}
const SC=toHeart(P.SMALL,P.SCL,P.ROT);   // 작은 심장의 화면 위치
const SHARDS=Array.from({length:16},(_,i)=>{
 const r=seeded(1500+i),a=i/16*Math.PI*2+r()*0.3,sz=4+r()*9;
 const pts=[[0,-sz],[sz*0.8,sz*(0.3+r()*0.5)],[-sz*(0.5+r()*0.5),sz*0.6]];
 return {a,v:120+r()*260,spin:(r()-.5)*720,d:'M'+pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L')+' Z'};
});
// 큰 심장 표면으로 번지는 창백한 균열
const BIG_CRACKS=['M606,318 L582,286 L590,248 L566,222','M606,318 L640,300 L668,312 L700,290 L742,300','M606,318 L620,352 L604,388 L630,420 L660,450','M606,318 L572,336 L540,330 L506,352'];

function victoryHtml(){
 const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'+
 '<defs>'+
  '<radialGradient id="w7Dark" cx=".62" cy=".45" r=".75"><stop stop-color="#2a0a13"/><stop offset=".5" stop-color="#14050a"/><stop offset="1" stop-color="#040103"/></radialGradient>'+
  '<radialGradient id="w7Heart" cx=".42" cy=".38" r=".7"><stop stop-color="#b24a55"/><stop offset=".35" stop-color="#7c2433"/><stop offset=".75" stop-color="#3d0f1b"/><stop offset="1" stop-color="#1c060c"/></radialGradient>'+
  '<radialGradient id="w7Drained" cx=".42" cy=".38" r=".7"><stop stop-color="#a9aca2"/><stop offset=".4" stop-color="#6f746d"/><stop offset=".8" stop-color="#363b39"/><stop offset="1" stop-color="#1b1e1e"/></radialGradient>'+
  '<radialGradient id="w7Pale" cx=".38" cy=".32" r=".75"><stop stop-color="#eceee2"/><stop offset=".45" stop-color="#b9bfb3"/><stop offset=".85" stop-color="#6f7871"/><stop offset="1" stop-color="#454d49"/></radialGradient>'+
  '<radialGradient id="w7Leak"><stop stop-color="#fbfdf2" stop-opacity=".95"/><stop offset=".25" stop-color="#e3eadc" stop-opacity=".5"/><stop offset="1" stop-color="#e3eadc" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="w7Vessel" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7a2535"/><stop offset=".5" stop-color="#4a1220"/><stop offset="1" stop-color="#22070e"/></linearGradient>'+
  // 바깥 장면
  '<linearGradient id="w7Sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#04070b"/><stop offset=".62" stop-color="#121b21"/><stop offset="1" stop-color="#1f2a2f"/></linearGradient>'+
  '<linearGradient id="w7Sea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#151f24" stop-opacity=".88"/><stop offset=".25" stop-color="#0b1216" stop-opacity=".95"/><stop offset="1" stop-color="#020305"/></linearGradient>'+
  '<linearGradient id="w7Skin" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#dfe1d6"/><stop offset=".2" stop-color="#a9b0a7"/><stop offset=".45" stop-color="#5f6a67"/><stop offset=".75" stop-color="#29333a"/><stop offset="1" stop-color="#141c21"/></linearGradient>'+
  '<linearGradient id="w7Face" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#000" stop-opacity=".75"/><stop offset=".1" stop-color="#000" stop-opacity=".4"/><stop offset=".25" stop-color="#000" stop-opacity=".12"/><stop offset=".4" stop-color="#000" stop-opacity="0"/></linearGradient>'+
  '<radialGradient id="w7Moon"><stop stop-color="#e9ece2" stop-opacity=".6"/><stop offset=".18" stop-color="#c9d3cf" stop-opacity=".22"/><stop offset="1" stop-color="#9fb0b0" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w3Lamp"><stop stop-color="#ffbf47" stop-opacity=".95"/><stop offset=".22" stop-color="#ffbf47" stop-opacity=".42"/><stop offset=".6" stop-color="#ffbf47" stop-opacity=".08"/><stop offset="1" stop-color="#ffbf47" stop-opacity="0"/></radialGradient>'+
  '<filter id="w7Soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.5"/></filter>'+
  '<filter id="w7Glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5"/></filter>'+
  '<filter id="w7Mist" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="14 6"/></filter>'+
  '<filter id="w7Tex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .55" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .12  0 0 0 0 .12  0 0 0 -1.6 1.15"/></filter>'+
  '<path id="w7Big" d="'+P.BIG+'"/><clipPath id="w7BigClip"><use href="#w7Big"/></clipPath>'+
  '<path id="w7Whale" d="'+WHALE+'"/><clipPath id="w7WhaleClip"><use href="#w7Whale"/></clipPath>'+
  '<clipPath id="w7Above"><rect width="'+W+'" height="'+(SEA+2)+'"/></clipPath>'+
 '</defs>'+
 '<g class="w7-root">'+
  /* ---- 안쪽: 심장 ---- */
  '<g class="w7-in">'+
   '<rect width="'+W+'" height="'+H+'" fill="url(#w7Dark)"/>'+
   '<g class="w7-vessels" fill="none" stroke-linecap="round">'+P.vesselPaths().map((d,i)=>'<path d="'+d+'" stroke="#2a0811" stroke-width="'+(34-i*3)+'"/><path class="w7-vessel" data-i="'+i+'" d="'+d+'" stroke="url(#w7Vessel)" stroke-width="'+(28-i*3)+'"/>').join('')+'</g>'+
   '<g class="w7-big">'+
    '<path d="'+P.CAVA+'" fill="none" stroke="#2c0912" stroke-width="34" stroke-linecap="round"/>'+
    '<path d="'+P.BRANCH+'" fill="none" stroke="#4a1220" stroke-width="15" stroke-linecap="round"/>'+
    '<path d="'+P.AORTA+'" fill="none" stroke="#6a1a2a" stroke-width="36" stroke-linecap="round"/>'+
    '<path d="'+P.PULM+'" fill="none" stroke="#3e0e1a" stroke-width="26" stroke-linecap="round"/>'+
    '<use href="#w7Big" fill="url(#w7Heart)"/>'+
    '<use class="w7-drain" href="#w7Big" fill="url(#w7Drained)" opacity="0"/>'+
    '<g clip-path="url(#w7BigClip)">'+
     '<path d="'+P.GROOVE+'" fill="none" stroke="#1e050b" stroke-opacity=".5" stroke-width="10" filter="url(#w7Soft)"/>'+
     '<path d="'+P.CORONARY+'" fill="none" stroke="#e8b098" stroke-opacity=".24" stroke-width="2.8" stroke-linecap="round"/>'+
     '<path d="M560,288 C562,258 598,246 634,256 C664,266 670,306 656,340 C642,372 600,382 578,360 C560,342 558,314 560,288 Z" fill="#08020a"/>'+
     '<g class="w7-bigcracks" fill="none" stroke="#f3f5ea" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#w7Soft)">'+
      BIG_CRACKS.map(d=>'<path class="w7-bc" d="'+d+'" stroke-dasharray="260" stroke-dashoffset="260"/>').join('')+'</g>'+
    '</g>'+
    '<path d="'+P.BIG+'" fill="none" stroke="#e39a96" stroke-opacity=".2" stroke-width="2.4"/>'+
   '</g>'+
   // 작은 심장 (작살이 꽂힌 채)
   '<circle class="w7-leak" cx="'+SC[0].toFixed(1)+'" cy="'+SC[1].toFixed(1)+'" r="90" fill="url(#w7Leak)" opacity="0"/>'+
   '<g class="w7-small">'+
    '<path d="'+SMALL_SHAPE+'" fill="url(#w7Pale)" stroke="#e9ece0" stroke-opacity=".45" stroke-width="1"/>'+
    '<g fill="none" stroke-linecap="round" stroke-linejoin="round">'+
     '<path d="M2,-10 L-6,2 L4,10 L-4,24 M2,-10 L14,-16 L22,-8 M-6,2 L-18,6 L-24,0 M4,10 L16,14 L24,8" stroke="#3a0811" stroke-width="2.4"/>'+
     '<path class="w7-crackglow" d="M2,-10 L-6,2 L4,10 L-4,24 M2,-10 L14,-16 L22,-8 M-6,2 L-18,6 L-24,0 M4,10 L16,14 L24,8" stroke="#fbfff0" stroke-width="2.2" opacity="0" filter="url(#w7Soft)"/>'+
    '</g>'+
   '</g>'+
   '<g class="w7-harpoon">'+
    '<path d="M-104,0 L-10,0" stroke="#15191b" stroke-width="4" stroke-linecap="round"/>'+
    '<path d="M-104,-1.2 L-12,-1.2" stroke="#ffd9b0" stroke-opacity=".55" stroke-width="1.1"/></g>'+
   '<g class="w7-shards">'+SHARDS.map((s,i)=>'<path class="w7-shard" data-i="'+i+'" d="'+s.d+'" fill="'+(i%3?'#d9ddd1':'#9aa298')+'" stroke="#f6f8ee" stroke-opacity=".5" stroke-width=".8" opacity="0"/>').join('')+'</g>'+
   '<circle class="w7-burst" cx="'+SC[0].toFixed(1)+'" cy="'+SC[1].toFixed(1)+'" r="40" fill="none" stroke="#f6f8ee" opacity="0" filter="url(#w7Glow)"/>'+
  '</g>'+
  /* ---- 바깥: 숨이 끊긴 고래 ---- */
  '<g class="w7-out" opacity="0">'+
   '<rect width="'+W+'" height="'+H+'" fill="url(#w7Sky)"/>'+
   '<circle cx="808" cy="104" r="190" fill="url(#w7Moon)"/>'+
   '<circle cx="808" cy="104" r="27" fill="#dfe3da" opacity=".45" filter="url(#w7Soft)"/>'+
   '<g class="w7-mist" filter="url(#w7Mist)"><rect x="-200" y="250" width="700" height="34" rx="17" fill="#c7d2d2" opacity=".1"/><rect x="560" y="226" width="760" height="40" rx="20" fill="#c7d2d2" opacity=".09"/></g>'+
   '<path d="M0,'+SEA+' H'+W+'" stroke="#a8b9bb" stroke-opacity=".18" stroke-width="1.2"/>'+
   '<g class="w7-whale">'+
    '<use href="#w7Whale" fill="url(#w7Skin)"/>'+
    '<g clip-path="url(#w7WhaleClip)">'+
     '<rect x="500" y="130" width="520" height="240" filter="url(#w7Tex)" opacity=".55"/>'+
     '<use href="#w7Whale" fill="url(#w7Face)"/>'+
     (window.WhaleMarks?window.WhaleMarks.pallidSkin()+window.WhaleMarks.pallidTeeth():'')+
     '<path d="M560,318 C620,332 690,334 752,322" fill="none" stroke="#1d2529" stroke-opacity=".6" stroke-width="3"/>'+
     // 감긴 눈
     '<path d="M737,298 Q748,304 759,298" fill="none" stroke="#2a3437" stroke-width="2.6" stroke-linecap="round"/>'+
     '<ellipse cx="'+IMPACT[0]+'" cy="'+IMPACT[1]+'" rx="6" ry="4.5" fill="#14070a"/>'+
     '<path d="M'+IMPACT[0]+','+(IMPACT[1]+3)+' c-1.5,32 1.5,64 -0.5,96" stroke="#2c0b11" stroke-width="2.6" fill="none"/>'+
    '</g>'+
    '<path d="'+WHALE_TOP+'" fill="none" stroke="#f4f5ec" stroke-opacity=".6" stroke-width="2.6" filter="url(#w7Soft)"/>'+
    (window.WhaleMarks?window.WhaleMarks.pallidHarpoons():'')+
    // 이마에 남은 작살
    '<path d="M'+(IMPACT[0]+8)+','+(IMPACT[1]-3)+' L'+(IMPACT[0]-88)+','+(IMPACT[1]-34)+'" stroke="#15191b" stroke-width="4" stroke-linecap="round"/>'+
   '</g>'+
   '<rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" fill="url(#w7Sea)"/>'+
   '<g class="w7-moonpath" fill="#dfe6e2">'+[0,1,2,3,4,5].map(i=>'<rect class="w7-glint" data-i="'+i+'" x="'+(770-i*14)+'" y="'+(SEA+10+i*i*3.6+i*7)+'" width="'+(40+i*26)+'" height="'+(1.4+i*.3).toFixed(2)+'" rx="1" opacity=".1" filter="url(#w7Soft)"/>').join('')+'</g>'+
   '<g class="w7-rings" fill="none" stroke="#dfe8e6">'+[0,1,2].map(i=>'<ellipse class="w7-ring" data-i="'+i+'" cx="660" cy="'+(SEA+4)+'" rx="200" ry="10"/>').join('')+'</g>'+
   '<ellipse class="w7-lampglint" cy="'+(SEA+9)+'" rx="22" ry="3" fill="#ffbf47" filter="url(#w7Soft)" opacity=".3"/>'+
   '<g clip-path="url(#w7Above)"><g class="w7-boat">'+BOAT+'</g></g>'+
   '<g class="w7-mist near" filter="url(#w7Mist)"><rect x="-300" y="'+(SEA-16)+'" width="900" height="30" rx="15" fill="#d3dcdc" opacity=".08"/></g>'+
  '</g>'+
  '<rect class="w7-white" width="'+W+'" height="'+H+'" fill="#f3f2e9" opacity="0"/>'+
  '<rect class="w7-veil" width="'+W+'" height="'+H+'" fill="#020103" opacity="0"/>'+
 '</g></svg>';
 return '<div class="pallid-cine-v2 pallid-cine-v3 w7-victory-scene" role="img" aria-label="'+esc(LABEL[0]+' · '+LABEL[1])+'">'+svg+
  '<span class="cine-top" aria-hidden="true">모든 것을 삼키는 창백한 고래 · '+esc(LABEL[0])+'</span>'+
  '<span class="cine-bottom" aria-hidden="true">'+esc(LABEL[1])+'</span>'+
  '<span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}

/* ---------- 애니메이션 (1회 재생 후 머묾) ---------- */
const T={leak:[0.2,1.6],shatter:1.6,stop:[1.9,3.3],crack:[2.2,3.6],white:[3.7,4.5],out:[4.5,6.2]};
function lubdub(p){p=((p%1)+1)%1;return Math.exp(-Math.pow((p-0.06)/0.05,2))+0.6*Math.exp(-Math.pow((p-0.24)/0.05,2));}

let start=0,lastSeen=0,seenTok=0;
function frame(now){
 const el=document.querySelector('.w7-victory-scene');
 if(el&&el.isConnected){
  const paused=!!el.closest('.is-paused');
  const tok=(window.PallidCinematicV3||{}).replayToken||0;
  if(now-lastSeen>900||tok!==seenTok){start=now;seenTok=tok;}   // 새로 열리거나 '다시 재생'일 때만 처음부터
  if(paused)start+=now-lastSeen;
  lastSeen=now;
  paint(el,el.dataset.seek!=null?+el.dataset.seek:(now-start)/1000);
 }
 requestAnimationFrame(frame);
}
function paint(el,t){
 const q=s=>el.querySelector(s),qa=s=>el.querySelectorAll(s);
 const inside=t<T.out[0]+0.2;
 if(inside){
  // 큰 심장: 빠르게 경련하다가 멎음
  const life=1-clamp((t-T.stop[0])/(T.stop[1]-T.stop[0]));
  const beat=lubdub(t/0.5)*life;
  const sh=t<T.shatter?4*clamp(t/T.shatter):Math.max(0,9*Math.exp(-(t-T.shatter)*1.6));
  const shake=[Math.sin(t*67)*sh,Math.sin(t*53+1)*sh];
  const k=P.SCL*(1+beat*0.04-0.03*(1-life)),rot=P.ROT+Math.sin(t*19)*1.4*life*(t>T.shatter?1:0.4);
  q('.w7-big').setAttribute('transform','translate('+(P.PLACE[0]+shake[0]).toFixed(1)+' '+(P.PLACE[1]+shake[1]).toFixed(1)+') rotate('+rot.toFixed(2)+') scale('+k.toFixed(4)+') translate('+(-P.HC[0])+' '+(-P.HC[1])+')');
  q('.w7-drain').style.opacity=(0.85*inOut((t-T.stop[0]-0.3)/1.6)).toFixed(3);
  qa('.w7-bc').forEach((c,i)=>c.style.strokeDashoffset=(260*(1-outC((t-T.crack[0]-i*0.18)/(T.crack[1]-T.crack[0])))).toFixed(1));
  qa('.w7-vessel').forEach(v=>{const i=+v.dataset.i;v.style.strokeWidth=((28-i*3)*(1+0.12*beat-0.25*(1-life))).toFixed(1);v.style.opacity=(0.5+0.5*life).toFixed(3);});
  // 작은 심장: 금 사이로 빛이 새다가 부서짐
  const leak=clamp((t-T.leak[0])/(T.leak[1]-T.leak[0]));
  const pulse=0.6+0.4*Math.sin(t*(10+leak*18));
  const small=q('.w7-small'),cg=q('.w7-crackglow'),lk=q('.w7-leak');
  const sx=SC[0]+shake[0],sy=SC[1]+shake[1];
  if(t<T.shatter){
   small.style.opacity='1';
   small.setAttribute('transform','translate('+sx.toFixed(1)+' '+sy.toFixed(1)+') rotate('+(P.ROT-8)+') scale('+(P.SCL*(1+0.06*pulse*leak)).toFixed(4)+')');
   cg.style.opacity=(leak*pulse).toFixed(3);
   lk.style.opacity=(0.15+0.75*leak*pulse).toFixed(3);lk.setAttribute('r',(50+60*leak).toFixed(1));
  }else{
   small.style.opacity='0';
   const f=t-T.shatter;
   lk.style.opacity=(Math.exp(-f*2.2)).toFixed(3);lk.setAttribute('r',(110+260*outC(f/0.8)).toFixed(1));
  }
  // 작살: 작은 심장이 부서지면 꽂혀 있던 자리에서 기울며 떨어짐
  const ha=-150*Math.PI/180;
  let hx=sx+8,hy=sy+2,hr=26;
  if(t>T.shatter){const f=t-T.shatter;hx+= -40*f;hy+=180*f*f;hr+=f*60;}
  const hp=q('.w7-harpoon');hp.setAttribute('transform','translate('+hx.toFixed(1)+' '+hy.toFixed(1)+') rotate('+hr.toFixed(1)+')');
  hp.style.opacity=t>T.shatter+1.2?'0':'1';
  // 파편
  qa('.w7-shard').forEach(s=>{
   const S=SHARDS[+s.dataset.i],f=t-T.shatter;
   if(f<=0||f>2.2){s.style.opacity='0';return;}
   const x=SC[0]+Math.cos(S.a)*S.v*f,y=SC[1]+Math.sin(S.a)*S.v*f+140*f*f;
   s.setAttribute('transform','translate('+x.toFixed(1)+' '+y.toFixed(1)+') rotate('+(S.spin*f).toFixed(1)+')');
   s.style.opacity=(1-f/2.2).toFixed(3);
  });
  const b=q('.w7-burst'),f=t-T.shatter;
  b.setAttribute('r',(30+outC(f/0.9)*260).toFixed(1));b.style.opacity=f>0&&f<0.9?(0.55*(1-f/0.9)).toFixed(3):'0';
  b.style.strokeWidth=(f>0?5*(1-clamp(f/0.9))+0.8:0).toFixed(1);
 }
 q('.w7-in').style.display=inside?'':'none';
 // 하얗게 번짐 → 바깥 장면
 const wIn=inOut((t-T.white[0])/(T.white[1]-T.white[0])),wOut=inOut((t-T.out[0])/(T.out[1]-T.out[0]));
 q('.w7-white').style.opacity=(0.95*wIn*(1-wOut)+(t>T.shatter&&t<T.shatter+0.5?0.55*(1-(t-T.shatter)/0.5):0)).toFixed(3);
 const out=q('.w7-out');out.style.opacity=t>=T.out[0]?'1':'0';
 if(t>=T.out[0]){
  const u=t-T.out[0];
  // 고래: 천천히 기울며 수면에 가라앉은 채 떠 있음
  const tilt=3+Math.min(3,u*0.4)+Math.sin(u*0.5)*0.4,dy=78+Math.sin(u*0.6)*2.5+Math.min(10,u*1.5);
  q('.w7-whale').setAttribute('transform','translate(30 '+dy.toFixed(1)+') rotate('+tilt.toFixed(2)+' 760 340)');
  qa('.w7-ring').forEach(r=>{const i=+r.dataset.i,p=((u*0.18+i/3)%1);r.setAttribute('rx',(200+p*260).toFixed(1));r.setAttribute('ry',(8+p*12).toFixed(1));r.style.strokeOpacity=((1-p)*0.28).toFixed(3);r.style.strokeWidth=(1.8-p).toFixed(2);});
  qa('.w7-glint').forEach(g=>{const i=+g.dataset.i;g.style.opacity=(0.05+0.09*(0.5+0.5*Math.sin(u*2.3+i*1.7))).toFixed(3);});
  qa('.w7-mist').forEach((m,i)=>m.setAttribute('transform','translate('+(Math.sin(u*0.13+i*2)*50).toFixed(1)+' 0)'));
  const bx=230+Math.sin(u*0.2)*6,by=SEA+Math.sin(u*1.4)*2,br=Math.sin(u*1.1)*2;
  q('.w7-boat').setAttribute('transform','translate('+bx.toFixed(1)+' '+by.toFixed(1)+') rotate('+br.toFixed(2)+') scale(1.6)');
  const lampK=0.86+Math.sin(u*7.3)*.05+Math.sin(u*12.9+1.7)*.04;
  const lg=q('.w3-lampglow');if(lg)lg.style.opacity=lampK.toFixed(3);
  const gl=q('.w7-lampglint');gl.setAttribute('cx',(bx+82).toFixed(1));gl.style.opacity=(0.4*lampK).toFixed(3);
 }
 // 처음 진입 시 어둠에서 열림
 q('.w7-veil').style.opacity=(t<0.4?0.9*(1-t/0.4):0).toFixed(3);
 // 쪽배 위 작살잡이 팔은 내린 자세
 const arm=q('.w7-out .w3-arm');if(arm)arm.setAttribute('d','M29,-23 L33,-13');
}
requestAnimationFrame(frame);

/* ---------- 연결 ---------- */
const prev=V2.html;
function sceneHtml(name){return name==='victory'?victoryHtml():prev(name);}
window.PallidCinematicV2=Object.assign({},V2,{html:sceneHtml});
V3.html=sceneHtml;V3.victory=victoryHtml;
try{
 if(typeof pallidFxMarkup162==='function'){
  pallidFxMarkup162=sceneHtml;
  if(typeof render==='function')render();
 }
}catch(e){console.warn('창백한 고래 심장 파괴 장면 연결 지연',e);}
})();
