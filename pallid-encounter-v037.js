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
const HULL='M-50,-11 L-44,-8 L38,-8 Q47,-9 55,-17 L52,-9 Q47,3 33,6 L-34,6 Q-46,4 -50,-11 Z';

function whale(){
 return '<g clip-path="url(#pe7Above)"><g class="w3-whale pe7-whale">'+
  '<g class="w3-svgskin"><use href="#w3WhaleShape" fill="url(#pe7Skin)"/></g>'+
  '<g clip-path="url(#w3WhaleClip)">'+
   '<g class="w3-svgskin">'+(WM?WM.pallidSkin():'')+'<g fill="none" stroke="#4c5856" stroke-opacity=".5" stroke-width="2.2" stroke-linecap="round">'+S0.wrinkles()+'</g></g>'+
   (S0.pallidJaw?S0.pallidJaw():'')+
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

function paint(el,t){
 const {q}=cacheQ(el);
 // 고래: 물 아래에서 솟아 배 앞에 멈춤 → 숨 고르듯 아주 느리게 오르내림
 const rise=sm(.8,4.2,t),dy=330*(1-rise)+Math.sin(t*.9)*1.6*rise,deg=-2.2*(1-rise)+Math.sin(t*.6)*.35;
 const r=deg*Math.PI/180,cs=Math.cos(r)*SC,sn=Math.sin(r)*SC,M=[cs,sn,-sn,cs,TX,TY+dy];
 const wg=q('.pe7-whale');wg.setAttribute('transform','matrix('+M.map(v=>v.toFixed(4)).join(' ')+')');
 // 박힌 쇠붙이의 떨림
 const sh=sm(4.6,5.4,t)*(1-sm(8.4,9.6,t)),ir=q('.pe7-irons');
 if(ir)ir.setAttribute('transform','translate('+n1(Math.sin(t*41)*.9*sh)+' '+n1(Math.cos(t*37)*.6*sh)+')');
 // 배: 고래 앞에서 작게 흔들림(고래가 멈춰 설 때 밀려온 물결에 들썩임)
 const push=Math.exp(-Math.pow((t-4.1)/.6,2)),bx=170,by=SEA+Math.sin(t*1.4)*1.2-3*push,bd=Math.sin(t*1.1)*1.6+4*push;
 const tw=boatPose(el,bx,by,bd,[37,-30]);
 lamp(el,t,tw,0);
 const gr=q('.pe7-grow');gr.setAttribute('transform','translate('+n1(bx)+' '+n1(by)+') rotate('+n1(bd)+') scale(1.9)');
 if(CG&&CG.supported&&CG.supported()){
  const lw=tw([51,-18.5]);
  CG.pallid(wg,{t:performance.now()/1000,run:1-sm(2.6,6.4,t),lamp:[lw[0],lw[1],.9],mat:M});
  if(S0.MEM)CG.membrane(q('.w3-mem'),S0.MEM,performance.now()/1000);
  const G=.8*sm(6.6,10,t);
  const P=CG._prog('pe7Grow',CG.VQ,F_GROW,[['aP',2]]),glc=CG._gl();
  if(P&&glc){const BB=[-52,-19,110,27];const S=CG._surface(gr,BB,{clip:'url(#pe7Hull)',res:1});CG._quad(P,BB);
   glc.uniform1f(P.u.uG,G);glc.uniform1f(P.u.uT,performance.now()/1000);glc.drawArrays(glc.TRIANGLES,0,6);glc.bindVertexArray(null);CG._blit(S);}
 }
 veil(el,t<.6?1-t/.6:sm(LOOP-.5,LOOP,t)*.6);
 caption(el,CAPS,t);
 if(window.EncFX)window.EncFX.tick(el,t);
}
let start=0,lastSeen=0;
function frame(now){
 const el=document.querySelector('.pe7-scene');
 if(el&&el.isConnected){
  if(now-lastSeen>900)start=now;lastSeen=now;
  let tr=(now-start)/1000;if(el.dataset.seek!=null)tr=+el.dataset.seek;
  try{paint(el,tr%LOOP);}catch(e){if(!el._peErr){el._peErr=1;console.warn('창백한 고래 조우',e);}}
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
