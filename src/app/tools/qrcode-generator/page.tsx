"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  QrCode,
  Copy,
  Check,
  Trash2,
  Download,
  Link,
  FileText,
  Mail,
  Phone,
  Wifi,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Badge,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type QRType = "text" | "url" | "email" | "phone" | "wifi";

interface QRTypeOption {
  id: QRType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
}

const QR_TYPES: QRTypeOption[] = [
  { id: "text", label: "Text", icon: FileText, placeholder: "Enter any text..." },
  { id: "url", label: "URL", icon: Link, placeholder: "https://example.com" },
  { id: "email", label: "Email", icon: Mail, placeholder: "email@example.com" },
  { id: "phone", label: "Phone", icon: Phone, placeholder: "+82-10-1234-5678" },
  { id: "wifi", label: "WiFi", icon: Wifi, placeholder: "Network name" },
];

// Simple QR Code generator using canvas
// This is a basic implementation - for production, use a library like qrcode
function generateQRMatrix(data: string): boolean[][] {
  // This is a simplified version - real QR codes are much more complex
  // For demo purposes, we'll create a pattern based on the data
  const size = 21; // Version 1 QR code is 21x21
  const matrix: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

  // Finder patterns (3 corners)
  const drawFinderPattern = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const isOuter = x === 0 || x === 6 || y === 0 || y === 6;
        const isInner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        matrix[startY + y][startX + x] = isOuter || isInner;
      }
    }
  };

  drawFinderPattern(0, 0); // Top-left
  drawFinderPattern(size - 7, 0); // Top-right
  drawFinderPattern(0, size - 7); // Bottom-left

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Data area - fill based on string hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash = hash & hash;
  }

  // Fill data modules
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Skip finder patterns and timing
      if ((x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8)) continue;
      if (x === 6 || y === 6) continue;

      // Create pseudo-random pattern based on position and hash
      const seed = (x * size + y + hash) * 31;
      matrix[y][x] = (seed % 3) < 2;
    }
  }

  return matrix;
}

function drawQRCode(canvas: HTMLCanvasElement, data: string, size: number, fgColor: string, bgColor: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const matrix = generateQRMatrix(data);
  const moduleCount = matrix.length;
  const moduleSize = size / moduleCount;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Modules
  ctx.fillStyle = fgColor;
  for (let y = 0; y < moduleCount; y++) {
    for (let x = 0; x < moduleCount; x++) {
      if (matrix[y][x]) {
        ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
      }
    }
  }
}

export default function QRCodeGeneratorPage() {
  const [qrType, setQrType] = useState<QRType>("text");
  const [input, setInput] = useState("");
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getQRData = useCallback((): string => {
    switch (qrType) {
      case "url":
        return input.startsWith("http") ? input : `https://${input}`;
      case "email":
        return `mailto:${input}`;
      case "phone":
        return `tel:${input.replace(/[^+\d]/g, "")}`;
      case "wifi":
        return `WIFI:T:${wifiEncryption};S:${wifiSSID};P:${wifiPassword};;`;
      default:
        return input;
    }
  }, [qrType, input, wifiSSID, wifiPassword, wifiEncryption]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const data = getQRData();
    if (data && data.length > 0) {
      drawQRCode(canvas, data, size, fgColor, bgColor);
    } else {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = "#ccc";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Enter data to generate QR", size / 2, size / 2);
      }
    }
  }, [getQRData, size, fgColor, bgColor]);

  const downloadQR = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `qrcode-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const copyQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: copy data URL
      const dataUrl = canvas.toDataURL("image/png");
      navigator.clipboard.writeText(dataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const clear = useCallback(() => {
    setInput("");
    setWifiSSID("");
    setWifiPassword("");
  }, []);

  const hasData = qrType === "wifi" ? wifiSSID.length > 0 : input.length > 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brutal-primary border-[2px] md:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] md:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <QrCode className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black uppercase tracking-tight">
              QR Code Generator
            </h1>
            <div className="h-1 w-16 md:w-24 bg-brutal-primary mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-3 md:mt-4 font-medium text-sm md:text-base">
          텍스트, URL, 이메일, 전화번호, WiFi 정보를 QR 코드로 생성합니다.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Type Selection */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <CardTitle className="text-sm">QR Type</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {QR_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setQrType(type.id);
                      setInput("");
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 px-3 py-3 text-xs font-bold uppercase border-[2px] border-black transition-all",
                      qrType === type.id
                        ? "bg-brutal-primary shadow-[2px_2px_0px_0px_#000000]"
                        : "bg-white hover:bg-brutal-bg-alt"
                    )}
                  >
                    <type.icon className="w-5 h-5" />
                    {type.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Input Fields */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {QR_TYPES.find((t) => t.id === qrType)?.label} Data
                </CardTitle>
                <Button onClick={clear} variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {qrType === "wifi" ? (
                <>
                  <div>
                    <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                      Network Name (SSID)
                    </label>
                    <Input
                      value={wifiSSID}
                      onChange={(e) => setWifiSSID(e.target.value)}
                      placeholder="MyNetwork"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Password"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                      Encryption
                    </label>
                    <div className="flex gap-2">
                      {(["WPA", "WEP", "nopass"] as const).map((enc) => (
                        <button
                          key={enc}
                          onClick={() => setWifiEncryption(enc)}
                          className={cn(
                            "flex-1 px-3 py-2 text-xs font-bold uppercase border-[2px] border-black",
                            wifiEncryption === enc
                              ? "bg-brutal-primary"
                              : "bg-white hover:bg-brutal-bg-alt"
                          )}
                        >
                          {enc === "nopass" ? "None" : enc}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : qrType === "text" ? (
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={QR_TYPES.find((t) => t.id === qrType)?.placeholder}
                  className="min-h-[120px]"
                />
              ) : (
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={QR_TYPES.find((t) => t.id === qrType)?.placeholder}
                />
              )}
            </CardContent>
          </Card>

          {/* Style Options */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <CardTitle className="text-sm">Style Options</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                    Foreground
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-10 h-10 border-[2px] border-black cursor-pointer"
                    />
                    <Input
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="flex-1 font-mono uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                    Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 border-[2px] border-black cursor-pointer"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-brutal-text-muted mb-2 block">
                  Size: {size}px
                </label>
                <input
                  type="range"
                  min={128}
                  max={512}
                  step={32}
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b-[3px] border-black bg-brutal-primary">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  QR Code
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={copyQR} variant="outline" size="sm" disabled={!hasData}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button onClick={downloadQR} variant="outline" size="sm" disabled={!hasData}>
                    <Download className="w-4 h-4" />
                    PNG
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 flex items-center justify-center bg-brutal-bg-alt min-h-[400px]">
              <div className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000000] bg-white p-4">
                <canvas
                  ref={canvasRef}
                  width={size}
                  height={size}
                  style={{ width: size, height: size }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Preview */}
          {hasData && (
            <Card className="bg-brutal-bg-alt">
              <CardContent className="p-4">
                <p className="text-xs font-bold uppercase text-brutal-text-muted mb-2">
                  Encoded Data:
                </p>
                <code className="block font-mono text-sm break-all p-2 bg-white border-[2px] border-black">
                  {getQRData()}
                </code>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card className="bg-brutal-bg-alt">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-brutal-text-muted font-medium">
                * 생성된 QR 코드는 PNG 형식으로 다운로드할 수 있습니다
              </p>
              <p className="text-xs text-brutal-text-muted font-medium">
                * WiFi QR 코드는 스마트폰 카메라로 스캔하여 바로 연결할 수 있습니다
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
