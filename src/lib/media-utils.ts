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
 * Extracts 11-character YouTube video ID from various YouTube URL formats
 */
export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/i
  );
  return match && match[1] ? match[1] : null;
}

/**
 * Checks if a URL is a YouTube video link
 */
export function isYouTubeUrl(url: string | null | undefined): boolean {
  return Boolean(getYouTubeVideoId(url));
}

/**
 * Generates responsive YouTube embed URL
 */
export function getYouTubeEmbedUrl(url: string | null | undefined, autoPlay = false): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1${autoPlay ? '&autoplay=1' : ''}`;
}

/**
 * Generates YouTube high-quality cover thumbnail URL
 */
export function getYouTubeThumbnail(url: string | null | undefined): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Checks if URL is a direct video file (mp4, webm, mov, etc.)
 */
export function isDirectVideoUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.m4v') ||
    cleanUrl.endsWith('.avi') ||
    cleanUrl.endsWith('.mkv') ||
    cleanUrl.includes('/video/') ||
    cleanUrl.includes('/videos/')
  );
}

/**
 * Checks if URL points to any video (Direct video file or YouTube video)
 */
export function isVideoUrl(url: string | null | undefined): boolean {
  return isDirectVideoUrl(url) || isYouTubeUrl(url);
}

/**
 * Returns a displayable image thumbnail URL for any media URL.
 * If it's a YouTube video, returns its cover thumbnail.
 * Otherwise returns the original URL or fallback.
 */
export function getDisplayThumbnail(url: string | null | undefined, fallback = ''): string {
  if (!url) return fallback;
  const ytThumb = getYouTubeThumbnail(url);
  if (ytThumb) return ytThumb;
  return url || fallback;
}

/**
 * Finds all YouTube URLs inside a text block (e.g. product description)
 */
export function findYouTubeUrls(text: string | null | undefined): string[] {
  if (!text || typeof text !== 'string') return [];
  const regex = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?[^\s]*v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})[^\s]*/gi;
  const matches = text.match(regex);
  return matches ? Array.from(new Set(matches)) : [];
}
