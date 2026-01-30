import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Neo-Brutalism Input Component
 *
 * 특징:
 * - 두꺼운 검은 보더 (3px)
 * - 하드 섀도우 (focus시)
 * - 직각 모서리
 * - 강렬한 포커스 상태
 *
 * 높이 토큰:
 * - 기본 높이: h-11 (44px) - Button default와 동일
 * - 같은 행에 배치 시 높이 일관성 보장
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-11 w-full px-4 py-2",
          "bg-white text-black",
          "text-sm font-medium",
          // Brutal border
          "border-[3px] border-black",
          // Focus state - 연한 배경색으로 변경 (selection과 구분)
          "focus:outline-none focus:bg-brutal-primary/20",
          // Transition
          "transition-all duration-100 ease-in-out",
          // Placeholder
          "placeholder:text-brutal-text-muted placeholder:font-normal",
          // File input
          "file:border-0 file:bg-transparent file:text-sm file:font-bold file:uppercase",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-brutal-bg-alt",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
