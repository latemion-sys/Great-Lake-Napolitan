/* Blue whale: 5 scene canvas renderer, extracted from the approved standalone preview.
   Drawings match the preview. No battle damage, probability or prize logic here. */
(function(){
'use strict';
const W=1024,H=576,SEA=363,DUR=6.4,PI=Math.PI;
let ctx=null,time=0,token=0;
const captions=[
 ['고래는 보이지 않는다. 수면에 푸른 금 하나가 그어진다.','물결이 뒤집힌다. 거대한 푸른 몸이 스친다.','그제야 충격이 배에 닿는다.'],
 ['뱃머리 정면으로 물이 쪼개진다.','푸른 몸이 거리를 순식간에 없앤다.','지나간 자리에 물이 늦게 솟구친다.'],
 ['배가 푸른 고래의 자취를 쫓아 속도를 높인다.','고래는 한 번 방향을 꺾는다. 배는 물기둥 사이를 가른다.','저 멀리 푸른 등이 다시 앞을 가로지른다.'],
 ['푸른 선이 뱃머리 정면에 멈춘다.','배를 틀어라. 고래가 원래 있던 자리로 돌진한다.','푸른 몸이 사라진 뒤, 뒤늦게 물이 솟는다.'],
 ['선원들이 작살을 들고 물길의 끝을 겨눈다.','작살이 먼저 날아간다. 푸른 고래가 그 지점을 관통한다.','거대한 그림자가 물 아래로 가라앉는다.']
];
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function smooth(a,b,x){let t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
function hash(n){let x=Math.sin(n*127.1+42.9)*43758.5453;return x-Math.floor(x);}
function line(x1,y1,x2,y2,col,w,alpha){ctx.globalAlpha=alpha===undefined?1:alpha;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke();ctx.globalAlpha=1;}
function ellipse(x,y,rx,ry,fill,opacity){ctx.globalAlpha=opacity===undefined?1:opacity;ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,PI*2);ctx.fillStyle=fill;ctx.fill();ctx.globalAlpha=1;}
function ring(x,y,r,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='#9af1ff';ctx.shadowColor='#2dc2ff';ctx.shadowBlur=18;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,r*1.7,r*.57,-.03,0,PI*2);ctx.stroke();ctx.restore();}
function sky(t,p){
 let gr=ctx.createLinearGradient(0,0,0,H);
 gr.addColorStop(0,'#07101b');gr.addColorStop(.52,'#17354b');gr.addColorStop(.63,'#2a5977');gr.addColorStop(.635,'#081725');gr.addColorStop(1,'#030b18');
 ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
 ellipse(815,145,42,42,'#c6e5ec',.68);
 ellipse(815,145,70,70,'#8bddff',.055);
 for(let i=0;i<55;i++){
   let x=hash(i+1)*W,y=hash(i+204)*295;
   ellipse(x,y,hash(i+400)*1.1+.3,hash(i+500)*1.1+.3,'#9dbed5',.27+.22*Math.sin(t*.2+i)*Math.sin(t*.2+i));
 }
 for(let j=0;j<6;j++){
  const y=274+j*14,off=(t*2+j*23)%W;
  line(0,y,W,y-2,'#83bdd2',.5,.035);
 }
 const sea=ctx.createLinearGradient(0,SEA,0,H);
 sea.addColorStop(0,'#19415b');sea.addColorStop(.28,'#0b283f');sea.addColorStop(1,'#020914');
 ctx.fillStyle=sea;ctx.fillRect(0,SEA,W,H-SEA);
 for(let j=0;j<32;j++){
   let yy=SEA+7+j*j*.16,off=(t*(7+j*.1)*((j%2)?-1:1))%250;
   for(let i=0;i<8;i++){
    let x=(i*158+hash(j*41+i)*96+off+1250)%1250-100;
    line(x,yy,x+22+j*.85,yy-1, (j%4===0?'#5e9abb':'#3c789a'),.6+(j%6)*.14,.08+j*.006);
   }
 }
 const moon=ctx.createLinearGradient(800,SEA,800,H);moon.addColorStop(0,'#90d6e52c');moon.addColorStop(1,'#90d6e500');
 ctx.fillStyle=moon;ctx.beginPath();ctx.moveTo(778,SEA);ctx.lineTo(850,SEA);ctx.lineTo(927,H);ctx.lineTo(673,H);ctx.fill();
}
function tear(y,t,speed,intensity=1){
 const x=1030-(t*speed)%1550;
 for(let k=10;k>=0;k--){
  let xx=x+k*42,alpha=(1-k/12)*intensity*.7;
  line(xx-160,y+Math.sin(k*1.7)*8,xx+170,y-Math.sin(k)*6,k<3?'#b0faff':'#2bbaff',Math.max(1,10-k*.8),alpha);
 }
 ellipse(x,y,155,3,'#bdefff',intensity*.6);
}
function whale(x,y,scale=1,alpha=1,angle=0,ghost=false){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);ctx.globalAlpha=alpha;
 if(ghost){ctx.shadowColor='#4baefc';ctx.shadowBlur=38;}
 let edge=ctx.createLinearGradient(0,-95,0,99);edge.addColorStop(0,ghost?'#8feaff':'#65cfff');edge.addColorStop(.24,'#237ec5');edge.addColorStop(.6,ghost?'#2f9ddc':'#123f7c');edge.addColorStop(1,'#061c3e');
 ctx.fillStyle=edge;ctx.strokeStyle=ghost?'#b4faff':'#5ac5ff';ctx.lineWidth=2.4;
 // Long, piercing bill, broad cetacean body, enormous flukes and shark-like fins.
 ctx.beginPath();ctx.moveTo(-345,-18);ctx.lineTo(-188,-33);
 ctx.quadraticCurveTo(-140,-78,-50,-83);
 ctx.quadraticCurveTo(62,-92,160,-59);
 ctx.quadraticCurveTo(199,-49,229,-22);
 ctx.lineTo(273,-15);ctx.quadraticCurveTo(292,-41,338,-65);
 ctx.quadraticCurveTo(329,-27,288,0);
 ctx.quadraticCurveTo(335,27,346,51);
 ctx.quadraticCurveTo(306,44,268,18);
 ctx.lineTo(219,22);
 ctx.quadraticCurveTo(165,82,32,83);
 ctx.quadraticCurveTo(-100,88,-165,42);
 ctx.lineTo(-232,5);ctx.lineTo(-345,-18);
 ctx.closePath();ctx.fill();ctx.stroke();
 // Steep dorsal crest with a thin forward spine.
 ctx.fillStyle=ghost?'#64c9f4':'#0a467e';
 ctx.beginPath();ctx.moveTo(-34,-80);ctx.quadraticCurveTo(21,-112,40,-175);
 ctx.quadraticCurveTo(67,-106,93,-76);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#67c9f7';ctx.lineWidth=2;ctx.stroke();
 // Pectoral fin curves down from flank.
 ctx.fillStyle=ghost?'#3487c6':'#0c2c5a';
 ctx.beginPath();ctx.moveTo(-70,23);ctx.quadraticCurveTo(-9,48,13,132);
 ctx.quadraticCurveTo(42,83,57,38);ctx.closePath();ctx.fill();ctx.stroke();
 // Narrow glowing anatomy lines.
 ctx.shadowBlur=0;line(-307,-21,-169,-34,'#bbf8ff',2,ghost?.47:.83);
 ctx.beginPath();ctx.moveTo(-177,-33);ctx.bezierCurveTo(-105,-53,5,-58,166,-38);ctx.strokeStyle='#c2f2fa';ctx.lineWidth=1.7;ctx.globalAlpha=alpha*.45;ctx.stroke();ctx.globalAlpha=alpha;
 ctx.beginPath();ctx.moveTo(-169,6);ctx.bezierCurveTo(-70,59,85,69,169,31);ctx.strokeStyle='#5e99e1';ctx.lineWidth=2;ctx.globalAlpha=alpha*.58;ctx.stroke();ctx.globalAlpha=alpha;
 ellipse(-146,-22,4.3,3.5,'#061327');ellipse(-147,-23,1.45,1.45,'#bffaff');
 for(let j=0;j<5;j++)line(-108+j*11,12+j*1.4,-94+j*10,24+j*2,'#75bee9',1,ghost?.17:.35);
 // Iridescent stripes help read the scale during the slow-motion beat.
 for(let j=0;j<4;j++){
  const xx=-22+j*45;
  line(xx,-54+j*2,xx+41,-48+j*2,'#80e7ff',1.2,ghost?.13:.2);
 }
 ctx.restore();
}
function ghostTrail(x,y,s,angle=0,n=7,wide=62){
 for(let k=n;k>=1;k--)whale(x+k*wide,y+Math.sin(k*.6)*3,s,Math.max(.012,(1-k/(n+1))*.085),angle,true);
}
function ship(x=425,y=423,shake=0,angle=0){
 ctx.save();ctx.translate(x+(Math.sin(time*97)*shake),y+(Math.cos(time*93)*shake*.6));ctx.rotate(angle);
 ellipse(0,29,143,17,'#000913',.68);
 let g=ctx.createLinearGradient(0,-34,0,43);g.addColorStop(0,'#39424c');g.addColorStop(.5,'#1f262d');g.addColorStop(1,'#0c131b');
 ctx.fillStyle=g;ctx.strokeStyle='#91a5ac';ctx.lineWidth=1.7;
 ctx.beginPath();ctx.moveTo(-147,-12);ctx.lineTo(112,-13);ctx.lineTo(143,-2);
 ctx.lineTo(91,35);ctx.quadraticCurveTo(-24,53,-105,32);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#5a4c3f';ctx.fillRect(-97,-21,201,12);ctx.strokeStyle='#b8aa91';ctx.strokeRect(-97,-21,201,12);
 for(let i=-70;i<100;i+=32)line(i,-5,i-5,30,'#47555f',1,.6);
 line(17,-20,17,-113,'#bac1bd',3);line(17,-110,79,-49,'#607687',1.7);line(17,-113,-31,-49,'#607687',1.3);
 ctx.fillStyle='#c6d2c9';ctx.globalAlpha=.24;ctx.beginPath();ctx.moveTo(20,-105);ctx.lineTo(72,-52);ctx.lineTo(20,-53);ctx.fill();ctx.globalAlpha=1;
 ellipse(-45,-20,19,9,'#e9c68c',.3);ellipse(-45,-31,5,6,'#ffc878');
 ctx.shadowColor='#f9cd7c';ctx.shadowBlur=18;ellipse(-45,-31,3.4,5,'#fce5a8');ctx.shadowBlur=0;
 line(-120,-16,138,-16,'#96b8c8',1.5,.4);
 ctx.restore();
}
function waterWall(x,y,r,strength){
 ctx.save();ctx.globalAlpha=strength;
 for(let i=0;i<17;i++){
  let dx=(hash(i*3+2)-.5)*r*2,dy=-hash(i*13+3)*(r*.7);
  line(x+dx,y,x+dx*.8,y+dy,'#98e4ff',1.7+i%3,.35+.35*hash(i+17));
  ellipse(x+dx*.8,y+dy,1.5+i%3,1.2,'#c8f7ff',.6);
 }
 ctx.restore();
}
function glowLine(x1,y1,x2,y2,a,w=4){
 ctx.save();ctx.globalAlpha=a;ctx.shadowBlur=28;ctx.shadowColor='#57d6ff';line(x1,y1,x2,y2,'#2aafff',w*3,.24);line(x1,y1,x2,y2,'#cbf9ff',w,1);ctx.restore();
}
function sparks(x,y,t,strength){
 ctx.save();ctx.globalAlpha=strength;
 for(let i=0;i<54;i++){
  let dir=hash(i*13+11)*PI*2,dist=26+(t*140+hash(i+4)*200)*(0.3+hash(i+8)*.7);
  const xx=x+Math.cos(dir)*dist,yy=y+Math.sin(dir)*dist*.65;
  line(xx,yy,xx+Math.cos(dir)*23,yy+Math.sin(dir)*20,'#bbf6ff',1.2,hash(i)*.7+.25);
 }
 ctx.restore();
}
function spear(x,y,len,alpha=1){
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;
 line(0,0,len,0,'#f2e5d1',3,.92);
 ctx.fillStyle='#a9d6e4';ctx.beginPath();ctx.moveTo(len+13,0);ctx.lineTo(len-15,-6);ctx.lineTo(len-8,0);ctx.lineTo(len-15,6);ctx.closePath();ctx.fill();
 ctx.restore();
}
function bgSplit(r,amt){ctx.save();ctx.globalAlpha=amt;ctx.beginPath();ctx.moveTo(0,SEA+20);ctx.lineTo(W,SEA+20-r*.38);ctx.lineTo(W,SEA+23+r*.45);ctx.lineTo(0,SEA+38);ctx.closePath();ctx.fillStyle='#0c010a';ctx.fill();line(0,SEA+21,W,SEA+20-r*.38,'#8ddfff',4,1);line(0,SEA+37,W,SEA+23+r*.45,'#318ed4',3,1);ctx.restore();}
function phaseOne(t){
 const q=smooth(1.0,2.05,t),x=1090-q*1480,y=337;
 tear(y,t*.72,1000,.7*smooth(.65,1.0,t)*(1-smooth(3.35,4.7,t)));
 if(t>1.12&&t<3.55){
  glowLine(Math.min(1024,x+270),y+22,Math.max(0,x-360),y-9,.8);
  if(t>1.38&&t<2.35){ghostTrail(x+280,y+7,.66,-.02,11,41);whale(x+280,y+7,.66,smooth(1.38,1.6,t)*(1-smooth(2.15,2.36,t)),0);}
 }
 if(t>2.3)waterWall(430,SEA+8,200,(1-smooth(4.7,6.1,t))*.75);
 ship(420,428,t>2.05&&t<3.3?2.7*(1-smooth(2.05,3.3,t)):0,0);
}
function phaseTwo(t){
 let enter=smooth(1.18,2.02,t),x=1380-1860*enter,y=365;
 if(t>1.1&&t<3.9){
  glowLine(x+260,y+22,Math.min(1050,x+920),y+20,1-smooth(2.6,3.8,t),5);
  ghostTrail(x,y,.92,-.03,9,70);
  whale(x,y,.92,1-smooth(2.6,3.3,t),-.03);
 }
 let shock=smooth(1.87,2.2,t)*(1-smooth(3.4,5,t));
 if(shock>0){ring(505,380,40+shock*180,shock*.62);waterWall(500,365,215,shock);}
 ship(420,425,shock*9,-shock*.055);
 tear(355,t*.8,1240,.36);
}
// Wide perspective and fast flowing wake turn the third scene into a pursuit shot.
function pursuitWater(t){
 const vanX=780+Math.sin(t*1.23)*90,vanY=354+Math.sin(t*1.6)*9;
 const acceleration=smooth(.25,1.6,t);
 ctx.save();
 // Water is moving toward the viewer much faster than the ship is moving across the image.
 for(let side of [-1,1]){
  for(let i=0;i<20;i++){
   const d=((i/20+t*(.85+acceleration*.85))%1);
   const spread=16+d*d*760;
   const x=vanX+side*spread,y=vanY+d*d*228;
   const dx=side*(20+d*110),dy=4+d*49;
   line(x,y,x+dx,y+dy,i%3===0?'#a2f6ff':'#267fb9',1+d*2,(.05+d*.20)*acceleration);
  }
 }
 ctx.restore();
 // White churn in the whale's wake, like a road that stretches back toward the boat.
 ctx.save();
 for(let j=0;j<5;j++){
  const offset=((t*2.6+j*.31)%1);
  const y=365+offset*offset*195;
  const shift=Math.sin(t*.84-offset*1.8)*34;
  const x=760-offset*550+shift;
  ellipse(x,y,10+offset*52,2+offset*9,'#7edbfa',(.4-offset*.22)*acceleration);
  line(x-36-offset*25,y+2,x+38+offset*40,y,'#aff6ff',1+offset*2,(.4-offset*.3)*acceleration);
 }
 ctx.restore();
}
function phaseThree(t){
 // The camera is kept with the pursuing boat. The whale remains ahead, small and fast.
 const accel=smooth(.4,1.3,t),rush=1-smooth(5.3,6.3,t);
 const bob=Math.sin(t*19)*2.3*accel+Math.sin(t*37)*.8*accel;
 ctx.save();ctx.translate(Math.sin(t*2.8)*10*accel,bob);
 pursuitWater(t);
 const hx=788+Math.sin(t*1.65)*110+Math.sin(t*4.2)*22;
 const hy=350+Math.sin(t*2.25)*27;
 const scale=.36+Math.sin(t*1.6+.5)*.065;
 // One real whale, not three copies: its trail marks the course to follow.
 const aheadX=hx,tailX=hx+scale*205;
 for(let k=9;k>=1;k--){
   const rx=aheadX+k*35,ry=hy+Math.sin(t*3.3-k*.45)*6;
   line(rx-45,ry,rx+25,ry,'#56c4ff',1+k*.16,(1-k/12)*.20*accel);
 }
 glowLine(hx+185,hy+18,hx+560,hy+22,.18*accel,2);
 whale(hx,hy,scale,(.72+.20*Math.sin(t*4.1))*rush,Math.sin(t*1.1)*.045);
 waterWall(hx+48,SEA,80,.17*accel);
 // Forward-driving foam in the bow, a moving line of water between pursuer and target.
 for(let k=0;k<14;k++){
  const v=((k/14+t*3.7)%1),x=485+v*390,y=446-v*76+Math.sin(v*8+t*3)*8;
  line(x-27,y,x+18+v*17,y-6,'#a9edff',1+v,(.08+v*.19)*accel);
 }
 ship(366+Math.sin(t*2.5)*16,466+Math.sin(t*3.4)*5,1.1*accel,-.035+Math.sin(t*2.3)*.028);
 ctx.restore();
}
function phaseFour(t){
 // A straight-ahead targeting lane fixes the whale's intended impact point.
 const warning=smooth(.55,1.13,t)*(1-smooth(2.22,2.43,t));
 const dodge=smooth(1.95,2.34,t),impact=smooth(2.29,2.43,t)*(1-smooth(4.25,5.6,t));
 const targetX=478,targetY=405;
 ctx.save();
 if(warning>0){
  ctx.globalAlpha=warning;
  // Perspective convergence: the blue attack line points to the boat's OLD position.
  ctx.setLineDash([16,12]);ctx.strokeStyle='#66d7ff';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(1050,348);ctx.lineTo(targetX,targetY);ctx.stroke();
  ctx.setLineDash([]);
  glowLine(1024,350,targetX,targetY,.46*warning,3);
  ring(targetX,targetY,22+16*Math.sin(t*16),.7*warning);
  ctx.globalAlpha=1;
 }
 ctx.restore();
 // The sudden turn takes the ship below-left, CLEAR of the straight charging lane.
 const boatX=395-dodge*118,boatY=427+dodge*109;
 const turnBump=smooth(1.92,2.20,t)*(1-smooth(2.45,2.95,t));
 if(dodge>0){
  for(let k=0;k<30;k++){
   const a=k*.22+t*6.5,dist=(12+hash(k+21)*67)*dodge;
   const x=boatX+48+Math.cos(a)*dist,y=boatY-10+Math.sin(a)*dist*.45;
   line(x,y,x+12+hash(k)*15,y-5,'#85d9f7',1.2,(.08+.25*hash(k+4))*turnBump);
  }
  waterWall(boatX+90,boatY-25,76,turnBump*.7);
 }
 // Less than half a second: the whale bursts across the place where the ship HAD been.
 if(t>2.14&&t<3.48){
  const surge=smooth(2.15,2.71,t),wx=1530-surge*1990,wy=403;
  for(let i=9;i>0;i--){
    line(wx+i*89,wy-2,wx+i*89+170,wy-6,'#36b5ff',3+i*.75,(1-i/12)*.21);
  }
  ghostTrail(wx,wy,.89,-.02,7,62);
  whale(wx,wy,.89,1-smooth(3.0,3.45,t),-.02);
 }
 if(impact>0){
  // The missed straight line tears water in two; its delayed wake hits the ship.
  bgSplit(70+impact*140,impact*.45);
  waterWall(targetX,SEA+20,190,impact*.96);
  ring(targetX,SEA+22,58+impact*160,impact*.43);
 }
 const shake=impact*5+turnBump*4;
 ship(boatX,boatY,shake,-.02-dodge*.19+smooth(2.56,3.1,t)*.13);
 if(t>3.2){ellipse(490,410,170,7,'#5ecbff',(.22+Math.sin(t*5)*.06)*(1-smooth(5.5,6.4,t)));}
}
function phaseFive(t){
 // Stage four's old counterattack is now part of the final cinematic:
 // PREPARE, FIRE AHEAD, COLLIDE, SINK.
 const still=smooth(.15,.75,t);
 const leap=smooth(1.57,2.12,t),wx=1460-1170*leap,wy=345;
 const hit=smooth(2.09,2.27,t)*(1-smooth(3.2,4.55,t));
 const split=smooth(2.14,2.48,t)*(1-smooth(5.4,6.35,t));
 // The empty predicted crossing point: visible before either combatant reaches it.
 if(t>.7&&t<2.14){
   ring(697,354,16+Math.sin(t*6)*4,.23*still);
   line(455,369,690,353,'#9dd9ed',1.2,.21*still);
 }
 // The harpoon is fired BEFORE the animal reaches the crossing point.
 if(t>1.16){
   const flight=smooth(1.25,2.17,t);
   const muzzle=445,tip=muzzle+258*flight;
   line(muzzle-20,374,tip,354,'#9bdaf3',1.2,.45*(1-smooth(2.45,3,t)));
   ctx.save();ctx.translate(muzzle,374);ctx.rotate(-.077);
   spear(0,0,Math.max(0,tip-muzzle),1-smooth(2.3,2.8,t));ctx.restore();
 }
 if(t>1.52&&t<3.27){
   ghostTrail(wx,wy,1.02,-.01,7,60);
   whale(wx,wy,1.02,1-smooth(2.52,3.2,t),-.01);
   glowLine(wx+140,wy+18,wx+680,wy+10,.22*(1-smooth(3,3.3,t)),3);
 }
 if(hit>0){
   ring(696,350,40+hit*220,hit*.91);
   sparks(696,350,t-2.1,hit);
   waterWall(702,SEA+8,185,hit);
 }
 if(split>0)bgSplit(65+170*split,split*.72);
 // The whale only becomes slow AFTER the impact; that contrast sells the speed.
 if(t>3.05){
   const fall=smooth(3.08,5.9,t);
   const fade=1-smooth(5.62,6.4,t);
   whale(710+fall*50,403+fall*173,.75,.73*fade,-.05-fall*.21,false);
   ellipse(766,469+fall*106,230,22,'#4d9cbb',.17*fade);
 }
 ship(324,434,hit*8,-hit*.04);
}
const draw=[phaseOne,phaseTwo,phaseThree,phaseFour,phaseFive];

function stop(){token++;ctx=null;time=0;}
function mount(canvas,phase){
 stop();
 if(!canvas||!canvas.getContext)return false;
 const context=canvas.getContext('2d');
 if(!context)return false;
 ctx=context;
 const id=token,stage=Math.max(0,Math.min(4,Math.floor(Number(phase)||0)));
 let stamp=0, t=0, lineIndex=-1;
 const caption=canvas.parentElement?.querySelector('.bluewhale-caption');
 function frame(ms){
  if(id!==token||!canvas.isConnected)return;
  if(!stamp)stamp=ms;
  const dt=Math.min(.1,Math.max(0,(ms-stamp)/1000));stamp=ms;
  t+=dt;
  if(t>DUR)t=0;
  time=t;
  const w=Math.round(canvas.clientWidth*Math.min(2,window.devicePixelRatio||1));
  const h=Math.round(canvas.clientHeight*Math.min(2,window.devicePixelRatio||1));
  if(w>0&&h>0&&(canvas.width!==w||canvas.height!==h)){canvas.width=w;canvas.height=h;}
  ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
  sky(t,stage);
  draw[stage](t);
  const now=t<1.7?0:t<3.6?1:2;
  if(now!==lineIndex){lineIndex=now;if(caption)caption.textContent=captions[stage][now];}
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
 return true;
}
window.BlueWhaleCinematic={mount,stop,stageCount:5};
})();
