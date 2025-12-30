'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/app/components/theme-provider/ThemeProvider";
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <Toaster position="top-center" />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
} 