/* Great Lake v0.3.5 · 재앙 고래 효과음 (녹음 파일 없이 Web Audio로 그 자리에서 합성)
   - 장면마다 시간표(초 · 소리 · 설정)를 두고, 장면 시간이 그 시각을 지날 때 낸다(반복 장면은 매 반복마다).
   - 처음엔 꺼져 있다. "소리 켜기"를 누르거나 화면을 눌러야 켜진다(브라우저 자동 재생 규칙). 설정은 이 기기에만 기억.
   - 같은 시간표를 OfflineAudioContext로 그려 미리보기 영상에 소리를 입힐 수 있다(CalSFX.offline).
   window.CalSFX = {tick(el,key,t,o), enable(), disable(), toggle(), on, offline(key,from,dur,o), ui()} */
(function(){
'use strict';
const AC=window.AudioContext||window.webkitAudioContext;
let ctx=null,master=null,on=false;
try{on=localStorage.getItem('calSfx')==='1';}catch(e){}
const NB=new WeakMap();
function noiseBuf(c){let b=NB.get(c);if(b)return b;const n=c.sampleRate*2;b={w:c.createBuffer(1,n,c.sampleRate),b:c.createBuffer(1,n,c.sampleRate)};
 const w=b.w.getChannelData(0),br=b.b.getChannelData(0);let last=0;for(let i=0;i<n;i++){w[i]=Math.random()*2-1;last=(last+.02*w[i])/1.02;br[i]=last*3.5;}NB.set(c,b);return b;}
function noise(c,t,dur,brown){const s=c.createBufferSource();s.buffer=noiseBuf(c)[brown?'b':'w'];s.loop=true;s.start(t,Math.random()*1.5);s.stop(t+dur+.05);return s;}
function gainEnv(c,t,pts){const g=c.createGain();g.gain.setValueAtTime(0,t);pts.forEach(([dt,v,lin])=>{if(lin)g.gain.linearRampToValueAtTime(v,t+dt);else g.gain.setTargetAtTime(v,t+dt-(dt>0?Math.min(dt,.08):0),Math.max(.005,dt*.3));});return g;}
function ramp(p,t,pts){p.setValueAtTime(pts[0][1],t);for(let i=1;i<pts.length;i++)p.exponentialRampToValueAtTime(Math.max(1,pts[i][1]),t+pts[i][0]);}
function filt(c,type,f,q){const b=c.createBiquadFilter();b.type=type;b.frequency.value=f;if(q!=null)b.Q.value=q;return b;}
function osc(c,type,t,dur){const o=c.createOscillator();o.type=type;o.start(t);o.stop(t+dur+.05);return o;}
function chain(...n){for(let i=0;i<n.length-1;i++)n[i].connect(n[i+1]);return n[n.length-1];}
function env(c,t,a,hold,rel,peak){const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setValueAtTime(peak,t+a+hold);g.gain.exponentialRampToValueAtTime(.0005,t+a+hold+rel);return g;}
const R=Math.random;

/* ───────── 소리 ───────── */
const S={
 // 깊고 낮은 고래 울음: 톱니파 두 겹 + 입 모양(공명대)이 천천히 움직임
 groan(c,d,t,p){const dur=p.dur||3,f=p.f||42,k=p.k||1;
  [0,1].forEach(j=>{const o=osc(c,'sawtooth',t,dur);ramp(o.frequency,t,[[0,f*(1+j*.012)],[dur*.35,f*1.38*(1+j*.01)],[dur,f*.82]]);
   const lp=filt(c,'lowpass',260,5),bp=filt(c,'bandpass',380,3.5);ramp(bp.frequency,t,[[0,320],[dur*.4,640],[dur,300]]);
   const g=env(c,t,dur*.25,dur*.4,dur*.35,.16*k);o.connect(lp);lp.connect(g);o.connect(bp);bp.connect(g);g.connect(d);});
  const sub=osc(c,'sine',t,dur);ramp(sub.frequency,t,[[0,f/2],[dur*.4,f*.66],[dur,f*.42]]);chain(sub,env(c,t,dur*.3,dur*.3,dur*.4,.22*k),d);},
 // 물이 밀려 흐르는 소리
 rush(c,d,t,p){const dur=p.dur||2,k=p.k||1;const n=noise(c,t,dur),bp=filt(c,'bandpass',700,.7);ramp(bp.frequency,t,[[0,p.f0||500],[dur*.5,p.f1||1300],[dur,p.f2||600]]);
  chain(n,bp,env(c,t,dur*.3,dur*.3,dur*.4,.18*k),d);const b=noise(c,t,dur,1),lp=filt(c,'lowpass',380);chain(b,lp,env(c,t,dur*.3,dur*.3,dur*.4,.2*k),d);},
 // 물 튀김(큰 덩어리 + 작은 물방울)
 splash(c,d,t,p){const k=p.k||1,big=p.big?1.6:1;const n=noise(c,t,1.4),lp=filt(c,'lowpass',2600);ramp(lp.frequency,t,[[0,3200],[1.2*big,350]]);
  chain(n,lp,env(c,t,.01,.05,.9*big,.32*k),d);const th=osc(c,'sine',t,.6);ramp(th.frequency,t,[[0,80],[.4,38]]);chain(th,env(c,t,.005,.02,.5,.4*k*big*.6),d);
  for(let i=0;i<10*big;i++){const tt=t+.05+R()*.9*big,o=osc(c,'sine',tt,.08);ramp(o.frequency,tt,[[0,900+R()*1600],[.06,1400+R()*2200]]);chain(o,env(c,tt,.002,.01,.05,.05*k),d);}},
 // 휙: 공기를 가르는 소리
 whoosh(c,d,t,p){const dur=p.dur||.5,k=p.k||1;const n=noise(c,t,dur),bp=filt(c,'bandpass',2000,1.3);ramp(bp.frequency,t,[[0,p.f0||2600],[dur,p.f1||380]]);chain(n,bp,env(c,t,dur*.45,.02,dur*.5,.28*k),d);},
 // 작살이 살에 박힘: 둔탁한 소리 + 쇳소리
 thunk(c,d,t,p){const k=p.k||1;const o=osc(c,'sine',t,.5);ramp(o.frequency,t,[[0,120],[.3,44]]);chain(o,env(c,t,.003,.02,.38,.55*k),d);
  const n=noise(c,t,.06),hp=filt(c,'highpass',1800);chain(n,hp,env(c,t,.001,.01,.04,.3*k),d);
  if(p.metal!==false)[1320,1873,2655].forEach((f,i)=>{const m=osc(c,'sine',t,1.2);m.frequency.value=f*(1+(R()-.5)*.01);chain(m,env(c,t,.002,.01,.9-i*.2,.05*k),d);});},
 clank(c,d,t,p){S.thunk(c,d,t,{k:(p.k||1)*.5,metal:false});[980,1510,2390,3120].forEach((f,i)=>{const m=osc(c,'triangle',t,1);m.frequency.value=f;chain(m,env(c,t,.001,.01,.7-i*.12,.08*(p.k||1)),d);});},
 // 칼날처럼 수면을 긋는 소리
 slice(c,d,t,p){const k=p.k||1;const n=noise(c,t,.5),hp=filt(c,'bandpass',5000,2);ramp(hp.frequency,t,[[0,3500],[.35,9000]]);chain(n,hp,env(c,t,.02,.08,.3,.22*k),d);
  const o=osc(c,'sine',t,.4);ramp(o.frequency,t,[[0,1700],[.3,3400]]);chain(o,env(c,t,.01,.05,.25,.05*k),d);},
 // 초고속으로 꿰뚫는 파열음
 crack(c,d,t,p){const k=p.k||1;const n=noise(c,t,.03);chain(n,env(c,t,.0005,.004,.02,.7*k),d);
  const n2=noise(c,t,.9),lp=filt(c,'lowpass',7000);ramp(lp.frequency,t,[[0,7000],[.7,220]]);chain(n2,lp,env(c,t,.002,.02,.65,.35*k),d);
  const s=osc(c,'sine',t,.6);ramp(s.frequency,t,[[0,70],[.5,32]]);chain(s,env(c,t,.003,.03,.5,.5*k),d);},
 // 물 벽이 무너져 쏟아짐
 crash(c,d,t,p){const dur=p.dur||2.4,k=p.k||1;const b=noise(c,t,dur,1),lp=filt(c,'lowpass',520);chain(b,lp,env(c,t,.12,dur*.2,dur*.7,.5*k),d);
  S.rush(c,d,t+.05,{dur:dur*.9,k:.8*k,f0:900,f1:1600,f2:500});S.splash(c,d,t,{k:.6*k,big:1});},
 hum(c,d,t,p){const dur=p.dur||1.2,k=p.k||1;[55,110,165].forEach((f,i)=>{const o=osc(c,'sine',t,dur);ramp(o.frequency,t,[[0,f*.8],[dur,f*1.15]]);chain(o,env(c,t,dur*.8,.02,.15,(.14/(i+1))*k),d);});
  const n=noise(c,t,dur),lp=filt(c,'lowpass',600);chain(n,lp,env(c,t,dur*.8,.02,.15,.06*k),d);},
 roar(c,d,t,p){const dur=p.dur||6,k=p.k||1;const b=noise(c,t,dur,1),lp=filt(c,'lowpass',340);const g=env(c,t,1,dur-2,1,.32*k);
  const lfo=osc(c,'sine',t,dur);lfo.frequency.value=.35;const lg=c.createGain();lg.gain.value=.08*k;lfo.connect(lg);lg.connect(g.gain);chain(b,lp,g,d);},
 // 지글지글: 물이 말라 증발함
 sizzle(c,d,t,p){const dur=p.dur||3,k=p.k||1;const n=noise(c,t,dur),hp=filt(c,'highpass',3200);const g=env(c,t,dur*.2,dur*.5,dur*.3,.05*k);chain(n,hp,g,d);
  for(let i=0;i<dur*26;i++){const tt=t+R()*dur,m=noise(c,tt,.03),h=filt(c,'bandpass',4000+R()*4000,4);chain(m,h,env(c,tt,.001,.003,.02,(.06+R()*.08)*k),d);}},
 // 꾸르륵: 물이 빠지며 거품
 gurgle(c,d,t,p){const dur=p.dur||1.5,k=p.k||1,dens=p.dens||14;for(let i=0;i<dur*dens;i++){const tt=t+R()*dur,o=osc(c,'sine',tt,.12),f=150+R()*380;
   ramp(o.frequency,tt,[[0,f],[.09,f*(1.6+R())]]);const lp=filt(c,'lowpass',1400);chain(o,lp,env(c,tt,.004,.02,.07,(.08+R()*.06)*k),d);}
  const b=noise(c,t,dur,1),lp=filt(c,'lowpass',260);chain(b,lp,env(c,t,dur*.3,dur*.4,dur*.3,.12*k),d);},
 bubbles(c,d,t,p){S.gurgle(c,d,t,{dur:p.dur||2,k:(p.k||1)*.8,dens:22});},
 // 물을 밀어 올리며 솟구침
 surge(c,d,t,p){const k=p.k||1;S.rush(c,d,t,{dur:1.4,k:1.2*k,f0:400,f1:1100,f2:700});const s=osc(c,'sine',t,1);ramp(s.frequency,t,[[0,48],[.8,70]]);chain(s,env(c,t,.3,.2,.5,.3*k),d);
  S.splash(c,d,t+.9,{k:.5*k});},
 // 빨판이 들러붙는 젖은 소리
 squelch(c,d,t,p){const k=p.k||1;for(let i=0;i<4;i++){const tt=t+i*.12+R()*.05,n=noise(c,tt,.25),bp=filt(c,'bandpass',500,3);ramp(bp.frequency,tt,[[0,300+R()*200],[.2,900+R()*300]]);
  chain(n,bp,env(c,tt,.01,.04,.15,.22*k),d);}const o=osc(c,'sine',t,.6);ramp(o.frequency,t,[[0,90],[.5,60]]);chain(o,env(c,t,.02,.1,.4,.2*k),d);},
 // 나무가 삐걱임(선체 · 키)
 creak(c,d,t,p){const dur=p.dur||.7,k=p.k||1;const o=osc(c,'sawtooth',t,dur);ramp(o.frequency,t,[[0,95+R()*20],[dur*.5,140],[dur,110]]);
  const j=osc(c,'square',t,dur);j.frequency.value=31;const jg=c.createGain();jg.gain.value=18;j.connect(jg);jg.connect(o.frequency);
  const bp=filt(c,'bandpass',650,5);chain(o,bp,env(c,t,.05,dur*.6,dur*.3,.12*k),d);},
 // 별이 꺼지는 아주 작은 맑은 소리
 tink(c,d,t,p){const k=p.k||1,f=p.f||(1800+R()*1600);const o=osc(c,'sine',t,.8);o.frequency.value=f;chain(o,env(c,t,.002,.01,.55,.05*k),d);
  const o2=osc(c,'sine',t,.5);o2.frequency.value=f*2.76;chain(o2,env(c,t,.002,.005,.25,.012*k),d);},
 tinks(c,d,t,p){const n=p.n||6,dur=p.dur||2.4;for(let i=0;i<n;i++)S.tink(c,d,t+dur*i/n+R()*.1,{k:(p.k||1)*(p.up?(.6+.4*i/n):(1-.5*i/n)),f:p.up?1500+i*180+R()*200:3000-i*160+R()*200});},
 // 소리가 먹먹해지는 바람(검은 날개 아래)
 wind(c,d,t,p){const dur=p.dur||8,k=p.k||1;const n=noise(c,t,dur),lp=filt(c,'lowpass',p.f||420,.8);const g=env(c,t,1.2,dur-2.4,1.2,.16*k);
  const lfo=osc(c,'sine',t,dur);lfo.frequency.value=.18;const lg=c.createGain();lg.gain.value=180;lfo.connect(lg);lg.connect(lp.frequency);chain(n,lp,g,d);},
 // 거대한 날개가 공기를 미는 소리
 wing(c,d,t,p){const dur=p.dur||1.8,k=p.k||1;const n=noise(c,t,dur,1),lp=filt(c,'lowpass',300,1.5);ramp(lp.frequency,t,[[0,220],[dur*.45,900],[dur,200]]);chain(n,lp,env(c,t,dur*.4,.05,dur*.55,.4*k),d);},
 swell(c,d,t,p){const dur=p.dur||2.5,k=p.k||1;const s=osc(c,'sine',t,dur);ramp(s.frequency,t,[[0,36],[dur,46]]);chain(s,env(c,t,dur*.6,.1,dur*.3,.3*k),d);
  const b=noise(c,t,dur,1),lp=filt(c,'lowpass',240);chain(b,lp,env(c,t,dur*.6,.1,dur*.3,.25*k),d);},
 // 둔한 고동
 thump(c,d,t,p){const k=p.k||1;const o=osc(c,'sine',t,.6);ramp(o.frequency,t,[[0,58],[.45,34]]);chain(o,env(c,t,.01,.04,.45,.45*k),d);},
 // 공명 굽쇠
 fork(c,d,t,p){const k=p.k||1,f=p.f||440;[[1,.1],[2.01,.03],[6.2,.012]].forEach(([m,a])=>{const o=osc(c,'sine',t,3.5);o.frequency.value=f*m;chain(o,env(c,t,.004,.05,3.2/m,a*k),d);});},
 hiss(c,d,t,p){const dur=p.dur||1.2,k=p.k||1;const n=noise(c,t,dur),bp=filt(c,'bandpass',3600,1.1);chain(n,bp,env(c,t,dur*.2,dur*.5,dur*.3,.14*k),d);},
 // 빨아들이는 낮은 웅웅거림
 drone(c,d,t,p){const dur=p.dur||8,k=p.k||1;[46,48.6,92.4].forEach((f,i)=>{const o=osc(c,'sine',t,dur);o.frequency.value=f;chain(o,env(c,t,1.5,dur-3,1.5,(i<2?.13:.04)*k),d);});
  const b=noise(c,t,dur,1),lp=filt(c,'lowpass',180);chain(b,lp,env(c,t,1.5,dur-3,1.5,.14*k),d);},
 // 종소리 같은 심장 박동(창백한 고래의 심장)
 heartbell(c,d,t,p){const k=p.k||1;S.thump(c,d,t,{k:1.2*k});S.thump(c,d,t+.28,{k:.8*k});
  [[196,.08,4],[466,.035,2.6],[742,.02,1.8],[1046,.012,1.2]].forEach(([f,a,dd])=>{const o=osc(c,'sine',t,dd+.2);o.frequency.value=f;chain(o,env(c,t+.01,.004,.05,dd,a*k),d);});},
 breath(c,d,t,p){const dur=p.dur||1,k=p.k||1;const n=noise(c,t,dur),lp=filt(c,'lowpass',900);chain(n,lp,env(c,t,dur*.4,dur*.2,dur*.4,.12*k),d);},
 // 잔잔한 물결(배 둘레)
 lap(c,d,t,p){const dur=p.dur||7,k=p.k||1;for(let i=0;i<dur/1.3;i++){const tt=t+i*1.3+R()*.4,n=noise(c,tt,1.1,1),lp=filt(c,'lowpass',500+R()*300);chain(n,lp,env(c,tt,.35,.1,.6,.09*k),d);}}
};

/* ───────── 장면별 시간표 [시각, 소리, 설정] (장면 제목으로 찾음) ───────── */
const CUES={
 // 창백한 고래
 'pallid-harpoon':o=>o.hold?[]:[[0,'lap',{dur:7}],[.05,'groan',{dur:3.2,f:40,k:1}],[0,'rush',{dur:2.2,k:1.1}],[1.45,'splash',{big:1,k:.9}],[2.5,'whoosh',{dur:.5}],[3.05,'thunk',{k:1}],[3.2,'groan',{dur:2,f:56,k:.8}],[4.4,'rush',{dur:2.6,k:.8,f0:900,f1:600,f2:300}]],
 'pallid-heart':()=>[[0,'heartbell',{}],[2.4,'heartbell',{k:.9}],[4.8,'heartbell',{k:.8}]],
 // 푸른 고래
 '수면의 절단':()=>[[0,'lap',{dur:7}],[1.2,'slice',{}],[2.7,'crash',{dur:2.2}],[4.4,'whoosh',{dur:.8,k:.4,f0:1200,f1:400}]],
 '초고속 관통':()=>[[0,'hum',{dur:1.2}],[1.2,'crack',{}],[1.55,'slice',{k:.8}],[2.5,'crash',{dur:2.4}]],
 '푸른 항로 추적':()=>[[0,'roar',{dur:8}],[2.8,'crash',{dur:2}],[5.3,'slice',{k:.5}]],
 '관통 회피':()=>[[0,'hum',{dur:1.3}],[1.65,'creak',{dur:.6}],[1.7,'splash',{k:.6}],[2.05,'crack',{}],[3.1,'crash',{dur:2}]],
 '최후의 교차':()=>[[0,'wind',{dur:6,f:600,k:.6}],[1.2,'whoosh',{dur:.6}],[2.2,'clank',{k:1.2}],[2.25,'crack',{k:.8}]],
 // 붉은 고래
 '내려가는 물':()=>[[0,'sizzle',{dur:8}],[1.6,'gurgle',{dur:2}],[5.4,'surge',{k:.4}]],
 '붉은 팔의 포위':()=>[[0,'sizzle',{dur:8,k:.6}],[.9,'surge',{}],[2.6,'squelch',{}],[2.7,'sizzle',{dur:1.4,k:1.2}],[4.6,'creak',{dur:1.2}],[5.2,'creak',{dur:.8,k:.8}]],
 '여덟 팔 격퇴':()=>[[0,'surge',{}],[2,'thunk',{k:.8,metal:false}],[3.6,'thunk',{k:.8,metal:false}],[5.2,'thunk',{k:.8,metal:false}],[6.8,'thunk',{k:.8,metal:false}]],
 '드러난 붉은 등':()=>[[0,'sizzle',{dur:8,k:.8}],[1.2,'surge',{}],[3,'groan',{dur:3,f:34,k:.7}],[5.6,'rush',{dur:2.4}]],
 '작살과 물의 귀환':()=>[[0,'rush',{dur:1.6,k:.6}],[1.6,'surge',{}],[3,'squelch',{k:1.2}],[3.7,'creak',{}],[4.5,'thunk',{}],[4.95,'breath',{dur:1.1}],[6,'sizzle',{dur:3,k:1.2}]],
 '여덟 팔의 끝':()=>[[0,'thunk',{}],[.2,'splash',{big:1}],[4.2,'rush',{dur:2.4,k:.5}],[6.6,'lap',{dur:4.4}]],
 // 까만 고래
 '별이 꺼지는 수평선':()=>[[0,'wind',{dur:10,k:.8}],[.3,'tinks',{n:7,dur:2.2}],[4.8,'tink',{f:900,k:1.4}],[7.6,'tinks',{n:7,dur:2.2,up:1}]],
 '닫히는 날개':()=>[[0,'swell',{dur:1.8}],[1.6,'wing',{}],[4,'wind',{dur:3,f:300}],[7,'wing',{dur:1.6,k:.8}]],
 '꺼지는 별':()=>[[0,'tinks',{n:8,dur:2.4}],[4.4,'tink',{f:2200,k:1.6}],[6.6,'wind',{dur:2.4,f:300,k:.7}]],
 '감싸인 배':()=>[[0,'wind',{dur:9,f:260,k:.7}],[2.6,'thump',{}],[3.8,'thump',{k:.9}],[5,'thump',{k:.85}],[6.2,'thump',{k:.8}],[7.4,'creak',{dur:.9}]],
 '날개 끝':()=>[[0,'swell',{}],[1.6,'wing',{}],[3.2,'thunk',{}],[4.4,'tinks',{n:6,dur:3}],[7.6,'hiss',{dur:.6,k:.6}],[8.4,'wing',{dur:2,k:1.2}],[10.4,'tinks',{n:7,dur:2,up:1}]],
 '유인':()=>[[0,'lap',{dur:12}],[2.4,'splash',{k:.3}],[5.6,'wing',{dur:2.2}]],
 '관측':()=>[[0,'wind',{dur:9,k:.5}],[2.2,'creak',{}],[2.4,'gurgle',{dur:1.4,k:.7}],[5.6,'tink',{f:1200}]],
 '고정':()=>[[0,'wing',{dur:2.4}],[2.6,'fork',{}],[4.6,'fork',{f:442,k:.7}]],
 '접지 못한 날개':()=>[[0,'fork',{}],[.05,'fork',{f:443}],[4.4,'whoosh',{dur:.6}],[6.4,'tinks',{n:7,dur:2.4,up:1}],[9.4,'rush',{dur:2.4,k:.5}]],
 // 노란 고래
 '가라앉는 삼각형':()=>[[0,'drone',{dur:11}],[2.6,'bubbles',{dur:2}],[5.4,'surge',{k:.8}],[5.6,'bubbles',{dur:2.4}],[8.2,'gurgle',{dur:2.4}]],
 '따개비 껍데기':()=>[[0,'gurgle',{dur:2,k:.6}],[3,'thunk',{}],[3.2,'splash',{k:.6}]],
 '삼백 년':()=>[[0,'drone',{dur:12,k:.6}],[2.6,'gurgle',{dur:1}],[3.4,'gurgle',{dur:1}],[4.2,'gurgle',{dur:1.2}],[9,'rush',{dur:2.6,k:.4}]],
 'vent':()=>[[0,'drone',{dur:7,k:.7}],[0,'bubbles',{dur:7,k:.5}]]
};
function cuesFor(key,o){const f=CUES[key]||(/열수공/.test(key)?CUES.vent:null);return f?f(o||{}):[];}

/* ───────── 재생 ───────── */
function ensure(){if(ctx)return ctx;if(!AC)return null;ctx=new AC();master=ctx.createDynamicsCompressor();master.threshold.value=-14;master.ratio.value=4;
 const g=ctx.createGain();g.gain.value=.8;master.connect(g);g.connect(ctx.destination);return ctx;}
function play(name,p,at){const c=ensure();if(!c||!S[name])return;if(c.state==='suspended')c.resume();try{S[name](c,master,Math.max(c.currentTime,c.currentTime+(at||0)),p||{});}catch(e){}}
function tick(el,key,t,o){
 if(!el)return;const st=el.__sfx||(el.__sfx={key:null,lt:0});
 if(st.key!==key){st.key=key;st.lt=t-.0001;return;}
 let lt=st.lt;st.lt=t;
 if(!on||document.hidden)return;
 if(t<lt-.05)lt=-.001;                        // 반복: 처음부터
 if(t-lt>.5)return;                           // 오래 멈췄다 이어진 경우(되감기 등)는 건너뜀
 cuesFor(key,o).forEach(([at,name,p])=>{if(at>lt&&at<=t)play(name,p);});
}
function setOn(v){on=!!v;try{localStorage.setItem('calSfx',on?'1':'0');}catch(e){}if(on){const c=ensure();if(c&&c.state==='suspended')c.resume();}
 document.querySelectorAll('.cal-sfx-btn').forEach(b=>{b.textContent=on?'소리 끄기':'소리 켜기';b.setAttribute('aria-pressed',on?'true':'false');});}
// 소리 켜기 단추(미리보기 · 게임 화면 구석)
function ui(host){
 if(document.querySelector('.cal-sfx-btn'))return;
 const b=document.createElement('button');b.type='button';b.className='cal-sfx-btn';b.textContent=on?'소리 끄기':'소리 켜기';b.setAttribute('aria-pressed',on?'true':'false');
 b.addEventListener('click',()=>setOn(!on));(host||document.body).appendChild(b);
 const st=document.createElement('style');st.textContent='.cal-sfx-btn{position:fixed;right:14px;bottom:14px;z-index:9999;font:600 13px/1 system-ui,sans-serif;padding:10px 14px;border-radius:999px;border:1px solid #ffffff40;background:#0c1118d9;color:#e8eef4;cursor:pointer}.cal-sfx-btn[aria-pressed="true"]{border-color:#9fd2ef;color:#fff}';document.head.appendChild(st);
}
// 영상용: 시간표를 오프라인으로 그려 16비트 WAV(base64)로
async function offline(key,from,dur,o){
 o=o||{};const sr=44100,c=new OfflineAudioContext(2,Math.ceil(sr*dur),sr);
 const m=c.createDynamicsCompressor();m.threshold.value=-14;m.ratio.value=4;const g=c.createGain();g.gain.value=.8;m.connect(g);g.connect(c.destination);
 const loop=o.loop||0,list=cuesFor(key,o);
 for(let base=loop?Math.floor(from/loop)*loop:0;base<from+dur;base+=loop||1e9){list.forEach(([at,name,p])=>{const tt=base+at-from;if(tt>=0&&tt<dur&&S[name])S[name](c,m,tt,p||{});});if(!loop)break;}
 (o.extra||[]).forEach(([at,name,p])=>{const tt=at-from;if(tt>=0&&tt<dur&&S[name])S[name](c,m,tt,p||{});});
 const buf=await c.startRendering(),L=buf.getChannelData(0),Rc=buf.getChannelData(1),n=L.length;
 const ab=new ArrayBuffer(44+n*4),v=new DataView(ab);const w=(o2,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o2+i,s.charCodeAt(i));};
 w(0,'RIFF');v.setUint32(4,36+n*4,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,sr,true);v.setUint32(28,sr*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*4,true);
 for(let i=0;i<n;i++){v.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]))*32767,true);v.setInt16(46+i*4,Math.max(-1,Math.min(1,Rc[i]))*32767,true);}
 let s='';const u8=new Uint8Array(ab);for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));return btoa(s);
}
window.CalSFX={tick,play,ui,offline,cues:cuesFor,get on(){return on;},enable:()=>setOn(true),disable:()=>setOn(false),toggle:()=>setOn(!on)};
if(window.CAL_SFX_UI)document.addEventListener('DOMContentLoaded',()=>ui());
})();
