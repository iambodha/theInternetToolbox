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
      className={cn(styles.card.base, className)}
    >
      <div className={styles.card.content}>
        <div className={styles.card.header}>
          <span className={styles.card.icon}>{icon}</span>
          <h3 className={styles.card.title}>{title}</h3>
        </div>
        <p className={styles.card.description}>{description}</p>
        {category && (
          <div className={styles.card.footer}>
            <span className={styles.card.category}>{category}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function FeatureCard({ icon, title, description, variant = 'blue' }: FeatureCardProps) {
  const colorVariant = styles.colorVariants[variant];
  
  return (
    <div className={cn(styles.feature.container, colorVariant.container)}>
      <div className={cn(styles.feature.iconContainer, colorVariant.iconBg)}>
        <span className={styles.feature.icon}>{icon}</span>
      </div>
      <h4 className={cn(styles.feature.title, colorVariant.title)}>{title}</h4>
      <p className={cn(styles.feature.description, colorVariant.description)}>
        {description}
      </p>
    </div>
  );
}

export function ToolGrid({ children, className }: ToolGridProps) {
  return (
    <div className={cn(styles.grid.tools, className)}>
      {children}
    </div>
  );
}

export function FeatureGrid({ children, className }: FeatureGridProps) {
  return (
    <div className={cn(styles.grid.features, className)}>
      {children}
    </div>
  );
}

export function FilterGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.grid.filters}>
      {children}
    </div>
  );
}