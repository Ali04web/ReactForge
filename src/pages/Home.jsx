import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

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

export default function Home() {
  const [activeTab, setActiveTab] = useState("challenges");
  const navigate = useNavigate();
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
      {/* Floating particles */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
        {particlesData.current.map((p, i) => (
          <FloatingParticle key={i} snippet={p.snippet} style={p.style} />
        ))}
      </div>

      {/* Glow blobs */}
      <div style={{ position: "fixed", top: "-20%", left: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(0,255,229,0.15) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-20%", right: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(240,0,255,0.13) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

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
              <button className="cta-btn" onClick={() => navigate('/sandbox')}>Launch Sandbox 🚀</button>
              <button className="ghost-btn" onClick={() => document.getElementById('challenges')?.scrollIntoView({ behavior: 'smooth' })}>View Challenges</button>
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
          <div className="code-window" style={{ transform: "perspective(1000px) rotateY(-4deg) rotateX(2deg) translate(40px, -30px)" }}>
            <div className="code-titlebar">
              <div className="dot" style={{ background: "#ff5f57" }} />
              <div className="dot" style={{ background: "#febc2e" }} />
              <div className="dot" style={{ background: "#28c840" }} />
              <span style={{ marginLeft: "10px", fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: "'Fira Code', monospace" }}>App.jsx</span>
            </div>
            <div className="code-body">
              <div><span className="token-keyword">import</span> {"{"} <span className="token-fn">useState</span> {"}"} <span className="token-keyword">from</span> <span className="token-string">{"'react'"}</span></div>
              <div>&nbsp;</div>
              <div><span className="token-comment">{"// 🎯 Challenge: Build a Counter"}</span></div>
              <div><span className="token-keyword">export default function</span> <span className="token-fn">Counter</span>() {"{"}</div>
              <div>&nbsp; <span className="token-keyword">const</span> [count, setCount] = <span className="token-fn">useState</span>(0)</div>
              <div>&nbsp;</div>
              <div>&nbsp; <span className="token-keyword">return</span> (</div>
              <div dangerouslySetInnerHTML={{ __html: '&nbsp; &nbsp; <span class="token-tag">&lt;div</span> <span class="token-attr">className</span>=<span class="token-string">"counter"</span><span class="token-tag">&gt;</span>' }} />
              <div dangerouslySetInnerHTML={{ __html: '&nbsp; &nbsp; &nbsp; <span class="token-tag">&lt;h2&gt;</span>Count: <span class="token-tag">&lt;/h2&gt;</span>' }} />
              <div dangerouslySetInnerHTML={{ __html: '&nbsp; &nbsp; &nbsp; <span class="token-tag">&lt;button</span> <span class="token-attr">onClick</span>={() =&gt; <span class="token-fn">setCount</span>(c =&gt; c+1)}<span class="token-tag">&gt;</span>' }} />
              <div>&nbsp; &nbsp; &nbsp; &nbsp; Increment ➕</div>
              <div dangerouslySetInnerHTML={{ __html: '&nbsp; &nbsp; &nbsp; <span class="token-tag">&lt;/button&gt;</span>' }} />
              <div dangerouslySetInnerHTML={{ __html: '&nbsp; &nbsp; <span class="token-tag">&lt;/div&gt;</span>' }} />
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
        <section id="challenges" style={{ padding: "80px clamp(20px,5vw,80px)", maxWidth: "1200px", margin: "0 auto" }}>
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
        <section id="hooks" style={{ padding: "80px clamp(20px,5vw,80px)" }}>
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
              <button className="cta-btn" style={{ animation: "pulseGlow 3s ease-in-out infinite" }} onClick={() => navigate('/sandbox')}>Open Sandbox ⚛</button>
              <button className="ghost-btn" onClick={() => document.getElementById('challenges')?.scrollIntoView({ behavior: 'smooth' })}>Browse All Challenges</button>
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
        <p
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.25)",
            fontFamily: "'Fira Code', monospace",
          }}
        >
          {"// built for devs, by "}
          <a href="https://x.com/alivldm" target="_blank" rel="noopener noreferrer">
            Dev
          </a>
        </p>
      </footer>
    </>
  );
}
