'use client';

import { useState } from 'react';
import { FilterButton, BackButton } from '@/components/ui/Button';
import { ToolCard, ToolGrid, FilterGrid } from '@/components/ui/Card';
import { styles } from '@/lib/styles';
import TextFormatter from './tools/TextFormatter';
import TextCounter from './tools/TextCounter';
import TextConverter from './tools/TextConverter';
import TextGenerator from './tools/TextGenerator';
import TextExtractor from './tools/TextExtractor';
import TextComparator from './tools/TextComparator';
import TextCleaner from './tools/TextCleaner';
import TextSorter from './tools/TextSorter';
import TextEncoder from './tools/TextEncoder';
import TextAnalyzer from './tools/TextAnalyzer';

interface TextTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'format' | 'analyze' | 'convert' | 'generate' | 'utility';
  component: React.ComponentType;
}

const textTools: TextTool[] = [
  // Format Tools
  { id: 'formatter', title: 'Text Formatter', description: 'Format text with various case styles and line operations', icon: '📝', category: 'format', component: TextFormatter },
  { id: 'cleaner', title: 'Text Cleaner', description: 'Remove extra spaces, line breaks, and unwanted characters', icon: '🧹', category: 'format', component: TextCleaner },
  { id: 'sorter', title: 'Text Sorter', description: 'Sort lines alphabetically, numerically, or by length', icon: '📊', category: 'format', component: TextSorter },
  
  // Analyze Tools
  { id: 'counter', title: 'Text Counter', description: 'Count characters, words, lines, and paragraphs', icon: '🔢', category: 'analyze', component: TextCounter },
  { id: 'analyzer', title: 'Text Analyzer', description: 'Analyze text readability, complexity, and statistics', icon: '📈', category: 'analyze', component: TextAnalyzer },
  { id: 'comparator', title: 'Text Comparator', description: 'Compare two texts and highlight differences', icon: '⚖️', category: 'analyze', component: TextComparator },
  
  // Convert Tools
  { id: 'converter', title: 'Text Converter', description: 'Convert between different text formats and encodings', icon: '🔄', category: 'convert', component: TextConverter },
  { id: 'encoder', title: 'Text Encoder', description: 'Encode/decode text with Base64, URL, HTML, and more', icon: '🔐', category: 'convert', component: TextEncoder },
  
  // Generate Tools
  { id: 'generator', title: 'Text Generator', description: 'Generate lorem ipsum, passwords, and random text', icon: '✨', category: 'generate', component: TextGenerator },
  
  // Utility Tools
  { id: 'extractor', title: 'Text Extractor', description: 'Extract emails, URLs, numbers, and patterns from text', icon: '🔍', category: 'utility', component: TextExtractor },
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const filteredTools = selectedCategory === 'all' 
    ? textTools 
    : textTools.filter(tool => tool.category === selectedCategory);

  const selectedToolData = textTools.find(tool => tool.id === selectedTool);

  if (selectedTool && selectedToolData) {
    const ToolComponent = selectedToolData.component;
    return (
      <div className={styles.spacing.section}>
        <BackButton onClick={() => setSelectedTool(null)}>
          Back to Text Tools
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
