'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function VideoToolsHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'All Tools', href: '/' },
    { name: 'PDF Tools', href: '/pdf-tools' },
    { name: 'Text Tools', href: '/text-tools' },
    { name: 'Image Tools', href: '/image-tools' },
    { name: 'File Conversion', href: '/file-conversion' },
    { name: 'Video Tools', href: '/video-tools', active: true },
  ];

  return (
    <header className="bg-background border-b border-black/[.08] dark:border-white/[.145]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center">
              <span className="text-background font-bold text-sm">IT</span>
            </div>
            <span className="text-xl font-semibold font-[family-name:var(--font-geist-sans)]">
              The Internet Toolbox
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm transition-colors ${
                  item.active
                    ? 'text-foreground font-medium'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-foreground/60 hover:text-foreground hover:bg-foreground/5"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-black/[.08] dark:border-white/[.145]">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-sm transition-colors ${
                    item.active
                      ? 'text-foreground font-medium bg-foreground/5'
                      : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}