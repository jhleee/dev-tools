"use client";

import { useState, useCallback } from "react";
import {
  Hash,
  Upload,
  Loader2,
  FileText,
  AlertCircle,
  Copy,
  Check,
  Settings2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface TokenStats {
  totalTokens: number;
  uniqueTokens?: number;
  charsPerToken: number;
}

interface TokenizerResult {
  provider: string;
  model: string;
  encoding?: string;
  stats: TokenStats | null;
  error?: string;
}

interface FileStats {
  charCount: number;
  wordCount: number;
  lineCount: number;
}

interface AnalysisResult {
  fileStats: FileStats;
  results: TokenizerResult[];
}

export default function TokenCounterPage() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    anthropic: "",
    google: "",
  });

  const analyzeTokens = useCallback(async () => {
    if (!text.trim()) {
      setError("텍스트를 입력해주세요");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          anthropicApiKey: apiKeys.anthropic || undefined,
          googleApiKey: apiKeys.google || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "분석 실패");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "분석 중 오류 발생");
    } finally {
      setIsLoading(false);
    }
  }, [text, apiKeys]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    },
    []
  );

  const copyResults = useCallback(() => {
    if (!result) return;

    const lines = [
      `File Stats: ${result.fileStats.charCount.toLocaleString()} chars, ${result.fileStats.wordCount.toLocaleString()} words, ${result.fileStats.lineCount.toLocaleString()} lines`,
      "",
      "Token Counts:",
      ...result.results.map((r) =>
        r.stats
          ? `${r.provider} ${r.model}: ${r.stats.totalTokens.toLocaleString()} tokens`
          : `${r.provider} ${r.model}: ${r.error}`
      ),
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        analyzeTokens();
      }
    },
    [analyzeTokens]
  );

  const getProviderBadgeVariant = (provider: string) => {
    switch (provider) {
      case "OpenAI":
        return "success";
      case "Anthropic":
        return "warning";
      case "Google":
        return "accent";
      default:
        return "default";
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brutal-accent border-[2px] md:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] md:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Hash className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black uppercase tracking-tight">
              Token Counter
            </h1>
            <div className="h-1 w-16 md:w-24 bg-brutal-accent mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-3 md:mt-4 font-medium text-sm md:text-base">
          다양한 LLM 모델의 토큰 수를 계산하고 비교합니다. GPT, Claude, Gemini
          토크나이저를 지원합니다.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
            <Settings2 className="w-4 h-4" />
            API Keys 설정
            {showSettings ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {/* API Keys Settings */}
          {showSettings && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <p className="text-xs text-brutal-text-muted font-medium">
                  Claude/Gemini 토큰을 계산하려면 API 키가 필요합니다. 서버 환경
                  변수가 설정되어 있으면 비워둬도 됩니다.
                </p>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-black mb-2">
                    Anthropic API Key
                  </label>
                  <Input
                    type="password"
                    value={apiKeys.anthropic}
                    onChange={(e) =>
                      setApiKeys((prev) => ({
                        ...prev,
                        anthropic: e.target.value,
                      }))
                    }
                    placeholder="sk-ant-..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-black mb-2">
                    Google API Key
                  </label>
                  <Input
                    type="password"
                    value={apiKeys.google}
                    onChange={(e) =>
                      setApiKeys((prev) => ({ ...prev, google: e.target.value }))
                    }
                    placeholder="AIza..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Text Input */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">입력 텍스트</CardTitle>
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                      파일 업로드
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".txt,.md,.json,.csv,.xml,.html"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="토큰 수를 계산할 텍스트를 입력하세요..."
                className="min-h-[280px] border-0 shadow-none focus:shadow-none focus:translate-x-0 focus:translate-y-0 font-mono text-sm"
              />
              <div className="flex items-center justify-between px-4 py-3 border-t-[2px] border-black bg-brutal-bg-alt">
                <span className="text-xs font-bold text-brutal-text-muted uppercase">
                  {text.length.toLocaleString()} 자
                </span>
                <span className="text-xs text-brutal-text-muted">
                  Ctrl+Enter로 분석
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Analyze Button */}
          <Button
            onClick={analyzeTokens}
            disabled={isLoading || !text.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Hash className="w-5 h-5" />
                토큰 분석
              </>
            )}
          </Button>

          {/* Error */}
          {error && (
            <Card className="bg-brutal-danger border-black">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-white font-bold text-sm">{error}</span>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* File Stats */}
              <Card>
                <CardHeader className="border-b-[3px] border-black">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-black" />
                      <CardTitle className="text-sm">파일 통계</CardTitle>
                    </div>
                    <Button
                      onClick={copyResults}
                      variant="outline"
                      size="sm"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          복사
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-4 bg-brutal-primary border-[2px] border-black shadow-[2px_2px_0px_0px_#000000]">
                      <div className="text-2xl font-bold text-black font-mono">
                        {result.fileStats.charCount.toLocaleString()}
                      </div>
                      <div className="text-xs font-bold uppercase text-black mt-1">
                        Characters
                      </div>
                    </div>
                    <div className="text-center p-4 bg-brutal-secondary border-[2px] border-black shadow-[2px_2px_0px_0px_#000000]">
                      <div className="text-2xl font-bold text-black font-mono">
                        {result.fileStats.wordCount.toLocaleString()}
                      </div>
                      <div className="text-xs font-bold uppercase text-black mt-1">
                        Words
                      </div>
                    </div>
                    <div className="text-center p-4 bg-brutal-accent border-[2px] border-black shadow-[2px_2px_0px_0px_#000000]">
                      <div className="text-2xl font-bold text-black font-mono">
                        {result.fileStats.lineCount.toLocaleString()}
                      </div>
                      <div className="text-xs font-bold uppercase text-black mt-1">
                        Lines
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Token Results */}
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-brutal-primary">
                      <TableHead>Provider</TableHead>
                      <TableHead>Model / Encoding</TableHead>
                      <TableHead className="text-right">Tokens</TableHead>
                      <TableHead className="text-right">Unique</TableHead>
                      <TableHead className="text-right">Chars/Tok</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.results.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Badge
                            variant={
                              getProviderBadgeVariant(r.provider) as
                                | "default"
                                | "success"
                                | "warning"
                                | "accent"
                            }
                          >
                            {r.provider}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {r.encoding && (
                            <span className="text-brutal-text-muted mr-2">
                              {r.encoding}
                            </span>
                          )}
                          <span className="text-black font-bold">{r.model}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {r.stats ? (
                            <span className="text-black font-bold text-lg">
                              {r.stats.totalTokens.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-brutal-text-muted text-xs">
                              {r.error}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-brutal-text-muted">
                          {r.stats?.uniqueTokens?.toLocaleString() ?? "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-brutal-text-muted">
                          {r.stats?.charsPerToken.toFixed(2) ?? "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </Card>

              {/* Info */}
              <Card className="bg-brutal-bg-alt">
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs text-brutal-text-muted font-medium">
                    * OpenAI 토큰은 tiktoken 라이브러리로 로컬에서 계산됩니다.
                  </p>
                  <p className="text-xs text-brutal-text-muted font-medium">
                    * Claude/Gemini 토큰은 각 API의 count_tokens 엔드포인트를
                    사용합니다.
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-6">
                  <Hash className="w-10 h-10 text-brutal-text-muted" />
                </div>
                <p className="text-brutal-text-muted font-bold uppercase tracking-wide">
                  텍스트를 입력하고 분석 버튼을 클릭하세요
                </p>
                <p className="text-brutal-text-muted text-sm mt-2">
                  또는 파일을 업로드할 수 있습니다
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
