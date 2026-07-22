"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { getProducts, type ShopProduct } from '@/lib/category-products';
import { supabase } from '@/lib/supabase';
import { PRODUCT_TYPES } from '@/components/ProductFormCreate';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const CONTROL_CLASS = 'w-full rounded-xl border border-gray-300 bg-gray-700 px-3 py-2.5 text-sm text-gray-100 outline-none placeholder:text-gray-500 focus:border-blue-500';
type Props = { product: ShopProduct; storeid: string; onSuccess?: (product: ShopProduct) => void; onClose: () => void };

export default function ProductFormEdit({ product, storeid, onSuccess, onClose }: Props) {
  const [form, setForm] = useState<ShopProduct>({ ...product, images: product.images?.length ? product.images : [], tags: product.tags || [], key_features: product.key_features || [], description: product.description || '', model: product.model || '', medical_information: product.medical_information || '', status: product.status || 'draft' });
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => { document.body.style.overflow = 'hidden'; getProducts(false).then(setProducts).catch(() => setProducts([])).finally(() => setLoadingProducts(false)); return () => { document.body.style.overflow = ''; }; }, []);
  const handles = useMemo(() => Array.from(new Set(products.map((p) => p.handle).filter(Boolean))), [products]);
  const collections = useMemo(() => Array.from(new Set(products.map((p) => p.collectionHandle).filter(Boolean))), [products]);
  const update = <K extends keyof ShopProduct>(key: K, value: ShopProduct[K]) => setForm((current) => ({ ...current, [key]: value }));
  const validate = () => { const next: Record<string, string> = {}; if (!form.name.trim()) next.name = 'Product name is required'; if (!form.sku.trim()) next.sku = 'SKU is required'; if (!form.handle.trim()) next.handle = 'Handle is required'; if (Number.isNaN(Number(form.price))) next.price = 'Price is required'; if (!form.description.trim()) next.description = 'Description is required'; setErrors(next); return Object.keys(next).length === 0; };
  const upload = async (file?: File) => { if (!file) return; setUploading(true); try { const body = new FormData(); body.append('file', file); const response = await fetch('/api/admin/upload-image', { method: 'POST', body }); const data = await response.json(); if (data?.path) update('images', [data.path, ...(form.images || []).filter(Boolean)]); } finally { setUploading(false); } };
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (validate()) { setApiError(null); setPending(true); } };
  const confirmUpdate = async () => { if (saving) return; setSaving(true); setApiError(null); try { const { data, error } = await supabase.auth.getSession(); if (error || !data.session?.access_token) throw new Error('Not authenticated - please log in'); const response = await fetch(`/api/admin/products/${encodeURIComponent(form.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ name: form.name, handle: form.handle, sku: form.sku, price: Number(form.price) || 0, description: form.description || '', producttypeid: form.product_type || '', model: form.model || '', medical_information: form.medical_information || '', status: form.status || 'draft' }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Failed to save changes'); setPending(false); onSuccess?.(result.data || form); onClose(); } catch (error) { setApiError(error instanceof Error ? error.message : 'Failed to save changes'); } finally { setSaving(false); } };
  if (loadingProducts) return <div className="p-8 text-center text-white">Loading product options...</div>;
  return (<>
    <form onSubmit={submit} className="flex h-[85vh] max-h-[85vh] w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-white shadow-2xl">
      <div className="border-b border-white/10 px-6 py-5"><h2 className="text-lg font-semibold">Edit product</h2><p className="text-sm text-gray-300">Update shop product details for the storefront.</p></div>
      <div className="grid h-0 min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-scroll p-6 sm:grid-cols-2 sm:p-8">
        <label className="space-y-2 text-sm">Product name<input value={form.name} onChange={(e) => update('name', e.target.value)} className={CONTROL_CLASS} />{errors.name && <span className="text-xs text-rose-400">{errors.name}</span>}</label>
        <label className="space-y-2 text-sm">Handle<select value={form.handle} onChange={(e) => update('handle', e.target.value)} className={CONTROL_CLASS}>{handles.map((handle) => <option key={handle} value={handle}>{handle}</option>)}{!handles.includes(form.handle) && <option value={form.handle}>{form.handle}</option>}</select>{errors.handle && <span className="text-xs text-rose-400">{errors.handle}</span>}</label>
        <label className="space-y-2 text-sm">SKU<input value={form.sku} onChange={(e) => update('sku', e.target.value)} className={CONTROL_CLASS} />{errors.sku && <span className="text-xs text-rose-400">{errors.sku}</span>}</label>
        <label className="space-y-2 text-sm">Price<input type="number" min="0" step="0.01" value={String(form.price)} onChange={(e) => update('price', Number(e.target.value))} className={CONTROL_CLASS} />{errors.price && <span className="text-xs text-rose-400">{errors.price}</span>}</label>
        <label className="space-y-2 text-sm">Product type<select value={form.product_type} onChange={(e) => update('product_type', e.target.value)} className={CONTROL_CLASS}>{PRODUCT_TYPES.map((type) => <option key={type.id} value={type.id}>{type.type}</option>)}</select></label>
        <label className="space-y-2 text-sm">Collection handle<select value={form.collectionHandle} onChange={(e) => update('collectionHandle', e.target.value)} className={CONTROL_CLASS}>{collections.map((collection) => <option key={collection} value={collection}>{collection}</option>)}{!collections.includes(form.collectionHandle) && <option value={form.collectionHandle}>{form.collectionHandle}</option>}</select></label>
        <label className="space-y-2 text-sm">Status<select value={form.status} onChange={(e) => update('status', e.target.value)} className={CONTROL_CLASS}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <label className="space-y-2 text-sm">Images<input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} className="text-sm" />{uploading && <span>Uploading...</span>}<span className="block text-xs text-slate-400">{(form.images || []).join(', ')}</span></label>
        <label className="space-y-2 text-sm">Tags<input value={(form.tags || []).join(', ')} onChange={(e) => update('tags', e.target.value.split(','))} className={CONTROL_CLASS} /></label>
        <label className="space-y-2 text-sm">Model<input value={form.model || ''} onChange={(e) => update('model', e.target.value)} className={CONTROL_CLASS} /></label>
        <label className="space-y-2 text-sm">Description<textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} className={CONTROL_CLASS} />{errors.description && <span className="text-xs text-rose-400">{errors.description}</span>}</label>
        <label className="space-y-2 text-sm">Key features<textarea rows={4} value={(form.key_features || []).join('\n')} onChange={(e) => update('key_features', e.target.value.split('\n'))} className={CONTROL_CLASS} /></label>
        <label className="space-y-2 text-sm sm:col-span-2">Medical information<textarea rows={3} value={form.medical_information || ''} onChange={(e) => update('medical_information', e.target.value)} className={CONTROL_CLASS} /></label>
      </div>
      <div className="flex shrink-0 justify-end gap-3 border-t border-white/10 bg-slate-950 px-6 py-4"><button type="button" onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300">Cancel</button><button type="submit" className="rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white">Submit</button></div>
    </form>
    <AlertDialog open={pending} onOpenChange={(open) => { if (!open && !saving) setPending(false); }}><AlertDialogContent className="max-w-lg"><AlertDialogHeader><AlertDialogTitle>Confirm save changes</AlertDialogTitle><AlertDialogDescription>You have made product edits. Confirm to send the update to the backend.</AlertDialogDescription></AlertDialogHeader><div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">Warning</p><p className="mt-2">This will update the product data on the server. Review your changes before confirming.</p></div>{apiError && <p className="mt-3 text-sm text-rose-600">{apiError}</p>}<AlertDialogFooter><AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel><AlertDialogAction type="button" onClick={confirmUpdate} disabled={saving}>{saving ? 'Saving...' : 'Confirm update'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>);
}