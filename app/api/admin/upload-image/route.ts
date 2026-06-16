import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), 'public', 'images', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-')}`;
    const writePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(writePath, buffer);

    const publicPath = `/images/uploads/${safeName}`;
    return NextResponse.json({ path: publicPath });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
