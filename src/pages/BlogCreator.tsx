import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  BookOpen,
  Target,
  Mic,
  Copy,
  Download,
  RotateCcw
} from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, icon, isOpen, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-background-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-foreground-muted" /> : <ChevronDown className="w-4 h-4 text-foreground-muted" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export default function BlogCreator() {
  const [openSection, setOpenSection] = useState<string>("idea");
  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setGeneratedContent(`# ${topic || "10 Ways to Improve Your Landing Page Conversions"}

A landing page is often your first impression—and your best chance to convert visitors into customers. But most landing pages fail to deliver because they focus on features rather than outcomes.

## Why Most Landing Pages Underperform

The average landing page conversion rate is just 2.35%. That means for every 100 visitors, only 2-3 take action. The top 25% of landing pages convert at 5.31% or higher.

What separates high-converting pages from the rest? It comes down to three core principles:

### 1. Clarity Over Cleverness

Your headline has less than 5 seconds to capture attention. Don't be clever—be clear. Tell visitors exactly what they'll get and why it matters.

**Before:** "Revolutionize your workflow with AI-powered solutions"
**After:** "Write landing page copy 10x faster with AI"

### 2. Social Proof That Converts

Generic testimonials don't move the needle. Specific, outcome-focused testimonials do...`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="flex h-screen">
        {/* Left Panel - Inputs */}
        <div className="w-80 border-r border-border-subtle bg-background-elevated p-6 overflow-y-auto scrollbar-thin">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-1">Blog Creator</h2>
            <p className="text-sm text-foreground-muted">Write content that ranks and converts</p>
          </div>

          <div className="space-y-4">
            <CollapsibleSection
              title="Idea & Angle"
              icon={<Sparkles className="w-4 h-4 text-primary" />}
              isOpen={openSection === "idea"}
              onToggle={() => setOpenSection(openSection === "idea" ? "" : "idea")}
            >
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground-muted block mb-2">
                    What's your topic?
                  </label>
                  <Input 
                    placeholder="e.g., Landing page conversions" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground-muted block mb-2">
                    What's your angle?
                  </label>
                  <textarea 
                    className="w-full h-24 px-3 py-2 text-sm bg-input border border-border-subtle rounded-lg resize-none focus:outline-none focus:border-primary/50"
                    placeholder="e.g., A data-driven guide for SaaS founders..."
                    value={angle}
                    onChange={(e) => setAngle(e.target.value)}
                  />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="SEO & Structure"
              icon={<Target className="w-4 h-4 text-blue-400" />}
              isOpen={openSection === "seo"}
              onToggle={() => setOpenSection(openSection === "seo" ? "" : "seo")}
            >
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground-muted block mb-2">
                    Target keyword
                  </label>
                  <Input placeholder="e.g., landing page optimization" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground-muted block mb-2">
                    Word count target
                  </label>
                  <div className="flex gap-2">
                    {["1000", "1500", "2000", "3000"].map((count) => (
                      <button 
                        key={count}
                        className="flex-1 py-2 text-xs rounded-lg border border-border-subtle hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Voice & Depth"
              icon={<Mic className="w-4 h-4 text-green-400" />}
              isOpen={openSection === "voice"}
              onToggle={() => setOpenSection(openSection === "voice" ? "" : "voice")}
            >
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground-muted block mb-2">
                    Tone
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Professional", "Conversational", "Bold", "Empathetic"].map((tone) => (
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
            </CollapsibleSection>
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
                <Sparkles className="w-4 h-4" />
                Generate Draft
              </>
            )}
          </Button>
        </div>

        {/* Right Panel - Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border-subtle">
            <div className="flex items-center gap-4">
              <BookOpen className="w-4 h-4 text-foreground-muted" />
              <span className="text-sm text-foreground-muted">
                {generatedContent ? "1,247 words" : "No content yet"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" disabled={!generatedContent}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled={!generatedContent}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={!generatedContent}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            {generatedContent ? (
              <div className="max-w-3xl mx-auto prose prose-invert prose-headings:text-foreground prose-p:text-foreground-muted prose-strong:text-foreground">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {generatedContent}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-background-surface border border-border-subtle flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Ready to write</h3>
                  <p className="text-sm text-foreground-muted max-w-sm">
                    Fill in your topic and angle, then click Generate Draft to create your first version.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quality Indicators */}
          {generatedContent && (
            <div className="border-t border-border-subtle px-6 py-4">
              <div className="max-w-3xl mx-auto flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground-muted">SEO</span>
                  <div className="w-20 metric-bar">
                    <div className="metric-fill" style={{ width: '78%' }} />
                  </div>
                  <span className="text-xs font-medium">78</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground-muted">Readability</span>
                  <div className="w-20 metric-bar">
                    <div className="metric-fill" style={{ width: '92%' }} />
                  </div>
                  <span className="text-xs font-medium">92</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground-muted">Engagement</span>
                  <div className="w-20 metric-bar">
                    <div className="metric-fill" style={{ width: '85%' }} />
                  </div>
                  <span className="text-xs font-medium">85</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
