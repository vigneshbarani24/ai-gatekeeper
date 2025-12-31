/**
 * Reusable Card Component
 * Industry-grade card with variants and proper styling
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'glass' | 'premium' | 'solid';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    (
        {
            children,
            variant = 'glass',
            padding = 'md',
            hover = false,
            className = '',
            ...props
        },
        ref
    ) => {
        const variantStyles = {
            glass: 'glass-card',
            premium: 'premium-card',
            solid: 'bg-surface border border-white/5',
        };

        const paddingStyles = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        };

        const hoverStyles = hover ? 'hover:scale-[1.02] cursor-pointer' : '';

        return (
            <div
                ref={ref}
                className={`${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export default Card;
