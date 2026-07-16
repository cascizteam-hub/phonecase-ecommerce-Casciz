import { useState } from 'react';
import { uploadImagesApi, deleteImageApi } from '../api/upload';

export default function ImageUploader({ images, onChange, multiple = true }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      const { images: uploaded } = await uploadImagesApi(files);
      onChange(multiple ? [...images, ...uploaded] : uploaded);
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed. Check Cloudinary credentials.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = async (img) => {
    onChange(images.filter((i) => i.publicId !== img.publicId));
    try {
      await deleteImageApi(img.publicId);
    } catch {
      // best-effort cleanup
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-2">
        {images.map((img) => (
          <div key={img.publicId} className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(img)}
              className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/60 text-white text-xs"
            >
              ×
            </button>
          </div>
        ))}
        <label className="h-20 w-20 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 cursor-pointer text-xs text-center">
          {uploading ? '…' : '+ Upload'}
          <input type="file" accept="image/*" multiple={multiple} onChange={handleFiles} className="hidden" />
        </label>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
