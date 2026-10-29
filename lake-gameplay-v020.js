/* 사용자 수정본 (6) / 21-31~33 신규 사건·판정 및 21-28 진입 묘사만 반영 */
(function(){
 'use strict';
 const added=window.GREAT_LAKE_SCRIPT_DATA_020;
 if(!Array.isArray(added)||added.length!==3||added.some((x,i)=>x.id!==31+i))
  throw Error('21-31~21-33 데이터가 유효하지 않습니다.');
 const byId=new Map(added.map(x=>[x.id,x]));
 // 기존 31호수 가운데 변경된 문장은 이 한 곳뿐이다.
 const starLake=SCRIPTED_LAKE_MAP_015.get(28);
 if(starLake)starLake.description=window.GREAT_LAKE_LAKE28_DESCRIPTION_020;
 const choose=arr=>arr[rng(arr.length)];
 for(const def of added){
  const lake=LAKE_BY_ID157.get(def.id);
  if(!lake)throw Error('추가 호수 미등록: '+def.id);
  SCRIPTED_LAKE_MAP_015.set(def.id,def);
  lake.name=def.name;lake.hex=def.hex;lake.mermaid=true;lake.storyNo='21-'+def.id;
  const rule=RULES[lake.rule],hints=def.hints.slice();
  rule.truth=()=>choose(hints);
 }
 const format=(text,vars)=>String(text).replace(/\{([^}]+)\}/g,(_,key)=>vars[key]??'{'+key+'}');
 const opposite=dir=>dir==='왼쪽'?'오른쪽':'왼쪽';
 function enter(st,step,opts={}){
  const node=byId.get(st.id).nodes[step];if(!node)throw Error('호수 장면 없음 '+st.id+':'+step);
  st.step=step;
  const vars=st.vars;
  if(st.id===31&&['scene0','scene1'].includes(step)){
   const low=opts.low||choose(['왼쪽','오른쪽']);
   vars['낮은 쪽']=low;
   vars['높은 쪽']=opposite(low);
  }
  if(st.id===31){
   vars['반대쪽']=vars['궤짝 쪽']==='가운데'?'가운데':opposite(vars['궤짝 쪽']);
  }
  if(st.id===32&&step==='scene1')vars['말']=choose(['다 왔다.','앞을 봐.','조금만 더 왼쪽.']);
  if(st.id===32&&step==='scene3')st.usedFalseLine=true;
  if(st.id===33&&step==='scene0'){
   vars['쪽']=choose(['왼쪽','오른쪽','뒤쪽']);
   st.seenSide=true;
  }
  st.sceneText=format(node.text,vars);
  st.order=shuffle(node.choices.map((_,i)=>i));
 }
 function nextTilt(st,previous){
  const chest=st.vars['궤짝 쪽'];
  const candidates=['왼쪽','오른쪽'].map(low=>({low,step:chest==='가운데'||chest===low?'scene0':'scene1'}));
  const alternatives=candidates.filter(x=>x.step!==previous);
  const pick=choose(alternatives.length?alternatives:candidates);
  enter(st,pick.step,{low:pick.low});
 }
 function nextBackward(st,previous){
  let options=['scene1','scene2','scene3'].filter(x=>!(x==='scene3'&&st.usedFalseLine)&&x!==previous);
  if(!options.length)options=['scene1','scene2'].filter(x=>x!==previous);
  enter(st,choose(options));
 }
 function nextWave(st,previous){
  let step=previous==='scene0'?'scene1':'scene0';
  if(!st.seenSide&&st.counters.waves===st.vars.N-1)step='scene0';
  enter(st,step);
 }
 const previousMake=makeStory014;
 makeStory014=function(lake){
  const def=byId.get(lake.id);
  if(!def)return previousMake(lake);
  const N=choose([2,3]);
  // 고정 시작 장면에서 정답대로 진행해도 제한 시간이 모자라는 불가능한 배치를 방지한다.
  const minimum=lake.id===33?N+1:N+2;
  const limit=minimum+rng(7-minimum);
  const st={id:lake.id,scripted:true,scriptVersion020:true,step:'',turns:0,turnLimit:limit,
   vars:{N},counters:{tilts:0,backward:0,waves:0},sceneText:'',order:[],
   usedFalseLine:false,seenSide:false};
  if(lake.id===31){
   st.vars['궤짝 쪽']='가운데';enter(st,'scene0');
  }else if(lake.id===32)enter(st,'scene0');
  else enter(st,choose(['scene0','scene1']));
  return st;
 };
 const previousChoice=storyChoice014;
 storyChoice014=function(i){
  const id=state.current,st=state.lakeStory,def=byId.get(id);
  if(!def||state.scene!=='event'||!st?.scriptVersion020)return previousChoice(i);
  const node=def.nodes[st.step],choiceId=st.order[i],opt=node?.choices[choiceId];
  if(!opt)return;
  if(opt.death||(!opt.pass&&!opt.special&&!opt.to))return mermaidDeath015(id);
  // 인어가 통과 직전에 출현하더라도 돌아왔을 때 통과 선택지를 다시 누를 수 있다.
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
   state.nav.transition=true;state.ruleResolved=true;
   completeLake(true,'호수의 경계를 건넜습니다.');return;
  }
  const last=st.step;
  if(id===31){
   if(opt.special==='tilt'){
    st.counters.tilts++;
    if(last==='scene0')st.vars['궤짝 쪽']=st.vars['높은 쪽'];
    if(st.counters.tilts>=st.vars.N)enter(st,'scene2');
    else nextTilt(st,last);
   }else if(opt.special==='centerChest'){
    st.vars['궤짝 쪽']='가운데';enter(st,'scene3');
   }else return mermaidDeath015(id);
  }else if(id===32){
   if(opt.special==='reverseSail')nextBackward(st,'scene0');
   else if(opt.special==='backward'){
    st.counters.backward++;
    if(st.counters.backward>=st.vars.N)enter(st,'scene4');
    else nextBackward(st,last);
   }else return mermaidDeath015(id);
  }else if(id===33){
   if(opt.special==='wave'){
    st.counters.waves++;
    if(st.counters.waves>=st.vars.N){
     if(!st.seenSide)return mermaidDeath015(id);
     enter(st,'scene2');
    }else nextWave(st,last);
   }else return mermaidDeath015(id);
  }
  dispatchAchievement142('choice',{lake:id,stage:last,choice:choiceId});
  if(state.normalMermaidDraw&&!state.mermaidResolved){
   state.mermaidResolved=true;
   beginBattle({type:'normal',name:'대호수의 인어',
    power:35+LAKE_BY_ID157.get(id).risk*18,need:1,won:0,history:[],after:'navigation'});
  }else sync();
 };
 const previousDisplay=renderScriptedLake015;
 renderScriptedLake015=function(){
  const lake=activeLake(),def=lake&&byId.get(lake.id),st=state.lakeStory;
  if(!def||!st?.scriptVersion020)return previousDisplay();
  if(!def.nodes[st.step])state.lakeStory=makeStory014(lake);
  const cur=state.lakeStory,node=def.nodes[cur.step];
  const title='21-'+String(lake.id).padStart(2,'0')+' · '+def.name;
  return '<div class="inset" style="border-top:4px solid '+def.hex+'">'+
   '<div class="between"><h2>'+esc(title)+'</h2>'+tag('창작 구역')+'</div>'+
   '<p class="muted">'+esc(format(def.description,cur.vars))+'</p>'+
   '<div class="inset"><div class="barline"><span>호수 체류</span><span>'+cur.turns+' / '+cur.turnLimit+'턴</span></div>'+
   '<div class="meter"><span style="width:'+Math.min(100,100*cur.turns/cur.turnLimit)+'%"></span></div></div>'+
   '<h3>발생 사건</h3><p>'+esc(cur.sceneText)+'</p><div class="stack">'+
   cur.order.map((num,index)=>button('▸ '+format(node.choices[num].text,cur.vars),'storyChoice',String(index),'')).join('')+
   '</div></div>';
 };
 // 진행 중인 항해에는 호수 장면 교체만 적용. 기존 업적/다른 호수는 유지.
 if(state.scene==='event'&&byId.has(state.current)&&!state.lakeStory?.scriptVersion020)
  state.lakeStory=makeStory014(LAKE_BY_ID157.get(state.current));
 const COUNTS_KEY='great-lake-napolitan-new-lake-passes-v020';
 let passes={};
 try{passes=JSON.parse(localStorage.getItem(COUNTS_KEY))||{};}catch(e){}
 if(!passes||typeof passes!=='object'||Array.isArray(passes))passes={};
 for(const def of added){
  const id=def.id,prefix='21-'+id+' · '+def.name;
  let common=ACH.find(a=>a.id==='lake_'+id);
  if(!common){common={id:'lake_'+id};ACH.push(common);}
  Object.assign(common,{name:prefix+' 통과',tier:'common',desc:'21-'+id+' 호수를 1회 통과한다.',
   check:{kind:'uniqueLake',n:id}});
  for(const [suffix,tier,n,title] of [['hero','hero',10,'되찾은 항로'],['legend','legend',100,'백 번의 귀환']]){
   const key='lake_'+suffix+'_'+id;
   if(!ACH.some(a=>a.id===key))ACH.push({id:key,tier,name:prefix+' · '+title,
    desc:'21-'+id+' 호수를 누적 '+n+'회 통과한다.',lakeMedal016:true,lakeId016:id,required016:n});
  }
  passes[id]=Math.max(0,Math.floor(Number(passes[id])||0),
   (state.achievements.includes('lake_'+id)||permanentAchievements.includes('lake_'+id))?1:0);
  if(passes[id]>=10)award('lake_hero_'+id);
  if(passes[id]>=100)award('lake_legend_'+id);
 }
 const prevComplete=completeLake;
 completeLake=function(success,msg){
  const id=state.current,was=state.count?.lake||0;
  const result=prevComplete(success,msg);
  if(success&&byId.has(id)&&(state.count?.lake||0)>was){
   passes[id]=(passes[id]||0)+1;
   award('lake_'+id);
   if(passes[id]>=10)award('lake_hero_'+id);
   if(passes[id]>=100)award('lake_legend_'+id);
   try{localStorage.setItem(COUNTS_KEY,JSON.stringify(passes));}catch(e){}
   save();render();
  }
  return result;
 };
 // 추가 호수에 따른 안내 숫자만 갱신한다. 다른 안내/이벤트/화면 구성은 유지한다.
 const previousHelp=renderHelp;
 renderHelp=function(){
  return previousHelp().replace('현재 호수는 총 31개입니다. 21-01부터 21-30까지와 21-40이 등장합니다.',
   '현재 호수는 총 34개입니다. 21-01부터 21-33까지와 21-40이 등장합니다.');
 };
 const previousPlay=renderPlay;
 renderPlay=function(){
  const page=previousPlay();
  return state.scene==='port'?page.replaceAll('31개의 서로 다른 호수','34개의 서로 다른 호수'):page;
 };
 try{localStorage.setItem(COUNTS_KEY,JSON.stringify(passes));}catch(e){}
 save();render();
 window.GREAT_LAKE_PATCH_020={ids:[...byId.keys()],counts:()=>({...passes})};
})();