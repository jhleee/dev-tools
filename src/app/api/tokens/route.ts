import { NextRequest, NextResponse } from "next/server";
import { analyzeTokens } from "@/lib/tokenizers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, anthropicApiKey, googleApiKey } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (text.length > 1_000_000) {
      return NextResponse.json(
        { error: "Text too large. Maximum 1MB allowed." },
        { status: 400 }
      );
    }

    const result = await analyzeTokens(text, {
      anthropicApiKey,
      googleApiKey,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Token analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze tokens" },
      { status: 500 }
    );
  }
}
