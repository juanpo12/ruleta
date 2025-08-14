# Technology Stack

## Framework & Runtime
- **Next.js 15.2.4** - React framework with App Router
- **React 19** - UI library with React Server Components (RSC)
- **TypeScript 5** - Type-safe JavaScript with strict mode enabled
- **Node.js** - Runtime environment

## UI & Styling
- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **shadcn/ui** - Component library (New York style variant)
- **Radix UI** - Headless UI primitives for accessibility
- **Lucide React** - Icon library
- **Geist Font** - Typography (Sans & Mono variants)
- **next-themes** - Theme management

## Key Libraries
- **clsx & tailwind-merge** - Conditional CSS class handling via `cn()` utility
- **React Hook Form + Zod** - Form handling and validation
- **Sonner** - Toast notifications
- **class-variance-authority** - Component variant management

## Build System & Package Management
- **pnpm** - Package manager (lockfile present)
- **PostCSS** - CSS processing
- **ESLint** - Code linting (disabled during builds)

## Common Commands

```bash
# Development
pnpm dev          # Start development server

# Building
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
```

## Configuration Notes
- TypeScript strict mode enabled
- ESLint and TypeScript errors ignored during builds
- Image optimization disabled
- Path aliases configured (`@/*` maps to root)
- CSS variables enabled for theming