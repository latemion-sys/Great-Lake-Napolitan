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
   참아 온 갈망을 '병이 아니라 진짜 너'라고 부르며, 도시의 눈과 잣대(등급 · 장부 · 손실)에서 벗어나 다시 태어나라고 권한다.
   거절하려는 마음은 체념이나 고집이라고 부드럽게 꾸짖는다. 판정마다 한 번 골라 저장하므로 다시 그려져도 같은 말이 이어진다. */
const ul=s=>s+(batchim(s)?'을':'를');
function composeVoice(j){
 if(j.seed031==null)j.seed031=Math.floor(Math.random()*1e6);
 let n=0;const rnd=()=>R(j.seed031*.0173+(n++)*3.71+.5);
 const pick=arr=>arr[Math.floor(rnd()*arr.length)];
 const k=Math.min(2,H.acceptTries()),m=H.memory(),r=H.record();
 const cap=String(state.captainName||'').trim(),call=cap?ah(cap)+', ':'';
 const why=String(j.why031||''),lost=Array.isArray(m.lost)?m.lost:[],named=lost.filter(c=>c.custom&&c.name),lastLost=lost[lost.length-1];
 const kills=(state.whaleKilled||[]).length,lakes=state.count?.lake||0,rets=state.count?.return||0,g=state.grade|0;
 const L=['이제야 내 말을 귀담아 들어주는구나.'];
 // 다시 만났을 때 / 처음일 때
 if(k===1)L.push(pick(['또 왔구나. 지난번엔 돌아섰지? 괜찮아, 화나지 않았어.','다시 만났네. 그날 물러서던 네 뒷모습, 아직 기억하고 있어.']));
 else if(k===2)L.push(pick(['이번엔 돌아갈 데가 없다는 거, 너도 알지?','세 번째야. 여기서 더 버티는 건 용기가 아니라 고집이야.']));
 else L.push(pick(['계속 부르고 있었어. 네가 너무 바빠서 못 들었을 뿐이지.','무서워할 것 없어. 나는 처음부터 네 쪽에 서 있었으니까.','다들 네 등급이랑 장부만 봤지. 나는 줄곧 네 마음을 보고 있었어.','숨 좀 돌려. 여기선 아무도 너한테 값을 매기지 않아.','드디어 조용해졌네. 이제야 네 진짜 목소리가 들려.']));
 // 무엇이 마음을 무너뜨렸는지
 let usedNamed=null;
 if(/인어가 되는 것/.test(why)){
  if(lastLost&&lastLost.custom){usedNamed=lastLost;L.push(pick([ul(lastLost.name)+' 마지막으로 본 게 너였지. 손을 뻗었는데, 닿지 않았잖아.',lastLost.name+'… 물속으로 가라앉으면서도 너를 보고 있었어. 원망하는 얼굴이 아니었는데.']));}
  else L.push(pick(['또 한 사람이 물속으로 가 버렸어. 너는 그저 보고만 있었고.','방금 그 사람, 이름 한 번 제대로 불러 주지 못했지. 그게 제일 아프지?']));
 }else if(/인어와 마주/.test(why))L.push(pick(['방금 그 노래, 끝까지 듣고 싶었지? 부끄러워할 것 없어.','물속에서 부르던 얼굴들, 하나같이 다정했잖아. 도시의 누구보다도.','그것들이 무서웠던 게 아니야. 따라가고 싶어지는 네 마음이 무서웠던 거지.']));
 else if(why===''&&state.shinOpen)L.push('빛의 고리 하나를 더 얻겠다고 스스로를 깎아 내다니. 누가 시킨 것도 아닌데.');
 else L.push(pick(['여기까지 오는 동안 한 번도 제대로 쉬어 본 적 없잖아.','끝까지 버티다가 끊어진 거야. 그건 약해서가 아니야.']));
 // 잃은 사람들
 const rest=named.filter(c=>c!==usedNamed);
 if(!lost.length&&/인어가 되는 것/.test(why)){}
 else if(!lost.length)L.push(pick(['아직 아무도 잃지 않았지. 그걸 지키느라 네가 얼마나 닳았는지, 아무도 몰라.','모두를 지켰어. 그런데 너를 지켜 준 사람은 있었니?']));
 else if(rest.length>=2)L.push(rest.slice(-2).map(c=>c.name).join(', ')+'… 네가 직접 이름을 붙여 준 사람들이었잖아.');
 else if(rest.length===1)L.push(rest[0].name+'. 이름을 지어 준 그 순간부터, 너는 그 사람을 잃을 준비를 하고 있었어.');
 else if(lost.length>1)L.push(pick(['떠나보낸 사람이 '+lost.length+'명. 숫자로 세기 시작한 건 언제부터였을까.',lost.length+'명이야. 도시는 그걸 \'손실\'이라고 적겠지. 너는 아니잖아.']));
 // 도시의 눈으로 매겨진 행적
 if(kills)L.push(pick(['재앙을 꿰뚫은 손이야. 도시는 그 손에 상금 몇 푼 쥐여 주고 끝냈지.','고래를 쓰러뜨린 사람한테 도시가 해 준 건 다음 의뢰서뿐이었잖아.']));
 else if(g>=4)L.push(pick([g+'등급. 도시는 너를 그 숫자로만 기억할 거야. 네가 어떤 밤을 보냈는지는 빼고.','선장 '+g+'등급. 다들 네게 기대기만 했고, 너는 누구에게도 기대지 못했지.']));
 else if(lakes>=10)L.push(pick(['호수를 '+lakes+'개나 건넜어. 그런데 항구에선 아무도 묻지 않았지. 괜찮았냐고.','호수 '+lakes+'개. 도시에선 그게 경력 한 줄이야. 네 마음에 남은 건 한 줄로 안 끝나는데.']));
 else if(rets>=1)L.push(pick(['몇 번이고 배를 끌고 돌아왔지. 다음 출항 경비를 벌려고. 그게 사는 거라고 배웠으니까.','항구에 닿을 때마다 장부부터 펼쳤지. 네 마음은 펼쳐 볼 틈도 없이.']));
 else L.push(pick(['이제 막 키를 잡았을 뿐인데, 도시는 벌써 너한테 값을 매기기 시작했어.','첫 항해부터 이렇게 무너졌다고 부끄러워하지 마. 네 탓이 아니야. 이 호수가, 이 도시가 그렇게 만든 거야.']));
 // 품은 바람
 if(state.shinName030){const sn=state.shinName030.replace(/\(望\)$/,'');L.push(pick([sn+'. 그 바람, 혼자 빛내기엔 너무 무겁지 않아?',sn+'… 거짓 없는 바람이란 거 알아. 그러니까 끝까지 가게 해 줄게.']));}
 else if(m.purpose){const p=String(m.purpose).slice(0,30)+(String(m.purpose).length>30?'…':'');L.push('‘'+p+'’. 네가 그렇게 말했지. 그걸 도시의 방식으로 이룰 수 있을 것 같아?');}
 else if(r.resolve>=1)L.push('무너지기 직전까지 몰리고도 끝까지 버텼잖아. 이제 그만 내려놓아도 돼.');
 else L.push(pick(['네가 정말 바라는 게 뭔지, 한 번이라도 소리 내서 말해 본 적 있어?','갖고 싶었던 것, 되고 싶었던 것. 도시가 \'분수\'라며 접게 한 것들 말이야.','언제부터 네 바람보다 남의 계산을 먼저 하게 됐니?']));
 // 권유 → 답을 청함
 L.push(pick(['그건 병이 아니야. 너무 오래 참아 온 마음일 뿐이야.','도시가 붙여 준 이름표는 이제 떼어 버려도 돼.','남의 눈에 맞춰 깎아 낸 모양 말고, 원래의 네 모양으로 돌아가자.',call+'조금만 솔직해지면 돼. 그러면 다시 태어날 수 있어.',call+'네가 바라는 너로 살아도, 아무도 너를 탓하지 못해.']));
 L.push('그러니까, 답해 주렴.');
 return L;
}
const ACCEPT_TALK=[['인정한다고? 그건 도시가 너한테 가르쳐 준 체념이야.','뜻대로 되지 않는 세상이라면, 뜻대로 되는 네가 되면 되잖아.'],['다른 누군가의 탓으로 돌려도 괜찮아. 네가 짊어진 몫은 이미 넘쳤어.','네가 지키려던 것들, 어떻게든 되찾으면 되잖아. 내가 도와줄게.']];
const WITHDRAW_TALK=['그래, 아직은 괜찮아. 오늘은 여기까지만 하자.','도망치는 거 아니야. 잠깐 숨을 고르는 거지. 나는 기다릴 수 있어.','다시 무너지는 날, 내가 제일 먼저 네 이름을 불러 줄게.'];
const TWIST_TALK=['그래, 그거면 돼. 이제 아무것도 참지 않아도 돼.','봐, 하나도 아프지 않지? 이게 원래의 너야.','애썼어. 이제 그만 내려놔. 나머지는 네 마음이 알아서 할 거야.'];
const seedPick=(j,arr,salt)=>{const v=((j&&j.seed031)||7)+salt*131;return arr[Math.floor(R(v)*arr.length)%arr.length];};
// 선택지: 도시에서 살아온 선장이 직접 하는 말
const SAY={
 force:'듣기 좋은 소리 집어치워. 이 도시에서 여기까지 버텨 온 건 나야. 내 머릿속에서 꺼져.',
 accept:'알아. 이 도시에서 뭐 하나 내 뜻대로 된 적 없었지. 그래도 그게 네 말을 들을 이유는 안 돼.',
 yield:'…그래. 이 도시는 날 한 번도 봐주지 않았어. 네 말대로 할게.',
 duty:'되돌릴 수 없는 건 못 되돌려. 그래도 남은 놈들 데리고 항구까지 가는 건 내 몫이야.',
 yield2:'…됐어. 어차피 이 도시에서 내 짐을 대신 들어 준 놈은 없었어.'
};

/* ---------- 덧씌우는 화면 ---------- */
let ov=null,ovKey='',timers=[],raf=0;
function clearOv(){timers.forEach(clearTimeout);timers=[];if(raf)cancelAnimationFrame(raf);raf=0;if(ov){ov.remove();ov=null;}ovKey='';}
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
function voiceShell(o){
 o.innerHTML='<div class="hv-glow" aria-hidden="true"></div><div class="hv-echoes" aria-hidden="true"></div><div class="hv-center"><div class="hv-lines"></div><div class="hv-note"></div><div class="hv-actions"></div></div><div class="hv-skip">화면을 누르면 건너뜁니다</div>';
 return {echoes:o.querySelector('.hv-echoes'),lines:o.querySelector('.hv-lines'),note:o.querySelector('.hv-note'),acts:o.querySelector('.hv-actions'),skip:o.querySelector('.hv-skip')};
}
function showLines(el,arr,start,gap){arr.forEach((t,i)=>at(start+i*gap,()=>{const p=document.createElement('p');p.textContent='“'+t+'”';el.appendChild(p);}));return start+arr.length*gap;}
function mountIntro(o,j){
 const v=voiceShell(o);
 if(!Array.isArray(j.lines031)){j.lines031=composeVoice(j);persist();}
 const seq=j.lines031;
 const actHTML=btn(SAY.force,'egoForce030','primary')+btn(SAY.accept,'egoAccept030')+btn(SAY.yield,'egoYield030','yield');
 let done=false;
 const finish=()=>{if(done)return;done=true;timers.forEach(clearTimeout);timers=[];v.echoes.innerHTML='';v.lines.innerHTML=seq.map(t=>'<p class="now">“'+esc(t)+'”</p>').join('');v.acts.innerHTML=actHTML;v.acts.classList.add('on');v.skip.remove();j.echoDone031=true;persist();};
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
 counts.forEach((n,si)=>at(times[si],()=>{for(let i=shown;i<n;i++)spans[i].classList.add('on');shown=n;if(n>=16)v.echoes.classList.add('echoing');o.style.setProperty('--swell',(si/7).toFixed(2));}));
 at(6900,()=>v.echoes.classList.add('gone'));
 const end=showLines(v.lines,seq,7900,1500);
 at(end+500,()=>{finish();});
}
function mountAccept2(o,j){
 const v=voiceShell(o);v.skip.remove();
 const end=showLines(v.lines,[seedPick(j,ACCEPT_TALK[0],1),seedPick(j,ACCEPT_TALK[1],2)],300,1400);
 at(end+300,()=>{v.acts.innerHTML=btn(SAY.duty,'egoAcceptDuty030','primary')+btn(SAY.yield2,'egoYield030','yield');v.acts.classList.add('on');});
}
function mountWithdraw(o,j){
 const v=voiceShell(o);v.skip.remove();const w=j.withdraw||{};
 const w2=WITHDRAW_TALK.slice(),a1=w2.splice(Math.floor(R((j.seed031||3)+5)*w2.length),1)[0],a2=w2[Math.floor(R((j.seed031||3)+9)*w2.length)];
 const end=showLines(v.lines,[a1,a2],300,1400);
 at(end+200,()=>{v.note.innerHTML='목소리가 멀어지고, 선장은 벼랑 끝에서 한 걸음 물러났습니다.<br>선장 정신력 최대치 -'+(w.max|0)+' ('+(w.cap|0)+')'+(w.mind?' · 돌아오는 정신력 -'+w.mind:'');v.note.classList.add('on');
  v.acts.innerHTML=btn('숨을 고르고 물러난다','egoWithdrawGo030','primary');v.acts.classList.add('on');});
}

/* ---------- 사람 형체(선장): 정면, 외투 ---------- */
const FIGURE='<g class="hv-fig"><circle cx="0" cy="-86" r="13"/><path d="M-9,-73 Q0,-70 9,-73 L26,-64 Q31,-61 32,-54 L36,-12 Q36,-8 33,-8 L30,-10 L26,-50 L24,-26 L28,36 Q29,44 20,46 L6,46 L3,8 L-3,8 L-6,46 L-20,46 Q-29,44 -28,36 L-24,-26 L-26,-50 L-30,-10 L-33,-8 Q-36,-8 -36,-12 L-32,-54 Q-31,-61 -26,-64 Z"/></g>';

/* ---------- E.G.O 개화 ---------- */
function mountBloom(o,j){
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
 at(5600,finish);
}

/* ---------- 뒤틀림 ---------- */
function mountTwist(o,j){
 const voiced=!!(j&&j.voice030),direct=!!(j&&j.direct031),cap=String(state.captainName||'').trim();
 if(voiced&&j&&!j.twistLine031){j.twistLine031=direct?TWIST_TALK[Math.floor(R((j.seed031||1)+3)*2)]:TWIST_TALK[2];persist();}
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
  '<g transform="translate(0 30)">'+
   '<ellipse class="hv-pool" cx="0" cy="47" rx="96" ry="13" fill="url(#hvPool)"/>'+
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
 at(8600,finish);
}
const MOUNT={intro:mountIntro,accept2:mountAccept2,withdraw:mountWithdraw,bloom:mountBloom,twist:mountTwist,shin:mountShin};

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
window.GREAT_LAKE_HEART_SCENES_031={sync:syncOverlay,compose:j=>composeVoice(j||state.mindJudge||{})};
try{syncOverlay();render();}catch(e){}
})();
