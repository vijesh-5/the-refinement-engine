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
