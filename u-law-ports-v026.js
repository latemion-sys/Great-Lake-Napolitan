/* U사 대호수의 법 · 정박 항구 명칭 및 전언 선택지 변경.
   호수 판정, 전투, 업적의 달성 상태와 저장 형식은 유지. */
(function(){
 'use strict';
 const sources=window.GREAT_LAKE_SCRIPT_DATA_024||window.GREAT_LAKE_SCRIPT_DATA_023;
 if(!Array.isArray(sources)||sources.length!==50)throw Error('호수 법/노랫말 50종 자료가 없습니다.');
 const byId=new Map(sources.map(d=>[d.id,d]));
 const portAnimals=[
  '청어','정어리','멸치','고등어','삼치','갈치','꽁치','전갱이','대구','명태',
  '방어','도미','농어','우럭','가자미','넙치','날치','조기','복어','장어',
  '전복','가리비','홍합','소라','굴','새우','꽃게','대게','문어','오징어',
  '주꾸미','해파리','해마','성게','불가사리','가오리','개복치','고래상어','돛새치','돌고래'
 ];
 const choose=arr=>arr[rng(arr.length)];
 const code=id=>sailorLakeNumber(id);
 let lastScene=state.scene;
 function portName(){
  if(typeof state.dockedPortName026==='string'&&portAnimals.some(x=>state.dockedPortName026===x+' 항구'))
   return state.dockedPortName026;
  const picked=choose(portAnimals);
  state.dockedPortName026=picked+' 항구';
  return state.dockedPortName026;
 }
 function syncPortName(){
  if(state.scene==='port'&&(lastScene!=='port'||!state.dockedPortName026)){
   const old=state.dockedPortName026;
   const pool=portAnimals.filter(x=>x+' 항구'!==old);
   state.dockedPortName026=choose(pool)+' 항구';
   save();
  }
  lastScene=state.scene;
 }
 const beforeRender=render;
 render=function(){
  syncPortName();
  return beforeRender();
 };
 function sourceText(id,kind,truth){
  const original=byId.get(id);
  if(!original)return '';
  const pool=truth?[original]:sources.filter(d=>d.id!==id);
  const selection=choose(pool);
  const field=kind==='lyric'?'hints':'rumors';
  const entries=selection[field]&&selection[field].length?selection[field]:selection.hints||[];
  return choose(entries);
 }
 // 선택한 정보의 정답 확률: 무료 28%, 선원 술집 60%, 작살잡이 고급 술집 90%.
 const choices={
  0:{kind:'흘려들은 소문',count:3,chance:.28},
  10:{kind:'뱃노래 노랫말',count:2,chance:.60},
  20:{kind:'구전으로 전해지는 법',count:1,chance:.90}
 };
 buyRumor=function(cost){
  if(state.scene!=='prep'||state.rumorBought||!Object.prototype.hasOwnProperty.call(choices,cost)||state.gold<cost)return;
  const spec=choices[cost];
  const candidates=shuffle([...new Set((state.offered||[]).filter(id=>byId.has(id)))]);
  if(candidates.length<spec.count)return;
  const ids=candidates.slice(0,spec.count);
  const stories=ids.map(id=>{
   const real=Math.random()<spec.chance;
   const content=sourceText(id,cost===10?'lyric':'rumor',real);
   return {lake:id,kind:spec.kind,text:content};
  });
  // 목격담은 아주 드물게만 들리며, 추가 전언을 만들지 않아 고급 술집은 항상 1개입니다.
  if(cost===20&&Math.random()<.025){
   const whales=WHALES.map((whale,i)=>({whale,i})).filter(x=>!huntedWhaleIndices143().includes(x.i));
   if(whales.length){
    const w=choose(whales);
    stories[0].text+='\n작살잡이는 '+w.whale.name+'을(를) 먼 물길에서 보았다는 소문을 덧붙였다.';
    state.whaleHint024=w.i;
   }
  }
  state.gold-=cost;
  state.rumors=stories;
  state.rumorBought=true;
  state.count.rumors++;
  log((state.dockedPortName026||'정박 항구')+'에서 '+spec.kind+' '+stories.length+'개를 들었습니다. 진위는 밝혀지지 않았습니다.');
  // 기존 구매 관련 업적 이벤트는 동일하게 발생합니다.
  dispatchAchievement142('rumor',{price:cost,grade:state.grade});
  sync();
 };
 // 기존 20/50만 안 업적은 식별자·달성 이력을 그대로 두고, 변경된 정박료에 맞춰 조건만 갱신.
 for(const [id,price,desc] of [
  ['fresh_rumor_paid20',10,'청새치 항구선 술집에 정박료 10만 안을 지불하고 노랫말을 듣는다.'],
  ['fresh_rumor_paid50',20,'향유고래 항구선 고급 술집에 정박료 20만 안을 지불하고 법을 듣는다.']
 ]){
  const ach=ACH.find(x=>x.id===id);
  if(ach){ach.desc=desc;if(ach.challenge&&ach.challenge.event==='rumor')ach.challenge.price=price;}
 }
 function lawTitle(){
  const name=esc(portName());
  return '<div class="small">U사 · '+name+' · 출항 전</div>'+
   '<h2>U사 대호수의 법</h2>'+
   '<p><b>2번째 선택지</b>는 값이 싸지만 은유뿐이라 애매하고, <b>3번째 선택지</b>는 비싸지만 호수의 규칙을 조금 더 자세하게 들려줍니다. 정박한 항구에서 뱃사람들의 전언을 어디에서 들을지 고를 수 있습니다. 비싸게 들을수록 진실된 법을 들을 가능성이 증가합니다. 법의 참과 거짓은 표시되지 않으니 직접 알아내야 합니다. 다섯 재앙 고래의 목격담은 고급 술집에서 아주 드물게 들을 수 있습니다.</p>'+
   '<p class="muted">법과 노랫말은 이번 출항 중에만 제공됩니다. 들은 이야기를 탐험 일지에 남기지 않습니다.</p>';
 }
 function selectCards(){
  const items=[
   {cost:0,title:'흘려들은 소문',desc:'누군가 흘리듯 이야기한 소문들을 듣습니다. 거짓일 가능성이 높습니다.',count:3,label:'무료로 소문 듣기 · 3개'},
   {cost:10,title:'청새치 항구선 술집',desc:'정박료를 내고 선원에게 술을 사주며 배를 타면서 들었던 노랫말을 듣습니다. 거짓일 가능성은 중간입니다.',count:2,label:'정박료 10만 안 · 노랫말 2개'},
   {cost:20,title:'향유고래 항구선 고급 술집',desc:'정박료를 내고 작살잡이 출신에게 술을 사주며 선장에게 직접 배운 법을 듣습니다. 거짓일 가능성이 낮습니다.',count:1,label:'정박료 20만 안 · 구전 법 1개'}
  ];
  return '<div class="stack">'+items.map(x=>'<div class="inset">'+
   '<div class="between"><b>'+x.title+'</b>'+tag(x.count+'개')+'</div>'+
   '<p class="muted">'+x.desc+'</p>'+
   button(x.label,'rumor',String(x.cost),x.cost===20?'primary':'',state.gold<x.cost)+
   '</div>').join('')+'</div>';
 }
 function readCards(){
  return '<div class="stack">'+(state.rumors||[]).map((r,i)=>{
   const lake=code(r.lake);
   const label=lake?' · '+esc(lake):'';
   return '<div class="rumor"><div class="small">'+esc(r.kind||'전언')+label+'</div>'+
    '<p style="white-space:pre-line">“'+esc(sailorStoryNumbered(r.lake,r.text))+'”</p></div>';
  }).join('')+'</div>';
 }
 function lawPage(){
  return '<div class="inset">'+lawTitle()+
   (state.rumorBought?readCards():selectCards())+
   '<div class="row" style="margin-top:14px">'+button('출항하기','launch','','primary')+'</div>'+
   '</div>';
 }
 const beforePlay=renderPlay;
 renderPlay=function(){
  const page=beforePlay();
  if(state.scene==='port'){
   const name=esc(portName());
   return '<div class="inset"><div class="small">현재 정박지</div><h2 style="margin:4px 0">'+name+'</h2></div>'+page;
  }
  if(state.scene==='prep'){
   const first='<div class="inset"><div class="small">U사 출항 전 · 구전</div>';
   const next='<div class="inset"><h3>이번 항해에서 접근할 호수</h3>';
   const a=page.indexOf(first),b=page.indexOf(next,a);
   if(a<0||b<0)throw Error('출항 전 정보 화면을 찾을 수 없습니다.');
   return page.slice(0,a)+lawPage()+page.slice(b);
  }
  if(state.scene==='event')return page.replaceAll('선원이 전하는 이야기','U사 대호수의 법');
  return page;
 };
 const beforeHelp=renderHelp;
 renderHelp=function(){
  const html=beforeHelp();
  const start='<p>출항 전 구전으로 세 가지 이야기를 들을 수 있으며, 최소 하나는 사실입니다.';
  const at=html.indexOf(start),end=html.indexOf('</p>',at);
  if(at<0||end<0)return html;
  const replacement='<p>U사 대호수의 법은 정박 항구에서 세 종류의 전언으로 들을 수 있습니다. 흘려들은 소문은 무료로 3개, 청새치 항구선의 노랫말은 10만 안에 2개, 향유고래 항구선의 구전 법은 20만 안에 1개를 들을 수 있습니다. 값이 비쌀수록 법이 사실일 가능성이 높으며, 참과 거짓을 구별해 주지는 않습니다. 고급 술집에서는 재앙 고래의 목격담을 아주 드물게 들을 수 있습니다. 구체적인 호수 규칙은 도움말에 공개하지 않습니다.</p>';
  return html.slice(0,at)+replacement+html.slice(end+4);
 };
 if(state.scene==='port'&&!state.dockedPortName026)portName();
 render();
 window.GREAT_LAKE_PORT_LAWS_026={
  counts:{free:3,marlin:2,spermWhale:1},
  prices:{free:0,marlin:10,spermWhale:20},
  portNames:portAnimals.length
 };
})();