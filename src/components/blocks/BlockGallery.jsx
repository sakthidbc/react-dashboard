import { useState, useRef } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown, X, Upload, Plus } from 'lucide-react';

const BlockGallery = ({ data, onChange, onDelete, onMoveUp, onMoveDown }) => {
  const fileInputRef = useRef(null);

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...(data.images || []), { id: Date.now() + Math.random(), image: reader.result, alt: '', title: '' }];
        onChange({ ...data, images: newImages });
      };
      reader.readAsDataURL(file);
    });
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
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gallery</span>
        </div>
        <div className="flex items-center gap-2">
          {onMoveUp && (
            <button type="button" onClick={onMoveUp} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
              <ChevronUp className="w-4 h-4 text-gray-500" />
            </button>
          )}
          {onMoveDown && (
            <button type="button" onClick={onMoveDown} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <button type="button" onClick={onDelete} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Columns
          </label>
          <select
            value={data.columns || 3}
            onChange={(e) => onChange({ ...data, columns: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
            <option value={4}>4 Columns</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Images
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            {(data.images || []).map((img) => (
              <div key={img.id} className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                >
                  <X className="w-3 h-3" />
                </button>
                {img.image && (
                  <img src={img.image} alt="Preview" className="w-full h-24 object-cover rounded mb-2" />
                )}
                <input
                  type="text"
                  value={img.title || ''}
                  onChange={(e) => updateImage(img.id, { title: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm mb-1"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={img.alt || ''}
                  onChange={(e) => updateImage(img.id, { alt: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                  placeholder="Alt text"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addImage}
            className="w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Images
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageAdd}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default BlockGallery;

