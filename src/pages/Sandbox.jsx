import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SandboxWorkbench from "./sandbox/SandboxWorkbench.jsx";
import { formatDuration, useCodingTimer } from "./sandbox/sandboxWorkbenchUtils.js";
import "./Sandbox.css";

const DEFAULT_TEMPLATE_KEY = "blank";
const TEMPLATE_STORAGE_KEY = "reactforge_active_template";

const BASE_GLOBAL_CSS = `:root {
  color: #f8fafc;
  background: #020617;
  font-family: "Inter", system-ui, sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
}

body {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(59, 130, 246, 0.16), transparent 38%),
    linear-gradient(180deg, #020617 0%, #0f172a 100%);
}

button,
input,
textarea,
select {
  font: inherit;
}
`;

const MAIN_FILE = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app.js";
import "./global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`;

const makeTemplateFiles = ({ appSource, appCss, globalCss = "" }) => ({
  "/main.js": MAIN_FILE,
  "/app.js": appSource,
  "/global.css": `${BASE_GLOBAL_CSS}${globalCss ? `\n${globalCss.trim()}\n` : ""}`,
  "/app.css": appCss.trimEnd() + "\n",
});

const TEMPLATE_LIBRARY = {
  blank: {
    label: "Blank",
    icon: "BL",
    files: makeTemplateFiles({
      appSource: `import "./app.css";

export default function App() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">ReactForge</p>
        <h1>Start building</h1>
        <p>Use the explorer to add files and folders. The preview runs from main.js like Vite.</p>
      </section>
    </main>
  );
}
`,
      appCss: `.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
}

.panel {
  width: min(680px, 100%);
  border: 1px solid rgba(148, 163, 184, 0.26);
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.88);
  padding: 36px;
  box-shadow: 0 30px 80px rgba(2, 6, 23, 0.48);
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #38bdf8;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 6vw, 3.4rem);
}

p {
  margin: 14px 0 0;
  line-height: 1.7;
  color: #cbd5e1;
}
`,
    }),
  },
  counter: {
    label: "Counter",
    icon: "CT",
    files: makeTemplateFiles({
      appSource: `import { useState } from "react";
import "./app.css";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="app-shell">
      <section className="counter-card">
        <p className="eyebrow">State</p>
        <h1>{count}</h1>
        <div className="actions">
          <button onClick={() => setCount((value) => value - 1)}>-1</button>
          <button onClick={() => setCount(0)}>Reset</button>
          <button onClick={() => setCount((value) => value + 1)}>+1</button>
        </div>
      </section>
    </main>
  );
}
`,
      appCss: `.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
}

.counter-card {
  width: min(420px, 100%);
  border-radius: 24px;
  padding: 32px;
  text-align: center;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.26);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.4);
}

.eyebrow {
  margin: 0;
  color: #38bdf8;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 12px;
}

h1 {
  margin: 18px 0;
  font-size: clamp(3rem, 10vw, 4.5rem);
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

button {
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  background: #e2e8f0;
  color: #020617;
  cursor: pointer;
}
`,
    }),
  },
  todo: {
    label: "Todo",
    icon: "TD",
    files: makeTemplateFiles({
      appSource: `import { useState } from "react";
import "./app.css";

export default function App() {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState([
    { id: 1, text: "Learn useState", done: false },
    { id: 2, text: "Build todo app", done: true },
  ]);

  const addTodo = () => {
    if (!text.trim()) return;
    setTodos((current) => [...current, { id: Date.now(), text, done: false }]);
    setText("");
  };

  return (
    <main className="app-shell">
      <section className="todo-card">
        <h1>Todo List</h1>
        <div className="todo-row">
          <input value={text} onChange={(event) => setText(event.target.value)} placeholder="New task" />
          <button onClick={addTodo}>Add</button>
        </div>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} className={todo.done ? "done" : ""}>
              <span onClick={() => setTodos((current) => current.map((item) => item.id === todo.id ? { ...item, done: !item.done } : item))}>
                {todo.text}
              </span>
              <button onClick={() => setTodos((current) => current.filter((item) => item.id !== todo.id))}>x</button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
`,
      appCss: `.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
}

.todo-card {
  width: min(560px, 100%);
  border-radius: 24px;
  padding: 28px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.22);
}

h1 {
  margin: 0;
}

.todo-row {
  display: flex;
  gap: 10px;
  margin: 16px 0;
}

input {
  flex: 1;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(15, 23, 42, 0.72);
  color: inherit;
  padding: 10px 14px;
}

button {
  border: none;
  border-radius: 14px;
  padding: 10px 14px;
  cursor: pointer;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(30, 41, 59, 0.72);
}

li span {
  cursor: pointer;
}

li.done span {
  text-decoration: line-through;
  opacity: 0.65;
}
`,
    }),
  },
  fetch: {
    label: "Fetch",
    icon: "API",
    files: makeTemplateFiles({
      appSource: `import { useEffect, useState } from "react";
import "./app.css";

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const response = await fetch("https://jsonplaceholder.typicode.com/users");
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    };

    run();
  }, []);

  return (
    <main className="app-shell">
      <section className="fetch-card">
        <h1>User Directory</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid">
            {users.map((user) => (
              <article key={user.id}>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
`,
      appCss: `.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
}

.fetch-card {
  width: min(960px, 100%);
  border-radius: 28px;
  padding: 32px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.22);
}

h1 {
  margin: 0 0 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

article {
  border-radius: 18px;
  padding: 18px;
  background: rgba(30, 41, 59, 0.72);
}

h2 {
  margin: 0 0 8px;
  font-size: 1rem;
}

p {
  margin: 0;
  color: #cbd5e1;
}
`,
    }),
  },
};

const CHALLENGE_LIBRARY = {
  counter: {
    title: "Counter App",
    hint: "Use useState for count and provide increment, decrement, and reset buttons.",
    solutionFiles: TEMPLATE_LIBRARY.counter.files,
  },
  todo: {
    title: "Todo List",
    hint: "Track input state and a todo array, then add, toggle, and delete tasks.",
    solutionFiles: TEMPLATE_LIBRARY.todo.files,
  },
  fetch: {
    title: "Fetch & Display",
    hint: "Use useEffect to fetch data once and render loading and success states.",
    solutionFiles: TEMPLATE_LIBRARY.fetch.files,
  },
  "theme-toggle": {
    title: "Theme Toggle",
    hint: "Store theme in state and apply a className on the root container.",
    solutionFiles: makeTemplateFiles({
      appSource: `import { useEffect, useState } from "react";
import "./app.css";

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <main className={"app-shell " + theme}>
      <section className="panel">
        <p className="eyebrow">Theme</p>
        <h1>{theme === "dark" ? "Dark" : "Light"} mode</h1>
        <button onClick={() => setTheme((value) => value === "dark" ? "light" : "dark")}>Toggle Theme</button>
      </section>
    </main>
  );
}
`,
      appCss: `.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  transition: background 180ms ease, color 180ms ease;
}

.app-shell.dark {
  color: #f8fafc;
}

.app-shell.light {
  color: #0f172a;
  background: linear-gradient(180deg, #dbeafe 0%, #f8fafc 100%);
}

.panel {
  width: min(560px, 100%);
  border-radius: 28px;
  padding: 32px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.24);
}

.app-shell.light .panel {
  background: rgba(255, 255, 255, 0.88);
}

.eyebrow {
  margin: 0 0 12px;
  color: #38bdf8;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 12px;
}

h1 {
  margin: 0 0 18px;
}

button {
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
}
`,
      globalCss: `.app-shell.light button {
  background: #0f172a;
  color: #f8fafc;
}
`,
    }),
  },
  "debounced-search": {
    title: "Debounced Search",
    hint: "Keep one state for raw input and another for debounced value with setTimeout.",
    solutionFiles: makeTemplateFiles({
      appSource: `import { useEffect, useMemo, useState } from "react";
import "./app.css";

const DATA = ["React", "Redux", "Router", "Render", "Ref", "Reducer", "Request", "Result"];

export default function App() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedQuery(query), 450);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const results = useMemo(() => {
    const value = debouncedQuery.trim().toLowerCase();
    if (!value) return DATA;
    return DATA.filter((item) => item.toLowerCase().includes(value));
  }, [debouncedQuery]);

  return (
    <main className="app-shell">
      <section className="panel">
        <h1>Debounced Search</h1>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search topics" />
        <p>Searching for: {debouncedQuery || "all"}</p>
        <ul>
          {results.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </main>
  );
}
`,
      appCss: `.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
}

.panel {
  width: min(540px, 100%);
  border-radius: 26px;
  padding: 30px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.22);
}

input {
  width: 100%;
  margin: 18px 0 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(15, 23, 42, 0.7);
  color: inherit;
}

p {
  margin: 0 0 14px;
  color: #cbd5e1;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

li {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(30, 41, 59, 0.72);
}
`,
    }),
  },
  "infinite-scroll": {
    title: "Infinite Scroll",
    hint: "Use IntersectionObserver on a sentinel element to append more items when visible.",
    solutionFiles: makeTemplateFiles({
      appSource: `import { useEffect, useRef, useState } from "react";
import "./app.css";

const createItems = (start, count) => Array.from({ length: count }, (_, index) => "Item " + (start + index));

export default function App() {
  const [items, setItems] = useState(() => createItems(1, 20));
  const [page, setPage] = useState(1);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((value) => value + 1);
      }
    }, { threshold: 1 });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (page === 1) return;
    setItems((current) => [...current, ...createItems(current.length + 1, 10)]);
  }, [page]);

  return (
    <main className="app-shell">
      <section className="panel">
        <h1>Infinite Scroll</h1>
        <ul>
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <div ref={sentinelRef} className="sentinel">Load more...</div>
      </section>
    </main>
  );
}
`,
      appCss: `.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
}

.panel {
  width: min(540px, 100%);
  border-radius: 26px;
  padding: 30px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.22);
}

ul {
  list-style: none;
  margin: 18px 0 0;
  padding: 0;
  display: grid;
  gap: 10px;
  max-height: 420px;
  overflow: auto;
}

li {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(30, 41, 59, 0.72);
}

.sentinel {
  text-align: center;
  padding: 14px 0 0;
  color: #94a3b8;
}
`,
    }),
  },
};

const isValidTemplate = (key) =>
  Boolean(key && Object.prototype.hasOwnProperty.call(TEMPLATE_LIBRARY, key));
const isValidChallenge = (key) =>
  Boolean(key && Object.prototype.hasOwnProperty.call(CHALLENGE_LIBRARY, key));

const makeChallengeStarterFiles = (title) =>
  makeTemplateFiles({
    appSource: `import "./app.css";

export default function App() {
  return (
    <main className="app-shell">
      <section className="panel challenge-panel">
        <p className="eyebrow">Challenge</p>
        <h1>${title}</h1>
        <p>Start with a blank canvas. Use the hint bar above to guide the implementation.</p>
      </section>
    </main>
  );
}
`,
    appCss: `.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
}

.panel {
  width: min(720px, 100%);
  border-radius: 28px;
  padding: 34px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px dashed rgba(148, 163, 184, 0.36);
}

.eyebrow {
  margin: 0 0 12px;
  color: #38bdf8;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 12px;
}

h1 {
  margin: 0;
}

p {
  margin: 14px 0 0;
  color: #cbd5e1;
  line-height: 1.7;
}
`,
  });

export default function Sandbox() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const templateFromUrl = searchParams.get("template");
  const challengeFromUrl = searchParams.get("challenge");

  const [sandboxState, setSandboxState] = useState(() => {
    if (isValidChallenge(challengeFromUrl)) {
      return { mode: "challenge", key: challengeFromUrl };
    }
    if (isValidTemplate(templateFromUrl)) {
      return { mode: "template", key: templateFromUrl };
    }
    const fromStorage = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (isValidTemplate(fromStorage)) {
      return { mode: "template", key: fromStorage };
    }
    return { mode: "template", key: DEFAULT_TEMPLATE_KEY };
  });

  const [allSolutionsUnlocked, setAllSolutionsUnlocked] = useState(false);

  const isChallengeMode = sandboxState.mode === "challenge";
  const activeTemplate = isChallengeMode ? DEFAULT_TEMPLATE_KEY : sandboxState.key;
  const activeChallenge = isChallengeMode ? CHALLENGE_LIBRARY[sandboxState.key] : null;
  const activeTemplateData = TEMPLATE_LIBRARY[activeTemplate];
  const workspaceId = `${sandboxState.mode}:${sandboxState.key}`;
  const codingTimer = useCodingTimer(workspaceId);

  const editorFiles = useMemo(() => {
    if (isChallengeMode && activeChallenge) {
      if (allSolutionsUnlocked) return activeChallenge.solutionFiles;
      return makeChallengeStarterFiles(activeChallenge.title);
    }
    return activeTemplateData.files;
  }, [activeChallenge, activeTemplateData.files, allSolutionsUnlocked, isChallengeMode]);

  const activeLabel = isChallengeMode ? activeChallenge.title : activeTemplateData.label;

  useEffect(() => {
    if (isChallengeMode) {
      if (searchParams.get("challenge") !== sandboxState.key || searchParams.get("template")) {
        setSearchParams({ challenge: sandboxState.key }, { replace: true });
      }
      return;
    }

    if (searchParams.get("template") !== sandboxState.key || searchParams.get("challenge")) {
      setSearchParams({ template: sandboxState.key }, { replace: true });
    }
  }, [isChallengeMode, sandboxState.key, searchParams, setSearchParams]);

  useEffect(() => {
    if (!isChallengeMode) {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, sandboxState.key);
    }
  }, [isChallengeMode, sandboxState.key]);

  const openTemplate = (templateKey) => {
    if (!isValidTemplate(templateKey)) return;
    setAllSolutionsUnlocked(false);
    setSandboxState({ mode: "template", key: templateKey });
  };

  const openChallenge = (challengeKey) => {
    if (!isValidChallenge(challengeKey)) return;
    setAllSolutionsUnlocked(false);
    setSandboxState({ mode: "challenge", key: challengeKey });
  };

  return (
    <div className="sandbox-page">
      <div className="noise-overlay" />
      <div className="sandbox-grid-bg" />

      <header className="sandbox-header">
        <div className="sandbox-header-left">
          <button className="sandbox-back-btn" onClick={() => navigate("/")}>Home</button>
          <div className="sandbox-logo">
            <div className="sandbox-logo-icon">RF</div>
            <span className="sandbox-logo-text">Sandbox</span>
          </div>
        </div>

        <div className="template-tabs">
          {Object.entries(TEMPLATE_LIBRARY).map(([key, template]) => (
            <button
              key={key}
              type="button"
              className={`template-tab ${!isChallengeMode && activeTemplate === key ? "active" : ""}`}
              onClick={() => openTemplate(key)}
            >
              <span className="template-tab-icon">{template.icon}</span>
              {template.label}
            </button>
          ))}
          <span className="template-tabs-divider" />
          {Object.entries(CHALLENGE_LIBRARY).slice(0, 3).map(([key, challenge]) => (
            <button
              key={key}
              type="button"
              className={`template-tab challenge-tab ${isChallengeMode && sandboxState.key === key ? "active" : ""}`}
              onClick={() => openChallenge(key)}
            >
              CH {challenge.title}
            </button>
          ))}
        </div>

        <div className="sandbox-header-right">
          <div className={`sandbox-timer-pill ${codingTimer.isActive ? "active" : ""}`}>
            <span>{codingTimer.isActive ? "Tracking" : "Idle"}</span>
            <strong>{formatDuration(codingTimer.sessionMs)}</strong>
          </div>
          <span className="sandbox-active-label">{activeLabel}</span>
        </div>
      </header>

      {isChallengeMode && activeChallenge ? (
        <div className="challenge-hint-bar">
          <div className="hint-content">
            <span className="hint-chip">Hint</span>
            <p>{activeChallenge.hint}</p>
          </div>
          <button
            type="button"
            className="unlock-btn"
            onClick={() => setAllSolutionsUnlocked(true)}
            disabled={allSolutionsUnlocked}
          >
            {allSolutionsUnlocked ? "Solution Loaded" : "Show Solution"}
          </button>
        </div>
      ) : null}

      <div className="sandbox-workbench">
        <SandboxWorkbench
          key={`${sandboxState.mode}-${sandboxState.key}-${allSolutionsUnlocked ? "u" : "l"}`}
          activeLabel={activeLabel}
          codingTimer={codingTimer}
          initialFiles={editorFiles}
          workspaceId={workspaceId}
        />
      </div>
    </div>
  );
}


