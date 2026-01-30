"use client";

import { useState, useCallback } from "react";
import {
  Key,
  Copy,
  Check,
  RefreshCw,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  excludeSimilar: boolean;
}

interface GeneratedPassword {
  id: string;
  password: string;
  strength: "weak" | "fair" | "good" | "strong";
}

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

const AMBIGUOUS_CHARS = "{}[]()/\\'\"`~,;:.<>";
const SIMILAR_CHARS = "il1Lo0O";

function generatePassword(options: PasswordOptions): string {
  let chars = "";

  if (options.uppercase) chars += CHAR_SETS.uppercase;
  if (options.lowercase) chars += CHAR_SETS.lowercase;
  if (options.numbers) chars += CHAR_SETS.numbers;
  if (options.symbols) chars += CHAR_SETS.symbols;

  if (options.excludeAmbiguous) {
    chars = chars.split("").filter((c) => !AMBIGUOUS_CHARS.includes(c)).join("");
  }

  if (options.excludeSimilar) {
    chars = chars.split("").filter((c) => !SIMILAR_CHARS.includes(c)).join("");
  }

  if (!chars) {
    chars = CHAR_SETS.lowercase + CHAR_SETS.numbers;
  }

  let password = "";
  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  for (let i = 0; i < options.length; i++) {
    password += chars[array[i] % chars.length];
  }

  return password;
}

function calculateStrength(password: string, options: PasswordOptions): "weak" | "fair" | "good" | "strong" {
  let score = 0;

  // Length score
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;

  // Character variety score
  if (options.uppercase && /[A-Z]/.test(password)) score += 1;
  if (options.lowercase && /[a-z]/.test(password)) score += 1;
  if (options.numbers && /[0-9]/.test(password)) score += 1;
  if (options.symbols && /[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 3) return "weak";
  if (score <= 5) return "fair";
  if (score <= 7) return "good";
  return "strong";
}

function getStrengthColor(strength: string): string {
  switch (strength) {
    case "weak": return "bg-brutal-danger";
    case "fair": return "bg-brutal-warning";
    case "good": return "bg-brutal-primary";
    case "strong": return "bg-brutal-success";
    default: return "bg-brutal-bg-alt";
  }
}

function getStrengthLabel(strength: string): string {
  switch (strength) {
    case "weak": return "Weak";
    case "fair": return "Fair";
    case "good": return "Good";
    case "strong": return "Strong";
    default: return "";
  }
}

export default function PasswordGeneratorPage() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
    excludeSimilar: false,
  });
  const [passwords, setPasswords] = useState<GeneratedPassword[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(true);

  const generate = useCallback((count: number = 1) => {
    const newPasswords: GeneratedPassword[] = [];
    for (let i = 0; i < count; i++) {
      const password = generatePassword(options);
      newPasswords.push({
        id: `${Date.now()}-${i}`,
        password,
        strength: calculateStrength(password, options),
      });
    }
    setPasswords((prev) => [...newPasswords, ...prev].slice(0, 50));
  }, [options]);

  const copyPassword = useCallback((id: string, password: string) => {
    navigator.clipboard.writeText(password);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const clear = useCallback(() => {
    setPasswords([]);
  }, []);

  const updateOption = useCallback(<K extends keyof PasswordOptions>(
    key: K,
    value: PasswordOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Ensure at least one character set is selected
  const hasCharSet = options.uppercase || options.lowercase || options.numbers || options.symbols;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-brutal-danger border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black uppercase tracking-tight">
              Password Generator
            </h1>
            <div className="h-1 w-24 bg-brutal-danger mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-4 font-medium">
          강력하고 안전한 비밀번호를 생성합니다. 암호학적으로 안전한 난수 사용.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Options */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <CardTitle className="text-sm">Password Options</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Length */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase text-brutal-text-muted">
                    Length
                  </label>
                  <span className="font-mono text-sm font-bold">{options.length}</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={64}
                  value={options.length}
                  onChange={(e) => updateOption("length", parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-brutal-text-muted mt-1">
                  <span>4</span>
                  <span>64</span>
                </div>
              </div>

              {/* Character Sets */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-brutal-text-muted">
                  Character Sets
                </label>
                {[
                  { key: "uppercase" as const, label: "Uppercase (A-Z)" },
                  { key: "lowercase" as const, label: "Lowercase (a-z)" },
                  { key: "numbers" as const, label: "Numbers (0-9)" },
                  { key: "symbols" as const, label: "Symbols (!@#$...)" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 border-[2px] border-black cursor-pointer transition-colors",
                      options[item.key] ? "bg-brutal-primary" : "bg-white hover:bg-brutal-bg-alt"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={options[item.key]}
                      onChange={(e) => updateOption(item.key, e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-bold">{item.label}</span>
                  </label>
                ))}
              </div>

              {/* Exclusions */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-brutal-text-muted">
                  Exclusions
                </label>
                <label className="flex items-center gap-3 px-3 py-2 border-[2px] border-black cursor-pointer hover:bg-brutal-bg-alt">
                  <input
                    type="checkbox"
                    checked={options.excludeAmbiguous}
                    onChange={(e) => updateOption("excludeAmbiguous", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-bold">Exclude Ambiguous</span>
                </label>
                <label className="flex items-center gap-3 px-3 py-2 border-[2px] border-black cursor-pointer hover:bg-brutal-bg-alt">
                  <input
                    type="checkbox"
                    checked={options.excludeSimilar}
                    onChange={(e) => updateOption("excludeSimilar", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-bold">Exclude Similar (il1Lo0O)</span>
                </label>
              </div>

              {/* Generate Buttons */}
              <div className="space-y-2 pt-2">
                <Button onClick={() => generate(1)} className="w-full" size="lg" disabled={!hasCharSet}>
                  <RefreshCw className="w-5 h-5" />
                  Generate Password
                </Button>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 20].map((n) => (
                    <Button
                      key={n}
                      onClick={() => generate(n)}
                      variant="outline"
                      size="sm"
                      disabled={!hasCharSet}
                    >
                      ×{n}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="bg-brutal-bg-alt">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Security</span>
              </div>
              <p className="text-xs text-brutal-text-muted">
                * crypto.getRandomValues() 사용
              </p>
              <p className="text-xs text-brutal-text-muted">
                * 모든 생성은 브라우저에서 수행
              </p>
              <p className="text-xs text-brutal-text-muted">
                * 서버로 전송되지 않음
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Generated Passwords */}
        <div className="lg:col-span-2 space-y-4">
          {passwords.length > 0 ? (
            <Card>
              <CardHeader className="border-b-[3px] border-black bg-brutal-danger">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Generated Passwords ({passwords.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowPasswords(!showPasswords)}
                      variant="outline"
                      size="sm"
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button onClick={clear} variant="outline" size="sm">
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-auto divide-y-[2px] divide-black">
                  {passwords.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 hover:bg-brutal-bg-alt group"
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-8 flex-shrink-0",
                          getStrengthColor(item.strength)
                        )} />
                        <div className="flex-1 min-w-0">
                          <code className="font-mono text-sm block truncate">
                            {showPasswords ? item.password : "•".repeat(item.password.length)}
                          </code>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="default"
                              className={getStrengthColor(item.strength)}
                            >
                              {getStrengthLabel(item.strength)}
                            </Badge>
                            <span className="text-xs text-brutal-text-muted">
                              {item.password.length} chars
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => copyPassword(item.id, item.password)}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center p-12">
                <div className="w-20 h-20 bg-brutal-bg-alt border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center mx-auto mb-6">
                  <Key className="w-10 h-10 text-brutal-text-muted" />
                </div>
                <p className="text-brutal-text-muted font-bold uppercase tracking-wide">
                  Click Generate to create passwords
                </p>
                <p className="text-brutal-text-muted text-xs mt-2">
                  Secure & random passwords
                </p>
              </CardContent>
            </Card>
          )}

          {/* Strength Legend */}
          <Card className="bg-brutal-bg-alt">
            <CardContent className="p-4">
              <p className="text-xs font-bold uppercase text-brutal-text-muted mb-3">
                Password Strength
              </p>
              <div className="flex gap-4">
                {["weak", "fair", "good", "strong"].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={cn("w-4 h-4", getStrengthColor(s))} />
                    <span className="text-xs font-bold capitalize">{s}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
