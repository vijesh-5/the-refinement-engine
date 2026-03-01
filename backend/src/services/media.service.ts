import { prisma } from "../config/database";
import { env } from "../config/env";
import { logger } from "../config/logger";

export interface GenerateImageInput {
  contentId: string;
  userId: string;
  prompt: string;
  type?: "thumbnail" | "social" | "other";
}

export interface ContentAssetResult {
  id: string;
  contentId: string;
  type: string;
  url: string;
  prompt: string | null;
  createdAt: Date;
}

class MediaService {
  /**
   * Generate an image via DALL-E 3 and store the asset.
   * Only called on explicit user action — never auto-triggered.
   * Requires OPENAI_API_KEY in environment.
   */
  async generateImage(input: GenerateImageInput): Promise<ContentAssetResult> {
    const { contentId, userId, prompt, type = "thumbnail" } = input;

    // Verify content ownership
    const content = await prisma.content.findUnique({
      where: { id: contentId, userId },
      select: { id: true, title: true },
    });
    if (!content) throw new Error("Content not found or access denied");

    if (!env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured. Add it to your .env to enable image generation.");
    }

    logger.info("MEDIA", `Generating ${type} image for content: ${contentId}`);

    const imageUrl = await this.callDallE(prompt);

    const asset = await prisma.contentAsset.create({
      data: { contentId, type, url: imageUrl, prompt },
    });

    logger.info("MEDIA", `Image generated and stored`, { assetId: asset.id });

    return asset;
  }

  /**
   * Call DALL-E 3 image generation API.
   */
  private async callDallE(prompt: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Blog thumbnail image: ${prompt}. Clean, professional, digital art style.`,
        n: 1,
        size: "1792x1024",
        quality: "standard",
        response_format: "url",
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`DALL-E API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json() as { data: Array<{ url: string }> };
    if (!data.data?.[0]?.url) throw new Error("No image URL returned from DALL-E");

    return data.data[0].url;
  }

  /**
   * List all assets for a piece of content.
   */
  async getAssets(contentId: string, userId: string): Promise<ContentAssetResult[]> {
    const content = await prisma.content.findUnique({
      where: { id: contentId, userId },
      select: { id: true },
    });
    if (!content) throw new Error("Content not found");

    return prisma.contentAsset.findMany({
      where: { contentId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Delete an asset.
   */
  async deleteAsset(assetId: string, userId: string): Promise<void> {
    const asset = await prisma.contentAsset.findUnique({
      where: { id: assetId },
      include: { content: { select: { userId: true } } },
    });
    if (!asset || asset.content.userId !== userId) throw new Error("Asset not found");

    await prisma.contentAsset.delete({ where: { id: assetId } });
  }
}

export const mediaService = new MediaService();
