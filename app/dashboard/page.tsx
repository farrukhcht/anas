'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiUsers, FiShield, FiSettings } from 'react-icons/fi';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchUsers() {
      setUserLoading(true);
      try {
        const res = await fetch('/api/users');
        const users = await res.json();
        setUserCount(Array.isArray(users) ? users.length : 0);
      } catch {
        setUserCount(0);
      } finally {
        setUserLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: userLoading ? <span className="inline-block animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></span> : userCount,
      icon: FiUsers,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Permissions',
      value: '0',
      icon: FiShield,
      color: 'bg-green-500',
    },
    {
      title: 'System Status',
      value: 'Active',
      icon: FiSettings,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="w-full mx-auto mt-4 sm:mt-8 px-2 sm:px-6 lg:px-12">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-4 ">
          Here's what's happening with your system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full p-4 sm:p-6 mb-4 sm:mb-8 shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div
                className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {stat.title}
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pl-4 sm:pl-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 bg-white dark:bg-gray-800 w-full"
          onClick={() => router.push('/users')}
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Manage Users
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Add, edit, or remove users
          </p>
        </button>
        <button className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 bg-white dark:bg-gray-800 w-full">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Configure Permissions
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Set up user permissions
          </p>
        </button>
        <button className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 bg-white dark:bg-gray-800 w-full">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            System Settings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Configure system preferences
          </p>
        </button>
      </div>
    </div>
  );
} 