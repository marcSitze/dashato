import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadMediaToStorage, getMediaType } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to upload media.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided in request body.' }, { status: 400 });
    }

    // Limit file size (e.g. 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum 50MB limit.' }, { status: 400 });
    }

    const mediaType = getMediaType(file.type, file.name);
    if (mediaType === 'unknown') {
      return NextResponse.json(
        { error: 'Invalid file format. Only images (PNG, JPG, WEBP, GIF, SVG) and videos (MP4, WEBM, MOV) are allowed.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadMediaToStorage(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      filename: uploadResult.filename,
      mediaType: uploadResult.mediaType,
      size: uploadResult.size,
      mimeType: uploadResult.mimeType,
      provider: uploadResult.provider,
    });
  } catch (error: any) {
    console.error('Upload API route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload media file.' },
      { status: 500 }
    );
  }
}
