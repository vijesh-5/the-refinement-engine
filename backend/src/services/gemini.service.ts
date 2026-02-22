import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";

type AIProvider = "gemini" | "ollama";

class AIService {
  private provider: AIProvider;
  private geminiModel: any;

  constructor() {
    this.provider = (env.AI_PROVIDER as AIProvider) || "gemini";

    if (this.provider === "gemini") {
      if (!env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is required when AI_PROVIDER=gemini");
      }
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      this.geminiModel = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL || "gemini-2.0-flash",
      });
    }
  }

  /**
   * Generate content using the configured AI provider (Gemini or Ollama).
   */
  async generateContent(prompt: string): Promise<string> {
    if (this.provider === "ollama") {
      return this.callOllama(prompt);
    }
    return this.callGemini(prompt);
  }

  private async callGemini(prompt: string): Promise<string> {
    try {
      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new AppError(500, "Failed to generate content from Gemini API");
      }

      return text;
    } catch (error: any) {
      if (error.message?.includes("API key")) {
        throw new AppError(500, "Invalid Gemini API key");
      }
      if (error.message?.includes("quota")) {
        throw new AppError(429, "Gemini quota exceeded. Switch to AI_PROVIDER=ollama or try later.");
      }
      throw new AppError(500, `Gemini error: ${error.message || "Unknown error"}`);
    }
  }

  private async callOllama(prompt: string): Promise<string> {
    const baseUrl = env.OLLAMA_URL || "http://localhost:11434";
    const model = env.OLLAMA_MODEL || "llama3:8b";

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 4096,
          },
        }),
        signal: AbortSignal.timeout(120_000), // 2 min — local LLM can be slow on first call
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new AppError(
          500,
          `Ollama API error (${response.status}): ${errText}. Is Ollama running? Try: ollama serve`
        );
      }

      const data: any = await response.json();

      if (!data.response) {
        throw new AppError(500, "Ollama returned an empty response");
      }

      return data.response as string;
    } catch (error: any) {
      if (error instanceof AppError) throw error;

      if (error.name === "TimeoutError" || error.code === "UND_ERR_CONNECT_TIMEOUT") {
        throw new AppError(
          504,
          "Ollama request timed out. The model may be loading — try again in a moment."
        );
      }

      if (error.cause?.code === "ECONNREFUSED") {
        throw new AppError(
          503,
          "Cannot connect to Ollama. Start it with: ollama serve"
        );
      }

      throw new AppError(500, `Ollama error: ${error.message || "Unknown error"}`);
    }
  }

  /**
   * Parse JSON from AI response text, stripping markdown code fences if present.
   */
  parseJsonResponse<T>(text: string): T {
    try {
      let clean = text.trim();

      // Strip ```json ... ``` or ``` ... ```
      if (clean.startsWith("```json")) {
        clean = clean.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (clean.startsWith("```")) {
        clean = clean.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }

      // Some Ollama models add prose before the JSON — try to extract the JSON object/array
      const jsonStart = clean.search(/[{[]/);
      if (jsonStart > 0) {
        clean = clean.slice(jsonStart);
        const jsonEnd = Math.max(clean.lastIndexOf("}"), clean.lastIndexOf("]"));
        if (jsonEnd !== -1) {
          clean = clean.slice(0, jsonEnd + 1);
        }
      }

      return JSON.parse(clean);
    } catch {
      throw new AppError(500, "Failed to parse AI response as JSON. The model may need a better system prompt for structured output.");
    }
  }

  /**
   * Returns which provider is currently active.
   */
  get activeProvider(): string {
    if (this.provider === "ollama") {
      return `Ollama (${env.OLLAMA_MODEL || "llama3:8b"})`;
    }
    return `Gemini (${env.GEMINI_MODEL || "gemini-2.0-flash"})`;
  }
}

export const aiService = new AIService();

// Backward-compatible alias so nothing else breaks during migration
export const geminiService = aiService;
