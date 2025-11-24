import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader, FileText, Calendar, User, Upload, X, Image as ImageIcon, File, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPage, createPage, updatePage, getMenus } from '../../services/apiService';
import { STORAGE_URL } from '../../config/api';
import RichTextEditor from '../../components/RichTextEditor';
import BlockContentEditor from '../../components/BlockContentEditor';

const PagesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const [menus, setMenus] = useState([]);
  const fileInputRef = useRef(null);
  const fileUploadRef = useRef(null);

  const [formData, setFormData] = useState({
    menu_id: '',
    title: '',
    slug: '',
    excerpt: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    author: '',
    status: true,
  });
  const [featureImage, setFeatureImage] = useState(null);
  const [featureImagePreview, setFeatureImagePreview] = useState(null);
  const [originalFeatureImage, setOriginalFeatureImage] = useState(null);
  const [fileUpload, setFileUpload] = useState(null);
  const [fileUploadName, setFileUploadName] = useState('');
  const [existingFileUpload, setExistingFileUpload] = useState(null);
  const [originalFileUpload, setOriginalFileUpload] = useState(null);

  useEffect(() => {
    fetchMenus();
    if (isEditing) {
      fetchPageData();
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

  const fetchMenus = async () => {
    try {
      const response = await getMenus();
      setMenus(response.data || []);
    } catch (error) {
      console.error('Failed to load menus');
    }
  };

  const fetchPageData = async () => {
    try {
      setIsLoadingData(true);
      const response = await getPage(id);
      const page = response.data;
      setFormData({
        menu_id: page.menu_id || '',
        title: page.title || '',
        slug: page.slug || '',
        excerpt: page.excerpt || '',
        description: page.description || '',
        date: page.date ? new Date(page.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        author: page.author || '',
        status: page.status !== undefined ? page.status : true,
      });
      
      // Set feature image
      if (page.feature_image) {
        setOriginalFeatureImage(page.feature_image);
        setFeatureImagePreview(`${STORAGE_URL}/${page.feature_image}`);
      }
      
      // Set file upload
      if (page.file_upload) {
        setOriginalFileUpload(page.file_upload);
        setExistingFileUpload(page.file_upload);
        setFileUploadName(page.file_upload.split('/').pop());
      }
    } catch (error) {
      toast.error('Failed to load page data');
      navigate('/admin/dashboard/pages');
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

  const handleFeatureImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFeatureImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Cleanup previous blob URL if it exists
      if (featureImagePreview && featureImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(featureImagePreview);
      }
      setFeatureImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeatureImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFeatureImage = () => {
    // Cleanup blob URL if it exists
    if (featureImagePreview && featureImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(featureImagePreview);
    }
    setFeatureImage(null);
    setFeatureImagePreview(null);
    setOriginalFeatureImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (featureImagePreview && featureImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(featureImagePreview);
      }
    };
  }, [featureImagePreview]);

  const handleFileUploadClick = () => {
    fileUploadRef.current?.click();
  };

  const handleFileUploadChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileUpload(file);
      setFileUploadName(file.name);
      setExistingFileUpload(null);
      setOriginalFileUpload(null);
    }
  };

  const removeFileUpload = () => {
    setFileUpload(null);
    setFileUploadName('');
    setExistingFileUpload(null);
    setOriginalFileUpload(null);
    if (fileUploadRef.current) {
      fileUploadRef.current.value = '';
    }
  };

  const downloadFile = () => {
    if (originalFileUpload) {
      window.open(`${STORAGE_URL}/${originalFileUpload}`, '_blank');
    }
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
      const submitData = new FormData();
      submitData.append('menu_id', formData.menu_id || '');
      submitData.append('title', formData.title);
      submitData.append('slug', formData.slug);
      submitData.append('excerpt', formData.excerpt || '');
      submitData.append('description', formData.description || '');
      submitData.append('date', formData.date || '');
      submitData.append('author', formData.author || '');
      submitData.append('status', formData.status ? 1 : 0);

      // Handle feature image
      if (featureImage) {
        submitData.append('feature_image', featureImage);
      } else if (isEditing && !featureImagePreview && originalFeatureImage) {
        submitData.append('remove_feature_image', '1');
      }

      // Handle file upload
      if (fileUpload) {
        submitData.append('file_upload', fileUpload);
      } else if (isEditing && !fileUploadName && originalFileUpload) {
        submitData.append('remove_file_upload', '1');
      }

      if (isEditing) {
        await updatePage(id, submitData);
        toast.success('Page updated successfully!');
      } else {
        await createPage(submitData);
        toast.success('Page created successfully!');
      }

      if (saveAndContinue) {
        if (!isEditing) {
          setFormData({
            menu_id: '',
            title: '',
            slug: '',
            excerpt: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            author: '',
            status: true,
          });
        } else {
          fetchPageData();
        }
      } else {
        navigate('/admin/dashboard/pages');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading page data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/dashboard/pages')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to List
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Page' : 'Create New Page'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isEditing ? 'Update page details' : 'Add a new page to your website'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Menu
                </label>
                <select
                  name="menu_id"
                  value={formData.menu_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Select a menu (optional)</option>
                  {menus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.title} ({menu.type})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Link this page to a menu item</p>
              </div>
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
                    placeholder="Enter page title"
                    required
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt
                </label>
                <RichTextEditor
                  value={formData.excerpt}
                  onChange={(html) => setFormData(prev => ({ ...prev, excerpt: html }))}
                  placeholder="Enter a brief excerpt for this page"
                  height="150px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <BlockContentEditor
                  value={formData.description}
                  onChange={(json) => setFormData(prev => ({ ...prev, description: json }))}
                  placeholder="Click 'Add to content' to add content blocks"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter author name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
              Media
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Feature Image
                </label>
                {featureImagePreview ? (
                  <div className="relative group">
                    <img
                      src={featureImagePreview}
                      alt="Feature preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleFeatureImageClick}
                        className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={removeFeatureImage}
                        className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFeatureImageChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div
                    onClick={handleFeatureImageClick}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Click to upload image</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFeatureImageChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <File className="w-4 h-4 inline mr-2" />
                  File Upload
                </label>
                {fileUploadName || existingFileUpload ? (
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {fileUploadName || existingFileUpload?.split('/').pop()}
                          </p>
                          {existingFileUpload && (
                            <button
                              type="button"
                              onClick={downloadFile}
                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFileUpload}
                        className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={handleFileUploadClick}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Click to upload file</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Any file up to 10MB</p>
                    <input
                      ref={fileUploadRef}
                      type="file"
                      onChange={handleFileUploadChange}
                      className="hidden"
                    />
                  </div>
                )}
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
            onClick={() => navigate('/admin/dashboard/pages')}
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

export default PagesForm;

