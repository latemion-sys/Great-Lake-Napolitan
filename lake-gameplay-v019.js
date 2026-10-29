/* Great Lake v0.1.9.0: 31-lake revision 5. */
(function(){
 'use strict';
 const lakes=window.GREAT_LAKE_SCRIPT_DATA_019;
 if(!Array.isArray(lakes)||lakes.length!==31)throw Error('Source must contain 31 lakes');
 const index=new Map(lakes.map(d=>[d.id,d]));
 const FALSERUMORS=[
  '정면에서 보이는 징조가 어떤 모습이든 기다리면 무사히 벗어난다고 들었습니다.',
  '물 위의 물건을 모두 가져가야 지나갈 수 있다는 이야기가 있습니다.',
  '어느 호수에서나 먼저 노를 젓는 것이 안전하다고 전해집니다.'
 ];
 const choose=arr=>arr[rng(arr.length)];
 const shuffled=arr=>shuffle([...arr]);
 const mix={
  '붉은|푸른':'보랏빛','푸른|붉은':'보랏빛',
  '푸른|노란':'초록빛','노란|푸른':'초록빛',
  '붉은|노란':'주황빛','노란|붉은':'주황빛'
 };
 for(const d of lakes){
  const lake=LAKE_BY_ID157.get(d.id);
  if(!lake)throw Error('Unregistered lake '+d.id);
  SCRIPTED_LAKE_MAP_015.set(d.id,d);
  lake.name=d.name;lake.hex=d.hex;lake.mermaid=true;
  lake.storyNo='21-'+String(d.id).padStart(2,'0');
  const rule=RULES[lake.rule],hints=d.hints.slice();
  rule.truth=()=>choose(hints);
  rule.false=()=>choose(FALSERUMORS);
 }
 const name=()=>String(state.captainName||state.playerName||'').trim()||'선장';
 const nameParticle=()=>{const v=name(),code=v.charCodeAt(v.length-1);return code>=0xAC00&&code<=0xD7A3&&(code-0xAC00)%28!==0?'은':'는';};
 const write=(str,vars)=>String(str).replace(/\[플레이어\](?:는|은)/g,()=>name()+nameParticle())
  .replace(/\{([^}]+)\}/g,(_,key)=>vars[key]??'{'+key+'}')
  .replace(/\[플레이어\]/g,name());
 function seedVars(st){
  const v=st.vars||(st.vars={});
  if(st.id===6||st.id===17){
   const ends=['갈라진','깨진','둥글게 닳은','멀쩡한'];
   v['끝']=choose(ends);v['다른 끝']=choose(ends.filter(x=>x!==v['끝']));
   v['천']=choose(['검은','붉은','흰','푸른']);
   if(st.id===17)v['다른 물건']=choose(['그물','밧줄','닻']);
  }
  if(st.id===23){
   const sorted=shuffled(['큰','가운데','작은']);
   ['첫째','둘째','셋째'].forEach((x,i)=>v[x]=sorted[i]);
  }
  if(st.id===26)v['내 자리']=choose(['뱃머리','가운데','고물']);
  if(st.id===27){
   v['도는 쪽']=choose(['왼쪽','오른쪽']);
   v['반대쪽']=v['도는 쪽']==='왼쪽'?'오른쪽':'왼쪽';
  }
  if(st.id===29)v['얼음 타격 수']=choose([2,3]);
  if(st.id===30){
   v['틈 쪽']=choose(['왼쪽','오른쪽']);
   v['반대쪽']=v['틈 쪽']==='왼쪽'?'오른쪽':'왼쪽';
  }
 }
 function sceneVars(st,step){
  const v=st.vars;
  if(st.id===6&&step==='scene1')
   v['손잡이 천']=Math.random()<.5?v['천']:choose(['검은','붉은','흰','푸른'].filter(x=>x!==v['천']));
  if(st.id===22&&step==='scene0'){
   const c=shuffled(['붉은','푸른','노란']);
   v['빛1']=c[0];v['빛2']=c[1];v['섞인 빛']=mix[c[0]+'|'+c[1]];
  }
  if(st.id===25&&step==='scene0'){
   const n=1+rng(3),names=['한','두','세','네','다섯'];
   v['N']=names[n];v['N-1']=names[n-1];v['N+1']=names[n+1];
   v['똑 × N']=Array.from({length:n+1},()=> '똑').join(', ');
  }
  if(st.id===26){
   if(step==='scene1')v['선원 자리']=choose(['뱃머리','가운데','고물'].filter(x=>x!==v['내 자리']));
   if(step==='scene2')v['없는 자리']=choose(['돛대 꼭대기','뱃전 바깥','배 밑']);
  }
  if(st.id===27&&step==='scene2'){
   v['도는 쪽']=v['도는 쪽']==='왼쪽'?'오른쪽':'왼쪽';
   v['반대쪽']=v['도는 쪽']==='왼쪽'?'오른쪽':'왼쪽';
  }
  if(st.id===28&&(step==='scene0'||step==='scene1')){
   const dirs=['왼쪽','앞쪽','오른쪽'],other=shuffled(dirs);
   v['참 쪽']=choose(dirs);v['거짓 쪽']=choose(dirs);
   const rest=shuffled(dirs.filter(x=>x!==v['참 쪽']));
   v['다른 쪽1']=rest[0];v['다른 쪽2']=rest[1];
  }
 }
 function enter(st,stage,opts={}){
  const def=index.get(st.id),node=def.nodes[stage];
  if(!node)throw Error('No scene '+st.id+' '+stage);
  st.step=stage;sceneVars(st,stage);
  let show=node.text;
  if((st.id===6||st.id===17)&&show.includes('끝이 {끝} 노와 끝이 {다른 끝} 노')&&Math.random()<.5)
   show=show.replace('끝이 {끝} 노와 끝이 {다른 끝} 노','끝이 {다른 끝} 노와 끝이 {끝} 노');
  if(st.id===22&&stage==='scene0'){
   const terms=shuffled(['{빛1}','{빛2}','{섞인 빛}']);
   show=show.replace('{빛1} 갈래, {빛2} 갈래, {섞인 빛} 갈래',terms.map(t=>t+' 갈래').join(', '));
  }
  if(st.id===23&&stage==='scene1'&&Math.random()<.5)
   show=show.replace('{첫째} 종과 {둘째} 종이 떠 있다','{둘째} 종과 {첫째} 종이 떠 있다');
  st.sceneText=write(show,st.vars);
  st.order=shuffled(node.choices.map((_,i)=>i));
 }
 // Determines whether a random starting scene can be solved within its 3-6 turn limit.
 function minimum(def,stage){
  if(!def?.nodes?.[stage])return 99;
  const scores=Object.fromEntries(Object.keys(def.nodes).map(k=>[k,99]));
  for(let n=0;n<32;n++)for(const [key,node] of Object.entries(def.nodes)){
   const c=node.choices.map(op=>op.death?99:op.pass?1:op.to?1+scores[op.to]:
    op.toAny?1+Math.min(...op.toAny.map(k=>scores[k])):99);
   scores[key]=Math.min(scores[key],...c);
  }
  const id=def.id;
  if(id===12&&stage==='scene0')return Math.max(scores[stage],3);
  if(id===13&&['scene0','scene1'].includes(stage))return Math.max(scores[stage],4);
  if(id===14&&stage==='scene0')return Math.max(scores[stage],3);
  if(id===14&&stage==='scene1')return Math.max(scores[stage],4);
  if(id===19&&['scene0','scene1','scene2'].includes(stage))return Math.max(scores[stage],4);
  if(id===23&&stage==='scene0')return Math.max(scores[stage],4);
  if(id===24&&['scene0','scene1','scene2'].includes(stage))return Math.max(scores[stage],3);
  if(id===29){
   if(stage==='scene0')return Math.max(scores[stage],4);
   if(stage==='scene1'||stage==='scene2')return Math.max(scores[stage],3);
  }
  if(id===30){
   if(stage==='scene0')return Math.max(scores[stage],4);
   if(stage==='scene1')return Math.max(scores[stage],3);
  }
  return scores[stage];
 }
 const baseMake=makeStory014;
 makeStory014=function(lake){
  const def=index.get(lake.id);
  if(!def)return baseMake(lake);
  const turns=3+rng(4),possible=Object.keys(def.nodes).filter(k=>minimum(def,k)<=turns);
  if(!possible.length)throw Error('No solvable start '+lake.id+' '+turns);
  const st={id:lake.id,scripted:true,scriptVersion019:true,step:'',
   turns:0,turnLimit:turns,vars:{},counters:{looks:0,turns:0,nets:0,ties:0,boats:0,iceHits:0},
   specialNetUsed:false,sceneText:'',order:[],result:''};
  seedVars(st);
  const start=choose(possible);
  if(lake.id===29){
   if(start==='scene1')st.counters.iceHits=1;
   if(start==='scene2'){st.vars['얼음 타격 수']=2;st.counters.iceHits=1;}
   if(start==='scene3')st.counters.iceHits=st.vars['얼음 타격 수'];
  }
  enter(st,start);return st;
 };
 function nextAmong(candidates,last){
  const arr=[...new Set(candidates)].filter(key=>typeof key==='string'&&key.length);
  const distinct=arr.filter(key=>key!==last);
  return choose(distinct.length?distinct:arr);
 }
 const prevChoice=storyChoice014;
 storyChoice014=function(i){
  const id=state.current,def=index.get(id),st=state.lakeStory;
  if(!def||state.scene!=='event'||!st?.scriptVersion019)return prevChoice(i);
  const node=def.nodes[st.step],opt=node?.choices?.[st.order[i]];
  if(!opt)return;
  // The source is authoritative: every forbidden choice immediately kills.
  if(opt.death||(!opt.pass&&!opt.to&&!opt.toAny&&!opt.special))
   return mermaidDeath015(id);
  if(opt.pass&&state.normalMermaidDraw&&!state.mermaidResolved){
   state.mermaidResolved=true;
   beginBattle({type:'normal',name:'대호수의 인어',
    power:35+LAKE_BY_ID157.get(id).risk*18,need:1,won:0,history:[],after:'navigation'});
   return;
  }
  st.turns++;
  if(st.turns>st.turnLimit)return mermaidDeath015(id);
  if(!state.nav)state.nav={stage:'law',turns:0,transition:false};
  state.nav.turns=st.turns;
  if(opt.pass){
   if(opt.epilogue)log(write(opt.epilogue,st.vars));
   state.nav.transition=true;state.ruleResolved=true;
   completeLake(true,'호수의 경계를 건넜습니다.');return;
  }
  const count=st.counters,actualChoice=st.order[i];
  let next=opt.to||nextAmong(opt.toAny||[],st.step);
  if(opt.special==='lookTwice'){
   count.looks++;next=count.looks>=2?'scene4':'scene0';
  }else if(opt.special==='turnTwice'){
   count.turns++;
   next=count.turns>=2?'scene2':nextAmong((opt.toAny||[opt.to||'scene0']).filter(k=>k!=='scene2'),st.step);
  }else if(opt.special==='netTwice'){
   count.nets++;
   next=count.nets>=2?'scene2':(st.specialNetUsed||st.turnLimit-st.turns<3?'scene0':choose(['scene0','scene1']));
   if(next==='scene1')st.specialNetUsed=true;
  }else if(opt.special==='tieThree'){
   count.ties++;
   next=count.ties>=3?'scene3':nextAmong(['scene0','scene1','scene2'],st.step);
  }else if(opt.special==='twoBoats'){
   count.boats++;
   next=count.boats>=2?'scene3':nextAmong(['scene0','scene1','scene2'],st.step);
  }else if(opt.special==='iceFirst'){
   count.iceHits=1;
   next=st.vars['얼음 타격 수']===2&&Math.random()<.5?'scene2':'scene1';
  }else if(opt.special==='iceStrike'){
   count.iceHits++;
   next=count.iceHits>=st.vars['얼음 타격 수']?'scene3':'scene1';
  }
  if(opt.reroll&&id===23)seedVars(st);
  if(id===14&&next==='scene1'&&st.specialNetUsed&&st.step!=='scene0')next='scene0';
  if(!def.nodes[next])return mermaidDeath015(id);
  const previous=st.step;
  enter(st,next);
  dispatchAchievement142('choice',{lake:id,stage:previous,choice:actualChoice});
  if(state.normalMermaidDraw&&!state.mermaidResolved){
   state.mermaidResolved=true;
   beginBattle({type:'normal',name:'대호수의 인어',
    power:35+LAKE_BY_ID157.get(id).risk*18,need:1,won:0,history:[],after:'navigation'});
  }else sync();
 };
 const oldRender=renderScriptedLake015;
 renderScriptedLake015=function(){
  const lake=activeLake(),def=lake&&index.get(lake.id),st=state.lakeStory;
  if(!def||!st?.scriptVersion019)return oldRender();
  if(!def.nodes[st.step])state.lakeStory=makeStory014(lake);
  const x=state.lakeStory,node=def.nodes[x.step],actions=x.order.map(i=>node.choices[i]);
  const title=lake.id===8?'':'21-'+String(lake.id).padStart(2,'0')+(def.name?' · '+def.name:'');
  return '<div class="inset" style="border-top:4px solid '+def.hex+'">'+
   '<div class="between">'+(title?'<h2>'+esc(title)+'</h2>':'')+tag('창작 구역')+'</div>'+
   '<p class="muted">'+esc(write(def.description,x.vars))+'</p>'+
   '<div class="inset"><div class="barline"><span>호수 체류</span><span>'+x.turns+' / '+x.turnLimit+'턴</span></div>'+
   '<div class="meter"><span style="width:'+Math.min(100,100*x.turns/x.turnLimit)+'%"></span></div></div>'+
   '<h3>발생 사건</h3><p>'+esc(x.sceneText)+'</p><div class="stack">'+
   actions.map((a,i)=>button('▸ '+write(a.text,x.vars),'storyChoice',String(i),'')).join('')+
   '</div></div>';
 };
 // Upgrade in-progress boats to the new source without resetting earned achievements.
 if(state.scene==='event'&&index.has(state.current)&&!state.lakeStory?.scriptVersion019)
  state.lakeStory=makeStory014(LAKE_BY_ID157.get(state.current));
 // Existing lakes 1..24 and 40 keep the original 016/017 persistent counters.
 const added=[29,30],key='great-lake-napolitan-new-lake-passes-v019';
 let extra={};try{extra=JSON.parse(localStorage.getItem(key))||{};}catch(e){}
 if(!extra||typeof extra!=='object'||Array.isArray(extra))extra={};
 for(const id of added){
  const def=index.get(id),prefix='21-'+String(id).padStart(2,'0')+' · '+def.name;
  const first='lake_'+id;
  let item=ACH.find(a=>a.id===first);
  if(!item){item={id:first};ACH.push(item);}
  Object.assign(item,{name:prefix+' 통과',tier:'common',desc:'21-'+id+' 호수를 1회 통과한다.',check:{kind:'uniqueLake',n:id}});
  for(const [type,tier,count,title]of [['hero','hero',10,'되찾은 항로'],['legend','legend',100,'백 번의 귀환']]){
   const key='lake_'+type+'_'+id;
   if(!ACH.some(a=>a.id===key))ACH.push({id:key,tier,name:prefix+' · '+title,
    desc:'21-'+id+' 호수를 누적 '+count+'회 통과한다.',
    lakeMedal016:true,lakeId016:id,required016:count});
  }
  const val=Number(extra[id])||0;
  extra[id]=Math.max(0,Math.floor(val),(state.achievements.includes(first)||permanentAchievements.includes(first))?1:0);
  if(extra[id]>=10)award('lake_hero_'+id);
  if(extra[id]>=100)award('lake_legend_'+id);
 }
 const oldComplete=completeLake;
 completeLake=function(success,msg){
  const id=state.current,old=state.count?.lake||0;
  const result=oldComplete(success,msg);
  if(success&&added.includes(id)&&(state.count?.lake||0)>old){
   extra[id]=(extra[id]||0)+1;
   award('lake_'+id);
   if(extra[id]>=10)award('lake_hero_'+id);
   if(extra[id]>=100)award('lake_legend_'+id);
   try{localStorage.setItem(key,JSON.stringify(extra));}catch(e){}
   save();render();
  }
  return result;
 };
 // Keep overall category proportions close to 80/60/40/40/30; do not change the
 // original miracle/unique achievements or any lake-specific medals.
 const redundant=new Set([
  'progress_161_two_returns','progress_161_two_departs',
  'progress_161_five_returns','progress_161_five_paid',
  'progress_161_eight_special','progress_161_eight_streak',
  'progress_161_ten_whale_escapes','progress_161_feat_whole_crew4',
  'progress_161_ten_full_returns','progress_161_two_thousand_fish',
  'progress_161_feat_severe_five','progress_161_feat_small_grade4'
 ]);
 for(let i=ACH.length-1;i>=0;i--)if(redundant.has(ACH[i].id))ACH.splice(i,1);
 state.achievements=(state.achievements||[]).filter(x=>!redundant.has(x));
 permanentAchievements=permanentAchievements.filter(x=>!redundant.has(x));
 if(redundant.has(state.equippedTitle))state.equippedTitle='';
 const prevHelp=renderHelp;
 renderHelp=function(){
  return prevHelp().replace('항해 안내 · v0.1.8.0','항해 안내 · v0.1.9.0')
   .replace(/현재 호수는 총 29개입니다\.[^<]*/,
    '현재 호수는 총 31개입니다. 21-01부터 21-30까지와 21-40이 등장합니다. 출항마다 선장 등급에 따라 4 / 8 / 12 / 16 / 20개 호수가 무작위 배치됩니다.')
   .replace('29개 호수 중 하나','31개 호수 중 하나');
 };
 const prevPlay=renderPlay;
 renderPlay=function(){
  const h=prevPlay();
  if(state.scene==='port')return h.replaceAll('29개의 서로 다른 호수','31개의 서로 다른 호수');
  if(state.scene==='start')return h.replace(/<div class="log-update"><h3>V\.0\.1\.8\.0 · 대호수 제작자용 전체 분기 자료<\/h3>[\s\S]*?<\/div>/,'')+
   '<div class="log-update"><h3>V.0.1.9.0 · 대호수 제작자용 전체 분기 자료 5</h3><ul>'+
   '<li>31개 호수의 법칙, 장면과 선택지를 최신 첨부 원문으로 교체했습니다.</li>'+
   '<li>규칙 위반 선택은 즉사하고, 횟수·순서 규칙에 해당할 때만 장면이 바뀝니다.</li>'+
   '<li>21-29 얼음 호수와 21-30 살구빛 호수, 일반·영웅·전설 업적 6개를 추가했습니다.</li></ul></div>';
  return h;
 };
 try{localStorage.setItem(key,JSON.stringify(extra));}catch(e){}
 save();render();
 window.GREAT_LAKE_PATCH_019={ids:[...index.keys()],counts:()=>({...extra}),minimum:(id,k)=>minimum(index.get(id),k)};
})();
