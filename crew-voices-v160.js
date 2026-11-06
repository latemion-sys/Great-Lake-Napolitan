/* 대호수 v.1.6.0 · 선원 모집 직후 성격별 대사, 이득·결점 공개.
   성격 10종 × 기본 대사 4종, 이득·결점 8종 각각 두 가지 추가 대사. */
(function(){
 'use strict';
 if(typeof state==='undefined'||typeof recruit!=='function'||!window.GREAT_LAKE_151)return;
 const baseLines=[
  [
   '무슨 것이 물 위로 올라오든, 제 발로 도망치는 일은 없을 겁니다.',
   '저쪽에서 먼저 덤벼들면 막아 내면 됩니다. 배 위에서는 제가 앞에 서겠습니다.',
   '고래가 나타난다 해도 겁먹고 키를 놓지는 않겠습니다.',
   '겁은 있습니다. 그래도 그걸 이유로 등을 보일 생각은 없습니다.'
  ],
  [
   '서두르지 않고 살펴보겠습니다. 급하게 움직이면 놓치는 게 생깁니다.',
   '출항 전에 줄과 돛을 한 번 더 확인하고 싶습니다. 괜찮겠습니까?',
   '멀리 돌아갈 수 있다면 그편을 택하겠습니다. 살아서 닿는 게 중요하니까요.',
   '먼저 살피고 움직이겠습니다. 괜한 위험을 만들고 싶지 않습니다.'
  ],
  [
   '누가 쓰러지면 혼자 두지는 않겠습니다. 제가 할 수 있는 일은 하겠습니다.',
   '선원들이 다치지 않았으면 좋겠군요. 서로 돌보면 돌아갈 수 있을 겁니다.',
   '같이 배를 타는 이상 남의 일이 아닙니다. 필요한 곳에 저를 보내 주십시오.',
   '배에 낯선 사람이 많아도 금방 친해질 수 있을 겁니다. 서로 돕고 싶습니다.'
  ],
  [
   '해야 할 일을 말씀해 주십시오. 겁을 내는 건 일이 끝난 다음에 하겠습니다.',
   '상황이 나쁘다면 나쁘다고 말하겠습니다. 듣기 좋은 소리만 하지는 않겠습니다.',
   '인어가 나타나도 순서대로 처리하겠습니다. 당황한다고 달라질 건 없습니다.',
   '제 몫만 확실히 하겠습니다. 불필요한 말을 늘릴 생각은 없습니다.'
  ],
  [
   '물소리에는 조금 민감합니다. 그래도 먼저 이상한 걸 알아차릴 때가 있습니다.',
   '갑판이 흔들리면 잠을 잘 못 잡니다. 대신 작은 변화에도 눈이 뜨입니다.',
   '이상한 소리가 들리면 그냥 넘기지 못합니다. 보고해도 괜찮겠습니까?',
   '다른 사람들은 못 듣는 소리가 자꾸 들릴 때가 있습니다. 확인부터 해 보겠습니다.'
  ],
  [
   '소문으로만 듣던 고래를 실제로 본다면, 어떤 모습일지 궁금합니다.',
   '대호수에는 모르는 것이 너무 많습니다. 알고 싶은 마음은 감추기 어렵군요.',
   '처음 보는 것을 발견하면 말씀드리겠습니다. 가까이 가지 말라면 그러겠습니다.',
   '괴상한 이야기를 많이 들었습니다. 저도 제 눈으로 확인해 보고 싶습니다.'
  ],
  [
   '항구로 돌아오면 제가 먼저 한턱내겠습니다. 잘 다녀오면 되는 거죠.',
   '첫날부터 얼굴을 굳힐 필요는 없지 않겠습니까? 웃을 때는 웃어야죠.',
   '배가 흔들려도 식사 시간은 있을 겁니다. 저는 그걸 기다리겠습니다.',
   '어려운 일이 있어도 좋은 일이 하나쯤은 생길 겁니다. 그렇게 믿고 타겠습니다.'
  ],
  [
   '맡겨 주신 일은 끝까지 하겠습니다. 중간에 손을 떼지는 않을 겁니다.',
   '제 몫을 다해야 다른 사람들도 쉴 수 있겠죠. 일은 확실히 하겠습니다.',
   '선원들에게 맡은 일이 있다면 제가 먼저 챙기겠습니다.',
   '문제가 생기면 바로 보고하겠습니다. 책임을 다른 사람에게 넘기지는 않겠습니다.'
  ],
  [
   '제 일을 저 스스로 처리하는 편이 익숙합니다. 간섭은 적었으면 좋겠습니다.',
   '사람들과 일하는 건 괜찮습니다. 다만 제 판단도 존중해 주셨으면 합니다.',
   '말보다 행동으로 보여 드리겠습니다. 지켜보고 평가하셔도 됩니다.',
   '제가 맡은 구역에는 신경 쓰지 않으셔도 됩니다. 필요한 때는 부르겠습니다.'
  ],
  [
   '큰 소리가 나는 날에도 할 일을 잊지 않으려고 합니다. 천천히 지시해 주십시오.',
   '급하게 말하지 않으셔도 됩니다. 듣고 이해한 뒤 움직이겠습니다.',
   '잠깐 흔들릴 수는 있어도 금방 마음을 다잡겠습니다.',
   '호수가 시끄럽더라도 목소리를 높일 필요는 없겠지요. 잘 듣겠습니다.'
  ]
 ];
 const gainLines=[
  ['싸움에는 제법 익숙합니다. 앞에 나서야 한다면 말씀해 주십시오.','무기 다루는 법은 배웠습니다. 싸울 때는 도움이 될 겁니다.'],
  ['그물 손질은 자신 있습니다. 물고기가 걸리면 놓치지 않겠습니다.','낚시를 꽤 했습니다. 운이 따르면 어획을 더 거둘 수 있겠지요.'],
  ['흔적을 살피는 눈은 좋다는 말을 들었습니다.','흔적이 남으면 제가 먼저 찾아보겠습니다.'],
  ['키를 잡아 본 경험이 있습니다. 거친 물살에서 도움이 될 겁니다.','배가 기울 때 어디를 잡아야 할지 알고 있습니다.'],
  ['몸은 제법 튼튼합니다. 작은 충격쯤은 견딜 수 있습니다.','웬만한 충격에는 쓰러지지 않습니다.'],
  ['두려워도 머리는 잘 돌아갑니다.','놀랄 일에도 쉽게 무너지지는 않는 편입니다.'],
  ['상처가 나도 회복이 빠르다는 말을 듣습니다.','잠깐 쉬면 다시 움직일 힘은 납니다.'],
  ['다른 사람을 도울 때도 손이 빠릅니다.','위험할 때 옆 사람을 붙잡아 줄 자신은 있습니다.']
 ];
 const flawLines=[
  ['다만 실제 싸움에는 서툽니다. 배우겠습니다.','무기를 쥐면 손이 조금 굳습니다. 그 점은 알아 두십시오.'],
  ['그물질은 아직 서툽니다. 물고기를 놓쳐도 너무 나무라지는 마십시오.','낚시만큼은 잘한다고 말할 수 없겠군요.'],
  ['낯선 물길에서는 방향을 잃을 때가 있습니다.','흔적을 찾는 건 자신이 없습니다. 엉뚱한 데를 볼 수도 있습니다.'],
  ['급하게 키를 잡으면 실수할 때가 있습니다.','조타에는 아직 익숙하지 않습니다. 다른 사람의 도움이 필요할 겁니다.'],
  ['몸이 튼튼한 편은 아닙니다. 심한 파도는 조심해야겠습니다.','충격을 잘 견디지 못합니다. 그때는 무리하지 않겠습니다.'],
  ['겁이 많은 편입니다. 그래도 숨기지는 않겠습니다.','위험한 장면을 보고 나면 한동안 머릿속에서 떠나지 않습니다.'],
  ['오래 움직이면 남들보다 먼저 지칩니다.','체력이 빨리 떨어지는 날이 있습니다. 쉬어 가야 할 수도 있습니다.'],
  ['급할 때는 제 몸부터 챙기게 됩니다. 솔직하게 말씀드립니다.','남을 돌보는 일은 자신이 없습니다. 그 점은 미리 알아 두십시오.']
 ];
 const choice=n=>Math.floor(Math.random()*n);
 const safe=x=>esc(String(x??''));
 function traitData(c){
  window.GREAT_LAKE_151.ready();
  const p=c?.persona151;
  if(!p||p.temper<0||p.temper>=baseLines.length||p.gift<0||p.gift>=gainLines.length||
   p.flaw<0||p.flaw>=flawLines.length)return null;
  return p;
 }
 function produce(c){
  const p=traitData(c);
  if(!p)return null;
  return {crewId:c.id,role:c.role,name:c.name||ROLE[c.role]?.name||'새 선원',
   main:choice(4),benefit:choice(2),weakness:choice(2)};
 }
 function textFor(pending){
  if(!pending)return null;
  const c=state.crew?.find(x=>x.id===pending.crewId);
  if(!c)return null;
  const p=traitData(c);
  if(!p)return null;
  const temp=window.GREAT_LAKE_151.temper[p.temper],
        gift=window.GREAT_LAKE_151.gifts[p.gift],
        flaw=window.GREAT_LAKE_151.flaws[p.flaw];
  if(!temp||!gift||!flaw)return null;
  return {c,p,temp,gift,flaw,speech:baseLines[p.temper][pending.main%4],
   gainSpeech:gainLines[p.gift][pending.benefit%2],
   flawSpeech:flawLines[p.flaw][pending.weakness%2]};
 }
 const previousRecruit=recruit;
 recruit=function(role){
  const ref=state,ids=new Set((ref.crew||[]).map(c=>c.id));
  const result=previousRecruit.apply(this,arguments);
  if(state!==ref)return result;
  const newcomer=(ref.crew||[]).find(c=>!ids.has(c.id));
  if(newcomer){
   ref.recruitDialogue160=produce(newcomer);
   if(ref.recruitDialogue160){
    log((newcomer.name||ROLE[newcomer.role]?.name||'새 선원')+'의 소개와 성격, 이득·결점을 확인할 수 있습니다.');
    save();render();
   }
  }
  return result;
 };
 function root(){
  let el=document.getElementById('recruitInterview160');
  if(el)return el;
  el=document.createElement('div');
  el.id='recruitInterview160';
  el.className='recruit-interview160';
  el.hidden=true;
  document.body.appendChild(el);
  return el;
 }
 function drawInterview(){
  if(!document.body)return;
  const el=root();
  const info=textFor(state.recruitDialogue160);
  if(!info){el.hidden=true;el.innerHTML='';return;}
  const {c,temp,gift,flaw,speech,gainSpeech,flawSpeech}=info;
  const name=c.name||ROLE[c.role]?.name||'새 선원';
  el.innerHTML='<section class="recruit-card160" role="dialog" aria-modal="true" aria-labelledby="recruitTitle160">'+
   '<div class="recruit-overline160">신규 선원 · 모집 완료</div>'+
   '<h2 id="recruitTitle160">'+safe(name)+'</h2>'+
   '<p class="recruit-role160">'+safe(ROLE[c.role]?.name||'선원')+' · 성격: <b>'+safe(temp[0])+'</b></p>'+
   '<div class="recruit-speech160"><p>“'+safe(speech)+'</p>'+
   '<p>'+safe(gainSpeech)+'</p><p>'+safe(flawSpeech)+'”</p></div>'+
   '<div class="recruit-traits160"><div class="recruit-gift160">'+
   '<span>이득</span><b>'+safe(gift[0])+'</b><p>'+safe(gift[1])+'</p></div>'+
   '<div class="recruit-flaw160"><span>결점</span><b>'+safe(flaw[0])+'</b><p>'+safe(flaw[1])+'</p></div></div>'+
   '<p class="recruit-hint160">선원의 성격과 이득·결점은 고용 이후에도 유지되며, 선원 명부에서 다시 확인할 수 있습니다.</p>'+
   '<button type="button" data-recruit-close160 class="primary recruit-close160">확인하고 승선시킨다</button>'+
   '</section>';
  el.hidden=false;
  const b=el.querySelector('[data-recruit-close160]');
  if(b&&document.activeElement!==b)b.focus({preventScroll:true});
 }
 const previousRender=render;
 render=function(){
  const result=previousRender.apply(this,arguments);
  drawInterview();
  return result;
 };
 function dismiss(){
  if(!state.recruitDialogue160)return;
  state.recruitDialogue160=null;
  save();render();
 }
 document.addEventListener('click',e=>{
  if(e.target?.closest?.('[data-recruit-close160]'))dismiss();
 });
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&state.recruitDialogue160){e.preventDefault();dismiss();}
 });
 const previousPlay=renderPlay;
 renderPlay=function(){
  const html=previousPlay.apply(this,arguments);
  if(state.scene!=='start')return html;
  return html+'<section class="inset log-update"><h3>업데이트 내역 · v.1.6.0</h3>'+
   '<ul><li>호수 직접 선택 화면을 제거했습니다. 첫 항해는 21-01, 21-02를 차례로 건넌 다음 다른 48곳 중 무작위 2곳으로 이어집니다.</li>'+
   '<li>두 번째 출항부터는 선장 등급별 호수가 모두 자동으로 정해집니다.</li>'+
   '<li>선원을 고용하면 성격에 따른 대사와 이득·결점을 즉시 보여 줍니다.</li>'+
   '<li>성격마다 대사 4종을 준비하고, 이득과 결점에 따라 대사가 무작위로 변합니다.</li></ul></section>';
 };
 const oldHelp=renderHelp;
 renderHelp=function(){
  return oldHelp.apply(this,arguments)+
   '<div class="inset"><h3>v.1.6.0 · 신규 선원 모집</h3>'+
   '<p>선원을 고용하면 10가지 성격 중 해당 성격에 맞는 4종의 대사 가운데 하나가 나옵니다. '+
   '이득과 결점마다 각각 두 가지의 추가 대사가 있어, 같은 성격이라도 선원에 따라 말이 달라집니다. '+
   '기존 10종 성격과 8종 이득·결점의 효과 및 고용 비용은 그대로 유지합니다.</p></div>';
 };
 window.GREAT_LAKE_CREW_VOICES_160={
  version:'1.6.0',baseCount:baseLines.map(x=>x.length),
  benefitCount:gainLines.map(x=>x.length),flawCount:flawLines.map(x=>x.length),
  preview:()=>textFor(state.recruitDialogue160)
 };
 save();render();
})();