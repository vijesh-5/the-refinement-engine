import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Megaphone, 
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Star,
  TrendingUp,
  Users,
  Briefcase,
  Mail
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
    to: "/app/blog",
  },
  {
    title: "Listicle",
    description: "Scannable numbered list perfect for organic traffic",
    category: "blog",
    icon: FileText,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    popular: true,
    to: "/app/blog",
  },
  {
    title: "Case Study",
    description: "In-depth analysis showing real results and testimonials",
    category: "blog",
    icon: Briefcase,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    popular: false,
    to: "/app/blog",
  },
  {
    title: "Facebook Ad",
    description: "Scroll-stopping copy optimized for Facebook's algorithm",
    category: "ads",
    icon: Megaphone,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    popular: true,
    to: "/app/ads",
  },
  {
    title: "Google Search Ad",
    description: "High-intent copy that maximizes Quality Score",
    category: "ads",
    icon: TrendingUp,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    popular: false,
    to: "/app/ads",
  },
  {
    title: "LinkedIn Sponsored",
    description: "B2B-focused copy for professional audiences",
    category: "ads",
    icon: Users,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    popular: false,
    to: "/app/ads",
  },
  {
    title: "E-commerce Product",
    description: "Conversion-focused description for online stores",
    category: "product",
    icon: ShoppingBag,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    popular: true,
    to: "/app/products",
  },
  {
    title: "SaaS Feature",
    description: "Technical yet accessible feature explanations",
    category: "product",
    icon: Sparkles,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    popular: false,
    to: "/app/products",
  },
  {
    title: "Amazon Listing",
    description: "Optimized for Amazon's A9 search algorithm",
    category: "product",
    icon: Star,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    popular: true,
    to: "/app/products",
  },
];

export default function Templates() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTemplates = activeCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  const popularTemplates = templates.filter(t => t.popular);

  return (
    <AppLayout>
      <div className="app-content">
      <div className="page-header">
        <h1 className="page-title">Templates</h1>
        <p className="page-description">Start with proven frameworks that convert</p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl border transition-all ${
              activeCategory === cat.id
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border-subtle text-foreground-muted hover:border-border hover:bg-background-hover"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Templates */}
      {activeCategory === "all" && (
        <section className="mb-14">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-warning" />
            Popular Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTemplates.map((template, i) => (
              <Card key={i} variant="interactive" className="group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl ${template.bgColor} flex items-center justify-center`}>
                      <template.icon className={`w-7 h-7 ${template.color}`} />
                    </div>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-warning/10 text-warning font-medium">
                      Popular
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-sm text-foreground-muted mb-5 leading-relaxed">
                    {template.description}
                  </p>
                  <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-primary/10 group-hover:text-primary" asChild>
                    <Link to={template.to}>
                      Use template
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Templates */}
      <section>
        <h2 className="text-lg font-semibold mb-6">
          {activeCategory === "all" ? "All Templates" : `${categories.find(c => c.id === activeCategory)?.label}`}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, i) => (
            <Link key={i} to={template.to}>
              <Card variant="interactive" className="group h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${template.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <template.icon className={`w-6 h-6 ${template.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-base mb-1 group-hover:text-primary transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-sm text-foreground-muted line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Custom Template CTA */}
      <Card variant="feature" className="mt-14">
        <CardContent className="p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Need something custom?</h3>
          <p className="text-foreground-muted mb-8 max-w-md mx-auto leading-relaxed">
            Our AI can generate content from any prompt. Just describe what you need.
          </p>
          <Button size="lg" asChild>
            <Link to="/app/blog" className="flex items-center gap-2">
              Create custom template
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
}
