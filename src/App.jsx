import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Sandbox from "./pages/Sandbox.jsx";

export default function App() {
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
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'Space Mono', monospace;
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

      <Routes>
        <Route path="/" element={<HomeWithNav />} />
        <Route path="/sandbox" element={<Sandbox />} />
      </Routes>
    </>
  );
}

/* Home page wrapped with the shared nav */
import { useNavigate } from "react-router-dom";

function HomeWithNav() {
  const navigate = useNavigate();

  return (
    <>
      {/* Background layers */}
      <div className="noise-overlay" />
      <div className="grid-bg" />
      <div className="scanline" />

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(20px,5vw,80px)", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(7,7,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg,#00ffe5,#00aaff)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", animation: "spinSlow 8s linear infinite", boxShadow: "0 0 16px #00ffe577" }}>⚛</div>
          <span style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: "14px", letterSpacing: "1px" }}>ReactForge</span>
        </div>
        <div style={{ display: "flex", gap: "28px" }}>
          <button className="nav-link" onClick={() => document.getElementById('challenges')?.scrollIntoView({ behavior: 'smooth' })}>Challenges</button>
          <button className="nav-link" onClick={() => document.getElementById('hooks')?.scrollIntoView({ behavior: 'smooth' })}>Hooks Guide</button>
          <button className="nav-link" onClick={() => navigate('/sandbox')}>Sandbox</button>
        </div>
        <button className="cta-btn" style={{ padding: "8px 22px", fontSize: "12px", animation: "none" }} onClick={() => navigate('/sandbox')}>Start Coding →</button>
      </nav>

      <Home />
    </>
  );
}