"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { getProducts, type ShopProduct, normalizeShopTag } from '@/lib/category-products';

type Props = {
  product?: ShopProduct | null;
  onSave: (product: ShopProduct) => void;
  onClose: () => void;
};

export default function ProductForm({ product, onSave, onClose }: Props) {
  const products = useMemo(() => getProducts(true), []);

  const handles = useMemo(() => Array.from(new Set(products.map((p) => p.handle).filter(Boolean))), [products]);
  const types = useMemo(() => Array.from(new Set(products.map((p) => p.product_type).filter(Boolean))), [products]);
  const collections = useMemo(() => Array.from(new Set(products.map((p) => p.collectionHandle).filter(Boolean))), [products]);

  const [form, setForm] = useState<ShopProduct>(() => ({
    id: product?.id ?? '',
    handle: product?.handle ?? (handles[0] ?? ''),
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    product_type: product?.product_type ?? (types[0] ?? ''),
    collectionHandle: product?.collectionHandle ?? (collections[0] ?? ''),
    price: product?.price ?? 0,
    images: product?.images?.length ? product!.images : [''],
    tags: product?.tags ?? [],
    description: product?.description ?? '',
    model: product?.model ?? '',
    key_features: product?.key_features ?? [],
    medical_information: product?.medical_information ?? '',
    status: product?.status ?? 'active',
  }));

  useEffect(() => {
    // reset scroll lock
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (product) setForm({
      id: product.id,
      handle: product.handle,
      name: product.name,
      sku: product.sku,
      product_type: product.product_type,
      collectionHandle: product.collectionHandle,
      price: product.price,
      images: product.images?.length ? product.images : [''],
      tags: product.tags ?? [],
      description: product.description ?? '',
      model: product.model ?? '',
      key_features: product.key_features ?? [],
      medical_information: product.medical_information ?? '',
      status: product.status ?? 'active',
    });
  }, [product]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name || form.name.trim() === '') e.name = 'Product name is required';
    if (!form.sku || form.sku.trim() === '') e.sku = 'SKU is required';
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
      // ignore for now
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
      status: form.status || 'active',
    };

    onSave(out);
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{product ? 'Edit product' : 'New product'}</h2>
          <p className="text-sm text-slate-500">Update shop product details for the storefront.</p>
        </div>
        <div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900">Close</button>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-slate-700">Product name</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {errors.name && <div className="text-rose-600 text-xs">{errors.name}</div>}
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-slate-700">Handle</span>
            <select value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
              {handles.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-slate-700">SKU</span>
            <input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {errors.sku && <div className="text-rose-600 text-xs">{errors.sku}</div>}
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-slate-700">Price</span>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={String(form.price)}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {errors.price && <div className="text-rose-600 text-xs">{errors.price}</div>}
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-slate-700">Product type</span>
            <select value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-slate-700">Collection handle</span>
            <select value={form.collectionHandle} onChange={(e) => setForm({ ...form, collectionHandle: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
              {collections.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <label className="space-y-2 text-sm">
          <span className="text-slate-700">Status</span>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-slate-700">Images</span>
          <div className="flex gap-2 items-center">
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files?.[0])} />
            {uploading && <div className="text-sm text-slate-500">Uploading…</div>}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {(form.images || []).filter(Boolean).map((img) => (
              <div key={img} className="text-xs bg-slate-100 px-2 py-1 rounded">{img}</div>
            ))}
          </div>
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-slate-700">Tags (comma separated)</span>
          <input value={(form.tags || []).join(', ')} onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((t) => t.trim()) })} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-slate-700">Model</span>
          <input value={form.model || ''} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-slate-700">Description</span>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          {errors.description && <div className="text-rose-600 text-xs">{errors.description}</div>}
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-slate-700">Key features (one per line)</span>
          <textarea rows={4} value={keyFeaturesToText()} onChange={(e) => setKeyFeaturesFromText(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-slate-700">Medical information</span>
          <textarea rows={3} value={form.medical_information || ''} onChange={(e) => setForm({ ...form, medical_information: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
        <button type="submit" onClick={handleSubmit} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Save changes</button>
      </div>
    </form>
  );
}
