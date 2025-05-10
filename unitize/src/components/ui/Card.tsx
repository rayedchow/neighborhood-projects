"use client";

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { theme } from '@/styles/theme';

const cardVariants = cva(
  'rounded-lg shadow-sm transition-all overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
        outlined: 'bg-transparent border border-neutral-200 dark:border-neutral-700',
        filled: 'bg-neutral-100 dark:bg-neutral-900 border-none',
        elevated: 'bg-white dark:bg-neutral-800 shadow-md hover:shadow-lg border-none',
        interactive: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md cursor-pointer',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6',
      },
      radius: {
        default: 'rounded-lg',
        sm: 'rounded-md',
        lg: 'rounded-xl',
        full: 'rounded-3xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      radius: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  clickable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  image?: {
    src: string;
    alt?: string;
    position?: 'top' | 'bottom';
  };
  highlight?: 'none' | 'top' | 'left' | 'right' | 'bottom';
  aspectRatio?: '1/1' | '16/9' | '4/3' | '2/1';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant,
    padding,
    radius,
    clickable = false,
    header,
    footer,
    image,
    highlight = 'none',
    aspectRatio,
    children,
    ...props
  }, ref) => {
    // Determine if the variant should be switched to interactive
    const interactiveVariant = clickable && variant === 'default' ? 'interactive' : variant;
    
    // Build the highlight bar styles
    const highlightBarStyles = {
      'none': '',
      'top': 'border-t-4 border-t-primary-500',
      'left': 'border-l-4 border-l-primary-500',
      'right': 'border-r-4 border-r-primary-500',
      'bottom': 'border-b-4 border-b-primary-500'
    };
    
    // Apply aspect ratio if provided
    const aspectRatioStyles = aspectRatio ? `aspect-[${aspectRatio}]` : '';
    
    return (
      <div
        className={cardVariants({
          variant: interactiveVariant,
          padding: image ? 'none' : padding,
          radius,
          className: `${highlightBarStyles[highlight]} ${aspectRatioStyles} ${className}`
        })}
        ref={ref}
        {...props}
      >
        {/* Card Header */}
        {header && (
          <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-700 font-medium">
            {header}
          </div>
        )}
        
        {/* Card Image - Top Position */}
        {image && image.position !== 'bottom' && (
          <div className="w-full overflow-hidden">
            <img 
              src={image.src} 
              alt={image.alt || 'Card image'} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        {/* Card Content */}
        <div className={padding ? `p-${padding}` : 'p-5'}>
          {children}
        </div>
        
        {/* Card Image - Bottom Position */}
        {image && image.position === 'bottom' && (
          <div className="w-full overflow-hidden">
            <img 
              src={image.src} 
              alt={image.alt || 'Card image'} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        {/* Card Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-700">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};
