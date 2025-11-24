import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader, Upload, X, Image as ImageIcon, File } from 'lucide-react';
import toast from 'react-hot-toast';
import RichTextEditor from '../RichTextEditor';
import api from '../../services/apiService';
import { STORAGE_URL } from '../../config/api';
import { getFieldConfig, getLabelClassName } from '../../config/commonFields';

const DynamicForm = ({ moduleConfig, apiService }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);

  const moduleName = moduleConfig.name;
  const moduleLabel = moduleConfig.label;
  const routePath = moduleConfig.routePath;
  const fields = moduleConfig.fields || [];

  const [formData, setFormData] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const [originalFiles, setOriginalFiles] = useState({});
  const fileInputRefs = useRef({});

  useEffect(() => {
    // Initialize form data
    const initialData = { status: true };
    fields.forEach(field => {
      if (field.type === 'boolean') {
        initialData[field.name] = false;
      } else if (field.type === 'date') {
        initialData[field.name] = new Date().toISOString().split('T')[0];
      } else if (field.type === 'multiselect' || field.type === 'checkbox') {
        initialData[field.name] = [];
      } else if (field.type === 'json') {
        initialData[field.name] = '{}';
      } else {
        initialData[field.name] = '';
      }
    });
    setFormData(initialData);

    if (isEditing) {
      fetchItemData();
    }
  }, [id, isEditing]);

  const fetchItemData = async () => {
    try {
      setIsLoadingData(true);
      const response = await apiService.getItem(id);
      const item = response.data;
      
      const data = { status: item.status !== undefined ? item.status : true };
      fields.forEach(field => {
        if (field.type === 'date' && item[field.name]) {
          data[field.name] = new Date(item[field.name]).toISOString().split('T')[0];
        } else if (field.type === 'datetime' && item[field.name]) {
          const date = new Date(item[field.name]);
          data[field.name] = date.toISOString().slice(0, 16);
        } else if (field.type === 'time' && item[field.name]) {
          const date = new Date(item[field.name]);
          data[field.name] = date.toTimeString().slice(0, 5);
        } else if (field.type === 'boolean') {
          data[field.name] = item[field.name] || false;
        } else if (field.type === 'multiselect' || field.type === 'checkbox') {
          data[field.name] = Array.isArray(item[field.name]) ? item[field.name] : (item[field.name] ? [item[field.name]] : []);
        } else if (field.type === 'json') {
          data[field.name] = typeof item[field.name] === 'string' ? item[field.name] : JSON.stringify(item[field.name] || {});
        } else {
          data[field.name] = item[field.name] || '';
        }
        
        // Set previews for images/files
        if ((field.type === 'image' || field.type === 'file') && item[field.name]) {
          const filePath = item[field.name].startsWith('http') 
            ? item[field.name] 
            : `${STORAGE_URL}/${item[field.name]}`;
          setFilePreviews(prev => ({
            ...prev,
            [field.name]: filePath
          }));
          setOriginalFiles(prev => ({
            ...prev,
            [field.name]: item[field.name]
          }));
        }
      });
      setFormData(data);
    } catch (error) {
      toast.error(`Failed to load ${moduleLabel.toLowerCase()} data`);
      navigate(routePath);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (fieldName, fieldType, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, [fieldName]: file }));
    
    // Create preview for images
    if (fieldType === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else if (fieldType === 'file') {
      setFilePreviews(prev => ({ ...prev, [fieldName]: file.name }));
    }
  };

  const handleFileClick = (fieldName) => {
    if (fileInputRefs.current[fieldName]) {
      fileInputRefs.current[fieldName].click();
    }
  };

  const handleRemoveFile = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));
    setFilePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fieldName];
      return newPreviews;
    });
    setOriginalFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[fieldName];
      return newFiles;
    });
    if (fileInputRefs.current[fieldName]) {
      fileInputRefs.current[fieldName].value = '';
    }
  };

  const validateForm = () => {
    for (const field of fields) {
      if (field.required && !formData[field.name]) {
        toast.error(`${field.label} is required`);
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
      const submitData = new FormData();
      
      fields.forEach(field => {
        const value = formData[field.name];
        
        if (field.type === 'file' || field.type === 'image') {
          // Robust File check - avoids instanceof to prevent errors
          const isFile = value && typeof value === 'object' && value.constructor && value.constructor.name === 'File';
          if (isFile) {
            submitData.append(field.name, value);
          } else if (isEditing && !filePreviews[field.name] && originalFiles[field.name]) {
            // Mark for removal if file was removed
            submitData.append(`remove_${field.name}`, '1');
          }
        } else if (field.type === 'boolean') {
          submitData.append(field.name, value ? '1' : '0');
        } else if (field.type === 'multiselect' || field.type === 'checkbox') {
          // Handle arrays for multiselect and checkbox
          if (Array.isArray(value)) {
            submitData.append(field.name, JSON.stringify(value));
          } else if (value !== null && value !== undefined && value !== '') {
            submitData.append(field.name, value);
          }
        } else if (field.type === 'json') {
          // Handle JSON fields
          if (value !== null && value !== undefined && value !== '') {
            submitData.append(field.name, typeof value === 'string' ? value : JSON.stringify(value));
          }
        } else if (value !== null && value !== undefined && value !== '') {
          submitData.append(field.name, value);
        }
      });
      
      // Add status field
      submitData.append('status', formData.status !== undefined ? (formData.status ? '1' : '0') : '1');

      if (isEditing) {
        await apiService.updateItem(id, submitData);
        toast.success(`${moduleLabel} updated successfully!`);
      } else {
        const response = await apiService.createItem(submitData);
        toast.success(`${moduleLabel} created successfully!`);
        if (saveAndContinue) {
          navigate(`${routePath}/edit/${response.data.item.id}`);
        } else {
          navigate(routePath);
        }
        return;
      }

      if (saveAndContinue && isEditing) {
        fetchItemData();
      } else if (!saveAndContinue) {
        navigate(routePath);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.errors || error.message || `Failed to save ${moduleLabel.toLowerCase()}`;
      toast.error(typeof errorMessage === 'string' ? errorMessage : `Failed to save ${moduleLabel.toLowerCase()}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    const fieldConfig = getFieldConfig(field.type);
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <input
            type={field.type}
            name={field.name}
            value={value}
            onChange={handleInputChange}
            className={fieldConfig.className}
            placeholder={fieldConfig.placeholder(field.label)}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={value}
            onChange={handleInputChange}
            className={fieldConfig.className}
            placeholder={fieldConfig.placeholder(field.label)}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={value}
            onChange={handleInputChange}
            rows={fieldConfig.rows || 4}
            className={fieldConfig.className}
            placeholder={fieldConfig.placeholder(field.label)}
          />
        );
      
      case 'richtext':
        return (
          <RichTextEditor
            value={value}
            onChange={(html) => setFormData(prev => ({ ...prev, [field.name]: html }))}
            placeholder={fieldConfig.placeholder(field.label)}
            height="300px"
          />
        );
      
      case 'date':
      case 'datetime':
        return (
          <input
            type={field.type === 'datetime' ? 'datetime-local' : 'date'}
            name={field.name}
            value={value}
            onChange={handleInputChange}
            className={fieldConfig.className}
          />
        );
      
      case 'time':
        return (
          <input
            type="time"
            name={field.name}
            value={value}
            onChange={handleInputChange}
            className={fieldConfig.className}
          />
        );
      
      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              name={field.name}
              value={value || '#000000'}
              onChange={handleInputChange}
              className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={value || '#000000'}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
              className={fieldConfig.className}
              placeholder="#000000"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            />
          </div>
        );
      
      case 'select':
        const selectOptions = field.options || [];
        return (
          <select
            name={field.name}
            value={value}
            onChange={handleInputChange}
            className={fieldConfig.className}
          >
            <option value="">Select {field.label}</option>
            {selectOptions.map((option, idx) => (
              <option key={idx} value={typeof option === 'object' ? option.value : option}>
                {typeof option === 'object' ? option.label : option}
              </option>
            ))}
          </select>
        );
      
      case 'multiselect':
        const multiOptions = field.options || [];
        const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
        return (
          <div>
            <select
              multiple
              name={field.name}
              value={selectedValues}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFormData(prev => ({ ...prev, [field.name]: selected }));
              }}
              className={fieldConfig.className}
              size={Math.min(multiOptions.length, 5)}
            >
              {multiOptions.map((option, idx) => {
                const optValue = typeof option === 'object' ? option.value : option;
                const optLabel = typeof option === 'object' ? option.label : option;
                return (
                  <option key={idx} value={optValue}>
                    {optLabel}
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Hold Ctrl/Cmd to select multiple options
            </p>
          </div>
        );
      
      case 'radio':
        const radioOptions = field.options || [];
        return (
          <div className="space-y-2">
            {radioOptions.map((option, idx) => {
              const optValue = typeof option === 'object' ? option.value : option;
              const optLabel = typeof option === 'object' ? option.label : option;
              return (
                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.name}
                    value={optValue}
                    checked={value === optValue}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{optLabel}</span>
                </label>
              );
            })}
          </div>
        );
      
      case 'checkbox':
        const checkboxOptions = field.options || [];
        const checkedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {checkboxOptions.map((option, idx) => {
              const optValue = typeof option === 'object' ? option.value : option;
              const optLabel = typeof option === 'object' ? option.label : option;
              const isChecked = checkedValues.includes(optValue);
              return (
                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkedValues, optValue]
                        : checkedValues.filter(v => v !== optValue);
                      setFormData(prev => ({ ...prev, [field.name]: newValues }));
                    }}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{optLabel}</span>
                </label>
              );
            })}
          </div>
        );
      
      case 'json':
        return (
          <div>
            <textarea
              name={field.name}
              value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData(prev => ({ ...prev, [field.name]: parsed }));
                } catch {
                  setFormData(prev => ({ ...prev, [field.name]: e.target.value }));
                }
              }}
              rows={6}
              className={fieldConfig.className}
              placeholder='{"key": "value"}'
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter valid JSON format
            </p>
          </div>
        );
      
      case 'boolean':
        return (
          <div className={fieldConfig.containerClassName}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={field.name}
                checked={value === true}
                onChange={() => setFormData(prev => ({ ...prev, [field.name]: true }))}
                className={fieldConfig.radioClassName}
              />
              <span className={fieldConfig.labelClassName}>Yes</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={field.name}
                checked={value === false}
                onChange={() => setFormData(prev => ({ ...prev, [field.name]: false }))}
                className={fieldConfig.radioClassName}
              />
              <span className={fieldConfig.labelClassName}>No</span>
            </label>
          </div>
        );
      
      case 'image':
        return (
          <div>
            {filePreviews[field.name] ? (
              <div className="relative group">
                <img
                  src={filePreviews[field.name]}
                  alt={field.label}
                  className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFileClick(field.name)}
                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(field.name)}
                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                  >
                    Remove
                  </button>
                </div>
                <input
                  ref={(el) => (fileInputRefs.current[field.name] = el)}
                  type="file"
                  name={field.name}
                  accept="image/*"
                  onChange={(e) => handleFileChange(field.name, 'image', e)}
                  className="hidden"
                />
              </div>
            ) : (
              <div
                onClick={() => handleFileClick(field.name)}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
              >
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
                <input
                  ref={(el) => (fileInputRefs.current[field.name] = el)}
                  type="file"
                  name={field.name}
                  accept="image/*"
                  onChange={(e) => handleFileChange(field.name, 'image', e)}
                  className="hidden"
                />
              </div>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div>
            {filePreviews[field.name] ? (
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {typeof filePreviews[field.name] === 'string' && filePreviews[field.name].startsWith('http')
                        ? filePreviews[field.name].split('/').pop()
                        : filePreviews[field.name]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">File uploaded</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFileClick(field.name)}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(field.name)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  ref={(el) => (fileInputRefs.current[field.name] = el)}
                  type="file"
                  name={field.name}
                  onChange={(e) => handleFileChange(field.name, 'file', e)}
                  className="hidden"
                />
              </div>
            ) : (
              <div
                onClick={() => handleFileClick(field.name)}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
              >
                <File className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Any file type up to 10MB
                </p>
                <input
                  ref={(el) => (fileInputRefs.current[field.name] = el)}
                  type="file"
                  name={field.name}
                  onChange={(e) => handleFileChange(field.name, 'file', e)}
                  className="hidden"
                />
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            name={field.name}
            value={value}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        );
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
          onClick={() => navigate(routePath)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to List
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? `Edit ${moduleLabel}` : `Create New ${moduleLabel}`}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isEditing ? `Update ${moduleLabel.toLowerCase()} details` : `Add a new ${moduleLabel.toLowerCase()}`}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 lg:p-8 shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
              {moduleLabel} Information
            </h2>
            <div className="space-y-6">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className={getLabelClassName(field.required)}>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>

          {/* Settings Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
              Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Status
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="status"
                      value="true"
                      checked={formData.status === true}
                      onChange={() => setFormData(prev => ({ ...prev, status: true }))}
                      className="w-5 h-5 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-primary transition-colors">Active</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="status"
                      value="false"
                      checked={formData.status === false}
                      onChange={() => setFormData(prev => ({ ...prev, status: false }))}
                      className="w-5 h-5 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-primary transition-colors">Inactive</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(routePath)}
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

export default DynamicForm;

