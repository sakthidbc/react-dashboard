import { useState } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';

const BlockFAQ = ({ data, onChange, onDelete, onMoveUp, onMoveDown }) => {
  const addFAQ = () => {
    const newItems = [...(data.items || []), { id: Date.now(), question: '', answer: '' }];
    onChange({ ...data, items: newItems });
  };

  const removeFAQ = (id) => {
    onChange({ ...data, items: (data.items || []).filter(item => item.id !== id) });
  };

  const updateFAQ = (id, updates) => {
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
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">FAQ</span>
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
        {(data.items || []).map((item, index) => (
          <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">FAQ {index + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFAQ(item.id)}
                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={item.question || ''}
                  onChange={(e) => updateFAQ(item.id, { question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Enter question"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Answer <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={item.answer || ''}
                  onChange={(html) => updateFAQ(item.id, { answer: html })}
                  placeholder="Enter answer"
                  height="150px"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addFAQ}
          className="w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add FAQ Item
        </button>
      </div>
    </div>
  );
};

export default BlockFAQ;

