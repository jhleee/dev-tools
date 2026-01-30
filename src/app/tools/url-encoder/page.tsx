"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Link2,
  ArrowRightLeft,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  List,
  Code,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Badge,
  Input,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type Mode = "encode" | "decode";
type View = "simple" | "params";

interface QueryParam {
  key: string;
  value: string;
  encoded: boolean;
}

export default function UrlEncoderPage() {
  const [mode, setMode] = useState<Mode>("encode");
  const [view, setView] = useState<View>("simple");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  const [baseUrl, setBaseUrl] = useState("");

  const encode = useCallback((text: string): string => {
    try {
      return encodeURIComponent(text);
    } catch {
      throw new Error("Failed to encode text");
    }
  }, []);

  const decode = useCallback((text: string): string => {
    try {
      return decodeURIComponent(text.replace(/\+/g, " "));
    } catch {
      throw new Error("Invalid encoded URL string");
    }
  }, []);

  const parseUrl = useCallback((url: string) => {
    try {
      // Handle URLs without protocol
      let fullUrl = url;
      if (url && !url.includes("://")) {
        fullUrl = "https://" + url;
      }

      const parsed = new URL(fullUrl);
      setBaseUrl(parsed.origin + parsed.pathname);

      const params: QueryParam[] = [];
      parsed.searchParams.forEach((value, key) => {
        params.push({
          key,
          value,
          encoded: encodeURIComponent(value) !== value,
        });
      });
      setQueryParams(params);
      setError(null);
    } catch {
      setBaseUrl(url.split("?")[0] || "");
      setQueryParams([]);
    }
  }, []);

  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    setError(null);
    try {
      if (mode === "encode") {
        setOutput(encode(input));
      } else {
        setOutput(decode(input));
        parseUrl(input);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }, [input, mode, encode, decode, parseUrl]);

  // Auto-convert on input change
  useEffect(() => {
    const timer = setTimeout(handleConvert, 200);
    return () => clearTimeout(timer);
  }, [handleConvert]);

  const handleSwapMode = useCallback(() => {
    setMode((prev) => (prev === "encode" ? "decode" : "encode"));
    setInput(output);
    setOutput("");
    setError(null);
  }, [output]);

  const copyOutput = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
    setQueryParams([]);
    setBaseUrl("");
  }, []);

  const buildUrlFromParams = useCallback(() => {
    if (!baseUrl && queryParams.length === 0) return "";

    const params = new URLSearchParams();
    queryParams.forEach((p) => {
      if (p.key) {
        params.append(p.key, p.value);
      }
    });

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [baseUrl, queryParams]);

  const addParam = useCallback(() => {
    setQueryParams((prev) => [...prev, { key: "", value: "", encoded: false }]);
  }, []);

  const removeParam = useCallback((index: number) => {
    setQueryParams((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateParam = useCallback(
    (index: number, field: "key" | "value", value: string) => {
      setQueryParams((prev) =>
        prev.map((p, i) =>
          i === index
            ? { ...p, [field]: value, encoded: encodeURIComponent(value) !== value }
            : p
        )
      );
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleConvert();
      }
    },
    [handleConvert]
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-brutal-primary border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Link2 className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black uppercase tracking-tight">
              URL Encoder/Decoder
            </h1>
            <div className="h-1 w-24 bg-brutal-primary mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-4 font-medium">
          URL 문자열을 인코딩/디코딩하고 쿼리 파라미터를 분석합니다.
        </p>
      </header>

      {/* Mode & View Toggle */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex">
          <button
            onClick={() => {
              setMode("encode");
              setView("simple");
            }}
            className={cn(
              "px-6 py-3 text-sm font-bold uppercase border-[3px] border-black transition-all",
              mode === "encode"
                ? "bg-brutal-primary shadow-[3px_3px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                : "bg-white hover:bg-brutal-bg-alt"
            )}
          >
            Encode
          </button>
          <button
            onClick={() => setMode("decode")}
            className={cn(
              "px-6 py-3 text-sm font-bold uppercase border-[3px] border-l-0 border-black transition-all",
              mode === "decode"
                ? "bg-brutal-accent shadow-[3px_3px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                : "bg-white hover:bg-brutal-bg-alt"
            )}
          >
            Decode
          </button>
        </div>

        <Button onClick={handleSwapMode} variant="outline" size="sm">
          <ArrowRightLeft className="w-4 h-4" />
          Swap
        </Button>

        {mode === "decode" && (
          <div className="flex">
            <button
              onClick={() => setView("simple")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase border-[2px] border-black transition-all",
                view === "simple"
                  ? "bg-brutal-secondary shadow-[2px_2px_0px_0px_#000000]"
                  : "bg-white hover:bg-brutal-bg-alt"
              )}
            >
              <Code className="w-4 h-4" />
              Simple
            </button>
            <button
              onClick={() => setView("params")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase border-[2px] border-l-0 border-black transition-all",
                view === "params"
                  ? "bg-brutal-secondary shadow-[2px_2px_0px_0px_#000000]"
                  : "bg-white hover:bg-brutal-bg-alt"
              )}
            >
              <List className="w-4 h-4" />
              Params
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {mode === "encode" ? "Text to Encode" : "URL to Decode"}
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
                onKeyDown={handleKeyDown}
                placeholder={
                  mode === "encode"
                    ? "Enter text to URL encode..."
                    : "Enter URL or encoded string to decode..."
                }
                className="min-h-[200px] border-0 shadow-none focus:shadow-none focus:translate-x-0 focus:translate-y-0 font-mono text-sm"
              />
              <div className="px-4 py-3 border-t-[2px] border-black bg-brutal-bg-alt">
                <span className="text-xs font-bold text-brutal-text-muted uppercase">
                  {input.length.toLocaleString()} chars
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

          {/* Quick Examples */}
          <Card className="bg-brutal-bg-alt">
            <CardContent className="p-4">
              <p className="text-xs font-bold uppercase text-brutal-text-muted mb-2">
                Quick Examples:
              </p>
              <div className="flex flex-wrap gap-2">
                {mode === "encode" ? (
                  <>
                    <button
                      onClick={() => setInput("Hello World!")}
                      className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-primary"
                    >
                      Hello World!
                    </button>
                    <button
                      onClick={() => setInput("name=홍길동&city=서울")}
                      className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-primary"
                    >
                      Korean Text
                    </button>
                    <button
                      onClick={() => setInput("a=1&b=2&c=hello world")}
                      className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-primary"
                    >
                      Query String
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        setInput(
                          "https://example.com/search?q=hello%20world&lang=ko"
                        )
                      }
                      className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-accent"
                    >
                      Sample URL
                    </button>
                    <button
                      onClick={() => setInput("Hello%20World%21")}
                      className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-accent"
                    >
                      Encoded Text
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          {output ? (
            <>
              <Card>
                <CardHeader className="border-b-[3px] border-black">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={mode === "encode" ? "success" : "accent"}>
                        {mode === "encode" ? "Encoded" : "Decoded"}
                      </Badge>
                      <CardTitle className="text-sm">Output</CardTitle>
                    </div>
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
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="p-4 max-h-[200px] overflow-auto font-mono text-sm bg-white whitespace-pre-wrap break-all">
                    {output}
                  </pre>
                  <div className="px-4 py-3 border-t-[2px] border-black bg-brutal-bg-alt">
                    <span className="text-xs font-bold text-brutal-text-muted uppercase">
                      {output.length.toLocaleString()} chars
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Query Params View */}
              {mode === "decode" && view === "params" && queryParams.length > 0 && (
                <Card>
                  <CardHeader className="border-b-[3px] border-black bg-brutal-secondary">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <List className="w-4 h-4" />
                        Query Parameters ({queryParams.length})
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {baseUrl && (
                      <div className="p-4 border-b-[2px] border-black bg-brutal-bg-alt">
                        <span className="text-xs font-bold uppercase text-brutal-text-muted">
                          Base URL:
                        </span>
                        <p className="font-mono text-sm mt-1 break-all">
                          {baseUrl}
                        </p>
                      </div>
                    )}
                    <div className="divide-y-[2px] divide-black">
                      {queryParams.map((param, index) => (
                        <div key={index} className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="default">{param.key}</Badge>
                            {param.encoded && (
                              <Badge variant="warning">Was Encoded</Badge>
                            )}
                          </div>
                          <p className="font-mono text-sm bg-white p-2 border-[2px] border-black break-all">
                            {param.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="h-full min-h-[350px] flex items-center justify-center">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-6">
                  <Link2 className="w-10 h-10 text-brutal-text-muted" />
                </div>
                <p className="text-brutal-text-muted font-bold uppercase tracking-wide">
                  {mode === "encode"
                    ? "Enter text to encode"
                    : "Enter URL to decode"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card className="bg-brutal-bg-alt">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-brutal-text-muted font-medium">
                * encodeURIComponent 사용 (RFC 3986 준수)
              </p>
              <p className="text-xs text-brutal-text-muted font-medium">
                * 한글, 특수문자, 공백 등 모두 지원
              </p>
              <p className="text-xs text-brutal-text-muted font-medium">
                * + 기호는 공백으로 디코딩됨
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
