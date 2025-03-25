
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  clickable?: boolean;
}

const GlassCard = ({
  children,
  className,
  hoverEffect = false,
  clickable = false,
  ...props
}: GlassCardProps) => {
  return (
    <div
      className={cn(
        'glass-card p-6 transition-all duration-300 ease-out',
        hoverEffect && 'hover:shadow-xl hover:scale-[1.02] hover:bg-white/90 dark:hover:bg-gray-900/90',
        clickable && 'cursor-pointer active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
