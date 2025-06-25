import Link from 'next/link';

export default function TextToolsHeader() {
  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center">
                <span className="text-background font-bold text-sm">IT</span>
              </div>
              <span className="text-xl font-semibold font-[family-name:var(--font-geist-sans)]">
                The Internet Toolbox
              </span>
            </Link>
            <span className="text-foreground/40">/</span>
            <span className="text-lg font-medium text-foreground/80">Text Tools</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-sm hover:text-foreground/80 transition-colors">
              Home
            </Link>
            <Link href="#tools" className="text-sm hover:text-foreground/80 transition-colors">
              All Tools
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}