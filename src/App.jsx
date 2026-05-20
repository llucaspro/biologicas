import { useState, useEffect, useRef } from "react";

// ── CONFIG ───────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "bioloucos126@gmail.com";
const ADMIN_PASS_HASH = "398707c6a99a1b1409313972df5c2481d92b1e3408de28cabdaaaf45d656d21b";
const SESSION_KEY = "ov_admin_session";
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24h

const hashPassword = async (pwd) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pwd);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
};

const getSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) { localStorage.removeItem(SESSION_KEY); return null; }
    return session;
  } catch { return null; }
};

const setSession = (email) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, expiresAt: Date.now() + SESSION_TTL }));
};

const clearSession = () => localStorage.removeItem(SESSION_KEY);

// ── LOGO IMAGE ───────────────────────────────────────────────────────────────
const LogoImg = ({ size = 48, glow = false }) => (
  <img
    src="/logo.jpg"
    alt="Óleo Verde"
    width={size}
    height={size}
    style={{
      borderRadius: "50%",
      objectFit: "cover",
      filter: glow ? "drop-shadow(0 0 14px rgba(124,255,79,0.7))" : "drop-shadow(0 0 4px rgba(124,255,79,0.3))",
      transition: "filter .3s"
    }}
  />
);

// ── Animated Particles background ──────────────────────────────────────────
const Particles = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.4,
      a: Math.random()
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124,255,79,${p.a * 0.45})`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(124,255,79,${(1 - d / 110) * 0.12})`;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
};

// ── Counter animation ───────────────────────────────────────────────────────
const useCounter = (target, duration = 2000, start = false) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let s = null, startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) s = requestAnimationFrame(step);
    };
    s = requestAnimationFrame(step);
    return () => cancelAnimationFrame(s);
  }, [target, duration, start]);
  return val;
};

// ── Mock data ───────────────────────────────────────────────────────────────
const schools = [
  { id: 1, name: "Escola Estadual Prof. João Silva", score: 9840, rank: 1, trend: "+12%" },
  { id: 2, name: "CIEP 238 – Verde Esperança", score: 8210, rank: 2, trend: "+8%" },
  { id: 3, name: "EM Professora Maria das Graças", score: 7650, rank: 3, trend: "+15%" },
  { id: 4, name: "Escola Municipal Futuro Verde", score: 6920, rank: 4, trend: "+5%" },
  { id: 5, name: "Colégio Estadual Ipê Amarelo", score: 5880, rank: 5, trend: "+3%" },
  { id: 6, name: "EM Riachuelo – Turma Eco", score: 4320, rank: 6, trend: "+9%" },
  { id: 7, name: "EMEF Santos Dumont", score: 3100, rank: 7, trend: "+2%" },
];

const adminSchools = [
  { id: 1, name: "E.E. Prof. João Silva", liters: 492, status: "Ativo" },
  { id: 2, name: "CIEP 238 Verde Esperança", liters: 410, status: "Ativo" },
  { id: 3, name: "EM Prof. Maria Graças", liters: 382, status: "Ativo" },
  { id: 4, name: "EM Futuro Verde", liters: 346, status: "Ativo" },
  { id: 5, name: "CEst. Ipê Amarelo", liters: 294, status: "Ativo" },
  { id: 6, name: "EM Riachuelo Eco", liters: 216, status: "Ativo" },
  { id: 7, name: "EMEF Santos Dumont", liters: 155, status: "Ativo" },
];

// ── CSS injected once ────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}

:root{
  --neon:#7CFF4F;
  --neon-dim:#4CAF50;
  --dark:#0B5D3B;
  --black:#030303;
  --surface:#0A0A0A;
  --surface2:#111111;
  --white:#F0F0F0;
  --muted:#6B7280;
  --red:#FF6B5E;
  --blue:#A8C8FF;
  --glow:0 0 24px rgba(124,255,79,0.35), 0 0 60px rgba(124,255,79,0.12);
  --glow-strong:0 0 40px rgba(124,255,79,0.6), 0 0 100px rgba(124,255,79,0.2);

  --font-display:'Space Grotesk',system-ui,sans-serif;
  --font-body:'Inter',system-ui,sans-serif;
  --font-mono:'DM Mono',monospace;
}

body{
  background:var(--black);
  color:var(--white);
  font-family:var(--font-body);
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  line-height:1.6;
}

/* ── TYPOGRAPHY SYSTEM ── */
.t-eyebrow{
  font-family:var(--font-mono);
  font-size:11px;
  letter-spacing:3px;
  text-transform:uppercase;
  color:var(--neon);
  opacity:.85;
}
.t-hero{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(52px,9vw,104px);
  line-height:.95;
  letter-spacing:-3px;
}
.t-display{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(36px,6vw,72px);
  line-height:1.05;
  letter-spacing:-2px;
}
.t-title{
  font-family:var(--font-display);
  font-weight:600;
  font-size:clamp(22px,3.5vw,40px);
  line-height:1.15;
  letter-spacing:-.8px;
}
.t-subtitle{
  font-family:var(--font-display);
  font-weight:500;
  font-size:clamp(14px,2vw,18px);
  line-height:1.5;
  letter-spacing:-.2px;
  color:rgba(240,240,240,.6);
}
.t-body{
  font-family:var(--font-body);
  font-size:16px;
  line-height:1.8;
  color:rgba(240,240,240,.7);
  font-weight:400;
}
.t-small{
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.6;
  color:rgba(240,240,240,.5);
}
.t-data{
  font-family:var(--font-mono);
  font-weight:500;
}
.t-brand{
  font-family:var(--font-display);
  font-weight:700;
  letter-spacing:-1.5px;
  color:var(--neon);
}

/* ── ANIMATIONS ── */
@keyframes floatY{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 20px rgba(124,255,79,0.25);}50%{box-shadow:0 0 50px rgba(124,255,79,0.6);}}
@keyframes barFill{from{width:0}to{width:var(--w)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
@keyframes slideIn{from{transform:translateX(-20px);opacity:0;}to{transform:translateX(0);opacity:1;}}
@keyframes scaleIn{from{transform:scale(.94);opacity:0;}to{transform:scale(1);opacity:1;}}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}

.float{animation:floatY 5s ease-in-out infinite;}
.pulse-glow{animation:pulseGlow 3s ease-in-out infinite;}
.fade-up{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) both;}
.scale-in{animation:scaleIn .6s cubic-bezier(.16,1,.3,1) both;}

.shimmer-text{
  background:linear-gradient(90deg,var(--neon) 0%,rgba(255,255,255,.95) 40%,var(--neon) 80%);
  background-size:200%;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  animation:shimmer 4s linear infinite;
}

/* ── GLASS & CARDS ── */
.glass{
  background:rgba(255,255,255,0.03);
  backdrop-filter:blur(24px);
  -webkit-backdrop-filter:blur(24px);
  border:1px solid rgba(124,255,79,0.08);
}
.neon-border{border:1px solid rgba(124,255,79,0.2);box-shadow:0 0 30px rgba(124,255,79,0.06);}
.card-hover{transition:transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s;}
.card-hover:hover{transform:translateY(-5px);box-shadow:0 24px 64px rgba(124,255,79,0.1);}

/* ── BUTTONS ── */
.btn-primary{
  font-family:var(--font-display);
  font-size:14px;
  font-weight:600;
  letter-spacing:-.2px;
  color:#030303;
  background:var(--neon);
  border:none;
  cursor:pointer;
  padding:14px 32px;
  border-radius:100px;
  transition:all .25s cubic-bezier(.16,1,.3,1);
  box-shadow:0 0 32px rgba(124,255,79,0.4), 0 4px 16px rgba(0,0,0,.4);
}
.btn-primary:hover{
  background:#8FFF66;
  box-shadow:0 0 60px rgba(124,255,79,0.65), 0 8px 24px rgba(0,0,0,.4);
  transform:translateY(-2px) scale(1.02);
}
.btn-secondary{
  font-family:var(--font-display);
  font-size:14px;
  font-weight:500;
  letter-spacing:-.2px;
  color:var(--neon);
  background:transparent;
  cursor:pointer;
  padding:13px 30px;
  border-radius:100px;
  border:1px solid rgba(124,255,79,0.3);
  transition:all .25s cubic-bezier(.16,1,.3,1);
}
.btn-secondary:hover{
  background:rgba(124,255,79,0.08);
  border-color:var(--neon);
  box-shadow:0 0 32px rgba(124,255,79,0.2);
}
.btn-danger{
  font-family:var(--font-body);
  font-size:12px;
  font-weight:500;
  color:var(--red);
  background:rgba(255,107,94,0.08);
  border:1px solid rgba(255,107,94,0.25);
  border-radius:8px;
  padding:6px 14px;
  cursor:pointer;
  transition:all .2s;
}
.btn-danger:hover{background:rgba(255,107,94,0.16);border-color:rgba(255,107,94,.5);}

/* ── NAV ── */
.nav-link{
  font-family:var(--font-body);
  font-size:14px;
  font-weight:450;
  color:rgba(240,240,240,.5);
  cursor:pointer;
  letter-spacing:-.1px;
  transition:color .2s;
  position:relative;
  padding:4px 0;
}
.nav-link:hover,.nav-link.active{color:rgba(240,240,240,.95);}
.nav-link.active::after{
  content:'';position:absolute;bottom:-4px;left:0;width:100%;height:1.5px;
  background:var(--neon);border-radius:2px;box-shadow:0 0 8px var(--neon);
}

/* ── RANKING BARS ── */
.rank-bar{
  height:4px;
  border-radius:4px;
  background:linear-gradient(90deg,var(--neon),var(--dark));
  width:var(--w);
  box-shadow:0 0 8px rgba(124,255,79,0.5);
  animation:barFill 1.4s cubic-bezier(.16,1,.3,1) both;
}
.medal-1{background:linear-gradient(135deg,#FFD700,#F59E0B);box-shadow:0 0 24px rgba(255,215,0,0.4);}
.medal-2{background:linear-gradient(135deg,#E2E8F0,#94A3B8);box-shadow:0 0 20px rgba(226,232,240,0.3);}
.medal-3{background:linear-gradient(135deg,#CD7F32,#92400E);box-shadow:0 0 20px rgba(205,127,50,0.3);}
.medal-n{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);}

/* ── STAT CARD ── */
.stat-card{
  background:linear-gradient(135deg,rgba(11,93,59,0.15),rgba(3,3,3,0.7));
  border:1px solid rgba(124,255,79,0.1);
  border-radius:20px;
  padding:28px;
  transition:all .3s;
}
.stat-card:hover{border-color:rgba(124,255,79,0.3);box-shadow:0 12px 40px rgba(124,255,79,0.1);}

/* ── FORM ── */
input,select{
  background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.1);
  color:var(--white);
  border-radius:12px;
  padding:12px 16px;
  font-family:var(--font-body);
  font-size:15px;
  outline:none;
  transition:border .2s,box-shadow .2s;
  width:100%;
}
input:focus,select:focus{
  border-color:rgba(124,255,79,0.5);
  box-shadow:0 0 20px rgba(124,255,79,0.15);
}
input::placeholder{color:rgba(240,240,240,.25);font-size:14px;}

/* ── TABLE ── */
table{width:100%;border-collapse:collapse;}
th{
  font-family:var(--font-mono);
  font-size:10px;
  letter-spacing:2px;
  text-transform:uppercase;
  color:rgba(124,255,79,.7);
  padding:14px 16px;
  text-align:left;
  border-bottom:1px solid rgba(255,255,255,0.06);
  font-weight:500;
}
td{
  padding:16px;
  border-bottom:1px solid rgba(255,255,255,0.04);
  font-size:14px;
  color:rgba(240,240,240,.8);
  font-family:var(--font-body);
}
tr:hover td{background:rgba(124,255,79,0.03);}

/* ── SCROLLBAR ── */
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(124,255,79,0.2);border-radius:4px;}

/* ── ADMIN SIDEBAR BUTTON ── */
.sidebar-btn{
  background:transparent;
  border:1px solid transparent;
  color:rgba(240,240,240,.45);
  padding:11px 16px;
  border-radius:10px;
  cursor:pointer;
  text-align:left;
  font-family:var(--font-body);
  font-size:13px;
  font-weight:500;
  letter-spacing:-.1px;
  transition:all .2s;
  display:flex;
  align-items:center;
  gap:10px;
  width:100%;
}
.sidebar-btn:hover{color:rgba(240,240,240,.8);background:rgba(255,255,255,0.04);}
.sidebar-btn.active{
  background:rgba(124,255,79,0.08);
  border-color:rgba(124,255,79,0.2);
  color:var(--neon);
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const SectionReveal = ({ children, delay = 0 }) => {
  const ref = useRef();
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(32px)",
      transition: `opacity .9s cubic-bezier(.16,1,.3,1) ${delay}s, transform .9s cubic-bezier(.16,1,.3,1) ${delay}s`
    }}>{children}</div>
  );
};

// ── LOADING SCREEN ──────────────────────────────────────────────────────────
const LoadingScreen = ({ onDone }) => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setPct(p => {
      if (p >= 100) { clearInterval(iv); setTimeout(onDone, 400); return 100; }
      return p + 2;
    }), 28);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#030303", zIndex: 9999,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36
    }}>
      <div className="float" style={{ filter: "drop-shadow(0 0 32px rgba(124,255,79,0.6))" }}>
        <LogoImg size={96} glow />
      </div>
      <div className="t-brand" style={{ fontSize: 28, letterSpacing: -1 }}>
        Óleo Verde
      </div>
      <div style={{ width: 260, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg,var(--neon),#0B5D3B)",
          transition: "width .04s linear",
          boxShadow: "0 0 16px rgba(124,255,79,.7)"
        }} />
      </div>
      <div className="t-small t-data" style={{ letterSpacing: 2, opacity: .5 }}>
        {pct < 100 ? `Iniciando sistema... ${pct}%` : "Pronto"}
      </div>
    </div>
  );
};

// ── NAVBAR ──────────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage, isAdmin }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { id: "home", label: "Início" },
    { id: "about", label: "Projeto" },
    { id: "ranking", label: "Ranking" },
    { id: "impact", label: "Impacto" },
  ];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      padding: "0 48px", height: 68,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(3,3,3,0.88)" : "transparent",
      backdropFilter: scrolled ? "blur(28px) saturate(180%)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(28px) saturate(180%)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      transition: "all .5s cubic-bezier(.16,1,.3,1)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setPage("home")}>
        <LogoImg size={34} glow={scrolled} />
        <span className="t-brand" style={{ fontSize: 18 }}>Óleo Verde</span>
      </div>
      <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
        {links.map(l => (
          <span key={l.id} className={`nav-link ${page === l.id ? "active" : ""}`} onClick={() => setPage(l.id)}>
            {l.label}
          </span>
        ))}
        {isAdmin ? (
          <button className="btn-primary" style={{ padding: "9px 22px", fontSize: 13 }} onClick={() => setPage("admin")}>
            Painel ↗
          </button>
        ) : (
          <button className="btn-secondary" style={{ padding: "9px 22px", fontSize: 13 }} onClick={() => setPage("admin")}>
            Admin
          </button>
        )}
      </div>
    </nav>
  );
};

// ── HOME PAGE ───────────────────────────────────────────────────────────────
const HomePage = ({ setPage }) => {
  const [started, setStarted] = useState(false);
  const statsRef = useRef();
  const [statsVis, setStatsVis] = useState(false);
  const c1 = useCounter(1247, 2400, statsVis);
  const c2 = useCounter(38, 2000, statsVis);
  const c3 = useCounter(24, 1800, statsVis);

  useEffect(() => {
    setTimeout(() => setStarted(true), 80);
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVis(true); }, { threshold: 0.25 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div>
      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "120px 24px 80px" }}>
        {/* Radial gradient orb */}
        <div style={{ position: "absolute", top: "38%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, background: "radial-gradient(circle,rgba(124,255,79,0.06) 0%,transparent 68%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "20%", left: "20%", width: 300, height: 300, background: "radial-gradient(circle,rgba(124,255,79,0.04) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div style={{ textAlign: "center", maxWidth: 860, position: "relative", zIndex: 1 }}>
          <div className="float" style={{ marginBottom: 40, display: "inline-block" }}>
            <LogoImg size={120} glow />
          </div>

          {/* Eyebrow */}
          <div className="t-eyebrow" style={{
            marginBottom: 24,
            opacity: started ? 0.8 : 0,
            transition: "opacity .9s ease .1s"
          }}>
            Competição Escolar de Reciclagem
          </div>

          {/* Hero title */}
          <h1 className="t-hero shimmer-text" style={{
            marginBottom: 28,
            opacity: started ? 1 : 0,
            transform: started ? "none" : "translateY(24px)",
            transition: "all 1s cubic-bezier(.16,1,.3,1) .2s"
          }}>
            Óleo Verde
          </h1>

          <p className="t-subtitle" style={{
            maxWidth: 520, margin: "0 auto 40px", fontSize: 18,
            opacity: started ? 1 : 0,
            transform: started ? "none" : "translateY(20px)",
            transition: "all 1s cubic-bezier(.16,1,.3,1) .35s"
          }}>
            Juntos, transformamos óleo descartado em energia e futuro. Cada gota coletada protege rios, lençóis freáticos e vidas.
          </p>

          {/* Highlight quote */}
          <div style={{
            background: "linear-gradient(135deg,rgba(255,107,94,0.1),rgba(255,107,94,0.04))",
            border: "1px solid rgba(255,107,94,0.2)",
            borderRadius: 16,
            padding: "18px 28px",
            marginBottom: 44,
            maxWidth: 540,
            margin: "0 auto 44px",
            opacity: started ? 1 : 0,
            transition: "all 1s ease .48s"
          }}>
            <p style={{ fontSize: 14, color: "rgba(255,107,94,.8)", fontStyle: "italic", lineHeight: 1.65, fontFamily: "var(--font-body)" }}>
              "1 litro de óleo pode contaminar até 1 milhão de litros de água potável."
            </p>
          </div>

          <div style={{
            display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap",
            opacity: started ? 1 : 0,
            transition: "all 1s ease .6s"
          }}>
            <button className="btn-primary" onClick={() => setPage("ranking")}>Ver Ranking ↗</button>
            <button className="btn-secondary" onClick={() => setPage("about")}>Saiba Mais</button>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: .3 }}>
          <div style={{ width: 1, height: 36, background: "linear-gradient(var(--neon),transparent)" }} />
          <span className="t-data" style={{ fontSize: 9, letterSpacing: 3, color: "var(--neon)" }}>SCROLL</span>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} style={{ padding: "80px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
          {[
            { value: c1, suffix: " litros", label: "Óleo coletado", icon: "🫙", color: "var(--neon)" },
            { value: c2, suffix: " escolas", label: "Participantes", icon: "🏫", color: "var(--blue)" },
            { value: c3, suffix: " cidades", label: "Municípios", icon: "🌍", color: "var(--red)" },
          ].map((s, i) => (
            <SectionReveal key={i} delay={i * 0.12}>
              <div className="stat-card card-hover">
                <div style={{ fontSize: 32, marginBottom: 14 }}>{s.icon}</div>
                <div className="t-data" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 48, color: s.color, lineHeight: 1, letterSpacing: -2 }}>
                  {s.value.toLocaleString()}{s.suffix}
                </div>
                <div className="t-small" style={{ marginTop: 10, letterSpacing: .5 }}>{s.label}</div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* MINI ABOUT */}
      <section style={{ padding: "60px 48px 100px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionReveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 18 }}>Nossa Missão</div>
              <h2 className="t-display" style={{ marginBottom: 24 }}>
                Ciência + Educação + <span style={{ color: "var(--neon)" }}>Planeta</span>
              </h2>
              <p className="t-body" style={{ marginBottom: 36 }}>
                O Óleo Verde une escolas do município em uma competição ecológica que desperta consciência ambiental e promove a reciclagem de óleo de cozinha — uma das maiores ameaças à qualidade da água.
              </p>
              <button className="btn-primary" onClick={() => setPage("about")}>Conheça o Projeto</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { icon: "♻️", title: "Reciclagem", desc: "Óleo vira biodiesel e sabão artesanal" },
                { icon: "💧", title: "Água limpa", desc: "Protegemos rios e lençóis freáticos" },
                { icon: "🔬", title: "Ciência", desc: "Aprendizado prático e significativo" },
                { icon: "🏆", title: "Competição", desc: "Gamificação para motivar escolas" },
              ].map((c, i) => (
                <div key={i} className="glass card-hover" style={{ borderRadius: 18, padding: 22 }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{c.icon}</div>
                  <div className="t-brand" style={{ fontSize: 14, marginBottom: 6 }}>{c.title}</div>
                  <div className="t-small" style={{ lineHeight: 1.55 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>
      </section>
    </div>
  );
};

// ── ABOUT PAGE ──────────────────────────────────────────────────────────────
const AboutPage = () => (
  <div style={{ paddingTop: 100, minHeight: "100vh" }}>
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 48px 100px" }}>
      <SectionReveal>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div className="t-eyebrow" style={{ marginBottom: 18 }}>Sobre o Projeto</div>
          <h1 className="t-display shimmer-text">Por Que Reciclar?</h1>
        </div>
      </SectionReveal>

      <div style={{ display: "grid", gap: 20 }}>
        {[
          {
            icon: "🌊", title: "O Problema do Óleo",
            text: "O óleo de cozinha descartado incorretamente no ralo entope tubulações, contamina rios e mata a biodiversidade aquática. Um único litro pode criar uma película impermeável de 1 km² na superfície da água, impedindo a oxigenação necessária para a vida marinha.",
            color: "var(--red)"
          },
          {
            icon: "🔋", title: "A Solução: Reciclagem",
            text: "O óleo coletado é transformado em biodiesel renovável, sabão ecológico e outros insumos industriais. Além de evitar a poluição, gera renda para comunidades e reduz a emissão de gases do efeito estufa em comparação com combustíveis fósseis.",
            color: "var(--neon)"
          },
          {
            icon: "🏫", title: "O Papel das Escolas",
            text: "As escolas são agentes de transformação. Ao engajar alunos, famílias e comunidades na coleta, criamos uma rede de consciência ambiental que vai muito além das paredes da sala de aula. A competição saudável acelera a mudança de comportamento.",
            color: "var(--blue)"
          },
        ].map((item, i) => (
          <SectionReveal key={i} delay={i * 0.1}>
            <div className="glass card-hover" style={{ borderRadius: 24, padding: "36px 40px", display: "flex", gap: 28, alignItems: "flex-start" }}>
              <div style={{ fontSize: 48, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <h3 className="t-title" style={{ color: item.color, marginBottom: 14, fontSize: 22 }}>{item.title}</h3>
                <p className="t-body">{item.text}</p>
              </div>
            </div>
          </SectionReveal>
        ))}
      </div>

      {/* Timeline */}
      <SectionReveal delay={0.3}>
        <div style={{ marginTop: 72 }}>
          <h2 className="t-eyebrow" style={{ marginBottom: 48, textAlign: "center", fontSize: 12, letterSpacing: 5 }}>Como Funciona</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
            <div style={{ position: "absolute", left: 27, top: 0, bottom: 0, width: 1, background: "linear-gradient(rgba(124,255,79,.5),transparent)" }} />
            {[
              { step: "01", title: "Coleta em Casa", desc: "Cada aluno recolhe o óleo usado da própria família em garrafas PET." },
              { step: "02", title: "Entrega na Escola", desc: "O óleo é entregue nos pontos de coleta da escola durante o período da campanha." },
              { step: "03", title: "Pesagem e Registro", desc: "A equipe registra o volume coletado por turma e por escola." },
              { step: "04", title: "Pontuação no Sistema", desc: "Os pontos são atualizados no sistema e o ranking é exibido em tempo real." },
              { step: "05", title: "Premiação", desc: "As melhores escolas recebem troféus, certificados e brindes sustentáveis." },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 28, alignItems: "flex-start", paddingBottom: 36 }}>
                <div style={{
                  width: 54, height: 54, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                  background: "linear-gradient(135deg,var(--neon),var(--dark))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: 12, color: "#030303",
                  boxShadow: "0 0 24px rgba(124,255,79,0.4)"
                }}>{s.step}</div>
                <div style={{ paddingTop: 14 }}>
                  <div className="t-subtitle" style={{ color: "var(--white)", fontWeight: 600, marginBottom: 6, fontSize: 16 }}>{s.title}</div>
                  <div className="t-small" style={{ lineHeight: 1.7, fontSize: 14 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>
    </div>
  </div>
);

// ── RANKING PAGE (público — sem litros) ─────────────────────────────────────
const RankingPage = () => {
  const maxScore = schools[0].score;
  const medals = ["medal-1", "medal-2", "medal-3"];
  const medalEmoji = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ paddingTop: 100, minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 100px" }}>
        <SectionReveal>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="t-eyebrow" style={{ marginBottom: 18 }}>Classificação Geral</div>
            <h1 className="t-display shimmer-text">Ranking das Escolas</h1>
            <p className="t-small" style={{ marginTop: 18, fontSize: 14 }}>Atualizado em tempo real · Pontuação baseada no volume coletado</p>
          </div>
        </SectionReveal>

        {/* Top 3 podium */}
        <SectionReveal delay={0.1}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 36 }}>
            {schools.slice(0, 3).map((s, i) => (
              <div key={s.id} className={`card-hover ${medals[i]}`} style={{
                borderRadius: 22, padding: "32px 20px", textAlign: "center",
                border: "1px solid rgba(255,255,255,0.18)",
                transform: i === 0 ? "scale(1.05)" : "scale(0.96)",
                order: i === 0 ? 2 : i === 1 ? 1 : 3,
                animation: i === 0 ? "pulseGlow 3.5s infinite" : "none"
              }}>
                <div style={{ fontSize: 38, marginBottom: 10 }}>{medalEmoji[i]}</div>
                <div className="t-data" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, color: "#030303", lineHeight: 1 }}>#{s.rank}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(3,3,3,.75)", margin: "12px 0 10px", lineHeight: 1.45, fontFamily: "var(--font-body)" }}>{s.name}</div>
                <div className="t-data" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "#030303" }}>
                  {s.score.toLocaleString()} <span style={{ fontSize: 13 }}>pts</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(3,3,3,.55)", marginTop: 6, fontFamily: "var(--font-body)" }}>{s.trend} esta semana</div>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* Full ranking list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {schools.map((s, i) => (
            <SectionReveal key={s.id} delay={i * 0.06}>
              <div className="glass card-hover" style={{ borderRadius: 16, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                  <div className={`${i < 3 ? medals[i] : "medal-n"}`} style={{
                    width: 40, height: 40, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
                    color: i < 3 ? "#030303" : "rgba(240,240,240,.7)",
                    flexShrink: 0
                  }}>
                    {i < 3 ? medalEmoji[i] : `#${s.rank}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="t-subtitle" style={{ color: "var(--white)", fontSize: 15, fontWeight: 550 }}>{s.name}</div>
                    <div className="t-data" style={{ color: "var(--neon)", fontSize: 11, marginTop: 2, letterSpacing: .5 }}>
                      {s.trend} esta semana
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="t-data" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: i < 3 ? "var(--neon)" : "var(--white)", letterSpacing: -1 }}>
                      {s.score.toLocaleString()}
                    </div>
                    <div className="t-small" style={{ fontSize: 11 }}>pontos</div>
                  </div>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                  <div className="rank-bar" style={{ "--w": `${(s.score / maxScore) * 100}%` }} />
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>

        {/* Public note */}
        <SectionReveal delay={0.4}>
          <div style={{ marginTop: 36, textAlign: "center" }}>
            <p className="t-small" style={{ fontSize: 12, opacity: .4 }}>
              A pontuação é calculada pelo volume e consistência de coleta. Apenas administradores têm acesso às métricas internas.
            </p>
          </div>
        </SectionReveal>
      </div>
    </div>
  );
};

// ── IMPACT PAGE ─────────────────────────────────────────────────────────────
const ImpactPage = () => {
  const ref = useRef();
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const bars = [
    { label: "Biodiesel", pct: 78, color: "var(--neon)" },
    { label: "Sabão Artesanal", pct: 52, color: "var(--blue)" },
    { label: "Ração Animal", pct: 34, color: "#FFD700" },
    { label: "Tinta & Verniz", pct: 18, color: "var(--red)" },
  ];

  const facts = [
    { icon: "💧", stat: "1.000.000 L", label: "de água contaminada por 1L de óleo" },
    { icon: "🐟", stat: "20 km²", label: "de área aquática afetada por tonelada de óleo" },
    { icon: "⚡", stat: "2,5 L", label: "de biodiesel gerado por cada quilo de óleo" },
    { icon: "🌿", stat: "60%", label: "menos CO₂ vs combustível fóssil" },
    { icon: "🏭", stat: "45 L", label: "de óleo = 1 mês de energia de uma casa" },
    { icon: "🧼", stat: "900g", label: "de sabão por litro de óleo reciclado" },
  ];

  return (
    <div style={{ paddingTop: 100, minHeight: "100vh" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 48px 100px" }}>
        <SectionReveal>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div className="t-eyebrow" style={{ marginBottom: 18 }}>Dados Científicos</div>
            <h1 className="t-display shimmer-text">Impacto Ambiental</h1>
          </div>
        </SectionReveal>

        {/* Facts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 64 }}>
          {facts.map((f, i) => (
            <SectionReveal key={i} delay={i * 0.07}>
              <div className="glass card-hover" style={{ borderRadius: 20, padding: "28px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 34, marginBottom: 14 }}>{f.icon}</div>
                <div className="t-data" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--neon)", marginBottom: 10, lineHeight: 1.1, letterSpacing: -1 }}>
                  {f.stat}
                </div>
                <div className="t-small" style={{ lineHeight: 1.55 }}>{f.label}</div>
              </div>
            </SectionReveal>
          ))}
        </div>

        {/* Bar chart */}
        <SectionReveal delay={0.2}>
          <div className="glass" style={{ borderRadius: 24, padding: "40px" }}>
            <div className="t-eyebrow" style={{ marginBottom: 36, fontSize: 11 }}>Destino do Óleo Reciclado</div>
            <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 26 }}>
              {bars.map((b, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span className="t-subtitle" style={{ fontSize: 14, fontWeight: 500 }}>{b.label}</span>
                    <span className="t-data" style={{ color: b.color, fontSize: 14 }}>{b.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 6,
                      background: `linear-gradient(90deg,${b.color},${b.color}66)`,
                      width: vis ? `${b.pct}%` : "0%",
                      transition: `width 1.4s cubic-bezier(.16,1,.3,1) ${i * 0.12}s`,
                      boxShadow: `0 0 14px ${b.color}55`
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>

        {/* CTA */}
        <SectionReveal delay={0.3}>
          <div style={{
            marginTop: 64, textAlign: "center", padding: "64px 48px",
            background: "linear-gradient(135deg,rgba(11,93,59,0.25),rgba(124,255,79,0.04))",
            border: "1px solid rgba(124,255,79,0.15)", borderRadius: 28
          }}>
            <div className="float" style={{ display: "inline-block", marginBottom: 24 }}>
              <LogoImg size={72} glow />
            </div>
            <h2 className="t-title" style={{ margin: "0 auto 18px", maxWidth: 420 }}>
              Faça Parte da Mudança
            </h2>
            <p className="t-body" style={{ maxWidth: 460, margin: "0 auto 36px" }}>
              Convide sua escola a participar. Cada litro coletado é um passo em direção a um planeta mais limpo e saudável.
            </p>
            <button className="btn-primary">Inscrever Minha Escola</button>
          </div>
        </SectionReveal>
      </div>
    </div>
  );
};

// ── ADMIN LOGIN ─────────────────────────────────────────────────────────────
const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !pass) { setError("Preencha todos os campos."); return; }
    setLoading(true);
    try {
      const hash = await hashPassword(pass);
      if (email.toLowerCase().trim() === ADMIN_EMAIL && hash === ADMIN_PASS_HASH) {
        setSession(email);
        onLogin();
      } else {
        setError("Credenciais inválidas. Tente novamente.");
      }
    } catch {
      setError("Erro ao autenticar. Tente novamente.");
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative", background: "var(--black)"
    }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(circle,rgba(124,255,79,0.05) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div className="glass scale-in" style={{ width: "100%", maxWidth: 420, borderRadius: 28, padding: "52px 44px", position: "relative" }}>
        {/* Top badge */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div className="float" style={{ display: "inline-block", marginBottom: 20 }}>
            <LogoImg size={64} glow />
          </div>
          <h1 className="t-title" style={{ fontSize: 24, marginBottom: 8 }}>Painel Admin</h1>
          <p className="t-small">Acesso restrito — somente administradores</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label className="t-eyebrow" style={{ display: "block", marginBottom: 10, fontSize: 10 }}>E-mail</label>
            <input
              type="email"
              placeholder="admin@oleoverde.edu.br"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKey}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="t-eyebrow" style={{ display: "block", marginBottom: 10, fontSize: 10 }}>Senha</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={handleKey}
                autoComplete="current-password"
                style={{ paddingRight: 48 }}
              />
              <button
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(240,240,240,.4)", fontSize: 16
                }}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: "rgba(255,107,94,0.1)", border: "1px solid rgba(255,107,94,0.25)",
              borderRadius: 10, padding: "10px 14px",
              color: "var(--red)", fontSize: 13, fontFamily: "var(--font-body)"
            }}>
              {error}
            </div>
          )}

          <button
            className="btn-primary"
            style={{ width: "100%", marginTop: 4, padding: "16px", fontSize: 15, opacity: loading ? .7 : 1 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Verificando..." : "Acessar Sistema →"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <span className="t-small" style={{ fontSize: 11, opacity: .35 }}>🔒 Autenticação criptografada (SHA-256)</span>
        </div>
      </div>
    </div>
  );
};

// ── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
const AdminDashboard = ({ onLogout }) => {
  const [tab, setTab] = useState("overview");
  const [rows, setRows] = useState(adminSchools);
  const [newName, setNewName] = useState("");
  const [newLiters, setNewLiters] = useState("");
  const [editId, setEditId] = useState(null);
  const [editLiters, setEditLiters] = useState("");

  const addSchool = () => {
    if (!newName.trim() || !newLiters) return;
    setRows(r => [...r, { id: Date.now(), name: newName.trim(), liters: +newLiters, status: "Ativo" }]);
    setNewName(""); setNewLiters("");
  };

  const removeSchool = id => setRows(r => r.filter(s => s.id !== id));

  const saveEdit = (id) => {
    setRows(r => r.map(s => s.id === id ? { ...s, liters: +editLiters } : s));
    setEditId(null); setEditLiters("");
  };

  const totalLiters = rows.reduce((a, s) => a + s.liters, 0);
  const sorted = [...rows].sort((a, b) => b.liters - a.liters);

  const sidebarItems = [
    { id: "overview", label: "Visão Geral", icon: "◈" },
    { id: "schools", label: "Escolas", icon: "⊟" },
    { id: "history", label: "Histórico", icon: "◷" },
    { id: "stats", label: "Estatísticas", icon: "◎" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--black)" }}>
      {/* SIDEBAR */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: "rgba(255,255,255,0.02)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "28px 16px",
        display: "flex", flexDirection: "column", gap: 4,
        position: "sticky", top: 0, height: "100vh", overflowY: "auto"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, paddingLeft: 4 }}>
          <LogoImg size={28} glow />
          <span className="t-brand" style={{ fontSize: 14 }}>Admin</span>
        </div>
        {sidebarItems.map(t => (
          <button key={t.id} className={`sidebar-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            <span style={{ fontSize: 16, opacity: .7 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ paddingLeft: 4, marginBottom: 8 }}>
          <div className="t-small" style={{ fontSize: 11, marginBottom: 12, opacity: .3 }}>Sessão ativa (24h)</div>
          <button className="btn-secondary" style={{ width: "100%", padding: "10px", fontSize: 12 }} onClick={() => { clearSession(); onLogout(); }}>
            Sair
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "44px 48px", overflowY: "auto" }}>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="scale-in">
            <div style={{ marginBottom: 40 }}>
              <div className="t-eyebrow" style={{ marginBottom: 12 }}>Painel de Controle</div>
              <h1 className="t-title" style={{ fontSize: 32 }}>Visão Geral</h1>
              <p className="t-small" style={{ marginTop: 8 }}>Campanha Óleo Verde 2025 — dados internos</p>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 36 }}>
              {[
                { label: "Litros Arrecadados", val: `${totalLiters} L`, icon: "🫙", color: "var(--neon)" },
                { label: "Escolas Ativas", val: rows.filter(r => r.status === "Ativo").length, icon: "🏫", color: "var(--blue)" },
                { label: "Escola Líder", val: sorted[0]?.name.split(" ").slice(0, 3).join(" "), icon: "🏆", color: "#FFD700" },
                { label: "Meta Geral", val: "2.000 L", icon: "🎯", color: "var(--red)" },
              ].map((c, i) => (
                <div key={i} className="stat-card" style={{ borderRadius: 18 }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{c.icon}</div>
                  <div className="t-data" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: c.color, letterSpacing: -1, lineHeight: 1.1 }}>{c.val}</div>
                  <div className="t-small" style={{ marginTop: 8 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="glass" style={{ borderRadius: 20, padding: 28, marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span className="t-eyebrow" style={{ fontSize: 10 }}>Meta Geral da Campanha</span>
                <span className="t-data" style={{ fontSize: 14, color: "var(--neon)" }}>{totalLiters} / 2.000 L</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 8,
                  background: "linear-gradient(90deg,var(--neon),var(--dark))",
                  width: `${Math.min((totalLiters / 2000) * 100, 100)}%`,
                  boxShadow: "0 0 20px rgba(124,255,79,0.5)",
                  transition: "width 1.2s cubic-bezier(.16,1,.3,1)"
                }} />
              </div>
              <div className="t-small" style={{ marginTop: 12 }}>{Math.round((totalLiters / 2000) * 100)}% da meta atingida</div>
            </div>

            {/* Mini ranking with liters */}
            <div className="glass" style={{ borderRadius: 20, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="t-eyebrow" style={{ fontSize: 10 }}>Ranking Interno — Litros Reais</span>
              </div>
              <table>
                <thead><tr>
                  <th>#</th><th>Escola</th><th>Litros</th><th>Participação</th>
                </tr></thead>
                <tbody>
                  {sorted.map((s, i) => (
                    <tr key={s.id}>
                      <td className="t-data" style={{ color: "var(--neon)", fontFamily: "var(--font-mono)" }}>#{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td><span className="t-data" style={{ color: "var(--neon)", fontFamily: "var(--font-mono)" }}>{s.liters} L</span></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 80, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", background: "var(--neon)", width: `${(s.liters / sorted[0].liters) * 100}%`, borderRadius: 4 }} />
                          </div>
                          <span className="t-data" style={{ fontSize: 12, color: "rgba(240,240,240,.5)" }}>
                            {Math.round((s.liters / totalLiters) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SCHOOLS */}
        {tab === "schools" && (
          <div className="scale-in">
            <div style={{ marginBottom: 36 }}>
              <div className="t-eyebrow" style={{ marginBottom: 12 }}>Gestão</div>
              <h1 className="t-title" style={{ fontSize: 32 }}>Gerenciar Escolas</h1>
            </div>

            {/* Add form */}
            <div className="glass" style={{ borderRadius: 20, padding: 24, marginBottom: 24 }}>
              <div className="t-eyebrow" style={{ fontSize: 10, marginBottom: 18 }}>Adicionar Escola</div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: 2, minWidth: 200 }}>
                  <label className="t-small" style={{ display: "block", marginBottom: 8, fontSize: 11 }}>Nome da Escola</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome da escola..." />
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <label className="t-small" style={{ display: "block", marginBottom: 8, fontSize: 11 }}>Litros</label>
                  <input type="number" value={newLiters} onChange={e => setNewLiters(e.target.value)} placeholder="0" min="0" />
                </div>
                <button className="btn-primary" style={{ padding: "12px 24px", fontSize: 13, whiteSpace: "nowrap" }} onClick={addSchool}>
                  + Adicionar
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="glass" style={{ borderRadius: 20, overflow: "hidden" }}>
              <table>
                <thead><tr>
                  <th>#</th><th>Escola</th><th>Litros</th><th>Status</th><th>Ações</th>
                </tr></thead>
                <tbody>
                  {sorted.map((s, i) => (
                    <tr key={s.id}>
                      <td className="t-data" style={{ fontFamily: "var(--font-mono)", color: "var(--neon)", width: 40 }}>#{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td>
                        {editId === s.id ? (
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input type="number" value={editLiters} onChange={e => setEditLiters(e.target.value)} style={{ width: 80, padding: "6px 10px", fontSize: 13 }} />
                            <button className="btn-primary" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => saveEdit(s.id)}>✓</button>
                            <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setEditId(null)}>✕</button>
                          </div>
                        ) : (
                          <span className="t-data" style={{ color: "var(--neon)", fontFamily: "var(--font-mono)" }}>{s.liters} L</span>
                        )}
                      </td>
                      <td>
                        <span style={{ background: "rgba(124,255,79,0.1)", color: "var(--neon)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontFamily: "var(--font-body)" }}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            style={{ background: "rgba(168,200,255,0.1)", color: "var(--blue)", border: "1px solid rgba(168,200,255,0.2)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, transition: "all .2s", fontFamily: "var(--font-body)" }}
                            onClick={() => { setEditId(s.id); setEditLiters(s.liters); }}
                          >
                            Editar
                          </button>
                          <button className="btn-danger" onClick={() => removeSchool(s.id)}>Remover</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <div className="scale-in">
            <div style={{ marginBottom: 36 }}>
              <div className="t-eyebrow" style={{ marginBottom: 12 }}>Registros</div>
              <h1 className="t-title" style={{ fontSize: 32 }}>Histórico de Coletas</h1>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { date: "20/05/2025 14:32", school: "E.E. Prof. João Silva", amount: "42 L", op: "Registro", user: "admin" },
                { date: "20/05/2025 11:15", school: "CIEP 238 Verde Esperança", amount: "28 L", op: "Registro", user: "admin" },
                { date: "19/05/2025 16:44", school: "EM Prof. Maria Graças", amount: "35 L", op: "Registro", user: "admin" },
                { date: "19/05/2025 09:20", school: "EM Futuro Verde", amount: "19 L", op: "Registro", user: "admin" },
                { date: "18/05/2025 15:00", school: "E.E. Prof. João Silva", amount: "60 L", op: "Registro", user: "admin" },
                { date: "18/05/2025 13:30", school: "CEst. Ipê Amarelo", amount: "22 L", op: "Registro", user: "admin" },
                { date: "17/05/2025 10:00", school: "EM Riachuelo Eco", amount: "31 L", op: "Registro", user: "admin" },
              ].map((h, i) => (
                <div key={i} className="glass" style={{
                  borderRadius: 14, padding: "18px 24px", display: "flex", gap: 18, alignItems: "center",
                  animation: "slideIn .4s cubic-bezier(.16,1,.3,1) both",
                  animationDelay: `${i * 0.05}s`
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--neon)", boxShadow: "0 0 10px var(--neon)", flexShrink: 0 }} />
                  <div className="t-data" style={{ color: "rgba(240,240,240,.45)", fontSize: 12, fontFamily: "var(--font-mono)", flexShrink: 0, minWidth: 150 }}>{h.date}</div>
                  <div style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(240,240,240,.8)" }}>{h.school}</div>
                  <div className="t-data" style={{ color: "var(--neon)", fontFamily: "var(--font-mono)", fontSize: 14 }}>{h.amount}</div>
                  <div style={{ background: "rgba(124,255,79,0.08)", color: "var(--neon)", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontFamily: "var(--font-body)" }}>{h.op}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATS */}
        {tab === "stats" && (
          <div className="scale-in">
            <div style={{ marginBottom: 36 }}>
              <div className="t-eyebrow" style={{ marginBottom: 12 }}>Análise Interna</div>
              <h1 className="t-title" style={{ fontSize: 32 }}>Estatísticas</h1>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {/* Litros por escola */}
              <div className="glass" style={{ borderRadius: 20, padding: 28 }}>
                <div className="t-eyebrow" style={{ fontSize: 10, marginBottom: 24 }}>Litros por Escola</div>
                {sorted.map((s, i) => (
                  <div key={i} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span className="t-small" style={{ fontSize: 12, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name.split(" ").slice(0, 3).join(" ")}</span>
                      <span className="t-data" style={{ color: "var(--neon)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{s.liters} L</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 5, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", background: `hsl(${120 - i * 15},80%,55%)`,
                        width: `${(s.liters / sorted[0].liters) * 100}%`,
                        borderRadius: 5, boxShadow: `0 0 10px hsl(${120 - i * 15},80%,55%,0.4)`,
                        transition: `width 1.2s cubic-bezier(.16,1,.3,1) ${i * 0.1}s`
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Total Coletado", val: `${totalLiters} L`, sub: "campanha 2025", color: "var(--neon)" },
                  { label: "Média por Escola", val: `${Math.round(totalLiters / rows.length)} L`, sub: "por escola", color: "var(--blue)" },
                  { label: "Litros Faltando", val: `${Math.max(2000 - totalLiters, 0)} L`, sub: "para a meta", color: "var(--red)" },
                  { label: "Progresso", val: `${Math.round((totalLiters / 2000) * 100)}%`, sub: "da meta geral", color: "#FFD700" },
                ].map((c, i) => (
                  <div key={i} className="stat-card" style={{ borderRadius: 16, padding: "20px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div className="t-small" style={{ fontSize: 11, marginBottom: 6 }}>{c.label}</div>
                        <div style={{ color: c.color, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, letterSpacing: -1 }}>{c.val}</div>
                      </div>
                      <div className="t-small" style={{ fontSize: 11, opacity: .5 }}>{c.sub}</div>
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
const Footer = ({ setPage }) => (
  <footer style={{
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "40px 48px",
    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <LogoImg size={28} />
      <span className="t-brand" style={{ fontSize: 16 }}>Óleo Verde</span>
    </div>
    <p className="t-small" style={{ fontSize: 12, opacity: .35 }}>© 2025 Óleo Verde · Competição Escolar de Reciclagem</p>
    <div style={{ display: "flex", gap: 28 }}>
      {["home", "about", "ranking", "impact"].map(p => (
        <span key={p} className="nav-link" style={{ fontSize: 12 }} onClick={() => setPage(p)}>
          {p === "home" ? "Início" : p === "about" ? "Projeto" : p === "ranking" ? "Ranking" : "Impacto"}
        </span>
      ))}
    </div>
  </footer>
);

// ═══════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check persisted session on mount
  useEffect(() => {
    const session = getSession();
    if (session) setIsAdmin(true);
  }, []);

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setPage("admin-dashboard");
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setPage("home");
  };

  const navigate = (p) => {
    if (p === "admin") {
      if (isAdmin) setPage("admin-dashboard");
      else setPage("admin-login");
    } else {
      setPage(p);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isAdminPage = page === "admin-login" || page === "admin-dashboard";
  const showNavbar = !isAdminPage;
  const showFooter = !isAdminPage && !loading;

  return (
    <>
      <style>{STYLES}</style>
      <Particles />

      {loading && <LoadingScreen onDone={() => setLoading(false)} />}

      {!loading && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {showNavbar && <Navbar page={page} setPage={navigate} isAdmin={isAdmin} />}

          {page === "home" && <HomePage setPage={navigate} />}
          {page === "about" && <AboutPage />}
          {page === "ranking" && <RankingPage />}
          {page === "impact" && <ImpactPage />}
          {page === "admin-login" && <AdminLogin onLogin={handleAdminLogin} />}
          {page === "admin-dashboard" && isAdmin && <AdminDashboard onLogout={handleLogout} />}
          {page === "admin-dashboard" && !isAdmin && <AdminLogin onLogin={handleAdminLogin} />}

          {showFooter && <Footer setPage={navigate} />}
        </div>
      )}
    </>
  );
}
