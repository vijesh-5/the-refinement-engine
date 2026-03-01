import { geminiService } from "./gemini.service";
import { getPipelineMode } from "./lightweightGenerator";
import { logger } from "../config/logger";

export interface FormatSocialInput {
  content: string;
  title: string;
  url?: string;          // optional canonical URL for links
  platform: "x" | "linkedin" | "caption" | "all";
}

export interface SocialFormats {
  x?: XThread;
  linkedin?: LinkedInCarousel;
  caption?: string;
}

export interface XThread {
  tweets: string[];      // max 280 chars each
  hashtags: string[];
}

export interface LinkedInCarousel {
  slides: Array<{
    heading: string;
    body: string;
  }>;
  hook: string;
  cta: string;
}

class FormatterService {
  /**
   * Format blog content into social-media-ready formats.
   * In LIGHT mode: fully deterministic, zero LLM calls.
   * In FULL mode: optionally uses AI for higher-quality output.
   */
  async format(input: FormatSocialInput): Promise<SocialFormats> {
    const mode = getPipelineMode();
    const { platform, content, title, url } = input;

    logger.info("FORMATTER", `Formatting for ${platform} (${mode} mode)`);

    const result: SocialFormats = {};

    const needX = platform === "x" || platform === "all";
    const needLinkedIn = platform === "linkedin" || platform === "all";
    const needCaption = platform === "caption" || platform === "all";

    if (mode === "light") {
      if (needX) result.x = this.toXThread(content, title, url);
      if (needLinkedIn) result.linkedin = this.toLinkedInCarousel(content, title);
      if (needCaption) result.caption = this.toCaption(content, title);
    } else {
      // Full mode: use AI for X and LinkedIn, deterministic for caption
      if (needX) result.x = await this.toXThreadAI(content, title, url);
      if (needLinkedIn) result.linkedin = await this.toLinkedInCarouselAI(content, title);
      if (needCaption) result.caption = this.toCaption(content, title);
    }

    return result;
  }

  // ─── Deterministic Formatters ──────────────────────────────────────────────

  /**
   * Convert blog into an X/Twitter thread.
   * Splits by headings and keeps each tweet ≤ 280 chars.
   */
  private toXThread(content: string, title: string, url?: string): XThread {
    const tweets: string[] = [];

    // Tweet 1: hook from title
    tweets.push(`🧵 ${title}`);

    // Extract headings and their paragraph content
    const sections = this.extractSections(content);
    for (const section of sections.slice(0, 6)) {
      const tweet = this.truncateToTweetLength(`✅ ${section.heading}\n${section.body}`);
      if (tweet) tweets.push(tweet);
    }

    // Final tweet: CTA + link
    const cta = url ? `Read the full post: ${url}` : "Read more for the full breakdown.";
    tweets.push(cta);

    return {
      tweets,
      hashtags: this.extractHashtags(content),
    };
  }

  /**
   * Convert blog into a LinkedIn carousel-style post.
   */
  private toLinkedInCarousel(content: string, title: string): LinkedInCarousel {
    const sections = this.extractSections(content);

    const hook = `📌 ${title}`;
    const slides = sections.slice(0, 8).map((s) => ({
      heading: s.heading,
      body: s.body.slice(0, 200),
    }));
    const cta = "💡 Found this useful? Share it with your network and save for later!";

    return { hook, slides, cta };
  }

  /**
   * Generate a short social caption.
   */
  private toCaption(content: string, title: string): string {
    // Pull out first meaningful paragraph
    const paras = content
      .replace(/^#.+$/gm, "")
      .split(/\n{2,}/)
      .map((p) => p.replace(/[*_`#>[\]-]/g, "").trim())
      .filter((p) => p.length > 40);

    const lead = paras[0]?.slice(0, 200) ?? title;
    const hashtags = this.extractHashtags(content).slice(0, 5).join(" ");

    return `${lead}...\n\n${hashtags}`;
  }

  // ─── AI-Powered Formatters (Full Mode Only) ───────────────────────────────

  private async toXThreadAI(content: string, title: string, url?: string): Promise<XThread> {
    const prompt = `Convert this blog post into a Twitter/X thread. Format each tweet on a new line starting with a tweet number (1/, 2/, etc.). Max 280 chars per tweet. Include 5-7 tweets. Add a final tweet with a call to action${url ? ` and link: ${url}` : ""}. Keep it punchy and engaging.

TITLE: ${title}
CONTENT: ${content.slice(0, 2000)}

Output raw thread text only.`;

    const raw = await geminiService.generateContent(prompt);
    const lines = raw.split("\n").filter((l) => l.match(/^\d+\//));
    const tweets = lines.length > 0
      ? lines.map((l) => l.replace(/^\d+\/\s*/, "").trim())
      : this.toXThread(content, title, url).tweets;

    return { tweets, hashtags: this.extractHashtags(content) };
  }

  private async toLinkedInCarouselAI(content: string, title: string): Promise<LinkedInCarousel> {
    const prompt = `Convert this blog post into a LinkedIn carousel structure. Output JSON:
{
  "hook": "Opening hook line",
  "slides": [{ "heading": "...", "body": "..." }],
  "cta": "Closing call-to-action"
}
Max 8 slides. Keep each slide body under 200 chars.

TITLE: ${title}
CONTENT: ${content.slice(0, 2000)}`;

    const raw = await geminiService.generateContent(prompt, { json: true });
    const parsed = geminiService.parseJsonResponse<LinkedInCarousel>(raw);

    return parsed.slides?.length
      ? parsed
      : this.toLinkedInCarousel(content, title);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private extractSections(content: string): Array<{ heading: string; body: string }> {
    const headingRe = /^#{1,3}\s+(.+)$/gm;
    const sections: Array<{ heading: string; body: string }> = [];
    let lastMatch: RegExpExecArray | null;
    const matches: Array<{ index: number; heading: string }> = [];

    while ((lastMatch = headingRe.exec(content)) !== null) {
      matches.push({ index: lastMatch.index, heading: lastMatch[1].replace(/[*_`]/g, "").trim() });
    }

    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = matches[i + 1]?.index ?? content.length;
      const block = content.slice(start, end).replace(/^#{1,3}.+\n/, "").trim();
      const body = block.replace(/[*_`#>[\]-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 250);
      if (body.length > 20) {
        sections.push({ heading: matches[i].heading, body });
      }
    }

    return sections;
  }

  private truncateToTweetLength(text: string): string {
    const clean = text.replace(/[*_`#>[\]-]/g, " ").replace(/\s+/g, " ").trim();
    if (clean.length <= 280) return clean;
    const lastSpace = clean.slice(0, 277).lastIndexOf(" ");
    return clean.slice(0, lastSpace > 100 ? lastSpace : 277) + "...";
  }

  private extractHashtags(content: string): string[] {
    // Build hashtags from most frequent meaningful words
    const stopwords = new Set(["the", "and", "for", "are", "that", "this", "with", "you", "your"]);
    const freq: Record<string, number> = {};
    content
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 4 && !stopwords.has(w))
      .forEach((w) => { freq[w] = (freq[w] || 0) + 1; });

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([w]) => `#${w.charAt(0).toUpperCase()}${w.slice(1)}`);
  }
}

export const formatterService = new FormatterService();
