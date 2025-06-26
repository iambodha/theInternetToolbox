'use client';

import { useState } from 'react';
import ImageConverter from './tools/ImageConverter';
import ImageResizer from './tools/ImageResizer';
import ImageOptimizer from './tools/ImageOptimizer';
import BackgroundRemover from './tools/BackgroundRemover';

interface ImageTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'convert' | 'edit' | 'optimize';
  component: React.ComponentType;
}

const imageTools: ImageTool[] = [
  // Convert Tools
  { id: 'converter', title: 'Image Converter', description: 'Convert between different image formats like JPG, PNG, WebP, and more', icon: '🔄', category: 'convert', component: ImageConverter },
  
  // Edit Tools
  { id: 'resizer', title: 'Image Resizer', description: 'Resize images by exact dimensions or percentage while maintaining quality', icon: '📏', category: 'edit', component: ImageResizer },
  { id: 'background-remover', title: 'Background Remover', description: 'Remove backgrounds from images to create transparent PNGs', icon: '✂️', category: 'edit', component: BackgroundRemover },
  
  // Optimize Tools
  { id: 'optimizer', title: 'Image Optimizer', description: 'Reduce image file sizes while maintaining visual quality', icon: '⚡', category: 'optimize', component: ImageOptimizer },
];

const categories = [
  { id: 'all', name: 'All Tools', count: imageTools.length },
  { id: 'convert', name: 'Convert', count: imageTools.filter(t => t.category === 'convert').length },
  { id: 'edit', name: 'Edit & Transform', count: imageTools.filter(t => t.category === 'edit').length },
  { id: 'optimize', name: 'Optimize', count: imageTools.filter(t => t.category === 'optimize').length },
];

export default function ImageToolsGrid() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const filteredTools = selectedCategory === 'all' 
    ? imageTools 
    : imageTools.filter(tool => tool.category === selectedCategory);

  const selectedToolData = imageTools.find(tool => tool.id === selectedTool);

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
            <span>Back to Image Tools</span>
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
