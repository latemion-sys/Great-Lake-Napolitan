/* 모든 것을 뚫는 푸른 고래 · v3 다섯 장면 (blue-whale-v3.js의 도구를 씀)
   window.BlueWhaleV3 = {html(stage), stages, replayToken} */
(function(){
'use strict';
const K=window.BlueWhaleV3Kit;
if(!K)return;
const {W,H,SEA,clamp,outC,inC,inOut,seg,bell,lerp,n1,n3,TAU,RAD,seeded,esc,warp,mt,apply,
 marlinDefs,commonDefs,sky,sea,nearMist,boatMarkup,columns,curtain,paintCurtain,drops,dropParams,paintDrops,cacheQ,ambient,boatPose,lamp,veil,caption,setUse,HARPOON,EYE}=K;
const M='#bwmM',G='#bwmG';
const NAME='모든 것을 뚫는 푸른 고래';
const unwarp=(tau,s0,s1,d)=>tau<s0?tau:tau<s0+d?s0+(tau-s0)*(s1-s0)/d:tau-d+(s1-s0);
function ghosts(n,extra){let s='<g filter="url(#bwStreak)" fill="#62c8f4"'+(extra||'')+'>';for(let k=1;k<=n;k++)s+='<use class="bw-ghost" data-k="'+k+'" href="'+G+'" opacity="0"/>';return s+'</g>';}
function rings(n){let s='<g class="bw-rings" fill="none" stroke="#dbe9ee">';for(let i=0;i<n;i++)s+='<ellipse data-i="'+i+'" rx="1" ry="1" opacity="0"/>';return s+'</g>';}
function paintRings(nodes,x,age,max,gap){
 nodes.forEach(r=>{const i=+r.dataset.i,a=age-i*(gap||.45),p=clamp(a/2.6);
  if(a<=0||p>=1){r.setAttribute('opacity','0');return;}
  r.setAttribute('cx',n1(x));r.setAttribute('cy',n1(SEA+5));r.setAttribute('rx',n1(30+p*(max||260)));r.setAttribute('ry',n1(3+p*13));
  r.setAttribute('stroke-width',n1(2.2-p*1.6));r.setAttribute('opacity',n3((1-p)*.5));});
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
function speedLines(n,seed,y0,y1){
 const r=seeded(seed);let s='<g class="bw-speed" stroke="#cfeefd" stroke-linecap="round" opacity="0">';
 for(let i=0;i<n;i++){const y=y0+r()*(y1-y0),x=r()*W,l=60+r()*160;s+='<path data-x="'+n1(x)+'" data-l="'+n1(l)+'" d="M'+n1(x)+','+n1(y)+' h'+n1(l)+'" stroke-width="'+n1(.6+r()*1.2)+'" stroke-opacity="'+n3(.12+r()*.25)+'"/>';}
 return s+'</g>';
}
function paintSpeed(el,tr,op,dir){
 const {q,qa}=cacheQ(el),g=q('.bw-speed');g.setAttribute('opacity',n3(op));
 if(op<=0)return;
 qa('.bw-speed path').forEach(p=>{const x0=+p.dataset.x,l=+p.dataset.l,x=((x0+dir*tr*1900)%(W+400)+W+400)%(W+400)-200;p.setAttribute('transform','translate('+n1(x-x0)+' 0)');});
}

/* =========================================================
   ① 수면의 절단 — 지느러미가 수면을 가르고, 한참 뒤에 물이 갈라져 솟는다
   ========================================================= */
const S0={title:'수면의 절단',loop:7.5,
 caps:[[0,'안개 낀 수면이 숨을 죽입니다.'],[1.2,'푸른 지느러미가 칼날처럼 수면을 긋고 지나갑니다.'],[2.7,'한참 늦게, 갈라진 물이 솟구쳐 배를 덮칩니다.'],[4.4,'저 멀리서 지느러미가 방향을 틉니다.']],
 build(){
  return sky()+
   '<use class="bw-far" href="'+M+'" opacity="0"/>'+
   ghosts(3)+
   '<use class="bw-fin" href="'+M+'" opacity="0"/>'+
   sea()+
   '<g fill="none" stroke-linecap="round"><path class="bw-cutglow" stroke="#4fc6ff" stroke-width="8" filter="url(#bwSoft)" opacity="0"/>'+
   '<path class="bw-lip1" stroke="#e2f6ff" stroke-width="1.6" opacity="0"/><path class="bw-lip2" stroke="#86d8ff" stroke-width="1.2" opacity="0"/></g>'+
   '<ellipse class="bw-bow" rx="60" ry="5" fill="#e4f2f7" filter="url(#bwRimF)" opacity="0"/>'+
   curtain('bw-wall')+
   columns('bw-cols',4)+
   boatMarkup()+
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
  const bw=q('.bw-bow');bw.setAttribute('cx',n1(X-tipOff+40));bw.setAttribute('cy',n1(SEA+2));bw.setAttribute('opacity',on?'.55':'0');
  // 갈라진 수면: 지나간 자리부터 열렸다 닫힘
  const cutOn=bell(t,a,a+.1,4.2,5.2);
  if(cutOn>0){
   const x0=Math.max(-40,X-tipOff);let d1='',d2='';
   for(let x=x0;x<=1000;x+=24){
    const s=t-passT(x),g=s>0?6*outC(s/.35)*(1-seg(s,1.1,2.6)):0;
    const w=Math.sin(x*.05+t*3)*.8;
    d1+=(d1?' L':'M')+n1(x)+','+n1(SEA+1-g+w);d2+=(d2?' L':'M')+n1(x)+','+n1(SEA+3+g*.6-w);
   }
   ['.bw-lip1','.bw-cutglow'].forEach(s=>{q(s).setAttribute('d',d1);});q('.bw-lip2').setAttribute('d',d2);
   q('.bw-lip1').setAttribute('opacity',n3(.8*cutOn));q('.bw-lip2').setAttribute('opacity',n3(.6*cutOn));q('.bw-cutglow').setAttribute('opacity',n3(.55*cutOn));
  }else ['.bw-lip1','.bw-lip2','.bw-cutglow'].forEach(s=>q(s).setAttribute('opacity','0'));
  // 늦게 솟는 물기둥
  paintCurtain(q('.bw-wall'),-40,1000,x=>colH(t-passT(x)-.3,70+30*Math.sin(x*.013+1)+25*Math.sin(x*.041),.42,1.6),3,t,1-seg(t,4.6,5.6));
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
  veil(el,t<.6?1-t/.6:seg(t,6.9,7.5));
  caption(el,this.caps,t);
 }
};

/* =========================================================
   ② 초고속 관통 — 물속 빛줄기, 수면을 뚫고 솟구친 청새치가 배 앞을 가로지름(느린 화면)
   ========================================================= */
const S1={title:'초고속 관통',loop:7.5,
 caps:[[0,'물속에서 푸른 빛줄기가 다가옵니다.'],[1.2,'창 같은 주둥이가 수면을 뚫고 솟구칩니다.'],[1.55,'거대한 몸이 배 앞을 가로지릅니다.'],[2.5,'지나간 자리에서 물이 한참 늦게 솟구칩니다.']],
 build(){
  return sky()+
   '<g clip-path="url(#bwBelow)"><use class="bw-under" href="'+M+'" opacity="0"/></g>'+
   sea()+
   '<g clip-path="url(#bwBelow)"><ellipse class="bw-uglow" rx="170" ry="26" fill="url(#bwUnder)" opacity="0"/></g>'+
   '<ellipse class="bw-hump" rx="50" ry="4" fill="#dcecf2" filter="url(#bwRimF)" opacity="0"/>'+
   boatMarkup()+
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
  paintCurtain(q('.bw-wall'),-40,1000,x=>colH(t-passReal(x+300)-.25,85+35*Math.sin(x*.011+2)+25*Math.sin(x*.037),.45,1.7),5,t,1-seg(t,4.8,5.8));
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
  veil(el,t<.6?1-t/.6:seg(t,6.9,7.5));
  caption(el,this.caps,t);
 }
};

/* =========================================================
   ③ 푸른 항로 추적 — 배가 고래가 남긴 빛나는 물길을 따라 전속력으로 쫓음(끊김 없는 반복)
   ========================================================= */
const FLOW=430;
const S2={title:'푸른 항로 추적',loop:8,seamless:true,
 caps:[[0,'고래가 남긴 푸른 물길을 따라 전속력으로 쫓습니다.'],[2.8,'고래가 몸을 튕기며 물기둥을 일으킵니다. 배는 그 사이를 가릅니다.'],[5.3,'푸른 등이 물 아래로 사라져도 물길은 아직 빛납니다.']],
 build(){
  const r=seeded(57);let streaks='<g class="bw-streaks" stroke="#cfe3ea" stroke-linecap="round">';
  for(let i=0;i<26;i++){const y=SEA+6+Math.pow(r(),1.4)*(H-SEA-6),k=(y-SEA)/(H-SEA);streaks+='<path data-x="'+n1(r()*1100)+'" data-k="'+n3(k)+'" d="M0,'+n1(y)+' h'+n1(14+60*k)+'" stroke-width="'+n1(.8+k*1.6)+'" stroke-opacity="'+n3(.08+k*.16)+'"/>';}
  streaks+='</g>';
  return sky()+
   '<use class="bw-far" href="'+M+'" opacity="0"/>'+
   '<use class="bw-near" href="'+M+'"/>'+
   sea()+
   '<g fill="none" stroke-linecap="round"><path class="bw-road-glow" stroke="#46bff8" stroke-width="10" filter="url(#bwSoft)"/>'+
   '<path class="bw-road" stroke="#bdeeff" stroke-width="1.6" stroke-dasharray="26 14 8 14"/></g>'+
   streaks+
   '<g class="bw-wake" fill="none" stroke="#e1eef3" stroke-linecap="round">'+[0,1,2,3,4].map(i=>'<path data-i="'+i+'" stroke-width="'+n1(2.2-i*.3)+'"/>').join('')+'</g>'+
   columns('bw-cols',4)+
   boatMarkup()+
   drops('bw-bowspray',30,21)+
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
   const k=(g.hits||0)/(g.need||16),missK=g.lastMissAt!=null?Math.exp(-(t-g.lastMissAt)*1.4):0;
   let target=110-170*k+60*(g.misses||0)+90*missK;
   if(g.done==='fail'){target+=260*seg(t,g.doneAt,g.doneAt+1.2);sink=150*inOut(seg(t,g.doneAt+.2,g.doneAt+1.2));}
   g._off=g._off==null?target:lerp(g._off,target,.08);off=g._off;
  }
  const X=tt=>700+off+55*Math.sin(w*tt)+18*Math.sin(w*3*tt+1);
  const Y=tt=>SEA+40+(g?dive(tt)*.35+sink:dive(tt));
  const dy=(Y(t+.03)-Y(t-.03))/.06,deg=clamp(Math.atan2(dy,300)/RAD,-28,28);
  const nx=X(t),ny=Y(t);
  setUse(q('.bw-near'),mt(nx,ny,deg,-S,S,500,0),1);
  const tail=apply(nx,ny,deg,-S,S,500,0,930,0);
  // 푸른 물길: 고래 꼬리에서 뱃머리까지
  const B=bob(tr);
  const bx=240+6*Math.sin(w*t),bow=bx+56*1.9;
  let d='';
  for(let x=Math.max(bow,-10);x<=tail[0]+4;x+=18){const y=SEA+5+3*Math.sin((x+tr*FLOW)/37)+2*Math.sin((x+tr*FLOW)/91);d+=(d?' L':'M')+n1(x)+','+n1(y);}
  const under=clamp((ny-(SEA+60))/60);
  q('.bw-road').setAttribute('d',d||'M0,0');q('.bw-road-glow').setAttribute('d',d||'M0,0');
  q('.bw-road').style.strokeDashoffset=n1(tr*FLOW);
  q('.bw-road').setAttribute('opacity',n3(.75-.35*under));q('.bw-road-glow').setAttribute('opacity',n3(.5-.25*under));
  // 흘러가는 수면의 거품
  qa('.bw-streaks path').forEach(p=>{const x0=+p.dataset.x,k=+p.dataset.k,x=((x0-tr*FLOW*(.55+1.7*k))%1100+1100)%1100-70;p.setAttribute('transform','translate('+n1(x)+' 0)');});
  // 고래가 일으킨 물기둥이 뒤로 흘러와 배 양옆을 지나감
  const spawns=[.9,3.95,4.5,6.5];let bump=0;
  qa('.bw-cols .bw-col').forEach(p=>{const i=+p.dataset.i,sj=spawns[i],age=(((t-sj)%L)+L)%L;
   const sx=apply(X(sj),Y(sj),0,-S,S,500,0,880,0)[0],x=sx-FLOW*.85*age;
   paintCol(p,x,age,i===1?190:130,22,10,.35,1.7);
   const hh=colH(age,1,.35,1.7);bump+=Math.max(0,1-Math.abs(x-bow+20)/70)*hh;});
  // 배: 빠르게 튀며 앞으로
  const pitch=-2.5+2.2*Math.sin(tr*3.1+.8)+1.2*Math.sin(tr*5.3);
  const by=SEA+2.5*Math.sin(tr*3.1)+1.4*Math.sin(tr*5.3+1)-bump*5;
  const tw=boatPose(el,bx,by,pitch-bump*7,[38,-27]);
  lamp(el,tr,tw,0);
  // 항적
  qa('.bw-wake path').forEach(p=>{const i=+p.dataset.i,x1=bx-40,yy=SEA+3+i*3.2,len=120+i*70;
   p.setAttribute('d','M'+n1(x1)+','+n1(SEA+2)+' Q'+n1(x1-len*.5)+','+n1(yy+2*Math.sin(tr*4+i))+' '+n1(x1-len)+','+n1(yy+i*1.5));
   p.setAttribute('stroke-opacity',n3(.32-i*.05));p.setAttribute('stroke-dasharray',(20+i*6)+' '+(10+i*5));p.style.strokeDashoffset=n1(-tr*FLOW*.9);});
  // 뱃머리 물보라 (계속 뿜어짐)
  if(!this._bp){const r=seeded(88);this._bp=Array.from({length:30},(_,i)=>({ph:i/30,vx:40+r()*120,vy:-120-r()*130,life:.45+r()*.35}));}
  const bwp=tw([56,-6]);
  qa('.bw-bowspray circle').forEach(c=>{const p=this._bp[+c.dataset.i],k=((tr*1.7+p.ph)%1)*p.life;
   const x=bwp[0]+p.vx*k-FLOW*.6*k,y=bwp[1]+p.vy*k+700*k*k;
   c.setAttribute('cx',n1(x));c.setAttribute('cy',n1(y));c.setAttribute('opacity',y>SEA+3?'0':n3(.75*(1-k/p.life)));});
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
const S3={title:'관통 회피',loop:7.5,
 caps:[[0,'물속의 푸른 선이 뱃머리를 겨눕니다.'],[1.3,'선이 뱃머리 바로 앞에서 멈춥니다.'],[1.65,'키를 꺾어라!'],[2.05,'배가 있던 자리를 주둥이가 꿰뚫고 솟구칩니다.'],[3.1,'한참 늦게 그 자리에 물기둥이 솟습니다.']],
 build(){
  return sky()+
   '<g clip-path="url(#bwBelow)"><use class="bw-under" href="'+M+'" opacity="0"/></g>'+
   sea()+
   '<g clip-path="url(#bwBelow)"><ellipse class="bw-uglow" rx="150" ry="24" fill="url(#bwUnder)" opacity="0"/></g>'+
   '<g fill="none" stroke-linecap="round"><path class="bw-lineglow" stroke="#4fc6ff" stroke-width="9" filter="url(#bwSoft)" opacity="0"/><path class="bw-line" stroke="#d9f5ff" stroke-width="1.6" opacity="0"/></g>'+
   '<ellipse class="bw-hump" rx="40" ry="4" fill="#dcecf2" filter="url(#bwRimF)" opacity="0"/>'+
   columns('bw-cols',3)+
   boatMarkup()+
   '<g clip-path="url(#bwAbove)">'+ghosts(3)+'<use class="bw-front" href="'+M+'" opacity="0"/></g>'+
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
  veil(el,t<.6?1-t/.6:seg(t,6.9,7.5));
  caption(el,this.caps,t);
 }
};

/* =========================================================
   ⑤ 최후의 교차 — 아무것도 없는 허공에 먼저 던진 작살, 솟구친 고래가 그 지점을 지나감. 한 번 재생 후 멈춤
   ========================================================= */
const S4={title:'최후의 교차',dur:9,
 caps:[[0,'작살잡이가 물길의 끝, 아무것도 없는 허공을 겨눕니다.'],[1.1,'작살이 먼저 날아갑니다.'],[1.7,'솟구친 고래가 정확히 그 지점을 지나갑니다.'],[3.2,'푸른 빛이 꺼져 갑니다. 거대한 몸이 뒤집혀 떠오릅니다.']],
 build(){
  let sparks='<g class="bw-sparks" stroke="#c9f3ff" stroke-linecap="round" opacity="0">';
  const r=seeded(71);for(let i=0;i<20;i++){const a=r()*TAU;sparks+='<path data-a="'+n3(a)+'" data-v="'+n1(60+r()*150)+'" stroke-width="'+n1(1+r()*1.6)+'"/>';}
  sparks+='</g>';
  return '<g class="bw-root">'+sky()+
   '<g clip-path="url(#bwBelow)"><use class="bw-under" href="'+M+'" opacity="0"/></g>'+
   '<use class="bw-carc" href="'+M+'" opacity="0"/>'+
   sea()+
   '<g clip-path="url(#bwBelow)"><ellipse class="bw-uglow" rx="170" ry="26" fill="url(#bwUnder)" opacity="0"/></g>'+
   boatMarkup()+
   '<g clip-path="url(#bwAbove)">'+ghosts(3)+'<use class="bw-front" href="'+M+'" opacity="0"/>'+
    '<path class="bw-trail" fill="none" stroke="#e3ecea" stroke-width="2" stroke-linecap="round" filter="url(#bwRimF)" opacity="0"/>'+
    '<path class="bw-rope" fill="none" stroke="#8a9697" stroke-opacity=".75" stroke-width="1.5" opacity="0"/>'+
    '<g class="bw-harpoon" opacity="0">'+HARPOON+'</g></g>'+
   '<g fill="none"><circle class="bwg-tc" r="24" stroke="#e8f3f6" stroke-width="1.6" stroke-dasharray="5 4" opacity="0"/><circle class="bwg-cc" r="24" stroke="#cfeefd" stroke-width="2" opacity="0"/></g>'+
   '<circle class="bw-flash" r="70" fill="url(#bwFlash)" opacity="0"/>'+
   sparks+
   drops('bw-blood',22,72,'#1b0c16')+
   columns('bw-cols',5)+
   drops('bw-splash',60,73)+
   rings(3)+
   nearMist()+'</g>';
 },
 paint(el,tReal,tr){
  const {q,qa}=cacheQ(el);
  const t=Math.min(tReal,this.dur);
  ambient(el,tr,0);
  const S=.8,P=[600,215],TH=1.75,HS=[1.75,2.45,.05];
  const tau=warp(t,HS[0],HS[1],HS[2]);
  const V=[-700,-150],Gv=900;
  function pose(tt){
   if(tt<TH){const d=tt-TH;const vy=V[1]+Gv*d;return {x:P[0]+V[0]*d,y:P[1]+V[1]*d+.5*Gv*d*d,deg:Math.atan2(-vy,-V[0])/RAD};}
   const p=tt-TH,th0=Math.atan2(-V[1],-V[0])/RAD;
   if(p<.558)return {x:P[0]-150*p,y:P[1]-90*p+550*p*p,deg:lerp(th0,-28,inOut(p/.558))+(p<.2?3*Math.sin(p*60)*(1-p/.2):0)};
   const q2=p-.558;return {x:P[0]-150*p,y:SEA+160*(1-Math.exp(-q2*3)),deg:lerp(-28,-6,outC(q2/.4))};
  }
  const E=pose(tau),post=tau-TH;
  const vis=tau>.6&&post<1.3?(post>.9?1-seg(post,.9,1.3):1):0;
  const tf=mt(E.x,E.y,E.deg,S,S,EYE[0],EYE[1]);
  const glow=post>0?lerp(1,.45,seg(post,0,.6)):1;
  setUse(q('.bw-under'),tf,vis);setUse(q('.bw-front'),tf,vis);
  q('.bw-front').style.setProperty('--bwglow',n3(glow));q('.bw-under').style.setProperty('--bwglow',n3(glow));
  const fast=tau>1.15&&tau<TH;
  qa('.bw-ghost').forEach(g=>{const k=+g.dataset.k,pp=pose(tau-k*.03);setUse(g,mt(pp.x,pp.y,pp.deg,S,S,EYE[0],EYE[1]),fast?(.26-k*.07):0);});
  const ug=q('.bw-uglow');ug.setAttribute('cx',n1(E.x));ug.setAttribute('cy',n1(SEA+46));ug.setAttribute('opacity',n3(tau<1.3?seg(t,.2,.8)*(E.y>SEA?1:0):0));
  // 배와 작살잡이
  const tc=unwarp(TH+.558,...HS),cx=P[0]-150*.558,sc=t-tc,B=bob(tr),j=jolt(sc-.3,1,8),heave=sc>.3?-13*Math.exp(-(sc-.3)*2)*Math.sin((sc-.3)*5):0;
  const T0=1.1,thrown=t>=T0,aim=clamp(t/.8);
  const armEnd=thrown?[38,-24]:[37-aim*12,-30-aim*4];
  const bx=210,tw=boatPose(el,bx-j*5,SEA+B.y+heave,B.r+j*10-(thrown?Math.exp(-(t-T0)*3)*Math.sin((t-T0)*9)*4:0),armEnd);
  lamp(el,tr,tw,!thrown?.12:0);
  // 작살: 손 → 비어 있는 교차점 P(먼저 도착) → 고래 눈에 박혀 함께 움직임
  const hand=tw(armEnd),p0=[hand[0]+30,hand[1]-14],LIFT=50;
  const hp=q('.bw-harpoon');let pos,ang,show=0;
  const endAng=Math.atan2((P[1]-p0[1])+4*LIFT,P[0]-p0[0])/RAD;
  // 고래 기준 작살의 붙은 자리(눈)와 상대 각도
  const rel=endAng-pose(TH).deg;
  if(!thrown){const a=-28-aim*16;pos=[hand[0]+Math.cos(a*RAD)*40,hand[1]+Math.sin(a*RAD)*40];ang=a;show=clamp((t-.2)/.4);}
  else if(t<TH){const u=(t-T0)/(TH-T0),e=u*(.85+.15*u);
   pos=[p0[0]+(P[0]-p0[0])*e,p0[1]+(P[1]-p0[1])*e-4*LIFT*e*(1-e)];
   ang=Math.atan2((P[1]-p0[1])-4*LIFT*(1-2*e),P[0]-p0[0])/RAD;show=1;}
  else{
   let host=E,hostS=[S,S],hostO=EYE;
   const carcOn=t>tc+.9;
   if(carcOn){const C=carc(t,tr);host={x:C.x,y:C.y,deg:C.deg};hostS=[C.s,-C.s];hostO=[500,0];}
   const eye=carcOn?apply(host.x,host.y,host.deg,hostS[0],hostS[1],hostO[0],hostO[1],EYE[0],EYE[1]):[E.x,E.y];
   ang=carcOn?host.deg+26:E.deg+rel;
   pos=[eye[0]-10*Math.cos(ang*RAD),eye[1]-10*Math.sin(ang*RAD)];show=1;
  }
  hp.setAttribute('opacity',String(show));
  hp.setAttribute('transform','translate('+n1(pos[0])+' '+n1(pos[1])+') rotate('+n1(ang)+')');
  q('.bw-tip').style.opacity=t>=TH?'0':'1';
  const ar=ang*RAD,tail=[pos[0]-104*Math.cos(ar),pos[1]-104*Math.sin(ar)];
  const trl=q('.bw-trail');
  if(thrown&&t<TH+.3){const bk=[pos[0]-170*Math.cos(ar),pos[1]-170*Math.sin(ar)];trl.setAttribute('d','M'+n1(bk[0])+','+n1(bk[1])+' L'+n1(tail[0])+','+n1(tail[1]));trl.setAttribute('opacity',n3(t<TH?.45:.45*(1-(t-TH)/.3)));}
  else trl.setAttribute('opacity','0');
  const anchor=tw([40,-9]),slack=!thrown?14:t<TH?40:(t>tc+.9?46+Math.sin(tr*1.1)*4:Math.max(4,30*Math.exp(-(t-TH)*1.5))+Math.sin(tr*2.4)*3);
  const mid=[(tail[0]+anchor[0])/2,(tail[1]+anchor[1])/2+slack];
  const rope=q('.bw-rope');rope.setAttribute('d','M'+n1(anchor[0])+','+n1(anchor[1])+' Q'+n1(mid[0])+','+n1(mid[1])+' '+n1(tail[0])+','+n1(tail[1]));
  rope.setAttribute('opacity',thrown?'.9':'0');
  // 교차의 순간: 섬광 · 불꽃 · 멈춘 화면 흔들림
  const sh=t-TH;
  const fl=q('.bw-flash');fl.setAttribute('cx',P[0]);fl.setAttribute('cy',P[1]);
  fl.setAttribute('opacity',sh>0?n3(Math.exp(-sh*2.6)):'0');fl.setAttribute('r',n1(50+90*clamp(sh*2)));
  const sp=q('.bw-sparks');sp.setAttribute('opacity',sh>0&&sh<1.6?n3(1-sh/1.6):'0');
  if(sh>0)qa('.bw-sparks path').forEach(p=>{const a=+p.dataset.a,v=+p.dataset.v,d1=12+v*Math.min(sh,1.2)*.9,d2=d1+10+v*.12;
   p.setAttribute('d','M'+n1(P[0]+Math.cos(a)*d1)+','+n1(P[1]+Math.sin(a)*d1*.8)+' L'+n1(P[0]+Math.cos(a)*d2)+','+n1(P[1]+Math.sin(a)*d2*.8));});
  if(!this._bl)this._bl=dropParams(22,74,-200,20,90,300);
  paintDrops(qa('.bw-blood circle'),this._bl,P[0],P[1],(tau-TH)*1.3,10,500);
  const shake=sh>0&&sh<.7?(1-sh/.7)*4:0;
  q('.bw-root').setAttribute('transform',shake?'translate('+n1(Math.sin(t*90)*shake)+' '+n1(Math.cos(t*77)*shake*.6)+')':'');
  // 추락: 거대한 물보라 · 물기둥 · 물결
  const cs=qa('.bw-cols .bw-col');
  [[0,0,200,44,-10],[1,-150,125,28,-22],[2,170,150,30,16],[3,-290,90,20,-14],[4,330,100,20,18]].forEach(([i,ox,h,w,ln],n)=>paintCol(cs[i],cx+ox,sc-n*.06,h,w,ln,.5,2.1));
  if(!this._sp)this._sp=dropParams(60,75,-170,-10,160,460);
  paintDrops(qa('.bw-splash circle'),this._sp,cx,SEA-6,sc,320,460);
  paintRings(qa('.bw-rings ellipse'),cx,sc-.2,330,.6);
  // 뒤집혀 떠오른 사체: 빛이 점점 꺼짐
  function carc(tt,trr){const u=outC(seg(tt,tc+.9,tc+4.2));return {x:cx+240+4*Math.sin(trr*.4),y:lerp(SEA+150,SEA+22,u)+2.5*Math.sin(trr*1.1),deg:9+1.2*Math.sin(trr*.7),s:.72};}
  const C=carc(t,tr),cu=q('.bw-carc');
  setUse(cu,mt(C.x,C.y,C.deg,C.s,-C.s,500,0),seg(t,tc+.8,tc+1.6));
  cu.style.setProperty('--bwglow',n3(.5*(1-seg(t,tc+1,tc+5))));
  veil(el,tReal<.6?1-tReal/.6:0);
  caption(el,this.caps,t);
 }
};

/* =========================================================
   미니게임 표시 (blue-whale-gameplay-v021.js가 window.BlueHuntGame을 움직임)
   ========================================================= */
const GAMECAP={2:'고래가 꺾는 쪽으로 키를 돌리십시오.',3:'주둥이가 물살을 뚫고 솟는 순간에만 배를 트십시오.',4:'좁혀 오는 고리가 교차점에 겹치는 순간 작살을 던지십시오.'};
function hud(el){const {q}=cacheQ(el);return {hint:q('.bwg-hint'),verdict:q('.bwg-verdict'),pips:q('.bwg-pips'),arrow:q('.bwg-arrow'),glyph:q('.bwg-arrow b'),ring:q('.bwg-ring'),bar:q('.bwg-bar i')};}
function setTxt(n,t){if(n&&n.textContent!==t)n.textContent=t;}
function setVerdict(n,t,cls){if(!n)return;setTxt(n,t);const c='bwg-verdict'+(t?' on '+(cls||''):'');if(n.className!==c)n.className=c;}
function setPips(n,total,filled,cls){if(!n)return;const key=total+'/'+filled+'/'+cls;if(n.dataset.k===key)return;n.dataset.k=key;
 let h='';for(let i=0;i<total;i++)h+='<i class="'+(i<filled?cls:'')+'"></i>';n.innerHTML=h;}
const RING_C=2*Math.PI*26;
function hudChase(el,t,g){
 const u=hud(el);
 if(g.dir&&!g.done){u.arrow.classList.add('on');setTxt(u.glyph,g.dir==='L'?'←':'→');
  const p=clamp((t-g.promptAt)/(g.win||.7));u.ring.style.strokeDashoffset=n1(RING_C*p);u.arrow.classList.toggle('late',p>.65);}
 else u.arrow.classList.remove('on','late');
 u.bar.style.width=n1(100*(g.hits||0)/(g.need||16))+'%';
 setPips(u.pips,2,g.misses||0,'bad');
 const miss=g.lastMissAt!=null&&t-g.lastMissAt<.8&&!g.done;
 setVerdict(u.verdict,g.done==='ok'?'추적 성공':g.done==='fail'?'놓쳤다':miss?'놓침':'',g.done==='ok'?'good':'bad');
 setTxt(u.hint,t<1.2?'준비 · ← → 를 0.7초 안에':'← → · 화면 왼쪽 / 오른쪽 누르기');
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
 const u=hud(el);
 const fin=g.done&&(g.hit?t>=g.th:t>=Math.max(g.th,g.thrownAt!=null?g.arriveAt:0));
 setVerdict(u.verdict,fin?(g.hit?'명중':'빗나감'):'',g.hit?'good':'bad');
 setTxt(u.hint,g.thrownAt!=null||g.autoMiss?'':t<g.breachAt?'단 한 번 · 고래가 솟구치길 기다리십시오':'지금 · 고리가 겹칠 때 스페이스 / 화면 누르기');
 u.hint.classList.toggle('now',t>=g.breachAt&&g.thrownAt==null&&!g.autoMiss);
 caption(el,[[0,GAMECAP[4]]],0);
}
// 배가 꿰뚫려 부서지는 모습
function brokenBoat(el,t,ft,x){
 const k=seg(t,ft,ft+.3);
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
  const early=g.failWhy==='early',k0=early?-260:-20+150*.55;
  k=Math.min(k0+1700*(t-g.failAt),260+60*(t-g.failAt));emergeAt=early?g.failAt+.1:g.upAt;
 }
 if(k!=null&&k<1400){underTf=at(k);underOp=1;}
 setUse(q('.bw-under'),underTf||'',underTf?underOp:0);
 setUse(q('.bw-front'),k!=null&&k<1400?at(k):'',k!=null&&k<1400?1:0);
 const fast=ph==='dodge'||(ph==='pierced'&&t-g.failAt<.25);
 qa('.bw-ghost').forEach(gh=>{const j=+gh.dataset.k;setUse(gh,k!=null?at(k-j*60):'',fast&&k!=null?(.28-j*.07):0);});
 // 겨누는 선
 const d='M'+n1(tipX)+','+(SEA+3)+' L'+(W+20)+','+(SEA+4);
 q('.bw-line').setAttribute('d',d);q('.bw-lineglow').setAttribute('d',d);
 q('.bw-line').setAttribute('opacity',n3(.85*lineOn));q('.bw-lineglow').setAttribute('opacity',n3(.6*lineOn));
 const ug=q('.bw-uglow');ug.setAttribute('cx',n1(tipX+80));ug.setAttribute('cy',n1(SEA+44));ug.setAttribute('opacity',n3(lineOn));
 const hp=q('.bw-hump');hp.setAttribute('cx',n1(tipX+20));hp.setAttribute('cy',n1(SEA+2));hp.setAttribute('opacity',n3(.55*lineOn));
 // 물살을 뚫는 물보라
 if(!evadeGame._bp)evadeGame._bp=dropParams(50,51,-160,-20,140,430);
 paintDrops(qa('.bw-burst circle'),evadeGame._bp,X0+40,SEA,emergeAt!=null?t-emergeAt:-1,70,520);
 // 배
 const B=bob(tr);
 if(ph==='pierced'){brokenBoat(el,t,g.failWhy==='early'?g.failAt+.25:g.failAt+.08,X0);}
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
 veil(el,ph==='pierced'?.9*seg(t,g.failAt+.6,g.failAt+2):t<.5?1-t/.5:0);
 hudEvade(el,t,g);
}
/* ⑤ 최후의 교차 미니게임 */
const FP=[600,215],FS=.8;
function poseFinal(tt){const d=tt-1.75,vy=-150+900*d;return {x:FP[0]-700*d,y:FP[1]-150*d+450*d*d,deg:Math.atan2(-vy,700)/RAD};}
function finalGame(el,t,tr,g){
 const {q,qa}=cacheQ(el);
 if(g.hit&&t>=g.th){
  ['.bwg-tc','.bwg-cc'].forEach(s=>q(s).setAttribute('opacity','0'));
  S4.paint(el,1.75+(t-g.th),tr);hudFinal(el,t,g);return;
 }
 ambient(el,tr,0);
 const miss=g.done==='fail'&&t>g.th;
 let E=poseFinal(1.75+(t-g.th)*.632);
 const ib=g.th+.45;
 if(miss){
  const P0=poseFinal(1.75),u=inOut(seg(t,g.th,ib)),sink=60*inC(seg(t,ib+.5,ib+2));
  E={x:lerp(P0.x,429,u),y:lerp(P0.y,177,u)+sink,deg:lerp(P0.deg,-32,u)};
 }
 const tf=mt(E.x,E.y,E.deg,FS,FS,EYE[0],EYE[1]);
 const show=t>.2?1:0;
 setUse(q('.bw-under'),tf,show);setUse(q('.bw-front'),tf,show);
 const fast=t>g.breachAt&&t<g.th+(miss?.45:0);
 qa('.bw-ghost').forEach(gh=>{const k=+gh.dataset.k,pp=poseFinal(1.75+(t-k*.035-g.th)*.632);setUse(gh,mt(pp.x,pp.y,pp.deg,FS,FS,EYE[0],EYE[1]),fast&&!miss?(.24-k*.06):0);});
 setUse(q('.bw-carc'),'',0);
 const ug=q('.bw-uglow');ug.setAttribute('cx',n1(E.x));ug.setAttribute('cy',n1(SEA+46));ug.setAttribute('opacity',n3(E.y>SEA+20&&t<g.breachAt+.2?seg(t,.2,.8):0));
 // 배 · 작살잡이
 const B=bob(tr),T0=g.thrownAt,thrown=T0!=null&&t>=T0;
 const aim=clamp(t/.8),armEnd=thrown?[38,-24]:[37-aim*12,-30-aim*4];
 let tw;
 if(miss&&t>=ib)tw=brokenBoat(el,t,ib,210);
 else{tw=boatPose(el,210,SEA+B.y,B.r-(thrown?Math.exp(-(t-T0)*3)*Math.sin((t-T0)*9)*4:0),armEnd);lamp(el,tr,tw,!thrown?.12:0);}
 const hand=tw(armEnd),p0=[hand[0]+30,hand[1]-14];
 const hpn=q('.bw-harpoon');let pos,ang,showH=1;
 if(!thrown){const a=-28-aim*16;pos=[hand[0]+Math.cos(a*RAD)*40,hand[1]+Math.sin(a*RAD)*40];ang=a;showH=clamp((t-.2)/.4)*(miss&&t>=ib?0:1);}
 else{
  const fl=.4,u=(t-T0)/fl,L=30;
  if(u<=1){const e=u;pos=[p0[0]+(FP[0]-p0[0])*e,p0[1]+(FP[1]-p0[1])*e-4*L*e*(1-e)];ang=Math.atan2((FP[1]-p0[1])-4*L*(1-2*e),FP[0]-p0[0])/RAD;}
  else{const s2=t-T0-fl,vx=(FP[0]-p0[0])/fl,vy=(FP[1]-p0[1]+4*L)/fl;pos=[FP[0]+vx*s2*.8,FP[1]+vy*s2*.8+500*s2*s2];ang=Math.atan2(vy*.8+1000*s2,vx*.8)/RAD;if(pos[1]>SEA+10)showH=0;}
 }
 hpn.setAttribute('opacity',String(showH));
 hpn.setAttribute('transform','translate('+n1(pos[0])+' '+n1(pos[1])+') rotate('+n1(ang)+')');
 q('.bw-tip').style.opacity='1';
 const ar=ang*RAD,tail=[pos[0]-104*Math.cos(ar),pos[1]-104*Math.sin(ar)];
 const trl=q('.bw-trail');
 if(thrown&&t<T0+.5){const bk=[pos[0]-170*Math.cos(ar),pos[1]-170*Math.sin(ar)];trl.setAttribute('d','M'+n1(bk[0])+','+n1(bk[1])+' L'+n1(tail[0])+','+n1(tail[1]));trl.setAttribute('opacity','.45');}
 else trl.setAttribute('opacity','0');
 const anchor=tw([40,-9]),mid=[(tail[0]+anchor[0])/2,(tail[1]+anchor[1])/2+(thrown?40:14)];
 const rope=q('.bw-rope');rope.setAttribute('d','M'+n1(anchor[0])+','+n1(anchor[1])+' Q'+n1(mid[0])+','+n1(mid[1])+' '+n1(tail[0])+','+n1(tail[1]));
 rope.setAttribute('opacity',thrown&&showH?'.9':'0');
 // 교차점과 좁혀 오는 고리
 const tc=q('.bwg-tc'),cc=q('.bwg-cc');
 const ringOn=T0==null&&!g.autoMiss;
 tc.setAttribute('cx',FP[0]);tc.setAttribute('cy',FP[1]);cc.setAttribute('cx',FP[0]);cc.setAttribute('cy',FP[1]);
 tc.setAttribute('opacity',ringOn?n3((.45+.25*Math.sin(t*5))*seg(t,.3,.9)):'0');
 if(ringOn&&t>=g.breachAt){
  const r=24+150*(1-(t-g.breachAt)/(g.ti-g.breachAt));
  const near=Math.abs(t-g.ti)<=.12;
  cc.setAttribute('r',n1(Math.max(2,r)));cc.setAttribute('opacity',r<4?'0':'.95');
  cc.setAttribute('stroke',near?'#ffcf9a':'#cfeefd');cc.setAttribute('stroke-width',near?'3':'2');
  tc.setAttribute('stroke',near?'#ffcf9a':'#e8f3f6');
 }else cc.setAttribute('opacity','0');
 // 꿰뚫림
 const sp=qa('.bw-splash circle');
 if(!finalGame._sp)finalGame._sp=dropParams(60,77,-170,-10,120,380);
 paintDrops(sp,finalGame._sp,215,SEA-14,miss?t-ib:-1,60,520);
 ['.bw-flash','.bw-sparks'].forEach(s=>q(s).setAttribute('opacity','0'));
 qa('.bw-cols .bw-col').forEach(c=>paintCol(c,0,-1,1,1,0));
 qa('.bw-blood circle,.bw-rings ellipse').forEach(c=>c.setAttribute('opacity','0'));
 const shake=miss&&t>ib&&t<ib+.5?(1-(t-ib)/.5)*5:0;
 q('.bw-root').setAttribute('transform',shake?'translate('+n1(Math.sin(t*90)*shake)+' '+n1(Math.cos(t*77)*shake*.6)+')':'');
 veil(el,miss?.9*seg(t,ib+.5,ib+2.1):t<.5?1-t/.5:0);
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
