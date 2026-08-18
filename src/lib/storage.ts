import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { getMediaType } from './media-utils';

// Environment variables
const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'product-media';

// Supabase S3 Credentials
const s3AccessKey = process.env.AWS_ACCESS_KEY_ID || process.env.SUPABASE_S3_ACCESS_KEY_ID || '';
const s3SecretKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.SUPABASE_S3_SECRET_ACCESS_KEY || '';
const s3Endpoint = process.env.SUPABASE_S3_ENDPOINT || process.env.AWS_ENDPOINT || '';
const s3Region = process.env.SUPABASE_S3_REGION || process.env.AWS_REGION || 'eu-west-1';

// Base Supabase URL (clean format e.g. https://project.supabase.co)
let cleanSupabaseUrl = rawSupabaseUrl;
if (cleanSupabaseUrl.includes('.storage.supabase.co')) {
  const match = cleanSupabaseUrl.match(/https:\/\/([a-z0-9-]+)\.storage\.supabase\.co/);
  if (match && match[1]) {
    cleanSupabaseUrl = `https://${match[1]}.supabase.co`;
  }
}

// 1. Supabase S3 Client
const hasS3Config = Boolean(s3AccessKey && s3SecretKey && s3Endpoint);
const s3Client = hasS3Config
  ? new S3Client({
      endpoint: s3Endpoint,
      region: s3Region,
      credentials: {
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretKey,
      },
      forcePathStyle: true,
    })
  : null;

// 2. Supabase Storage JS Client
const supabase =
  cleanSupabaseUrl && supabaseKey && !cleanSupabaseUrl.includes('/s3')
    ? createClient(cleanSupabaseUrl, supabaseKey)
    : null;

export interface UploadResult {
  url: string;
  filename: string;
  mediaType: 'image' | 'video';
  size: number;
  mimeType: string;
  provider: 'supabase-s3' | 'supabase' | 'local';
}

export { getMediaType, isVideoUrl } from './media-utils';

/**
 * Uploads media file to Supabase S3 / Supabase Storage (or fallback to local disk)
 */
export async function uploadMediaToStorage(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<UploadResult> {
  const mediaType = getMediaType(mimeType, originalFilename);
  if (mediaType === 'unknown') {
    throw new Error(
      'Unsupported file format. Please upload an image (JPG, PNG, WEBP, GIF, SVG) or video (MP4, WEBM, MOV).'
    );
  }

  // Generate unique filename with timestamp
  const ext = path.extname(originalFilename) || (mediaType === 'video' ? '.mp4' : '.jpg');
  const safeBaseName = path
    .basename(originalFilename, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);
  const uniqueFilename = `${Date.now()}_${safeBaseName}${ext}`;
  const folder = mediaType === 'video' ? 'videos' : 'images';
  const filePath = `${folder}/${uniqueFilename}`;

  // Strategy A: Upload via Supabase AWS S3 compatibility layer if S3 credentials exist
  if (s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await s3Client.send(command);

      // Determine public Supabase Storage URL for uploaded object
      let publicUrl = '';
      const match = s3Endpoint.match(/https:\/\/([a-z0-9-]+)\.(storage\.)?supabase\.co/);
      if (match && match[1]) {
        const projectRef = match[1];
        publicUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`;
      } else {
        publicUrl = `${s3Endpoint.replace(/\/s3\/?$/, '')}/object/public/${bucketName}/${filePath}`;
      }

      console.log('Successfully uploaded file to Supabase S3:', publicUrl);

      return {
        url: publicUrl,
        filename: uniqueFilename,
        mediaType,
        size: fileBuffer.length,
        mimeType,
        provider: 'supabase-s3',
      };
    } catch (s3Err: any) {
      console.error('Supabase S3 upload error:', s3Err?.message || s3Err);
    }
  }

  // Strategy B: Upload via Supabase Storage JS Client if initialized
  if (supabase) {
    try {
      const { error } = await supabase.storage.from(bucketName).upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

      if (error) {
        if (error.message.includes('not found') || error.message.includes('Bucket')) {
          await supabase.storage.createBucket(bucketName, { public: true });
          const retry = await supabase.storage.from(bucketName).upload(filePath, fileBuffer, {
            contentType: mimeType,
            upsert: true,
          });
          if (retry.error) throw retry.error;
        } else {
          throw error;
        }
      }

      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        return {
          url: publicUrlData.publicUrl,
          filename: uniqueFilename,
          mediaType,
          size: fileBuffer.length,
          mimeType,
          provider: 'supabase',
        };
      }
    } catch (supabaseError: any) {
      console.error('Supabase JS upload error:', supabaseError?.message || supabaseError);
    }
  }

  // Strategy C: Local filesystem fallback
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localFilePath = path.join(uploadsDir, uniqueFilename);
  fs.writeFileSync(localFilePath, fileBuffer);

  const publicUrl = `/uploads/${folder}/${uniqueFilename}`;

  return {
    url: publicUrl,
    filename: uniqueFilename,
    mediaType,
    size: fileBuffer.length,
    mimeType,
    provider: 'local',
  };
}
