import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Neo-Brutalism Badge Component
 *
 * 특징:
 * - 두꺼운 검은 보더 (2px)
 * - 직각 또는 최소 radius
 * - 강렬한 색상
 * - 볼드한 텍스트
 */
const badgeVariants = cva(
  [
    // Base styles
    "inline-flex items-center justify-center",
    "px-3 py-1",
    "text-xs font-bold uppercase tracking-wide",
    // Brutal border
    "border-[2px] border-black",
    // Minimal radius
    "rounded-none",
    // Transition
    "transition-colors duration-100",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-brutal-primary text-black",
          "shadow-brutal-sm",
        ],
        secondary: [
          "bg-brutal-secondary text-black",
          "shadow-brutal-sm",
        ],
        accent: [
          "bg-brutal-accent text-black",
          "shadow-brutal-sm",
        ],
        success: [
          "bg-brutal-success text-black",
          "shadow-brutal-sm",
        ],
        warning: [
          "bg-brutal-warning text-black",
          "shadow-brutal-sm",
        ],
        destructive: [
          "bg-brutal-danger text-white",
          "shadow-brutal-sm",
        ],
        outline: [
          "bg-white text-black",
          "shadow-brutal-sm",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
