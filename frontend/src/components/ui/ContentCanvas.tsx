import { useState, useRef, useEffect, useCallback } from "react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { ReasoningPanel, ReasoningData } from "@/components/ui/ReasoningPanel";
import { stripMarkdown } from "@/lib/markdown";
import { Button } from "@/components/ui/button";
import { SaveContentButton } from "@/components/ui/SaveContentButton";
import {
  Copy,
  Check,
  Download,
  Eye,
  Pencil,
  Maximize2,
  Minimize2,
  AlignLeft,
  Clock,
  ChevronDown,
  FileText,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";

interface ContentCanvasProps {
  /** Current markdown content */
  content: string;
  /** Called when user edits content in the textarea */
  onContentChange: (content: string) => void;
  /** Toggle full-width canvas (hides the left panel) */
  isExpanded: boolean;
  onToggleExpand: () => void;
  /** Save button configuration */
  saveConfig: {
    contentType: "blog" | "ad" | "product";
    getTitle: () => string;
    getGeneratedOutput: () => any;
    getInputData?: () => any;
  };
  /** Optional: content ID for updates (when editing saved content) */
  contentId?: string | null;
  /** Placeholder state when no content has been generated yet */
  emptyState?: React.ReactNode;
  /** Optional: AI reasoning data for transparency panel */
  reasoningData?: ReasoningData;
}

export function ContentCanvas({
  content,
  onContentChange,
  isExpanded,
  onToggleExpand,
  saveConfig,
  emptyState,
  reasoningData,
}: ContentCanvasProps) {
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (mode === "edit" && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [mode, content]);

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const wordCount = content
    ? content.replace(/[#*_`\[\]()>]/g, " ").split(/\s+/).filter((w) => w.length > 1).length
    : 0;

  const readTime = Math.max(1, Math.ceil(wordCount / 230));

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(stripMarkdown(content));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  }, [content]);

  const handleExport = useCallback(
    (format: "md" | "txt") => {
      const text = format === "md" ? content : stripMarkdown(content);
      const ext = format === "md" ? "md" : "txt";
      const title = saveConfig.getTitle().replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "-") || "content";
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowExportMenu(false);
      toast.success(`Exported as .${ext}`);
    },
    [content, saveConfig],
  );

  // ─── No content state ──────────────────────────────────────────────
  if (!content) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        {/* Empty toolbar for visual consistency */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border-subtle bg-background-elevated/50">
          <div />
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="text-foreground-muted"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {emptyState || (
            <div className="h-full flex items-center justify-center p-8">
              <p className="text-foreground-muted">Generate content to start editing</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Canvas with content ───────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col bg-background min-w-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border-subtle bg-background-elevated/50 shrink-0">
        <div className="flex items-center gap-4">
          {/* Edit / Preview tabs */}
          <div className="flex items-center gap-0.5 p-1 rounded-xl bg-background-surface border border-border-subtle">
            <button
              onClick={() => setMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                mode === "preview"
                  ? "bg-primary/10 text-primary"
                  : "text-foreground-muted hover:bg-background-hover"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={() => setMode("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                mode === "edit"
                  ? "bg-primary/10 text-primary"
                  : "text-foreground-muted hover:bg-background-hover"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-foreground-muted">
            <span className="flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5" />
              {wordCount.toLocaleString()} words
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              ~{readTime} min read
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Copy */}
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </Button>

          {/* Export dropdown */}
          <div className="relative" ref={exportRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 py-1.5 rounded-xl bg-popover border border-border-subtle shadow-xl z-50">
                <button
                  onClick={() => handleExport("md")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground-muted hover:bg-background-hover transition-colors"
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  Markdown (.md)
                </button>
                <button
                  onClick={() => handleExport("txt")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground-muted hover:bg-background-hover transition-colors"
                >
                  <FileDown className="w-4 h-4 text-green-400" />
                  Plain text (.txt)
                </button>
              </div>
            )}
          </div>

          {/* Save */}
          <SaveContentButton
            contentType={saveConfig.contentType}
            disabled={!content}
            getTitle={saveConfig.getTitle}
            getBody={() => content}
            getGeneratedOutput={saveConfig.getGeneratedOutput}
            getInputData={saveConfig.getInputData}
          />

          {/* Expand / Collapse */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="text-foreground-muted ml-1"
            title={isExpanded ? "Show input panel" : "Expand canvas"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {mode === "preview" ? (
          <div className="h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto p-8 md:p-12">
              <div className="prose prose-invert prose-headings:text-foreground prose-p:text-foreground-muted prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:text-foreground-muted max-w-none">
                <MarkdownRenderer content={content} />
              </div>
            </div>
          </div>
        ) : (
          /* Edit mode: side-by-side editor + live preview */
          <div className="flex h-full">
            {/* Editor pane */}
            <div className="flex-1 border-r border-border-subtle overflow-y-auto">
              <div className="p-6">
                <div className="text-[10px] uppercase tracking-wider text-foreground-subtle mb-3 font-semibold">Markdown Source</div>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => onContentChange(e.target.value)}
                  className="w-full min-h-[200px] bg-transparent text-foreground-muted leading-relaxed text-sm font-mono resize-none outline-none"
                  placeholder="Start editing your content..."
                  spellCheck
                />
              </div>
            </div>
            {/* Live preview pane */}
            <div className="flex-1 overflow-y-auto bg-background-surface/30">
              <div className="p-6">
                <div className="text-[10px] uppercase tracking-wider text-foreground-subtle mb-3 font-semibold">Live Preview</div>
                <div className="prose prose-invert prose-sm prose-headings:text-foreground prose-p:text-foreground-muted prose-strong:text-foreground max-w-none">
                  <MarkdownRenderer content={content} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Reasoning Panel */}
      {reasoningData && <ReasoningPanel data={reasoningData} />}
    </div>
  );
}
