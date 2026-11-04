/* v.1.0.0 · 한 생애에 오재앙 다섯 마리 토벌 시 '쪽빛노인의 재림' 최종 엔딩. */
(function(){
 'use strict';
 if(typeof state==='undefined'||typeof sync!=='function'||typeof markHuntedWhale143!=='function'||typeof fresh!=='function')return;
 const END_SCENE='calamityEnd100';
 const WHALE_TOTAL=5;
 // 이 유일 업적의 조건은 한 생애에서 오재앙 다섯 마리 사냥뿐입니다.
 // 예전 버전에서 덧붙었던 선장·선박 등급, 인원 등의 부가 조건만 해제합니다.
 if(typeof HIGH_REQUIREMENTS152!=='undefined')delete HIGH_REQUIREMENTS152.all5;

 const overlay=document.createElement('section');
 overlay.id='calamityEnding100';
 overlay.className='calamity-ending-v100';
 overlay.hidden=true;
 overlay.setAttribute('role','dialog');
 overlay.setAttribute('aria-modal','true');
 overlay.setAttribute('aria-label','오재앙 사냥 완수 · 쪽빛노인의 재림');
 overlay.innerHTML=
  '<div class="calamity-sea-v100" aria-hidden="true"></div>'+
  '<div class="calamity-end-inner-v100">'+
   '<div class="calamity-end-kicker-v100">대호수 · 다섯 재앙의 마지막</div>'+
   '<div class="calamity-five-lights-v100" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>'+
   '<div class="calamity-end-story-v100">'+
    '<p>오재앙이 사라졌다.</p>'+
    '<p>아니, 사라진 것은 아니다. 잠시 잠들었을 뿐.</p>'+
    '<p>언젠가 놈들은 다시 깨어나, 대호수에 재앙을 불러올 것이다.</p>'+
    '<p>하지만 적어도 지금은 아니다.</p>'+
    '<p>다섯 재앙 모두 당신의 손에 쓰러졌으니까.</p>'+
    '<p>그 광경을 지켜본 누군가가 중얼거렸다.</p>'+
    '<p class="calamity-end-quote-v100">“쪽빛노인이 돌아왔다.”</p>'+
    '<p>그렇게 대호수에는 새로운 이름 하나가 전해지기 시작했다.</p>'+
   '</div>'+
   '<div class="calamity-end-title-v100">'+
    '<span>유일 업적 달성</span>'+
    '<h2>쪽빛노인의 재림</h2>'+
    '<p class="calamity-end-captain-v100"></p>'+
    '<button type="button" class="primary" data-act="calamityNewCaptain100">새 선장으로 시작</button>'+
   '</div>'+
  '</div>';
 document.body.appendChild(overlay);
 const captainNode=overlay.querySelector('.calamity-end-captain-v100');
 let scheduled=false;
 function allHunted(){
  if(state.scene==='dead'||state.scene==='retired'||state.scene==='start'||state.scene===END_SCENE)return false;
  const killed=Array.isArray(state.whaleKilled)?state.whaleKilled:[];
  const unique=new Set(killed.filter(k=>Number.isInteger(k)&&k>=0&&k<WHALE_TOTAL));
  return unique.size===WHALE_TOTAL;
 }
 function finish(){
  if(!allHunted())return;
  // 다섯 번째 고래의 전리품과 기존 사냥 처리 코드가 전부 끝난 뒤 실행합니다.
  const former=state;
  const captain=String(former.captainName||former.playerName||'').trim()||'선장';
  const details={
   version:1,captain,
   voyages:Math.max(0,Number(former.voyage)||0),
   lakes:Math.max(0,Number(former.count?.lake)||0),
   whales:[0,1,2,3,4],
   finishedAt:Date.now()
  };
  award('all5');
  // 이전 업적 초기화 표식으로 인해 지급이 막힌 저장 데이터에도 정확한 완료 조건을 적용합니다.
  if(!former.achievements.includes('all5')){
   former.achievements.push('all5');
   log('업적 달성: 쪽빛노인의 재림');
  }
  try{
   if(window.Chronicle027){
    window.Chronicle027.add('마지막 재앙의 고래까지 쓰러뜨렸다. 한 생애에 오재앙 다섯 마리를 모두 사냥했다.',true);
    window.Chronicle027.add('누군가가 선장을 두고 쪽빛노인의 재림이라고 불렀다.',true);
    window.Chronicle027.finish('오재앙을 잠재웠다');
   }
  }catch(e){console.warn('오재앙 엔딩 일대기 저장 실패:',e);}
  former.calamityEnding100=details;
  former.scene=END_SCENE;
  former.sea=false;
  former.battle=null;
  former.encounter=null;
  former.specialPending=null;
  former.pallidVictory162=false;
  former.crossing039=null;
  former.current=null;
  tab='play';
  busy=false;
  save();render();
 }
 function scheduleFinish(){
  if(scheduled||!allHunted())return;
  const sameLife=state;
  scheduled=true;
  // resolveCoin 안쪽의 sync보다 전리품·고래별 사냥 성공 판정이 늦게 완료될 수 있습니다.
  setTimeout(function(){
   scheduled=false;
   if(state===sameLife&&allHunted())finish();
  },0);
 }
 const oldMark=markHuntedWhale143;
 markHuntedWhale143=function(){
  const result=oldMark.apply(this,arguments);
  scheduleFinish();
  return result;
 };
 const oldSync=sync;
 sync=function(){
  const result=oldSync.apply(this,arguments);
  scheduleFinish();
  return result;
 };
 const oldResolve=resolveCoin;
 resolveCoin=function(){
  const result=oldResolve.apply(this,arguments);
  scheduleFinish();
  return result;
 };
 const oldPlay=renderPlay;
 renderPlay=function(){
  if(state.scene!==END_SCENE)return oldPlay.apply(this,arguments);
  return '<section class="inset"><h2>대호수 · 오재앙 사냥 완수</h2><p>다섯 재앙의 고래를 모두 쓰러뜨렸습니다. 이 선장의 항해는 끝났습니다.</p></section>';
 };
 function showEnding(){
  const show=state.scene===END_SCENE&&!!state.calamityEnding100;
  if(overlay.hidden===show){
   overlay.hidden=!show;
   document.body.classList.toggle('calamity-ending-open-v100',show);
   if(show){
    const info=state.calamityEnding100;
    captainNode.textContent='선장 '+String(info.captain||'선장')+' · 출항 '+(info.voyages||0)+'회 · 호수 통과 '+(info.lakes||0)+'회';
    overlay.classList.remove('calamity-ending-play-v100');
    void overlay.offsetWidth;
    overlay.classList.add('calamity-ending-play-v100');
   }else overlay.classList.remove('calamity-ending-play-v100');
  }
 }
 const oldRender=render;
 render=function(){
  const result=oldRender.apply(this,arguments);
  showEnding();
  return result;
 };
 function newCaptain(){
  if(state.scene!==END_SCENE||!state.calamityEnding100)return;
  const earned=[...new Set([...permanentAchievements,...(state.achievements||[])])];
  state=fresh();
  state.achievements=earned;
  tab='play';
  save();render();
  try{window.scrollTo({top:0,behavior:'auto'});}catch(e){}
 }
 document.addEventListener('click',function(e){
  const b=e.target?.closest?.('button[data-act="calamityNewCaptain100"]');
  if(b&&!b.disabled)newCaptain();
 });
 window.GREAT_LAKE_CALAMITY_ENDING_100={ready:allHunted,finish:finish,newCaptain};
 if(allHunted())scheduleFinish();
 render();
})();
