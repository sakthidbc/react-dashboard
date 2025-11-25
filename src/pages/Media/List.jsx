import { useState, useEffect, useRef } from 'react';
import { 
  Upload, FolderPlus, Search, Trash2, Edit, Copy, Eye, Download, 
  File, Folder, Image as ImageIcon, FileText, Music, Video as VideoIcon,
  ChevronRight, Home, MoreVertical, X, Check, Loader, Grid, List as ListIcon,
  Share2, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  getMedia, uploadMedia, createMediaFolder, updateMedia, 
  deleteMedia, getMediaTree 
} from '../../services/apiService';
import { STORAGE_URL } from '../../config/api';
import ConfirmModal from '../../components/ConfirmModal';
import Can from '../../components/Can';
import Pagination from '../../components/Pagination';

const MediaList = () => {
  const [media, setMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState('/');
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Home', path: '/' }]);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [folderModal, setFolderModal] = useState({ isOpen: false, name: '' });
  const [editModal, setEditModal] = useState({ isOpen: false, item: null, name: '', alt_text: '' });
  const [folderTree, setFolderTree] = useState([]);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, item: null });
  const [optionsMenu, setOptionsMenu] = useState({ isOpen: false, item: null, x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchMedia();
    fetchFolderTree();
  }, [folderPath, currentFolder]);

  useEffect(() => {
    filterMedia();
  }, [searchTerm, media]);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (currentFolder?.id) {
        params.parent_id = currentFolder.id;
      }
      const response = await getMedia(params);
      // Response is already the array from backend
      setMedia(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to fetch media');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolderTree = async () => {
    try {
      const response = await getMediaTree();
      setFolderTree(response.data || []);
    } catch (error) {
      console.error('Failed to fetch folder tree:', error);
    }
  };

  const filterMedia = () => {
    if (!searchTerm) {
      setFilteredMedia(media);
      setCurrentPage(1);
      return;
    }

    const filtered = media.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.name?.toLowerCase().includes(searchLower) ||
        item.original_name?.toLowerCase().includes(searchLower) ||
        item.alt_text?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredMedia(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMedia = filteredMedia.slice(startIndex, endIndex);

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
    const newPath = folder.folder_path === '/' 
      ? '/' + folder.name 
      : folder.folder_path + '/' + folder.name;
    setFolderPath(newPath.replace('//', '/'));
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name, path: newPath.replace('//', '/') }]);
    setCurrentPage(1);
  };

  const handleBreadcrumbClick = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    const targetBreadcrumb = newBreadcrumbs[newBreadcrumbs.length - 1];
    setCurrentFolder(targetBreadcrumb.id ? { id: targetBreadcrumb.id } : null);
    setFolderPath(targetBreadcrumb.path);
    setCurrentPage(1);
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      if (currentFolder?.id) {
        formData.append('parent_id', currentFolder.id);
      }
      formData.append('folder_path', folderPath);

      try {
        await uploadMedia(formData);
        return { success: true, file: file.name };
      } catch (error) {
        return { success: false, file: file.name, error: error.message };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded successfully`);
      fetchMedia();
    }
    if (failCount > 0) {
      toast.error(`${failCount} file(s) failed to upload`);
    }

    setUploading(false);
  };

  const handleCreateFolder = async () => {
    if (!folderModal.name.trim()) {
      toast.error('Folder name is required');
      return;
    }

    try {
      const normalizedPath = folderPath === '/' ? '/' : folderPath.replace('//', '/');
      await createMediaFolder({
        type: 'folder',
        name: folderModal.name,
        parent_id: currentFolder?.id || null,
        folder_path: normalizedPath,
      });
      toast.success('Folder created successfully');
      setFolderModal({ isOpen: false, name: '' });
      fetchMedia();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create folder');
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteMedia(id);
      toast.success('Item deleted successfully');
      setDeleteConfirm({ isOpen: false, id: null });
      // Remove from state immediately for better UX
      setMedia(prevMedia => prevMedia.filter(item => item.id !== id));
      setFilteredMedia(prevFiltered => prevFiltered.filter(item => item.id !== id));
      // Then refresh from server to ensure consistency
      await fetchMedia();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = async () => {
    if (!editModal.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!editModal.item) return;

    setEditingId(editModal.item.id);
    try {
      await updateMedia(editModal.item.id, {
        name: editModal.name,
        alt_text: editModal.alt_text || '',
      });
      toast.success('Item updated successfully');
      setEditModal({ isOpen: false, item: null, name: '', alt_text: '' });
      await fetchMedia();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    } finally {
      setEditingId(null);
    }
  };

  const handleCopyUrl = (item) => {
    // Get full URL with domain
    let url = item.url || item.full_url || `${STORAGE_URL}/${item.path}`;
    
    // If URL doesn't start with http, make it absolute
    if (!url.startsWith('http')) {
      const baseUrl = window.location.origin;
      if (url.startsWith('/')) {
        url = baseUrl + url;
      } else {
        url = baseUrl + '/' + url;
      }
    }
    
    navigator.clipboard.writeText(url);
    toast.success('Full URL copied to clipboard!');
  };

  const handleDownload = (item) => {
    const url = item.url || item.full_url || `${STORAGE_URL}/${item.path}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = item.original_name || item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const getFileIcon = (item) => {
    if (item.type === 'folder') return Folder;
    if (item.is_image) return ImageIcon;
    if (item.is_video) return VideoIcon;
    if (item.is_audio) return Music;
    if (item.is_document) return FileText;
    return File;
  };

  const getFileTypeColor = (item) => {
    if (item.type === 'folder') return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    if (item.is_image) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (item.is_video) return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    if (item.is_audio) return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
    if (item.is_document) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div 
      className="p-4 lg:p-6 space-y-6"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl border-2 border-dashed border-primary">
              <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-900 dark:text-white">Drop files here to upload</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Media Manager</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage all your files, images, documents, and folders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {viewMode === 'grid' ? <ListIcon className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
          <Can module="media" action="create">
            <button
              onClick={() => setFolderModal({ isOpen: true, name: '' })}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md"
            >
              <FolderPlus className="w-5 h-5 inline mr-2" />
              New Folder
            </button>
          </Can>
          <Can module="media" action="create">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all shadow-md disabled:opacity-50"
            >
              {uploading ? (
                <Loader className="w-5 h-5 inline mr-2 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 inline mr-2" />
              )}
              Upload Files
            </button>
          </Can>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 flex-wrap">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                index === breadcrumbs.length - 1
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {index === 0 ? <Home className="w-4 h-4 inline mr-1" /> : null}
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search files and folders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Media Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : currentMedia.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Folder className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No files found</h3>
          <p className="text-gray-500 dark:text-gray-400">Upload files or create folders to get started</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {currentMedia.map((item) => {
            const Icon = getFileIcon(item);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => item.type === 'folder' && handleFolderClick(item)}
              >
                <div className="flex flex-col items-center text-center">
                  {(item.is_image || item.mime_type?.startsWith('image/')) && (item.url || item.path) ? (
                    <img
                      src={item.url || item.full_url || `${STORAGE_URL}/${item.path}`}
                      alt={item.alt_text || item.original_name || 'Image'}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-24 rounded-lg mb-2 flex items-center justify-center ${getFileTypeColor(item)}`} style={{ display: (item.is_image || item.mime_type?.startsWith('image/')) && (item.url || item.path) ? 'none' : 'flex' }}>
                    <Icon className="w-12 h-12" />
                  </div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate w-full" title={item.original_name || item.name}>
                    {item.original_name || item.name}
                  </p>
                  {item.type === 'file' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.formatted_size || `${(item.size / 1024).toFixed(2)} KB`}
                    </p>
                  )}
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1 flex-wrap">
                    {item.type === 'file' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(item);
                          }}
                          className="p-1.5 bg-white dark:bg-gray-700 rounded shadow-md hover:bg-gray-50 dark:hover:bg-gray-600"
                          title="Copy Full URL"
                        >
                          <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item);
                          }}
                          className="p-1.5 bg-white dark:bg-gray-700 rounded shadow-md hover:bg-gray-50 dark:hover:bg-gray-600"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewModal({ isOpen: true, item });
                          }}
                          className="p-1.5 bg-white dark:bg-gray-700 rounded shadow-md hover:bg-gray-50 dark:hover:bg-gray-600"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                      </>
                    )}
                    <Can module="media" action="update">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditModal({ 
                            isOpen: true, 
                            item, 
                            name: item.original_name || item.name,
                            alt_text: item.alt_text || ''
                          });
                        }}
                        className="p-1.5 bg-white dark:bg-gray-700 rounded shadow-md hover:bg-gray-50 dark:hover:bg-gray-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </Can>
                    <Can module="media" action="delete">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({ isOpen: true, id: item.id });
                        }}
                        className="p-1.5 bg-white dark:bg-gray-700 rounded shadow-md hover:bg-gray-50 dark:hover:bg-gray-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </Can>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Uploaded By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentMedia.map((item) => {
                const Icon = getFileIcon(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${getFileTypeColor(item).split(' ')[0]}`} />
                        <span 
                          className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:text-primary"
                          onClick={() => item.type === 'folder' && handleFolderClick(item)}
                        >
                          {item.original_name || item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.type === 'folder' ? 'Folder' : item.mime_type || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.type === 'file' ? (item.formatted_size || `${(item.size / 1024).toFixed(2)} KB`) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.user?.name || 'System'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.type === 'file' && (
                          <>
                            <button
                              onClick={() => handleCopyUrl(item)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                              title="Copy Full URL"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(item)}
                              className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setPreviewModal({ isOpen: true, item })}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <Can module="media" action="update">
                          <button
                            onClick={() => setEditModal({ 
                              isOpen: true, 
                              item, 
                              name: item.original_name || item.name,
                              alt_text: item.alt_text || ''
                            })}
                            className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </Can>
                        <Can module="media" action="delete">
                          <button
                            onClick={() => setDeleteConfirm({ isOpen: true, id: item.id })}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
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
      )}

      {/* Pagination */}
      {filteredMedia.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredMedia.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          startIndex={startIndex}
          endIndex={endIndex}
          itemName="items"
        />
      )}

      {/* Create Folder Modal */}
      {folderModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={folderModal.name}
              onChange={(e) => setFolderModal({ ...folderModal, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setFolderModal({ isOpen: false, name: '' })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && editModal.item && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {editModal.item && (editModal.item.is_image || editModal.item.mime_type?.startsWith('image/')) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={editModal.alt_text}
                    onChange={(e) => setEditModal({ ...editModal, alt_text: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setEditModal({ isOpen: false, item: null, name: '', alt_text: '' })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
                      <button
                        onClick={handleEdit}
                        disabled={editingId === editModal.item?.id}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {editingId === editModal.item?.id ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal.isOpen && previewModal.item && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setPreviewModal({ isOpen: false, item: null })}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewModal({ isOpen: false, item: null })}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            {(previewModal.item.is_image || previewModal.item.mime_type?.startsWith('image/')) ? (
              <>
                <img
                  src={previewModal.item.url || previewModal.item.full_url || `${STORAGE_URL}/${previewModal.item.path}`}
                  alt={previewModal.item.alt_text || previewModal.item.original_name || 'Image'}
                  className="max-w-full max-h-[90vh] mx-auto rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const errorDiv = e.target.nextElementSibling;
                    if (errorDiv) errorDiv.style.display = 'block';
                  }}
                />
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center" style={{ display: 'none' }}>
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Image failed to load</p>
                  <a
                    href={previewModal.item.url || previewModal.item.full_url || `${STORAGE_URL}/${previewModal.item.path}`}
                    download
                    className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    Download File
                  </a>
                </div>
              </>
            ) : (previewModal.item.is_video || previewModal.item.mime_type?.startsWith('video/')) ? (
              <video
                src={previewModal.item.url || `${STORAGE_URL}/${previewModal.item.path}`}
                controls
                className="max-w-full max-h-[90vh] mx-auto rounded-lg"
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Preview not available for this file type</p>
                <a
                  href={previewModal.item.url || `${STORAGE_URL}/${previewModal.item.path}`}
                  download
                  className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Download File
                </a>
              </div>
            )}
            <div className="mt-4 text-white text-center">
              <p className="font-semibold">{previewModal.item.original_name || previewModal.item.name}</p>
              <p className="text-sm text-gray-300">{previewModal.item.formatted_size || `${(previewModal.item.size / 1024).toFixed(2)} KB`}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => !deletingId && setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        isLoading={deletingId === deleteConfirm.id}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default MediaList;

