'use client';

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  AlertTriangle,
  Shield,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from 'next/image';
import { FaUsers } from 'react-icons/fa';
import { Permission, hasPermission, hasAnyPermission } from '@/app/lib/permissions';

interface SideBarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function SideBar({ isOpen, setIsOpen }: SideBarProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [showSignout, setShowSignout] = useState(false);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        if (status !== 'authenticated' || !session?.user?.id) {
          console.log('No authenticated session or user ID found');
          return;
        }

        const response = await fetch('/api/users/me/permissions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.details || 'Failed to fetch permissions');
        }

        const data = await response.json();
        console.log('Fetched permissions:', data);
        setUserPermissions(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching user permissions:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch permissions');
      }
    };

    if (status === 'authenticated') {
      fetchUserPermissions();
    }
  }, [session, status]);

  // Dynamically determine allowed modules for the user, but exclude 'permissions'
  const allowedModules = Array.from(new Set(userPermissions.map(p => p.module))).filter(m => m !== 'permissions');

  const dynamicMenuItems = allowedModules.map(module => {
    let name = module.charAt(0).toUpperCase() + module.slice(1);
    let href = `/${module}`;
    let icon = Users;
    if (module === 'userManagement') {
      name = 'Users';
      href = '/users';
      icon = Users;
    }
    return {
      name,
      href,
      icon,
      module,
      roles: [] as string[],
      requiredPermission: null
    };
  });
  //Menu items
  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["SUPER_ADMIN", "USER"],
      requiredPermission: null,
      module: null
    },

  {
      name: "Add New Employees",
      href: "/employees",
      icon: LayoutDashboard,
      roles: ["SUPER_ADMIN", "USER"],
      requiredPermission: null,
      module: null
    },

     {
      name: "Departments",
      href: "/departments",
      icon: LayoutDashboard,
      roles: ["SUPER_ADMIN", "USER"],
      requiredPermission: null,
      module: null
    },
    
    ...dynamicMenuItems,
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["SUPER_ADMIN", "USER"],
      requiredPermission: null,
      module: null
    }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    // Dashboard and Settings are always shown if the user has the role
    if (!item.module) {
      return item.roles.includes(session?.user?.role || "");
    }
    // For dynamic modules, show if the user has any permission for that module
    return hasAnyPermission(userPermissions, item.module);
  });

  const handleSignOut = () => {
    setShowSignout(false);
    signOut();
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      if (sidebar && !sidebar.contains(event.target as Node) && 
          toggleButton && !toggleButton.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Toggle Button - removed for TopBar integration */}
      {/*
      <button
        id="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-2 left-4 z-[60] p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 lg:hidden"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>
      */}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-x-0 top-14 bottom-0 bg-black/50 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed left-0 top-4 h-[calc(100vh-2rem)] w-64 bg-white dark:bg-[#0A0A0A] backdrop-blur-md custom-shadow flex flex-col items-center pt-4 transition-transform duration-300 ease-in-out z-[60] mx-4 rounded-xl ${
          isOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center w-full mb-2">
          <Image src="/OIP.jpeg" alt="Logo" width={200} height={40} className="mb-2 rounded-lg shadow" />
        </div>
        <nav className="flex-1 w-full px-2 space-y-1 mt-2">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href;
            let iconClass = '';
            if (item.name === 'Dashboard') iconClass = 'icon-home';
            else if (item.name === 'Users') iconClass = 'icon-users';
            else if (item.name === 'Settings') iconClass = 'icon-settings';
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`sidebar-link flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 gap-2 no-underline !no-underline ${isActive ? 'selected' : ''}`}
              >
                <item.icon className={`h-5 w-5 ${iconClass}`} />
                <span className="!no-underline">{item.name}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 ml-auto icon-home" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignout && (
        <div className="fixed bottom-8 left-1/2 z-[70] -translate-x-1/2">
          <div className="relative bg-white dark:bg-[#0A0A0A] rounded-xl shadow-lg px-6 py-4 flex flex-col items-center border border-gray-200 dark:border-gray-800 min-w-[300px]">
            <button
              onClick={() => setShowSignout(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-orange-400 dark:hover:text-orange-300"
              aria-label="Close"
              tabIndex={0}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="bg-red-100 dark:bg-transparent rounded-full p-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-base font-bold mb-1 text-gray-900 dark:text-white">Sign out</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-3 text-center text-sm">
              Are you sure you want to sign out?
            </p>
            <div className="flex w-full gap-2">
              <button
                onClick={() => setShowSignout(false)}
                className="w-1/2 py-2 rounded-lg bg-gray-100 dark:bg-transparent text-gray-700 dark:text-orange-400 font-semibold shadow hover:bg-gray-200 dark:hover:bg-transparent transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="w-1/2 py-2 rounded-lg bg-red-600 dark:bg-transparent hover:bg-red-700 dark:hover:bg-transparent text-white dark:text-red-400 font-semibold shadow transition-all duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 