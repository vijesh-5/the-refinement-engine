import { geminiService } from "./gemini.service";
import { logger } from "../config/logger";
import { env } from "../config/env";

export interface LightweightInput {
  topic: string;
  audience: string;
  tone: string;
  keywords: string[];
  length: string;
  intent?: string;
  funnelStage?: string;
  objective?: string;
  brand?: {
    name: string;
    tone: string;
    brandVoice?: string;
    targetAudience?: string;
    bannedWords: string[];
  };
}

export interface LightweightOutput {
  title: string;
  metaDescription: string;
  outline: string[];
  finalContent: string;
  wordCount: number;
  seoInsights: string;
  conversionInsights: string;
  reasoningSummary: string;
}

/**
 * Resolves the effective pipeline mode.
 * "auto" → uses "light" for Ollama, "full" for Gemini.
 */
export function getPipelineMode(): "full" | "light" {
  const mode = env.PIPELINE_MODE;
  if (mode === "light") return "light";
  if (mode === "full") return "full";
  // auto: detect from provider
  return env.AI_PROVIDER === "ollama" ? "light" : "full";
}

class LightweightGeneratorService {
  /**
   * Single-call generation — replaces the 4-agent pipeline for local mode.
   * One structured prompt → deterministic metadata extraction.
   */
  async generate(input: LightweightInput): Promise<LightweightOutput> {
    const start = Date.now();
    logger.info("PIPELINE", `Lightweight generation for: "${input.topic}"`);

    // Build a concise, structured prompt (~400 tokens)
    const prompt = this.buildPrompt(input);

    // Single LLM call
    const raw = await geminiService.generateContent(prompt, {
      json: false,
    });

    logger.info("PIPELINE", `Lightweight generation complete`, { durationMs: Date.now() - start });

    // Extract metadata deterministically from markdown output
    return this.parseMarkdownOutput(raw, input);
  }

  private buildPrompt(input: LightweightInput): string {
    // Truncate brand memory to keep prompt short
    const brandSnippet = input.brand
      ? `Brand: ${input.brand.name} | Tone: ${input.brand.tone}${input.brand.bannedWords.length > 0 ? ` | Avoid: ${input.brand.bannedWords.slice(0, 5).join(", ")}` : ""}`
      : "";

    const funnelHint = input.funnelStage
      ? `Funnel: ${input.funnelStage}${input.funnelStage === "TOFU" ? " (educational, broad)" : input.funnelStage === "MOFU" ? " (comparison, solution-aware)" : " (decision, conversion-focused)"}`
      : "";

    const objectiveHint = input.objective
      ? `Goal: ${input.objective === "traffic" ? "maximize reach and shares" : input.objective === "leads" ? "capture leads with strong CTAs" : "drive direct sales"}`
      : "";

    return `You are an expert SEO + conversion copywriter.

Write a blog post in clean Markdown.

Topic: ${input.topic}
Audience: ${input.audience}
Tone: ${input.tone}
Keywords: ${input.keywords.join(", ") || "none specified"}
Length: ${input.length}
Intent: ${input.intent || "Informative"}
${brandSnippet}
${funnelHint}
${objectiveHint}

Rules:
- Start with a compelling # title on line 1
- Use ## and ### headings for structure
- Place keywords naturally in headings and first paragraph
- Include a clear call-to-action near the end
- Use bullet points, bold text, and questions for engagement
- Write in clean Markdown only — no HTML tags
- Keep paragraphs short (3-4 sentences max)`;
  }

  /**
   * Extract title, meta description, outline, and insights from raw markdown.
   * Zero LLM calls — pure regex/string manipulation.
   */
  private parseMarkdownOutput(raw: string, input: LightweightInput): LightweightOutput {
    const lines = raw.split("\n");

    // Extract title from first # heading
    let title = input.topic;
    for (const line of lines) {
      const match = line.match(/^#\s+(.+)/);
      if (match) {
        title = match[1].replace(/[*_`]/g, "").trim();
        break;
      }
    }

    // Extract outline from ## headings
    const outline: string[] = [];
    for (const line of lines) {
      const match = line.match(/^##\s+(.+)/);
      if (match) {
        outline.push(match[1].replace(/[*_`]/g, "").trim());
      }
    }

    // Extract meta description from first substantial paragraph
    let metaDescription = "";
    const contentWithoutTitle = raw.replace(/^#\s+.+\n*/m, "").trim();
    const paragraphs = contentWithoutTitle.split(/\n{2,}/);
    for (const p of paragraphs) {
      const clean = p.replace(/[#*_`>\[\]()-]/g, " ").replace(/\s+/g, " ").trim();
      if (clean.length >= 50 && !clean.startsWith("##")) {
        metaDescription = clean.slice(0, 160);
        if (metaDescription.length === 160) {
          // Truncate at last word boundary
          const lastSpace = metaDescription.lastIndexOf(" ");
          if (lastSpace > 100) metaDescription = metaDescription.slice(0, lastSpace) + "...";
        }
        break;
      }
    }

    if (!metaDescription) {
      metaDescription = `${title} — a guide for ${input.audience}`;
    }

    // Word count
    const wordCount = raw.split(/\s+/).filter(w => w.length > 0).length;

    // Simple deterministic insights
    const hasKeywordsInHeadings = input.keywords.some(kw =>
      outline.some(h => h.toLowerCase().includes(kw.toLowerCase()))
    );
    const hasCTA = /\b(get started|try|start|join|sign up|subscribe|download|learn more|contact|book|claim)\b/i.test(raw);

    const seoInsights = hasKeywordsInHeadings
      ? "Keywords placed in headings for strong SEO signals."
      : "Consider adding target keywords to your headings for better SEO.";

    const conversionInsights = hasCTA
      ? "Content includes a call-to-action for reader engagement."
      : "Consider adding a clear CTA to drive reader action.";

    return {
      title,
      metaDescription,
      outline,
      finalContent: raw,
      wordCount,
      seoInsights,
      conversionInsights,
      reasoningSummary: `Generated via lightweight single-pass pipeline (${getPipelineMode()} mode). 1 LLM call — metadata extracted deterministically.`,
    };
  }
}

export const lightweightGeneratorService = new LightweightGeneratorService();
