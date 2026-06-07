import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';
import { SHOP_CATEGORIES } from '@/lib/category-names';

export default function ProductsIndexPage() {
  return (
    <SiteLayout>
      <section className="bg-linear-to-br from-rose-800 to-pink-700 text-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <ShopBreadcrumbs
              variant="hero"
              items={[
                { label: 'Shop', href: '/shop' },
                { label: 'Products' },
              ]}
            />
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Product specifications</h1>
              <p className="mt-3 text-sm leading-6 text-pink-100 sm:text-base">
                Browse product categories and access individual specification pages for every item in the shop.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {SHOP_CATEGORIES.map((category) => (
              <Link
                key={category.handle}
                href={`/shop/collections/${category.handle}`}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-rose-300 hover:shadow-md"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-rose-600">Category</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-900">{category.title}</h2>
                <p className="mt-4 text-sm leading-6 text-slate-600">View products in the {category.title} collection.</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
