'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Home() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Optimized load animation trigger
  useEffect(() => {
    // Use requestAnimationFrame for smoother initial load
    const timer = requestAnimationFrame(() => {
      setIsLoaded(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Close search with click outside
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsSearchOpen(false);
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, []);

  // All available tools with their routes
  const allTools = [
    // PDF Tools
    { name: 'PDF Merger', description: 'Combine multiple PDF files into one', category: 'PDF Tools', route: '/pdf-merger', icon: '🔗' },
    { name: 'PDF Splitter', description: 'Extract pages from PDF or split into multiple files', category: 'PDF Tools', route: '/pdf-splitter', icon: '✂️' },
    { name: 'PDF Compressor', description: 'Reduce PDF file size while maintaining quality', category: 'PDF Tools', route: '/pdf-compressor', icon: '🗜️' },
    { name: 'PDF Rotator', description: 'Rotate PDF pages to correct orientation', category: 'PDF Tools', route: '/pdf-rotator', icon: '🔄' },
    { name: 'Extract Pages', description: 'Extract specific pages from PDF', category: 'PDF Tools', route: '/pdf-extract-pages', icon: '📄' },
    { name: 'Delete Pages', description: 'Remove unwanted pages from PDF', category: 'PDF Tools', route: '/pdf-delete-pages', icon: '🗑️' },
    { name: 'Add Watermark', description: 'Add text or image watermarks to PDF', category: 'PDF Tools', route: '/pdf-watermark', icon: '💧' },
    { name: 'PDF OCR', description: 'Extract text from scanned documents using OCR', category: 'PDF Tools', route: '/pdf-ocr', icon: '🔍' },
    
    // Text Tools
    { name: 'Text Formatter', description: 'Format and style text content', category: 'Text Tools', route: '/text-formatter', icon: '📝' },
    { name: 'Text Counter', description: 'Count words, characters, and lines', category: 'Text Tools', route: '/text-counter', icon: '🔢' },
    { name: 'Text Converter', description: 'Convert text between different formats', category: 'Text Tools', route: '/text-converter', icon: '🔄' },
    { name: 'Text Generator', description: 'Generate placeholder and sample text', category: 'Text Tools', route: '/text-generator', icon: '✨' },
    { name: 'Text Analyzer', description: 'Analyze text structure and readability', category: 'Text Tools', route: '/text-analyzer', icon: '📊' },
    { name: 'Text Cleaner', description: 'Clean and normalize text content', category: 'Text Tools', route: '/text-cleaner', icon: '🧹' },
    { name: 'Text Comparator', description: 'Compare differences between texts', category: 'Text Tools', route: '/text-comparator', icon: '🔍' },
    { name: 'Text Encoder', description: 'Encode and decode text in various formats', category: 'Text Tools', route: '/text-encoder', icon: '🔐' },
    { name: 'Text Extractor', description: 'Extract text from various file formats', category: 'Text Tools', route: '/text-extractor', icon: '📤' },
    { name: 'Text Sorter', description: 'Sort and organize text content', category: 'Text Tools', route: '/text-sorter', icon: '📋' },
    
    // Image Tools
    { name: 'Image Converter', description: 'Convert between different image formats', category: 'Image Tools', route: '/image-converter', icon: '🔄' },
    { name: 'Image Resizer', description: 'Resize images by exact dimensions or percentage', category: 'Image Tools', route: '/image-resizer', icon: '📏' },
    { name: 'Image Optimizer', description: 'Reduce image file sizes while maintaining quality', category: 'Image Tools', route: '/image-optimizer', icon: '⚡' },
    { name: 'Background Remover', description: 'Remove backgrounds from images to create transparent PNGs', category: 'Image Tools', route: '/background-remover', icon: '✂️' },
    
    // Video Tools
    { name: 'Video Speed Controller', description: 'Change video playback speed - create slow motion or time-lapse effects', category: 'Video Tools', route: '/video-tools', icon: '⏱️' },
    { name: 'Video Frame Extractor', description: 'Extract individual frames or thumbnails from videos as images', category: 'Video Tools', route: '/video-tools', icon: '🖼️' },
    { name: 'Video Trimmer', description: 'Cut and trim video segments to exact timestamps', category: 'Video Tools', route: '/video-tools', icon: '✂️' },
    { name: 'Video Rotator', description: 'Rotate videos by 90°, 180°, or 270° to correct orientation', category: 'Video Tools', route: '/video-tools', icon: '🔄' },
    { name: 'Video Watermark', description: 'Add text or image watermarks to protect your videos', category: 'Video Tools', route: '/video-tools', icon: '💧' },
    { name: 'Video Compressor', description: 'Reduce video file sizes while maintaining quality', category: 'Video Tools', route: '/video-tools', icon: '🗜️' },
    
    // File Conversion Tools
    { name: 'Document Converter', description: 'Convert documents between formats', category: 'File Conversion', route: '/document-converter', icon: '📄' },
    { name: 'Audio Converter', description: 'Convert audio files to different formats', category: 'File Conversion', route: '/audio-converter', icon: '🎵' },
    { name: 'Video Converter', description: 'Convert video files to different formats', category: 'File Conversion', route: '/video-converter', icon: '🎬' },
    
    // File Corruption Tools
    { name: 'File Corruptor', description: 'Create corrupted files with custom sizes', category: 'File Corruption', route: '/file-corruptor', icon: '🔧' },
  ];

  // Filter tools based on search query
  const filteredTools = searchQuery.trim() === '' 
    ? allTools 
    : allTools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSearchOpen) {
        // Open search with CMD+K or Ctrl+K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          setIsSearchOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredTools.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredTools.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredTools[selectedIndex]) {
            router.push(filteredTools[selectedIndex].route);
          }
          break;
        case 'Escape':
          setIsSearchOpen(false);
          setSearchQuery('');
          setSelectedIndex(0);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, filteredTools, selectedIndex, router]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      // Slight delay to ensure modal is rendered
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const toolCategories = [
    {
      title: "PDF Tools",
      description: "Merge, split, compress, and convert PDF files",
      icon: "📄",
      tools: ["PDF Merger", "PDF Splitter", "PDF Compressor", "PDF Rotator"],
      href: "/pdf-tools",
    },
    {
      title: "Text Tools",
      description: "Format, analyze, convert, and process text content",
      icon: "📝",
      tools: ["Text Formatter", "Text Counter", "Text Converter", "Text Generator"],
      href: "/text-tools",
    },
    {
      title: "File Conversion",
      description: "Convert between different file formats",
      icon: "🔄",
      tools: [
        "Image Converter",
        "Document Converter",
        "Audio Converter",
        "Video Converter",
      ],
      href: "/file-conversion",
    },
    {
      title: "Image Tools",
      description: "Edit, optimize, resize, and transform images",
      icon: "🖼️",
      tools: [
        "Image Converter",
        "Image Resizer",
        "Image Optimizer",
        "Background Remover",
      ],
      href: "/image-tools",
    },
    {
      title: "Video Tools",
      description: "Edit, convert, and enhance videos",
      icon: "🎬",
      tools: [
        "Video Speed Controller",
        "Video Frame Extractor",
        "Video Trimmer",
        "Video Rotator",
        "Video Watermark",
        "Video Compressor",
      ],
      href: "/video-tools",
    },
    {
      title: "File Corruption",
      description: "Create corrupted files with custom sizes for assignments",
      icon: "🔧",
      tools: [
        "File Corruptor",
        "Custom Size Generator",
        "Assignment Helper",
        "File Faker",
      ],
      href: "/file-corruptor",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Search Overlay */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh] search-overlay-enter"
          onClick={handleOverlayClick}
        >
          <div className="bg-background border border-foreground/20 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[60vh] overflow-hidden search-modal-enter">
            {/* Search Input */}
            <div className="p-4 border-b border-foreground/10">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-foreground/40">🔍</span>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for tools... (try &quot;pdf splitter&quot; or &quot;text counter&quot;)"
                  className="block w-full pl-10 pr-3 py-3 bg-transparent border-0 text-foreground placeholder-foreground/50 focus:ring-0 focus:outline-none text-lg"
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {filteredTools.length > 0 ? (
                <div className="py-2">
                  {filteredTools.map((tool, index) => (
                    <button
                      key={`${tool.category}-${tool.name}`}
                      onClick={() => router.push(tool.route)}
                      className={`w-full text-left px-4 py-3 interactive group ${
                        index === selectedIndex ? 'bg-foreground/8' : 'hover:bg-foreground/4'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl hover-scale">{tool.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-foreground truncate">{tool.name}</h3>
                            <span className="text-xs text-foreground/50 bg-foreground/10 px-2 py-1 rounded-full">
                              {tool.category}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/70 truncate">{tool.description}</p>
                        </div>
                        <div className="text-foreground/30 group-hover:text-foreground/50 group-hover:translate-x-0.5">
                          <span className="text-sm">↗</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center animate-fade-in">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No tools found</h3>
                  <p className="text-foreground/60">Try searching for &quot;PDF&quot;, &quot;text&quot;, or &quot;convert&quot;</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-foreground/10 bg-foreground/[0.02]">
              <div className="flex items-center justify-between text-xs text-foreground/50">
                <div className="flex items-center space-x-4">
                  <span>↑↓ navigate</span>
                  <span>↵ select</span>
                  <span>esc close</span>
                </div>
                <span>{filteredTools.length} tools</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`border-b border-black/[.08] dark:border-white/[.145] ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center hover-scale">
                <span className="text-background font-bold text-sm">IT</span>
              </div>
              <h1 className="text-xl font-semibold font-[family-name:var(--font-geist-sans)]">
                The Internet Toolbox
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-6">
                <a
                  href="#tools"
                  className="text-sm hover:text-foreground/80 hover-scale"
                >
                  Tools
                </a>
                <a
                  href="#about"
                  className="text-sm hover:text-foreground/80 hover-scale"
                >
                  About
                </a>
              </div>
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className={`text-5xl sm:text-6xl font-bold font-[family-name:var(--font-geist-sans)] mb-6 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
            Your Essential
            <br />
            <span className="text-foreground/60">Internet Toolbox</span>
          </h2>
          <p className={`text-xl text-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed ${isLoaded ? 'animate-fade-in-up animate-delay-100' : 'opacity-0'}`}>
            A curated collection of powerful, free tools for your everyday internet
            needs. Convert files, edit documents, share content, and more—all in one
            place.
          </p>
          
          {/* Search Bar */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-8 ${isLoaded ? 'animate-fade-in-up animate-delay-200' : 'opacity-0'}`}>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="group relative bg-background border border-foreground/20 rounded-full px-6 py-3 text-left hover:border-foreground/30 w-full max-w-md mx-auto hover-lift hover-glow interactive"
            >
              <div className="flex items-center space-x-3">
                <span className="text-foreground/40 hover-scale">🔍</span>
                <span className="text-foreground/50 flex-1">Search for tools...</span>
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 border border-foreground/20 rounded text-xs text-foreground/50">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isLoaded ? 'animate-fade-in-up animate-delay-300' : 'opacity-0'}`}>
            <a
              href="#tools"
              className="rounded-full bg-foreground text-background px-8 py-3 font-medium hover:bg-foreground/90 btn-primary hover-lift"
            >
              Explore Tools
            </a>
            <a
              href="#about"
              className="rounded-full border border-foreground/20 px-8 py-3 font-medium hover:bg-foreground/5 hover-lift interactive"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section
        id="tools"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="text-center mb-16">
          <h3 className={`text-3xl font-bold font-[family-name:var(--font-geist-sans)] mb-4 ${isLoaded ? 'animate-fade-in-up animate-delay-400' : 'opacity-0'}`}>
            Powerful Tools at Your Fingertips
          </h3>
          <p className={`text-lg text-foreground/70 max-w-2xl mx-auto ${isLoaded ? 'animate-fade-in-up animate-delay-500' : 'opacity-0'}`}>
            Each tool is designed with simplicity and efficiency in mind. No accounts
            required, no complicated setups—just pure functionality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {toolCategories.map((category, index) => {
            // Use proper delay classes that exist in our CSS
            const delayClasses = ['animate-delay-100', 'animate-delay-200', 'animate-delay-300', 'animate-delay-400', 'animate-delay-500', 'animate-delay-600'];
            const delayClass = delayClasses[index] || 'animate-delay-600';
            
            if (category.href) {
              return (
                <Link
                  key={index}
                  href={category.href}
                  className={`group p-6 rounded-lg border border-black/[.08] dark:border-white/[.145] hover:border-black/[.15] dark:hover:border-white/[.25] cursor-pointer hover-lift hover-glow card ${isLoaded ? `animate-fade-in-up ${delayClass}` : 'opacity-0'}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl hover-scale">{category.icon}</span>
                    <h4 className="text-xl font-semibold font-[family-name:var(--font-geist-sans)]">
                      {category.title}
                    </h4>
                  </div>
                  <p className="text-foreground/70 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="space-y-2">
                    {category.tools.map((tool, toolIndex) => (
                      <div
                        key={toolIndex}
                        className="flex items-center space-x-2 text-sm text-foreground/60 group-hover:text-foreground/80"
                      >
                        <span className="w-1 h-1 bg-foreground/40 rounded-full group-hover:bg-foreground/60"></span>
                        <span>{tool}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <button className="w-full py-2 px-4 rounded-md bg-foreground text-background hover:bg-foreground/90 text-sm font-medium btn-primary">
                      Explore Tools
                    </button>
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={index}
                className={`group p-6 rounded-lg border border-black/[.08] dark:border-white/[.145] hover:border-black/[.15] dark:hover:border-white/[.25] hover-lift card ${isLoaded ? `animate-fade-in-up ${delayClass}` : 'opacity-0'}`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl hover-scale">{category.icon}</span>
                  <h4 className="text-xl font-semibold font-[family-name:var(--font-geist-sans)]">
                    {category.title}
                  </h4>
                </div>
                <p className="text-foreground/70 mb-4 leading-relaxed">
                  {category.description}
                </p>
                <div className="space-y-2">
                  {category.tools.map((tool, toolIndex) => (
                    <div
                      key={toolIndex}
                      className="flex items-center space-x-2 text-sm text-foreground/60 group-hover:text-foreground/80"
                    >
                      <span className="w-1 h-1 bg-foreground/40 rounded-full group-hover:bg-foreground/60"></span>
                      <span>{tool}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button className="w-full py-2 px-4 rounded-md bg-foreground/5 hover:bg-foreground/10 text-foreground/60 text-sm font-medium interactive">
                    Coming Soon
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-foreground/[.02] dark:bg-foreground/[.05]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h3 className="text-3xl font-bold font-[family-name:var(--font-geist-sans)] mb-6 animate-fade-in-up">
              Built for Everyone
            </h3>
            <p className="text-lg text-foreground/70 mb-8 leading-relaxed animate-fade-in-up animate-delay-100">
              The Internet Toolbox brings together the most useful web tools in one
              clean, accessible interface. Whether you&apos;re a student, professional, or
              just someone who needs to get things done online, we&apos;ve got you covered.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center animate-fade-in-up animate-delay-200 hover-lift">
                <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4 hover-scale">
                  <span className="text-xl">🚀</span>
                </div>
                <h4 className="font-semibold mb-2">Fast & Efficient</h4>
                <p className="text-sm text-foreground/60">
                  Optimized for speed with minimal loading times
                </p>
              </div>
              <div className="text-center animate-fade-in-up animate-delay-300 hover-lift">
                <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4 hover-scale">
                  <span className="text-xl">🔒</span>
                </div>
                <h4 className="font-semibold mb-2">Privacy First</h4>
                <p className="text-sm text-foreground/60">
                  Your files are processed locally when possible
                </p>
              </div>
              <div className="text-center animate-fade-in-up animate-delay-400 hover-lift">
                <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4 hover-scale">
                  <span className="text-xl">💯</span>
                </div>
                <h4 className="font-semibold mb-2">Always Free</h4>
                <p className="text-sm text-foreground/60">
                  No subscriptions, no hidden fees, just tools
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[.08] dark:border-white/[.145] animate-fade-in">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0 animate-slide-in-left">
              <div className="w-6 h-6 bg-foreground rounded-sm flex items-center justify-center hover-scale">
                <span className="text-background font-bold text-xs">IT</span>
              </div>
              <span className="font-semibold font-[family-name:var(--font-geist-sans)]">
                The Internet Toolbox
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-foreground/60 animate-fade-in animate-delay-200">
              <a
                href="#"
                className="hover:text-foreground hover-scale interactive"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-foreground hover-scale interactive"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="hover:text-foreground hover-scale interactive"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-black/[.08] dark:border-white/[.145] text-center text-sm text-foreground/60 animate-fade-in animate-delay-300">
            <p>
              © 2025 The Internet Toolbox. Built with ❤️ for the internet community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
