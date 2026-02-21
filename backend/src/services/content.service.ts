import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";

export async function createContent(
  userId: string,
  title: string,
  body: string,
  templateId?: string,
  contentType?: string,
  status?: string,
  generatedOutput?: any,
  inputData?: any,
) {
  return prisma.content.create({
    data: {
      title,
      body,
      userId,
      templateId,
      contentType: contentType || "general",
      status: (status as any) || "DRAFT",
      generatedOutput: generatedOutput || undefined,
      inputData: inputData || undefined,
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
    data: updates as any,
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
        template: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
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
