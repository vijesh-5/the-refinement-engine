import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Mail, 
  Key, 
  Bell, 
  Palette, 
  CreditCard, 
  Shield,
  ChevronRight,
  Check
} from "lucide-react";

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "preferences", label: "Preferences", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-10 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Settings</h1>
          <p className="text-foreground-muted">Manage your account and preferences</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-48 flex-shrink-0">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
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
          <div className="flex-1">
            {activeTab === "account" && (
              <div className="space-y-6">
                <Card variant="default">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-6">Profile Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xl font-semibold text-primary">JD</span>
                        </div>
                        <Button variant="outline" size="sm">Change photo</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground-muted block mb-2">
                            First name
                          </label>
                          <Input defaultValue="John" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground-muted block mb-2">
                            Last name
                          </label>
                          <Input defaultValue="Doe" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground-muted block mb-2">
                          Email
                        </label>
                        <Input type="email" defaultValue="john@example.com" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="default">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground-muted block mb-2">
                          Current password
                        </label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground-muted block mb-2">
                          New password
                        </label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleSave}>
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
                <CardContent className="p-6 space-y-6">
                  <h3 className="font-semibold">Writing Preferences</h3>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground-muted block mb-3">
                      Default tone
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Professional", "Conversational", "Bold", "Friendly", "Technical"].map((tone) => (
                        <button
                          key={tone}
                          className="px-4 py-2 text-sm rounded-lg border border-border-subtle hover:border-primary/50 hover:bg-primary/5 transition-colors first:bg-primary/10 first:border-primary/30 first:text-primary"
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground-muted block mb-3">
                      Default word count
                    </label>
                    <div className="flex gap-2">
                      {["500", "1000", "1500", "2000"].map((count, i) => (
                        <button
                          key={count}
                          className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
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

            {activeTab === "notifications" && (
              <Card variant="default">
                <CardContent className="p-6 space-y-6">
                  <h3 className="font-semibold">Notification Settings</h3>
                  
                  {[
                    { title: "Weekly digest", desc: "Summary of your content performance" },
                    { title: "Product updates", desc: "New features and improvements" },
                    { title: "Tips & tutorials", desc: "Learn to get more from Artifex" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
                      <div>
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-sm text-foreground-muted">{item.desc}</div>
                      </div>
                      <button
                        className={`w-12 h-6 rounded-full transition-colors ${
                          i === 0 ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          i === 0 ? "translate-x-6" : "translate-x-0.5"
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
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-foreground-muted mb-1">Current plan</div>
                        <div className="text-xl font-semibold">Pro</div>
                        <div className="text-sm text-foreground-muted mt-1">$29/month • Renews Jan 15, 2025</div>
                      </div>
                      <Button variant="outline">Change plan</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="default">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Payment method</h3>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-background-surface border border-border-subtle">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-7 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">VISA</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">•••• •••• •••• 4242</div>
                          <div className="text-xs text-foreground-muted">Expires 12/26</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="default">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Usage this month</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-foreground-muted">Generations</span>
                          <span className="font-medium">47 / Unlimited</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full w-1/2 bg-gradient-to-r from-primary to-purple-400 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <Card variant="default">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Two-factor authentication</h3>
                    <p className="text-sm text-foreground-muted mb-4">
                      Add an extra layer of security to your account.
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </CardContent>
                </Card>

                <Card variant="default">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Active sessions</h3>
                    <div className="space-y-3">
                      {[
                        { device: "MacBook Pro", location: "San Francisco, CA", current: true },
                        { device: "iPhone 15", location: "San Francisco, CA", current: false },
                      ].map((session, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background-surface border border-border-subtle">
                          <div>
                            <div className="text-sm font-medium flex items-center gap-2">
                              {session.device}
                              {session.current && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-foreground-muted">{session.location}</div>
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
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-destructive mb-2">Danger zone</h3>
                    <p className="text-sm text-foreground-muted mb-4">
                      Once you delete your account, there is no going back.
                    </p>
                    <Button variant="destructive" size="sm">Delete account</Button>
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
