'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilterButton } from '@/components/ui/Button';
import { ToolCard, ToolGrid, FilterGrid } from '@/components/ui/Card';
import { styles } from '@/lib/styles';

interface ImageTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'convert' | 'edit' | 'optimize' | 'analyze';
  route: string;
}

const imageTools: ImageTool[] = [
  // Convert Tools
  { id: 'converter', title: 'Image Converter', description: 'Convert between different image formats like JPG, PNG, WebP, and more', icon: '🔄', category: 'convert', route: '/image-tools/converter' },
  
  // Edit Tools
  { id: 'resizer', title: 'Image Resizer', description: 'Resize images by exact dimensions or percentage while maintaining quality', icon: '📏', category: 'edit', route: '/image-tools/resizer' },
  { id: 'background-remover', title: 'Background Remover', description: 'Remove backgrounds from images to create transparent PNGs', icon: '✂️', category: 'edit', route: '/image-tools/background-remover' },
  { id: 'pixelify', title: 'Image Pixelify', description: 'Transform images into retro pixel art with customizable effects', icon: '🎮', category: 'edit', route: '/image-tools/pixelify' },
  
  // Optimize Tools
  { id: 'optimizer', title: 'Image Optimizer', description: 'Reduce image file sizes while maintaining visual quality', icon: '⚡', category: 'optimize', route: '/image-tools/optimizer' },

  // Analyze Tools
  { id: 'color-palette', title: 'Color Palette Extractor', description: 'Extract dominant colors and create color palettes from images', icon: '🎨', category: 'analyze', route: '/image-tools/color-palette' },
];

const categories = [
  { id: 'all', name: 'All Tools', count: imageTools.length },
  { id: 'convert', name: 'Convert', count: imageTools.filter(t => t.category === 'convert').length },
  { id: 'edit', name: 'Edit & Transform', count: imageTools.filter(t => t.category === 'edit').length },
  { id: 'optimize', name: 'Optimize', count: imageTools.filter(t => t.category === 'optimize').length },
  { id: 'analyze', name: 'Analyze', count: imageTools.filter(t => t.category === 'analyze').length },
];

export default function ImageToolsGrid() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = selectedCategory === 'all' 
    ? imageTools 
    : imageTools.filter(tool => tool.category === selectedCategory);

  const handleToolClick = (route: string) => {
    router.push(route);
  };

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
            onClick={() => handleToolClick(tool.route)}
          />
        ))}
      </ToolGrid>
    </div>
  );
}
