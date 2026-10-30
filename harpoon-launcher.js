/* 대호수 · 쪽빛 노인의 작살을 본뜬 석궁형 발사대 + 망(望)의 고리
   - 특수 작살(state.calamityHarpoon)을 산 선장의 배에만, 작살잡이 바로 옆(뱃머리 쪽) 받침대에 발사대를 그린다.
     배 그림(BOAT) 문자열 안에 들어가므로 배 · 사람과 같은 흔들림 · 반사 · 가림을 그대로 따른다.
   - 리벳으로 박은 금속판을 겹친 석궁 모양의 틀, 사람 키보다 긴 미늘 작살. 받침대 위에서 돌아가 선미 쪽으로도 겨눈다.
   - 망을 두르면(CalamityMang.rings()) 작살날 끝에서부터 달빛 색의 따스한 둥근 고리가 하나씩 감긴다.
     · 특수 작살이 있으면: 발사대에 걸린 작살에 감기고, 그 작살이 고리째 발사된다. 밧줄은 발사대 틀에 매여 있고,
       다음에 쏠 때는 그 밧줄로 감아 들인 같은 작살이 틀에 다시 걸린다(새로 생기지 않음).
     · 특수 작살이 없으면: 발사대 없이 손에 든 일반 작살에 감아 던진다.
   좌표: 배의 원점(수면에 닿는 선체 중앙), 오른쪽이 뱃머리. 작살잡이는 x 22~32, 머리 (27,-30.5). */
(function(){
'use strict';
const RAD=Math.PI/180;
const PIVOT=[37,-29],ANGLE=-16,LEFT=-148;       // 받침대 꼭대기 · 기본 겨눔(뱃머리) · 선미 쪽 겨눔
const TIP=41.5;                                 // 받침대에서 작살날 끝까지
const ARM=[34.5,-24];                           // 발사대를 쥔 손(방아쇠)
const SLOT=[37,33.4,29.8,26.2,22.6];            // 발사대 작살: 고리 자리(날 끝 → 자루 쪽)
const FLY=[-4,-11.5,-19,-26.5,-34];             // 날아가는 작살(장면 좌표 크기): 고리 자리
const WIND=.72,GAP=.42;                          // 고리 하나가 감기는 시간 · 다음 고리까지 간격
const RELOAD=1.1;                                // 쏜 뒤 새 작살을 거는 데 걸리는 시간(초)

const n2=v=>Math.round(v*100)/100;
function owned(){try{return typeof state!=='undefined'&&!!state&&!!state.calamityHarpoon;}catch(e){return false;}}
function ringSet(rx,ry,gw,cw){
 let s='';
 for(let i=0;i<5;i++)s+='<g class="hl-ring" data-i="'+i+'" opacity="0">'+
  '<ellipse rx="'+rx+'" ry="'+ry+'" fill="none" stroke="#ffcf7a" stroke-width="'+gw+'" stroke-opacity=".28"/>'+
  '<ellipse rx="'+rx+'" ry="'+ry+'" fill="none" stroke="#fff2d2" stroke-width="'+cw+'"/></g>';
 return s;
}
function aimTf(a){return 'translate('+PIVOT[0]+' '+PIVOT[1]+') rotate('+a+')'+(Math.cos(a*RAD)<0?' scale(1 -1)':'');}

/* 배 위의 발사대 (배 좌표) */
function markup(opt){
 const o=opt||{},dark=o.dark||'#030405',fill='style="fill:'+dark+'"',stroke='style="stroke:'+dark+'"';
 let rivets='';
 for(const u of [-8,-4.5,-1,2.5,6])rivets+='<circle cx="'+u+'" cy="-.95" r=".42"/><circle cx="'+(u+1.6)+'" cy="1.15" r=".42"/>';
 return '<g class="hl-rig"'+(owned()?'':' style="display:none"')+'>'+
  // 받침대: 갑판에서 솟은 기둥과 버팀대
  '<path d="M37,-8 L37,-28.4 M32.6,-8 L37,-19" '+stroke+' stroke-width="1.5" stroke-linecap="round" fill="none"/>'+
  '<g class="hl-aim" transform="'+aimTf(ANGLE)+'">'+
   // 활(림): 겹친 금속판으로 된 짧고 두꺼운 양 날개
   '<path d="M5.2,0 Q3.6,-5 1.2,-9.2 M5.2,0 Q3.6,5 1.2,9.2" '+stroke+' stroke-width="2.1" stroke-linecap="round" fill="none"/>'+
   '<path d="M4.4,-1.5 Q3,-5.4 1.4,-8.2 M4.4,1.5 Q3,5.4 1.4,8.2" stroke="#7d8b90" stroke-opacity=".55" stroke-width=".35" fill="none"/>'+
   // 시위
   '<path d="M1.2,-9.2 L-6.8,0 L1.2,9.2" stroke="#b8c2c4" stroke-opacity=".5" stroke-width=".4" fill="none"/>'+
   // 걸려 있는 미늘 작살 + 망
   '<g class="hl-load">'+
    '<path d="M-8,0 L35,0" stroke="#15191b" stroke-width="1.25" stroke-linecap="round"/>'+
    '<path d="M-6,-.45 L34,-.45" stroke="#d3dcda" stroke-opacity=".45" stroke-width=".4"/>'+
    '<path d="M30.4,-.4 L28.2,-2.4 M30.4,.4 L28.2,2.4" stroke="#aeb9b8" stroke-width=".6" stroke-linecap="round"/>'+
    '<path d="M41.5,0 L34.2,-2.5 L35.8,0 L34.2,2.5 Z" fill="#dfe6e3" stroke="#aebbb9" stroke-width=".4" stroke-linejoin="round"/>'+
    '<path d="M35.6,-1.3 L32.2,-3.8 M35.6,1.3 L32.2,3.8" stroke="#c5cfcc" stroke-width=".7" stroke-linecap="round"/>'+
    '<g class="hl-halo" fill="#ffe2a0" opacity="0"><ellipse cx="33" rx="12" ry="7" opacity=".18"/><ellipse cx="34" rx="8.5" ry="5" opacity=".28"/><ellipse cx="35" rx="5.5" ry="3.2" opacity=".4"/></g>'+
    '<g class="hl-rings">'+ringSet(1.5,3.8,2.8,.75)+'</g>'+
   '</g>'+
   // 틀(개머리): 리벳으로 박은 금속판 여러 장을 겹친 석궁 몸통
   '<path d="M-10.5,-1.9 L8.5,-1.6 L9,1.7 L-10.5,2.2 Z" '+fill+'/>'+
   '<path d="M-8,-3 L5.5,-2.7 L5.5,-1.5 L-8,-1.7 Z M-9,2.1 L6.5,1.6 L6,3 L-9,3.4 Z" '+fill+'/>'+
   '<path d="M-4,2.6 L-5.6,6.6 L-3.3,6.8 L-2,3" '+fill+'/>'+
   '<path d="M-6.4,-2.8 L-6.6,3.2 M-2.4,-2.7 L-2.6,3.1 M1.6,-2.6 L1.5,2.9 M5.4,-2.5 L5.4,2.6" stroke="#5d6a70" stroke-opacity=".55" stroke-width=".3"/>'+
   '<g fill="#9aa7ab" opacity=".5">'+rivets+'</g>'+
  '</g>'+
 '</g>';
}
/* 날아가는(손에 든) 작살에 붙는 고리 — 장면마다 쓰는 작살 그림(자루 -104~-10, 날 끝 3)과 같은 좌표 */
function flyMarkup(){return '<g class="hl-fly">'+ringSet(3.1,8,5.8,1.6)+'</g>';}

/* ---------- 장면에서 쓰는 도우미 ----------
   own=HarpoonLauncher.owned()이면: 팔은 ARM, 손 작살은 숨기고, launch()가 돌려주는 날 끝 위치에서 작살을 출발시킨다. */
// 장면 종류별 장전 상태: 쏜 뒤(장전 X)에서 다시 장전되면, 새 작살이 생기는 대신 밧줄로 감아 들인 작살이 틀 앞에서 미끄러져 들어와 걸린다
const reel=new Map();
const REEL=.6;
function launch(el,toWorld,o){
 const opt=o||{},a=opt.aim==null?ANGLE:opt.aim,loaded=opt.loaded!==false,now=performance.now();
 const key=String(el.className||'scene').split(' ')[0];
 const st=reel.get(key)||{loaded:true,at:-1e9,seen:0};
 if(loaded&&st.loaded===false&&now-st.seen<4000)st.at=now;
 st.loaded=loaded;st.seen=now;reel.set(key,st);
 const k=Math.min(1,(now-st.at)/(REEL*1000)),off=loaded?54*Math.pow(1-k,3):0;
 el.querySelectorAll('.hl-aim').forEach(g=>{if(g._a!==a){g._a=a;g.setAttribute('transform',aimTf(a));}});
 el.querySelectorAll('.hl-load').forEach(g=>{
  const v=loaded?'1':'0';if(g.getAttribute('opacity')!==v)g.setAttribute('opacity',v);
  const tf=off>.05?'translate('+n2(off)+' 0)':'';if((g.getAttribute('transform')||'')!==tf){if(tf)g.setAttribute('transform',tf);else g.removeAttribute('transform');}
 });
 const d=a*RAD;
 return toWorld([PIVOT[0]+Math.cos(d)*TIP,PIVOT[1]+Math.sin(d)*TIP]);
}
// 밧줄이 매인 곳: 발사대 틀 앞쪽(배 좌표)
function anchorLocal(aim){const d=(aim==null?ANGLE:aim)*RAD;return [PIVOT[0]+Math.cos(d)*7,PIVOT[1]+Math.sin(d)*7];}
// 손 작살을 쓰는 원래 코드에 넘길 '손 위치': 원래 코드가 손에서 [dx,dy]만큼 떨어진 곳을 출발점으로 쓰므로 그만큼 되돌린다
function handFor(muzzle,dx,dy){return [muzzle[0]-dx,muzzle[1]-dy];}

/* ---------- 망 고리 애니메이션 ---------- */
let shown=0;const at=[],atLoad=[];
function rings(){
 const C=window.CalamityMang;
 return Math.max(0,Math.min(5,C&&typeof C.rings==='function'?C.rings()|0:0));
}
function rewind(now){for(let i=0;i<5;i++)atLoad[i]=now+i*GAP*1000;}
function sync(now){
 const n=rings();
 if(n>shown){for(let i=shown;i<n;i++){at[i]=now+(i-shown)*GAP*1000;atLoad[i]=at[i];}}
 shown=n;
 return n;
}
function paintRings(list,n,now,times,G){
 const t=now/1000;let lit=0;
 list.forEach((g,i)=>{
  if(i>=n){if(g.getAttribute('opacity')!=='0')g.setAttribute('opacity','0');return;}
  const a=(now-(times[i]||0))/1000;
  if(a<0){g.setAttribute('opacity','0');return;}
  const p=Math.min(1,a/WIND),e=1-Math.pow(1-p,3);
  const u=G.from+(G.slots[i]-G.from)*e;                       // 날 끝 너머에서 미끄러져 들어와
  const ry=G.ry+G.widen*(1-e)+Math.sin(p*Math.PI)*G.ry*.16;   // 넓은 빛에서 작살을 조이며 감긴다
  const spin=G.rx*(1+.25*Math.sin(t*2.3+i*1.1));
  const flash=a>WIND?Math.max(0,1-(a-WIND)/.45):0;
  const [gl,co]=g.children;
  g.setAttribute('transform','translate('+n2(u)+' 0)');
  g.setAttribute('opacity',n2(Math.min(1,p*2.6)));
  gl.setAttribute('ry',n2(ry+G.ry*.13));gl.setAttribute('rx',n2(spin+G.rx*.27));
  gl.setAttribute('stroke-opacity',n2(.24+.09*Math.sin(t*1.7+i*1.3)+.45*flash));gl.setAttribute('stroke-width',n2(G.gw*(1+.85*flash)));
  co.setAttribute('ry',n2(ry));co.setAttribute('rx',n2(spin));
  lit+=p;
 });
 return lit;
}
const G_LOAD={from:44,slots:SLOT,ry:3.8,rx:1.5,widen:5.2,gw:2.8};
const G_FLY={from:14,slots:FLY,ry:8,rx:3.1,widen:11,gw:5.8};
function frame(now){
 const n=sync(now),own=owned(),t=now/1000;
 document.querySelectorAll('.hl-rig').forEach(rig=>{
  const disp=own?'':'none';if(rig.style.display!==disp)rig.style.display=disp;
  if(!own)return;
  const c=rig._hl||(rig._hl={r:Array.from(rig.querySelectorAll('.hl-ring')),halo:rig.querySelector('.hl-halo')});
  const lit=paintRings(c.r,n,now,atLoad,G_LOAD);
  if(c.halo)c.halo.setAttribute('opacity',n2(lit?Math.min(.55,.12+.08*lit)*(.85+.15*Math.sin(t*2.1)):0));
 });
 document.querySelectorAll('.hl-fly').forEach(f=>{
  const c=f._hl||(f._hl={r:Array.from(f.querySelectorAll('.hl-ring'))});
  paintRings(c.r,n,now,at,G_FLY);
 });
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);


/* ---------- 망을 감은 작살이 명중했을 때 ----------
   망 3개: 피부를 살짝 꿰뚫음  — 작은 빛 덩어리, 빛의 꽃잎, 고리 셋이 빛의 띠로 번짐, 빛방울
   망 4개: 피부를 뚫고 작살 몸통이 반쯤 파고듦 — 큰 빛 덩어리, 상처를 따라 번져 맥동하는 빛줄기, 상처의 빛, 고리 넷
   망 5개: 닿는 모든 것을 꿰뚫고 날아감 — 화면 섬광, 혜성 모양 빛의 굴, 반대편으로 피어나는 빛, 작살을 따라 나아가는 고리 다섯
   선(stroke)이나 직선은 쓰지 않고, 모두 부드러운 그라데이션 면으로 그린다.
   장면 좌표(960×540)에서 그린다. 각 장면이 매 프레임 paintHit(el,{s:명중 후 초, p:박힌 자리, ang:작살 방향(도), tier})를 부른다. */
function seededR(n){let x=n>>>0||1;return ()=>((x=(x*1664525+1013904223)>>>0)/4294967296);}
/* 선 대신 면으로: 부드러운 빛 덩어리 · 휘어진 빛의 꽃잎 · 곡선을 그리며 흩어지는 빛방울 · 번지는 빛의 띠 · 혜성 모양 빛의 굴 */
const PETALS=8,DOTS=34;
function petal(len,wid,curl){ // 통통하게 부풀었다가 끝이 둥글게 휘는 꽃잎 · 불꽃 혀 모양(면)
 const l=len,w=wid,c=curl;
 return 'M0,0 C'+n2(l*.08)+','+n2(-w*1.1)+' '+n2(l*.55)+','+n2(-w*1.35+c*.4)+' '+n2(l*.88)+','+n2(-w*.45+c*.9)+
  ' Q'+n2(l*1.04)+','+n2(c)+' '+n2(l*.86)+','+n2(w*.35+c*.9)+
  ' C'+n2(l*.55)+','+n2(w*1.25+c*.4)+' '+n2(l*.1)+','+n2(w*1.0)+' 0,0 Z';
}
let hitSerial=0;
function hitMarkup(){
 const r=seededR(97),id='hlx'+(++hitSerial);
 let pet='',vein='';
 for(let i=0;i<PETALS;i++){
  const a=i/PETALS*360+(r()-.5)*22,len=.6+r()*.4,wid=.17+r()*.09,curl=(r()-.5)*.42;
  pet+='<path transform="rotate('+n2(a)+')" d="'+petal(len,wid,curl)+'" fill="url(#'+id+'p)"/>';
 }
 for(let i=0;i<6;i++){ // 상처를 따라 번지는 빛 무늬(통통하게 휘어진 잎 모양의 면)
  const a=i/6*360+(r()-.5)*36,len=.62+r()*.38;
  vein+='<path transform="rotate('+n2(a)+')" d="'+petal(len,.22,(r()-.5)*.7)+'" fill="url(#'+id+'p)"/>';
 }
 let dots='';for(let i=0;i<DOTS;i++)dots+='<circle r="1" fill="url(#'+id+'d)" opacity="0"/>';
 let rings='';for(let i=0;i<5;i++)rings+='<ellipse rx="1" ry="1" fill="url(#'+id+'r)" opacity="0"/>';
 return '<g class="hl-hit" opacity="0" style="pointer-events:none">'+
  '<defs>'+
   '<radialGradient id="'+id+'g"><stop offset="0" stop-color="#fffdf4"/><stop offset=".18" stop-color="#fff0c8" stop-opacity=".9"/><stop offset=".45" stop-color="#ffd98a" stop-opacity=".38"/><stop offset="1" stop-color="#ffc66a" stop-opacity="0"/></radialGradient>'+
   '<radialGradient id="'+id+'p" cx="0" cy=".5" r="1" fx="0" fy=".5"><stop offset="0" stop-color="#fffaf0"/><stop offset=".35" stop-color="#ffe7b0" stop-opacity=".85"/><stop offset="1" stop-color="#ffc66a" stop-opacity="0"/></radialGradient>'+
   '<radialGradient id="'+id+'d"><stop offset="0" stop-color="#fffdf6"/><stop offset=".4" stop-color="#ffe2a0" stop-opacity=".75"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>'+
   '<radialGradient id="'+id+'r"><stop offset=".55" stop-color="#ffd98a" stop-opacity="0"/><stop offset=".78" stop-color="#ffe9bd" stop-opacity=".55"/><stop offset=".88" stop-color="#fff7e2" stop-opacity=".95"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>'+
   '<linearGradient id="'+id+'t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fffbf0" stop-opacity=".95"/><stop offset=".25" stop-color="#ffe7b0" stop-opacity=".7"/><stop offset="1" stop-color="#ffc66a" stop-opacity="0"/></linearGradient>'+
  '</defs>'+
  '<rect class="hh-white" x="-100" y="-100" width="1200" height="800" fill="#fff6e0" opacity="0"/>'+
  // 5망: 지나간 자리에 남는 혜성 모양 빛의 굴(앞으로 길게 뻗으며 가늘어짐)
  '<path class="hh-tunnel" d="M-30,0 C-30,-16 0,-30 60,-24 C260,-14 700,-5 1500,0 C700,5 260,14 60,24 C0,30 -30,16 -30,0 Z" fill="url(#'+id+'t)" opacity="0"/>'+
  '<circle class="hh-exit" r="1" fill="url(#'+id+'g)" opacity="0"/>'+
  '<g class="hh-exitp" opacity="0">'+pet+'</g>'+
  '<g class="hh-veins" opacity="0">'+vein+'</g>'+
  '<circle class="hh-flash" r="1" fill="url(#'+id+'g)" opacity="0"/>'+
  '<g class="hh-petals" opacity="0">'+pet+'</g>'+
  '<g class="hh-rings">'+rings+'</g>'+
  '<circle class="hh-wound" r="1" fill="url(#'+id+'g)" opacity="0"/>'+
  '<g class="hh-dots">'+dots+'</g>'+
 '</g>';
}
const outE=x=>1-Math.pow(1-Math.min(1,Math.max(0,x)),3);
const DOTP=(()=>{const r=seededR(311);return Array.from({length:DOTS},(_,i)=>({fw:i<22,a:(i<22?(r()-.5)*1.5:r()*Math.PI*2),v:.55+r()*.45,curl:(r()-.5)*1.6,sz:.5+r()*.9,life:.55+r()*.5}));})();
function passAngle(a){const d=a*RAD,dx=Math.cos(d),dy=Math.sin(d)*.3;return Math.atan2(dy,dx)/RAD;} // 5망: 거의 수평으로 곧장 꿰뚫고 나아감
function paintHit(el,o){
 const g=el&&el.querySelector('.hl-hit');if(!g)return;
 const c=g._hh||(g._hh={white:g.querySelector('.hh-white'),tunnel:g.querySelector('.hh-tunnel'),exit:g.querySelector('.hh-exit'),exitp:g.querySelector('.hh-exitp'),
  veins:g.querySelector('.hh-veins'),flash:g.querySelector('.hh-flash'),petals:g.querySelector('.hh-petals'),wound:g.querySelector('.hh-wound'),
  rings:Array.from(g.querySelectorAll('.hh-rings ellipse')),dots:Array.from(g.querySelectorAll('.hh-dots circle'))});
 const tier=o&&o.tier|0,s=o&&o.s;
 if(!o||s==null||s<0||tier<3||s>3.4){if(g.getAttribute('opacity')!=='0')g.setAttribute('opacity','0');return;}
 g.setAttribute('opacity','1');
 const K=tier>=5?2:tier-3,x=o.p[0],y=o.p[1],a=o.ang,d=a*RAD,dx=Math.cos(d),dy=Math.sin(d);
 const at=(tx,ty,rot,sx,sy)=>'translate('+n2(tx)+' '+n2(ty)+')'+(rot!=null?' rotate('+n2(rot)+')':'')+(sx!=null?' scale('+n2(Math.max(.001,sx))+(sy!=null?' '+n2(Math.max(.001,sy)):'')+')':'');
 // 화면을 덮는 섬광
 c.white.setAttribute('opacity',n2([0,.12,.6][K]*Math.exp(-s*[6,6,4.2][K])));
 // 박힌 자리에서 피어나는 빛 덩어리
 const R=[34,70,130][K]*(1+.4*outE(s*6));
 c.flash.setAttribute('transform',at(x,y,null,R));c.flash.setAttribute('opacity',n2(Math.exp(-s*[4.2,3,2.2][K])));
 // 빛의 꽃잎: 퍼지며 휘어 돌다 스러짐
 const PL=[30,62,96][K]*(.25+.75*outE(s/.22)),pw=1+.6*outE(s/.4);
 c.petals.setAttribute('transform',at(x,y,a+s*[40,30,22][K],PL,PL*pw));
 c.petals.setAttribute('opacity',n2(Math.max(0,1-s/[.55,.75,.9][K])));
 // 4망: 상처를 따라 번져 한동안 맥동하는 빛줄기 + 상처의 빛
 if(K>=1){
  const VL=[0,78,110][K]*outE(s/.35),vo=K===1?(s<1.8?.9*(.7+.3*Math.sin(s*9)):Math.max(0,.9-(s-1.8)/1.1)):Math.max(0,.9-s/1.2);
  c.veins.setAttribute('transform',at(x,y,a+s*18,VL,VL*.8));c.veins.setAttribute('opacity',n2(vo));
  const wr=[0,26,40][K]*(1+.12*Math.sin(s*8));
  c.wound.setAttribute('transform',at(x,y,null,wr));c.wound.setAttribute('opacity',n2(Math.min(1,s*8)*(K===1?(s<2.4?1:Math.max(0,1-(s-2.4))):Math.max(0,1-s/1.5))));
 }else{c.veins.setAttribute('opacity','0');c.wound.setAttribute('opacity','0');}
 // 망의 고리: 부드러운 빛의 띠로 번짐. 5망은 작살을 따라 앞으로 나아감
 c.rings.forEach((e,i)=>{
  if(i>=tier){e.setAttribute('opacity','0');return;}
  const si=s-i*.06;if(si<0){e.setAttribute('opacity','0');return;}
  const ry=10+[36,66,124][K]*(1-Math.exp(-si*4))*(1+i*.15),rx=ry*.34,fwd=K===2?si*560+i*16:i*5;
  e.setAttribute('cx',n2(x+dx*fwd));e.setAttribute('cy',n2(y+dy*fwd));e.setAttribute('rx',n2(rx));e.setAttribute('ry',n2(ry));
  e.setAttribute('transform','rotate('+n2(a)+' '+n2(x+dx*fwd)+' '+n2(y+dy*fwd)+')');
  e.setAttribute('opacity',n2(Math.max(0,1-si/[.7,.9,1.15][K])));
 });
 // 빛방울: 곡선을 그리며 흩어지고 작아짐 (5망은 앞쪽으로 쏠려 쏟아짐)
 const SP=[60,120,230][K],fwdBias=[.2,.4,.9][K];
 c.dots.forEach((e,i)=>{
  const P=DOTP[i];if(i>=[18,26,34][K]){e.setAttribute('opacity','0');return;}
  const k=s/P.life;if(k>=1){e.setAttribute('opacity','0');return;}
  const ang=(P.fw?P.a*(1-fwdBias*.5):P.a)+P.curl*k,dist=SP*P.v*outE(k*1.4);
  const lx=Math.cos(ang)*dist,ly=Math.sin(ang)*dist+40*k*k;          // 살짝 떨어지며 휨
  e.setAttribute('cx',n2(x+lx*dx-ly*dy));e.setAttribute('cy',n2(y+lx*dy+ly*dx));
  e.setAttribute('r',n2((3+[2,4,6][K]*P.sz)*(1-k*.7)));e.setAttribute('opacity',n2(1-k));
 });
 // 5망: 꿰뚫고 지나간 빛의 굴 + 반대편으로 피어나는 빛
 if(K===2){
  const len=Math.max(.05,1-s*.6);
  c.tunnel.setAttribute('transform',at(x,y,a,1,len));c.tunnel.setAttribute('opacity',n2(Math.max(0,1-s/1.3)));
  const th=o.through||140,ex=x+dx*th,ey=y+dy*th,se=s-.05;
  c.exit.setAttribute('transform',at(ex,ey,null,se>0?100*(1+.4*outE(se*5)):1));c.exit.setAttribute('opacity',n2(se>0?Math.exp(-se*2.4):0));
  const EL=se>0?110*(.3+.7*outE(se/.25)):1;
  c.exitp.setAttribute('transform',at(ex,ey,a,EL,EL*.55));c.exitp.setAttribute('opacity',n2(se>0?Math.max(0,1-se/.9):0));
 }else{['tunnel','exit','exitp'].forEach(k=>c[k].setAttribute('opacity','0'));}
}
/* 작살이 살 속에 묻힌 만큼 가리기: entryX(작살 자신의 좌표, 날 끝 = 3)보다 앞쪽을 잘라 낸다. null이면 해제 */
let clipN=0;
function bury(hg,entryX){
 if(!hg)return;
 if(entryX==null){if(hg.hasAttribute('clip-path'))hg.removeAttribute('clip-path');return;}
 const svg=hg.ownerSVGElement;if(!svg)return;
 if(!hg._clip||!hg._clip.isConnected){
  const ns='http://www.w3.org/2000/svg',cp=document.createElementNS(ns,'clipPath'),rc=document.createElementNS(ns,'rect');
  cp.setAttribute('id','hlBury'+(++clipN));rc.setAttribute('x','-400');rc.setAttribute('y','-60');rc.setAttribute('height','120');
  cp.appendChild(rc);svg.appendChild(cp);hg._clip=cp;
 }
 hg._clip.firstChild.setAttribute('width',n2(Math.max(0,400+entryX)));
 const v='url(#'+hg._clip.id+')';if(hg.getAttribute('clip-path')!==v)hg.setAttribute('clip-path',v);
}
function tier(){return rings();}
// 망 개수에 따른 박힘: {deep: 기존보다 더 들어가는 길이, pass: 꿰뚫고 날아감}
function pierce(){const n=rings();return n>=5?{pass:true,deep:0,n}:n>=4?{pass:false,deep:46,n}:{pass:false,deep:0,n};}
const PASS_SPEED=1150;

window.HarpoonLauncher={markup,flyMarkup,owned,launch,anchorLocal,handFor,rewind,hitMarkup,paintHit,passAngle,bury,tier,pierce,PASS_SPEED,PIVOT,ANGLE,LEFT,ARM,TIP,RELOAD};
})();
