// src/components/admin/AdminHeader.tsx
'use client';

import { useState } from 'react';
import { 
  BellIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';

export default function AdminHeader() {
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications - in real app these would come from API
  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'High Transaction Volume',
      message: 'Unusual payment activity detected in the last hour',
      time: '5 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'success',
      title: 'System Backup Complete',
      message: 'Daily backup completed successfully',
      time: '1 hour ago',
      read: true
    },
    {
      id: 3,
      type: 'info',
      title: 'New User Registration',
      message: '15 new users registered in the last 24 hours',
      time: '2 hours ago',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-slate-800 shadow-sm border-b border-slate-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center flex-1">
            <div className="ml-4 lg:ml-0 flex-1 max-w-lg">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  className="block w-full rounded-md border-0 bg-slate-700 py-1.5 pl-10 pr-3 text-slate-100 placeholder:text-slate-400 focus:bg-slate-600 focus:ring-2 focus:ring-red-500 sm:text-sm sm:leading-6"
                  placeholder="Search users, transactions..."
                  type="search"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-x-4">
            {/* Quick Actions */}
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" size="small">
                Export Data
              </Button>
              <Button variant="primary" size="small">
                System Backup
              </Button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                className="relative rounded-full bg-slate-700 p-1 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border-b border-slate-700 hover:bg-slate-700/50 ${
                          !notification.read ? 'bg-slate-700/20' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'warning' ? 'bg-yellow-500' :
                            notification.type === 'success' ? 'bg-green-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <div className="font-medium text-white text-sm">
                              {notification.title}
                            </div>
                            <div className="text-slate-400 text-sm">
                              {notification.message}
                            </div>
                            <div className="text-slate-500 text-xs mt-1">
                              {notification.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 text-center">
                    <button className="text-sm text-slate-400 hover:text-white">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">{user?.username}</div>
              <div className="text-xs text-red-400">Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}