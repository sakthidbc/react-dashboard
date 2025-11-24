import { useState } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';

const BlockTabs = ({ data, onChange, onDelete, onMoveUp, onMoveDown }) => {
  const addTab = () => {
    const newItems = [...(data.items || []), { id: Date.now(), title: '', content: '', accordionItems: [] }];
    onChange({ ...data, items: newItems });
  };

  const removeTab = (id) => {
    onChange({ ...data, items: (data.items || []).filter(item => item.id !== id) });
  };

  const updateTab = (id, updates) => {
    onChange({
      ...data,
      items: (data.items || []).map(item => item.id === id ? { ...item, ...updates } : item)
    });
  };

  const addAccordionItem = (tabId) => {
    updateTab(tabId, {
      accordionItems: [...((data.items || []).find(item => item.id === tabId)?.accordionItems || []), 
        { id: Date.now(), heading: '', body: '' }]
    });
  };

  const removeAccordionItem = (tabId, accordionId) => {
    const tab = (data.items || []).find(item => item.id === tabId);
    if (tab) {
      updateTab(tabId, {
        accordionItems: (tab.accordionItems || []).filter(item => item.id !== accordionId)
      });
    }
  };

  const updateAccordionItem = (tabId, accordionId, updates) => {
    const tab = (data.items || []).find(item => item.id === tabId);
    if (tab) {
      updateTab(tabId, {
        accordionItems: (tab.accordionItems || []).map(item => 
          item.id === accordionId ? { ...item, ...updates } : item
        )
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tabs</span>
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
            Tab Items
          </label>
          <div className="space-y-3">
            {(data.items || []).map((item, index) => (
              <div key={item.id} className="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Tab {index + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTab(item.id)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tab Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateTab(item.id, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      placeholder="Enter tab title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tab Content <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      value={item.content || ''}
                      onChange={(html) => updateTab(item.id, { content: html })}
                      placeholder="Enter tab content"
                      height="200px"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Accordion Items (Optional)
                    </label>
                    <div className="space-y-2">
                      {(item.accordionItems || []).map((accordionItem) => (
                        <div key={accordionItem.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-3 h-3 text-gray-400" />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAccordionItem(item.id, accordionItem.id)}
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={accordionItem.heading || ''}
                              onChange={(e) => updateAccordionItem(item.id, accordionItem.id, { heading: e.target.value })}
                              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                              placeholder="Heading"
                            />
                            <RichTextEditor
                              value={accordionItem.body || ''}
                              onChange={(html) => updateAccordionItem(item.id, accordionItem.id, { body: html })}
                              placeholder="Body"
                              height="150px"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addAccordionItem(item.id)}
                        className="w-full px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-xs"
                      >
                        <Plus className="w-3 h-3" />
                        Add to accordion items (Optional)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTab}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add to tab items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockTabs;

