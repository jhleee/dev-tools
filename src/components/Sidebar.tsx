"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Hash,
  Home,
  Settings,
  ChevronRight,
  Wrench,
  Zap,
  Brackets,
  Binary,
  KeyRound,
  Regex,
  Clock,
  Link2,
  Shield,
  Fingerprint,
  Palette,
  GitCompare,
  FileText,
  Timer,
  Calculator,
  CaseSensitive,
  Code,
  QrCode,
  Key,
  BarChart3,
  Database,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Tools",
    icon: Wrench,
    children: [
      {
        name: "Token Counter",
        href: "/tools/token-counter",
        icon: Hash,
      },
      {
        name: "JSON Formatter",
        href: "/tools/json-formatter",
        icon: Brackets,
      },
      {
        name: "Base64",
        href: "/tools/base64",
        icon: Binary,
      },
      {
        name: "JWT Decoder",
        href: "/tools/jwt-decoder",
        icon: KeyRound,
      },
      {
        name: "Regex Tester",
        href: "/tools/regex-tester",
        icon: Regex,
      },
      {
        name: "Timestamp",
        href: "/tools/timestamp",
        icon: Clock,
      },
      {
        name: "URL Encoder",
        href: "/tools/url-encoder",
        icon: Link2,
      },
      {
        name: "Hash Generator",
        href: "/tools/hash-generator",
        icon: Shield,
      },
      {
        name: "UUID Generator",
        href: "/tools/uuid-generator",
        icon: Fingerprint,
      },
      {
        name: "Color Converter",
        href: "/tools/color-converter",
        icon: Palette,
      },
      {
        name: "Diff Viewer",
        href: "/tools/diff-viewer",
        icon: GitCompare,
      },
      {
        name: "Markdown",
        href: "/tools/markdown-preview",
        icon: FileText,
      },
      {
        name: "Cron Parser",
        href: "/tools/cron-parser",
        icon: Timer,
      },
      {
        name: "Lorem Ipsum",
        href: "/tools/lorem-ipsum",
        icon: FileText,
      },
      {
        name: "Number Convert",
        href: "/tools/number-converter",
        icon: Calculator,
      },
      {
        name: "Case Converter",
        href: "/tools/case-converter",
        icon: CaseSensitive,
      },
      {
        name: "String Escape",
        href: "/tools/string-escape",
        icon: Code,
      },
      {
        name: "QR Generator",
        href: "/tools/qrcode-generator",
        icon: QrCode,
      },
      {
        name: "Password Gen",
        href: "/tools/password-generator",
        icon: Key,
      },
      {
        name: "Text Stats",
        href: "/tools/text-stats",
        icon: BarChart3,
      },
      {
        name: "SQL Formatter",
        href: "/tools/sql-formatter",
        icon: Database,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r-[4px] border-black flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b-[4px] border-black bg-brutal-primary">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-black flex items-center justify-center shadow-[2px_2px_0px_0px_#FFE500] group-hover:shadow-[4px_4px_0px_0px_#FFE500] transition-shadow">
            <Zap className="w-6 h-6 text-brutal-primary" />
          </div>
          <span className="font-bold text-black uppercase tracking-tight text-lg">
            DevTools
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          if (item.children) {
            return (
              <div key={item.name} className="mb-6">
                <div className="flex items-center gap-2 px-3 py-2 text-brutal-text-muted text-xs font-bold uppercase tracking-wider border-b-2 border-black mb-2">
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </div>
                <div className="space-y-1">
                  {item.children.map((child) => {
                    const isActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-100",
                          "border-[2px] border-transparent",
                          isActive
                            ? "bg-brutal-accent text-black border-black shadow-brutal"
                            : "text-brutal-text hover:bg-brutal-bg-alt hover:border-black hover:shadow-brutal-sm"
                        )}
                      >
                        <child.icon className="w-4 h-4" />
                        {child.name}
                        {isActive && (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-100",
                "border-[2px] border-transparent",
                isActive
                  ? "bg-brutal-primary text-black border-black shadow-brutal"
                  : "text-brutal-text hover:bg-brutal-bg-alt hover:border-black hover:shadow-brutal-sm"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t-[4px] border-black bg-brutal-bg-alt">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-100",
            "border-[2px] border-transparent",
            pathname === "/settings"
              ? "bg-brutal-secondary text-black border-black shadow-brutal"
              : "text-brutal-text hover:bg-white hover:border-black hover:shadow-brutal-sm"
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>

        {/* Theme Switcher */}
        <div className="mt-4">
          <ThemeSwitcher />
        </div>

        <div className="px-3 text-xs text-brutal-text-muted font-bold uppercase">
          v1.0.0
        </div>
      </div>
    </aside>
  );
}
