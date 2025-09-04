// src/components/dashboard/DashboardSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import {
  HomeIcon,
  VideoCameraIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

import { useAuthStore } from '@/store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Video Rooms', href: '/dashboard/rooms', icon: VideoCameraIcon },
  { name: 'MLM Network', href: '/dashboard/mlm', icon: UserGroupIcon },
  { name: 'Payments', href: '/dashboard/payments', icon: CurrencyDollarIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
];

export default function DashboardSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <>
      {/* Mobile sidebar */}
      <div className={clsx(
        'relative z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>

            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-slate-300 bg-slate-800 rounded-lg"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
    </>
  );

  function SidebarContent() {
    return (
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-800 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <VideoCameraIcon className="h-8 w-8 text-primary-500" />
          <span className="ml-2 text-xl font-bold gradient-text">VideoChat MLM</span>
        </div>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={clsx(
                          isActive
                            ? 'bg-primary-700 text-white'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors'
                        )}
                      >
                        <item.icon
                          className={clsx(
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-white',
                            'h-6 w-6 shrink-0'
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            {/* User info */}
            <li className="mt-auto">
              <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold text-white">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="sr-only">Your profile</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{user?.username}</div>
                  <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full text-left px-2 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-md"
              >
                Sign out
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}