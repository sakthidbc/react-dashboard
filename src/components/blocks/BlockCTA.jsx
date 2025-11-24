import { useState, useRef } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown, X, Upload } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';

const BlockCTA = ({ data, onChange, onDelete, onMoveUp, onMoveDown }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(data.backgroundImage || null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onChange({ ...data, backgroundImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Call to Action</span>
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
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter CTA title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <RichTextEditor
            value={data.description || ''}
            onChange={(html) => onChange({ ...data, description: html })}
            placeholder="Enter description"
            height="150px"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={data.buttonText || ''}
              onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Button text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Button URL
            </label>
            <input
              type="url"
              value={data.buttonUrl || ''}
              onChange={(e) => onChange({ ...data, buttonUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Button URL"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Background Image (Optional)
          </label>
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  onChange({ ...data, backgroundImage: null });
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-primary cursor-pointer"
            >
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload background image</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockCTA;

