/* The Great Lake · Scarlet Whale (five-scene canvas)
   Shared renderer for live game and standalone preview. Does not affect battle logic. */
(function(){
'use strict';
const W=1024,H=576,P=Math.PI,DURATION=7;
let active=0,clock=0;
const titles=['말라붙는 호수','붉은 팔의 포위','여덟 팔 격퇴','붉은 눈의 머리','작살과 물의 귀환'];
const captions=[
 ['수면이 내려간다. 선체 아래에 마른 바닥이 드러난다.','호수 바닥에 균열이 벌어진다.','물은 사라지고, 먼 곳에서 붉은 그림자가 움직인다.'],
 ['붉은 기둥이 물 아래에서 솟아오른다.','거대한 빨판이 선체를 붙잡는다.','팔들이 배를 휘감고 압박한다.'],
 ['팔이 둘, 넷, 여덟. 전부 솟아오른다.','작살잡이가 팔을 하나씩 쳐낸다.','마지막 팔이 물러선다.'],
 ['팔 뒤에서 거대한 머리가 떠오른다.','새빨간 눈이 배를 노려본다.','문어 머리가 공격해 들어온다.'],
 ['거대한 작살이 고래의 머리를 향한다.','작살이 붉은 머리에 명중한다.','수면이 다시 차오른다.']
];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function ease(a,b,t){const v=clamp((t-a)/(b-a),0,1);return v*v*(3-2*v);}
function rand(i){let n=Math.sin(i*129.7+47.5)*78453.11;return n-Math.floor(n);}
function lin(c,x,y,X,Y,col,w=1,alpha=1){c.save();c.globalAlpha=alpha;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke();c.restore();}
function oval(c,x,y,rx,ry,color,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,P*2);c.fill();c.restore();}
function ground(c,t,dry){
 const sky=c.createLinearGradient(0,0,0,H);
 sky.addColorStop(0,'#14080d');sky.addColorStop(.47,'#521b25');sky.addColorStop(.64,'#87402d');sky.addColorStop(1,'#10070b');
 c.fillStyle=sky;c.fillRect(0,0,W,H);
 oval(c,817,144,50,50,'#f5be98',.30);oval(c,817,144,90,90,'#ff8c78',.06);
 const waterY=355+dry*90;
 const sea=c.createLinearGradient(0,waterY,0,H);sea.addColorStop(0,'#a14e42');sea.addColorStop(.18,'#4b1921');sea.addColorStop(1,'#150b0d');
 c.fillStyle=sea;c.fillRect(0,waterY,W,H-waterY);
 for(let j=0;j<32;j++){const y=waterY+j*j*.23+7;if(y>H)break;for(let i=0;i<8;i++){const x=(i*149+(t*(7+j*.1))*(j%2?-1:1)+rand(j*37+i)*90+3000)%1250-120;lin(c,x,y,x+20+j,y-2,'#f5a88d',.7+j*.05,.07+j*.007);}}
 if(dry>.03){
  c.save();c.globalAlpha=dry*.62;c.fillStyle='#533327';c.fillRect(0,waterY+22,W,H-waterY);
  for(let i=0;i<17;i++){const x=i*77+rand(i+4)*20;lin(c,x,H-3,x+rand(i+14)*44-20,H-92-rand(i+30)*88,'#ac493e',2,.6);lin(c,x+4,H,x+24-rand(i+33)*20,H-53-rand(i+51)*50,'#76322e',1.5,.65);}
  for(let i=0;i<38;i++)oval(c,(rand(i+84)+t*.015*(i%2?1:-1))*W%W,300+rand(i+126)*265,2+rand(i+6)*6,1+rand(i+9)*3,'#b97e60',.08);
  c.restore();
 }
 return waterY;
}
function boat(c,x,y,jolt=0,tilt=0){
 c.save();c.translate(x+Math.sin(clock*82)*jolt,y+Math.sin(clock*64)*jolt*.5);c.rotate(tilt);
 oval(c,0,32,155,17,'#080509',.7);
 const g=c.createLinearGradient(0,-35,0,45);g.addColorStop(0,'#645249');g.addColorStop(.6,'#33231f');g.addColorStop(1,'#170e0e');c.fillStyle=g;c.strokeStyle='#d5b59c';c.lineWidth=2;
 c.beginPath();c.moveTo(-144,-12);c.lineTo(114,-13);c.lineTo(145,-2);c.lineTo(98,36);c.quadraticCurveTo(0,56,-114,31);c.closePath();c.fill();c.stroke();
 c.fillStyle='#735647';c.fillRect(-104,-24,207,11);
 lin(c,18,-23,18,-128,'#d0c8c0',4);lin(c,18,-125,81,-54,'#d0b19c',2);
 c.globalAlpha=.3;c.fillStyle='#ded8c4';c.beginPath();c.moveTo(19,-121);c.lineTo(77,-55);c.lineTo(19,-56);c.fill();c.globalAlpha=1;
 oval(c,-42,-34,4,6,'#ffdf9f');c.restore();
}
function sucker(c,x,y,r,a=1){oval(c,x,y,r,r*.81,'#f6b0a2',a);oval(c,x,y,r*.66,r*.5,'#be4850',a);oval(c,x,y,r*.3,r*.22,'#4c0a16',a);}
function tentacle(c,x,y,length,bend,r,rotation,alpha=1){
 c.save();c.translate(x,y);c.rotate(rotation);c.globalAlpha=alpha;c.lineCap='round';
 const path=()=>{c.beginPath();c.moveTo(0,0);c.bezierCurveTo(length*.20,bend*.6,length*.44,bend,length*.7,bend*.65);c.quadraticCurveTo(length*.95,bend*.28,length,0);};
 c.strokeStyle='#601020';c.lineWidth=r+12;path();c.stroke();
 c.strokeStyle='#b72734';c.lineWidth=r+3;path();c.stroke();
 c.strokeStyle='#d85254';c.lineWidth=r*.62;path();c.stroke();
 for(let i=1;i<=6;i++){const u=i/7,xx=length*u,yy=bend*Math.sin(u*P)*.75;const rr=Math.max(5,r*(.33-u*.18));sucker(c,xx,yy+rr*.25,rr,.72);}
 c.restore();
}
function face(c,x,y,scale,eyes=1){
 c.save();c.translate(x,y);c.scale(scale,scale);
 const g=c.createLinearGradient(-120,-120,125,105);g.addColorStop(0,'#3c0710');g.addColorStop(.42,'#a91c2b');g.addColorStop(.82,'#d94d4a');g.addColorStop(1,'#50101b');
 c.fillStyle=g;c.strokeStyle='#e56e6d';c.lineWidth=2.7;
 c.beginPath();c.moveTo(-152,8);c.bezierCurveTo(-148,-106,104,-135,158,-2);c.bezierCurveTo(136,103,-111,117,-152,8);c.closePath();c.fill();c.stroke();
 for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*29,68);c.bezierCurveTo(i*38-14,100,i*46+22,128,i*38+20,145+Math.abs(i)*18);c.strokeStyle=i%2?'#d04b50':'#84232b';c.lineWidth=13-Math.abs(i)*1.2;c.lineCap='round';c.stroke();}
 oval(c,0,-10,36,26,'#27040b',.94);c.save();c.shadowColor='#ff292c';c.shadowBlur=33*eyes;oval(c,0,-10,22,18,'#ff3131',eyes);oval(c,0,-10,9,10,'#fff3eb',eyes);c.restore();
 for(let j=0;j<5;j++){const yy=-64+j*22;lin(c,-80,yy,-112,yy-14,'#ef8380',2,.4);lin(c,81,yy,110,yy-17,'#ef8380',2,.4);}
 c.restore();
}
function harpoon(c,x,y,theta,scale=1){
 c.save();c.translate(x,y);c.rotate(theta);c.scale(scale,scale);
 lin(c,0,0,500,0,'#e2d3bc',8);lin(c,0,-2,500,-2,'#fff7e7',2);
 c.fillStyle='#c4d3d5';c.beginPath();c.moveTo(532,0);c.lineTo(489,-18);c.lineTo(496,0);c.lineTo(489,18);c.closePath();c.fill();
 c.restore();
}
function splash(c,x,y,t,power){c.save();for(let i=0;i<36;i++){const a=rand(i+12)*P*2,dist=(18+rand(i+67)*160)*t;const px=x+Math.cos(a)*dist,py=y+Math.sin(a)*dist*.65;lin(c,px,py,px+Math.cos(a)*18,py+Math.sin(a)*13,'#ffccab',1.2,power*(1-t*.45));}c.restore();}
function crack(c,dry){c.save();for(let i=0;i<15;i++){const x=i*69+rand(i+20)*60;lin(c,x,560,x+rand(i+40)*55-26,480-rand(i+60)*90,'#df6655',1.7,dry*.55);}c.restore();}
function stage0(c,t){const dry=ease(.30,5.5,t);const sea=ground(c,t,dry);crack(c,dry);boat(c,428,422+dry*51,1.2,-dry*.04);if(t>4.4)tentacle(c,866,sea-10,145,90,25,-2.05,ease(4.4,5.9,t)*.68);}
function stage1(c,t){ground(c,t,.75);const a=ease(.6,2.1,t);
 for(const [i,o]of [[0,[-25,468,390,230,34,-.51]],[1,[1045,470,385,-205,36,3.6]],[2,[160,315,230,-110,28,.25]],[3,[960,328,220,120,30,2.9]],[4,[510,520,245,-230,22,-1.55]]])tentacle(c,...o,a*clamp((t-i*.4)/2,0,1));
 boat(c,474,458,ease(2.3,4.2,t)*4,-ease(3,5.2,t)*.07);
}
function stage2(c,t){
 ground(c,t,.83);const struck=Math.min(8,Math.floor(Math.max(0,t-.8)*1.28));
 for(let i=0;i<8;i++){
  const angle=-P*.93+(P*1.86)*(i/7),x=512+Math.cos(angle)*300,y=447+Math.sin(angle)*180;
  const a=ease(.25+i*.22,.8+i*.22,t)*(i<struck?.13:1);
  tentacle(c,x,y,180+rand(i)*64,(i%2?1:-1)*(80+rand(i+9)*62),20+rand(i+4)*8,angle+(i%2?-.5:.5),a);
  if(i<struck){lin(c,350+Math.cos(angle)*110,330+Math.sin(angle)*40,610+Math.cos(angle)*110,330+Math.sin(angle)*65,'#ffecd8',5,(1-ease(i*.75+.7,i*.75+1.25,t))*.9);}
 }
 boat(c,422,456,3,0);
 c.fillStyle='#ffc5aa';c.font='bold 22px sans-serif';c.fillText('격퇴  '+struck+' / 8',26,533);
}
function stage3(c,t){
 ground(c,t,.84);
 for(let i=0;i<4;i++){const angle=(i/3)*P*.8-.25;tentacle(c,i%2?975:70,490,200,115*(i%2?1:-1),25,i%2?2.8:-.8,.6);}
 face(c,522,240,1.26,ease(.8,2.5,t));
 const attack=ease(3.6,4.8,t);
 tentacle(c,850,295,285,-180,30,2.62,attack);
 tentacle(c,210,272,270,200,30,.52,attack);
 boat(c,422,463,attack*6,-attack*.075);
}
function stage4(c,t){
 const refill=ease(2.5,6.2,t);ground(c,t,.84*(1-refill));
 face(c,510,250,1.18,1-ease(2.1,5.2,t)*.62);
 for(let i=0;i<4;i++)tentacle(c,120+i*245,492,130,(i%2?1:-1)*110,20,-1.3+i*.9,1-refill);
 boat(c,385,464-refill*39,0,-.04);
 if(t>.55){const flight=ease(.8,2.22,t),x=-180+flight*440;harpoon(c,x,142+flight*100,.18,1.08);}
 const hit=ease(2.05,2.29,t)*(1-ease(2.9,3.7,t));
 if(hit>0){splash(c,510,250,Math.min(1,(t-2.1)/1.4),hit);oval(c,514,250,120,84,'#fff2d4',hit*.33);}
 if(refill>.1){for(let j=0;j<27;j++){const x=rand(j+83)*W,y=570-refill*210+Math.sin(j*3+t*6)*19;oval(c,x,y,3+rand(j)*7,2+rand(j+18)*4,'#ffd6ae',.14*refill);}}
}
const draw=[stage0,stage1,stage2,stage3,stage4];
let runId=0,canvasRef=null,stage=-1;
function stop(){runId++;canvasRef=null;}
function mount(canvas,index){
 if(!canvas||!canvas.getContext)return false;
 const ctx=canvas.getContext('2d');if(!ctx)return false;
 stop();canvasRef=canvas;const id=runId;const chosen=clamp(Number(index)||0,0,4);
 const caption=canvas.parentElement?.querySelector('.redwhale-caption');
 let last=0,time=0,current=-1;
 function frame(ms){
  if(id!==runId||!canvas.isConnected)return;
  if(!last)last=ms;time=Math.min(DURATION,time+clamp((ms-last)/1000,0,.1));last=ms;clock=time;
  const dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(1,Math.round(canvas.clientWidth*dpr)),h=Math.max(1,Math.round(canvas.clientHeight*dpr));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  ctx.setTransform(w/W,0,0,h/H,0,0);draw[chosen](ctx,time);
  const k=time<2?0:time<4.4?1:2;
  if(k!==current){current=k;if(caption)caption.textContent=captions[chosen][k];}
  if(time>=DURATION)last=ms-100; // loop the selected scene
  if(time>=DURATION)time=0;
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
 return true;
}
window.RedWhaleCinematic={mount,stop,titles,captions,stageCount:5};
})();
