/* V.0.1.6.1 · 프롤로그 기반 업적 팝업 */
(function(){
'use strict';
const overlay=document.getElementById('achievementsOverlay161');
const opener=document.getElementById('tab-ach');
if(!overlay||!opener)return;
const pane=document.getElementById('achievementsList161');
const progress=document.getElementById('achievementsProgress161');
const total=document.getElementById('achievementsTotal161');
const tabs=document.getElementById('achievementsTiers161');
const search=document.getElementById('achievementsSearch161');

const states=document.getElementById('achievementsFilters161');
const tiers=['all','common','rare','hero','legend','myth','miracle','unique'];
const label={all:'전체',common:'일반',rare:'희귀',hero:'영웅',legend:'전설',myth:'신화',miracle:'기적',unique:'유일'};
const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected='common',mode='all',phrase='',visible=false,focusBefore=null;
const owned=id=>state.achievements.includes(id);
function card(a){
 const yes=owned(a.id);
 const hidden=!yes&&['hero','legend','myth'].includes(a.tier);
 const shown=yes||['common','rare'].includes(a.tier);
 return '<article class="ach-modal-item-161 '+(yes?'earned':'locked')+(hidden?' secret':'')+'" data-tier="'+escapeText(a.tier)+'">'+
  '<div class="ach-topline-161"><span>'+label[a.tier]+'</span><span class="ach-tag-161">'+(yes?'✓ 달성':'미달성')+'</span></div>'+
  '<h3>'+escapeText(hidden?'???':a.name)+'</h3>'+
  (shown&&a.desc?'<p>'+escapeText(a.desc)+'</p>':hidden?'<p>달성 후 공개됩니다.</p>':'')+'</article>';
}
function draw(keepScroll){
 if(!visible)return;
 const top=keepScroll?pane.scrollTop:0;
 const finished=ACH.filter(a=>owned(a.id)).length;
 total.textContent=finished+' / '+ACH.length+' 달성';
 progress.style.setProperty('--progress',(ACH.length?100*finished/ACH.length:0).toFixed(2)+'%');
 tabs.innerHTML=tiers.map(k=>{
  const arr=k==='all'?ACH:ACH.filter(a=>a.tier===k);
  return '<button type="button" data-ach-tier="'+k+'" aria-pressed="'+(selected===k)+'">'+label[k]+
   '<small>'+arr.filter(a=>owned(a.id)).length+' / '+arr.length+'</small></button>';
 }).join('');
 states.innerHTML=[['all','전체'],['earned','달성'],['locked','미달성']].map(pair=>{
  return '<button type="button" data-ach-mode="'+pair[0]+'" aria-pressed="'+(mode===pair[0])+'">'+pair[1]+'</button>';
 }).join('');
 const needle=phrase.trim().toLocaleLowerCase('ko-KR');
 const filtered=ACH.filter(a=>{
  if(selected!=='all'&&selected!==a.tier)return false;
  const yes=owned(a.id);
  if(mode==='earned'&&!yes)return false;
  if(mode==='locked'&&yes)return false;
  if(!needle)return true;
  if(!yes&&['hero','legend','myth'].includes(a.tier))return false;
  return (a.name+' '+(a.desc||'')).toLocaleLowerCase('ko-KR').includes(needle);
 });
 filtered.sort((a,b)=>tiers.indexOf(a.tier)-tiers.indexOf(b.tier)||
  Number(owned(b.id))-Number(owned(a.id))||a.name.localeCompare(b.name,'ko'));
 const message=label[selected]+' 업적 · '+filtered.length+'개'+(needle?' 검색 결과':'');
 pane.innerHTML='<div class="ach-list-summary-161">'+escapeText(message)+'</div>'+
  (filtered.length?'<div class="ach-modal-grid-161">'+filtered.map(card).join('')+'</div>':
  '<div class="ach-modal-none-161">이 조건에 해당하는 업적이 없습니다.</div>');
 pane.scrollTop=top;
}
function open(){
 if(visible)return;
 visible=true;focusBefore=document.activeElement;
 overlay.hidden=false;overlay.setAttribute('aria-hidden','false');
 document.body.classList.add('ach-modal-open-161');
 draw(false);
 document.getElementById('achievementsClose161').focus({preventScroll:true});
}
function close(){
 if(!visible)return;
 visible=false;overlay.hidden=true;overlay.setAttribute('aria-hidden','true');
 document.body.classList.remove('ach-modal-open-161');
 const target=focusBefore&&typeof focusBefore.focus==='function'?focusBefore:opener;
 target.focus({preventScroll:true});
}
opener.addEventListener('click',open);
overlay.addEventListener('click',event=>{
 if(event.target===overlay||event.target.closest('[data-ach-close]')){close();return;}
 const tier=event.target.closest('[data-ach-tier]');
 if(tier&&tiers.includes(tier.dataset.achTier)){selected=tier.dataset.achTier;draw(false);return;}
 const item=event.target.closest('[data-ach-mode]');
 if(item&&['all','earned','locked'].includes(item.dataset.achMode)){mode=item.dataset.achMode;draw(false);}
});
search.addEventListener('input',()=>{phrase=search.value;draw(true);});
document.addEventListener('keydown',event=>{
 if(!visible)return;
 if(event.key==='Escape'){event.preventDefault();close();return;}
 if(event.key==='Tab'){
  const controls=[...overlay.querySelectorAll('button:not(:disabled),input:not(:disabled)')].filter(x=>x.getClientRects().length);
  if(!controls.length)return;
  if(event.shiftKey&&document.activeElement===controls[0]){event.preventDefault();controls.at(-1).focus();}
  if(!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();controls[0].focus();}
 }
});
const prior=render;
render=function(){const out=prior();if(visible)draw(true);return out;};
window.GREAT_LAKE_ACH_MODAL_161={open,close,select:k=>{selected=k;open();draw(false)},get visible(){return visible;}};
})();
