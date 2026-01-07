import { Lightbulb, FileEdit, Sparkles, BarChart3, Download } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    title: "Start with your idea",
    description: "Share your topic, angle, or rough thoughts. We'll help shape them into a clear direction.",
  },
  {
    icon: FileEdit,
    title: "Generate a draft",
    description: "Get a structured first draft that captures your voice and resonates with your audience.",
  },
  {
    icon: Sparkles,
    title: "Refine with AI",
    description: "Improve clarity, strengthen arguments, and polish your prose with intelligent suggestions.",
  },
  {
    icon: BarChart3,
    title: "Optimize for results",
    description: "See real-time quality scores for SEO, readability, and persuasion as you write.",
  },
  {
    icon: Download,
    title: "Export and publish",
    description: "Get your polished content ready for any platform, formatted exactly how you need it.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 border-t border-border-subtle">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            From idea to impact in five steps
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            A clear workflow that guides you from rough concept to polished, high-converting content.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-border to-border hidden md:block" />

          <div className="space-y-8 md:space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="relative flex gap-6 md:gap-8 group">
                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-background-surface border border-border-subtle flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary-muted/20 transition-all duration-300">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium text-primary bg-primary-muted/30 px-2 py-1 rounded">
                      Step {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-foreground-muted">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
