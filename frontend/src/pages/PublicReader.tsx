import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPublicContent } from "@/lib/api";
import { Loader2, BookOpen, AlertCircle } from "lucide-react";
import { marked } from "marked";

function Prose({ markdown }: { markdown: string }) {
  const html = marked(markdown) as string;
  return (
    <div
      className="prose prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-li:leading-relaxed max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function PublicReader() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public", slug],
    queryFn: () => getPublicContent(slug!),
    enabled: !!slug,
    retry: false,
  });

  const content = data?.data;

  return (
    <div className="min-h-screen bg-[#0e0e14] text-foreground">
      {/* Minimal nav */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">Artifex</span>
          <span className="ml-auto text-xs text-foreground-muted">Public · Read-only</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link not found</h2>
            <p className="text-foreground-muted text-sm">This link may have been revoked or never existed.</p>
          </div>
        )}

        {content && (
          <article>
            {/* Meta bar */}
            <div className="flex items-center gap-3 mb-8 text-xs text-foreground-muted">
              {content.funnelStage && (
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{content.funnelStage}</span>
              )}
              <span className="capitalize">{content.contentType}</span>
              <span>·</span>
              <span>{new Date(content.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>

            <h1 className="text-3xl font-bold mb-8 leading-tight">{content.title}</h1>

            <Prose markdown={content.body} />

            <div className="mt-16 pt-8 border-t border-white/5 text-xs text-foreground-subtle text-center">
              Shared via <span className="text-primary font-medium">Artifex</span> · Read-only public view
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
