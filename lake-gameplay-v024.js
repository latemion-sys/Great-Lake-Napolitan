/* 대호수_규칙용.txt 기준: 구전·노랫말 분리, 21-08 네 번 정지 후 통과, 3~6턴 판정. 기타 시스템 유지. */
(function applyLakeRules024(){
 'use strict';
 const defs=window.GREAT_LAKE_SCRIPT_DATA_024;
 if(!Array.isArray(defs)||defs.length!==50)throw Error('첨부한 50개 호수 자료가 올바르지 않습니다.');
 const ids=new Map(defs.map(x=>[x.id,x]));
 const pick=items=>items[rng(items.length)];
 for(const d of defs){
  const lake=LAKE_BY_ID157.get(d.id);
  if(!lake)throw Error('게임에 호수가 없습니다: '+d.id);
  const rule=RULES[lake.rule];
  if(!rule)throw Error('호수의 항해 규칙이 없습니다: '+d.id);
  const lore=[...(d.rumors||[]),...(d.hints||[])].filter(Boolean);
  // 출항 전 구전에는 별도의 전승과 진짜 노랫말만 사용하며, 항해 중 사건 화면에는 출력하지 않습니다.
  rule.truth=()=>pick(lore);
 }
 const beforeMake=makeStory014;
 makeStory014=function(lake){
  if(lake?.id===37){
   const d=ids.get(37),M=rng(2);
   const st={id:37,scripted:true,scriptVersion022:true,rulesRevision024:true,custom37v024:true,
    step:0,turns:0,turnLimit:M+3+rng(4-M),vars:{M,'센 수':pick(['다섯','일곱','열']),
     '거짓 말':pick(['찾았다.','거기 있는 거 다 보여.','이제 나와도 돼.'])},
    plan:M===1?shuffle([1,2]):[1],visited37:0,order:shuffle([0,1,2,3])};
   st.sceneText=String(d.scenes[0].text).replace(/\{([^{}]+)\}/g,(_,k)=>st.vars[k]??'{'+k+'}');
   return st;
  }
  if(!lake||lake.id!==8){
   const original=beforeMake(lake);
   if(original&&[9,14,50].includes(lake?.id)){
    const min=original.turnLimit;
    if(min<3||min>6)throw Error('특수 호수 체류 상한이 범위를 벗어났습니다: '+lake.id);
    original.turnLimit=min+rng(7-min);
   }
   if(original)original.rulesRevision024=true;
   return original;
  }
  const lakeScript=ids.get(8);
  const st={
   id:8,scripted:true,scriptVersion022:true,rulesRevision024:true,custom024:true,
   step:0,turns:0,turnLimit:5+rng(2),waited:0,vars:{},order:[],sceneText:lakeScript.scenes[0].text
  };
  st.order=shuffle([0,1,2,3]);return st;
 };
 const beforeChoice=storyChoice014;
 storyChoice014=function(i){
  const st=state.lakeStory;
  if(state.scene==='event'&&state.current===37&&st?.custom37v024){
   const chosen=st.order[i],prior=st.step;
   if(chosen!==0||st.turns>=st.turnLimit)return mermaidDeath015(37);
   const option=ids.get(37).scenes[st.step].choices[0];
   if(option.pass&&state.normalMermaidDraw&&!state.mermaidResolved){
    state.mermaidResolved=true;
    beginBattle({type:'normal',name:'대호수의 인어',power:35+LAKE_BY_ID157.get(37).risk*18,
     need:1,won:0,history:[],after:'navigation'});return;
   }
   st.turns++;
   if(!state.nav)state.nav={stage:'law',turns:0,transition:false};
   state.nav.turns=st.turns;
   if(option.pass){
    state.nav.transition=true;state.ruleResolved=true;
    completeLake(true,'호수의 경계를 건넜습니다.');return;
   }
   if(prior===0)st.step=st.plan[0];
   else if(prior===1||prior===2){
    st.visited37++;
    st.step=st.visited37>=st.plan.length?3:st.plan[st.visited37];
   }else return mermaidDeath015(37);
   const scene=ids.get(37).scenes[st.step];
   st.sceneText=String(scene.text).replace(/\{([^{}]+)\}/g,(_,k)=>st.vars[k]??'{'+k+'}');
   st.order=shuffle(scene.choices.map((_,j)=>j));
   dispatchAchievement142('choice',{lake:37,stage:'scene'+prior,choice:0});
   if(state.normalMermaidDraw&&!state.mermaidResolved){
    state.mermaidResolved=true;
    beginBattle({type:'normal',name:'대호수의 인어',power:35+LAKE_BY_ID157.get(37).risk*18,
     need:1,won:0,history:[],after:'navigation'});
   }else sync();
   return;
  }
  if(state.scene!=='event'||state.current!==8||!st?.custom024)return beforeChoice(i);
  const d=ids.get(8),selected=st.order[i];
  if(!Number.isInteger(selected))return;
  // 네 번 기다리는 행동 외의 선택은 모두 금기이며, 다섯 번째 행동으로만 호수를 통과합니다.
  if(selected!==0||st.turns>=st.turnLimit)return mermaidDeath015(8);
  if(st.waited>=4&&state.normalMermaidDraw&&!state.mermaidResolved){
   state.mermaidResolved=true;
   beginBattle({type:'normal',name:'대호수의 인어',power:35+LAKE_BY_ID157.get(8).risk*18,
    need:1,won:0,history:[],after:'navigation'});
   return;
  }
  st.turns++;
  if(!state.nav)state.nav={stage:'law',turns:0,transition:false};
  state.nav.turns=st.turns;
  if(st.waited>=4){
   state.nav.transition=true;state.ruleResolved=true;
   log('뱃머리가 다른 물 위로 넘어가자 누군가 고개를 젓는다. 그런 호수는 없잖아.');
   completeLake(true,'호수의 경계를 건넜습니다.');
   return;
  }
  st.waited++;
  dispatchAchievement142('choice',{lake:8,stage:'scene0',choice:0});
  if(state.normalMermaidDraw&&!state.mermaidResolved){
   state.mermaidResolved=true;
   beginBattle({type:'normal',name:'대호수의 인어',power:35+LAKE_BY_ID157.get(8).risk*18,
    need:1,won:0,history:[],after:'navigation'});
  }else sync();
 };
 const beforeRender=renderScriptedLake015;
 renderScriptedLake015=function(){
  const st=state.lakeStory;
  if(state.current!==8||!st?.custom024)return beforeRender();
  const d=ids.get(8),choices=d.scenes[0].choices;
  return '<div class="inset" style="border-top:4px solid '+d.hex+'">'+
   '<div class="between"><h2></h2>'+tag('창작 구역')+'</div>'+
   '<p class="muted">'+esc(d.description)+'</p>'+
   '<div class="inset"><div class="barline"><span>호수 체류</span><span>'+st.turns+' / '+st.turnLimit+'턴</span></div>'+
   '<div class="meter"><span style="width:'+Math.min(100,100*st.turns/st.turnLimit)+'%"></span></div></div>'+
   '<h3>발생 사건</h3><p>'+esc(d.scenes[0].text)+'</p><div class="stack">'+
   st.order.map((j,k)=>button('▸ '+(j===0&&st.waited>=4?'젓는다':choices[j].text),'storyChoice',String(k),'')).join('')+
   '</div></div>';
 };
 if(state.scene==='event'&&ids.has(state.current)&&!state.lakeStory?.rulesRevision024){
  state.lakeStory=makeStory014(LAKE_BY_ID157.get(state.current));
  save();
 }
 window.GREAT_LAKE_RULES_024={count:defs.length,rumorChannels:2,lake08Waits:4};
})();
