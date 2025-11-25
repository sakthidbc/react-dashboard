import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, ChevronLeft, ChevronRight, Trash, Loader, ExternalLink, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getFloatingMenus, deleteFloatingMenu, updateFloatingMenu } from '../../services/apiService';
import ConfirmModal from '../../components/ConfirmModal';
import Can from '../../components/Can';
import { usePermissions } from '../../hooks/usePermissions';

const FloatingMenusList = () => {
  const [floatingMenus, setFloatingMenus] = useState([]);
  const [filteredFloatingMenus, setFilteredFloatingMenus] = useState([]);
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
    fetchFloatingMenus();
  }, []);

  useEffect(() => {
    filterFloatingMenus();
    setSelectedItems([]);
  }, [searchTerm, floatingMenus]);

  useEffect(() => {
    setSelectedItems([]);
  }, [currentPage]);

  const fetchFloatingMenus = async () => {
    try {
      setIsLoading(true);
      const response = await getFloatingMenus();
      setFloatingMenus(response.data);
    } catch (error) {
      toast.error('Failed to fetch floating menus');
    } finally {
      setIsLoading(false);
    }
  };

  const filterFloatingMenus = () => {
    let filtered = [...floatingMenus];

    if (searchTerm) {
      filtered = filtered.filter(
        (menu) =>
          menu.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          menu.link?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFloatingMenus(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredFloatingMenus.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFloatingMenus = filteredFloatingMenus.slice(startIndex, endIndex);

  const handleDelete = async (id) => {
    try {
      await deleteFloatingMenu(id);
      toast.success('Floating menu deleted successfully!');
      setSelectedItems([]);
      fetchFloatingMenus();
    } catch (error) {
      toast.error('Failed to delete floating menu');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => deleteFloatingMenu(id)));
      toast.success(`${ids.length} floating menu${ids.length !== 1 ? 's' : ''} deleted successfully!`);
      setSelectedItems([]);
      fetchFloatingMenus();
    } catch (error) {
      toast.error('Failed to delete some floating menus');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(currentFloatingMenus.map(menu => menu.id));
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

  const isAllSelected = currentFloatingMenus.length > 0 && selectedItems.length === currentFloatingMenus.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < currentFloatingMenus.length;

  const toggleStatus = async (menu) => {
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('title', menu.title);
      formData.append('link', menu.link);
      formData.append('target', menu.target || '_self');
      formData.append('date', menu.date || '');
      formData.append('order_by', menu.order_by || 0);
      formData.append('status', !menu.status ? 1 : 0);
      
      await updateFloatingMenu(menu.id, formData);
      toast.success('Status updated!');
      fetchFloatingMenus();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <Navigation className="w-32 h-32 text-gray-300 dark:text-gray-600 mb-6" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Floating Menus Found</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
        {searchTerm
          ? 'No floating menus match your search criteria. Try adjusting your search terms.'
          : 'Get started by creating your first floating menu. Click the button below to add a new floating menu.'}
      </p>
      {!searchTerm && (
        <Can module="floating_menus" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/floating-menus/create')}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Floating Menu
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
          <p className="text-gray-600 dark:text-gray-400">Loading floating menus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Floating Menus</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your floating menu items
          </p>
        </div>
        <Can module="floating_menus" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/floating-menus/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Floating Menu
          </button>
        </Can>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or link..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Found {filteredFloatingMenus.length} menu{filteredFloatingMenus.length !== 1 ? 's' : ''}
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
            <Can module="floating_menus" action="delete">
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
      {filteredFloatingMenus.length === 0 ? (
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
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Link
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Date
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
                  {currentFloatingMenus.map((menu) => (
                    <tr
                      key={menu.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        selectedItems.includes(menu.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(menu.id)}
                          onChange={() => handleSelectItem(menu.id)}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                            <Navigation className="w-5 h-5 text-primary" />
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">{menu.title || <span className="text-gray-400 italic">Untitled</span>}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={menu.link}
                            target={menu.target || '_self'}
                            rel={menu.target === '_blank' ? 'noopener noreferrer' : ''}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 max-w-xs truncate"
                          >
                            {menu.link.length > 40 ? menu.link.substring(0, 40) + '...' : menu.link}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex-shrink-0">
                            {menu.target === '_blank' ? 'New Tab' : 'Same Tab'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {menu.date ? new Date(menu.date).toLocaleDateString() : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{menu.order_by || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Can module="floating_menus" action="update">
                          <button
                            onClick={() => toggleStatus(menu)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              menu.status
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {menu.status ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            {menu.status ? 'Active' : 'Inactive'}
                          </button>
                        </Can>
                        {!hasPermission('floating_menus', 'update') && (
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                            menu.status
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {menu.status ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            {menu.status ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Can module="floating_menus" action="update">
                            <button
                              onClick={() => navigate(`/admin/dashboard/floating-menus/edit/${menu.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </Can>
                          <Can module="floating_menus" action="delete">
                            <button
                              onClick={() => setDeleteConfirm({ isOpen: true, id: menu.id })}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
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
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700/30">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredFloatingMenus.length)} of {filteredFloatingMenus.length} menus
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
        title="Delete Floating Menu"
        message="Are you sure you want to delete this floating menu? This action cannot be undone."
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteConfirm.isOpen}
        onClose={() => setBulkDeleteConfirm({ isOpen: false, ids: [] })}
        onConfirm={() => {
          handleBulkDelete(bulkDeleteConfirm.ids);
          setBulkDeleteConfirm({ isOpen: false, ids: [] });
        }}
        title="Delete Floating Menus"
        message={`Are you sure you want to delete ${bulkDeleteConfirm.ids.length} floating menu${bulkDeleteConfirm.ids.length !== 1 ? 's' : ''}? This action cannot be undone.`}
      />
    </div>
  );
};

export default FloatingMenusList;

