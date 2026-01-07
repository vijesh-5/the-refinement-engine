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
  ShoppingBag
} from "lucide-react";

interface Feature {
  id: string;
  text: string;
}

export default function ProductDescriptions() {
  const [productName, setProductName] = useState("");
  const [features, setFeatures] = useState<Feature[]>([
    { id: "1", text: "" },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    headline: string;
    bullets: string[];
    shortDesc: string;
    longDesc: string;
  } | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const addFeature = () => {
    setFeatures([...features, { id: Date.now().toString(), text: "" }]);
  };

  const removeFeature = (id: string) => {
    if (features.length > 1) {
      setFeatures(features.filter(f => f.id !== id));
    }
  };

  const updateFeature = (id: string, text: string) => {
    setFeatures(features.map(f => f.id === id ? { ...f, text } : f));
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
      });
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = (section: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <AppLayout>
      <div className="flex h-screen">
        {/* Left Panel - Inputs */}
        <div className="w-96 border-r border-border-subtle bg-background-elevated p-6 overflow-y-auto scrollbar-thin">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-1">Product Descriptions</h2>
            <p className="text-sm text-foreground-muted">Create persuasive copy that sells</p>
          </div>

          {/* Product Name */}
          <div className="mb-6">
            <label className="text-xs font-medium text-foreground-muted block mb-2">
              Product name
            </label>
            <Input 
              placeholder="e.g., Executive Leather Messenger Bag"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="text-xs font-medium text-foreground-muted block mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {["Fashion", "Tech", "Home", "Beauty", "Food"].map((cat) => (
                <button
                  key={cat}
                  className="px-3 py-1.5 text-xs rounded-full border border-border-subtle hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-foreground-muted">
                Key features
              </label>
              <button
                onClick={addFeature}
                className="text-xs text-primary hover:text-primary-hover flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={feature.id} className="flex gap-2">
                  <Input
                    placeholder={`Feature ${index + 1}`}
                    value={feature.text}
                    onChange={(e) => updateFeature(feature.id, e.target.value)}
                  />
                  {features.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeFeature(feature.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div className="mb-6">
            <label className="text-xs font-medium text-foreground-muted block mb-2">
              Target audience
            </label>
            <Input placeholder="e.g., Professionals who value quality" />
          </div>

          {/* Tone */}
          <div className="mb-6">
            <label className="text-xs font-medium text-foreground-muted block mb-2">
              Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {["Premium", "Casual", "Playful", "Technical"].map((tone) => (
                <button
                  key={tone}
                  className="px-3 py-1.5 text-xs rounded-full border border-border-subtle hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <Button 
            className="w-full" 
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
                <Sparkles className="w-4 h-4" />
                Generate Description
              </>
            )}
          </Button>
        </div>

        {/* Right Panel - Output */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          {generatedContent ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Headline */}
              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">Headline</span>
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
                  <h2 className="text-xl font-semibold">{generatedContent.headline}</h2>
                </CardContent>
              </Card>

              {/* Bullet Benefits */}
              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">Bullet Benefits</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCopy("bullets", generatedContent.bullets.join("\n"))}
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
                        <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-success" />
                        </div>
                        <span className="text-foreground-muted">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Short Description */}
              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">Short Description</span>
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
                  <p className="text-foreground-muted">{generatedContent.shortDesc}</p>
                </CardContent>
              </Card>

              {/* Long Description */}
              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">Long Description</span>
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
                  <div className="text-foreground-muted whitespace-pre-wrap">{generatedContent.longDesc}</div>
                </CardContent>
              </Card>

              {/* Conversion Confidence */}
              <Card variant="feature">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Conversion Confidence</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-foreground-muted">Persuasion</span>
                        <span className="text-xs font-medium text-success">94</span>
                      </div>
                      <div className="metric-bar">
                        <div className="metric-fill" style={{ width: "94%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-foreground-muted">Clarity</span>
                        <span className="text-xs font-medium text-success">88</span>
                      </div>
                      <div className="metric-bar">
                        <div className="metric-fill" style={{ width: "88%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-foreground-muted">SEO</span>
                        <span className="text-xs font-medium text-success">82</span>
                      </div>
                      <div className="metric-bar">
                        <div className="metric-fill" style={{ width: "82%" }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-background-surface border border-border-subtle flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Create product descriptions</h3>
                <p className="text-sm text-foreground-muted max-w-sm">
                  Enter your product details and features to generate compelling descriptions that convert browsers into buyers.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
