import { prisma } from "../config/database";
import { marked } from "marked";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import PDFDocument from "pdfkit";

export type ExportFormat = "pdf" | "html" | "docx";

export interface ExportInput {
  contentId: string;
  userId: string;
  format: ExportFormat;
}

export interface ExportResult {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

class ExportService {
  /**
   * Export content in the requested format.
   * Pure server-side generation — NO AI calls.
   */
  async exportContent(input: ExportInput): Promise<ExportResult> {
    const { contentId, userId, format } = input;

    const content = await prisma.content.findUnique({
      where: { id: contentId, userId },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
          select: { versionNumber: true },
        },
      },
    });

    if (!content) throw new Error("Content not found or access denied");

    const versionNumber = content.versions[0]?.versionNumber ?? 1;
    const safeTitle = content.title.replace(/[^a-z0-9]/gi, "_").slice(0, 50);
    const timestamp = new Date().toISOString().split("T")[0];

    const metadata = {
      title: content.title,
      funnelStage: content.funnelStage ?? "N/A",
      objective: content.objective ?? "N/A",
      version: versionNumber,
      exportedAt: timestamp,
    };

    switch (format) {
      case "html":
        return this.toHTML(content.body, metadata, safeTitle);
      case "pdf":
        return this.toPDF(content.body, metadata, safeTitle);
      case "docx":
        return this.toDocx(content.body, metadata, safeTitle);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  // ─── HTML Export ──────────────────────────────────────────────────────────

  private async toHTML(
    body: string,
    meta: { title: string; funnelStage: string; objective: string; version: number; exportedAt: string },
    safeTitle: string,
  ): Promise<ExportResult> {
    const htmlBody = await marked(body);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${meta.title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.7; }
    h1, h2, h3 { font-family: system-ui, sans-serif; }
    .meta { background: #f5f5f5; border-left: 4px solid #6366f1; padding: 12px 16px; margin-bottom: 32px; font-size: 13px; color: #555; }
    .meta strong { color: #333; }
    img { max-width: 100%; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; }
    pre { background: #1a1a1a; color: #e0e0e0; padding: 16px; border-radius: 8px; overflow: auto; }
  </style>
</head>
<body>
  <div class="meta">
    <strong>Funnel Stage:</strong> ${meta.funnelStage} &nbsp;|&nbsp;
    <strong>Objective:</strong> ${meta.objective} &nbsp;|&nbsp;
    <strong>Version:</strong> v${meta.version} &nbsp;|&nbsp;
    <strong>Exported:</strong> ${meta.exportedAt}
  </div>
  ${htmlBody}
</body>
</html>`;

    return {
      buffer: Buffer.from(html, "utf-8"),
      mimeType: "text/html; charset=utf-8",
      filename: `${safeTitle}.html`,
    };
  }

  // ─── PDF Export ───────────────────────────────────────────────────────────

  private toPDF(
    body: string,
    meta: { title: string; funnelStage: string; objective: string; version: number; exportedAt: string },
    safeTitle: string,
  ): Promise<ExportResult> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 60, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => {
        resolve({
          buffer: Buffer.concat(chunks),
          mimeType: "application/pdf",
          filename: `${safeTitle}.pdf`,
        });
      });
      doc.on("error", reject);

      // Title
      doc.fontSize(22).font("Helvetica-Bold").text(meta.title, { align: "left" });
      doc.moveDown(0.5);

      // Metadata bar
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#666666")
        .text(
          `Funnel: ${meta.funnelStage}  |  Objective: ${meta.objective}  |  Version: v${meta.version}  |  Exported: ${meta.exportedAt}`,
        );
      doc.moveDown(1);

      // Divider
      doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke("#e0e0e0");
      doc.moveDown(1);

      // Body — line-by-line processing
      const lines = body.split("\n");
      doc.fillColor("#1a1a1a");

      for (const line of lines) {
        const h1 = line.match(/^# (.+)/);
        const h2 = line.match(/^## (.+)/);
        const h3 = line.match(/^### (.+)/);
        const bullet = line.match(/^[-*] (.+)/);
        const empty = line.trim() === "";

        if (h1) {
          doc.moveDown(0.8).fontSize(16).font("Helvetica-Bold").text(h1[1], { lineGap: 4 });
        } else if (h2) {
          doc.moveDown(0.6).fontSize(13).font("Helvetica-Bold").text(h2[1], { lineGap: 3 });
        } else if (h3) {
          doc.moveDown(0.4).fontSize(11).font("Helvetica-Bold").text(h3[1], { lineGap: 2 });
        } else if (bullet) {
          doc
            .fontSize(10)
            .font("Helvetica")
            .text(`• ${bullet[1].replace(/[*_`]/g, "")}`, { indent: 16, lineGap: 2 });
        } else if (empty) {
          doc.moveDown(0.4);
        } else {
          doc
            .fontSize(10)
            .font("Helvetica")
            .text(line.replace(/\*\*(.+?)\*\*/g, "$1").replace(/[*_`]/g, ""), { lineGap: 2 });
        }
      }

      doc.end();
    });
  }

  // ─── DOCX Export ──────────────────────────────────────────────────────────

  private async toDocx(
    body: string,
    meta: { title: string; funnelStage: string; objective: string; version: number; exportedAt: string },
    safeTitle: string,
  ): Promise<ExportResult> {
    const children: Paragraph[] = [];

    // Metadata paragraph
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Funnel: ${meta.funnelStage} | Objective: ${meta.objective} | Version: v${meta.version} | Exported: ${meta.exportedAt}`,
            size: 18,
            color: "666666",
          }),
        ],
        spacing: { after: 300 },
      }),
    );

    // Parse body lines
    for (const line of body.split("\n")) {
      const h1 = line.match(/^# (.+)/);
      const h2 = line.match(/^## (.+)/);
      const h3 = line.match(/^### (.+)/);
      const bullet = line.match(/^[-*] (.+)/);

      if (h1) {
        children.push(new Paragraph({ text: h1[1], heading: HeadingLevel.HEADING_1 }));
      } else if (h2) {
        children.push(new Paragraph({ text: h2[1], heading: HeadingLevel.HEADING_2 }));
      } else if (h3) {
        children.push(new Paragraph({ text: h3[1], heading: HeadingLevel.HEADING_3 }));
      } else if (bullet) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: bullet[1].replace(/[*_`]/g, ""), size: 22 })],
            bullet: { level: 0 },
          }),
        );
      } else if (line.trim()) {
        // Handle bold inline: **text**
        const parts = line.split(/\*\*(.+?)\*\*/);
        const runs: TextRun[] = parts.map((part, i) =>
          new TextRun({ text: part.replace(/[*_`]/g, ""), bold: i % 2 === 1, size: 22 }),
        );
        children.push(
          new Paragraph({
            children: runs,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
          }),
        );
      } else {
        children.push(new Paragraph({ text: "" }));
      }
    }

    const doc = new Document({
      title: meta.title,
      sections: [{ children }],
    });

    const buffer = await Packer.toBuffer(doc);

    return {
      buffer,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      filename: `${safeTitle}.docx`,
    };
  }
}

export const exportService = new ExportService();
