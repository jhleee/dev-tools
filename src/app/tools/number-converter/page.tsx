"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Calculator,
  Copy,
  Check,
  Trash2,
  ArrowRightLeft,
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

type Base = "binary" | "octal" | "decimal" | "hex";

interface ConversionResult {
  binary: string;
  octal: string;
  decimal: string;
  hex: string;
  ascii?: string;
}

const BASE_CONFIG = {
  binary: { label: "Binary", prefix: "0b", radix: 2, placeholder: "1010", color: "bg-brutal-success" },
  octal: { label: "Octal", prefix: "0o", radix: 8, placeholder: "12", color: "bg-brutal-warning" },
  decimal: { label: "Decimal", prefix: "", radix: 10, placeholder: "10", color: "bg-brutal-primary" },
  hex: { label: "Hexadecimal", prefix: "0x", radix: 16, placeholder: "A", color: "bg-brutal-accent" },
};

function parseNumber(value: string, base: Base): number | null {
  const cleaned = value.trim().toLowerCase()
    .replace(/^0b/, "")
    .replace(/^0o/, "")
    .replace(/^0x/, "")
    .replace(/\s/g, "");

  if (!cleaned) return null;

  const radix = BASE_CONFIG[base].radix;
  const parsed = parseInt(cleaned, radix);

  if (isNaN(parsed)) return null;
  return parsed;
}

function formatBinary(num: number): string {
  const binary = num.toString(2);
  // Group by 4 digits
  const padded = binary.padStart(Math.ceil(binary.length / 4) * 4, "0");
  return padded.match(/.{1,4}/g)?.join(" ") || binary;
}

function formatHex(num: number): string {
  return num.toString(16).toUpperCase();
}

function toAscii(num: number): string {
  if (num >= 32 && num <= 126) {
    return String.fromCharCode(num);
  }
  if (num === 0) return "NUL";
  if (num === 9) return "TAB";
  if (num === 10) return "LF";
  if (num === 13) return "CR";
  if (num === 32) return "SPACE";
  return "";
}

function convertNumber(value: string, fromBase: Base): ConversionResult | null {
  const num = parseNumber(value, fromBase);
  if (num === null || num < 0) return null;

  return {
    binary: formatBinary(num),
    octal: num.toString(8),
    decimal: num.toLocaleString(),
    hex: formatHex(num),
    ascii: toAscii(num),
  };
}

export default function NumberConverterPage() {
  const [inputBase, setInputBase] = useState<Base>("decimal");
  const [input, setInput] = useState("");
  const [copiedBase, setCopiedBase] = useState<string | null>(null);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return convertNumber(input, inputBase);
  }, [input, inputBase]);

  const copyValue = useCallback((base: string, value: string) => {
    // Remove formatting for copy
    const cleanValue = value.replace(/\s/g, "").replace(/,/g, "");
    navigator.clipboard.writeText(cleanValue);
    setCopiedBase(base);
    setTimeout(() => setCopiedBase(null), 2000);
  }, []);

  const clear = useCallback(() => {
    setInput("");
  }, []);

  const swapExample = useCallback((base: Base, value: string) => {
    setInputBase(base);
    setInput(value);
  }, []);

  const config = BASE_CONFIG[inputBase];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brutal-primary border-[2px] md:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] md:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Calculator className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black uppercase tracking-tight">
              Number Converter
            </h1>
            <div className="h-1 w-16 md:w-24 bg-brutal-primary mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-3 md:mt-4 font-medium text-sm md:text-base">
          2진수, 8진수, 10진수, 16진수를 상호 변환합니다.
        </p>
      </header>

      {/* Quick Examples */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase text-brutal-text-muted mb-2">
          Quick Examples:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => swapExample("decimal", "255")}
            className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-primary"
          >
            255 (Dec)
          </button>
          <button
            onClick={() => swapExample("hex", "FF")}
            className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-accent"
          >
            0xFF (Hex)
          </button>
          <button
            onClick={() => swapExample("binary", "11111111")}
            className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-success"
          >
            11111111 (Bin)
          </button>
          <button
            onClick={() => swapExample("decimal", "65")}
            className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-primary"
          >
            65 = 'A'
          </button>
          <button
            onClick={() => swapExample("decimal", "256")}
            className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-primary"
          >
            256 (1 byte + 1)
          </button>
          <button
            onClick={() => swapExample("hex", "DEADBEEF")}
            className="px-3 py-1.5 text-xs font-bold border-[2px] border-black bg-white hover:bg-brutal-accent"
          >
            0xDEADBEEF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Input</CardTitle>
                <Button onClick={clear} variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Base Selection */}
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(BASE_CONFIG) as Base[]).map((base) => (
                  <button
                    key={base}
                    onClick={() => setInputBase(base)}
                    className={cn(
                      "px-3 py-3 text-xs font-bold uppercase border-[2px] border-black transition-all",
                      inputBase === base
                        ? `${BASE_CONFIG[base].color} shadow-[2px_2px_0px_0px_#000000]`
                        : "bg-white hover:bg-brutal-bg-alt"
                    )}
                  >
                    {BASE_CONFIG[base].label}
                  </button>
                ))}
              </div>

              {/* Input Field */}
              <div className="relative">
                {config.prefix && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-brutal-text-muted">
                    {config.prefix}
                  </span>
                )}
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={config.placeholder}
                  className={cn(
                    "font-mono text-xl",
                    config.prefix && "pl-10"
                  )}
                />
              </div>

              {/* Validation */}
              {input && !result && (
                <div className="p-3 bg-brutal-danger text-white text-sm font-bold border-[2px] border-black">
                  Invalid {config.label} number
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bit Info */}
          {result && (
            <Card className="bg-brutal-bg-alt">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-brutal-text-muted">
                      Bit Length
                    </span>
                    <p className="font-mono text-lg font-bold">
                      {result.binary.replace(/\s/g, "").length} bits
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase text-brutal-text-muted">
                      Byte Length
                    </span>
                    <p className="font-mono text-lg font-bold">
                      {Math.ceil(result.binary.replace(/\s/g, "").length / 8)} bytes
                    </p>
                  </div>
                  {result.ascii && (
                    <div className="col-span-2">
                      <span className="text-xs font-bold uppercase text-brutal-text-muted">
                        ASCII Character
                      </span>
                      <p className="font-mono text-2xl font-bold">
                        '{result.ascii}'
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {result ? (
            <Card>
              <CardHeader className="border-b-[3px] border-black">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  Conversion Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y-[2px] divide-black">
                {(Object.keys(BASE_CONFIG) as Base[]).map((base) => {
                  const baseConfig = BASE_CONFIG[base];
                  const value = result[base];
                  const isActive = base === inputBase;

                  return (
                    <div
                      key={base}
                      className={cn(
                        "p-4 flex items-center justify-between",
                        isActive && "bg-brutal-bg-alt"
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={isActive ? "success" : "default"}
                            className={isActive ? baseConfig.color : ""}
                          >
                            {baseConfig.label}
                          </Badge>
                          {isActive && (
                            <span className="text-xs text-brutal-text-muted">(input)</span>
                          )}
                        </div>
                        <code className="font-mono text-lg break-all">
                          {baseConfig.prefix && (
                            <span className="text-brutal-text-muted">{baseConfig.prefix}</span>
                          )}
                          {value}
                        </code>
                      </div>
                      <Button
                        onClick={() => copyValue(base, value)}
                        variant="outline"
                        size="sm"
                      >
                        {copiedBase === base ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full min-h-[300px] flex items-center justify-center">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-6">
                  <Calculator className="w-10 h-10 text-brutal-text-muted" />
                </div>
                <p className="text-brutal-text-muted font-bold uppercase tracking-wide">
                  Enter a number to convert
                </p>
              </CardContent>
            </Card>
          )}

          {/* Reference Table */}
          <Card className="bg-brutal-bg-alt">
            <CardHeader className="border-b-[2px] border-black">
              <CardTitle className="text-sm">Common Values</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                <span className="font-bold">Dec</span>
                <span className="font-bold">Hex</span>
                <span className="font-bold">Bin</span>
                <span className="font-bold">ASCII</span>

                <span>0</span><span>0</span><span>0000</span><span>NUL</span>
                <span>10</span><span>A</span><span>1010</span><span>LF</span>
                <span>32</span><span>20</span><span>0010 0000</span><span>SP</span>
                <span>65</span><span>41</span><span>0100 0001</span><span>A</span>
                <span>127</span><span>7F</span><span>0111 1111</span><span>DEL</span>
                <span>255</span><span>FF</span><span>1111 1111</span><span>-</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
