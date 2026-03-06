import { useEffect, useRef, useState } from "react";

const CODING_TIMER_STORAGE_KEY = "reactforge_coding_metrics";
const CODING_IDLE_THRESHOLD_MS = 45_000;

export const WORKSPACE_ROOT_LABEL = "reactforge-lab";

export const ACTIVITY_ITEMS = [
  { key: "explorer", label: "Explorer", icon: "🗂" },
  { key: "insights", label: "Focus", icon: "⏱" },
];

const FILE_ICON_BY_EXTENSION = {
  css: "#",
  html: "<>",
  js: "JS",
  jsx: "JSX",
  json: "{ }",
  md: "MD",
  ts: "TS",
  tsx: "TSX",
};

const FILE_LABEL_BY_EXTENSION = {
  css: "CSS",
  html: "HTML",
  js: "JavaScript",
  jsx: "React",
  json: "JSON",
  md: "Markdown",
  ts: "TypeScript",
  tsx: "TS React",
};

const readStoredCodingMetrics = () => {
  if (typeof window === "undefined") {
    return { totalMs: 0, workspaces: {} };
  }

  try {
    const raw = JSON.parse(localStorage.getItem(CODING_TIMER_STORAGE_KEY) || "{}");
    return {
      totalMs: Number.isFinite(raw.totalMs) ? raw.totalMs : 0,
      workspaces:
        typeof raw.workspaces === "object" && raw.workspaces
          ? Object.fromEntries(
              Object.entries(raw.workspaces).filter(([, value]) => Number.isFinite(value))
            )
          : {},
    };
  } catch {
    return { totalMs: 0, workspaces: {} };
  }
};

const writeStoredCodingMetrics = (metrics) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CODING_TIMER_STORAGE_KEY, JSON.stringify(metrics));
};

const toSafeIdentifier = (value, fallback) => {
  const alphanumeric = value.replace(/[^a-zA-Z0-9_$]/g, "");
  if (!alphanumeric) return fallback;
  return /^[a-zA-Z_$]/.test(alphanumeric) ? alphanumeric : `${fallback}${alphanumeric}`;
};

export const normalizeFilePath = (value) => {
  const normalized = value.trim().replace(/\\/g, "/").replace(/^\/+/, "");
  return normalized ? `/${normalized}` : "";
};

export const normalizeFolderPath = (value) => {
  const normalized = value
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  return normalized ? `/${normalized}` : "";
};

export const getPathSegments = (path) =>
  path.replace(/^\/+/, "").split("/").filter(Boolean);

export const getFileNameFromPath = (path) => {
  const segments = getPathSegments(path);
  return segments.length > 0 ? segments[segments.length - 1] : path;
};

const getFileExtension = (path) => {
  const fileName = getFileNameFromPath(path);
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex + 1).toLowerCase() : "";
};

export const getFileEntryCode = (entry) =>
  typeof entry === "string" ? entry : entry?.code ?? "";

export const getAncestorFolders = (path) => {
  const segments = getPathSegments(path).slice(0, -1);
  const folders = [];
  let currentPath = "";

  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    folders.push(currentPath);
  });

  return folders;
};

export const uniquePaths = (paths) => [...new Set(paths)];

export const formatDuration = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
  }

  return [minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
};

export const formatCompactDuration = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

export const getFileIcon = (path) => FILE_ICON_BY_EXTENSION[getFileExtension(path)] || "•";
export const getLanguageLabel = (path) => FILE_LABEL_BY_EXTENSION[getFileExtension(path)] || "Text";

export const getDefaultFileContent = (path) => {
  const extension = getFileExtension(path);

  if (extension === "css") {
    return "/* Add styles here */\n";
  }

  if (extension === "json") {
    return "{\n  \n}\n";
  }

  if (extension === "md") {
    return "# Notes\n";
  }

  if (extension === "html") {
    return "<div></div>\n";
  }

  if (extension === "jsx" || extension === "tsx") {
    const componentName = toSafeIdentifier(
      getFileNameFromPath(path).replace(/\.[^.]+$/, ""),
      "Component"
    );

    return `export default function ${componentName}() {\n  return <div />\n}\n`;
  }

  const exportName = toSafeIdentifier(
    getFileNameFromPath(path).replace(/\.[^.]+$/, ""),
    "value"
  );

  return `export const ${exportName} = "";\n`;
};

export const isExplorerHiddenPath = (path) =>
  path.includes("/node_modules/") ||
  path.startsWith("/.sandpack") ||
  path.startsWith("/.codesandbox");

export const buildExplorerTree = (filePaths, virtualFolders = []) => {
  const root = [];

  const ensureFolder = (segments) => {
    let level = root;
    let currentPath = "";
    let currentNode = null;

    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      let nextNode = level.find((node) => node.type === "folder" && node.path === currentPath);

      if (!nextNode) {
        nextNode = {
          type: "folder",
          name: segment,
          path: currentPath,
          children: [],
        };
        level.push(nextNode);
      }

      currentNode = nextNode;
      level = nextNode.children;
    });

    return currentNode;
  };

  virtualFolders.forEach((folderPath) => {
    ensureFolder(getPathSegments(folderPath));
  });

  filePaths.forEach((filePath) => {
    const segments = getPathSegments(filePath);
    const fileName = segments.pop();

    if (!fileName) return;

    const parentFolder = ensureFolder(segments);
    const target = parentFolder ? parentFolder.children : root;

    target.push({
      type: "file",
      name: fileName,
      path: filePath,
    });
  });

  const sortNodes = (nodes) => {
    nodes.sort((left, right) => {
      if (left.type !== right.type) {
        return left.type === "folder" ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    });

    nodes.forEach((node) => {
      if (node.type === "folder") {
        sortNodes(node.children);
      }
    });

    return nodes;
  };

  return sortNodes(root);
};

export const countTreeFolders = (nodes) =>
  nodes.reduce(
    (total, node) => total + (node.type === "folder" ? 1 + countTreeFolders(node.children) : 0),
    0
  );

export const countTreeFiles = (nodes) =>
  nodes.reduce(
    (total, node) => total + (node.type === "file" ? 1 : countTreeFiles(node.children)),
    0
  );

export const collectFolderPaths = (nodes) =>
  nodes.flatMap((node) =>
    node.type === "folder" ? [node.path, ...collectFolderPaths(node.children)] : []
  );

export function useCodingTimer(workspaceId) {
  const [timer, setTimer] = useState(() => {
    const stored = readStoredCodingMetrics();
    return {
      sessionMs: 0,
      totalMs: stored.totalMs,
      workspaceMs: stored.workspaces[workspaceId] ?? 0,
      isActive: true,
    };
  });

  const metricsRef = useRef(readStoredCodingMetrics());
  const lastActivityRef = useRef(Date.now());
  const canTrackRef = useRef(true);

  useEffect(() => {
    const stored = readStoredCodingMetrics();
    metricsRef.current = stored;
    lastActivityRef.current = Date.now();
    canTrackRef.current =
      typeof document === "undefined"
        ? true
        : document.visibilityState === "visible" && document.hasFocus();

    setTimer({
      sessionMs: 0,
      totalMs: stored.totalMs,
      workspaceMs: stored.workspaces[workspaceId] ?? 0,
      isActive: canTrackRef.current,
    });
  }, [workspaceId]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const syncTrackingState = () => {
      canTrackRef.current = document.visibilityState === "visible" && document.hasFocus();

      if (canTrackRef.current) {
        markActivity();
      }

      setTimer((current) =>
        current.isActive === canTrackRef.current
          ? current
          : { ...current, isActive: canTrackRef.current }
      );
    };

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const isActive =
        canTrackRef.current && now - lastActivityRef.current < CODING_IDLE_THRESHOLD_MS;

      setTimer((current) => {
        if (!isActive) {
          return current.isActive ? { ...current, isActive: false } : current;
        }

        const nextMetrics = {
          totalMs: metricsRef.current.totalMs + 1000,
          workspaces: {
            ...metricsRef.current.workspaces,
            [workspaceId]: (metricsRef.current.workspaces[workspaceId] ?? 0) + 1000,
          },
        };

        metricsRef.current = nextMetrics;
        writeStoredCodingMetrics(nextMetrics);

        return {
          sessionMs: current.sessionMs + 1000,
          totalMs: nextMetrics.totalMs,
          workspaceMs: nextMetrics.workspaces[workspaceId],
          isActive: true,
        };
      });
    }, 1000);

    markActivity();
    window.addEventListener("focus", syncTrackingState);
    window.addEventListener("blur", syncTrackingState);
    document.addEventListener("visibilitychange", syncTrackingState);
    window.addEventListener("keydown", markActivity);
    window.addEventListener("pointerdown", markActivity);
    window.addEventListener("mousemove", markActivity);
    window.addEventListener("touchstart", markActivity);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", syncTrackingState);
      window.removeEventListener("blur", syncTrackingState);
      document.removeEventListener("visibilitychange", syncTrackingState);
      window.removeEventListener("keydown", markActivity);
      window.removeEventListener("pointerdown", markActivity);
      window.removeEventListener("mousemove", markActivity);
      window.removeEventListener("touchstart", markActivity);
    };
  }, [workspaceId]);

  return timer;
}
