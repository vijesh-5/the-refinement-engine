import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
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
  Download
} from "lucide-react";

type ContentType = "all" | "blog" | "ad" | "product";
type ContentStatus = "all" | "draft" | "complete";

interface ContentItem {
  id: string;
  title: string;
  type: "blog" | "ad" | "product";
  status: "draft" | "complete";
  updatedAt: string;
  preview: string;
}

const mockContent: ContentItem[] = [
  {
    id: "1",
    title: "10 Ways to Improve Your Landing Page Conversions",
    type: "blog",
    status: "draft",
    updatedAt: "2 hours ago",
    preview: "A landing page is often your first impression—and your best chance to convert visitors..."
  },
  {
    id: "2",
    title: "Summer Sale Campaign - Facebook",
    type: "ad",
    status: "complete",
    updatedAt: "Yesterday",
    preview: "Stop wasting hours on copy that doesn't convert. Artifex uses AI to transform your ideas..."
  },
  {
    id: "3",
    title: "Premium Leather Messenger Bag",
    type: "product",
    status: "complete",
    updatedAt: "3 days ago",
    preview: "Elevate your everyday carry with our handcrafted leather messenger bag. Made from premium..."
  },
  {
    id: "4",
    title: "The Complete Guide to Email Marketing in 2025",
    type: "blog",
    status: "complete",
    updatedAt: "1 week ago",
    preview: "Email marketing remains one of the most effective channels for driving conversions..."
  },
  {
    id: "5",
    title: "LinkedIn Thought Leadership Series",
    type: "ad",
    status: "draft",
    updatedAt: "1 week ago",
    preview: "Your competitors are using AI. Are you? Write ad copy that actually sells..."
  },
  {
    id: "6",
    title: "Wireless Noise-Canceling Headphones",
    type: "product",
    status: "complete",
    updatedAt: "2 weeks ago",
    preview: "Experience audio like never before with our flagship wireless headphones..."
  },
];

const typeIcons = {
  blog: FileText,
  ad: Megaphone,
  product: ShoppingBag,
};

const typeColors = {
  blog: "text-purple-400",
  ad: "text-blue-400",
  product: "text-green-400",
};

export default function Library() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContentType>("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatus>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredContent = mockContent.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="p-6 md:p-10 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">My Content</h1>
          <p className="text-foreground-muted">Browse and manage all your created content</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
            <Input
              placeholder="Search content..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ContentType)}
              className="h-10 px-3 rounded-lg bg-input border border-border-subtle text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="all">All types</option>
              <option value="blog">Blog posts</option>
              <option value="ad">Ad copy</option>
              <option value="product">Products</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ContentStatus)}
              className="h-10 px-3 rounded-lg bg-input border border-border-subtle text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="all">All status</option>
              <option value="draft">Drafts</option>
              <option value="complete">Complete</option>
            </select>
          </div>

          <div className="flex items-center gap-1 ml-auto">
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

        {/* Content Grid */}
        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map((item) => {
              const Icon = typeIcons[item.type];
              return (
                <Card key={item.id} variant="interactive" className="group relative">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 rounded-lg bg-background-surface border border-border-subtle flex items-center justify-center ${typeColors[item.type]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-background-hover transition-all"
                        >
                          <MoreVertical className="w-4 h-4 text-foreground-muted" />
                        </button>
                        {activeMenu === item.id && (
                          <div className="absolute right-0 top-8 w-40 py-1 rounded-lg bg-popover border border-border-subtle shadow-lg z-10">
                            {[
                              { icon: Edit3, label: "Edit" },
                              { icon: Copy, label: "Duplicate" },
                              { icon: Download, label: "Export" },
                              { icon: Trash2, label: "Delete", danger: true },
                            ].map((action, i) => (
                              <button
                                key={i}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-background-hover transition-colors ${
                                  action.danger ? "text-destructive" : "text-foreground-muted"
                                }`}
                              >
                                <action.icon className="w-4 h-4" />
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-foreground-muted line-clamp-2 mb-4">
                      {item.preview}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-foreground-subtle">
                        <Clock className="w-3 h-3" />
                        {item.updatedAt}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full ${
                        item.status === "complete" 
                          ? "bg-success/10 text-success" 
                          : "bg-warning/10 text-warning"
                      }`}>
                        {item.status === "complete" ? "Complete" : "Draft"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContent.map((item) => {
              const Icon = typeIcons[item.type];
              return (
                <Card key={item.id} variant="interactive" className="group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-background-surface border border-border-subtle flex items-center justify-center flex-shrink-0 ${typeColors[item.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-foreground-muted mt-1">
                        <span className="capitalize">{item.type}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.updatedAt}
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                      item.status === "complete" 
                        ? "bg-success/10 text-success" 
                        : "bg-warning/10 text-warning"
                    }`}>
                      {item.status === "complete" ? "Complete" : "Draft"}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon-sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredContent.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-background-surface border border-border-subtle flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-foreground-muted" />
            </div>
            <h3 className="font-semibold mb-2">No content found</h3>
            <p className="text-sm text-foreground-muted">
              Try adjusting your filters or create something new.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
