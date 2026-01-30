"use client";

import { useState, useCallback } from "react";
import {
  FileText,
  Copy,
  Check,
  RefreshCw,
  AlignLeft,
  List,
  Type,
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

type GenerateType = "paragraphs" | "sentences" | "words";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "perspiciatis", "unde",
  "omnis", "iste", "natus", "error", "voluptatem", "accusantium", "doloremque",
  "laudantium", "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab", "illo",
  "inventore", "veritatis", "quasi", "architecto", "beatae", "vitae", "dicta",
  "explicabo", "nemo", "ipsam", "quia", "voluptas", "aspernatur", "aut", "odit",
  "fugit", "consequuntur", "magni", "dolores", "eos", "ratione", "sequi",
  "nesciunt", "neque", "porro", "quisquam", "dolorem", "adipisci", "numquam",
  "eius", "modi", "tempora", "incidunt", "magnam", "quaerat", "minima",
];

const FIRST_PARAGRAPH = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateWord(): string {
  return LOREM_WORDS[randomInt(0, LOREM_WORDS.length - 1)];
}

function generateSentence(minWords: number = 8, maxWords: number = 15): string {
  const wordCount = randomInt(minWords, maxWords);
  const words: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    words.push(generateWord());
  }

  // Add commas randomly
  if (wordCount > 6 && Math.random() > 0.5) {
    const commaPos = randomInt(3, wordCount - 3);
    words[commaPos] = words[commaPos] + ",";
  }

  return capitalize(words.join(" ")) + ".";
}

function generateParagraph(minSentences: number = 4, maxSentences: number = 8): string {
  const sentenceCount = randomInt(minSentences, maxSentences);
  const sentences: string[] = [];

  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence());
  }

  return sentences.join(" ");
}

function generateWords(count: number): string {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(generateWord());
  }
  return words.join(" ");
}

function generateSentences(count: number): string {
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    sentences.push(generateSentence());
  }
  return sentences.join(" ");
}

function generateParagraphs(count: number, startWithLorem: boolean = true): string {
  const paragraphs: string[] = [];

  for (let i = 0; i < count; i++) {
    if (i === 0 && startWithLorem) {
      paragraphs.push(FIRST_PARAGRAPH);
    } else {
      paragraphs.push(generateParagraph());
    }
  }

  return paragraphs.join("\n\n");
}

export default function LoremIpsumPage() {
  const [type, setType] = useState<GenerateType>("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let result = "";

    switch (type) {
      case "paragraphs":
        result = generateParagraphs(count, startWithLorem);
        break;
      case "sentences":
        result = generateSentences(count);
        break;
      case "words":
        result = generateWords(count);
        break;
    }

    setOutput(result);
  }, [type, count, startWithLorem]);

  const copyOutput = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0;
  const charCount = output.length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brutal-secondary border-[2px] md:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] md:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black uppercase tracking-tight">
              Lorem Ipsum Generator
            </h1>
            <div className="h-1 w-16 md:w-24 bg-brutal-secondary mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-3 md:mt-4 font-medium text-sm md:text-base">
          더미 텍스트를 생성합니다. 단락, 문장, 단어 단위로 생성 가능.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <CardTitle className="text-sm">Generator Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Type */}
              <div>
                <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                  Generate
                </label>
                <div className="space-y-2">
                  {([
                    { value: "paragraphs", label: "Paragraphs", icon: AlignLeft },
                    { value: "sentences", label: "Sentences", icon: List },
                    { value: "words", label: "Words", icon: Type },
                  ] as const).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setType(option.value)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase border-[2px] border-black transition-all",
                        type === option.value
                          ? "bg-brutal-secondary shadow-[2px_2px_0px_0px_#000000]"
                          : "bg-white hover:bg-brutal-bg-alt"
                      )}
                    >
                      <option.icon className="w-4 h-4" />
                      {option.label}
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
                    max={type === "words" ? 1000 : type === "sentences" ? 100 : 20}
                    value={count}
                    onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 font-mono"
                  />
                  <div className="flex gap-1">
                    {(type === "paragraphs" ? [1, 3, 5] : type === "sentences" ? [3, 5, 10] : [10, 50, 100]).map((n) => (
                      <button
                        key={n}
                        onClick={() => setCount(n)}
                        className={cn(
                          "px-3 py-2 text-xs font-bold border-[2px] border-black transition-all",
                          count === n ? "bg-brutal-primary" : "bg-white hover:bg-brutal-bg-alt"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Options */}
              {type === "paragraphs" && (
                <label className="flex items-center gap-3 cursor-pointer px-4 py-3 border-[2px] border-black bg-white hover:bg-brutal-bg-alt">
                  <input
                    type="checkbox"
                    checked={startWithLorem}
                    onChange={(e) => setStartWithLorem(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-bold uppercase">
                    Start with "Lorem ipsum..."
                  </span>
                </label>
              )}

              {/* Generate Button */}
              <Button onClick={generate} className="w-full" size="lg">
                <RefreshCw className="w-5 h-5" />
                Generate
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          {output && (
            <Card className="bg-brutal-bg-alt">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs font-bold uppercase text-brutal-text-muted">Words</span>
                  <span className="font-mono text-sm">{wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-bold uppercase text-brutal-text-muted">Characters</span>
                  <span className="font-mono text-sm">{charCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-bold uppercase text-brutal-text-muted">Paragraphs</span>
                  <span className="font-mono text-sm">
                    {output.split("\n\n").length}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Output */}
        <div className="lg:col-span-2">
          {output ? (
            <Card>
              <CardHeader className="border-b-[3px] border-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Generated</Badge>
                    <CardTitle className="text-sm">
                      {count} {type}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={generate} variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
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
                <div className="p-6 max-h-[600px] overflow-auto">
                  {output.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-brutal-text-muted" />
                </div>
                <p className="text-brutal-text-muted font-bold uppercase tracking-wide">
                  Configure settings and click Generate
                </p>
                <p className="text-brutal-text-muted text-xs mt-2">
                  Lorem ipsum dolor sit amet...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
