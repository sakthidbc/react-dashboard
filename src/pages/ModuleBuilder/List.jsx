import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, Loader, Code, Play, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getModuleBuilders, deleteModuleBuilder, generateModule } from '../../services/apiService';
import ConfirmModal from '../../components/ConfirmModal';
import Can from '../../components/Can';
import { usePermissions } from '../../hooks/usePermissions';

const ModuleBuilderList = () => {
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [generateConfirm, setGenerateConfirm] = useState({ isOpen: false, id: null, name: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    filterModules();
  }, [searchTerm, modules]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchModules = async () => {
    try {
      setIsLoading(true);
      const response = await getModuleBuilders();
      setModules(response.data);
    } catch (error) {
      toast.error('Failed to fetch modules');
    } finally {
      setIsLoading(false);
    }
  };

  const filterModules = () => {
    let filtered = [...modules];

    if (searchTerm) {
      filtered = filtered.filter(
        (module) =>
          module.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredModules(filtered);
  };

  const totalPages = Math.ceil(filteredModules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentModules = filteredModules.slice(startIndex, endIndex);

  const handleDelete = async (id) => {
    try {
      await deleteModuleBuilder(id);
      toast.success('Module definition deleted successfully!');
      fetchModules();
      // Reload page to refresh sidebar and dashboard
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Failed to delete module definition');
    }
  };

  const handleGenerate = async (id) => {
    try {
      setIsGenerating(true);
      await generateModule(id);
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('moduleCacheCleared'));
      // Also set localStorage to notify other tabs
      localStorage.setItem('module_generated', Date.now().toString());
      toast.success('Module generated successfully! Refreshing page to show new module...');
      fetchModules();
      // Reload page to refresh sidebar and dashboard
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate module');
    } finally {
      setIsGenerating(false);
      setGenerateConfirm({ isOpen: false, id: null, name: '' });
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <Code className="w-32 h-32 text-gray-300 dark:text-gray-600 mb-6" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Modules Found</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
        {searchTerm
          ? 'No modules match your search criteria. Try adjusting your search terms.'
          : 'Get started by creating your first dynamic module. Click the button below to add a new module definition.'}
      </p>
      {!searchTerm && (
        <Can module="module_builder" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/module-builder/create')}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Create New Module
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
          <p className="text-gray-600 dark:text-gray-400">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Module Builder</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create and manage dynamic modules
          </p>
        </div>
        <Can module="module_builder" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/module-builder/create')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Create New Module
          </button>
        </Can>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, label, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Found {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Table */}
      {filteredModules.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Module Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Label
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Table Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Fields
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentModules.map((module) => (
                  <tr
                    key={module.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                          <Code className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{module.name}</div>
                          {module.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                              {module.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">{module.label}</span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                        {module.table_name}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {module.fields?.length || 0} field{module.fields?.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {module.is_generated ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            <CheckCircle className="w-3 h-3" />
                            Generated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                            <XCircle className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!module.is_generated && (
                          <Can module="module_builder" action="create">
                            <button
                              onClick={() => setGenerateConfirm({ isOpen: true, id: module.id, name: module.label })}
                              disabled={isGenerating}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Generate Module"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          </Can>
                        )}
                        <Can module="module_builder" action="update">
                          <button
                            onClick={() => navigate(`/admin/dashboard/module-builder/edit/${module.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </Can>
                        <Can module="module_builder" action="delete">
                          <button
                            onClick={() => setDeleteConfirm({ isOpen: true, id: module.id })}
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
        onConfirm={() => {
          handleDelete(deleteConfirm.id);
          setDeleteConfirm({ isOpen: false, id: null });
        }}
        title="Confirm Delete"
        message="Are you sure you want to delete this module definition? This action cannot be undone."
      />

      {/* Generate Confirmation Modal */}
      <ConfirmModal
        isOpen={generateConfirm.isOpen}
        onClose={() => setGenerateConfirm({ isOpen: false, id: null, name: '' })}
        onConfirm={() => handleGenerate(generateConfirm.id)}
        title="Generate Module"
        message={`Are you sure you want to generate the "${generateConfirm.name}" module? This will create all necessary files (migration, model, controller, routes). This action cannot be undone.`}
      />
    </div>
  );
};

export default ModuleBuilderList;

