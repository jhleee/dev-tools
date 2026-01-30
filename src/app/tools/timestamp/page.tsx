"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Clock,
  Copy,
  Check,
  RefreshCw,
  ArrowRightLeft,
  Calendar,
  Globe,
  Zap,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type ConversionMode = "toDate" | "toTimestamp";

interface TimeFormat {
  id: string;
  label: string;
  format: (date: Date) => string;
}

const TIME_FORMATS: TimeFormat[] = [
  {
    id: "iso",
    label: "ISO 8601",
    format: (d) => d.toISOString(),
  },
  {
    id: "local",
    label: "Local",
    format: (d) => d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
  },
  {
    id: "utc",
    label: "UTC",
    format: (d) => d.toUTCString(),
  },
  {
    id: "date-only",
    label: "Date Only",
    format: (d) => d.toISOString().split("T")[0],
  },
  {
    id: "time-only",
    label: "Time Only",
    format: (d) => d.toISOString().split("T")[1].replace("Z", ""),
  },
  {
    id: "relative",
    label: "Relative",
    format: (d) => getRelativeTime(d),
  },
];

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const absDiff = Math.abs(diff);
  const isFuture = diff < 0;
  const prefix = isFuture ? "" : "";
  const suffix = isFuture ? " 후" : " 전";

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return `${prefix}${seconds}초${suffix}`;
  if (minutes < 60) return `${prefix}${minutes}분${suffix}`;
  if (hours < 24) return `${prefix}${hours}시간${suffix}`;
  if (days < 30) return `${prefix}${days}일${suffix}`;
  if (months < 12) return `${prefix}${months}개월${suffix}`;
  return `${prefix}${years}년${suffix}`;
}

export default function TimestampPage() {
  const [mode, setMode] = useState<ConversionMode>("toDate");
  const [timestampInput, setTimestampInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [result, setResult] = useState<Date | null>(null);
  const [resultTimestamp, setResultTimestamp] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isLiveUpdate, setIsLiveUpdate] = useState(true);

  // Live clock update
  useEffect(() => {
    if (!isLiveUpdate) return;
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveUpdate]);

  const parseTimestamp = useCallback((input: string): Date | null => {
    const cleaned = input.trim();
    if (!cleaned) return null;

    const num = parseInt(cleaned, 10);
    if (isNaN(num)) return null;

    // Detect if seconds or milliseconds
    // Unix timestamps after 2001 in seconds are ~10 digits
    // In milliseconds, they're 13 digits
    if (cleaned.length <= 10) {
      // Assume seconds
      return new Date(num * 1000);
    } else {
      // Assume milliseconds
      return new Date(num);
    }
  }, []);

  const convertToDate = useCallback(() => {
    if (!timestampInput.trim()) {
      setResult(null);
      setError(null);
      return;
    }

    const date = parseTimestamp(timestampInput);
    if (!date || isNaN(date.getTime())) {
      setError("Invalid timestamp. Enter a valid Unix timestamp.");
      setResult(null);
      return;
    }

    setResult(date);
    setError(null);
  }, [timestampInput, parseTimestamp]);

  const convertToTimestamp = useCallback(() => {
    if (!dateInput) {
      setResultTimestamp(null);
      setError(null);
      return;
    }

    try {
      const dateTimeStr = timeInput ? `${dateInput}T${timeInput}` : dateInput;
      const date = new Date(dateTimeStr);

      if (isNaN(date.getTime())) {
        setError("Invalid date format");
        setResultTimestamp(null);
        return;
      }

      setResultTimestamp(Math.floor(date.getTime() / 1000));
      setError(null);
    } catch {
      setError("Failed to parse date");
      setResultTimestamp(null);
    }
  }, [dateInput, timeInput]);

  // Auto-convert on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode === "toDate") {
        convertToDate();
      } else {
        convertToTimestamp();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [mode, convertToDate, convertToTimestamp]);

  const copyValue = useCallback((value: string, formatId: string) => {
    navigator.clipboard.writeText(value);
    setCopiedFormat(formatId);
    setTimeout(() => setCopiedFormat(null), 2000);
  }, []);

  const setNow = useCallback(() => {
    const now = new Date();
    if (mode === "toDate") {
      setTimestampInput(Math.floor(now.getTime() / 1000).toString());
    } else {
      setDateInput(now.toISOString().split("T")[0]);
      setTimeInput(now.toISOString().split("T")[1].slice(0, 8));
    }
  }, [mode]);

  const swapMode = useCallback(() => {
    if (mode === "toDate" && result) {
      setDateInput(result.toISOString().split("T")[0]);
      setTimeInput(result.toISOString().split("T")[1].slice(0, 8));
    } else if (mode === "toTimestamp" && resultTimestamp) {
      setTimestampInput(resultTimestamp.toString());
    }
    setMode((prev) => (prev === "toDate" ? "toTimestamp" : "toDate"));
    setError(null);
  }, [mode, result, resultTimestamp]);

  const currentTimestampSeconds = Math.floor(currentTime.getTime() / 1000);
  const currentTimestampMs = currentTime.getTime();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-brutal-accent border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Clock className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black uppercase tracking-tight">
              Timestamp Converter
            </h1>
            <div className="h-1 w-24 bg-brutal-accent mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-4 font-medium">
          Unix Timestamp와 날짜를 상호 변환합니다. 다양한 포맷 지원.
        </p>
      </header>

      {/* Current Time */}
      <Card className="mb-6 bg-brutal-bg-alt">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-brutal-warning" />
                <span className="text-xs font-bold uppercase text-brutal-text-muted">
                  Current Time
                </span>
              </div>
              <div className="font-mono text-sm">
                <span className="font-bold">{currentTime.toLocaleString("ko-KR")}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyValue(currentTimestampSeconds.toString(), "current-s")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border-[2px] border-black hover:bg-brutal-primary transition-colors"
                >
                  <span className="font-mono text-xs">{currentTimestampSeconds}</span>
                  {copiedFormat === "current-s" ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span className="text-xs font-bold">(s)</span>
                </button>
                <button
                  onClick={() => copyValue(currentTimestampMs.toString(), "current-ms")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border-[2px] border-black hover:bg-brutal-primary transition-colors"
                >
                  <span className="font-mono text-xs">{currentTimestampMs}</span>
                  {copiedFormat === "current-ms" ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span className="text-xs font-bold">(ms)</span>
                </button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLiveUpdate}
                  onChange={(e) => setIsLiveUpdate(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs font-bold">Live</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mode Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex">
          <button
            onClick={() => setMode("toDate")}
            className={cn(
              "px-6 py-3 text-sm font-bold uppercase border-[3px] border-black transition-all",
              mode === "toDate"
                ? "bg-brutal-accent shadow-[3px_3px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                : "bg-white hover:bg-brutal-bg-alt"
            )}
          >
            Timestamp → Date
          </button>
          <button
            onClick={() => setMode("toTimestamp")}
            className={cn(
              "px-6 py-3 text-sm font-bold uppercase border-[3px] border-l-0 border-black transition-all",
              mode === "toTimestamp"
                ? "bg-brutal-primary shadow-[3px_3px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                : "bg-white hover:bg-brutal-bg-alt"
            )}
          >
            Date → Timestamp
          </button>
        </div>

        <Button onClick={swapMode} variant="outline" size="sm">
          <ArrowRightLeft className="w-4 h-4" />
          Swap
        </Button>

        <Button onClick={setNow} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4" />
          Now
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {mode === "toDate" ? (
            <Card>
              <CardHeader className="border-b-[3px] border-black">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Unix Timestamp
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <Input
                  type="text"
                  value={timestampInput}
                  onChange={(e) => setTimestampInput(e.target.value)}
                  placeholder="Enter Unix timestamp (seconds or milliseconds)..."
                  className="font-mono text-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimestampInput("0")}
                    className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-bg-alt"
                  >
                    Epoch (0)
                  </button>
                  <button
                    onClick={() => setTimestampInput("1000000000")}
                    className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-bg-alt"
                  >
                    Y2K1 (1B)
                  </button>
                  <button
                    onClick={() => setTimestampInput("2000000000")}
                    className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-bg-alt"
                  >
                    Y2033 (2B)
                  </button>
                </div>
                <p className="text-xs text-brutal-text-muted">
                  * 10자리 이하: 초(seconds), 13자리: 밀리초(ms)로 자동 감지
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="border-b-[3px] border-black">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                      Time (optional)
                    </label>
                    <Input
                      type="time"
                      step="1"
                      value={timeInput}
                      onChange={(e) => setTimeInput(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                <p className="text-xs text-brutal-text-muted">
                  * 시간을 지정하지 않으면 00:00:00으로 계산됩니다 (로컬 시간 기준)
                </p>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {error && (
            <Card className="bg-brutal-danger border-black">
              <CardContent className="p-4">
                <p className="text-white font-bold text-sm">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Result Section */}
        <div className="space-y-4">
          {mode === "toDate" && result ? (
            <>
              <Card>
                <CardHeader className="border-b-[3px] border-black bg-brutal-accent">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Converted Date
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {TIME_FORMATS.map((format, index) => (
                    <div
                      key={format.id}
                      className={cn(
                        "flex items-center justify-between p-4",
                        index !== TIME_FORMATS.length - 1 && "border-b-[2px] border-black"
                      )}
                    >
                      <div>
                        <span className="text-xs font-bold uppercase text-brutal-text-muted block">
                          {format.label}
                        </span>
                        <span className="font-mono text-sm">
                          {format.format(result)}
                        </span>
                      </div>
                      <Button
                        onClick={() => copyValue(format.format(result), format.id)}
                        variant="outline"
                        size="sm"
                      >
                        {copiedFormat === format.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card className="bg-brutal-bg-alt">
                <CardHeader className="border-b-[2px] border-black">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Additional Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-brutal-text-muted">
                      Day of Week
                    </span>
                    <span className="font-mono text-sm">
                      {result.toLocaleDateString("ko-KR", { weekday: "long" })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-brutal-text-muted">
                      Day of Year
                    </span>
                    <span className="font-mono text-sm">
                      {Math.floor((result.getTime() - new Date(result.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-brutal-text-muted">
                      Week Number
                    </span>
                    <span className="font-mono text-sm">
                      {Math.ceil((Math.floor((result.getTime() - new Date(result.getFullYear(), 0, 1).getTime()) / (24 * 60 * 60 * 1000)) + new Date(result.getFullYear(), 0, 1).getDay() + 1) / 7)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-brutal-text-muted">
                      Timezone Offset
                    </span>
                    <span className="font-mono text-sm">
                      UTC{result.getTimezoneOffset() <= 0 ? "+" : "-"}{Math.abs(result.getTimezoneOffset() / 60)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : mode === "toTimestamp" && resultTimestamp !== null ? (
            <Card>
              <CardHeader className="border-b-[3px] border-black bg-brutal-primary">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Converted Timestamp
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b-[2px] border-black">
                  <div>
                    <span className="text-xs font-bold uppercase text-brutal-text-muted block">
                      Seconds
                    </span>
                    <span className="font-mono text-2xl font-bold">
                      {resultTimestamp}
                    </span>
                  </div>
                  <Button
                    onClick={() => copyValue(resultTimestamp.toString(), "result-s")}
                    variant="outline"
                    size="sm"
                  >
                    {copiedFormat === "result-s" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-brutal-text-muted block">
                      Milliseconds
                    </span>
                    <span className="font-mono text-2xl font-bold">
                      {resultTimestamp * 1000}
                    </span>
                  </div>
                  <Button
                    onClick={() => copyValue((resultTimestamp * 1000).toString(), "result-ms")}
                    variant="outline"
                    size="sm"
                  >
                    {copiedFormat === "result-ms" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full min-h-[300px] flex items-center justify-center">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-brutal-text-muted" />
                </div>
                <p className="text-brutal-text-muted font-bold uppercase tracking-wide">
                  {mode === "toDate"
                    ? "Enter a Unix timestamp to convert"
                    : "Select a date to convert"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
