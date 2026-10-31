/* 모든 것을 뚫는 푸른 고래 · v3 다섯 장면 (blue-whale-v3.js의 도구를 씀)
   window.BlueWhaleV3 = {html(stage), stages, replayToken} */
(function(){
'use strict';
const K=window.BlueWhaleV3Kit;
if(!K)return;
const {W,H,SEA,clamp,outC,inC,inOut,seg,bell,lerp,n1,n3,TAU,RAD,seeded,esc,warp,mt,apply,
 marlinDefs,commonDefs,sky,sea,nearMist,boatMarkup,columns,curtain,paintCurtain,foam,paintFoam,whaleRef,setRef,drops,dropParams,paintDrops,cacheQ,ambient,boatPose,lamp,veil,caption,setUse,HARPOON,EYE,gp,riftMarkup,paintRift}=K;
const M='#bwmF',G='#bwmG';
const NAME='모든 것을 뚫는 푸른 고래';
const unwarp=(tau,s0,s1,d)=>tau<s0?tau:tau<s0+d?s0+(tau-s0)*(s1-s0)/d:tau-d+(s1-s0);
// 움직임 번짐: 고래 뒤로 아주 옅게 번지는 한 겹 (예전의 푸른 잔상 여러 겹 대신)
function ghosts(n,extra){return '<g filter="url(#bwSmear)" fill="#9fd4ef"'+(extra||'')+'><g opacity=".55"><use class="bw-ghost" data-k="1" href="'+G+'" opacity="0"/></g></g>';}
function rings(n){let s='<g class="bw-rings" fill="none" stroke="#dbe9ee">';for(let i=0;i<n;i++)s+='<ellipse data-i="'+i+'" rx="1" ry="1" opacity="0"/>';return s+'</g>';}
function paintRings(nodes,x,age,max,gap){
 nodes.forEach(r=>{const i=+r.dataset.i,a=age-i*(gap||.45),p=clamp(a/2.6);
  if(a<=0||p>=1){r.setAttribute('opacity','0');return;}
  r.setAttribute('cx',n1(x));r.setAttribute('cy',n1(SEA+5));r.setAttribute('rx',n1(30+p*(max||260)));r.setAttribute('ry',n1(3+p*13));
  r.setAttribute('stroke-width',n1(1.6-p*1.2));r.setAttribute('opacity',n3((1-p)*.28));});
}
// 물기둥 하나: 나이(age)에 따라 솟았다 무너짐
function colH(age,h,rise,fall){if(age<=0)return 0;if(age<rise)return h*outC(age/rise);return h*(1-inC((age-rise)/fall));}
function paintCol(node,x,age,h,w,lean,rise,fall){
 rise=rise||.45;fall=fall||1.4;
 const hh=colH(age,h,rise,fall),ww=w*(1+0.35*clamp(age-rise));
 const op=1-seg(age,rise+fall*.6,rise+fall);
 node.setAttribute('transform',hh>1?'translate('+n1(x)+' '+SEA+') skewX('+n1(-lean*.25*clamp(age/rise))+') translate('+n1(-x)+' '+(-SEA)+')':'');
 paintCurtain(node,x-ww*1.5,x+ww*1.5,xx=>hh*Math.pow(Math.max(0,1-Math.pow((xx-x)/(ww*1.5),2)),.55),x*.37,age,hh>1?op:0);
}
function bob(tr){return {y:Math.sin(tr*1.6)*2.2+Math.sin(tr*.7)*1.2,r:Math.sin(tr*1.25+.6)*2.6};}
function jolt(s,amp,f){return s>0?amp*Math.exp(-s*2)*Math.sin(s*(f||10)):0;}
function speedLines(){return '<g class="bw-speed" opacity="0"></g>';}
function paintSpeed(el,tr,op,dir){
 const {q,qa}=cacheQ(el),g=q('.bw-speed');g.setAttribute('opacity',n3(op));
 if(op<=0)return;
 qa('.bw-speed path').forEach(p=>{const x0=+p.dataset.x,l=+p.dataset.l,x=((x0+dir*tr*1900)%(W+400)+W+400)%(W+400)-200;p.setAttribute('transform','translate('+n1(x-x0)+' 0)');});
}

/* =========================================================
   ① 수면의 절단 — 지느러미가 수면을 가르고, 한참 뒤에 물이 갈라져 솟는다
   ========================================================= */
// 갈라짐 경로(수면 위 점들): x0→x1, 깊이 z
function lateral(x0,x1,z,step,wob,t){const p=[];for(let x=x0;x<=x1+.1;x+=step)p.push([x,z+(wob||0)*Math.sin(x*.013+(t||0)*.8)]);if(p.length<2)p.push([x1,z]);return p;}
// 물벽 높이의 들쭉날쭉함 (0.3~1.2): 한 줄로 고르게 솟지 않게
const hVar=(x,sd)=>{const a=.5+.5*Math.sin(x*.0093+sd),b=.5+.5*Math.sin(x*.0217+sd*2.3),c=.5+.5*Math.sin(x*.0571+sd*5.1);return .25+.95*clamp(Math.pow(a*.55+b*.3+c*.15,1.6)*1.5);};
// 화면 x를 깊이 z의 바닥 X로 (갈라짐이 화면의 그 자리에 오도록)
const gX=(sx,z)=>W/2+(sx-W/2)*z;
const S0={title:'수면의 절단',loop:7.5,
 caps:[[0,'안개 낀 수면이 숨을 죽입니다.'],[1.2,'푸른 지느러미가 칼날처럼 수면을 긋고 지나갑니다.'],[2.7,'한참 늦게, 갈라진 물이 솟구쳐 배를 덮칩니다.'],[4.4,'저 멀리서 지느러미가 방향을 틉니다.']],
 build(){
  return sky()+
   '<use class="bw-far" href="'+M+'" opacity="0"/>'+
   ghosts(3)+
   '<use class="bw-fin" href="'+M+'" opacity="0"/>'+
   sea()+
   foam('bw-foam0',30)+
   '<ellipse class="bw-bow" rx="60" ry="5" fill="#e4f2f7" filter="url(#bwRimF)" opacity="0"/>'+
   boatMarkup()+
   riftMarkup('bw-rift0','back')+riftMarkup('bw-rift0','front')+
   curtain('bw-wall')+
   columns('bw-cols',4)+
   rings(3)+
   drops('bw-drops',36,5)+
   nearMist();
 },
 paint(el,t,tr){
  const {q,qa}=cacheQ(el);
  ambient(el,tr,0);
  const a=1.3,b=2.5,dur=b-a,S=.6,Y=SEA+44;
  const vOf=u=>u+0.11*Math.sin(TAU*u);
  const Xc=v=>1520-2350*v;
  const at=tt=>Xc(vOf(seg(tt,a,b)));
  const on=t>a&&t<b;
  const X=at(t);
  setUse(q('.bw-fin'),mt(X,Y+Math.sin(t*9)*1.2,0,S,S,500,0),on?1:0);
  qa('.bw-ghost').forEach(g=>{const k=+g.dataset.k,tt=t-k*0.05;setUse(g,mt(at(tt),Y,0,S,S,500,0),on&&tt>a?(.3-k*.08):0);});
  const tipOff=560*S;
  function passT(x){
   const v=(1520-tipOff-x)/2350;let u=clamp(v,-.2,1.2);
   for(let i=0;i<8;i++)u-=(u+0.11*Math.sin(TAU*u)-v)/(1+0.11*TAU*Math.cos(TAU*u));
   return a+u*dur;
  }
  // 앞쪽 물살
  const bw=q('.bw-bow');bw.setAttribute('cx',n1(X-tipOff+40));bw.setAttribute('cy',n1(SEA+2));bw.setAttribute('opacity',on?'.4':'0');
  paintFoam(q('.bw-foam0'),on?X:480,on?260*S/.6:900,on?1:.6*bell(t,a,a+.1,4.2,5.2),9);
  // 갈라지는 호수: 지느러미가 지나간 자리부터 수면이 칼금처럼 열리고, 한참 늦게 양쪽 물벽이 솟았다 무너짐
  // (배보다 조금 앞쪽 깊이 0.88을 지나감 — 먼 쪽 물벽이 솟으면 배를 가림)
  {const Z=.88,path=lateral(-80,1060,Z,16),end=1-seg(t,4.6,5.6);
   const sA=path.map(p=>t-passT(W/2+(p[0]-W/2)/Z)),rise=sA.map(s=>outC(seg(s,.3,1.0))*(1-inOut(seg(s,1.6,2.9))));
   const o=sA.map((s,i)=>s>0?outC(clamp(s/.28))*(1-inOut(seg(s,1.9,3.1)))*end:0);
   paintRift(el,'bw-rift0',{path,o,D:46,t,flow:0,glow:1,seed:2,
    w:i=>14+30*rise[i],
    H:i=>{const x=path[i][0],k=rise[i]*hVar(x,1.1);return [5+80*k+10*k*Math.sin(x*.041),2+26*k*hVar(x,4)];}});}
  // 늦게 솟는 물기둥 (무너지는 물벽 끝의 물보라)
  paintCurtain(q('.bw-wall'),-40,1000,x=>colH(t-passT(x)-.3,50+20*Math.sin(x*.013+1)+16*Math.sin(x*.041),.42,1.6)*.8,3,t,.32*(1-seg(t,4.6,5.6)));
  const r=seeded(77);
  qa('.bw-cols .bw-col').forEach(p=>{const i=+p.dataset.i,x=120+i*230+r()*60,h=130+r()*70,w=18+r()*10;
   paintCol(p,x,t-passT(x)-0.36-r()*.08,h,w,-14,.45,1.5);});
  // 배: 물이 솟는 순간 크게 흔들림
  const tj=passT(300)+.36,s=t-tj,B=bob(tr);
  const j=jolt(s,1,9),heave=s>0?-12*Math.exp(-s*2.2)*Math.sin(s*6):0;
  const tw=boatPose(el,300-j*5,SEA+B.y+heave,B.r+j*11,[37,-30]);
  lamp(el,tr,tw,s>0&&s<1?.15*Math.sin(s*40):0);
  paintRings(qa('.bw-rings ellipse'),300,s,240);
  if(!this._dp)this._dp=dropParams(36,9,-160,-20,80,260);
  paintDrops(qa('.bw-drops circle'),this._dp,300,SEA-10,s,260,380);
  // 멀리서 방향을 트는 지느러미
  const fu=seg(t,4.3,6.4);
  setUse(q('.bw-far'),mt(-160+1300*fu,SEA+15+Math.sin(t*5)*1,0,-.17,.17,500,0),bell(t,4.3,4.7,6.0,6.4)*.85);
  veil(el,tr<.6?1-tr/.6:.3*(t<.6?1-t/.6:seg(t,6.9,7.5)));   // 반복 경계는 검게 끊지 않고 살짝만 어두워짐
  caption(el,this.caps,t);
 }
};

/* =========================================================
   ② 초고속 관통 — 물속 빛줄기, 수면을 뚫고 솟구친 청새치가 배 앞을 가로지름(느린 화면)
   ========================================================= */
const S1={title:'초고속 관통',loop:7.5,
 caps:[[0,'물속에서 푸른 빛줄기가 다가옵니다.'],[1.2,'창 같은 주둥이가 수면을 뚫고 솟구칩니다.'],[1.55,'보이지 않는 것이 배 앞을 가로지릅니다. 주둥이 끝만 번뜩입니다.'],[2.5,'지나간 자리에서 물이 한참 늦게 솟구칩니다.']],
 build(){
  return sky()+
   '<g clip-path="url(#bwBelow)"><use class="bw-under" href="'+M+'" opacity="0"/></g>'+
   sea()+
   '<g clip-path="url(#bwBelow)"><ellipse class="bw-uglow" rx="170" ry="26" fill="url(#bwUnder)" opacity="0"/></g>'+
   '<ellipse class="bw-hump" rx="50" ry="4" fill="#dcecf2" filter="url(#bwRimF)" opacity="0"/>'+
   whaleRef('bw-ref')+foam('bw-foam1',30)+
   boatMarkup()+
   riftMarkup('bw-rift1','back')+riftMarkup('bw-rift1','front')+
   curtain('bw-wall')+
   columns('bw-cols',4)+
   speedLines(16,31,120,SEA-6)+
   '<g clip-path="url(#bwAbove)">'+ghosts(4)+'<use class="bw-front" href="'+M+'" opacity="0"/></g>'+
   drops('bw-trail',70,12)+
   drops('bw-drops',30,6)+
   rings(3)+
   nearMist();
 },
 paint(el,t,tr){
  const {q,qa}=cacheQ(el);
  ambient(el,tr,0);
  const S=.82,s0=1.5,s1=2.25,sd=.16;
  const tau=warp(t,s0,s1,sd);
  const c0=1.25,cl=.62;
  function pose(tt){ // 장면 시간 → 중심 좌표·각도
   if(tt<c0){const u=seg(tt,.1,c0);return {x:1500-500*u,y:SEA+150-55*u,d:27*seg(tt,.8,c0)};}
   const u=(tt-c0)/cl;
   return {x:1000-1500*u,y:SEA+95-760*u*(1-u),d:Math.atan2(760*(1-2*u),1500)/RAD};
  }
  const P=pose(tau),crossing=tau>=c0&&tau<c0+cl,before=tau<c0;
  const tr0=mt(P.x,P.y,P.d,S,S,500,0);
  setUse(q('.bw-under'),tr0,(before?seg(t,.1,.5):crossing?1:0));
  setUse(q('.bw-front'),tr0,crossing?1:0);
  setRef(q('.bw-ref'),tr0,crossing?.16:0);
  paintFoam(q('.bw-foam1'),crossing?Math.max(60,P.x+380):900,300,crossing?1:Math.max(0,1-(t-2.4)/1.6),11);
  const slow=t>s0&&t<s1?1:0;
  qa('.bw-ghost').forEach(g=>{const k=+g.dataset.k,pp=pose(tau-k*.022);setUse(g,mt(pp.x,pp.y,pp.d,S,S,500,0),crossing?(.26-k*.05)*(1-.75*slow):0);});
  // 물속 빛과 수면의 물살
  const ug=q('.bw-uglow'),tipX=P.x-460;
  ug.setAttribute('cx',n1(tipX+60));ug.setAttribute('cy',n1(SEA+48));ug.setAttribute('opacity',n3(before?seg(t,.2,.9):0));
  const hp=q('.bw-hump');hp.setAttribute('cx',n1(tipX+30));hp.setAttribute('cy',n1(SEA+2));hp.setAttribute('rx',n1(30+40*seg(t,.3,1.2)));hp.setAttribute('opacity',n3(before?.6*seg(t,.4,1.0):0));
  paintSpeed(el,tr,crossing?(slow?.12:.9):0,-1);
  // 몸에서 흩날리는 물: 장면 시간으로 움직여 느린 화면에서 공중에 멈춘 듯 보임
  if(!this._tp){const r=seeded(41);this._tp=Array.from({length:70},()=>({te:c0+.04+r()*(cl-.1),lx:520+r()*420,ly:-60+r()*130,vx:60+r()*260,vy:-60-r()*220,l:.5+r()*.5}));}
  qa('.bw-trail circle').forEach(d=>{const p=this._tp[+d.dataset.i],k=tau-p.te;
   if(k<=0||k>p.l){d.setAttribute('opacity','0');return;}
   const e=pose(p.te),o=apply(e.x,e.y,e.d,S,S,500,0,p.lx,p.ly),x=o[0]+p.vx*k,y=o[1]+p.vy*k+520*k*k;
   d.setAttribute('cx',n1(x));d.setAttribute('cy',n1(y));d.setAttribute('opacity',y>SEA?'0':n3(.8*(1-k/p.l)));});
  // 지나간 자리에서 늦게 솟는 물기둥 (중심이 지나간 시각 기준)
  const passReal=x=>unwarp(c0+cl*clamp((1000-x)/1500,0,1),s0,s1,sd);
  paintCurtain(q('.bw-wall'),-40,1000,x=>colH(t-passReal(x+300)-.25,44+20*Math.sin(x*.011+2)+14*Math.sin(x*.037),.45,1.7),5,t,.32*(1-seg(t,4.8,5.8)));
  // 갈라지는 호수: 물속에서 다가올 땐 머리 위 수면에 가는 금이 따라오고(빛나는 틈), 솟구쳐 지나간 뒤 양쪽 물벽이 크게 열림
  {const Z=.86,path=lateral(-80,1080,Z,16),end=1-seg(t,4.8,5.8);
   const passAt=x=>x>=540?.1+(1040-x)/500*(c0-.1):passReal(x+300);
   const sx=path.map(p=>W/2+(p[0]-W/2)/Z),sA=sx.map(x=>t-passAt(x)),cross=sx.map(x=>x<540?1:clamp((1040-x)/500*.0+(t>c0?1:0)));
   const rise=sA.map((s,i)=>cross[i]*outC(seg(s,.2,.95))*(1-inOut(seg(s,1.8,3.0))));
   const o=sA.map(s=>s>0?outC(clamp(s/.22))*(1-inOut(seg(s,2.2,3.4)))*end:0);
   paintRift(el,'bw-rift1',{path,o,D:50,t,flow:0,glow:1,seed:4,
    w:i=>10+34*rise[i],
    H:i=>{const x=path[i][0],k=rise[i]*hVar(x,2.3);return [6+84*k+8*k*Math.sin(x*.037),2+28*k*hVar(x,5.2)];}});}
  const r=seeded(13);
  qa('.bw-cols .bw-col').forEach(p=>{const i=+p.dataset.i,x=60+i*240+r()*70,h=150+r()*90,w=20+r()*12;
   paintCol(p,x,t-passReal(x+300)-.32-r()*.1,h,w,-18,.5,1.6);});
  // 배
  const tj=passReal(560)+.3,s=t-tj,B=bob(tr),j=jolt(s,1,8),heave=s>0?-14*Math.exp(-s*2)*Math.sin(s*5.5):0;
  const tw=boatPose(el,210-j*6,SEA+B.y+heave,B.r+j*13,[37-8*bell(t,.6,1,2.6,3.2),-31]);
  lamp(el,tr,tw,s>0&&s<1?.15*Math.sin(s*40):0);
  paintRings(qa('.bw-rings ellipse'),210,s,280);
  if(!this._dp)this._dp=dropParams(30,8,-150,-30,90,280);
  paintDrops(qa('.bw-drops circle'),this._dp,230,SEA-12,s,240,380);
  veil(el,tr<.6?1-tr/.6:.3*(t<.6?1-t/.6:seg(t,6.9,7.5)));   // 반복 경계는 검게 끊지 않고 살짝만 어두워짐
  caption(el,this.caps,t);
 }
};

/* =========================================================
   ③ 푸른 항로 추적 — 배가 고래가 남긴 빛나는 물길을 따라 전속력으로 쫓음(끊김 없는 반복)
   ========================================================= */
const FLOW=430;
// 갈라진 호수: 고래 꼬리 뒤로 호수가 두 벽으로 갈라져 열리고, 주둥이 앞으로는 수면이 먼저 금 감
function rift(s){if(s<=0)return 0;return (1-Math.exp(-s/70))*(.55+.45*Math.exp(-s/700));}
const S2={title:'푸른 항로 추적',loop:8,seamless:true,
 caps:[[0,'고래가 지나간 자리마다 호수가 둘로 갈라집니다. 배는 그 갈라진 틈을 따라 쫓습니다.'],[2.8,'고래가 몸을 튕기자 갈라진 물벽이 무너지며 물기둥이 솟습니다.'],[5.3,'푸른 등이 물 아래로 사라져도 호수의 금은 아직 앞으로 뻗어 갑니다.']],
 build(){
  const r=seeded(57);let streaks='<g class="bw-streaks" stroke="#cfe3ea" stroke-linecap="round">';
  for(let i=0;i<26;i++){const y=SEA+6+Math.pow(r(),1.4)*(H-SEA-6),k=(y-SEA)/(H-SEA);streaks+='<path data-x="'+n1(r()*1100)+'" data-k="'+n3(k)+'" d="M0,'+n1(y)+' h'+n1(14+60*k)+'" stroke-width="'+n1(.8+k*1.6)+'" stroke-opacity="'+n3(.08+k*.16)+'"/>';}
  streaks+='</g>';
  const defs='<defs>'+
   '<linearGradient id="bwCrackG" gradientUnits="userSpaceOnUse" x1="600" y1="0" x2="960" y2="0"><stop stop-color="#e8f8ff"/><stop offset=".55" stop-color="#bfe9ff" stop-opacity=".55"/><stop offset="1" stop-color="#bfe9ff" stop-opacity="0"/></linearGradient>'+
   '<clipPath id="bwTrBoat"><rect width="'+W+'" height="'+(SEA+70)+'"/></clipPath>'+
  '</defs>';
  return defs+sky()+
   '<use class="bw-far" href="'+M+'" opacity="0"/>'+
   '<use class="bw-near" href="'+M+'"/>'+
   sea()+
   whaleRef('bw-ref')+
   streaks+
   riftMarkup('bw-rift','back')+
   '<g clip-path="url(#bw-rift-clip)"><g class="bw-wake" fill="none" stroke="#e1eef3" stroke-linecap="round">'+[0,1,2,3,4].map(i=>'<path data-i="'+i+'" stroke-width="'+n1(2.2-i*.3)+'"/>').join('')+'</g></g>'+
   columns('bw-cols',4)+
   boatMarkup().replace('url(#bwAbove)','url(#bw-rift-clip)').replace('<g opacity=".24" mask','<g opacity="0" mask')+
   drops('bw-bowspray',30,21)+
   riftMarkup('bw-rift','front')+
   // 주둥이 앞으로 먼저 갈라지는 수면
   '<g class="bw-crack" fill="none" stroke-linecap="round"><path class="bw-crack-g" stroke="#5fcfff" stroke-width="9" stroke-opacity=".45" filter="url(#bwSoft)"/>'+
   '<path class="bw-crack-d" stroke="#02070d" stroke-width="3" stroke-opacity=".7"/><path class="bw-crack-c" stroke="url(#bwCrackG)" stroke-width="1.2"/></g>'+
   nearMist();
 },
 paint(el,t,tr){
  const {q,qa}=cacheQ(el);
  ambient(el,tr,FLOW);
  const L=8,w=TAU/L;
  // 앞서 달아나는 고래(오른쪽을 바라봄)
  const S=.55;
  const dive=tt=>{
   tt=((tt%L)+L)%L;
   let d=4*Math.sin(w*4*tt);
   d+=-78*Math.sin(Math.PI*seg(tt,2.8,4.4));
   d+=130*inOut(seg(tt,5.2,6.0))*(1-inOut(seg(tt,7.2,8.0)));
   return d;
  };
  const g=el.dataset.game&&window.BlueHuntGame&&window.BlueHuntGame.mode==='chase'?window.BlueHuntGame:null;
  let off=0,sink=0;
  if(g){
   const k=(g.hits||0)/(g.need||12),missK=g.lastMissAt!=null?Math.exp(-(t-g.lastMissAt)*1.4):0;
   let target=110-170*k+60*(g.misses||0)+90*missK;
   if(g.done==='fail'){target+=260*seg(t,g.doneAt,g.doneAt+1.2);sink=150*inOut(seg(t,g.doneAt+.2,g.doneAt+1.2));}
   g._off=g._off==null?target:lerp(g._off,target,.08);off=g._off;
  }
  const X=tt=>700+off+55*Math.sin(w*tt)+18*Math.sin(w*3*tt+1);
  const Y=tt=>SEA+40+(g?dive(tt)*.35+sink:dive(tt));
  const dy=(Y(t+.03)-Y(t-.03))/.06,deg=clamp(Math.atan2(dy,300)/RAD,-28,28);
  const nx=X(t),ny=Y(t);
  setUse(q('.bw-near'),mt(nx,ny,deg,-S,S,500,0),1);
  setRef(q('.bw-ref'),mt(nx,ny,deg,-S,S,500,0),.14);
  const tail=apply(nx,ny,deg,-S,S,500,0,930,0);
  // 고래가 깊이 잠수하면 틈이 덜 벌어짐, 튀어 오르면 크게 벌어짐
  const under=clamp((ny-(SEA+60))/60),surge=clamp((SEA+40-ny)/70);
  const amp=(1-.55*under)*(1+.35*surge);
  const tx=tail[0]-10,P=tr*FLOW;
  // 배와 고래가 있는 거리(Z=1)를 따라 옆으로 길게 갈라짐: 먼 쪽 벽은 높이, 가까운 쪽은 낮게 밀려남
  const path=lateral(-80,tx,1,14);
  const o=path.map(p=>rift(tx-p[0])*amp);
  paintRift(el,'bw-rift',{path,o,w:62,D:70,t:tr,flow:FLOW,glow:.8,seed:5,
   H:i=>{const x=path[i][0];return [66+8*Math.sin((x+P)/43)+4*Math.sin((x+P*1.3)/17)+7*Math.sin((x+P*.6)/97),10+3*Math.sin((x+P)/31+1)+2*Math.sin((x+P*1.2)/13)];}});
  // 주둥이 앞의 금: 수면이 먼저 갈라져 수평선 쪽으로 뻗어 감
  const cx0=tx+50,flick=.75+.25*Math.sin(tr*13)*Math.sin(tr*7.7+1);
  let cr='';for(let x=cx0,i=0;x<=W+20;x+=16,i++){const j=((Math.sin(i*12.9898+Math.floor(tr*9)*.7)*43758.5453)%1+1)%1;cr+=(i?' L':'M')+n1(x)+','+n1(SEA+1.2+(j-.5)*1.6*(1-(x-cx0)/600));}
  ['.bw-crack-g','.bw-crack-d','.bw-crack-c'].forEach(c=>q(c).setAttribute('d',cr||'M0,0'));
  const cg=el.querySelector('#bwCrackG');if(cg){cg.setAttribute('x1',n1(cx0));cg.setAttribute('x2',n1(cx0+520));}
  q('.bw-crack').setAttribute('opacity',n3((1-under*.6)*flick));
  // 흘러가는 수면의 거품
  qa('.bw-streaks path').forEach(p=>{const x0=+p.dataset.x,k=+p.dataset.k,x=((x0-P*(.55+1.7*k))%1100+1100)%1100-70;p.setAttribute('transform','translate('+n1(x)+' 0)');});
  // 고래가 일으킨 물기둥이 뒤로 흘러와 배 양옆을 지나감
  const spawns=[.9,3.95,4.5,6.5];let bump=0;
  const bx=240+6*Math.sin(w*t),bow=bx+56*1.9;
  qa('.bw-cols .bw-col').forEach(p=>{const i=+p.dataset.i,sj=spawns[i],age=(((t-sj)%L)+L)%L;
   const sx=apply(X(sj),Y(sj),0,-S,S,500,0,880,0)[0],x=sx-FLOW*.85*age;
   paintCol(p,x,age,i===1?140:100,22,10,.35,1.7);
   const hh=colH(age,1,.35,1.7);bump+=Math.max(0,1-Math.abs(x-bow+20)/70)*hh;});
  // 배: 갈라진 골 안쪽, 낮아진 물 위를 달림 (앞쪽 낮은 물벽에 뱃전 아래가 가려짐)
  const ob=rift(tx-(bx+50))*amp,wl=SEA+7*ob;
  const pitch=-2.5+2.2*Math.sin(tr*3.1+.8)+1.2*Math.sin(tr*5.3);
  const by=wl+2.5*Math.sin(tr*3.1)+1.4*Math.sin(tr*5.3+1)-bump*5;
  const tw=boatPose(el,bx,by,pitch-bump*7,[38,-27]);
  lamp(el,tr,tw,0);
  q('.bw-lampglint').style.opacity='0';{const lr=q('.bw-lampref');if(lr)lr.setAttribute('opacity','0');}
  // 항적
  qa('.bw-wake path').forEach(p=>{const i=+p.dataset.i,x1=bx-40,yy=wl+3+i*2.2,len=120+i*70;
   p.setAttribute('d','M'+n1(x1)+','+n1(wl+2)+' Q'+n1(x1-len*.5)+','+n1(yy+2*Math.sin(tr*4+i))+' '+n1(x1-len)+','+n1(yy+i*1.2));
   p.setAttribute('stroke-opacity',n3(.32-i*.05));p.setAttribute('stroke-dasharray',(20+i*6)+' '+(10+i*5));p.style.strokeDashoffset=n1(-P*.9);});
  // 뱃머리 물보라 (계속 뿜어짐)
  if(!this._bp){const r=seeded(88);this._bp=Array.from({length:30},(_,i)=>({ph:i/30,vx:40+r()*120,vy:-120-r()*130,life:.45+r()*.35}));}
  const bwp=tw([56,-6]);
  qa('.bw-bowspray circle').forEach(c=>{const p=this._bp[+c.dataset.i],k=((tr*1.7+p.ph)%1)*p.life;
   const x=bwp[0]+p.vx*k-FLOW*.6*k,y=bwp[1]+p.vy*k+700*k*k;
   c.setAttribute('cx',n1(x));c.setAttribute('cy',n1(y));c.setAttribute('opacity',y>wl+3?'0':n3(.75*(1-k/p.life)));});
  // 저 멀리 가로지르는 푸른 등
  const fu=seg(t,5.6,7.8);
  setUse(q('.bw-far'),mt(1080-560*fu,SEA+14+16*seg(t,7.2,7.8),-2,.15,.15,500,0),bell(t,5.6,6.0,7.3,7.8)*.8);
  veil(el,tr<.6?1-tr/.6:0);
  if(g)hudChase(el,t,g);else caption(el,this.caps,t);
 }
};

/* =========================================================
   ④ 관통 회피 — 물속의 푸른 선이 뱃머리 앞에 멈추고, 배를 틀자 주둥이가 그 자리를 꿰뚫고 솟구침
   ========================================================= */
// ④ 갈라짐: 다가오는 선 위로 가는 틈 → 주둥이가 솟는 자리에서 크게 터져 열림
function s3Rift(el,tipX,lineOn,ea,cx){
 const Z=.95,path=lateral(-60,1060,Z,14);
 const sx=path.map(p=>W/2+(p[0]-W/2)/Z);
 const oa=sx.map(x=>lineOn*clamp((x-tipX)/50)*.6);
 const ob=sx.map(x=>ea>0?outC(clamp(ea/.22))*Math.exp(-Math.pow((x-cx)/(70+90*outC(clamp(ea/.7))),2))*(1-inOut(seg(ea,1.4,2.8))):0);
 const o=oa.map((a,i)=>Math.max(a,ob[i]));
 paintRift(el,'bw-rift3',{path,o,D:44,t:ea>0?ea:0,flow:0,glow:1,seed:6,
  w:i=>ob[i]>oa[i]?44:9,
  H:i=>ob[i]>oa[i]?[96*(1-.35*seg(ea,.5,1.6)),40]:[7,3]});
}
const S3={title:'관통 회피',loop:7.5,
 caps:[[0,'물속의 푸른 선이 뱃머리를 겨눕니다.'],[1.3,'선이 뱃머리 바로 앞에서 멈춥니다.'],[1.65,'키를 꺾어라!'],[2.05,'배가 있던 자리를 주둥이가 꿰뚫고 솟구칩니다.'],[3.1,'한참 늦게 그 자리에 물기둥이 솟습니다.']],
 build(){
  return sky()+
   '<g clip-path="url(#bwBelow)"><use class="bw-under" href="'+M+'" opacity="0"/></g>'+
   sea()+
   '<g clip-path="url(#bwBelow)"><ellipse class="bw-uglow" rx="150" ry="24" fill="url(#bwUnder)" opacity="0"/></g>'+
   '<g fill="none" stroke-linecap="round"><path class="bw-lineglow" stroke="#4fc6ff" stroke-width="9" filter="url(#bwSoft)" opacity="0"/><path class="bw-line" stroke="#d9f5ff" stroke-width="1.6" opacity="0"/></g>'+
   '<ellipse class="bw-hump" rx="40" ry="4" fill="#dcecf2" filter="url(#bwRimF)" opacity="0"/>'+
   whaleRef('bw-ref')+foam('bw-foam3',30)+
   columns('bw-cols',3)+
   boatMarkup()+
   riftMarkup('bw-rift3','back')+riftMarkup('bw-rift3','front')+
   '<g clip-path="url(#bwAbove)">'+ghosts(3)+'<use class="bw-front" href="'+M+'" opacity="0"/></g>'+
   curtain('bw-erupt','',4,20)+
   drops('bw-burst',50,33)+
   drops('bw-rain',44,34)+
   rings(3)+
   nearMist();
 },
 paint(el,t,tr){
  const {q,qa}=cacheQ(el);
  ambient(el,tr,0);
  const S=.9,X0=470,P=[X0,SEA-40],ang=50,dx=-Math.cos(ang*RAD),dy=-Math.sin(ang*RAD);
  // 1) 물속에서 다가와 뱃머리 앞에 멈춤
  const stopX=X0+56*1.9+50;
  const ap=outC(seg(t,.2,1.25)),tipX=lerp(1320,stopX,ap)+(t>1.25&&t<1.8?Math.sin((t-1.25)*30)*1.5:0);
  const diveK=seg(t,1.75,2.0);
  const under=t<2.0;
  // 2) 솟구침: 주둥이 끝이 P를 지나 왼쪽 위로 (느린 화면 2.16~2.76)
  const tau=warp(t,2.29,2.95,.09),k=-560+2430*(tau-1.95),erupt=tau>=1.95&&tau<2.8;
  if(under&&!erupt){
   setUse(q('.bw-under'),mt(tipX,SEA+120+70*diveK,8*diveK,S,S,-60,-6),seg(t,.2,.6)*(1-diveK));
  }else setUse(q('.bw-under'),mt(P[0]+dx*k,P[1]+dy*k,ang,S,S,-60,-6),erupt?1:0);
  setUse(q('.bw-front'),mt(P[0]+dx*k,P[1]+dy*k,ang,S,S,-60,-6),erupt?1:0);
  setRef(q('.bw-ref'),mt(P[0]+dx*k,P[1]+dy*k,ang,S,S,-60,-6),erupt?.16:0);
  {const ea=tau-2.12;paintCurtain(q('.bw-erupt'),430,620,x=>colH(ea,150*(1-Math.abs(x-525)/150*.6),.35,1.6),4,tr,ea>0?1:0);
   paintFoam(q('.bw-foam3'),513,ea>0?300:1,ea>0?Math.max(0,1-(ea-1.5)/2.5):0,13);}
  const slow=t>2.29&&t<2.95?1:0;
  qa('.bw-ghost').forEach(g=>{const j=+g.dataset.k,kk=k-j*60;setUse(g,mt(P[0]+dx*kk,P[1]+dy*kk,ang,S,S,-60,-6),erupt?(.28-j*.07)*(1-.8*slow):0);});
  // 겨누는 선
  const lineOn=bell(t,.25,.5,1.75,2.0);
  let d='M'+n1(tipX)+','+(SEA+3)+' L'+(W+20)+','+(SEA+4);
  q('.bw-line').setAttribute('d',d);q('.bw-lineglow').setAttribute('d',d);
  const pulse=t>1.25?.75+.25*Math.sin(t*22):1;
  q('.bw-line').setAttribute('opacity',n3(.85*lineOn*pulse));q('.bw-lineglow').setAttribute('opacity',n3(.6*lineOn*pulse));
  const ug=q('.bw-uglow');ug.setAttribute('cx',n1(tipX+80));ug.setAttribute('cy',n1(SEA+44));ug.setAttribute('opacity',n3(lineOn));
  const hp=q('.bw-hump');hp.setAttribute('cx',n1(tipX+20));hp.setAttribute('cy',n1(SEA+2));hp.setAttribute('opacity',n3(.55*lineOn));
  s3Rift(el,tipX,lineOn,tau-2.12,X0+40);
  // 배: 급회전으로 왼쪽으로 빠짐
  const sw=inOut(seg(t,1.6,2.1)),B=bob(tr);
  const tc=3.15,s=t-tc,j=jolt(s,1,8),heave=s>0?-12*Math.exp(-s*2)*Math.sin(s*5):0;
  const back=inOut(seg(t,4.4,6.6));
  const bx=X0-230*sw+60*back,roll=B.r-16*bell(t,1.6,1.78,2.05,2.6)+5*bell(t,2.05,2.3,2.6,3.0)+j*10;
  const tw=boatPose(el,bx-j*5,SEA+B.y+heave,roll,[37,-30]);
  lamp(el,tr,tw,t>1.25&&t<2.1?.12:0);
  // 수면을 뚫는 순간의 물보라 (장면 시간)
  if(!this._bp)this._bp=dropParams(50,51,-160,-20,140,430);
  paintDrops(qa('.bw-burst circle'),this._bp,P[0]+40,SEA,(tau-2.12)*1.0,70,520);
  // 늦게 솟는 물기둥과 비
  const cs=qa('.bw-cols .bw-col');
  paintCol(cs[0],X0+30,t-tc,280,46,-12,.5,2.0);
  paintCol(cs[1],X0-20,t-tc-.12,170,26,-24,.45,1.6);
  paintCol(cs[2],X0+90,t-tc-.2,150,24,14,.45,1.5);
  if(!this._rp){const r=seeded(61);this._rp=Array.from({length:44},()=>({x:X0-90+r()*240,y:SEA-150-r()*130,d:.5+r()*1.2,vx:(r()-.5)*40}));}
  qa('.bw-rain circle').forEach(c=>{const p=this._rp[+c.dataset.i],a=s-p.d;
   if(a<=0){c.setAttribute('opacity','0');return;}
   const y=p.y+280*a*a+30*a;c.setAttribute('cx',n1(p.x+p.vx*a));c.setAttribute('cy',n1(y));c.setAttribute('opacity',y>SEA?'0':'.6');});
  paintRings(qa('.bw-rings ellipse'),X0+30,s-.3,300,.55);
  veil(el,tr<.6?1-tr/.6:.3*(t<.6?1-t/.6:seg(t,6.9,7.5)));   // 반복 경계는 검게 끊지 않고 살짝만 어두워짐
  caption(el,this.caps,t);
 }
};

/* =========================================================
   ⑤ 최후의 교차 — 아무것도 없는 허공에 먼저 던진 작살, 솟구친 고래가 그 지점을 지나감. 한 번 재생 후 멈춤
   ========================================================= */
// ⑤ 갈라짐: 작살잡이가 겨누는 "물길의 끝"까지 수면에 먼저 금이 가고(오른쪽 먼 수면 → 교차점 아래),
//   물속에서 돌진하는 고래가 지나간 자리부터 양쪽 물벽이 열림. 고래가 물 밖으로 날아오른 구간은 덜 열림.
//   (ptt = 고래 자세 시각, 1.75에 교차점 · 고래 x는 시각에 비례)
function s4Rift(el,ptt,t){
 const N=30,path=[],sx=[];
 for(let i=0;i<=N;i++){const u=i/N,x=1010-450*u,z=1.0-.12*u;sx.push(x);path.push([gX(x,z),z]);}
 const post=ptt-1.75,front=lerp(1010,600,outC(seg(ptt,.25,1.15)));
 const sA=sx.map(x=>ptt-(1.75+(600-x)/700));
 const air=sx.map(x=>x<866?.45:1);
 const rise=sA.map((s,i)=>outC(seg(s,.06,.45))*air[i]);
 const fall=1-inOut(seg(post,.3,1.6));
 const o=sx.map((x,i)=>Math.max(.42*clamp((x-front)/40),sA[i]>0?outC(clamp(sA[i]/.16)):0)*fall);
 paintRift(el,'bw-rift4',{path,o,D:56,t,flow:0,glow:1,seed:8,
  w:i=>16+34*rise[i],
  H:i=>{const k=rise[i]*hVar(sx[i],3.3);return [16+80*k,5+30*k];}});
}
// ⑤ 해도의 궤적: 1~4단계에서 읽어 낸 곧은 선들이 교차점(허공의 한 점)에서 겹친다
const TRAIL_ANG=[-6,17,35,-25],CHART_P=[500,212];
function chartMarkup(){
 let s='<g class="bw-chart" fill="none" stroke-linecap="round" opacity="0">';
 TRAIL_ANG.forEach((a,i)=>{const c=Math.cos(a*RAD),d=Math.sin(a*RAD),P=CHART_P,A=[P[0]-c*900,P[1]-d*900],B=[P[0]+c*900,P[1]+d*900],dd='M'+n1(A[0])+','+n1(A[1])+' L'+n1(B[0])+','+n1(B[1]);
  s+='<g class="bw-tl" data-i="'+i+'"><path d="'+dd+'" stroke="#5fc8f5" stroke-width="5" filter="url(#bwSoft)" opacity=".35"/><path class="bw-tlc" d="'+dd+'" stroke="#d8f3ff" stroke-width="1.1" stroke-dasharray="16 9"/></g>';});
 return s+'<circle class="bw-tx" cx="'+CHART_P[0]+'" cy="'+CHART_P[1]+'" r="5" fill="#e8f8ff" opacity="0"/></g>';
}
function paintChart(el,t,n,out){
 const {q,qa}=cacheQ(el);
 const g=q('.bw-chart');if(!g)return;
 g.setAttribute('opacity',n3(seg(t,.1,.7)*(1-(out||0))));
 const blind=n<3;
 qa('.bw-tl').forEach(l=>{const i=+l.dataset.i,have=i<n;
  // 궤적이 모자라면 선들이 한 점에 모이지 않고 어긋난 채 흔들림
  if(blind){const a=TRAIL_ANG[i]*RAD,o=(i%2?-1:1)*(70+30*i)+6*Math.sin(t*1.7+i);l.setAttribute('transform','translate('+n1(-Math.sin(a)*o)+' '+n1(Math.cos(a)*o)+') rotate('+n1(3*Math.sin(t*.9+i*2))+' '+CHART_P[0]+' '+CHART_P[1]+')');}
  else if(l.hasAttribute('transform'))l.removeAttribute('transform');
  l.setAttribute('opacity',n3(have?seg(t,.15+i*.18,.55+i*.18):.1));
  const c=l._c||(l._c=l.querySelector('.bw-tlc'));c.setAttribute('stroke-dasharray',have?'16 9':'3 16');c.style.strokeDashoffset=n1(-t*30);});
 const x=q('.bw-tx');if(x)x.setAttribute('opacity',n>=3?n3(seg(t,1,1.4)*(.6+.4*Math.sin(t*5))):'0');
}
/* ⑤ 최후의 교차 — 정면충돌.
   모든 것을 꿰뚫는 주둥이와, 망을 감아 거의 모든 것을 꿰뚫게 된 작살이 해도의 선이 겹치는 한 점에서 끝과 끝으로 맞부딪힌다.
   꿰뚫는 것 대 꿰뚫는 것(개념 충돌): 버티는 쪽이 이긴다. 휘지 않는 주둥이가 휘고, 꺾이고, 부러진 자리로 작살이 그대로 들어가 눈을 꿰뚫는다. */
const CP=[500,212],CS=.72,TIPS=[-60,-4],PIV=[150,-6];
const CV=[-640,150],CG=900;
const EMERGE=(-CV[1]-Math.sqrt(CV[1]*CV[1]+2*CG*(SEA-CP[1])))/CG;   // 수면을 뚫고 나오는 시각(맞닿기 전, 음수)                          // 맞닿는 순간 주둥이 끝의 속도와 낙하 가속
const CT={TB:1.9,throwAt:1.45,hold:1.7,dur:10.4};CT.TS=CT.TB+CT.hold;
const HULL=[252,SEA-12];
// 다가오는 동안 주둥이 끝의 자리와 몸의 각도 (d = 맞닿는 순간까지 남은 시간, 음수)
function tipAt(d){return [CP[0]+CV[0]*d,CP[1]+CV[1]*d+.5*CG*d*d];}
function degAt(d){const vx=CV[0],vy=CV[1]+CG*d;return Math.atan2(-vy,-vx)/RAD;}
const CDEG=degAt(0);
const tfTip=(x,y,deg)=>mt(x,y,deg,CS,CS,TIPS[0],TIPS[1]);
const atTip=(x,y,deg,p)=>apply(x,y,deg,CS,CS,TIPS[0],TIPS[1],p[0],p[1]);
function clashDefs(){return '<defs><clipPath id="bwNoBill" clipPathUnits="userSpaceOnUse"><rect x="'+PIV[0]+'" y="-520" width="1400" height="1040"/></clipPath>'+
 '<clipPath id="bwBillOnly" clipPathUnits="userSpaceOnUse"><path d="M-90,-40 L'+PIV[0]+',-40 L'+(PIV[0]+4)+',-14 L'+(PIV[0]-3)+',-4 L'+(PIV[0]+5)+',8 L'+PIV[0]+',40 L-90,40 Z"/></clipPath>'+
 '<radialGradient id="bwClashB"><stop stop-color="#f2fcff"/><stop offset=".25" stop-color="#8fe2ff" stop-opacity=".75"/><stop offset=".6" stop-color="#3aaef0" stop-opacity=".25"/><stop offset="1" stop-color="#1f7fd0" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bwClashW"><stop stop-color="#fffaf0"/><stop offset=".25" stop-color="#ffe4b0" stop-opacity=".8"/><stop offset=".6" stop-color="#f2bf72" stop-opacity=".28"/><stop offset="1" stop-color="#e0a050" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bwClashR"><stop offset=".55" stop-color="#cfefff" stop-opacity="0"/><stop offset=".8" stop-color="#e9f8ff" stop-opacity=".55"/><stop offset="1" stop-color="#bfe8ff" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="bwShard" x1="0" x2="1"><stop stop-color="#3e4a50"/><stop offset=".5" stop-color="#b9c6cb"/><stop offset="1" stop-color="#55636a"/></linearGradient></defs>';}
function clashMarkup(){
 let s='<g class="bw-clash" opacity="0">'+
  '<ellipse class="bw-clW" rx="1" ry="1" fill="url(#bwClashW)"/><ellipse class="bw-clB" rx="1" ry="1" fill="url(#bwClashB)"/>';
 for(let i=0;i<3;i++)s+='<ellipse class="bw-clR" data-i="'+i+'" rx="1" ry="1" fill="url(#bwClashR)" opacity="0"/>';
 s+='<circle class="bw-clC" r="5" fill="#ffffff"/></g>';
 return s+drops('bw-clSB',26,91,'#bfeaff')+drops('bw-clSW',26,93,'#ffe2ad')+drops('bw-clSB2',26,95,'#e9f9ff')+drops('bw-clSW2',26,97,'#fff0cf')+
  '<circle class="bw-crack" r="1" fill="url(#bwClashB)" opacity="0"/>';
}
function shardMarkup(){let s='<g class="bw-shards" opacity="0">';[[0,30],[1,22],[2,40],[3,14]].forEach(([i,l])=>{s+='<path data-i="'+i+'" d="M0,-2.2 L'+l+',-1.6 L'+(l+4)+',0 L'+l+',1.6 L0,2.2 L3,0 Z" fill="url(#bwShard)"/>';});return s+'</g>';}
// 맞부딪힌 자리의 빛: b = 밀고 당기는 균형(-1 고래 · +1 작살), s = 맞닿은 뒤 흐른 시간
function paintClash(el,c,b,s,on,t,hd){
 const {q,qa}=cacheQ(el),g=q('.bw-clash');
 if(!on){g.setAttribute('opacity','0');['.bw-clSB','.bw-clSW','.bw-clSB2','.bw-clSW2'].forEach(k=>qa(k+' circle').forEach(e=>e.setAttribute('opacity','0')));return;}
 g.setAttribute('opacity',n3(on));
 const ang=Math.atan2(hd[1],hd[0])/RAD,pulse=1+.12*Math.sin(t*23)+.08*Math.sin(t*37);
 const wk=.5+.5*b,bk=.5-.5*b;                       // 이기는 쪽 빛이 커져 상대 쪽으로 번짐
 const W0=q('.bw-clW'),B0=q('.bw-clB');
 W0.setAttribute('cx',n1(c[0]-hd[0]*(14-22*wk)));W0.setAttribute('cy',n1(c[1]-hd[1]*(14-22*wk)));W0.setAttribute('rx',n1((30+70*wk)*pulse));W0.setAttribute('ry',n1((22+46*wk)*pulse));W0.setAttribute('transform','rotate('+n1(ang)+' '+n1(c[0])+' '+n1(c[1])+')');
 B0.setAttribute('cx',n1(c[0]+hd[0]*(14-22*bk)));B0.setAttribute('cy',n1(c[1]+hd[1]*(14-22*bk)));B0.setAttribute('rx',n1((30+70*bk)*pulse));B0.setAttribute('ry',n1((22+46*bk)*pulse));B0.setAttribute('transform','rotate('+n1(ang)+' '+n1(c[0])+' '+n1(c[1])+')');
 const C0=q('.bw-clC');C0.setAttribute('cx',n1(c[0]));C0.setAttribute('cy',n1(c[1]));C0.setAttribute('r',n1(4+3*Math.sin(t*41)+3*Math.abs(b)));
 // 맞닿은 면에서 퍼지는 충격 고리(진행 방향에 수직인 납작한 고리)
 qa('.bw-clR').forEach(e=>{const i=+e.dataset.i,k=((s*1.6+i/3)%1),r=20+150*k;e.setAttribute('cx',n1(c[0]));e.setAttribute('cy',n1(c[1]));e.setAttribute('rx',n1(r*.28));e.setAttribute('ry',n1(r));
  e.setAttribute('transform','rotate('+n1(ang)+' '+n1(c[0])+' '+n1(c[1])+')');e.setAttribute('opacity',n3(s>0?(1-k)*.85:0));});
 // 불꽃: 양쪽으로 갈라져 튐(두 벌을 번갈아 흘려 끊이지 않게)
 const nx=-hd[1],ny=hd[0];
 if(!paintClash._p){paintClash._p=[dropParams(26,101,-200,20,160,520),dropParams(26,103,160,380,160,520)];}
 const P=paintClash._p,cyc=.9;
 [['.bw-clSB',0,0],['.bw-clSB2',0,.45],['.bw-clSW',1,0],['.bw-clSW2',1,.45]].forEach(([k,pi,off])=>{
  const age=((s+off)%cyc),side=pi?-1:1;
  paintDrops(qa(k+' circle'),P[pi],c[0]+side*hd[0]*6+nx*3,c[1]+side*hd[1]*6+ny*3,s>0?age:-1,10,260);});
}
function shardsPaint(el,c,s,hd){
 const {q,qa}=cacheQ(el),g=q('.bw-shards');
 if(s<0||s>1.6){g.setAttribute('opacity','0');return;}
 g.setAttribute('opacity',n3(1-seg(s,1.1,1.6)));
 const base=Math.atan2(hd[1],hd[0])/RAD;
 qa('.bw-shards path').forEach(p=>{const i=+p.dataset.i,a=(base+180+[-40,25,-75,60][i])*RAD,v=[260,320,200,380][i];
  const x=c[0]+Math.cos(a)*v*s,y=c[1]+Math.sin(a)*v*s+520*s*s;
  p.setAttribute('transform','translate('+n1(x)+' '+n1(y)+') rotate('+n1(base+[1,-1,1,-1][i]*s*[700,900,520,1100][i])+')');p.style.opacity=y>SEA+4?'0':'1';});
}
const S4={title:'최후의 교차',dur:CT.dur,
 caps:[[0,'해도의 선들이 겹치는 곳, 아무것도 없는 허공을 겨눕니다.'],[1.2,'망을 감은 작살이 먼저 날아갑니다.'],[CT.TB,'꿰뚫는 것과 꿰뚫는 것이 끝과 끝으로 맞부딪힙니다.'],[CT.TB+.9,'버팁니다. 휘지 않는 것이 휘어 갑니다.'],[CT.TS,'주둥이가 꺾여 부러지고, 작살이 그 자리로 들어갑니다.'],[CT.TS+2.2,'푸른 빛이 꺼져 갑니다. 떠오르는 것은 부러진 주둥이와 지느러미 조각뿐입니다.']],
 build(){
  return clashDefs()+'<g class="bw-root">'+sky()+
   '<g clip-path="url(#bwBelow)"><use class="bw-under" href="'+M+'" opacity="0"/></g>'+
   '<use class="bw-carc" href="'+M+'" clip-path="url(#bwNoBill)" opacity="0"/>'+
   sea()+
   whaleRef('bw-ref')+whaleRef('bw-cref')+foam('bw-foam4',34)+
   '<g clip-path="url(#bwBelow)"><ellipse class="bw-uglow" rx="170" ry="26" fill="url(#bwUnder)" opacity="0"/></g>'+
   boatMarkup()+
   riftMarkup('bw-rift4','back')+riftMarkup('bw-rift4','front')+
   drops('bw-brch',40,87)+
   '<g clip-path="url(#bwAbove)">'+ghosts(3)+'<use class="bw-front" href="'+M+'" opacity="0"/>'+
    '<use class="bw-bill" href="'+M+'" clip-path="url(#bwBillOnly)" opacity="0"/>'+
    '<path class="bw-trail" fill="none" stroke="#e3ecea" stroke-width="2" stroke-linecap="round" filter="url(#bwRimF)" opacity="0"/>'+
    '<path class="bw-rope" fill="none" stroke="#8a9697" stroke-opacity=".75" stroke-width="1.5" opacity="0"/>'+
    '<g class="bw-harpoon" opacity="0">'+HARPOON+'</g>'+shardMarkup()+'</g>'+
   chartMarkup()+
   '<g fill="none"><circle class="bwg-tc" r="24" stroke="#e8f3f6" stroke-width="1.6" stroke-dasharray="5 4" opacity="0"/><circle class="bwg-cc" r="24" stroke="#cfeefd" stroke-width="2" opacity="0"/></g>'+
   clashMarkup()+
   '<circle class="bw-flash" r="70" fill="url(#bwFlash)" opacity="0"/>'+(window.HarpoonLauncher?window.HarpoonLauncher.hitMarkup():'')+
   drops('bw-hitw',70,77)+
   drops('bw-blood',22,72,'#1b0c16')+
   columns('bw-cols',5)+
   drops('bw-splash',60,73)+
   rings(3)+
   nearMist()+'</g>';
 },
 /* g가 있으면 미니게임 시각을 따름:
    g.th 맞닿는 시각 · g.thrownAt · g.timed(고리에 맞춰 던짐) · g.shatter(망 0개: 맞닿자마자 작살이 부서짐)
    g.clash{start,b} 밀어붙이는 중 · g.loseAt(밀려서 작살이 부서짐) · g.blind(궤적 부족) · g.autoMiss */
 paint(el,t,tr,g){
  const {q,qa}=cacheQ(el);
  ambient(el,tr,0);
  const game=!!g,blind=game&&!!g.blind;
  const TB=game?g.th:CT.TB,T0=game?g.thrownAt:CT.throwAt,thrown=T0!=null&&t>=T0;
  const timed=game?!!g.timed&&!blind:true;
  const shatterAt=game?(g.shatter?TB:g.loseAt!=null?g.loseAt:null):null;
  const TS=game?null:CT.TS;                              // 게임에서는 꺾이는 순간부터 시네마틱으로 넘어감
  const holding=timed&&t>=TB&&(shatterAt==null||t<shatterAt)&&(TS==null||t<TS);
  const clashB=game?(g.clash?g.clash.b:0):(()=>{const s=t-TB;return lerp(-.22*Math.sin(Math.min(1,s/.7)*Math.PI),1,inC(seg(s,.45,CT.hold)))+.05*Math.sin(s*17);})();
  const HL=window.HarpoonLauncher,own=!!(HL&&HL.owned()),PC=HL?HL.pierce():{deep:0,pass:false,n:0};
  // ---- 배 · 작살잡이
  const B=bob(tr),aim=clamp(t/.8),armEnd=own?HL.ARM:thrown?[38,-24]:[37-aim*12,-30-aim*4];
  // 고래가 배로 들이닥치는 경우(빗나감 · 작살이 부서짐)
  const pierceFrom=!blind&&game?(shatterAt!=null?shatterAt:thrown&&!timed?TB:g.autoMiss?TB:null):null;
  const ib=pierceFrom!=null?pierceFrom+.5:null;
  let tw;
  if(ib!=null&&t>=ib)tw=brokenBoat(el,t,ib,210,g.fatal);
  else{const sTS=TS!=null?t-TS:-1,j=sTS>0?jolt(sTS-.1,1,8):0;
   tw=boatPose(el,210-j*4,SEA+B.y,B.r+j*8-(thrown?Math.exp(-(t-T0)*3)*Math.sin((t-T0)*9)*4:0)+(holding?Math.sin(t*31)*.6:0),armEnd);lamp(el,tr,tw,!thrown?.12:holding?.25:0);}
  const hand=own?HL.handFor(HL.launch(el,tw,{loaded:!thrown}),30,-14):tw(armEnd),p0=[hand[0]+30,hand[1]-14],LIFT=10;
  const hdx=CP[0]-p0[0],hdy=CP[1]-p0[1]+4*LIFT,hl=Math.hypot(hdx,hdy),hd=[hdx/hl,hdy/hl];   // 작살이 닿을 때의 진행 방향
  const endAng=Math.atan2(hd[1],hd[0])/RAD;
  // ---- 맞닿은 자리(균형에 따라 밀림)
  const shift=holding?clashB*20+Math.sin(t*29)*1.5:0,contact=[CP[0]+hd[0]*shift,CP[1]+hd[1]*shift];
  // ---- 고래(주둥이 끝 기준)
  let tip,deg,vis=1,bend=0,billOff=null,cut=false,under=false;
  const sSnap=TS!=null?t-TS:-1;
  let eyeFall=null;
  if(t<TB||(!timed&&!holding&&pierceFrom==null)){        // 다가옴(또는 궤적이 모자라 그대로 지나감)
   const d=t-TB;tip=tipAt(d);deg=lerp(degAt(d),endAng,timed?inOut(seg(d,-.35,0)):0);
  }else if(holding){                                     // 맞물려 버팀: 떨림 · 주둥이가 휨
   tip=contact;deg=endAng+Math.sin(t*27)*.5;bend=-Math.max(0,clashB)*13+Math.sin(t*33)*(1+2*Math.max(0,clashB));cut=true;
  }else if(pierceFrom!=null){                            // 배로 들이닥침
   const s=t-pierceFrom,u=outC(seg(s,0,.5));
   tip=[lerp(CP[0],HULL[0],u),lerp(CP[1],HULL[1],u)];deg=Math.atan2(CP[1]-HULL[1],CP[0]-HULL[0])/RAD;
   if(s>.5){const k=seg(s,.5,1.6);tip=[HULL[0]-60*k,HULL[1]+150*inC(k)];deg=Math.atan2(CP[1]-HULL[1],CP[0]-HULL[0])/RAD-26*k;}
   vis=1-seg(s,1.2,1.8);
  }else if(sSnap>=0){                                    // 꺾인 뒤: 눈에 작살이 꽂힌 채 떨어짐
   cut=true;
   const eye0=atTip(contact[0],contact[1],endAng,EYE),fs=sSnap;
   const ex=eye0[0]-110*fs,ey0=eye0[1]-50*fs+520*fs*fs;
   const se=(50+Math.sqrt(2500+4*520*(SEA-eye0[1])))/(2*520);
   let ey=ey0;if(fs>se){const q2=fs-se;ey=SEA+160*(1-Math.exp(-q2*3));}
   deg=lerp(endAng,-36,inOut(seg(fs,0,.7)))+(fs<.25?4*Math.sin(fs*55)*(1-fs/.25):0);
   eyeFall={eye:[ex,ey],eye0,se};
   // 눈 자리를 기준으로 다시 놓음
   const tmp=apply(0,0,deg,CS,CS,EYE[0],EYE[1],TIPS[0],TIPS[1]);tip=[eyeFall.eye[0]+tmp[0],eyeFall.eye[1]+tmp[1]];
   vis=fs>se+.9?1-seg(fs,se+.9,se+1.5):1;
  }else{const d=t-TB;tip=tipAt(d);deg=degAt(d);}
  const tf=tfTip(tip[0],tip[1],deg);
  setUse(q('.bw-under'),tf,vis);setUse(q('.bw-front'),tf,vis);setRef(q('.bw-ref'),tf,vis*.16);
  const cp=cut?'url(#bwNoBill)':null;['.bw-front','.bw-under'].forEach(k=>{const n=q(k);if(cp)n.setAttribute('clip-path',cp);else n.removeAttribute('clip-path');});
  const glow=sSnap>0?lerp(1,.35,seg(sSnap,0,.8)):holding?1.2:1;
  q('.bw-front').style.setProperty('--bwglow',n3(glow*.6));q('.bw-under').style.setProperty('--bwglow',n3(glow));
  // 주둥이: 버티는 동안 뿌리에서 휨 → 꺾여 부러진 조각이 튕겨 나감
  const bill=q('.bw-bill');
  if(holding){bill.setAttribute('transform',tf+' rotate('+n1(bend)+' '+PIV[0]+' '+PIV[1]+')');bill.style.opacity='1';bill.style.setProperty('--bwglow',n3(1.2));}
  else if(sSnap>=0){const fs=sSnap,bt=tfTip(contact[0],contact[1],endAng);
   bill.setAttribute('transform','translate('+n1(-150*fs)+' '+n1(-300*fs+620*fs*fs)+') '+bt+' rotate('+n1(-13-fs*620)+' '+PIV[0]+' '+PIV[1]+')');
   const by=contact[1]-300*fs+620*fs*fs;bill.style.opacity=n3(by>SEA+20?0:1-seg(fs,1.4,1.9));bill.style.setProperty('--bwglow',n3(1-seg(fs,0,1.2)));}
  else bill.style.opacity='0';
  // 금 가는 빛(주둥이 뿌리)
  const ck=q('.bw-crack');
  if(holding&&clashB>.25){const pv=atTip(tip[0],tip[1],deg,PIV);ck.setAttribute('cx',n1(pv[0]));ck.setAttribute('cy',n1(pv[1]));ck.setAttribute('r',n1(10+26*clashB+4*Math.sin(t*40)));ck.setAttribute('opacity',n3(.4+.5*clashB));}
  else if(sSnap>=0&&sSnap<.6){const pv=atTip(contact[0],contact[1],endAng,PIV);ck.setAttribute('cx',n1(pv[0]));ck.setAttribute('cy',n1(pv[1]));ck.setAttribute('r',n1(36+120*sSnap));ck.setAttribute('opacity',n3(1-sSnap/.6));}
  else ck.setAttribute('opacity','0');
  // 잔상(빠르게 날 때)
  const fast=t>TB-.75&&t<TB&&vis>0;
  qa('.bw-ghost').forEach(gh=>{const k=+gh.dataset.k,d=t-TB-k*.035;const tp=tipAt(d);setUse(gh,tfTip(tp[0],tp[1],degAt(d)),fast?(.26-k*.07):0);});
  // 솟구침 물보라 · 물속 빛 · 물길
  if(!S4._br)S4._br=dropParams(40,89,-150,-40,160,520);
  const emerge=TB+EMERGE;paintDrops(qa('.bw-brch circle'),S4._br,tipAt(EMERGE)[0]+40,SEA-4,t-emerge,70,520);
  const ug=q('.bw-uglow');ug.setAttribute('cx',n1(lerp(1150,tipAt(EMERGE)[0]+60,seg(t,.2,emerge))));ug.setAttribute('cy',n1(SEA+46));ug.setAttribute('opacity',n3(t<emerge+.2?seg(t,.2,.8):0));
  s4Rift(el,0,t);
  {const n=game?(g.trails!=null?g.trails:4):(()=>{const hg=window.BlueHuntGame;return hg&&hg.trails!=null?hg.trails:4;})();paintChart(el,t,n,seg(t,TB,TB+.7));}
  // ---- 작살
  const hp=q('.bw-harpoon');let pos,ang,show=1;
  if(!thrown){const a=-28-aim*16;pos=[hand[0]+Math.cos(a*RAD)*40,hand[1]+Math.sin(a*RAD)*40];ang=a;show=own?0:clamp((t-.2)/.4)*(ib!=null&&t>=ib?0:1);}
  else if(t<TB||!timed){                                  // 날아감(빗나가면 지나쳐 떨어짐)
   const fl=TB-T0,u=(t-T0)/Math.max(.2,fl);
   if(u<=1||timed){const e=Math.min(1,u);pos=[p0[0]+(CP[0]-p0[0])*e,p0[1]+(CP[1]-p0[1])*e-4*LIFT*e*(1-e)];ang=Math.atan2((CP[1]-p0[1])-4*LIFT*(1-2*e),CP[0]-p0[0])/RAD;
    pos=[pos[0]-hd[0]*6,pos[1]-hd[1]*6];}
   else{const s2=t-TB,vx=hd[0]*hl/fl,vy=hd[1]*hl/fl;pos=[CP[0]+vx*s2*.8,CP[1]+vy*s2*.8+500*s2*s2];ang=Math.atan2(vy*.8+1000*s2,vx*.8)/RAD;if(pos[1]>SEA+10)show=0;}
  }else if(holding){pos=[contact[0]-hd[0]*6+Math.sin(t*35)*.8,contact[1]-hd[1]*6];ang=endAng+Math.sin(t*29)*.6;}
  else if(shatterAt!=null&&t>=shatterAt){pos=[contact[0],contact[1]];ang=endAng;show=0;}
  else if(sSnap>=0){
   const fs=sSnap,eye0=eyeFall.eye0;
   if(PC.pass){const pa=HL.passAngle(endAng),ea=pa*RAD,dd=fs*HL.PASS_SPEED;ang=pa;pos=[contact[0]+Math.cos(ea)*dd,contact[1]+Math.sin(ea)*dd];show=pos[0]<W+260&&pos[1]<H+260?1:0;}
   else if(fs<.12){const k=outC(fs/.12);pos=[lerp(contact[0],eye0[0],k)-hd[0]*10,lerp(contact[1],eye0[1],k)-hd[1]*10];ang=endAng;}
   else{const rel=0;ang=deg+rel;const e=eyeFall.eye;pos=[e[0]-10*Math.cos(ang*RAD)+PC.deep*Math.cos(ang*RAD),e[1]-10*Math.sin(ang*RAD)+PC.deep*Math.sin(ang*RAD)];show=vis>0?1:0;}
  }else{pos=[contact[0],contact[1]];ang=endAng;show=0;}
  hp.setAttribute('opacity',String(show));
  hp.setAttribute('transform','translate('+n1(pos[0])+' '+n1(pos[1])+') rotate('+n1(ang)+')');
  const lodged=sSnap>=.12&&!PC.pass;
  q('.bw-tip').style.opacity=lodged?'0':'1';
  if(HL){HL.bury(hp,lodged&&PC.deep?10-PC.deep:null);
   HL.paintHit(el,{s:sSnap>=0?sSnap-.1:-1,p:eyeFall?eyeFall.eye0:CP,ang:PC.pass?HL.passAngle(endAng):endAng,tier:PC.n,through:150,fade:.8});}
  shardsPaint(el,contact,shatterAt!=null?t-shatterAt:-1,hd);
  const ar=ang*RAD,tail=[pos[0]-104*Math.cos(ar),pos[1]-104*Math.sin(ar)];
  const trl=q('.bw-trail');
  if(thrown&&t<TB&&show){const bk=[pos[0]-170*Math.cos(ar),pos[1]-170*Math.sin(ar)];trl.setAttribute('d','M'+n1(bk[0])+','+n1(bk[1])+' L'+n1(tail[0])+','+n1(tail[1]));trl.setAttribute('opacity','.45');}
  else trl.setAttribute('opacity','0');
  const anchor=tw(own?HL.anchorLocal():[40,-9]),slack=!thrown?14:holding?2+Math.sin(t*20)*1.5:t<TB?40:sSnap>=0?Math.max(4,30*Math.exp(-sSnap*1.5))+Math.sin(tr*2.4)*3:46;
  const mid=[(tail[0]+anchor[0])/2,(tail[1]+anchor[1])/2+slack];
  const rope=q('.bw-rope');rope.setAttribute('d','M'+n1(anchor[0])+','+n1(anchor[1])+' Q'+n1(mid[0])+','+n1(mid[1])+' '+n1(tail[0])+','+n1(tail[1]));
  rope.setAttribute('opacity',thrown&&(show||holding||sSnap>=0)?'.9':'0');
  // ---- 맞부딪힌 빛
  const sC=t-TB;
  paintClash(el,contact,holding?clashB:0,sC,holding?seg(sC,0,.08):0,t,hd);
  const fl=q('.bw-flash');const fAt=sSnap>=0?sSnap:shatterAt!=null&&t>=shatterAt?t-shatterAt:timed&&t>=TB?t-TB:-1;
  fl.setAttribute('cx',n1(contact[0]));fl.setAttribute('cy',n1(contact[1]));
  fl.setAttribute('opacity',fAt>=0?n3((sSnap>=0?1:.75)*Math.exp(-fAt*2.6)):'0');fl.setAttribute('r',n1(24+(sSnap>=0?120:46)*clamp(fAt*2)));
  if(!S4._hw)S4._hw=dropParams(70,79,-200,20,60,300);
  paintDrops(qa('.bw-hitw circle'),S4._hw,contact[0],contact[1],sSnap>=0?sSnap*1.2:-1,8,420);
  if(!S4._bl)S4._bl=dropParams(22,74,-200,20,90,300);
  paintDrops(qa('.bw-blood circle'),S4._bl,eyeFall?eyeFall.eye0[0]:0,eyeFall?eyeFall.eye0[1]:0,sSnap>=0?(sSnap-.12)*1.3:-1,10,500);
  const shk=holding?1.2+2.2*Math.abs(clashB):sSnap>=0&&sSnap<.7?(1-sSnap/.7)*5:shatterAt!=null&&t>=shatterAt&&t<shatterAt+.4?3:0;
  q('.bw-root').setAttribute('transform',shk?'translate('+n1(Math.sin(t*90)*shk)+' '+n1(Math.cos(t*77)*shk*.6)+')':'');
  // ---- 추락: 물보라 · 물기둥 · 물결 · 떠오른 사체
  const tc=eyeFall?TS+eyeFall.se:1e9,cx=eyeFall?eyeFall.eye0[0]-110*eyeFall.se:0,sc=t-tc;
  const cs=qa('.bw-cols .bw-col');
  [[0,0,200,44,-10],[1,-150,125,28,-22],[2,170,150,30,16],[3,-290,90,20,-14],[4,330,100,20,18]].forEach(([i,ox,h,w,ln],n)=>paintCol(cs[i],cx+ox,sc-n*.06,h,w,ln,.5,2.1));
  if(!S4._sp)S4._sp=dropParams(60,75,-170,-10,160,460);
  if(!S4._sp2)S4._sp2=dropParams(60,77,-170,-10,120,380);
  if(ib!=null)paintDrops(qa('.bw-splash circle'),S4._sp2,215,SEA-14,t-ib,60,520);
  else paintDrops(qa('.bw-splash circle'),S4._sp,cx,SEA-6,sc,320,460);
  paintRings(qa('.bw-rings ellipse'),cx,sc-.2,330,.6);
  const cu=q('.bw-carc');
  if(eyeFall){const u=outC(seg(t,tc+.9,tc+4.2)),C={x:cx+240+4*Math.sin(tr*.4),y:lerp(SEA+150,SEA+22,u)+2.5*Math.sin(tr*1.1),deg:9+1.2*Math.sin(tr*.7),s:.72};
   setUse(cu,mt(C.x,C.y,C.deg,C.s,-C.s,500,0),seg(t,tc+.8,tc+1.6));setRef(q('.bw-cref'),mt(C.x,C.y,C.deg,C.s,-C.s,500,0),.18*seg(t,tc+.8,tc+1.6));
   cu.style.setProperty('--bwglow',n3(.5*(1-seg(t,tc+1,tc+5))));}
  else{setUse(cu,'',0);setRef(q('.bw-cref'),'',0);}
  paintFoam(q('.bw-foam4'),sc>0?cx+(sc>2?240*seg(sc,2,4):0):900,sc>0?360:1,sc>0?Math.max(.35,1-sc/3):0,15);
  if(!game){veil(el,tr<.6?1-tr/.6:0);caption(el,this.caps,t);}
 }
};

/* =========================================================
   미니게임 표시 (blue-whale-gameplay-v021.js가 window.BlueHuntGame을 움직임)
   ========================================================= */
const GAMECAP={2:'고래가 꺾는 쪽으로 키를 돌리십시오.',3:'주둥이가 물살을 뚫고 솟는 순간에만 배를 트십시오.',4:'좁혀 오는 고리가 교차점에 겹치는 순간 망을 감은 작살을 던지십시오. 주둥이와 정면으로 부딪힙니다.'};
function hud(el){const {q}=cacheQ(el);return {hint:q('.bwg-hint'),verdict:q('.bwg-verdict'),pips:q('.bwg-pips'),arrow:q('.bwg-arrow'),glyph:q('.bwg-arrow b'),ring:q('.bwg-ring'),bar:q('.bwg-bar i')};}
function setTxt(n,t){if(n&&n.textContent!==t)n.textContent=t;}
function setVerdict(n,t,cls){if(!n)return;setTxt(n,t);const c='bwg-verdict'+(t?' on '+(cls||''):'');if(n.className!==c)n.className=c;}
function setPips(n,total,filled,cls){if(!n)return;const key=total+'/'+filled+'/'+cls;if(n.dataset.k===key)return;n.dataset.k=key;
 let h='';for(let i=0;i<total;i++)h+='<i class="'+(i<filled?cls:'')+'"></i>';n.innerHTML=h;}
const RING_C=2*Math.PI*26;
function hudChase(el,t,g){
 const u=hud(el);
 if(g.dir&&!g.done){u.arrow.classList.add('on');setTxt(u.glyph,g.dir==='L'?'←':'→');
  const p=clamp((t-g.promptAt)/(g.win||.9));u.ring.style.strokeDashoffset=n1(RING_C*p);u.arrow.classList.toggle('late',p>.65);}
 else u.arrow.classList.remove('on','late');
 u.bar.style.width=n1(100*(g.hits||0)/(g.need||12))+'%';
 setPips(u.pips,2,g.misses||0,'bad');
 const miss=g.lastMissAt!=null&&t-g.lastMissAt<.8&&!g.done;
 setVerdict(u.verdict,g.done==='ok'?'추적 성공':g.done==='fail'?'놓쳤다':miss?'놓침':'',g.done==='ok'?'good':'bad');
 setTxt(u.hint,t<1.2?'준비 · ← → 를 0.9초 안에':'← → · 화면 왼쪽 / 오른쪽 누르기');
 caption(el,[[0,GAMECAP[2]]],0);
}
function hudEvade(el,t,g){
 const u=hud(el);
 setPips(u.pips,3,g.ok||0,'good');
 const ph=g.phase;
 setVerdict(u.verdict,ph==='pierced'?(g.failWhy==='early'?'너무 빠름':'늦음'):ph==='dodge'&&t-g.pressAt<1?'회피':'',ph==='pierced'?'bad':'good');
 setTxt(u.hint,ph==='up'?'지금 · 스페이스 / 화면 누르기':ph==='pierced'?'':'기다리십시오 · 너무 일찍 틀면 꿰뚫립니다');
 u.hint.classList.toggle('now',ph==='up');
 caption(el,[[0,GAMECAP[3]]],0);
}
function hudFinal(el,t,g){
 const u=hud(el),{q}=cacheQ(el),bar=q('.bwg-bar');
 const blind=g.trails!=null&&g.trails<3;
 const clashing=!!(g.clash&&t>=g.th&&g.snapAt==null&&g.loseAt==null&&!g.done);
 const won=g.snapAt!=null&&t>=g.snapAt,lost=g.loseAt!=null&&t>=g.loseAt,shat=g.shatter&&t>=g.th;
 const fin=won||lost||shat||(g.done==='fail'&&t>=Math.max(g.th,g.thrownAt!=null?g.arriveAt:0));
 setVerdict(u.verdict,won?(t<g.snapAt+1.4?'꺾음':''):lost?'밀림':shat?'부서짐':fin?(blind?'잔상':'빗나감'):'',won?'good':'bad');
 setTxt(u.hint,clashing?'맞부딪혔습니다 · 연타해서 밀어붙이십시오 (스페이스 / 화면 / 버튼)':g.clash&&t<g.th?'':g.thrownAt!=null||g.autoMiss||g.done?'':blind?'겨눌 점이 없습니다 · 궤적이 모자랍니다':t<g.breachAt?'단 한 번 · 선들이 겹치는 허공을 보십시오':'지금 · 고리가 겹칠 때 스페이스 / 화면 누르기');
 u.hint.classList.toggle('now',clashing||(t>=g.breachAt&&g.thrownAt==null&&!g.autoMiss&&!g.done));
 if(bar){const on=!!g.clash&&t>=g.th&&!won;bar.classList.toggle('tug',on);if(on)u.bar.style.width=n1(50+50*clamp(g.clash.b,-1,1))+'%';}
 caption(el,[[0,blind?'선들이 한 점에 모이지 않습니다. 어디를 겨눠야 할지 알 수 없습니다.':clashing?'꿰뚫는 것과 꿰뚫는 것이 맞물렸습니다. 밀리면 작살이 부서집니다.':GAMECAP[4]]],0);
}
// 배가 꿰뚫려 부서지는 모습
function brokenBoat(el,t,ft,x,fatal){
 const k=seg(t,ft,ft+.3);
 if(!fatal){const rec=seg(t,ft+.6,ft+1.6);const tw0=boatPose(el,x,SEA-20*bell(t,ft,ft+.12,ft+.3,ft+.8),(16*outC(k)+6*Math.sin((t-ft)*20)*Math.exp(-(t-ft)*4))*(1-rec),[38,-24]);lamp(el,t,tw0,.2*Math.sin((t-ft)*40)*(1-rec));return tw0;}
 const y=SEA-26*bell(t,ft,ft+.12,ft+.3,ft+.8)+52*inC(seg(t,ft+.5,ft+2));
 const tw=boatPose(el,x,y,30*outC(k)+6*Math.sin((t-ft)*20)*Math.exp(-(t-ft)*4),[38,-24]);
 const {q}=cacheQ(el);q('.bw-lampglow').style.opacity=n3(.9*(1-seg(t,ft+.05,ft+.35)));q('.bw-lampglint').style.opacity=n3(.3*(1-seg(t,ft,ft+.3)));
 return tw;
}
/* ④ 회피 미니게임 */
function evadeGame(el,t,tr,g){
 const {q,qa}=cacheQ(el);
 ambient(el,tr,0);
 const S=.9,X0=470,ang=50,dx=-Math.cos(ang*RAD),dy=-Math.sin(ang*RAD),stopX=X0+56*1.9+50;
 const ph=g.phase,rt=g.round>=0?t-g.roundAt:-1;
 const at=k=>mt(X0+dx*k,SEA-40+dy*k,ang,S,S,-60,-4);
 let k=null,underTf=null,underOp=0,lineOn=0,tipX=1400,emergeAt=null;
 if(ph==='approach'||ph==='wait'){
  tipX=lerp(1320,stopX,outC(rt/.9))+(ph==='wait'?Math.sin(t*30)*1.5:0);
  underTf=mt(tipX,SEA+120,0,S,S,-60,-4);underOp=seg(rt,0,.4);lineOn=seg(rt,0,.25)*(ph==='wait'?.8+.2*Math.sin(t*20):1);
 }else if(ph==='up'){k=-20+150*(t-g.upAt);emergeAt=g.upAt;}
 else if(ph==='dodge'){const kp=-20+150*(g.pressAt-g.upAt);k=kp+2430*(t-g.pressAt);emergeAt=g.upAt;}
 else if(ph==='pierced'){
  const early=g.failWhy==='early',k0=early?-260:-20+150*.6;
  k=Math.min(k0+1700*(t-g.failAt),260+60*(t-g.failAt));emergeAt=early?g.failAt+.1:g.upAt;
 }
 if(k!=null&&k<1400){underTf=at(k);underOp=1;}
 setUse(q('.bw-under'),underTf||'',underTf?underOp:0);
 setUse(q('.bw-front'),k!=null&&k<1400?at(k):'',k!=null&&k<1400?1:0);
 setRef(q('.bw-ref'),k!=null&&k<1400?at(k):'',k!=null&&k<1400?.16:0);
 {const ea=emergeAt!=null?t-emergeAt:-1;paintCurtain(q('.bw-erupt'),X0-40,X0+150,x=>colH(ea,140*(1-Math.abs(x-X0-55)/150*.6),.35,1.6),4,tr,ea>0?1:0);
  paintFoam(q('.bw-foam3'),X0+43,ea>0?300:1,ea>0?Math.max(0,1-(ea-1.5)/2.5):0,13);}
 const fast=ph==='dodge'||(ph==='pierced'&&t-g.failAt<.25);
 qa('.bw-ghost').forEach(gh=>{const j=+gh.dataset.k;setUse(gh,k!=null?at(k-j*60):'',fast&&k!=null?(.28-j*.07):0);});
 // 겨누는 선
 const d='M'+n1(tipX)+','+(SEA+3)+' L'+(W+20)+','+(SEA+4);
 q('.bw-line').setAttribute('d',d);q('.bw-lineglow').setAttribute('d',d);
 q('.bw-line').setAttribute('opacity',n3(.85*lineOn));q('.bw-lineglow').setAttribute('opacity',n3(.6*lineOn));
 const ug=q('.bw-uglow');ug.setAttribute('cx',n1(tipX+80));ug.setAttribute('cy',n1(SEA+44));ug.setAttribute('opacity',n3(lineOn));
 const hp=q('.bw-hump');hp.setAttribute('cx',n1(tipX+20));hp.setAttribute('cy',n1(SEA+2));hp.setAttribute('opacity',n3(.55*lineOn));
 s3Rift(el,tipX,lineOn,emergeAt!=null?t-emergeAt:-1,X0+40);
 // 물살을 뚫는 물보라
 if(!evadeGame._bp)evadeGame._bp=dropParams(50,51,-160,-20,140,430);
 paintDrops(qa('.bw-burst circle'),evadeGame._bp,X0+40,SEA,emergeAt!=null?t-emergeAt:-1,70,520);
 // 배
 const B=bob(tr);
 if(ph==='pierced'){brokenBoat(el,t,g.failWhy==='early'?g.failAt+.25:g.failAt+.08,X0,g.fatal);}
 else{
  const pa=g.pressAt!=null&&ph==='dodge'?g.pressAt:null;
  const sw=pa!=null?inOut(seg(t,pa,pa+.3))*(1-inOut(seg(t,pa+1.0,pa+1.85))):0;
  const tc=pa!=null?pa+.85:null,s=tc!=null?t-tc:-1,j=jolt(s,1,8);
  const roll=B.r-16*(pa!=null?bell(t,pa,pa+.12,pa+.35,pa+.8):0)+j*9;
  const tw=boatPose(el,X0-230*sw-j*5,SEA+B.y,roll,[37,-30]);
  lamp(el,tr,tw,ph==='up'?.15:0);
 }
 // 늦게 솟는 물기둥 · 비 · 물결
 const base=ph==='dodge'?g.pressAt+.85:ph==='pierced'?g.failAt+.6:null,s=base!=null?t-base:-1;
 const cs=qa('.bw-cols .bw-col');
 paintCol(cs[0],X0+30,s,ph==='pierced'?200:260,44,-12,.5,2.0);
 paintCol(cs[1],X0-20,s-.12,150,26,-24,.45,1.6);
 paintCol(cs[2],X0+90,s-.2,130,24,14,.45,1.5);
 qa('.bw-rain circle').forEach(c=>c.setAttribute('opacity','0'));
 paintRings(qa('.bw-rings ellipse'),X0+30,s-.3,300,.55);
 veil(el,ph==='pierced'&&g.fatal?.9*seg(t,g.failAt+.6,g.failAt+2):t<.5?1-t/.5:0);
 hudEvade(el,t,g);
}
/* ⑤ 최후의 교차 미니게임: 고리 → 정면충돌(밀어붙이기) */
const FP=CP;
function finalGame(el,t,tr,g){
 const {q}=cacheQ(el);
 if(g.snapAt!=null&&t>=g.snapAt){
  ['.bwg-tc','.bwg-cc'].forEach(s=>q(s).setAttribute('opacity','0'));
  S4.paint(el,CT.TS+(t-g.snapAt),tr);veil(el,0);hudFinal(el,t,g);return;
 }
 S4.paint(el,t,tr,g);
 const blind=!!g.blind,T0=g.thrownAt;
 // 교차점과 좁혀 오는 고리
 const tc=q('.bwg-tc'),cc=q('.bwg-cc');
 const ringOn=T0==null&&!g.autoMiss&&!blind;
 tc.setAttribute('cx',FP[0]);tc.setAttribute('cy',FP[1]);cc.setAttribute('cx',FP[0]);cc.setAttribute('cy',FP[1]);
 tc.setAttribute('opacity',ringOn?n3((.45+.25*Math.sin(t*5))*seg(t,.3,.9)):'0');
 if(ringOn&&t>=g.breachAt){
  const r=24+150*(1-(t-g.breachAt)/(g.ti-g.breachAt));
  const near=Math.abs(t-g.ti)<=(g.win||.2);
  cc.setAttribute('r',n1(Math.max(2,r)));cc.setAttribute('opacity',r<4?'0':'.95');
  cc.setAttribute('stroke',near?'#ffcf9a':'#cfeefd');cc.setAttribute('stroke-width',near?'3':'2');
  tc.setAttribute('stroke',near?'#ffcf9a':'#e8f3f6');
 }else cc.setAttribute('opacity','0');
 const pf=blind?null:g.shatter?g.th:g.loseAt!=null?g.loseAt:(T0!=null&&!g.timed)||g.autoMiss?g.th:null;
 const ib=pf!=null?pf+.5:null;
 veil(el,ib!=null&&g.fatal?.9*seg(t,ib+.5,ib+2.1):t<.5?1-t/.5:0);
 hudFinal(el,t,g);
}

const SCENES=[S0,S1,S2,S3,S4];

function html(stage,opts){
 const i=Math.max(0,Math.min(4,Math.floor(+stage||0))),S=SCENES[i],game=!!(opts&&opts.game&&GAMECAP[i]);
 const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'+
  '<defs>'+commonDefs()+marlinDefs('bwm')+'</defs>'+
  S.build()+
  '<rect class="bw-veil" width="'+W+'" height="'+H+'" fill="#010306" opacity="1"/></svg>';
 return '<div class="pallid-cine-v2 bw3-scene'+(game?' bwg-on':'')+'" data-stage="'+i+'"'+(game?' data-game="1"':'')+' role="img" aria-label="'+esc(NAME+' · '+(i+1)+'단계 '+S.title)+'">'+svg+
  '<span class="cine-top" aria-hidden="true">'+esc(NAME+' · '+S.title)+'</span>'+
  '<span class="cine-bottom" aria-hidden="true">'+esc(game?GAMECAP[i]:S.caps[0][1])+'</span>'+
  (game?'<div class="bwg-hud" aria-hidden="true"><span class="bwg-hint"></span><span class="bwg-verdict"></span><span class="bwg-pips"></span>'+
   '<span class="bwg-arrow"><svg viewBox="0 0 60 60"><circle class="bwg-ring-bg" cx="30" cy="30" r="26"/><circle class="bwg-ring" cx="30" cy="30" r="26" stroke-dasharray="'+n1(RING_C)+'"/></svg><b></b></span>'+
   '<span class="bwg-bar"><i></i></span></div>':'')+
  '<span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}

/* ---------- 시간 ---------- */
const API=window.BlueWhaleV3={html,stages:SCENES.map(s=>s.title),replayToken:0};
let start=0,lastSeen=0,seenTok=-1,seenStage=-1,seenGame=false;
const GAMEPAINT={2:(el,t,tr)=>S2.paint(el,t,tr),3:evadeGame,4:finalGame};
const GAMEMODE={2:'chase',3:'evade',4:'final'};
function frame(now){
 const el=document.querySelector('.bw3-scene');
 if(el&&el.isConnected){
  const st=+el.dataset.stage,S=SCENES[st],g=window.BlueHuntGame;
  const isGame=!!(el.dataset.game&&g&&g.t0&&g.mode===GAMEMODE[st]);
  if(S&&isGame){
   const t=(now-g.t0)/1000;
   lastSeen=now;seenGame=true;seenStage=st;
   try{GAMEPAINT[st](el,t,t,g);}catch(e){if(!el._bwErr){el._bwErr=1;console.warn('푸른 고래 미니게임',e);}}
  }else if(S){
   if(now-lastSeen>900||API.replayToken!==seenTok||st!==seenStage||seenGame){start=now;seenTok=API.replayToken;seenStage=st;seenGame=false;}
   if(API.resume&&API.resume.stage===st&&!el.dataset.game){start=API.resume.start;API.resume=null;}
   if(el.closest('.is-paused'))start+=now-lastSeen;
   lastSeen=now;
   let tr=(now-start)/1000;
   if(el.dataset.seek!=null)tr=+el.dataset.seek;
   const t=S.loop?tr%S.loop:tr;
   try{S.paint(el,t,tr);}catch(e){if(!el._bwErr){el._bwErr=1;console.warn('푸른 고래 이펙트',e);}}
  }
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
