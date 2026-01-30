"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Shield,
  Copy,
  Check,
  Trash2,
  Upload,
  FileText,
  RefreshCw,
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

type InputType = "text" | "file";

interface HashResult {
  algorithm: string;
  hash: string;
  length: number;
}

const ALGORITHMS = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;

async function computeHash(
  algorithm: string,
  data: ArrayBuffer
): Promise<string> {
  // Map algorithm names to Web Crypto API names
  const algoMap: Record<string, string> = {
    "MD5": "MD5", // Note: MD5 not supported in Web Crypto, will use fallback
    "SHA-1": "SHA-1",
    "SHA-256": "SHA-256",
    "SHA-384": "SHA-384",
    "SHA-512": "SHA-512",
  };

  const cryptoAlgo = algoMap[algorithm];

  if (algorithm === "MD5") {
    // MD5 implementation (simple for demo)
    return md5(new Uint8Array(data));
  }

  const hashBuffer = await crypto.subtle.digest(cryptoAlgo, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Simple MD5 implementation
function md5(data: Uint8Array): string {
  const K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
    0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
    0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
    0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
    0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
    0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ];

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
    9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
    16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10,
    15, 21,
  ];

  function leftRotate(x: number, c: number): number {
    return ((x << c) | (x >>> (32 - c))) >>> 0;
  }

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const originalLength = data.length;
  const paddingLength = (56 - ((originalLength + 1) % 64) + 64) % 64;
  const totalLength = originalLength + 1 + paddingLength + 8;

  const padded = new Uint8Array(totalLength);
  padded.set(data);
  padded[originalLength] = 0x80;

  const lengthBits = BigInt(originalLength) * BigInt(8);
  const view = new DataView(padded.buffer);
  view.setUint32(totalLength - 8, Number(lengthBits & BigInt(0xffffffff)), true);
  view.setUint32(totalLength - 4, Number(lengthBits >> BigInt(32)), true);

  for (let i = 0; i < totalLength; i += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = view.getUint32(i + j * 4, true);
    }

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let j = 0; j < 64; j++) {
      let F: number;
      let g: number;

      if (j < 16) {
        F = (B & C) | (~B & D);
        g = j;
      } else if (j < 32) {
        F = (D & B) | (~D & C);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        F = B ^ C ^ D;
        g = (3 * j + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * j) % 16;
      }

      F = (F + A + K[j] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + leftRotate(F, S[j])) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const result = new Uint8Array(16);
  const resultView = new DataView(result.buffer);
  resultView.setUint32(0, a0, true);
  resultView.setUint32(4, b0, true);
  resultView.setUint32(8, c0, true);
  resultView.setUint32(12, d0, true);

  return Array.from(result)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function HashGeneratorPage() {
  const [inputType, setInputType] = useState<InputType>("text");
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [results, setResults] = useState<HashResult[]>([]);
  const [isComputing, setIsComputing] = useState(false);
  const [copiedAlgo, setCopiedAlgo] = useState<string | null>(null);
  const [uppercase, setUppercase] = useState(false);

  const computeAllHashes = useCallback(async () => {
    let data: ArrayBuffer;

    if (inputType === "text") {
      if (!input) {
        setResults([]);
        return;
      }
      data = new TextEncoder().encode(input).buffer;
    } else {
      if (!fileData) {
        setResults([]);
        return;
      }
      data = fileData;
    }

    setIsComputing(true);

    try {
      const newResults: HashResult[] = [];

      for (const algo of ALGORITHMS) {
        const hash = await computeHash(algo, data);
        newResults.push({
          algorithm: algo,
          hash: uppercase ? hash.toUpperCase() : hash,
          length: hash.length,
        });
      }

      setResults(newResults);
    } catch (error) {
      console.error("Hash computation error:", error);
    } finally {
      setIsComputing(false);
    }
  }, [input, inputType, fileData, uppercase]);

  // Auto-compute on input change
  useEffect(() => {
    const timer = setTimeout(computeAllHashes, 300);
    return () => clearTimeout(timer);
  }, [computeAllHashes]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 100 * 1024 * 1024) {
        alert("File size must be less than 100MB");
        return;
      }

      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        setFileData(event.target?.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(file);

      e.target.value = "";
    },
    []
  );

  const copyHash = useCallback(
    (algo: string, hash: string) => {
      navigator.clipboard.writeText(uppercase ? hash.toUpperCase() : hash);
      setCopiedAlgo(algo);
      setTimeout(() => setCopiedAlgo(null), 2000);
    },
    [uppercase]
  );

  const clear = useCallback(() => {
    setInput("");
    setFileName(null);
    setFileData(null);
    setResults([]);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        computeAllHashes();
      }
    },
    [computeAllHashes]
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brutal-danger border-[2px] md:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] md:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black uppercase tracking-tight">
              Hash Generator
            </h1>
            <div className="h-1 w-16 md:w-24 bg-brutal-danger mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-3 md:mt-4 font-medium text-sm md:text-base">
          텍스트 또는 파일의 해시값을 생성합니다. MD5, SHA-1, SHA-256, SHA-384, SHA-512 지원.
        </p>
      </header>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex">
          <button
            onClick={() => {
              setInputType("text");
              setFileName(null);
              setFileData(null);
            }}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase border-[3px] border-black transition-all",
              inputType === "text"
                ? "bg-brutal-danger text-white shadow-[3px_3px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                : "bg-white hover:bg-brutal-bg-alt"
            )}
          >
            <FileText className="w-4 h-4" />
            Text
          </button>
          <button
            onClick={() => setInputType("file")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase border-[3px] border-l-0 border-black transition-all",
              inputType === "file"
                ? "bg-brutal-danger text-white shadow-[3px_3px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                : "bg-white hover:bg-brutal-bg-alt"
            )}
          >
            <Upload className="w-4 h-4" />
            File
          </button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border-[2px] border-black bg-white hover:bg-brutal-bg-alt">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-xs font-bold uppercase">Uppercase</span>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {inputType === "text" ? "Input Text" : "Input File"}
                </CardTitle>
                <div className="flex gap-2">
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
                      />
                    </label>
                  )}
                  <Button onClick={clear} variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {inputType === "text" ? (
                <>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter text to hash..."
                    className="min-h-[200px] border-0 shadow-none focus:shadow-none focus:translate-x-0 focus:translate-y-0 font-mono text-sm"
                  />
                  <div className="px-4 py-3 border-t-[2px] border-black bg-brutal-bg-alt">
                    <span className="text-xs font-bold text-brutal-text-muted uppercase">
                      {input.length.toLocaleString()} chars |{" "}
                      {new TextEncoder().encode(input).length.toLocaleString()} bytes
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-6 min-h-[200px] flex items-center justify-center">
                  {fileName ? (
                    <div className="text-center">
                      <Badge variant="success" className="mb-2">
                        {fileName}
                      </Badge>
                      <p className="text-xs text-brutal-text-muted">
                        {fileData
                          ? `${(fileData.byteLength / 1024).toFixed(2)} KB`
                          : "Loading..."}
                      </p>
                    </div>
                  ) : (
                    <label className="cursor-pointer text-center">
                      <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-dashed border-black flex items-center justify-center mx-auto mb-4 hover:bg-brutal-danger hover:text-white transition-colors">
                        <Upload className="w-10 h-10" />
                      </div>
                      <p className="text-brutal-text-muted font-bold uppercase text-sm">
                        Click to upload file
                      </p>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {isComputing ? (
            <Card className="flex items-center justify-center min-h-[350px]">
              <CardContent className="text-center p-12">
                <RefreshCw className="w-12 h-12 text-brutal-text-muted animate-spin mx-auto mb-4" />
                <p className="text-brutal-text-muted font-bold uppercase">
                  Computing hashes...
                </p>
              </CardContent>
            </Card>
          ) : results.length > 0 ? (
            <Card>
              <CardHeader className="border-b-[3px] border-black bg-brutal-danger">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Hash Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y-[2px] divide-black">
                {results.map((result) => (
                  <div key={result.algorithm} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            result.algorithm === "MD5"
                              ? "warning"
                              : result.algorithm === "SHA-1"
                              ? "warning"
                              : "success"
                          }
                        >
                          {result.algorithm}
                        </Badge>
                        <span className="text-xs text-brutal-text-muted">
                          {result.length * 4} bits
                        </span>
                      </div>
                      <Button
                        onClick={() => copyHash(result.algorithm, result.hash)}
                        variant="outline"
                        size="sm"
                      >
                        {copiedAlgo === result.algorithm ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <code className="block font-mono text-xs bg-brutal-bg-alt p-2 border-[2px] border-black break-all">
                      {uppercase ? result.hash.toUpperCase() : result.hash}
                    </code>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full min-h-[350px] flex items-center justify-center">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-brutal-text-muted" />
                </div>
                <p className="text-brutal-text-muted font-bold uppercase tracking-wide">
                  {inputType === "text"
                    ? "Enter text to generate hashes"
                    : "Upload a file to generate hashes"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Security Note */}
          <Card className="bg-brutal-bg-alt">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-brutal-text-muted font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-brutal-warning rounded-full"></span>
                MD5, SHA-1은 보안 목적으로 사용하지 마세요 (충돌 취약점)
              </p>
              <p className="text-xs text-brutal-text-muted font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-brutal-success rounded-full"></span>
                SHA-256 이상 권장
              </p>
              <p className="text-xs text-brutal-text-muted font-medium">
                * 모든 계산은 브라우저에서 수행됩니다 (서버 전송 없음)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
