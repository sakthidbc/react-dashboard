import { GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';

const BlockText = ({ data, onChange, onDelete, onMoveUp, onMoveDown }) => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Text Block</span>
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
      <RichTextEditor
        value={data.content || ''}
        onChange={(html) => onChange({ ...data, content: html })}
        placeholder="Enter text content"
        height="300px"
      />
    </div>
  );
};

export default BlockText;

