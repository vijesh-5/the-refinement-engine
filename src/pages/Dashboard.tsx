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
  FileText
} from "lucide-react";

const quickActions = [
  {
    icon: PenLine,
    title: "Blog Creator",
    description: "Write long-form content that ranks and converts",
    to: "/app/blog",
    color: "text-purple-400",
  },
  {
    icon: Megaphone,
    title: "Ad Copywriter",
    description: "Generate high-converting ad variations",
    to: "/app/ads",
    color: "text-blue-400",
  },
  {
    icon: ShoppingBag,
    title: "Product Descriptions",
    description: "Create persuasive copy that sells",
    to: "/app/products",
    color: "text-green-400",
  },
];

const recentContent = [
  {
    title: "10 Ways to Improve Your Landing Page Conversions",
    type: "Blog Post",
    updatedAt: "2 hours ago",
    status: "Draft",
  },
  {
    title: "Summer Sale Campaign - Facebook",
    type: "Ad Copy",
    updatedAt: "Yesterday",
    status: "Complete",
  },
  {
    title: "Premium Leather Messenger Bag",
    type: "Product",
    updatedAt: "3 days ago",
    status: "Complete",
  },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="p-6 md:p-10 max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Welcome back</h1>
          <p className="text-foreground-muted">What would you like to create today?</p>
        </div>

        {/* Quick Actions */}
        <section className="mb-12">
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to}>
                <Card variant="interactive" className="h-full group">
                  <CardContent className="p-6">
                    <div className={`w-10 h-10 rounded-lg bg-background-surface border border-border-subtle flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors ${action.color}`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-foreground-muted">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Work */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Continue where you left off</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/content">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {recentContent.map((item, index) => (
              <Card key={index} variant="interactive">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-background-surface border border-border-subtle flex items-center justify-center">
                    <FileText className="w-4 h-4 text-foreground-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-foreground-muted mt-1">
                      <span>{item.type}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.updatedAt}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.status === 'Complete' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {item.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Usage Stats */}
        <section>
          <Card variant="default">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">This month</h3>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-semibold">47</div>
                  <div className="text-sm text-foreground-muted">Pieces created</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">12.4k</div>
                  <div className="text-sm text-foreground-muted">Words written</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">3.2h</div>
                  <div className="text-sm text-foreground-muted">Time saved</div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-foreground-muted">Monthly usage</span>
                  <span className="font-medium">47 / 100</span>
                </div>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: '47%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
}
