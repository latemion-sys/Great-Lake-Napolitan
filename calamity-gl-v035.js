/* Great Lake v0.3.5 · 재앙 고래를 셰이더로 칠하기 (창백한 고래 살갗 · 푸른 고래 항로와 물 벽 · 노란 고래 열수공)
   - 장면은 그대로 SVG로 두고, 바꿀 부위의 묶음(g) 안에 foreignObject 캔버스를 넣어 WebGL2로 그린 그림을 옮겨 그린다.
     그래서 앞뒤 순서 · 물에 잘리는 자리 · 움직임(transform)은 기존 SVG와 똑같이 따라간다.
   - 형태는 매 프레임 절차적으로 만드는 메시(띠 · 겹친 판 고리)로, 질감과 빛은 프래그먼트 셰이더(fbm · 도메인 워핑 · 보로노이)로.
   - WebGL2가 없거나(또는 foreignObject 속 캔버스가 어긋나는 사파리 계열) 실패하면 기존 SVG 그림을 그대로 쓴다.
   - 끄기: 주소 뒤에 ?calgl=0 */
(function(){
'use strict';
const SVGNS='http://www.w3.org/2000/svg',XHTML='http://www.w3.org/1999/xhtml';
const ua=navigator.userAgent||'';
const webkitOnly=(/AppleWebKit/.test(ua)&&!/Chrome\/|Chromium\/|Edg\//.test(ua))||/CriOS|FxiOS|EdgiOS/.test(ua);
const off=()=>{try{return window.CAL_GL_OFF||/[?&]calgl=0/.test(location.search);}catch(e){return false;}};
const MAXPX=1300;
let gl=null,cv=null,ok=null;
const T0=performance.now(),now=()=>(performance.now()-T0)/1000;

/* ───────── 공통 셰이더 조각 ───────── */
const NOISE=`
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec2 h22(vec2 p){float n=h21(p);return vec2(n,h21(p+n+17.3));}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
float fbm3(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*vn(p);p=p*2.07+vec2(5.1,1.3);a*=.5;}return s;}
float ridge(vec2 p){return 1.-abs(fbm(p)*2.-1.);}
// 보로노이: x 가장 가까운 거리 · y 둘째 거리 · zw 가장 가까운 칸 해시
vec4 vor(vec2 p){vec2 i=floor(p),f=fract(p);float d1=9.,d2=9.;vec2 hc=vec2(0.);
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y),r=h22(i+g),d=g+r-f;float l=dot(d,d);
  if(l<d1){d2=d1;d1=l;hc=h22(i+g+31.7);}else if(l<d2)d2=l;}
 return vec4(sqrt(d1),sqrt(d2),hc);}
float segd(vec2 p,vec2 a,vec2 b,out float u){vec2 pa=p-a,ba=b-a;u=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*u);}
`;
// 사각형(묶음 좌표의 bb)을 채우는 판: 화소마다 묶음 좌표 vP
const VQ=`#version 300 es
in vec2 aP;uniform vec4 uBB;out vec2 vP;
void main(){vP=uBB.xy+aP*uBB.zw;gl_Position=vec4(aP.x*2.-1.,1.-aP.y*2.,0.,1.);}`;

/* ───────── 창백한 고래 살갗 ─────────
   부풀고 물에 불은 듯한 창백한 살 · 비치는 푸른 혈관 · 머리 뒤의 깊은 주름 · 오징어 빨판 흉터 · 긁힌 자국 ·
   아물지 않은 상처 · 젖은 윤기와 흘러내리는 물막 · 물속으로 갈수록 흐려지는 빛 */
const F_PALLID=`#version 300 es
precision highp float;
in vec2 vP;out vec4 o;
uniform float uT,uRun,uPx,uEnc;uniform float uTop[64];uniform vec3 uLamp;uniform vec4 uHp[8];
${NOISE}
float topY(float x){float f=clamp((x-520.)/8.,0.,62.99);int i=int(f);return mix(uTop[i],uTop[i+1],fract(f));}
vec3 rakeSet(vec2 p,vec2 o0,float ang,float len,float base,inout float dark){
 vec2 d=vec2(cos(ang),sin(ang)),n=vec2(-d.y,d.x);float lit=0.;
 for(int i=0;i<3;i++){float of=(float(i)-1.)*8.+sin(float(i)*3.1)*1.4;vec2 a=o0+n*of,b=a+d*len*(.82+.18*sin(float(i)*1.7+1.));float u;
  float l=segd(p,a,b,u),w=.9*(.3+.7*sin(3.1416*u));lit=max(lit,exp(-l*l/(w*w+.01)));
  float l2=segd(p-n*1.5-vec2(0.,1.2),a,b,u);dark=max(dark,exp(-l2*l2/(1.8+.01))*(.3+.7*sin(3.1416*u)));}
 return vec3(lit*base);
}
void main(){
 vec2 p=vP;
 float top=topY(p.x),bot=352.,v=clamp((p.y-top)/(bot-top),0.,1.);
 float frontX=548.-25.*sin(clamp((p.y-165.)/185.,0.,1.)*3.1416),df=p.x-frontX;
 // 둥근 몸통의 가짜 법선: 위는 하늘, 가운데는 앞, 아래는 물 쪽. 앞머리는 앞(-x)으로 둥글게 꺾임
 float a=v*3.1416*.92;vec3 N=normalize(vec3(-exp(-df/34.)*1.1,-cos(a),sin(a)*1.05));
 // 살결의 부푼 굴곡(물에 불은 몸)이 법선을 살짝 흔듦
 float bl=fbm(p*.011+vec2(3.,7.));N=normalize(N+vec3((fbm(p*.03)-.5)*.35,(bl-.5)*.45,0.));
 vec3 L=normalize(vec3(.38,-.78,.46));
 float dif=max(dot(N,L),0.),amb=.18+.1*(1.-v);
 vec3 dk=vec3(.07,.1,.115),md=vec3(.42,.47,.46),pl=vec3(.9,.91,.86);
 vec3 col=mix(dk,md,smoothstep(0.,.6,dif+amb*.5));col=mix(col,pl,smoothstep(.55,1.,dif)*.85);
 col*=mix(1.,.34,smoothstep(.25,.95,v));   // 아래로 갈수록 그늘
 // 납빛 · 누런 밀랍빛 얼룩(물에 오래 불은 살)
 float pt=fbm(p*.007+vec2(11.,2.));col=mix(col,col*vec3(1.04,1.02,.9),smoothstep(.5,.75,pt)*.6);
 col=mix(col,col*vec3(.84,.9,.93),smoothstep(.55,.8,fbm(p*.016+vec2(4.,9.)))*.5);
 // 잔주름 그물(머리 전체) · 머리 뒤의 깊게 접힌 주름(뒤로 갈수록 깊어짐)
 float fw=ridge(p*.055+vec2(fbm(p*.02)*2.));col*=1.-.12*smoothstep(.82,.98,fw);
 float rear=smoothstep(740.,900.,p.x);
 float cr=sin(p.y*.38+fbm(p*vec2(.008,.02))*7.+p.x*.012);float crease=exp(-cr*cr/mix(.03,.12,uEnc))*rear*smoothstep(.0,.15,v);
 col*=1.-mix(.42,.13,uEnc)*crease;col+=pl*.07*(1.-.6*uEnc)*rear*smoothstep(.6,1.,cr)*dif;
 // 비치는 혈관(창백해서 푸르게 비침)
 vec2 w=vec2(fbm(p*.012+vec2(1.,5.)),fbm(p*.012+vec2(8.,2.)))*30.;
 float vr=ridge((p+w)*.014),vein=smoothstep(.955,.995,vr)*(.4+.6*smoothstep(.1,.6,v))*(1.-rear*.5);
 float vr2=ridge((p+w*.6)*.04+3.),vein2=smoothstep(.97,.998,vr2)*.5;
 col=mix(col,col*vec3(.66,.8,1.04),vein*.45);
 col=mix(col,min(col*1.22+.05,vec3(1.)),vein2*.5);                 // 하얀 핏줄(살 아래로 희게 비침)
 // 작살이 박힌 자리: 찢긴 테 · 아래로 흘러내린 녹물과 핏물 자국
 for(int i=0;i<8;i++){vec2 h=uHp[i].xy;float len=uHp[i].z;vec2 d=p-h;
  float rl=length(d*vec2(1.,1.4))-6.,ring=exp(-rl*rl/5.);col=mix(col,vec3(.62,.42,.4),ring*mix(.35,.2,uEnc));
  float sx=d.x+sin(d.y*.15+float(i))*1.6;float dy=max(d.y,0.);float run=exp(-sx*sx/(5.+dy*.08))*smoothstep(2.,8.,d.y)*exp(-dy/len);   // 작살 위쪽(d.y<0)에서 분모가 음수가 되어 무한대×0=NaN이 되던 것을 막음
  run*=.55+.45*vn(vec2(p.x*.3,p.y*.06+float(i)));
  col=mix(col,vec3(.36,.17,.1),run*.42);}
 // 텅 빈 새까만 눈: 둘레가 움푹 꺼지고 빛이 빨려 드는 듯 어둡게
 {vec2 e=(p-vec2(748.,298.))*vec2(1.,1.35);float r=length(e);col*=1.-.5*exp(-r*r/600.);col=mix(col,col*.6,smoothstep(26.,12.,r)*smoothstep(4.,12.,r)*.4);}
 // 오징어 빨판 흉터: 이마에 드문드문 둥근 테
 float zone=smoothstep(550.,600.,p.x)*(1.-smoothstep(760.,820.,p.x))*smoothstep(170.,190.,p.y)*(1.-smoothstep(290.,315.,p.y));
 vec4 vo=vor(p/24.);float rr=.12+.2*vo.z,ring=exp(-((vo.x-rr)/.035)*((vo.x-rr)/.035))*step(vo.w,.3)*zone;
 col=mix(col,col*1.18+.03,ring*mix(.6,.22,uEnc));col*=1.-.1*step(vo.x,rr*.8)*step(vo.w,.3)*zone;
 // 긁힌 자국(세 줄씩)
 float dark=0.;vec3 rk=rakeSet(p,vec2(610.,232.),.14,120.,1.,dark)+rakeSet(p,vec2(800.,200.),.38,90.,1.,dark);
 col*=1.-.28*dark;col=mix(col,col*1.25+.06,clamp(rk.x,0.,1.)*.55);
 // 아물지 않은 상처: 벌어진 틈 · 부어오른 분홍 입술 · 둘레의 멍 · 아래로 번진 핏자국
 for(int i=0;i<3;i++){
  vec4 W=i==0?vec4(690.,214.,.24,40.):(i==1?vec4(840.,296.,-.14,34.):vec4(606.,272.,-.42,26.));
  vec2 d=p-W.xy;float c=cos(W.z),s=sin(W.z);vec2 q=vec2(c*d.x+s*d.y,-s*d.x+c*d.y);
  float e=length(q/vec2(W.w*.5,W.w*.085)),e2=length(q/vec2(W.w*.62,W.w*.3));
  if(uEnc>.5&&i>0){   // 조우 장면: 오래되어 아문 흉터(희게 부푼 솔기 · 가장자리의 옅은 주름 · 아주 옅은 분홍기)
   float sc=smoothstep(1.25,.55,e)*(.75+.25*vn(vec2(q.x*.3,float(i))));
   col=mix(col,min(col*1.1+vec3(.06,.055,.05),vec3(1.)),sc*.55);
   col=mix(col,col*vec3(1.,.9,.9),smoothstep(1.,.3,e2)*.25);
   col*=1.-.1*smoothstep(1.6,1.25,e)*smoothstep(.95,1.25,e);
   continue;}
  float fr=uEnc>.5?.7:1.;
  col=mix(col,col*vec3(.92,.74,.76),smoothstep(1.,.2,e2)*.55*fr);                    // 멍
  col=mix(col,mix(vec3(.84,.6,.58),vec3(.74,.62,.6),uEnc),smoothstep(1.55,1.05,e)*smoothstep(.75,1.05,e)*.85*fr);   // 입술
  col=mix(col,vec3(.16,.02,.04),smoothstep(1.05,.75,e));                             // 틈
  float dr=smoothstep(1.,.0,abs(q.x)/(W.w*.3))*smoothstep(0.,4.,d.y)*exp(-max(d.y,0.)/26.)*step(abs(d.x),W.w*.4);
  col=mix(col,vec3(.3,.05,.08),dr*.35*(.5+.5*vn(vec2(p.x*.4,0.))));
 }
 // 등불(배 쪽, 왼편)이 닿는 따뜻한 빛
 float ld=length(p-uLamp.xy)/300.,lk=uLamp.z*exp(-ld*ld*1.6);
 col+=vec3(1.,.72,.4)*lk*.22*max(dot(N,normalize(vec3(-1.,-.2,.6))),0.);
 // 젖은 윤기: 위에서 아래로 천천히 흘러내리는 물막 · 떠오를 때는 굵은 물줄기
 vec3 H=normalize(L+vec3(0.,0.,1.));float sp=pow(max(dot(N,H),0.),70.);
 float film=smoothstep(.45,.8,fbm(vec2(p.x*.05,p.y*.011-uT*.22)));
 col+=vec3(.95,.97,.93)*sp*(.12+.4*film);
 float stx=fbm3(vec2(p.x*.11,p.y*.008-uT*.9)),streak=smoothstep(.62,.8,stx)*uRun*smoothstep(0.,.1,v);
 col=mix(col,vec3(.93,.96,.95),streak*.55);
 // 물속으로 갈수록 흐려지는 빛 · 수면 근처의 푸른 기
 col=mix(col,vec3(.04,.08,.1),smoothstep(286.,342.,p.y)*.62);
 col*=.96+.08*h21(floor(p*1.6));
 o=vec4(col,1.);
}`;

/* ───────── 문맥 · 프로그램 ───────── */
const PROG={};
function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn('[cal-gl]',gl.getShaderInfoLog(s));return null;}return s;}
function prog(name,vs,fs,attrs){
 if(PROG[name]!==undefined)return PROG[name];
 const v=sh(gl.VERTEX_SHADER,vs),f=sh(gl.FRAGMENT_SHADER,fs);if(!v||!f)return PROG[name]=null;
 const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.warn('[cal-gl]',gl.getProgramInfoLog(p));return PROG[name]=null;}
 const u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
 for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i),k=a.name.replace(/\[0\]$/,'');u[k]=gl.getUniformLocation(p,a.name);}
 const buf=gl.createBuffer(),vao=gl.createVertexArray();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buf);
 let st=0;attrs.forEach(a=>st+=a[1]);let off=0;
 attrs.forEach(([nm,c])=>{const l=gl.getAttribLocation(p,nm);if(l>=0){gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,c,gl.FLOAT,false,st*4,off*4);}off+=c;});
 gl.bindVertexArray(null);
 return PROG[name]={p,u,buf,vao,stride:st};
}
let QUAD=null;
function init(){
 if(ok!==null)return ok;ok=false;
 if(webkitOnly||off())return false;
 try{
  cv=document.createElement('canvas');cv.width=cv.height=64;
  gl=cv.getContext('webgl2',{alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true,antialias:false,depth:false,stencil:false});
  if(!gl)return false;
  QUAD=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();ok=false;document.querySelectorAll('.cgl').forEach(g=>{g.classList.remove('cgl');});});
  ok=true;
 }catch(e){ok=false;}
 return ok;
}

/* ───────── 캔버스 자리: 묶음 안의 foreignObject ───────── */
function surface(g,bb,opt){
 opt=opt||{};let s=g.__cgl;
 if(!s){
  const fo=document.createElementNS(SVGNS,'foreignObject');fo.setAttribute('class','cgl-fo');
  if(opt.clip)fo.setAttribute('clip-path',opt.clip);
  const c=document.createElementNS(XHTML,'canvas');c.setAttribute('style','display:block;width:100%;height:100%');
  fo.appendChild(c);
  if(opt.before&&opt.before.parentNode===g)g.insertBefore(fo,opt.before);else if(opt.last)g.appendChild(fo);else g.insertBefore(fo,g.firstChild);
  s=g.__cgl={fo,c,ctx:c.getContext('2d'),at:0,sc:1};
  g.classList.add('cgl');
 }
 const t=performance.now();
 if(t-s.at>400){let m=null;try{m=g.getScreenCTM();}catch(e){}s.sc=m?Math.max(.05,Math.hypot(m.a,m.b)):1;s.at=t;}
 let px=s.sc*Math.min(2,window.devicePixelRatio||1)*(opt.res||1);
 px=Math.min(px,MAXPX/bb[2],MAXPX/bb[3]);
 const pw=Math.max(2,Math.ceil(bb[2]*px)),ph=Math.max(2,Math.ceil(bb[3]*px));
 const fo=s.fo;fo.setAttribute('x',bb[0].toFixed(1));fo.setAttribute('y',bb[1].toFixed(1));fo.setAttribute('width',bb[2].toFixed(1));fo.setAttribute('height',bb[3].toFixed(1));
 if(s.c.width!==pw||s.c.height!==ph){s.c.width=pw;s.c.height=ph;}
 if(cv.width<pw||cv.height<ph){cv.width=Math.max(cv.width,pw);cv.height=Math.max(cv.height,ph);}
 gl.viewport(0,0,pw,ph);gl.scissor(0,0,pw,ph);gl.enable(gl.SCISSOR_TEST);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
 return {s,pw,ph,px};
}
function blit(S){const {s,pw,ph}=S;s.ctx.clearRect(0,0,pw,ph);s.ctx.drawImage(cv,0,cv.height-ph,pw,ph,0,0,pw,ph);}
function drop(g){const s=g&&g.__cgl;if(!s)return;try{s.fo.remove();}catch(e){}g.classList.remove('cgl');g.__cgl=null;}
function quad(P,bb){gl.useProgram(P.p);gl.bindVertexArray(P.vao);gl.bindBuffer(gl.ARRAY_BUFFER,P.buf);gl.bufferData(gl.ARRAY_BUFFER,QUAD,gl.STATIC_DRAW);gl.uniform4f(P.u.uBB,bb[0],bb[1],bb[2],bb[3]);}
function inv(m){const d=m[0]*m[3]-m[1]*m[2]||1;return [m[3]/d,-m[1]/d,-m[2]/d,m[0]/d,(m[2]*m[5]-m[3]*m[4])/d,(m[1]*m[4]-m[0]*m[5])/d];}
function ap(m,p){return [m[0]*p[0]+m[2]*p[1]+m[4],m[1]*p[0]+m[3]*p[1]+m[5]];}

/* ───────── 창백한 고래 ───────── */
const cub=(a,b,c,d,t)=>{const u=1-t;return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d;};
let PTOP=null;
function pallidTop(){
 if(PTOP)return PTOP;
 const segs=[[[548,170],[551,161],[560,154],[574,150]],[[574,150],[612,140],[724,146],[822,160]],[[822,160],[884,168],[940,178],[1010,196]]];
 const pts=[];segs.forEach(s=>{for(let i=0;i<=40;i++){const t=i/40;pts.push([cub(s[0][0],s[1][0],s[2][0],s[3][0],t),cub(s[0][1],s[1][1],s[2][1],s[3][1],t)]);}});
 const out=new Float32Array(64);
 for(let i=0;i<64;i++){const x=520+i*8;if(x<548){out[i]=170+(548-x)*1.6;continue;}
  let y=196;for(let k=0;k<pts.length-1;k++){if(pts[k][0]<=x&&pts[k+1][0]>=x){const f=(x-pts[k][0])/((pts[k+1][0]-pts[k][0])||1);y=pts[k][1]+(pts[k+1][1]-pts[k][1])*f;break;}}
  if(x>1010)y=196+(x-1010)*.2;out[i]=y;}
 return PTOP=out;
}
const PB=[516,136,500,232];
// 머리에 박힌 작살 자리(고래 좌표) · 흘러내린 자국 길이
const HP=new Float32Array([588,180,60,0, 634,162,40,0, 684,154,70,0, 560,238,34,0, 736,154,44,0, 612,212,52,0, 806,166,50,0, 930,186,30,0]);
// g: .w3-whale(행렬로 움직이는 묶음) · o: {t, run(물줄기 0~1), lamp:[세계 x,y,k], mat:[a,b,c,d,e,f]}
function pallid(g,o){
 if(!init()||!g){drop(g);return false;}
 const P=prog('pallid',VQ,F_PALLID,[['aP',2]]);if(!P){drop(g);return false;}
 try{
  const S=surface(g,PB,{clip:'url(#w3WhaleClip)',before:g.querySelector('.w3-svgskin')});
  quad(P,PB);
  gl.uniform1f(P.u.uT,o.t!=null?o.t:now());gl.uniform1f(P.u.uRun,o.run||0);gl.uniform1f(P.u.uEnc,o.enc?1:0);gl.uniform1f(P.u.uPx,S.px);
  gl.uniform1fv(P.u.uTop,pallidTop());gl.uniform4fv(P.u.uHp,HP);
  let lp=[0,0,0];if(o.lamp&&o.mat){const l=ap(inv(o.mat),o.lamp);lp=[l[0],l[1],o.lamp[2]||0];}
  gl.uniform3f(P.u.uLamp,lp[0],lp[1],lp[2]);
  gl.drawArrays(gl.TRIANGLES,0,6);gl.bindVertexArray(null);
  blit(S);return true;
 }catch(e){console.warn('[cal-gl]',e);drop(g);return false;}
}


/* ───────── 푸른 고래: 빛 띠(항로 · 바닥의 궤적 · 수면의 금) ─────────
   선을 따라 매 프레임 띠 메시(길이 u px · 가로 v -1~1)를 만들고, 가운데는 희고 바깥은 청록으로 번지는 빛.
   점선 대신 길을 따라 흐르는 맥박 · 가는 물살 결 · 끊김(약할 때)을 셰이더로 그린다. */
const V_RIB=`#version 300 es
in vec2 aP;in vec4 aA;in vec2 aB;uniform vec4 uBB;
out vec2 vP;out float vU,vV,vK,vKind,vW,vPh;
void main(){vP=aP;vU=aA.x;vV=aA.y;vK=aA.z;vKind=aA.w;vW=aB.x;vPh=aB.y;vec2 q=(aP-uBB.xy)/uBB.zw;gl_Position=vec4(q.x*2.-1.,1.-q.y*2.,0.,1.);}`;
const F_RIB=`#version 300 es
precision highp float;
in vec2 vP;in float vU,vV,vK,vKind,vW,vPh;out vec4 o;
uniform float uT,uPx;
${NOISE}
void main(){
 float v=vV,av=abs(v),k=vK;
 float fl=vKind<.5?1.:(vKind<1.5?2.:.6);
 // 길을 따라 흐르는 가는 물살 결(가로로 길게 늘어난 잡음)
 float fib=fbm(vec2(vU*.035-uT*fl*2.2+vPh*7.,v*2.6+vPh*3.));
 float fib2=fbm(vec2(vU*.11-uT*fl*5.,v*6.+vPh));
 // 흐르는 맥박: 길을 따라 앞으로 지나가는 밝은 덩어리
 float pu=fract(vU/(vKind>1.5?170.:120.)-uT*(vKind>1.5?.9:1.4)+vPh);
 float pulse=.55+.45*smoothstep(.0,.25,pu)*smoothstep(1.,.45,pu);
 // 약하면(읽어 내지 못한 궤적) 군데군데 끊김
 float brk=mix(smoothstep(.38,.62,fbm(vec2(vU*.018+vPh*5.,uT*.6))),1.,smoothstep(.35,.7,k));
 float core=exp(-av*av/(.012+.01*fib))*(.7+.6*fib2);
 float halo=exp(-av*av*3.2)*(.35+.65*fib);
 float outer=exp(-av*1.6)*.35;
 vec3 c=vec3(.08,.36,.62)*outer+vec3(.22,.72,.98)*halo*.75+vec3(.9,.98,1.)*core;
 float e=clamp(k*pulse*brk,0.,1.5);
 c*=e;
 float a=clamp(max(c.r,max(c.g,c.b))*1.1,0.,1.);
 o=vec4(c,a);
}`;
let ribData=new Float32Array(4096*8),rN=0;
function rpush(x,y,u,v,k,kind,w,ph){const o=rN*8;if(o+8>ribData.length){const b=new Float32Array(ribData.length*2);b.set(ribData);ribData=b;}
 ribData[o]=x;ribData[o+1]=y;ribData[o+2]=u;ribData[o+3]=v;ribData[o+4]=k;ribData[o+5]=kind;ribData[o+6]=w;ribData[o+7]=ph;rN++;}
// pts: [[x,y],...] · w: 반폭(px, 수 또는 배열) · k: 세기(수 또는 배열)
function ribbonMesh(R,bb){
 const P=R.pts,n=P.length;if(n<2)return;
 const S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
 const L=[],Rr=[],K=[];
 for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
  const w=(Array.isArray(R.w)?R.w[i]:R.w)||6,k=Array.isArray(R.k)?R.k[i]:(R.k==null?1:R.k);
  L.push([P[i][0]-dy*w,P[i][1]+dx*w]);Rr.push([P[i][0]+dy*w,P[i][1]-dx*w]);K.push(k);
  bb[0]=Math.min(bb[0],L[i][0],Rr[i][0]);bb[1]=Math.min(bb[1],L[i][1],Rr[i][1]);bb[2]=Math.max(bb[2],L[i][0],Rr[i][0]);bb[3]=Math.max(bb[3],L[i][1],Rr[i][1]);}
 const kd=R.kind||0,ph=R.ph||0,tot=S[n-1]||1;
 const fade=i=>{const u=S[i]/tot,f=R.fade==null?.08:R.fade;return Math.min(1,u/f,(1-u)/f);};
 for(let i=0;i<n-1;i++){
  const V=(j,sd)=>{const p=sd>0?L[j]:Rr[j];rpush(p[0],p[1],S[j]+(R.u0||0),sd,K[j]*Math.max(0,fade(j)),kd,0,ph);};
  V(i,1);V(i,-1);V(i+1,1);V(i+1,1);V(i,-1);V(i+1,-1);
 }
}
function ribbons(g,list,o){
 o=o||{};if(!init()||!g){drop(g);return false;}
 const P=prog('rib',V_RIB,F_RIB,[['aP',2],['aA',4],['aB',2]]);if(!P){drop(g);return false;}
 try{
  rN=0;const bb=[1e9,1e9,-1e9,-1e9];list.forEach(R=>ribbonMesh(R,bb));
  if(rN<3||!(bb[2]>bb[0])){if(g.__cgl)g.__cgl.ctx.clearRect(0,0,g.__cgl.c.width,g.__cgl.c.height);return true;}
  const B=[bb[0]-2,bb[1]-2,bb[2]-bb[0]+4,bb[3]-bb[1]+4];
  const S=surface(g,B,{before:o.before,last:o.last,res:o.res||.8});
  gl.useProgram(P.p);gl.bindVertexArray(P.vao);gl.bindBuffer(gl.ARRAY_BUFFER,P.buf);gl.bufferData(gl.ARRAY_BUFFER,ribData.subarray(0,rN*8),gl.DYNAMIC_DRAW);
  gl.uniform4f(P.u.uBB,B[0],B[1],B[2],B[3]);gl.uniform1f(P.u.uT,o.t!=null?o.t:now());gl.uniform1f(P.u.uPx,S.px);
  gl.drawArrays(gl.TRIANGLES,0,rN);gl.bindVertexArray(null);
  blit(S);return true;
 }catch(e){console.warn('[cal-gl]',e);drop(g);return false;}
}

/* ───────── 푸른 고래: 갈라진 물 벽 ─────────
   물마루 → 벽 아래(안쪽 면은 깊은 틈 · 바깥 면은 비탈)를 잇는 띠 메시. 셰이더: 흘러내리는 물막 결 · 마루의 거품과 물보라 ·
   깊은 틈에서 올라오는 푸른 빛 · 벽을 타고 일렁이는 빛 무늬. 바닥의 푸른 궤적은 빛 띠로. */
const V_WALL=`#version 300 es
in vec2 aP;in vec4 aA;uniform vec4 uBB;
out vec2 vP;out float vU,vV,vO,vIn;
void main(){vP=aP;vU=aA.x;vV=aA.y;vO=aA.z;vIn=aA.w;vec2 q=(aP-uBB.xy)/uBB.zw;gl_Position=vec4(q.x*2.-1.,1.-q.y*2.,0.,1.);}`;
const F_WALL=`#version 300 es
precision highp float;
in vec2 vP;in float vU,vV,vO,vIn;out vec4 o;
uniform float uT,uFlow,uGlow,uOp;
${NOISE}
void main(){
 float v=vV,u=vU+uT*uFlow;
 if(v<0.){   // 마루 위로 흩날리는 물보라
  float m=fbm(vec2(u*.05,v*6.-uT*1.6)),a=smoothstep(.5,.8,m)*smoothstep(-1.,-.1,v)*vO*.55;
  o=vec4(vec3(.82,.93,.98)*a,a)*uOp;return;}
 vec3 col;
 // 흘러내리는 물막 결: 세로로 길게 늘어난 잡음이 아래로 미끄러짐
 float run=fbm(vec2(u*.07,v*2.2-uT*1.35)),run2=fbm(vec2(u*.19+3.,v*4.5-uT*2.4));
 float wav=fbm(vec2(u*.025+fbm(vec2(u*.01,v*2.-uT*.4))*2.,v*3.-uT*.6));
 if(vIn>.5){
  col=mix(vec3(.15,.34,.47),vec3(.06,.19,.29),smoothstep(0.,.25,v));
  col=mix(col,vec3(.02,.08,.14),smoothstep(.2,.55,v));
  col=mix(col,vec3(.004,.02,.04),smoothstep(.5,.95,v));
  col+=vec3(.25,.7,.98)*smoothstep(.55,1.,v)*(.25+.25*run)*uGlow;      // 깊은 틈의 푸른 빛
  col+=vec3(.5,.8,.95)*pow(1.-abs(sin(wav*9.)),10.)*(1.-v)*.16;        // 벽을 타고 일렁이는 빛 무늬
 }else{
  col=mix(vec3(.12,.25,.33),vec3(.03,.07,.1),smoothstep(0.,.7,v));
  col+=vec3(.4,.6,.7)*pow(1.-abs(sin(wav*7.)),12.)*(1.-v)*.12;
 }
 col+=vec3(.7,.88,.98)*smoothstep(.64,.84,run)*(1.-v*.7)*.16;            // 흘러내리는 물줄기
 col+=vec3(.8,.92,1.)*smoothstep(.7,.86,run2)*(1.-v)*.12;
 // 마루의 거품
 float fo=smoothstep(.1,0.,v)*(.45+.55*fbm(vec2(u*.09,uT*.8)));col=mix(col,vec3(.86,.95,1.),fo*.6);
 float a=clamp(vO*1.6,0.,1.)*uOp;
 o=vec4(col*a,a);
}`;
let wallData=new Float32Array(4096*6),wN=0;
function wpush(x,y,u,v,ob,inn){const o=wN*6;if(o+6>wallData.length){const b=new Float32Array(wallData.length*2);b.set(wallData);wallData=b;}
 wallData[o]=x;wallData[o+1]=y;wallData[o+2]=u;wallData[o+3]=v;wallData[o+4]=ob;wallData[o+5]=inn;wN++;}
function wallMesh(Sd,bb){
 const CR=Sd.CR,BS=Sd.BASE,O=Sd.o,n=CR.length,inn=Sd.inner?1:0;
 const S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Math.hypot(CR[i][0]-CR[i-1][0],CR[i][1]-CR[i-1][1]));
 const row=(i,v)=>{if(v<0){const h=10*O[i]*(-v/.2);return [CR[i][0],CR[i][1]-h];}return [CR[i][0]+(BS[i][0]-CR[i][0])*v,CR[i][1]+(BS[i][1]-CR[i][1])*v];};
 const VS=[-.2,0,.12,.4,1];
 for(let i=0;i<n-1;i++){if(O[i]<.01&&O[i+1]<.01)continue;
  for(let r=0;r<VS.length-1;r++){
   const V=(j,v)=>{const p=row(j,v);bb[0]=Math.min(bb[0],p[0]);bb[1]=Math.min(bb[1],p[1]);bb[2]=Math.max(bb[2],p[0]);bb[3]=Math.max(bb[3],p[1]);wpush(p[0],p[1],S[j],v,O[j],inn);};
   const a=VS[r],b=VS[r+1];V(i,a);V(i,b);V(i+1,a);V(i+1,a);V(i,b);V(i+1,b);}
 }
}
// d: {t, flow, glow, op, far:{CR,BASE,o,inner}, near:{…}, trail:{pts,k,w}}
function rift(back,front,d){
 if(!init()){return false;}
 const PW=prog('wall',V_WALL,F_WALL,[['aP',2],['aA',4]]),PR=prog('rib',V_RIB,F_RIB,[['aP',2],['aA',4],['aB',2]]);if(!PW||!PR)return false;
 try{
  const host=back.firstElementChild;   // 먼 벽 · 바닥은 가까운 물벽 아래로 잘리는 묶음 안
  // 뒤: 바닥의 궤적(빛 띠) → 먼 벽
  {wN=0;rN=0;const bb=[1e9,1e9,-1e9,-1e9];
   if(d.trail)ribbonMesh({pts:d.trail.pts,w:d.trail.w,k:d.trail.k,kind:0,ph:.3,fade:.04},bb);
   if(d.far)wallMesh(d.far,bb);
   if(bb[2]>bb[0]){const B=[bb[0]-2,bb[1]-2,bb[2]-bb[0]+4,bb[3]-bb[1]+4];
    const S=surface(host,B,{before:host.querySelector('.rf-glow'),res:1});
    if(rN){gl.useProgram(PR.p);gl.bindVertexArray(PR.vao);gl.bindBuffer(gl.ARRAY_BUFFER,PR.buf);gl.bufferData(gl.ARRAY_BUFFER,ribData.subarray(0,rN*8),gl.DYNAMIC_DRAW);
     gl.uniform4f(PR.u.uBB,B[0],B[1],B[2],B[3]);gl.uniform1f(PR.u.uT,d.t||0);gl.uniform1f(PR.u.uPx,S.px);gl.drawArrays(gl.TRIANGLES,0,rN);}
    if(wN){gl.useProgram(PW.p);gl.bindVertexArray(PW.vao);gl.bindBuffer(gl.ARRAY_BUFFER,PW.buf);gl.bufferData(gl.ARRAY_BUFFER,wallData.subarray(0,wN*6),gl.DYNAMIC_DRAW);
     gl.uniform4f(PW.u.uBB,B[0],B[1],B[2],B[3]);gl.uniform1f(PW.u.uT,d.t||0);gl.uniform1f(PW.u.uFlow,d.flow||0);gl.uniform1f(PW.u.uGlow,d.glow==null?1:d.glow);gl.uniform1f(PW.u.uOp,1);gl.drawArrays(gl.TRIANGLES,0,wN);}
    gl.bindVertexArray(null);blit(S);back.classList.add('cglr');}}
  // 앞: 가까운 벽
  {wN=0;const bb=[1e9,1e9,-1e9,-1e9];if(d.near)wallMesh(d.near,bb);
   if(wN&&bb[2]>bb[0]){const B=[bb[0]-2,bb[1]-2,bb[2]-bb[0]+4,bb[3]-bb[1]+4];
    const S=surface(front,B,{res:1});
    gl.useProgram(PW.p);gl.bindVertexArray(PW.vao);gl.bindBuffer(gl.ARRAY_BUFFER,PW.buf);gl.bufferData(gl.ARRAY_BUFFER,wallData.subarray(0,wN*6),gl.DYNAMIC_DRAW);
    gl.uniform4f(PW.u.uBB,B[0],B[1],B[2],B[3]);gl.uniform1f(PW.u.uT,d.t||0);gl.uniform1f(PW.u.uFlow,d.flow||0);gl.uniform1f(PW.u.uGlow,d.glow==null?1:d.glow);gl.uniform1f(PW.u.uOp,1);gl.drawArrays(gl.TRIANGLES,0,wN);
    gl.bindVertexArray(null);blit(S);front.classList.add('cglr');}}
  return true;
 }catch(e){console.warn('[cal-gl]',e);[back.firstElementChild,front].forEach(drop);back.classList.remove('cglr');front.classList.remove('cglr');return false;}
}


/* ───────── 노란 고래 열수공 ─────────
   겹겹이 포개진 껍데기 판으로 쌓인 탑을 고리 메시(둘레 θ × 높이 h)로 만든다. 판마다 둘레가 불룩해 윤곽이 울퉁불퉁하고,
   판 사이 틈 · 성장선 · 광물 결 · 유황빛 얼룩을 셰이더로. 덮개가 열리면 틈새로 황금빛이 새어 나오고,
   꼭대기에서 뜨거운 김 기둥이 솟는다(깨진 뒤에는 검은 연기). */
const V_VENT=`#version 300 es
in vec2 aP;in vec2 aA;uniform vec4 uBB;out vec2 vP;out float vTh,vH;
void main(){vP=aP;vTh=aA.x;vH=aA.y;vec2 q=(aP-uBB.xy)/uBB.zw;gl_Position=vec4(q.x*2.-1.,1.-q.y*2.,0.,1.);}`;
const F_VENT=`#version 300 es
precision highp float;
in vec2 vP;in float vTh,vH;out vec4 o;
uniform float uT,uOpen,uSeed;
${NOISE}
void main(){
 float th=vTh,h=vH;
 float tp=th*6./6.2832+.37+uSeed,id=floor(tp),f=fract(tp);
 float hj=h+.04*sin(id*2.1+uSeed*5.);   // 판마다 겹친 높이가 조금씩 다름
 // 둥근 탑의 법선 + 판의 불룩함(판 가운데가 앞으로)
 float bul=(f-.5)*1.4;
 vec3 N=normalize(vec3(sin(th+bul*.5),-.32-.25*h,cos(th+bul*.5)));
 vec3 L=normalize(vec3(-.55,-.62,.58));
 float dif=max(dot(N,L),0.);
 vec3 dk=vec3(.16,.09,.025),md=vec3(.55,.36,.12),lt=vec3(.95,.76,.4);
 vec3 col=mix(dk,md,smoothstep(0.,.55,dif));col=mix(col,lt,smoothstep(.55,1.,dif)*.8);
 // 포개진 고리(성장 마디) · 잔 성장선
 float ring=fract(hj*5.5+fbm(vec2(th*3.,id))*.35),rg=smoothstep(.0,.12,ring)*smoothstep(1.,.82,ring);
 col*=.74+.26*rg;col+=lt*.12*smoothstep(.85,1.,ring)*dif;
 col*=.9+.1*sin(hj*120.+fbm(vec2(th*10.,h*4.))*6.);
 // 광물 결 · 구멍 · 유황빛 얼룩(꼭대기 쪽일수록)
 vec2 sp=vec2(th*40.,h*90.);
 col*=.82+.3*fbm(sp*.25+id*7.);
 vec4 vo=vor(sp*.35+id*3.);col*=1.-.35*smoothstep(.18,.05,vo.x)*step(vo.z,.4);
 col=mix(col,vec3(.98,.86,.32)*(.5+.6*dif),smoothstep(.6,.82,fbm(sp*.12+5.))*smoothstep(.35,.95,h)*.45);
 // 판 사이 틈: 어둡게 파이고, 열리면 황금빛이 새어 나옴
 float gap=min(f,1.-f),seam=exp(-gap*gap/.0016);
 col*=1.-.75*seam;
 float flick=.8+.2*sin(uT*9.+id*3.)+.1*sin(uT*23.+h*20.);
 col+=vec3(1.,.72,.25)*seam*uOpen*flick*(.3+.9*h)*1.1;
 col+=vec3(1.,.66,.2)*uOpen*smoothstep(.75,1.,h)*.35*flick;   // 꼭대기 안쪽에서 비치는 빛
 // 젖은 윤기
 vec3 H=normalize(L+vec3(0.,0.,1.));col+=vec3(1.,.92,.7)*pow(max(dot(N,H),0.),40.)*.35*(.5+.5*fbm(sp*.08-vec2(0.,uT*.3)));
 // 윤곽 가장자리(옆으로 돌아가는 면)는 어둡게
 col*=mix(.45,1.,smoothstep(1.55,.9,abs(th)));
 o=vec4(col,1.);
}`;
const F_PLUME=`#version 300 es
precision highp float;
in vec2 vP;out vec4 o;
uniform float uT,uOpen,uBroken,uBase,uSeed;
${NOISE}
void main(){
 vec2 p=vP;float z=uBase-p.y;                 // 꼭대기 위로의 높이
 if(z<-26.){discard;}
 float zz=max(z,0.);
 float sway=sin(zz*.018-uT*1.1+uSeed)*(4.+zz*.08)+sin(zz*.05-uT*2.3)*2.;
 float w=13.+zz*.3;
 float x=p.x-sway;
 vec2 q=vec2(x*.032,zz*.018-uT*.75+uSeed);
 q+=vec2(fbm(q*1.7+uT*.2),fbm(q*1.7+3.1))*.9;           // 말려 오르는 결
 float n=fbm(q*2.),n2=fbm(q*4.3+1.7);
 float col=exp(-x*x/(w*w))*smoothstep(-6.,10.,z)*exp(-zz/170.);
 float d=col*smoothstep(.28,.8,n*.75+n2*.35);
 vec3 c;float a;
 if(uBroken>.5){
  c=mix(vec3(.16,.1,.05),vec3(.34,.29,.24),smoothstep(0.,180.,zz));a=d*.85;
  c+=vec3(1.,.5,.15)*exp(-zz/18.)*.6*d;
 }else{
  float hot=exp(-zz/40.);
  c=mix(vec3(.85,.6,.25),vec3(1.,.93,.7),hot)*(.55+.6*n2);a=d*.8*uOpen;
  // 꼭대기 바로 위의 아지랑이 결(뜨거운 공기)
  float hz=exp(-zz/28.)*exp(-x*x/600.)*(.5+.5*sin(zz*.6-uT*12.+x*.2))*uOpen*.35;
  c+=vec3(1.,.85,.5)*hz;a=max(a,hz*.6);
  // 열린 중심부의 황금빛(부드럽게 번짐)
  float gr=length(vec2(p.x,(z+2.)*1.6));float core=exp(-gr*gr/(900.))*uOpen*(.85+.15*sin(uT*13.));
  c+=vec3(1.,.8,.42)*core*.8;a=max(a,core*.6);
 }
 o=vec4(c*a,a);
}`;
let VMESH=null;
function ventMesh(){
 if(VMESH)return VMESH;
 const NT=56,NH=18,d=[];const bb=[1e9,1e9,-1e9,-1e9];
 // CONE 윤곽(밑 반지름 50 → 위 29)을 따라 h에 따른 반지름 · 중심 높이
 const rad=h=>cub(50,48.5,40,30,h);
 const cyy=h=>cub(-22,-58,-92,-114,h);
 const P=(th,h)=>{const tp=th*6/(Math.PI*2)+.37,f=tp-Math.floor(tp),bul=.06*Math.sin(Math.PI*f)-.03;
  const r=rad(h)*(1+bul+.02*Math.sin(h*44+Math.floor(tp)*2));
  const x=r*Math.sin(th),y=cyy(h)+r*.2*Math.cos(th);bb[0]=Math.min(bb[0],x);bb[1]=Math.min(bb[1],y);bb[2]=Math.max(bb[2],x);bb[3]=Math.max(bb[3],y);return [x,y];};
 for(let j=0;j<NH;j++)for(let i=0;i<NT;i++){
  const t0=-Math.PI/2+Math.PI*i/NT,t1=-Math.PI/2+Math.PI*(i+1)/NT,h0=j/NH,h1=(j+1)/NH;
  const V=(th,h)=>{const p=P(th,h);d.push(p[0],p[1],th,h);};
  V(t0,h0);V(t1,h0);V(t0,h1);V(t0,h1);V(t1,h0);V(t1,h1);}
 return VMESH={data:new Float32Array(d),n:d.length/4,bb:[bb[0]-2,bb[1]-2,bb[2]-bb[0]+4,bb[3]-bb[1]+4]};
}
// cone: .yv-cone 묶음 · plumeHost: .yv-pos 묶음 · o: {t, open, rise, broken, i}
function vent(cone,plumeHost,o){
 if(!init()){return false;}
 const PV=prog('vent',V_VENT,F_VENT,[['aP',2],['aA',2]]),PP=prog('plume',VQ,F_PLUME,[['aP',2]]);if(!PV||!PP){drop(cone);return false;}
 try{
  const t=o.t!=null?o.t:now(),M=ventMesh();
  if(!o.broken){
   const S=surface(cone,M.bb,{});
   gl.useProgram(PV.p);gl.bindVertexArray(PV.vao);gl.bindBuffer(gl.ARRAY_BUFFER,PV.buf);
   if(!PV._up){gl.bufferData(gl.ARRAY_BUFFER,M.data,gl.STATIC_DRAW);PV._up=1;}
   gl.uniform4f(PV.u.uBB,M.bb[0],M.bb[1],M.bb[2],M.bb[3]);gl.uniform1f(PV.u.uT,t);gl.uniform1f(PV.u.uOpen,o.open||0);gl.uniform1f(PV.u.uSeed,(o.i||0)*.29);
   gl.drawArrays(gl.TRIANGLES,0,M.n);gl.bindVertexArray(null);blit(S);
  }
  // 김 기둥(열렸을 때) · 깨진 뒤의 연기
  const want=o.broken?1:(o.open||0);
  if(plumeHost){
   plumeHost.classList.add('cglp');   // 셰이더가 되면 예전 SVG 김 · 빛 원은 늘 숨김
   if(want>.01&&(o.rise||0)>.85){
    const base=(1-(o.rise||0))*150-(o.broken?60:118),B=[-110,base-330,220,340];
    const S=surface(plumeHost,B,{before:plumeHost.querySelector('.yv-st'),res:.6});
    quad(PP,B);gl.uniform1f(PP.u.uT,t);gl.uniform1f(PP.u.uOpen,Math.min(1,want));gl.uniform1f(PP.u.uBroken,o.broken?1:0);gl.uniform1f(PP.u.uBase,base);gl.uniform1f(PP.u.uSeed,(o.i||0)*1.7);
    gl.drawArrays(gl.TRIANGLES,0,6);gl.bindVertexArray(null);blit(S);plumeHost.classList.add('cglp');
   }else if(plumeHost.__cgl){const s2=plumeHost.__cgl;s2.ctx.clearRect(0,0,s2.c.width,s2.c.height);plumeHost.classList.add('cglp');}
  }
  return true;
 }catch(e){console.warn('[cal-gl]',e);drop(cone);if(plumeHost){drop(plumeHost);plumeHost.classList.remove('cglp');}return false;}
}


const F_MEM=`#version 300 es
precision highp float;
in vec2 vP;in float vU,vV,vK,vKind,vW,vPh;out vec4 o;
uniform float uT;
${NOISE}
void main(){
 float av=abs(vV);
 float fib=fbm(vec2(vU*.12+vPh*9.,vV*3.+vPh*2.)),fib2=fbm(vec2(vU*.35-uT*.2,vV*7.+vPh));
 float body=smoothstep(1.,.35,av)*(.55+.45*fib);
 float thin=smoothstep(.45,.75,fib2);                      // 막이 얇아져 비치는 구멍
 float edge=smoothstep(1.,.75,av)*smoothstep(.45,.8,av);
 vec3 c=mix(vec3(.82,.86,.86),vec3(.98,.98,.95),fib)+vec3(.05,.08,.12)*(1.-fib2);
 float a=(body*(1.-.6*thin)*.62+edge*.18)*vK;
 o=vec4(c*a,a);
}`;
// 늘어진 막 가닥: [{x,y,len,w,ph}] 고래 좌표. 매 프레임 흔들리는 늘어짐을 계산해 띠로 만든다
function membrane(g,list,t){
 if(!init()||!g){drop(g);return false;}
 const P=prog('mem',V_RIB,F_MEM,[['aP',2],['aA',4],['aB',2]]);if(!P){drop(g);return false;}
 try{
  rN=0;const bb=[1e9,1e9,-1e9,-1e9];
  list.forEach((m,i)=>{const pts=[],ws=[],ks=[],N=14;
   for(let j=0;j<=N;j++){const u=j/N,sw=Math.sin(t*.9+m.ph*6+u*2.2)*u*u*m.len*.12+Math.sin(t*2.1+m.ph*3)*u*2;
    pts.push([m.x+sw+(m.dx||0)*u,m.y+m.len*u*(1-.08*Math.sin(t*.7+m.ph))]);ws.push(m.w*(1-.75*u)*(1+.3*Math.sin(u*9+m.ph*4)));ks.push(m.k==null?1:m.k);}
   ribbonMesh({pts,w:ws,k:ks,kind:3,ph:m.ph,fade:.05},bb);});
  if(rN<3)return true;
  const B=[bb[0]-2,bb[1]-2,bb[2]-bb[0]+4,bb[3]-bb[1]+4];
  const S=surface(g,B,{res:1});
  gl.useProgram(P.p);gl.bindVertexArray(P.vao);gl.bindBuffer(gl.ARRAY_BUFFER,P.buf);gl.bufferData(gl.ARRAY_BUFFER,ribData.subarray(0,rN*8),gl.DYNAMIC_DRAW);
  gl.uniform4f(P.u.uBB,B[0],B[1],B[2],B[3]);gl.uniform1f(P.u.uT,t);gl.drawArrays(gl.TRIANGLES,0,rN);gl.bindVertexArray(null);
  blit(S);return true;
 }catch(e){console.warn('[cal-gl]',e);drop(g);return false;}
}

const css='.cgl-fo{overflow:visible;pointer-events:none}'+
 '.w3-whale.cgl .w3-svgskin{display:none}'+
 '.rf-back.cglr .rf-glow,.rf-back.cglr .rf-core,.cglr .rf-wall>*{display:none}'+
 '.bw-tl.cgl>path{display:none}'+
 '.bw-crack.cgl>path{display:none}'+
 '.yv-cone.cgl>:not(.cgl-fo){display:none}'+
 '.yv-pos.cglp>.yv-st,.yv-pos.cglp>.yv-sm,.yv-pos.cglp>.yv-glow{display:none}';
const st=document.createElement('style');st.textContent=css;(document.head||document.documentElement).appendChild(st);
window.CalGL={pallid,ribbons,rift,vent,membrane,supported:()=>init(),drop,_gl:()=>gl,_prog:prog,_surface:surface,_blit:blit,_quad:quad,NOISE,VQ};
})();
