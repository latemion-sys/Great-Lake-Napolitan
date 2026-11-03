/* Great Lake v0.3.8 · 재앙의 고래를 만나기 직전의 경고(다섯 고래 공통)
   다섯 재앙은 법칙에 묶이지 않고 떠돌며, 언제나 배를 찾아낸다 — 몸이 보이기 전에 호수가 먼저 바뀐다.
   조우 장면이 처음 열릴 때 화면 전체를 잠깐 덮어(정신력 0의 목소리처럼) 징조를 보여 준 뒤 걷힌다.
   - 셰이더: 어둠이 가장자리에서 조여 들고, 아래(물속)에서 무언가 다가오는 압력이 심장 박동처럼 점점 빠르게 밀려옴.
             고래마다 다른 징조의 결(창백한 포자 안개 · 차가운 물살 · 일렁이는 열기 · 꺼져 가는 별 · 감겨 드는 유황 안개).
   - 글: 고래마다의 징조 한 줄 → "법칙이 닿지 않는 것이 다가옵니다." → 고래의 이름.
   - 과하지 않게: 선 · 도형 없이 부드러운 빛과 어둠만, 박동마다 아주 작은 흔들림. 화면을 누르면 건너뜀. WebGL2가 없으면 글과 어둠만. */
(function(){
'use strict';
if(typeof render!=='function')return;
const OMEN=['물빛이 하얗게 흐려집니다.','물밑으로 무언가 빠르게 지나갑니다.','갑자기 공기가 뜨거워집니다. 해가 뜬 것도 아닌데.','수평선의 별이 아래에서부터 하나씩 꺼집니다.','떠다니던 것들이 한쪽으로 끌려갑니다.'];
const NAMES=['모든 것을 삼키는 창백한 고래','모든 것을 뚫는 푸른 고래','모든 것을 말리는 붉은 고래','모든 것을 감싸안는 검은 고래','모든 것을 가라앉히는 노란 고래'];
const TINT=[[.86,.92,.88],[.5,.8,1.],[1.,.42,.22],[.55,.62,.78],[1.,.78,.36]];
const DUR=6.8,OUT=1.9;
const reduce=(()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}})();
const FS=`#version 300 es
precision highp float;
uniform vec2 uRes;uniform float uT,uK,uOut;uniform vec3 uC;out vec4 o;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
// 박동 시각(점점 빨라짐)
float beat(float t){float b=0.;for(int i=0;i<5;i++){float at=.5+float(i)*1.05-float(i*i)*.09;float d=t-at;b+=exp(-d*d/.012)+.5*exp(-(d-.22)*(d-.22)/.01);}return b;}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes,p=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uT;
 vec3 c=vec3(.006,.008,.012);
 // 아래(물속)에서 밀려오는 압력: 넓고 부드러운 빛의 숨결이 박동마다 차올랐다 가라앉음
 float b=beat(t),rise=smoothstep(0.,4.5,t);
 vec2 q=p-vec2(0.,-.95);float r=length(q*vec2(.7,1.));
 float press=exp(-r*r/(.35+.25*rise))*(.25+.75*rise)*(.55+.45*fbm(q*2.+vec2(0.,-t*.3)));
 c+=uC*press*(.16+.5*b);
 // 고래마다의 징조 결
 float tex=0.;
 if(uK<.5)tex=smoothstep(.55,.85,fbm(p*2.5+vec2(t*.04,-t*.12)))*.5;                                  // 창백한 포자 안개
 else if(uK<1.5)tex=pow(fbm(vec2(p.x*1.2-t*1.6,p.y*9.)),4.)*1.6*smoothstep(.2,-.45,p.y);              // 물밑을 빠르게 지나가는 차가운 물살
 else if(uK<2.5){vec2 hq=vec2(p.x*1.5,p.y*2.-t*.5);hq+=vec2(fbm(hq*1.5+t*.2),fbm(hq*1.5-t*.2))*.7;tex=smoothstep(.55,.85,fbm(hq*1.6))*.45;}   // 일렁이는 열기
 else if(uK<3.5){vec2 g=p*14.;vec2 id=floor(g),f=fract(g)-.5;float s=step(.86,h(id));float off=step(h(id+3.)*.9-.45,-p.y-.5+t*.22);   // 아래부터 꺼지는 별
  tex=s*smoothstep(.08,0.,length(f-(vec2(h(id+1.),h(id+2.))-.5)*.6))*(1.-off)*(.6+.4*sin(t*3.+h(id)*20.))*1.4;}
 else{float a=atan(p.y,p.x),rr=length(p);tex=smoothstep(.5,.82,fbm(vec2(a*2.-rr*3.+t*.5,rr*2.)))*exp(-rr*1.2)*.6;}     // 가운데로 감겨 드는 유황 안개
 c+=uC*tex*(.35+.65*rise);
 // 가장자리에서 조여 드는 어둠(박동마다 조금씩 더)
 float v=length(p*vec2(.9,1.15));float close=1.5-.55*smoothstep(0.,1.6,t)-.28*rise-.03*b;
 float vign=smoothstep(close-.35,close+.15,v+(fbm(p*3.+t*.1)-.5)*.12);
 c*=1.-.9*vign;
 c+=(h(gl_FragCoord.xy+fract(t)*91.)-.5)*.018;   // 결
 // 걷힘: 가운데부터 잡음 낀 가장자리로 부드럽게 열려 장면이 드러남
 float vr=length(p*vec2(.85,1.1))+(fbm(p*2.2+t*.15)-.5)*.25;
 float rev=uOut*2.3-.45,a=smoothstep(rev-.6,rev+.15,vr);
 a*=smoothstep(0.,1.1,t);   // 열림: 처음 한동안 바탕이 비쳐 보이다 어두워짐
 o=vec4(c*a,a);
}`;
let ov=null,raf=0;
function glSetup(cv){
 let g=null;try{g=cv.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false});}catch(e){}
 if(!g)return null;
 const sh=(t,s)=>{const x=g.createShader(t);g.shaderSource(x,s);g.compileShader(x);return g.getShaderParameter(x,g.COMPILE_STATUS)?x:null;};
 const vs=sh(g.VERTEX_SHADER,'#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'),fs=sh(g.FRAGMENT_SHADER,FS);if(!vs||!fs)return null;
 const p=g.createProgram();g.attachShader(p,vs);g.attachShader(p,fs);g.linkProgram(p);if(!g.getProgramParameter(p,g.LINK_STATUS))return null;
 const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),g.STATIC_DRAW);
 const l=g.getAttribLocation(p,'a');g.enableVertexAttribArray(l);g.vertexAttribPointer(l,2,g.FLOAT,false,0,0);
 return {g,p,u:{res:g.getUniformLocation(p,'uRes'),t:g.getUniformLocation(p,'uT'),k:g.getUniformLocation(p,'uK'),o:g.getUniformLocation(p,'uOut'),c:g.getUniformLocation(p,'uC')}};
}
function close(fast){if(!ov||ov.closing!=null)return;ov.closing=performance.now();ov.outDur=fast?.8:OUT;ov.el.classList.add('leaving');}
function show(k){
 if(ov)return;
 const el=document.createElement('div');el.className='co-ov';el.setAttribute('role','dialog');el.setAttribute('aria-label','경고 · '+NAMES[k]);
 el.innerHTML='<canvas class="co-gl" aria-hidden="true"></canvas><div class="co-c"><p class="co-l co-1"></p><p class="co-l co-2"></p><p class="co-l co-3"></p></div><div class="co-skip">화면을 누르면 건너뜁니다</div>';
 document.body.appendChild(el);
 const cv=el.querySelector('canvas'),G=glSetup(cv),c=el.querySelector('.co-c');if(!G)el.classList.add('nogl');
 const L=[el.querySelector('.co-1'),el.querySelector('.co-2'),el.querySelector('.co-3')];
 L[0].textContent=OMEN[k];L[1].textContent='법칙이 닿지 않는 것이 다가옵니다.';L[2].textContent=NAMES[k];
 const T0=performance.now(),shown=[0,0,0],at=[.7,2.3,3.6],beats=[.5,1.46,2.24,2.84,3.26].map(x=>x+.0);let bi=0;
 ov={el,closing:null};el.addEventListener('click',()=>close(true));
 const step=now=>{if(!ov||ov.el!==el)return;const t=(now-T0)/1000;
  for(let i=0;i<3;i++)if(!shown[i]&&t>=at[i]){shown[i]=1;L[i].classList.add('on');}
  while(bi<beats.length&&t>=beats[bi]){bi++;if(!reduce)c.animate([{transform:'scale(1)'},{transform:'scale(1.008)'},{transform:'scale(1)'}],{duration:520,easing:'cubic-bezier(.3,.7,.3,1)'});}   // 박동마다 숨 쉬듯 아주 살짝
  if(t>=DUR-OUT&&ov.closing==null)close();
  const out=ov.closing!=null?Math.min(1,(now-ov.closing)/1000/ov.outDur):0;
  if(ov.closing!=null){const fo=Math.max(0,1-out*1.8);c.style.opacity=fo.toFixed(3);c.style.filter='blur('+(out*4).toFixed(2)+'px)';el.style.pointerEvents=out>.3?'none':'';}
  if(G){const dpr=Math.min(1.5,window.devicePixelRatio||1),w=Math.round(innerWidth*dpr*.6),h=Math.round(innerHeight*dpr*.6);if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
   const g=G.g;g.viewport(0,0,w,h);g.useProgram(G.p);g.uniform2f(G.u.res,w,h);g.uniform1f(G.u.t,t);g.uniform1f(G.u.k,k);g.uniform1f(G.u.o,ov.closing!=null?Math.min(1,(now-ov.closing)/1000/ov.outDur)*(1.)+0:0);g.uniform3f(G.u.c,TINT[k][0],TINT[k][1],TINT[k][2]);g.drawArrays(g.TRIANGLES,0,6);}
  if(ov.closing!=null&&out>=1){const e=ov.el;ov=null;try{e.remove();}catch(x){}return;}
  if(!G&&ov.closing!=null)el.style.opacity=(1-out).toFixed(3);
  raf=requestAnimationFrame(step);};
 raf=requestAnimationFrame(step);
}
const seen=new Set();let lastKey=null;
function check(){
 try{
  if(typeof state==='undefined'||!state)return;
  const on=state.sea&&state.scene==='encounter'&&state.encounter!=null&&state.encounter>=0&&state.encounter<5;
  const key=on?[state.voyage||0,state.current,state.encounter,(state.count&&state.count.lake)||0].join(':'):null;
  if(key&&key!==lastKey&&!seen.has(key)){seen.add(key);show(state.encounter);}
  lastKey=key;
 }catch(e){}
}
const before=render;
render=function(){const r=before.apply(this,arguments);check();return r;};
const css='.co-ov{position:fixed;inset:0;z-index:2147483000;background:transparent;color:#e8e2d6;display:flex;align-items:center;justify-content:center;cursor:pointer;animation:co-in 1s cubic-bezier(.3,.6,.3,1) both}'+
 '@keyframes co-in{from{opacity:0}to{opacity:1}}'+
 '.co-ov.nogl{background:#010203}'+
 '.co-gl{position:absolute;inset:0;width:100%;height:100%;display:block}'+
 '.co-c{position:relative;z-index:1;text-align:center;padding:0 24px;max-width:760px;will-change:opacity,filter,transform}'+
 '.co-l{margin:14px 0;opacity:0;filter:blur(8px);transform:translateY(8px);transition:opacity 1.8s cubic-bezier(.25,.6,.3,1),filter 2s cubic-bezier(.25,.6,.3,1),transform 2.2s cubic-bezier(.25,.6,.3,1);line-height:1.7;word-break:keep-all;text-shadow:0 0 12px rgba(0,0,0,.9),0 0 3px rgba(0,0,0,.9)}'+
 '.co-l.on{opacity:1;filter:none;transform:none}'+
 '.co-1{font-size:clamp(15px,2.3vw,19px);color:#cfd6d8}.co-2{font-size:clamp(14px,2vw,16px);color:#9aa3a8;letter-spacing:.08em}'+
 '.co-3{font-size:clamp(19px,3.2vw,27px);letter-spacing:.14em;color:#f2ece0;margin-top:26px}'+
 '.co-skip{position:absolute;bottom:18px;left:0;right:0;text-align:center;font-size:12px;color:#ffffff55;z-index:1}'+
 '@media(prefers-reduced-motion:reduce){.co-l{transition:opacity .6s ease}}';
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
window.CalamityOmen={show,close};
})();
