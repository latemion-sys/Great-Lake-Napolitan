/* 창백의 향유고래 · v3 시네마틱 · 3단계 이어서: 창백한 것에 뒤덮인 것들
   위산을 넘자 드러난 넓은 위장벽. 벽과 살 턱에 늘어져 있던 인어들(머리와 어깨가
   창백한 덩어리에 뒤덮임)이 한꺼번에 고개를 들고, 기묘한 노래를 되풀이한다.
   어디선가 커다란 심장 박동이 울린다. 인어는 원작 디자인을 따르지 않은 창작 형태.
   시간 기준 requestAnimationFrame 방식. */
(function(){
'use strict';
const V3=window.PallidCinematicV3,V2=window.PallidCinematicV2;
if(!V3||!V3.shared||!V2)return;
const {W,H,BOAT,seeded,esc,clamp,outC,inOut}=V3.shared;
const LOOP=9.0;
const LABEL=['창백한 것에 뒤덮인 것들','뭉개진 목소리가 기묘한 노랫소리를 되풀이합니다.'];
const POOL=430;

/* 인어 배치: [x, y(기준점), 크기, 회전(벽에 붙은 것), 깊이(0 앞 ~ 1 뒤), 시드, 종류(pool|wall)] */
const MER=[
 [392,426,1.45,0,0.1,11,'pool'],
 [572,430,1.75,0,0.0,37,'pool'],
 [760,424,1.35,4,0.2,53,'pool'],
 [470,214,0.62,-78,0.7,23,'wall'],
 [818,170,0.55,-100,0.75,41,'wall'],
 [655,300,0.7,-8,0.55,67,'pool']
];

// 창백한 조직: 작은 혹이 촘촘히 모인 덩어리와 피부 위로 번진 흰 핏줄
function lumps(r,cx,cy,n,spread){
 let s='';
 for(let i=0;i<n;i++){
  const a=r()*Math.PI*2,d=Math.pow(r(),0.7)*spread,rad=1.4+r()*3.6*(1-d/spread*0.6);
  s+='<circle cx="'+(cx+Math.cos(a)*d).toFixed(1)+'" cy="'+(cy+Math.sin(a)*d*0.75).toFixed(1)+'" r="'+rad.toFixed(1)+'"/>';
 }
 return s;
}
function veins(r,x0,y0,n,len){
 let s='';
 for(let i=0;i<n;i++){
  let x=x0+(r()-.5)*8,y=y0+(r()-.5)*6,d='M'+x.toFixed(1)+','+y.toFixed(1);
  const a0=Math.PI*(0.3+r()*0.6);
  for(let k=0;k<4;k++){const a=a0+(r()-.5)*0.9;x+=Math.cos(a)*len*0.25;y+=Math.sin(a)*len*0.25;d+=' L'+x.toFixed(1)+','+y.toFixed(1);}
  s+='<path d="'+d+'"/>';
 }
 return s;
}
function mermaid(i){
 const [x,y,sc,rot,depth,seed]=MER[i];
 const r=seeded(seed);
 const dark=depth>0.5?'#140a0e':'#08090b';
 const pale=depth>0.5?'#9fa398':'#dfe2d5';
 // 왼쪽을 향해 등을 구부린 상체. 원점은 위액 수면(허리)
 const torso='M12,6 C16,-16 12,-40 0,-58 C-6,-67 -18,-68 -22,-60 C-26,-46 -18,-22 -12,6 Z';
 const tail='M-12,6 C-14,26 -2,40 18,44 C34,47 46,40 54,30 L64,22 L60,36 L74,42 L56,44 C42,56 18,58 0,48 C-14,40 -18,24 -16,6 Z';
 const arms='M-18,-56 C-30,-44 -40,-26 -46,-4 M-46,-4 L-52,2 M-46,-4 L-48,4 M-46,-4 L-43,4 M-6,-58 C2,-42 8,-22 8,0';
 const head='M0,0 C-4,-10 -18,-14 -32,-10 C-40,-7 -42,0 -36,5 C-26,10 -12,9 -4,6 C0,5 1,3 0,0 Z';
 return '<g class="w8-mer" data-i="'+i+'" opacity="'+(1-depth*0.3).toFixed(2)+'">'+
  '<path d="'+tail+'" fill="'+dark+'"/>'+
  '<path d="'+torso+'" fill="'+dark+'" stroke="#c99a98" stroke-opacity=".22" stroke-width="1.1"/>'+
  '<path d="M-12,6 C-18,-22 -26,-46 -22,-60" fill="none" stroke="#b8cf6a" stroke-opacity=".28" stroke-width="1.6"/>'+
  '<path d="'+arms+'" fill="none" stroke="'+dark+'" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>'+
  // 어깨와 등에 번진 백화 조직
  '<g fill="none" stroke="'+pale+'" stroke-width=".9" stroke-opacity=".55" stroke-linecap="round">'+veins(r,-8,-52,7,46)+'</g>'+
  '<g fill="'+pale+'">'+lumps(r,-8,-58,26,13)+lumps(r,4,-36,8,7)+'</g>'+
  // 길게 뻗은 목과 머리 (숙였다가 듦)
  '<g class="w8-head" transform="translate(-14 -62)">'+
   '<path d="M0,0 C-2,-8 -6,-14 -10,-18" fill="none" stroke="'+dark+'" stroke-width="8" stroke-linecap="round"/>'+
   '<g transform="translate(-10 -18)">'+
    '<path d="'+head+'" fill="'+dark+'" stroke="#c99a98" stroke-opacity=".25" stroke-width="1"/>'+
    // 머리를 뒤덮은 창백한 덩어리 — 아래턱과 입만 드러남
    '<g fill="'+pale+'">'+lumps(r,-16,-6,30,13)+lumps(r,-4,-4,10,6)+'</g>'+
    '<g fill="none" stroke="'+pale+'" stroke-width="1.3" stroke-linecap="round" opacity=".8">'+veins(r,-20,0,4,16)+'</g>'+
    '<path class="w8-mouth" d="M-34,4 Q-24,6 -12,5 Q-24,6 -34,4 Z" fill="#000"/>'+
   '</g>'+
  '</g>'+
 '</g>';
}
function wallFolds(){
 const r=seeded(88);let s='';
 for(let i=0;i<9;i++){
  const x0=20+i*112+r()*30;let d='M'+x0.toFixed(0)+',-20';
  for(let y=-20;y<POOL+10;y+=60)d+=' Q'+(x0+(r()-.5)*50).toFixed(0)+','+(y+30)+' '+(x0+(r()-.5)*24).toFixed(0)+','+(y+60);
  s+='<path d="'+d+'" stroke-width="'+(18+r()*16).toFixed(0)+'"/>';
 }
 return s;
}

function mermaidsHtml(){
 const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'+
 '<defs>'+
  '<radialGradient id="w8Wall" cx=".55" cy=".4" r=".8"><stop stop-color="#3a1420"/><stop offset=".55" stop-color="#1c080e"/><stop offset="1" stop-color="#060204"/></radialGradient>'+
  '<linearGradient id="w8Acid" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#9fb55a" stop-opacity=".85"/><stop offset=".2" stop-color="#4f6a2a" stop-opacity=".9"/><stop offset="1" stop-color="#0b1108"/></linearGradient>'+
  '<radialGradient id="w3Lamp"><stop stop-color="#ffbf47" stop-opacity=".95"/><stop offset=".22" stop-color="#ffbf47" stop-opacity=".42"/><stop offset=".6" stop-color="#ffbf47" stop-opacity=".08"/><stop offset="1" stop-color="#ffbf47" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w8Warm"><stop stop-color="#ffb35a" stop-opacity=".3"/><stop offset=".45" stop-color="#d0685a" stop-opacity=".1"/><stop offset="1" stop-color="#d0685a" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w8Pale"><stop stop-color="#e9ece0" stop-opacity=".22"/><stop offset="1" stop-color="#e9ece0" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="w8Beat" cx=".5" cy=".5" r=".7"><stop stop-color="#000" stop-opacity="0"/><stop offset=".6" stop-color="#3a0610" stop-opacity=".2"/><stop offset="1" stop-color="#5a0a18" stop-opacity=".75"/></radialGradient>'+
  '<filter id="w8Soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>'+
  '<filter id="w8Far" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.1"/></filter>'+
  '<filter id="w8Tex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".02 .07" numOctaves="3" seed="31"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .18  0 0 0 0 .24  0 0 0 1.4 -.55"/></filter>'+
 '</defs>'+
 '<g class="w8-root">'+
  '<rect width="'+W+'" height="'+H+'" fill="url(#w8Wall)"/>'+
  '<rect width="'+W+'" height="'+H+'" filter="url(#w8Tex)" opacity=".16"/>'+
  // 넓은 위장벽의 세로 주름
  '<g class="w8-wall">'+
   '<g fill="none" stroke="#2c0c15" stroke-linecap="round" opacity=".9">'+wallFolds()+'</g>'+
   '<g fill="none" stroke="#c97a7a" stroke-opacity=".08" stroke-width="2.4" stroke-linecap="round" transform="translate(-7 0)">'+wallFolds().replace(/stroke-width="[^"]*"/g,'')+'</g>'+
  '</g>'+
  // 벽 곳곳에 번진 창백한 자국
  '<g fill="url(#w8Pale)">'+[[300,180,110],[610,140,140],[820,220,120],[480,330,90]].map(([x,y,r])=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'"/>').join('')+'</g>'+
  // 인어들 (뒤 → 앞)
  '<g class="w8-mers">'+MER.map((m,i)=>[m[4],i]).sort((a,b)=>b[0]-a[0]).map(([d,i])=>d>0.5?'<g filter="url(#w8Far)">'+mermaid(i)+'</g>':mermaid(i)).join('')+'</g>'+
  // 노랫소리 물결
  '<g class="w8-song" fill="none" stroke="#e6ebdc" stroke-linecap="round">'+MER.map((m,i)=>[0,1,2].map(k=>'<path class="w8-wave" data-i="'+i+'" data-k="'+k+'" opacity="0"/>').join('')).join('')+'</g>'+
  // 낮게 고인 위액과 쪽배
  '<path class="w8-acid" fill="url(#w8Acid)"/>'+
  '<path class="w8-crest" fill="none" stroke="#e9f7a6" stroke-opacity=".55" stroke-width="1.6" filter="url(#w8Soft)"/>'+
  '<g class="w8-boat">'+BOAT+'<path d="M-50,-11 L-44,-8 L38,-8 Q47,-9 55,-17 L52,-9 Q47,3 33,6 L-34,6 Q-46,4 -50,-11 Z" fill="none" stroke="#e0a58f" stroke-opacity=".35" stroke-width=".9"/></g>'+
  '<circle class="w8-warm" r="230" fill="url(#w8Warm)"/>'+
  // 심장 박동: 가장자리가 붉게 조여듦
  '<rect class="w8-beat" width="'+W+'" height="'+H+'" fill="url(#w8Beat)" opacity="0"/>'+
  '<rect class="w8-veil" width="'+W+'" height="'+H+'" fill="#020103" opacity="0"/>'+
 '</g></svg>';
 return '<div class="pallid-cine-v2 pallid-cine-v3 w8-mermaid-scene" role="img" aria-label="'+esc(LABEL[0]+' · '+LABEL[1])+'">'+svg+
  '<span class="cine-top" aria-hidden="true">창백의 향유고래 · '+esc(LABEL[0])+'</span>'+
  '<span class="cine-bottom" aria-hidden="true">'+esc(LABEL[1])+'</span>'+
  '<span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}

/* ---------- 애니메이션 ---------- */
const T={drift:[0.3,2.6],lift:[2.6,3.1],loop:[8.3,9.0]};
function lubdub(p){p=((p%1)+1)%1;return Math.exp(-Math.pow((p-0.06)/0.045,2))+0.6*Math.exp(-Math.pow((p-0.22)/0.045,2));}
function poolY(x,t){return POOL+Math.sin(x*0.016+t*1.6)*3+Math.sin(x*0.006-t*.8)*2.5;}

let start=0,lastSeen=0,seenTok=0;
function frame(now){
 const el=document.querySelector('.w8-mermaid-scene');
 if(el&&el.isConnected){
  const paused=!!el.closest('.is-paused');
  const tok=(window.PallidCinematicV3||{}).replayToken||0;
  if(now-lastSeen>900||tok!==seenTok){start=now;seenTok=tok;}
  if(paused)start+=now-lastSeen;
  lastSeen=now;
  paint(el,el.dataset.seek!=null?+el.dataset.seek:((now-start)/1000)%LOOP);
 }
 requestAnimationFrame(frame);
}
function paint(el,t){
 const q=s=>el.querySelector(s),qa=s=>el.querySelectorAll(s);
 // 심장 박동 (1.3초)
 const beat=lubdub(t/1.3);
 q('.w8-beat').style.opacity=(0.75*beat).toFixed(3);
 q('.w8-wall').setAttribute('transform','translate(480 270) scale('+(1+beat*0.008).toFixed(4)+') translate(-480 -270)');
 // 위액
 let d='';for(let x=-40;x<=1000;x+=24)d+=(d?' L':'M')+x+','+poolY(x,t).toFixed(1);
 q('.w8-acid').setAttribute('d',d+' L1000,'+(H+10)+' L-40,'+(H+10)+' Z');
 q('.w8-crest').setAttribute('d',d);
 // 쪽배: 위산을 건너 천천히 들어와 멈춤
 const bx=90+120*outC((t-T.drift[0])/(T.drift[1]-T.drift[0])),by=poolY(bx,t)-2;
 const roll=Math.sin(t*1.2)*2;
 q('.w8-boat').setAttribute('transform','translate('+bx.toFixed(1)+' '+by.toFixed(1)+') rotate('+roll.toFixed(2)+') scale(1.3)');
 const lampK=0.86+Math.sin(t*7.3)*.05+Math.sin(t*12.9+1.7)*.04;
 const lg=q('.w3-lampglow');if(lg)lg.style.opacity=lampK.toFixed(3);
 const warm=q('.w8-warm');warm.setAttribute('cx',(bx+70).toFixed(1));warm.setAttribute('cy',(by-40).toFixed(1));warm.style.opacity=lampK.toFixed(3);
 // 인어: 고개 숙임 → 한꺼번에 고개를 듦 → 흔들리며 노래
 qa('.w8-mer').forEach(m=>{
  const i=+m.dataset.i,[x,y,sc,rot,depth,,kind]=MER[i];
  const lift=outC((t-T.lift[0]-i*0.03)/(T.lift[1]-T.lift[0]));
  const sway=Math.sin(t*1.15+i*0.9)*(1.5+2.5*lift);
  // 고개를 숙이고(땅 쪽으로 꺾임) 있다가 한꺼번에 젖히듯 듦
  const headDeg=-58*(1-lift)+(lift>0&&lift<1?Math.sin(lift*Math.PI)*16:0)+Math.sin(t*1.6+i)*5*lift+8*lift;
  const rise=kind==='pool'?(1-lift)*10:0;   // 위액 속에 웅크렸다가 몸을 일으킴
  m.setAttribute('transform','translate('+x+' '+(y+rise).toFixed(1)+') rotate('+(rot+sway*0.6).toFixed(2)+') scale('+sc+')');
  m.querySelector('.w8-head').setAttribute('transform','translate(-14 -62) rotate('+headDeg.toFixed(2)+')');
  // 입: 노래하며 벌어졌다 닫힘
  const sing=lift*(0.5+0.5*Math.sin(t*5.2+i*0.7));
  const o=(1+sing*7).toFixed(1);
  m.querySelector('.w8-mouth').setAttribute('d','M-34,4 Q-24,'+(6+ +o*0.4).toFixed(1)+' -12,5 Q-24,'+(6+ +o).toFixed(1)+' -34,4 Z');
 });
 // 노랫소리 물결: 고개를 든 인어의 입에서 퍼지는 흐린 호
 qa('.w8-wave').forEach(w=>{
  const i=+w.dataset.i,k=+w.dataset.k,[x,y,sc,rot,depth]=MER[i];
  const lift=outC((t-T.lift[0])/(T.lift[1]-T.lift[0]));
  const ph=((t*0.7+k/3+i*0.13)%1);
  const ra=rot*Math.PI/180,lx=-58,ly=-76;   // 입의 대략적 위치(고개를 든 상태)
  const mx=x+sc*(lx*Math.cos(ra)-ly*Math.sin(ra)),my=y+sc*(lx*Math.sin(ra)+ly*Math.cos(ra)),R=(10+ph*90)*sc;
  w.setAttribute('d','M'+(mx-R*0.25).toFixed(1)+','+(my-R).toFixed(1)+' Q'+(mx-R*1.15).toFixed(1)+','+my.toFixed(1)+' '+(mx-R*0.25).toFixed(1)+','+(my+R).toFixed(1));
  w.style.opacity=(lift*(1-ph)*0.4*(1-depth*0.5)).toFixed(3);
  w.style.strokeWidth=(1.8-ph*1.2).toFixed(2);
 });
 // 반복 경계
 const v=t<0.6?1-t/0.6:clamp((t-T.loop[0])/(T.loop[1]-T.loop[0]));
 q('.w8-veil').style.opacity=(v*0.95).toFixed(3);
}
requestAnimationFrame(frame);

/* ---------- 연결 ---------- */
const prev=V2.html;
function sceneHtml(name){return name==='mermaids'?mermaidsHtml():prev(name);}
const names=Object.assign({},V2.names,{mermaids:LABEL});
window.PallidCinematicV2=Object.assign({},V2,{html:sceneHtml,names});
V3.html=sceneHtml;V3.mermaids=mermaidsHtml;
try{
 if(typeof PALLID_FX_LABELS162==='object')PALLID_FX_LABELS162.mermaids=LABEL;
 // 인어 단계와 인어 전투는 위산 장면 대신 이 장면을 보여 준다
 if(typeof pallidFxNow162==='function'){
  const beforeNow=pallidFxNow162;
  pallidFxNow162=function(){
   if(state.scene==='battle'&&state.battle&&state.battle.type==='pallidMermaid161')return 'mermaids';
   if(state.scene===PALLID_SCENE_161&&state.pallidHunt161&&state.pallidHunt161.phase==='mermaids')return 'mermaids';
   return beforeNow();
  };
 }
 if(typeof pallidFxMarkup162==='function'){
  pallidFxMarkup162=sceneHtml;
  if(typeof render==='function')render();
 }
}catch(e){console.warn('창백한 인어 장면 연결 지연',e);}
})();
