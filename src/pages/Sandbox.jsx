import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
    SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import "./Sandbox.css";

/* ── Template file sets ─────────────────────────────────────────────── */

const TEMPLATES = {
    blank: {
        label: "⚛ Blank Project",
        desc: "Empty Vite-style React starter",
        files: {
            "/App.jsx": `import { useState } from 'react'
import './styles.css'

export default function App() {
  return (
    <div className="app">
      <h1>Hello ReactForge! 🚀</h1>
      <p>Start coding here...</p>
    </div>
  )
}
`,
            "/index.jsx": `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`,
            "/styles.css": `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #0f0f1a;
  color: #e0e0e0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, #00ffe5, #00aaff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  color: #888;
  font-size: 1.1rem;
}

button {
  margin: 0.5rem;
  padding: 0.6rem 1.5rem;
  border: 1px solid #00ffe5;
  background: transparent;
  color: #00ffe5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

button:hover {
  background: #00ffe5;
  color: #0f0f1a;
  box-shadow: 0 0 20px #00ffe555;
}
`,
        },
    },

    counter: {
        label: "🔢 Counter App",
        desc: "useState basics — increment, decrement, reset",
        files: {
            "/App.jsx": `import { useState } from 'react'
import './styles.css'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>Counter App</h1>
      <div className="counter-display">{count}</div>
      <div className="button-group">
        <button onClick={() => setCount(c => c - 1)}>− Decrement</button>
        <button className="reset" onClick={() => setCount(0)}>↺ Reset</button>
        <button onClick={() => setCount(c => c + 1)}>+ Increment</button>
      </div>
      {/* 
        🎯 Challenge: 
        1. Add a "double" button that doubles the count
        2. Change the counter color based on positive/negative
        3. Add a step size input
      */}
    </div>
  )
}
`,
            "/index.jsx": `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`,
            "/styles.css": `* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #0f0f1a;
  color: #e0e0e0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app { text-align: center; padding: 2rem; }

h1 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, #00ffe5, #00aaff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.counter-display {
  font-size: 5rem;
  font-weight: 700;
  margin: 1rem 0;
  color: #00ffe5;
  text-shadow: 0 0 30px #00ffe555;
}

.button-group { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }

button {
  padding: 0.6rem 1.5rem;
  border: 1px solid #00ffe5;
  background: transparent;
  color: #00ffe5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

button:hover {
  background: #00ffe5;
  color: #0f0f1a;
  box-shadow: 0 0 20px #00ffe555;
}

button.reset { border-color: #f000ff; color: #f000ff; }
button.reset:hover { background: #f000ff; color: #0f0f1a; box-shadow: 0 0 20px #f000ff55; }
`,
        },
    },

    todo: {
        label: "✅ Todo List",
        desc: "CRUD operations with useState & map",
        files: {
            "/App.jsx": `import { useState } from 'react'
import './styles.css'

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn useState', done: true },
    { id: 2, text: 'Build a todo app', done: false },
    { id: 3, text: 'Ace the interview', done: false },
  ])
  const [input, setInput] = useState('')

  const addTodo = () => {
    if (!input.trim()) return
    setTodos([...todos, { id: Date.now(), text: input, done: false }])
    setInput('')
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <div className="app">
      <h1>📝 Todo List</h1>
      <div className="input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="Add a new task..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.done ? 'done' : ''}>
            <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
            <button className="delete" onClick={() => deleteTodo(todo.id)}>✕</button>
          </li>
        ))}
      </ul>
      <p className="count">{todos.filter(t => !t.done).length} remaining</p>
      {/* 
        🎯 Challenge:
        1. Add edit functionality
        2. Add a "clear completed" button
        3. Save todos to localStorage
      */}
    </div>
  )
}
`,
            "/index.jsx": `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`,
            "/styles.css": `* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #0f0f1a;
  color: #e0e0e0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app { padding: 2rem; max-width: 500px; width: 100%; }

h1 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.input-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

input {
  flex: 1;
  padding: 0.7rem 1rem;
  border: 1px solid #333;
  background: #1a1a2e;
  color: #fff;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

input:focus { border-color: #00ffe5; }

button {
  padding: 0.7rem 1.5rem;
  border: 1px solid #00ffe5;
  background: #00ffe5;
  color: #0f0f1a;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

button:hover { box-shadow: 0 0 20px #00ffe555; }

.todo-list { list-style: none; }

.todo-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  border: 1px solid #222;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.todo-list li:hover { border-color: #00ffe555; }
.todo-list li.done span { text-decoration: line-through; color: #555; }

.delete {
  background: transparent;
  border: 1px solid #ff3d5e;
  color: #ff3d5e;
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
}

.delete:hover { background: #ff3d5e; color: #fff; }

.count {
  text-align: center;
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
}
`,
        },
    },

    fetch: {
        label: "🌐 Fetch & Display",
        desc: "useEffect + API calls + async/await",
        files: {
            "/App.jsx": `import { useState, useEffect } from 'react'
import './styles.css'

export default function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setUsers(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  if (loading) return <div className="app"><div className="loader">Loading...</div></div>
  if (error) return <div className="app"><p className="error">Error: {error}</p></div>

  return (
    <div className="app">
      <h1>👥 User Directory</h1>
      <div className="grid">
        {users.map(user => (
          <div key={user.id} className="card">
            <div className="avatar">{user.name[0]}</div>
            <h3>{user.name}</h3>
            <p className="email">{user.email}</p>
            <p className="company">{user.company.name}</p>
          </div>
        ))}
      </div>
      {/* 
        🎯 Challenge:
        1. Add a search/filter by name
        2. Add a loading skeleton instead of text  
        3. Click a card to show full user details
      */}
    </div>
  )
}
`,
            "/index.jsx": `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`,
            "/styles.css": `* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #0f0f1a;
  color: #e0e0e0;
  min-height: 100vh;
  padding: 2rem;
}

.app { max-width: 900px; margin: 0 auto; }

h1 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.loader {
  text-align: center;
  color: #00ffe5;
  font-size: 1.2rem;
  margin-top: 4rem;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.error { color: #ff3d5e; text-align: center; margin-top: 4rem; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.card {
  background: #1a1a2e;
  border: 1px solid #222;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.2s;
}

.card:hover {
  border-color: #00ffe5;
  transform: translateY(-4px);
  box-shadow: 0 8px 30px #00ffe522;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00ffe5, #00aaff);
  color: #0f0f1a;
  font-size: 1.4rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.card h3 { font-size: 1rem; margin-bottom: 0.3rem; }
.email { color: #00ffe5; font-size: 0.85rem; margin-bottom: 0.3rem; }
.company { color: #666; font-size: 0.8rem; }
`,
        },
    },
};

/* ── Sandpack Theme ─────────────────────────────────────────────────── */

const REACTFORGE_THEME = {
    colors: {
        surface1: "#0d0d1a",
        surface2: "#161626",
        surface3: "#1e1e32",
        clickable: "#999",
        base: "#c0c0c0",
        disabled: "#444",
        hover: "#00ffe5",
        accent: "#00ffe5",
        error: "#ff3d5e",
        errorSurface: "#1a0008",
    },
    syntax: {
        plain: "#d4d4d4",
        comment: { color: "#6a6a8a", fontStyle: "italic" },
        keyword: "#f000ff",
        tag: "#00aaff",
        punctuation: "#888",
        definition: "#00ffe5",
        property: "#7dff00",
        static: "#ffee00",
        string: "#ffee00",
    },
    font: {
        body: "'Space Mono', 'Fira Code', monospace",
        mono: "'Fira Code', 'Cascadia Code', monospace",
        size: "13px",
        lineHeight: "1.6",
    },
};

/* ── Sandbox Page ───────────────────────────────────────────────────── */

export default function Sandbox() {
    const navigate = useNavigate();
    const [activeTemplate, setActiveTemplate] = useState("blank");
    const [sandpackKey, setSandpackKey] = useState(0);

    const switchTemplate = (key) => {
        setActiveTemplate(key);
        setSandpackKey((k) => k + 1);
    };

    const template = TEMPLATES[activeTemplate];

    return (
        <div className="sandbox-page">
            {/* Background effects */}
            <div className="noise-overlay" />
            <div className="sandbox-grid-bg" />

            {/* Top bar */}
            <header className="sandbox-header">
                <div className="sandbox-header-left">
                    <button className="sandbox-back-btn" onClick={() => navigate("/")}>
                        ← Home
                    </button>
                    <div className="sandbox-logo">
                        <div className="sandbox-logo-icon">⚛</div>
                        <span>ReactForge</span>
                        <span className="sandbox-badge">Sandbox</span>
                    </div>
                </div>

                <div className="sandbox-header-right">
                    <div className="sandbox-template-selector">
                        {Object.entries(TEMPLATES).map(([key, t]) => (
                            <button
                                key={key}
                                className={`sandbox-template-btn ${activeTemplate === key ? "active" : ""}`}
                                onClick={() => switchTemplate(key)}
                                title={t.desc}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Template description bar */}
            <div className="sandbox-info-bar">
                <span className="sandbox-info-icon">💡</span>
                <span className="sandbox-info-text">
                    <strong>{template.label}</strong> — {template.desc}. Edit the code on
                    the left, see live output on the right.
                </span>
            </div>

            {/* Sandpack editor */}
            <div className="sandbox-editor-wrapper">
                <SandpackProvider
                    key={sandpackKey}
                    template="react"
                    theme={REACTFORGE_THEME}
                    files={template.files}
                    options={{
                        activeFile: "/App.jsx",
                        visibleFiles: Object.keys(template.files),
                        externalResources: [
                            "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;600&display=swap",
                        ],
                    }}
                >
                    <SandpackLayout className="sandbox-layout">
                        <SandpackFileExplorer style={{ height: "100%" }} />
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
                        />
                    </SandpackLayout>
                </SandpackProvider>
            </div>

            {/* Bottom tips */}
            <div className="sandbox-footer-tips">
                <div className="sandbox-tip">
                    <span className="tip-key">Ctrl+S</span> Save
                </div>
                <div className="sandbox-tip">
                    <span className="tip-key">Ctrl+Z</span> Undo
                </div>
                <div className="sandbox-tip">
                    <span className="tip-key">Tab</span> Indent
                </div>
                <div className="sandbox-tip-divider" />
                <div className="sandbox-tip">
                    Read the <span style={{ color: "#00ffe5" }}>🎯 Challenge</span>{" "}
                    comments in the code for tasks to practice!
                </div>
            </div>
        </div>
    );
}
