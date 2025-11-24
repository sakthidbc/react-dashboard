import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSocialIcon, createSocialIcon, updateSocialIcon, getAvailableIcons } from '../../services/apiService';

const SocialIconsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const [availableIcons, setAvailableIcons] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    icon: '',
    url: '',
    target: '_blank',
    status: true,
    order_by: 0,
  });

  useEffect(() => {
    fetchAvailableIcons();
    if (isEditing) {
      fetchSocialIconData();
    }
  }, [id]);

  const fetchAvailableIcons = async () => {
    try {
      const response = await getAvailableIcons();
      setAvailableIcons(response.data || {});
    } catch (error) {
      // Fallback to default icons if API fails
      setAvailableIcons({
        facebook: 'Facebook',
        twitter: 'Twitter',
        x: 'X (Twitter)',
        instagram: 'Instagram',
        linkedin: 'LinkedIn',
        youtube: 'YouTube',
        pinterest: 'Pinterest',
        tiktok: 'TikTok',
        snapchat: 'Snapchat',
        whatsapp: 'WhatsApp',
        telegram: 'Telegram',
        discord: 'Discord',
        github: 'GitHub',
        dribbble: 'Dribbble',
        behance: 'Behance',
        medium: 'Medium',
        reddit: 'Reddit',
        vimeo: 'Vimeo',
        skype: 'Skype',
        email: 'Email',
        website: 'Website',
      });
    }
  };

  const fetchSocialIconData = async () => {
    try {
      setIsLoadingData(true);
      const response = await getSocialIcon(id);
      const icon = response.data;
      setFormData({
        title: icon.title || '',
        icon: icon.icon || '',
        url: icon.url || '',
        target: icon.target || '_blank',
        status: icon.status !== undefined ? icon.status : true,
        order_by: icon.order_by || 0,
      });
    } catch (error) {
      toast.error('Failed to load social icon data');
      navigate('/admin/dashboard/social-icons');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value),
    }));
  };

  const handleStatusChange = (value) => {
    setFormData(prev => ({ ...prev, status: value === 'true' }));
  };

  const handleTargetChange = (value) => {
    setFormData(prev => ({ ...prev, target: value }));
  };

  const validateForm = () => {
    if (!formData.title || formData.title.trim() === '') {
      toast.error('Title is required');
      return false;
    }
    if (!formData.icon || formData.icon.trim() === '') {
      toast.error('Icon is required');
      return false;
    }
    if (!formData.url || formData.url.trim() === '') {
      toast.error('URL is required');
      return false;
    }
    // Validate URL format
    try {
      new URL(formData.url);
    } catch (e) {
      toast.error('Please enter a valid URL');
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
      const submitData = {
        title: formData.title,
        icon: formData.icon,
        url: formData.url,
        target: formData.target,
        status: formData.status ? 1 : 0,
        order_by: formData.order_by || 0,
      };

      if (isEditing) {
        await updateSocialIcon(id, submitData);
        toast.success('Social icon updated successfully!');
      } else {
        await createSocialIcon(submitData);
        toast.success('Social icon created successfully!');
      }

      if (saveAndContinue) {
        if (!isEditing) {
          navigate(0);
        }
      } else {
        navigate('/admin/dashboard/social-icons');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save social icon';
      toast.error(errorMessage);
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
    <div className="p-4 lg:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/admin/dashboard/social-icons')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to List
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Social Icon' : 'Create New Social Icon'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isEditing ? 'Update social icon details' : 'Add a new social media link'}
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
            <div className="space-y-6">
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
                    placeholder="Enter social icon title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select an icon</option>
                    {Object.entries(availableIcons).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <ExternalLink className="w-4 h-4 inline mr-2" />
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="https://example.com"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Enter the full URL for the social media profile</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link Target
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="target"
                      value="_self"
                      checked={formData.target === '_self'}
                      onChange={() => handleTargetChange('_self')}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                      Same Tab
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="target"
                      value="_blank"
                      checked={formData.target === '_blank'}
                      onChange={() => handleTargetChange('_blank')}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                      New Tab
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order By
                </label>
                <input
                  type="number"
                  name="order_by"
                  value={formData.order_by}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Lower numbers appear first</p>
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
                      onChange={() => handleStatusChange('true')}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                      Active
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="status"
                      value="false"
                      checked={formData.status === false}
                      onChange={() => handleStatusChange('false')}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                      Inactive
                    </span>
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
            onClick={() => navigate('/admin/dashboard/social-icons')}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSaving}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader className="w-5 h-5 animate-spin inline" /> : 'Save & Continue'}
          </button>
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

export default SocialIconsForm;

