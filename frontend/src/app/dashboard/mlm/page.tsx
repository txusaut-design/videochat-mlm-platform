// src/app/dashboard/mlm/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

import { useAuthStore } from '@/store/authStore';
import { mlmApi } from '@/lib/api';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import NetworkStats from '@/components/mlm/NetworkStats';
import NetworkTree from '@/components/mlm/NetworkTree';
import ReferralTools from '@/components/mlm/ReferralTools';
import CommissionHistory from '@/components/mlm/CommissionHistory';

type TabType = 'overview' | 'network' | 'commissions' | 'tools';

export default function MLMPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: mlmStats, isLoading: loadingStats } = useQuery(
    'mlm-stats',
    mlmApi.getStats,
    {
      enabled: !!user?.hasActiveMembership,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const { data: commissions, isLoading: loadingCommissions } = useQuery(
    'mlm-commissions',
    mlmApi.getCommissions,
    {
      enabled: !!user?.hasActiveMembership,
    }
  );

  const tabs = [
    {
      id: 'overview' as TabType,
      name: 'Overview',
      icon: ChartBarIcon,
      description: 'Network statistics and performance'
    },
    {
      id: 'network' as TabType,
      name: 'Network Tree',
      icon: UserGroupIcon,
      description: 'Interactive network visualization'
    },
    {
      id: 'commissions' as TabType,
      name: 'Commissions',
      icon: CurrencyDollarIcon,
      description: 'Earnings history and details'
    },
    {
      id: 'tools' as TabType,
      name: 'Referral Tools',
      icon: ShareIcon,
      description: 'Share your referral link'
    }
  ];

  if (!user?.hasActiveMembership) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <Card className="max-w-2xl mx-auto">
            <UserGroupIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-white">Membership Required</h3>
            <p className="mt-2 text-slate-400">
              You need an active membership to access the MLM network features.
            </p>
            <div className="mt-6">
              <a
                href="/dashboard/payments"
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Purchase Membership - 10 USDC
              </a>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (loadingStats) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
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
            <h1 className="text-3xl font-bold text-white">MLM Network</h1>
            <p className="text-slate-400 mt-2">
              Manage your referral network and track your earnings
            </p>
          </div>

          {/* Quick Stats */}
          {mlmStats && (
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {mlmStats.totalReferrals}
                </div>
                <div className="text-sm text-slate-400">Total Network</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {mlmStats.activeReferrals}
                </div>
                <div className="text-sm text-slate-400">Active Members</div>
              </div>
              <div className="text-2xl text-slate-600">|</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-400">
                  {parseFloat(mlmStats.totalCommissions).toFixed(2)}
                </div>
                <div className="text-sm text-slate-400">Total Earned (USDC)</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'overview' && mlmStats && (
            <NetworkStats mlmStats={mlmStats} />
          )}

          {activeTab === 'network' && mlmStats && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <NetworkTree
                  mlmStats={mlmStats}
                  currentUserId={user?.id || ''}
                  onUserSelect={setSelectedUserId}
                />
              </div>
              <div>
                {selectedUserId && (
                  <UserDetailPanel userId={selectedUserId} />
                )}
              </div>
            </div>
          )}

          {activeTab === 'commissions' && commissions && (
            <CommissionHistory 
              commissions={commissions} 
              totalCommissions={mlmStats?.totalCommissions || '0'}
              monthlyCommissions={mlmStats?.thisMonthCommissions || '0'}
            />
          )}

          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ReferralTools />
              <MLMEducation />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// User Detail Panel Component
interface UserDetailPanelProps {
  userId: string;
}

function UserDetailPanel({ userId }: UserDetailPanelProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">User Details</h3>
      <div className="space-y-3">
        <div>
          <span className="text-slate-400 text-sm">Selected User ID:</span>
          <div className="text-white font-mono text-sm">{userId}</div>
        </div>
        <div className="text-slate-400 text-sm">
          User details and management options will be displayed here.
        </div>
      </div>
    </Card>
  );
}

// MLM Education Component
function MLMEducation() {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-6">How It Works</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-white font-medium mb-3">Commission Structure</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Level 1 (Direct):</span>
              <span className="text-green-400 font-semibold">3.5 USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Levels 2-5:</span>
              <span className="text-green-400 font-semibold">1.0 USDC each</span>
            </div>
            <div className="border-t border-slate-600 mt-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-white font-medium">Total per payment:</span>
                <span className="text-green-400 font-bold">7.5 USDC</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-medium mb-3">Getting Started</h4>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex items-start space-x-2">
              <span className="text-primary-400 mt-1">1.</span>
              <span>Share your referral link with friends and contacts</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary-400 mt-1">2.</span>
              <span>Help them register and activate their membership</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary-400 mt-1">3.</span>
              <span>Earn commissions when they pay their monthly fee</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary-400 mt-1">4.</span>
              <span>Build multiple levels for maximum earnings</span>
            </div>
          </div>
        </div>

        <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
          <h4 className="text-primary-300 font-medium mb-2">Pro Tip</h4>
          <p className="text-primary-200 text-sm">
            Focus on helping your direct referrals succeed. When they build their network, 
            you earn from their referrals too!
          </p>
        </div>
      </div>
    </Card>
  );
}