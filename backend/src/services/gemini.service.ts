import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is required");
    }

    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  /**
   * Generate content using Gemini API with structured prompt
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new AppError(500, "Failed to generate content from Gemini API");
      }

      return text;
    } catch (error: any) {
      // Handle API errors gracefully
      if (error.message?.includes("API key")) {
        throw new AppError(500, "Invalid Gemini API key");
      }

      if (error.message?.includes("quota")) {
        throw new AppError(429, "API quota exceeded. Please try again later.");
      }

      throw new AppError(
        500,
        `Gemini API error: ${error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Parse JSON response from Gemini, handling markdown code blocks
   */
  parseJsonResponse<T>(text: string): T {
    try {
      // Remove markdown code blocks if present
      let cleanedText = text.trim();

      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText
          .replace(/^```json\n/, "")
          .replace(/\n```$/, "");
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      return JSON.parse(cleanedText);
    } catch (error) {
      throw new AppError(500, "Failed to parse AI response as JSON");
    }
  }
}

export const geminiService = new GeminiService();
