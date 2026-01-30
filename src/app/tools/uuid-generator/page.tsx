"use client";

import { useState, useCallback } from "react";
import {
  Fingerprint,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Plus,
  Download,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type UUIDVersion = "v4" | "v7";
type UUIDFormat = "lowercase" | "uppercase" | "no-hyphens";

interface GeneratedUUID {
  id: string;
  uuid: string;
  timestamp?: Date;
}

function generateUUIDv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateUUIDv7(): string {
  // UUID v7 is time-based
  const timestamp = Date.now();
  const timestampHex = timestamp.toString(16).padStart(12, "0");

  // Random bits
  const randomBits = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 65536)
      .toString(16)
      .padStart(4, "0")
  ).join("");

  // Format: tttttttt-tttt-7xxx-yxxx-xxxxxxxxxxxx
  const uuid = [
    timestampHex.slice(0, 8),
    timestampHex.slice(8, 12),
    "7" + randomBits.slice(0, 3),
    ((parseInt(randomBits.slice(3, 4), 16) & 0x3) | 0x8).toString(16) +
      randomBits.slice(4, 7),
    randomBits.slice(7, 19) || generateRandomHex(12),
  ].join("-");

  return uuid;
}

function generateRandomHex(length: number): string {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function formatUUID(uuid: string, format: UUIDFormat): string {
  switch (format) {
    case "uppercase":
      return uuid.toUpperCase();
    case "no-hyphens":
      return uuid.replace(/-/g, "");
    default:
      return uuid.toLowerCase();
  }
}

function parseUUID(input: string): {
  valid: boolean;
  version?: string;
  timestamp?: Date;
} {
  const cleaned = input.replace(/-/g, "").toLowerCase();

  if (cleaned.length !== 32) {
    return { valid: false };
  }

  if (!/^[0-9a-f]{32}$/.test(cleaned)) {
    return { valid: false };
  }

  // Get version from the 13th character (index 12)
  const versionChar = cleaned[12];
  let version = "Unknown";
  let timestamp: Date | undefined;

  switch (versionChar) {
    case "1":
      version = "v1 (Time-based)";
      break;
    case "2":
      version = "v2 (DCE Security)";
      break;
    case "3":
      version = "v3 (MD5 Hash)";
      break;
    case "4":
      version = "v4 (Random)";
      break;
    case "5":
      version = "v5 (SHA-1 Hash)";
      break;
    case "6":
      version = "v6 (Reordered Time)";
      break;
    case "7":
      version = "v7 (Unix Epoch Time)";
      // Extract timestamp from v7
      const timestampHex = cleaned.slice(0, 12);
      const timestampMs = parseInt(timestampHex, 16);
      if (!isNaN(timestampMs)) {
        timestamp = new Date(timestampMs);
      }
      break;
    case "8":
      version = "v8 (Custom)";
      break;
    default:
      version = `Unknown (${versionChar})`;
  }

  // Check variant (should be 8, 9, a, or b at position 16)
  const variantChar = cleaned[16];
  const variantNum = parseInt(variantChar, 16);
  if (variantNum < 8 || variantNum > 11) {
    return { valid: false };
  }

  return { valid: true, version, timestamp };
}

export default function UUIDGeneratorPage() {
  const [version, setVersion] = useState<UUIDVersion>("v4");
  const [format, setFormat] = useState<UUIDFormat>("lowercase");
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<GeneratedUUID[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [validateInput, setValidateInput] = useState("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    version?: string;
    timestamp?: Date;
  } | null>(null);

  const generate = useCallback(() => {
    const newUuids: GeneratedUUID[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const uuid =
        version === "v4" ? generateUUIDv4() : generateUUIDv7();
      newUuids.push({
        id: `${Date.now()}-${i}`,
        uuid: formatUUID(uuid, format),
        timestamp: version === "v7" ? now : undefined,
      });
    }

    setUuids((prev) => [...newUuids, ...prev]);
  }, [version, format, count]);

  const copyUuid = useCallback((id: string, uuid: string) => {
    navigator.clipboard.writeText(uuid);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const copyAll = useCallback(() => {
    const allUuids = uuids.map((u) => u.uuid).join("\n");
    navigator.clipboard.writeText(allUuids);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }, [uuids]);

  const downloadAll = useCallback(() => {
    const allUuids = uuids.map((u) => u.uuid).join("\n");
    const blob = new Blob([allUuids], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids-${version}-${uuids.length}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [uuids, version]);

  const clear = useCallback(() => {
    setUuids([]);
  }, []);

  const removeUuid = useCallback((id: string) => {
    setUuids((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const handleValidate = useCallback(() => {
    if (!validateInput.trim()) {
      setValidationResult(null);
      return;
    }
    setValidationResult(parseUUID(validateInput));
  }, [validateInput]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brutal-secondary border-[2px] md:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] md:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Fingerprint className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black uppercase tracking-tight">
              UUID Generator
            </h1>
            <div className="h-1 w-16 md:w-24 bg-brutal-secondary mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-3 md:mt-4 font-medium text-sm md:text-base">
          UUID v4 (Random) 또는 v7 (Time-based)를 생성합니다. 대량 생성 및 검증 지원.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Generator Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <CardTitle className="text-sm">Generator Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Version */}
              <div>
                <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                  Version
                </label>
                <div className="flex">
                  <button
                    onClick={() => setVersion("v4")}
                    className={cn(
                      "flex-1 px-4 py-3 text-sm font-bold uppercase border-[3px] border-black transition-all",
                      version === "v4"
                        ? "bg-brutal-secondary shadow-[3px_3px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                        : "bg-white hover:bg-brutal-bg-alt"
                    )}
                  >
                    UUID v4
                    <span className="block text-xs font-normal mt-1">Random</span>
                  </button>
                  <button
                    onClick={() => setVersion("v7")}
                    className={cn(
                      "flex-1 px-4 py-3 text-sm font-bold uppercase border-[3px] border-l-0 border-black transition-all",
                      version === "v7"
                        ? "bg-brutal-accent shadow-[3px_3px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                        : "bg-white hover:bg-brutal-bg-alt"
                    )}
                  >
                    UUID v7
                    <span className="block text-xs font-normal mt-1">Time-based</span>
                  </button>
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                  Format
                </label>
                <div className="flex gap-2">
                  {(["lowercase", "uppercase", "no-hyphens"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={cn(
                        "flex-1 px-3 py-2 text-xs font-bold uppercase border-[2px] border-black transition-all",
                        format === f
                          ? "bg-brutal-primary shadow-[2px_2px_0px_0px_#000000]"
                          : "bg-white hover:bg-brutal-bg-alt"
                      )}
                    >
                      {f === "no-hyphens" ? "No Hyphens" : f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count */}
              <div>
                <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                  Count
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={count}
                    onChange={(e) =>
                      setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))
                    }
                    className="w-24 font-mono"
                  />
                  <div className="flex gap-1">
                    {[1, 5, 10, 25].map((n) => (
                      <button
                        key={n}
                        onClick={() => setCount(n)}
                        className={cn(
                          "px-3 py-2 text-xs font-bold border-[2px] border-black transition-all",
                          count === n
                            ? "bg-brutal-primary"
                            : "bg-white hover:bg-brutal-bg-alt"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <Button onClick={generate} className="w-full" size="lg">
                <Plus className="w-5 h-5" />
                Generate {count} UUID{count > 1 ? "s" : ""}
              </Button>
            </CardContent>
          </Card>

          {/* Validator */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <CardTitle className="text-sm">UUID Validator</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={validateInput}
                  onChange={(e) => {
                    setValidateInput(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder="Enter UUID to validate..."
                  className="flex-1 font-mono text-sm"
                />
                <Button onClick={handleValidate} variant="outline">
                  Check
                </Button>
              </div>

              {validationResult && (
                <div
                  className={cn(
                    "p-4 border-[2px] border-black",
                    validationResult.valid ? "bg-brutal-success" : "bg-brutal-danger"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={validationResult.valid ? "success" : "default"}>
                      {validationResult.valid ? "Valid UUID" : "Invalid UUID"}
                    </Badge>
                  </div>
                  {validationResult.valid && (
                    <>
                      <p className="text-sm font-bold">
                        Version: {validationResult.version}
                      </p>
                      {validationResult.timestamp && (
                        <p className="text-xs mt-1">
                          Timestamp: {validationResult.timestamp.toLocaleString("ko-KR")}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {uuids.length > 0 ? (
            <Card>
              <CardHeader className="border-b-[3px] border-black bg-brutal-secondary">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Fingerprint className="w-4 h-4" />
                    Generated UUIDs ({uuids.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={downloadAll} variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button onClick={copyAll} variant="outline" size="sm">
                      {copiedAll ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          All
                        </>
                      )}
                    </Button>
                    <Button onClick={clear} variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-auto divide-y-[2px] divide-black">
                  {uuids.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 hover:bg-brutal-bg-alt group"
                    >
                      <div className="flex-1 min-w-0">
                        <code className="font-mono text-sm break-all">
                          {item.uuid}
                        </code>
                        {item.timestamp && (
                          <p className="text-xs text-brutal-text-muted mt-1">
                            {item.timestamp.toLocaleString("ko-KR")}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          onClick={() => copyUuid(item.id, item.uuid)}
                          variant="ghost"
                          size="sm"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => removeUuid(item.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-6">
                  <Fingerprint className="w-10 h-10 text-brutal-text-muted" />
                </div>
                <p className="text-brutal-text-muted font-bold uppercase tracking-wide">
                  Click Generate to create UUIDs
                </p>
                <p className="text-brutal-text-muted text-xs mt-2">
                  Up to 100 UUIDs at once
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card className="bg-brutal-bg-alt">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-brutal-text-muted font-medium">
                <strong>UUID v4:</strong> 랜덤 기반, 충돌 확률 극히 낮음
              </p>
              <p className="text-xs text-brutal-text-muted font-medium">
                <strong>UUID v7:</strong> 시간 기반, 정렬 가능, DB 인덱싱에 유리
              </p>
              <p className="text-xs text-brutal-text-muted font-medium">
                * 모든 UUID는 RFC 4122 / RFC 9562 표준 준수
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
