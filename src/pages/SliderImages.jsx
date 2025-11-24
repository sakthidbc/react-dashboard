import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Eye, EyeOff, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/apiService';
import { STORAGE_URL } from '../config/api';
import { motion } from 'framer-motion';

const SliderImages = () => {
  const [sliders, setSliders] = useState([]);
  const [filteredSliders, setFilteredSliders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    images: [],
    status: true,
    order_by: 0,
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSliders();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = sliders.filter(
        (slider) =>
          slider.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          slider.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          slider.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSliders(filtered);
    } else {
      setFilteredSliders(sliders);
    }
  }, [searchTerm, sliders]);

  const fetchSliders = async () => {
    try {
      const response = await api.get('/slider-images');
      const sorted = response.data.sort((a, b) => a.order_by - b.order_by);
      setSliders(sorted);
      setFilteredSliders(sorted);
    } catch (error) {
      toast.error('Failed to fetch sliders');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files,
    }));

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e, saveAndContinue = false) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('status', formData.status ? 1 : 0);
      formDataToSend.append('order_by', formData.order_by);

      formData.images.forEach((image) => {
        formDataToSend.append('images[]', image);
      });

      if (editingSlider) {
        formDataToSend.append('_method', 'PUT');
        await api.post(`/slider-images/${editingSlider.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Slider updated successfully!');
      } else {
        await api.post('/slider-images', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Slider created successfully!');
      }

      if (!saveAndContinue) {
        handleClose();
      } else {
        setFormData({
          title: '',
          subtitle: '',
          description: '',
          images: [],
          status: true,
          order_by: 0,
        });
        setImagePreviews([]);
        setEditingSlider(null);
      }

      fetchSliders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save slider');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title || '',
      subtitle: slider.subtitle || '',
      description: slider.description || '',
      images: [],
      status: slider.status,
      order_by: slider.order_by,
    });
    setImagePreviews(
      slider.images?.map(img => {
        if (img.startsWith('http')) return img;
        const cleanPath = img.startsWith('/') ? img.substring(1) : img;
        return `${STORAGE_URL}/${cleanPath}`;
      }) || []
    );
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slider?')) return;

    try {
      await api.delete(`/slider-images/${id}`);
      toast.success('Slider deleted successfully!');
      fetchSliders();
    } catch (error) {
      toast.error('Failed to delete slider');
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingSlider(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      images: [],
      status: true,
      order_by: 0,
    });
    setImagePreviews([]);
  };

  const toggleStatus = async (slider) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', slider.title || '');
      formDataToSend.append('subtitle', slider.subtitle || '');
      formDataToSend.append('description', slider.description || '');
      formDataToSend.append('status', !slider.status ? 1 : 0);
      formDataToSend.append('order_by', slider.order_by);
      formDataToSend.append('_method', 'PUT');

      await api.post(`/slider-images/${slider.id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Status updated!');
      fetchSliders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${STORAGE_URL}/${cleanPath}`;
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 space-y-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 min-h-screen">
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary to-gray-700 dark:from-white dark:via-primary-300 dark:to-gray-300 bg-clip-text text-transparent">
            Slider Images Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Manage your website slider images and content</p>
        </div>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl hover:shadow-lg transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add New Slider
        </motion.button>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sliders by title, subtitle, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </motion.div>

      {/* Table View */}
      <motion.div 
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl overflow-hidden shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subtitle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Images Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSliders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No sliders found matching your search.' : 'No sliders found. Click "Add New Slider" to create one.'}
                  </td>
                </tr>
              ) : (
                filteredSliders.map((slider) => (
                  <tr key={slider.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {slider.order_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {slider.images && slider.images.length > 0 ? (
                        <img
                          src={getImageUrl(slider.images[0])}
                          alt={slider.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {slider.title || 'Untitled'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {slider.subtitle || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {slider.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {slider.images?.length || 0} image(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.button
                        onClick={() => toggleStatus(slider)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          slider.status
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <motion.span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform flex items-center justify-center ${
                            slider.status ? 'translate-x-7' : 'translate-x-1'
                          }`}
                          layout
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          {slider.status ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </motion.span>
                        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                          slider.status ? 'text-white left-1' : 'text-gray-600 dark:text-gray-400 right-1'
                        }`}>
                          {slider.status ? 'ON' : 'OFF'}
                        </span>
                      </motion.button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => handleEdit(slider)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-blue-400 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(slider.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal */}
      {isModalOpen && (
        <motion.div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl max-w-4xl w-full max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl my-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md z-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {editingSlider ? 'Edit Slider' : 'Add New Slider'}
              </h2>
              <motion.button 
                onClick={handleClose} 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order By</label>
                  <input
                    type="number"
                    name="order_by"
                    value={formData.order_by}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="status"
                      checked={formData.status}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images (Multiple)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <motion.button
                  type="button"
                  onClick={handleClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
                >
                  Close
                </motion.button>
                <motion.button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  className="px-5 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors font-semibold"
                >
                  Save & Continue
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center gap-2 font-semibold transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SliderImages;
