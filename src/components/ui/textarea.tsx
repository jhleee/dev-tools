import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Neo-Brutalism Textarea Component
 *
 * 특징:
 * - 두꺼운 검은 보더 (3px)
 * - 하드 섀도우 (focus시)
 * - 직각 모서리
 * - 강렬한 포커스 상태
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Base styles
        "flex min-h-[120px] w-full px-4 py-3",
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
        // Resize
        "resize-none",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-brutal-bg-alt",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
