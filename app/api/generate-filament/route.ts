import { NextRequest, NextResponse } from "next/server";

function extractOutputText(data: any) {
  if (typeof data?.output_text === "string") return data.output_text;
  const parts: string[] = [];
  for (const item of data?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (content?.type === "output_text" && typeof content?.text === "string") {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n").trim();
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured in Vercel." },
      { status: 503 }
    );
  }

  const { material } = await req.json();
  if (!material || typeof material !== "string") {
    return NextResponse.json({ error: "Material is required." }, { status: 400 });
  }

  const prompt = `
You create Romanian educational social-media content for Tekreart, a 3D-printing shop in Moldova.

Task: research and prepare a concise content pack about drying ${material} filament.

Rules:
- Prefer official Creality information when available. Use reliable manufacturer information when Creality does not provide a clear value.
- Never invent a temperature or drying time. If sources disagree, give a safe range and say it can vary by specific product.
- Write in Romanian, clear and practical, not exaggerated marketing language.
- Keep the slide copy short enough for an Instagram carousel.
- Caption should be useful, natural, and include a light CTA to check Tekreart filament availability.

Return EXACTLY this structure, without markdown tables:
TEMPERATURĂ: ...
TIMP: ...
SLIDE: ...
CAPTION: ...
NOTĂ: ...
`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.6-terra",
        input: prompt,
        tools: [{ type: "web_search" }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message ?? "OpenAI request failed." },
        { status: response.status }
      );
    }

    return NextResponse.json({ text: extractOutputText(data) });
  } catch {
    return NextResponse.json({ error: "Could not reach OpenAI." }, { status: 500 });
  }
}
