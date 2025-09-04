// src/components/dashboard/DashboardHeader.tsx
'use client';

import { useAuthStore } from '@/store/authStore';
import { BellIcon } from '@heroicons/react/24/outline';

export default function DashboardHeader() {
  const { user } = useAuthStore();

  return (
    <div className="bg-slate-800 shadow-sm border-b border-slate-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white ml-4 lg:ml-0">
              Welcome back, {user?.username}!
            </h1>
          </div>

          <div className="flex items-center gap-x-4">
            {/* Membership status */}
            <div className="hidden sm:block">
              {user?.hasActiveMembership ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Active Member
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                  Inactive
                </span>
              )}
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-full bg-slate-700 p-1 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              <BellIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
