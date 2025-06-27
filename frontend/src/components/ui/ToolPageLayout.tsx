import React from 'react';
import { styles } from '@/lib/styles';

interface ToolPageLayoutProps {
  children: React.ReactNode;
}

interface ToolPageMainProps {
  children: React.ReactNode;
}

interface PageTitleProps {
  icon?: string;
  title: string;
  description: string;
  variant?: 'page' | 'tool';
}

export function ToolPageLayout({ children }: ToolPageLayoutProps) {
  return (
    <div className={styles.layout.page}>
      {children}
    </div>
  );
}

export function ToolPageMain({ children }: ToolPageMainProps) {
  return (
    <main className={styles.layout.main}>
      {children}
    </main>
  );
}

export function PageTitle({ icon, title, description, variant = 'page' }: PageTitleProps) {
  const titleStyles = variant === 'page' ? styles.pageTitle : styles.toolTitle;
  
  return (
    <div className={titleStyles.container}>
      {icon ? (
        <div className={titleStyles.titleWithIcon}>
          <span className={titleStyles.icon}>{icon}</span>
          <h1 className={titleStyles.title}>{title}</h1>
        </div>
      ) : (
        <h1 className={`${titleStyles.title} mb-4`}>{title}</h1>
      )}
      <p className={titleStyles.description}>{description}</p>
    </div>
  );
}