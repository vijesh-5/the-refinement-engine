/**
 * Knowledge Vault Service — Storage Only (Phase: Future-Ready)
 *
 * IMPORTANT: No embedding generation, no retrieval injection yet.
 * This is pure CRUD + storage to prepare the architecture.
 * RAG integration will be activated in a future phase.
 */
import { prisma } from "../config/database";

export interface KnowledgeDocumentInput {
  title: string;
  content: string;
}

class VaultService {
  async create(userId: string, input: KnowledgeDocumentInput) {
    return prisma.knowledgeDocument.create({
      data: { userId, title: input.title, content: input.content },
    });
  }

  async list(userId: string) {
    return prisma.knowledgeDocument.findMany({
      where: { userId },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async get(id: string, userId: string) {
    const doc = await prisma.knowledgeDocument.findUnique({
      where: { id, userId },
    });
    if (!doc) throw new Error("Document not found");
    return doc;
  }

  async update(id: string, userId: string, input: Partial<KnowledgeDocumentInput>) {
    const doc = await prisma.knowledgeDocument.findUnique({ where: { id, userId } });
    if (!doc) throw new Error("Document not found");
    return prisma.knowledgeDocument.update({
      where: { id },
      data: { title: input.title, content: input.content },
    });
  }

  async delete(id: string, userId: string) {
    const doc = await prisma.knowledgeDocument.findUnique({ where: { id, userId } });
    if (!doc) throw new Error("Document not found");
    await prisma.knowledgeDocument.delete({ where: { id } });
  }
}

export const vaultService = new VaultService();
