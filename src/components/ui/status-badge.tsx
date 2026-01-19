import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'warning' | 'danger' | 'info' | 'neutral' | 'success';
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  dot = true,
  className,
}) => {
  const statusClasses = {
    active: 'status-active',
    success: 'status-active',
    warning: 'status-warning',
    danger: 'status-danger',
    info: 'status-info',
    neutral: 'status-neutral',
  };

  const dotColors = {
    active: 'bg-success',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-destructive',
    info: 'bg-info',
    neutral: 'bg-muted-foreground',
  };

  return (
    <span className={cn('status-badge', statusClasses[status], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[status])} />}
      {children}
    </span>
  );
};

export { StatusBadge };
