/* 모든 것을 삼키는 창백한 고래 · 3단계 위산 통과 미니게임
   위장(stomach) 단계의 선택지 대신 쓴다. 위액이 불규칙하게 솟았다 빠지고,
   완전히 빠진 짧은 순간에 노를 저으면(화면 누르기 · 스페이스 · 버튼) 1/3씩 전진한다.
   3번 성공하면 통로에 닿아 다음 단계(창백한 인어)로 넘어간다.
   분출 중에 저으면 휩쓸려 피해와 백화를 입지만 진행은 유지된다. 단, 휩쓸림은 한 번까지이고 두 번째는 사망 (minigame-strikes.js).
   위액이 빠져 있는 시간은 성공할 때마다 짧아지고(1.8초 → 1.2초 → 0.6초), 분출 길이는 매번 다르다. */
(function(){
'use strict';
const GAME=window.PallidAcidGame;
if(!GAME||typeof pallidStory161!=='function'||typeof pallidAction161!=='function')return;
let lastText='',timer=null,huntRef=null;

function inMinigame(){
 const h=state.pallidHunt161;
 return state.scene===PALLID_SCENE_161&&h&&h.phase==='stomach';
}
function syncGame(){
 const on=inMinigame();
 if(on&&(!GAME.active||huntRef!==state.pallidHunt161)){
  GAME.reset();GAME.active=true;huntRef=state.pallidHunt161;lastText='';GAME.fails=0;
 }
 if(!on&&GAME.active&&!timer){GAME.active=false;huntRef=null;}
}

const beforeStory=pallidStory161;
pallidStory161=function(){
 const h=state.pallidHunt161;
 if(!h||h.phase!=='stomach')return beforeStory();
 const n=GAME.steps||0;
 return '<div class="inset warning"><div class="small">재앙의 고래 · 모든 것을 삼키는 창백한 고래</div><h2>위장 · 주기적인 분출</h2>'+
  '<p>선체가 살아 있는 벽 사이에 걸렸습니다. 바닥에 고인 산성액이 불규칙한 간격으로 거세게 솟았다 가라앉습니다. 위액이 완전히 빠진 짧은 순간에만 노를 저어 나아갈 수 있습니다.</p>'+
  '<p>'+pallidStatus161()+'</p>'+
  '<div class="coinpanel acid-game"><div class="small">위액이 바닥까지 빠지고 건너편 통로가 빛날 때 노를 저으십시오 · 3번 전진하면 통과 · 분출 중에 저으면 휩쓸림</div>'+
  '<p>전진 <b>'+n+' / 3</b> <span class="muted">(빠져 있는 시간: 1.8초 → 1.2초 → 0.6초)</span></p>'+
  (window.MinigameStrikes?MinigameStrikes.livesHtml(GAME):'')+
  '<p id="acidText">'+esc(lastText||'이펙트 화면을 누르거나 스페이스 키, 또는 아래 버튼으로 노를 저으십시오.')+'</p>'+
  '<button type="button" class="primary" id="pallidRowBtn"'+(n>=3?' disabled':'')+'>노를 젓는다</button></div></div>';
};

function setText(t){lastText=t;const el=document.getElementById('acidText');if(el)el.textContent=t;}
function setCount(){const b=document.querySelector('.acid-game b');if(b)b.textContent=(GAME.steps||0)+' / 3';}
function doRow(){
 if(!inMinigame()||busy||timer)return;
 syncGame();
 const r=GAME.press();
 if(r==null||r==='busy')return;
 if(r==='ok'){
  setCount();
  if(GAME.steps>=3){
   setText('통과 · 위액이 다시 차오르기 전에 통로에 닿았습니다.');
   const btn=document.getElementById('pallidRowBtn');if(btn)btn.disabled=true;
   busy=true;
   timer=setTimeout(()=>{timer=null;busy=false;GAME.active=false;pallidAction161('pallidAcidWait161');},1500);
  }else setText('전진 · 위액이 빠진 틈에 노를 저어 나아갔습니다. ('+GAME.steps+'/3)');
  return;
 }
 // 휩쓸림: 기존 '분출 전 돌파'의 절반 피해, 진행은 유지 · 두 번째는 사망
 const verdict=window.MinigameStrikes?MinigameStrikes.strike(GAME):'retry';
 if(window.MinigameStrikes)MinigameStrikes.refresh(GAME);
 if(verdict==='dead'){
  setText('휩쓸림 · 두 번째 실패입니다. 위액이 배를 통째로 삼킵니다.');
  timer=1;MinigameStrikes.kill('솟구친 위액에 배와 선원들이 녹아내렸습니다.',1.9);
  return;
 }
 setText('휩쓸림 · 솟구친 위액이 배를 덮쳤습니다. 선체와 피부가 타들어 갑니다. 남은 기회 1번.');
 takeDamage(11,5);addPallor155(6);
 log('위액 분출에 휩쓸렸습니다. 선체와 선원들의 피부가 타들어 갑니다.');
 if(safeCheck())sync();
}
document.addEventListener('click',e=>{
 if(e.target.closest('#pallidRowBtn')||(GAME.active&&e.target.closest('.w5-acid-scene')))doRow();
});
document.addEventListener('keydown',e=>{
 if(!GAME.active||e.code!=='Space'||e.repeat)return;
 if(e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]'))return;
 e.preventDefault();doRow();
});

const beforePlay=renderPlay;
renderPlay=function(){syncGame();return beforePlay();};
syncGame();
if(typeof render==='function')render();
window.GREAT_LAKE_ACID_GAME={doRow};
})();
