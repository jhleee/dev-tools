"use client";

import { useState, useCallback } from "react";
import {
  Binary,
  ArrowRightLeft,
  Copy,
  Check,
  Upload,
  Download,
  Image,
  FileText,
  Trash2,
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

type Mode = "encode" | "decode";
type InputType = "text" | "file";

export default function Base64Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [inputType, setInputType] = useState<InputType>("text");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const encode = useCallback((text: string): string => {
    try {
      // Handle Unicode characters properly
      const bytes = new TextEncoder().encode(text);
      const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte)
      ).join("");
      return btoa(binString);
    } catch {
      throw new Error("Failed to encode text");
    }
  }, []);

  const decode = useCallback((base64: string): string => {
    try {
      // Remove whitespace and validate
      const cleaned = base64.replace(/\s/g, "");
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
        throw new Error("Invalid Base64 characters");
      }
      const binString = atob(cleaned);
      const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
      return new TextDecoder().decode(bytes);
    } catch (e) {
      if (e instanceof Error && e.message === "Invalid Base64 characters") {
        throw e;
      }
      throw new Error("Invalid Base64 string");
    }
  }, []);

  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter text to convert");
      return;
    }

    setError(null);
    try {
      if (mode === "encode") {
        setOutput(encode(input));
      } else {
        setOutput(decode(input));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }, [input, mode, encode, decode]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setFileName(file.name);
      setError(null);

      const reader = new FileReader();

      if (mode === "encode") {
        // For encoding, read as data URL to get base64
        reader.onload = (event) => {
          const result = event.target?.result as string;
          // Extract base64 part from data URL
          const base64 = result.split(",")[1];
          setInput(result); // Keep full data URL for preview
          setOutput(base64);

          // Show preview for images
          if (file.type.startsWith("image/")) {
            setFilePreview(result);
          } else {
            setFilePreview(null);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // For decoding, read as text
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setInput(content);
          setFilePreview(null);
        };
        reader.readAsText(file);
      }

      e.target.value = "";
    },
    [mode]
  );

  const handleSwapMode = useCallback(() => {
    setMode((prev) => (prev === "encode" ? "decode" : "encode"));
    setInput(output);
    setOutput("");
    setError(null);
    setFileName(null);
    setFilePreview(null);
  }, [output]);

  const copyOutput = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const downloadOutput = useCallback(() => {
    if (!output) return;

    let blob: Blob;
    let filename: string;

    if (mode === "encode") {
      // Download as text file containing base64
      blob = new Blob([output], { type: "text/plain" });
      filename = fileName ? `${fileName}.base64.txt` : "encoded.base64.txt";
    } else {
      // Try to detect if it's an image or binary
      try {
        const binString = atob(output.replace(/\s/g, ""));
        const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
        blob = new Blob([bytes], { type: "application/octet-stream" });
        filename = "decoded.bin";
      } catch {
        blob = new Blob([output], { type: "text/plain" });
        filename = "decoded.txt";
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output, mode, fileName]);

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
    setFileName(null);
    setFilePreview(null);
  }, []);

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
          <div className="w-12 h-12 bg-brutal-success border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Binary className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black uppercase tracking-tight">
              Base64 Encoder/Decoder
            </h1>
            <div className="h-1 w-24 bg-brutal-success mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-4 font-medium">
          텍스트 또는 파일을 Base64로 인코딩/디코딩합니다. 이미지 미리보기 지원.
        </p>
      </header>

      {/* Mode Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex">
          <button
            onClick={() => {
              setMode("encode");
              clear();
            }}
            className={cn(
              "px-6 py-3 text-sm font-bold uppercase border-[3px] border-black transition-all",
              mode === "encode"
                ? "bg-brutal-success shadow-[3px_3px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                : "bg-white hover:bg-brutal-bg-alt"
            )}
          >
            Encode
          </button>
          <button
            onClick={() => {
              setMode("decode");
              clear();
            }}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Input Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setInputType("text");
                setFileName(null);
                setFilePreview(null);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase border-[2px] border-black transition-all",
                inputType === "text"
                  ? "bg-brutal-primary shadow-[2px_2px_0px_0px_#000000]"
                  : "bg-white hover:bg-brutal-bg-alt"
              )}
            >
              <FileText className="w-4 h-4" />
              Text
            </button>
            <button
              onClick={() => setInputType("file")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase border-[2px] border-black transition-all",
                inputType === "file"
                  ? "bg-brutal-primary shadow-[2px_2px_0px_0px_#000000]"
                  : "bg-white hover:bg-brutal-bg-alt"
              )}
            >
              <Image className="w-4 h-4" />
              File
            </button>
          </div>

          {/* Input Card */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {mode === "encode" ? "Text / File to Encode" : "Base64 to Decode"}
                </CardTitle>
                {inputType === "file" && (
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="w-4 h-4" />
                        Upload
                      </span>
                    </Button>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept={mode === "encode" ? "*/*" : ".txt,.base64"}
                    />
                  </label>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {inputType === "text" || !fileName ? (
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    mode === "encode"
                      ? "Enter text to encode..."
                      : "Enter Base64 string to decode..."
                  }
                  className="min-h-[200px] border-0 shadow-none focus:shadow-none focus:translate-x-0 focus:translate-y-0 font-mono text-sm"
                />
              ) : (
                <div className="p-4 min-h-[200px]">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="default">{fileName}</Badge>
                    <Button onClick={clear} variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {filePreview && (
                    <div className="border-[2px] border-black p-2 bg-brutal-bg-alt">
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="max-h-[150px] object-contain mx-auto"
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3 border-t-[2px] border-black bg-brutal-bg-alt">
                <span className="text-xs font-bold text-brutal-text-muted uppercase">
                  {input.length.toLocaleString()} chars
                </span>
                <span className="text-xs text-brutal-text-muted">
                  Ctrl+Enter to convert
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Convert Button */}
          <Button
            onClick={handleConvert}
            disabled={!input.trim()}
            className="w-full"
            size="lg"
          >
            <Binary className="w-5 h-5" />
            {mode === "encode" ? "Encode to Base64" : "Decode from Base64"}
          </Button>

          {/* Error */}
          {error && (
            <Card className="bg-brutal-danger border-black">
              <CardContent className="p-4">
                <p className="text-white font-bold text-sm">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          {output ? (
            <Card>
              <CardHeader className="border-b-[3px] border-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={mode === "encode" ? "success" : "accent"}>
                      {mode === "encode" ? "Base64" : "Decoded"}
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
                <pre className="p-4 max-h-[350px] overflow-auto font-mono text-sm bg-white whitespace-pre-wrap break-all">
                  {output}
                </pre>
                <div className="px-4 py-3 border-t-[2px] border-black bg-brutal-bg-alt">
                  <span className="text-xs font-bold text-brutal-text-muted uppercase">
                    {output.length.toLocaleString()} chars
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full min-h-[350px] flex items-center justify-center">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-6">
                  <Binary className="w-10 h-10 text-brutal-text-muted" />
                </div>
                <p className="text-brutal-text-muted font-bold uppercase tracking-wide">
                  {mode === "encode"
                    ? "Enter text or upload file to encode"
                    : "Enter Base64 string to decode"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card className="bg-brutal-bg-alt">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-brutal-text-muted font-medium">
                * Unicode 문자 완벽 지원 (한글, 이모지 등)
              </p>
              <p className="text-xs text-brutal-text-muted font-medium">
                * 파일 업로드 시 최대 10MB까지 지원
              </p>
              <p className="text-xs text-brutal-text-muted font-medium">
                * 이미지 파일은 미리보기 제공
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
