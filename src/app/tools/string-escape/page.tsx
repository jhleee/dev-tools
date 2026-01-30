"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Code,
  Copy,
  Check,
  Trash2,
  ArrowRightLeft,
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

type EscapeType = "json" | "html" | "url" | "javascript" | "sql" | "csv";
type Mode = "escape" | "unescape";

interface EscapeOption {
  id: EscapeType;
  label: string;
  description: string;
}

const ESCAPE_OPTIONS: EscapeOption[] = [
  { id: "json", label: "JSON", description: "Escape for JSON strings" },
  { id: "html", label: "HTML", description: "Escape HTML entities" },
  { id: "url", label: "URL", description: "URL encode" },
  { id: "javascript", label: "JavaScript", description: "Escape for JS strings" },
  { id: "sql", label: "SQL", description: "Escape for SQL queries" },
  { id: "csv", label: "CSV", description: "Escape for CSV fields" },
];

function escapeJson(text: string): string {
  return JSON.stringify(text).slice(1, -1);
}

function unescapeJson(text: string): string {
  try {
    return JSON.parse(`"${text}"`);
  } catch {
    return text;
  }
}

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };
  return text.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

function unescapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x27;": "'",
    "&#x2F;": "/",
    "&#x60;": "`",
    "&#x3D;": "=",
    "&nbsp;": " ",
  };
  return text.replace(/&[#\w]+;/g, (entity) => htmlEntities[entity] || entity);
}

function escapeUrl(text: string): string {
  return encodeURIComponent(text);
}

function unescapeUrl(text: string): string {
  try {
    return decodeURIComponent(text.replace(/\+/g, " "));
  } catch {
    return text;
  }
}

function escapeJavaScript(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\f/g, "\\f")
    .replace(/\v/g, "\\v")
    .replace(/\0/g, "\\0");
}

function unescapeJavaScript(text: string): string {
  return text
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\f/g, "\f")
    .replace(/\\v/g, "\v")
    .replace(/\\0/g, "\0")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function escapeSql(text: string): string {
  return text
    .replace(/'/g, "''")
    .replace(/\\/g, "\\\\")
    .replace(/\x00/g, "\\0")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\x1a/g, "\\Z");
}

function unescapeSql(text: string): string {
  return text
    .replace(/''/g, "'")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\0/g, "\x00")
    .replace(/\\Z/g, "\x1a")
    .replace(/\\\\/g, "\\");
}

function escapeCsv(text: string): string {
  // If contains comma, newline, or quote, wrap in quotes
  if (text.includes(",") || text.includes("\n") || text.includes('"')) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

function unescapeCsv(text: string): string {
  // Remove surrounding quotes if present
  if (text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1).replace(/""/g, '"');
  }
  return text;
}

function processText(text: string, type: EscapeType, mode: Mode): string {
  if (!text) return "";

  const escapeFunctions: Record<EscapeType, { escape: (t: string) => string; unescape: (t: string) => string }> = {
    json: { escape: escapeJson, unescape: unescapeJson },
    html: { escape: escapeHtml, unescape: unescapeHtml },
    url: { escape: escapeUrl, unescape: unescapeUrl },
    javascript: { escape: escapeJavaScript, unescape: unescapeJavaScript },
    sql: { escape: escapeSql, unescape: unescapeSql },
    csv: { escape: escapeCsv, unescape: unescapeCsv },
  };

  const fn = escapeFunctions[type][mode];
  return fn(text);
}

export default function StringEscapePage() {
  const [input, setInput] = useState("");
  const [escapeType, setEscapeType] = useState<EscapeType>("json");
  const [mode, setMode] = useState<Mode>("escape");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    return processText(input, escapeType, mode);
  }, [input, escapeType, mode]);

  const copyOutput = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const clear = useCallback(() => {
    setInput("");
  }, []);

  const swap = useCallback(() => {
    setInput(output);
    setMode((prev) => (prev === "escape" ? "unescape" : "escape"));
  }, [output]);

  const loadSample = useCallback(() => {
    if (mode === "escape") {
      setInput('Hello "World"\nThis is a <test> & example');
    } else {
      switch (escapeType) {
        case "json":
          setInput('Hello \\"World\\"\\nThis is a test');
          break;
        case "html":
          setInput("Hello &quot;World&quot;&lt;test&gt; &amp; example");
          break;
        case "url":
          setInput("Hello%20%22World%22%0AThis%20is%20a%20test");
          break;
        default:
          setInput('Hello \\"World\\"\\nThis is a test');
      }
    }
  }, [mode, escapeType]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brutal-warning border-[2px] md:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] md:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Code className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black uppercase tracking-tight">
              String Escape/Unescape
            </h1>
            <div className="h-1 w-16 md:w-24 bg-brutal-warning mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-3 md:mt-4 font-medium text-sm md:text-base">
          문자열을 다양한 포맷으로 이스케이프/언이스케이프합니다.
        </p>
      </header>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {/* Mode Toggle */}
        <div className="flex">
          <button
            onClick={() => setMode("escape")}
            className={cn(
              "px-6 py-3 text-sm font-bold uppercase border-[3px] border-black transition-all",
              mode === "escape"
                ? "bg-brutal-warning shadow-[3px_3px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                : "bg-white hover:bg-brutal-bg-alt"
            )}
          >
            Escape
          </button>
          <button
            onClick={() => setMode("unescape")}
            className={cn(
              "px-6 py-3 text-sm font-bold uppercase border-[3px] border-l-0 border-black transition-all",
              mode === "unescape"
                ? "bg-brutal-accent shadow-[3px_3px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                : "bg-white hover:bg-brutal-bg-alt"
            )}
          >
            Unescape
          </button>
        </div>

        <Button onClick={swap} variant="outline" size="sm">
          <ArrowRightLeft className="w-4 h-4" />
          Swap
        </Button>

        <Button onClick={loadSample} variant="outline" size="sm">
          Sample
        </Button>
      </div>

      {/* Escape Type Selection */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {ESCAPE_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => setEscapeType(option.id)}
            title={option.description}
            className={cn(
              "px-4 py-3 text-sm font-bold uppercase border-[2px] border-black transition-all",
              escapeType === option.id
                ? "bg-brutal-warning shadow-[2px_2px_0px_0px_#000000]"
                : "bg-white hover:bg-brutal-bg-alt"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card>
          <CardHeader className="border-b-[3px] border-black">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                Input
                <Badge variant="default">
                  {mode === "escape" ? "Raw" : "Escaped"}
                </Badge>
              </CardTitle>
              <Button onClick={clear} variant="outline" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter text to ${mode}...`}
              className="min-h-[300px] border-0 shadow-none focus:shadow-none focus:translate-x-0 focus:translate-y-0 font-mono text-sm"
            />
            <div className="px-4 py-3 border-t-[2px] border-black bg-brutal-bg-alt">
              <span className="text-xs font-bold text-brutal-text-muted uppercase">
                {input.length.toLocaleString()} chars
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader className="border-b-[3px] border-black bg-brutal-warning">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                Output
                <Badge variant="default">
                  {mode === "escape" ? "Escaped" : "Raw"}
                </Badge>
              </CardTitle>
              <Button onClick={copyOutput} variant="outline" size="sm" disabled={!output}>
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
          </CardHeader>
          <CardContent className="p-0">
            {output ? (
              <>
                <pre className="p-4 min-h-[300px] font-mono text-sm whitespace-pre-wrap break-all overflow-auto bg-white">
                  {output}
                </pre>
                <div className="px-4 py-3 border-t-[2px] border-black bg-brutal-bg-alt">
                  <span className="text-xs font-bold text-brutal-text-muted uppercase">
                    {output.length.toLocaleString()} chars
                  </span>
                </div>
              </>
            ) : (
              <div className="min-h-[300px] flex items-center justify-center p-8">
                <div className="text-center">
                  <Code className="w-12 h-12 text-brutal-text-muted mx-auto mb-4" />
                  <p className="text-brutal-text-muted font-bold uppercase">
                    Enter text to {mode}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <Card className="mt-6 bg-brutal-bg-alt">
        <CardContent className="p-4">
          <p className="text-xs text-brutal-text-muted font-medium">
            <strong>현재 선택:</strong> {ESCAPE_OPTIONS.find((o) => o.id === escapeType)?.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
