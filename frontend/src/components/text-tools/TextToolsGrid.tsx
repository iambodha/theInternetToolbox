'use client';

import { useState } from 'react';
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedTool(null)}
            className="flex items-center space-x-2 text-foreground/60 hover:text-foreground transition-colors"
          >
            <span>←</span>
            <span>Back to Text Tools</span>
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
