'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Permission, hasPermission } from '@/app/lib/permissions';

interface UpdateUserProps {
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const UpdateUser: React.FC<UpdateUserProps> = ({ userId, onSuccess, onCancel }) => {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    role: 'USER',
    status: 'ACTIVE'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const toastShownRef = useRef(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [userRole, setUserRole] = useState('USER');

  useEffect(() => {
    const fetchUserAndPermissions = async () => {
      try {
        // Fetch user's own permissions first
        const userPermsResponse = await fetch('/api/users/me/permissions');
        if (!userPermsResponse.ok) {
          throw new Error('Failed to fetch user permissions');
        }
        const userPermsData = await userPermsResponse.json();
        setUserPermissions(userPermsData);

        // Check if user has permission to update users
        const canUpdateUsers = hasPermission(userPermsData, {
          module: 'userManagement',
          action: 'update'
        });
        setCanUpdate(canUpdateUsers);

        // Fetch user role
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        setUserRole(sessionData?.user?.role || 'USER');

        // Fetch user data
        const userResponse = await fetch(`/api/users/${userId}`);
        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          throw new Error(errorText || 'Failed to fetch user data');
        }
        const userData = await userResponse.json();
        
        // Set form data
        setFormData({
          name: userData.name,
          phoneNumber: userData.phoneNumber,
          role: userData.role,
          status: userData.status
        });

        // Set selected permissions
        const initialSelected = userData.permissions.reduce((acc: { [key: string]: boolean }, perm: Permission) => {
          acc[`${perm.module}-${perm.action}`] = true;
          return acc;
        }, {});
        setSelected(initialSelected);

        // Fetch all available permissions
        const permissionsResponse = await fetch('/api/admin/permissions-list');
        if (!permissionsResponse.ok) {
          const errorText = await permissionsResponse.text();
          throw new Error(errorText || 'Failed to fetch permissions');
        }
        const permissionsData = await permissionsResponse.json();
        setPermissions(permissionsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load user data or permissions';
        setError(errorMessage);
        // Only show toast for actual errors, not permissions
        if (!errorMessage.includes('permission')) {
          toast.error(errorMessage, {
            style: {
              background: '#FEE2E2',
              color: '#B91C1C',
              border: '1px solid #FCA5A5',
            },
          });
        }
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndPermissions();
  }, [userId, router]);

  // Only include userManagement module for permissions
  const filteredPermissions = permissions.filter(perm => perm.module === 'userManagement');
  // Group filtered permissions by module
  const grouped = filteredPermissions.reduce((acc, perm) => {
    acc[perm.module] = acc[perm.module] || [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleCheck = (module: string, action: string) => {
    const key = `${module}-${action}`;
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const selectedPermissionIds = Object.entries(selected)
        .filter(([_, isSelected]) => isSelected)
        .map(([key]) => {
          const [module, action] = key.split('-');
          return { module, action };
        });

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          permissionIds: selectedPermissionIds,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        toast.error(error, {
          style: {
            background: '#FEE2E2',
            color: '#B91C1C',
            border: '1px solid #FCA5A5',
          },
        });
        throw new Error(error);
      }

      router.refresh();
      toast.success('User updated successfully!', {
        style: {
          background: '#DCFCE7',
          color: '#166534',
          border: '1px solid #86EFAC',
        },
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      toast.error(err instanceof Error ? err.message : 'Failed to update user', {
        style: {
          background: '#FEE2E2',
          color: '#B91C1C',
          border: '1px solid #FCA5A5',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only render form if user can update or is super admin
  if (!canUpdate && userRole !== 'SUPER_ADMIN') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="border p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 max-w-3xl mx-auto mt-8 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && error.includes('Unauthorized')) {
    return null;
  }

  return (
    <div className="mt-4 animate-fadeIn max-w-6xl mx-auto w-full" style={{ transition: 'all 0.4s cubic-bezier(.4,0,.2,1)' }}>
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Update User Form Card */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-extrabold mb-3 sm:mb-4 text-gray-800 dark:text-white tracking-tight">Update User</h2>
          {error && (
            <div className="mb-2 p-2 bg-red-100 text-red-700 rounded-lg shadow-sm text-xs sm:text-sm">
              {error}
            </div>
          )}
          <form id="update-user-form" onSubmit={handleSubmit} className="space-y-2 sm:space-y-2">
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="block font-semibold mb-0.5 text-sm sm:text-base text-gray-700 dark:text-gray-200">Name</label>
                <input
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-1 sm:py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md text-sm sm:text-base"
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-0.5 text-sm sm:text-base text-gray-700 dark:text-gray-200">Phone Number</label>
                <input
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-1 sm:py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md text-sm sm:text-base"
                  type="text"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-0.5 text-sm sm:text-base text-gray-700 dark:text-gray-200">Role</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-1 sm:py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md text-sm sm:text-base"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    required
                  >
                    <option value="USER">User</option>
                    <option value="SUPER_ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-0.5 text-sm sm:text-base text-gray-700 dark:text-gray-200">Status</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-1 sm:py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md text-sm sm:text-base"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>
        {/* Permissions Card */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col">
          <h3 className="font-bold mb-2 text-base text-gray-800 dark:text-white">Permissions</h3>
          <div className="space-y-3 flex-1">
            {Object.entries(grouped).map(([module, perms]) => (
              <div key={module} className="border rounded-xl p-3 shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="font-semibold mb-1 text-blue-700 dark:text-blue-300 text-sm">{module === 'userManagement' ? 'User Management' : module}</div>
                <div className="flex flex-wrap gap-3">
                  {perms.map((perm) => {
                    const key = `${perm.module}-${perm.action}`;
                    return (
                      <label key={key} className="flex items-center gap-2 text-gray-700 dark:text-gray-200 text-sm">
                        <input
                          type="checkbox"
                          checked={!!selected[key]}
                          onChange={() => handleCheck(perm.module, perm.action)}
                          className="accent-blue-600 w-4 h-4 rounded border-gray-300 dark:border-gray-700 shadow-md"
                        />
                        <span className="capitalize font-medium">{perm.action}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {/* Action Buttons at the bottom of the card */}
          <div className="flex justify-end gap-2 sm:gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm sm:text-base shadow-sm border border-gray-200 dark:border-gray-700 btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="update-user-form"
              className="px-4 py-1.5 rounded-lg bg-gradient-to-tr from-blue-600 to-blue-400 text-white font-semibold hover:from-blue-700 hover:to-blue-500 transition text-sm sm:text-base shadow-sm border border-blue-700 btn-update"
            >
              Update User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUser; 