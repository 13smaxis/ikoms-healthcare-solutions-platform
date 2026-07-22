/*
 * Responsible for rendering the product form for creating or editing a product.
 * It handles form state, validation, and submission to the backend API.
 */
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { getProducts, type ShopProduct, normalizeShopTag } from '@/lib/category-products';
//import { SHOP_CATEGORIES } from '@/lib/category-names';

export const PRODUCT_TYPES = [
  {
    id: '5d929bda-2cf9-4d3c-8957-5a2093d1f34b',
    type: 'Clinical Supplies',
  },
  {
    id: '98753de8-7394-4dc9-8865-db651ac207b3',
    type: 'PPE & Safety Equipment',
  },
  {
    id: '4d71ac64-3355-417d-a454-15a4acd26a03',
    type: 'Diagnostic Equipment',
  },
  {
    id: '341a1e6f-ebe7-446e-a8df-372e312bd588',
    type: 'Training & Education',
  },
  {
    id: '71f0d6be-c2e9-4dec-820c-29f82e3eb477',
    type: 'Home Care & Patient Support',
  },
  {
    id: '3fe11527-e310-4887-95c8-4d16d75be3cd',
    type: 'Emergency & First Aid',
  },
  {
    id: '422f0a13-36ed-461f-adfa-13b8055b8e0f',
    type: 'Other',
  },
];
const CONTROL_CLASS = `
                        w-full rounded-xl 
                        border border-gray-300 
                        bg-gray-700
                        px-3 py-2.5 
                        text-sm text-gray-100
                        outline-none 
                        placeholder:text-gray-500 
                        transition 
                        focus:border-blue-500`;

type Props = {
  product?: ShopProduct | null;
  storeid: string;
  onSave: (product: ShopProduct) => void;
  onClose: () => void;
};

export default function ProductForm({ product, storeid, onSave, onClose }: Props) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        const data = await getProducts(false);
        if (mounted) {
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to load product selectors:', error);
      } finally {
        if (mounted) {
          setLoadingProducts(false);
        }
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const handles = useMemo(
    () => Array.from(new Set(products.map((p) => p.handle).filter(Boolean))),
    [products]
  );
  const collections = useMemo(
    () => Array.from(new Set(products.map((p) => p.collectionHandle).filter(Boolean))),
    [products]
  );

  const [form, setForm] = useState<ShopProduct>(() => ({
    id: product?.id ?? '',
    handle: product?.handle ?? (handles[0] ?? ''),
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    product_type: PRODUCT_TYPES.some(p => p.id === product?.product_type) ? product!.product_type : PRODUCT_TYPES[0].id,
    collectionHandle: product?.collectionHandle ?? (collections[0] ?? ''),
    price: product?.price ?? 0,
    images: product?.images?.length ? product!.images : [''],
    tags: product?.tags ?? [],
    description: product?.description ?? '',
    model: product?.model ?? '',
    key_features: product?.key_features ?? [],
    medical_information: product?.medical_information ?? '',
    status: product?.status ?? 'draft',  // ✅ FIXED: Default to 'draft' instead of 'active'
  }));

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (product) {
      setForm({
        id: product.id,
        handle: product.handle,
        name: product.name,
        sku: product.sku,
        product_type: PRODUCT_TYPES.some(p => p.id === product?.product_type) ? product!.product_type : PRODUCT_TYPES[0].id,
        collectionHandle: product.collectionHandle,
        price: product.price,
        images: product.images?.length ? product.images : [''],
        tags: product.tags ?? [],
        description: product.description ?? '',
        model: product.model ?? '',
        key_features: product.key_features ?? [],
        medical_information: product.medical_information ?? '',
        status: product.status ?? 'draft',
      });
    }
  }, [product]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  if (loadingProducts) {
    return (
      <div className="w-full rounded-3xl border border-white/10 bg-gray-500 p-8 text-center text-white shadow-2xl shadow-black/30">
        <div className="animate-spin inline-block h-8 w-8 rounded-full border-b-2 border-blue-500 mb-4" />
        <p className="text-gray-300">Loading product options...</p>
      </div>
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name || form.name.trim() === '') e.name = 'Product name is required';
    if (!form.sku || form.sku.trim() === '') e.sku = 'SKU is required';
    if (!form.handle || form.handle.trim() === '') e.handle = 'Handle is required';
    if (form.price === null || form.price === undefined || Number.isNaN(Number(form.price))) e.price = 'Price is required';
    if (!form.description || form.description.trim() === '') e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleUpload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
      const json = await res.json();
      if (json?.path) {
        setForm((s) => ({ ...s, images: [json.path, ...s.images.filter(Boolean)] }));
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }

  function setKeyFeaturesFromText(text: string) {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    setForm((s) => ({ ...s, key_features: lines }));
  }

  function keyFeaturesToText() {
    return (form.key_features || []).join('\n');
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!validate()) return;
    const out: ShopProduct = {
      ...form,
      id: form.id || `${normalizeShopTag(form.handle || form.name || 'product')}-${Date.now()}`,
      price: Number(form.price) || 0,
      images: Array.isArray(form.images) ? form.images.filter(Boolean) : [],
      tags: Array.isArray(form.tags) ? form.tags.map((t) => t.trim()).filter(Boolean) : [],
      key_features: Array.isArray(form.key_features) ? form.key_features.map((k) => k.trim()).filter(Boolean) : [],
      description: form.description || '',
      medical_information: form.medical_information || '',
      status: form.status || 'draft',
    };

    onSave(out);
  }

  return (
    <form className="
              flex
              h-[85vh] max-h-[85vh] w-full
                      flex-col 
                      overflow-hidden 
                      rounded-3xl 
                      border border-white/10 
                      bg-slate-950 
                      text-white 
                      shadow-2xl shadow-black/30
                    " 
                    onSubmit={handleSubmit}
    >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">{product ? 'Edit product' : 'New product'}</h2>
            <p className="text-sm text-gray-300">Update shop product details for the storefront.</p>
          </div>
        </div>

        <div className="product-form-scroll grid h-0 min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-scroll overscroll-contain p-6 sm:grid-cols-2 sm:p-8">
          <div className="contents">
            <label className="space-y-2 text-sm">
              <span className="text-sm font-medium text-slate-200">Product name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={CONTROL_CLASS}
              />
              {errors.name && <div className="text-rose-600 text-xs">{errors.name}</div>}
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-sm font-medium text-slate-200">Handle</span>
              <select value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} className={CONTROL_CLASS}>
                {handles.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </label>
          </div>

          <div className="contents">
            <label className="space-y-2 text-sm">
              <span className="text-sm font-medium text-slate-200">SKU</span>
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className={CONTROL_CLASS}
              />
              {errors.sku && <div className="text-rose-600 text-xs">{errors.sku}</div>}
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-sm font-medium text-slate-200">Price</span>
              <input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={String(form.price)}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className={CONTROL_CLASS}
              />
              {errors.price && <div className="text-rose-600 text-xs">{errors.price}</div>}
            </label>
          </div>

          <div className="contents">                                                                                              {/* Grouping product type and collection handle together */ }
            <label className="space-y-2 text-sm">
              <span className="text-sm font-medium text-slate-100">Product type</span>
              <select
                value={form.product_type}
                onChange={(e) => setForm({ ...form, product_type: e.target.value })}
              >
                {PRODUCT_TYPES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.type}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-sm font-medium text-slate-100">Collection handle</span>
              <select value={form.collectionHandle} onChange={(e) => setForm({ ...form, collectionHandle: e.target.value })} className={CONTROL_CLASS}>
                {collections.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm">
            <span className="text-sm font-medium text-slate-200">Status</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={CONTROL_CLASS}>
              <option value="draft">Draft (Not Published)</option>
              <option value="published">Published (Live)</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <label className="space-y-2 text-sm md:col-span-2">
            <span className="text-sm font-medium text-slate-200">Images</span>
            <div className="flex gap-2 items-center">
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files?.[0])} className="text-sm text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-blue-700 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-800" />
              {uploading && <div className="text-sm text-slate-300">Uploading…</div>}
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {(form.images || []).filter(Boolean).map((img) => (
                <div key={img} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">{img}</div>
              ))}
            </div>
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-sm font-medium text-slate-200">Tags (comma separated)</span>
            <input value={(form.tags || []).join(', ')} onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((t) => t.trim()) })} className={CONTROL_CLASS} />
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-sm font-medium text-slate-200">Model</span>
            <input value={form.model || ''} onChange={(e) => setForm({ ...form, model: e.target.value })} className={CONTROL_CLASS} />
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-sm font-medium text-slate-200">Description</span>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={CONTROL_CLASS} />
            {errors.description && <div className="text-rose-600 text-xs">{errors.description}</div>}
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-sm font-medium text-slate-200">Key features (one per line)</span>
            <textarea rows={4} value={keyFeaturesToText()} onChange={(e) => setKeyFeaturesFromText(e.target.value)} className={CONTROL_CLASS} />
          </label>

          <label className="space-y-2 text-sm md:col-span-2">
            <span className="text-sm font-medium text-slate-200">Medical information</span>
            <textarea rows={3} value={form.medical_information || ''} onChange={(e) => setForm({ ...form, medical_information: e.target.value })} className={CONTROL_CLASS} />
          </label>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 bg-slate-950 px-6 py-4 sm:px-8">
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">Cancel</button>
          <button type="submit" className="rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">Save changes</button>
        </div>
    </form>
  );
}