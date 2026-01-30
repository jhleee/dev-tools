"use client";

import { useTheme, Theme } from "@/components/ThemeProvider";
import { Palette } from "lucide-react";
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
    <div className="mb-4">
      <div className="flex items-center gap-2 px-3 py-2 text-brutal-text-muted text-xs font-bold uppercase tracking-wider border-b-2 border-black mb-2">
        <Palette className="w-4 h-4" />
        Theme
      </div>
      <div className="grid grid-cols-3 gap-2 px-3">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 text-xs font-bold uppercase transition-all duration-100",
              "border-[2px]",
              theme === t.id
                ? "border-black bg-brutal-bg-alt shadow-brutal-sm"
                : "border-transparent hover:border-black"
            )}
            aria-label={`Switch to ${t.name} theme`}
          >
            <div className="flex gap-1">
              {t.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 border-[1px] border-black"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-[10px]">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
