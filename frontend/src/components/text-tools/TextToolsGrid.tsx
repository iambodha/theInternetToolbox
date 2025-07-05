'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilterButton } from '@/components/ui/Button';
import { ToolCard, ToolGrid, FilterGrid } from '@/components/ui/Card';
import { styles } from '@/lib/styles';

interface TextTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'format' | 'analyze' | 'convert' | 'generate' | 'utility';
  route: string;
}

const textTools: TextTool[] = [
  // Format Tools
  { id: 'formatter', title: 'Text Formatter', description: 'Format text with various case styles and line operations', icon: '📝', category: 'format', route: '/text-tools/formatter' },
  { id: 'cleaner', title: 'Text Cleaner', description: 'Remove extra spaces, line breaks, and unwanted characters', icon: '🧹', category: 'format', route: '/text-tools/cleaner' },
  { id: 'sorter', title: 'Text Sorter', description: 'Sort lines alphabetically, numerically, or by length', icon: '📊', category: 'format', route: '/text-tools/sorter' },
  
  // Analyze Tools
  { id: 'counter', title: 'Text Counter', description: 'Count characters, words, lines, and paragraphs', icon: '🔢', category: 'analyze', route: '/text-tools/counter' },
  { id: 'analyzer', title: 'Text Analyzer', description: 'Analyze text readability, complexity, and statistics', icon: '📈', category: 'analyze', route: '/text-tools/analyzer' },
  { id: 'comparator', title: 'Text Comparator', description: 'Compare two texts and highlight differences', icon: '⚖️', category: 'analyze', route: '/text-tools/comparator' },
  
  // Convert Tools
  { id: 'converter', title: 'Text Converter', description: 'Convert between different text formats and encodings', icon: '🔄', category: 'convert', route: '/text-tools/converter' },
  { id: 'encoder', title: 'Text Encoder', description: 'Encode/decode text with Base64, URL, HTML, and more', icon: '🔐', category: 'convert', route: '/text-tools/encoder' },
  
  // Generate Tools
  { id: 'generator', title: 'Text Generator', description: 'Generate lorem ipsum, passwords, and random text', icon: '✨', category: 'generate', route: '/text-tools/generator' },
  
  // Utility Tools
  { id: 'extractor', title: 'Text Extractor', description: 'Extract emails, URLs, numbers, and patterns from text', icon: '🔍', category: 'utility', route: '/text-tools/extractor' },
];

const categories = [
  { id: 'all', name: 'All Tools', count: textTools.length },
  { id: 'format', name: 'Format', count: textTools.filter(t => t.category === 'format').length },
  { id: 'analyze', name: 'Analyze', count: textTools.filter(t => t.category === 'analyze').length },
  { id: 'convert', name: 'Convert', count: textTools.filter(t => t.category === 'convert').length },
  { id: 'generate', name: 'Generate', count: textTools.filter(t => t.category === 'generate').length },
  { id: 'utility', name: 'Utility', count: textTools.filter(t => t.category === 'utility').length },
];

export default function TextToolsGrid() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = selectedCategory === 'all' 
    ? textTools 
    : textTools.filter(tool => tool.category === selectedCategory);

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
