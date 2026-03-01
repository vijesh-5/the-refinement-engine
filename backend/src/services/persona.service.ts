/**
 * Brand Persona Service — Storage Only (Phase: Future-Ready)
 *
 * IMPORTANT: Personas are NOT injected into the generation pipeline yet.
 * This is CRUD + storage only. Injection will be activated in a future phase
 * (with a short summary ≤ 200 tokens to stay Llama 1b safe).
 */
import { prisma } from "../config/database";

export interface PersonaInput {
  brandId: string;
  name: string;
  description?: string;
  toneBias?: string;
  vocabularyBias?: string;
}

class PersonaService {
  async create(input: PersonaInput) {
    return prisma.brandPersona.create({
      data: {
        brandId: input.brandId,
        name: input.name,
        description: input.description,
        toneBias: input.toneBias,
        vocabularyBias: input.vocabularyBias,
        active: false, // inactive by default — not injected until explicitly activated
      },
    });
  }

  async listByBrand(brandId: string, userId: string) {
    // Verify brand ownership
    const brand = await prisma.brandProfile.findUnique({
      where: { id: brandId, userId },
      select: { id: true },
    });
    if (!brand) throw new Error("Brand not found");

    return prisma.brandPersona.findMany({
      where: { brandId },
      orderBy: { createdAt: "desc" },
    });
  }

  async get(id: string, userId: string) {
    const persona = await prisma.brandPersona.findUnique({
      where: { id },
      include: { brand: { select: { userId: true } } },
    });
    if (!persona || persona.brand.userId !== userId) throw new Error("Persona not found");
    return persona;
  }

  async update(id: string, userId: string, input: Partial<PersonaInput> & { active?: boolean }) {
    const persona = await this.get(id, userId);
    if (!persona) throw new Error("Persona not found");

    return prisma.brandPersona.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        toneBias: input.toneBias,
        vocabularyBias: input.vocabularyBias,
        active: input.active,
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.get(id, userId); // ownership check
    await prisma.brandPersona.delete({ where: { id } });
  }

  /**
   * Future hook: generate a short pipeline-safe persona summary.
   * ≤ 200 tokens, safe for Llama 1b injection.
   * DO NOT CALL until pipeline integration is activated.
   */
  buildPromptSummary(persona: { name: string; description?: string | null; toneBias?: string | null; vocabularyBias?: string | null }): string {
    const parts: string[] = [`Persona: ${persona.name}.`];
    if (persona.toneBias) parts.push(`Tone: ${persona.toneBias}.`);
    if (persona.vocabularyBias) parts.push(`Vocabulary: ${persona.vocabularyBias}.`);
    if (persona.description) parts.push(persona.description.slice(0, 120));
    return parts.join(" ");
  }
}

export const personaService = new PersonaService();
