"use client";

import { useState, useCallback, useMemo } from "react";
import {
  BarChart3,
  Copy,
  Check,
  Trash2,
  FileText,
  Clock,
  Type,
  Hash,
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

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  uniqueWords: number;
  avgWordLength: number;
  avgSentenceLength: number;
  readingTime: number; // minutes
  speakingTime: number; // minutes
  topWords: { word: string; count: number }[];
  charFrequency: { char: string; count: number; percent: number }[];
}

function analyzeText(text: string): TextStats {
  if (!text.trim()) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      uniqueWords: 0,
      avgWordLength: 0,
      avgSentenceLength: 0,
      readingTime: 0,
      speakingTime: 0,
      topWords: [],
      charFrequency: [],
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  // Words
  const wordMatches = text.match(/[\w가-힣]+/g) || [];
  const words = wordMatches.length;

  // Sentences (split by . ! ? and Korean sentence enders)
  const sentenceMatches = text.split(/[.!?。？！]+/).filter((s) => s.trim().length > 0);
  const sentences = sentenceMatches.length || (words > 0 ? 1 : 0);

  // Paragraphs
  const paragraphMatches = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const paragraphs = paragraphMatches.length || (text.trim() ? 1 : 0);

  // Lines
  const lines = text.split("\n").length;

  // Unique words
  const wordLower = wordMatches.map((w) => w.toLowerCase());
  const uniqueWords = new Set(wordLower).size;

  // Average word length
  const totalWordLength = wordMatches.reduce((sum, w) => sum + w.length, 0);
  const avgWordLength = words > 0 ? totalWordLength / words : 0;

  // Average sentence length (words per sentence)
  const avgSentenceLength = sentences > 0 ? words / sentences : 0;

  // Reading time (average 200-250 words per minute for English, slower for Korean)
  const readingTime = words / 200;

  // Speaking time (average 125-150 words per minute)
  const speakingTime = words / 130;

  // Top words
  const wordCounts: Record<string, number> = {};
  wordLower.forEach((word) => {
    if (word.length > 1) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  const topWords = Object.entries(wordCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Character frequency (letters only)
  const charCounts: Record<string, number> = {};
  const lettersOnly = text.toLowerCase().replace(/[^a-z가-힣]/g, "");
  lettersOnly.split("").forEach((char) => {
    charCounts[char] = (charCounts[char] || 0) + 1;
  });
  const charFrequency = Object.entries(charCounts)
    .map(([char, count]) => ({
      char,
      count,
      percent: (count / lettersOnly.length) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    uniqueWords,
    avgWordLength,
    avgSentenceLength,
    readingTime,
    speakingTime,
    topWords,
    charFrequency,
  };
}

function formatTime(minutes: number): string {
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return `${seconds}초`;
  }
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  if (mins === 0) return `${secs}초`;
  if (secs === 0) return `${mins}분`;
  return `${mins}분 ${secs}초`;
}

export default function TextStatsPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => analyzeText(input), [input]);

  const copyStats = useCallback(() => {
    const statsText = `
Text Statistics
===============
Characters: ${stats.characters.toLocaleString()}
Characters (no spaces): ${stats.charactersNoSpaces.toLocaleString()}
Words: ${stats.words.toLocaleString()}
Sentences: ${stats.sentences.toLocaleString()}
Paragraphs: ${stats.paragraphs.toLocaleString()}
Lines: ${stats.lines.toLocaleString()}
Unique Words: ${stats.uniqueWords.toLocaleString()}
Avg Word Length: ${stats.avgWordLength.toFixed(1)}
Avg Sentence Length: ${stats.avgSentenceLength.toFixed(1)} words
Reading Time: ${formatTime(stats.readingTime)}
Speaking Time: ${formatTime(stats.speakingTime)}
`.trim();
    navigator.clipboard.writeText(statsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [stats]);

  const clear = useCallback(() => {
    setInput("");
  }, []);

  const loadSample = useCallback(() => {
    setInput(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

이것은 한국어 텍스트 예제입니다. 텍스트 통계 분석 도구는 영어와 한국어를 모두 지원합니다.`);
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brutal-accent border-[2px] md:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] md:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black uppercase tracking-tight">
              Text Statistics
            </h1>
            <div className="h-1 w-16 md:w-24 bg-brutal-accent mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-3 md:mt-4 font-medium text-sm md:text-base">
          텍스트의 상세 통계를 분석합니다. 글자 수, 단어 수, 읽기 시간 등.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Input */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Input Text
                </CardTitle>
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
                placeholder="Paste or type your text here to analyze..."
                className="min-h-[400px] border-0 shadow-none focus:shadow-none focus:translate-x-0 focus:translate-y-0 text-sm"
              />
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-brutal-primary">
              <CardContent className="p-4 text-center">
                <Type className="w-5 h-5 mx-auto mb-1" />
                <div className="text-2xl font-bold">{stats.characters.toLocaleString()}</div>
                <div className="text-xs font-bold uppercase">Characters</div>
              </CardContent>
            </Card>
            <Card className="bg-brutal-accent">
              <CardContent className="p-4 text-center">
                <Hash className="w-5 h-5 mx-auto mb-1" />
                <div className="text-2xl font-bold">{stats.words.toLocaleString()}</div>
                <div className="text-xs font-bold uppercase">Words</div>
              </CardContent>
            </Card>
            <Card className="bg-brutal-secondary">
              <CardContent className="p-4 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1" />
                <div className="text-2xl font-bold">{formatTime(stats.readingTime)}</div>
                <div className="text-xs font-bold uppercase">Read Time</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <Card>
            <CardHeader className="border-b-[3px] border-black bg-brutal-accent">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Detailed Statistics
                </CardTitle>
                <Button onClick={copyStats} variant="outline" size="sm">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y-[2px] divide-black">
              {[
                { label: "Characters", value: stats.characters.toLocaleString() },
                { label: "Characters (no spaces)", value: stats.charactersNoSpaces.toLocaleString() },
                { label: "Words", value: stats.words.toLocaleString() },
                { label: "Unique Words", value: stats.uniqueWords.toLocaleString() },
                { label: "Sentences", value: stats.sentences.toLocaleString() },
                { label: "Paragraphs", value: stats.paragraphs.toLocaleString() },
                { label: "Lines", value: stats.lines.toLocaleString() },
                { label: "Avg Word Length", value: `${stats.avgWordLength.toFixed(1)} chars` },
                { label: "Avg Sentence Length", value: `${stats.avgSentenceLength.toFixed(1)} words` },
                { label: "Reading Time", value: formatTime(stats.readingTime) },
                { label: "Speaking Time", value: formatTime(stats.speakingTime) },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center px-4 py-2">
                  <span className="text-sm font-bold">{item.label}</span>
                  <span className="font-mono text-sm">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Words */}
          {stats.topWords.length > 0 && (
            <Card>
              <CardHeader className="border-b-[3px] border-black">
                <CardTitle className="text-sm">Top Words</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {stats.topWords.map((item, index) => (
                    <Badge
                      key={item.word}
                      variant={index < 3 ? "success" : "default"}
                      className="font-mono"
                    >
                      {item.word} ({item.count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Character Frequency */}
          {stats.charFrequency.length > 0 && (
            <Card className="bg-brutal-bg-alt">
              <CardHeader className="border-b-[2px] border-black">
                <CardTitle className="text-sm">Character Frequency</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {stats.charFrequency.slice(0, 8).map((item) => (
                    <div key={item.char} className="flex items-center gap-2">
                      <span className="w-6 font-mono font-bold text-center">{item.char}</span>
                      <div className="flex-1 h-4 bg-white border-[2px] border-black">
                        <div
                          className="h-full bg-brutal-primary"
                          style={{ width: `${Math.min(item.percent * 5, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-16 text-right">
                        {item.percent.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
