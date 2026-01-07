import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenLine, ArrowRight, Mail, Lock, User, Eye, EyeOff, Check } from "lucide-react";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const passwordStrength = password.length >= 8 ? "strong" : password.length >= 4 ? "medium" : "weak";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-background via-background-elevated to-primary/5 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-30" />
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-semibold mb-6">
            Start creating content that converts
          </h2>
          <div className="space-y-4">
            {[
              "Generate blog posts, ads, and product descriptions",
              "Real-time quality scoring and optimization",
              "Export to any format, publish anywhere",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground-muted">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <PenLine className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Artifex</span>
          </Link>

          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Create your account
          </h1>
          <p className="text-foreground-muted mb-8">
            Start your free trial. No credit card required.
          </p>

          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground-muted block mb-2">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-subtle" />
                <Input
                  type="text"
                  placeholder="Your name"
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground-muted block mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-subtle" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground-muted block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-subtle" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength === "strong" 
                          ? "w-full bg-success" 
                          : passwordStrength === "medium" 
                            ? "w-2/3 bg-warning" 
                            : "w-1/3 bg-destructive"
                      }`} 
                    />
                  </div>
                  <span className={`text-xs capitalize ${
                    passwordStrength === "strong" 
                      ? "text-success" 
                      : passwordStrength === "medium" 
                        ? "text-warning" 
                        : "text-destructive"
                  }`}>
                    {passwordStrength}
                  </span>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg">
              Create account
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-xs text-foreground-subtle text-center">
              By signing up, you agree to our{" "}
              <Link to="/terms" className="text-foreground-muted hover:text-foreground transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-foreground-muted hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </p>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-foreground-muted">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
