
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
    if(window.innerWidth > 1000) setOpen(false);
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
    vidEl=document.querySelector("#heroVid video"),
    hint=document.getElementById("hint"),
    shift=document.getElementById("stripShift");
var hasParallax = !!(hero && heroText && heroPanels && media && tex && hint && shift);
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
  if(reduce || !hasParallax) return;
  if(window.scrollY <= hero.offsetHeight + 80 && !ticking){ ticking=true; requestAnimationFrame(para); }
}
onScroll(); if(!reduce && hasParallax) para();
window.addEventListener("scroll",onScroll,{passive:true});
window.addEventListener("resize",function(){ lastP=-1; if(!reduce && hasParallax) para(); },{passive:true});


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
    slotsEl.innerHTML='<p class="slot-empty">No '+(curFilter==="all"?"":LABEL[curFilter].toLowerCase()+" ")+'classes on '+curDay+'day. Try another day, or <a href="#book">book a trial</a> and we\'ll find you a time.</p>';
    return;
  }
  slotsEl.innerHTML=list.map(function(s){
    return '<div class="slot"><div class="slot-time">'+s.t+'</div><div class="slot-name">'+s.n+'<small>'+s.s+'</small></div><a href="#book" class="btn btn-sm btn-ghost" data-pref="'+s.c+'">Try this class</a></div>';
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
var ENDPOINT = "";
function send(payload){
  if(!ENDPOINT) return Promise.resolve({ok:true,demo:true});
  var ctrl = ("AbortController" in window) ? new AbortController() : null;
  var timer = ctrl ? setTimeout(function(){ ctrl.abort(); }, 15000) : null;
  return fetch(ENDPOINT,{
    method:"POST",
    /* text/plain keeps this a CORS "simple request" so the browser skips the
       OPTIONS preflight, which Apps Script web apps do not answer. The script
       reads the raw body with JSON.parse(e.postData.contents). */
    headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify(payload),
    signal: ctrl ? ctrl.signal : undefined,
    redirect:"follow"
  }).then(function(r){
    if(timer) clearTimeout(timer);
    if(!r.ok) throw new Error("HTTP "+r.status);
    return r.json();
  }).then(function(d){
    if(d && d.ok === false) throw new Error(d.error || "Rejected");
    return d;
  });
}
function showErr(el,msg){ el.textContent=msg; el.classList.add("on"); }
function hideErr(el){ el.classList.remove("on"); }
var FAIL = "We couldn't send that just now. Please check your connection and try again — or call us on 0452 518 690 and we'll book you in.";

/* ---------- BOOKING (only on the page that carries the booking form) ---------- */
var stepsEl=document.getElementById("steps");
if(stepsEl && document.getElementById("bookForm")){
var state={prog:null,day:null,time:null,className:""};
var panes=[null,document.getElementById("p1"),document.getElementById("p2"),document.getElementById("p3"),document.getElementById("p4")];
var steps=stepsEl.children;
function goto(n){
  for(var i=1;i<panes.length;i++) panes[i].classList.toggle("on", i===n);
  for(var s=0;s<steps.length;s++) steps[s].classList.toggle("on", s===n-1);
}
function pickProgram(p){
  state.prog=p;
  Array.prototype.forEach.call(document.querySelectorAll("[data-prog]"),function(b){ b.setAttribute("aria-pressed", b.dataset.prog===p?"true":"false"); });
  buildClassList(); goto(2);
}
Array.prototype.forEach.call(document.querySelectorAll("[data-prog]"),function(b){ b.addEventListener("click",function(){ pickProgram(b.dataset.prog); }); });
function buildClassList(){
  var out=[];
  DAYS.forEach(function(d){ (SCHEDULE[d]||[]).forEach(function(s){ if(s.c===state.prog) out.push({d:d,s:s}); }); });
  document.getElementById("classOpts").innerHTML=out.map(function(o,i){
    return '<button class="opt" data-slot="'+i+'" aria-pressed="false"><span><strong>'+o.d+' · '+o.s.t+'</strong><em>'+o.s.n+' · '+o.s.s+'</em></span><span class="tick">Selected</span></button>';
  }).join("");
  Array.prototype.forEach.call(document.querySelectorAll("[data-slot]"),function(b){
    b.addEventListener("click",function(){
      var o=out[+b.dataset.slot];
      state.day=o.d; state.time=o.s.t; state.className=o.s.n;
      Array.prototype.forEach.call(document.querySelectorAll("[data-slot]"),function(x){ x.setAttribute("aria-pressed", x===b?"true":"false"); });
      document.getElementById("recap").innerHTML='<div><span>Program</span>'+LABEL[state.prog]+'</div><div><span>Class</span>'+state.className+'</div><div><span>When</span>'+o.d+', '+o.s.t+'</div>';
      goto(3);
    });
  });
}
Array.prototype.forEach.call(document.querySelectorAll("[data-back]"),function(b){ b.addEventListener("click",function(){ goto(+b.dataset.back); }); });
document.addEventListener("click",function(e){
  var t=e.target.closest&&e.target.closest("[data-pref]");
  if(t) pickProgram(t.dataset.pref);
});

var bookBtn=document.getElementById("bookBtn"), bookErr=document.getElementById("bookErr");
document.getElementById("bookForm").addEventListener("submit",function(e){
  e.preventDefault();
  var n=document.getElementById("bn").value.trim(),l=document.getElementById("bl").value.trim(),
      p=document.getElementById("bp").value.replace(/[^0-9]/g,""),m=document.getElementById("be").value.trim();
  var errs=[bad("bn",n.length<2),bad("bl",l.length<1),bad("bp",p.length<8),bad("be",!EMAIL.test(m))];
  if(errs.some(Boolean)) return;
  hideErr(bookErr);
  var label=bookBtn.textContent;
  bookBtn.disabled=true; bookBtn.textContent="Sending…";
  send({
    type:"trial-booking",
    program:LABEL[state.prog]||"", className:state.className||"",
    classDay:state.day||"", classTime:state.time||"",
    firstName:n, lastName:l,
    mobile:document.getElementById("bp").value.trim(), email:m,
    experience:document.getElementById("bx").value,
    marketingConsent:document.getElementById("bc").checked?"Yes":"No",
    company:document.getElementById("bhp").value,
    page:location.href
  }).then(function(){
    document.getElementById("doneLine").innerHTML='Thanks '+n.replace(/[<>&]/g,"")+' — your first '+LABEL[state.prog].toLowerCase()+' class is <strong>'+state.day+', '+state.time+'</strong>.';
    goto(4);
  })["catch"](function(){
    showErr(bookErr,FAIL);
  }).then(function(){
    bookBtn.disabled=false; bookBtn.textContent=label;
  });
});
var againBtn=document.getElementById("again");
if(againBtn) againBtn.addEventListener("click",function(){
  document.getElementById("bookForm").reset();
  Array.prototype.forEach.call(document.querySelectorAll(".field"),function(f){f.classList.remove("bad")});
  goto(1);
});
} /* end booking guard */

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
