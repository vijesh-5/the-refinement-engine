# 🌟 Artifex: The Refinement Engine

## 📖 Vision Statement
Transform Artifex from a basic AI content generator into an **AI-powered Content Strategy & Growth Intelligence Platform**. The system is designed to not only generate text but also critique, optimize, score, and strategize content to maximize growth and conversion metrics.

Artifex utilizes a **Multi-Agent Refinement Pipeline** to transform raw ideas into high-quality, SEO-optimized, and brand-compliant editorial assets.

---

## ✨ Project Summary
Artifex has evolved into a production-grade AI content engine with "Transparency by Design," allowing users to see the underlying AI reasoning and strategy for every piece of content generated.

### Core Architecture
- **Presentation Layer**: A "Glassmorphic" React dashboard (Editorial Studio).
- **Orchestration Layer**: A Node.js/TypeScript backend managing complex multi-agent pipelines.
- **Intelligence Layer**: Multiple specialized Gemini/Ollama agents working in sequence to refine output.
- **Memory Layer**: PostgreSQL and Prisma storing brand identities, content versions, and topic graphs.

---

## 🚀 Key Features Implemented

### 🖋️ Specialized Content Generators
- **Intelligent Blog Creator**: Full-page editor with multi-agent refinement (Writer → SEO Critic → Conversion Critic → Synthesizer).
- **Ad Copywriter**: Platform-specific variants (FB, IG, LinkedIn, Google) with character limit enforcement.
- **Product Descriptions**: Conversion-focused storytelling for e-commerce.

### 🛠️ Production Editor (ContentCanvas)
- **Split View**: Real-time side-by-side editing (Markdown Source vs. Live Preview).
- **Quality Indicators**: Real-time gauge components showing SEO, Readability, and Engagement scores.
- **AI Reasoning**: Collapsible panel showing the "Strategy," "SEO Insights," and "Conversion Insights" for every generation.
- **Export**: One-click export to `.md` and `.txt`.

### 🧠 Intelligence System
- **Brand Memory**: Define brand voice, tone, and banned words — auto-injected into all content.
- **Competitor Intelligence**: Analyze competitor URLs to identify messaging gaps and auto-differentiate content.
- **Version Evolution**: "Improve With Goal" system to iteratively refine content (SEO, Clarity, Luxury, etc.).
- **Topic Clustering**: Suggested next content ideas and internal links based on generation history.

---

## ✅ Completion Status (Production Ready)
- **Authentication**: Hardened JWT-based system with bcrypt password hashing and token rotation.
- **AI Integration**: Reusable Gemini Pro integration + native Ollama support for local, credit-free generation.
- **Database**: Robust PostgreSQL schema with Prisma ORM, supporting automated storage and historical tracking.
- **Performance**: Parallelized agent execution (~35% faster) and non-blocking background task processing.
- **Security**: Production-grade rate limiting and structured request telemetry.

---

## 📜 License
MIT
