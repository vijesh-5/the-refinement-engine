# 🚀 Running Frontend & Backend Together

## Quick Start

### Option 1: Two Separate Terminals (Recommended)

**Terminal 1 - Backend:**

```powershell
cd backend
npm run dev
```

✅ Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**

```powershell
# From project root
npm run dev
```

✅ Frontend will run on `http://localhost:5173` (or the port Vite assigns)

---

## Connectivity Setup

### 1. Backend is Already Running On:

- **URL:** `http://localhost:5000`
- **API Base:** `http://localhost:5000/api`

### 2. Update Frontend API Configuration

Create or update your frontend API client to point to the backend:

**Create:** `src/lib/api.ts`

```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = {
  // Auth
  signup: async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Protected requests
  getProfile: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Content
  createContent: async (
    token: string,
    data: { title: string; body: string; templateId?: string },
  ) => {
    const response = await fetch(`${API_BASE_URL}/content`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  listContent: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/content`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Templates
  getTemplates: async () => {
    const response = await fetch(`${API_BASE_URL}/templates`);
    return response.json();
  },

  // Dashboard
  getDashboard: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
```

### 3. Add Environment Variable (Optional)

Create `.env.local` in your frontend root:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Testing Connectivity

### Quick Test from Browser Console

Once both are running, open browser console and test:

```javascript
// Test 1: Check API is responding
fetch("http://localhost:5000/api/health")
  .then((r) => r.json())
  .then(console.log);

// Test 2: Get templates (public endpoint)
fetch("http://localhost:5000/api/templates")
  .then((r) => r.json())
  .then(console.log);

// Test 3: Signup
fetch("http://localhost:5000/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "test@example.com",
    password: "TestPass123",
    firstName: "Test",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

---

## Troubleshooting

### CORS Issues?

Backend is already configured with CORS for `http://localhost:5173`. If your frontend runs on a different port, update `backend/.env`:

```env
CORS_ORIGIN=http://localhost:YOUR_FRONTEND_PORT
```

### Backend Not Starting?

Check:

1. PostgreSQL is running
2. `backend/.env` has correct `DATABASE_URL`
3. Run `npm run prisma:generate` in backend folder

### Database Connection Failed?

```powershell
cd backend
npm run prisma:migrate
npm run prisma:seed
```

---

## Development Workflow

### Start Both Services:

```powershell
# Terminal 1
cd backend
npm run dev

# Terminal 2 (new terminal)
npm run dev
```

### View Backend Logs:

Backend terminal shows:

- API requests
- Database queries (in development)
- Errors

### Access Points:

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000/api`
- **Backend Health:** `http://localhost:5000/api/health`
- **API Docs:** See `backend/API.md`

---

## Next Steps

1. **Start Backend:** `cd backend && npm run dev`
2. **Start Frontend:** `npm run dev` (in new terminal)
3. **Test in Browser:** Visit `http://localhost:5173`
4. **Check Console:** Look for any connection errors
5. **Test Login/Signup:** Use the forms in your app

Everything should now be connected! 🎉
