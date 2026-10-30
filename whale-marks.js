/* 대호수 · 고래 공통 질감 (흉터 · 비치는 핏줄 · 박힌 작살 · 텅 빈 눈 · 비뚤어진 이빨 · 마른 각질)
   창백한 고래 묘사(흉터투성이 피부, 희고 푸른 핏줄, 머리에 잔뜩 박힌 작살, 텅 빈 새까만 눈, 비뚤어진 이빨)를 모든 고래의 바탕 질감으로 쓴다. */
(function(){
'use strict';
function seeded(n){let s=(Math.abs(n|0)%2147483000)+7;return ()=>((s=(s*16807)%2147483647)/2147483647);}
const n1=v=>(+v).toFixed(1),R=Math.PI/180;
// 가지 치는 핏줄
function veins(seed,starts,o){
 o=o||{};const r=seeded(seed);let d='',dd='';
 function walk(x,y,a,len,w,depth){
  let p='M'+n1(x)+','+n1(y);const steps=Math.max(3,Math.round(len/14));
  for(let i=0;i<steps;i++){a+=(r()-.5)*38;const s=len/steps;x+=Math.cos(a*R)*s;y+=Math.sin(a*R)*s;p+=' L'+n1(x)+','+n1(y);
   if(depth>0&&r()<.28)walk(x,y,a+(r()<.5?-1:1)*(30+r()*30),len*(.35+r()*.3),w*.6,depth-1);}
  if(w>.9)d+=p+' ';else dd+=p+' ';
 }
 starts.forEach(s=>walk(s[0],s[1],s[2],s[3],1.4,o.depth==null?2:o.depth));
 return {thick:d,thin:dd};
}
// 갈퀴처럼 나란히 긁힌 오래된 흉터
function rakes(seed,list){
 const r=seeded(seed);let s='';
 list.forEach(([x,y,a,len,n])=>{for(let k=0;k<(n||3);k++){const ox=-Math.sin(a*R)*k*7,oy=Math.cos(a*R)*k*7,l=len*(.7+r()*.4),bend=(r()-.5)*l*.18;
  const x2=x+ox+Math.cos(a*R)*l,y2=y+oy+Math.sin(a*R)*l,mx=(x+ox+x2)/2-Math.sin(a*R)*bend,my=(y+oy+y2)/2+Math.cos(a*R)*bend;
  s+='<path d="M'+n1(x+ox)+','+n1(y+oy)+' Q'+n1(mx)+','+n1(my)+' '+n1(x2)+','+n1(y2)+'"/>';}});
 return s;
}
// 새 상처: 짧게 벌어진 자상
function wounds(list,c){
 c=c||{};let s='';
 list.forEach(([x,y,a,len])=>{const dx=Math.cos(a*R)*len/2,dy=Math.sin(a*R)*len/2,nx=-Math.sin(a*R),ny=Math.cos(a*R),w=Math.max(2,len*.09);
  const lip='M'+n1(x-dx)+','+n1(y-dy)+' Q'+n1(x+nx*w*1.6)+','+n1(y+ny*w*1.6)+' '+n1(x+dx)+','+n1(y+dy)+' Q'+n1(x-nx*w*1.6)+','+n1(y-ny*w*1.6)+' '+n1(x-dx)+','+n1(y-dy)+' Z';
  const core='M'+n1(x-dx*.85)+','+n1(y-dy*.85)+' Q'+n1(x+nx*w*.7)+','+n1(y+ny*w*.7)+' '+n1(x+dx*.85)+','+n1(y+dy*.85)+' Q'+n1(x-nx*w*.5)+','+n1(y-ny*w*.5)+' '+n1(x-dx*.85)+','+n1(y-dy*.85)+' Z';
  s+='<path d="'+lip+'" fill="'+(c.lip||'#c98a86')+'" opacity=".55"/><path d="'+core+'" fill="'+(c.core||'#2a060b')+'"/>';});
 return s;
}
// 몸에 박힌 낡은 작살 (x,y=박힌 자리, a=자루가 뻗는 방향, len=밖으로 나온 길이)
function harpoons(list,c){
 c=c||{};let s='';const W=c.w||4;
 list.forEach(([x,y,a,len,broken,rope],i)=>{const ca=Math.cos(a*R),sa=Math.sin(a*R),ex=x+ca*len,ey=y+sa*len,nx=-sa,ny=ca;
  const ix=x+ca*len*.28,iy=y+sa*len*.28,hole=c.hole||W*1.2;
  // 찢긴 살갗 테두리 · 핏물
  s+='<ellipse cx="'+n1(x)+'" cy="'+n1(y)+'" rx="'+n1(hole*1.05)+'" ry="'+n1(hole*.7)+'" fill="'+(c.holeFill||'#2a1418')+'" opacity=".7" transform="rotate('+n1(a)+' '+n1(x)+' '+n1(y)+')"/>'+
   '<ellipse cx="'+n1(x)+'" cy="'+n1(y)+'" rx="'+n1(hole*2)+'" ry="'+n1(hole*1.35)+'" fill="none" stroke="'+(c.ring||'#e8e2d6')+'" stroke-opacity=".3" stroke-width="1.2" transform="rotate('+n1(a)+' '+n1(x)+' '+n1(y)+')"/>'+
   '<path d="M'+n1(x+1)+','+n1(y+hole*.6)+' q'+n1(-1.5)+','+n1(8+i%3*6)+' '+n1(.5)+','+n1(16+i%3*9)+'" fill="none" stroke="'+(c.blood||'#3a0c12')+'" stroke-opacity=".45" stroke-width="'+n1(W*.3)+'" stroke-linecap="round"/>';
  // 쇠 머리(살에 박힌 쪽) + 나무 자루
  s+='<path d="M'+n1(ix)+','+n1(iy)+' L'+n1(ex)+','+n1(ey)+'" stroke="'+(c.wood||'#4a4036')+'" stroke-width="'+n1(W)+'" stroke-linecap="'+(broken?'butt':'round')+'"/>'+
   '<path d="M'+n1(ix+nx*-W*.25)+','+n1(iy+ny*-W*.25)+' L'+n1(ex+nx*-W*.25)+','+n1(ey+ny*-W*.25)+'" stroke="'+(c.hi||'#cfc2ab')+'" stroke-opacity=".3" stroke-width="'+n1(W*.28)+'"/>'+
   '<path d="M'+n1(x)+','+n1(y)+' L'+n1(ix)+','+n1(iy)+'" stroke="'+(c.iron||'#2a2522')+'" stroke-width="'+n1(W*.55)+'"/>'+
   '<path d="M'+n1(ix+nx*W*.75)+','+n1(iy+ny*W*.75)+' L'+n1(ix-nx*W*.75)+','+n1(iy-ny*W*.75)+'" stroke="#3e2a20" stroke-width="'+n1(W*.4)+'"/>';
  if(broken)s+='<path d="M'+n1(ex)+','+n1(ey)+' l'+n1(Math.cos((a+35)*R)*W*1.3)+','+n1(Math.sin((a+35)*R)*W*1.3)+' M'+n1(ex)+','+n1(ey)+' l'+n1(Math.cos((a-30)*R)*W)+','+n1(Math.sin((a-30)*R)*W)+'" stroke="'+(c.wood||'#4a4036')+'" stroke-width="'+n1(W*.4)+'"/>';
  if(rope){const rx=ex-ca*W*2,ry=ey-sa*W*2;s+='<path d="M'+n1(rx)+','+n1(ry)+' C'+n1(rx+rope[0]*.2-6)+','+n1(ry+rope[1]*.15)+' '+n1(rx+rope[0]*.7)+','+n1(ry+rope[1]*.75)+' '+n1(rx+rope[0])+','+n1(ry+rope[1])+'" fill="none" stroke="'+(c.rope||'#6a6052')+'" stroke-opacity=".75" stroke-width="'+n1(Math.max(1,W*.3))+'"/>'+
   '<path d="M'+n1(rx+rope[0])+','+n1(ry+rope[1])+' l-3,6 M'+n1(rx+rope[0])+','+n1(ry+rope[1])+' l2,7" stroke="'+(c.rope||'#6a6052')+'" stroke-opacity=".55" stroke-width=".8"/>';}
 });
 return s;
}
// 입선을 따라 비뚤게 난 이빨
function teeth(pts,seed,c){
 c=c||{};const r=seeded(seed);let s='';
 pts.forEach(([x,y,up,size])=>{const h=size*(.6+r()*.7),w=size*(.35+r()*.2),tilt=(r()-.5)*36+(c.tilt||0),dir=up?-1:1;
  const tx=x+Math.sin(tilt*R)*h,ty=y+dir*Math.cos(tilt*R)*h;
  s+='<path d="M'+n1(x-w)+','+n1(y)+' Q'+n1(x-w*.6+(tx-x)*.4)+','+n1(y+(ty-y)*.6)+' '+n1(tx)+','+n1(ty)+' Q'+n1(x+w*.7+(tx-x)*.3)+','+n1(y+(ty-y)*.5)+' '+n1(x+w)+','+n1(y)+' Z" fill="'+(c.fill||'#d8d0b8')+'" stroke="'+(c.edge||'#2a241c')+'" stroke-width=".9"/>'+
   '<path d="M'+n1(x-w*.3)+','+n1(y+dir*h*.15)+' L'+n1(x+(tx-x)*.6-w*.1)+','+n1(y+(ty-y)*.6)+'" stroke="#fff" stroke-opacity=".35" stroke-width=".7"/>';});
 return s;
}
// 열기에 하얗게 말라 갈라진 각질
function crust(seed,cx,cy,rx,ry,step){
 const r=seeded(seed),P=[];step=step||22;
 for(let y=cy-ry;y<=cy+ry;y+=step){const row=[];for(let x=cx-rx;x<=cx+rx;x+=step)row.push([x+(r()-.5)*step*.8,y+(r()-.5)*step*.8]);P.push(row);}
 let cells='',cracks='';
 for(let j=0;j<P.length-1;j++)for(let i=0;i<P[j].length-1;i++){const a=P[j][i],b=P[j][i+1],c=P[j+1][i+1],d=P[j+1][i];
  const u=((a[0]-cx)/rx)**2+((a[1]-cy)/ry)**2;if(u>1)continue;
  const k=.15+.85*(1-u)*(.5+r()*.5);
  const sh=.86;const m=[(a[0]+b[0]+c[0]+d[0])/4,(a[1]+b[1]+c[1]+d[1])/4],in_=p=>n1(m[0]+(p[0]-m[0])*sh)+','+n1(m[1]+(p[1]-m[1])*sh);
  cells+='<path d="M'+in_(a)+' L'+in_(b)+' L'+in_(c)+' L'+in_(d)+' Z" opacity="'+k.toFixed(2)+'"/>';
  cracks+='M'+n1(a[0])+','+n1(a[1])+' L'+n1(b[0])+','+n1(b[1])+' L'+n1(c[0])+','+n1(c[1])+' ';}
 return {cells,cracks};
}

/* ---------- 창백한 고래 ---------- */
// 옆에서 본 머리(작살 장면 · 심장 파괴 바깥 장면 공통 좌표: 왼쪽을 바라봄, 눈 748,298)
const PS={};
function pallidSkin(){
 if(PS.skin)return PS.skin;
 const v=veins(77,[[600,190,10,160],[640,250,-6,170],[700,300,-20,120],[820,200,15,140],[880,280,-10,110],[580,280,20,90]],{depth:3});
 const rk=[[610,232,8,120,3],[800,200,22,90,3]];
 return PS.skin='<g class="wm-skin" fill="none" stroke-linecap="round">'+
  '<path d="'+v.thick+'" stroke="#6f93b8" stroke-opacity=".38" stroke-width="1.8"/>'+
  '<path d="'+v.thin+'" stroke="#f6f8f2" stroke-opacity=".28" stroke-width=".9"/>'+
  '<g stroke="#2a3236" stroke-opacity=".32" stroke-width="2.6" transform="translate(0 1.6)">'+rakes(8,rk)+'</g>'+
  '<g stroke="#fbfbf3" stroke-opacity=".42" stroke-width="1.6">'+rakes(8,rk)+'</g>'+
 '</g>'+wounds([[690,214,14,40],[840,296,-8,34],[606,272,-24,26]],{lip:'#d79a96',core:'#2a060b'});
}
function pallidTeeth(){
 return PS.teeth||(PS.teeth='<g class="wm-teeth">'+teeth([[582,322,true,13],[602,325,true,10],[624,328,true,15],[646,330,true,9],[668,331,true,13],[692,330,true,11],[716,327,true,8]],13,{fill:'#cbbf9f',edge:'#1d1b17'})+'</g>');
}
function pallidHarpoons(){
 return PS.hp||(PS.hp='<g class="wm-harpoons">'+harpoons([[588,180,-152,62,false,[-8,96]],[634,162,-136,48,true,null],[684,154,-124,70,false,[6,110]],[560,238,-170,40,true,null],[736,154,-116,36,true,null],[612,212,-160,52,false,[-4,80]],[806,166,-108,46,false,[10,90]],[930,186,-100,30,true,null]],{w:6,hole:4.5,wood:'#5a5044',ring:'#f4f1e8',blood:'#3a0c12'})+'</g>');
}
// 텅 빈 새까만 눈 (빛을 받지 않음)
function pallidEye(cx,cy){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="8.5" ry="6" fill="#000"/><ellipse cx="'+cx+'" cy="'+cy+'" rx="8.5" ry="6" fill="none" stroke="#5a6566" stroke-opacity=".5" stroke-width=".8"/>';}
// 솟구치는 머리(위장 진입 장면 좌표: 턱 경첩이 원점, 머리는 위를 향함, 눈 58,-14)
function pallidUpSkin(){
 if(PS.up)return PS.up;
 const v=veins(91,[[30,-250,60,150],[120,-280,100,170],[200,-200,95,160],[60,-120,80,120],[180,-90,110,100]],{depth:3});
 const rk=[[90,-300,70,110,3],[170,-210,95,90,3],[40,-170,60,60,2]];
 return PS.up='<g class="wm-skin" fill="none" stroke-linecap="round">'+
  '<path d="'+v.thick+'" stroke="#6f93b8" stroke-opacity=".38" stroke-width="1.8"/>'+
  '<path d="'+v.thin+'" stroke="#f6f8f2" stroke-opacity=".28" stroke-width=".9"/>'+
  '<g stroke="#2a3236" stroke-opacity=".32" stroke-width="2.6" transform="translate(1.6 0)">'+rakes(12,rk)+'</g>'+
  '<g stroke="#fbfbf3" stroke-opacity=".42" stroke-width="1.6">'+rakes(12,rk)+'</g>'+
 '</g>'+wounds([[140,-260,80,40],[200,-120,100,32],[60,-60,70,26]],{lip:'#d79a96',core:'#2a060b'});
}
function pallidUpHarpoons(){
 return PS.uph||(PS.uph='<g class="wm-harpoons">'+harpoons([[40,-318,-112,58,false,[20,90]],[96,-334,-92,70,false,[14,110]],[150,-330,-70,46,true,null],[198,-308,-48,58,false,[30,80]],[228,-250,-24,40,true,null],[240,-170,-14,44,false,[24,70]],[14,-296,-140,40,true,null]],{w:6,hole:4.5,wood:'#5a5044',ring:'#f4f1e8',blood:'#3a0c12'})+'</g>');
}
// 아래턱(세로)을 따라 비뚤게 난 이빨: 오른쪽(+x)을 향함
function pallidJawTeeth(){
 if(PS.jt)return PS.jt;
 const r=seeded(31);let s='';
 for(let y=-238;y<=-28;y+=19){const h=9+r()*9,w=4+r()*2.6,tilt=(r()-.5)*40,ty=y+Math.sin(tilt*R)*h,tx=2+Math.cos(tilt*R)*h;
  s+='<path d="M2,'+n1(y-w)+' Q'+n1(2+h*.5)+','+n1(y-w*.6+(ty-y)*.4)+' '+n1(tx)+','+n1(ty)+' Q'+n1(2+h*.4)+','+n1(y+w*.7+(ty-y)*.3)+' 2,'+n1(y+w)+' Z"/>';}
 return PS.jt=s;
}
window.WhaleMarks={seeded,veins,rakes,wounds,harpoons,teeth,crust,pallidSkin,pallidTeeth,pallidHarpoons,pallidEye,pallidUpSkin,pallidUpHarpoons,pallidJawTeeth};
})();
