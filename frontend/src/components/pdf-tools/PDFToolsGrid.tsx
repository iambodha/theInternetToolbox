'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilterButton } from '@/components/ui/Button';
import { ToolCard, ToolGrid, FilterGrid } from '@/components/ui/Card';
import { styles } from '@/lib/styles';

interface PDFTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'edit' | 'organize';
  route: string;
}

const pdfTools: PDFTool[] = [
  // Edit & Organize Tools
  { id: 'merge', title: 'Merge PDF', description: 'Combine multiple PDF files into one', icon: '🔗', category: 'organize', route: '/pdf-tools/merge' },
  { id: 'split', title: 'Split PDF', description: 'Extract pages from PDF or split into multiple files', icon: '✂️', category: 'organize', route: '/pdf-tools/split' },
  { id: 'compress', title: 'Compress PDF', description: 'Reduce PDF file size while maintaining quality', icon: '🗜️', category: 'edit', route: '/pdf-tools/compress' },
  { id: 'rotate', title: 'Rotate PDF', description: 'Rotate PDF pages to correct orientation', icon: '🔄', category: 'edit', route: '/pdf-tools/rotate' },
  { id: 'extract', title: 'Extract Pages', description: 'Extract specific pages from PDF', icon: '📄', category: 'organize', route: '/pdf-tools/extract' },
  { id: 'delete', title: 'Delete Pages', description: 'Remove unwanted pages from PDF', icon: '🗑️', category: 'organize', route: '/pdf-tools/delete' },
  { id: 'watermark', title: 'Add Watermark', description: 'Add text or image watermarks to PDF', icon: '💧', category: 'edit', route: '/pdf-tools/watermark' },
  { id: 'ocr', title: 'PDF OCR', description: 'Extract text from scanned documents using OCR', icon: '🔍', category: 'edit', route: '/pdf-tools/ocr' },
];

const categories = [
  { id: 'all', name: 'All Tools', count: pdfTools.length },
  { id: 'edit', name: 'Edit & Enhance', count: pdfTools.filter(t => t.category === 'edit').length },
  { id: 'organize', name: 'Organize', count: pdfTools.filter(t => t.category === 'organize').length },
];

export default function PDFToolsGrid() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = selectedCategory === 'all' 
    ? pdfTools 
    : pdfTools.filter(tool => tool.category === selectedCategory);

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