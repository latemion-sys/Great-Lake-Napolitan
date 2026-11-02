/* 2026-11-03 · 바다/민물 실제 어류 수집, 암시장, 정비소·귀항 수입 인상.
   희귀도는 현실 서식·어획·보호 정보에 참고한 게임 출현 등급이며 법적 보호등급 자체는 아닙니다. */
(function(){
'use strict';
if(typeof state==='undefined'||typeof completeLake!=='function'||!window.GREAT_LAKE_WORKSHOP_033)return;
const FISH_GROUPS = [["민물","흔함","붕어 잉어 떡붕어 참붕어 피라미 갈겨니 참갈겨니 끄리 누치 모래무지 돌고기 참마자 돌마자 버들치 버들개 미꾸리 미꾸라지 동사리 가물치 메기 미유기 동자개 대농갱이 꺽지 납자루 납줄개 각시붕어 쉬리 산천어 은어 빙어 황어 뱀장어 배가사리 참종개 송사리 밀어 얼룩동사리"],["민물","드묾","쏘가리 어름치 금강모치 열목어 꺽저기 연준모치 가시고기 잔가시고기 큰가시고기 새코미꾸리 수수미꾸리 쌀미꾸리 기름종개 점줄종개 왕종개 북방종개 눈동자개 칼납자루 납지리 대륙송사리 무태장어 자가사리 대륙종개"],["민물","매우 희귀","감돌고기 가는돌고기 꼬치동자개 미호종개 남방동사리 모래주사 얼룩새코미꾸리 여울마자 임실납자루 좀수수치 퉁사리 흰수마자 꾸구리 돌상어 버들가지 큰줄납자루 한강납줄개 묵납자루 한둑중개 백조어 다묵장어 칠성장어"],["바다","흔함","멸치 정어리 청어 밴댕이 전어 고등어 망치고등어 삼치 꽁치 전갱이 갈치 학공치 날치 도루묵 양미리 임연수어 명태 대구 조피볼락 볼락 황볼락 노랑볼락 쏨뱅이 노래미 쥐노래미 참돔 감성돔 돌돔 벵에돔 농어 점농어 넙치 참가자미 문치가자미 용가자미 기름가자미 물가자미 돌가자미 참조기 부세 보구치 숭어 가숭어 풀망둑 문절망둑 짱뚱어 붕장어 갯장어 쥐치 말쥐치 개볼락 불볼락 홍치 도다리 황돔 보리멸"],["바다","드묾","방어 부시리 잿방어 황다랑어 가다랑어 날개다랑어 점다랑어 백다랑어 자주복 까치복 가시복 은밀복 아귀 황아귀 민어 수조기 강도다리 줄가자미 노랑가자미 능성어 자바리 붉바리 강담돔 긴꼬리벵에돔 혹돔 구갈돔 백미돔 먹갈치 칠성갈치 미거지 괴도라치 벌레문치 개구리꺽정이 도치 꼼치 물메기 참복"],["바다","매우 희귀","참다랑어 개복치 돛새치 황새치 청새치 흑새치 참홍어 노랑가오리 전기가오리 별상어 두툽상어 상어가오리 달고기 물치다래 주황촉수"]];
const FISHES=FISH_GROUPS.flatMap(([water,rarity,items])=>items.trim().split(/\s+/).map(name=>({name,water,rarity})));
const FISH_BY_NAME=new Map(FISHES.map(x=>[x.name,x]));
if(FISH_BY_NAME.size!==FISHES.length||FISHES.length<120||FISHES.some(x=>/고래/.test(x.name)))throw Error('어류 도감 중복·종수·고래 검증 실패');
const FISH_SAVE_KEY='great-lake-napolitan-species-v034';
let ownedNames=[];
try{const data=JSON.parse(localStorage.getItem(FISH_SAVE_KEY)||'[]');if(Array.isArray(data))ownedNames=data.filter(x=>typeof x==='string'&&FISH_BY_NAME.has(x));}catch(e){}
const discovered=new Set(ownedNames);
const RARITIES=[['흔함',70],['드묾',25],['매우 희귀',5]];
function pickFish(){
 const habitat=Math.random()<.5?'민물':'바다';
 let roll=Math.random()*100,rarity='흔함';
 for(const [name,weight] of RARITIES){if((roll-=weight)<0){rarity=name;break;}}
 const options=FISHES.filter(x=>x.water===habitat&&x.rarity===rarity);
 return options[Math.floor(Math.random()*options.length)];
}
function rememberFish(species,addStock,reason){
 if(!species)return;
 if(addStock)state.fish=Math.max(0,Number(state.fish)||0)+1;
 if(!Array.isArray(state.fishCaught034))state.fishCaught034=[];
 state.fishCaught034.unshift(species.name);
 state.fishCaught034.length=Math.min(state.fishCaught034.length,12);
 const newSpecies=!discovered.has(species.name);
 if(newSpecies){discovered.add(species.name);localStorage.setItem(FISH_SAVE_KEY,JSON.stringify([...discovered]));}
 log((reason||'어획')+': '+species.name+' ['+species.water+' · '+species.rarity+']'+(newSpecies?' · 도감 신규 등록':''));
 if(discovered.size>=100)award('fish_100_unique_v034');
}
function acquired(){return [...discovered].filter(x=>FISH_BY_NAME.has(x));}
const SALE_FACTOR=1.5;
const shopGear=typeof SHOP_GEAR_132!=='undefined'?SHOP_GEAR_132:[];
shopGear.forEach(x=>x.cost=Math.ceil(x.cost*SALE_FACTOR));
if(typeof SHOP_REPAIRS_132!=='undefined')SHOP_REPAIRS_132.forEach(x=>x.cost=Math.ceil(x.cost*SALE_FACTOR));
if(typeof SHOP_RECOVERY_132!=='undefined')SHOP_RECOVERY_132.forEach(x=>x.cost=Math.ceil(x.cost*SALE_FACTOR));
if(typeof SHIP148!=='undefined')SHIP148.slice(1).forEach(x=>x.price=Math.ceil(x.price*SALE_FACTOR));
if(typeof KITS148!=='undefined')KITS148.forEach(x=>{x.base*=SALE_FACTOR;x.step*=SALE_FACTOR;});
const stones=window.GREAT_LAKE_WORKSHOP_033.STONES;
stones.forEach(x=>x.cost=Math.ceil(x.cost*SALE_FACTOR));
const prevPrepare=prepareVoyage;
prepareVoyage=function(){
 if(!state.sea)state.lakeAtDeparture034=state.count.lake;
 return prevPrepare.apply(this,arguments);
};
const prevComplete=completeLake;
completeLake=function(success,msg){
 const before=state.count.lake;
 const current=state.current;
 const result=prevComplete.apply(this,arguments);
 if(success&&current!=null&&state.count.lake>before&&state.scene!=='dead'){
  rememberFish(pickFish(),true,'호수 21-'+String(current).padStart(2,'0')+' 통과 어획');
  sync();
 }
 return result;
};
if(typeof sailAction0131==='function'){
 const prevSail=sailAction0131;
 sailAction0131=function(action){
  const count=Number(state.fish)||0;
  const result=prevSail.apply(this,arguments);
  if(action==='fish'&&state.fish>count){
   const gained=state.fish-count;
   for(let i=0;i<gained;i++)rememberFish(pickFish(),false,'그물 어획');
   sync();
  }
  return result;
 };
}
const prevSale=sellFish0131;
sellFish0131=function(){
 const before=state.fish;
 const result=prevSale.apply(this,arguments);
 if(before>0&&state.fish===0)state.fishCaught034=[];
 return result;
};
function marketPrice(){return Math.max(20,Math.ceil(Math.max(0,Number(state.gold)||0)*.2));}
function dockId(){return Math.max(0,Number(state.count?.return)||0);}
function marketReady(){return state.scene==='port'&&!state.sea&&state.blackMarketUsedDock034!==dockId();}
function buyMarket(kind){
 if(!marketReady()||(kind!=='law'&&kind!=='lyric'))return;
 const price=marketPrice();
 if(state.gold<price)return;
 const speeches=window.GREAT_LAKE_TAVERN_SPEECH_029;
 const lakeList=window.GREAT_LAKE_SCRIPT_DATA_024||window.GREAT_LAKE_SCRIPT_DATA_023;
 if(!speeches||!Array.isArray(lakeList)||!lakeList.length)return;
 // 참과 거짓은 같은 말투의 기존 전언 자료에서 무작위로 뽑아 판매합니다.
 const candidates=lakeList.filter(d=>d.id!==8&&speeches[d.id]&&speeches[d.id][kind+'True']&&speeches[d.id][kind+'False']);
 if(!candidates.length)return;
 const d=candidates[Math.floor(Math.random()*candidates.length)];
 const text=speeches[d.id][kind+(Math.random()<.5?'True':'False')];
 state.gold-=price;
 state.blackMarketUsedDock034=dockId();
 state.blackMarketLast034={dock:dockId(),lake:d.id,kind:kind==='law'?'법':'노랫말',text};
 log('암시장에서 '+state.blackMarketLast034.kind+'을(를) 샀습니다. '+unitMoney(price)+' 지불. 진위 불명.');
 sync();
}
function marketPanel(){
 const price=marketPrice(),used=!marketReady();
 let h='<div class="inset"><h3>항구 암시장</h3>'+
  '<p class="muted">정박할 때마다 한 번만 거래할 수 있습니다. 보유 자금의 20%를 내며, 최소 거래 금액은 20만 안입니다. 법과 노랫말의 진위는 알려 주지 않습니다.</p>'+
  tag('현재 거래가 '+unitMoney(price))+
  '<div class="stack">'+
  button(used?'이번 정박 거래 완료':'법 1개 구입 · '+unitMoney(price),'blackMarket034','law','',used||state.gold<price)+
  button(used?'이번 정박 거래 완료':'노랫말 1개 구입 · '+unitMoney(price),'blackMarket034','lyric','',used||state.gold<price)+
  '</div>';
 const last=state.blackMarketLast034;
 if(last&&last.dock===dockId()){
  h+='<div class="rumor"><div class="small">'+last.kind+' · 21-'+String(last.lake).padStart(2,'0')+' · 진위 불명</div><p>“'+esc(last.text)+'”</p></div>';
 }
 return h+'</div>';
}
function catalogPanel(){
 const names=acquired(),fresh=names.filter(n=>FISH_BY_NAME.get(n).water==='민물'),sea=names.filter(n=>FISH_BY_NAME.get(n).water==='바다');
 const listing=names.slice().sort((a,b)=>a.localeCompare(b,'ko')).map(name=>{
  const f=FISH_BY_NAME.get(name);return '<span class="tag" style="display:inline-block;margin:3px">'+esc(f.name)+' · '+f.water+' · '+f.rarity+'</span>';
 }).join('');
 const recent=(state.fishCaught034||[]).map(name=>esc(name)).join(', ');
 return '<div class="inset"><h3>어류 도감</h3>'+
  '<p>채집 확인 '+names.length+' / '+FISHES.length+'종 · 민물 '+fresh.length+'종 · 바다 '+sea.length+'종</p>'+
  '<p class="muted">모든 호수 통과 시 물고기 한 마리를 자동으로 낚습니다. 출현 희귀도는 실제 생태·보호 자료를 참고한 게임용 확률입니다. 처음 낚아 본 종은 사망해도 도감에 남습니다.</p>'+
  (recent?'<p class="small">최근 어획: '+recent+'</p>':'')+
  '<details><summary>확인한 물고기 '+names.length+'종 보기</summary><div style="margin-top:10px">'+(listing||'아직 발견한 어종이 없습니다.')+'</div></details>'+
  '<p class="muted">전설 업적 「나는 100개의 물고기를 안다」 · 서로 다른 100종류 어획</p>'+
 '</div>';
}
const prevRenderPlay=renderPlay;
renderPlay=function(){
 const page=prevRenderPlay.apply(this,arguments);
 if(state.scene!=='port')return page;
 return page+marketPanel()+catalogPanel();
};
document.addEventListener('click',e=>{
 const b=e.target?.closest?.('button[data-act="blackMarket034"]');
 if(!b||b.disabled||busy)return;
 buyMarket(b.dataset.value);
});
if(discovered.size>=100&&!state.achievements.includes('fish_100_unique_v034')){award('fish_100_unique_v034');save();}
window.GREAT_LAKE_FISH_MARKET_034={FISHES,acquired,pickFish,marketPrice,marketReady,buyMarket,rememberFish,SALE_FACTOR};
})();