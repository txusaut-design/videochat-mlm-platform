// src/components/mlm/NetworkTree.tsx
'use client';

import { FC, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { MlmStats } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatUSDC } from '@/utils/web3Utils';

interface NetworkNode {
  id: string;
  username: string;
  email: string;
  level: number;
  created_at: string;
  membership_expires_at?: string;
  totalEarnings?: string;
  directReferrals?: number;
  children?: NetworkNode[];
  isExpanded?: boolean;
}

interface NetworkTreeProps {
  mlmStats: MlmStats;
  currentUserId: string;
  onUserSelect?: (userId: string) => void;
}

const NetworkTree: FC<NetworkTreeProps> = ({
  mlmStats,
  currentUserId,
  onUserSelect
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([currentUserId]));
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Build tree structure from flat MLM stats
  const buildTree = useCallback((): NetworkNode[] => {
    const nodeMap = new Map<string, NetworkNode>();
    const rootNodes: NetworkNode[] = [];

    // Create nodes for each level
    Object.entries(mlmStats.levels).forEach(([levelKey, levelData]) => {
      levelData.members.forEach(member => {
        const node: NetworkNode = {
          id: member.id,
          username: member.username,
          email: member.email,
          level: member.level,
          created_at: member.created_at,
          membership_expires_at: member.membership_expires_at,
          children: [],
          isExpanded: expandedNodes.has(member.id)
        };
        nodeMap.set(member.id, node);
      });
    });

    // Build parent-child relationships (simplified for demo)
    nodeMap.forEach(node => {
      if (node.level === 1) {
        rootNodes.push(node);
      } else {
        // In a real app, you'd have parent_id to build proper relationships
        // For now, we'll just group by levels
        const parent = Array.from(nodeMap.values()).find(n => 
          n.level === node.level - 1
        );
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      }
    });

    return rootNodes;
  }, [mlmStats, expandedNodes]);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
    onUserSelect?.(nodeId);
  }, [onUserSelect]);

  const isActiveUser = (node: NetworkNode): boolean => {
    if (!node.membership_expires_at) return false;
    return new Date(node.membership_expires_at) > new Date();
  };

  const renderNode = (node: NetworkNode, depth: number = 0): JSX.Element => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id;
    const isActive = isActiveUser(node);

    return (
      <div key={node.id} className="select-none">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: depth * 0.05 }}
          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
            isSelected 
              ? 'bg-primary-600/20 border border-primary-500/30' 
              : 'hover:bg-slate-700/50'
          }`}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
          onClick={() => handleNodeSelect(node.id)}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-1 hover:bg-slate-600 rounded"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-slate-400" />
              )}
            </button>
          )}

          {/* User Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isActive 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-slate-600 text-slate-300'
          }`}>
            {node.username.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-white truncate">
                {node.username}
              </span>
              <span className="text-xs text-slate-400">
                L{node.level}
              </span>
              {isActive ? (
                <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
            </div>
            <div className="text-xs text-slate-500 truncate">
              Joined {new Date(node.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Level Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            node.level === 1 ? 'bg-primary-500/20 text-primary-300' :
            node.level === 2 ? 'bg-secondary-500/20 text-secondary-300' :
            node.level === 3 ? 'bg-accent-500/20 text-accent-300' :
            node.level === 4 ? 'bg-blue-500/20 text-blue-300' :
            'bg-purple-500/20 text-purple-300'
          }`}>
            Level {node.level}
          </div>

          {/* Children Count */}
          {hasChildren && (
            <div className="text-xs text-slate-400 flex items-center space-x-1">
              <UserGroupIcon className="w-3 h-3" />
              <span>{node.children!.length}</span>
            </div>
          )}
        </motion.div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {node.children!.map(child => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const treeNodes = buildTree();

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Network Tree</h2>
          <p className="text-sm text-slate-400">
            Interactive view of your referral network
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="small"
            onClick={() => setExpandedNodes(new Set([currentUserId]))}
          >
            Collapse All
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={() => {
              const allIds = new Set<string>();
              const collectIds = (nodes: NetworkNode[]) => {
                nodes.forEach(node => {
                  allIds.add(node.id);
                  if (node.children) collectIds(node.children);
                });
              };
              collectIds(treeNodes);
              setExpandedNodes(allIds);
            }}
          >
            Expand All
          </Button>
        </div>
      </div>

      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        {treeNodes.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Network Yet</h3>
            <p className="text-slate-400">
              Start building your network by sharing your referral link!
            </p>
          </div>
        ) : (
          treeNodes.map(node => renderNode(node))
        )}
      </div>
    </Card>
  );
};

export default NetworkTree;
