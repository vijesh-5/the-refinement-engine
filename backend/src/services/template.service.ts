import { prisma } from "../config/database";

export async function getAllTemplates() {
  return prisma.template.findMany({
    where: {
      isActive: true,
    },
    orderBy: { category: "asc" },
  });
}

export async function getTemplatesByCategory(category: string) {
  return prisma.template.findMany({
    where: {
      category,
      isActive: true,
    },
  });
}

export async function getTemplateCategories() {
  const templates = await prisma.template.findMany({
    where: {
      isActive: true,
    },
    distinct: ["category"],
    select: {
      category: true,
    },
  });

  return templates.map((t) => t.category);
}

export async function getTemplate(id: string) {
  return prisma.template.findUnique({
    where: { id },
  });
}
