import { geminiService } from "./gemini.service";

export interface PipelineInput {
  topic: string;
  audience: string;
  tone: string;
  keywords: string[];
  length: string;
  intent?: string;
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
    // 1. Writer Agent: Create the initial draft
    const writerOutput = await this.runWriterAgent(input);

    // 2. SEO Critic Agent: Critique the draft for SEO
    const seoFeedback = await this.runSEOCriticAgent(writerOutput, input);

    // 3. Conversion Critic Agent: Critique the draft for conversion
    const conversionFeedback = await this.runConversionCriticAgent(
      writerOutput,
      input,
    );

    // 4. Synthesizer Agent: Final polished output
    const finalResult = await this.runSynthesizerAgent(
      writerOutput,
      seoFeedback,
      conversionFeedback,
      input,
    );

    return finalResult;
  }

  private async runWriterAgent(input: PipelineInput): Promise<string> {
    const prompt = `You are an expert content writer. Create an initial draft for a blog post.
    TOPIC: ${input.topic}
    AUDIENCE: ${input.audience}
    TONE: ${input.tone}
    KEYWORDS: ${input.keywords.join(", ")}
    LENGTH: ${input.length}
    INTENT: ${input.intent || "Informative"}

    Focus on high-quality storytelling and value. Output the draft in HTML format with proper headings and structure.`;

    return geminiService.generateContent(prompt);
  }

  private async runSEOCriticAgent(
    draft: string,
    input: PipelineInput,
  ): Promise<string> {
    const prompt = `You are a Senior SEO Specialist. Critique the following blog draft for SEO optimization.
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
    const prompt = `You are a Conversion Rate Optimization (CRO) Expert. Critique the following blog draft for its ability to drive action.
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
    const prompt = `You are a Master Content Strategist. Your task is to synthesize an initial draft with feedback from an SEO Critic and a Conversion Critic to produce a final, high-performance blog post.

    INITIAL DRAFT: ${writerOutput}
    SEO FEEDBACK: ${seoFeedback}
    CONVERSION FEEDBACK: ${conversionFeedback}
    SPECIFICATIONS: Topic=${input.topic}, Audience=${input.audience}, Tone=${input.tone}

    Instructions:
    1. Apply the SEO feedback to optimize for ranking (keyword placement, headings).
    2. Apply the conversion feedback to optimize for engagement (CTA, emotional hooks).
    3. Maintain the original core message while elevating the quality.
    4. Create all necessary metadata (title, meta description, outline).

    Return the response in the following JSON format:
    {
      "title": "Engaging, SEO-optimized title",
      "metaDescription": "150-160 character meta description",
      "outline": ["Section 1", "Section 2", ...],
      "finalContent": "The complete polished blog post in HTML format",
      "wordCount": actual_word_count_number,
      "seoInsights": "Brief summary of what was improved for SEO",
      "conversionInsights": "Brief summary of what was improved for conversion",
      "reasoningSummary": "Professional summary of the refinement process"
    }

    IMPORTANT: Return ONLY valid JSON.`;

    const response = await geminiService.generateContent(prompt);
    return geminiService.parseJsonResponse<PipelineOutput>(response);
  }
}

export const intelligentGeneratorService = new IntelligentGeneratorService();
