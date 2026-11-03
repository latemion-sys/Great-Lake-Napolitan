/* Great Lake v0.3.6 · 망(望)을 감은 작살의 명중 연출 (3망 · 4망 · 5망)
   신(心)은 마음의 힘 — 쓰는 이를 불길 같은 금빛 기운으로 감싸고, 그 힘이 무기 둘레에 '따스한 빛의 고리'(망)로 맺힌다.
   고리가 늘수록 부담이 거의 두 배씩 커지며, 고리를 바깥으로 쏘아 상대의 몸을 날려 버리기도 한다. 望은 '보름달'이기도 하다.
   - 3망: 고리 셋이 상처로 조여 들어가 한 번 터지고, 둘레에 작은 금빛 균열.
   - 4망: 고리 넷이 작살을 밀어 넣은 뒤 하나씩 칼날처럼 바깥으로 쏘아지고, 균열이 가지를 치며 맥동. 짧은 흔들림.
   - 5망: 보름달 원반이 피어난 뒤 고리 다섯이 몸을 꿰뚫고 지나가며 빛의 굴을 남기고, 반대편에 출구 섬광. 짧은 섬광 · 큰 흔들림.
   기법: WebGL2 셰이더(불길 기운 · 보름달 · 충격파 · 빛의 굴 · 균열의 빛) + 절차적 메시(원근이 있는 고리 띠 · 가지 치는 균열)
         + Canvas 2D(꼬리를 끄는 불티 · 떠오르는 빛 조각). 날아가는 동안에는 작살 둘레의 금빛 기운과 불꽃 꼬리.
   HarpoonLauncher.paintHit 를 감싸 3망 이상일 때만 새 연출로 그린다(1 · 2망과 WebGL2가 없을 때는 예전 그대로). */
(function(){
'use strict';
const HL=window.HarpoonLauncher,CG=window.CalGL;
if(!HL||!CG||!HL.paintHit)return;
const SVGNS='http://www.w3.org/2000/svg',XHTML='http://www.w3.org/1999/xhtml',W=960,H=540,RAD=Math.PI/180;
const off=()=>{try{return /[?&]mangfx=0/.test(location.search);}catch(e){return false;}};
const DUR=[1.7,2.7,3.3];
function seeded(n){let x=n>>>0||1;return ()=>((x=(x*1664525+1013904223)>>>0)/4294967296);}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),outE=x=>1-Math.pow(1-clamp(x,0,1),3);

/* ───────── 셰이더 ───────── */
const F_FIELD=`#version 300 es
precision highp float;
in vec2 vP;out vec4 o;
uniform float uS,uT,uK,uThrough,uSeed;uniform vec2 uP,uD;uniform vec4 uCr[32];uniform int uCn;
${CG.NOISE}
float outE(float x){x=clamp(x,0.,1.);return 1.-pow(1.-x,3.);}
void main(){
 vec2 p=vP-uP;float r=length(p),s=uS,K=uK;           // K: 0(3망) 1(4망) 2(5망)
 vec2 n=vec2(-uD.y,uD.x);float al=dot(p,uD),pe=dot(p,n);
 vec3 c=vec3(0.);
 // 희고 차가운 중심(두 번 고동)
 float beat=1.+.6*exp(-pow((s-.1)/.035,2.));
 float cr=mix(7.,14.,K*.5)*beat;c+=vec3(.95,.97,1.)*exp(-r*r/(cr*cr))*exp(-s*mix(6.,3.4,K*.5))*1.1;
 // 불길 같은 금빛 기운: 극좌표에서 바깥으로 일렁이며 타오름
 float ang=atan(p.y,p.x);
 vec2 q=vec2(ang*2.2+uSeed,r*.035-s*3.);q+=vec2(fbm(q*1.6+uT*.4),fbm(q*1.6+3.))*.9;
 float fl=fbm(q*1.7),R0=mix(34.,78.,K*.5)*(.35+.65*outE(s*4.));
 float aura=smoothstep(R0*1.2,R0*.15,r*(.75+.5*fl))*smoothstep(0.,.05,s)*exp(-s*mix(2.2,1.,K*.5));
 c+=mix(vec3(1.,.55,.16),vec3(1.,.86,.5),fl)*aura*(.3+.4*fl);
 // 보름달(望): 4망부터 · 5망은 크게. 테두리가 밝고 속은 은은한 무늬
 if(K>.5){float Rm=mix(30.,52.,K-1.)*outE(s*6.)*(1.+.06*sin(s*9.));
  float md=r/max(Rm,1.),disc=smoothstep(1.02,.97,md);float limb=pow(clamp(md,0.,1.),7.);
  float mo=.8+.2*fbm(p*.08+uSeed);float life=exp(-s*mix(2.6,1.8,K-1.));
  c+=vec3(1.,.95,.84)*disc*(.08+.75*limb)*mo*life;                           // 보름달: 테두리가 또렷하고 속은 옅게
  float halo=exp(-max(md-1.,0.)*5.)*(1.-disc);c+=vec3(1.,.82,.5)*halo*life*.35;
  float rays=pow(fbm(vec2(ang*7.+uSeed,s*.6)),4.)*exp(-max(md-1.,0.)*2.)*(1.-disc);c+=vec3(1.,.86,.6)*rays*life*.6;}
 // 충격파: 빛의 띠(안쪽 따스함 · 바깥 옅음), 5망은 두 겹
 for(int i=0;i<2;i++){if(i==1&&K<1.5)break;float si=s-float(i)*.13;if(si<0.)continue;
  float Rs=12.+mix(160.,560.,K*.5)*outE(si/.55)*(i==1?1.25:1.);float ex=r*(1.+.0*pe)-Rs;
  float band=exp(-ex*ex/(mix(18.,60.,K*.5)))*(.6+.4*fbm(vec2(ang*5.,si*3.)));
  float fo=clamp(1.-si/.6,0.,1.);c+=mix(vec3(1.,.8,.45),vec3(1.,.96,.85),smoothstep(-6.,6.,ex))*band*fo*.45;}
 // 균열: 상처에서 가지를 치며 번지는 금빛 틈
 float dm=1e9,gw=0.;
 for(int i=0;i<32;i++){if(i>=uCn)break;vec4 sg=uCr[i];vec2 a=sg.xy-uP,b=sg.zw-uP;vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-3),0.,1.);
  float d=length(pa-ba*h);dm=min(dm,d);}
 if(uCn>0){float flick=.75+.25*sin(uT*14.+r*.2)*sin(uT*9.+ang*3.);
  float life=K<.5?clamp(1.4-s,0.,1.):(K<1.5?(s<1.9?1.:clamp(1.-(s-1.9)/.8,0.,1.)):clamp(1.-(s-2.2)/1.,0.,1.));
  float pulse=K>.5?.75+.25*sin(s*9.):1.;
  c+=vec3(1.,.9,.62)*exp(-dm*dm/1.1)*life*flick*.95*pulse;c+=vec3(1.,.6,.2)*exp(-dm/5.)*.5*life*pulse;}
 // 5망: 꿰뚫고 지나간 빛의 굴 + 반대편 출구 섬광
 if(K>1.5){float len=1500.,w=mix(26.,6.,clamp(s/1.6,0.,1.))*(1.+.2*fbm(vec2(al*.02-s*8.,0.)));
  float tun=exp(-pe*pe/(w*w))*smoothstep(-20.,10.,al)*smoothstep(len,0.,al)*clamp(1.-s/1.5,0.,1.);
  float flow=.6+.4*fbm(vec2(al*.015-s*14.,pe*.1));c+=mix(vec3(1.,.8,.4),vec3(1.,.97,.9),exp(-pe*pe/(w*w*.15)))*tun*flow*1.1;
  vec2 ep=p-uD*uThrough;float er=length(ep),se=s-.05;
  if(se>0.){float Re=70.*(.3+.7*outE(se*5.));c+=vec3(1.,.88,.6)*exp(-er*er/(Re*Re))*exp(-se*2.8)*.8;}}
 // 화면을 덮는 짧은 섬광
 c+=vec3(1.,.95,.85)*mix(0.,mix(.06,.22,K-1.),step(.5,K))*exp(-s*mix(7.,5.,K*.5));
 float a=clamp(max(c.r,max(c.g,c.b)),0.,1.);
 o=vec4(min(c,vec3(1.5))*min(1.,a),a);
}`;
// 고리 띠 메시: 위치 · (θ, 두께 쪽 -1~1, 생명, 고리 번호)
const V_RING=`#version 300 es
in vec2 aP;in vec4 aA;uniform vec4 uBB;out vec4 vA;
void main(){vA=aA;vec2 q=(aP-uBB.xy)/uBB.zw;gl_Position=vec4(q.x*2.-1.,1.-q.y*2.,0.,1.);}`;
const F_RING=`#version 300 es
precision highp float;
in vec4 vA;out vec4 o;uniform float uT;
${CG.NOISE}
void main(){
 float th=vA.x,sd=vA.y,life=vA.z,id=vA.w;
 float front=.45+.55*(.5+.5*sin(th));                       // 앞쪽(보는 쪽)이 밝고 뒤쪽은 흐림
 float fire=fbm(vec2(th*3.+uT*5.+id*3.,sd*1.5+id));
 float core=exp(-sd*sd*5.),edge=exp(-sd*sd*1.2);
 vec3 c=vec3(1.,.97,.88)*core*1.2+mix(vec3(1.,.55,.15),vec3(1.,.84,.45),fire)*edge*(.5+.7*fire);
 float a=clamp(edge*(.55+.45*fire),0.,1.)*front*life;
 o=vec4(c*a,a);
}`;
// 날아가는 작살(작살 좌표: 날 끝이 x≈3, 뒤가 -x): 날 둘레의 금빛 기운 · 불꽃 꼬리 · (5망) 날 끝의 보름달
const F_FLY=`#version 300 es
precision highp float;
in vec2 vP;out vec4 o;uniform float uT,uN;
${CG.NOISE}
void main(){
 vec2 p=vP;float K=clamp(uN-3.,0.,2.);
 float back=max(-p.x,0.),w=mix(5.,9.,K*.5)+back*.035;
 vec2 q=vec2(p.x*.05+uT*9.,p.y*.18);float n=fbm(q+fbm(q*1.3)*.8);
 float tail=exp(-p.y*p.y/(w*w))*smoothstep(-mix(110.,230.,K*.5),0.,p.x)*smoothstep(14.,0.,p.x)*(.45+.75*n);
 vec3 c=mix(vec3(1.,.5,.12),vec3(1.,.88,.55),n)*tail*.9;
 float tip=exp(-dot(p-vec2(2.,0.),p-vec2(2.,0.))/mix(60.,180.,K*.5));c+=vec3(1.,.95,.85)*tip*(.6+.4*sin(uT*30.));
 if(K>1.5){vec2 m=p-vec2(6.,0.);float md=length(m)/13.,disc=smoothstep(1.02,.9,md);c+=vec3(1.,.95,.82)*disc*(.4+.5*pow(md,5.))+vec3(1.,.8,.5)*exp(-max(md-1.,0.)*2.)*(1.-disc)*.5;}
 float a=clamp(max(c.r,max(c.g,c.b)),0.,1.);
 o=vec4(c*min(1.,a),a);
}`;

/* ───────── 메시 · 균열 ───────── */
let ringData=new Float32Array(8192*6),rn=0;
function rpush(x,y,th,sd,life,id){const o=rn*6;if(o+6>ringData.length){const b=new Float32Array(ringData.length*2);b.set(ringData);ringData=b;}
 ringData[o]=x;ringData[o+1]=y;ringData[o+2]=th;ringData[o+3]=sd;ringData[o+4]=life;ringData[o+5]=id;rn++;}
// 고리 하나: 가운데 c, 작살 방향 d에 수직인 평면에 놓인 원(반지름 R) → 화면에선 기울어진 타원. 두께 w(px)
function ringMesh(cx,cy,d,R,k,w,spin,life,id){
 const n=[-d[1],d[0]],N=56;
 for(let j=0;j<N;j++){
  const t0=j/N*Math.PI*2+spin,t1=(j+1)/N*Math.PI*2+spin;
  const P=(t,s)=>{const rr=R+s*w;return [cx+n[0]*rr*Math.cos(t)+d[0]*rr*k*Math.sin(t),cy+n[1]*rr*Math.cos(t)+d[1]*rr*k*Math.sin(t)];};
  const V=(t,s)=>{const p=P(t,s);rpush(p[0],p[1],t-spin,s,life,id);};
  V(t0,-1);V(t0,1);V(t1,-1);V(t1,-1);V(t0,1);V(t1,1);
 }
}
// 상처에서 가지를 치며 자라는 균열(고정 시드): 각 마디가 드러나는 시각 · 깊이
function crackTree(seed,K,d){
 const r=seeded(seed),segs=[],L=[38,100,140][K],nMain=[4,6,7][K];
 const grow=(x,y,a,len,depth,t0)=>{if(segs.length>=32||len<5)return;
  const l=Math.min(len,9+r()*10),na=a+(r()-.5)*.9,ex=x+Math.cos(na)*l,ey=y+Math.sin(na)*l;
  segs.push({a:[x,y],b:[ex,ey],t:t0,depth});
  grow(ex,ey,na,len-l,depth+1,t0+.04+r()*.03);
  if(r()<.32&&depth<4)grow(ex,ey,na+(r()<.5?-1:1)*(.6+r()*.6),(len-l)*.55,depth+1,t0+.06);};
 const base=Math.atan2(d[1],d[0]);
 for(let i=0;i<nMain;i++)grow(0,0,base+Math.PI/2*(i%2?1:-1)+(r()-.5)*1.6+(i>3?Math.PI*.5:0),L*(.6+r()*.5),0,.02+i*.02);
 return segs;
}

/* ───────── 장면마다의 층 ───────── */
function layer(g){
 let L=g.__mfx;if(L&&L.host.isConnected)return L;
 const host=document.createElementNS(SVGNS,'g');host.setAttribute('class','mfx');host.style.pointerEvents='none';
 g.parentNode.insertBefore(host,g.nextSibling);
 const fo=document.createElementNS(SVGNS,'foreignObject');fo.setAttribute('x','0');fo.setAttribute('y','0');fo.setAttribute('width',W);fo.setAttribute('height',H);fo.setAttribute('class','mfx-2d');
 const c2=document.createElementNS(XHTML,'canvas');c2.setAttribute('style','display:block;width:100%;height:100%');fo.appendChild(c2);
 const gl=document.createElementNS(SVGNS,'g');gl.setAttribute('class','mfx-gl');host.appendChild(gl);host.appendChild(fo);
 L=g.__mfx={host,gl,fo,c2,ctx:c2.getContext('2d'),seed:0,lastS:9,sparks:[],flakes:[],cr:null,lt:0,px:1,pxAt:0};
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
 // 새 명중: 시드 · 균열 · 불티 새로
 if(s<L.lastS-.05||L.K!==K){L.seed=(L.seed*7+13+Math.floor(P[0]))%997+1;L.cr=crackTree(L.seed,K,d);L.sparks=[];L.flakes=[];L.K=K;L.burst=false;}
 L.lastS=s;
 const fo=o.fade!=null&&s>o.fade?Math.max(0,1-(s-o.fade)/.35):1;
 L.host.style.opacity=fo.toFixed(3);
 const now=performance.now()/1000;
 // ── 셰이더: 빛 덩어리 · 보름달 · 충격파 · 균열 · 빛의 굴 ──
 const glc=CG._gl();const PF=CG._prog('mfxField',CG.VQ,F_FIELD,[['aP',2]]),PR=CG._prog('mfxRing',V_RING,F_RING,[['aP',2],['aA',4]]);
 if(!glc||!PF||!PR)return false;
 const BB=[0,0,W,H],S=CG._surface(L.gl,BB,{res:.7});
 CG._quad(PF,BB);
 glc.uniform1f(PF.u.uS,s);glc.uniform1f(PF.u.uT,now);glc.uniform1f(PF.u.uK,K);glc.uniform1f(PF.u.uThrough,o.through||120);glc.uniform1f(PF.u.uSeed,L.seed*.37);
 glc.uniform2f(PF.u.uP,P[0],P[1]);glc.uniform2f(PF.u.uD,d[0],d[1]);
 const cr=new Float32Array(128);let cn=0;
 L.cr.forEach(sg=>{const k=clamp((s-sg.t)/.05,0,1);if(k<=0||cn>=32)return;const bx=sg.a[0]+(sg.b[0]-sg.a[0])*k,by=sg.a[1]+(sg.b[1]-sg.a[1])*k;
  cr.set([P[0]+sg.a[0],P[1]+sg.a[1],P[0]+bx,P[1]+by],cn*4);cn++;});
 glc.uniform4fv(PF.u.uCr,cr);glc.uniform1i(PF.u.uCn,cn);
 glc.drawArrays(glc.TRIANGLES,0,6);
 // ── 고리 메시 ──
 rn=0;
 for(let i=0;i<tier;i++){
  const si=s-i*(K===1?.08:.05);if(si<0)continue;
  let R,fwd,life,w=[2.6,3.2,3.8][K],k=.34*(1+.28*Math.sin(si*22+i));
  if(K===0){   // 3망: 날 둘레에서 상처로 조여 든 뒤 한 번 터져 번짐
   R=si<.14?22-16*outE(si/.14):6+60*outE((si-.14)/.5);fwd=i*4;life=si<.14?1:Math.max(0,1-(si-.14)/.6);}
  else if(K===1){   // 4망: 작살을 밀어 넣으며 파고든 뒤, 하나씩 칼날처럼 바깥으로
   const push=outE(si/.12);R=si<.18?18-8*push:10+[150,130,170,120][i%4]*outE((si-.18)/.42);fwd=i*5+14*push;life=si<.18?1:Math.max(0,1-(si-.18)/.75);w=si<.18?w:w*(1-.5*outE((si-.18)/.4));k*=si<.18?1:.6;}
  else{   // 5망: 몸을 꿰뚫고 앞으로 지나가며 커짐
   R=14+60*outE(si/.4)*(1+i*.12);fwd=si*560+i*18;life=Math.max(0,1-si/1.15);}
  if(life<=0)continue;
  ringMesh(P[0]+d[0]*fwd,P[1]+d[1]*fwd,d,R,k,w,now*3+i,life,i);
 }
 if(rn){glc.useProgram(PR.p);glc.bindVertexArray(PR.vao);glc.bindBuffer(glc.ARRAY_BUFFER,PR.buf);glc.bufferData(glc.ARRAY_BUFFER,ringData.subarray(0,rn*6),glc.DYNAMIC_DRAW);
  glc.uniform4f(PR.u.uBB,0,0,W,H);glc.uniform1f(PR.u.uT,now);glc.drawArrays(glc.TRIANGLES,0,rn);}
 glc.bindVertexArray(null);CG._blit(S);
 // ── Canvas 2D: 불티 · 빛 조각 ──
 const c2=L.c2,ctx=L.ctx,t=performance.now();
 if(t-L.pxAt>500){const r2=c2.getBoundingClientRect();L.px=Math.min(1.6,Math.max(.5,(r2.width||W)/W*Math.min(2,window.devicePixelRatio||1)));L.pxAt=t;}
 const pw=Math.round(W*L.px),ph=Math.round(H*L.px);if(c2.width!==pw||c2.height!==ph){c2.width=pw;c2.height=ph;}
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,pw,ph);ctx.setTransform(L.px,0,0,L.px,0,0);ctx.globalCompositeOperation='lighter';
 let dt=s-(L.ls==null?s:L.ls);L.ls=s;if(dt<0||dt>.3)dt=0;
 const rnd=Math.random;
 if(!L.burst){L.burst=true;const nS=[40,75,120][K],sp=[180,300,460][K],fw=[.2,.45,.9][K];
  for(let i=0;i<nS;i++){let ang=rnd()*Math.PI*2;if(rnd()<fw)ang=Math.atan2(d[1],d[0])+(rnd()-.5)*1.2;const v=sp*(.25+rnd()*.75);
   L.sparks.push({x:P[0],y:P[1],vx:Math.cos(ang)*v,vy:Math.sin(ang)*v-40*rnd(),life:0,max:.45+rnd()*[.6,.9,1.2][K],sz:.8+rnd()*[1.4,1.8,2.4][K]});}
  for(let i=0;i<[6,10,14][K];i++){const ang=rnd()*Math.PI*2,v=30+rnd()*70;L.flakes.push({x:P[0],y:P[1],vx:Math.cos(ang)*v,vy:Math.sin(ang)*v*.6-20,life:0,max:1.4+rnd()*1.2,rot:rnd()*6,vr:(rnd()-.5)*5,sz:3+rnd()*4});}}
 // 균열에서 이따금 튀는 불티
 if(K>0&&dt>0&&s<DUR[K]-.8&&L.cr.length){const m=Math.round(dt*[0,30,50][K]+rnd()*.5);for(let i=0;i<m;i++){const sg=L.cr[Math.floor(rnd()*L.cr.length)];if(s<sg.t)continue;
  L.sparks.push({x:P[0]+sg.b[0],y:P[1]+sg.b[1],vx:(rnd()-.5)*60,vy:-30-rnd()*80,life:0,max:.4+rnd()*.5,sz:.6+rnd()*1.1});}}
 ctx.lineCap='round';
 L.sparks=L.sparks.filter(p=>{p.life+=dt;if(p.life>p.max)return false;p.vx*=1-1.6*dt;p.vy=p.vy*(1-1.6*dt)+160*dt;const px=p.x,py=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;
  const k=p.life/p.max,al=(1-k);const hot=k<.35;
  ctx.strokeStyle=hot?'rgba(255,246,220,'+(al*.95).toFixed(3)+')':'rgba(255,'+Math.round(170-80*k)+','+Math.round(70-50*k)+','+(al*.85).toFixed(3)+')';
  ctx.lineWidth=p.sz*(1-k*.6);ctx.beginPath();ctx.moveTo(px-p.vx*.03,py-p.vy*.03);ctx.lineTo(p.x,p.y);ctx.stroke();return true;});
 L.flakes=L.flakes.filter(f=>{f.life+=dt;if(f.life>f.max)return false;f.vx*=1-1.2*dt;f.vy=f.vy*(1-1.2*dt)-14*dt;f.x+=f.vx*dt+Math.sin(f.life*3+f.rot)*10*dt;f.y+=f.vy*dt;f.rot+=f.vr*dt;
  const k=f.life/f.max,al=Math.min(1,f.life*6)*(1-k);ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rot);
  const gr=ctx.createRadialGradient(0,0,0,0,0,f.sz);gr.addColorStop(0,'rgba(255,248,226,'+(al*.9).toFixed(3)+')');gr.addColorStop(1,'rgba(255,200,110,0)');ctx.fillStyle=gr;
  ctx.beginPath();ctx.ellipse(0,0,f.sz,f.sz*.42,0,0,Math.PI*2);ctx.fill();ctx.restore();return true;});
 ctx.globalCompositeOperation='source-over';
 // 화면 흔들림(4망 · 5망)
 if(svg){const amp=[0,3.4,8.5][K]*Math.exp(-s*7);svg.style.transform=amp>.15?'translate('+(Math.sin(s*92)*amp).toFixed(2)+'px,'+(Math.cos(s*71)*amp*.7).toFixed(2)+'px)':'';L.shook=true;}
 return true;
}
let ok=null;
function supported(){if(ok!==null)return ok;ok=!off()&&!!(CG.supported&&CG.supported());return ok;}
const orig=HL.paintHit;
HL.paintHit=function(el,o){
 const tier=o&&o.tier|0;
 if(tier>=3&&supported()){
  orig.call(this,el,Object.assign({},o,{s:-1}));   // 예전 그림은 숨김
  try{if(paint(el,o))return;}catch(e){console.warn('[mang-fx]',e);ok=false;}
 }
 const g=el&&el.querySelector&&el.querySelector('.hl-hit');if(g&&g.__mfx)hide(g.__mfx);
 return orig.call(this,el,o);
};

/* ───────── 날아가는 작살: 날 둘레의 금빛 기운 · 불꽃 꼬리 ───────── */
function visible(e){for(let n=e;n&&n.nodeType===1;n=n.parentNode){if(n.getAttribute&&(n.getAttribute('opacity')==='0'||n.style.opacity==='0'||n.style.display==='none'))return false;if(n.tagName==='svg')break;}return true;}
const FB=[-240,-26,262,52];
function flyFrame(){
 try{const n=HL.tier?HL.tier():0;
  if(n>=3&&supported()){const glc=CG._gl(),PQ=CG._prog('mfxFly',CG.VQ,F_FLY,[['aP',2]]);
   document.querySelectorAll('.hl-fly').forEach(f=>{const host=f.__mfxh||(f.__mfxh=(()=>{const h=document.createElementNS(SVGNS,'g');h.setAttribute('class','mfx-fly');f.insertBefore(h,f.firstChild);return h;})());
    if(!visible(f)||!PQ||!glc){host.style.display='none';return;}host.style.display='';
    const S=CG._surface(host,FB,{res:.8});CG._quad(PQ,FB);glc.uniform1f(PQ.u.uT,performance.now()/1000);glc.uniform1f(PQ.u.uN,n);
    glc.drawArrays(glc.TRIANGLES,0,6);glc.bindVertexArray(null);CG._blit(S);});}
  else document.querySelectorAll('.mfx-fly').forEach(h=>h.style.display='none');
 }catch(e){}
 requestAnimationFrame(flyFrame);
}
requestAnimationFrame(flyFrame);
window.MangFX={paint,supported};
})();
