# Backend

Express + TypeScript backend for the IKOMS admin portal. This workspace is set up to support Supabase-backed API routes, middleware, validation, and future service modules.

## What this backend includes

- Express server entrypoint for local development
- Environment configuration through `.env`
- Supabase integration hooks
- Route, controller, middleware, service, and utility folders for future expansion

## Scripts

From the `backend` folder:

- `npm run dev` - start the TypeScript server in development mode
- `npm run build` - compile TypeScript into `dist/`
- `npm start` - run the compiled server from `dist/index.js`
- `npm run lint` - lint the backend source files

## Environment variables

Copy `.env.example` to `.env` and fill in the values before running the server.

Required values:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT`
- `FRONTEND_URL`
- `JWT_SECRET`

## Project structure

```text
backend/
├── .env
├── .env.example
├── package.json
├── README.md
├── tsconfig.json
└── src/
    ├── app.ts
    ├── index.ts
    ├── config/
    │   ├── env.ts
    │   └── supabase.ts
    ├── controllers/
    │   └── .gitkeep
    ├── middleware/
    │   └── auth.ts
    ├── routes/
    │   ├── auth.ts
    │   ├── health.ts
    │   ├── index.ts
    │   └── products.ts
    ├── services/
    │   ├── .gitkeep
    │   └── product.ts
    ├── types/
    │   └── index.ts
    └── utils/
        ├── errors.ts
        └── response.ts
```

## Suggested module responsibilities

- `src/app.ts` - creates and configures the Express app
- `src/index.ts` - starts the HTTP server
- `src/config/env.ts` - centralizes runtime environment values
- `src/config/supabase.ts` - creates Supabase clients for API usage
- `src/routes/` - groups route definitions by feature
- `src/controllers/` - holds request handlers
- `src/services/` - holds business logic and Supabase data access
- `src/middleware/` - holds auth, validation, and error handling middleware
- `src/utils/` - shared helper functions
- `src/types/` - shared TypeScript types and module augmentation

## Next steps

1. Add route modules for health, admin, auth, and orders.
2. Move Supabase access into services.
3. Add request validation with Zod.
4. Add central error handling and logging.
