"use client";

import { useState, useCallback, useMemo } from "react";
import {
  GitCompare,
  Copy,
  Check,
  Trash2,
  ArrowRightLeft,
  FileText,
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

type DiffType = "char" | "word" | "line";

interface DiffPart {
  value: string;
  type: "added" | "removed" | "unchanged";
}

function diffLines(oldText: string, newText: string): DiffPart[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const result: DiffPart[] = [];

  // Simple LCS-based diff
  const lcs = computeLCS(oldLines, newLines);
  let oldIdx = 0;
  let newIdx = 0;
  let lcsIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (lcsIdx < lcs.length && oldIdx < oldLines.length && oldLines[oldIdx] === lcs[lcsIdx]) {
      // Check if new also matches
      if (newIdx < newLines.length && newLines[newIdx] === lcs[lcsIdx]) {
        result.push({ value: oldLines[oldIdx] + "\n", type: "unchanged" });
        oldIdx++;
        newIdx++;
        lcsIdx++;
      } else if (newIdx < newLines.length) {
        result.push({ value: newLines[newIdx] + "\n", type: "added" });
        newIdx++;
      }
    } else if (lcsIdx < lcs.length && newIdx < newLines.length && newLines[newIdx] === lcs[lcsIdx]) {
      if (oldIdx < oldLines.length) {
        result.push({ value: oldLines[oldIdx] + "\n", type: "removed" });
        oldIdx++;
      }
    } else {
      if (oldIdx < oldLines.length && (newIdx >= newLines.length || oldLines[oldIdx] !== newLines[newIdx])) {
        result.push({ value: oldLines[oldIdx] + "\n", type: "removed" });
        oldIdx++;
      }
      if (newIdx < newLines.length && (oldIdx > oldLines.length || (oldIdx <= oldLines.length && oldLines[oldIdx - 1] !== newLines[newIdx]))) {
        if (result.length === 0 || result[result.length - 1].value !== newLines[newIdx] + "\n") {
          result.push({ value: newLines[newIdx] + "\n", type: "added" });
        }
        newIdx++;
      }
      if (oldIdx >= oldLines.length && newIdx >= newLines.length) break;
    }
  }

  return result;
}

function computeLCS(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find LCS
  const lcs: string[] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
}

function diffWords(oldText: string, newText: string): DiffPart[] {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);
  return diffArrays(oldWords, newWords);
}

function diffChars(oldText: string, newText: string): DiffPart[] {
  const oldChars = oldText.split("");
  const newChars = newText.split("");
  return diffArrays(oldChars, newChars);
}

function diffArrays(oldArr: string[], newArr: string[]): DiffPart[] {
  const result: DiffPart[] = [];
  const lcs = computeLCS(oldArr, newArr);

  let oldIdx = 0;
  let newIdx = 0;
  let lcsIdx = 0;

  while (oldIdx < oldArr.length || newIdx < newArr.length) {
    if (lcsIdx < lcs.length) {
      // Output removed items
      while (oldIdx < oldArr.length && oldArr[oldIdx] !== lcs[lcsIdx]) {
        result.push({ value: oldArr[oldIdx], type: "removed" });
        oldIdx++;
      }
      // Output added items
      while (newIdx < newArr.length && newArr[newIdx] !== lcs[lcsIdx]) {
        result.push({ value: newArr[newIdx], type: "added" });
        newIdx++;
      }
      // Output common item
      if (oldIdx < oldArr.length && newIdx < newArr.length) {
        result.push({ value: oldArr[oldIdx], type: "unchanged" });
        oldIdx++;
        newIdx++;
        lcsIdx++;
      }
    } else {
      // No more LCS items
      while (oldIdx < oldArr.length) {
        result.push({ value: oldArr[oldIdx], type: "removed" });
        oldIdx++;
      }
      while (newIdx < newArr.length) {
        result.push({ value: newArr[newIdx], type: "added" });
        newIdx++;
      }
    }
  }

  return result;
}

export default function DiffViewerPage() {
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [diffType, setDiffType] = useState<DiffType>("line");
  const [copied, setCopied] = useState(false);

  const diff = useMemo(() => {
    if (!oldText && !newText) return [];

    switch (diffType) {
      case "char":
        return diffChars(oldText, newText);
      case "word":
        return diffWords(oldText, newText);
      case "line":
      default:
        return diffLines(oldText, newText);
    }
  }, [oldText, newText, diffType]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let unchanged = 0;

    diff.forEach((part) => {
      const count = diffType === "line" ? 1 : part.value.length;
      switch (part.type) {
        case "added":
          added += count;
          break;
        case "removed":
          removed += count;
          break;
        case "unchanged":
          unchanged += count;
          break;
      }
    });

    return { added, removed, unchanged };
  }, [diff, diffType]);

  const swap = useCallback(() => {
    const temp = oldText;
    setOldText(newText);
    setNewText(temp);
  }, [oldText, newText]);

  const clear = useCallback(() => {
    setOldText("");
    setNewText("");
  }, []);

  const copyDiff = useCallback(() => {
    const diffText = diff
      .map((part) => {
        const prefix = part.type === "added" ? "+ " : part.type === "removed" ? "- " : "  ";
        return prefix + part.value;
      })
      .join("");
    navigator.clipboard.writeText(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [diff]);

  const loadSample = useCallback(() => {
    setOldText(`function greet(name) {
  console.log("Hello, " + name);
  return true;
}`);
    setNewText(`function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return { success: true };
}`);
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brutal-accent border-[2px] md:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] md:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <GitCompare className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black uppercase tracking-tight">
              Diff Viewer
            </h1>
            <div className="h-1 w-16 md:w-24 bg-brutal-accent mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-3 md:mt-4 font-medium text-sm md:text-base">
          두 텍스트를 비교하고 변경 사항을 하이라이트합니다.
        </p>
      </header>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex">
          {(["line", "word", "char"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setDiffType(type)}
              className={cn(
                "px-5 py-3 text-sm font-bold uppercase border-[3px] border-black transition-all",
                type !== "line" && "border-l-0",
                diffType === type
                  ? "bg-brutal-accent shadow-[3px_3px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                  : "bg-white hover:bg-brutal-bg-alt"
              )}
            >
              {type === "line" ? "Lines" : type === "word" ? "Words" : "Chars"}
            </button>
          ))}
        </div>

        <Button onClick={swap} variant="outline" size="sm">
          <ArrowRightLeft className="w-4 h-4" />
          Swap
        </Button>

        <Button onClick={loadSample} variant="outline" size="sm">
          <FileText className="w-4 h-4" />
          Sample
        </Button>

        <Button onClick={clear} variant="outline" size="sm">
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      </div>

      {/* Input Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <Card>
          <CardHeader className="border-b-[3px] border-black bg-brutal-danger">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-white rounded-full"></span>
              Original (Old)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              value={oldText}
              onChange={(e) => setOldText(e.target.value)}
              placeholder="Paste original text here..."
              className="min-h-[200px] border-0 shadow-none focus:shadow-none focus:translate-x-0 focus:translate-y-0 font-mono text-sm"
            />
            <div className="px-4 py-2 border-t-[2px] border-black bg-brutal-bg-alt">
              <span className="text-xs font-bold text-brutal-text-muted uppercase">
                {oldText.split("\n").length} lines | {oldText.length} chars
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b-[3px] border-black bg-brutal-success">
            <CardTitle className="text-sm text-black flex items-center gap-2">
              <span className="w-3 h-3 bg-black rounded-full"></span>
              Modified (New)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Paste modified text here..."
              className="min-h-[200px] border-0 shadow-none focus:shadow-none focus:translate-x-0 focus:translate-y-0 font-mono text-sm"
            />
            <div className="px-4 py-2 border-t-[2px] border-black bg-brutal-bg-alt">
              <span className="text-xs font-bold text-brutal-text-muted uppercase">
                {newText.split("\n").length} lines | {newText.length} chars
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      {(oldText || newText) && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-brutal-success">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-black">+{stats.added}</div>
              <div className="text-xs font-bold uppercase text-black/70">Added</div>
            </CardContent>
          </Card>
          <Card className="bg-brutal-danger">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white">-{stats.removed}</div>
              <div className="text-xs font-bold uppercase text-white/70">Removed</div>
            </CardContent>
          </Card>
          <Card className="bg-brutal-bg-alt">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-black">{stats.unchanged}</div>
              <div className="text-xs font-bold uppercase text-brutal-text-muted">Unchanged</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Diff Output */}
      {diff.length > 0 && (
        <Card>
          <CardHeader className="border-b-[3px] border-black">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <GitCompare className="w-4 h-4" />
                Diff Result
              </CardTitle>
              <Button onClick={copyDiff} variant="outline" size="sm">
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
            <pre className="p-4 font-mono text-sm overflow-auto max-h-[500px] bg-white">
              {diff.map((part, index) => (
                <span
                  key={index}
                  className={cn(
                    part.type === "added" && "bg-green-200 text-green-900",
                    part.type === "removed" && "bg-red-200 text-red-900 line-through",
                    part.type === "unchanged" && "text-gray-700"
                  )}
                >
                  {part.value}
                </span>
              ))}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!oldText && !newText && (
        <Card className="flex items-center justify-center min-h-[200px]">
          <CardContent className="text-center p-12">
            <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-6">
              <GitCompare className="w-10 h-10 text-brutal-text-muted" />
            </div>
            <p className="text-brutal-text-muted font-bold uppercase tracking-wide">
              Enter text in both panels to see diff
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
