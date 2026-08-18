'use client';

import * as React from 'react';
import { Upload, Film, Image as ImageIcon, Trash2, Star, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isVideoUrl } from '@/lib/media-utils';
import { toast } from 'sonner';

interface MediaItem {
  url: string;
  isMain?: boolean;
}

interface MediaUploaderProps {
  mediaUrls: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function MediaUploader({ mediaUrls, onChange, maxFiles = 10 }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [externalUrl, setExternalUrl] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    if (mediaUrls.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} media items per product.`);
      return;
    }

    setIsUploading(true);
    const newUploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        newUploadedUrls.push(data.url);
      }

      onChange([...mediaUrls, ...newUploadedUrls]);
      toast.success(
        files.length === 1
          ? 'Media uploaded to storage successfully!'
          : `${files.length} media files uploaded successfully!`
      );
    } catch (err: any) {
      toast.error(err.message || 'Media upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleAddExternalUrl = () => {
    if (!externalUrl.trim()) return;
    if (mediaUrls.includes(externalUrl.trim())) {
      toast.error('This media URL is already added.');
      return;
    }
    onChange([...mediaUrls, externalUrl.trim()]);
    setExternalUrl('');
    toast.success('Media URL added successfully!');
  };

  const handleRemoveMedia = (index: number) => {
    const updated = mediaUrls.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMakeMain = (index: number) => {
    if (index === 0) return;
    const target = mediaUrls[index];
    const rest = mediaUrls.filter((_, i) => i !== index);
    onChange([target, ...rest]);
    toast.success('Primary media updated!');
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-amber-500/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.png,.jpg,.jpeg,.webp,.gif,.svg,.mp4,.webm,.mov"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFilesUpload(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-xs">
            {isUploading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <Upload className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isUploading ? 'Uploading to Supabase Storage...' : 'Click or Drag & Drop Product Media'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload High-Res Images (PNG, JPG, WEBP) or HD Product Videos (MP4, WEBM, MOV) up to 50MB
            </p>
          </div>

          {uploadProgress !== null && (
            <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden mt-2">
              <div
                className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* External URL Option */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="url"
            placeholder="Or paste image/video URL (e.g. https://...)"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            className="pl-9 rounded-xl text-xs"
          />
        </div>
        <Button
          type="button"
          onClick={handleAddExternalUrl}
          variant="outline"
          className="rounded-xl text-xs font-bold px-4"
        >
          Add URL
        </Button>
      </div>

      {/* Media Thumbnails Grid */}
      {mediaUrls.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Uploaded Product Gallery ({mediaUrls.length})</span>
            <span className="text-[11px] font-normal text-slate-400">First item is primary display media</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {mediaUrls.map((url, idx) => {
              const isVideo = isVideoUrl(url);
              const isMain = idx === 0;

              return (
                <div
                  key={idx}
                  className={`group relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 transition-all shadow-sm ${
                    isMain ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Media Content */}
                  {isVideo ? (
                    <video src={url} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  )}

                  {/* Media Type Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    {isMain && (
                      <span className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-slate-950" /> Main
                      </span>
                    )}
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                      {isVideo ? (
                        <>
                          <Film className="w-2.5 h-2.5 text-amber-400" /> Video
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-2.5 h-2.5 text-blue-400" /> Image
                        </>
                      )}
                    </span>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    {!isMain && (
                      <button
                        type="button"
                        onClick={() => handleMakeMain(idx)}
                        title="Set as Main Product Media"
                        className="p-2 rounded-xl bg-white/20 text-white hover:bg-amber-500 hover:text-slate-950 transition-colors"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(idx)}
                      title="Remove Media"
                      className="p-2 rounded-xl bg-rose-600/80 text-white hover:bg-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
