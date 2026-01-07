import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="container-wide relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-muted/30 border border-primary/20 mb-8 animate-fade-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Write with clarity. Convert with confidence.</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 animate-fade-up animation-delay-100">
            Your AI writing partner for
            <span className="text-gradient block mt-2">quality that converts</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto mb-10 animate-fade-up animation-delay-200">
            Artifex helps founders, marketers, and content teams create persuasive copy 
            that builds trust and drives action. Not just faster—better.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animation-delay-300">
            <Button variant="hero" size="xl" asChild>
              <Link to="/app">
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

        {/* Product Preview */}
        <div className="mt-16 md:mt-24 relative animate-fade-up animation-delay-400">
          <div className="absolute -inset-4 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="relative rounded-xl border border-border-subtle bg-background-elevated shadow-lg overflow-hidden">
            {/* Mock editor UI */}
            <div className="border-b border-border-subtle p-4 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm text-foreground-muted">Blog Creator — Artifex</span>
              </div>
            </div>
            <div className="p-6 md:p-10">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left panel - inputs */}
                <div className="space-y-4">
                  <div className="h-4 bg-foreground-subtle/20 rounded w-24" />
                  <div className="space-y-2">
                    <div className="h-10 bg-background-surface rounded border border-border-subtle" />
                    <div className="h-24 bg-background-surface rounded border border-border-subtle" />
                  </div>
                  <div className="h-4 bg-foreground-subtle/20 rounded w-20 mt-6" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-primary-muted/40 rounded-full px-4 flex-1" />
                    <div className="h-8 bg-background-surface rounded-full px-4 flex-1 border border-border-subtle" />
                  </div>
                </div>
                {/* Center - editor */}
                <div className="md:col-span-2 space-y-4">
                  <div className="h-6 bg-foreground/80 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-foreground-muted/30 rounded w-full" />
                    <div className="h-4 bg-foreground-muted/30 rounded w-5/6" />
                    <div className="h-4 bg-foreground-muted/30 rounded w-4/5" />
                  </div>
                  <div className="h-4 bg-foreground-muted/30 rounded w-2/3 mt-6" />
                  <div className="space-y-2">
                    <div className="h-4 bg-foreground-muted/20 rounded w-full" />
                    <div className="h-4 bg-foreground-muted/20 rounded w-11/12" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
