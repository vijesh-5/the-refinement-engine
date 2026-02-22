# Artifex: The Refinement Engine - Technical Report

## 1. Product Vision
**Artifex** is a production-grade AI content engine that goes beyond simple prompting. It utilizes a **Multi-Agent Refinement Pipeline** to transform raw ideas into high-quality, SEO-optimized, and brand-compliant editorial assets.

The system is designed to provide "Transparency by Design," allowing users to see the underlying AI reasoning and strategy for every piece of content generated.

---

## 2. Technical Stack

### Frontend
- **Core:** React 18 with Vite, TypeScript.
- **Styling:** Tailwind CSS (Custom "Refined" design system with 4px muted scrollbars, fixed layouts, and high information density).
- **State Management:** TanStack Query (React Query) for robust API synchronization and caching.
- **Editor:** Custom **ContentCanvas** with split-edit mode, live markdown preview, word count, and reading time estimation.
- **Icons & UI:** Lucide React + custom-styled shadcn/ui components.

### Backend
- **Core:** Node.js, Express, TypeScript.
- **ORM:** Prisma with PostgreSQL.
- **AI Orchestration:** Native Gemini Pro integration + **Ollama** support for local, credit-free generation (llama3:8b).
- **Intelligence Layer:** 
  - Hierarchical Agent Pipeline (Writer → Critics → Synthesizer).
  - Background Task Processing (Topic suggestions).
  - Competitor Scraping & Intelligence extraction.

---

## 3. Core System Architecture

### 3.1 The Multi-Agent Pipeline (The Brain)
Every blog post is generated through a 4-step refinement process:
1. **Writer Agent:** Creates a high-quality initial draft based on user specifications.
2. **SEO Critic (Parallel):** Analyzes the draft for keyword density, heading hierarchy, and linking opportunities.
3. **Conversion Critic (Parallel):** Evaluates emotional triggers, CTA strength, and audience alignment.
4. **Synthesizer Agent:** Merges the draft with feedback from both critics, ensuring brand compliance and competitor differentiation.

### 3.2 Brand Identity Memory
The system maintains a "Brand Memory" that injects personality into every output. This includes:
- Brand Tone and Voice guidelines.
- Target Audience personas.
- **Banned Words:** Real-time enforcement of vocabulary restrictions.

### 3.3 Competitor Intelligence
A specialized service that allows users to track competitors and automatically injects "Counter-Narrative" logic into the AI pipeline to exploit competitor weaknesses.

---

## 4. Key Features Implemented

### 🖋️ Specialized Content Generators
- **Intelligent Blog Creator:** Full-page editor with multi-agent refinement.
- **Ad Copywriter:** Platform-specific variants (FB, IG, LinkedIn, Google) with character limit enforcement.
- **Product Descriptions:** Conversion-focused storytelling for e-commerce.

### 🛠️ Production Editor (ContentCanvas)
- **Split View:** Real-time side-by-side editing (Markdown Source vs. Live Preview).
- **Metrics:** Instant character count, word count, and reading time tracking.
- **AI Reasoning:** Collapsible panel showing the "Strategy," "SEO Insights," and "Conversion Insights" for every generation.
- **Export:** One-click export to `.md` and `.txt`.

### 📚 Library & Versioning
- **Centralized Hub:** All generated content is saved and accessible.
- **Deep Linking:** "Open in Editor" restores the exact state of a generation (including inputs).
- **Version Control:** History of changes for every document.

---

## 5. API Architecture

### Generation Endpoints (`/api/generate`)
- `POST /blog`: Triggers the multi-agent blog pipeline.
- `POST /ad`: Generates multi-variant ad copy.
- `POST /product`: Creates structured product descriptions.
- `GET /topics`: Provides AI-generated topic suggestions based on user history.

### Management Endpoints
- `/api/content`: CRUD operations for saved content + versioning.
- `/api/brands`: Manage brand profiles and voice guidelines.
- `/api/competitors`: Track competitor URLs and extract intelligence.
- `/api/auth`: Secure JWT-based authentication.

---

## 6. Performance Optimizations
- **Parallel Execution:** SEO and Conversion agents run concurrently, reducing generation latency by ~35%.
- **Background Processing:** Topic suggestions are generated via fire-and-forget logic, ensuring the main UI remains responsive.
- **Fixed-Height Shell:** Optimized layout prevents layout shift and ensures a professional "SaaS Desktop" feel.

---

## 7. Maintenance & Security
The system captures production-grade metrics and enforces safety through multiple layers:

### 🛡️ Rate Limiting
- **Global Limiter:** Protects all endpoints at 100 requests per 15 minutes.
- **Generation Limiter:** Stricter threshold of 10 requests per 15 minutes specifically for AI generation endpoints to preserve API credits and prevent abuse.

### 📝 Structured Logging
- **Request Metadata:** Every HTTP request logs method, path, status code, and response time.
- **Pipeline Health:** Real-time logging of multi-agent phase durations (Writer → Critics → Synthesizer).
- **Environment Hardening:** Startup validation ensures required keys exist and warns about weak JWT secrets.

---

## 8. Operational Status
- ✅ **Bridge Sprint Complete:** All frontend forms are fully connected to real backend services.
- ✅ **Infrastructure Locked:** Environment variables manage API keys and local Ollama toggles.
- ✅ **Production Ready:** Rate limiting and request telemetry are active.
- ✅ **Type Safety:** 100% TypeScript coverage between API responses and UI components.

## 9. Development Roadmap (Next Steps)
- [x] Implement rate limiting to prevent token exhaustion.
- [x] Add request logging/telemetry for pipeline monitoring.
- [ ] Expand Export options to PDF and HTML.
- [ ] Integrate AI Image generation (DALL-E 3) for blog thumbnails.
