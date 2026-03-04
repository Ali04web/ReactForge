import { useState, useEffect, useRef } from "react";

const FLOATING_SNIPPETS = [
  "useState()", "useEffect()", "const App = () =>", "props.children",
  "<Fragment>", "React.memo()", "useCallback()", "JSX", ".map()",
  "async/await", "import React", "export default", "useRef()", "[]",
  "key={id}", "{...spread}", "() => {}", "useContext()", "useMemo()",
];

const CHALLENGES = [
  { id: 1, title: "Counter App", level: "Easy", icon: "🔢", desc: "Build a counter with increment, decrement & reset", tag: "useState" },
  { id: 2, title: "Todo List", level: "Easy", icon: "✅", desc: "Classic CRUD todo app with local state", tag: "useState + map" },
  { id: 3, title: "Fetch & Display", level: "Medium", icon: "🌐", desc: "Fetch users from API and render a card grid", tag: "useEffect" },
  { id: 4, title: "Dark Mode Toggle", level: "Easy", icon: "🌙", desc: "Theme switcher using Context API", tag: "useContext" },
  { id: 5, title: "Debounced Search", level: "Medium", icon: "🔍", desc: "Search input with debounce optimization", tag: "useCallback" },
  { id: 6, title: "Infinite Scroll", level: "Hard", icon: "♾️", desc: "Paginated list with IntersectionObserver", tag: "useRef + useEffect" },
];

const STATS = [
  { value: "50+", label: "Challenges" },
  { value: "12", label: "React Hooks" },
  { value: "3", label: "Difficulty Levels" },
  { value: "∞", label: "Practice Runs" },
];

function FloatingParticle({ snippet, style }) {
  return (
    <span
      className="floating-snippet"
      style={{
        position: "absolute",
        fontFamily: "'Fira Code', monospace",
        fontSize: "11px",
        color: "rgba(0,255,210,0.45)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        animation: `floatUp ${style.duration}s linear infinite`,
        animationDelay: `${style.delay}s`,
        left: `${style.left}%`,
        bottom: "-40px",
        userSelect: "none",
      }}
    >
      {snippet}
    </span>
  );
}

function TypingText({ text, speed = 60 }) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => {
        setDisplayed((p) => p + text[idx]);
        setIdx((i) => i + 1);
      }, speed);
      return () => clearTimeout(t);
    }
  }, [idx, text, speed]);

  return (
    <span>
      {displayed}
      <span className="cursor-blink">▌</span>
    </span>
  );
}

function ChallengeCard({ c, idx }) {
  const [hovered, setHovered] = useState(false);
  const colors = ["#00ffe5", "#f000ff", "#00d4ff", "#ffee00", "#ff3d00", "#7dff00"];
  const color = colors[idx % colors.length];

  return (
    <div
      className="challenge-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? color : "rgba(255,255,255,0.08)"}`,
        boxShadow: hovered ? `0 0 40px ${color}77, 0 0 80px ${color}22, inset 0 0 30px ${color}18` : "none",
        transform: hovered ? "translateY(-8px) scale(1.03)" : "translateY(0) scale(1)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        background: hovered ? `linear-gradient(135deg, ${color}1a, #0d0d1a)` : "#0d0d1a",
        borderRadius: "14px",
        padding: "22px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, padding: "8px 14px", fontSize: "10px", fontFamily: "'Fira Code', monospace", color: color, background: `${color}18`, borderBottomLeftRadius: "10px" }}>
        {c.level}
      </div>
      <div style={{ fontSize: "32px", marginBottom: "10px" }}>{c.icon}</div>
      <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontFamily: "'Space Mono', monospace", color: "#fff", fontWeight: 700 }}>{c.title}</h3>
      <p style={{ margin: "0 0 14px", fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{c.desc}</p>
      <span style={{ fontSize: "11px", fontFamily: "'Fira Code', monospace", color: color, background: `${color}18`, padding: "3px 10px", borderRadius: "20px" }}>
        {c.tag}
      </span>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("challenges");
  const particlesData = useRef(
    FLOATING_SNIPPETS.map((s, i) => ({
      snippet: s,
      style: {
        left: (i * 5.1 + Math.random() * 8) % 96,
        duration: 14 + (i % 5) * 3,
        delay: -(i * 1.8),
      },
    }))
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Fira+Code:wght@300;400;600&family=Unbounded:wght@400;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #07070f;
          color: #fff;
          font-family: 'Space Mono', monospace;
          overflow-x: hidden;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d0d1a; }
        ::-webkit-scrollbar-thumb { background: #00ffe5; border-radius: 10px; box-shadow: 0 0 8px #00ffe5; }

        @keyframes floatUp {
          0% { transform: translateY(0) rotate(-2deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh) rotate(4deg); opacity: 0; }
        }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .cursor-blink { animation: blink 1s step-end infinite; color: #00ffe5; text-shadow: 0 0 8px #00ffe5; }

        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 20px #00ffe577, 0 0 40px #00ffe522; }
          50% { box-shadow: 0 0 60px #00ffe5cc, 0 0 100px #00ffe544; }
        }

        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInScale { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        .hero-title {
          font-family: 'Unbounded', sans-serif;
          font-size: clamp(2.4rem, 6vw, 5rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -1px;
          animation: slideIn 0.8s ease both;
        }

        .hero-sub {
          animation: slideIn 0.8s ease 0.2s both;
        }

        .cta-btn {
          animation: slideIn 0.8s ease 0.4s both;
          background: linear-gradient(135deg, #00ffe5, #00aaff);
          color: #07070f;
          border: none;
          padding: 14px 36px;
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 14px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.25s;
          letter-spacing: 1px;
          text-transform: uppercase;
          animation: pulseGlow 3s ease-in-out infinite, slideIn 0.8s ease 0.4s both;
        }
        .cta-btn:hover { transform: scale(1.07); filter: brightness(1.15); }

        .ghost-btn {
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 14px 36px;
          font-family: 'Space Mono', monospace;
          font-weight: 400;
          font-size: 14px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.25s;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .ghost-btn:hover { border-color: #00ffe5; color: #00ffe5; background: #00ffe518; box-shadow: 0 0 20px #00ffe522; }

        .tab-btn {
          background: transparent;
          border: none;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          padding: 10px 24px;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.25s;
          letter-spacing: 0.5px;
        }

        .challenges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 18px;
        }

        .stat-card {
          text-align: center;
          padding: 28px 20px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          background: #0d0d1a;
          animation: fadeInScale 0.6s ease both;
        }

        .noise-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          z-index: 9999;
        }

        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,255,229,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,229,0.06) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }

        .scanline {
          position: fixed;
          left: 0; right: 0;
          height: 3px;
          background: linear-gradient(transparent, rgba(0,255,200,0.06), transparent);
          pointer-events: none;
          z-index: 9998;
          animation: scanline 8s linear infinite;
        }

        .nav-link {
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-size: 13px;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #00ffc8; }

        .badge {
          display: inline-block;
          font-family: 'Fira Code', monospace;
          font-size: 11px;
          padding: 4px 14px;
          border-radius: 20px;
          background: rgba(0,255,229,0.18);
          color: #00ffe5;
          border: 1px solid rgba(0,255,229,0.5);
          letter-spacing: 1px;
          animation: slideIn 0.6s ease both;
        }

        .section-title {
          font-family: 'Unbounded', sans-serif;
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .code-window {
          background: #0d0d1a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
          animation: fadeInScale 0.8s ease 0.3s both;
        }

        .code-titlebar {
          background: #161626;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .dot { width:12px; height:12px; border-radius:50%; }

        .code-body {
          padding: 20px;
          font-family: 'Fira Code', monospace;
          font-size: 13px;
          line-height: 1.8;
          color: rgba(255,255,255,0.7);
        }

        .token-keyword { color: #f000ff; text-shadow: 0 0 8px #f000ff88; }
        .token-fn { color: #00ffe5; text-shadow: 0 0 8px #00ffe588; }
        .token-string { color: #ffee00; text-shadow: 0 0 8px #ffee0066; }
        .token-comment { color: rgba(255,255,255,0.35); font-style: italic; }
        .token-tag { color: #00aaff; text-shadow: 0 0 6px #00aaff66; }
        .token-attr { color: #7dff00; text-shadow: 0 0 6px #7dff0066; }
      `}</style>

      {/* Background layers */}
      <div className="noise-overlay" />
      <div className="grid-bg" />
      <div className="scanline" />

      {/* Floating particles */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
        {particlesData.current.map((p, i) => (
          <FloatingParticle key={i} snippet={p.snippet} style={p.style} />
        ))}
      </div>

      {/* Glow blobs */}
      <div style={{ position: "fixed", top: "-20%", left: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(0,255,229,0.15) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-20%", right: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(240,0,255,0.13) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(20px,5vw,80px)", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(7,7,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg,#00ffe5,#00aaff)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", animation: "spinSlow 8s linear infinite", boxShadow: "0 0 16px #00ffe577" }}>⚛</div>
          <span style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: "14px", letterSpacing: "1px" }}>ReactForge</span>
        </div>
        <div style={{ display: "flex", gap: "28px" }}>
          <a href="#" className="nav-link">Challenges</a>
          <a href="#" className="nav-link">Hooks Guide</a>
          <a href="#" className="nav-link">Sandbox</a>
        </div>
        <button className="cta-btn" style={{ padding: "8px 22px", fontSize: "12px", animation: "none" }}>Start Coding →</button>
      </nav>

      <main style={{ position: "relative", zIndex: 2 }}>

        {/* HERO */}
        <section style={{ padding: "clamp(60px,10vw,120px) clamp(20px,5vw,80px)", maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div>
            <div className="badge" style={{ marginBottom: "24px" }}>⚡ React Interview Prep</div>
            <h1 className="hero-title">
              <span style={{ color: "#fff" }}>Code.</span>
              <br />
              <span style={{ background: "linear-gradient(90deg,#00ffe5,#00aaff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 20px #00ffe588)" }}>Practice.</span>
              <br />
              <span style={{ color: "#fff" }}>Get Hired.</span>
            </h1>
            <p className="hero-sub" style={{ marginTop: "24px", fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: "400px" }}>
              A hands-on React sandbox with pre-built challenge templates, live preview, and real interview scenarios. No setup needed.
            </p>
            <div style={{ marginTop: "36px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <button className="cta-btn">Launch Sandbox 🚀</button>
              <button className="ghost-btn">View Challenges</button>
            </div>
            <div style={{ marginTop: "40px", display: "flex", gap: "28px" }}>
              {STATS.map((s, i) => (
                <div key={i} className="stat-card" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                  <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: "22px", fontWeight: 700, color: "#00ffe5", textShadow: "0 0 16px #00ffe588" }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "4px", letterSpacing: "1px", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Code window */}
          <div className="code-window" style={{ transform: "perspective(1000px) rotateY(-4deg) rotateX(2deg)" }}>
            <div className="code-titlebar">
              <div className="dot" style={{ background: "#ff5f57" }} />
              <div className="dot" style={{ background: "#febc2e" }} />
              <div className="dot" style={{ background: "#28c840" }} />
              <span style={{ marginLeft: "10px", fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: "'Fira Code', monospace" }}>App.jsx</span>
            </div>
            <div className="code-body">
              <div><span className="token-keyword">import</span> {"{"} <span className="token-fn">useState</span> {"}"} <span className="token-keyword">from</span> <span className="token-string">'react'</span></div>
              <div>&nbsp;</div>
              <div><span className="token-comment">{"// 🎯 Challenge: Build a Counter"}</span></div>
              <div><span className="token-keyword">export default function</span> <span className="token-fn">Counter</span>() {"{"}</div>
              <div>&nbsp; <span className="token-keyword">const</span> [count, setCount] = <span className="token-fn">useState</span>(0)</div>
              <div>&nbsp;</div>
              <div>&nbsp; <span className="token-keyword">return</span> (</div>
              <div>&nbsp; &nbsp; <span className="token-tag">&lt;div</span> <span className="token-attr">className</span>=<span className="token-string">"counter"</span><span className="token-tag">&gt;</span></div>
              <div>&nbsp; &nbsp; &nbsp; <span className="token-tag">&lt;h2&gt;</span>Count: <span className="token-tag">&lt;/h2&gt;</span></div>
              <div>&nbsp; &nbsp; &nbsp; <span className="token-tag">&lt;button</span> <span className="token-attr">onClick</span>={() => <span className="token-fn">setCount</span>(c => c+1)}<span className="token-tag">&gt;</span></div>
              <div>&nbsp; &nbsp; &nbsp; &nbsp; Increment ➕</div>
              <div>&nbsp; &nbsp; &nbsp; <span className="token-tag">&lt;/button&gt;</span></div>
              <div>&nbsp; &nbsp; <span className="token-tag">&lt;/div&gt;</span></div>
              <div>&nbsp; )</div>
              <div>{"}"}</div>
              <div>&nbsp;</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="token-comment">{"// your turn... "}</span>
                <span className="cursor-blink" style={{ color: "#00ffe5", textShadow: "0 0 10px #00ffe5" }}>▌</span>
              </div>
            </div>
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,255,229,0.5), rgba(240,0,255,0.3), transparent)", margin: "0 clamp(20px,5vw,80px)" }} />

        {/* CHALLENGES */}
        <section style={{ padding: "80px clamp(20px,5vw,80px)", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ color: "#00ffe5", fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'Fira Code', monospace", textShadow: "0 0 10px #00ffe5" }}>// ready to practice</p>
              <h2 className="section-title">Pick a Challenge</h2>
            </div>
            <div style={{ display: "flex", gap: "6px", background: "#0d0d1a", padding: "5px", borderRadius: "30px", border: "1px solid rgba(255,255,255,0.07)" }}>
              {["All", "Easy", "Medium", "Hard"].map((t) => (
                <button key={t} className="tab-btn" onClick={() => setActiveTab(t.toLowerCase())}
                  style={{ color: activeTab === t.toLowerCase() ? "#07070f" : "rgba(255,255,255,0.4)", background: activeTab === t.toLowerCase() ? "#00ffe5" : "transparent", fontWeight: activeTab === t.toLowerCase() ? 700 : 400, boxShadow: activeTab === t.toLowerCase() ? "0 0 14px #00ffe577" : "none" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="challenges-grid">
            {CHALLENGES.filter(c => activeTab === "all" || activeTab === "challenges" || c.level.toLowerCase() === activeTab).map((c, i) => (
              <ChallengeCard key={c.id} c={c} idx={i} />
            ))}
          </div>
        </section>

        {/* HOOKS SECTION */}
        <section style={{ padding: "80px clamp(20px,5vw,80px)", background: "#0a0a16" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "50px" }}>
              <p style={{ color: "#f000ff", fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'Fira Code', monospace", textShadow: "0 0 10px #f000ff" }}>// most asked in interviews</p>
              <h2 className="section-title">Master the Hooks</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px" }}>
              {[
                { name: "useState", color: "#00ffe5", desc: "Local state management" },
                { name: "useEffect", color: "#f000ff", desc: "Side effects & lifecycle" },
                { name: "useContext", color: "#00aaff", desc: "Global state sharing" },
                { name: "useRef", color: "#ffee00", desc: "DOM refs & persistence" },
                { name: "useMemo", color: "#ff3d00", desc: "Expensive calculations" },
                { name: "useCallback", color: "#7dff00", desc: "Stable function refs" },
                { name: "useReducer", color: "#f000ff", desc: "Complex state logic" },
                { name: "Custom Hook", color: "#00ffe5", desc: "Reusable logic" },
              ].map((h, i) => (
                <div key={h.name}
                  style={{ padding: "18px", background: "#0d0d1a", border: `1px solid ${h.color}22`, borderRadius: "12px", cursor: "pointer", transition: "all 0.2s", animationDelay: `${i * 0.05}s` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = h.color; e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = `0 0 24px ${h.color}66`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${h.color}22`; e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: "13px", color: h.color, fontWeight: 600, marginBottom: "6px", textShadow: `0 0 10px ${h.color}` }}>{h.name}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{h.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section style={{ padding: "80px clamp(20px,5vw,80px)" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", padding: "60px 40px", border: "1px solid rgba(0,255,229,0.4)", borderRadius: "24px", background: "linear-gradient(135deg, rgba(0,255,229,0.08), rgba(0,170,255,0.06))", position: "relative", overflow: "hidden", boxShadow: "0 0 60px rgba(0,255,229,0.1)" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,255,229,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🚀</div>
            <h2 className="section-title" style={{ marginBottom: "16px" }}>
              Ready to ace your{" "}
              <span style={{ background: "linear-gradient(90deg,#00ffe5,#00aaff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 16px #00ffe566)" }}>React interview?</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", lineHeight: 1.7, marginBottom: "32px", maxWidth: "480px", margin: "0 auto 32px" }}>
              Jump into the sandbox, pick a challenge, and start building. The environment is pre-configured — just write code.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="cta-btn" style={{ animation: "pulseGlow 3s ease-in-out infinite" }}>Open Sandbox ⚛</button>
              <button className="ghost-btn">Browse All Challenges</button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "30px clamp(20px,5vw,80px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>⚛</span>
          <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: "12px", fontWeight: 700 }}>ReactForge</span>
        </div>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", fontFamily: "'Fira Code', monospace" }}>{"// built for devs, by devs"}</p>
      </footer>
    </>
  );
}