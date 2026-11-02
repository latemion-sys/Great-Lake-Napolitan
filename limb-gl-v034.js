/* Great Lake v0.3.4 · 재앙 고래의 팔 · 날개를 셰이더로 칠하기
   - 붉은 고래 팔: 뼈대(어깨→팔꿈치→손목 · 손바닥 · 다섯 손가락)를 따라 매 프레임 삼각형 띠 메시를 만들고
     (길이 방향 s · 둘레 방향 v), 살결 · 빨판 · 혈관 결의 맥박 · 젖은 윤기를 프래그먼트 셰이더로 그린다.
   - 까만 고래 날개: 날개 앞전 · 뒷전 곡선 사이를 메시로 채우고, 완전한 검정 위에 앞전의 차가운 테 · 흘러내리는 물막,
     등불이 닿는 자리에서만 드러나는 젖은 잔결 · 막의 결을 그린다. 실루엣 둘레로 별빛을 빨아들이는 어두운 띠.
   - 하나의 WebGL2 문맥에서 그린 뒤, 각 팔 · 날개 묶음 안에 넣은 foreignObject 캔버스로 옮겨 그린다.
     그래서 장면 속 앞뒤 순서 · 물에 잘리는 자리 · 흐림 효과는 기존 SVG와 똑같이 유지된다.
   - WebGL2가 없거나(또는 foreignObject 속 캔버스 위치가 어긋나는 사파리 계열) 실패하면 기존 SVG 그림을 그대로 쓴다. */
(function(){
'use strict';
const SVGNS='http://www.w3.org/2000/svg',XHTML='http://www.w3.org/1999/xhtml';
const ua=navigator.userAgent||'';
const webkitOnly=(/AppleWebKit/.test(ua)&&!/Chrome\/|Chromium\/|Edg\//.test(ua))||/CriOS|FxiOS|EdgiOS/.test(ua);
const off=()=>{try{return window.LIMB_GL_OFF||/[?&]limbgl=0/.test(location.search);}catch(e){return false;}};
const MAXPX=1100;
let gl=null,cv=null,ok=null,PA=null,PW=null,bufA=null,bufW=null,vaoA=null,vaoW=null,armData=new Float32Array(8192*10);

/* ───────── 셰이더 ───────── */
const NOISE=`
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}`;
// 팔: 위치 · (s, v, u, 반폭) · 2D 법선 · 부위(0 팔 · 1 손바닥 · 2 손가락)
const VA=`#version 300 es
in vec2 aP;in vec4 aA;in vec2 aN;in vec2 aK;
uniform vec4 uBB;
out vec2 vP;out float vS,vV,vU,vHW,vK,vC;out vec2 vN;
void main(){vP=aP;vS=aA.x;vV=aA.y;vU=aA.z;vHW=aA.w;vN=aN;vK=aK.x;vC=aK.y;
 vec2 q=(aP-uBB.xy)/uBB.zw;gl_Position=vec4(q.x*2.-1.,1.-q.y*2.,0.,1.);}`;
const FA=`#version 300 es
precision highp float;
in vec2 vP;in float vS,vV,vU,vHW,vK,vC;in vec2 vN;
uniform float uT,uSide,uHeat,uPx;
out vec4 o;
${NOISE}
void main(){
 float av=abs(vV),aa=1.6/max(vHW*uPx,1.);
 float alpha=1.-smoothstep(1.-aa,1.,av);
 if(alpha<=.002)discard;
 float vv=clamp(vV,-.995,.995),nz=sqrt(1.-vv*vv);
 vec3 N=normalize(vec3(vN*vv,nz));
 vec3 L=normalize(vec3(.42,-.74,.55));
 float dif=max(dot(N,L),0.);
 float th=asin(vv);
 vec2 sp=vec2(vS,th*vHW);                 // 피부 위 좌표
 // 살빛: 깊은 진홍 → 붉은 살 → 젖은 밝은 면
 float bl=fbm(sp*.045),pt=fbm(sp*.018+7.),po=vn(sp*.9);
 vec3 col=mix(vec3(.11,.006,.022),vec3(.54,.045,.085),smoothstep(0.,.66,dif));
 col=mix(col,vec3(.86,.22,.22),smoothstep(.62,1.,dif)*.5);
 col*=.7+.5*bl;
 col=mix(col,vec3(.2,.02,.07),smoothstep(.55,.8,pt)*.45);                 // 검붉은 얼룩
 col*=.94+.08*po;                                                           // 잔 땀구멍
 col*=1.-.18*pow(abs(sin(th*vHW*.16+fbm(sp*.03)*3.)),12.)*step(vK,.5);     // 길게 뻗은 힘줄 골
 col+=vec3(.22,.015,.03)*max(N.y,0.)*.7;   // 아래쪽에 비치는 붉은 물빛
 // 잔주름 · 팔꿈치 · 손가락 마디 주름
 col*=.88+.16*fbm(vec2(vS*.2,th*vHW*.06));
 if(vK<.5){float e=exp(-pow((vU-.5)/.04,2.));col*=1.-.42*e*pow(.5+.5*sin(vS*.62+fbm(sp*.12)*2.4),3.);}
 if(vK>1.5){float f=abs(fract(vU*3.+.5)-.5);col*=1.-.45*exp(-f*f/.0025)*step(.15,vU)*step(vU,.92);}
 // 혈관 결: 어깨에서 손끝으로 흐르는 느린 맥박(속에서 데워지는 열)
 float r=1.-abs(fbm(vec2(vS*.011,th*vHW*.065)+vec2(3.1,uT*.015))*2.-1.);
 float vein=smoothstep(.9,.985,r)*smoothstep(.15,.6,nz)*(vK<1.5?1.:.4);
 float pulse=pow(.5+.5*sin(vS*.032-uT*2.3),3.);
 col=mix(col,vec3(.2,.0,.045),vein*.55);
 col+=vec3(1.,.3,.09)*vein*pulse*(.2+.32*uHeat);
 // 빨판(손바닥 쪽): 둘레 각 위에 줄지어 생성. 손끝 쪽으로 갈수록 작아짐
 float tp=-uSide*th;                         // 손바닥 쪽 둘레 각(+)
 bool zone=(vK<.5&&vU>.4)||vK>.5;
 float q=9.;vec2 bd=vec2(0.);
 if(zone){
  float sz=vK<.5?mix(1.,.6,smoothstep(.4,1.,vU)):(vK<1.5?.9:mix(1.,.7,vU));
  float rr=vHW*(vK<.5?.36:(vK<1.5?.2:.5))*sz;
  float spc=rr*2.7;
  for(int i=0;i<3;i++){
   float row=vK<.5?(i==0?.34:(i==1?1.08:-9.)):(vK<1.5?(i==0?0.:(i==1?.62:-.62)):(i==0?.42:-9.));
   if(row<-5.)continue;
   float of=(i==1?.5:0.);
   float ds=(fract(vC+of)-.5)*spc;
   vec2 d=vec2(ds,(tp-row)*vHW);
   float qq=length(d)/rr;if(qq<q){q=qq;bd=d/rr;}
  }
 }
 if(q<1.5){
  // 빨판 하나를 작은 둔덕+컵으로 보고 빛 방향에 따라 한쪽 벽이 밝고 반대쪽이 그늘지게
  vec2 ld=normalize(vec2(-.5,-.85));float side=q>.001?dot(bd/q,ld):0.;
  float ring=smoothstep(1.05,.84,q)*smoothstep(.4,.64,q);
  float cup=smoothstep(.62,.42,q);
  float swell=smoothstep(1.5,1.02,q)*(1.-smoothstep(.95,1.05,q));
  col*=1.-.22*swell*(.5-.5*side);                                            // 부푼 살의 그늘(빛 반대쪽)
  col+=vec3(.5,.08,.09)*swell*max(side,0.)*.25*dif;
  vec3 rimC=mix(vec3(.62,.16,.18),vec3(.9,.48,.46),.5+.5*side)*(.45+.65*dif);
  col=mix(col,rimC,ring*.78);                                                 // 도톰한 테(빛 쪽이 밝음)
  vec3 wall=mix(vec3(.02,0.,.006),vec3(.42,.04,.08),smoothstep(.22,.62,q)*(.45+.55*max(-side,0.)*smoothstep(.3,.5,q)));
  col=mix(col,wall,cup);                                                      // 깊은 컵(빛 반대쪽 안벽이 비침)
  col+=vec3(1.,.84,.8)*ring*pow(max(side,0.),2.)*pow(dif,2.)*.28;            // 테 위의 젖은 반짝임
 }
 // 젖은 윤기: 길게 늘어지며 천천히 흘러내림
 vec3 H=normalize(L+vec3(0.,0.,1.));
 float spec=pow(max(dot(N,H),0.),34.);
 float wet=.5+.5*smoothstep(.42,.74,fbm(vec2(th*vHW*.07,vS*.014+uT*.22)));
 col+=vec3(1.,.84,.8)*spec*.5*wet;
 // 살을 통과한 빛처럼 붉게 비치는 가장자리
 col+=vec3(.92,.13,.1)*pow(1.-nz,2.3)*.42;
 if(vK<.5)col*=mix(.42,1.,smoothstep(0.,.12,vU));   // 물속 뿌리 쪽은 어둡게
 o=vec4(col*alpha,alpha);
}`;
// 날개: 위치 · (u 밑동→끝, v 앞전→뒷전, 앞전에서의 거리, 바깥 띠 0~1)
const VW=`#version 300 es
in vec2 aP;in vec4 aA;in float aW;
uniform vec4 uBB;
out vec2 vP;out float vU,vV,vDL,vH,vW;
void main(){vP=aP;vU=aA.x;vV=aA.y;vDL=aA.z;vH=aA.w;vW=aW;vec2 q=(aP-uBB.xy)/uBB.zw;gl_Position=vec4(q.x*2.-1.,1.-q.y*2.,0.,1.);}`;
const FW=`#version 300 es
precision highp float;
in vec2 vP;in float vU,vV,vDL,vH,vW;
uniform float uT,uFog,uWet,uLampK,uLampR,uPx,uLitK,uLitR;uniform vec2 uLamp,uLit;uniform vec3 uLitC;
out vec4 o;
${NOISE}
void main(){
 // 등불 · 미끼 · 부표 불빛이 닿는 정도
 float ld=length(vP-uLit)/uLitR,lk=uLitK*exp(-ld*ld*1.5);
 if(vH>0.){   // 둘레의 별빛 · 물빛을 빨아들이는 띠(빛이 닿는 자리는 젖은 가장자리가 번져 빛남)
  float aa=1.4/max(30.*uPx,1.);
  float a=mix(1.,.46,smoothstep(0.,aa,vH))*pow(1.-vH,1.7)*(1.-uFog*.55);
  vec3 gl=uLitC*lk*pow(1.-vH,2.6)*.85;
  o=vec4(gl,a);return;
 }
 float ed=min(vDL,max(vW-vDL,0.));
 vec3 col=vec3(0.);
 // 앞전의 아주 얇은 차가운 달빛 테
 col+=vec3(.55,.66,.8)*exp(-vDL/4.)*smoothstep(.06,.5,vU)*.2;
 // 앞전 아래로 흘러내리는 물막
 float n=fbm(vec2(vDL*.045,vP.y*.013+uT*.55));
 col+=vec3(.6,.72,.86)*smoothstep(.6,.84,n)*exp(-vDL/50.)*uWet*.13;
 // 등불이 닿는 자리에서만: 젖은 잔결 · 밑동에서 끝으로 뻗는 막의 결
 float d=length(vP-uLamp)/uLampR,lit=uLampK*exp(-d*d*2.);
 if(lit>.003){
  float b=fbm(vP*.05),g=fbm(vP*.21+3.);
  float ribs=pow(abs(sin(vV*28.+b*2.2)),14.)*smoothstep(.08,.4,vU);
  vec3 lc=vec3(1.,.77,.44);
  col+=lc*lit*(.02+.12*b*b+.05*g+.08*ribs);
  col+=lc*lit*exp(-vDL/7.)*.32;
 }
 if(lk>.003){
  float b=fbm(vP*.05),ribs=pow(abs(sin(vV*28.+b*2.2)),14.)*smoothstep(.08,.4,vU);
  col+=uLitC*lk*(exp(-ed/13.)*.95+.015+.07*ribs+.07*b*b);
 }
 col=mix(col,vec3(.13,.19,.26),uFog*.5);
 o=vec4(col,1.);
}`;

function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn('[limb-gl]',gl.getShaderInfoLog(s));return null;}return s;}
function prog(vs,fs){const v=sh(gl.VERTEX_SHADER,vs),f=sh(gl.FRAGMENT_SHADER,fs);if(!v||!f)return null;const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))return null;
 const u={};['uBB','uT','uSide','uHeat','uPx','uFog','uWet','uLampK','uLampR','uLamp','uLit','uLitK','uLitR','uLitC'].forEach(k=>u[k]=gl.getUniformLocation(p,k));return {p,u};}
function init(){
 if(ok!==null)return ok;ok=false;
 if(webkitOnly||off())return false;
 try{
  cv=document.createElement('canvas');cv.width=cv.height=64;
  gl=cv.getContext('webgl2',{alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true,antialias:false,depth:false,stencil:false});
  if(!gl)return false;
  PA=prog(VA,FA);PW=prog(VW,FW);if(!PA||!PW)return false;
  bufA=gl.createBuffer();vaoA=gl.createVertexArray();gl.bindVertexArray(vaoA);gl.bindBuffer(gl.ARRAY_BUFFER,bufA);
  const st=10*4;[['aP',2,0],['aA',4,8],['aN',2,24],['aK',2,32]].forEach(([n,c,o])=>{const l=gl.getAttribLocation(PA.p,n);if(l>=0){gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,c,gl.FLOAT,false,st,o);}});
  bufW=gl.createBuffer();vaoW=gl.createVertexArray();gl.bindVertexArray(vaoW);gl.bindBuffer(gl.ARRAY_BUFFER,bufW);
  const sw=7*4;[['aP',2,0],['aA',4,8],['aW',1,24]].forEach(([n,c,o])=>{const l=gl.getAttribLocation(PW.p,n);if(l>=0){gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,c,gl.FLOAT,false,sw,o);}});
  const w=wingMesh();gl.bufferData(gl.ARRAY_BUFFER,w.data,gl.STATIC_DRAW);WM=w;
  gl.bindVertexArray(null);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();ok=false;document.querySelectorAll('.lgl').forEach(g=>g.classList.remove('lgl'));});
  ok=true;
 }catch(e){ok=false;}
 return ok;
}

/* ───────── 캔버스 자리: 그룹 안의 foreignObject ───────── */
function surface(g,bb,host){
 let s=g.__lgl;
 if(!s){
  const fo=document.createElementNS(SVGNS,'foreignObject');fo.setAttribute('class','lgl-fo');
  const c=document.createElementNS(XHTML,'canvas');c.setAttribute('style','display:block;width:100%;height:100%');
  fo.appendChild(c);(host||g).insertBefore(fo,(host||g).firstChild);
  s=g.__lgl={fo,c,ctx:c.getContext('2d'),at:0,sc:1,host:host||g};
  (host||g).classList.add('lgl');
 }
 const t=performance.now();
 if(t-s.at>400){let m=null;try{m=g.getScreenCTM();}catch(e){}s.sc=m?Math.max(.05,Math.hypot(m.a,m.b)):1;s.at=t;}
 let px=s.sc*Math.min(2,window.devicePixelRatio||1);
 px=Math.min(px,MAXPX/bb[2],MAXPX/bb[3]);
 const pw=Math.max(2,Math.ceil(bb[2]*px)),ph=Math.max(2,Math.ceil(bb[3]*px));
 const fo=s.fo;fo.setAttribute('x',bb[0].toFixed(1));fo.setAttribute('y',bb[1].toFixed(1));fo.setAttribute('width',bb[2].toFixed(1));fo.setAttribute('height',bb[3].toFixed(1));
 if(s.c.width!==pw||s.c.height!==ph){s.c.width=pw;s.c.height=ph;}
 if(cv.width<pw||cv.height<ph){cv.width=Math.max(cv.width,pw);cv.height=Math.max(cv.height,ph);}
 gl.viewport(0,0,pw,ph);gl.scissor(0,0,pw,ph);gl.enable(gl.SCISSOR_TEST);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
 return {s,pw,ph,px};
}
function blit(S){const {s,pw,ph}=S;s.ctx.clearRect(0,0,pw,ph);s.ctx.drawImage(cv,0,cv.height-ph,pw,ph,0,0,pw,ph);}
function drop(g){const s=g&&g.__lgl;if(!s)return;try{s.fo.remove();}catch(e){}(s.host||g).classList.remove('lgl');g.__lgl=null;}

/* ───────── 팔 메시 ───────── */
const EXP=1.07;
let nV=0;
function push(x,y,s,v,u,hw,nx,ny,k,c){const o=nV*10;if(o+10>armData.length){const b=new Float32Array(armData.length*2);b.set(armData);armData=b;}
 armData[o]=x;armData[o+1]=y;armData[o+2]=s;armData[o+3]=v;armData[o+4]=u;armData[o+5]=hw;armData[o+6]=nx;armData[o+7]=ny;armData[o+8]=k;armData[o+9]=c;nV++;}
function tubeMesh(spine,widths,k,cap,bb){
 let P=spine.slice(),Wd=widths.slice();
 if(cap&&P.length>1){const a=P[P.length-2],b=P[P.length-1],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,tx=(b[0]-a[0])/l,ty=(b[1]-a[1])/l,we=Wd[Wd.length-1];
  for(let j=1;j<=5;j++){const f=j/5;P.push([b[0]+tx*we*.5*f*.96,b[1]+ty*we*.5*f*.96]);Wd.push(Math.max(.6,we*Math.sqrt(Math.max(0,1-f*f))));}}
 const n=P.length,S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
 const tot=S[n-1]||1,L=[],R=[],NN=[],C=[0];
 const RR=(u,hw)=>{const sz=k<.5?(1-.4*Math.min(1,Math.max(0,(u-.4)/.6))):(k<1.5?.9:1-.3*u);return Math.max(.4,hw*(k<.5?.36:(k<1.5?.2:.5))*sz*2.7);};
 for(let i=1;i<n;i++)C.push(C[i-1]+(S[i]-S[i-1])/RR(S[i]/tot,Wd[i]/2));
 for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
  const nx=-dy,ny=dx,hw=Wd[i]/2*EXP;NN.push([nx,ny]);L.push([P[i][0]+nx*hw,P[i][1]+ny*hw]);R.push([P[i][0]-nx*hw,P[i][1]-ny*hw]);
  bb[0]=Math.min(bb[0],L[i][0],R[i][0]);bb[1]=Math.min(bb[1],L[i][1],R[i][1]);bb[2]=Math.max(bb[2],L[i][0],R[i][0]);bb[3]=Math.max(bb[3],L[i][1],R[i][1]);}
 for(let i=0;i<n-1;i++){
  const V=(j,side)=>{const p=side>0?L[j]:R[j];push(p[0],p[1],S[j],side*EXP,S[j]/tot,Wd[j]/2,NN[j][0],NN[j][1],k,C[j]);};
  V(i,1);V(i,-1);V(i+1,1);V(i+1,1);V(i,-1);V(i+1,-1);
 }
}
function armGeom(A,o){
 nV=0;const bb=[1e9,1e9,-1e9,-1e9];
 tubeMesh(A.spine,A.widths,0,false,bb);
 if(A.palmSpine){const s2=smooth(A.palmSpine);tubeMesh(s2,resampleW(A.palmW,s2.length),1,true,bb);}
 (A.fspines||[]).forEach((sp,i)=>{if(A.fws&&A.fws[i]){const s2=smooth(sp),w2=resampleW(A.fws[i],s2.length).map(x=>x*1.32);tubeMesh(s2,w2,2,true,bb);}});
 return [bb[0]-2,bb[1]-2,bb[2]-bb[0]+4,bb[3]-bb[1]+4];
}
// 손가락 마디가 꺾인 점들을 부드러운 곡선으로(캐트멀-롬 3분할)
function smooth(P){if(P.length<3)return P;const o=[];const g=i=>P[Math.max(0,Math.min(P.length-1,i))];
 for(let i=0;i<P.length-1;i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);for(let j=0;j<3;j++){const t=j/3,t2=t*t,t3=t2*t;
  o.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);}}
 o.push(P[P.length-1]);return o;}
function resampleW(w,n){const o=[];for(let i=0;i<n;i++){const f=i/(n-1)*(w.length-1),a=Math.floor(f),b=Math.min(w.length-1,a+1);o.push(w[a]+(w[b]-w[a])*(f-a));}return o;}
let T0=performance.now();
function arm(g,A,o){
 if(!init()||!g||!A||!A.spine){drop(g);return false;}
 try{
  const bb=armGeom(A,o);if(!(bb[2]>0&&bb[3]>0)||nV<3){return false;}
  const S=surface(g,bb);
  gl.useProgram(PA.p);gl.bindVertexArray(vaoA);gl.bindBuffer(gl.ARRAY_BUFFER,bufA);gl.bufferData(gl.ARRAY_BUFFER,armData.subarray(0,nV*10),gl.DYNAMIC_DRAW);
  gl.uniform4f(PA.u.uBB,bb[0],bb[1],bb[2],bb[3]);gl.uniform1f(PA.u.uT,(performance.now()-T0)/1000);gl.uniform1f(PA.u.uSide,o.side||1);
  let heat=0;try{heat=Math.max(0,Math.min(1,(+state.redHeat024||0)/100));}catch(e){}
  gl.uniform1f(PA.u.uHeat,heat);gl.uniform1f(PA.u.uPx,S.px);
  gl.drawArrays(gl.TRIANGLES,0,nV);gl.bindVertexArray(null);
  blit(S);return true;
 }catch(e){drop(g);return false;}
}

/* ───────── 날개 메시(날개 끝 옆모습, y=0이 수면) ───────── */
let WM=null;
const WL=[[[-230,20],[-226,-80],[-186,-210],[-104,-318]],[[-104,-318],[-52,-386],[26,-436],[104,-448]],[[104,-448],[134,-452],[150,-440],[140,-428]]];
const WT=[[[60,20],[26,-6],[-2,-36],[-10,-70]],[[-10,-70],[-18,-104],[-6,-136],[-10,-176]],[[-10,-176],[-14,-226],[-4,-276],[18,-318]],[[18,-318],[46,-372],[92,-410],[140,-428]]];
function cub(c,t){const a=1-t;return [a*a*a*c[0][0]+3*a*a*t*c[1][0]+3*a*t*t*c[2][0]+t*t*t*c[3][0],a*a*a*c[0][1]+3*a*a*t*c[1][1]+3*a*t*t*c[2][1]+t*t*t*c[3][1]];}
function resample(cs,N){const pts=[];cs.forEach((c,ci)=>{for(let j=ci?1:0;j<=40;j++)pts.push(cub(c,j/40));});
 const S=[0];for(let i=1;i<pts.length;i++)S.push(S[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
 const out=[],tot=S[S.length-1];let k=0;for(let i=0;i<N;i++){const s=tot*i/(N-1);while(k<S.length-2&&S[k+1]<s)k++;const f=(s-S[k])/((S[k+1]-S[k])||1);out.push([pts[k][0]+(pts[k+1][0]-pts[k][0])*f,pts[k][1]+(pts[k+1][1]-pts[k][1])*f]);}
 return out;}
const HALO=30;
function wingMesh(){
 const N=56,Lp=resample(WL,N),Tp=resample(WT,N),d=[];const bb=[1e9,1e9,-1e9,-1e9];
 const P=(p,u,v,dl,h,w)=>{d.push(p[0],p[1],u,v,dl,h,w);bb[0]=Math.min(bb[0],p[0]);bb[1]=Math.min(bb[1],p[1]);bb[2]=Math.max(bb[2],p[0]);bb[3]=Math.max(bb[3],p[1]);};
 const W=Lp.map((p,i)=>Math.hypot(p[0]-Tp[i][0],p[1]-Tp[i][1]));
 // 안쪽 면
 for(let i=0;i<N-1;i++){const u0=i/(N-1),u1=(i+1)/(N-1);
  P(Lp[i],u0,0,0,0,W[i]);P(Tp[i],u0,1,W[i],0,W[i]);P(Lp[i+1],u1,0,0,0,W[i+1]);P(Lp[i+1],u1,0,0,0,W[i+1]);P(Tp[i],u0,1,W[i],0,W[i]);P(Tp[i+1],u1,1,W[i+1],0,W[i+1]);}
 // 둘레의 띠(앞전 · 뒷전 바깥쪽)
 const out=(E,O)=>E.map((p,i)=>{const a=E[Math.max(0,i-1)],b=E[Math.min(E.length-1,i+1)];let tx=b[0]-a[0],ty=b[1]-a[1];const l=Math.hypot(tx,ty)||1;let nx=-ty/l,ny=tx/l;
  const ox=p[0]-O[i][0],oy=p[1]-O[i][1];if(nx*ox+ny*oy<0){nx=-nx;ny=-ny;}if(i===E.length-1){const c=Math.hypot(tx,ty)||1;nx=tx/c;ny=ty/c;}return [p[0]+nx*HALO,p[1]+ny*HALO];});
 [[Lp,Tp,0],[Tp,Lp,1]].forEach(([E,O,v])=>{const Q=out(E,O);
  for(let i=0;i<N-1;i++){const u0=i/(N-1),u1=(i+1)/(N-1),dl0=v?W[i]:0,dl1=v?W[i+1]:0;
   P(E[i],u0,v,dl0,0,W[i]);P(Q[i],u0,v,dl0,1,W[i]);P(E[i+1],u1,v,dl1,0,W[i+1]);P(E[i+1],u1,v,dl1,0,W[i+1]);P(Q[i],u0,v,dl0,1,W[i]);P(Q[i+1],u1,v,dl1,1,W[i+1]);}});
 return {data:new Float32Array(d),n:d.length/7,bb:[bb[0]-1,bb[1]-1,bb[2]-bb[0]+2,bb[3]-bb[1]+2]};
}
// g: 날개 묶음(transform 있는 g), host: 그 안의 clip 묶음. o: {t, fog, wet, lamp:[x,y,k] 날개 좌표, lampR}
function wing(g,host,o){
 if(!init()||!g||!host){drop(g);return false;}
 const tr=g.getAttribute('transform')||'';if(tr.indexOf('-9999')>=0)return true;
 try{
  const S=surface(g,WM.bb,host);
  gl.useProgram(PW.p);gl.bindVertexArray(vaoW);
  const bb=WM.bb;gl.uniform4f(PW.u.uBB,bb[0],bb[1],bb[2],bb[3]);
  gl.uniform1f(PW.u.uT,o.t||0);gl.uniform1f(PW.u.uFog,o.fog||0);gl.uniform1f(PW.u.uWet,o.wet==null?1:Math.max(.25,o.wet));
  const L=o.lamp||[0,0,0];gl.uniform2f(PW.u.uLamp,L[0],L[1]);gl.uniform1f(PW.u.uLampK,L[2]||0);gl.uniform1f(PW.u.uLampR,o.lampR||300);
  gl.uniform1f(PW.u.uPx,S.px);
  const Li=o.lit||{at:[0,0],k:0,r:300,c:[1,.85,.6]};gl.uniform2f(PW.u.uLit,Li.at[0],Li.at[1]);gl.uniform1f(PW.u.uLitK,Li.k||0);gl.uniform1f(PW.u.uLitR,Li.r||300);gl.uniform3f(PW.u.uLitC,Li.c[0],Li.c[1],Li.c[2]);
  gl.drawArrays(gl.TRIANGLES,0,WM.n);gl.bindVertexArray(null);
  blit(S);return true;
 }catch(e){drop(g);return false;}
}

const css='.lgl-fo{overflow:visible;pointer-events:none}'+
 '.rw-arm.lgl>:not(.lgl-fo){display:none}'+
 'g.lgl>:not(.lgl-fo){display:none}';
const st=document.createElement('style');st.textContent=css;(document.head||document.documentElement).appendChild(st);
window.LimbGL={arm,wing,supported:()=>init(),drop};
})();
