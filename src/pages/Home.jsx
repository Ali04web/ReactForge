import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const FLOATING_SNIPPETS = [
  "useState()",
  "useEffect()",
  "const App = () =>",
  "props.children",
  "<Fragment>",
  "React.memo()",
  "useCallback()",
  "JSX",
  ".map()",
  "async/await",
  "import React",
  "export default",
  "useRef()",
  "[]",
  "key={id}",
  "{...spread}",
  "() => {}",
  "useContext()",
  "useMemo()",
];

const CHALLENGES = [
  {
    id: 1,
    title: "Counter App",
    level: "Easy",
    badge: "01",
    desc: "Build increment, decrement, reset, and step actions.",
    tag: "useState",
    challengeKey: "counter",
    template: "counter",
  },
  {
    id: 2,
    title: "Todo List",
    level: "Easy",
    badge: "02",
    desc: "Practice CRUD operations and list rendering patterns.",
    tag: "useState + map",
    challengeKey: "todo",
    template: "todo",
  },
  {
    id: 3,
    title: "Fetch and Display",
    level: "Medium",
    badge: "03",
    desc: "Load users from an API and handle loading and error states.",
    tag: "useEffect",
    challengeKey: "fetch",
    template: "fetch",
  },
  {
    id: 4,
    title: "Theme Toggle",
    level: "Easy",
    badge: "04",
    desc: "Create a context-based theme switcher with persistence.",
    tag: "useContext",
    challengeKey: "theme-toggle",
    template: "blank",
  },
  {
    id: 5,
    title: "Debounced Search",
    level: "Medium",
    badge: "05",
    desc: "Throttle expensive lookups and reduce unnecessary renders.",
    tag: "useMemo + useCallback",
    challengeKey: "debounced-search",
    template: "blank",
  },
  {
    id: 6,
    title: "Infinite Scroll",
    level: "Hard",
    badge: "06",
    desc: "Use IntersectionObserver for progressive list loading.",
    tag: "useRef + useEffect",
    challengeKey: "infinite-scroll",
    template: "blank",
  },
];

const STATS = [
  { value: "6", label: "Challenges" },
  { value: "7", label: "Hooks Covered" },
  { value: "Live", label: "Preview Loop" },
  { value: "∞", label: "Practise" },
];

const HOOKS = [
  { name: "useState", color: "#06b6d4", desc: "Local state management." },
  { name: "useEffect", color: "#7C3AED", desc: "Side effects and lifecycle." },
  { name: "useContext", color: "#3b82f6", desc: "Shared values in a tree." },
  { name: "useRef", color: "#f59e0b", desc: "Mutable references and DOM access." },
  { name: "useMemo", color: "#f43f5e", desc: "Memoized expensive calculations." },
  { name: "useCallback", color: "#10b981", desc: "Stable callback references." },
  { name: "useReducer", color: "#2563EB", desc: "Complex state transitions." },
  { name: "Custom Hook", color: "#0ea5e9", desc: "Reusable logic extraction." },
];

const PARTICLES_DATA = FLOATING_SNIPPETS.map((snippet, index) => ({
  snippet,
  style: {
    left: (index * 5.1 + ((index * 17) % 9)) % 96,
    duration: 14 + (index % 5) * 3,
    delay: -(index * 1.8),
  },
}));

function FloatingParticle({ snippet, style }) {
  return (
    <span
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

function ChallengeCard({ challenge, index, onLaunch }) {
  const [hovered, setHovered] = useState(false);
  const colors = ["#7C3AED", "#2563EB", "#00d4ff", "#ffee00", "#ff3d00", "#7dff00"];
  const color = colors[index % colors.length];

  return (
    <button
      type="button"
      className="challenge-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onLaunch(challenge.challengeKey)}
      style={{
        border: `1px solid ${hovered ? color : "rgba(255,255,255,0.08)"}`,
        boxShadow: hovered
          ? `0 0 40px ${color}77, 0 0 80px ${color}22, inset 0 0 30px ${color}18`
          : "none",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        background: hovered ? `linear-gradient(135deg, ${color}1a, #111827)` : "#111827",
      }}
      aria-label={`Open ${challenge.title} challenge in sandbox`}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          padding: "8px 14px",
          fontSize: "10px",
          fontFamily: "'Fira Code', monospace",
          color,
          background: `${color}18`,
          borderBottomLeftRadius: "10px",
        }}
      >
        {challenge.level}
      </div>
      <div style={{ fontSize: "26px", marginBottom: "10px", color }}>{challenge.badge}</div>
      <h3
        style={{
          margin: "0 0 6px",
          fontSize: "16px",
          fontFamily: "'Space Mono', monospace",
          color: "#fff",
          fontWeight: 700,
        }}
      >
        {challenge.title}
      </h3>
      <p
        style={{
          margin: "0 0 14px",
          fontSize: "13px",
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.5,
        }}
      >
        {challenge.desc}
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
        <span
          style={{
            fontSize: "11px",
            fontFamily: "'Fira Code', monospace",
            color,
            background: `${color}18`,
            padding: "3px 10px",
            borderRadius: "20px",
          }}
        >
          {challenge.tag}
        </span>
        <span style={{ color, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.7px" }}>
          Open
        </span>
      </div>
    </button>
  );
}

export default function Home() {
  const [activeDifficulty, setActiveDifficulty] = useState("all");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filteredChallenges = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return CHALLENGES.filter((challenge) => {
      const matchesDifficulty =
        activeDifficulty === "all" || challenge.level.toLowerCase() === activeDifficulty;
      if (!matchesDifficulty) return false;

      if (!normalizedQuery) return true;
      const haystack = `${challenge.title} ${challenge.desc} ${challenge.tag}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [activeDifficulty, query]);

  const openTemplate = (template = "blank") => {
    navigate(`/sandbox?template=${template}`);
  };

  const openChallenge = (challengeKey) => {
    navigate(`/sandbox?challenge=${challengeKey}`);
  };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
        {PARTICLES_DATA.map((particle, index) => (
          <FloatingParticle key={index} snippet={particle.snippet} style={particle.style} />
        ))}
      </div>

      <div
        style={{
          position: "fixed",
          top: "-20%",
          left: "-10%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-20%",
          right: "-10%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(6,182,212,0.13) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <main className="home-main">
        <section className="home-section home-hero-grid">
          <div>
            <div className="badge" style={{ marginBottom: "24px" }}>
              React Interview Prep
            </div>
            <h1 className="hero-title">
              <span style={{ color: "#fff" }}>Code.</span>
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #7C3AED, #2563EB, #06B6D4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 20px #7C3AED88)",
                }}
              >
                Practice.
              </span>
              <br />
              <span style={{ color: "#fff" }}>Get Hired.</span>
            </h1>
            <p
              className="hero-sub"
              style={{
                marginTop: "24px",
                fontSize: "15px",
                color: "rgba(255,255,255,0.56)",
                lineHeight: 1.7,
                maxWidth: "460px",
              }}
            >
              Build and iterate in a pre-configured React playground with realistic challenge prompts and live
              preview.
            </p>
            <div style={{ marginTop: "34px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <button className="cta-btn" onClick={() => openTemplate("blank")}>
                Launch Sandbox
              </button>
              <button
                className="ghost-btn"
                onClick={() => document.getElementById("challenges")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Challenges
              </button>
            </div>
            <div className="hero-stats">
              {STATS.map((item, index) => (
                <div key={item.label} className="stat-card" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                  <div
                    style={{
                      fontFamily: "'Unbounded', sans-serif",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#7C3AED",
                      textShadow: "0 0 16px #7C3AED88",
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.4)",
                      marginTop: "4px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-preview code-window">
            <div className="code-titlebar">
              <div className="dot" style={{ background: "#ff5f57" }} />
              <div className="dot" style={{ background: "#febc2e" }} />
              <div className="dot" style={{ background: "#28c840" }} />
              <span
                style={{
                  marginLeft: "10px",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "'Fira Code', monospace",
                }}
              >
                App.jsx
              </span>
            </div>
            <div className="code-body">
              <div>
                <span className="token-keyword">import</span> {"{"} <span className="token-fn">useState</span> {"}"}
                {" "} <span className="token-keyword">from</span> <span className="token-string">'react'</span>
              </div>
              <div>&nbsp;</div>
              <div>
                <span className="token-comment">// Challenge: Build a Counter</span>
              </div>
              <div>
                <span className="token-keyword">export default function</span>{" "}
                <span className="token-fn">Counter</span>() {"{"}
              </div>
              <div>
                &nbsp; <span className="token-keyword">const</span> [count, setCount] ={" "}
                <span className="token-fn">useState</span>(0)
              </div>
              <div>&nbsp;</div>
              <div>&nbsp; <span className="token-keyword">return</span> (</div>
              <div>&nbsp; &nbsp; <span className="token-tag">&lt;button onClick=&#123;() =&gt; setCount(c =&gt; c + 1)&#125;&gt;</span></div>
              <div>&nbsp; &nbsp; &nbsp; Increment</div>
              <div>&nbsp; &nbsp; <span className="token-tag">&lt;/button&gt;</span></div>
              <div>&nbsp; )</div>
              <div>{"}"}</div>
              <div>&nbsp;</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="token-comment">// your turn...</span>
                <span className="cursor-blink">|</span>
              </div>
            </div>
          </div>
        </section>

        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(6,182,212,0.3), transparent)",
            margin: "0 clamp(20px,5vw,80px)",
          }}
        />

        <section id="challenges" className="home-section">
          <div className="challenge-toolbar">
            <div>
              <p
                style={{
                  color: "#7C3AED",
                  fontSize: "12px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                  fontFamily: "'Fira Code', monospace",
                }}
              >
                Ready to practice
              </p>
              <h2 className="section-title">Pick a Challenge</h2>
              <p style={{ marginTop: "8px", color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                {filteredChallenges.length} challenge{filteredChallenges.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="challenge-controls">
              <input
                className="challenge-search"
                placeholder="Search by topic or hook..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search challenges"
              />
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  background: "#111827",
                  padding: "5px",
                  borderRadius: "30px",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {["All", "Easy", "Medium", "Hard"].map((level) => {
                  const value = level.toLowerCase();
                  const selected = activeDifficulty === value;
                  return (
                    <button
                      key={level}
                      className="tab-btn"
                      onClick={() => setActiveDifficulty(value)}
                      style={{
                        color: selected ? "#0B0B0F" : "rgba(255,255,255,0.45)",
                        background: selected ? "#7C3AED" : "transparent",
                        fontWeight: selected ? 700 : 400,
                        boxShadow: selected ? "0 0 14px #8b5cf677" : "none",
                      }}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {filteredChallenges.length > 0 ? (
            <div className="challenges-grid">
              {filteredChallenges.map((challenge, index) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  index={index}
                  onLaunch={openChallenge}
                />
              ))}
            </div>
          ) : (
            <div className="challenge-empty">
              No challenges match this filter. Try a different level or clear your search.
            </div>
          )}
        </section>

        <section id="hooks" className="home-section" style={{ paddingTop: "10px" }}>
          <div style={{ textAlign: "center", marginBottom: "42px" }}>
            <p
              style={{
                color: "#2563EB",
                fontSize: "12px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginBottom: "8px",
                fontFamily: "'Fira Code', monospace",
              }}
            >
              Most asked in interviews
            </p>
            <h2 className="section-title">Master the Hooks</h2>
          </div>
          <div className="hooks-grid">
            {HOOKS.map((hook) => (
              <div key={hook.name} className="hook-card" style={{ border: `1px solid ${hook.color}22` }}>
                <div
                  style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: "13px",
                    color: hook.color,
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  {hook.name}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", lineHeight: 1.5 }}>{hook.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="home-section" style={{ paddingTop: "10px" }}>
          <div className="cta-banner">
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <h2 className="section-title" style={{ marginBottom: "14px" }}>
              Ready for your next React interview?
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.52)",
                fontSize: "14px",
                lineHeight: 1.7,
                marginBottom: "32px",
                maxWidth: "480px",
                marginInline: "auto",
              }}
            >
              Open a template, complete the challenge comments, and iterate in live preview until your answer is solid.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="cta-btn" onClick={() => openChallenge("/sandbox")}>
                Start Practicing
              </button>
              <button
                className="ghost-btn"
                onClick={() => document.getElementById("challenges")?.scrollIntoView({ behavior: "smooth" })}
              >
                Browse Challenges
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: "16px", fontWeight: 700, color: "#fff" }}>ReactForge</span>
        </div>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'Fira Code', monospace",
          }}
        >
          Built for daily React practice. 
          <br />
          Made by{" "}
          <a
            href="https://x.com/alivldm"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#aae0ff",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            AH
          </a>
        </p>
      </footer>
    </>
  );
}
