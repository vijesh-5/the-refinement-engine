import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlatforms, upsertPlatform, deletePlatform, ConnectedPlatform } from "@/lib/api";
import { toast } from "sonner";
import { 
  User, 
  Bell, 
  Palette, 
  CreditCard, 
  Shield,
  Check,
  Plug,
  Mail,
  Trash2,
  Loader2
} from "lucide-react";

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "preferences", label: "Preferences", icon: Palette },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
];

function IntegrationsTab() {
  const queryClient = useQueryClient();
  const [bearEmail, setBearEmail] = useState("");

  const { data: platformsRes, isLoading } = useQuery({
    queryKey: ["platforms"],
    queryFn: getPlatforms,
  });

  const platforms = platformsRes?.data ?? [];
  const bearBlog = platforms.find((p: ConnectedPlatform) => p.platformName === "BEAR_BLOG");

  const upsertMutation = useMutation({
    mutationFn: () =>
      upsertPlatform({
        platformName: "BEAR_BLOG",
        credentials: { email: bearEmail },
        isActive: true,
      }),
    onSuccess: () => {
      toast.success("Bear Blog connected successfully!");
      queryClient.invalidateQueries({ queryKey: ["platforms"] });
      setBearEmail("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlatform(id),
    onSuccess: () => {
      toast.success("Bear Blog disconnected");
      queryClient.invalidateQueries({ queryKey: ["platforms"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <Card variant="default">
        <CardContent className="p-8">
          <h3 className="font-semibold text-lg mb-2">Connected Platforms</h3>
          <p className="text-sm text-foreground-muted mb-8">
            Connect your publishing platforms to distribute content directly from Artifex.
          </p>

          {/* Bear Blog */}
          <div className="p-5 rounded-xl bg-background-surface border border-border-subtle">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold">Bear Blog</h4>
                  {bearBlog && (
                    <span className={`text-xs px-2.5 py-1 rounded-full ${
                      bearBlog.isActive
                        ? "bg-success/10 text-success"
                        : "bg-muted text-foreground-muted"
                    }`}>
                      {bearBlog.isActive ? "Connected" : "Inactive"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground-muted mb-4">
                  Publish drafts via email to your Bear Blog. Enter your secret Bear Blog email address below.
                </p>

                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-foreground-muted">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                  </div>
                ) : bearBlog ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-background border border-border-subtle">
                      <Mail className="w-4 h-4 text-foreground-subtle" />
                      <span className="text-sm font-mono truncate">{(bearBlog.credentials as Record<string, string>).email}</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(bearBlog.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Input
                      type="email"
                      placeholder="your-secret@bearblog.dev"
                      value={bearEmail}
                      onChange={(e) => setBearEmail(e.target.value)}
                      className="h-11 flex-1"
                    />
                    <Button
                      onClick={() => upsertMutation.mutate()}
                      disabled={!bearEmail || upsertMutation.isPending}
                    >
                      {upsertMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Future platforms */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: "X (Twitter)", desc: "Coming soon", color: "from-sky-500/20 to-blue-500/10 border-sky-500/20" },
              { name: "Reddit", desc: "Coming soon", color: "from-red-500/20 to-orange-500/10 border-red-500/20" },
            ].map((p) => (
              <div
                key={p.name}
                className="p-4 rounded-xl bg-background-surface/50 border border-border-subtle opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                    <Plug className="w-4 h-4 text-foreground-muted" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-foreground-muted">{p.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout>
      <div className="app-content">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <nav className="lg:w-56 flex-shrink-0">
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-foreground-muted hover:bg-background-hover hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {activeTab === "account" && (
            <div className="space-y-6">
              <Card variant="default">
                <CardContent className="p-8">
                  <h3 className="font-semibold text-lg mb-8">Profile Information</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <span className="text-2xl font-semibold text-primary">JD</span>
                      </div>
                      <Button variant="outline">Change photo</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-medium text-foreground-muted block mb-2">
                          First name
                        </label>
                        <Input defaultValue="John" className="h-11" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground-muted block mb-2">
                          Last name
                        </label>
                        <Input defaultValue="Doe" className="h-11" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground-muted block mb-2">
                        Email
                      </label>
                      <Input type="email" defaultValue="john@example.com" className="h-11" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="p-8">
                  <h3 className="font-semibold text-lg mb-6">Change Password</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-medium text-foreground-muted block mb-2">
                        Current password
                      </label>
                      <Input type="password" placeholder="••••••••" className="h-11" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground-muted block mb-2">
                        New password
                      </label>
                      <Input type="password" placeholder="••••••••" className="h-11" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button size="lg" onClick={handleSave}>
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <Card variant="default">
              <CardContent className="p-8 space-y-8">
                <h3 className="font-semibold text-lg">Writing Preferences</h3>
                
                <div>
                  <label className="text-sm font-medium text-foreground-muted block mb-4">
                    Default tone
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["Professional", "Conversational", "Bold", "Friendly", "Technical"].map((tone, i) => (
                      <button
                        key={tone}
                        className={`px-5 py-2.5 text-sm rounded-xl border transition-colors ${
                          i === 0
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "border-border-subtle hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground-muted block mb-4">
                    Default word count
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["500", "1000", "1500", "2000"].map((count, i) => (
                      <button
                        key={count}
                        className={`px-5 py-2.5 text-sm rounded-xl border transition-colors ${
                          i === 1
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "border-border-subtle hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {count} words
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "integrations" && <IntegrationsTab />}

          {activeTab === "notifications" && (
            <Card variant="default">
              <CardContent className="p-8 space-y-2">
                <h3 className="font-semibold text-lg mb-6">Notification Settings</h3>
                
                {[
                  { title: "Weekly digest", desc: "Summary of your content performance", enabled: true },
                  { title: "Product updates", desc: "New features and improvements", enabled: false },
                  { title: "Tips & tutorials", desc: "Learn to get more from Artifex", enabled: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-5 border-b border-border-subtle last:border-0">
                    <div>
                      <div className="font-medium mb-1">{item.title}</div>
                      <div className="text-sm text-foreground-muted">{item.desc}</div>
                    </div>
                    <button
                      className={`w-14 h-7 rounded-full transition-colors relative ${
                        item.enabled ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                        item.enabled ? "right-1" : "left-1"
                      }`} />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <Card variant="feature">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="text-sm text-foreground-muted mb-1">Current plan</div>
                      <div className="text-2xl font-semibold">Pro</div>
                      <div className="text-sm text-foreground-muted mt-1">$29/month • Renews Jan 15, 2025</div>
                    </div>
                    <Button variant="outline" asChild>
                      <Link to="/pricing">Change plan</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="p-8">
                  <h3 className="font-semibold text-lg mb-6">Payment method</h3>
                  <div className="flex items-center justify-between p-5 rounded-xl bg-background-surface border border-border-subtle">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">VISA</span>
                      </div>
                      <div>
                        <div className="font-medium">•••• •••• •••• 4242</div>
                        <div className="text-sm text-foreground-muted">Expires 12/26</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="p-8">
                  <h3 className="font-semibold text-lg mb-6">Usage this month</h3>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-foreground-muted">Generations</span>
                      <span className="font-medium">47 / Unlimited</span>
                    </div>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: '50%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <Card variant="default">
                <CardContent className="p-8">
                  <h3 className="font-semibold text-lg mb-4">Two-factor authentication</h3>
                  <p className="text-foreground-muted mb-6">
                    Add an extra layer of security to your account.
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardContent className="p-8">
                  <h3 className="font-semibold text-lg mb-6">Active sessions</h3>
                  <div className="space-y-4">
                    {[
                      { device: "MacBook Pro", location: "San Francisco, CA", current: true },
                      { device: "iPhone 15", location: "San Francisco, CA", current: false },
                    ].map((session, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-background-surface border border-border-subtle">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {session.device}
                            {session.current && (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-foreground-muted">{session.location}</div>
                        </div>
                        {!session.current && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card variant="default" className="border-destructive/30">
                <CardContent className="p-8">
                  <h3 className="font-semibold text-lg text-destructive mb-3">Danger zone</h3>
                  <p className="text-foreground-muted mb-6">
                    Once you delete your account, there is no going back.
                  </p>
                  <Button variant="destructive">Delete account</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
