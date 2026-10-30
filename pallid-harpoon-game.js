/* 모든 것을 삼키는 창백한 고래 · 1단계 작살 투척 미니게임
   '외피' / '입을 벌리게 할 작살' 두 전투에서 동전 던지기 대신 쓴다.
   작살 장면 위에서 조준점이 고래 이마를 오가고, 붉은 상처(명중 구간)에 겹칠 때
   화면을 누르거나 스페이스(또는 '작살 던지기' 버튼)로 던진다.
   명중 = 유효 타격(동전 앞면), 빗나감 = 백화 진행(동전 뒷면)과 같은 결과.
   난이도: 아군 전투력이 높을수록 명중 구간이 넓고 조준점이 느리다.
   3번 명중해야 통과하며, 맞힐 때마다 명중 원이 좁아지고 조준점이 빨라진다.
   빗나감은 한 번까지: 첫 빗나감은 기존처럼 반격(피해·백화), 두 번째 빗나감은 사망 (minigame-strikes.js). */
(function(){
'use strict';
const GAME=window.PallidHarpoonGame;
if(!GAME||typeof pallidBattlePanel161!=='function'||typeof resolveCoin!=='function')return;
const TYPES=new Set(['pallidShell161','pallidLure161']);
let lastText='',battleRef=null,timer=null;

function inMinigame(){return state.scene==='battle'&&state.battle&&TYPES.has(state.battle.type);}
const NEED=3;
const NARROW=[1,0.74,0.54],FASTER=[1,0.78,0.6];   // 1·2·3번째 작살: 원 크기 · 왕복 시간 배율
function difficulty(won){
 const p=combatChance();                       // 기존 동전 앞면 확률
 const k=Math.min(2,won==null?(state.battle?state.battle.won:0):won);
 const e=(window.CalamityMang?window.CalamityMang.ease():1);
 return {p,half:(18+60*p)*NARROW[k]*e,period:(2.2+1.6*p)*FASTER[k]*e};
}
// 1단계 두 전투는 3번 맞혀야 끝난다
if(typeof pallidStartBattle161==='function'){
 const beforeStart=pallidStartBattle161;
 pallidStartBattle161=function(type,name,power,need){return beforeStart(type,name,power,TYPES.has(type)?NEED:need);};
}
function newAttempt(won){
 const d=difficulty(won);
 GAME.half=d.half;GAME.period=d.period;
 GAME.zone=610+Math.random()*230;              // 상처 위치는 매 시도마다 조금씩 다름
 GAME.throwAt=null;GAME.hit=null;GAME.aimLocal=null;
}
function syncGame(){
 const on=inMinigame();
 if(on&&(!GAME.active||battleRef!==state.battle)){
  GAME.active=true;GAME.startAt=0;battleRef=state.battle;lastText='';GAME.fails=0;newAttempt();
 }
 if(!on&&GAME.active){GAME.active=false;GAME.throwAt=null;battleRef=null;}
}

function labels(){
 const d=difficulty();
 return [d.half>=44?'넓음':d.half>=30?'보통':'좁음',d.period>=3.1?'느림':d.period>=2.6?'보통':'빠름'];
}
const beforePanel=pallidBattlePanel161;
pallidBattlePanel161=function(b){
 if(!TYPES.has(b.type))return beforePanel(b);
 const [zone,speed]=labels();
 return '<div class="inset warning"><div class="small">모든 것을 삼키는 창백한 고래 · 작살 투척</div><h2>'+esc(b.name)+'</h2>'+
  '<p>'+pallidStatus161()+'</p>'+
  '<p>명중: <b>'+b.won+' / '+b.need+'</b> <span class="muted">(맞힐 때마다 원이 좁아지고 조준점이 빨라집니다)</span></p>'+
  '<div class="coinpanel harpoon-game"><div class="small">조준점이 붉은 상처에 겹칠 때 던지십시오 · 명중: 타격 성공 · 빗나감: 백화 진행</div>'+
  '<p>명중 구간 <b>'+zone+'</b> · 조준점 속도 <b>'+speed+'</b> <span class="muted">(아군 전투력 '+crewPower()+'에 따라 달라집니다)</span></p>'+
  (window.MinigameStrikes?MinigameStrikes.livesHtml(GAME):'')+
  '<p id="harpoonText">'+esc(lastText||'이펙트 화면을 누르거나 스페이스 키, 또는 아래 버튼으로 작살을 던지십시오.')+'</p>'+
  '<button type="button" class="primary" id="pallidThrowBtn"'+(GAME.throwAt!=null?' disabled':'')+'>작살 던지기</button></div>'+
  '<div class="stack" style="margin-top:12px">'+button('전투를 포기하고 도주한다','flee')+'</div>'+
  '<div class="log">'+esc(b.history.slice(-6).join('\n'))+'</div></div>';
};

function doThrow(){
 if(!inMinigame()||busy||timer)return;
 syncGame();
 const r=GAME.throwNow();
 if(r==null)return;
 busy=true;
 const verdict=r?'ok':(window.MinigameStrikes?MinigameStrikes.strike(GAME):'retry');
 lastText=r?'명중 · 작살이 아물지 않은 상처에 깊이 박혔습니다.':verdict==='dead'?'빗나감 · 두 번째 실패입니다. 창백한 고래의 입이 배를 통째로 덮칩니다.':'빗나감 · 작살이 단단한 외피에 튕겨 물속으로 떨어졌습니다. 남은 기회 1번.';
 if(window.MinigameStrikes)MinigameStrikes.refresh(GAME);
 if(verdict==='dead'){
  const t0=document.getElementById('harpoonText');if(t0)t0.textContent=lastText;
  const b0=document.getElementById('pallidThrowBtn');if(b0)b0.disabled=true;
  MinigameStrikes.kill('작살이 빗나가는 사이, 창백한 고래가 배와 선원들을 통째로 삼켰습니다.',1.9);
  return;
 }
 const t=document.getElementById('harpoonText');if(t)t.textContent=lastText;
 const btn=document.getElementById('pallidThrowBtn');if(btn)btn.disabled=true;
 timer=setTimeout(()=>{
  timer=null;busy=false;
  const b=state.battle;
  newAttempt(b?(r?b.won+1:b.won):0);  // 다음 조준: 맞혔으면 한 단계 어렵게
  resolveCoin(r);                     // 기존 판정(피해·백화·진행)을 그대로 사용
 },r?1500:1750);
}
document.addEventListener('click',e=>{
 if(e.target.closest('#pallidThrowBtn')||(GAME.active&&e.target.closest('.w3-harpoon-scene')))doThrow();
});
document.addEventListener('keydown',e=>{
 if(!GAME.active||e.code!=='Space'||e.repeat)return;
 if(e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]'))return;
 e.preventDefault();doThrow();
});

// 화면을 그릴 때마다 미니게임 상태를 맞춘다
const beforePlay=renderPlay;
renderPlay=function(){syncGame();return beforePlay();};
syncGame();
if(typeof render==='function')render();
window.GREAT_LAKE_HARPOON_GAME={difficulty,doThrow};
})();
