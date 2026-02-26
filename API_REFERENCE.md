# 📡 API Reference

**Base URL**: `http://localhost:5000/api`

## 🔐 Authentication
All protected endpoints require a Bearer token:
`Authorization: Bearer <access_token>`

### Auth Endpoints
- `POST /auth/signup` - Create account
- `POST /auth/login` - Authenticate & receive tokens
- `POST /auth/refresh` - Rotate access/refresh tokens
- `POST /auth/logout` - Invalidate tokens

---

## 🤖 AI Generation Pipeline
The system uses a multi-agent orchestration service that performs deep analysis before returning a final result.

### 🖋️ Blog Generation
`POST /generate/blog` (Protected)
**Body:**
```json
{
  "topic": "Future of AI",
  "audience": "Marketers",
  "tone": "excited",
  "keywords": ["tech", "growth"],
  "length": "medium",
  "intent": "Educate"
}
```
**Process**: Writer Agent → SEO/Conv Critic Agents → Synthesizer Agent.

### 📢 Ad Variant Generation
`POST /generate/ad` (Protected)
**Body:**
```json
{
  "platform": "Facebook",
  "product": "Coffee",
  "targetAudience": "Early birds",
  "keyBenefit": "Wake up faster",
  "tone": "playful"
}
```
**Outcome**: Returns 3 platform-optimized copy variants.

### 📦 Product Descriptions
`POST /generate/product` (Protected)
**Body:**
```json
{
  "productName": "Nitro Brew",
  "features": "Cold brew, high caffeine",
  "length": "short"
}
```

---

## 📝 Content Management

### Library Operations
- `GET /content` - List saved content (Filters: `contentType`, `status`)
- `GET /content/:id` - Fetch single document details
- `PATCH /content/:id` - Update title, body, or status
- `DELETE /content/:id` - Remove from library

### Advanced Refinement
- `POST /content/:id/improve` - Run a targeted optimization agent on existing content.
  - **Modes**: `seo`, `conversion`, `clarity`, `luxury`, `aggressive`.

---

## 🧠 Intelligence & Insights

### Brand & Competitors
- `GET /brands` - List brand voice profiles
- `POST /brands` - Save new tone/banned words
- `POST /competitors/analyze` - Extract intelligence from a competitor URL

### Topic Suggestions
- `GET /topics` - Receive AI-generated content ideas based on your historical generations.

---

## ❌ Error Handling
All endpoints follow a standard error format:
```json
{
  "success": false,
  "error": "Short error message",
  "details": [ /* Optional validation/field errors */ ]
}
```
Common Status Codes:
- `401/403`: Auth Failure
- `429`: Rate Limit Exceeded (Strict on AI Generation)
- `503`: AI Provider (Ollama/Gemini) Unavailable
- `504`: AI Request Timeout
