# Artifex AI Generation API

## 🤖 AI Generation Endpoints

All generation endpoints require authentication via Bearer token.

---

## Generate Blog Post

**POST** `/api/generate/blog` (Protected)

Generate a complete blog post with SEO optimization.

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "topic": "The Future of AI in Content Creation",
  "audience": "Digital marketers and content creators",
  "tone": "professional and enthusiastic",
  "keywords": ["AI", "content marketing", "automation", "efficiency"],
  "length": "medium",
  "intent": "Educate and inspire readers about AI's potential"
}
```

**Field Descriptions:**

- `topic` (required): Main subject of the blog post
- `audience` (required): Target reader demographic
- `tone` (required): Writing style (e.g., professional, casual, friendly)
- `keywords` (optional): Array of keywords to include naturally
- `length` (required): "short" (500-800 words), "medium" (1000-1500), "long" (2000-3000)
- `intent` (optional): Purpose or goal of the content

**Response (201):**

```json
{
  "success": true,
  "message": "Blog post generated successfully",
  "data": {
    "title": "The Future of AI in Content Creation: Transforming Digital Marketing",
    "metaDescription": "Discover how AI is revolutionizing content creation for digital marketers...",
    "outline": [
      "Introduction: The Content Creation Revolution",
      "How AI is Changing the Game",
      "Benefits for Digital Marketers",
      "Best Practices for AI-Assisted Content",
      "The Future Outlook",
      "Conclusion: Embracing the Change"
    ],
    "content": "<h1>The Future of AI in Content Creation</h1><p>In today's digital landscape...</p>",
    "wordCount": 1247
  }
}
```

**Saved to Database:**

- All generated content is automatically saved with `contentType: "blog"`
- Includes both input parameters and generated output
- Accessible via `/api/content` endpoints

---

## Generate Ad Copy

**POST** `/api/generate/ad` (Protected)

Generate platform-specific ad copy variants.

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "platform": "Facebook",
  "product": "AI-powered project management tool",
  "targetAudience": "busy startup founders and project managers",
  "keyBenefit": "Save 10+ hours per week on project coordination",
  "tone": "professional"
}
```

**Field Descriptions:**

- `platform` (required): "Facebook", "Instagram", "Google", or "LinkedIn"
- `product` (required): Product or service being advertised
- `targetAudience` (required): Who the ad is targeting
- `keyBenefit` (required): Main value proposition
- `tone` (required): "direct", "playful", "urgent", or "professional"

**Response (201):**

```json
{
  "success": true,
  "message": "Ad copy generated successfully",
  "data": {
    "platform": "Facebook",
    "variants": [
      {
        "headline": "Stop Wasting Time on Project Chaos",
        "primaryText": "AI-powered coordination that saves busy founders 10+ hours every week. See results in days, not weeks.",
        "cta": "Try Free for 14 Days"
      },
      {
        "headline": "10+ Hours Saved Weekly, Guaranteed",
        "primaryText": "Project management that actually works. Our AI handles coordination while you focus on growth.",
        "cta": "Start Your Free Trial"
      },
      {
        "headline": "Smart Project Management for Founders",
        "primaryText": "Finally, a tool that understands startup speed. AI-powered coordination that saves 10+ hours per week.",
        "cta": "Get Started Free"
      }
    ]
  }
}
```

**Saved to Database:**

- Saved with `contentType: "ad"`
- Each variant is optimized for the specified platform
- Adheres to platform-specific character limits

---

## Generate Product Description

**POST** `/api/generate/product` (Protected)

Generate compelling e-commerce product descriptions.

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "productName": "Premium Wireless Noise-Cancelling Headphones",
  "features": "Active noise cancellation, 30-hour battery life, premium leather cushions, Bluetooth 5.0, foldable design, includes hard case",
  "tone": "premium and sophisticated",
  "targetAudience": "professionals and audiophiles who value quality",
  "length": "medium"
}
```

**Field Descriptions:**

- `productName` (required): Name of the product
- `features` (required): Raw product features and specifications
- `tone` (required): Brand voice (e.g., premium, casual, technical)
- `targetAudience` (required): Target customer profile
- `length` (required): "short", "medium", or "long"

**Response (201):**

```json
{
  "success": true,
  "message": "Product description generated successfully",
  "data": {
    "productName": "Premium Wireless Noise-Cancelling Headphones",
    "shortDescription": "Experience studio-quality sound with intelligent noise cancellation that adapts to your environment.",
    "bulletFeatures": [
      "✨ Advanced Active Noise Cancellation - Block out the world on demand",
      "🔋 30-Hour Battery Life - All-day power for extended listening",
      "🎧 Premium Leather Cushions - Luxurious comfort for hours of wear",
      "📡 Bluetooth 5.0 - Seamless wireless connectivity",
      "📦 Foldable Design with Hard Case - Premium protection on the go"
    ],
    "longDescription": "Elevate your audio experience with our Premium Wireless Noise-Cancelling Headphones...[full detailed description]..."
  }
}
```

**Saved to Database:**

- Saved with `contentType: "product"`
- Includes structured output for easy display
- Perfect for e-commerce platforms

---

## Retrieve Saved Content

**GET** `/api/content?contentType=blog&limit=20&offset=0` (Protected)

Retrieve all your generated content with filtering.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `contentType` (optional): Filter by "blog", "ad", "product", or "general"
- `status` (optional): Filter by "DRAFT" or "COMPLETE"
- `limit` (optional, default: 20): Items per page
- `offset` (optional, default: 0): Pagination offset

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "The Future of AI in Content Creation",
      "body": "Full content...",
      "status": "COMPLETE",
      "contentType": "blog",
      "inputData": {
        "topic": "The Future of AI in Content Creation",
        "audience": "Digital marketers",
        "tone": "professional",
        "keywords": ["AI", "content"],
        "length": "medium"
      },
      "generatedOutput": {
        "title": "...",
        "content": "...",
        "wordCount": 1247
      },
      "createdAt": "2026-01-26T12:00:00Z",
      "updatedAt": "2026-01-26T12:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Error Handling

All generation endpoints handle errors gracefully:

**API Key Error (500):**

```json
{
  "success": false,
  "error": "Invalid Gemini API key"
}
```

**Quota Exceeded (429):**

```json
{
  "success": false,
  "error": "API quota exceeded. Please try again later."
}
```

**Validation Error (400):**

```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "topic",
      "message": "Topic must be at least 3 characters"
    }
  ]
}
```

**Unauthorized (401):**

```json
{
  "success": false,
  "error": "Invalid or expired access token"
}
```

---

## Testing with cURL

### Generate Blog

```bash
curl -X POST http://localhost:5000/api/generate/blog \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Marketing",
    "audience": "Digital marketers",
    "tone": "professional",
    "keywords": ["AI", "marketing", "automation"],
    "length": "medium",
    "intent": "Educate about AI benefits"
  }'
```

### Generate Ad

```bash
curl -X POST http://localhost:5000/api/generate/ad \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "Facebook",
    "product": "Marketing automation tool",
    "targetAudience": "small business owners",
    "keyBenefit": "Save 5 hours per week",
    "tone": "direct"
  }'
```

### Generate Product Description

```bash
curl -X POST http://localhost:5000/api/generate/product \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Smart Watch Pro",
    "features": "Heart rate monitor, GPS, waterproof, 7-day battery",
    "tone": "modern and tech-savvy",
    "targetAudience": "fitness enthusiasts",
    "length": "medium"
  }'
```

### Get All Content

```bash
curl -X GET "http://localhost:5000/api/content?contentType=blog&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Setup Instructions

1. **Get Gemini API Key:**
   - Visit https://makersuite.google.com/app/apikey
   - Create a new API key
   - Add to `.env`: `GEMINI_API_KEY=your_key_here`

2. **Run Database Migration:**

   ```bash
   cd backend
   npm run prisma:migrate
   ```

3. **Install Dependencies:**

   ```bash
   npm install
   ```

4. **Start Server:**
   ```bash
   npm run dev
   ```

Server will validate the Gemini API key on startup.
