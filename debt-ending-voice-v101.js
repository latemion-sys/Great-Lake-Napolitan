/* v.1.0.1 · 빚을 다 갚은 엔딩의 글자 연출
   정신력 0의 '목소리'처럼: 문장이 빛 띠가 지나가듯 드러나고 핵심어가 은은히 일렁인다.
   바탕은 햇살 대신 잔잔하게 일렁이는 새벽 호수(WebGL 셰이더 · 긴 너울과 잔물결 · 낮게 깔린 빛 띠의 반영 · 옅은 안개).
   문장이 하나 드러날 때마다 수면 가운데서 아주 옅은 물결 하나가 번진다.
   WebGL이 없으면 기존 바다 그라데이션 그대로. 소리는 쓰지 않는다. */
(function(){
'use strict';
const ov=document.getElementById('debtEnding100');
if(!ov)return;
const LINES=[1,3,5,7.4];   // 문장이 드러나는 시각(기존 엔딩 CSS와 같음)

// 핵심어 강조
const EM=['800만 안','사라졌다','돌아가도 된다','오롯이 당신의 선택'];
ov.querySelectorAll('.debt-ending-lines-v100 p').forEach(p=>{
 let h=p.innerHTML;EM.forEach(w=>{h=h.split(w).join('<em class="dee-em">'+w+'</em>');});p.innerHTML=h;
});

const VS=`#version 300 es
in vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const FS=`#version 300 es
precision highp float;
uniform vec2 uRes;uniform float uT;uniform vec4 uRip;out vec4 o;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<4;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}
// 수면 높이: 길고 느린 너울 몇 겹 + 잔물결(도메인 워핑) · 문장마다 번지는 물결
float wave(vec2 w,float t){
 float s=sin(w.x*.55+w.y*.18+t*.42)*.5+sin(w.x*-.31+w.y*.42+t*.33)*.35+sin(w.x*.9-w.y*.26-t*.51)*.18;
 vec2 q=w*.9+vec2(fbm(w*.35+t*.04),fbm(w*.35-t*.05+3.))*1.6;
 s+=(fbm(q+vec2(t*.07,-t*.05))-.5)*.55;
 for(int i=0;i<4;i++){float rt=t-uRip[i];if(rt>0.&&rt<6.){float r=length(w-vec2(0.,9.)),rr=rt*1.6;s+=sin((r-rr)*3.2)*exp(-pow((r-rr)*.9,2.))*.35*exp(-rt*.55);}}
 return s;
}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes,p=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uT;
 float hor=.16;                          // 수평선(가운데보다 조금 위)
 vec3 c;
 vec3 skyTop=vec3(.03,.05,.08),skyLow=vec3(.2,.2,.26),glowC=vec3(.86,.68,.52);
 if(p.y>hor){
  float y=p.y-hor;
  c=mix(skyLow,skyTop,smoothstep(0.,.42,y));
  c+=glowC*exp(-y*9.)*.22*(.85+.15*sin(t*.2));
  c+=glowC*.05*smoothstep(.45,.75,fbm(vec2(p.x*1.6+t*.01,y*7.)))*exp(-y*4.);
 }else{
  float d=hor-p.y;                        // 수평선에서 내려온 거리(원근)
  float z=.08/(d+.012);                    // 깊이
  vec2 w=vec2(p.x*z*9.,z*7.);
  float e=.05,H0=wave(w,t),Hx=wave(w+vec2(e,0.),t),Hy=wave(w+vec2(0.,e),t);
  vec3 N=normalize(vec3(-(Hx-H0)/e*.16,1.,-(Hy-H0)/e*.16));
  vec3 V=normalize(vec3(p.x,-.18-d*.6,1.)),R=reflect(V,N);
  float up=clamp(R.y,0.,1.);
  vec3 refl=mix(skyLow*1.05,skyTop,smoothstep(.0,.5,up));
  // 수평선 가까이 낮게 깔린 빛 띠가 물결 결을 따라 길게 비침
  float band=exp(-abs(R.x)*2.6)*exp(-up*7.);
  refl+=glowC*band*.55;
  float fres=.25+.75*pow(1.-max(dot(-V,N),0.),3.);
  vec3 deep=vec3(.015,.03,.045);
  c=mix(deep,refl,fres);
  c+=glowC*pow(max(0.,1.-abs(p.x)*1.4),2.)*exp(-d*5.)*.08*(.6+.4*sin(H0*3.+t));
  c=mix(c,skyLow*.8,exp(-d*26.)*.6);     // 수평선의 옅은 안개
 }
 c*=1.-.45*smoothstep(.35,1.05,length(p*vec2(.85,1.)));
 c=1.-exp(-c*1.35);
 c+=(h(gl_FragCoord.xy+fract(t*7.)*91.)-.5)*.016;
 o=vec4(c,1.);
}`;
let G=null,cv=null,raf=0,t0=0;
function init(){
 cv=document.createElement('canvas');cv.className='dee-gl';cv.setAttribute('aria-hidden','true');
 let g=null;try{g=cv.getContext('webgl2',{alpha:false,antialias:false});}catch(e){}
 if(!g)return null;
 const sh=(ty,s)=>{const x=g.createShader(ty);g.shaderSource(x,s);g.compileShader(x);if(!g.getShaderParameter(x,g.COMPILE_STATUS)){console.warn('[debt-voice]',g.getShaderInfoLog(x));return null;}return x;};
 const v=sh(g.VERTEX_SHADER,VS),f=sh(g.FRAGMENT_SHADER,FS);if(!v||!f)return null;
 const p=g.createProgram();g.attachShader(p,v);g.attachShader(p,f);g.linkProgram(p);if(!g.getProgramParameter(p,g.LINK_STATUS))return null;
 const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),g.STATIC_DRAW);
 const va=g.createVertexArray();g.bindVertexArray(va);const l=g.getAttribLocation(p,'a');g.enableVertexAttribArray(l);g.vertexAttribPointer(l,2,g.FLOAT,false,0,0);
 ov.insertBefore(cv,ov.firstChild);ov.classList.add('dee-on');
 return {g,p,va,u:{res:g.getUniformLocation(p,'uRes'),t:g.getUniformLocation(p,'uT'),rip:g.getUniformLocation(p,'uRip')}};
}
let scale=.6,acc=0,cnt=0,lastNow=0;
function frame(now){
 if(ov.hidden||!G){raf=0;return;}
 const t=(now-t0)/1000;
 if(lastNow){acc+=now-lastNow;cnt++;if(cnt>=20){if(acc/cnt>40&&scale>.3)scale*=.8;acc=0;cnt=0;}}lastNow=now;
 const dpr=Math.min(1.5,devicePixelRatio||1),w=Math.round(innerWidth*dpr*scale),hh=Math.round(innerHeight*dpr*scale);
 if(cv.width!==w||cv.height!==hh){cv.width=w;cv.height=hh;}
 const g=G.g;g.viewport(0,0,w,hh);g.useProgram(G.p);g.bindVertexArray(G.va);g.uniform2f(G.u.res,w,hh);g.uniform1f(G.u.t,t+20.);g.uniform4f(G.u.rip,LINES[0]+20.,LINES[1]+20.,LINES[2]+20.,LINES[3]+20.);
 g.drawArrays(g.TRIANGLES,0,6);
 raf=requestAnimationFrame(frame);
}
function start(){
 if(!window.WebGL2RenderingContext)return;
 if(!G)G=init();if(!G)return;
 t0=performance.now();lastNow=0;if(!raf)raf=requestAnimationFrame(frame);
}
// 엔딩이 열릴 때(재생 클래스가 붙을 때)마다 처음부터
new MutationObserver(()=>{if(!ov.hidden&&ov.classList.contains('debt-ending-playing-v100'))start();}).observe(ov,{attributes:true,attributeFilter:['class','hidden']});
if(!ov.hidden&&ov.classList.contains('debt-ending-playing-v100'))start();

const css=
 '.dee-gl{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}'+
 '.debt-ending-v100.dee-on .debt-ending-sea-v100{display:none}'+
 '.debt-ending-v100.dee-on .debt-ending-lines-v100 p{color:#f1e4cc;text-shadow:0 0 10px rgba(0,0,0,.9),0 0 3px rgba(0,0,0,.85),0 0 26px rgba(214,176,128,.18)}'+
 '.debt-ending-v100.dee-on .debt-ending-lines-v100 p:first-child{color:#f4dfbd}'+
 '.debt-ending-v100.dee-on .debt-ending-last-v100{color:#fff6e6}'+
 // 문장: 빛 띠가 지나가며 드러남(목소리 연출과 같은 결)
 '.debt-ending-v100.debt-ending-playing-v100 .debt-ending-lines-v100 p{-webkit-mask-image:linear-gradient(100deg,#000 0 38%,rgba(0,0,0,.25) 50%,transparent 62%);mask-image:linear-gradient(100deg,#000 0 38%,rgba(0,0,0,.25) 50%,transparent 62%);-webkit-mask-size:300% 100%;mask-size:300% 100%;-webkit-mask-position:100% 0;mask-position:100% 0}'+
 [1,3,5,7.4].map((d,i)=>'.debt-ending-v100.debt-ending-playing-v100 .debt-ending-lines-v100 p:nth-child('+(i+1)+'){animation:deeLine 1.6s ease-out '+d+'s both,deeSweep 2.2s cubic-bezier(.3,.6,.3,1) '+d+'s both}').join('')+
 '@keyframes deeLine{from{opacity:0;transform:translateY(6px);filter:blur(2px)}to{opacity:1;transform:none;filter:blur(0)}}'+
 '@keyframes deeSweep{from{-webkit-mask-position:100% 0;mask-position:100% 0}to{-webkit-mask-position:0 0;mask-position:0 0}}'+
 '.dee-em{font-style:normal;font-weight:600;color:#ffe2ae;animation:deeShim 5.2s ease-in-out infinite}'+
 '.debt-ending-v100.dee-on .dee-em{text-shadow:0 0 10px rgba(255,196,120,.45),0 0 22px rgba(220,170,110,.22),0 0 3px rgba(0,0,0,.9)}'+
 '@keyframes deeShim{0%,100%{color:#f6cf8e}50%{color:#fff4dc}}'+
 '@media(prefers-reduced-motion:reduce){.debt-ending-v100 .debt-ending-lines-v100 p{-webkit-mask-image:none!important;mask-image:none!important}.dee-em{animation:none}}';
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
})();
