/*
 * Product Specification Page - app/shop/products/[handle]/page.tsx
 * Builds a page structure and displays everything from ShopProductSpecification component 
 */
import { notFound } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import ShopBreadcrumbs from '@/components/ShopBreadcrumbs';
import ShopProductSpecification from '../../../../components/ShopProductSpecification';
import { getCategoryByHandle, SHOP_CATEGORIES } from '@/lib/category-names';
import { getProductByHandle, getProductsForCollectionHandle, type ShopProduct } from '@/lib/catergory-products';

interface ProductPageProps {
  params: Promise<{
    handle: string | string[] | undefined;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const handle = Array.isArray(resolvedParams.handle) ? resolvedParams.handle[0] : resolvedParams.handle;
  const product = getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const category = getCategoryByHandle(product.collectionHandle);                                               //-This is used to display the category name and related products on the product specification page.
  
  /*
   * GetS related products for the current product by fetching all products in the same collection 
   *   and filtering out the current product.
   */
  const relatedProducts = getProductsForCollectionHandle(product.collectionHandle).filter(
    (item) => item.id !== product.id,
  );                                                                                                            

  return (
    <SiteLayout>
      <section className="bg-linear-to-br from-rose-800 to-pink-700 text-white py-10 sm:py-14">           {/* Hero section with a gradient background */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <ShopBreadcrumbs
              variant="hero"
              items={[
                { label: 'Shop', href: '/shop' },
                { label: category?.title || 'Collection', href: `/shop/collections/${product.collectionHandle}` },
                { label: product.name },
              ]}
            />                                                                                                  {/* Breadcrumbs for navigation, showing the path to the current product */}
          </div>
        </div>
      </section>

      <ShopProductSpecification
        product={product}
        category={category}
        categories={SHOP_CATEGORIES}
        relatedProducts={relatedProducts}
      />                                                                                                        {/* Calls the shop product specification component */}
    </SiteLayout>
  );
}
