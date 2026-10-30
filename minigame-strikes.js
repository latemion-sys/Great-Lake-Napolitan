/* 대호수 · 고래 미니게임 공통 실패 규칙
   모든 고래의 미니게임은 실패를 한 번까지 허용한다.
   - 첫 번째 실패: 피해를 입고 다시 도전 (남은 기회 1)
   - 두 번째 실패: 사망
   실패 횟수는 미니게임마다 따로 센다(게임 상태 객체의 fails).
   테스트 페이지의 '피해 무시'가 켜져 있으면(window.__MINIGAME_NODEATH) 사망 대신 기회를 되돌린다. */
(function(){
'use strict';
const LIMIT=2;
function noDeath(){return !!(window.__MINIGAME_NODEATH||window.__BLUE_NODEATH);}
const API=window.MinigameStrikes={
 LIMIT,
 noDeath,
 // 실패 한 번 기록 → 'retry' | 'dead' | 'reset'(테스트용)
 // 5망을 두르면 실패를 한 번 더 허용
 limit(){return LIMIT+(window.CalamityMang?window.CalamityMang.extraLife():0);},
 strike(obj){
  obj.fails=(obj.fails||0)+1;
  if(obj.fails<API.limit())return 'retry';
  if(noDeath()){obj.fails=0;if(typeof log==='function')log('[테스트] 사망 대신 기회를 되돌립니다.');return 'reset';}
  return 'dead';
 },
 left(obj){return Math.max(0,API.limit()-((obj&&obj.fails)||0));},
 // 패널에 넣는 '남은 기회' 줄
 livesHtml(obj){return '<p class="mg-lives">남은 기회 <b class="mg-lives-n">'+API.left(obj)+'</b> <span class="muted">('+(API.limit()>LIMIT?'5망 · 실패 두 번까지 피해 후 다시 · 세 번째 실패는 사망':'첫 실패는 피해 후 다시 · 두 번째 실패는 사망')+')</span></p>';},
 refresh(obj){document.querySelectorAll('.mg-lives-n').forEach(n=>n.textContent=String(API.left(obj)));},
 // 사망 장면을 잠시 보여 준 뒤 사망 처리
 kill(message,delay){
  if(typeof busy!=='undefined')busy=true;
  setTimeout(()=>{busy=false;if(message&&typeof log==='function')log(message);if(typeof die==='function')die();},Math.max(0,(delay==null?1.8:delay)*1000));
 }
};
})();
