"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2, Upload } from 'lucide-react';
import { getProducts, type ShopProduct } from '@/lib/category-products';
import { getAuthToken } from '@/lib/auth/client';
import { PRODUCT_TYPES } from '@/components/ProductFormCreate';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';

const FORM_STORAGE_KEY = 'product-form-create';                                                                                   //- Key for localStorage to persist form data across sessions
const CONTROL_CLASS = 'w-full rounded-xl border border-gray-300 bg-gray-700 px-3 py-2.5 text-sm text-gray-100 outline-none placeholder:text-gray-500 focus:border-blue-500';

type Props = { product: ShopProduct; storeid: string; onSuccess?: (product: ShopProduct) => void; onClose: () => void };
type EditFormState = Omit<ShopProduct, 'price'> & { price: string };

const buildEditFormState = (product: ShopProduct): EditFormState => ({
    ...product,
    product_type: PRODUCT_TYPES.find((type) => type.id === product.producttypeid)?.id
        || PRODUCT_TYPES.find((type) => type.type === product.product_type)?.id
        || product.producttypeid
        || '',
    price: String(product.price),
    images: product.images?.length ? product.images : product.image_url ? [product.image_url] : [],
    tags: product.tags || [],
    key_features: product.key_features || [],
    description: product.description || '',
    model: product.model || '',
    medical_information: product.medical_information || '',
    status: product.status || 'draft',
});

export default function ProductFormEdit({ product, storeid, onSuccess, onClose }: Props) {
    /*
     * State variables for form data, product options, loading states, and error handling
     * Responsible for managing the form state and handling user interactions
     */
    const [form, setForm] = useState<EditFormState>(() => buildEditFormState(product));

    useEffect(() => {
        setForm(buildEditFormState(product));
    }, [product]);

    const [products, setProducts] = useState<ShopProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [pending, setPending] = useState(false);
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    /*
     * Fetch product options on component mount
     * Populate the products state with available products for selection in the form
     */
    useEffect(() => {
        getProducts(false).then(setProducts).catch(() => setProducts([])).finally(() => setLoadingProducts(false));
    }, []);

    const handles = useMemo(() => Array.from(new Set(products.map((p) => p.handle).filter(Boolean))), [products]);
    const collections = useMemo(() => Array.from(new Set(products.map((p) => p.collectionHandle).filter(Boolean))), [products]);
    const update = <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => setForm((current) => ({ ...current, [key]: value }));
    const validate = () => {
        const next: Record<string, string> = {};
        const parsedPrice = parseFloat(form.price.toString().replace(',', '.'));
        if (!form.name.trim()) next.name = 'Product name is required';
        if (!form.sku.trim()) next.sku = 'SKU is required';
        if (!form.handle.trim()) next.handle = 'Handle is required';
        if (form.price.trim() === '' || Number.isNaN(parsedPrice) || parsedPrice < 0) next.price = 'Enter a valid price like 2.45';
        if (!form.description.trim()) next.description = 'Description is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    };
    const upload = async (file?: File) => {
        if (!file) return;

        setUploadError(null);

        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image too large. Maximum size is 5MB.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setUploadError('Invalid file type. Please upload an image.');
            return;
        }

        setUploading(true);
        try {
            const body = new FormData();
            body.append('file', file);
            const token = await getAuthToken();
            const response = await fetch('/api/admin/upload-image', {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body,
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Image upload failed.');
            }

            const publicUrl = data.publicUrl || data.url;
            if (!publicUrl) {
                throw new Error('Image upload did not return a public URL.');
            }

            update('images', [publicUrl, ...(form.images || []).filter(Boolean)]);
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };
    const submit = (event: React.FormEvent) => { 
                                                event.preventDefault(); 
                                                if (validate()) 
                                                { 
                                                    setApiError(null); setPending(true);                                          //- Show confirmation dialog if validation passes
                                                } 
    };                                                                                                                            //- Handle form submission, validate inputs, and set pending state for confirmation dialog
    const confirmUpdate = async () => {
        if (saving) return;
        setSaving(true);
        setApiError(null);
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated - please log in');
            const parsedPrice = parseFloat(form.price.toString().replace(',', '.'));
            const response = await fetch(`/api/admin/products/${encodeURIComponent(form.id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    name: form.name,
                    handle: form.handle,
                    sku: form.sku,
                    price: Number.isNaN(parsedPrice) ? 0 : parsedPrice,
                    description: form.description || '',
                    producttypeid: form.product_type || null,
                    model: form.model || '',
                    medical_information: form.medical_information || '',
                    product_features: (form.key_features || []).map((feature) => feature.trim()).filter(Boolean),
                    image_url: form.images?.[0] || product.image_url || '',
                    status: form.status || 'draft',
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to save changes');
            setPending(false);
            onSuccess?.(result.data || form);
            onClose();
        } catch (error) {
            setApiError(error instanceof Error ? error.message : 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    if (loadingProducts) return <div className="p-8 text-center text-white">Loading product options...</div>;                     //- Show loading state while fetching product options

    return (<>

        <form
            onSubmit={submit}
            className="
                        flex h-[85vh] max-h-[85vh] 
                        w-full flex-col 
                        overflow-hidden 
                        rounded-3xl 
                        border border-white/10 
                        bg-slate-950 
                        text-white 
                        shadow-2xl
                    "
        >                                                                                                                         {/* Edit Form container */}
            <div className="border-b border-white/10 px-6 py-5">
                <h2 className="text-lg font-semibold">
                    Edit product
                </h2>
                <p className="text-sm text-gray-300">
                    Update shop product details for the storefront.
                </p>
            </div>

            <div className="grid h-0 min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2 sm:p-8">
                <label className="space-y-2 text-sm">                                                                             {/* Product name input field */}
                    Product name
                    <input
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        className={CONTROL_CLASS}
                    />
                    {errors.name &&
                        <span className="text-xs text-rose-400">
                            {errors.name}
                        </span>}
                </label>

                <label className="space-y-2 text-sm">                                                                             {/* Product handle input field */}
                    Handle
                    <select
                        value={form.handle}
                        onChange={(e) => update('handle', e.target.value)}
                        className={CONTROL_CLASS}
                    >
                        {handles.map((handle) =>
                            <option
                                key={handle}
                                value={handle}
                            >
                                {handle}
                            </option>
                        )}

                        {!handles.includes(form.handle) &&
                            <option value={form.handle}>
                                {form.handle}
                            </option>}
                    </select>

                    {errors.handle &&
                        <span className="text-xs text-rose-400">
                            {errors.handle}
                        </span>}
                </label>

                <label className="space-y-2 text-sm">                                                                             {/* SKU input field */}
                    SKU
                    <input
                        value={form.sku}
                        onChange={(e) => update('sku', e.target.value)}
                        className={CONTROL_CLASS}
                    />
                    {errors.sku &&
                        <span className="text-xs text-rose-400">
                            {errors.sku}
                        </span>}
                </label>

                <label className="space-y-2 text-sm">                                                                             {/* Price input field */}
                    Price
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="2.45"
                        value={form.price}
                        onChange={(e) => update('price', e.target.value)}
                        className={CONTROL_CLASS}
                    />
                    {errors.price &&
                        <span className="text-xs text-rose-400">
                            {errors.price}
                        </span>}
                </label>

                <label className="space-y-2 text-sm">                                                                             {/* Product type input field */}
                    Product type
                    <select
                        value={form.product_type}
                        onChange={(e) => update('product_type', e.target.value)}
                        className={CONTROL_CLASS}
                    >
                        {PRODUCT_TYPES.map((type) =>
                            <option
                                key={type.id}
                                value={type.id}
                            >
                                {type.type}
                            </option>
                        )}
                    </select>
                </label>

                <label className="space-y-2 text-sm">                                                                             {/* Collection handle input field */}
                    Collection handle
                    <select
                        value={form.collectionHandle}
                        onChange={(e) => update('collectionHandle', e.target.value)}
                        className={CONTROL_CLASS}
                    >
                        {collections.map((collection) =>
                            <option
                                key={collection}
                                value={collection}
                            >
                                {collection}
                            </option>
                        )}

                        {!collections.includes(form.collectionHandle) &&
                            <option value={form.collectionHandle}>
                                {form.collectionHandle}
                            </option>}
                    </select>
                </label>

                <label className="space-y-2 text-sm">                                                                             {/* Status input field */}
                    Status
                    <select
                        value={form.status}
                        onChange={(e) => update('status', e.target.value)}
                        className={CONTROL_CLASS}
                    >
                        <option value="draft">
                            Draft
                        </option>
                        <option value="published">
                            Published
                        </option>
                        <option value="archived">
                            Archived
                        </option>
                    </select>
                </label>

                <label className="space-y-2 text-sm">                                                                             {/* Images input field */}
                    Images
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-blue-400/70 bg-blue-500/10 px-4 py-4 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20">
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Uploading image...' : 'Click to upload an image'}
                        <input
                            type="file"
                            accept="image/*"
                            disabled={uploading}
                            onChange={(e) => {
                                upload(e.target.files?.[0]);
                                e.currentTarget.value = '';
                            }}
                            className="sr-only"
                        />
                    </label>
                    {uploadError && <span className="block text-xs text-rose-400">{uploadError}</span>}
                    {(form.images || []).map((image) => (
                        <span key={image} className="block truncate text-xs text-slate-400">{image}</span>
                    ))}
                </label>

                <label className="space-y-2 text-sm">                                                                             {/* Tags input field */}
                    Tags
                    <input
                        value={(form.tags || []).join(', ')}
                        onChange={(e) => update('tags', e.target.value.split(','))}
                        className={CONTROL_CLASS}
                    />
                </label>

                <label className="space-y-2 text-sm">                                                                             {/* Model input field */}
                    Model
                    <input
                        value={form.model || ''}
                        onChange={(e) => update('model', e.target.value)}
                        className={CONTROL_CLASS}
                    />
                </label>

                <label className="space-y-2 text-sm">                                                                             {/* Description input field */}
                    Description
                    <textarea
                        rows={4}
                        value={form.description}
                        onChange={(e) => update('description', e.target.value)}
                        className={CONTROL_CLASS}
                    />
                    {errors.description &&
                        <span className="text-xs text-rose-400">
                            {errors.description}
                        </span>}
                </label>

                <label className="space-y-2 text-sm">                                                                             {/* Key features input field */}
                    Key features
                    <textarea
                        rows={4}
                        value={(form.key_features || []).join('\n')}
                        onChange={(e) => update('key_features', e.target.value.split('\n'))}
                        className={CONTROL_CLASS}
                    />
                </label>

                <label className="space-y-2 text-sm sm:col-span-2">                                                               {/* Medical information input field */}
                    Medical information
                    <textarea
                        rows={3}
                        value={form.medical_information || ''}
                        onChange={(e) => update('medical_information', e.target.value)}
                        className={CONTROL_CLASS}
                    />
                </label>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-white/10 bg-slate-950 px-6 py-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={pending || saving || uploading}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {pending || saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : 'Submit'}
                </button>
            </div>
        </form>

        <AlertDialog open={pending} onOpenChange={(open) => { if (!open && !saving) setPending(false); }}>
            <AlertDialogContent className="max-w-lg border border-white/10 bg-slate-950/95 p-0 text-white shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="rounded-t-3xl border-b border-white/10 bg-gradient-to-r from-amber-600/20 via-slate-900/90 to-orange-500/20 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/15 text-amber-300">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <AlertDialogTitle className="text-lg font-semibold text-white">Confirm save changes</AlertDialogTitle>
                            <AlertDialogDescription className="mt-1 text-sm leading-6 text-slate-300">You have made product edits. Confirm to send the update to the backend.</AlertDialogDescription>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-5">
                    <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-orange-500/10 p-4 text-sm text-slate-200">
                        <p className="font-semibold text-white">Please review before continuing</p>
                        <p className="mt-2 leading-6 text-slate-300">This will update the product data on the server. Review your changes before confirming.</p>
                        <ul className="mt-3 space-y-1 text-sm text-slate-300">
                            <li>• Updated details will replace the current catalog values.</li>
                            <li>• The change is submitted immediately after confirmation.</li>
                            <li>• You can cancel without saving anything.</li>
                        </ul>
                    </div>
                    {apiError && <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{apiError}</p>}
                </div>
                <AlertDialogFooter className="border-t border-white/10 px-6 py-4">
                    <AlertDialogCancel disabled={saving} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">Cancel</AlertDialogCancel>
                    <AlertDialogAction type="button" onClick={confirmUpdate} disabled={saving} className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
                        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : 'Confirm update'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>);
}