import { prisma } from "../config/database";
import { nanoid } from "nanoid";

export interface PublicLinkResult {
  id: string;
  slug: string;
  isActive: boolean;
  contentId: string;
  createdAt: Date;
  shareUrl: string;
}

export interface PublicContentView {
  title: string;
  body: string;
  contentType: string;
  funnelStage: string | null;
  createdAt: Date;
}

class ShareService {
  /**
   * Create or return existing public link for a content item.
   */
  async createLink(contentId: string, userId: string): Promise<PublicLinkResult> {
    // Verify ownership
    const content = await prisma.content.findUnique({
      where: { id: contentId, userId },
      select: { id: true, publicLinks: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!content) throw new Error("Content not found or access denied");

    // Re-use existing active link if present
    if (content.publicLinks[0]?.isActive) {
      const link = content.publicLinks[0];
      return {
        id: link.id,
        slug: link.slug,
        isActive: link.isActive,
        contentId,
        createdAt: link.createdAt,
        shareUrl: `${process.env.FRONTEND_URL ?? "http://localhost:8080"}/public/${link.slug}`,
      };
    }

    const slug = nanoid(10);
    const link = await prisma.publicLink.create({
      data: { contentId, slug, isActive: true },
    });

    return {
      id: link.id,
      slug: link.slug,
      isActive: link.isActive,
      contentId,
      createdAt: link.createdAt,
      shareUrl: `${process.env.FRONTEND_URL ?? "http://localhost:8080"}/public/${link.slug}`,
    };
  }

  /**
   * Deactivate a public link.
   */
  async revokeLink(linkId: string, userId: string): Promise<void> {
    const link = await prisma.publicLink.findUnique({
      where: { id: linkId },
      include: { content: { select: { userId: true } } },
    });
    if (!link || link.content.userId !== userId) throw new Error("Link not found");

    await prisma.publicLink.update({ where: { id: linkId }, data: { isActive: false } });
  }

  /**
   * Fetch publicly viewable content by slug.
   * Never exposes: brand memory, internal scores, AI reasoning, user identity.
   */
  async getBySlug(slug: string): Promise<PublicContentView> {
    const link = await prisma.publicLink.findUnique({
      where: { slug },
      include: {
        content: {
          select: {
            title: true,
            body: true,
            contentType: true,
            funnelStage: true,
            createdAt: true,
          },
        },
      },
    });

    if (!link) throw new Error("Public link not found");
    if (!link.isActive) throw new Error("This link is no longer active");

    return link.content;
  }

  /**
   * List all public links for a user's content item.
   */
  async listLinks(contentId: string, userId: string): Promise<PublicLinkResult[]> {
    const content = await prisma.content.findUnique({
      where: { id: contentId, userId },
      select: { publicLinks: { orderBy: { createdAt: "desc" } } },
    });
    if (!content) throw new Error("Content not found");

    const baseUrl = process.env.FRONTEND_URL ?? "http://localhost:8080";
    return content.publicLinks.map((l) => ({
      id: l.id,
      slug: l.slug,
      isActive: l.isActive,
      contentId,
      createdAt: l.createdAt,
      shareUrl: `${baseUrl}/public/${l.slug}`,
    }));
  }
}

export const shareService = new ShareService();
