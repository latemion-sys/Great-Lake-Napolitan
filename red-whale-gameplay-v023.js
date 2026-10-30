/* Scarlet whale five-scene effects. Cosmetic integration only.
   No changes to combat chance, damage, drops or achievements. */
(function(){
'use strict';
const RED=2;
const labels=['말라붙는 호수','붉은 팔의 포위','여덟 팔 격퇴','붉은 눈의 머리','작살과 물의 귀환'];
const details=[
 '수면이 낮아지고 배 아래로 말라붙은 호수 바닥이 드러납니다.',
 '거대한 빨판 팔들이 솟아올라 선체를 감싸고 조여 옵니다.',
 '여덟 팔이 차례대로 공격합니다. 작살잡이가 하나씩 쳐냅니다.',
 '붉은 눈을 가진 거대한 두족류의 머리가 배를 내려다보며 공격합니다.',
 '거대한 작살이 머리에 명중하고 호수의 수면이 원래대로 돌아옵니다.'
];
function stage(){
 if(state.scene==='dead'||!state.sea||state.current==null)return null;
 if(state.redWhaleFinal023===true&&state.scene!=='battle')return 4;
 if(state.scene==='encounter'&&state.encounter===RED)return 0;
 const b=state.battle;
 if(state.scene==='battle'&&b&&b.type==='whale'&&b.index===RED)
  return Math.max(1,Math.min(3,(Number(b.won)||0)+1));
 return null;
}
function sceneMarkup(n){
 // v3: 문어+크툴루 머리, 빨판 달린 사람 팔의 SVG 시네마틱 (red-whale-v3.js / red-whale-v3-scenes.js)
 return window.RedWhaleV3?window.RedWhaleV3.html(n):'';
}
const previousPlay=renderPlay;
renderPlay=function(){
 const n=stage();
 if(n===null)return previousPlay();
 if(n===4){
  return sceneMarkup(4)+
   '<div class="inset"><h2>'+esc(WHALES[RED].name)+' · 사냥 성공</h2>'+
   '<p>거대한 작살이 붉은 고래의 두 눈 사이에 꽂혔습니다. 붉은 눈동자가 빛을 잃고, 빨판 달린 팔들이 힘없이 무너집니다. 머리가 가라앉자 말라붙었던 호수에 물이 다시 차오릅니다.</p>'+
   '<p class="muted">전리품과 사냥 업적은 기존 판정대로 지급되었습니다.</p>'+
   button('사냥을 마치고 항해 계속하기','redWhaleContinue023','','primary')+
   '</div>';
 }
 return sceneMarkup(n)+previousPlay();
};
const previousCoin=resolveCoin;
resolveCoin=function(win){
 const b=state.battle;
 const success=!!(win&&b&&b.type==='whale'&&b.index===RED&&b.won+1>=b.need);
 if(success)state.redWhaleFinal023=true;
 const result=previousCoin(win);
 if(success&&state.scene==='dead')state.redWhaleFinal023=false;
 return result;
};
document.addEventListener('click',function(e){
 const b=e.target?.closest?.('button[data-act]');
 if(!b||b.disabled||busy)return;
 if(b.dataset.act==='redWhaleReplay023'){
  if(window.RedWhaleV3)window.RedWhaleV3.replayToken++;
 }
 if(b.dataset.act==='redWhaleContinue023'&&state.redWhaleFinal023&&state.scene!=='dead'){
  state.redWhaleFinal023=false;
  sync();
 }
});
if(state.redWhaleFinal023&&(!state.sea||state.scene==='dead'||state.current==null)){
 state.redWhaleFinal023=false;save();
}
render();
window.RED_WHALE_HUNT_023={stage,labels};
})();
