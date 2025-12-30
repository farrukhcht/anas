'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/components/theme-provider/ThemeProvider';
import {
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiSun,
  FiMoon,
  FiShield,
} from 'react-icons/fi';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { signOut } from 'next-auth/react';
import SideBar from '@/app/components/SideBar';
import TopBar from '@/app/components/TopBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <SideBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="lg:ml-64 pt-24 px-4 lg:px-6">
        <main className="max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
} 