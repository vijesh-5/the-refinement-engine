import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Rocket, Target, ShoppingCart } from "lucide-react";

const useCases = [
  {
    icon: Rocket,
    title: "Founders",
    description: "Pitch decks, landing pages, and investor updates that build confidence and close deals.",
    features: ["Product positioning", "Investor communications", "Launch announcements"],
    cta: "For Founders",
  },
  {
    icon: Target,
    title: "Marketers",
    description: "Blog posts, ad copy, and email campaigns that drive engagement and conversions.",
    features: ["SEO-optimized content", "Multi-channel campaigns", "A/B test variations"],
    cta: "For Marketers",
  },
  {
    icon: ShoppingCart,
    title: "Ecommerce",
    description: "Product descriptions and category pages that turn browsers into buyers.",
    features: ["Conversion-focused copy", "Bulk generation", "Brand voice consistency"],
    cta: "For Ecommerce",
  },
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="section-spacing border-t border-border-subtle">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Built for people who care about quality
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Whether you're pitching investors, launching campaigns, or selling products—Artifex adapts to your goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {useCases.map((useCase, index) => (
            <Card key={index} variant="interactive" className="group">
              <CardContent className="p-6">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary-muted/30 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary-muted/50 transition-colors">
                  <useCase.icon className="w-5 h-5 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                <p className="text-foreground-muted mb-6">{useCase.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {useCase.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button variant="ghost" className="w-full justify-between group-hover:bg-background-hover" asChild>
                  <Link to="/app">
                    {useCase.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
