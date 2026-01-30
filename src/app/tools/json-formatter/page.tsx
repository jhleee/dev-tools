"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Brackets,
  Upload,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Download,
  Minimize2,
  Maximize2,
  SortAsc,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Badge,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import * as yaml from "js-yaml";

// ============================================================
// Types
// ============================================================

interface ValidationError {
  message: string;
  line?: number;
  column?: number;
}

type IndentOption = 2 | 4 | "tab";
type ViewMode = "text" | "tree" | "yaml";

interface TreeNodeProps {
  keyName: string | number | null;
  value: unknown;
  level: number;
  path: string;
  defaultExpanded?: boolean;
}

// ============================================================
// Utility Functions
// ============================================================

function sortObjectKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  for (const key of keys) {
    sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
  }
  return sorted;
}

function getErrorPosition(
  errorMessage: string,
  input: string
): { line: number; column: number } | null {
  // Chrome/Edge: "Unexpected token } in JSON at position 45"
  // Firefox: "JSON.parse: expected ',' or '}' after property value at line 3 column 5"
  const posMatch = errorMessage.match(/position\s+(\d+)/i);
  if (posMatch) {
    const position = parseInt(posMatch[1], 10);
    const lines = input.slice(0, position).split("\n");
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
  }

  const lineColMatch = errorMessage.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch) {
    return {
      line: parseInt(lineColMatch[1], 10),
      column: parseInt(lineColMatch[2], 10),
    };
  }

  return null;
}

function getValueType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function getValueDisplay(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

// ============================================================
// TreeNode Component
// ============================================================

function TreeNode({
  keyName,
  value,
  level,
  path,
  defaultExpanded = true,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded && level < 3);
  const [copied, setCopied] = useState(false);

  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const entries = isObject
    ? isArray
      ? value.map((v, i) => [i, v] as [number, unknown])
      : (Object.entries(value as Record<string, unknown>) as [
          string,
          unknown
        ][])
    : [];

  const copyPath = useCallback(() => {
    navigator.clipboard.writeText(path || "$");
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }, [path]);

  const valueType = getValueType(value);

  const typeColors: Record<string, string> = {
    string: "text-brutal-success",
    number: "text-brutal-accent",
    boolean: "text-brutal-warning",
    null: "text-brutal-text-muted",
    object: "text-brutal-secondary",
    array: "text-brutal-secondary",
  };

  // Primitive value
  if (!isObject) {
    return (
      <div
        className="flex items-center gap-2 py-0.5 hover:bg-brutal-bg-alt group"
        style={{ paddingLeft: level * 16 }}
      >
        {keyName !== null && (
          <span className="font-mono text-xs text-brutal-primary font-bold">
            {typeof keyName === "string" ? `"${keyName}"` : keyName}:
          </span>
        )}
        <span className={cn("font-mono text-xs", typeColors[valueType])}>
          {getValueDisplay(value)}
        </span>
        <button
          onClick={copyPath}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-brutal-accent transition-all"
          title={`Copy path: ${path}`}
        >
          {copied ? (
            <Check className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      </div>
    );
  }

  // Object/Array
  return (
    <div>
      <div
        className="flex items-center gap-1 py-0.5 hover:bg-brutal-bg-alt cursor-pointer group"
        style={{ paddingLeft: level * 16 }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="w-4 h-4 flex items-center justify-center">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </span>
        {keyName !== null && (
          <span className="font-mono text-xs text-brutal-primary font-bold">
            {typeof keyName === "string" ? `"${keyName}"` : keyName}:
          </span>
        )}
        <span className="font-mono text-xs text-brutal-text-muted">
          {isArray ? `Array(${entries.length})` : `Object(${entries.length})`}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyPath();
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-brutal-accent transition-all"
          title={`Copy path: ${path}`}
        >
          {copied ? (
            <Check className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      </div>
      {isExpanded &&
        entries.map(([k, v]) => {
          const newPath = isArray ? `${path}[${k}]` : `${path}.${k}`;
          return (
            <TreeNode
              key={String(k)}
              keyName={k}
              value={v}
              level={level + 1}
              path={newPath}
              defaultExpanded={level < 2}
            />
          );
        })}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function JsonFormatterPage() {
  // Input/Output state
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  // Processing state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ValidationError | null>(null);

  // Settings state
  const [indent, setIndent] = useState<IndentOption>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("text");

  // UI state
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Parse JSON for tree view
  const parsedJson = useMemo(() => {
    if (!output) return null;
    try {
      return JSON.parse(output);
    } catch {
      return null;
    }
  }, [output]);

  // ============================================================
  // Handlers
  // ============================================================

  const validateAndParse = useCallback(
    (text: string): unknown | null => {
      try {
        const parsed = JSON.parse(text);
        setError(null);
        return parsed;
      } catch (e) {
        if (e instanceof SyntaxError) {
          const position = getErrorPosition(e.message, text);
          setError({
            message: e.message,
            line: position?.line,
            column: position?.column,
          });
        } else {
          setError({ message: "Invalid JSON" });
        }
        return null;
      }
    },
    []
  );

  const formatJson = useCallback(() => {
    if (!input.trim()) {
      setError({ message: "Please enter JSON to format" });
      return;
    }

    setIsLoading(true);

    try {
      const parsed = validateAndParse(input);
      if (parsed === null) {
        setIsLoading(false);
        return;
      }

      const processed = sortKeys ? sortObjectKeys(parsed) : parsed;
      const indentStr = indent === "tab" ? "\t" : indent;
      const formatted = JSON.stringify(processed, null, indentStr);

      setOutput(formatted);
      setViewMode("text");
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, [input, indent, sortKeys, validateAndParse]);

  const minifyJson = useCallback(() => {
    if (!input.trim()) {
      setError({ message: "Please enter JSON to minify" });
      return;
    }

    setIsLoading(true);

    try {
      const parsed = validateAndParse(input);
      if (parsed === null) {
        setIsLoading(false);
        return;
      }

      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setViewMode("text");
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, [input, validateAndParse]);

  const convertToYaml = useCallback(() => {
    if (!input.trim()) {
      setError({ message: "Please enter JSON to convert" });
      return;
    }

    setIsLoading(true);

    try {
      const parsed = validateAndParse(input);
      if (parsed === null) {
        setIsLoading(false);
        return;
      }

      const yamlStr = yaml.dump(parsed, {
        indent: indent === "tab" ? 2 : indent,
        lineWidth: -1,
        noRefs: true,
      });
      setOutput(yamlStr);
      setViewMode("yaml");
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, [input, indent, validateAndParse]);

  const convertYamlToJson = useCallback(() => {
    if (!input.trim()) {
      setError({ message: "Please enter YAML to convert" });
      return;
    }

    setIsLoading(true);

    try {
      const parsed = yaml.load(input);
      const indentStr = indent === "tab" ? "\t" : indent;
      const jsonStr = JSON.stringify(parsed, null, indentStr);
      setOutput(jsonStr);
      setInput(jsonStr);
      setViewMode("text");
      setError(null);
    } catch (e) {
      if (e instanceof yaml.YAMLException) {
        setError({
          message: e.message,
          line: e.mark?.line ? e.mark.line + 1 : undefined,
          column: e.mark?.column ? e.mark.column + 1 : undefined,
        });
      } else {
        setError({ message: "Invalid YAML" });
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, indent]);

  const showTreeView = useCallback(() => {
    if (!input.trim()) {
      setError({ message: "Please enter JSON to view" });
      return;
    }

    const parsed = validateAndParse(input);
    if (parsed === null) return;

    // Ensure output is set for tree view
    const indentStr = indent === "tab" ? "\t" : indent;
    setOutput(JSON.stringify(parsed, null, indentStr));
    setViewMode("tree");
  }, [input, indent, validateAndParse]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError({ message: "File size must be less than 5MB" });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInput(content);
        setOutput("");
        setError(null);
      };
      reader.onerror = () => {
        setError({ message: "Failed to read file" });
      };
      reader.readAsText(file);

      // Reset file input
      e.target.value = "";
    },
    []
  );

  const copyOutput = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const downloadOutput = useCallback(() => {
    if (!output) return;

    const isYaml = viewMode === "yaml";
    const mimeType = isYaml ? "text/yaml" : "application/json";
    const extension = isYaml ? "yaml" : "json";

    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output, viewMode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Only intercept Ctrl+Enter for format action
      // Let all other keyboard shortcuts pass through (Ctrl+A, Ctrl+C, etc.)
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        formatJson();
      }
    },
    [formatJson]
  );

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-brutal-secondary border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Brackets className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black uppercase tracking-tight">
              JSON Formatter
            </h1>
            <div className="h-1 w-24 bg-brutal-secondary mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-4 font-medium">
          JSON prettify, minify, tree view, YAML 변환 및 유효성 검사
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "flex items-center gap-2 text-sm font-bold uppercase tracking-wide",
              "px-4 py-2 border-[2px] border-black bg-white",
              "transition-all duration-100",
              showSettings
                ? "shadow-[2px_2px_0px_0px_#000000] bg-brutal-bg-alt"
                : "hover:shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5"
            )}
          >
            <SortAsc className="w-4 h-4" />
            Format Settings
            {showSettings ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {/* Settings Panel */}
          {showSettings && (
            <Card>
              <CardContent className="p-4 space-y-4">
                {/* Indentation */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-black mb-2">
                    Indentation
                  </label>
                  <div className="flex gap-2">
                    {(
                      [
                        { value: 2, label: "2 Spaces" },
                        { value: 4, label: "4 Spaces" },
                        { value: "tab", label: "Tab" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setIndent(opt.value)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-bold uppercase border-[2px] border-black transition-all",
                          indent === opt.value
                            ? "bg-brutal-accent shadow-[2px_2px_0px_0px_#000000]"
                            : "bg-white hover:bg-brutal-bg-alt"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Keys */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-black mb-2">
                    Sort Keys
                  </label>
                  <button
                    onClick={() => setSortKeys(!sortKeys)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold uppercase border-[2px] border-black transition-all",
                      sortKeys
                        ? "bg-brutal-success shadow-[2px_2px_0px_0px_#000000]"
                        : "bg-white hover:bg-brutal-bg-alt"
                    )}
                  >
                    {sortKeys ? "Enabled" : "Disabled"}
                  </button>
                  <p className="text-xs text-brutal-text-muted mt-1">
                    Sort object keys alphabetically
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Input Card */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Input JSON / YAML</CardTitle>
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                      Upload
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json,.yaml,.yml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='{"key": "value"}'
                className="min-h-[280px] border-0 shadow-none focus:shadow-none focus:translate-x-0 focus:translate-y-0 font-mono text-sm"
              />
              <div className="flex items-center justify-between px-4 py-3 border-t-[2px] border-black bg-brutal-bg-alt">
                <span className="text-xs font-bold text-brutal-text-muted uppercase">
                  {input.length.toLocaleString()} chars
                </span>
                <span className="text-xs text-brutal-text-muted">
                  Ctrl+Enter to format
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={formatJson}
              disabled={isLoading || !input.trim()}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
              Prettify
            </Button>
            <Button
              onClick={minifyJson}
              disabled={isLoading || !input.trim()}
              variant="outline"
              className="w-full"
            >
              <Minimize2 className="w-4 h-4" />
              Minify
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={showTreeView}
              disabled={isLoading || !input.trim()}
              variant="secondary"
              className="w-full"
            >
              <ChevronRight className="w-4 h-4" />
              Tree View
            </Button>
            <Button
              onClick={convertToYaml}
              disabled={isLoading || !input.trim()}
              variant="accent"
              className="w-full"
            >
              <Brackets className="w-4 h-4" />
              To YAML
            </Button>
          </div>

          <Button
            onClick={convertYamlToJson}
            disabled={isLoading || !input.trim()}
            variant="ghost"
            className="w-full text-xs"
          >
            YAML to JSON (if input is YAML)
          </Button>

          {/* Error */}
          {error && (
            <Card className="bg-brutal-danger border-black">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 text-white">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">{error.message}</p>
                    {error.line && error.column && (
                      <p className="text-xs mt-1 opacity-80">
                        Line {error.line}, Column {error.column}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          {output ? (
            <>
              {/* View Mode Tabs */}
              <div className="flex gap-2">
                {(
                  [
                    { mode: "text", label: "Text" },
                    { mode: "tree", label: "Tree" },
                    { mode: "yaml", label: "YAML" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.mode}
                    onClick={() => {
                      if (tab.mode === "tree") {
                        showTreeView();
                      } else if (tab.mode === "yaml") {
                        convertToYaml();
                      } else {
                        formatJson();
                      }
                    }}
                    className={cn(
                      "px-4 py-2 text-xs font-bold uppercase border-[2px] border-black transition-all",
                      viewMode === tab.mode
                        ? "bg-brutal-accent shadow-[2px_2px_0px_0px_#000000]"
                        : "bg-white hover:bg-brutal-bg-alt"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Output Card */}
              <Card className="overflow-hidden">
                <CardHeader className="border-b-[3px] border-black">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={viewMode === "yaml" ? "accent" : "success"}
                      >
                        {viewMode === "yaml" ? "YAML" : "JSON"}
                      </Badge>
                      <CardTitle className="text-sm">Output</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={downloadOutput} variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button onClick={copyOutput} variant="outline" size="sm">
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {viewMode === "tree" && parsedJson !== null ? (
                    <div className="p-4 max-h-[400px] overflow-auto font-mono text-sm bg-white">
                      <TreeNode
                        keyName={null}
                        value={parsedJson}
                        level={0}
                        path="$"
                        defaultExpanded={true}
                      />
                    </div>
                  ) : (
                    <pre className="p-4 max-h-[400px] overflow-auto font-mono text-sm bg-white whitespace-pre-wrap break-all">
                      {output}
                    </pre>
                  )}
                </CardContent>
              </Card>

              {/* Info */}
              <Card className="bg-brutal-bg-alt">
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs text-brutal-text-muted font-medium">
                    * Tree View: Click nodes to expand/collapse. Hover to copy
                    JSONPath.
                  </p>
                  <p className="text-xs text-brutal-text-muted font-medium">
                    * YAML conversion uses js-yaml library.
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-6">
                  <Brackets className="w-10 h-10 text-brutal-text-muted" />
                </div>
                <p className="text-brutal-text-muted font-bold uppercase tracking-wide">
                  Enter JSON and click Prettify
                </p>
                <p className="text-brutal-text-muted text-sm mt-2">
                  Or upload a .json or .yaml file
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
