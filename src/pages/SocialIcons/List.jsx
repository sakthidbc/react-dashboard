import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, ChevronLeft, ChevronRight, Trash, Loader, ExternalLink, Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle, Github, Mail, Globe, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSocialIcons, deleteSocialIcon, updateSocialIcon } from '../../services/apiService';
import ConfirmModal from '../../components/ConfirmModal';
import Can from '../../components/Can';
import { usePermissions } from '../../hooks/usePermissions';

// Icon mapping for social media icons
const getIconComponent = (iconName) => {
  const iconMap = {
    facebook: Facebook,
    twitter: Twitter,
    x: Twitter, // X uses Twitter icon
    instagram: Instagram,
    linkedin: Linkedin,
    youtube: Youtube,
    pinterest: Share2,
    tiktok: MessageCircle,
    snapchat: MessageCircle,
    whatsapp: MessageCircle,
    telegram: MessageCircle,
    discord: MessageCircle,
    github: Github,
    dribbble: Share2,
    behance: Share2,
    medium: Share2,
    reddit: Share2,
    vimeo: Youtube,
    skype: MessageCircle,
    email: Mail,
    website: Globe,
  };
  return iconMap[iconName] || Share2;
};

const SocialIconsList = () => {
  const [socialIcons, setSocialIcons] = useState([]);
  const [filteredSocialIcons, setFilteredSocialIcons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState({ isOpen: false, ids: [] });
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchSocialIcons();
  }, []);

  useEffect(() => {
    filterSocialIcons();
    setSelectedItems([]);
  }, [searchTerm, socialIcons]);

  useEffect(() => {
    setSelectedItems([]);
  }, [currentPage]);

  const fetchSocialIcons = async () => {
    try {
      setIsLoading(true);
      const response = await getSocialIcons();
      setSocialIcons(response.data);
    } catch (error) {
      toast.error('Failed to fetch social icons');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSocialIcons = () => {
    let filtered = [...socialIcons];

    if (searchTerm) {
      filtered = filtered.filter(
        (icon) =>
          icon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          icon.icon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          icon.url?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSocialIcons(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredSocialIcons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSocialIcons = filteredSocialIcons.slice(startIndex, endIndex);

  const handleDelete = async (id) => {
    try {
      await deleteSocialIcon(id);
      toast.success('Social icon deleted successfully!');
      setSelectedItems([]);
      fetchSocialIcons();
    } catch (error) {
      toast.error('Failed to delete social icon');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => deleteSocialIcon(id)));
      toast.success(`${ids.length} social icon${ids.length !== 1 ? 's' : ''} deleted successfully!`);
      setSelectedItems([]);
      fetchSocialIcons();
    } catch (error) {
      toast.error('Failed to delete some social icons');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(currentSocialIcons.map(icon => icon.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const isAllSelected = currentSocialIcons.length > 0 && selectedItems.length === currentSocialIcons.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < currentSocialIcons.length;

  const toggleStatus = async (icon) => {
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('title', icon.title);
      formData.append('icon', icon.icon);
      formData.append('url', icon.url);
      formData.append('target', icon.target || '_blank');
      formData.append('order_by', icon.order_by || 0);
      formData.append('status', !icon.status ? 1 : 0);
      
      await updateSocialIcon(icon.id, formData);
      toast.success('Status updated!');
      fetchSocialIcons();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <Share2 className="w-32 h-32 text-gray-300 dark:text-gray-600 mb-6" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Social Icons Found</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
        {searchTerm
          ? 'No social icons match your search criteria. Try adjusting your search terms.'
          : 'Get started by creating your first social icon. Click the button below to add a new social icon.'}
      </p>
      {!searchTerm && (
        <Can module="social_icons" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/social-icons/create')}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Social Icon
          </button>
        </Can>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Social Icons</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your social media links and icons
          </p>
        </div>
        <Can module="social_icons" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/social-icons/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Social Icon
          </button>
        </Can>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, icon, or URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Found {filteredSocialIcons.length} icon{filteredSocialIcons.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-300">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </div>
            <Can module="social_icons" action="delete">
              <button
                onClick={() => setBulkDeleteConfirm({ isOpen: true, ids: selectedItems })}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                <Trash className="w-4 h-4" />
                Delete Selected
              </button>
            </Can>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredSocialIcons.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Icon
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentSocialIcons.map((icon) => {
                    const IconComponent = getIconComponent(icon.icon);
                    return (
                      <tr
                        key={icon.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          selectedItems.includes(icon.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(icon.id)}
                            onChange={() => handleSelectItem(icon.id)}
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                              <IconComponent className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {icon.icon}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">{icon.title || <span className="text-gray-400 italic">Untitled</span>}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={icon.url}
                              target={icon.target || '_blank'}
                              rel={icon.target === '_blank' ? 'noopener noreferrer' : ''}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 max-w-xs truncate"
                            >
                              {icon.url.length > 40 ? icon.url.substring(0, 40) + '...' : icon.url}
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex-shrink-0">
                              {icon.target === '_blank' ? 'New Tab' : 'Same Tab'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{icon.order_by || 0}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Can module="social_icons" action="update">
                            <button
                              onClick={() => toggleStatus(icon)}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                icon.status
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {icon.status ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              {icon.status ? 'Active' : 'Inactive'}
                            </button>
                          </Can>
                          {!hasPermission('social_icons', 'update') && (
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                              icon.status
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {icon.status ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              {icon.status ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Can module="social_icons" action="update">
                              <button
                                onClick={() => navigate(`/admin/dashboard/social-icons/edit/${icon.id}`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </Can>
                            <Can module="social_icons" action="delete">
                              <button
                                onClick={() => setDeleteConfirm({ isOpen: true, id: icon.id })}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </Can>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700/30">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredSocialIcons.length)} of {filteredSocialIcons.length} icons
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={() => {
          handleDelete(deleteConfirm.id);
          setDeleteConfirm({ isOpen: false, id: null });
        }}
        title="Delete Social Icon"
        message="Are you sure you want to delete this social icon? This action cannot be undone."
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteConfirm.isOpen}
        onClose={() => setBulkDeleteConfirm({ isOpen: false, ids: [] })}
        onConfirm={() => {
          handleBulkDelete(bulkDeleteConfirm.ids);
          setBulkDeleteConfirm({ isOpen: false, ids: [] });
        }}
        title="Delete Social Icons"
        message={`Are you sure you want to delete ${bulkDeleteConfirm.ids.length} social icon${bulkDeleteConfirm.ids.length !== 1 ? 's' : ''}? This action cannot be undone.`}
      />
    </div>
  );
};

export default SocialIconsList;

