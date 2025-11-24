import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, ChevronLeft, ChevronRight, Trash, Loader, Image as ImageIcon, File } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';
import Can from '../Can';
import { usePermissions } from '../../hooks/usePermissions';
import api from '../../services/apiService';
import { STORAGE_URL } from '../../config/api';

const DynamicList = ({ moduleConfig, apiService }) => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState({ isOpen: false, ids: [] });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(null);
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const moduleName = moduleConfig.name;
  const moduleLabel = moduleConfig.label;
  const routePath = moduleConfig.routePath;
  const fields = moduleConfig.fields || [];

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
    setSelectedItems([]);
  }, [searchTerm, items]);

  useEffect(() => {
    setSelectedItems([]);
  }, [currentPage]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getItems();
      setItems(response.data || []);
    } catch (error) {
      toast.error(`Failed to fetch ${moduleLabel.toLowerCase()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter((item) => {
        return fields.some(field => {
          const value = item[field.name];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      setDeletingId(id);
      await apiService.deleteItem(id);
      toast.success(`${moduleLabel} deleted successfully!`);
      setSelectedItems([]);
      await fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to delete ${moduleLabel.toLowerCase()}`);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      setIsDeleting(true);
      await Promise.all(ids.map(id => apiService.deleteItem(id)));
      toast.success(`${ids.length} ${moduleLabel.toLowerCase()}${ids.length !== 1 ? 's' : ''} deleted successfully!`);
      setSelectedItems([]);
      await fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to delete some ${moduleLabel.toLowerCase()}s`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(currentItems.map(item => item.id));
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

  const isAllSelected = currentItems.length > 0 && selectedItems.length === currentItems.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < currentItems.length;

  const toggleStatus = async (item) => {
    try {
      setIsTogglingStatus(item.id);
      const formData = new FormData();
      formData.append('_method', 'PUT');
      
      // Add all fields with proper formatting
      fields.forEach(field => {
        const value = item[field.name];
        
        if (value !== null && value !== undefined && value !== '') {
          if (field.type === 'date') {
            // Format date properly (YYYY-MM-DD)
            const dateObj = new Date(value);
            if (!isNaN(dateObj.getTime())) {
              formData.append(field.name, dateObj.toISOString().split('T')[0]);
            } else {
              formData.append(field.name, value);
            }
          } else if (field.type === 'datetime') {
            // Format datetime properly
            const dateObj = new Date(value);
            if (!isNaN(dateObj.getTime())) {
              // Format as YYYY-MM-DDTHH:MM for datetime-local input
              const year = dateObj.getFullYear();
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              const day = String(dateObj.getDate()).padStart(2, '0');
              const hours = String(dateObj.getHours()).padStart(2, '0');
              const minutes = String(dateObj.getMinutes()).padStart(2, '0');
              formData.append(field.name, `${year}-${month}-${day}T${hours}:${minutes}`);
            } else {
              formData.append(field.name, value);
            }
          } else if (field.type === 'boolean') {
            formData.append(field.name, value ? '1' : '0');
          } else if (field.type === 'number') {
            formData.append(field.name, value.toString());
          } else if (field.type === 'image' || field.type === 'file') {
            // For file fields, don't send the file path in status update
            // The backend should handle this, but we'll send empty string if it's a file
            // Only send if it's a URL string
            if (typeof value === 'string' && !value.startsWith('http')) {
              formData.append(field.name, value);
            } else {
              formData.append(field.name, value || '');
            }
          } else {
            formData.append(field.name, value.toString());
          }
        } else {
          // Send empty string for null/undefined values
          formData.append(field.name, '');
        }
      });
      
      // Toggle status - ensure it's sent as string '1' or '0'
      // Handle both boolean and numeric status values
      const currentStatus = item.status === true || item.status === 1 || item.status === '1';
      formData.append('status', !currentStatus ? '1' : '0');
      
      await apiService.updateItem(item.id, formData);
      toast.success('Status updated!');
      await fetchItems();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.message || error.response?.data?.errors?.status?.[0] || 'Failed to update status');
    } finally {
      setIsTogglingStatus(null);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.replace(/^storage\//, '');
    return `${STORAGE_URL}/${cleanPath}`;
  };

  const renderFieldValue = (item, field) => {
    const value = item[field.name];
    
    if (!value && value !== 0 && value !== false) return <span className="text-gray-400">-</span>;
    
    switch (field.type) {
      case 'boolean':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {value ? 'Yes' : 'No'}
          </span>
        );
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'image':
        const imageUrl = getImageUrl(value);
        return (
          <>
            {imageUrl ? (
              <img 
                src={imageUrl}
                alt={field.label}
                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div 
              className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center border-2 border-gray-200 dark:border-gray-600" 
              style={{ display: imageUrl ? 'none' : 'flex' }}
            >
              <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
          </>
        );
      case 'file':
        return value ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <File className="w-4 h-4" />
            <span className="truncate max-w-[150px]" title={value.split('/').pop()}>
              {value.split('/').pop()}
            </span>
          </div>
        ) : <span className="text-gray-400">-</span>;
      case 'richtext':
      case 'textarea':
        const text = value.replace(/<[^>]*>/g, '').substring(0, 50);
        return <span className="text-sm" title={value.replace(/<[^>]*>/g, '')}>{text}{text.length >= 50 ? '...' : ''}</span>;
      case 'url':
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm truncate max-w-[200px] block"
            title={value}
          >
            {value}
          </a>
        );
      case 'email':
        return (
          <a 
            href={`mailto:${value}`}
            className="text-primary hover:underline text-sm"
          >
            {value}
          </a>
        );
      default:
        return <span className="text-sm text-gray-900 dark:text-white">{value?.toString() || '-'}</span>;
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-32 h-32 text-gray-300 dark:text-gray-600 mb-6 flex items-center justify-center">
        <Loader className="w-16 h-16" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No {moduleLabel} Found</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
        {searchTerm
          ? `No ${moduleLabel.toLowerCase()} match your search criteria.`
          : `Get started by creating your first ${moduleLabel.toLowerCase()}.`}
      </p>
      {!searchTerm && (
        <Can module={moduleName} action="create">
          <button
            onClick={() => navigate(`${routePath}/create`)}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New {moduleLabel}
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
          <p className="text-gray-600 dark:text-gray-400">Loading {moduleLabel.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{moduleLabel}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your {moduleLabel.toLowerCase()}
          </p>
        </div>
        <Can module={moduleName} action="create">
          <button
            onClick={() => navigate(`${routePath}/create`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add New {moduleLabel}
          </button>
        </Can>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${moduleLabel.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Found {filteredItems.length} {moduleLabel.toLowerCase()}{filteredItems.length !== 1 ? 's' : ''}
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
            <Can module={moduleName} action="delete">
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
      {filteredItems.length === 0 ? (
        <EmptyState />
      ) : (
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
                  {fields.slice(0, 5).map((field) => (
                    <th key={field.name} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      selectedItems.includes(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                      />
                    </td>
                    {fields.slice(0, 5).map((field) => (
                      <td key={field.name} className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {renderFieldValue(item, field)}
                        </div>
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        // Normalize status to boolean for display
                        const isActive = item.status === true || item.status === 1 || item.status === '1';
                        return (
                          <>
                            <Can module={moduleName} action="update">
                              <button
                                onClick={() => toggleStatus(item)}
                                disabled={isTogglingStatus === item.id}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isActive
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {isTogglingStatus === item.id ? (
                                  <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                  isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />
                                )}
                                {isActive ? 'Active' : 'Inactive'}
                              </button>
                            </Can>
                            {!hasPermission(moduleName, 'update') && (
                              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                                isActive
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}>
                                {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                {isActive ? 'Active' : 'Inactive'}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Can module={moduleName} action="update">
                          <button
                            onClick={() => navigate(`${routePath}/edit/${item.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </Can>
                        <Can module={moduleName} action="delete">
                          <button
                            onClick={() => setDeleteConfirm({ isOpen: true, id: item.id })}
                            disabled={isDeleting && deletingId === item.id}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {isDeleting && deletingId === item.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={async () => {
          await handleDelete(deleteConfirm.id);
          setDeleteConfirm({ isOpen: false, id: null });
        }}
        title={`Delete ${moduleLabel}`}
        message={`Are you sure you want to delete this ${moduleLabel.toLowerCase()}? This action cannot be undone.`}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteConfirm.isOpen}
        onClose={() => setBulkDeleteConfirm({ isOpen: false, ids: [] })}
        onConfirm={() => {
          handleBulkDelete(bulkDeleteConfirm.ids);
          setBulkDeleteConfirm({ isOpen: false, ids: [] });
        }}
        title={`Delete ${moduleLabel}`}
        message={`Are you sure you want to delete ${bulkDeleteConfirm.ids.length} selected ${moduleLabel.toLowerCase()}${bulkDeleteConfirm.ids.length !== 1 ? 's' : ''}? This action cannot be undone.`}
      />
    </div>
  );
};

export default DynamicList;

