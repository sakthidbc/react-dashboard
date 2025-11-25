import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Video, ChevronLeft, ChevronRight, Trash, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getVideoGalleries, deleteVideoGallery, updateVideoGallery } from '../../services/apiService';
import ConfirmModal from '../../components/ConfirmModal';
import Can from '../../components/Can';
import { usePermissions } from '../../hooks/usePermissions';

const VideoGalleriesList = () => {
  const [galleries, setGalleries] = useState([]);
  const [filteredGalleries, setFilteredGalleries] = useState([]);
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
    fetchGalleries();
  }, []);

  useEffect(() => {
    filterGalleries();
    setSelectedItems([]);
  }, [searchTerm, galleries]);

  useEffect(() => {
    setSelectedItems([]);
  }, [currentPage]);

  const fetchGalleries = async () => {
    try {
      setIsLoading(true);
      const response = await getVideoGalleries();
      setGalleries(response.data);
    } catch (error) {
      toast.error('Failed to fetch video galleries');
    } finally {
      setIsLoading(false);
    }
  };

  const filterGalleries = () => {
    let filtered = [...galleries];

    if (searchTerm) {
      filtered = filtered.filter(
        (gallery) =>
          gallery.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gallery.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGalleries(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredGalleries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGalleries = filteredGalleries.slice(startIndex, endIndex);

  const handleDelete = async (id) => {
    try {
      await deleteVideoGallery(id);
      toast.success('Video gallery deleted successfully!');
      setSelectedItems([]);
      fetchGalleries();
    } catch (error) {
      toast.error('Failed to delete video gallery');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => deleteVideoGallery(id)));
      toast.success(`${ids.length} video gallery${ids.length !== 1 ? 'ies' : ''} deleted successfully!`);
      setSelectedItems([]);
      fetchGalleries();
    } catch (error) {
      toast.error('Failed to delete some video galleries');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(currentGalleries.map(gallery => gallery.id));
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

  const isAllSelected = currentGalleries.length > 0 && selectedItems.length === currentGalleries.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < currentGalleries.length;

  const toggleStatus = async (gallery) => {
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('title', gallery.title);
      formData.append('slug', gallery.slug);
      formData.append('excerpt', gallery.excerpt || '');
      formData.append('video_url', gallery.video_url || '');
      formData.append('date', gallery.date || '');
      formData.append('author', gallery.author || '');
      formData.append('status', !gallery.status ? 1 : 0);
      formData.append('order_by', gallery.order_by || 0);
      
      await updateVideoGallery(gallery.id, formData);
      toast.success('Status updated!');
      fetchGalleries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getVideoThumbnail = (videoUrl) => {
    if (!videoUrl) return null;
    
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = videoUrl.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
    }
    
    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = videoUrl.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
    }
    
    return null;
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <svg
        className="w-32 h-32 text-gray-300 dark:text-gray-600 mb-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Video Galleries Found</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
        {searchTerm
          ? 'No video galleries match your search criteria. Try adjusting your search terms.'
          : 'Get started by creating your first video gallery. Click the button below to add a new gallery.'}
      </p>
      {!searchTerm && (
        <Can module="video_galleries" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/video-galleries/create')}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Video Gallery
          </button>
        </Can>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading video galleries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Galleries</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your video galleries
          </p>
        </div>
        <Can module="video_galleries" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/video-galleries/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </Can>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Found {filteredGalleries.length} gallery{filteredGalleries.length !== 1 ? 'ies' : ''}
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
            <Can module="video_galleries" action="delete">
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
      {filteredGalleries.length === 0 ? (
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
                      Video
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Title
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
                  {currentGalleries.map((gallery) => {
                    const thumbnail = getVideoThumbnail(gallery.video_url);
                    return (
                      <tr
                        key={gallery.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          selectedItems.includes(gallery.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(gallery.id)}
                            onChange={() => handleSelectItem(gallery.id)}
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={gallery.title}
                              className="w-24 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Video className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                              <Video className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {gallery.title || <span className="text-gray-400 italic">Untitled</span>}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{gallery.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{gallery.order_by || 0}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Can module="video_galleries" action="update">
                            <button
                              onClick={() => toggleStatus(gallery)}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                gallery.status
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {gallery.status ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              {gallery.status ? 'Active' : 'Inactive'}
                            </button>
                          </Can>
                          {!hasPermission('video_galleries', 'update') && (
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                              gallery.status
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {gallery.status ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              {gallery.status ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Can module="video_galleries" action="update">
                              <button
                                onClick={() => navigate(`/admin/dashboard/video-galleries/edit/${gallery.id}`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </Can>
                            <Can module="video_galleries" action="delete">
                              <button
                                onClick={() => setDeleteConfirm({ isOpen: true, id: gallery.id })}
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredGalleries.length)} of {filteredGalleries.length} galleries
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
        title="Delete Video Gallery"
        message="Are you sure you want to delete this video gallery? This action cannot be undone."
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteConfirm.isOpen}
        onClose={() => setBulkDeleteConfirm({ isOpen: false, ids: [] })}
        onConfirm={() => {
          handleBulkDelete(bulkDeleteConfirm.ids);
          setBulkDeleteConfirm({ isOpen: false, ids: [] });
        }}
        title="Delete Video Galleries"
        message={`Are you sure you want to delete ${bulkDeleteConfirm.ids.length} video gallery${bulkDeleteConfirm.ids.length !== 1 ? 'ies' : ''}? This action cannot be undone.`}
      />
    </div>
  );
};

export default VideoGalleriesList;

