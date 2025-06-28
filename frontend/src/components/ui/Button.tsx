import React from 'react';
import Link from 'next/link';
import { styles, cn } from '@/lib/styles';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

interface LinkButtonProps {
  href: string;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  className?: string;
}

interface FilterButtonProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

interface BackButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const variantClass = variant === 'primary' ? styles.button.primary : styles.button.secondary;
  
  return (
    <button 
      className={cn(variantClass, 'btn-primary hover-lift', className)} 
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({ href, variant = 'primary', className, children }: LinkButtonProps) {
  const variantClass = variant === 'primary' ? styles.button.primary : styles.button.secondary;
  
  return (
    <Link href={href} className={cn(variantClass, 'btn-primary hover-lift', className)}>
      {children}
    </Link>
  );
}

export function FilterButton({ active = false, onClick, children }: FilterButtonProps) {
  const activeClass = active ? styles.button.filterActive : styles.button.filterInactive;
  
  return (
    <button
      onClick={onClick}
      className={cn(styles.button.filter, activeClass, 'hover-scale')}
    >
      {children}
    </button>
  );
}

export function BackButton({ onClick, children }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(styles.button.back, 'hover-lift group')}
    >
      <span className="group-hover:-translate-x-0.5">←</span>
      <span>{children}</span>
    </button>
  );
}