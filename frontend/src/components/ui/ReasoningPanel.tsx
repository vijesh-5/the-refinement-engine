import { useState } from "react";
import { Brain, TrendingUp, Target, ChevronDown } from "lucide-react";

export interface ReasoningData {
  reasoningSummary?: string;
  seoInsights?: string;
  conversionInsights?: string;
}

interface ReasoningPanelProps {
  data: ReasoningData;
}

export function ReasoningPanel({ data }: ReasoningPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasData = data.reasoningSummary || data.seoInsights || data.conversionInsights;
  if (!hasData) return null;

  return (
    <div className="border-t border-border-subtle">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-foreground-muted hover:text-foreground hover:bg-background-hover/50 transition-all"
      >
        <span className="flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-medium">AI Reasoning</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expandable Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 space-y-3">
          {/* Reasoning Summary */}
          {data.reasoningSummary && (
            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <div className="flex items-center gap-2 mb-1.5">
                <Brain className="w-3 h-3 text-purple-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">
                  Strategy
                </span>
              </div>
              <p className="text-xs text-foreground-muted leading-relaxed">
                {data.reasoningSummary}
              </p>
            </div>
          )}

          {/* SEO Insights (blog only) */}
          {data.seoInsights && (
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-3 h-3 text-blue-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                  SEO Optimizations
                </span>
              </div>
              <p className="text-xs text-foreground-muted leading-relaxed">
                {data.seoInsights}
              </p>
            </div>
          )}

          {/* Conversion Insights (blog only) */}
          {data.conversionInsights && (
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="w-3 h-3 text-green-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-green-400">
                  Conversion Optimizations
                </span>
              </div>
              <p className="text-xs text-foreground-muted leading-relaxed">
                {data.conversionInsights}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
