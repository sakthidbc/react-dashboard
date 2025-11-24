import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCategory, createCategory, updateCategory } from '../../services/apiService';

const CategoriesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: true,
  });

  useEffect(() => {
    if (isEditing) {
      fetchCategoryData();
    }
  }, [id]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !isEditing) {
      const slug = formData.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEditing]);

  const fetchCategoryData = async () => {
    try {
      setIsLoadingData(true);
      const response = await getCategory(id);
      const category = response.data;
      setFormData({
        title: category.title || '',
        slug: category.slug || '',
        status: category.status !== undefined ? category.status : true,
      });
    } catch (error) {
      toast.error('Failed to load category data');
      navigate('/admin/dashboard/categories');
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

  const handleStatusChange = (value) => {
    setFormData(prev => ({ ...prev, status: value === 'true' }));
  };

  const validateForm = () => {
    if (!formData.title || formData.title.trim() === '') {
      toast.error('Title is required');
      return false;
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
      if (isEditing) {
        await updateCategory(id, {
          title: formData.title,
          slug: formData.slug,
          status: formData.status ? 1 : 0,
        });
        toast.success('Category updated successfully!');
      } else {
        await createCategory({
          title: formData.title,
          slug: formData.slug,
          status: formData.status ? 1 : 0,
        });
        toast.success('Category created successfully!');
      }

      if (saveAndContinue) {
        if (!isEditing) {
          setFormData({
            title: '',
            slug: '',
            status: true,
          });
        } else {
          fetchCategoryData();
        }
      } else {
        navigate('/admin/dashboard/categories');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading category data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/dashboard/categories')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to List
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Category' : 'Create New Category'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isEditing ? 'Update category details' : 'Add a new category to your website'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 lg:p-8 shadow-sm space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter category title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm"
                  placeholder="Auto-generated from title"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Slug is auto-generated from title. You can edit it if needed.</p>
              </div>
            </div>
          </div>

          {/* Settings */}
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
                      onChange={(e) => handleStatusChange(e.target.value)}
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
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-5 h-5 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-primary transition-colors">Inactive</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard/categories')}
            disabled={isSaving}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSaving}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
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

export default CategoriesForm;

