/* Great Lake v0.3.7 · 모든 것을 삼키는 창백한 고래 — 조우 장면
   「수평선을 가득 가린 흰 몸통이 배 앞에 멈춰 섭니다. 외피에 박힌 쇠붙이가 잔뜩 흔들립니다. 창백한 조직이 갑판을 타고 기어올라옵니다.」
   - 물빛이 먼저 하얗게 흐려지고 창백한 포자가 떠오른다(EncFX).
   - 흰 향유고래의 머리가 물 아래에서 솟아 배 앞에 멈춘다(셰이더 살갗 · 박힌 작살 · 텅 빈 검은 눈 · 비뚤어진 이빨 · 늘어진 흰 막).
   - 떠오를 때 이마에서 물이 흘러내리고, 멈춘 뒤에는 박힌 쇠붙이가 떨린다.
   - 뱃머리부터 창백한 조직이 배를 타고 번져 오른다(셰이더: 배 모양 안에서만 번지는 흰 막).
   지금의 글 카드 위에 장면을 붙인다. WebGL2가 없으면 SVG 그림만(살갗은 예전 그림)으로 보인다. */
(function(){
'use strict';
const K=window.BlueWhaleV3Kit,PC=window.PallidCinematicV3,CG=window.CalGL;
if(!K||!PC||!PC.shared||typeof renderPlay!=='function')return;
const {W,H,SEA,n1,n3,clamp,commonDefs,sky,sea,boatMarkup,boatPose,lamp,veil,caption,cacheQ}=K;
const S0=PC.shared,WM=window.WhaleMarks;
const LOOP=10.5,SC=1.3,TX=-300,TY=-105;
const sm=(a,b,x)=>{const k=clamp((x-a)/(b-a));return k*k*(3-2*k);};
const CAPS=[[0,'물빛이 하얗게 흐려집니다. 창백한 것이 물 아래에서 떠오릅니다.'],[3.4,'수평선을 가득 가린 흰 몸통이 배 앞에 멈춰 섭니다.'],[5.2,'외피에 박힌 쇠붙이가 잔뜩 흔들립니다.'],[7,'창백한 조직이 갑판을 타고 기어올라옵니다.']];
/* 조우 장면의 아래턱: 살짝 벌어진 입(어둠) · 앞으로 가늘어지는 아래턱 · 어둠 속으로 솟은 비뚤고 부러진 이빨(아래턱에만 남) */
let JAW=null;
function encJaw(){
 if(JAW)return JAW;
 const r=WM?WM.seeded(611):(()=>{let s=611;return()=>((s=(s*16807)%2147483647)/2147483647);})();
 const X0=552,X1=846,yU=x=>319+(x-556)*.028,gap=x=>13*(1-Math.pow(Math.max(0,Math.min(1,(x-556)/290)),1.5)),yT=x=>yU(x)+gap(x),yB=x=>yT(x)+6+(x-556)*.03;
 const f=v=>v.toFixed(1);
 let mouth='M'+X0+','+f(yU(556)+3);for(let x=556;x<=X1;x+=10)mouth+=' L'+x+','+f(yU(x));for(let x=X1;x>=556;x-=10)mouth+=' L'+x+','+f(yT(x)+1.5);mouth+=' Z';
 let jaw='M'+X0+','+f(yT(556)+1);for(let x=560;x<=X1;x+=10)jaw+=' L'+x+','+f(yT(x));for(let x=X1;x>=560;x-=10)jaw+=' L'+x+','+f(yB(x));jaw+=' Q'+(X0-6)+','+f(yB(560)-1)+' '+X0+','+f(yT(556)+1)+' Z';
 let lip='M'+X0+','+f(yU(556)-5);for(let x=556;x<=X1;x+=10)lip+=' L'+x+','+f(yU(x)-6);for(let x=X1;x>=556;x-=10)lip+=' L'+x+','+f(yU(x)+.5);lip+=' Z';
 let teeth='';
 for(let x=566;x<=812;x+=7+r()*7){
  if(r()<.12)continue;                                   // 빠진 이빨
  const g=gap(x),s=1-(x-560)/520,base=yT(x)+.8,broken=r()<.16,h=Math.max(3,(broken?.35+r()*.25:.6+r()*.5)*g+2),w=(2.2+r()*1.8)*(.7+.3*s),tilt=(r()-.5)*44*Math.PI/180;
  const tx=x+Math.sin(tilt)*h,ty=base-Math.cos(tilt)*h,mx=x+Math.sin(tilt)*h*.5+(r()-.5)*1.6,my=base-Math.cos(tilt)*h*.5;
  teeth+='<path d="M'+f(x-w)+','+f(base)+' Q'+f(mx-w*.75)+','+f(my)+' '+f(tx)+','+f(ty)+(broken?' L'+f(tx+w*.9)+','+f(ty+1.2):'')+' Q'+f(mx+w*.7)+','+f(my+.6)+' '+f(x+w)+','+f(base)+' Z" fill="url(#pe7Tooth)" opacity="'+(.75+.25*s).toFixed(2)+'"/>';
 }
 return JAW='<g class="w3-jaw pe7-jaw"><defs>'+
  '<linearGradient id="pe7Mouth" gradientUnits="userSpaceOnUse" x1="0" y1="318" x2="0" y2="334"><stop stop-color="#000" stop-opacity=".95"/><stop offset="1" stop-color="#0d1314" stop-opacity=".95"/></linearGradient>'+
  '<linearGradient id="pe7Lip" gradientUnits="userSpaceOnUse" x1="0" y1="312" x2="0" y2="327"><stop stop-color="#0a0f11" stop-opacity="0"/><stop offset="1" stop-color="#0a0f11" stop-opacity=".55"/></linearGradient>'+
  '<linearGradient id="pe7JawG" gradientUnits="userSpaceOnUse" x1="0" y1="328" x2="0" y2="350"><stop stop-color="#7e8783"/><stop offset=".3" stop-color="#4d5654"/><stop offset="1" stop-color="#121a1c"/></linearGradient>'+
  '<linearGradient id="pe7JawX" gradientUnits="userSpaceOnUse" x1="552" y1="0" x2="846" y2="0"><stop stop-color="#0b1113" stop-opacity="0"/><stop offset=".55" stop-color="#0b1113" stop-opacity=".25"/><stop offset="1" stop-color="#0b1113" stop-opacity=".85"/></linearGradient>'+
  '<linearGradient id="pe7Tooth" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#6d6450"/><stop offset=".45" stop-color="#c9bf9f"/><stop offset="1" stop-color="#ece6d2"/></linearGradient>'+
  '</defs>'+
  '<path d="'+lip+'" fill="url(#pe7Lip)"/>'+
  '<path d="'+mouth+'" fill="url(#pe7Mouth)"/>'+
  teeth+
  '<path d="'+jaw+'" fill="url(#pe7JawG)"/>'+
  '<path d="'+jaw+'" fill="url(#pe7JawX)"/>'+
 '</g>';
}
const HULL='M-50,-11 L-44,-8 L38,-8 Q47,-9 55,-17 L52,-9 Q47,3 33,6 L-34,6 Q-46,4 -50,-11 Z';

function whale(){
 return '<g clip-path="url(#pe7Above)"><g class="w3-whale pe7-whale">'+
  '<g class="w3-svgskin"><use href="#w3WhaleShape" fill="url(#pe7Skin)"/></g>'+
  '<g clip-path="url(#w3WhaleClip)">'+
   '<g class="w3-svgskin">'+(WM?WM.pallidSkin():'')+'<g fill="none" stroke="#4c5856" stroke-opacity=".5" stroke-width="2.2" stroke-linecap="round">'+S0.wrinkles()+'</g></g>'+
   encJaw()+
   '<g class="w3-eye"><ellipse cx="748" cy="298" rx="11" ry="7.5" fill="#2b3538" opacity=".7"/>'+(WM?WM.pallidEye(748,298):'')+'<ellipse cx="748" cy="298" rx="9.5" ry="6.6" fill="#000"/></g>'+
  '</g>'+
  '<g class="pe7-irons">'+(WM?WM.pallidHarpoons():'')+'</g>'+
  '<g class="w3-mem"></g>'+
 '</g></g>';
}
function sceneHtml(){
 const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'+
  '<defs>'+commonDefs()+
   '<path id="w3WhaleShape" d="'+S0.WHALE+'"/><clipPath id="w3WhaleClip"><use href="#w3WhaleShape"/></clipPath>'+
   '<clipPath id="pe7Above"><rect width="'+W+'" height="'+(SEA+2)+'"/></clipPath>'+
   '<clipPath id="pe7Hull"><path d="'+HULL+'"/><rect x="-14" y="-17" width="22" height="9" rx="1.5"/></clipPath>'+
   '<linearGradient id="pe7Skin" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#e9eadf"/><stop offset=".25" stop-color="#b9c0b6"/><stop offset=".55" stop-color="#6f7a76"/><stop offset="1" stop-color="#172025"/></linearGradient>'+
  '</defs>'+
  sky()+sea()+whale()+boatMarkup()+
  '<g class="pe7-grow"></g>'+
  '<rect class="bw-veil pe7-veil" width="'+W+'" height="'+H+'" fill="#010306" opacity="1"/></svg>';
 return '<div class="pallid-cine-v2 pe7-scene" role="img" aria-label="모든 것을 삼키는 창백한 고래 · 조우">'+svg+
  '<span class="cine-top" aria-hidden="true">모든 것을 삼키는 창백한 고래 · 조우</span>'+
  '<span class="cine-bottom" aria-hidden="true">'+CAPS[0][1]+'</span>'+
  '<span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}

/* 배를 타고 번져 오르는 창백한 조직(배 좌표 · 배 모양 안에서만) */
const F_GROW=CG?`#version 300 es
precision highp float;
in vec2 vP;out vec4 o;uniform float uG,uT;
${CG.NOISE}
void main(){
 vec2 p=vP;
 float front=58.-uG*118.;                                  // 뱃머리(+x)에서 고물 쪽으로
 float n=fbm(vec2(p.x*.09,p.y*.22)+vec2(uT*.05,0.)),n2=fbm(p*.35+3.);
 float reach=(p.x-front)/14.+(n-.5)*2.2-(p.y+8.)*.03;      // 들쭉날쭉한 앞머리 · 아래(물에 닿는 쪽)부터
 float m=smoothstep(-.2,.9,reach)*uG;
 float vein=smoothstep(.55,.75,n2);
 vec3 c=mix(vec3(.72,.77,.74),vec3(.95,.96,.92),n)*(.8+.2*vein);
 float a=m*smoothstep(.3,.75,n*.7+vein*.5)*.7;
 o=vec4(c*a,a);
}`:'';

function paint(el,t,tt){
 const {q}=cacheQ(el);if(tt==null)tt=t;
 // 고래: 물 아래에서 솟아 배 앞에 멈춤 → 숨 고르듯 아주 느리게 오르내림
 const rise=sm(.8,4.2,t),dy=330*(1-rise)+Math.sin(tt*.9)*1.6*rise,deg=-2.2*(1-rise)+Math.sin(tt*.6)*.35;
 const r=deg*Math.PI/180,cs=Math.cos(r)*SC,sn=Math.sin(r)*SC,M=[cs,sn,-sn,cs,TX,TY+dy];
 const wg=q('.pe7-whale');wg.setAttribute('transform','matrix('+M.map(v=>v.toFixed(4)).join(' ')+')');
 // 박힌 쇠붙이의 떨림
 const sh=sm(4.6,5.4,t)*(1-sm(8.4,9.6,t)),ir=q('.pe7-irons');
 if(ir)ir.setAttribute('transform','translate('+n1(Math.sin(t*41)*.9*sh)+' '+n1(Math.cos(t*37)*.6*sh)+')');
 // 배: 고래 앞에서 작게 흔들림(고래가 멈춰 설 때 밀려온 물결에 들썩임)
 const push=Math.exp(-Math.pow((t-4.1)/.6,2)),bx=170,by=SEA+Math.sin(tt*1.4)*1.2-3*push,bd=Math.sin(tt*1.1)*1.6+4*push;
 const tw=boatPose(el,bx,by,bd,[37,-30]);
 lamp(el,tt,tw,0);
 const gr=q('.pe7-grow');gr.setAttribute('transform','translate('+n1(bx)+' '+n1(by)+') rotate('+n1(bd)+') scale(1.9)');
 if(CG&&CG.supported&&CG.supported()){
  const lw=tw([51,-18.5]);
  CG.pallid(wg,{t:performance.now()/1000,run:1-sm(2.6,6.4,t),lamp:[lw[0],lw[1],.9],mat:M,enc:1});
  if(S0.MEM)CG.membrane(q('.w3-mem'),S0.MEM,performance.now()/1000);
  const G=.8*sm(6.6,10,t);
  const P=CG._prog('pe7Grow',CG.VQ,F_GROW,[['aP',2]]),glc=CG._gl();
  if(P&&glc){const BB=[-52,-19,110,27];const S=CG._surface(gr,BB,{clip:'url(#pe7Hull)',res:1});CG._quad(P,BB);
   glc.uniform1f(P.u.uG,G);glc.uniform1f(P.u.uT,performance.now()/1000);glc.drawArrays(glc.TRIANGLES,0,6);glc.bindVertexArray(null);CG._blit(S);}
 }
 veil(el,t<.6?1-t/.6:0);
 caption(el,CAPS,t);
 if(window.EncFX)window.EncFX.tick(el,tt);
}
let start=0,lastSeen=0;
function frame(now){
 const el=document.querySelector('.pe7-scene');
 if(el&&el.isConnected){
  if(now-lastSeen>900)start=now;lastSeen=now;
  // 조우 경고(검은 화면)가 떠 있는 동안은 첫 장면에서 멈춰 두었다가, 경고가 걷히기 시작하면 떠오름을 재생(한 번 떠오른 뒤에는 되감지 않음)
  const om=document.querySelector('.co-ov');if(om&&!om.classList.contains('leaving'))start=now;
  let tr=(now-start)/1000;if(el.dataset.seek!=null)tr=+el.dataset.seek;
  try{paint(el,Math.min(tr,LOOP),tr);}catch(e){if(!el._peErr){el._peErr=1;console.warn('창백한 고래 조우',e);}}
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
const before=renderPlay;
renderPlay=function(){
 const h=before.apply(this,arguments);
 try{if(state.scene==='encounter'&&state.encounter===0&&typeof h==='string'&&h.indexOf('pe7-scene')<0)return sceneHtml()+h;}catch(e){}
 return h;
};
window.PallidEncounter={html:sceneHtml};
})();
