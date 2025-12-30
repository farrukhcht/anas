'use client';
import React, { useState } from 'react';
import SideBar from '../components/SideBar';
import TopBar from '../components/TopBar';

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <SideBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="lg:ml-64 pt-14">
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
} 