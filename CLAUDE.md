# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevTools Backoffice - 팀 내부용 개발자 도구 모음. Next.js 16 App Router 기반의 모듈형 백오피스 시스템. **Neo-Brutalism** 디자인 시스템 적용.

## Commands

```bash
npm run dev      # 개발 서버 (port 3009)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # 린트 검사
```

## Architecture

### 디렉토리 구조

- `src/app/` - Next.js App Router (페이지 + API)
- `src/app/api/[feature]/route.ts` - API 엔드포인트
- `src/app/tools/[feature]/page.tsx` - 도구별 UI 페이지
- `src/lib/` - 비즈니스 로직 및 유틸리티
- `src/components/ui/` - Neo-Brutalism 디자인 시스템 컴포넌트
- `src/components/` - 공유 레이아웃 컴포넌트

### 새 도구 추가 패턴

1. **API 엔드포인트**: `src/app/api/[feature]/route.ts`
2. **유틸리티 라이브러리**: `src/lib/[feature].ts`
3. **UI 페이지**: `src/app/tools/[feature]/page.tsx` ("use client" 필수)
4. **네비게이션 업데이트**: `src/components/Sidebar.tsx`의 `navigation` 배열
5. **홈 대시보드 업데이트**: `src/app/page.tsx`의 `tools` 배열

## Design System: Neo-Brutalism

### 핵심 특징

- **두꺼운 검은 보더**: 2-4px solid black
- **하드 섀도우**: blur 없는 offset shadow (예: `4px 4px 0px #000`)
- **강렬한 색상**: 노랑, 핑크, 시안 등 원색 위주
- **90년대 웹/포스터 미학**

### 디자인 토큰 (`globals.css` @theme)

```css
/* 색상 */
--color-brutal-primary: #FFE500;    /* 노랑 */
--color-brutal-secondary: #FF6B9D;  /* 핑크 */
--color-brutal-accent: #00D4FF;     /* 시안 */
--color-brutal-success: #7CFF00;    /* 라임 */
--color-brutal-warning: #FF9500;    /* 오렌지 */
--color-brutal-danger: #FF3B3B;     /* 레드 */

/* 보더 */
--border-brutal-sm: 2px;
--border-brutal-md: 3px;
--border-brutal-lg: 4px;

/* 섀도우 */
--shadow-brutal-sm: 2px 2px 0px #000;
--shadow-brutal-md: 4px 4px 0px #000;
--shadow-brutal-lg: 6px 6px 0px #000;
```

### UI 컴포넌트 (`@/components/ui`)

```tsx
import {
  Button,           // variant: default, secondary, destructive, outline, ghost
  Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription,
  Input,
  Textarea,
  Badge,            // variant: default, success, warning, accent
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui";
```

### 유틸리티 함수

```tsx
import { cn } from "@/lib/utils";  // className 병합 (clsx + tailwind-merge)
```

### 유틸리티 CSS 클래스

```css
.border-brutal, .border-brutal-sm, .border-brutal-lg  /* 보더 */
.shadow-brutal, .shadow-brutal-sm, .shadow-brutal-lg  /* 섀도우 */
.brutal-hover                                          /* hover 시 -2px 이동 + 큰 섀도우 */
```

## API 라우트 패턴

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // 필수 필드 검증 -> 400 에러
  // 크기 제한 검증 (예: 1MB)
  // lib 함수 호출하여 처리
  // NextResponse.json으로 응답
}
```

## 클라이언트 컴포넌트 패턴

- 아이콘: `lucide-react`
- 상태 관리: `useState`, `useCallback`
- 키보드 단축키: `Ctrl+Enter`로 실행
- 파일 업로드: `FileReader` API
- 복사 기능: `navigator.clipboard`

## 서버 전용 패키지

`next.config.ts`의 `serverExternalPackages`에 등록 필요 (예: tiktoken).
클라이언트 번들링 방지를 위해 lazy import 사용:

```typescript
const Anthropic = (await import("@anthropic-ai/sdk")).default;
```

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

## Path Alias

`@/*` → `./src/*` (tsconfig.json)
