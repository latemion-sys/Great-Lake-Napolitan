/* v.1.0.0 · 선원 이탈 시 마지막 한마디. 일반 14종 + 특수 선원 6종, 각 2가지 말투. */
(function(){
 'use strict';
 if(typeof state==='undefined'||typeof renderPlay!=='function'||typeof log!=='function')return;
 // 원작 대사를 전재하지 않고, 도시의 생계형 뱃사람과 세 인물의 성격을 참고한 창작 대사입니다.
 const NORMAL_100={
  death:[
   ['이럴 거면 계약금부터 집에 보낼걸 그랬어.','집에 보낼 돈부터 떼어 놨어야 했는데.'],
   ['내 몫은 됐어요. 선장, 남은 사람들부터 챙겨요.','제 몫은 포기할게요. 선장, 다른 사람들부터 살려요.'],
   ['배 위에서 죽는 건 질색이라고 했잖아...','젠장, 배 위에서는 죽기 싫다고 했는데...'],
   ['다음 항구에선 하루쯤 쉬자고 했는데.','다음에 정박하면 술 한잔하기로 했잖아.'],
   ['아직 보수도 못 받았는데. 이렇게 끝이야?','보수 한 푼 못 챙기고 가네. 참 나.'],
   ['선장, 나 대신 저 사람들 데리고 돌아가.','내 걱정은 하지 말고, 선원들 데리고 귀항해.'],
   ['이번 항해만 끝나면 발 뺄 생각이었어.','한 번만 더 벌고 그만두려 했는데...']
  ],
  mermaid:[
   ['손이 왜 이래... 선장, 가까이 오지 마!','이 팔이 내 말을 안 들어. 선장, 물러서!'],
   ['저 노래... 설마 내 입에서 나는 소리야?','누가 노래하는 거야? 아니... 나잖아.'],
   ['물속으로 들어가고 싶어. 안 되는데...','자꾸 뛰어들고 싶어져. 누가 좀 묶어 줘...'],
   ['내 얼굴 보지 마. 내가 지금 웃고 있어?','선장, 내 눈 좀 봐 줘. 아직 나 맞아?'],
   ['만지지 마세요. 저 이제... 저도 못 믿겠어요.','손잡지 마요. 뭘 하게 될지 저도 모르겠어요.'],
   ['내 이름이 뭐였지? 분명 알고 있었는데...','잠깐, 내가 누구더라? 선장, 대답해 줘...'],
   ['돌아가야 하는데. 돌아갈 곳이 어디더라?','항구... 항구가 어느 쪽이었더라...?']
  ]
 };
 const SPECIAL_100={
  '퀴케그':{
   death:[['선장, 내가 달라질 수도 있었을까? ...해 보고 싶었는데.','옛날의 나와는 다르게 살고 싶었어. 좀 더 해 보고 싶었는데.']],
   mermaid:[['이것도 껍질을 벗는 거라면... 왜 이렇게 두렵지.','이런 모습이 되는 건... 내가 바라던 변화가 아니었어.']]
  },
  '스타벅':{
   death:[['선장님, 남은 분들만은 무사히 데려가 주십시오.','다른 선원들은 꼭 살려 주십시오. 부탁드립니다, 선장님.']],
   mermaid:[['저한테는 다가오지 마십시오, 선장님. 다치게 하고 싶지 않습니다.','제발 물러나 주십시오. 제가 여러분을 해칠까 두렵습니다.']]
  },
  '핀':{
   death:[['저도... 조금은 괜찮은 선원이었죠? 선장님?','저, 이번엔 제 몫을 했죠? 그렇게 말해 주시면 안 돼요?']],
   mermaid:[['아직 시작한 지 얼마 안 됐는데... 이러면 안 되잖아요!','안 돼요... 저 아직 아무것도 못 해 봤는데, 선장님!']]
  }
 };
 const TYPES_100=['death','mermaid'];
 const TOTAL_100=TYPES_100.reduce((n,t)=>n+NORMAL_100[t].length,0)+
  Object.values(SPECIAL_100).reduce((n,p)=>n+TYPES_100.reduce((v,t)=>v+p[t].length,0),0);
 if(TOTAL_100!==20)throw Error('선원 마지막 대사 종류 검증 실패: '+TOTAL_100);
 function snapshot(){
  const crew=Array.isArray(state.crew)?state.crew:[];
  const owners=state.specialCrew100?.owners||{};
  return crew.map(c=>{
   const special=Object.keys(SPECIAL_100).find(k=>owners[k]===c.id)||null;
   const role=typeof ROLE!=='undefined'&&ROLE[c.role]?.name||'선원';
   return {id:c.id,name:String(c.name||'').trim()||role+' '+String(c.id),role,special};
  });
 }
 let observedState=state,previous=snapshot();
 function classify(hint){
  const msg=String(hint||'')+' '+String(state.ruleResult||'');
  return /인어|변이|잠식|백화|감싸/.test(msg)?'mermaid':'death';
 }
 function speak(member,kind){
  const templates=(member.special&&SPECIAL_100[member.special]?.[kind])||NORMAL_100[kind];
  const candidates=templates[Math.floor(Math.random()*templates.length)];
  let line=candidates[Math.floor(Math.random()*candidates.length)];
  const captain=String(state.captainName||state.playerName||'').trim();
  // 선장 이름이 있으면 때때로 직접 부릅니다. 문장 끝의 말투 자체는 유지합니다.
  if(captain&&captain!=='선장'&&Math.random()<.4){
   line=line.replace(/선장님|선장/g,captain+(line.includes('선장님')?' 님':''));
  }
  return line;
 }
 const priorLog=log;
 function observe(hint){
  if(state!==observedState){
   observedState=state;previous=snapshot();return;
  }
  const next=snapshot(),idSet=new Set(next.map(c=>c.id));
  const missing=previous.filter(c=>!idSet.has(c.id));
  previous=next; // 원본 log()와 sync()가 다시 호출되어도 같은 선원을 두 번 처리하지 않습니다.
  if(!missing.length)return;
  const kind=classify(hint);
  if(!Array.isArray(state.crewLastWords100))state.crewLastWords100=[];
  for(const member of missing){
   const text=speak(member,kind);
   const entry={id:member.id,name:member.name,special:member.special||'',kind,text,unread:true};
   state.crewLastWords100.unshift(entry);
   priorLog((member.special?'특수 선원 ':'선원 ')+member.name+'의 마지막 말 ('+
    (kind==='mermaid'?'인어화':'사망')+'): “'+text+'”');
  }
  state.crewLastWords100=state.crewLastWords100.slice(0,12);
 }
 log=function(message){
  const result=priorLog.apply(this,arguments);
  observe(message);
  return result;
 };
 const priorSync=sync;
 sync=function(){observe('');return priorSync.apply(this,arguments);};
 const priorRender=render;
 render=function(){observe('');return priorRender.apply(this,arguments);};
 const priorDie=die;
 die=function(){
  // 선원 상실이 같은 사건에서 먼저 처리되었다면 생애 초기화 전에 일대기에 남깁니다.
  observe('');
  return priorDie.apply(this,arguments);
 };
 function notice(){
  const latest=(state.crewLastWords100||[]).filter(e=>e.unread).slice(0,5);
  if(!latest.length)return '';
  let h='<section class="inset crew-lastwords-v100" aria-label="선원의 마지막 말">'+
   '<div class="between"><div><div class="small">대호수 · 마지막 한마디</div><h3>남겨진 말</h3></div>'+
   button('확인','crewLastWordsDismiss100')+'</div>';
  for(const e of latest){
   const who=esc(e.name),kind=e.kind==='mermaid'?'인어로 변함':'사망';
   h+='<div class="crew-lastwords-entry-v100">'+
    '<div class="crew-lastwords-name-v100">'+who+' · '+kind+(e.special?' · 특수 선원':'')+'</div>'+
    '<p>“'+esc(e.text)+'”</p></div>';
  }
  return h+'</section>';
 }
 const priorPlay=renderPlay;
 renderPlay=function(){
  const page=priorPlay.apply(this,arguments);
  if(['start','dead','retired','calamityEnd100'].includes(state.scene))return page;
  return notice()+page;
 };
 document.addEventListener('click',function(e){
  const b=e.target?.closest?.('button[data-act="crewLastWordsDismiss100"]');
  if(!b||b.disabled)return;
  for(const entry of state.crewLastWords100||[])entry.unread=false;
  sync();
 });
 window.GREAT_LAKE_CREW_WORDS_100={baseCount:TOTAL_100,normal:NORMAL_100,special:SPECIAL_100,observe};
})();
