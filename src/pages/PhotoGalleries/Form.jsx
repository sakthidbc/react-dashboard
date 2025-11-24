import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader, Image as ImageIcon, Upload, X, FileText, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPhotoGallery, createPhotoGallery, updatePhotoGallery } from '../../services/apiService';
import { STORAGE_URL } from '../../config/api';
import RichTextEditor from '../../components/RichTextEditor';

const PhotoGalleriesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const featureImageInputRef = useRef(null);
  const mainImagesInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    date: new Date().toISOString().split('T')[0],
    author: '',
    status: true,
    order_by: 0,
  });
  const [featureImage, setFeatureImage] = useState(null);
  const [featureImagePreview, setFeatureImagePreview] = useState(null);
  const [originalFeatureImage, setOriginalFeatureImage] = useState(null);
  const [mainImages, setMainImages] = useState([]);
  const [mainImagePreviews, setMainImagePreviews] = useState([]);
  const [existingMainImages, setExistingMainImages] = useState([]);

  useEffect(() => {
    if (isEditing) {
      fetchGalleryData();
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

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (featureImagePreview && featureImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(featureImagePreview);
      }
      mainImagePreviews.forEach(preview => {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [featureImagePreview, mainImagePreviews]);

  const fetchGalleryData = async () => {
    try {
      setIsLoadingData(true);
      const response = await getPhotoGallery(id);
      const gallery = response.data;
      setFormData({
        title: gallery.title || '',
        slug: gallery.slug || '',
        excerpt: gallery.excerpt || '',
        date: gallery.date ? new Date(gallery.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        author: gallery.author || '',
        status: gallery.status !== undefined ? gallery.status : true,
        order_by: gallery.order_by || 0,
      });
      
      // Set feature image
      if (gallery.feature_image) {
        setOriginalFeatureImage(gallery.feature_image);
        setFeatureImagePreview(`${STORAGE_URL}/${gallery.feature_image}`);
      }
      
      // Set main images
      if (gallery.main_images && gallery.main_images.length > 0) {
        setExistingMainImages(gallery.main_images);
        const imageUrls = gallery.main_images.map(img => {
          if (img.startsWith('http')) return img;
          return `${STORAGE_URL}/${img}`;
        });
        setMainImagePreviews(imageUrls);
      }
    } catch (error) {
      toast.error('Failed to load photo gallery data');
      navigate('/admin/dashboard/photo-galleries');
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

  const handleFeatureImageClick = () => {
    featureImageInputRef.current?.click();
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
    if (featureImageInputRef.current) {
      featureImageInputRef.current.value = '';
    }
  };

  const handleMainImagesClick = () => {
    mainImagesInputRef.current?.click();
  };

  const handleMainImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setMainImages(prev => [...prev, ...files]);
    setMainImagePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeMainImage = (index) => {
    const preview = mainImagePreviews[index];
    // Cleanup blob URL if it exists
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    
    // Check if it's an existing image or a new one
    if (index < existingMainImages.length) {
      // It's an existing image - remove from existing list
      setExistingMainImages(prev => prev.filter((_, i) => i !== index));
      setMainImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // It's a new image - remove from new images list
      const newIndex = index - existingMainImages.length;
      setMainImages(prev => prev.filter((_, i) => i !== newIndex));
      setMainImagePreviews(prev => prev.filter((_, i) => i !== index));
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
      submitData.append('title', formData.title);
      submitData.append('slug', formData.slug);
      submitData.append('excerpt', formData.excerpt || '');
      submitData.append('date', formData.date || '');
      submitData.append('author', formData.author || '');
      submitData.append('status', formData.status ? 1 : 0);
      submitData.append('order_by', formData.order_by || 0);

      // Handle feature image
      if (featureImage) {
        submitData.append('feature_image', featureImage);
      } else if (isEditing && !featureImagePreview && originalFeatureImage) {
        submitData.append('remove_feature_image', '1');
      }

      // Handle main images
      // Add existing images that should be kept
      existingMainImages.forEach(imagePath => {
        submitData.append('existing_main_images[]', imagePath);
      });
      
      // Add new images
      mainImages.forEach(image => {
        submitData.append('main_images[]', image);
      });

      if (isEditing) {
        await updatePhotoGallery(id, submitData);
        toast.success('Photo gallery updated successfully!');
      } else {
        await createPhotoGallery(submitData);
        toast.success('Photo gallery created successfully!');
      }

      if (saveAndContinue) {
        if (!isEditing) {
          // After creating, we'd need to get the ID, but for now just refresh
          navigate(0);
        }
      } else {
        navigate('/admin/dashboard/photo-galleries');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save photo gallery';
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
          onClick={() => navigate('/admin/dashboard/photo-galleries')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to List
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Photo Gallery' : 'Create New Photo Gallery'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isEditing ? 'Update photo gallery details' : 'Add a new photo gallery to your website'}
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
                    placeholder="Enter gallery title"
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Auto-generated from title"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Excerpt
                </label>
                <RichTextEditor
                  value={formData.excerpt}
                  onChange={(html) => setFormData(prev => ({ ...prev, excerpt: html }))}
                  placeholder="Enter gallery excerpt"
                  height="150px"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
              Media
            </h2>
            <div className="space-y-6">
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
                      ref={featureImageInputRef}
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
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Click to upload feature image</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
                    <input
                      ref={featureImageInputRef}
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
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Main Images (Multiple)
                </label>
                {mainImagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {mainImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeMainImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  onClick={handleMainImagesClick}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Click to upload images</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB each</p>
                  <input
                    ref={mainImagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMainImagesChange}
                    className="hidden"
                  />
                </div>
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
            onClick={() => navigate('/admin/dashboard/photo-galleries')}
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

export default PhotoGalleriesForm;

