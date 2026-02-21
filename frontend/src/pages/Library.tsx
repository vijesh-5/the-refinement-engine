import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listContent, deleteContentItem, ContentItem } from "@/lib/api";
import { toast } from "sonner";
import {
  Search,
  Grid3X3,
  List,
  FileText,
  Megaphone,
  ShoppingBag,
  MoreVertical,
  Clock,
  Copy,
  Trash2,
  Edit3,
  Plus,
  Loader2,
  Layers,
} from "lucide-react";

type ContentType = "all" | "blog" | "ad" | "product";
type ContentStatus = "all" | "DRAFT" | "COMPLETE";

const typeIcons: Record<string, typeof FileText> = {
  blog: FileText,
  ad: Megaphone,
  product: ShoppingBag,
  general: Layers,
};

const typeColors: Record<string, string> = {
  blog: "text-purple-400 bg-purple-500/10",
  ad: "text-blue-400 bg-blue-500/10",
  product: "text-green-400 bg-green-500/10",
  general: "text-gray-400 bg-gray-500/10",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getPreview(item: ContentItem): string {
  if (item.body) {
    return item.body.replace(/[#*_`\[\]]/g, "").slice(0, 120) + (item.body.length > 120 ? "…" : "");
  }
  return "No content preview available";
}

export default function Library() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContentType>("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatus>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch content from the database
  const { data: contentResponse, isLoading } = useQuery({
    queryKey: ["content", statusFilter, typeFilter],
    queryFn: () =>
      listContent({
        status: statusFilter !== "all" ? statusFilter : undefined,
        contentType: typeFilter !== "all" ? typeFilter : undefined,
        limit: 50,
      }),
  });

  // The API wrapper returns { success, data: { data: ContentItem[], meta } }
  const contentData = contentResponse?.data;
  const allContent: ContentItem[] = Array.isArray(contentData)
    ? contentData
    : (contentData as any)?.data || [];

  // Client-side search filter
  const filteredContent = allContent.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContentItem(id),
    onSuccess: () => {
      toast.success("Content deleted");
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setActiveMenu(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete content");
    },
  });

  const handleCopy = (item: ContentItem) => {
    navigator.clipboard.writeText(item.body || "");
    toast.success("Copied to clipboard");
    setActiveMenu(null);
  };

  return (
    <AppLayout>
      <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title">My Content</h1>
          <p className="page-description">Browse and manage all your created content</p>
        </div>
        <Button asChild>
          <Link to="/app/blog" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <Input
            placeholder="Search content..."
            className="pl-11 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ContentType)}
            className="h-11 px-4 rounded-xl bg-input border border-border-subtle text-sm focus:outline-none focus:border-primary/50 flex-1 md:flex-none"
          >
            <option value="all">All types</option>
            <option value="blog">Blog posts</option>
            <option value="ad">Ad copy</option>
            <option value="product">Products</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContentStatus)}
            className="h-11 px-4 rounded-xl bg-input border border-border-subtle text-sm focus:outline-none focus:border-primary/50 flex-1 md:flex-none"
          >
            <option value="all">All status</option>
            <option value="DRAFT">Drafts</option>
            <option value="COMPLETE">Complete</option>
          </select>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-background-surface border border-border-subtle">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-primary/10 text-primary" : "text-foreground-muted hover:bg-background-hover"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-primary/10 text-primary" : "text-foreground-muted hover:bg-background-hover"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => {
            const Icon = typeIcons[item.contentType] || FileText;
            const color = typeColors[item.contentType] || typeColors.general;
            return (
              <Card key={item.id} variant="interactive" className="group relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-background-hover transition-all"
                      >
                        <MoreVertical className="w-4 h-4 text-foreground-muted" />
                      </button>
                      {activeMenu === item.id && (
                        <div className="absolute right-0 top-10 w-44 py-2 rounded-xl bg-popover border border-border-subtle shadow-lg z-10">
                          <button
                            onClick={() => handleCopy(item)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground-muted hover:bg-background-hover transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-background-hover transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-medium text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-foreground-muted line-clamp-2 mb-5 leading-relaxed">
                    {getPreview(item)}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-foreground-subtle">
                      <Clock className="w-3.5 h-3.5" />
                      {timeAgo(item.updatedAt)}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === "COMPLETE"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}>
                      {item.status === "COMPLETE" ? "Complete" : "Draft"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContent.map((item) => {
            const Icon = typeIcons[item.contentType] || FileText;
            const color = typeColors[item.contentType] || typeColors.general;
            return (
              <Card key={item.id} variant="interactive" className="group">
                <CardContent className="p-5 flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-foreground-muted mt-1">
                      <span className="capitalize">{item.contentType}</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(item.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <span className={`text-sm px-3 py-1.5 rounded-full flex-shrink-0 ${
                    item.status === "COMPLETE"
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}>
                    {item.status === "COMPLETE" ? "Complete" : "Draft"}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleCopy(item)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filteredContent.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-background-surface border border-border-subtle flex items-center justify-center mx-auto mb-5">
            <FileText className="w-7 h-7 text-foreground-muted" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No content found</h3>
          <p className="text-foreground-muted mb-6">
            {search || typeFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters or search term."
              : "Generate some content and save it to see it here."}
          </p>
          <Button asChild>
            <Link to="/app/blog">Create your first piece</Link>
          </Button>
        </div>
      )}
    </AppLayout>
  );
}
