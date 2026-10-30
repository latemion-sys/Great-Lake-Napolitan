/* Source (8): one set of 1/10/100 completion medals per 44 lakes. */
(function(){
'use strict';
const defs=window.GREAT_LAKE_SCRIPT_DATA_021, ids=[34,35,36,37,38,39,41,42,43,44];
const KEY='great-lake-napolitan-new-lake-passes-v021';
let passes={};try{passes=JSON.parse(localStorage.getItem(KEY))||{};}catch(e){}
if(!passes||Array.isArray(passes)||typeof passes!=='object')passes={};
for(const d of defs){
 const prefix=d.id===8?'???':'21-'+String(d.id).padStart(2,'0')+' · '+d.name;
 let common=ACH.find(x=>x.id==='lake_'+d.id);
 let hero=ACH.find(x=>x.id==='lake_hero_'+d.id);
 let legend=ACH.find(x=>x.id==='lake_legend_'+d.id);
 // 과거 버전의 세 단계 중 하나라도 빠져 있으면 같은 ID로 보완합니다.
 if(!common){common={id:'lake_'+d.id};ACH.push(common);}
 if(!hero){hero={id:'lake_hero_'+d.id};ACH.push(hero);}
 if(!legend){legend={id:'lake_legend_'+d.id};ACH.push(legend);}
 Object.assign(common,{tier:'common',name:prefix+' 통과',
  desc:d.id===8?'이름을 붙일 수 없는 수역을 통과한다.':'21-'+String(d.id).padStart(2,'0')+' 호수를 1회 통과한다.',
  check:{kind:'uniqueLake',n:d.id}});
 Object.assign(hero,{tier:'hero',name:prefix+' · 되찾은 항로',
  desc:'해당 호수를 10회 통과한다.',lakeMedal016:true,lakeId016:d.id,required016:10});
 Object.assign(legend,{tier:'legend',name:prefix+' · 백 번의 귀환',
  desc:'해당 호수를 100회 통과한다.',lakeMedal016:true,lakeId016:d.id,required016:100});
 if(ids.includes(d.id)){
  if(!common){common={id:'lake_'+d.id,tier:'common',
    name:prefix+' 통과',desc:'21-'+String(d.id).padStart(2,'0')+' 호수를 1회 통과한다.',
    check:{kind:'uniqueLake',n:d.id}};ACH.push(common);}
  if(!hero){hero={id:'lake_hero_'+d.id,tier:'hero',
    name:prefix+' · 되찾은 항로',desc:'해당 호수를 10회 통과한다.',
    lakeMedal016:true,lakeId016:d.id,required016:10};ACH.push(hero);}
  if(!legend){legend={id:'lake_legend_'+d.id,tier:'legend',
    name:prefix+' · 백 번의 귀환',desc:'해당 호수를 100회 통과한다.',
    lakeMedal016:true,lakeId016:d.id,required016:100};ACH.push(legend);}
  passes[d.id]=Math.max(0,Math.floor(Number(passes[d.id])||0),
    state.achievements.includes(common.id)||permanentAchievements.includes(common.id)?1:0);
  if(passes[d.id]>=1)award(common.id);
  if(passes[d.id]>=10)award(hero.id);
  if(passes[d.id]>=100)award(legend.id);
 }else{
  // Rename only the existing lake-specific badges when the lake source renamed them.
  if(common&&common.name?.startsWith('21-'))common.name=prefix+' 통과';
  if(hero&&hero.name?.startsWith('21-'))hero.name=prefix+' · 되찾은 항로';
  if(legend&&legend.name?.startsWith('21-'))legend.name=prefix+' · 백 번의 귀환';
 }
}
// 호수가 존재하지 않는 구판에서 남은 미사용 호수 업적 및 중복만 정리합니다.
const definedIds=new Set(defs.map(d=>d.id)),seen=new Set();
for(let i=ACH.length-1;i>=0;i--){
 const a=ACH[i],m=/^lake_(?:(?:hero|legend)_)?(\d+)$/.exec(a.id);
 if(!m)continue;
 if(!definedIds.has(Number(m[1]))||seen.has(a.id)){ACH.splice(i,1);continue;}
 seen.add(a.id);
}
const previous=completeLake;
completeLake=function(success,msg){
 const id=state.current,n=state.count?.lake||0;
 const result=previous(success,msg);
 if(success&&ids.includes(id)&&(state.count?.lake||0)>n){
  passes[id]=(passes[id]||0)+1;
  award('lake_'+id);
  if(passes[id]>=10)award('lake_hero_'+id);
  if(passes[id]>=100)award('lake_legend_'+id);
  try{localStorage.setItem(KEY,JSON.stringify(passes));}catch(e){}
  save();render();
 }
 return result;
};
const oldHelp=renderHelp;
renderHelp=function(){return oldHelp()
 .replace('현재 호수는 총 34개입니다. 21-01부터 21-33까지와 21-40이 등장합니다.',
  '현재 호수는 총 44개입니다. 21-01부터 21-44까지 등장합니다.')
 .replaceAll('현재 호수는 총 43개입니다. 21-01부터 21-43까지 등장합니다.',
  '현재 호수는 총 44개입니다. 21-01부터 21-44까지 등장합니다.');};
const oldPlay=renderPlay;
renderPlay=function(){
 const page=oldPlay();
 return state.scene==='port'||state.scene==='start'?page.replaceAll('34개의 서로 다른 호수','44개의 서로 다른 호수').replaceAll('43개의 서로 다른 호수','44개의 서로 다른 호수'):page;
};
try{localStorage.setItem(KEY,JSON.stringify(passes));}catch(e){}
save();render();
window.GREAT_LAKE_MEDALS_021={newIds:ids,counts:()=>({...passes})};
})();