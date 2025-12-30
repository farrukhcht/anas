"use client";
import React, { useState, useEffect } from 'react';
import { FaPlus, FaHome } from 'react-icons/fa';
import NewUser from './newUser';
import ExistingUser from './existingUser';
import UpdateUser from './updateUser';
import ActivityUser from './activityUser';
import { Permission, hasPermission } from '@/app/lib/permissions';

const UserMain = () => {
  const [showNewUser, setShowNewUser] = useState(false);
  const [updateUserId, setUpdateUserId] = useState<string | null>(null);
  const [activityUserId, setActivityUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [userRole, setUserRole] = useState('USER');

  const handleViewActivity = (userId: string) => {
    console.log('Setting activity user ID:', userId);
    setActivityUserId(userId);
  };

  useEffect(() => {
    fetch('/api/users/me/permissions')
      .then(res => res.json())
      .then(setUserPermissions);
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setUserRole(data?.user?.role || 'USER'));
  }, []);

  return (
    <div className="w-full mx-auto mt-4 sm:mt-8 px-2 sm:px-6 lg:px-12">
      <div className="bg-white rounded-xl border border-gray-200 w-full p-4 sm:p-6 mb-4 sm:mb-8 relative text-gray-900">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 px-4 sm:px-8 py-4 border-b border-gray-100 dark:border-gray-800">
          <h1 className="mb-0 text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Users Management</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-56 text-sm shadow-sm"
                disabled={showNewUser || updateUserId !== null}
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-2-2"/></svg>
              </span>
            </div>
            {/* Add User Icon */}
            {(userRole === 'SUPER_ADMIN' || hasPermission(userPermissions, { module: 'userManagement', action: 'create' })) && (
            <button
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition text-lg flex items-center justify-center"
              title="Add New User"
              onClick={() => { setShowNewUser(true); setUpdateUserId(null); }}
              disabled={showNewUser || updateUserId !== null}
            >
              <FaPlus />
            </button>
            )}
            {/* Home Icon */}
            <button
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-white shadow-md transition text-lg flex items-center justify-center"
              title="Go to Dashboard"
              onClick={() => window.location.href = '/dashboard'}
            >
              <FaHome />
            </button>
          </div>
        </div>

        {/* New User Window with smooth close */}
        <div className={`transition-all duration-300 ease-in-out ${showNewUser ? 'opacity-100 max-h-[600px] py-4 sm:py-6 px-4 sm:px-8 border-b border-gray-100 dark:border-gray-800' : 'opacity-0 max-h-0 py-0 px-4 sm:px-8 border-b-0 overflow-hidden'}`}
          style={{ transitionProperty: 'opacity, max-height, padding' }}>
          {showNewUser && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">New User</h2>
                <button
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl font-bold"
                  onClick={() => setShowNewUser(false)}
                  title="Close"
                >
                  &times;
                </button>
              </div>
              <NewUser onSuccess={() => setShowNewUser(false)} compact />
            </div>
          )}
        </div>

        {/* Update User Window with smooth close */}
        <div className={`transition-all duration-300 ease-in-out ${updateUserId ? 'opacity-100 max-h-[600px] py-4 sm:py-6 px-4 sm:px-8 border-b border-gray-100 dark:border-gray-800' : 'opacity-0 max-h-0 py-0 px-4 sm:px-8 border-b-0 overflow-hidden'}`}
          style={{ transitionProperty: 'opacity, max-height, padding' }}>
          {updateUserId && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">Update User</h2>
                <button
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl font-bold"
                  onClick={() => setUpdateUserId(null)}
                  title="Close"
                >
                  &times;
                </button>
              </div>
              <UpdateUser 
                userId={updateUserId} 
                onSuccess={() => setUpdateUserId(null)} 
                onCancel={() => setUpdateUserId(null)}
              />
            </div>
          )}
        </div>

        {/* User List Table */}
        {!showNewUser && !updateUserId && !activityUserId && (
          <div className="px-2 sm:px-4 lg:px-8 py-4 w-full overflow-x-auto">
            <ExistingUser 
              onEditUser={setUpdateUserId} 
              onViewActivity={handleViewActivity} 
              search={search} 
              compact 
            />
          </div>
        )}

        {/* Activity User Window */}
        {activityUserId && !showNewUser && !updateUserId && (
          <div className="px-2 sm:px-4 lg:px-8 py-4 w-full">
            <ActivityUser
              userId={activityUserId}
              onClose={() => setActivityUserId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMain; 