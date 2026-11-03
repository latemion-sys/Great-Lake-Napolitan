/* 신(心) · E.G.O · 뒤틀림 셰이더 연출 (v0.3.2)
   화면 전체를 WebGL2 프래그먼트 셰이더로 그리고(fbm · 도메인 워핑 · 보로노이 · SDF), 입자는 GPU 점 메시로 띄운다.
   모든 그림은 시간 t(초)에 대한 식이라 같은 t면 같은 장면이 나온다.
   HeartGL.create(canvas, kind, opt) → {render(t), resize(), destroy()} / kind: 'bloom' | 'twist' | 'shin'
   WebGL2가 없으면 null을 돌려주고, 호출하는 쪽은 기존(선 · 도형) 연출로 돌아간다. */
(function(){
'use strict';
const COMMON=`#version 300 es
precision highp float;
uniform vec2 uRes;uniform float uT;uniform float uA;uniform float uB;uniform float uC;uniform float uD;uniform sampler2D uTex;
out vec4 o;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec2 hash2(vec2 p){float n=hash(p);return vec2(n,hash(p+n*17.13+3.1));}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}
float fbm3(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<3;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}
vec3 voronoi(vec2 x){vec2 n=floor(x),f=fract(x),mg=vec2(0),mr=vec2(0);float md=8.;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(i,j),r=g+hash2(n+g)-f;float d=dot(r,r);if(d<md){md=d;mr=r;mg=g;}}
 md=8.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 g=mg+vec2(i,j),r=g+hash2(n+g)-f;if(dot(mr-r,mr-r)>1e-5)md=min(md,dot(.5*(mr+r),normalize(r-mr)));}
 return vec3(length(mr),md,hash(n+mg));}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float sdCap(vec2 p,vec2 a,vec2 b,float r){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
float sdTrap(vec2 p,float r1,float r2,float he){vec2 k1=vec2(r2,he),k2=vec2(r2-r1,2.*he);p.x=abs(p.x);
 vec2 ca=vec2(p.x-min(p.x,(p.y<0.)?r1:r2),abs(p.y)-he);vec2 cb=p-k1+k2*clamp(dot(k1-p,k2)/dot(k2,k2),0.,1.);
 float s=(cb.x<0.&&ca.y<0.)?-1.:1.;return s*sqrt(min(dot(ca,ca),dot(cb,cb)));}
// 선장: 외투를 입고 정면으로 선 사람(머리 · 어깨 · 외투 · 팔 · 다리). 키 약 0.56, 발이 y=-0.28
float sdFigure(vec2 p){
 float head=length(p-vec2(0.,.215))-.046;
 float neck=sdCap(p,vec2(0.,.17),vec2(0.,.15),.02);
 float coat=sdTrap(p-vec2(0.,.035),.085,.072,.105);
 float sh=sdCap(p,vec2(-.07,.128),vec2(.07,.128),.022);
 float aL=sdCap(p,vec2(-.082,.118),vec2(-.104,-.045),.021),aR=sdCap(p,vec2(.082,.118),vec2(.104,-.045),.021);
 float hL=length(p-vec2(-.106,-.06))-.018,hR=length(p-vec2(.106,-.06))-.018;
 float lL=sdCap(p,vec2(-.032,-.06),vec2(-.036,-.265),.027),lR=sdCap(p,vec2(.032,-.06),vec2(.036,-.265),.027);
 float d=smin(head,neck,.015);d=smin(d,coat,.02);d=smin(d,sh,.025);d=min(d,smin(aL,hL,.01));d=min(d,smin(aR,hR,.01));d=smin(d,min(lL,lR),.02);
 return d;}
vec2 P(){return (gl_FragCoord.xy-.5*uRes)/uRes.y;}
vec3 finish(vec3 c,vec2 p,float grain){
 c*=1.-.55*smoothstep(.45,1.15,length(p*vec2(.8,1.)));
 c+=(hash(gl_FragCoord.xy+fract(uT*7.13)*91.)-.5)*grain;
 return c;}
`;

/* ───────── E.G.O 개화 ─────────
   마음을 감싼 검은 껍질(보로노이 세포로 된 구) → 세포 경계를 따라 균열이 퍼지며 안쪽 빛이 샘 →
   깨지는 순간 세포 조각이 회전하며 흩어지고, 굴절 충격파 · 색수차 · 섬광 →
   노이즈로 일렁이는 가장자리를 가진 극좌표 꽃잎 세 겹이 펼쳐지고, 중심에서 빛줄기(갓레이)가 뻗음 */
const BLOOM=COMMON+`
const float TS=2.15;
vec3 scene(vec2 p,float t){
 vec3 c=vec3(.012,.009,.006);
 float r=length(p),th=atan(p.y,p.x);
 // 바탕: 아주 옅은 금빛 안개(도메인 워핑)
 vec2 w=p*2.2+vec2(fbm(p*1.7+t*.05),fbm(p*1.7-t*.04+4.));
 c+=vec3(.06,.04,.02)*fbm(w*1.3)*smoothstep(1.2,0.,r)*(.4+.6*smoothstep(TS,TS+1.,t));
 float R=.2;
 float s=t-TS;
 // 껍질과 균열
 if(s<0.){
  vec2 q=p*7.;vec3 v=voronoi(q);
  float grow=smoothstep(.75,2.05,t)*R*1.15;
  float reach=step(r+.03*(fbm(q*.6)-.5),grow);
  float crack=(1.-smoothstep(0.,.045+.03*smoothstep(1.4,2.1,t),v.y))*reach;
  float shell=smoothstep(R+.004,R-.004,r);
  vec3 sc=vec3(.05,.035,.022)+vec3(.09,.06,.03)*fbm(q*.9)*shell;
  float rim=smoothstep(R-.03,R,r)*shell;
  sc+=vec3(.35,.24,.12)*rim*.35;
  c=mix(c,sc,shell);
  float pulse=.7+.3*sin(t*9.);
  vec3 glow=vec3(1.,.82,.45)*crack*(1.6+2.*smoothstep(1.6,2.1,t))*pulse*shell;
  c+=glow;
  // 가운데 불씨
  float core=exp(-r*r/(.0006+.004*smoothstep(.2,2.1,t)));
  c+=vec3(1.,.9,.65)*core*(.6+.8*smoothstep(.3,2.1,t));
  c+=vec3(1.,.7,.35)*exp(-max(r-R,0.)*14.)*.08*smoothstep(1.,2.1,t)*shell;
 }else{
  // 깨진 조각: 세포마다 조금씩 다른 빠르기로 밖으로 날아가며 돈다(되짚기로 원래 자리를 찾음)
  float m0=s*.55*(1.-exp(-s*2.2))+s*.06;
  vec2 dir=normalize(p+1e-4);
  vec2 q0=(p-dir*m0)*7.;vec3 v0=voronoi(q0);
  float m=m0*(.75+.5*v0.z);
  vec2 q1=(p-dir*m);float rq=length(q1);
  vec3 v1=voronoi(q1*7.);
  float inside=smoothstep(R,R-.004,rq)*step(.06+.02*v1.z,rq);
  float edge=smoothstep(.0,.03,v1.y);
  float fade=1.-smoothstep(.4,1.5,s);
  float tumble=.55+.45*sin(s*(6.+8.*v1.z)+v1.z*6.28);
  vec3 sh=(vec3(.06,.045,.03)+vec3(.5,.36,.2)*tumble*.35)*edge;
  sh+=vec3(1.,.75,.4)*(1.-edge)*.9;
  c=mix(c,sh,inside*fade);
  // 꽃잎 세 겹(극좌표 SDF, 가장자리 노이즈)
  float spin=s*.28;
  for(int L=0;L<3;L++){
   float fl=float(L);
   float n=fl<1.5?10.:6.;float off=fl==1.?3.14159/10.:0.;
   float k=smoothstep(.1+fl*.18,1.25+fl*.2,s);k=k+.18*sin(k*3.14159)*(1.-k);
   float Lmax=(.36-fl*.09)*k;
   float a=mod(th+spin*(fl==1.?-1.:1.)+off,6.28318/n)-3.14159/n;
   float prof=pow(max(cos(a*n*.5),0.),.55+fl*.25);
   float edgeN=1.+.07*(fbm(vec2(th*4.+fl*7.,s*.6))-.5);
   float pr=Lmax*prof*edgeN;
   float pd=r-pr;
   float body=smoothstep(.006,-.006,pd)*step(.012,r);
   float vein=.5+.5*cos(a*n*6.);
   float grad=smoothstep(0.,max(pr,1e-3),r);
   vec3 pc=mix(vec3(1.,.98,.9),mix(vec3(1.,.84,.5),vec3(.9,.5,.2),grad),grad);
   pc*=.85+.15*vein*grad;
   pc*=1.-.25*fl;
   c=mix(c,pc,body*(.92-fl*.1));
   c+=vec3(1.,.8,.45)*exp(-max(pd,0.)*55.)*.18*k;
  }
  // 빛줄기(갓레이)
  float ray=pow(fbm(vec2(th*5.,r*1.6-s*.5)),3.)*3.;
  c+=vec3(1.,.82,.5)*ray*smoothstep(.05,.2,r)*exp(-r*1.4)*smoothstep(0.,.6,s)*.9;
  // 섬광
  c+=vec3(1.,.95,.85)*exp(-s*6.)*exp(-r*r*9.)*1.1;
  c+=vec3(1.,.9,.7)*exp(-r*r/.003)*(1.2+.3*sin(t*6.));
 }
 return c;
}
void main(){
 vec2 p=P();float t=uT;
 // 충격파: 링 모양으로 굴절 + 색수차
 float s=t-TS;vec3 col;
 if(s>0.&&s<1.6){
  float rr=s*1.1,r=length(p),band=exp(-pow((r-rr)*18.,2.))*(1.-s/1.6);
  vec2 d=normalize(p+1e-4)*band*.035;
  col=vec3(scene(p-d*1.3,t).r,scene(p-d,t).g,scene(p-d*.7,t).b);
  col+=vec3(1.,.85,.6)*band*.25;
 }else col=scene(p,t);
 // E.G.O 글자: 금 간 틈으로 빛이 새듯 노이즈 경계를 따라 타오르며 드러나고, 처음엔 색이 갈라졌다 맞춰지며, 빛이 한 번 훑고 지나감
 float ta=3.55;
 if(t>ta-.1){
  float aw=min(.8,uRes.x/uRes.y*.94),ah=aw*.25;vec2 tc=vec2(0.,-.39);
  vec2 tu=(p-tc)/vec2(aw,ah)+.5;
  if(tu.x>0.&&tu.x<1.&&tu.y>0.&&tu.y<1.){
   vec2 uvT=vec2(tu.x,1.-tu.y);
   float g=t-ta,split=.012*exp(-g*3.)*(1.+.6*sin(g*40.));
   float jit=step(.86,hash(vec2(floor(uvT.y*18.),floor(t*16.))))*exp(-g*2.5)*.02;
   float aR=texture(uTex,uvT+vec2(split+jit,0.)).r,aG=texture(uTex,uvT+vec2(jit*.5,0.)).r,aB=texture(uTex,uvT-vec2(split-jit,0.)).r;
   float n=fbm(uvT*vec2(14.,4.)+3.1)*.75+fbm(uvT*vec2(40.,12.))*.25;
   float th=smoothstep(.05,1.9,g)*1.18;
   float shown=smoothstep(n-.04,n+.04,th),burn=smoothstep(n-.12,n,th)*(1.-smoothstep(n,n+.06,th));
   float sh=0.;for(int i=0;i<6;i++){float an=float(i)*1.047;sh+=texture(uTex,uvT+vec2(cos(an),sin(an)*4.)*.012).r;}sh/=6.;
   col*=1.-.7*sh*smoothstep(0.,.8,g);   // 글자 뒤를 어둡게 눌러 읽히게
   vec3 txt=vec3(aR,aG,aB)*shown;
   vec3 base=mix(vec3(1.,.86,.55),vec3(1.,.97,.9),txt.g);
   float sweep=exp(-pow((uvT.x-(g-1.)*.8)*6.,2.))*smoothstep(.9,1.4,g)*(1.-smoothstep(2.6,3.,g));
   col+=txt*base*(1.+sweep*1.6);
   float aW=texture(uTex,uvT+vec2(0.,.0)).r+texture(uTex,uvT+vec2(.006,0.)).r+texture(uTex,uvT-vec2(.006,0.)).r;
   col+=vec3(1.,.5,.15)*burn*min(1.,aW)*3.;
   col+=vec3(1.,.62,.25)*burn*sh*1.2;
   col+=vec3(1.,.8,.45)*aG*shown*.25*exp(-g*.6);
  }
 }
 col=1.-exp(-col*1.25);
 o=vec4(finish(col,p,.035),1.);
}`;

/* ───────── 뒤틀림 ─────────
   따스한 금빛 윤곽 → 형체에 도메인 워핑이 점점 세게 걸려 녹아내리듯 비틀리고 가시 · 덩굴이 돋음 →
   아래에서 검붉은 먹물 덩어리가 차오르고 심장 박동처럼 붉게 맥동 → 줄 단위로 화면이 어긋나는 글리치 · RGB 분리 · 주사선 →
   이름이 새겨질 때 화면 유리에 보로노이 균열(조각마다 굴절이 어긋남). uA=비틀림 시작(초), uB=균열 시작(초) */
const TWIST=COMMON+`
float K(float t){return smoothstep(uA,uA+2.6,t);}
vec3 scene(vec2 p,float t){
 float k=K(t);
 float hb=pow(max(0.,sin(t*5.4)),12.)+.6*pow(max(0.,sin(t*5.4-.9)),12.);
 vec3 c=mix(vec3(.01,.008,.006),vec3(.09,0.,.012)+vec3(.12,0.,.02)*hb*k,k);
 c+=vec3(.25,0.,.03)*k*smoothstep(1.1,.2,length(p))*(.4+.6*fbm(p*2.+t*.1));
 // 먹물: 아래에서 차오름
 float ink=fbm(vec2(p.x*3.2,p.y*1.6-t*.35))*.9+fbm(p*7.+t*.2)*.25;
 float lvl=-.62+k*(.55+.12*sin(t*.7))+ink*.35;
 float im=smoothstep(lvl+.02,lvl-.02,p.y);
 vec3 ic=vec3(.02,0.,.004)+vec3(.35,0.,.05)*smoothstep(lvl-.06,lvl,p.y);
 c=mix(c,ic,im*k);
 // 형체: 갈수록 세게 비틀림
 vec2 q=p-vec2(0.,-.02);
 vec2 wv=vec2(fbm(q*5.+vec2(t*.6,0.)),fbm(q*5.+vec2(3.3,-t*.5)))-.5;
 q+=wv*k*.12;
 q.y/=1.+.38*k;q.x*=1.+.1*k*sin(q.y*18.+t*3.);
 q.x+=sin(q.y*9.+t*2.)*.02*k;
 float d=sdFigure(q);
 float ang=atan(q.y,q.x);
 d-=k*.05*pow(max(0.,sin(ang*11.+fbm(q*4.+t*.3)*6.)),6.);
 d-=k*.03*fbm(q*14.+t*.8);
 float body=smoothstep(.003,-.003,d);
 vec3 warm=vec3(1.,.82,.55);
 vec3 rimC=mix(warm,vec3(1.,.08,.12),k);
 c=mix(c,mix(vec3(.02,.015,.012),vec3(.05,0.,.006),k),body);
 c+=rimC*exp(-abs(d)*(70.-30.*k))*(.55+.45*k)*(1.+hb*k);
 float veins=1.-smoothstep(0.,.06,abs(fbm(q*9.-t*.4)-.5));
 c+=vec3(.6,0.,.06)*veins*body*k*.8;
 return c;
}
void main(){
 vec2 p=P();float t=uT,k=K(t);
 vec2 uv=p;
 // 화면 유리 균열(조각마다 굴절이 어긋남)
 float cs=t-uB,crack=0.;
 if(cs>0.){
  vec2 ip=vec2(.22,.17);vec2 cq=(p-ip);float cr=length(cq);
  vec3 v=voronoi(cq*vec2(9.,11.)+vec2(3.1,1.7));
  float rad=min(cs*1.5,.4);
  float reach=smoothstep(rad+.04,rad-.04,cr+.06*v.z)*(1.-smoothstep(.18,.42,cr)*.85);
  crack=(1.-smoothstep(0.,.025,v.y))*reach*smoothstep(.42,.05,cr);
  uv+=(hash2(vec2(v.z*91.,v.z*37.))-.5)*.012*reach;
  float ang=atan(cq.y,cq.x);
  crack=max(crack,(1.-smoothstep(0.,.006,abs(sin(ang*7.+v.z))*cr))*reach*smoothstep(.5,0.,cr));
 }
 // 글리치: 줄 단위로 어긋남
 float row=floor(gl_FragCoord.y/(uRes.y/90.));
 float g=hash(vec2(row,floor(t*14.)));
 float gl=step(1.-(.06+.22*k)*k,g);
 uv.x+=gl*(hash(vec2(row*1.7,floor(t*14.)))-.5)*.12*k;
 float ca=(.004+.012*gl)*k;
 vec3 col=vec3(scene(uv+vec2(ca,0.),t).r,scene(uv,t).g,scene(uv-vec2(ca,0.),t).b);
 col+=vec3(.9,.85,.85)*crack*.85;
 // 주사선 · 잡음
 col*=1.-k*.18*(.5+.5*sin(gl_FragCoord.y*3.14159*.66));
 col+=vec3(.5,0.,.05)*gl*k*.12;
 col=1.-exp(-col*1.4);
 o=vec4(finish(col,p,.05+.1*k),1.);
}`;

/* ───────── 신(心) 발현 ─────────
   어둠 속 가슴의 불씨 → 고동 두 번(굴절 충격파) → 형체 윤곽을 따라 위로 타오르는 금빛 불꽃(도메인 워핑 fbm) ·
   열기 아지랑이 · 발밑 빛기둥 · 등 뒤 心(글자 텍스처의 가장자리가 타오름). uA=고동 시각, uB=불붙는 시각 */
const SHIN=COMMON+`
vec3 scene(vec2 p,float t){
 float k=smoothstep(uB,uB+1.5,t);
 vec3 c=vec3(.016,.011,.006)+vec3(.05,.03,.01)*fbm(p*1.6+t*.03)*(.3+.7*k);
 vec2 fp=p-vec2(0.,.05);
 // 등 뒤 心: 글자 텍스처의 가장자리가 불타듯 일렁임
 vec2 gu=(p-vec2(0.,.27))/vec2(.62,.62)+.5;gu.y=1.-gu.y;
 float gk=smoothstep(uB+.2,uB+2.2,t);
 if(gu.x>0.&&gu.x<1.&&gu.y>0.&&gu.y<1.){
  float n=fbm(p*9.+vec2(0.,-t*1.2));
  float a=texture(uTex,gu+vec2(n-.5)*.012*gk).r;
  float edge=smoothstep(.3,.55,a)*(1.-smoothstep(.55,.85,a))*4.;
  c+=vec3(1.,.72,.3)*(a*.3+edge*.14*(.6+.4*n))*gk;
 }
 // 발밑 빛기둥
 float pil=exp(-pow(p.x/(.07+.03*fbm(vec2(p.y*3.,t))),2.))*smoothstep(-.25,.6,p.y)*(1.-smoothstep(.3,.8,p.y));
 c+=vec3(1.,.72,.32)*pil*.35*k*(.8+.2*sin(t*3.));
 float d=sdFigure(fp);
 // 금빛 기운: 윤곽에서 위로 솟는 불꽃
 vec2 w=vec2(fbm(vec2(fp.x*5.,fp.y*3.-t*1.9)),fbm(vec2(fp.x*5.+5.2,fp.y*3.-t*2.3)));
 float n1=fbm(vec2(fp.x*6.,fp.y*3.5-t*2.4)+w*1.4),n2=fbm3(vec2(fp.x*14.,fp.y*9.-t*4.));
 float up=max(0.,fp.y+.12);
 float fd=d-k*(.03+.11*n1+.04*n2+.22*up*n1*n1);
 float flame=smoothstep(.01,-.03,fd)*(1.-smoothstep(-.01,.01,d)*0.);
 float heat=smoothstep(-.01,-.09,fd);
 vec3 fc=mix(vec3(.9,.28,.04),vec3(1.,.72,.25),heat);fc=mix(fc,vec3(1.,.96,.82),smoothstep(-.06,-.16,fd));
 float body=smoothstep(.002,-.002,d);
 c+=fc*flame*k*1.25*(1.-body);
 c+=vec3(1.,.6,.2)*exp(-max(fd,0.)*30.)*.25*k*(1.-body);
 // 형체: 검게, 테두리에 금빛(안쪽은 아주 옅게 달아오름)
 c=mix(c,vec3(.03,.02,.012)+vec3(.12,.06,.02)*k*fbm(fp*12.-vec2(0.,t)),body);
 c+=vec3(1.,.8,.45)*(d>0.?exp(-d*90.):.55*exp(d*240.))*(.15+.9*k);
 // 가슴의 불씨(고동)
 vec2 cp=p-vec2(0.,.17);float cr=length(cp);
 float beat=0.;for(int i=0;i<2;i++){float bt=t-(uA+float(i)*.42);beat+=bt>0.?exp(-bt*5.)*1.2:0.;}
 float ember=(.25+.15*sin(t*3.2))+beat+.7*k;
 c+=vec3(1.,.82,.5)*exp(-cr*cr/(.0007+.0012*min(ember,2.)))*ember*1.4;
 c+=vec3(1.,.6,.25)*exp(-cr*9.)*.12*ember;
 return c;
}
void main(){
 vec2 p=P();float t=uT,k=smoothstep(uB,uB+1.5,t);
 vec2 uv=p;
 // 고동: 굴절 충격파
 for(int i=0;i<2;i++){float bt=t-(uA+float(i)*.42);if(bt>0.&&bt<1.4){vec2 cp=p-vec2(0.,.17);float rr=bt*.8,r=length(cp);
  float band=exp(-pow((r-rr)*20.,2.))*(1.-bt/1.4);uv-=normalize(cp+1e-4)*band*.02;}}
 // 열기 아지랑이
 uv+=(vec2(noise(p*14.+vec2(0.,-t*3.)),noise(p*14.+vec2(7.,-t*3.)))-.5)*.006*k*smoothstep(.6,0.,abs(p.x));
 vec3 col=scene(uv,t);
 col=1.-exp(-col*1.3);
 o=vec4(finish(col,p,.03),1.);
}`;


/* ───────── 목소리(정신력 0): 감은 눈꺼풀 너머로 스며드는 아침 햇살 ─────────
   위쪽 한편 화면 밖에서 비스듬히 내려오는 햇살 줄기(노이즈 결 · 천천히 흔들림) · 숨 쉬듯 밝아졌다 어두워지는 바탕 ·
   빛 근원의 부드러운 번짐과 렌즈에 맺힌 빛망울 · 메아리가 늘 때마다 차오르는 햇살(uC)과 가운데서 번지는 빛 물결(uD=물결 시작 시각) ·
   반박 화면에서는 햇살이 기울며 식고(uB), 물러남에서는 멀어지며 어두워짐(uA) */
const VOICE=COMMON+`
vec2 SRC_(){float asp=uRes.x/uRes.y;return vec2(-.5*asp-.12,.66)+vec2(-.35,.22)*uA+vec2(.08,.05)*uB;}
void main(){
 vec2 p=P();float t=uT,asp=uRes.x/uRes.y;
 vec2 L=SRC_();
 float sw=.5+.8*uC,br=.88+.12*sin(t*.55)+.04*sin(t*1.7);
 vec3 warm=mix(vec3(1.,.72,.36),vec3(.95,.84,.66),uB);
 vec3 c=vec3(.034,.02,.009)+vec3(.04,.024,.009)*fbm(p*1.3+vec2(t*.02,0.));
 // 햇살 줄기
 vec2 d=p-L;float dist=length(d),ang=atan(d.y,d.x);
 float a0=-.62-.1*uB+.04*sin(t*.12);
 float cone=smoothstep(.62,.0,abs(ang-a0));
 float streak=.35+.65*pow(fbm(vec2(ang*16.+t*.03,t*.05)),2.2);
 streak*=.75+.25*fbm(vec2(ang*40.,dist*2.-t*.12));
 float fall=exp(-dist*.62);
 float rays=cone*streak*fall;
 c+=warm*rays*.55*sw*br*(1.-.65*uA);
 // 빛 근원의 번짐 · 빛망울
 c+=warm*exp(-dist*2.4)*.55*sw*(1.-.6*uA);
 vec2 C=vec2(0.,.0);
 for(int i=0;i<3;i++){float k=.55+float(i)*.42;vec2 g=L+(C-L)*k*1.25;float r=.035+.03*float(i);
  float disc=smoothstep(r,r*.6,length(p-g));c+=warm*disc*.035*sw*(1.-uA);}
 // 빛 물결(메아리가 늘 때)
 float rt=t-uD;
 if(uD>0.&&rt>0.&&rt<1.6){float rr=rt*.7,band=exp(-pow((length(p-vec2(0.,.05))-rr)*14.,2.))*(1.-rt/1.6);c+=warm*band*.18;}
 // 따뜻한 공기(아주 옅은 안개)
 c+=warm*.05*smoothstep(.45,.85,fbm(p*2.+vec2(t*.03,-t*.02)))*cone*sw;
 c=1.-exp(-c*1.6);
 o=vec4(finish(c,p,.025),1.);
}`;
/* ───────── 망(望) 수련 (사람 없이 망만) ─────────
   어둠 한가운데 신의 기운이 일렁임(위로 혀를 날름거리는 금빛 기운 덩어리, 도메인 워핑 fbm) →
   기운이 소용돌이치며 한 점으로 감겨 들고 금빛이 달빛 색으로 식음 → 작은 보름달이 맺힘 →
   달의 가운데가 비워져 고리가 되고, 눕듯 기울며 먼저 익힌 고리들을 지나 제 궤도로.
   고리 자체는 아래의 리본 메시가 그리고, 이 화면 셰이더는 기운 · 보름달 · 고리의 넓은 번짐만 그린다.
   uA: 첫 고동 · uB: 기운이 타오르는 시각 · uC: 압축 시작 · uD: 이번에 맺힌 고리까지의 망 개수(1~5) */
const RINGF=`
float ease(float x){x=clamp(x,0.,1.);return x*x*(3.-2.*x);}
float ringS(){float asp=uRes.x/uRes.y;return min(1.,(asp*.5-.03)/.4);}
float ringNi(){return max(1.,uD)-1.;}
vec2 ringC(){return vec2(0.,.06);}
float ringE(float i,float t){return i<ringNi()-.5?1.:ease((t-uC-1.6)/.85);}
float ringR(float i,float t){float b=(.15+i*.05)*ringS();return mix(.058*ringS(),b,ringE(i,t));}
float ringTilt(float i,float t){return mix(1.,.33+.01*i,ringE(i,t));}
float ringRoll(float i,float t){return .035+.014*sin(i*1.9)+.01*sin(t*.45+i*1.3);}
vec2 ringCi(float i,float t){return mix(ringC(),ringC()-vec2(0.,i*.022*ringS()),ringE(i,t));}
vec3 ringPt(float i,float a,float t){float R=ringR(i,t),ti=ringTilt(i,t),ro=ringRoll(i,t)*ringE(i,t);vec2 e=vec2(cos(a)*R,sin(a)*R*ti);
 vec2 q=mat2(cos(ro),sin(ro),-sin(ro),cos(ro))*e;return vec3(ringCi(i,t)+q,-sin(a)*(1.-ti));}
float ringLife(float i,float t){float ni=ringNi();
 if(i<ni-.5)return smoothstep(0.,1.,t)*(.6+.2*smoothstep(uB,uB+1.5,t))*(1.+.7*exp(-pow((t-uC-1.95-i*.1)/.2,2.)));
 return smoothstep(uC+1.38,uC+1.62,t)*(1.+.8*exp(-pow((t-uC-2.4)/.22,2.)));}
`;
const MANG=COMMON+RINGF+`
// 신의 기운: 한가운데 떠서 위로 혀를 날름거리는 금빛 기운(도메인 워핑 fbm 불길 · 밑동은 둥글고 끝은 갈라져 흩어짐)
vec3 energy(vec2 p,float t,float k){
 vec2 c=p-ringC();
 vec2 u=c/.19;u.y+=.25;
 vec2 w=vec2(fbm(vec2(u.x*1.4,u.y*1.1-t*1.3)),fbm(vec2(u.x*1.4+5.2,u.y*1.1-t*1.6)));
 float n=fbm(vec2(u.x*2.4,u.y*1.7-t*2.3)+w*1.6),n2=fbm3(vec2(u.x*5.,u.y*3.6-t*3.8)+w);
 float up=clamp(u.y,0.,1.6);
 float shape=1.-length(vec2(u.x*(1.5+up*.9),(u.y-.3)*(u.y<.3?1.5:.62)));
 float f=(shape+(n-.5)*1.25*(.35+up*.8)+(n2-.5)*.35)*k;
 float flame=smoothstep(.0,.42,f);
 vec3 fc=mix(vec3(.82,.24,.04),vec3(1.,.68,.24),smoothstep(.15,.5,f));
 fc=mix(fc,vec3(1.,.94,.78),smoothstep(.45,.85,f));
 float halo=exp(-dot(c,c)/.035)*(.6+.4*n);
 return fc*flame*1.15+vec3(1.,.55,.2)*halo*.1*k;
}
vec3 scene(vec2 p,float t){
 float k=smoothstep(uB,uB+1.5,t),q=smoothstep(uC,uC+1.4,t),ni=ringNi();
 vec3 c=vec3(.014,.012,.01)+vec3(.04,.03,.02)*fbm(p*1.6+t*.03)*(.3+.7*k);
 vec2 cq=p-ringC();float r=length(cq);
 // 압축: 기운의 장을 가운데로 감아 돌리며 줄여서 표본(안쪽일수록 더 빨리 돎)
 float ang=q*q*(1.4+.2/(r+.05)),sc=1.+q*q*5.5;
 vec2 wp=ringC()+mat2(cos(ang),sin(ang),-sin(ang),cos(ang))*cq*sc;
 vec3 au=energy(wp,t,k*(1.-smoothstep(uC+1.,uC+1.45,t)))*(1.+q*1.4);
 au=mix(au,vec3(dot(au,vec3(.4,.4,.2)))*vec3(1.,.93,.82),q*.8);
 c+=au*1.2;
 // 가운데 불씨(고동 · 압축될수록 모여 밝아짐)
 float beat=0.;for(int i=0;i<2;i++){float bt=t-(uA+float(i)*.42);beat+=bt>0.?exp(-bt*5.)*1.2:0.;}
 float ember=(.25+.15*sin(t*3.2))+beat+.6*k*(1.-.4*q)+.9*q*(1.-smoothstep(uC+1.,uC+1.4,t));
 c+=mix(vec3(1.,.82,.5),vec3(1.,.93,.8),q)*exp(-r*r/(.0007+.0012*min(ember,2.)))*ember*1.3;
 // 작은 보름달: 맺힌 뒤 가운데가 비워지며 고리가 된다
 float DR=.058*ringS(),on=smoothstep(uC+.85,uC+1.35,t),hol=ease((t-uC-1.35)/.4);
 if(on>0.&&hol<1.){
  float ri=DR*hol;
  float m=smoothstep(DR+.008,DR-.004,r)*smoothstep(ri-.004,ri+.01,r)*(1.-hol*.55);
  float lm=.72+.28*fbm(cq*60.+7.)-.16*smoothstep(.42,.68,fbm(cq*26.+2.));
  float limb=.85+.15*smoothstep(DR*.4,DR,r);
  c+=vec3(1.,.95,.85)*m*lm*limb*.85*on;
  c+=vec3(1.,.86,.62)*exp(-r*r/(DR*DR*5.))*.3*on*(1.-hol*.6);
 }
 // 고리의 넓은 번짐과 고리 안쪽의 옅은 빛(빛 띠 자체는 메시가 그림)
 for(int i=0;i<5;i++){float fi=float(i);if(fi>ni+.5)break;
  float L=ringLife(fi,t);if(L<=0.)continue;
  float ro=ringRoll(fi,t)*ringE(fi,t),ti=ringTilt(fi,t),R=ringR(fi,t);
  vec2 lq=mat2(cos(ro),-sin(ro),sin(ro),cos(ro))*(p-ringCi(fi,t));
  float e=(length(vec2(lq.x,lq.y/ti))-R)*mix(ti,1.,.5);
  float back=mix(1.,.7,smoothstep(0.,.015,lq.y)*smoothstep(1.,.8,ti));
  c+=vec3(1.,.84,.62)*(exp(-abs(e)/.024)*.16+smoothstep(.0,-.03,e)*.03)*L*back;
 }
 return c;
}
void main(){
 vec2 p=P();float t=uT,k=smoothstep(uB,uB+1.5,t),q=smoothstep(uC,uC+1.4,t);
 vec2 uv=p;
 for(int i=0;i<2;i++){float bt=t-(uA+float(i)*.42);if(bt>0.&&bt<1.4){vec2 cp=p-ringC();float rr=bt*.8,r=length(cp);
  float band=exp(-pow((r-rr)*20.,2.))*(1.-bt/1.4);uv-=normalize(cp+1e-4)*band*.02;}}
 // 고리가 맺히는 순간 가운데서 퍼지는 한 번의 굴절 물결
 float lt=t-uC-1.4;if(lt>0.&&lt<1.2){vec2 cp=p-ringC();float rr=lt*.6,r=length(cp);uv-=normalize(cp+1e-4)*exp(-pow((r-rr)*18.,2.))*(1.-lt/1.2)*.012;}
 uv+=(vec2(noise(p*14.+vec2(0.,-t*3.)),noise(p*14.+vec2(7.,-t*3.)))-.5)*.006*k*(1.-q)*smoothstep(.4,0.,length(p-ringC()));
 vec3 col=scene(uv,t);
 col=1.-exp(-col*1.3);
 col=finish(col,p,.03);
 // 망이 늘수록 맺히는 순간 화면 가장자리가 조금 더 조여듦(정신의 부담)
 float st=(.05+.035*ringNi())*exp(-pow((t-uC-2.)/.7,2.));
 col*=1.-st*smoothstep(.25,.95,length(p*vec2(.75,1.)));
 o=vec4(col,1.);
}`;
/* 망 고리 리본 메시: 고리마다 둘레를 192칸으로 나눈 띠(삼각형 줄). 단면을 가로질러 빛의 세기가 부드럽게 솟고,
   둘레를 따라 빛이 흘러가며, 뒤쪽 절반은 조금 어둡다. */
const RSEG=192;
const RV=`#version 300 es
precision highp float;
in vec3 aR;uniform vec2 uRes;uniform float uT;uniform float uA;uniform float uB;uniform float uC;uniform float uD;
out float vS;out float vU;out float vZ;out float vL;out float vI;
${RINGF}
void main(){
 float i=aR.x,u=aR.y,s=aR.z;
 if(i>ringNi()+.5){gl_Position=vec4(3.,3.,0.,1.);return;}
 float a=u*6.2831853;
 const float dA=.01;
 vec3 P0=ringPt(i,a,uT),Pm=ringPt(i,a-dA,uT),P1=ringPt(i,a+dA,uT);
 vec2 d1=(P1.xy-Pm.xy)/(2.*dA),d2=(P1.xy-2.*P0.xy+Pm.xy)/(dA*dA);
 vec2 tg=normalize(d1+1e-7),nm=vec2(-tg.y,tg.x);
 float Rc=pow(length(d1),3.)/max(abs(d1.x*d2.y-d1.y*d2.x),1e-6);   // 굽은 반지름: 안쪽으로는 이보다 넓히지 않아 띠가 접히지 않게
 float hw=(.0085+.0015*sin(a*3.+uT*.8+i*1.3))*mix(1.25,1.,ringE(i,uT));
 float off=s>0.?min(hw*2.4,Rc*.92):hw*2.8;
 vec2 pos=P0.xy+nm*sign(s)*off;
 vS=sign(s)*off/hw;vU=u;vZ=P0.z;vL=ringLife(i,uT);vI=i;
 gl_Position=vec4(pos.x*2.*uRes.y/uRes.x,pos.y*2.,0.,1.);
}`;
const RF=`#version 300 es
precision highp float;
uniform float uT;
in float vS;in float vU;in float vZ;in float vL;in float vI;out vec4 o;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
void main(){
 float av=abs(vS),core=exp(-vS*vS*1.1),prof=exp(-vS*vS*.35)*(1.-smoothstep(1.9,2.8,av));
 // 둘레를 따라 흐르는 빛(이음매 없도록 u를 원 위의 점으로 바꿔 표본)
 float a=vU*6.2831853;vec2 cu=vec2(cos(a),sin(a));
 float fl=noise(cu*7.+vec2(uT*.9+vI*3.,-uT*.6))*.6+noise(cu*2.6+vec2(-uT*.35,vI*5.))*.4;
 float flow=.3+1.*pow(fl,1.4);
 float fil=exp(-vS*vS*5.)*(.5+.5*noise(cu*15.+vec2(uT*1.7,vI)));
 float front=.62+.38*smoothstep(-.6,.6,vZ);
 vec3 col=(vec3(1.,.97,.9)*(core*.55+fil*.45)+vec3(1.,.8,.55)*prof*.28)*flow*front*vL;
 o=vec4(col,1.);
}`;

/* ───────── 입자(GPU 점 메시): 위치 = f(씨앗, 시간) ───────── */
const PV=`#version 300 es
precision highp float;precision highp int;
in vec4 aS;uniform vec2 uRes;uniform float uT;uniform float uA;uniform float uB;uniform float uC;uniform float uD;uniform int uKind;
${RINGF}
out float vA;out vec3 vC;out float vR;
float h(float n){return fract(sin(n*91.345)*47453.5453);}
void main(){
 vec2 p=vec2(0.);float a=0.,sz=2.;vec3 c=vec3(1.,.85,.55);float id=aS.w;
 if(uKind==0){ // 개화: 깨지는 순간 불꽃 파편 + 흩날리는 빛 꽃잎
  float s=uT-2.15;
  if(id<.42){if(s>0.){float an=aS.x*6.2832,sp=.4+1.1*aS.y,life=.6+.9*aS.z;
    p=vec2(cos(an),sin(an))*sp*(1.-exp(-2.6*s))/2.6+vec2(0.,-.12*s*s);a=1.-s/life;sz=2.+3.*aS.z;c=mix(vec3(1.,.95,.8),vec3(1.,.55,.2),s/life);}}
  else{float life=4.5,ph=fract((uT-2.5)/life+aS.x);if(uT>2.5){float an=aS.y*6.2832;
    p=vec2(cos(an),sin(an))*(.05+.55*ph*(.6+.4*aS.z))+vec2(sin(ph*6.+aS.z*9.)*.03,-.25*ph*ph);
    a=sin(3.1416*ph)*.85;sz=4.+6.*aS.z;c=vec3(1.,.9,.7);}}
 }else if(uKind==1){ // 뒤틀림: 재가 떠오름
  float k=smoothstep(uA,uA+2.6,uT);float ph=fract(uT*.12*(.5+aS.y)+aS.x);
  p=vec2((aS.z*2.-1.)*uRes.x/uRes.y*.5+sin(ph*7.+aS.x*9.)*.02,-.55+ph*1.15);
  a=sin(3.1416*ph)*.75*k;sz=1.5+3.*aS.y;c=vec3(.55,.08,.08);
 }else if(uKind==3){ // 목소리: 햇살 줄기 안에서만 반짝이는 먼지
  float asp=uRes.x/uRes.y;vec2 L=vec2(-.5*asp-.12,.66)+vec2(-.35,.22)*uA+vec2(.08,.05)*uB;
  vec2 q=vec2(fract(aS.x+uT*.006*(aS.z-.5)+sin(uT*.07+aS.y*9.)*.01)*asp-asp*.5,fract(aS.y-uT*.004*(.3+aS.z))*1.1-.55);
  q+=vec2(sin(uT*.3+aS.z*20.),cos(uT*.25+aS.x*20.))*.012;
  vec2 d=q-L;float ang=atan(d.y,d.x),a0=-.62-.1*uB;float cone=smoothstep(.5,.0,abs(ang-a0))*exp(-length(d)*.5);
  p=q;a=cone*(.35+.65*pow(.5+.5*sin(uT*(1.2+2.*aS.w)+aS.x*30.),3.))*(.45+.7*uC)*(1.-.7*uA);sz=1.4+2.6*aS.z*aS.z;c=vec3(1.,.9,.7);
 }else if(uKind==4){ // 망: 오르던 불티가 소용돌이치며 가운데로 감겨 들어 보름달에 스며들고, 맺힌 뒤에는 일부가 새 고리를 따라 돈다
  float k=smoothstep(uB,uB+1.5,uT),q=smoothstep(uC,uC+1.3,uT);float ph=fract(uT*.32*(.6+aS.y)+aS.x);
  vec2 rise=ringC()+vec2((aS.z-.5)*.2+sin(ph*8.+aS.x*20.)*.02,-.1+aS.y*.08+ph*(.32+.2*aS.y));
  float ni=ringNi();
  if(uT<uC+1.45){
   vec2 cc=ringC(),d0=rise-cc;float an=atan(d0.y,d0.x)+q*q*3.2*(aS.y>.5?1.:-1.),rr=mix(length(d0),.008+.03*aS.y,q*q);
   p=mix(rise,cc+vec2(cos(an),sin(an))*rr,smoothstep(0.,.6,q));
   a=(sin(3.1416*ph)*(1.-q)+q*1.1)*k*(.6+.4*sin(uT*14.+aS.x*30.))*(1.-smoothstep(uC+1.1,uC+1.45,uT));
   sz=2.+3.*aS.y*aS.y;c=mix(mix(vec3(1.,.9,.6),vec3(1.,.55,.15),aS.x),vec3(1.,.93,.8),q);
  }else if(aS.z<.4){
   float an=aS.x*6.2832+uT*(.35+aS.y*.5);vec3 rp=ringPt(ni,an,uT);
   p=rp.xy+vec2(sin(uT*3.+aS.y*20.),cos(uT*2.6+aS.x*20.))*.0035;
   a=smoothstep(uC+1.6,uC+2.3,uT)*(.3+.55*pow(.5+.5*sin(uT*4.+aS.y*40.),3.))*(rp.z<-.03?.45:1.);
   sz=1.4+1.8*aS.y;c=vec3(1.,.95,.84);
  }
 }else{ // 신: 기억 알갱이가 가슴으로 · 불붙는 순간 파편 · 위로 날리는 불티
  if(id<.3){float st=.9+aS.x*1.5,du=1.1+aS.y*.7,ph=(uT-st)/du;if(ph>0.&&ph<1.){float an=aS.z*6.2832+ph*2.4*(aS.w>.15?1.:-1.),r=(.25+.25*aS.y)*pow(1.-ph,1.5);
    p=vec2(cos(an),sin(an)*.85)*r+vec2(0.,.17);a=sin(3.1416*min(1.,ph*1.2))*.95;sz=2.+2.*aS.y;c=vec3(1.,.95,.8);}}
  else if(id<.5){float s=uT-uB;if(s>0.){float an=aS.x*6.2832,sp=.3+.8*aS.y,life=.8+.9*aS.z;
    p=vec2(0.,.17)+vec2(cos(an),sin(an))*sp*(1.-exp(-2.4*s))/2.4+vec2(0.,-.05*s*s);a=1.-s/life;sz=2.+2.5*aS.z;c=vec3(1.,.8,.45);}}
  else{float k=smoothstep(uB,uB+1.5,uT);float ph=fract(uT*.32*(.6+aS.y)+aS.x);
    float wide=step(.7,aS.z);
    vec2 base=mix(vec2((aS.z-.5)*.28,-.21+aS.y*.3),vec2((aS.z*2.-1.)*uRes.x/uRes.y*.5,-.55),wide);
    p=base+vec2(sin(ph*8.+aS.x*20.)*.02,ph*(.5+.4*aS.y));a=sin(3.1416*ph)*k*(.6+.4*sin(uT*14.+aS.x*30.));sz=2.+4.*aS.y*aS.y;c=mix(vec3(1.,.9,.6),vec3(1.,.55,.15),aS.x);}
 }
 vA=max(a,0.);vC=c;vR=aS.z;
 gl_Position=vec4(p.x*2.*uRes.y/uRes.x,p.y*2.,0.,1.);
 gl_PointSize=sz*uRes.y/700.*(vA>0.?1.:0.);
}`;
const PF=`#version 300 es
precision highp float;precision highp int;
in float vA;in vec3 vC;in float vR;uniform int uKind;out vec4 o;
void main(){vec2 q=gl_PointCoord-.5;
 if(uKind==0&&vR>.3){float an=vR*6.2832;mat2 m=mat2(cos(an),-sin(an),sin(an),cos(an));q=m*q;q.y*=2.2;}
 float d=length(q);float a=smoothstep(.5,.0,d)*vA;if(a<.003)discard;
 o=uKind==1?vec4(vC,a):vec4(vC*a,a);}`;

function compile(g,type,src){const s=g.createShader(type);g.shaderSource(s,src);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS)){console.warn(g.getShaderInfoLog(s));g.deleteShader(s);return null;}return s;}
function program(g,vs,fs){const v=compile(g,g.VERTEX_SHADER,vs),f=compile(g,g.FRAGMENT_SHADER,fs);if(!v||!f)return null;const p=g.createProgram();g.attachShader(p,v);g.attachShader(p,f);g.linkProgram(p);
 if(!g.getProgramParameter(p,g.LINK_STATUS)){console.warn(g.getProgramInfoLog(p));return null;}return p;}
const QV=`#version 300 es
in vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;
function textTexture(g,title,sub){
 const c=document.createElement('canvas');c.width=1024;c.height=256;const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,1024,256);
 x.fillStyle='#fff';x.textBaseline='middle';
 const big='140px "Noto Serif KR","Nanum Myeongjo","Batang",serif',sp=34;x.font=big;
 const chars=[...title],ws=chars.map(ch=>x.measureText(ch).width),tw=ws.reduce((a,b)=>a+b,0)+sp*(chars.length-1);let cx=512-tw/2;
 chars.forEach((ch,i)=>{x.fillText(ch,cx,92);cx+=ws[i]+sp;});
 x.font='34px "Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif';x.textAlign='center';x.globalAlpha=.85;x.fillText(sub,512,206);x.globalAlpha=1;
 const t=g.createTexture();g.bindTexture(g.TEXTURE_2D,t);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,c);
 g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);
 g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);return t;}
function glyphTexture(g,ch){
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,256,256);
 x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.font='200px "Noto Serif KR","Nanum Myeongjo","Batang","AppleMyungjo",serif';x.fillText(ch,128,136);
 x.filter='blur(3px)';x.drawImage(c,0,0);
 const t=g.createTexture();g.bindTexture(g.TEXTURE_2D,t);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,c);
 g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);
 g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);return t;}

const SRC={bloom:BLOOM,twist:TWIST,shin:SHIN,voice:VOICE,mang:MANG},KIND={bloom:0,twist:1,shin:2,voice:3,mang:4},COUNT={bloom:520,twist:220,shin:640,voice:300,mang:420};
function create(canvas,kind,opt){
 opt=opt||{};
 let g=null;try{g=canvas.getContext('webgl2',{antialias:false,alpha:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'high-performance'});}catch(e){}
 if(!g)return null;
 const fp=program(g,QV,SRC[kind]),pp=program(g,PV,PF);if(!fp||!pp)return null;
 const quad=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,quad);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),g.STATIC_DRAW);
 const vq=g.createVertexArray();g.bindVertexArray(vq);const la=g.getAttribLocation(fp,'aP');g.enableVertexAttribArray(la);g.vertexAttribPointer(la,2,g.FLOAT,false,0,0);
 const N=COUNT[kind],seeds=new Float32Array(N*4);let s=(opt.seed||1)*9301+49297;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
 for(let i=0;i<N;i++){seeds[i*4]=rnd();seeds[i*4+1]=rnd();seeds[i*4+2]=rnd();seeds[i*4+3]=i/N;}
 const pb=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,pb);g.bufferData(g.ARRAY_BUFFER,seeds,g.STATIC_DRAW);
 const vp=g.createVertexArray();g.bindVertexArray(vp);const ls=g.getAttribLocation(pp,'aS');g.enableVertexAttribArray(ls);g.vertexAttribPointer(ls,4,g.FLOAT,false,0,0);
 g.bindVertexArray(null);
 const U=(p,n)=>g.getUniformLocation(p,n);
 const fu={res:U(fp,'uRes'),t:U(fp,'uT'),a:U(fp,'uA'),b:U(fp,'uB'),c:U(fp,'uC'),d:U(fp,'uD'),tex:U(fp,'uTex')},pu={res:U(pp,'uRes'),t:U(pp,'uT'),a:U(pp,'uA'),b:U(pp,'uB'),c:U(pp,'uC'),d:U(pp,'uD'),kind:U(pp,'uKind')};
 const tex=kind==='shin'?glyphTexture(g,'心'):kind==='bloom'?textTexture(g,opt.title||'E.G.O',opt.sub||''):null;
 // 망 고리 리본 메시
 let rp=null,vr=null,ru=null;
 if(kind==='mang'){rp=program(g,RV,RF);
  if(rp){const S=RSEG,dat=new Float32Array(5*(S+1)*2*3);let k=0;
   for(let i=0;i<5;i++)for(let j=0;j<=S;j++)for(const sd of[-1,1]){dat[k++]=i;dat[k++]=j/S;dat[k++]=sd;}
   const rb=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,rb);g.bufferData(g.ARRAY_BUFFER,dat,g.STATIC_DRAW);
   vr=g.createVertexArray();g.bindVertexArray(vr);const lr=g.getAttribLocation(rp,'aR');g.enableVertexAttribArray(lr);g.vertexAttribPointer(lr,3,g.FLOAT,false,0,0);g.bindVertexArray(null);
   ru={res:U(rp,'uRes'),t:U(rp,'uT'),a:U(rp,'uA'),b:U(rp,'uB'),c:U(rp,'uC'),d:U(rp,'uD')};}}
 if(!opt.scale)opt.scale=.7;
 function resize(){const dpr=Math.min(2,window.devicePixelRatio||1),w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight,scale=opt.scale;
  let W=Math.round(w*dpr*scale),Hh=Math.round(h*dpr*scale);const cap=1280/Math.max(W,Hh);if(cap<1){W=Math.round(W*cap);Hh=Math.round(Hh*cap);}
  if(canvas.width!==W||canvas.height!==Hh){canvas.width=W;canvas.height=Hh;}}
 resize();
 function render(t){
  resize();g.viewport(0,0,canvas.width,canvas.height);
  g.disable(g.BLEND);g.useProgram(fp);g.bindVertexArray(vq);
  g.uniform2f(fu.res,canvas.width,canvas.height);g.uniform1f(fu.t,t);g.uniform1f(fu.a,opt.a||0);g.uniform1f(fu.b,opt.b||0);g.uniform1f(fu.c,opt.c||0);g.uniform1f(fu.d,opt.d||0);
  if(tex){g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,tex);g.uniform1i(fu.tex,0);}
  g.drawArrays(g.TRIANGLE_STRIP,0,4);
  g.enable(g.BLEND);
  if(kind==='twist')g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);else g.blendFunc(g.ONE,g.ONE);
  if(rp&&vr){g.useProgram(rp);g.bindVertexArray(vr);
   g.uniform2f(ru.res,canvas.width,canvas.height);g.uniform1f(ru.t,t);g.uniform1f(ru.a,opt.a||0);g.uniform1f(ru.b,opt.b||0);g.uniform1f(ru.c,opt.c||0);g.uniform1f(ru.d,opt.d||0);
   const n=Math.max(1,Math.min(5,opt.d|0||1)),S=(RSEG+1)*2;for(let i=0;i<n;i++)g.drawArrays(g.TRIANGLE_STRIP,i*S,S);}
  g.useProgram(pp);g.bindVertexArray(vp);
  g.uniform2f(pu.res,canvas.width,canvas.height);g.uniform1f(pu.t,t);g.uniform1f(pu.a,opt.a||0);g.uniform1f(pu.b,opt.b||0);g.uniform1f(pu.c,opt.c||0);g.uniform1f(pu.d,opt.d||0);g.uniform1i(pu.kind,KIND[kind]);
  g.drawArrays(g.POINTS,0,N);
  g.bindVertexArray(null);
 }
 function set(k,v){opt[k]=v;}
 function destroy(){try{const e=g.getExtension('WEBGL_lose_context');e&&e.loseContext();}catch(e){}}
 return {render,resize,destroy,set};
}
window.HeartGL={create,supported:()=>{try{return !!document.createElement('canvas').getContext('webgl2');}catch(e){return false;}}};
})();
