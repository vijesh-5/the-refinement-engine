import { prisma } from "../config/database";
import { intelligentGeneratorService } from "./intelligentGenerator";
import { scoringService, ContentScore } from "./scoring.service";

interface BlogInput {
  topic: string;
  audience: string;
  tone: string;
  keywords: string[];
  length: "short" | "medium" | "long";
  intent?: string;
  brandId?: string;
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

  // Use the multi-agent pipeline for intelligent generation
  const pipelineResult = await intelligentGeneratorService.generateWithPipeline({
    ...input,
    brand: brandContext,
    length: input.length === "short" ? "800 words" : input.length === "medium" ? "1500 words" : "2500 words"
  });

  // Calculate scores for the generated content
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
    score
  };

  // Save to database
  const content = await prisma.content.create({
    data: {
      userId,
      contentType: "blog",
      title: output.title,
      body: output.content,
      status: "COMPLETE",
      inputData: input as any,
      generatedOutput: output as any,
    },
  });

  return { ...output, id: content.id };
}
