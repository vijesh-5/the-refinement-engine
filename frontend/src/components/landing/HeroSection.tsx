import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Check, Zap } from "lucide-react";

// Animated typing effect for the editor preview
const typingLines = [
  { delay: 0, text: "# 10 Ways to Improve Landing Page Conversions", type: "heading" },
  { delay: 800, text: "", type: "empty" },
  { delay: 1000, text: "Your landing page has seconds to capture attention. Make them count.", type: "paragraph" },
  { delay: 2000, text: "", type: "empty" },
  { delay: 2200, text: "## 1. Lead with Clarity, Not Cleverness", type: "subheading" },
  { delay: 3000, text: "The best headlines tell visitors exactly what they'll get—and why it matters.", type: "paragraph" },
];

export function HeroSection() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    typingLines.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(index + 1);
        setCursorPosition(index);
      }, line.delay);
      timers.push(timer);
    });

    // Loop the animation
    const resetTimer = setTimeout(() => {
      setVisibleLines(0);
      setCursorPosition(0);
    }, 6000);
    timers.push(resetTimer);

    return () => timers.forEach(clearTimeout);
  }, [visibleLines === 0]);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-primary/40 rounded-full animate-pulse animation-delay-200" />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-primary/20 rounded-full animate-pulse animation-delay-400" />
      </div>

      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Copy */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-muted/30 border border-primary/20 mb-8 animate-fade-up">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">AI-powered writing that converts</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 animate-fade-up animation-delay-100">
              Write content that
              <span className="text-gradient block mt-2">actually works</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-foreground-muted max-w-xl mx-auto lg:mx-0 mb-8 animate-fade-up animation-delay-200">
              Artifex helps founders, marketers, and content teams create persuasive copy 
              that builds trust and drives action. Not just faster—better.
            </p>

            {/* Benefits list */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 mb-10 animate-fade-up animation-delay-300">
              {[
                "Blog posts that rank",
                "Ads that convert",
                "Descriptions that sell",
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground-muted">
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  {benefit}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-up animation-delay-300">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Start Writing Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="subtle" size="xl" asChild>
                <Link to="#how-it-works">See How It Works</Link>
              </Button>
            </div>

            {/* Social proof */}
            <p className="text-sm text-foreground-subtle mt-10 animate-fade-up animation-delay-400">
              Trusted by 10,000+ writers at companies like Stripe, Notion, and Linear
            </p>
          </div>

          {/* Right - Interactive Product Preview */}
          <div className="relative animate-fade-up animation-delay-400">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-transparent to-primary/10 rounded-3xl blur-3xl opacity-50" />
            
            <div className="relative rounded-2xl border border-border-subtle bg-background-elevated shadow-2xl overflow-hidden">
              {/* Window chrome */}
              <div className="border-b border-border-subtle px-4 py-3 flex items-center gap-3 bg-background-surface/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-background-surface border border-border-subtle">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-xs text-foreground-muted">Blog Creator — Artifex</span>
                  </div>
                </div>
              </div>

              {/* Editor content */}
              <div className="p-6 md:p-8 min-h-[320px]">
                <div className="space-y-3">
                  {typingLines.slice(0, visibleLines).map((line, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className={`
                        ${line.type === "heading" ? "text-xl md:text-2xl font-semibold text-foreground" : ""}
                        ${line.type === "subheading" ? "text-lg font-semibold text-foreground" : ""}
                        ${line.type === "paragraph" ? "text-foreground-muted" : ""}
                        ${line.type === "empty" ? "h-4" : ""}
                        transition-opacity duration-300
                      `}>
                        {line.text}
                        {cursorPosition === index && (
                          <span className="inline-block w-0.5 h-5 bg-primary animate-pulse ml-0.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quality indicators */}
                {visibleLines >= 4 && (
                  <div className="mt-8 pt-6 border-t border-border-subtle animate-fade-in">
                    <div className="flex items-center gap-6">
                      {[
                        { label: "SEO", value: 92, color: "from-green-500 to-emerald-400" },
                        { label: "Clarity", value: 88, color: "from-primary to-purple-400" },
                        { label: "Engagement", value: 95, color: "from-blue-500 to-cyan-400" },
                      ].map((metric, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-foreground-subtle">{metric.label}</span>
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r ${metric.color} transition-all duration-1000`}
                              style={{ width: `${metric.value}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-success">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Floating action hint */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">AI writing in progress...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
