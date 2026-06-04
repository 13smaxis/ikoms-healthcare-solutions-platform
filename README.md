# Ikoms Healthcare Solutions Platform (Next)

A Next.js 13 (App Router) front-end for the Ikoms Healthcare Solutions Platform.

## Quick start

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

Other useful scripts:

- `npm run lint` — run linters
- `npm run test` — run tests (if present)

Open http://localhost:3000 in your browser.

## Project layout (workspace tree)

```
AGENTS.md
CLAUDE.md
eslint.config.mjs
next-env.d.ts
next.config.ts
package.json
postcss.config.mjs
README.md
tsconfig.json
.
├── app/
│   ├── layout.tsx
│   ├── api/shop-nav/route.ts
│   └── shop/
│       ├── page.tsx
│       ├── products/page.tsx
│       ├── products/[handle]/page.tsx
│       ├── collections/[handle]/page.tsx
│       ├── cart/page.tsx
│       ├── checkout/page.tsx
│       ├── wishlist/page.tsx
│       ├── account/page.tsx
│       ├── orders/page.tsx
│       ├── search/page.tsx
│       └── order-confirmation/page.tsx
├── components/
│   ├── layout/SiteLayout.tsx
│   ├── layout/Header.tsx
│   ├── layout/Footer.tsx
│   ├── ShopBreadcrumbs.tsx
│   ├── ShopOverlayMenu.tsx
│   ├── ShopCategoryIntro.tsx
│   ├── ShopImageMarquee.tsx
│   ├── Marquee.tsx
│   ├── shop-menu-config.ts
│   ├── SearchClient.tsx
│   ├── WishlistClient.tsx
│   ├── AccountClient.tsx
│   ├── OrdersClient.tsx
│   ├── ui/breadcrumb.tsx
│   ├── ui/carousel.tsx
│   └── ui/button.tsx
├── contexts/
│   └── WishlistContext.tsx
├── lib/
│   ├── cart.ts
│   ├── shop-catalog.ts
│   ├── shop-media.ts
│   ├── supabase.ts
│   └── crm.ts
└── public/images/
    └── collection and product image assets used by the shop```

## Notes

- This project uses the Next.js App Router and React Server Components where appropriate.
- UI primitives live in the `ui/` directory and layout components in `components/layout/`.

If you'd like, I can also commit this change or add a generated tree file. 
