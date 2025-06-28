"use client";

import React, { useEffect, useState } from 'react';
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`${styles.layout.page} ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
      {children}
    </div>
  );
}

export function ToolPageMain({ children }: ToolPageMainProps) {
  return (
    <main className={`${styles.layout.main} animate-fade-in-up animate-delay-200`}>
      {children}
    </main>
  );
}

export function PageTitle({ icon, title, description, variant = 'page' }: PageTitleProps) {
  const titleStyles = variant === 'page' ? styles.pageTitle : styles.toolTitle;
  
  return (
    <div className={`${titleStyles.container} animate-fade-in-up animate-delay-100`}>
      {icon ? (
        <div className={titleStyles.titleWithIcon}>
          <span className={`${titleStyles.icon} hover-scale transition-transform duration-200`}>{icon}</span>
          <h1 className={titleStyles.title}>{title}</h1>
        </div>
      ) : (
        <h1 className={`${titleStyles.title} mb-4`}>{title}</h1>
      )}
      <p className={`${titleStyles.description} animate-fade-in-up animate-delay-300`}>{description}</p>
    </div>
  );
}