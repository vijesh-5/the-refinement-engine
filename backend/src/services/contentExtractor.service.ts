import { marked } from "marked";
import { logger } from "../config/logger";

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface ExtractedContent {
  subject: string;
  htmlBody: string;
  plainText: string;
}

interface ContentExtractor {
  extract(content: ContentRecord): ExtractedContent;
}

/** Minimal shape of a Content row from Prisma */
interface ContentRecord {
  id: string;
  title: string;
  body: string;
  contentType: string;
  generatedOutput: any;
}

// ─── Email Wrapper ──────────────────────────────────────────────────────────

function wrapInEmailTemplate(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1a1a1a; max-width: 680px; margin: 0 auto; padding: 24px; background: #ffffff; }
    h1 { font-size: 28px; font-weight: 700; margin: 0 0 24px 0; color: #111; }
    h2 { font-size: 22px; font-weight: 600; margin: 32px 0 12px 0; color: #222; }
    h3 { font-size: 18px; font-weight: 600; margin: 24px 0 8px 0; color: #333; }
    p { margin: 0 0 16px 0; font-size: 16px; }
    ul, ol { margin: 0 0 16px 0; padding-left: 24px; }
    li { margin: 0 0 6px 0; font-size: 16px; }
    blockquote { border-left: 4px solid #6366f1; margin: 16px 0; padding: 12px 20px; background: #f8f8ff; color: #444; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
    pre { background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 32px 0; }
    .divider { border: none; border-top: 2px dashed #d1d5db; margin: 28px 0; }
    .variant-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 16px 0; }
    .variant-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6366f1; margin-bottom: 12px; }
    .headline { font-size: 20px; font-weight: 700; color: #111; margin-bottom: 8px; }
    .cta { display: inline-block; background: #6366f1; color: white; padding: 8px 20px; border-radius: 6px; font-weight: 600; text-decoration: none; margin-top: 12px; }
    .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6366f1; margin-bottom: 8px; }
    .benefit-item { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .benefit-item:last-child { border-bottom: none; }
    strong { color: #111; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

// ─── Blog Extractor ─────────────────────────────────────────────────────────

class BlogExtractor implements ContentExtractor {
  extract(content: ContentRecord): ExtractedContent {
    const title = content.title || "Untitled Blog Post";

    // The body is raw Markdown from the AI
    const htmlContent = marked.parse(content.body, { async: false }) as string;
    const htmlBody = wrapInEmailTemplate(title, `<h1>${escapeHtml(title)}</h1>\n${htmlContent}`);
    const plainText = `${title}\n${"=".repeat(title.length)}\n\n${stripHtml(htmlContent)}`;

    return { subject: title, htmlBody, plainText };
  }
}

// ─── Product Description Extractor ──────────────────────────────────────────

class ProductExtractor implements ContentExtractor {
  extract(content: ContentRecord): ExtractedContent {
    const output = content.generatedOutput || {};
    const productName = output.productName || content.title || "Product Description";
    const shortDesc = output.shortDescription || "";
    const bullets: string[] = output.bulletFeatures || [];
    const longDesc = output.longDescription || content.body || "";

    const bodyParts: string[] = [
      `<h1>${escapeHtml(productName)}</h1>`,
    ];

    if (shortDesc) {
      bodyParts.push(
        `<div class="section-title">Short Description</div>`,
        `<p><strong>${escapeHtml(shortDesc)}</strong></p>`,
      );
    }

    if (bullets.length > 0) {
      bodyParts.push(
        `<hr class="divider">`,
        `<div class="section-title">Key Benefits</div>`,
        `<ul>`,
        ...bullets.map((b) => `  <li class="benefit-item"><strong>${escapeHtml(b)}</strong></li>`),
        `</ul>`,
      );
    }

    if (longDesc) {
      bodyParts.push(
        `<hr class="divider">`,
        `<div class="section-title">Full Description</div>`,
        `<div>${marked.parse(longDesc, { async: false })}</div>`,
      );
    }

    const htmlBody = wrapInEmailTemplate(productName, bodyParts.join("\n"));

    // Plain text
    const plainLines = [productName, "=".repeat(productName.length), ""];
    if (shortDesc) plainLines.push(shortDesc, "");
    if (bullets.length) {
      plainLines.push("KEY BENEFITS:", ...bullets.map((b) => `  • ${b}`), "");
    }
    if (longDesc) plainLines.push("FULL DESCRIPTION:", stripHtml(longDesc));

    return {
      subject: productName,
      htmlBody,
      plainText: plainLines.join("\n"),
    };
  }
}

// ─── Ad Copy Extractor ──────────────────────────────────────────────────────

interface AdVariant {
  headline: string;
  primaryText: string;
  cta: string;
}

class AdCopyExtractor implements ContentExtractor {
  extract(content: ContentRecord): ExtractedContent {
    const output = content.generatedOutput || {};
    const platform = output.platform || "Ad";
    const title = content.title || `${platform} Ad Copy`;

    // Variants can be in generatedOutput.variants or parsed from body
    let variants: AdVariant[] = output.variants || [];
    if (variants.length === 0 && content.body) {
      try {
        variants = JSON.parse(content.body);
      } catch {
        // Body is not JSON — treat as single variant
        variants = [{ headline: title, primaryText: content.body, cta: "Learn More" }];
      }
    }

    const variantCards = variants.map((v, i) => `
      <div class="variant-card">
        <div class="variant-label">Variant ${i + 1}</div>
        <div class="headline">${escapeHtml(v.headline)}</div>
        <p>${escapeHtml(v.primaryText)}</p>
        <a class="cta" href="#">${escapeHtml(v.cta)}</a>
      </div>
    `).join("\n<hr class=\"divider\">\n");

    const htmlBody = wrapInEmailTemplate(
      title,
      `<h1>${escapeHtml(title)}</h1>\n<p style="color:#666;">Review the ad copy variants below:</p>\n${variantCards}`
    );

    // Plain text
    const plainLines = [title, "=".repeat(title.length), ""];
    variants.forEach((v, i) => {
      plainLines.push(
        `--- Variant ${i + 1} ---`,
        `Headline: ${v.headline}`,
        `Primary Text: ${v.primaryText}`,
        `CTA: ${v.cta}`,
        "",
      );
    });

    return {
      subject: title,
      htmlBody,
      plainText: plainLines.join("\n"),
    };
  }
}

// ─── Factory ────────────────────────────────────────────────────────────────

const extractors: Record<string, ContentExtractor> = {
  blog: new BlogExtractor(),
  product: new ProductExtractor(),
  ad: new AdCopyExtractor(),
};

/**
 * Get the appropriate content extractor for a content type.
 * Falls back to BlogExtractor for unknown types (treats body as Markdown).
 */
export function getExtractor(contentType: string): ContentExtractor {
  return extractors[contentType] || extractors.blog;
}

/**
 * Extract and format content for distribution.
 */
export function extractContent(content: ContentRecord): ExtractedContent {
  const extractor = getExtractor(content.contentType);
  logger.info("EXTRACTOR", `Using ${content.contentType} extractor for content ${content.id}`);
  return extractor.extract(content);
}
