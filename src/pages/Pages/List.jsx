import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, FileText, ChevronLeft, ChevronRight, Trash, Loader, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPages, deletePage, updatePage } from '../../services/apiService';
import ConfirmModal from '../../components/ConfirmModal';
import Can from '../../components/Can';
import Pagination from '../../components/Pagination';

const PagesList = () => {
  const [pages, setPages] = useState([]);
  const [filteredPages, setFilteredPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState({ isOpen: false, ids: [] });
  const [copiedUrl, setCopiedUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    filterPages();
    setSelectedItems([]);
  }, [searchTerm, pages]);

  useEffect(() => {
    setSelectedItems([]);
  }, [currentPage]);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const response = await getPages();
      setPages(response.data);
    } catch (error) {
      toast.error('Failed to fetch pages');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPages = () => {
    let filtered = [...pages];

    if (searchTerm) {
      filtered = filtered.filter(
        (page) =>
          page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPages(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPages = filteredPages.slice(startIndex, endIndex);

  const handleDelete = async (id) => {
    try {
      await deletePage(id);
      toast.success('Page deleted successfully!');
      setSelectedItems([]);
      fetchPages();
    } catch (error) {
      toast.error('Failed to delete page');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => deletePage(id)));
      toast.success(`${ids.length} page${ids.length !== 1 ? 's' : ''} deleted successfully!`);
      setSelectedItems([]);
      fetchPages();
    } catch (error) {
      toast.error('Failed to delete some pages');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(currentPages.map(page => page.id));
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

  const isAllSelected = currentPages.length > 0 && selectedItems.length === currentPages.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < currentPages.length;

  const toggleStatus = async (page) => {
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('menu_id', page.menu_id || '');
      formData.append('title', page.title || '');
      formData.append('slug', page.slug || '');
      formData.append('excerpt', page.excerpt || '');
      formData.append('description', page.description || '');
      formData.append('date', page.date || '');
      formData.append('author', page.author || '');
      formData.append('status', !page.status ? '1' : '0');
      
      await updatePage(page.id, formData);
      toast.success('Status updated!');
      fetchPages();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const copyUrl = (slug) => {
    const url = `${window.location.origin}/page/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(slug);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopiedUrl(null), 2000);
    }).catch(() => {
      toast.error('Failed to copy URL');
    });
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Pages Found</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
        {searchTerm
          ? 'No pages match your search criteria. Try adjusting your search terms.'
          : 'Get started by creating your first page. Click the button below to add a new page.'}
      </p>
      {!searchTerm && (
        <Can module="pages" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/pages/create')}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Page
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
          <p className="text-gray-600 dark:text-gray-400">Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pages</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your website pages</p>
        </div>
        <Can module="pages" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/pages/create')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm shadow-sm"
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
            Found {filteredPages.length} page{filteredPages.length !== 1 ? 's' : ''}
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
            <button
              onClick={() => setBulkDeleteConfirm({ isOpen: true, ids: selectedItems })}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              <Trash className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredPages.length === 0 ? (
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
                      Slug
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      URL
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
                  {currentPages.map((page) => (
                    <tr
                      key={page.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        selectedItems.includes(page.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(page.id)}
                          onChange={() => handleSelectItem(page.id)}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {page.title || <span className="text-gray-400 italic">Untitled</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {page.slug || <span className="text-gray-400">-</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate max-w-xs">
                            {window.location.origin}/page/{page.slug}
                          </span>
                          <button
                            onClick={() => copyUrl(page.slug)}
                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Copy URL"
                          >
                            {copiedUrl === page.slug ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(page)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            page.status
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {page.status ? (
                            <>
                              <Eye className="w-4 h-4" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Can module="pages" action="update">
                            <button
                              onClick={() => navigate(`/admin/dashboard/pages/edit/${page.id}`)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          </Can>
                          <Can module="pages" action="delete">
                            <button
                              onClick={() => setDeleteConfirm({ isOpen: true, id: page.id })}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </Can>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredPages.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            startIndex={startIndex}
            endIndex={endIndex}
            itemName="pages"
          />
        </>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Delete Page"
        message="Are you sure you want to delete this page? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Bulk Delete Confirm Modal */}
      <ConfirmModal
        isOpen={bulkDeleteConfirm.isOpen}
        onClose={() => setBulkDeleteConfirm({ isOpen: false, ids: [] })}
        onConfirm={() => {
          handleBulkDelete(bulkDeleteConfirm.ids);
          setBulkDeleteConfirm({ isOpen: false, ids: [] });
        }}
        title="Delete Selected Pages"
        message={`Are you sure you want to delete ${bulkDeleteConfirm.ids.length} page${bulkDeleteConfirm.ids.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default PagesList;

