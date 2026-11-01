/* 기존 대호수 게임의 시작 장면만 재구성. 항해·업적·저장 및 다른 탭 변경 없음. */
(function(){
 'use strict';
 const oldPlay=renderPlay;
 const oldRender=render;
 // 항해 안내를 열었다가 시작 화면으로 돌아와도 작성 중인 이름을 유지합니다.
 let nameDraft025=null;
 function landing025(){
  const name=String(nameDraft025===null?(state.captainName||''):nameDraft025);
  const safeName=esc(name).replace(/"/g,'&quot;');
  return '<section class="landing025" aria-label="대호수 시작 화면">'+
    '<header class="landing-top025">'+
      '<div class="landing-kicker025">대호수 항해 시뮬레이션 · v0.1.9.0</div>'+
      '<h1>대호수: The Great Lake</h1>'+
      '<p class="landing-subtitle025">규칙을 듣고, 선원을 지키며, 50개의 서로 다른 호수 사이로 배를 모십시오. 모든 전언이 참인 것은 아닙니다.</p>'+
    '</header>'+
    '<div class="landing-grid025">'+
      '<article class="landing-prologue025" aria-labelledby="landing-prologue-heading025">'+
        '<div class="landing-sectionlabel025">대호수 · 프롤로그</div>'+
        '<h2 id="landing-prologue-heading025">믿어야 하는 건 단 하나다.</h2>'+
        '<p>만약 네가 어떤 파도가 일지 모르는 호수 속에 갇히게 된다면, 믿어야 하는 건 단 하나다.</p>'+
        '<p>그건 너의 항해 실력도… 만 리까지 보는 길잡이 실력도… 동료들 간의 끈적이는 유대감도 아니다.</p>'+
        '<p>많은 이들이 이것을 견디지 못하고 호수 밑바닥에 스스로를 제물로 삼는 걸 택한다.</p>'+
        '<p>그저 어떠한 혼돈과 떨림에도 제 정신을 유지할 수 있는 너의 의지를 믿어야 한다.</p>'+
        '<p class="landing-last025"><strong>고작 호수가 너 따위에 잠잠해질지는 모르겠지만.</strong></p>'+
      '</article>'+
      '<aside class="landing-action025" aria-label="항해 시작">'+
        '<div class="landing-sectionlabel025">항해 준비</div>'+
        '<h2>당신의 첫 항해</h2>'+
        '<div class="inset">'+
          '<label for="captainNameInput">선장 이름 · 최대 16글자</label>'+
          '<input id="captainNameInput" maxlength="16" autocomplete="off" placeholder="이름을 입력하십시오" value="'+safeName+'">'+
          '<p class="muted" style="font-size:12px;margin:9px 0 0">이름을 비워 두면 ‘선장’으로 표시됩니다.</p>'+
        '</div>'+
        '<div class="stack">'+
          button('항구에서 준비 시작','enterPort','','primary')+
          button('항해 안내','tab','help')+
          button('업적 보기','achievementOpen161')+
        '</div>'+
        '<div class="inset landing-hint025">'+
         '<b>항해 전 유의사항</b><p style="margin:7px 0 0">호수의 법은 구전으로 전해집니다. 사망하면 항해 진행은 초기화되지만, 달성한 업적은 유지됩니다.</p>'+
        '</div>'+
      '</aside>'+
    '</div>'+
    '<p class="landing-legal025">이 게임은 Project Moon 세계관을 바탕으로 비영리적인 목적으로 만들어진 팬게임입니다. 단순한 플레이를 제외한 일체의 수익성을 내는 행위를 금지합니다.</p>'+
  '</section>';
 }
 document.addEventListener('input',e=>{
  if(state.scene==='start'&&e.target?.id==='captainNameInput')nameDraft025=e.target.value;
 });
 // 시작 화면에서 이미 입력한 이름과 게임 소개를 항구 진입 화면에 중복 표시하지 않습니다.
 renderPlay=function(){
  if(state.scene==='start')return landing025();
  const page=oldPlay();
  if(state.scene==='port'){
   return page.replace(/<div class="inset"><h3>선장 이름<\/h3>[\s\S]*?<\/div>/,'');
  }
  return page;
 };
 // 항구에서 이름을 바꾸는 기존 기능은 선원 관리 안에 보존합니다.
 const oldCrew=renderCrew;
 renderCrew=function(){
  const page=oldCrew();
  if(state.scene!=='port'||state.sea)return page;
  const name=esc(String(state.captainName||'')).replace(/"/g,'&quot;');
  return page+'<details class="captain-rename025">'+
    '<summary>선장 이름 변경</summary>'+
    '<div class="captain-rename-body025">'+
     '<label for="captainNameInput">선장 이름 · 최대 16글자</label>'+
     '<input id="captainNameInput" maxlength="16" autocomplete="off" placeholder="선장 이름" value="'+name+'">'+
     '<p class="muted">이름을 비워 두면 ‘선장’으로 표시됩니다.</p>'+
     button('선장 이름 저장','captainNameSave','','primary')+
    '</div></details>';
 };
 render=function(){
  const value=oldRender();
  const isStart=state.scene==='start';
  document.body.classList.toggle('landing025-active',isStart&&tab==='play');
  document.body.classList.toggle('voyage025-active',!isStart);
  const popup=document.getElementById('prologueOverlay156');
  if(popup&&isStart){
   popup.hidden=true;
   popup.setAttribute('aria-hidden','true');
   const focus=document.getElementById('captainNameInput');
   if(focus&&document.activeElement===document.getElementById('prologueClose156'))focus.focus({preventScroll:true});
  }
  return value;
 };
 // 시작 버튼이 화면 아래에 있던 휴대전화에서도 항구 화면은 맨 위부터 보여 줍니다.
 document.addEventListener('click',e=>{
  if(e.target?.closest?.('button[data-act="enterPort"]')&&state.scene==='port'){
   window.scrollTo({top:0,behavior:'auto'});
  }
 });
 render();
})();
