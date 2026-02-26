# 🛠️ Development Guide

This document provides technical details on the stack, local development workflow, and connectivity setup for **The Refinement Engine**.

## 💻 Technical Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, TanStack Query, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **AI (Cloud)** | Google Gemini 2.0 Flash (`gemini-2.0-flash`) |
| **AI (Local)** | Ollama (llama3.2:1b supported) |
| **Auth** | JWT (Access + Refresh tokens with rotation) |
| **Logging** | Winston (Structured logs for HTTP and Pipelines) |

---

## ⚙️ Local Development Workflow

### Starting Both Services
We recommend running the backend and frontend in separate terminals for better log visibility.

**Terminal 1: Backend**
```bash
cd backend
npm install
npm run dev
```
*Runs on `http://localhost:5000`*

**Terminal 2: Frontend**
```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:8080` (or the port Vite assigns)*

---

## 🔌 Connectivity & Configuration

### Frontend-to-Backend
The frontend connects to the backend via `http://localhost:5000/api`. If you change the backend port, update the `VITE_API_URL` in your frontend environment.

### External AI Providers
The system is provider-agnostic. You can toggle between Gemini and Ollama in `backend/.env`:

```env
# Switch AI_PROVIDER to "ollama" or "gemini"
AI_PROVIDER=ollama
```

### CORS Policies
The backend allows requests from `http://localhost:8080` by default. Update `CORS_ORIGIN` in the backend `.env` if your frontend runs elsewhere.

---

## 📁 Project Structure

```text
the-refinement-engine/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Env, Logger, RateLimiter
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, Error handling
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # AI Agents & Business logic
│   │   └── utils/           # Validation & Helpers
│   └── prisma/              # Schema & migrations
├── frontend/
│   ├── src/
│   │   ├── components/      # Shared UI & Layout
│   │   ├── lib/             # API clients & Hooks
│   │   └── pages/           # Application views
│   └── package.json
└── README.md
```

---

## 🛠 Troubleshooting

### Database Issues
If you encounter schema mismatches or connection errors:
```bash
cd backend
npx prisma generate
npx prisma db push
```

### Ollama Connectivity
If the backend cannot reach Ollama (especially from WSL to Windows):
1. Ensure `OLLAMA_HOST=0.0.0.0` is set in Windows Environment Variables.
2. Restart the Ollama application.
3. Verify your Windows Host IP and update `OLLAMA_URL` in the backend `.env`.

---

## 🛡 Security & Maintenance
- **Rate Limiting**: Global (100 req/15 min) and Generation (10 req/15 min) limiters are active.
- **Logging**: Check `backend` console for structured JSON logs of every AI pipeline phase.
- **Validation**: All API inputs are strictly validated using Zod schemas.
