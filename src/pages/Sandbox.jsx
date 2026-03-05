import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  useSandpack,
} from "@codesandbox/sandpack-react";
import "./Sandbox.css";

/* ─── constants ───────────────────────────────────────────────── */
const DEFAULT_TEMPLATE_KEY = "blank";
const TEMPLATE_STORAGE_KEY = "reactforge_active_template";

const BASE_STYLE_FILE = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #090b10;
  color: #f2f7ff;
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
}
`;

/* ─── template library ────────────────────────────────────────── */
const TEMPLATE_LIBRARY = {
  blank: {
    label: "Blank",
    icon: "⚛",
    files: {
      "/App.js": `import './styles.css'

export default function App() {
  return (
    <main className="app">
      <h1>Start building</h1>
    </main>
  )
}
`,
      "/styles.css": `${BASE_STYLE_FILE}
h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #8fd6ff;
}
`,
    },
  },
  counter: {
    label: "Counter",
    icon: "🔢",
    files: {
      "/App.js": `import { useState } from 'react'
import './styles.css'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="app">
      <section className="panel">
        <h1>Counter App</h1>
        <p className="count">{count}</p>
        <div className="actions">
          <button onClick={() => setCount(c => c - 1)}>-1</button>
          <button onClick={() => setCount(0)}>Reset</button>
          <button onClick={() => setCount(c => c + 1)}>+1</button>
        </div>
      </section>
    </main>
  )
}
`,
      "/styles.css": `${BASE_STYLE_FILE}
.panel {
  background: #121623;
  border: 1px solid #24314a;
  border-radius: 12px;
  padding: 24px;
  width: min(420px, 100%);
  text-align: center;
}

h1 { margin-bottom: 12px; }
.count {
  font-size: 3rem;
  margin-bottom: 14px;
}
.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
button {
  padding: 8px 12px;
}
`,
    },
  },
  todo: {
    label: "Todo",
    icon: "✅",
    files: {
      "/App.js": `import { useState } from 'react'
import './styles.css'

export default function App() {
  const [text, setText] = useState('')
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn useState', done: false },
    { id: 2, text: 'Build todo app', done: true },
  ])

  const addTodo = () => {
    if (!text.trim()) return
    setTodos((prev) => [...prev, { id: Date.now(), text, done: false }])
    setText('')
  }

  return (
    <main className="app">
      <section className="panel">
        <h1>Todo List</h1>
        <div className="row">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="New task" />
          <button onClick={addTodo}>Add</button>
        </div>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} className={todo.done ? 'done' : ''}>
              <span onClick={() => setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, done: !t.done } : t))}>
                {todo.text}
              </span>
              <button onClick={() => setTodos((prev) => prev.filter((t) => t.id !== todo.id))}>x</button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
`,
      "/styles.css": `${BASE_STYLE_FILE}
.panel {
  background: #121623;
  border: 1px solid #24314a;
  border-radius: 12px;
  padding: 24px;
  width: min(520px, 100%);
}
.row {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}
input {
  flex: 1;
  padding: 8px;
}
ul {
  list-style: none;
  display: grid;
  gap: 8px;
}
li {
  display: flex;
  justify-content: space-between;
  background: #0f1320;
  border: 1px solid #202b43;
  padding: 8px;
}
.done span {
  text-decoration: line-through;
  opacity: 0.6;
}
`,
    },
  },
  fetch: {
    label: "Fetch",
    icon: "🌐",
    files: {
      "/App.js": `import { useEffect, useState } from 'react'
import './styles.css'

export default function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users')
      const data = await response.json()
      setUsers(data)
      setLoading(false)
    }

    run()
  }, [])

  return (
    <main className="app">
      <section className="panel">
        <h1>User Directory</h1>
        {loading ? <p>Loading...</p> : (
          <div className="grid">
            {users.map((user) => (
              <article key={user.id}>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
`,
      "/styles.css": `${BASE_STYLE_FILE}
.panel {
  width: min(900px, 100%);
}
.grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}
article {
  border: 1px solid #23324d;
  background: #111726;
  border-radius: 10px;
  padding: 12px;
}
`,
    },
  },
};

/* ─── challenge library ───────────────────────────────────────── */
const CHALLENGE_LIBRARY = {
  counter: {
    title: "Counter App",
    hint: "Use useState for count and provide increment, decrement, and reset buttons.",
    solutionFiles: TEMPLATE_LIBRARY.counter.files,
  },
  todo: {
    title: "Todo List",
    hint: "Track input state and a todo array, then add/toggle/delete tasks.",
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
    solutionFiles: {
      "/App.js": `import { useEffect, useState } from 'react'
import './styles.css'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <main className={\`app \${theme}\`}>
      <section className="panel">
        <h1>Theme Toggle</h1>
        <p>Current theme: {theme}</p>
        <button onClick={() => setTheme((prev) => prev === 'dark' ? 'light' : 'dark')}>
          Toggle Theme
        </button>
      </section>
    </main>
  )
}
`,
      "/styles.css": `${BASE_STYLE_FILE}
.app.dark { background: #0a0c12; color: #f2f7ff; }
.app.light { background: #eef3fb; color: #0a1224; }
.panel {
  background: rgba(18, 23, 36, 0.9);
  border: 1px solid #22314a;
  border-radius: 12px;
  padding: 24px;
}
.app.light .panel {
  background: #ffffff;
  border-color: #c8d6ef;
}
`,
    },
  },
  "debounced-search": {
    title: "Debounced Search",
    hint: "Keep one state for raw input and another for debounced value with setTimeout.",
    solutionFiles: {
      "/App.js": `import { useEffect, useMemo, useState } from 'react'
import './styles.css'

const DATA = ['React', 'Redux', 'Router', 'Render', 'Ref', 'Reducer', 'Request', 'Result']

export default function App() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 450)
    return () => clearTimeout(id)
  }, [query])

  const results = useMemo(() => {
    const value = debouncedQuery.trim().toLowerCase()
    if (!value) return DATA
    return DATA.filter((item) => item.toLowerCase().includes(value))
  }, [debouncedQuery])

  return (
    <main className="app">
      <section className="panel">
        <h1>Debounced Search</h1>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics" />
        <p>Searching for: {debouncedQuery || 'all'}</p>
        <ul>
          {results.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </main>
  )
}
`,
      "/styles.css": `${BASE_STYLE_FILE}
.panel {
  width: min(500px, 100%);
  border: 1px solid #22314a;
  background: #111726;
  border-radius: 12px;
  padding: 24px;
}
input {
  width: 100%;
  margin: 12px 0;
  padding: 8px;
}
ul {
  margin-top: 12px;
  list-style: none;
  display: grid;
  gap: 6px;
}
li {
  background: #0d121f;
  border: 1px solid #1f2a42;
  border-radius: 8px;
  padding: 8px;
}
`,
    },
  },
  "infinite-scroll": {
    title: "Infinite Scroll",
    hint: "Use IntersectionObserver on a sentinel element to append more items when visible.",
    solutionFiles: {
      "/App.js": `import { useEffect, useRef, useState } from 'react'
import './styles.css'

const createItems = (start, count) => Array.from({ length: count }, (_, i) => \`Item \${ start + i}\`)

export default function App() {
  const [items, setItems] = useState(() => createItems(1, 20))
  const [page, setPage] = useState(1)
  const sentinelRef = useRef(null)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1)
      }
    }, { threshold: 1 })

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (page === 1) return
    setItems((prev) => [...prev, ...createItems(prev.length + 1, 10)])
  }, [page])

  return (
    <main className="app">
      <section className="panel">
        <h1>Infinite Scroll</h1>
        <ul>
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <div ref={sentinelRef} className="sentinel">Load more...</div>
      </section>
    </main>
  )
}
`,
      "/styles.css": `${BASE_STYLE_FILE}
.panel {
  width: min(500px, 100%);
  border: 1px solid #22314a;
  background: #111726;
  border-radius: 12px;
  padding: 24px;
}
ul {
  list-style: none;
  display: grid;
  gap: 8px;
  max-height: 420px;
  overflow: auto;
  margin-top: 12px;
}
li {
  background: #0d121f;
  border: 1px solid #1f2a42;
  border-radius: 8px;
  padding: 8px;
}
.sentinel {
  text-align: center;
  padding: 12px;
  color: #9db6d6;
}
`,
    },
  },
};

/* ─── theme ───────────────────────────────────────────────────── */
const REACTFORGE_THEME = {
  colors: {
    surface1: "#030712",
    surface2: "#111827",
    surface3: "#1f2937",
    clickable: "#9ca3af",
    base: "#f3f4f6",
    disabled: "#4b5563",
    hover: "#8b5cf6",
    accent: "#8b5cf6",
    error: "#ef4444",
    errorSurface: "#450a0a",
  },
  syntax: {
    plain: "#f3f4f6",
    comment: { color: "#6b7280", fontStyle: "italic" },
    keyword: "#ec4899",
    tag: "#3b82f6",
    punctuation: "#9ca3af",
    definition: "#8b5cf6",
    property: "#10b981",
    static: "#10b981",
    string: "#f59e0b",
  },
  font: {
    body: "'Space Mono', 'Fira Code', monospace",
    mono: "'Fira Code', 'Cascadia Code', monospace",
    size: "13px",
    lineHeight: "1.65",
  },
};

/* ─── helpers ─────────────────────────────────────────────────── */
const isValidTemplate = (key) =>
  Boolean(key && Object.prototype.hasOwnProperty.call(TEMPLATE_LIBRARY, key));
const isValidChallenge = (key) =>
  Boolean(key && Object.prototype.hasOwnProperty.call(CHALLENGE_LIBRARY, key));

const makeChallengeStarterFiles = (title) => ({
  "/App.js": `import './styles.css'

export default function App() {
  return (
    <main className="app">
      <section className="panel">
        <h1>${title}</h1>
        <p>Start with a blank canvas. Use the hint bar above to guide you.</p>
      </section>
    </main>
  )
}
`,
  "/styles.css": `${BASE_STYLE_FILE}
.panel {
  width: min(680px, 100%);
  border: 1px dashed #3b4f71;
  border-radius: 12px;
  background: #0d121e;
  padding: 26px;
  text-align: left;
}
h1 { margin-bottom: 10px; }
p { color: #a4b5d3; line-height: 1.6; }
`,
});

/* ─── NewFileButton (inner – needs useSandpack) ───────────────── */
function NewFileButton() {
  const { sandpack } = useSandpack();
  const [showInput, setShowInput] = useState(false);
  const [fileName, setFileName] = useState("");

  const createFile = () => {
    const name = fileName.trim();
    if (!name) return;
    const path = name.startsWith("/") ? name : `/${name}`;
    sandpack.addFile(path, "");
    sandpack.openFile(path);
    setFileName("");
    setShowInput(false);
  };

  if (!showInput) {
    return (
      <button
        type="button"
        className="new-file-btn"
        onClick={() => setShowInput(true)}
        title="New file"
      >
        +
      </button>
    );
  }

  return (
    <div className="new-file-input-row">
      <input
        className="new-file-input"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") createFile();
          if (e.key === "Escape") { setShowInput(false); setFileName(""); }
        }}
        placeholder="filename.js"
        autoFocus
      />
      <button type="button" className="new-file-confirm" onClick={createFile}>
        ✓
      </button>
    </div>
  );
}

/* ─── main Sandbox component ──────────────────────────────────── */
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

  const editorFiles = useMemo(() => {
    if (isChallengeMode && activeChallenge) {
      if (allSolutionsUnlocked) return activeChallenge.solutionFiles;
      return makeChallengeStarterFiles(activeChallenge.title);
    }
    return activeTemplateData.files;
  }, [activeChallenge, activeTemplateData.files, allSolutionsUnlocked, isChallengeMode]);

  const activeLabel = isChallengeMode
    ? activeChallenge.title
    : activeTemplateData.label;

  /* sync URL */
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

  /* persist last template */
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

      {/* ── header ── */}
      <header className="sandbox-header">
        <div className="sandbox-header-left">
          <button className="sandbox-back-btn" onClick={() => navigate("/")}>
            ← Home
          </button>
          <div className="sandbox-logo">
            <div className="sandbox-logo-icon">RF</div>
            <span className="sandbox-logo-text">Sandbox</span>
          </div>
        </div>

        {/* template tabs */}
        <div className="template-tabs">
          {Object.entries(TEMPLATE_LIBRARY).map(([key, tmpl]) => (
            <button
              key={key}
              type="button"
              className={`template-tab ${!isChallengeMode && activeTemplate === key ? "active" : ""}`}
              onClick={() => openTemplate(key)}
            >
              <span className="template-tab-icon">{tmpl.icon}</span>
              {tmpl.label}
            </button>
          ))}
          <span className="template-tabs-divider" />
          {Object.entries(CHALLENGE_LIBRARY).slice(0, 3).map(([key, ch]) => (
            <button
              key={key}
              type="button"
              className={`template-tab challenge-tab ${isChallengeMode && sandboxState.key === key ? "active" : ""}`}
              onClick={() => openChallenge(key)}
            >
              🎯 {ch.title}
            </button>
          ))}
        </div>

        <span className="sandbox-active-label">{activeLabel}</span>
      </header>

      {/* ── challenge hint bar ── */}
      {isChallengeMode && activeChallenge ? (
        <div className="challenge-hint-bar">
          <div className="hint-content">
            <span className="hint-chip">💡 Hint</span>
            <p>{activeChallenge.hint}</p>
          </div>
          <button
            type="button"
            className="unlock-btn"
            onClick={() => setAllSolutionsUnlocked(true)}
            disabled={allSolutionsUnlocked}
          >
            {allSolutionsUnlocked ? "✓ Solution Loaded" : "Show Solution"}
          </button>
        </div>
      ) : null}

      {/* ── workbench ── */}
      <div className="sandbox-workbench">
        <SandpackProvider
          key={`${sandboxState.mode}-${sandboxState.key}-${allSolutionsUnlocked ? "u" : "l"}`}
          template="react"
          theme={REACTFORGE_THEME}
          files={editorFiles}
          options={{
            activeFile: "/App.js",
            visibleFiles: ["/App.js", "/styles.css"],
            externalResources: [
              "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;600&display=swap",
            ],
          }}
        >
          <div className="sandbox-ide-grid">
            {/* sidebar – file explorer */}
            <aside className="ide-sidebar">
              <div className="explorer-header">
                <span>EXPLORER</span>
                <NewFileButton />
              </div>
              <SandpackFileExplorer
                autoHiddenFiles
                style={{ flex: 1, minHeight: 0 }}
              />
            </aside>

            {/* editor + preview */}
            <SandpackLayout className="sandbox-layout">
              <SandpackCodeEditor
                style={{ height: "100%" }}
                showLineNumbers
                showTabs
                closableTabs
                wrapContent
              />
              <SandpackPreview
                style={{ height: "100%" }}
                showNavigator
                showRefreshButton
                showOpenInCodeSandbox={false}
              />
            </SandpackLayout>
          </div>
        </SandpackProvider>
      </div>

      {/* ── footer ── */}
      <div className="sandbox-footer-tips">
        <div className="sandbox-tip"><span className="tip-key">Ctrl+S</span> Save</div>
        <div className="sandbox-tip"><span className="tip-key">Ctrl+Z</span> Undo</div>
        <div className="sandbox-tip"><span className="tip-key">Tab</span> Indent</div>
        <div className="sandbox-tip-divider" />
        <div className="sandbox-tip">Live preview updates as you type.</div>
      </div>
    </div>
  );
}
