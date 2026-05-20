import { useState, useEffect, useRef } from "react";

// ── Logo SVG (inspired by the atom + laurel wreath image) ──────────────────
const LogoSVG = ({ size = 48, glow = false }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none"
    style={glow ? { filter: "drop-shadow(0 0 12px #7CFF4F99)" } : {}}>
    {/* Laurel left */}
    <g stroke="#7CFF4F" strokeWidth="1.5" fill="none">
      <ellipse cx="28" cy="60" rx="7" ry="12" transform="rotate(-30 28 60)" fill="#7CFF4F" opacity=".8"/>
      <ellipse cx="20" cy="45" rx="6" ry="10" transform="rotate(-45 20 45)" fill="#7CFF4F" opacity=".7"/>
      <ellipse cx="18" cy="30" rx="5" ry="9" transform="rotate(-55 18 30)" fill="#4CAF50" opacity=".6"/>
      <ellipse cx="30" cy="75" rx="6" ry="10" transform="rotate(-20 30 75)" fill="#7CFF4F" opacity=".7"/>
      <ellipse cx="38" cy="88" rx="5" ry="8" transform="rotate(-10 38 88)" fill="#4CAF50" opacity=".6"/>
      <line x1="32" y1="95" x2="55" y2="105" stroke="#4CAF50" strokeWidth="2"/>
    </g>
    {/* Laurel right */}
    <g stroke="#7CFF4F" strokeWidth="1.5" fill="none">
      <ellipse cx="92" cy="60" rx="7" ry="12" transform="rotate(30 92 60)" fill="#7CFF4F" opacity=".8"/>
      <ellipse cx="100" cy="45" rx="6" ry="10" transform="rotate(45 100 45)" fill="#7CFF4F" opacity=".7"/>
      <ellipse cx="102" cy="30" rx="5" ry="9" transform="rotate(55 102 30)" fill="#4CAF50" opacity=".6"/>
      <ellipse cx="90" cy="75" rx="6" ry="10" transform="rotate(20 90 75)" fill="#7CFF4F" opacity=".7"/>
      <ellipse cx="82" cy="88" rx="5" ry="8" transform="rotate(10 82 88)" fill="#4CAF50" opacity=".6"/>
      <line x1="88" y1="95" x2="65" y2="105" stroke="#4CAF50" strokeWidth="2"/>
    </g>
    {/* Atom orbits */}
    <ellipse cx="60" cy="60" rx="28" ry="10" stroke="#A8C8FF" strokeWidth="1.8" opacity=".9"/>
    <ellipse cx="60" cy="60" rx="28" ry="10" stroke="#A8C8FF" strokeWidth="1.8" opacity=".9" transform="rotate(60 60 60)"/>
    <ellipse cx="60" cy="60" rx="28" ry="10" stroke="#A8C8FF" strokeWidth="1.8" opacity=".9" transform="rotate(-60 60 60)"/>
    {/* Nucleus */}
    <circle cx="60" cy="60" r="9" fill="#FF6B5E"/>
    <circle cx="60" cy="60" r="6" fill="#FF8A80" opacity=".9"/>
    {/* Electrons */}
    <circle cx="88" cy="60" r="3" fill="#7CFF4F"/>
    <circle cx="46" cy="41" r="3" fill="#7CFF4F"/>
    <circle cx="46" cy="79" r="3" fill="#7CFF4F"/>
  </svg>
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
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
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
        ctx.fillStyle = `rgba(124,255,79,${p.a * 0.5})`;
        ctx.fill();
      });
      // Lines between close particles
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(124,255,79,${(1 - d / 120) * 0.15})`;
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

// ── CSS keyframes injected once ─────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --neon:#7CFF4F;--dark:#0B5D3B;--black:#050505;--white:#F5F5F5;--red:#FF6B5E;
  --glow:0 0 20px #7CFF4F55, 0 0 60px #7CFF4F22;
  --glow-strong:0 0 30px #7CFF4Faa, 0 0 80px #7CFF4F44;
}
body{background:#050505;color:#F5F5F5;font-family:'DM Sans',sans-serif;overflow-x:hidden;}
@keyframes floatY{0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 20px #7CFF4F44;}50%{box-shadow:0 0 50px #7CFF4Faa;}}
@keyframes spinOrbit{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes barFill{from{width:0}to{width:var(--w)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:translateY(0);}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
@keyframes ping{0%{transform:scale(1);opacity:1;}100%{transform:scale(2);opacity:0;}}
@keyframes slideIn{from{transform:translateX(-30px);opacity:0;}to{transform:translateX(0);opacity:1;}}
.float{animation:floatY 4s ease-in-out infinite;}
.pulse-glow{animation:pulseGlow 2.5s ease-in-out infinite;}
.fade-up{animation:fadeUp .7s ease both;}
.shimmer-text{
  background:linear-gradient(90deg,#7CFF4F,#fff,#7CFF4F);
  background-size:200%;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  animation:shimmer 3s linear infinite;
}
.neon-border{border:1px solid #7CFF4F44;box-shadow:0 0 20px #7CFF4F11,inset 0 0 20px #7CFF4F08;}
.glass{background:rgba(11,93,59,0.08);backdrop-filter:blur(20px);border:1px solid rgba(124,255,79,0.12);}
.card-hover{transition:transform .3s,box-shadow .3s;}
.card-hover:hover{transform:translateY(-6px);box-shadow:0 20px 60px rgba(124,255,79,0.15);}
.btn-neon{
  background:linear-gradient(135deg,#7CFF4F,#0B5D3B);
  color:#050505;font-weight:700;border:none;cursor:pointer;
  padding:14px 32px;border-radius:50px;font-family:'Orbitron',sans-serif;font-size:13px;
  letter-spacing:1px;transition:all .3s;
  box-shadow:0 0 30px #7CFF4F55;
}
.btn-neon:hover{box-shadow:0 0 60px #7CFF4Faa;transform:scale(1.04);}
.btn-ghost{
  background:transparent;color:#7CFF4F;font-weight:600;cursor:pointer;
  padding:12px 28px;border-radius:50px;font-family:'Orbitron',sans-serif;font-size:12px;
  letter-spacing:1px;transition:all .3s;border:1px solid #7CFF4F55;
}
.btn-ghost:hover{background:#7CFF4F11;border-color:#7CFF4F;box-shadow:0 0 30px #7CFF4F33;}
.nav-link{
  color:#F5F5F5aa;font-size:13px;cursor:pointer;letter-spacing:.5px;
  transition:color .2s;position:relative;
}
.nav-link:hover,.nav-link.active{color:#7CFF4F;}
.nav-link.active::after{
  content:'';position:absolute;bottom:-4px;left:0;width:100%;height:2px;
  background:#7CFF4F;border-radius:2px;box-shadow:0 0 8px #7CFF4F;
}
.rank-bar{
  height:6px;border-radius:6px;background:linear-gradient(90deg,#7CFF4F,#0B5D3B);
  width:var(--w);box-shadow:0 0 10px #7CFF4F55;
  animation:barFill 1.2s ease both;
}
.medal-1{background:linear-gradient(135deg,#FFD700,#FFA000);box-shadow:0 0 20px #FFD70066;}
.medal-2{background:linear-gradient(135deg,#C0C0C0,#9E9E9E);box-shadow:0 0 16px #C0C0C066;}
.medal-3{background:linear-gradient(135deg,#CD7F32,#8D4E00);box-shadow:0 0 16px #CD7F3266;}
.medal-n{background:rgba(255,255,255,0.06);}
.stat-card{
  background:linear-gradient(135deg,rgba(11,93,59,0.2),rgba(5,5,5,0.8));
  border:1px solid rgba(124,255,79,0.15);border-radius:20px;padding:28px;
  transition:all .3s;
}
.stat-card:hover{border-color:#7CFF4F55;box-shadow:0 10px 40px rgba(124,255,79,0.12);}
input,select{
  background:rgba(255,255,255,0.04);border:1px solid rgba(124,255,79,0.2);
  color:#F5F5F5;border-radius:10px;padding:10px 14px;font-family:'DM Sans',sans-serif;
  font-size:14px;outline:none;transition:border .2s,box-shadow .2s;width:100%;
}
input:focus,select:focus{border-color:#7CFF4F;box-shadow:0 0 16px #7CFF4F33;}
table{width:100%;border-collapse:collapse;}
th{color:#7CFF4F;font-family:'Orbitron',sans-serif;font-size:10px;letter-spacing:1px;
   padding:14px 16px;text-align:left;border-bottom:1px solid rgba(124,255,79,0.1);}
td{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:14px;color:#F5F5F5cc;}
tr:hover td{background:rgba(124,255,79,0.04);}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:#050505;}
::-webkit-scrollbar-thumb{background:#7CFF4F44;border-radius:4px;}
`;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const SectionReveal = ({ children, delay = 0 }) => {
  const ref = useRef();
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(40px)",
      transition: `opacity .8s ease ${delay}s, transform .8s ease ${delay}s`
    }}>{children}</div>
  );
};

// ── LOADING SCREEN ──────────────────────────────────────────────────────────
const LoadingScreen = ({ onDone }) => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setPct(p => { if (p >= 100) { clearInterval(iv); setTimeout(onDone, 300); return 100; } return p + 2; }), 30);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#050505", zIndex: 9999,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32
    }}>
      <div className="float"><LogoSVG size={90} glow /></div>
      <div style={{ fontFamily: "Orbitron", fontSize: 22, fontWeight: 900, letterSpacing: 4, color: "#7CFF4F" }} className="shimmer-text">
        ÓLEO VERDE
      </div>
      <div style={{ width: 280, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#7CFF4F,#0B5D3B)", transition: "width .05s", boxShadow: "0 0 12px #7CFF4F" }} />
      </div>
      <div style={{ color: "#7CFF4F77", fontFamily: "Orbitron", fontSize: 11, letterSpacing: 2 }}>
        CARREGANDO SISTEMA... {pct}%
      </div>
    </div>
  );
};

// ── NAVBAR ──────────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { id: "home", label: "Início" }, { id: "about", label: "Projeto" },
    { id: "ranking", label: "Ranking" }, { id: "impact", label: "Impacto" },
  ];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      padding: "0 40px", height: 70,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(5,5,5,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(124,255,79,0.08)" : "none",
      transition: "all .4s"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setPage("home")}>
        <LogoSVG size={36} glow={scrolled} />
        <span style={{ fontFamily: "Orbitron", fontWeight: 900, fontSize: 16, color: "#7CFF4F", letterSpacing: 2 }}>ÓLEO VERDE</span>
      </div>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {links.map(l => (
          <span key={l.id} className={`nav-link ${page === l.id ? "active" : ""}`} onClick={() => setPage(l.id)}>{l.label}</span>
        ))}
        <button className="btn-ghost" style={{ fontSize: 11, padding: "8px 20px" }} onClick={() => setPage("admin")}>Admin</button>
      </div>
    </nav>
  );
};

// ── HOME PAGE ───────────────────────────────────────────────────────────────
const HomePage = ({ setPage }) => {
  const [started, setStarted] = useState(false);
  const ref = useRef();
  const statsRef = useRef();
  const [statsVis, setStatsVis] = useState(false);
  const c1 = useCounter(1247, 2200, statsVis);
  const c2 = useCounter(38, 1800, statsVis);
  const c3 = useCounter(24, 1600, statsVis);

  useEffect(() => {
    setTimeout(() => setStarted(true), 100);
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVis(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div>
      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "100px 24px 60px" }}>
        {/* Radial glow */}
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(circle,rgba(124,255,79,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
        
        <div style={{ textAlign: "center", maxWidth: 800, position: "relative", zIndex: 1 }}>
          <div className="float" style={{ marginBottom: 32 }}>
            <LogoSVG size={110} glow />
          </div>

          <div style={{
            fontFamily: "Orbitron", fontWeight: 900, fontSize: "clamp(36px,7vw,80px)",
            lineHeight: 1.05, letterSpacing: "-1px",
            opacity: started ? 1 : 0, transform: started ? "none" : "translateY(30px)",
            transition: "all .9s ease .2s"
          }}>
            <span className="shimmer-text">ÓLEO VERDE</span>
          </div>

          <div style={{
            fontFamily: "Orbitron", fontSize: "clamp(12px,2vw,17px)", letterSpacing: 6,
            color: "#7CFF4F99", marginTop: 12, marginBottom: 32,
            opacity: started ? 1 : 0, transition: "all .9s ease .4s"
          }}>
            COMPETIÇÃO ESCOLAR DE RECICLAGEM
          </div>

          <p style={{
            fontSize: 18, lineHeight: 1.8, color: "#F5F5F5bb", maxWidth: 580, margin: "0 auto 48px",
            opacity: started ? 1 : 0, transition: "all .9s ease .5s"
          }}>
            Juntos, transformamos óleo descartado em energia e futuro. Cada gota coletada protege rios, lençóis freáticos e vidas.
          </p>

          {/* Impact phrase */}
          <div style={{
            background: "linear-gradient(135deg,rgba(255,107,94,0.12),rgba(255,107,94,0.04))",
            border: "1px solid rgba(255,107,94,0.3)", borderRadius: 16, padding: "20px 32px",
            marginBottom: 48, maxWidth: 560, margin: "0 auto 48px",
            opacity: started ? 1 : 0, transition: "all .9s ease .6s"
          }}>
            <span style={{ fontSize: 15, color: "#FF6B5Ecc", fontStyle: "italic", lineHeight: 1.6 }}>
              "1 litro de óleo pode contaminar até 1 milhão de litros de água potável."
            </span>
          </div>

          <div style={{
            display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap",
            opacity: started ? 1 : 0, transition: "all .9s ease .7s"
          }}>
            <button className="btn-neon" onClick={() => setPage("ranking")}>Ver Ranking ↗</button>
            <button className="btn-ghost" onClick={() => setPage("about")}>Saiba Mais</button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.4 }}>
          <div style={{ width: 1, height: 40, background: "linear-gradient(#7CFF4F,transparent)", animation: "fadeUp 1.5s ease infinite" }} />
          <span style={{ fontSize: 10, fontFamily: "Orbitron", letterSpacing: 3, color: "#7CFF4F" }}>SCROLL</span>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
          {[
            { value: c1, suffix: " litros", label: "Óleo coletado", icon: "🫙", color: "#7CFF4F" },
            { value: c2, suffix: " escolas", label: "Participantes", icon: "🏫", color: "#A8C8FF" },
            { value: c3, suffix: " cidades", label: "Municípios", icon: "🌍", color: "#FF6B5E" },
          ].map((s, i) => (
            <SectionReveal key={i} delay={i * 0.15}>
              <div className="stat-card card-hover">
                <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontFamily: "Orbitron", fontWeight: 900, fontSize: 42, color: s.color, lineHeight: 1 }}>
                  {s.value}{s.suffix}
                </div>
                <div style={{ color: "#F5F5F5aa", fontSize: 14, marginTop: 8, letterSpacing: 1 }}>{s.label}</div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* MINI ABOUT */}
      <section style={{ padding: "60px 40px 100px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionReveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "Orbitron", fontSize: 11, letterSpacing: 4, color: "#7CFF4F", marginBottom: 16 }}>NOSSA MISSÃO</div>
              <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, lineHeight: 1.2, marginBottom: 24 }}>
                Ciência + Educação + <span style={{ color: "#7CFF4F" }}>Planeta</span>
              </h2>
              <p style={{ color: "#F5F5F5aa", lineHeight: 1.9, fontSize: 16, marginBottom: 32 }}>
                O Óleo Verde une escolas do município em uma competição ecológica que desperta consciência ambiental e promove a reciclagem de óleo de cozinha — uma das maiores ameaças à qualidade da água.
              </p>
              <button className="btn-neon" onClick={() => setPage("about")}>Conheça o Projeto</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { icon: "♻️", title: "Reciclagem", desc: "Óleo vira biodiesel e sabão artesanal" },
                { icon: "💧", title: "Água limpa", desc: "Protegemos rios e lençóis freáticos" },
                { icon: "🔬", title: "Ciência", desc: "Aprendizado prático e significativo" },
                { icon: "🏆", title: "Competição", desc: "Gamificação para motivar escolas" },
              ].map((c, i) => (
                <div key={i} className="glass card-hover" style={{ borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: "#7CFF4F" }}>{c.title}</div>
                  <div style={{ color: "#F5F5F5aa", fontSize: 12, lineHeight: 1.5 }}>{c.desc}</div>
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
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 40px 100px" }}>
      <SectionReveal>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontFamily: "Orbitron", fontSize: 11, letterSpacing: 5, color: "#7CFF4F", marginBottom: 16 }}>SOBRE O PROJETO</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, fontFamily: "Orbitron" }}>
            <span className="shimmer-text">Por Que Reciclar?</span>
          </h1>
        </div>
      </SectionReveal>

      <div style={{ display: "grid", gap: 32 }}>
        {[
          {
            icon: "🌊", title: "O Problema do Óleo",
            text: "O óleo de cozinha descartado incorretamente no ralo entope tubulações, contamina rios e mata a biodiversidade aquática. Um único litro pode criar uma película impermeável de 1 km² na superfície da água, impedindo a oxigenação necessária para a vida marinha.",
            color: "#FF6B5E"
          },
          {
            icon: "🔋", title: "A Solução: Reciclagem",
            text: "O óleo coletado é transformado em biodiesel renovável, sabão ecológico e outros insumos industriais. Além de evitar a poluição, gera renda para comunidades e reduz a emissão de gases do efeito estufa em comparação com combustíveis fósseis.",
            color: "#7CFF4F"
          },
          {
            icon: "🏫", title: "O Papel das Escolas",
            text: "As escolas são agentes de transformação. Ao engajar alunos, famílias e comunidades na coleta, criamos uma rede de consciência ambiental que vai muito além das paredes da sala de aula. A competição saudável acelera a mudança de comportamento.",
            color: "#A8C8FF"
          },
        ].map((item, i) => (
          <SectionReveal key={i} delay={i * 0.1}>
            <div className="glass card-hover" style={{ borderRadius: 24, padding: "36px 40px", display: "flex", gap: 28, alignItems: "flex-start" }}>
              <div style={{ fontSize: 52, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: item.color, marginBottom: 12 }}>{item.title}</h3>
                <p style={{ color: "#F5F5F5bb", lineHeight: 1.9, fontSize: 15 }}>{item.text}</p>
              </div>
            </div>
          </SectionReveal>
        ))}
      </div>

      {/* Timeline */}
      <SectionReveal delay={0.3}>
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "Orbitron", fontSize: 22, color: "#7CFF4F", marginBottom: 40, textAlign: "center", letterSpacing: 2 }}>COMO FUNCIONA</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
            <div style={{ position: "absolute", left: 28, top: 0, bottom: 0, width: 1, background: "linear-gradient(#7CFF4F,transparent)" }} />
            {[
              { step: "01", title: "Coleta em Casa", desc: "Cada aluno recolhe o óleo usado da própria família em garrafas PET." },
              { step: "02", title: "Entrega na Escola", desc: "O óleo é entregue nos pontos de coleta da escola durante o período da campanha." },
              { step: "03", title: "Pesagem e Registro", desc: "A equipe registra o volume coletado por turma e por escola." },
              { step: "04", title: "Pontuação no Sistema", desc: "Os pontos são atualizados no sistema e o ranking é exibido em tempo real." },
              { step: "05", title: "Premiação", desc: "As melhores escolas recebem troféus, certificados e brindes sustentáveis." },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 28, alignItems: "flex-start", paddingBottom: 36, paddingLeft: 0 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                  background: "linear-gradient(135deg,#7CFF4F,#0B5D3B)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Orbitron", fontWeight: 900, fontSize: 12, color: "#050505",
                  boxShadow: "0 0 20px #7CFF4F55"
                }}>{s.step}</div>
                <div style={{ paddingTop: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{s.title}</div>
                  <div style={{ color: "#F5F5F5aa", fontSize: 14, lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>
    </div>
  </div>
);

// ── RANKING PAGE ────────────────────────────────────────────────────────────
const RankingPage = () => {
  const maxScore = schools[0].score;
  const medals = ["medal-1", "medal-2", "medal-3"];
  const medalEmoji = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ paddingTop: 100, minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 100px" }}>
        <SectionReveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontFamily: "Orbitron", fontSize: 11, letterSpacing: 5, color: "#7CFF4F", marginBottom: 16 }}>CLASSIFICAÇÃO GERAL</div>
            <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, fontFamily: "Orbitron" }}>
              <span className="shimmer-text">Ranking das Escolas</span>
            </h1>
            <p style={{ color: "#F5F5F5aa", marginTop: 16, fontSize: 15 }}>Atualizado em tempo real • Pontuação baseada no volume coletado</p>
          </div>
        </SectionReveal>

        {/* Top 3 */}
        <SectionReveal delay={0.1}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 40 }}>
            {schools.slice(0, 3).map((s, i) => (
              <div key={s.id} className={`card-hover ${medals[i]}`} style={{
                borderRadius: 24, padding: "32px 20px", textAlign: "center",
                border: "1px solid rgba(255,255,255,0.2)",
                transform: i === 0 ? "scale(1.04)" : "scale(0.97)",
                animation: i === 0 ? "pulseGlow 3s infinite" : "none",
                order: i === 0 ? 2 : i === 1 ? 1 : 3
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{medalEmoji[i]}</div>
                <div style={{ fontFamily: "Orbitron", fontWeight: 900, fontSize: 28, color: "#050505", lineHeight: 1 }}>#{s.rank}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#050505cc", margin: "12px 0 8px", lineHeight: 1.4 }}>{s.name}</div>
                <div style={{ fontFamily: "Orbitron", fontWeight: 900, fontSize: 20, color: "#050505" }}>{s.score.toLocaleString()} pts</div>
                <div style={{ fontSize: 12, color: "#050505aa", marginTop: 6 }}>{s.trend} esta semana</div>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* Full ranking */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {schools.map((s, i) => (
            <SectionReveal key={s.id} delay={i * 0.07}>
              <div className="glass card-hover" style={{ borderRadius: 16, padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: i < 3 ? 0 : 12 }}>
                  <div className={`${i < 3 ? medals[i] : "medal-n"}`} style={{
                    width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "Orbitron", fontWeight: 900, fontSize: 14, color: i < 3 ? "#050505" : "#F5F5F5",
                    flexShrink: 0
                  }}>
                    {i < 3 ? medalEmoji[i] : `#${s.rank}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                    <div style={{ color: "#7CFF4F", fontSize: 12, fontFamily: "Orbitron" }}>{s.trend} esta semana</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "Orbitron", fontWeight: 900, fontSize: 18, color: i < 3 ? "#7CFF4F" : "#F5F5F5" }}>{s.score.toLocaleString()}</div>
                    <div style={{ color: "#F5F5F5aa", fontSize: 11 }}>pontos</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 5, overflow: "hidden", marginTop: 14 }}>
                  <div className="rank-bar" style={{ "--w": `${(s.score / maxScore) * 100}%` }} />
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
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
    { label: "Biodiesel", pct: 78, color: "#7CFF4F" },
    { label: "Sabão Artesanal", pct: 52, color: "#A8C8FF" },
    { label: "Ração Animal", pct: 34, color: "#FFD700" },
    { label: "Tinta & Verniz", pct: 18, color: "#FF6B5E" },
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
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 40px 100px" }}>
        <SectionReveal>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: "Orbitron", fontSize: 11, letterSpacing: 5, color: "#7CFF4F", marginBottom: 16 }}>DADOS CIENTÍFICOS</div>
            <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, fontFamily: "Orbitron" }}>
              <span className="shimmer-text">Impacto Ambiental</span>
            </h1>
          </div>
        </SectionReveal>

        {/* Facts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20, marginBottom: 64 }}>
          {facts.map((f, i) => (
            <SectionReveal key={i} delay={i * 0.08}>
              <div className="glass card-hover" style={{ borderRadius: 20, padding: "28px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontFamily: "Orbitron", fontWeight: 900, fontSize: 22, color: "#7CFF4F", marginBottom: 8, lineHeight: 1.1 }}>{f.stat}</div>
                <div style={{ color: "#F5F5F5aa", fontSize: 12, lineHeight: 1.5 }}>{f.label}</div>
              </div>
            </SectionReveal>
          ))}
        </div>

        {/* Bar chart */}
        <SectionReveal delay={0.2}>
          <div className="glass" style={{ borderRadius: 24, padding: "40px" }}>
            <h2 style={{ fontFamily: "Orbitron", fontSize: 16, color: "#7CFF4F", marginBottom: 36, letterSpacing: 2 }}>DESTINO DO ÓLEO RECICLADO</h2>
            <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {bars.map((b, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{b.label}</span>
                    <span style={{ fontFamily: "Orbitron", color: b.color, fontSize: 14, fontWeight: 700 }}>{b.pct}%</span>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 8,
                      background: `linear-gradient(90deg,${b.color},${b.color}88)`,
                      width: vis ? `${b.pct}%` : "0%",
                      transition: `width 1.2s ease ${i * 0.15}s`,
                      boxShadow: `0 0 12px ${b.color}55`
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
            marginTop: 60, textAlign: "center", padding: "60px 40px",
            background: "linear-gradient(135deg,rgba(11,93,59,0.3),rgba(124,255,79,0.05))",
            border: "1px solid rgba(124,255,79,0.2)", borderRadius: 28
          }}>
            <LogoSVG size={64} glow />
            <h2 style={{ fontFamily: "Orbitron", fontWeight: 900, fontSize: 28, margin: "24px 0 16px" }}>
              Faça Parte da Mudança
            </h2>
            <p style={{ color: "#F5F5F5bb", lineHeight: 1.8, maxWidth: 500, margin: "0 auto 32px" }}>
              Convide sua escola a participar. Cada litro coletado é um passo em direção a um planeta mais limpo e saudável.
            </p>
            <button className="btn-neon" style={{ fontSize: 13 }}>Inscrever Minha Escola</button>
          </div>
        </SectionReveal>
      </div>
    </div>
  );
};

// ── ADMIN LOGIN ─────────────────────────────────────────────────────────────
const AdminLogin = ({ onLogin }) => {
  const [user, setUser] = useState(""); const [pass, setPass] = useState("");
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, background: "radial-gradient(circle,rgba(124,255,79,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div className="glass" style={{ width: "100%", maxWidth: 440, borderRadius: 28, padding: "48px 40px", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <LogoSVG size={56} glow />
          <div style={{ fontFamily: "Orbitron", fontWeight: 900, fontSize: 20, color: "#7CFF4F", marginTop: 16, letterSpacing: 2 }}>PAINEL ADMIN</div>
          <div style={{ color: "#F5F5F5aa", fontSize: 13, marginTop: 6 }}>Acesso restrito ao sistema</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontFamily: "Orbitron", letterSpacing: 2, color: "#7CFF4F99", display: "block", marginBottom: 8 }}>USUÁRIO</label>
            <input placeholder="admin@oleoverde.edu.br" value={user} onChange={e => setUser(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontFamily: "Orbitron", letterSpacing: 2, color: "#7CFF4F99", display: "block", marginBottom: 8 }}>SENHA</label>
            <input type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} />
          </div>
          <button className="btn-neon" style={{ marginTop: 8, width: "100%", fontSize: 12, letterSpacing: 2 }} onClick={onLogin}>
            ACESSAR SISTEMA
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 24, color: "#F5F5F5aa", fontSize: 12 }}>
          🔒 Conexão segura — dados criptografados
        </div>
      </div>
    </div>
  );
};

// ── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
const AdminDashboard = ({ onLogout }) => {
  const [tab, setTab] = useState("overview");
  const [rows, setRows] = useState(adminSchools);
  const [newName, setNewName] = useState(""); const [newLiters, setNewLiters] = useState("");

  const addSchool = () => {
    if (!newName || !newLiters) return;
    setRows(r => [...r, { id: Date.now(), name: newName, liters: +newLiters, status: "Ativo" }]);
    setNewName(""); setNewLiters("");
  };
  const removeSchool = id => setRows(r => r.filter(s => s.id !== id));

  const totalLiters = rows.reduce((a, s) => a + s.liters, 0);

  const tabs = [
    { id: "overview", label: "Visão Geral" },
    { id: "schools", label: "Escolas" },
    { id: "history", label: "Histórico" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", paddingTop: 0 }}>
      {/* Sidebar */}
      <div style={{
        width: 240, flexShrink: 0, background: "rgba(11,93,59,0.12)",
        borderRight: "1px solid rgba(124,255,79,0.1)", padding: "28px 20px",
        display: "flex", flexDirection: "column", gap: 8, position: "sticky", top: 0, height: "100vh"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <LogoSVG size={32} glow />
          <span style={{ fontFamily: "Orbitron", fontWeight: 900, fontSize: 13, color: "#7CFF4F", letterSpacing: 1 }}>ADMIN</span>
        </div>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? "rgba(124,255,79,0.12)" : "transparent",
            border: tab === t.id ? "1px solid rgba(124,255,79,0.3)" : "1px solid transparent",
            color: tab === t.id ? "#7CFF4F" : "#F5F5F5aa",
            padding: "12px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
            fontFamily: "Orbitron", fontSize: 11, letterSpacing: 1,
            transition: "all .2s"
          }}>{t.label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn-ghost" style={{ width: "100%", fontSize: 11, marginTop: "auto" }} onClick={onLogout}>Sair</button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "40px 40px", overflow: "auto" }}>
        {tab === "overview" && (
          <div>
            <h1 style={{ fontFamily: "Orbitron", fontWeight: 900, fontSize: 28, color: "#7CFF4F", marginBottom: 8 }}>Visão Geral</h1>
            <p style={{ color: "#F5F5F5aa", marginBottom: 36, fontSize: 14 }}>Painel de controle — Campanha 2025</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 20, marginBottom: 40 }}>
              {[
                { label: "Total de Litros", val: totalLiters + " L", icon: "🫙", color: "#7CFF4F" },
                { label: "Escolas Ativas", val: rows.filter(r => r.status === "Ativo").length, icon: "🏫", color: "#A8C8FF" },
                { label: "Líder Atual", val: rows.sort((a,b)=>b.liters-a.liters)[0]?.name.split(" ").slice(0,2).join(" "), icon: "🏆", color: "#FFD700" },
                { label: "Meta Geral", val: "2.000 L", icon: "🎯", color: "#FF6B5E" },
              ].map((c, i) => (
                <div key={i} className="stat-card" style={{ borderRadius: 20 }}>
                  <div style={{ fontSize: 30, marginBottom: 10 }}>{c.icon}</div>
                  <div style={{ fontFamily: "Orbitron", fontWeight: 900, fontSize: 22, color: c.color }}>{c.val}</div>
                  <div style={{ color: "#F5F5F5aa", fontSize: 12, marginTop: 6 }}>{c.label}</div>
                </div>
              ))}
            </div>
            {/* Progress to goal */}
            <div className="glass" style={{ borderRadius: 20, padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontFamily: "Orbitron", fontSize: 13, color: "#7CFF4F" }}>META GERAL DA CAMPANHA</span>
                <span style={{ fontFamily: "Orbitron", fontSize: 13 }}>{totalLiters} / 2000 L</span>
              </div>
              <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 10,
                  background: "linear-gradient(90deg,#7CFF4F,#0B5D3B)",
                  width: `${Math.min(totalLiters / 20, 100)}%`,
                  boxShadow: "0 0 16px #7CFF4F55", transition: "width 1s"
                }} />
              </div>
              <div style={{ color: "#F5F5F5aa", fontSize: 12, marginTop: 10 }}>{Math.round(totalLiters / 20)}% da meta atingida</div>
            </div>
          </div>
        )}

        {tab === "schools" && (
          <div>
            <h1 style={{ fontFamily: "Orbitron", fontWeight: 900, fontSize: 28, color: "#7CFF4F", marginBottom: 32 }}>Gerenciar Escolas</h1>
            {/* Add school */}
            <div className="glass" style={{ borderRadius: 20, padding: 24, marginBottom: 28, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 2, minWidth: 200 }}>
                <label style={{ fontSize: 10, fontFamily: "Orbitron", letterSpacing: 2, color: "#7CFF4F99", display: "block", marginBottom: 8 }}>NOME DA ESCOLA</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome da escola..." />
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label style={{ fontSize: 10, fontFamily: "Orbitron", letterSpacing: 2, color: "#7CFF4F99", display: "block", marginBottom: 8 }}>LITROS</label>
                <input type="number" value={newLiters} onChange={e => setNewLiters(e.target.value)} placeholder="0" />
              </div>
              <button className="btn-neon" style={{ padding: "11px 24px", fontSize: 11 }} onClick={addSchool}>+ ADICIONAR</button>
            </div>
            {/* Table */}
            <div className="glass" style={{ borderRadius: 20, overflow: "hidden" }}>
              <table>
                <thead><tr>
                  <th>#</th><th>ESCOLA</th><th>LITROS</th><th>STATUS</th><th>AÇÕES</th>
                </tr></thead>
                <tbody>
                  {[...rows].sort((a,b)=>b.liters-a.liters).map((s, i) => (
                    <tr key={s.id}>
                      <td style={{ fontFamily: "Orbitron", fontSize: 13, color: "#7CFF4F" }}>#{i+1}</td>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td>
                        <span style={{ fontFamily: "Orbitron", color: "#7CFF4F", fontWeight: 700 }}>{s.liters} L</span>
                      </td>
                      <td><span style={{ background: "rgba(124,255,79,0.12)", color: "#7CFF4F", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>{s.status}</span></td>
                      <td>
                        <button onClick={() => removeSchool(s.id)} style={{ background: "rgba(255,107,94,0.12)", color: "#FF6B5E", border: "1px solid rgba(255,107,94,0.3)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, transition: "all .2s" }}>
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "history" && (
          <div>
            <h1 style={{ fontFamily: "Orbitron", fontWeight: 900, fontSize: 28, color: "#7CFF4F", marginBottom: 32 }}>Histórico de Coletas</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { date: "20/05/2025 14:32", school: "E.E. Prof. João Silva", amount: "42 L", op: "Registro" },
                { date: "20/05/2025 11:15", school: "CIEP 238 Verde Esperança", amount: "28 L", op: "Registro" },
                { date: "19/05/2025 16:44", school: "EM Prof. Maria Graças", amount: "35 L", op: "Registro" },
                { date: "19/05/2025 09:20", school: "EM Futuro Verde", amount: "19 L", op: "Registro" },
                { date: "18/05/2025 15:00", school: "E.E. Prof. João Silva", amount: "60 L", op: "Registro" },
                { date: "18/05/2025 13:30", school: "CEst. Ipê Amarelo", amount: "22 L", op: "Registro" },
              ].map((h, i) => (
                <div key={i} className="glass" style={{ borderRadius: 14, padding: "16px 22px", display: "flex", gap: 16, alignItems: "center", animation: "slideIn .4s ease both", animationDelay: `${i * 0.06}s` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7CFF4F", boxShadow: "0 0 8px #7CFF4F", flexShrink: 0 }} />
                  <div style={{ color: "#F5F5F5aa", fontSize: 12, fontFamily: "Orbitron", flexShrink: 0, minWidth: 160 }}>{h.date}</div>
                  <div style={{ flex: 1, fontSize: 14 }}>{h.school}</div>
                  <div style={{ fontFamily: "Orbitron", color: "#7CFF4F", fontWeight: 700, fontSize: 14 }}>+{h.amount}</div>
                  <div style={{ background: "rgba(124,255,79,0.08)", color: "#7CFF4F", padding: "4px 12px", borderRadius: 20, fontSize: 11 }}>{h.op}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  const navigate = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  if (loading) return (
    <>
      <style>{STYLES}</style>
      <LoadingScreen onDone={() => setLoading(false)} />
    </>
  );

  if (page === "admin") return (
    <>
      <style>{STYLES}</style>
      <Particles />
      {!adminLoggedIn
        ? <AdminLogin onLogin={() => setAdminLoggedIn(true)} />
        : <AdminDashboard onLogout={() => { setAdminLoggedIn(false); navigate("home"); }} />
      }
    </>
  );

  return (
    <>
      <style>{STYLES}</style>
      <Particles />
      <Navbar page={page} setPage={navigate} />
      <div style={{ position: "relative", zIndex: 1, transition: "opacity .3s" }}>
        {page === "home" && <HomePage setPage={navigate} />}
        {page === "about" && <AboutPage />}
        {page === "ranking" && <RankingPage />}
        {page === "impact" && <ImpactPage />}
      </div>
      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(124,255,79,0.08)", padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoSVG size={28} />
          <span style={{ fontFamily: "Orbitron", fontWeight: 700, fontSize: 13, color: "#7CFF4F", letterSpacing: 2 }}>ÓLEO VERDE</span>
        </div>
        <div style={{ color: "#F5F5F5aa", fontSize: 12 }}>Competição Escolar de Reciclagem • {new Date().getFullYear()}</div>
        <div style={{ color: "#7CFF4F55", fontSize: 11, fontFamily: "Orbitron" }}>♻️ PLANET FIRST</div>
      </footer>
    </>
  );
}
