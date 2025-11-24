import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader, Shield, Users, X, Check, X as XIcon, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRole, createRole, updateRole, getPermissionOptions, getUsers } from '../../services/apiService';
import RichTextEditor from '../../components/RichTextEditor';

const RolesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const [modules, setModules] = useState({});
  const [actions, setActions] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: true,
    permissions: {},
  });

  useEffect(() => {
    fetchPermissionOptions();
    fetchAllUsers();
    if (isEditing) {
      fetchRoleData();
    }
  }, [id]);

  useEffect(() => {
    if (formData.name && !isEditing) {
      const slug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, isEditing]);

  const fetchPermissionOptions = async () => {
    try {
      const response = await getPermissionOptions();
      setModules(response.data.modules || {});
      setActions(response.data.actions || {});
    } catch (error) {
      toast.error('Failed to load permission options');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await getUsers();
      setAllUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const fetchRoleData = async () => {
    try {
      setIsLoadingData(true);
      const response = await getRole(id);
      const role = response.data;
      setFormData({
        name: role.name || '',
        slug: role.slug || '',
        status: role.status !== undefined ? role.status : true,
        permissions: role.permissions || {},
      });
      // Set selected users
      if (role.users && role.users.length > 0) {
        setSelectedUserIds(role.users.map(user => user.id));
      } else {
        setSelectedUserIds([]);
      }
    } catch (error) {
      toast.error('Failed to load role data');
      navigate('/admin/dashboard/roles');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value,
    }));
  };

  const handleStatusChange = (value) => {
    setFormData(prev => ({ ...prev, status: value === 'true' }));
  };

  const handlePermissionChange = (module, action, checked) => {
    setFormData(prev => {
      const newPermissions = { ...prev.permissions };
      if (!newPermissions[module]) {
        newPermissions[module] = [];
      }
      
      if (checked) {
        if (!newPermissions[module].includes(action)) {
          newPermissions[module] = [...newPermissions[module], action];
        }
      } else {
        newPermissions[module] = newPermissions[module].filter(a => a !== action);
        if (newPermissions[module].length === 0) {
          delete newPermissions[module];
        }
      }
      
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleModuleSelectAll = (module) => {
    const moduleActions = Object.keys(actions);
    
    setFormData(prev => {
      const newPermissions = { ...prev.permissions };
      const currentModulePermissions = newPermissions[module] || [];
      const isAllSelected = moduleActions.length > 0 && 
                           moduleActions.every(action => currentModulePermissions.includes(action));
      
      if (isAllSelected) {
        // If all are selected, deselect all
        delete newPermissions[module];
      } else {
        // If not all are selected, select all
        newPermissions[module] = [...moduleActions];
      }
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSelectAllModules = () => {
    const moduleActions = Object.keys(actions);
    setFormData(prev => {
      const newPermissions = { ...prev.permissions };
      Object.keys(modules).forEach(moduleKey => {
        newPermissions[moduleKey] = [...moduleActions];
      });
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleDeselectAllModules = () => {
    setFormData(prev => {
      return { ...prev, permissions: {} };
    });
  };

  const areAllModulesSelected = () => {
    const moduleActions = Object.keys(actions);
    if (moduleActions.length === 0) return false;
    
    return Object.keys(modules).every(moduleKey => {
      const modulePermissions = formData.permissions[moduleKey] || [];
      return moduleActions.every(action => modulePermissions.includes(action));
    });
  };

  const areSomeModulesSelected = () => {
    return Object.keys(modules).some(moduleKey => {
      return formData.permissions[moduleKey] && formData.permissions[moduleKey].length > 0;
    });
  };

  // Filter modules based on search query
  const filteredModules = Object.entries(modules).filter(([moduleKey, moduleName]) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return moduleName.toLowerCase().includes(query) || moduleKey.toLowerCase().includes(query);
  });

  const isModuleAllSelected = (module) => {
    const moduleActions = Object.keys(actions);
    return moduleActions.length > 0 && 
           formData.permissions[module] && 
           moduleActions.every(action => formData.permissions[module].includes(action));
  };

  const isModuleSomeSelected = (module) => {
    return formData.permissions[module] && formData.permissions[module].length > 0;
  };

  const hasPermission = (module, action) => {
    return formData.permissions[module] && formData.permissions[module].includes(action);
  };

  const validateForm = () => {
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Name is required');
      return false;
    }
    if (!formData.slug || formData.slug.trim() === '') {
      toast.error('Slug is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e, saveAndContinue = false) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);

    try {
      const dataToSend = {
        name: formData.name,
        slug: formData.slug,
        permissions: formData.permissions,
        status: formData.status ? 1 : 0,
      };

      if (isEditing) {
        dataToSend.user_ids = selectedUserIds;
        await updateRole(id, dataToSend);
        toast.success('Role updated successfully!');
      } else {
        await createRole(dataToSend);
        toast.success('Role created successfully!');
      }

      if (saveAndContinue) {
        if (!isEditing) {
          setFormData({
            name: '',
            slug: '',
            status: true,
            permissions: {},
          });
        } else {
          fetchRoleData();
        }
      } else {
        navigate('/admin/dashboard/roles');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save role');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading role data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/dashboard/roles')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Role' : 'Create New Role'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isEditing ? 'Update role information and permissions' : 'Create a new role and assign permissions'}
        </p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g., Administrator"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono"
                  placeholder="e.g., administrator"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="true"
                      checked={formData.status === true}
                      onChange={() => handleStatusChange('true')}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="false"
                      checked={formData.status === false}
                      onChange={() => handleStatusChange('false')}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Inactive</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Permissions
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Select the permissions for each module. Users with this role will have access to the selected actions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeselectAllModules}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Deselect All
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllModules}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Select All
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Found {filteredModules.length} module(s) matching "{searchQuery}"
                </p>
              )}
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredModules.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No modules found matching your search.' : 'No modules available.'}
                  </p>
                </div>
              ) : (
                filteredModules.map(([moduleKey, moduleName]) => {
                const selectedCount = formData.permissions[moduleKey]?.length || 0;
                const totalCount = Object.keys(actions).length;
                const isAllSelected = isModuleAllSelected(moduleKey);
                const isSomeSelected = isModuleSomeSelected(moduleKey);
                
                return (
                  <div
                    key={moduleKey}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Module Header */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleModuleSelectAll(moduleKey)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            isAllSelected 
                              ? 'bg-primary' 
                              : isSomeSelected 
                                ? 'bg-primary/60' 
                                : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isAllSelected || isSomeSelected ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{moduleName}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {selectedCount === totalCount ? 'All permissions granted' : `${selectedCount} of ${totalCount} permissions`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isAllSelected 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : isSomeSelected
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {selectedCount}/{totalCount}
                        </div>
                      </div>
                    </div>
                    
                    {/* Permissions Grid */}
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(actions).map(([actionKey, actionName]) => {
                          const isSelected = hasPermission(moduleKey, actionKey);
                          const actionColors = {
                            create: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', selected: 'bg-blue-600', text: 'text-blue-700 dark:text-blue-300' },
                            read: { bg: 'bg-green-500', hover: 'hover:bg-green-600', selected: 'bg-green-600', text: 'text-green-700 dark:text-green-300' },
                            update: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', selected: 'bg-yellow-600', text: 'text-yellow-700 dark:text-yellow-300' },
                            delete: { bg: 'bg-red-500', hover: 'hover:bg-red-600', selected: 'bg-red-600', text: 'text-red-700 dark:text-red-300' },
                          };
                          const colors = actionColors[actionKey] || { bg: 'bg-gray-500', hover: 'hover:bg-gray-600', selected: 'bg-gray-600', text: 'text-gray-700 dark:text-gray-300' };
                          
                          return (
                            <button
                              key={actionKey}
                              type="button"
                              onClick={() => handlePermissionChange(moduleKey, actionKey, !isSelected)}
                              className={`relative group flex items-center justify-between gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                                isSelected
                                  ? `${colors.selected} border-transparent text-white shadow-md`
                                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                            >
                              <span className={`text-sm font-medium ${isSelected ? 'text-white' : colors.text}`}>
                                {actionName}
                              </span>
                              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'bg-white/20' 
                                  : 'bg-gray-200 dark:bg-gray-600 group-hover:bg-gray-300 dark:group-hover:bg-gray-500'
                              }`}>
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                ) : (
                                  <XIcon className="w-3 h-3 text-gray-400 dark:text-gray-500" strokeWidth={3} />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>

          {isEditing && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Assign Users
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select users to assign this role. Users with this role will have the permissions defined above.
              </p>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {allUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUserIds([...selectedUserIds, user.id]);
                        } else {
                          setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                        }
                      }}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                    {user.roles && user.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role.id}
                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </label>
                ))}
              </div>
              {allUsers.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No users available
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard/roles')}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSaving}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RolesForm;

