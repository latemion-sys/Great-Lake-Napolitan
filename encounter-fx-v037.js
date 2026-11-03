/* Great Lake v0.3.7 · 재앙의 고래를 만나는 장면(조우)의 징조와 드러남
   다섯 재앙은 법칙에 묶이지 않고 대호수를 떠돌며, 언제나 배를 찾아낸다. 몸이 보이기 전에 호수가 먼저 바뀐다.
   장면 그림(SVG)은 그대로 두고, 장면 안(어둠 막 바로 아래)에 셰이더 한 장과 Canvas 2D 빛 알갱이 층을 얹는다.
   선을 긋거나 도형을 잇지 않고 부드러운 빛 · 안개 · 알갱이로만, 과하지 않게(불투명도 낮게) 그린다.
   · 창백한(0): 물빛이 하얗게 탁해지고 창백한 포자가 떠오름 · 배에 번져 오르는 흰 막은 pallid-encounter 장면이 맡음
   · 푸른(1): 물밑으로 차가운 빛이 빠르게 지나가고, 수면이 갈라지는 순간 그 틈으로 빛이 새어 나옴 · 늦게 솟는 물보라 안개
   · 붉은(2): 수평선 위 공기가 뜨겁게 일렁이고, 물이 빠진 자리가 하얀 소금 결로 굳음 · 수면에서 김이 피어오름
   · 까만(3): 수평선에서 별 없는 어둠이 차오르며 그 가장자리로 별빛이 끌려 들어가 꺼짐 · 달빛이 젖은 끝에 한 번 맺힘
   · 노란(4): 유황빛 탁한 안개 · 물밑의 황금빛 점 셋이 맥동하고, 그 안쪽으로 떠다니던 것들이 감겨 들어가 가라앉음
   window.EncFX.tick(el, t) : 장면 시간 t(초)로 매 프레임 그린다(조우 단계 · 미니게임이 아닐 때만). */
(function(){
'use strict';
const CG=window.CalGL;if(!CG)return;
const SVGNS='http://www.w3.org/2000/svg',XHTML='http://www.w3.org/1999/xhtml',W=960,H=540,SEA=336;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),sm=(a,b,x)=>{const k=clamp((x-a)/(b-a),0,1);return k*k*(3-2*k);};
const off=()=>{try{return /[?&]encfx=0/.test(location.search);}catch(e){return false;}};

const F_ENC=`#version 300 es
precision highp float;
in vec2 vP;out vec4 o;
uniform float uT,uR,uK,uLoop;uniform vec4 uA,uB;uniform vec2 uV[3];
${CG.NOISE}
float band(float y,float c,float w){float d=(y-c)/w;return exp(-d*d);}
void main(){
 vec2 p=vP;float t=uT,R=uR;vec3 c=vec3(0.);float a=0.;
 float below=smoothstep(${SEA-2}.,${SEA+6}.,p.y),above=1.-below;
 if(uK<.5){            // 창백한: 물이 하얗게 탁해짐(아래에서 위로, 수평선 쪽이 먼저)
  float m=uA.x;
  vec2 q=p*vec2(.006,.02)+vec2(R*.02,-R*.01);float n=fbm(q+fbm(q*2.+R*.03));
  float milk=below*smoothstep(.3,.95,n*.8+.3*m)*m;
  c+=vec3(.86,.9,.86)*milk*.3;a=max(a,milk*.2);
  float hz=band(p.y,${SEA}.-6.,22.)*m*(.6+.4*fbm(vec2(p.x*.01+R*.02,1.)));c+=vec3(.9,.93,.9)*hz*.35;a=max(a,hz*.3);
 }else if(uK<1.5){     // 푸른: 물밑을 지나가는 빛 · 갈라진 틈의 빛
  float sx=uA.x,sk=uA.y;            // 지나가는 빛의 머리(x) · 세기
  if(sk>0.){float dx=(p.x-sx);float tail=exp(-max(-dx,0.)/180.)*exp(-max(dx,0.)/20.);
   float y0=${SEA}.+22.;float body=exp(-pow((p.y-y0)/(9.+max(-dx,0.)*.01),2.))*tail*below;
   body*=.6+.4*fbm(vec2(p.x*.02-R*3.,p.y*.08));c+=vec3(.55,.85,1.)*body*sk*.8;a=max(a,body*sk*.6);}
  float ck=uA.z,cx0=uA.w,cx1=uB.x;  // 갈라진 틈: 세기 · 구간
  if(ck>0.){float inx=smoothstep(cx0-20.,cx0+40.,p.x)*smoothstep(cx1+20.,cx1-40.,p.x);
   float w=4.+6.*uB.y;float br=fbm(vec2(p.x*.02+R*.4,R*.2));
   float slit=exp(-pow((p.y-${SEA}.-1.)/w,2.))*inx*smoothstep(.25,.6,br);
   float glow=exp(-pow((p.y-${SEA}.-3.)/(w*4.),2.))*inx*.35;
   c+=vec3(.75,.95,1.)*(slit*.9+glow)*ck;a=max(a,(slit*.7+glow*.6)*ck);}
 }else if(uK<2.5){     // 붉은: 일렁이는 열기 · 소금 결 · (김은 Canvas 2D)
  float hk=uA.x;
  float zone=smoothstep(${SEA}.-150.,${SEA}.-10.,p.y)*above;
  // 아지랑이: 줄무늬 없이, 위로 흘러 오르며 뒤틀리는 옅은 열기 덩어리
  vec2 hq=vec2(p.x*.008,p.y*.02-R*.35);hq+=vec2(fbm(hq*2.+R*.2),fbm(hq*2.-R*.15))*.8;
  float shim=smoothstep(.5,.85,fbm(hq*1.7))*zone*hk;
  c+=vec3(1.,.55,.3)*shim*.16+vec3(1.,.35,.15)*zone*hk*.06;a=max(a,shim*.12+zone*hk*.05);
  float sk=uA.y,lv=uA.z;              // 소금 결: 세기 · 물이 내려간 깊이(px)
  if(sk>0.){float b=smoothstep(${SEA}.-3.,${SEA}.+1.,p.y)*smoothstep(${SEA}.+lv+3.,${SEA}.+lv-2.,p.y);
   vec4 v=vor(p*vec2(.12,.35));float cell=.55+.45*v.z,edge=smoothstep(.0,.15,v.y-v.x);
   float crust=b*(.35+.65*cell)*edge*sk*smoothstep(.35,.7,fbm(p*vec2(.02,.06)));
   c+=vec3(.95,.9,.84)*crust*.32;a=max(a,crust*.28);}
 }else if(uK<3.5){     // 까만: 차오르는 별 없는 어둠 · 가장자리의 젖은 빛
  float h=uA.x,mk=uA.y;
  float edgeY=${SEA}.-h*(.55+.45*sin(p.x*.004+1.)*sin(p.x*.0017+R*.05))-(fbm(vec2(p.x*.01,R*.08))-.5)*h*.25;
  float ink=smoothstep(edgeY-14.,edgeY+10.,p.y)*above*step(1.,h);
  c+=vec3(0.);a=max(a,ink*.72);
  float rim=exp(-pow((p.y-edgeY)/5.,2.))*above*step(1.,h);
  float moon=exp(-pow((p.x-812.)/70.,2.))*mk;
  c+=vec3(.75,.85,.95)*rim*(.05+moon*.7);a=max(a,rim*(.04+moon*.5));
 }else{                // 노란: 유황 안개 · 물밑의 황금빛 점 셋 · 삼각형 안쪽이 감겨 드는 결
  float hk=uA.x,gk=uA.y;
  vec2 cc=uA.zw;vec2 d=p-cc;float r=length(d*vec2(1.,2.4)),th=atan(d.y*2.4,d.x);
  float haze=fbm(vec2(p.x*.006-R*.02,p.y*.012)+fbm(p*.01+R*.03))*hk;
  c+=vec3(.75,.6,.25)*smoothstep(.45,.8,haze)*.25;a=max(a,smoothstep(.45,.8,haze)*.18);
  float sw=fbm(vec2(th*2.-r*.02+R*.35,r*.01))*below*exp(-r/260.)*gk;
  c+=vec3(.9,.7,.3)*smoothstep(.5,.8,sw)*.18;a=max(a,smoothstep(.5,.8,sw)*.14);
  for(int i=0;i<3;i++){vec2 v=uV[i];vec2 e=(p-v)*vec2(1.,2.2);float g=exp(-dot(e,e)/(900.+400.*sin(R*1.6+float(i)*2.)));
   float pul=.55+.45*sin(R*1.8+float(i)*2.1);c+=vec3(1.,.8,.35)*g*pul*gk*.7*below;a=max(a,g*pul*gk*.5*below);}
 }
 vec3 cc=min(c,vec3(1.));o=vec4(cc,max(a,max(cc.r,max(cc.g,cc.b))));
}`;

function sprite(stops,sz){const c=document.createElement('canvas');c.width=c.height=sz||48;const x=c.getContext('2d'),h=c.width/2,g=x.createRadialGradient(h,h,0,h,h,h);
 stops.forEach(([o,col])=>g.addColorStop(o,col));x.fillStyle=g;x.fillRect(0,0,c.width,c.width);return c;}
let SP=null;
function sprites(){return SP||(SP={
 spore:sprite([[0,'rgba(244,248,240,.95)'],[.4,'rgba(230,238,230,.4)'],[1,'rgba(220,230,220,0)']]),
 mist:sprite([[0,'rgba(220,238,246,.5)'],[.5,'rgba(200,226,238,.18)'],[1,'rgba(190,220,236,0)']],64),
 steam:sprite([[0,'rgba(255,236,226,.45)'],[.5,'rgba(255,220,206,.15)'],[1,'rgba(255,210,196,0)']],64),
 star:sprite([[0,'rgba(236,244,255,1)'],[.3,'rgba(210,226,250,.5)'],[1,'rgba(200,220,250,0)']]),
 dust:sprite([[0,'rgba(240,206,130,.9)'],[.4,'rgba(220,170,80,.35)'],[1,'rgba(200,150,60,0)']])});}

function kindOf(el){
 if(el.classList.contains('pe7-scene'))return 0;
 if(el.classList.contains('bw3-scene'))return 1;
 if(el.classList.contains('rw3-scene'))return 2;
 if(el.classList.contains('bk3-scene'))return 3;
 if(el.classList.contains('yw3-scene'))return 4;
 return -1;}
function layer(el){
 let L=el.__enc;if(L&&L.host.isConnected)return L;
 const svg=el.querySelector('svg');if(!svg)return null;
 const host=document.createElementNS(SVGNS,'g');host.setAttribute('class','encfx');host.style.pointerEvents='none';
 // 까만 고래의 어둠은 수평선 너머의 것이라 배보다 뒤에, 나머지는 어둠 막 바로 아래(맨 위)에
 const k=kindOf(el);let ref=k===3?svg.querySelector('.bw-lampglint'):svg.querySelector('.bw-veil,.pe7-veil');
 while(ref&&ref.parentNode!==svg)ref=ref.parentNode;
 if(ref)svg.insertBefore(host,ref);else svg.appendChild(host);
 const gl=document.createElementNS(SVGNS,'g');host.appendChild(gl);
 const fo=document.createElementNS(SVGNS,'foreignObject');fo.setAttribute('x','0');fo.setAttribute('y','0');fo.setAttribute('width',W);fo.setAttribute('height',H);
 const c2=document.createElementNS(XHTML,'canvas');c2.setAttribute('style','display:block;width:100%;height:100%');fo.appendChild(c2);host.appendChild(fo);
 L=el.__enc={host,gl,c2,ctx:c2.getContext('2d'),parts:[],lt:null,px:1,pxAt:0};
 return L;
}
// 장면별 시간표 → 셰이더 값
function params(k,t,el){
 const A=[0,0,0,0],B=[0,0,0,0];let V=null;
 if(k===0){A[0]=sm(0,3.2,t)*(1-.15*sm(8.6,10,t));}
 else if(k===1){                                   // 수면의 절단: 1.2 지느러미가 긋고 2.7 물이 솟음
  if(t>.5&&t<1.5){A[0]=-120+(t-.5)/1*1260;A[1]=sm(.5,.75,t)*(1-sm(1.25,1.5,t));}
  A[2]=sm(1.15,1.3,t)*(1-sm(2.6,3.4,t));A[3]=120;B[0]=900;B[1]=sm(1.2,2.6,t);}
 else if(k===2){A[0]=sm(0,1.4,t);A[1]=sm(3.4,4.6,t);A[2]=6+16*sm(1.6,4.2,t);}   // 내려가는 물: 1.6 물이 줄고 3.6 하얗게 마름
 else if(k===3){A[0]=150*sm(2.2,4.4,t)*(1-sm(7.2,9.2,t));A[1]=Math.exp(-Math.pow((t-4.9)/.35,2));}  // 별이 꺼지는 수평선
 else if(k===4){const g=window.YellowWhaleV3&&window.YellowWhaleV3.geo;      // 가라앉는 삼각형
  A[0]=sm(0,2,t);A[1]=sm(2.4,3.6,t);const C=g?g.C:[566,SEA+65];A[2]=C[0];A[3]=C[1];
  V=g?g.VENTS.map(v=>[v.x,v.y+30]):[[566,SEA+40],[340,SEA+128],[792,SEA+116]];}
 return {A,B,V};
}
function tick(el,t){
 if(!el||off()||!(CG.supported&&CG.supported()))return;
 const k=kindOf(el);if(k<0)return;
 if(el.dataset.game||(k>0&&el.dataset.stage!=='0')){if(el.__enc)el.__enc.host.style.display='none';return;}
 const L=layer(el);if(!L)return;L.host.style.display='';
 if(k===4){const rg=el.querySelector('.yw-ring');if(rg&&rg.style.display!=='none')rg.style.display='none';}   // 고리 모양 빛 원 대신 셰이더의 물밑 빛
 const glc=CG._gl(),P=CG._prog('encfx',CG.VQ,F_ENC,[['aP',2]]);if(!glc||!P)return;
 const now=performance.now()/1000,{A,B,V}=params(k,t,el);
 const BB=[0,0,W,H],S=CG._surface(L.gl,BB,{res:.55});CG._quad(P,BB);
 glc.uniform1f(P.u.uT,t);glc.uniform1f(P.u.uR,now);glc.uniform1f(P.u.uK,k);
 glc.uniform4f(P.u.uA,A[0],A[1],A[2],A[3]);glc.uniform4f(P.u.uB,B[0],B[1],B[2],B[3]);
 if(V)glc.uniform2fv(P.u.uV,new Float32Array([].concat(...V)));
 glc.drawArrays(glc.TRIANGLES,0,6);glc.bindVertexArray(null);CG._blit(S);
 particles(L,k,t,A,el);
}
// Canvas 2D: 포자 · 물보라 안개 · 김 · 끌려가는 별빛 · 흙 알갱이
function particles(L,k,t,A,el){
 const c2=L.c2,ctx=L.ctx,ms=performance.now(),SPR=sprites();
 if(ms-L.pxAt>500){const r=c2.getBoundingClientRect();L.px=Math.min(1.5,Math.max(.5,(r.width||W)/W*Math.min(2,window.devicePixelRatio||1)));L.pxAt=ms;}
 const pw=Math.round(W*L.px),ph=Math.round(H*L.px);if(c2.width!==pw||c2.height!==ph){c2.width=pw;c2.height=ph;}
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,pw,ph);ctx.setTransform(L.px,0,0,L.px,0,0);
 let dt=L.lt==null?0:t-L.lt;L.lt=t;if(dt<0){L.parts=[];dt=0;}if(dt>.25)dt=0;
 const R=Math.random,add=o=>{if(L.parts.length<240)L.parts.push(Object.assign({life:0},o));};
 if(dt>0){
  if(k===0){const n=dt*26*A[0];for(let i=0;i<Math.floor(n)+(R()<n%1?1:0);i++)add({x:200+R()*760,y:SEA+4+R()*150,vx:(R()-.5)*6,vy:-6-R()*12,max:3+R()*3,sz:1.2+R()*2.4,img:'spore',al:.75});}
  else if(k===1&&t>2.7&&t<5.4){const n=dt*16;for(let i=0;i<Math.floor(n)+(R()<n%1?1:0);i++)add({x:120+R()*780,y:SEA-6-R()*40,vx:(R()-.5)*14,vy:-10-R()*16,max:2+R()*2,sz:18+R()*30,img:'mist',al:.55});}
  else if(k===2&&t>1.4){const n=dt*10;for(let i=0;i<Math.floor(n)+(R()<n%1?1:0);i++)add({x:R()*W,y:SEA-2,vx:(R()-.5)*8,vy:-14-R()*18,max:2.5+R()*2,sz:14+R()*24,img:'steam',al:.4});}
  else if(k===3&&A[0]>10){const n=dt*8;for(let i=0;i<Math.floor(n)+(R()<n%1?1:0);i++){const x=R()*W;add({x,y:SEA-A[0]*(.9+R()*.6)-10-R()*40,vx:0,vy:20+R()*20,max:1.4+R()*1.2,sz:1+R()*1.4,img:'star',al:.9,sink:SEA-A[0]*.8});}}
  else if(k===4&&t>.5){const n=dt*14,C=[A[2],A[3]];for(let i=0;i<Math.floor(n)+(R()<n%1?1:0);i++){const an=R()*Math.PI*2,rr=200+R()*260;add({x:C[0]+Math.cos(an)*rr,y:C[1]+Math.sin(an)*rr*.32,max:4+R()*3,sz:1+R()*2,img:'dust',al:.7,an,rr,C});}}
 }
 L.parts=L.parts.filter(p=>{p.life+=dt;if(p.life>p.max)return false;const u=p.life/p.max;
  if(p.C){p.an+=dt*(.5+60/Math.max(40,p.rr));p.rr*=1-dt*.22;p.x=p.C[0]+Math.cos(p.an)*p.rr;p.y=p.C[1]+Math.sin(p.an)*p.rr*.32+u*8;}
  else{p.x+=(p.vx||0)*dt+Math.sin(p.life*1.3+p.sz)*4*dt;p.y+=(p.vy||0)*dt;}
  let al=Math.min(1,p.life*2)*(1-u)*p.al;if(p.sink!=null&&p.y>p.sink)al*=Math.max(0,1-(p.y-p.sink)/14);   // 어둠에 닿은 별빛은 꺼짐
  if(al<=.01)return true;ctx.globalAlpha=al;const z=p.sz*(p.img==='mist'||p.img==='steam'?1+u*.8:1);ctx.drawImage(SPR[p.img],p.x-z,p.y-z,z*2,z*2);return true;});
 ctx.globalAlpha=1;
}
window.EncFX={tick};
})();
