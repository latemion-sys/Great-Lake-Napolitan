/* 모바일 호수 선택지 집중 보기: 승인 전 독립 미리보기에서만 사용합니다. */
(function mobileLakeChoicePreview(){
 'use strict';
 const shell=document.querySelector('.shell');
 const pageHeader=shell&&shell.querySelector(':scope > header');
 const side=document.querySelector('.layout > aside.side');
 const tabs=document.querySelector('.layout > main > .tabs');
 if(!pageHeader||!side||!tabs||typeof render!=='function')return;
 function foldChildren(host,title,className){
  const fold=document.createElement('details');
  fold.className='mobile-fold-preview '+className;fold.open=true;
  const summary=document.createElement('summary');summary.textContent=title;
  const inner=document.createElement('div');inner.className='mobile-fold-inner';
  while(host.firstChild)inner.appendChild(host.firstChild);
  fold.append(summary,inner);host.appendChild(fold);
  return fold;
 }
 const headerFold=foldChildren(pageHeader,'대호수 · 게임 정보','mobile-header-fold-preview');
 const sideFold=foldChildren(side,'항해 현황 · 선원 · 최근 사건','mobile-side-fold-preview');
 const tabFold=document.createElement('details');tabFold.open=true;
 tabFold.className='mobile-fold-preview mobile-tab-fold-preview';
 const tabSummary=document.createElement('summary');tabSummary.textContent='메뉴 · 선원 · 업적 · 도움말';
 const tabInner=document.createElement('div');tabInner.className='mobile-fold-inner';
 tabs.parentNode.insertBefore(tabFold,tabs);tabInner.appendChild(tabs);tabFold.append(tabSummary,tabInner);
 const folds=[headerFold,tabFold,sideFold];
 let lastCompact=null;
 function applyState(){
  const compact=window.matchMedia('(max-width:780px)').matches&&state.scene==='event'&&tab==='play';
  document.body.classList.toggle('mobile-choice-preview',compact);
  if(lastCompact!==compact){
   for(const fold of folds)fold.open=!compact;
   lastCompact=compact;
  }
 }
 const previousRender=render;
 render=function(){
  const result=previousRender.apply(this,arguments);
  applyState();
  return result;
 };
 window.addEventListener('resize',applyState,{passive:true});
 applyState();
})();
