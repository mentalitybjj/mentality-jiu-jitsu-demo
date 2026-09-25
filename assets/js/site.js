
(function(){
"use strict";
/* This file runs on every page. Not every page has every widget (the intro
   splash, hero parallax, ticker, marquee, timetable, booking form and lead
   form are homepage/section-specific), so each block below guards on its
   own DOM elements existing before it touches them — a page missing a
   widget just skips that block instead of throwing. */

/* failsafe — the page must never stay scroll-locked */
setTimeout(function(){
  try{
    document.body.classList.remove("lock");
    document.body.classList.add("ready");
    var iv=document.getElementById("intro");
    if(iv && iv.parentNode) iv.parentNode.removeChild(iv);
  }catch(e){}
},4200);
window.addEventListener("error",function(){
  try{
    document.body.classList.remove("lock");
    document.body.classList.add("ready");
    var iv=document.getElementById("intro");
    if(iv && iv.parentNode) iv.parentNode.removeChild(iv);
  }catch(e){}
});
var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- DATA ---------- */
/* The site no longer takes booking details itself — every "book" link goes
   straight to Gymdesk's own signup page in a new tab. Change this one line
   if that URL is ever updated. */
var GYMDESK_SIGNUP="https://mentality-jiu-jitsu.gymdesk.com/signup";
var SCHEDULE={
 Mon:[{t:"3:45 – 4:30 pm",h:15.75,n:"Kids BJJ",s:"Ages 4–7",c:"kids"},{t:"4:30 – 5:15 pm",h:16.5,n:"Kids BJJ",s:"Ages 8–14",c:"kids"},{t:"5:30 – 6:30 pm",h:17.5,n:"BJJ Gi",s:"Adults · all levels",c:"bjj"},{t:"6:30 – 7:30 pm",h:18.5,n:"Muay Thai",s:"Adults · all levels",c:"muaythai"}],
 Tue:[{t:"12:00 – 1:00 pm",h:12,n:"BJJ No Gi",s:"Adults · lunchtime",c:"bjj"},{t:"3:45 – 4:30 pm",h:15.75,n:"Kids BJJ",s:"Ages 4–7",c:"kids"},{t:"4:30 – 5:15 pm",h:16.5,n:"Kids BJJ",s:"Ages 8–14",c:"kids"},{t:"5:30 – 6:30 pm",h:17.5,n:"Muay Thai",s:"Adults · all levels",c:"muaythai"},{t:"6:30 – 7:30 pm",h:18.5,n:"BJJ No Gi",s:"Adults · all levels",c:"bjj"}],
 Wed:[{t:"3:45 – 4:30 pm",h:15.75,n:"Kids BJJ No Gi",s:"Ages 4–7",c:"kids"},{t:"4:30 – 5:15 pm",h:16.5,n:"Kids BJJ No Gi",s:"Ages 8–14",c:"kids"},{t:"5:30 – 6:30 pm",h:17.5,n:"BJJ Gi",s:"Adults · all levels",c:"bjj"}],
 Thu:[{t:"12:00 – 1:00 pm",h:12,n:"BJJ Gi",s:"Adults · lunchtime",c:"bjj"},{t:"3:45 – 4:30 pm",h:15.75,n:"Kids BJJ",s:"Ages 4–7",c:"kids"},{t:"4:30 – 5:15 pm",h:16.5,n:"Kids BJJ",s:"Ages 8–14",c:"kids"},{t:"5:30 – 6:30 pm",h:17.5,n:"Muay Thai",s:"Adults · all levels",c:"muaythai"},{t:"6:30 – 7:30 pm",h:18.5,n:"BJJ No Gi",s:"Adults · all levels",c:"bjj"}],
 Fri:[{t:"5:00 – 6:00 pm",h:17,n:"BJJ Gi",s:"Adults · all levels",c:"bjj"},{t:"6:00 – 7:00 pm",h:18,n:"Open Mat",s:"All members",c:"bjj"}],
 Sat:[{t:"8:30 – 9:15 am",h:8.5,n:"Kids BJJ Gi",s:"Ages 4–7",c:"kids"},{t:"9:15 – 10:00 am",h:9.25,n:"Kids BJJ",s:"Ages 8–14",c:"kids"},{t:"10:00 – 11:00 am",h:10,n:"Open Mat",s:"All members",c:"bjj"}],
 Sun:[]
};
var DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
var LABEL={bjj:"Adult BJJ",kids:"Kids BJJ",muaythai:"Muay Thai"};

/* ---------- INTRO (homepage only) ---------- */
var intro=document.getElementById("intro"),body=document.body,T=[];
if(intro){
  var endIntro=function(){
    T.forEach(clearTimeout);
    intro.classList.add("out");
    body.classList.remove("lock"); body.classList.add("ready");
    setTimeout(function(){ if(intro.parentNode) intro.parentNode.removeChild(intro); },1100);
  };
  if(reduce){ endIntro(); }
  else{
    T.push(setTimeout(function(){ intro.classList.add("draw"); },140));
    T.push(setTimeout(function(){ intro.classList.add("shine"); },900));
    T.push(setTimeout(function(){ intro.classList.add("word"); },1300));
    T.push(setTimeout(endIntro,2500));
    var skipBtn=document.getElementById("skip");
    if(skipBtn) skipBtn.addEventListener("click",endIntro);
    window.addEventListener("keydown",function k(e){ if(e.key==="Escape"||e.key===" "){ endIntro(); window.removeEventListener("keydown",k); } });
  }
}else{
  /* inner pages have no splash — they're ready immediately */
  body.classList.remove("lock"); body.classList.add("ready");
}

/* ---------- MOBILE MENU ---------- */
(function(){
  var btn=document.getElementById("menuBtn"), panel=document.getElementById("mobileMenu");
  if(!btn || !panel) return;
  function setOpen(open){
    document.body.classList.toggle("menu-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  btn.addEventListener("click", function(){
    setOpen(!document.body.classList.contains("menu-open"));
  });
  panel.addEventListener("click", function(e){
    if(e.target.tagName === "A") setOpen(false);
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape") setOpen(false);
  });
  /* if the viewport grows past the mobile breakpoint while open, close it */
  window.addEventListener("resize", function(){
    if(window.innerWidth > 1180) setOpen(false);
  }, {passive:true});
})();

/* ---------- THEME ---------- */
var html=document.documentElement,tgl=document.getElementById("tgl");
function syncLabel(){
  tgl.setAttribute("aria-label", html.getAttribute("data-theme")==="dark" ? "Switch to light mode":"Switch to dark mode");
}
syncLabel();
tgl.addEventListener("click",function(){
  html.setAttribute("data-theme", html.getAttribute("data-theme")==="dark"?"light":"dark");
  syncLabel();
});

/* ---------- PARALLAX (video hero only — homepage) ---------- */
var hero=document.querySelector(".hero"),
    heroText=document.getElementById("heroText"),
    heroPanels=document.getElementById("heroPanels"),
    media=document.getElementById("heroMedia"),
    tex=document.getElementById("tex"),
    vidEl=document.querySelector("#heroVid video, #heroVid img"),
    hint=document.getElementById("hint"),
    shift=document.getElementById("stripShift");
var hasParallax = !!(hero && heroText && heroPanels && media && tex && hint && shift);
/* Below 900px the hero stacks heroText above heroMedia (see .hero-grid in
   site.css) instead of sitting side by side. The scroll-linked translate/
   fade below is tuned for the side-by-side desktop layout — on a stacked
   mobile layout it drags the heading text down into the schedule/reviews
   cards as you scroll, producing a ghosting/overlap glitch. So the whole
   effect is skipped on mobile widths; mobile gets the plain static layout. */
var mobileHeroMq = window.matchMedia && window.matchMedia("(max-width:900px)");
var isMobileHero = !!(mobileHeroMq && mobileHeroMq.matches);
function resetParallaxStyles(){
  [heroText,heroPanels,media,tex,vidEl,hint,shift].forEach(function(el){
    if(!el) return;
    el.style.transform="";
    el.style.opacity="";
  });
}
var ticking=false,lastP=-1;
function para(){
  ticking=false;
  var h=hero.offsetHeight||1, y=window.scrollY, p=Math.min(y/h,1);
  if(p===lastP) return;
  lastP=p;
  var d=y*0.34;
  var o=(1-p*0.9).toFixed(3);
  heroText.style.transform="translate3d(0,"+d.toFixed(1)+"px,0)";
  heroText.style.opacity=o;
  heroPanels.style.opacity=o;
  media.style.transform="translate3d(0,"+(-y*0.10).toFixed(1)+"px,0) scale("+(1+p*0.04).toFixed(3)+")";
  tex.style.transform="translate3d(0,"+(y*0.08).toFixed(1)+"px,0)";
  if(vidEl) vidEl.style.transform="translate3d(0,"+(y*0.16).toFixed(1)+"px,0) scale("+(1+p*0.06).toFixed(3)+")";
  hint.style.opacity=Math.max(0,1-p*3).toFixed(3);
  shift.style.transform="translate3d("+(-y*0.05).toFixed(1)+"px,0,0)";
}
function onScroll(){
  var hdr=document.getElementById("hdr");
  if(hdr) hdr.classList.toggle("stuck", window.scrollY>40);
  belt();
  if(reduce || !hasParallax || isMobileHero) return;
  if(window.scrollY <= hero.offsetHeight + 80 && !ticking){ ticking=true; requestAnimationFrame(para); }
}
onScroll(); if(!reduce && hasParallax && !isMobileHero) para();
window.addEventListener("scroll",onScroll,{passive:true});
window.addEventListener("resize",function(){
  var wasMobile=isMobileHero;
  isMobileHero=!!(mobileHeroMq && mobileHeroMq.matches);
  if(isMobileHero && !wasMobile && hasParallax) resetParallaxStyles();
  lastP=-1;
  if(!reduce && hasParallax && !isMobileHero) para();
},{passive:true});


/* ---------- BELT RAIL ---------- */
var beltOn=null;
function belt(){
  if(!beltOn){ beltOn=document.getElementById("beltOn"); if(!beltOn) return; }
  var h=document.documentElement.scrollHeight-window.innerHeight;
  var p=h>0?Math.min(window.scrollY/h,1):0;
  beltOn.style.clipPath="inset(0 "+((1-p)*100).toFixed(2)+"% 0 0)";
}

/* ---------- NEXT CLASS (only where the widget is on the page) ---------- */
(function(){
  var w=document.getElementById("ncWhen"), t=document.getElementById("ncWhat");
  if(!w || !t) return;
  var now=new Date(), nowIdx=(now.getDay()+6)%7, nowH=now.getHours()+now.getMinutes()/60;
  var FULL={Mon:"Monday",Tue:"Tuesday",Wed:"Wednesday",Thu:"Thursday",Fri:"Friday",Sat:"Saturday",Sun:"Sunday"};
  var found=null,offset=0;
  for(var d=0; d<8 && !found; d++){
    var key=DAYS[(nowIdx+d)%7], list=SCHEDULE[key]||[];
    for(var i=0;i<list.length;i++){
      if(d>0 || list[i].h > nowH+0.25){ found=list[i]; offset=d; found._day=key; break; }
    }
  }
  if(!found){ w.textContent="See the timetable"; t.textContent="Classes run Monday to Saturday."; return; }
  var when = offset===0 ? "Today, "+found.t.split(" – ")[0]
           : offset===1 ? "Tomorrow, "+found.t.split(" – ")[0]
           : FULL[found._day]+", "+found.t.split(" – ")[0];
  w.textContent=when;
  t.textContent=found.n+" · "+found.s;
})();

/* ---------- COUNTERS ---------- */
(function(){
  var els=document.querySelectorAll(".count b");
  if(!("IntersectionObserver" in window) || reduce){
    Array.prototype.forEach.call(els,function(e){ e.textContent=e.dataset.dec?(+e.dataset.to).toFixed(1):e.dataset.to; });
    return;
  }
  var co=new IntersectionObserver(function(es){
    es.forEach(function(en){
      if(!en.isIntersecting) return;
      var el=en.target, to=+el.dataset.to, dec=el.dataset.dec?1:0, t0=null;
      function step(ts){
        if(!t0) t0=ts;
        var k=Math.min((ts-t0)/1100,1), e=1-Math.pow(1-k,3);
        el.textContent=(to*e).toFixed(dec);
        if(k<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step); co.unobserve(el);
    });
  },{threshold:.5});
  Array.prototype.forEach.call(els,function(e){ co.observe(e); });
})();

/* ---------- PAUSE VIDEO OFF-SCREEN ---------- */
(function(){
  var v=document.getElementById("bgvid"); if(!v) return;
  if(reduce){ try{v.pause();}catch(e){} return; }
  /* play() returns a promise; a bare try/catch cannot swallow its rejection,
     so route every call through one guarded helper */
  function safePlay(){ try{ var q=v.play(); if(q&&q.catch) q.catch(function(){}); }catch(e){} }
  function safePause(){ try{ v.pause(); }catch(e){} }
  safePlay();
  if("IntersectionObserver" in window){
    new IntersectionObserver(function(es){
      es.forEach(function(e){ e.isIntersecting ? safePlay() : safePause(); });
    },{threshold:.01}).observe(document.getElementById("heroVid"));
  }
  document.addEventListener("visibilitychange",function(){
    document.hidden ? safePause() : safePlay();
  });
})();


/* ---------- THE CUT (Display Type Spec §2) ---------- */
var CUT_DEPTH = 0.17;        /* of cap height */
var CAP_RATIO = 0.715;       /* PP Neue Montreal, 715/1000 — fallback only */

function cutStack(){
  var ctx = cutStack._c || (cutStack._c = document.createElement("canvas").getContext("2d"));
  Array.prototype.forEach.call(document.querySelectorAll(".cut-stack"), function(stack){
    var lines = stack.querySelectorAll(".cut-line");
    Array.prototype.forEach.call(lines, function(el, i){
      el.classList.remove("cut-top","cut-bot");
      el.style.removeProperty("--cut");
      /* middle lines are left whole */
      if(i !== 0 && i !== lines.length - 1) return;

      var cs = getComputedStyle(el);
      var fs = parseFloat(cs.fontSize);
      var lh = parseFloat(cs.lineHeight);
      if(!fs) return;
      if(isNaN(lh)) lh = fs * 1.2;

      /* Measure the font that is actually rendering. actualBoundingBoxAscent
         on a cap glyph gives true cap height; fontBoundingBox* give the em
         box, from which half-leading and the baseline follow. */
      var cap, asc, desc;
      try{
        ctx.font = cs.fontStyle + " " + cs.fontWeight + " " + fs + "px " + cs.fontFamily;
        var m = ctx.measureText("H");
        cap  = m.actualBoundingBoxAscent;
        asc  = m.fontBoundingBoxAscent;
        desc = m.fontBoundingBoxDescent;
      }catch(e){}
      if(!cap || !isFinite(cap)){ cap = fs * CAP_RATIO; }
      if(!asc || !isFinite(asc)){ asc = fs * 0.9; desc = fs * 0.25; }

      var halfLead = (lh - (asc + desc)) / 2;
      var depth = cap * CUT_DEPTH;
      var px;
      if(i === 0){
        /* distance from the box top down to the new top edge of the caps */
        px = halfLead + (asc - cap) + depth;
        el.classList.add("cut-top");
      }else{
        /* distance from the box bottom up to the new bottom edge of the caps */
        px = halfLead + desc + depth;
        el.classList.add("cut-bot");
      }
      el.style.setProperty("--cut", Math.max(0, px).toFixed(2) + "px");
    });
  });
}
cutStack();
/* type is fluid (clamp) and webfonts land late — re-measure on both */
if(document.fonts && document.fonts.ready) document.fonts.ready.then(cutStack)["catch"](function(){});
window.addEventListener("resize", function(){
  clearTimeout(cutStack._t); cutStack._t = setTimeout(cutStack, 120);
}, {passive:true});

/* ---------- HERO TICKER ---------- */
/* The viewport height must equal exactly one copy of the title so the
   scrolling window never clips a line. Measured from the live (non-hidden)
   copy, which is why sizing runs after cutStack() has already set its
   metrics — same triggers, same fluid-type/late-webfont reasons. */
function sizeHeroTicker(){
  var vp = document.getElementById("heroTicker");
  var one = vp && vp.querySelector(".cut-stack");
  if(!vp || !one) return;
  vp.style.height = one.offsetHeight + "px";
}
sizeHeroTicker();
if(document.fonts && document.fonts.ready) document.fonts.ready.then(sizeHeroTicker)["catch"](function(){});
window.addEventListener("resize", function(){
  clearTimeout(sizeHeroTicker._t); sizeHeroTicker._t = setTimeout(sizeHeroTicker, 120);
}, {passive:true});

/* ---------- MARQUEE (homepage strip) ---------- */
var stripEl=document.getElementById("strip");
if(stripEl){
  var items=["Beginners welcome","3 free classes","Rated 5.0 on Google","No lock-in option","Adults &amp; kids","Tweed Heads South","Gi &amp; No Gi","Muay Thai"];
  var run=items.map(function(i){return "<span>"+i+"</span>"}).join("");
  stripEl.innerHTML=run+run;
}

/* ---------- REVEAL ---------- */
if("IntersectionObserver" in window && !reduce){
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} });
  },{threshold:.12,rootMargin:"0px 0px -40px"});
  var rvCounts=new Map();
  Array.prototype.forEach.call(document.querySelectorAll(".rv"),function(el){
    var p=el.parentElement, n=rvCounts.get(p)||0;
    rvCounts.set(p,n+1);
    el.style.transitionDelay=(Math.min(n,2)*70)+"ms"; io.observe(el);
  });
}else{ Array.prototype.forEach.call(document.querySelectorAll(".rv"),function(el){el.classList.add("in")}); }

/* ---------- LIQUID GLASS GALLERY (About page "Inside the room") ----------
   Each photo is redrawn on a small WebGL canvas so it can be distorted:
   - it pours in from the bottom with a liquid edge the first time it's seen
   - it ripples like liquid while the page is scrolling (stronger = faster)
   - on desktop a glass lens follows the cursor: it magnifies and bends the
     photo, splits colour at its rim, catches a highlight, and shows the
     photo in colour while the rest stays black and white
   - tiles near the middle of the screen fade to colour (so phones get colour)
   If WebGL is unavailable, the page is opened from a file, or the visitor
   prefers reduced motion, the normal <img> is left in place untouched. */
(function(){
  var grid=document.querySelector(".mosaic-glass"); if(!grid || reduce) return;
  var fine=window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var VS="attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}";
  var FS=[
  "precision highp float;",
  "uniform sampler2D T;uniform vec2 R,I,O,M;uniform float L,RAD,TM,RV,VEL,COL;varying vec2 v;",
  "vec2 cover(vec2 u){float rs=R.x/R.y,ri=I.x/I.y;vec2 s=rs>ri?vec2(1.,ri/rs):vec2(rs/ri,1.);return u*s+(1.-s)*O;}",
  "vec3 tex(vec2 u){return texture2D(T,clamp(cover(u),.001,.999)).rgb;}",
  "vec3 grey(vec3 c,float k){float l=dot(c,vec3(.299,.587,.114));l=(l-.5)*1.05+.5;return mix(vec3(l),c,k);}",
  "void main(){",
  " vec2 u=v;",
  /* liquid: settles as the tile is revealed, wakes up with scroll speed */
  " float amp=(1.-RV)*.045+min(abs(VEL),1.)*.018;",
  " u.x+=amp*(sin(u.y*11.+TM*2.2)*.6+sin(u.y*23.-TM*3.1+u.x*5.)*.4);",
  " u.y+=amp*.6*cos(u.x*9.+TM*1.7);",
  " u=(u-.5)*(1.-.06*(1.-RV))+.5;",
  /* glass lens */
  " vec2 px=v*R;vec2 d=px-M;float r=RAD*L;float len=length(d);float t=r>0.?len/r:2.;",
  " float inL=r>0.?1.-smoothstep(r-1.5,r+.5,len):0.;",
  " vec3 c;",
  " if(inL>0.){",
  "  float k=.46+.54*pow(t,2.2);",                                  /* magnify the middle */
  "  vec2 dd=d*k;float ca=.045*pow(t,3.);",                          /* colour split at the rim */
  "  vec2 base=(M+dd)/R;",
  "  vec3 g=vec3(tex(base+dd/R*ca).r,tex(base).g,tex(base-dd/R*ca).b);",
  "  vec2 n=len>0.?d/len:vec2(0.);",
  "  float rim=smoothstep(.78,1.,t);",
  "  float spec=rim*max(0.,dot(n,normalize(vec2(-.7,-1.))));",       /* highlight top-left */
  "  float glow=(1.-smoothstep(0.,.55,length((d/r)-vec2(-.35,-.42))))*.22;",
  "  float line=smoothstep(.93,.985,t)*(1.-smoothstep(.985,1.,t));",
  "  g=g*(1.-.14*rim)+vec3(spec*.7+glow+line*.35);",
  "  vec3 o=grey(tex(u),COL);",
  "  c=mix(o,g,inL);",
  " } else {",
  "  c=grey(tex(u),COL);",
  "  float sh=r>0.?smoothstep(r+14.,r,len)*.16:0.;c*=1.-sh;",          /* soft shadow round the lens */
  " }",
  /* liquid pour-in from the bottom */
  " float lvl=RV*1.25;float edge=(1.-v.y)+.035*sin(v.x*9.+TM*3.)+.02*sin(v.x*23.-TM*4.);",
  " float a=1.-smoothstep(lvl-.07,lvl,edge);",
  " gl_FragColor=vec4(c*a,a);",
  "}"].join("\n");

  function mk(gl,type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s;}

  var tiles=[], vel=0, lastY=window.scrollY, running=false, t0=performance.now();

  Array.prototype.forEach.call(grid.querySelectorAll(".fig"),function(fig){
    var ph=fig.querySelector(".ph"), img=ph && ph.querySelector("img"); if(!img) return;
    var pos=(img.style.objectPosition||"50% 50%").split(" ").map(function(s){return parseFloat(s)/100;});
    tiles.push({fig:fig,ph:ph,img:img,O:[pos[0]||.5,isNaN(pos[1])?.5:pos[1]],gl:null,
      rv:0,rvGo:false,lens:0,lensT:0,mx:0,my:0,tx:0,ty:0,col:0,colT:0,vis:false,dirty:true});
  });

  function init(t){
    if(t.gl||t.failed) return;
    var cv=document.createElement("canvas"); cv.className="glass-cv"; cv.setAttribute("aria-hidden","true");
    var gl=cv.getContext("webgl",{premultipliedAlpha:true,alpha:true,antialias:false});
    if(!gl){ t.failed=true; return; }
    try{
      var pr=gl.createProgram();
      gl.attachShader(pr,mk(gl,gl.VERTEX_SHADER,VS)); gl.attachShader(pr,mk(gl,gl.FRAGMENT_SHADER,FS));
      gl.linkProgram(pr); if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) throw new Error("link");
      gl.useProgram(pr);
      var b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
      var loc=gl.getAttribLocation(pr,"p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
      var tx=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tx);
      [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(function(w){gl.texParameteri(gl.TEXTURE_2D,w,gl.CLAMP_TO_EDGE);});
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      var U={}; ["T","R","I","O","M","L","RAD","TM","RV","VEL","COL"].forEach(function(n){U[n]=gl.getUniformLocation(pr,n);});
      t.cv=cv; t.U=U;
      var go=function(){
        try{
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,t.img);
          gl.uniform2f(U.I,t.img.naturalWidth,t.img.naturalHeight);
          gl.uniform2f(U.O,t.O[0],t.O[1]);
          t.gl=gl; t.ph.appendChild(cv); size(t); t.ph.classList.add("gl-on"); t.dirty=true; kick();
        }catch(e){ t.failed=true; }   /* e.g. opened from file:// — keep the plain image */
      };
      t.img.loading="eager";
      if(t.img.complete && t.img.naturalWidth) go(); else t.img.addEventListener("load",go,{once:true});
    }catch(e){ t.failed=true; }
  }
  function size(t){
    if(!t.gl) return;
    var r=t.ph.getBoundingClientRect(), d=Math.min(window.devicePixelRatio||1,2);
    t.w=r.width; t.h=r.height;
    t.cv.width=Math.max(1,Math.round(r.width*d)); t.cv.height=Math.max(1,Math.round(r.height*d)); t.dpr=d;
    t.gl.viewport(0,0,t.cv.width,t.cv.height); t.dirty=true;
  }

  function draw(t,now){
    var gl=t.gl,U=t.U,d=t.dpr;
    gl.uniform2f(U.R,t.cv.width,t.cv.height);
    gl.uniform2f(U.M,t.mx*d,t.my*d);
    gl.uniform1f(U.L,t.lens); gl.uniform1f(U.RAD,Math.min(t.w,t.h)*.26*d);
    gl.uniform1f(U.TM,(now-t0)/1000); gl.uniform1f(U.RV,t.rv);
    gl.uniform1f(U.VEL,vel); gl.uniform1f(U.COL,t.col);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }

  function frame(now){
    running=false;
    var y=window.scrollY, dy=y-lastY; lastY=y;
    vel+=(dy/40-vel)*.18; if(Math.abs(vel)<.002) vel=0;
    var vh=window.innerHeight, busy=vel!==0;
    tiles.forEach(function(t){
      if(!t.gl || !t.vis) return;
      var r=t.ph.getBoundingClientRect();
      if(!t.rvGo && r.top<vh*.92){ t.rvGo=true; }
      if(t.rvGo && t.rv<1){ t.rv=Math.min(1,t.rv+.018); t.dirty=true; }
      var off=((r.top+r.height/2)-vh/2)/vh;
      /* colour when centred; while the lens is out the rest drops to grey so the glass "reveals" colour */
      t.colT=t.lensT>0?0:((Math.abs(off)<.24 && t.rv>=1)?1:0);
      var pc=t.col; t.col+=(t.colT-t.col)*.08; if(Math.abs(t.colT-t.col)<.003) t.col=t.colT;
      var pl=t.lens; t.lens+=(t.lensT-t.lens)*.14; if(Math.abs(t.lensT-t.lens)<.003) t.lens=t.lensT;
      var pmx=t.mx,pmy=t.my; t.mx+=(t.tx-t.mx)*.2; t.my+=(t.ty-t.my)*.2;
      var moving=Math.abs(t.tx-t.mx)>.3||Math.abs(t.ty-t.my)>.3;
      if(pc!==t.col||pl!==t.lens||moving||pmx!==t.mx||pmy!==t.my) t.dirty=true;
      if(vel!==0 || t.rv<1) t.dirty=true;
      if(t.dirty){ draw(t,now); t.dirty=false; busy=true; }
      if(t.rv<1 || t.col!==t.colT || t.lens!==t.lensT || moving) busy=true;
    });
    if(busy) kick();
  }
  function kick(){ if(!running){ running=true; requestAnimationFrame(frame); } }

  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      var t=tiles.filter(function(x){return x.fig===e.target;})[0]; if(!t) return;
      t.vis=e.isIntersecting; if(t.vis){ init(t); t.dirty=true; kick(); }
    });
  },{rootMargin:"250px 0px"});
  tiles.forEach(function(t){ io.observe(t.fig); });

  window.addEventListener("scroll",kick,{passive:true});
  window.addEventListener("resize",function(){ tiles.forEach(size); kick(); },{passive:true});

  if(!fine) return;
  tiles.forEach(function(t){
    t.ph.addEventListener("pointerenter",function(ev){
      var b=t.ph.getBoundingClientRect(); t.tx=t.mx=ev.clientX-b.left; t.ty=t.my=ev.clientY-b.top; t.lensT=1; kick();
    });
    t.ph.addEventListener("pointermove",function(ev){
      var b=t.ph.getBoundingClientRect(); t.tx=ev.clientX-b.left; t.ty=ev.clientY-b.top; t.lensT=1; kick();
    });
    t.ph.addEventListener("pointerleave",function(){ t.lensT=0; kick(); });
  });
})();

/* ---------- FILM REVEAL (portrait program videos) ----------
   Each .film-reveal starts as a thin bright slit. When ~40% of it is on
   screen it opens out (CSS keyframes), then the video starts and the
   caption slides in. Clips in the same row open one after another.
   After that, videos pause whenever they're off screen to save battery. */
(function(){
  var els=Array.prototype.slice.call(document.querySelectorAll(".film-reveal")); if(!els.length) return;
  function play(v){ if(!v) return; try{ var q=v.play(); if(q&&q.catch) q.catch(function(){}); }catch(e){} }
  function pause(v){ if(!v) return; try{ v.pause(); }catch(e){} }
  if(reduce || !("IntersectionObserver" in window)){
    els.forEach(function(el){ el.classList.add("is-revealed"); var v=el.querySelector("video");
      if(v && reduce){ v.controls=true; v.removeAttribute("autoplay"); } else play(v); });
    return;
  }
  els.forEach(function(el){
    var sib=Array.prototype.filter.call(el.parentElement.children,function(c){return c.classList.contains("film-reveal");});
    el.style.setProperty("--frd",(sib.indexOf(el)*180)+"ms");
    var v=el.querySelector("video"); if(v){ v.removeAttribute("autoplay"); pause(v); }
  });
  var seen=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      var el=e.target, fr=el.querySelector(".fr-frame"), v=el.querySelector("video");
      seen.unobserve(el);
      el.classList.add("is-revealing");
      var done=false, finish=function(){ if(done) return; done=true;
        el.classList.remove("is-revealing"); el.classList.add("is-revealed"); el.dataset.live="1";
        if(el.dataset.onscreen!=="0") play(v); };
      fr.addEventListener("animationend",function(ev){ if(ev.animationName==="frOpen") finish(); });
      setTimeout(finish,1350+parseInt(getComputedStyle(el).getPropertyValue("--frd")||0,10)+400); /* safety net */
    });
  },{threshold:.4});
  var vis=new IntersectionObserver(function(es){
    es.forEach(function(e){
      var el=e.target, v=el.querySelector("video");
      el.dataset.onscreen=e.isIntersecting?"1":"0";
      if(el.dataset.live!=="1") return;
      e.isIntersecting ? play(v) : pause(v);
    });
  },{threshold:.05});
  els.forEach(function(el){ seen.observe(el); vis.observe(el); });
})();

/* ---------- TIMETABLE (only on pages with the widget) ---------- */
var todayIdx=(new Date().getDay()+6)%7,curDay=DAYS[todayIdx],curFilter="all";
var daysEl=document.getElementById("days"),slotsEl=document.getElementById("slots");
if(daysEl && slotsEl){
DAYS.forEach(function(d,i){
  var b=document.createElement("button");
  b.className="day-btn"+(i===todayIdx?" today":"");
  b.setAttribute("role","tab"); b.textContent=d;
  b.setAttribute("aria-selected", d===curDay?"true":"false");
  b.addEventListener("click",function(){ curDay=d; syncDays(); renderSlots(); });
  daysEl.appendChild(b);
});
function syncDays(){ Array.prototype.forEach.call(daysEl.children,function(b){ b.setAttribute("aria-selected", b.textContent===curDay?"true":"false"); }); }
function renderSlots(){
  var list=(SCHEDULE[curDay]||[]).filter(function(s){return curFilter==="all"||s.c===curFilter});
  if(!list.length){
    slotsEl.innerHTML='<p class="slot-empty">No '+(curFilter==="all"?"":LABEL[curFilter].toLowerCase()+" ")+'classes on '+curDay+'day. Try another day, or <a href="'+GYMDESK_SIGNUP+'" target="_blank" rel="noopener">book a trial</a> and we\'ll find you a time.</p>';
    return;
  }
  slotsEl.innerHTML=list.map(function(s){
    return '<div class="slot"><div class="slot-time">'+s.t+'</div><div class="slot-name">'+s.n+'<small>'+s.s+'</small></div><a href="'+GYMDESK_SIGNUP+'" target="_blank" rel="noopener" class="btn btn-sm btn-ghost">Try this class</a></div>';
  }).join("");
}
Array.prototype.forEach.call(document.querySelectorAll(".chip"),function(c){
  c.addEventListener("click",function(){
    curFilter=c.dataset.filter;
    Array.prototype.forEach.call(document.querySelectorAll(".chip"),function(x){ x.setAttribute("aria-pressed", x===c?"true":"false"); });
    renderSlots();
  });
});
syncDays(); renderSlots();
} /* end timetable guard */

/* ---------- SHARED FORM HELPERS (used by both the booking and lead forms,
   defined once at this scope so either guarded block below can use them) ---------- */
function bad(id,cond){ var f=document.getElementById(id).closest(".field"); f.classList.toggle("bad",!!cond); return !!cond; }
var EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/* Paste your Apps Script Web App URL between the quotes below. That is the
   only line you need to change. Leave it empty and both forms stay in demo
   mode: they validate and show the confirmation, but send nothing.

   Deploy the script as:  Execute as = Me,  Who has access = Anyone.
   ("Anyone with a Google account" will fail — visitors are not signed in.) */
var ENDPOINT = "https://script.google.com/macros/s/AKfycby8cUb_P79pE36Adzw5wxWgBYBfOWM_m-tU9AnuzEkklcGStRvnYJD0mBDqXk8pJuIU/exec";
function send(payload){
  if(!ENDPOINT) return Promise.resolve({ok:true,demo:true});
  var ctrl = ("AbortController" in window) ? new AbortController() : null;
  var timer = ctrl ? setTimeout(function(){ ctrl.abort(); }, 15000) : null;
  /* Apps Script answers a POST with a 302 to a script.googleusercontent.com
     "echo" URL. That redirect target does not reliably send back CORS
     headers, so a normal cross-origin fetch can have the request succeed on
     the wire (visible in the Network tab as 302 -> 200) while the browser
     still refuses to let this script read the response, surfacing as a
     generic "Failed to fetch". mode:"no-cors" avoids that: the request and
     its redirect still go out and Apps Script still runs, we just can no
     longer read the body back (the response comes back "opaque"), so a
     resolved promise here only means the request was sent, not that the
     server-side validation passed. Real send failures (offline, timeout,
     the domain being unreachable) still reject below. */
  return fetch(ENDPOINT,{
    method:"POST",
    mode:"no-cors",
    headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify(payload),
    signal: ctrl ? ctrl.signal : undefined
  }).then(function(){
    if(timer) clearTimeout(timer);
    return {ok:true};
  });
}
function showErr(el,msg){ el.textContent=msg; el.classList.add("on"); }
function hideErr(el){ el.classList.remove("on"); }
var FAIL = "We couldn't send that just now. Please check your connection and try again — or call us on 0452 518 690 and we'll book you in.";

/* ---------- LEAD (beginner's guide download — only where the form exists) ---------- */
var leadFormEl=document.getElementById("leadForm");
if(leadFormEl){
var leadBtn=document.getElementById("leadBtn"), leadErr=document.getElementById("leadErr");
leadFormEl.addEventListener("submit",function(e){
  e.preventDefault();
  var form=this;
  var n=document.getElementById("ln").value.trim(),m=document.getElementById("le").value.trim();
  var e1=bad("ln",n.length<2),e2=bad("le",!EMAIL.test(m));
  if(e1||e2) return;
  hideErr(leadErr);
  var label=leadBtn.textContent;
  leadBtn.disabled=true; leadBtn.textContent="Sending…";
  send({
    type:"guide-download",
    firstName:n, email:m,
    company:document.getElementById("lhp").value,
    page:location.href
  }).then(function(){
    document.getElementById("leadOkEmail").textContent=m;
    form.classList.add("off");
    document.getElementById("leadOk").classList.add("on");
  })["catch"](function(){
    showErr(leadErr,FAIL);
  }).then(function(){
    leadBtn.disabled=false; leadBtn.textContent=label;
  });
});
} /* end lead guard */

/* ---------- CONTACT (visit page enquiry form — only where it exists) ---------- */
var contactFormEl=document.getElementById("contactForm");
if(contactFormEl){
var contactBtn=document.getElementById("contactBtn"), contactErr=document.getElementById("contactErr");
contactFormEl.addEventListener("submit",function(e){
  e.preventDefault();
  var form=this;
  var n=document.getElementById("cn").value.trim(),
      m=document.getElementById("ce").value.trim(),
      msg=document.getElementById("cm").value.trim();
  var e1=bad("cn",n.length<2), e2=bad("ce",!EMAIL.test(m)), e3=bad("cm",msg.length<5);
  if(e1||e2||e3) return;
  hideErr(contactErr);
  var label=contactBtn.textContent;
  contactBtn.disabled=true; contactBtn.textContent="Sending…";
  send({
    type:"contact",
    name:n, email:m, message:msg,
    company:document.getElementById("chp").value,
    page:location.href
  }).then(function(){
    document.getElementById("contactOkEmail").textContent=m;
    form.classList.add("off");
    document.getElementById("contactOk").classList.add("on");
  })["catch"](function(){
    showErr(contactErr,FAIL);
  }).then(function(){
    contactBtn.disabled=false; contactBtn.textContent=label;
  });
});
} /* end contact guard */
})();



(function(){
"use strict";
/* Exit-intent trial popup — shows once per visit, every visit. Desktop reads
   the cursor leaving toward the top of the window; touch devices (no cursor)
   use the first back-button press as the equivalent "I'm leaving" signal.
   A true "closing the tab" can't trigger custom UI on mobile — browsers
   only allow a plain native confirm for that, no custom content — so the
   back-button press is the closest reliable stand-in. sessionStorage (not
   localStorage) is what makes it "once per visit": it's cleared the moment
   the tab/browser closes, so the next visit starts fresh. */
var KEY="mjjExitTrialSeen";
try{ if(sessionStorage.getItem(KEY)) return; }catch(e){}

var pop=document.getElementById("exitPromo");
if(!pop) return;
var closeBtn=document.getElementById("exitPromoClose"),
    scrim=document.getElementById("exitPromoScrim"),
    cta=document.getElementById("exitPromoCta");
var shown=false, armed=false;

function markSeen(){ try{ sessionStorage.setItem(KEY,"1"); }catch(e){} }

function show(){
  if(shown) return;
  shown=true;
  pop.classList.add("show");
  pop.setAttribute("aria-hidden","false");
  markSeen();
  document.removeEventListener("mouseout",onMouseOut);
  window.removeEventListener("popstate",onPopState);
}
function hide(){
  pop.classList.remove("show");
  pop.setAttribute("aria-hidden","true");
}
function onMouseOut(e){
  if(!armed || shown) return;
  if(e.clientY>0) return; /* only the top edge counts as "leaving" */
  if(e.relatedTarget||e.toElement) return; /* mouse is still inside the page */
  show();
}
function onPopState(){ if(armed && !shown) show(); }

closeBtn.addEventListener("click",hide);
scrim.addEventListener("click",hide);
cta.addEventListener("click",hide);
document.addEventListener("keydown",function(e){ if(e.key==="Escape") hide(); });

/* Wait for the intro animation to finish (body gets "ready") plus a short
   buffer, so the popup can never fire on incidental mouse movement while
   the page is still loading in. */
function arm(){
  if(armed) return;
  armed=true;
  document.addEventListener("mouseout",onMouseOut);
  var isTouch=window.matchMedia&&window.matchMedia("(hover: none), (pointer: coarse)").matches;
  if(isTouch){
    try{
      history.pushState({mjjExit:true},"",location.href);
      window.addEventListener("popstate",onPopState);
    }catch(e){}
  }
}
function waitReady(){
  if(document.body.classList.contains("ready")){ setTimeout(arm,1500); return; }
  setTimeout(waitReady,200);
}
waitReady();
})();
