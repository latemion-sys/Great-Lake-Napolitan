/* 모든 것을 말리는 붉은 고래 · v3 다섯 장면
   window.RedWhaleV3 = {html(stage), stages, replayToken}
   ① 말라붙는 호수 ② 붉은 팔의 포위 ③ 여덟 팔 격퇴 ④ 붉은 눈의 머리 ⑤ 작살과 물의 귀환(한 번 재생 후 멈춤) */
(function(){
'use strict';
const K=window.BlueWhaleV3Kit,R=window.RedWhaleV3Kit;
if(!K||!R)return;
const {W,H,SEA,clamp,outC,inC,inOut,seg,bell,lerp,n1,n3,TAU,RAD,seeded,esc,mt,commonDefs,drops,dropParams,paintDrops,cacheQ,boatPose,lamp,setUse,HARPOON}=K;
const {headDefs,headMarkup,paintHead,armMarkup,paintArm,catmull,tailMarkup,tailDefs,paintTail}=R;
const NAME='모든 것을 말리는 붉은 고래';

/* ---------- 배경: 붉게 물든 밤, 마르는 호수 바닥 ---------- */
function redDefs(){
 return ''+
 '<linearGradient id="rwSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#040205"/><stop offset=".55" stop-color="#170810"/><stop offset=".86" stop-color="#2e1014"/><stop offset="1" stop-color="#3a1612"/></linearGradient>'+
 '<radialGradient id="rwMoonG"><stop stop-color="#f0c6b0" stop-opacity=".5"/><stop offset=".2" stop-color="#d88a76" stop-opacity=".16"/><stop offset="1" stop-color="#a04a40" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="rwWater" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#24121a" stop-opacity=".95"/><stop offset=".3" stop-color="#120810" stop-opacity=".97"/><stop offset="1" stop-color="#040205"/></linearGradient>'+
 '<linearGradient id="rwMud" gradientUnits="userSpaceOnUse" x1="0" y1="'+SEA+'" x2="0" y2="'+(SEA+40)+'"><stop stop-color="#7a6660"/><stop offset=".08" stop-color="#3a2a2a"/><stop offset=".5" stop-color="#1e1016"/><stop offset="1" stop-color="#160a10"/></linearGradient>'+
 // 열기의 아지랑이: 뒤틀림(숨을 참으면 잦아듦)
 '<filter id="rwHaze" x="-15%" y="-25%" width="130%" height="150%"><feTurbulence type="fractalNoise" baseFrequency=".011 .05" numOctaves="2" seed="5" result="n"/><feOffset class="rw-hzoff" in="n" dy="0" result="m"/><feDisplacementMap class="rw-hzmap" in="SourceGraphic" in2="m" scale="28" xChannelSelector="R" yChannelSelector="G"/></filter>'+
 // 끝내 전체가 드러나지 않는 몸: 두 눈 언저리 · 외투막 한 귀퉁이 / 물 위로 드러난 등 한 조각
 '<filter id="rwDis" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".02 .05" numOctaves="2" seed="9" result="n"/><feColorMatrix in="n" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.6 0 0 0 -.9" result="na"/><feComposite in="SourceGraphic" in2="na" operator="in"/></filter>'+
 '<radialGradient id="rwFragR"><stop stop-color="#fff"/><stop offset=".45" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
 '<mask id="rwHeadFrag" maskUnits="userSpaceOnUse" x="-320" y="-460" width="640" height="640"><g filter="url(#rwDis)"><ellipse cx="-134" cy="-8" rx="92" ry="66" fill="url(#rwFragR)"/><ellipse cx="134" cy="-8" rx="92" ry="66" fill="url(#rwFragR)"/><ellipse cx="-70" cy="-350" rx="150" ry="46" fill="url(#rwFragR)" opacity=".5"/></g></mask>'+
 '<mask id="rwBackFrag" maskUnits="userSpaceOnUse" x="-320" y="-460" width="640" height="640"><g filter="url(#rwDis)"><ellipse cx="10" cy="-340" rx="210" ry="80" fill="url(#rwFragR)"/></g></mask>'+
 '<linearGradient id="rwHeat" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#ff6a3a" stop-opacity=".22"/><stop offset="1" stop-color="#ff6a3a" stop-opacity="0"/></linearGradient>'+
 '<filter id="rwSteam" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>'+
 '<filter id="rwMudTex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".02 .09" numOctaves="3" seed="21"/><feColorMatrix values="0 0 0 0 .05  0 0 0 0 .02  0 0 0 0 .02  0 0 0 -1.8 1.1"/></filter>'+
 '<radialGradient id="rwDeep"><stop stop-color="#ff1a2e" stop-opacity=".55"/><stop offset=".5" stop-color="#c00a20" stop-opacity=".2"/><stop offset="1" stop-color="#c00a20" stop-opacity="0"/></radialGradient>'+
 '<clipPath id="rwAboveBed"><rect width="'+W+'" height="'+(SEA+38)+'"/></clipPath>';
}
function cracks(){
 const r=seeded(17);let d='';
 for(let i=0;i<26;i++){
  let x=r()*W,y=SEA+12+Math.pow(r(),.8)*(H-SEA-12);const steps=3+(r()*4|0),k=(y-SEA)/(H-SEA);
  d+='M'+n1(x)+','+n1(y);
  for(let j=0;j<steps;j++){x+=(r()-.5)*90*(.5+k);y+=(r()-.3)*22*(.4+k);d+=' L'+n1(x)+','+n1(y);}
 }
 return d;
}
const CRACKS=cracks();
function scenery(){
 return '<rect width="'+W+'" height="'+H+'" fill="url(#rwSky)"/>'+
  '<circle cx="812" cy="98" r="190" fill="url(#rwMoonG)"/>'+
  '<circle cx="812" cy="98" r="26" fill="#ecc9ba" opacity=".42" filter="url(#bwRimF)"/>'+
  '<rect y="'+(SEA-120)+'" width="'+W+'" height="120" fill="url(#rwHeat)" class="rw-heat"/>'+
  '<g class="bw-mist" filter="url(#bwMist)"><rect x="-200" y="252" width="700" height="34" rx="17" fill="#e0b3a6" opacity=".07"/><rect x="560" y="228" width="760" height="40" rx="20" fill="#e0b3a6" opacity=".06"/></g>'+
  '<g class="rw-far"></g>';
}
function bed(){
 return '<rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" fill="url(#rwMud)"/>'+
  '<rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" filter="url(#rwMudTex)" opacity=".18"/>'+
  // 물이 있던 자리에 남는 하얀 물자국(옛 수면 바로 아래로 옅게 흘러내린 자국)
  '<g class="rw-salt" fill="#e8d8cc" opacity="0">'+(()=>{const r=seeded(52);let g='';for(let i=0;i<46;i++){const x=r()*W,w=6+r()*40;g+='<rect x="'+n1(x)+'" y="'+n1(SEA+1+r()*3)+'" width="'+n1(w)+'" height="'+n1(1+r()*2.6)+'" rx="1" opacity="'+n3(.25+r()*.5)+'"/>';}return g;})()+'</g>'+
  '<path class="rw-cracks" d="'+CRACKS+'" fill="none" stroke="#080203" stroke-width="2.2" stroke-linejoin="round" opacity="0"/>'+
  '<path class="rw-cracks2" d="'+CRACKS+'" fill="none" stroke="#c8644a" stroke-opacity=".18" stroke-width="1" transform="translate(0 -1.5)" opacity="0"/>'+
  '<path class="rw-ring" d="M0,'+(SEA+2)+' H'+W+'" stroke="#efe2d8" stroke-width="2.2" opacity="0"/>'+
  '<g class="rw-water">'+
   '<rect class="rw-wrect" y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" fill="url(#rwWater)"/>'+
   '<g fill="#e8c8bc">'+[0,1,2,3,4,5,6].map(i=>'<rect class="bw-glint" data-i="'+i+'" x="'+(794-i*4)+'" y="'+(i*i*3.2+i*6+8)+'" width="'+(26+i*9)+'" height="'+n1(1.6+i*.35)+'" rx="1" opacity="0"/>').join('')+'</g>'+
   '<g fill="none" stroke="#c9a49a" stroke-linecap="round">'+[0,1,2,3,4,5,6,7].map(i=>{const y=7+i*i*2.6+i*7;return '<path class="bw-wave" data-i="'+i+'" d="M-60,'+n1(y)+' H'+(W+60)+'" stroke-opacity="'+n3(.13-i*.011)+'" stroke-width="'+n1(1+i*.3)+'" stroke-dasharray="'+(30+i*14)+' '+(40+i*22)+'"/>';}).join('')+'</g>'+
   '<path class="rw-wline" d="M0,0 H'+W+'" stroke="#d9a090" stroke-opacity=".3" stroke-width="1.4"/>'+
  '</g>'+
  '<ellipse class="rw-deep" cx="480" cy="'+(SEA+120)+'" rx="320" ry="70" fill="url(#rwDeep)" opacity="0" style="mix-blend-mode:screen"/>';
}
function steam(n){let s='<g class="rw-steam" filter="url(#rwSteam)" fill="#f0c8b8">';const r=seeded(44);for(let i=0;i<n;i++)s+='<ellipse data-x="'+n1(r()*W)+'" data-p="'+n3(r())+'" data-s="'+n3(.6+r()*.8)+'" rx="30" ry="14" opacity="0"/>';return s+'</g>';}
function nearMist(){return '<g class="bw-mist" filter="url(#bwMist)"><rect x="-300" y="'+(SEA-16)+'" width="900" height="30" rx="15" fill="#e6c2b6" opacity=".06"/><rect x="420" y="'+(SEA-34)+'" width="900" height="26" rx="13" fill="#e6c2b6" opacity=".05"/></g>';}
// 열기(0=없음, 1=가장 뜨거움)에 따라 물이 뱃전 아래로 내려감. 바닥은 드러나지 않음.
// 물이 있던 자리(수면 위 띠)는 하얗게 마름
const DROP=38;
function paintBed(el,tr,level){
 const {q,qa}=cacheQ(el);
 level=clamp(level);
 const wy=SEA+level*DROP;
 q('.rw-water').setAttribute('transform','translate(0 '+n1(wy)+')');
 q('.rw-wrect').setAttribute('y','0');q('.rw-wrect').setAttribute('height',n1(H-wy+2));
 q('.rw-water').style.opacity='1';
 qa('.bw-wave').forEach(w=>{const i=+w.dataset.i;w.style.strokeDashoffset=n1(tr*(8+i*6)*(i%2?1:-1));});
 qa('.bw-glint').forEach(g=>{const i=+g.dataset.i;g.setAttribute('opacity',n3((0.08+0.12*(0.5+0.5*Math.sin(tr*2.3+i*1.7)))*(1-level)));});
 q('.rw-cracks').setAttribute('opacity','0');q('.rw-cracks2').setAttribute('opacity','0');
 q('.rw-ring').setAttribute('opacity',n3(seg(level,.1,.45)*.6));{const sl=q('.rw-salt');if(sl)sl.setAttribute('opacity',n3(seg(level,.2,.7)*.8));}
 qa('.bw-mist').forEach((m,i)=>m.setAttribute('transform','translate('+n1(Math.sin(tr*0.13+i*2)*50)+' 0)'));
 const hs=q('.rw-heat');if(hs)hs.style.opacity=n3(.4+.6*level+.15*Math.sin(tr*2.2));
 qa('.rw-steam ellipse').forEach(e=>{const x=+e.dataset.x,p=+e.dataset.p,s=+e.dataset.s,u=((tr*.18*s+p)%1);
  e.setAttribute('cx',n1(x+Math.sin(tr*.8+p*9)*20));e.setAttribute('cy',n1(wy-20-u*170));e.setAttribute('rx',n1(6+u*14));e.setAttribute('ry',n1(22+u*30));
  e.setAttribute('opacity',n3(level*.09*Math.sin(u*Math.PI)));});
 return wy;
}
// 내려간 물 위에 뜬 배(뱃전에 하얀 물자국이 남음)
function boatOnBed(el,tr,level,x,extra){
 const e=extra||{},bobK=1;level=clamp(level);
 const y=SEA+level*DROP+(Math.sin(tr*1.6)*2.2+Math.sin(tr*.7)*1.2)*bobK+(e.dy||0);
 const r=(Math.sin(tr*1.25+.6)*2.6)*bobK+(e.dr||0);
 const tw=boatPose(el,x+(e.dx||0),y,r,e.arm||[37,-30]);
 lamp(el,tr,tw,e.lamp||0);
 const {q}=cacheQ(el);q('.rw-bclip').setAttribute('height',n1(SEA+level*DROP+2));const lg=q('.bw-lampglint');lg.setAttribute('cy',n1(SEA+level*DROP+9));
 return tw;
}
function rwBoat(){
 return '<clipPath id="rwBoatClip"><rect class="rw-bclip" width="'+W+'" height="'+(SEA+1)+'"/></clipPath>'+
  '<ellipse class="bw-lampglint" cy="'+(SEA+9)+'" rx="22" ry="3" fill="#ffbf47" filter="url(#bwRimF)" opacity="0"/>'+
  '<g clip-path="url(#rwBoatClip)"><g class="bw-boat">'+K.BOAT+
   '<g class="rw-wither" opacity="0"><path d="M-44,-6 L36,-6 Q44,-6 50,-12 L48,-6 Q44,3 32,5 L-33,5 Q-44,3 -44,-6 Z" fill="#5a4c46" opacity=".45"/>'+
   '<g fill="#b9a596" opacity=".32"><ellipse cx="-29" cy="-1" rx="2.6" ry="1.8"/><ellipse cx="-23" cy="2" rx="1.8" ry="1.3"/><ellipse cx="-12" cy="-2" rx="2.2" ry="1.5"/><ellipse cx="19" cy="0" rx="2.4" ry="1.6"/><ellipse cx="27" cy="2.5" rx="1.6" ry="1.1"/><ellipse cx="35" cy="-2" rx="2" ry="1.4"/></g>'+
   '<path d="M-38,-4 l6,4 l-3,4 M-6,-6 l3,5 l5,2 M10,-6 l-2,6 M40,-8 l-4,5" fill="none" stroke="#1a1210" stroke-width=".8"/></g>'+
  '</g></g>';
}
function wither(el,k){const {q}=cacheQ(el);q('.rw-wither').setAttribute('opacity',n3(clamp(k)));}
function deep(el,k,x,y){const {q}=cacheQ(el),d=q('.rw-deep');d.setAttribute('opacity',n3(clamp(k)));if(x!=null){d.setAttribute('cx',n1(x));d.setAttribute('cy',n1(y));}}
function veil(el,v){cacheQ(el).q('.bw-veil').style.opacity=n3(clamp(v)*0.92);}
function caption(el,caps,t){const {q}=cacheQ(el);let txt=caps[0][1];for(const c of caps)if(t>=c[0])txt=c[1];const b=q('.cine-bottom');if(b&&b.textContent!==txt)b.textContent=txt;}
function jolt(s,amp,f){return s>0?amp*Math.exp(-s*2.2)*Math.sin(s*(f||10)):0;}
// 아지랑이: clear 0 = 뒤틀려 형체가 없음, 1 = 숨을 참아 잦아듦(그래도 조각만 보임)
function haze(el,clear,tr){
 const {q,qa}=cacheQ(el);clear=clamp(clear);
 const m=q('.rw-hzmap');if(m)m.setAttribute('scale',n1(34-31*clear));
 const o=q('.rw-hzoff');if(o)o.setAttribute('dy',n1(-((tr*46)%400)));
 qa('.rw-hz').forEach(g=>g.setAttribute('opacity',n3(.22+.78*clear)));
}

// 물에서 솟는 팔: 물 아래는 가리고, 뚫고 나온 자리에 물결 고리
function groundArm(cls){
 return '<clipPath id="cp-'+cls+'"><rect class="gclip" width="'+W+'" height="'+H+'"/></clipPath>'+
  '<g class="ga-'+cls+'"><ellipse class="ga-hole" rx="30" ry="8" fill="#1a080c" opacity="0"/>'+
  '<g clip-path="url(#cp-'+cls+')">'+armMarkup(cls)+'</g>'+
  '<ellipse class="ga-lip" rx="34" ry="9" fill="none" stroke="#e0b8aa" stroke-width="1.6" opacity="0"/></g>';
}
function paintGroundArm(el,cls,o,groundY,vis){
 const {q}=cacheQ(el);
 const g=q('.'+cls),wrap=q('.ga-'+cls);
 q('#cp-'+cls+' .gclip').setAttribute('height',n1(groundY));
 const hole=wrap.querySelector('.ga-hole'),lip=wrap.querySelector('.ga-lip');
 [hole,lip].forEach(e=>{e.setAttribute('cx',n1(o.x));e.setAttribute('cy',n1(groundY));e.setAttribute('rx',n1((o.w||42)*.85));e.setAttribute('ry',n1((o.w||42)*.22));});
 hole.setAttribute('opacity',n3(vis*.4));lip.setAttribute('opacity',n3(vis*.45));
 g.style.opacity=vis>0?'1':'0';
 if(vis>0)return paintArm(g,o);
 return null;
}
// 손목이 target을 향하도록 위팔 각도를 돌림
function aimArm(o,target,k){
 const el=[o.x+Math.cos(o.a*RAD)*o.L1,o.y+Math.sin(o.a*RAD)*o.L1],fa=o.a+o.e*(o.side||1);
 const wr=[el[0]+Math.cos(fa*RAD)*o.L2,el[1]+Math.sin(fa*RAD)*o.L2];
 const want=Math.atan2(target[1]-o.y,target[0]-o.x)/RAD,have=Math.atan2(wr[1]-o.y,wr[0]-o.x)/RAD;
 let d=want-have;while(d>180)d-=360;while(d<-180)d+=360;
 o.a+=d*(k==null?1:k);return o;
}
/* 팔 자세: 땅속 뿌리에서 솟아(rise 0~1) 대상 쪽으로 뻗음 */
function armPose(base,rise,o){
 const up=inOut(rise);
 return Object.assign({x:base[0],y:base[1]+(1-up)*170,a:lerp(-90+(o.lean||0)*.3,o.a,up),L1:o.L1||150,e:lerp(10,o.e,up),L2:o.L2||140,wr:lerp(0,o.wr||0,up),w:o.w||42,grip:o.grip||0,spread:o.spread,side:o.side||1},o.extra||{});
}

/* =========================================================
   ① 말라붙는 호수
   ========================================================= */
const S0={title:'내려가는 물',loop:8.5,
 caps:[[0,'갑자기 뜨거워집니다. 해가 뜬 것도 아닌데. 숨을 들이쉬자 목이 탑니다.'],[1.6,'물이 줄어듭니다. 뱃전 아래로 물 높이가 눈에 보이게 내려갑니다.'],[3.6,'물이 있던 자리가 하얗게 말라 갑니다.'],[5.4,'저 멀리, 붉은 것이 등을 드러냈다가 가라앉습니다.']],
 build(){
  return scenery()+
   '<g class="rw-farhead" opacity="0" clip-path="url(#rwAboveBed)"><g class="rw-hz" filter="url(#rwHaze)"><g class="rw-hd"><g mask="url(#rwBackFrag)">'+headMarkup()+'</g></g></g></g>'+
   bed()+steam(14)+rwBoat()+drops('rw-drip',18,3,'#c88a7a')+nearMist();
 },
 paint(el,t,tr){
  const {q,qa}=cacheQ(el);
  const level=inOut(seg(t,1.4,4.8))*(1-inOut(seg(t,7.0,8.4)));
  paintBed(el,tr,level);
  deep(el,bell(t,.2,1.4,3.2,4.6)*(.75+.25*Math.sin(tr*3)),480,SEA+150-60*seg(t,.2,2.4));
  wither(el,.5*seg(t,3.6,5.2));
  boatOnBed(el,tr,level,300,{});
  // 먼 곳의 머리: 외투막과 두 눈만
  const fh=bell(t,5.0,6.0,7.4,8.2);
  const g=q('.rw-farhead');g.setAttribute('opacity',n3(fh*.9));
  g.querySelector('.rw-hd').setAttribute('transform','translate(720 '+n1(SEA+40-46*outC(seg(t,5,6.6)))+') scale(.16)');
  if(fh>0)paintHead(g.querySelector('.rw-hd'),tr,{open:seg(t,5.6,6.2),glow:1.4});
  haze(el,.2+.75*bell(t,5.4,6.0,7.0,7.8),tr);
  caption(el,this.caps,t);
  veil(el,t<.6?1-t/.6:seg(t,7.9,8.5));
 }
};

/* =========================================================
   ② 붉은 팔의 포위 — 갈라진 바닥에서 빨판 달린 사람 팔들이 솟아 배를 움켜쥠
   ========================================================= */
const ARMS2=[
 {base:[170,SEA+96],a:-62,e:58,wr:30,L1:150,L2:140,w:44,side:1,grip:.8,delay:.6},
 {base:[470,SEA+104],a:-118,e:-60,wr:-34,L1:150,L2:140,w:46,side:-1,grip:.85,delay:1.0},
 {base:[650,SEA+40],a:-140,e:-42,wr:-20,L1:170,L2:150,w:40,side:-1,grip:.6,delay:1.5},
 {base:[70,SEA+34],a:-50,e:40,wr:16,L1:160,L2:150,w:38,side:1,grip:.5,delay:1.9}
];
const S1={title:'붉은 팔의 포위',loop:8.5,
 caps:[[0,'내려간 물 아래에서 새빨간 것이 꿈틀거립니다.'],[.9,'사람의 것을 닮은 팔들이 솟아오릅니다.'],[2.6,'악몽 같은 빨판이 선체에 들러붙습니다. 닿은 자리가 하얗게 시들어 갑니다.'],[4.6,'팔들이 배를 휘감아 조이고 목을 조르듯 들어 올립니다.']],
 build(){
  return scenery()+bed()+steam(10)+
   '<g class="rw-backarms">'+groundArm('ra2')+groundArm('ra3')+'</g>'+
   rwBoat()+
   '<g class="rw-frontarms">'+groundArm('ra0')+groundArm('ra1')+'</g>'+
   drops('rw-mudspray',40,9,'#d9b8ae')+nearMist();
 },
 paint(el,t,tr){
  const {q,qa}=cacheQ(el);
  paintBed(el,tr,1);
  deep(el,bell(t,0,.3,1.2,2.2),300,SEA+110);
  const squeeze=inOut(seg(t,4.4,6.2))*(1-seg(t,7.6,8.4));
  wither(el,.5+.5*seg(t,2.8,5.0));
  const shake=t>2.6?Math.sin(tr*31)*1.2*seg(t,2.6,3)+Math.sin(tr*47)*squeeze*1.6:0;
  const tw=boatOnBed(el,tr,1,300,{dy:-18*squeeze+shake,dr:-5*squeeze+shake*.8,lamp:.1});
  const gunL=tw([-40,-8]),gunR=tw([40,-8]);
  ARMS2.forEach((A,i)=>{
   const rise=seg(t,A.delay,A.delay+1.0);
   const gr=clamp(A.grip*seg(t,A.delay+1.0,A.delay+1.6)+.12*Math.sin(tr*2+i));
   const breathe=Math.sin(tr*1.3+i)*3;
   const o=armPose(A.base,rise,{a:A.a+breathe,e:A.e-squeeze*8*(A.side),wr:A.wr,L1:A.L1,L2:A.L2,w:A.w,side:A.side,grip:gr});
   o.y-=squeeze*10;
   if(i<2)aimArm(o,i===0?gunL:gunR,seg(t,A.delay+.5,A.delay+1.1));
   paintGroundArm(el,'ra'+i,o,A.base[1],rise>0?1:0);
  });
  // 진흙 튀김
  if(!this._mp)this._mp=dropParams(40,12,-150,-30,90,260);
  const ms=qa('.rw-mudspray circle');
  ARMS2.forEach((A,i)=>{});
  paintDrops(ms,this._mp,ARMS2[0].base[0]+40,SEA+40,t-ARMS2[0].delay,320,520);
  caption(el,this.caps,t);
  veil(el,t<.6?1-t/.6:seg(t,7.9,8.5));
 }
};

/* =========================================================
   ③ 여덟 팔 격퇴 — 팔이 차례로 덮쳐 오고, 작살잡이가 하나씩 쳐냄
   ========================================================= */
const STRIKES=(()=>{const r=seeded(63);return Array.from({length:8},(_,i)=>{const left=i%2===0;return {at:.7+i*.82,left,
 base:[left?60+r()*120:480+r()*200,SEA+50+r()*50],a:left?-55-r()*20:-125+r()*20,e:left?50:-50,side:left?1:-1,w:38+r()*8};});})();
const S2={title:'여덟 팔 격퇴',loop:8.6,
 caps:[[0,'팔이 둘, 넷, 여덟. 전부 솟아오릅니다.']],
 build(){
  return scenery()+bed()+steam(8)+
   '<g class="rw-sarms">'+groundArm('sa0')+groundArm('sa1')+'</g>'+
   rwBoat()+
   '<circle class="rw-parry" r="40" fill="url(#bwFlash)" opacity="0" style="mix-blend-mode:screen"/>'+
   '<path class="rw-slash" fill="none" stroke="#fff1e0" stroke-width="2.4" stroke-linecap="round" opacity="0"/>'+
   drops('rw-blood',24,15,'#2a0307')+
   nearMist();
 },
 paint(el,t,tr){
  const {q,qa}=cacheQ(el);
  paintBed(el,tr,1);wither(el,1);
  let cur=-1;for(let i=0;i<8;i++)if(t>=STRIKES[i].at-.1)cur=i;
  let hitK=0,parryAt=null;
  [0,1].forEach(slot=>{
   // 이 슬롯이 맡은 가장 최근 공격
   let si=-1;for(let i=slot;i<8;i+=2)if(t>=STRIKES[i].at-.1)si=i;
   if(si<0){paintGroundArm(el,'sa'+slot,{x:0,w:40},SEA,0);return;}
   const S=STRIKES[si],s=t-S.at;
   if(s>1.05){paintGroundArm(el,'sa'+slot,{x:S.base[0],w:S.w},S.base[1],0);return;}
   // 솟아오름(0~.32) → 내리침(.32~.45) → 막힘 → 물러남(.5~1.05)
   const rise=seg(s,-.1,.3),swing=seg(s,.3,.44),back=seg(s,.5,1.05);
   const a=S.a+(S.left?1:-1)*(swing*28-back*40),e=S.e*(1-.5*swing)+(S.left?1:-1)*back*30;
   const o=armPose([S.base[0],S.base[1]+back*170],rise,{a,e,wr:(S.left?1:-1)*(20+swing*30),L1:150,L2:140,w:S.w,side:S.side,grip:.2+swing*.4});
   paintGroundArm(el,'sa'+slot,o,S.base[1],1-seg(s,.95,1.05));
   if(s>.42&&s<.75){hitK=1-seg(s,.42,.75);parryAt={x:S.left?260:350,y:SEA+40,i:si,s};}
  });
  const boatShake=hitK*Math.sin(tr*60)*2;
  const strikeSide=parryAt?(STRIKES[parryAt.i].left?-1:1):0;
  const armUp=parryAt?[38+strikeSide*6,-34]:[37,-30];
  const tw=boatOnBed(el,tr,1,305,{dr:boatShake-strikeSide*hitK*3,dx:boatShake,arm:armUp,lamp:hitK*.2});
  const fl=q('.rw-parry'),sl=q('.rw-slash');
  if(parryAt){const p=tw(strikeSide<0?[-30,-34]:[46,-34]);
   fl.setAttribute('cx',n1(p[0]+strikeSide*20));fl.setAttribute('cy',n1(p[1]-6));fl.setAttribute('r',n1(30+40*(1-hitK)));fl.setAttribute('opacity',n3(hitK));
   sl.setAttribute('d','M'+n1(p[0]-30)+','+n1(p[1]-40)+' Q'+n1(p[0]+strikeSide*20)+','+n1(p[1]-10)+' '+n1(p[0]+strikeSide*50)+','+n1(p[1]+18));sl.setAttribute('opacity',n3(hitK*.9));}
  else{fl.setAttribute('opacity','0');sl.setAttribute('opacity','0');}
  if(!this._bl)this._bl=dropParams(24,19,-170,-10,80,240);
  paintDrops(qa('.rw-blood circle'),this._bl,parryAt?(strikeSide<0?230:390):0,SEA+20,parryAt?parryAt.s-.42:-1,30,500);
  const n=Math.max(0,Math.min(8,STRIKES.filter(S=>t>=S.at+.44).length));
  const b=q('.cine-bottom'),txt=n===0?'팔이 둘, 넷, 여덟. 전부 솟아오릅니다.':n<8?'작살잡이가 팔을 하나씩 쳐냅니다. 격퇴 '+n+' / 8':'여덟 번째 팔이 물러납니다. 격퇴 8 / 8';
  if(b&&b.textContent!==txt)b.textContent=txt;
  veil(el,t<.5?1-t/.5:seg(t,8.0,8.6));
 }
};

/* =========================================================
   ④ 붉은 눈의 머리 — 문어 머리가 배 뒤에서 떠오르고 붉은 눈을 뜸
   ========================================================= */
const S3={title:'붉은 눈의 머리',loop:8.5,
 caps:[[0,'물 아래가 새빨갛게 달아오릅니다.'],[1.2,'무언가가 물을 밀어내며 솟아오릅니다. 아지랑이 너머로는 형체가 잡히지 않습니다.'],[3.0,'어둠 속에서 깊이 박힌 두 눈만이 배를 내려다봅니다. 가로로 찢어진 동공 속에서 붉은 빛이 탑니다.'],[5.6,'보이지 않는 거대한 것이 배 쪽으로 몸을 기울입니다.']],
 build(){
  return scenery()+
   '<g clip-path="url(#rwAboveBed)"><g class="rw-hz" filter="url(#rwHaze)"><g class="rw-hd"><g mask="url(#rwHeadFrag)">'+headMarkup()+'</g></g></g></g>'+
   bed()+steam(10)+
   '<g>'+groundArm('ha0')+groundArm('ha1')+'</g>'+
   rwBoat()+drops('rw-mud',36,27,'#d9b8ae')+nearMist();
 },
 paint(el,t,tr){
  const {q,qa}=cacheQ(el);
  paintBed(el,tr,1);wither(el,1);
  const rise=outC(seg(t,.9,3.2)),lunge=inOut(seg(t,5.8,7.4));
  haze(el,.25+.6*seg(t,2.6,3.4)*(1-.4*lunge),tr);
  deep(el,bell(t,0,.4,1.4,2.6),600,SEA+60);
  const hx=600,hy=SEA+300-353*rise+lunge*40,hs=.66+lunge*.22;
  const hd=q('.rw-hd');hd.setAttribute('transform','translate('+n1(hx-lunge*150)+' '+n1(hy+Math.sin(tr*.9)*4)+') scale('+n3(hs)+')');
  const look=[clamp((300-hx)/40,-9,0),6];
  const blink=t>4.6&&t<4.8?1-Math.sin((t-4.6)/.2*Math.PI):1;
  paintHead(hd,tr,{open:seg(t,2.6,3.2)*blink,dilate:1-.45*seg(t,3.4,4.2)+.6*lunge,look,glow:seg(t,2.6,3.4)+lunge*.5});
  // 양옆의 팔
  [[0,[130,SEA+90],-70,55,1],[1,[850,SEA+90],-112,-55,-1]].forEach(([i,b,a,e,sd])=>{
   const rr=seg(t,.4+i*.3,1.6+i*.3);
   paintGroundArm(el,'ha'+i,armPose(b,rr,{a:a+Math.sin(tr*1.1+i)*4+(sd>0?1:-1)*lunge*18,e:e,wr:sd*20,L1:160,L2:150,w:44,side:sd,grip:.3+.2*Math.sin(tr+i),spread:1.2}),b[1],rr>0?1:0);
  });
  if(!this._mp)this._mp=dropParams(36,29,-160,-20,60,220);
  paintDrops(qa('.rw-mud circle'),this._mp,hx,SEA+30,t-1.0,300,420);
  boatOnBed(el,tr,1,300,{dy:Math.sin(tr*23)*lunge*1.5,lamp:.1});
  caption(el,this.caps,t);
  veil(el,t<.6?1-t/.6:(t>7.3?.4+.6*seg(t,7.3,8.5):0));
 }
};

/* =========================================================
   ⑤ 작살과 물의 귀환 — 두 눈 사이에 작살, 촉수가 늘어지고 머리가 가라앉으며 물이 다시 차오름
   ========================================================= */
const S4={title:'작살과 물의 귀환',dur:11.5,
 caps:[[0,'두 눈이 물 아래로 가라앉습니다. 배 뒤쪽의 물이 들썩입니다.'],[1.6,'선미 뒤 아지랑이 속에서 새빨간 꼬리 끝이 솟아오릅니다.'],[3.0,'고래의 꼬리가 열립니다!'],[3.7,'작살잡이가 선미에서 몸을 돌려 열린 꼬리 한가운데를 겨눕니다.'],[4.6,'작살이 꼬리 속의 붉은 핵을 꿰뚫습니다.'],[6.2,'팔과 꼬리 끝이 무너지고 열기가 물러납니다. 물이 천천히 다시 차오릅니다.']],
 build(){
  let sparks='<g class="rw-sparks" stroke="#ffd9c0" stroke-linecap="round" opacity="0">';
  const r=seeded(81);for(let i=0;i<20;i++){const a=r()*TAU;sparks+='<path data-a="'+n3(a)+'" data-v="'+n1(60+r()*150)+'" stroke-width="'+n1(1+r()*1.6)+'"/>';}
  sparks+='</g>';
  return '<g class="rw-root">'+scenery()+
   '<g clip-path="url(#rwAboveBed)"><g class="rw-hz" filter="url(#rwHaze)"><g class="rw-hd"><g mask="url(#rwHeadFrag)">'+headMarkup()+'</g></g></g></g>'+
   bed()+steam(10)+
   '<clipPath id="rwTailClip"><rect class="rw-tclip" width="'+W+'" height="'+(SEA+70)+'"/></clipPath>'+
   '<g clip-path="url(#rwTailClip)"><g class="rw-hz" filter="url(#rwHaze)"><g class="rw-tailg">'+tailMarkup()+'<g class="rw-stuck" opacity="0">'+HARPOON.replace('class="bw-tip"','class="rw-tip"')+'</g></g></g></g>'+
   '<ellipse class="rw-thole" rx="80" ry="14" fill="#0a0203" opacity="0"/>'+
   '<g>'+groundArm('ka0')+groundArm('ka1')+'</g>'+
   rwBoat()+
   '<path class="bw-rope" fill="none" stroke="#8a7d7a" stroke-opacity=".75" stroke-width="1.5" opacity="0"/>'+
   '<g class="bw-harpoon" opacity="0">'+HARPOON+'</g>'+
   '<circle class="bw-flash" r="70" fill="url(#bwFlash)" opacity="0"/>'+sparks+
   drops('rw-blood',26,83,'#1e0206')+drops('rw-mud',40,87,'#d9b8ae')+
   nearMist()+'</g>';
 },
 paint(el,tReal,tr){
  const {q,qa}=cacheQ(el);
  const t=Math.min(tReal,this.dur);
  const T0=3.95,HIT=4.45,TX=150;
  const level=1-inOut(seg(t,6.0,10.0));
  haze(el,t<HIT?.35+.55*seg(t,3.0,3.6):1,tr);
  paintBed(el,tr,level);
  wither(el,1-seg(t,8,10.5));
  // 머리: 바닥 아래로 가라앉음
  const hsink=inOut(seg(t,0,1.6)),hd=q('.rw-hd');
  hd.style.display=hsink>=1?'none':'';
  if(hsink<1){hd.setAttribute('transform','translate(600 '+n1(SEA-53+hsink*420)+') scale(.66)');paintHead(hd,tr,{open:1-hsink,glow:1-hsink,look:[-6,5]});}
  // 꼬리: 선미 뒤에서 솟아 열림 → 작살 → 경련 → 무너짐
  const rise=outC(seg(t,1.5,3.0)),open=inOut(seg(t,3.0,3.6))*(1-.75*seg(t,HIT+.1,HIT+.6));
  const hit=t-HIT,limp=seg(t,HIT+.8,HIT+2.2),fall=inOut(seg(t,HIT+1.2,HIT+3.2));
  const spasm=hit>0?Math.exp(-hit*2.5)*Math.sin(hit*30)*10:0;
  const tg=q('.rw-tailg');
  const ty=SEA+60+(1-rise)*300+fall*520;
  tg.setAttribute('transform','translate('+n1(TX+spasm*.5)+' '+n1(ty)+') rotate('+n1(-fall*25+Math.sin(tr*1.3)*2*(1-limp))+') scale(.85)');
  tg.style.opacity=n3(1-seg(t,HIT+2.6,HIT+3.4));
  q('.rw-tclip').setAttribute('height',n1(SEA+70));
  const tipL=paintTail(tg.querySelector('.rw-tail'),{h:210,open,pulse:.5+.5*Math.sin(tr*7),sway:Math.sin(tr*1.1)*14*(1-limp)+spasm,limp,t:tr});
  const ang0=(-fall*25+Math.sin(tr*1.3)*2*(1-limp))*RAD,c0=Math.cos(ang0),s0=Math.sin(ang0);
  const core=[TX+spasm*.5+.85*(tipL[0]*c0-tipL[1]*s0),ty+.85*(tipL[0]*s0+tipL[1]*c0)];
  const th=q('.rw-thole');th.setAttribute('cx',n1(TX));th.setAttribute('cy',n1(SEA+60));th.setAttribute('opacity',n3(seg(t,1.4,1.8)*(1-seg(t,6,7.5))*.85));
  if(!this._md)this._md=dropParams(40,91,-160,-20,90,300);
  paintDrops(qa('.rw-mud circle'),this._md,TX,SEA+50,t-1.5,120,460);
  // 팔: 핵이 꿰뚫리면 힘이 빠짐
  [[0,[700,SEA+120],-118,-50,-1],[1,[880,SEA+80],-108,-55,-1]].forEach(([i,b,a,e,sd])=>{
   const f=seg(t,HIT+.2,HIT+2.0),rr=1-inC(f);
   paintGroundArm(el,'ka'+i,armPose(b,rr,{a:a+sd*f*30+Math.sin(tr*1.2+i)*4,e:e*(1-f*.5),wr:sd*(20+f*30),L1:160,L2:150,w:44,side:sd,grip:.3*(1-f),spread:1.2-f*.6}),b[1],rr>.02?1-seg(t,6.4,7.4):0);
  });
  // 배: 선미가 꼬리 쪽(왼쪽). 작살잡이가 몸을 돌려 선미 너머로 던짐
  const turn=seg(t,3.5,3.8),thrown=t>=T0;
  const armEnd=thrown?[16,-26]:turn>0?[29-turn*12,-30-turn*6]:[37,-30];
  const tw=boatOnBed(el,tr,level,380,{arm:armEnd,lamp:turn>0&&!thrown?.15:0,dr:thrown?Math.exp(-(t-T0)*3)*Math.sin((t-T0)*9)*4:0});
  const hand=tw(armEnd),p0=[hand[0]-24,hand[1]-14],LIFT=50;
  const hp=q('.bw-harpoon');let pos,ang,show=0;
  if(turn>0&&!thrown){const a=180+28+turn*10;pos=[hand[0]+Math.cos(a*RAD)*40,hand[1]+Math.sin(a*RAD)*40];ang=a;show=turn;}
  else if(thrown&&t<HIT){const u=(t-T0)/(HIT-T0),e=u*(.85+.15*u);pos=[p0[0]+(core[0]-p0[0])*e,p0[1]+(core[1]-p0[1])*e-4*LIFT*e*(1-e)];ang=Math.atan2((core[1]-p0[1])-4*LIFT*(1-2*e),core[0]-p0[0])/RAD;show=1;}
  hp.setAttribute('opacity',String(show));
  if(pos)hp.setAttribute('transform','translate('+n1(pos[0])+' '+n1(pos[1])+') rotate('+n1(ang)+')');
  // 꼬리 핵에 박힌 작살(꼬리와 함께 움직임)
  const endAng=Math.atan2((core[1]-p0[1])+4*LIFT,core[0]-p0[0])/RAD;
  const st=q('.rw-stuck');st.setAttribute('opacity',t>=HIT?'1':'0');
  const local=[tipL[0],tipL[1]];
  st.setAttribute('transform','translate('+n1(local[0]*.9/.9)+' '+n1(local[1])+') rotate('+n1(endAng-(-fall*25+Math.sin(tr*1.3)*2*(1-limp)))+') scale(1.18)');
  const stt=st.querySelector('.rw-tip');if(stt)stt.style.opacity='0';
  const sAr=endAng*RAD,stTail=[core[0]-104*Math.cos(sAr),core[1]-104*Math.sin(sAr)];
  const ropeEnd=t>=HIT?stTail:(pos?[pos[0]-104*Math.cos(ang*RAD),pos[1]-104*Math.sin(ang*RAD)]:p0);
  const anchor=tw([-40,-9]),mid=[(ropeEnd[0]+anchor[0])/2,(ropeEnd[1]+anchor[1])/2+(t<HIT?40:Math.max(6,30*Math.exp(-(t-HIT))))];
  const rope=q('.bw-rope');rope.setAttribute('d','M'+n1(anchor[0])+','+n1(anchor[1])+' Q'+n1(mid[0])+','+n1(mid[1])+' '+n1(ropeEnd[0])+','+n1(ropeEnd[1]));
  rope.setAttribute('opacity',thrown&&ropeEnd[1]<SEA+level*DROP+6?'.9':'0');
  // 명중
  const fl=q('.bw-flash');fl.setAttribute('cx',n1(core[0]));fl.setAttribute('cy',n1(core[1]));
  fl.setAttribute('opacity',hit>0?n3(Math.exp(-hit*2.6)):'0');fl.setAttribute('r',n1(40+90*clamp(hit*2)));
  const sp=q('.rw-sparks');sp.setAttribute('opacity',hit>0&&hit<1.3?n3(1-hit/1.3):'0');
  if(hit>0)qa('.rw-sparks path').forEach(p=>{const a=+p.dataset.a,v=+p.dataset.v,d1=10+v*Math.min(hit,1)*.8,d2=d1+8+v*.1;
   p.setAttribute('d','M'+n1(core[0]+Math.cos(a)*d1)+','+n1(core[1]+Math.sin(a)*d1*.8)+' L'+n1(core[0]+Math.cos(a)*d2)+','+n1(core[1]+Math.sin(a)*d2*.8));});
  if(!this._bl)this._bl=dropParams(26,85,-200,20,80,260);
  paintDrops(qa('.rw-blood circle'),this._bl,core[0],core[1],hit,10,480);
  const shake=hit>0&&hit<.5?(1-hit/.5)*4:(t>1.5&&t<2.6?Math.sin(t*40)*1.5:0);
  q('.rw-root').setAttribute('transform',shake?'translate('+n1(Math.sin(t*90)*shake)+' '+n1(Math.cos(t*77)*shake*.6)+')':'');
  caption(el,this.caps,t);
  veil(el,tReal<.6?1-tReal/.6:0);
 }
};

/* =========================================================
   미니게임 표시 (red-whale-gameplay-v023.js가 window.RedHuntGame을 움직임)
   ② 연타로 조이는 팔 떨쳐내기 · ③ 솟는 팔을 눌러 쳐내기 · ⑤ 꼬리가 열리는 순간에 작살 닿게 던지기
   ========================================================= */
const GAMECAP={1:'팔들이 배를 조여 옵니다. 연타해서 떨쳐 내십시오.',2:'솟아오르는 팔의 손을 눌러 쳐내십시오.',4:'숨을 참는 동안에만 꼬리 끝이 보입니다. 숨을 내쉬는 순간 작살을 던지십시오.'};
function rhud(el){const {q}=cacheQ(el);return {hint:q('.rwg-hint'),verdict:q('.rwg-verdict'),pips:q('.rwg-pips'),bar:q('.rwg-bar i'),time:q('.rwg-time i'),count:q('.rwg-count')};}
function setTxt(n,t){if(n&&n.textContent!==t)n.textContent=t;}
function setVerdict(n,t,cls){if(!n)return;setTxt(n,t);const c='rwg-verdict'+(t?' on '+(cls||''):'');if(n.className!==c)n.className=c;}
function setPips(n,total,filled){if(!n)return;const k=total+'/'+filled;if(n.dataset.k===k)return;n.dataset.k=k;let h='';for(let i=0;i<total;i++)h+='<i class="'+(i<filled?'good':'')+'"></i>';n.innerHTML=h;}

/* ② 연타: 게이지가 낮을수록 팔이 더 조임 */
function mashGame(el,t,tr,g){
 const {q,qa}=cacheQ(el);
 paintBed(el,tr,1);
 const okAge=g.okAt!=null?t-g.okAt:-1,failAge=g.failAt!=null?t-g.failAt:-1;
 const recoil=okAge>=0?bell(okAge,0,.25,.75,1.2):0;
 const regrab=okAge>=0?seg(okAge,.7,1.2):1;
 const gauge=g.gauge||0,squeeze=clamp(1-gauge/100)*(1-recoil)+(failAge>=0&&failAge<1?.4*(1-failAge):0);
 wither(el,.55+.45*clamp((g.pressTotal||0)/80+(1-gauge/100)*.3));
 deep(el,0);
 const shake=Math.sin(tr*47)*squeeze*1.8+(failAge>=0&&failAge<.6?Math.sin(tr*70)*4*(1-failAge/.6):0);
 const tw=boatOnBed(el,tr,1,300,{dy:-20*squeeze+shake,dr:-6*squeeze+shake*.8,lamp:.1,arm:g.lastPress!=null&&t-g.lastPress<.12?[40,-34]:[37,-30]});
 const gunL=tw([-40,-8]),gunR=tw([40,-8]);
 ARMS2.forEach((A,i)=>{
  const rise=(g.phase==='ready'?seg(t,.2+i*.15,.9+i*.15):1)*(1-recoil*.55)*(.45+.55*regrab);
  const gr=clamp(A.grip*(.4+.6*squeeze)+.1*Math.sin(tr*2+i));
  const o=armPose(A.base,rise,{a:A.a+Math.sin(tr*1.3+i)*3+(A.side>0?-1:1)*recoil*30,e:A.e-squeeze*10*A.side,wr:A.wr,L1:A.L1,L2:A.L2,w:A.w,side:A.side,grip:gr});
  o.y-=squeeze*12;
  if(i<2)aimArm(o,i===0?gunL:gunR,(1-recoil)*clamp(rise*1.2));
  paintGroundArm(el,'ra'+i,o,A.base[1],rise>0?1:0);
 });
 if(!mashGame._mp)mashGame._mp=dropParams(40,12,-150,-30,90,260);
 paintDrops(qa('.rw-mudspray circle'),mashGame._mp,300,SEA+40,okAge,320,520);
 const u=rhud(el);
 u.bar.style.width=n1(gauge)+'%';u.bar.parentNode.classList.toggle('hot',gauge>75);
 const left=g.phase==='go'?clamp((g.deadline-t)/(g.limit||4.5)):g.phase==='ready'?1:0;
 u.time.style.width=n1(100*left)+'%';
 setPips(u.pips,g.need||2,g.round||0);
 setVerdict(u.verdict,okAge>=0&&okAge<1?'떨쳐냄':failAge>=0&&failAge<1.2?'조여듦':g.done==='ok'?'떨쳐냄':'',okAge>=0||g.done==='ok'?'good':'bad');
 setTxt(u.hint,g.phase==='ready'?'준비 · 스페이스 / 화면 누르기를 연타':g.phase==='go'?'연타! · 게이지를 끝까지 채우십시오':'');
 caption(el,[[0,GAMECAP[1]]],0);
 veil(el,t<.5?1-t/.5:0);
}

/* ③ 팔 쳐내기: 8개 자리 중 무작위로 솟아 배를 내리침 */
const PSLOTS=[
 {base:[80,SEA+62],side:1,hit:[248,SEA+46]},{base:[150,SEA+112],side:1,hit:[268,SEA+62]},
 {base:[214,SEA+30],side:1,hit:[286,SEA+26]},{base:[30,SEA+22],side:1,hit:[236,SEA+24]},
 {base:[462,SEA+112],side:-1,hit:[352,SEA+62]},{base:[540,SEA+52],side:-1,hit:[372,SEA+40]},
 {base:[620,SEA+92],side:-1,hit:[392,SEA+56]},{base:[700,SEA+30],side:-1,hit:[382,SEA+20]}
];
function parryGame(el,t,tr,g){
 const {q,qa}=cacheQ(el);
 paintBed(el,tr,1);wither(el,1);deep(el,0);
 const W=g.wave,pos=g.armPos||(g.armPos={});
 let struckK=0;
 PSLOTS.forEach((P,i)=>{
  const a=W&&W.arms.find(x=>x.slot===i);
  const ring=q('.rwg-t'+i);
  if(!a){paintGroundArm(el,'pa'+i,{x:P.base[0],w:42},P.base[1],0);ring.setAttribute('opacity','0');delete pos[i];return;}
  const p=(t-W.start)/W.W;
  let rise=seg(p,0,.3),reach=inC(seg(p,.3,1)),back=0,vis=1;
  if(a.parriedAt!=null){back=seg(t,a.parriedAt,a.parriedAt+.6);vis=1-seg(t,a.parriedAt+.45,a.parriedAt+.6);reach*=1-back;}
  else if(W.struckAt!=null){const s=t-W.struckAt;reach=1+.15*bell(s,0,.1,.25,.5);back=seg(s,.6,1.2);vis=1-seg(s,1.0,1.2);if(s<.5)struckK=Math.max(struckK,1-s/.5);}
  const raised=[P.base[0]+P.side*50,P.base[1]-250];
  const tgt=[lerp(raised[0],P.hit[0],reach),lerp(raised[1],P.hit[1],reach)];
  const o=armPose([P.base[0],P.base[1]+back*200],rise*(1-back*.6),{a:P.side>0?-60:-120,e:P.side*40,wr:P.side*(15+reach*25),L1:150,L2:140,w:42,side:P.side,grip:.15+reach*.5,spread:1.2-reach*.4});
  aimArm(o,tgt,1);
  const A=paintGroundArm(el,'pa'+i,o,P.base[1],vis);
  // 누를 자리: 손바닥
  if(A&&A.hand){pos[i]=A.hand;
   const live=a.parriedAt==null&&W.struckAt==null&&rise>.2;
   ring.setAttribute('transform','translate('+n1(A.hand[0])+' '+n1(A.hand[1])+')');
   ring.setAttribute('opacity',live?'1':'0');
   const rem=clamp(1-p),c=ring.querySelector('.rt-ring');c.style.strokeDashoffset=n1(214*(1-rem));c.setAttribute('stroke',rem<.3?'#ff7a5a':'#ffe2c8');
  }else{ring.setAttribute('opacity','0');delete pos[i];}
  // 쳐낸 섬광
  const fl=q('.rwg-f'+i);
  if(a.parriedAt!=null&&pos[i]){const k=t-a.parriedAt;fl.setAttribute('cx',n1(pos[i][0]));fl.setAttribute('cy',n1(pos[i][1]));fl.setAttribute('r',n1(20+50*clamp(k*2.5)));fl.setAttribute('opacity',n3(Math.max(0,1-k/.4)));}
  else fl.setAttribute('opacity','0');
 });
 const shake=struckK*Math.sin(tr*60)*4;
 const parrying=W&&W.arms.some(x=>x.parriedAt!=null&&t-x.parriedAt<.25);
 boatOnBed(el,tr,1,305,{dr:shake,dx:shake,arm:parrying?[42,-36]:[37,-30],lamp:struckK*.3});
 const u=rhud(el);
 const total=g.total||15,done=g.cleared||0;
 setTxt(u.count,'격퇴 '+(g.parried||0)+' · 남은 공격 '+(total-done));
 const n=W?W.arms.length:0;
 setVerdict(u.verdict,W&&W.clearAt!=null&&t-W.clearAt<.7?'격퇴':W&&W.struckAt!=null&&t-W.struckAt<1.1?'맞음':'',W&&W.clearAt!=null?'good':'bad');
 setTxt(u.hint,!W?'준비 · 솟아오르는 팔의 손을 누르십시오':n===1?'팔 1개 · 손을 누르십시오':'팔 '+n+'개 · 전부 쳐내십시오');
 caption(el,[[0,GAMECAP[2]]],0);
 veil(el,t<.5?1-t/.5:0);
}

/* ⑤ 꼬리: 리듬에 맞춰 열리고 닫힘. 작살이 날아가는 동안 열려 있어야 꽂힘 */
function tailGame(el,t,tr,g){
 const {q,qa}=cacheQ(el);
 if(g.hitAt!=null&&t>=g.hitAt){S4.paint(el,4.45+(t-g.hitAt),tr);hudTail(el,t,g);return;}
 const TX=150,level=1;
 paintBed(el,tr,level);wither(el,1);
 // 숨을 참는 동안에만 아지랑이가 걷혀 꼬리 끝이 보임. 숨이 말랐으면 걷히지 않음
 const want=g.holding&&!g.dried?1:0;g._c=g._c==null?0:g._c+(want-g._c)*.14;
 haze(el,.06+.94*g._c,tr);
 q('.rw-hd').style.display='none';
 const rise=outC(seg(t,0,1.2));
 const open=g.openness?g.openness(t):0,trem=g.tremble?g.tremble(t):0;
 const tg=q('.rw-tailg'),ty=SEA+60+(1-rise)*300;
 const sway=Math.sin(tr*1.1)*14+Math.sin(tr*31)*trem*3;
 tg.setAttribute('transform','translate('+TX+' '+n1(ty)+') rotate('+n1(Math.sin(tr*1.3)*2)+') scale(.85)');tg.style.opacity='1';
 const tipL=paintTail(tg.querySelector('.rw-tail'),{h:210,open,pulse:.5+.5*Math.sin(tr*7)+trem*.6,sway,limp:0,t:tr});
 const ang0=Math.sin(tr*1.3)*2*RAD,c0=Math.cos(ang0),s0=Math.sin(ang0);
 const core=[TX+.85*(tipL[0]*c0-tipL[1]*s0),ty+.85*(tipL[0]*s0+tipL[1]*c0)];
 g.core=core;
 q('.rw-stuck').setAttribute('opacity','0');
 const th=q('.rw-thole');th.setAttribute('cx',TX);th.setAttribute('cy',n1(SEA+60));th.setAttribute('opacity','.85');
 [[0,[700,SEA+120],-118,-50,-1],[1,[880,SEA+80],-108,-55,-1]].forEach(([i,b,a,e,sd])=>{
  paintGroundArm(el,'ka'+i,armPose(b,1,{a:a+Math.sin(tr*1.2+i)*4,e,wr:sd*20,L1:160,L2:150,w:44,side:sd,grip:.3,spread:1.2}),b[1],1);
 });
 // 작살잡이: 선미 쪽으로 돌아서서 겨눔 → 던짐
 const F=g.flight,T0=F?F.at:null,thrown=F&&t>=T0;
 const recover=F&&F.hit===false?seg(t,F.arrive+.4,F.arrive+.9):0;
 const armEnd=thrown&&recover<1?[16,-26]:[17,-36];
 const tw=boatOnBed(el,tr,level,380,{arm:armEnd,lamp:.12,dr:thrown?Math.exp(-(t-T0)*3)*Math.sin((t-T0)*9)*4:0});
 const hand=tw(armEnd),p0=[hand[0]-24,hand[1]-14],LIFT=40;
 const hp=q('.bw-harpoon');let pos,ang,show=1;
 if(!thrown||recover>=1){const a=180+40;pos=[hand[0]+Math.cos(a*RAD)*40,hand[1]+Math.sin(a*RAD)*40];ang=a;show=F&&F.hit===false?recover:1;}
 else if(F.crumble){ // 숨이 마른 채 던진 작살: 날아가다 하얗게 말라 부서짐
  const u=clamp((t-T0)/(F.arrive-T0)),c=F.target||core;pos=[p0[0]+(c[0]-p0[0])*u,p0[1]+(c[1]-p0[1])*u-4*LIFT*u*(1-u)];ang=Math.atan2((c[1]-p0[1])-4*LIFT*(1-2*u),c[0]-p0[0])/RAD;show=1-seg(u,.35,.7);
  if(!g._cr){g._cr=pos;}if(u<.5)g._cr=pos;}
 else if(t<F.arrive){const u=(t-T0)/(F.arrive-T0),e=u;const c=F.target||core;pos=[p0[0]+(c[0]-p0[0])*e,p0[1]+(c[1]-p0[1])*e-4*LIFT*e*(1-e)];ang=Math.atan2((c[1]-p0[1])-4*LIFT*(1-2*e),c[0]-p0[0])/RAD;}
 else{ // 닫힌 꽃잎에 튕겨 떨어짐
  const s=t-F.arrive,c=F.target||core;pos=[c[0]+60*s,c[1]-120*s+520*s*s];ang=-150+s*600;show=pos[1]<SEA+60?1:0;}
 hp.setAttribute('opacity',String(show));
 hp.setAttribute('transform','translate('+n1(pos[0])+' '+n1(pos[1])+') rotate('+n1(ang)+')');
 const anchor=tw([-40,-9]),ar=ang*RAD,tail=[pos[0]-104*Math.cos(ar),pos[1]-104*Math.sin(ar)];
 const rope=q('.bw-rope');rope.setAttribute('d','M'+n1(anchor[0])+','+n1(anchor[1])+' Q'+n1((tail[0]+anchor[0])/2)+','+n1((tail[1]+anchor[1])/2+40)+' '+n1(tail[0])+','+n1(tail[1]));
 rope.setAttribute('opacity',thrown&&show?'.9':'0');
 // 튕김 불꽃
 const fl=q('.bw-flash');
 if(F&&F.crumble&&g._cr){const u=clamp((t-T0)/(F.arrive-T0)),k=seg(u,.35,.8)*(1-seg(t,F.arrive,F.arrive+.8));fl.setAttribute('cx',n1(g._cr[0]));fl.setAttribute('cy',n1(g._cr[1]));fl.setAttribute('r',n1(30+50*seg(u,.35,1)));fl.setAttribute('opacity',n3(.45*k));}
 else if(F&&F.hit===false&&t>=F.arrive&&t<F.arrive+.4){const c=F.target||core;fl.setAttribute('cx',n1(c[0]));fl.setAttribute('cy',n1(c[1]));fl.setAttribute('r','36');fl.setAttribute('opacity',n3(.7*(1-(t-F.arrive)/.4)));}
 else fl.setAttribute('opacity','0');
 q('.rw-sparks').setAttribute('opacity','0');
 qa('.rw-blood circle,.rw-mud circle').forEach(c=>c.setAttribute('opacity','0'));
 q('.rw-root').setAttribute('transform','');
 hudTail(el,t,g);
 veil(el,t<.5?1-t/.5:0);
}
function hudTail(el,t,g){
 const u=rhud(el),F=g.flight;
 setVerdict(u.verdict,F&&t>=F.arrive&&t<F.arrive+1.2?(F.hit?'명중':F.crumble?'말라 부서짐':'튕겨 나감'):'',F&&F.hit?'good':'bad');
 setTxt(u.hint,g.hitAt!=null?'':F&&t<F.arrive?'':t<1.2?'열기 속에서 무언가가 솟아오릅니다':
  g.dried?(g.holding?'숨이 말라 아지랑이가 걷히지 않습니다':'숨이 말랐습니다 · 누르고 떼면 던집니다'):
  g.holding?'떼는 순간 숨을 내쉬며 던집니다 · 꼬리가 열릴 때 닿도록':'누르고 있으면 숨을 참습니다 · 아지랑이가 걷힙니다');
 u.hint.classList.toggle('now',!!(g.tremble&&g.tremble(t)>.2&&!(F&&t<F.arrive)));
 caption(el,[[0,GAMECAP[4]]],0);
}

/* ---------- 열기와 숨 (1~4단계 시작마다) ----------
   열기가 오면 물이 뱃전 아래로 내려가고 아지랑이가 모든 것을 일그러뜨린다.
   숨을 참는 동안에만 아지랑이가 잦아들어 그 단계의 조각이 보인다.
   ① 멀리 드러났다 가라앉는 붉은 등 ② 더 가까이 떠오르는 등 ③ 물을 뚫고 나오는 팔 끝 ④ 어둠 속 두 눈 */
const BREATHCAP=['갑자기 뜨거워집니다. 숨을 들이쉬지 마십시오.','열기가 다시 덮쳐 옵니다. 숨을 들이쉬지 마십시오.','열기 속에서 물이 내려갑니다. 숨을 들이쉬지 마십시오.','어둠이 달아오릅니다. 숨을 들이쉬지 마십시오.'];
function breathBuild(k){
 const head=(mask)=>'<g class="rw-farhead" clip-path="url(#rwAboveBed)"><g class="rw-hz" filter="url(#rwHaze)"><g class="rw-hd"><g mask="url(#'+mask+')">'+headMarkup()+'</g></g></g></g>';
 return scenery()+(k===0||k===1?head('rwBackFrag'):k===3?head('rwHeadFrag'):'')+bed()+steam(14)+
  (k===2?'<g class="rw-hz" filter="url(#rwHaze)">'+groundArm('ba0')+groundArm('ba1')+groundArm('ba2')+'</g>':'')+
  rwBoat()+nearMist()+'<rect class="rw-burn" width="'+W+'" height="'+H+'" fill="#ff5a2a" opacity="0" style="mix-blend-mode:screen"/>';
}
function breathGame(el,t,tr,g){
 const {q}=cacheQ(el),k=g.wave||0;
 const hA=g.heatAt,hE=g.heatEnd;
 const heat=seg(t,hA-.35,hA+.35)*(1-seg(t,hE,hE+1.5));
 paintBed(el,tr,heat);wither(el,.5*heat);
 boatOnBed(el,tr,heat,300,{lamp:.1});
 // 숨을 참는 동안에만 아지랑이가 잦아듦
 const want=g.holding&&!g.inhaledNow?1:0;g._c=g._c==null?0:g._c+(want-g._c)*.12;
 haze(el,.08+.92*g._c,tr);
 const show=heat;
 if(k===0||k===1||k===3){
  const hd=q('.rw-hd');
  const P=k===0?[740,SEA+52-40*heat,.17]:k===1?[560,SEA+82-74*heat,.3]:[600,SEA+20-74*heat,.72];
  hd.setAttribute('transform','translate('+P[0]+' '+n1(P[1]+Math.sin(tr*.9)*2)+') scale('+P[2]+')');
  paintHead(hd,tr,{open:k===3?seg(t,hA+.2,hA+.8):0,glow:k===3?1.3:0,look:[-6,4]});
  q('.rw-farhead').setAttribute('opacity',n3(show));
 }else{
  [[0,[600,SEA+70],-104,1],[1,[740,SEA+58],-82,-1],[2,[860,SEA+76],-96,-1]].forEach(([i,b,a,sd])=>{
   const rr=.42*heat*(.8+.2*Math.sin(tr*1.3+i));
   paintGroundArm(el,'ba'+i,armPose(b,rr,{a:a+Math.sin(tr*1.1+i)*5,e:sd*30,wr:sd*16,L1:150,L2:140,w:40,side:sd,grip:.3,spread:1.1}),b[1],rr>.02?1:0);
  });
 }
 // 숨을 들이쉬면 목이 탐(붉게 번쩍)
 const burn=g.inhaleAt!=null?Math.exp(-(t-g.inhaleAt)*2.2):0;
 q('.rw-burn').setAttribute('opacity',n3(.28*burn));
 hudBreath(el,t,g,heat);
 veil(el,t<.5?1-t/.5:0);
}
function hudBreath(el,t,g,heat){
 const u=rhud(el),r=g.result;
 setVerdict(u.verdict,r==='kept'?'숨을 지켰다':r==='inhaled'?'숨을 들이쉬었다':'',r==='kept'?'good':'bad');
 const hA=g.heatAt,hE=g.heatEnd;
 const hint=r?'':t<hA?(g.holding?'숨을 참고 있습니다 · 열기가 옵니다':'열기가 몰려옵니다 · 누르고 있으십시오 (숨을 참는다)'):
  t<hE?(g.holding?'버티십시오 · 숨을 들이쉬지 마십시오':'')
  :'열기가 물러납니다 · 물이 다시 차오릅니다 · 떼십시오 (숨을 내쉰다)';
 setTxt(u.hint,hint);u.hint.classList.toggle('now',!r&&t>=hE);
 const p=u.pips;if(p){const rec=g.record||[],key=rec.join(',');if(p.dataset.k!==key){p.dataset.k=key;let h='';for(let i=0;i<4;i++)h+='<i class="'+(rec[i]==='kept'?'good':rec[i]==='inhaled'?'bad':'')+'"></i>';p.innerHTML=h;}}
 caption(el,[[0,BREATHCAP[g.wave||0]]],0);
}
// 게임 화면용 장면 구성
const GBUILD={
 1:()=>scenery()+bed()+steam(10)+'<g class="rw-backarms">'+groundArm('ra2')+groundArm('ra3')+'</g>'+rwBoat()+'<g class="rw-frontarms">'+groundArm('ra0')+groundArm('ra1')+'</g>'+drops('rw-mudspray',40,9,'#d9b8ae')+nearMist(),
 2:()=>{let arms='',tg='',fl='';
  PSLOTS.forEach((_,i)=>{arms+=groundArm('pa'+i);
   tg+='<g class="rwg-t'+i+'" opacity="0"><circle r="40" fill="#1a0206" fill-opacity=".25" stroke="#ffe2c8" stroke-opacity=".35" stroke-width="2"/><circle class="rt-ring" r="34" fill="none" stroke="#ffe2c8" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="214" transform="rotate(-90)"/><circle r="5" fill="#ffe2c8"/></g>';
   fl+='<circle class="rwg-f'+i+'" r="30" fill="url(#bwFlash)" opacity="0" style="mix-blend-mode:screen"/>';});
  const order=[3,0,2,1,7,5,6,4];
  return scenery()+bed()+steam(8)+'<g>'+order.slice(0,4).map(i=>groundArm('pa'+i)).join('')+'</g>'+rwBoat()+'<g>'+order.slice(4).map(i=>groundArm('pa'+i)).join('')+'</g>'+fl+'<g class="rwg-targets">'+tg+'</g>'+nearMist();},
 4:()=>S4.build()
};
const GAMEPAINT={1:mashGame,2:parryGame,4:tailGame};
const GAMEMODE={1:'mash',2:'parry',4:'tail'};

const SCENES=[S0,S1,S2,S3,S4];
function html(stage,opts){
 const i=Math.max(0,Math.min(4,Math.floor(+stage||0))),S=SCENES[i],breath=!!(opts&&opts.breath),game=breath||!!(opts&&opts.game&&GAMECAP[i]);
 const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'+
  '<defs>'+commonDefs()+headDefs()+tailDefs()+redDefs()+'</defs>'+(breath?breathBuild(Math.min(3,i)):game?GBUILD[i]():S.build())+
  '<rect class="bw-veil" width="'+W+'" height="'+H+'" fill="#030103" opacity="1"/></svg>';
 return '<div class="pallid-cine-v2 rw3-scene'+(game?' rwg-on':'')+'" data-stage="'+i+'"'+(game?' data-game="1"':'')+(breath?' data-breath="1"':'')+' role="img" aria-label="'+esc(NAME+' · '+(i+1)+'단계 '+S.title)+'">'+svg+
  '<span class="cine-top" aria-hidden="true">'+esc(NAME+' · '+S.title)+'</span>'+
  '<span class="cine-bottom" aria-hidden="true">'+esc(breath?BREATHCAP[Math.min(3,i)]:game?GAMECAP[i]:S.caps[0][1])+'</span>'+
  (game?'<div class="rwg-hud" aria-hidden="true"><span class="rwg-hint"></span><span class="rwg-verdict"></span><span class="rwg-pips"></span><span class="rwg-count"></span>'+
   '<span class="rwg-bar"><i></i></span><span class="rwg-time"><i></i></span></div>':'')+
  '<span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}
const API=window.RedWhaleV3={html,stages:SCENES.map(s=>s.title),replayToken:0};
let start=0,lastSeen=0,seenTok=-1,seenStage=-1,seenGame=false;
function frame(now){
 const el=document.querySelector('.rw3-scene');
 if(el&&el.isConnected){
  const st=+el.dataset.stage,S=SCENES[st],g=window.RedHuntGame;
  const isBreath=!!(el.dataset.breath&&g&&g.t0&&g.mode==='breath');
  const isGame=!isBreath&&!!(el.dataset.game&&g&&g.t0&&g.mode===GAMEMODE[st]);
  if(S&&isBreath){
   const t=(now-g.t0)/1000;lastSeen=now;seenGame=true;seenStage=st;
   try{breathGame(el,t,t,g);}catch(e){if(!el._rwErr){el._rwErr=1;console.warn('붉은 고래 숨',e);}}
  }else if(S&&isGame){
   const t=(now-g.t0)/1000;lastSeen=now;seenGame=true;seenStage=st;
   try{GAMEPAINT[st](el,t,t,g);}catch(e){if(!el._rwErr){el._rwErr=1;console.warn('붉은 고래 미니게임',e);}}
  }else if(S){
   if(now-lastSeen>900||API.replayToken!==seenTok||st!==seenStage||seenGame){start=now;seenTok=API.replayToken;seenStage=st;seenGame=false;}
   if(API.resume&&API.resume.stage===st&&!el.dataset.game){start=API.resume.start;API.resume=null;}
   if(el.closest('.is-paused'))start+=now-lastSeen;
   lastSeen=now;
   let tr=(now-start)/1000;
   if(el.dataset.seek!=null)tr=+el.dataset.seek;
   const t=S.loop?tr%S.loop:tr;
   try{S.paint(el,t,tr);}catch(e){if(!el._rwErr){el._rwErr=1;console.warn('붉은 고래 이펙트',e);}}
  }
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
