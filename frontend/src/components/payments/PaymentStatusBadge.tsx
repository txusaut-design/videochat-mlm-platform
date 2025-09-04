// src/components/payments/PaymentStatusBadge.tsx
'use client';

import { FC } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface PaymentStatusBadgeProps {
  status: 'pending' | 'confirmed' | 'failed';
  className?: string;
}

const PaymentStatusBadge: FC<PaymentStatusBadgeProps> = ({ 
  status, 
  className = '' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'confirmed':
        return {
          icon: CheckCircleIcon,
          text: 'Confirmed',
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-300',
          borderColor: 'border-green-500/30'
        };
      case 'pending':
        return {
          icon: ClockIcon,
          text: 'Pending',
          bgColor: 'bg-yellow-500/20',
          textColor: 'text-yellow-300',
          borderColor: 'border-yellow-500/30'
        };
      case 'failed':
        return {
          icon: XCircleIcon,
          text: 'Failed',
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-300',
          borderColor: 'border-red-500/30'
        };
      default:
        return {
          icon: ExclamationTriangleIcon,
          text: 'Unknown',
          bgColor: 'bg-slate-500/20',
          textColor: 'text-slate-300',
          borderColor: 'border-slate-500/30'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
      ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}
    `}>
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </span>
  );
};

export default PaymentStatusBadge;
