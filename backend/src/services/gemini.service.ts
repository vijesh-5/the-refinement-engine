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
  async generateContent(prompt: string, options?: { json?: boolean }): Promise<string> {
    if (this.provider === "ollama") {
      return this.callOllama(prompt, options);
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
      console.error("Gemini API Error Detail:", {
        message: error.message,
        status: error.status,
        reason: error.reason,
        stack: error.stack
      });

      if (error.message?.includes("API key")) {
        throw new AppError(500, "Invalid Gemini API key. Please check your .env configuration.");
      }
      if (error.message?.includes("quota") || error.message?.includes("429")) {
        throw new AppError(429, `Gemini quota exceeded: ${error.message}. If you just updated your key, ensure the server was restarted.`);
      }
      throw new AppError(500, `Gemini error: ${error.message || "Unknown error"}`);
    }
  }

  private async callOllama(prompt: string, options?: { json?: boolean }): Promise<string> {
    const baseUrl = env.OLLAMA_URL || "http://localhost:11434";
    const model = env.OLLAMA_MODEL || "llama3:8b";

    try {
      const body: any = {
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 2048,
        },
      };

      if (options?.json) {
        body.format = "json";
      }

      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
    let clean = text.trim();

    try {
      // Strip ```json ... ``` or ``` ... ```
      if (clean.includes("```json")) {
        clean = clean.split("```json")[1].split("```")[0].trim();
      } else if (clean.includes("```")) {
        const parts = clean.split("```");
        if (parts.length >= 3) {
          clean = parts[1].trim();
        }
      }

      // Final attempt: extract between first { or [ and last } or ]
      const firstCurly = clean.indexOf("{");
      const firstBracket = clean.indexOf("[");
      const lastCurly = clean.lastIndexOf("}");
      const lastBracket = clean.lastIndexOf("]");

      let start = -1;
      let end = -1;

      // Determine if it's an object or array
      if (firstCurly !== -1 && (firstBracket === -1 || firstCurly < firstBracket)) {
        start = firstCurly;
        end = lastCurly;
      } else if (firstBracket !== -1) {
        start = firstBracket;
        end = lastBracket;
      }

      if (start !== -1 && end !== -1 && end > start) {
        clean = clean.slice(start, end + 1);
      }

      return JSON.parse(clean);
    } catch (error: any) {
      console.error("JSON Parse Error:", {
        error: error.message,
        text: text.slice(0, 500) + (text.length > 500 ? "..." : ""),
        cleaned: clean.slice(0, 500)
      });
      throw new AppError(500, `Failed to parse AI response as JSON. The model (especially smaller ones like ${env.OLLAMA_MODEL}) may have returned malformed output.`);
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
