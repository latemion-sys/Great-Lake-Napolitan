/* v.1.0.0 · 선장의 공통 목표: 800만 안 상환 및 선택형 항해 엔딩. */
(function(){
 'use strict';
 if(typeof state==='undefined'||typeof render!=='function'||typeof fresh!=='function'||typeof unitMoney!=='function')return;
 const DEBT_TOTAL=800;
 function initial(){return {version:1,remaining:DEBT_TOTAL,endingPending:false,endingSeen:false};}
 function debt(){
  const d=state.debt800;
  if(!d||d.version!==1||!Number.isFinite(Number(d.remaining))){
   state.debt800=initial();
  }else{
   d.remaining=Math.min(DEBT_TOTAL,Math.max(0,Math.round(Number(d.remaining)*2)/2));
   d.endingPending=!!d.endingPending;
   d.endingSeen=!!d.endingSeen;
  }
  return state.debt800;
 }
 debt();
 const previousFresh=fresh;
 fresh=function(){
  const next=previousFresh.apply(this,arguments);
  next.debt800=initial();
  return next;
 };
 const overlay=document.createElement('section');
 overlay.className='debt-ending-v100';
 overlay.id='debtEnding100';
 overlay.hidden=true;
 overlay.setAttribute('role','dialog');
 overlay.setAttribute('aria-modal','true');
 overlay.setAttribute('aria-label','대호수 · 채무 상환 엔딩');
 overlay.innerHTML=
  '<div class="debt-ending-sea-v100" aria-hidden="true"></div>'+
  '<div class="debt-ending-content-v100">'+
   '<p class="debt-ending-kicker-v100">대호수 · 끝나지 않은 항해</p>'+
   '<div class="debt-ending-rule-v100" aria-hidden="true"></div>'+
   '<div class="debt-ending-lines-v100">'+
    '<p>빚을 모두 갚았다. 800만 안, 도시의 날개에서 1달은 먹고살 수 있을 정도의 돈.</p>'+
    '<p>아무것도 없던 내가 이곳까지 떠밀려 온 이유는 사라졌다.</p>'+
    '<p>이제는 둥지로, 뒷골목으로, 살던 곳으로 돌아가도 된다.</p>'+
    '<p class="debt-ending-last-v100">하지만 여전히 호수를 항해하고 싶다면, 그건 오롯이 당신의 선택입니다.</p>'+
   '</div>'+
   '<div class="debt-ending-footer-v100">'+
    '<span>대호수: The Great Lake</span>'+
    '<button type="button" class="primary" data-act="debtContinue100">항해를 계속한다</button>'+
   '</div>'+
  '</div>';
 document.body.appendChild(overlay);
 function openEnding(){
  if(state.scene!=='port'||state.sea)return;
  const d=debt();
  if(d.remaining!==0)return;
  d.endingPending=true;
  save();render();
 }
 function closeEnding(){
  const d=debt();d.endingPending=false;d.endingSeen=true;
  save();render();
 }
 function repay(amount){
  if(state.scene!=='port'||state.sea||busy||debt().endingPending)return;
  const d=debt(),available=Math.max(0,Number(state.gold)||0);
  const n=Number(amount);
  if(!Number.isFinite(n)||n<=0||Math.round(n*2)!==n*2){
   alert('상환액은 5천 안 단위의 양수로 입력해 주세요.');return;
  }
  if(n>d.remaining||n>available){
   alert('상환액이 남은 빚이나 소지 자금을 초과했습니다.');return;
  }
  state.gold=Math.round((available-n)*2)/2;
  d.remaining=Math.round((d.remaining-n)*2)/2;
  if(state.prog)state.prog.goldPeak=Math.max(state.prog.goldPeak||0,state.gold);
  log('빚 '+unitMoney(n)+' 상환. 남은 빚: '+unitMoney(d.remaining)+'.');
  if(d.remaining===0){
   d.endingPending=true;
   log('800만 안을 모두 갚았습니다. 이제 계속 항해할지는 선장의 선택입니다.');
  }
  sync();
 }
 function paymentPanel(){
  const d=debt(),owed=d.remaining,paid=DEBT_TOTAL-owed;
  const available=Math.max(0,Number(state.gold)||0);
  if(owed===0){
   return '<div class="inset debt-panel-v100 debt-panel-cleared-v100">'+
    '<div class="small">기본 목표 · 달성</div><h2>800만 안의 빚을 모두 갚았습니다.</h2>'+
    '<p class="muted">선장의 개인 목표는 그대로 남아 있습니다. 이후의 항해는 자유롭게 결정할 수 있습니다.</p>'+
    button('상환 엔딩 다시 보기','debtReplay100','','primary')+'</div>';
  }
  const pct=Math.max(0,Math.min(100,paid/DEBT_TOTAL*100)).toFixed(2);
  const amountBtn=n=>button(unitMoney(n)+' 상환','debtPay100',String(n),'',available<n||owed<n);
  return '<div class="inset debt-panel-v100">'+
   '<div class="small">선장의 기본 목표</div><h2>800만 안의 빚을 갚는다.</h2>'+
   '<p class="muted">빚을 지고 대호수에 왔습니다. 그중 손에 남아 있던 70만 안으로 첫 항해를 준비했습니다. 상환은 항구에서만 할 수 있으며 이자는 붙지 않습니다.</p>'+
   '<div class="between"><b>남은 빚 '+unitMoney(owed)+'</b><span class="muted">상환 '+unitMoney(paid)+' / 800만 안</span></div>'+
   '<div class="meter debt-progress-v100" role="progressbar" aria-label="빚 상환 진행도" aria-valuemin="0" aria-valuemax="800" aria-valuenow="'+paid+'"><span style="width:'+pct+'%"></span></div>'+
   '<div class="debt-pay-options-v100">'+amountBtn(10)+amountBtn(50)+amountBtn(100)+
   button('남은 빚 전부 상환','debtPay100',String(owed),'primary',available<owed)+'</div>'+
   '<div class="debt-pay-custom-v100"><label for="debtPayAmount100">직접 상환할 금액 (만 안)</label>'+
   '<input type="number" min="0.5" step="0.5" inputmode="decimal" id="debtPayAmount100" placeholder="예: 25.5">'+
   button('입력한 금액 상환','debtPayCustom100','','',available<.5)+'</div></div>';
 }
 const priorPlay=renderPlay;
 renderPlay=function(){
  const page=priorPlay.apply(this,arguments);
  if(state.scene!=='port'||state.sea)return page;
  return paymentPanel()+page;
 };
 const priorRender=render;
 render=function(){
  const result=priorRender.apply(this,arguments);
  const d=debt(),show=d.remaining===0&&d.endingPending&&state.scene==='port'&&!state.sea;
  if(overlay.hidden===show){
   overlay.hidden=!show;
   document.body.classList.toggle('debt-ending-open-v100',show);
   if(show){
    // 재감상할 때도 첫 줄부터 애니메이션을 보여 줍니다.
    overlay.classList.remove('debt-ending-playing-v100');
    void overlay.offsetWidth;
    overlay.classList.add('debt-ending-playing-v100');
    const btn=overlay.querySelector('[data-act="debtContinue100"]');
    if(btn&&typeof btn.focus==='function')btn.focus({preventScroll:true});
   }else overlay.classList.remove('debt-ending-playing-v100');
  }
  return result;
 };
 document.addEventListener('click',function(e){
  const b=e.target?.closest?.('button[data-act]');
  if(!b||b.disabled)return;
  const action=b.dataset.act;
  if(action==='debtContinue100'){closeEnding();return;}
  if(action==='debtReplay100'){openEnding();return;}
  if(action==='debtPay100'){repay(Number(b.dataset.value));return;}
  if(action==='debtPayCustom100'){
   const field=document.getElementById('debtPayAmount100');
   if(field)repay(field.value);
  }
 });
 window.GREAT_LAKE_DEBT_100={total:DEBT_TOTAL,remaining:()=>debt().remaining,repay,openEnding,closeEnding};
 save();render();
})();