import { geminiService } from "./gemini.service";
import { prisma } from "../config/database";

interface BlogInput {
  topic: string;
  audience: string;
  tone: string;
  keywords: string[];
  length: "short" | "medium" | "long";
  intent?: string;
}

interface BlogOutput {
  title: string;
  metaDescription: string;
  outline: string[];
  content: string;
  wordCount: number;
}

export async function generateBlog(
  userId: string,
  input: BlogInput,
): Promise<BlogOutput> {
  // Determine word count target based on length
  const wordCountTargets = {
    short: "500-800",
    medium: "1000-1500",
    long: "2000-3000",
  };

  // Build comprehensive prompt using ALL input fields
  const prompt = `You are an expert content writer. Generate a high-quality, engaging blog post with the following specifications:

TOPIC: ${input.topic}
TARGET AUDIENCE: ${input.audience}
TONE: ${input.tone}
${input.keywords.length > 0 ? `KEYWORDS TO INCLUDE: ${input.keywords.join(", ")}` : ""}
TARGET LENGTH: ${wordCountTargets[input.length]} words
${input.intent ? `INTENT/PURPOSE: ${input.intent}` : ""}

Requirements:
1. Create an attention-grabbing title
2. Write a compelling meta description (150-160 characters)
3. Provide a clear outline with 4-6 main sections
4. Write the complete blog post with rich, detailed content
5. Make sure the tone matches: ${input.tone}
6. Optimize for the target audience: ${input.audience}
7. Naturally incorporate the keywords throughout the content
8. Include actionable insights and valuable information

Return the response in the following JSON format:
{
  "title": "Engaging blog title here",
  "metaDescription": "SEO-friendly meta description",
  "outline": ["Section 1 title", "Section 2 title", ...],
  "content": "Full blog post content in HTML format with proper headings, paragraphs, and formatting",
  "wordCount": actual_word_count_number
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown formatting.`;

  // Generate content using Gemini
  const response = await geminiService.generateContent(prompt);
  const output = geminiService.parseJsonResponse<BlogOutput>(response);

  // Validate output structure
  if (
    !output.title ||
    !output.content ||
    !output.outline ||
    !output.metaDescription
  ) {
    throw new Error("Invalid blog output structure from AI");
  }

  // Save to database
  await prisma.content.create({
    data: {
      userId,
      contentType: "blog",
      title: output.title,
      body: output.content,
      status: "COMPLETE",
      inputData: input,
      generatedOutput: output,
    },
  });

  return output;
}
