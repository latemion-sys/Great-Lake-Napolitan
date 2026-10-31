/* 첨부 문서 기준 50개 호수: 1회 일반, 10회 영웅, 100회 전설. 비호수 업적 변경 없음. */
(function lakeMedals023(){
 'use strict';
 const defs=window.GREAT_LAKE_SCRIPT_DATA_023;
 if(!Array.isArray(defs)||defs.length!==50)throw Error('호수별 업적 원문 50개가 누락되었습니다.');
 const KEY='great-lake-napolitan-new-lake-passes-v021';
 let passes={};try{passes=JSON.parse(localStorage.getItem(KEY))||{};}catch(e){}
 if(!passes||Array.isArray(passes)||typeof passes!=='object')passes={};
 const valid=new Set(defs.map(d=>d.id));
 for(const d of defs){
  const prefix=d.id===8?'???':'21-'+String(d.id).padStart(2,'0')+' · '+d.name;
  const ids=['lake_'+d.id,'lake_hero_'+d.id,'lake_legend_'+d.id],medals=[];
  for(const id of ids){
   let medal=ACH.find(x=>x.id===id);
   if(!medal){medal={id};ACH.push(medal);}
   medals.push(medal);
  }
  const [common,hero,legend]=medals;
  Object.assign(common,{tier:'common',name:prefix+' 통과',
    desc:d.id===8?'이름을 붙일 수 없는 수역을 1회 통과한다.':'21-'+String(d.id).padStart(2,'0')+' 호수를 1회 통과한다.',
    check:{kind:'uniqueLake',n:d.id}});
  Object.assign(hero,{tier:'hero',name:prefix+' · 되찾은 항로',
    desc:'해당 호수를 10회 통과한다.',lakeMedal016:true,lakeId016:d.id,required016:10});
  Object.assign(legend,{tier:'legend',name:prefix+' · 백 번의 귀환',
    desc:'해당 호수를 100회 통과한다.',lakeMedal016:true,lakeId016:d.id,required016:100});
  const earned=id=>state.achievements.includes(id)||permanentAchievements.includes(id);
  passes[d.id]=Math.max(0,Math.floor(Number(passes[d.id])||0),
    earned(common.id)?1:0,earned(hero.id)?10:0,earned(legend.id)?100:0);
  if(passes[d.id]>=1)award(common.id);
  if(passes[d.id]>=10)award(hero.id);
  if(passes[d.id]>=100)award(legend.id);
 }
 const seen=new Set();
 for(let i=ACH.length-1;i>=0;i--){
  const a=ACH[i],m=/^lake_(?:(?:hero|legend)_)?(\d+)$/.exec(a.id);
  if(!m)continue;
  if(!valid.has(Number(m[1]))||seen.has(a.id))ACH.splice(i,1);
  else seen.add(a.id);
 }
 const previous=completeLake;
 completeLake=function(success,msg){
  const id=state.current,was=Number(state.count?.lake)||0;
  const result=previous(success,msg);
  if(success&&valid.has(id)&&(Number(state.count?.lake)||0)>was){
   passes[id]=(passes[id]||0)+1;
   if(passes[id]>=1)award('lake_'+id);
   if(passes[id]>=10)award('lake_hero_'+id);
   if(passes[id]>=100)award('lake_legend_'+id);
   try{localStorage.setItem(KEY,JSON.stringify(passes));}catch(e){}
   save();render();
  }
  return result;
 };
 const oldHelp=renderHelp;
 renderHelp=function(){return oldHelp()
  .replace('현재 호수는 총 34개입니다. 21-01부터 21-33까지와 21-40이 등장합니다.','현재 호수는 총 50개입니다. 21-01부터 21-50까지 등장합니다.')
  .replaceAll('현재 호수는 총 43개입니다. 21-01부터 21-43까지 등장합니다.','현재 호수는 총 50개입니다. 21-01부터 21-50까지 등장합니다.')
  .replaceAll('현재 호수는 총 48개입니다. 21-01부터 21-48까지 등장합니다.','현재 호수는 총 50개입니다. 21-01부터 21-50까지 등장합니다.');};
 const oldPlay=renderPlay;
 renderPlay=function(){
  const page=oldPlay();
  if(state.scene!=='port'&&state.scene!=='start')return page;
  return page.replaceAll('34개의 서로 다른 호수','50개의 서로 다른 호수')
   .replaceAll('43개의 서로 다른 호수','50개의 서로 다른 호수')
   .replaceAll('44개의 서로 다른 호수','50개의 서로 다른 호수')
   .replaceAll('48개의 서로 다른 호수','50개의 서로 다른 호수');
 };
 try{localStorage.setItem(KEY,JSON.stringify(passes));}catch(e){}
 save();render();
 window.GREAT_LAKE_MEDALS_023={lakeMedals:150,counts:()=>({...passes})};
})();
