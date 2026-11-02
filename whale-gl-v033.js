/* 재앙의 고래 장면 셰이더 대기(v0.3.3)
   다섯 재앙의 고래 장면(조우 · 사냥 미니게임 · 최후) 위에 WebGL2 셰이더로 고래마다 다른 '공기'를 얇게 덧씌운다.
   기존 그림(SVG)과 판정 HUD는 그대로 두고, 그 사이 층(z-index 5)에서 반투명하게만 그린다(과하지 않게, 최대 불투명도 약 0.4).
   · 창백한 고래: 뼈처럼 흰 산성 안개가 아래에서 느리게 일렁이고, 창백한 포자가 위로 떠오른다.
   · 푸른 고래: 수면을 통과한 빛의 그물(코스틱)이 흔들리고, 위에서 차가운 빛줄기가 비스듬히 내려오며 찬 안개가 흐른다.
   · 붉은 고래: 아래에서 붉은 열기가 맥동하고, 그을음 낀 연기가 피어오르며 불티가 날린다.
   · 까만 고래: 화면 가장자리에서 먹물 같은 어둠이 덩굴처럼 스며들고, 아주 멀리 등불 같은 빛점이 희미하게 깜빡인다.
   · 노란 고래: 탁한 황토빛 흙탕이 가운데로 감겨 들고(소용돌이), 떠다니는 흙 알갱이가 빨려 든다.
   보이지 않을 때는 그리지 않고, 장면이 사라지면 GL 문맥을 바로 돌려준다. WebGL2가 없으면 아무것도 하지 않는다. */
(function(){
'use strict';
const FS=`#version 300 es
precision highp float;precision highp int;
uniform vec2 uRes;uniform float uT;uniform int uK;uniform float uI;out vec4 o;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec2 hash2(vec2 p){float n=hash(p);return vec2(n,hash(p+n*17.13+3.1));}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<4;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}
// 격자 칸마다 하나씩 떠다니는 알갱이(위치 · 깜빡임은 칸의 씨앗으로)
float motes(vec2 p,float sc,vec2 vel,float t,float sz,float dens){vec2 q=p*sc+vel*t;vec2 id=floor(q),f=fract(q)-.5;
 vec2 of=(hash2(id)-.5)*.7+vec2(sin(t*.7+hash(id)*9.)*.08,cos(t*.6+hash(id+3.)*9.)*.08);
 float on=step(1.-dens,hash(id+7.31)),tw=.55+.45*sin(t*(1.5+2.*hash(id+1.7))+hash(id)*20.);
 return smoothstep(sz,0.,length(f-of))*on*tw;}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes,p=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uT;
 vec3 c=vec3(0.);float a=0.;
 if(uK==0){ // 창백한: 산성 안개 + 포자
  vec2 w=vec2(fbm(p*1.6+vec2(t*.03,0.)),fbm(p*1.6+vec2(4.,-t*.025)));
  float m=fbm(p*2.2+w*1.6+vec2(-t*.05,t*.02));
  float low=smoothstep(.75,.05,uv.y);
  float mist=smoothstep(.42,.82,m)*(.35+.65*low);
  c=vec3(.84,.93,.86);a=mist*.26;
  float sp=motes(p,9.,vec2(.05,-.35),t,.07,.35)+motes(p,15.,vec2(-.03,-.5),t,.06,.3)*.7;
  c=mix(c,vec3(.95,1.,.92),clamp(sp,0.,1.));a=max(a,sp*.55);
 }else if(uK==1){ // 푸른: 코스틱 + 빛줄기 + 찬 안개
  vec2 q=p*5.+vec2(fbm(p*2.+t*.1),fbm(p*2.-t*.08))*1.2;
  float n=fbm(q+vec2(t*.15,-t*.1));
  float caus=pow(1.-abs(n*2.-1.),9.)+.6*pow(1.-abs(fbm(q*1.7-t*.12)*2.-1.),12.);
  float water=smoothstep(.5,.36,uv.y);   // 코스틱은 수면 아래(물속)에서만
  float rays=pow(fbm(vec2((p.x+p.y*.45)*6.,t*.08)),3.)*1.6*smoothstep(.45,1.,uv.y);
  float fog=smoothstep(.45,.8,fbm(p*1.8+vec2(t*.04,0.)))*smoothstep(.65,.1,uv.y);
  float L=caus*.9*water*(.5+.5*smoothstep(0.,.4,uv.y))+rays,F=fog;
  a=clamp(L*.17+F*.18,0.,.4);c=(vec3(.62,.88,1.)*L+vec3(.55,.75,.9)*F)/max(L+F,1e-3);
 }else if(uK==2){ // 붉은: 아래의 열기 + 연기 + 불티
  float pulse=.75+.25*sin(t*1.7)+.12*sin(t*4.3);
  float heat=smoothstep(.55,0.,uv.y)*pulse;
  float smoke=smoothstep(.45,.85,fbm(vec2(p.x*2.2,p.y*1.6-t*.12)+fbm(p*3.+t*.05)))*smoothstep(.95,.25,uv.y);
  float emb=motes(p,10.,vec2(.04,-.55),t,.06,.3)+motes(p,18.,vec2(-.05,-.8),t,.05,.25)*.8;
  float wH=heat*.2,wS=smoke*.22,wE=emb*.7;a=clamp(wH+wS+wE,0.,.45);
  c=(vec3(1.,.32,.12)*wH+vec3(.16,.05,.04)*wS+vec3(1.,.66,.3)*wE)/max(wH+wS+wE,1e-3);
 }else if(uK==3){ // 까만: 가장자리에서 스미는 어둠 + 먼 빛점
  float r=length(p*vec2(.85,1.25));
  float v=fbm(p*2.6+vec2(t*.04,-t*.03))+.4*fbm(p*6.-t*.06);
  float ink=smoothstep(.42,.9,r+(v-.6)*.42+.04*sin(t*.6));
  float lamp=motes(p,7.,vec2(0.,0.),t*.6,.05,.12)*(.5+.5*sin(t*1.3));
  c=vec3(.0,.0,.012);a=ink*.62;
  c=mix(c,vec3(.95,.92,.8),clamp(lamp*(1.-ink),0.,1.));a=max(a,lamp*.45*(1.-ink));
 }else{ // 노란: 가운데로 감겨 드는 흙탕 + 흙 알갱이
  vec2 cp=(p-vec2(0.,-.2))*vec2(1.,2.4);float r=length(cp),th=atan(cp.y,cp.x);   // 수면에 눌린 소용돌이(장면의 소용돌이 자리)
  float sw=th+t*.18+1.8/(r+.25);
  float silt=fbm(vec2(sw*1.6,log(r+.05)*2.4-t*.25));
  float mur=smoothstep(.4,.8,silt)*smoothstep(.9,.15,r)*smoothstep(.56,.4,uv.y)+.35*smoothstep(.5,.85,fbm(p*1.5+vec2(t*.03,0.)))*smoothstep(.75,.35,uv.y)*(1.-smoothstep(.9,.15,r));
  vec2 rp=vec2(cos(th+t*.25/(r+.3)),sin(th+t*.25/(r+.3)))*r;
  float mo=motes(rp,11.,vec2(0.),t,.06,.3)*smoothstep(.95,.2,r)*smoothstep(.55,.38,uv.y);
  float wM=mur*.24,wO=mo*.5;a=clamp(wM+wO,0.,.4);c=(vec3(.62,.48,.2)*wM+vec3(1.,.86,.5)*wO)/max(wM+wO,1e-3);
 }
 a*=uI;
 o=vec4(c*a,a);
}`;
const VS=`#version 300 es
in vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;
function prog(g){const mk=(t,s)=>{const x=g.createShader(t);g.shaderSource(x,s);g.compileShader(x);if(!g.getShaderParameter(x,g.COMPILE_STATUS)){console.warn(g.getShaderInfoLog(x));return null;}return x;};
 const v=mk(g.VERTEX_SHADER,VS),f=mk(g.FRAGMENT_SHADER,FS);if(!v||!f)return null;const p=g.createProgram();g.attachShader(p,v);g.attachShader(p,f);g.linkProgram(p);return g.getProgramParameter(p,g.LINK_STATUS)?p:null;}
function kindOf(el){
 if(el.classList.contains('bw3-scene'))return 1;
 if(el.classList.contains('rw3-scene'))return 2;
 if(el.classList.contains('bk3-scene'))return 3;
 if(el.classList.contains('yw3-scene'))return 4;
 if(el.classList.contains('wd-scene')){const k=String(el.dataset.kind||'');return k.startsWith('blue')?1:k.startsWith('red')?2:k.startsWith('black')?3:k.startsWith('yellow')?4:0;}
 return 0;
}
const reduce=(()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}})();
const live=new Set();
function attach(el){
 if(el.dataset.wgl)return;el.dataset.wgl='1';
 const c=document.createElement('canvas');c.className='wgl-air';c.setAttribute('aria-hidden','true');
 let g=null;try{g=c.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false});}catch(e){}
 if(!g)return;
 const p=prog(g);if(!p)return;
 el.appendChild(c);
 const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),g.STATIC_DRAW);
 const va=g.createVertexArray();g.bindVertexArray(va);const l=g.getAttribLocation(p,'aP');g.enableVertexAttribArray(l);g.vertexAttribPointer(l,2,g.FLOAT,false,0,0);
 const U={res:g.getUniformLocation(p,'uRes'),t:g.getUniformLocation(p,'uT'),k:g.getUniformLocation(p,'uK'),i:g.getUniformLocation(p,'uI')};
 const kind=kindOf(el),t0=performance.now()-Math.random()*20000;let visible=true,io=null,raf=0,fade=0,scale=.5,acc=0,n=0,last=performance.now();
 try{io=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);},{threshold:0});io.observe(el);}catch(e){}
 const item={el,stop(){cancelAnimationFrame(raf);try{io&&io.disconnect();}catch(e){}try{const x=g.getExtension('WEBGL_lose_context');x&&x.loseContext();}catch(e){}c.remove();live.delete(item);}};
 live.add(item);
 const frame=()=>{
  if(!el.isConnected){item.stop();return;}
  raf=requestAnimationFrame(frame);
  if(!visible||document.hidden)return;
  const now=performance.now();acc+=now-last;last=now;n++;if(n>=30){if(acc/n>40&&scale>.26)scale*=.8;acc=0;n=0;}
  const w=Math.max(1,Math.round(el.clientWidth*scale*Math.min(2,devicePixelRatio||1))),h=Math.max(1,Math.round(el.clientHeight*scale*Math.min(2,devicePixelRatio||1)));
  if(c.width!==w||c.height!==h){c.width=w;c.height=h;}
  fade=Math.min(1,fade+.02);
  g.viewport(0,0,w,h);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT);g.useProgram(p);g.bindVertexArray(va);
  g.uniform2f(U.res,w,h);g.uniform1f(U.t,(now-t0)/1000*(reduce?.4:1));g.uniform1i(U.k,kind);g.uniform1f(U.i,fade);
  g.drawArrays(g.TRIANGLE_STRIP,0,4);
 };
 raf=requestAnimationFrame(frame);
}
const st=document.createElement('style');st.textContent='.pallid-cine-v2 .wgl-air{position:absolute;inset:0;width:100%;height:100%;z-index:5;pointer-events:none;display:block}';document.head.appendChild(st);
function scan(){document.querySelectorAll('.pallid-cine-v2:not([data-wgl])').forEach(attach);}
let pend=false;
const mo=new MutationObserver(()=>{if(pend)return;pend=true;requestAnimationFrame(()=>{pend=false;scan();});});
function start(){try{if(!document.createElement('canvas').getContext('webgl2'))return;}catch(e){return;}mo.observe(document.body,{childList:true,subtree:true});scan();}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
window.WhaleGL033={scan,live:()=>live.size};
})();
