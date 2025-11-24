import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Folder, ChevronLeft, ChevronRight, Trash, Loader, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAlbumGalleries, deleteAlbumGallery, updateAlbumGallery } from '../../services/apiService';
import { STORAGE_URL } from '../../config/api';
import ConfirmModal from '../../components/ConfirmModal';
import Can from '../../components/Can';
import { usePermissions } from '../../hooks/usePermissions';

const AlbumGalleriesList = () => {
  const [albums, setAlbums] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState({ isOpen: false, ids: [] });
  const [expandedAlbums, setExpandedAlbums] = useState({});
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    filterAlbums();
    setSelectedItems([]);
  }, [searchTerm, albums]);

  useEffect(() => {
    setSelectedItems([]);
  }, [currentPage]);

  const fetchAlbums = async () => {
    try {
      setIsLoading(true);
      const response = await getAlbumGalleries();
      setAlbums(response.data);
    } catch (error) {
      toast.error('Failed to fetch album galleries');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAlbums = () => {
    let filtered = [...albums];

    if (searchTerm) {
      filtered = filtered.filter(
        (album) =>
          album.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          album.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlbums(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredAlbums.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlbums = filteredAlbums.slice(startIndex, endIndex);

  const handleDelete = async (id) => {
    try {
      await deleteAlbumGallery(id);
      toast.success('Album gallery deleted successfully!');
      setSelectedItems([]);
      fetchAlbums();
    } catch (error) {
      toast.error('Failed to delete album gallery');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => deleteAlbumGallery(id)));
      toast.success(`${ids.length} album gallery${ids.length !== 1 ? 'ies' : ''} deleted successfully!`);
      setSelectedItems([]);
      fetchAlbums();
    } catch (error) {
      toast.error('Failed to delete some album galleries');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(currentAlbums.map(album => album.id));
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

  const isAllSelected = currentAlbums.length > 0 && selectedItems.length === currentAlbums.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < currentAlbums.length;

  const toggleStatus = async (album) => {
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('title', album.title);
      formData.append('slug', album.slug);
      formData.append('excerpt', album.excerpt || '');
      formData.append('date', album.date || '');
      formData.append('status', !album.status ? 1 : 0);
      
      await updateAlbumGallery(album.id, formData);
      toast.success('Status updated!');
      fetchAlbums();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const toggleExpand = (albumId) => {
    setExpandedAlbums(prev => ({
      ...prev,
      [albumId]: !prev[albumId]
    }));
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.replace(/^storage\//, '');
    return `${STORAGE_URL}/${cleanPath}`;
  };

  const countTotalItems = (album) => {
    let count = album.items?.length || 0;
    if (album.items) {
      album.items.forEach(item => {
        count += item.sub_items?.length || 0;
      });
    }
    return count;
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
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      </svg>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Album Galleries Found</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
        {searchTerm
          ? 'No album galleries match your search criteria. Try adjusting your search terms.'
          : 'Get started by creating your first album gallery. Click the button below to add a new album.'}
      </p>
      {!searchTerm && (
        <Can module="album_galleries" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/album-galleries/create')}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Album Gallery
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Album Galleries</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your album galleries with nested items
          </p>
        </div>
        <Can module="album_galleries" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/album-galleries/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Album Gallery
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
            Found {filteredAlbums.length} album{filteredAlbums.length !== 1 ? 's' : ''}
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
            <Can module="album_galleries" action="delete">
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
      {filteredAlbums.length === 0 ? (
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-12"></th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Items
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
                  {currentAlbums.map((album) => {
                    const isExpanded = expandedAlbums[album.id];
                    const totalItems = countTotalItems(album);
                    return (
                      <>
                        <tr
                          key={album.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                            selectedItems.includes(album.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(album.id)}
                              onChange={() => handleSelectItem(album.id)}
                              className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4">
                            {totalItems > 0 && (
                              <button
                                onClick={() => toggleExpand(album.id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                ) : (
                                  <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {album.main_feature_image ? (
                              <img
                                src={getImageUrl(album.main_feature_image)}
                                alt={album.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <Folder className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                                <Folder className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {album.title || <span className="text-gray-400 italic">Untitled</span>}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{album.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {totalItems} item{totalItems !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Can module="album_galleries" action="update">
                              <button
                                onClick={() => toggleStatus(album)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  album.status
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {album.status ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                {album.status ? 'Active' : 'Inactive'}
                              </button>
                            </Can>
                            {!hasPermission('album_galleries', 'update') && (
                              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                                album.status
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}>
                                {album.status ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                {album.status ? 'Active' : 'Inactive'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Can module="album_galleries" action="update">
                                <button
                                  onClick={() => navigate(`/admin/dashboard/album-galleries/edit/${album.id}`)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </Can>
                              <Can module="album_galleries" action="delete">
                                <button
                                  onClick={() => setDeleteConfirm({ isOpen: true, id: album.id })}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </Can>
                            </div>
                          </td>
                        </tr>
                        {/* Expanded rows for items and sub-items */}
                        {isExpanded && album.items && album.items.map((item, itemIndex) => (
                          <>
                            <tr key={`item-${item.id}`} className="bg-gray-50 dark:bg-gray-700/30">
                              <td colSpan="2" className="px-6 py-3"></td>
                              <td className="px-6 py-3">
                                {item.sub_feature_image ? (
                                  <img
                                    src={getImageUrl(item.sub_feature_image)}
                                    alt={item.title}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                    <Folder className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2 pl-4">
                                  <ChevronRightIcon className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.title}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    ({item.sub_items?.length || 0} sub-items)
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {item.sub_main_images?.length || 0} image{item.sub_main_images?.length !== 1 ? 's' : ''}
                                </span>
                              </td>
                              <td colSpan="2" className="px-6 py-3"></td>
                            </tr>
                            {item.sub_items && item.sub_items.map((subItem) => (
                              <tr key={`subitem-${subItem.id}`} className="bg-gray-100 dark:bg-gray-700/50">
                                <td colSpan="2" className="px-6 py-2"></td>
                                <td className="px-6 py-2">
                                  {subItem.sub_feature_image ? (
                                    <img
                                      src={getImageUrl(subItem.sub_feature_image)}
                                      alt={subItem.title}
                                      className="w-10 h-10 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                      <Folder className="w-3 h-3 text-gray-400" />
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-2">
                                  <div className="flex items-center gap-2 pl-8">
                                    <ChevronRightIcon className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{subItem.title}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-500">
                                    {subItem.sub_main_images?.length || 0} image{subItem.sub_main_images?.length !== 1 ? 's' : ''}
                                  </span>
                                </td>
                                <td colSpan="2" className="px-6 py-2"></td>
                              </tr>
                            ))}
                          </>
                        ))}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700/30">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAlbums.length)} of {filteredAlbums.length} albums
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
        title="Delete Album Gallery"
        message="Are you sure you want to delete this album gallery? This will also delete all nested items. This action cannot be undone."
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteConfirm.isOpen}
        onClose={() => setBulkDeleteConfirm({ isOpen: false, ids: [] })}
        onConfirm={() => {
          handleBulkDelete(bulkDeleteConfirm.ids);
          setBulkDeleteConfirm({ isOpen: false, ids: [] });
        }}
        title="Delete Album Galleries"
        message={`Are you sure you want to delete ${bulkDeleteConfirm.ids.length} album gallery${bulkDeleteConfirm.ids.length !== 1 ? 'ies' : ''}? This will also delete all nested items. This action cannot be undone.`}
      />
    </div>
  );
};

export default AlbumGalleriesList;

