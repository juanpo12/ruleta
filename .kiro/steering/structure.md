# Project Structure

## Directory Organization

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout with fonts and metadata
│   └── page.tsx           # Home page (main roulette app)
├── components/            # React components
│   ├── ui/               # shadcn/ui components (auto-generated)
│   ├── roulette-app.tsx  # Main application component
│   ├── roulette-wheel.tsx # Wheel animation component
│   └── theme-provider.tsx # Theme context provider
├── hooks/                # Custom React hooks
│   ├── use-mobile.ts     # Mobile detection hook
│   └── use-toast.ts      # Toast notification hook
├── lib/                  # Utility libraries
│   └── utils.ts          # Common utilities (cn function)
├── public/               # Static assets
└── styles/               # Additional stylesheets
```

## Code Organization Patterns

### Component Structure
- **Main app logic**: `components/roulette-app.tsx` (client component)
- **UI components**: `components/ui/` (shadcn/ui generated components)
- **Custom components**: Direct in `components/` folder
- **Page components**: `app/page.tsx` uses dynamic imports for client components

### Import Aliases
- `@/components` → `./components`
- `@/lib` → `./lib` 
- `@/hooks` → `./hooks`
- `@/components/ui` → `./components/ui`

### File Naming Conventions
- **Components**: kebab-case (e.g., `roulette-app.tsx`)
- **Hooks**: kebab-case with `use-` prefix (e.g., `use-toast.ts`)
- **Utilities**: kebab-case (e.g., `utils.ts`)
- **Pages**: Next.js conventions (`page.tsx`, `layout.tsx`)

## Architecture Notes

### Client vs Server Components
- **Server Components**: Layout, page shells, static content
- **Client Components**: Interactive components with state/events (marked with `"use client"`)
- **Dynamic Imports**: Used for client components in server pages to avoid SSR issues

### State Management
- Local component state with `useState`
- Custom hooks for reusable stateful logic
- No external state management library (Redux, Zustand, etc.)

### Styling Approach
- Tailwind utility classes for styling
- `cn()` utility function for conditional classes
- CSS variables for theming support
- Component variants using `class-variance-authority`