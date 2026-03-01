import { prisma } from "../config/database";

export async function getDashboardStats(userId: string) {
  const [recentContent, totalContent, totalDrafts, totalComplete, user] =
    await Promise.all([
      prisma.content.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { template: true },
      }),
      prisma.content.count({ where: { userId } }),
      prisma.content.count({
        where: { userId, status: "DRAFT" },
      }),
      prisma.content.count({
        where: { userId, status: "COMPLETE" },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          plan: true,
        },
      }),
    ]);

  return {
    user,
    stats: {
      totalContent,
      drafts: totalDrafts,
      complete: totalComplete,
    },
    recentContent,
  };
}

// ─── Growth Analytics ─────────────────────────────────────────────────────────

export async function getGrowthStats(userId: string) {
  const [
    funnelCounts,
    objectiveCounts,
    pillarData,
    contentVelocity,
    totalWithScores,
  ] = await Promise.all([
    // Funnel distribution
    prisma.content.groupBy({
      by: ["funnelStage"],
      where: { userId, funnelStage: { not: null } },
      _count: true,
    }),

    // Objective breakdown
    prisma.content.groupBy({
      by: ["objective"],
      where: { userId, objective: { not: null } },
      _count: true,
    }),

    // Pillar balance — count of contents per pillar
    prisma.authorityPillar.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        _count: { select: { contents: true, clusters: true } },
      },
    }),

    // Content velocity — last 30 days by week
    prisma.content.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),

    // Average scores — pull generatedOutput for contents that have scores
    prisma.content.findMany({
      where: {
        userId,
        generatedOutput: { not: undefined },
      },
      select: { generatedOutput: true },
      take: 100,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Compute funnel distribution map
  const funnel: Record<string, number> = { TOFU: 0, MOFU: 0, BOFU: 0 };
  for (const row of funnelCounts) {
    if (row.funnelStage) funnel[row.funnelStage] = row._count;
  }

  // Compute objective distribution map
  const objectives: Record<string, number> = { traffic: 0, leads: 0, sales: 0 };
  for (const row of objectiveCounts) {
    if (row.objective) objectives[row.objective] = row._count;
  }

  // Compute pillar balance
  const pillars = pillarData.map((p) => ({
    id: p.id,
    name: p.name,
    contentCount: p._count.contents,
    clusterCount: p._count.clusters,
  }));

  // Compute weekly velocity
  const weeklyVelocity: Record<string, number> = {};
  for (const item of contentVelocity) {
    const weekStart = getWeekStart(item.createdAt);
    weeklyVelocity[weekStart] = (weeklyVelocity[weekStart] || 0) + 1;
  }

  // Compute average score from generatedOutput.score
  let totalScore = 0;
  let scoreCount = 0;
  for (const item of totalWithScores) {
    const output = item.generatedOutput as any;
    if (output?.score?.total && typeof output.score.total === "number") {
      totalScore += output.score.total;
      scoreCount++;
    }
  }

  return {
    funnel,
    objectives,
    pillars,
    velocity: weeklyVelocity,
    averageScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : null,
    scoredContentCount: scoreCount,
  };
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}
