import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader, Image as ImageIcon, Upload, X, FileText, Calendar, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAlbumGallery, createAlbumGallery, updateAlbumGallery } from '../../services/apiService';
import { STORAGE_URL } from '../../config/api';
import RichTextEditor from '../../components/RichTextEditor';

const AlbumGalleriesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const mainFeatureImageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    date: new Date().toISOString().split('T')[0],
    status: true,
  });
  const [mainFeatureImage, setMainFeatureImage] = useState(null);
  const [mainFeatureImagePreview, setMainFeatureImagePreview] = useState(null);
  const [originalMainFeatureImage, setOriginalMainFeatureImage] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (isEditing) {
      fetchAlbumData();
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
      if (mainFeatureImagePreview && mainFeatureImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(mainFeatureImagePreview);
      }
      items.forEach(item => {
        if (item.subFeatureImagePreview && item.subFeatureImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(item.subFeatureImagePreview);
        }
        item.subMainImagePreviews?.forEach(preview => {
          if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
          }
        });
        item.subItems?.forEach(subItem => {
          if (subItem.subFeatureImagePreview && subItem.subFeatureImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(subItem.subFeatureImagePreview);
          }
          subItem.subMainImagePreviews?.forEach(preview => {
            if (preview && preview.startsWith('blob:')) {
              URL.revokeObjectURL(preview);
            }
          });
        });
      });
    };
  }, [mainFeatureImagePreview, items]);

  const fetchAlbumData = async () => {
    try {
      setIsLoadingData(true);
      const response = await getAlbumGallery(id);
      const album = response.data;
      setFormData({
        title: album.title || '',
        slug: album.slug || '',
        excerpt: album.excerpt || '',
        date: album.date ? new Date(album.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: album.status !== undefined ? album.status : true,
      });
      
      // Set main feature image
      if (album.main_feature_image) {
        setOriginalMainFeatureImage(album.main_feature_image);
        setMainFeatureImagePreview(`${STORAGE_URL}/${album.main_feature_image}`);
      }
      
      // Set items with sub-items
      if (album.items && album.items.length > 0) {
        const formattedItems = album.items.map(item => {
          const subFeatureImagePreview = item.sub_feature_image ? `${STORAGE_URL}/${item.sub_feature_image}` : null;
          const subMainImagePreviews = item.sub_main_images?.map(img => {
            if (img.startsWith('http')) return img;
            return `${STORAGE_URL}/${img}`;
          }) || [];

          const subItems = item.sub_items?.map(subItem => {
            const subItemFeatureImagePreview = subItem.sub_feature_image ? `${STORAGE_URL}/${subItem.sub_feature_image}` : null;
            const subItemMainImagePreviews = subItem.sub_main_images?.map(img => {
              if (img.startsWith('http')) return img;
              return `${STORAGE_URL}/${img}`;
            }) || [];

            return {
              id: subItem.id,
              title: subItem.title || '',
              slug: subItem.slug || '',
              date: subItem.date ? new Date(subItem.date).toISOString().split('T')[0] : '',
              status: subItem.status !== undefined ? subItem.status : true,
              subFeatureImage: null,
              subFeatureImagePreview: subItemFeatureImagePreview,
              originalSubFeatureImage: subItem.sub_feature_image,
              subMainImages: [],
              subMainImagePreviews: subItemMainImagePreviews,
              existingSubMainImages: subItem.sub_main_images || [],
            };
          }) || [];

          return {
            id: item.id,
            title: item.title || '',
            slug: item.slug || '',
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
            status: item.status !== undefined ? item.status : true,
            subFeatureImage: null,
            subFeatureImagePreview: subFeatureImagePreview,
            originalSubFeatureImage: item.sub_feature_image,
            subMainImages: [],
            subMainImagePreviews: subMainImagePreviews,
            existingSubMainImages: item.sub_main_images || [],
            subItems: subItems,
          };
        });
        setItems(formattedItems);
      }
    } catch (error) {
      toast.error('Failed to load album gallery data');
      navigate('/admin/dashboard/album-galleries');
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

  const handleMainFeatureImageClick = () => {
    mainFeatureImageInputRef.current?.click();
  };

  const handleMainFeatureImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (mainFeatureImagePreview && mainFeatureImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(mainFeatureImagePreview);
      }
      setMainFeatureImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainFeatureImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMainFeatureImage = () => {
    if (mainFeatureImagePreview && mainFeatureImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(mainFeatureImagePreview);
    }
    setMainFeatureImage(null);
    setMainFeatureImagePreview(null);
    setOriginalMainFeatureImage(null);
    if (mainFeatureImageInputRef.current) {
      mainFeatureImageInputRef.current.value = '';
    }
  };

  // Item handlers
  const addItem = () => {
    setItems(prev => [...prev, {
      id: null,
      title: '',
      slug: '',
      date: '',
      status: true,
      subFeatureImage: null,
      subFeatureImagePreview: null,
      originalSubFeatureImage: null,
      subMainImages: [],
      subMainImagePreviews: [],
      existingSubMainImages: [],
      subItems: [],
    }]);
  };

  const removeItem = (itemIndex) => {
    const item = items[itemIndex];
    // Cleanup blob URLs
    if (item.subFeatureImagePreview && item.subFeatureImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(item.subFeatureImagePreview);
    }
    item.subMainImagePreviews?.forEach(preview => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
    item.subItems?.forEach(subItem => {
      if (subItem.subFeatureImagePreview && subItem.subFeatureImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(subItem.subFeatureImagePreview);
      }
      subItem.subMainImagePreviews?.forEach(preview => {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    });
    setItems(prev => prev.filter((_, i) => i !== itemIndex));
  };

  const updateItem = (itemIndex, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i === itemIndex) {
        const updated = { ...item, [field]: value };
        // Auto-generate slug from title
        if (field === 'title' && !item.id) {
          const slug = value
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
          updated.slug = slug;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleItemSubFeatureImage = (itemIndex, e) => {
    const file = e.target.files[0];
    if (file) {
      const item = items[itemIndex];
      if (item.subFeatureImagePreview && item.subFeatureImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(item.subFeatureImagePreview);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateItem(itemIndex, 'subFeatureImage', file);
        updateItem(itemIndex, 'subFeatureImagePreview', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeItemSubFeatureImage = (itemIndex) => {
    const item = items[itemIndex];
    if (item.subFeatureImagePreview && item.subFeatureImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(item.subFeatureImagePreview);
    }
    updateItem(itemIndex, 'subFeatureImage', null);
    updateItem(itemIndex, 'subFeatureImagePreview', null);
    updateItem(itemIndex, 'originalSubFeatureImage', null);
  };

  const handleItemSubMainImages = (itemIndex, e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    const item = items[itemIndex];
    updateItem(itemIndex, 'subMainImages', [...item.subMainImages, ...files]);
    updateItem(itemIndex, 'subMainImagePreviews', [...item.subMainImagePreviews, ...newPreviews]);
    e.target.value = '';
  };

  const removeItemSubMainImage = (itemIndex, imageIndex) => {
    const item = items[itemIndex];
    const preview = item.subMainImagePreviews[imageIndex];
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    
    if (imageIndex < item.existingSubMainImages.length) {
      updateItem(itemIndex, 'existingSubMainImages', item.existingSubMainImages.filter((_, i) => i !== imageIndex));
      updateItem(itemIndex, 'subMainImagePreviews', item.subMainImagePreviews.filter((_, i) => i !== imageIndex));
    } else {
      const newIndex = imageIndex - item.existingSubMainImages.length;
      updateItem(itemIndex, 'subMainImages', item.subMainImages.filter((_, i) => i !== newIndex));
      updateItem(itemIndex, 'subMainImagePreviews', item.subMainImagePreviews.filter((_, i) => i !== imageIndex));
    }
  };

  // Sub-item handlers
  const addSubItem = (itemIndex) => {
    updateItem(itemIndex, 'subItems', [
      ...items[itemIndex].subItems,
      {
        id: null,
        title: '',
        slug: '',
        date: '',
        status: true,
        subFeatureImage: null,
        subFeatureImagePreview: null,
        originalSubFeatureImage: null,
        subMainImages: [],
        subMainImagePreviews: [],
        existingSubMainImages: [],
      }
    ]);
  };

  const removeSubItem = (itemIndex, subItemIndex) => {
    const item = items[itemIndex];
    const subItem = item.subItems[subItemIndex];
    // Cleanup blob URLs
    if (subItem.subFeatureImagePreview && subItem.subFeatureImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(subItem.subFeatureImagePreview);
    }
    subItem.subMainImagePreviews?.forEach(preview => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
    updateItem(itemIndex, 'subItems', item.subItems.filter((_, i) => i !== subItemIndex));
  };

  const updateSubItem = (itemIndex, subItemIndex, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i === itemIndex) {
        const updatedSubItems = item.subItems.map((subItem, si) => {
          if (si === subItemIndex) {
            const updated = { ...subItem, [field]: value };
            // Auto-generate slug from title
            if (field === 'title' && !subItem.id) {
              const slug = value
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
              updated.slug = slug;
            }
            return updated;
          }
          return subItem;
        });
        return { ...item, subItems: updatedSubItems };
      }
      return item;
    }));
  };

  const handleSubItemSubFeatureImage = (itemIndex, subItemIndex, e) => {
    const file = e.target.files[0];
    if (file) {
      const subItem = items[itemIndex].subItems[subItemIndex];
      if (subItem.subFeatureImagePreview && subItem.subFeatureImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(subItem.subFeatureImagePreview);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSubItem(itemIndex, subItemIndex, 'subFeatureImage', file);
        updateSubItem(itemIndex, subItemIndex, 'subFeatureImagePreview', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSubItemSubFeatureImage = (itemIndex, subItemIndex) => {
    const subItem = items[itemIndex].subItems[subItemIndex];
    if (subItem.subFeatureImagePreview && subItem.subFeatureImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(subItem.subFeatureImagePreview);
    }
    updateSubItem(itemIndex, subItemIndex, 'subFeatureImage', null);
    updateSubItem(itemIndex, subItemIndex, 'subFeatureImagePreview', null);
    updateSubItem(itemIndex, subItemIndex, 'originalSubFeatureImage', null);
  };

  const handleSubItemSubMainImages = (itemIndex, subItemIndex, e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    const subItem = items[itemIndex].subItems[subItemIndex];
    updateSubItem(itemIndex, subItemIndex, 'subMainImages', [...subItem.subMainImages, ...files]);
    updateSubItem(itemIndex, subItemIndex, 'subMainImagePreviews', [...subItem.subMainImagePreviews, ...newPreviews]);
    e.target.value = '';
  };

  const removeSubItemSubMainImage = (itemIndex, subItemIndex, imageIndex) => {
    const subItem = items[itemIndex].subItems[subItemIndex];
    const preview = subItem.subMainImagePreviews[imageIndex];
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    
    if (imageIndex < subItem.existingSubMainImages.length) {
      updateSubItem(itemIndex, subItemIndex, 'existingSubMainImages', subItem.existingSubMainImages.filter((_, i) => i !== imageIndex));
      updateSubItem(itemIndex, subItemIndex, 'subMainImagePreviews', subItem.subMainImagePreviews.filter((_, i) => i !== imageIndex));
    } else {
      const newIndex = imageIndex - subItem.existingSubMainImages.length;
      updateSubItem(itemIndex, subItemIndex, 'subMainImages', subItem.subMainImages.filter((_, i) => i !== newIndex));
      updateSubItem(itemIndex, subItemIndex, 'subMainImagePreviews', subItem.subMainImagePreviews.filter((_, i) => i !== imageIndex));
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
      submitData.append('status', formData.status ? 1 : 0);

      // Handle main feature image
      if (mainFeatureImage) {
        submitData.append('main_feature_image', mainFeatureImage);
      } else if (isEditing && !mainFeatureImagePreview && originalMainFeatureImage) {
        submitData.append('remove_main_feature_image', '1');
      }

      // Prepare items data as JSON
      const itemsData = items.map((item, itemIndex) => {
        const itemData = {
          id: item.id,
          title: item.title,
          slug: item.slug,
          date: item.date || '',
          status: item.status ? 1 : 0,
          existing_sub_main_images: item.existingSubMainImages || [],
        };

        if (item.removeSubFeatureImage) {
          itemData.remove_sub_feature_image = true;
        }

        // Handle sub items
        if (item.subItems && item.subItems.length > 0) {
          itemData.sub_items = item.subItems.map((subItem, subItemIndex) => {
            const subItemData = {
              id: subItem.id,
              title: subItem.title,
              slug: subItem.slug,
              date: subItem.date || '',
              status: subItem.status ? 1 : 0,
              existing_sub_main_images: subItem.existingSubMainImages || [],
            };

            if (subItem.removeSubFeatureImage) {
              subItemData.remove_sub_feature_image = true;
            }

            return subItemData;
          });
        }

        return itemData;
      });

      submitData.append('items', JSON.stringify(itemsData));

      // Append files with proper naming convention
      items.forEach((item, itemIndex) => {
        if (item.subFeatureImage) {
          submitData.append(`items_${itemIndex}_sub_feature_image`, item.subFeatureImage);
        }
        item.subMainImages.forEach((image, imageIndex) => {
          submitData.append(`items_${itemIndex}_sub_main_images_${imageIndex}`, image);
        });

        if (item.subItems) {
          item.subItems.forEach((subItem, subItemIndex) => {
            if (subItem.subFeatureImage) {
              submitData.append(`items_${itemIndex}_sub_items_${subItemIndex}_sub_feature_image`, subItem.subFeatureImage);
            }
            subItem.subMainImages.forEach((image, imageIndex) => {
              submitData.append(`items_${itemIndex}_sub_items_${subItemIndex}_sub_main_images_${imageIndex}`, image);
            });
          });
        }
      });

      if (isEditing) {
        await updateAlbumGallery(id, submitData);
        toast.success('Album gallery updated successfully!');
      } else {
        await createAlbumGallery(submitData);
        toast.success('Album gallery created successfully!');
      }

      if (saveAndContinue) {
        if (!isEditing) {
          navigate(0);
        }
      } else {
        navigate('/admin/dashboard/album-galleries');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save album gallery';
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
          onClick={() => navigate('/admin/dashboard/album-galleries')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to List
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Album Gallery' : 'Create New Album Gallery'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isEditing ? 'Update album gallery details' : 'Add a new album gallery with nested items'}
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
                    placeholder="Enter album title"
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
                  placeholder="Enter album excerpt"
                  height="150px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Main Feature Image
                </label>
                {mainFeatureImagePreview ? (
                  <div className="relative group">
                    <img
                      src={mainFeatureImagePreview}
                      alt="Feature preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleMainFeatureImageClick}
                        className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={removeMainFeatureImage}
                        className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      ref={mainFeatureImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleMainFeatureImageChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div
                    onClick={handleMainFeatureImageClick}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Click to upload feature image</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
                    <input
                      ref={mainFeatureImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleMainFeatureImageChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
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
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Items (Sub Albums)
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-6">
              {items.map((item, itemIndex) => (
                <div key={itemIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Item {itemIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeItem(itemIndex)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItem(itemIndex, 'title', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Item title"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Slug
                        </label>
                        <input
                          type="text"
                          value={item.slug}
                          onChange={(e) => updateItem(itemIndex, 'slug', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Auto-generated"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sub Feature Image
                      </label>
                      {item.subFeatureImagePreview ? (
                        <div className="relative group">
                          <img
                            src={item.subFeatureImagePreview}
                            alt="Sub feature preview"
                            className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => document.getElementById(`item_${itemIndex}_sub_feature_image`).click()}
                              className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all text-sm"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItemSubFeatureImage(itemIndex)}
                              className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            id={`item_${itemIndex}_sub_feature_image`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleItemSubFeatureImage(itemIndex, e)}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => document.getElementById(`item_${itemIndex}_sub_feature_image`).click()}
                          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                        >
                          <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-600 dark:text-gray-400">Click to upload</p>
                          <input
                            id={`item_${itemIndex}_sub_feature_image`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleItemSubFeatureImage(itemIndex, e)}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sub Main Images (Multiple)
                      </label>
                      {item.subMainImagePreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {item.subMainImagePreviews.map((preview, imgIndex) => (
                            <div key={imgIndex} className="relative group">
                              <img
                                src={preview}
                                alt={`Sub image ${imgIndex + 1}`}
                                className="w-full h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                              />
                              <button
                                type="button"
                                onClick={() => removeItemSubMainImage(itemIndex, imgIndex)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        onClick={() => document.getElementById(`item_${itemIndex}_sub_main_images`).click()}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Add images</p>
                        <input
                          id={`item_${itemIndex}_sub_main_images`}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleItemSubMainImages(itemIndex, e)}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={item.date}
                          onChange={(e) => updateItem(itemIndex, 'date', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          value={item.status ? 'true' : 'false'}
                          onChange={(e) => updateItem(itemIndex, 'status', e.target.value === 'true')}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>

                    {/* Sub Items Section */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">Sub Items</h4>
                        <button
                          type="button"
                          onClick={() => addSubItem(itemIndex)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-xs"
                        >
                          <Plus className="w-3 h-3" />
                          Add Sub Item
                        </button>
                      </div>

                      <div className="space-y-4">
                        {item.subItems && item.subItems.map((subItem, subItemIndex) => (
                          <div key={subItemIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sub Item {subItemIndex + 1}</h5>
                              <button
                                type="button"
                                onClick={() => removeSubItem(itemIndex, subItemIndex)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Title <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={subItem.title}
                                    onChange={(e) => updateSubItem(itemIndex, subItemIndex, 'title', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Sub item title"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Slug
                                  </label>
                                  <input
                                    type="text"
                                    value={subItem.slug}
                                    onChange={(e) => updateSubItem(itemIndex, subItemIndex, 'slug', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Auto-generated"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Sub Feature Image
                                </label>
                                {subItem.subFeatureImagePreview ? (
                                  <div className="relative group">
                                    <img
                                      src={subItem.subFeatureImagePreview}
                                      alt="Sub feature preview"
                                      className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => document.getElementById(`item_${itemIndex}_sub_item_${subItemIndex}_sub_feature_image`).click()}
                                        className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-white text-gray-900 rounded text-xs hover:bg-gray-100 transition-all"
                                      >
                                        Change
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeSubItemSubFeatureImage(itemIndex, subItemIndex)}
                                        className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-all"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                    <input
                                      id={`item_${itemIndex}_sub_item_${subItemIndex}_sub_feature_image`}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleSubItemSubFeatureImage(itemIndex, subItemIndex, e)}
                                      className="hidden"
                                    />
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => document.getElementById(`item_${itemIndex}_sub_item_${subItemIndex}_sub_feature_image`).click()}
                                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                                  >
                                    <Upload className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Click to upload</p>
                                    <input
                                      id={`item_${itemIndex}_sub_item_${subItemIndex}_sub_feature_image`}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleSubItemSubFeatureImage(itemIndex, subItemIndex, e)}
                                      className="hidden"
                                    />
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Sub Main Images (Multiple)
                                </label>
                                {subItem.subMainImagePreviews.length > 0 && (
                                  <div className="grid grid-cols-4 gap-2 mb-2">
                                    {subItem.subMainImagePreviews.map((preview, imgIndex) => (
                                      <div key={imgIndex} className="relative group">
                                        <img
                                          src={preview}
                                          alt={`Sub image ${imgIndex + 1}`}
                                          className="w-full h-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeSubItemSubMainImage(itemIndex, subItemIndex, imgIndex)}
                                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                          <X className="w-2 h-2" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div
                                  onClick={() => document.getElementById(`item_${itemIndex}_sub_item_${subItemIndex}_sub_main_images`).click()}
                                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 text-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                                >
                                  <Upload className="w-3 h-3 text-gray-400 mx-auto mb-1" />
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Add images</p>
                                  <input
                                    id={`item_${itemIndex}_sub_item_${subItemIndex}_sub_main_images`}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleSubItemSubMainImages(itemIndex, subItemIndex, e)}
                                    className="hidden"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date
                                  </label>
                                  <input
                                    type="date"
                                    value={subItem.date}
                                    onChange={(e) => updateSubItem(itemIndex, subItemIndex, 'date', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                  </label>
                                  <select
                                    value={subItem.status ? 'true' : 'false'}
                                    onChange={(e) => updateSubItem(itemIndex, subItemIndex, 'status', e.target.value === 'true')}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                  >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No items added yet. Click "Add Item" to start.</p>
                </div>
              )}
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
            onClick={() => navigate('/admin/dashboard/album-galleries')}
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

export default AlbumGalleriesForm;

