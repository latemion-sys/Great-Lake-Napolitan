/* Source (7): add only missing lake 1/10/100 medals; keep all other achievements. */
(function(){
'use strict';
const defs=window.GREAT_LAKE_SCRIPT_DATA_021, ids=[34,35,36,37,38,39,41,42,43];
const KEY='great-lake-napolitan-new-lake-passes-v021';
let passes={};try{passes=JSON.parse(localStorage.getItem(KEY))||{};}catch(e){}
if(!passes||Array.isArray(passes)||typeof passes!=='object')passes={};
for(const d of defs){
 const prefix='21-'+String(d.id).padStart(2,'0')+' · '+d.name;
 let common=ACH.find(x=>x.id==='lake_'+d.id);
 let hero=ACH.find(x=>x.id==='lake_hero_'+d.id);
 let legend=ACH.find(x=>x.id==='lake_legend_'+d.id);
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
renderHelp=function(){return oldHelp().replace(
 '현재 호수는 총 34개입니다. 21-01부터 21-33까지와 21-40이 등장합니다.',
 '현재 호수는 총 43개입니다. 21-01부터 21-43까지 등장합니다.');};
const oldPlay=renderPlay;
renderPlay=function(){
 const page=oldPlay();
 return state.scene==='port'||state.scene==='start'?page.replaceAll('34개의 서로 다른 호수','43개의 서로 다른 호수'):page;
};
try{localStorage.setItem(KEY,JSON.stringify(passes));}catch(e){}
save();render();
window.GREAT_LAKE_MEDALS_021={newIds:ids,counts:()=>({...passes})};
})();