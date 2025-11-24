import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader, Plus, Trash2, Code, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { getModuleBuilder, createModuleBuilder, updateModuleBuilder, getFieldTypes } from '../../services/apiService';

const ModuleBuilderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const [fieldTypes, setFieldTypes] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    label: '',
    description: '',
    is_active: true,
    fields: [],
  });

  useEffect(() => {
    fetchFieldTypes();
    if (isEditing) {
      fetchModuleData();
    }
  }, [id, isEditing]);

  const fetchFieldTypes = async () => {
    try {
      const response = await getFieldTypes();
      if (response.data && response.data.types) {
        setFieldTypes(response.data.types);
      } else {
        // Fallback field types if API fails
        setFieldTypes([
          { value: 'text', label: 'Text' },
          { value: 'textarea', label: 'Textarea' },
          { value: 'richtext', label: 'Rich Text Editor' },
          { value: 'number', label: 'Number' },
          { value: 'date', label: 'Date' },
          { value: 'datetime', label: 'Date & Time' },
          { value: 'boolean', label: 'Boolean (Yes/No)' },
          { value: 'image', label: 'Image' },
          { value: 'file', label: 'File' },
          { value: 'url', label: 'URL' },
          { value: 'email', label: 'Email' },
        ]);
      }
    } catch (error) {
      console.error('Failed to load field types:', error);
      // Use fallback field types
      setFieldTypes([
        { value: 'text', label: 'Text' },
        { value: 'textarea', label: 'Textarea' },
        { value: 'richtext', label: 'Rich Text Editor' },
        { value: 'number', label: 'Number' },
        { value: 'date', label: 'Date' },
        { value: 'datetime', label: 'Date & Time' },
        { value: 'boolean', label: 'Boolean (Yes/No)' },
        { value: 'image', label: 'Image' },
        { value: 'file', label: 'File' },
        { value: 'url', label: 'URL' },
        { value: 'email', label: 'Email' },
      ]);
    }
  };

  const fetchModuleData = async () => {
    try {
      setIsLoadingData(true);
      const response = await getModuleBuilder(id);
      const module = response.data;
      setFormData({
        name: module.name || '',
        label: module.label || '',
        description: module.description || '',
        is_active: module.is_active !== undefined ? module.is_active : true,
        fields: module.fields || [],
      });
    } catch (error) {
      toast.error('Failed to load module data');
      navigate('/admin/dashboard/module-builder');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFieldChange = (index, field) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], ...field };
    setFormData(prev => ({ ...prev, fields: newFields }));
  };

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          name: '',
          label: '',
          type: 'text',
          required: false,
        },
      ],
    }));
  };

  const removeField = (index) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, fields: newFields }));
  };

  const validateForm = () => {
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Module name is required');
      return false;
    }
    
    // Validate name format (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(formData.name)) {
      toast.error('Module name can only contain letters, numbers, and underscores');
      return false;
    }

    if (!formData.label || formData.label.trim() === '') {
      toast.error('Module label is required');
      return false;
    }

    if (formData.fields.length === 0) {
      toast.error('At least one field is required');
      return false;
    }

    // Validate all fields
    for (let i = 0; i < formData.fields.length; i++) {
      const field = formData.fields[i];
      if (!field.name || field.name.trim() === '') {
        toast.error(`Field ${i + 1}: Name is required`);
        return false;
      }
      if (!field.label || field.label.trim() === '') {
        toast.error(`Field ${i + 1}: Label is required`);
        return false;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(field.name)) {
        toast.error(`Field ${i + 1}: Name can only contain letters, numbers, and underscores`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e, saveAndContinue = false) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        label: formData.label.trim(),
        description: formData.description.trim(),
        is_active: formData.is_active,
        fields: formData.fields.map(field => ({
          name: field.name.trim(),
          label: field.label.trim(),
          type: field.type,
          required: field.required || false,
        })),
      };

      if (isEditing) {
        await updateModuleBuilder(id, submitData);
        toast.success('Module definition updated successfully!');
      } else {
        const response = await createModuleBuilder(submitData);
        toast.success('Module definition created successfully!');
        if (saveAndContinue) {
          navigate(`/admin/dashboard/module-builder/edit/${response.data.module.id}`);
        } else {
          navigate('/admin/dashboard/module-builder');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.errors || error.message || 'Failed to save module definition';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to save module definition');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/admin/dashboard/module-builder')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to List
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Module Definition' : 'Create New Module'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isEditing ? 'Update module definition' : 'Define a new dynamic module with custom fields'}
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
              <li>Define your module name, label, and fields</li>
              <li>Click "Generate Module" from the list page to create all necessary files</li>
              <li>The system will automatically create: migration, model, controller, and routes</li>
              <li>After generation, the module will appear in the sidebar</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 lg:p-8 shadow-sm space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
              Basic Information
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Module Name <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(e.g., birthday, event, product)</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isEditing}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    placeholder="birthday"
                  />
                  <p className="mt-1 text-xs text-gray-500">Only letters, numbers, and underscores allowed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Birthday"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Brief description of this module..."
                />
              </div>
            </div>
          </div>

          {/* Fields */}
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Fields <span className="text-red-500">*</span>
              </h2>
              <button
                type="button"
                onClick={addField}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>

            {formData.fields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <Code className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No fields added yet</p>
                <button
                  type="button"
                  onClick={addField}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
                >
                  Add Your First Field
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.fields.map((field, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Field {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Field Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => handleFieldChange(index, { name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                          placeholder="title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Field Label <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleFieldChange(index, { label: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                          placeholder="Title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Field Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => handleFieldChange(index, { type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                        >
                          {fieldTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required || false}
                          onChange={(e) => handleFieldChange(index, { required: e.target.checked })}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Required field</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
              Settings
            </h2>
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard/module-builder')}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          {!isEditing && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isSaving}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader className="w-5 h-5 animate-spin inline" /> : 'Save & Continue'}
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModuleBuilderForm;

