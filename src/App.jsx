import { useState, useEffect, useRef, useCallback } from "react";

// ── CONFIG ────────────────────────────────────────────────────────────────────
const ADMIN_EMAIL    = "bioloucos126@gmail.com";
const ADMIN_HASH     = "398707c6a99a1b1409313972df5c2481d92b1e3408de28cabdaaaf45d656d21b";
const SESSION_KEY    = "bio_admin_session";
const SCHOOLS_KEY    = "bio_schools_v2";
const SESSION_TTL    = 24 * 60 * 60 * 1000;
const PTS_PER_LITER  = 101;
const CITIES_COUNT   = 3;

const DEFAULT_SCHOOLS = [
  { id: 1, name: "E.E. Prof. João Silva",      liters: 492, status: "Ativo" },
  { id: 2, name: "CIEP 238 Verde Esperança",   liters: 410, status: "Ativo" },
  { id: 3, name: "EM Prof. Maria Graças",      liters: 382, status: "Ativo" },
  { id: 4, name: "EM Futuro Verde",            liters: 346, status: "Ativo" },
  { id: 5, name: "CEst. Ipê Amarelo",          liters: 294, status: "Ativo" },
  { id: 6, name: "EM Riachuelo Eco",           liters: 216, status: "Ativo" },
  { id: 7, name: "EMEF Santos Dumont",         liters: 155, status: "Ativo" },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const sha256 = async (str) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
};

const loadSchools = () => {
  try { const s = JSON.parse(localStorage.getItem(SCHOOLS_KEY)); return Array.isArray(s) ? s : null; }
  catch { return null; }
};
const saveSchools = (list) => localStorage.setItem(SCHOOLS_KEY, JSON.stringify(list));

const getSession = () => {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!s || Date.now() > s.expiresAt) { localStorage.removeItem(SESSION_KEY); return null; }
    return s;
  } catch { return null; }
};
const setSession  = (e) => localStorage.setItem(SESSION_KEY, JSON.stringify({ email:e, expiresAt: Date.now()+SESSION_TTL }));
const clearSession = () => localStorage.removeItem(SESSION_KEY);

// ── LOGO ──────────────────────────────────────────────────────────────────────
const Logo = ({ size = 40, glow = false }) => (
  <img src="/logo.jpg" alt="Biológicas" width={size} height={size}
    style={{ borderRadius:"50%", objectFit:"cover", flexShrink:0,
      filter: glow ? "drop-shadow(0 0 16px rgba(124,255,79,.75))" : "drop-shadow(0 0 6px rgba(124,255,79,.25))",
      transition:"filter .4s" }} />
);

// ── PARTICLES ─────────────────────────────────────────────────────────────────
const Particles = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const mob  = window.innerWidth < 768;
    const N    = mob ? 24 : 50;
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight;
    const pts = Array.from({length:N}, () => ({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3,
      r:Math.random()*1.5+.4, a:Math.random()
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(124,255,79,${p.a*.36})`; ctx.fill();
      });
      if(!mob) {
        for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++) {
          const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.hypot(dx,dy);
          if(d<100){ ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
            ctx.strokeStyle=`rgba(124,255,79,${(1-d/100)*.1})`; ctx.stroke(); }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const rz = () => { W=c.width=window.innerWidth; H=c.height=window.innerHeight; };
    window.addEventListener("resize", rz);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", rz); };
  }, []);
  return <canvas ref={ref} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}} />;
};

// ── ANIMATED COUNTER ──────────────────────────────────────────────────────────
const useCounter = (target, dur=2000, run=false) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if(!run) return;
    let raf, t0;
    const step = ts => { if(!t0)t0=ts; const p=Math.min((ts-t0)/dur,1); setV(Math.floor(p*target)); if(p<1)raf=requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur, run]);
  return v;
};

// ── REVEAL ON SCROLL ──────────────────────────────────────────────────────────
const Reveal = ({ children, delay=0 }) => {
  const ref = useRef(); const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) setVis(true); }, {threshold:.07});
    if(ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity:vis?1:0, transform:vis?"none":"translateY(26px)",
      transition:`opacity .85s cubic-bezier(.16,1,.3,1) ${delay}s, transform .85s cubic-bezier(.16,1,.3,1) ${delay}s`
    }}>{children}</div>
  );
};

// ── GLOBAL CSS ────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
:root{
  --g:#7CFF4F;--g2:#4CAF50;--bg:#030303;
  --w:#f0f0f0;--m:rgba(240,240,240,.55);--dim:rgba(240,240,240,.28);
  --red:#FF6B5E;--blue:#A8C8FF;--gold:#FFD700;
  --fd:'Space Grotesk',system-ui,sans-serif;
  --fb:'Inter',system-ui,sans-serif;
  --fm:'DM Mono',monospace;
}
html{scroll-behavior:smooth;}
body{background:var(--bg);color:var(--w);font-family:var(--fb);overflow-x:hidden;-webkit-font-smoothing:antialiased;line-height:1.6;}

@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(124,255,79,.2);}50%{box-shadow:0 0 48px rgba(124,255,79,.55);}}
@keyframes shimmer{0%{background-position:-220% 0;}100%{background-position:220% 0;}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:none;}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes scaleIn{from{opacity:0;transform:scale(.95);}to{opacity:1;transform:scale(1);}}
@keyframes slideRight{from{opacity:0;transform:translateX(-14px);}to{opacity:1;transform:none;}}
@keyframes barFill{from{width:0}to{width:var(--w,100%)}}
@keyframes saved{0%{opacity:0;transform:scale(.8);}40%{opacity:1;transform:scale(1.08);}100%{opacity:0;transform:scale(1);}}

.fl{animation:float 5s ease-in-out infinite;}
.si{animation:scaleIn .5s cubic-bezier(.16,1,.3,1) both;}

.shimmer{
  background:linear-gradient(90deg,var(--g) 0%,#fff 44%,var(--g) 86%);
  background-size:220%;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;animation:shimmer 4s linear infinite;
}
.glass{
  background:rgba(255,255,255,.03);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border:1px solid rgba(124,255,79,.08);
}
.card{
  background:linear-gradient(145deg,rgba(11,93,59,.13),rgba(3,3,3,.72));
  border:1px solid rgba(124,255,79,.1);border-radius:18px;
  transition:transform .32s cubic-bezier(.16,1,.3,1),box-shadow .32s,border-color .32s;
}
.card:hover{transform:translateY(-3px);box-shadow:0 18px 52px rgba(124,255,79,.1);border-color:rgba(124,255,79,.24);}
.btn{
  display:inline-flex;align-items:center;justify-content:center;
  font-family:var(--fd);font-weight:600;font-size:15px;letter-spacing:-.15px;
  border:none;cursor:pointer;border-radius:100px;padding:14px 26px;
  transition:all .25s cubic-bezier(.16,1,.3,1);user-select:none;-webkit-user-select:none;
  min-height:50px;white-space:nowrap;
}
.btn-g{background:var(--g);color:#030303;box-shadow:0 0 28px rgba(124,255,79,.38),0 4px 14px rgba(0,0,0,.28);}
.btn-g:hover,.btn-g:active{background:#96ff66;box-shadow:0 0 52px rgba(124,255,79,.65);transform:translateY(-2px);}
.btn-o{background:transparent;color:var(--g);border:1.5px solid rgba(124,255,79,.32);}
.btn-o:hover,.btn-o:active{background:rgba(124,255,79,.08);border-color:var(--g);}
.btn-sm{padding:10px 18px;font-size:13px;min-height:40px;}
.btn-danger{background:rgba(255,107,94,.1);color:var(--red);border:1.5px solid rgba(255,107,94,.24);}
.btn-danger:hover{background:rgba(255,107,94,.18);}

.nav-item{font-family:var(--fb);font-size:14px;font-weight:450;color:var(--m);cursor:pointer;padding:5px 2px;border-bottom:2px solid transparent;transition:color .2s,border-color .2s;}
.nav-item:hover{color:var(--w);}
.nav-item.on{color:var(--w);border-bottom-color:var(--g);}

.mob-menu{position:fixed;inset:0;z-index:990;background:rgba(3,3,3,.97);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);display:flex;flex-direction:column;animation:fadeIn .18s ease;}
.mob-item{font-family:var(--fd);font-size:26px;font-weight:600;color:var(--m);cursor:pointer;padding:18px 24px;border-bottom:1px solid rgba(255,255,255,.04);transition:color .2s,background .2s;letter-spacing:-.4px;}
.mob-item:hover,.mob-item:active{color:var(--g);background:rgba(124,255,79,.04);}
.mob-item.on{color:var(--g);}

.inp{background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:var(--w);border-radius:14px;padding:14px 16px;font-family:var(--fb);font-size:15px;outline:none;width:100%;transition:border .2s,box-shadow .2s;min-height:50px;}
.inp:focus{border-color:rgba(124,255,79,.5);box-shadow:0 0 20px rgba(124,255,79,.12);}
.inp::placeholder{color:var(--dim);font-size:14px;}

table{width:100%;border-collapse:collapse;}
th{font-family:var(--fm);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(124,255,79,.65);padding:13px 14px;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);font-weight:500;}
td{padding:13px 14px;border-bottom:1px solid rgba(255,255,255,.04);font-size:13px;color:rgba(240,240,240,.8);}
tr:last-child td{border-bottom:none;}
tr:hover td{background:rgba(124,255,79,.025);}

.m1{background:linear-gradient(135deg,#FFD700,#F59E0B);box-shadow:0 0 20px rgba(255,215,0,.38);}
.m2{background:linear-gradient(135deg,#E2E8F0,#94A3B8);box-shadow:0 0 14px rgba(226,232,240,.28);}
.m3{background:linear-gradient(135deg,#CD7F32,#92400E);box-shadow:0 0 14px rgba(205,127,50,.28);}
.mn{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);}

::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(124,255,79,.2);border-radius:4px;}

.rbar{height:4px;border-radius:4px;background:linear-gradient(90deg,var(--g),var(--g2));width:var(--w);box-shadow:0 0 10px rgba(124,255,79,.5);animation:barFill 1.4s cubic-bezier(.16,1,.3,1) both;}
.ey{font-family:var(--fm);font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--g);opacity:.78;display:block;}
.sc{padding:24px 20px;border-radius:18px;transition:border-color .3s,box-shadow .3s;}
.sc:hover{border-color:rgba(124,255,79,.28)!important;box-shadow:0 10px 38px rgba(124,255,79,.1);}
.sb{width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid transparent;background:transparent;color:var(--m);font-family:var(--fb);font-size:14px;font-weight:500;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px;transition:all .2s;min-height:46px;}
.sb:hover{color:var(--w);background:rgba(255,255,255,.04);}
.sb.on{color:var(--g);background:rgba(124,255,79,.08);border-color:rgba(124,255,79,.2);}
.bg-g{background:rgba(124,255,79,.12);color:var(--g);padding:3px 10px;border-radius:100px;font-size:11px;font-weight:500;font-family:var(--fb);}
.toast{position:fixed;bottom:24px;right:20px;z-index:9999;background:var(--g);color:#030303;font-family:var(--fd);font-weight:700;font-size:13px;padding:12px 20px;border-radius:100px;box-shadow:0 0 28px rgba(124,255,79,.5);animation:saved 2.4s ease forwards;}

@media(max-width:640px){
  .hm{display:none!important;}
  .full{width:100%!important;}
  .g1{grid-template-columns:1fr!important;}
}
@media(min-width:641px){.hd{display:none!important;}}
`;

// ═══════════════════════════════════════════════════════════════════════════
// LOADING
// ═══════════════════════════════════════════════════════════════════════════
const Loading = ({ onDone }) => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setPct(p => { if(p>=100){clearInterval(iv);setTimeout(onDone,320);return 100;} return p+2; }), 24);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{position:"fixed",inset:0,background:"#030303",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:26}}>
      <div className="fl"><Logo size={84} glow /></div>
      <div style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:28,letterSpacing:-1,color:"var(--g)"}}>Biológicas</div>
      <div style={{width:200,height:2,background:"rgba(255,255,255,.07)",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,var(--g),#0B5D3B)",transition:"width .04s",boxShadow:"0 0 14px rgba(124,255,79,.7)"}} />
      </div>
      <span style={{fontFamily:"var(--fm)",fontSize:11,letterSpacing:2,color:"rgba(124,255,79,.38)"}}>{pct<100?`${pct}%`:"Pronto"}</span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════════════════
const Toast = ({ msg, onHide }) => {
  useEffect(() => { const t = setTimeout(onHide, 2400); return () => clearTimeout(t); }, []);
  return <div className="toast">✓ {msg}</div>;
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════════════════════════
const Navbar = ({ page, nav, isAdmin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const h=()=>setScrolled(window.scrollY>20); window.addEventListener("scroll",h); return ()=>window.removeEventListener("scroll",h); }, []);
  useEffect(() => { document.body.style.overflow=open?"hidden":""; return ()=>{document.body.style.overflow="";} }, [open]);

  const links = [["home","Início"],["about","Projeto"],["ranking","Ranking"],["impact","Impacto"]];
  const go = id => { setOpen(false); nav(id); };

  return (
    <>
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:1000,height:62,padding:"0 18px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        background:scrolled||open?"rgba(3,3,3,.94)":"transparent",
        backdropFilter:scrolled||open?"blur(28px) saturate(160%)":"none",
        WebkitBackdropFilter:scrolled||open?"blur(28px) saturate(160%)":"none",
        borderBottom:scrolled?"1px solid rgba(255,255,255,.05)":"none",
        transition:"background .4s,backdrop-filter .4s,border .4s"
      }}>
        <div onClick={()=>go("home")} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",zIndex:1001}}>
          <Logo size={30} glow={scrolled} />
          <span style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:17,letterSpacing:-.4,color:"var(--g)"}}>Biológicas</span>
        </div>
        <div className="hm" style={{display:"flex",gap:28,alignItems:"center"}}>
          {links.map(([id,label]) => (
            <span key={id} className={`nav-item ${page===id?"on":""}`} onClick={()=>go(id)}>{label}</span>
          ))}
          <button className="btn btn-o btn-sm" onClick={()=>go("admin")}>
            {isAdmin?"⚙ Painel":"🔐 Admin"}
          </button>
        </div>
        <button className="hd" onClick={()=>setOpen(o=>!o)} style={{background:"none",border:"none",cursor:"pointer",padding:8,zIndex:1001,display:"flex",flexDirection:"column",gap:5,alignItems:"center",justifyContent:"center",width:42,height:42}}>
          {[0,1,2].map(i=>(
            <span key={i} style={{
              display:"block",width:24,height:2,background:open?"var(--g)":"var(--w)",borderRadius:2,
              transition:"all .28s cubic-bezier(.16,1,.3,1)",
              transform:i===0&&open?"rotate(45deg) translateY(7px)":i===2&&open?"rotate(-45deg) translateY(-7px)":"none",
              opacity:i===1&&open?0:1
            }}/>
          ))}
        </button>
      </nav>
      {open && (
        <div className="mob-menu">
          <div style={{paddingTop:78}}>
            {links.map(([id,label],i)=>(
              <div key={id} className={`mob-item ${page===id?"on":""}`} onClick={()=>go(id)}
                style={{animation:`fadeUp .4s cubic-bezier(.16,1,.3,1) ${i*.06}s both`}}>{label}</div>
            ))}
            <div style={{padding:"28px 22px"}}>
              <button className="btn btn-g full" onClick={()=>go("admin")} style={{fontSize:16}}>
                {isAdmin?"⚙ Painel Administrativo":"🔐 Área do Administrador"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// HOME  — stats derived from schools prop
// ═══════════════════════════════════════════════════════════════════════════
const HomePage = ({ nav, schools }) => {
  const [ready, setReady] = useState(false);
  const sRef = useRef(); const [sv, setSv] = useState(false);

  const totalLiters  = schools.reduce((a,s)=>a+s.liters, 0);
  const schoolCount  = schools.length;

  const cL = useCounter(totalLiters, 2400, sv);
  const cS = useCounter(schoolCount, 1800, sv);
  const cC = useCounter(CITIES_COUNT, 1400, sv);

  useEffect(() => {
    setTimeout(()=>setReady(true), 60);
    const obs = new IntersectionObserver(([e])=>{if(e.isIntersecting)setSv(true);},{threshold:.18});
    if(sRef.current) obs.observe(sRef.current);
    return ()=>obs.disconnect();
  }, []);

  return (
    <div>
      {/* HERO */}
      <section style={{minHeight:"100svh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 18px 60px",position:"relative",overflow:"hidden",textAlign:"center"}}>
        <div style={{position:"absolute",top:"38%",left:"50%",transform:"translate(-50%,-50%)",width:"min(680px,160vw)",height:"min(680px,160vw)",background:"radial-gradient(circle,rgba(124,255,79,.065) 0%,transparent 68%)",pointerEvents:"none"}} />
        <div style={{maxWidth:740,position:"relative",zIndex:1}}>
          <div className="fl" style={{display:"inline-block",marginBottom:28}}><Logo size={96} glow /></div>
          <span className="ey" style={{marginBottom:18,opacity:ready?.78:0,transition:"opacity 1s ease .1s"}}>Competição Escolar de Reciclagem</span>
          <h1 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:"clamp(46px,13vw,96px)",lineHeight:.95,letterSpacing:"-3px",marginBottom:22,opacity:ready?1:0,transform:ready?"none":"translateY(22px)",transition:"all 1s cubic-bezier(.16,1,.3,1) .2s"}}>
            <span className="shimmer">Biológicas</span>
          </h1>
          <p style={{fontFamily:"var(--fb)",fontSize:"clamp(14px,3.8vw,17px)",color:"var(--m)",lineHeight:1.8,maxWidth:480,margin:"0 auto 32px",opacity:ready?1:0,transform:ready?"none":"translateY(14px)",transition:"all 1s cubic-bezier(.16,1,.3,1) .35s"}}>
            Juntos, transformamos óleo descartado em energia e futuro. Cada gota coletada protege rios, lençóis freáticos e vidas.
          </p>
          <div style={{background:"linear-gradient(135deg,rgba(255,107,94,.1),rgba(255,107,94,.04))",border:"1px solid rgba(255,107,94,.2)",borderRadius:14,padding:"14px 20px",maxWidth:480,margin:"0 auto 36px",opacity:ready?1:0,transition:"all 1s ease .48s"}}>
            <p style={{fontSize:13,color:"rgba(255,107,94,.82)",fontStyle:"italic",lineHeight:1.65}}>"1 litro de óleo pode contaminar até 1 milhão de litros de água potável."</p>
          </div>
          <div style={{display:"flex",gap:11,justifyContent:"center",flexWrap:"wrap",padding:"0 12px",opacity:ready?1:0,transition:"all 1s ease .6s"}}>
            <button className="btn btn-g" onClick={()=>nav("ranking")}>Ver Ranking ↗</button>
            <button className="btn btn-o" onClick={()=>nav("about")}>Saiba Mais</button>
          </div>
        </div>
        <div style={{position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:7,opacity:.28}}>
          <div style={{width:1,height:30,background:"linear-gradient(var(--g),transparent)",animation:"float 1.9s ease-in-out infinite"}} />
          <span style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:3,color:"var(--g)"}}>SCROLL</span>
        </div>
      </section>

      {/* STATS */}
      <section ref={sRef} style={{padding:"52px 18px",maxWidth:960,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14}}>
          {[
            {v:cL, s:" L",       label:"Óleo coletado",  icon:"🫙", c:"var(--g)"},
            {v:cS, s:" escolas", label:"Participantes",   icon:"🏫", c:"var(--blue)"},
            {v:cC, s:" cidades", label:"Municípios",      icon:"🌍", c:"var(--red)"},
          ].map((s,i)=>(
            <Reveal key={i} delay={i*.1}>
              <div className="card sc">
                <div style={{fontSize:28,marginBottom:12}}>{s.icon}</div>
                <div style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:"clamp(30px,8vw,46px)",color:s.c,lineHeight:1,letterSpacing:-2}}>
                  {s.v.toLocaleString("pt-BR")}{s.s}
                </div>
                <div style={{color:"var(--m)",fontSize:13,marginTop:8}}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* MINI ABOUT */}
      <section style={{padding:"36px 18px 72px",maxWidth:960,margin:"0 auto"}}>
        <Reveal>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:36,alignItems:"center"}}>
            <div>
              <span className="ey" style={{marginBottom:14}}>Nossa Missão</span>
              <h2 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:"clamp(24px,6vw,42px)",letterSpacing:-1.5,lineHeight:1.1,marginBottom:18}}>
                Ciência + Educação + <span style={{color:"var(--g)"}}>Planeta</span>
              </h2>
              <p style={{color:"var(--m)",lineHeight:1.8,fontSize:14,marginBottom:26}}>
                O Biológicas une escolas do município em uma competição ecológica que desperta consciência ambiental e promove a reciclagem de óleo de cozinha.
              </p>
              <button className="btn btn-g" onClick={()=>nav("about")}>Conheça o Projeto</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
              {[
                {i:"♻️",t:"Reciclagem",d:"Óleo vira biodiesel e sabão"},
                {i:"💧",t:"Água limpa",d:"Protegemos rios e lençóis"},
                {i:"🔬",t:"Ciência",d:"Aprendizado prático"},
                {i:"🏆",t:"Competição",d:"Gamificação motivadora"},
              ].map((c,i)=>(
                <div key={i} className="glass card" style={{borderRadius:14,padding:16}}>
                  <div style={{fontSize:22,marginBottom:8}}>{c.i}</div>
                  <div style={{fontFamily:"var(--fd)",fontWeight:600,fontSize:13,color:"var(--g)",marginBottom:4}}>{c.t}</div>
                  <div style={{color:"var(--m)",fontSize:11,lineHeight:1.5}}>{c.d}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ABOUT
// ═══════════════════════════════════════════════════════════════════════════
const AboutPage = () => (
  <div style={{paddingTop:78,minHeight:"100svh"}}>
    <div style={{maxWidth:820,margin:"0 auto",padding:"20px 18px 72px"}}>
      <Reveal>
        <div style={{textAlign:"center",marginBottom:52}}>
          <span className="ey" style={{marginBottom:14}}>Sobre o Projeto</span>
          <h1 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:"clamp(30px,9vw,58px)",letterSpacing:-2,lineHeight:1}}>
            <span className="shimmer">Por Que Reciclar?</span>
          </h1>
        </div>
      </Reveal>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {[
          {icon:"🌊",title:"O Problema do Óleo",color:"var(--red)",text:"O óleo de cozinha descartado incorretamente no ralo entope tubulações, contamina rios e mata a biodiversidade aquática. Um único litro pode criar uma película impermeável de 1 km² na superfície da água, impedindo a oxigenação necessária para a vida marinha."},
          {icon:"🔋",title:"A Solução: Reciclagem",color:"var(--g)",text:"O óleo coletado é transformado em biodiesel renovável, sabão ecológico e outros insumos industriais. Além de evitar a poluição, gera renda para comunidades e reduz a emissão de gases do efeito estufa em comparação com combustíveis fósseis."},
          {icon:"🏫",title:"O Papel das Escolas",color:"var(--blue)",text:"As escolas são agentes de transformação. Ao engajar alunos, famílias e comunidades na coleta, criamos uma rede de consciência ambiental. A competição saudável acelera a mudança de comportamento e cria hábitos que duram para sempre."},
        ].map((item,i)=>(
          <Reveal key={i} delay={i*.1}>
            <div className="glass card" style={{borderRadius:18,padding:"24px 20px",display:"flex",gap:18,alignItems:"flex-start"}}>
              <div style={{fontSize:38,flexShrink:0}}>{item.icon}</div>
              <div>
                <h3 style={{fontFamily:"var(--fd)",fontWeight:600,fontSize:"clamp(16px,4vw,20px)",color:item.color,marginBottom:9,letterSpacing:-.3}}>{item.title}</h3>
                <p style={{color:"var(--m)",lineHeight:1.8,fontSize:14}}>{item.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={.25}>
        <div style={{marginTop:52}}>
          <span className="ey" style={{marginBottom:34,display:"block",textAlign:"center"}}>Como Funciona</span>
          <div style={{display:"flex",flexDirection:"column",gap:0,position:"relative"}}>
            <div style={{position:"absolute",left:25,top:0,bottom:0,width:1,background:"linear-gradient(rgba(124,255,79,.38),transparent)"}} />
            {[
              {n:"01",t:"Coleta em Casa",d:"Cada aluno recolhe o óleo usado da família em garrafas PET."},
              {n:"02",t:"Entrega na Escola",d:"O óleo é entregue nos pontos de coleta durante a campanha."},
              {n:"03",t:"Pesagem e Registro",d:"A equipe registra o volume coletado por turma e escola."},
              {n:"04",t:"Pontuação no Sistema",d:"Os pontos são calculados e o ranking atualizado em tempo real."},
              {n:"05",t:"Premiação",d:"As melhores escolas recebem troféus, certificados e brindes sustentáveis."},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:20,alignItems:"flex-start",paddingBottom:28}}>
                <div style={{width:50,height:50,borderRadius:"50%",flexShrink:0,zIndex:1,background:"linear-gradient(135deg,var(--g),var(--g2))",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--fm)",fontWeight:500,fontSize:11,color:"#030303",boxShadow:"0 0 20px rgba(124,255,79,.4)"}}>{s.n}</div>
                <div style={{paddingTop:11}}>
                  <div style={{fontFamily:"var(--fd)",fontWeight:600,fontSize:15,marginBottom:4}}>{s.t}</div>
                  <div style={{color:"var(--m)",fontSize:13,lineHeight:1.65}}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// RANKING — público, pontos apenas (sem litros)
// ═══════════════════════════════════════════════════════════════════════════
const RankingPage = ({ schools }) => {
  // sort by points desc
  const ranked = [...schools]
    .sort((a,b) => b.liters - a.liters)
    .map((s,i) => ({ ...s, points: s.liters * PTS_PER_LITER, rank: i+1 }));

  const maxPts = ranked[0]?.points || 1;
  const medals = ["m1","m2","m3"];
  const emoji  = ["🥇","🥈","🥉"];

  return (
    <div style={{paddingTop:78,minHeight:"100svh"}}>
      <div style={{maxWidth:720,margin:"0 auto",padding:"20px 16px 72px"}}>
        <Reveal>
          <div style={{textAlign:"center",marginBottom:44}}>
            <span className="ey" style={{marginBottom:14}}>Classificação Geral</span>
            <h1 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:"clamp(28px,9vw,56px)",letterSpacing:-2,lineHeight:1}}>
              <span className="shimmer">Ranking das Escolas</span>
            </h1>
            <p style={{color:"var(--m)",marginTop:12,fontSize:13}}>
              Atualizado em tempo real
            </p>
          </div>
        </Reveal>

        {/* Podium top 3 */}
        {ranked.length >= 3 && (
          <Reveal delay={.1}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:24}}>
              {ranked.slice(0,3).map((s,i)=>(
                <div key={s.id} className={medals[i]} style={{
                  borderRadius:16,padding:"20px 10px",textAlign:"center",
                  border:"1px solid rgba(255,255,255,.16)",
                  transform:i===0?"scale(1.04)":"scale(.97)",
                  order:i===0?2:i===1?1:3,
                  animation:i===0?"glowPulse 3.5s infinite":"none"
                }}>
                  <div style={{fontSize:28,marginBottom:5}}>{emoji[i]}</div>
                  <div style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:22,color:"#030303",lineHeight:1}}>#{s.rank}</div>
                  <div style={{fontSize:10,fontWeight:600,color:"rgba(3,3,3,.68)",margin:"8px 0 6px",lineHeight:1.4}}>{s.name}</div>
                  <div style={{fontFamily:"var(--fm)",fontWeight:500,fontSize:16,color:"#030303"}}>
                    {s.points.toLocaleString("pt-BR")} <span style={{fontSize:9}}>pts</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* Full list */}
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {ranked.map((s,i)=>(
            <Reveal key={s.id} delay={i*.05}>
              <div className="glass card" style={{borderRadius:13,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:9}}>
                  <div className={i<3?medals[i]:"mn"} style={{width:36,height:36,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--fd)",fontWeight:700,fontSize:12,color:i<3?"#030303":"var(--m)"}}>
                    {i<3?emoji[i]:`#${s.rank}`}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"var(--fd)",fontWeight:600,fontSize:13,letterSpacing:-.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:18,color:i<3?"var(--g)":"var(--w)",letterSpacing:-1}}>
                      {s.points.toLocaleString("pt-BR")}
                    </div>
                    <div style={{color:"var(--dim)",fontSize:10}}>pontos</div>
                  </div>
                </div>
                <div style={{height:4,background:"rgba(255,255,255,.05)",borderRadius:4,overflow:"hidden"}}>
                  <div className="rbar" style={{"--w":`${(s.points/maxPts)*100}%`}} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {ranked.length === 0 && (
          <div style={{textAlign:"center",color:"var(--m)",padding:"60px 0",fontSize:14}}>
            Nenhuma escola cadastrada ainda.
          </div>
        )}

        <Reveal delay={.4}>
          <p style={{textAlign:"center",marginTop:24,color:"var(--dim)",fontSize:11,fontFamily:"var(--fm)",letterSpacing:.4}}>
            Litros coletados visíveis apenas para administradores
          </p>
        </Reveal>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// IMPACT
// ═══════════════════════════════════════════════════════════════════════════
const ImpactPage = ({ nav }) => {
  const barRef = useRef(); const [bv, setBv] = useState(false);
  useEffect(()=>{
    const obs = new IntersectionObserver(([e])=>{if(e.isIntersecting)setBv(true);},{threshold:.12});
    if(barRef.current) obs.observe(barRef.current);
    return ()=>obs.disconnect();
  },[]);
  const bars=[
    {label:"Biodiesel",pct:78,color:"var(--g)"},
    {label:"Sabão Artesanal",pct:52,color:"var(--blue)"},
    {label:"Ração Animal",pct:34,color:"var(--gold)"},
    {label:"Tinta & Verniz",pct:18,color:"var(--red)"},
  ];
  const facts=[
    {icon:"💧",stat:"1.000.000 L",label:"de água contaminada por 1L de óleo"},
    {icon:"🐟",stat:"20 km²",label:"de área afetada por tonelada de óleo"},
    {icon:"⚡",stat:"2,5 L",label:"de biodiesel por quilo de óleo"},
    {icon:"🌿",stat:"60%",label:"menos CO₂ vs combustível fóssil"},
    {icon:"🏭",stat:"45 L",label:"= 1 mês de energia doméstica"},
    {icon:"🧼",stat:"900g",label:"de sabão por litro reciclado"},
  ];
  return (
    <div style={{paddingTop:78,minHeight:"100svh"}}>
      <div style={{maxWidth:840,margin:"0 auto",padding:"20px 16px 72px"}}>
        <Reveal>
          <div style={{textAlign:"center",marginBottom:50}}>
            <span className="ey" style={{marginBottom:14}}>Dados Científicos</span>
            <h1 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:"clamp(28px,9vw,56px)",letterSpacing:-2,lineHeight:1}}><span className="shimmer">Impacto Ambiental</span></h1>
          </div>
        </Reveal>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:11,marginBottom:42}}>
          {facts.map((f,i)=>(
            <Reveal key={i} delay={i*.06}>
              <div className="glass card" style={{borderRadius:16,padding:"20px 14px",textAlign:"center"}}>
                <div style={{fontSize:28,marginBottom:9}}>{f.icon}</div>
                <div style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:"clamp(14px,4vw,20px)",color:"var(--g)",marginBottom:7,lineHeight:1.1,letterSpacing:-.4}}>{f.stat}</div>
                <div style={{color:"var(--m)",fontSize:11,lineHeight:1.5}}>{f.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={.2}>
          <div className="glass" style={{borderRadius:18,padding:"28px 22px"}}>
            <span className="ey" style={{marginBottom:26}}>Destino do Óleo Reciclado</span>
            <div ref={barRef} style={{display:"flex",flexDirection:"column",gap:20}}>
              {bars.map((b,i)=>(
                <div key={i}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                    <span style={{fontFamily:"var(--fb)",fontSize:13,fontWeight:500}}>{b.label}</span>
                    <span style={{fontFamily:"var(--fm)",color:b.color,fontSize:13}}>{b.pct}%</span>
                  </div>
                  <div style={{height:6,background:"rgba(255,255,255,.05)",borderRadius:6,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:6,background:`linear-gradient(90deg,${b.color},${b.color}55)`,width:bv?`${b.pct}%`:"0%",transition:`width 1.4s cubic-bezier(.16,1,.3,1) ${i*.12}s`,boxShadow:`0 0 12px ${b.color}44`}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={.3}>
          <div style={{marginTop:44,textAlign:"center",padding:"44px 22px",background:"linear-gradient(135deg,rgba(11,93,59,.22),rgba(124,255,79,.04))",border:"1px solid rgba(124,255,79,.14)",borderRadius:22}}>
            <div className="fl" style={{display:"inline-block",marginBottom:18}}><Logo size={60} glow /></div>
            <h2 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:"clamp(20px,5vw,28px)",letterSpacing:-1,margin:"0 0 12px"}}>Faça Parte da Mudança</h2>
            <p style={{color:"var(--m)",lineHeight:1.75,maxWidth:400,margin:"0 auto 26px",fontSize:14}}>Convide sua escola a participar. Cada litro coletado é um passo em direção a um planeta mais limpo.</p>
            <button className="btn btn-g">Inscrever Minha Escola</button>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN LOGIN
// ═══════════════════════════════════════════════════════════════════════════
const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow]   = useState(false);

  const login = async () => {
    setError("");
    if(!email.trim()||!pass){setError("Preencha todos os campos.");return;}
    setLoading(true);
    try {
      const hash = await sha256(pass);
      if(email.toLowerCase().trim()===ADMIN_EMAIL && hash===ADMIN_HASH){ setSession(email); onLogin(); }
      else setError("E-mail ou senha incorretos.");
    } catch { setError("Erro ao autenticar."); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100svh",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 16px",background:"var(--bg)",position:"relative"}}>
      <div style={{position:"absolute",top:"35%",left:"50%",transform:"translate(-50%,-50%)",width:"min(560px,160vw)",height:"min(560px,160vw)",background:"radial-gradient(circle,rgba(124,255,79,.05) 0%,transparent 70%)",pointerEvents:"none"}} />
      <div className="glass si" style={{width:"100%",maxWidth:390,borderRadius:24,padding:"clamp(24px,6vw,44px) clamp(18px,5vw,36px)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div className="fl" style={{display:"inline-block",marginBottom:14}}><Logo size={58} glow /></div>
          <h1 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:22,letterSpacing:-.7,marginBottom:5}}>Área Admin</h1>
          <p style={{color:"var(--m)",fontSize:13}}>Acesso exclusivo para administradores</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label className="ey" style={{marginBottom:9,fontSize:10}}>E-mail</label>
            <input className="inp" type="email" placeholder="admin@biologicas.edu.br" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} autoComplete="email" inputMode="email" />
          </div>
          <div>
            <label className="ey" style={{marginBottom:9,fontSize:10}}>Senha</label>
            <div style={{position:"relative"}}>
              <input className="inp" type={show?"text":"password"} placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} autoComplete="current-password" style={{paddingRight:48}} />
              <button onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--m)",fontSize:17,padding:4}}>{show?"🙈":"👁"}</button>
            </div>
          </div>
          {error && <div style={{background:"rgba(255,107,94,.1)",border:"1px solid rgba(255,107,94,.24)",borderRadius:11,padding:"11px 14px",color:"var(--red)",fontSize:13}}>{error}</div>}
          <button className="btn btn-g" style={{width:"100%",marginTop:4,opacity:loading?.7:1}} onClick={login} disabled={loading}>
            {loading?"Verificando...":"Entrar →"}
          </button>
        </div>
        <p style={{textAlign:"center",marginTop:20,color:"var(--dim)",fontSize:11,fontFamily:"var(--fm)"}}>🔒 Senha criptografada SHA-256</p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD — recebe schools + setSchools do root
// ═══════════════════════════════════════════════════════════════════════════
const AdminDashboard = ({ onLogout, schools, setSchools }) => {
  const [tab, setTab]     = useState("overview");
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState("");

  // Add form
  const [newName, setNewName]     = useState("");
  const [newLiters, setNewLiters] = useState("");
  // Inline edit
  const [editId, setEditId]     = useState(null);
  const [editLiters, setEditLiters] = useState("");
  const [editName, setEditName] = useState("");

  const sorted = [...schools].sort((a,b)=>b.liters-a.liters);
  const total  = schools.reduce((a,s)=>a+s.liters, 0);

  const notify = (msg) => setToast(msg);

  const addSchool = () => {
    const name = newName.trim();
    const liters = parseFloat(newLiters);
    if(!name){ notify("⚠ Digite o nome da escola"); return; }
    if(isNaN(liters)||liters<0){ notify("⚠ Litros inválidos"); return; }
    const updated = [...schools, {id:Date.now(), name, liters, status:"Ativo"}];
    setSchools(updated); saveSchools(updated);
    setNewName(""); setNewLiters("");
    notify(`Escola "${name}" adicionada!`);
  };

  const removeSchool = (id) => {
    const updated = schools.filter(s=>s.id!==id);
    setSchools(updated); saveSchools(updated);
    notify("Escola removida.");
  };

  const startEdit = (s) => { setEditId(s.id); setEditLiters(String(s.liters)); setEditName(s.name); };
  const cancelEdit = () => { setEditId(null); setEditLiters(""); setEditName(""); };

  const saveEdit = (id) => {
    const liters = parseFloat(editLiters);
    const name   = editName.trim();
    if(!name||isNaN(liters)||liters<0){ notify("⚠ Valores inválidos"); return; }
    const updated = schools.map(s => s.id===id ? {...s, name, liters} : s);
    setSchools(updated); saveSchools(updated);
    cancelEdit();
    notify("Dados salvos com sucesso!");
  };

  const tabs = [
    {id:"overview",label:"Visão Geral",icon:"◈"},
    {id:"schools", label:"Escolas",    icon:"⊟"},
    {id:"history", label:"Histórico",  icon:"◷"},
    {id:"stats",   label:"Estatísticas",icon:"◎"},
  ];

  const Sidebar = ({onClose}) => (
    <div style={{display:"flex",flexDirection:"column",gap:4,height:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:28,paddingLeft:2}}>
        <Logo size={26} glow />
        <span style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:15,letterSpacing:-.3,color:"var(--g)"}}>Admin</span>
      </div>
      {tabs.map(t=>(
        <button key={t.id} className={`sb ${tab===t.id?"on":""}`} onClick={()=>{setTab(t.id);onClose?.();}}>
          <span style={{fontSize:14,opacity:.7}}>{t.icon}</span> {t.label}
        </button>
      ))}
      <div style={{flex:1}} />
      <div style={{paddingLeft:2}}>
        <p style={{color:"var(--dim)",fontSize:10,marginBottom:8,fontFamily:"var(--fm)"}}>Sessão ativa · 24h</p>
        <button className="btn btn-o btn-sm" style={{width:"100%"}} onClick={()=>{clearSession();onLogout();}}>Sair</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100svh",display:"flex",background:"var(--bg)"}}>
      {toast && <Toast msg={toast} onHide={()=>setToast("")} />}

      {/* Desktop sidebar */}
      <aside className="hm" style={{width:200,flexShrink:0,background:"rgba(255,255,255,.018)",borderRight:"1px solid rgba(255,255,255,.05)",padding:"26px 13px",position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
        <Sidebar />
      </aside>

      {/* Mobile top bar */}
      <div className="hd" style={{position:"fixed",top:0,left:0,right:0,zIndex:900,height:54,padding:"0 14px",background:"rgba(3,3,3,.96)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Logo size={24} glow />
          <span style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:15,color:"var(--g)"}}>Admin</span>
        </div>
        <button className="btn btn-o btn-sm" onClick={()=>setDrawer(true)} style={{fontSize:12}}>☰ Menu</button>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(3,3,3,.97)",backdropFilter:"blur(24px)",padding:"22px 18px",display:"flex",flexDirection:"column",animation:"fadeIn .2s ease"}}>
          <button onClick={()=>setDrawer(false)} style={{alignSelf:"flex-end",background:"none",border:"none",color:"var(--m)",fontSize:26,cursor:"pointer",marginBottom:14}}>✕</button>
          <Sidebar onClose={()=>setDrawer(false)} />
        </div>
      )}

      {/* Content */}
      <main style={{flex:1,padding:"clamp(66px,10vw,40px) clamp(14px,4vw,36px) 36px",overflowY:"auto"}}>

        {/* ── OVERVIEW ── */}
        {tab==="overview" && (
          <div className="si">
            <div style={{marginBottom:28}}>
              <span className="ey" style={{marginBottom:8}}>Painel de Controle</span>
              <h1 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:"clamp(22px,6vw,32px)",letterSpacing:-1}}>Visão Geral</h1>
              <p style={{color:"var(--m)",fontSize:13,marginTop:5}}>Campanha Biológicas 2025 — dados internos</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:24}}>
              {[
                {label:"Total de Litros",val:`${total.toLocaleString("pt-BR")} L`,icon:"🫙",c:"var(--g)"},
                {label:"Escolas Ativas",val:schools.filter(s=>s.status==="Ativo").length,icon:"🏫",c:"var(--blue)"},
                {label:"Total de Pontos",val:(total*PTS_PER_LITER).toLocaleString("pt-BR"),icon:"⭐",c:"var(--gold)"},
                {label:"Municípios",val:CITIES_COUNT,icon:"🌍",c:"var(--red)"},
              ].map((c,i)=>(
                <div key={i} className="card sc" style={{padding:"20px 16px"}}>
                  <div style={{fontSize:24,marginBottom:10}}>{c.icon}</div>
                  <div style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:"clamp(16px,5vw,22px)",color:c.c,letterSpacing:-1,lineHeight:1.1}}>{c.val}</div>
                  <div style={{color:"var(--m)",fontSize:11,marginTop:5}}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Conversion info */}
            <div style={{background:"rgba(124,255,79,.05)",border:"1px solid rgba(124,255,79,.15)",borderRadius:14,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:22}}>⚙️</span>
              <div>
                <div style={{fontFamily:"var(--fd)",fontWeight:600,fontSize:13,color:"var(--g)"}}>Fórmula de Pontos</div>
                <div style={{color:"var(--m)",fontSize:12,marginTop:2}}>1 litro = {PTS_PER_LITER} pontos · os litros reais são visíveis apenas aqui</div>
              </div>
            </div>

            <div className="glass" style={{borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:"16px 18px 12px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                <span className="ey" style={{fontSize:10}}>Ranking Interno — Litros Reais</span>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{minWidth:360}}>
                  <thead><tr><th>#</th><th>Escola</th><th>Litros</th><th>Pontos</th><th>%</th></tr></thead>
                  <tbody>
                    {sorted.map((s,i)=>(
                      <tr key={s.id}>
                        <td style={{fontFamily:"var(--fm)",color:"var(--g)",width:32}}>#{i+1}</td>
                        <td style={{fontWeight:500,fontSize:12}}>{s.name}</td>
                        <td><span style={{fontFamily:"var(--fm)",color:"var(--g)"}}>{s.liters} L</span></td>
                        <td><span style={{fontFamily:"var(--fm)",color:"var(--gold)",fontSize:12}}>{(s.liters*PTS_PER_LITER).toLocaleString("pt-BR")}</span></td>
                        <td style={{fontFamily:"var(--fm)",color:"var(--m)",fontSize:11}}>{total>0?Math.round((s.liters/total)*100):0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── SCHOOLS ── */}
        {tab==="schools" && (
          <div className="si">
            <div style={{marginBottom:24}}>
              <span className="ey" style={{marginBottom:8}}>Gestão</span>
              <h1 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:"clamp(20px,6vw,30px)",letterSpacing:-1}}>Gerenciar Escolas</h1>
              <p style={{color:"var(--m)",fontSize:13,marginTop:4}}>Alterações salvam automaticamente.</p>
            </div>

            {/* ADD SCHOOL FORM */}
            <div className="glass" style={{borderRadius:18,padding:"22px 18px",marginBottom:18,border:"1px solid rgba(124,255,79,.15)"}}>
              <span className="ey" style={{fontSize:10,marginBottom:14}}>Adicionar Nova Escola</span>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <input className="inp" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nome completo da escola..." onKeyDown={e=>e.key==="Enter"&&addSchool()} />
                <div style={{display:"flex",gap:10,alignItems:"stretch"}}>
                  <input className="inp" type="number" value={newLiters} onChange={e=>setNewLiters(e.target.value)} placeholder="Litros coletados" min="0" step="0.1" onKeyDown={e=>e.key==="Enter"&&addSchool()} style={{flex:1}} />
                  <button className="btn btn-g" style={{padding:"14px 22px",fontSize:14,flexShrink:0}} onClick={addSchool}>
                    + Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* SCHOOLS LIST */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {sorted.map((s,i)=>(
                <div key={s.id} className="glass" style={{borderRadius:14,border:"1px solid rgba(255,255,255,.06)",overflow:"hidden"}}>
                  {editId===s.id ? (
                    /* EDIT MODE */
                    <div style={{padding:"18px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                        <div className={i<3?["m1","m2","m3"][i]:"mn"} style={{width:30,height:30,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--fd)",fontWeight:700,fontSize:11,color:i<3?"#030303":"var(--m)"}}>#{i+1}</div>
                        <span className="ey" style={{fontSize:10}}>Editando escola</span>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        <input className="inp" value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Nome da escola" onKeyDown={e=>e.key==="Enter"&&saveEdit(s.id)} />
                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          <input className="inp" type="number" value={editLiters} onChange={e=>setEditLiters(e.target.value)} placeholder="Litros" min="0" step="0.1" style={{flex:1,minWidth:100}} onKeyDown={e=>e.key==="Enter"&&saveEdit(s.id)} />
                          <div style={{display:"flex",gap:8}}>
                            <button className="btn btn-g btn-sm" onClick={()=>saveEdit(s.id)} style={{fontWeight:700}}>
                              ✓ Salvar
                            </button>
                            <button className="btn btn-o btn-sm" onClick={cancelEdit}>Cancelar</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* VIEW MODE */
                    <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                      <div className={i<3?["m1","m2","m3"][i]:"mn"} style={{width:36,height:36,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--fd)",fontWeight:700,fontSize:12,color:i<3?"#030303":"var(--m)"}}>
                        {i<3?["🥇","🥈","🥉"][i]:`#${i+1}`}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"var(--fd)",fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                        <div style={{display:"flex",gap:10,marginTop:3,flexWrap:"wrap"}}>
                          <span style={{fontFamily:"var(--fm)",color:"var(--g)",fontSize:12}}>{s.liters} L</span>
                          <span style={{color:"var(--dim)",fontSize:11}}>·</span>
                          <span style={{fontFamily:"var(--fm)",color:"var(--gold)",fontSize:11}}>{(s.liters*PTS_PER_LITER).toLocaleString("pt-BR")} pts</span>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:7,flexShrink:0}}>
                        <button className="btn btn-o btn-sm" onClick={()=>startEdit(s)}>✏ Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={()=>removeSchool(s.id)}>🗑</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {schools.length===0 && (
                <div style={{textAlign:"center",color:"var(--m)",padding:"40px 0",fontSize:14}}>
                  Nenhuma escola. Adicione uma acima ↑
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab==="history" && (
          <div className="si">
            <div style={{marginBottom:24}}>
              <span className="ey" style={{marginBottom:8}}>Registros</span>
              <h1 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:"clamp(20px,6vw,30px)",letterSpacing:-1}}>Histórico de Coletas</h1>
            </div>
            {[
              {date:"20/05 14:32",school:"E.E. Prof. João Silva",amount:"42 L"},
              {date:"20/05 11:15",school:"CIEP 238 Verde Esperança",amount:"28 L"},
              {date:"19/05 16:44",school:"EM Prof. Maria Graças",amount:"35 L"},
              {date:"19/05 09:20",school:"EM Futuro Verde",amount:"19 L"},
              {date:"18/05 15:00",school:"E.E. Prof. João Silva",amount:"60 L"},
              {date:"18/05 13:30",school:"CEst. Ipê Amarelo",amount:"22 L"},
              {date:"17/05 10:00",school:"EM Riachuelo Eco",amount:"31 L"},
            ].map((h,i)=>(
              <div key={i} className="glass" style={{borderRadius:12,padding:"13px 16px",marginBottom:9,display:"flex",gap:12,alignItems:"center",animation:`slideRight .38s cubic-bezier(.16,1,.3,1) ${i*.05}s both`}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:"var(--g)",boxShadow:"0 0 8px var(--g)",flexShrink:0}} />
                <div style={{fontFamily:"var(--fm)",color:"var(--dim)",fontSize:11,flexShrink:0,minWidth:70}}>{h.date}</div>
                <div style={{flex:1,fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.school}</div>
                <span style={{fontFamily:"var(--fm)",color:"var(--g)",fontSize:13,flexShrink:0}}>{h.amount}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── STATS ── */}
        {tab==="stats" && (
          <div className="si">
            <div style={{marginBottom:24}}>
              <span className="ey" style={{marginBottom:8}}>Análise</span>
              <h1 style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:"clamp(20px,6vw,30px)",letterSpacing:-1}}>Estatísticas</h1>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:14}}>
              <div className="glass" style={{borderRadius:16,padding:"22px 20px"}}>
                <span className="ey" style={{fontSize:10,marginBottom:18}}>Litros por Escola</span>
                {sorted.length===0 && <div style={{color:"var(--m)",fontSize:13}}>Nenhuma escola.</div>}
                {sorted.map((s,i)=>(
                  <div key={i} style={{marginBottom:13}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{color:"var(--m)",fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"68%"}}>
                        {s.name.split(" ").slice(0,3).join(" ")}
                      </span>
                      <span style={{fontFamily:"var(--fm)",color:"var(--g)",fontSize:11}}>{s.liters}L</span>
                    </div>
                    <div style={{height:5,background:"rgba(255,255,255,.05)",borderRadius:5,overflow:"hidden"}}>
                      <div style={{height:"100%",background:`hsl(${118-i*14},74%,52%)`,width:sorted[0]?.liters>0?`${(s.liters/sorted[0].liters)*100}%`:"0%",borderRadius:5,transition:`width 1.2s cubic-bezier(.16,1,.3,1) ${i*.1}s`}} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:11}}>
                {[
                  {label:"Total Coletado",val:`${total.toLocaleString("pt-BR")} L`,sub:"2025",c:"var(--g)"},
                  {label:"Total em Pontos",val:(total*PTS_PER_LITER).toLocaleString("pt-BR"),sub:"pts",c:"var(--gold)"},
                  {label:"Média por Escola",val:schools.length>0?`${Math.round(total/schools.length)} L`:"—",sub:"por escola",c:"var(--blue)"},
                  {label:"Escolas Ativas",val:schools.filter(s=>s.status==="Ativo").length,sub:"participantes",c:"var(--red)"},
                ].map((c,i)=>(
                  <div key={i} className="card sc" style={{padding:"16px 18px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{color:"var(--m)",fontSize:11,marginBottom:4}}>{c.label}</div>
                        <div style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:"clamp(16px,4vw,22px)",color:c.c,letterSpacing:-1}}>{c.val}</div>
                      </div>
                      <span style={{color:"var(--dim)",fontSize:10,fontFamily:"var(--fm)"}}>{c.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════
const Footer = ({ nav }) => (
  <footer style={{borderTop:"1px solid rgba(255,255,255,.05)",padding:"32px 18px"}}>
    <div style={{maxWidth:840,margin:"0 auto",display:"flex",flexDirection:"column",gap:20,alignItems:"center",textAlign:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Logo size={26} />
        <span style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:17,letterSpacing:-.4,color:"var(--g)"}}>Biológicas</span>
      </div>
      <div style={{display:"flex",gap:22,flexWrap:"wrap",justifyContent:"center"}}>
        {[["home","Início"],["about","Projeto"],["ranking","Ranking"],["impact","Impacto"]].map(([id,label])=>(
          <span key={id} style={{color:"var(--m)",fontSize:14,cursor:"pointer",transition:"color .2s"}}
            onClick={()=>nav(id)}
            onMouseOver={e=>e.currentTarget.style.color="var(--w)"}
            onMouseOut={e=>e.currentTarget.style.color="var(--m)"}>
            {label}
          </span>
        ))}
        <span style={{color:"var(--dim)",fontSize:14,cursor:"pointer",transition:"color .2s"}}
          onClick={()=>nav("admin")}
          onMouseOver={e=>e.currentTarget.style.color="var(--g)"}
          onMouseOut={e=>e.currentTarget.style.color="var(--dim)"}>
          🔐 Admin
        </span>
      </div>
      <p style={{color:"var(--dim)",fontSize:11,fontFamily:"var(--fm)"}}>© 2025 Biológicas · Competição Escolar de Reciclagem</p>
    </div>
  </footer>
);

// ═══════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState("home");
  const [isAdmin,  setIsAdmin]  = useState(false);

  // Single source of truth for schools — persisted in localStorage
  const [schools, setSchools] = useState(() => loadSchools() ?? DEFAULT_SCHOOLS);

  useEffect(() => { if(getSession()) setIsAdmin(true); }, []);

  const nav = (p) => {
    if(p==="admin") setPage(isAdmin?"admin-dash":"admin-login");
    else setPage(p);
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const onLogin  = () => { setIsAdmin(true);  setPage("admin-dash"); };
  const onLogout = () => { setIsAdmin(false); setPage("home"); };

  const isAdminPage = page==="admin-login" || page==="admin-dash";

  return (
    <>
      <style>{STYLES}</style>
      <Particles />
      {loading && <Loading onDone={()=>setLoading(false)} />}
      {!loading && (
        <div style={{position:"relative",zIndex:1}}>
          {!isAdminPage && <Navbar page={page} nav={nav} isAdmin={isAdmin} />}

          {page==="home"        && <HomePage    nav={nav} schools={schools} />}
          {page==="about"       && <AboutPage />}
          {page==="ranking"     && <RankingPage schools={schools} />}
          {page==="impact"      && <ImpactPage  nav={nav} />}
          {page==="admin-login" && <AdminLogin  onLogin={onLogin} />}
          {page==="admin-dash"  && isAdmin  && <AdminDashboard onLogout={onLogout} schools={schools} setSchools={setSchools} />}
          {page==="admin-dash"  && !isAdmin && <AdminLogin onLogin={onLogin} />}

          {!isAdminPage && <Footer nav={nav} />}
        </div>
      )}
    </>
  );
}
