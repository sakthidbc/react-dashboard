import { useState, useRef } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown, Plus, X, Upload } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';

const BlockServices = ({ data, onChange, onDelete, onMoveUp, onMoveDown }) => {
  const addService = () => {
    const newItems = [...(data.items || []), { 
      id: Date.now(), 
      title: '', 
      description: '', 
      icon: null,
      image: null,
      link: ''
    }];
    onChange({ ...data, items: newItems });
  };

  const removeService = (id) => {
    onChange({ ...data, items: (data.items || []).filter(item => item.id !== id) });
  };

  const updateService = (id, updates) => {
    onChange({
      ...data,
      items: (data.items || []).map(item => item.id === id ? { ...item, ...updates } : item)
    });
  };

  const handleImageChange = (id, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateService(id, { image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Services</span>
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
        {(data.items || []).map((item, index) => (
          <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Service {index + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => removeService(item.id)}
                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => updateService(item.id, { title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Service title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <RichTextEditor
                  value={item.description || ''}
                  onChange={(html) => updateService(item.id, { description: html })}
                  placeholder="Service description"
                  height="150px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image (Optional)
                </label>
                {item.image ? (
                  <div className="relative inline-block">
                    <img src={item.image} alt="Service" className="w-24 h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => updateService(item.id, { image: null })}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="inline-block cursor-pointer">
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-primary">
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(item.id, e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link (Optional)
                </label>
                <input
                  type="url"
                  value={item.link || ''}
                  onChange={(e) => updateService(item.id, { link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Service link"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addService}
          className="w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>
    </div>
  );
};

export default BlockServices;

