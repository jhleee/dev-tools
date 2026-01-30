"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Palette,
  Copy,
  Check,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface ColorValues {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function rgbToHsv(
  r: number,
  g: number,
  b: number
): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

const PRESET_COLORS = [
  "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3",
  "#FF6B9D", "#00D4FF", "#7CFF00", "#FFE500", "#FF3B3B", "#000000", "#FFFFFF",
];

export default function ColorConverterPage() {
  const [color, setColor] = useState<ColorValues>({
    hex: "#FF6B9D",
    rgb: { r: 255, g: 107, b: 157 },
    hsl: { h: 340, s: 100, l: 71 },
    hsv: { h: 340, s: 58, v: 100 },
  });
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [hexInput, setHexInput] = useState("#FF6B9D");

  const updateFromHex = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setColor({ hex: hex.toUpperCase(), rgb, hsl, hsv });
      setHexInput(hex.toUpperCase());
    }
  }, []);

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    setColor({ hex: hex.toUpperCase(), rgb: { r, g, b }, hsl, hsv });
    setHexInput(hex.toUpperCase());
  }, []);

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    setColor({ hex: hex.toUpperCase(), rgb, hsl: { h, s, l }, hsv });
    setHexInput(hex.toUpperCase());
  }, []);

  const handleHexChange = useCallback((value: string) => {
    setHexInput(value);
    if (/^#?[0-9A-Fa-f]{6}$/.test(value)) {
      updateFromHex(value.startsWith("#") ? value : `#${value}`);
    }
  }, [updateFromHex]);

  const copyValue = useCallback((format: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  }, []);

  const randomColor = useCallback(() => {
    const hex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    updateFromHex(hex);
  }, [updateFromHex]);

  const contrastColor = getContrastColor(color.hex);

  const colorFormats = [
    { id: "hex", label: "HEX", value: color.hex },
    { id: "rgb", label: "RGB", value: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})` },
    { id: "rgba", label: "RGBA", value: `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, 1)` },
    { id: "hsl", label: "HSL", value: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)` },
    { id: "hsv", label: "HSV", value: `hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)` },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-brutal-secondary border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
            <Palette className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black uppercase tracking-tight">
              Color Converter
            </h1>
            <div className="h-1 w-24 bg-brutal-secondary mt-1" />
          </div>
        </div>
        <p className="text-brutal-text-muted mt-4 font-medium">
          HEX, RGB, HSL, HSV 색상 값을 상호 변환합니다.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Preview & Picker */}
        <div className="space-y-4">
          {/* Color Preview */}
          <Card>
            <CardContent className="p-0">
              <div
                className="h-48 border-b-[3px] border-black flex items-center justify-center"
                style={{ backgroundColor: color.hex }}
              >
                <span
                  className="text-2xl font-bold uppercase"
                  style={{ color: contrastColor }}
                >
                  {color.hex}
                </span>
              </div>
              <div className="p-4 flex items-center gap-4">
                <Input
                  type="color"
                  value={color.hex}
                  onChange={(e) => updateFromHex(e.target.value)}
                  className="w-16 h-12 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#FF6B9D"
                  className="flex-1 font-mono uppercase"
                />
                <Button onClick={randomColor} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4" />
                  Random
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* RGB Sliders */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <CardTitle className="text-sm">RGB Values</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {(["r", "g", "b"] as const).map((channel) => (
                <div key={channel} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase">
                      {channel === "r" ? "Red" : channel === "g" ? "Green" : "Blue"}
                    </label>
                    <span className="font-mono text-sm">{color.rgb[channel]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={color.rgb[channel]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      updateFromRgb(
                        channel === "r" ? val : color.rgb.r,
                        channel === "g" ? val : color.rgb.g,
                        channel === "b" ? val : color.rgb.b
                      );
                    }}
                    className={cn(
                      "w-full h-3 rounded-none appearance-none cursor-pointer border-[2px] border-black",
                      channel === "r" && "accent-red-500",
                      channel === "g" && "accent-green-500",
                      channel === "b" && "accent-blue-500"
                    )}
                    style={{
                      background: `linear-gradient(to right, ${
                        channel === "r" ? "#000" : channel === "g" ? "#000" : "#000"
                      }, ${
                        channel === "r" ? "#ff0000" : channel === "g" ? "#00ff00" : "#0000ff"
                      })`,
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* HSL Sliders */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <CardTitle className="text-sm">HSL Values</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase">Hue</label>
                  <span className="font-mono text-sm">{color.hsl.h}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={color.hsl.h}
                  onChange={(e) =>
                    updateFromHsl(parseInt(e.target.value), color.hsl.s, color.hsl.l)
                  }
                  className="w-full h-3 rounded-none appearance-none cursor-pointer border-[2px] border-black"
                  style={{
                    background:
                      "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase">Saturation</label>
                  <span className="font-mono text-sm">{color.hsl.s}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={color.hsl.s}
                  onChange={(e) =>
                    updateFromHsl(color.hsl.h, parseInt(e.target.value), color.hsl.l)
                  }
                  className="w-full h-3 rounded-none appearance-none cursor-pointer border-[2px] border-black bg-gray-200"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase">Lightness</label>
                  <span className="font-mono text-sm">{color.hsl.l}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={color.hsl.l}
                  onChange={(e) =>
                    updateFromHsl(color.hsl.h, color.hsl.s, parseInt(e.target.value))
                  }
                  className="w-full h-3 rounded-none appearance-none cursor-pointer border-[2px] border-black"
                  style={{
                    background: "linear-gradient(to right, #000, #888, #fff)",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Formats & Presets */}
        <div className="space-y-4">
          {/* Color Formats */}
          <Card>
            <CardHeader className="border-b-[3px] border-black bg-brutal-primary">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Color Formats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y-[2px] divide-black">
              {colorFormats.map((format) => (
                <div
                  key={format.id}
                  className="flex items-center justify-between p-4 hover:bg-brutal-bg-alt"
                >
                  <div>
                    <Badge variant="default">{format.label}</Badge>
                    <code className="block font-mono text-sm mt-1">
                      {format.value}
                    </code>
                  </div>
                  <Button
                    onClick={() => copyValue(format.id, format.value)}
                    variant="outline"
                    size="sm"
                  >
                    {copiedFormat === format.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Preset Colors */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <CardTitle className="text-sm">Preset Colors</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => updateFromHex(preset)}
                    className={cn(
                      "w-full aspect-square border-[2px] border-black transition-all hover:scale-110",
                      color.hex.toUpperCase() === preset.toUpperCase() &&
                        "ring-2 ring-offset-2 ring-black"
                    )}
                    style={{ backgroundColor: preset }}
                    title={preset}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Color Variations */}
          <Card>
            <CardHeader className="border-b-[3px] border-black">
              <CardTitle className="text-sm">Shades & Tints</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold uppercase text-brutal-text-muted mb-2">
                    Shades (Darker)
                  </p>
                  <div className="flex gap-1">
                    {[0.8, 0.6, 0.4, 0.2].map((factor) => {
                      const shade = rgbToHex(
                        Math.round(color.rgb.r * factor),
                        Math.round(color.rgb.g * factor),
                        Math.round(color.rgb.b * factor)
                      );
                      return (
                        <button
                          key={factor}
                          onClick={() => updateFromHex(shade)}
                          className="flex-1 h-10 border-[2px] border-black hover:scale-105 transition-transform"
                          style={{ backgroundColor: shade }}
                          title={shade}
                        />
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-brutal-text-muted mb-2">
                    Tints (Lighter)
                  </p>
                  <div className="flex gap-1">
                    {[0.2, 0.4, 0.6, 0.8].map((factor) => {
                      const tint = rgbToHex(
                        Math.round(color.rgb.r + (255 - color.rgb.r) * factor),
                        Math.round(color.rgb.g + (255 - color.rgb.g) * factor),
                        Math.round(color.rgb.b + (255 - color.rgb.b) * factor)
                      );
                      return (
                        <button
                          key={factor}
                          onClick={() => updateFromHex(tint)}
                          className="flex-1 h-10 border-[2px] border-black hover:scale-105 transition-transform"
                          style={{ backgroundColor: tint }}
                          title={tint}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-brutal-bg-alt">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-brutal-text-muted font-medium">
                * HEX: 웹에서 가장 널리 사용되는 색상 표기법
              </p>
              <p className="text-xs text-brutal-text-muted font-medium">
                * RGB: 빛의 삼원색 기반 (Red, Green, Blue)
              </p>
              <p className="text-xs text-brutal-text-muted font-medium">
                * HSL: 색상(Hue), 채도(Saturation), 명도(Lightness)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
