# Unitize - AP Test Practice Application

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) that simulates the bluebook environment for AP test practice with a focus on practice-based learning.

## Backend Architecture

The backend has been remodeled to follow a clean, maintainable architecture with clear separation of concerns:

### 1. Models Layer (`/src/models`)

- Contains all data models and interfaces used throughout the application
- Defines the shape of data for both database and API operations
- Simplified from the previous complex nested type structure

### 2. Repository Layer (`/src/repositories`)

- Handles direct data access and manipulation
- Abstracts database operations behind a clean interface
- Follows the Repository Pattern for better testability
- Includes specialized repositories:
  - `BaseRepository` - Handles common file operations
  - `CourseRepository` - Manages course, unit, topic, and question data
  - `UserRepository` - Manages user data and progress tracking

### 3. Service Layer (`/src/services`)

- Implements business logic between repositories and API routes
- Provides error handling and response formatting
- Services:
  - `CourseService` - Handles course-related operations
  - `UserService` - Handles user progress and recommendations

### 4. API Routes (`/src/app/api`)

- Next.js route handlers organized by feature
- Consistent error handling and response structure
- Main endpoints:
  - `/api/units` - Course content data
  - `/api/practice` - Get practice questions
  - `/api/progress` - User progress tracking
  - `/api/recommendations` - Personalized recommendations
  - `/api/search` - Search functionality

### 5. Middleware (`/src/middleware`)

- Provides cross-cutting concerns like error handling
- Helps maintain consistent API responses

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
