import { prisma } from "../config/database";
import { geminiService } from "./gemini.service";
import { getPipelineMode } from "./lightweightGenerator";

interface SuggestionResult {
  suggestions: string[];
  sourceTopic: string;
}

class TopicSuggestionService {
  /**
   * Generate related topic suggestions for a completed blog post.
   * Designed to be called fire-and-forget — caller does NOT await this.
   *
   * In "light" mode: uses deterministic keyword extraction (zero LLM calls).
   * In "full" mode: uses AI for higher-quality suggestions.
   */
  async generateSuggestions(
    userId: string,
    sourceTopic: string,
    contentBody: string,
    contentType: "blog" | "ad" | "product",
    brandProfileId?: string,
  ): Promise<void> {
    try {
      const mode = getPipelineMode();

      const suggestions = mode === "light"
        ? this.generateDeterministic(sourceTopic, contentBody)
        : await this.generateWithAI(sourceTopic, contentBody);

      if (suggestions.length === 0) return;

      await prisma.topicSuggestion.create({
        data: {
          userId,
          brandProfileId: brandProfileId || null,
          sourceTopic,
          suggestions,
          contentType,
        },
      });
    } catch {
      // Silently swallow errors — this is a bonus background feature.
    }
  }

  /**
   * Deterministic topic suggestion — zero LLM calls.
   * Extracts key terms and generates follow-up ideas via templates.
   */
  private generateDeterministic(sourceTopic: string, contentBody: string): string[] {
    // Extract candidate keywords via simple TF scoring
    const keywords = this.extractKeywords(contentBody);
    const topKeywords = keywords.slice(0, 5);

    if (topKeywords.length === 0) {
      topKeywords.push(sourceTopic.split(" ").slice(0, 3).join(" "));
    }

    const templates = [
      (kw: string) => `How to Master ${kw}: A Complete Guide`,
      (kw: string) => `${kw} vs. Alternatives: What You Need to Know`,
      (kw: string) => `Best Practices for ${kw} in ${new Date().getFullYear()}`,
      (kw: string) => `Why ${kw} Matters: Lessons from Industry Leaders`,
      (kw: string) => `Common Mistakes with ${kw} (And How to Avoid Them)`,
    ];

    const suggestions: string[] = [];
    for (let i = 0; i < Math.min(5, topKeywords.length); i++) {
      const kw = this.capitalize(topKeywords[i]);
      suggestions.push(templates[i % templates.length](kw));
    }

    // If we have fewer than 5, add depth variations from the source topic
    if (suggestions.length < 5) {
      const depthTemplates = [
        `Deep Dive: The Future of ${sourceTopic}`,
        `${sourceTopic} for Beginners: Where to Start`,
        `Advanced ${sourceTopic} Strategies for Growth`,
      ];
      for (const t of depthTemplates) {
        if (suggestions.length >= 5) break;
        suggestions.push(t);
      }
    }

    return suggestions.slice(0, 5);
  }

  /**
   * AI-powered topic suggestions (used in full/cloud mode).
   */
  private async generateWithAI(sourceTopic: string, contentBody: string): Promise<string[]> {
    const prompt = `You are a content strategist. Based on the following piece of content, suggest 5 compelling follow-up or related topic ideas that would interest the same audience.

ORIGINAL TOPIC: ${sourceTopic}
CONTENT SNIPPET: ${contentBody.slice(0, 800)}

Return a JSON object in the following format:
{
  "suggestions": [
    "Topic idea 1 — why it's compelling",
    "Topic idea 2 — why it's relevant",
    "Topic idea 3 — a gap this content opened",
    "Topic idea 4 — a deeper dive angle",
    "Topic idea 5 — a related but new angle"
  ]
}

Rules:
- Each suggestion should be a complete content idea, not just a title
- Focus on what the reader of the original content would naturally want to read next
- Vary the angles: some can go deeper, some broader, some from a different perspective
- Keep suggestions actionable and specific

Return ONLY valid JSON.`;

    const response = await geminiService.generateContent(prompt);
    const parsed = geminiService.parseJsonResponse<SuggestionResult>(response);

    return Array.isArray(parsed.suggestions)
      ? parsed.suggestions.slice(0, 5)
      : [];
  }

  /**
   * Extract top keywords from content using simple term-frequency scoring.
   * Filters common stopwords and returns sorted by frequency.
   */
  private extractKeywords(content: string): string[] {
    const stopwords = new Set([
      "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
      "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
      "this", "but", "his", "by", "from", "they", "we", "say", "her",
      "she", "or", "an", "will", "my", "one", "all", "would", "there",
      "their", "what", "so", "up", "out", "if", "about", "who", "get",
      "which", "go", "me", "when", "make", "can", "like", "time", "no",
      "just", "him", "know", "take", "people", "into", "year", "your",
      "good", "some", "could", "them", "see", "other", "than", "then",
      "now", "look", "only", "come", "its", "over", "think", "also",
      "back", "after", "use", "two", "how", "our", "work", "well",
      "way", "even", "new", "want", "because", "any", "these", "give",
      "most", "us", "are", "is", "was", "were", "been", "being", "has",
      "had", "does", "did", "very", "more", "much", "many", "such",
    ]);

    const words = content
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopwords.has(w));

    // Count term frequency
    const freq: Record<string, number> = {};
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }

    // Sort by frequency and return top terms
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /**
   * Retrieve the most recent topic suggestions for a user.
   */
  async getSuggestions(
    userId: string,
    limit = 10,
    brandProfileId?: string,
  ): Promise<Array<{ id: string; sourceTopic: string; suggestions: string[]; contentType: string; createdAt: Date }>> {
    const where: any = { userId };
    if (brandProfileId) where.brandProfileId = brandProfileId;

    const rows = await prisma.topicSuggestion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        sourceTopic: true,
        suggestions: true,
        contentType: true,
        createdAt: true,
      },
    });

    return rows.map((r) => ({
      ...r,
      suggestions: Array.isArray(r.suggestions) ? (r.suggestions as string[]) : [],
    }));
  }

  /**
   * Delete a topic suggestion set.
   */
  async deleteSuggestion(id: string, userId: string): Promise<void> {
    await prisma.topicSuggestion.deleteMany({ where: { id, userId } });
  }
}

export const topicSuggestionService = new TopicSuggestionService();
