import { prisma } from "../config/database";
import { intelligentGeneratorService } from "./intelligentGenerator";
import { lightweightGeneratorService, getPipelineMode } from "./lightweightGenerator";
import { scoringService, ContentScore } from "./scoring.service";
import { competitorService } from "./competitor.service";
import { topicSuggestionService } from "./topic.service";
import { logger } from "../config/logger";

interface BlogInput {
  topic: string;
  audience: string;
  tone: string;
  keywords: string[];
  length: "short" | "medium" | "long";
  intent?: string;
  brandId?: string;
  // Strategic metadata
  funnelStage?: string;
  objective?: string;
  primaryKeyword?: string;
  pillarId?: string;
}

interface BlogOutput {
  title: string;
  metaDescription: string;
  outline: string[];
  content: string;
  wordCount: number;
  seoInsights?: string;
  conversionInsights?: string;
  reasoningSummary?: string;
  score?: ContentScore;
  id?: string;
}

export async function generateBlog(
  userId: string,
  input: BlogInput,
): Promise<BlogOutput> {
  let brandContext = undefined;
  if (input.brandId) {
    const brand = await prisma.brandProfile.findUnique({
      where: { id: input.brandId, userId },
    });
    if (brand) {
      brandContext = {
        name: brand.name,
        tone: brand.tone,
        brandVoice: brand.brandVoice || undefined,
        targetAudience: brand.targetAudience || undefined,
        bannedWords: brand.bannedWords,
      };
    }
  }

  const lengthLabel = input.length === "short" ? "800 words" : input.length === "medium" ? "1500 words" : "2500 words";

  // Determine pipeline mode
  const mode = getPipelineMode();
  logger.info("PIPELINE", `Using ${mode} pipeline mode`);

  let pipelineResult;

  if (mode === "light") {
    // ─── Lightweight: 1 LLM call ──────────────────────────────────────
    pipelineResult = await lightweightGeneratorService.generate({
      ...input,
      brand: brandContext,
      length: lengthLabel,
    });
  } else {
    // ─── Full: 4 LLM calls (Writer → Critics → Synthesizer) ──────────
    // Fetch competitor context only in full mode (too heavy for local)
    let competitorContext = "";
    if (input.brandId) {
      competitorContext = await competitorService.getCompetitorContext(input.brandId);
    }

    pipelineResult = await intelligentGeneratorService.generateWithPipeline({
      ...input,
      brand: brandContext,
      length: lengthLabel,
      competitorContext,
    });
  }

  // Calculate scores (heuristic — zero AI cost)
  const score = await scoringService.scoreContent(pipelineResult.finalContent, "blog", input.keywords);

  const output: BlogOutput = {
    title: pipelineResult.title,
    metaDescription: pipelineResult.metaDescription,
    outline: pipelineResult.outline,
    content: pipelineResult.finalContent,
    wordCount: pipelineResult.wordCount,
    seoInsights: pipelineResult.seoInsights,
    conversionInsights: pipelineResult.conversionInsights,
    reasoningSummary: pipelineResult.reasoningSummary,
    score,
  };

  // Save to database with strategic metadata
  const content = await prisma.content.create({
    data: {
      userId,
      contentType: "blog",
      title: output.title,
      body: output.content,
      status: "COMPLETE",
      inputData: input as any,
      generatedOutput: output as any,
      // Strategic metadata
      funnelStage: input.funnelStage || null,
      objective: input.objective || null,
      primaryKeyword: input.primaryKeyword || input.keywords[0] || null,
      pillarId: input.pillarId || null,
    },
  });

  // Fire-and-forget: generate topic suggestions in the background.
  // No await — this never blocks the main response.
  void topicSuggestionService.generateSuggestions(
    userId,
    input.topic,
    output.content,
    "blog",
    input.brandId,
  );

  return { ...output, id: content.id };
}
