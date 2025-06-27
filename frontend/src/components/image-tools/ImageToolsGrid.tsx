'use client';

import { useState } from 'react';
import { FilterButton, BackButton } from '@/components/ui/Button';
import { ToolCard, ToolGrid, FilterGrid } from '@/components/ui/Card';
import { styles } from '@/lib/styles';
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
      <div className={styles.spacing.section}>
        <BackButton onClick={() => setSelectedTool(null)}>
          Back to Image Tools
        </BackButton>
        <div className="bg-foreground/[.02] dark:bg-foreground/[.05] rounded-lg p-6">
          <div className="mb-6">
            <h2 className={`${styles.text['2xl']} font-bold ${styles.text.heading} mb-2`}>
              {selectedToolData.icon} {selectedToolData.title}
            </h2>
            <p className={styles.text.muted}>{selectedToolData.description}</p>
          </div>
          <ToolComponent />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.spacing.section}>
      {/* Category Filter */}
      <FilterGrid>
        {categories.map((category) => (
          <FilterButton
            key={category.id}
            active={selectedCategory === category.id}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name} ({category.count})
          </FilterButton>
        ))}
      </FilterGrid>

      {/* Tools Grid */}
      <ToolGrid>
        {filteredTools.map((tool) => (
          <ToolCard
            key={tool.id}
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            category={categories.find(c => c.id === tool.category)?.name}
            onClick={() => setSelectedTool(tool.id)}
          />
        ))}
      </ToolGrid>
    </div>
  );
}
