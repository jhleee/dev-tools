"use client";

import { useTheme, Theme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

const themes: { id: Theme; name: string; colors: string[] }[] = [
  {
    id: "default",
    name: "Default",
    colors: ["#FFE500", "#FF6B9D", "#00D4FF"],
  },
  {
    id: "warm",
    name: "Warm",
    colors: ["#E8C07D", "#D4A5A5", "#9DB4A8"],
  },
  {
    id: "grayscale",
    name: "Mono",
    colors: ["#E0E0E0", "#B8B8B8", "#909090"],
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-3">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={cn(
            "flex flex-col items-center gap-2 p-4 text-sm font-bold uppercase transition-all duration-100",
            "border-[3px]",
            theme === t.id
              ? "border-black bg-brutal-bg-alt shadow-brutal"
              : "border-black/30 hover:border-black hover:shadow-brutal-sm"
          )}
          aria-label={`Switch to ${t.name} theme`}
        >
          <div className="flex gap-1.5">
            {t.colors.map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 border-[2px] border-black"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span>{t.name}</span>
        </button>
      ))}
    </div>
  );
}
