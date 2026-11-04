/* v.1.0.1 · 오재앙 토벌 엔딩 연출(쪽빛노인의 재림)
   어두운 새벽 호수 위에 다섯 불꽃이 둥글게 피어난다 — 흰 동그라미(창백) · 푸른 오각형 · 붉은 팔각형 · 까만 세모 · 노란 육각형.
   차례로 한 번 밝게 일었다가 조각으로 갈라져 흩어지고, 그 사이 한가운데로 쪽빛으로 물든 작살이 솟는다.
   이어서 문장은 '목소리'처럼 빛 띠가 지나가며 드러나고 핵심어가 은은히 일렁인다(빚 상환 엔딩과 같은 결).
   - WebGL 셰이더: 도형 거리장을 따라 위로 일렁이는 불꽃(fbm) · 각 조각을 되짚어 그리는 깨짐 · 쪽빛 기운 · 잔잔한 밤 호수
   - SVG: 쪽빛 작살(흐르는 그라데이션)
   - Canvas 2D: 깨질 때 날리는 그 색의 불티 · 작살 둘레의 쪽빛 알갱이(부드러운 스프라이트)
   WebGL이 없으면 기존 CSS 바다와 글자 연출 그대로. 소리는 쓰지 않는다. */
(function(){
'use strict';
const ov=document.getElementById('calamityEnding100');
if(!ov)return;
const OFF=6.4;                                   // 문장이 시작되기 전 연출 길이(초)
const IGN=[.25,.5,.75,1.0,1.25],BRK=[2.4,3.05,3.7,4.35,5.0],HARP=5.5;
const COLS=[[.96,.96,.92],[.36,.62,1.],[1.,.32,.2],[.62,.5,.86],[1.,.82,.3]];   // 까만 불꽃은 테두리 빛 색

// 핵심어 강조
const EM=['오재앙','잠시 잠들었을 뿐','지금은 아니다','당신의 손에','쪽빛노인이 돌아왔다','새로운 이름 하나'];
ov.querySelectorAll('.calamity-end-story-v100 p').forEach(p=>{let h=p.innerHTML;EM.forEach(w=>{h=h.split(w).join('<em class="cef-em">'+w+'</em>');});p.innerHTML=h;});

const VS=`#version 300 es
in vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const FS=`#version 300 es
precision highp float;
uniform vec2 uRes;uniform float uT,uHarp,uSc;uniform float uIgn[5],uBrk[5];out vec4 o;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float h1(float x){return fract(sin(x*91.345)*47453.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<4;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}
const float PI=3.14159265;
const float HOR=-.17;
vec2 C(int i){float a=PI*.5-float(i)*2.*PI/5.;return vec2(cos(a),sin(a))*.23*uSc+vec2(0.,.07);}
// 정다각형 거리(근사 · 윤곽 불꽃에는 충분), n=0이면 원
float sdShape(vec2 q,float nn,float r,float rot){
 if(nn<.5)return length(q)-r;
 float a=atan(q.x,q.y)+rot,an=PI/nn,b=mod(a+an,2.*an)-an;
 return length(q)*cos(b)-r*cos(an);
}
// 도형 윤곽에서 위로 혀를 날름거리는 불꽃의 세기
float flame(vec2 q,float nn,float r,float rot,float t,float seed){
 float n1=fbm(q*14.+vec2(seed,-t*2.6)),n2=fbm(q*30.+vec2(seed*2.,-t*4.2));
 vec2 qs=q+vec2((n1-.5)*.026,-(.008+.05*n1*n1));        // 아래 것을 끌어올려 표본 → 불길이 위로
 float d=sdShape(qs,nn,r,rot);
 float w=.011+.013*n2;
 float core=exp(-abs(d)/w);
 float up=exp(-abs(sdShape(q+vec2((n2-.5)*.02,-.045-.06*n2*n1),nn,r,rot))/(w*2.))*.7*smoothstep(-.03,.05,q.y+r*.3);
 float fill=exp(-max(-d,0.)/.035)*step(d,0.)*.22;           // 안쪽에 고인 옅은 불빛
 return (core+up+fill)*(.5+.85*n1);
}
vec3 shapeCol(int i,float f,float k){
 vec3 c=i==0?vec3(.96,.96,.92):i==1?vec3(.36,.62,1.):i==2?vec3(1.,.32,.2):i==3?vec3(.62,.5,.86):vec3(1.,.82,.3);
 return mix(c*.55,mix(c,vec3(1.),.55),smoothstep(.7,1.6,f))*f*k;
}
void main(){
 vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uT;
 // 바탕: 잔잔한 밤 호수(쪽빛이 스밈)
 vec3 skyTop=vec3(.02,.035,.07),skyLow=vec3(.1,.13,.22);
 vec3 c;
 if(p.y>HOR){float y=p.y-HOR;c=mix(skyLow,skyTop,smoothstep(0.,.5,y));c+=vec3(.25,.36,.6)*exp(-y*10.)*.12;}
 else{
  float d=HOR-p.y,z=.08/(d+.012);vec2 w=vec2(p.x*z*9.,z*7.);
  float s0=sin(w.x*.55+w.y*.18+t*.42)*.5+sin(w.x*-.31+w.y*.42+t*.33)*.35+(fbm(w*.9+vec2(t*.07,-t*.05))-.5)*.55;
  float sx=sin((w.x+.05)*.55+w.y*.18+t*.42)*.5+sin((w.x+.05)*-.31+w.y*.42+t*.33)*.35+(fbm((w+vec2(.05,0.))*.9+vec2(t*.07,-t*.05))-.5)*.55;
  vec3 N=normalize(vec3(-(sx-s0)/.05*.16,1.,.0));vec3 V=normalize(vec3(p.x,-.18-d*.6,1.)),R=reflect(V,N);
  float up=clamp(R.y,0.,1.);vec3 refl=mix(skyLow,skyTop,smoothstep(0.,.5,up));
  refl+=vec3(.3,.45,.85)*exp(-abs(R.x)*3.)*exp(-up*7.)*(.25+.6*uHarp);
  float fres=.25+.75*pow(1.-max(dot(-V,N),0.),3.);
  c=mix(vec3(.01,.02,.035),refl,fres);c=mix(c,skyLow*.8,exp(-d*26.)*.6);
 }
 // 다섯 불꽃
 for(int i=0;i<5;i++){
  float ig=smoothstep(uIgn[i],uIgn[i]+.6,t),s=t-uBrk[i];
  if(ig<=0.)continue;
  vec2 cc=C(i),q=p-cc;float r=.068*uSc,nn=i==0?0.:i==1?5.:i==2?8.:i==3?3.:6.,rot=nn<.5?0.:PI/nn;
  float fs=s/.12,flash=s>-.25&&s<.3?exp(-fs*fs)*1.4:0.;
  float f;float fade=1.;
  if(s<0.){f=flame(q,nn,r,rot,t,float(i)*7.)*ig*(1.+flash);}
  else{
   // 깨짐: 한 번 크게 일었다가 바깥으로 부풀며 조각조각 떨어져 나가 식는다(조각의 경계는 노이즈 · 방사형 줄이 생기지 않게)
   float ex=1.+.55*s+.35*s*s;vec2 q0=q/ex;
   q0+=(vec2(n(q0*9.+float(i)*3.),n(q0*9.+float(i)*3.+7.))-.5)*.025*s;
   float cell=n(q0*15./uSc+float(i)*5.)*.65+n(q0*34./uSc+float(i)*9.)*.35;
   float inSeg=smoothstep(s*.95-.12,s*.95+.04,cell);
   fade=1.-smoothstep(.1,1.3,s);
   f=flame(q0,nn,r,rot,t,float(i)*7.)*inSeg*fade*(1.+flash)+flash*exp(-abs(sdShape(q,nn,r,rot))/.02)*.6+flame(q,nn,r,rot,t,float(i)*7.)*exp(-s*9.);
  }
  if(i==3){ // 까만 불꽃: 빛을 먹는 검은 불 + 보랏빛 테두리만 은은히
   c*=1.-clamp(f*.55,0.,.85);
   c+=vec3(.5,.38,.78)*smoothstep(.25,.9,f)*(1.-smoothstep(.9,1.8,f))*.35+vec3(.6,.5,.9)*flash*.25*exp(-abs(sdShape(q,nn,r,rot))/.03);
  }else c+=shapeCol(i,f,1.);
  // 둘레를 물들이는 옅은 빛
  c+=(i==3?vec3(.2,.15,.3):shapeCol(i,1.,.12))*exp(-length(q)/(.09*uSc))*ig*fade*(i==3?.3:1.);
 }
 // 쪽빛 작살의 기운: 한가운데 세로로 흐르는 빛 · 솟을 때 한 번 퍼지는 물결
 if(uHarp>0.){
  vec2 q=p-vec2(0.,.07);
  float flow=fbm(vec2(q.x*30.,q.y*6.-t*1.4))*.6+fbm(vec2(q.x*12.+3.,q.y*3.-t*.7))*.4;
  float col=exp(-abs(q.x)/(.012+.03*flow))*smoothstep(.34,.0,abs(q.y+.02))*uHarp;
  c+=vec3(.22,.38,.95)*col*(.5+.6*flow)+vec3(.5,.66,1.)*exp(-abs(q.x)/.004)*smoothstep(.3,.0,abs(q.y))*uHarp*.35;
  float rt=t-${HARP.toFixed(2)}-.4;if(rt>0.&&rt<2.){float r=length(q*vec2(1.,1.15)),rr=rt*.22,dr=(r-rr)*7.;c+=vec3(.3,.48,1.)*exp(-dr*dr)*(1.-rt/2.)*(1.-rt/2.)*.22;}
  c+=vec3(.15,.25,.6)*exp(-length(q)*4.)*uHarp*.25;
 }
 c*=1.-.45*smoothstep(.35,1.05,length(p*vec2(.85,1.)));
 c=1.-exp(-c*1.35);
 c+=(h(gl_FragCoord.xy+fract(t*7.)*91.)-.5)*.016;
 o=vec4(c,1.);
}`;
let G=null,cv=null,fx=null,fxx=null,svg=null,raf=0,t0=0,scale=.6,acc=0,cnt=0,lastNow=0,P=[];
function init(){
 cv=document.createElement('canvas');cv.className='cef-gl';cv.setAttribute('aria-hidden','true');
 let g=null;try{g=cv.getContext('webgl2',{alpha:false,antialias:false});}catch(e){}
 if(!g)return null;
 const sh=(ty,s)=>{const x=g.createShader(ty);g.shaderSource(x,s);g.compileShader(x);if(!g.getShaderParameter(x,g.COMPILE_STATUS)){console.warn('[calamity-fx]',g.getShaderInfoLog(x));return null;}return x;};
 const v=sh(g.VERTEX_SHADER,VS),f=sh(g.FRAGMENT_SHADER,FS);if(!v||!f)return null;
 const p=g.createProgram();g.attachShader(p,v);g.attachShader(p,f);g.linkProgram(p);if(!g.getProgramParameter(p,g.LINK_STATUS))return null;
 const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),g.STATIC_DRAW);
 const va=g.createVertexArray();g.bindVertexArray(va);const l=g.getAttribLocation(p,'a');g.enableVertexAttribArray(l);g.vertexAttribPointer(l,2,g.FLOAT,false,0,0);
 const U=n=>g.getUniformLocation(p,n);
 // 작살(SVG) · 불티(Canvas 2D)
 svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','cef-harpoon');svg.setAttribute('viewBox','-60 -300 120 560');svg.setAttribute('aria-hidden','true');
 svg.innerHTML='<defs>'+
  '<linearGradient id="cefShaft" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#0b1430"/><stop offset=".4" stop-color="#1d3a86"/><stop offset=".7" stop-color="#3a64c8" class="cef-flow"/><stop offset="1" stop-color="#9ab8ff"/></linearGradient>'+
  '<linearGradient id="cefShaftX" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#000" stop-opacity=".55"/><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#cfe0ff" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>'+
  '<linearGradient id="cefHead" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e6efff"/><stop offset=".35" stop-color="#6f94e8"/><stop offset=".75" stop-color="#1f3a8a"/><stop offset="1" stop-color="#0a1230"/></linearGradient>'+
  '<linearGradient id="cefRope" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7f9ce0"/><stop offset="1" stop-color="#1a2a5a"/></linearGradient>'+
  '<filter id="cefGlow" x="-200%" y="-20%" width="500%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>'+
 '</defs>'+
 '<g class="cef-h-glow" filter="url(#cefGlow)" opacity=".75"><path d="M-3,250 L3,250 L3,-150 L-3,-150 Z M0,-290 L16,-196 L5,-180 L5,-150 L-5,-150 L-5,-180 L-16,-196 Z" fill="#3f6fe0"/></g>'+
 '<path d="M-4.5,250 L4.5,250 L4.2,-150 L-4.2,-150 Z" fill="url(#cefShaft)"/>'+
 '<path d="M-4.5,250 L4.5,250 L4.2,-150 L-4.2,-150 Z" fill="url(#cefShaftX)"/>'+
 '<path d="M-7,-118 C-7,-124 7,-124 7,-118 L7,-104 C7,-98 -7,-98 -7,-104 Z M-6.5,-82 C-6.5,-87 6.5,-87 6.5,-82 L6.5,-70 C6.5,-65 -6.5,-65 -6.5,-70 Z" fill="url(#cefRope)"/>'+
 '<path d="M-8,-150 L8,-150 L6.5,-170 L-6.5,-170 Z" fill="#14244e"/>'+
 '<path d="M0,-292 C6,-262 13,-222 17,-194 L6,-186 L5,-170 L-5,-170 L-6,-186 L-17,-194 C-13,-222 -6,-262 0,-292 Z" fill="url(#cefHead)"/>'+
 '<path d="M0,-286 C3,-258 6,-226 8,-200 L0,-196 Z" fill="#fff" opacity=".28"/>'+
 '<path d="M-17,-194 C-22,-182 -24,-170 -22,-160 C-18,-170 -12,-180 -6,-186 Z M17,-194 C22,-182 24,-170 22,-160 C18,-170 12,-180 6,-186 Z" fill="url(#cefHead)"/>';
 fx=document.createElement('canvas');fx.className='cef-fx';fx.setAttribute('aria-hidden','true');fxx=fx.getContext('2d');
 ov.insertBefore(fx,ov.firstChild);ov.insertBefore(svg,ov.firstChild);ov.insertBefore(cv,ov.firstChild);ov.classList.add('cef-on');
 return {g,p,va,u:{res:U('uRes'),t:U('uT'),harp:U('uHarp'),sc:U('uSc'),ign:U('uIgn'),brk:U('uBrk')}};
}
function sprite(rgb){const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d'),g=x.createRadialGradient(16,16,0,16,16,16);
 g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.25,'rgba('+rgb+',.6)');g.addColorStop(1,'rgba('+rgb+',0)');x.fillStyle=g;x.fillRect(0,0,32,32);return c;}
const SPR=['240,240,232','110,170,255','255,110,70','150,120,210','255,210,90','90,140,255'].map(sprite);
let fired=[0,0,0,0,0];
function frame(now){
 if(ov.hidden||!G){raf=0;return;}
 let t=(now-t0)/1000;if(ov.dataset.seek!=null)t=+ov.dataset.seek;
 if(lastNow){acc+=now-lastNow;cnt++;if(cnt>=20){if(acc/cnt>40&&scale>.3)scale*=.8;acc=0;cnt=0;}}lastNow=now;
 const W=innerWidth,H=innerHeight,dpr=Math.min(1.5,devicePixelRatio||1),w=Math.round(W*dpr*scale),hh=Math.round(H*dpr*scale);
 if(cv.width!==w||cv.height!==hh){cv.width=w;cv.height=hh;}
 const sc=Math.min(1,(W/H*.5-.03)/.32);
 const harp=Math.min(1,Math.max(0,(t-HARP)/1.4)),hk=harp*harp*(3-2*harp),dim=1-.55*Math.min(1,Math.max(0,(t-(OFF+.6))/2));
 const g=G.g;g.viewport(0,0,w,hh);g.useProgram(G.p);g.bindVertexArray(G.va);g.uniform2f(G.u.res,w,hh);g.uniform1f(G.u.t,t);g.uniform1f(G.u.harp,hk*dim);g.uniform1f(G.u.sc,sc);
 g.uniform1fv(G.u.ign,IGN);g.uniform1fv(G.u.brk,BRK);g.drawArrays(g.TRIANGLES,0,6);
 // 작살: 아래에서 한가운데로 솟아 멈춤 → 문장이 시작되면 은은하게
 const rise=1-hk;svg.style.opacity=(hk*dim).toFixed(3);svg.style.transform='translate(-50%,-50%) translateY('+(rise*38).toFixed(2)+'vh)';
 const fl=svg.querySelector('.cef-flow');if(fl)fl.setAttribute('offset',(.55+.3*Math.sin(t*1.6)).toFixed(3));
 // 불티
 const fw=Math.round(W*dpr),fh=Math.round(H*dpr);if(fx.width!==fw||fx.height!==fh){fx.width=fw;fx.height=fh;}
 const x=fxx,U=H*dpr,cx=fw/2,cy=fh/2;x.clearRect(0,0,fw,fh);
 for(let i=0;i<5;i++)if(!fired[i]&&t>=BRK[i]){fired[i]=1;const a=Math.PI*.5-i*2*Math.PI/5,px=Math.cos(a)*.23*sc,py=Math.sin(a)*.23*sc+.07;
  for(let k=0;k<46;k++){const an=Math.random()*Math.PI*2,sp=.05+Math.random()*.16;P.push({x:px+Math.cos(an)*.06*sc,y:py+Math.sin(an)*.06*sc,vx:Math.cos(an)*sp*.6,vy:Math.sin(an)*sp*.6+.04,life:0,max:.9+Math.random()*1.3,s:.004+Math.random()*.007,c:i});}}
 if(t<.1){fired=[0,0,0,0,0];P=[];}
 if(harp>0&&Math.random()<.6*dim)P.push({x:(Math.random()-.5)*.03,y:-.25+Math.random()*.5,vx:(Math.random()-.5)*.01,vy:.03+Math.random()*.04,life:0,max:1.4+Math.random(),s:.003+Math.random()*.005,c:5});
 x.globalCompositeOperation='lighter';
 const dt=1/60;
 for(let i=P.length-1;i>=0;i--){const q=P[i];q.life+=dt;if(q.life>q.max){P.splice(i,1);continue;}q.vx*=1-dt*1.6;q.vy=q.vy*(1-dt*1.6)+dt*.03;q.x+=q.vx*dt;q.y+=q.vy*dt;
  const u=q.life/q.max,al=(1-u)*(q.c===3?.6:.9),s=q.s*U*(1-u*.5);x.globalAlpha=al;x.drawImage(SPR[q.c],cx+q.x*U-s,cy-q.y*U-s,s*2,s*2);}
 x.globalAlpha=1;x.globalCompositeOperation='source-over';
 raf=requestAnimationFrame(frame);
}
function start(){
 if(!window.WebGL2RenderingContext)return;
 if(!G)G=init();if(!G)return;
 t0=performance.now();lastNow=0;fired=[0,0,0,0,0];P=[];if(!raf)raf=requestAnimationFrame(frame);
}
new MutationObserver(()=>{if(!ov.hidden&&ov.classList.contains('calamity-ending-play-v100'))start();}).observe(ov,{attributes:true,attributeFilter:['class','hidden']});
if(!ov.hidden&&ov.classList.contains('calamity-ending-play-v100'))start();

// 글자: 연출이 끝난 뒤(OFF초)부터 기존 순서대로, 빛 띠가 지나가며 드러남
const base=[2.1,3.5,5,6.5,7.9,9.5,11,12.8];
const sel='.calamity-ending-v100.cef-on.calamity-ending-play-v100 ';
const mask='-webkit-mask-image:linear-gradient(100deg,#000 0 38%,rgba(0,0,0,.25) 50%,transparent 62%);mask-image:linear-gradient(100deg,#000 0 38%,rgba(0,0,0,.25) 50%,transparent 62%);-webkit-mask-size:300% 100%;mask-size:300% 100%;-webkit-mask-position:100% 0;mask-position:100% 0;';
const css=
 '.cef-gl,.cef-fx{position:fixed;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0}'+
 '.cef-harpoon{position:fixed;left:50%;top:43%;height:min(62vh,560px);width:auto;pointer-events:none;z-index:0;opacity:0;transform:translate(-50%,-50%)}'+
 '.calamity-ending-v100.cef-on .calamity-sea-v100,.calamity-ending-v100.cef-on .calamity-five-lights-v100{display:none}'+
 '.calamity-ending-v100.cef-on .calamity-end-story-v100 p{text-shadow:0 0 10px rgba(0,0,0,.92),0 0 3px rgba(0,0,0,.85),0 0 24px rgba(90,130,220,.18)}'+
 sel+'.calamity-end-kicker-v100{animation:cefLine 1.2s '+(OFF-.2)+'s both}'+
 sel+'.calamity-end-story-v100 p{'+mask+'}'+
 base.map((d,i)=>sel+'.calamity-end-story-v100 p:nth-child('+(i+1)+'){animation:cefLine 1.6s '+(d+OFF-1.6).toFixed(1)+'s both,cefSweep 2.2s cubic-bezier(.3,.6,.3,1) '+(d+OFF-1.6).toFixed(1)+'s both}').join('')+
 sel+'.calamity-end-title-v100{animation:cefLine 1.9s '+(15+OFF-1.6).toFixed(1)+'s both}'+
 '@keyframes cefLine{from{opacity:0;transform:translateY(6px);filter:blur(2px)}to{opacity:1;transform:none;filter:blur(0)}}'+
 '@keyframes cefSweep{from{-webkit-mask-position:100% 0;mask-position:100% 0}to{-webkit-mask-position:0 0;mask-position:0 0}}'+
 '.cef-em{font-style:normal;font-weight:600;color:#cfe0ff;animation:cefShim 5.2s ease-in-out infinite}'+
 '.calamity-ending-v100.cef-on .cef-em{text-shadow:0 0 10px rgba(110,150,255,.5),0 0 22px rgba(80,120,230,.25),0 0 3px rgba(0,0,0,.9)}'+
 '.calamity-end-quote-v100 .cef-em{animation:cefShimQ 4.6s ease-in-out infinite}'+
 '@keyframes cefShim{0%,100%{color:#a9c2ff}50%{color:#eef3ff}}'+
 '@keyframes cefShimQ{0%,100%{color:#8fb0ff}50%{color:#f4e6c8}}'+
 '@media(prefers-reduced-motion:reduce){.calamity-ending-v100 .calamity-end-story-v100 p{-webkit-mask-image:none!important;mask-image:none!important}.cef-em{animation:none}}';
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
})();
