import { useEffect, useMemo, useState } from "react";
import { getFileEntryCode, normalizeFilePath } from "./sandboxWorkbenchUtils.js";

export const PREVIEW_MESSAGE_SOURCE = "reactforge-preview";
export const TERMINAL_MESSAGE_SOURCE = "reactforge-terminal";

const WORKSPACE_STORAGE_PREFIX = "reactforge_local_workspace";
const DEFAULT_ACTIVE_FILE = "/app.js";
const DEFAULT_VISIBLE_FILES = ["/main.js", "/app.js", "/global.css", "/app.css"];
const MODULE_EXTENSIONS = [".jsx", ".js", ".tsx", ".ts"];
const PREVIEW_IMPORTS = {
  react: "https://esm.sh/react@19.2.0?dev",
  "react-dom/client": "https://esm.sh/react-dom@19.2.0/client?dev",
  "react/jsx-runtime": "https://esm.sh/react@19.2.0/jsx-runtime?dev",
  "react/jsx-dev-runtime": "https://esm.sh/react@19.2.0/jsx-dev-runtime?dev",
};
const PREVIEW_BABEL_URL = "https://unpkg.com/@babel/standalone/babel.min.js";

const normalizeWorkspaceFiles = (files) =>
  Object.fromEntries(
    Object.entries(files).map(([path, entry]) => [normalizeFilePath(path), getFileEntryCode(entry)])
  );

const uniqueVisibleFiles = (paths, files) =>
  [...new Set(paths)].filter((path) => Object.prototype.hasOwnProperty.call(files, path));

const hasModuleExtension = (path) => MODULE_EXTENSIONS.some((extension) => path.endsWith(extension));

const hashWorkspaceSeed = (files) => {
  const input = JSON.stringify(files);
  let hash = 5381;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
};

const getWorkspaceStorageKey = (workspaceId, files) =>
  `${WORKSPACE_STORAGE_PREFIX}:${workspaceId}:${hashWorkspaceSeed(files)}`;

const readStoredWorkspace = (storageKey) => {
  if (typeof window === "undefined") return null;

  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (!raw || typeof raw !== "object") return null;

    const files = normalizeWorkspaceFiles(raw.files || {});
    if (Object.keys(files).length === 0) return null;

    return {
      files,
      activeFile: typeof raw.activeFile === "string" ? normalizeFilePath(raw.activeFile) : "",
      visibleFiles: Array.isArray(raw.visibleFiles)
        ? raw.visibleFiles.map((path) => normalizeFilePath(String(path || ""))).filter(Boolean)
        : [],
    };
  } catch {
    return null;
  }
};

const findMatchingFile = (files, inputPath) => {
  if (!inputPath) return null;

  const normalizedPath = normalizeFilePath(inputPath);
  const candidates = [normalizedPath];

  if (!/\.[a-z0-9]+$/i.test(normalizedPath)) {
    MODULE_EXTENSIONS.forEach((extension) => {
      candidates.push(`${normalizedPath}${extension}`);
      candidates.push(`${normalizedPath}/index${extension}`);
    });
  }

  return candidates.find((candidate) => Object.prototype.hasOwnProperty.call(files, candidate)) || null;
};

export const findPreviewEntryFile = (files, preferredFile) => {
  const preferredCandidate = findMatchingFile(files, preferredFile);
  if (preferredCandidate && hasModuleExtension(preferredCandidate)) {
    return preferredCandidate;
  }

  const fallbacks = ["/main.jsx", "/main.js", "/app.jsx", "/app.js", "/App.jsx", "/App.js"];
  for (const candidate of fallbacks) {
    const filePath = findMatchingFile(files, candidate);
    if (filePath) return filePath;
  }

  return Object.keys(files).find((path) => hasModuleExtension(path)) || null;
};

const buildInitialWorkspace = ({
  initialFiles,
  initialActiveFile,
  initialVisibleFiles,
  storageKey,
}) => {
  const storedWorkspace = readStoredWorkspace(storageKey);
  const files = storedWorkspace?.files || initialFiles;
  const activeFile =
    findMatchingFile(files, storedWorkspace?.activeFile) ||
    findMatchingFile(files, initialActiveFile) ||
    findPreviewEntryFile(files, initialActiveFile) ||
    Object.keys(files)[0] ||
    DEFAULT_ACTIVE_FILE;

  const visibleFiles = uniqueVisibleFiles(
    [
      ...(storedWorkspace?.visibleFiles || []).map((path) => findMatchingFile(files, path)),
      ...initialVisibleFiles.map((path) => findMatchingFile(files, path)),
      activeFile,
    ].filter(Boolean),
    files
  );

  return {
    files,
    activeFile,
    visibleFiles: visibleFiles.length > 0 ? visibleFiles : [activeFile],
  };
};

const serializeForInlineScript = (value) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

export const createPreviewDocument = (files, entryFile, refreshNonce) => {
  const serializedFiles = serializeForInlineScript(files);
  const serializedImports = serializeForInlineScript(PREVIEW_IMPORTS);
  const serializedEntry = serializeForInlineScript(entryFile || "");
  const serializedExtensions = serializeForInlineScript(MODULE_EXTENSIONS);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ReactForge Preview</title>
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        background: #0b1020;
        color: #e2e8f0;
        font-family: Inter, system-ui, sans-serif;
      }
      #root { min-height: 100vh; }
      #preview-error {
        position: fixed;
        inset: 0;
        display: none;
        padding: 24px;
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.98));
        overflow: auto;
      }
      .preview-error-card {
        max-width: 980px;
        margin: 0 auto;
        border: 1px solid rgba(248, 113, 113, 0.35);
        border-radius: 18px;
        background: rgba(15, 23, 42, 0.88);
        padding: 22px;
        box-shadow: 0 20px 50px rgba(2, 6, 23, 0.55);
      }
      .preview-error-card h1 {
        margin: 0 0 10px;
        font-size: 18px;
        color: #fca5a5;
      }
      .preview-error-card p {
        margin: 0 0 14px;
        color: #cbd5e1;
        line-height: 1.5;
      }
      .preview-error-card pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        padding: 14px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.98);
        color: #f8fafc;
        font-size: 13px;
        line-height: 1.6;
      }
    </style>
    <style id="preview-styles"></style>
  </head>
  <body data-refresh="${refreshNonce}">
    <div id="root"></div>
    <div id="preview-error"></div>
    <script src="${PREVIEW_BABEL_URL}"></script>
    <script type="module">
      const files = ${serializedFiles};
      const externalImports = ${serializedImports};
      const preferredEntry = ${serializedEntry};
      const rootElement = document.getElementById("root");
      const errorElement = document.getElementById("preview-error");
      const styleElement = document.getElementById("preview-styles");
      const moduleUrlCache = new Map();
      const buildingModules = new Set();
      const moduleExtensions = ${serializedExtensions};

      const postPreviewMessage = (type, payload = {}) => {
        window.parent.postMessage({ source: "${PREVIEW_MESSAGE_SOURCE}", type, ...payload }, "*");
      };

      const normalizePath = (path) => {
        if (!path) return "/";
        const parts = path.replace(/\\/g, "/").split("/");
        const normalized = [];

        for (const part of parts) {
          if (!part || part === ".") continue;
          if (part === "..") {
            normalized.pop();
            continue;
          }
          normalized.push(part);
        }

        return "/" + normalized.join("/");
      };

      const resolveRelativePath = (specifier, importer) => {
        const importerSegments = normalizePath(importer).split("/").slice(0, -1);
        const specifierSegments = specifier.split("/");
        return normalizePath(importerSegments.concat(specifierSegments).join("/"));
      };

      const findModulePath = (inputPath) => {
        if (!inputPath) return null;
        const normalizedPath = normalizePath(inputPath);
        const candidates = [normalizedPath];

        if (!/\.[a-z0-9]+$/i.test(normalizedPath)) {
          moduleExtensions.forEach((extension) => {
            candidates.push(normalizedPath + extension);
            candidates.push(normalizedPath + "/index" + extension);
          });
        }

        return candidates.find((candidate) => Object.prototype.hasOwnProperty.call(files, candidate)) || null;
      };

      const escapeRegExp = (value) => value.replace(/[.*+?^$()|[\]\\]/g, "\\$&");

      const replaceSpecifier = (source, specifier, replacement) => {
        const escapedSpecifier = escapeRegExp(specifier);
        return source
          .replace(new RegExp("(from\\s+[\"'])" + escapedSpecifier + "([\"'])", "g"), "$1" + replacement + "$2")
          .replace(new RegExp("(import\\s+[\"'])" + escapedSpecifier + "([\"'])", "g"), "$1" + replacement + "$2")
          .replace(new RegExp("(import\\(\\s*[\"'])" + escapedSpecifier + "([\"']\\s*\\))", "g"), "$1" + replacement + "$2");
      };

      const stripCssImports = (source) =>
        source
          .replace(/^\s*import\s+["'][^"']+\.css["'];?\s*$/gm, "")
          .replace(/^\s*import\s+[^"']+\s+from\s+["'][^"']+\.css["'];?\s*$/gm, "");

      const scanDependencies = (source) => {
        const dependencies = new Set();
        const patterns = [
          /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
          /import\(\s*["']([^"']+)["']\s*\)/g,
        ];

        patterns.forEach((pattern) => {
          let match;
          while ((match = pattern.exec(source))) {
            if (match[1]) {
              dependencies.add(match[1]);
            }
          }
        });

        return [...dependencies];
      };

      const safeStringify = (value) => {
        const seen = new WeakSet();
        return JSON.stringify(
          value,
          (key, nextValue) => {
            if (typeof nextValue === "function") {
              return "[Function " + (nextValue.name || "anonymous") + "]";
            }

            if (typeof nextValue === "object" && nextValue !== null) {
              if (seen.has(nextValue)) {
                return "[Circular]";
              }
              seen.add(nextValue);
            }

            return nextValue;
          },
          2
        );
      };

      const formatValue = (value) => {
        if (value instanceof Error) {
          return value.stack || value.message;
        }

        if (typeof value === "string") return value;
        if (typeof value === "undefined") return "undefined";

        try {
          return safeStringify(value);
        } catch {
          return String(value);
        }
      };

      const getCssPriority = (path) => {
        if (path.endsWith("/global.css")) return 0;
        if (path.endsWith("/app.css")) return 1;
        return 2;
      };

      const buildStyleText = () =>
        Object.keys(files)
          .filter((path) => path.endsWith(".css"))
          .sort((left, right) => {
            const priorityDifference = getCssPriority(left) - getCssPriority(right);
            return priorityDifference !== 0 ? priorityDifference : left.localeCompare(right);
          })
          .map((path) => "/* " + path + " */\\n" + files[path])
          .join("\\n\\n");

      const clearError = () => {
        errorElement.style.display = "none";
        errorElement.replaceChildren();
      };

      const renderError = (message, detail = "") => {
        rootElement.innerHTML = "";
        errorElement.style.display = "block";

        const card = document.createElement("div");
        card.className = "preview-error-card";

        const title = document.createElement("h1");
        title.textContent = "Preview Error";

        const summary = document.createElement("p");
        summary.textContent = message;

        const stack = document.createElement("pre");
        stack.textContent = detail || message;

        card.append(title, summary, stack);
        errorElement.replaceChildren(card);
        postPreviewMessage("error", { message: detail || message });
      };

      const resolveExternalImport = (specifier) => {
        if (externalImports[specifier]) return externalImports[specifier];
        if (/^(https?:)?\/\//.test(specifier)) return specifier;
        return "https://esm.sh/" + specifier + "?dev";
      };

      const attachConsoleBridge = () => {
        ["log", "info", "warn", "error", "debug"].forEach((level) => {
          const original = console[level]?.bind(console);
          if (!original) return;

          console[level] = (...args) => {
            original(...args);
            postPreviewMessage("console", {
              level,
              args: args.map((value) => formatValue(value)),
            });
          };
        });
      };

      attachConsoleBridge();
      window.__reactforge = { files, rootElement, importMap: externalImports };

      window.addEventListener("error", (event) => {
        renderError(event.message || "Runtime error", event.error?.stack || event.message || "Unknown runtime error");
      });

      window.addEventListener("unhandledrejection", (event) => {
        const reason = event.reason;
        renderError("Unhandled promise rejection", reason?.stack || String(reason || "Unknown rejection"));
      });

      window.addEventListener("message", async (event) => {
        const data = event.data;
        if (data?.source !== "${TERMINAL_MESSAGE_SOURCE}" || data.type !== "eval") return;

        try {
          const result = await Promise.resolve((0, eval)(data.command));
          postPreviewMessage("command-result", { id: data.id, result: formatValue(result) });
        } catch (error) {
          postPreviewMessage("command-error", { id: data.id, result: formatValue(error) });
        }
      });

      const ensureModule = async (filePath) => {
        if (moduleUrlCache.has(filePath)) {
          return moduleUrlCache.get(filePath);
        }

        if (buildingModules.has(filePath)) {
          throw new Error("Circular dependency detected around " + filePath);
        }

        const fileSource = files[filePath];
        if (typeof fileSource !== "string") {
          throw new Error("Missing source for " + filePath);
        }

        buildingModules.add(filePath);

        try {
          let source = stripCssImports(fileSource);
          const dependencies = scanDependencies(source);

          for (const specifier of dependencies) {
            if (specifier.endsWith(".css")) {
              continue;
            }

            let replacement = specifier;
            if (specifier.startsWith(".")) {
              const resolvedPath = findModulePath(resolveRelativePath(specifier, filePath));
              if (!resolvedPath) {
                throw new Error('Cannot resolve "' + specifier + '" from ' + filePath);
              }
              replacement = await ensureModule(resolvedPath);
            } else {
              replacement = resolveExternalImport(specifier);
            }

            source = replaceSpecifier(source, specifier, replacement);
          }

          const presets = [
            filePath.endsWith(".ts") || filePath.endsWith(".tsx") ? "typescript" : null,
            ["react", { runtime: "automatic" }],
          ].filter(Boolean);

          let transformed = Babel.transform(source, {
            filename: filePath,
            presets,
            sourceType: "module",
          }).code;

          Object.entries(externalImports).forEach(([specifier, replacement]) => {
            transformed = replaceSpecifier(transformed, specifier, replacement);
          });

          const url = URL.createObjectURL(new Blob([transformed], { type: "text/javascript" }));
          moduleUrlCache.set(filePath, url);
          return url;
        } finally {
          buildingModules.delete(filePath);
        }
      };

      const boot = async () => {
        try {
          styleElement.textContent = buildStyleText();
          const entryPath =
            findModulePath(preferredEntry) ||
            findModulePath("/main.js") ||
            findModulePath("/main.jsx") ||
            findModulePath("/app.js") ||
            findModulePath("/app.jsx");

          if (!entryPath) {
            throw new Error("No entry module found. Create /main.js or /main.jsx.");
          }

          const entryUrl = await ensureModule(entryPath);
          const entryModule = await import(entryUrl);
          const ReactModule = await import(externalImports.react);
          const ReactDomClient = await import(externalImports["react-dom/client"]);
          const exported =
            entryModule.default ||
            entryModule.App ||
            Object.values(entryModule).find((value) => typeof value === "function" || (value && typeof value === "object" && value.$$typeof));

          if (exported) {
            const root = ReactDomClient.createRoot(rootElement);
            const renderedNode = typeof exported === "function"
              ? ReactModule.createElement(exported)
              : exported;
            root.render(renderedNode);
          }

          clearError();
          postPreviewMessage("ready", { entryFile: entryPath });
        } catch (error) {
          renderError(error.message || "Preview failed to start", error.stack || String(error));
        }
      };

      boot();
    </script>
  </body>
</html>`;
};

export function useLocalSandboxWorkspace({
  initialFiles,
  workspaceId,
  initialActiveFile = DEFAULT_ACTIVE_FILE,
  initialVisibleFiles = DEFAULT_VISIBLE_FILES,
}) {
  const normalizedInitialFiles = useMemo(
    () => normalizeWorkspaceFiles(initialFiles),
    [initialFiles]
  );
  const storageKey = useMemo(
    () => getWorkspaceStorageKey(workspaceId, normalizedInitialFiles),
    [workspaceId, normalizedInitialFiles]
  );

  const createInitialState = () =>
    buildInitialWorkspace({
      initialFiles: normalizedInitialFiles,
      initialActiveFile,
      initialVisibleFiles,
      storageKey,
    });

  const [workspace, setWorkspace] = useState(createInitialState);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [previewStatus, setPreviewStatus] = useState("initial");
  const [previewError, setPreviewError] = useState("");
  const previewEntryFile = useMemo(
    () => findPreviewEntryFile(workspace.files, workspace.activeFile),
    [workspace.activeFile, workspace.files]
  );
  const previewSrcDoc = useMemo(
    () => createPreviewDocument(workspace.files, previewEntryFile, previewNonce),
    [previewEntryFile, previewNonce, workspace.files]
  );

  useEffect(() => {
    setWorkspace(createInitialState());
    setPreviewNonce(0);
    setPreviewStatus("initial");
    setPreviewError("");
  }, [storageKey, initialActiveFile, initialVisibleFiles]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, JSON.stringify(workspace));
  }, [storageKey, workspace]);

  useEffect(() => {
    setPreviewStatus("running");
    setPreviewError("");
  }, [previewSrcDoc]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.source !== PREVIEW_MESSAGE_SOURCE) return;

      if (event.data.type === "ready") {
        setPreviewStatus("ready");
        setPreviewError("");
        return;
      }

      if (event.data.type === "error") {
        setPreviewStatus("error");
        setPreviewError(event.data.message || "Preview error");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const openFile = (path) => {
    setWorkspace((current) => ({
      ...current,
      activeFile: path,
      visibleFiles: uniqueVisibleFiles([...current.visibleFiles, path], current.files),
    }));
  };

  const closeFile = (path) => {
    setWorkspace((current) => {
      if (current.visibleFiles.length === 1) {
        return current;
      }

      const nextVisibleFiles = current.visibleFiles.filter((openPath) => openPath !== path);
      const nextActiveFile =
        path === current.activeFile ? nextVisibleFiles[nextVisibleFiles.length - 1] : current.activeFile;

      return {
        ...current,
        activeFile: nextActiveFile,
        visibleFiles: nextVisibleFiles,
      };
    });
  };

  const updateFile = (path, code) => {
    setWorkspace((current) => ({
      ...current,
      files: {
        ...current.files,
        [path]: code,
      },
    }));
  };

  const addFile = (path, code = "") => {
    setWorkspace((current) => {
      const files = {
        ...current.files,
        [path]: code,
      };

      return {
        files,
        activeFile: path,
        visibleFiles: uniqueVisibleFiles([...current.visibleFiles, path], files),
      };
    });
  };

  const deleteFile = (path) => {
    setWorkspace((current) => {
      const entries = Object.entries(current.files);
      if (entries.length <= 1 || !Object.prototype.hasOwnProperty.call(current.files, path)) {
        return current;
      }

      const files = Object.fromEntries(entries.filter(([filePath]) => filePath !== path));
      const nextVisibleFiles = uniqueVisibleFiles(
        current.visibleFiles.filter((openPath) => openPath !== path),
        files
      );
      const fallbackActiveFile =
        nextVisibleFiles[0] || findPreviewEntryFile(files, current.activeFile) || Object.keys(files)[0];

      return {
        files,
        activeFile: path === current.activeFile ? fallbackActiveFile : current.activeFile,
        visibleFiles: nextVisibleFiles.length > 0 ? nextVisibleFiles : [fallbackActiveFile],
      };
    });
  };

  return {
    files: workspace.files,
    activeFile: workspace.activeFile,
    visibleFiles: workspace.visibleFiles,
    preview: {
      entryFile: previewEntryFile,
      error: previewError,
      srcDoc: previewSrcDoc,
      status: previewStatus,
    },
    addFile,
    closeFile,
    deleteFile,
    openFile,
    refreshPreview: () => setPreviewNonce((current) => current + 1),
    updateFile,
  };
}


