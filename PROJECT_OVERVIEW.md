# 🌟 Artifex: The Refinement Engine

## 📖 Vision Statement
Transform Artifex from a basic AI content generator into an **AI-powered Content Strategy & Growth Intelligence Platform**. The system is designed to not only generate text but also critique, optimize, score, and strategize content to maximize growth and conversion metrics.

Artifex utilizes a **Multi-Agent Refinement Pipeline** to transform raw ideas into high-quality, SEO-optimized, and brand-compliant editorial assets.

---

## ✨ Project Summary
Artifex is a production-grade AI content engine with "Transparency by Design," allowing users to see the underlying AI reasoning and strategy for every piece of content generated.

### Core Architecture
- **Presentation Layer**: A "Glassmorphic" React dashboard (Editorial Studio) built with Vite, TailwindCSS, and React Router.
- **Orchestration Layer**: A Node.js/TypeScript Express backend managing complex multi-agent pipelines and RESTful APIs.
- **Intelligence Layer**: Multiple specialized Gemini/Ollama agents working in sequence to refine output.
- **Memory Layer**: PostgreSQL and Prisma storing brand identities, content versions, and topic graphs.

---

## 🚀 Key Features Implemented & Working

### 🖋️ Specialized Content Generators
- **Intelligent Blog Creator**: Full-page editor with multi-agent refinement (Writer → SEO Critic → Conversion Critic → Synthesizer).
- **Ad Copywriter**: Platform-specific variants (Facebook, Instagram, LinkedIn, Google) with strict character limit enforcement.
- **Product Descriptions**: Conversion-focused storytelling tailored for e-commerce platforms.

### 🛠️ Production Editor & Content Management
- **Split View Editor**: Real-time side-by-side editing (Markdown Source vs. Live Preview).
- **Quality Indicators**: Real-time gauge components showing SEO, Readability, and Engagement scores.
- **AI Reasoning**: Collapsible panel showing "Strategy," "SEO Insights," and "Conversion Insights" for every generation.
- **Content Library**: Centralized repository for all generated content with filtering, sorting, and status tracking.

### 🧠 Intelligence & Brand Systems
- **Brand Memory**: Define brand voice, tone, and banned words — automatically injected into all generated content.
- **Competitor Intelligence**: Analyze competitor URLs to identify messaging gaps and auto-differentiate content.
- **Custom Templates**: Create and manage reusable prompt templates to ensure consistent content generation.

### 📈 Post-Generation & Growth Tools
- **Multi-Format Export**: One-click export of content into PDF, HTML, and Word (DOCX) formats.
- **Public Content Sharing**: Generate secure, read-only public links allowing anyone to view generated content without logging in.
- **Social Media Formatting**: Automatically repurpose content into platform-specific formats (X/Twitter threads, LinkedIn carousels, Instagram captions).
- **A/B Testing Variants**: Generate alternative content variants with specific focus areas (e.g., "stronger CTA", "more casual tone").
- **Content Analytics**: Track content performance trends (Impressions, Clicks, CTR, Position) with Google Search Console synchronization.

### ⚙️ System & Infrastructure
- **Authentication**: JWT-based system with bcrypt password hashing and token rotation for secure access.
- **AI Integration Support**: Configurable pipeline mode (Full/Light/Auto) supporting both Gemini API and local Ollama models.
- **Workspace & Settings**: User profile management, global API key configuration, and system-wide settings.
- **Structured Database**: Robust PostgreSQL schema with Prisma ORM, handling relationships between users, content, metadata, and analytics.

---

## ✅ Completion Status (Production Ready)
- **Frontend Integration**: Complete mapping of all major backend modules (Brands, Competitors, Content, Analytics, Templates, Generators) to interactive UI components.
- **Backend Stability**: Modular architecture with standardized error handling (`asyncHandler`), custom rate limiting, and explicit validation.
- **Security**: Fully protected API routes, isolated user data, and secure handling of external API keys.

*Note: Features that are experimental or unfinished (such as experimental Knowledge Vault capabilities, incomplete Brand Persona workflows, or inactive AI Image Generation) are explicitly excluded from this overview until fully stabilized and tested.*

---

## 📜 License
MIT
