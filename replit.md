# PuckPro - Elite Hockey Training Platform

## Overview

PuckPro is a comprehensive hockey training application designed for players at all levels (house, A, AA, AAA, junior). The platform provides AI-powered personalized workout plans, nutrition tracking, skills development drills, game review capabilities, and an AI coaching assistant. Users can track their progress through an XP/tier system (Bronze → Silver → Gold → Diamond → Elite) while managing their training schedule, diet, and skill development.

The application is built as a full-stack TypeScript project with a React frontend and Express backend, utilizing PostgreSQL for data persistence and a modern component-based UI architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (no React Router)
- TanStack Query (React Query) for server state management and data fetching

**UI Component System**
- Shadcn/ui component library (New York style variant)
- Radix UI primitives for accessible component foundations
- Tailwind CSS v4 (via @tailwindcss/vite) for styling with custom design tokens
- Custom fonts: Inter (body) and Oswald (headings) from Google Fonts
- Icon library: Lucide React

**State Management Approach**
- React Context API (UserContext) for global user profile state
- TanStack Query for server-state caching and synchronization
- Local React state for UI-specific concerns
- No Redux or similar state management libraries

**Key Design Patterns**
- Component composition with shadcn/ui slot-based architecture
- Custom hooks for reusable logic (use-mobile, use-toast)
- Path aliases for clean imports (@/, @shared/, @assets/)
- Mobile-first responsive design with bottom navigation

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for the REST API
- Node.js with ES modules (type: "module")
- HTTP server creation for potential WebSocket support (imported but not implemented)

**API Design**
- RESTful endpoints under `/api` prefix
- JSON request/response format
- Raw body preservation for webhook verification (Stripe-ready)
- Request logging middleware with duration tracking

**Development vs Production**
- Development: Vite middleware integrated with Express for HMR
- Production: Prebuilt static files served from `dist/public`
- Build process uses esbuild for server bundling (allowlist pattern for dependencies)

**Session Management Structure**
- Currently uses a default user ID system ("default-user")
- Database schema supports user authentication (username/password fields present)
- Session infrastructure ready (connect-pg-simple imported) but not actively used
- Design allows for future authentication layer addition

### Data Storage

**ORM & Database**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary database (node-postgres driver)
- Database connection via connection pool
- Schema-first approach with Drizzle Kit for migrations

**Schema Design**
```
users (id, username, password, createdAt)
  ↓ (one-to-one)
profiles (id, userId, age, weight, height, goal, position, level, schedule, xp, tier, ...)
  ↓ (one-to-many)
workoutLogs (id, userId, date, workoutType, createdAt)
mealLogs (id, userId, date, mealType, mealId, consumed, createdAt)
```

**Key Data Patterns**
- UUID generation for primary keys (gen_random_uuid())
- Cascade deletes from users to related records
- JSONB for flexible schedule storage (weekly workout mapping)
- Date strings in YYYY-MM-DD format for logs
- Zod schemas generated from Drizzle schemas for validation

### External Dependencies

**UI & Styling**
- Tailwind CSS v4 with PostCSS and Autoprefixer
- Radix UI component primitives (20+ components)
- Class Variance Authority (CVA) for component variants
- clsx and tailwind-merge (via cn utility) for className management
- embla-carousel-react for carousel functionality
- date-fns for date manipulation

**Forms & Validation**
- React Hook Form for form state management
- @hookform/resolvers for schema integration
- Zod for runtime type validation
- drizzle-zod for schema-to-validator conversion

**Developer Experience**
- @replit/vite-plugin-runtime-error-modal for error overlays
- @replit/vite-plugin-cartographer for code navigation (dev only)
- @replit/vite-plugin-dev-banner for environment indication (dev only)
- tsx for TypeScript execution
- drizzle-kit for database migrations

**Asset Management**
- Static assets served from `client/public`
- Generated images stored in `attached_assets/generated_images`
- Custom Vite plugin (vite-plugin-meta-images) for OpenGraph image handling
- Automatic meta tag updates for Replit deployment domains

**Potential Future Integrations**
- Stripe (imported in build script allowlist)
- OpenAI (imported in build script allowlist)
- Google Generative AI (imported in build script allowlist)
- Nodemailer (imported in build script allowlist)
- Express Session with PostgreSQL store
- Passport.js for authentication strategies

**Notable Architectural Decisions**
- No authentication currently implemented despite infrastructure presence (deliberate MVP choice)
- Client and server code share types via `@shared` path alias
- Build process bundles specific dependencies to reduce syscalls and improve cold start
- Vite plugin for meta image handling specific to Replit deployment environment
- Mobile-optimized with fixed bottom navigation (pb-safe for notched devices)