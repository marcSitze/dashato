import { describe, it, expect } from 'vitest';
import {
  getYouTubeVideoId,
  isYouTubeUrl,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
  isDirectVideoUrl,
  isVideoUrl,
  getDisplayThumbnail,
  findYouTubeUrls,
} from '../src/lib/media-utils';

describe('Media Utilities - YouTube & Video Support', () => {
  const sampleId = 'dQw4w9WgXcQ';

  const testCases = [
    `https://www.youtube.com/watch?v=${sampleId}`,
    `https://youtube.com/watch?v=${sampleId}&feature=share`,
    `https://m.youtube.com/watch?v=${sampleId}`,
    `https://youtu.be/${sampleId}`,
    `https://youtu.be/${sampleId}?t=42`,
    `https://www.youtube.com/embed/${sampleId}`,
    `https://www.youtube.com/shorts/${sampleId}`,
    `https://www.youtube-nocookie.com/embed/${sampleId}`,
  ];

  it('should extract video ID and identify YouTube URLs correctly', () => {
    for (const url of testCases) {
      expect(getYouTubeVideoId(url)).toBe(sampleId);
      expect(isYouTubeUrl(url)).toBe(true);
      expect(isVideoUrl(url)).toBe(true);
      expect(getYouTubeEmbedUrl(url)).toContain(`https://www.youtube.com/embed/${sampleId}`);
      expect(getYouTubeThumbnail(url)).toBe(`https://img.youtube.com/vi/${sampleId}/hqdefault.jpg`);
    }
  });

  it('should recognize direct video files', () => {
    expect(isDirectVideoUrl('https://example.com/video.mp4')).toBe(true);
    expect(isDirectVideoUrl('https://supabase.co/storage/v1/s3/videos/demo.webm')).toBe(true);
    expect(isDirectVideoUrl('https://example.com/movie.mov?token=123')).toBe(true);
    expect(isVideoUrl('https://example.com/video.mp4')).toBe(true);

    expect(isDirectVideoUrl('https://example.com/photo.jpg')).toBe(false);
    expect(isYouTubeUrl('https://example.com/video.mp4')).toBe(false);
  });

  it('should distinguish images from videos', () => {
    expect(isVideoUrl('https://images.unsplash.com/photo-123.jpg')).toBe(false);
    expect(isVideoUrl('https://example.com/banner.png')).toBe(false);
    expect(getDisplayThumbnail('https://images.unsplash.com/photo-123.jpg')).toBe(
      'https://images.unsplash.com/photo-123.jpg'
    );
  });

  it('should return YouTube thumbnail for display thumbnail', () => {
    expect(getDisplayThumbnail(`https://www.youtube.com/watch?v=${sampleId}`)).toBe(
      `https://img.youtube.com/vi/${sampleId}/hqdefault.jpg`
    );
  });

  it('should find YouTube URLs in text blocks', () => {
    const description = `
      Check out this amazing product!
      Video demo: https://www.youtube.com/watch?v=dQw4w9WgXcQ
      Or watch the short version here: https://youtu.be/abc12345678
      Thanks for watching!
    `;

    const found = findYouTubeUrls(description);
    expect(found.length).toBe(2);
    expect(found[0]).toContain('dQw4w9WgXcQ');
    expect(found[1]).toContain('abc12345678');
  });
});
