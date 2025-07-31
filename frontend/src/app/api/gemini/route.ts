import { NextRequest, NextResponse } from "next/server";

// Since we're using the REST API directly, we don't need the SDK here
// This route is optional - you can also call Gemini directly from the client

export async function POST(request: NextRequest) {
  try {
    const { prompt, config } = await request.json();

    // Use server-side API key for better security
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: config?.temperature || 0.7,
            topK: config?.topK || 40,
            topP: config?.topP || 0.95,
            maxOutputTokens: config?.maxOutputTokens || 2048,
            ...(config?.responseType === "json" && {
              responseMimeType: "application/json",
            }),
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Gemini API error");
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 },
    );
  }
}
