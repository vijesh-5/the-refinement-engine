import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PenLine, Menu, X } from "lucide-react";
import { useState } from "react";

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border-subtle bg-background/80 backdrop-blur-xl">
      <div className="container-wide">
        <nav className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <PenLine className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Artifex</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#use-cases" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              Use Cases
            </a>
            <Link to="/pricing" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-border-subtle animate-fade-in">
            <div className="flex flex-col gap-5">
              <a href="#how-it-works" className="text-sm text-foreground-muted hover:text-foreground">
                How It Works
              </a>
              <a href="#use-cases" className="text-sm text-foreground-muted hover:text-foreground">
                Use Cases
              </a>
              <Link to="/pricing" className="text-sm text-foreground-muted hover:text-foreground">
                Pricing
              </Link>
              <div className="flex gap-3 pt-5 border-t border-border-subtle">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button size="sm" className="flex-1" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
