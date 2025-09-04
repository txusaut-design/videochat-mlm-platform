// src/app/dashboard/layout.tsx
'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore();

  if (!user) {
    return null; // AuthProvider will handle redirect
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardSidebar />
      <div className="lg:pl-72">
        <DashboardHeader />
        <main className="py-6">
          {children}
        </main>
      </div>
    </div>
  );
}