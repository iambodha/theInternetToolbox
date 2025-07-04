'use client';

import { useState } from 'react';
import { styles } from '@/lib/styles';
import ReactionTime from './tools/ReactionTime';
import NumberMemory from './tools/NumberMemory';
import TypingSpeed from './tools/TypingSpeed';
import SequenceMemory from './tools/VisualAcuity';
import VisualAcuity from './tools/VisualAcuity';
import VerbalMemory from './tools/VerbalMemory';
import AimTrainer from './tools/AimTrainer';
import SpellBee from './tools/SpellBee';

interface BenchmarkTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'reaction' | 'memory' | 'typing' | 'visual' | 'language';
  component: React.ComponentType;
}

const benchmarkTools: BenchmarkTool[] = [
  // Reaction Tests
  { id: 'reaction-time', title: 'Reaction Time', description: 'Test how quickly you can react to visual stimuli', icon: '⚡', category: 'reaction', component: ReactionTime },
  { id: 'aim-trainer', title: 'Aim Trainer', description: 'Test your mouse precision and targeting speed', icon: '🎯', category: 'reaction', component: AimTrainer },
  
  // Memory Tests
  { id: 'number-memory', title: 'Number Memory', description: 'How many digits can you remember in sequence?', icon: '🧠', category: 'memory', component: NumberMemory },
  { id: 'sequence-memory', title: 'Sequence Memory', description: 'Remember and repeat visual sequences that get longer', icon: '🔢', category: 'memory', component: SequenceMemory },
  { id: 'verbal-memory', title: 'Verbal Memory', description: 'Remember words and identify if you\'ve seen them before', icon: '📝', category: 'memory', component: VerbalMemory },
  
  // Typing Tests
  { id: 'typing-speed', title: 'Typing Speed', description: 'Test your typing speed and accuracy with real text', icon: '⌨️', category: 'typing', component: TypingSpeed },
  
  // Visual Tests
  { id: 'visual-acuity', title: 'Visual Acuity', description: 'Test how well you can see small details and symbols', icon: '👁️', category: 'visual', component: VisualAcuity },
  
  // Language Tests
  { id: 'spell-bee', title: 'Spell Bee', description: 'Listen to words and spell them correctly using text-to-speech', icon: '🐝', category: 'language', component: SpellBee },
];

const categories = [
  { id: 'all', name: 'All Tests', count: benchmarkTools.length },
  { id: 'reaction', name: 'Reaction', count: benchmarkTools.filter(t => t.category === 'reaction').length },
  { id: 'memory', name: 'Memory', count: benchmarkTools.filter(t => t.category === 'memory').length },
  { id: 'typing', name: 'Typing', count: benchmarkTools.filter(t => t.category === 'typing').length },
  { id: 'visual', name: 'Visual', count: benchmarkTools.filter(t => t.category === 'visual').length },
  { id: 'language', name: 'Language', count: benchmarkTools.filter(t => t.category === 'language').length },
];

export default function HumanBenchmarksGrid() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const filteredTools = selectedCategory === 'all' 
    ? benchmarkTools 
    : benchmarkTools.filter(tool => tool.category === selectedCategory);

  const selectedToolComponent = benchmarkTools.find(tool => tool.id === selectedTool);

  if (selectedTool && selectedToolComponent) {
    const ToolComponent = selectedToolComponent.component;
    return (
      <div className={styles.layout.container}>
        {/* Back button */}
        <button
          onClick={() => setSelectedTool(null)}
          className={styles.button.back}
        >
          <span>←</span>
          <span>Back to Human Benchmarks</span>
        </button>

        {/* Tool header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">{selectedToolComponent.icon}</span>
            <h2 className={styles.toolTitle.title}>
              {selectedToolComponent.title}
            </h2>
          </div>
          <p className={styles.toolTitle.description}>
            {selectedToolComponent.description}
          </p>
        </div>

        {/* Tool component */}
        <ToolComponent />
      </div>
    );
  }

  return (
    <div className={styles.layout.container}>
      {/* Category filters */}
      <div className={styles.grid.filters}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`${styles.button.filter} ${
              selectedCategory === category.id
                ? styles.button.filterActive
                : styles.button.filterInactive
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Tools grid */}
      <div className={styles.grid.tools}>
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className={styles.card.base}
          >
            <div className={styles.card.content}>
              <div className={styles.card.header}>
                <div className={styles.card.icon}>{tool.icon}</div>
                <div>
                  <h3 className={styles.card.title}>{tool.title}</h3>
                </div>
              </div>
              <p className={styles.card.description}>{tool.description}</p>
              <div className={styles.card.footer}>
                <span className={styles.card.category}>{tool.category}</span>
                <span className={styles.card.arrow}>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}