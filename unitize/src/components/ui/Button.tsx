"use client";

import React from 'react';
import { theme } from '@/styles/theme';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-500 hover:scale-[1.02] active:scale-[0.98] active:bg-primary-700 shadow-sm hover:shadow-md hover:shadow-primary-500/20',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-500 hover:scale-[1.02] active:scale-[0.98] active:bg-secondary-700 shadow-sm hover:shadow-md hover:shadow-secondary-500/20',
        outline: 'border border-neutral-300 bg-transparent hover:bg-neutral-100 hover:border-primary-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98]',
        ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98]',
        link: 'bg-transparent text-primary-600 underline-offset-4 hover:underline dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300',
        success: 'bg-green-600 text-white hover:bg-green-500 hover:scale-[1.02] active:scale-[0.98] active:bg-green-700 shadow-sm hover:shadow-md hover:shadow-green-500/20',
        danger: 'bg-red-600 text-white hover:bg-red-500 hover:scale-[1.02] active:scale-[0.98] active:bg-red-700 shadow-sm hover:shadow-md hover:shadow-red-500/20',
        glass: 'backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/10 text-black dark:text-white hover:bg-white/30 dark:hover:bg-black/30 hover:scale-[1.02] active:scale-[0.98]',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs',
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'p-2 aspect-square',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded',
        default: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      rounded: 'default',
    },
  }
);

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  animation?: 'none' | 'pulse' | 'bounce';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    rounded,
    icon,
    iconPosition = 'left',
    isLoading = false,
    fullWidth = false,
    animation = 'none',
    children, 
    ...props 
  }, ref) => {
    return (
      <button
        className={`${buttonVariants({ variant, size, rounded, animation, className })} ${fullWidth ? 'w-full' : ''}`}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <svg 
              className="mr-2 h-4 w-4 animate-spin text-white dark:text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
