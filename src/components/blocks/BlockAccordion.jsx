import { useState } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';

const BlockAccordion = ({ data, onChange, onDelete, onMoveUp, onMoveDown }) => {
  const addItem = () => {
    const newItems = [...(data.items || []), { id: Date.now(), heading: '', body: '' }];
    onChange({ ...data, items: newItems });
  };

  const removeItem = (id) => {
    onChange({ ...data, items: (data.items || []).filter(item => item.id !== id) });
  };

  const updateItem = (id, updates) => {
    onChange({
      ...data,
      items: (data.items || []).map(item => item.id === id ? { ...item, ...updates } : item)
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Accordion</span>
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
            Accordion Items (Optional)
          </label>
          <div className="space-y-3">
            {(data.items || []).map((item, index) => (
              <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Item {index + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Heading <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.heading || ''}
                      onChange={(e) => updateItem(item.id, { heading: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      placeholder="Enter heading"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Body <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      value={item.body || ''}
                      onChange={(html) => updateItem(item.id, { body: html })}
                      placeholder="Enter content"
                      height="200px"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add to accordion items (Optional)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockAccordion;

