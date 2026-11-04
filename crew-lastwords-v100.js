/* v.1.0.0 · 일반 20종 + 특수 선원 24종의 사망/인어화 마지막 한마디, 각 2가지 표현. */
(function(){
 'use strict';
 if(typeof state==='undefined'||typeof renderPlay!=='function'||typeof log!=='function')return;
 // 원작 대사를 전재하지 않고, 도시의 생계형 뱃사람과 세 인물의 성격을 참고한 창작 대사입니다.
 const NORMAL_100={
  death:[
   ['피가 멎질 않네. 선장, 여기까진가 봐.','피를 너무 많이 흘렸어... 선장, 나 먼저 갈게.'],
   ['계약서에 이런 끝은 없었는데. 돈은 집으로 보내 줘.','내 보수는 가족한테 전해 줘. 그거 하나만 부탁할게.'],
   ['딱 한 번만 더 출항하고 그만두려 했거든.','이번 항해만 무사히 마치면 뒷골목을 떠날 생각이었어.'],
   ['선장, 다른 애들부터 태워. 난 못 움직이겠어.','이쪽은 됐으니 배부터 돌려. 아직 살릴 사람 있잖아.'],
   ['고래기름 몇 통에 목숨값까지 치를 줄은 몰랐지.','기름값은 올랐다는데, 내 목숨값도 좀 올랐으려나.'],
   ['이 상처는... 꿰맬 수 있는 게 아니네.','손으로 막아도 소용이 없어. 안쪽까지 다 찢어졌어.'],
   ['정박하면 따뜻한 밥이나 먹고 싶었는데.','항구에 돌아가면 뜨거운 국부터 먹겠다 했지, 참.'],
   ['선장, 내 장비는 가져가. 아직 쓸 만해.','허리에 찬 도구는 다른 선원한테 줘. 버리긴 아깝잖아.'],
   ['다른 날개 밑에선 이만큼도 못 벌었겠지. 후회는 안 해.','도시에 남았어도 별수 없었겠지. 선장, 난 됐어.'],
   ['내 이름은 기억해 줘. 인어가 된 건 아니라고.','내가 어떻게 죽었는지만은 똑바로 전해 줘.']
  ],
  mermaid:[
   ['가슴 안에서... 내 심장 말고 다른 게 뛰어. 고래의 박동이야.','이 박자, 내 심장이 아니야... 고래 속에서 들리던 그거야.'],
   ['기름이 살 밑에서 움직여. 손가락이... 붙고 있어!','내 손 좀 봐! 살이 서로 달라붙어... 이건 내 손이 아니야!'],
   ['선장, 내 이름을 불러 줘. 까먹기 전에, 얼른!','내 이름... 분명 알고 있었는데. 선장, 다시 말해 줘!'],
   ['내가 입을 닫았는데도 노래가 나와. 왜 안 멈추지?','입이 제멋대로 움직여... 저 소리, 내가 내는 거야?'],
   ['머릿속에서 고래가 가라고 해. 싫은데... 다리가 움직여.','난 배에 남고 싶은데 몸이 물 쪽으로 가. 붙잡아 줘!'],
   ['내 팔이 당신을 향해 뻗어. 피하라고! 내 뜻이 아니야!','다가오지 마! 난 멈추려고 하는데 손이 안 멈춰!'],
   ['집이 어디였더라... 문 앞에 누가 있었는데, 얼굴이 없어.','돌아갈 집이 있었어. 누가 기다렸는데... 이름이 지워져.'],
   ['고래가 부르는 게 들려. 귀로 듣는 소리가 아니야.','저 밑에서 부르고 있어... 아니, 내 안에서 부르는 거야.'],
   ['발이... 갈라지는 게 아니라 서로 붙어. 이걸로 어떻게 걸어?','신발을 벗겨 줘... 아니, 발이 어디 갔지?'],
   ['선장, 지금 나를 묶어. 곧 당신을 못 알아볼 것 같아.','나한테 명령해 줘. 아직 들을 수 있을 때... 제발.']
  ]
 };
 const SPECIAL_100={
  '퀴케그':{
   death:[
    ['옛날의 나와는 다르게 살고 싶었어. 거의 다 왔는데.','이번엔 좀 다른 사람이 될 수 있을 줄 알았지. 아쉽네.'],
    ['선장, 이 배에선 내가 누군지 굳이 묻지 않았어. 고마웠다.','내 과거를 캐묻지 않은 건 당신뿐이었어. 그건 고마워.'],
    ['다들 살아서 나가. 나 하나 때문에 뒤돌아오지 마.','뒤는 내가 막을게. 다른 사람들부터 데리고 가.'],
    ['한 번쯤은 해 질 무렵의 호수를 밖에서 보고 싶었는데.','마지막으로 노을을 보고 싶었어. 그게 그렇게 어려운 일이었나.']
   ],
   mermaid:[
    ['이 몸이 고래를 따라 움직여... 난 그런 삶으로 돌아가기 싫어.','또 누군가의 뜻대로 움직이는 건... 이제 싫은데.'],
    ['선장, 노을이 무슨 색이었지? 그걸 기억해야 내가 나일 텐데.','해 질 때 호수 색을 떠올리려는데... 아무것도 안 보여.'],
    ['내 손이 먼저 작살을 들었어. 난 당신을 겨누고 싶지 않아.','작살 내려놓으라고 해 줘... 손이 내 말을 안 들어.'],
    ['내가 달라지려고 했던 이유도 잊겠지. 그 전에 물러나.','조금만 있으면 누구였는지도 모르게 돼. 멀리 가.']
   ]
  },
  '스타벅':{
   death:[
    ['선장님, 갑판 아래 부상자부터 살피십시오. 저는 늦었습니다.','제게 쓸 약은 아껴 두십시오. 아직 치료할 선원이 있습니다.'],
    ['다음 항로를 정하기 전에 인원을 다시 세어 주십시오.','남은 분들을 확인한 뒤 항로를 돌리십시오. 부탁드립니다.'],
    ['저와 함께 내린 선원들에게... 괜찮은 항해였다고 전해 주십시오.','선원들에게는 제 걱정을 하지 말라고 해 주십시오, 선장님.'],
    ['마지막까지 배를 지킬 수 있어 다행입니다. 부디 무사히 돌아가십시오.','제 임무는 여기까지군요. 선장님은 반드시 귀항하셔야 합니다.']
   ],
   mermaid:[
    ['선장님... 명령을 알아듣고는 있습니다. 하지만 손이 따르지 않습니다.','명령은 들립니다... 몸이, 다른 쪽으로 움직이고 있습니다.'],
    ['저를 갑판 아래에 두지 마십시오. 다른 선원들을 해칠 겁니다.','저를 격리해 주십시오... 아직 스스로 멈출 수 있을 때.'],
    ['고래의 박동에 제 숨이 맞춰지고 있습니다... 서둘러 떠나십시오.','제 가슴이 저것과 같은 박자로 뛰고 있습니다. 떠나셔야 합니다.'],
    ['선장님, 제 목소리를 믿지 마십시오. 곧 제가 하는 말이 아닐 겁니다.','이 다음에 제가 무얼 부탁하더라도... 듣지 마십시오. 제가 아닐 겁니다.']
   ]
  },
  '핀':{
   death:[
    ['선장님, 저 이번엔 잘했죠? 칭찬 한 번만 해 주세요.','제가 그래도 도움이 됐죠? 그 말만 들으면 될 것 같아요.'],
    ['누나한테 보낸 돈은 도착했겠죠? 그럼 됐어요.','제 몫은 누나한테 전해 주세요. 기다리고 있을 거예요.'],
    ['이제 장비 좋은 걸 살 수 있었는데... 조금만 더 벌걸.','돈 모아서 제대로 된 장비를 사려 했어요. 너무 늦었네요.'],
    ['저, 다음엔 더 나은 해결사가 될 줄 알았는데...','분명 열심히 하면 더 올라갈 수 있다고 생각했거든요.']
   ],
   mermaid:[
    ['선장님, 손가락이 붙었어요! 이러면 무기는 어떻게 잡아요?','제 손... 이상해요. 칼을 놓으려는데 손이 안 펴져요!'],
    ['누나 이름을 잊으면 안 되는데... 왜 생각이 안 나죠?','누나 얼굴이 떠올라야 하는데... 누가 기다렸더라...?'],
    ['저 아직 사람이죠? 선장님, 그렇다고 해 주세요!','저를 보세요... 아직 제가 핀인 거 맞죠?'],
    ['안 돼요, 제가 동료를 물려고 했어요! 저 좀 막아 주세요!','몸이 멋대로 다가가요. 선장님, 저를 붙잡지 말고 피하세요!']
   ]
  }
 };
 const TYPES_100=['death','mermaid'];
 const TOTAL_100=TYPES_100.reduce((n,t)=>n+NORMAL_100[t].length,0)+
  Object.values(SPECIAL_100).reduce((n,p)=>n+TYPES_100.reduce((v,t)=>v+p[t].length,0),0);
 if(NORMAL_100.death.length!==10||NORMAL_100.mermaid.length!==10||
  Object.values(SPECIAL_100).some(x=>x.death.length!==4||x.mermaid.length!==4)||
  TOTAL_100!==44)throw Error('선원 마지막 대사 종류 검증 실패: '+TOTAL_100);
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
  const direct=String(hint||'');
  if(/인어|변이|잠식|백화|고래에게 동화|감싸/.test(direct))return 'mermaid';
  if(/사망|전사|숨졌|숨이 끊|목숨을 잃|죽었|죽어 버|치명상/.test(direct))return 'death';
  const event=String(state.ruleResult||'');
  if(/인어|변이|잠식|백화/.test(event))return 'mermaid';
  // 현재 직접 선원 명부에서 제거되는 게임 사건은 대부분 고래에 의한 인어화입니다.
  // 사망으로 확정된 묘사가 없다면 사망했다고 단정하지 않습니다.
  return 'mermaid';
 }
 function speak(member,kind){
  const templates=(member.special&&SPECIAL_100[member.special]?.[kind])||NORMAL_100[kind];
  const candidates=templates[Math.floor(Math.random()*templates.length)];
  let line=candidates[Math.floor(Math.random()*candidates.length)];
  const captain=String(state.captainName||state.playerName||'').trim();
  // 선장 이름이 있으면 때때로 직접 부릅니다. 문장 끝의 말투 자체는 유지합니다.
  if(captain&&captain!=='선장'&&Math.random()<.4){
   line=line.replace(/선장님|선장/g,word=>/선장/.test(captain)?captain:captain+(word==='선장님'?' 선장님':' 선장'));
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
  const latest=(state.crewLastWords100||[]).filter(e=>e.unread).slice(0,10);
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
