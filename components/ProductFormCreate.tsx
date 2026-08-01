"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getProducts, type ShopProduct } from '@/lib/category-products';
import { getAuthToken } from '@/lib/auth/client';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type UploadedProductImage = {
  publicUrl: string;
  path: string;
  alttext?: string;
  displayorder: number;
};

export const PRODUCT_TYPES = [
	{ id: '5d929bda-2cf9-4d3c-8957-5a2093d1f34b', type: 'Clinical Supplies' },
	{ id: '98753de8-7394-4dc9-8865-db651ac207b3', type: 'PPE & Safety Equipment' },
	{ id: '4d71ac64-3355-417d-a454-15a4acd26a03', type: 'Diagnostic Equipment' },
	{ id: '341a1e6f-ebe7-446e-a8df-372e312bd588', type: 'Training & Education' },
	{ id: '71f0d6be-c2e9-4dec-820c-29f82e3eb477', type: 'Home Care & Patient Support' },
	{ id: '3fe11527-e310-4887-95c8-4d16d75be3cd', type: 'Emergency & First Aid' },
	{ id: '422f0a13-36ed-461f-adfa-13b8055b8e0f', type: 'Other' },
];

const CONTROL_CLASS = 'w-full rounded-xl border border-gray-300 bg-gray-700 px-3 py-2.5 text-sm text-gray-100 outline-none placeholder:text-gray-500 focus:border-blue-500';

type Props = {
	storeid: string;
	onSuccess?: (product: ShopProduct) => void;
	onClose: () => void;
};

type FormState = Omit<ShopProduct, 'id' | 'price'> & { id: ''; price: string };

const emptyForm = (): FormState => ({
	id: '', handle: '', name: '', sku: '', product_type: PRODUCT_TYPES[0].id,
	collectionHandle: '', price: '', images: [], tags: [], description: '', model: '',
	key_features: [], medical_information: '', status: 'draft',
});

function buildPayload(form: FormState): ShopProduct {
	const parsedPrice = parseFloat(form.price.toString().replace(',', '.'));
	return {
		...form,
		price: Number.isNaN(parsedPrice) ? 0 : parsedPrice,
		images: form.images.filter(Boolean),
		tags: form.tags.map((tag) => tag.trim()).filter(Boolean),
		key_features: (form.key_features || []).map((feature) => feature.trim()).filter(Boolean),
		description: form.description || '',
		medical_information: form.medical_information || '',
		status: form.status || 'draft',
	};
}

export default function ProductFormCreate({ storeid, onSuccess, onClose }: Props) {
	const [form, setForm] = useState<FormState>(emptyForm);

	const [products, setProducts] = useState<ShopProduct[]>([]);
	const [loadingProducts, setLoadingProducts] = useState(true);
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [uploadedImages, setUploadedImages] = useState<UploadedProductImage[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [pendingProduct, setPendingProduct] = useState<ShopProduct | null>(null);
	const [saving, setSaving] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);

	/*
	 * Fetches product options from the backend and updates the products state, handling loading and error states.
	 */
	useEffect(() => {
		getProducts(false).then(setProducts).catch(() => setProducts([])).finally(() => setLoadingProducts(false));
	}, []);

	const handles = useMemo(() => Array.from(new Set(products.map((p) => p.handle).filter(Boolean))), [products]); 				  //- Memoized list of unique product handles derived from the fetched products, used for populating the handle dropdown in the form
	const collections = useMemo(() => Array.from(new Set(products.map((p) => p.collectionHandle).filter(Boolean))), [products]);  //- Memoized list of unique collection handles derived from the fetched products, used for populating the collection handle dropdown in the form

	useEffect(() => {
		if (handles.length || collections.length)  																				  //- Check if handles or collections are available before setting default values
		{
			setForm((current) => ({
				...current,
				handle: current.handle || handles[0] || '',
				collectionHandle: current.collectionHandle || collections[0] || ''
			})); 																												  //- Set default handle and collectionHandle if they are not already set in the form state
		}
	}, [collections, handles]);

	const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

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

	const handleUpload = async (file?: File) => {
		if (!file) return;
		setUploadError(null);
		setUploading(true);

		if (file.size > 5 * 1024 * 1024) {
			setUploadError('Image too large. Maximum size is 5MB.');
			setUploading(false);
			return;
		}

		if (!file.type.startsWith('image/')) {
			setUploadError('Invalid file type. Please upload an image.');
			setUploading(false);
			return;
		}

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

			setUploadedImages((current) => [
				...current,
				{
					publicUrl: data.publicUrl,
					path: data.path,
					alttext: file.name,
					displayorder: current.length,
				},
			]);
		} catch (error) {
			setUploadError(error instanceof Error ? error.message : 'Upload failed');
		} finally {
			setUploading(false);
		}
	};

	const submit = (event: React.FormEvent) => {
		event.preventDefault();
		if (validate()) {
			setApiError(null);
			setPendingProduct(buildPayload(form));
		}
	};

	const confirmCreate = async () => {
		if (!pendingProduct || saving) return;
		setSaving(true);
		setApiError(null);
		try {
			const token = await getAuthToken();
			if (!token) throw new Error('Not authenticated - please log in');
			const response = await fetch('/api/admin/products', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({
					storeid,
					name: pendingProduct.name,
					handle: pendingProduct.handle,
					sku: pendingProduct.sku,
					price: pendingProduct.price,
					description: pendingProduct.description,
					producttypeid: pendingProduct.product_type,
					model: pendingProduct.model,
					medical_information: pendingProduct.medical_information,
					status: pendingProduct.status,
					images: uploadedImages.map((image) => ({
						imageurl: image.publicUrl,
						alttext: image.alttext || '',
						displayorder: image.displayorder,
					})),
				}),
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error || 'Failed to create product');
			setPendingProduct(null);
			onSuccess?.(result.data || pendingProduct);
			onClose();


		} catch (error) {
			setApiError(error instanceof Error ? error.message : 'Failed to create product');
		} finally {
			setSaving(false);
		}
	};

	if (loadingProducts) return <div className="p-8 text-center text-white">Loading product options...</div>;

	return (
		<>
			<form
				onSubmit={submit}
				className="
							flex h-[85vh] 
							max-h-[85vh] 
							w-full flex-col 
							overflow-hidden 
							rounded-3xl 
							border border-white/10 
							bg-slate-950 
							text-white 
							shadow-2xl
						"
			> 																													  {/* Create Product Form */}
				<div className="border-b border-white/10 px-6 py-5"> 															  {/* Form header with title and description */}
					<h2 className="text-lg font-semibold">
						New product
					</h2>
					<p className="text-sm text-gray-300">
						Add a product to the storefront.
					</p>
				</div>

				<div className="grid h-0 min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2 sm:p-8">
					<label className="space-y-2 text-sm"> 																		  {/* Product name input field */}
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

					<label className="space-y-2 text-sm"> 																		  {/* Product handle input field */}
						Handle
						<select
							value={form.handle}
							onChange={(e) => update('handle', e.target.value)}
							className={CONTROL_CLASS}
						>
							<option value="">
								Select handle
							</option>

							{handles.map((handle) =>
								<option
									key={handle}
									value={handle}
								>
									{handle}
								</option>
							)}
						</select>

						{errors.handle &&
							<span className="text-xs text-rose-400">
								{errors.handle}
							</span>}
					</label>

					<label className="space-y-2 text-sm"> 																		  {/* SKU input field */}
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

					<label className="space-y-2 text-sm"> 																		  {/* Price input field */}
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

					<label className="space-y-2 text-sm"> 																		  {/* Product type input field */}
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

					<label className="space-y-2 text-sm"> 																		  {/* Collection handle input field */}
						Collection handle
						<select
							value={form.collectionHandle}
							onChange={(e) => update('collectionHandle', e.target.value)}
							className={CONTROL_CLASS}
						>
							<option value="">
								Select collection
							</option>

							{collections.map((collection) =>
								<option
									key={collection}
									value={collection}
								>
									{collection}
								</option>
							)}
						</select>
					</label>

					<label className="space-y-2 text-sm"> 																		  {/* Status input field */}
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

					<label className="space-y-2 text-sm"> 																		  {/* Images input field */}
						Images
						<input
							type="file"
							accept="image/*"
							onChange={(e) => handleUpload(e.target.files?.[0])}
							className="text-sm"
						/>
						{uploading &&
							<span>
								Uploading...
							</span>}
						{uploading && (
							<span className="text-xs text-slate-300">Uploading image...</span>
						)}
						{uploadError && (
							<span className="block text-xs text-rose-400">{uploadError}</span>
						)}
						{uploadedImages.length > 0 && (
							<div className="space-y-2 pt-2 text-xs text-slate-300">
								{uploadedImages.map((image) => (
									<div key={image.path} className="flex items-center justify-between gap-4 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2">
										<span className="truncate">{image.publicUrl}</span>
										<span className="text-slate-500">Image {image.displayorder + 1}</span>
									</div>
								))}
							</div>
						)}
					</label>

					<label className="space-y-2 text-sm"> 																		  {/* Tags input field */}
						Tags
						<input
							value={form.tags.join(', ')}
							onChange={(e) => update('tags', e.target.value.split(','))}
							className={CONTROL_CLASS}
						/>
					</label>

					<label className="space-y-2 text-sm"> 																		  {/* Model input field */}
						Model
						<input
							value={form.model}
							onChange={(e) => update('model', e.target.value)}
							className={CONTROL_CLASS}
						/>
					</label>

					<label className="space-y-2 text-sm"> 																		  {/* Description input field */}
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

					<label className="space-y-2 text-sm"> 																		  {/* Key features input field */}
						Key features
						<textarea
							rows={4}
							value={(form.key_features || []).join('\n')}
							onChange={(e) => update('key_features', e.target.value.split('\n'))}
							className={CONTROL_CLASS}
						/>
					</label>

					<label className="space-y-2 text-sm sm:col-span-2"> 														  {/* Medical information input field */}
						Medical information
						<textarea
							rows={3}
							value={form.medical_information}
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
						className="rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white"
					>
						Submit
					</button>
				</div>
			</form>

			<AlertDialog open={Boolean(pendingProduct)} onOpenChange={(open) => { if (!open && !saving) setPendingProduct(null); }}>
				<AlertDialogContent className="max-w-lg border border-white/10 bg-slate-950/95 p-0 text-white shadow-2xl shadow-black/40 backdrop-blur-xl">
					<div className="rounded-t-3xl border-b border-white/10 bg-gradient-to-r from-sky-600/20 via-slate-900/90 to-cyan-500/20 px-6 py-5">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/15 text-sky-300">
								<AlertTriangle className="h-5 w-5" />
							</div>
							<div>
								<AlertDialogTitle className="text-lg font-semibold text-white">Confirm product creation</AlertDialogTitle>
								<AlertDialogDescription className="mt-1 text-sm leading-6 text-slate-300">You are about to create a new product and send it to the backend.</AlertDialogDescription>
							</div>
						</div>
					</div>
					<div className="px-6 py-5">
						<div className="rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-500/10 via-slate-900/80 to-cyan-500/10 p-4 text-sm text-slate-200">
							<p className="font-semibold text-white">Please review before continuing</p>
							<p className="mt-2 leading-6 text-slate-300">This will add the product to your store catalog and submit it to the server for approval.</p>
							<ul className="mt-3 space-y-1 text-sm text-slate-300">
								<li>• Review the entered details before you confirm.</li>
								<li>• The request will be sent immediately after confirmation.</li>
								<li>• You can cancel at any time.</li>
							</ul>
						</div>
						{apiError && <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{apiError}</p>}
					</div>
					<AlertDialogFooter className="border-t border-white/10 px-6 py-4">
						<AlertDialogCancel disabled={saving} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">Cancel</AlertDialogCancel>
						<AlertDialogAction type="button" onClick={confirmCreate} disabled={saving} className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60">{saving ? 'Creating...' : 'Confirm create'}</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
