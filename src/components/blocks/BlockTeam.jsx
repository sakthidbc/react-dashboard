import { useState, useRef } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown, Plus, X, Upload } from 'lucide-react';

const BlockTeam = ({ data, onChange, onDelete, onMoveUp, onMoveDown }) => {
  const addMember = () => {
    const newItems = [...(data.items || []), { 
      id: Date.now(), 
      name: '', 
      position: '', 
      bio: '', 
      email: '',
      phone: '',
      social: { facebook: '', twitter: '', linkedin: '', instagram: '' },
      image: null 
    }];
    onChange({ ...data, items: newItems });
  };

  const removeMember = (id) => {
    onChange({ ...data, items: (data.items || []).filter(item => item.id !== id) });
  };

  const updateMember = (id, updates) => {
    onChange({
      ...data,
      items: (data.items || []).map(item => item.id === id ? { ...item, ...updates } : item)
    });
  };

  const handleImageChange = (id, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateMember(id, { image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Members</span>
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
                <span className="text-xs text-gray-500">Member {index + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => removeMember(item.id)}
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
                    onChange={(e) => updateMember(item.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.position || ''}
                    onChange={(e) => updateMember(item.id, { position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Position"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  value={item.bio || ''}
                  onChange={(e) => updateMember(item.id, { bio: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Short bio"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={item.email || ''}
                    onChange={(e) => updateMember(item.id, { email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={item.phone || ''}
                    onChange={(e) => updateMember(item.id, { phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Phone"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Social Links
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="url"
                    value={item.social?.facebook || ''}
                    onChange={(e) => updateMember(item.id, { social: { ...item.social, facebook: e.target.value } })}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    placeholder="Facebook"
                  />
                  <input
                    type="url"
                    value={item.social?.twitter || ''}
                    onChange={(e) => updateMember(item.id, { social: { ...item.social, twitter: e.target.value } })}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    placeholder="Twitter"
                  />
                  <input
                    type="url"
                    value={item.social?.linkedin || ''}
                    onChange={(e) => updateMember(item.id, { social: { ...item.social, linkedin: e.target.value } })}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    placeholder="LinkedIn"
                  />
                  <input
                    type="url"
                    value={item.social?.instagram || ''}
                    onChange={(e) => updateMember(item.id, { social: { ...item.social, instagram: e.target.value } })}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    placeholder="Instagram"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Photo
                </label>
                {item.image ? (
                  <div className="relative inline-block">
                    <img src={item.image} alt="Member" className="w-20 h-20 rounded-full object-cover" />
                    <button
                      type="button"
                      onClick={() => updateMember(item.id, { image: null })}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="inline-block cursor-pointer">
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center hover:border-primary">
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
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addMember}
          className="w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>
    </div>
  );
};

export default BlockTeam;

