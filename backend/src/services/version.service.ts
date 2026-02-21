import { prisma } from "../config/database";
import { geminiService } from "./gemini.service";
import { scoringService } from "./scoring.service";

export type ImprovementMode = "seo" | "conversion" | "clarity" | "luxury" | "aggressive";

export class VersionService {
  /**
   * Create a new version of existing content
   */
  async createVersion(contentId: string, body: string, improvementType?: string) {
    // Get the latest version number
    const latestVersion = await prisma.contentVersion.findFirst({
      where: { contentId },
      orderBy: { versionNumber: "desc" },
    });

    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // If it's the first version, we should also save the current content body if it doesn't exist as version 1
    if (nextVersionNumber === 1) {
      const content = await prisma.content.findUnique({ where: { id: contentId } });
      if (content) {
        await prisma.contentVersion.create({
          data: {
            contentId,
            versionNumber: 1,
            body: content.body,
            improvementType: "original",
          },
        });
        return this.createVersion(contentId, body, improvementType); // Recurse to get version 2
      }
    }

    // Calculate score for the new version
    const content = await prisma.content.findUnique({ where: { id: contentId } });
    const score = await scoringService.scoreContent(
      body, 
      (content?.contentType as any) || "blog",
      (content?.inputData as any)?.keywords || []
    );

    // Create the new version
    const version = await prisma.contentVersion.create({
      data: {
        contentId,
        versionNumber: nextVersionNumber,
        body,
        improvementType,
        scores: score as any,
      },
    });

    // Update the main content record with the latest body
    await prisma.content.update({
      where: { id: contentId },
      data: { body },
    });

    return version;
  }

  /**
   * Improve content based on a goal/mode
   */
  async improveContent(contentId: string, userId: string, mode: ImprovementMode) {
    const content = await prisma.content.findUnique({
      where: { id: contentId, userId },
    });

    if (!content) {
      throw new Error("Content not found");
    }

    const prompt = this.getImprovementPrompt(content.body, mode);
    const improvedContent = await geminiService.generateContent(prompt);

    // Create a new version
    return this.createVersion(contentId, improvedContent, mode);
  }

  private getImprovementPrompt(currentContent: string, mode: ImprovementMode): string {
    const instructions: Record<ImprovementMode, string> = {
      seo: "Focus on better keyword integration, better heading structures, and optimizing for search engines without losing readability.",
      conversion: "Focus on adding strong calls-to-action, emotional triggers, and persuasive language to drive more conversions.",
      clarity: "Focus on making the content more concise, clear, and easy to read. Remove jargon and complex sentence structures.",
      luxury: "Rewrite the content to sound more premium, exclusive, and high-end. Use sophisticated vocabulary and a polished tone.",
      aggressive: "Rewrite the content with a bold, high-energy, and direct tone. Focus on strong impact and immediate attention.",
    };

    return `
      I want you to improve the following content.
      
      GOAL: ${instructions[mode]}
      
      CURRENT CONTENT:
      ---
      ${currentContent}
      ---
      
      Return ONLY the improved content text. Do not include any explanations or meta-talk.
    `;
  }

  async getVersions(contentId: string, userId: string) {
    const content = await prisma.content.findUnique({
      where: { id: contentId, userId },
    });

    if (!content) {
      throw new Error("Content not found");
    }

    return prisma.contentVersion.findMany({
      where: { contentId },
      orderBy: { versionNumber: "desc" },
    });
  }
}

export const versionService = new VersionService();
