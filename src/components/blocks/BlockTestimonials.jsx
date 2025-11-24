import { useState } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown, Plus, Star, X, Upload } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';

const BlockTestimonials = ({ data, onChange, onDelete, onMoveUp, onMoveDown }) => {
  const addTestimonial = () => {
    const newItems = [...(data.items || []), { 
      id: Date.now(), 
      name: '', 
      position: '', 
      company: '', 
      content: '', 
      rating: 5,
      avatar: null 
    }];
    onChange({ ...data, items: newItems });
  };

  const removeTestimonial = (id) => {
    onChange({ ...data, items: (data.items || []).filter(item => item.id !== id) });
  };

  const updateTestimonial = (id, updates) => {
    onChange({
      ...data,
      items: (data.items || []).map(item => item.id === id ? { ...item, ...updates } : item)
    });
  };

  const handleAvatarChange = (id, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateTestimonial(id, { avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Testimonials</span>
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
                <span className="text-xs text-gray-500">Testimonial {index + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => removeTestimonial(item.id)}
                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.name || ''}
                    onChange={(e) => updateTestimonial(item.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={item.position || ''}
                    onChange={(e) => updateTestimonial(item.id, { position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Position"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={item.company || ''}
                  onChange={(e) => updateTestimonial(item.id, { company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Company"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => updateTestimonial(item.id, { rating: star })}
                      className={`${item.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={item.content || ''}
                  onChange={(html) => updateTestimonial(item.id, { content: html })}
                  placeholder="Testimonial content"
                  height="150px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Avatar (Optional)
                </label>
                {item.avatar ? (
                  <div className="relative inline-block">
                    <img src={item.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                    <button
                      type="button"
                      onClick={() => updateTestimonial(item.id, { avatar: null })}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="inline-block cursor-pointer">
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center hover:border-primary">
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAvatarChange(item.id, e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addTestimonial}
          className="w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>
    </div>
  );
};

export default BlockTestimonials;

