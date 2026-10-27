
/* 창백의 향유고래 · 고화질 벡터 시네마틱. 장면 변환은 CSS 키프레임만 사용합니다. */
(function(){
'use strict';
const NAMES={
 harpoon:['작살 공격','수면을 가르고 날아간 작살이 고래의 외피에 박힙니다.'],
 ingest:['위장 진입','커다란 턱이 벌어지고 선박이 깊은 식도로 빨려 들어갑니다.'],
 acid:['위산 통과','위액이 솟았다 가라앉는 짧은 틈을 이용해 건너갑니다.'],
 search:['심장 탐색','여러 혈관의 박동 사이에서 다른 박자를 가진 작은 심장을 찾습니다.'],
 final:['최종 전투','작살잡이가 심장 속의 심장을 향해 최후의 일격을 가합니다.'],
 victory:['심장 파괴','심장 속의 심장이 찢어지자 고래의 거대한 박동이 멈춥니다.']
};
const D=[
'<defs>',
'<linearGradient id="cinSea" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#214958"/><stop offset=".55" stop-color="#092331"/><stop offset="1" stop-color="#030c18"/></linearGradient>',
'<linearGradient id="cinMoon" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#f0ead9"/><stop offset=".38" stop-color="#9aafb0"/><stop offset=".74" stop-color="#4b6974"/><stop offset="1" stop-color="#1f3d4e"/></linearGradient>',
'<linearGradient id="cinSteel"><stop stop-color="#344955"/><stop offset=".5" stop-color="#f4f4dc"/><stop offset=".75" stop-color="#88a5ad"/><stop offset="1" stop-color="#e2eee7"/></linearGradient>',
'<radialGradient id="cinDark"><stop stop-color="#010408"/><stop offset=".33" stop-color="#0b121e"/><stop offset=".62" stop-color="#552c3a"/><stop offset=".8" stop-color="#956871"/><stop offset="1" stop-color="#d7c3b5"/></radialGradient>',
'<linearGradient id="cinFlesh" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#b66b67"/><stop offset=".32" stop-color="#783743"/><stop offset=".7" stop-color="#3c1b2b"/><stop offset="1" stop-color="#140f1c"/></linearGradient>',
'<linearGradient id="cinAcid" x1="0" y1="0" x2=".1" y2="1"><stop stop-color="#e4ee9b"/><stop offset=".22" stop-color="#96b64e"/><stop offset=".63" stop-color="#517933"/><stop offset="1" stop-color="#183c2c"/></linearGradient>',
'<radialGradient id="cinHeart"><stop stop-color="#f2bbac"/><stop offset=".25" stop-color="#df7180"/><stop offset=".65" stop-color="#ad3951"/><stop offset="1" stop-color="#5a1b30"/></radialGradient>',
'<radialGradient id="cinGlow"><stop stop-color="#ffffe8" stop-opacity=".88"/><stop offset=".25" stop-color="#ee9e8b" stop-opacity=".39"/><stop offset="1" stop-color="#f37b7d" stop-opacity="0"/></radialGradient>',
'<filter id="cinBloom" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="11"/></filter>',
'<filter id="cinSmallGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/></filter>',
'<pattern id="cinLines" width="15" height="10" patternUnits="userSpaceOnUse"><path d="M0 9 L15 7" stroke="#d5f4d9" stroke-opacity=".1" fill="none"/></pattern>',
'<clipPath id="cinViewport"><rect width="960" height="540" rx="0"/></clipPath>',
'</defs>'
].join('');
function sea(){
 return '<path d="M0 386 Q130 374 250 381 Q450 402 645 367 Q805 352 960 376 L960 540 H0Z" fill="url(#cinSea)" class="cine-water"/>'+
 '<path d="M0 401 Q150 380 280 409 Q500 427 645 394 T960 399" fill="none" stroke="#abc8c7" stroke-width="3" opacity=".3" class="cine-water"/>'+
 '<path d="M0 450 Q200 425 410 455 T960 460M0 494 Q130 483 280 492 T960 482" fill="none" stroke="#71a3ad" stroke-width="3" opacity=".26" class="cine-water"/>'+
 '<path d="M0 397H960V540H0Z" fill="url(#cinLines)" opacity=".4"/>';
}
function ship(){
 return '<g class="cine-ship">'+
 '<path d="M130 344 L394 344 L369 386 Q241 409 151 381Z" fill="#1b2d36" stroke="#a5b5ae" stroke-width="3"/>'+
 '<path d="M146 350 L384 350 L358 372 Q234 393 166 369Z" fill="#3e5560"/>'+
 '<path d="M180 337L350 337" stroke="#c6d8d4" stroke-width="4"/>'+
 '<path d="M252 344V162" stroke="#9fadb3" stroke-width="6"/>'+
 '<path d="M260 180 Q318 224 341 320 L262 320Z" fill="#a3b1af" stroke="#f0f0e2" stroke-width="3"/>'+
 '<path d="M246 185 Q215 235 194 316 L246 320Z" fill="#647a82" stroke="#bcc7bd" stroke-width="2"/>'+
 '<path d="M248 178L255 172L262 178" fill="#e3e9dc"/>'+
 '<path d="M149 345L129 332M372 345L393 333" stroke="#98b1b3" stroke-width="4"/>'+
 '<path d="M195 339V325M345 338V326" stroke="#e2d1ba" stroke-width="4"/>'+
 '<path d="M157 394Q236 403 365 392M188 404Q300 418 393 403" fill="none" stroke="#a5ded4" opacity=".5" stroke-width="3"/>'+
 '</g>';
}
function spear(){
 return '<g class="cine-spear" stroke-linejoin="round">'+
 '<path d="M240 292L565 292" stroke="#132631" stroke-width="15"/>'+
 '<path d="M245 291L562 291" stroke="url(#cinSteel)" stroke-width="7"/>'+
 '<path d="M539 281L580 291L539 303L549 292Z" fill="#f5ffeb" stroke="#88bac2" stroke-width="3"/>'+
 '<path d="M305 286V298M320 286V298M335 286V298" stroke="#c9e3df" stroke-width="3"/>'+
 '</g>';
}
function heart(){
 return '<g class="cine-heart-fight">'+
 '<path d="M600 174C526 95 394 143 394 258C394 347 512 421 607 453C704 412 836 331 817 230C801 127 671 104 600 174Z" fill="url(#cinHeart)" stroke="#d78283" stroke-width="8"/>'+
 '<path d="M605 180C565 102 610 85 650 89M651 190C717 100 764 125 788 95M540 190C491 100 445 105 429 80" fill="none" stroke="#8c314a" stroke-width="44" stroke-linecap="round"/>'+
 '<path d="M605 180C565 102 610 85 650 89M651 190C717 100 764 125 788 95M540 190C491 100 445 105 429 80" fill="none" stroke="#d17675" stroke-width="16" stroke-linecap="round"/>'+
 '<path d="M482 239C477 308 506 357 556 394M690 197C750 238 748 313 691 375M601 226L627 370" stroke="#ffe0ba" stroke-width="5" opacity=".4" fill="none"/>'+
 '<ellipse cx="609" cy="280" rx="74" ry="96" fill="#51172f" stroke="#f09b9f" stroke-width="6"/>'+
 '<g class="cine-innerheart"><path d="M607 253C585 219 544 240 554 279C561 312 602 336 609 341C639 327 663 295 654 264C646 234 619 231 607 253Z" fill="#e78186" stroke="#ffdbb9" stroke-width="4"/><path d="M585 270Q603 260 622 292" fill="none" stroke="#fff0d7" stroke-width="4" opacity=".75"/></g>'+
 '</g>';
}
const SCENES={
 harpoon:function(){
 return '<rect width="960" height="540" fill="#08121f"/><circle cx="755" cy="83" r="140" fill="#8299a0" opacity=".07" filter="url(#cinBloom)"/>'+
 '<path d="M0 324Q180 290 355 328T960 308" stroke="#83aab1" stroke-width="2" fill="none" opacity=".2"/>'+
 '<g class="cine-whale-body"><path d="M498 366C503 265 561 164 689 147C809 132 936 202 996 283L1006 446L494 446Z" fill="url(#cinMoon)" stroke="#dce2d7" stroke-width="4"/>'+
 '<path d="M548 350C609 268 681 247 805 263" fill="none" stroke="#f0e9d6" stroke-width="5" opacity=".38"/>'+
 '<path d="M750 161C790 98 823 101 864 125L843 181Z" fill="#9eaeaf"/>'+
 '<path d="M551 305L598 284M627 261L668 248M726 237L781 243" stroke="#eee6da" opacity=".6" stroke-width="4"/>'+
 '<path class="cine-whale-scars" d="M610 321l35-28 9 22M678 299l22-29 25 13M759 342l31-29 17 14" stroke="#526573" stroke-width="7" fill="none"/>'+
 '<ellipse cx="738" cy="304" rx="9" ry="11" fill="#05121a" stroke="#e0dfd0" stroke-width="3" class="cine-eye"/></g>'+
 sea()+ship()+
 '<path class="cine-trail" d="M90 405Q340 340 790 267" fill="none" stroke="#e2fffd" stroke-width="8" stroke-linecap="round" filter="url(#cinSmallGlow)"/>'+
 spear()+
 '<g class="cine-impact"><circle cx="681" cy="287" r="21" stroke="#faffee" stroke-width="7" fill="none"/><circle cx="681" cy="287" r="42" stroke="#9ce3db" stroke-width="3" fill="none"/></g>'+
 '<g class="cine-splinters" stroke="#ebfff5" stroke-width="5" stroke-linecap="round"><path d="M680 255L683 220M695 293L730 278M671 306L644 338M702 307L729 330M661 276L628 255"/></g>';
 },
 ingest:function(){
 return '<rect width="960" height="540" fill="#0a0e16"/>'+
 '<ellipse class="cine-gullet" cx="600" cy="265" rx="440" ry="317" fill="url(#cinDark)"/>'+
 '<ellipse cx="625" cy="272" rx="210" ry="167" fill="#010409"/>'+
 '<path d="M390 144Q600 89 831 150M357 397Q607 468 857 386" fill="none" stroke="#d3adb0" stroke-width="13" opacity=".3"/>'+
 '<g class="cine-mouth-upper"><path d="M-25 -20H1010V163Q831 179 729 170Q581 208 430 160Q217 179 -25 138Z" fill="url(#cinMoon)" stroke="#e8d4cb" stroke-width="8"/>'+
 '<path d="M99 160l40 81 41-85 42 68 32-67 36 72 37-70 43 62 42-59 49 58 48-42 50 45 48-40 52 43 42-38 43 44 44-50 35 53 39-49" fill="#e4e0cf" stroke="#d8b7ac" stroke-width="4"/></g>'+
 '<g class="cine-mouth-lower"><path d="M-30 553V370Q220 351 400 385Q600 347 800 366Q920 359 997 397V555Z" fill="url(#cinMoon)" stroke="#e8d4cb" stroke-width="9"/>'+
 '<path d="M100 378l36-83 47 76 35-74 42 73 31-81 36 84 44-66 37 66 40-77 46 78 44-65 38 64 40-72 41 77 39-74 48 77 40-81" fill="#e5e1d2" stroke="#d8b7ac" stroke-width="4"/></g>'+
 '<g class="cine-swallowed-ship">'+ship().replace('class="cine-ship"','class="cine-captured-ship"')+'</g>'+
 '<rect class="cine-rim-dark" width="960" height="540" fill="#010306"/>'+
 '<path d="M0 60Q160 180 230 283M960 30Q790 173 746 255M0 524Q174 428 250 346M960 531Q790 421 733 334" stroke="#ecb5aa" stroke-opacity=".12" stroke-width="38" fill="none"/>';
 },
 acid:function(){
 return '<rect width="960" height="540" fill="#1e151f"/>'+
 '<g class="cine-tissue"><path d="M-35 -20Q120 64 178 240T45 563H-40Z" fill="url(#cinFlesh)" stroke="#cc8a77" stroke-width="13"/>'+
 '<path d="M989 -20Q821 45 780 240T920 563H990Z" fill="url(#cinFlesh)" stroke="#cc8a77" stroke-width="13"/>'+
 '<path d="M15 110Q107 148 137 233M26 297Q115 313 125 407M946 84Q858 144 836 234M941 305Q863 330 852 403" stroke="#edb3a3" stroke-opacity=".3" stroke-width="17" fill="none"/></g>'+
 '<path d="M155 -40Q365 0 505 25T825 -15" stroke="#995453" stroke-width="55" fill="none"/>'+
 '<g class="cine-steam" stroke="#d6efa5" opacity=".5" stroke-width="4" fill="none"><path d="M190 300Q170 256 203 228T204 176M380 305Q358 255 397 232T403 184M737 312Q710 265 742 230T750 171"/></g>'+
 '<g class="cine-acid-pool"><path d="M-60 378Q90 316 253 366T558 358T1010 373V580H-60Z" fill="url(#cinAcid)" stroke="#ddf29e" stroke-width="10"/>'+
 '<path class="cine-acid-wave" d="M-30 411Q142 380 295 417T621 405T1000 404M-10 471Q190 437 405 471T980 454" stroke="#e4ffb8" stroke-opacity=".43" stroke-width="9" fill="none"/></g>'+
 '<g class="cine-acid-ship">'+ship().replace('class="cine-ship"','class="cine-captured-ship"')+'</g>'+
 '<g fill="none" stroke="#e7f3a9" stroke-width="6"><circle class="cine-bubble" cx="231" cy="435" r="19"/><circle class="cine-bubble b2" cx="496" cy="401" r="9"/><circle class="cine-bubble b3" cx="765" cy="463" r="21"/><circle class="cine-bubble b4" cx="648" cy="378" r="12"/></g>'+
 '<path d="M0 0H960" stroke="#f5cfbf" opacity=".12" stroke-width="40"/>';
 },
 search:function(){
 return '<rect width="960" height="540" fill="#160c17"/><path d="M0 100Q350 180 620 50T960 112M0 460Q355 308 565 484T960 428" stroke="#813146" stroke-width="92" fill="none" opacity=".42"/>'+
 '<g class="cine-vein" stroke="#9d3850" stroke-width="44" fill="none" stroke-linecap="round"><path d="M-40 390Q220 370 390 265T620 241"/><path d="M192 385Q294 160 496 88"/><path d="M375 290Q552 434 776 484"/></g>'+
 '<g class="cine-vein v2" stroke="#dc6972" stroke-width="13" fill="none" stroke-linecap="round"><path d="M-40 390Q220 370 390 265T620 241"/><path d="M192 385Q294 160 496 88"/></g>'+
 '<g class="cine-vein v3" stroke="#fcb4a5" stroke-opacity=".46" stroke-width="7" fill="none"><path d="M390 265Q550 430 776 484"/><path d="M620 241Q800 114 987 185"/></g>'+
 '<g class="cine-bigheart">'+heart().replace('class="cine-heart-fight"','class="cine-bigheart-detail"')+'</g>'+
 '<g class="cine-scan"><path d="M0 -50L335 -50L495 590H165Z" fill="#c3f6ee" opacity=".12"/><path d="M302 -50L449 590" stroke="#effff5" stroke-width="6" opacity=".55"/></g>'+
 '<g class="cine-reticle" fill="none" stroke="#c6fff4" stroke-width="4"><circle cx="613" cy="279" r="100" stroke-dasharray="14 14"/><path d="M613 135V179M613 373V422M467 279H510M717 279H755"/></g>'+
 '<g class="cine-reticle" fill="#eaffed"><circle cx="613" cy="279" r="5"/><circle cx="613" cy="279" r="36" fill="none" stroke="#fff2d6" opacity=".37" stroke-width="2"/></g>'+
 '<g class="cine-shadow-figure"><path d="M148 499Q138 440 163 408Q152 366 179 348Q200 338 221 363Q241 390 217 408Q254 437 260 504Z" fill="#090e18" stroke="#c0adac" stroke-opacity=".43" stroke-width="4"/><path d="M222 399L329 296" stroke="#d1c9bb" stroke-width="6"/></g>';
 },
 final:function(){
 return '<rect width="960" height="540" fill="#140b17"/>'+
 '<path d="M0 76Q200 195 417 96T963 145M0 475Q300 322 522 490T960 445" stroke="#8b3450" stroke-width="58" fill="none" opacity=".5"/>'+
 '<ellipse cx="605" cy="274" rx="290" ry="248" fill="url(#cinGlow)" opacity=".27" filter="url(#cinBloom)"/>'+
 heart()+
 '<path class="cine-pulse-line" d="M33 462H155L186 428L218 494L256 412L296 470H384" fill="none" stroke="#f0b6b8" stroke-width="6" opacity=".7"/>'+
 '<g class="cine-harpoon-final">'+spear().replace('class="cine-spear"','class="cine-finishing-spear"')+'</g>'+
 '<g class="cine-crack" fill="none" stroke="#fff7e2" stroke-width="8" stroke-linecap="round"><path d="M607 219L622 268L591 286L619 330L595 358"/><path d="M568 257L530 234L512 263M648 300L685 316L701 347"/></g>'+
 '<g class="cine-break-ring" fill="none" stroke="#fff8e4"><circle cx="613" cy="280" r="76" stroke-width="10"/><circle cx="613" cy="280" r="135" stroke-width="4"/></g>'+
 '<rect class="cine-whiteout" x="0" y="0" width="960" height="540" fill="#faffeb"/>';
 }
};
SCENES.victory=SCENES.final;
function esc(t){return String(t).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]});}
function sceneHtml(name){
 if(!SCENES[name])name='harpoon';
 const isWin=name==='victory';
 const title=NAMES[name],svg='<svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" preserveAspectRatio="xMidYMid slice">'+D+'<g clip-path="url(#cinViewport)" class="cine-'+name+'">'+SCENES[name]()+'</g></svg>';
 return '<div class="pallid-cine-v2'+(isWin?' cine-victory':'')+'" role="img" aria-label="'+esc(title[0]+' · '+title[1])+'">'+svg+
  '<span class="cine-top" aria-hidden="true">창백의 향유고래 · '+esc(title[0])+'</span>'+
  '<span class="cine-bottom" aria-hidden="true">'+esc(title[1])+'</span>'+
  '<span class="cine-grain"></span><span class="cine-corner"></span><span class="cine-vignette"></span></div>';
}
window.PallidCinematicV2={html:sceneHtml,names:NAMES,scenes:Object.keys(SCENES)};
try{
 if(typeof pallidFxMarkup162==='function'){
  pallidFxMarkup162=sceneHtml;
  if(typeof render==='function')render();
 }
}catch(e){console.warn('창백한 고래 시네마틱 연결 지연',e);}
document.dispatchEvent(new Event('pallid-cinematic-ready'));
})();
