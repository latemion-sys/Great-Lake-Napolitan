/* 대호수 · 창백한 고래: 백화 억제 수단
   - 창백한 고래에게 삼켜지는 순간 승선자 전원이 백화된다. 억제 수단(백화 억제제)이 없으면 그 자리에서 사망.
   - 억제제는 항구 상점에서 사며, 삼켜질 때 1개 소모된다.
   - 위장 진입 이후의 미니게임(위산 · 심장)은 억제제로 백화를 버티고 있다는 전제로 기존대로 진행된다. */
(function(){
'use strict';
if(typeof pallidAction161!=='function'||typeof renderShop132!=='function')return;
const COST=60,NAME='백화 억제제';
const count=()=>Math.max(0,state.pallorWard|0);

// 항구 상점
const prevShop=renderShop132;
renderShop132=function(){
 const h=prevShop(),avail=inShop132();
 return h+'<div class="inset"><h3>백화 억제</h3>'+
  '<p class="muted">창백한 고래에게 삼켜지는 순간, 승선자의 몸을 덮쳐 오는 백화를 한동안 억누릅니다. 삼켜질 때 1개를 씁니다. 지니지 않은 채 삼켜지면 그 자리에서 고래의 일부가 됩니다.</p>'+
  tag('보유 '+count()+'개')+'<div class="stack" style="margin-top:8px">'+
  button(NAME+' · '+unitMoney(COST),'pallorWardBuy','','',!avail||state.gold<COST)+'</div></div>';
};
document.addEventListener('click',e=>{
 const b=e.target&&e.target.closest&&e.target.closest('button[data-act="pallorWardBuy"]');
 if(!b||b.disabled||busy||!inShop132()||state.gold<COST)return;
 state.gold-=COST;state.pallorWard=count()+1;
 log(NAME+' 구입. '+unitMoney(COST)+' 사용. (보유 '+state.pallorWard+'개)');sync();
});

// 사냥 화면의 상태 줄
const prevStatus=pallidStatus161;
pallidStatus161=function(){return prevStatus()+' '+tag(NAME+' '+count()+'개');};

// 입 앞에서 경고
const prevStory=pallidStory161;
pallidStory161=function(){
 const h=state.pallidHunt161;
 if(h&&h.noWard)return pallidPanel161('백화','턱이 닫히는 순간, 창백한 조직이 갑판을 타고 번져 선원들의 피부를 덮습니다. 억누를 것이 아무것도 없습니다. 비명이 하나씩 멎습니다.',[]);
 const html=prevStory();
 if(!h||h.phase!=='mouth')return html;
 const note=count()>0
  ?'<p class="small">'+NAME+' '+count()+'개를 지니고 있습니다. 삼켜지는 순간 1개를 써서 백화를 억누릅니다.</p>'
  :'<p class="small" style="color:#ffb3a8"><b>백화를 억제할 수단이 없습니다.</b> 이대로 삼켜지면 그 순간 배와 선원 모두 백화되어 사망합니다.</p>';
 return html.replace('<div class="stack"',note+'<div class="stack"');
};

// 삼켜지는 순간
const prevAction=pallidAction161;
pallidAction161=function(act){
 const hunt=state.pallidHunt161;
 if(act==='pallidEnter161'&&hunt&&hunt.phase==='mouth'&&hunt.ready&&state.scene===PALLID_SCENE_161){
  if(count()<=0){
   hunt.phase='swallowing';hunt.noWard=true;
   state.deathCause155={kind:'pallor',whale:0};
   log('배와 선원들이 통째로 삼켜졌습니다. 턱이 닫히는 순간, 창백한 조직이 피부를 타고 번졌습니다. 백화를 억누를 수단이 없었습니다.');
   sync();
   busy=true;
   setTimeout(()=>{busy=false;state.pallor155=100;state.deathCause155={kind:'pallor',whale:0};die();},3400);
   return;
  }
  prevAction(act);
  if(state.pallidHunt161&&state.pallidHunt161.phase==='swallowing'){
   state.pallorWard=count()-1;
   log(NAME+'를 썼습니다. 피부 위로 번지던 창백함이 멈춥니다. (남은 '+state.pallorWard+'개)');
   sync();
  }
  return;
 }
 return prevAction(act);
};
})();
