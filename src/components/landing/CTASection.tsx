import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="section-spacing border-t border-border-subtle relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none opacity-50" />

      <div className="container-wide relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Start writing content that converts
          </h2>
          <p className="text-foreground-muted text-lg mb-8">
            No credit card required. Start with 5 free generations and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/app">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="subtle" size="xl" asChild>
              <Link to="#pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
