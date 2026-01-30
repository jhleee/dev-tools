import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Neo-Brutalism Button Component
 *
 * 특징:
 * - 두꺼운 검은 보더 (3px)
 * - 하드 섀도우 (blur 없는 offset shadow)
 * - hover시 transform으로 상호작용 피드백
 * - active시 그림자가 줄어드는 눌림 효과
 *
 * 높이 토큰:
 * - sm: h-9 (36px)
 * - default: h-11 (44px) - Input과 동일
 * - lg: h-12 (48px)
 * - icon: h-11 w-11 (44px 정사각형)
 */
const buttonVariants = cva(
  [
    // Base styles
    "inline-flex items-center justify-center gap-2",
    "font-bold uppercase tracking-wide",
    "border-[3px] border-black",
    "transition-all duration-100 ease-in-out",
    "cursor-pointer select-none",
    // Focus
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
    // Disabled
    "disabled:pointer-events-none disabled:opacity-50",
    // Whitespace
    "whitespace-nowrap",
    // Brutal hover effect
    "hover:-translate-x-0.5 hover:-translate-y-0.5",
    "active:translate-x-0 active:translate-y-0",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-brutal-primary text-black",
          "shadow-brutal",
          "hover:shadow-brutal-lg",
          "active:shadow-brutal-sm",
        ],
        destructive: [
          "bg-brutal-danger text-white",
          "shadow-brutal",
          "hover:shadow-brutal-lg",
          "active:shadow-brutal-sm",
        ],
        outline: [
          "bg-white text-black",
          "shadow-brutal",
          "hover:bg-brutal-bg-alt hover:shadow-brutal-lg",
          "active:shadow-brutal-sm",
        ],
        secondary: [
          "bg-brutal-secondary text-black",
          "shadow-brutal",
          "hover:shadow-brutal-lg",
          "active:shadow-brutal-sm",
        ],
        accent: [
          "bg-brutal-accent text-black",
          "shadow-brutal",
          "hover:shadow-brutal-lg",
          "active:shadow-brutal-sm",
        ],
        success: [
          "bg-brutal-success text-black",
          "shadow-brutal",
          "hover:shadow-brutal-lg",
          "active:shadow-brutal-sm",
        ],
        ghost: [
          "bg-transparent text-black border-transparent",
          "shadow-none",
          "hover:bg-brutal-bg-alt hover:border-black hover:shadow-brutal",
          "active:shadow-brutal-sm",
        ],
        link: [
          "bg-transparent text-black border-transparent",
          "shadow-none underline-offset-4",
          "hover:underline hover:translate-x-0 hover:translate-y-0",
          "active:translate-x-0 active:translate-y-0",
        ],
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 px-4 py-1.5 text-xs",
        lg: "h-12 px-8 py-3 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
