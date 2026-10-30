/* Uploaded revision (7): lake-only scripting and 43 authored locations. */
(function(){
'use strict';
const data=window.GREAT_LAKE_SCRIPT_DATA_021;
if(!Array.isArray(data)||data.length!==43)throw Error('Lake source 7 missing');
const defs=new Map(data.map(x=>[x.id,x]));
const added=[34,35,36,37,38,39,41,42,43];
const custom=new Set([9,14,17,...added]);
const pick=a=>a[rng(a.length)];
const swap=x=>x==='왼쪽'?'오른쪽':'왼쪽';
const fill=(s,v)=>String(s).replace(/\{([^}]+)\}/g,(_,k)=>v[k]??'{'+k+'}');
const colors=['붉은','푸른','노란'];
for(const id of added){
 const d=defs.get(id);if(LAKE_BY_ID157.has(id))throw Error('Duplicate lake '+id);
 const l={id,name:d.name,hex:d.hex,hue:0,material:0,zone:0,rule:RULES.length,
  risk:1+(id*17+3)%4,limit:2+(id*7)%4,mermaid:true,required:false,storyNo:'21-'+id};
 LAKES.push(l);LAKE_BY_ID157.set(id,l);
 RULES.push({title:d.name,truth:()=>pick(d.hints),false:()=>pick([
  '어느 호수에서든 물 위의 물건을 전부 건져야 안전하다고 들었습니다.',
  '어느 호수에서든 노를 거두고 끝까지 기다리면 된다고 들었습니다.'
 ]),event:()=>'',options:[],effects:[],special:null});
}
for(const d of data){
 const current=SCRIPTED_LAKE_MAP_015.get(d.id);
 if(current)Object.assign(current,d);else SCRIPTED_LAKE_MAP_015.set(d.id,d);
 const lake=LAKE_BY_ID157.get(d.id);
 if(!lake)throw Error('Lake not registered: '+d.id);
 Object.assign(lake,{name:d.name,hex:d.hex,mermaid:true,storyNo:'21-'+String(d.id).padStart(2,'0')});
 RULES[lake.rule].truth=()=>pick(d.hints);
}
function seed(st){
 const v=st.vars,id=st.id;
 if([9,14,17,34,35,36,39,42].includes(id))v.N=pick([2,3]);
 if(id===37)v.N=pick([1,2]);
 if(id===14)v['우리 색']=pick(colors);
 if(id===37)v['선 자리']=pick(['이쪽','너머']);
 if(id===41){
  const ends=['갈라진','깨진','둥글게 닳은','멀쩡한'];
  v['끝']=pick(ends);v['다른 끝']=pick(ends.filter(x=>x!==v['끝']));
  v['천']=pick(['검은','붉은','흰','푸른']);
  v['다른 물건']=pick(['그물','밧줄','닻']);
 }
}
function initial(st){
 const id=st.id,N=st.vars.N,lim=st.turnLimit;
 if(id===36||id===37)return 'scene0';
 if([9,14,17].includes(id))return lim>=N+1?pick(id===17?['scene0','scene1','scene2']:['scene0','scene1']):id===17?'scene2':'scene1';
 if(id===38)return pick(lim>=4?['scene0','scene1','scene2']:['scene0','scene2']);
 if(id===41)return pick(['scene0','scene2','scene3']);
 if(id===43)return pick(['scene0','scene1','scene2','scene3']);
 if(id===34)return pick(lim>=N+1?['scene0','scene1','scene2']:['scene2']);
 if(id===35||id===39||id===42){
  const pool=id===35?['scene0','scene1','scene2','scene3']:['scene0','scene1','scene2','scene3'];
  return pick(lim>=N+1?pool:['scene3']);
 }
 return 'scene0';
}
function enter(st,key){
 const id=st.id,v=st.vars;
 if([9,14,17,35,37,39].includes(id)){v['쪽']=pick(['왼쪽','오른쪽']);v['반대쪽']=swap(v['쪽']);}
 if(id===14){
  const same=st.count===0?Math.random()<.5:!st.seen.same?true:!st.seen.diff?false:Math.random()<.5;
  v['색']=same?v['우리 색']:pick(colors.filter(x=>x!==v['우리 색']));
 }
 if(id===34){if(key==='scene0')v['길잡이 모습']=pick(['물결에 흔들리며 종이 운다','멎은 채 종도 조용하다']);
  if(key==='scene1')v['아닌 모습']=pick(['흔들리지 않는데 종이 운다','물결에 흔들리는데 종이 울지 않는다']);}
 if(id===36){
  const dirs=['왼쪽','앞쪽','오른쪽'];
  v['물 끝 쪽']=pick(dirs);v['다른 쪽']=pick(dirs.filter(x=>x!==v['물 끝 쪽']));
  v['가까운 쪽']=pick(dirs.filter(x=>x!==v['물 끝 쪽']));
  v['지연']=['한참 뒤에','조금 뒤에','금방'][Math.min(st.count,2)];
 }
 if(id===42)v['색']=pick(['붉은','흰']);
 let message=defs.get(id).nodes[key]?.text;
 if(!message)throw Error('Missing scene '+id+':'+key);
 if(id===37&&key==='scene4'&&st.fromNear)message='앞쪽 물빛이 갈린다. 선을 넘자 '+message;
 if(id===41&&key==='scene0'&&Math.random()<.5)message=message.replace('끝이 {끝} 노와 끝이 {다른 끝} 노','끝이 {다른 끝} 노와 끝이 {끝} 노');
 st.step=key;st.order=shuffle(defs.get(id).nodes[key].choices.map((_,i)=>i));
 st.sceneText=fill(message,v);
}
function makePlan(st){
 const id=st.id;
 if(![34,35,39,42].includes(id))return [];
 const pool=id===34?['scene0','scene1']:['scene0','scene1','scene2'];
 let plan=[st.step,...shuffle(pool.filter(s=>s!==st.step))];
 while(plan.length<st.vars.N)plan.push(pick(pool.filter(k=>k!==plan[plan.length-1])));
 return plan.slice(0,st.vars.N);
}
const beforeMake=makeStory014;
makeStory014=function(lake){
 if(!custom.has(lake?.id))return beforeMake(lake);
 const id=lake.id,turnLimit=(id===36||id===37)?4+rng(3):3+rng(4);
 const st={id,scripted:true,scriptVersion021:true,turns:0,turnLimit,
  vars:{},order:[],step:'',sceneText:'',count:0,seen:{},done38:0,fromNear:false,encounteredFake:false};
 seed(st);
 if(id===36&&st.vars.N+2>turnLimit)st.vars.N=2;
 if(id===37&&st.vars.N+3>turnLimit)st.vars.N=1;
 if([9,14,17,34,35,39,42].includes(id)&&st.vars.N+1>turnLimit)st.vars.N=2;
 let start=initial(st);
 if(id===38&&start==='scene2')st.done38=2;
 enter(st,start);
 st.plan=makePlan(st);
 return st;
};
const beforeChoice=storyChoice014;
storyChoice014=function(i){
 const id=state.current,st=state.lakeStory;
 if(!custom.has(id)||state.scene!=='event'||!st?.scriptVersion021)return beforeChoice(i);
 const node=defs.get(id).nodes[st.step],actual=st.order[i],opt=node?.choices[actual];
 if(!opt)return;
 if(opt.death||(!opt.pass&&!opt.to&&!opt.toAny&&!opt.special))return mermaidDeath015(id);
 if(id===14&&st.step==='scene0'&&((st.vars['색']===st.vars['우리 색'])!==(actual===0)))return mermaidDeath015(id);
 if(opt.pass&&state.normalMermaidDraw&&!state.mermaidResolved){
  state.mermaidResolved=true;
  beginBattle({type:'normal',name:'대호수의 인어',
   power:35+LAKE_BY_ID157.get(id).risk*18,need:1,won:0,history:[],after:'navigation'});return;
 }
 st.turns++;
 if(st.turns>st.turnLimit)return mermaidDeath015(id);
 if(!state.nav)state.nav={stage:'law',turns:0,transition:false};
 state.nav.turns=st.turns;
 if(opt.pass){
  state.nav.transition=true;state.ruleResolved=true;
  completeLake(true,'호수의 경계를 건넜습니다.');return;
 }
 const prev=st.step;
 let next=opt.to||pick(opt.toAny||[]);
 if(id===9){st.count++;next=st.count>=st.vars.N?'scene1':'scene0';}
 if(id===14){
  st.seen[st.vars['색']===st.vars['우리 색']?'same':'diff']=true;
  st.count++;next=st.count>=st.vars.N?'scene1':'scene0';
 }
 if(id===17){
  st.seen[prev]=true;st.count++;
  next=st.count>=st.vars.N?'scene2':!st.seen.scene0?'scene0':!st.seen.scene1?'scene1':pick(['scene0','scene1']);
 }
 if([34,35,39,42].includes(id)){
  const active=id===34?['scene0','scene1']:['scene0','scene1','scene2'];
  if(active.includes(prev)){
   st.count++;
   next=st.count>=st.vars.N?'scene'+(id===34?2:3):st.plan[st.count];
  }
 }
 if(id===36){
  if(prev==='scene0')next='scene2';
  else if(['scene1','scene2'].includes(prev)){
   st.count++;next=st.count>=st.vars.N?'scene3':'scene1';
  }
 }
 if(id===37){
  if(prev==='scene0')next=st.vars.N===1?'scene2':pick(['scene1','scene2']);
  else if(prev==='scene1'||prev==='scene2'){
   if(prev==='scene2')st.encounteredFake=true;
   st.count++;
   next=st.count>=st.vars.N?(st.vars['선 자리']==='이쪽'?'scene3':'scene4'):
    (st.encounteredFake?'scene1':'scene2');
  }else if(prev==='scene3'){st.fromNear=true;next='scene4';}
 }
 if(id===38){
  if(prev==='scene0'){
   st.done38++;
   next=st.done38>=2?'scene2':st.turnLimit-st.turns>=3&&Math.random()<.5?'scene1':'scene0';
  }else if(prev==='scene1')next='scene0';
 }
 if(!defs.get(id).nodes[next])return mermaidDeath015(id);
 enter(st,next);
 dispatchAchievement142('choice',{lake:id,stage:prev,choice:actual});
 if(state.normalMermaidDraw&&!state.mermaidResolved){
  state.mermaidResolved=true;
  beginBattle({type:'normal',name:'대호수의 인어',
   power:35+LAKE_BY_ID157.get(id).risk*18,need:1,won:0,history:[],after:'navigation'});
 }else sync();
};
const beforeRendered=renderScriptedLake015;
renderScriptedLake015=function(){
 const lake=activeLake(),st=state.lakeStory;
 if(!lake||!custom.has(lake.id)||!st?.scriptVersion021)return beforeRendered();
 const def=defs.get(lake.id),node=def.nodes[st.step],title='21-'+String(lake.id).padStart(2,'0')+' · '+def.name;
 return '<div class="inset" style="border-top:4px solid '+def.hex+'">'+
 '<div class="between"><h2>'+esc(title)+'</h2>'+tag('창작 구역')+'</div>'+
 '<p class="muted">'+esc(fill(def.description,st.vars))+'</p>'+
 '<div class="inset"><div class="barline"><span>호수 체류</span><span>'+st.turns+' / '+st.turnLimit+'턴</span></div>'+
 '<div class="meter"><span style="width:'+Math.min(100,100*st.turns/st.turnLimit)+'%"></span></div></div>'+
 '<h3>발생 사건</h3><p>'+esc(st.sceneText)+'</p><div class="stack">'+
 st.order.map((j,k)=>button('▸ '+fill(node.choices[j].text,st.vars),'storyChoice',String(k),'')).join('')+
 '</div></div>';
};
if(state.scene==='event'&&custom.has(state.current)&&!state.lakeStory?.scriptVersion021)
 state.lakeStory=makeStory014(LAKE_BY_ID157.get(state.current));
window.GREAT_LAKE_RULES_021={ids:[...defs.keys()],custom:[...custom],added,make:makeStory014};
})();