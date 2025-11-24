import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader, Shield, Users, X } from 'lucide-react';
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

  const handleModuleSelectAll = (module, checked) => {
    const moduleActions = Object.keys(actions);
    setFormData(prev => {
      const newPermissions = { ...prev.permissions };
      if (checked) {
        newPermissions[module] = [...moduleActions];
      } else {
        delete newPermissions[module];
      }
      return { ...prev, permissions: newPermissions };
    });
  };

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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Permissions
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Select the permissions for each module. Users with this role will have access to the selected actions.
            </p>

            <div className="space-y-4">
              {Object.entries(modules).map(([moduleKey, moduleName]) => (
                <div
                  key={moduleKey}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isModuleAllSelected(moduleKey)}
                        ref={(input) => {
                          if (input) input.indeterminate = isModuleSomeSelected(moduleKey) && !isModuleAllSelected(moduleKey);
                        }}
                        onChange={(e) => handleModuleSelectAll(moduleKey, e.target.checked)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{moduleName}</h3>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.permissions[moduleKey]?.length || 0} / {Object.keys(actions).length} selected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-7">
                    {Object.entries(actions).map(([actionKey, actionName]) => (
                      <label
                        key={actionKey}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={hasPermission(moduleKey, actionKey)}
                          onChange={(e) => handlePermissionChange(moduleKey, actionKey, e.target.checked)}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{actionName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
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

