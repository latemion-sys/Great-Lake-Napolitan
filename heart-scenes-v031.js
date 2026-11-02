/* 신(心) · E.G.O 연출 (v0.3.1)
   · 따스한 목소리: "내 목소리, 들리지? 들리잖아. 답해주렴."이 1 → 2 → 4 → … → 128개로 불어나며 메아리친 뒤(16개부터는 한 문장만 또렷하고 나머지는 반투명),
     "이제야 내 말을 귀담아 들어주는구나"로 이어지고, 이 선장의 생애(잃은 선원 · 지나온 호수 · 등급 · 결의 · 신)에 맞춰 목소리가 말을 고른다.
   · E.G.O 개화: 마음을 감싼 껍질이 안쪽의 빛에 금 가고 깨져 흩어진 자리에서 빛의 꽃잎이 피어난다.
   · 뒤틀림: 따스한 목소리가 식어 붉게 번지고, 선장의 형체가 일그러져 다른 것이 된다.
   · 신(心) 발현: 떠올린 기억이 가슴으로 모여 금빛 불꽃 같은 기운이 몸을 감싸고, 빛의 고리(망) 하나가 작살에 맺힌다.
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

/* ---------- 목소리가 고르는 말: 이 선장의 생애에서만 ---------- */
function composeVoice(j){
 const lines=[],k=Math.min(2,H.acceptTries()),m=H.memory(),r=H.record(),seed=(state.voyage||0)*7+(state.count?.lake||0)+k;
 const pick=arr=>arr[Math.floor(R(seed+arr.length*13)*arr.length)%arr.length];
 const cap=String(state.captainName||'').trim();
 lines.push('이제야 내 말을 귀담아 들어주는구나.');
 if(k===1)lines.push('또 왔구나. 지난번엔 돌아섰지만, 괜찮아. 기다리고 있었어.');
 if(k===2)lines.push('이번이 마지막이야. 이제 더는 물러설 곳이 없어.');
 // 무엇이 마음을 무너뜨렸는지
 const why=String(j.why031||''),lost=Array.isArray(m.lost)?m.lost:[],named=lost.filter(c=>c.custom&&c.name),lastLost=lost[lost.length-1];
 if(/인어가 되는 것/.test(why)){
  if(lastLost&&lastLost.custom)lines.push(iga(lastLost.name)+' 물속 것이 되어 가는 걸, 너는 그저 보고만 있었지.');
  else lines.push(pick(['또 한 사람이 물속으로 가 버렸어. 너는 그저 보고만 있었지.','방금도 봤잖아. 네 사람이 물속 것이 되어 가는 걸.']));
 }else if(/인어와 마주/.test(why))lines.push(pick(['방금 그 노래, 너도 끝까지 듣고 싶었지?','물속에서 너를 부르던 얼굴들, 하나같이 다정했잖아.']));
 else if(why==='')lines.push(state.shinOpen?'그 빛의 고리를 하나 더 얻으려고, 스스로를 이렇게까지 깎아 냈구나.':'여기까지 오는 동안, 한 번도 제대로 쉬어 본 적 없잖아.');
 else lines.push('여기까지 오는 동안, 한 번도 제대로 쉬어 본 적 없잖아.');
 // 잃은 사람들
 if(!lost.length)lines.push('아직 아무도 잃지 않았지. 그걸 지키느라 얼마나 애썼니.');
 else if(named.length>=2)lines.push(named.slice(-2).map(c=>c.name).join(', ')+'… 네가 이름을 지어 준 사람들이었지.');
 else if(named.length===1&&!(lastLost===named[0]&&/인어가 되는 것/.test(why)))lines.push(named[0].name+'… 네가 이름을 지어 준 사람이었지.');
 else if(lost.length>1)lines.push('떠나보낸 사람이 '+lost.length+'명이야. 넌 한 명도 잊지 않았잖아. 그래서 더 무거운 거야.');
 // 지나온 행적
 const kills=(state.whaleKilled||[]).length,lakes=state.count?.lake||0,rets=state.count?.return||0,g=state.grade|0;
 if(kills)lines.push('재앙을 꿰뚫은 손이야. 그 손으로 못 할 게 뭐가 있겠니?');
 else if(g>=4)lines.push(g+'등급 선장. 다들 네게 기대기만 하고, 너는 누구에게도 기대지 못했지.');
 else if(lakes>=10)lines.push('호수를 '+lakes+'개나 건넜어. 그걸 알아준 사람이 하나라도 있었니?');
 else if(rets>=1)lines.push('몇 번이고 배를 끌고 항구로 돌아왔지. 그저 다음 항해를 위해서.');
 else lines.push('이제 막 키를 잡았을 뿐인데, 벌써 이렇게 지쳐 버렸구나.');
 // 버텨 온 결의 · 품은 바람
 if(state.shinName030)lines.push(state.shinName030.replace(/\(望\)$/,'')+'… 그 바람, 내가 대신 이뤄 줄게.');
 else if(m.purpose)lines.push('‘'+String(m.purpose).slice(0,34)+(String(m.purpose).length>34?'…':'')+'’ 그렇게 말했었지. 혼자서는 안 된다는 거, 너도 알잖아.');
 else if(r.resolve>=1)lines.push('무너지기 직전까지 몰리고도 끝까지 버텼잖아. 이제 그만 내려놓아도 돼.');
 lines.push((cap?ah(cap)+', ':'')+'이제는 네 마음 가는 대로 해도 괜찮아.');
 lines.push('아무것도 네 뜻을 막을 수 없게 해 줄게.');
 return lines;
}

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
 clearOv();
 ov=document.createElement('div');ov.className='hv-ov hv-'+w.kind;ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
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
 const actHTML=btn('압도적인 자아로 이 목소리를 깨부순다','egoForce030','primary')+btn('세상이 모두 내 뜻대로 되지 않는다는 것을 인정한다','egoAccept030')+btn('목소리의 제안을 받아들인다','egoYield030');
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
 const end=showLines(v.lines,seq,7900,1650);
 at(end+500,()=>{finish();});
}
function mountAccept2(o,j){
 const v=voiceShell(o);v.skip.remove();
 const end=showLines(v.lines,['다른 누군가의 탓으로 돌려도 괜찮잖아.','네가 지키려던 모든 것을, 어떻게든 되찾으면 되잖아.'],300,1300);
 at(end+300,()=>{v.acts.innerHTML=btn('바꿀 수 없는 것은 인정한다. 그래도 내가 할 일을 선택한다','egoAcceptDuty030','primary')+btn('더는 책임질 것이 없다','egoYield030');v.acts.classList.add('on');});
}
function mountWithdraw(o,j){
 const v=voiceShell(o);v.skip.remove();const w=j.withdraw||{};
 const end=showLines(v.lines,['그래. 아직은 괜찮아.','조금만 더 버텨 봐. 다시 부르면, 언제든 올게.'],300,1300);
 at(end+200,()=>{v.note.innerHTML='목소리가 멀어지고, 선장은 벼랑 끝에서 한 걸음 물러났습니다.<br>선장 정신력 최대치 -'+(w.max|0)+' ('+(w.cap|0)+')'+(w.mind?' · 돌아오는 정신력 -'+w.mind:'');v.note.classList.add('on');
  v.acts.innerHTML=btn('숨을 고르고 물러난다','egoWithdrawGo030','primary');v.acts.classList.add('on');});
}

/* ---------- 사람 형체(선장): 정면, 외투, 오른손에 작살 ---------- */
const FIGURE='<g class="hv-fig"><circle cx="0" cy="-86" r="13"/><path d="M-9,-73 Q0,-70 9,-73 L26,-64 Q31,-61 32,-54 L36,-12 Q36,-8 33,-8 L30,-10 L26,-50 L24,-26 L28,36 Q29,44 20,46 L6,46 L3,8 L-3,8 L-6,46 L-20,46 Q-29,44 -28,36 L-24,-26 L-26,-50 L-30,-10 L-33,-8 Q-36,-8 -36,-12 L-32,-54 Q-31,-61 -26,-64 Z"/></g>';
const HARPOON='<g class="hv-harp"><path d="M34,-10 L78,-96" stroke-width="2.6"/><path d="M78,-96 L74,-82 L83,-88 Z"/></g>';

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
 const voiced=!!(j&&j.voice030),cap=String(state.captainName||'').trim();
 let veins='';for(let i=0;i<16;i++){const a=i/16*Math.PI*2+R(i)*.3,r0=290;let x=Math.cos(a)*r0,y=Math.sin(a)*r0,d='M'+x.toFixed(0)+','+y.toFixed(0);
  for(let s=0;s<7;s++){const rr=r0-(s+1)*30,aa=a+(R(i*7+s)-.5)*.5;x=Math.cos(aa)*rr;y=Math.sin(aa)*rr;d+=' L'+x.toFixed(0)+','+y.toFixed(0);}veins+='<path class="hv-vein" d="'+d+'" style="--d:'+(2.3+R(i*3)*.8).toFixed(2)+'s"/>';}
 let spikes='';for(let i=0;i<11;i++){const sx=(R(i*5)-.5)*60,sy=-90+R(i*7)*130,a=Math.atan2(sy+20,sx)+(R(i*9)-.5)*.6,len=26+R(i*11)*46;
  spikes+='<path class="hv-spike" d="M'+(sx-3).toFixed(1)+','+sy.toFixed(1)+' L'+(sx+Math.cos(a)*len).toFixed(1)+','+(sy+Math.sin(a)*len).toFixed(1)+' L'+(sx+3).toFixed(1)+','+(sy+2).toFixed(1)+' Z" style="--d:'+(3.1+R(i*13)*1.1).toFixed(2)+'s"/>';}
 o.innerHTML='<div class="hv-red" aria-hidden="true"></div>'+
  '<svg class="hv-svg" viewBox="-200 -200 400 400" aria-hidden="true"><defs><filter id="hvTwist" x="-60%" y="-60%" width="220%" height="220%"><feTurbulence type="fractalNoise" baseFrequency=".022 .06" numOctaves="2" seed="7" result="n"><animate attributeName="baseFrequency" dur="3s" values=".022 .06;.03 .05;.022 .06" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" class="hv-disp"/></filter></defs>'+
  '<g class="hv-veins">'+veins+'</g>'+
  '<g class="hv-body" filter="url(#hvTwist)" transform="translate(0 30)"><g class="hv-stretch">'+FIGURE+'<g class="hv-spikes">'+spikes+'</g></g></g></svg>'+
  '<div class="hv-center"><div class="hv-lines">'+(voiced?'<p class="warm">“그러면, 이제 아무것도 참지 않아도 되겠네.”</p>':'')+'</div>'+
  '<div class="hv-dtitle"><div class="hv-dbig" data-t="뒤틀림">뒤틀림</div><div class="hv-dsub">'+esc((cap?'선장 '+cap:'선장'))+'이었던 것</div></div>'+
  '<div class="hv-actions">'+btn(voiced?'목소리를 따라간다':'뒤틀림을 받아들인다','mindTwistEnd','danger')+'</div></div>';
 const disp=o.querySelector('.hv-disp'),stretch=o.querySelector('.hv-stretch'),stage=o.querySelector('.hv-svg'),t0=performance.now(),B=voiced?2200:600;
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

/* ---------- 신(心) 발현 ---------- */
function mountShin(o){
 const fx=state.shinFx031||{},words=(fx.words||[]).slice(0,7);
 let frag='';words.forEach((w,i)=>{const a=-Math.PI/2+(i-(words.length-1)/2)*.55,r=150+R(i*3)*30;frag+='<text class="hv-frag" x="'+(Math.cos(a)*r).toFixed(0)+'" y="'+(Math.sin(a)*r*0.8+10).toFixed(0)+'" style="--tx:'+(-Math.cos(a)*r).toFixed(0)+'px;--ty:'+(-(Math.sin(a)*r*0.8+10)+(-40)).toFixed(0)+'px;--d:'+(.2+i*.18).toFixed(2)+'s">'+esc(w)+'</text>';});
 let flames='';for(let i=0;i<3;i++)flames+='<path class="hv-flame f'+i+'"/>';
 o.innerHTML='<svg class="hv-svg" viewBox="-200 -200 400 400" aria-hidden="true"><defs>'+
  '<radialGradient id="hvAura" cx=".5" cy=".62" r=".6"><stop stop-color="#fff2c0" stop-opacity=".95"/><stop offset=".35" stop-color="#ffc84a" stop-opacity=".75"/><stop offset=".75" stop-color="#ff8a1e" stop-opacity=".35"/><stop offset="1" stop-color="#ff6a00" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="hvEmber"><stop stop-color="#fffbe0"/><stop offset=".5" stop-color="#ffd060"/><stop offset="1" stop-color="#ff9a20" stop-opacity="0"/></radialGradient>'+
  '<filter id="hvFlameBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>'+
  '<filter id="hvRingGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'+
  '<g class="hv-frags">'+frag+'</g>'+
  '<g class="hv-aura" transform="translate(0 30)">'+flames+'</g>'+
  '<g transform="translate(0 30)">'+FIGURE+HARPOON+'<circle class="hv-ember" cx="0" cy="-52" r="16" fill="url(#hvEmber)"/>'+
   '<g class="hv-mang" transform="translate(64 -70) rotate(27)"><ellipse rx="15" ry="5.2" pathLength="100"/></g></g></svg>'+
  '<div class="hv-title shin"><div class="hv-big">'+esc(fx.name||'')+'</div><div class="hv-sub">신(心) 발현 · 첫 번째 망(望)</div></div>';
 const fl=[...o.querySelectorAll('.hv-flame')],t0=performance.now();
 const tick=now=>{const t=(now-t0)/1000,k=Math.max(0,Math.min(1,(t-1.4)/1.4));
  fl.forEach((p,li)=>{const sc=1+li*.16;let d='';const N=36;
   for(let i=0;i<=N;i++){const u=i/N,a=Math.PI*2*u;let rx=46*sc,ry=82*sc;
    // 위로 갈수록 혀처럼 솟는 불꽃 가장자리
    const up=Math.max(0,-Math.sin(a)),flick=Math.sin(a*5+t*7+li)*.5+Math.sin(a*9-t*11+li*2)*.35+Math.sin(a*3+t*4.3)*.4;
    const r=1+flick*.07*k+up*up*(.18+.22*k)*(.7+.3*Math.sin(t*6+u*20));
    d+=(i?' L':'M')+(Math.cos(a)*rx*r).toFixed(1)+','+(-20+Math.sin(a)*ry*r-up*up*24*k).toFixed(1);}
   p.setAttribute('d',d+' Z');p.style.opacity=(k*(.85-li*.22)).toFixed(3);});
  raf=requestAnimationFrame(tick);};
 raf=requestAnimationFrame(tick);
 let done=false;const finish=()=>{if(done)return;done=true;o.classList.add('out');at(700,()=>{delete state.shinFx031;persist();clearOv();});};
 o.addEventListener('click',finish);
 at(6200,finish);
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
