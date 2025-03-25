
import React from 'react';
import { cn } from '@/lib/utils';
import { Button as ShadcnButton } from '@/components/ui/button';
import { type ButtonProps as ShadcnButtonProps } from '@/components/ui/button';

interface ButtonProps extends ShadcnButtonProps {
  glassEffect?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, glassEffect = false, variant = "default", children, ...props }, ref) => {
    return (
      <ShadcnButton
        className={cn(
          'relative overflow-hidden transition-all duration-300 ease-out font-medium',
          glassEffect && variant === "default" && 'glass-effect hover:bg-primary/90',
          className
        )}
        variant={variant}
        ref={ref}
        {...props}
      >
        {children}
        {glassEffect && (
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent shine -translate-x-full animate-[shine_3s_ease-in-out_infinite]" />
        )}
      </ShadcnButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;

// Add this to index.css if you want the shine effect:
// @keyframes shine {
//   0% { transform: translateX(-100%); }
//   20%, 100% { transform: translateX(100%); }
// }
