// src/app/admin/users/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FilterIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Mock API function
const fetchUsers = async (page = 1, search = '', filter = 'all') => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock user data
  const allUsers = [
    {
      id: '1',
      username: 'john_doe',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      walletAddress: '0x1234...5678',
      membershipStatus: 'active',
      membershipExpiresAt: '2024-12-15',
      totalEarnings: '125.50',
      referralCount: 8,
      joinedAt: '2024-01-15',
      lastActive: '2024-11-20',
      isActive: true
    },
    {
      id: '2',
      username: 'alice_smith',
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Smith',
      walletAddress: '0x2345...6789',
      membershipStatus: 'expired',
      membershipExpiresAt: '2024-11-10',
      totalEarnings: '89.25',
      referralCount: 5,
      joinedAt: '2024-02-20',
      lastActive: '2024-11-18',
      isActive: true
    },
    {
      id: '3',
      username: 'bob_wilson',
      email: 'bob@example.com',
      firstName: 'Bob',
      lastName: 'Wilson',
      walletAddress: '0x3456...7890',
      membershipStatus: 'active',
      membershipExpiresAt: '2024-12-25',
      totalEarnings: '245.80',
      referralCount: 15,
      joinedAt: '2024-01-08',
      lastActive: '2024-11-21',
      isActive: true
    },
    {
      id: '4',
      username: 'carol_jones',
      email: 'carol@example.com',
      firstName: 'Carol',
      lastName: 'Jones',
      walletAddress: '0x4567...8901',
      membershipStatus: 'inactive',
      membershipExpiresAt: null,
      totalEarnings: '0.00',
      referralCount: 0,
      joinedAt: '2024-11-01',
      lastActive: '2024-11-19',
      isActive: false
    }
  ];

  // Filter users based on criteria
  let filteredUsers = allUsers;
  
  if (search) {
    filteredUsers = filteredUsers.filter(user => 
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (filter !== 'all') {
    filteredUsers = filteredUsers.filter(user => {
      switch (filter) {
        case 'active':
          return user.membershipStatus === 'active';
        case 'expired':
          return user.membershipStatus === 'expired';
        case 'inactive':
          return user.membershipStatus === 'inactive';
        default:
          return true;
      }
    });
  }

  return {
    users: filteredUsers.slice((page - 1) * 10, page * 10),
    total: filteredUsers.length,
    totalPages: Math.ceil(filteredUsers.length / 10)
  };
};

export default function AdminUsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const { data: usersData, isLoading, error } = useQuery(
    ['admin-users', currentPage, searchTerm, filterStatus],
    () => fetchUsers(currentPage, searchTerm, filterStatus),
    {
      keepPreviousData: true,
    }
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilter = (filter: typeof filterStatus) => {
    setFilterStatus(filter);
    setCurrentPage(1);
  };

  const getMembershipStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
            Expired
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Inactive
          </span>
        );
      default:
        return null;
    }
  };

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
            <h1 className="text-3xl font-bold text-white flex items-center">
              <UsersIcon className="w-8 h-8 mr-3" />
              User Management
            </h1>
            <p className="text-slate-400 mt-2">
              Manage platform users and memberships
            </p>
          </div>
          
          <Button variant="primary">
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => handleFilter(e.target.value as typeof filterStatus)}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Users</option>
                <option value="active">Active Members</option>
                <option value="expired">Expired Members</option>
                <option value="inactive">Inactive Users</option>
              </select>

              <Button variant="ghost" size="small">
                <FilterIcon className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Users</h3>
              <p className="text-slate-400">Unable to fetch user data</p>
            </div>
          ) : !usersData?.users.length ? (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Users Found</h3>
              <p className="text-slate-400">No users match your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-700">
                  <tr className="text-left">
                    <th className="pb-3 text-sm font-medium text-slate-400">User</th>
                    <th className="pb-3 text-sm font-medium text-slate-400">Status</th>
                    <th className="pb-3 text-sm font-medium text-slate-400">Membership</th>
                    <th className="pb-3 text-sm font-medium text-slate-400">Earnings</th>
                    <th className="pb-3 text-sm font-medium text-slate-400">Network</th>
                    <th className="pb-3 text-sm font-medium text-slate-400">Joined</th>
                    <th className="pb-3 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {usersData.users.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-700/30"
                    >
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.username}</div>
                            <div className="text-sm text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-slate-400'}`} />
                          <span className={`text-sm ${user.isActive ? 'text-green-400' : 'text-slate-400'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4">
                        <div className="space-y-1">
                          {getMembershipStatusBadge(user.membershipStatus)}
                          {user.membershipExpiresAt && (
                            <div className="text-xs text-slate-500">
                              Expires: {new Date(user.membershipExpiresAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4">
                        <div className="font-semibold text-white">${user.totalEarnings}</div>
                        <div className="text-sm text-slate-400">USDC</div>
                      </td>

                      <td className="py-4">
                        <div className="font-semibold text-white">{user.referralCount}</div>
                        <div className="text-sm text-slate-400">referrals</div>
                      </td>

                      <td className="py-4">
                        <div className="text-sm text-white">
                          {new Date(user.joinedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          Last: {new Date(user.lastActive).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedUser(user.id)}
                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                            title="View details"
                          >
                            <EyeIcon className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <PencilIcon className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <TrashIcon className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {usersData && usersData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
              <div className="text-sm text-slate-400">
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, usersData.total)} of {usersData.total} users
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: usersData.totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === usersData.totalPages || 
                    Math.abs(page - currentPage) <= 1
                  )
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-slate-400">...</span>
                      )}
                      <Button
                        variant={page === currentPage ? "primary" : "ghost"}
                        size="small"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
                
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setCurrentPage(prev => Math.min(usersData.totalPages, prev + 1))}
                  disabled={currentPage === usersData.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
