import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Upload, X, ArrowLeft, Loader, Image as ImageIcon, File, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { getNewsItem, createNews, updateNews } from '../../services/apiService';
import { getCategories } from '../../services/apiService';
import { STORAGE_URL } from '../../config/api';
import RichTextEditor from '../../components/RichTextEditor';
import BlockContentEditor from '../../components/BlockContentEditor';

const NewsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const fileUploadRef = useRef(null);
  const isEditing = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    category_id: '',
    date: '',
    location: '',
    url: '',
    author: '',
    designation: '',
    content: '',
    status: true,
    order_by: 0,
    start_time: '',
    end_time: '',
  });
  const [featureImage, setFeatureImage] = useState(null);
  const [featureImagePreview, setFeatureImagePreview] = useState(null);
  const [originalFeatureImage, setOriginalFeatureImage] = useState(null);
  const [fileUpload, setFileUpload] = useState(null);
  const [fileUploadName, setFileUploadName] = useState('');
  const [existingFileUpload, setExistingFileUpload] = useState(null);
  const [originalFileUpload, setOriginalFileUpload] = useState(null);

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchNewsData();
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

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchNewsData = async () => {
    try {
      setIsLoadingData(true);
      const response = await getNewsItem(id);
      const news = response.data;
      
      // Format date for input type="date" (YYYY-MM-DD)
      let formattedDate = '';
      if (news.date) {
        const dateObj = new Date(news.date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().split('T')[0];
        }
      }
      
      // Format time for input type="time" (HH:MM)
      let formattedStartTime = '';
      if (news.start_time) {
        if (typeof news.start_time === 'string') {
          // If it's already a time string (HH:MM:SS), extract HH:MM
          formattedStartTime = news.start_time.substring(0, 5);
        } else {
          // If it's a datetime, extract time
          const timeObj = new Date(news.start_time);
          if (!isNaN(timeObj.getTime())) {
            formattedStartTime = timeObj.toTimeString().substring(0, 5);
          }
        }
      }
      
      let formattedEndTime = '';
      if (news.end_time) {
        if (typeof news.end_time === 'string') {
          formattedEndTime = news.end_time.substring(0, 5);
        } else {
          const timeObj = new Date(news.end_time);
          if (!isNaN(timeObj.getTime())) {
            formattedEndTime = timeObj.toTimeString().substring(0, 5);
          }
        }
      }
      
      setFormData({
        title: news.title || '',
        slug: news.slug || '',
        excerpt: news.excerpt || '',
        category_id: news.category_id || '',
        date: formattedDate,
        location: news.location || '',
        url: news.url || '',
        author: news.author || '',
        designation: news.designation || '',
        content: news.content || '',
        status: news.status !== undefined ? news.status : true,
        order_by: news.order_by || 0,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
      });
      if (news.feature_image) {
        const imagePath = news.feature_image.startsWith('http') ? news.feature_image : `${STORAGE_URL}/${news.feature_image}`;
        setFeatureImagePreview(imagePath);
        setOriginalFeatureImage(news.feature_image);
      } else {
        setFeatureImagePreview(null);
        setOriginalFeatureImage(null);
      }
      if (news.file_upload) {
        const filePath = news.file_upload;
        setFileUploadName(filePath.split('/').pop());
        setExistingFileUpload(filePath);
        setOriginalFileUpload(filePath);
      } else {
        setOriginalFileUpload(null);
      }
    } catch (error) {
      toast.error('Failed to load news data');
      navigate('/admin/dashboard/news');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFeatureImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeatureImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const removeFeatureImage = () => {
    setFeatureImage(null);
    setFeatureImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUploadClick = () => {
    fileUploadRef.current?.click();
  };

  const handleFileUploadChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }
      setFileUpload(file);
      setFileUploadName(file.name);
    }
    e.target.value = '';
  };

  const removeFileUpload = () => {
    setFileUpload(null);
    setFileUploadName('');
    setExistingFileUpload(null);
    if (fileUploadRef.current) {
      fileUploadRef.current.value = '';
    }
  };

  const downloadFile = () => {
    if (existingFileUpload) {
      const fileUrl = existingFileUpload.startsWith('http') 
        ? existingFileUpload 
        : `${STORAGE_URL}/${existingFileUpload}`;
      window.open(fileUrl, '_blank');
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
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('category_id', formData.category_id || '');
      formDataToSend.append('date', formData.date || '');
      formDataToSend.append('location', formData.location);
      formDataToSend.append('url', formData.url);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('designation', formData.designation);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('status', formData.status ? 1 : 0);
      formDataToSend.append('order_by', formData.order_by);
      formDataToSend.append('start_time', formData.start_time || '');
      formDataToSend.append('end_time', formData.end_time || '');

      // Handle feature image
      if (featureImage) {
        // New image uploaded
        formDataToSend.append('feature_image', featureImage);
      } else if (isEditing && originalFeatureImage && !featureImagePreview) {
        // Original image was removed (no preview means it was removed)
        formDataToSend.append('remove_feature_image', '1');
      }

      // Handle file upload
      if (fileUpload) {
        // New file uploaded
        formDataToSend.append('file_upload', fileUpload);
      } else if (isEditing && originalFileUpload && !existingFileUpload) {
        // Original file was removed
        formDataToSend.append('remove_file_upload', '1');
      }

      if (isEditing) {
        formDataToSend.append('_method', 'PUT');
        await updateNews(id, formDataToSend);
        toast.success('News updated successfully!');
      } else {
        await createNews(formDataToSend);
        toast.success('News created successfully!');
      }

      if (saveAndContinue) {
        if (!isEditing) {
          setFormData({
            title: '',
            slug: '',
            excerpt: '',
            category_id: '',
            date: '',
            location: '',
            url: '',
            author: '',
            designation: '',
            content: '',
            status: true,
            order_by: 0,
            start_time: '',
            end_time: '',
          });
          setFeatureImage(null);
          setFeatureImagePreview(null);
          setFileUpload(null);
          setFileUploadName('');
          setExistingFileUpload(null);
        } else {
          fetchNewsData();
        }
      } else {
        navigate('/admin/dashboard/news');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save news');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading news data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/dashboard/news')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to List
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit News' : 'Create New News'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isEditing ? 'Update news details and content' : 'Add a new news article to your website'}
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter news title"
                />
              </div>
              <div className="md:col-span-2">
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt
                </label>
                <RichTextEditor
                  value={formData.excerpt}
                  onChange={(html) => setFormData(prev => ({ ...prev, excerpt: html }))}
                  placeholder="Enter news excerpt"
                  height="150px"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <BlockContentEditor
                  value={formData.content}
                  onChange={(json) => setFormData(prev => ({ ...prev, content: json }))}
                  placeholder="Click 'Add to content' to add content blocks"
                />
              </div>
            </div>
          </div>

          {/* Media & Files */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
              Media & Files
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Feature Image
                </label>
                {featureImagePreview ? (
                  <div className="relative">
                    <img
                      src={featureImagePreview}
                      alt="Feature preview"
                      className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removeFeatureImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={handleFeatureImageClick}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Click to upload feature image</p>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File Upload
                </label>
                {fileUploadName || existingFileUpload ? (
                  <div className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{fileUploadName}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {existingFileUpload && !fileUpload && (
                        <button
                          type="button"
                          onClick={downloadFile}
                          className="p-1.5 text-primary hover:text-primary-hover transition-colors"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
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

          {/* Event Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
              Event Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Author Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
              Author Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter designation"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="https://example.com"
                />
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order By
                </label>
                <input
                  type="number"
                  name="order_by"
                  value={formData.order_by}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Lower numbers appear first</p>
              </div>
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
            onClick={() => navigate('/admin/dashboard/news')}
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

export default NewsForm;

