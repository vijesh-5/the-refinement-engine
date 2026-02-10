import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Try Artifex risk-free",
    features: [
      "5 generations per month",
      "All writing tools",
      "Basic templates",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For professionals",
    features: [
      "Unlimited generations",
      "Priority processing",
      "All templates",
      "Export to any format",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32 border-t border-border-subtle">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-foreground-muted text-lg">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-all ${
                plan.popular
                  ? "bg-gradient-to-b from-primary/10 to-background-surface border-2 border-primary/30 shadow-glow"
                  : "bg-background-surface border border-border-subtle"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  plan.popular ? "bg-primary/20 text-primary" : "bg-muted text-foreground-muted"
                }`}>
                  {plan.popular ? <Zap className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-foreground-muted">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-foreground-muted">{plan.period}</span>}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? "bg-primary/20 text-primary" : "bg-success/10 text-success"
                    }`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-foreground-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.popular ? "default" : "outline"} 
                className="w-full" 
                size="lg"
                asChild
              >
                <Link to={plan.popular ? "/signup" : "/app"}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-foreground-subtle mt-8">
          All plans include 14-day money-back guarantee. No questions asked.
        </p>
      </div>
    </section>
  );
}
