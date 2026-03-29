import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Share2,
  FlaskConical,
  MessageSquare,
  Copy,
  Trash2,
  Link,
  Link2Off,
  Loader2,
  FileText,
  FileCode2,
  FileType2,
  Twitter,
  Linkedin,
  Instagram,
  Plus,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import {
  getContentItem,
  exportContent,
  createShareLink,
  listShareLinks,
  revokeShareLink,
  formatSocial,
  createVariant,
  listVariants,
  deleteVariant,
  generateImage,
  listAssets,
  deleteAsset,
  ContentAsset,
  ExportFormat,
  SocialPlatform,
} from "@/lib/api";

type Tab = "export" | "share" | "social" | "variants" | "media";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "export", label: "Export", icon: <Download className="w-4 h-4" /> },
  { id: "share", label: "Share", icon: <Share2 className="w-4 h-4" /> },
  { id: "social", label: "Social", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "media", label: "Media", icon: <ImageIcon className="w-4 h-4" /> },
  { id: "variants", label: "A/B Variants", icon: <FlaskConical className="w-4 h-4" /> },
];

// ─── Export Tab ───────────────────────────────────────────────────────────────

function ExportTab({ contentId }: { contentId: string }) {
  const [loading, setLoading] = useState<ExportFormat | null>(null);

  const doExport = async (format: ExportFormat) => {
    setLoading(format);
    try {
      await exportContent(contentId, format);
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch {
      toast.error("Export failed");
    } finally {
      setLoading(null);
    }
  };

  const formats: { format: ExportFormat; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    { format: "pdf", label: "PDF Document", desc: "Formatted, print-ready", icon: <FileType2 className="w-5 h-5" />, color: "text-red-400 bg-red-500/10" },
    { format: "html", label: "HTML File", desc: "Styled web document", icon: <FileCode2 className="w-5 h-5" />, color: "text-orange-400 bg-orange-500/10" },
    { format: "docx", label: "Word Document", desc: "Editable .docx file", icon: <FileText className="w-5 h-5" />, color: "text-blue-400 bg-blue-500/10" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground-muted">Download your content in any format. Exports include funnel stage, objective, and version metadata.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {formats.map(({ format, label, desc, icon, color }) => (
          <Card key={format} variant="interactive" className="group cursor-pointer" onClick={() => doExport(format)}>
            <CardContent className="p-5 flex flex-col items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-foreground-muted">{desc}</p>
              </div>
              {loading === format
                ? <Loader2 className="w-4 h-4 animate-spin text-primary" />
                : <Download className="w-4 h-4 text-foreground-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
              }
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Share Tab ────────────────────────────────────────────────────────────────

function ShareTab({ contentId }: { contentId: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["share-links", contentId],
    queryFn: () => listShareLinks(contentId),
  });
  const links = (data?.data ?? []).filter((l) => l.isActive);

  const createMutation = useMutation({
    mutationFn: () => createShareLink(contentId),
    onSuccess: () => { toast.success("Share link created"); queryClient.invalidateQueries({ queryKey: ["share-links", contentId] }); },
    onError: () => toast.error("Failed to create link"),
  });

  const revokeMutation = useMutation({
    mutationFn: (linkId: string) => revokeShareLink(contentId, linkId),
    onSuccess: () => { toast.success("Link revoked"); queryClient.invalidateQueries({ queryKey: ["share-links", contentId] }); },
    onError: () => toast.error("Failed to revoke link"),
  });

  const copyLink = (url: string) => { navigator.clipboard.writeText(url); toast.success("Link copied!"); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground-muted">Create a public read-only link. Anyone with the link can view this content — no login required.</p>
        <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          New Link
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : links.length === 0 ? (
        <div className="text-center py-10 text-foreground-muted text-sm">No active share links yet.</div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-3 p-4 rounded-xl bg-background-surface border border-border-subtle">
              <Link className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="flex-1 text-sm font-mono text-foreground-muted truncate">{link.shareUrl}</span>
              <Button variant="ghost" size="icon-sm" onClick={() => copyLink(link.shareUrl)} title="Copy"><Copy className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon-sm" onClick={() => revokeMutation.mutate(link.id)} title="Revoke" className="text-destructive hover:text-destructive">
                {revokeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2Off className="w-4 h-4" />}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Social Tab ───────────────────────────────────────────────────────────────

function SocialTab({ body, title }: { body: string; title: string }) {
  const [platform, setPlatform] = useState<SocialPlatform>("x");
  const [result, setResult] = useState<import("@/lib/api").SocialFormats | null>(null);
  const [loading, setLoading] = useState(false);

  const platforms: { id: SocialPlatform; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "x", label: "X Thread", icon: <Twitter className="w-4 h-4" />, color: "text-sky-400 bg-sky-500/10" },
    { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="w-4 h-4" />, color: "text-blue-500 bg-blue-500/10" },
    { id: "caption", label: "Caption", icon: <Instagram className="w-4 h-4" />, color: "text-pink-400 bg-pink-500/10" },
  ];

  const generate = async () => {
    setLoading(true);
    try {
      const res = await formatSocial({ content: body, title, platform });
      setResult(res.data);
    } catch { toast.error("Formatting failed"); }
    finally { setLoading(false); }
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPlatform(p.id); setResult(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                platform === p.id ? `${p.color} border-current` : "border-border-subtle text-foreground-muted hover:bg-background-hover"
              }`}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={generate} disabled={loading} className="ml-auto">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
          Generate
        </Button>
      </div>

      {result && (
        <div className="space-y-3">
          {platform === "x" && result.x?.thread.map((tweet, i) => (
            <div key={i} className="p-4 rounded-xl bg-background-surface border border-border-subtle text-sm relative group">
              <span className="text-xs text-foreground-subtle mb-2 block">{i + 1}/{result.x!.thread.length}</span>
              <p className="leading-relaxed">{tweet}</p>
              <button onClick={() => copy(tweet)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy className="w-3.5 h-3.5 text-foreground-muted" />
              </button>
            </div>
          ))}

          {platform === "linkedin" && result.linkedin?.slides.map((slide, i) => (
            <div key={i} className="p-4 rounded-xl bg-background-surface border border-border-subtle text-sm group relative">
              <p className="font-semibold mb-1">{slide.heading}</p>
              <p className="text-foreground-muted leading-relaxed">{slide.content}</p>
              <button onClick={() => copy(`${slide.heading}\n${slide.content}`)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy className="w-3.5 h-3.5 text-foreground-muted" />
              </button>
            </div>
          ))}

          {platform === "caption" && result.caption && (
            <div className="p-4 rounded-xl bg-background-surface border border-border-subtle text-sm group relative">
              <p className="leading-relaxed mb-3">{result.caption.text}</p>
              <p className="text-primary/80 text-xs">{result.caption.hashtags.join(" ")}</p>
              <button onClick={() => copy(`${result.caption!.text}\n\n${result.caption!.hashtags.join(" ")}`)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy className="w-3.5 h-3.5 text-foreground-muted" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Variants Tab ─────────────────────────────────────────────────────────────

function VariantsTab({ contentId }: { contentId: string }) {
  const queryClient = useQueryClient();
  const [focus, setFocus] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["variants", contentId],
    queryFn: () => listVariants(contentId),
  });
  const variants = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () => createVariant(contentId, { focus: focus.trim() || undefined }),
    onSuccess: () => { toast.success("Variant created"); queryClient.invalidateQueries({ queryKey: ["variants", contentId] }); setFocus(""); },
    onError: () => toast.error("Failed to create variant"),
  });

  const deleteMutation = useMutation({
    mutationFn: (variantId: string) => deleteVariant(contentId, variantId),
    onSuccess: () => { toast.success("Variant deleted"); queryClient.invalidateQueries({ queryKey: ["variants", contentId] }); },
    onError: () => toast.error("Failed to delete variant"),
  });

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-background-surface border border-border-subtle space-y-3">
        <p className="text-sm font-medium">Create a new variant</p>
        <input
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="Focus area (optional) — e.g. 'stronger CTA', 'casual tone', 'shorter'"
          className="w-full h-10 px-4 rounded-xl bg-input border border-border-subtle text-sm focus:outline-none focus:border-primary/50"
        />
        <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FlaskConical className="w-4 h-4 mr-2" />}
          Generate Variant
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : variants.length === 0 ? (
        <p className="text-center text-sm text-foreground-muted py-8">No variants yet. The original is treated as Variant A.</p>
      ) : (
        <div className="space-y-3">
          {variants.map((v) => (
            <div key={v.id} className="p-4 rounded-xl bg-background-surface border border-border-subtle">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">Variant {v.variantLabel}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => navigator.clipboard.writeText(v.contentText).then(() => toast.success("Copied!"))}><Copy className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(v.id)}>
                    {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-foreground-muted line-clamp-4 leading-relaxed font-mono">
                {v.contentText.slice(0, 300)}…
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Media Tab ────────────────────────────────────────────────────────────────

function MediaTab({ contentId }: { contentId: string }) {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["assets", contentId],
    queryFn: () => listAssets(contentId),
  });
  const assets = data?.data ?? [];

  const genMutation = useMutation({
    mutationFn: () => generateImage(contentId, prompt.trim() || undefined),
    onSuccess: () => {
      toast.success("Image generated successfully");
      queryClient.invalidateQueries({ queryKey: ["assets", contentId] });
      setPrompt("");
    },
    onError: (err: any) => toast.error(err.message || "Failed to generate image. Check OPENAI_API_KEY."),
  });

  const deleteMutation = useMutation({
    mutationFn: (assetId: string) => deleteAsset(contentId, assetId),
    onSuccess: () => {
      toast.success("Asset deleted");
      queryClient.invalidateQueries({ queryKey: ["assets", contentId] });
    },
    onError: () => toast.error("Failed to delete asset"),
  });

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-background-surface border border-border-subtle space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">Generate AI Image</p>
          <p className="text-xs text-foreground-muted mb-3">Uses DALL-E 3 to create a high-quality featured image based on your content.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Custom prompt (optional) — e.g. 'A futuristic city at sunset'"
            className="flex-1 h-10 px-4 rounded-xl bg-input border border-border-subtle text-sm focus:outline-none focus:border-primary/50"
          />
          <Button onClick={() => genMutation.mutate()} disabled={genMutation.isPending}>
            {genMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
            Generate Image
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : assets.length === 0 ? (
        <p className="text-center text-sm text-foreground-muted py-8">No images generated yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <div key={asset.id} className="group relative rounded-xl overflow-hidden border border-border-subtle aspect-square bg-background-surface">
              <img src={asset.url} alt="Generated" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="ghost" size="icon-sm" className="text-white hover:bg-white/20" onClick={() => window.open(asset.url, "_blank")}>
                  <Plus className="w-4 h-4 rotate-45" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-white hover:bg-destructive/80"
                  onClick={() => deleteMutation.mutate(asset.id)}
                >
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("export");

  const { data, isLoading } = useQuery({
    queryKey: ["content-item", id],
    queryFn: () => getContentItem(id!),
    enabled: !!id,
  });
  const item = data?.data;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="app-content flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!item) {
    return (
      <AppLayout>
        <div className="app-content text-center py-20 text-foreground-muted">Content not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="app-content">
        {/* Header */}
        <div className="page-header">
          <button
            onClick={() => navigate("/app/content")}
            className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Library
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="page-title">{item.title}</h1>
              <p className="page-description capitalize">{item.contentType} · {item.status}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-background-surface border border-border-subtle rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground-muted hover:bg-background-hover"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "export" && <ExportTab contentId={id!} />}
          {activeTab === "share" && <ShareTab contentId={id!} />}
          {activeTab === "social" && <SocialTab body={item.body} title={item.title} />}
          {activeTab === "media" && <MediaTab contentId={id!} />}
          {activeTab === "variants" && <VariantsTab contentId={id!} />}
        </div>
      </div>
    </AppLayout>
  );
}
