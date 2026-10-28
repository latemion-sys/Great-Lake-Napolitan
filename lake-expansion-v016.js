/* v0.1.6.0 · 20개 호수 원문 분기 적용 및 호수별 1/10/100회 업적 */
(function(){
 'use strict';
 const source=window.GREAT_LAKE_SCRIPT_DATA_016;
 if(!Array.isArray(source)||source.length!==20){
  console.error('호수 대본을 불러오지 못했습니다. 원본 게임 상태를 유지합니다.');return;
 }
 const ids=new Set(source.map(d=>d.id));
 const wrongRumors=[
  '이 수역에서 멈추지 않고 젓기만 하면 누구라도 무사히 건넌다고 들었습니다.',
  '물이 달라지더라도 이미 하던 행동을 끝까지 반복해야 한다고 전해집니다.',
  '이곳에선 앞서 떠난 배가 선택한 길만 따라가면 된다는 이야기가 있습니다.'
 ];
 for(const def of source){
  const lake=LAKE_BY_ID157.get(def.id);
  if(!lake||!def.nodes)throw Error('등록되지 않은 호수 번호: '+def.id);
  SCRIPTED_LAKE_MAP_015.set(def.id,def);
  lake.name=def.name;
  lake.hex=def.hex;
  lake.storyNo='21-'+String(def.id).padStart(2,'0');
  lake.mermaid=true;
  const rules=RULES[lake.rule],hints=[...def.hints];
  rules.truth=()=>hints[rng(hints.length)];
  rules.false=()=>wrongRumors[rng(wrongRumors.length)];
 }
 // 원문 공통 지침: 통과 선택을 제외한 정답 경로는 3턴을 넘지 않아야 합니다.
 // 체류 제한은 3~6턴으로 무작위 지정하되, 시작 장면은 3턴 이내에 통과 가능한 곳에서 고릅니다.
 const oldStoryMaker016=makeStory014;
 makeStory014=function(lake){
  const def=SCRIPTED_LAKE_MAP_015.get(lake.id);
  if(!def)return oldStoryMaker016(lake);
  const cap=3+rng(4);
  const choices=Object.keys(def.nodes).filter(step=>lakeMinimumActions015(def,step)<=3);
  if(!choices.length)throw Error('정답 경로가 없는 호수: '+lake.id);
  return{id:lake.id,scripted:true,step:choices[rng(choices.length)],turns:0,turnLimit:cap,result:''};
 };
 // 과거 항해 중 저장된 기존 사건 단계가 원본의 단계 번호와 다르면
 // 해당 호수의 시작 장면을 현재 대본에 맞게 갱신합니다. 선원·자금·등급은 보존합니다.
 if(state.scene==='event'&&ids.has(state.current)){
  const def=SCRIPTED_LAKE_MAP_015.get(state.current),st=state.lakeStory;
  if(!st?.scripted||!def.nodes[st.step]||
   !Number.isInteger(st.turnLimit)||st.turnLimit<3||st.turnLimit>6){
   state.lakeStory=makeStory014(LAKE_BY_ID157.get(state.current));
  }
 }
 const PASSES_KEY_016='great-lake-napolitan-pass-count-by-lake-v016';
 let lakePasses={};
 try{
  const old=JSON.parse(localStorage.getItem(PASSES_KEY_016));
  if(old&&typeof old==='object'&&!Array.isArray(old))lakePasses=old;
 }catch(e){console.warn('호수별 통과 횟수 복구 실패:',e);}
 const safePasses=()=>{for(const d of source){
  const n=Number(lakePasses[d.id]);
  lakePasses[d.id]=Number.isFinite(n)&&n>=0?Math.floor(n):0;
  // 구 버전에는 호수별 누적 통과 횟수가 없었기 때문에 1회 통과 이력만 인정합니다.
  if((state.achievements||[]).includes('lake_'+d.id)||permanentAchievements.includes('lake_'+d.id)){
   lakePasses[d.id]=Math.max(1,lakePasses[d.id]);
  }
 }};
 safePasses();
 const persist=()=>{
  try{localStorage.setItem(PASSES_KEY_016,JSON.stringify(lakePasses));}
  catch(e){console.warn('호수별 통과 횟수 저장 실패:',e);}
 };
 // 호수 장면이나 번호를 직접 지정하는 구형 부가 업적은 제거하고
 // 해당 호수 1회/10회/100회 통과 업적만 둡니다. 일반 항해·재앙 업적은 그대로 유지합니다.
 const obsolete=new Set();
 for(let i=ACH.length-1;i>=0;i--){
  const medal=ACH[i];
  const byLake=medal.challenge&&Number.isInteger(medal.challenge.lake);
  const oldPerLake=/^extra_lake_\d+$/.test(medal.id);
  if(byLake||oldPerLake){obsolete.add(medal.id);ACH.splice(i,1);}
 }
 for(const d of source){
  const num=String(d.id).padStart(2,'0'),full='21-'+num+(d.name?' · '+d.name:'');
  let ordinary=ACH.find(a=>a.id==='lake_'+d.id);
  if(!ordinary){
   ordinary={id:'lake_'+d.id,tier:'common',name:full+' 통과',desc:'21-'+num+' 호수를 1회 통과한다.'};
   ACH.push(ordinary);
  }else{
   ordinary.name=full+' 통과';
   ordinary.tier='common';
   ordinary.desc='21-'+num+' 호수를 1회 통과한다.';
   ordinary.check={kind:'uniqueLake',n:d.id};
   delete ordinary.challenge;
  }
  ACH.push({id:'lake_hero_'+d.id,tier:'hero',name:full+' · 되찾은 항로',
   desc:'21-'+num+' 호수를 누적 10회 통과한다.',lakeMedal016:true,lakeId016:d.id,required016:10});
  ACH.push({id:'lake_legend_'+d.id,tier:'legend',name:full+' · 백 번의 귀환',
   desc:'21-'+num+' 호수를 누적 100회 통과한다.',lakeMedal016:true,lakeId016:d.id,required016:100});
 }
 if(obsolete.size){
  state.achievements=(state.achievements||[]).filter(id=>!obsolete.has(id));
  permanentAchievements=permanentAchievements.filter(id=>!obsolete.has(id));
  if(obsolete.has(state.equippedTitle))state.equippedTitle='';
 }
 // 마이그레이션: 기존 1회 통과 업적만 있더라도 한 번은 통과한 것으로 계산합니다.
 for(const d of source){
  if(lakePasses[d.id]>=1)award('lake_'+d.id);
  if(lakePasses[d.id]>=10)award('lake_hero_'+d.id);
  if(lakePasses[d.id]>=100)award('lake_legend_'+d.id);
 }
 const priorLakeComplete016=completeLake;
 completeLake=function(success,msg){
  const id=state.current,old=state.count?.lake||0;
  const answer=priorLakeComplete016(success,msg);
  if(success&&ids.has(id)&&(state.count?.lake||0)>old){
   lakePasses[id]=(lakePasses[id]||0)+1;
   if(lakePasses[id]>=1)award('lake_'+id);
   if(lakePasses[id]>=10)award('lake_hero_'+id);
   if(lakePasses[id]>=100)award('lake_legend_'+id);
   persist();save();render();
  }
  return answer;
 };
 // 영웅·전설의 미달성 칸에는 이름도 조건도 보이지 않도록 합니다.
 const priorRenderAch016=renderAch;
 renderAch=function(){
  const renamed=[];
  for(const medal of ACH){
   if(medal.lakeMedal016&&!state.achievements.includes(medal.id)){
    renamed.push([medal,medal.name]);medal.name='???';
   }
  }
  try{return priorRenderAch016();}
  finally{for(const [medal,name] of renamed)medal.name=name;}
 };
 const priorHelp016=renderHelp;
 renderHelp=function(){
  return priorHelp016()
   .replace('항해 안내 · v0.1.5.8','항해 안내 · v0.1.6.0')
   .replace(/현재 항해 가능 호수는 총 15개입니다\.[^<]*/,'현재 항해 가능 호수는 총 20개입니다. 21-01부터 21-19까지와 21-40이 등장합니다. 선장 등급별 접근 호수 수는 4 / 8 / 12 / 16 / 20개이며 출항마다 무작위로 정해집니다.')
   .replace('15개 호수 중 하나','20개 호수 중 하나')
   .replace('각 호수에서는 인어를 만날 가능성이 있습니다.','각 호수 입장 시 인어 조우 확률은 20%입니다.');
 };
 const priorPlay016=renderPlay;
 renderPlay=function(){
  const page=priorPlay016();
  if(state.scene==='port')
   return page.replaceAll('15개의 서로 다른 호수','20개의 서로 다른 호수').replaceAll('재앙의 고래 다섯 마리 역시 매 출항마다 서로 다른 호수로 이동합니다.','재앙의 고래는 사냥되지 않은 개체 중 한 마리가 매 출항마다 무작위 호수에 배치됩니다.');
  if(state.scene==='start'){
   return page.replace(/<div class="log-update">[\s\S]*?<\/div>/g,'')+
    '<div class="log-update"><h3>V.0.1.6.0 · 호수 20개와 호수별 업적</h3><ul>'+
    '<li>21-01부터 21-19, 21-40까지 총 20개 호수의 장면과 선택지를 적용했습니다.</li>'+
    '<li>21-18과 21-19의 미작성 선택지는 핵심 규칙을 바탕으로 새로 제작했습니다.</li>'+
    '<li>호수별 일반·영웅·전설 업적을 각각 1회·10회·100회 통과로 변경했습니다.</li>'+
    '<li>영웅·전설 호수 업적은 달성하기 전까지 이름과 조건이 공개되지 않습니다.</li></ul></div>';
  }
  return page;
 };
 // 출항 중이던 기존 플레이어는 보유한 자원을 유지합니다.
 persist();save();
 if(state.scene==='route'&&state.sea&&state.routeChoiceCount>0)autoLake0131();else render();
 window.GREAT_LAKE_PATCH_016={count:()=>Object.fromEntries(source.map(d=>[d.id,lakePasses[d.id]])),total:source.length};
})();
