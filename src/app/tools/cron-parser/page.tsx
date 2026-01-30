"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Clock,
  Copy,
  Check,
  Trash2,
  Calendar,
  AlertTriangle,
  Play,
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

interface CronField {
  name: string;
  min: number;
  max: number;
  value: string;
  description: string;
}

interface ParsedCron {
  valid: boolean;
  description: string;
  nextRuns: Date[];
  error?: string;
}

const CRON_PRESETS = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every day at midnight", cron: "0 0 * * *" },
  { label: "Every day at 9am", cron: "0 9 * * *" },
  { label: "Every Monday at 9am", cron: "0 9 * * 1" },
  { label: "Every weekday at 9am", cron: "0 9 * * 1-5" },
  { label: "First day of month", cron: "0 0 1 * *" },
  { label: "Every 15 minutes", cron: "*/15 * * * *" },
  { label: "Every 6 hours", cron: "0 */6 * * *" },
  { label: "Twice a day", cron: "0 9,18 * * *" },
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function parseField(value: string, min: number, max: number): number[] | null {
  const results: Set<number> = new Set();

  const parts = value.split(",");
  for (const part of parts) {
    // Handle step values: */5 or 1-10/2
    const stepMatch = part.match(/^(.+)\/(\d+)$/);
    let range = stepMatch ? stepMatch[1] : part;
    const step = stepMatch ? parseInt(stepMatch[2]) : 1;

    if (range === "*") {
      for (let i = min; i <= max; i += step) {
        results.add(i);
      }
    } else if (range.includes("-")) {
      const [start, end] = range.split("-").map(Number);
      if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) {
        return null;
      }
      for (let i = start; i <= end; i += step) {
        results.add(i);
      }
    } else {
      const num = parseInt(range);
      if (isNaN(num) || num < min || num > max) {
        return null;
      }
      results.add(num);
    }
  }

  return Array.from(results).sort((a, b) => a - b);
}

function describeCron(parts: string[]): string {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  let desc = "Runs ";

  // Day of week
  if (dayOfWeek !== "*") {
    const days = parseField(dayOfWeek, 0, 6);
    if (days && days.length < 7) {
      if (days.length === 5 && days.join(",") === "1,2,3,4,5") {
        desc += "on weekdays ";
      } else if (days.length === 2 && days.join(",") === "0,6") {
        desc += "on weekends ";
      } else {
        desc += `on ${days.map(d => DAY_NAMES[d]).join(", ")} `;
      }
    }
  }

  // Day of month
  if (dayOfMonth !== "*") {
    const days = parseField(dayOfMonth, 1, 31);
    if (days) {
      desc += `on day ${days.join(", ")} of the month `;
    }
  }

  // Month
  if (month !== "*") {
    const months = parseField(month, 1, 12);
    if (months && months.length < 12) {
      desc += `in ${months.map(m => MONTH_NAMES[m - 1]).join(", ")} `;
    }
  }

  // Time
  if (minute === "*" && hour === "*") {
    desc += "every minute";
  } else if (minute.startsWith("*/")) {
    const interval = parseInt(minute.slice(2));
    desc += `every ${interval} minutes`;
  } else if (hour === "*") {
    const mins = parseField(minute, 0, 59);
    if (mins && mins.length === 1) {
      desc += `at minute ${mins[0]} of every hour`;
    } else {
      desc += `at minutes ${mins?.join(", ")} of every hour`;
    }
  } else if (hour.startsWith("*/")) {
    const interval = parseInt(hour.slice(2));
    const mins = parseField(minute, 0, 59);
    desc += `every ${interval} hours at minute ${mins?.[0] ?? 0}`;
  } else {
    const hours = parseField(hour, 0, 23);
    const mins = parseField(minute, 0, 59);
    if (hours && mins) {
      const times = hours.map(h => {
        const m = mins[0] ?? 0;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      });
      desc += `at ${times.join(", ")}`;
    }
  }

  return desc;
}

function getNextRuns(parts: string[], count: number = 5): Date[] {
  const [minuteStr, hourStr, dayOfMonthStr, monthStr, dayOfWeekStr] = parts;

  const minutes = parseField(minuteStr, 0, 59);
  const hours = parseField(hourStr, 0, 23);
  const daysOfMonth = parseField(dayOfMonthStr, 1, 31);
  const months = parseField(monthStr, 1, 12);
  const daysOfWeek = parseField(dayOfWeekStr, 0, 6);

  if (!minutes || !hours || !daysOfMonth || !months || !daysOfWeek) {
    return [];
  }

  const results: Date[] = [];
  const now = new Date();
  const current = new Date(now);
  current.setSeconds(0);
  current.setMilliseconds(0);

  const maxIterations = 366 * 24 * 60; // Max 1 year of minutes
  let iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    iterations++;
    current.setMinutes(current.getMinutes() + 1);

    const m = current.getMinutes();
    const h = current.getHours();
    const dom = current.getDate();
    const mon = current.getMonth() + 1;
    const dow = current.getDay();

    if (
      minutes.includes(m) &&
      hours.includes(h) &&
      months.includes(mon) &&
      (daysOfMonth.includes(dom) || daysOfWeek.includes(dow) ||
       (dayOfMonthStr === "*" && dayOfWeekStr === "*"))
    ) {
      // Check day constraints
      const domMatch = dayOfMonthStr === "*" || daysOfMonth.includes(dom);
      const dowMatch = dayOfWeekStr === "*" || daysOfWeek.includes(dow);

      if ((dayOfMonthStr === "*" && dayOfWeekStr === "*") || domMatch || dowMatch) {
        results.push(new Date(current));
      }
    }
  }

  return results;
}

function parseCron(expression: string): ParsedCron {
  const trimmed = expression.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length !== 5) {
    return {
      valid: false,
      description: "",
      nextRuns: [],
      error: `Expected 5 fields, got ${parts.length}. Format: minute hour day month weekday`,
    };
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Validate each field
  if (!parseField(minute, 0, 59)) {
    return { valid: false, description: "", nextRuns: [], error: "Invalid minute field (0-59)" };
  }
  if (!parseField(hour, 0, 23)) {
    return { valid: false, description: "", nextRuns: [], error: "Invalid hour field (0-23)" };
  }
  if (!parseField(dayOfMonth, 1, 31)) {
    return { valid: false, description: "", nextRuns: [], error: "Invalid day of month field (1-31)" };
  }
  if (!parseField(month, 1, 12)) {
    return { valid: false, description: "", nextRuns: [], error: "Invalid month field (1-12)" };
  }
  if (!parseField(dayOfWeek, 0, 6)) {
    return { valid: false, description: "", nextRuns: [], error: "Invalid day of week field (0-6, 0=Sunday)" };
  }

  return {
    valid: true,
    description: describeCron(parts),
    nextRuns: getNextRuns(parts, 10),
  };
}

export default function CronParserPage() {
  const [expression, setExpression] = useState("0 9 * * 1-5");
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseCron(expression), [expression]);

  const copyExpression = useCallback(() => {
    navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [expression]);

  const clear = useCallback(() => {
    setExpression("");
  }, []);

  const parts = expression.trim().split(/\s+/);
  const fields: CronField[] = [
    { name: "Minute", min: 0, max: 59, value: parts[0] || "", description: "0-59" },
    { name: "Hour", min: 0, max: 23, value: parts[1] || "", description: "0-23" },
    { name: "Day of Month", min: 1, max: 31, value: parts[2] || "", description: "1-31" },
    { name: "Month", min: 1, max: 12, value: parts[3] || "", description: "1-12" },
    { name: "Day of Week", min: 0, max: 6, value: parts[4] || "", description: "0-6 (Sun-Sat)" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-brutal-warning border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Clock className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black uppercase tracking-tight">
              Cron Parser
            </h1>
            <div className="h-1 w-24 bg-brutal-warning mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-4 font-medium">
          Cron 표현식을 해석하고 다음 실행 시간을 계산합니다.
        </p>
      </header>

      {/* Presets */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase text-brutal-text-muted mb-2">
          Common Presets:
        </p>
        <div className="flex flex-wrap gap-2">
          {CRON_PRESETS.map((preset) => (
            <button
              key={preset.cron}
              onClick={() => setExpression(preset.cron)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold border-[2px] border-black transition-all",
                expression === preset.cron
                  ? "bg-brutal-warning shadow-[2px_2px_0px_0px_#000000]"
                  : "bg-white hover:bg-brutal-bg-alt"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Cron Expression</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={copyExpression} variant="outline" size="sm">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button onClick={clear} variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="* * * * *"
                className="font-mono text-xl text-center tracking-widest"
              />
            </CardContent>
          </Card>

          {/* Field Breakdown */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <CardTitle className="text-sm">Field Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-5 divide-x-[2px] divide-black">
                {fields.map((field, index) => (
                  <div key={field.name} className="p-3 text-center">
                    <div className={cn(
                      "font-mono text-lg font-bold mb-1 px-2 py-1 border-[2px] border-black",
                      field.value ? "bg-brutal-primary" : "bg-brutal-bg-alt"
                    )}>
                      {field.value || "*"}
                    </div>
                    <p className="text-xs font-bold uppercase mt-2">{field.name}</p>
                    <p className="text-xs text-brutal-text-muted">{field.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Syntax Help */}
          <Card className="bg-brutal-bg-alt">
            <CardHeader className="border-b-[2px] border-black">
              <CardTitle className="text-sm">Syntax Reference</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <span><code className="bg-white px-1 border border-black">*</code> any value</span>
                <span><code className="bg-white px-1 border border-black">,</code> list (1,3,5)</span>
                <span><code className="bg-white px-1 border border-black">-</code> range (1-5)</span>
                <span><code className="bg-white px-1 border border-black">/</code> step (*/15)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {/* Description */}
          <Card className={cn(
            "border-black",
            parsed.valid ? "bg-brutal-success" : "bg-brutal-danger"
          )}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {parsed.valid ? (
                  <Play className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={cn(
                    "font-bold text-sm",
                    parsed.valid ? "text-black" : "text-white"
                  )}>
                    {parsed.valid ? parsed.description : parsed.error}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Runs */}
          {parsed.valid && parsed.nextRuns.length > 0 && (
            <Card>
              <CardHeader className="border-b-[3px] border-black bg-brutal-warning">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Next {parsed.nextRuns.length} Runs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y-[2px] divide-black max-h-[400px] overflow-auto">
                  {parsed.nextRuns.map((date, index) => {
                    const now = new Date();
                    const diff = date.getTime() - now.getTime();
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                    let relativeTime = "";
                    if (days > 0) relativeTime = `in ${days}d ${hours}h`;
                    else if (hours > 0) relativeTime = `in ${hours}h ${minutes}m`;
                    else relativeTime = `in ${minutes}m`;

                    return (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-brutal-bg-alt">
                        <div className="flex items-center gap-3">
                          <Badge variant="default">#{index + 1}</Badge>
                          <div>
                            <p className="font-mono text-sm font-bold">
                              {date.toLocaleString("ko-KR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                weekday: "short",
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="accent">{relativeTime}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!expression && (
            <Card className="flex items-center justify-center min-h-[200px]">
              <CardContent className="text-center p-12">
                <Clock className="w-16 h-16 text-brutal-text-muted mx-auto mb-4" />
                <p className="text-brutal-text-muted font-bold uppercase">
                  Enter a cron expression
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
