import { redirect } from 'next/navigation';

interface AdminProductsEditPageProps {
  params: { productid: string };
}

export default function AdminProductsEditPage({ params }: AdminProductsEditPageProps) {
  redirect('/admin/products');
}
