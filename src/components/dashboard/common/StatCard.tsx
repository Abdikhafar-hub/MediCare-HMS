
import React from 'react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/ui-custom/GlassCard';

export interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  trend?: 'up' | 'down';
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  change,
  trend,
  color,
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300',
    red: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300',
  };

  return (
    <GlassCard hoverEffect className="transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>{icon}</div>
        {change && (
          <div
            className={cn(
              'text-sm font-medium px-2 py-1 rounded',
              trend === 'up'
                ? 'text-green-600 bg-green-100/50 dark:text-green-400 dark:bg-green-500/10'
                : 'text-red-600 bg-red-100/50 dark:text-red-400 dark:bg-red-500/10'
            )}
          >
            {change}
          </div>
        )}
      </div>
      <h3 className="text-lg font-medium text-muted-foreground">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && (
          <p className="ml-2 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </GlassCard>
  );
};

export default StatCard;
