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
 // 거짓은 다른 호수의 진짜 법이 아니라, 해당 호수의 금기를 잘못 알려 주는 전용 전언에서 고릅니다.
 const falseLore=window.GREAT_LAKE_FALSE_LORE_027;
 if(!falseLore||sources.some(d=>!Array.isArray(falseLore[d.id])||falseLore[d.id].length!==3))
  throw Error('호수별 가짜 전언 50종이 없습니다.');
 // 두 술집의 참·거짓 문구는 실제 선원의 노래와 작살잡이의 입말로 별도 작성합니다.
 // 호수 규칙의 원문 및 소문과 실제 통과 판정은 그대로 유지합니다.
 const tavernSpeech=window.GREAT_LAKE_TAVERN_SPEECH_029;
 if(!tavernSpeech||sources.some(d=>{
  const entry=tavernSpeech[d.id];
  return !entry||['lyricTrue','lyricFalse','lawTrue','lawFalse'].some(k=>typeof entry[k]!=='string'||!entry[k].trim());
 }))throw Error('청새치·향유고래 항구선의 참거짓 구전 50종이 없습니다.');
 function sourceText(id,kind,truth){
  const original=byId.get(id);
  if(!original)return '';
  if(kind==='lyric'||kind==='law'){
   const key=kind+(truth?'True':'False');
   return tavernSpeech[id][key];
  }
  if(!truth)return falseLore[id][0];
  return choose(original.rumors?.length?original.rumors:(original.hints||[]));
 }
 // v.1.1.1 · 같은 생애에 들은 호수의 정보는 다시 알려주지 않습니다.
 const choices={
  0:{kind:'흘려들은 소문',count:3,chance:.28},
  10:{kind:'뱃노래 노랫말',count:2,chance:.60},
  30:{kind:'구전으로 전해지는 법',count:2,chance:1}
 };
 function candidatesFor(cost){
  const known=new Set(Array.isArray(state.loreSeen111)?state.loreSeen111:[]);
  const assigned=[...new Set(state.offered||[])].filter(id=>byId.has(id)&&!known.has(id));
  if(cost!==0)return assigned;
  return assigned.concat(sources.map(d=>d.id).filter(id=>!known.has(id)&&!assigned.includes(id)));
 }
 buyRumor=function(cost){
  if(state.scene!=='prep'||state.rumorBought||!Object.prototype.hasOwnProperty.call(choices,cost)||state.gold<cost)return;
  const spec=choices[cost],pool=candidatesFor(cost);
  if(pool.length<spec.count)return;
  const included=new Set(state.offered||[]);
  const ids=shuffle(pool.filter(id=>included.has(id)))
   .concat(shuffle(pool.filter(id=>!included.has(id)))).slice(0,spec.count);
  const truth=ids.map(()=>cost===30||Math.random()<spec.chance);
  if(cost===0){
   if(truth.every(Boolean))truth[rng(truth.length)]=false;
   if(!truth.some(Boolean))truth[rng(truth.length)]=true;
  }else if(cost===10&&truth.every(Boolean))truth[rng(truth.length)]=false;
  const stories=ids.map((id,i)=>{
   const type=cost===0?'rumor':cost===10?'lyric':'law';
   return {lake:id,kind:spec.kind,text:cost===30?byId.get(id).law:sourceText(id,type,truth[i]),
    ...(cost===30?{confirmed:true}:{})};
  });
  if(cost===30&&Math.random()<.025){
   const whales=WHALES.map((whale,i)=>({whale,i})).filter(x=>!huntedWhaleIndices143().includes(x.i));
   if(whales.length){
    const w=choose(whales);
    stories[0].text+='\n그리고 말이야, 먼 물길에서 ‘'+w.whale.name+'’을 직접 봤어. 그건 웬만한 뱃사람이면 평생 잊지 못할 광경이지.';
    state.whaleHint024=w.i;
   }
  }
  state.gold-=cost;
  if(!Array.isArray(state.loreSeen111))state.loreSeen111=[];
  if(!state.loreArchive111||typeof state.loreArchive111!=='object')state.loreArchive111={};
  for(const entry of stories){
   if(!state.loreSeen111.includes(entry.lake))state.loreSeen111.push(entry.lake);
   state.loreArchive111[entry.lake]={id:entry.lake,kind:entry.kind,
    text:cost===30?byId.get(entry.lake).law:entry.text,confirmed:cost===30};
  }
  state.rumors=stories;
  state.rumorBought=true;
  state.count.rumors++;
  log((state.dockedPortName026||'정박 항구')+'에서 '+spec.kind+' '+stories.length+'개를 들었습니다.'+
   (cost===30?' 모두 진실된 법입니다.':' 진위는 알려지지 않았습니다.'));
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
 if(['port','prep'].includes(state.scene)&&!state.dockedPortName026){portName();save();}
 render();
 window.GREAT_LAKE_PORT_LAWS_026={
  counts:{free:3,marlin:2,spermWhale:1},
  prices:{free:0,marlin:10,spermWhale:20},
  portNames:portAnimals.length
 };
})();