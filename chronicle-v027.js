/* 대호수 v0.2.7 · 일대기
   한 선장의 항해를 사망·은퇴·오재앙 완전 사냥으로 마칠 때까지 기록한다(구매·호수 진입·선원 탑승·선택지와 그 결과·전투·귀항·사망 등).
   · 호수의 법·노랫말·구전·소문처럼 규칙에 관한 내용은 기록하지 않는다(선택지를 고른 결과만 남김).
   · 일대기는 txt 파일로 내려받을 수 있다.
   · '보관'한 일대기는 최대 5개까지 남고, 보관하지 않은 일대기는 끝난 뒤 2일이 지나면 지워진다.
   기록은 이 브라우저의 localStorage에만 저장되며, 게임 저장 데이터와 따로 둔다. */
(function(){
 'use strict';
 if(typeof render!=='function')return;
 const KEY='great-lake-chronicle-027',KEEP_MAX=5,TTL=2*24*3600*1000,LINE_MAX=4000,LIST_MAX=20;
 let db=load();
 function load(){try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&Array.isArray(v.list))return v;}catch(e){}return {cur:null,list:[]};}
 function store(){try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}}
 function purge(){
  const now=Date.now();
  db.list=db.list.filter(c=>c.kept||now-(c.end||c.start)<TTL);
  // 보관하지 않은 것은 너무 많이 쌓이지 않게 최근 것만
  let un=0;db.list=db.list.filter(c=>c.kept||++un<=LIST_MAX);
 }
 const captainName=()=>String((typeof state!=='undefined'&&state&&(state.captainName||state.playerName))||'').trim()||'선장';
 function cur(){
  if(!db.cur)db.cur={id:'c'+Date.now().toString(36)+Math.floor(Math.random()*1e4),start:Date.now(),captain:captainName(),lines:[],kept:false};
  return db.cur;
 }
 // 규칙에 관한 문장은 남기지 않는다
 const RULE_RE=/(호수의 법|구전|노랫말|전언|소문|목격담|규칙|진위)/;
 function add(text,force){
  text=String(text||'').replace(/\s+/g,' ').trim();if(!text)return;
  if(!force&&RULE_RE.test(text))return;
  if(/^\[테스트\]/.test(text))return;
  if(!db.cur&&!force&&typeof state!=='undefined'&&(state.scene==='dead'||state.scene==='start'))return;   // 사망 직후 남는 기록으로 빈 일대기가 생기지 않게
  const c=cur();const nm=captainName();if(nm!=='선장'||!c.captain)c.captain=nm;
  const last=c.lines[c.lines.length-1];if(last&&last.t===text&&Date.now()-last.at<1500)return;   // 같은 문장 연달아 중복 방지
  c.lines.push({at:Date.now(),t:text});if(c.lines.length>LINE_MAX)c.lines.splice(0,c.lines.length-LINE_MAX);
  store();
 }
 function finish(cause){
  const c=db.cur;if(!c)return;
  c.end=Date.now();c.cause=cause||'사망';c.captain=c.captain||captainName();
  db.list.unshift(c);db.cur=null;purge();store();
 }
 const lakeLabel=id=>{try{const l=LAKE_BY_ID157.get(id);return (l&&l.storyNo?l.storyNo:'21-'+String(id).padStart(2,'0'))+(l&&l.name?' '+l.name:'');}catch(e){return '21-'+String(id).padStart(2,'0');}};
 const lakeIn=id=>{const s=lakeLabel(id);return /호수$/.test(s)?s:s+' 호수';};
 function storyNode(id){try{const st=state.lakeStory;if(!st||st.id!==id)return null;if(st.step==='afterMermaid')return {text:'인어의 소란을 넘기자 열렸던 물길이 다시 나타난다.'};
  const d=(typeof STORY_DEFS!=='undefined'&&STORY_DEFS[id-1])||(typeof SCRIPTED_LAKE_MAP_015!=='undefined'&&SCRIPTED_LAKE_MAP_015.get(id));return d&&d.nodes?d.nodes[st.step]||null:null;}catch(e){return null;}}

 /* ---------- 기록 고리 ---------- */
 // 1) 게임 기록줄(log): 출항·귀항·전투·조우·업적 등
 if(typeof log==='function'){const L=log;log=function(msg){try{add(msg);}catch(e){}return L.apply(this,arguments);};}
 // 2) 선택지와 그 결과: 화면에 보이는 그대로(변수가 채워진 문장) 기록한다
 function sceneText(){
  const h=[...document.querySelectorAll('h3')].find(x=>x.offsetParent&&x.textContent.trim()==='발생 사건');
  const p=h&&h.nextElementSibling;return p?p.textContent.replace(/\s+/g,' ').trim():'';
 }
 document.addEventListener('click',function(e){
  const b=e.target&&e.target.closest&&e.target.closest('button[data-act="storyChoice"]');if(!b||b.disabled||typeof state==='undefined')return;
  const lakeId=state.current,before=sceneText(),choice=b.textContent.replace(/^\s*▸\s*/,'').replace(/\s+/g,' ').trim(),tag='['+lakeLabel(lakeId)+'] ';
  if(before)add(tag+'장면: '+before,true);
  add(tag+'선택: '+choice,true);
  let tries=0;
  (function check(){
   try{
    if(state.scene==='dead'||!db.cur)return;                         // 사망은 아래 사망 고리에서 기록
    if(state.current!==lakeId||state.scene==='route'||state.scene==='port'){add(tag+'결과: 호수를 빠져나왔다.',true);return;}
    const now=sceneText();
    if(now&&now!==before){add(tag+'결과: '+now,true);return;}
    if(state.scene!=='event'){const map={battle:'인어와 맞닥뜨렸다.',encounter:'재앙의 고래와 맞닥뜨렸다.',rareWhale:'희귀 고래와 맞닥뜨렸다.',special:'뜻밖의 일이 일어났다.'};if(map[state.scene]){add(tag+'결과: '+map[state.scene],true);return;}}
   }catch(err){return;}
   if(++tries<40)setTimeout(check,100);   // 동전 던지기 등 연출이 끝난 뒤 바뀌는 결과도 기다렸다 기록(최대 4초)
  })();
 },true);
 // 3) 사망: 마지막 기록을 남기고 일대기를 닫는다. 은퇴는 외부에서 finish('뭍에 내렸다')를 호출한다.
 if(typeof die==='function'){
  const D=die;
  die=function(){
   try{const where=state.current?lakeLabel(state.current)+'에서 ':'';add(where+'사망했다. 항해가 끝났다.',true);finish(where+'사망');}catch(e){}
   return D.apply(this,arguments);
  };
 }
 // 4) 지출(물건 구매·선원 고용·승급 등)과 선원 탑승: 버튼을 누른 뒤 자금·선원 수 변화로 판단
 document.addEventListener('click',function(e){
  const b=e.target&&e.target.closest&&e.target.closest('button[data-act]');if(!b||typeof state==='undefined')return;
  const act=b.dataset.act;if(act==='storyChoice'||act==='tab'||act==='prepare'||act==='launch')return;   // 출항 보급비는 게임 기록줄에 이미 남음
  const g0=Number(state.gold)||0,c0=(state.crew||[]).length,label=b.textContent.replace(/\s+/g,' ').trim().split(' · ')[0];
  setTimeout(function(){
   try{
    const g1=Number(state.gold)||0,c1=(state.crew||[]).length;
    if(act==='rumor'||act==='buyRumor'){if(g1<g0)add('정박 항구에서 이야기를 들었다. (−'+(g0-g1)+' 만 안)',true);return;}
    if(c1>c0){const nw=(state.crew||[]).slice(c0).map(x=>(typeof ROLE!=='undefined'&&ROLE[x.role]&&ROLE[x.role].name)||x.role).join(', ');add('선원 탑승: '+nw+(g1<g0?' (−'+(g0-g1)+' 만 안)':''),true);}
    else if(g1<g0)add('지출: '+label+' (−'+(g0-g1)+' 만 안)',true);
   }catch(err){}
  },0);
 },true);
 // 5) 호수 진입 · 항로 · 귀항 화면 전환
 let lastLake=null,lastScene=null;
 const R=render;
 render=function(){
  const out=R.apply(this,arguments);
  try{
   if(state.scene==='event'&&state.current&&state.current!==lastLake){lastLake=state.current;add(lakeIn(state.current)+'에 들어섰다.',true);}
   if(state.scene!=='event'&&state.scene!=='battle'&&state.scene!=='encounter'&&state.scene!=='rareWhale'&&state.scene!=='special'&&state.scene!=='blueHunt')lastLake=state.scene==='route'?lastLake:null;
   if(state.scene==='port'&&lastScene&&lastScene!=='port'&&lastScene!=='start'&&lastScene!=='prep')add('항구에 정박했다.',true);
   if(state.scene==='start'&&lastScene!=='start'&&lastScene!=null)lastLake=null;
   lastScene=state.scene;
  }catch(e){}
  return out;
 };

 /* ---------- txt 만들기 · 내려받기 ---------- */
 const pad=n=>String(n).padStart(2,'0');
 const fmt=ts=>{const d=new Date(ts);return d.getFullYear()+'.'+pad(d.getMonth()+1)+'.'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes());};
 const fmtT=ts=>{const d=new Date(ts);return pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());};
 function toText(c){
  const head=['대호수 · 일대기','선장: '+(c.captain||'선장'),'시작: '+fmt(c.start),'끝: '+(c.end?fmt(c.end)+' ('+(c.cause||'사망')+')':'항해 중'),'기록: '+c.lines.length+'줄','─'.repeat(28),''];
  let day='';const body=[];
  c.lines.forEach(l=>{const d=fmt(l.at).slice(0,10);if(d!==day){day=d;body.push('');body.push('〔'+d+'〕');}body.push('['+fmtT(l.at)+'] '+l.t);});
  return head.concat(body).join('\r\n')+'\r\n';
 }
 function download(c){
  const d=new Date(c.end||Date.now()),name='대호수_일대기_'+(c.captain||'선장').replace(/[\\/:*?"<>|]/g,'')+'_'+d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'-'+pad(d.getHours())+pad(d.getMinutes())+'.txt';
  const blob=new Blob(['﻿'+toText(c)],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
 }
 const find=id=>id&&db.cur&&db.cur.id===id?db.cur:db.list.find(c=>c.id===id);
 const keptCount=()=>db.list.filter(c=>c.kept).length+(db.cur&&db.cur.kept?1:0);
 let notice='';
 document.addEventListener('click',function(e){
  const b=e.target&&e.target.closest&&e.target.closest('[data-chron]');if(!b)return;
  e.preventDefault();const c=find(b.dataset.id),k=b.dataset.chron;if(!c)return;
  if(k==='dl')download(c);
  else if(k==='keep'){if(!c.kept&&keptCount()>=KEEP_MAX){notice='보관은 최대 '+KEEP_MAX+'개까지입니다. 다른 일대기의 보관을 해제한 뒤 다시 시도하십시오.';}else{c.kept=!c.kept;notice='';store();}}
  else if(k==='del'){if(c===db.cur)return;db.list=db.list.filter(x=>x!==c);store();}
  render();
 });

 /* ---------- 시작 화면의 일대기 칸 ---------- */
 const esc2=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
 function left(c){if(c.kept||!c.end)return '';const ms=TTL-(Date.now()-c.end);if(ms<=0)return '곧 삭제';const h=Math.ceil(ms/3600000);return h>=24?Math.floor(h/24)+'일'+(h%24?' '+(h%24)+'시간':'')+' 뒤 삭제':h+'시간 뒤 삭제';}
 function item(c,live){
  const lines=c.lines.slice(-60).map(l=>'['+fmtT(l.at)+'] '+esc2(l.t)).join('\n');
  return '<div class="chron-item027'+(c.kept?' kept':'')+(live?' live':'')+'">'+
   '<div class="chron-row027"><div class="chron-meta027"><b>'+esc2(c.captain||'선장')+'의 일대기</b>'+
    '<span>'+fmt(c.start)+(c.end?' ~ '+fmt(c.end).slice(11)+' · '+esc2(c.cause||'사망'):' ~ 항해 중')+' · '+c.lines.length+'줄</span>'+
    '<span class="chron-tag027">'+(live?'진행 중':c.kept?'보관됨':esc2(left(c)))+'</span></div>'+
    '<div class="chron-btns027"><button type="button" data-chron="dl" data-id="'+c.id+'">txt 저장</button>'+
    '<button type="button" data-chron="keep" data-id="'+c.id+'">'+(c.kept?'보관 해제':'보관하기')+'</button>'+
    (live?'':'<button type="button" class="chron-del027" data-chron="del" data-id="'+c.id+'">지우기</button>')+'</div></div>'+
   '<details class="chron-view027"><summary>내용 보기'+(c.lines.length>60?' (최근 60줄)':'')+'</summary><pre>'+(lines||'아직 기록이 없습니다.')+'</pre></details>'+
  '</div>';
 }
 function panel(){
  purge();
  const all=(db.cur&&db.cur.lines.length?[item(db.cur,true)]:[]).concat(db.list.map(c=>item(c,false)));
  return '<section class="landing-chron027" aria-label="일대기">'+
   '<div class="landing-sectionlabel025">일대기</div><h2>항해의 기록</h2>'+
   '<p class="chron-note027">선장이 사망하거나, 뭍에 내리거나, 오재앙을 잠재우고 항해를 끝낼 때까지 무엇을 사고, 어느 호수에 들어가, 누구를 태우고, 어떤 선택을 해 어떤 일이 일어났는지가 기록됩니다. 호수의 법과 노랫말 같은 규칙은 기록하지 않습니다. '+
   'txt 파일로 저장할 수 있으며, <b>보관하기</b>를 누른 일대기는 최대 '+KEEP_MAX+'개까지 남고 보관하지 않은 일대기는 끝난 뒤 2일이 지나면 지워집니다. (보관 '+keptCount()+' / '+KEEP_MAX+')</p>'+
   (notice?'<p class="chron-warn027">'+esc2(notice)+'</p>':'')+
   (all.length?'<div class="chron-list027">'+all.join('')+'</div>':'<div class="chron-empty027">아직 남겨진 일대기가 없습니다. 첫 항해를 시작하면 기록이 쌓입니다.</div>')+
  '</section>';
 }
 window.Chronicle027={panel,add,finish,toText,download,get db(){return db;}};
 purge();store();
 if(typeof state!=='undefined'&&state.scene==='start')render();
})();
