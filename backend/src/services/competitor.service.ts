import { prisma } from "../config/database";
import { geminiService } from "./gemini.service";

interface CompetitorAnalysis {
  title: string;
  keyMessages: string[];
  toneAnalysis: string;
  strengthAreas: string[];
  weaknessGaps: string[];
  rawSummary: string;
}

class CompetitorService {
  /**
   * Fetch page content from a URL and extract text
   */
  private async fetchPageContent(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; ArtifexBot/1.0; +https://artifex.app)",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();

      // Basic HTML-to-text extraction: strip tags, decode entities, collapse whitespace
      const text = html
        // Remove script and style blocks entirely
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<footer[\s\S]*?<\/footer>/gi, "")
        .replace(/<header[\s\S]*?<\/header>/gi, "")
        // Convert block elements to newlines
        .replace(/<\/?(p|div|br|h[1-6]|li|tr|section|article)[^>]*>/gi, "\n")
        // Remove remaining tags
        .replace(/<[^>]+>/g, " ")
        // Decode common HTML entities
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        // Collapse whitespace
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s*\n/g, "\n\n")
        .trim();

      // Limit to ~8000 chars to stay within token limits
      return text.substring(0, 8000);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch competitor page: ${error.message}`);
      }
      throw new Error("Failed to fetch competitor page");
    }
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace("www.", "");
    } catch {
      return url;
    }
  }

  /**
   * Analyze a competitor URL using Gemini
   */
  async analyzeCompetitorUrl(
    url: string,
    brandProfileId: string,
    userId: string
  ) {
    // Verify brand belongs to user
    const brand = await prisma.brandProfile.findFirst({
      where: { id: brandProfileId, userId },
    });

    if (!brand) {
      throw new Error("Brand profile not found");
    }

    // Fetch page content
    const pageContent = await this.fetchPageContent(url);
    const domain = this.extractDomain(url);

    // Send to Gemini for analysis
    const prompt = `You are a competitive intelligence analyst. Analyze the following webpage content from a competitor and extract strategic insights.

COMPETITOR URL: ${url}
COMPETITOR DOMAIN: ${domain}

OUR BRAND FOR CONTEXT:
- Name: ${brand.name}
- Industry: ${brand.industry || "Not specified"}
- Tone: ${brand.tone}
- Target Audience: ${brand.targetAudience || "Not specified"}

PAGE CONTENT:
---
${pageContent}
---

Analyze the competitor and return a JSON object with the following structure:
{
  "title": "The page title or a descriptive name for this competitor content",
  "keyMessages": ["Their main selling point 1", "Key value proposition 2", "Core messaging theme 3"],
  "toneAnalysis": "Brief description of their communication tone and style (e.g., professional, casual, urgent, technical)",
  "strengthAreas": ["What they do well 1", "Strong positioning 2", "Effective strategy 3"],
  "weaknessGaps": ["Messaging gap we can exploit 1", "Topic they miss 2", "Audience they underserve 3", "Angle they overlook 4"],
  "rawSummary": "A 2-3 sentence executive summary of this competitor's positioning relative to our brand"
}

Focus heavily on the "weaknessGaps" — these are the opportunities where OUR brand (${brand.name}) can differentiate. Think about:
- Topics they don't cover
- Audiences they don't speak to
- Angles they miss
- Values they don't emphasize

Return ONLY valid JSON.`;

    const response = await geminiService.generateContent(prompt);
    const analysis = geminiService.parseJsonResponse<CompetitorAnalysis>(response);

    // Save to database
    const insight = await prisma.competitorInsight.create({
      data: {
        brandProfileId,
        url,
        domain,
        title: analysis.title,
        keyMessages: analysis.keyMessages,
        toneAnalysis: analysis.toneAnalysis,
        strengthAreas: analysis.strengthAreas,
        weaknessGaps: analysis.weaknessGaps,
        rawSummary: analysis.rawSummary,
      },
    });

    return insight;
  }

  /**
   * Get all competitor insights for a brand profile
   */
  async getCompetitorsByBrand(brandProfileId: string, userId: string) {
    // Verify brand belongs to user
    const brand = await prisma.brandProfile.findFirst({
      where: { id: brandProfileId, userId },
    });

    if (!brand) {
      throw new Error("Brand profile not found");
    }

    return prisma.competitorInsight.findMany({
      where: { brandProfileId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Delete a competitor insight
   */
  async deleteCompetitor(id: string, userId: string) {
    const insight = await prisma.competitorInsight.findUnique({
      where: { id },
      include: { brandProfile: true },
    });

    if (!insight || insight.brandProfile.userId !== userId) {
      throw new Error("Competitor insight not found");
    }

    return prisma.competitorInsight.delete({ where: { id } });
  }

  /**
   * Build competitor context string for injection into AI prompts
   */
  async getCompetitorContext(brandProfileId: string): Promise<string> {
    const insights = await prisma.competitorInsight.findMany({
      where: { brandProfileId },
    });

    if (insights.length === 0) return "";

    const competitorSummaries = insights
      .map(
        (c) =>
          `- ${c.domain}: Key messages=${c.keyMessages.join(", ")}. Gaps=${c.weaknessGaps.join(", ")}.`
      )
      .join("\n");

    return `
COMPETITIVE INTELLIGENCE:
The following competitors have been analyzed. Use their GAPS as opportunities to differentiate our content.
${competitorSummaries}

DIFFERENTIATION INSTRUCTIONS:
- Emphasize topics and angles that competitors miss
- Address audiences competitors underserve
- Highlight unique value propositions that set us apart
- Avoid mimicking competitor messaging — be distinctly different
`;
  }
}

export const competitorService = new CompetitorService();
