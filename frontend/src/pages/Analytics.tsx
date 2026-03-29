import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  FileText,
  AlignLeft,
  TrendingUp,
  Target,
  Zap,
  Star,
  Award,
  Loader2,
  ArrowRight,
  Layers,
  RefreshCw,
  BookOpen,
  ShoppingBag,
} from "lucide-react";
import { getAnalyticsOverview, ContentAnalyticsItem } from "@/lib/api";

// ─── Helper Components ─────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  accent = "text-primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="p-5 rounded-xl bg-background-surface border border-border-subtle">
      <div className="flex items-center gap-2 text-foreground-muted mb-3">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-foreground-subtle mt-1">{sub}</p>}
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-foreground-muted w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold w-8 text-right">{value}</span>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { icon: React.ReactNode; color: string }> = {
    blog: { icon: <BookOpen className="w-3 h-3" />, color: "text-purple-400 bg-purple-500/10" },
    ad: { icon: <Zap className="w-3 h-3" />, color: "text-blue-400 bg-blue-500/10" },
    product: { icon: <ShoppingBag className="w-3 h-3" />, color: "text-green-400 bg-green-500/10" },
  };
  const c = config[type] || { icon: <FileText className="w-3 h-3" />, color: "text-foreground-muted bg-background-surface" };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${c.color}`}>
      {c.icon} {type}
    </span>
  );
}

function ContentRow({ item, navigate }: { item: ContentAnalyticsItem; navigate: (path: string) => void }) {
  const routes: Record<string, string> = { blog: "/app/blog", ad: "/app/ads", product: "/app/products" };
  const editorPath = `${routes[item.contentType] || "/app/blog"}?id=${item.id}`;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-background-surface/50 border border-border-subtle hover:border-border hover:bg-background-hover transition-all group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate mb-1">{item.title}</p>
        <div className="flex items-center gap-3">
          <TypeBadge type={item.contentType} />
          <span className="text-xs text-foreground-subtle">{item.wordCount.toLocaleString()} words</span>
          {item.versions > 0 && <span className="text-xs text-foreground-subtle">{item.versions} ver.</span>}
        </div>
      </div>
      {item.score ? (
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className={`text-lg font-bold ${item.score.total >= 70 ? "text-emerald-400" : item.score.total >= 50 ? "text-yellow-400" : "text-red-400"}`}>
              {item.score.total}
            </div>
            <div className="text-[10px] text-foreground-subtle">Score</div>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-foreground-muted">
            <span>R:{item.score.readability}</span>
            <span>S:{item.score.seo}</span>
            <span>E:{item.score.engagement}</span>
          </div>
        </div>
      ) : (
        <span className="text-xs text-foreground-subtle">No score</span>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => navigate(editorPath)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────

export default function Analytics() {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: getAnalyticsOverview,
  });

  const analytics = data?.data;

  return (
    <AppLayout>
      <div className="app-content">
        <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="page-title">Analytics</h1>
            <p className="page-description">Content quality insights & production metrics</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !analytics || analytics.summary.totalContent === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No content yet</h3>
            <p className="text-foreground-muted text-sm max-w-sm mx-auto mb-6">
              Generate some content using the Blog Creator, Ad Copywriter, or Product Descriptions — analytics will appear here automatically.
            </p>
            <Button onClick={() => navigate("/app/blog")}>
              <BookOpen className="w-4 h-4 mr-2" /> Create Content
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── Summary Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<FileText className="w-4 h-4" />} label="Total Content" value={analytics.summary.totalContent} />
              <StatCard icon={<AlignLeft className="w-4 h-4" />} label="Total Words" value={analytics.summary.totalWords.toLocaleString()} sub="across all content" />
              <StatCard icon={<Layers className="w-4 h-4" />} label="Versions" value={analytics.summary.totalVersions} sub="refinements made" />
              <StatCard icon={<Award className="w-4 h-4 text-emerald-400" />} label="Avg Quality Score" value={analytics.summary.avgScore} accent="text-emerald-400" sub="out of 100" />
            </div>

            {/* ── Score Breakdown + Type Distribution ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quality Scores */}
              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-sm font-semibold">Average Quality Scores</h3>
                  </div>
                  <div className="space-y-4">
                    <ScoreBar label="Readability" value={analytics.summary.avgReadability} color="bg-gradient-to-r from-blue-500 to-cyan-400" />
                    <ScoreBar label="SEO" value={analytics.summary.avgSEO} color="bg-gradient-to-r from-emerald-500 to-green-400" />
                    <ScoreBar label="Engagement" value={analytics.summary.avgEngagement} color="bg-gradient-to-r from-purple-500 to-pink-400" />
                  </div>
                </CardContent>
              </Card>

              {/* Content by Type */}
              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-semibold">Content by Type</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(analytics.byType).map(([type, count]) => {
                      const pct = Math.round((count / analytics.summary.totalContent) * 100);
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <TypeBadge type={type} />
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/60 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold w-12 text-right">{count} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Production Timeline ── */}
            {analytics.timeline.length > 1 && (
              <Card variant="default">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold">Production Timeline</h3>
                    <span className="text-xs text-foreground-subtle ml-auto">content created per week</span>
                  </div>
                  <div className="flex items-end gap-1 h-32">
                    {analytics.timeline.map((t) => {
                      const maxCount = Math.max(...analytics.timeline.map((x) => x.count));
                      const heightPct = maxCount > 0 ? (t.count / maxCount) * 100 : 0;
                      return (
                        <div key={t.week} className="flex-1 flex flex-col items-center gap-1 group" title={`Week of ${t.week}: ${t.count} items`}>
                          <span className="text-[10px] text-foreground-subtle opacity-0 group-hover:opacity-100 transition-opacity">{t.count}</span>
                          <div
                            className="w-full rounded-t-md bg-gradient-to-t from-primary/40 to-primary/80 transition-all duration-300 hover:from-primary/60 hover:to-primary min-h-[4px]"
                            style={{ height: `${Math.max(4, heightPct)}%` }}
                          />
                          <span className="text-[8px] text-foreground-subtle truncate max-w-full">
                            {new Date(t.week).toLocaleDateString("en", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Top & Low Performers ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.topPerformers.length > 0 && (
                <Card variant="default">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold">Top Performers</h3>
                    </div>
                    <div className="space-y-2">
                      {analytics.topPerformers.map((item, i) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-hover transition-colors cursor-pointer" onClick={() => {
                          const routes: Record<string, string> = { blog: "/app/blog", ad: "/app/ads", product: "/app/products" };
                          navigate(`${routes[item.contentType] || "/app/blog"}?id=${item.id}`);
                        }}>
                          <span className="text-xs font-bold text-foreground-muted w-5">#{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.title}</p>
                            <TypeBadge type={item.contentType} />
                          </div>
                          <span className="text-lg font-bold text-emerald-400">{item.score?.total || 0}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analytics.lowPerformers.length > 0 && (
                <Card variant="default">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-4 h-4 text-yellow-400" />
                      <h3 className="text-sm font-semibold">Needs Improvement</h3>
                    </div>
                    <div className="space-y-2">
                      {analytics.lowPerformers.map((item, i) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-hover transition-colors cursor-pointer" onClick={() => {
                          const routes: Record<string, string> = { blog: "/app/blog", ad: "/app/ads", product: "/app/products" };
                          navigate(`${routes[item.contentType] || "/app/blog"}?id=${item.id}`);
                        }}>
                          <span className="text-xs font-bold text-foreground-muted w-5">#{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.title}</p>
                            <TypeBadge type={item.contentType} />
                          </div>
                          <span className={`text-lg font-bold ${(item.score?.total || 0) < 50 ? "text-red-400" : "text-yellow-400"}`}>{item.score?.total || 0}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ── All Content Quality Table ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-foreground-muted" />
                <h3 className="text-sm font-semibold">All Content</h3>
                <span className="text-xs text-foreground-subtle">({analytics.items.length} items)</span>
              </div>
              <div className="space-y-2">
                {analytics.items.map((item) => (
                  <ContentRow key={item.id} item={item} navigate={navigate} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
