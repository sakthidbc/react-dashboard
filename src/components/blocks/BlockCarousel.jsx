import { useState, useRef } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown, X, Upload, Plus } from 'lucide-react';

const BlockCarousel = ({ data, onChange, onDelete, onMoveUp, onMoveDown }) => {
  const fileInputRef = useRef(null);

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageAdd = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...(data.images || []), { id: Date.now(), image: reader.result, alt: '' }];
        onChange({ ...data, images: newImages });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const removeImage = (id) => {
    onChange({ ...data, images: (data.images || []).filter(img => img.id !== id) });
  };

  const updateImage = (id, updates) => {
    onChange({
      ...data,
      images: (data.images || []).map(img => img.id === id ? { ...img, ...updates } : img)
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Image carousel</span>
        </div>
        <div className="flex items-center gap-2">
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronUp className="w-4 h-4 text-gray-500" />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Images
          </label>
          <div className="space-y-3">
            {(data.images || []).map((img, index) => (
              <div key={img.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Image {index + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                {img.image && (
                  <img
                    src={img.image}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <input
                  type="text"
                  value={img.alt || ''}
                  onChange={(e) => updateImage(img.id, { alt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Alt text"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addImage}
              className="w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageAdd}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockCarousel;

