import { prisma } from "../config/database";
import { logger } from "../config/logger";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface GSCRow {
  contentId: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  date: Date;
}

export interface PerformanceTrend {
  contentId: string;
  title: string;
  totalImpressions: number;
  totalClicks: number;
  avgCTR: number;
  avgPosition: number;
  trend: "rising" | "stable" | "declining";
  deltaImpressions: number;  // last vs previous week
  deltaCTR: number;
}

// ─── Service ────────────────────────────────────────────────────────────────

class AnalyticsService {
  /**
   * Sync performance data from Google Search Console.
   * Runs as a background job — NEVER called inside generation pipeline.
   *
   * Requires: GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY, GSC_SITE_URL in .env
   */
  async syncFromGSC(userId: string): Promise<{ synced: number; errors: number }> {
    const clientEmail = process.env.GSC_CLIENT_EMAIL;
    const privateKey = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const siteUrl = process.env.GSC_SITE_URL;

    if (!clientEmail || !privateKey || !siteUrl) {
      throw new Error(
        "GSC not configured. Add GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY, GSC_SITE_URL to your .env file.",
      );
    }

    // Get user content with primary keywords to match GSC queries
    const contents = await prisma.content.findMany({
      where: { userId, primaryKeyword: { not: null } },
      select: { id: true, primaryKeyword: true, title: true },
    });

    if (contents.length === 0) return { synced: 0, errors: 0 };

    logger.info("ANALYTICS", `Starting GSC sync for ${contents.length} content items`);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28); // Last 4 weeks

    let synced = 0;
    let errors = 0;

    // Get an access token via service account JWT
    const accessToken = await this.getGSCAccessToken(clientEmail, privateKey);

    for (const content of contents) {
      try {
        const data = await this.fetchGSCData(accessToken, siteUrl, content.primaryKeyword!, startDate, endDate);
        if (!data) continue;

        // Upsert by contentId + date (idempotent)
        await prisma.contentPerformance.upsert({
          where: {
            // Composite unique handled by application logic since Prisma doesn't auto-create it
            id: `${content.id}:${data.date}`,
          },
          update: {
            impressions: data.impressions,
            clicks: data.clicks,
            ctr: data.ctr,
            avgPosition: data.avgPosition,
          },
          create: {
            contentId: content.id,
            impressions: data.impressions,
            clicks: data.clicks,
            ctr: data.ctr,
            avgPosition: data.avgPosition,
            date: new Date(data.date),
          },
        });

        synced++;
      } catch (err) {
        logger.warn("ANALYTICS", `Failed to sync content ${content.id}`, { err });
        errors++;
      }
    }

    logger.info("ANALYTICS", `GSC sync complete: ${synced} synced, ${errors} errors`);
    return { synced, errors };
  }

  /**
   * Get performance trends for a user's content library.
   * Pure DB aggregation — no external calls.
   */
  async getTrends(userId: string, days = 28): Promise<PerformanceTrend[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const midpoint = new Date();
    midpoint.setDate(midpoint.getDate() - Math.round(days / 2));

    const contents = await prisma.content.findMany({
      where: { userId, performance: { some: { date: { gte: cutoff } } } },
      select: {
        id: true,
        title: true,
        performance: {
          where: { date: { gte: cutoff } },
          orderBy: { date: "asc" },
        },
      },
    });

    return contents.map((c) => {
      const all = c.performance;
      const recent = all.filter((p) => p.date >= midpoint);
      const older = all.filter((p) => p.date < midpoint);

      const sum = (arr: typeof all, key: "impressions" | "clicks" | "ctr" | "avgPosition") =>
        arr.reduce((acc, p) => acc + p[key], 0);

      const totalImpressions = sum(all, "impressions");
      const totalClicks = sum(all, "clicks");
      const avgCTR = all.length ? sum(all, "ctr") / all.length : 0;
      const avgPosition = all.length ? sum(all, "avgPosition") / all.length : 0;

      const recentImpressions = recent.length ? sum(recent, "impressions") / recent.length : 0;
      const olderImpressions = older.length ? sum(older, "impressions") / older.length : 1;
      const recentCTR = recent.length ? sum(recent, "ctr") / recent.length : 0;
      const olderCTR = older.length ? sum(older, "ctr") / older.length : 0;

      const deltaImpressions = Math.round(recentImpressions - olderImpressions);
      const deltaCTR = parseFloat((recentCTR - olderCTR).toFixed(4));

      const trend: "rising" | "stable" | "declining" =
        deltaImpressions > 10 ? "rising" : deltaImpressions < -10 ? "declining" : "stable";

      return {
        contentId: c.id,
        title: c.title,
        totalImpressions,
        totalClicks,
        avgCTR: parseFloat(avgCTR.toFixed(4)),
        avgPosition: parseFloat(avgPosition.toFixed(1)),
        trend,
        deltaImpressions,
        deltaCTR,
      };
    });
  }

  /**
   * Get performance history for a single content item.
   */
  async getContentPerformance(contentId: string, userId: string, days = 90) {
    const content = await prisma.content.findUnique({
      where: { id: contentId, userId },
      select: { id: true, title: true },
    });
    if (!content) throw new Error("Content not found");

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const rows = await prisma.contentPerformance.findMany({
      where: { contentId, date: { gte: cutoff } },
      orderBy: { date: "asc" },
    });

    return { content, rows };
  }

  /**
   * Manually upsert performance data (for testing or manual import).
   */
  async upsertPerformance(data: Omit<GSCRow, "date"> & { date: string }) {
    return prisma.contentPerformance.create({
      data: {
        contentId: data.contentId,
        impressions: data.impressions,
        clicks: data.clicks,
        ctr: data.ctr,
        avgPosition: data.avgPosition,
        date: new Date(data.date),
      },
    });
  }

  // ─── GSC API Helpers ────────────────────────────────────────────────────

  private async getGSCAccessToken(clientEmail: string, privateKey: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    // Create JWT manually (avoiding heavy googleapis SDK)
    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const unsigned = `${header}.${body}`;

    const { createSign } = await import("crypto");
    const sign = createSign("RSA-SHA256");
    sign.update(unsigned);
    const signature = sign.sign(privateKey, "base64url");

    const jwt = `${unsigned}.${signature}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const data = await res.json() as { access_token: string };
    if (!data.access_token) throw new Error("Failed to get GSC access token");

    return data.access_token;
  }

  private async fetchGSCData(
    token: string,
    siteUrl: string,
    keyword: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ impressions: number; clicks: number; ctr: number; avgPosition: number; date: string } | null> {
    const fmt = (d: Date) => d.toISOString().split("T")[0];

    const res = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          dimensions: ["query"],
          dimensionFilterGroups: [{
            filters: [{ dimension: "query", operator: "contains", expression: keyword }],
          }],
          rowLimit: 1,
        }),
      },
    );

    if (!res.ok) return null;

    const data = await res.json() as { rows?: Array<{ clicks: number; impressions: number; ctr: number; position: number }> };
    const row = data.rows?.[0];
    if (!row) return null;

    return {
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: parseFloat(row.ctr.toFixed(4)),
      avgPosition: parseFloat(row.position.toFixed(1)),
      date: fmt(endDate),
    };
  }
}

export const analyticsService = new AnalyticsService();
