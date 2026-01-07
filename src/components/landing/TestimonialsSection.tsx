import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote: "Artifex helped me rewrite our entire website copy in a weekend. Our conversion rate went up 40% the next month.",
    name: "Sarah Chen",
    role: "Founder, Clarity Labs",
    avatar: "SC",
  },
  {
    quote: "Finally, an AI tool that doesn't produce generic fluff. The suggestions actually make my writing stronger.",
    name: "Marcus Rodriguez",
    role: "Head of Content, TechFlow",
    avatar: "MR",
  },
  {
    quote: "We write 50+ product descriptions a week. Artifex cut our time by 70% while keeping our brand voice consistent.",
    name: "Emily Park",
    role: "Ecommerce Director, StyleCo",
    avatar: "EP",
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-spacing border-t border-border-subtle bg-background-elevated">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Trusted by teams that ship
          </h2>
          <p className="text-foreground-muted text-lg">
            Real results from real customers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} variant="default" className="bg-background-surface">
              <CardContent className="p-6">
                {/* Quote */}
                <blockquote className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-muted/50 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{testimonial.name}</div>
                    <div className="text-xs text-foreground-muted">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
