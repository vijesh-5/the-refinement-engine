import { geminiService } from "./gemini.service";
import { prisma } from "../config/database";

interface AdInput {
  platform: "Facebook" | "Instagram" | "Google" | "LinkedIn";
  product: string;
  targetAudience: string;
  keyBenefit: string;
  tone: "direct" | "playful" | "urgent" | "professional";
}

interface AdVariant {
  headline: string;
  primaryText: string;
  cta: string;
}

interface AdOutput {
  platform: string;
  variants: AdVariant[];
}

export async function generateAd(
  userId: string,
  input: AdInput,
): Promise<AdOutput> {
  // Platform-specific guidelines
  const platformSpecs = {
    Facebook: {
      headlineLength: "40 characters",
      primaryTextLength: "125 characters",
      variants: 3,
    },
    Instagram: {
      headlineLength: "30 characters",
      primaryTextLength: "125 characters",
      variants: 3,
    },
    Google: {
      headlineLength: "30 characters",
      primaryTextLength: "90 characters",
      variants: 3,
    },
    LinkedIn: {
      headlineLength: "70 characters",
      primaryTextLength: "150 characters",
      variants: 3,
    },
  };

  const specs = platformSpecs[input.platform];

  // Build comprehensive prompt using ALL input fields
  const prompt = `You are an expert advertising copywriter. Create ${specs.variants} high-converting ad copy variants for ${input.platform} with these specifications:

PRODUCT/SERVICE: ${input.product}
TARGET AUDIENCE: ${input.targetAudience}
KEY BENEFIT: ${input.keyBenefit}
TONE: ${input.tone}

Platform Requirements for ${input.platform}:
- Headline max length: ${specs.headlineLength}
- Primary text max length: ${specs.primaryTextLength}
- Create ${specs.variants} distinct variants

Guidelines:
1. Each variant should be unique and test different angles
2. Headlines must be punchy and attention-grabbing
3. Primary text should highlight the key benefit: ${input.keyBenefit}
4. Tone must be ${input.tone}
5. Include clear, action-oriented CTAs
6. Make it compelling for: ${input.targetAudience}
7. Follow ${input.platform} best practices

Return the response in the following JSON format:
{
  "platform": "${input.platform}",
  "variants": [
    {
      "headline": "Attention-grabbing headline",
      "primaryText": "Compelling ad copy that highlights benefits",
      "cta": "Strong call-to-action"
    },
    {
      "headline": "Alternative headline approach",
      "primaryText": "Different angle on the same message",
      "cta": "Different CTA variation"
    },
    {
      "headline": "Third unique headline",
      "primaryText": "Yet another compelling approach",
      "cta": "Third CTA option"
    }
  ]
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown formatting.`;

  // Generate content using Gemini
  const response = await geminiService.generateContent(prompt);
  const output = geminiService.parseJsonResponse<AdOutput>(response);

  // Validate output structure
  if (!output.variants || output.variants.length === 0) {
    throw new Error("Invalid ad output structure from AI");
  }

  // Save to database
  await prisma.content.create({
    data: {
      userId,
      contentType: "ad",
      title: `${input.platform} Ad - ${input.product}`,
      body: JSON.stringify(output.variants),
      status: "COMPLETE",
      inputData: input,
      generatedOutput: output,
    },
  });

  return output;
}
