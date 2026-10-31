/* 2026-10-31 첨부 50호수: 09·14·49·50 특수 항로 판정. 그 외 전투와 시스템 변경 없음. */
(function applyLakeSpecials023(){
 'use strict';
 const all=window.GREAT_LAKE_SCRIPT_DATA_023,ids=new Set([9,14,49,50]);
 if(!Array.isArray(all)||all.length!==50)throw Error('호수 원문 50개 자료가 없습니다.');
 const source=new Map(all.map(x=>[x.id,x])),random=a=>a[rng(a.length)];
 const format=(x,vars)=>String(x||'').replace(/\{([^{}]+)\}/g,(_,k)=>String(vars[k]??''));
 const correct=(text)=>({text,result:'→ 정답.',death:false,pass:false,targets:[]});
 const wrong=(text)=>({text,result:'→ 즉사.',death:true,pass:false,targets:[]});
 for(const id of [49,50]){
  const d=source.get(id);
  if(!LAKE_BY_ID157.has(id)){
   const l={id,name:d.name,hex:d.hex,hue:0,material:0,zone:0,rule:RULES.length,risk:1+(id*17+3)%4,limit:6,mermaid:true,required:false,storyNo:'21-'+id};
   LAKES.push(l);LAKE_BY_ID157.set(id,l);
   RULES.push({title:d.name,truth:()=>d.hints[0]||'',false:()=>'',event:()=>'',options:[],effects:[],special:null});
  }
  const old={id,name:d.name,description:d.description,hints:d.hints,law:d.law,hex:d.hex,
    nodes:Object.fromEntries(d.scenes.map((s,i)=>['scene'+i,{text:s.text,scripted:true,choices:s.choices.map(x=>({text:x.text,death:x.death,pass:x.pass}))}]))};
  SCRIPTED_LAKE_MAP_015.set(id,old);
  if(typeof TEST_LAKE_IDS154!=='undefined')TEST_LAKE_IDS154.add(id);
 }
 function createFlags(st){
  const v=st.vars;v.N=random([3,4]);v['청']='올림';v['백']='올림';
  const possibles=(f,final)=>{
   const found=[];
   const add=(kind,target,other,after,says)=>{
    const both=after.청==='내림'&&after.백==='내림';
    if(both!==final)return;
    let right,bad;
    if(kind==='both'){right='청기와 백기를 모두 내린다';bad=['청기만 내린다','백기만 내린다','아무것도 하지 않는다'];}
    else if(kind==='down'){right=target+'기만 내린다';bad=['청기와 백기를 모두 내린다','다른 깃발만 내린다','아무것도 하지 않는다'];}
    else if(kind==='up'){right=target+'기만 올린다';bad=['청기와 백기를 모두 올린다','다른 깃발만 올린다','아무것도 하지 않는다'];}
    else if(kind==='negdown'){right=target+'기만 내린다';bad=['청기와 백기를 모두 내린다',other+'기만 내린다','아무것도 하지 않는다'];}
    else{right=target+'기만 올린다';bad=['청기와 백기를 모두 올린다',other+'기만 올린다','아무것도 하지 않는다'];}
    found.push({says,kind,after,prohibition:kind.startsWith('neg'),
       options:[correct(right),...bad.map(wrong)]});
   };
   for(const target of ['청','백']){
    const other=target==='청'?'백':'청';
    if(f[target]==='올림'){
     const to={...f,[target]:'내림'};
     add('down',target,other,to,target+'기 내려.');
     add('negdown',target,other,to,other+'기 내리지 말고 '+target+'기 내려.');
    }else{
     const to={...f,[target]:'올림'};
     add('up',target,other,to,target+'기 올려.');
     add('negup',target,other,to,other+'기 올리지 말고 '+target+'기 올려.');
    }
   }
   if(f.청==='올림'&&f.백==='올림')add('both',null,null,{청:'내림',백:'내림'},'청기 백기 모두 내려.');
   return found;
  };
  for(let attempt=0;attempt<500;attempt++){
   let f={청:'올림',백:'올림'},plan=[];
   for(let i=0;i<v.N;i++){
    const candidates=possibles(f,i===v.N-1);if(!candidates.length)break;
    const weighted=candidates.flatMap(x=>x.prohibition?[x,x,x]:[x]);
    const c=random(weighted);plan.push(c);f=c.after;
   }
   if(plan.length===v.N&&plan.some(x=>x.prohibition)){st.flagsPlan=plan;return;}
  }
  throw Error('청백기 명령 구성이 불가능합니다.');
 }
 function createDoor(st){
  const v=st.vars;v.M=random([1,2]);v['두드림']=0;st.lastOther=null;
  const base=['wave','handle',...Array(v.M).fill('other')];let a;
  do{a=shuffle(base)}while(a[a.length-1]==='wave');
  st.doorPlan=[...a,'wave','exit'];
 }
 function createPaper(st){
  const forms=shuffle(['돛이 접힌','납작한','양끝이 뾰족한','뒤집힌','끝이 말려 올라간']);
  st.known=forms.slice(0,3);st.unknown=forms.slice(3);
  st.seenForms=[];st.previousForm=null;
  st.vars['아는 모양 셋']=shuffle(st.known).join(', ');
  st.vars['아는 모양']=st.known.join(', ');st.vars['모르는 모양']=st.unknown.join(', ');
 }
 function selectPaper(st){
  const seen=st.seenForms,options=[...st.known,...st.unknown].filter(x=>x!==st.previousForm);
  const seenKnown=seen.some(x=>st.known.includes(x)),seenUnknown=seen.some(x=>st.unknown.includes(x));
  let pool;
  if(seen.length===4)pool=seen.filter(x=>x!==st.previousForm);
  else if(seen.length>=2&&!seenKnown)pool=st.known.filter(x=>!seen.includes(x)&&x!==st.previousForm);
  else if(seen.length>=2&&!seenUnknown)pool=st.unknown.filter(x=>!seen.includes(x)&&x!==st.previousForm);
  else if(seen.length>=2&&seenKnown&&seenUnknown&&Math.random()<.42)pool=seen.filter(x=>x!==st.previousForm);
  else pool=options.filter(x=>!seen.includes(x));
  if(!pool||!pool.length)pool=options.filter(x=>!seen.includes(x)).length?options.filter(x=>!seen.includes(x)):seen.filter(x=>x!==st.previousForm);
  const result=random(pool);st.previousForm=result;return result;
 }
 function createBreath(st){
  const v=st.vars;v.N=random([4,5]);v['직전 숨']='';
  st.breathPlan=['들이쉼','멎음','내쉼','멎음'];if(v.N===5)st.breathPlan.push('들이쉼');
 }
 function enter(st,next){
  const id=st.id,d=source.get(id),v=st.vars;
  st.step=next;st.choices023=null;
  if(id===9&&next===0){
   const cmd=st.flagsPlan[st.count];
   v['명령']=cmd.says;v['소리 묘사']=random(['암초에서 낮은 소리가 울린다.','암초 쪽에서 물을 건너 소리가 온다.','암초 한가운데서 소리가 퍼진다.']);
   st.choices023=cmd.options;
  }
  if(id===14&&next===0){
   const type=st.doorPlan[st.count];if(type==='wave')v['소리']='파도 소리';
   else{v['소리']=random(['북소리','노랫소리','쇠 긁는 소리'].filter(x=>x!==st.lastOther));st.lastOther=v['소리'];}
  }
  if(id===49&&next===0){
   const form=selectPaper(st);v['현재']=form;
   v['묘사']=format(random(['{현재} 종이배 하나가 다가온다.','{현재} 종이배 하나가 떠 온다.','{현재} 종이배 하나가 배 곁으로 흘러온다.']),v);
  }
  if(id===50&&next===0){
   st.breath=st.breathPlan[st.count];
   v['현재 장면의 묘사']=random(st.breath==='들이쉼'?
     ['숨을 들이쉬는 소리. 물이 부풀어 오른다.','낮고 긴 숨이 들어온다. 수면이 위로 불룩해진다.','무언가 숨을 크게 들이쉰다. 물이 부푼다.']:
     st.breath==='내쉼'?['숨을 내쉬는 소리. 물이 가라앉는다.','긴 숨이 빠져나간다. 수면이 내려앉는다.','무언가 숨을 길게 내쉰다. 물이 꺼진다.']:
     ['숨소리가 멎었다. 물이 움직이지 않는다.','숨이 끊긴 듯 고요하다. 수면이 그대로다.','숨소리가 뚝 그쳤다. 물이 제자리에 있다.']);
  }
  const sc=d.scenes[next];if(!sc)throw Error('장면이 없습니다: '+id+' '+next);
  st.sceneText=format(sc.text,v);st.order=shuffle((st.choices023||sc.choices).map((_,i)=>i));
 }
 const baseMake=makeStory014;
 makeStory014=function(lake){
  if(!lake||!ids.has(lake.id))return baseMake(lake);
  const id=lake.id,st={id,scripted:true,scriptVersion022:true,scriptVersion023:true,custom023:true,vars:{},turns:0,turnLimit:6,step:0,order:[],count:0};
  if(id===9){createFlags(st);st.turnLimit=st.vars.N+1;}
  else if(id===14){createDoor(st);st.turnLimit=st.doorPlan.length;}
  else if(id===49){createPaper(st);st.turnLimit=6;}
  else if(id===50){createBreath(st);st.turnLimit=st.vars.N+1;}
  let first=0;if(id===14&&st.doorPlan[0]==='handle')first=1;
  enter(st,first);return st;
 };
 const baseChoice=storyChoice014;
 storyChoice014=function(i){
  const st=state.lakeStory,id=state.current;
  if(state.scene!=='event'||!ids.has(id)||!st?.custom023)return baseChoice(i);
  const data=source.get(id),actual=st.order[i],op=(st.choices023||data.scenes[st.step].choices)[actual];
  if(!op)return;
  const oldStep=st.step,v=st.vars;
  let valid=!op.death;
  if(id===9&&oldStep===0)valid=actual===0;
  if(id===14){
   valid=oldStep===0?(v['소리']==='파도 소리'?actual===0:actual===2):
      oldStep===1?actual===0:oldStep===2?actual===0&&v['두드림']===2:valid;
  }
  if(id===49&&oldStep===0)valid=actual===(st.known.includes(v['현재'])?0:1);
  if(id===50&&oldStep===0)valid=actual===(st.breath==='들이쉼'||(st.breath==='멎음'&&v['직전 숨']==='들이쉼')?0:1);
  if(!valid||st.turns>=st.turnLimit)return mermaidDeath015(id);
  if(op.pass&&state.normalMermaidDraw&&!state.mermaidResolved){
   state.mermaidResolved=true;beginBattle({type:'normal',name:'대호수의 인어',power:35+LAKE_BY_ID157.get(id).risk*18,need:1,won:0,history:[],after:'navigation'});return;
  }
  st.turns++;
  if(!state.nav)state.nav={stage:'law',turns:0,transition:false};
  state.nav.turns=st.turns;
  if(op.pass){
   state.nav.transition=true;state.ruleResolved=true;completeLake(true,'호수의 경계를 건넜습니다.');return;
  }
  let next;
  if(id===9){
   const cmd=st.flagsPlan[st.count];v['청']=cmd.after.청;v['백']=cmd.after.백;
   st.count++;next=st.count>=v.N?1:0;
  }else if(id===14){
   if(oldStep===0&&v['소리']==='파도 소리')v['두드림']++;
   st.count++;const type=st.doorPlan[st.count];next=type==='exit'?2:type==='handle'?1:0;
  }else if(id===49){
   const form=v['현재'],repeated=st.seenForms.includes(form);
   st.seenForms.push(form);st.count++;next=repeated?1:0;
  }else if(id===50){
   if(st.breath!=='멎음')v['직전 숨']=st.breath;
   st.count++;next=st.count>=v.N?1:0;
  }
  if(next===undefined)return mermaidDeath015(id);
  enter(st,next);
  dispatchAchievement142('choice',{lake:id,stage:'scene'+oldStep,choice:actual});
  if(state.normalMermaidDraw&&!state.mermaidResolved){
   state.mermaidResolved=true;beginBattle({type:'normal',name:'대호수의 인어',power:35+LAKE_BY_ID157.get(id).risk*18,need:1,won:0,history:[],after:'navigation'});
  }else sync();
 };
 const baseRender=renderScriptedLake015;
 renderScriptedLake015=function(){
  const lake=activeLake(),st=state.lakeStory;
  if(!lake||!ids.has(lake.id)||!st?.custom023)return baseRender();
  const d=source.get(lake.id),sc=d.scenes[st.step],opts=st.choices023||sc.choices;
  return '<div class="inset" style="border-top:4px solid '+d.hex+'">'+
   '<div class="between"><h2>'+esc('21-'+String(lake.id).padStart(2,'0')+' · '+d.name)+'</h2>'+tag('창작 구역')+'</div>'+
   '<p class="muted">'+esc(format(d.description,st.vars))+'</p>'+
   '<div class="inset"><div class="barline"><span>호수 체류</span><span>'+st.turns+' / '+st.turnLimit+'턴</span></div>'+
   '<div class="meter"><span style="width:'+Math.min(100,100*st.turns/st.turnLimit)+'%"></span></div></div>'+
   '<h3>발생 사건</h3><p>'+esc(st.sceneText)+'</p><div class="stack">'+
   st.order.map((j,k)=>button('▸ '+format(opts[j].text,st.vars),'storyChoice',String(k),'')).join('')+
   '</div></div>';
 };
 if(state.scene==='event'&&ids.has(state.current)&&!state.lakeStory?.custom023){
  state.lakeStory=makeStory014(LAKE_BY_ID157.get(state.current));save();
 }
 window.GREAT_LAKE_RULES_023={ids:all.map(x=>x.id),count:50};
})();
