import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles,
  Target,
  Zap,
  Copy,
  Check,
  RefreshCw,
  Facebook,
  Instagram,
  Linkedin
} from "lucide-react";

const platforms = [
  { id: "facebook", name: "Facebook", icon: Facebook, maxLength: 125 },
  { id: "instagram", name: "Instagram", icon: Instagram, maxLength: 150 },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, maxLength: 300 },
];

const sampleVariations = [
  {
    hook: "Stop wasting hours on copy that doesn't convert.",
    body: "Artifex uses AI to transform your ideas into high-performing ads in seconds. Join 10,000+ marketers already seeing 2x better results.",
    cta: "Try Free for 7 Days",
    score: 92,
  },
  {
    hook: "Your competitors are using AI. Are you?",
    body: "Write ad copy that actually sells. Artifex analyzes top-performing ads and generates variations proven to convert.",
    cta: "Start Writing Smarter",
    score: 88,
  },
  {
    hook: "We analyzed 1M+ ads. Here's what works.",
    body: "Artifex brings the science of conversion to your fingertips. Generate, test, and optimize ad copy in one click.",
    cta: "See How It Works",
    score: 85,
  },
];

export default function AdCopywriter() {
  const [selectedPlatform, setSelectedPlatform] = useState("facebook");
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<typeof sampleVariations>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setVariations(sampleVariations);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <AppLayout>
      <div className="flex h-screen">
        {/* Left Panel - Inputs */}
        <div className="w-80 border-r border-border-subtle bg-background-elevated p-6 overflow-y-auto scrollbar-thin">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-1">Ad Copywriter</h2>
            <p className="text-sm text-foreground-muted">Generate high-converting variations</p>
          </div>

          {/* Platform Selection */}
          <div className="mb-6">
            <label className="text-xs font-medium text-foreground-muted block mb-3">
              Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                    selectedPlatform === platform.id
                      ? "border-primary bg-primary/10"
                      : "border-border-subtle hover:border-border hover:bg-background-hover"
                  }`}
                >
                  <platform.icon className={`w-4 h-4 ${
                    selectedPlatform === platform.id ? "text-primary" : "text-foreground-muted"
                  }`} />
                  <span className={`text-xs ${
                    selectedPlatform === platform.id ? "text-primary font-medium" : "text-foreground-muted"
                  }`}>
                    {platform.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-2">
                What are you promoting?
              </label>
              <Input 
                placeholder="e.g., AI writing assistant"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-2">
                Target audience
              </label>
              <Input 
                placeholder="e.g., SaaS marketers"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-2">
                Key benefit
              </label>
              <Input placeholder="e.g., Save 10+ hours per week" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-2">
                Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {["Direct", "Playful", "Urgent", "Professional"].map((tone) => (
                  <button
                    key={tone}
                    className="px-3 py-1.5 text-xs rounded-full border border-border-subtle hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button 
            className="w-full mt-6" 
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Variations
              </>
            )}
          </Button>
        </div>

        {/* Right Panel - Variations */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          {variations.length > 0 ? (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold mb-1">Generated Variations</h3>
                  <p className="text-sm text-foreground-muted">
                    {variations.length} variations for {platforms.find(p => p.id === selectedPlatform)?.name}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleGenerate}>
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
              </div>

              <div className="space-y-4">
                {variations.map((variation, index) => (
                  <Card key={index} variant="interactive" className="group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                            Variation {index + 1}
                          </span>
                          <span className="text-xs font-medium px-2 py-1 rounded bg-success/10 text-success">
                            Score: {variation.score}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleCopy(index, `${variation.hook}\n\n${variation.body}\n\n${variation.cta}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {/* Hook */}
                      <div className="mb-3">
                        <span className="text-xs text-foreground-subtle uppercase tracking-wide">Hook</span>
                        <p className="font-semibold mt-1">{variation.hook}</p>
                      </div>

                      {/* Body */}
                      <div className="mb-3">
                        <span className="text-xs text-foreground-subtle uppercase tracking-wide">Body</span>
                        <p className="text-foreground-muted mt-1">{variation.body}</p>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-2 mt-4">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">{variation.cta}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-background-surface border border-border-subtle flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Generate ad variations</h3>
                <p className="text-sm text-foreground-muted max-w-sm">
                  Fill in your product details, select a platform, and generate multiple high-converting variations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
