import { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { api } from '@/lib/api';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
}

export function PhotoUpload({ photos, onPhotosChange }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotos = [...photos];

    for (const file of Array.from(files)) {
      try {
        // Client-side compression
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        const { url } = await api.uploadPhoto(
          new File([compressed], file.name, { type: compressed.type })
        );
        newPhotos.push(url);
      } catch (err) {
        console.error('Photo upload failed:', err);
      }
    }

    onPhotosChange(newPhotos);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removePhoto = (idx: number) => {
    onPhotosChange(photos.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={url}
                alt={`사진 ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full py-4 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">업로드 중...</span>
          </>
        ) : (
          <>
            <Camera className="w-8 h-8" />
            <span className="text-sm">사진 촬영 또는 선택</span>
          </>
        )}
      </button>
    </div>
  );
}
