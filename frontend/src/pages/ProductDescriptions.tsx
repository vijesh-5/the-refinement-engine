import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { stripMarkdown } from "@/lib/markdown";
import { useMutation, useQuery } from "@tanstack/react-query";
import { generateProduct, improveContent, getContentVersions, getBrands, getContentItem, ProductContent, ContentVersion, BrandProfile } from "@/lib/api";
import { SaveContentButton } from "@/components/ui/SaveContentButton";
import { ReasoningPanel, ReasoningData } from "@/components/ui/ReasoningPanel";
import { toast } from "sonner";
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
  Award,
  History as HistoryIcon,
  ShieldCheck,
  Wand2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Briefcase,
  Maximize2,
  Minimize2,
  Pencil,
  FileDown,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

interface Feature {
  id: string;
  feature: string;
  benefit: string;
}

export default function ProductDescriptions() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [audience, setAudience] = useState("");
  const [features, setFeatures] = useState<Feature[]>([
    { id: "1", feature: "", benefit: "" },
  ]);
  const [tone, setTone] = useState("Premium");
  const [generatedContent, setGeneratedContent] = useState<ProductContent | null>(null);
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);
  const [reasoningData, setReasoningData] = useState<ReasoningData | undefined>(undefined);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [openSection, setOpenSection] = useState<string>("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("none");
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
        // Try to restore structured content from generatedOutput
        const output = (item as any).generatedOutput;
        if (output && output.productName) {
          setGeneratedContent(output as ProductContent);
        } else if (item.body) {
          // Fallback: try parsing body as JSON (backend stores JSON.stringify(output))
          try {
            const parsed = JSON.parse(item.body);
            if (parsed.productName) {
              setGeneratedContent(parsed as ProductContent);
            } else {
              throw new Error("Not structured product data");
            }
          } catch {
            // Last resort: treat body as plain long description
            setGeneratedContent({
              productName: item.title,
              shortDescription: "",
              longDescription: item.body,
              bulletFeatures: [],
              id: item.id,
              score: { total: 0, readability: 0, seo: 0, engagement: 0, details: {} },
            } as ProductContent);
          }
        }
        const input = (item as any).inputData;
        if (input) {
          if (input.productName) setProductName(input.productName);
          if (input.category) setCategory(input.category);
          if (input.audience) setAudience(input.audience);
          if (input.tone) setTone(input.tone);
          if (input.brandId) setSelectedBrandId(input.brandId);
          if (input.features && Array.isArray(input.features)) setFeatures(input.features);
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
      productName: string;
      features: string;
      tone: string;
      targetAudience: string;
      length: "short" | "medium" | "long";
      brandId?: string;
    }) => generateProduct(data),
    onSuccess: (result) => {
      if (result.success && result.data) {
        setGeneratedContent(result.data);
        setCurrentContentId(result.data.id || null);
        setReasoningData({
          reasoningSummary: result.data.reasoningSummary,
        });
        toast.success("Product description generated successfully!");
        if (result.data.id) {
          fetchVersions(result.data.id);
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate product description");
    }
  });

  const improveMutation = useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: string }) => improveContent(id, mode),
    onSuccess: (result) => {
      if (result.success && result.data) {
        try {
          // If the improvement returned JSON (we should hope so or handle both)
          // For now, assume it's the refined long description if not JSON
          let data: ProductContent;
          try {
            data = JSON.parse(result.data.body);
          } catch {
            data = { ...generatedContent!, longDescription: result.data.body };
          }
          setGeneratedContent(data);
          toast.success(`Content improved! (Version ${result.data.versionNumber})`);
          fetchVersions(currentContentId!);
        } catch (e) {
          console.error("Failed to process improved content", e);
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
      toast.error("Generate a description first before improving");
      return;
    }
    improveMutation.mutate({ id: currentContentId, mode });
  };

  const handleSwitchVersion = (version: ContentVersion) => {
    try {
      setGeneratedContent(JSON.parse(version.body));
      toast.info(`Switched to Version ${version.versionNumber}`);
    } catch (e) {
      // Fallback if it's not JSON
      setGeneratedContent({ ...generatedContent!, longDescription: version.body });
      toast.info(`Switched to Version ${version.versionNumber}`);
    }
  };

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
    if (!productName || !audience || features.every(f => !f.feature)) {
      toast.error("Product name, audience, and at least one feature are required");
      return;
    }

    const featuresString = features
      .filter(f => f.feature)
      .map(f => `${f.feature}${f.benefit ? ` (${f.benefit})` : ""}`)
      .join(", ");

    mutation.mutate({
      productName,
      targetAudience: audience,
      features: featuresString,
      tone,
      length: "medium", // Default for now
      brandId: selectedBrandId === "none" ? undefined : selectedBrandId
    });
  };

  const handleCopy = (section: string, text: string) => {
    navigator.clipboard.writeText(stripMarkdown(text));
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const conversionMetrics = [
    { label: "Persuasion", value: 94, icon: TrendingUp },
    { label: "Clarity", value: 91, icon: Target },
    { label: "Desire", value: 88, icon: Star },
    { label: "Urgency", value: 82, icon: Zap },
  ];

  // ── Inline editing helpers ──
  const updateField = (field: keyof ProductContent, value: any) => {
    if (generatedContent) {
      setGeneratedContent({ ...generatedContent, [field]: value });
    }
  };

  const updateBullet = (index: number, value: string) => {
    if (generatedContent) {
      const newBullets = [...generatedContent.bulletFeatures];
      newBullets[index] = value;
      setGeneratedContent({ ...generatedContent, bulletFeatures: newBullets });
    }
  };

  const addBullet = () => {
    if (generatedContent) {
      setGeneratedContent({ ...generatedContent, bulletFeatures: [...generatedContent.bulletFeatures, ""] });
    }
  };

  const removeBullet = (index: number) => {
    if (generatedContent && generatedContent.bulletFeatures.length > 1) {
      setGeneratedContent({ ...generatedContent, bulletFeatures: generatedContent.bulletFeatures.filter((_, i) => i !== index) });
    }
  };

  const handleCopyAll = () => {
    if (!generatedContent) return;
    const text = [
      `HEADLINE: ${generatedContent.productName}`,
      `\nSHORT DESCRIPTION:\n${generatedContent.shortDescription}`,
      `\nKEY BENEFITS:\n${generatedContent.bulletFeatures.map(b => `• ${b}`).join("\n")}`,
      `\nFULL DESCRIPTION:\n${generatedContent.longDescription}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("All sections copied!");
  };

  const handleExportAll = () => {
    if (!generatedContent) return;
    const text = [
      `# ${generatedContent.productName}`,
      `\n## Short Description\n${generatedContent.shortDescription}`,
      `\n## Key Benefits\n${generatedContent.bulletFeatures.map(b => `- ${b}`).join("\n")}`,
      `\n## Full Description\n${generatedContent.longDescription}`,
    ].join("\n");
    const title = (productName || "product").replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "-");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}-description.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported as .md");
  };

  const longWordCount = generatedContent
    ? generatedContent.longDescription.split(/\s+/).filter(w => w.length > 0).length
    : 0;

  return (
    <AppLayout>
      <div className="flex h-full overflow-hidden">
        {/* Left Panel - Conversion Engine Controls */}
        <div className={`border-r border-border-subtle bg-gradient-to-b from-background-elevated to-background flex flex-col shrink-0 transition-all duration-300 ease-in-out ${canvasExpanded ? "w-0 overflow-hidden opacity-0 border-r-0" : "w-96 opacity-100"}`}>
          {/* Header */}
          <div className="px-4 py-4 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Product Descriptions</h2>
                <p className="text-[10px] text-foreground-muted">Conversion Engine</p>
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
                      Injects tone, audience, and banned words. <Link to="/app/brands" className="text-primary hover:underline">Manage brands</Link>
                    </p>
                  </div>
                </div>
              )}
            </div>

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

            {/* Target Audience */}
            <div>
              <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide block mb-2">
                Target Audience
              </label>
              <Input 
                placeholder="e.g., Luxury travelers, Busy professionals"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
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

            {/* Tone wrapped in collapsible */}
            <div className="border border-border-subtle rounded-xl overflow-hidden bg-background-surface/50">
              <button 
                onClick={() => setOpenSection(openSection === "tone" ? "" : "tone")}
                className="w-full flex items-center justify-between p-4 hover:bg-background-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-sm">Description Tone</span>
                </div>
                {openSection === "tone" ? <ChevronUp className="w-4 h-4 text-foreground-muted" /> : <ChevronDown className="w-4 h-4 text-foreground-muted" />}
              </button>
              {openSection === "tone" && (
                <div className="px-4 pb-4">
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
              )}
            </div>

            {generatedContent && (
              <>
                <div className="border border-border-subtle rounded-xl overflow-hidden bg-background-surface/50">
                  <button 
                    onClick={() => setOpenSection(openSection === "refine" ? "" : "refine")}
                    className="w-full flex items-center justify-between p-4 hover:bg-background-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Wand2 className="w-4 h-4 text-purple-400" />
                      <span className="font-medium text-sm">Conversion Refinement</span>
                    </div>
                    {openSection === "refine" ? <ChevronUp className="w-4 h-4 text-foreground-muted" /> : <ChevronDown className="w-4 h-4 text-foreground-muted" />}
                  </button>
                  {openSection === "refine" && (
                    <div className="px-4 pb-4 space-y-3">
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: "seo", label: "SEO Optimization", icon: TrendingUp, color: "text-blue-400" },
                          { id: "conversion", label: "Max Conversion", icon: Zap, color: "text-yellow-400" },
                          { id: "clarity", label: "Better Clarity", icon: ShieldCheck, color: "text-green-400" },
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
                  )}
                </div>

                <div className="border border-border-subtle rounded-xl overflow-hidden bg-background-surface/50">
                  <button 
                    onClick={() => setOpenSection(openSection === "history" ? "" : "history")}
                    className="w-full flex items-center justify-between p-4 hover:bg-background-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HistoryIcon className="w-4 h-4 text-orange-400" />
                      <span className="font-medium text-sm">Version History</span>
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
                            JSON.stringify(generatedContent) === v.body
                              ? "border-green-500 bg-green-500/5 shadow-sm shadow-green-500/10"
                              : "border-border-subtle hover:border-green-500/30 hover:bg-background-hover"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">Version {v.versionNumber}</span>
                            <span className="text-[10px] text-foreground-muted">
                              {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit ${
                            v.improvementType === 'original' ? 'bg-background-surface text-foreground-muted' : 'bg-green-500/10 text-green-400'
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
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400" 
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
                  <Sparkles className="w-4 h-4" />
                  Generate Description
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Panel - Structured Output */}
        <div className="flex-1 flex flex-col bg-background min-w-0">
          <div className="flex-1 overflow-y-auto">
          {generatedContent ? (
            <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
              {/* Expand/Collapse Button */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCanvasExpanded(!canvasExpanded)}
                  className="text-foreground-muted"
                  title={canvasExpanded ? "Show input panel" : "Expand canvas"}
                >
                  {canvasExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="ml-1.5 text-xs">{canvasExpanded ? "Show Inputs" : "Expand"}</span>
                </Button>
              </div>
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
                          <span className="text-4xl font-bold text-green-400">{generatedContent.score?.total || 0}</span>
                          <span className="text-green-400/60">/100</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <TrendingUp className="w-4 h-4 text-foreground-subtle mx-auto mb-1" />
                        <div className="text-lg font-semibold text-foreground">{generatedContent.score?.readability || 0}</div>
                        <div className="text-xs text-foreground-subtle">Readability</div>
                      </div>
                      <div className="text-center">
                        <Target className="w-4 h-4 text-foreground-subtle mx-auto mb-1" />
                        <div className="text-lg font-semibold text-foreground">{generatedContent.score?.seo || 0}</div>
                        <div className="text-xs text-foreground-subtle">SEO</div>
                      </div>
                      <div className="text-center">
                        <Zap className="w-4 h-4 text-foreground-subtle mx-auto mb-1" />
                        <div className="text-lg font-semibold text-foreground">{generatedContent.score?.engagement || 0}</div>
                        <div className="text-xs text-foreground-subtle">Engagement</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Bar */}
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyAll}>
                  <Copy className="w-4 h-4" />
                  Copy All
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportAll}>
                  <FileDown className="w-4 h-4" />
                  Export
                </Button>
                <SaveContentButton
                  contentType="product"
                  disabled={!generatedContent}
                  getTitle={() => productName || "Untitled Product"}
                  getBody={() => `${generatedContent!.productName}\n\n${generatedContent!.shortDescription}\n\n${generatedContent!.longDescription}`}
                  getGeneratedOutput={() => generatedContent}
                  getInputData={() => ({ productName, category, audience, features, tone, brandId: selectedBrandId !== "none" ? selectedBrandId : undefined })}
                />
              </div>

              {/* Headline */}
              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Star className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-sm font-semibold">Headline</span>
                      <Pencil className="w-3 h-3 text-foreground-subtle" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCopy("headline", generatedContent.productName)}
                    >
                      {copiedSection === "headline" ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <input
                    value={generatedContent.productName}
                    onChange={(e) => updateField("productName", e.target.value)}
                    className="w-full bg-transparent text-2xl font-semibold leading-tight outline-none border-b border-transparent focus:border-green-500/30 transition-colors py-1"
                  />
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
                      <span className="text-xs text-foreground-subtle">{generatedContent.bulletFeatures.length} items</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={addBullet} title="Add bullet">
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleCopy("bullets", generatedContent.bulletFeatures.map(b => `• ${b}`).join("\n"))}
                      >
                        {copiedSection === "bullets" ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {generatedContent.bulletFeatures.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-3 group/bullet">
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mt-1.5 flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-success" />
                        </div>
                        <input
                          value={bullet}
                          onChange={(e) => updateBullet(index, e.target.value)}
                          className="flex-1 bg-transparent text-foreground-muted leading-relaxed outline-none border-b border-transparent focus:border-green-500/30 transition-colors py-0.5"
                        />
                        {generatedContent.bulletFeatures.length > 1 && (
                          <button
                            onClick={() => removeBullet(index)}
                            className="opacity-0 group-hover/bullet:opacity-100 text-foreground-subtle hover:text-destructive transition-all mt-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
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
                      <span className="text-xs text-foreground-subtle">{generatedContent.shortDescription.length} chars</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCopy("short", generatedContent.shortDescription)}
                    >
                      {copiedSection === "short" ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <textarea
                    value={generatedContent.shortDescription}
                    onChange={(e) => updateField("shortDescription", e.target.value)}
                    className="w-full bg-transparent text-foreground-muted leading-relaxed text-sm resize-none outline-none border border-transparent focus:border-green-500/20 rounded-lg focus:bg-background-surface/50 transition-all p-2 -ml-2"
                    rows={3}
                  />
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
                      <span className="text-xs text-foreground-subtle">{longWordCount} words</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCopy("long", generatedContent.longDescription)}
                    >
                      {copiedSection === "long" ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <textarea
                    value={generatedContent.longDescription}
                    onChange={(e) => updateField("longDescription", e.target.value)}
                    className="w-full bg-transparent text-foreground-muted leading-relaxed text-sm resize-none outline-none border border-transparent focus:border-green-500/20 rounded-lg focus:bg-background-surface/50 transition-all p-3 -ml-3 min-h-[200px]"
                    rows={Math.max(8, generatedContent.longDescription.split("\n").length)}
                  />
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
          {/* AI Reasoning Panel */}
          {reasoningData && <ReasoningPanel data={reasoningData} />}
        </div>
      </div>
    </AppLayout>
  );
}
