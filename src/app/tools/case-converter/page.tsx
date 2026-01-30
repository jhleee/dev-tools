"use client";

import { useState, useCallback, useMemo } from "react";
import {
  CaseSensitive,
  Copy,
  Check,
  Trash2,
  ArrowDown,
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

type CaseType =
  | "lowercase"
  | "uppercase"
  | "titlecase"
  | "sentencecase"
  | "camelcase"
  | "pascalcase"
  | "snakecase"
  | "kebabcase"
  | "constantcase"
  | "dotcase"
  | "pathcase"
  | "alternating"
  | "inverse";

interface CaseOption {
  id: CaseType;
  label: string;
  description: string;
  example: string;
}

const CASE_OPTIONS: CaseOption[] = [
  { id: "lowercase", label: "lowercase", description: "All lowercase", example: "hello world" },
  { id: "uppercase", label: "UPPERCASE", description: "All uppercase", example: "HELLO WORLD" },
  { id: "titlecase", label: "Title Case", description: "First letter of each word", example: "Hello World" },
  { id: "sentencecase", label: "Sentence case", description: "First letter of sentence", example: "Hello world" },
  { id: "camelcase", label: "camelCase", description: "No spaces, first word lower", example: "helloWorld" },
  { id: "pascalcase", label: "PascalCase", description: "No spaces, all words capitalized", example: "HelloWorld" },
  { id: "snakecase", label: "snake_case", description: "Underscores between words", example: "hello_world" },
  { id: "kebabcase", label: "kebab-case", description: "Hyphens between words", example: "hello-world" },
  { id: "constantcase", label: "CONSTANT_CASE", description: "Uppercase with underscores", example: "HELLO_WORLD" },
  { id: "dotcase", label: "dot.case", description: "Dots between words", example: "hello.world" },
  { id: "pathcase", label: "path/case", description: "Slashes between words", example: "hello/world" },
  { id: "alternating", label: "aLtErNaTiNg", description: "Alternating case", example: "hElLo WoRlD" },
  { id: "inverse", label: "iNVERSE", description: "Swap case", example: "hELLO wORLD" },
];

function toWords(text: string): string[] {
  // Split by various delimiters and camelCase boundaries
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to spaces
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // ABCDef to ABC Def
    .replace(/[_\-./\\]/g, " ") // Replace delimiters with spaces
    .split(/\s+/)
    .filter(Boolean);
}

function convertCase(text: string, caseType: CaseType): string {
  if (!text) return "";

  switch (caseType) {
    case "lowercase":
      return text.toLowerCase();

    case "uppercase":
      return text.toUpperCase();

    case "titlecase":
      return text
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());

    case "sentencecase":
      return text
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s+\w)/g, (char) => char.toUpperCase());

    case "camelcase": {
      const words = toWords(text);
      return words
        .map((word, index) =>
          index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("");
    }

    case "pascalcase": {
      const words = toWords(text);
      return words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
    }

    case "snakecase": {
      const words = toWords(text);
      return words.map((word) => word.toLowerCase()).join("_");
    }

    case "kebabcase": {
      const words = toWords(text);
      return words.map((word) => word.toLowerCase()).join("-");
    }

    case "constantcase": {
      const words = toWords(text);
      return words.map((word) => word.toUpperCase()).join("_");
    }

    case "dotcase": {
      const words = toWords(text);
      return words.map((word) => word.toLowerCase()).join(".");
    }

    case "pathcase": {
      const words = toWords(text);
      return words.map((word) => word.toLowerCase()).join("/");
    }

    case "alternating":
      return text
        .split("")
        .map((char, index) =>
          index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
        )
        .join("");

    case "inverse":
      return text
        .split("")
        .map((char) =>
          char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
        )
        .join("");

    default:
      return text;
  }
}

export default function CaseConverterPage() {
  const [input, setInput] = useState("");
  const [copiedCase, setCopiedCase] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!input.trim()) return null;
    return CASE_OPTIONS.map((option) => ({
      ...option,
      result: convertCase(input, option.id),
    }));
  }, [input]);

  const copyResult = useCallback((caseId: string, result: string) => {
    navigator.clipboard.writeText(result);
    setCopiedCase(caseId);
    setTimeout(() => setCopiedCase(null), 2000);
  }, []);

  const clear = useCallback(() => {
    setInput("");
  }, []);

  const loadSample = useCallback(() => {
    setInput("Hello World Example Text");
  }, []);

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const charCount = input.length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-brutal-accent border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <CaseSensitive className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black uppercase tracking-tight">
              Case Converter
            </h1>
            <div className="h-1 w-24 bg-brutal-accent mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-4 font-medium">
          텍스트를 다양한 케이스 형식으로 변환합니다. camelCase, snake_case, kebab-case 등.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Input Text</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={loadSample} variant="outline" size="sm">
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
                placeholder="Enter text to convert..."
                className="min-h-[200px] border-0 shadow-none focus:shadow-none focus:translate-x-0 focus:translate-y-0 text-lg"
              />
              <div className="px-4 py-3 border-t-[2px] border-black bg-brutal-bg-alt flex justify-between">
                <span className="text-xs font-bold text-brutal-text-muted uppercase">
                  {wordCount} words | {charCount} chars
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="bg-brutal-bg-alt">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-brutal-text-muted font-medium">
                * 자동으로 camelCase, snake_case 등을 감지하여 단어를 분리합니다
              </p>
              <p className="text-xs text-brutal-text-muted font-medium">
                * 프로그래밍 변수명 변환에 유용합니다
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {results ? (
            <Card>
              <CardHeader className="border-b-[3px] border-black bg-brutal-accent">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowDown className="w-4 h-4" />
                  Converted Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-auto divide-y-[2px] divide-black">
                  {results.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 hover:bg-brutal-bg-alt group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{item.label}</Badge>
                          <span className="text-xs text-brutal-text-muted">
                            {item.description}
                          </span>
                        </div>
                        <Button
                          onClick={() => copyResult(item.id, item.result)}
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedCase === item.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <code
                        className={cn(
                          "block font-mono text-sm p-2 border-[2px] border-black bg-white break-all cursor-pointer hover:bg-brutal-primary transition-colors",
                          copiedCase === item.id && "bg-brutal-success"
                        )}
                        onClick={() => copyResult(item.id, item.result)}
                      >
                        {item.result}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-6">
                  <CaseSensitive className="w-10 h-10 text-brutal-text-muted" />
                </div>
                <p className="text-brutal-text-muted font-bold uppercase tracking-wide">
                  Enter text to see all case conversions
                </p>
                <p className="text-brutal-text-muted text-xs mt-2">
                  Click any result to copy
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
