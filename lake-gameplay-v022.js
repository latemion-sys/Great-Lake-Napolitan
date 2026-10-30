/* 대호수 수정본 48호수: 장면·분기·체류 턴 실제 적용 */
(function lakeRevision022(){
 'use strict';
 const raw=window.GREAT_LAKE_SCRIPT_DATA_022;
 if(!Array.isArray(raw)||raw.length!==48)throw Error('호수 수정본 48개가 없습니다.');
 const defs=new Map(raw.map(d=>[d.id,d])), pick=a=>a[rng(a.length)], side=()=>pick(['왼쪽','오른쪽']);
 const opposite=x=>x==='왼쪽'?'오른쪽':x==='오른쪽'?'왼쪽':'앞쪽';
 const format=(input,v)=>String(input||'').replace(/\{([^}]+)\}/g,(_,k)=>String(v[k]??''));
 const limits={7:4,11:4,12:4,13:4,16:4,19:4,23:4,30:4,38:4,39:4,42:4,44:4};
 for(const d of raw){
  if(typeof TEST_LAKE_IDS154!=='undefined')TEST_LAKE_IDS154.add(d.id);
  let lake=LAKE_BY_ID157.get(d.id);
  if(!lake){
   lake={id:d.id,name:d.name,hex:d.hex,hue:0,material:0,zone:0,rule:RULES.length,risk:1+(d.id*17+3)%4,limit:6,mermaid:true,required:false,storyNo:'21-'+String(d.id).padStart(2,'0')};
   LAKES.push(lake);LAKE_BY_ID157.set(d.id,lake);
   RULES.push({title:d.name,truth:()=>d.hints[0]||'',false:()=> '먼 곳의 뱃사람들은 이곳에서 끝까지 기다리라고 말합니다.',event:()=>'',options:[],effects:[],special:null});
  }
  Object.assign(lake,{name:d.name,hex:d.hex,mermaid:true,storyNo:'21-'+String(d.id).padStart(2,'0')});
  RULES[lake.rule].truth=()=>d.hints.length?pick(d.hints):'';
  const old=SCRIPTED_LAKE_MAP_015.get(d.id)||{id:d.id};
  Object.assign(old,{name:d.name,description:d.description,hints:d.hints,law:d.law,hex:d.hex,
   nodes:Object.fromEntries(d.scenes.map((s,i)=>['scene'+i,{text:s.text,scripted:true,choices:s.choices.map(o=>({text:o.text,death:o.death,pass:o.pass}))}]))});
  SCRIPTED_LAKE_MAP_015.set(d.id,old);
 }
 function seed(st){
  const id=st.id,v=st.vars,dirs=['왼쪽','오른쪽'],full=['왼쪽','앞쪽','오른쪽'];
  if([9,14,17,19,31,32,33,34,35,36,37,45,47,48].includes(id))v.N=([45,48].includes(id)?pick([3,4]):id===19||id===39||id===42?3:pick([2,3]));
  if(id===39||id===42)v.N=3;
  if(id===36)v.N=pick([2,3]);
  if(id===46){v.M=2;v['건네는 것']=pick(['검은 고체','흰 액체']);}
  if(id===25||id===29)v.N=pick([2,3]);
  if(id===6||id===41){
   const ends=['갈라진','깨진','둥글게 닳은','멀쩡한'];
   v['끝']=pick(ends);v['다른 끝']=pick(ends.filter(x=>x!==v['끝']));
   v['천']=pick(['검은','붉은','흰','푸른']);v['다른 물건']=pick(['그물','밧줄','닻']);
  }
  if(id===14)v['우리 색']=pick(['붉은','푸른','노란']);
  if(id===23)bellOrder(st);
  if(id===26)v['내 자리']=pick(['뱃머리','가운데','고물']);
  if(id===27){v['도는 쪽']=side();v['반대쪽']=opposite(v['도는 쪽']);}
  if(id===30){v['틈 쪽']=side();v['반대쪽']=opposite(v['틈 쪽']);}
  if(id===31)v['궤짝 쪽']='가운데';
  if(id===46)st.plan=shuffle([1,2]);
  if([34,39,42].includes(id))st.plan=shuffle(id===34?[0,1]:[0,1,2]);
  if(id===37||id===47)st.plan=shuffle([0,1]);
  if(id===45){
   const order=shuffle([0,1,2]);if(v.N===4)order.splice(2,0,order[0]);st.plan=order;
  }
  if(id===48)st.straightAfter=1+rng(v.N-1);
 }
 function bellOrder(st){
  const q=shuffle(['큰','가운데','작은']);['첫째','둘째','셋째'].forEach((k,i)=>st.vars[k]=q[i]);
 }
 function enter(st,index){
  const v=st.vars,id=st.id;
  if([9,14,17,35,39].includes(id)){v['쪽']=side();v['반대쪽']=opposite(v['쪽']);}
  if(id===6)v['손잡이 천']=pick([v['천'],...['검은','붉은','흰','푸른'].filter(x=>x!==v['천'])]);
  if(id===14){
   const same=st.count===0?Math.random()<.5:!st.seen.same?true:!st.seen.diff?false:Math.random()<.5;
   v['색']=same?v['우리 색']:pick(['붉은','푸른','노란'].filter(x=>x!==v['우리 색']));
  }
  if(id===22){
   const colors=shuffle(['붉은','푸른','노란']);v['빛1']=colors[0];v['빛2']=colors[1];
   const names={'붉은,푸른':'보랏빛','노란,붉은':'주황빛','노란,푸른':'초록빛'};
   v['섞인 빛']=names[[v['빛1'],v['빛2']].sort().join(',')]||'보랏빛';
  }
  if(id===26){
   v['선원 자리']=pick(['뱃머리','가운데','고물'].filter(x=>x!==v['내 자리']));
   v['없는 자리']=pick(['돛대 꼭대기','뱃전 바깥','배 밑']);
  }
  if(id===28){
   v['참 쪽']=pick(['왼쪽','앞쪽','오른쪽']);v['거짓 쪽']=pick(['왼쪽','앞쪽','오른쪽']);
   const rest=['왼쪽','앞쪽','오른쪽'].filter(x=>x!==v['참 쪽']);
   v['다른 쪽1']=rest[0];v['다른 쪽2']=rest[1];
  }
  if(id===31){if(!v['낮은 쪽']){v['낮은 쪽']=side();v['높은 쪽']=opposite(v['낮은 쪽']);}v['반대쪽']=opposite(v['궤짝 쪽']);}
  if(id===32)v['말']=pick(['다 왔다.','앞을 봐.','조금만 더 왼쪽.']);
  if(id===33)v['쪽']=pick(['왼쪽','오른쪽','뒤쪽']);
  if(id===34){
   v['길잡이 모습']=pick(['물결에 흔들리며 종이 운다','멎은 채 종도 조용하다']);
   v['아닌 모습']=pick(['흔들리지 않는데 종이 운다','물결에 흔들리는데 종이 울지 않는다']);
  }
  if(id===36){
   v['물 끝 쪽']=pick(['왼쪽','앞쪽','오른쪽']);
   v['다른 쪽']=pick(['왼쪽','앞쪽','오른쪽'].filter(x=>x!==v['물 끝 쪽']));
   v['가까운 쪽']=pick(['왼쪽','앞쪽','오른쪽'].filter(x=>x!==v['물 끝 쪽']));
   v['지연']=['한참 뒤에','조금 뒤에','금방'][Math.min(st.count,2)];
  }
  if(id===37){
   const dirs=shuffle(['왼쪽','가운데','오른쪽']);
   v['빠른 쪽']=dirs[0];v['느린 쪽']=dirs[1];v['중간 쪽']=dirs[2];
  }
  if(id===42)v['색']=pick(['붉은','흰']);
  if(id===45){
   v['빛 묘사']=pick(['물 위로 흰빛이 번쩍 퍼진다.','수면이 한꺼번에 하얗게 달아오른다.','먼 물 끝에서 눈부신 빛이 밀려온다.']);
   v['소리 묘사']=pick(['물 어딘가에서 낮은 울림이 올라온다.','수면이 길게 웅웅 운다.','먼 데서 둥근 소리가 물을 타고 온다.']);
   v['냄새 묘사']=pick(['물에서 비릿한 냄새가 올라온다.','달큰한 냄새가 수면 위로 번진다.','눅눅한 냄새가 물 위에 낮게 깔린다.']);
  }
  if(id===47)v['어둠 묘사']=pick(['뒤쪽에서 불빛이 하나씩 꺼지며 어둠이 다가온다. 꺼지는 자리가 바짝 붙었다.','뒤쪽 불빛이 꺼지는 것이 뜸해진다. 어둠이 멀어진 듯하다.','뒤쪽에서 불빛이 한꺼번에 꺼진다. 어둠이 성큼 다가선다.']);
  if(id===48){
   v['넓은 쪽']=side();
   v['갈림 묘사']=format(pick(['앞쪽 물길이 둘로 갈라진다. 두 갈래 모두 고요하다.','물이 가운데에서 나뉜다. {넓은 쪽} 갈래가 조금 더 넓다.','앞에서 길이 나뉜다. 두 갈래의 물빛이 같다.']),v);
  }
  const scene=defs.get(id).scenes[index];
  if(!scene)throw Error('호수 장면 없음: '+id+'-'+index);
  st.step=index;st.order=shuffle(scene.choices.map((_,i)=>i));st.sceneText=format(scene.text,v);
 }
 const priorMake=makeStory014;
 makeStory014=function(lake){
  if(!defs.has(lake?.id))return priorMake(lake);
  const id=lake.id,st={id,scripted:true,scriptVersion022:true,step:0,turns:0,turnLimit:6,vars:{},order:[],count:0,seen:{},done38:0,plan:[],lastSide:null,straightUsed:false};
  seed(st);
  const v=st.vars,N=v.N;
  let min=limits[id]||3;
  if([9,14,17,33,34,35,37,39,42,47].includes(id))min=Math.max(min,(N||2)+1);
  if([29,31,32,36,48].includes(id))min=N+2;
  if(id===45)min=N+1;
  if(id===46)min=6;
  if(id===5)min=3;
  if(id===41)min=4;
  st.turnLimit=min+rng(Math.max(1,7-min));
  let first=0;
  if(id===5||id===20)first=rng(defs.get(id).scenes.length);
  else if([1,2,3,4,6,7,8,10,18,21,22,24,26,27,28,33,40,41,43].includes(id))first=pick([0,0,1].filter(x=>x<defs.get(id).scenes.length));
  else if(id===14)first=0;
  else if([17,34,37,39,42,45,47].includes(id))first=st.plan[0]??0;
  else if(id===35)first=rng(3);
  enter(st,first);
  return st;
 };
 const priorChoice=storyChoice014;
 storyChoice014=function(i){
  const id=state.current,st=state.lakeStory;
  if(!defs.has(id)||state.scene!=='event'||!st?.scriptVersion022)return priorChoice(i);
  const scene=defs.get(id).scenes[st.step],actual=st.order[i],op=scene?.choices[actual];
  if(!op)return;
  let valid=!op.death, next=op.targets.find(x=>x!==st.step)??op.targets[0];
  const prior=st.step,v=st.vars,N=v.N||2;
  if(id===14&&prior===0){valid=(actual===(v['색']===v['우리 색']?0:1));}
  if(id===48&&prior===0){
   valid=actual<2&&(st.lastSide===null||(actual===0?'왼쪽':'오른쪽')!==st.lastSide);
  }
  if(!valid)return mermaidDeath015(id);
  if(op.pass&&state.normalMermaidDraw&&!state.mermaidResolved){
   state.mermaidResolved=true;beginBattle({type:'normal',name:'대호수의 인어',power:35+LAKE_BY_ID157.get(id).risk*18,need:1,won:0,history:[],after:'navigation'});return;
  }
  st.turns++;
  if(st.turns>st.turnLimit)return mermaidDeath015(id);
  if(!state.nav)state.nav={stage:'law',turns:0,transition:false};
  state.nav.turns=st.turns;
  if(op.pass){
   if(id===8)log('다른 물로 넘어왔다. 그런 번호의 호수는 없잖아.');
   state.nav.transition=true;state.ruleResolved=true;
   completeLake(true,'호수의 경계를 건넜습니다.');return;
  }
  if(id===5&&prior<3){
   st.count++;const remain=st.turnLimit-st.turns,chance=Math.min(.9,.22+.19*st.count);
   next=remain<=1||Math.random()<chance?3:pick([0,1,2].filter(x=>x!==prior));
  }else if(id===9){st.count++;next=st.count>=N?1:0;}
  else if(id===12&&prior===0){st.count++;next=st.count>=2?4:0;}
  else if(id===13&&(prior===0||prior===1)){
   st.count++;next=st.count>=2?2:pick([0,1]);
  }else if(id===14&&prior===0){
   st.seen[v['색']===v['우리 색']?'same':'diff']=true;st.count++;
   next=st.count>=N?1:0;
  }else if(id===17&&prior<2){
   st.count++;next=st.count>=N?2:1-prior;
  }else if(id===19&&prior<3){
   st.count++;next=st.count>=3?3:pick([0,1,2].filter(x=>x!==prior));
  }else if(id===23){
   if(op.result.includes('순서를 새로 정한다')){bellOrder(st);next=0;}
  }else if(id===27&&prior===1&&actual===1){
   v['도는 쪽']=opposite(v['도는 쪽']);v['반대쪽']=opposite(v['도는 쪽']);next=2;
  }else if(id===29){
   if(prior===0||prior===1){
    st.count++;
    next=st.count>=N?3:st.count===1&&N===2&&Math.random()<.5?2:1;
   }
  }else if(id===31&&prior<2){
   if(prior===0)v['궤짝 쪽']=v['높은 쪽'];
   st.count++;
   if(st.count>=N)next=2;
   else{
    const nextLow=side(),nextHigh=opposite(nextLow);
    next=v['궤짝 쪽']===nextHigh?1:0;
    v['낮은 쪽']=nextLow;v['높은 쪽']=nextHigh;
   }
  }else if(id===32){
   if(prior===0){next=pick([1,2,3]);}
   else if(prior<4){st.count++;next=st.count>=N?4:pick([1,2,3].filter(x=>x!==prior));}
  }else if(id===33&&prior<2){
   st.count++;next=st.count>=N?2:1-prior;
  }else if(id===34&&prior<2){
   st.count++;next=st.count>=N?2:1-prior;
  }else if(id===35&&prior<3){
   st.count++;next=st.count>=N?3:pick([0,1,2].filter(x=>x!==prior));
  }else if(id===36){
   if(prior===0)next=pick([1,2]);
   else if(prior===1||prior===2){
    st.seen[prior]=true;st.count++;
    next=st.count>=N?3:!st.seen[2]?2:1;
   }
  }else if(id===37&&prior<2){
   st.count++;next=st.count>=N?2:1-prior;
  }else if(id===38){
   if(prior===0){
    st.done38++;next=st.done38>=2?2:(!st.seen.fake38&&st.turnLimit-st.turns>=3&&Math.random()<.5?1:0);
    if(next===1)st.seen.fake38=true;
   }else if(prior===1)next=0;
  }else if([39,42].includes(id)&&prior<3){
   st.count++;next=st.count>=3?3:st.plan[st.count];
  }else if(id===45&&prior<3){
   st.count++;next=st.count>=N?3:st.plan[st.count];
  }else if(id===46){
   if(prior===0)next=st.plan[0];
   else if(prior===1||prior===2){
    st.count++;next=st.count===1?st.plan[1]:(v['건네는 것']==='검은 고체'?3:4);
   }else if(prior===3)next=5;
   else if(prior===4||prior===5)next=6;
  }else if(id===47&&prior<2){
   st.count++;next=st.count>=N?2:1-prior;
  }else if(id===48){
   if(prior===0){
    st.lastSide=actual===0?'왼쪽':'오른쪽';st.count++;
    next=st.count>=N?2:!st.straightUsed&&st.count===st.straightAfter?1:0;
   }else if(prior===1){st.straightUsed=true;next=0;}
  }
  if(next===undefined||!defs.get(id).scenes[next])return mermaidDeath015(id);
  enter(st,next);
  dispatchAchievement142('choice',{lake:id,stage:'scene'+prior,choice:actual});
  if(state.normalMermaidDraw&&!state.mermaidResolved){
   state.mermaidResolved=true;beginBattle({type:'normal',name:'대호수의 인어',power:35+LAKE_BY_ID157.get(id).risk*18,need:1,won:0,history:[],after:'navigation'});
  }else sync();
 };
 const priorRender=renderScriptedLake015;
 renderScriptedLake015=function(){
  const l=activeLake(),st=state.lakeStory;
  if(!l||!defs.has(l.id)||!st?.scriptVersion022)return priorRender();
  const d=defs.get(l.id),scene=d.scenes[st.step],title=l.id===8?'':'21-'+String(l.id).padStart(2,'0')+' · '+d.name;
  return '<div class="inset" style="border-top:4px solid '+d.hex+'">'+
   '<div class="between"><h2>'+esc(title)+'</h2>'+tag('창작 구역')+'</div>'+
   '<p class="muted">'+esc(format(d.description,st.vars))+'</p>'+
   '<div class="inset"><div class="barline"><span>호수 체류</span><span>'+st.turns+' / '+st.turnLimit+'턴</span></div>'+
   '<div class="meter"><span style="width:'+Math.min(100,100*st.turns/st.turnLimit)+'%"></span></div></div>'+
   '<h3>발생 사건</h3><p>'+esc(st.sceneText)+'</p><div class="stack">'+
   st.order.map((j,k)=>button('▸ '+format(scene.choices[j].text,st.vars),'storyChoice',String(k),'')).join('')+
   '</div></div>';
 };
 if(state.scene==='event'&&defs.has(state.current)&&!state.lakeStory?.scriptVersion022){
  state.lakeStory=makeStory014(LAKE_BY_ID157.get(state.current));save();
 }
 window.GREAT_LAKE_RULES_022={ids:[...defs.keys()],count:defs.size,make:makeStory014};
})();
