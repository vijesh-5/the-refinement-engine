import { Link } from "react-router-dom";
import { PenLine } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle py-12 bg-background-elevated">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <PenLine className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-semibold">Artifex</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-foreground-muted">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-foreground-subtle">
            © 2026 Artifex. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
