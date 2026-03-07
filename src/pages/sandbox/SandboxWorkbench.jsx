import { useEffect, useMemo, useRef, useState } from "react";
import {
  ACTIVITY_ITEMS,
  WORKSPACE_ROOT_LABEL,
  buildExplorerTree,
  collectFolderPaths,
  countTreeFiles,
  countTreeFolders,
  formatCompactDuration,
  formatDuration,
  getAncestorFolders,
  getDefaultFileContent,
  getFileEntryCode,
  getFileIcon,
  getFileNameFromPath,
  getLanguageLabel,
  getPathSegments,
  isExplorerHiddenPath,
  normalizeFilePath,
  normalizeFolderPath,
  uniquePaths,
} from "./sandboxWorkbenchUtils.js";
import {
  PREVIEW_MESSAGE_SOURCE,
  TERMINAL_MESSAGE_SOURCE,
  useLocalSandboxWorkspace,
} from "./useLocalSandboxWorkspace.js";

const VIRTUAL_FOLDER_STORAGE_PREFIX = "reactforge_virtual_folders";

const createTerminalEntry = (kind, text) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  kind,
  text,
});

const readStoredFolders = (storageKey) => {
  if (typeof window === "undefined") return [];

  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(raw)
      ? raw.map((value) => normalizeFolderPath(String(value || ""))).filter(Boolean)
      : [];
  } catch {
    return [];
  }
};

const joinComposerPath = (targetFolder, value) => {
  const trimmedValue = String(value || "").trim();
  if (!trimmedValue) return "";

  if (trimmedValue.startsWith("/")) {
    return trimmedValue;
  }

  if (!targetFolder) {
    return trimmedValue;
  }

  const cleanedFolder = targetFolder.replace(/^\/+/, "").replace(/\/+$/, "");
  const cleanedValue = trimmedValue.replace(/^\/+/, "");
  return `${cleanedFolder}/${cleanedValue}`;
};

function ExplorerComposer({ mode, targetFolder, value, onChange, onCancel, onConfirm }) {
  const isFileMode = mode === "file";

  return (
    <div className="explorer-composer">
      <label className="explorer-composer-label">
        {isFileMode ? "Create file" : "Create folder"}
      </label>
      {targetFolder ? (
        <p className="explorer-target-copy">Inside {targetFolder}</p>
      ) : (
        <p className="explorer-target-copy">Inside workspace root</p>
      )}
      <input
        className="explorer-composer-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onConfirm();
          if (event.key === "Escape") onCancel();
        }}
        placeholder={isFileMode ? "components/Card.js" : "components/ui"}
        autoFocus
      />
      <div className="explorer-composer-actions">
        <button type="button" className="explorer-primary-btn" onClick={onConfirm}>
          Create
        </button>
        <button type="button" className="explorer-secondary-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function ExplorerTreeItem({
  node,
  depth,
  activeFile,
  collapsedFolders,
  onToggleFolder,
  onOpenFile,
  onDeleteFile,
  onCreateFileInFolder,
  onCreateFolderInFolder,
}) {
  if (node.type === "folder") {
    const isCollapsed = collapsedFolders[node.path] ?? false;

    return (
      <div className="explorer-tree-group">
        <div className="explorer-node explorer-folder-node" style={{ paddingLeft: `${12 + depth * 14}px` }}>
          <button
            type="button"
            className="explorer-folder-trigger"
            onClick={() => onToggleFolder(node.path)}
          >
            <span className="explorer-chevron">{isCollapsed ? ">" : "v"}</span>
            <span className="explorer-node-icon">DIR</span>
            <span className="explorer-node-name">{node.name}</span>
            <span className="explorer-node-meta">{node.children.length}</span>
          </button>
          <div className="explorer-node-actions">
            <button
              type="button"
              className="explorer-inline-action"
              onClick={() => onCreateFileInFolder(node.path)}
              title={`Create file in ${node.name}`}
            >
              +F
            </button>
            <button
              type="button"
              className="explorer-inline-action"
              onClick={() => onCreateFolderInFolder(node.path)}
              title={`Create folder in ${node.name}`}
            >
              +D
            </button>
          </div>
        </div>

        {!isCollapsed
          ? node.children.map((child) => (
              <ExplorerTreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                activeFile={activeFile}
                collapsedFolders={collapsedFolders}
                onToggleFolder={onToggleFolder}
                onOpenFile={onOpenFile}
                onDeleteFile={onDeleteFile}
                onCreateFileInFolder={onCreateFileInFolder}
                onCreateFolderInFolder={onCreateFolderInFolder}
              />
            ))
          : null}
      </div>
    );
  }

  return (
    <div
      className={`explorer-node explorer-file-node ${activeFile === node.path ? "active" : ""}`}
      style={{ paddingLeft: `${12 + depth * 14}px` }}
      title={node.path}
    >
      <button type="button" className="explorer-file-trigger" onClick={() => onOpenFile(node.path)}>
        <span className="explorer-chevron explorer-spacer" aria-hidden="true" />
        <span className="explorer-node-icon explorer-file-badge">{getFileIcon(node.path)}</span>
        <span className="explorer-node-name">{node.name}</span>
        <span className="explorer-node-trailing">{getLanguageLabel(node.path)}</span>
      </button>
      <button
        type="button"
        className="explorer-file-delete"
        onClick={() => onDeleteFile(node.path)}
        aria-label={`Delete ${node.name}`}
      >
        x
      </button>
    </div>
  );
}

function CodeEditor({ activeFile, files, visibleFiles, onCloseFile, onOpenFile, onRefreshPreview, onUpdateFile }) {
  const lineNumbersRef = useRef(null);
  const activeCode = activeFile ? files[activeFile] ?? "" : "";
  const lineCount = activeCode ? activeCode.split(/\r?\n/).length : 1;
  const lineNumbers = Array.from({ length: lineCount }, (_, index) => index + 1);

  const syncScroll = (event) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = event.target.scrollTop;
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const textarea = event.currentTarget;
      const { selectionStart, selectionEnd, value } = textarea;
      const nextValue = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
      onUpdateFile(activeFile, nextValue);
      window.requestAnimationFrame(() => {
        textarea.selectionStart = selectionStart + 2;
        textarea.selectionEnd = selectionStart + 2;
      });
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      onRefreshPreview();
    }
  };

  if (!activeFile) {
    return <div className="editor-empty">Create a file to start writing code.</div>;
  }

  return (
    <div className="editor-shell">
      <div className="editor-tabs">
        {visibleFiles.map((path) => (
          <div key={path} className={`editor-tab ${path === activeFile ? "active" : ""}`}>
            <button type="button" className="editor-tab-trigger" onClick={() => onOpenFile(path)}>
              <span className="editor-tab-icon">{getFileIcon(path)}</span>
              <span className="editor-tab-label">{getFileNameFromPath(path)}</span>
            </button>
            {visibleFiles.length > 1 ? (
              <button
                type="button"
                className="editor-tab-close"
                onClick={() => onCloseFile(path)}
                aria-label={`Close ${getFileNameFromPath(path)}`}
              >
                x
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="editor-pane">
        <div ref={lineNumbersRef} className="editor-gutter" aria-hidden="true">
          {lineNumbers.map((lineNumber) => (
            <div key={lineNumber} className="editor-line-number">
              {lineNumber}
            </div>
          ))}
        </div>
        <textarea
          className="editor-textarea"
          value={activeCode}
          onChange={(event) => onUpdateFile(activeFile, event.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          wrap="off"
        />
      </div>
    </div>
  );
}

function TerminalPane({
  entries,
  input,
  isReady,
  onChange,
  onClear,
  onSubmit,
}) {
  const outputRef = useRef(null);

  useEffect(() => {
    if (!outputRef.current) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [entries]);

  return (
    <div className="terminal-shell">
      <div className="terminal-topbar">
        <div className="terminal-meta">
          <span className={`terminal-pill ${isReady ? "ready" : "waiting"}`}>
            {isReady ? "Preview live" : "Preview booting"}
          </span>
          <span className="terminal-caption">Browser console + JS eval</span>
        </div>
        <button type="button" className="terminal-clear-btn" onClick={onClear}>
          Clear
        </button>
      </div>

      <div ref={outputRef} className="terminal-output">
        {entries.length === 0 ? (
          <p className="terminal-empty">Try `help`, `files`, or `window.location.href`.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className={`terminal-line kind-${entry.kind}`}>
              <span className="terminal-line-prefix">
                {entry.kind === "command" ? ">" : entry.kind === "error" ? "!" : entry.kind === "warn" ? "?" : "-"}
              </span>
              <pre className="terminal-line-text">{entry.text}</pre>
            </div>
          ))
        )}
      </div>

      <form
        className="terminal-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <span className="terminal-prompt">$</span>
        <input
          className="terminal-input"
          value={input}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Run JS in the live preview (help, files, open app.js, clear)"
        />
      </form>
    </div>
  );
}

function PreviewPane({ preview, iframeRef, onRefreshPreview, terminal }) {
  const statusLabel =
    preview.status === "running"
      ? "Rebuilding"
      : preview.status === "error"
        ? "Error"
        : preview.status === "ready"
          ? "Ready"
          : "Booting";

  return (
    <div className="preview-shell">
      <div className="preview-topbar">
        <div className="preview-topbar-meta">
          <span className={`preview-status-badge status-${preview.status}`}>{statusLabel}</span>
          <span className="preview-entry-label">{preview.entryFile || "No entry file"}</span>
        </div>
        <button type="button" className="preview-refresh-btn" onClick={onRefreshPreview}>
          Refresh
        </button>
      </div>
      <iframe
        ref={iframeRef}
        className="preview-frame"
        title="ReactForge live preview"
        srcDoc={preview.srcDoc}
        sandbox="allow-scripts allow-same-origin"
      />
      <div className="preview-caption">
        {preview.error || "Preview runs from main.js and streams console output into the terminal below."}
      </div>
      <TerminalPane {...terminal} isReady={preview.status === "ready"} />
    </div>
  );
}

export default function SandboxWorkbench({ activeLabel, codingTimer, initialFiles, workspaceId }) {
  const [panelMode, setPanelMode] = useState("explorer");
  const [composerMode, setComposerMode] = useState(null);
  const [composerValue, setComposerValue] = useState("");
  const [composerTargetFolder, setComposerTargetFolder] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState({});
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalEntries, setTerminalEntries] = useState([]);
  const iframeRef = useRef(null);
  const commandCounterRef = useRef(0);
  const folderStorageKey = useMemo(
    () => `${VIRTUAL_FOLDER_STORAGE_PREFIX}:${workspaceId}`,
    [workspaceId]
  );
  const [virtualFolders, setVirtualFolders] = useState(() => readStoredFolders(folderStorageKey));
  const {
    activeFile,
    addFile,
    closeFile,
    deleteFile,
    files,
    openFile,
    preview,
    refreshPreview,
    updateFile,
    visibleFiles,
  } = useLocalSandboxWorkspace({ initialFiles, workspaceId });

  const orderedFilePaths = useMemo(
    () =>
      Object.keys(files)
        .filter((path) => !isExplorerHiddenPath(path))
        .sort((left, right) => left.localeCompare(right)),
    [files]
  );
  const tree = useMemo(
    () => buildExplorerTree(orderedFilePaths, virtualFolders),
    [orderedFilePaths, virtualFolders]
  );
  const folderPaths = useMemo(() => collectFolderPaths(tree), [tree]);
  const folderCount = useMemo(() => countTreeFolders(tree), [tree]);
  const fileCount = useMemo(() => countTreeFiles(tree), [tree]);
  const lineCount = useMemo(
    () =>
      orderedFilePaths.reduce((total, path) => {
        const code = getFileEntryCode(files[path]);
        return total + (code ? code.split(/\r?\n/).length : 0);
      }, 0),
    [files, orderedFilePaths]
  );
  const activeBreadcrumbs = getPathSegments(activeFile || "");

  useEffect(() => {
    setPanelMode("explorer");
    setComposerMode(null);
    setComposerValue("");
    setComposerTargetFolder("");
    setCollapsedFolders({});
    setTerminalInput("");
    setTerminalEntries([
      createTerminalEntry(
        "system",
        "Live browser terminal connected. Try `help`, `files`, `open app.js`, or JavaScript like `window.location.href`."
      ),
    ]);
    setVirtualFolders(readStoredFolders(folderStorageKey));
  }, [folderStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(folderStorageKey, JSON.stringify(virtualFolders));
  }, [folderStorageKey, virtualFolders]);

  useEffect(() => {
    if (!activeFile) return;

    setCollapsedFolders((current) => {
      const next = { ...current };
      getAncestorFolders(activeFile).forEach((folderPath) => {
        delete next[folderPath];
      });
      return next;
    });
  }, [activeFile]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.source !== PREVIEW_MESSAGE_SOURCE) return;

      if (event.data.type === "console") {
        const level = event.data.level === "debug" ? "system" : event.data.level;
        const message = Array.isArray(event.data.args) ? event.data.args.join(" ") : "";
        setTerminalEntries((current) => [...current, createTerminalEntry(level, message)]);
        return;
      }

      if (event.data.type === "command-result") {
        setTerminalEntries((current) => [...current, createTerminalEntry("result", event.data.result || "undefined")]);
        return;
      }

      if (event.data.type === "command-error") {
        setTerminalEntries((current) => [...current, createTerminalEntry("error", event.data.result || "Command failed")]);
        return;
      }

      if (event.data.type === "error") {
        setTerminalEntries((current) => [...current, createTerminalEntry("error", event.data.message || "Preview error")]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const resetComposer = () => {
    setComposerMode(null);
    setComposerValue("");
    setComposerTargetFolder("");
  };

  const openComposer = (mode, targetFolder = "") => {
    setPanelMode("explorer");
    setComposerMode(mode);
    setComposerValue("");
    setComposerTargetFolder(normalizeFolderPath(targetFolder));
  };

  const handleCreate = () => {
    const rawPath = joinComposerPath(composerTargetFolder, composerValue);

    if (composerMode === "folder") {
      const folderPath = normalizeFolderPath(rawPath);
      if (!folderPath) return;

      setVirtualFolders((current) => uniquePaths([...current, folderPath]));
      setCollapsedFolders((current) => {
        const next = { ...current };
        [folderPath, ...getAncestorFolders(`${folderPath}/placeholder.js`)].forEach((path) => {
          delete next[path];
        });
        return next;
      });
      resetComposer();
      return;
    }

    if (composerMode === "file") {
      const filePath = normalizeFilePath(rawPath);
      if (!filePath) return;

      if (!files[filePath]) {
        addFile(filePath, getDefaultFileContent(filePath));
      } else {
        openFile(filePath);
      }

      setVirtualFolders((current) => uniquePaths([...current, ...getAncestorFolders(filePath)]));
      resetComposer();
    }
  };

  const collapseAllFolders = () => {
    setCollapsedFolders(Object.fromEntries(folderPaths.map((path) => [path, true])));
  };

  const clearTerminal = () => {
    setTerminalEntries([]);
  };

  const runTerminalCommand = () => {
    const command = terminalInput.trim();
    if (!command) return;

    setTerminalInput("");

    if (command === "clear") {
      setTerminalEntries([]);
      return;
    }

    setTerminalEntries((current) => [...current, createTerminalEntry("command", command)]);

    if (command === "help") {
      setTerminalEntries((current) => [
        ...current,
        createTerminalEntry(
          "result",
          [
            "Built-ins:",
            "help  - show terminal commands",
            "files - list workspace files",
            "open <path> - focus a file tab",
            "clear - clear terminal output",
            "Any other input runs as JavaScript inside the live preview iframe.",
          ].join("\n")
        ),
      ]);
      return;
    }

    if (command === "files") {
      setTerminalEntries((current) => [
        ...current,
        createTerminalEntry("result", orderedFilePaths.length > 0 ? orderedFilePaths.join("\n") : "Workspace is empty."),
      ]);
      return;
    }

    if (command.toLowerCase().startsWith("open ")) {
      const requestedPath = normalizeFilePath(command.slice(5));
      if (requestedPath && files[requestedPath]) {
        openFile(requestedPath);
        setTerminalEntries((current) => [...current, createTerminalEntry("result", `Opened ${requestedPath}`)]);
      } else {
        setTerminalEntries((current) => [...current, createTerminalEntry("error", `File not found: ${requestedPath || command.slice(5).trim()}`)]);
      }
      return;
    }

    if (!iframeRef.current?.contentWindow || preview.status !== "ready") {
      setTerminalEntries((current) => [...current, createTerminalEntry("error", "Preview is not ready yet. Wait for it to finish rebuilding.")]);
      return;
    }

    const commandId = `cmd-${Date.now()}-${commandCounterRef.current}`;
    commandCounterRef.current += 1;
    iframeRef.current.contentWindow.postMessage(
      { source: TERMINAL_MESSAGE_SOURCE, type: "eval", id: commandId, command },
      "*"
    );
  };

  const previewStatusLabel =
    preview.status === "running"
      ? "Preview rebuilding"
      : preview.status === "error"
        ? "Preview error"
        : "Preview ready";

  return (
    <div className="sandbox-shell">
      <div className="sandbox-ide-grid">
        <aside className="activity-rail">
          <div className="activity-rail-top">
            {ACTIVITY_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`activity-rail-btn ${panelMode === item.key ? "active" : ""}`}
                onClick={() => setPanelMode(item.key)}
                title={item.label}
                aria-label={item.label}
              >
                <span>{item.icon}</span>
              </button>
            ))}
          </div>
          <div className={`activity-rail-indicator ${codingTimer.isActive ? "active" : ""}`}>
            {codingTimer.isActive ? "ON" : "ID"}
          </div>
        </aside>

        <aside className="ide-sidebar">
          <div className="sidebar-panel-header">
            <div>
              <p className="sidebar-panel-kicker">
                {panelMode === "explorer" ? "Workspace" : "Coding time"}
              </p>
              <h2>{panelMode === "explorer" ? WORKSPACE_ROOT_LABEL : "Focus dashboard"}</h2>
            </div>

            {panelMode === "explorer" ? (
              <div className="sidebar-panel-actions">
                <button type="button" className="sidebar-icon-btn" onClick={() => openComposer("file")} title="Create file">
                  +F
                </button>
                <button type="button" className="sidebar-icon-btn" onClick={() => openComposer("folder")} title="Create folder">
                  +D
                </button>
                <button type="button" className="sidebar-icon-btn" onClick={collapseAllFolders} title="Collapse folders">
                  --
                </button>
              </div>
            ) : null}
          </div>

          {panelMode === "explorer" ? (
            <div className="sidebar-scroll">
              {composerMode ? (
                <ExplorerComposer
                  mode={composerMode}
                  targetFolder={composerTargetFolder}
                  value={composerValue}
                  onChange={setComposerValue}
                  onCancel={resetComposer}
                  onConfirm={handleCreate}
                />
              ) : null}

              <section className="sidebar-section">
                <div className="sidebar-section-head">
                  <span>OPEN EDITORS</span>
                  <span>{visibleFiles.length}</span>
                </div>

                {visibleFiles.length > 0 ? (
                  <div className="open-editors-list">
                    {visibleFiles.map((path) => (
                      <div key={path} className={`open-editor-row ${activeFile === path ? "active" : ""}`}>
                        <button type="button" className="open-editor-trigger" onClick={() => openFile(path)}>
                          <span className="open-editor-icon">{getFileIcon(path)}</span>
                          <span className="open-editor-name">{getFileNameFromPath(path)}</span>
                        </button>
                        {visibleFiles.length > 1 ? (
                          <button type="button" className="open-editor-close" onClick={() => closeFile(path)} aria-label={`Close ${getFileNameFromPath(path)}`}>
                            x
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="sidebar-empty-copy">Open files appear here so you can switch editors quickly.</p>
                )}
              </section>

              <section className="sidebar-section">
                <div className="sidebar-section-head">
                  <span>{WORKSPACE_ROOT_LABEL}</span>
                  <span>{fileCount}</span>
                </div>

                {tree.length > 0 ? (
                  <div className="explorer-tree">
                    {tree.map((node) => (
                      <ExplorerTreeItem
                        key={node.path}
                        node={node}
                        depth={0}
                        activeFile={activeFile}
                        collapsedFolders={collapsedFolders}
                        onToggleFolder={(folderPath) =>
                          setCollapsedFolders((current) => ({
                            ...current,
                            [folderPath]: !(current[folderPath] ?? false),
                          }))
                        }
                        onOpenFile={openFile}
                        onDeleteFile={deleteFile}
                        onCreateFileInFolder={(folderPath) => openComposer("file", folderPath)}
                        onCreateFolderInFolder={(folderPath) => openComposer("folder", folderPath)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="sidebar-empty-copy">Create a file or folder to start building.</p>
                )}
              </section>
            </div>
          ) : (
            <div className="sidebar-scroll">
              <div className="focus-cards">
                <article className="focus-card">
                  <span>Session</span>
                  <strong>{formatDuration(codingTimer.sessionMs)}</strong>
                  <p>Time in this workspace since the current run started.</p>
                </article>
                <article className="focus-card">
                  <span>Workspace total</span>
                  <strong>{formatDuration(codingTimer.workspaceMs)}</strong>
                  <p>Saved total for {activeLabel.toLowerCase()} across visits.</p>
                </article>
                <article className="focus-card">
                  <span>All sandbox time</span>
                  <strong>{formatDuration(codingTimer.totalMs)}</strong>
                  <p>Total time tracked in ReactForge.</p>
                </article>
              </div>

              <div className="focus-summary">
                <div className="focus-summary-row"><span>Status</span><strong>{codingTimer.isActive ? "Tracking" : "Idle > 45s"}</strong></div>
                <div className="focus-summary-row"><span>Workspace</span><strong>{activeLabel}</strong></div>
                <div className="focus-summary-row"><span>Files</span><strong>{fileCount}</strong></div>
                <div className="focus-summary-row"><span>Folders</span><strong>{folderCount}</strong></div>
                <div className="focus-summary-row"><span>Lines</span><strong>{lineCount}</strong></div>
              </div>

              <p className="focus-footnote">Tracking pauses when this tab is hidden, blurred, or inactive for more than 45 seconds.</p>
            </div>
          )}
        </aside>

        <div className="workbench-main">
          <div className="workspace-toolbar">
            <div className="workspace-breadcrumbs">
              <span className="workspace-breadcrumb-root">{WORKSPACE_ROOT_LABEL}</span>
              {activeBreadcrumbs.map((segment, index) => (
                <span key={`${segment}-${index}`} className="workspace-breadcrumb">
                  {segment}
                </span>
              ))}
            </div>

            <div className="workspace-toolbar-meta">
              <span className={`workspace-live-chip ${codingTimer.isActive ? "active" : ""}`}>
                {codingTimer.isActive ? "coding live" : "idle"}
              </span>
              <span className={`workspace-metric-chip preview-${preview.status}`}>{previewStatusLabel}</span>
              <span className="workspace-metric-chip">{visibleFiles.length} open</span>
              <span className="workspace-metric-chip">{formatCompactDuration(codingTimer.workspaceMs)}</span>
            </div>
          </div>

          <div className="sandbox-layout">
            <CodeEditor
              activeFile={activeFile}
              files={files}
              visibleFiles={visibleFiles}
              onCloseFile={closeFile}
              onOpenFile={openFile}
              onRefreshPreview={refreshPreview}
              onUpdateFile={updateFile}
            />
            <PreviewPane
              preview={preview}
              iframeRef={iframeRef}
              onRefreshPreview={refreshPreview}
              terminal={{
                entries: terminalEntries,
                input: terminalInput,
                onChange: setTerminalInput,
                onClear: clearTerminal,
                onSubmit: runTerminalCommand,
              }}
            />
          </div>
        </div>
      </div>

      <div className="sandbox-statusbar">
        <div className="statusbar-group">
          <span className="statusbar-item strong">ReactForge</span>
          <span className="statusbar-item">{activeLabel}</span>
          <span className="statusbar-item">{previewStatusLabel}</span>
        </div>
        <div className="statusbar-group">
          <span className="statusbar-item">{getFileNameFromPath(activeFile || preview.entryFile || "workspace")}</span>
          <span className="statusbar-item">Session {formatDuration(codingTimer.sessionMs)}</span>
          <span className="statusbar-item">Workspace {formatDuration(codingTimer.workspaceMs)}</span>
          <span className="statusbar-item">Total {formatDuration(codingTimer.totalMs)}</span>
        </div>
      </div>
    </div>
  );
}
