/* 대호수 · 재앙의 고래에게 죽었을 때의 전용 마지막 장면과 엔딩 문구
   die()가 불리는 순간의 상황(어느 고래 · 어느 단계)을 보고 장면을 고른다.
   창백한 고래: 외피·입 작살 단계 = 통째로 삼켜짐 / 위장(위산) = 배가 위산에 녹음 / 심장 = 백화로 온몸이 하얗게 변함
   푸른 고래: 배째로 반으로 갈라짐 · 붉은 고래: 배째로 불타오름 · 검은 고래: 날개에 흡수됨 · 노란 고래: 배째로 가라앉음
   장면은 한 번 재생한 뒤 마지막 모습에서 멈춘다(검은 화면으로 끝내지 않음). */
(function(){
'use strict';
const K=window.BlueWhaleV3Kit;
if(!K||typeof die!=='function'||typeof renderPlay!=='function')return;
const {W,H,SEA,clamp,outC,inC,inOut,seg,lerp,n1,n3,TAU,RAD,seeded,esc,commonDefs,boatMarkup,boatPose,lamp,drops,dropParams,paintDrops,BOAT,BOAT_S}=K;
const hump=x=>Math.sin(Math.PI*clamp(x));

/* ---------- 어떤 죽음인가 ---------- */
function kindNow(){
 try{
  const b=state.battle,h=state.pallidHunt161,dc=state.deathCause155;
  if(dc&&dc.kind==='pallor')return 'pallid_white';
  if(b&&(b.type==='pallidShell161'||b.type==='pallidLure161'))return 'pallid_swallow';
  if(b&&b.type==='pallidCore161')return 'pallid_white';
  if(h&&h.phase==='stomach')return 'pallid_acid';
  if(h&&h.phase==='heart')return 'pallid_white';
  if(b&&b.type==='whale'){return ['pallid_swallow','blue_split','red_burn','black_absorb','yellow_sink'][b.index]||null;}
  if(h)return 'pallid_swallow';
  if(state.scene==='encounter'&&state.encounter!=null&&state.encounter<=4)return ['pallid_swallow','blue_split','red_burn','black_absorb','yellow_sink'][state.encounter];
 }catch(e){}
 return null;
}
const prevDie=die;
die=function(){
 const k=kindNow();
 const r=prevDie.apply(this,arguments);
 if(k){state.whaleDeath024=k;try{save();}catch(e){}render();}
 return r;
};

/* ---------- 엔딩 문구 ---------- */
const TEXT={
 pallid_swallow:{title:'모든 것을 삼키는 창백한 고래',lines:['물이 아래로 꺼졌다. 배가 미끄러져 내려간 곳은 물이 아니라 입이었다.','창백한 턱이 닫히는 소리는 들리지 않았다. 다만 별이 하나씩, 위에서부터 사라졌다.','{who} 대호수의 수면 아래, 아물지 않는 상처를 가진 고래의 뱃속으로 들어갔다. 그 뒤로 그 호수에서는 아무리 기다려도 메아리가 돌아오지 않는다고 한다.']},
 pallid_acid:{title:'모든 것을 삼키는 창백한 고래 · 위장',lines:['위액이 솟았다 빠지는 틈을 놓쳤다. 녹색 물이 뱃전을 넘는 데에는 한 번이면 충분했다.','나무가 먼저 녹고, 그 다음은 노가, 그 다음은 손이었다. 김이 올라가는 동안 아무도 비명을 지르지 않았다. 지를 입이 먼저 녹았기 때문이다.','{who} 창백한 고래의 위장에서 형체를 잃었다. 고래는 그 뒤로도 오래 헤엄쳤고, 그 숨에서는 가끔 송진 냄새가 났다고 한다.']},
 pallid_white:{title:'모든 것을 삼키는 창백한 고래 · 심장',lines:['심장이 한 번 뛰었다. 하얀 것이 핏줄을 따라 번졌다. 고래의 핏줄이 아니라, 선원들의 핏줄이었다.','손끝부터 빛이 빠져나갔다. 등불도, 밧줄도, 서로의 얼굴도 같은 빛깔이 되었다. 하얗다. 아무 무늬도 남지 않을 만큼.','{who} 백화했다. 창백한 고래의 뱃속에는 하얀 배 한 척이 지금도 떠 있다고 한다. 선원들은 아직 노를 쥐고 있다. 다만 누구의 얼굴인지는 알아볼 수 없다.']},
 blue_split:{title:'모든 것을 뚫는 푸른 고래',lines:['보이지 않았다. 보인 것은 이미 지나간 곧은 선 하나뿐이었다.','배가 소리 없이 두 쪽으로 갈라졌다. 앞쪽 반과 뒤쪽 반이 서로를 한참 바라보다가 각자의 물속으로 내려갔다. 물기둥은 한참 늦게 솟았다.','{who} 푸른 고래가 지나간 궤적 위에 있었다. 그 호수의 해도에는 지금도 배를 두 쪽으로 가르는 곧은 줄이 하나 그어져 있다.']},
 red_burn:{title:'모든 것을 말리는 붉은 고래',lines:['물이 다 말라 버린 바닥에서 배가 먼저 달아올랐다. 송진이 끓고, 돛이 오그라들고, 뱃전이 붉게 빛났다.','불길은 아래에서 위로 솟지 않았다. 배 전체가 한꺼번에 불이 되었다. 붉은 팔들은 그 불을 오래도록 쥐고 있었다.','{who} 말라붙은 호수 바닥에 검게 탄 용골만 남겼다. 비가 와도 그 자리에는 물이 고이지 않는다고 한다.']},
 black_absorb:{title:'모든 것을 감싸안는 검은 고래',lines:['날개가 접혔다. 위에서도, 옆에서도, 아래에서도. 별이 하나씩 지워졌고 마지막으로 등불이 지워졌다.','그것은 해치지 않았다. 다만 감쌌을 뿐이다. 따뜻하지도 차갑지도 않은 어둠 속에서 선원들은 조금씩 작아졌다. 아주 작은 것이 될 때까지.','{who} 검은 날개 안쪽에 감싸였다. 그 뒤로 그 호수의 밤하늘에는 날개 모양으로 별이 없는 자리가 있다. 그 안에서 가끔 노래가 들린다고 한다.']},
 yellow_sink:{title:'모든 것을 가라앉히는 노란 고래',lines:['물길이 삼각형 한가운데로 감겨 들었다. 노를 저을수록 더 빨리 끌려갔다.','배는 기울지도 뒤집히지도 않았다. 똑바로 선 채, 노란 물속으로 천천히 내려갔다. 등불은 한참 동안 물 아래에서 빛났다.','{who} 황토빛 등껍질 아래로 가라앉았다. 삼백 년 뒤에야 떠오른다는 소문이 있다. 그때 배가 떠오르는지, 고래가 떠오르는지는 아무도 모른다.']}
};
function who(){const c=String(state.deathCaptainName||state.captainName||state.playerName||'').trim()||'선장';const code=c.charCodeAt(c.length-1),b=code>=0xAC00&&code<=0xD7A3&&(code-0xAC00)%28!==0;return esc(c+(b?'은':'는'));}

/* ---------- 공통 그림 ---------- */
function defs(){
 return commonDefs()+
 '<linearGradient id="wdNight" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#03060c"/><stop offset=".7" stop-color="#0c1824"/><stop offset="1" stop-color="#14242e"/></linearGradient>'+
 '<linearGradient id="wdSea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0e1a22"/><stop offset="1" stop-color="#020406"/></linearGradient>'+
 '<radialGradient id="wdMoon"><stop stop-color="#eef4f6" stop-opacity=".55"/><stop offset=".2" stop-color="#cfdde4" stop-opacity=".18"/><stop offset="1" stop-color="#9fb4c0" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="wdRip"><stop offset=".7" stop-color="#cfe0ec" stop-opacity="0"/><stop offset=".88" stop-color="#e2eef6" stop-opacity=".4"/><stop offset="1" stop-color="#cfe0ec" stop-opacity="0"/></radialGradient>'+
 '<filter id="wdB4" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>'+
 '<filter id="wdB12" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="12"/></filter>'+
 '<clipPath id="wdAbove"><rect width="'+W+'" height="'+(SEA+1)+'"/></clipPath>'+
 // 창백한 살 · 이빨 · 목구멍
 '<linearGradient id="wdFlesh" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f2efe6"/><stop offset=".35" stop-color="#d8d2c4"/><stop offset=".8" stop-color="#a8a092"/><stop offset="1" stop-color="#6a6458"/></linearGradient>'+
 '<linearGradient id="wdFleshU" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#e8e2d6"/><stop offset=".5" stop-color="#bcb4a6"/><stop offset="1" stop-color="#7a7266"/></linearGradient>'+
 '<radialGradient id="wdThroat" cx=".5" cy=".7" r=".7"><stop stop-color="#000"/><stop offset=".5" stop-color="#1a0608"/><stop offset=".85" stop-color="#5a1a1e"/><stop offset="1" stop-color="#8a3a3a"/></radialGradient>'+
 '<linearGradient id="wdTooth" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffdf6"/><stop offset="1" stop-color="#b8b0a0"/></linearGradient>'+
 // 위장 · 위산
 '<radialGradient id="wdCave" cx=".5" cy=".4" r=".8"><stop stop-color="#4a1824"/><stop offset=".6" stop-color="#22080e"/><stop offset="1" stop-color="#0a0204"/></radialGradient>'+
 '<linearGradient id="wdAcid" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c8dc78" stop-opacity=".85"/><stop offset=".2" stop-color="#7a9a3a" stop-opacity=".9"/><stop offset="1" stop-color="#1e2a08"/></linearGradient>'+
 '<radialGradient id="wdFume"><stop stop-color="#d8f0a0" stop-opacity=".45"/><stop offset=".6" stop-color="#a8c868" stop-opacity=".15"/><stop offset="1" stop-color="#a8c868" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="wdBub"><stop offset=".5" stop-color="#e8f8b0" stop-opacity="0"/><stop offset=".85" stop-color="#f4ffd0" stop-opacity=".8"/><stop offset="1" stop-color="#e8f8b0" stop-opacity="0"/></radialGradient>'+
 // 심장 · 백화
 '<radialGradient id="wdHeart" cx=".45" cy=".4" r=".7"><stop stop-color="#f4e8e0"/><stop offset=".5" stop-color="#c8a8a0"/><stop offset="1" stop-color="#5a3a3a"/></radialGradient>'+
 '<radialGradient id="wdWhite"><stop stop-color="#ffffff"/><stop offset=".5" stop-color="#f4f2ee" stop-opacity=".85"/><stop offset="1" stop-color="#e8e4dc" stop-opacity="0"/></radialGradient>'+
 // 불
 '<linearGradient id="wdRedSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1a0204"/><stop offset=".6" stop-color="#4a0a10"/><stop offset="1" stop-color="#8a2418"/></linearGradient>'+
 '<linearGradient id="wdMud" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5a2a1a"/><stop offset=".4" stop-color="#3a160c"/><stop offset="1" stop-color="#120604"/></linearGradient>'+
 '<linearGradient id="wdFlame" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#fff2b0"/><stop offset=".25" stop-color="#ffb030"/><stop offset=".6" stop-color="#e04a14" stop-opacity=".9"/><stop offset="1" stop-color="#7a0a04" stop-opacity="0"/></linearGradient>'+
 '<radialGradient id="wdGlow"><stop stop-color="#ffcf6a" stop-opacity=".8"/><stop offset=".4" stop-color="#ff7a2a" stop-opacity=".35"/><stop offset="1" stop-color="#a01a08" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="wdSmoke"><stop stop-color="#2a1a14" stop-opacity=".7"/><stop offset=".6" stop-color="#1a0e0a" stop-opacity=".3"/><stop offset="1" stop-color="#1a0e0a" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="wdEmber"><stop stop-color="#fff0b0"/><stop offset=".4" stop-color="#ff9a30" stop-opacity=".7"/><stop offset="1" stop-color="#ff5a10" stop-opacity="0"/></radialGradient>'+
 // 푸른 빛줄기
 '<linearGradient id="wdBlueLine" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#9fe0ff" stop-opacity="0"/><stop offset=".7" stop-color="#bff0ff" stop-opacity=".8"/><stop offset="1" stop-color="#ffffff"/></linearGradient>'+
 '<linearGradient id="wdBill" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#0a2a44"/><stop offset=".6" stop-color="#2a6a9a"/><stop offset="1" stop-color="#cfefff"/></linearGradient>'+
 '<radialGradient id="wdSpray"><stop stop-color="#e8f6ff" stop-opacity=".7"/><stop offset=".5" stop-color="#bfe0f4" stop-opacity=".25"/><stop offset="1" stop-color="#bfe0f4" stop-opacity="0"/></radialGradient>'+
 // 노란 물
 '<linearGradient id="wdGoldSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#140f06"/><stop offset=".55" stop-color="#4a3814"/><stop offset="1" stop-color="#c49a4a"/></linearGradient>'+
 '<linearGradient id="wdGoldSea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5a4618"/><stop offset=".5" stop-color="#2a1e08"/><stop offset="1" stop-color="#0c0902"/></linearGradient>'+
 '<radialGradient id="wdPit"><stop stop-color="#050300" stop-opacity=".95"/><stop offset=".45" stop-color="#140c02" stop-opacity=".6"/><stop offset="1" stop-color="#2a1c06" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="wdGoldGlow"><stop stop-color="#ffe7a0" stop-opacity=".7"/><stop offset=".4" stop-color="#ffc850" stop-opacity=".25"/><stop offset="1" stop-color="#c88a20" stop-opacity="0"/></radialGradient>';
}
let STAR=null;
function stars(cls){if(!STAR){const r=seeded(17);STAR=[];for(let i=0;i<150;i++)STAR.push([r()*W,Math.pow(r(),1.3)*(SEA-20),.4+r()*1.3,.3+.7*r()]);}
 return '<g class="'+(cls||'wd-stars')+'">'+STAR.map((s,i)=>'<circle data-i="'+i+'" cx="'+n1(s[0])+'" cy="'+n1(s[1])+'" r="'+n1(s[2])+'" fill="#eef4ff" opacity="'+n3(s[3])+'"/>').join('')+'</g>';}
function ripples(cls,n){let s='';for(let i=0;i<(n||4);i++)s+='<ellipse class="'+cls+'" data-i="'+i+'" rx="1" ry="1" fill="url(#wdRip)" opacity="0"/>';return s;}
function paintRipples(el,cls,cx,cy,t,k,R){el.querySelectorAll('.'+cls).forEach(e=>{const i=+e.dataset.i,a=((t*.35+i/4)%1);e.setAttribute('cx',n1(cx));e.setAttribute('cy',n1(cy));e.setAttribute('rx',n1((30+a*(R||300))));e.setAttribute('ry',n1((5+a*(R||300)*.16)));e.setAttribute('opacity',n3(clamp(k)*(1-a)*.8));});}
function bob(t){return {y:Math.sin(t*1.5)*2+Math.sin(t*.7)*1.2,r:Math.sin(t*1.2+.6)*2.4};}
const nightBase=()=>'<rect width="'+W+'" height="'+H+'" fill="url(#wdNight)"/><circle cx="790" cy="96" r="180" fill="url(#wdMoon)"/><circle cx="790" cy="96" r="22" fill="#e6eef2" opacity=".6" filter="url(#wdB4)"/>'+stars()+
 '<rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" fill="url(#wdSea)"/>';

/* =================== 장면 =================== */
const S={};
/* 창백한 고래: 배 밑에서 솟은 거대한 입이 위아래로 닫혀 통째로 삼킴 */
function teeth(n,y0,len,dir,seed){const r=seeded(seed);let s='';for(let i=0;i<n;i++){const x=-430+i*(860/(n-1))+(r()-.5)*8,l=len*(.6+.6*r()),w=6+r()*5;s+='<path d="M'+n1(x-w)+','+y0+' Q'+n1(x-w*.2)+','+n1(y0+dir*l*.6)+' '+n1(x+(r()-.5)*3)+','+n1(y0+dir*l)+' Q'+n1(x+w*.2)+','+n1(y0+dir*l*.6)+' '+n1(x+w)+','+y0+' Z" fill="url(#wdTooth)"/>';}return s;}
S.pallid_swallow={dur:8.5,
 build(){return nightBase()+
  '<g class="ps-up" opacity="0"><path d="M-480,0 C-430,-120 -220,-210 0,-220 C220,-210 430,-120 480,0 L480,-500 L-480,-500 Z" fill="url(#wdFleshU)"/>'+
   '<path d="M-470,-4 C-420,-110 -210,-196 0,-206 C210,-196 420,-110 470,-4" fill="none" stroke="#fffdf4" stroke-opacity=".35" stroke-width="3"/>'+teeth(30,-6,46,1,5)+'</g>'+
  '<g clip-path="url(#wdAbove)"><g class="ps-low" opacity="0"><path d="M-480,0 C-430,40 -220,90 0,96 C220,90 430,40 480,0 L480,400 L-480,400 Z" fill="url(#wdFlesh)"/>'+
   '<ellipse cx="0" cy="34" rx="380" ry="54" fill="url(#wdThroat)"/>'+teeth(32,4,-40,-1,9)+
   '<path d="M-470,4 C-420,44 -210,90 0,94 C210,90 420,44 470,4" fill="none" stroke="#fffdf4" stroke-opacity=".3" stroke-width="2.4"/></g></g>'+
  boatMarkup()+drops('ps-dr',40,21,'#e6f0f4')+ripples('ps-rp',5)+
  '<rect class="ps-dark" width="'+W+'" height="'+H+'" fill="#03060c" opacity="0"/>';},
 paint(el,t){
  const q=s=>el.querySelector(s),open=outC(seg(t,.6,2.4)),close=inOut(seg(t,3.6,4.6)),sink=inC(seg(t,4.8,6.6));
  const cx=470,low=q('.ps-low'),up=q('.ps-up');
  const ly=SEA+120-160*open+40*close+260*sink,uy=SEA-40-200*open*(1-close)+120*close+260*sink;
  low.setAttribute('transform','translate('+cx+' '+n1(Math.min(ly,SEA+130))+') scale('+n3(1+.15*open)+')');low.setAttribute('opacity',n3(seg(t,.4,1)*(1-seg(t,6.4,7))));
  up.setAttribute('transform','translate('+cx+' '+n1(uy)+') scale('+n3(1+.15*open)+')');up.setAttribute('opacity',n3(seg(t,1.6,2.6)*(1-seg(t,6.2,6.8))));
  const B=bob(t),by=SEA+B.y-120*open*(1-close)+40*close+300*sink;
  const tw=boatPose(el,cx-10,by,B.r+8*Math.sin(t*3)*open,[37,-30]);lamp(el,t,tw,-.6*close);
  if(!S.pallid_swallow._d)S.pallid_swallow._d=dropParams(40,21,-170,-10,120,380);
  paintDrops(el.querySelectorAll('.ps-dr circle'),S.pallid_swallow._d,cx,SEA-60*open,t-.9,300,500);
  paintRipples(el,'ps-rp',cx,SEA+6,t,seg(t,5.6,6.6),360);
  q('.ps-dark').setAttribute('opacity',n3(.5*hump(seg(t,4.2,6.6))));
 }};
/* 창백한 고래 · 위장: 위산이 솟아 배가 아래에서부터 녹아내림 */
S.pallid_acid={dur:8,
 build(){let fm='',bb='',fr='';const r=seeded(31);
  for(let i=0;i<9;i++)fm+='<ellipse class="pa-fm" data-i="'+i+'" rx="1" ry="1" fill="url(#wdFume)" opacity="0"/>';
  for(let i=0;i<22;i++)bb+='<circle class="pa-bb" data-i="'+i+'" r="1" fill="url(#wdBub)" opacity="0"/>';
  for(let i=0;i<6;i++)fr+='<path class="pa-fr" data-i="'+i+'" d="M-12,-2 L10,-3 L13,2 L-10,3 Z" fill="#2a1a0c" opacity="0"/>';
  let ribs='';for(let i=0;i<9;i++)ribs+='<path d="M'+(i*120-40)+',0 C'+(i*120)+',140 '+(i*120+30)+',260 '+(i*120-10)+','+SEA+'" fill="none" stroke="#6a2432" stroke-width="'+(10+r()*14)+'" stroke-opacity=".35"/>';
  return '<rect width="'+W+'" height="'+H+'" fill="url(#wdCave)"/>'+ribs+
   '<g clip-path="url(#paClip)"><g class="pa-boat">'+BOAT+'</g></g>'+
   '<clipPath id="paClip"><rect class="pa-cut" x="0" y="0" width="'+W+'" height="'+SEA+'"/></clipPath>'+
   '<path class="pa-acid" fill="url(#wdAcid)"/>'+fr+bb+fm+'<rect class="pa-veil" width="'+W+'" height="'+H+'" fill="#c8dc78" opacity="0"/>';},
 paint(el,t){
  const q=s=>el.querySelector(s),rise=outC(seg(t,.4,2.2)),melt=seg(t,1.6,5.6);
  const lvl=SEA+30-60*rise+10*Math.sin(t*1.3);
  let d='M0,'+n1(lvl);for(let x=0;x<=W;x+=24)d+=' L'+x+','+n1(lvl+5*Math.sin(x*.03+t*2.4)+3*Math.sin(x*.07-t*1.7));d+=' L'+W+','+H+' L0,'+H+' Z';q('.pa-acid').setAttribute('d',d);
  const bx=480,by=SEA-8+Math.sin(t*1.6)*2+40*melt,rock=Math.sin(t*2.2)*(3+6*melt);
  q('.pa-boat').setAttribute('transform','translate('+bx+' '+n1(by)+') rotate('+n1(rock)+') scale('+(BOAT_S*1.25)+')');
  q('.pa-cut').setAttribute('height',n1(lvl-2));
  el.querySelectorAll('.pa-bb').forEach(e=>{const i=+e.dataset.i,a=((t*.8+i*.137)%1),x=bx-80+((i*53)%160)+Math.sin(t*3+i)*4;e.setAttribute('cx',n1(x));e.setAttribute('cy',n1(lvl+30-a*34));e.setAttribute('r',n1(2+((i*7)%5)*(.6+melt)));e.setAttribute('opacity',n3(seg(t,1.2,2)*(1-a)*.9*(1-seg(t,6.5,7.5)*.6)));});
  el.querySelectorAll('.pa-fm').forEach(e=>{const i=+e.dataset.i,a=((t*.25+i/9)%1);e.setAttribute('cx',n1(bx-140+i*35+Math.sin(t+i)*10));e.setAttribute('cy',n1(lvl-a*220));e.setAttribute('rx',n1(30+a*70));e.setAttribute('ry',n1(20+a*40));e.setAttribute('opacity',n3(seg(t,1.4,2.4)*(1-a)*.8));});
  el.querySelectorAll('.pa-fr').forEach(e=>{const i=+e.dataset.i,a=seg(t,4.2+i*.2,8),x=bx-60+i*24+a*(i%2?30:-30);e.setAttribute('transform','translate('+n1(x)+' '+n1(lvl+2+Math.sin(t*2+i)*2)+') rotate('+n1(i*30+t*10)+')');e.setAttribute('opacity',n3(seg(t,4.2+i*.2,4.6+i*.2)*(1-a*.5)));});
  q('.pa-veil').setAttribute('opacity',n3(.12*hump(seg(t,1.8,5.8))));
 }};
/* 창백한 고래 · 심장: 하얀 것이 핏줄을 따라 번져 배와 선원이 모두 하얗게 변함 */
S.pallid_white={dur:8,
 build(){let vein='';const r=seeded(61);
  for(let i=0;i<16;i++){let x=480+(r()-.5)*80,y=150+(r()-.5)*60,d='M'+n1(x)+','+n1(y);const a0=r()*TAU;for(let k=0;k<9;k++){const a=a0+Math.sin(k*.7+i)*.6;x+=Math.cos(a)*(40+r()*30);y+=Math.sin(a)*(26+r()*20);d+=' L'+n1(x)+','+n1(y);}
   vein+='<path class="pw-v" data-i="'+i+'" d="'+d+'" fill="none" stroke="#fffdf8" stroke-width="'+n1(2+r()*4)+'" stroke-linecap="round" stroke-dasharray="900" stroke-dashoffset="900" opacity=".9"/>';}
  return '<rect width="'+W+'" height="'+H+'" fill="url(#wdCave)"/>'+
   '<g class="pw-heart"><ellipse cx="480" cy="150" rx="210" ry="150" fill="url(#wdHeart)"/><path d="M330,120 C380,60 460,40 520,70 C600,40 660,110 620,170" fill="none" stroke="#7a4a4a" stroke-width="10" stroke-opacity=".5"/><path d="M360,220 C420,250 540,250 600,210" fill="none" stroke="#7a4a4a" stroke-width="8" stroke-opacity=".4"/></g>'+
   '<rect y="'+(SEA-6)+'" width="'+W+'" height="'+(H-SEA+6)+'" fill="#2a0e14"/>'+vein+
   '<g class="pw-boat">'+BOAT+'</g><g class="pw-boatW" opacity="0"><g style="filter:brightness(0) invert(1)">'+BOAT+'</g></g>'+
   '<circle class="pw-bloom" cx="480" cy="'+(SEA-40)+'" r="1" fill="url(#wdWhite)" opacity="0"/>'+
   '<rect class="pw-white" width="'+W+'" height="'+H+'" fill="#f6f4ee" opacity="0"/>';},
 paint(el,t){
  const q=s=>el.querySelector(s),beat=Math.pow(Math.max(0,Math.sin(t*TAU/1.1)),8);
  q('.pw-heart').setAttribute('transform','translate(480 150) scale('+n3(1+.05*beat+.1*seg(t,0,4))+') translate(-480 -150)');
  el.querySelectorAll('.pw-v').forEach(e=>{const i=+e.dataset.i,k=seg(t,.6+i*.12,3.4+i*.12);e.setAttribute('stroke-dashoffset',n1(900*(1-k)));});
  const wk=inOut(seg(t,2.6,5.2));
  const tf='translate(480 '+n1(SEA-4+Math.sin(t*1.4)*2)+') rotate('+n1(Math.sin(t*1.1)*2)+') scale('+(BOAT_S*1.3)+')';
  q('.pw-boat').setAttribute('transform',tf);q('.pw-boatW').setAttribute('transform',tf);q('.pw-boatW').setAttribute('opacity',n3(wk));
  const bl=q('.pw-bloom');bl.setAttribute('r',n1(60+520*wk));bl.setAttribute('opacity',n3(.85*seg(t,3,5)));
  q('.pw-white').setAttribute('opacity',n3(.78*inOut(seg(t,4.6,7))));
 }};
/* 푸른 고래: 곧은 빛줄기가 배를 지나가고, 배가 두 쪽으로 갈라져 각자 가라앉음 */
S.blue_split={dur:8,
 build(){return nightBase()+
  '<clipPath id="bsL"><rect x="-200" y="-200" width="200" height="400" transform="rotate(8)"/></clipPath><clipPath id="bsR"><rect x="0" y="-200" width="200" height="400" transform="rotate(8)"/></clipPath>'+
  '<g clip-path="url(#wdAbove)"><g class="bs-L"><g clip-path="url(#bsL)">'+BOAT+'</g></g><g class="bs-R"><g clip-path="url(#bsR)">'+BOAT+'</g></g></g>'+
  '<path class="bs-line" d="M-60,0 L1100,0" stroke="url(#wdBlueLine)" stroke-width="5" stroke-linecap="round" opacity="0"/>'+
  '<g class="bs-bill" opacity="0"><path d="M-420,-9 C-200,-12 -40,-6 60,0 C-40,6 -200,12 -420,9 Z" fill="url(#wdBill)"/><path d="M-400,-3 L40,-.5" stroke="#e8f8ff" stroke-opacity=".5" stroke-width="1.2"/></g>'+
  '<g class="bs-col" opacity="0"><ellipse cx="0" cy="-120" rx="60" ry="140" fill="url(#wdSpray)"/><ellipse cx="-30" cy="-60" rx="50" ry="80" fill="url(#wdSpray)"/><ellipse cx="34" cy="-80" rx="44" ry="100" fill="url(#wdSpray)"/></g>'+
  drops('bs-dr',44,33,'#e8f6ff')+ripples('bs-rp',4)+
  '<rect class="bs-flash" width="'+W+'" height="'+H+'" fill="#dff4ff" opacity="0"/>';},
 paint(el,t){
  const q=s=>el.querySelector(s),cx=480,hit=1.4,s2=t-hit,sp=outC(seg(t,hit+.3,4.6)),sink=inC(seg(t,3,7));
  const ln=q('.bs-line');ln.setAttribute('transform','translate(0 '+(SEA-30)+') rotate(-8 480 0)');ln.setAttribute('opacity',n3(seg(t,.6,1.2)*(1-seg(t,hit+.6,hit+1.6))));
  const bill=q('.bs-bill'),bx=lerp(-200,1500,seg(t,hit-.25,hit+.35));bill.setAttribute('transform','translate('+n1(bx)+' '+(SEA-30+(bx-480)*-.14)+') rotate(-8)');bill.setAttribute('opacity',n3(t>hit-.3&&t<hit+.5?1:0));
  q('.bs-flash').setAttribute('opacity',n3(.55*Math.exp(-Math.max(0,s2)*5)*(s2>0?1:0)));
  const B=bob(t),y0=SEA+B.y;
  q('.bs-L').setAttribute('transform','translate('+n1(cx-50*sp)+' '+n1(y0+20*sp+140*sink)+') rotate('+n1(-22*sp-20*sink)+') scale('+BOAT_S*1.25+')');
  q('.bs-R').setAttribute('transform','translate('+n1(cx+60*sp)+' '+n1(y0+14*sp+150*sink)+') rotate('+n1(26*sp+24*sink)+') scale('+BOAT_S*1.25+')');
  const col=q('.bs-col'),ck=hump(seg(t,hit+.9,hit+3.6));col.setAttribute('transform','translate('+cx+' '+SEA+') scale('+n3(.4+ck)+' '+n3(ck)+')');col.setAttribute('opacity',n3(ck));
  if(!S.blue_split._d)S.blue_split._d=dropParams(44,33,-150,-30,160,420);
  paintDrops(el.querySelectorAll('.bs-dr circle'),S.blue_split._d,cx,SEA-10,s2-.9,80,420);
  paintRipples(el,'bs-rp',cx,SEA+6,t,seg(t,3,4),320);
 }};
/* 붉은 고래: 말라붙은 바닥에서 배가 통째로 불타오름 */
S.red_burn={dur:8.5,
 build(){let fl='',em='',sm='',ar='';const r=seeded(71);
  for(let i=0;i<18;i++)fl+='<path class="rb-fl" data-i="'+i+'" fill="url(#wdFlame)" opacity="0"/>';
  for(let i=0;i<30;i++)em+='<circle class="rb-em" data-i="'+i+'" r="1" fill="url(#wdEmber)" opacity="0"/>';
  for(let i=0;i<8;i++)sm+='<ellipse class="rb-sm" data-i="'+i+'" rx="1" ry="1" fill="url(#wdSmoke)" opacity="0"/>';
  for(let i=0;i<5;i++){const x=80+i*200+r()*40,h=160+r()*120;ar+='<path d="M'+n1(x)+','+(SEA+30)+' C'+n1(x-20)+','+n1(SEA-h*.4)+' '+n1(x+30)+','+n1(SEA-h*.8)+' '+n1(x+10)+','+n1(SEA-h)+'" fill="none" stroke="#7a0e18" stroke-width="'+n1(18+r()*10)+'" stroke-linecap="round" opacity=".55"/>';}
  return '<rect width="'+W+'" height="'+H+'" fill="url(#wdRedSky)"/>'+ar+'<rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" fill="url(#wdMud)"/>'+
   '<ellipse class="rb-glow" cx="480" cy="'+(SEA-10)+'" rx="1" ry="1" fill="url(#wdGlow)" opacity="0"/>'+sm+
   '<g class="rb-boat">'+BOAT+'</g><g class="rb-hot" opacity="0"><g style="filter:brightness(0) saturate(100%) invert(30%) sepia(90%) saturate(2000%) hue-rotate(345deg)">'+BOAT+'</g></g>'+
   '<g class="rb-char" opacity="0"><g style="filter:brightness(0)">'+BOAT+'</g></g>'+fl+em;},
 paint(el,t){
  const q=s=>el.querySelector(s),heat=seg(t,.3,2),fire=inOut(seg(t,1.4,3)),die2=seg(t,5.5,8.4);
  const bx=480,by=SEA+16,tf='translate('+bx+' '+by+') rotate(-3) scale('+(BOAT_S*1.3)+')';
  ['.rb-boat','.rb-hot','.rb-char'].forEach(c=>q(c).setAttribute('transform',tf));
  q('.rb-hot').setAttribute('opacity',n3(heat*(1-die2)*(.75+.25*Math.sin(t*9))));q('.rb-char').setAttribute('opacity',n3(die2));
  const gl=q('.rb-glow');gl.setAttribute('rx',n1(140+160*fire));gl.setAttribute('ry',n1(60+80*fire));gl.setAttribute('opacity',n3((.3*heat+.7*fire)*(1-.7*die2)*(.85+.15*Math.sin(t*13))));
  el.querySelectorAll('.rb-fl').forEach(e=>{const i=+e.dataset.i,x=bx-110+i*13+Math.sin(t*3+i)*4,h=(60+60*((i*37)%7)/7)*(fire*(1-die2*.85))*(.75+.25*Math.sin(t*11+i*2)),w=12+((i*13)%5)*3,sway=Math.sin(t*5+i)*10;
   e.setAttribute('d','M'+n1(x-w)+','+(by-6)+' C'+n1(x-w*.8)+','+n1(by-6-h*.4)+' '+n1(x+sway-w*.3)+','+n1(by-6-h*.7)+' '+n1(x+sway)+','+n1(by-6-h)+' C'+n1(x+sway+w*.3)+','+n1(by-6-h*.7)+' '+n1(x+w*.8)+','+n1(by-6-h*.4)+' '+n1(x+w)+','+(by-6)+' Z');e.setAttribute('opacity',n3(fire*(1-die2*.8)));});
  el.querySelectorAll('.rb-em').forEach(e=>{const i=+e.dataset.i,a=((t*.4+i*.137)%1);e.setAttribute('cx',n1(bx-120+((i*61)%240)+Math.sin(t*2+i)*20*a));e.setAttribute('cy',n1(by-20-a*300));e.setAttribute('r',n1(1.5+2.5*(1-a)));e.setAttribute('opacity',n3((.2+.8*fire)*(1-a)*(1-die2*.6)));});
  el.querySelectorAll('.rb-sm').forEach(e=>{const i=+e.dataset.i,a=((t*.18+i/8)%1);e.setAttribute('cx',n1(bx-60+i*16+a*60));e.setAttribute('cy',n1(by-60-a*260));e.setAttribute('rx',n1(40+a*90));e.setAttribute('ry',n1(30+a*60));e.setAttribute('opacity',n3(fire*(1-a)*.85));});
 }};
/* 검은 고래: 양쪽에서 솟은 날개가 배 위로 접혀 별과 등불을 지우며 감싸 안음 */
const WING='M-230,20 C-226,-80 -186,-210 -104,-318 C-52,-386 26,-436 104,-448 C134,-452 150,-440 140,-428 C92,-410 46,-372 18,-318 C-4,-276 -14,-226 -10,-176 C-6,-136 -18,-104 -10,-70 C-2,-36 26,-6 60,20 Z';
S.black_absorb={dur:8.5,
 build(){let mo='';for(let i=0;i<16;i++)mo+='<circle class="ba-mo" data-i="'+i+'" r="1.5" fill="#ffe2a8" opacity="0"/>';
  return nightBase()+boatMarkup()+
   '<g class="ba-wL"><path d="'+WING+'" fill="#000"/><path d="'+WING+'" fill="none" stroke="#9fb8cc" stroke-opacity=".18" stroke-width="10"/></g>'+
   '<g class="ba-wR"><path d="'+WING+'" fill="#000"/><path d="'+WING+'" fill="none" stroke="#9fb8cc" stroke-opacity=".18" stroke-width="10"/></g>'+mo+
   '<radialGradient id="baHole" gradientUnits="userSpaceOnUse" cx="480" cy="300" r="300"><stop stop-color="#000" stop-opacity="0"/><stop offset=".6" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#02040a" stop-opacity=".8"/></radialGradient>'+
   '<rect class="ba-dark" width="'+W+'" height="'+H+'" fill="url(#baHole)" opacity="0"/>'+stars('ba-back');},
 paint(el,t){
  const q=s=>el.querySelector(s),rise=outC(seg(t,.4,2)),fold=inOut(seg(t,2.2,4.6)),gone=seg(t,4.4,6.4);
  const B=bob(t),tw=boatPose(el,480,SEA+B.y+30*gone,B.r,[37,-30]);lamp(el,t,tw,-.5*fold);
  const s1=1.15,yL=SEA+30+470*s1*(1-rise);
  q('.ba-wL').setAttribute('transform','translate('+n1(250+170*fold)+' '+n1(yL-60*fold)+') rotate('+n1(8+70*fold)+') scale('+s1+')');
  q('.ba-wR').setAttribute('transform','translate('+n1(710-170*fold)+' '+n1(yL-60*fold)+') rotate('+n1(-8-70*fold)+') scale('+(-s1)+' '+s1+')');
  el.querySelectorAll('.wd-stars circle').forEach(c=>{const x=+c.getAttribute('cx');c.style.opacity=n3(1-clamp(fold*1.6-Math.abs(x-480)/700));});
  const dk=q('.ba-dark');dk.setAttribute('opacity',n3(.62*fold*(1-.45*seg(t,6.4,8.5))));
  const g=el.querySelector('#baHole');g.setAttribute('r',n1(lerp(700,40,fold)));
  el.querySelectorAll('.ba-mo').forEach(e=>{const i=+e.dataset.i,a=seg(t,3.2+i*.06,5.6+i*.06),ang=i/16*TAU;e.setAttribute('cx',n1(480+Math.cos(ang)*(140*(1-a))));e.setAttribute('cy',n1(SEA-30+Math.sin(ang)*(60*(1-a))-a*20));e.setAttribute('opacity',n3(hump(a)*.8));});
  // 날개 모양으로 별이 없는 자리 — 마지막에 별이 돌아오지만 그 자리만 빔
  el.querySelectorAll('.ba-back circle').forEach(c=>{const x=+c.getAttribute('cx'),y=+c.getAttribute('cy'),inW=Math.abs(x-480)<300-Math.abs(y-160)*.6&&y>60;c.style.opacity=n3(seg(t,6.4,8)*(inW?0:.8));});
 }};
/* 노란 고래: 삼각형 한가운데의 물길에 감겨 배가 똑바로 선 채 가라앉음 */
S.yellow_sink={dur:9,
 build(){let sp='',bb='';for(let i=0;i<14;i++)sp+='<path class="ys-sp" data-i="'+i+'" fill="none" stroke="#ffe2a8" stroke-width="3" stroke-linecap="round"/>';
  for(let i=0;i<18;i++)bb+='<circle class="ys-bb" data-i="'+i+'" r="1" fill="none" stroke="#fff2c8" stroke-width="1" opacity="0"/>';
  return '<rect width="'+W+'" height="'+(SEA+2)+'" fill="url(#wdGoldSky)"/><circle cx="300" cy="'+(SEA-70)+'" r="230" fill="url(#wdGoldGlow)"/>'+
   '<rect y="'+SEA+'" width="'+W+'" height="'+(H-SEA)+'" fill="url(#wdGoldSea)"/>'+
   '<ellipse class="ys-pit" cx="560" cy="'+(SEA+60)+'" rx="1" ry="1" fill="url(#wdPit)"/>'+sp+boatMarkup()+
   '<ellipse class="ys-lampU" rx="1" ry="1" fill="url(#wdGoldGlow)" opacity="0"/>'+bb+'<path class="ys-plank" d="M-14,-2.4 L14,-2.4 L13,2.4 L-13,2.4 Z" fill="#3a2810" opacity="0"/>';},
 paint(el,t){
  const q=s=>el.querySelector(s),C=[560,SEA+60],pull=seg(t,0,3.6),sink=inC(seg(t,3,6.4)),calm=seg(t,6,9);
  el.querySelectorAll('.ys-sp').forEach(e=>{const i=+e.dataset.i,rot=t*(.6+.6*(1-calm))+i/14*TAU;let d='';const R0=60+((i*37)%140);
   for(let j=0;j<=36;j++){const u=j/36,a=rot+u*TAU*1.1,r=R0*(1-u*.85)+20;d+=(j?' L':'M')+n1(C[0]+Math.cos(a)*r*1.9)+','+n1(C[1]+Math.sin(a)*r*.42);}
   e.setAttribute('d',d);e.setAttribute('opacity',n3((.05+.12*(1-calm))*(.5+.5*Math.sin(t*1.7+i))));});
  const pit=q('.ys-pit');pit.setAttribute('rx',n1(80+160*(1-calm)));pit.setAttribute('ry',n1(20+40*(1-calm)));pit.setAttribute('opacity',n3(.4+.5*(1-calm)));
  const ang=-2.4+pull*3.2,rr=(1-pull)*230+30,bx=C[0]+Math.cos(ang)*rr*1.3,byS=SEA+Math.sin(t*1.5)*1.5+Math.sin(ang)*rr*.12+sink*130;
  const tw=boatPose(el,bx,byS,Math.sin(t*2)*3*(1-sink),[37,-30]);lamp(el,t,tw,-.2);
  const lw=tw([51,-18.5]),lu=q('.ys-lampU');lu.setAttribute('cx',n1(lw[0]));lu.setAttribute('cy',n1(Math.max(SEA+6,lw[1])));lu.setAttribute('rx',n1(30+20*sink));lu.setAttribute('ry',n1(12+10*sink));lu.setAttribute('opacity',n3(sink*(1-seg(t,7,9))));
  el.querySelectorAll('.ys-bb').forEach(e=>{const i=+e.dataset.i,a=((t*.7+i*.13)%1);e.setAttribute('cx',n1(bx-40+((i*29)%80)));e.setAttribute('cy',n1(SEA+20-a*20));e.setAttribute('r',n1(1+3*a));e.setAttribute('opacity',n3(seg(t,4,4.8)*(1-a)*(1-calm*.8)));});
  const pl=q('.ys-plank');pl.setAttribute('transform','translate('+n1(C[0]+Math.cos(t*.4)*80)+' '+n1(SEA+30+Math.sin(t*.4)*8)+') rotate('+n1(t*12)+')');pl.setAttribute('opacity',n3(seg(t,6,7)));
 }};

/* ---------- 화면 ---------- */
function sceneHtml(k){
 const Sx=S[k];if(!Sx)return '';
 return '<div class="pallid-cine-v2 wd-scene" data-kind="'+k+'" role="img" aria-label="'+esc(TEXT[k].title+' · 마지막 장면')+'">'+
  '<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>'+defs()+'</defs>'+Sx.build()+'</svg>'+
  '<span class="cine-top" aria-hidden="true">'+esc(TEXT[k].title)+'</span><span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}
const prevRender=renderPlay;
renderPlay=function(){
 const k=state.scene==='dead'&&state.whaleDeath024;
 if(!k||!TEXT[k])return prevRender();
 const T=TEXT[k],w=who();
 return sceneHtml(k)+'<section class="death-credit-164 wd-credit" aria-label="항해 종료">'+
  '<p class="death-credit-kicker-164">대호수 · 항해 종료 · '+esc(T.title)+'</p>'+
  '<div class="death-credit-text-164">'+T.lines.map(l=>'<p>'+l.replace('{who}',w)+'</p>').join('')+'</div>'+
  '<div class="death-credit-actions-164">'+button('처음부터 다시 시작','restart','','primary')+'</div></section>';
};
let t0=0,seenEl=null;
function frame(now){
 const el=document.querySelector('.wd-scene');
 if(el&&el.isConnected){
  if(el!==seenEl){seenEl=el;t0=now;el._bw=null;}
  const k=el.dataset.kind,Sx=S[k];
  if(Sx){const t=Math.min((now-t0)/1000,Sx.dur);try{Sx.paint(el,t);}catch(e){if(!el._wdErr){el._wdErr=1;console.warn('마지막 장면',e);}}}
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.WhaleDeath024={kinds:Object.keys(S),kindNow,show(k){state.scene='dead';state.whaleDeath024=k;render();}};
if(state.scene==='dead'&&state.whaleDeath024)render();
})();
