import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Megaphone, 
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Star,
  TrendingUp,
  Users,
  Briefcase
} from "lucide-react";

const categories = [
  { id: "all", label: "All templates" },
  { id: "blog", label: "Blog posts" },
  { id: "ads", label: "Ad copy" },
  { id: "product", label: "Products" },
  { id: "email", label: "Email" },
];

const templates = [
  {
    title: "How-To Guide",
    description: "Step-by-step tutorial that educates and establishes authority",
    category: "blog",
    icon: FileText,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    popular: true,
  },
  {
    title: "Listicle",
    description: "Scannable numbered list perfect for organic traffic",
    category: "blog",
    icon: FileText,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    popular: true,
  },
  {
    title: "Case Study",
    description: "In-depth analysis showing real results and testimonials",
    category: "blog",
    icon: Briefcase,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    popular: false,
  },
  {
    title: "Facebook Ad",
    description: "Scroll-stopping copy optimized for Facebook's algorithm",
    category: "ads",
    icon: Megaphone,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    popular: true,
  },
  {
    title: "Google Search Ad",
    description: "High-intent copy that maximizes Quality Score",
    category: "ads",
    icon: TrendingUp,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    popular: false,
  },
  {
    title: "LinkedIn Sponsored",
    description: "B2B-focused copy for professional audiences",
    category: "ads",
    icon: Users,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    popular: false,
  },
  {
    title: "E-commerce Product",
    description: "Conversion-focused description for online stores",
    category: "product",
    icon: ShoppingBag,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    popular: true,
  },
  {
    title: "SaaS Feature",
    description: "Technical yet accessible feature explanations",
    category: "product",
    icon: Sparkles,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    popular: false,
  },
  {
    title: "Amazon Listing",
    description: "Optimized for Amazon's A9 search algorithm",
    category: "product",
    icon: Star,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    popular: true,
  },
];

export default function Templates() {
  return (
    <AppLayout>
      <div className="p-6 md:p-10 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Templates</h1>
          <p className="text-foreground-muted">Start with proven frameworks that convert</p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                i === 0
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border-subtle text-foreground-muted hover:border-border hover:bg-background-hover"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Templates */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-warning" />
            Popular Templates
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates
              .filter((t) => t.popular)
              .map((template, i) => (
                <Card key={i} variant="interactive" className="group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${template.bgColor} flex items-center justify-center`}>
                        <template.icon className={`w-6 h-6 ${template.color}`} />
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning font-medium">
                        Popular
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-sm text-foreground-muted mb-4">
                      {template.description}
                    </p>
                    <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-primary/10 group-hover:text-primary">
                      Use template
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* All Templates */}
        <div>
          <h2 className="text-lg font-semibold mb-4">All Templates</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template, i) => (
              <Card key={i} variant="interactive" className="group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${template.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <template.icon className={`w-5 h-5 ${template.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-sm text-foreground-muted line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Template CTA */}
        <Card variant="feature" className="mt-12">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Need something custom?</h3>
            <p className="text-foreground-muted mb-6 max-w-md mx-auto">
              Our AI can generate content from any prompt. Just describe what you need.
            </p>
            <Button>
              Create custom template
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
