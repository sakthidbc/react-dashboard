import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Users as UsersIcon, ChevronLeft, ChevronRight, Trash, Mail, Shield, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getUsers, deleteUser } from '../../services/apiService';
import ConfirmModal from '../../components/ConfirmModal';
import Can from '../../components/Can';
import Pagination from '../../components/Pagination';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState({ isOpen: false, ids: [] });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
    setSelectedItems([]);
  }, [searchTerm, users]);

  useEffect(() => {
    setSelectedItems([]);
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      toast.success('User deleted successfully!');
      setSelectedItems([]);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => deleteUser(id)));
      toast.success(`${ids.length} user${ids.length !== 1 ? 's' : ''} deleted successfully!`);
      setSelectedItems([]);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete some users');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(currentUsers.map(user => user.id));
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

  const isAllSelected = currentUsers.length > 0 && selectedItems.length === currentUsers.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < currentUsers.length;

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <UsersIcon className="w-32 h-32 text-gray-300 dark:text-gray-600 mb-6" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Users Found</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
        {searchTerm
          ? 'No users match your search criteria. Try adjusting your search terms.'
          : 'Get started by creating your first user. Click the button below to add a new user.'}
      </p>
      {!searchTerm && (
        <Can module="roles" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/users/create')}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New User
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
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage system users and their roles</p>
        </div>
        <Can module="roles" action="create">
          <button
            onClick={() => navigate('/admin/dashboard/users/create')}
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
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
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
            <Can module="roles" action="delete">
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
      {filteredUsers.length === 0 ? (
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
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Roles
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedItems.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(user.id)}
                          onChange={() => handleSelectItem(user.id)}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.name || <span className="text-gray-400 italic">No name</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user.email || <span className="text-gray-400">-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role, index) => {
                              const roleName = role.name || role;
                              // Different colors for different roles
                              const roleColors = [
                                { bg: 'bg-purple-100', bgDark: 'dark:bg-purple-900/30', text: 'text-purple-700', textDark: 'dark:text-purple-300' },
                                { bg: 'bg-blue-100', bgDark: 'dark:bg-blue-900/30', text: 'text-blue-700', textDark: 'dark:text-blue-300' },
                                { bg: 'bg-green-100', bgDark: 'dark:bg-green-900/30', text: 'text-green-700', textDark: 'dark:text-green-300' },
                                { bg: 'bg-orange-100', bgDark: 'dark:bg-orange-900/30', text: 'text-orange-700', textDark: 'dark:text-orange-300' },
                                { bg: 'bg-pink-100', bgDark: 'dark:bg-pink-900/30', text: 'text-pink-700', textDark: 'dark:text-pink-300' },
                                { bg: 'bg-indigo-100', bgDark: 'dark:bg-indigo-900/30', text: 'text-indigo-700', textDark: 'dark:text-indigo-300' },
                                { bg: 'bg-teal-100', bgDark: 'dark:bg-teal-900/30', text: 'text-teal-700', textDark: 'dark:text-teal-300' },
                                { bg: 'bg-red-100', bgDark: 'dark:bg-red-900/30', text: 'text-red-700', textDark: 'dark:text-red-300' },
                              ];
                              // Use role name hash for consistent color assignment
                              const colorIndex = roleName.toLowerCase().charCodeAt(0) % roleColors.length;
                              const colors = roleColors[colorIndex];

                              return (
                                <span
                                  key={role.id || role}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.bgDark} ${colors.text} ${colors.textDark}`}
                                >
                                  <Shield className="w-3 h-3" />
                                  {roleName}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-xs text-gray-400">No roles</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Can module="roles" action="update">
                            <button
                              onClick={() => navigate(`/admin/dashboard/users/edit/${user.id}`)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          </Can>
                          <Can module="roles" action="delete">
                            <button
                              onClick={() => setDeleteConfirm({ isOpen: true, id: user.id })}
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
            totalItems={filteredUsers.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            startIndex={startIndex}
            endIndex={endIndex}
            itemName="users"
          />
        </>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
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
        title="Delete Selected Users"
        message={`Are you sure you want to delete ${bulkDeleteConfirm.ids.length} user${bulkDeleteConfirm.ids.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default UsersList;

