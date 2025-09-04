// src/app/dashboard/page.tsx
'use client';

import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  VideoCameraIcon,
  TrendingUpIcon,
} from '@heroicons/react/24/outline';

import { useAuthStore } from '@/store/authStore';
import { mlmApi, roomsApi } from '@/lib/api';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: mlmStats, isLoading: loadingMLM } = useQuery(
    'mlm-stats',
    mlmApi.getStats,
    { enabled: !!user?.hasActiveMembership }
  );

  const { data: userRooms, isLoading: loadingRooms } = useQuery(
    'user-rooms',
    roomsApi.getUserRooms,
    { enabled: !!user?.hasActiveMembership }
  );

  if (!user?.hasActiveMembership) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Card className="max-w-2xl mx-auto">
            <div className="text-center">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-semibold text-white">Membership Required</h3>
              <p className="mt-2 text-slate-400">
                You need an active membership to access the dashboard features.
              </p>
              <div className="mt-6">
                <Link href="/dashboard/payments">
                  <Button variant="primary">
                    Purchase Membership - 10 USDC
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Earnings"
            value={mlmStats?.totalCommissions || '0'}
            subtitle="USDC"
            icon={CurrencyDollarIcon}
            loading={loadingMLM}
            color="text-green-500"
          />
          <StatCard
            title="This Month"
            value={mlmStats?.thisMonthCommissions || '0'}
            subtitle="USDC"
            icon={TrendingUpIcon}
            loading={loadingMLM}
            color="text-blue-500"
          />
          <StatCard
            title="Total Referrals"
            value={mlmStats?.totalReferrals?.toString() || '0'}
            subtitle="People"
            icon={UserGroupIcon}
            loading={loadingMLM}
            color="text-purple-500"
          />
          <StatCard
            title="Active Rooms"
            value={userRooms?.length?.toString() || '0'}
            subtitle="Rooms"
            icon={VideoCameraIcon}
            loading={loadingRooms}
            color="text-pink-500"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/rooms">
              <Button variant="primary" className="w-full justify-center">
                <VideoCameraIcon className="w-5 h-5 mr-2" />
                Join Video Room
              </Button>
            </Link>
            <Link href="/dashboard/mlm">
              <Button variant="secondary" className="w-full justify-center">
                <UserGroupIcon className="w-5 h-5 mr-2" />
                View Network
              </Button>
            </Link>
            <Link href="/dashboard/payments">
              <Button variant="accent" className="w-full justify-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                Payment History
              </Button>
            </Link>
          </div>
        </Card>

        {/* MLM Network Overview */}
        {mlmStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <h2 className="text-xl font-semibold text-white mb-6">Network Overview</h2>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((level) => {
                  const levelData = mlmStats.levels[`level${level}`];
                  return (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">{level}</span>
                        </div>
                        <span className="ml-3 text-slate-300">Level {level}</span>
                      </div>
                      <span className="text-white font-semibold">
                        {levelData?.count || 0} members
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
              <div className="text-center text-slate-400 py-8">
                <VideoCameraIcon className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                <p>No recent activity</p>
                <p className="text-sm">Start by joining a video room!</p>
              </div>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  loading?: boolean;
  color?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, loading, color }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          {loading ? (
            <div className="mt-2">
              <LoadingSpinner size="small" />
            </div>
          ) : (
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-white">{value}</p>
              <p className="ml-2 text-sm text-slate-500">{subtitle}</p>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <Icon className={`h-8 w-8 ${color || 'text-slate-400'}`} />
        </div>
      </div>
    </Card>
  );
}