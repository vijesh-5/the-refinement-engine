import nodemailer from "nodemailer";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { extractContent, ExtractedContent } from "./contentExtractor.service";
import { AppError } from "../middleware/errorHandler";

// ─── Strategy Interface ─────────────────────────────────────────────────────

export interface DistributionResult {
  success: boolean;
  platform: string;
  messageId?: string;
  error?: string;
}

interface DistributionStrategy {
  distribute(
    userId: string,
    extracted: ExtractedContent
  ): Promise<DistributionResult>;
}

// ─── Email Strategy (Bear Blog) ─────────────────────────────────────────────

class EmailStrategy implements DistributionStrategy {
  async distribute(
    userId: string,
    extracted: ExtractedContent
  ): Promise<DistributionResult> {
    // 1. Fetch Bear Blog credentials
    const platform = await prisma.connectedPlatform.findUnique({
      where: {
        userId_platformName: { userId, platformName: "BEAR_BLOG" },
      },
    });

    if (!platform || !platform.isActive) {
      throw new AppError(
        400,
        "Bear Blog is not connected or is inactive. Connect it in Settings → Integrations."
      );
    }

    const bearEmail = (platform.credentials as Record<string, string>).email;
    if (!bearEmail) {
      throw new AppError(400, "Bear Blog email address not configured.");
    }

    // 2. Validate SMTP config
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      throw new AppError(
        500,
        "SMTP credentials not configured. Set SMTP_USER and SMTP_PASS in .env"
      );
    }

    // 3. Create transporter and send
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: env.SMTP_USER,
        to: bearEmail,
        subject: extracted.subject,
        html: extracted.htmlBody,
        text: extracted.plainText,
      });

      logger.info(
        "DISTRIBUTION",
        `Email sent to Bear Blog (${bearEmail}), messageId: ${info.messageId}`
      );

      return {
        success: true,
        platform: "BEAR_BLOG",
        messageId: info.messageId,
      };
    } catch (error: any) {
      logger.error("DISTRIBUTION", `Email send failed: ${error.message}`);
      throw new AppError(
        500,
        `Failed to send email: ${error.message}`
      );
    }
  }
}

// ─── Strategy Registry ──────────────────────────────────────────────────────

const strategies: Record<string, DistributionStrategy> = {
  BEAR_BLOG: new EmailStrategy(),
  // Future: X: new XStrategy(), REDDIT: new RedditStrategy()
};

// ─── Distribution Service ───────────────────────────────────────────────────

export const distributionService = {
  /**
   * Distribute content to a specific platform.
   * Orchestrates: fetch content → extract/format → send via strategy.
   */
  async send(
    userId: string,
    contentId: string,
    platform: string
  ): Promise<DistributionResult> {
    // 1. Fetch content
    const content = await prisma.content.findFirst({
      where: { id: contentId, userId },
    });

    if (!content) {
      throw new AppError(404, "Content not found");
    }

    // 2. Get strategy
    const strategy = strategies[platform];
    if (!strategy) {
      throw new AppError(
        400,
        `Distribution to "${platform}" is not yet supported. Available: ${Object.keys(strategies).join(", ")}`
      );
    }

    // 3. Extract and format content
    const extracted = extractContent({
      id: content.id,
      title: content.title,
      body: content.body,
      contentType: content.contentType,
      generatedOutput: content.generatedOutput,
    });

    // 4. Distribute
    return strategy.distribute(userId, extracted);
  },
};
