import { prisma } from "../config/database";
import { geminiService } from "./gemini.service";
import { getPipelineMode } from "./lightweightGenerator";
import { logger } from "../config/logger";

export interface CreateVariantInput {
  contentId: string;
  userId: string;
  variantLabel?: string;    // defaults to "B", "C", etc.
  focus?: string;           // e.g. "more casual tone" or "stronger CTA"
}

export interface VariantResult {
  id: string;
  contentId: string;
  variantLabel: string;
  contentText: string;
  createdAt: Date;
}

class ABService {
  /**
   * Generate a content variant.
   *
   * Light mode: variant is created from a deterministic rewrite
   *             (only on EXPLICIT user action — never auto-triggered).
   * Full mode:  uses AI to generate a focused variant.
   */
  async createVariant(input: CreateVariantInput): Promise<VariantResult> {
    const { contentId, userId, focus } = input;

    const content = await prisma.content.findUnique({
      where: { id: contentId, userId },
      select: {
        id: true,
        title: true,
        body: true,
        abVariants: { select: { variantLabel: true }, orderBy: { createdAt: "asc" } },
      },
    });

    if (!content) throw new Error("Content not found or access denied");

    // Auto-assign label: A is original, new variants are B, C, D...
    const existingLabels = new Set(content.abVariants.map((v) => v.variantLabel));
    const variantLabel = input.variantLabel ?? this.nextLabel(existingLabels);

    const mode = getPipelineMode();
    logger.info("A/B", `Creating variant ${variantLabel} for ${contentId} (${mode} mode)`);

    const contentText =
      mode === "light"
        ? this.deterministicVariant(content.body, variantLabel, focus)
        : await this.aiVariant(content.body, content.title, variantLabel, focus);

    const variant = await prisma.abVariant.create({
      data: { contentId, variantLabel, contentText },
    });

    return variant;
  }

  /**
   * List all variants for a content item.
   */
  async listVariants(contentId: string, userId: string): Promise<VariantResult[]> {
    const content = await prisma.content.findUnique({
      where: { id: contentId, userId },
      select: { id: true },
    });
    if (!content) throw new Error("Content not found");

    return prisma.abVariant.findMany({
      where: { contentId },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Delete a variant.
   */
  async deleteVariant(variantId: string, userId: string): Promise<void> {
    const variant = await prisma.abVariant.findUnique({
      where: { id: variantId },
      include: { content: { select: { userId: true } } },
    });
    if (!variant || variant.content.userId !== userId) throw new Error("Variant not found");
    await prisma.abVariant.delete({ where: { id: variantId } });
  }

  // ─── Variant Generators ─────────────────────────────────────────────────

  /**
   * Light mode: deterministic structural rewrite — zero LLM calls.
   * Applies rule-based transformations based on focus area.
   */
  private deterministicVariant(body: string, label: string, focus?: string): string {
    let text = body;

    const focusLower = focus?.toLowerCase() ?? "";

    if (focusLower.includes("cta") || focusLower.includes("action")) {
      // Strengthen CTAs: add action-oriented phrases at end of paragraphs
      text = text.replace(
        /^((?!#).{80,}[.!?])(\s*\n)/gm,
        (match, sentence, newline) =>
          Math.random() > 0.6
            ? `${sentence} Try it today.${newline}`
            : match,
      );
    } else if (focusLower.includes("casual") || focusLower.includes("tone")) {
      // Simplify formal language
      text = text
        .replace(/\butilize\b/g, "use")
        .replace(/\bpurchase\b/g, "buy")
        .replace(/\bcommence\b/g, "start")
        .replace(/\bdemonstrate\b/g, "show")
        .replace(/\bfacilitate\b/g, "help")
        .replace(/\bsubsequently\b/g, "then")
        .replace(/\bin order to\b/g, "to");
    } else if (focusLower.includes("short") || focusLower.includes("concise")) {
      // Trim to first 70% of content
      const lines = text.split("\n");
      text = lines.slice(0, Math.ceil(lines.length * 0.7)).join("\n");
    } else {
      // Default: inject variant label as a subtle variation marker in intro
      const firstPara = text.indexOf("\n\n");
      if (firstPara > 0) {
        text = text.slice(0, firstPara) + ` *(Variant ${label})*` + text.slice(firstPara);
      }
    }

    return text;
  }

  /**
   * Full mode: AI-powered variant with specific focus area.
   * Single LLM call to produce focused improvement.
   */
  private async aiVariant(
    body: string,
    title: string,
    label: string,
    focus?: string,
  ): Promise<string> {
    const focusInstruction = focus
      ? `Focus on: ${focus}.`
      : "Improve overall engagement and clarity.";

    const prompt = `Rewrite this blog post as Variant ${label}. ${focusInstruction}
Preserve all heading structure and markdown formatting. Keep approximately the same length.
Do not add explanations — output only the rewritten content.

TITLE: ${title}

CONTENT:
${body.slice(0, 3000)}`;

    const result = await geminiService.generateContent(prompt);
    return result || this.deterministicVariant(body, label, focus);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────

  private nextLabel(existing: Set<string>): string {
    const alphabet = "BCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (const char of alphabet) {
      if (!existing.has(char)) return char;
    }
    return `V${existing.size + 1}`;
  }
}

export const abService = new ABService();
