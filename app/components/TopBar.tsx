'use client';

import { useSession, signOut } from "next-auth/react";
import ThemeToggleButton from "@/app/components/theme-provider/ThemeToggleButton";
import { useRouter } from "next/navigation";
import { Moon, Sun, Home, LogOut, Menu, X } from "lucide-react";
import toast from 'react-hot-toast';
import { useState } from 'react';

interface TopBarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export default function TopBar({ isSidebarOpen, setIsSidebarOpen }: TopBarProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // Determine display name
  const displayName = session?.user?.role === 'SUPER_ADMIN'
    ? 'Super Admin'
    : session?.user?.name || 'User';

  // Add sign out confirmation handler
  const handleSignOut = async () => {
    // Dismiss any existing sign out confirmation toast before showing a new one
    toast.dismiss('signout-confirm');
    toast.custom((t) => (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl px-8 py-6 flex flex-col items-center border border-gray-200 dark:border-gray-700 min-w-[320px]">
        <div className="text-xl font-bold mb-2 text-red-600 flex items-center gap-2"><LogOut /> Confirm Sign Out</div>
        <div className="mb-4 text-gray-700 dark:text-gray-200">Are you sure you want to sign out?</div>
        <div className="flex gap-4 mt-2">
          <button
            className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            onClick={() => toast.dismiss('signout-confirm')}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition"
            onClick={async () => {
              toast.dismiss('signout-confirm');
              try {
                await fetch('/api/activity/logout', { method: 'POST' });
              } catch (e) { /* ignore */ }
              signOut({ callbackUrl: '/auth/signin', redirect: true });
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    ), { position: 'top-center', id: 'signout-confirm' });
  };

  return (
    <div className="fixed top-4 left-0 lg:left-64 right-0 mx-8 lg:mx-10 h-14 bg-white dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/60 custom-shadow z-50 flex items-center px-6 rounded-xl">
      {/* Sidebar Toggle Button for Mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden mr-3 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center"
        aria-label="Toggle Sidebar"
        type="button"
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>
      {/* Home, Theme Toggle, and Sign Out Buttons */}
      <div className="flex gap-0 items-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-10 h-10 p-2 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all duration-200"
          aria-label="Go to home"
        >
          <Home className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </button>
        <ThemeToggleButton />
        <button
          onClick={handleSignOut}
          className="w-10 h-10 p-2 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-200"
          aria-label="Sign out"
        >
          <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
        </button>
      </div>
      {/* Username on the Right */}
      <div className="flex-1 flex justify-end">
        <span className="topbar-username">
          {displayName}
        </span>
      </div>
    </div>
  );
} 