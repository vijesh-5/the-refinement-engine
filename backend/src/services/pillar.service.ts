import { prisma } from "../config/database";

// ─── Authority Pillar CRUD ──────────────────────────────────────────────────

export async function createPillar(userId: string, data: { name: string; description?: string }) {
  return prisma.authorityPillar.create({
    data: { userId, name: data.name, description: data.description },
    include: { clusters: true, _count: { select: { contents: true } } },
  });
}

export async function getPillars(userId: string) {
  return prisma.authorityPillar.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      clusters: true,
      _count: { select: { contents: true } },
    },
  });
}

export async function getPillar(id: string, userId: string) {
  return prisma.authorityPillar.findUnique({
    where: { id, userId },
    include: {
      clusters: true,
      contents: {
        select: { id: true, title: true, funnelStage: true, objective: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { contents: true } },
    },
  });
}

export async function updatePillar(id: string, userId: string, data: { name?: string; description?: string }) {
  // Ensure ownership
  const existing = await prisma.authorityPillar.findUnique({ where: { id, userId } });
  if (!existing) throw new Error("Pillar not found");

  return prisma.authorityPillar.update({
    where: { id },
    data,
    include: { clusters: true, _count: { select: { contents: true } } },
  });
}

export async function deletePillar(id: string, userId: string) {
  const existing = await prisma.authorityPillar.findUnique({ where: { id, userId } });
  if (!existing) throw new Error("Pillar not found");

  await prisma.authorityPillar.delete({ where: { id } });
}

// ─── Content Cluster CRUD ───────────────────────────────────────────────────

export async function addCluster(pillarId: string, userId: string, data: { name: string; keywords?: string[] }) {
  // Verify pillar ownership
  const pillar = await prisma.authorityPillar.findUnique({ where: { id: pillarId, userId } });
  if (!pillar) throw new Error("Pillar not found");

  return prisma.contentCluster.create({
    data: { pillarId, name: data.name, keywords: data.keywords || [] },
  });
}

export async function deleteCluster(clusterId: string, userId: string) {
  const cluster = await prisma.contentCluster.findUnique({
    where: { id: clusterId },
    include: { pillar: { select: { userId: true } } },
  });
  if (!cluster || cluster.pillar.userId !== userId) throw new Error("Cluster not found");

  await prisma.contentCluster.delete({ where: { id: clusterId } });
}

// ─── Authority Map Engine (Deterministic Intelligence) ──────────────────────

export interface AuthorityMapData {
  pillars: Array<{
    id: string;
    name: string;
    description: string | null;
    contentCount: number;
    clusters: Array<{
      id: string;
      name: string;
      keywords: string[];
    }>;
    funnelBreakdown: Record<string, number>;
    objectiveBreakdown: Record<string, number>;
    coverageGaps: string[];
  }>;
  uncategorized: number;
  totalContent: number;
}

/**
 * Build the full authority map for a user.
 * Shows pillar structure, content distribution, and coverage gaps.
 * Pure DB queries + JS logic — zero AI cost.
 */
export async function getAuthorityMap(userId: string): Promise<AuthorityMapData> {
  const [pillarsWithData, totalContent, uncategorizedCount] = await Promise.all([
    prisma.authorityPillar.findMany({
      where: { userId },
      include: {
        clusters: true,
        contents: {
          select: { funnelStage: true, objective: true },
        },
      },
    }),
    prisma.content.count({ where: { userId } }),
    prisma.content.count({ where: { userId, pillarId: null } }),
  ]);

  const pillars = pillarsWithData.map((p) => {
    // Compute funnel breakdown
    const funnelBreakdown: Record<string, number> = { TOFU: 0, MOFU: 0, BOFU: 0 };
    const objectiveBreakdown: Record<string, number> = { traffic: 0, leads: 0, sales: 0 };

    for (const content of p.contents) {
      if (content.funnelStage) funnelBreakdown[content.funnelStage] = (funnelBreakdown[content.funnelStage] || 0) + 1;
      if (content.objective) objectiveBreakdown[content.objective] = (objectiveBreakdown[content.objective] || 0) + 1;
    }

    // Identify coverage gaps
    const coverageGaps: string[] = [];
    if (funnelBreakdown.TOFU === 0) coverageGaps.push("No TOFU (awareness) content");
    if (funnelBreakdown.MOFU === 0) coverageGaps.push("No MOFU (consideration) content");
    if (funnelBreakdown.BOFU === 0) coverageGaps.push("No BOFU (decision) content");
    if (p.clusters.length === 0) coverageGaps.push("No topic clusters defined");
    if (p.contents.length < 3) coverageGaps.push("Needs more content for authority");

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      contentCount: p.contents.length,
      clusters: p.clusters.map((c) => ({
        id: c.id,
        name: c.name,
        keywords: c.keywords,
      })),
      funnelBreakdown,
      objectiveBreakdown,
      coverageGaps,
    };
  });

  return {
    pillars,
    uncategorized: uncategorizedCount,
    totalContent,
  };
}

/**
 * Get a flat, frontend-friendly visualization of all clusters.
 * Returns pillar → cluster tree with content counts.
 */
export async function getClusterVisualization(userId: string) {
  const pillars = await prisma.authorityPillar.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      clusters: {
        select: {
          id: true,
          name: true,
          keywords: true,
        },
      },
      _count: { select: { contents: true } },
    },
    orderBy: { name: "asc" },
  });

  return pillars.map((p) => ({
    id: p.id,
    name: p.name,
    contentCount: p._count.contents,
    clusters: p.clusters,
  }));
}
