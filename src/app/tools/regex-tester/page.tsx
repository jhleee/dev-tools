"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Regex,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  Trash2,
  Play,
  Hash,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Input,
  Badge,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface Match {
  text: string;
  index: number;
  length: number;
  groups: { [key: string]: string | undefined };
  groupArray: (string | undefined)[];
}

interface RegexFlag {
  key: string;
  label: string;
  description: string;
}

const FLAGS: RegexFlag[] = [
  { key: "g", label: "g", description: "Global - Find all matches" },
  { key: "i", label: "i", description: "Case insensitive" },
  { key: "m", label: "m", description: "Multiline - ^ and $ match line start/end" },
  { key: "s", label: "s", description: "Dotall - . matches newlines" },
  { key: "u", label: "u", description: "Unicode support" },
];

const EXAMPLES = [
  { name: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "gi" },
  { name: "URL", pattern: "https?://[\\w.-]+(?:/[\\w./?%&=-]*)?", flags: "gi" },
  { name: "Phone (KR)", pattern: "0\\d{1,2}-\\d{3,4}-\\d{4}", flags: "g" },
  { name: "IP Address", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g" },
  { name: "Date (YYYY-MM-DD)", pattern: "\\d{4}-\\d{2}-\\d{2}", flags: "g" },
  { name: "Hex Color", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b", flags: "gi" },
];

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [highlightedText, setHighlightedText] = useState<React.ReactNode>(null);

  const toggleFlag = useCallback((flag: string) => {
    setFlags((prev) => {
      if (prev.includes(flag)) {
        return prev.replace(flag, "");
      }
      return prev + flag;
    });
  }, []);

  const testRegex = useCallback(() => {
    if (!pattern) {
      setMatches([]);
      setError(null);
      setHighlightedText(null);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const foundMatches: Match[] = [];
      let match: RegExpExecArray | null;

      if (flags.includes("g")) {
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            text: match[0],
            index: match.index,
            length: match[0].length,
            groups: match.groups || {},
            groupArray: match.slice(1),
          });
          // Prevent infinite loop for zero-length matches
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          foundMatches.push({
            text: match[0],
            index: match.index,
            length: match[0].length,
            groups: match.groups || {},
            groupArray: match.slice(1),
          });
        }
      }

      setMatches(foundMatches);
      setError(null);

      // Create highlighted text
      if (foundMatches.length > 0 && testString) {
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        // Sort matches by index
        const sortedMatches = [...foundMatches].sort((a, b) => a.index - b.index);

        sortedMatches.forEach((m, i) => {
          if (m.index > lastIndex) {
            parts.push(
              <span key={`text-${i}`}>
                {testString.slice(lastIndex, m.index)}
              </span>
            );
          }
          parts.push(
            <mark
              key={`match-${i}`}
              className="bg-brutal-primary px-0.5 border-b-2 border-black font-bold"
            >
              {m.text}
            </mark>
          );
          lastIndex = m.index + m.length;
        });

        if (lastIndex < testString.length) {
          parts.push(
            <span key="text-end">{testString.slice(lastIndex)}</span>
          );
        }

        setHighlightedText(parts);
      } else {
        setHighlightedText(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid regex pattern");
      setMatches([]);
      setHighlightedText(null);
    }
  }, [pattern, flags, testString]);

  // Auto-test on input change
  useEffect(() => {
    const timer = setTimeout(testRegex, 200);
    return () => clearTimeout(timer);
  }, [testRegex]);

  const loadExample = useCallback((example: typeof EXAMPLES[0]) => {
    setPattern(example.pattern);
    setFlags(example.flags);
  }, []);

  const copyPattern = useCallback(() => {
    const fullPattern = `/${pattern}/${flags}`;
    navigator.clipboard.writeText(fullPattern);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pattern, flags]);

  const clear = useCallback(() => {
    setPattern("");
    setTestString("");
    setMatches([]);
    setError(null);
    setHighlightedText(null);
  }, []);

  const regexPreview = useMemo(() => {
    if (!pattern) return null;
    return `/${pattern}/${flags}`;
  }, [pattern, flags]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-brutal-secondary border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Regex className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black uppercase tracking-tight">
              Regex Tester
            </h1>
            <div className="h-1 w-24 bg-brutal-secondary mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-4 font-medium">
          정규식 패턴을 테스트하고 매칭 결과를 실시간으로 확인합니다. 그룹 캡처 지원.
        </p>
      </header>

      {/* Examples */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-bold uppercase text-brutal-text-muted py-2">
            Examples:
          </span>
          {EXAMPLES.map((example) => (
            <button
              key={example.name}
              onClick={() => loadExample(example)}
              className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-bg-alt transition-colors"
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-4">
          {/* Pattern Input */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Regular Expression</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={copyPattern}
                    variant="outline"
                    size="sm"
                    disabled={!pattern}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button onClick={clear} variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-mono text-brutal-text-muted">/</span>
                <Input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Enter regex pattern..."
                  className="flex-1 font-mono"
                />
                <span className="text-2xl font-mono text-brutal-text-muted">/</span>
                <span className="font-mono text-lg font-bold w-12">{flags}</span>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-2">
                {FLAGS.map((flag) => (
                  <button
                    key={flag.key}
                    onClick={() => toggleFlag(flag.key)}
                    title={flag.description}
                    className={cn(
                      "w-10 h-10 text-sm font-bold border-[2px] border-black transition-all",
                      flags.includes(flag.key)
                        ? "bg-brutal-primary shadow-[2px_2px_0px_0px_#000000]"
                        : "bg-white hover:bg-brutal-bg-alt"
                    )}
                  >
                    {flag.label}
                  </button>
                ))}
              </div>

              {/* Preview */}
              {regexPreview && (
                <div className="bg-brutal-bg-alt p-3 border-[2px] border-black">
                  <span className="text-xs font-bold uppercase text-brutal-text-muted">
                    Preview:
                  </span>
                  <p className="font-mono text-sm mt-1">{regexPreview}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test String */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <CardTitle className="text-sm">Test String</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter text to test against the pattern..."
                className="min-h-[200px] border-0 shadow-none focus:shadow-none focus:translate-x-0 focus:translate-y-0 font-mono text-sm"
              />
              <div className="px-4 py-3 border-t-[2px] border-black bg-brutal-bg-alt">
                <span className="text-xs font-bold text-brutal-text-muted uppercase">
                  {testString.length.toLocaleString()} chars
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Card className="bg-brutal-danger border-black">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-white flex-shrink-0" />
                <p className="text-white font-bold text-sm">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="space-y-4">
          {/* Match Count */}
          <Card className={cn(
            "border-black",
            matches.length > 0 ? "bg-brutal-success" : "bg-brutal-bg-alt"
          )}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5" />
                <span className="font-bold text-sm uppercase">
                  {matches.length} {matches.length === 1 ? "Match" : "Matches"} Found
                </span>
              </div>
              {matches.length > 0 && (
                <Badge variant="default">{flags.includes("g") ? "Global" : "First Only"}</Badge>
              )}
            </CardContent>
          </Card>

          {/* Highlighted Text */}
          {highlightedText && (
            <Card>
              <CardHeader className="border-b-[3px] border-black">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Highlighted Matches
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <pre className="font-mono text-sm whitespace-pre-wrap break-all bg-white p-3 border-[2px] border-black max-h-[200px] overflow-auto">
                  {highlightedText}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Match Details */}
          {matches.length > 0 ? (
            <Card>
              <CardHeader className="border-b-[3px] border-black">
                <CardTitle className="text-sm">Match Details</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[300px] overflow-auto">
                  {matches.map((match, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-4",
                        index !== matches.length - 1 && "border-b-[2px] border-black"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="accent">Match {index + 1}</Badge>
                        <span className="text-xs font-mono text-brutal-text-muted">
                          index: {match.index}
                        </span>
                      </div>
                      <div className="bg-brutal-primary p-2 border-[2px] border-black mb-2">
                        <code className="font-mono text-sm font-bold break-all">
                          {match.text}
                        </code>
                      </div>

                      {/* Capture Groups */}
                      {match.groupArray.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <span className="text-xs font-bold uppercase text-brutal-text-muted">
                            Capture Groups:
                          </span>
                          {match.groupArray.map((group, gIndex) => (
                            <div key={gIndex} className="flex items-center gap-2 text-sm">
                              <span className="font-mono text-brutal-text-muted">
                                ${gIndex + 1}:
                              </span>
                              <span className="font-mono bg-brutal-bg-alt px-2 py-0.5 border border-black">
                                {group ?? "(undefined)"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Named Groups */}
                      {Object.keys(match.groups).length > 0 && (
                        <div className="mt-3 space-y-1">
                          <span className="text-xs font-bold uppercase text-brutal-text-muted">
                            Named Groups:
                          </span>
                          {Object.entries(match.groups).map(([name, value]) => (
                            <div key={name} className="flex items-center gap-2 text-sm">
                              <span className="font-mono text-brutal-text-muted">
                                {name}:
                              </span>
                              <span className="font-mono bg-brutal-bg-alt px-2 py-0.5 border border-black">
                                {value ?? "(undefined)"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : pattern && testString && !error ? (
            <Card className="flex items-center justify-center min-h-[200px]">
              <CardContent className="text-center p-8">
                <div className="w-16 h-16 bg-brutal-bg-alt border-[3px] border-black flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-brutal-text-muted" />
                </div>
                <p className="text-brutal-text-muted font-bold uppercase">
                  No matches found
                </p>
                <p className="text-brutal-text-muted text-xs mt-2">
                  Try adjusting your pattern or test string
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center min-h-[300px]">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-6">
                  <Regex className="w-10 h-10 text-brutal-text-muted" />
                </div>
                <p className="text-brutal-text-muted font-bold uppercase tracking-wide">
                  Enter a pattern and test string
                </p>
                <p className="text-brutal-text-muted text-xs mt-2">
                  Results will appear automatically
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Reference */}
          <Card className="bg-brutal-bg-alt">
            <CardHeader className="border-b-[2px] border-black">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Quick Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
                <span><code className="bg-white px-1 border border-black">.</code> Any character</span>
                <span><code className="bg-white px-1 border border-black">\d</code> Digit</span>
                <span><code className="bg-white px-1 border border-black">\w</code> Word char</span>
                <span><code className="bg-white px-1 border border-black">\s</code> Whitespace</span>
                <span><code className="bg-white px-1 border border-black">^</code> Start</span>
                <span><code className="bg-white px-1 border border-black">$</code> End</span>
                <span><code className="bg-white px-1 border border-black">*</code> 0 or more</span>
                <span><code className="bg-white px-1 border border-black">+</code> 1 or more</span>
                <span><code className="bg-white px-1 border border-black">?</code> Optional</span>
                <span><code className="bg-white px-1 border border-black">{"{n}"}</code> Exactly n</span>
                <span><code className="bg-white px-1 border border-black">[abc]</code> Char class</span>
                <span><code className="bg-white px-1 border border-black">(x)</code> Group</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
