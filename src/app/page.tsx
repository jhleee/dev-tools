import Link from "next/link";
import {
  Hash,
  ArrowRight,
  Zap,
  Brackets,
  Terminal,
  Binary,
  KeyRound,
  Regex,
  Clock,
  Link2,
  Shield,
  Fingerprint,
  Palette,
  GitCompare,
  Timer,
  Calculator,
  CaseSensitive,
  Code,
  QrCode,
  Key,
  BarChart3,
  Database,
} from "lucide-react";
import { Card, CardContent, Badge, Button } from "@/components/ui";

const tools = [
  {
    id: "token-counter",
    name: "Token Counter",
    description: "다양한 LLM 모델의 토큰 수를 계산하고 비교합니다",
    icon: Hash,
    href: "/tools/token-counter",
    status: "active" as const,
    tags: ["GPT", "Claude", "Gemini"],
    color: "bg-brutal-accent",
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "JSON prettify, minify, tree view, YAML 변환 및 유효성 검사",
    icon: Brackets,
    href: "/tools/json-formatter",
    status: "active" as const,
    tags: ["JSON", "YAML", "Utility"],
    color: "bg-brutal-secondary",
  },
  {
    id: "base64",
    name: "Base64 Encoder",
    description: "텍스트/파일을 Base64로 인코딩/디코딩. 이미지 미리보기 지원",
    icon: Binary,
    href: "/tools/base64",
    status: "active" as const,
    tags: ["Encoding", "Utility"],
    color: "bg-brutal-success",
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    description: "JWT 토큰 파싱 및 디코딩. Header, Payload, 만료일 확인",
    icon: KeyRound,
    href: "/tools/jwt-decoder",
    status: "active" as const,
    tags: ["Auth", "Security"],
    color: "bg-brutal-warning",
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    description: "정규식 패턴 테스트. 실시간 매칭, 그룹 캡처 지원",
    icon: Regex,
    href: "/tools/regex-tester",
    status: "active" as const,
    tags: ["Regex", "Utility"],
    color: "bg-brutal-secondary",
  },
  {
    id: "timestamp",
    name: "Timestamp Converter",
    description: "Unix timestamp ↔ 날짜 변환. 다양한 포맷 지원",
    icon: Clock,
    href: "/tools/timestamp",
    status: "active" as const,
    tags: ["Time", "Utility"],
    color: "bg-brutal-accent",
  },
  {
    id: "url-encoder",
    name: "URL Encoder",
    description: "URL 인코딩/디코딩. 쿼리 파라미터 파싱 지원",
    icon: Link2,
    href: "/tools/url-encoder",
    status: "active" as const,
    tags: ["URL", "Utility"],
    color: "bg-brutal-primary",
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description: "MD5, SHA-1, SHA-256, SHA-512 해시 생성",
    icon: Shield,
    href: "/tools/hash-generator",
    status: "active" as const,
    tags: ["Hash", "Security"],
    color: "bg-brutal-danger",
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description: "UUID v4/v7 생성, 대량 생성, 검증 지원",
    icon: Fingerprint,
    href: "/tools/uuid-generator",
    status: "active" as const,
    tags: ["UUID", "Utility"],
    color: "bg-brutal-secondary",
  },
  {
    id: "color-converter",
    name: "Color Converter",
    description: "HEX, RGB, HSL, HSV 색상 값 상호 변환",
    icon: Palette,
    href: "/tools/color-converter",
    status: "active" as const,
    tags: ["Color", "Design"],
    color: "bg-brutal-secondary",
  },
  {
    id: "diff-viewer",
    name: "Diff Viewer",
    description: "두 텍스트를 비교하고 변경 사항을 하이라이트",
    icon: GitCompare,
    href: "/tools/diff-viewer",
    status: "active" as const,
    tags: ["Diff", "Code"],
    color: "bg-brutal-accent",
  },
  {
    id: "markdown-preview",
    name: "Markdown Preview",
    description: "마크다운 실시간 미리보기 및 HTML 변환",
    icon: Terminal,
    href: "/tools/markdown-preview",
    status: "active" as const,
    tags: ["Markdown", "Docs"],
    color: "bg-brutal-primary",
  },
  {
    id: "cron-parser",
    name: "Cron Parser",
    description: "Cron 표현식 해석 및 다음 실행 시간 계산",
    icon: Timer,
    href: "/tools/cron-parser",
    status: "active" as const,
    tags: ["Cron", "Schedule"],
    color: "bg-brutal-warning",
  },
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum",
    description: "더미 텍스트 생성기. 단락/문장/단어 단위",
    icon: Terminal,
    href: "/tools/lorem-ipsum",
    status: "active" as const,
    tags: ["Text", "Utility"],
    color: "bg-brutal-secondary",
  },
  {
    id: "number-converter",
    name: "Number Converter",
    description: "2진수/8진수/10진수/16진수 상호 변환",
    icon: Calculator,
    href: "/tools/number-converter",
    status: "active" as const,
    tags: ["Number", "Utility"],
    color: "bg-brutal-primary",
  },
  {
    id: "case-converter",
    name: "Case Converter",
    description: "camelCase, snake_case, kebab-case 등 변환",
    icon: CaseSensitive,
    href: "/tools/case-converter",
    status: "active" as const,
    tags: ["Text", "Code"],
    color: "bg-brutal-accent",
  },
  {
    id: "string-escape",
    name: "String Escape",
    description: "JSON/HTML/URL/JS/SQL 문자열 이스케이프",
    icon: Code,
    href: "/tools/string-escape",
    status: "active" as const,
    tags: ["String", "Code"],
    color: "bg-brutal-warning",
  },
  {
    id: "qrcode-generator",
    name: "QR Generator",
    description: "텍스트/URL/WiFi 정보를 QR 코드로 생성",
    icon: QrCode,
    href: "/tools/qrcode-generator",
    status: "active" as const,
    tags: ["QR", "Generator"],
    color: "bg-brutal-primary",
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "강력하고 안전한 비밀번호 생성",
    icon: Key,
    href: "/tools/password-generator",
    status: "active" as const,
    tags: ["Password", "Security"],
    color: "bg-brutal-danger",
  },
  {
    id: "text-stats",
    name: "Text Statistics",
    description: "텍스트 통계 분석: 글자 수, 단어 수, 읽기 시간",
    icon: BarChart3,
    href: "/tools/text-stats",
    status: "active" as const,
    tags: ["Text", "Analysis"],
    color: "bg-brutal-accent",
  },
  {
    id: "sql-formatter",
    name: "SQL Formatter",
    description: "SQL 쿼리 포맷팅, 정리, 키워드 대소문자 변환",
    icon: Database,
    href: "/tools/sql-formatter",
    status: "active" as const,
    tags: ["SQL", "Code"],
    color: "bg-brutal-secondary",
  },
  {
    id: "coming-soon-2",
    name: "Prompt Playground",
    description: "프롬프트를 테스트하고 최적화합니다",
    icon: Terminal,
    href: "#",
    status: "coming" as const,
    tags: ["AI"],
    color: "bg-brutal-success",
  },
];

export default function Home() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 md:gap-4 mb-4">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-brutal-primary border-[2px] md:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] md:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Zap className="w-5 h-5 md:w-8 md:h-8 text-black" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black uppercase tracking-tight">
              DevTools Backoffice
            </h1>
            <div className="h-1 w-24 md:w-32 bg-brutal-primary mt-2" />
          </div>
        </div>
        <p className="text-brutal-text-muted text-base md:text-lg max-w-2xl font-medium mt-4">
          팀 내부에서 사용하는 개발자 도구 모음입니다. 생산성을 높이고 반복
          작업을 자동화하세요.
        </p>
      </header>

      {/* Tools Grid */}
      <section>
        <h2 className="text-xs md:text-sm font-bold text-black uppercase tracking-wider mb-4 md:mb-6 border-b-[2px] md:border-b-[3px] border-black pb-2 inline-block">
          Available Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.status === "active";

            const cardContent = (
              <Card
                className={`group transition-all duration-100 ${
                  isActive
                    ? "hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000000] cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 ${tool.color} border-[2px] border-black shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-black" />
                    </div>
                    {isActive ? (
                      <ArrowRight className="w-6 h-6 text-brutal-text-muted group-hover:text-black group-hover:translate-x-1 transition-all" />
                    ) : (
                      <Badge variant="outline">Coming Soon</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-black uppercase tracking-tight mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-brutal-text-muted text-sm mb-4">
                    {tool.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );

            if (isActive) {
              return (
                <Link key={tool.id} href={tool.href}>
                  {cardContent}
                </Link>
              );
            }

            return <div key={tool.id}>{cardContent}</div>;
          })}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="mt-8 md:mt-12 grid grid-cols-3 gap-3 md:gap-6">
        <Card className="bg-brutal-primary">
          <CardContent className="p-3 md:p-6 text-center">
            <div className="text-2xl md:text-5xl font-bold text-black mb-1 md:mb-2">21</div>
            <div className="text-black font-bold uppercase tracking-wide text-[10px] md:text-sm">
              Active Tools
            </div>
          </CardContent>
        </Card>
        <Card className="bg-brutal-secondary">
          <CardContent className="p-3 md:p-6 text-center">
            <div className="text-2xl md:text-5xl font-bold text-black mb-1 md:mb-2">1</div>
            <div className="text-black font-bold uppercase tracking-wide text-[10px] md:text-sm">
              Coming Soon
            </div>
          </CardContent>
        </Card>
        <Card className="bg-brutal-accent">
          <CardContent className="p-3 md:p-6 text-center">
            <div className="text-2xl md:text-5xl font-bold text-black mb-1 md:mb-2">v1.0</div>
            <div className="text-black font-bold uppercase tracking-wide text-[10px] md:text-sm">
              Version
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="mt-8 md:mt-12">
        <Card className="bg-black text-white border-black">
          <CardContent className="p-4 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base md:text-xl font-bold uppercase tracking-tight text-brutal-primary mb-1 md:mb-2">
                새로운 도구가 필요하신가요?
              </h3>
              <p className="text-brutal-text-light-muted text-sm md:text-base">
                팀에 필요한 도구를 제안해주세요. 함께 만들어갑니다.
              </p>
            </div>
            <Button variant="default" size="lg" className="w-full md:w-auto">
              Request Tool
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
