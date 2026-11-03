/* 신(心) · E.G.O 연출 (v0.3.1)
   · 따스한 목소리: "내 목소리, 들리지? 들리잖아. 답해주렴."이 1 → 2 → 4 → … → 128개로 불어나며 메아리친 뒤(16개부터는 한 문장만 또렷하고 나머지는 반투명),
     "이제야 내 말을 귀담아 들어주는구나"로 이어지고, 이 선장의 생애(잃은 선원 · 지나온 호수 · 등급 · 결의 · 신)에 맞춰 목소리가 말을 고른다.
   · E.G.O 개화: 마음을 감싼 껍질이 안쪽의 빛에 금 가고 깨져 흩어진 자리에서 빛의 꽃잎이 피어난다.
   · 뒤틀림: 따스한 목소리가 식어 붉게 번지고, 선장의 형체가 일그러져 다른 것이 된다.
   · 신(心) 발현: 떠올린 기억이 가슴으로 모여, 금빛 불꽃 같은 기운이 몸을 감싼다.
   화면은 게임 화면 바깥(body)에 따로 띄워, 게임이 다시 그려져도 연출이 끊기거나 처음부터 다시 재생되지 않는다. */
(function(){
'use strict';
const H=window.GREAT_LAKE_HEART_030;
if(!H||typeof state==='undefined'||typeof renderPlay!=='function'||typeof render!=='function')return;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const R=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const btn=(label,act,cls)=>'<button type="button" class="'+(cls||'')+'" data-act="'+act+'">'+esc(label)+'</button>';
const persist=()=>{try{if(typeof save==='function')save();}catch(e){}};
const reduce=(()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}})();
const ECHO='내 목소리, 들리지? 들리잖아. 답해주렴.';

/* ---------- 이름 뒤 조사 ---------- */
function batchim(s){const c=String(s||'').trim().slice(-1).charCodeAt(0);return c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28>0;}
const iga=s=>s+(batchim(s)?'이':'가');
const ah=s=>s+(batchim(s)?'아':'야');

/* ---------- 판정 직전의 계기(무엇을 보고 무너졌는지) ---------- */
let lastMsg='';
const oldLog=log;
log=function(message){
 const msg=String(message||'');
 const out=oldLog.apply(this,arguments);
 try{
  if(/선장의 정신력이 바닥났습니다/.test(msg)&&state.mindJudge&&state.mindJudge.why031==null){
   state.mindJudge.why031=lastMsg.replace(/\s*선장의 정신력 -\d+.*$/,'').trim();
  }
  if(!/업적 달성/.test(msg))lastMsg=msg;
 }catch(e){}
 return out;
};

/* ---------- 목소리가 고르는 말: 이 선장의 생애에서만 ----------
   목소리의 결: 다정하고 매혹적이며, 듣는 사람 하나만을 위해 말을 고른다. 약한 데를 정확히 짚고,
   참아 온 갈망을 '병이 아니라 진짜 너'라고 부르며, 도시와 대호수의 잣대(등급 · 장부 · 손실 · 몫)에서 벗어나 다시 태어나라고 권한다.
   거절하려는 마음은 체념이나 고집이라고 부드럽게 꾸짖는다.
   · 갈래마다 15가지 이상(다시 왔을 때는 회차마다 10가지)에서 고르고, 이 선장이 이미 들은 말은 되도록 다시 고르지 않는다.
   · 판정마다 한 번 골라 저장하므로 다시 그려져도 같은 말이 이어진다. */
const ul=s=>s+(batchim(s)?'을':'를');
const VOICE={
 approach:[
  '계속 부르고 있었어. 네가 너무 바빠서 못 들었을 뿐이지.',
  '무서워할 것 없어. 나는 처음부터 네 쪽에 서 있었으니까.',
  '다들 네 등급이랑 장부만 봤지. 나는 줄곧 네 마음을 보고 있었어.',
  '숨 좀 돌려. 여기선 아무도 너한테 값을 매기지 않아.',
  '드디어 조용해졌네. 이제야 네 진짜 목소리가 들려.',
  '귀 막지 않아도 돼. 나는 너한테서 아무것도 빼앗으러 온 게 아니야.',
  '노 젓는 소리, 선원들 숨소리… 다 걷어 내니까 네 소리만 남았네.',
  '괜찮아, 여긴 물속이 아니야. 숨 쉬어도 돼.',
  '오래 걸렸지? 너 같은 사람은 늘 마지막에야 귀를 열더라.',
  '네가 무너질 때까지 기다린 게 아니야. 네가 멈춰 설 때까지 기다린 거야.',
  '이 호수에서 너한테 말을 거는 건 물속 것들뿐이었지. 나는 달라.',
  '겁먹은 얼굴 하지 마. 그 얼굴, 선원들 앞에서는 한 번도 못 지어 봤잖아.',
  '지금 네 손, 떨리고 있어. 키를 놓쳐도 괜찮아. 내가 잡고 있을게.',
  '누가 너한테 괜찮냐고 물어본 게 언제였어? 내가 물어볼게. 괜찮니?',
  '쉿. 이제 아무도 네 명령을 기다리지 않아.',
  '처음 듣는 목소리 같지? 아니야, 나는 네 안에 오래 있었어.',
  '다정한 목소리가 낯설지? 이 도시는 너한테 그런 걸 들려준 적이 없으니까.'
 ],
 crewNamed:[
  n=>ul(n)+' 마지막으로 본 게 너였지. 손을 뻗었는데, 닿지 않았잖아.',
  n=>n+'… 물속으로 가라앉으면서도 너를 보고 있었어. 원망하는 얼굴이 아니었는데.',
  n=>iga(n)+' 비늘 돋은 손으로 뱃전을 붙잡던 거, 기억나? 너는 그 손을 떼어 냈지.',
  n=>n+'. 네가 지어 준 이름이야. 이제 그 이름을 불러 줄 사람은 너밖에 없어.',
  n=>'장부에는 '+n+' 이름 옆에 줄 하나 그으면 끝이야. 네 마음엔 그렇게 안 되잖아.'
 ],
 crew:[
  '또 한 사람이 물속으로 가 버렸어. 너는 그저 보고만 있었고.',
  '방금 그 사람, 이름 한 번 제대로 불러 주지 못했지. 그게 제일 아프지?',
  '물보라가 가라앉고 나니 갑판이 한 칸 비었네. 너는 그 빈자리를 또 세겠지.',
  '그 사람 눈이 물빛으로 바뀌는 걸 봤잖아. 그 뒤로 네 눈도 조금 흐려졌어.',
  '노 하나가 멈췄어. 너는 그 노를 대신 저으면서 아무렇지 않은 척하겠지.'
 ],
 mermaid:[
  '방금 그 노래, 끝까지 듣고 싶었지? 부끄러워할 것 없어.',
  '물속에서 부르던 얼굴들, 하나같이 다정했잖아. 도시의 누구보다도.',
  '그것들이 무서웠던 게 아니야. 따라가고 싶어지는 네 마음이 무서웠던 거지.',
  '비늘 사이로 보이던 그 눈, 너를 미워하지 않았어. 오히려 반가워했지.',
  '물 밑으로 내려가면 장부도, 빚도, 출항 경비도 없어. 그 생각, 잠깐 했지?',
  '그 노래가 네 이름을 불렀잖아. 이 도시에서 네 이름을 그렇게 다정하게 부른 사람이 있었니?'
 ],
 training:[
  '빛의 고리 하나를 더 얻겠다고 스스로를 깎아 내다니. 누가 시킨 것도 아닌데.',
  '더 강해져야 한다고, 더 버텨야 한다고. 그 말, 누구한테 배웠어?',
  '마음을 쥐어짜서 힘을 만드는 거, 아프지? 쥐어짜지 않아도 되는 방법이 있어.'
 ],
 worn:[
  '여기까지 오는 동안 한 번도 제대로 쉬어 본 적 없잖아.',
  '끝까지 버티다가 끊어진 거야. 그건 약해서가 아니야.',
  '줄은 원래 끊어지게 돼 있어. 너무 오래, 너무 세게 당겼으니까.',
  '무엇 하나 크게 잘못한 것도 없는데, 너는 여기까지 와 버렸네.',
  '호수가 조금씩 너를 갉아먹고 있었어. 너만 몰랐지.'
 ],
 // 도시와 대호수에서 머물며 그들의 잣대로 매겨진 삶 — [조건, 말]
 measured:[
  [c=>c.kills,()=>'재앙을 꿰뚫은 손이야. 도시는 그 손에 상금 몇 푼 쥐여 주고 끝냈지.'],
  [c=>c.kills,()=>'고래를 쓰러뜨린 사람한테 도시가 해 준 건 다음 의뢰서뿐이었잖아.'],
  [c=>c.g>=4,c=>c.g+'등급. 도시는 너를 그 숫자로만 기억할 거야. 네가 어떤 밤을 보냈는지는 빼고.'],
  [c=>c.g>=4,c=>'선장 '+c.g+'등급. 다들 네게 기대기만 했고, 너는 누구에게도 기대지 못했지.'],
  [c=>c.lakes>=10,c=>'호수를 '+c.lakes+'개나 건넜어. 그런데 항구에선 아무도 묻지 않았지. 괜찮았냐고.'],
  [c=>c.lakes>=10,c=>'호수 '+c.lakes+'개. 도시에선 그게 경력 한 줄이야. 네 마음에 남은 건 한 줄로 안 끝나는데.'],
  [c=>c.rets>=1,()=>'몇 번이고 배를 끌고 돌아왔지. 다음 출항 경비를 벌려고. 그게 사는 거라고 배웠으니까.'],
  [c=>c.rets>=1,()=>'항구에 닿을 때마다 장부부터 펼쳤지. 네 마음은 펼쳐 볼 틈도 없이.'],
  [c=>c.lakes<3&&!c.rets,()=>'이제 막 키를 잡았을 뿐인데, 도시는 벌써 너한테 값을 매기기 시작했어.'],
  [c=>c.lakes<3&&!c.rets,()=>'첫 항해부터 이렇게 무너졌다고 부끄러워하지 마. 이 호수가, 이 도시가 그렇게 만든 거야.'],
  [()=>1,()=>'도시는 고래기름 값은 매일 매겨도, 그걸 짜낸 사람 값은 한 번도 안 매겨.'],
  [()=>1,()=>'항구 사람들은 네 배가 돌아왔는지만 물어. 네가 돌아왔는지는 묻지 않지.'],
  [()=>1,()=>'고래잡이는 이름이 아니라 쓸모로 불리지. 작살잡이, 노잡이, 선장. 너는 누구였니?'],
  [()=>1,()=>'항구 장부엔 귀항이랑 실종, 두 칸밖에 없어. 그 사이에서 네가 겪은 건 적을 데가 없지.'],
  [()=>1,()=>'남부 사람들은 대호수를 일터라고 불러. 사람이 사라지는 일터.'],
  [()=>1,()=>'도시는 너한테 버티는 법만 가르쳤어. 내려놓는 법은 가르쳐 주지 않았지.'],
  [()=>1,()=>'날개 그늘 밑에 사는 사람들은 너희를 비린내 나는 뱃사람이라고 하겠지. 그 비린내가 네 피인 줄도 모르고.'],
  [()=>1,()=>'이 호수에선 법을 어기면 죽고, 지켜도 조금씩 죽어. 그게 공평하다고 생각해?'],
  [()=>1,()=>'항구 술집에서 다들 웃고 떠들 때, 너는 다음 출항 날짜를 세고 있었지.'],
  [()=>1,()=>'빚이랑 경비랑 몫. 네 하루는 늘 남의 셈으로 끝났어.']
 ],
 // 갈망을 긍정하고 유혹하는 말
 wish:[
  c=>c.sn&&c.sn+'. 그 바람, 혼자 빛내기엔 너무 무겁지 않아?',
  c=>c.sn&&c.sn+'… 거짓 없는 바람이란 거 알아. 그러니까 끝까지 가게 해 줄게.',
  c=>c.sn&&c.sn+'. 그 이름을 붙일 만큼 간절했잖아. 그럼 망설일 이유가 없지.',
  c=>c.p&&'‘'+c.p+'’. 네가 그렇게 말했지. 그걸 도시의 방식으로 이룰 수 있을 것 같아?',
  c=>c.p&&'‘'+c.p+'’… 그 말, 나는 진심으로 들었어. 이제 정말로 이뤄 보자.',
  c=>c.resolve&&'무너지기 직전까지 몰리고도 끝까지 버텼잖아. 이제 그만 내려놓아도 돼.'
 ],
 tempt:[
  ()=>'그건 병이 아니야. 너무 오래 참아 온 마음일 뿐이야.',
  ()=>'도시가 붙여 준 이름표는 이제 떼어 버려도 돼.',
  ()=>'남의 눈에 맞춰 깎아 낸 모양 말고, 원래의 네 모양으로 돌아가자.',
  c=>c.call+'조금만 솔직해지면 돼. 그러면 다시 태어날 수 있어.',
  c=>c.call+'네가 바라는 너로 살아도, 아무도 너를 탓하지 못해.',
  ()=>'갖고 싶었던 것, 되고 싶었던 것. 도시가 분수라며 접게 한 것들, 다시 펴 보자.',
  ()=>'네가 정말 바라는 게 뭔지, 한 번이라도 소리 내서 말해 본 적 있어?',
  ()=>'언제부터 네 바람보다 남의 계산을 먼저 하게 됐니?',
  ()=>'화내고 싶으면 화내. 울고 싶으면 울어. 그게 그렇게 큰 죄였니?',
  ()=>'참는 게 미덕이라고? 그건 참는 사람을 부리기 편한 사람들이 하는 말이야.',
  ()=>'네 안에서 끓는 그거, 꺼트리지 마. 그게 진짜 너니까.',
  ()=>'이번 한 번만, 네 마음이 하자는 대로 해 보자. 그다음은 내가 책임질게.',
  ()=>'원하는 걸 원한다고 말하는 게 왜 부끄러워? 부끄러운 건 그걸 막아 온 쪽이야.',
  ()=>'너는 모두를 위해 살았어. 이제 딱 한 번, 너를 위해 살아도 돼.',
  ()=>'키를 놓아. 배가 어디로 가든, 처음으로 네가 가고 싶은 곳일 거야.',
  ()=>'마음이 시키는 대로 하면 다 망가질 것 같지? 아니야, 처음으로 온전해지는 거야.',
  c=>c.call+'네가 바라는 대로의 네가 되자. 아무것도 너를 막지 못하게 해 줄게.'
 ],
 again1:[
  '또 왔구나. 지난번엔 돌아섰지? 괜찮아, 화나지 않았어.',
  '다시 만났네. 그날 물러서던 네 뒷모습, 아직 기억하고 있어.',
  '돌아올 줄 알았어. 한 번 들은 목소리는 잊히지 않거든.',
  '지난번엔 아직이라고 했지. 그 아직이 오늘인가 봐.',
  '그동안 잘 버텼어? 아니, 잘 버틴 얼굴은 아니네.',
  '물러난 자리에서 한 걸음도 못 갔구나. 그럴 줄 알았어.',
  '그때 줄어든 마음, 아직도 시리지? 내가 채워 줄 수 있어.',
  '한 번 등을 돌린 사람한테 다시 말 거는 건, 나밖에 없을걸.',
  '또 같은 자리야. 이번엔 조금 더 솔직해지자.',
  '반가워. 너는 반갑지 않겠지만.'
 ],
 again2:[
  '이번엔 돌아갈 데가 없다는 거, 너도 알지?',
  '세 번째야. 여기서 더 버티는 건 용기가 아니라 고집이야.',
  '두 번 물러났지. 세 번째엔 물러설 땅이 없어.',
  '이제 네 마음엔 나 말고 남은 게 별로 없어. 잘 들어 봐.',
  '마지막으로 물을게. 아주 다정하게.',
  '줄어들 대로 줄어든 마음으로 또 버티겠다고? 그건 너를 벌주는 거야.',
  '이번에도 돌아서면, 다음엔 내가 아니라 다른 게 너를 부를 거야.',
  '여기까지 왔으면 알잖아. 끝은 늘 같은 자리에서 기다리고 있었어.',
  '숨 쉴 틈도 없이 다시 왔네. 이번엔 놓치지 않을게.',
  '마지막 기회야. 너한테도, 나한테도.'
 ],
 // 인정하려 할 때 반박
 rebut:[
  '인정한다고? 그건 도시가 너한테 가르쳐 준 체념이야.',
  '뜻대로 되지 않는 세상이라면, 뜻대로 되는 네가 되면 되잖아.',
  '다른 누군가의 탓으로 돌려도 괜찮아. 네가 짊어진 몫은 이미 넘쳤어.',
  '네가 지키려던 것들, 어떻게든 되찾으면 되잖아. 내가 도와줄게.',
  '받아들인다는 말, 참 착하지. 착한 사람부터 호수에 가라앉는다는 거 알아?',
  '세상이 뜻대로 안 된다고 네 마음까지 뜻대로 안 될 필요는 없잖아.',
  '다 내려놓은 척하는 그 얼굴, 선원들 앞에서 짓던 거잖아. 나한테까지 그러지 마.',
  '인정하면 덜 아플 것 같지? 아니야. 조용히 아플 뿐이야.',
  '그건 어른스러운 게 아니야. 지쳐서 그런 거지.',
  '도시가 짜 놓은 판에서 진 걸 인정하겠다고? 판을 엎을 수도 있는데.',
  '바꿀 수 없다고 누가 그랬어? 바꾸려고 해 본 적이나 있니?',
  '너는 늘 물때를 기다리고, 바람을 기다리고, 허락을 기다렸지. 이번에도 기다리기만 할 거야?',
  '잃은 사람들 앞에서도 어쩔 수 없었다고 말할 수 있어?',
  '그 말 하려고 여기까지 버텨 온 거야? 너무 아깝잖아.',
  '체념은 평온이 아니야. 마음이 조금씩 가라앉는 소리지.',
  '그래, 세상은 네 뜻대로 안 돼. 그러니까 이제 네 뜻대로 하자는 거야.'
 ]
};
// 이 선장이 이미 들은 말은 되도록 피함(생애마다 새로)
function usedSet(){if(!Array.isArray(state.voiceUsed031))state.voiceUsed031=[];return state.voiceUsed031;}
function makePicker(seed){
 let n=0;const rnd=()=>R(seed*.0173+(n++)*3.71+.5),used=usedSet();
 return arr=>{const list=arr.filter(Boolean);if(!list.length)return null;const fresh=list.filter(t=>!used.includes(t)),pool=fresh.length?fresh:list;
  const t=pool[Math.floor(rnd()*pool.length)%pool.length];used.push(t);if(used.length>140)used.splice(0,used.length-140);return t;};
}
function composeVoice(j){
 if(j.seed031==null)j.seed031=Math.floor(Math.random()*1e6);
 const pick=makePicker(j.seed031);
 const k=Math.min(2,H.acceptTries()),m=H.memory(),r=H.record();
 const cap=String(state.captainName||'').trim();
 const why=String(j.why031||''),lost=Array.isArray(m.lost)?m.lost:[],named=lost.filter(c=>c.custom&&c.name),lastLost=lost[lost.length-1];
 const C={call:cap?ah(cap)+', ':'',kills:(state.whaleKilled||[]).length,lakes:state.count?.lake||0,rets:state.count?.return||0,g:state.grade|0,
  sn:state.shinName030?state.shinName030.replace(/\(望\)$/,''):'',p:m.purpose?String(m.purpose).slice(0,30)+(String(m.purpose).length>30?'…':''):'',resolve:r.resolve>=1};
 const L=['이제야 내 말을 귀담아 들어주는구나.'];
 L.push(pick(k===1?VOICE.again1:k===2?VOICE.again2:VOICE.approach));
 // 무너뜨린 계기
 let usedNamed=null;
 if(/인어가 되는 것/.test(why)){
  if(lastLost&&lastLost.custom){usedNamed=lastLost;L.push(pick(VOICE.crewNamed.map(f=>f(lastLost.name))));}
  else L.push(pick(VOICE.crew));
 }else if(/인어와 마주/.test(why))L.push(pick(VOICE.mermaid));
 else if(why===''&&state.shinOpen)L.push(pick(VOICE.training));
 else L.push(pick(VOICE.worn));
 // 잃은 사람들
 const rest=named.filter(c=>c!==usedNamed);
 if(!lost.length&&/인어가 되는 것/.test(why)){}
 else if(!lost.length)L.push(pick(['아직 아무도 잃지 않았지. 그걸 지키느라 네가 얼마나 닳았는지, 아무도 몰라.','모두를 지켰어. 그런데 너를 지켜 준 사람은 있었니?']));
 else if(rest.length>=2)L.push(rest.slice(-2).map(c=>c.name).join(', ')+'… 네가 직접 이름을 붙여 준 사람들이었잖아.');
 else if(rest.length===1)L.push(rest[0].name+'. 이름을 지어 준 그 순간부터, 너는 그 사람을 잃을 준비를 하고 있었어.');
 else if(lost.length>1)L.push(pick(['떠나보낸 사람이 '+lost.length+'명. 숫자로 세기 시작한 건 언제부터였을까.',lost.length+'명이야. 도시는 그걸 손실이라고 적겠지. 너는 아니잖아.']));
 // 도시와 대호수의 잣대
 const spec=VOICE.measured.filter(x=>x[0](C)&&x[0].toString()!=='()=>1').map(x=>x[1](C)),gen=VOICE.measured.filter(x=>x[0].toString()==='()=>1').map(x=>x[1](C));
 L.push(pick(R(j.seed031+.31)<.55&&spec.length?spec:gen.concat(spec)));
 // 갈망을 긍정하고 유혹
 const wish=VOICE.wish.map(f=>f(C)).filter(Boolean);
 if(wish.length&&R(j.seed031+.77)<.7)L.push(pick(wish));
 L.push(pick(VOICE.tempt.map(f=>f(C))));
 L.push('그러니까, 답해 주렴.');
 persist();
 return L;
}
function composeAccept(j){
 const pick=makePicker((j.seed031||1)+97);const a=pick(VOICE.rebut);let b=pick(VOICE.rebut.filter(t=>t!==a));persist();return [a,b];
}
const WITHDRAW_TALK=['그래, 아직은 괜찮아. 오늘은 여기까지만 하자.','도망치는 거 아니야. 잠깐 숨을 고르는 거지. 나는 기다릴 수 있어.','다시 무너지는 날, 내가 제일 먼저 네 이름을 불러 줄게.'];
const TWIST_TALK=['그래, 그거면 돼. 이제 아무것도 참지 않아도 돼.','봐, 하나도 아프지 않지? 이게 원래의 너야.','애썼어. 이제 그만 내려놔. 나머지는 네 마음이 알아서 할 거야.'];
// 선택지: 대호수에서 고래잡이배를 모는 선장이자 도시 사람이 직접 하는 말
const SAY={
 force:'그 입 닥쳐. 이 호수에서 작살 쥐고 여기까지 살아 나온 게 누군데. 내 배 키는 내가 잡아.',
 accept:'…그래, 안다. 이 도시에서 뭐 하나 뜻대로 된 적 없었지. 물때도, 고래도, 선원들 목숨도. 그래도 그거랑 네 말 듣는 건 별개야.',
 yield:'…이제 됐어. 장부 맞추고, 시신도 못 건지고, 또 출항하고. 그 짓 더는 못 하겠다. 네 말대로 해.',
 duty:'잃은 놈들은 못 건진다. 그건 나도 알아. 그래도 남은 놈들 태우고 항구에 배 대는 것까진 선장인 내 몫이야.',
 yield2:'…그만하자. 이 도시에서 내 짐 대신 져 준 놈, 하나도 없었어.'
};

/* ---------- 덧씌우는 화면 ---------- */
let ov=null,ovKey='',timers=[],raf=0,raf2=0,glfx=null;
function clearOv(){timers.forEach(clearTimeout);timers=[];if(raf)cancelAnimationFrame(raf);raf=0;if(raf2){cancelAnimationFrame(raf2);raf2=0;}if(glfx){try{glfx.destroy();}catch(e){}glfx=null;}if(ov){ov.remove();ov=null;}ovKey='';}
const at=(ms,fn)=>{timers.push(setTimeout(fn,reduce?Math.min(ms,ms*.6):ms));};
function want(){
 if(state.scene==='dead')return null;
 const j=state.mindJudge;
 if(j&&!H.isCalamity()){
  if(j.stage==='twist')return {key:'twist',kind:'twist'};
  if(!state.egoBloomed){
   if(j.stage==='bloom'&&!j.bloomFx031)return {key:'bloom',kind:'bloom'};
   if(j.stage==='withdraw')return {key:'withdraw',kind:'withdraw'};
   if(j.stage==='pending')return {key:'voice:'+(j.voice030||'intro')+':'+H.acceptTries(),kind:j.voice030==='accept2'?'accept2':'intro'};
  }
 }
 if(state.shinFx031&&!state.mindJudge)return {key:'shin:'+state.shinFx031.name,kind:'shin'};
 if(state.mangFx038&&!state.mindJudge)return {key:'mang:'+state.mangFx038.n+':'+state.mangFx038.at,kind:'mang'};
 return null;
}
function syncOverlay(){
 let w=null;try{w=want();}catch(e){w=null;}
 if(!w){if(ov)clearOv();return;}
 if(w.key===ovKey&&ov&&ov.isConnected)return;
 const chained=!!(ov&&ov.isConnected&&!ov.classList.contains('out'));   // 목소리 화면끼리 이어질 때는 게임 화면이 비치지 않게 바로 바꿈
 clearOv();
 ov=document.createElement('div');ov.className='hv-ov hv-'+w.kind+(chained?' hv-chain':'');ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
 document.body.appendChild(ov);ovKey=w.key;
 try{MOUNT[w.kind](ov,state.mindJudge);}catch(e){console.warn(e);}
}

/* ---------- 목소리: 메아리 → 이제야 → 생애에 맞춘 말 → 선택 ---------- */
// 목소리 화면: 햇살 셰이더(되면) 위에 메아리 · 문장 · 선택지
function voiceShell(o,glopt){
 o.innerHTML='<div class="hv-glow" aria-hidden="true"></div><div class="hv-echoes" aria-hidden="true"></div><div class="hv-center"><div class="hv-lines"></div><div class="hv-note"></div><div class="hv-actions"></div></div><div class="hv-skip">화면을 누르면 건너뜁니다</div>';
 const fx=glLayer(o,'voice',Object.assign({c:.2},glopt||{}));
 return {fx,echoes:o.querySelector('.hv-echoes'),lines:o.querySelector('.hv-lines'),note:o.querySelector('.hv-note'),acts:o.querySelector('.hv-actions'),skip:o.querySelector('.hv-skip')};
}
const swell=(v,c,ring)=>{if(!v.fx)return;v.fx.set('c',c);if(ring&&v.fx.now)v.fx.set('d',v.fx.now());};
// 강조할 말: 이 선장의 이름 · 지어 준 선원 이름 · 신의 이름 · 유혹의 핵심어
const EM_WORDS=['괜찮아','마음','다시 태어날','다시 태어나','네 뜻','바라는','원래의','솔직해지면','진짜 목소리','너를 위해','도시','답해 주렴','기다리고 있었어','내려놓아도','내려놔'];
function emph(text){
 let h=esc(text);const m=H.memory(),names=[];
 (m.lost||[]).forEach(c=>{if(c.custom&&c.name)names.push(c.name);});
 const cap=String(state.captainName||'').trim();if(cap)names.push(cap);
 if(state.shinName030)names.push(state.shinName030.replace(/\(望\)$/,''));
 const words=[...new Set(names.map(esc).concat(EM_WORDS))].filter(w=>w&&w.length>0).sort((a,b)=>b.length-a.length);
 if(!words.length)return h;
 const re=new RegExp(words.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
 return h.replace(re,w=>'<em class="hv-em">'+w+'</em>');
}
function showLines(el,arr,start,gap){arr.forEach((t,i)=>at(start+i*gap,()=>{const p=document.createElement('p');p.className='sweep';p.innerHTML='“'+emph(t)+'”';el.appendChild(p);}));return start+arr.length*gap;}
function mountIntro(o,j){
 const v=voiceShell(o);
 if(!Array.isArray(j.lines031)){j.lines031=composeVoice(j);persist();}
 const seq=j.lines031;
 const actHTML=btn(SAY.force,'egoForce030','primary')+btn(SAY.accept,'egoAccept030')+btn(SAY.yield,'egoYield030','yield');
 let done=false;
 const finish=()=>{if(done)return;done=true;timers.forEach(clearTimeout);timers=[];v.echoes.innerHTML='';v.lines.innerHTML=seq.map(t=>'<p class="now">“'+emph(t)+'”</p>').join('');swell(v,.72,false);v.acts.innerHTML=actHTML;v.acts.classList.add('on');v.skip.remove();j.echoDone031=true;persist();};
 o.addEventListener('click',e=>{if(e.target.closest('button'))return;finish();});
 if(j.echoDone031){finish();return;}
 // 메아리: 1 → 2 → 4 → 8 → 16 → 32 → 64 → 128
 const spans=[];let html='';
 for(let i=0;i<128;i++){
  if(i===0){html+='<span class="hv-echo hv-main">'+ECHO+'</span>';continue;}
  // 가운데를 비워 두고 화면 전체에 흩뿌림(메아리일수록 작고 멀게)
  let x,y,tries=0;do{x=4+R(i*3.1)*92;y=5+R(i*7.7+1)*90;tries++;}while(Math.abs(x-50)<24&&Math.abs(y-46)<7&&tries<6);
  const s=(.55+R(i*5.3)*.7)*(i<16?1.08:i<64?.95:.82),rot=(R(i*9.1)-.5)*7,o2=(.1+R(i*2.9)*.26).toFixed(2),d=(R(i*4.7)*2.4).toFixed(2);
  html+='<span class="hv-echo" style="left:'+x.toFixed(1)+'%;top:'+y.toFixed(1)+'%;--s:'+s.toFixed(2)+';--r:'+rot.toFixed(1)+'deg;--o:'+o2+';--d:'+d+'s">'+ECHO+'</span>';
 }
 v.echoes.innerHTML=html;v.echoes.querySelectorAll('.hv-echo').forEach(s=>spans.push(s));
 const counts=[1,2,4,8,16,32,64,128],times=[300,1300,2200,3000,3700,4300,4800,5250];
 let shown=0;
 counts.forEach((n,si)=>at(times[si],()=>{for(let i=shown;i<n;i++)spans[i].classList.add('on');shown=n;if(n>=16)v.echoes.classList.add('echoing');o.style.setProperty('--swell',(si/7).toFixed(2));swell(v,.18+.6*si/7,si>0);}));
 at(6900,()=>{v.echoes.classList.add('gone');swell(v,.3,false);});
 at(7900,()=>swell(v,.7,true));   // "이제야…"에서 다시 부드럽게 밝아짐
 const end=showLines(v.lines,seq,7900,1500);
 at(end+500,()=>{finish();});
}
function mountAccept2(o,j){
 const v=voiceShell(o,{b:1,c:.62});v.skip.remove();
 if(!Array.isArray(j.accept031)){j.accept031=composeAccept(j);persist();}
 const end=showLines(v.lines,j.accept031,300,1400);
 at(end+300,()=>{v.acts.innerHTML=btn(SAY.duty,'egoAcceptDuty030','primary')+btn(SAY.yield2,'egoYield030','yield');v.acts.classList.add('on');});
}
function mountWithdraw(o,j){
 const v=voiceShell(o,{c:.55});v.skip.remove();const w=j.withdraw||{};
 for(let i=1;i<=20;i++)at(i*130,()=>{if(v.fx)v.fx.set('a',i/20);});   // 햇살이 멀어지며 어두워짐
 const w2=WITHDRAW_TALK.slice(),a1=w2.splice(Math.floor(R((j.seed031||3)+5)*w2.length),1)[0],a2=w2[Math.floor(R((j.seed031||3)+9)*w2.length)];
 const end=showLines(v.lines,[a1,a2],300,1400);
 at(end+200,()=>{v.note.innerHTML='목소리가 멀어지고, 선장은 벼랑 끝에서 한 걸음 물러났습니다.<br>선장 정신력 최대치 -'+(w.max|0)+' ('+(w.cap|0)+')'+(w.mind?' · 돌아오는 정신력 -'+w.mind:'');v.note.classList.add('on');
  v.acts.innerHTML=btn('숨을 고르고 물러난다','egoWithdrawGo030','primary');v.acts.classList.add('on');});
}

/* ---------- 사람 형체(선장): 정면, 외투 ---------- */
const FIGURE='<g class="hv-fig"><circle cx="0" cy="-86" r="13"/><path d="M-9,-73 Q0,-70 9,-73 L26,-64 Q31,-61 32,-54 L36,-12 Q36,-8 33,-8 L30,-10 L26,-50 L24,-26 L28,36 Q29,44 20,46 L6,46 L3,8 L-3,8 L-6,46 L-20,46 Q-29,44 -28,36 L-24,-26 L-26,-50 L-30,-10 L-33,-8 Q-36,-8 -36,-12 L-32,-54 Q-31,-61 -26,-64 Z"/></g>';

/* ---------- 연출 FX 공통: 화면 전체 입자(캔버스) · 섬광 · 충격파 · 흔들림 · 화면 금 · 빛기둥 ----------
   E.G.O 개화: 껍질이 깨지는 순간 화면이 흔들리고 섬광 · 겹친 충격파(색이 갈라짐)가 퍼지며, 불꽃 파편이 사방으로 튀고 빛의 꽃잎과 빛가루가 흩날린다.
   뒤틀림: 화면에 잡음 · 어긋난 줄(글리치)이 번지고, 아래에서 검붉은 먹물 같은 덩굴이 기어오르며 재가 떠오른다. 이름이 새겨질 때 화면 유리가 깨지듯 금이 간다.
   신 발현: 고동마다 화면이 울리고, 발밑에서 금빛 빛기둥이 솟으며 등 뒤로 心 자와 빛살이 떠오르고, 불티가 화면 전체로 날아오른다. */
function fxRoot(o,front){
 const c=document.createElement('canvas');c.className='hv-fxc'+(front?' front':' back');
 if(front)o.appendChild(c);else o.insertBefore(c,o.firstChild);
 const dpr=Math.min(1.5,window.devicePixelRatio||1);
 const fit=()=>{c.width=Math.round(innerWidth*dpr);c.height=Math.round(innerHeight*dpr);};fit();
 return {c,g:c.getContext('2d'),dpr,fit};
}
function svgPt(o,x,y){const s=o.querySelector('.hv-svg');if(!s)return [innerWidth/2,innerHeight/2];const r=s.getBoundingClientRect();return [r.left+(x+200)/400*r.width,r.top+(y+200)/400*r.height];}
// 흔들림은 CSS 애니메이션을 건드리지 않도록 Web Animations로(겹쳐도 화면이 다시 페이드되지 않게)
const SHAKES={'hv-shake':[[0,0],[-7,4],[6,-5],[-5,-3],[4,5],[-3,2],[2,-1],[0,0]],'hv-shake-hard':[[0,0,0],[-14,6,-.6],[12,-9,.5],[-9,-6,0],[8,8,-.3],[-5,3,0],[3,-2,0],[0,0,0]]};
function shake(o,cls,ms){if(reduce||!o.animate)return;
 if(cls==='hv-thump'){o.animate([{transform:'scale(1)'},{transform:'scale(1.012)'},{transform:'scale(.996)'},{transform:'scale(1)'}],{duration:ms,easing:'ease-out'});return;}
 const k=SHAKES[cls]||SHAKES['hv-shake'];o.animate(k.map(p=>({transform:'translate('+p[0]+'px,'+p[1]+'px) rotate('+(p[2]||0)+'deg)'})),{duration:ms,easing:'linear'});}
function addEl(o,html){const d=document.createElement('div');d.innerHTML=html;const el=d.firstChild;o.appendChild(el);return el;}
function loop(fn){const t0=performance.now();let last=t0;const f=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;fn((now-t0)/1000,dt);raf2=requestAnimationFrame(f);};raf2=requestAnimationFrame(f);}

function fxBloom(o){
 const F=fxRoot(o,true),g=F.g,P=[];
 addEl(o,'<div class="hv-pillar" aria-hidden="true"></div>');
 addEl(o,'<div class="hv-flashscr" aria-hidden="true"></div>');
 ['','c2','c3'].forEach(c=>addEl(o,'<div class="hv-shock '+c+'" aria-hidden="true"></div>'));
 const burst=()=>{const [cx,cy]=svgPt(o,0,0);for(let i=0;i<90;i++){const a=R(i*3.3)*Math.PI*2,sp=(280+R(i*7.1)*620)*(.6+.4*R(i));P.push({k:'spark',x:cx,y:cy,px:cx,py:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:0,max:.7+R(i*2.2)*.8,w:1+R(i*5.5)*1.6});}};
 at(2150,()=>{o.classList.add('hv-shatter');shake(o,'hv-shake',600);burst();});
 let petalOn=false;at(2500,()=>{petalOn=true;});
 loop((t,dt)=>{
  F.c.width!==Math.round(innerWidth*F.dpr)&&F.fit();
  const W=F.c.width/F.dpr,Hh=F.c.height/F.dpr;g.setTransform(F.dpr,0,0,F.dpr,0,0);g.clearRect(0,0,W,Hh);
  if(petalOn&&P.filter(p=>p.k==='petal').length<46&&Math.random()<.5){const [cx,cy]=svgPt(o,0,0),a=Math.random()*Math.PI*2,r=20+Math.random()*60;
   P.push({k:'petal',x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,vx:Math.cos(a)*(40+Math.random()*90),vy:Math.sin(a)*(40+Math.random()*60)-30,life:0,max:3.5+Math.random()*2.5,rot:Math.random()*6,vr:(Math.random()-.5)*3,s:3+Math.random()*4});}
  if(t>1&&Math.random()<.25)P.push({k:'mote',x:Math.random()*W,y:Hh+5,vx:(Math.random()-.5)*10,vy:-(12+Math.random()*26),life:0,max:5+Math.random()*4,s:.6+Math.random()*1.2});
  g.globalCompositeOperation='lighter';
  for(let i=P.length-1;i>=0;i--){const p=P[i];p.life+=dt;if(p.life>p.max){P.splice(i,1);continue;}const u=p.life/p.max;
   if(p.k==='spark'){p.px=p.x;p.py=p.y;p.vx*=1-dt*2.6;p.vy=p.vy*(1-dt*2.6)+220*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    g.strokeStyle='rgba(255,'+(220-u*90|0)+','+(150-u*110|0)+','+(1-u).toFixed(3)+')';g.lineWidth=p.w*(1-u*.6);g.beginPath();g.moveTo(p.px-(p.x-p.px)*2,p.py-(p.y-p.py)*2);g.lineTo(p.x,p.y);g.stroke();}
   else if(p.k==='petal'){p.vx*=1-dt*1.2;p.vy=p.vy*(1-dt*1.2)+26*dt;p.x+=p.vx*dt+Math.sin(p.life*2+p.rot)*12*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
    const al=Math.min(1,p.life*3)*(1-u);g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.scale(1,.45+.35*Math.abs(Math.sin(p.life*2.4+p.rot)));
    g.fillStyle='rgba(255,236,190,'+(al*.85).toFixed(3)+')';g.beginPath();g.ellipse(0,0,p.s,p.s*.55,0,0,Math.PI*2);g.fill();g.restore();}
   else{p.x+=p.vx*dt;p.y+=p.vy*dt;g.fillStyle='rgba(255,226,170,'+(Math.sin(Math.PI*u)*.6).toFixed(3)+')';g.beginPath();g.arc(p.x,p.y,p.s,0,Math.PI*2);g.fill();}
  }
  g.globalCompositeOperation='source-over';
 });
}

function fxTwist(o,B){
 const BK=fxRoot(o,false),FR=fxRoot(o,true),A=[];
 addEl(o,'<div class="hv-scan" aria-hidden="true"></div>');
 addEl(o,'<div class="hv-flashscr red" aria-hidden="true"></div>');
 // 화면 유리에 가는 금(이름이 새겨질 때)
 let cr='';const ix=58+R(3)*10,iy=30+R(5)*12;for(let i=0;i<13;i++){const a=i/13*Math.PI*2+R(i)*.4;let x=ix,y=iy,d='M'+ix.toFixed(1)+','+iy.toFixed(1);const len=30+R(i*9)*60;
  for(let s=1;s<=6;s++){const rr=len*s/6,aa=a+(R(i*7+s)-.5)*.35;x=ix+Math.cos(aa)*rr;y=iy+Math.sin(aa)*rr*1.3;d+=' L'+x.toFixed(1)+','+y.toFixed(1);}cr+='<path d="'+d+'" style="--d:'+(R(i*3)*.25).toFixed(2)+'s"/>';}
 for(let r=1;r<=2;r++){let d='';for(let i=0;i<=13;i++){const a=i/13*Math.PI*2,rr=r*5+R(i*r)*3;d+=(i?' L':'M')+(ix+Math.cos(a)*rr).toFixed(1)+','+(iy+Math.sin(a)*rr*1.3).toFixed(1);}cr+='<path d="'+d+'" style="--d:.2s"/>';}
 addEl(o,'<svg class="hv-scrack" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+cr+'</svg>');
 const T=[];for(let i=0;i<16;i++)T.push({x:(i+.5)/16+(R(i*4)-.5)*.05,seed:R(i*7)*10,h:.35+R(i*9)*.45,w:5+R(i*3)*9,delay:R(i*5)*1.4});
 let on=false,named=false;at(B,()=>{on=true;});
 at(B+2700,()=>{named=true;o.classList.add('hv-cracked');shake(o,'hv-shake-hard',700);});
 const t1=performance.now();
 loop((t,dt)=>{
  const now=(performance.now()-t1),k=on?Math.max(0,Math.min(1,(now-B)/2600)):0;
  [BK,FR].forEach(F=>{F.c.width!==Math.round(innerWidth*F.dpr)&&F.fit();F.g.setTransform(F.dpr,0,0,F.dpr,0,0);F.g.clearRect(0,0,F.c.width,F.c.height);});
  const W=innerWidth,Hh=innerHeight,g=BK.g,f=FR.g;
  // 아래에서 기어오르는 먹물 덩굴(배경)
  if(on)T.forEach((v,i)=>{const gk=Math.max(0,Math.min(1,(now-B)/1000/2.4-v.delay*.3));if(gk<=0)return;const top=Hh*(1-v.h*gk);let x=v.x*W,y=Hh+10;
   g.beginPath();g.moveTo(x,y);const steps=18;for(let s=1;s<=steps;s++){const yy=Hh+10-(Hh+10-top)*s/steps;const xx=x+Math.sin(s*.7+v.seed+t*1.3)*14*(s/steps)+Math.sin(s*1.9+v.seed)*6;g.lineTo(xx,yy);}
   g.strokeStyle='rgba(20,0,4,.92)';g.lineWidth=v.w;g.lineCap='round';g.lineJoin='round';g.stroke();g.strokeStyle='rgba(150,10,24,'+(.35*gk).toFixed(2)+')';g.lineWidth=1.2;g.stroke();});
  // 재: 천천히 떠오름
  if(on&&Math.random()<.5)A.push({x:Math.random()*W,y:Hh+8,vx:(Math.random()-.5)*14,vy:-(16+Math.random()*30),life:0,max:4+Math.random()*4,s:.8+Math.random()*1.8,r:Math.random()*6});
  for(let i=A.length-1;i>=0;i--){const p=A[i];p.life+=dt;if(p.life>p.max){A.splice(i,1);continue;}const u=p.life/p.max;p.x+=p.vx*dt+Math.sin(p.life*2+p.r)*8*dt;p.y+=p.vy*dt;
   g.fillStyle='rgba('+(110+R(i)*60|0)+',24,28,'+(Math.sin(Math.PI*u)*.65).toFixed(3)+')';g.fillRect(p.x,p.y,p.s,p.s*.7);}
  // 잡음 · 글리치(앞)
  if(on){const n=(140+260*k)|0;for(let i=0;i<n;i++){f.fillStyle='rgba(255,'+(Math.random()<.5?40:200)+','+(Math.random()<.5?60:210)+','+(Math.random()*.12*k).toFixed(3)+')';f.fillRect(Math.random()*W,Math.random()*Hh,1+Math.random()*2,1);}
   if(Math.random()<.12+.25*k){const bars=1+(Math.random()*3|0);for(let b=0;b<bars;b++){const y=Math.random()*Hh,h=2+Math.random()*16,off=(Math.random()-.5)*40;
    f.fillStyle='rgba(220,20,40,'+(.12+.18*k).toFixed(2)+')';f.fillRect(off,y,W,h);f.fillStyle='rgba(0,210,230,'+(.06+.1*k).toFixed(2)+')';f.fillRect(-off,y+h*.4,W,h*.5);
    if(Math.random()<.4){f.fillStyle='rgba(0,0,0,.6)';f.fillRect(0,y+h,W,1+Math.random()*3);}}}}
  if(named&&Math.random()<.04)shake(o,'hv-shake',260);
 });
}

function fxShin(o){
 const F=fxRoot(o,true),g=F.g,P=[];
 addEl(o,'<div class="hv-pillar gold" aria-hidden="true"></div>');
 addEl(o,'<div class="hv-flashscr warm" aria-hidden="true"></div>');
 const thump=()=>{shake(o,'hv-thump',380);o.classList.remove('hv-beat-fl');void o.offsetWidth;o.classList.add('hv-beat-fl');};
 at(2600,thump);at(3020,thump);
 at(3000,()=>{o.classList.add('hv-ignite');const [cx,cy]=svgPt(o,0,-22);for(let i=0;i<70;i++){const a=R(i*2.7)*Math.PI*2,sp=160+R(i*5.3)*380;P.push({k:'spark',x:cx,y:cy,px:cx,py:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-80,life:0,max:.8+R(i)*.9,w:1+R(i*3)*1.4});}});
 let on=false;at(3000,()=>{on=true;});
 loop((t,dt)=>{
  F.c.width!==Math.round(innerWidth*F.dpr)&&F.fit();const W=F.c.width/F.dpr,Hh=F.c.height/F.dpr;g.setTransform(F.dpr,0,0,F.dpr,0,0);g.clearRect(0,0,W,Hh);
  if(on&&Math.random()<.9){const [fx,fy]=svgPt(o,(Math.random()-.5)*120,60),wide=Math.random()<.35;
   P.push({k:'ember',x:wide?Math.random()*W:fx,y:wide?Hh+6:fy,vx:(Math.random()-.5)*20,vy:-(40+Math.random()*90),life:0,max:2+Math.random()*2.6,s:.6+Math.random()*1.8,ph:Math.random()*6});}
  g.globalCompositeOperation='lighter';
  for(let i=P.length-1;i>=0;i--){const p=P[i];p.life+=dt;if(p.life>p.max){P.splice(i,1);continue;}const u=p.life/p.max;
   if(p.k==='spark'){p.px=p.x;p.py=p.y;p.vx*=1-dt*2.4;p.vy=p.vy*(1-dt*2.4)+60*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    g.strokeStyle='rgba(255,'+(214-u*80|0)+','+(120-u*90|0)+','+(1-u).toFixed(3)+')';g.lineWidth=p.w;g.beginPath();g.moveTo(p.px-(p.x-p.px)*2,p.py-(p.y-p.py)*2);g.lineTo(p.x,p.y);g.stroke();}
   else{p.x+=p.vx*dt+Math.sin(p.life*3+p.ph)*16*dt;p.y+=p.vy*dt;const al=Math.sin(Math.PI*u)*(.6+.4*Math.sin(p.life*14+p.ph));
    const gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,p.s*3);gr.addColorStop(0,'rgba(255,240,190,'+al.toFixed(3)+')');gr.addColorStop(1,'rgba(255,150,40,0)');g.fillStyle=gr;g.beginPath();g.arc(p.x,p.y,p.s*3,0,Math.PI*2);g.fill();}
  }
  g.globalCompositeOperation='source-over';
 });
}

/* ---------- 셰이더 연출(WebGL2): 되면 이것으로, 안 되면 아래의 선 · 도형 연출로 ---------- */
function glLayer(o,kind,opt){
 opt=opt||{};opt.scale=opt.scale||.7;
 if(!window.HeartGL||!HeartGL.supported())return null;
 const c=document.createElement('canvas');c.className='hv-gl';c.setAttribute('aria-hidden','true');o.insertBefore(c,o.firstChild);
 let fx=null;try{fx=HeartGL.create(c,kind,opt);}catch(e){fx=null;}
 if(!fx){c.remove();return null;}
 glfx=fx;o.classList.add('hv-gl-on');
 const tz=performance.now();fx.now=()=>(performance.now()-tz)/1000;
 // 느린 기기에서는 해상도를 스스로 낮춤(프레임이 45ms보다 오래 걸리면 80%씩, 최저 35%)
 const t0=performance.now();let last=t0,acc=0,n=0;
 const f=()=>{if(!o.isConnected)return;const now=performance.now();acc+=now-last;last=now;n++;
  if(n>=20){if(acc/n>45&&opt.scale>.36){opt.scale*=.8;fx.set('scale',opt.scale);}acc=0;n=0;}
  fx.render((now-t0)/1000);raf2=requestAnimationFrame(f);};raf2=requestAnimationFrame(f);
 return fx;
}
function bloomGL(o,j){
 const host=document.createElement('div');host.innerHTML='<div class="hv-title"><div class="hv-big">E.G.O</div><div class="hv-sub">마음이 껍질을 깨고 피어납니다</div></div>';
 o.innerHTML='';o.appendChild(host.firstChild);
 if(!glLayer(o,'bloom',{seed:(j&&j.seed031)||7,title:'E.G.O',sub:'마음이 껍질을 깨고 피어납니다'}))return false;
 o.classList.add('hv-gltitle');   // 글자는 셰이더 안에서 그림(화면 읽기용 글자는 남겨 둠)
 at(2150,()=>shake(o,'hv-shake',600));
 let done=false;const finish=()=>{if(done)return;done=true;o.classList.add('out');at(700,()=>{const jj=state.mindJudge;if(jj&&jj.stage==='bloom'){jj.bloomFx031=true;persist();}clearOv();render();});};
 o.addEventListener('click',finish);at(6400,finish);return true;
}
function twistGL(o,j,voiced,direct,cap){
 const B=direct?250:voiced?2200:600;
 o.innerHTML='<div class="hv-center"><div class="hv-lines">'+(voiced?'<p class="warm">“'+esc(j.twistLine031)+'”</p>':'')+'</div>'+
  '<div class="hv-dtitle"><div class="hv-dbig" data-t="뒤틀림">뒤틀림</div><div class="hv-dsub">'+esc((cap?'선장 '+cap:'선장'))+'이었던 것</div></div>'+
  '<div class="hv-actions">'+btn(voiced?'목소리를 따라간다':'뒤틀림을 받아들인다','mindTwistEnd','danger')+'</div></div>';
 if(!glLayer(o,'twist',{a:B/1000,b:(B+2700)/1000,seed:(j&&j.seed031)||5}))return false;
 at(B,()=>o.classList.add('turning'));
 at(B+2700,()=>{o.classList.add('named');shake(o,'hv-shake-hard',700);});
 at(B+3600,()=>o.querySelector('.hv-actions').classList.add('on'));
 o.addEventListener('click',e=>{if(e.target.closest('button'))return;timers.forEach(clearTimeout);timers=[];o.classList.add('turning','named');o.querySelector('.hv-actions').classList.add('on');});
 return true;
}
function shinGL(o){
 const fx=state.shinFx031||{},words=(fx.words||[]).slice(0,7),name=String(fx.name||'');
 const R0=Math.min(innerWidth,innerHeight)*.34;
 let ws='';words.forEach((w,i)=>{const a=-Math.PI/2+(i-(words.length-1)/2)*.62+(R(i)-.5)*.2,x=Math.cos(a)*R0*1.25,y=Math.sin(a)*R0*.85;
  ws+='<span class="hv-word" style="left:calc(50% + '+x.toFixed(0)+'px);top:calc(40% + '+y.toFixed(0)+'px);--tx:'+(-x).toFixed(0)+'px;--ty:'+(-y).toFixed(0)+'px;--d:'+(.35+i*.22).toFixed(2)+'s">'+esc(w)+'</span>';});
 o.innerHTML='<div class="hv-words" aria-hidden="true">'+ws+'</div><div class="hv-title shin"><div class="hv-big">'+[...name].map((ch,i)=>'<span style="--i:'+i+'">'+esc(ch)+'</span>').join('')+'</div><div class="hv-rule"></div><div class="hv-sub">신(心) 발현</div></div>';
 if(!glLayer(o,'shin',{a:2.6,b:3.0,seed:7}))return false;
 at(2600,()=>shake(o,'hv-thump',380));at(3020,()=>shake(o,'hv-thump',380));at(3000,()=>shake(o,'hv-shake',420));
 let done=false;const finish=()=>{if(done)return;done=true;o.classList.add('out');at(700,()=>{delete state.shinFx031;persist();clearOv();});};
 o.addEventListener('click',finish);at(8600,finish);return true;
}

/* ---------- E.G.O 개화 ---------- */
function mountBloom(o,j){
 if(bloomGL(o,j))return;
 const A=[-.2,.5,1.15,1.9,2.55,3.2,3.95,4.6,5.4],RS=96;
 let cracks='',shards='',petals='',rays='';
 A.forEach((a,i)=>{let d='M0,0',r=0,ang=a;while(r<RS){r=Math.min(RS,r+12+R(i*11+r)*14);ang=a+(R(i*13+r)-.5)*.32;d+=' L'+(Math.cos(ang)*r).toFixed(1)+','+(Math.sin(ang)*r).toFixed(1);}
  cracks+='<path class="hv-crack" d="'+d+'" style="--d:'+(.9+i*.09).toFixed(2)+'s"/>';
  const br=40+R(i*3)*30,ba=a+(R(i*5)-.5)*.5,bx=Math.cos(ba)*br,by=Math.sin(ba)*br,ex=bx+Math.cos(ba+.7)*18,ey=by+Math.sin(ba+.7)*18;
  cracks+='<path class="hv-crack thin" d="M'+bx.toFixed(1)+','+by.toFixed(1)+' L'+ex.toFixed(1)+','+ey.toFixed(1)+'" style="--d:'+(1.3+i*.07).toFixed(2)+'s"/>';
  const a1=A[(i+1)%A.length]+(i===A.length-1?Math.PI*2:0),am=(a+a1)/2,r0=8+R(i*7)*14;
  const pts=[[Math.cos(a)*r0,Math.sin(a)*r0],[Math.cos(a)*RS,Math.sin(a)*RS],[Math.cos(am)*RS*1.02,Math.sin(am)*RS*1.02],[Math.cos(a1)*RS,Math.sin(a1)*RS],[Math.cos(a1)*r0,Math.sin(a1)*r0]];
  shards+='<polygon class="hv-shard" points="'+pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')+'" style="--tx:'+(Math.cos(am)*190).toFixed(0)+'px;--ty:'+(Math.sin(am)*190+40).toFixed(0)+'px;--rot:'+((R(i*17)-.5)*160).toFixed(0)+'deg;--d:'+(2.25+R(i*19)*.15).toFixed(2)+'s"/>';
 });
 for(let i=0;i<10;i++)petals+='<g transform="rotate('+(i*36)+')"><path class="hv-petal outer" d="M0,0 C18,-26 20,-70 0,-112 C-20,-70 -18,-26 0,0 Z" style="--d:'+(2.45+i*.06).toFixed(2)+'s"/></g>';
 for(let i=0;i<10;i++)petals+='<g transform="rotate('+(18+i*36)+')"><path class="hv-petal inner" d="M0,0 C12,-18 13,-46 0,-74 C-13,-46 -12,-18 0,0 Z" style="--d:'+(2.75+i*.05).toFixed(2)+'s"/></g>';
 for(let i=0;i<28;i++){const a=i/28*Math.PI*2,r1=30,r2=150+R(i)*60;rays+='<path class="hv-ray" d="M'+(Math.cos(a)*r1).toFixed(1)+','+(Math.sin(a)*r1).toFixed(1)+' L'+(Math.cos(a)*r2).toFixed(1)+','+(Math.sin(a)*r2).toFixed(1)+'" style="--d:'+(2.2+R(i*3)*.3).toFixed(2)+'s"/>';}
 o.innerHTML='<svg class="hv-svg" viewBox="-200 -200 400 400" aria-hidden="true"><defs>'+
  '<radialGradient id="hvCore"><stop stop-color="#fffdf2"/><stop offset=".4" stop-color="#ffe7a6"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="hvShell" cx=".45" cy=".4"><stop stop-color="#1d1610"/><stop offset=".8" stop-color="#0d0a07"/><stop offset="1" stop-color="#2a2014"/></radialGradient>'+
  '<linearGradient id="hvPetal" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#fffbe8"/><stop offset=".45" stop-color="#ffd98a"/><stop offset="1" stop-color="#e8963a" stop-opacity=".55"/></linearGradient>'+
  '<filter id="hvBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>'+
  '<g class="hv-rays">'+rays+'</g>'+
  '<circle class="hv-flash" r="190" fill="url(#hvCore)"/>'+
  '<g class="hv-petals">'+petals+'</g>'+
  '<g class="hv-shell"><circle r="'+RS+'" fill="url(#hvShell)" stroke="#5a4428" stroke-width="1.2"/>'+shards+'</g>'+
  '<g class="hv-cracks" filter="url(#hvBlur)">'+cracks+'</g><g class="hv-cracks sharp">'+cracks+'</g>'+
  '<circle class="hv-core" r="14" fill="url(#hvCore)"/></svg>'+
  '<div class="hv-title"><div class="hv-big">E.G.O</div><div class="hv-sub">마음이 껍질을 깨고 피어납니다</div></div>';
 const pg=o.querySelector('.hv-petals'),t0=performance.now();const spin=now=>{const t=(now-t0)/1000;if(pg&&t>2.4&&!reduce)pg.setAttribute('transform','rotate('+((t-2.4)*16).toFixed(2)+')');raf=requestAnimationFrame(spin);};raf=requestAnimationFrame(spin);
 let done=false;const finish=()=>{if(done)return;done=true;o.classList.add('out');at(700,()=>{const jj=state.mindJudge;if(jj&&jj.stage==='bloom'){jj.bloomFx031=true;persist();}clearOv();render();});};
 o.addEventListener('click',finish);
 fxBloom(o);
 at(6200,finish);
}

/* ---------- 뒤틀림 ---------- */
function mountTwist(o,j){
 const voiced=!!(j&&j.voice030),direct=!!(j&&j.direct031),cap=String(state.captainName||'').trim();
 if(voiced&&j&&!j.twistLine031){j.twistLine031=direct?TWIST_TALK[Math.floor(R((j.seed031||1)+3)*2)]:TWIST_TALK[2];persist();}
 if(twistGL(o,j,voiced,direct,cap))return;
 let veins='';for(let i=0;i<16;i++){const a=i/16*Math.PI*2+R(i)*.3,r0=290;let x=Math.cos(a)*r0,y=Math.sin(a)*r0,d='M'+x.toFixed(0)+','+y.toFixed(0);
  for(let s=0;s<7;s++){const rr=r0-(s+1)*30,aa=a+(R(i*7+s)-.5)*.5;x=Math.cos(aa)*rr;y=Math.sin(aa)*rr;d+=' L'+x.toFixed(0)+','+y.toFixed(0);}veins+='<path class="hv-vein" d="'+d+'" style="--d:'+(2.3+R(i*3)*.8).toFixed(2)+'s"/>';}
 let spikes='';for(let i=0;i<11;i++){const sx=(R(i*5)-.5)*60,sy=-90+R(i*7)*130,a=Math.atan2(sy+20,sx)+(R(i*9)-.5)*.6,len=26+R(i*11)*46;
  spikes+='<path class="hv-spike" d="M'+(sx-3).toFixed(1)+','+sy.toFixed(1)+' L'+(sx+Math.cos(a)*len).toFixed(1)+','+(sy+Math.sin(a)*len).toFixed(1)+' L'+(sx+3).toFixed(1)+','+(sy+2).toFixed(1)+' Z" style="--d:'+(3.1+R(i*13)*1.1).toFixed(2)+'s"/>';}
 o.innerHTML='<div class="hv-red" aria-hidden="true"></div>'+
  '<svg class="hv-svg" viewBox="-200 -200 400 400" aria-hidden="true"><defs><filter id="hvTwist" x="-60%" y="-60%" width="220%" height="220%"><feTurbulence type="fractalNoise" baseFrequency=".022 .06" numOctaves="2" seed="7" result="n"><animate attributeName="baseFrequency" dur="3s" values=".022 .06;.03 .05;.022 .06" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" class="hv-disp"/></filter></defs>'+
  '<g class="hv-veins">'+veins+'</g>'+
  '<g class="hv-body" filter="url(#hvTwist)" transform="translate(0 30)"><g class="hv-stretch">'+FIGURE+'<g class="hv-spikes">'+spikes+'</g></g></g></svg>'+
  '<div class="hv-center"><div class="hv-lines">'+(voiced?'<p class="warm">“'+esc(j.twistLine031)+'”</p>':'')+'</div>'+
  '<div class="hv-dtitle"><div class="hv-dbig" data-t="뒤틀림">뒤틀림</div><div class="hv-dsub">'+esc((cap?'선장 '+cap:'선장'))+'이었던 것</div></div>'+
  '<div class="hv-actions">'+btn(voiced?'목소리를 따라간다':'뒤틀림을 받아들인다','mindTwistEnd','danger')+'</div></div>';
 const disp=o.querySelector('.hv-disp'),stretch=o.querySelector('.hv-stretch'),stage=o.querySelector('.hv-svg'),t0=performance.now(),B=direct?250:voiced?2200:600;
 const tick=now=>{const t=(now-t0)/1000*1000;const k=Math.max(0,Math.min(1,(t-B)/2600));
  if(disp)disp.setAttribute('scale',(k*k*46).toFixed(1));
  if(stretch)stretch.setAttribute('transform','scale('+(1-k*.12).toFixed(3)+' '+(1+k*.42).toFixed(3)+') skewX('+(Math.sin(t/180)*k*9).toFixed(1)+')');
  if(stage&&k>0&&k<1&&Math.random()<.18)stage.style.transform='translate(calc(-50% + '+((Math.random()-.5)*14*k).toFixed(1)+'px),calc(-50% + '+((Math.random()-.5)*4*k).toFixed(1)+'px))';else if(stage)stage.style.transform='';
  raf=requestAnimationFrame(tick);};
 raf=requestAnimationFrame(tick);
 at(B,()=>o.classList.add('turning'));
 at(B+2700,()=>o.classList.add('named'));
 fxTwist(o,B);
 at(B+3600,()=>o.querySelector('.hv-actions').classList.add('on'));
 o.addEventListener('click',e=>{if(e.target.closest('button'))return;timers.forEach(clearTimeout);timers=[];o.classList.add('turning','named');o.querySelector('.hv-actions').classList.add('on');});
}

/* ---------- 신(心) 발현 ----------
   ① 고요: 어둠 속 가슴에 희미한 불씨가 느리게 뛴다.
   ② 기억: 떠올린 이름과 바람이 흐릿하게 떠올랐다가 또렷해지고, 빛 알갱이로 부서져 소용돌이치며 가슴으로 빨려 든다.
   ③ 고동: 가슴의 불씨가 두 번 크게 뛰며 빛의 물결이 퍼진다.
   ④ 기운: 금빛 불꽃 같은 기운이 몸을 따라 피어올라 감싸고, 불티가 위로 날리며 발밑 물에 빛이 고인다(아지랑이처럼 일렁임).
   ⑤ 이름: 신의 이름이 한 글자씩 새겨진다.
   (망은 이 연출에 넣지 않는다 — 신이 발현하는 순간까지만) */
function mountShin(o){
 if(shinGL(o))return;
 const fx=state.shinFx031||{},words=(fx.words||[]).slice(0,7),name=String(fx.name||'');
 const CY=-52;   // 가슴(형체 기준)
 let frag='';words.forEach((w,i)=>{const a=-Math.PI/2+(i-(words.length-1)/2)*.62+(R(i)-.5)*.2,r=140+R(i*3)*36,x=Math.cos(a)*r,y=Math.sin(a)*r*.78+6;
  frag+='<text class="hv-frag" x="'+x.toFixed(0)+'" y="'+y.toFixed(0)+'" style="--tx:'+(-x).toFixed(0)+'px;--ty:'+(-(y)+CY+30).toFixed(0)+'px;--d:'+(.35+i*.22).toFixed(2)+'s">'+esc(w)+'</text>';});
 let motes='';for(let i=0;i<46;i++)motes+='<circle r="1"/>';
 let sparks='';for(let i=0;i<44;i++)sparks+='<circle r="1"/>';
 let flames='';for(let i=0;i<4;i++)flames+='<path class="hv-flame f'+i+'"/>';
 o.innerHTML='<svg class="hv-svg" viewBox="-200 -200 400 400" aria-hidden="true"><defs>'+
  '<radialGradient id="hvAura" cx=".5" cy=".62" r=".6"><stop stop-color="#fff2c0" stop-opacity=".95"/><stop offset=".35" stop-color="#ffc84a" stop-opacity=".75"/><stop offset=".75" stop-color="#ff8a1e" stop-opacity=".35"/><stop offset="1" stop-color="#ff6a00" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="hvAuraCore" cx=".5" cy=".6" r=".55"><stop stop-color="#fffbe8" stop-opacity=".9"/><stop offset=".5" stop-color="#ffe08a" stop-opacity=".55"/><stop offset="1" stop-color="#ffb040" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="hvEmber"><stop stop-color="#fffbe0"/><stop offset=".5" stop-color="#ffd060"/><stop offset="1" stop-color="#ff9a20" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="hvPool"><stop stop-color="#ffd27a" stop-opacity=".6"/><stop offset=".5" stop-color="#ffb040" stop-opacity=".18"/><stop offset="1" stop-color="#ffb040" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="hvHarpLit" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#ffcf6a"/><stop offset="1" stop-color="#fff6d8"/></linearGradient>'+
  '<filter id="hvFlameBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>'+
  '<filter id="hvHeat" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence class="hv-heatn" type="fractalNoise" baseFrequency=".03 .09" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>'+
  '<filter id="hvFigGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>'+
  '<filter id="hvRingGlow" x="-80%" y="-200%" width="260%" height="500%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'+
  '<filter id="hvSoftDot" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation=".8"/></filter></defs>'+
  '<g class="hv-srays" transform="translate(0 -6)">'+Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2;return '<path d="M'+(Math.cos(a)*40).toFixed(1)+','+(Math.sin(a)*40).toFixed(1)+' L'+(Math.cos(a)*(170+R(i)*40)).toFixed(1)+','+(Math.sin(a)*(170+R(i)*40)).toFixed(1)+'"/>';}).join('')+'</g>'+
  '<text class="hv-glyph" x="0" y="34" aria-hidden="true">心</text>'+
  '<g transform="translate(0 30)">'+
   '<ellipse class="hv-pool" cx="0" cy="47" rx="96" ry="13" fill="url(#hvPool)"/>'+
   '<g class="hv-ripples">'+[0,1,2].map(i=>'<ellipse cx="0" cy="47" rx="30" ry="5" style="--d:'+(3.1+i*.9)+'s"/>').join('')+'</g>'+
   '<g class="hv-aura" filter="url(#hvHeat)">'+flames+'</g>'+
   '<g class="hv-figglow" filter="url(#hvFigGlow)">'+FIGURE+'</g>'+
   FIGURE+
   '<circle class="hv-ember" cx="0" cy="'+CY+'" r="16" fill="url(#hvEmber)"/>'+
   '<g class="hv-beats"><circle class="hv-beat" cx="0" cy="'+CY+'" r="6"/><circle class="hv-beat" cx="0" cy="'+CY+'" r="6"/></g>'+
   '<g class="hv-motes" filter="url(#hvSoftDot)">'+motes+'</g>'+
   '<g class="hv-sparks">'+sparks+'</g>'+
  '</g><g class="hv-frags">'+frag+'</g></svg>'+
  '<div class="hv-title shin"><div class="hv-big">'+[...name].map((ch,i)=>'<span style="--i:'+i+'">'+esc(ch)+'</span>').join('')+'</div><div class="hv-rule"></div><div class="hv-sub">신(心) 발현</div></div>';
 const q=s=>o.querySelector(s),qa=s=>[...o.querySelectorAll(s)];
 const fl=qa('.hv-flame'),motesE=qa('.hv-motes circle'),sparkE=qa('.hv-sparks circle'),beats=qa('.hv-beat');
 const figGlow=q('.hv-figglow'),pool=q('.hv-pool'),heat=q('.hv-heatn'),ember=q('.hv-ember');
 const t0=performance.now(),sp=reduce?1.6:1;
 const T={mem:.3,beat:2.6,aura:3.0};
 const tick=now=>{const t=(now-t0)/1000*sp,k=Math.max(0,Math.min(1,(t-T.aura)/1.5));
  // ① 가슴의 희미한 불씨(느린 박동) → ③ 두 번 크게 뜀 → 이후 고르게 타오름
  let ek=.18+.1*Math.max(0,Math.sin(t*3.2));
  [T.beat,T.beat+.42].forEach(b=>{const d=t-b;if(d>0&&d<.5)ek=Math.max(ek,1.25-d*.9);});
  if(t>T.beat+.9)ek=Math.max(ek,.85+.08*Math.sin(t*5));
  ember.setAttribute('transform','translate(0 '+CY+') scale('+ek.toFixed(3)+') translate(0 '+(-CY)+')');ember.style.opacity=Math.min(1,.25+ek*.75).toFixed(3);
  beats.forEach((c,i)=>{const d=t-(T.beat+i*.42);if(d<0||d>1.6){c.style.opacity='0';return;}const u=d/1.6;c.setAttribute('r',(8+u*150).toFixed(1));c.style.opacity=((1-u)*(1-u)*.7).toFixed(3);c.style.strokeWidth=(2.4-u*2).toFixed(2);});
  // ② 기억이 빛 알갱이가 되어 소용돌이치며 가슴으로
  motesE.forEach((c,i)=>{const st=T.mem+.9+R(i*3)*1.5,du=1.1+R(i*5)*.7,p=(t-st)/du;if(p<0||p>1){c.style.opacity='0';return;}
   const a0=R(i*7)*Math.PI*2,r0=110+R(i*11)*90,r=r0*Math.pow(1-p,1.5),a=a0+p*2.4*(i%2?1:-1);
   c.setAttribute('cx',(Math.cos(a)*r).toFixed(1));c.setAttribute('cy',(CY+Math.sin(a)*r*.82).toFixed(1));c.setAttribute('r',(1.6-p*.9).toFixed(2));c.style.opacity=(Math.sin(Math.PI*Math.min(1,p*1.2))*.95).toFixed(3);});
  // ④ 금빛 기운: 바깥 불꽃 3겹 + 몸에 붙은 안쪽 불꽃
  fl.forEach((p,li)=>{const inner=li===3,sc=inner?.82:1+li*.16;let d='';const N=44;
   for(let i=0;i<=N;i++){const u=i/N,a=Math.PI*2*u,rx=46*sc,ry=82*sc;
    const up=Math.max(0,-Math.sin(a)),flick=Math.sin(a*5+t*7+li)*.5+Math.sin(a*9-t*11+li*2)*.35+Math.sin(a*3+t*4.3)*.4+Math.sin(a*14+t*15+li)*.18;
    const r=1+flick*.07*k+up*up*(.18+.24*k)*(.7+.3*Math.sin(t*6+u*20));
    d+=(i?' L':'M')+(Math.cos(a)*rx*r).toFixed(1)+','+(-20+Math.sin(a)*ry*r-up*up*(inner?14:26)*k).toFixed(1);}
   p.setAttribute('d',d+' Z');p.setAttribute('fill',inner?'url(#hvAuraCore)':'url(#hvAura)');p.style.opacity=(k*(inner?.75:.85-li*.2)).toFixed(3);});
  figGlow.style.opacity=(k*.9).toFixed(3);pool.style.opacity=(k*(.8+.15*Math.sin(t*3))).toFixed(3);
  if(heat)heat.setAttribute('baseFrequency',(.03+Math.sin(t*1.7)*.004).toFixed(4)+' '+(.09+Math.sin(t*2.3)*.01).toFixed(4));
  // 불티: 기운 가장자리에서 위로 날림
  sparkE.forEach((c,i)=>{if(k<=0){c.style.opacity='0';return;}const per=1.2+R(i)*1.1,ph=((t+R(i*3)*per)/per)%1,cyc=Math.floor((t+R(i*3)*per)/per);
   const sx=(R(i*5+cyc)-.5)*90,sy=10-R(i*7+cyc)*70,x=sx+Math.sin(ph*6+i)*4*ph,y=sy-ph*(70+R(i*9)*60);
   c.setAttribute('cx',x.toFixed(1));c.setAttribute('cy',y.toFixed(1));c.setAttribute('r',(.5+R(i*13)*1.1*(1-ph)).toFixed(2));c.style.opacity=(k*Math.sin(Math.PI*ph)*.95).toFixed(3);});
  raf=requestAnimationFrame(tick);};
 raf=requestAnimationFrame(tick);
 let done=false;const finish=()=>{if(done)return;done=true;o.classList.add('out');at(700,()=>{delete state.shinFx031;persist();clearOv();});};
 o.addEventListener('click',finish);
 fxShin(o);
 const sr=o.querySelector('.hv-srays');if(sr){const t2=performance.now();const spin=()=>{if(!o.isConnected)return;sr.setAttribute('transform','translate(0 -6) rotate('+(((performance.now()-t2)/1000)*6).toFixed(2)+')');requestAnimationFrame(spin);};requestAnimationFrame(spin);}
 at(8600,finish);
}
/* ---------- 망(望) 수련: 신의 일렁이는 기운이 압축되어 달빛을 닮은 따스한 둥근 고리로 맺힘(사람 없이 망만) ----------
   이번에 익힌 망까지의 고리 수만큼 둥근 고리가 겹겹이 떠 있다(먼저 익힌 고리는 처음부터 은은히, 이번 고리는 보름달에서 비워져 맺힘). */
function mountMang(o){
 const n=Math.max(1,Math.min(5,(state.mangFx038&&state.mangFx038.n)|0||1));
 o.innerHTML='<div class="hv-title mang"><div class="hv-big">'+[...('망(望) '+n)].map((ch,i)=>'<span style="--i:'+i+'">'+esc(ch)+'</span>').join('')+'</div><div class="hv-rule"></div><div class="hv-sub">신이 둥근 빛의 고리로 맺혔습니다</div></div><div class="hv-skip">화면을 누르면 건너뜁니다</div>';
 const ok=glLayer(o,'mang',{a:.8,b:1.4,c:3.3,d:n,seed:11});
 if(!ok)o.classList.add('hv-mang-flat');
 let done=false;const finish=()=>{if(done)return;done=true;o.classList.add('out');at(700,()=>{delete state.mangFx038;persist();clearOv();});};
 o.addEventListener('click',finish);at(8600,finish);
}
const MOUNT={intro:mountIntro,accept2:mountAccept2,withdraw:mountWithdraw,bloom:mountBloom,twist:mountTwist,shin:mountShin,mang:mountMang};

/* ---------- 게임 화면과 연결 ---------- */
// 목소리 · 물러남 · 뒤틀림 동안 게임 화면에는 빈 자리만 둔다(연출은 위에 따로 뜸)
const oldRP=renderPlay;
renderPlay=function(){
 const page=oldRP.apply(this,arguments);
 try{const j=state.mindJudge;
  if(state.scene!=='dead'&&j&&!H.isCalamity()&&(j.stage==='twist'||(!state.egoBloomed&&(j.stage==='pending'||j.stage==='withdraw'))))return '<div class="inset hv-hold" aria-hidden="true"></div>';
 }catch(e){}
 return page;
};
const oldRender=render;
render=function(){const out=oldRender.apply(this,arguments);try{syncOverlay();}catch(e){}return out;};
document.addEventListener('click',e=>{const b=e.target?.closest?.('button[data-act="egoYield030"]');if(b&&state.mindJudge)state.mindJudge.direct031=true;},true);
// 신 이름을 새긴 순간에만 발현 연출(이미 이름이 있던 저장에서는 재생하지 않음)
let prevShin=null;
document.addEventListener('click',e=>{const b=e.target?.closest?.('button[data-act="heartNameSave030"]');if(b)prevShin=state.shinName030||'';},true);
document.addEventListener('click',e=>{
 const b=e.target?.closest?.('button[data-act="heartNameSave030"]');if(!b||prevShin===null)return;
 const was=prevShin;prevShin=null;
 if(state.shinName030&&state.shinName030!==was){
  const m=H.memory(),words=[];(m.lost||[]).slice(-4).forEach(c=>words.push(c.custom?c.name:'떠나간 선원'));if(m.purpose)words.push(String(m.purpose).slice(0,18));
  state.shinFx031={name:state.shinName030,words};persist();syncOverlay();
 }
});
// 망 수련에 성공한 순간에만 망 연출
let prevMang=null;
document.addEventListener('click',e=>{const b=e.target?.closest?.('button[data-act="shinTry"]');if(b)prevMang=state.shinLevel|0;},true);
document.addEventListener('click',e=>{const b=e.target?.closest?.('button[data-act="shinTry"]');if(!b||prevMang===null)return;
 const was=prevMang;prevMang=null;const now=state.shinLevel|0;
 if(now>was){state.mangFx038={n:now,at:Date.now()};persist();syncOverlay();}});
window.GREAT_LAKE_HEART_SCENES_031={sync:syncOverlay,compose:j=>composeVoice(j||state.mindJudge||{})};
try{syncOverlay();render();}catch(e){}
})();
