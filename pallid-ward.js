/* 대호수 · 창백한 고래: 백화 억제제와 고래 기름
   - 인어를 물리치면 드물게 '특수한 고래 기름'을 얻는다. 항구에서 기름 1개로 백화 억제제 1개를 만든다.
   - 창백한 고래 뱃속에서는 단계마다 억제제를 쓴다.
     삼켜질 때 1 · 위산을 지날 때 1 · 인어와 싸울 때 1 · 심장 곁에서 버티는 동안 2 = 모두 5개.
   - 쓸 억제제가 없는 순간 승선자 전원이 백화되어 사망한다.
   - 위산 · 인어 · 심장 미니게임은 억제제로 백화를 버티고 있다는 전제로 기존대로 진행된다. */
(function(){
'use strict';
if(typeof pallidAction161!=='function'||typeof renderShop132!=='function')return;
const WARD='백화 억제제',OIL='특수한 고래 기름',NEED=5;
const DROP={normal:.06,special:.16,blueMermaid:.16,pallidMermaid161:.2};
const wards=()=>Math.max(0,state.pallorWard|0);
const oils=()=>Math.max(0,state.whaleOil|0);

/* ---------- 인어에게서 드물게 나오는 고래 기름 ---------- */
const prevCoin=resolveCoin;
resolveCoin=function(win){
 const b=state.battle,chance=b&&DROP[b.type];
 const out=prevCoin(win);
 if(chance&&win&&b.won>=b.need&&state.scene!=='dead'&&Math.random()<chance){
  state.whaleOil=oils()+1;
  log('쓰러진 인어의 몸에서 '+OIL+'을 걷어 냈습니다. 창백한 기운을 밀어내는 냄새가 납니다. (보유 '+state.whaleOil+'개)');
  if(typeof sync==='function')sync();
 }
 return out;
};

/* ---------- 항구: 기름 → 억제제 ---------- */
const prevShop=renderShop132;
renderShop132=function(){
 const h=prevShop(),avail=inShop132();
 return h+'<div class="inset"><h3>백화 억제제 만들기</h3>'+
  '<p class="muted">인어를 물리치면 드물게 '+OIL+'이 나옵니다. 기름 1개로 '+WARD+' 1개를 만듭니다. '+
  '창백한 고래에게 삼켜지면 뱃속에서 모두 '+NEED+'개가 필요합니다(삼켜질 때 1 · 위산 1 · 인어 1 · 심장 2). 쓸 억제제가 떨어지는 순간 백화되어 사망합니다.</p>'+
  tag(OIL+' '+oils()+'개')+' '+tag(WARD+' '+wards()+'개')+'<div class="stack" style="margin-top:8px">'+
  button(WARD+' 만들기 · 기름 1개','pallorWardMake','','',!avail||oils()<1)+
  button(WARD+' 모두 만들기 · 기름 '+oils()+'개','pallorWardMakeAll','','',!avail||oils()<2)+'</div></div>';
};
document.addEventListener('click',e=>{
 const b=e.target&&e.target.closest&&e.target.closest('button[data-act="pallorWardMake"],button[data-act="pallorWardMakeAll"]');
 if(!b||b.disabled||busy||!inShop132()||oils()<1)return;
 const n=b.dataset.act==='pallorWardMakeAll'?oils():1;
 state.whaleOil=oils()-n;state.pallorWard=wards()+n;
 log(OIL+' '+n+'개로 '+WARD+' '+n+'개를 만들었습니다. (억제제 '+state.pallorWard+'개)');sync();
});

/* ---------- 사냥 화면 ---------- */
const prevStatus=pallidStatus161;
pallidStatus161=function(){return prevStatus()+' '+tag(WARD+' '+wards()+'개');};
const prevStory=pallidStory161;
pallidStory161=function(){
 const h=state.pallidHunt161;
 if(h&&h.pallorDeath)return pallidPanel161('백화',h.pallorDeath,[]);
 const html=prevStory();
 if(!h||h.phase!=='mouth')return html;
 const n=wards(),note=n>=NEED
  ?'<p class="small">'+WARD+' '+n+'개를 지니고 있습니다. 뱃속에서 모두 '+NEED+'개를 씁니다(삼켜질 때 1 · 위산 1 · 인어 1 · 심장 2).</p>'
  :'<p class="small" style="color:#ffb3a8"><b>'+WARD+' '+n+'/'+NEED+'개.</b> 뱃속에서 억제제가 떨어지는 순간 배와 선원 모두 백화되어 사망합니다.</p>';
 return html.replace('<div class="stack"',note+'<div class="stack"');
};

/* ---------- 뱃속에서 억제제 쓰기 ---------- */
function pallorDeath(hunt,text,phase){
 if(phase)hunt.phase=phase;
 hunt.pallorDeath=text;
 state.battle=null;state.scene=PALLID_SCENE_161;
 state.deathCause155={kind:'pallor',whale:0};
 log(text);sync();
 busy=true;
 setTimeout(()=>{busy=false;state.pallor155=100;state.deathCause155={kind:'pallor',whale:0};die();},3400);
}
// n개를 쓰고, 모자라면 백화 사망. 쓰고 나면 true
function spend(hunt,n,why,deathText,phase){
 if(wards()<n){
  state.pallorWard=0;
  pallorDeath(hunt,deathText,phase);
  return false;
 }
 state.pallorWard=wards()-n;
 log(why+' '+WARD+' '+n+'개를 썼습니다. (남은 '+state.pallorWard+'개)');
 return true;
}
const prevAction=pallidAction161;
pallidAction161=function(act){
 const hunt=state.pallidHunt161;
 if(!hunt||state.scene!==PALLID_SCENE_161||busy)return prevAction(act);
 if(act==='pallidEnter161'&&hunt.phase==='mouth'&&hunt.ready){
  if(wards()<1)return void pallorDeath(hunt,'턱이 닫히는 순간, 창백한 조직이 갑판을 타고 번져 선원들의 피부를 덮습니다. 억누를 것이 아무것도 없습니다. 비명이 하나씩 멎습니다.','swallowing');
  prevAction(act);
  if(state.pallidHunt161&&state.pallidHunt161.phase==='swallowing'){spend(hunt,1,'삼켜지는 순간 피부 위로 번지던 창백함을 억눌렀습니다.','');sync();}
  return;
 }
 if(act==='pallidContinueSwallow162'&&hunt.phase==='swallowing'){
  if(!spend(hunt,1,'위산의 열기 속에서 창백함이 다시 번집니다.','위장의 열기에 억제제의 막이 벗겨집니다. 남은 억제제가 없습니다. 위산 위로 창백한 조직이 피어오릅니다.','stomach'))return;
  return prevAction(act);
 }
 if(act==='pallidMermaids161'&&hunt.phase==='mermaids'){
  if(!spend(hunt,1,'창백한 인어들의 노랫소리가 살갗을 파고듭니다.','인어들의 노랫소리가 살갗을 파고듭니다. 억누를 것이 없습니다. 선원들이 하나씩 노래를 따라 부르기 시작합니다.'))return;
  return prevAction(act);
 }
 if(act==='pallidHeart161'&&hunt.phase==='heart'){
  if(!spend(hunt,2,'심장 곁의 박동이 온몸을 하얗게 물들이려 합니다. 버티는 동안','거대한 박동이 한 번 울릴 때마다 몸이 하얘집니다. 억제제가 모자랍니다. 심장 곁에서 버티지 못했습니다.'))return;
  return prevAction(act);
 }
 return prevAction(act);
};
})();
