import { supabaseAdmin } from '@/lib/supabase';

export const PRODUCT_IMAGE_BUCKET = process.env.SUPABASE_PRODUCT_IMAGE_BUCKET || 'ikoms-shop';
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
];

export function isValidProductImage(file: File): boolean {
  return (
    Boolean(file?.type) &&
    file.type.startsWith('image/') &&
    file.size <= MAX_PRODUCT_IMAGE_BYTES &&
    ALLOWED_IMAGE_TYPES.includes(file.type)
  );
}

export function getProductImageValidationError(file: File | null): string | null {
  if (!file) {
    return 'No file was selected.';
  }

  if (!file.type || !file.type.startsWith('image/')) {
    return 'Please upload a valid image file.';
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Unsupported image type. Use JPEG, PNG, WebP, GIF, SVG, or AVIF.';
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    return 'Image too large. Maximum size is 5 MB.';
  }

  return null;
}

export function buildProductImageFilename(file: File): string {
  const timestamp = Date.now();
  const originalName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
  return `product-image-${timestamp}-${originalName}`.toLowerCase();
}

export async function uploadProductImage(file: File): Promise<{ publicUrl: string; path: string }> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is only available on the server.');
  }

  const validationError = getProductImageValidationError(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const filePath = buildProductImageFilename(file);
  const { data, error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error || !data?.path) {
    throw new Error(error?.message || 'Failed to upload image to Supabase Storage.');
  }

  const { data: urlData, error: urlError } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(data.path);

  if (urlError || !urlData?.publicUrl) {
    throw new Error(urlError?.message || 'Failed to create public URL for uploaded image.');
  }

  return {
    publicUrl: urlData.publicUrl,
    path: data.path,
  };
}

export function getProductImagePublicUrl(path: string): string {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is only available on the server.');
  }

  const { data, error } = supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);

  if (error) {
    throw new Error(error.message || 'Failed to create public URL for uploaded image.');
  }

  if (!data?.publicUrl) {
    throw new Error('Failed to create public URL for uploaded image.');
  }

  return data.publicUrl;
}
