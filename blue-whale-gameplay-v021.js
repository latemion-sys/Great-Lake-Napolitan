/* Blue whale V.0.2.1 · Apply the approved five-scene cinematic to the existing whale hunt.
   No changes to coin odds, whale attack stats, wins, rewards, achievements or other whale effects. */
(function(){
'use strict';
const BLUE_WHALE_INDEX=1;
const labels=[
 {title:'수면의 절단',tag:'01 / SURFACE FRACTURE',desc:'푸른 몸이 보이기도 전에 수면이 먼저 잘려 나갑니다.'},
 {title:'초고속 관통',tag:'02 / FIRST IMPACT',desc:'첫 돌진. 고래가 바다를 관통하는 속도를 직접 목격합니다.'},
 {title:'푸른 항로 추적',tag:'03 / HIGH-SPEED PURSUIT',desc:'고래가 남긴 물길을 따라 배가 전속력으로 추격합니다.'},
 {title:'관통 회피',tag:'04 / PIERCING EVASION',desc:'고래가 선체를 관통하려는 순간 배를 옆으로 틀어 피합니다.'},
 {title:'최후의 교차',tag:'05 / FINAL INTERCEPTION',desc:'마지막 초고속 돌진에 작살을 미리 던져 사냥을 끝냅니다.'}
];
function phaseNow(){
 if(state.scene==='dead'||!state.sea||state.current==null)return null;
 if(state.blueWhaleFinalStage===true&&state.scene!=='battle')return 4;
 if(state.scene==='encounter'&&state.encounter===BLUE_WHALE_INDEX)return 0;
 if(state.scene==='battle'&&state.battle?.type==='whale'&&state.battle.index===BLUE_WHALE_INDEX){
  return Math.max(1,Math.min(3,(Number(state.battle.won)||0)+1));
 }
 return null;
}
function blueMarkup(stage){
 const item=labels[stage];
 if(!item)return '';
 return '<section class="bluewhale-game'+(stage===4?' bluewhale-game-finale':'')+'" aria-label="모든 것을 뚫는 푸른 고래 · '+(stage+1)+'단계 시네마틱">'+
 '<div class="bluewhale-game-header"><span class="bluewhale-game-title">'+(stage+1)+' · '+item.title+'</span>'+
 '<span class="bluewhale-game-phase">'+item.tag+'</span></div>'+
 '<div class="bluewhale-game-screen" data-bluewhale-stage="'+stage+'">'+
 '<canvas id="blueWhaleCanvas021" width="1024" height="576" role="img" aria-label="거대한 푸른 고래의 '+item.title+' 연출"></canvas>'+
 '<span class="bluewhale-game-corner">THE GREAT LAKE · BLUE CALAMITY</span>'+
 '<div class="bluewhale-caption" aria-live="off"></div></div>'+
 '<div class="bluewhale-game-footer"><span class="bluewhale-game-desc">'+item.desc+'</span>'+
 '<button class="bluewhale-replay" data-act="blueWhaleReplay021" type="button">연출 다시 보기 ↻</button></div></section>';
}
const oldPlay=renderPlay;
renderPlay=function(){
 const stage=phaseNow();
 if(stage===null)return oldPlay();
 if(stage===4){
  return blueMarkup(4)+
   '<div class="inset"><h2>'+esc(WHALES[BLUE_WHALE_INDEX].name)+' · 사냥 성공</h2>'+
   '<p>푸른 고래가 마지막으로 뚫고 지나간 수면에 작살의 궤적만 남았습니다. 물기둥이 걷히고, 거대한 그림자가 아래로 가라앉습니다.</p>'+
   '<p class="muted">고래 사냥 전리품과 업적은 기존 사냥 결과대로 지급되었습니다.</p>'+
   button('사냥을 마치고 항해 계속하기','blueWhaleContinue021','','primary')+
   '</div>';
 }
 return blueMarkup(stage)+oldPlay();
};
// Set the finale flag before the existing completion chain runs and re-renders.
// The normal chain still awards relics, performs whale-kill bookkeeping, and advances state.
const oldResolve=resolveCoin;
resolveCoin=function(win){
 const b=state.battle;
 const final=!!(b&&b.type==='whale'&&b.index===BLUE_WHALE_INDEX&&win&&b.won+1>=b.need);
 if(final)state.blueWhaleFinalStage=true;
 const result=oldResolve(win);
 if(final&&state.scene==='dead')state.blueWhaleFinalStage=false;
 return result;
};
const oldRender=render;
render=function(){
 const result=oldRender();
 const canvas=document.getElementById('blueWhaleCanvas021');
 if(canvas&&window.BlueWhaleCinematic){
  const stage=phaseNow();
  if(stage!==null)window.BlueWhaleCinematic.mount(canvas,stage);
 }else if(window.BlueWhaleCinematic){
  window.BlueWhaleCinematic.stop();
 }
 return result;
};
document.addEventListener('click',function(ev){
 const b=ev.target?.closest?.('button[data-act]');
 if(!b||b.disabled||busy)return;
 if(b.dataset.act==='blueWhaleReplay021'){
  const canvas=document.getElementById('blueWhaleCanvas021');
  const stage=phaseNow();
  if(canvas&&stage!==null)window.BlueWhaleCinematic?.mount(canvas,stage);
 }
 if(b.dataset.act==='blueWhaleContinue021'&&state.blueWhaleFinalStage&&state.scene!=='dead'){
  state.blueWhaleFinalStage=false;
  sync();
 }
});
// Resume a saved successful hunt without an extra whale spawn, and let the user close the finale.
if(state.blueWhaleFinalStage&&(!state.sea||state.scene==='dead'||state.current==null)){
 state.blueWhaleFinalStage=false;
 save();
}
render();
window.BLUE_WHALE_HUNT_021={phaseNow,labels};
})();