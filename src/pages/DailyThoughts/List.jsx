import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, ChevronLeft, ChevronRight, Trash, Loader, Calendar, User, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDailyThoughts, deleteDailyThought, updateDailyThought } from '../../services/apiService';
import ConfirmModal from '../../components/ConfirmModal';
import Can from '../../components/Can';
import { usePermissions } from '../../hooks/usePermissions';

const DailyThoughtsList = () => {
  const [dailyThoughts, setDailyThoughts] = useState([]);
  const [filteredDailyThoughts, setFilteredDailyThoughts] = useState([]);
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
    fetchDailyThoughts();
  }, []);

  useEffect(() => {
    filterDailyThoughts();
    setSelectedItems([]);
  }, [searchTerm, dailyThoughts]);

  useEffect(() => {
    setSelectedItems([]);
  }, [currentPage]);

  const fetchDailyThoughts = async () => {
    try {
      setIsLoading(true);
      const response = await getDailyThoughts();
      setDailyThoughts(response.data);
    } catch (error) {
      toast.error('Failed to fetch daily thoughts');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDailyThoughts = () => {
    let filtered = [...dailyThoughts];

    if (searchTerm) {
      filtered = filtered.filter(
        (thought) =>
          thought.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          thought.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          thought.author?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDailyThoughts(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredDailyThoughts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDailyThoughts = filteredDailyThoughts.slice(startIndex, endIndex);

  const handleDelete = async (id) => {
    try {
      await deleteDailyThought(id);
      toast.success('Daily thought deleted successfully!');
      setSelectedItems([]);
      fetchDailyThoughts();
    } catch (error) {
      toast.error('Failed to delete daily thought');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => deleteDailyThought(id)));
      toast.success(`${ids.length} daily thought${ids.length !== 1 ? 's' : ''} deleted successfully!`);
      setSelectedItems([]);
      fetchDailyThoughts();
    } catch (error) {
      toast.error('Failed to delete some daily thoughts');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(currentDailyThoughts.map(thought => thought.id));
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

  const isAllSelected = currentDailyThoughts.length > 0 && selectedItems.length === currentDailyThoughts.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < currentDailyThoughts.length;

  const toggleStatus = async (thought) => {
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('title', thought.title);
      formData.append('excerpt', thought.excerpt || '');
      formData.append('date', thought.date || '');
      formData.append('author', thought.author || '');
      formData.append('status', !thought.status ? 1 : 0);
      
      await updateDailyThought(thought.id, formData);
      toast.success('Status updated!');
      fetchDailyThoughts();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <Lightbulb className="w-32 h-32 text-gray-300 dark:text-gray-600 mb-6" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Daily Thoughts Found</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
        {searchTerm
          ? 'No daily thoughts match your search criteria. Try adjusting your search terms.'
          : 'Get started by creating your first daily thought. Click the button below to add a new thought.'}
      </p>
      {!searchTerm && (
        <Can module="daily_thoughts" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/daily-thoughts/create')}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Daily Thought
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
          <p className="text-gray-600 dark:text-gray-400">Loading daily thoughts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Thoughts</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your daily thoughts and inspirations
          </p>
        </div>
        <Can module="daily_thoughts" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/daily-thoughts/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Daily Thought
          </button>
        </Can>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, excerpt, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Found {filteredDailyThoughts.length} thought{filteredDailyThoughts.length !== 1 ? 's' : ''}
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
            <Can module="daily_thoughts" action="delete">
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
      {filteredDailyThoughts.length === 0 ? (
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
                      Excerpt
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Author
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
                  {currentDailyThoughts.map((thought) => (
                    <tr
                      key={thought.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        selectedItems.includes(thought.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(thought.id)}
                          onChange={() => handleSelectItem(thought.id)}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                            <Lightbulb className="w-5 h-5 text-primary" />
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">{thought.title || <span className="text-gray-400 italic">Untitled</span>}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                          {thought.excerpt ? (
                            <div 
                              className="line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: thought.excerpt }}
                            />
                          ) : (
                            <span className="text-gray-400 italic">No excerpt</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {thought.date ? new Date(thought.date).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {thought.author ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <User className="w-4 h-4" />
                            {thought.author}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Can module="daily_thoughts" action="update">
                          <button
                            onClick={() => toggleStatus(thought)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              thought.status
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {thought.status ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            {thought.status ? 'Active' : 'Inactive'}
                          </button>
                        </Can>
                        {!hasPermission('daily_thoughts', 'update') && (
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                            thought.status
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {thought.status ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            {thought.status ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Can module="daily_thoughts" action="update">
                            <button
                              onClick={() => navigate(`/admin/dashboard/daily-thoughts/edit/${thought.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </Can>
                          <Can module="daily_thoughts" action="delete">
                            <button
                              onClick={() => setDeleteConfirm({ isOpen: true, id: thought.id })}
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredDailyThoughts.length)} of {filteredDailyThoughts.length} thoughts
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
        title="Delete Daily Thought"
        message="Are you sure you want to delete this daily thought? This action cannot be undone."
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteConfirm.isOpen}
        onClose={() => setBulkDeleteConfirm({ isOpen: false, ids: [] })}
        onConfirm={() => {
          handleBulkDelete(bulkDeleteConfirm.ids);
          setBulkDeleteConfirm({ isOpen: false, ids: [] });
        }}
        title="Delete Daily Thoughts"
        message={`Are you sure you want to delete ${bulkDeleteConfirm.ids.length} daily thought${bulkDeleteConfirm.ids.length !== 1 ? 's' : ''}? This action cannot be undone.`}
      />
    </div>
  );
};

export default DailyThoughtsList;

