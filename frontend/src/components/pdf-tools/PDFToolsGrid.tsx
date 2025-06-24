'use client';

import { useState } from 'react';
import PDFMerger from './tools/PDFMerger';
import PDFSplitter from './tools/PDFSplitter';
import PDFCompressor from './tools/PDFCompressor';
  import PDFRotator from './tools/PDFRotator';
import PDFWatermark from './tools/PDFWatermark';
import PDFPageExtractor from './tools/PDFPageExtractor';
import PDFPageDeleter from './tools/PDFPageDeleter';

interface PDFTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'edit' | 'organize';
  component: React.ComponentType;
}

const pdfTools: PDFTool[] = [
  // Edit & Organize Tools
  { id: 'merge', title: 'Merge PDF', description: 'Combine multiple PDF files into one', icon: '🔗', category: 'organize', component: PDFMerger },
  { id: 'split', title: 'Split PDF', description: 'Extract pages from PDF or split into multiple files', icon: '✂️', category: 'organize', component: PDFSplitter },
  { id: 'compress', title: 'Compress PDF', description: 'Reduce PDF file size while maintaining quality', icon: '🗜️', category: 'edit', component: PDFCompressor },
  { id: 'rotate', title: 'Rotate PDF', description: 'Rotate PDF pages to correct orientation', icon: '🔄', category: 'edit', component: PDFRotator },
  { id: 'extract', title: 'Extract Pages', description: 'Extract specific pages from PDF', icon: '📄', category: 'organize', component: PDFPageExtractor },
  { id: 'delete', title: 'Delete Pages', description: 'Remove unwanted pages from PDF', icon: '🗑️', category: 'organize', component: PDFPageDeleter },
  { id: 'watermark', title: 'Add Watermark', description: 'Add text or image watermarks to PDF', icon: '💧', category: 'edit', component: PDFWatermark },
];

const categories = [
  { id: 'all', name: 'All Tools', count: pdfTools.length },
  { id: 'edit', name: 'Edit & Enhance', count: pdfTools.filter(t => t.category === 'edit').length },
  { id: 'organize', name: 'Organize', count: pdfTools.filter(t => t.category === 'organize').length },
];

export default function PDFToolsGrid() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const filteredTools = selectedCategory === 'all' 
    ? pdfTools 
    : pdfTools.filter(tool => tool.category === selectedCategory);

  const selectedToolData = pdfTools.find(tool => tool.id === selectedTool);

  if (selectedTool && selectedToolData) {
    const ToolComponent = selectedToolData.component;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedTool(null)}
            className="flex items-center space-x-2 text-foreground/60 hover:text-foreground transition-colors"
          >
            <span>←</span>
            <span>Back to PDF Tools</span>
          </button>
        </div>
        <div className="bg-foreground/[.02] dark:bg-foreground/[.05] rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-geist-sans)] mb-2">
              {selectedToolData.icon} {selectedToolData.title}
            </h2>
            <p className="text-foreground/70">{selectedToolData.description}</p>
          </div>
          <ToolComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-foreground text-background'
                : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className="group p-6 rounded-lg border border-black/[.08] dark:border-white/[.145] hover:border-black/[.15] dark:hover:border-white/[.25] transition-all duration-200 hover:shadow-lg cursor-pointer"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">{tool.icon}</span>
                <h3 className="text-lg font-semibold font-[family-name:var(--font-geist-sans)] group-hover:text-foreground/80 transition-colors">
                  {tool.title}
                </h3>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed flex-grow">
                {tool.description}
              </p>
              <div className="mt-4 pt-4 border-t border-black/[.05] dark:border-white/[.1]">
                <span className="text-xs text-foreground/50 uppercase tracking-wide">
                  {categories.find(c => c.id === tool.category)?.name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}