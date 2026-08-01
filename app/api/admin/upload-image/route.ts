import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { uploadProductImage, getProductImageValidationError } from '@/lib/supabase-storage';

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validationError = getProductImageValidationError(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const uploadResult = await uploadProductImage(file);

    return NextResponse.json(
      {
        success: true,
        publicUrl: uploadResult.publicUrl,
        path: uploadResult.path,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload image',
      },
      { status: 500 }
    );
  }
}
