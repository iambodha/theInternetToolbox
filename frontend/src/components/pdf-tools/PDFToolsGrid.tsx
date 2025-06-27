'use client';

import { useState } from 'react';
import { FilterButton, BackButton } from '@/components/ui/Button';
import { ToolCard, ToolGrid, FilterGrid } from '@/components/ui/Card';
import { styles } from '@/lib/styles';
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
      <div className={styles.spacing.section}>
        <BackButton onClick={() => setSelectedTool(null)}>
          Back to PDF Tools
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