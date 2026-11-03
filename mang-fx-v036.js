/* Great Lake v0.3.6 · 망(望)을 감은 작살의 명중 연출 (3망 · 4망 · 5망)
   신(心)은 마음의 힘이고, 그 힘이 무기 둘레에 '따스한 빛의 고리'(망)로 맺혀 공격을 강하게 한다.
   고리 하나가 늘 때마다 부담이 거의 두 배가 되며, 고리를 바깥으로 쏘아 상대 몸의 일부를 날려 버리기도 한다. 望은 '보름달'이기도 하다.
   원칙: 과하지 않게. 선을 긋거나 도형 테두리를 잇지 않고, 셰이더의 부드러운 빛과 빛 알갱이로만 그린다.
   - 3망: 작살 자루를 따라 맺힌 고리 셋이 상처로 미끄러져 들어가 조여지고, 고리 하나가 바깥으로 퍼지며 상처를 둥글게 도려냄.
   - 4망: 고리 넷이 조여진 뒤 하나씩 바깥으로 쏘아지며 도려낸 자리가 겹겹이 넓어짐. 아주 약한 흔들림.
   - 5망: 작살이 몸을 꿰뚫고 지나가며 고리 다섯이 지나간 길을 따라 차례로 둥글게 도려내고, 반대편에 보름달 빛이 피었다 흩어짐.
   - 날아가는 동안 · 장전된 작살: SVG 고리 대신 같은 빛의 고리(셰이더), 작살 뒤로 옅은 잔광.
   HarpoonLauncher.paintHit 를 감싸 3망 이상일 때만 새 연출로 그린다(1 · 2망과 WebGL2가 없을 때는 예전 그대로). */
(function(){
'use strict';
const HL=window.HarpoonLauncher,CG=window.CalGL;
if(!HL||!CG||!HL.paintHit)return;
const SVGNS='http://www.w3.org/2000/svg',XHTML='http://www.w3.org/1999/xhtml',W=960,H=540,RAD=Math.PI/180;
const off=()=>{try{return /[?&]mangfx=0/.test(location.search);}catch(e){return false;}};
const DUR=[1.8,2.8,3.3];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),outE=x=>1-Math.pow(1-clamp(x,0,1),3);

/* ───────── 공통: 빛의 고리(망) ─────────
   q: 고리 좌표(px), R: 반지름(px), k: 납작함(작살 축으로 눌린 정도). 맑고 따스한 빛이 두껍게 맺힌 고리 + 은은한 빛무리.
   불길이나 테두리 선이 아니라, 빛의 세기가 고리 단면을 따라 부드럽게 솟았다 가라앉는 면. 앞쪽(보는 쪽)이 더 밝다. */
const RING=`
float outE(float x){x=clamp(x,0.,1.);return 1.-pow(1.-x,3.);}
vec3 lightRing(vec2 q,float R,float k,float life,float id,float t){
 if(life<=0.||R<=.5)return vec3(0.);
 vec2 e2=vec2(q.x/max(k,.06),q.y);float e=length(e2),th=atan(e2.y,e2.x);
 float w=max(1.5,R*.075);
 float d=e-R;
 float core=exp(-d*d/(w*w));
 float bloom=exp(-abs(d)/(w*3.2));
 float inner=exp(-pow((d+w*2.6)/(w*.9),2.))*.18;                  // 안쪽에 비치는 옅은 둘째 빛
 float shimmer=.86+.14*sin(th*3.+t*2.2+id*1.7)+.12*(fbm(vec2(th*1.5+id,t*.6))-.5);
 float front=.42+.58*(.5+.5*cos(th-1.1));
 vec3 c=vec3(1.,.97,.88)*core*1.05+vec3(1.,.8,.48)*bloom*.42+vec3(1.,.9,.7)*inner;
 return c*shimmer*front*life;
}`;
/* ───────── 명중 장(場) ───────── */
const F_FIELD=`#version 300 es
precision highp float;
in vec2 vP;out vec4 o;
uniform float uS,uT,uK,uSeed,uRk;uniform vec2 uP,uD,uMoon;uniform vec4 uRing[5];uniform int uRn;uniform vec4 uCut[5];uniform int uCn;uniform vec2 uMoonRA;
${CG.NOISE}
${RING}
void main(){
 vec2 p=vP-uP;float r=length(p),s=uS,K=uK;
 vec2 n=vec2(-uD.y,uD.x);
 vec3 c=vec3(0.);
 // 박히는 순간의 희고 맑은 빛(두 번 고동)
 float beat=1.+.5*exp(-pow((s-.1)/.035,2.));
 float cr=mix(6.,12.,K*.5)*beat;c+=vec3(.97,.98,1.)*exp(-r*r/(cr*cr))*exp(-s*mix(6.,3.6,K*.5));
 // 신(心): 박힌 자리를 감싸는 고요한 금빛 기운(불길이 아닌 번지는 빛)
 float R0=mix(30.,62.,K*.5)*(.5+.5*outE(s*3.));
 c+=vec3(1.,.84,.52)*exp(-r*r/(R0*R0))*(.22+.06*sin(uT*3.))*smoothstep(0.,.05,s)*exp(-s*mix(1.6,.8,K*.5));
 // 고리가 바깥으로 쏘아져 도려낸 자리: 살이 빛으로 둥글게 패여 비침 → 다 되면 빛 알갱이로 흩어지며 닫힘
 for(int i=0;i<5;i++){if(i>=uCn)break;vec4 C=uCut[i];if(C.w<=0.||C.z<=.5)continue;
  vec2 cq=vP-C.xy;vec2 cl=vec2(dot(cq,uD)/.62,dot(cq,n));float cr2=length(cl),ca=atan(cl.y,cl.x);
  float m=cr2/C.z+(fbm(vec2(ca*2.+float(i)*3.+uSeed,uT*.2))-.5)*.1;
  float disc=smoothstep(1.08,.55,m);
  float rim=exp(-pow((m-.85)*4.,2.))*.35;
  float glow=exp(-max(m-1.,0.)*3.)*(1.-disc);
  float dissolve=smoothstep(1.-C.w,1.-C.w+.3,fbm(cl*.09+float(i)*7.+uSeed));   // 닫힐 때 군데군데 흩어짐
  vec3 inside=vec3(1.,.92,.74)*(.28+.32*(1.-m)*(.85+.15*fbm(cl*.12+uT*.3)))+vec3(1.,.97,.9)*rim;
  c+=(inside*disc+vec3(1.,.82,.5)*glow*.35)*min(1.,C.w*1.6)*dissolve;}
 // 망의 고리
 for(int i=0;i<5;i++){if(i>=uRn)break;vec4 R=uRing[i];vec2 qq=vP-R.xy;
  c+=lightRing(vec2(dot(qq,uD),dot(qq,n)),R.z,uRk,R.w,float(i),uT);}
 // 望: 반대편에 피어나는 보름달 빛(테두리 없이 둥글게 차오름 · 표면에 옅은 무늬 · 흩어지며 사라짐)
 if(uMoonRA.y>0.){vec2 mp=vP-uMoon;float md=length(mp)/max(uMoonRA.x,1.);
  float plate=exp(-pow(md,3.)*1.4);float mott=.86+.14*fbm(mp*.06+uSeed);
  float scat=smoothstep(1.-uMoonRA.y,1.-uMoonRA.y+.3,fbm(mp*.05+uSeed*2.));
  c+=(vec3(1.,.95,.84)*plate*mott+vec3(1.,.82,.52)*exp(-max(md-1.,0.)*2.2)*.3)*uMoonRA.y*scat;}
 // 4 · 5망: 아주 짧은 섬광
 c+=vec3(1.,.96,.88)*mix(0.,mix(.05,.16,K-1.),step(.5,K))*exp(-s*mix(8.,6.,K*.5));
 {vec3 cc=min(c,vec3(1.));o=vec4(cc,max(cc.r,max(cc.g,cc.b)));}   // 빛이 없는 곳은 투명(검은 판이 생기지 않음)   // 화면(스크린) 합성으로 빛만 더함
}`;
// 날아가는 작살(작살 좌표: 날 끝 x≈3, 뒤가 -x): 고리가 지나간 자리에 남는 옅은 빛의 잔광 · 날 끝의 빛 · (5망) 보름달 빛
const F_FLY=`#version 300 es
precision highp float;
in vec2 vP;out vec4 o;uniform float uT,uN;
${CG.NOISE}
void main(){
 vec2 p=vP;float K=clamp(uN-3.,0.,2.);
 float back=max(-p.x,0.),w=mix(3.5,6.,K*.5)+back*.02;
 float trail=exp(-p.y*p.y/(w*w))*smoothstep(-mix(90.,180.,K*.5),0.,p.x)*smoothstep(10.,-2.,p.x);
 float sh=.75+.25*fbm(vec2(p.x*.03+uT*2.,1.));
 vec3 c=vec3(1.,.86,.6)*trail*sh*.42;
 float tip=exp(-dot(p-vec2(2.,0.),p-vec2(2.,0.))/mix(40.,90.,K*.5));c+=vec3(1.,.97,.9)*tip*.85;
 if(K>1.5){vec2 mp=p-vec2(7.,0.);float md=length(mp)/12.;c+=vec3(1.,.95,.84)*exp(-pow(md,3.)*1.4)*(.86+.14*fbm(mp*.2))*.75+vec3(1.,.82,.52)*exp(-max(md-1.,0.)*2.)*.2;}
 {vec3 cc=min(c,vec3(1.));o=vec4(cc,max(cc.r,max(cc.g,cc.b)));}   // 빛이 없는 곳은 투명(검은 판이 생기지 않음)
}`;
// 작살에 감긴 고리 하나(고리 좌표: 타원 rx · ry, 빛남 uF)
const F_WRAP=`#version 300 es
precision highp float;
in vec2 vP;out vec4 o;uniform float uT,uRx,uRy,uF,uId;
${CG.NOISE}
${RING}
void main(){
 vec2 q=vP;float k=uRx/max(uRy,.01);
 vec3 c=lightRing(q,uRy,k,1.,uId,uT)*(1.+1.2*uF);
 {vec3 cc=min(c,vec3(1.));o=vec4(cc,max(cc.r,max(cc.g,cc.b)));}   // 빛이 없는 곳은 투명(검은 판이 생기지 않음)
}`;

/* ───────── 부드러운 빛 입자(미리 그린 그림) ───────── */
function sprite(stops){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
 stops.forEach(([o,col])=>g.addColorStop(o,col));x.fillStyle=g;x.fillRect(0,0,64,64);return c;}
let SP=null;
function sprites(){return SP||(SP={hot:sprite([[0,'rgba(255,252,240,1)'],[.25,'rgba(255,230,170,.8)'],[.6,'rgba(255,180,80,.25)'],[1,'rgba(255,150,60,0)']]),
 ember:sprite([[0,'rgba(255,200,110,1)'],[.3,'rgba(255,140,50,.6)'],[1,'rgba(200,70,20,0)']]),
 mist:sprite([[0,'rgba(255,236,200,.55)'],[.5,'rgba(255,210,140,.2)'],[1,'rgba(255,190,110,0)']])});}

/* ───────── 장면마다의 층 ───────── */
function layer(g){
 let L=g.__mfx;if(L&&L.host.isConnected)return L;
 const host=document.createElementNS(SVGNS,'g');host.setAttribute('class','mfx');host.style.pointerEvents='none';
 g.parentNode.insertBefore(host,g.nextSibling);
 const fo=document.createElementNS(SVGNS,'foreignObject');fo.setAttribute('x','0');fo.setAttribute('y','0');fo.setAttribute('width',W);fo.setAttribute('height',H);fo.setAttribute('class','mfx-2d');
 const c2=document.createElementNS(XHTML,'canvas');c2.setAttribute('style','display:block;width:100%;height:100%');fo.appendChild(c2);
 const gl=document.createElementNS(SVGNS,'g');gl.setAttribute('class','mfx-gl');host.appendChild(gl);host.appendChild(fo);
 L=g.__mfx={host,gl,fo,c2,ctx:c2.getContext('2d'),seed:0,lastS:9,sparks:[],flakes:[],px:1,pxAt:0};
 return L;
}
function hide(L){if(L&&L.host.style.display!=='none')L.host.style.display='none';}
function paint(el,o){
 const g=el&&el.querySelector('.hl-hit');if(!g||!g.parentNode)return false;
 const tier=o.tier|0,K=Math.min(2,tier-3),s=o.s,svg=g.ownerSVGElement;
 const L=layer(g);
 if(s==null||s<0||s>DUR[K]){hide(L);L.lastS=9;if(svg&&svg.style.transform&&L.shook){svg.style.transform='';L.shook=false;}return true;}
 L.host.style.display='';
 const a=o.ang||0,d=[Math.cos(a*RAD),Math.sin(a*RAD)],P=o.p||[0,0];
 if(s<L.lastS-.05||L.K!==K){L.seed=(L.seed*7+13+Math.floor(P[0]))%997+1;L.sparks=[];L.flakes=[];L.K=K;L.burst=false;}
 L.lastS=s;
 const fo=o.fade!=null&&s>o.fade?Math.max(0,1-(s-o.fade)/.35):1;
 L.host.style.opacity=fo.toFixed(3);
 const now=performance.now()/1000;
 const glc=CG._gl(),PF=CG._prog('mfxField3',CG.VQ,F_FIELD,[['aP',2]]);
 if(!glc||!PF)return false;
 const BB=[0,0,W,H],S=CG._surface(L.gl,BB,{res:.7});
 CG._quad(PF,BB);
 glc.uniform1f(PF.u.uS,s);glc.uniform1f(PF.u.uT,now);glc.uniform1f(PF.u.uK,K);glc.uniform1f(PF.u.uSeed,L.seed*.37);
 glc.uniform2f(PF.u.uP,P[0],P[1]);glc.uniform2f(PF.u.uD,d[0],d[1]);
 const at=u=>[P[0]+d[0]*u,P[1]+d[1]*u];
 const rg=new Float32Array(20),cut=new Float32Array(20);let rn=0,cn=0;
 const ring=(c,R,life)=>{if(life>.01&&rn<5){rg.set([c[0],c[1],R,Math.min(1,life)],rn*4);rn++;}};
 const hole=(c,R,a)=>{if(a>.01&&cn<5){cut.set([c[0],c[1],R,Math.min(1,a)],cn*4);cn++;}};
 const T=K===0?.22:K===1?.2:0;              // 고리가 상처로 미끄러져 들어가 조여지는 시간
 if(K<2){
  // ① 작살 자루를 따라 간격을 두고 맺힌 고리들이 상처 쪽으로 미끄러져 들어가며 조여짐
  for(let i=0;i<tier;i++){
   const rel=K===0?T:T+i*.15;                // 바깥으로 쏘아지는 시각(3망은 한 번에, 4망은 하나씩)
   if(s<rel){const k=outE(s/T);ring(at(-(10+i*9)*(1-k)),9-3*k,1);}
   else if(K===0?i===0:true){const u=(s-rel)/(K===0?.5:.55);ring(at(0),6+(K===0?40:30+i*14)*outE(u),Math.max(0,1-u)*.95);}
  }
  // ② 고리가 쏘아진 자리: 살이 빛으로 둥글게 패여 비침(4망은 고리가 쏘아질 때마다 넓어짐)
  if(s>T){const n=K===0?1:Math.min(tier,1+Math.floor((s-T)/.15));
   const grow=outE((s-T)/.35),Rc=(K===0?18:11+n*4.5)*grow;
   const end=K===0?[1.0,1.6]:[1.9,2.6],a=s<end[0]?1:Math.max(0,1-(s-end[0])/(end[1]-end[0]));
   hole(at(0),Rc,a);}
 }else{
  // 5망: 작살이 몸을 꿰뚫고 지나감 — 고리 다섯이 지나간 길을 따라 차례로 몸을 둥글게 도려내고, 반대편에 보름달 빛
  const th=o.through||110;
  for(let i=0;i<5;i++){
   const pass=i*th/4,ti=.04+i*.06,fwd=Math.max(0,(s-ti))*520;
   const lifeR=s<ti?1:Math.max(0,1-(s-ti)/.9);
   ring(at(Math.min(fwd,th+60)-(s<ti?(8+i*8):0)),s<ti?8:8+22*outE((s-ti)/.4),lifeR*.9);
   const tc=ti+pass/520;if(s>tc){const a=s<2.2?1:Math.max(0,1-(s-2.2)/.9);hole(at(pass),(19+i*2)*outE((s-tc)/.3),a*.9);}
  }
  const ms=s-.2,mp=at(th*1.15);
  glc.uniform2f(PF.u.uMoon,mp[0],mp[1]);
  glc.uniform2f(PF.u.uMoonRA,40*outE(ms/.4),ms>0?(ms<.9?1:Math.max(0,1-(ms-.9)/.8)):0);
 }
 if(K<2)glc.uniform2f(PF.u.uMoonRA,1,0);
 glc.uniform4fv(PF.u.uRing,rg);glc.uniform1i(PF.u.uRn,rn);glc.uniform4fv(PF.u.uCut,cut);glc.uniform1i(PF.u.uCn,cn);
 glc.uniform1f(PF.u.uRk,.34*(1+.15*Math.sin(now*2.3)));
 glc.drawArrays(glc.TRIANGLES,0,6);glc.bindVertexArray(null);CG._blit(S);
 L.cuts=[];for(let i=0;i<cn;i++)L.cuts.push([cut[i*4],cut[i*4+1],cut[i*4+2],cut[i*4+3]]);
 // Canvas 2D: 천천히 흩어지는 빛 알갱이(도려낸 자리 가장자리에서 떠올라 사라짐)
 const c2=L.c2,ctx=L.ctx,t=performance.now(),SPR=sprites();
 if(t-L.pxAt>500){const r2=c2.getBoundingClientRect();L.px=Math.min(1.6,Math.max(.5,(r2.width||W)/W*Math.min(2,window.devicePixelRatio||1)));L.pxAt=t;}
 const pw=Math.round(W*L.px),ph=Math.round(H*L.px);if(c2.width!==pw||c2.height!==ph){c2.width=pw;c2.height=ph;}
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,pw,ph);ctx.setTransform(L.px,0,0,L.px,0,0);ctx.globalCompositeOperation='lighter';
 let dt=s-(L.ls==null?s:L.ls);L.ls=s;if(dt<0||dt>.3)dt=0;
 const rnd=Math.random;
 if(!L.burst){L.burst=true;for(let i=0;i<[8,12,18][K];i++){const an=rnd()*Math.PI*2,v=20+rnd()*45;L.sparks.push({x:P[0],y:P[1],vx:Math.cos(an)*v,vy:Math.sin(an)*v*.7,life:0,max:.8+rnd()*.8,sz:1.6+rnd()*2.2});}}
 if(dt>0)L.cuts.forEach(c=>{const m=dt*(c[3]<1?26:7)*(1+K*.5);for(let i=0;i<Math.floor(m)+(rnd()<m%1?1:0);i++){const an=rnd()*Math.PI*2;
  L.sparks.push({x:c[0]+Math.cos(an)*c[2]*.95,y:c[1]+Math.sin(an)*c[2]*.95,vx:Math.cos(an)*10,vy:-8-rnd()*16,life:0,max:.9+rnd()*.9,sz:1.2+rnd()*1.8});}});
 L.sparks=L.sparks.filter(p=>{p.life+=dt;if(p.life>p.max)return false;p.vx*=1-.9*dt;p.vy=p.vy*(1-.9*dt)-6*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
  const k=p.life/p.max,al=Math.min(1,p.life*8)*(1-k)*.85,sz=p.sz*(1+.3*Math.sin(p.life*7+p.x));
  ctx.globalAlpha=al;ctx.drawImage(SPR.hot,p.x-sz*2,p.y-sz*2,sz*4,sz*4);return true;});
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 if(svg){const amp=[0,1.6,4][K]*Math.exp(-s*8);svg.style.transform=amp>.15?'translate('+(Math.sin(s*92)*amp).toFixed(2)+'px,'+(Math.cos(s*71)*amp*.7).toFixed(2)+'px)':'';L.shook=true;}
 return true;
}
let ok=null;
function supported(){if(ok!==null)return ok;ok=!off()&&!!(CG.supported&&CG.supported());return ok;}
const orig=HL.paintHit;
HL.paintHit=function(el,o){
 const tier=o&&o.tier|0;
 if(tier>=3&&supported()){
  orig.call(this,el,Object.assign({},o,{s:-1}));
  try{if(paint(el,o))return;}catch(e){console.warn('[mang-fx]',e);ok=false;}
 }
 const g=el&&el.querySelector&&el.querySelector('.hl-hit');if(g&&g.__mfx)hide(g.__mfx);
 return orig.call(this,el,o);
};

/* ───────── 날아가는 작살 · 감긴 고리 ───────── */
function visible(e){for(let n=e;n&&n.nodeType===1;n=n.parentNode){if(n.getAttribute&&(n.getAttribute('opacity')==='0'||n.style.opacity==='0'||n.style.display==='none'))return false;if(n.tagName==='svg')break;}return true;}
const FB=[-240,-26,262,52];
function wrapRing(g,i,glc,PW,now){
 const co=g.children[1];if(!co)return;
 const rx=+co.getAttribute('rx')||1,ry=+co.getAttribute('ry')||1,gl=g.children[0];
 const so=gl?+gl.getAttribute('stroke-opacity')||.24:.24,fl=clamp((so-.24)/.45,0,1);
 let host=g.__mfxw;if(!host||!host.isConnected){host=document.createElementNS(SVGNS,'g');host.setAttribute('class','mfx-wrap');g.appendChild(host);g.__mfxw=host;g.classList.add('mfxr');}
 const e=ry*1.9,B=[-e,-e,e*2,e*2];
 const S=CG._surface(host,B,{res:1.2});CG._quad(PW,B);
 glc.uniform1f(PW.u.uT,now);glc.uniform1f(PW.u.uRx,rx);glc.uniform1f(PW.u.uRy,ry);glc.uniform1f(PW.u.uF,fl);glc.uniform1f(PW.u.uId,i);
 glc.drawArrays(glc.TRIANGLES,0,6);glc.bindVertexArray(null);CG._blit(S);
}
function flyFrame(){
 try{const n=HL.tier?HL.tier():0,now=performance.now()/1000;
  if(n>=3&&supported()){const glc=CG._gl(),PQ=CG._prog('mfxFly2',CG.VQ,F_FLY,[['aP',2]]),PW=CG._prog('mfxWrap',CG.VQ,F_WRAP,[['aP',2]]);
   document.querySelectorAll('.hl-fly').forEach(f=>{const host=f.__mfxh||(f.__mfxh=(()=>{const h=document.createElementNS(SVGNS,'g');h.setAttribute('class','mfx-fly');f.insertBefore(h,f.firstChild);return h;})());
    if(!visible(f)||!PQ||!glc){host.style.display='none';return;}host.style.display='';
    const S=CG._surface(host,FB,{res:.8});CG._quad(PQ,FB);glc.uniform1f(PQ.u.uT,now);glc.uniform1f(PQ.u.uN,n);
    glc.drawArrays(glc.TRIANGLES,0,6);glc.bindVertexArray(null);CG._blit(S);});
   if(PW&&glc)document.querySelectorAll('.hl-ring').forEach(g=>{const i=+g.dataset.i||0;
    if(i>=n||g.getAttribute('opacity')==='0'||!visible(g)){if(g.__mfxw)g.__mfxw.style.display='none';return;}
    if(g.__mfxw)g.__mfxw.style.display='';wrapRing(g,i,glc,PW,now);});
  }else{document.querySelectorAll('.mfx-fly,.mfx-wrap').forEach(h=>h.style.display='none');document.querySelectorAll('.hl-ring.mfxr').forEach(g=>g.classList.remove('mfxr'));}
 }catch(e){}
 requestAnimationFrame(flyFrame);
}
requestAnimationFrame(flyFrame);
const st=document.createElement('style');st.textContent='.hl-ring.mfxr>ellipse{display:none}.mfx-gl .cgl-fo,.mfx-fly .cgl-fo,.mfx-wrap .cgl-fo,.mfx-2d{mix-blend-mode:screen}';(document.head||document.documentElement).appendChild(st);
window.MangFX={paint,supported};
})();
