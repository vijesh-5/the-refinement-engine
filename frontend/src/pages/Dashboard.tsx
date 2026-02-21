import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  PenLine, 
  Megaphone, 
  ShoppingBag, 
  ArrowRight, 
  Clock, 
  Sparkles,
  FileText,
  TrendingUp,
  Briefcase
} from "lucide-react";

const quickActions = [
  {
    icon: PenLine,
    title: "Blog Creator",
    description: "Write long-form content that ranks and converts",
    to: "/app/blog",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Megaphone,
    title: "Ad Copywriter",
    description: "Generate high-converting ad variations",
    to: "/app/ads",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: ShoppingBag,
    title: "Product Descriptions",
    description: "Create persuasive copy that sells",
    to: "/app/products",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Briefcase,
    title: "Brand Identity",
    description: "Define your voice, audience, and banned words",
    to: "/app/brands",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
];

const recentContent = [
  {
    title: "10 Ways to Improve Your Landing Page Conversions",
    type: "Blog Post",
    updatedAt: "2 hours ago",
    status: "Draft",
    to: "/app/blog",
  },
  {
    title: "Summer Sale Campaign - Facebook",
    type: "Ad Copy",
    updatedAt: "Yesterday",
    status: "Complete",
    to: "/app/ads",
  },
  {
    title: "Premium Leather Messenger Bag",
    type: "Product",
    updatedAt: "3 days ago",
    status: "Complete",
    to: "/app/products",
  },
];

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.firstName || "there";

  return (
    <AppLayout>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Welcome back, {userName}</h1>
        <p className="page-description">What would you like to create today?</p>
      </div>

      {/* Quick Actions */}
      <section className="mb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to} className="block">
              <Card variant="interactive" className="h-full group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${action.color}`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-foreground-muted leading-relaxed">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Work */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Continue where you left off</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/content" className="flex items-center gap-2">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {recentContent.map((item, index) => (
            <Link key={index} to={item.to}>
              <Card variant="interactive" className="hover:border-primary/30">
                <CardContent className="p-5 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-background-surface border border-border-subtle flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-foreground-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base truncate mb-1">{item.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-foreground-muted">
                      <span>{item.type}</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {item.updatedAt}
                      </span>
                    </div>
                  </div>
                  <span className={`text-sm px-3 py-1.5 rounded-full flex-shrink-0 ${
                    item.status === 'Complete' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {item.status}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Usage Stats */}
      <section>
        <Card variant="default" className="overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">This month's activity</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-8 mb-10">
              <div>
                <div className="text-3xl font-bold mb-1">47</div>
                <div className="text-sm text-foreground-muted">Pieces created</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">12.4k</div>
                <div className="text-sm text-foreground-muted">Words written</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">3.2h</div>
                <div className="text-sm text-foreground-muted">Time saved</div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-border-subtle">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-foreground-muted">Monthly usage</span>
                <span className="font-medium">47 / 100 generations</span>
              </div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '47%' }} />
              </div>
              <p className="text-xs text-foreground-subtle mt-3">
                Resets in 12 days · <Link to="/pricing" className="text-primary hover:underline">Upgrade for unlimited</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
}
