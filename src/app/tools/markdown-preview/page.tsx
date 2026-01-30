"use client";

import { useState, useCallback, useMemo } from "react";
import {
  FileText,
  Copy,
  Check,
  Trash2,
  Eye,
  Code,
  Download,
  Columns,
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

type ViewMode = "split" | "preview" | "source";

// Simple markdown parser
function parseMarkdown(md: string): string {
  let html = md;

  // Escape HTML
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Code blocks (```...```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto my-4 border-2 border-black"><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-sm border border-black">$1</code>');

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="text-sm font-bold mt-4 mb-2 uppercase">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="text-base font-bold mt-4 mb-2">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-lg font-bold mt-5 mb-2">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-bold mt-6 mb-3 border-b-2 border-black pb-1">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3 border-b-3 border-black pb-2">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-3xl font-bold mt-6 mb-4 border-b-4 border-black pb-2">$1</h1>');

  // Bold and Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong class="font-bold">$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em class="italic">$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del class="line-through">$1</del>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 border-2 border-black shadow-brutal" />');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="border-l-4 border-black pl-4 my-4 italic bg-gray-100 py-2">$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '<hr class="my-6 border-t-4 border-black" />');

  // Unordered lists
  html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/(<li class="ml-4 list-disc">.*<\/li>\n?)+/g, '<ul class="my-4 space-y-1">$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');
  html = html.replace(/(<li class="ml-4 list-decimal">.*<\/li>\n?)+/g, '<ol class="my-4 space-y-1">$&</ol>');

  // Task lists
  html = html.replace(/<li class="ml-4 list-disc">\[x\]\s*(.*)<\/li>/gi, '<li class="ml-4 flex items-center gap-2"><input type="checkbox" checked disabled class="w-4 h-4" />$1</li>');
  html = html.replace(/<li class="ml-4 list-disc">\[\s?\]\s*(.*)<\/li>/gi, '<li class="ml-4 flex items-center gap-2"><input type="checkbox" disabled class="w-4 h-4" />$1</li>');

  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
    const cells = content.split('|').map((cell: string) => cell.trim());
    if (cells.every((cell: string) => /^[-:]+$/.test(cell))) {
      return '<!-- table separator -->';
    }
    const isHeader = cells.some((cell: string) => cell.includes('---'));
    const cellTag = isHeader ? 'th' : 'td';
    const cellClass = isHeader ? 'font-bold bg-gray-100' : '';
    return `<tr>${cells.map((cell: string) => `<${cellTag} class="border-2 border-black px-3 py-2 ${cellClass}">${cell}</${cellTag}>`).join('')}</tr>`;
  });
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '<table class="w-full my-4 border-collapse">$&</table>');
  html = html.replace(/<!-- table separator -->\n?/g, '');

  // Paragraphs (wrap remaining text)
  html = html.split('\n\n').map(block => {
    if (block.trim() && !block.startsWith('<')) {
      return `<p class="my-3 leading-relaxed">${block}</p>`;
    }
    return block;
  }).join('\n');

  // Line breaks
  html = html.replace(/\n/g, '<br />');
  html = html.replace(/<br \/><br \/>/g, '</p><p class="my-3 leading-relaxed">');

  return html;
}

const SAMPLE_MARKDOWN = `# Markdown Preview

이것은 **마크다운** 프리뷰어입니다.

## 특징

- 실시간 미리보기
- *이탤릭* 및 **볼드** 지원
- ~~취소선~~ 지원

### 코드 블록

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

인라인 코드: \`const x = 1;\`

### 링크 & 이미지

[GitHub](https://github.com)

### 인용문

> 이것은 인용문입니다.

### 체크리스트

- [x] 완료된 항목
- [ ] 미완료 항목

---

**끝!**
`;

export default function MarkdownPreviewPage() {
  const [markdown, setMarkdown] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => parseMarkdown(markdown), [markdown]);

  const copyMarkdown = useCallback(() => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [markdown]);

  const downloadMarkdown = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [markdown]);

  const downloadHtml = useCallback(() => {
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Markdown Document</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    pre { background: #1a1a1a; color: #fff; padding: 1rem; overflow-x: auto; }
    code { background: #e5e5e5; padding: 0.2rem 0.4rem; border-radius: 0.25rem; }
    blockquote { border-left: 4px solid #000; padding-left: 1rem; font-style: italic; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [html]);

  const loadSample = useCallback(() => {
    setMarkdown(SAMPLE_MARKDOWN);
  }, []);

  const clear = useCallback(() => {
    setMarkdown("");
  }, []);

  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const charCount = markdown.length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-brutal-primary border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <FileText className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black uppercase tracking-tight">
              Markdown Preview
            </h1>
            <div className="h-1 w-24 bg-brutal-primary mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-4 font-medium">
          마크다운을 실시간으로 미리보기하고 HTML로 변환합니다.
        </p>
      </header>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex gap-2">
          {(["split", "source", "preview"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase border-[2px] border-black transition-all",
                viewMode === mode
                  ? "bg-brutal-primary shadow-[2px_2px_0px_0px_#000000]"
                  : "bg-white hover:bg-brutal-bg-alt"
              )}
            >
              {mode === "split" && <Columns className="w-4 h-4" />}
              {mode === "source" && <Code className="w-4 h-4" />}
              {mode === "preview" && <Eye className="w-4 h-4" />}
              {mode === "split" ? "Split" : mode === "source" ? "Source" : "Preview"}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={loadSample} variant="outline" size="sm">
            Sample
          </Button>
          <Button onClick={copyMarkdown} variant="outline" size="sm" disabled={!markdown}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button onClick={downloadMarkdown} variant="outline" size="sm" disabled={!markdown}>
            <Download className="w-4 h-4" />
            .md
          </Button>
          <Button onClick={downloadHtml} variant="outline" size="sm" disabled={!markdown}>
            <Download className="w-4 h-4" />
            .html
          </Button>
          <Button onClick={clear} variant="outline" size="sm">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor & Preview */}
      <div className={cn(
        "grid gap-4",
        viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Source */}
        {(viewMode === "split" || viewMode === "source") && (
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Markdown Source
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{wordCount} words</Badge>
                  <Badge variant="outline">{charCount} chars</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Type your markdown here..."
                className="min-h-[500px] border-0 shadow-none focus:shadow-none focus:translate-x-0 focus:translate-y-0 font-mono text-sm resize-none"
              />
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {(viewMode === "split" || viewMode === "preview") && (
          <Card>
            <CardHeader className="border-b-[3px] border-black bg-brutal-primary">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 min-h-[500px] overflow-auto">
              {markdown ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-brutal-text-muted mx-auto mb-4" />
                    <p className="text-brutal-text-muted font-bold uppercase">
                      Start typing to see preview
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info */}
      <Card className="mt-6 bg-brutal-bg-alt">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-xs text-brutal-text-muted font-medium">
            <span>**bold**</span>
            <span>*italic*</span>
            <span>~~strike~~</span>
            <span># Heading</span>
            <span>[link](url)</span>
            <span>`code`</span>
            <span>```block```</span>
            <span>&gt; quote</span>
            <span>- list</span>
            <span>- [x] task</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
