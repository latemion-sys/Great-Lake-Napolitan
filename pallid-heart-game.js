/* 모든 것을 삼키는 창백한 고래 · 5단계 심장 파괴 미니게임
   마지막 '심장 속 심장' 전투(pallidCore161)의 동전 던지기 대신 쓴다.
   ① 화면에 뜬 → ← ↑ ↓ 중 무작위 10개를 순서대로 입력한다(키보드 방향키 또는 화면 버튼).
      틀리면 정신·백화 피해를 입고 새 10개로 처음부터 다시.
   ② 다 입력하면 작은 심장 위에 맞출 원이 생기고, 조준점이 상하좌우로 오간다.
      조준점이 원 안에 있을 때 화면을 누르거나 스페이스(또는 버튼) → 작살이 조준점으로 날아간다.
      맞히면 심장이 파괴되어 사냥 성공, 빗나가면 피해를 입고 다시 조준.
   화살표를 틀리거나 작살이 빗나가는 실패는 합쳐서 한 번까지, 두 번째 실패는 사망 (minigame-strikes.js). */
(function(){
'use strict';
if(typeof pallidBattlePanel161!=='function'||typeof resolveCoin!=='function')return;
const HG=window.PallidHeartGame=window.PallidHeartGame||{active:false};
const KEYS=['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'],GLYPH={ArrowLeft:'←',ArrowUp:'↑',ArrowRight:'→',ArrowDown:'↓'};
const COUNT=10;
let battleRef=null,timer=null,lastText='';

function inMinigame(){return state.scene==='battle'&&state.battle&&state.battle.type==='pallidCore161';}
function now(){return HG.startAt?(performance.now()-HG.startAt)/1000:0;}
function newSeq(){HG.seq=Array.from({length:COUNT},()=>KEYS[Math.floor(Math.random()*4)]);HG.idx=0;}
function resetAim(){HG.throwAt=null;HG.hit=null;HG.aimPt=null;HG.aimStart=now();}
function syncGame(){
 const on=inMinigame();
 if(on&&(!HG.active||battleRef!==state.battle)){
  Object.assign(HG,{active:true,startAt:0,phase:'keys',failAt:null,okAt:null,throwAt:null,hit:null,aimPt:null,
   radius:26,ampX:84,ampY:70,wx:2.3,wy:3.2,fails:0});
  battleRef=state.battle;lastText='';newSeq();
 }
 if(!on&&HG.active&&!timer){HG.active=false;battleRef=null;}
}

/* ---- 전투 패널 ---- */
const beforePanel=pallidBattlePanel161;
pallidBattlePanel161=function(b){
 if(b.type!=='pallidCore161')return beforePanel(b);
 const keys=HG.phase==='keys';
 return '<div class="inset warning"><div class="small">모든 것을 삼키는 창백한 고래 · 심장 파괴</div><h2>'+esc(b.name)+'</h2>'+
  '<p>'+pallidStatus161()+'</p>'+
  '<div class="coinpanel heart-game">'+
   (keys
    ?'<div class="small">작살잡이가 자세를 잡습니다 · 화살표 10개를 순서대로 입력하십시오 · 틀리면 처음부터</div>'+
     '<div class="hg-seq" id="hgSeq">'+seqHtml()+'</div>'+
     '<div class="hg-pad">'+KEYS.map(k=>'<button type="button" class="hg-key" data-hgkey="'+k+'">'+GLYPH[k]+'</button>').join('')+'</div>'
    :'<div class="small">조준점이 작은 심장의 원 안에 들어올 때 던지십시오 · 화면 누르기 / 스페이스</div>'+
     '<button type="button" class="primary" id="hgThrowBtn"'+(HG.throwAt!=null?' disabled':'')+'>작살을 던진다</button>')+
   (window.MinigameStrikes?MinigameStrikes.livesHtml(HG):'')+
   '<p id="hgText">'+esc(lastText||(keys?'키보드 방향키 또는 위 버튼으로 입력하십시오.':'마지막 기회입니다.'))+'</p>'+
  '</div>'+
  '<p class="muted">이미 고래 안쪽에 들어왔습니다. 끝까지 싸우거나 이곳에서 죽어야 합니다.</p>'+
  '<div class="log">'+esc(b.history.slice(-6).join('\n'))+'</div></div>';
};
function seqHtml(){
 return HG.seq.map((k,i)=>'<span class="hg-k'+(i<HG.idx?' done':i===HG.idx?' cur':'')+'">'+GLYPH[k]+'</span>').join('');
}
function setText(t){lastText=t;const el=document.getElementById('hgText');if(el)el.textContent=t;}
function refreshSeq(){const el=document.getElementById('hgSeq');if(el)el.innerHTML=seqHtml();}

/* ---- ① 화살표 입력 ---- */
function pressKey(k){
 if(!inMinigame()||HG.phase!=='keys'||busy||timer)return;
 syncGame();
 const t=now();
 if(k===HG.seq[HG.idx]){
  HG.idx++;HG.okAt=t;refreshSeq();
  if(HG.idx>=COUNT){
   HG.phase='aim';resetAim();
   setText('자세를 잡았습니다. 조준점이 원 안에 들어올 때 던지십시오.');
   render();
  }
  return;
 }
 HG.failAt=t;
 const verdict=window.MinigameStrikes?MinigameStrikes.strike(HG):'retry';
 if(window.MinigameStrikes)MinigameStrikes.refresh(HG);
 if(verdict==='dead'){setText('어긋났습니다 · 두 번째 실패입니다. 거대한 심장이 배를 짓눌러 버립니다.');timer=1;MinigameStrikes.kill('심장의 박동에 짓눌려 배와 선원들이 창백한 고래 속에서 스러졌습니다.',1.9);return;}
 setText('어긋났습니다 · 심장의 박동이 손을 떨게 합니다. 처음부터 다시 입력하십시오. 남은 기회 1번.');
 takeDamage(0,4);addPallor155(5);
 log('심장의 박동에 작살잡이의 손이 떨렸습니다.');
 newSeq();
 if(safeCheck())sync();
}

/* ---- ② 마지막 작살 ---- */
function doThrow(){
 if(!inMinigame()||HG.phase!=='aim'||HG.throwAt!=null||busy||timer||!HG.retPt||!HG.heartPt)return;
 const t=now(),[rx,ry]=HG.retPt,[hx,hy]=HG.heartPt;
 const hit=Math.hypot(rx-hx,ry-hy)<=(HG.radius||26)*(window.CalamityMang?window.CalamityMang.ease():1);
 HG.throwAt=t;HG.aimPt=[rx,ry];HG.hit=hit;
 busy=true;
 const verdict=hit?'ok':(window.MinigameStrikes?MinigameStrikes.strike(HG):'retry');
 if(window.MinigameStrikes)MinigameStrikes.refresh(HG);
 setText(hit?'명중 · 작살이 심장 속의 심장을 꿰뚫었습니다.':verdict==='dead'?'빗나감 · 두 번째 실패입니다. 거대한 심장이 배를 짓눌러 버립니다.':'빗나감 · 작살이 심장벽에 튕겨 나갔습니다. 남은 기회 1번.');
 if(verdict==='dead'){const bt=document.getElementById('hgThrowBtn');if(bt)bt.disabled=true;timer=1;busy=false;MinigameStrikes.kill('작살이 빗나간 사이, 심장의 박동에 배와 선원들이 짓눌렸습니다.',2.0);return;}
 const btn=document.getElementById('hgThrowBtn');if(btn)btn.disabled=true;
 timer=setTimeout(()=>{
  timer=null;busy=false;
  const b=state.battle;
  if(!b||b.type!=='pallidCore161')return;
  if(hit){
   b.won=Math.max(0,b.need-1);
   HG.active=false;
   resolveCoin(true);                 // 마지막 타격 처리 → 고래 처치 · 5단계 장면
   return;
  }
  b.history.push('빗나감 · 심장의 반격');
  takeDamage(0,8);addPallor155(9);
  log('작살이 빗나갔습니다. 거대한 심장의 박동이 몸을 흔듭니다.');
  resetAim();
  if(safeCheck())sync();
 },hit?1300:1500);
}

document.addEventListener('keydown',e=>{
 if(!HG.active||e.repeat)return;
 if(e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]'))return;
 if(KEYS.includes(e.key)&&HG.phase==='keys'){e.preventDefault();pressKey(e.key);}
 else if(e.code==='Space'&&HG.phase==='aim'){e.preventDefault();doThrow();}
});
document.addEventListener('click',e=>{
 const k=e.target.closest('[data-hgkey]');if(k){pressKey(k.dataset.hgkey);return;}
 if(e.target.closest('#hgThrowBtn')||(HG.active&&HG.phase==='aim'&&e.target.closest('.w6-heart-scene')))doThrow();
});

// 이펙트 위 표시: 화살표 줄 · 안내 · 판정
HG.onFrame=function(el,t){
 // 5단계로 표시: 장면 제목과 설명을 '심장 파괴'로
 const top=el.querySelector('.cine-top'),bot=el.querySelector('.cine-bottom');
 if(top&&top.textContent.includes('심장 탐색'))top.textContent=top.textContent.replace('심장 탐색','심장 파괴');
 if(bot&&!bot.dataset.hg){bot.dataset.hg='1';bot.textContent='자세를 바로잡고, 마지막 작살로 심장 속의 심장을 꿰뚫습니다.';}
 const keys=el.querySelector('.w6-keys'),hint=el.querySelector('.w6-hint'),vd=el.querySelector('.w6-verdict');
 if(keys){
  const html=HG.phase==='keys'?seqHtml():'';
  if(keys.dataset.v!==html){keys.innerHTML=html;keys.dataset.v=html;}
 }
 if(hint)hint.textContent=HG.phase==='keys'?'방향키를 순서대로 · '+HG.idx+' / '+COUNT:(HG.throwAt==null?'원 안에 들어올 때 · 화면 누르기 / 스페이스':'');
 if(vd){
  const f=HG.failAt!=null?t-HG.failAt:9,s=HG.throwAt!=null?t-HG.throwAt-0.42:-1;
  const txt=f>=0&&f<0.9?'어긋남':s>0&&s<1.4?(HG.hit?'명중':'빗나감'):'';
  vd.textContent=txt;vd.className='w6-verdict'+(txt?(txt==='명중'?' hit':' miss'):'');
 }
};

const beforePlay=renderPlay;
renderPlay=function(){syncGame();return beforePlay();};
syncGame();
if(typeof render==='function')render();
window.GREAT_LAKE_HEART_GAME={pressKey,doThrow};
})();
