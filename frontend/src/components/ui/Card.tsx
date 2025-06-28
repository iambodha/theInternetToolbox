import React from 'react';
import { styles, cn } from '@/lib/styles';

interface ToolCardProps {
  icon: string;
  title: string;
  description: string;
  category?: string;
  onClick?: () => void;
  className?: string;
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  variant?: 'blue' | 'green' | 'purple' | 'orange';
}

interface ToolGridProps {
  children: React.ReactNode;
  className?: string;
}

interface FeatureGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ToolCard({ icon, title, description, category, onClick, className }: ToolCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(styles.card.base, 'hover-lift hover-glow cursor-pointer group transition-all duration-300', className)}
    >
      <div className={styles.card.content}>
        <div className={styles.card.header}>
          <span className={cn(styles.card.icon, 'hover-scale transition-transform duration-200 group-hover:scale-110')}>{icon}</span>
          <h3 className={cn(styles.card.title, 'group-hover:text-foreground transition-colors duration-200')}>{title}</h3>
        </div>
        <p className={cn(styles.card.description, 'group-hover:text-foreground/80 transition-colors duration-200')}>{description}</p>
        {category && (
          <div className={styles.card.footer}>
            <span className={cn(styles.card.category, 'group-hover:bg-foreground/15 transition-colors duration-200')}>{category}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function FeatureCard({ icon, title, description, variant = 'blue' }: FeatureCardProps) {
  const colorVariant = styles.colorVariants[variant];
  
  return (
    <div className={cn(styles.feature.container, colorVariant.container, 'hover-lift group transition-all duration-300')}>
      <div className={cn(styles.feature.iconContainer, colorVariant.iconBg, 'hover-scale transition-all duration-200 group-hover:scale-110')}>
        <span className={cn(styles.feature.icon, 'transition-transform duration-200 group-hover:rotate-12')}>{icon}</span>
      </div>
      <h4 className={cn(styles.feature.title, colorVariant.title, 'group-hover:scale-105 transition-transform duration-200')}>{title}</h4>
      <p className={cn(styles.feature.description, colorVariant.description, 'group-hover:text-foreground/80 transition-colors duration-200')}>
        {description}
      </p>
    </div>
  );
}

export function ToolGrid({ children, className }: ToolGridProps) {
  return (
    <div className={cn(styles.grid.tools, 'animate-fade-in-up', className)}>
      {children}
    </div>
  );
}

export function FeatureGrid({ children, className }: FeatureGridProps) {
  return (
    <div className={cn(styles.grid.features, 'animate-fade-in-up animate-delay-200', className)}>
      {children}
    </div>
  );
}

export function FilterGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(styles.grid.filters, 'animate-fade-in-up animate-delay-100')}>
      {children}
    </div>
  );
}