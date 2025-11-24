import { useState } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown, Plus, X } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';

const BlockContact = ({ data, onChange, onDelete, onMoveUp, onMoveDown }) => {
  const availableFields = [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'subject', label: 'Subject' },
    { id: 'message', label: 'Message' },
    { id: 'company', label: 'Company' },
    { id: 'address', label: 'Address' },
  ];

  const toggleField = (fieldId) => {
    const currentFields = data.fields || [];
    if (currentFields.includes(fieldId)) {
      onChange({ ...data, fields: currentFields.filter(f => f !== fieldId) });
    } else {
      onChange({ ...data, fields: [...currentFields, fieldId] });
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Form</span>
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
            Form Title
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Contact Us"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <RichTextEditor
            value={data.description || ''}
            onChange={(html) => onChange({ ...data, description: html })}
            placeholder="Form description"
            height="100px"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Form Fields
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableFields.map((field) => (
              <label key={field.id} className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <input
                  type="checkbox"
                  checked={(data.fields || []).includes(field.id)}
                  onChange={() => toggleField(field.id)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockContact;

