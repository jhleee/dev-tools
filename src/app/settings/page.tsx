"use client";

import { useState } from "react";
import { Settings, Key, Save, Check } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Badge,
} from "@/components/ui";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-brutal-secondary border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Settings className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black uppercase tracking-tight">
              Settings
            </h1>
            <div className="h-1 w-20 bg-brutal-secondary mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-4 font-medium">
          애플리케이션 설정을 관리합니다.
        </p>
      </header>

      {/* API Keys Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brutal-warning border-[2px] border-black shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center">
              <Key className="w-4 h-4 text-black" />
            </div>
            <div>
              <CardTitle className="text-lg">API Keys</CardTitle>
              <CardDescription className="mt-1">
                API 키는 서버의 환경 변수로 설정하는 것을 권장합니다.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-black mb-2">
                ANTHROPIC_API_KEY
              </label>
              <div className="flex gap-3 items-stretch">
                <Input
                  type="password"
                  placeholder="서버 환경 변수로 설정됨"
                  disabled
                  className="flex-1 opacity-60"
                />
                <Badge variant="success" className="h-11 px-4">
                  환경 변수
                </Badge>
              </div>
              <p className="text-xs text-brutal-text-muted mt-2 font-medium">
                Claude API 토큰 카운트에 사용됩니다
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-black mb-2">
                GOOGLE_API_KEY
              </label>
              <div className="flex gap-3 items-stretch">
                <Input
                  type="password"
                  placeholder="서버 환경 변수로 설정됨"
                  disabled
                  className="flex-1 opacity-60"
                />
                <Badge variant="success" className="h-11 px-4">
                  환경 변수
                </Badge>
              </div>
              <p className="text-xs text-brutal-text-muted mt-2 font-medium">
                Gemini API 토큰 카운트에 사용됩니다
              </p>
            </div>
          </div>

          {/* Info - 단순 텍스트로 (박스 중첩 제거) */}
          <div className="pt-4 border-t-[2px] border-black">
            <p className="text-sm font-bold text-black mb-2">
              환경 변수 설정 방법:
            </p>
            <code className="block text-xs text-brutal-text-muted font-mono whitespace-pre">
{`# .env.local
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...`}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide text-black mb-2">
              Theme
            </label>
            <select className="w-full h-11 px-4 bg-white text-black font-bold border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] focus:outline-none focus:shadow-[6px_6px_0px_0px_#000000] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-100 cursor-pointer">
              <option value="light">Light (Neo-Brutalism)</option>
              <option value="dark" disabled>
                Dark (Coming Soon)
              </option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} size="lg">
        {saved ? (
          <>
            <Check className="w-5 h-5" />
            저장됨
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            설정 저장
          </>
        )}
      </Button>
    </div>
  );
}
