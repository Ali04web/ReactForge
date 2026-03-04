import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import "./Sandbox.css";

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

const TEMPLATE_LIBRARY = {
  blank: {
    label: "Blank Project",
    desc: "Empty React starter with live preview.",
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
    label: "Counter App",
    desc: "useState basics with increment, decrement, and reset.",
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
    label: "Todo List",
    desc: "CRUD operations with useState and map.",
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
    label: "Fetch and Display",
    desc: "useEffect with API calls and loading states.",
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
    title: "Fetch and Display",
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

const SANDBOX_DEPENDENCIES = [
  { name: "react", version: "^19.0.0" },
  { name: "react-dom", version: "^19.0.0" },
  { name: "react-router-dom", version: "^7.0.0" },
  { name: "@codesandbox/sandpack-react", version: "^2.0.0" },
];

const REACTFORGE_THEME = {
  colors: {
    surface1: "#06080f",
    surface2: "#0d121d",
    surface3: "#141b29",
    clickable: "#95a8c9",
    base: "#dce7fb",
    disabled: "#3b4b69",
    hover: "#8fd6ff",
    accent: "#8fd6ff",
    error: "#ff5d7d",
    errorSurface: "#2a0f18",
  },
  syntax: {
    plain: "#dce7fb",
    comment: { color: "#6c7f9e", fontStyle: "italic" },
    keyword: "#8fd6ff",
    tag: "#7cf4bd",
    punctuation: "#9fb2cf",
    definition: "#c4a8ff",
    property: "#f6d58c",
    static: "#f6d58c",
    string: "#7cf4bd",
  },
  font: {
    body: "'Space Mono', 'Fira Code', monospace",
    mono: "'Fira Code', 'Cascadia Code', monospace",
    size: "13px",
    lineHeight: "1.65",
  },
};

const isValidTemplate = (key) => Boolean(key && Object.prototype.hasOwnProperty.call(TEMPLATE_LIBRARY, key));
const isValidChallenge = (key) => Boolean(key && Object.prototype.hasOwnProperty.call(CHALLENGE_LIBRARY, key));

const makeChallengeStarterFiles = (title) => ({
  "/App.js": `import './styles.css'

export default function App() {
  return (
    <main className="app">
      <section className="panel">
        <h1>${title}</h1>
        <p>Start with a blank canvas. Use the hint bar above to guide your implementation.</p>
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
h1 {
  margin-bottom: 10px;
}
p {
  color: #a4b5d3;
  line-height: 1.6;
}
`,
});

function ExplorerSection({ title, isOpen, onToggle, children }) {
  return (
    <section className="ide-section">
      <button type="button" className="ide-section-toggle" onClick={onToggle}>
        <span className="ide-arrow">{isOpen ? "v" : ">"}</span>
        <span>{title}</span>
      </button>
      {isOpen ? <div className="ide-section-body">{children}</div> : null}
    </section>
  );
}

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

  const [shareCopied, setShareCopied] = useState(false);
  const [dependencyQuery, setDependencyQuery] = useState("");
  const [allSolutionsUnlocked, setAllSolutionsUnlocked] = useState(false);
  const [sections, setSections] = useState({
    sandboxInfo: true,
    nodebox: true,
    dependencies: false,
    outline: false,
  });

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

  const setSectionOpen = (sectionName) => {
    setSections((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const openTemplate = (templateKey) => {
    if (!isValidTemplate(templateKey)) return;
    setSandboxState({ mode: "template", key: templateKey });
  };

  const openChallenge = (challengeKey) => {
    if (!isValidChallenge(challengeKey)) return;
    setSandboxState({ mode: "challenge", key: challengeKey });
  };

  const copyShareUrl = async () => {
    const query = isChallengeMode ? `challenge=${sandboxState.key}` : `template=${sandboxState.key}`;
    const shareUrl = `${window.location.origin}/sandbox?${query}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1200);
    } catch {
      setShareCopied(false);
    }
  };

  const filteredDependencies = SANDBOX_DEPENDENCIES.filter((dep) =>
    dep.name.toLowerCase().includes(dependencyQuery.trim().toLowerCase())
  );

  const visibleFiles = Object.keys(editorFiles).map((file) => file.replace("/", ""));

  return (
    <div className="sandbox-page">
      <div className="noise-overlay" />
      <div className="sandbox-grid-bg" />

      <header className="sandbox-header">
        <div className="sandbox-header-left">
          <button className="sandbox-back-btn" onClick={() => navigate("/")}>Home</button>
          <div className="sandbox-logo">
            <div className="sandbox-logo-icon">RF</div>
            <span>{isChallengeMode ? "Challenge" : "Sandbox"}</span>
          </div>
        </div>

        <div className="sandbox-header-right">
          <span className="sandbox-active-label">{activeLabel}</span>
          <button className="sandbox-share-btn" onClick={copyShareUrl}>
            {shareCopied ? "Copied" : "Copy Link"}
          </button>
        </div>
      </header>

      <div className="sandbox-workbench">
        <aside className="ide-sidebar">
          <div className="ide-rail">
            <button className="ide-rail-btn active" type="button">EX</button>
            <button className="ide-rail-btn" type="button">SR</button>
            <button className="ide-rail-btn" type="button">GL</button>
            <button className="ide-rail-btn" type="button">GH</button>
          </div>

          <div className="ide-explorer">
            <div className="ide-explorer-header">
              <span>EXPLORER</span>
              <span>...</span>
            </div>

            <ExplorerSection
              title="SANDBOX INFO"
              isOpen={sections.sandboxInfo}
              onToggle={() => setSectionOpen("sandboxInfo")}
            >
              <p className="info-line">Mode: {isChallengeMode ? "Challenge" : "Template"}</p>
              <p className="info-line">Active: {activeLabel}</p>
              <div className="mode-actions">
                <button
                  type="button"
                  className={`mode-btn ${!isChallengeMode && activeTemplate === "blank" ? "active" : ""}`}
                  onClick={() => openTemplate("blank")}
                >
                  Blank Sandbox
                </button>
                <button
                  type="button"
                  className={`mode-btn ${isChallengeMode && sandboxState.key === "counter" ? "active" : ""}`}
                  onClick={() => openChallenge("counter")}
                >
                  Counter Challenge
                </button>
                <button
                  type="button"
                  className={`mode-btn ${isChallengeMode && sandboxState.key === "todo" ? "active" : ""}`}
                  onClick={() => openChallenge("todo")}
                >
                  Todo Challenge
                </button>
                <button
                  type="button"
                  className={`mode-btn ${isChallengeMode && sandboxState.key === "fetch" ? "active" : ""}`}
                  onClick={() => openChallenge("fetch")}
                >
                  Fetch Challenge
                </button>
              </div>
            </ExplorerSection>

            <ExplorerSection
              title="NODEBOX"
              isOpen={sections.nodebox}
              onToggle={() => setSectionOpen("nodebox")}
            >
              <div className="file-node folder">public</div>
              {visibleFiles.map((file) => (
                <div key={file} className="file-node file">{file}</div>
              ))}
              <div className="file-node file">package.json</div>
            </ExplorerSection>

            <ExplorerSection
              title="DEPENDENCIES"
              isOpen={sections.dependencies}
              onToggle={() => setSectionOpen("dependencies")}
            >
              <input
                className="dependency-search"
                placeholder="Search..."
                value={dependencyQuery}
                onChange={(event) => setDependencyQuery(event.target.value)}
              />
              <div className="dependency-list">
                {filteredDependencies.map((dep) => (
                  <div key={dep.name} className="dependency-item">
                    <span>{dep.name}</span>
                    <span className="dependency-version">{dep.version}</span>
                  </div>
                ))}
              </div>
            </ExplorerSection>

            <ExplorerSection
              title="OUTLINE"
              isOpen={sections.outline}
              onToggle={() => setSectionOpen("outline")}
            >
              <div className="file-node file">root</div>
            </ExplorerSection>
          </div>
        </aside>

        <div className="ide-main">
          {isChallengeMode && activeChallenge ? (
            <div className="challenge-hint-bar">
              <div>
                <span className="hint-chip">Hint</span>
                <p>{activeChallenge.hint}</p>
              </div>
              <button
                type="button"
                className="unlock-btn"
                onClick={() => setAllSolutionsUnlocked(true)}
                disabled={allSolutionsUnlocked}
              >
                {allSolutionsUnlocked ? "All Solutions Unlocked" : "Unlock All Challenge Answers"}
              </button>
            </div>
          ) : null}

          <div className="sandbox-editor-wrapper">
            <SandpackProvider
              key={`${sandboxState.mode}-${sandboxState.key}-${allSolutionsUnlocked ? "unlocked" : "locked"}`}
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
              <SandpackLayout className="sandbox-layout">
                <SandpackCodeEditor
                  className="sandbox-code-editor"
                  style={{ height: "100%" }}
                  showLineNumbers
                  showTabs
                  closableTabs
                  wrapContent
                />
                <SandpackPreview
                  className="sandbox-live-preview"
                  style={{ height: "100%" }}
                  showNavigator
                  showRefreshButton
                />
              </SandpackLayout>
            </SandpackProvider>
          </div>
        </div>
      </div>

      <div className="sandbox-footer-tips">
        <div className="sandbox-tip"><span className="tip-key">Ctrl+S</span> Save</div>
        <div className="sandbox-tip"><span className="tip-key">Ctrl+Z</span> Undo</div>
        <div className="sandbox-tip"><span className="tip-key">Tab</span> Indent</div>
        <div className="sandbox-tip-divider" />
        <div className="sandbox-tip">Live preview updates as you edit files.</div>
      </div>
    </div>
  );
}
