/* 신(心) · 망(望) · E.G.O 개화 서사 / 2026-11-02
   기존 전투와 호수 판정은 유지하고, 선장의 기록과 각성 사건만 확장합니다. */
(function(){
'use strict';
if(typeof state==='undefined'||typeof ACH==='undefined'||typeof renderPlay!=='function')return;
const ID='heart_no_crew_lost_030';
const title='끝내 비지 않은 갑판';
if(!ACH.some(a=>a.id===ID))ACH.push({id:ID,tier:'myth',name:title,desc:'한 선장의 생애에서 선원을 한 명도 잃지 않은 채 4등급에 도달한다.'});
const esc030=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const tidy=s=>String(s==null?'':s).normalize('NFKC').replace(/\s+/g,'').toLowerCase();
const crewList=()=>Array.isArray(state.crew)?state.crew:[];
const roleName=c=>(typeof ROLE!=='undefined'&&ROLE[c.role]?ROLE[c.role].name:'선원');
const roster=()=>crewList().map(c=>({id:c.id,role:c.role,name:String(c.name||''),custom:!!c.name&&tidy(c.name)!==tidy(roleName(c)+' '+c.id)}));
function memory(){
 if(!state.heartMemory030||!Array.isArray(state.heartMemory030.lost)){
  // 기존 저장에는 상실한 선원의 전 생애 기록이 없으므로 과거 무손실을 추정하지 않습니다.
  const past=(state.voyage||0)>0||(state.count?.lake||0)>0||(state.grade||1)>1;
  state.heartMemory030={lost:[],roster:roster(),historyIncomplete:!!past,stage:'',attention:'',count:'',lines:'',purpose:'',grade:'',attempted:false};
 }
 const m=state.heartMemory030;
 if(!Array.isArray(m.roster))m.roster=roster();
 if(!Array.isArray(m.lost))m.lost=[];
 return m;
}
function sourceOf(msg){
 const s=String(msg||'');
 if(/검은 고래|까만 고래|날개|감싸/.test(s))return 'wing';
 if(/노란 고래|가라앉|열수공/.test(s))return 'whale';
 if(/고래/.test(s))return 'whale';
 if(/피를 바친|금기|법을 어|법 위반|호수의 법/.test(s))return 'law';
 return 'condition';
}
let recording=false;
function checkRoster(msg){
 if(recording)return;
 recording=true;
 try{
  const m=memory(),live=roster(),ids=new Set(live.map(c=>String(c.id)));
  for(const old of m.roster){
   if(ids.has(String(old.id))||m.lost.some(x=>x.id===old.id))continue;
   m.lost.push({id:old.id,role:old.role,name:old.name,custom:old.custom,kind:'인어화',cause:sourceOf(msg),lake:Number.isInteger(state.current)?state.current:null});
  }
  m.roster=live;
  if(state.grade>=4&&!m.historyIncomplete&&!m.lost.length&&Array.isArray(state.achievements)&&!state.achievements.includes(ID)){
   award(ID);
  }
 }finally{recording=false;}
}
// 이름을 변경해도 기존 항해의 생존 기록에는 최종 이름이 남습니다.
const oldLog030=log;
log=function(message){checkRoster(message);return oldLog030.apply(this,arguments);};
const oldSync030=sync;
sync=function(){checkRoster();return oldSync030.apply(this,arguments);};
const oldSave030=save;
save=function(){checkRoster();return oldSave030.apply(this,arguments);};
const oldDie030=die;
die=function(){checkRoster();return oldDie030.apply(this,arguments);};
memory();checkRoster();

function memoryRating(m){
 if(!m.lost.length)return '보통'; // 선원을 잃은 일이 없으면 무조건 보통 보정
 if(m.attention!=='remember')return '불리';
 const count=Number(m.count),countCorrect=String(m.count).trim()!==''&&Number.isInteger(count)&&count===m.lost.length;
 const lines=String(m.lines||'').split(/\n/).map(x=>x.trim()).filter(Boolean);
 const remembered=countCorrect||lines.some(line=>/인어|죽|사라|희생|잃|고래|법|상태|악화|선원/.test(line)||m.lost.some(c=>c.custom&&tidy(line).includes(tidy(c.name))));
 if(!remembered)return '불리';
 if(!countCorrect||lines.length!==m.lost.length)return '보통';
 const unused=[...m.lost];
 for(const line of lines){
  const pieces=line.split(/\s*[|/／]\s*/);
  const name=tidy(pieces[0]),detail=pieces.slice(1).join(' ');
  let ix=unused.findIndex(c=>c.custom&&tidy(c.name)===name);
  if(ix<0)ix=unused.findIndex(c=>!c.custom);
  if(ix<0)return '보통';
  const c=unused.splice(ix,1)[0];
  const end=/(인어|변이|변했|변화|희생|죽)/.test(detail);
  const cause=c.cause==='condition'?/(상태|악화|컨디션|인어)/.test(detail):
   c.cause==='wing'?/(날개|감싸|검은|까만|고래)/.test(detail):
   c.cause==='whale'?/(고래|노란|황토|가라앉)/.test(detail):
   /(법|금기|호수|피를 바친)/.test(detail);
  if(!end||!cause)return '보통';
 }
 return unused.length===0?'유리':'보통';
}
function heartPanel(m){
 const head='<div class="inset heart-memory-030"><div class="small">선장의 마음</div>';
 if(m.stage==='intro')return head+
  '<h2>남겨진 것들</h2><p>바람이 멎자 오래전 갑판을 밟던 발소리가 들려옵니다. 이곳에 함께 있었던 사람들을 당신은 아직 기억하고 있습니까?</p>'+
  '<div class="stack">'+button('그들의 마지막을 떠올린다','heartRemember030','','primary')+
  button('떠올리고 싶지 않다','heartIgnore030')+'</div></div>';
 if(m.stage==='recall')return head+
  '<h2>기억의 끝에서</h2><p>기억을 바탕으로 무엇을 이루고자 합니까? 자신의 말로 적어 보십시오.</p>'+
  (m.attention==='remember'?
   '<p class="small muted">떠나간 사람들의 수와 마지막을 가능한 만큼 되짚어 보십시오. 직접 이름을 지어 준 사람은 그 이름도 함께 적을 수 있습니다.</p>'+
   '<label for="heartCount030">떠나간 선원은 몇 명이었습니까?</label><input id="heartCount030" type="number" min="0" max="999" value="'+esc030(m.count)+'" placeholder="기억하는 숫자">'+
   '<label for="heartLines030">이름(없다면 선원) / 마지막을 맞은 경위 · 한 명당 한 줄</label><textarea id="heartLines030" rows="4" placeholder="선원 / 인어로 변이한 경위">'+esc030(m.lines)+'</textarea>':'<p class="small muted">떠나간 이들의 모습이 기억에서 희미해졌습니다.</p>')+
  '<label for="heartPurpose030">그럼에도 이제 무엇을 이루고자 합니까?</label><textarea id="heartPurpose030" rows="3" placeholder="자신의 목적을 적어 보십시오.">'+esc030(m.purpose)+'</textarea>'+
  '<div class="stack">'+button('마음의 대답을 정한다','heartReview030','','primary')+'</div></div>';
 if(m.stage==='review')return head+
  '<h2>발현의 문턱</h2><p>당신의 마음이 가리키는 방향이 정해졌습니다.</p>'+
  '<p>현재 보정: <b>'+esc030(m.grade)+'</b></p>'+
  '<p class="heart-warning-030">이 판정은 단 한 번만 시도할 수 있습니다. 실패하면 이 선장의 생애에서 다시 시도할 수 없습니다.</p>'+
  '<div class="stack">'+button('단 한 번의 발현을 시도한다','heartRoll030','','danger')+
  button('아직 마음을 정리하지 못했다','heartBack030')+'</div></div>';
 if(m.stage==='naming')return head+
  '<h2>신(心)이 깨어나다</h2><p>한 가지 바람이 가슴 깊은 곳에서 온전히 형태를 갖춥니다. 그 바람에 이름을 주십시오.</p>'+
  '<label for="heartName030">신(心)의 이름 (망으로 끝납니다)</label><input type="text" id="heartName030" maxlength="24" placeholder="예: 귀환">'+
  '<p class="small muted">발현 직후 1망을 사용할 수 있습니다. 실제로 망을 두를 때 기존 정신력 비용이 듭니다.</p>'+
  '<div class="stack">'+button('이름을 새긴다','heartNameSave030','','primary')+'</div></div>';
 if(m.stage==='failed')return head+
  '<h2>아직 닿지 못한 바람</h2><p>마음은 잠시 움직였으나, 끝내 형태를 이루지 못했습니다. 이 생애에서 신의 발현은 다시 시도할 수 없습니다.</p>'+
  '<div class="stack">'+button('항해로 돌아간다','heartClose030','','primary')+'</div></div>';
 return head+'</div>';
}
function isCalamity(){
 const b=state.battle||{};
 return (state.scene==='battle'&&(b.type==='whale'||['pallidShell161','pallidLure161','pallidMermaid161','pallidCore161','blueMermaid'].includes(b.type)))||
 ['pallidHunt161','blueHunt'].includes(state.scene)||state.blueWhaleFinalStage||state.redWhaleFinal023||state.blackWhaleFinal;
}
function voicePanel(j){
 const step=j.voice030||'intro';
 const lead='<div class="heart-voice-cover-030"><section class="heart-voice-030" role="dialog" aria-modal="true" aria-label="마음속 목소리"><div class="heart-voice-light-030" aria-hidden="true"></div><div class="heart-voice-words-030">';
 const first='<p>“참 많이 힘들었지.”</p><p>“이제는 네 마음 가는 대로 해도 괜찮아.”</p><p>“아무것도 네 뜻을 막을 수 없게 해 줄게.”</p>';
 if(j.stage==='twist')return lead+'<p>“그러면, 이제 아무것도 참지 않아도 되겠네.”</p></div><div class="heart-voice-actions-030">'+button('목소리를 따라간다','mindTwistEnd','','danger')+'</div></section></div>';
 if(step==='accept2')return lead+'<p>“다른 누군가의 탓으로 돌려도 괜찮잖아.”</p><p>“네가 지키려던 모든 것을, 어떻게든 되찾으면 되잖아.”</p></div>'+
  '<div class="heart-voice-actions-030">'+button('바꿀 수 없는 것은 인정한다. 그래도 내가 할 일을 선택한다','egoAcceptDuty030','','primary')+
  button('더는 책임질 것이 없다','egoYield030')+'</div></section></div>';
 return lead+first+'</div><div class="heart-voice-actions-030">'+
  button('나의 자아로 이 목소리를 깨부순다','egoForce030','','primary')+
  button('세상이 모두 내 뜻대로 되지 않는다는 것을 인정한다','egoAccept030')+
  button('목소리의 제안을 받아들인다','egoYield030')+'</div></section></div>';
}
const oldRenderPlay030=renderPlay;
renderPlay=function(){
 checkRoster();
 const page=oldRenderPlay030.apply(this,arguments),m=memory();
 if(state.scene!=='dead'&&state.mindJudge&&!state.egoBloomed&&!isCalamity()){
  const j=state.mindJudge;
  if(j.stage==='pending'&&page.includes('mindJudgeFlip'))return voicePanel(j);
  if(j.stage==='twist'&&j.voice030)return voicePanel(j);
 }
 if(state.scene==='dead')return page;
 if(m.stage)return heartPanel(m);
 if(state.grade>=4&&state.shinOpen&&!state.shinName030&&state.scene==='port'){
  return page+'<div class="inset heart-invitation-030"><p>이미 깨어난 마음에도 아직 이름이 없습니다.</p>'+button('신(心)의 이름을 정한다','heartNameLegacy030','','primary')+'</div>';
 }
 if(state.grade>=4&&!state.shinOpen&&!m.attempted&&(state.scene==='port'||state.scene==='event'&&!state.sea)){
  return page+'<div class="inset heart-invitation-030"><p>감정과 마음을 통해 무언가 다른 힘이 마음속에서 움직입니다…</p>'+
   button('그 감정에 귀를 기울인다','heartListen030','','primary')+'</div>';
 }
 return page;
};
document.addEventListener('input',e=>{
 const m=memory(),t=e.target;if(!t)return;
 const map={heartCount030:'count',heartLines030:'lines',heartPurpose030:'purpose'};
 if(map[t.id]&&m.stage==='recall')m[map[t.id]]=t.value;
});
function awakenSuccess(j){j.stage='bloom';j.voice030='answered';log('목소리의 유혹을 거부하고 자신의 자아를 마주했습니다. E.G.O가 개화합니다.');sync();}
function awakenFailure(j){j.stage='twist';j.voice030='yielded';log('자신의 마음을 지키지 못했습니다. 따스한 목소리가 선장의 생각을 덮었습니다.');sync();}
document.addEventListener('click',e=>{
 const b=e.target?.closest?.('button[data-act]');if(!b||b.disabled||busy)return;
 const act=b.dataset.act,m=memory();
 if(act.startsWith('heart')){
  if(state.scene==='dead'||state.grade<4)return;
  if(act==='heartNameLegacy030'&&state.shinOpen&&!state.shinName030){m.stage='naming';m.attempted=true;sync();return;}
  if(state.shinOpen&&act!=='heartNameSave030')return;
  if(act==='heartListen030'&&!m.stage&&!m.attempted){m.stage='intro';tab='play';sync();return;}
  if(act==='heartRemember030'&&m.stage==='intro'){m.attention='remember';m.stage='recall';sync();return;}
  if(act==='heartIgnore030'&&m.stage==='intro'){m.attention='ignore';m.stage='recall';sync();return;}
  if(act==='heartReview030'&&m.stage==='recall'){
   const val=String(m.purpose||'').trim();if(val.length<3){alert('무엇을 이루고 싶은지 자신의 말로 적어 주십시오.');return;}
   m.purpose=val.slice(0,240);m.grade=memoryRating(m);m.stage='review';sync();return;
  }
  if(act==='heartBack030'&&m.stage==='review'&&!m.attempted){m.stage='recall';sync();return;}
  if(act==='heartRoll030'&&m.stage==='review'&&!m.attempted){
   m.attempted=true;const chance=m.grade==='유리'?.95:m.grade==='보통'?.5:.1;
   m.stage=Math.random()<chance?'naming':'failed';log('신(心) 발현 판정을 단 한 번 시도했습니다. '+(m.stage==='naming'?'성공':'실패')+'.');sync();return;
  }
  if(act==='heartNameSave030'&&m.stage==='naming'&&m.attempted){
   const input=document.getElementById('heartName030');
   let name=String(input?.value||'').replace(/\s+/g,' ').trim().slice(0,20);
   name=name.replace(/\s*망(?:\s*\(望\))?\s*$/,'').trim();
   if(!name){alert('신의 이름을 입력해 주십시오.');return;}
   state.shinName030=name+'망(望)';state.shinOpen=true;state.shinLevel=Math.max(1,state.shinLevel|0);m.stage='';
   log(state.shinName030+' · 신(心)을 발현했습니다. 첫 번째 망이 열렸습니다.');sync();return;
  }
  if(act==='heartClose030'&&m.stage==='failed'){m.stage='';sync();return;}
  return;
 }
 const j=state.mindJudge;
 if(!j||state.egoBloomed||j.stage!=='pending'||isCalamity())return;
 if(act==='egoYield030'){awakenFailure(j);return;}
 if(act==='egoAccept030'&&!j.voice030){j.voice030='accept2';sync();return;}
 if(act==='egoAcceptDuty030'&&j.voice030==='accept2'){awakenSuccess(j);return;}
 if(act==='egoForce030'&&!j.voice030){
  const strong=state.grade>=5&&((state.whaleKilled||[]).length>=1||(state.count?.lake||0)>=15||(state.prog?.battleWins||0)>=10);
  if(Math.random()<(strong?.95:.10))awakenSuccess(j);else awakenFailure(j);
 }
});
window.GREAT_LAKE_HEART_030={memory:()=>memory(),rating:()=>memoryRating(memory()),check:checkRoster};
})();