export interface ContentScore {
  total: number;
  readability: number;
  seo: number;
  engagement: number;
  details: {
    readabilityFeedback: string;
    seoFeedback: string;
    engagementFeedback: string;
  };
}

class ScoringService {
  /**
   * Score content based on readability, SEO, and engagement.
   * Pure heuristics — zero LLM calls, runs in < 5ms.
   */
  async scoreContent(
    content: string,
    type: "blog" | "ad" | "product",
    keywords: string[] = []
  ): Promise<ContentScore> {
    const readability = this.calculateReadability(content, type);
    const seo = this.calculateSEO(content, keywords, type);
    const engagement = this.calculateEngagement(content, type);

    const total = Math.round((readability + seo + engagement) / 3);

    return {
      total,
      readability,
      seo,
      engagement,
      details: {
        readabilityFeedback: this.getReadabilityFeedback(readability, content, type),
        seoFeedback: this.getSEOFeedback(seo, keywords, type),
        engagementFeedback: this.getEngagementFeedback(engagement, content),
      },
    };
  }

  // ─── Readability ─────────────────────────────────────────────────────────────

  private calculateReadability(content: string, type: string): number {
    if (type === "ad") return this.scoreAdReadability(content);

    const sentences = this.getSentences(content);
    const words = this.getWords(content);
    const syllables = words.reduce((acc, w) => acc + this.countSyllables(w), 0);

    if (sentences.length === 0 || words.length === 0) return 50;

    // Flesch-Kincaid Reading Ease (0–100, higher = easier)
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    const fleschScore =
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    // Map Flesch (0–100) to our 0–100 score
    // Ideal target is 60–70 (plain English, widely accessible)
    let score: number;
    if (fleschScore >= 60 && fleschScore <= 80) {
      score = 95; // Ideal range
    } else if (fleschScore >= 50 && fleschScore < 60) {
      score = 82; // Slightly complex but fine
    } else if (fleschScore >= 70 && fleschScore <= 90) {
      score = 88; // Simple — good for broad audiences
    } else if (fleschScore >= 30 && fleschScore < 50) {
      score = 65; // College-level, borderline
    } else if (fleschScore > 90) {
      score = 75; // Very simple, may lack depth for blog
    } else {
      score = 40; // Very hard (< 30) — too complex
    }

    // Bonus: proper heading structure improves scanability
    const headings = (content.match(/^#{1,4}\s+/gm) || []).length;
    if (headings >= 3) score = Math.min(100, score + 5);
    if (headings === 0 && type === "blog") score = Math.max(0, score - 5);

    // Bonus: paragraphs of reasonable length
    const paragraphs = content.split(/\n{2,}/).filter((p) => p.trim().length > 20);
    const longParagraphs = paragraphs.filter((p) => p.split(/\s+/).length > 100).length;
    if (longParagraphs > paragraphs.length * 0.4) score = Math.max(0, score - 8);

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  private scoreAdReadability(content: string): number {
    const words = this.getWords(content);
    const wc = words.length;

    // Ads need to be punchy: 20–80 words
    if (wc >= 20 && wc <= 60) return 95;
    if (wc >= 10 && wc < 20) return 80;
    if (wc > 60 && wc <= 100) return 75;
    if (wc > 100) return 60;
    return 55;
  }

  // ─── SEO ─────────────────────────────────────────────────────────────────────

  private calculateSEO(content: string, keywords: string[], type: string): number {
    // SEO largely irrelevant for ads
    if (type === "ad") return 92;

    const contentLower = content.toLowerCase();
    const words = this.getWords(content);
    const headings = content.match(/^#{1,4}\s+.+/gm) || [];
    const headingText = headings.join(" ").toLowerCase();

    let score = 50;

    // 1. Keyword presence in body (up to +35 pts)
    if (keywords.length > 0) {
      const matches = keywords.filter((kw) =>
        contentLower.includes(kw.toLowerCase())
      );
      const ratio = matches.length / keywords.length;
      score += Math.round(ratio * 35);
    } else {
      score += 20; // No keywords specified — neutral
    }

    // 2. Keyword in headings (+10 pts)
    if (keywords.length > 0) {
      const kwInHeading = keywords.some((kw) =>
        headingText.includes(kw.toLowerCase())
      );
      if (kwInHeading) score += 10;
    }

    // 3. Content length for SEO (+10 pts at 800+ words)
    if (words.length >= 1500) score += 10;
    else if (words.length >= 800) score += 7;
    else if (words.length >= 400) score += 3;

    // 4. Heading structure H2/H3 variety (+5 pts)
    const hasH2 = /^## /m.test(content);
    const hasH3 = /^### /m.test(content);
    if (hasH2 && hasH3) score += 5;
    else if (hasH2) score += 3;

    // 5. First paragraph has keyword (+5 pts)
    if (keywords.length > 0) {
      const firstPara = content.split(/\n{2,}/)[0]?.toLowerCase() || "";
      const kwInIntro = keywords.some((kw) =>
        firstPara.includes(kw.toLowerCase())
      );
      if (kwInIntro) score += 5;
    }

    // 6. Keyword density check — penalize stuffing (> 5% density)
    if (keywords.length > 0) {
      const allKwCount = keywords.reduce((acc, kw) => {
        const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        return acc + (contentLower.match(re) || []).length;
      }, 0);
      const density = words.length > 0 ? allKwCount / words.length : 0;
      if (density > 0.05) score = Math.max(0, score - 10); // Stuffing penalty
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  // ─── Engagement ───────────────────────────────────────────────────────────────

  private calculateEngagement(content: string, type: string): number {
    let score = 45;

    // 1. CTA presence (+20 pts)
    const ctaRegex =
      /\b(click|get started|try|start|join|buy|shop|order|sign up|subscribe|download|learn more|discover|find out|read more|book|contact|schedule|claim)\b/i;
    if (ctaRegex.test(content)) score += 20;

    // 2. Questions engage readers (+8 pts)
    const questionCount = (content.match(/\?/g) || []).length;
    if (questionCount >= 2) score += 8;
    else if (questionCount === 1) score += 4;

    // 3. Lists and bullet points indicate scannable structure (+8 pts)
    const bulletCount = (content.match(/^[-*•]\s/gm) || []).length;
    const numberedCount = (content.match(/^\d+\.\s/gm) || []).length;
    if (bulletCount + numberedCount >= 3) score += 8;
    else if (bulletCount + numberedCount >= 1) score += 4;

    // 4. Bold/italic emphasis used (+5 pts)
    const hasEmphasis = /\*\*.+\*\*|_.+_|\*.+\*/s.test(content);
    if (hasEmphasis) score += 5;

    // 5. Word variety — unique word ratio (+10 pts)
    const words = this.getWords(content);
    if (words.length > 50) {
      const uniqueRatio = new Set(words.map((w) => w.toLowerCase())).size / words.length;
      if (uniqueRatio > 0.6) score += 10;
      else if (uniqueRatio > 0.45) score += 5;
    }

    // 6. Opening hook — does the first sentence start with a strong hook? (+4 pts)
    const firstSentence = content.split(/[.!?]/)[0]?.toLowerCase() || "";
    const hookWords = /\byou\b|imagine|what if|did you know|most|every|how to|why/i;
    if (hookWords.test(firstSentence)) score += 4;

    // Ad-copy gets a small baseline boost (shorter = punchier expectation)
    if (type === "ad") score = Math.min(100, score + 5);

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  // ─── Feedback Messages ────────────────────────────────────────────────────────

  private getReadabilityFeedback(score: number, content: string, type: string): string {
    const headings = (content.match(/^#{1,4}\s+/gm) || []).length;

    if (score >= 90) return "Excellent readability — clear, well-structured, and easy to scan.";
    if (score >= 80) {
      if (headings < 2 && type === "blog") return "Good readability. Add more headings to improve scannability.";
      return "Good readability with solid structure.";
    }
    if (score >= 65) return "Moderate readability. Try shorter sentences and more paragraph breaks.";
    if (type === "ad") return "Ad copy may be too long. Aim for 20–60 words for maximum impact.";
    return "Content is dense. Simplify sentence structure and break up long paragraphs.";
  }

  private getSEOFeedback(score: number, keywords: string[], type: string): string {
    if (type === "ad") return "Optimized for platform ad requirements.";
    if (keywords.length === 0) {
      return score >= 70
        ? "Good structure for SEO. Add target keywords to boost ranking potential."
        : "No keywords provided. Add target keywords for SEO optimization.";
    }
    if (score >= 90) return `All keywords well-integrated with ideal density and heading placement.`;
    if (score >= 75) return `Most keywords present. Try including them in an H2 heading for stronger SEO signals.`;
    if (score >= 55) return `Some keywords missing. Naturally weave in: ${keywords.slice(0, 2).join(", ")}.`;
    return `Low keyword coverage. Include your target keywords: ${keywords.join(", ")}.`;
  }

  private getEngagementFeedback(score: number, content: string): string {
    const hasCTA = /\b(click|get started|try|start|join|buy|shop|order|sign up|subscribe|download|learn more)\b/i.test(content);
    const hasBullets = /^[-*•]\s/m.test(content);

    if (score >= 85) return "High engagement potential — strong CTA, good structure, and varied content.";
    if (score >= 70) {
      if (!hasCTA) return "Good content. Add a clear call-to-action to drive reader action.";
      if (!hasBullets) return "Good engagement. Add bullet points or lists to improve scannability.";
      return "Strong engagement signals with good structure.";
    }
    if (!hasCTA) return "Missing a call-to-action. End with a clear next step for your reader.";
    return "Add questions, bullet points, and bold key phrases to increase engagement.";
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private getWords(content: string): string[] {
    return content
      .replace(/[#*_`\[\]()>]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1);
  }

  private getSentences(content: string): string[] {
    return content
      .replace(/[#*_`\[\]]/g, "")
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
  }

  /**
   * Simple syllable counter — counts vowel clusters as syllables.
   */
  private countSyllables(word: string): number {
    const w = word.toLowerCase().replace(/[^a-z]/g, "");
    if (w.length <= 3) return 1;
    const vowelMatches = w.replace(/e$/, "").match(/[aeiouy]+/g);
    return Math.max(1, (vowelMatches || []).length);
  }
}

export const scoringService = new ScoringService();
