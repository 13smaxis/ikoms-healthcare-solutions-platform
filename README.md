# Ikoms Healthcare Solutions Platform

A modern Next.js 16 + React 19 platform for the IKOMS healthcare solutions brand. The app combines public-facing marketing and e-commerce experiences with an authenticated admin workspace for managing content, jobs, training, consultancy, and products.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Key Components](#key-components)
- [Architecture](#architecture)
- [Notes](#notes)

## Features

- **Public Site Pages**: About, recruitment, consultancy, training, shop, and contact pages
- **E-Commerce Experience**: Product browsing, search, cart, wishlist, and checkout flows
- **Admin Dashboard**: Comprehensive management interface for jobs, courses, consultancy content, products, and e-commerce operations
- **Authentication**: Supabase-powered authentication with role-based access control
- **Responsive Design**: Tailwind CSS with reusable shadcn-style components
- **Modern Stack**: Built with Next.js 16 App Router and React 19

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend/Auth**: Supabase (PostgreSQL)
- **UI Components**: Radix UI primitives
- **Linting**: ESLint with Next.js configuration
- **CSS Processing**: PostCSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Environment variables configured

### Installation

1. **Clone the repository and install dependencies:**

```bash
npm install
```

2. **Create a `.env.local` file with the required environment variables:**

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_STORE_ID=your-store-id
```

3. **Start the development server:**

```bash
npm run dev
```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Available Scripts

- `npm run dev` — Start the development server with hot-reload
- `npm run build` — Create an optimized production build
- `npm run start` — Run the production build locally
- `npm run lint` — Run ESLint checks and report issues

## Project Structure

```
ikoms-healthcare-solutions-platform/
├── app/                              # Next.js App Router pages and layouts
│   ├── layout.tsx                   # Root layout component
│   ├── page.tsx                     # Home page
│   ├── globals.css                  # Global styles
│   ├── not-found.tsx                # 404 error page
│   │
│   ├── about/
│   │   └── page.tsx                 # About page
│   │
│   ├── admin/                       # Admin dashboard section (protected)
│   │   ├── layout.tsx               # Admin layout wrapper
│   │   ├── page.tsx                 # Admin dashboard home
│   │   ├── consultancy/             # Consultancy management
│   │   ├── courses/                 # Course management
│   │   ├── e-commerce/              # E-commerce management
│   │   ├── jobs/                    # Job listings management
│   │   ├── login/                   # Admin login
│   │   └── products/                # Product management
│   │
│   ├── api/                         # API routes
│   │   ├── admin/                   # Admin-related endpoints
│   │   ├── health/                  # Health check endpoints
│   │   ├── products/                # Product endpoints
│   │   └── shop-nav/                # Shop navigation endpoints
│   │
│   ├── consultancy/                 # Consultancy section
│   │   ├── page.tsx                 # Consultancy overview
│   │   └── topics/                  # Consultancy topics
│   │
│   ├── contact/
│   │   └── page.tsx                 # Contact page
│   │
│   ├── recruitment/                 # Recruitment/jobs section
│   │   ├── page.tsx                 # Recruitment overview
│   │   └── jobs/                    # Job listings
│   │
│   ├── shop/                        # E-commerce shop section
│   │   ├── page.tsx                 # Shop homepage
│   │   ├── account/                 # User account management
│   │   ├── cart/                    # Shopping cart
│   │   ├── checkout/                # Checkout flow
│   │   ├── collections/             # Product collections/categories
│   │   ├── order-confirmation/      # Order confirmation page
│   │   ├── orders/                  # Order history/management
│   │   ├── products/                # Product detail pages
│   │   ├── search/                  # Product search
│   │   └── wishlist/                # Wishlist management
│   │
│   └── training/                    # Training/courses section
│       ├── page.tsx                 # Training overview
│       └── courses/                 # Course listings
│
├── components/                       # Reusable React components
│   ├── auth/                        # Authentication components
│   │   ├── login.tsx                # Login form component
│   │   └── ProtectedRoute.tsx       # Protected route wrapper
│   │
│   ├── layout/                      # Layout components
│   │   ├── AdminLayout.tsx          # Admin section layout
│   │   ├── Footer.tsx               # Site footer
│   │   ├── Header.tsx               # Site header/navigation
│   │   └── SiteLayout.tsx           # Main site layout wrapper
│   │
│   ├── ui/                          # Shadcn/Radix UI components
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── command.tsx
│   │   ├── context-menu.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── hover-card.tsx
│   │   ├── input-otp.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── menubar.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── pagination.tsx
│   │   └── ... (additional UI primitives)
│   │
│   ├── AccountClient.tsx            # User account management component
│   ├── CategoryImageCarousel.tsx    # Category carousel display
│   ├── CategorySubList.tsx          # Category sub-list component
│   ├── FocusRefresh.tsx             # Focus refresh utility component
│   ├── LogoMarquee.tsx              # Scrolling logo marquee
│   ├── OrdersClient.tsx             # Orders client-side component
│   ├── ProductFormCreate.tsx        # Product creation form
│   ├── ProductFormEdit.tsx          # Product editing form
│   ├── ProductImage.tsx             # Product image display
│   ├── SearchClient.tsx             # Search interface component
│   ├── ShopBreadcrumbs.tsx          # Shop navigation breadcrumbs
│   ├── ShopOverlayMenu.tsx          # Mobile overlay navigation menu
│   ├── ShopProductCard.tsx          # Product card component
│   ├── ShopProductSpecification.tsx # Product specs display
│   ├── SmoothScroll.tsx             # Smooth scroll wrapper
│   ├── TrustBadgesMarquee.tsx       # Trust badges marquee
│   ├── WishlistClient.tsx           # Wishlist client component
│   └── theme-provider.tsx           # Theme provider setup
│
├── contexts/                        # React Context providers
│   ├── AuthContext.tsx              # Authentication context
│   └── WishlistContext.tsx          # Wishlist state management
│
├── hooks/                           # Custom React hooks
│   ├── use-mobile.tsx               # Mobile detection hook
│   ├── use-toast.ts                 # Toast notifications hook
│   ├── useProductAPI.ts             # Product API calls hook
│   └── useSessionRefresh.ts         # Session refresh hook
│
├── lib/                             # Utility functions and libraries
│   ├── api/                         # API utilities
│   ├── auth/                        # Authentication utilities
│   ├── services/                    # Service layer abstractions
│   ├── cart.ts                      # Cart utility functions
│   ├── category-marquee.ts          # Category marquee logic
│   ├── category-names.ts            # Category name mappings
│   ├── category-products.ts         # Category product utilities
│   ├── catergory-carousel.ts        # Category carousel logic
│   ├── constants.ts                 # Application constants
│   ├── crm.ts                       # CRM integration utilities
│   ├── supabase-products.ts         # Supabase products queries
│   ├── supabase-storage.ts          # Supabase storage operations
│   ├── supabase-tables.ts           # Supabase table definitions
│   ├── supabase.ts                  # Supabase client setup
│   ├── utility-functions.ts         # General utilities
│   └── utils.ts                     # Helper utilities
│
├── types/                           # TypeScript type definitions
│   └── database.ts                  # Database type definitions
│
├── public/                          # Static assets
│   └── images/                      # Image files
│
├── postman/                         # API documentation/testing
│   ├── collections/                 # Postman collections
│   ├── environments/                # Postman environments
│   ├── flows/                       # Postman flows
│   ├── globals/                     # Postman globals
│   ├── mocks/                       # Postman mocks
│   └── specs/                       # API specifications
│
├── Configuration Files
│   ├── eslint.config.mjs            # ESLint configuration
│   ├── next.config.ts               # Next.js configuration
│   ├── next-env.d.ts                # Next.js type definitions
│   ├── tsconfig.json                # TypeScript configuration
│   ├── postcss.config.mjs           # PostCSS configuration
│   └── package.json                 # Dependencies and scripts
│
├── Documentation
│   ├── README.md                    # This file
│   ├── AGENTS.md                    # Agent configuration
│   └── CLAUDE.md                    # Claude integration notes
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | `eyJhbGc...` |
| `NEXT_PUBLIC_API_URL` | API base URL | `http://localhost:3000/api` |
| `NEXT_PUBLIC_STORE_ID` | Store identifier | `ikoms-store` |

## Key Components

### Layout Components
- **SiteLayout**: Main wrapper for public pages
- **AdminLayout**: Wrapper for admin section with role-based access
- **Header**: Navigation header with logo and menu
- **Footer**: Site footer with links and company info

### Feature Components
- **Product Management**: `ProductFormCreate`, `ProductFormEdit`, `ShopProductCard`
- **Shopping**: `ShopBreadcrumbs`, `CartClient`, `CheckoutClient`
- **Account**: `AccountClient`, `OrdersClient`, `WishlistClient`
- **UI Elements**: Comprehensive set of shadcn UI components

### Context Providers
- **AuthContext**: Manages user authentication state and Supabase session
- **WishlistContext**: Manages user's wishlist items

## Architecture

### Routing Structure
- **Public Routes**: Home, about, recruitment, consultancy, training, contact, shop
- **Protected Routes**: Admin section with layout protection via `ProtectedRoute.tsx`
- **API Routes**: RESTful endpoints for product, admin, and shop operations

### Data Flow
1. **Client Components**: UI components that handle user interactions
2. **Server Components**: Pages and layouts that render on the server
3. **Hooks**: Custom hooks manage state and API calls (`useProductAPI`, `useSessionRefresh`)
4. **Contexts**: Global state management for auth and wishlist
5. **Supabase**: Backend database and authentication service

### Authentication Flow
1. User logs in via admin/login page
2. Supabase session is established and stored in `AuthContext`
3. `ProtectedRoute.tsx` wraps admin pages and checks session
4. Session is refreshed automatically via `useSessionRefresh` hook

## Notes

- The project uses **Next.js App Router** for file-based routing
- **Server-side secrets** (like `SUPABASE_SERVICE_ROLE_KEY`) must remain in environment variables and never be exposed to the browser
- The **admin experience** depends on a valid Supabase session and appropriate role permissions
- UI components are built with **Radix UI primitives** and styled with **Tailwind CSS**
- Static assets are served from the `public/` directory
- Database schema and types are defined in `types/database.ts`
- API endpoints follow REST conventions and are located in `app/api/`

## Support

For questions or issues, please refer to the documentation in `AGENTS.md` or `CLAUDE.md` files.
