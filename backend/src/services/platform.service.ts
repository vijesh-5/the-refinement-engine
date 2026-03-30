import { prisma } from "../config/database";
import { PlatformName } from "@prisma/client";

export const platformService = {
  /** List all connected platforms for a user */
  async list(userId: string) {
    return prisma.connectedPlatform.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  /** Get a specific platform connection */
  async getByPlatform(userId: string, platformName: PlatformName) {
    return prisma.connectedPlatform.findUnique({
      where: { userId_platformName: { userId, platformName } },
    });
  },

  /** Create or update a platform connection */
  async upsert(
    userId: string,
    platformName: PlatformName,
    credentials: Record<string, string>,
    isActive = true
  ) {
    return prisma.connectedPlatform.upsert({
      where: { userId_platformName: { userId, platformName } },
      create: { userId, platformName, credentials, isActive },
      update: { credentials, isActive },
    });
  },

  /** Toggle active status */
  async toggle(userId: string, id: string, isActive: boolean) {
    return prisma.connectedPlatform.update({
      where: { id, userId },
      data: { isActive },
    });
  },

  /** Delete a platform connection */
  async remove(userId: string, id: string) {
    return prisma.connectedPlatform.delete({
      where: { id, userId },
    });
  },
};
