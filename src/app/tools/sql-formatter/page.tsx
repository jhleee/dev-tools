"use client";

import { useState, useCallback } from "react";
import {
  Database,
  Copy,
  Check,
  Trash2,
  Wand2,
  Minimize2,
  FileText,
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

type IndentStyle = "2spaces" | "4spaces" | "tab";
type KeywordCase = "upper" | "lower" | "preserve";

interface FormatOptions {
  indentStyle: IndentStyle;
  keywordCase: KeywordCase;
  linesBetweenStatements: number;
  commaPosition: "before" | "after";
}

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "LIKE", "BETWEEN",
  "JOIN", "INNER", "LEFT", "RIGHT", "OUTER", "FULL", "CROSS", "ON",
  "GROUP", "BY", "HAVING", "ORDER", "ASC", "DESC", "LIMIT", "OFFSET",
  "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE",
  "CREATE", "TABLE", "ALTER", "DROP", "INDEX", "VIEW", "DATABASE",
  "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "UNIQUE", "NULL", "DEFAULT",
  "AS", "DISTINCT", "ALL", "UNION", "INTERSECT", "EXCEPT",
  "CASE", "WHEN", "THEN", "ELSE", "END", "CAST", "COALESCE", "NULLIF",
  "EXISTS", "ANY", "SOME", "COUNT", "SUM", "AVG", "MIN", "MAX",
  "WITH", "RECURSIVE", "OVER", "PARTITION", "ROWS", "RANGE",
  "IF", "ELSIF", "LOOP", "WHILE", "FOR", "BEGIN", "COMMIT", "ROLLBACK",
  "GRANT", "REVOKE", "TRUNCATE", "EXPLAIN", "ANALYZE",
];

const CLAUSE_STARTERS = [
  "SELECT", "FROM", "WHERE", "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
  "OUTER JOIN", "FULL JOIN", "CROSS JOIN", "ON", "GROUP BY", "HAVING",
  "ORDER BY", "LIMIT", "OFFSET", "UNION", "INTERSECT", "EXCEPT",
  "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM",
  "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "WITH",
];

function formatSQL(sql: string, options: FormatOptions): string {
  if (!sql.trim()) return "";

  const indent = options.indentStyle === "tab" ? "\t" :
                 options.indentStyle === "4spaces" ? "    " : "  ";

  // Normalize whitespace
  let formatted = sql.replace(/\s+/g, " ").trim();

  // Handle keyword case
  if (options.keywordCase !== "preserve") {
    SQL_KEYWORDS.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      formatted = formatted.replace(regex,
        options.keywordCase === "upper" ? keyword.toUpperCase() : keyword.toLowerCase()
      );
    });
  }

  // Add newlines before major clauses
  CLAUSE_STARTERS.forEach(clause => {
    const regex = new RegExp(`\\s+${clause.replace(/ /g, "\\s+")}\\b`, "gi");
    formatted = formatted.replace(regex, `\n${clause}`);
  });

  // Handle AND/OR
  formatted = formatted.replace(/\s+(AND|OR)\s+/gi, (match, keyword) => {
    const kw = options.keywordCase === "upper" ? keyword.toUpperCase() :
               options.keywordCase === "lower" ? keyword.toLowerCase() : keyword;
    return `\n${indent}${kw} `;
  });

  // Handle commas in SELECT
  if (options.commaPosition === "before") {
    formatted = formatted.replace(/,\s*/g, "\n" + indent + ", ");
  } else {
    formatted = formatted.replace(/,\s*/g, ",\n" + indent);
  }

  // Handle parentheses for subqueries
  let depth = 0;
  let result = "";
  for (let i = 0; i < formatted.length; i++) {
    const char = formatted[i];
    if (char === "(") {
      depth++;
      result += char;
    } else if (char === ")") {
      depth--;
      result += char;
    } else {
      result += char;
    }
  }
  formatted = result;

  // Indent based on context
  const lines = formatted.split("\n");
  const indentedLines: string[] = [];
  let currentIndent = 0;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Decrease indent for certain keywords
    if (/^(FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|ON)\b/i.test(trimmed)) {
      currentIndent = 1;
    }

    // Main clauses at base level
    if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH|UNION|INTERSECT|EXCEPT)\b/i.test(trimmed)) {
      currentIndent = 0;
    }

    const indentStr = indent.repeat(currentIndent);
    indentedLines.push(indentStr + trimmed);

    // Increase indent after SELECT
    if (/^SELECT\b/i.test(trimmed)) {
      currentIndent = 1;
    }
  });

  // Add blank lines between statements
  let finalResult = indentedLines.join("\n");
  if (options.linesBetweenStatements > 0) {
    const separator = "\n".repeat(options.linesBetweenStatements + 1);
    finalResult = finalResult.replace(/;(\s*\n)/g, ";" + separator);
  }

  return finalResult;
}

function minifySQL(sql: string): string {
  return sql
    .replace(/--.*$/gm, "") // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
    .replace(/\s+/g, " ") // Collapse whitespace
    .replace(/\s*([,();])\s*/g, "$1") // Remove spaces around punctuation
    .trim();
}

function detectDialect(sql: string): string {
  const lowerSQL = sql.toLowerCase();

  if (lowerSQL.includes("limit") && lowerSQL.includes("offset")) return "MySQL/PostgreSQL";
  if (lowerSQL.includes("top ")) return "SQL Server";
  if (lowerSQL.includes("rownum")) return "Oracle";
  if (lowerSQL.includes("iif(") || lowerSQL.includes("nz(")) return "Access";
  if (lowerSQL.includes("::")) return "PostgreSQL";
  if (lowerSQL.includes("engine=")) return "MySQL";

  return "Standard SQL";
}

const SAMPLE_SQL = `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= '2024-01-01' AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 5 ORDER BY total_spent DESC LIMIT 10;`;

export default function SQLFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<FormatOptions>({
    indentStyle: "2spaces",
    keywordCase: "upper",
    linesBetweenStatements: 1,
    commaPosition: "after",
  });

  const format = useCallback(() => {
    setOutput(formatSQL(input, options));
  }, [input, options]);

  const minify = useCallback(() => {
    setOutput(minifySQL(input));
  }, [input]);

  const copyOutput = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
  }, []);

  const loadSample = useCallback(() => {
    setInput(SAMPLE_SQL);
  }, []);

  const dialect = input ? detectDialect(input) : null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-brutal-secondary border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Database className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black uppercase tracking-tight">
              SQL Formatter
            </h1>
            <div className="h-1 w-24 bg-brutal-secondary mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-4 font-medium">
          SQL 쿼리를 정리하고 포맷팅합니다. 키워드 대소문자, 들여쓰기 설정 가능.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Input SQL
                  {dialect && (
                    <Badge variant="outline" className="ml-2">
                      {dialect}
                    </Badge>
                  )}
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
                placeholder="Paste your SQL query here..."
                className="min-h-[300px] border-0 shadow-none font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <CardTitle className="text-sm">Format Options</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Indent Style */}
              <div>
                <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                  Indent Style
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "2spaces", label: "2 Spaces" },
                    { value: "4spaces", label: "4 Spaces" },
                    { value: "tab", label: "Tab" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setOptions({ ...options, indentStyle: opt.value as IndentStyle })}
                      className={cn(
                        "flex-1 px-3 py-2 text-xs font-bold uppercase border-[2px] border-black transition-all",
                        options.indentStyle === opt.value
                          ? "bg-brutal-primary shadow-[2px_2px_0px_0px_#000000]"
                          : "bg-white hover:bg-brutal-bg-alt"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyword Case */}
              <div>
                <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                  Keyword Case
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "upper", label: "UPPER" },
                    { value: "lower", label: "lower" },
                    { value: "preserve", label: "Preserve" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setOptions({ ...options, keywordCase: opt.value as KeywordCase })}
                      className={cn(
                        "flex-1 px-3 py-2 text-xs font-bold uppercase border-[2px] border-black transition-all",
                        options.keywordCase === opt.value
                          ? "bg-brutal-accent shadow-[2px_2px_0px_0px_#000000]"
                          : "bg-white hover:bg-brutal-bg-alt"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comma Position */}
              <div>
                <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                  Comma Position
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "after", label: "After (a, b)" },
                    { value: "before", label: "Before (, a)" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setOptions({ ...options, commaPosition: opt.value as "before" | "after" })}
                      className={cn(
                        "flex-1 px-3 py-2 text-xs font-bold uppercase border-[2px] border-black transition-all",
                        options.commaPosition === opt.value
                          ? "bg-brutal-secondary shadow-[2px_2px_0px_0px_#000000]"
                          : "bg-white hover:bg-brutal-bg-alt"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button onClick={format} className="flex-1" size="lg" disabled={!input.trim()}>
                  <Wand2 className="w-5 h-5" />
                  Format
                </Button>
                <Button onClick={minify} variant="outline" size="lg" disabled={!input.trim()}>
                  <Minimize2 className="w-5 h-5" />
                  Minify
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b-[3px] border-black bg-brutal-secondary">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Formatted SQL
                </CardTitle>
                <Button
                  onClick={copyOutput}
                  variant="outline"
                  size="sm"
                  disabled={!output}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                value={output}
                readOnly
                placeholder="Formatted SQL will appear here..."
                className="min-h-[500px] border-0 shadow-none font-mono text-sm bg-brutal-bg-alt"
              />
            </CardContent>
          </Card>

          {/* Stats */}
          {output && (
            <Card className="bg-brutal-bg-alt">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{output.split("\n").length}</div>
                    <div className="text-xs font-bold uppercase text-brutal-text-muted">Lines</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{output.length}</div>
                    <div className="text-xs font-bold uppercase text-brutal-text-muted">Characters</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {(output.match(/;/g) || []).length || 1}
                    </div>
                    <div className="text-xs font-bold uppercase text-brutal-text-muted">Statements</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
