import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  analyzeCompetitor,
  getCompetitors,
  deleteCompetitor,
  getBrands,
  BrandProfile,
  CompetitorInsight,
} from "@/lib/api";
import { toast } from "sonner";
import {
  Sparkles,
  Globe,
  Target,
  TrendingUp,
  AlertTriangle,
  Trash2,
  Plus,
  Search,
  Shield,
  Zap,
  Eye,
  ChevronDown,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function CompetitorAnalysis() {
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch brands
  const { data: brandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });
  const brands: BrandProfile[] = brandsData?.data || [];

  // Fetch competitors for selected brand
  const { data: competitorsData, isLoading: loadingCompetitors } = useQuery({
    queryKey: ["competitors", selectedBrandId],
    queryFn: () => getCompetitors(selectedBrandId),
    enabled: !!selectedBrandId,
  });
  const competitors: CompetitorInsight[] = competitorsData?.data || [];

  // Analyze mutation
  const analyzeMutation = useMutation({
    mutationFn: (data: { url: string; brandProfileId: string }) =>
      analyzeCompetitor(data),
    onSuccess: () => {
      toast.success("Competitor analyzed successfully!");
      setCompetitorUrl("");
      queryClient.invalidateQueries({ queryKey: ["competitors", selectedBrandId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to analyze competitor");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCompetitor(id),
    onSuccess: () => {
      toast.success("Competitor removed");
      queryClient.invalidateQueries({ queryKey: ["competitors", selectedBrandId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete competitor");
    },
  });

  const handleAnalyze = () => {
    if (!competitorUrl || !selectedBrandId) {
      toast.error("Please select a brand and enter a URL");
      return;
    }
    analyzeMutation.mutate({
      url: competitorUrl,
      brandProfileId: selectedBrandId,
    });
  };

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-0px)]">
        {/* Left Panel - Controls */}
        <div className="w-[400px] border-r border-border-subtle flex flex-col bg-background-elevated/30">
          {/* Header */}
          <div className="p-6 border-b border-border-subtle">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Competitor Intel</h1>
                <p className="text-xs text-foreground-muted">
                  Analyze & differentiate
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Brand Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground-muted flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Brand Profile
              </label>
              <div className="relative">
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="w-full appearance-none bg-background-surface border border-border-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="">Select a brand...</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle pointer-events-none" />
              </div>
              {selectedBrand && (
                <div className="mt-2 p-3 rounded-lg bg-background-surface/50 border border-border-subtle">
                  <p className="text-xs text-foreground-muted">
                    <span className="font-medium text-foreground">Industry:</span>{" "}
                    {selectedBrand.industry || "Not set"}
                  </p>
                  <p className="text-xs text-foreground-muted mt-1">
                    <span className="font-medium text-foreground">Tone:</span>{" "}
                    {selectedBrand.tone}
                  </p>
                </div>
              )}
            </div>

            {/* URL Input */}
            {selectedBrandId && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground-muted flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" />
                  Competitor URL
                </label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://competitor.com/page"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAnalyze();
                    }}
                  />
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={!competitorUrl || analyzeMutation.isPending}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-xl py-3"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze Competitor
                    </>
                  )}
                </Button>
                <p className="text-xs text-foreground-subtle text-center">
                  We'll fetch the page and extract strategic insights using AI
                </p>
              </div>
            )}

            {/* Info Card */}
            <Card variant="default" className="border-orange-500/20">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  How it works
                </h4>
                <ul className="text-xs text-foreground-muted space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">1.</span>
                    Select a brand and paste a competitor's page URL
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">2.</span>
                    AI extracts their key messages, tone, strengths & gaps
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">3.</span>
                    When you generate content with this brand, AI auto-differentiates
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Competitor Count */}
            {selectedBrandId && competitors.length > 0 && (
              <div className="text-center text-xs text-foreground-subtle">
                {competitors.length} competitor{competitors.length !== 1 ? "s" : ""} analyzed for{" "}
                <span className="text-foreground font-medium">{selectedBrand?.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Competitor Insights */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border-subtle bg-background-elevated/50">
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-foreground-subtle" />
              <span className="text-sm font-medium">Competitor Insights</span>
              {competitors.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {competitors.length} analyzed
                </span>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedBrandId ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Market Intelligence</h3>
                  <p className="text-foreground-muted mb-6">
                    Select a brand profile to start analyzing competitors. AI will
                    identify messaging gaps you can exploit in your content.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Gap analysis", "Tone mapping", "Auto-differentiation"].map(
                      (tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-3 py-1 rounded-full bg-background-surface border border-border-subtle text-foreground-muted"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : loadingCompetitors ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
              </div>
            ) : competitors.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-background-surface border border-border-subtle flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-6 h-6 text-foreground-subtle" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No competitors yet</h3>
                  <p className="text-foreground-muted text-sm">
                    Paste a competitor URL on the left to start analyzing their content strategy.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-4">
                {competitors.map((competitor) => (
                  <Card
                    key={competitor.id}
                    variant="default"
                    className="overflow-hidden transition-all duration-200 hover:border-orange-500/30"
                  >
                    <CardContent className="p-0">
                      {/* Header */}
                      <div
                        className="flex items-center justify-between p-5 cursor-pointer hover:bg-background-surface/30 transition-colors"
                        onClick={() =>
                          setExpandedId(
                            expandedId === competitor.id ? null : competitor.id
                          )
                        }
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/15 to-red-500/10 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">
                              {competitor.title || competitor.domain}
                            </h3>
                            <a
                              href={competitor.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-foreground-subtle hover:text-primary flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {competitor.domain}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-foreground-subtle">
                            {new Date(competitor.lastAnalyzed).toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(competitor.id);
                            }}
                            className="text-foreground-subtle hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <ChevronDown
                            className={`w-4 h-4 text-foreground-subtle transition-transform ${
                              expandedId === competitor.id ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedId === competitor.id && (
                        <div className="border-t border-border-subtle p-5 space-y-5">
                          {/* Summary */}
                          {competitor.rawSummary && (
                            <div className="p-4 rounded-xl bg-background-surface/50 border border-border-subtle">
                              <p className="text-sm text-foreground-muted leading-relaxed">
                                {competitor.rawSummary}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Key Messages */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                                Key Messages
                              </h4>
                              <ul className="space-y-1.5">
                                {competitor.keyMessages.map((msg, i) => (
                                  <li
                                    key={i}
                                    className="text-sm text-foreground-muted flex items-start gap-2"
                                  >
                                    <span className="text-blue-400 mt-1 text-xs">●</span>
                                    {msg}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Strengths */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-green-400" />
                                Strengths
                              </h4>
                              <ul className="space-y-1.5">
                                {competitor.strengthAreas.map((str, i) => (
                                  <li
                                    key={i}
                                    className="text-sm text-foreground-muted flex items-start gap-2"
                                  >
                                    <span className="text-green-400 mt-1 text-xs">●</span>
                                    {str}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Tone */}
                            {competitor.toneAnalysis && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle flex items-center gap-2">
                                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                                  Tone & Style
                                </h4>
                                <p className="text-sm text-foreground-muted">
                                  {competitor.toneAnalysis}
                                </p>
                              </div>
                            )}

                            {/* Gaps - Highlighted */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-orange-400 flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Gaps & Opportunities
                              </h4>
                              <ul className="space-y-1.5">
                                {competitor.weaknessGaps.map((gap, i) => (
                                  <li
                                    key={i}
                                    className="text-sm text-foreground flex items-start gap-2 font-medium"
                                  >
                                    <span className="text-orange-400 mt-1 text-xs">▸</span>
                                    {gap}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
