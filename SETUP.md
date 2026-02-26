# 🏁 Windows Setup Guide

This guide will help you set up and run **The Refinement Engine** locally on a Windows system using the `vijesh` branch and local Ollama AI.

## 📋 Prerequisites

Before starting, ensure you have the following installed:
1. **Node.js**: [Download v18+ or v20+](https://nodejs.org/)
2. **PostgreSQL**: [Download v15+](https://www.postgresql.org/download/windows/)
3. **Ollama**: [Download from ollama.com](https://ollama.com)
4. **Git**: [Download from git-scm.com](https://git-scm.com/)

---

## 🚀 Step 1: Clone the Project

Open **Git Bash** or **PowerShell** and run:

```powershell
# Clone the repository
git clone https://github.com/your-repo/the-refinement-engine.git
cd the-refinement-engine

# Switch to the correct branch
git checkout vijesh
```

---

## 🐘 Step 2: Database Setup

1. Open **pgAdmin 4** or use the `psql` command line.
2. Create a new database named `artifex_db`.
3. Note your PostgreSQL user password.

---

## 🤖 Step 3: Ollama (Local AI) Setup

Ollama allows you to run AI models for free on your own hardware.

1. **Install Ollama** and ensure it's running in your system tray.
2. **Set Environment Variable**:
   - Open Start -> Search for "Edit the system environment variables".
   - Click "Environment Variables".
   - Under "User variables", click **New**.
   - Variable name: `OLLAMA_HOST`, Variable value: `0.0.0.0`.
   - **Important**: Right-click the Ollama icon in your tray and **Quit**, then restart it to apply this.
3. **Pull the Model**:
   Open a terminal and run:
   ```powershell
   ollama pull llama3.2:1b
   ```

---

## ⚙️ Step 4: Backend Configuration

1. Navigate to the backend directory:
   ```powershell
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend/` folder:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/artifex_db"
   JWT_ACCESS_SECRET=any-random-long-string
   JWT_REFRESH_SECRET=another-random-long-string
   CORS_ORIGIN=http://localhost:8080

   # AI Configuration
   AI_PROVIDER=ollama
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2:1b
   ```
3. Initialize the database:
   ```powershell
   npx prisma generate
   npx prisma db push
   ```
4. Start the backend:
   ```powershell
   npm run dev
   ```

---

## 💻 Step 5: Frontend Configuration

1. Open a **new** terminal and navigate to the frontend:
   ```powershell
   cd frontend
   npm install
   ```
2. Start the frontend:
   ```powershell
   npm run dev
   ```

The application should now be accessible at **http://localhost:8080**! 🎈
