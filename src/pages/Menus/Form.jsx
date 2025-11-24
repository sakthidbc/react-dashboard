import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMenu, createMenu, updateMenu, getMenus } from '../../services/apiService';

const MenusForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const [allMenus, setAllMenus] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    type: 'mainmenu',
    parent_id: '',
    is_url: false,
    url: '',
    link_target: 'sametab',
    status: true,
    order_by: 0,
  });

  useEffect(() => {
    fetchAllMenus();
    if (isEditing) {
      fetchMenuData();
    }
  }, [id, isEditing]);

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

  // Reset parent_id when type changes
  useEffect(() => {
    if (formData.type === 'mainmenu') {
      setFormData(prev => ({ ...prev, parent_id: '' }));
    }
  }, [formData.type]);

  const fetchAllMenus = async () => {
    try {
      const response = await getMenus();
      // Handle response data - axios wraps the response
      let menus = Array.isArray(response.data) ? response.data : [];
      
      // Exclude current menu from parent options when editing
      if (isEditing && id) {
        menus = menus.filter(menu => menu && menu.id !== parseInt(id));
      }
      
      setAllMenus(menus);
    } catch (error) {
      console.error('Error fetching menus:', error);
      toast.error('Failed to load menus');
      setAllMenus([]);
    }
  };

  const fetchMenuData = async () => {
    try {
      setIsLoadingData(true);
      const response = await getMenu(id);
      const menu = response.data;
      setFormData({
        title: menu.title || '',
        slug: menu.slug || '',
        type: menu.type || 'mainmenu',
        parent_id: menu.parent_id || '',
        is_url: menu.is_url || false,
        url: menu.url || '',
        link_target: menu.link_target || 'sametab',
        status: menu.status !== undefined ? menu.status : true,
        order_by: menu.order_by || 0,
      });
    } catch (error) {
      toast.error('Failed to load menu data');
      navigate('/admin/dashboard/menus');
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

  // Get available parent menus based on type
  const getAvailableParents = () => {
    if (!allMenus || allMenus.length === 0) {
      return [];
    }
    
    if (formData.type === 'mainmenu') {
      return [];
    } else if (formData.type === 'submenu') {
      // Only show mainmenu items
      const mainMenus = allMenus.filter(menu => menu && menu.type === 'mainmenu');
      return mainMenus;
    } else if (formData.type === 'childsubmenu') {
      // Only show submenu items
      const subMenus = allMenus.filter(menu => menu && menu.type === 'submenu');
      return subMenus;
    }
    return [];
  };

  const validateForm = () => {
    if (!formData.title || formData.title.trim() === '') {
      toast.error('Title is required');
      return false;
    }

    if (formData.type === 'submenu' && !formData.parent_id) {
      toast.error('Submenu must have a parent menu');
      return false;
    }

    if (formData.type === 'childsubmenu' && !formData.parent_id) {
      toast.error('Child submenu must have a parent menu');
      return false;
    }

    if (formData.is_url && !formData.url) {
      toast.error('URL is required when "Is URL" is checked');
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
      const dataToSend = {
        title: formData.title,
        slug: formData.slug,
        type: formData.type,
        parent_id: formData.type === 'mainmenu' ? null : (formData.parent_id || null),
        is_url: formData.is_url,
        url: formData.is_url ? formData.url : null,
        link_target: formData.link_target,
        status: formData.status ? 1 : 0,
        order_by: parseInt(formData.order_by) || 0,
      };

      if (isEditing) {
        await updateMenu(id, dataToSend);
        toast.success('Menu updated successfully!');
      } else {
        await createMenu(dataToSend);
        toast.success('Menu created successfully!');
      }

      if (saveAndContinue) {
        if (!isEditing) {
          setFormData({
            title: '',
            slug: '',
            type: 'mainmenu',
            parent_id: '',
            is_url: false,
            url: '',
            link_target: 'sametab',
            status: true,
            order_by: 0,
          });
        } else {
          fetchMenuData();
          fetchAllMenus();
        }
      } else {
        navigate('/admin/dashboard/menus');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.errors?.parent_id?.[0] || 'Failed to save menu');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading menu data...</p>
        </div>
      </div>
    );
  }

  const availableParents = getAvailableParents();

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/dashboard/menus')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to List
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Menu' : 'Create New Menu'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isEditing ? 'Update menu details' : 'Add a new menu to your website'}
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
                  placeholder="Enter menu title"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="mainmenu">Main Menu</option>
                  <option value="submenu">Sub Menu</option>
                  <option value="childsubmenu">Child Sub Menu</option>
                </select>
              </div>
              {formData.type !== 'mainmenu' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parent Menu {formData.type === 'submenu' || formData.type === 'childsubmenu' ? <span className="text-red-500">*</span> : ''}
                  </label>
                  <select
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select a parent menu</option>
                    {availableParents.map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.title} ({menu.type})
                      </option>
                    ))}
                  </select>
                  {availableParents.length === 0 && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                      No {formData.type === 'submenu' ? 'main menus' : 'sub menus'} available. Please create one first.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* URL Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
              URL Settings
            </h2>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="is_url"
                    checked={formData.is_url}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-primary focus:ring-primary cursor-pointer rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-primary transition-colors">
                    Is URL (External Link)
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-8">
                  Check this to add an external URL link for this menu item
                </p>
              </div>
              {formData.is_url && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL <span className="text-red-500">*</span>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Link Target
                    </label>
                    <select
                      name="link_target"
                      value={formData.link_target}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="sametab">Same Tab</option>
                      <option value="newtab">New Tab</option>
                    </select>
                  </div>
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
            onClick={() => navigate('/admin/dashboard/menus')}
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

export default MenusForm;

