import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Sandbox from "./pages/Sandbox.jsx";

export default function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Fira+Code:wght@300;400;600&family=Unbounded:wght@400;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0c0a09;
          --panel: #1c1917;
          --panel-2: #292524;
          --line: rgba(255,255,255,0.08);
          --text-soft: rgba(255,255,255,0.6);
          --text-dim: rgba(255,255,255,0.4);
          --accent: #f97316;
          --accent-2: #ef4444;
          --accent-magenta: #eab308;
        }

        body {
          background: var(--bg);
          color: #fff;
          font-family: 'Space Mono', monospace;
          overflow-x: hidden;
          min-height: 100vh;
        }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #1c1917; }
        ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 10px; box-shadow: 0 0 8px #f97316; }

        @keyframes floatUp {
          0% { transform: translateY(0) rotate(-2deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.55; }
          100% { transform: translateY(-100vh) rotate(4deg); opacity: 0; }
        }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 20px #f9731677, 0 0 40px #f9731622; }
          50% { box-shadow: 0 0 60px #f97316cc, 0 0 100px #f9731644; }
        }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInScale { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        .cursor-blink { animation: blink 1s step-end infinite; color: var(--accent); text-shadow: 0 0 8px #f97316; }

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
            linear-gradient(rgba(249, 115, 22,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249, 115, 22,0.06) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }

        .scanline {
          position: fixed;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(transparent, rgba(249, 115, 22,0.06), transparent);
          pointer-events: none;
          z-index: 9998;
          animation: scanline 8s linear infinite;
        }

        .site-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 0 clamp(16px,5vw,80px);
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(12, 10, 9,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          gap: 12px;
        }

        .site-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .site-logo {
          width: 36px;
          height: 36px;
          display: block;
          flex: 0 0 auto;
          animation: spinSlow 8s linear infinite;
          filter: drop-shadow(0 0 14px rgba(56, 189, 248, 0.55));
        }

        .site-brand-name {
          font-family: 'Unbounded', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .site-menu-toggle {
          display: none;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 8px;
          color: rgba(255,255,255,0.7);
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          padding: 6px 12px;
          cursor: pointer;
        }

        .site-links {
          display: flex;
          align-items: center;
          gap: 24px;
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
        .nav-link:hover { color: #a855f7; }

        .hero-title {
          font-family: 'Unbounded', sans-serif;
          font-size: clamp(2.2rem, 6vw, 5rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -1px;
          animation: slideIn 0.8s ease both;
        }

        .hero-sub {
          animation: slideIn 0.8s ease 0.2s both;
        }

        .cta-btn {
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #0c0a09;
          border: none;
          padding: 14px 30px;
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 13px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.25s;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          animation: pulseGlow 3s ease-in-out infinite, slideIn 0.8s ease 0.4s both;
        }
        .cta-btn:hover { transform: scale(1.05); filter: brightness(1.12); }

        .ghost-btn {
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 14px 30px;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.25s;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }
        .ghost-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: #f9731618;
          box-shadow: 0 0 20px #f9731622;
        }

        .badge {
          display: inline-block;
          font-family: 'Fira Code', monospace;
          font-size: 11px;
          padding: 4px 14px;
          border-radius: 20px;
          background: rgba(249, 115, 22,0.18);
          color: var(--accent);
          border: 1px solid rgba(249, 115, 22,0.5);
          letter-spacing: 1px;
          animation: slideIn 0.6s ease both;
        }

        .section-title {
          font-family: 'Unbounded', sans-serif;
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .home-main { position: relative; z-index: 2; }

        .home-section {
          padding: 80px clamp(20px,5vw,80px);
          max-width: 1200px;
          margin: 0 auto;
        }

        .home-hero-grid {
          padding-top: clamp(50px,8vw,110px);
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          gap: clamp(30px,4vw,56px);
          align-items: center;
        }

        .hero-stats {
          margin-top: 34px;
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .stat-card {
          text-align: center;
          padding: 22px 12px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          background: #1c1917;
          animation: fadeInScale 0.6s ease both;
        }

        .hero-preview {
          transform: perspective(1000px) rotateY(-4deg) rotateX(2deg) translate(20px, -22px);
        }

        .code-window {
          background: #1c1917;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
          animation: fadeInScale 0.8s ease 0.3s both;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
        }

        .code-titlebar {
          background: #292524;
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

        .token-keyword { color: #eab308; text-shadow: 0 0 8px #eab30888; }
        .token-fn { color: #f97316; text-shadow: 0 0 8px #f9731688; }
        .token-string { color: #ffee00; text-shadow: 0 0 8px #ffee0066; }
        .token-comment { color: rgba(255,255,255,0.35); font-style: italic; }
        .token-tag { color: #ef4444; text-shadow: 0 0 6px #ef444466; }

        .challenge-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 18px;
          flex-wrap: wrap;
        }

        .challenge-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .challenge-search {
          width: 240px;
          max-width: 100%;
          background: #1c1917;
          border: 1px solid rgba(255,255,255,0.08);
          color: #fff;
          border-radius: 10px;
          padding: 10px 12px;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .challenge-search:focus {
          border-color: #f9731688;
          box-shadow: 0 0 0 3px rgba(249, 115, 22,0.12);
        }

        .tab-btn {
          background: transparent;
          border: none;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          padding: 10px 20px;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.25s;
          letter-spacing: 0.5px;
        }

        .challenges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }

        .challenge-card {
          border-radius: 14px;
          padding: 22px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          text-align: left;
          width: 100%;
          color: inherit;
          font: inherit;
        }

        .challenge-card:focus-visible {
          outline: 2px solid #f97316;
          outline-offset: 2px;
        }

        .challenge-empty {
          border: 1px dashed rgba(255,255,255,0.2);
          border-radius: 14px;
          padding: 30px;
          text-align: center;
          color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.01);
        }

        .hooks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 14px;
        }

        .hook-card {
          padding: 18px;
          background: #1c1917;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }

        .hook-card:hover {
          transform: translateY(-4px);
        }

        .cta-banner {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          padding: clamp(36px,6vw,60px) clamp(20px,5vw,40px);
          border: 1px solid rgba(249, 115, 22,0.4);
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(249, 115, 22,0.08), rgba(0,170,255,0.06));
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 60px rgba(249, 115, 22,0.1);
        }

        .site-footer {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 40px clamp(20px,5vw,80px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 16px;
          position: relative;
          z-index: 2;
        }

        @media (max-width: 980px) {
          .site-menu-toggle { display: inline-flex; align-items: center; }

          .site-links {
            display: none;
            position: absolute;
            top: 64px;
            left: 16px;
            right: 16px;
            z-index: 120;
            background: #090912;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 14px;
            padding: 12px;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .site-links.open { display: flex; }
          .site-nav .cta-btn { display: none; }

          .home-hero-grid { grid-template-columns: 1fr; }
          .hero-preview { transform: none; }
          .hero-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 640px) {
          .home-section { padding: 64px 20px; }
          .hero-stats { grid-template-columns: 1fr 1fr; }
          .cta-btn, .ghost-btn { width: 100%; justify-content: center; }
          .challenge-toolbar { align-items: stretch; }
          .challenge-controls { width: 100%; }
          .challenge-search { width: 100%; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <Routes>
        <Route path="/" element={<HomeWithNav />} />
        <Route path="/sandbox" element={<Sandbox />} />
      </Routes>
    </>
  );
}

function HomeWithNav() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      <div className="noise-overlay" />
      <div className="grid-bg" />
      <div className="scanline" />

      <nav className="site-nav">
        <div className="site-brand">
          <img className="site-logo" src="/reactforge-logo.svg" alt="ReactForge logo" />
          <span className="site-brand-name">ReactForge</span>
        </div>

        <button
          type="button"
          className="site-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          Menu
        </button>

        <div className={`site-links ${menuOpen ? "open" : ""}`}>
          <button className="nav-link" onClick={() => scrollTo("challenges")}>
            Challenges
          </button>
          <button className="nav-link" onClick={() => scrollTo("hooks")}>
            Hooks Guide
          </button>
          <button
            className="nav-link"
            onClick={() => {
              setMenuOpen(false);
              navigate("/sandbox");
            }}
          >
            Sandbox
          </button>
        </div>

        <button
          className="cta-btn"
          style={{ padding: "8px 22px", fontSize: "12px", animation: "none" }}
          onClick={() => navigate("/sandbox")}
        >
          Start Coding
        </button>
      </nav>

      <Home />
    </>
  );
}
