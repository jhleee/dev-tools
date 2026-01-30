import { get_encoding, type TiktokenEncoding } from "tiktoken";

export interface TokenStats {
  totalTokens: number;
  uniqueTokens?: number;
  charsPerToken: number;
}

export interface TokenizerResult {
  provider: string;
  model: string;
  encoding?: string;
  stats: TokenStats | null;
  error?: string;
}

export interface FileStats {
  charCount: number;
  wordCount: number;
  lineCount: number;
}

// OpenAI tiktoken encodings
export const TIKTOKEN_ENCODINGS: Array<{
  encoding: TiktokenEncoding;
  model: string;
}> = [
  { encoding: "o200k_base", model: "GPT-4o" },
  { encoding: "cl100k_base", model: "GPT-4, GPT-3.5-turbo" },
  { encoding: "p50k_base", model: "Codex" },
  { encoding: "r50k_base", model: "GPT-3" },
];

export function getFileStats(text: string): FileStats {
  return {
    charCount: text.length,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    lineCount: text.split("\n").length,
  };
}

export function getTiktokenStats(
  text: string,
  encodingName: TiktokenEncoding
): TokenStats {
  const encoding = get_encoding(encodingName);
  const tokens = encoding.encode(text);
  const uniqueTokens = new Set(tokens).size;

  encoding.free();

  return {
    totalTokens: tokens.length,
    uniqueTokens,
    charsPerToken: tokens.length > 0 ? text.length / tokens.length : 0,
  };
}

export async function getClaudeTokens(
  text: string,
  apiKey?: string
): Promise<TokenStats | null> {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: key });

    const result = await client.messages.countTokens({
      model: "claude-sonnet-4-20250514",
      messages: [{ role: "user", content: text }],
    });

    return {
      totalTokens: result.input_tokens,
      charsPerToken:
        result.input_tokens > 0 ? text.length / result.input_tokens : 0,
    };
  } catch {
    return null;
  }
}

export async function getGeminiTokens(
  text: string,
  apiKey?: string
): Promise<TokenStats | null> {
  const key = apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) return null;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.countTokens(text);

    return {
      totalTokens: result.totalTokens,
      charsPerToken:
        result.totalTokens > 0 ? text.length / result.totalTokens : 0,
    };
  } catch {
    return null;
  }
}

export async function analyzeTokens(
  text: string,
  options: {
    anthropicApiKey?: string;
    googleApiKey?: string;
  } = {}
): Promise<{
  fileStats: FileStats;
  results: TokenizerResult[];
}> {
  const fileStats = getFileStats(text);
  const results: TokenizerResult[] = [];

  // OpenAI tiktoken results
  for (const { encoding, model } of TIKTOKEN_ENCODINGS) {
    try {
      const stats = getTiktokenStats(text, encoding);
      results.push({
        provider: "OpenAI",
        model,
        encoding,
        stats,
      });
    } catch (error) {
      results.push({
        provider: "OpenAI",
        model,
        encoding,
        stats: null,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Claude
  const claudeStats = await getClaudeTokens(text, options.anthropicApiKey);
  results.push({
    provider: "Anthropic",
    model: "Claude (claude-sonnet-4)",
    stats: claudeStats,
    error: claudeStats ? undefined : "ANTHROPIC_API_KEY not set",
  });

  // Gemini
  const geminiStats = await getGeminiTokens(text, options.googleApiKey);
  results.push({
    provider: "Google",
    model: "Gemini (gemini-1.5-flash)",
    stats: geminiStats,
    error: geminiStats ? undefined : "GOOGLE_API_KEY not set",
  });

  return { fileStats, results };
}
