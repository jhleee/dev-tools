# DevTools Backoffice

팀 내부에서 사용하는 개발자 도구 모음입니다. 생산성을 높이고 반복 작업을 자동화하세요.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Neo-Brutalism Design System
- **UI Components**: shadcn/ui 기반 커스텀 컴포넌트

## Neo-Brutalism Design System

이 프로젝트는 **Neo-Brutalism** 디자인 시스템을 적용했습니다.

### 특징

- **두꺼운 검은 보더** (2-4px)
- **하드 섀도우** (blur 없는 offset shadow)
- **강렬한 색상** (노랑, 핑크, 시안 등 원색)
- **90년대 웹/포스터 미학**

### 색상 팔레트

| Color     | Hex       | Usage      |
|-----------|-----------|------------|
| Primary   | `#FFE500` | 주요 액션  |
| Secondary | `#FF6B9D` | 보조 액션  |
| Accent    | `#00D4FF` | 강조       |
| Success   | `#7CFF00` | 성공 상태  |
| Warning   | `#FF9500` | 경고       |
| Danger    | `#FF3B3B` | 오류/삭제  |

## Available Tools

### Token Counter

다양한 LLM 모델의 토큰 수를 계산하고 비교합니다.

- **OpenAI**: GPT-4o, GPT-4, GPT-3.5, Codex, GPT-3 (tiktoken)
- **Anthropic**: Claude (API 기반)
- **Google**: Gemini (API 기반)

## Getting Started

### 설치

```bash
npm install
```

### 개발 서버

```bash
npm run dev
```

http://localhost:3009 에서 확인할 수 있습니다.

### 프로덕션 빌드

```bash
npm run build
npm run start
```

## Environment Variables

Claude 및 Gemini 토큰 카운트를 위해 API 키가 필요합니다.

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

API 키 없이도 OpenAI 토큰 (tiktoken)은 로컬에서 계산됩니다.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 엔드포인트
│   │   └── tokens/        # Token Counter API
│   ├── tools/             # 도구별 페이지
│   │   └── token-counter/
│   ├── settings/          # 설정 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 대시보드
│   └── globals.css        # 디자인 토큰 + 전역 스타일
├── components/
│   ├── ui/                # Neo-Brutalism 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── badge.tsx
│   │   └── table.tsx
│   └── Sidebar.tsx        # 사이드바 네비게이션
└── lib/
    ├── utils.ts           # cn() 유틸리티
    └── tokenizers.ts      # 토큰 분석 로직
```

## Adding New Tools

1. API 엔드포인트 생성: `src/app/api/[feature]/route.ts`
2. 유틸리티 라이브러리 생성: `src/lib/[feature].ts`
3. UI 페이지 생성: `src/app/tools/[feature]/page.tsx`
4. 사이드바 업데이트: `src/components/Sidebar.tsx`
5. 대시보드 업데이트: `src/app/page.tsx`

## License

Internal use only.
