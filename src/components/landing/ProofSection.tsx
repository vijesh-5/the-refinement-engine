import { Card, CardContent } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";

const improvements = [
  {
    label: "Clarity",
    before: "We provide solutions that help businesses optimize their operational efficiency and drive growth.",
    after: "We help businesses work smarter and grow faster.",
    improvement: "+68% clearer",
  },
  {
    label: "Conversion",
    before: "Sign up for our newsletter to receive updates.",
    after: "Join 10,000+ marketers getting weekly growth tactics.",
    improvement: "+45% click-through",
  },
  {
    label: "Trust",
    before: "Our product is the best in the market.",
    after: "Rated #1 by 2,000+ verified customers on G2.",
    improvement: "+3.2x credibility",
  },
];

export function ProofSection() {
  return (
    <section id="features" className="section-spacing border-t border-border-subtle bg-background-elevated">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            See the difference intelligence makes
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Real examples of how Artifex transforms good writing into great content.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {improvements.map((item, index) => (
            <Card key={index} variant="feature" className="overflow-hidden">
              <CardContent className="p-6">
                {/* Improvement badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className="text-xs font-semibold text-primary bg-primary-muted/30 px-2 py-1 rounded">
                    {item.improvement}
                  </span>
                </div>

                {/* Before */}
                <div className="mb-4">
                  <span className="text-xs font-medium text-foreground-subtle uppercase tracking-wide">Before</span>
                  <p className="mt-2 text-sm text-foreground-muted line-through decoration-foreground-subtle/30">
                    {item.before}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex justify-center my-4">
                  <ArrowRight className="w-4 h-4 text-primary rotate-90" />
                </div>

                {/* After */}
                <div>
                  <span className="text-xs font-medium text-primary uppercase tracking-wide flex items-center gap-1">
                    <Check className="w-3 h-3" /> After
                  </span>
                  <p className="mt-2 text-sm text-foreground font-medium">
                    {item.after}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
