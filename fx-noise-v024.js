/* 대호수 · 이펙트용 결(노이즈) 텍스처를 한 번만 구워 두는 도우미
   움직이는 몸(팔 · 날개 · 열수공)에 feTurbulence 필터를 걸면 매 프레임 필터를 다시 계산해 프레임이 무거워진다.
   같은 느낌의 결을 캔버스에 한 번 그려 이미지로 만들어 두고, 장면은 <pattern>으로 채워 쓴다(필터 없음).
   FxNoise.url(key,{size,cell,oct,rgb:[r,g,b],lo,hi,stretch:[sx,sy]}) → data:image/png (동기, 캐시)
   FxNoise.pattern(id,key,opt,w,h) → '<pattern …><image …/></pattern>' */
(function(){
'use strict';
const cache={};
function rnd(seed){let x=seed>>>0||1;return ()=>((x=(x*1664525+1013904223)>>>0)/4294967296);}
function url(key,o){
 if(cache[key])return cache[key];
 const opt=o||{},S=opt.size||256,oct=opt.oct||3,rgb=opt.rgb||[0,0,0],lo=opt.lo==null?.45:opt.lo,hi=opt.hi==null?.85:opt.hi,st=opt.stretch||[1,1];
 let data='';
 try{
  const c=document.createElement('canvas');c.width=S;c.height=S;const x=c.getContext('2d');
  const acc=new Float32Array(S*S);let amp=1,tot=0;const r=rnd(opt.seed||7);
  for(let k=0;k<oct;k++){
   const cell=Math.max(2,(opt.cell||48)/Math.pow(2,k)),nx=Math.ceil(S/cell/st[0])+1,ny=Math.ceil(S/cell/st[1])+1;
   const g=new Float32Array(nx*ny);for(let i=0;i<g.length;i++)g[i]=r();
   // 이어지는(타일) 값 노이즈: 가장자리 격자를 맞춤
   const W2=nx-1,H2=ny-1;
   for(let py=0;py<S;py++){const fy=py/S*H2,iy=Math.floor(fy),ty=fy-iy,sy=ty*ty*(3-2*ty);
    for(let px=0;px<S;px++){const fx=px/S*W2,ix=Math.floor(fx),tx=fx-ix,sx=tx*tx*(3-2*tx);
     const i0=(iy%H2)*nx,i1=((iy+1)%H2)*nx,a=g[i0+ix%W2],b=g[i0+(ix+1)%W2],c2=g[i1+ix%W2],d=g[i1+(ix+1)%W2];
     acc[py*S+px]+=amp*((a+(b-a)*sx)+((c2+(d-c2)*sx)-(a+(b-a)*sx))*sy);}}
   tot+=amp;amp*=.5;
  }
  const img=x.createImageData(S,S);
  for(let i=0;i<S*S;i++){const v=acc[i]/tot,al=Math.max(0,Math.min(1,(v-lo)/(hi-lo)));img.data[i*4]=rgb[0];img.data[i*4+1]=rgb[1];img.data[i*4+2]=rgb[2];img.data[i*4+3]=Math.round(al*255);}
  x.putImageData(img,0,0);data=c.toDataURL('image/png');
 }catch(e){data='';}
 return cache[key]=data;
}
function pattern(id,key,opt,w,h){
 const u=url(key,opt);if(!u)return '';
 const W=w||256,H=h||256;
 return '<pattern id="'+id+'" patternUnits="userSpaceOnUse" width="'+W+'" height="'+H+'"><image href="'+u+'" width="'+W+'" height="'+H+'" preserveAspectRatio="none"/></pattern>';
}
window.FxNoise={url,pattern};
})();
