/* 대호수 · 고래 사냥 단계마다 이어지는 한 발의 작살(밧줄로 이어진 작살)
   장전된 망 감긴 작살 발사 → 명중(망 섬광) → 미니게임 동안 밧줄로 이어져 출렁임
   → 성공: 박힌 자리의 몸이 부서지거나 흩어지는 연출 → 밧줄을 당겨 감아 들임 → 발사대(손)에 다시 장전
   → 다음 단계가 시작되면 다시 발사.
   쓰는 법(장면):
     build 끝에 HarpoonTether.markup() 를 붙이고,
     매 프레임 HarpoonTether.paint(el,t,spec,tw,anchor,opt) 를 부른다.
       spec = {fireAt, endAt(성공 시각 · 없으면 null), free(실패로 빠짐: 부서짐 없이 감아 들임), breakDur, reelDur}
       tw = 배 좌표 → 장면 좌표 변환, anchor = 지금 박힐(박힌) 몸의 자리 [x,y]
       opt = {color:'#…'(부서지는 몸빛), water:true(물속에 박힘), sway:0~1(출렁임 세기), aim}
     HarpoonTether.loaded(spec,t) : 이 장면에서 발사대에 작살이 걸려 있어야 하는지 */
(function(){
'use strict';
const RAD=Math.PI/180,FLY=.45,SEA=336;
const n1=v=>Math.round(v*10)/10,n3=v=>Math.round(v*1000)/1000;
const clamp=v=>Math.max(0,Math.min(1,v));
const HL=()=>window.HarpoonLauncher;
function harpoonSvg(){const K=window.BlueWhaleV3Kit;return K&&K.HARPOON?K.HARPOON:'<path d="M-104,0 L-10,0" stroke="#15191b" stroke-width="4"/><path d="M3,0 L-16,-6.5 L-11,0 L-16,6.5 Z" fill="#dfe6e3"/>';}
function markup(){
 let sh='';for(let i=0;i<14;i++)sh+='<path class="ht-sh" data-i="'+i+'" d="M-7,-3 L4,-6 L8,2 L-2,6 Z" opacity="0"/>';
 let pf='';for(let i=0;i<6;i++)pf+='<ellipse class="ht-pf" data-i="'+i+'" rx="1" ry="1" fill="url(#htPuff)" opacity="0"/>';
 let dr='';for(let i=0;i<18;i++)dr+='<circle class="ht-dr" data-i="'+i+'" r="1.4" fill="#e6eef2" opacity="0"/>';
 return '<g class="ht" style="pointer-events:none">'+
  '<defs><radialGradient id="htPuff"><stop stop-color="#fff" stop-opacity=".5"/><stop offset=".5" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="htBurst"><stop stop-color="#fffaf0"/><stop offset=".3" stop-color="#ffe6b0" stop-opacity=".6"/><stop offset="1" stop-color="#ffc66a" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="htDark"><stop stop-color="#000" stop-opacity=".7"/><stop offset=".6" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>'+
  '<path class="ht-rope2" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="3" stroke-linecap="round" opacity="0"/>'+
  '<path class="ht-rope" fill="none" stroke="#a69a84" stroke-width="1.5" stroke-linecap="round" opacity="0"/>'+
  '<ellipse class="ht-ring" rx="1" ry="1" fill="url(#htDark)" opacity="0"/>'+
  '<g class="ht-hp" opacity="0">'+harpoonSvg()+'</g>'+
  '<circle class="ht-burst" r="1" fill="url(#htBurst)" opacity="0"/>'+pf+sh+dr+
  (HL()?'<g class="ht-hit">'+HL().hitMarkup()+'</g>':'')+
 '</g>';
}
function times(s){
 if(!s||s.fireAt==null)return null;
 const arrive=s.fireAt+FLY,bd=s.free?.15:(s.breakDur==null?.9:s.breakDur),rd=s.reelDur||1;
 const reelAt=s.endAt!=null?s.endAt+bd:null;
 return {arrive,bd,rd,reelAt,reelEnd:reelAt!=null?reelAt+rd:null};
}
function loaded(s,t){const T=times(s);if(!T)return true;if(t<s.fireAt)return true;return T.reelEnd!=null&&t>=T.reelEnd;}
function seeded(i){const x=Math.sin(i*127.1+11.7)*43758.5453;return x-Math.floor(x);}
function paint(el,t,s,tw,anchor,opt){
 const L=HL(),o=opt||{},c=el._ht||(el._ht=(()=>{const g=el.querySelector('.ht');if(!g)return null;
  return {g,rope:g.querySelector('.ht-rope'),rope2:g.querySelector('.ht-rope2'),hp:g.querySelector('.ht-hp'),ring:g.querySelector('.ht-ring'),burst:g.querySelector('.ht-burst'),
   sh:[...g.querySelectorAll('.ht-sh')],pf:[...g.querySelectorAll('.ht-pf')],dr:[...g.querySelectorAll('.ht-dr')],hit:g.querySelector('.ht-hit'),last:null};})());
 if(!c||!tw)return null;
 const T=times(s),own=!!(L&&L.owned());
 const isLoaded=loaded(s,t);
 // 발사대 겨눔: 쏘기 직전에 박힐 자리 쪽으로 천천히 돌아가고, 쏜 뒤에는 그 방향을 유지(작살이 발사대 축을 따라 곧게 나감)
 const base=o.aim==null?(L?L.ANGLE:-16):o.aim;
 let aim=base;
 if(L&&own&&T&&anchor){
  const want=L.aimAt(tw,anchor);
  if(t<s.fireAt){const k=clamp((t-(s.fireAt-.7))/.55);aim=base+(want-base)*k*k*(3-2*k);c.aimF=null;}
  else{if(c.aimF==null||c.aimFire!==s.fireAt){c.aimFire=s.fireAt;c.aimF=want;}aim=c.aimF;
   if(T.reelEnd!=null&&t>=T.reelEnd){const k=clamp((t-T.reelEnd)/.6);aim=c.aimF+(base-c.aimF)*k*k*(3-2*k);}}
 }
 const hand=own?L.handFor(L.launch(el,tw,{loaded:isLoaded,aim}),30,-14):tw(isLoaded?[33,-31]:[38,-24]);
 const muzzle=[hand[0]+30,hand[1]-14];
 let pos=null,ang=-30,show=0,stuck=false,since=-1;
 // 비행: 거의 곧게 날아가다 끝에서 아래로 완만하게 처짐(날 끝 위치와 방향이 늘 일치)
 const fly=(A,u)=>L?L.flight(c.p0,A,u,c.D):{pos:[c.p0[0]+(A[0]-c.p0[0])*u,c.p0[1]+(A[1]-c.p0[1])*u],ang:Math.atan2(A[1]-c.p0[1],A[0]-c.p0[0])/RAD};
 if(!T||isLoaded){
  if(!own){pos=[hand[0]+20,hand[1]-14];show=1;}
  c.p0=null;c.angF=null;
 }else{
  const A=anchor||c.lastA||[muzzle[0]+200,muzzle[1]];if(anchor)c.lastA=anchor.slice();
  if(!c.p0||c.fire!==s.fireAt){c.fire=s.fireAt;c.p0=muzzle.slice();c.angF=null;c.D=L?L.dropFor(c.p0,A):10;}   // 쏜 순간의 발사구에서 출발
  if(t<T.arrive){const u=clamp((t-s.fireAt)/FLY),F=fly(A,u*(.88+.12*u));pos=F.pos;ang=F.ang;show=1;}
  else{
   if(c.angF==null)c.angF=fly(A,1).ang;   // 박힌 방향 = 날아와 닿은 방향
   since=t-T.arrive;stuck=true;
   const sw=(o.sway==null?.5:o.sway),wob=Math.sin(t*2.3)*2.4*sw+Math.sin(t*5.1)*1.1*sw;
   ang=c.angF+wob;const d=ang*RAD,embed=o.water?-6:(o.embed==null?14:o.embed);
   pos=[A[0]+Math.cos(d)*embed,A[1]+Math.sin(d)*embed];show=o.water?.85:1;
   const home=own?L.slideHome(tw,aim):{pos:[hand[0]+20,hand[1]-14],ang:-30};
   const RP=L?L.reelPose(el,'ht',t,T.reelAt,T.rd,{pos,ang},home):null;
   if(RP){pos=RP.pos;ang=RP.ang;show=RP.show;stuck=false;}
  }
 }
 c.hp.setAttribute('opacity',n3(show));
 if(pos)c.hp.setAttribute('transform','translate('+n1(pos[0])+' '+n1(pos[1])+') rotate('+n1(ang)+')');
 // 밧줄: 날아가는 동안 처지고, 박힌 뒤 출렁이며, 감아 들일 때 팽팽
 if(pos&&show&&!isLoaded){
  const ar=ang*RAD,tail=[pos[0]-104*Math.cos(ar),pos[1]-104*Math.sin(ar)],an=tw(own&&L?L.anchorLocal(aim):[40,-9]);
  const reeling=T.reelAt!=null&&t>=T.reelAt,sw=o.sway==null?.5:o.sway;
  const slack=t<T.arrive?34:reeling?3:10+12*sw+Math.sin(t*2.1)*(5+8*sw)+Math.sin(t*3.7+1)*3*sw;
  const mx=(an[0]+tail[0])/2+Math.sin(t*1.7)*4*sw,my=Math.min((an[1]+tail[1])/2+slack,SEA+30);
  const d='M'+n1(an[0])+','+n1(an[1])+' Q'+n1(mx)+','+n1(my)+' '+n1(tail[0])+','+n1(tail[1]);
  c.rope.setAttribute('d',d);c.rope2.setAttribute('d',d);c.rope.setAttribute('opacity','.92');c.rope2.setAttribute('opacity','.5');
 }else{c.rope.setAttribute('opacity','0');c.rope2.setAttribute('opacity','0');}
 // 물속에 박혔으면 수면에 번지는 고리
 const A=c.lastA;
 if(stuck&&o.water&&A){const a=(t*.5)%1;c.ring.setAttribute('cx',n1(A[0]));c.ring.setAttribute('cy',n1(Math.max(SEA+2,A[1]-4)));c.ring.setAttribute('rx',n1(20+a*40));c.ring.setAttribute('ry',n1(4+a*8));c.ring.setAttribute('opacity',n3(.5*(1-a)));}
 else c.ring.setAttribute('opacity','0');
 // 명중 섬광(망 개수에 따라)
 if(L&&c.hit)L.paintHit(c.hit,{s:T&&!isLoaded&&t>=T.arrive&&since<3?since:-1,p:A||[0,0],ang,tier:L.pierce?L.pierce().n:0,through:70});
 // 성공: 박힌 자리의 몸이 부서져 흩어짐(조각 · 가루 · 물보라)
 const bs=T&&s.endAt!=null&&!s.free?t-s.endAt:-1,col=o.color||'#c8b8a8';
 if(bs>=0&&bs<1.8&&A){
  c.burst.setAttribute('cx',n1(A[0]));c.burst.setAttribute('cy',n1(A[1]));c.burst.setAttribute('r',n1(20+120*clamp(bs/.4)));c.burst.setAttribute('opacity',n3(Math.max(0,1-bs/.7)*.9));
  c.sh.forEach((e,i)=>{const a=seeded(i)*Math.PI*2,v=120+160*seeded(i+40),x=A[0]+Math.cos(a)*v*bs,y=A[1]+Math.sin(a)*v*bs*.8-80*bs+420*bs*bs,sz=1+1.8*seeded(i+9);
   e.setAttribute('fill',col);e.setAttribute('transform','translate('+n1(x)+' '+n1(y)+') rotate('+n1(bs*500+i*40)+') scale('+n3(sz)+')');e.setAttribute('opacity',n3(o.water&&y>SEA+6?0:Math.max(0,1-bs/1.6)));});
  c.pf.forEach((e,i)=>{const a=i/6*Math.PI*2,r=20+90*clamp(bs/1.2);e.setAttribute('cx',n1(A[0]+Math.cos(a)*r*.7));e.setAttribute('cy',n1(A[1]+Math.sin(a)*r*.35-30*bs));e.setAttribute('rx',n1(24+40*bs));e.setAttribute('ry',n1(14+24*bs));
   e.setAttribute('fill',o.water?'url(#htPuff)':'url(#htPuff)');e.setAttribute('opacity',n3(Math.max(0,.8-bs/1.8)));});
  c.dr.forEach((e,i)=>{const a=-Math.PI*(.15+.7*seeded(i+70)),v=140+200*seeded(i+90),x=A[0]+Math.cos(a)*v*bs,y=Math.min(A[1],SEA)+Math.sin(a)*v*bs+520*bs*bs;
   e.setAttribute('cx',n1(x));e.setAttribute('cy',n1(y));e.setAttribute('opacity',n3(o.water&&y<SEA+8?Math.max(0,1-bs/1.2):0));});
 }else{c.burst.setAttribute('opacity','0');c.sh.forEach(e=>e.setAttribute('opacity','0'));c.pf.forEach(e=>e.setAttribute('opacity','0'));c.dr.forEach(e=>e.setAttribute('opacity','0'));}
 return {pos,ang,show,stuck,since,loaded:isLoaded,breakK:bs};
}
window.HarpoonTether={markup,paint,loaded,times,FLY};
})();
