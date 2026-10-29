/* 대호수 V0.1.7.0 · 첨부 수정본 3 전체 25개 호수와 공통 판정 구현 */
(function(){
 'use strict';
 const source=window.GREAT_LAKE_SCRIPT_DATA_017;
 if(!Array.isArray(source)||source.length!==25)throw Error('25개 호수 데이터가 없습니다.');
 const byId=new Map(source.map(x=>[x.id,x]));
 if(new Set(source.map(x=>x.id)).size!==25)throw Error('호수 번호가 중복됐습니다.');
 const falseSongs=[
  '보이는 것이 멎을 때까지 기다리면 이 호수는 누구라도 보내 준다고 한다.',
  '배에 닿은 것은 모두 버리고 곧장 나아가야 한다는 이야기가 있다.',
  '물빛이 갈라지기 전에는 물속의 소리를 따라가야 한다고 들었다.'
 ];
 for(const def of source){
  const lake=LAKE_BY_ID157.get(def.id);
  if(!lake||!def.nodes)throw Error('등록되지 않은 호수: '+def.id);
  SCRIPTED_LAKE_MAP_015.set(def.id,def);
  lake.name=def.name;lake.hex=def.hex;lake.mermaid=true;lake.storyNo='21-'+String(def.id).padStart(2,'0');
  const rules=RULES[lake.rule],hints=def.hints.slice();
  rules.truth=()=>hints[rng(hints.length)];
  rules.false=()=>falseSongs[rng(falseSongs.length)];
 }
 const pick=a=>a[rng(a.length)];
 const permutation=a=>shuffle([...a]);
 const mixColors={
  '붉은|푸른':'보랏빛','푸른|붉은':'보랏빛',
  '푸른|노란':'초록빛','노란|푸른':'초록빛',
  '붉은|노란':'주황빛','노란|붉은':'주황빛'
 };
 function reroll017(st){
  const vars=st.vars||(st.vars={});
  if(st.id===6||st.id===17){
   const ending=['갈라진','깨진','둥글게 닳은','멀쩡한'];
   vars['끝']=pick(ending);
   vars['다른 끝']=pick(ending.filter(s=>s!==vars['끝']));
   vars['천']=pick(['검은','붉은','흰','푸른']);
   if(st.id===17)vars['다른 물건']=pick(['그물','밧줄','닻']);
  }
  if(st.id===23){
   const p=permutation(['큰','가운데','작은']);
   ['첫째','둘째','셋째'].forEach((name,i)=>vars[name]=p[i]);
  }
 }
 function mixForScene017(st){
  const c=permutation(['붉은','푸른','노란']).slice(0,2);
  st.vars['빛1']=c[0];st.vars['빛2']=c[1];st.vars['섞인 빛']=mixColors[c.join('|')];
 }
 function interpolate017(s,vars){return String(s).replace(/\{([^}]+)\}/g,(_,key)=>vars[key]??'{'+key+'}');}
 function enterScene017(st,step,repeat=false){
  const def=byId.get(st.id),node=def.nodes[step];
  if(!node)throw Error('장면 없음 '+st.id+' '+step);
  st.step=step;
  if(st.id===22&&step==='scene0')mixForScene017(st);
  if(st.id===6&&step==='scene1')
   st.vars['손잡이 천']=Math.random()<.5?st.vars['천']:pick(['검은','붉은','흰','푸른'].filter(x=>x!==st.vars['천']));
  let msg=node.text;
  if((st.id===6||st.id===17)&&msg.includes('끝이 {끝} 노와 끝이 {다른 끝} 노')&&Math.random()<.5)
    msg=msg.replace('끝이 {끝} 노와 끝이 {다른 끝} 노','끝이 {다른 끝} 노와 끝이 {끝} 노');
  if(st.id===22&&step==='scene0'){
   const labels=permutation(['{빛1}','{빛2}','{섞인 빛}']);
   msg=msg.replace('{빛1} 갈래, {빛2} 갈래, {섞인 빛} 갈래',labels.map(x=>x+' 갈래').join(', '));
  }
  if(st.id===23&&step==='scene1'&&Math.random()<.5)
   msg=msg.replace('{첫째} 종과 {둘째} 종이 떠 있다','{둘째} 종과 {첫째} 종이 떠 있다');
  st.sceneText=interpolate017(msg,st.vars);
  st.order=permutation(node.choices.map((_,i)=>i));
 }
 function minActions017(def,stage){
  const scores=Object.fromEntries(Object.keys(def.nodes).map(k=>[k,100]));
  for(let n=0;n<25;n++)for(const [key,node] of Object.entries(def.nodes)){
   const costs=node.choices.map(opt=>opt.pass?1:opt.death?100:
    opt.to?1+scores[opt.to]:opt.toAny?1+Math.min(...opt.toAny.map(k=>scores[k])):100);
   scores[key]=Math.min(scores[key],...costs);
  }
  if(def.id===19&&['scene0','scene1','scene2'].includes(stage))return Math.max(4,scores[stage]);
  if(def.id===13&&['scene0','scene1'].includes(stage))return Math.max(4,scores[stage]);
  if(def.id===14&&stage==='scene0')return Math.max(3,scores[stage]);
  if(def.id===14&&stage==='scene1')return Math.max(4,scores[stage]);
  if(def.id===23&&stage==='scene0')return Math.max(4,scores[stage]);
  return scores[stage];
 }
 const priorFactory017=makeStory014;
 makeStory014=function(lake){
  const def=byId.get(lake.id);
  if(!def)return priorFactory017(lake);
  const turnLimit=3+rng(4);
  const options=Object.keys(def.nodes).filter(step=>minActions017(def,step)<=turnLimit);
  if(!options.length)throw Error('진입 가능한 장면 없음 '+lake.id+' 제한 '+turnLimit);
  const st={id:lake.id,scripted:true,scriptVersion017:1,step:'',turns:0,turnLimit,vars:{},
   counters:{looks:0,turns:0,nets:0,ties:0,boats:0},specialNetUsed:false,sceneText:'',order:[],result:''};
  reroll017(st);
  if(lake.id===22)mixForScene017(st);
  enterScene017(st,pick(options));
  return st;
 };
 function nextOf017(options,from){
  const uniq=[...new Set(options)].filter(key=>typeof key==='string');
  const alternate=uniq.filter(x=>x!==from);
  return pick(alternate.length?alternate:uniq);
 }
 const originalChoice017=storyChoice014;
 storyChoice014=function(chosen){
  const id=state.current,def=byId.get(id),st=state.lakeStory;
  if(!def||state.scene!=='event'||!st?.scriptVersion017)return originalChoice017(chosen);
  const node=def.nodes[st.step],actual=st.order[chosen],opt=node?.choices[actual];
  if(!opt)return;
  if(opt.death)return mermaidDeath015(id);
  // 통과 직전 인어가 나오면 전투가 끝나고 같은 선택을 다시 할 수 있어야 하므로 턴을 미리 소비하지 않는다.
  if(opt.pass&&state.normalMermaidDraw&&!state.mermaidResolved){
   state.mermaidResolved=true;
   beginBattle({type:'normal',name:'대호수의 인어',power:35+LAKE_BY_ID157.get(id).risk*18,need:1,won:0,history:[],after:'navigation'});
   return;
  }
  st.turns++;
  if(st.turns>st.turnLimit)return mermaidDeath015(id);
  if(!state.nav)state.nav={stage:'law',turns:0,transition:false};
  state.nav.turns=st.turns;
  if(opt.pass){
   if(opt.epilogue)log(opt.epilogue);
   state.nav.transition=true;state.ruleResolved=true;
   completeLake(true,'호수의 경계를 건넜습니다.');
   return;
  }
  let next=opt.to||nextOf017(opt.toAny||[],st.step);
  const count=st.counters;
  if(opt.special==='lookTwice'){
   count.looks++;
   next=count.looks===1?'scene0':'scene4';
  }else if(opt.special==='turnTwice'){
   count.turns++;
   next=count.turns>=2?'scene2':nextOf017((opt.toAny||[opt.to||'scene0']).filter(k=>k!=='scene2'),st.step);
  }else if(opt.special==='netTwice'){
   count.nets++;
   next=count.nets>=2?'scene2':(st.specialNetUsed?'scene0':pick(['scene0','scene1']));
   if(next==='scene1')st.specialNetUsed=true;
  }else if(opt.special==='tieThree'){
   count.ties++;
   next=count.ties>=3?'scene3':nextOf017(['scene0','scene1','scene2'],st.step);
  }else if(opt.special==='waitPlate'){
   next=nextOf017(['scene0','scene1','scene2'],st.step);
  }else if(opt.special==='twoBoats'){
   count.boats++;
   next=count.boats>=2?'scene3':nextOf017(['scene0','scene1','scene2'],st.step);
  }
  if(opt.reset==='turn')count.turns=0;
  if(opt.reset==='net')count.nets=0;
  if(opt.reset==='boats')count.boats=0;
  if(opt.reroll&&id===23)reroll017(st);
  if(id===14&&next==='scene1'&&st.specialNetUsed&&st.step!=='scene0')next='scene0';
  if(!def.nodes[next])return mermaidDeath015(id);
  const from=st.step;
  enterScene017(st,next);
  dispatchAchievement142('choice',{lake:id,stage:from,choice:actual});
  if(state.normalMermaidDraw&&!state.mermaidResolved){
   state.mermaidResolved=true;
   beginBattle({type:'normal',name:'대호수의 인어',power:35+LAKE_BY_ID157.get(id).risk*18,need:1,won:0,history:[],after:'navigation'});
  }else sync();
 };
 const oldView017=renderScriptedLake015;
 renderScriptedLake015=function(){
  const lake=activeLake(),def=lake&&byId.get(lake.id),st=state.lakeStory;
  if(!def||!st?.scriptVersion017)return oldView017();
  if(!def.nodes[st.step])state.lakeStory=makeStory014(lake);
  const current=state.lakeStory,stage=def.nodes[current.step];
  const actions=current.order.map(i=>stage.choices[i]);
  const title=lake.id===8?'':'21-'+String(lake.id).padStart(2,'0')+(def.name?' · '+def.name:'');
  return '<div class="inset" style="border-top:4px solid '+def.hex+'">'+
   '<div class="between">'+(title?'<h2>'+esc(title)+'</h2>':'')+tag('창작 구역')+'</div>'+
   '<p class="muted">'+esc(interpolate017(def.description,current.vars))+'</p>'+
   '<div class="inset"><div class="barline"><span>호수 체류</span><span>'+current.turns+' / '+current.turnLimit+'턴</span></div>'+
   '<div class="meter"><span style="width:'+Math.min(100,100*current.turns/current.turnLimit)+'%"></span></div></div>'+
   '<h3>발생 사건</h3><p>'+esc(current.sceneText)+'</p><div class="stack">'+
   actions.map((a,i)=>button('▸ '+interpolate017(a.text,current.vars),'storyChoice',String(i),'')).join('')+
   '</div></div>';
 };
 // 첨부 수정본의 각 호수로 이어지도록 진행 중인 구버전 장면을 갱신합니다.
 if(state.scene==='event'&&byId.has(state.current)&&!state.lakeStory?.scriptVersion017)
  state.lakeStory=makeStory014(LAKE_BY_ID157.get(state.current));
 // 21-20~21-24 업적만 추가: 21-01~19/40의 횟수는 기존 저장기를 그대로 사용.
 const added=[20,21,22,23,24],passKey='great-lake-napolitan-new-lake-passes-v017';
 let extraPasses={};try{extraPasses=JSON.parse(localStorage.getItem(passKey))||{};}catch(e){}
 for(const id of added){
  const d=byId.get(id),prefix='21-'+String(id).padStart(2,'0')+' · '+d.name;
  let base=ACH.find(a=>a.id==='lake_'+id);
  if(!base){base={id:'lake_'+id};ACH.push(base);}
  Object.assign(base,{tier:'common',name:prefix+' 통과',desc:'21-'+id+' 호수를 1회 통과한다.',check:{kind:'uniqueLake',n:id}});
  for(const [suffix,tier,n,name] of [['hero','hero',10,'되찾은 항로'],['legend','legend',100,'백 번의 귀환']]){
   const awardId='lake_'+suffix+'_'+id;
   if(!ACH.some(a=>a.id===awardId))ACH.push({id:awardId,tier,name:prefix+' · '+name,
     desc:'21-'+id+' 호수를 누적 '+n+'회 통과한다.',lakeMedal016:true,lakeId016:id,required016:n});
  }
  extraPasses[id]=Math.max(Number(extraPasses[id])||0,state.achievements.includes('lake_'+id)||permanentAchievements.includes('lake_'+id)?1:0);
  if(extraPasses[id]>=10)award('lake_hero_'+id);
  if(extraPasses[id]>=100)award('lake_legend_'+id);
 }
 const priorComplete017=completeLake;
 completeLake=function(success,msg){
  const id=state.current,old=state.count?.lake||0;
  const result=priorComplete017(success,msg);
  if(success&&added.includes(id)&&(state.count?.lake||0)>old){
   extraPasses[id]=(extraPasses[id]||0)+1;
   award('lake_'+id);
   if(extraPasses[id]>=10)award('lake_hero_'+id);
   if(extraPasses[id]>=100)award('lake_legend_'+id);
   try{localStorage.setItem(passKey,JSON.stringify(extraPasses));}catch(e){}
   save();render();
  }
  return result;
 };
 // 기존 호수 업적, 기적, 유일, 이전에 있던 고유 업적은 건드리지 않습니다.
 // 직전 업데이트에서 새로 만든 업적 중 같은 누적 수치/같은 완주 조건을 반복하는 11개만 정리합니다.
 const overlapping017=new Set([
  'progress_161_fifteen_returns','progress_161_twohundred_coins',
  'progress_161_fifty_mermaids','progress_161_feat_full_grade4',
  'progress_161_feat_full_grade5','progress_161_fifty_returns',
  'progress_161_hundredfifty_mermaids','progress_161_twelve_streak',
  'progress_161_feat_zero_damage4','progress_161_feat_high_mental_full',
  'progress_161_feat_five_no_crew_loss'
 ]);
 for(let i=ACH.length-1;i>=0;i--)if(overlapping017.has(ACH[i].id))ACH.splice(i,1);
 state.achievements=(state.achievements||[]).filter(id=>!overlapping017.has(id));
 permanentAchievements=permanentAchievements.filter(id=>!overlapping017.has(id));
 const prevHelp017=renderHelp;
 renderHelp=function(){
  return prevHelp017().replace('항해 안내 · v0.1.6.1','항해 안내 · v0.1.7.0').replace(/현재 항해 가능 호수는 총 20개입니다\.[^<]*/,
   '현재 호수는 총 25개입니다. 21-01부터 21-24까지와 21-40이 등장합니다. 등급별로 출항마다 4 / 8 / 12 / 16 / 20개 호수가 배치됩니다.')
   .replace('20개 호수 중 하나','25개 호수 중 하나');
 };
 const oldPlay017=renderPlay;
 renderPlay=function(){
  const h=oldPlay017();
  if(state.scene==='port')return h.replaceAll('20개의 서로 다른 호수','25개의 서로 다른 호수');
  if(state.scene==='start')return h+
   '<div class="log-update"><h3>V.0.1.7.0 · 대호수 수정본 3</h3><ul>'+
   '<li>21-01부터 21-24, 21-40까지 총 25개 호수의 장면과 판정을 원문에 맞춰 갱신했습니다.</li>'+
   '<li>장면과 선택지 무작위 배치, 3~6턴 체류, 인어 조우 20%와 호수별 랜덤 값을 적용했습니다.</li>'+
   '<li>호수별 일반·영웅·전설 업적 75개를 유지하고 중복 업적 11개를 정리했습니다.</li></ul></div>';
  return h;
 };
 save();render();
 window.GREAT_LAKE_PATCH_017={lakes:source.length,ids:[...byId.keys()],counts:()=>({...extraPasses}),
  minimum:(id,stage)=>minActions017(byId.get(id),stage)};
})();
