// src/app/admin/page.tsx
'use client';

import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  CurrencyDollarIcon,
  VideoCameraIcon,
  TrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AdminStatsGrid from '@/components/admin/AdminStatsGrid';
import RecentTransactions from '@/components/admin/RecentTransactions';
import UserActivity from '@/components/admin/UserActivity';
import SystemHealth from '@/components/admin/SystemHealth';
import RevenueChart from '@/components/admin/RevenueChart';

// Mock API function - replace with actual API call
const fetchAdminStats = async () => {
  // This would be an actual API call to /api/admin/stats
  return {
    totalUsers: 1247,
    activeMembers: 892,
    totalRooms: 156,
    totalTransactions: 3421,
    totalRevenue: '42,150.75',
    totalCommissionsPaid: '31,612.50',
    platformBalance: '18,425.25',
    monthlyGrowth: 15.2,
    
    // Recent metrics
    last24Hours: {
      newUsers: 23,
      newTransactions: 145,
      revenue: '1,250.00',
      activeRooms: 12
    },
    
    // System health
    systemHealth: {
      apiResponse: 'good',
      databaseStatus: 'excellent',
      blockchainSync: 'good',
      socketConnections: 'excellent'
    }
  };
};

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery(
    'admin-stats',
    fetchAdminStats,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Dashboard</h3>
          <p className="text-slate-400">Unable to fetch admin statistics</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 mt-2">
              Platform overview and key metrics
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-slate-400">Last updated</div>
            <div className="text-sm text-white">{new Date().toLocaleString()}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <AdminStatsGrid stats={stats} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RevenueChart />
          <UserActivity />
        </div>

        {/* Recent Activity Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <RecentTransactions />
          </div>
          <div>
            <SystemHealth healthData={stats.systemHealth} />
          </div>
        </div>

        {/* Alerts & Notifications */}
        <AlertsSection />
      </motion.div>
    </div>
  );
}

// Alerts Section Component
function AlertsSection() {
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'High Transaction Volume',
      message: 'Transaction volume is 150% above normal. Monitor for potential issues.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString(),
      action: 'Monitor System'
    },
    {
      id: 2,
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for tonight at 2:00 AM UTC.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toLocaleTimeString(),
      action: 'View Details'
    },
    {
      id: 3,
      type: 'success',
      title: 'Backup Completed',
      message: 'Daily system backup completed successfully.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toLocaleTimeString(),
      action: null
    }
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">System Alerts</h2>
        <button className="text-sm text-slate-400 hover:text-white">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {alerts.map(alert => (
          <div 
            key={alert.id}
            className={`p-4 rounded-lg border ${
              alert.type === 'warning' 
                ? 'border-yellow-500/30 bg-yellow-500/10' 
                : alert.type === 'success'
                ? 'border-green-500/30 bg-green-500/10'
                : 'border-blue-500/30 bg-blue-500/10'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.type === 'warning' ? 'bg-yellow-500' :
                  alert.type === 'success' ? 'bg-green-500' :
                  'bg-blue-500'
                }`} />
                
                <div>
                  <h4 className="font-medium text-white">{alert.title}</h4>
                  <p className="text-sm text-slate-300 mt-1">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-2">{alert.timestamp}</p>
                </div>
              </div>

              {alert.action && (
                <button className="text-sm text-blue-400 hover:text-blue-300 whitespace-nowrap">
                  {alert.action}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
