import { geminiService } from "./gemini.service";
import { logger } from "../config/logger";

export interface PipelineInput {
  topic: string;
  audience: string;
  tone: string;
  keywords: string[];
  length: string;
  intent?: string;
  brand?: {
    name: string;
    tone: string;
    brandVoice?: string;
    targetAudience?: string;
    bannedWords: string[];
  };
  competitorContext?: string;
}

export interface PipelineOutput {
  title: string;
  metaDescription: string;
  outline: string[];
  finalContent: string;
  wordCount: number;
  seoInsights: string;
  conversionInsights: string;
  reasoningSummary: string;
}

class IntelligentGeneratorService {
  /**
   * Run the multi-agent generation pipeline
   */
  async generateWithPipeline(input: PipelineInput): Promise<PipelineOutput> {
    const pipelineStart = Date.now();
    logger.info("PIPELINE", `Starting generation for topic: "${input.topic}"`);

    // 1. Writer Agent: Create the initial draft
    const writerStart = Date.now();
    logger.info("PIPELINE", "Writer Agent started");
    const writerOutput = await this.runWriterAgent(input);
    logger.info("PIPELINE", `Writer Agent completed`, { durationMs: Date.now() - writerStart });

    // 2 & 3. SEO + Conversion Critics run in PARALLEL — both only need the draft
    const criticsStart = Date.now();
    logger.info("PIPELINE", "SEO Critic + Conversion Critic started (parallel)");
    const [seoFeedback, conversionFeedback] = await Promise.all([
      this.runSEOCriticAgent(writerOutput, input),
      this.runConversionCriticAgent(writerOutput, input),
    ]);
    logger.info("PIPELINE", `Critics completed (parallel)`, { durationMs: Date.now() - criticsStart });

    // 4. Synthesizer Agent: Final polished output
    const synthStart = Date.now();
    logger.info("PIPELINE", "Synthesizer Agent started");
    const finalResult = await this.runSynthesizerAgent(
      writerOutput,
      seoFeedback,
      conversionFeedback,
      input,
    );
    logger.info("PIPELINE", `Synthesizer Agent completed`, { durationMs: Date.now() - synthStart });

    logger.info("PIPELINE", `Pipeline complete`, { totalMs: Date.now() - pipelineStart, wordCount: finalResult.wordCount });

    return finalResult;
  }

  private async runWriterAgent(input: PipelineInput): Promise<string> {
    const brandContext = input.brand ? `
    BRAND IDENTITY: ${input.brand.name}
    BRAND TONE: ${input.brand.tone}
    BRAND VOICE: ${input.brand.brandVoice || "N/A"}
    BANNED WORDS: ${input.brand.bannedWords.join(", ") || "None"}
    ` : "";

    const prompt = `You are an expert content writer. Create an initial draft for a blog post.
    ${brandContext}
    TOPIC: ${input.topic}
    AUDIENCE: ${input.audience || (input.brand ? input.brand.targetAudience : "")}
    TONE: ${input.tone || (input.brand ? input.brand.tone : "")}
    KEYWORDS: ${input.keywords.join(", ")}
    LENGTH: ${input.length}
    INTENT: ${input.intent || "Informative"}

    Focus on high-quality storytelling and value.
    ${input.competitorContext ? `
    ${input.competitorContext}
    ` : ""}
    FORMATTING RULES:
    - Use clean Markdown formatting (## for headings, **bold**, *italic*, - for bullet lists).
    - Do NOT output HTML tags, CSS, or any code. No <html>, <head>, <style>, <div>, or similar tags.
    - Write the blog post as readable, copyable text that a human would paste into a CMS.
    - Use line breaks between paragraphs for readability.`;

    return geminiService.generateContent(prompt);
  }

  private async runSEOCriticAgent(
    draft: string,
    input: PipelineInput,
  ): Promise<string> {
    const brandContext = input.brand ? `BRAND IDENTITY: ${input.brand.name} (${input.brand.tone})` : "";

    const prompt = `You are a Senior SEO Specialist. Critique the following blog draft for SEO optimization.
    ${brandContext}
    DRAFT: ${draft}
    TARGET KEYWORDS: ${input.keywords.join(", ")}

    Analyze:
    1. Keyword placement and density.
    2. Heading hierarchy (H1, H2, H3).
    3. Meta description potential.
    4. Internal/External linking opportunities.

    Provide specific, actionable feedback on how to improve the SEO. Keep it concise.`;

    return geminiService.generateContent(prompt);
  }

  private async runConversionCriticAgent(
    draft: string,
    input: PipelineInput,
  ): Promise<string> {
    const brandContext = input.brand ? `
    BRAND IDENTITY: ${input.brand.name}
    BRAND VOICE: ${input.brand.brandVoice || "N/A"}
    TARGET AUDIENCE: ${input.brand.targetAudience || input.audience}
    ` : "";

    const prompt = `You are a Conversion Rate Optimization (CRO) Expert. Critique the following blog draft for its ability to drive action.
    ${brandContext}
    DRAFT: ${draft}
    TARGET AUDIENCE: ${input.audience}
    INTENT: ${input.intent}

    Analyze:
    1. Emotional triggers and persuasion.
    2. Strength of the Call to Action (CTA).
    3. Flow and readability for the specific audience.
    4. Trust factors and social proof placement.

    Provide specific, actionable feedback on how to increase conversion and engagement.`;

    return geminiService.generateContent(prompt);
  }

  private async runSynthesizerAgent(
    writerOutput: string,
    seoFeedback: string,
    conversionFeedback: string,
    input: PipelineInput,
  ): Promise<PipelineOutput> {
    const brandContext = input.brand ? `
    BRAND COMPLIANCE: Adhere strictly to ${input.brand.name}'s voice: ${input.brand.brandVoice || "N/A"}.
    BANNED WORDS: DO NOT USE: ${input.brand.bannedWords.join(", ") || "None"}
    ` : "";

    const prompt = `You are a Master Content Strategist. Your task is to synthesize an initial draft with feedback from an SEO Critic and a Conversion Critic to produce a final, high-performance blog post.

    INITIAL DRAFT: ${writerOutput}
    SEO FEEDBACK: ${seoFeedback}
    CONVERSION FEEDBACK: ${conversionFeedback}
    SPECIFICATIONS: Topic=${input.topic}, Audience=${input.audience}, Tone=${input.tone}
    ${brandContext}
    ${input.competitorContext || ""}

    Instructions:
    1. Apply the SEO feedback to optimize for ranking (keyword placement, headings).
    2. Apply the conversion feedback to optimize for engagement (CTA, emotional hooks).
    3. Maintain the original core message while elevating the quality.
    4. Create all necessary metadata (title, meta description, outline).
    5. Ensure brand voice compliance and word exclusion.
    6. If competitor intelligence is provided, emphasize our differentiators and exploit competitor gaps.

    FORMATTING RULES FOR finalContent:
    - Use clean Markdown formatting (## for headings, **bold**, *italic*, - for bullet lists).
    - Do NOT output HTML tags, CSS, or any code. No <html>, <head>, <style>, <div>, or similar tags.
    - The content should be readable, copyable plain text that a human would paste into a CMS or blog editor.
    - Use line breaks between paragraphs.

    Return the response in the following JSON format:
    {
      "title": "Engaging, SEO-optimized title",
      "metaDescription": "150-160 character meta description",
      "outline": ["Section 1", "Section 2", ...],
      "finalContent": "The complete polished blog post in clean Markdown (no HTML tags)",
      "wordCount": actual_word_count_number,
      "seoInsights": "Brief summary of what was improved for SEO",
      "conversionInsights": "Brief summary of what was improved for conversion",
      "reasoningSummary": "Professional summary of the refinement process"
    }

    IMPORTANT: Return ONLY valid JSON. The finalContent field must contain clean Markdown text, NOT HTML.`;

    const response = await geminiService.generateContent(prompt, { json: true });
    return geminiService.parseJsonResponse<PipelineOutput>(response);
  }
}

export const intelligentGeneratorService = new IntelligentGeneratorService();
