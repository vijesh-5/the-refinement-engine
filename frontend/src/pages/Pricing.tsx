import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for trying Artifex",
    icon: Sparkles,
    features: [
      "5 generations per month",
      "Blog Creator access",
      "Ad Copywriter access",
      "Community support",
    ],
    cta: "Get Started",
    ctaVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For professionals who create regularly",
    icon: Zap,
    features: [
      "Unlimited generations",
      "All writing tools",
      "Priority AI processing",
      "Export in all formats",
      "Content library",
      "Email support",
    ],
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    popular: true,
  },
  {
    name: "Team",
    price: "$79",
    period: "/month",
    description: "For teams that scale content",
    icon: Crown,
    features: [
      "Everything in Pro",
      "5 team members",
      "Brand voice training",
      "Template library",
      "Analytics dashboard",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    popular: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      
      <main className="pt-32 pb-24 md:pt-44 md:pb-32">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        
        <div className="container-wide relative z-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
              Simple, transparent pricing
            </h1>
            <p className="text-lg md:text-xl text-foreground-muted leading-relaxed">
              Start free. Upgrade when you need more power. No hidden fees, no surprises.
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-b from-primary/10 to-background-surface border-2 border-primary/30 shadow-glow scale-105"
                    : "bg-background-surface border border-border-subtle hover:border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                    plan.popular 
                      ? "bg-primary/20 text-primary" 
                      : "bg-background-hover text-foreground-muted"
                  }`}>
                    <plan.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-foreground-muted">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-foreground-muted text-lg">{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.popular 
                          ? "bg-primary/20 text-primary" 
                          : "bg-success/10 text-success"
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-foreground-muted">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={plan.ctaVariant} 
                  className="w-full" 
                  size="lg"
                  asChild
                >
                  <Link to="/signup">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-32 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
              Frequently asked questions
            </h2>
            <div className="space-y-5">
              {[
                {
                  q: "Can I cancel anytime?",
                  a: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
                },
                {
                  q: "What happens to my content if I downgrade?",
                  a: "Your content is always yours. If you downgrade, you'll still have access to everything you've created."
                },
                {
                  q: "Do you offer a refund?",
                  a: "We offer a 14-day money-back guarantee. If you're not satisfied, just reach out and we'll refund your payment."
                },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-background-surface border border-border-subtle">
                  <h3 className="font-semibold text-lg mb-3">{item.q}</h3>
                  <p className="text-foreground-muted leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
