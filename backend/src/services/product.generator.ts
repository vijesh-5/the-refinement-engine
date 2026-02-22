import { geminiService } from "./gemini.service";
import { prisma } from "../config/database";
import { scoringService, ContentScore } from "./scoring.service";
import { competitorService } from "./competitor.service";

interface ProductInput {
  productName: string;
  features: string;
  tone: string;
  targetAudience: string;
  length: "short" | "medium" | "long";
  brandId?: string;
}

interface ProductOutput {
  productName: string;
  shortDescription: string;
  bulletFeatures: string[];
  longDescription: string;
  reasoningSummary?: string;
  score?: ContentScore;
  id?: string;
}

export async function generateProductDescription(
  userId: string,
  input: ProductInput,
): Promise<ProductOutput> {
  // Determine description length targets
  const lengthGuidelines = {
    short: "100-150 words for short description, 200-300 for long",
    medium: "150-200 words for short description, 400-600 for long",
    long: "200-250 words for short description, 700-1000 for long",
  };

  let brandContext = "";
  if (input.brandId) {
    const brand = await prisma.brandProfile.findUnique({
      where: { id: input.brandId, userId },
    });
    if (brand) {
      brandContext = `
BRAND IDENTITY: ${brand.name}
BRAND TONE: ${brand.tone}
BRAND VOICE: ${brand.brandVoice || "N/A"}
TARGET AUDIENCE: ${brand.targetAudience || input.targetAudience}
BANNED WORDS: ${brand.bannedWords.join(", ") || "None"}
`;
    }
  }

  // Fetch competitor context if brand is selected
  let competitorDiffContext = "";
  if (input.brandId) {
    competitorDiffContext = await competitorService.getCompetitorContext(input.brandId);
  }

  // Build comprehensive prompt using ALL input fields
  const prompt = `You are an expert product copywriter specializing in e-commerce. Create a compelling product description with these specifications:
${brandContext}
${competitorDiffContext}
PRODUCT NAME: ${input.productName}
FEATURES/DETAILS: ${input.features}
TARGET AUDIENCE: ${input.targetAudience}
TONE: ${input.tone}
LENGTH: ${input.length} (${lengthGuidelines[input.length]})

Requirements:
1. Create a punchy short description (1-2 sentences) that captures attention
2. Extract and format key features as bullet points (5-8 bullets)
3. Write a detailed long description that:
   - Tells a story about the product
   - Emphasizes benefits over features
   - Appeals to ${input.targetAudience}
   - Uses ${input.tone} tone throughout
   - Creates desire and urgency
   - Addresses potential objections
4. Make the copy persuasive and conversion-focused
5. Highlight what makes this product unique

Return the response in the following JSON format:
{
  "productName": "${input.productName}",
  "shortDescription": "One compelling sentence that makes people want to read more",
  "bulletFeatures": [
    "Key feature 1 with benefit",
    "Key feature 2 with benefit",
    "Key feature 3 with benefit",
    "Key feature 4 with benefit",
    "Key feature 5 with benefit"
  ],
  "longDescription": "Detailed, persuasive product description that tells the complete story and drives conversions",
  "reasoningSummary": "Brief professional explanation of your copywriting strategy: how you ordered the benefit hierarchy, which persuasion techniques you used, and how the tone targets the specific audience"
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown formatting.`;

  // Generate content using Gemini
  const response = await geminiService.generateContent(prompt);
  const output = geminiService.parseJsonResponse<ProductOutput>(response);

  // Validate output structure
  if (
    !output.productName ||
    !output.shortDescription ||
    !output.bulletFeatures ||
    !output.longDescription
  ) {
    throw new Error("Invalid product description output structure from AI");
  }

  // Calculate score
  const score = await scoringService.scoreContent(output.longDescription, "product");
  output.score = score;

  // Save to database
  const content = await prisma.content.create({
    data: {
      userId,
      contentType: "product",
      title: input.productName,
      body: JSON.stringify(output),
      status: "COMPLETE",
      inputData: input as any,
      generatedOutput: output as any,
    },
  });

  return { ...output, id: content.id };
}
