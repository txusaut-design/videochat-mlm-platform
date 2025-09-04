// src/components/ui/Card.tsx
import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'medium'
}) => {
  const paddingClasses = {
    none: 'p-0',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  return (
    <motion.div
      whileHover={hover ? { scale: 1.02 } : {}}
      className={clsx(
        'bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default Card;