/* V.0.1.6.1 · 업적 재편성: 등급별 독립 목표, 중복 제거, 누적 실적 */
(function(){
 'use strict';
 const RETIRED=new Set([
  'extra_oilCollected_0','extra_oilCollected_1','extra_oilCollected_2',
  'extra_oilCollected_3','extra_oilCollected_4',
  'extra_goldPeak_2','extra_goldPeak_3','extra_goldPeak_4',
  'fresh_rumor_paid50','fresh_rumor_grade5','fresh_fish_trade_small'
 ]);
 const TIERS=['common','rare','hero','legend','myth','miracle','unique'];
 for(let i=ACH.length-1;i>=0;i--)if(RETIRED.has(ACH[i].id))ACH.splice(i,1);
 state.achievements=(state.achievements||[]).filter(id=>!RETIRED.has(id));
 permanentAchievements=permanentAchievements.filter(id=>!RETIRED.has(id));
 if(RETIRED.has(state.equippedTitle))state.equippedTitle='';
 for(const id of RETIRED)delete HIGH_REQUIREMENTS152[id];
 // 쉬운 구매와 고용이 신화·전설이었던 문제를 바로잡습니다.
 const NEW_TIER={
  extra_goldPeak_10:'common',extra_goldPeak_11:'common',
  extra_goldPeak_12:'rare',extra_goldPeak_13:'common',
  extra_goldPeak_14:'rare',extra_goldPeak_15:'rare',
  extra_goldPeak_16:'rare',extra_goldPeak_17:'rare',
  fresh_promote_2:'common',fresh_crew_rename:'common',
  extra_fishSold_0:'rare',extra_fishSold_2:'rare',
  extra_fishSold_3:'rare',extra_fishSold_4:'rare',extra_fishSold_5:'rare',
  extra_oilCollected_5:'hero',lake10:'common',extra_oilCollected_6:'hero',
  extra_oilCollected_7:'hero',extra_oilCollected_8:'hero',extra_oilCollected_9:'hero',
  extra_oilCollected_11:'rare',extra_oilCollected_14:'rare',
  extra_oilCollected_15:'rare',extra_oilCollected_16:'hero',extra_oilCollected_13:'common',
  extra_fishSold_11:'legend',extra_fishSold_13:'legend',fresh_sail_deep:'myth'
 };
 for(const a of ACH){
  if(NEW_TIER[a.id])a.tier=NEW_TIER[a.id];
  if(a.challenge?.event==='voyageEnd'&&a.challenge.grade>=3&&a.challenge.minVisited>=10){
   a.challenge.minVisited=LAKE_CAP[a.challenge.grade];
   const fmt=achievementReadableCondition142(a.challenge);
   if(fmt)a.desc=fmt.replace(/선체 내구도/g,'침식 방어도');
  }
 }
 const definitions=[];
 function goal(id,tier,name,desc,condition){
  definitions.push({id:'progress_161_'+id,tier,name,desc,goal161:condition});
 }
 const metrics=[
 // 같은 분야를 쪼개어 매 단계마다 수십 개를 얻는 구조 대신, 대표 목표만 둡니다.
 ['common','two_departs','처음 맡은 두 항로','누적 2회 출항한다.','voyages',2],
 ['common','two_returns','두 번의 생환','누적 2회 귀항한다.','returns',2],
 ['common','ten_rumors','뱃사람들의 말','누적 10회 전언을 듣는다.','rumors',10],
 ['common','first_paid','돈을 낸 귀','유료 전언을 1회 듣는다.','paidRumors',1],
 ['common','three_sales','항구의 단골','물고기 판매를 누적 3회 완료한다.','fishSales',3],
 ['common','fifteen_fish','작은 어획의 힘','물고기를 누적 15마리 판매한다.','fishAmount',15],
 ['common','three_mermaids','세 번의 승부','일반 인어 전투에서 누적 3회 승리한다.','normalWins',3],
 ['common','first_special','낯선 지느러미','특수 인어와의 전투에서 1회 승리한다.','specialWins',1],
 ['common','ten_coins','열 번의 앞면','동전 전투에서 누적 10회 승리 판정을 낸다.','coinWins',10],
 ['common','three_hires','갑판의 동료들','선원을 누적 3명 고용한다.','crewHires',3],
 ['common','three_gears','항해의 몸가짐','서로 다른 장비를 3개 구매한다.','gearBought',3],
 ['common','two_heals','치료비의 이유','항구에서 회복을 누적 2회 진행한다.','recoveries',2],
 ['common','two_kits','떠나기 전의 손길','출항 준비품을 누적 2개 구매한다.','preparations',2],
 ['common','one_battle_escape','도망친 자의 몫','인어 전투에서 1회 도주에 성공한다.','battleEscapes',1],
 ['common','one_whale_escape','거대한 수면을 떠나','재앙의 고래에게서 1회 달아난다.','whaleEscapes',1],
 ['common','two_promotions','작은 승급장','누적 2회 승급한다.','promotions',2],
 ['common','five_lakes','다섯 호수의 지도','서로 다른 호수 5개를 한 번씩 통과한다.','uniqueLakes',5],
 ['common','four_crew','갑판을 채운 손','승선 인원 4명을 보유한다.','maxCrew',4],
 ['common','four_hundred_gold','쌓이기 시작한 돈','보유 만 안(眼) 400 이상을 달성한다.','maxGold',400],
 ['common','eight_visit','여덟 개의 물빛','한 출항에서 8개 호수를 통과한다.','maxVoyageVisited',8],
 ['common','five_coins_in_run','동전이 웃은 날','한 출항에서 동전 앞면을 5회 낸다.','runCoinWins',5],
 ['rare','five_returns','다섯 번의 귀항','누적 5회 항구로 생환한다.','returns',5],
 ['rare','five_paid','입값의 무게','유료 전언을 누적 5회 구매한다.','paidRumors',5],
 ['rare','twenty_sales','익숙한 물고기 상인','물고기를 누적 20회 판매한다.','fishSales',20],
 ['rare','hundred_fish','백 마리의 어획','물고기를 누적 100마리 판매한다.','fishAmount',100],
 ['rare','fifteen_mermaids','인어 퇴치조','일반 인어를 누적 15회 쓰러뜨린다.','normalWins',15],
 ['rare','three_specials','낯선 고기 세 마리','특수 인어를 누적 3회 쓰러뜨린다.','specialWins',3],
 ['rare','hundred_coins','동전 위의 파도','전투 동전의 앞면을 누적 100회 낸다.','coinWins',100],
 ['rare','ten_hires','열 명의 갑판 계약','선원을 누적 10명 고용한다.','crewHires',10],
 ['rare','six_gears','완비한 장비함','서로 다른 장비를 6개 구매한다.','gearBought',6],
 ['rare','ten_heals','항구 의무실 단골','항구에서 회복을 누적 10회 진행한다.','recoveries',10],
 ['rare','eight_kits','꼼꼼한 출항','출항 준비품을 누적 8개 구매한다.','preparations',8],
 ['rare','five_escapes','전투에서 돌아온 사람','인어 전투에서 누적 5회 도주한다.','battleEscapes',5],
 ['rare','three_whale_escapes','고래의 등 뒤','재앙의 고래에게서 누적 3회 달아난다.','whaleEscapes',3],
 ['rare','ten_unique','열 가지 다른 수역','서로 다른 호수 10개를 통과한다.','uniqueLakes',10],
 ['rare','six_crew','든든한 선원 명부','승선 인원 6명을 보유한다.','maxCrew',6],
 ['rare','thousand_gold','한 장의 큰 계약','보유 만 안(眼) 1,000 이상을 달성한다.','maxGold',1000],
 ['rare','twelve_visit','열두 물빛의 지평','한 출항에서 12개 호수를 통과한다.','maxVoyageVisited',12],
 ['rare','five_streak','다섯 번 연속 앞면','동전 앞면을 5회 연속 낸다.','coinStreak',5],
 ['rare','thirty_rumors','전언을 모은 손','누적 30회 전언을 듣는다.','rumors',30],
 ['rare','twenty_voyages','스무 번 바다로','누적 20회 출항한다.','voyages',20],
 ['rare','two_normal_run','한 출항, 두 번의 승리','한 출항에서 일반 인어를 2회 쓰러뜨린다.','runNormalWins',2],
 ['hero','fifteen_returns','남아 있는 귀항표','누적 15회 항구에 생환한다.','returns',15],
 ['hero','eight_special','특수 인어 사냥단','특수 인어를 누적 8회 쓰러뜨린다.','specialWins',8],
 ['hero','twohundred_coins','아직 멀쩡한 동전','전투 동전의 앞면을 누적 250회 낸다.','coinWins',250],
 ['hero','fifty_mermaids','인어의 무덤','일반 인어를 누적 50회 쓰러뜨린다.','normalWins',50],
 ['hero','twenty_unique','스무 호수의 답','서로 다른 호수 20개를 통과한다.','uniqueLakes',20],
 ['hero','eight_streak','끊어지지 않은 여덟 판','동전 앞면을 8회 연속 낸다.','coinStreak',8],
 ['hero','ten_whale_escapes','고래가 놓친 선장','재앙의 고래로부터 누적 10회 생환한다.','whaleEscapes',10],
 ['hero','five_normal_run','한 항로의 인어 다섯','한 출항에서 일반 인어 5마리를 쓰러뜨린다.','runNormalWins',5],
 ['legend','fifty_returns','쉰 번의 등대','누적 50회 귀항한다.','returns',50],
 ['legend','hundredfifty_mermaids','인어 사냥의 이름','일반 인어를 누적 150회 쓰러뜨린다.','normalWins',150],
 ['legend','twelve_streak','열두 번의 앞면','동전 앞면을 12회 연속 낸다.','coinStreak',12],
 ['legend','ten_full_returns','끝까지 건넌 열 항해','등급별 접근 가능한 호수를 모두 통과한 출항을 누적 10회 달성한다.','fullReturns',10],
 ['legend','two_thousand_fish','천 마리의 어부','물고기를 누적 1,000마리 판매한다.','fishAmount',1000],
 ['myth','twenty_full_returns','완주한 스무 항해','배치된 모든 호수를 통과한 출항을 누적 20회 달성한다.','fullReturns',20],
 ['myth','eighteen_streak','열여덟 번의 앞면','동전 앞면을 18회 연속 낸다.','coinStreak',18],
 ['myth','thirty_specials','인어들이 두려워한 배','특수 인어를 누적 30회 쓰러뜨린다.','specialWins',30],
 ['myth','thirty_clean','흠 없는 항로','동전 실패가 없는 출항에서 인어 전투를 3회 이상 이긴 귀항을 누적 10회 달성한다.','cleanBattleReturns',10],
 ['myth','thirty_long','멀어진 등대','5등급에서 20개 호수를 모두 통과한 출항을 누적 12회 달성한다.','fullFiveReturns',12]
 ];
 for(const [tier,id,name,desc,kind,min] of metrics)goal(id,tier,name,desc,{kind:'metric',metric:kind,min});
 const feats=[
 // 고정 숫자만 바꾸지 않고 각기 다른 상황에서 성립하는 항해 목표
 ['common','fresh_catch','첫 어획을 지닌 배','물고기 3마리 이상을 가진 채 귀항한다.',{minFish:3}],
 ['common','calm_return','잠잠한 항구','정신 상태 80 이상으로 귀항한다.',{minMind:80}],
 ['common','loaded_pockets','적자를 남기지 않은 항해','보유 자금 300만 안(眼) 이상으로 귀항한다.',{minGold:300}],
 ['common','small_crew','작은 인원으로 건넌 물','선원 2명 이하를 데리고 호수 4개 이상을 통과해 귀항한다.',{minVisited:4,maxCrew:2}],
 ['common','with_a_harpoon','작살잡이의 귀항','작살잡이와 함께 귀항한다.',{role:'harpoon'}],
 ['common','with_navigator','항해사의 귀항','1등 항해사와 함께 귀항한다.',{role:'navigator'}],
 ['common','run_with_coin','싸우고 돌아온 선장','전투에서 동전 앞면을 2회 이상 낸 출항을 완료한다.',{minRunCoinWins:2}],
 ['common','normal_hunt_onboard','사냥을 마친 배','일반 인어를 1마리 이상 처치한 항해에서 귀항한다.',{minRunNormalWins:1}],
 ['common','return_without_flee','목적지를 잃지 않은 날','전투나 고래 조우에서 달아나지 않고 귀항한다.',{maxRunEscapes:0,minRunBattles:1}],
 ['common','five_visited','다섯 호수 뒤의 항구','한 출항에서 호수 5개 이상을 통과해 귀항한다.',{minVisited:5}],
 ['rare','full_grade2','두 번째 등급의 끝','2등급 항해에서 호수 8개를 모두 건넌다.',{grade:2,minVisited:8}],
 ['rare','full_grade3','세 번째 등급의 끝','3등급 항해에서 호수 12개를 모두 건넌다.',{grade:3,minVisited:12}],
 ['rare','all_healthy','건강한 승선 명부','3명 이상 승선한 상태에서 전원이 건강한 채 귀항한다.',{minCrew:3,allCrewHealthy:true}],
 ['rare','recovered_from_mind','아슬한 맑은 정신','정신 상태가 30 이하인 채로 항구에 살아 돌아온다.',{maxMind:30}],
 ['rare','acid_exposure','침식된 귀항','호수 침식도가 70 이상인 채 항구로 돌아온다.',{minExposure:70}],
 ['rare','ten_caught','어획 가득한 갑판','물고기 10마리 이상 보유하고 귀항한다.',{minFish:10}],
 ['rare','three_normal_run','인어 셋의 끝','한 항해에서 일반 인어 3마리를 쓰러뜨리고 귀항한다.',{minRunNormalWins:3}],
 ['rare','ship5_survivor','고급 선박의 귀환','5등급 선박을 타고 정신 상태 75 이상으로 귀항한다.',{ship:5,minMind:75}],
 ['rare','flee_and_return','다시 되찾은 항로','전투에서 도주하고도 항구로 무사히 귀항한다.',{minRunEscapes:1}],
 ['rare','full_crew_no_loss','함께 탄 사람들','선원 손실 없이 승선 5명 이상으로 귀항한다.',{minCrew:5,noCrewLoss:true}],
 ['hero','full_grade4','네 번째 등급의 끝','4등급 항해의 호수 16개를 모두 통과해 귀항한다.',{grade:4,minVisited:16}],
 ['hero','full_grade5','다섯 번째 등급의 끝','5등급 항해의 호수 20개를 모두 통과해 귀항한다.',{grade:5,minVisited:20}],
 ['hero','no_damage_grade3','파손되지 않은 중급선','3등급 항해에서 호수 12개를 건너며 피해를 받지 않는다.',{grade:3,minVisited:12,noDamage:true}],
 ['hero','master_fishing','전투와 어획을 함께','한 항해에서 일반 인어 2마리 처치와 물고기 10마리 보유를 함께 달성해 귀항한다.',{minRunNormalWins:2,minFish:10}],
 ['hero','mental_limit','정신의 벼랑끝','3등급 이상 항해에서 정신 상태 15 이하로 귀항한다.',{minGrade:3,maxMind:15}],
 ['hero','whole_crew4','지켜 낸 네 사람','4등급에서 선원 손실 없이 호수 16개를 통과하고 4명 이상 함께 귀항한다.',{grade:4,minVisited:16,minCrew:4,noCrewLoss:true}],
 ['legend','zero_damage4','긁히지 않은 큰 배','4등급 항해에서 16개 호수를 모두 통과하고 피해를 한 번도 받지 않는다.',{grade:4,minVisited:16,noDamage:true}],
 ['legend','severe_five','침식의 끝자락','5등급 항해를 완주한 뒤 침식도 80 이상으로 생환한다.',{grade:5,minVisited:20,minExposure:80}],
 ['legend','high_mental_full','쓰러지지 않은 정신','5등급 항해를 완주하면서 정신 상태 90 이상을 지킨다.',{grade:5,minVisited:20,minMind:90}],
 ['legend','five_no_crew_loss','마지막까지 함께','5등급 항해를 완주하면서 선원을 잃지 않고 5명 이상 귀항한다.',{grade:5,minVisited:20,minCrew:5,noCrewLoss:true}],
 ['legend','five_many_battles','살육을 넘긴 배','한 항해에서 인어 5마리를 쓰러뜨리고 5등급 항해를 완주한다.',{grade:5,minVisited:20,minRunNormalWins:5}],
 ['legend','small_grade4','적은 인원, 넓은 물','4등급에서 선원 2명 이하로 16개 호수를 통과한다.',{grade:4,minVisited:16,maxCrew:2}],
 ['legend','no_loss_grade3','끊어지지 않은 승선 명부','3등급에서 선원을 잃지 않고 12개 호수를 전부 통과하며 정신 85 이상으로 귀항한다.',{grade:3,minVisited:12,noCrewLoss:true,minMind:85}],
 ['myth','perfect_fifth','한 번의 완벽한 항해','5등급 항해에서 호수 20개를 모두 통과하고 선체 피해를 받지 않는다.',{grade:5,minVisited:20,noDamage:true}],
 ['myth','deep_mind','마지막 정신','5등급에서 호수 20개를 전부 통과하고 정신 상태가 20 이하인 채 살아 돌아온다.',{grade:5,minVisited:20,maxMind:20}],
 ['myth','sole_crew','혼자서 돌아온 배','5등급에서 20개 호수를 통과하고 선원이 한 명 이하인 상태로 귀항한다.',{grade:5,minVisited:20,maxCrew:1}],
 ['myth','undisturbed_crew','스무 호수의 일곱 선원','5등급에서 호수 20개를 통과하고 7명 이상 전원이 건강하며 이탈자가 없어야 한다.',{grade:5,minVisited:20,minCrew:7,noCrewLoss:true,allCrewHealthy:true}],
 ['myth','big_fish_voyage','죽음의 바다와 생계','5등급에서 20개 호수를 통과하고 물고기 15마리를 지닌 채 정신 상태 80 이상으로 귀항한다.',{grade:5,minVisited:20,minFish:15,minMind:80}],
 ['myth','whale_full','고래 뒤의 모든 호수','재앙의 고래 사냥에 성공한 항해에서 5등급 호수 20개를 모두 통과해 귀항한다.',{grade:5,minVisited:20,minWhaleKills:1}],
 ['myth','clean_coin_full','동전의 축복 없는 승전','5등급에서 20개를 모두 통과하고 동전 실패 없이 전투에서 3회 이상 성공한 채 귀항한다.',{grade:5,minVisited:20,maxRunCoinFailures:0,minRunBattles:3}],
 ['myth','battles_six','인어 여섯의 밤','5등급에서 일반 인어 6마리를 물리치고 20개 호수를 모두 통과한다.',{grade:5,minVisited:20,minRunNormalWins:6}],
 ['myth','whale_esc_full','고래가 뒤따른 항로','재앙의 고래에게서 달아난 항해에서 20개 호수를 모두 통과해 귀항한다.',{grade:5,minVisited:20,minRunWhaleEscapes:1}],
 ['myth','harpoon_in_storm','작살잡이의 생환','5등급 완주, 선원 손실 없음, 작살잡이와 1등 항해사를 모두 승선시킨 채 귀항한다.',{grade:5,minVisited:20,minCrew:5,noCrewLoss:true,roles:['harpoon','navigator']}],
 ['myth','fifth_mindless_battle','정신을 잃지 않은 마지막 승부','5등급 완주 후 정신 45 이하, 전투 앞면 10회 이상, 선원 5명 이상으로 귀항한다.',{grade:5,minVisited:20,maxMind:45,minRunCoinWins:10,minCrew:5}],
 ['myth','fourth_no_damage','네 번째 등급의 무흠','4등급에서 16개 호수를 완주하고 아무 피해 없이 선원 전원과 돌아온다.',{grade:4,minVisited:16,noDamage:true,noCrewLoss:true,minCrew:5}],
 ['myth','five_with_oil','고래기름을 든 항해자','5등급에서 20개 호수를 통과하고 고래기름 3개 이상을 가진 채 생환한다.',{grade:5,minVisited:20,minOil:3}],
 ['myth','five_with_trophies','쓸어 담은 사냥감','5등급에서 20개 호수를 통과하고 특수 전리품 2개 이상을 가지고 귀항한다.',{grade:5,minVisited:20,minRelics:2}],
 ['myth','no_damage_with_hunts','피를 흘리지 않은 승리','5등급에서 전투에서 4회 승리하고 선체 피해 없이 20개 호수를 완주한다.',{grade:5,minVisited:20,noDamage:true,minRunBattles:4}]
 ];
 for(const [tier,id,name,desc,when] of feats)goal('feat_'+id,tier,name,desc,{kind:'voyage',...when});
 // 반복적인 같은 목표를 여러 번 쪼갠 정의를 검출합니다.
 const seenNames=new Set(),seenIds=new Set();
 for(const a of definitions){
  if(seenIds.has(a.id)||ACH.some(b=>b.id===a.id))throw Error('업적 ID 중복: '+a.id);
  if(seenNames.has(a.name))throw Error('업적 이름 중복: '+a.name);
  seenIds.add(a.id);seenNames.add(a.name);
  ACH.push(a);
 }
 const METRICS_KEY='great-lake-napolitan-achievement-stats-v017';
 const counters={},uniqueSeen=new Set();
 try{
  const old=JSON.parse(localStorage.getItem(METRICS_KEY));
  if(old?.counts&&typeof old.counts==='object')Object.assign(counters,old.counts);
  if(Array.isArray(old?.uniqueLakes))old.uniqueLakes.forEach(x=>uniqueSeen.add(Number(x)));
 }catch(e){console.warn('업적 누적 실적 복구 실패:',e);}
 const initialPass=window.GREAT_LAKE_PATCH_016?.count?.()||{};
 for(const [id,n] of Object.entries(initialPass))if(n>0)uniqueSeen.add(Number(id));
 for(const id of state.clearedIds||[])uniqueSeen.add(id);
 for(const id of state.newlyCleared157||[])uniqueSeen.add(id);
 counters.uniqueLakes=Math.max(uniqueSeen.size,Number(counters.uniqueLakes)||0);
 const initial={voyages:state.voyage||0,returns:state.count?.return||0,
  rumors:state.count?.rumors||0,coinWins:state.prog?.coinHeads||0,
  maxGold:state.prog?.goldPeak||state.gold||0,
  maxCrew:state.crew?.length||0,maxVoyageVisited:state.visited?.length||0};
 for(const [k,v] of Object.entries(initial))counters[k]=Math.max(Number(counters[k])||0,v);
 // 현재 생존 중인 항해의 실적은 전환 시점부터 집계합니다.
 let run={coinWins:0,coinFailures:0,normalWins:0,whaleKills:0,battles:0,escapes:0,whaleEscapes:0,crewLossAtStart:state.medalRun152?.crewLoss||0};
 try{const old=JSON.parse(localStorage.getItem(METRICS_KEY));if(state.sea&&old?.voyage===state.voyage&&old?.run){run={...run,...old.run};}}catch(e){}
 function saveStats(){
  try{localStorage.setItem(METRICS_KEY,JSON.stringify({counts:counters,uniqueLakes:[...uniqueSeen],voyage:state.voyage,run}));}catch(e){}
 }
 function incr(kind,num=1){counters[kind]=(Number(counters[kind])||0)+num;}
 function high(kind,n){counters[kind]=Math.max(Number(counters[kind])||0,n);}
 function merit(a){
  if(state.achievements.includes(a.id))return;
  if(a.goal161?.kind==='metric'){
   const m=a.goal161;
   if((counters[m.metric]||0)>=m.min)award(a.id);
  }
 }
 function testVoyage(goal,info){
  const visited=Number(info.visited??state.visited?.length??0);
  const level=Number(info.grade??state.grade);
  if(goal.grade!=null&&level!==goal.grade)return false;
  if(goal.minGrade!=null&&level<goal.minGrade)return false;
  if(goal.minVisited!=null&&visited<goal.minVisited)return false;
  const numeric={
   Crew:state.crew?.length||0,Gold:state.gold||0,
   Fish:state.fish||0,Oil:state.oil||0,
   Relics:Object.values(state.relics||{}).reduce((t,v)=>t+(Number(v)||0),0),
   Mind:state.mind,Exposure:state.exposure||0,
   RunCoinWins:run.coinWins,RunCoinFailures:run.coinFailures,
   RunNormalWins:run.normalWins,RunWhaleEscapes:run.whaleEscapes,
   RunEscapes:run.escapes,RunBattles:run.battles,WhaleKills:run.whaleKills
  };
  for(const [key,val] of Object.entries(goal)){
   if(['kind','grade','minGrade','minVisited','noDamage','noCrewLoss','allCrewHealthy','ship','role','roles'].includes(key))continue;
   const match=/^(min|max)(Crew|Gold|Fish|Oil|Relics|Mind|Exposure|RunCoinWins|RunCoinFailures|RunNormalWins|RunWhaleEscapes|RunEscapes|RunBattles|WhaleKills)$/.exec(key);
   if(!match||!Number.isFinite(numeric[match[2]]))return false;
   if(match[1]==='min'&&numeric[match[2]]<val)return false;
   if(match[1]==='max'&&numeric[match[2]]>val)return false;
  }
  if(goal.noDamage&&state.lossesThisVoyage!==0)return false;
  if(goal.noCrewLoss&&(state.medalRun152?.crewLoss||0)>run.crewLossAtStart)return false;
  if(goal.allCrewHealthy&&!state.crew.every(c=>c.condition===0))return false;
  if(goal.ship&&state.shipGrade!==goal.ship)return false;
  if(goal.role&&!state.crew.some(c=>c.role===goal.role))return false;
  if(goal.roles&&!goal.roles.every(role=>state.crew.some(c=>c.role===role)))return false;
  return true;
 }
 function evaluate(event,info={}){
  high('maxGold',Math.max(state.gold||0,state.prog?.goldPeak||0));
  high('maxCrew',state.crew?.length||0);
  high('maxVoyageVisited',state.visited?.length||0);
  high('coinStreak',state.medalRun152?.streak||0);
  high('runCoinWins',run.coinWins);
  high('runNormalWins',run.normalWins);
  high('uniqueLakes',uniqueSeen.size);
  if(event==='voyageEnd'){
   if(Number(info.visited)>=Number(LAKE_CAP[info.grade]))incr('fullReturns');
   if(info.grade===5&&Number(info.visited)>=20)incr('fullFiveReturns');
   if(Number(info.visited)>=Number(LAKE_CAP[info.grade])&&run.coinFailures===0&&run.battles>=3)incr('cleanBattleReturns');
   high('maxVoyageVisited',Number(info.visited)||0);
  }
  for(const a of ACH){
   if(!a.goal161)continue;
   if(a.goal161.kind==='metric')merit(a);
   else if(a.goal161.kind==='voyage'&&event==='voyageEnd'&&testVoyage(a.goal161,info))award(a.id);
  }
  saveStats();
 }
 const oldDispatch=dispatchAchievement142;
 dispatchAchievement142=function(event,info={}){
  const ans=oldDispatch(event,info);
  if(event==='rumor'){incr('rumors');if(info.price>0)incr('paidRumors');}
  if(event==='fishSale'){incr('fishSales');incr('fishAmount',Number(info.fishSold)||0);}
  if(event==='battleWin'){
   if(info.type==='normal'){incr('normalWins');run.normalWins++;}
   if(info.type==='special'){incr('specialWins');}
   run.battles++;
  }
  if(event==='battleEscape'){incr('battleEscapes');run.escapes++;}
  if(event==='whaleEscape'){incr('whaleEscapes');run.whaleEscapes++;}
  if(event==='gear')incr('gearBought');
  if(event==='recruit')incr('crewHires');
  if(event==='recover')incr('recoveries');
  if(event==='preparation')incr('preparations');
  if(event==='promote')incr('promotions');
  if(event==='lakeClear'&&info.lake!=null)uniqueSeen.add(Number(info.lake));
  if(event==='voyageEnd')incr('returns');
  evaluate(event,info);
  return ans;
 };
 const oldCoin=resolveCoin;
 resolveCoin=function(win){
  const before=state.battle,wasWhaleCount=state.whaleKilled?.length||0;
  const result=oldCoin(win);
  if(before){
   if(win){incr('coinWins');run.coinWins++;}
   else run.coinFailures++;
   if((state.whaleKilled?.length||0)>wasWhaleCount)run.whaleKills++;
   if(state.scene!=='dead')evaluate('coin');
  }
  return result;
 };
 const oldPrepare=prepareVoyage;
 prepareVoyage=function(){
  if(!state.sea)run={coinWins:0,coinFailures:0,normalWins:0,whaleKills:0,battles:0,escapes:0,whaleEscapes:0,crewLossAtStart:state.medalRun152?.crewLoss||0};
  const result=oldPrepare();
  evaluate('voyagePreparation');
  return result;
 };
 const oldLaunch=launch;
 launch=function(){
  const previous=state.voyage||0;
  const answer=oldLaunch();
  if((state.voyage||0)>previous){
   high('voyages',state.voyage);
   evaluate('voyageStart');
  }
  return answer;
 };
 const oldRenderAchievements=renderAch;
 renderAch=function(){
  // 구버전 업적 탭이 선택된 경우에도 공개 조건 규칙을 유지합니다.
  return oldRenderAchievements();
 };
 const oldTrophies=trophies;
 trophies=function(){
  oldTrophies();
  // 상점·승급처럼 별도 사건을 띄우지 않는 변화도 검사합니다.
  high('maxGold',Math.max(state.gold||0,state.prog?.goldPeak||0));
  high('maxCrew',state.crew?.length||0);
  high('coinStreak',state.medalRun152?.streak||0);
  for(const a of ACH)if(a.goal161?.kind==='metric')merit(a);
 };
 const oldSave161=save;
 save=function(){saveStats();return oldSave161();};
 // 기존 업적과 보존될 기적·유일 업적을 포함하여 실제 존재하는 항목만 저장합니다.
 const ids=new Set(ACH.map(a=>a.id));
 state.achievements=[...new Set(state.achievements.filter(id=>ids.has(id)))];
 permanentAchievements=[...new Set(permanentAchievements.filter(id=>ids.has(id)))];
 if(state.equippedTitle&&!ids.has(state.equippedTitle))state.equippedTitle='';
 // 저장된 이력에 따라 이미 채워진 새 누적 목표를 인정합니다.
 evaluate('migration');
 save();
 window.GREAT_LAKE_ACHIEVEMENTS_161={
  counts:()=>Object.fromEntries(TIERS.map(t=>[t,ACH.filter(a=>a.tier===t).length])),
  metric:()=>({...counters}),run:()=>({...run})
 };
})();
