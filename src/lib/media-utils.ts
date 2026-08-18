const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
];

const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/mpeg',
  'video/m4v',
];

/**
 * Validates media MIME type or file extension (Browser & Server safe)
 */
export function getMediaType(mimeType: string, filename: string): 'image' | 'video' | 'unknown' {
  if (mimeType && SUPPORTED_IMAGE_TYPES.includes(mimeType.toLowerCase())) return 'image';
  if (mimeType && SUPPORTED_VIDEO_TYPES.includes(mimeType.toLowerCase())) return 'video';

  const ext = filename ? filename.substring(filename.lastIndexOf('.')).toLowerCase() : '';
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'].includes(ext)) return 'image';
  if (['.mp4', '.webm', '.mov', '.avi', '.m4v', '.mkv'].includes(ext)) return 'video';

  return 'unknown';
}

/**
 * Checks if URL or file path points to a video (Browser & Server safe)
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.m4v') ||
    cleanUrl.endsWith('.avi') ||
    cleanUrl.includes('/video/') ||
    cleanUrl.includes('/videos/')
  );
}
