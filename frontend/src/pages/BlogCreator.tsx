import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { stripMarkdown } from "@/lib/markdown";
import { useMutation, useQuery } from "@tanstack/react-query";
import { generateBlog, improveContent, getContentVersions, getBrands, BlogContent, ContentVersion, BrandProfile } from "@/lib/api";
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
  Clock,
  History as HistoryIcon,
  TrendingUp,
  Zap,
  ShieldCheck,
  Star,
  Briefcase
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

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
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("none");
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [copied, setCopied] = useState(false);

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  const mutation = useMutation({
    mutationFn: (data: {
      topic: string;
      audience: string;
      tone: string;
      keywords?: string[];
      length: "short" | "medium" | "long";
      intent?: string;
      brandId?: string;
    }) => generateBlog(data),
    onSuccess: (result) => {
      if (result.success && result.data) {
        setGeneratedContent(result.data.content);
        if (result.data.id) {
          fetchVersions(result.data.id);
          setCurrentContentId(result.data.id);
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate blog draft");
    }
  });

  const improveMutation = useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: string }) => improveContent(id, mode),
    onSuccess: (result) => {
      if (result.success && result.data) {
        setGeneratedContent(result.data.body);
        toast.success(`Content improved! (Version ${result.data.versionNumber})`);
        fetchVersions(currentContentId!);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to improve content");
    }
  });

  const fetchVersions = async (id: string) => {
    try {
      const result = await getContentVersions(id);
      if (result.success) {
        setVersions(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch versions", error);
    }
  };

  const handleImprove = (mode: string) => {
    if (!currentContentId) {
      toast.error("Generate a draft first before improving");
      return;
    }
    improveMutation.mutate({ id: currentContentId, mode });
  };

  const handleSwitchVersion = (version: ContentVersion) => {
    setGeneratedContent(version.body);
    toast.info(`Switched to Version ${version.versionNumber}`);
  };

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
      intent: angle,
      brandId: selectedBrandId === "none" ? undefined : selectedBrandId
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(stripMarkdown(generatedContent));
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
              title="Brand Identity"
              icon={<Briefcase className="w-4 h-4 text-purple-400" />}
              isOpen={openSection === "brand"}
              onToggle={() => setOpenSection(openSection === "brand" ? "" : "brand")}
              badge={selectedBrandId !== "none" ? "Active" : undefined}
            >
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground-muted block mb-2">
                    Select Brand Memory
                  </label>
                  <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No brand selected" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Generic / No Brand</SelectItem>
                      {brands?.data?.map((brand: BrandProfile) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-foreground-subtle mt-2">
                    Injects voice, audience, and banned words. <Link to="/app/brands" className="text-primary hover:underline">Manage brands</Link>
                  </p>
                </div>
              </div>
            </CollapsibleSection>

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

            {generatedContent && (
              <>
                <CollapsibleSection
                  title="Refinement & Evolution"
                  icon={<Wand2 className="w-4 h-4 text-purple-400" />}
                  isOpen={openSection === "refine"}
                  onToggle={() => setOpenSection(openSection === "refine" ? "" : "refine")}
                >
                  <div className="space-y-3">
                    <p className="text-[10px] text-foreground-muted uppercase tracking-wider font-bold">Improve with Goal</p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: "seo", label: "SEO Optimization", icon: TrendingUp, color: "text-blue-400" },
                        { id: "conversion", label: "Conversion Focused", icon: Zap, color: "text-yellow-400" },
                        { id: "clarity", label: "Maximum Clarity", icon: ShieldCheck, color: "text-green-400" },
                        { id: "luxury", label: "Luxury / Premium", icon: Star, color: "text-purple-400" },
                      ].map((mode) => (
                        <button 
                          key={mode.id}
                          onClick={() => handleImprove(mode.id)}
                          disabled={improveMutation.isPending}
                          className="flex items-center gap-3 w-full p-2.5 text-left text-sm rounded-lg border border-border-subtle bg-background hover:bg-background-hover hover:border-primary/30 transition-all group disabled:opacity-50"
                        >
                          <mode.icon className={`w-4 h-4 ${mode.color}`} />
                          <span className="flex-1 font-medium">{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection
                  title="Version History"
                  icon={<HistoryIcon className="w-4 h-4 text-orange-400" />}
                  isOpen={openSection === "history"}
                  onToggle={() => setOpenSection(openSection === "history" ? "" : "history")}
                  badge={versions.length > 0 ? `${versions.length} versions` : undefined}
                >
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                    {versions.length === 0 ? (
                      <p className="text-xs text-foreground-muted text-center py-4">No other versions yet.</p>
                    ) : (
                      versions.map((v) => (
                        <button 
                          key={v.id}
                          onClick={() => handleSwitchVersion(v)}
                          className={`w-full flex flex-col gap-1 p-3 text-left rounded-lg border transition-all ${
                            generatedContent === v.body
                              ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                              : "border-border-subtle hover:border-primary/30 hover:bg-background-hover"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">Version {v.versionNumber}</span>
                            <span className="text-[10px] text-foreground-muted">
                              {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              v.improvementType === 'original' ? 'bg-background-surface text-foreground-muted' : 'bg-primary/10 text-primary'
                            }`}>
                              {v.improvementType || 'Modified'}
                            </span>
                            {v.scores?.total && (
                              <span className="text-[10px] font-medium text-success">Score: {v.scores.total}</span>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </CollapsibleSection>
              </>
            )}
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
                  <MarkdownRenderer content={generatedContent} />
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
