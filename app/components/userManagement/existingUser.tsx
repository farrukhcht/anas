'use client';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaUserPlus, FaHistory } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Permission, hasPermission } from '@/app/lib/permissions';

interface User {
  id: string;
  name: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdBy?: string;
}

interface ExistingUserProps {
  onEditUser?: (id: string) => void;
  onViewActivity?: (id: string) => void;
  search?: string;
  compact?: boolean;
}

const ExistingUser: React.FC<ExistingUserProps> = ({ onEditUser, onViewActivity, search = '', compact = false }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<{ [id: string]: boolean }>({});
  const [selectAll, setSelectAll] = useState(false);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [page, setPage] = useState(1);
  const usersPerPage = 27;

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then(setUsers);
    fetch('/api/users/me/permissions')
      .then(res => res.json())
      .then(setUserPermissions);
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setUserRole(data?.user?.role || '');
        setUserId(data?.user?.id || '');
      });
  }, []);

  // Filter users by name, phone, role, or status
  const filteredUsers = users.filter((user) => {
    const searchLower = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      (user.phoneNumber || '').toLowerCase().includes(searchLower) ||
      (user.role || '').toLowerCase().includes(searchLower) ||
      (user.status || '').toLowerCase().includes(searchLower)
    );
  });

  // Pagination state and logic (must come after filteredUsers)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * usersPerPage, page * usersPerPage);

  const handleSelect = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = () => {
    setSelectAll((prev) => {
      const newVal = !prev;
      setSelected(
        newVal ? Object.fromEntries(users.map((u) => [u.id, true])) : {}
      );
      return newVal;
    });
  };

  const confirmDelete = (onDelete: () => void) => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl px-8 py-6 flex flex-col items-center border border-gray-200 dark:border-gray-700" style={{ minWidth: 320 }}>
        <div className="text-xl font-bold mb-2 text-red-600 flex items-center gap-2"><FaTrash /> Confirm Delete</div>
        <div className="mb-4 text-gray-700 dark:text-gray-200">Are you sure you want to delete?</div>
        <div className="flex gap-4 mt-2">
          <button
            className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition"
            onClick={() => { toast.dismiss(t.id); onDelete(); }}
          >
            Delete
          </button>
        </div>
      </div>
    ), { position: 'top-center' });
  };

  const handleDelete = async (id: string) => {
    confirmDelete(async () => {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        toast.success('User deleted!', {
          style: {
            background: '#FEF2F2',
            color: '#991B1B',
            border: '1px solid #FECACA',
          },
        });
      } else {
        toast.error('Failed to delete user', {
          style: {
            background: '#FEE2E2',
            color: '#B91C1C',
            border: '1px solid #FCA5A5',
          },
        });
      }
    });
  };

  const handleBulkDelete = async () => {
    confirmDelete(async () => {
      const ids = Object.keys(selected).filter((id) => selected[id]);
      await Promise.all(ids.map((id) => fetch(`/api/users/${id}`, { method: 'DELETE' })));
      setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));
      setSelected({});
      setSelectAll(false);
      toast.success('Selected users deleted!', {
        style: {
          background: '#FEF2F2',
          color: '#991B1B',
          border: '1px solid #FECACA',
        },
      });
    });
  };

  const handleViewActivity = (userId: string) => {
    console.log('Activity button clicked for user:', userId);
    if (onViewActivity) {
      onViewActivity(userId);
    }
  };

  // Reset page to 1 if search changes
  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mt-0 sm:mt-2 w-full text-gray-900 dark:text-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-2 sm:mb-2">
        <h2 className="text-xl sm:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-0">Existing Users</h2>
        {Object.values(selected).filter(Boolean).length > 0 &&
          (userRole === 'SUPER_ADMIN' || hasPermission(userPermissions, { module: 'userManagement', action: 'delete' })) && (
          <button
            className="ml-auto px-3 sm:px-3 py-1 sm:py-1 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500 to-pink-500 dark:from-transparent dark:to-transparent text-white dark:text-orange-400 font-bold shadow-lg flex items-center gap-1 hover:from-red-600 hover:to-pink-600 dark:hover:from-transparent dark:hover:to-transparent transition-all duration-200 text-xs sm:text-sm border-0"
            onClick={handleBulkDelete}
            style={{ minWidth: 'fit-content' }}
          >
            <FaTrash className="text-xs sm:text-sm" /> Delete Selected
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="table min-w-full w-full text-sm bg-transparent">
          <thead className="bg-[#F3F4F6] dark:bg-[#C3602D] text-xs uppercase font-bold text-gray-900 dark:text-gray-100">
            <tr>
              <th className="p-2 text-left border-b border-gray-200 dark:border-gray-800">
                <input
                  type="checkbox"
                  checked={filteredUsers.filter(u => u.role !== 'SUPER_ADMIN').length > 0 && filteredUsers.filter(u => u.role !== 'SUPER_ADMIN').every(u => selected[u.id])}
                  onChange={handleSelectAll}
                  className="accent-blue-600 dark:accent-green-500 w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0A0A0A]"
                  title="Select All"
                />
              </th>
              <th className="p-2 text-left border-b border-gray-200 dark:border-gray-800">Name</th>
              <th className="p-2 text-left border-b border-gray-200 dark:border-gray-800">Phone</th>
              <th className="p-2 text-left border-b border-gray-200 dark:border-gray-800">Role</th>
              <th className="p-2 text-left border-b border-gray-200 dark:border-gray-800">Status</th>
              <th className="p-2 text-center border-b border-gray-200 dark:border-gray-800">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, idx) => (
              <tr key={user.id} className={`
                ${idx % 2 === 0 ? 'bg-white' : ''}
                dark:bg-[#0A0A0A] transition-colors border-b border-gray-200 dark:border-[#23242A]`
              }>
                <td className="p-2 text-left font-medium">
                  {user.role !== 'SUPER_ADMIN' && (
                    <input
                      type="checkbox"
                      checked={!!selected[user.id]}
                      onChange={() => handleSelect(user.id)}
                      className="accent-blue-600 dark:accent-green-500 w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0A0A0A]"
                      title="Select User"
                    />
                  )}
                </td>
                <td className="p-2 text-left font-medium text-gray-900 dark:text-[#e5e7eb]">{user.name}</td>
                <td className="p-2 text-left text-gray-700 dark:text-[#e5e7eb]">{user.phoneNumber || '-'}</td>
                <td className="p-2 text-left text-gray-700 dark:text-[#e5e7eb]">{user.role || '-'}</td>
                <td className="p-2 text-left text-gray-700 dark:text-[#e5e7eb]">{user.status || '-'}</td>
                <td className="p-2 text-center flex gap-2 justify-center">
                  <button
                    className="p-1 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 transition shadow-sm flex items-center justify-center"
                    title="View Activity"
                    onClick={() => onViewActivity && onViewActivity(user.id)}
                  >
                    <FaHistory className="w-4 h-4" />
                  </button>
                  {(userRole === 'SUPER_ADMIN' || hasPermission(userPermissions, { module: 'userManagement', action: 'update' })) && (
                    <button
                      className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition shadow-sm flex items-center justify-center"
                      title="Edit User"
                      onClick={() => onEditUser && onEditUser(user.id)}
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                  )}
                  {user.role !== 'SUPER_ADMIN' && (userRole === 'SUPER_ADMIN' || hasPermission(userPermissions, { module: 'userManagement', action: 'delete' })) && (
                    <button
                      className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition shadow-sm flex items-center justify-center"
                      title="Delete User"
                      onClick={() => handleDelete(user.id)}
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 mt-3">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className={`px-2 py-1 rounded border text-sm font-semibold shadow transition-all duration-200 ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-800'}`}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx + 1)}
              className={`px-2 py-1 rounded border text-sm font-semibold shadow transition-all duration-200 ${page === idx + 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-800'}`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className={`px-2 py-1 rounded border text-sm font-semibold shadow transition-all duration-200 ${page === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-800'}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ExistingUser; 