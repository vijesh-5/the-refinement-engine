# Artifex — The Refinement Engine

AI-powered content generation platform that creates high-quality, brand-consistent marketing content with built-in quality scoring and competitor intelligence.

## Features

- **Blog Creator** — Generate SEO-optimized blog posts with configurable tone, audience, and keyword targeting
- **Ad Copywriter** — Create platform-specific ad variants for Facebook, Instagram, Google, and LinkedIn
- **Product Descriptions** — Generate e-commerce product copy with headlines, bullet points, and descriptions
- **Brand Profiles** — Define brand voice, tone, banned words, and selling points — auto-injected into all content
- **Competitor Intelligence** — Analyze competitor URLs to identify messaging gaps and auto-differentiate your content
- **Content Library** — Save, browse, and manage all generated content with draft/complete status tracking
- **Quality Scoring** — Every piece of content is scored on readability, SEO, and engagement
- **Version History** — Improve content iteratively with AI refinement and track all versions
- **Markdown Rendering** — Rich display of generated content with clean plain-text copy/export

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, TanStack Query, shadcn/ui |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| AI | Google Gemini 2.5 Flash |
| Auth | JWT (access + refresh tokens) |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally or a connection string
- Google Gemini API key

### Setup

```bash
# Clone the repo
git clone https://github.com/your-username/the-refinement-engine.git
cd the-refinement-engine

# Backend setup
cd backend
cp .env.example .env  # Fill in DATABASE_URL and GEMINI_API_KEY
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev

# Frontend setup (separate terminal)
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

### Environment Variables

Create a `.env` file in `backend/` with:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/artifex
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

## Project Structure

```
the-refinement-engine/
├── backend/
│   ├── prisma/              # Schema & migrations
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth, error handling
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic & AI generators
│   │   └── utils/           # Validation schemas
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Shared UI components
│   │   ├── lib/             # API client, utilities
│   │   └── pages/           # Application pages
│   └── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/generate/blog` | Generate blog post |
| POST | `/api/generate/ad` | Generate ad variants |
| POST | `/api/generate/product` | Generate product description |
| GET | `/api/content` | List saved content |
| POST | `/api/content` | Save content |
| DELETE | `/api/content/:id` | Delete content |
| GET | `/api/brands` | List brand profiles |
| POST | `/api/competitors/analyze` | Analyze competitor URL |

## License

MIT
