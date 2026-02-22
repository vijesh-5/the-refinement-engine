import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { stripMarkdown } from "@/lib/markdown";
import { useMutation, useQuery } from "@tanstack/react-query";
import { generateAd, improveContent, getContentVersions, getBrands, getContentItem, AdContent, AdVariant, ContentVersion, BrandProfile } from "@/lib/api";
import { SaveContentButton } from "@/components/ui/SaveContentButton";
import { ReasoningPanel, ReasoningData } from "@/components/ui/ReasoningPanel";
import { toast } from "sonner";
import { 
  Zap,
  Target,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  Eye,
  MousePointer,
  Flame,
  Star,
  ShieldCheck,
  Wand2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  ThumbsUp,
  AlertTriangle,
  History as HistoryIcon,
  Maximize2,
  Minimize2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

// Platform icons as simple components
const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const platforms = [
  { id: "facebook", name: "Facebook", icon: FacebookIcon, color: "text-blue-500", maxLength: 125 },
  { id: "instagram", name: "Instagram", icon: InstagramIcon, color: "text-pink-500", maxLength: 150 },
  { id: "linkedin", name: "LinkedIn", icon: LinkedInIcon, color: "text-blue-400", maxLength: 300 },
  { id: "google", name: "Google", icon: GoogleIcon, color: "text-yellow-500", maxLength: 90 },
];

export default function AdCopywriter() {
  const [selectedPlatform, setSelectedPlatform] = useState("facebook");
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [benefit, setBenefit] = useState("");
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [variations, setVariations] = useState<AdVariant[]>([]);
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);
  const [reasoningData, setReasoningData] = useState<ReasoningData | undefined>(undefined);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("none");
  const [openSection, setOpenSection] = useState<string>("platform");
  const [canvasExpanded, setCanvasExpanded] = useState(false);

  const [searchParams] = useSearchParams();
  const loadContentId = searchParams.get("id");

  // Load saved content when ?id= param is present
  useEffect(() => {
    if (!loadContentId) return;
    getContentItem(loadContentId).then((res) => {
      if (res.success && res.data) {
        const item = res.data;
        setCurrentContentId(item.id);
        // Try to parse body as JSON (ad variants)
        try {
          const parsed = JSON.parse(item.body || "[]");
          if (Array.isArray(parsed)) setVariations(parsed);
        } catch {
          // If body is not JSON, build a single variant from the body text
          if (item.body) {
            setVariations([{ headline: item.title, primaryText: item.body, cta: "Learn More", tags: [] }]);
          }
        }
        const input = (item as any).inputData;
        if (input) {
          if (input.product) setProduct(input.product);
          if (input.audience) setAudience(input.audience);
          if (input.benefit) setBenefit(input.benefit);
          if (input.tone) setSelectedTone(input.tone);
          if (input.platform) setSelectedPlatform(input.platform);
          if (input.brandId) setSelectedBrandId(input.brandId);
        }
        fetchVersions(item.id);
      }
    }).catch(() => {
      toast.error("Failed to load saved content");
    });
  }, [loadContentId]);

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  const mutation = useMutation({
    mutationFn: (data: {
      platform: "Facebook" | "Instagram" | "Google" | "LinkedIn";
      product: string;
      targetAudience: string;
      keyBenefit: string;
      tone: "direct" | "playful" | "urgent" | "professional";
      brandId?: string;
    }) => generateAd(data),
    onSuccess: (result) => {
      if (result.success && result.data) {
        setVariations(result.data.variants || []);
        setCurrentContentId(result.data.id || null);
        setReasoningData({
          reasoningSummary: result.data.reasoningSummary,
        });
        toast.success("Ad variations generated successfully!");
        if (result.data.id) {
          fetchVersions(result.data.id);
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate ad variations");
    }
  });

  const improveMutation = useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: string }) => improveContent(id, mode),
    onSuccess: (result) => {
      if (result.success && result.data) {
        try {
          const parsedVariants = JSON.parse(result.data.body);
          setVariations(parsedVariants);
          toast.success(`Ads improved! (Version ${result.data.versionNumber})`);
          fetchVersions(currentContentId!);
        } catch (e) {
          console.error("Failed to parse improved ad variants", e);
          toast.error("Improved content format error");
        }
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
      toast.error("Generate variations first before improving");
      return;
    }
    improveMutation.mutate({ id: currentContentId, mode });
  };

  const handleSwitchVersion = (version: ContentVersion) => {
    try {
      setVariations(JSON.parse(version.body));
      toast.info(`Switched to Version ${version.versionNumber}`);
    } catch (e) {
      toast.error("Failed to load this version");
    }
  };

  const handleGenerate = () => {
    if (!product || !audience || !benefit) {
      toast.error("All fields are required");
      return;
    }

    const platformMap: Record<string, "Facebook" | "Instagram" | "Google" | "LinkedIn"> = {
      facebook: "Facebook",
      instagram: "Instagram",
      google: "Google",
      linkedin: "LinkedIn"
    };

    mutation.mutate({
      platform: platformMap[selectedPlatform] || "Facebook",
      product,
      targetAudience: audience,
      keyBenefit: benefit,
      tone: selectedTone.toLowerCase() as "direct" | "playful" | "urgent" | "professional",
      brandId: selectedBrandId === "none" ? undefined : selectedBrandId
    });
  };

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(stripMarkdown(text));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return Flame;
    if (score >= 80) return ThumbsUp;
    return AlertTriangle;
  };

  return (
    <AppLayout>
      <div className="flex h-full overflow-hidden">
        {/* Left Panel - Performance Lab Controls */}
        <div className={`border-r border-border-subtle bg-gradient-to-b from-background-elevated to-background flex flex-col shrink-0 transition-all duration-300 ease-in-out ${canvasExpanded ? "w-0 overflow-hidden opacity-0 border-r-0" : "w-80 opacity-100"}`}>
          {/* Header */}
          <div className="px-4 py-4 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Ad Copywriter</h2>
                <p className="text-[10px] text-foreground-muted">Performance Lab</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
            {/* Brand Identity */}
            <div className="border border-border-subtle rounded-xl overflow-hidden bg-background-surface/50">
              <button 
                onClick={() => setOpenSection(openSection === "brand" ? "" : "brand")}
                className="w-full flex items-center justify-between p-4 hover:bg-background-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-sm">Brand Identity</span>
                </div>
                {openSection === "brand" ? <ChevronUp className="w-4 h-4 text-foreground-muted" /> : <ChevronDown className="w-4 h-4 text-foreground-muted" />}
              </button>
              {openSection === "brand" && (
                <div className="px-4 pb-4 space-y-4">
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
                      Injects voice and audience. <Link to="/app/brands" className="text-primary hover:underline">Manage brands</Link>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Platform Selection */}
            <div>
              <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide block mb-3">
                Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                      selectedPlatform === platform.id
                        ? "border-primary bg-primary/10 shadow-glow"
                        : "border-border-subtle hover:border-border hover:bg-background-hover"
                    }`}
                  >
                    <div className={selectedPlatform === platform.id ? "text-primary" : platform.color}>
                      <platform.icon />
                    </div>
                    <span className={`text-sm font-medium ${
                      selectedPlatform === platform.id ? "text-primary" : "text-foreground-muted"
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
                <Input 
                  placeholder="e.g., Save 10+ hours per week"
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                />
              </div>
            </div>

            {/* Voice & Tone wrapped in Collapsible */}
            <div className="border border-border-subtle rounded-xl overflow-hidden bg-background-surface/50">
              <button 
                onClick={() => setOpenSection(openSection === "voice" ? "" : "voice")}
                className="w-full flex items-center justify-between p-4 hover:bg-background-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="font-medium text-sm">Voice & Tone</span>
                </div>
                {openSection === "voice" ? <ChevronUp className="w-4 h-4 text-foreground-muted" /> : <ChevronDown className="w-4 h-4 text-foreground-muted" />}
              </button>
              {openSection === "voice" && (
                <div className="px-4 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {["Direct", "Playful", "Urgent", "Professional"].map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                          selectedTone === tone
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border-subtle hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {variations.length > 0 && (
              <>
                <div className="border border-border-subtle rounded-xl overflow-hidden bg-background-surface/50">
                  <button 
                    onClick={() => setOpenSection(openSection === "refine" ? "" : "refine")}
                    className="w-full flex items-center justify-between p-4 hover:bg-background-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Wand2 className="w-4 h-4 text-purple-400" />
                      <span className="font-medium text-sm">Performance Evolution</span>
                    </div>
                    {openSection === "refine" ? <ChevronUp className="w-4 h-4 text-foreground-muted" /> : <ChevronDown className="w-4 h-4 text-foreground-muted" />}
                  </button>
                  {openSection === "refine" && (
                    <div className="px-4 pb-4 space-y-3">
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: "seo", label: "SEO Optimized", icon: TrendingUp, color: "text-blue-400" },
                          { id: "conversion", label: "Max Conversion", icon: Zap, color: "text-yellow-400" },
                          { id: "clarity", label: "Better Clarity", icon: ShieldCheck, color: "text-green-400" },
                          { id: "luxury", label: "Luxury Appeal", icon: Star, color: "text-purple-400" },
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
                  )}
                </div>

                <div className="border border-border-subtle rounded-xl overflow-hidden bg-background-surface/50">
                  <button 
                    onClick={() => setOpenSection(openSection === "history" ? "" : "history")}
                    className="w-full flex items-center justify-between p-4 hover:bg-background-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HistoryIcon className="w-4 h-4 text-orange-400" />
                      <span className="font-medium text-sm">History</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-400/10 text-orange-400">
                        {versions.length}
                      </span>
                    </div>
                    {openSection === "history" ? <ChevronUp className="w-4 h-4 text-foreground-muted" /> : <ChevronDown className="w-4 h-4 text-foreground-muted" />}
                  </button>
                  {openSection === "history" && (
                    <div className="px-4 pb-4 space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                      {versions.map((v) => (
                        <button 
                          key={v.id}
                          onClick={() => handleSwitchVersion(v)}
                          className={`w-full flex flex-col gap-1 p-3 text-left rounded-lg border transition-all ${
                            JSON.stringify(variations) === v.body
                              ? "border-primary bg-primary/5"
                              : "border-border-subtle hover:border-primary/30 hover:bg-background-hover"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">Version {v.versionNumber}</span>
                            <span className="text-[10px] text-foreground-muted">
                              {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit ${
                            v.improvementType === 'original' ? 'bg-background-surface text-foreground-muted' : 'bg-primary/10 text-primary'
                          }`}>
                            {v.improvementType || 'Modified'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Generate Button */}
          <div className="sticky bottom-0 p-4 border-t border-border-subtle bg-background-elevated">
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400" 
              size="lg"
              onClick={handleGenerate}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Variations
                </>
              )}
            </Button>
            <p className="text-xs text-foreground-subtle text-center mt-2">
              Generates 3 unique variations
            </p>
          </div>
        </div>

        {/* Right Panel - Variations Grid */}
        <div className="flex-1 flex flex-col bg-background min-w-0">
          <div className="flex-1 overflow-y-auto">
          {variations.length > 0 ? (
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCanvasExpanded(!canvasExpanded)}
                    className="text-foreground-muted"
                    title={canvasExpanded ? "Show input panel" : "Expand canvas"}
                  >
                    {canvasExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Generated Variations</h3>
                    <p className="text-sm text-foreground-muted">
                    {variations.length} variations for {platforms.find(p => p.id === selectedPlatform)?.name}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleGenerate}>
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
                <SaveContentButton
                  contentType="ad"
                  disabled={variations.length === 0}
                  getTitle={() => `${product || "Untitled"} — ${platforms.find(p => p.id === selectedPlatform)?.name} Ad`}
                  getBody={() => variations.map((v, i) => `Variant ${i + 1}:\n${v.headline}\n${v.primaryText}\n${v.cta}`).join("\n\n")}
                  getGeneratedOutput={() => ({ variants: variations })}
                  getInputData={() => ({ platform: selectedPlatform, product, audience, benefit, tone: selectedTone, brandId: selectedBrandId !== "none" ? selectedBrandId : undefined })}
                />
              </div>

              {/* Variations */}
              <div className="space-y-4">
                {variations.map((variation, index) => {
                  const score = mutation.data?.data?.score;
                  const avgScore = score?.total || 0;
                  const ScoreIcon = getScoreIcon(avgScore);
                  
                  return (
                    <Card key={index} variant="interactive" className="group overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Score sidebar */}
                          <div className="w-20 bg-background-surface border-r border-border-subtle flex flex-col items-center justify-center py-6">
                            <ScoreIcon className={`w-6 h-6 mb-2 ${getScoreColor(avgScore)}`} />
                            <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}</div>
                            <div className="text-xs text-foreground-subtle">Score</div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400">
                                  V{index + 1}
                                </span>
                                {variation.tags?.map((tag: string, i: number) => (
                                  <span key={i} className="text-xs px-2 py-1 rounded-lg bg-background-surface text-foreground-subtle">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleCopy(index, `${variation.headline}\n\n${variation.primaryText}\n\n${variation.cta}`)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {copiedIndex === index ? (
                                  <Check className="w-4 h-4 text-success" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>

                            {/* Headline */}
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Eye className="w-3 h-3 text-foreground-subtle" />
                                <span className="text-xs text-foreground-subtle uppercase tracking-wide">Headline</span>
                                {score && (
                                  <span className={`text-xs font-medium ${getScoreColor(score.engagement)}`}>
                                    {score.engagement}
                                  </span>
                                )}
                              </div>
                              <p className="text-lg font-semibold">{variation.headline}</p>
                            </div>

                            {/* Body */}
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-3 h-3 text-foreground-subtle" />
                                <span className="text-xs text-foreground-subtle uppercase tracking-wide">Primary Text</span>
                                {score && (
                                  <span className={`text-xs font-medium ${getScoreColor(score.readability)}`}>
                                    {score.readability}
                                  </span>
                                )}
                              </div>
                              <MarkdownRenderer content={variation.primaryText} />
                            </div>

                            {/* CTA */}
                            <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
                              <MousePointer className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-primary">{variation.cta}</span>
                              {score && (
                                <span className={`text-xs font-medium ${getScoreColor(score.engagement)}`}>
                                  CTA Score: {score.engagement}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Performance Lab</h3>
                <p className="text-foreground-muted mb-6">
                  Generate multiple ad variations instantly. Compare hooks, CTAs, and emotional 
                  triggers to find what converts best.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Multi-variant", "A/B ready", "Platform-optimized"].map((tag, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full bg-background-surface border border-border-subtle text-foreground-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          </div>
          {/* AI Reasoning Panel */}
          {reasoningData && <ReasoningPanel data={reasoningData} />}
        </div>
      </div>
    </AppLayout>
  );
}
