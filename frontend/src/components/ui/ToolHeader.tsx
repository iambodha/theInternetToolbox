import React from 'react';
import Link from 'next/link';
import { styles } from '@/lib/styles';
import ThemeToggle from './ThemeToggle';

interface ToolHeaderProps {
  categoryName: string;
  categoryPath?: string;
}

export default function ToolHeader({ categoryName, categoryPath = "/" }: ToolHeaderProps) {
  return (
    <header className={styles.header.border}>
      <div className={styles.header.container}>
        <div className={styles.header.flex}>
          <div className={styles.header.logoContainer}>
            <Link href="/" className={styles.header.logo}>
              <div className={styles.header.logoIcon}>
                <span className={styles.header.logoText}>IT</span>
              </div>
              <span className={styles.header.title}>
                The Internet Toolbox
              </span>
            </Link>
            <span className={styles.header.breadcrumb}>/</span>
            <Link 
              href={categoryPath} 
              className={styles.header.subtitle}
            >
              {categoryName}
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            <div className={styles.header.nav}>
              <Link href="/" className={styles.header.navLink}>
                Home
              </Link>
              <Link href="/#tools" className={styles.header.navLink}>
                All Tools
              </Link>
            </div>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}