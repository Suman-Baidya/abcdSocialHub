import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createTenantRepository } from "@abcd/db";
import { z } from "zod";

const generateSchema = z.object({
  brief: z.string().min(5, "Brief must be at least 5 characters"),
  language: z.enum(["english", "bengali", "hindi"]).default("english"),
  tone: z.string().default("promotional"),
});

// Resilient AI Generator with 3-tier Quota Failover
async function callAiWithFailover(prompt: string, systemPrompt: string) {
  const providers = [
    {
      name: "Groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: process.env.GROQ_API_KEY,
      model: "openai/gpt-oss-20b",
    },
    {
      name: "NVIDIA NIM",
      url: "https://integrate.api.nvidia.com/v1/chat/completions",
      key: process.env.NVIDIA_API_KEY,
      model: "deepseek-ai/deepseek-v4.1-flash",
    },
    {
      name: "OpenRouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: process.env.OPENROUTER_API_KEY,
      model: "nvidia/nemotron-3.5-lightning:free",
    },
  ];

  for (const provider of providers) {
    if (!provider.key) continue;

    try {
      const res = await fetch(provider.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${provider.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1200,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return { content, provider: provider.name };
        }
      } else {
        console.warn(`[AI Router] ${provider.name} failed with status ${res.status}. Falling over...`);
      }
    } catch (err) {
      console.warn(`[AI Router] Error connecting to ${provider.name}:`, err);
    }
  }

  throw new Error("All AI providers are currently busy or out of quota. Please retry.");
}

// Turnitout anti-slop scrubber and strict emoji remover
function removeEmojis(text: string): string {
  if (!text) return "";
  return text
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, "")
    .replace(/[\u2600-\u27BF]/g, "")
    .replace(/[✨🔥👉💆💇🌸✅💰🙏💫🎉🚀👍❤️💡⭐]/g, "")
    .replace(/  +/g, " ")
    .trim();
}

function scrubAiSlop(text: string): string {
  const slopWords = [
    /\bdelve\b/gi,
    /\btapestry\b/gi,
    /\btestament\b/gi,
    /\bbeacon\b/gi,
    /\bin today's digital world\b/gi,
    /\bunlock your potential\b/gi,
    /\belevate your\b/gi,
  ];

  let cleaned = text;
  slopWords.forEach((regex) => {
    cleaned = cleaned.replace(regex, "");
  });
  return removeEmojis(cleaned);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const workspaceId = (session?.user as any)?.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = generateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { brief, language, tone } = result.data;
    const repo = createTenantRepository(workspaceId);
    const brandKit = await repo.getBrandKit();

    const businessName = brandKit?.businessName || "ABCD Social Hub";
    const phoneNumber = brandKit?.phoneNumber || "+91 8944899747";
    const whatsapp = "8167685731";

    const systemPrompt = `You are a high-converting direct-response copywriter for local service businesses in India.
Your mission: Turn promo briefs into multi-platform marketing assets (Instagram, Facebook, LinkedIn, X, and WhatsApp Broadcast).
Rules:
1. Language: ${language === "bengali" ? "Bengali (বাংলা) for natural regional connect, with clear English offer punchlines." : language === "hindi" ? "Hindi (हिन्दी) with modern Indian business terms." : "Punchy, modern Indian English with natural rhythm"}.
2. STRICT RULE: NEVER USE ANY EMOJIS, emoticons, or decorative icons in any part of the headline, copy, or bullet points. Use clean, professional language and standard punctuation only.
3. Never invent fake discounts or unmentioned guarantees.
4. Tone: ${tone}.
5. Return ONLY a valid JSON object with this exact structure:
{
  "instagram": "Hook line\\n\\nBody text with value\\n\\nCTA: DM or call ${phoneNumber}\\n\\n#hashtags",
  "facebook": "Relatable community story\\n\\nOffer details\\n\\nClick to chat on WhatsApp: https://wa.me/91${whatsapp}",
  "linkedin": "Professional industry lesson or insight leading into the offer.\\n\\nQuestion to spark comments.",
  "x": "Punchy 280-char curiosity hook with offer CTA.",
  "whatsapp": "Special Offer from ${businessName}\\n\\n${brief}\\n\\nCall: ${phoneNumber}\\nReply directly to claim this offer today.",
  "headline": "Short 5-8 word promotional headline for poster",
  "reelHook": "0-3s high-energy vocal hook without emojis",
  "reelBody": "3-20s relatable problem, solution and client benefit",
  "reelCta": "20-30s direct action step"
}`;

    const prompt = `Business Name: ${businessName}\nPromo Brief: "${brief}"\nContact: ${phoneNumber}`;

    const { content, provider } = await callAiWithFailover(prompt, systemPrompt);

    // Parse JSON
    let jsonContent;
    try {
      const match = content.match(/\{[\s\S]*\}/);
      jsonContent = match ? JSON.parse(match[0]) : JSON.parse(content);
    } catch (e) {
      // Fallback object if LLM returned unstructured text
      jsonContent = {
        instagram: scrubAiSlop(content),
        facebook: `Special offer from ${businessName}. ${scrubAiSlop(brief)}\n\nWhatsApp: https://wa.me/91${whatsapp}`,
        linkedin: `Reflecting on service excellence at ${businessName}. ${scrubAiSlop(brief)}`,
        x: `${brief} at ${businessName}. Call ${phoneNumber} now.`,
        whatsapp: `Special Offer from ${businessName}\n\n${scrubAiSlop(brief)}\n\nCall: ${phoneNumber}`,
        headline: brief.slice(0, 40),
        reelHook: "Stop scrolling if you want to look and feel your absolute best this week.",
        reelBody: scrubAiSlop(brief),
        reelCta: `Visit ${businessName} or call ${phoneNumber} today.`,
      };
    }

    // Call Python worker to render 1080x1080 Bengali/English poster with Cloudinary CDN
    let posterUrl = "";
    try {
      const workerUrl = process.env.PYTHON_WORKER_URL || "http://localhost:8000";
      const posterRes = await fetch(`${workerUrl}/api/render-poster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Secret": process.env.INTERNAL_API_SECRET || "",
        },
        body: JSON.stringify({
          headline: jsonContent.headline || brief.slice(0, 45),
          subheadline: brief.length > 45 ? brief.slice(0, 100) : "Special promotional offer. Contact us today for details.",
          discount_tag: "LIMITED TIME OFFER",
          business_name: businessName,
          phone_number: phoneNumber,
          address: brandKit?.addressBanner || "Kolkata, West Bengal",
          language: language,
          brand_primary_color: brandKit?.primaryColor || "#00F0FF",
          logo_url: brandKit?.logoUrl || null,
          width: 1080,
          height: 1350,
          aspect_ratio: "4:5",
        }),
      });

      if (posterRes.ok) {
        const posterData = await posterRes.json();
        posterUrl = posterData.media_url;
      }
    } catch (workerErr) {
      console.warn("Poster render worker call failed, falling back to client preview:", workerErr);
    }

    // Record credit usage in append-only UsageLedger
    await repo.recordUsage("AI_COPY_GENERATE", 1, { provider, language, tone, hasPoster: Boolean(posterUrl) });

    return NextResponse.json({
      success: true,
      provider,
      posterUrl,
      copy: {
        instagram: scrubAiSlop(jsonContent.instagram),
        facebook: scrubAiSlop(jsonContent.facebook),
        linkedin: scrubAiSlop(jsonContent.linkedin),
        x: scrubAiSlop(jsonContent.x),
        whatsapp: scrubAiSlop(jsonContent.whatsapp || `Special Offer from ${businessName}\n\n${brief}\n\nCall: ${phoneNumber}`),
        headline: jsonContent.headline || brief.slice(0, 40),
        reelHook: jsonContent.reelHook || "Stop scrolling if you want to look and feel your absolute best this week!",
        reelBody: jsonContent.reelBody || scrubAiSlop(brief),
        reelCta: jsonContent.reelCta || `Visit ${businessName} or call ${phoneNumber} today!`,
      },
    });
  } catch (error: any) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate content. Please try again." },
      { status: 500 }
    );
  }
}
