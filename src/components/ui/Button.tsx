"use client";

import React from 'react';
import { theme } from '@/styles/theme';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:translate-y-[-2px] active:translate-y-[1px] active:from-primary-700 active:to-primary-600 shadow-sm hover:shadow-lg hover:shadow-primary-500/20 border border-primary-500/10',
        secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-500 text-white hover:translate-y-[-2px] active:translate-y-[1px] active:from-secondary-700 active:to-secondary-600 shadow-sm hover:shadow-lg hover:shadow-secondary-500/20 border border-secondary-500/10',
        outline: 'border border-neutral-300 bg-transparent hover:bg-neutral-100/50 hover:border-primary-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800/50 hover:translate-y-[-2px] active:translate-y-[1px]',
        ghost: 'bg-transparent hover:bg-neutral-100/70 text-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800/70 hover:translate-y-[-2px] active:translate-y-[1px]',
        link: 'bg-transparent text-primary-600 underline-offset-4 hover:underline dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 hover:translate-y-[-1px]',
        success: 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:translate-y-[-2px] active:translate-y-[1px] active:from-green-700 active:to-green-600 shadow-sm hover:shadow-lg hover:shadow-green-500/20 border border-green-500/10',
        danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:translate-y-[-2px] active:translate-y-[1px] active:from-red-700 active:to-red-600 shadow-sm hover:shadow-lg hover:shadow-red-500/20 border border-red-500/10',
        glass: 'backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/10 text-black dark:text-white hover:bg-white/30 dark:hover:bg-black/30 hover:translate-y-[-2px] active:translate-y-[1px] shadow-sm hover:shadow-lg',
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
        className={`${buttonVariants({ variant, size, rounded, animation, className })} ${fullWidth ? 'w-full' : ''} group`}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Ripple effect overlay */}
        <span className="absolute inset-0 w-full h-full bg-white/0 group-hover:bg-white/10 group-active:bg-white/20 dark:group-hover:bg-black/10 dark:group-active:bg-black/20 transition-colors duration-200"></span>
        {/* Content wrapper for better alignment */}
        <span className="relative z-10 flex items-center justify-center">
          {isLoading ? (
            <>
              <svg 
                className="mr-2 h-4 w-4 animate-spin text-current" 
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
              <span>{children || 'Processing...'}</span>
            </>
          ) : (
            <>
              {icon && iconPosition === 'left' && <span className="mr-2 transition-transform group-hover:scale-110 duration-200">{icon}</span>}
              <span className="transition duration-200">{children}</span>
              {icon && iconPosition === 'right' && <span className="ml-2 transition-transform group-hover:scale-110 duration-200">{icon}</span>}
            </>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
