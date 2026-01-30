"use client";

import { useState, useCallback, useEffect } from "react";
import {
  KeyRound,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  Shield,
  User,
  Calendar,
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

interface JWTPayload {
  [key: string]: unknown;
  iat?: number;
  exp?: number;
  nbf?: number;
  iss?: string;
  sub?: string;
  aud?: string | string[];
  jti?: string;
}

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: JWTPayload;
  signature: string;
  isExpired: boolean;
  expiresAt?: Date;
  issuedAt?: Date;
  notBefore?: Date;
}

function decodeBase64Url(str: string): string {
  // Add padding if needed
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4;
  if (padding) {
    base64 += "=".repeat(4 - padding);
  }

  try {
    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    return new TextDecoder().decode(bytes);
  } catch {
    throw new Error("Invalid Base64URL encoding");
  }
}

function parseJWT(token: string): DecodedJWT {
  const parts = token.trim().split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWT format: must have 3 parts separated by dots");
  }

  const [headerB64, payloadB64, signature] = parts;

  let header: Record<string, unknown>;
  let payload: JWTPayload;

  try {
    header = JSON.parse(decodeBase64Url(headerB64));
  } catch {
    throw new Error("Invalid JWT header: failed to decode or parse JSON");
  }

  try {
    payload = JSON.parse(decodeBase64Url(payloadB64));
  } catch {
    throw new Error("Invalid JWT payload: failed to decode or parse JSON");
  }

  const now = Math.floor(Date.now() / 1000);
  const isExpired = payload.exp ? payload.exp < now : false;

  return {
    header,
    payload,
    signature,
    isExpired,
    expiresAt: payload.exp ? new Date(payload.exp * 1000) : undefined,
    issuedAt: payload.iat ? new Date(payload.iat * 1000) : undefined,
    notBefore: payload.nbf ? new Date(payload.nbf * 1000) : undefined,
  };
}

function formatDate(date: Date): string {
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) {
    const elapsed = Math.abs(diff);
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}일 ${hours}시간 전 만료됨`;
    if (hours > 0) return `${hours}시간 ${minutes}분 전 만료됨`;
    return `${minutes}분 전 만료됨`;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}일 ${hours}시간 후 만료`;
  if (hours > 0) return `${hours}시간 ${minutes}분 후 만료`;
  return `${minutes}분 후 만료`;
}

export default function JWTDecoderPage() {
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const decode = useCallback(() => {
    if (!input.trim()) {
      setDecoded(null);
      setError(null);
      return;
    }

    try {
      const result = parseJWT(input);
      setDecoded(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to decode JWT");
      setDecoded(null);
    }
  }, [input]);

  // Auto-decode on input change
  useEffect(() => {
    const timer = setTimeout(decode, 300);
    return () => clearTimeout(timer);
  }, [decode]);

  // Refresh expiration status
  useEffect(() => {
    if (!autoRefresh || !decoded?.expiresAt) return;

    const interval = setInterval(() => {
      if (input.trim()) {
        decode();
      }
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [autoRefresh, decoded, input, decode]);

  const copySection = useCallback((section: string, content: unknown) => {
    const text = typeof content === "string" ? content : JSON.stringify(content, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  }, []);

  const clear = useCallback(() => {
    setInput("");
    setDecoded(null);
    setError(null);
  }, []);

  const sampleJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.4S-LxK3K8A3lrv1PNRZT9FVf6bQJ_Xk5N5R8hYQO_Ak";

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brutal-warning border-[2px] md:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] md:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <KeyRound className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black uppercase tracking-tight">
              JWT Decoder
            </h1>
            <div className="h-1 w-16 md:w-24 bg-brutal-warning mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-3 md:mt-4 font-medium text-sm md:text-base">
          JWT 토큰을 파싱하여 Header, Payload, Signature를 확인합니다. 만료 시간 자동 체크.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">JWT Token</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setInput(sampleJWT)}
                    variant="outline"
                    size="sm"
                  >
                    Sample
                  </Button>
                  <Button onClick={clear} variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your JWT token here (eyJhbGc...)..."
                className="min-h-[180px] border-0 shadow-none focus:shadow-none focus:translate-x-0 focus:translate-y-0 font-mono text-sm"
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

          {/* Token Status */}
          {decoded && (
            <Card className={cn(
              "border-black",
              decoded.isExpired ? "bg-brutal-danger" : "bg-brutal-success"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {decoded.isExpired ? (
                      <AlertTriangle className="w-6 h-6 text-white" />
                    ) : (
                      <Shield className="w-6 h-6 text-black" />
                    )}
                    <div>
                      <p className={cn(
                        "font-bold text-sm uppercase",
                        decoded.isExpired ? "text-white" : "text-black"
                      )}>
                        {decoded.isExpired ? "Token Expired" : "Token Valid"}
                      </p>
                      {decoded.expiresAt && (
                        <p className={cn(
                          "text-xs mt-1",
                          decoded.isExpired ? "text-white/80" : "text-black/70"
                        )}>
                          {getTimeRemaining(decoded.expiresAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className={cn(
                      "text-xs font-bold",
                      decoded.isExpired ? "text-white" : "text-black"
                    )}>
                      Auto Refresh
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Decoded Section */}
        <div className="space-y-4">
          {decoded ? (
            <>
              {/* Header */}
              <Card>
                <CardHeader className="border-b-[3px] border-black bg-brutal-accent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">HEADER</Badge>
                      <span className="text-xs font-bold text-black">
                        Algorithm & Token Type
                      </span>
                    </div>
                    <Button
                      onClick={() => copySection("header", decoded.header)}
                      variant="outline"
                      size="sm"
                    >
                      {copiedSection === "header" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="p-4 font-mono text-sm bg-white overflow-auto max-h-[120px]">
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Payload */}
              <Card>
                <CardHeader className="border-b-[3px] border-black bg-brutal-primary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">PAYLOAD</Badge>
                      <span className="text-xs font-bold text-black">
                        Claims & Data
                      </span>
                    </div>
                    <Button
                      onClick={() => copySection("payload", decoded.payload)}
                      variant="outline"
                      size="sm"
                    >
                      {copiedSection === "payload" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="p-4 font-mono text-sm bg-white overflow-auto max-h-[200px]">
                    {JSON.stringify(decoded.payload, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Signature */}
              <Card>
                <CardHeader className="border-b-[3px] border-black bg-brutal-secondary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">SIGNATURE</Badge>
                      <span className="text-xs font-bold text-black">
                        Verify Signature
                      </span>
                    </div>
                    <Button
                      onClick={() => copySection("signature", decoded.signature)}
                      variant="outline"
                      size="sm"
                    >
                      {copiedSection === "signature" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="font-mono text-xs bg-brutal-bg-alt p-3 border-[2px] border-black break-all">
                    {decoded.signature}
                  </p>
                </CardContent>
              </Card>

              {/* Time Claims */}
              {(decoded.issuedAt || decoded.expiresAt || decoded.notBefore) && (
                <Card className="bg-brutal-bg-alt">
                  <CardHeader className="border-b-[2px] border-black">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time Claims
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {decoded.issuedAt && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-brutal-text-muted" />
                        <div>
                          <span className="text-xs font-bold uppercase text-brutal-text-muted">
                            Issued At (iat)
                          </span>
                          <p className="font-mono text-sm">
                            {formatDate(decoded.issuedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {decoded.expiresAt && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-brutal-text-muted" />
                        <div>
                          <span className="text-xs font-bold uppercase text-brutal-text-muted">
                            Expires At (exp)
                          </span>
                          <p className={cn(
                            "font-mono text-sm",
                            decoded.isExpired && "text-brutal-danger font-bold"
                          )}>
                            {formatDate(decoded.expiresAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {decoded.notBefore && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-brutal-text-muted" />
                        <div>
                          <span className="text-xs font-bold uppercase text-brutal-text-muted">
                            Not Before (nbf)
                          </span>
                          <p className="font-mono text-sm">
                            {formatDate(decoded.notBefore)}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-6">
                  <KeyRound className="w-10 h-10 text-brutal-text-muted" />
                </div>
                <p className="text-brutal-text-muted font-bold uppercase tracking-wide">
                  JWT 토큰을 입력하면 자동으로 디코딩됩니다
                </p>
                <p className="text-brutal-text-muted text-xs mt-2">
                  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
