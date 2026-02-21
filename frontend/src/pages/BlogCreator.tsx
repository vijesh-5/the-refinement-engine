import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { generateBlog } from "@/lib/api";
import { toast } from "sonner";
import { 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  BookOpen,
  Target,
  Mic,
  Copy,
  Download,
  RotateCcw,
  Check,
  Wand2,
  AlignLeft,
  Hash,
  Clock
} from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}

function CollapsibleSection({ title, icon, isOpen, onToggle, children, badge }: CollapsibleSectionProps) {
  return (
    <div className="border border-border-subtle rounded-xl overflow-hidden bg-background-surface/50">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-background-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-sm">{title}</span>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-foreground-muted" /> : <ChevronDown className="w-4 h-4 text-foreground-muted" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}>
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function BlogCreator() {
  const [openSection, setOpenSection] = useState<string>("idea");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [angle, setAngle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [wordCount, setWordCount] = useState("1500");
  const [tone, setTone] = useState("Professional");
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: any) => generateBlog(data),
    onSuccess: (result) => {
      if (result.success && result.data) {
        setGeneratedContent(result.data.content);
        toast.success("Blog draft generated successfully!");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate blog draft");
    }
  });

  const handleGenerate = () => {
    if (!topic || !audience) {
      toast.error("Topic and Audience are required");
      return;
    }

    const lengthMap: Record<string, "short" | "medium" | "long"> = {
      "1000": "short",
      "1500": "medium",
      "2000": "medium",
      "3000": "long"
    };

    mutation.mutate({
      topic,
      audience,
      tone,
      keywords: keyword ? [keyword] : [],
      length: lengthMap[wordCount] || "medium",
      intent: angle
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metrics = mutation.data?.data?.score ? [
    { label: "SEO Score", value: mutation.data.data.score.seo, icon: Target },
    { label: "Readability", value: mutation.data.data.score.readability, icon: AlignLeft },
    { label: "Engagement", value: mutation.data.data.score.engagement, icon: Sparkles },
  ] : [
    { label: "SEO Score", value: 0, icon: Target },
    { label: "Readability", value: 0, icon: AlignLeft },
    { label: "Engagement", value: 0, icon: Sparkles },
  ];

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-0px)]">
        {/* Left Panel - Editorial Studio Controls */}
        <div className="w-80 border-r border-border-subtle bg-gradient-to-b from-background-elevated to-background flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border-subtle">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Blog Creator</h2>
                <p className="text-xs text-foreground-muted">Editorial Studio</p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
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
                    Who is your audience?
                  </label>
                  <Input 
                    placeholder="e.g., SaaS Founders, Marketers" 
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground-muted block mb-2">
                    What's your unique angle? (Optional)
                  </label>
                  <textarea 
                    className="w-full h-20 px-3 py-2 text-sm bg-input border border-border-subtle rounded-lg resize-none focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="e.g., A data-driven guide..."
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
              badge={keyword ? "Configured" : undefined}
            >
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground-muted block mb-2">
                    Target keyword
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
                    <Input 
                      placeholder="landing page optimization" 
                      className="pl-9"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground-muted block mb-2">
                    Target length
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["1000", "1500", "2000", "3000"].map((count) => (
                      <button 
                        key={count}
                        onClick={() => setWordCount(count)}
                        className={`py-2 text-xs rounded-lg border transition-colors ${
                          wordCount === count
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border-subtle hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Voice & Style"
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
                    {["Professional", "Conversational", "Bold", "Empathetic"].map((t) => (
                      <button 
                        key={t}
                        onClick={() => setTone(t)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                          tone === t
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border-subtle hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          </div>

          {/* Generate Button */}
          <div className="p-4 border-t border-border-subtle">
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleGenerate}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Writing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Draft
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Panel - Document Editor */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border-subtle bg-background-elevated/50">
            <div className="flex items-center gap-6">
              {generatedContent && (
                <>
                  <div className="flex items-center gap-2 text-sm text-foreground-muted">
                    <Clock className="w-4 h-4" />
                    <span>~5 min read</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground-muted">
                    <AlignLeft className="w-4 h-4" />
                    <span>1,247 words</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" disabled={!generatedContent} onClick={() => setGeneratedContent("")}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled={!generatedContent} onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" disabled={!generatedContent}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {generatedContent ? (
              <div className="max-w-3xl mx-auto p-8 md:p-12">
                <div className="prose prose-invert prose-headings:text-foreground prose-p:text-foreground-muted prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:text-foreground-muted max-w-none">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {generatedContent}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-primary/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Ready to write</h3>
                  <p className="text-foreground-muted mb-6">
                    Share your topic and angle, then let AI craft a structured first draft 
                    that captures your voice and resonates with your audience.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["SEO-optimized", "Long-form ready", "Your voice"].map((tag, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-full bg-background-surface border border-border-subtle text-foreground-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quality Indicators */}
          {generatedContent && (
            <div className="border-t border-border-subtle bg-background-elevated/50 px-6 py-4">
              <div className="max-w-3xl mx-auto flex items-center gap-8">
                {metrics.map((metric, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <metric.icon className="w-4 h-4 text-foreground-subtle" />
                    <span className="text-xs text-foreground-muted">{metric.label}</span>
                    <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-primary to-purple-400 transition-all duration-500"
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-success">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
