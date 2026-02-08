# Artifex Backend API

Backend API for Artifex - AI-powered content creation platform.

## Tech Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (access + refresh tokens)
- **Password Hashing**: bcrypt
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up the database:

```bash
npm run prisma:migrate
npm run prisma:generate
```

### Development

Run the development server with auto-reload:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Production

Run the production build:

```bash
npm start
```

## Project Structure

```
src/
 ├─ app.ts           # Express app configuration
 ├─ server.ts        # Server entry point
 ├─ config/          # Configuration files
 ├─ routes/          # API routes
 ├─ controllers/     # Route controllers
 ├─ services/        # Business logic
 ├─ middleware/      # Express middleware
 ├─ utils/           # Utility functions
 ├─ prisma/          # Prisma client instance
 └─ types/           # TypeScript type definitions
```

## API Endpoints

Will be documented as they are implemented.

## License

MIT
