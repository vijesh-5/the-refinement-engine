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
   * Score content based on readability, SEO, and engagement
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
        readabilityFeedback: this.getReadabilityFeedback(readability, type),
        seoFeedback: this.getSEOFeedback(seo, type),
        engagementFeedback: this.getEngagementFeedback(engagement, type),
      },
    };
  }

  private calculateReadability(content: string, type: string): number {
    const words = content.split(/\s+/).length;
    if (type === "ad") return words > 10 && words < 50 ? 90 : 70;
    if (words < 100) return 60;
    if (words > 1000) return 90;
    return 75;
  }

  private calculateSEO(content: string, keywords: string[], type: string): number {
    if (type === "ad") return 100; // SEO less relevant for short ads
    if (keywords.length === 0) return 100;
    
    const contentLower = content.toLowerCase();
    const matches = keywords.filter(kw => contentLower.includes(kw.toLowerCase()));
    
    return Math.round((matches.length / keywords.length) * 100);
  }

  private calculateEngagement(content: string, type: string): number {
    const hasCTA = /click|get|start|try|now|join|buy|shop|order/i.test(content);
    const score = hasCTA ? 85 : 60;
    return type === "ad" ? score + 10 : score;
  }

  private getReadabilityFeedback(score: number, type: string): string {
    if (score > 80) return "Excellent flow and length.";
    return type === "ad" ? "Ad copy might be too wordy." : "Consider shortening long sentences.";
  }

  private getSEOFeedback(score: number, type: string): string {
    if (type === "ad") return "Platform-optimized length.";
    if (score > 80) return "Keywords are well-integrated.";
    return "Increase keyword presence naturally.";
  }

  private getEngagementFeedback(score: number, type: string): string {
    if (score > 80) return "Strong call-to-action.";
    return "Add a clearer call-to-action to drive results.";
  }
}

export const scoringService = new ScoringService();
