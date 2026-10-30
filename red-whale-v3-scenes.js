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
 '<linearGradient id="rwMud" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3a1a16"/><stop offset=".35" stop-color="#26100e"/><stop offset="1" stop-color="#0c0405"/></linearGradient>'+
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
  '<rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" filter="url(#rwMudTex)" opacity=".6"/>'+
  '<path class="rw-cracks" d="'+CRACKS+'" fill="none" stroke="#080203" stroke-width="2.2" stroke-linejoin="round" opacity="0"/>'+
  '<path class="rw-cracks2" d="'+CRACKS+'" fill="none" stroke="#c8644a" stroke-opacity=".18" stroke-width="1" transform="translate(0 -1.5)" opacity="0"/>'+
  '<path class="rw-ring" d="M0,'+(SEA+2)+' H'+W+'" stroke="#5a2a22" stroke-width="3" opacity="0"/>'+
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
// 수위(0=가득, 1=말라붙음)에 따라 물·균열·김
function paintBed(el,tr,level){
 const {q,qa}=cacheQ(el);
 const wy=SEA+level*96;
 q('.rw-water').setAttribute('transform','translate(0 '+n1(wy)+')');
 q('.rw-wrect').setAttribute('y','0');q('.rw-wrect').setAttribute('height',n1(H-wy+2));
 q('.rw-water').style.opacity=n3(1-level*.55);
 qa('.bw-wave').forEach(w=>{const i=+w.dataset.i;w.style.strokeDashoffset=n1(tr*(8+i*6)*(i%2?1:-1));});
 qa('.bw-glint').forEach(g=>{const i=+g.dataset.i;g.setAttribute('opacity',n3((0.08+0.12*(0.5+0.5*Math.sin(tr*2.3+i*1.7)))*(1-level)));});
 q('.rw-cracks').setAttribute('opacity',n3(seg(level,.45,1)*.9));q('.rw-cracks2').setAttribute('opacity',n3(seg(level,.6,1)));
 q('.rw-ring').setAttribute('opacity',n3(seg(level,.15,.5)*.7));
 qa('.bw-mist').forEach((m,i)=>m.setAttribute('transform','translate('+n1(Math.sin(tr*0.13+i*2)*50)+' 0)'));
 const hs=q('.rw-heat');if(hs)hs.style.opacity=n3(.4+.6*level+.15*Math.sin(tr*2.2));
 qa('.rw-steam ellipse').forEach(e=>{const x=+e.dataset.x,p=+e.dataset.p,s=+e.dataset.s,u=((tr*.18*s+p)%1);
  e.setAttribute('cx',n1(x+Math.sin(tr*.8+p*9)*20));e.setAttribute('cy',n1(wy-20-u*170));e.setAttribute('rx',n1(6+u*14));e.setAttribute('ry',n1(22+u*30));
  e.setAttribute('opacity',n3(level*.09*Math.sin(u*Math.PI)));});
 return wy;
}
// 마른 바닥에 얹힌 배(물이 있으면 출렁임)
function boatOnBed(el,tr,level,x,extra){
 const e=extra||{},bobK=1-seg(level,.55,.85);
 const y=SEA+level*74+(Math.sin(tr*1.6)*2.2+Math.sin(tr*.7)*1.2)*bobK+(e.dy||0);
 const r=(Math.sin(tr*1.25+.6)*2.6)*bobK+7*seg(level,.6,1)+(e.dr||0);
 const tw=boatPose(el,x+(e.dx||0),y,r,e.arm||[37,-30]);
 lamp(el,tr,tw,e.lamp||0);
 const {q}=cacheQ(el);q('.rw-bclip').setAttribute('height',n1(SEA+level*96+2));const lg=q('.bw-lampglint');lg.setAttribute('cy',n1(SEA+level*96+9));lg.style.opacity=n3(parseFloat(lg.style.opacity||0)*(1-level));
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

// 땅에서 솟는 팔: 땅 아래는 가리고, 뚫고 나온 자리에 진흙 구멍
function groundArm(cls){
 return '<clipPath id="cp-'+cls+'"><rect class="gclip" width="'+W+'" height="'+H+'"/></clipPath>'+
  '<g class="ga-'+cls+'"><ellipse class="ga-hole" rx="30" ry="8" fill="#0a0203" opacity="0"/>'+
  '<g clip-path="url(#cp-'+cls+')">'+armMarkup(cls)+'</g>'+
  '<ellipse class="ga-lip" rx="34" ry="9" fill="none" stroke="#6a3226" stroke-width="3" opacity="0"/></g>';
}
function paintGroundArm(el,cls,o,groundY,vis){
 const {q}=cacheQ(el);
 const g=q('.'+cls),wrap=q('.ga-'+cls);
 q('#cp-'+cls+' .gclip').setAttribute('height',n1(groundY));
 const hole=wrap.querySelector('.ga-hole'),lip=wrap.querySelector('.ga-lip');
 [hole,lip].forEach(e=>{e.setAttribute('cx',n1(o.x));e.setAttribute('cy',n1(groundY));e.setAttribute('rx',n1((o.w||42)*.85));e.setAttribute('ry',n1((o.w||42)*.22));});
 hole.setAttribute('opacity',n3(vis*.9));lip.setAttribute('opacity',n3(vis*.6));
 g.style.opacity=vis>0?'1':'0';
 if(vis>0)paintArm(g,o);
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
const S0={title:'말라붙는 호수',loop:8.5,
 caps:[[0,'호수 깊은 곳에서 새빨간 무언가가 떠오릅니다.'],[1.6,'그것이 다가올수록 물이 시들어 갑니다. 김이 피어오릅니다.'],[3.6,'호수 바닥이 갈라지고, 배가 메마른 진흙 위에 얹힙니다.'],[5.4,'아득한 곳에서 붉은 눈 두 개가 떠오릅니다.']],
 build(){
  return scenery()+
   '<g class="rw-farhead" opacity="0" clip-path="url(#rwAboveBed)"><g class="rw-hd">'+headMarkup()+'</g></g>'+
   bed()+steam(14)+rwBoat()+drops('rw-drip',18,3,'#c88a7a')+nearMist();
 },
 paint(el,t,tr){
  const {q,qa}=cacheQ(el);
  const level=inOut(seg(t,1.4,4.8));
  paintBed(el,tr,level);
  deep(el,bell(t,.2,1.4,3.2,4.6)*(.75+.25*Math.sin(tr*3)),480,SEA+150-60*seg(t,.2,2.4));
  wither(el,.5*seg(t,3.6,5.2));
  boatOnBed(el,tr,level,300,{});
  // 먼 곳의 머리: 외투막과 두 눈만
  const fh=bell(t,5.0,6.0,7.4,8.2);
  const g=q('.rw-farhead');g.setAttribute('opacity',n3(fh*.9));
  g.firstChild.setAttribute('transform','translate(720 '+n1(SEA+40-46*outC(seg(t,5,6.6)))+') scale(.16)');
  if(fh>0)paintHead(g.firstChild,tr,{open:seg(t,5.6,6.2),glow:1.4});
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
 caps:[[0,'갈라진 바닥 아래에서 새빨간 것이 꿈틀거립니다.'],[.9,'사람의 것을 닮은 팔들이 솟아오릅니다.'],[2.6,'악몽 같은 빨판이 선체에 들러붙습니다. 닿은 자리가 하얗게 시들어 갑니다.'],[4.6,'팔들이 배를 휘감아 조이고 목을 조르듯 들어 올립니다.']],
 build(){
  return scenery()+bed()+steam(10)+
   '<g class="rw-backarms">'+groundArm('ra2')+groundArm('ra3')+'</g>'+
   rwBoat()+
   '<g class="rw-frontarms">'+groundArm('ra0')+groundArm('ra1')+'</g>'+
   drops('rw-mudspray',40,9,'#5a2a22')+nearMist();
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
 caps:[[0,'갈라진 바닥 아래가 새빨갛게 달아오릅니다.'],[1.2,'거대한 몸이 바닥을 뚫고 솟아오릅니다.'],[3.0,'흰자 위의 붉은 눈동자가 배를 내려다봅니다.'],[5.6,'얼굴에서 늘어진 촉수가 꿈틀거리며 다가옵니다.']],
 build(){
  return scenery()+
   '<g clip-path="url(#rwAboveBed)"><g class="rw-hd">'+headMarkup()+'</g></g>'+
   bed()+steam(10)+
   '<g>'+groundArm('ha0')+groundArm('ha1')+'</g>'+
   rwBoat()+drops('rw-mud',36,27,'#4a2420')+nearMist();
 },
 paint(el,t,tr){
  const {q,qa}=cacheQ(el);
  paintBed(el,tr,1);wither(el,1);
  const rise=outC(seg(t,.9,3.2)),lunge=inOut(seg(t,5.8,7.4));
  deep(el,bell(t,0,.4,1.4,2.6),600,SEA+60);
  const hx=600,hy=SEA+250-350*rise+lunge*60,hs=.56+lunge*.3;
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
 caps:[[0,'머리가 바닥 아래로 가라앉습니다. 배 뒤쪽의 진흙이 들썩입니다.'],[1.6,'선미 뒤로 새빨간 꼬리가 솟아오릅니다.'],[3.0,'고래의 꼬리가 열립니다!'],[3.7,'작살잡이가 선미에서 몸을 돌려 열린 꼬리 한가운데를 겨눕니다.'],[4.6,'작살이 꼬리 속의 붉은 핵을 꿰뚫습니다.'],[6.2,'팔과 꼬리가 무너지고, 시들었던 호수에 물이 다시 차오릅니다.']],
 build(){
  let sparks='<g class="rw-sparks" stroke="#ffd9c0" stroke-linecap="round" opacity="0">';
  const r=seeded(81);for(let i=0;i<20;i++){const a=r()*TAU;sparks+='<path data-a="'+n3(a)+'" data-v="'+n1(60+r()*150)+'" stroke-width="'+n1(1+r()*1.6)+'"/>';}
  sparks+='</g>';
  return '<g class="rw-root">'+scenery()+
   '<g clip-path="url(#rwAboveBed)"><g class="rw-hd">'+headMarkup()+'</g></g>'+
   bed()+steam(10)+
   '<clipPath id="rwTailClip"><rect class="rw-tclip" width="'+W+'" height="'+(SEA+70)+'"/></clipPath>'+
   '<g clip-path="url(#rwTailClip)"><g class="rw-tailg">'+tailMarkup()+'<g class="rw-stuck" opacity="0">'+HARPOON.replace('class="bw-tip"','class="rw-tip"')+'</g></g></g>'+
   '<ellipse class="rw-thole" rx="80" ry="14" fill="#0a0203" opacity="0"/>'+
   '<g>'+groundArm('ka0')+groundArm('ka1')+'</g>'+
   rwBoat()+
   '<path class="bw-rope" fill="none" stroke="#8a7d7a" stroke-opacity=".75" stroke-width="1.5" opacity="0"/>'+
   '<g class="bw-harpoon" opacity="0">'+HARPOON+'</g>'+
   '<circle class="bw-flash" r="70" fill="url(#bwFlash)" opacity="0"/>'+sparks+
   drops('rw-blood',26,83,'#1e0206')+drops('rw-mud',40,87,'#4a2420')+
   nearMist()+'</g>';
 },
 paint(el,tReal,tr){
  const {q,qa}=cacheQ(el);
  const t=Math.min(tReal,this.dur);
  const T0=3.95,HIT=4.45,TX=150;
  const level=1-inOut(seg(t,6.0,10.0));
  paintBed(el,tr,level);
  wither(el,1-seg(t,8,10.5));
  // 머리: 바닥 아래로 가라앉음
  const hsink=inOut(seg(t,0,1.6)),hd=q('.rw-hd');
  hd.style.display=hsink>=1?'none':'';
  if(hsink<1){hd.setAttribute('transform','translate(600 '+n1(SEA-100+hsink*420)+') scale(.6)');paintHead(hd,tr,{open:1-hsink,glow:1-hsink,look:[-6,5]});}
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
  rope.setAttribute('opacity',thrown&&ropeEnd[1]<SEA+level*96+6?'.9':'0');
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

const SCENES=[S0,S1,S2,S3,S4];
function html(stage){
 const i=Math.max(0,Math.min(4,Math.floor(+stage||0))),S=SCENES[i];
 const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'+
  '<defs>'+commonDefs()+headDefs()+tailDefs()+redDefs()+'</defs>'+S.build()+
  '<rect class="bw-veil" width="'+W+'" height="'+H+'" fill="#030103" opacity="1"/></svg>';
 return '<div class="pallid-cine-v2 rw3-scene" data-stage="'+i+'" role="img" aria-label="'+esc(NAME+' · '+(i+1)+'단계 '+S.title)+'">'+svg+
  '<span class="cine-top" aria-hidden="true">'+esc(NAME+' · '+S.title)+'</span>'+
  '<span class="cine-bottom" aria-hidden="true">'+esc(S.caps[0][1])+'</span>'+
  '<span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}
const API=window.RedWhaleV3={html,stages:SCENES.map(s=>s.title),replayToken:0};
let start=0,lastSeen=0,seenTok=-1,seenStage=-1;
function frame(now){
 const el=document.querySelector('.rw3-scene');
 if(el&&el.isConnected){
  const st=+el.dataset.stage,S=SCENES[st];
  if(S){
   if(now-lastSeen>900||API.replayToken!==seenTok||st!==seenStage){start=now;seenTok=API.replayToken;seenStage=st;}
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
