import { prisma } from "../config/database";
import { geminiService } from "./gemini.service";

interface SuggestionResult {
  suggestions: string[];
  sourceTopic: string;
}

class TopicSuggestionService {
  /**
   * Generate related topic suggestions for a completed blog post.
   * Designed to be called fire-and-forget — caller does NOT await this.
   * Results are stored in the DB and retrievable later.
   */
  async generateSuggestions(
    userId: string,
    sourceTopic: string,
    contentBody: string,
    contentType: "blog" | "ad" | "product",
    brandProfileId?: string,
  ): Promise<void> {
    try {
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

      const suggestions: string[] = Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 5)
        : [];

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
      // Generation failures should never break the main content response.
    }
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

    // Prisma returns Json fields as unknown — cast safely
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
