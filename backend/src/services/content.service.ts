import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";

export async function createContent(
  userId: string,
  title: string,
  body: string,
  templateId?: string,
) {
  return prisma.content.create({
    data: {
      title,
      body,
      userId,
      templateId,
    },
    include: {
      template: true,
    },
  });
}

export async function updateContent(
  contentId: string,
  userId: string,
  updates: { title?: string; body?: string; status?: string },
) {
  // Check ownership
  const content = await prisma.content.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    throw new AppError(404, "Content not found");
  }

  if (content.userId !== userId) {
    throw new AppError(403, "Unauthorized to update this content");
  }

  return prisma.content.update({
    where: { id: contentId },
    data: updates,
  });
}

export async function deleteContent(contentId: string, userId: string) {
  // Check ownership
  const content = await prisma.content.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    throw new AppError(404, "Content not found");
  }

  if (content.userId !== userId) {
    throw new AppError(403, "Unauthorized to delete this content");
  }

  return prisma.content.delete({
    where: { id: contentId },
  });
}

export async function getContent(contentId: string, userId: string) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: {
      template: true,
    },
  });

  if (!content) {
    throw new AppError(404, "Content not found");
  }

  if (content.userId !== userId) {
    throw new AppError(403, "Unauthorized to view this content");
  }

  return content;
}

export async function listUserContent(
  userId: string,
  status?: string,
  contentType?: string,
  limit: number = 20,
  offset: number = 0,
) {
  const where: any = { userId };

  if (status) {
    where.status = status;
  }

  if (contentType) {
    where.contentType = contentType;
  }

  const [contents, total] = await Promise.all([
    prisma.content.findMany({
      where,
      include: { template: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        body: true,
        status: true,
        contentType: true,
        inputData: true,
        generatedOutput: true,
        createdAt: true,
        updatedAt: true,
        template: true,
      },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    data: contents,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  };
}
