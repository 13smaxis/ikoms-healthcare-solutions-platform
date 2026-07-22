# Ikoms Healthcare Solutions Platform

A modern Next.js 16 + React 19 platform for the IKOMS healthcare solutions brand. The app combines public-facing marketing and e-commerce experiences with an authenticated admin workspace for managing content, jobs, training, consultancy, and products.

## Features

- Public site pages for about, recruitment, consultancy, training, shop, and contact
- Product browsing, search, cart, wishlist, and checkout flows
- Admin dashboard for managing jobs, courses, consultancy content, products, and e-commerce operations
- Supabase-powered authentication and admin access controls
- Responsive UI built with Tailwind CSS and reusable shadcn-style components

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Radix UI primitives
- ESLint and Next.js linting

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file named `.env.local` with the required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_STORE_ID=your-store-id
```

3. Start the development server:

```bash
npm run dev
```

4. Open http://localhost:3000 in your browser.

## Available scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — run the production build locally
- `npm run lint` — run ESLint checks

## Project structure

- `app/` — routes and page components
- `components/` — UI and feature components
- `contexts/` — authentication and wishlist context providers
- `hooks/` — reusable custom hooks
- `lib/` — shared utilities, helpers, and Supabase configuration
- `public/images/` — static image assets

## Notes

- The project uses the Next.js App Router.
- Server-side secrets should remain in environment variables and never be exposed to the browser.
- The admin experience depends on a valid Supabase session and appropriate role permissions.
