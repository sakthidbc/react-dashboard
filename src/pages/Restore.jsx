import { useState, useEffect } from 'react';
import { RotateCcw, Search, Image as ImageIcon, Tag, Newspaper, MenuSquare, CheckSquare, Trash2, Loader, Folder } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDeletedItems, restoreItem, restoreMultipleItems, forceDeleteItem, forceDeleteMultipleItems } from '../services/apiService';
import ConfirmModal from '../components/ConfirmModal';

const Restore = () => {
  const [deletedItems, setDeletedItems] = useState({
    slider_images: [],
    categories: [],
    news: [],
    menus: [],
    pages: [],
    photo_galleries: [],
    video_galleries: [],
    album_galleries: [],
    popups: [],
    social_icons: [],
    floating_menus: [],
    daily_thoughts: [],
    media: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [restoreConfirm, setRestoreConfirm] = useState({ isOpen: false, item: null });
  const [bulkRestoreConfirm, setBulkRestoreConfirm] = useState({ isOpen: false, items: [] });
  const [forceDeleteConfirm, setForceDeleteConfirm] = useState({ isOpen: false, item: null });
  const [bulkForceDeleteConfirm, setBulkForceDeleteConfirm] = useState({ isOpen: false, items: [] });

  useEffect(() => {
    fetchDeletedItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDeletedItems = async () => {
    try {
      setIsLoading(true);
      const response = await getDeletedItems();
      setDeletedItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch deleted items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (module, id) => {
    try {
      await restoreItem(module, id);
      toast.success('Item restored successfully!');
      fetchDeletedItems();
      setSelectedItems([]);
    } catch (error) {
      console.error('Restore error:', error);
      toast.error(error.response?.data?.message || 'Failed to restore item');
    }
  };

  const handleBulkRestore = async (items) => {
    try {
      if (!items || items.length === 0) {
        toast.error('No items selected');
        return;
      }
      const response = await restoreMultipleItems(items);
      if (response.data.failed > 0) {
        toast.error(response.data.message || 'Some items failed to restore');
      } else {
        toast.success(response.data.message || 'Items restored successfully!');
      }
      fetchDeletedItems();
      setSelectedItems([]);
    } catch (error) {
      console.error('Bulk restore error:', error);
      toast.error(error.response?.data?.message || 'Failed to restore items');
    }
  };

  const handleForceDelete = async (module, id) => {
    try {
      await forceDeleteItem(module, id);
      toast.success('Item permanently deleted!');
      fetchDeletedItems();
      setSelectedItems([]);
    } catch (error) {
      toast.error('Failed to permanently delete item');
    }
  };

  const handleBulkForceDelete = async (items) => {
    try {
      const response = await forceDeleteMultipleItems(items);
      toast.success(response.data.message);
      fetchDeletedItems();
      setSelectedItems([]);
    } catch (error) {
      toast.error('Failed to permanently delete some items');
    }
  };

  const handleSelectItem = (module, id) => {
    const key = `${module}_${id}`;
    setSelectedItems(prev =>
      prev.includes(key)
        ? prev.filter(item => item !== key)
        : [...prev, key]
    );
  };

  const handleSelectAll = (module, items) => {
    const moduleKeys = items.map(item => `${module}_${item.id}`);
    const allSelected = moduleKeys.every(key => selectedItems.includes(key));
    
    if (allSelected) {
      setSelectedItems(prev => prev.filter(key => !key.startsWith(`${module}_`)));
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...moduleKeys])]);
    }
  };

  const getModuleIcon = (module) => {
    switch (module) {
      case 'slider_images':
        return ImageIcon;
      case 'categories':
        return Tag;
      case 'news':
        return Newspaper;
      case 'menus':
        return MenuSquare;
      case 'media':
        return Folder;
      default:
        return Tag;
    }
  };

  const filterItems = (items) => {
    if (!searchTerm) return items;
    return items.filter(item =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getSelectedItemsForBulk = () => {
    return selectedItems.map(key => {
      // Handle module names with underscores (e.g., slider_images_123)
      // Split by last underscore to separate module and id
      const lastUnderscoreIndex = key.lastIndexOf('_');
      if (lastUnderscoreIndex === -1) return null;
      
      const module = key.substring(0, lastUnderscoreIndex);
      const idStr = key.substring(lastUnderscoreIndex + 1);
      const id = parseInt(idStr, 10);
      
      if (isNaN(id)) return null;
      
      return { module, id };
    }).filter(item => item !== null && item.id);
  };

  const ModuleSection = ({ module, items, label }) => {
    const filteredItems = filterItems(items);
    if (filteredItems.length === 0) return null;

    const Icon = getModuleIcon(module);
    const moduleKeys = filteredItems.map(item => `${module}_${item.id}`);
    const allSelected = moduleKeys.length > 0 && moduleKeys.every(key => selectedItems.includes(key));

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h2>
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                {filteredItems.length}
              </span>
            </div>
            {filteredItems.length > 0 && (
              <button
                onClick={() => handleSelectAll(module, filteredItems)}
                className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-2"
              >
                <CheckSquare className={`w-4 h-4 ${allSelected ? 'text-primary' : ''}`} />
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredItems.map((item) => {
            const itemKey = `${module}_${item.id}`;
            const isSelected = selectedItems.includes(itemKey);
            return (
              <div
                key={item.id}
                className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectItem(module, item.id)}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Deleted: {new Date(item.deleted_at).toLocaleString()}
                        {item.category && ` • Category: ${item.category}`}
                        {item.type && ` • Type: ${item.type}`}
                        {item.parent && ` • Parent: ${item.parent}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRestoreConfirm({ isOpen: true, item: { module, id: item.id, title: item.title } })}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restore
                    </button>
                    <button
                      onClick={() => setForceDeleteConfirm({ isOpen: true, item: { module, id: item.id, title: item.title } })}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
        <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading deleted items...</p>
        </div>
      </div>
    );
  }

  const totalDeleted = Object.values(deletedItems).reduce((sum, items) => sum + filterItems(items).length, 0);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Restore</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Restore soft-deleted items from all modules</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search deleted items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Found {totalDeleted} deleted item{totalDeleted !== 1 ? 's' : ''}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBulkRestoreConfirm({ isOpen: true, items: getSelectedItemsForBulk() })}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Restore Selected
              </button>
              <button
                onClick={() => setBulkForceDeleteConfirm({ isOpen: true, items: getSelectedItemsForBulk() })}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalDeleted === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <RotateCcw className="w-32 h-32 text-gray-300 dark:text-gray-600 mb-6" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Deleted Items</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
            There are no deleted items to restore at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <ModuleSection
            module="slider_images"
            items={deletedItems.slider_images}
            label="Slider Images"
          />
          <ModuleSection
            module="categories"
            items={deletedItems.categories}
            label="Categories"
          />
          <ModuleSection
            module="news"
            items={deletedItems.news}
            label="News"
          />
          <ModuleSection
            module="menus"
            items={deletedItems.menus}
            label="Menus"
          />
          <ModuleSection
            module="pages"
            items={deletedItems.pages}
            label="Pages"
          />
          <ModuleSection
            module="photo_galleries"
            items={deletedItems.photo_galleries}
            label="Photo Galleries"
          />
          <ModuleSection
            module="video_galleries"
            items={deletedItems.video_galleries}
            label="Video Galleries"
          />
          <ModuleSection
            module="album_galleries"
            items={deletedItems.album_galleries}
            label="Album Galleries"
          />
          <ModuleSection
            module="popups"
            items={deletedItems.popups}
            label="Popups"
          />
          <ModuleSection
            module="social_icons"
            items={deletedItems.social_icons}
            label="Social Icons"
          />
          <ModuleSection
            module="floating_menus"
            items={deletedItems.floating_menus}
            label="Floating Menus"
          />
          <ModuleSection
            module="daily_thoughts"
            items={deletedItems.daily_thoughts}
            label="Daily Thoughts"
          />
          <ModuleSection
            module="media"
            items={deletedItems.media}
            label="Media"
          />
        </div>
      )}

      {/* Restore Confirm Modal */}
      <ConfirmModal
        isOpen={restoreConfirm.isOpen}
        onClose={() => setRestoreConfirm({ isOpen: false, item: null })}
        onConfirm={() => {
          if (restoreConfirm.item) {
            handleRestore(restoreConfirm.item.module, restoreConfirm.item.id);
            setRestoreConfirm({ isOpen: false, item: null });
          }
        }}
        title="Restore Item"
        message={`Are you sure you want to restore "${restoreConfirm.item?.title}"?`}
        confirmText="Restore"
        cancelText="Cancel"
        type="success"
      />

      {/* Bulk Restore Confirm Modal */}
      <ConfirmModal
        isOpen={bulkRestoreConfirm.isOpen}
        onClose={() => setBulkRestoreConfirm({ isOpen: false, items: [] })}
        onConfirm={() => {
          handleBulkRestore(bulkRestoreConfirm.items);
          setBulkRestoreConfirm({ isOpen: false, items: [] });
        }}
        title="Restore Selected Items"
        message={`Are you sure you want to restore ${bulkRestoreConfirm.items.length} item${bulkRestoreConfirm.items.length !== 1 ? 's' : ''}?`}
        confirmText="Restore"
        cancelText="Cancel"
        type="success"
      />

      {/* Force Delete Confirm Modal */}
      <ConfirmModal
        isOpen={forceDeleteConfirm.isOpen}
        onClose={() => setForceDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={() => {
          if (forceDeleteConfirm.item) {
            handleForceDelete(forceDeleteConfirm.item.module, forceDeleteConfirm.item.id);
            setForceDeleteConfirm({ isOpen: false, item: null });
          }
        }}
        title="Permanently Delete Item"
        message={`Are you sure you want to permanently delete "${forceDeleteConfirm.item?.title}"? This will also delete all associated images and files. This action cannot be undone!`}
        confirmText="Delete Permanently"
        cancelText="Cancel"
        type="danger"
      />

      {/* Bulk Force Delete Confirm Modal */}
      <ConfirmModal
        isOpen={bulkForceDeleteConfirm.isOpen}
        onClose={() => setBulkForceDeleteConfirm({ isOpen: false, items: [] })}
        onConfirm={() => {
          handleBulkForceDelete(bulkForceDeleteConfirm.items);
          setBulkForceDeleteConfirm({ isOpen: false, items: [] });
        }}
        title="Permanently Delete Selected Items"
        message={`Are you sure you want to permanently delete ${bulkForceDeleteConfirm.items.length} item${bulkForceDeleteConfirm.items.length !== 1 ? 's' : ''}? This will also delete all associated images and files. This action cannot be undone!`}
        confirmText="Delete Permanently"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Restore;

