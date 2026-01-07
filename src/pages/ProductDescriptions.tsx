import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles,
  Package,
  Plus,
  X,
  Copy,
  Check,
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Star,
  Zap,
  Target,
  Award
} from "lucide-react";

interface Feature {
  id: string;
  feature: string;
  benefit: string;
}

export default function ProductDescriptions() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [features, setFeatures] = useState<Feature[]>([
    { id: "1", feature: "", benefit: "" },
  ]);
  const [tone, setTone] = useState("Premium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    headline: string;
    bullets: string[];
    shortDesc: string;
    longDesc: string;
    conversionScore: number;
  } | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const addFeature = () => {
    setFeatures([...features, { id: Date.now().toString(), feature: "", benefit: "" }]);
  };

  const removeFeature = (id: string) => {
    if (features.length > 1) {
      setFeatures(features.filter(f => f.id !== id));
    }
  };

  const updateFeature = (id: string, field: "feature" | "benefit", value: string) => {
    setFeatures(features.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedContent({
        headline: "Premium Leather Messenger Bag — Crafted for the Modern Professional",
        bullets: [
          "Full-grain Italian leather that develops a rich patina over time",
          "Padded 15\" laptop compartment with secure magnetic closure",
          "Adjustable strap for comfortable crossbody or shoulder wear",
          "Organized interior with 6 pockets for all your essentials",
          "Handcrafted by artisans with 30+ years of experience",
        ],
        shortDesc: "Elevate your everyday carry with our handcrafted leather messenger bag. Made from premium full-grain Italian leather, it's designed for professionals who value quality, durability, and timeless style.",
        longDesc: "The Executive Messenger is more than a bag—it's a statement. Crafted from the finest full-grain Italian leather, each piece is meticulously handmade by skilled artisans who have perfected their craft over three decades.\n\nThe design balances form and function perfectly. A dedicated padded compartment protects your laptop up to 15\", while six interior pockets keep your essentials organized. The adjustable strap allows for comfortable crossbody or shoulder carry throughout your day.\n\nWhat sets this bag apart is the leather itself. Full-grain leather isn't just more durable—it tells a story. Over time, it develops a unique patina that reflects your journey, making each bag truly one-of-a-kind.\n\nWhether you're heading to the office, catching a flight, or meeting clients, the Executive Messenger ensures you arrive with confidence.",
        conversionScore: 94,
      });
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = (section: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const conversionMetrics = [
    { label: "Persuasion", value: 94, icon: TrendingUp },
    { label: "Clarity", value: 91, icon: Target },
    { label: "Desire", value: 88, icon: Star },
    { label: "Urgency", value: 82, icon: Zap },
  ];

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-0px)]">
        {/* Left Panel - Conversion Engine Controls */}
        <div className="w-96 border-r border-border-subtle bg-gradient-to-b from-background-elevated to-background flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border-subtle">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Product Descriptions</h2>
                <p className="text-xs text-foreground-muted">Conversion Engine</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
            {/* Product Name */}
            <div>
              <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide block mb-2">
                Product Name
              </label>
              <Input 
                placeholder="e.g., Executive Leather Messenger Bag"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide block mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {["Fashion", "Tech", "Home", "Beauty", "Food", "Sports"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      category === cat
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-border-subtle hover:border-green-500/50 hover:bg-green-500/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature → Benefit Blocks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">
                  Features → Benefits
                </label>
                <button
                  onClick={addFeature}
                  className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={feature.id} className="p-3 rounded-xl bg-background-surface border border-border-subtle">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-foreground-subtle">Feature {index + 1}</span>
                      {features.length > 1 && (
                        <button
                          onClick={() => removeFeature(feature.id)}
                          className="text-foreground-subtle hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder="Feature (e.g., Full-grain leather)"
                      className="mb-2"
                      value={feature.feature}
                      onChange={(e) => updateFeature(feature.id, "feature", e.target.value)}
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRight className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-xs text-green-400">transforms to</span>
                    </div>
                    <Input
                      placeholder="Benefit (e.g., Lasts a lifetime)"
                      value={feature.benefit}
                      onChange={(e) => updateFeature(feature.id, "benefit", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide block mb-2">
                Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {["Premium", "Casual", "Playful", "Technical", "Luxe"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      tone === t
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-border-subtle hover:border-green-500/50 hover:bg-green-500/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="p-4 border-t border-border-subtle">
            <Button 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400" 
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Description
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Panel - Structured Output */}
        <div className="flex-1 bg-background overflow-y-auto">
          {generatedContent ? (
            <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
              {/* Conversion Confidence Banner */}
              <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                        <Award className="w-7 h-7 text-green-400" />
                      </div>
                      <div>
                        <div className="text-sm text-foreground-muted mb-1">Conversion Confidence</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-green-400">{generatedContent.conversionScore}</span>
                          <span className="text-green-400/60">/100</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                      {conversionMetrics.map((metric, i) => (
                        <div key={i} className="text-center">
                          <metric.icon className="w-4 h-4 text-foreground-subtle mx-auto mb-1" />
                          <div className="text-lg font-semibold text-foreground">{metric.value}</div>
                          <div className="text-xs text-foreground-subtle">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Headline */}
              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Star className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-sm font-semibold">Headline</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCopy("headline", generatedContent.headline)}
                    >
                      {copiedSection === "headline" ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <h2 className="text-2xl font-semibold leading-tight">{generatedContent.headline}</h2>
                </CardContent>
              </Card>

              {/* Bullet Benefits */}
              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-sm font-semibold">Bullet Benefits</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCopy("bullets", generatedContent.bullets.map(b => `• ${b}`).join("\n"))}
                    >
                      {copiedSection === "bullets" ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <ul className="space-y-3">
                    {generatedContent.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-success" />
                        </div>
                        <span className="text-foreground-muted leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Short Description */}
              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-sm font-semibold">Short Description</span>
                      <span className="text-xs text-foreground-subtle">{generatedContent.shortDesc.length} chars</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCopy("short", generatedContent.shortDesc)}
                    >
                      {copiedSection === "short" ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-foreground-muted leading-relaxed">{generatedContent.shortDesc}</p>
                </CardContent>
              </Card>

              {/* Long Description */}
              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-sm font-semibold">Long Description</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCopy("long", generatedContent.longDesc)}
                    >
                      {copiedSection === "long" ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-foreground-muted whitespace-pre-wrap leading-relaxed">{generatedContent.longDesc}</div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Conversion Engine</h3>
                <p className="text-foreground-muted mb-6">
                  Transform features into benefits that sell. Get structured descriptions 
                  optimized for e-commerce with real-time conversion scoring.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Feature → Benefit", "SEO-ready", "Conversion-focused"].map((tag, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full bg-background-surface border border-border-subtle text-foreground-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
