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
package-lock.json
package.json
postcss.config.mjs
README.md
tsconfig.json
tsconfig.tsbuildinfo

.
├── app/
├── ├── about/
├── │   └── page.tsx
├── ├── admin/
├── │   ├── consultancy/page.tsx
├── │   ├── courses/page.tsx
├── │   ├── jobs/page.tsx
├── │   ├── orders/page.tsx
├── │   └── page.tsx
├── ├── api/
├── │   └── shop-nav/route.ts
├── ├── consultancy/
├── │   ├── page.tsx
├── │   └── topics/
├── │       ├── [id]/page.tsx
├── │       └── page.tsx
├── ├── contact/
├── │   └── page.tsx
├── ├── globals.css
├── ├── icon.png
├── ├── layout.tsx
├── ├── not-found.tsx
├── ├── page.tsx
├── ├── recruitment/
├── │   ├── jobs/
├── │   │   ├── [id]/page.tsx
├── │   │   └── page.tsx
├── │   └── page.tsx
├── ├── shop/
├── │   ├── account/page.tsx
├── │   ├── cart/page.tsx
├── │   ├── checkout/page.tsx
├── │   ├── collections/[handle]/page.tsx
├── │   ├── order-confirmation/page.tsx
├── │   ├── orders/page.tsx
├── │   ├── page.tsx
├── │   ├── products/
├── │   │   ├── page.tsx
├── │   │   └── [handle]/page.tsx
├── │   ├── search/page.tsx
├── │   └── wishlist/page.tsx
├── └── training/
│   ├── ├── courses/
│   ├── │   ├── [id]/page.tsx
│   ├── │   └── page.tsx
│   └── └── page.tsx
├── components/
├── ├── AppLayout.tsx
├── ├── AccountClient.tsx
├── ├── CategoryImageCarousel.tsx
├── ├── CategorySubList.tsx
├── ├── LogoMarquee.tsx
├── ├── OrdersClient.tsx
├── ├── SearchClient.tsx
├── ├── ShopBreadcrumbs.tsx
├── ├── ShopCategoryIntro.tsx
├── ├── ShopOverlayMenu.tsx
├── ├── ShopProductSpecification.tsx
├── ├── SmoothScroll.tsx
├── ├── theme-provider.tsx
├── ├── TrustBadgesMarquee.tsx
├── ├── layout/
├── │   ├── AdminLayout.tsx
├── │   ├── Footer.tsx
├── │   ├── Header.tsx
├── │   └── SiteLayout.tsx
├── └── ui/
├── contexts/
├── └── WishlistContext.tsx
├── hooks/
├── ├── use-mobile.tsx
├── └── use-toast.ts
├── lib/
├── ├── cart.ts
├── ├── category-marquee.ts
├── ├── category-names.ts
├── ├── catergory-carousel.ts
├── ├── catergory-products.ts
├── ├── constants.ts
├── ├── crm.ts
├── ├── supabase.ts
├── └── utils.ts
├── public/
└── └── images/
    └── └── [image asset folders and files]

scripts/
```

## Notes

- This project uses the Next.js App Router and React Server Components where appropriate.
- UI primitives live in the `ui/` directory and layout components in `components/layout/`.

If you'd like, I can also commit this change or add a generated tree file. 
