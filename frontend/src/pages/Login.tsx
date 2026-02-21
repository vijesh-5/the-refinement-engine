import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenLine, ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/api";
import { toast } from "sonner";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: any) => login(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Welcome back!");
        navigate("/app");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Invalid email or password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    mutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2.5 mb-14">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
              <PenLine className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Artifex</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Welcome back
          </h1>
          <p className="text-foreground-muted text-lg mb-10">
            Sign in to continue creating.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground-muted block mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-subtle" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-12 h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground-muted">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:text-primary-hover transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-subtle" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-12 pr-12 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base" 
              size="lg"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing in..." : "Sign in"}
              {!mutation.isPending && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-foreground-muted">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:text-primary-hover font-medium transition-colors">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-background-elevated to-background items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-50" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center max-w-md">
          <div className="w-24 h-24 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto mb-10 shadow-glow">
            <PenLine className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-semibold mb-5">Write with confidence</h2>
          <p className="text-foreground-muted text-lg leading-relaxed">
            Join thousands of creators using Artifex to craft content that converts.
          </p>
        </div>
      </div>
    </div>
  );
}
